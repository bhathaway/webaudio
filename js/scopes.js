function Oscilloscope(analyser, width, height) {
    this.analyser = analyser;
    this.data = new Uint8Array(analyser.frequencyBinCount);
    this.width = width;
    this.height = height;
}

Oscilloscope.prototype.draw =
function (context) {
    var quarterHeight = this.height / 4;
    var scaling = this.height / 256;

    this.analyser.getByteTimeDomainData(this.data);
    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.fillStyle = "#004737";
    context.fillRect(0, 0, this.width, this.height);
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(this.width, 0);
    context.stroke();
    context.moveTo(0, this.height);
    context.lineTo(this.width, this.height);
    context.stroke();
    context.save();
    context.strokeStyle = "#006644";
    context.beginPath();
    if (context.setLineDash) {
        context.setLineDash([5]);
    }
    context.moveTo(0, quarterHeight);
    context.lineTo(this.width, quarterHeight);
    context.stroke();
    context.moveTo(0, quarterHeight * 3);
    context.lineTo(this.width, quarterHeight * 3);
    context.stroke();

    context.restore();
    context.beginPath();
    context.strokeStyle = "blue";
    context.moveTo(0, quarterHeight * 2);
    context.lineTo(this.width, quarterHeight * 2);
    context.stroke();

    context.strokeStyle = "white";

    context.beginPath();

    var zeroCross = findFirstPositiveZeroCrossing(this.data, this.width);

    context.moveTo(0, (256 - this.data[zeroCross]) * scaling);
    for (var i = zeroCross, j = 0; j < this.width && i < this.data.length;
    ++i, ++j) {
        context.lineTo(j, (256 - this.data[i]) * scaling);
    }

    context.stroke();
}

function Spectrometer(analyser, width, height) {
    this.analyser = analyser;
    this.data = new Uint8Array(analyser.frequencyBinCount);
    this.width = width;
    this.height = height;
}

Spectrometer.prototype.draw =
function (context) {
    var SPACING = 3;
    var BAR_WIDTH = 1;
    var numBars = Math.round(this.width / SPACING);

    this.analyser.getByteFrequencyData(this.data);

    context.clearRect(0, 0, this.width, this.height);
    context.lineCap = 'round';
    var multiplier = this.analyser.frequencyBinCount / numBars;

    // Draw rectangle for each frequency bin.
    for (var i = 0; i < numBars; ++i) {
        var magnitude = 0;
        var offset = Math.floor(i * multiplier);
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j < multiplier; j++) {
            magnitude += this.data[offset + j];
        }

        magnitude /= multiplier;

        var magnitude2 = this.data[i * multiplier];
        context.fillStyle = "hsl( " + Math.round(i * 360 / numBars) +
          ", 100%, 50%)";
        context.fillRect(i * SPACING, this.height, BAR_WIDTH, -magnitude);
    }
}

// As written, I think this function will be a little glitchy
// for beat tones. There needs to be a better zero crossing check.
// For my purposes, the more naive approach might be better.
function findFirstPositiveZeroCrossing(buffer, buffer_length) {
    var MINVAL = 129; // 128 == zero, minimum detected signal level.
    var i = 0;
    var first_zero_index = null;

    // advance until we're zero or negative
    while (i < buffer_length && buffer[i] > 128) {
        ++i;
    }

    if (i >= buffer_length) {
        first_zero_index = 0;
    }

    // advance until we're above MINVAL, keeping track of first zero.
    for (; i < buffer_length && buffer[i] < MINVAL; ++i) {
        if (buffer[i] >= 128) {
            if (first_zero_index == null) {
                first_zero_index = i;
            }
        } else {
            first_zero_index = null;
        }
    }

    // we may have jumped over MINVAL in one sample.
    if (first_zero_index == null) {
        first_zero_index = i;
    }

    if (i == buffer_length) {
        // We didn't find any positive zero crossings
        first_zero_index = 0;
    }

    return first_zero_index;
}

