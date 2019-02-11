#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from datetime import datetime
from backend.db import db, JSONStripped


public_user_data = ['id', 'username', 'gpa', 'priorities']


class User(db.Model, JSONStripped):
    __tablename__ = 'user'

    def __init__(self, *args, **kwargs):
        super(User, self).__init__(args, kwargs)

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
        db.relationship('UserSubject', lazy='subquery')
    priorities = \
        db.relationship('UserTrack', lazy='subquery')

    def __repr__(self):
        return '<User %r>' % self.login


class UserTrack(db.Model, JSONStripped):
    __tablename__ = '$user$track'

    def __init__(self, *args, **kwargs):
        super(UserTrack, self).__init__(args, kwargs)

    user_id = \
        db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
    track_id = \
        db.Column('track_id', db.Integer, db.ForeignKey('track.id'), primary_key=True)
    priority = \
        db.Column('priority', db.Integer, nullable=False)

    track = db.relationship('Track', lazy='subquery')

    def __repr__(self):
        return '<UserTrack %d %d>' % self.user_id % self.track_id


class UserSubject(db.Model, JSONStripped):
    __tablename__ = '$user$subject'

    def __init__(self, *args, **kwargs):
        super(UserSubject, self).__init__(args, kwargs)

    user_id = \
        db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
    subject_id = \
        db.Column('subject_id', db.Integer, db.ForeignKey('subject.id'), primary_key=True)
    mark = \
        db.Column('mark', db.String(2), nullable=False)
    is_relevant = \
        db.Column('is_relevant', db.Boolean, default=True)

    subject = db.relationship('Subject', lazy='subquery')

    def __repr__(self):
        return '<UserSubject %d %d>' % self.user_id % self.subject_id


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


def get_user_by_id(user_id):
    return User.query.filter_by(id=user_id).first()


def get_public_users_by_course(course):
    full_userlist = User.query.filter(User.course == course and User.is_public)
    required_userlist = []
    for user in full_userlist:
        curr_user = {}
        for data in public_user_data:
            curr_user[data] = user[data]
        required_userlist.append(curr_user)
    return required_userlist
