from pathlib import Path
from flask_restx import Resource
from flask import request, jsonify
from . import api
import vame

from app.utils.resolve_request_util import resolve_request_data
from app.utils.not_bad_request_exception import not_bad_request_exception


@api.route('/preprocessing', methods=['POST'])
class Preprocess(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        try:
            data, project_path = resolve_request_data(request)
            config = vame.auxiliary.read_config(str(Path(project_path) / "config.yaml"))
            # vame.preprocessing(
            #     config=config,
            #     centered_reference_keypoint=data["centered_reference_keypoint"],
            #     orientation_reference_keypoint=data["orientation_reference_keypoint"],
            #     run_lowconf_cleaning=data["run_lowconf_cleaning"],
            #     run_egocentric_alignment=data["run_egocentric_alignment"],
            #     run_outlier_cleaning=data["run_outlier_cleaning"],
            #     run_savgol_filtering=data["run_savgol_filtering"],
            #     run_rescaling=data["run_rescaling"],
            #     save_logs=False,
            # )
            print("Preprocessing:")
            print(data)
            return jsonify(dict(result='success'))

        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
