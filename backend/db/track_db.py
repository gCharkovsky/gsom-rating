from backend.controller import controller

db = controller.db
tracks = [
    'Marketing',
    'FM',
    'Logistics',
    'HR',
    'IM',
]


class Track(db.Model):
    __tablename__ = 'track'
    id = \
        db.Column(db.Integer, primary_key=True)
    name = \
        db.Column(db.String(30), unique=True)

    def __repr__(self):
        return '<Track %r>' % self.name


def fill():
    for track in tracks:
        db.session.add(name=track)