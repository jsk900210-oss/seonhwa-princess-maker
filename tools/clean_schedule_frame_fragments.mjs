import sharp from "file:///C:/Users/jsk90/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";
import path from "node:path";

const directory = process.argv[2];
if (!directory) throw new Error("schedule-actions directory is required");

for (const frame of [1, 2, 3]) {
  const file = path.join(directory, `herbs-${frame}.png`);
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const backgroundVisited = new Uint8Array(info.width * info.height);
  const backgroundQueue = [];
  const isBackground = point => {
    const offset = point * 4;
    const r = data[offset], g = data[offset + 1], b = data[offset + 2];
    const light = Math.min(r, g, b), chroma = Math.max(r, g, b) - light;
    return light >= 198 && chroma <= 24;
  };
  const enqueueBackground = point => {
    if (point < 0 || point >= backgroundVisited.length || backgroundVisited[point] || !isBackground(point)) return;
    backgroundVisited[point] = 1;
    backgroundQueue.push(point);
  };
  for (let x = 0; x < info.width; x += 1) {
    enqueueBackground(x);
    enqueueBackground((info.height - 1) * info.width + x);
  }
  for (let y = 0; y < info.height; y += 1) {
    enqueueBackground(y * info.width);
    enqueueBackground(y * info.width + info.width - 1);
  }
  for (let head = 0; head < backgroundQueue.length; head += 1) {
    const point = backgroundQueue[head], x = point % info.width;
    data[point * 4 + 3] = 0;
    if (x > 0) enqueueBackground(point - 1);
    if (x + 1 < info.width) enqueueBackground(point + 1);
    enqueueBackground(point - info.width);
    enqueueBackground(point + info.width);
  }
  const visited = new Uint8Array(info.width * info.height);
  const components = [];
  for (let start = 0; start < visited.length; start += 1) {
    if (visited[start] || data[start * 4 + 3] < 24) continue;
    const queue = [start];
    const component = [];
    visited[start] = 1;
    let minY = info.height;
    for (let head = 0; head < queue.length; head += 1) {
      const point = queue[head];
      const x = point % info.width;
      const y = Math.floor(point / info.width);
      minY = Math.min(minY, y);
      component.push(point);
      for (let dy = -1; dy <= 1; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        if (!dx && !dy) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || nx >= info.width || ny < 0 || ny >= info.height) continue;
        const next = ny * info.width + nx;
        if (visited[next] || data[next * 4 + 3] < 24) continue;
        visited[next] = 1;
        queue.push(next);
      }
    }
    components.push({ points: component, minY });
  }
  for (const component of components) {
    if (component.minY <= info.height * 0.60) continue;
    for (const point of component.points) data[point * 4 + 3] = 0;
  }
  // The generated source sheet overlaps the next row at the very bottom of
  // each herb frame. The valid herb pose ends above 70% of this crop.
  for (let y = Math.floor(info.height * 0.70); y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) data[(y * info.width + x) * 4 + 3] = 0;
  }
  const temporary = `${file}.cleaning.png`;
  await sharp(data, { raw: info }).png().toFile(temporary);
  await sharp(temporary).png().toFile(file);
  await import("node:fs/promises").then(({ unlink }) => unlink(temporary));
}
