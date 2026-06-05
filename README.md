# VAME Desktop

A web application for the Variational Animal Motion Encoding (VAME) project — an
open-source machine learning tool for behavioral segmentation and analyses.

VAME Desktop runs locally: a Python (Flask) backend wraps the
[VAME](https://github.com/EthoML/VAME) library and also serves a React frontend,
which you use in your browser. There is no Electron shell and no PyInstaller
bundle — it installs and runs like a normal Python package.

> **Migrating from the old Electron app?** See [MIGRATION.md](MIGRATION.md) for
> what changed and why.

## Requirements

- Python ≥ 3.12 (VAME 0.14 requires it)
- [conda](https://docs.conda.io/en/latest/) or a virtualenv
- [ffmpeg](https://www.ffmpeg.org/) (needed for some video/image functions)
- A modern browser (Chrome, Edge, Firefox, or Safari)

## Install & run

```bash
# 1. Create an environment (conda recommended because of PyTorch/VAME).
#    This also installs vame-desktop and its Python dependencies (from
#    pyproject.toml) via `pip install -e .`.
conda env create -f environment-<os>.yml   # linux | mac-arm | mac-x86 | win
conda activate vame-desktop

# 2. Build the frontend into the Python package
npm install
npm run build

# 3. Run it
vame-desktop
```

`vame-desktop` starts the local server and opens the app in your browser.

### CLI options

```
vame-desktop [--host HOST] [--port PORT] [--data-root DIR] [--no-browser] [--dev]
```

| Flag | Default | Purpose |
|------|---------|---------|
| `--host` | `127.0.0.1` | Interface to bind. Use `0.0.0.0` to expose on the LAN. |
| `--port` | `8641` | Port to listen on. Use `0` to auto-pick a free port. |
| `--data-root` | home directory | Root the in-app file browser may traverse. Restrict this on shared servers. |
| `--no-browser` | off | Don't auto-open the browser. |
| `--dev` | off | Use the Flask dev server instead of waitress. |

Projects are stored under `~/vame-desktop/projects`. `--data-root` (env
`VAME_DATA_ROOT`) only controls the *file browser* root, not project storage.

## Selecting your data

Because the app runs in a browser, files are chosen through an **in-app file
browser** (built with [react-arborist](https://github.com/brimdata/react-arborist))
that lists the **server's** filesystem via the backend. When you run locally, the
server is your own machine, so you simply navigate to your videos / pose files.
The selected absolute paths are sent to VAME — no file uploads.

## Development

Run the backend and the Vite dev server in two terminals:

```bash
# Terminal 1 — backend API
pip install -e .
vame-desktop --no-browser            # or: npm run backend

# Terminal 2 — frontend with hot reload (http://localhost:5173)
npm run dev
```

In dev the frontend talks to the backend at `http://localhost:8641` (override
with `VITE_API_BASE`). In production the frontend is served by Flask itself, so
requests are same-origin.

Useful scripts:

- `npm run dev` — Vite dev server (hot reload)
- `npm run build` — build the frontend into `src/services/vameApi/vame_desktop/web`
- `npm run typecheck` — TypeScript checks
- `npm run lint` / `npm run format`

## Building a distributable wheel

```bash
npm run build              # frontend -> vame_desktop/web
python -m build --wheel    # wheel bundles the built frontend
```

The resulting wheel in `dist/` can be installed anywhere with
`pip install vame_desktop-*.whl` and launched with `vame-desktop`.

## Architecture

```
vame-desktop (CLI)
  └─ Flask (waitress) on 127.0.0.1:8641
       ├─ serves the built React SPA (HashRouter)
       ├─ REST API wrapping the VAME library
       └─ /fs filesystem API for the in-app file browser
```

Frontend: React + TypeScript + Vite + styled-components + Bootstrap.
Backend: Flask + flask-restx + VAME (`vame-py`).
