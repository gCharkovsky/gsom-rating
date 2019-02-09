from backend.__secret__ import SecretConfig


class BaseConfig(SecretConfig):
    SQLALCHEMY_DATABASE_URI = \
        'sqlite:///C:\\Users\\isuca\\projects\\gsom-rating\\tmp\\test.db'
