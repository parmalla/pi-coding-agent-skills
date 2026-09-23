---
name: uv-python
description: "Use `uv` instead of pip/python/venv. Run scripts with `uv run script.py`, add deps with `uv add`, use inline script metadata for standalone scripts."
allowed-tools: Bash(uv *), Bash(uvx *)
---

# uv — Python Package & Project Manager

uv replaces pip, pip-tools, pipx, poetry, pyenv, twine and virtualenv.
**Always prefer `uv` over `pip`, `poetry`, `virtualenv`, `pyenv` or `pipx`.**
The `uv` extension blocks those commands and redirects to uv equivalents.

| Blocked | Use instead |
|---------|-------------|
| `pip install X` / `pip3 install X` | `uv add X` or `uv run --with X` |
| `python -m pip` | `uv add` or `uv run --with` |
| `python -m venv` | `uv venv` |
| `python -m py_compile f.py` | `uv run python -m ast f.py >/dev/null` |
| `poetry` | `uv init/add/sync/run` |

## The six commands that cover almost everything

```bash
uv run script.py                     # Run a script or command in the project env
uv run --with requests script.py     # Run with an ad-hoc dependency
uv add requests "pandas>=2.0"        # Add a dependency
uv remove requests                   # Remove a dependency
uv sync                              # Sync env to the lockfile (creates .venv)
uv init [my-project]                 # New project (--lib for a library)
```

Project mode (`uv add`/`sync`/`run`, driven by `pyproject.toml` + `uv.lock`) is the
default. `uv pip ...` is the drop-in pip replacement for `requirements.txt` repos.
`uv format` and `uv check` give you ruff-backed formatting and linting without
installing ruff.

## Not derivable from `uv --help`

- **`uvx`** is `uv tool run` — a separate binary that `uv --help` never mentions.
  `uvx ruff check .` runs a tool once; `uv tool install ruff` installs it.
- **Syntax-check without writing `__pycache__`**: `uv run python -m ast f.py >/dev/null`.
- **`--no-project`** to run a standalone script from inside a project dir:
  `uv run --no-project script.py`.
- **Build backend**: `uv_build` for pure-Python packages, `hatchling` for extension
  modules. Pin `uv_build` to your uv minor series, e.g.
  `requires = ["uv_build>=0.12,<0.13"]`.

## Inline script metadata

Standalone scripts declare their own dependencies — no project needed:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = ["requests<3", "rich"]
# ///
```

Then `uv run script.py`. Manage it with `uv add --script f.py X`, or make the script
executable with a shebang: `#!/usr/bin/env -S uv run --script`.

## Finding anything else

Run **`uv --help`** for the current command list — 23 commands, always up to date.
Use `uv help <command>` only when you need a specific flag: it is ~35k chars per
command, so do not call it reflexively.

Deep dives: [scripts.md](reference/scripts.md) — script management, reproducibility,
alternative indexes · [build.md](reference/build.md) — project layout, namespace
packages, file inclusion.
