import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'src/schedule.css'),'utf8');
const jobs=['farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','ferryhelp','merchanthelp'];

for(const job of jobs){
  const base=`${job}-v2`;
  for(let frame=1;frame<=3;frame++){
    assert.ok(fs.existsSync(path.join(root,'assets/characters/seonhwa/job-actions',`${base}-${frame}.png`)),`${base}-${frame} missing`);
  }
  const hashes=[1,2,3].map(frame=>crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'assets/characters/seonhwa/job-actions',`${base}-${frame}.png`))).digest('hex'));
  assert.equal(new Set(hashes).size,3,`${job} frames must all be distinct`);
  assert.match(css,new RegExp(`action-${job}`));
}
assert.match(app,/farmwork:\[0,0,1,1,2,2,2\]/);
assert.match(app,/childcare:\[0,0,1,1,2,2,2\]/);
assert.match(app,/kitchenhelp:\[0,0,1,1,1,2,2,2\]/);
assert.match(app,/function activityFrameSet\(activity\)[\s\S]*?unifiedFrames\(canonicalActivityAliases\[activity\]\|\|'errand'\)/);
assert.match(app,/guardianCompanion'\)\.addEventListener\('click',startGuardianConversation\)/);
console.log('PASS: 농가·아이 돌보기·주방 보조 전용 3프레임과 배경별 배치·신수 대화 연결');
