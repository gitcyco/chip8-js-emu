const CPU = require("./lib/cpu");
const BrowserDisplay = require("./lib/browserDisplay");
const BrowserKeyboard = require("./lib/browserKeyboard");

try {
  const display = new BrowserDisplay(64, 32, 10, 10);
  const keyboard = new BrowserKeyboard();
  const cpu = new CPU(display, keyboard, 4096, 48);
  cpu.initialize();

  // cpu.loadFromLocalFile("../roms/IBM Logo.ch8");

  const loadButton = document.getElementById("load-rom");
  loadButton.addEventListener("click", async (e) => {
    const rom = document.getElementById("input-rom").files[0];
    if (rom) {
      console.log("loaded rom:", rom);
      await cpu.loadFromLocalFile(rom);
    }
  });

  const stepButton = document.getElementById("step-rom");
  stepButton.addEventListener("click", (e) => {
    try {
      cpu.cycle();
    } catch (error) {
      console.error("ERROR:", error);
    }
  });

  const resetButton = document.getElementById("reset-cpu");
  resetButton.addEventListener("click", (e) => {
    cpu.initialize();
  });

  const runButton = document.getElementById("run-rom");
  runButton.addEventListener("click", (e) => {
    cpu._terminateRunner = false;
    cpu.runner();
  });

  const stopButton = document.getElementById("stop-rom");
  stopButton.addEventListener("click", (e) => {
    console.log("attempting to stop running...");
    cpu._terminateRunner = true;
  });

  document.addEventListener("keydown", (e) => {
    // console.log(`key is down: ${e.key}`);
    keyboard.keyDown(e.key);
  });

  document.addEventListener("keyup", (e) => {
    // console.log(`key is up: ${e.key}`);
    keyboard.keyUp(e.key);
  });

  // setInterval(() => {
  //   const key = keyboard.keys.indexOf(1);
  //   if (key !== -1) {
  //     console.log(`key ${keyboard.keySymbols[key]} was pressed`);
  //   }
  // }, 1);

  // randomize();

  // display.setPixelsByte(22, 10, 202);
  // display.setPixelsByte(22, 15, 212);
  // display.setPixelsByte(22, 20, 242);
  // display.paint();

  function randomize() {
    for (let x = 0; x < display.width; x++) {
      for (let y = 0; y < display.height; y++) {
        display.displayPixels[y][x] = Math.random() < 0.5 ? 0 : 1;
      }
    }
    display.paint();
  }
} catch (error) {
  console.error("ERROR:", error);
}
