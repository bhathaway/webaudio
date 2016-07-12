// *********************
// * DEPENDEND SCRIPTS *
// *********************
var scopes_script = document.createElement('script');
scopes_script.src = 'js/scopes.js';
document.getElementsByTagName("head")[0].appendChild(scopes_script);

// ***********
// * GLOBALS *
// ***********
// shim layer with setTimeout fallback
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame;

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

window.oscilloscope = null;
window.spectrometer = null;
window.oscilloscope_canvas = null;
window.spectrometer_canvas = null;
window.audio_context = null;
window.mic_source = null;

// *************
// * FUNCTIONS *
// *************

function gotMicCallback(stream) {
    window.mic_source = window.audio_context.createMediaStreamSource(stream);

    window.mic_source.connect(window.oscilloscope.analyser);
}

function noMicCallback(err) {
    console.log("Unable to acquire microphone input: " + err.name);
}

function draw() {  
    if (window.oscilloscope) {
        window.oscilloscope.draw(window.oscilloscope_canvas.context);
    }
    if (window.spectrometer) {
        window.spectrometer.draw(window.spectrometer_canvas.context);
    }

    requestAnimationFrame(draw);
}

function setupCanvases(container) {
    window.oscilloscope_canvas = document.createElement('canvas');
    window.oscilloscope_canvas.width = 512; 
    window.oscilloscope_canvas.height = 256; 
    window.oscilloscope_canvas.id = "scope";
    window.oscilloscope_canvas.context =
      window.oscilloscope_canvas.getContext('2d');

    if (container) {
        container.appendChild(window.oscilloscope_canvas);
    } else {
        document.body.appendChild(window.oscilloscope_canvas);
    }

    window.spectrometer_canvas = document.createElement('canvas');
    window.spectrometer_canvas.width = 1024; 
    window.spectrometer_canvas.height = 256; 
    window.spectrometer_canvas.id = "freqbars";
    window.spectrometer_canvas.context =
      window.spectrometer_canvas.getContext('2d');

    if (container) {
        container.appendChild(window.spectrometer_canvas);
    } else {
        document.body.appendChild(window.spectrometer_canvas);
    }
}

function setupAudio(obj)
{
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audio_context = new AudioContext();

    obj.analyser = window.audio_context.createAnalyser();
    obj.analyser.fftSize = 2048;

    window.oscilloscope = new Oscilloscope(obj.analyser, 512, 256);
    window.spectrometer = new Spectrometer(obj.analyser, 1024, 256);
}

function init() {
    setupCanvases();
    setupAudio(window.oscilloscope_canvas);
    navigator.getUserMedia( { audio: true }, gotMicCallback, noMicCallback);
    draw();
}

function beatfrequencychange() {
    var val = parseFloat(document.getElementById("beatfrequency").value);
    window.beat_osc.setDutyCycle(val);
    document.getElementById("beatfrequency_output").value =
      Math.pow(2, val).toFixed(2);
}

function basefrequencychange() {
    var val = parseFloat(document.getElementById("basefrequency").value);
    var freq = Math.pow(2, val) * 440.0;
    window.beat_osc.setBaseFreq(freq);
    document.getElementById("basefrequency_output").value = freq.toFixed(1);
}

// *********
// * SETUP *
// *********
window.addEventListener("load", init);

