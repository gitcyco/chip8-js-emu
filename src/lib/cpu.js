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
  cycle() {
    // Run one clock cycle (one fetch, decode, execute iteration)
    const instruction = this.fetchInstruction();
    if (instruction === "null") {
      return null;
    }
    if (instruction === "0000") {
      throw new RangeError("Invalid memory access, instruction received was 0000");
    }
  }
  decodeExecuteInstruction(instruction) {
    if (!instruction) throw new TypeError(`Missing instruction`);
    const type = instruction[0];

    // Gigantic switch statement, this will definitely need to be refactored
    // and/or moved somewhere else
    switch (type) {
      case "0":
        {
          // 0NNN: call host cpu machine code routine (not implementing)
          switch (instruction[3]) {
            // 00E0: clear screen
            case "0":
              this.display.reset();
              break;
            // 00EE: return from subroutine
            case "E":
              {
                const addr = this.stack.pop();
                if (!addr) {
                  throw new RangeError("Invalid return address from stack");
                }
                this._programCounter = addr;
              }
              break;
            default:
              throw new Error(`Invalid instruction encountered: ${instruction}`);
          }
        }
        break;
      case "1":
        {
          // 1NNN: jump to address NNN
          const addr = parseInt(instruction.slice(1), 16);
          if (!addr) throw new RangeError(`Invalid jump address: ${addr} from instruction ${instruction}`);
          this._programCounter = addr;
        }
        break;
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
        {
          // 6XNN: Vx = NN  Sets VX to NN.
          const reg = parseInt(instruction[1], 16);
          const val = parseInt(instruction.slice(2), 16);
          this.registers[reg] = val;
        }
        break;
      case "7":
        {
          // 7XNN: Vx += NN  Adds NN to VX (carry flag is not changed).
          const reg = parseInt(instruction[1], 16);
          const val = parseInt(instruction.slice(2), 16);
          this.registers[reg] += val;
        }
        break;
      case "8":
      case "9":
      case "A":
        {
          // ANNN: I = NNN  Sets I to the address NNN.
          const addr = parseInt(instruction.slice(2), 16);
          if (!addr) throw new RangeError(`Invalid Index address: ${addr} from instruction ${instruction}`);
          this._indexReg = addr;
        }
        break;
      case "B":
      case "C":
      case "D":
        {
          // DXYN: Display  draw(Vx, Vy, N)
          // Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels.
          // Each row of 8 pixels is read as bit-coded starting from memory location I;
          // I value does not change after the execution of this instruction.
          // VF is set to 1 if any screen pixels are flipped from set to unset
          // when the sprite is drawn, and to 0 if that does not happen.
        }
        break;
      case "E":
      case "F":
      default:
        throw new Error(`Invalid instruction encountered: ${instruction}`);
    }
  }
  fetchInstruction() {
    if (!this._loadFileFinished) {
      console.error("No program has been loaded.");
      return "null";
    }
    if (this._programCounter >= this.byteInterface.length - 2) {
      throw new RangeError("Program Counter has exceeded memory bounds.");
    }
    const byte1 = this.byteInterface[this._programCounter];
    const byte2 = this.byteInterface[this._programCounter + 1];
    this._programCounter += 2;
    const instructionWord = (byte1.toString(16).padStart(2, 0) + byte2.toString(16).padStart(2, 0)).toUpperCase();
    console.log("instruction:", instructionWord);
    return instructionWord;
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
