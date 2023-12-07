class Keyboard {
  constructor() {
    console.log("new keyboard instance.");
    this.keys = new Array(16).fill(0);
    this.keySymbols = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
    this.keyMap = this.keySymbols.reduce((map, key, index) => ((map[key] = index), map), {});
  }
  keyDown(key) {
    throw new Error("Must provide a 'keyUp' method for this keyboard.");
  }
  keyUp(key) {
    throw new Error("Must provide a 'keyUp' method for this keyboard.");
  }
}

module.exports = Keyboard;
