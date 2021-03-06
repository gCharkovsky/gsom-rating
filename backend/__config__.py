#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-
from backend.__secret__ import SecretConfig


class PathInfo(object):
    DATABASE_GOSHA_PATH = \
        r'C:\Users\georg\OneDrive\01_Учеба\Учеба-stats\gsom-rating\tmp\test.sqlite'
    DATABASE_DORESH_PATH = \
        r'C:\Users\isuca\projects\gsom-rating\tmp\test.sqlite'
    SERVER_PATH = \
        r'gsom-rating.ru:3306/u0626898_gstest'


class BaseConfig(SecretConfig):
    SQLALCHEMY_DATABASE_URI = \
        'mysql+pymysql://' + SecretConfig.DB_USER + ':' + SecretConfig.DB_PASSWORD + '@' + PathInfo.SERVER_PATH
    # 'sqlite:///' + PathInfo.DATABASE_GOSHA_PATH
    SQLALCHEMY_COMMIT_ON_TEARDOWN = True
    SQLALCHEMY_TRACK_MODIFICATIONS = False
