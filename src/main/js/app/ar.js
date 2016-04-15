(function () {
    var module = angular.module('mars.ar', []);

    module.provider('ar', function () {
        var _config;
        var _rover;
        var arController = null;
        var cameraParam = new ARCameraParam();
        var ctx;

        var initialize = function () {
            arController = new ARController(ctx.canvas, cameraParam);
            arController.setPatternDetectionMode(artoolkit.AR_MATRIX_CODE_DETECTION);
            arController.setMatrixCodeType(artoolkit.AR_MATRIX_CODE_3x3_HAMMING63);

            arController.debugSetup();
            arController.canvas.id = 'ar-debug';
            arController.canvas.classList.add('camera-layer');
            ctx.canvas.parentElement.querySelector('.camera-layers').appendChild(arController.canvas);

            arController.time = 0;

            arController.addEventListener('getMarker', function (e) {
                if (e.data.marker.id < 0) { return; }
                processMarker(ctx, e.data.marker, _rover, arController.time);
            });

            console.info("Initialized AR");
        };

        var start = function (rover) {
            cameraContainerElement = rover.getCameraElement();
            _rover = rover;

            // Initialize canvas context
            var canvas = cameraContainerElement.querySelector('.camera-rgb');
            ctx = canvas.getContext('2d');
            ctx.font = "48px serif";

            // Initialize AR
            cameraParam.onload = initialize;
            cameraParam.load('data/camera_para.dat');

            // Create draw functions
            var drawFunctions = [];
            //drawFunctions.push(useRover(ctx));
            drawFunctions.push(useWebcam(ctx));
            drawFunctions.push(function (frameTime) {
                if (!arController) { return; }
                arController.time = frameTime;
                arController.process();
            });
            // TODO Add after image processing and before UI
            drawFunctions.push(function () {
                drawScanLines(ctx);
            });

            // Main loop
            var lastTime = null;
            function draw(time) {
                // Calculate the previous frame time
                lastTime = (lastTime === null) ? time : lastTime;
                var frameTime = time - lastTime;
                // Call draw functions
                for (var func of drawFunctions) {
                    func(frameTime);
                }
                // Request the next frame
                lastTime = time;
                window.requestAnimationFrame(draw);
            }

            console.log('Starting animation loop');
            window.requestAnimationFrame(draw);
        };

        this.config = function (config) {
            _config = config;
        };

        this.$get = ['$window', function ($window) {
            return {
                start: start
            };
        }];
    });

    function useWebcam(ctx) {
        //media.navigator.permission.disabled
        // Create source feed
        var videoFeed = document.createElement('video');
        videoFeed.id = 'camera-rgb-source';
        videoFeed.width = ctx.canvas.width;
        videoFeed.height = ctx.canvas.height;
        videoFeed.classList.add('camera-layer');
        videoFeed.autoplay = true;
        ctx.canvas.parentElement.querySelector('.camera-layers').appendChild(videoFeed);

        // Load webcam
        var constraints = window.constraints = {
            audio: false,
            video: true
        };
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            videoFeed.srcObject = stream;
        });

        var drawFrame = function () {
            ctx.drawImage(videoFeed, 0, 0, ctx.canvas.width, ctx.canvas.height);
        };
        return drawFrame;
    }

    function useRover(ctx) {
        var mjpegStreamUri = ctx.canvas.dataset.uri;

        // Display direct webcam feed
        var videoFeed = document.createElement('img');
        videoFeed.id = 'camera-rgb-source';
        videoFeed.src = mjpegStreamUri;
        videoFeed.width = ctx.canvas.width;
        videoFeed.height = ctx.canvas.height;
        videoFeed.classList.add('camera-layer');
        ctx.canvas.parentElement.querySelector('.camera-layers').appendChild(videoFeed);

        var drawFrame = function () {
            var image = new Image();
            image.crossOrigin = '';
            image.src = mjpegStreamUri;
            ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);
        };
        return drawFrame;
    }

    function debugMarker(ctx, marker, frameTime) {
        var vertex, pos;
        vertex = marker.vertex;
        ctx.strokeStyle = 'red';

        ctx.beginPath();
        ctx.moveTo(vertex[0][0], vertex[0][1]);
        ctx.lineTo(vertex[1][0], vertex[1][1]);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(vertex[2][0], vertex[2][1]);
        ctx.lineTo(vertex[3][0], vertex[3][1]);
        ctx.stroke();

        ctx.strokeStyle = 'green';
        ctx.beginPath();
        ctx.lineTo(vertex[1][0], vertex[1][1]);
        ctx.lineTo(vertex[2][0], vertex[2][1]);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(vertex[3][0], vertex[3][1]);
        ctx.lineTo(vertex[0][0], vertex[0][1]);
        ctx.stroke();

        pos = marker.pos;
        ctx.beginPath();
        ctx.arc(pos[0], pos[1], 8, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.fillText(marker.id, pos[0], pos[1]);

    }

    function processMarker(ctx, marker, rover, frameTime) {
        var quadVerts = marker.vertex;
        var center = marker.pos;
        var padding = 1.5;
        var slices = 9;
        var animationTimeMs = 2 * 1e3;
        var easing = 0.5;

        var associatedMarker = rover.markers[marker.id];
        if (!associatedMarker) { return; }

        ctx.save();
        ctx.translate(center[0] * (1 - padding), center[1] * (1 - padding));
        ctx.scale(padding, padding);
        drawPixelatedGrid(ctx, quadVerts, slices);
        ctx.restore();

        var amt;
        var statusText;
        var detectionTimeMs = animationTimeMs / 2;
        var completeNotificationTimeMs = 1000;
        if (associatedMarker.time < detectionTimeMs) {
            ctx.shadowColor = 'rgba(52, 204, 255, 1)';
            ctx.strokeStyle = 'rgba(52, 204, 255, 1)';
            ctx.fillStyle = 'rgba(52, 204, 255, 0.5)';
            amt = map(associatedMarker.time, 0, detectionTimeMs, 0, padding);
            amt = Math.min(padding, amt);
            statusText = 'Scanning...';
        } else {
            if (associatedMarker.time < detectionTimeMs + completeNotificationTimeMs) {
                statusText = 'Resource Found!';
            }
            ctx.shadowColor = 'rgba(4, 249, 0, 1)';
            ctx.strokeStyle = 'rgba(4, 249, 0, 1)';
            ctx.fillStyle = 'rgba(4, 249, 0, 0.5)';
            amt = padding;
        }
        ctx.save();
        ctx.translate(center[0] * (1 - amt), center[1] * (1 - amt));
        ctx.scale(amt, amt);
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(quadVerts[0][0], quadVerts[0][1]);
        ctx.lineTo(quadVerts[1][0], quadVerts[1][1]);
        ctx.lineTo(quadVerts[2][0], quadVerts[2][1]);
        ctx.lineTo(quadVerts[3][0], quadVerts[3][1]);
        ctx.lineTo(quadVerts[0][0], quadVerts[0][1]);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Draw statusbar
        if (statusText) {
            var barHeight = 50;
            var fontSize = 28;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, ctx.canvas.height - barHeight, ctx.canvas.width, barHeight);
            ctx.font = fontSize + 'px "Share Tech Mono", "Roboto Mono", monospace';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillText(statusText.toUpperCase(), 20, ctx.canvas.height - barHeight + (barHeight + fontSize) / 2);
        }

        // Update found marker
        if (associatedMarker.time >= animationTimeMs) {
            associatedMarker.found = true;
        }
        associatedMarker.time += frameTime;
    }

    function lerp(v0, v1, t) {
          return (1 - t) * v0 + t * v1;
    }

    function drawPixelatedGrid(ctx, quadVerts, slices) {
        var x, y;
        var points = [];
        for (y = 0; y < slices + 1; y++) {
            var yPer = y / slices;
            var y1 = [lerp(quadVerts[0][0], quadVerts[3][0], yPer), lerp(quadVerts[0][1], quadVerts[3][1], yPer)];
            var y2 = [lerp(quadVerts[1][0], quadVerts[2][0], yPer), lerp(quadVerts[1][1], quadVerts[2][1], yPer)];
            points[y] = [];
            for (x = 0; x < slices + 1; x++) {
                var xPer = x / slices;
                var xPoint = [lerp(y1[0], y2[0], xPer), lerp(y1[1], y2[1], xPer)];
                points[y].push(xPoint);
            }
        }

        for (y = 0; y < points.length - 1; y++) {
            for (x = 0; x < points[y].length - 1; x++) {
                var color = Math.floor(Math.random() * 255);
                ctx.fillStyle = 'rgba(' + color + ', ' + color + ', ' + color + ', 1)';

                ctx.beginPath();
                var p1 = points[x][y];
                var p2 = points[x + 1][y];
                var p3 = points[x + 1][y + 1];
                var p4 = points[x][y + 1];
                ctx.moveTo(p1[0], p1[1]);
                ctx.lineTo(p2[0], p2[1]);
                ctx.lineTo(p3[0], p3[1]);
                ctx.lineTo(p4[0], p4[1]);
                ctx.fill();
            }
        }
    }

    function drawScanLines(ctx) {
        var width = ctx.canvas.width;
        var height = ctx.canvas.height;
        var size = 4;
        var opactity = 0.05;

        ctx.fillStyle = 'rgba(255, 255, 255, ' + opactity + ')';
        for (var i = 0; i < height / size; i++) {
            if (i % 2 === 0) { continue; }
            ctx.fillRect(0, i * size, width, size);
        }
    }
}());
