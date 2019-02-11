#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from backend.db import db, JSONStripped


class Subject(db.Model, JSONStripped):
    __tablename__ = 'subject'

    def __init__(self, *args, **kwargs):
        super(Subject, self).__init__(*args, **kwargs)

    id = \
        db.Column(db.Integer, primary_key=True)
    name = \
        db.Column(db.String(60), unique=True)
    term = \
        db.Column(db.Integer, index=True, nullable=False)

    def __repr__(self):
        return '<Subject %r>' % self.name

    @staticmethod
    def insert(**kwargs):
        subject = Subject(**kwargs)
        db.session.insert(subject)
        db.session.commit()
        return subject

    @staticmethod
    def get_all(**kwargs):
        return Subject.query.filter_by(**kwargs)

    @staticmethod
    def get_one(**kwargs):
        return Subject.query.filter_by(**kwargs).first()

    @staticmethod
    def get_or_insert(**kwargs):
        subject = Subject.get_one(**kwargs)
        return Subject.add(**kwargs) if subject is None else subject