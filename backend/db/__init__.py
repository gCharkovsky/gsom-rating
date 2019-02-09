from backend.db import subject_db, track_db, user_db
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def initialize_database():
    track_db.fill()
