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


var vue = new Vue({
    el: "#rating",
    data: {
        isLoading: false,
        isMobile: false,
        course: '2m', //пока не нужно
        directions: ['Marketing', 'FM', 'Logistics', 'HR', 'IM'],
        priorities: ['Marketing', 'FM', 'Logistics', 'HR', 'IM'], //перестановка пяти названий направлений
        user_namings: {
            'Marketing': 'Маркетинг',
            'FM': 'Финмен',
            'Logistics': 'Логистика',
            'HR': 'УЧР',
            'IM': 'Инфмен'
        },
        theoreticalDirectionCapacity: {
            'Marketing': 30,
            'FM': 30,
            'Logistics': 25,
            'HR': 25,
            'IM': 25
        },
        directionCapacity: {
            'Marketing': 30,
            'FM': 30,
            'Logistics': 25,
            'HR': 25,
            'IM': 25
        },
        directionOccupancy: {
            'Marketing': 0,
            'FM': 0,
            'Logistics': 0,
            'HR': 0,
            'IM': 0
        },
        currentStudent: {
            'id': 0,
            'username': 'Marketolog228',
            'gpa': 3.12,
            'expectedDirection': 'Marketing'
        },
        students: [{
            'id': 0,
            'username': 'Goshan',
            'priorities': ['Marketing', 'FM', 'Logistics', 'HR', 'IM'],
            'gpa': 3.92,
            'expectedDirection': 'IM'
        }, {
            'id': 1,
            'username': 'Marketolog228',
            'priorities': ['Marketing', 'FM', 'Logistics', 'HR', 'IM'],
            'gpa': 4.12,
            'expectedDirection': 'Marketing'
        }, {
            'id': 2,
            'username': 'Marketolog229',
            'priorities': ['Marketing', 'FM', 'Logistics', 'HR', 'IM'],
            'gpa': 2.22,
            'expectedDirection': 'Logistics'
        }]
    },
    created: function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
            this.isMobile = true;
        this.scaleStudents();
    },
    methods: {
        compare_gpa: function (a, b) {
            if (a['gpa'] < b['gpa']) {
                return 1;
            }
            if (a['gpa'] > b['gpa']) {
                return -1;
            }
            return 0;
        },

        scaleStudents: function () {
            var theoreticalNumberOfStudents = 0;
            for (var direction in this.directions) {
                console.log(this.directions[direction]);
                theoreticalNumberOfStudents += this.theoreticalDirectionCapacity[this.directions[direction]];
            }
            console.log(theoreticalNumberOfStudents);
            var k_real = this.students.length / theoreticalNumberOfStudents;
            for (var direction in this.directions) {
                this.directionCapacity[this.directions[direction]] = Math.floor(this.theoreticalDirectionCapacity[this.directions[direction]] * k_real + 1)
            }
            console.log(this.directionCapacity);
        },

        getSerializedPriorities: function () {
            var res = '';
            for (var i = 0; i < this.priorities.length; i++) {
                res += '\'' + i + '\' : \'' + this.priorities[i];
            }
            console.log(res);
            return res;
        },
        sendProfiles: function () {
            $.ajax({
                url: '/cgi-bin/profileController.py', //url страницы
                type: "POST", //метод отправки
                dataType: "html", //формат данных
                data: this.getSerializedPriorities(),
                success: function (response_alpha) { //Данные отправлены успешно
                    console.log('данные обработаны и учтены')
                },
                error: function (response) { // Данные не отправлены
                    alert('Произошла ошибка. попробуйте еще раз');
                }
            });
        },
        jsonToStudentList: function (input) {
            var response = $.parseJSON(input);
            var number = 1;
            this.students.splice(0, this.students.length + 1);
            for (student_index in response) {
                var student = response[student_index];
                this.students.push(student);
            }
            this.students.sort(this.compare_gpa);
            this.predictProfiles();
            console.log(this.students);
        },
        getStudentsFromLongShityString: function () {
            this.jsonToStudentList(
                "[{\"id\":  0 ,\"username\": \" user3972 \",\"priorities\":  [\"HR\",\"Marketing\",\"IM\",\"Logistics\",\"FM\"] ,\"gpa\":  2.14 ,\"expectedDirection\": \"IM\"},{\"id\":  1 ,\"username\": \" user4194 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.62 ,\"expectedDirection\": \"IM\"},{\"id\":  2 ,\"username\": \" user1464 \",\"priorities\":  [\"Logistics\",\"IM\",\"FM\",\"Marketing\",\"HR\"] ,\"gpa\":  2.29 ,\"expectedDirection\": \"IM\"},{\"id\":  3 ,\"username\": \" user5058 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"Marketing\",\"FM\"] ,\"gpa\":  2.93 ,\"expectedDirection\": \"IM\"},{\"id\":  4 ,\"username\": \" user3379 \",\"priorities\":  [\"Logistics\",\"IM\",\"Marketing\",\"HR\",\"FM\"] ,\"gpa\":  2.44 ,\"expectedDirection\": \"IM\"},{\"id\":  5 ,\"username\": \" user6588 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"Marketing\",\"FM\"] ,\"gpa\":  3.81 ,\"expectedDirection\": \"IM\"},{\"id\":  6 ,\"username\": \" user6222 \",\"priorities\":  [\"IM\",\"Logistics\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.56 ,\"expectedDirection\": \"IM\"},{\"id\":  7 ,\"username\": \" user1783 \",\"priorities\":  [\"IM\",\"HR\",\"Marketing\",\"Logistics\",\"FM\"] ,\"gpa\":  4.38 ,\"expectedDirection\": \"IM\"},{\"id\":  8 ,\"username\": \" user8916 \",\"priorities\":  [\"IM\",\"Logistics\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.86 ,\"expectedDirection\": \"IM\"},{\"id\":  9 ,\"username\": \" user9227 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  4.3 ,\"expectedDirection\": \"IM\"},{\"id\":  10 ,\"username\": \" user7414 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.27 ,\"expectedDirection\": \"IM\"},{\"id\":  11 ,\"username\": \" user7929 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.51 ,\"expectedDirection\": \"IM\"},{\"id\":  12 ,\"username\": \" user7711 \",\"priorities\":  [\"Logistics\",\"FM\",\"HR\",\"IM\",\"Marketing\"] ,\"gpa\":  3.73 ,\"expectedDirection\": \"IM\"},{\"id\":  13 ,\"username\": \" user2997 \",\"priorities\":  [\"Logistics\",\"FM\",\"HR\",\"IM\",\"Marketing\"] ,\"gpa\":  3.69 ,\"expectedDirection\": \"IM\"},{\"id\":  14 ,\"username\": \" user1172 \",\"priorities\":  [\"HR\",\"IM\",\"FM\",\"Logistics\",\"Marketing\"] ,\"gpa\":  4.14 ,\"expectedDirection\": \"IM\"},{\"id\":  15 ,\"username\": \" user2065 \",\"priorities\":  [\"IM\",\"FM\",\"HR\",\"Logistics\",\"Marketing\"] ,\"gpa\":  2.6 ,\"expectedDirection\": \"IM\"},{\"id\":  16 ,\"username\": \" user4867 \",\"priorities\":  [\"HR\",\"Logistics\",\"FM\",\"IM\",\"Marketing\"] ,\"gpa\":  4.95 ,\"expectedDirection\": \"IM\"},{\"id\":  17 ,\"username\": \" user9012 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.92 ,\"expectedDirection\": \"IM\"},{\"id\":  18 ,\"username\": \" user3952 \",\"priorities\":  [\"Marketing\",\"FM\",\"IM\",\"HR\",\"Logistics\"] ,\"gpa\":  4.35 ,\"expectedDirection\": \"IM\"},{\"id\":  19 ,\"username\": \" user4824 \",\"priorities\":  [\"FM\",\"IM\",\"HR\",\"Logistics\",\"Marketing\"] ,\"gpa\":  4.93 ,\"expectedDirection\": \"IM\"},{\"id\":  20 ,\"username\": \" user3175 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.01 ,\"expectedDirection\": \"IM\"},{\"id\":  21 ,\"username\": \" user7593 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  3.79 ,\"expectedDirection\": \"IM\"},{\"id\":  22 ,\"username\": \" user9452 \",\"priorities\":  [\"IM\",\"Logistics\",\"FM\",\"HR\",\"Marketing\"] ,\"gpa\":  2.28 ,\"expectedDirection\": \"IM\"},{\"id\":  23 ,\"username\": \" user1471 \",\"priorities\":  [\"IM\",\"HR\",\"FM\",\"Logistics\",\"Marketing\"] ,\"gpa\":  3.45 ,\"expectedDirection\": \"IM\"},{\"id\":  24 ,\"username\": \" user8504 \",\"priorities\":  [\"HR\",\"IM\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  3.25 ,\"expectedDirection\": \"IM\"},{\"id\":  25 ,\"username\": \" user3793 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  4.83 ,\"expectedDirection\": \"IM\"},{\"id\":  26 ,\"username\": \" user9730 \",\"priorities\":  [\"FM\",\"Logistics\",\"HR\",\"IM\",\"Marketing\"] ,\"gpa\":  2.18 ,\"expectedDirection\": \"IM\"},{\"id\":  27 ,\"username\": \" user3602 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  3.35 ,\"expectedDirection\": \"IM\"},{\"id\":  28 ,\"username\": \" user3294 \",\"priorities\":  [\"IM\",\"Logistics\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.83 ,\"expectedDirection\": \"IM\"},{\"id\":  29 ,\"username\": \" user4960 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.71 ,\"expectedDirection\": \"IM\"},{\"id\":  30 ,\"username\": \" user1624 \",\"priorities\":  [\"Logistics\",\"HR\",\"FM\",\"IM\",\"Marketing\"] ,\"gpa\":  3.17 ,\"expectedDirection\": \"IM\"},{\"id\":  31 ,\"username\": \" user3197 \",\"priorities\":  [\"FM\",\"HR\",\"Marketing\",\"Logistics\",\"IM\"] ,\"gpa\":  4.93 ,\"expectedDirection\": \"IM\"},{\"id\":  32 ,\"username\": \" user4663 \",\"priorities\":  [\"FM\",\"HR\",\"Logistics\",\"IM\",\"Marketing\"] ,\"gpa\":  3.26 ,\"expectedDirection\": \"IM\"},{\"id\":  33 ,\"username\": \" user7698 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.89 ,\"expectedDirection\": \"IM\"},{\"id\":  34 ,\"username\": \" user20 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.41 ,\"expectedDirection\": \"IM\"},{\"id\":  35 ,\"username\": \" user118 \",\"priorities\":  [\"IM\",\"HR\",\"FM\",\"Logistics\",\"Marketing\"] ,\"gpa\":  3.11 ,\"expectedDirection\": \"IM\"},{\"id\":  36 ,\"username\": \" user9362 \",\"priorities\":  [\"Logistics\",\"FM\",\"Marketing\",\"IM\",\"HR\"] ,\"gpa\":  3.52 ,\"expectedDirection\": \"IM\"},{\"id\":  37 ,\"username\": \" user7196 \",\"priorities\":  [\"Logistics\",\"HR\",\"FM\",\"IM\",\"Marketing\"] ,\"gpa\":  2.08 ,\"expectedDirection\": \"IM\"},{\"id\":  38 ,\"username\": \" user9954 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  3.23 ,\"expectedDirection\": \"IM\"},{\"id\":  39 ,\"username\": \" user5213 \",\"priorities\":  [\"HR\",\"Logistics\",\"Marketing\",\"IM\",\"FM\"] ,\"gpa\":  4.71 ,\"expectedDirection\": \"IM\"},{\"id\":  40 ,\"username\": \" user6765 \",\"priorities\":  [\"Marketing\",\"FM\",\"IM\",\"HR\",\"Logistics\"] ,\"gpa\":  3.72 ,\"expectedDirection\": \"IM\"},{\"id\":  41 ,\"username\": \" user6563 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.72 ,\"expectedDirection\": \"IM\"},{\"id\":  42 ,\"username\": \" user6593 \",\"priorities\":  [\"IM\",\"Logistics\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  3.98 ,\"expectedDirection\": \"IM\"},{\"id\":  43 ,\"username\": \" user5081 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  4.94 ,\"expectedDirection\": \"IM\"},{\"id\":  44 ,\"username\": \" user3706 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  3.93 ,\"expectedDirection\": \"IM\"},{\"id\":  45 ,\"username\": \" user3285 \",\"priorities\":  [\"FM\",\"Logistics\",\"Marketing\",\"HR\",\"IM\"] ,\"gpa\":  2.51 ,\"expectedDirection\": \"IM\"},{\"id\":  46 ,\"username\": \" user9682 \",\"priorities\":  [\"HR\",\"IM\",\"FM\",\"Logistics\",\"Marketing\"] ,\"gpa\":  2.32 ,\"expectedDirection\": \"IM\"},{\"id\":  47 ,\"username\": \" user4828 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.62 ,\"expectedDirection\": \"IM\"},{\"id\":  48 ,\"username\": \" user142 \",\"priorities\":  [\"IM\",\"FM\",\"Logistics\",\"HR\",\"Marketing\"] ,\"gpa\":  2.09 ,\"expectedDirection\": \"IM\"},{\"id\":  49 ,\"username\": \" user1813 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.35 ,\"expectedDirection\": \"IM\"},{\"id\":  50 ,\"username\": \" user1994 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  2.15 ,\"expectedDirection\": \"IM\"},{\"id\":  51 ,\"username\": \" user6723 \",\"priorities\":  [\"HR\",\"IM\",\"Logistics\",\"Marketing\",\"FM\"] ,\"gpa\":  3.75 ,\"expectedDirection\": \"IM\"},{\"id\":  52 ,\"username\": \" user4376 \",\"priorities\":  [\"HR\",\"Marketing\",\"FM\",\"Logistics\",\"IM\"] ,\"gpa\":  3.87 ,\"expectedDirection\": \"IM\"},{\"id\":  53 ,\"username\": \" user1761 \",\"priorities\":  [\"FM\",\"IM\",\"HR\",\"Logistics\",\"Marketing\"] ,\"gpa\":  3.25 ,\"expectedDirection\": \"IM\"},{\"id\":  54 ,\"username\": \" user2879 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  3.75 ,\"expectedDirection\": \"IM\"},{\"id\":  55 ,\"username\": \" user4097 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  2.1 ,\"expectedDirection\": \"IM\"},{\"id\":  56 ,\"username\": \" user5976 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.3 ,\"expectedDirection\": \"IM\"},{\"id\":  57 ,\"username\": \" user3460 \",\"priorities\":  [\"Logistics\",\"FM\",\"IM\",\"HR\",\"Marketing\"] ,\"gpa\":  3.15 ,\"expectedDirection\": \"IM\"},{\"id\":  58 ,\"username\": \" user8583 \",\"priorities\":  [\"HR\",\"IM\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  3.73 ,\"expectedDirection\": \"IM\"},{\"id\":  59 ,\"username\": \" user5905 \",\"priorities\":  [\"IM\",\"HR\",\"Marketing\",\"Logistics\",\"FM\"] ,\"gpa\":  3.47 ,\"expectedDirection\": \"IM\"},{\"id\":  60 ,\"username\": \" user5156 \",\"priorities\":  [\"HR\",\"Marketing\",\"Logistics\",\"IM\",\"FM\"] ,\"gpa\":  2.55 ,\"expectedDirection\": \"IM\"},{\"id\":  61 ,\"username\": \" user5944 \",\"priorities\":  [\"HR\",\"FM\",\"Logistics\",\"IM\",\"Marketing\"] ,\"gpa\":  2.26 ,\"expectedDirection\": \"IM\"},{\"id\":  62 ,\"username\": \" user8506 \",\"priorities\":  [\"Logistics\",\"FM\",\"HR\",\"IM\",\"Marketing\"] ,\"gpa\":  2.76 ,\"expectedDirection\": \"IM\"},{\"id\":  63 ,\"username\": \" user8099 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.36 ,\"expectedDirection\": \"IM\"},{\"id\":  64 ,\"username\": \" user2763 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.12 ,\"expectedDirection\": \"IM\"},{\"id\":  65 ,\"username\": \" user3888 \",\"priorities\":  [\"HR\",\"IM\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  3.37 ,\"expectedDirection\": \"IM\"},{\"id\":  66 ,\"username\": \" user5062 \",\"priorities\":  [\"HR\",\"IM\",\"Marketing\",\"Logistics\",\"FM\"] ,\"gpa\":  4.18 ,\"expectedDirection\": \"IM\"},{\"id\":  67 ,\"username\": \" user2714 \",\"priorities\":  [\"HR\",\"Marketing\",\"Logistics\",\"FM\",\"IM\"] ,\"gpa\":  4.37 ,\"expectedDirection\": \"IM\"},{\"id\":  68 ,\"username\": \" user4197 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.24 ,\"expectedDirection\": \"IM\"},{\"id\":  69 ,\"username\": \" user5349 \",\"priorities\":  [\"HR\",\"Marketing\",\"IM\",\"Logistics\",\"FM\"] ,\"gpa\":  2.8 ,\"expectedDirection\": \"IM\"},{\"id\":  70 ,\"username\": \" user1570 \",\"priorities\":  [\"IM\",\"HR\",\"Marketing\",\"Logistics\",\"FM\"] ,\"gpa\":  2.63 ,\"expectedDirection\": \"IM\"},{\"id\":  71 ,\"username\": \" user2319 \",\"priorities\":  [\"IM\",\"Logistics\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  3.89 ,\"expectedDirection\": \"IM\"},{\"id\":  72 ,\"username\": \" user1114 \",\"priorities\":  [\"FM\",\"IM\",\"HR\",\"Logistics\",\"Marketing\"] ,\"gpa\":  3.05 ,\"expectedDirection\": \"IM\"},{\"id\":  73 ,\"username\": \" user6593 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.42 ,\"expectedDirection\": \"IM\"},{\"id\":  74 ,\"username\": \" user2293 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"Marketing\",\"FM\"] ,\"gpa\":  2.35 ,\"expectedDirection\": \"IM\"},{\"id\":  75 ,\"username\": \" user8799 \",\"priorities\":  [\"HR\",\"IM\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  4.79 ,\"expectedDirection\": \"IM\"},{\"id\":  76 ,\"username\": \" user8092 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"Marketing\",\"FM\"] ,\"gpa\":  2.29 ,\"expectedDirection\": \"IM\"},{\"id\":  77 ,\"username\": \" user6095 \",\"priorities\":  [\"FM\",\"HR\",\"Logistics\",\"IM\",\"Marketing\"] ,\"gpa\":  4.97 ,\"expectedDirection\": \"IM\"},{\"id\":  78 ,\"username\": \" user3408 \",\"priorities\":  [\"Marketing\",\"IM\",\"HR\",\"FM\",\"Logistics\"] ,\"gpa\":  3.8 ,\"expectedDirection\": \"IM\"},{\"id\":  79 ,\"username\": \" user9828 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  2.32 ,\"expectedDirection\": \"IM\"},{\"id\":  80 ,\"username\": \" user4834 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  3.21 ,\"expectedDirection\": \"IM\"}]"
            );
        },
        downPriority: function (index) {
            if (index < this.priorities.length - 1 && index > -1) {
                var temp = [this.priorities[index + 1], this.priorities[index]];
                this.priorities.splice(index, 2, temp[0], temp[1]);
                console.log('priority ' + index + ' downed. Priorities:');
                console.log(this.priorities)
            } else {
                console.log('невозможно изменить приоритет крайнего элемента')
            }
        },
        predictProfiles: function () {
            this.scaleStudents();
            console.log('start vanga');
            for (var student in this.students){
                for(var priority in this.students[student]['priorities']){
                    if(this.directionOccupancy[this.students[student]['priorities'][priority]]<this.directionCapacity[this.students[student]['priorities'][priority]]){
                        this.students[student]['expectedDirection'] = this.students[student]['priorities'][priority];
                        this.directionOccupancy[this.students[student]['priorities'][priority]]++;
                        console.log('direction for '+this.students[student]['id'] +' is '+ this.students[student]['priorities'][priority]);
                        break;
                    }
                }
            }
            this.students.sort(this.compare_gpa);
        }
    },
    computed: {},
    watch: {
        priorities: function () {
            console.log('priorities changed')
        }
    }
});

$(document).ready(function () {
    $("#rating").removeClass("not-loaded");
    $("#login-btn")[0].onclick = function () {
        $("#login-modal")[0].style.display = "block";
    };
    /*$("#register-btn")[0].onclick = function () {
        $("#register-modal")[0].style.display = "block";
        console.log("modal visibility changed");
    };*/
    $("#reg-from-login-btn")[0].onclick = function () {
        $("#register-modal")[0].style.display = "block";
        $("#login-modal")[0].style.display = "none";
    };
    $("#login-from-reg-btn")[0].onclick = function () {
        $("#register-modal")[0].style.display = "none";
        $("#login-modal")[0].style.display = "block";
    };
    window.onclick = function (event) {
        if (event.target === $("#login-modal")[0] || event.target === $("#register-modal")[0]) {
            $("#register-modal")[0].style.display = "none";
            $("#login-modal")[0].style.display = "none";
        }
    };
});
