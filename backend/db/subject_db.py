from backend.controller import controller

db = controller.db


class Subject(db.Model):
    __tablename__ = 'subject'
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
