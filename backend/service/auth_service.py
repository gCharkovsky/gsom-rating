from flask import Blueprint, request, g, jsonify, make_response, current_app
from werkzeug.security import generate_password_hash, check_password_hash

from backend.db.user_db import get_db
from backend.service.jwt_service import create_token, decode_token

auth = Blueprint('auth', __name__)


def login_required(action):
    def wrapper():
        if 'token' not in request.form and 'token' not in request.args:
            error = 'Unauthorized access'
        else:
            result, status = decode_token(request.form['token'] if 'token' in request.form else request.args['token'])
            if not status:
                error = result
            else:
                g.user = result
                return action()
        return jsonify({'error': error})

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
    elif get_db().get(login) is not None:
        error = 'Such login already exists'

    if error is None:
        status = get_db().add(login, generate_password_hash(password))
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
        password_hash = get_db().get(login)
        if password_hash is None:
            error = 'No user with such login'
        elif not check_password_hash(password_hash, password):
            error = 'Invalid password'

    if error is None:
        h, exp = create_token(login)
        return jsonify({
            'status': None,
            'token': h.decode('utf-8'),
            'expires': exp,
        })
    else:
        return jsonify({'error': error})


@auth.route('/logout', methods=['POST'])
def logout():
    if 'user' in g:
        g.pop('user')
    return jsonify({
        'status': None,
        'token': None}
    )
