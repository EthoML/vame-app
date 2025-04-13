from pathlib import Path
from flask_restx import Resource
from flask import request, jsonify

from . import api
from app.utils.resolve_request_util import resolve_request_data
from app.utils.get_assets import get_evaluation_images
from app.utils.not_bad_request_exception import not_bad_request_exception


@api.route("/create_trainset", methods=['POST'])
class CreateTrainset(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame

        try:
            data, project_path = resolve_request_data(request)
            config = vame.auxiliary.read_config(str(Path(project_path) / "config.yaml"))
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
        import vame
        try:
            data, project_path = resolve_request_data(request)

            result = vame.train_model(
                **data,
                save_logs=True
            )
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route('/evaluate', methods=['POST'])
class EvaluateModel(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        import matplotlib
        matplotlib.use('agg')
        try:
            data, project_path = resolve_request_data(request)
            vame.evaluate_model(
                **data,
                save_logs=True
            )
            return dict(result=get_evaluation_images(project_path))
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
