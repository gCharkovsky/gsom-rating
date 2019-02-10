#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from backend.__secret__ import SecretConfig


class PathInfo(object):
    DATABASE_PATH = \
        r'C:\Users\georg\OneDrive\01_Учеба\Учеба-stats\gsom-rating\tmp\test.sqlite'


class BaseConfig(SecretConfig):
    SQLALCHEMY_DATABASE_URI = \
        'sqlite:///' + PathInfo.DATABASE_PATH

    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
