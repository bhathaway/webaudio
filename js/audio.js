var audio_context = null;

var osc = null;
function setDutyCycle(amt) {
    this.osc2.frequency.value = this.frequency + Math.pow(2, amt);
    this.dcGain = 0.5 - amt;
}

function start(time) {
    this.osc1.start(time);
    this.osc2.start(time);
    this.dcOffset.start(time);
}

function stop(time) {
    this.osc1.stop(time);
    this.osc2.stop(time);
    this.dcOffset.stop(time);
}

function createDCOffset() {
    var buffer = audio_context.createBuffer(1, 1, audio_context.sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < 1; ++i) {
        data[i] = 0;
    }

    var buffer_source = audio_context.createBufferSource();
    buffer_source.buffer = buffer;
    buffer_source.loop = true;
    return buffer_source;
}

function createPWMOsc(freq, dutyCycle) {
    var pwm = new Object();
    var osc1 = audio_context.createOscillator();
    var osc2 = audio_context.createOscillator();
    var output = audio_context.createGain();
    var delay = audio_context.createDelay();
    osc1.type="sine";
    osc2.type="sine";
    osc1.frequency.value=freq;
    osc2.frequency.value=freq;
    osc1.connect(output);
    osc2.connect(output);
    delay.connect(output);
    var dcOffset = createDCOffset();
    var dcGain = audio_context.createGain();
    dcOffset.connect(dcGain);
    dcGain.connect(output);

    output.gain.value = 0.5;  // purely for debugging.

    pwm.osc1 = osc1;
    pwm.osc2 = osc2;
    pwm.output = output;
    pwm.delay = delay;
    pwm.frequency = freq;
    pwm.dcGain = dcGain;
    pwm.dcOffset = dcOffset;
    pwm.setDutyCycle = setDutyCycle;
    pwm.start = start;
    pwm.stop = stop;

    pwm.setDutyCycle(dutyCycle);
    return pwm;
}

var pwm_osc;

function setupAudio(obj)
{
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    audio_context = new AudioContext();

    obj.analyser = audio_context.createAnalyser();
    obj.analyser.fftSize = 2048;

    oscilloscope = new Oscilloscope(obj.analyser, 512, 256);

    pwm_osc = createPWMOsc(440, 0);

    pwm_osc.output.connect(audio_context.destination);
    pwm_osc.output.connect(obj.analyser);
    pwm_osc.start(audio_context.currentTime + 0.05);
}

