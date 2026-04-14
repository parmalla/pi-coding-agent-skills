---
name: uv-python
description: Use uv (by Astral) for Python project management. Use this skill whenever the user wants to create, manage, or work with Python projects, dependencies, virtual environments, Python versions, or build/publish packages. Covers uv init, add, remove, sync, run, lock, build, publish, python management, pip compat, and more.
---

# uv — Python Package & Project Manager

uv is an extremely fast Python package and project manager written in Rust. It replaces pip, pip-tools, pipx, poetry, pyenv, twine, virtualenv, and more with a single tool. It is 10-100x faster than pip.

**Always prefer `uv` commands over `pip`, `poetry`, `virtualenv`, `pyenv`, or `pipx` for Python projects.**

## Quick Reference

| Task | Command |
|------|---------|
| Create project | `uv init [my-project]` |
| Add dependency | `uv add <package>` |
| Add dev dependency | `uv add --dev <package>` |
| Remove dependency | `uv remove <package>` |
| Install/sync deps | `uv sync` |
| Run a script | `uv run python main.py` |
| Run any command | `uv run <command>` |
| Lock dependencies | `uv lock` |
| Install Python | `uv python install 3.12` |
| Pin Python version | `uv python pin 3.12` |
| Create venv | `uv venv` |
| List installed packages | `uv pip list` |
| Show dependency tree | `uv tree` |
| Format code | `uv format` |
| Build package | `uv build` |
| Publish package | `uv publish` |
| Run a tool (ephemeral) | `uvx <tool>` |
| Install a tool | `uv tool install <tool>` |
| Audit dependencies | `uv audit` |
| Export lockfile | `uv export` |

## Project Workflow

### Creating a New Project

```bash
# Application project (default)
uv init my-app
cd my-app

# Library project (for packages published to PyPI)
uv init --lib my-package
cd my-package

# With a specific build backend
uv init --build-backend hatch my-project
uv init --build-backend pdm my-project
```

### Adding and Removing Dependencies

```bash
# Add a dependency (updates pyproject.toml and uv.lock)
uv add requests
uv add "pandas>=2.0"
uv add numpy  # latest compatible version

# Add a dev dependency
uv add --dev pytest
uv add --dev ruff

# Add to a specific dependency group
uv add --group docs mkdocs

# Remove a dependency
uv remove requests
uv remove --dev pytest

# Add a dependency from Git
uv add "git+https://github.com/user/repo.git"

# Add a local path dependency
uv add --editable ../my-other-package
```

### Installing and Syncing

```bash
# Sync environment with lockfile (creates .venv if needed)
uv sync

# Sync without dev dependencies
uv sync --no-dev

# Sync a specific extra
uv sync --extra gpu

# Force re-create environment
uv sync --reinstall
```

### Running Commands

```bash
# Run a Python script (auto-syncs environment first)
uv run python main.py

# Run any command in the project environment
uv run pytest
uv run ruff check .

# Run with extra dependencies layered on top
uv run --with httpie httpie

# Run a script with inline dependencies (PEP 723)
# Add dependency metadata to script:
# # /// script
# # dependencies = ["requests", "rich"]
# # requires-python = ">=3.11"
# # ///
uv run script.py

# Run with a specific Python version
uv run --python 3.12 main.py
```

### Locking Dependencies

```bash
# Update lockfile
uv lock

# Check if lockfile is up to date (CI-friendly)
uv lock --check

# Export lockfile to requirements.txt
uv export > requirements.txt

# Export in PEP 751 format
uv export --format pylock.toml
```

## Python Version Management

```bash
# Install Python versions (downloads pre-built binaries, no compilation)
uv python install 3.12
uv python install 3.11 3.12 3.13

# List available/installed versions
uv python list

# Pin project to a Python version
uv python pin 3.12

# Find a specific Python interpreter
uv python find 3.12

# Uninstall a Python version
uv python uninstall 3.11
```

## Virtual Environments

```bash
# Create a .venv in the current directory (automatic with uv sync/run)
uv venv

# Create with a specific Python version
uv venv --python 3.12

# Create at a custom path
uv venv /path/to/env
```

## pip-Compatible Interface

For existing workflows that use pip/pip-tools, uv provides drop-in replacements:

```bash
# Install from requirements.txt
uv pip install -r requirements.txt

# Install a single package
uv pip install requests

# Compile requirements
uv pip compile requirements.in -o requirements.txt

# Sync to exact versions
uv pip sync requirements.txt

# Freeze installed packages
uv pip freeze

# Uninstall packages
uv pip uninstall requests
```

## Running Tools (pipx replacement)

```bash
# Run a tool once (ephemeral environment, cached for speed)
uvx ruff check .
uvx black --check .
uvx httpie

# Install a tool permanently
uv tool install ruff
uv tool install black

# List installed tools
uv tool list

# Upgrade installed tools
uv tool upgrade ruff
uv tool upgrade --all

# Uninstall a tool
uv tool uninstall ruff
```

## Building and Publishing

```bash
# Build source distribution and wheel
uv build

# Build only wheel
uv build --wheel

# Build only sdist
uv build --sdist

# Publish to PyPI
uv publish

# Publish with credentials
uv publish --token <pypi-token>
uv publish --username __token__ --password <pypi-token>
```

## Dependency Inspection

```bash
# Show dependency tree
uv tree

# Show dependency tree for a specific package
uv tree --package requests

# Check for vulnerabilities
uv audit

# Check for outdated dependencies
uv tree --outdated

# List installed packages (pip-compatible)
uv pip list
uv pip show requests
```

## Formatting and Linting

```bash
# Format code (uses Ruff under the hood)
uv format

# Check formatting without changes
uv format --check

# Show diff of formatting changes
uv format --diff
```

## CI/CD Integration

```bash
# CI-friendly install (sync only production deps, fail if lockfile is stale)
uv sync --locked --no-dev

# Docker — cache-friendly layer separation
uv sync --frozen --no-install-project
uv sync --frozen

# Export for pip-compatible CI
uv export --format requirements.txt --no-dev -o requirements.txt
```

## Project Configuration (pyproject.toml)

```toml
[project]
name = "my-project"
version = "0.1.0"
description = "My project"
requires-python = ">=3.12"
dependencies = [
    "requests>=2.31",
]

[project.optional-dependencies]
gpu = ["torch>=2.0"]
dev = ["pytest>=8.0", "ruff>=0.4"]

[dependency-groups]
docs = ["mkdocs>=1.5"]

[tool.uv.sources]
my-local-pkg = { path = "../my-local-pkg", editable = true }
```

## Key Concepts

### Project vs pip Mode
- **Project mode** (`uv add`, `uv sync`, `uv run`): Uses `pyproject.toml` + `uv.lock`. Reproducible, like Poetry.
- **pip mode** (`uv pip install`, `uv pip sync`): Drop-in pip replacement. No lockfile, uses `requirements.txt`.

### The Lockfile (uv.lock)
- Cross-platform by default (unlike `pip freeze`)
- Records exact versions of all direct and transitive dependencies
- Committed to version control for reproducibility
- Updated by `uv add`, `uv remove`, `uv lock`, `uv sync`

### Caching
- Global cache at `~/.cache/uv/` (Linux/macOS) or `%LOCALAPPDATA%\uv\cache` (Windows)
- Packages downloaded once, shared across projects via hardlinks/COW
- Use `uv cache clean` to clear, `uv cache prune` to remove stale entries

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No `project` table found" | Run `uv init` or add a `[project]` section to `pyproject.toml` |
| Python version mismatch | Run `uv python pin <version>` and `uv sync` |
| Lockfile out of date | Run `uv lock` then `uv sync` |
| Slow CI | Use `uv sync --locked --frozen` with pre-committed lockfile |
| Corporate proxy SSL errors | Set `export UV_NATIVE_TLS=1` or `export HTTPS_PROXY=...` |
| Change default Python | Use `uv python pin` or set `UV_PYTHON` env var |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `UV_PYTHON` | Default Python version/interpreter |
| `UV_PROJECT` | Project directory |
| `UV_CACHE_DIR` | Cache directory override |
| `UV_LOCKED` | Assert lockfile is up-to-date (CI) |
| `UV_FROZEN` | Use lockfile without updating |
| `UV_NATIVE_TLS` | Use system TLS certificates |
| `UV_OFFLINE` | Disable network access |
| `UV_NO_CACHE` | Disable caching |
| `UV_ENV_FILE` | Load `.env` file for `uv run` |

## When to Use This Skill

- Creating a new Python project → `uv init`
- Adding/removing dependencies → `uv add` / `uv remove`
- Managing Python versions → `uv python install` / `uv python pin`
- Running Python scripts or commands → `uv run`
- Installing CLI tools → `uv tool install` or `uvx`
- Building or publishing packages → `uv build` / `uv publish`
- Migrating from pip/poetry/requirements.txt → See references

For detailed migration guides and advanced usage, see the references below.