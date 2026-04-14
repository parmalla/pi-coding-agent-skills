# Pi Coding Agent Skills & Extensions

A collection of skills and extensions for [pi coding agent](https://github.com/badlogic/pi-coding-agent).

## Skills

Skills are self-contained capability packages that the agent loads on-demand. They provide specialized workflows, setup instructions, helper scripts, and reference documentation for specific tasks.

See the [Agent Skills specification](https://agentskills.io/specification) for the standard format.

### Skill Structure

Each skill is a directory containing a `SKILL.md` file:

```
skills/
└── my-skill/
    ├── SKILL.md              # Required: frontmatter + instructions
    ├── scripts/              # Helper scripts
    ├── references/           # Detailed docs loaded on-demand
    └── assets/               # Templates and other assets
```

### Available Skills

| Skill | Description |
|-------|-------------|
| [opencode-go-models](skills/opencode-go-models/) | Model routing guide for OpenCode Go subscription — quickly pick the right model (GLM-5.1, MiMo-V2-Pro, Kimi K2.5, etc.) for any task |
| [uv-python](skills/uv-python/) | Use uv (by Astral) for Python project management — covers uv init, add, remove, sync, run, lock, build, publish, and more |

### Creating a New Skill

1. Create a new directory under `skills/`: `mkdir skills/my-skill`
2. Create `SKILL.md` with proper frontmatter:
   ```markdown
   ---
   name: my-skill
   description: What this skill does and when to use it.
   ---

   # My Skill

   ## Usage
   Instructions here...
   ```
3. Add any helper scripts, references, or assets

## Extensions

Extensions are TypeScript modules that extend pi's behavior. They can subscribe to lifecycle events, register custom tools, add commands, and more.

### Extension Structure

Each extension is a `.ts` file in the `extensions/` directory:

```
extensions/
└── my-extension.ts       # Single file extension
```

### Available Extensions

| Extension | Description |
|-----------|-------------|
| [answer](extensions/answer.ts) | Extract questions from assistant responses into an interactive Q&A — use `/answer` command or `Ctrl+.` shortcut |

### Creating a New Extension

1. Create a new file under `extensions/`: `extensions/my-extension.ts`
2. Export a default function that receives `ExtensionAPI`:

```typescript
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("hello", {
    description: "Say hello",
    handler: async (args, ctx) => {
      ctx.ui.notify(`Hello ${args || "world"}!`, "info");
    },
  });
}
```

See the [pi extensions documentation](https://github.com/badlogic/pi-coding-agent/blob/main/docs/extensions.md) for full details.

## Installation

To use these skills and extensions, add this directory to your pi settings or symlink to `~/.pi/agent/skills/`:

```bash
ln -s /path/to/pi-coding-agent-skills ~/.pi/agent/skills/pi-coding-agent-skills
```

Or add to `.pi/settings.json`:

```json
{
  "skills": ["/home/pmalla/Work/pi-coding-agent-skills"]
}
```

## License

MIT
