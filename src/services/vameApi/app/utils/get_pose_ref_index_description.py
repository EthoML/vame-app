from typing import Tuple, Dict
import xarray as xr
import os
import traceback
import portalocker
import tempfile

# Simple in-memory cache: {file_path: (keypoints_string, len_keypoints, last_modified_time)}
_cache: Dict[str, Tuple[str, int, float]] = {}


def get_pose_ref_index_description(ds_path: str) -> Tuple[str, int]:
    print(f"[DEBUG] Attempting to load dataset: {ds_path}")
    if not os.path.exists(ds_path):
        print(f"[ERROR] File does not exist: {ds_path}")
        raise FileNotFoundError(f"File does not exist: {ds_path}")

    # Create a lock file path based on the dataset path
    lock_path = os.path.join(tempfile.gettempdir(), f"vame_lock_{hash(ds_path)}")

    print(f"[DEBUG] Acquiring lock for: {ds_path}")
    with portalocker.Lock(lock_path, mode="w", flags=portalocker.LOCK_EX, timeout=30) as _:
        print(f"[DEBUG] Lock acquired for: {ds_path}")

        current_mtime = os.path.getmtime(ds_path)
        if ds_path in _cache:
            cached_keypoints_string, cached_len, cached_mtime = _cache[ds_path]
            if current_mtime <= cached_mtime:
                print(f"[DEBUG] Using cached result for: {ds_path}")
                print(f"[DEBUG] Lock released for: {ds_path}")
                return (cached_keypoints_string, cached_len)

        try:
            file_size = os.path.getsize(ds_path)
            print(f"[DEBUG] File size: {file_size} bytes")
            with xr.open_dataset(ds_path, engine="netcdf4") as tmp_ds:
                ds_in_memory = tmp_ds.load()  # read entire file into memory
            keypoints = ds_in_memory.keypoints.data
            # keypoints = ["ks1", "ks2", "ks3"]  # Placeholder for actual keypoints data
        except Exception as e:
            print(f"[ERROR] Error loading dataset: {e}")
            traceback.print_exc()
            print(f"[DEBUG] File permissions: {oct(os.stat(ds_path).st_mode)}")
            print(f"[DEBUG] Current working directory: {os.getcwd()}")
            print(f"[DEBUG] Lock released for: {ds_path}")
            raise  # Re-raise the original exception to preserve traceback

        # Create the string based on keypoints
        keypoints_string = ", ".join([f"{i}-{part}" for i, part in enumerate(keypoints)])
        result = (keypoints_string, len(keypoints) - 1)

        # Cache the result
        _cache[ds_path] = (keypoints_string, len(keypoints) - 1, current_mtime)
        print(f"[DEBUG] Cached result for: {ds_path}")
        print(f"[DEBUG] Lock released for: {ds_path}")

        return result
