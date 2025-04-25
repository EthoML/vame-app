"""
Include the HTML/CSS/JS assets that live in xarray/static
so that `importlib.resources.files("xarray.static")` works
inside a PyInstaller bundle.
"""
from pathlib import Path
from PyInstaller.utils.hooks import get_package_paths

pkg_base, _ = get_package_paths("xarray")
static_dir = Path(pkg_base) / "xarray" / "static"

# copy the whole directory into the frozen archive under xarray/static
datas = [(static_dir, "xarray/static")]
