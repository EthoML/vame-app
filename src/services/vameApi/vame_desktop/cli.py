"""Command-line entry point for VAME Desktop.

Running ``vame-desktop`` starts the Flask backend (which also serves the built React frontend) and opens
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
    from vame_desktop.config import (
        VAME_PROJECTS_DIRECTORY,
        VAME_LOG_DIRECTORY,
        GLOBAL_STATES_FILE,
    )

    VAME_PROJECTS_DIRECTORY.mkdir(exist_ok=True, parents=True)
    VAME_LOG_DIRECTORY.mkdir(exist_ok=True, parents=True)
    if not GLOBAL_STATES_FILE.exists():
        with open(GLOBAL_STATES_FILE, "w") as fh:
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
        prog="vame-desktop",
        description="Run the VAME Desktop web application locally.",
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
        default=os.getenv("VAME_DATA_ROOT"),
        help="Root directory the in-app file browser may traverse (default: home directory).",
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

    # IMPORTANT: set env before importing the app, because config values
    # (DATA_ROOT, host, port) are read from the environment at import time.
    if args.data_root:
        os.environ["VAME_DATA_ROOT"] = str(args.data_root)
    os.environ["VAME_HOST"] = args.host
    os.environ.setdefault("PYTHONUNBUFFERED", "1")

    _install_signal_handlers()
    _ensure_directories()

    host = args.host
    port = _pick_port(host, args.port)
    os.environ["VAME_PORT"] = str(port)

    from vame_desktop import create_app
    from vame_desktop.config import DATA_ROOT

    app = create_app()

    display_host = "localhost" if host in ("127.0.0.1", "0.0.0.0") else host
    url = f"http://{display_host}:{port}"

    print("=" * 60)
    print("  VAME Desktop")
    print(f"  URL:        {url}")
    print(f"  Data root:  {DATA_ROOT}")
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
