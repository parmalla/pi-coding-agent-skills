/**
 * Tokens Per Second (TPS) Extension
 *
 * Displays real-time token generation speed during assistant streaming
 * and final stats when a message completes. Thinking/reasoning content
 * is included in the token count alongside output text.
 *
 * Usage:
 *   /tps              Toggle display on/off
 *   /tps on           Enable TPS display
 *   /tps off          Disable TPS display
 *   /tps last         Show stats from the last completed message
 */

import type { AssistantMessage, ContentBlock } from "@earendil-works/pi-ai";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

interface StreamStats {
	startTime: number;
	lastUpdateTime: number;
	estimatedTokens: number;
	lastTextLength: number;
}

interface CompletedStats {
	tps: number;
	tokens: number;
	durationMs: number;
	model?: string;
}

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

export default function (pi: ExtensionAPI) {
	let enabled = true;
	let lastStats: CompletedStats | null = null;
	let currentStream: StreamStats | null = null;
	let statusTimer: ReturnType<typeof setTimeout> | null = null;

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
			const elapsed = (Date.now() - currentStream.startTime) / 1000;
			const tps = elapsed > 0 ? currentStream.estimatedTokens / elapsed : 0;
			ctx.ui.setStatus(
				"tps",
				theme.fg("accent", `⚡ ${formatTps(tps)} tok/s`) + theme.fg("dim", ` · ${currentStream.estimatedTokens}t`),
			);
		} else if (lastStats) {
			ctx.ui.setStatus(
				"tps",
				theme.fg("success", `✓ ${formatTps(lastStats.tps)} tok/s`) +
					theme.fg("dim", ` · ${lastStats.tokens}t · ${(lastStats.durationMs / 1000).toFixed(1)}s`),
			);
		} else {
			ctx.ui.setStatus("tps", undefined);
		}
	};

	pi.on("message_start", async (event, ctx) => {
		if (event.message.role !== "assistant") return;
		clearStatusTimer();
		currentStream = { startTime: Date.now(), lastUpdateTime: Date.now(), estimatedTokens: 0, lastTextLength: 0 };
		updateStatus(ctx);
	});

	pi.on("message_update", async (event, ctx) => {
		if (!currentStream || event.message.role !== "assistant") return;
		const text = getAllText(event.message);
		const newChars = text.length - currentStream.lastTextLength;
		if (newChars > 0) {
			currentStream.estimatedTokens += estimateTokens(text.slice(currentStream.lastTextLength));
			currentStream.lastTextLength = text.length;
			currentStream.lastUpdateTime = Date.now();
			updateStatus(ctx);
		}
	});

	pi.on("message_end", async (event, ctx) => {
		if (!currentStream || event.message.role !== "assistant") return;

		const durationMs = Math.max(1, currentStream.lastUpdateTime - currentStream.startTime);
		const durationSec = durationMs / 1000;

		const message = event.message as AssistantMessage;

		// Compute tokens from the full final message so thinking/reasoning blocks
		// that may have arrived are guaranteed to be included. This matches the
		// same estimateTokens() function used during streaming.
		const tokens = estimateTokens(getAllText(message));

		const tps = durationSec > 0 ? tokens / durationSec : 0;
		lastStats = { tps, tokens, durationMs, model: message.model };

		currentStream = null;
		updateStatus(ctx);

		clearStatusTimer();
		statusTimer = setTimeout(() => {
			lastStats = null;
		}, 30000);
	});

	pi.on("agent_start", async (_event, ctx) => {
		lastStats = null;
		clearStatusTimer();
		updateStatus(ctx);
	});

	pi.on("session_shutdown", async () => {
		// Clean up timers and state so no stale ctx is accessed after
		// session replacement (new/resume/fork) or reload.
		clearStatusTimer();
		currentStream = null;
		lastStats = null;
	});

	pi.on("session_start", async (_event, ctx) => {
		// Fresh session — reset all streaming state and clear stale status.
		currentStream = null;
		lastStats = null;
		clearStatusTimer();
		updateStatus(ctx);
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
				ctx.ui.notify(
					`Last: ${formatTps(lastStats.tps)} tok/s (${lastStats.tokens} tokens, ${(lastStats.durationMs / 1000).toFixed(2)}s)${modelStr}`,
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
