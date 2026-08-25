import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const sharpEntry = path.join(process.env.USERPROFILE||'', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.mjs');
if(!fs.existsSync(sharpEntry))throw new Error(`Codex bundled sharp missing: ${sharpEntry}`);
const {default:sharp}=await import(pathToFileURL(sharpEntry));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = path.join(root, "assets/characters/seonhwa/schedule-actions");
const activities = ["calligraphy", "arithmetic", "manners", "sweeping", "herbs", "farmwork", "childcare", "kitchenhelp", "houseclean", "woodwork", "loomwork", "masonry", "clinichelp", "ferryhelp", "merchanthelp", "errand", "tea", "sleep", "fail", "eating", "sit"];

for (const activity of activities) for (let frame = 1; frame <= 3; frame += 1) {
  const file = path.join(directory, `${activity}-pixel-${frame}.png`);
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== 320 || info.height !== 320 || info.channels !== 4) throw new Error(`invalid canvas: ${activity}-${frame}`);
  let left = 320, top = 320, right = -1, bottom = -1;
  for (let y = 0; y < 320; y += 1) for (let x = 0; x < 320; x += 1) {
    if (data[(y * 320 + x) * 4 + 3] < 24) continue;
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y);
  }
  if (right < left || left < 8 || top < 8 || right > 311 || bottom > 311) throw new Error(`unsafe crop: ${activity}-${frame} (${left},${top})-(${right},${bottom})`);
}

const herbStartle = path.join(directory, "herbs-startle-arms-up-v1.png");
const {data:herbStartleData,info:herbStartleInfo}=await sharp(herbStartle).ensureAlpha().raw().toBuffer({resolveWithObject:true});
if(herbStartleInfo.width!==320||herbStartleInfo.height!==320||herbStartleInfo.channels!==4)throw new Error('invalid canvas: herbs-startle-arms-up-v1');
for(let offset=3;offset<herbStartleData.length;offset+=4){
  if(herbStartleData[offset]!==0&&herbStartleData[offset]!==255)throw new Error('white-matte risk: herb startle alpha must be binary');
}

console.log(`PASS: ${activities.length} activities × 3 pixel frames + herb startle, transparent safety margins`);
