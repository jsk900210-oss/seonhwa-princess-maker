import sharp from "file:///C:/Users/jsk90/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";
import path from "node:path";

const [source, outputDir, version = "v1"] = process.argv.slice(2);
if (!source || !outputDir) {
  throw new Error("usage: node build_schedule_turnaround.mjs <sheet.png> <output-dir>");
}

const directions = ["front", "right", "back", "left"];
const sheet = sharp(source).ensureAlpha();
const metadata = await sheet.metadata();
const cellWidth = Math.floor(metadata.width / 2);
const cellHeight = Math.floor(metadata.height / 2);

function isBackground(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return min >= 218 && max - min <= 18;
}

function removeConnectedLightBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const enqueue = (x, y) => {
    const index = y * width + x;
    if (visited[index]) return;
    const offset = index * 4;
    if (!isBackground(data[offset], data[offset + 1], data[offset + 2])) return;
    visited[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);
    data[index * 4 + 3] = 0;
    if (x > 0) enqueue(x - 1, y);
    if (x + 1 < width) enqueue(x + 1, y);
    if (y > 0) enqueue(x, y - 1);
    if (y + 1 < height) enqueue(x, y + 1);
  }
  return data;
}

function keepLargestOpaqueComponent(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let largest = [];
  for (let start = 0; start < width * height; start += 1) {
    if (visited[start] || data[start * 4 + 3] < 16) continue;
    let head = 0;
    let tail = 0;
    const component = [];
    visited[start] = 1;
    queue[tail++] = start;
    while (head < tail) {
      const index = queue[head++];
      component.push(index);
      const x = index % width;
      const y = Math.floor(index / width);
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          if (!dx && !dy) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
          const next = ny * width + nx;
          if (visited[next] || data[next * 4 + 3] < 16) continue;
          visited[next] = 1;
          queue[tail++] = next;
        }
      }
    }
    if (component.length > largest.length) largest = component;
  }
  const keep = new Uint8Array(width * height);
  for (const index of largest) keep[index] = 1;
  for (let index = 0; index < width * height; index += 1) {
    if (!keep[index]) data[index * 4 + 3] = 0;
  }
}

for (let index = 0; index < directions.length; index += 1) {
  const left = (index % 2) * cellWidth;
  const top = Math.floor(index / 2) * cellHeight;
  const { data, info } = await sharp(source)
    .extract({ left, top, width: cellWidth, height: cellHeight })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  removeConnectedLightBackground(data, info.width, info.height);
  keepLargestOpaqueComponent(data, info.width, info.height);
  const output = path.join(outputDir, `stand-${directions[index]}-${version}.png`);
  const cutout = await sharp(data, { raw: info })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  if (version.includes("pixel")) {
    const cutoutInfo = await sharp(cutout).metadata();
    const targetHeight = 280;
    const targetWidth = Math.max(1, Math.round(cutoutInfo.width * targetHeight / cutoutInfo.height));
    const left = Math.floor((320 - targetWidth) / 2);
    const right = 320 - targetWidth - left;
    await sharp(cutout)
      .resize({ width: targetWidth, height: targetHeight, fit: "fill", kernel: sharp.kernel.nearest })
      .extend({ top: 20, bottom: 20, left, right, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(output);
  } else {
    await sharp(cutout)
      .resize({ height: 560, fit: "inside", kernel: sharp.kernel.lanczos3 })
      .extend({ top: 24, bottom: 24, left: 24, right: 24, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(output);
  }
}
