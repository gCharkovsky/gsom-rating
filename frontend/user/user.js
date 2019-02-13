doAjax = function (url, type, data, success) {
    if ($.cookie('token')) {
        data = 'token=' + $.cookie('token') + '&' + data;
    }
    return $.ajax({
        url: url,
        type: type,
        dataType: 'json',
        data: data,
        xhrFields: {withCredentials: true},
        success: success,
    });
};

doProbablyBadAjax = function (url, type, data, success, error) {
    if ($.cookie('token')) {
        data = 'token=' + $.cookie('token') + '&' + data;
    }
    return $.ajax({
        url: url,
        type: type,
        dataType: 'json',
        data: data,
        xhrFields: {withCredentials: true},
        success: success,
        error: error
    });
};

/**
 * @return {string}
 */
function URLFormat(data) {
    console.log(data);
    var res = '';
    for (var elem in data) {
        res += elem + '=' + data[elem] + '&'
        //console.log(elem)
    }
    res += 'autogenerated=true';
    console.log(res);
    return res;
}

function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}

function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function toHex(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) return "00";
    n = Math.max(0, Math.min(n, 255));
    return "0123456789ABCDEF".charAt((n - n % 16) / 16)
        + "0123456789ABCDEF".charAt(n % 16);
}


var vue = new Vue({
    el: "#user",
    data: {
        isLoading: false,
        isMobile: false,
        isLogged: false,

        regErrorMessage: '',
        loginErrorMessage: '',

        isPublic: true,
        scoreSecondLang: false,
        username: 'user',

        priorities: [],
        isPrioritiesEmpty: true,

        stLogin: '',
        validSt: '',
        stPassword: '',
        course: '2m',

        user_namings: {
            'Marketing': 'Маркетинг',
            'FM': 'Финмен',
            'Logistics': 'Логистика',
            'HR': 'УЧР',
            'IM': 'Инфмен'
        },
        tracks: ['Marketing','FM', 'Logistics', 'HR', 'IM']
    },
    created: function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
            this.isMobile = true;
        this.checkSession();
        this.requestData();
        var grand = this;
        this.resize();
        window.addEventListener("resize", grand.resize, false);
    },
    methods: {
        resize: function () {
            $("#user").removeClass("not-loaded");
        },
        progressRoundPath: function (radius, gpa) {
            const m = 'M' + radius + ',' + radius + ' ';
            const l = 'L' + radius + ',' + ' ';
            const a = 'A' + radius + ',' + radius + ' ';
            const angle = -Math.PI * 2 * (gpa - 2) / 3 + Math.PI * 0.5;
            const endpoint = radius * (1 + Math.cos(angle)) + ',' + radius * (1 - Math.sin(angle)) + ' z';
            const largeFlag = (angle > Math.PI * 0.5 || angle < -Math.PI * 0.5) ? 1 : 0;
            return m + l + a + ' 1 ' + largeFlag + ',1 ' + endpoint;
        },
        progressRoundColorByGpa: function (gpa) {
            if (gpa <= 3)
                gpa = 3;
            var color = {r: 0, g: 0, b: 0};
            var min = {r: 255, g: 16, b: 16}, mid = {r: 240, g: 220, b: 80}, max = {r: 16, g: 196, b: 80};
            if (gpa <= 4) {
                color.r = min.r * (4 - gpa) + mid.r * (gpa - 3);
                color.g = min.g * (4 - gpa) + mid.g * (gpa - 3);
                color.b = min.b * (4 - gpa) + mid.b * (gpa - 3);
            } else {
                color.r = mid.r * (5 - gpa) + max.r * (gpa - 4);
                color.g = mid.g * (5 - gpa) + max.g * (gpa - 4);
                color.b = mid.b * (5 - gpa) + max.b * (gpa - 4);
            }
            return '#' + toHex(color.r) + toHex(color.g) + toHex(color.b)
        },
        downPriority: function (index) {
            if (index < this.priorities.length - 1 && index > -1) {
                var temp = [this.priorities[index + 1], this.priorities[index]];
                this.priorities.splice(index, 2, temp[0], temp[1]);
            } else {
                console.log('невозможно изменить приоритет крайнего элемента')
            }

            this.sendData();
        },
        sendData: function () {
            var grand=this;
            console.log(JSON.stringify({
                    'username': grand.username,
                    'is_public': grand.isPublic,
                    'score_second_lang': grand.scoreSecondLang,
                    'priorities': grand.priorities,
                }));
            doAjax(
                'https://gsom-rating.ru/user/update',
                'post',
                'data='+JSON.stringify({
                    'username': grand.username,
                    'is_public': grand.isPublic,
                    'score_second_lang': grand.scoreSecondLang,
                    'priorities': grand.priorities,
                }),
                function () {
                    console.log('success')
                }
            )
        },
        genPriorities: function () {
            this.priorities = ['Marketing', 'FM', 'Logistics', 'HR', 'IM'];
            this.isPrioritiesEmpty = false;
            this.sendData();
        },
        requestData: function () {
            var grand = this;
            doAjax(
                'https://gsom-rating.ru/user/me',
                'post',
                '',
                function (data) {
                    console.log(data);
                    grand.course = data.course;
                    grand.validSt = data.st_login;
                    grand.stLogin = data.st_login;
                    grand.isPublic = data.is_public;
                    grand.scoreSecondLang = data.score_second_lang;
                    grand.username = data.username;
                    grand.gpa = data.gpa;
                    if (data.priorities != null && data.priorities.length !== 0) {
                        for (let prior in data.priorities) {
                            grand.priorities[data.priorities[prior]['priority']] = data.priorities[prior]['track']['name'];
                        }
                        grand.priorities.splice(0,1);
                        console.log(grand.priorities);
                        grand.isPrioritiesEmpty = false;
                    } else {
                        grand.isPrioritiesEmpty = true;
                        console.log('No priorities');
                    }
                }
            )
        },
        validateSt: function () {
            var grand = this;
            console.log('st_login=' + grand.stLogin + '&password=' + grand.stPassword);
            grand.isLoading=true;
            doProbablyBadAjax(
                'https://gsom-rating.ru/user/update_st',
                'post',
                'st_login=' + grand.stLogin + '&password=' + grand.stPassword,
                function (data) {
                    console.log(data);
                    if (data.marks.length > 0) {
                        grand.validSt = grand.stLogin;
                    }
                    grand.isLoading=false;
                },
                function (err) {
                    grand.isLoading=false;
                });
        },
        changeMobility: function () {
            this.isMobile ^= 1
        },
        checkSession: function () {
            var grand = this;
            doAjax(
                'https://gsom-rating.ru/auth/check',
                'post',
                '',
                function (data) {
                    grand.isLogged = data.check;
                }
            );
            //this.isLogged = ($.cookie('token') != null);
        },
        login: function () {
            console.log('login');
            var grand = this;
            doAjax(
                'https://gsom-rating.ru/auth/authorize',
                'post',
                $("#login-form").serialize(),
                function (data) {
                    console.log('data.status');
                    console.log(data.status);
                    $.cookie('token', data.token, {path: '/'})
                    if (data.status == null) {
                        grand.hideLoginModal();
                        grand.isLogged = true;
                        console.log(data);
                        grand.requestData();
                    } else if (data.status === 'No user with such login') {
                        grand.loginErrorMessage = 'Неверный логин';
                    } else if (data.status === 'Invalid password') {
                        grand.loginErrorMessage = 'Неверный пароль';
                    } else {
                        grand.loginErrorMessage = data.status;
                    }
                }
            );
        },
        register: function () {
            console.log('register');
            var grand = this;
            if ($("#register-form input[type=password]")[0].value === $("#register-form input[type=password]")[1].value) {
                doAjax(
                    'https://gsom-rating.ru/auth/register',
                    'post',
                    $("#register-form").serialize(),
                    function (data) {
                        if (data.status == null) {
                            grand.hideRegisterModal();
                            grand.showLoginModal();
                        } else if (data.status === 'Such login already exists') {
                            grand.regErrorMessage = 'Логин занят';
                        } else {
                            grand.regErrorMessage = data.status;
                        }
                        console.log(data);
                    }
                );
            } else {
                this.regErrorMessage = 'Пароли не совпадают';
            }
        },
        logout: function () {
            console.log('logout');
            var grand = this;
            doAjax(
                'https://gsom-rating.ru/auth/logout',
                'post',
                '',
                function (data) {
                    //console.log(data);
                    grand.isLogged = false;
                    $.cookie('token', '', {path: '/', expires: -1});
                    $.removeCookie('token', {path: '/'});
                    $("#register-modal")[0].style.display = "none";
                    $("#login-modal")[0].style.display = "none";

                    grand.isPublic = true;
                    grand.scoreSecondLang = false;
                    grand.username = 'user';
                    grand.priorities = [];
                    grand.isPrioritiesEmpty = true;
                    grand.stLogin = '';
                    grand.validSt = '';
                    grand.stPassword = '';
                    grand.course = '';
                }
            );
        },
        showLoginModal: function () {
            $("#login-modal")[0].style.display = "block";
        },
        showRegisterModal: function () {
            $("#register-modal")[0].style.display = "block";
        },
        hideLoginModal: function () {
            this.loginErrorMessage = '';
            $("#login-modal")[0].style.display = "none";
        },
        hideRegisterModal: function () {
            this.regErrorMessage = '';
            $("#register-modal")[0].style.display = "none";
        },
    },
    computed: {},
    watch: {}
});

$(document).ready(function () {
    $("#user").removeClass("not-loaded");
    window.onclick = function (event) {
        if (event.target === $("#login-modal")[0] || event.target === $("#register-modal")[0]) {
            vue.hideRegisterModal();
            vue.hideLoginModal();
        }
    };
});
