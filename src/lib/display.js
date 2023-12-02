// This is the base class for the generic display interface.
// Extend this class and implement the required methods.

class Display {
  constructor(width, height, xDensity, yDensity) {
    this.width = width;
    this.height = height;
    this.xDensity = xDensity;
    this.yDensity = yDensity;
    this.displayPixels = [[]];
  }
  updateCanvas() {
    throw new Error("Must provide an 'updateCanvas' method for this display");
  }
  setPixel() {
    throw new Error("Must provide a 'setPixel' method for this display");
  }
  paint() {
    throw new Error("Must provide a 'paint' method for this display");
  }
}

module.exports = Display;
