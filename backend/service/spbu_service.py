#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-

import requests
import re
from flask import Blueprint, request, g, jsonify

spbu = Blueprint('spbu', __name__)


@spbu.route('/check_st', methods=['POST'])
def check_st():
    st_login = request.form['st_login']
    password = request.form['password']

    return check(st_login, password)



def check(username, password):# проверка валидности ст-логина и ст-пароля

    SESSION_NAME = 'ASP.NET_SessionId'
    COOKIES = []

    def cookies():
        return '; '.join(COOKIES)

    _session_id = re.compile(r'{name}=([^;]*);'.format(name=SESSION_NAME))
    _username_field = re.compile(r'(Logon\$v0_[0-9]+\$MainLayoutEdit\$xaf_l12\$xaf_l35\$xaf_dviUserName_Edit)')
    _password_field = re.compile(r'(Logon\$v0_[0-9]+\$MainLayoutEdit\$xaf_l12\$xaf_l40\$xaf_dviPassword_Edit)')
    _event_validation = re.compile(r'id="__EVENTVALIDATION" value="([^"]+)"')

    def parse_argument(text, arg):
        _arg = re.compile(r'id="__{arg}" value="([^"]+)'.format(arg=arg))
        return re.findall(_arg, text)[0]

    response = requests.get('https://my.spbu.ru/Login.aspx', headers={
        'Connection': 'keep-alive',
    })
    session_id = response.cookies.get(SESSION_NAME)

    COOKIES = ['{}={}'.format(SESSION_NAME, session_id)]

    text = response.text
    username_field = re.findall(_username_field, text)[0]
    password_field = re.findall(_password_field, text)[0]

    view_state = parse_argument(text, "VIEWSTATE")
    event_validation = parse_argument(text, "EVENTVALIDATION")

    response = requests.post('https://my.spbu.ru/Login.aspx?ReturnUrl=%2fdefault.aspx', headers={
        'Cookie': cookies(),
        'Connection': 'keep-alive',
    }, data={
        '__VIEWSTATE': view_state,
        '{name}'.format(name=username_field): username,
        '{name}'.format(name=password_field): password,
        '__CALLBACKID': 'globalCallbackControl',
        '__CALLBACKPARAM': 'c0:Logon$PopupActions:0:XafCallback',
        '__EVENTVALIDATION': event_validation,
    })
    login = response.cookies.get('Login')
    return jsonify({'isValid': login is not None})


def get_course(username, password): # TODO: выгрузка курса и направления
    SESSION_NAME = 'ASP.NET_SessionId'
    COOKIES = []

    def cookies():
        return '; '.join(COOKIES)

    _session_id = re.compile(r'{name}=([^;]*);'.format(name=SESSION_NAME))
    _username_field = re.compile(r'(Logon\$v0_[0-9]+\$MainLayoutEdit\$xaf_l12\$xaf_l35\$xaf_dviUserName_Edit)')
    _password_field = re.compile(r'(Logon\$v0_[0-9]+\$MainLayoutEdit\$xaf_l12\$xaf_l40\$xaf_dviPassword_Edit)')
    _event_validation = re.compile(r'id="__EVENTVALIDATION" value="([^"]+)"')
    _prog_ = re.compile(r'StudyProgram_Name_View">')
    _course_num_ = re.compile(r'Course_Name_View">')

    def parse_argument(text, arg):
        _arg = re.compile(r'id="__{arg}" value="([^"]+)'.format(arg=arg))
        return re.findall(_arg, text)[0]

    response = requests.get('https://my.spbu.ru/Login.aspx', headers={
        'Connection': 'keep-alive',
    })
    session_id = response.cookies.get(SESSION_NAME)

    COOKIES = ['{}={}'.format(SESSION_NAME, session_id)]

    text = response.text
    username_field = re.findall(_username_field, text)[0]
    password_field = re.findall(_password_field, text)[0]

    view_state = parse_argument(text, "VIEWSTATE")
    event_validation = parse_argument(text, "EVENTVALIDATION")

    response = requests.post('https://my.spbu.ru/Login.aspx?ReturnUrl=%2fdefault.aspx', headers={
        'Cookie': cookies(),
        'Connection': 'keep-alive',
    }, data={
        '__VIEWSTATE': view_state,
        '{name}'.format(name=username_field): username,
        '{name}'.format(name=password_field): password,
        '__CALLBACKID': 'globalCallbackControl',
        '__CALLBACKPARAM': 'c0:Logon$PopupActions:0:XafCallback',
        '__EVENTVALIDATION': event_validation,
    })
