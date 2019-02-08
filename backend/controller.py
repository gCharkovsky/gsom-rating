from flask import Flask
from flask_cors import CORS

from backend.service.user_service import users
from backend.service.marks_service import *

from __config__ import BaseConfig

controller = Flask('controller')
controller.config.from_object(BaseConfig)
CORS(controller)

controller.register_blueprint(users, url_prefix='/users')
controller.run()
