#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from backend.db import db, JSONStripped


class Track(db.Model, JSONStripped):
    __tablename__ = 'track'

    __tracks__ = [
        'Marketing',
        'FM',
        'Logistics',
        'HR',
        'IM',
    ]

    def __init__(self, *args, **kwargs):
        super(Track, self).__init__(*args, **kwargs)

    id = \
        db.Column(db.Integer, primary_key=True)
    name = \
        db.Column(db.String(30), unique=True)

    def __repr__(self):
        return '<Track %r>' % self.name

    @staticmethod
    def fill():
        db.session.add_all([Track(name=name) for name in Track.__tracks__])
        db.session.commit()

    @staticmethod
    def get_one(**kwargs):
        return Track.query.filter_by(**kwargs).first()
