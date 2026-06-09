"""Command-line entry point for VAME App.

Running ``vame-app`` starts the Flask backend (which also serves the built React frontend) and opens
the app in the user's default browser.
"""

import argparse
import json
import os
import signal
import socket
import sys
import threading
import traceback
import webbrowser
from pathlib import Path


_SETTINGS_FILE = Path.home() / "vame-app" / "settings.json"


def _read_app_settings() -> dict:
    """Return the persisted app-level settings (``{}`` if missing/unreadable)."""
    try:
        with open(_SETTINGS_FILE) as fh:
            data = json.load(fh)
        return data if isinstance(data, dict) else {}
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def _write_app_settings(updates: dict) -> None:
    """Merge ``updates`` into settings.json, creating it if needed."""
    settings = _read_app_settings()
    settings.update(updates)
    _SETTINGS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(_SETTINGS_FILE, "w") as fh:
        json.dump(settings, fh, indent=2)


def _install_signal_handlers():
    def signal_handler(sig, frame):
        sig_name = {
            signal.SIGTERM: "SIGTERM",
            signal.SIGINT: "SIGINT",
        }.get(sig, str(sig))
        if hasattr(signal, "SIGHUP"):
            sig_name = "SIGHUP" if sig == signal.SIGHUP else sig_name
        print(f"\nReceived {sig_name}, shutting down...", file=sys.stderr)
        sys.stderr.flush()
        os._exit(0)

    signal.signal(signal.SIGTERM, signal_handler)
    signal.signal(signal.SIGINT, signal_handler)
    if hasattr(signal, "SIGHUP"):
        signal.signal(signal.SIGHUP, signal_handler)


def _ensure_directories():
    from vame_app.config import (
        VAME_PROJECTS_DIRECTORY,
        VAME_LOG_DIRECTORY,
        GLOBAL_STATES_FILE,
    )

    VAME_PROJECTS_DIRECTORY.mkdir(exist_ok=True, parents=True)
    VAME_LOG_DIRECTORY.mkdir(exist_ok=True, parents=True)
    if not GLOBAL_STATES_FILE.exists():
        with open(GLOBAL_STATES_FILE, "w") as fh:
            json.dump({}, fh)
    if not _SETTINGS_FILE.exists():
        with open(_SETTINGS_FILE, "w") as fh:
            json.dump({}, fh)


def _is_port_free(host: str, port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            s.bind((host, port))
            return True
        except OSError:
            return False


def _pick_port(host: str, preferred: int) -> int:
    if preferred and _is_port_free(host, preferred):
        return preferred
    # Fall back to an ephemeral free port.
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((host, 0))
        return s.getsockname()[1]


def _open_browser_when_ready(url: str, host: str, port: int):
    """Open the browser once the server accepts connections."""

    def worker():
        for _ in range(100):  # ~20s max
            try:
                with socket.create_connection((host, port), timeout=0.2):
                    break
            except OSError:
                threading.Event().wait(0.2)
        try:
            webbrowser.open(url)
        except Exception:
            pass

    threading.Thread(target=worker, daemon=True).start()


def main(argv=None):
    parser = argparse.ArgumentParser(
        prog="vame-app",
        description="Run the VAME App web application locally.",
    )
    parser.add_argument(
        "--host",
        default=os.getenv("VAME_HOST", "127.0.0.1"),
        help="Host/interface to bind (default: 127.0.0.1). Use 0.0.0.0 to expose on the network.",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.getenv("VAME_PORT", "8641")),
        help="Port to listen on (default: 8641). Use 0 to auto-pick a free port.",
    )
    parser.add_argument(
        "--data-root",
        default=None,
        help=(
            "Root directory the in-app file browser may traverse. When passed, it "
            "is remembered in ~/vame-app/settings.json for future launches. "
            "Precedence: this flag > VAME_DATA_ROOT env var > settings.json > home directory."
        ),
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not automatically open the browser.",
    )
    parser.add_argument(
        "--dev",
        action="store_true",
        help="Use the Flask development server instead of waitress.",
    )
    args = parser.parse_args(argv)

    # Resolve the file-browser root with precedence:
    #   --data-root flag  >  VAME_DATA_ROOT env  >  settings.json  >  home dir (config default)
    if args.data_root:
        data_root = str(Path(args.data_root).expanduser())
        if data_root != _read_app_settings().get("data_root"):
            _write_app_settings({"data_root": data_root})
    elif os.getenv("VAME_DATA_ROOT"):
        data_root = os.environ["VAME_DATA_ROOT"]
    else:
        data_root = _read_app_settings().get("data_root")

    os.environ["VAME_HOST"] = args.host
    os.environ.setdefault("PYTHONUNBUFFERED", "1")

    _install_signal_handlers()
    _ensure_directories()

    host = args.host
    port = _pick_port(host, args.port)
    os.environ["VAME_PORT"] = str(port)


    from vame_app.config import set_data_root, get_data_root

    set_data_root(data_root or str(Path.home()))

    from vame_app import create_app

    app = create_app()

    display_host = "localhost" if host in ("127.0.0.1", "0.0.0.0") else host
    url = f"http://{display_host}:{port}"

    print("=" * 60)
    print("  VAME App")
    print(f"  URL:        {url}")
    print(f"  Data root:  {get_data_root()}")
    print("  Press Ctrl+C to stop.")
    print("=" * 60)
    sys.stdout.flush()

    if not args.no_browser:
        _open_browser_when_ready(url, "127.0.0.1" if host == "0.0.0.0" else host, port)

    try:
        if args.dev:
            app.run(host=host, port=port, debug=False)
        else:
            try:
                from waitress import serve
            except ImportError:
                print(
                    "waitress not installed; falling back to the Flask dev server.",
                    file=sys.stderr,
                )
                app.run(host=host, port=port, debug=False)
            else:
                serve(app, host=host, port=port, threads=8)
    except Exception as e:
        print(f"An error occurred that closed the server: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        raise


if __name__ == "__main__":
    main()
