class Keyboard {
  constructor() {
    console.log("new keyboard instance.");
    this.keys = new Array(16).fill(0);
  }
}

module.exports = Keyboard;
