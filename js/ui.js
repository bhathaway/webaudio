// shim layer with setTimeout fallback
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame;

function pushme()
{
    pwm_osc.stop(0);
}

var oscilloscope = null;
var time_domain_canvas = null;
var freq_domain_canvas = null;

function drawFreqBars(analyser, context) {
    var SPACING = 3;
    var BAR_WIDTH = 1;
    var canvasWidth = 1024;
    var canvasHeight = 256;
    var numBars = Math.round(canvasWidth / SPACING);
    var freqByteData = new Uint8Array(analyser.frequencyBinCount);

    analyser.getByteFrequencyData(freqByteData); 

    context.clearRect(0, 0, canvasWidth, canvasHeight);
    context.lineCap = 'round';
    var multiplier = analyser.frequencyBinCount / numBars;

    // Draw rectangle for each frequency bin.
    for (var i = 0; i < numBars; ++i) {
        var magnitude = 0;
        var offset = Math.floor(i * multiplier);
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j < multiplier; j++) {
            magnitude += freqByteData[offset + j];
        }

        magnitude /= multiplier;

        var magnitude2 = freqByteData[i * multiplier];
        context.fillStyle = "hsl( " + Math.round(i * 360 / numBars) + ", 100%, 50%)";
        context.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
    }
}

function draw() {  
    if (oscilloscope) {
        oscilloscope.draw(time_domain_canvas.myContext);
        if (freq_domain_canvas) {
            drawFreqBars(oscilloscope.analyser,freq_domain_canvas.context);
        }
    }

    requestAnimationFrame(draw);
}

function setupCanvases(container) {
    time_domain_canvas = document.createElement('canvas');
    time_domain_canvas.width = 512; 
    time_domain_canvas.height = 256; 
    time_domain_canvas.id = "scope";
    time_domain_canvas.myContext = time_domain_canvas.getContext('2d');

    if (container) {
        container.appendChild(time_domain_canvas);
    } else {
        document.body.appendChild(time_domain_canvas);
    }

    freq_domain_canvas = document.createElement('canvas');
    freq_domain_canvas.width = 1024; 
    freq_domain_canvas.height = 256; 
    freq_domain_canvas.id = "freqbars";
    freq_domain_canvas.context = freq_domain_canvas.getContext('2d');

    if (container) {
        container.appendChild( freq_domain_canvas );
    } else {
        document.body.appendChild( freq_domain_canvas );
    }
}

function init(){
    setupCanvases();
    setupAudio(time_domain_canvas);

    draw();
}

window.addEventListener("load", init);

function dutycyclechange() {
    pwm_osc.setDutyCycle(1 - parseFloat(document.getElementById("dutycycle").value));
}

