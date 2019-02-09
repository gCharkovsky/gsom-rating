from flask import current_app
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy(current_app)


class Subject(db.Model):
    __tablename__ = 'subject'
    id = \
        db.Column(db.Integer, primary_key=True)
    name = \
        db.Column(db.String(60), unique=True)

    def __repr__(self):
        return '<Subject %r>' % self.name


def check_subject_exists(name):
    return Subject.query.filter_by(name=name).first()


def add_subject(name):
    subject = Subject(name=name)
    db.session.add(subject)
    db.session.commit()
    return subject.id
