#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from flask import Blueprint, request, session, jsonify
from werkzeug.security import generate_password_hash, check_password_hash

from backend.db.user_db import add_user, get_user_by_login
from backend.service.util.jwt import create_token, decode_token

auth = Blueprint('auth', __name__)


@auth.before_app_request
def set_user():
    if 'token' in request.form or 'token' in request.args:
        token = request.form['token'] if request.method == 'POST' else request.args['token']
        if not (token is None) and token != '':
            user_id, status = decode_token(token)
            session['user_id'] = user_id
            session['status'] = status


@auth.after_app_request
def clear_status(f):
    if 'status' in session:
        session.pop('status')
    return f


def login_required(action):
    def wrapper():
        if 'user_id' in session:
            return action()
        else:
            return jsonify({
                'status': session.get('status')
            })

    return wrapper


@auth.route('/register', methods=['POST'])
def register():
    login = request.form.get('login')
    password = request.form.get('password')
    if not login:
        session['status'] = 'Login is required'
    elif not password:
        session['status'] = 'Password is required'
    elif get_user_by_login(login) is not None:
        session['status'] = 'Such login already exists'

    if session.get('status') is None:
        return jsonify({
            'user_id': add_user(login, generate_password_hash(password))
        })
    else:
        return jsonify({
            'status': session.get('status')
        })


@auth.route('/authorize', methods=['POST'])
def authorize():
    login = request.form.get('login')
    password = request.form.get('password')
    user = None
    if not login:
        session['status'] = 'Login is required'
    elif not password:
        session['status'] = 'Password is required'
    else:
        user = get_user_by_login(login)
        if user is None:
            session['status'] = 'No user with such login'
        elif not check_password_hash(user.password_hash, password):
            session['status'] = 'Invalid password'

    if session.get('status') is None:
        h, exp = create_token(user.id)
        session['user_id'] = user.id
        return jsonify({
            'token': h.decode('utf-8'),
            'expires': exp,
        })
    else:
        return jsonify({
            'status': session['status']
        })


@auth.route('/logout', methods=['POST'])
def logout():
    if 'user_id' in session:
        session.pop('user_id')
    return jsonify({
        'status': None
    })


@auth.route('/check', methods=['POST'])
def check():
    return jsonify({
        'check': 'user_id' in session,
        'status': session.get('status')
    })