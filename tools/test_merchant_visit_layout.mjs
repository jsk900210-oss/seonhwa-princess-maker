import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=readFileSync(join(root,'src','app.js'),'utf8');
const css=readFileSync(join(root,'src','style.css'),'utf8');

assert.ok(app.includes("classList.add('merchant-speaking')"),'방문상점 시작 시 홈 UI 격리 상태가 필요합니다.');
assert.ok(app.includes("classList.remove('merchant-speaking')"),'방문상점 종료 시 홈 UI를 복구해야 합니다.');
assert.match(css,/\.phone\.merchant-speaking>\.dialogue[\s\S]*?visibility:hidden!important/,'기존 홈 대화창을 숨겨야 합니다.');
assert.match(css,/@keyframes merchant-enter[\s\S]*?translateX\(-52%\)[\s\S]*?translateX\(4%\)/,'방문 인물의 좌측 진입과 정지 연출이 필요합니다.');
assert.match(css,/\.merchant-visit footer\{position:absolute[\s\S]*?bottom:3%/,'대화창과 선택 버튼 영역을 분리해야 합니다.');

console.log('PASS: 방문 인물 등장 순서와 홈 대화창·선택 버튼 분리');
