const displayState = {
  width: 64,
  height: 32,
  xDensity: 3,
  yDensity: 3,
};
const displayPixels = new Array(displayState.height)
  .fill(0)
  .map((e) => new Array(displayState.width).fill(0));

updateCanvas();
randomize();

function setPixelsByte(x, y, byte) {}

function updateCanvas() {
  const canvas = document.getElementById("monitor");
  canvas.width = displayState.width * displayState.xDensity;
  canvas.height = displayState.height * displayState.yDensity;
}

function randomize() {
  const canvas = document.getElementById("monitor");
  const ctx = canvas.getContext("2d");

  const width = canvas.width / displayState.xDensity;
  const height = canvas.height / displayState.yDensity;
  // console.log(width + " " + height);

  for (let i = 0; i < width * height; i++) {
    const x = i % width;
    const y = Math.floor(i / width);
    const bit = Math.floor(Math.random() * 2);

    setPixel(ctx, x, y, bit);
  }
}

function setPixel(ctx, x, y, bit) {
  x = x * displayState.xDensity;
  y = y * displayState.yDensity;
  if (bit) {
    ctx.fillStyle = "green";
  } else {
    ctx.fillStyle = "black";
  }
  ctx.fillRect(x, y, displayState.xDensity, displayState.yDensity);
}
