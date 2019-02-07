var Color = net.brehaut.Color;

var login_modal = document.getElementById("login-modal");
var register_modal = document.getElementById("register-modal");

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
        currentStudent: {
            'id': 0,
            'username': 'Marketolog228',
            'priority': ['Маркетинг','Финмен','Логистика','УЧР','Инфмен'], //перестановка пяти названий направлений
            'gpa': 3.12,
            'expectedDirection': 'Маркетинг',
        } ,
        students: [{
            'id': 0,
            'username': 'Goshan',
            'priority': ['Инфмен','Маркетинг','Финмен','Логистика','УЧР',],
            'gpa': 3.92,
            'expectedDirection': 'Инфмен',
        } ,{
            'id': 1,
            'username': 'Marketolog228',
            'priority': ['Маркетинг','Финмен','Логистика','УЧР','Инфмен'],
            'gpa': 4.12,
            'expectedDirection': 'Маркетинг',
        } ,{
            'id': 2,
            'username': 'Marketolog229',
            'priority': ['Маркетинг','Финмен','Логистика','УЧР','Инфмен'],
            'gpa': 2.22,
            'expectedDirection': 'Маркетинг',
        } ,]
    },
    created: function () {
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
            this.isMobile = true;
        this.resize();
        var grand = this;
        window.addEventListener("resize", grand.resize, false);
    },
    methods: {
        resize: function () {
            $("#rating").removeClass("not-loaded");
            this.clientWidth = document.body.clientWidth + 16;
            this.cardsPerRow = 1;
            if (this.clientWidth >= 980)
                this.cardsPerRow = 2;
            if (this.clientWidth >= 1500)
                this.cardsPerRow = 3;
            if (this.isMobile)
                this.cardsPerRow = 1;
        },
    },
    computed: {},
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
        if (event.target === $("#login-modal")[0] || event.target === $("#register-modal")[0] ) {
            $("#register-modal")[0].style.display = "none";
            $("#login-modal")[0].style.display = "none";
        }
    };
});
