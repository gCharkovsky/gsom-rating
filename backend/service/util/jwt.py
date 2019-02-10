#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from flask import current_app

import jwt
from datetime import datetime, timedelta


def create_token(data):
    payload = {
        'exp': datetime.utcnow() + timedelta(hours=3),
        'iat': datetime.utcnow(),
        'dat': data,
    }
    token = jwt.encode(
        payload,
        current_app.config.get('JWT_SECRET_KEY'),
        algorithm='HS256',
    )
    return token, payload['exp']


def decode_token(token):
    try:
        payload = jwt.decode(
            token,
            current_app.config.get('JWT_SECRET_KEY')
        )
        return payload['dat'], True
    except jwt.ExpiredSignatureError:
        return 'Expired token', False
    except jwt.InvalidTokenError:
        return 'Invalid token', False
