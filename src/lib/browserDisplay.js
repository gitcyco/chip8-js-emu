// Browser specific display class, extends the generic Display class.

const Display = require("./display");
const COLORS = { ON: "green", OFF: "black" };

class BrowserDisplay extends Display {
  static MASKS = [0x80, 0x40, 0x20, 0x10, 0x08, 0x04, 0x02, 0x01];
  constructor(width, height, xDensity, yDensity) {
    super(width, height, xDensity, yDensity);
    this.reset();
  }
  reset() {
    const canvas = document.getElementById("monitor");
    canvas.width = this.width * this.xDensity;
    canvas.height = this.height * this.yDensity;
    this.displayPixels = new Array(this.height).fill(0).map((e) => new Array(this.width).fill(0));
    this.paint();
  }
  setPixel(ctx, x, y, bit) {
    x = x * this.xDensity;
    y = y * this.yDensity;
    if (bit) {
      ctx.fillStyle = COLORS.ON;
    } else {
      ctx.fillStyle = COLORS.OFF;
    }
    ctx.fillRect(x, y, this.xDensity, this.yDensity);
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
    const canvas = document.getElementById("monitor");
    const ctx = canvas.getContext("2d");
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.setPixel(ctx, x, y, this.displayPixels[y][x]);
      }
    }
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
