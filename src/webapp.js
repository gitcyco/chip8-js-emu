const CPU = require("./lib/cpu");
const BrowserDisplay = require("./lib/browserDisplay");
const BrowserKeyboard = require("./lib/browserKeyboard");

try {
  const display = new BrowserDisplay(64, 32, 10, 10);
  const keyboard = new BrowserKeyboard();
  const cpu = new CPU(display, keyboard, 4096, 48);
  // cpu.initialize();
  // cpu.loadFromLocalFile("../roms/IBM Logo.ch8");

  const loadButton = document.getElementById("load-rom");
  loadButton.addEventListener("click", async (e) => {
    const rom = document.getElementById("input-rom").files[0];
    if (rom) {
      console.log("loaded rom:", rom);
      await cpu.loadRAMFromLocalFile(rom);
    }
  });

  const stepButton = document.getElementById("step-rom");
  stepButton.addEventListener("click", (e) => {
    try {
      const currentData = cpu.currentRamChunk;
      const currentDataOutput = document.getElementById("current-ram-chunk");

      currentDataOutput.value = convertToHex(currentData);
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

  const keyPad = document.getElementsByClassName("key-button");
  for (let button of keyPad) {
    // console.log(button.innerText);
    button.addEventListener("mousedown", (e) => {
      const key = e.target.innerText.toUpperCase();
      keyboard.keyDown(key);
      console.log(`button ${key} is down`);
    });
    button.addEventListener("mouseup", (e) => {
      const key = e.target.innerText.toUpperCase();
      keyboard.keyUp(key);
      console.log(`button ${key} is up`);
    });
  }

  const legacyFields = document.getElementById("legacy");

  for (let box of legacyFields.childNodes) {
    if (box.type === "checkbox") {
      box.addEventListener("change", (e) => {
        updateSettings(cpu);
      });
    }
  }

  const loadROM = document.getElementById("load-selected-rom");
  loadROM.addEventListener("click", async (e) => {
    const dropDown = document.getElementById("rom-select");
    console.log(dropDown.value);
    const rom = await fetch(dropDown.value);
    const romBlob = await rom.blob();
    cpu._terminateRunner = true;
    await cpu.initialize();
    await cpu.loadRAMFromLocalFile(romBlob);
  });

  // setInterval(() => {
  //   const key = keyboard.keys.indexOf(1);
  //   if (key !== -1) {
  //     console.log(`key ${keyboard.keySymbols[key]} is currently being pressed`);
  //   }
  // }, 1);

  // display.setPixelsByte(22, 20, 242);
  // display.paint();
} catch (error) {
  console.error("ERROR:", error);
}

function convertToHex(byteArray) {
  return Array.from(byteArray, (byte) => {
    return ("0" + (byte & 0xff).toString(16)).slice(-2);
  }).join("");
}

function updateSettings(cpu) {
  const legacyFields = document.getElementById("legacy");
  const settings = [];
  for (let box of legacyFields.childNodes) {
    if (box.type === "checkbox") {
      if (box.checked) {
        settings.push([box.id, true]);
      } else {
        settings.push([box.id, false]);
      }
    }
  }
  cpu.setLegacyModes(settings);
}

async function fetchAndParseFiles(dir) {
  try {
    const response = await fetch(dir);

    if (!response.ok) {
      throw new Error(`Error fetching HTML: ${response.statusText}`);
    }

    const htmlText = await response.text();
    const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(htmlText, "text/html");

    const anchorTags = htmlDoc.querySelectorAll("a");

    const fileLinks = [];

    anchorTags.forEach((anchor) => {
      const href = anchor.getAttribute("href");
      if (href && href !== "/" && !href.startsWith("#") && href.includes(".ch8")) {
        fileLinks.push(href);
      }
    });

    console.log("Files:", fileLinks);
    const dropDown = document.getElementById("rom-select");
    for (let file of fileLinks) {
      dropDown.add(new Option(decodeURIComponent(file), file));
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchAndParseFiles("roms");
