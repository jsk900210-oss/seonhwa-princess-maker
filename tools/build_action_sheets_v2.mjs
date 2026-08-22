import sharp from "file:///C:/Users/jsk90/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";
import path from "node:path";

const [sourceDir, outputDir] = process.argv.slice(2);
if (!sourceDir || !outputDir) throw new Error("source and output directories are required");

const sheets = [
  ["calligraphy-sheet-v2.png", "calligraphy", 286],
  ["arithmetic-sheet-v2.png", "arithmetic", 286],
  ["sweeping-sheet-v2.png", "sweeping", 280],
  ["errand-sheet-v2.png", "errand", 280],
  ["herbs-sheet-v2.png", "herbs", 250],
  ["houseclean-sheet-v2.png", "houseclean", 250],
  ["farmwork-sheet-v2.png", "farmwork", 250],
];

function removeConnectedLightBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0, tail = 0;
  const isBackground = point => {
    const offset = point * 4;
    const r = data[offset], g = data[offset + 1], b = data[offset + 2];
    const min = Math.min(r, g, b), max = Math.max(r, g, b);
    return min >= 205 && max - min <= 24;
  };
  const enqueue = point => {
    if (point < 0 || point >= visited.length || visited[point] || !isBackground(point)) return;
    visited[point] = 1;
    queue[tail++] = point;
  };
  for (let x = 0; x < width; x += 1) { enqueue(x); enqueue((height - 1) * width + x); }
  for (let y = 0; y < height; y += 1) { enqueue(y * width); enqueue(y * width + width - 1); }
  while (head < tail) {
    const point = queue[head++], x = point % width;
    data[point * 4 + 3] = 0;
    if (x > 0) enqueue(point - 1);
    if (x + 1 < width) enqueue(point + 1);
    enqueue(point - width);
    enqueue(point + width);
  }
}

function removeSmallFragments(data, width, height) {
  const visited = new Uint8Array(width * height);
  const components = [];
  for (let start = 0; start < visited.length; start += 1) {
    if (visited[start] || data[start * 4 + 3] < 24) continue;
    const queue = [start], component = [];
    visited[start] = 1;
    for (let head = 0; head < queue.length; head += 1) {
      const point = queue[head], x = point % width, y = Math.floor(point / width);
      component.push(point);
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (visited[next] || data[next * 4 + 3] < 24) continue;
        visited[next] = 1;
        queue.push(next);
      }
    }
    components.push(component);
  }
  components.sort((a, b) => b.length - a.length);
  const minimum = Math.max(150, Math.floor((components[0]?.length || 0) * 0.004));
  for (const component of components) {
    if (component.length >= minimum) continue;
    for (const point of component) data[point * 4 + 3] = 0;
  }
}

for (const [file, activity, targetExtent] of sheets) {
  const source = path.join(sourceDir, file);
  const metadata = await sharp(source).metadata();
  const cellWidth = Math.floor(metadata.width / 3);
  for (let column = 0; column < 3; column += 1) {
    const width = column === 2 ? metadata.width - cellWidth * 2 : cellWidth;
    const { data, info } = await sharp(source)
      .extract({ left: column * cellWidth, top: 0, width, height: metadata.height })
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    removeConnectedLightBackground(data, info.width, info.height);
    removeSmallFragments(data, info.width, info.height);
    const cutout = await sharp(data, { raw: info })
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const cutoutInfo = await sharp(cutout).metadata();
    const scale = Math.min(targetExtent / cutoutInfo.height, 304 / cutoutInfo.width);
    const targetWidth = Math.max(1, Math.round(cutoutInfo.width * scale));
    const targetHeight = Math.max(1, Math.round(cutoutInfo.height * scale));
    const left = Math.floor((320 - targetWidth) / 2), right = 320 - targetWidth - left;
    const bottom = 12, top = 320 - targetHeight - bottom;
    await sharp(cutout)
      .resize({ width: targetWidth, height: targetHeight, fit: "fill", kernel: sharp.kernel.nearest })
      .extend({ top, bottom, left, right, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, `${activity}-pixel-${column + 1}.png`));
  }
}
