#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from flask import Blueprint, request, session, jsonify

from backend.db.user_db import *
from backend.service.auth_service import login_required
from backend.service.spbu_service import array_load

user = Blueprint('user', __name__)


@user.route('/course_list/<string:course>', methods=['GET'])
def course_list(course):
    return jsonify(get_public_users_by_course(course))


@user.route('/profile/<string:login>', methods=['GET'])
def profile(login):
    return jsonify(get_user_by_login(login))


@user.route('/me', methods=['POST'], endpoint='me')
@login_required
def me():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    return jsonify(user.jsonify())


@user.route('/update', methods=['POST'], endpoint='update_profile')
@login_required
def update_profile():
    user_id = session['user_id']
    user = get_user_by_id(user_id)

    for field in ['username', 'priorities', 'is_public', 'score_second_lang']:
        if field in request.form:
            setattr(user, field, request.form[field])

    db.session.commit()
    return jsonify({'status': None})


@user.route('/update_st', methods=['POST'], endpoint='update_st')
@login_required
def update_st():
    user_id = session['user_id']
    user = get_user_by_id(user_id)
    st_login = request.form.get('st_login')
    password = request.form.get('password')

    if not st_login or not password:
        return jsonify({
            'status': 'Not enough data to authorize at my.spbu.ru',
        })
    else:
        user.st_login = st_login
        user.st_password = password

        marks = array_load()
        scores, cnt = 0, 0
        for term in marks:
            for k, v in term:
                mark = user.scores.query.filter_by(subject_id=subject_db.get_subject_by_name(k).id) #TODO: запись в бд
                if mark.is_relevant and str(mark.mark[1]).isnumeric():
                    cnt += 1
                    scores += mark.mark[1]
        user.gpa = scores / cnt

        db.session.commit()
        return jsonify({
            'marks': marks,
            'gpa': user.gpa,
        })
