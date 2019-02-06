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

var vue = new Vue({
    el: "#rating",
    data: {
        isLoading: false,
        isMobile: false,
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
    computed: {
    },
});

$(document).ready(function () {
    $("#calculator").removeClass("not-loaded");
});
