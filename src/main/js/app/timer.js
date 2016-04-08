var timer = function (el) {
    var warningTimeSec = 30;
    function tick() {
        var timeValue = el.value.split(":");
        var time = parseInt(timeValue[0]) * 60 + parseInt(timeValue[1]) - 1;
        time = (isNaN(time) || time < 0) ? 0 : time;

        if (time <= warningTimeSec) {
            el.classList.add('text-warning');
        } else {
            el.classList.remove('text-warning');
        }
        var hours = Math.floor(time/60);
        var minutes = time % 60;
        minutes = (("" + minutes).length > 1) ? minutes : "0" + minutes;
        el.value = hours + ":" + minutes;
    }
    var timeout = window.setInterval(tick, 1000);
};
