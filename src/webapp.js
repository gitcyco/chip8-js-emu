const CPU = require("./lib/cpu");
const cpu = new CPU();
const BrowserDisplay = require("./lib/browserDisplay");

const display = new BrowserDisplay(64, 32, 10, 10);

display.updateCanvas();
display.paint();

randomize();

// setPixelsByte(62, 10, 202);
// display.paint();

function setPixelsByte(x, y, byte) {
  x = x % display.width;
  y = y % display.height;
  for (
    let i = 0, mask = 0x80;
    i < 8 && x + i < display.width;
    i++, mask >>= 1
  ) {
    if (byte & mask) {
      display.displayPixels[y][x + i] ^= 1;
      console.log("flip", x + i, y);
    }
  }
}

function randomize() {
  for (let x = 0; x < display.width; x++) {
    for (let y = 0; y < display.height; y++) {
      display.displayPixels[y][x] = Math.random() < 0.5 ? 0 : 1;
    }
  }
  display.paint();
}
