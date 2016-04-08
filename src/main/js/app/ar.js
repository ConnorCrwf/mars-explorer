var arController = null;
var cameraParam = new ARCameraParam();

var foundMarkers;

function loadAr(ctx) {
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
        processMarker(ctx, e.data.marker, arController.time);
    });

    console.info("Initialized AR");
}

function initializeAr(cameraContainerElement, markers) {
    // TODO Cleanup reference
    foundMarkers = markers;
    console.log(markers);

    // Initialize canvas context
    var canvas = cameraContainerElement.querySelector('.camera-rgb');
    var ctx = canvas.getContext('2d');
    ctx.font = "48px serif";

    // Initialize AR
    cameraParam.onload = function () { loadAr(ctx); };
    cameraParam.load('data/camera_para.dat');

    // Initialize timer
    timer(document.querySelector('#time'));

    // Create draw functions
    var drawFunctions = [];
    //drawFunctions.push(useRover(ctx));
    drawFunctions.push(useWebcam(ctx));
    drawFunctions.push(function (frameTime) {
        if (!arController) { return; }
        arController.time = frameTime;
        arController.process();
    });

    // Main loop
    var lastTime = null;
    function draw(time) {
        // Calculate the previous frame time
        lastTime = (lastTime === null) ? time : lastTime;
        var frameTime = time - lastTime;
        // Call draw functions
        for (var func of drawFunctions) {
            func();
        }
        // Request the next frame
        lastTime = time;
        window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);
}

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

function processMarker(ctx, marker, frameTime) {
    var verticies = marker.vertex;
    var center = marker.pos;
    var padding = 1.5;

    ctx.save();
    ctx.translate(center[0] * (1 - padding), center[1] * (1 - padding));
    ctx.scale(padding, padding);

    ctx.shadowColor = 'rgba(52, 204, 255, 1)';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(52, 204, 255, 1)';
    ctx.fillStyle = 'rgba(52, 204, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(verticies[0][0], verticies[0][1]);
    ctx.lineTo(verticies[1][0], verticies[1][1]);
    ctx.lineTo(verticies[2][0], verticies[2][1]);
    ctx.lineTo(verticies[3][0], verticies[3][1]);
    ctx.lineTo(verticies[0][0], verticies[0][1]);
    ctx.fill();
    ctx.stroke();

    // var width = verticies[0][0] - verticies[1][0];
    // var height = verticies[0][1] - verticies[3][1];
    //
    // var slices = 2;
    //
    // function lerp(v0, v1, t) {
    //       return (1 - t) * v0 + t * v1;
    // }
    //
    // ctx.translate(-verticies[0][0], -verticies[0][1]);
    // for (var y = 0; y < slices; y++) {
    //     for (var x = 0; x < slices; x++) {
    //         //var color = Math.floor(Math.random() * 255);
    //         var colorNum = Math.pow(slices, 2);
    //         //var color = Math.floor((x / colorNum + y * colorNum) % 255);
    //         var color = 128;
    //         ctx.fillStyle = 'rgba(' + color + ', ' + color + ', ' + color + ', 0.5)';
    //         var xPer = x/slices;
    //         var xPer2 = (x + 1)/slices;
    //         var yPer = y/slices;
    //         var yPer2 = (y + 1)/slices;
    //         ctx.beginPath();
    //         //console.log(verticies[0], verticies[1], verticies[2], verticies[3]);
    //         ctx.moveTo(lerp(verticies[0][0], verticies[1][0], xPer) + lerp(verticies[0][0], verticies[3][0], yPer),
    //                    lerp(verticies[0][1], verticies[1][1], xPer) + lerp(verticies[0][1], verticies[3][1], yPer));
    //         ctx.lineTo(lerp(verticies[0][0], verticies[1][0], xPer2) + lerp(verticies[1][0], verticies[2][0], yPer),
    //                    lerp(verticies[0][1], verticies[1][1], xPer2) + lerp(verticies[1][1], verticies[2][1], yPer));
    //         ctx.lineTo(lerp(verticies[3][0], verticies[2][0], xPer2) + lerp(verticies[1][0], verticies[2][0], yPer2),
    //                    lerp(verticies[3][1], verticies[2][1], xPer2) + lerp(verticies[1][1], verticies[2][1], yPer2));
    //         ctx.lineTo(lerp(verticies[3][0], verticies[2][0], xPer) + lerp(verticies[0][0], verticies[3][0], yPer2),
    //                    lerp(verticies[3][1], verticies[2][1], xPer) + lerp(verticies[0][1], verticies[3][1], yPer2));
    //         //ctx.lineTo(lerp(verticies[0][0], verticies[1][0], xPer2), lerp(verticies[0][1], verticies[1][1], yPer2));
    //         //ctx.lineTo(lerp(verticies[3][0], verticies[2][0], xPer2), lerp(verticies[3][1], verticies[2][1], yPer2));
    //         //ctx.lineTo(lerp(verticies[3][0], verticies[2][0], xPer), lerp(verticies[3][1], verticies[2][1], yPer));
    //         //ctx.lineTo(lerp(verticies[0][0], verticies[1][0], xPer), lerp(verticies[0][1], verticies[1][1], yPer));
    //         ctx.fill();
    //     }
    // }
    // ctx.translate(verticies[0][0], verticies[0][1]);
    ctx.restore();

    // Update found markers
    marker = foundMarkers[marker.id - 1];
    if (marker) {
        // TODO Update model with apply
        foundMarkers[marker.id - 1] = { id: marker.id, found: true };
    }
}
