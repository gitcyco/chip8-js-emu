const Keyboard = require("./keyboard");

class BrowserKeyboard extends Keyboard {
  constructor() {
    super();
  }
  keyDown(key) {
    const keyPressed = key.toUpperCase();
    if (keyPressed in this.keyMap) {
      this.keys[this.keyMap[keyPressed]] = 1;
    }
  }
  keyUp(key) {
    const keyPressed = key.toUpperCase();
    if (keyPressed in this.keyMap) {
      this.keys[this.keyMap[keyPressed]] = 0;
    }
  }
}

module.exports = BrowserKeyboard;
