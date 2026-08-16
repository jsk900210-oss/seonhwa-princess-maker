import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
assert.match(app,/const unlockedBefore=new Set\(actions\.filter\(actionUnlocked\)/,'주간 시작 시 해금 목록을 저장해야 합니다.');
assert.match(app,/pendingActivityUnlocks=actions\.filter\(action=>actionUnlocked\(action\)&&!unlockedBefore\.has\(action\.id\)\)/,'주간 종료 후 새 해금을 비교해야 합니다.');
assert.match(app,/function presentActivityUnlocks\(\)/,'신수 해금 안내가 필요합니다.');
assert.match(app,/신수의 새 활동 안내/,'안내 목적을 화면에 표시해야 합니다.');
assert.match(app,/if\(!presentActivityUnlocks\(\)\)openVisitingMerchant\(\)/,'방문상점과 안내가 겹치지 않아야 합니다.');
console.log('PASS: 조건 달성 후 신수 새 활동 안내 및 방문상점 순서');
