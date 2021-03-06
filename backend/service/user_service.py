#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
import json
import pandas
from io import StringIO
from flask import Blueprint, request, session, jsonify

from backend.db.user_db import User, UserSubject, UserTrack
from backend.db.subject_db import *
from backend.db.track_db import *
from backend.service.auth_service import login_required
from backend.service.spbu_service import load_marks_content, load_course_as_dict, to_digit

user = Blueprint('user', __name__)


@user.route('/course_list', methods=['POST'], endpoint='course_list')
@login_required
def course_list():
    id = session['user_id']
    user = User.get_one(id=id)
    course = user.course
    raw_list = User.get_all(course=course, is_public=True).all()
    res_list = []
    for elem in raw_list:
        res_list.append({'id': elem.id, 'username': elem.username, 'gpa': elem.gpa, 'priorities': elem.priorities})
    return jsonify(res_list)


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

    for field in ['username', 'is_public', 'score_second_lang']:
        if field in request.form.to_dict()['data']:
            setattr(user, field, json.loads(request.form.to_dict()['data'])[field])

    user.priorities = []
    db.session.commit()

    prior_number = 0
    for prior in json.loads(request.form.to_dict()['data'])['priorities']:
        prior_number += 1
        track = UserTrack(
            user_id=user.id,
            track_id=Track.get_one(
                name=prior,
            ).id,
            priority=prior_number,
        )
        user.priorities.append(track)

    return jsonify({'status': None})


def calculate_gpa():  # TODO: Выполнить подсчет GPA с учетом флага на второй иностранный без подключения к СПбГУ
    id = session['user_id']
    user = User.get_one(id=id)
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
    second_lang_names = [
        'Испанский язык',
        'Немецкий язык',
        'Французский язык',
    ]
    scores, cnt = 0, 0
    marks = user.scores

    for subject in marks:
        if subject.is_relevant and subject.mark in mark_values.keys():
            if user.score_second_lang or subject.subject.name not in second_lang_names:
                cnt += 1
                scores += mark_values[subject.mark]

    if cnt > 0:
        user.gpa = scores / cnt
    else:
        user.gpa = 0

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

        marks_raw = load_marks_content('2i0')
        marks = pandas.read_csv(StringIO(marks_raw), sep=';')
        marks['parsed'] = list(map(to_digit, marks['ОЦЕНКА'].values))

        course = load_course_as_dict()
        scores, cnt = 0, 0

        user.scores = []
        db.session.commit()

        for item in zip(
                marks['НАЗВАНИЕ ДИСЦИПЛИНЫ'],
                marks['parsed'] + marks['ДОП. ОЦЕНКА']
        ):
            if isinstance(item[1], str):
                subject_id = Subject.get_or_insert(
                    name=item[0],
                    term=1
                ).id
                subject = UserSubject(
                    user_id=user.id,
                    subject_id=subject_id,
                    mark=item[1],
                    is_relevant=True,
                )
                user.scores.append(subject)

        user.course = course['study_program'] + '_' + course['course_year']
        calculate_gpa()

        db.session.commit()
        return jsonify({
            'gpa': user.gpa,
            'course': user.course,
        })
