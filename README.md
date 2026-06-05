# VAME Desktop
A desktop application for the Variational Animal Motion Encoding (VAME) project.

<!-- ![VAME-Desktop](https://github.com/user-attachments/assets/1b834650-14f5-4dff-8ba0-b29f18178337) -->


## Installation

You can find installers for VAME Desktop on the [release page](https://github.com/catalystneuro/vame-desktop/releases).

### Requirement:

For some functionalities, [ffmpeg](https://www.ffmpeg.org/) might be needed. You can download it from: https://www.ffmpeg.org/download.html

### MacOS
> For M-series Macs, download the -arm64.dmg. For Intel Macs, download the -x64.dmg.

Open the `vame-desktop-<VERSION>-macos-arm64.dmg` or `vame-desktop-<VERSION>-macos-x64.dmg`, and drag and drop the `VAME Desktop` into the `Applications` folder.

Then go to `Applications` in Finder:
![Finder](https://github.com/user-attachments/assets/87c1de95-0a61-455d-8582-71ed2958c649)

Hold `Control ^` on the keyboard, then click open. In the following window, click on open again. This process needs to be done once. After that, the app can be opened from Launchpad as usual.

### Windows

Double-click on `vame-desktop-<VERSION>-win-setup.exe`. The app will be installed and a shortcut named `VAME Desktop` will be added to your Desktop. Double-click on it to launch the app.

### Linux Debian

To install it from the terminal:
```sh
sudo dpkg -i vame-desktop-<VERSION>-ubuntu24.deb
```

The executable will be added to the main applications folder on your Linux distribution.


## Development mode

### Setup

Pre-requisites:
- [git](https://git-scm.com/)
- [Node.js 18](https://nodejs.org/en/) or higher
- [Python 3.8+](https://www.python.org/downloads/) or higher
- [conda](https://docs.conda.io/en/latest/) or [anaconda](https://www.anaconda.com/products/distribution)
- [ffmpeg](https://www.ffmpeg.org/) (might be needed for some functionalities)

To run the app in development mode, you will need to clone the repository:
```bash
git clone https://github.com/EthoML/vame-desktop.git
cd vame-desktop
```

Create the Conda environment for the project, which will install all the necessary Python dependencies:

```bash
conda env create -f environment-<os>.yml
```

Once complete, activate the environment by running the following command:
```bash
conda activate vame-desktop
```

Install Node modules by running the following command:
```bash
npm install
```

### Running the App
To run the Electron app in development mode, run the following command:
```bash
npm run dev
```

### Build

The build process will create a `.exe`, `.dmg` or `.deb`, depending on the OS.

MacOS
```bash
npm run build:mac
```

Windows
```bash
npm run build:win
```

Linux Debian
```bash
npm run build:linux
```

### Publish

Publishing will happen every time a new push is maded to the `main` branch with a tag associated, creating a release at [release page](https://github.com/catalystneuro/vame-desktop/releases).

To avoid unecessary releases, follow these steps:
- Create a branch `git checkout -b <branch_name>`, work on it, and create a pull request to `main`.
- Update the `package.json` with the new version number.
- Create a new tag with `git tag v<tag_number>`, push it to the repo with `git push orgin --tags`. **IMPORTANT**: the tag must be in the format `vX.Y.Z` where `X.Y.Z` is the package version number in `package.json`.
- Create a draft release on github using the tag created.
- Merge the PR from `<branch_name>` into `main`. The github action will publish the executable assets to the draft release.
- Manually edit the draft release, add information about the new features, bug fixes, and breaking changes.
- Finally, approve and publish the new release.

