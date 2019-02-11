#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from flask import Blueprint, request, session, jsonify

from backend.db.user_db import User, UserSubject, UserTrack
from backend.db.subject_db import *
from backend.service.auth_service import login_required
from backend.service.spbu_service import load_marks_as_array, load_course_as_dict

user = Blueprint('user', __name__)


@user.route('/course_list/<string:course>', methods=['GET'])
def course_list(course):
    return jsonify(User.get_all(course=course, is_public=True)) # TODO: выводить только публичную инфу о юзере: id, course, gpa, priorities


@user.route('/profile/<string:login>', methods=['GET'])
def profile(login):
    return jsonify(User.get_one(login=login))


@user.route('/me', methods=['POST'], endpoint='me')
@login_required
def me():
    id = session['user_id']
    user = User.get_one(id=id)
    return jsonify(user)


@user.route('/update', methods=['POST'], endpoint='update_profile')
@login_required
def update_profile():
    id = session['user_id']
    user = User.get_one(id=id)

    for field in ['username', 'priorities', 'is_public', 'score_second_lang']:
        if field in request.form:
            setattr(user, field, request.form[field])

    db.session.commit()
    return jsonify({'status': None})


def calculate_gpa():  # TODO: Выполнить подсчет GPA с учетом флага на второй иностранный без подключения к СПбГУ
    return 0

@user.route('/update_st', methods=['POST'], endpoint='update_st')
@login_required
def update_st():
    id = session['user_id']
    user = User.get_one(id=id)
    st_login = request.form.get('st_login')
    password = request.form.get('password')

    mark_values = {
        'A': 5,
        'B': 4.5,
        'C': 4,
        'D': 3.5,
        'E': 3,
        'F': 0,
        '5A': 5,
        '5B': 4.7,
        '4B': 4.3,
        '4C': 4,
        '4D': 3.7,
        '3D': 3.3,
        '3E': 3,
        '2F': 0,
    }

    if not st_login or not password:
        return jsonify({
            'status': 'Not enough data to authorize at my.spbu.ru',
        })
    else:
        st_user = User.get_one(st_login=st_login)
        if st_user is not None and st_user.id != user.id:
            return jsonify({
                'status': 'Someone else already has this st_login',
            })

        user.st_login = st_login
        user.st_password = password

        marks = load_marks_as_array()
        course = load_course_as_dict()
        scores, cnt = 0, 0

        user.scores = []
        db.session.commit()

        for term_number, term in enumerate(marks, 1):
            for item in term:
                subject = UserSubject(
                    user_id=user.id,
                    subject_id=Subject.get_or_insert(
                        name=item['subject'],
                        term=term_number
                    ).id,
                    mark=item['mark'],
                    is_relevant=True,
                )
                user.scores.append(subject)
                if subject.is_relevant and subject.mark in mark_values.keys():
                    cnt += 1
                    scores += mark_values[subject.mark]

        user.course = course['study_program'] + '$' + course['course_year']
        user.gpa = scores / cnt

        db.session.commit()
        return jsonify({
            'marks': marks,
            'gpa': user.gpa,
            'course': user.course,
        })
