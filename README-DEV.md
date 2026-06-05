# Development

Run the **Vite frontend** and the **Flask backend** in two terminals, both with hot reload.

## Setup (once)

```bash
conda env create -f environment-mac-arm.yml   # or: mac-x86 / linux / win
conda activate vame-desktop
pip install -e .       # editable install — Python edits are live after restart
npm install
```

## Run (two terminals)

**Terminal 1 — Frontend** (HMR, open this URL in your browser)

```bash
npm run dev            # http://localhost:5173
```

**Terminal 2 — Backend** (auto-restarts on .py changes)

```bash
VAME_PORT=8641 flask --app vame_desktop:create_app run --port 8641 --reload --debug
```

The frontend (5173) talks to the backend (8641) over CORS. **Use http://localhost:5173 during development**, not 8641.
