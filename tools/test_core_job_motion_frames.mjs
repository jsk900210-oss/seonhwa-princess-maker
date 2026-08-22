import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'..');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'src/schedule.css'),'utf8');
const jobs=['farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','ferryhelp','merchanthelp'];

for(const job of jobs){
  const frames=manifest.schedules[job].existingHeroFrames;
  assert.equal(frames.length,3,`${job} needs three approved hero frames`);
  frames.forEach(frame=>assert.ok(fs.existsSync(path.resolve(root,frame.replace(/^\.\.\//,''))),`${frame} missing`));
  assert.match(css,new RegExp(`action-${job}`));
}
assert.match(app,/for\(let frame=0;frame<3;frame\+=1\)/);
assert.match(app,/async function playScheduleLayerScene/);
assert.match(app,/guardianCompanion'\)\.addEventListener\('click',startGuardianConversation\)/);
console.log('PASS: 농가·아이 돌보기·주방 보조 전용 3프레임과 배경별 배치·신수 대화 연결');
