(function () {

    var updateIntervalMs = 1000;
    var animate = false;

    (function createLineChart() {
        var randomData = Array(20);
        var last = 0;
        var el = document.querySelector('.line-chart');
        for (var i = 0; i < randomData.length; i++) {
            var num = last + (Math.random() * 2 - 1);
            randomData[i] = num;
            num = last;
        }
        randomData.unshift('header');

        var chart = c3.generate({
            bindto: el,
            data: {
                columns: [
                    randomData
                ],
                colors: {
                    data: "#34ccff"
                },
            },
            axis: {
                y: { min: -10, max: 10, padding: { top: 0, bottom: 0} }
            },
            grid: {
                x: { show: true },
                y: { show: true }
            },
            padding: {
                top: 0,
                right: 0,
                bottom: 0,
                left: 20
            },
            legend: { hide: true },
            interaction: { enabled: false },
            transition: { duration: 200 }
        });

        if (!animate) { return; }
        window.setInterval(function () {
            var header = randomData.shift();
            randomData.shift();
            randomData.unshift(header);
            var num = randomData[randomData.length - 1];
            randomData.push(num + (Math.random() * 2 - 1));
            chart.load({
                columns: [randomData]
            });
        }, updateIntervalMs);
    }());

    (function createGaugeCharts() {
        var elements = document.querySelectorAll('.gauge-chart');
        var charts = [];
        for (var el of elements) {
            var value = Math.random();
            var chart = c3.generate({
                bindto: el,
                size: {
                    width: 100,
                    height: 100
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                data: {
                    columns: [
                        ['data', value]
                    ],
                    colors: {
                        data: "#34ccff"
                    },
                    type: 'gauge'
                },
                gauge: {
                    min: 0,
                    max: 1
                },
                interaction: { enabled: false },
            });
            charts.push(chart);
        }

        if (!animate) { return; }
        window.setInterval(function () {
            for (var chart of charts) {
                var value = Math.random();
                chart.load({
                    columns: [['data', value]]
                });
            }
        }, updateIntervalMs);
    }());

    (function createDonutCharts() {
        var elements = document.querySelectorAll('.donut-chart');
        var charts = [];
        for (var el of elements) {
            console.log('donut!');
            var value = Math.random();
            var chart = c3.generate({
                bindto: el,
                size: {
                    width: 100,
                    height: 100
                },
                data: {
                    columns: [
                        ['fg', value],
                        ['bg', 1 - value],
                    ],
                    colors: {
                        fg: 'rgba(52, 204, 255, 1)',
                        bg: 'rgba(52, 204, 255, 0.5)'
                    },
                    type : 'donut'
                },
                legend: { hide: true },
                interaction: { enabled: false },
                donut: {
                    label : { show: false }
                }
            });
            charts.push(chart);
        }

        if (!animate) { return; }
        window.setInterval(function () {
            for (var chart of charts) {
                var value = Math.random();
                chart.load({
                    columns: [['fg', value], ['bg', 1 - value]]
                });
            }
        }, updateIntervalMs);
    }());

}());
