from flask import Flask
from backend.service.user_service import auth
# from backend.service.marks_service import marks

controller = Flask('controller')
controller.register_blueprint(auth, '/auth')
controller.run()