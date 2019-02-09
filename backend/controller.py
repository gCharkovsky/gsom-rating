import os

from flask import Flask
from flask_cors import CORS

from backend.__config__ import BaseConfig, PathInfo
from backend.db import db, initialize_database
from backend.service import auth_service, user_service, marks_service

controller = Flask('controller')
controller.config.from_object(BaseConfig)
controller.app_context().push()
db.init_app(controller)

if __name__ == '__main__':
    if not os.path.exists(PathInfo.DATABASE_PATH):
        db.create_all()
        initialize_database()
    CORS(controller, supports_credentials=True)

    controller.register_blueprint(auth_service.auth, url_prefix='/auth')
    controller.register_blueprint(user_service.user, url_prefix='/user')
    controller.register_blueprint(marks_service.marks, url_prefix='/marks')

    controller.run(debug=True)
