import os
from pathlib import Path

VAME_APP_DIRECTORY = Path.home() / "vame-desktop"
VAME_PROJECTS_DIRECTORY = VAME_APP_DIRECTORY / "projects"
VAME_LOG_DIRECTORY = VAME_APP_DIRECTORY / "logs"
GLOBAL_STATES_FILE = VAME_APP_DIRECTORY / "states.json"

# Persistent app-level settings
GLOBAL_SETTINGS_FILE = VAME_APP_DIRECTORY / "settings.json"

# Server defaults. Can be overridden via environment variables (set by the CLI).
DEFAULT_HOST = os.getenv("VAME_HOST", "127.0.0.1")
DEFAULT_PORT = int(os.getenv("VAME_PORT", "8641"))

# Root directory the in-app file browser (/fs) is allowed to traverse.
# Defaults to the user's home directory so users can navigate to their source
# data. On a shared/remote server, set VAME_DATA_ROOT to confine browsing
# (e.g. /data or a per-user directory).
DATA_ROOT = Path(os.getenv("VAME_DATA_ROOT", str(Path.home()))).resolve()


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
