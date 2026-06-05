import json
import os
import signal
import sys
import traceback

from app.config import (
    VAME_PROJECTS_DIRECTORY,
    VAME_LOG_DIRECTORY,
    GLOBAL_SETTINGS_FILE,
    GLOBAL_STATES_FILE,
)

from app import create_app


def log_and_exit(msg, code=1):
    print(msg, file=sys.stderr)
    sys.stderr.flush()
    sys.stdout.flush()
    os._exit(code)


def signal_handler(sig, frame):
    sig_name = {
        signal.SIGTERM: "SIGTERM",
        signal.SIGINT: "SIGINT",
        signal.SIGHUP: "SIGHUP",
    }.get(sig, str(sig))
    print(f"Received {sig_name}, shutting down...", file=sys.stderr)
    sys.stderr.flush()
    sys.stdout.flush()
    os._exit(0)


# Handle common signals
signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)
if hasattr(signal, "SIGHUP"):
    signal.signal(signal.SIGHUP, signal_handler)


def global_exception_handler(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        print("KeyboardInterrupt received, exiting.", file=sys.stderr)
        sys.stderr.flush()
        sys.stdout.flush()
        os._exit(0)
    print("Unhandled exception occurred:", file=sys.stderr)
    traceback.print_exception(exc_type, exc_value, exc_traceback, file=sys.stderr)
    sys.stderr.flush()
    sys.stdout.flush()
    os._exit(1)


sys.excepthook = global_exception_handler

app = create_app()

if __name__ == "__main__":
    env_port = os.getenv("PORT")
    PORT = int(env_port) if env_port else 8641
    HOST = os.getenv("HOST") or "localhost"
    DEBUG = os.getenv("FLASK_DEBUG") == "1"

    # Create the VAME_PROJECTS_DIRECTORY if it doesn't exist
    VAME_PROJECTS_DIRECTORY.mkdir(exist_ok=True, parents=True)
    # Create the VAME_LOG_DIRECTORY if it doesn't exist
    VAME_LOG_DIRECTORY.mkdir(exist_ok=True, parents=True)

    # Create the global files if they don't exist
    global_files = [GLOBAL_STATES_FILE, GLOBAL_SETTINGS_FILE]
    for file in global_files:
        if not file.exists():
            with open(file, "w") as f:
                json.dump({}, f)

    try:
        print(f"Flask server started at {HOST}:{PORT}")
        sys.stdout.flush()
        app.run(
            host=HOST,
            port=PORT,
            debug=False,
        )
    except Exception as e:
        print(f"An error occurred that closed the server: {e}", file=sys.stderr)
        traceback.print_exc(file=sys.stderr)
        sys.stderr.flush()
        sys.stdout.flush()
        raise e
