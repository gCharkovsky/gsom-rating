from datetime import datetime, timedelta
import jwt

from flask import current_app


def create_token(data):
    payload = {
        'exp': datetime.utcnow() + timedelta(hours=3),
        'iat': datetime.utcnow(),
        'dat': data,
    }
    token = jwt.encode(
        payload,
        current_app.config.get('SECRET'),
        algorithm='HS256',
    )
    return token


def decode_token(token):
    try:
        payload = jwt.decode(
            token,
            current_app.config.get('SECRET')
        )
        return payload['dat'], True
    except jwt.ExpiredSignatureError:
        return 'Expired token', False
    except jwt.InvalidTokenError:
        return 'Invalid token', False
