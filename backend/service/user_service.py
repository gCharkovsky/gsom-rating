#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from flask import Blueprint, request, session, jsonify

from backend.db.user_db import *
from backend.service.auth_service import login_required

user = Blueprint('user', __name__)


@user.route('/course_list/<string:course>', methods=['GET'])
def course_list(course):
    return jsonify(get_public_users_by_course(course))


@user.route('/profile/<string:login>', methods=['GET'])
def profile(login):
    return jsonify(get_user_by_login(login))


@user.route('/me', methods=['GET'], endpoint='me')
@login_required
def me():
    return jsonify(session['user'].jsonify())


@user.route('/update', methods=['POST'], endpoint='update_profile')
@login_required
def update_profile():
    user = session['user']
    for field in ['username', 'priorities', 'is_public', 'score_second_lang']:
        if field in request.form:
            setattr(user, field, request.form[field])

    db.session.commit()
    return jsonify({'status': None})


@user.route('/update_st', methods=['POST'], endpoint='update_st')
@login_required
def update_st():
    user = session['user']
    st_login = request.form['st-login']
    password = request.form['password']
    if not st_login or not password:
        return jsonify({'error': 'Not enough credentials data'})
    else:
        user.st_login = st_login
        user.st_password = password

        db.session.commit()
        return jsonify({'status': None})
