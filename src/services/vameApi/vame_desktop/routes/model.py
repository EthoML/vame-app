from pathlib import Path
import threading
import time
from flask_restx import Resource
from flask import request, jsonify
import base64
import vame

from . import api
from vame_desktop.utils.resolve_request_util import resolve_request_data
from vame_desktop.utils.not_bad_request_exception import not_bad_request_exception


@api.route("/create-trainset", methods=["POST"])
class CreateTrainset(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
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


@api.route("/train", methods=["POST"])
class TrainModel(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        def background_task(data, project_path, config):
            config["batch_size"] = data["batch_size"]
            config["max_epochs"] = data["max_epochs"]
            vame.write_config(
                config_path=str(Path(project_path) / "config.yaml"),
                config=config,
            )
            vame.train_model(config=config, save_logs=True)
            vame.visualization.plot_loss(
                config=config,
                model_name=config["model_name"],
                save_to_file=True,
                show_figure=False,
            )

        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            thread = threading.Thread(
                target=background_task, args=(data, project_path, config)
            )
            thread.start()
            time.sleep(2)  # Give the thread a moment to start
            return {"status": "started"}
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/evaluate", methods=["POST"])
class EvaluateModel(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))

            model_name = config["model_name"]
            project_name = config["project_name"]
            best_model = (
                Path(project_path)
                / "model"
                / "best_model"
                / f"{model_name}_{project_name}.pkl"
            )
            if not best_model.exists():
                api.abort(
                    400,
                    "No trained model was found "
                    f"('{best_model.name}' is missing). Training likely ran for too "
                    "few epochs to save a best model — the model is only saved once "
                    "KL annealing completes (around epoch kl_start + annealtime). "
                    "Increase 'max_epochs' (or lower 'annealtime'/'kl_start') and "
                    "re-run training.",
                )

            vame.evaluate_model(
                config=config,
                save_logs=True,
            )
            return dict(result="success")
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route("/model-images", methods=["POST"])
class ModelImages(Resource):
    @api.doc(
        responses={200: "Success", 400: "Bad Request", 500: "Internal server error"}
    )
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.read_config(str(Path(project_path) / "config.yaml"))
            model_name = config["model_name"]
            images_path = Path(project_path) / "model" / "evaluate"
            images_content = dict()
            if (images_path / f"mse_and_kl_loss_{model_name}.png").exists():
                with open(
                    images_path / f"mse_and_kl_loss_{model_name}.png", "rb"
                ) as image_file:
                    images_content["mse_and_kl_loss"] = base64.b64encode(
                        image_file.read()
                    ).decode("utf-8")
            if (images_path / "future_reconstruction.png").exists():
                with open(
                    images_path / "future_reconstruction.png", "rb"
                ) as image_file:
                    images_content["future_reconstruction"] = base64.b64encode(
                        image_file.read()
                    ).decode("utf-8")

            return jsonify(images_content)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
