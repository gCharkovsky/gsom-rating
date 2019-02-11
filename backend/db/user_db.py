#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from datetime import datetime
from backend.db import db, JSONStripped





class User(db.Model, JSONStripped):
    __tablename__ = 'user'

    def __init__(self, *args, **kwargs):
        super(User, self).__init__(*args, **kwargs)

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
        db.Column(db.Boolean, default=True)
    score_second_lang = \
        db.Column(db.Boolean, default=True)
    gpa = \
        db.Column(db.Integer, default=0)
    scores = \
        db.relationship('UserSubject', lazy='subquery', cascade='all, delete-orphan')
    priorities = \
        db.relationship('UserTrack', lazy='subquery', cascade='all, delete-orphan')

    def __repr__(self):
        return '<User %r>' % self.login

    @staticmethod
    def insert(**kwargs):
        user = User(**kwargs)
        db.session.add(user)
        db.session.commit()
        return user

    @staticmethod
    def get_all(**kwargs):
        return User.query.filter_by(**kwargs)

    @staticmethod
    def get_one(**kwargs):
        return User.query.filter_by(**kwargs).first()


class UserTrack(db.Model, JSONStripped):
    __tablename__ = '$user$track'

    def __init__(self, *args, **kwargs):
        super(UserTrack, self).__init__(*args, **kwargs)

    user_id = \
        db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True)
    track_id = \
        db.Column('track_id', db.Integer, db.ForeignKey('track.id'), primary_key=True)
    priority = \
        db.Column('priority', db.Integer, nullable=False)

    track = db.relationship('Track', lazy='subquery')

    def __repr__(self):
        return '<UserTrack %r %r>' % self.user_id % self.track_id


class UserSubject(db.Model, JSONStripped):
    __tablename__ = '$user$subject'

    def __init__(self, *args, **kwargs):
        super(UserSubject, self).__init__(*args, **kwargs)

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
        return '<UserSubject %r %r>' % self.user_id % self.subject_id
