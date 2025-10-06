class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.targetSamples = 320; // ~20ms at 16kHz
  }

  process(inputs) {
    const input = inputs[0][0]; // first channel
    if (!input) return true;

    this.buffer.push(...input);

    if (this.buffer.length >= this.targetSamples) {
      const chunk = this.buffer.splice(0, this.targetSamples);
      this.port.postMessage(chunk);
    }

    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
