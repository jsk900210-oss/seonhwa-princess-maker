import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/guardian-anime.css',import.meta.url),'utf8');
assert.match(app,/if\(hint\)\{hint\.hidden=true;hint\.textContent='';\}/,'중복 터치 안내 문구는 항상 숨겨야 합니다.');
assert.match(css,/data-phase="choice"[^}]*guardian-story-hint\{display:none!important\}/,'선택 단계에서 터치 안내를 숨겨야 합니다.');
assert.match(css,/not\(\[data-phase="choice"\]\) #guardianStoryNext\{display:none!important\}/,'소개 단계에서 선택 버튼을 숨겨야 합니다.');
console.log('PASS: 신수 소개 터치 안내와 선택 버튼 상호 배타 표시');
