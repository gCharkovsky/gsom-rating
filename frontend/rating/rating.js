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
    el: "#rating",
    data: {
        sessionId: -1,
        isLoading: false,
        isMobile: false,
        isNotReversed: 1,
        actualComparator: 'gpa',
        course: '2m', //пока не нужно
        directions: ['Marketing', 'FM', 'Logistics', 'HR', 'IM'],
        priorities: ['Marketing', 'FM', 'Logistics', 'HR', 'IM'], //перестановка пяти названий направлений
        loggedIn: false,
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
        currentId:0,
        theoreticalNumberOfStudents: 135,
        k_real: 1,
        students: [{
            'id': 0,
            'username': 'Goshan',
            'priorities': ['Marketing', 'FM', 'Logistics', 'HR', 'IM'],
            'gpa': 3.92,
            'predictedDirection': 'IM'
        }, {
            'id': 1,
            'username': 'Marketolog228',
            'priorities': ['Marketing', 'FM', 'Logistics', 'HR', 'IM'],
            'gpa': 4.12,
            'predictedDirection': 'Marketing'
        }, {
            'id': 2,
            'username': 'Marketolog229',
            'priorities': ['Marketing', 'FM', 'Logistics', 'HR', 'IM'],
            'gpa': 2.22,
            'predictedDirection': 'Logistics'
        }]
    },
    created: function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
            this.isMobile = true;

        $.ajax({
                url: '/cgi-bin/sessionController.py', //url страницы
                type: "POST", //метод отправки
                dataType: "text", //формат данных
                data: "getSession",
                success: function (response_alpha) { //Данные отправлены успешно
                    console.log('Данные обработаны и учтены')
                },
                error: function (response) { // Данные не отправлены
                    //alert('Произошла ошибка. Попробуйте еще раз');
                }
            });

        this.getStudentsFromLongShityString() // TODO: Заменить на запрос в БД
        this.initCurrentStudent(33);

        var grand = this;
        this.resize();
        window.addEventListener("resize", grand.resize, false);
    },
    methods: {
        resize: function() {
            $("#rating").removeClass("not-loaded");
        },
        isCurrent: function(student, index, array){
            return student['id'] === this.currentId;
        },
        getCurrentRatingPosition: function(inTotal){
            var p = this.students.findIndex(this.isCurrent);
            p++;
            if(inTotal){
                return [Math.floor(p/this.k_real),this.theoreticalNumberOfStudents];
            } else {
                return [p,this.students.length];
            }

        },
        compareByGpa: function (a, b) {
            if (a['gpa'] < b['gpa']) {
                return 1;
            }
            if (a['gpa'] > b['gpa']) {
                return -1;
            }
            return 0;
        },
        compareByUsername: function (a, b) {
            if (a['username'] < b['username']) {
                return 1;
            }
            if (a['username'] > b['username']) {
                return -1;
            }
            return 0;
        },
        compareByExpected: function (a, b) {
            if (a['priorities'][0] < b['priorities'][0]) {
                return 1;
            }
            if (a['priorities'][0] > b['priorities'][0]) {
                return -1;
            }
            return 0;
        },
        compareByPredicted: function (a, b) {
            if (a['predictedDirection'] < b['predictedDirection']) {
                return 1;
            }
            if (a['predictedDirection'] > b['predictedDirection']) {
                return -1;
            }
            return 0;
        },
        compareByActual: function(a,b){
            switch (this.actualComparator) {
                case 'gpa': return this.compareByGpa(a,b)*this.isNotReversed;
                case 'username': return this.compareByUsername(a,b)*this.isNotReversed;
                case 'expected': return this.compareByExpected(a,b)*this.isNotReversed;
                case 'predicted': return this.compareByPredicted(a,b)*this.isNotReversed;
            }
        },
        initCurrentStudent: function(id){
            this.currentId=id;
            this.priorities = this.students.find(this.isCurrent)['priorities'];
            this.priorities.reverse();
            this.priorities.reverse();
            console.log('Current student has id: '+id);
        },

        progressRoundPath: function (radius, stroke) {
            const m = 'M' + radius + ',' + radius + ' ';
            const l = 'L' + radius + ',' + stroke + ' ';
            const a = 'A' + (radius - stroke) + ',' + (radius - stroke) + ' ';
            const angle = -Math.PI * 2 * (this.students.find(this.isCurrent)['gpa'] - 2) / 3 + Math.PI * 0.5;
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
            return '#' + toHex(color.r) + toHex(color.g) + toHex(color.b)
        },

        scaleStudents: function () {
            this.theoreticalNumberOfStudents = 0;
            for (var direction in this.directions) {
                this.theoreticalNumberOfStudents += this.theoreticalDirectionCapacity[this.directions[direction]];
            }
            this.k_real = this.students.length / this.theoreticalNumberOfStudents;
            for (var direction in this.directions) {
                this.directionCapacity[this.directions[direction]] = Math.floor(this.theoreticalDirectionCapacity[this.directions[direction]] * this.k_real + 1)
            }
        },

        getSerializedPriorities: function () {
            var res = '';
            for (var i = 0; i < this.priorities.length; i++) {
                res += '\'' + i + '\' : \'' + this.priorities[i];
            }
            return res;
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
        jsonToStudentList: function (input) {
            var response = $.parseJSON(input);
            var number = 1;
            this.students.splice(0, this.students.length + 1);
            for (student_index in response) {
                var student = response[student_index];
                this.students.push(student);
            }
            this.students.sort(this.compareByGpa);
            this.predictProfiles();
        },
        getStudentsFromLongShityString: function () {
            this.jsonToStudentList(
                "[{\"id\":  0 ,\"username\": \" user3972 \",\"priorities\":  [\"HR\",\"Marketing\",\"IM\",\"Logistics\",\"FM\"] ,\"gpa\":  2.14 ,\"predictedDirection\": \"IM\"},{\"id\":  1 ,\"username\": \" user4194 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.62 ,\"predictedDirection\": \"IM\"},{\"id\":  2 ,\"username\": \" user1464 \",\"priorities\":  [\"Logistics\",\"IM\",\"FM\",\"Marketing\",\"HR\"] ,\"gpa\":  2.29 ,\"predictedDirection\": \"IM\"},{\"id\":  3 ,\"username\": \" user5058 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"Marketing\",\"FM\"] ,\"gpa\":  2.93 ,\"predictedDirection\": \"IM\"},{\"id\":  4 ,\"username\": \" user3379 \",\"priorities\":  [\"Logistics\",\"IM\",\"Marketing\",\"HR\",\"FM\"] ,\"gpa\":  2.44 ,\"predictedDirection\": \"IM\"},{\"id\":  5 ,\"username\": \" user6588 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"Marketing\",\"FM\"] ,\"gpa\":  3.81 ,\"predictedDirection\": \"IM\"},{\"id\":  6 ,\"username\": \" user6222 \",\"priorities\":  [\"IM\",\"Logistics\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.56 ,\"predictedDirection\": \"IM\"},{\"id\":  7 ,\"username\": \" user1783 \",\"priorities\":  [\"IM\",\"HR\",\"Marketing\",\"Logistics\",\"FM\"] ,\"gpa\":  4.38 ,\"predictedDirection\": \"IM\"},{\"id\":  8 ,\"username\": \" user8916 \",\"priorities\":  [\"IM\",\"Logistics\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.86 ,\"predictedDirection\": \"IM\"},{\"id\":  9 ,\"username\": \" user9227 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  4.3 ,\"predictedDirection\": \"IM\"},{\"id\":  10 ,\"username\": \" user7414 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.27 ,\"predictedDirection\": \"IM\"},{\"id\":  11 ,\"username\": \" user7929 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.51 ,\"predictedDirection\": \"IM\"},{\"id\":  12 ,\"username\": \" user7711 \",\"priorities\":  [\"Logistics\",\"FM\",\"HR\",\"IM\",\"Marketing\"] ,\"gpa\":  3.73 ,\"predictedDirection\": \"IM\"},{\"id\":  13 ,\"username\": \" user2997 \",\"priorities\":  [\"Logistics\",\"FM\",\"HR\",\"IM\",\"Marketing\"] ,\"gpa\":  3.69 ,\"predictedDirection\": \"IM\"},{\"id\":  14 ,\"username\": \" user1172 \",\"priorities\":  [\"HR\",\"IM\",\"FM\",\"Logistics\",\"Marketing\"] ,\"gpa\":  4.14 ,\"predictedDirection\": \"IM\"},{\"id\":  15 ,\"username\": \" user2065 \",\"priorities\":  [\"IM\",\"FM\",\"HR\",\"Logistics\",\"Marketing\"] ,\"gpa\":  2.6 ,\"predictedDirection\": \"IM\"},{\"id\":  16 ,\"username\": \" user4867 \",\"priorities\":  [\"HR\",\"Logistics\",\"FM\",\"IM\",\"Marketing\"] ,\"gpa\":  4.95 ,\"predictedDirection\": \"IM\"},{\"id\":  17 ,\"username\": \" user9012 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.92 ,\"predictedDirection\": \"IM\"},{\"id\":  18 ,\"username\": \" user3952 \",\"priorities\":  [\"Marketing\",\"FM\",\"IM\",\"HR\",\"Logistics\"] ,\"gpa\":  4.35 ,\"predictedDirection\": \"IM\"},{\"id\":  19 ,\"username\": \" user4824 \",\"priorities\":  [\"FM\",\"IM\",\"HR\",\"Logistics\",\"Marketing\"] ,\"gpa\":  4.93 ,\"predictedDirection\": \"IM\"},{\"id\":  20 ,\"username\": \" user3175 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.01 ,\"predictedDirection\": \"IM\"},{\"id\":  21 ,\"username\": \" user7593 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  3.79 ,\"predictedDirection\": \"IM\"},{\"id\":  22 ,\"username\": \" user9452 \",\"priorities\":  [\"IM\",\"Logistics\",\"FM\",\"HR\",\"Marketing\"] ,\"gpa\":  2.28 ,\"predictedDirection\": \"IM\"},{\"id\":  23 ,\"username\": \" user1471 \",\"priorities\":  [\"IM\",\"HR\",\"FM\",\"Logistics\",\"Marketing\"] ,\"gpa\":  3.45 ,\"predictedDirection\": \"IM\"},{\"id\":  24 ,\"username\": \" user8504 \",\"priorities\":  [\"HR\",\"IM\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  3.25 ,\"predictedDirection\": \"IM\"},{\"id\":  25 ,\"username\": \" user3793 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  4.83 ,\"predictedDirection\": \"IM\"},{\"id\":  26 ,\"username\": \" user9730 \",\"priorities\":  [\"FM\",\"Logistics\",\"HR\",\"IM\",\"Marketing\"] ,\"gpa\":  2.18 ,\"predictedDirection\": \"IM\"},{\"id\":  27 ,\"username\": \" user3602 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  3.35 ,\"predictedDirection\": \"IM\"},{\"id\":  28 ,\"username\": \" user3294 \",\"priorities\":  [\"IM\",\"Logistics\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.83 ,\"predictedDirection\": \"IM\"},{\"id\":  29 ,\"username\": \" user4960 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.71 ,\"predictedDirection\": \"IM\"},{\"id\":  30 ,\"username\": \" user1624 \",\"priorities\":  [\"Logistics\",\"HR\",\"FM\",\"IM\",\"Marketing\"] ,\"gpa\":  3.17 ,\"predictedDirection\": \"IM\"},{\"id\":  31 ,\"username\": \" user3197 \",\"priorities\":  [\"FM\",\"HR\",\"Marketing\",\"Logistics\",\"IM\"] ,\"gpa\":  4.93 ,\"predictedDirection\": \"IM\"},{\"id\":  32 ,\"username\": \" user4663 \",\"priorities\":  [\"FM\",\"HR\",\"Logistics\",\"IM\",\"Marketing\"] ,\"gpa\":  3.26 ,\"predictedDirection\": \"IM\"},{\"id\":  33 ,\"username\": \" user7698 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.89 ,\"predictedDirection\": \"IM\"},{\"id\":  34 ,\"username\": \" user20 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.41 ,\"predictedDirection\": \"IM\"},{\"id\":  35 ,\"username\": \" user118 \",\"priorities\":  [\"IM\",\"HR\",\"FM\",\"Logistics\",\"Marketing\"] ,\"gpa\":  3.11 ,\"predictedDirection\": \"IM\"},{\"id\":  36 ,\"username\": \" user9362 \",\"priorities\":  [\"Logistics\",\"FM\",\"Marketing\",\"IM\",\"HR\"] ,\"gpa\":  3.52 ,\"predictedDirection\": \"IM\"},{\"id\":  37 ,\"username\": \" user7196 \",\"priorities\":  [\"Logistics\",\"HR\",\"FM\",\"IM\",\"Marketing\"] ,\"gpa\":  2.08 ,\"predictedDirection\": \"IM\"},{\"id\":  38 ,\"username\": \" user9954 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  3.23 ,\"predictedDirection\": \"IM\"},{\"id\":  39 ,\"username\": \" user5213 \",\"priorities\":  [\"HR\",\"Logistics\",\"Marketing\",\"IM\",\"FM\"] ,\"gpa\":  4.71 ,\"predictedDirection\": \"IM\"},{\"id\":  40 ,\"username\": \" user6765 \",\"priorities\":  [\"Marketing\",\"FM\",\"IM\",\"HR\",\"Logistics\"] ,\"gpa\":  3.72 ,\"predictedDirection\": \"IM\"},{\"id\":  41 ,\"username\": \" user6563 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.72 ,\"predictedDirection\": \"IM\"},{\"id\":  42 ,\"username\": \" user6593 \",\"priorities\":  [\"IM\",\"Logistics\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  3.98 ,\"predictedDirection\": \"IM\"},{\"id\":  43 ,\"username\": \" user5081 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  4.94 ,\"predictedDirection\": \"IM\"},{\"id\":  44 ,\"username\": \" user3706 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  3.93 ,\"predictedDirection\": \"IM\"},{\"id\":  45 ,\"username\": \" user3285 \",\"priorities\":  [\"FM\",\"Logistics\",\"Marketing\",\"HR\",\"IM\"] ,\"gpa\":  2.51 ,\"predictedDirection\": \"IM\"},{\"id\":  46 ,\"username\": \" user9682 \",\"priorities\":  [\"HR\",\"IM\",\"FM\",\"Logistics\",\"Marketing\"] ,\"gpa\":  2.32 ,\"predictedDirection\": \"IM\"},{\"id\":  47 ,\"username\": \" user4828 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.62 ,\"predictedDirection\": \"IM\"},{\"id\":  48 ,\"username\": \" user142 \",\"priorities\":  [\"IM\",\"FM\",\"Logistics\",\"HR\",\"Marketing\"] ,\"gpa\":  2.09 ,\"predictedDirection\": \"IM\"},{\"id\":  49 ,\"username\": \" user1813 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.35 ,\"predictedDirection\": \"IM\"},{\"id\":  50 ,\"username\": \" user1994 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  2.15 ,\"predictedDirection\": \"IM\"},{\"id\":  51 ,\"username\": \" user6723 \",\"priorities\":  [\"HR\",\"IM\",\"Logistics\",\"Marketing\",\"FM\"] ,\"gpa\":  3.75 ,\"predictedDirection\": \"IM\"},{\"id\":  52 ,\"username\": \" user4376 \",\"priorities\":  [\"HR\",\"Marketing\",\"FM\",\"Logistics\",\"IM\"] ,\"gpa\":  3.87 ,\"predictedDirection\": \"IM\"},{\"id\":  53 ,\"username\": \" user1761 \",\"priorities\":  [\"FM\",\"IM\",\"HR\",\"Logistics\",\"Marketing\"] ,\"gpa\":  3.25 ,\"predictedDirection\": \"IM\"},{\"id\":  54 ,\"username\": \" user2879 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  3.75 ,\"predictedDirection\": \"IM\"},{\"id\":  55 ,\"username\": \" user4097 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  2.1 ,\"predictedDirection\": \"IM\"},{\"id\":  56 ,\"username\": \" user5976 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.3 ,\"predictedDirection\": \"IM\"},{\"id\":  57 ,\"username\": \" user3460 \",\"priorities\":  [\"Logistics\",\"FM\",\"IM\",\"HR\",\"Marketing\"] ,\"gpa\":  3.15 ,\"predictedDirection\": \"IM\"},{\"id\":  58 ,\"username\": \" user8583 \",\"priorities\":  [\"HR\",\"IM\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  3.73 ,\"predictedDirection\": \"IM\"},{\"id\":  59 ,\"username\": \" user5905 \",\"priorities\":  [\"IM\",\"HR\",\"Marketing\",\"Logistics\",\"FM\"] ,\"gpa\":  3.47 ,\"predictedDirection\": \"IM\"},{\"id\":  60 ,\"username\": \" user5156 \",\"priorities\":  [\"HR\",\"Marketing\",\"Logistics\",\"IM\",\"FM\"] ,\"gpa\":  2.55 ,\"predictedDirection\": \"IM\"},{\"id\":  61 ,\"username\": \" user5944 \",\"priorities\":  [\"HR\",\"FM\",\"Logistics\",\"IM\",\"Marketing\"] ,\"gpa\":  2.26 ,\"predictedDirection\": \"IM\"},{\"id\":  62 ,\"username\": \" user8506 \",\"priorities\":  [\"Logistics\",\"FM\",\"HR\",\"IM\",\"Marketing\"] ,\"gpa\":  2.76 ,\"predictedDirection\": \"IM\"},{\"id\":  63 ,\"username\": \" user8099 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.36 ,\"predictedDirection\": \"IM\"},{\"id\":  64 ,\"username\": \" user2763 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  2.12 ,\"predictedDirection\": \"IM\"},{\"id\":  65 ,\"username\": \" user3888 \",\"priorities\":  [\"HR\",\"IM\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  3.37 ,\"predictedDirection\": \"IM\"},{\"id\":  66 ,\"username\": \" user5062 \",\"priorities\":  [\"HR\",\"IM\",\"Marketing\",\"Logistics\",\"FM\"] ,\"gpa\":  4.18 ,\"predictedDirection\": \"IM\"},{\"id\":  67 ,\"username\": \" user2714 \",\"priorities\":  [\"HR\",\"Marketing\",\"Logistics\",\"FM\",\"IM\"] ,\"gpa\":  4.37 ,\"predictedDirection\": \"IM\"},{\"id\":  68 ,\"username\": \" user4197 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  4.24 ,\"predictedDirection\": \"IM\"},{\"id\":  69 ,\"username\": \" user5349 \",\"priorities\":  [\"HR\",\"Marketing\",\"IM\",\"Logistics\",\"FM\"] ,\"gpa\":  2.8 ,\"predictedDirection\": \"IM\"},{\"id\":  70 ,\"username\": \" user1570 \",\"priorities\":  [\"IM\",\"HR\",\"Marketing\",\"Logistics\",\"FM\"] ,\"gpa\":  2.63 ,\"predictedDirection\": \"IM\"},{\"id\":  71 ,\"username\": \" user2319 \",\"priorities\":  [\"IM\",\"Logistics\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  3.89 ,\"predictedDirection\": \"IM\"},{\"id\":  72 ,\"username\": \" user1114 \",\"priorities\":  [\"FM\",\"IM\",\"HR\",\"Logistics\",\"Marketing\"] ,\"gpa\":  3.05 ,\"predictedDirection\": \"IM\"},{\"id\":  73 ,\"username\": \" user6593 \",\"priorities\":  [\"Logistics\",\"IM\",\"HR\",\"FM\",\"Marketing\"] ,\"gpa\":  4.42 ,\"predictedDirection\": \"IM\"},{\"id\":  74 ,\"username\": \" user2293 \",\"priorities\":  [\"HR\",\"Logistics\",\"IM\",\"Marketing\",\"FM\"] ,\"gpa\":  2.35 ,\"predictedDirection\": \"IM\"},{\"id\":  75 ,\"username\": \" user8799 \",\"priorities\":  [\"HR\",\"IM\",\"Logistics\",\"FM\",\"Marketing\"] ,\"gpa\":  4.79 ,\"predictedDirection\": \"IM\"},{\"id\":  76 ,\"username\": \" user8092 \",\"priorities\":  [\"IM\",\"HR\",\"Logistics\",\"Marketing\",\"FM\"] ,\"gpa\":  2.29 ,\"predictedDirection\": \"IM\"},{\"id\":  77 ,\"username\": \" user6095 \",\"priorities\":  [\"FM\",\"HR\",\"Logistics\",\"IM\",\"Marketing\"] ,\"gpa\":  4.97 ,\"predictedDirection\": \"IM\"},{\"id\":  78 ,\"username\": \" user3408 \",\"priorities\":  [\"Marketing\",\"IM\",\"HR\",\"FM\",\"Logistics\"] ,\"gpa\":  3.8 ,\"predictedDirection\": \"IM\"},{\"id\":  79 ,\"username\": \" user9828 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  2.32 ,\"predictedDirection\": \"IM\"},{\"id\":  80 ,\"username\": \" user4834 \",\"priorities\":  [\"Logistics\",\"HR\",\"IM\",\"FM\",\"Marketing\"] ,\"gpa\":  3.21 ,\"predictedDirection\": \"IM\"}]"
            );
        },
        downPriority: function (index) {
            if (index < this.priorities.length - 1 && index > -1) {
                var temp = [this.priorities[index + 1], this.priorities[index]];
                this.priorities.splice(index, 2, temp[0], temp[1]);
            } else {
                console.log('невозможно изменить приоритет крайнего элемента')
            }

            //TODO: this.sendPriorities();, reqest priorities
            var current = this.students.find(this.isCurrent);
            current['priorities'] = this.priorities;
            this.predictProfiles();
        },
        predictProfiles: function () {
            this.scaleStudents();
            this.students.sort(this.compareByGpa);
            for(var direction in this.directions) {
                this.directionOccupancy[this.priorities[direction]] = 0;
            }

            for (var student in this.students){
                for(var priority in this.students[student]['priorities']){
                    if(this.directionOccupancy[this.students[student]['priorities'][priority]]<this.directionCapacity[this.students[student]['priorities'][priority]]){
                        this.students[student]['predictedDirection'] = this.students[student]['priorities'][priority];
                        this.directionOccupancy[this.students[student]['priorities'][priority]]++;
                        break;
                    }
                }
            }
            this.students.sort(this.compareByActual);
        },
        requestData:function () {
            var grand = this;
            if(this.loggedIn){
                $.ajax({
                url: '/cgi-bin/profileController.py',
                type: "POST",
                dataType: "html",
                data: "\'request\'=\'profile\' \'session\'="+this.sessionId,
                success: function (response) {
                    grand.jsonToStudentList(response);
                    console.log('данные обработаны и учтены')
                },
                error: function (response) {
                    alert('Произошла ошибка. Попробуйте еще раз');
                }
            });
            }
            if(this.loggedIn){
                $.ajax({
                url: '/cgi-bin/profileController.py',
                type: "POST",
                dataType: "html",
                data: "\'request\'=\'studentsList\'",
                success: function (response) {
                    grand.jsonToStudentList(response);
                    console.log('данные обработаны и учтены')
                },
                error: function (response) {
                    alert('Произошла ошибка. Попробуйте еще раз');
                }
            });
            }
        },
        sortStudentsBy: function (parameter) {
            if(this.actualComparator===parameter){
                this.isNotReversed *= -1;
            } else {
                this.isNotReversed = 1;
                this.actualComparator=parameter;
            }
            console.log('sorting by '+ this.actualComparator);
            this.students.sort(this.compareByActual);
        },
        changeMobility: function () {
            this.isMobile ^=1
        }
    },
    computed: {},
    watch: {

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
