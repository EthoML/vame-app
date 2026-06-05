from pathlib import Path
import threading
import time
import base64
from flask_restx import Resource
from flask import request
import vame

from . import api
from vame_desktop.utils.resolve_request_util import resolve_request_data
from vame_desktop.utils.not_bad_request_exception import not_bad_request_exception


@api.route("/segment", methods=["POST"])
class Segment(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        def background_task(config: dict, overwrite: bool):
            # VAME 0.14 split the old `overwrite` flag into two; the UI exposes a
            # single toggle, so map it to both segmentation and embeddings.
            vame.segment_session(
                config=config,
                overwrite_segmentation=overwrite,
                overwrite_embeddings=overwrite,
                save_logs=True,
            )

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            config["n_clusters"] = data["n_clusters"]
            overwrite = data["overwrite"]
            vame.write_config(
                config_path=str(Path(project_path) / "config.yaml"),
                config=config,
            )
            thread = threading.Thread(
                target=background_task,
                kwargs={"config": config, "overwrite": overwrite},
            )
            thread.start()
            time.sleep(2)
            return {"status": "started"}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/motif-videos", methods=["POST", "GET"])
class MotifVideos(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        def background_task(config: dict):
            vame.motif_videos(
                config=config,
                save_logs=True,
            )

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            thread = threading.Thread(target=background_task, kwargs={"config": config})
            thread.start()
            time.sleep(2)
            return {"status": "started"}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))

    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def get(self):
        project = request.args.get("project")
        segmentation_algorithm = request.args.get("segmentation_algorithm")
        session = request.args.get("session")
        if not project or not segmentation_algorithm or not session:
            api.abort(400, "Missing 'project', 'segmentation_algorithm', or 'session'")
        try:
            config = vame.read_config(str(Path(project) / "config.yaml"))
            n_clusters = config.get("n_clusters")
            model_name = config.get("model_name")
            sessions = config.get("session_names", [])

            # Validate session exists in project
            if session not in sessions:
                api.abort(400, f"Session '{session}' not found in project")

            videos = []
            dir_path = (
                Path(project)
                / "results"
                / session
                / model_name
                / f"{segmentation_algorithm}-{n_clusters}/cluster_videos"
            )
            if dir_path.exists():
                for file_path in dir_path.glob("*.mp4"):
                    content = base64.b64encode(file_path.read_bytes()).decode()
                    videos.append({"filename": file_path.name, "content": content})
            return {"videos": videos}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
