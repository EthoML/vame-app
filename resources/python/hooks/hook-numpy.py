# from PyInstaller import log as logging
# from PyInstaller import compat
# from os import listdir

# from PyInstaller.utils.hooks import collect_submodules, collect_data_files

# hiddenimports = collect_submodules("numpy")
# datas = collect_data_files("numpy", subdir="core")

# libdir = compat.base_prefix + "/lib"
# mkllib = filter(lambda x: x.startswith("libmkl_"), listdir(libdir))
# if mkllib != []:
#     logger = logging.getLogger(__name__)
#     logger.info("MKL installed as part of numpy, importing that!")
#     binaries = map(lambda l: (libdir + "/" + l, "."), mkllib)

# # --------- new hook -----------------
# from PyInstaller.utils.hooks import (
#     collect_submodules,
#     collect_data_files,
#     copy_metadata,
# )
# from PyInstaller import compat
# from pathlib import Path

# hiddenimports = collect_submodules("numpy")

# # NumPy’s binaries and data
# datas = collect_data_files("numpy", subdir="core")

# # Wheel metadata  → fixes PackageNotFoundError
# datas += copy_metadata("numpy")

# # Optional MKL shared libraries
# libdir = Path(compat.base_prefix) / "lib"
# binaries = [
#     (str(p), ".")
#     for p in libdir.iterdir()
#     if p.name.startswith("libmkl_")
# ]
