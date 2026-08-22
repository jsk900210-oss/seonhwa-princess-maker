import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
assert.match(app,/Math\.round\(Math\.abs\(numeric\)\*\.5\)/,'일정 능력치 성장 배율은 50%여야 합니다.');
assert.match(app,/orderedChangeEntries\(phaseDailyChange\(action\.change\)\)/,'실시간 변화 표시는 실제 보정값을 사용해야 합니다.');
assert.match(app,/const entries=orderedChangeEntries\(phaseDailyChange\(action\.change\)\)/,'게이지는 실제 보정값을 사용해야 합니다.');
console.log('PASS: 일정 능력치 성장 50% 완화 및 표시값 동기화');
