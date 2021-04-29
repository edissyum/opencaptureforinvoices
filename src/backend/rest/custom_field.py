from flask import Blueprint, request, make_response, jsonify
from ..controllers.auth import token_required
from ..controllers.custom_field import *

import json

bp = Blueprint('custom_field', __name__, url_prefix='/ws/')


@bp.route('customFields/list', methods=['GET'])
@token_required
def retrieve_fields():
    res = retrieve_custom_fields({})
    print(res[0])
    return make_response(jsonify(res[0])), res[1]


@bp.route('customFields/add', methods=['POST'])
@token_required
def add_field():
    data = request.data
    data = json.loads(data)
    res = add_custom_field(data)
    return make_response(jsonify(res[0])), res[1]


@bp.route('customFields/update', methods=['POST'])
@token_required
def update_custom_field():
    data = request.data
    data = json.loads(data)
    res = update(data)
    return make_response(jsonify(res[0])), res[1]
