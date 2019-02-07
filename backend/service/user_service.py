from flask import Blueprint, request, session, jsonify
from backend.db.user_db import get_db
from werkzeug.security import generate_password_hash, check_password_hash

auth = Blueprint('auth', __name__, '/auth')


# noinspection PyUnboundLocalVariable
@auth.route('/register', methods=['POST'])
def register():
    username = request.form['login']
    password = request.form['password']
    if not username:
        error = 'Login is required'
    elif not password:
        error = 'Password is required'
    elif get_db().get(username) is not None:
        error = 'Such username already exists'

    if error is None:
        status = get_db().add(username, generate_password_hash(password))
        return jsonify({'status': status})
    else:
        return jsonify({'error': error})


# noinspection PyUnboundLocalVariable
@auth.route('/login', methods=['GET'])
def login():
    username = request.form['login']
    password = request.form['password']
    if not username:
        error = 'Login is required'
    elif not password:
        error = 'Password is required'
    else:
        password_hash = get_db().get(username)
        if password_hash is None:
            error = 'No user with such username'
        elif not check_password_hash(password_hash, password):
            error = 'Invalid password'

    if error is None:
        session['user'] = username
        return jsonify({'status': 'success'})
    else:
        return jsonify({'error': error})