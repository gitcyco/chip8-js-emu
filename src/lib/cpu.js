class CPU {
  constructor(display, keyboard, ramsize, stacksize) {
    console.log("new cpu");
    this.ram = new ArrayBuffer(ramsize);
    this.wordInterface = new Int16Array(this.ram);
    this.byteInterface = new Int8Array(this.ram);
    this.stack = new Stack(this.ram, stacksize);
    this.registers = new Array(16).fill(0);
    this.delayTimer = 0;
    this.soundtimer = 0;
    this.indexReg = 0;
    this.programCounter = 0;
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
