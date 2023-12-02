const displayState = {
  width: 64,
  height: 32,
  xDensity: 10,
  yDensity: 10,
  displayPixels: [[]],
  updateCanvas: function () {
    const canvas = document.getElementById("monitor");
    canvas.width = this.width * this.xDensity;
    canvas.height = this.height * this.yDensity;
    this.displayPixels = new Array(this.height)
      .fill(0)
      .map((e) => new Array(this.width).fill(0));
  },
  setPixel: function (ctx, x, y, bit) {
    x = x * displayState.xDensity;
    y = y * displayState.yDensity;
    if (bit) {
      ctx.fillStyle = "green";
    } else {
      ctx.fillStyle = "black";
    }
    ctx.fillRect(x, y, displayState.xDensity, displayState.yDensity);
  },
  paint: function () {
    const canvas = document.getElementById("monitor");
    const ctx = canvas.getContext("2d");
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.setPixel(ctx, x, y, this.displayPixels[y][x]);
      }
    }
  },
};

displayState.updateCanvas();
displayState.paint();

// randomize();
// setPixelsByte(20, 10, 202);
// displayState.paint();

function setPixelsByte(x, y, byte) {
  x = x % displayState.width;
  y = y % displayState.height;

  for (
    let i = 0, mask = 0x80;
    i < 8 && x + i < displayState.width;
    i++, mask >>= 1
  ) {
    if (byte & mask) {
      displayState.displayPixels[y][x + i] =
        displayState.displayPixels[y][x + i] ^ 1;
      console.log("one");
    } else console.log("zero");
  }
}

function randomize() {
  for (let x = 0; x < displayState.width; x++) {
    for (let y = 0; y < displayState.height; y++) {
      displayState.displayPixels[y][x] = Math.random() < 0.5 ? 0 : 1;
    }
  }
  displayState.paint();
}

// function randomize() {
//   const canvas = document.getElementById("monitor");
//   const ctx = canvas.getContext("2d");
//
//   const width = canvas.width / displayState.xDensity;
//   const height = canvas.height / displayState.yDensity;
//   // console.log(width + " " + height);
//
//   for (let i = 0; i < width * height; i++) {
//     const x = i % width;
//     const y = Math.floor(i / width);
//     const bit = Math.floor(Math.random() * 2);
//     displayState.setPixel(ctx, x, y, bit);
//   }
// }
