function setPixel(ctx, x, y, bit) {
  x = x * 10;
  y = y * 10;
  if (bit) {
    ctx.fillStyle = "green";
  } else {
    ctx.fillStyle = "black";
  }
  ctx.fillRect(x, y, 10, 10);
}

const canvas = document.getElementById("monitor");
const ctx = canvas.getContext("2d");

const width = canvas.width / 10;
const height = canvas.height / 10;
console.log(width + " " + height);

for (let i = 0; i < width * height; i++) {
  const x = i % width;
  const y = Math.floor(i / width);
  const bit = Math.floor(Math.random() * 2);

  setPixel(ctx, x, y, bit);
}
