function BeatToneOsc(audio_context, freq, duty_cycle) {
    this.osc1 = audio_context.createOscillator();
    this.osc2 = audio_context.createOscillator();
    this.output = audio_context.createGain();
    this.osc1.type="sine";
    this.osc2.type="sine";
    this.osc1.frequency.value=freq;
    this.osc2.frequency.value=freq;
    this.osc1.connect(this.output);
    this.osc2.connect(this.output);

    this.output.gain.value = 0.5;  // purely for debugging.

    this.frequency = freq;
    this.setDutyCycle(duty_cycle); // Method declared below...
}

BeatToneOsc.prototype.setDutyCycle =
function (amt) {
    this.osc2.frequency.value = this.frequency + Math.pow(2, amt);
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
}

BeatToneOsc.prototype.stop =
function (time) {
    this.osc1.stop(time);
    this.osc2.stop(time);
}

