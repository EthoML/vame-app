# Migration: Electron + PyInstaller → local web app

This branch (`webapp`) removes Electron and PyInstaller and turns VAME Desktop
into a Flask-served React web app launched by a `vame-desktop` CLI command.
It also bumps VAME to 0.14.

## Why

- **PyInstaller** freezing the scientific Python stack (custom hooks for
  numpy/scipy/pynwb/hdmf/xarray/ndx_pose) was the main maintenance pain.
- **Electron + electron-builder** added a second packaging system across 4 OS
  targets.
- The app was already a local web app behind an Electron shell: the renderer
  talked to Flask over plain HTTP; Electron only added a window, native dialogs,
  process management, and auto-update.

Now it installs/runs like a normal Python package (`pip install .` →
`vame-desktop`), and the scientific deps install as ordinary wheels.

## Decisions made (locked with the user)

- Work on the existing `webapp` branch.
- Keep the `vame-desktop` command name.
- Projects stay under `~/vame-desktop/projects`.
- File-browser root (`DATA_ROOT`) defaults to the user's **home directory**.
- **Flask** for now; FastAPI deferred to a later, focused step (its payoff being
  SSE live progress + pydantic models — see "Future work").
- WSGI server: **waitress** (pure-Python, cross-platform).
- File selection: in-app **react-arborist** browser over a backend `/fs` API.
- Defer runtime/edge bugs (e.g. video codec checks) until the structure works.

## What changed

### Python package
- Renamed package `app` → **`vame_desktop`** (so the pip install doesn't ship a
  generic `app` package). All `from app.…` imports updated; relative imports
  unchanged.
- `src/services/vameApi/main.py` removed; replaced by
  `vame_desktop/cli.py` (`main()` = the `vame-desktop` entry point: ensures
  dirs, installs signal handlers, picks a port, opens the browser, serves via
  waitress).
- `vame_desktop/__init__.py` (`create_app`):
  - Serves the built React SPA from `vame_desktop/web` with an SPA fallback.
  - Swagger UI moved to `/swagger` so `/` is free for the app.
  - CORS scoped to `localhost`/`127.0.0.1` (was wide-open).
- `vame_desktop/config.py`: added `DATA_ROOT`, `DEFAULT_HOST/PORT`, and a
  `resolve_within()` path-jail helper (blocks `../` / symlink escapes).
- New `vame_desktop/routes/fs.py`: `/fs/roots`, `/fs/list` (lazy, jailed,
  optional extension filter), `/fs/reveal` (server-side "open in file manager").

### VAME 0.14 compatibility (see the audit in the PR/chat)
- `segment_session`: old `overwrite=` kwarg was removed in 0.14 → mapped the
  single UI toggle to **`overwrite_segmentation`** + **`overwrite_embeddings`**
  in `routes/pose_segmentation.py`.
- `create.schema.json`: fixed stale `required: [… "csvs"]` →
  `["name","source_software","pes_paths"]`. (The create→`init_new_project`
  param mapping was already correct: `createVAMEProject.ts` sends
  `poses_estimations`.)
- Everything else in the route layer was verified compatible with 0.14.

### Frontend
- New standalone `vite.config.ts` (replaces `electron.vite.config.ts`); builds
  to `src/services/vameApi/vame_desktop/web`. Keeps the `@renderer` alias.
- `utils/requests.ts`: rewritten from the Electron IPC proxy to a `fetch`
  layer. Same-origin (relative URLs) in production; `http://localhost:8641` in
  dev (override `VITE_API_BASE`). Preserves the `{success,data,error}` envelope
  and handles plain-text bodies (logs).
- `utils/vame.ts`: `onConnected` / `onVAMEReady` / `onProjectReady` reimplemented
  as direct backend polling (same signatures).
- `utils/folders.ts`: `open()` now POSTs `/fs/reveal` (was Electron
  `shell.openPath`).
- `components/DynamicForm/FileSelector.tsx`: replaced the native `<input
  type=file>` (which used the Electron-only `File.path`) with a **react-arborist**
  tree over `/fs`. Same props, same react-hook-form value (array of absolute
  server paths), so `DynamicForm`/create/config flows are unchanged.
- `context/Projects/index.tsx`: `getAssetsPath` now uses `API_BASE` instead of a
  hardcoded `http://localhost:8641`, so video/image URLs are same-origin in prod.

### Packaging / repo
- Added `pyproject.toml` (console script `vame-desktop = vame_desktop.cli:main`;
  bundles `vame_desktop/web` as package data). All Python deps live here now
  (dropped pyinstaller, added waitress, `vame-py>=0.14,<0.15`).
- Removed `requirements.txt`; the `environment-*.yml` files now `pip install -e .`
  so dependencies come from `pyproject.toml` (single source of truth).
- `package.json`: removed all Electron/electron-builder/electron-vite deps and
  `axios`; added `react-arborist` + `@typescript-eslint/*`; new scripts
  (`dev`/`build`/`preview`/`backend`).
- `tsconfig.json` rewritten standalone (dropped `@electron-toolkit` configs;
  removed `tsconfig.node.json`, `tsconfig.web.json`).
- `.eslintrc.cjs` simplified (no electron-toolkit presets).
- Deleted: `src/main/`, `src/preload/`, `main.spec`, `electron-builder.yml`,
  `electron.vite.config.ts`, `resources/python/hooks/`, `src/index.d.ts`, and the
  8 Electron CI workflows. Added one `.github/workflows/build.yml` that builds
  the frontend + a Python wheel.
- Removed `.python-version` (redundant — the version is pinned by
  `pyproject.toml`'s `requires-python` and the `environment-*.yml` files).
- `environment-*.yml` → python 3.12; cleared the electron-mirror `.npmrc`.

## Known limitations / things to watch (deferred on purpose)

1. **Video codec** — not addressed yet. If `vame.motif_videos` /
   `community_videos` emit OpenCV `mp4v` (MPEG-4 Part 2), browsers won't play
   them (black box). Check the codec; re-encode to H.264 server-side if needed.
2. **react-arborist integration** is written but untested. Likely tweak points:
   the lazy `onToggle` loading (placeholder-child trick to force the expander),
   selection vs. expand click handling, and `Tree` `width="100%"`. Verify in the
   browser and adjust the renderer if selection/expansion feels off.
3. **`generative_model` / `gif` routes** (`routes/vame.py`) are dead — they pass
   `**data` (with `config` as a *path string*) into 0.14 functions that want a
   config dict + `segmentation_algorithm`. Not wired into the UI. Remove or fix
   later.
4. **`/settings` endpoint** still doesn't exist (pre-existing). The Settings page
   falls back to schema defaults. Out of scope here.
5. **`load_project` asset discovery** is still stubbed (empty video/image dicts),
   as it was before. Videos/images are fetched on demand by the tabs. Implementing
   real discovery against 0.14 output paths is a separate task.
6. **Single-user assumption** remains (threaded background jobs, one global
   projects dir). Fine for local use. Multi-user/remote needs a job queue + auth
   (future).
7. **`memory-bank/`** still describes the old Electron architecture — it predates
   this migration and should be refreshed.

## Future work (explicitly out of scope for this branch)

- FastAPI migration, whose real payoff is replacing the polling (training/log)
  with **SSE/WebSocket live progress** and adding pydantic request models aligned
  with VAME's own schemas.
- Server-side file-browser auth + per-user scoping for shared/remote deployments
  (the `/fs` jail is already in place; auth is the missing piece).
- A friendlier installer/launcher for non-Python users (pipx/conda one-liner).

## Test checklist (when you're back)

Build & launch:
- [ ] `npm install && npm run build` produces `src/services/vameApi/vame_desktop/web/index.html`.
- [ ] `pip install -e .` then `vame-desktop` starts and opens the browser at the app.
- [ ] `python -m build --wheel` produces a wheel; installing it elsewhere + `vame-desktop` works.

Core flows (against VAME 0.14 + `testing/` data):
- [ ] Home lists/creates/deletes projects; recent projects work.
- [ ] **Create**: the react-arborist browser lets you select pose files (+videos);
      project is created; navigates to the project page.
- [ ] Preprocessing runs; preprocessing images show.
- [ ] Create trainset → train (live polling state) → evaluate; model images show.
- [ ] **Segment** (verify the `overwrite_segmentation`/`overwrite_embeddings` fix).
- [ ] Motif videos generate and **play in the browser** (codec!).
- [ ] Community analysis + community videos + report + UMAP images.
- [ ] "Open in File Explorer" opens the OS file manager (local run).
- [ ] Logs stream in the terminal modal.

Dev workflow:
- [ ] `vame-desktop --no-browser` + `npm run dev` → UI at :5173 talks to API at :8641.
