from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
from backend.db import subject_db, track_db, user_db


def initialize_database():
    track_db.fill()
