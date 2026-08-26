import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=fs.readFileSync(path.join(root,'src','app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'src','schedule.css'),'utf8');
const html=fs.readFileSync(path.join(root,'src','index.html'),'utf8');

assert.match(app,/const fullErrandTrack=\[-24,-8,8,24,40,56,72,88,104,124\]/,'errand must start and finish fully outside the framed stage');
assert.match(app,/dayIndex%2===0/,'normal errand direction must alternate by day');
assert.match(app,/\[\.\.\.fullErrandTrack\]\.reverse\(\)/,'leftward errand must reverse the same complete track');
assert.match(app,/errandFailed\?directedErrandTrack\.slice\(0,6\):directedErrandTrack/,'failed errands must stop on stage for the fall reaction');
assert.match(app,/actor\.dataset\.errandDirection=errandTravelsRight\?'right':'left'/,'actor direction must be exposed to CSS');
assert.match(app,/scheduleLayerIds\.has\(action\.id\)\|\|action\.id==='errand'/,'errand outcome must be known before traversal');
assert.match(app,/currentMasteryRank,index,outcome\)/,'the live schedule must pass day and outcome into actor animation');
assert.match(app,/stageCharacter\.style\.removeProperty\('left'\)/,'moving coordinates must be cleared between schedule days');
assert.match(app,/if\(actionId==='errand'\)\{initErrandQa\(\);return;\}/,'standalone errand QA must be available');

assert.match(css,/motion-errand\{\s*transition:left \.17s linear!important;/s,'errand travel should be smooth and match its frame cadence');
assert.match(css,/motion-errand\[data-errand-starting="true"\]\{\s*transition:none!important;/s,'offscreen reset must not visibly slide backward');
assert.match(css,/data-errand-direction="right"\]>img\{\s*transform:none!important;/s,'rightward actor must face right');
assert.match(css,/data-errand-direction="left"\]>img\{\s*transform:scaleX\(-1\)!important;/s,'leftward actor must face left');

const frameDir=path.join(root,'assets','schedule-layers-v2','childcare','hero-actions','chase-running-v2');
const frames=[1,2,3].map(number=>path.join(frameDir,`seonhwa-chase-v2-${number}.png`));
const hashes=frames.map(file=>{
  assert.ok(fs.existsSync(file),`missing childcare running frame: ${path.basename(file)}`);
  const bytes=fs.readFileSync(file);
  assert.ok(bytes.length>50000,`childcare running frame is unexpectedly small: ${path.basename(file)}`);
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],`${path.basename(file)} must be a PNG`);
  assert.equal(bytes.readUInt32BE(16),320,`${path.basename(file)} width must be 320`);
  assert.equal(bytes.readUInt32BE(20),320,`${path.basename(file)} height must be 320`);
  assert.equal(bytes[25],6,`${path.basename(file)} must retain RGBA transparency`);
  return crypto.createHash('sha256').update(bytes).digest('hex');
});
assert.equal(new Set(hashes).size,3,'all three foot-contact frames must be visually distinct files');
for(const number of [1,2,3])assert.ok(app.includes(`hero-actions/chase-running-v2/seonhwa-chase-v2-${number}.png`),`app must use childcare v2 frame ${number}`);

assert.ok(html.includes('v0.64.88-debug'),'HTML cache revision must expose the new build');
console.log('market errand traversal and childcare foot-frame checks passed');
