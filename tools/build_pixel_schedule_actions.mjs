import sharp from "file:///C:/Users/jsk90/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";
import path from "node:path";
const [sourceDir, outputDir] = process.argv.slice(2);
if (!sourceDir || !outputDir) throw new Error("source and output directories are required");

const sheets = [
  { file: "core-pixel-sheet-v1.png", rows: [["calligraphy", "seated"], ["arithmetic", "seated"], ["manners", "standing"], ["sweeping", "bent"]] },
  { file: "work-a-pixel-sheet-v1.png", rows: [["herbs", "floorwork"], ["childcare", "seated"], ["kitchenhelp", "seated"], ["houseclean", "floorwork"]] },
  { file: "work-b-pixel-sheet-v1.png", rows: [["woodwork", "seated"], ["loomwork", "seated"], ["masonry", "floorwork"], ["clinichelp", "seated"]] },
  { file: "utility-pixel-sheet-v1.png", rows: [["ferryhelp", "standing"], ["merchanthelp", "standing"], ["errand", "standing"], ["tea", "seated"]] },
  { file: "rest-pixel-sheet-v1.png", rows: [["sleep", "horizontal"], ["fail", "standing"], ["eating", "seated"], ["sit", "seated"]] }
];

const targetExtent = { standing: 280, bent: 274, seated: 263, floorwork: 246, horizontal: 246 };

function removeConnectedBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0, tail = 0;
  const isBackground = point => {
    const offset = point * 4;
    const r = data[offset], g = data[offset + 1], b = data[offset + 2];
    const min = Math.min(r, g, b), max = Math.max(r, g, b);
    return (min >= 198 && max - min <= 26) || (max <= 22 && max - min <= 14);
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

function keepLargestComponent(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let largest = [];
  for (let start = 0; start < visited.length; start += 1) {
    if (visited[start] || data[start * 4 + 3] < 24) continue;
    let head = 0, tail = 0;
    const component = [];
    visited[start] = 1;
    queue[tail++] = start;
    while (head < tail) {
      const point = queue[head++], x = point % width, y = Math.floor(point / width);
      component.push(point);
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const next = ny * width + nx;
        if (visited[next] || data[next * 4 + 3] < 24) continue;
        visited[next] = 1;
        queue[tail++] = next;
      }
    }
    if (component.length > largest.length) largest = component;
  }
  const keep = new Uint8Array(width * height);
  for (const point of largest) keep[point] = 1;
  for (let point = 0; point < visited.length; point += 1) if (!keep[point]) data[point * 4 + 3] = 0;
}

for (const sheet of sheets) {
  const source = path.join(sourceDir, sheet.file);
  const metadata = await sharp(source).metadata();
  const cellWidth = Math.floor(metadata.width / 3);
  const cellHeight = Math.floor(metadata.height / 4);
  for (let row = 0; row < 4; row += 1) for (let column = 0; column < 3; column += 1) {
    const [activity, pose] = sheet.rows[row];
    const width = column === 2 ? metadata.width - cellWidth * 2 : cellWidth;
    const height = row === 3 ? metadata.height - cellHeight * 3 : cellHeight;
    const { data, info } = await sharp(source)
      .extract({ left: column * cellWidth, top: row * cellHeight, width, height })
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    removeConnectedBackground(data, info.width, info.height);
    keepLargestComponent(data, info.width, info.height);
    const cutout = await sharp(data, { raw: info }).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    const cutoutInfo = await sharp(cutout).metadata();
    const extent = targetExtent[pose];
    const scale = pose === "horizontal" ? extent / cutoutInfo.width : extent / cutoutInfo.height;
    const targetWidth = Math.max(1, Math.round(cutoutInfo.width * scale));
    const targetHeight = Math.max(1, Math.round(cutoutInfo.height * scale));
    if (targetWidth > 304 || targetHeight > 304) throw new Error(`${activity}-${column + 1} exceeds safe canvas`);
    const left = Math.floor((320 - targetWidth) / 2), right = 320 - targetWidth - left;
    const bottom = 16, top = 320 - targetHeight - bottom;
    await sharp(cutout)
      .resize({ width: targetWidth, height: targetHeight, fit: "fill", kernel: sharp.kernel.nearest })
      .extend({ top, bottom, left, right, background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, `${activity}-pixel-${column + 1}.png`));
  }
}
