from typing import Tuple
from vame.io.load_poses import load_vame_dataset


def get_pose_ref_index_description(ds_path: str) -> Tuple[str, int]:
    ds = load_vame_dataset(ds_path=ds_path)
    keypoints = ds.keypoints.data

    # Create the string based on keypoints
    keypoints_string = ", ".join([f"{i}-{part}" for i, part in enumerate(keypoints)])

    return (keypoints_string, len(keypoints) - 1)
