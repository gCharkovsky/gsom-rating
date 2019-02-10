#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from flask import Blueprint, request, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from backend.db.user_db import add_user, get_user_by_login
from backend.service.util.jwt import create_token, decode_token

auth = Blueprint('auth', __name__)


# @auth.before_app_request
# def set_user():
#     if 'token' not in request.form and 'token' not in request.args:
#         session['error'] = 'Unauthorized access'
#     else:
#         result, status = decode_token(request.form['token'] if 'token' in request.form else request.args['token'])
#         if status:
#             session['user'] = result
#             if 'error' in session:
#                 session.pop('error')
#         else:
#             session['error'] = result


def login_required(action):
    def wrapper():
        if 'user' in session:
            action()
        else:
            return jsonify({'error': session['error']})

    return wrapper


@auth.route('/register', methods=['POST'])
def register():
    login = request.form['login']
    password = request.form['password']
    error = None
    if not login:
        error = 'Login is required'
    elif not password:
        error = 'Password is required'
    elif get_user_by_login(login) is not None:
        error = 'Such login already exists'

    if error is None:
        status = add_user(login, generate_password_hash(password))
        return jsonify({'status': status})
    else:
        return jsonify({'error': error})


@auth.route('/authorize', methods=['POST'])
def authorize():
    login = request.form['login']
    password = request.form['password']
    error = None
    if not login:
        error = 'Login is required'
    elif not password:
        error = 'Password is required'
    else:
        user = get_user_by_login(login)
        if user is None:
            error = 'No user with such login'
        elif not check_password_hash(user.password_hash, password):
            error = 'Invalid password'

    if error is None:
        h, exp = create_token(login)
        session['user'] = get_user_by_login(login)
        return jsonify({
            'status': None,
            'token': h.decode('utf-8'),
            'expires': exp,
        })
    else:
        return jsonify({'error': error})


@auth.route('/logout', methods=['POST'])
def logout():
    if 'user' in session:
        session.pop('user')
    return jsonify({'status': None})


@auth.route('/check', methods=['POST'])
def check():
    return jsonify({
        'status': 'user' in session,
        'error': session.get('error')
    })
