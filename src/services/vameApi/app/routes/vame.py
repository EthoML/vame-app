from flask_restx import Resource
from flask import request

from . import api
from app.utils.resolve_request_util import resolve_request_data
from app.utils.get_assets import get_visualization_images
from app.utils.not_bad_request_exception import not_bad_request_exception


@api.route('/community', methods=['POST'])
class Community(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        import matplotlib
        matplotlib.use('agg')
        try:
            data, project_path = resolve_request_data(request)
            result = vame.community(
                **data,
                save_logs=True
            )
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route('/community_videos', methods=['POST'])
class CommunityVideos(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        import matplotlib
        matplotlib.use('agg')
        try:
            data, project_path = resolve_request_data(request)
            result = vame.community_videos(
                **data,
                save_logs=True
            )
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route('/visualization', methods=['POST'])
class Visualization(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        import matplotlib
        matplotlib.use('agg')
        try:
            data, project_path = resolve_request_data(request)
            vame.visualization(
                **data,
                save_logs=True
            )

            if(data["parametrization"] == "hmm"):
                return dict(result=get_visualization_images(project_path=project_path,parametrization="hmm-15"))
            else:
                return dict(result=get_visualization_images(project_path=project_path,parametrization="kmeans-15"))

        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route('/generative_model', methods=['POST'])
class GenerativeModel(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        import matplotlib
        matplotlib.use('agg')
        try:
            data, project_path = resolve_request_data(request)
            result = vame.generative_model(**data)
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))


@api.route('/gif', methods=['POST'])
class CreateGif(Resource):
    @api.doc(responses={200: "Success", 400: "Bad Request", 500: "Internal server error"})
    def post(self):
        import vame
        import matplotlib
        matplotlib.use('agg')
        try:
            data, project_path = resolve_request_data(request)
            result = vame.gif(**data)
            return dict(result=result)
        except Exception as exception:
            if not_bad_request_exception(exception):
                api.abort(500, str(exception))
