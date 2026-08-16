import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/guardian.css',import.meta.url),'utf8')+fs.readFileSync(new URL('../src/live-changes.css',import.meta.url),'utf8');

assert.match(html,/id="guardianTalkResult"[^>]*aria-live="polite"/,'신수 대화 결과 영역이 필요합니다.');
assert.match(app,/function renderGuardianTalkResult\(change\)/,'대화 결과 렌더러가 필요합니다.');
assert.match(app,/actualChange\[key\]=game\[key\]-before/,'제한 적용 후 실제 변화량을 계산해야 합니다.');
assert.match(app,/현재 \$\{clampStat\(key,game\[key\]\)\}/,'현재 수치를 함께 표시해야 합니다.');
assert.match(app,/portrait\.classList\.add\('is-listening'\)/,'답변 중에도 신수 모습이 유지되어야 합니다.');
assert.match(css,/\.home-greeting-head img\{[^}]*width:104px;[^}]*height:116px/,'신수 초상이 충분히 크게 보여야 합니다.');
assert.match(css,/\.guardian-talk-result span\.up/,'상승 표시 스타일이 필요합니다.');
assert.match(css,/\.guardian-talk-result span\.down/,'하락 표시 스타일이 필요합니다.');
console.log('guardian conversation result checks passed');
