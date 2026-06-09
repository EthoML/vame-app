import os
from pathlib import Path

VAME_APP_DIRECTORY = Path.home() / "vame-app"
VAME_PROJECTS_DIRECTORY = VAME_APP_DIRECTORY / "projects"
VAME_LOG_DIRECTORY = VAME_APP_DIRECTORY / "logs"
GLOBAL_STATES_FILE = VAME_APP_DIRECTORY / "states.json"

# Persistent app-level settings
GLOBAL_SETTINGS_FILE = VAME_APP_DIRECTORY / "settings.json"

# Server defaults. Can be overridden via environment variables (set by the CLI).
DEFAULT_HOST = os.getenv("VAME_HOST", "127.0.0.1")
DEFAULT_PORT = int(os.getenv("VAME_PORT", "8641"))
_DATA_ROOT: Path | None = None


def set_data_root(path: str | os.PathLike) -> Path:
    """Resolve and freeze the file-browser root. Call once at startup."""
    global _DATA_ROOT
    _DATA_ROOT = Path(path).expanduser().resolve()
    return _DATA_ROOT


def get_data_root() -> Path:
    """Return the frozen root. On first use with none set, fall back to
    VAME_DATA_ROOT / home and freeze that."""
    if _DATA_ROOT is None:
        return set_data_root(os.getenv("VAME_DATA_ROOT", str(Path.home())))
    return _DATA_ROOT


def resolve_within(root: Path, candidate: str | os.PathLike) -> Path:
    """Resolve ``candidate`` and guarantee it stays inside ``root``.

    Protects the filesystem endpoints against path traversal (``../``),
    symlink escapes, etc. Raises ``PermissionError`` if the resolved path
    would fall outside ``root``.
    """
    root = Path(root).resolve()
    target = Path(candidate)
    if not target.is_absolute():
        target = root / target
    target = target.resolve()
    if target != root and root not in target.parents:
        raise PermissionError(f"Path '{candidate}' is outside the allowed root '{root}'.")
    return target
