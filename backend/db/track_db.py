#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from backend.db import db, JSONStripped

tracks = [
    'Marketing',
    'FM',
    'Logistics',
    'HR',
    'IM',
]


class Track(db.Model, JSONStripped):
    __tablename__ = 'track'

    def __init__(self, *args, **kwargs):
        super(Track, self).__init__(args, kwargs)

    id = \
        db.Column(db.Integer, primary_key=True)
    name = \
        db.Column(db.String(30), unique=True)

    def __repr__(self):
        return '<Track %r>' % self.name


def fill():
    for track in tracks:
        db.session.add(Track(name=track))
    db.session.commit()
