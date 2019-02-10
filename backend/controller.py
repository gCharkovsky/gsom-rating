#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-

import os

from flask import Flask
from flask_cors import CORS
from sqlalchemy_utils import database_exists

from backend.__config__ import BaseConfig, PathInfo
from backend.db import db, initialize_database
from backend.service import auth_service, user_service, marks_service, spbu_service

controller = Flask('controller')
controller.config.from_object(BaseConfig)
controller.app_context().push()
db.init_app(controller)

if __name__ == '__main__':
    if not database_exists(BaseConfig.SQLALCHEMY_DATABASE_URI):
        db.create_all()
        initialize_database()
    CORS(controller, supports_credentials=True)

    controller.register_blueprint(auth_service.auth, url_prefix='/auth')
    controller.register_blueprint(user_service.user, url_prefix='/user')
    controller.register_blueprint(marks_service.marks, url_prefix='/marks')
    controller.register_blueprint(spbu_service.spbu, url_prefix='/spbu')

    controller.run(debug=True)
