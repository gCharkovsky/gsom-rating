#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from backend.__secret__ import SecretConfig


class PathInfo(object):
    DATABASE_PATH = \
        r'gsom-rating.ru:3306/u0626898_gsom-rating'


class BaseConfig(SecretConfig):
    SQLALCHEMY_DATABASE_URI = \
        'mysql://' + SecretConfig.DB_USER+':'+SecretConfig.DB_PASSWORD+'@'+PathInfo.DATABASE_PATH

    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
