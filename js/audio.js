window.audio_context = null;

function createDCOffset() {
    var buffer_source = window.audio_context.createBufferSource(); 
    buffer_source.buffer = 
      window.audio_context.createBuffer(1, 1, window.audio_context.sampleRate);
    var data = buffer_source.buffer.getChannelData(0);
    for (var i = 0; i < 1; ++i) {
        data[i] = 0;
    }

    buffer_source.loop = true;
    return buffer_source;
}

function BeatToneOsc(freq, duty_cycle) {
    this.osc1 = window.audio_context.createOscillator();
    this.osc2 = window.audio_context.createOscillator();
    this.output = window.audio_context.createGain();
    this.delay = window.audio_context.createDelay();
    this.osc1.type="sine";
    this.osc2.type="sine";
    this.osc1.frequency.value=freq;
    this.osc2.frequency.value=freq;
    this.osc1.connect(this.output);
    this.osc2.connect(this.output);
    this.delay.connect(this.output);
    this.dc_offset = createDCOffset();
    this.dc_gain = window.audio_context.createGain();
    this.dc_offset.connect(this.dc_gain);
    this.dc_gain.connect(this.output);

    this.output.gain.value = 0.5;  // purely for debugging.

    this.frequency = freq;
    this.setDutyCycle(duty_cycle); // Method declared below...
}

BeatToneOsc.prototype.setDutyCycle =
function (amt) {
    this.osc2.frequency.value = this.frequency + Math.pow(2, amt);
    this.dc_gain = 0.5 - amt;
}

BeatToneOsc.prototype.setBaseFreq =
function (f) {
    var diff = this.osc2.frequency.value - this.osc1.frequency.value;
    this.frequency = f;
    this.osc1.frequency.value = f;
    this.osc2.frequency.value = f + diff;
}

BeatToneOsc.prototype.start =
function (time) {
    this.osc1.start(time);
    this.osc2.start(time);
    this.dc_offset.start(time);
}

BeatToneOsc.prototype.stop =
function (time) {
    this.osc1.stop(time);
    this.osc2.stop(time);
    this.dc_offset.stop(time);
}


window.beat_osc = null;

function setupAudio(obj)
{
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.audio_context = new AudioContext();

    obj.analyser = window.audio_context.createAnalyser();
    obj.analyser.fftSize = 2048;

    oscilloscope = new Oscilloscope(obj.analyser, 512, 256);

    beat_osc = new BeatToneOsc(440, 0);

    beat_osc.output.connect(window.audio_context.destination);
    beat_osc.output.connect(obj.analyser);
    beat_osc.start(window.audio_context.currentTime + 0.05);
}

