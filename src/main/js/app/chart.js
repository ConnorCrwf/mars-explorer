(function () {

    var updateIntervalMs = 1000;
    var animate = false;

    (function createLineChart() {
        var randomData = Array(20);
        var last = 0;
        for (var i = 0; i < randomData.length; i++) {
            var num = last + (Math.random() * 2 - 1);
            randomData[i] = num;
            num = last;
        }
        randomData.unshift('header');

        var chart = c3.generate({
            bindto: '#chart-1',
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
        var gaugeElements = document.querySelectorAll('.gauge-chart');
        var gaugeCharts = [];
        for (var el of gaugeElements) {
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
            gaugeCharts.push(chart);
        }

        if (!animate) { return; }
        window.setInterval(function () {
            for (var chart of gaugeCharts) {
                var value = Math.random();
                chart.load({
                    columns: [['data', value]]
                });
            }
        }, updateIntervalMs);
    }());

}());
