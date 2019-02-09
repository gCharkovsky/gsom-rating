from flask import Blueprint, g, jsonify

from backend.db.user_db import get_user_by_login, get_public_users_by_course
from backend.service.auth_service import login_required

user = Blueprint('user', __name__)


@user.route('/course_list/<string:course>', methods=['GET'])
def course_list(course):
    return jsonify(get_public_users_by_course('course'))  # TODO: смотреть get_users_by_course


@user.route('/me', methods=['GET'])
@login_required
def me():
    return jsonify({'id': 13, 'login': g.user, 'message': 'it works!'})  # TODO: Необхдимая инфа: id, course


@user.route('/<string:login>', methods=['GET'])
def profile(login):
    return jsonify(get_user_by_login(login))


@user.route('/update', methods=['POST'])
# @login_required TODO: понять, почему появление этой строчки крашит запуск
def update_profile():
    return jsonify({'message': 'success'})  # TODO: изменить свойства юзера, ПРОВЕРИТЬ СООТВЕТСВИЕ ЛОГИНА ТОКЕНУ
    # TODO: свойства: username, priorities, is_public, score_second_lang


@user.route('/update_st', methods=['POST'])
# @login_required
def update_st():
    return jsonify({'message': 'success'})  # TODO: на входе вместе с st-паролем, ПРОВЕРИТЬ СООТВЕТСВИЕ ЛОГИНА ТОКЕНУ
    # TODO: проверить валидность через спбгу
