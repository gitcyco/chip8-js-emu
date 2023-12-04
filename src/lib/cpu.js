const DELAY_TIMER_INTERVAL = 15;
const SOUND_TIMER_INTERVAL = 15;

// Some programs will expect that the first byte of the loaded program
// begin at address 0x200 (512) due to historical reasons.
// Changing this could break things, so we will just load the font data into low memory.
const LOAD_ADDRESS_BYTE = 0x200;
const LOAD_ADDRESS_WORD = 0x100;

class CPU {
  constructor(display, keyboard, ramsize, stacksize) {
    console.log("new cpu");
    this.display = display;
    this.keyboard = keyboard;
    this._ramsize = ramsize;
    this._stacksize = stacksize;
    this.initialize();
    // this._ram = new ArrayBuffer(this._ramsize);
    // this.wordInterface = new Uint16Array(this._ram);
    // this.byteInterface = new Uint8Array(this._ram);
    // this.stack = new Stack(this._ram, this._stacksize);
    // this.registers = new Array(16).fill(0);
    // this._delayTimer = 0;
    // this._soundtimer = 0;
    // this._indexReg = 0;
    // this._programCounter = LOAD_ADDRESS_BYTE;
    // this._dtClearInterval = null;
    // this._stClearInterval = null;
    // this._loadFileFinished = false;
  }
  fetchInstruction() {
    if (!this._loadFileFinished) {
      console.log("No program has been loaded.");
      return null;
    }
    if (this._programCounter >= this.byteInterface.length - 2) {
      throw new RangeError("Program Counter has exceeded memory bounds.");
    }
    const byte1 = this.byteInterface[this._programCounter];
    const byte2 = this.byteInterface[this._programCounter + 1];
    this._programCounter += 2;
    const instructionWord = (byte1.toString(16).padStart(2, 0) + byte2.toString(16).padStart(2, 0)).toUpperCase();
    console.log("instruction:", instructionWord);
  }
  async loadFromLocalFile(rom) {
    console.log("LOADING:", rom);
    const buffer = await rom.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const words = new Uint16Array(buffer);
    console.log("raw rom:", bytes, words);
    for (let i = 0; i < bytes.length; i++) {
      this.byteInterface[LOAD_ADDRESS_BYTE + i] = bytes[i];
    }
    // for (let i = 0; i < this.byteInterface.length; i += 2) {
    //   // First 4 bits: 61440
    //   // Last 12 bits: 4095
    //   const view1 = new DataView(this._ram);
    //   console.log("index:", i, view1.getUint16(i).toString(16).padStart(4, 0));
    // }
    this._loadFileFinished = true;
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
  initialize() {
    this._ram = new ArrayBuffer(this._ramsize);
    this.wordInterface = new Uint16Array(this._ram);
    this.byteInterface = new Uint8Array(this._ram);
    this.stack = new Stack(this._ram, this._stacksize);
    this.registers = new Array(16).fill(0);
    this._delayTimer = 0;
    this._soundtimer = 0;
    this._indexReg = 0;
    this._programCounter = LOAD_ADDRESS_BYTE;
    if (this._dtClearInterval) clearInterval(this._dtClearInterval);
    if (this._stClearInterval) clearInterval(this._stClearInterval);
    this._dtClearInterval = null;
    this._stClearInterval = null;
    this._loadFileFinished = false;
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
