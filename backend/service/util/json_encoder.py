from json import JSONEncoder
from backend.db import JSONStripped
from datetime import datetime


class ModelEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, JSONStripped):
            return obj.jsonify()
        elif isinstance(obj, datetime):
            return obj.isoformat()
        return super(ModelEncoder, self).default(obj)