import sharp from "file:///C:/Users/jsk90/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs";
import path from "node:path";
const directory = process.argv[2];
if (!directory) throw new Error("schedule-base directory is required");

for (const direction of ["front", "right", "back", "left"]) {
  const input = path.join(directory, `stand-${direction}-v1.png`);
  const output = path.join(directory, `stand-${direction}-v2-sharp.png`);
  await sharp(input)
    .ensureAlpha()
    .linear(1.035, -3)
    .modulate({ saturation: 1.035 })
    .sharpen({ sigma: 0.72, m1: 0.72, m2: 1.35, x1: 2.2, y2: 8, y3: 14 })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);
}
