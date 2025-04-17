from pathlib import Path
import threading
import time
from flask_restx import Resource
from flask import request
import vame

from . import api
from app.utils.resolve_request_util import resolve_request_data
from app.utils.not_bad_request_exception import not_bad_request_exception


@api.route('/segment', methods=['POST'])
class Segment(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        def background_task(config: dict, overwrite: bool):
            vame.segment_session(
                config=config,
                overwrite=overwrite,
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
            time.sleep(2)  # Give the thread a moment to start
            return {"status": "started"}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route('/motif-videos', methods=['POST'])
class MotifVideos(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
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
