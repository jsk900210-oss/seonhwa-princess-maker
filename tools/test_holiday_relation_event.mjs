import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
assert.match(app,/game\.season==='봄'&&game\.week===1\?'설날':game\.season==='가을'&&game\.week===3\?'추석'/,'설날·추석 주간 판정이 필요합니다.');
assert.match(app,/record\.meetings>0&&!record\.holidayFlags\[flag\]/,'이미 만난 인물만 등장하고 같은 명절 이벤트는 중복되면 안 됩니다.');
assert.match(app,/record\.affinity=Math\.min\(100,record\.affinity\+8\)/,'명절 인연 이벤트가 호감도를 올려야 합니다.');
for(const id of ['doyun','seojin','yeonwoo','taegyeom','hyeon'])assert.match(app,new RegExp(`${id}:'`),`${id} 명절 대사가 필요합니다.`);
assert.match(app,/if\(!presentHolidayRelation\(\)&&!presentActivityUnlocks\(\)\)openVisitingMerchant\(\)/,'명절 이벤트가 다른 주간 팝업과 겹치면 안 됩니다.');
console.log('PASS: 설날·추석 인연 이벤트, 중복 방지, 주간 팝업 순서');
