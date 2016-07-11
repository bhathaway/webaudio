// shim layer with setTimeout fallback
window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame;

function pushme() {
    window.beat_osc.stop(0);
}

window.oscilloscope = null;
window.spectrometer = null;
window.time_domain_canvas = null;
window.freq_domain_canvas = null;

function draw() {  
    if (window.oscilloscope) {
        window.oscilloscope.draw(window.time_domain_canvas.context);
    }
    if (window.spectrometer) {
        window.spectrometer.draw(window.freq_domain_canvas.context);
    }

    requestAnimationFrame(draw);
}

function setupCanvases(container) {
    window.time_domain_canvas = document.createElement('canvas');
    window.time_domain_canvas.width = 512; 
    window.time_domain_canvas.height = 256; 
    window.time_domain_canvas.id = "scope";
    window.time_domain_canvas.context =
      window.time_domain_canvas.getContext('2d');

    if (container) {
        container.appendChild(window.time_domain_canvas);
    } else {
        document.body.appendChild(window.time_domain_canvas);
    }

    window.freq_domain_canvas = document.createElement('canvas');
    window.freq_domain_canvas.width = 1024; 
    window.freq_domain_canvas.height = 256; 
    window.freq_domain_canvas.id = "freqbars";
    window.freq_domain_canvas.context =
      window.freq_domain_canvas.getContext('2d');

    if (container) {
        container.appendChild(window.freq_domain_canvas);
    } else {
        document.body.appendChild(window.freq_domain_canvas);
    }
}

function init() {
    setupCanvases();
    setupAudio(window.time_domain_canvas);

    draw();
}

window.addEventListener("load", init);

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

