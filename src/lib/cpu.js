const DELAY_TIMER_INTERVAL = 15;
const SOUND_TIMER_INTERVAL = 15;
const RUNNER_INTERVAL = 1;

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
    if (this._runnerClearInterval) clearInterval(this._run_runnerClearIntervalnerInterval);
    this._runnerClearInterval = null;
    this._terminateRunner = false;
    this._loadFileFinished = false;
    this.legacy8XY = false;
    this.legacyBNNN = true;
    this.cycleCounter = 0n;
    this.display.reset();
  }
  runner() {
    this._runnerClearInterval = setInterval(
      function () {
        if (this._terminateRunner || !this._loadFileFinished) {
          clearInterval(this._runnerClearInterval);
          this.cycleCounter = 0n;
          console.log("TERMINATING RUNNER");
        } else {
          this.cycleCounter++;
          if (this.cycleCounter % 100n === 0n) {
            console.log("RUNNING");
          }
          this.cycle();
        }
      }.bind(this),
      RUNNER_INTERVAL
    );
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
    this.decodeExecuteInstruction(instruction);
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
              // console.log(`${instruction}: Screen Reset`);
              this.display.reset();
              break;
            // 00EE: return from subroutine
            case "E":
              {
                // console.log(`${instruction}: Return from subroutine`);
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
        {
          // 2NNN: *(0xNNN)()  Calls subroutine at NNN.
          const addr = parseInt(instruction.slice(1), 16);
          if (!addr) throw new RangeError(`Invalid call address: ${addr} from instruction ${instruction}`);
          this.stack.push(this._programCounter);
          this._programCounter = addr;
        }
        break;
      case "3":
        {
          // 3XNN: Cond 	if (Vx == NN)  Skips the next instruction if VX equals NN
          const reg = parseInt(instruction[1], 16);
          const val = parseInt(instruction.slice(2), 16);
          if (this.registers[reg] === val) {
            this._programCounter += 2;
          }
        }
        break;
      case "4":
        {
          // 4XNN: Cond 	if (Vx != NN)  Skips the next instruction if VX does not equal NN
          const reg = parseInt(instruction[1], 16);
          const val = parseInt(instruction.slice(2), 16);
          if (this.registers[reg] !== val) {
            this._programCounter += 2;
          }
        }
        break;
      case "5":
        {
          // 5XY0: Cond 	if (Vx == Vy)  Skips the next instruction if VX equals VY
          const regX = parseInt(instruction[1], 16);
          const regY = parseInt(instruction[2], 16);
          if (this.registers[regX] === this.registers[regY]) {
            this._programCounter += 2;
          }
        }
        break;
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
          const num = parseInt(instruction.slice(2), 16);
          const val = num + this.registers[reg];
          if (val > 255) {
            val = val % 256;
          }
          this.registers[reg] = val;
        }
        break;
      case "8":
        {
          const type = instruction[3];
          switch (type) {
            case "0":
              {
                // 8XY0: Vx = Vy  Sets VX to the value of VY.
                const regX = parseInt(instruction[1], 16);
                const regY = parseInt(instruction[2], 16);
                this.registers[regX] = this.registers[regY];
              }
              break;
            case "1":
              {
                // 8XY1: Vx |= Vy  Sets VX to VX or VY. (bitwise OR operation)
                const regX = parseInt(instruction[1], 16);
                const regY = parseInt(instruction[2], 16);
                this.registers[regX] |= this.registers[regY];
              }
              break;
            case "2":
              {
                // 8XY2: Vx &= Vy  Sets VX to VX and VY. (bitwise AND operation)
                const regX = parseInt(instruction[1], 16);
                const regY = parseInt(instruction[2], 16);
                this.registers[regX] &= this.registers[regY];
              }
              break;
            case "3":
              {
                // 8XY3: Vx ^= Vy  Sets VX to VX xor VY. (bitwise XOR operation)
                const regX = parseInt(instruction[1], 16);
                const regY = parseInt(instruction[2], 16);
                this.registers[regX] ^= this.registers[regY];
              }
              break;
            case "4":
              {
                // 8XY4: Vx + Vy  Sets VX to VX + VY. Overflow of 8 bit value (>255) sets VF to 1, otherwise 0
                const regX = parseInt(instruction[1], 16);
                const regY = parseInt(instruction[2], 16);
                const val = this.registers[regX] + this.registers[regY];
                if (val > 255) {
                  val = val % 256;
                  this.registers[15] = 1;
                } else {
                  this.registers[15] = 0;
                }
                this.registers[regX] = val;
              }
              break;
            case "5":
              {
                // 8XY5: Vx - Vy  Sets VX to VX - VY. Borrow of 8 bit value (>255) sets VF to 0, otherwise 1 (if result < 0, VF == 0, else VF == 1)
                const regX = parseInt(instruction[1], 16);
                const regY = parseInt(instruction[2], 16);
                const val = this.registers[regX] - this.registers[regY];
                if (val < 0) {
                  val = (val + 256) % 256;
                  this.registers[15] = 0;
                } else {
                  this.registers[15] = 1;
                }
                this.registers[regX] = val;
              }
              break;
            case "6":
              {
                // 8XY6	BitOp  Vx >>= 1  Stores the least significant bit of VX in VF and then shifts VX to the right by 1.
                const regX = parseInt(instruction[1], 16);
                const regY = parseInt(instruction[2], 16);
                if (this.legacy8XY) {
                  this.registers[regX] = this.registers[regY];
                }
                const lowbit = this.registers[regX] & 1;
                this.registers[regX] >>>= 1;
                this.registers[15] = lowbit;
              }
              break;
            case "7":
              {
                // 8XY7: Vy - Vx  Sets VX to VY - Vx. Borrow of 8 bit value (>255) sets VF to 0, otherwise 1 (if result < 0, VF == 0, else VF == 1)
                const regX = parseInt(instruction[1], 16);
                const regY = parseInt(instruction[2], 16);
                const val = this.registers[regY] - this.registers[regX];
                if (val < 0) {
                  val = (val + 256) % 256;
                  this.registers[15] = 0;
                } else {
                  this.registers[15] = 1;
                }
                this.registers[regX] = val;
              }
              break;
            case "E":
              {
                // 8XY6	BitOp  Vx >>= 1  Stores the least significant bit of VX in VF and then shifts VX to the right by 1.
                const regX = parseInt(instruction[1], 16);
                const regY = parseInt(instruction[2], 16);
                if (this.legacy8XY) {
                  this.registers[regX] = this.registers[regY];
                }
                const highbit = this.registers[regX] >>> 7;
                this.registers[regX] <<= 1;
                this.registers[15] = highbit;
              }
              break;
            default:
              throw new Error(`Invalid instruction encountered: ${instruction}`);
          }
        }
        break;
      case "9":
        {
          // 9XY0: Cond 	if (Vx != Vy)  Skips the next instruction if VX does not equal VY
          const regX = parseInt(instruction[1], 16);
          const regY = parseInt(instruction[2], 16);
          if (this.registers[regX] !== this.registers[regY]) {
            this._programCounter += 2;
          }
        }
        break;
      case "A":
        {
          // ANNN: I = NNN  Sets I to the address NNN.
          const addr = parseInt(instruction.slice(1), 16);
          if (!addr) throw new RangeError(`Invalid Index address: ${addr} from instruction ${instruction}`);
          this._indexReg = addr;
          // console.log("updated index reg:", this._indexReg, addr);
        }
        break;
      case "B":
        {
          // BNNN Flow  PC = V0 + NNN  Jumps to the address NNN plus V0 (legacy mode - standard)
          // BXNN Flow  PC = Vx + XNN  Jumps to the address NNN plus Vx
          const regX = this.legacyBNNN ? 0 : parseInt(instruction[1], 16);
          const addr = parseInt(instruction.slice(1), 16);
          this._programCounter = addr + this.registers[regX];
        }
        break;
      case "C":
        {
          // CXNN  Rand  Vx = rand() & NN  Sets VX to the result of a bitwise AND operation on a random number (Typically: 0 to 255) and NN.
          // Math.floor(Math.random() * (max - min) + min)
          const regX = parseInt(instruction[1], 16);
          const nn = parseInt(instruction.slice(2), 16);
          const rand = Math.floor(Math.random() * 256);
          this.registers[regX] = nn & rand;
        }
        break;
      case "D":
        {
          // DXYN: Display  draw(Vx, Vy, N)
          // Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N pixels.
          // Each row of 8 pixels is read as bit-coded starting from memory location I;
          // I value does not change after the execution of this instruction.
          // VF is set to 1 if any screen pixels are flipped from set to unset
          // when the sprite is drawn, and to 0 if that does not happen.
          let startAddr = this._indexReg;
          const regX = parseInt(instruction[1], 16);
          const regY = parseInt(instruction[2], 16);
          const n = parseInt(instruction[3], 16);
          const x = this.registers[regX];
          let y = this.registers[regY];
          let flipped = false;
          for (let i = 0; i < n; i++) {
            // console.log("INDEX REG:", this._indexReg + i);
            // console.log("writing to display:", this.byteInterface[this._indexReg + i], "bin:", this.byteInterface[this._indexReg + i].toString(2));
            const result = this.display.setPixelsByte(x, y + i, this.byteInterface[this._indexReg + i]);
            if (result) flipped = true;
          }
          if (flipped) this.registers[15] = 1;
          else this.registers[15] = 0;
          this.display.paint();
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
    // console.log("instruction:", instructionWord);
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
    if (this.length >= this._maxSize) throw new RangeError("Stack size exceeded!");
    if (word > 0xfff) throw new RangeError(`Attempt to push invalid value to stack :${word}`);
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
