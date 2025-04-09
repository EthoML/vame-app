# VAME Desktop Technical Context

## Technologies Used

### Frontend

- **Electron**: Cross-platform desktop application framework (v28.2.0)
- **React**: UI library for component-based development (v18.2.0)
- **TypeScript**: Typed JavaScript for improved developer experience and code quality
- **Vite**: Modern build tool for fast development and optimized production builds
- **React Router**: Client-side routing for single-page application (v6.23.1)
- **Styled Components**: CSS-in-JS styling solution (v6.1.11)
- **Bootstrap**: CSS framework for responsive design (v5.3.3)
- **React Hook Form**: Form state management and validation (v7.52.1)
- **Font Awesome**: Icon library (v6.5.2)
- **Tippy.js**: Tooltip library (v4.2.6)
- **Axios**: HTTP client for API requests (v1.7.2)

### Backend

- **Flask**: Python web framework (v3.0.3)
- **Flask-CORS**: Cross-origin resource sharing support
- **Flask-RESTX**: API framework for Flask with Swagger documentation
- **NumPy**: Numerical computing library (v1.26.4)
- **VAME-py**: Variational Animal Motion Encoding library (v0.4.0)
- **PyInstaller**: Tool to bundle Python applications (v6.8.0)

### Build & Development

- **electron-vite**: Integration of Vite with Electron
- **electron-builder**: Packaging and distribution tool for Electron applications
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## Development Setup

### Prerequisites

- **Node.js**: Version 20 or higher
  - Can be managed with nvm (Node Version Manager) or n
- **Python**: Version specified in `.python-version`
  - Can be managed with pyenv or conda

### Environment Setup

#### Python Environment

**Option 1: With pyenv**
```bash
pyenv local
python -m venv venv
source ./venv/bin/activate  # Unix
.\venv\Scripts\activate.bat  # Windows
python -m pip install -r requirements.txt
```

**Option 2: With conda**
```bash
conda env create -f environment.yml
conda activate vame-desktop
```

#### Node.js Environment

```bash
npm install
```

### Development Workflow

- **Start Development Server**: `npm run dev`
- **Type Checking**:
  - Node: `npm run typecheck:node`
  - Web: `npm run typecheck:web`
  - Both: `npm run typecheck`
- **Linting**: `npm run lint`
- **Formatting**: `npm run format`

### Building

- **Build Python Backend**: `npm run build:python`
- **Build Electron App**: `npm run build:electron`
- **Build Complete App**: `npm run build`
- **Platform-Specific Builds**:
  - Windows: `npm run build:win`
  - macOS: `npm run build:mac`
  - Linux: `npm run build:linux`

## Technical Constraints

### Cross-Platform Compatibility

- Must run on Windows, macOS (Intel and ARM), and Linux
- UI must be consistent across platforms
- Installation process must be straightforward on all platforms

### Python Integration

- Python backend must be bundled with the application
- VAME library dependencies must be properly packaged
- Communication between JavaScript and Python must be reliable

### Performance

- Must handle large video files and datasets
- Machine learning operations can be computationally intensive
- UI must remain responsive during background processing

### Security

- Context isolation in Electron for renderer process
- Secure IPC communication between main and renderer processes
- Validation of all user inputs and API parameters

### Packaging

- Application size should be reasonable despite bundling Python
- Updates should be efficient (only download changed components)
- Installation should not require administrator privileges when possible

## Dependencies

### Frontend Dependencies

```json
{
  "dependencies": {
    "@electron-toolkit/preload": "^3.0.0",
    "@electron-toolkit/utils": "^3.0.0",
    "@fortawesome/fontawesome-svg-core": "^6.5.2",
    "@fortawesome/free-solid-svg-icons": "^6.5.2",
    "@fortawesome/react-fontawesome": "^0.2.2",
    "@tippyjs/react": "^4.2.6",
    "axios": "^1.7.2",
    "bootstrap": "^5.3.3",
    "electron-updater": "^6.1.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.52.1",
    "react-router-dom": "^6.23.1",
    "styled-components": "^6.1.11"
  }
}
```

### Development Dependencies

```json
{
  "devDependencies": {
    "@electron-toolkit/eslint-config-prettier": "^2.0.0",
    "@electron-toolkit/eslint-config-ts": "^1.0.1",
    "@electron-toolkit/tsconfig": "^1.0.1",
    "@types/node": "^18.19.9",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "electron": "^28.2.0",
    "electron-builder": "^24.9.1",
    "electron-vite": "^2.0.0",
    "eslint": "^8.56.0",
    "eslint-plugin-react": "^7.33.2",
    "prettier": "^3.2.4",
    "typescript": "^5.3.3",
    "vite": "^5.0.12"
  }
}
```

### Python Dependencies

```
Flask==3.0.3
Flask-Cors==4.0.1
flask-restx==1.3.0
numpy==1.26.4
pyinstaller==6.8.0
pyinstaller-hooks-contrib==2024.6
vame-py==0.4.0
```

## External Requirements

- **ffmpeg**: Required for some image functions (like UMAP images)
  - Must be installed separately and available in the system PATH

## File Structure

- **`src/main/`**: Electron main process code
- **`src/preload/`**: Preload scripts for secure context bridging
- **`src/renderer/`**: React frontend code
- **`src/schema/`**: JSON Schema definitions for forms and validation
- **`src/services/vameApi/`**: Python Flask backend
- **`resources/`**: Application resources (icons, Python hooks)
- **`testing/`**: Test data and files
