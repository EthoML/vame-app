"""
Make ndx_pose extension schema available in a frozen (PyInstaller) build.

We copy the YAML files into the root-level `spec/` directory
because ndx_pose/__init__.py expects them there when the program is frozen.
"""
from pathlib import Path
from PyInstaller.utils.hooks import get_package_paths

pkg_base, _ = get_package_paths("ndx_pose")
spec_dir = Path(pkg_base) / "ndx_pose" / "spec"

datas = [
    (spec_dir / "ndx-pose.namespace.yaml", "spec"),
    (spec_dir / "ndx-pose.extensions.yaml", "spec"),
]
# The following is a workaround for PyInstaller not being able to find the
# ndx_pose namespace YAML files when the program is frozen.
# The files are copied to the root-level `spec/` directory, so we need to
# include them in the `datas` list.