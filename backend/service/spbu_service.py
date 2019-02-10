#!/var/www/u0626898/data/myenv/bin/python
# -*- coding: utf-8 -*-

import requests
import re
from flask import Blueprint, request, session, jsonify

spbu = Blueprint('spbu', __name__)
SESSION_NAME = 'ASP.NET_SessionId'
_session_id = re.compile(r'{name}=([^;]*);'.format(name=SESSION_NAME))
_username_field = re.compile(r'(Logon\$v0_[0-9]+\$MainLayoutEdit\$xaf_l12\$xaf_l35\$xaf_dviUserName_Edit)')
_password_field = re.compile(r'(Logon\$v0_[0-9]+\$MainLayoutEdit\$xaf_l12\$xaf_l40\$xaf_dviPassword_Edit)')
_event_validation = re.compile(r'id="__EVENTVALIDATION" value="([^"]+)"')


def cookies():
    return '; '.join(session['cookies'])


def parse_argument(text, arg):
    _arg = re.compile(r'id="__{arg}" value="([^"]+)'.format(arg=arg))
    return re.findall(_arg, text)[0]


@spbu.route('/authorize', methods=['POST'])
def authorize(username, password):
    session['cookies'] = {}

    response = requests.get('https://my.spbu.ru/Login.aspx', headers={
        'Connection': 'keep-alive',
    })
    session_id = response.cookies.get(SESSION_NAME)

    session['cookies'] = ['{}={}'.format(SESSION_NAME, session_id)]

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
    login_hash = response.cookies.get('Login')

    if not login_hash:
        return jsonify({
            'status': 'Invalid login/password'
        })
    else:
        session['cookies'] += ['{}={}'.format('Login', login_hash)]
        return jsonify({
            'login_hash': login_hash
        })


@spbu.route('/load', methods=['POST'])
def load():
    st_login = request.form['st_login']
    password = request.form['password']
    authorize(st_login, password)

    requests.get('https://my.spbu.ru/default.aspx', headers={
        'Cookie': cookies(),
        'Connection': 'keep-alive',
    })

    requests.post('https://my.spbu.ru/default.aspx', headers={
        'Cookie': cookies(),
        'Connection': 'keep-alive',
    }, data={
        '__EVENTTARGET': '',
        '__CALLBACKID': 'globalCallbackControl',
        '__CALLBACKPARAM': 'c0:XafNavigationHandlerId:Mark_ListView:XafCallback',
    })

    response = requests.post('https://my.spbu.ru/default.aspx', headers={
        'Cookie': cookies(),
        'Connection': 'keep-alive',
    }, data={
        '__EVENTTARGET': 'globalCallbackControl',
        '__EVENTARGUMENT': 'Vertical$mainMenu:2i4:XafCallback',
    })

    return parse_all(response.content.decode('utf-8'))


@spbu.route('/course', methods=['POST'])
def course():
    st_login = request.form['st_login']
    password = request.form['password']
    authorize(st_login, password)

    requests.get('https://my.spbu.ru/default.aspx', headers={
        'Cookie': cookies(),
        'Connection': 'keep-alive',
    })
    # TODO: выгрузить курс


def parse_all(text_data):
    MARKS_MAP = {
        'Неудовлетворительно': '2',
        'Удовлетворительно': '3',
        'Хорошо': '4',
        'Отлично': '5',

        'Зачтено': '',
        'Не зачтено': '',

        'Неявка': '-'
    }
    MARKS_LETTERS = {
        'A', 'B', 'C', 'D', 'E', 'F',
    }

    lines = list(map(str.split, text_data.split('\n')))[1:]
    result = []
    for line in lines:
        if len(line) == 0:
            continue
        if line[0] == 'Семестр':
            result.append([])
        else:
            mark = ''
            mark_index = -1
            for i, word in enumerate(line):
                if word in MARKS_MAP.keys():
                    mark += MARKS_MAP[word]
                    mark_index = i
                    break
            if mark_index == -1:
                continue

            name = ' '.join(list(filter(
                lambda x: len(x) > 0,
                line[:mark_index - 1]
            )))
            if line[-1] in MARKS_LETTERS or mark == '-':
                result[-1].append({
                    'subject': name,
                    'mark': mark + line[-1] if mark != '-' else mark,
                })

    return jsonify(result)
