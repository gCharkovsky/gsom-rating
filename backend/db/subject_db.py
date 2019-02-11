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


def add_subject(name, term):
    subject = Subject(name=name, term=term)
    db.session.add(subject)
    db.session.commit()
    return subject


def get_subject_by_name(name):
    return Subject.query.filter_by(name=name).first()


def get_subject_or_insert(name, term):
    subject = get_subject_by_name(name)
    if subject is None:
        subject = add_subject(name, term)
    return subject