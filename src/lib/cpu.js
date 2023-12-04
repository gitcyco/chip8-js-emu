const DELAY_TIMER_INTERVAL = 15;
const SOUND_TIMER_INTERVAL = 15;

// Some programs will expect that the first byte of the loaded program
// begin at address 0x200 (512) due to historical reasons.
// Changing this could break things, so we will just load the font data into low memory.
const LOAD_ADDRESS = 0x200;

class CPU {
  constructor(display, keyboard, ramsize, stacksize) {
    console.log("new cpu");
    this._ram = new ArrayBuffer(ramsize);
    this.wordInterface = new Int16Array(this._ram);
    this.byteInterface = new Int8Array(this._ram);
    this.stack = new Stack(this._ram, stacksize);
    this.registers = new Array(16).fill(0);
    this._delayTimer = 0;
    this._soundtimer = 0;
    this._indexReg = 0;
    this._programCounter = 0;
    this._dtClearInterval = null;
    this._stClearInterval = null;
  }
  set delayTimer(val) {
    if (this._dtClearInterval) clearInterval(this._dtClearInterval);
    this._delayTimer = val;
    this._dtClearInterval = setInterval(
      function () {
        if (this._delayTimer > 0) this._delayTimer--;
        else {
          clearInterval(this._dtClearInterval);
          this._delayTimer = 0;
        }
      }.bind(this),
      DELAY_TIMER_INTERVAL
    );
  }
  get delayTimer() {
    return this._delayTimer;
  }
  set soundTimer(val) {
    if (this._stClearInterval) clearInterval(this._stClearInterval);
    this._soundTimer = val;
    this._stClearInterval = setInterval(
      function () {
        if (this._soundTimer > 0) this._soundTimer--;
        else {
          clearInterval(this._stClearInterval);
          this._soundTimer = 0;
        }
      }.bind(this),
      SOUND_TIMER_INTERVAL
    );
  }
  get soundTimer() {
    return this._soundTimer;
  }
}

class Stack {
  constructor(ram, size) {
    this._maxSize = size;
    this._stackInterface = new Int16Array(ram);
    this._stackPointer = this._stackInterface.length;
    this.length = this._stackInterface.length - this._stackPointer;
  }
  push(word) {
    console.log("pushing:", word);
    if (this.length >= this._maxSize) throw new Error("Stack size exceeded!");
    this._stackInterface[--this._stackPointer] = word;
    this.length++;
  }
  pop() {
    if (this.length === 0) return null;
    this.length--;
    return this._stackInterface[this._stackPointer++];
  }
}

module.exports = CPU;
