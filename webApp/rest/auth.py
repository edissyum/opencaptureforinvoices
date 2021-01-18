from flask import Blueprint, request, make_response, jsonify
from ..controllers import auth


bp = Blueprint('auth', __name__, url_prefix='/ws/')


@bp.route('auth/login', methods=['POST'])
def login():
    data = request.json
    res = auth.login(data['username'], data['password'], data['lang'])
    return make_response(jsonify(res[0])), res[1]


@bp.route('auth/register', methods=['POST'])
def register():
    data = request.json
    res = auth.register(data['username'], data['password'], data['firstname'], data['lastname'], data['lang'])
    return make_response(jsonify(res[0])), res[1]
