from flask import Blueprint, g, jsonify

from backend.db.user_db import get_user_by_login
from backend.service.auth_service import login_required

user = Blueprint('user', __name__)


@user.route('/me', methods=['GET'])
@login_required
def me():
    return jsonify({'login': g.user, 'message': 'it works!'})


@user.route('/<string:login>', methods=['GET'])
def profile(login):
    return jsonify(get_user_by_login(login))
