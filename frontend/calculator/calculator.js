var Color = net.brehaut.Color

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

$.removeCookie = function (key, options) {
    if ($.cookie(key) === undefined) {
        return false;
    }
    // Must not alter options, thus extending a fresh object...
    $.cookie(key, '', $.extend({}, options, {expires: -1}));
    return !$.cookie(key);
};

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

function mark(subject, code, isRelevant) {
    return {
        subject, code, number: calculateNumber(code), isRelevant
    }
}

function semester(name, marks) {
    return {
        name, marks, gpa: calculateGpa(marks), tweenedGpa: 4
    }
}

function calculateGpa(marks) {
    var sum = 0, n = 0;
    for (var j = 0; j < marks.length; j++) {
        if (marks[j].isRelevant) {
            sum += marks[j].number;
            n++;
        }
    }
    return sum / n;
}

function calculateNumber(code) {
    var number;
    switch (code) {
        case 'A':
            number = 5;
            break;
        case 'B':
            number = 4.5;
            break;
        case 'C':
            number = 4;
            break;
        case 'D':
            number = 3.5;
            break;
        case 'E':
            number = 3;
            break;
        case 'F':
            number = 0;
            break;
        case '5A':
            number = 5;
            break;
        case '5B':
            number = 4.7;
            break;
        case '4B':
            number = 4.3;
            break;
        case '4C':
            number = 4;
            break;
        case '4D':
            number = 3.7;
            break;
        case '3D':
            number = 3.3;
            break;
        case '3E':
            number = 3;
            break;
        case '2F':
            number = 0;
            break;
        default:
            number = '-';
    }
    return number;
}

var semesters = [
    semester("Первый семестр", [
        mark("История бизнеса", "4C", true),
        mark("Правоведение", "3E", true),
        mark("Финансовый учет", "3D", true),
        mark("Макроэкономика", "4C", true),
        mark("Математика для менеджеров", "5B", true),
        mark("Информационные технологии в менеджменте", "A", true),
        mark("Деловые коммуникации", "B", true),
    ]),
    semester("Второй семестр", [
        mark("Микроэкономика", "5A", true),
        mark("Статистика", "5A", true),
        mark("Финансовые институты и рынки", "4C", true),
        mark("Экономическая история", "4C", true),
        mark("Менеджмент", "3D", true),
        mark("Философия", "A", true),
        mark("Курсовая работа по направлению (SWOT-анализ)", "A", true),
    ]),
    semester("Третий семестр", [
        mark("Этика бизнеса", "C", true),
        mark("Эффективные коммуникации в академической среде на английском языке: предметно-ориентированный курс", "E", true),
        mark("Управление человеческими ресурсами", "3D", true),
        mark("Маркетинг", "4C", true),
        mark("Финансовый анализ", "3D", true),
        mark("Бизнес-статистика", "3E", true),
        mark("Международная экономика и бизнес", "4D", true),
    ])
];

function toHex(n) {
    n = parseInt(n, 10);
    if (isNaN(n)) return "00";
    n = Math.max(0, Math.min(n, 255));
    return "0123456789ABCDEF".charAt((n - n % 16) / 16)
        + "0123456789ABCDEF".charAt(n % 16);
}

var vue = new Vue({
    el: "#calculator",
    data: {
        isLoading: false,
        isMobile: false,
        isLogged: false,
        regErrorMessage: '',
        loginErrorMessage: '',
        lastSem: 2,
        semesters: semesters,
        activeMark: mark("empt", "N", false),
        newMarkValue: 'F',
        oldMarkValue: 'A',
        gpa: 4,
        tweenedGpa: 4,
        semgpa: [],
        tweenedSemgpa: [],
        clientWidth: document.body.clientWidth,
        cardsPerRow: 3,
        actualMarks: [],
        colorQuery: '',
        gpacolor: {
            red: 0,
            green: 0,
            blue: 0
        },
        tweenedGpaColor: {},
        angle: 0,
        tweenedAngle: 0,
    },
    created: function () {

        if (getCookie('Marks') != null) {
            this.jsonToMarks(getCookie('Marks'));
        } else {
            console.log('There is no Cookie. Probably, this is Light Side.')
        }
        this.checkSession();

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
            this.isMobile = true;
        var grand = this;
        this.resize();
        window.addEventListener("resize", grand.resize, false);
        this.tweenedGpaColor = Object.assign({}, this.gpacolor);

        console.log('go');
    },
    directives: {
        focus: {
            // определение директивы
            inserted: function (el) {
                el.focus();
            }
        },
        select: {
            inserted: function (el) {
                el.select();
            }
        }
    },
    methods: {
        resize: function () {
            $("#calculator").removeClass("not-loaded");
            this.clientWidth = document.body.clientWidth + 16;
            this.cardsPerRow = 1;
            if (this.clientWidth >= 980)
                this.cardsPerRow = 2;
            if (this.clientWidth >= 1500)
                this.cardsPerRow = 3;
            if (this.isMobile)
                this.cardsPerRow = 1;
        },

        validateGPA: function () {
            if ($.cookie('Marks', this.marksToJson(), {expires: 60 * 60 * 24 * 200 * 1000})) {
                // console.log(document.cookie);
            } else {
                console.log('error in cookie adding');
            }
            var sum = 0, n = 0;
            for (var i = 0; i < this.semesters.length; i++) {
                var sem = this.semesters[i];
                for (var j = 0; j < sem.marks.length; j++) {
                    if (sem.marks[j].isRelevant && !isNaN(sem.marks[j].number)) {
                        sum += sem.marks[j].number;
                        n++;
                    }
                }
            }
            this.gpa = (sum / n).toFixed(4);

            var tempsemgpa = [];
            for (var i = 0; i < this.semesters.length; i++) {
                var sem = this.semesters[i];
                var sum = 0, n = 0;
                for (var j = 0; j < sem.marks.length; j++) {
                    if (sem.marks[j].isRelevant && !isNaN(sem.marks[j].number)) {
                        sum += sem.marks[j].number;
                        n++;
                    }
                }
                sem.gpa = (sum / n).toFixed(2);
                tempsemgpa[i] = sem.gpa;
            }
            while (this.tweenedSemgpa.length < tempsemgpa.length)
                this.tweenedSemgpa[this.tweenedSemgpa.length] = 0;

            while (this.tweenedSemgpa.length > tempsemgpa.length)
                this.tweenedSemgpa.pop();


            this.semgpa = [];
            this.semgpa = tempsemgpa;

        },

        progressRoundPath: function (radius, stroke) {
            const m = 'M' + radius + ',' + radius + ' ';
            const l = 'L' + radius + ',' + stroke + ' ';
            const a = 'A' + (radius - stroke) + ',' + (radius - stroke) + ' ';
            const angle = -Math.PI * 2 * (this.tweenedGpa - 2) / 3 + Math.PI * 0.5;
            const endpoint = stroke + (radius - stroke) * (1 + Math.cos(angle)) + ',' + stroke + (radius - stroke) * (1 - Math.sin(angle)) + ' z';
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
            this.gpacolor = {
                red: color.r,
                green: color.g,
                blue: color.b,
            };
        },

        badgeColorByGpa: function (gpa) {
            if (gpa >= 4.60)
                return "#009525";
            if (gpa >= 4.25)
                return "#35a66e"
            if (gpa >= 3.75)
                return "#3d9c96"
            if (gpa >= 3.40)
                return "#ffc120"
            return "#df0000"
        },
        shortString: function (string, lim) {
            switch (string) {
                case "Математика для менеджеров":
                    return "Математика";
                case "Информационные технологии в менеджменте":
                    return "ИТМ";
                case "Финансовые институты и рынки":
                    return "ФИРы";
                case "Курсовая работа по направлению (SWOT-анализ)":
                    return "SWOT-анализ";
                case "Эффективные коммуникации в академической среде на английском языке: предметно-ориентированный курс":
                    return "Английский";
                case "Управление человеческими ресурсами":
                    return "УЧР";
                case "Бизнес-статистика":
                    return "Бизнес-стата";
                case "Деловые коммуникации":
                    return "ДК";
                case "Экономическая история":
                    return "Экистория";
                case "Международная экономика и бизнес":
                    return "Междэк";
                case "Финансовый анализ":
                    return "Финанализ";
                case "Электив. Траектория 4 (В2+). Академический английский язык: основы эффективных коммуникаций в академической среде":
                    return "Английский"
            }

            if (string.length > lim + 3)
                return string.substr(0, lim - 1) + "...";
            else
                return string
        },

        removeActive: function () {
            this.activeMark = mark("empt", "empt", false);
            return 0;
        },
        setActive: function (mark) {
            this.activeMark = mark;
        },

        isActive: function (mark) {
            return mark === this.activeMark;
        },

        changeMark: function () {
            this.activeMark.code = this.activeMark.code.toUpperCase();
            this.activeMark.number = calculateNumber(this.activeMark.code);
        },

        getRowClassByMark: function (mark) {
            if (!mark.isRelevant)
                return 'mark-non-relevant';
            else if (!(mark.number >= 0 && mark.number <= 5))
                return 'mark-error';
        },

        startEditing: function (mark) {
            this.validateGPA();
            this.changeMark();
            this.setActive(mark);
            this.oldMarkValue = mark.code;
        },
        cancelEditing: function () {
            this.activeMark.code = this.oldMarkValue;
            this.removeActive();
            this.validateGPA();
        },
        finishEditing: function () {
            this.changeMark();
            this.removeActive();
            this.validateGPA();
        },
        updateColor: function () {
            this.gpacolor = new Color(this.colorQuery).toRGB()
            this.colorQuery = ''
        },
        marksToJson: function () {
            var res = '[';
            for (var i = 0; i < this.semesters.length; i++) {
                res += '[';
                var sem = this.semesters[i];
                for (var j = 0; j < sem['marks'].length; j++) {
                    res += '{\"subject\":\"' + sem['marks'][j]['subject'] + '\", \"mark\":\"' + sem['marks'][j]['code'] + '\"}';
                    if (j !== sem['marks'].length - 1) {
                        res += ',';
                    }
                }
                res += ']';
                if (i !== this.semesters.length - 1) {
                    res += ',';
                }
            }
            res += ']';
            return res;
        },
        jsonToMarks: function (jsonString) {
            var response = $.parseJSON(jsonString);
            this.arrayToMarks(response)
        },
        arrayToMarks: function(array){
            var number = 1;
            for (sem_index in array) {
                var sem = array[sem_index];
                var smarks = [];
                for (mark_index in sem) {
                    smarks.push(mark(sem[mark_index].subject, sem[mark_index].mark, true));
                }
                this.semesters[number - 1] = semester(' Семестр ' + number, smarks);
                number++;
            }
            while (semesters.length > number - 1) {
                semesters.pop();
            }
            this.validateGPA();
        },
        getSpbuMarks: function () {
            var grand = this;
            grand.isLoading = true;
            doAjax(
                'http://127.0.0.1:5000/marks/load',
                'post',
                $("#spbu-login-form").serialize(),
                function (data) {
                    console.log(data);
                    grand.arrayToMarks(data);
                    //grand.jsonToMarks(data);
                    grand.isLoading = false;
                });
            /*$.ajax({
                url: '/cgi-bin/spbu_service.py', //url страницы
                type: "POST", //метод отправки
                dataType: "html", //формат данных
                data: $("#spbu-login-form").serialize(),  // Сеарилизуем объект
                success: function (response_alpha) { //Данные отправлены успешно

                },
                error: function (response) { // Данные не отправлены
                    grand.isLoading = false;
                    alert('Произошла ошибка. Проверьте введенные данные');

                }
            });*/
        },
        checkSession: function () {
            this.isLogged = !($.cookie('token') == null)
        },
        login: function () {
            console.log('login');
            var grand = this;
            doAjax(
                'http://127.0.0.1:5000/auth/authorize',
                'post',
                $("#login-form").serialize(),
                function (data) {
                    console.log(data);
                    $.cookie('token', data.token, {path: '/'})
                    if (data.error == null) {
                        grand.hideLoginModal();
                        grand.isLogged = true;
                        grand.requestData();
                    } else if (data.error === 'No user with such login') {
                        grand.loginErrorMessage = 'Неверный логин';
                    } else if (data.error === 'Invalid password') {
                        grand.loginErrorMessage = 'Неверный пароль';
                    } else {
                        grand.loginErrorMessage = data.error;
                    }
                }
            );
        },
        register: function () {
            console.log('register');
            var grand = this;
            if ($("#register-form input[type=password]")[0].value === $("#register-form input[type=password]")[1].value) {
                doAjax(
                    'http://127.0.0.1:5000/auth/register',
                    'post',
                    $("#register-form").serialize(),
                    function (data) {
                        if (data.error == null) {
                            grand.hideRegisterModal();
                            grand.showLoginModal();
                        } else if (data.error === 'Such login already exists') {
                            grand.regErrorMessage = 'Логин занят';
                        } else {
                            grand.regErrorMessage = data.error;
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
                'http://127.0.0.1:5000/auth/logout',
                'post',
                '',
                function (data) {
                    //console.log(data);
                    grand.isLogged = false;
                    $.cookie('token', '', {path: '/', expires: -1});
                    $.removeCookie('token', {path: '/'});
                    $("#register-modal")[0].style.display = "none";
                    $("#login-modal")[0].style.display = "none";
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
    computed: {
        semGPA() {
            return this.semgpa;
        },
        GPA() {
            this.validateGPA();
            this.progressRoundColorByGpa(this.gpa);
            return this.gpa;
        },
        tweenedCSSColor() {
            return '#' +
                toHex(this.tweenedGpaColor.red) +
                toHex(this.tweenedGpaColor.green) +
                toHex(this.tweenedGpaColor.blue)
        }
    },
    watch: {
        gpa: function (newValue) {
            TweenLite.to(this.$data, 0.5, {tweenedGpa: newValue});
        },
        semgpa: function (newValue) {
            function animate() {
                if (TWEEN.update()) {
                    requestAnimationFrame(animate)
                }
            }

            new TWEEN.Tween(this.tweenedSemgpa)
                .to(this.semgpa, 400)
                .start();
            animate()

        },
        gpacolor: function () {
            function animate() {
                if (TWEEN.update()) {
                    requestAnimationFrame(animate)
                }
            }

            new TWEEN.Tween(this.tweenedGpaColor)
                .to(this.gpacolor, 400)
                .start()

            animate()
        }
    }
});

$(document).ready(function () {
    $("#calculator").removeClass("not-loaded");
    $("#get-marks").click(
        function () {
            vue.getSpbuMarks();
            return false;
        });
    window.onclick = function (event) {
        if (event.target === $("#login-modal")[0] || event.target === $("#register-modal")[0]) {
            vue.hideLoginModal();
            vue.hideRegisterModal();
        }
    };
});
