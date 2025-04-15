from pathlib import Path
from flask_restx import Resource
from flask import request, jsonify
import vame

from . import api
from app.utils.resolve_request_util import resolve_request_data
from app.utils.get_assets import get_evaluation_images
from app.utils.not_bad_request_exception import not_bad_request_exception


@api.route("/create_trainset", methods=['POST'])
class CreateTrainset(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            result = vame.create_trainset(
                config=config,
                test_fraction=data["test_fraction"],
                split_mode=data["split_mode"],
                save_logs=True,
            )
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route('/train', methods=['POST'])
class TrainModel(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import threading
        import time

        def background_train_task(data, project_path, config):
            # print(data)
            # time.sleep(20)
            config["batch_size"] = data["batch_size"]
            config["max_epochs"] = data["max_epochs"]
            vame.write_config(
                config_path=str(Path(project_path) / "config.yaml"),
                config=config,
            )
            vame.train_model(config=config, save_logs=True)

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            thread = threading.Thread(target=background_train_task, args=(data, project_path, config))
            thread.start()
            time.sleep(2)  # Give the thread a moment to start
            return {"status": "started"}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route('/train_state', methods=['POST'])
class TrainState(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            states = vame.read_states(config=config)
            train_model_state = states.get("train_model", {}).get("execution_state", "not_found")
            return dict(train_model=train_model_state)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route('/evaluate', methods=['POST'])
class EvaluateModel(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            vame.evaluate_model(
                config=config,
                save_logs=True,
            )
            return dict(result=get_evaluation_images(project_path))
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
