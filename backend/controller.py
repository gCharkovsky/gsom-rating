# -*- coding: utf-8 -*-

from flask import Flask
from flask_cors import CORS

from backend.__config__ import BaseConfig
from backend.db import db
from backend.service import auth_service, user_service, spbu_service
from backend.service.util.json_encoder import ModelEncoder

application = Flask(__name__)
CORS(application, supports_credentials=True, )

application.config.from_object(BaseConfig)
application.app_context().push()
application.json_encoder = ModelEncoder

db.init_app(application)

# if not database_exists(BaseConfig.SQLALCHEMY_DATABASE_URI):
# db.create_all()
# initialize_database()

application.register_blueprint(auth_service.auth, url_prefix='/auth')
application.register_blueprint(user_service.user, url_prefix='/user')
application.register_blueprint(spbu_service.spbu, url_prefix='/spbu')

application.run(debug=True)
