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
        sessionId: -1,
        isLoading: false,
        isMobile: false,
        isPublic: true,
        isLogged:true,
        scoreSecondLang: false,
        stLogin: '',
        validSt: '',
        stPassword: '',
        username: 'user',
        course: '2m',
        priorities: ['Marketing', 'FM', 'Logistics', 'HR', 'IM'],
        user_namings: {
            'Marketing': 'Маркетинг',
            'FM': 'Финмен',
            'Logistics': 'Логистика',
            'HR': 'УЧР',
            'IM': 'Инфмен'
        },
    },
    created: function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
            this.isMobile = true;
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
            const endpoint =  radius  * (1 + Math.cos(angle)) + ',' + radius * (1 - Math.sin(angle)) + ' z';
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
        sendProfiles: function () {
            $.ajax({
                url: '/cgi-bin/profileController.py', //url страницы
                type: "POST", //метод отправки
                dataType: "application/json", //формат данных
                data: this.getSerializedPriorities(),
                success: function (response_alpha) { //Данные отправлены успешно
                    console.log('Данные обработаны и учтены')
                },
                error: function (response) { // Данные не отправлены
                    alert('Произошла ошибка. Попробуйте еще раз');
                }
            });
        },
        requestData: function () {
            var grand = this;
            doAjax(
                'http://127.0.0.1:5000/user/me',
                'post',
                '',
                function(data) {
                    console.log(data);
                    grand.course=data.course;
                    grand.validSt=data.st_login;
                    grand.isPublic=data.is_public;
                    grand.scoreSecondLang=data.score_second_lang;
                    grand.username=data.username;
                    grand.priorities=data.priorities;
                }
            )
        },
        validateSt: function() {
            var grand = this;
            console.log('st_login='+grand.stLogin+'&password='+grand.st_Password);
                doAjax(
                'http://127.0.0.1:5000/user/update_st',
                'post',
                'st_login='+grand.stLogin+'&password='+grand.stPassword,
                function (data) {
                    console.log(data.isValid);
                    if(data.isValid){
                        grand.validSt = grand.stLogin;
                    }
                });
        },
        getSpbuMarks: function () {
            var grand = this;
            grand.isLoading = true;
            $.ajax({
                url: '/cgi-bin/spbu_service.py', //url страницы
                type: "POST", //метод отправки
                dataType: "html", //формат данных
                data: '',  // Сеарилизуем объект
                success: function (response_alpha) { //Данные отправлены успешно
                    grand.jsonToMarks(response_alpha);
                    grand.isLoading = false;
                },
                error: function (response) { // Данные не отправлены
                    grand.isLoading = false;
                    alert('Произошла ошибка. Проверьте введенные данные');

                }
            });
        },
        changeMobility: function () {
            this.isMobile ^= 1
        }
    },
    computed: {},
    watch: {}
});

$(document).ready(function () {
    $("#user").removeClass("not-loaded");
    window.onclick = function (event) {
        if (event.target === $("#login-modal")[0] || event.target === $("#register-modal")[0]) {
            $("#register-modal")[0].style.display = "none";
            $("#login-modal")[0].style.display = "none";
        }
    };
});
