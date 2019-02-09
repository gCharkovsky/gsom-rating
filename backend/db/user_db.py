from flask import current_app
from flask_sqlalchemy import SQLAlchemy

from datetime import datetime

db = SQLAlchemy(current_app)

user_track = db.Table(
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('track_id', db.Integer, db.ForeignKey('track.id'), primary_key=True),
    db.Column('priority', db.Integer, nullable=False),
)

user_subject = db.Table(
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('subject_id', db.Integer, db.ForeignKey('subject.id'), primary_key=True),
    db.Column('mark', db.String(2), nullable=False),
    db.Column('is_relevant', db.Boolean, default=True),
)


class User(db.Model):
    __tablename__ = 'user'

    id = \
        db.Column(db.Integer, primary_key=True)
    login = \
        db.Column(db.String(50), unique=True, nullable=False)
    password_hash = \
        db.Column(db.String(255), nullable=False)
    creation_time = \
        db.Column(db.DateTime, index=True, default=datetime.utcnow)

    st_login = \
        db.Column(db.String(10), unique=True, nullable=True)
    course = \
        db.Column(db.String(255), index=True, nullable=True)
    username = \
        db.Column(db.String(50), index=True, nullable=False)

    is_public = \
        db.Column(db.Boolean, default=False)
    score_second_lang = \
        db.Column(db.Boolean, default=True)
    gpa = \
        db.Column(db.Integer, default=0)
    scores = \
        db.relationship('Subject', secondary=user_subject, lazy='subquery')
    priorities = \
        db.relationship('Track', secondary=user_track, lazy='subquery')

    def __repr__(self):
        return '<User %r>' % self.login


def add_user(login, password_hash):
    user = User(
        login=login,
        password_hash=password_hash,
        username=login,
    )
    db.session.add(user)
    db.session.commit()
    return user.id


def get_user_by_login(login):
    return User.query.filter_by(login=login).first()
