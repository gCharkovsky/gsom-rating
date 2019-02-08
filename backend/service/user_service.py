from flask import Blueprint, request, g, jsonify, make_response
from werkzeug.security import generate_password_hash, check_password_hash

from backend.db.user_db import get_db
from backend.service.jwt_service import create_token, decode_token

users = Blueprint('users', __name__)


def login_required(action):
    def wrapper():
        if 'token' not in request.cookies:
            error = 'Unauthorized access'
        else:
            result, status = decode_token(request.cookies['token'])
            if not status:
                error = result
            else:
                g['user'] = result
                return action()
        return jsonify({'error': error})

    return wrapper


@users.route('/register', methods=['POST'])
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


@users.route('/authorize', methods=['POST'])
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
        res = make_response()
        res.set_cookie('token', create_token(login))
        return res
    else:
        return jsonify({'error': error})


@users.route('/logout', methods=['POST'])
def logout():
    res = make_response()
    if 'user' in g:
        g.pop('user')
    if 'token' in request.cookies:
        res.set_cookie('token', '', expires=0)
    return res


@users.route('/me', methods=['GET'])
@login_required
def me():
    print(g['user'])
    return jsonify({'login': g.user, 'message': 'it works!'})


@users.route('/<string:login>', methods=['GET'])
def profile(login):
    print(login)
    return jsonify({'login': login, 'password_hash': get_db().get(login)})
