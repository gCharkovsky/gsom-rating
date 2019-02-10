#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from backend.db import db, JSONStripped


class Subject(db.Model, JSONStripped):
    __tablename__ = 'subject'

    def __init__(self, *args, **kwargs):
        super(Subject, self).__init__(args, kwargs)

    id = \
        db.Column(db.Integer, primary_key=True)
    name = \
        db.Column(db.String(60), unique=True)

    def __repr__(self):
        return '<Subject %r>' % self.name


def add_subject(name):
    subject = Subject(name=name)
    db.session.add(subject)
    db.session.commit()
    return subject.id


def get_subject_by_name(name):
    return Subject.query.filter_by(name=name).first()
