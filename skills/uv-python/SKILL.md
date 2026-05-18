---
name: uv-python
description: "Use `uv` instead of pip/python/venv. Run scripts with `uv run script.py`, add deps with `uv add`, use inline script metadata for standalone scripts."
allowed-tools: Bash(uv *)
---

# uv — Python Package & Project Manager

uv is an extremely fast Python package and project manager written in Rust. It replaces pip, pip-tools, pipx, poetry, pyenv, twine, virtualenv, and more.

**Always prefer `uv` commands over `pip`, `poetry`, `virtualenv`, `pyenv`, or `pipx`.** The `uv` extension blocks these commands and redirects to uv equivalents.

## Quick Reference

```bash
uv run script.py                   # Run a script
uv run --with requests script.py   # Run with ad-hoc dependency
uv run python -m ast foo.py >/dev/null  # Verify syntax without writing __pycache__
uv add requests                    # Add dependency to project
uv remove requests                 # Remove dependency
uv sync                            # Sync environment with lockfile
uv init [my-project]              # Create a new project
uv init --script foo.py           # Create script with inline metadata
uv build                           # Build package
uv publish                         # Publish package
uv venv                            # Create virtual environment
uv python install 3.12             # Install Python version
uv python pin 3.12                 # Pin project Python version
uv tree                            # Show dependency tree
uv audit                           # Check for vulnerabilities
```

## Blocked Commands → uv Equivalents

| Blocked | Use Instead |
|---------|-------------|
| `pip install X` | `uv add X` or `uv run --with X` |
| `pip3 install X` | `uv add X` or `uv run --with X` |
| `python -m pip` | `uv add` or `uv run --with` |
| `python -m venv` | `uv venv` |
| `python -m py_compile` | `uv run python -m ast file.py >/dev/null` |
| `poetry` | `uv init/add/sync/run` |

## Inline Script Metadata (Recommended)

Declare dependencies directly in standalone scripts:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#   "requests<3",
#   "rich",
# ]
# ///

import requests
from rich import print
```

Then just: `uv run script.py`

### Managing Script Dependencies

```bash
uv init --script example.py --python 3.12   # Create script with metadata
uv add --script example.py requests rich    # Add dependencies
uv lock --script example.py                 # Lock dependencies
```

### Executable Scripts (Shebang)

```python
#!/usr/bin/env -S uv run --script
# /// script
# dependencies = ["httpx"]
# ///
```

## Project Workflow

```bash
uv init my-app                     # Create application project
uv init --lib my-package           # Create library project
uv add requests "pandas>=2.0"      # Add dependencies
uv add --dev pytest ruff           # Add dev dependencies
uv add --group docs mkdocs         # Add to dependency group
uv remove requests                 # Remove dependency
uv sync                             # Sync environment (creates .venv)
uv run python main.py              # Run in project environment
uv run pytest                      # Run command in project environment
uv lock                             # Update lockfile
uv lock --check                    # Check if lockfile is up to date
uv export > requirements.txt       # Export lockfile
```

## Python Version Management

```bash
uv python install 3.12             # Install Python (pre-built, no compilation)
uv python list                     # List available/installed versions
uv python pin 3.12                 # Pin project to a Python version
uv python find 3.12                # Find a specific interpreter
uv python uninstall 3.11           # Uninstall a Python version
```

## Building and Publishing

Use `uv_build` for pure Python packages. For extension modules, use `hatchling` instead.

```toml
[build-system]
requires = ["uv_build>=0.9.28,<0.10.0"]
build-backend = "uv_build"
```

```bash
uv build                           # Build sdist + wheel
uv build --wheel                   # Build only wheel
uv publish                         # Publish to PyPI
uv publish --token <pypi-token>   # Publish with credentials
```

See [build.md](reference/build.md) for project structure, namespace packages, and file inclusion details.

## Running Tools (pipx Replacement)

```bash
uvx ruff check .                   # Run a tool once (ephemeral)
uv tool install ruff                # Install a tool permanently
uv tool upgrade --all              # Upgrade all tools
```

## CI/CD Integration

```bash
uv sync --locked --no-dev           # Production deps, fail if lockfile is stale
uv sync --frozen --no-install-project  # Docker cache-friendly layer separation
uv export --format requirements.txt --no-dev -o requirements.txt  # pip-compatible export
```

## Key Concepts

- **Project mode** (`uv add`, `uv sync`, `uv run`): Uses `pyproject.toml` + `uv.lock`. Reproducible, like Poetry.
- **pip mode** (`uv pip install`, `uv pip sync`): Drop-in pip replacement. No lockfile, uses `requirements.txt`.
- **Lockfile** (`uv.lock`): Cross-platform, records exact versions. Commit to version control.
- **Cache**: Global at `~/.cache/uv/`. Packages downloaded once, shared across projects.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No `project` table found" | Run `uv init` or add a `[project]` section |
| Python version mismatch | Run `uv python pin <version>` and `uv sync` |
| Lockfile out of date | Run `uv lock` then `uv sync` |

For detailed script management and reproducibility, see [scripts.md](reference/scripts.md).
For build backend configuration, see [build.md](reference/build.md).