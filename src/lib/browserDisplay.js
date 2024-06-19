// Browser specific display class, extends the generic Display class.

const Display = require("./display");
const COLORS = { ON: "green", OFF: "black" };

class BrowserDisplay extends Display {
  constructor(width, height, xDensity, yDensity, canvasId) {
    super(width, height, xDensity, yDensity);
    this.canvasId = canvasId;
    this.canvas = this.getCanvas();
    this.ctx = this.canvas.getContext("2d");
    this.imageData = this.ctx.createImageData(this.canvas.width, this.canvas.height);
    this.reset();
  }
  static MASKS = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01];
  getCanvas() {
    return document.getElementById(this.canvasId);
  }
  reset() {
    this.canvas.width = this.width * this.xDensity;
    this.canvas.height = this.height * this.yDensity;
    this.displayPixels = new Array(this.height).fill(0).map((e) => new Array(this.width).fill(0));
    this.clearImageData();
  }
  clearImageData() {
    for (let i = 0; i < this.imageData.data.length; i += 4) {
      this.imageData.data[i] = 0; // R
      this.imageData.data[i + 1] = 0; // G
      this.imageData.data[i + 2] = 0; // B
      this.imageData.data[i + 3] = 255; // A (fully opaque)
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }
  setPixel(x, y, bit) {
    x = x * this.xDensity;
    y = y * this.yDensity;
    const baseIndex = (y * this.canvas.width + x) * 4;

    for (let dy = 0; dy < this.yDensity; dy++) {
      for (let dx = 0; dx < this.xDensity; dx++) {
        const index = baseIndex + (dy * this.canvas.width + dx) * 4;
        if (bit) {
          this.imageData.data[index] = 0; // R
          this.imageData.data[index + 1] = 255; // G
          this.imageData.data[index + 2] = 0; // B
        } else {
          this.imageData.data[index] = 0; // R
          this.imageData.data[index + 1] = 0; // G
          this.imageData.data[index + 2] = 0; // B
        }
        // Alpha is always 255 (opaque)
      }
    }
  }
  setPixelsByte(x, y, byte) {
    x = x % this.width;
    y = y % this.height;
    let unset = false;
    for (let i = 0; i < 8 && x + i < this.width; i++) {
      if (byte & BrowserDisplay.MASKS[i]) {
        this.displayPixels[y][x + i] ^= 1;
        if (this.displayPixels[y][x + i] === 0) unset = true;
      }
    }
    return unset;
  }
  paint() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.setPixel(x, y, this.displayPixels[y][x]);
      }
    }
    this.ctx.putImageData(this.imageData, 0, 0);
  }
  randomize() {
    for (let x = 0; x < display.width; x++) {
      for (let y = 0; y < display.height; y++) {
        this.displayPixels[y][x] = Math.random() < 0.5 ? 0 : 1;
      }
    }
    display.paint();
  }
}

module.exports = BrowserDisplay;
