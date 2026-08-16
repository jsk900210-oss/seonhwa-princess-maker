import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve(import.meta.dirname,'..');
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'src/schedule.css'),'utf8');
const jobs=['farmwork','childcare','kitchenhelp'];

for(const job of jobs){
  for(let frame=1;frame<=3;frame++){
    assert.ok(fs.existsSync(path.join(root,'assets/characters/seonhwa/job-actions',`${job}-${frame}.png`)),`${job}-${frame} missing`);
  }
  assert.match(css,new RegExp(`action-${job}`));
}
assert.match(app,/farmwork:\[0,0,1,1,2,2,2\]/);
assert.match(app,/childcare:\[0,0,1,1,2,2,2\]/);
assert.match(app,/kitchenhelp:\[0,0,1,1,1,2,2,2\]/);
assert.match(app,/guardianCompanion'\)\.addEventListener\('click',startGuardianConversation\)/);
console.log('PASS: 농가·아이 돌보기·주방 보조 전용 3프레임과 배경별 배치·신수 대화 연결');
