from pathlib import Path
import threading
import time
from flask_restx import Resource
from flask import request, jsonify
import base64
import vame

from . import api
from app.utils.resolve_request_util import resolve_request_data
from app.utils.not_bad_request_exception import not_bad_request_exception


@api.route("/report", methods=["POST", "GET"])
class Report(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        def background_task(config: dict):
            vame.visualization.generate_reports(config=config)

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            thread = threading.Thread(
                target=background_task,
                kwargs={"config": config},
            )
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
        project_path = request.args.get("project")
        session = request.args.get("session")
        segmentation_algorithm = request.args.get("segmentation_algorithm")
        if not project_path or not segmentation_algorithm:
            api.abort(400, "Missing 'project' or 'segmentation_algorithm'")
        try:
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            n_clusters = config.get("n_clusters")
            model_name = config.get("model_name")
            file_path = (
                Path(project_path)
                / "reports"
                / f"community_motifs_{session}_{model_name}_{segmentation_algorithm}-{n_clusters}.png"
            )
            if file_path.exists():
                content = base64.b64encode(file_path.read_bytes()).decode()
                report_image = {"filename": file_path.name, "content": content}
                return {"report_image": report_image}
            else:
                api.abort(400, f"Image file '{file_path}' not found")
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))