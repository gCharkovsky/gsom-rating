from flask import Flask
from flask_cors import CORS

from __config__ import BaseConfig
from backend.service import auth_service, user_service

controller = Flask('controller')
controller.config.from_object(BaseConfig)
CORS(controller, supports_credentials=True)

controller.register_blueprint(auth_service.auth, url_prefix='/auth')
controller.register_blueprint(user_service.user, url_prefix='/user')
controller.run()
