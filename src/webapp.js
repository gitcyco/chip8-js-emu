const CPU = require("./lib/cpu");
const BrowserDisplay = require("./lib/browserDisplay");
const BrowserKeyboard = require("./lib/browserKeyboard");

const display = new BrowserDisplay(64, 32, 10, 10);
const keyboard = new BrowserKeyboard();
const cpu = new CPU(display, keyboard, 4096, 48);

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
  cpu.fetchInstruction();
});

const resetButton = document.getElementById("reset-cpu");
resetButton.addEventListener("click", (e) => {
  cpu.initialize();
});

// randomize();

// display.setPixelsByte(22, 10, 202);
// display.setPixelsByte(22, 15, 212);
display.setPixelsByte(22, 20, 242);
display.paint();

function randomize() {
  for (let x = 0; x < display.width; x++) {
    for (let y = 0; y < display.height; y++) {
      display.displayPixels[y][x] = Math.random() < 0.5 ? 0 : 1;
    }
  }
  display.paint();
}
