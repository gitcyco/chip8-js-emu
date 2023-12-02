// Browser specific display class, extends the generic Display class.

const Display = require("./display");

class BrowserDisplay extends Display {
  constructor(width, height, xDensity, yDensity) {
    super(width, height, xDensity, yDensity);
  }
  updateCanvas() {
    const canvas = document.getElementById("monitor");
    canvas.width = this.width * this.xDensity;
    canvas.height = this.height * this.yDensity;
    this.displayPixels = new Array(this.height)
      .fill(0)
      .map((e) => new Array(this.width).fill(0));
  }
  setPixel(ctx, x, y, bit) {
    x = x * this.xDensity;
    y = y * this.yDensity;
    if (bit) {
      ctx.fillStyle = "green";
    } else {
      ctx.fillStyle = "black";
    }
    ctx.fillRect(x, y, this.xDensity, this.yDensity);
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
}

module.exports = BrowserDisplay;
