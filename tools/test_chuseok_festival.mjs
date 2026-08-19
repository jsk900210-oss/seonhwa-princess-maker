import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');

assert.match(app,/const chuseokContestRules=\[/,'추석 3종세트 규칙이 필요합니다.');
assert.match(app,/윷놀이'.*base:58.*growth:5/s,'윷놀이 기준과 연간 상승치가 필요합니다.');
assert.match(app,/제기차기'.*base:54.*growth:5/s,'제기차기 기준과 연간 상승치가 필요합니다.');
assert.match(app,/송편만들기'.*base:56.*growth:5/s,'송편만들기 기준과 연간 상승치가 필요합니다.');
assert.match(app,/function evaluateChuseokFestival\(\)/,'추석 3종세트 결과 계산 함수가 필요합니다.');
assert.match(app,/예선탈락[\s\S]*장려상[\s\S]*우수상[\s\S]*대상/,'추석 결과 등급이 4단계로 있어야 합니다.');
assert.match(app,/holidayContestResult\?`<br>\$\{holidayContestResult\.summary\}`:''/,'추석 결과가 하단 리포트에 노출되어야 합니다.');
assert.match(css,/top:35%!important/,'상태창에 가려지지 않도록 경고 문구 위치를 내려야 합니다.');
assert.match(css,/max-width:min\(72vw,240px\)!important/,'짧은 경고 문구는 충분히 넓고 중앙에 보여야 합니다.');

console.log('PASS: 추석 3종세트 판정과 경고문 위치');
