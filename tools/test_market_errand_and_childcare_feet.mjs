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

assert.match(css,/motion-errand\{\s*transition:left \.30s linear!important;/s,'errand travel should be smooth and match its slower frame cadence');
assert.ok(app.includes("activity==='errand'?300")&&app.includes("activity==='errand'?20:30"),'errand walking must use a relaxed 300ms base cadence');
assert.match(css,/motion-errand\[data-errand-starting="true"\]\{\s*transition:none!important;/s,'offscreen reset must not visibly slide backward');
assert.match(css,/data-errand-direction="right"\]>img\{\s*transform:none!important;/s,'rightward actor must face right');
assert.match(css,/data-errand-direction="left"\]>img\{\s*transform:scaleX\(-1\)!important;/s,'leftward actor must face left');

const validateFrames=(frames,label)=>frames.map(file=>{
  assert.ok(fs.existsSync(file),`missing childcare running frame: ${path.basename(file)}`);
  const bytes=fs.readFileSync(file);
  assert.ok(bytes.length>50000,`${label} frame is unexpectedly small: ${path.basename(file)}`);
  assert.deepEqual([...bytes.subarray(0,8)],[137,80,78,71,13,10,26,10],`${path.basename(file)} must be a PNG`);
  assert.equal(bytes.readUInt32BE(16),320,`${path.basename(file)} width must be 320`);
  assert.equal(bytes.readUInt32BE(20),320,`${path.basename(file)} height must be 320`);
  assert.equal(bytes[25],6,`${path.basename(file)} must retain RGBA transparency`);
  return crypto.createHash('sha256').update(bytes).digest('hex');
});
const heroDir=path.join(root,'assets','schedule-layers-v2','childcare','hero-actions','chase-running-v3');
const heroFrames=[1,2,3,4,5,6].map(number=>path.join(heroDir,`seonhwa-chase-v3-${number}.png`));
const heroHashes=validateFrames(heroFrames,'Seonhwa running');
assert.equal(new Set(heroHashes).size,6,'all six Seonhwa foot-motion frames must be distinct files');
const crossDir=path.join(root,'assets','schedule-layers-v2','childcare','hero-actions','chase-running-v4');
validateFrames([1,2].map(number=>path.join(crossDir,`seonhwa-chase-cross-v4-${number}.png`)),'Seonhwa crossing');
assert.ok(app.includes("Array.from({length:6},(_,index)=>`hero-actions/chase-running-v3/seonhwa-chase-v3-${index+1}.png`)"),'app must retain all six Seonhwa v3 frames');
assert.ok(app.includes('const childcareHeroRunCycle=[0,6,3,1,7,4,2,5]')&&app.includes('travelStep%childcareHeroRunCycle.length'),'Seonhwa must pass through both new crossed-leg frames');

const babySets=[
  ['child-running-v2','child-run-v2'],
  ['child-idle-v2','child-idle-v2'],
  ['child-fall-v2','child-fall-v2']
];
for(const [folder,prefix] of babySets){
  const frames=[1,2,3].map(number=>path.join(root,'assets','schedule-layers-v2','childcare','npc',folder,`${prefix}-${number}.png`));
  const hashes=validateFrames(frames,folder);
  assert.equal(new Set(hashes).size,3,`${folder} must contain three distinct poses`);
  for(const number of [1,2,3])assert.ok(app.includes(`npc/${folder}/${prefix}-${number}.png`),`app must use ${folder} frame ${number}`);
}

const childCross=path.join(root,'assets','schedule-layers-v2','childcare','npc','child-running-v3','child-run-v3-cross.png');
validateFrames([childCross],'child crossing');
assert.ok(app.includes('const childcareNpcRunCycle=[0,3,2,3]'),'child must pass through the close crossed-leg frame between wide strides');
assert.ok(app.includes("const requiredNpcFrameCount=actionId==='childcare'?4:3")&&app.includes('npcFrames.length!==requiredNpcFrameCount'),'childcare playback must accept its fourth crossing frame');
const layeredQaBody=app.slice(app.indexOf('async function startScheduleLayerQaPattern'),app.indexOf('async function startStudyFailureQa'));
assert.ok(layeredQaBody.includes("const oneShotQa=scheduleQaActionId==='childcare'||(scheduleQaActionId==='farmwork'&&pattern==='fail-b')")&&layeredQaBody.includes("'아이 돌보기':'논가 닭 추격'")&&layeredQaBody.includes('finally{scheduleQaLoopRunning=false;}'),'childcare and farm chicken one-shot handling must live inside the layered QA runner');
assert.ok(html.includes('v0.64.155-debug'),'HTML cache revision must expose the new build');
assert.ok(css.includes('.stage-character[hidden]{display:none!important}'),'Hidden stage characters must stay hidden after chase scenes');
assert.ok(app.includes("const heroStart=travelsRight?-25:125")&&app.includes("*travelProgress*150"),'농가 닭 추격은 좌우 양방향으로 화면 밖까지 완주해야 합니다.');
assert.ok(app.includes("actionId==='farmwork'&&patternKey==='fail-b'))seonImage.closest('.stage-character')?.setAttribute('hidden','')"),'농가 추격 종료 좌표를 지우기 전에 선화를 숨겨 되감기 잔상을 막아야 합니다.');
assert.match(app,/childcare:\s*\{[^\n]+npc:null\s*\}/,'childcare must not enable the legacy static stage NPC before layered chase playback');
assert.ok(!css.includes('.npc-child'),'legacy childcare stage NPC CSS must be removed to prevent a pre-chase flash');
assert.ok(app.includes("const playbackLoopCount=actionId==='childcare'?6:3"),'all childcare outcomes must traverse the full 18-step track');
assert.ok(!app.includes('Math.min(.62,rawProgress)'),'failed childcare must not freeze at the middle of the stage');
assert.ok(app.includes('const fallen=failed&&travelStep>=7&&travelStep<=9'),'failure reaction must be a short moving beat before the chase continues');
assert.ok(app.includes("if(actionId==='childcare'||(actionId==='farmwork'&&patternKey==='fail-b'))seonImage.closest('.stage-character')?.setAttribute('hidden','')"),'childcare and farm chase must hide Seonhwa before clearing chase coordinates and layered styling');
assert.ok(app.includes("if(action.id==='childcare')stageCharacter.hidden=true"),'childcare result must hide the leftover Seonhwa frame');
console.log('market errand traversal and childcare foot-frame checks passed');
