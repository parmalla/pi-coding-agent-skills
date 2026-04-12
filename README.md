# Pi Coding Agent Skills

A collection of skills for [pi coding agent](https://github.com/badlogic/pi-coding-agent).

## What are Skills?

Skills are self-contained capability packages that the agent loads on-demand. They provide specialized workflows, setup instructions, helper scripts, and reference documentation for specific tasks.

See the [Agent Skills specification](https://agentskills.io/specification) for the standard format.

## Structure

Each skill is a directory containing a `SKILL.md` file:

```
skill-name/
├── SKILL.md              # Required: frontmatter + instructions
├── scripts/              # Helper scripts
├── references/           # Detailed docs loaded on-demand
└── assets/               # Templates and other assets
```

## Installation

To use these skills, add this directory to your pi settings or symlink to `~/.pi/agent/skills/`:

```bash
ln -s /path/to/pi-coding-agent-skills ~/.pi/agent/skills/pi-coding-agent-skills
```

Or add to `.pi/settings.json`:

```json
{
  "skills": ["/home/pmalla/Work/pi-coding-agent-skills"]
}
```

## Available Skills

Coming soon...

## Creating a New Skill

1. Create a new directory: `mkdir my-skill`
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

## License

MIT
