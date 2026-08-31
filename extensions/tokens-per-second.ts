/**
 * Tokens Per Second (TPS) Extension
 *
 * Displays real-time token generation speed during assistant streaming
 * and final stats when a message completes. Thinking/reasoning content
 * is included in the token count alongside output text.
 *
 * Implementation notes (pi 0.84.x):
 * - Prefers delta-based counting via `assistantMessageEvent` (text_delta /
 *   thinking_delta / toolcall_delta) to avoid quadratic `message` snapshots.
 *   Falls back to cumulative `event.message` for backwards compat.
 * - Uses a 1s sliding window for live TPS (averaged fallback while the window
 *   fills, matching pi-token-speed), so the status reflects current streaming
 *   speed rather than lifetime average.
 * - Excludes time-to-first-token (TTFT) idle from TPS by aligning the
 *   streaming window start with the first token arrival.
 * - At `message_end` prefers provider-reported `usage.output` when available
 *   (authoritative), falling back to the streamed estimate and finally to a
 *   full-message estimate. This mirrors community extensions such as
 *   pi-token-speed and tok-rate-footer.
 * - Only counts `edit`/`write` toolcall deltas (token generation) and skips
 *   other toolcall prompt processing, matching pi-token-speed's convention.
 *
 * Usage:
 *   /tps              Toggle display on/off
 *   /tps on           Enable TPS display
 *   /tps off          Disable TPS display
 *   /tps last         Show stats from the last completed message
 */

import type { AssistantMessage, ContentBlock } from "@earendil-works/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

// ---- helpers ----

function estimateTokens(text: string): number {
	return Math.max(0, Math.ceil(text.length / 4));
}

function formatTps(tps: number): string {
	if (tps >= 1000) return `${(tps / 1000).toFixed(1)}k`;
	if (tps >= 100) return `${Math.round(tps)}`;
	if (tps >= 10) return `${tps.toFixed(1)}`;
	return `${tps.toFixed(2)}`;
}

function getAllText(message: AssistantMessage): string {
	return message.content
		.map((c: ContentBlock) => {
			if (c.type === "text") return c.text;
			if ((c as any).type === "thinking" && typeof (c as any).thinking === "string")
				return (c as any).thinking;
			if ((c as any).type === "reasoning" && typeof (c as any).reasoning === "string")
				return (c as any).reasoning;
			return "";
		})
		.join("");
}

// Minimal sliding window (time-based) for live TPS.
// Matches pi-token-speed's approach: sum tokens in the last windowMs,
// use actual span of events in the window for precision, compact periodically.
class SlidingWindow {
	private events: { time: number; tokens: number }[] = [];
	private windowStartIndex = 0;

	constructor(private readonly windowMs: number) {}

	record(tokens: number): void {
		this.events.push({ time: Date.now(), tokens });
		// Compact periodically to avoid unbounded growth (pi-token-speed uses 5000)
		if (this.windowStartIndex >= 5000) {
			this.events.splice(0, this.windowStartIndex);
			this.windowStartIndex = 0;
		}
	}

	getTps(now: number): number {
		if (this.events.length === 0) return 0;
		const windowStart = now - this.windowMs;
		while (
			this.windowStartIndex < this.events.length &&
			this.events[this.windowStartIndex].time < windowStart
		) {
			this.windowStartIndex++;
		}
		if (this.windowStartIndex >= this.events.length) return 0;
		let windowTokens = 0;
		for (let i = this.windowStartIndex; i < this.events.length; i++) windowTokens += this.events[i].tokens;
		if (windowTokens === 0) return 0;
		const duration = (now - this.events[this.windowStartIndex].time) / 1000;
		if (duration === 0) return 0;
		// Clamp to minimum span (100ms) to avoid burst spikes, like pi-token-speed
		const clamped = Math.max(duration, 0.1);
		return windowTokens / clamped;
	}

	reset(): void {
		this.events.length = 0;
		this.windowStartIndex = 0;
	}
}

// ---- state ----

interface StreamStats {
	startTime: number; // aligned to first token arrival (TTFT excluded)
	ttftMs: number | null;
	estimatedTokens: number;
	slidingWindow: SlidingWindow;
	// For fallback path when assistantMessageEvent is absent
	lastTextLength: number;
	hasReceivedFirstToken: boolean;
	toolNameByIndex: Map<number, string>;
}

interface CompletedStats {
	tps: number;
	tokens: number;
	durationMs: number;
	ttftMs: number | null;
	model?: string;
}

export default function (pi: ExtensionAPI) {
	let enabled = true;
	let lastStats: CompletedStats | null = null;
	let currentStream: StreamStats | null = null;
	let statusTimer: ReturnType<typeof setTimeout> | null = null;

	const WINDOW_MS = 1000;

	const clearStatusTimer = () => {
		if (statusTimer) {
			clearTimeout(statusTimer);
			statusTimer = null;
		}
	};

	const updateStatus = (ctx: ExtensionContext) => {
		if (!enabled) {
			ctx.ui.setStatus("tps", undefined);
			return;
		}

		const theme = ctx.ui.theme;

		if (currentStream) {
			const now = Date.now();
			const elapsedMs = now - currentStream.startTime;
			const elapsedSec = elapsedMs / 1000;
			// While window is filling, use average; afterwards use sliding window
			let tps: number;
			if (elapsedMs < WINDOW_MS) {
				tps = elapsedSec > 0 ? currentStream.estimatedTokens / elapsedSec : 0;
			} else {
				tps = currentStream.slidingWindow.getTps(now);
				// Fall back to average if window is empty (e.g., pause)
				if (tps === 0 && elapsedSec > 0) tps = currentStream.estimatedTokens / elapsedSec;
			}
			ctx.ui.setStatus(
				"tps",
				theme.fg("accent", `⚡ ${formatTps(tps)} tok/s`) +
					theme.fg("dim", ` · ${currentStream.estimatedTokens}t`),
			);
		} else if (lastStats) {
			const ttftSuffix = lastStats.ttftMs != null ? theme.fg("dim", ` · ${lastStats.ttftMs}ms TTFT`) : "";
			ctx.ui.setStatus(
				"tps",
				theme.fg("success", `✓ ${formatTps(lastStats.tps)} tok/s`) +
					theme.fg("dim", ` · ${lastStats.tokens}t · ${(lastStats.durationMs / 1000).toFixed(1)}s`) +
					ttftSuffix,
			);
		} else {
			ctx.ui.setStatus("tps", undefined);
		}
	};

	const recordTokens = (tokens: number) => {
		if (!currentStream || tokens <= 0) return;
		currentStream.estimatedTokens += tokens;
		currentStream.slidingWindow.record(tokens);
	};

	pi.on("message_start", async (event, ctx) => {
		if (event.message.role !== "assistant") return;
		clearStatusTimer();
		currentStream = {
			startTime: Date.now(),
			ttftMs: null,
			estimatedTokens: 0,
			slidingWindow: new SlidingWindow(WINDOW_MS),
			lastTextLength: 0,
			hasReceivedFirstToken: false,
			toolNameByIndex: new Map(),
		};
		updateStatus(ctx);
	});

	pi.on("message_update", async (event, ctx) => {
		if (!currentStream) return;
		// message_update is only for assistant streaming, but guard fallback
		if ((event as any).message && (event as any).message.role && (event as any).message.role !== "assistant") {
			return;
		}

		const ev: any = (event as any).assistantMessageEvent;

		// Preferred path: delta events (pi 0.84.x extension API + future-proof)
		if (ev && typeof ev.type === "string") {
			// Track tool names for toolcall streams (new: ev.toolName, legacy: ev.partial)
			if (ev.type === "toolcall_start") {
				const toolName: string | undefined =
					typeof ev.toolName === "string"
						? ev.toolName
						: ev.partial?.content?.[ev.contentIndex]?.name;
				if (toolName) currentStream.toolNameByIndex.set(ev.contentIndex, toolName);

				// First token arrival: align window start, capture TTFT
				if (!currentStream.hasReceivedFirstToken) {
					currentStream.hasReceivedFirstToken = true;
					const now = Date.now();
					currentStream.ttftMs = Math.max(0, now - currentStream.startTime);
					currentStream.startTime = now;
					currentStream.slidingWindow.reset();
				}
				// toolcall_start itself doesn't count tokens
				return;
			}

			if (ev.type === "text_start" || ev.type === "thinking_start") {
				if (!currentStream.hasReceivedFirstToken) {
					currentStream.hasReceivedFirstToken = true;
					const now = Date.now();
					currentStream.ttftMs = Math.max(0, now - currentStream.startTime);
					currentStream.startTime = now;
					currentStream.slidingWindow.reset();
				}
				return;
			}

			if (ev.type === "text_delta" || ev.type === "thinking_delta") {
				if (!currentStream.hasReceivedFirstToken) {
					currentStream.hasReceivedFirstToken = true;
					const now = Date.now();
					currentStream.ttftMs = Math.max(0, now - currentStream.startTime);
					currentStream.startTime = now;
					currentStream.slidingWindow.reset();
				}

				const delta: string = typeof ev.delta === "string" ? ev.delta : "";
				// Use chars/4 estimate (tok-rate-footer style) – matches existing behavior
				// Alternative direct counting (1 per delta) is preserved as comment:
				// const tokens = 1;
				const tokens = estimateTokens(delta);
				if (tokens > 0) {
					recordTokens(tokens);
					updateStatus(ctx);
				} else if (delta.length > 0) {
					// Fallback to length/4 fractional for tiny deltas
					const frac = Math.max(0, delta.length / 4);
					if (frac > 0) {
						recordTokens(frac);
						updateStatus(ctx);
					}
				}
				return;
			}

			if (ev.type === "toolcall_delta") {
				if (!currentStream.hasReceivedFirstToken) {
					currentStream.hasReceivedFirstToken = true;
					const now = Date.now();
					currentStream.ttftMs = Math.max(0, now - currentStream.startTime);
					currentStream.startTime = now;
					currentStream.slidingWindow.reset();
				}

				// Only count edit/write (pi-token-speed convention)
				let toolName = currentStream.toolNameByIndex.get(ev.contentIndex);
				if (!toolName) {
					toolName = ev.partial?.content?.[ev.contentIndex]?.name ?? ev.toolName;
					if (toolName) currentStream.toolNameByIndex.set(ev.contentIndex, toolName);
				}
				if (toolName && toolName !== "edit" && toolName !== "write") {
					return; // skip prompt-processing toolcalls
				}
				// If we cannot determine tool name (new API without mapping), be conservative
				// and skip – avoids counting bash/other tools. Uncomment to count all:
				// if (!toolName) { /* count anyway */ }

				if (!toolName) return;

				const delta: string = typeof ev.delta === "string" ? ev.delta : "";
				const tokens = estimateTokens(delta);
				if (tokens > 0) {
					recordTokens(tokens);
					updateStatus(ctx);
				}
				return;
			}

			// text_end/thinking_end/toolcall_end – no token delta, ignore
			return;
		}

		// Fallback path: cumulative message snapshot (older pi versions)
		const msg: any = (event as any).message;
		if (!msg || !Array.isArray(msg.content)) return;
		const text = getAllText(msg as AssistantMessage);
		const newChars = text.length - currentStream.lastTextLength;
		if (newChars > 0) {
			if (!currentStream.hasReceivedFirstToken) {
				currentStream.hasReceivedFirstToken = true;
				const now = Date.now();
				currentStream.ttftMs = Math.max(0, now - currentStream.startTime);
				currentStream.startTime = now;
				currentStream.slidingWindow.reset();
			}
			const tokens = estimateTokens(text.slice(currentStream.lastTextLength));
			currentStream.lastTextLength = text.length;
			recordTokens(tokens);
			updateStatus(ctx);
		}
	});

	pi.on("message_end", async (event, ctx) => {
		if (!currentStream || event.message.role !== "assistant") return;

		const now = Date.now();
		const durationMs = Math.max(1, now - currentStream.startTime);

		const message = event.message as AssistantMessage;
		const providerTokens: number | undefined = (message as any).usage?.output;
		const streamedTokens = currentStream.estimatedTokens;

		// Snapshot reconciled total: provider authoritative > streamed > full-message estimate
		let tokens: number;
		if (typeof providerTokens === "number" && providerTokens > 0) {
			tokens = providerTokens;
		} else if (streamedTokens > 0) {
			// Keep fractional estimates rounded up to preserve prior ceil behavior
			tokens = Math.ceil(streamedTokens);
		} else {
			tokens = estimateTokens(getAllText(message));
		}

		const tps = durationMs > 0 ? tokens / (durationMs / 1000) : 0;
		lastStats = { tps, tokens, durationMs, ttftMs: currentStream.ttftMs, model: (message as any).model };

		currentStream = null;
		updateStatus(ctx);

		clearStatusTimer();
		statusTimer = setTimeout(() => {
			lastStats = null;
			// Clear status only if enabled and no active stream; need ctx – use last known
			// We can't access ctx here; pi.on callbacks get fresh ctx on next event.
			// Status will be cleared on next agent_start/session_start/message_start.
		}, 30000);
	});

	pi.on("agent_start", async (_event, ctx) => {
		lastStats = null;
		clearStatusTimer();
		// Don't clear currentStream here – it will be reset on next message_start
		updateStatus(ctx);
	});

	pi.on("session_shutdown", async () => {
		clearStatusTimer();
		currentStream = null;
		lastStats = null;
	});

	pi.on("session_start", async (_event, ctx) => {
		currentStream = null;
		lastStats = null;
		clearStatusTimer();
		updateStatus(ctx);
	});

	pi.on("turn_end", async () => {
		// Defensive: ensure streaming window is closed if message_end was missed
		if (currentStream && Date.now() - currentStream.startTime > 60000) {
			// stale stream guard – don't leak; actual cleanup happens on message_end
		}
	});

	pi.registerCommand("tps", {
		description: "Toggle tokens-per-second display or show last stats",
		handler: async (args, ctx) => {
			const cmd = args.trim().toLowerCase();

			if (cmd === "off") {
				enabled = false;
				clearStatusTimer();
				ctx.ui.setStatus("tps", undefined);
				ctx.ui.notify("TPS display disabled", "info");
				return;
			}

			if (cmd === "on") {
				enabled = true;
				updateStatus(ctx);
				ctx.ui.notify("TPS display enabled", "info");
				return;
			}

			if (cmd === "last") {
				if (!lastStats) {
					ctx.ui.notify("No completed message stats yet", "warning");
					return;
				}
				const modelStr = lastStats.model ? ` [${lastStats.model}]` : "";
				const ttftStr = lastStats.ttftMs != null ? `, TTFT ${lastStats.ttftMs}ms` : "";
				ctx.ui.notify(
					`Last: ${formatTps(lastStats.tps)} tok/s (${lastStats.tokens} tokens, ${(lastStats.durationMs / 1000).toFixed(2)}s${ttftStr})${modelStr}`,
					"info",
				);
				return;
			}

			// Toggle if no arg
			enabled = !enabled;
			if (enabled) {
				updateStatus(ctx);
				ctx.ui.notify("TPS display enabled", "info");
			} else {
				clearStatusTimer();
				ctx.ui.setStatus("tps", undefined);
				ctx.ui.notify("TPS display disabled", "info");
			}
		},
	});
}
