from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from backend.__config__ import BaseConfig

controller = Flask('controller')
controller.config.from_object(BaseConfig)
controller.db = SQLAlchemy(controller)
controller.db.create_all()

if __name__ == '__main__':
    from backend.service import auth_service, user_service

    CORS(controller, supports_credentials=True)

    controller.register_blueprint(auth_service.auth, url_prefix='/auth')
    controller.register_blueprint(user_service.user, url_prefix='/user')
    controller.run(debug=True)
