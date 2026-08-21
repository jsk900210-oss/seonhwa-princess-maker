import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
assert.match(app,/function chooseVacationCompanion\(\)[\s\S]*?record\.dateUnlocked[\s\S]*?record\.meetings>=5/,'데이트 해금 인물만 바캉스 동행 후보여야 합니다.');
assert.match(app,/playVacationScene\(prize,index,vacationCompanion,scheduleStart,index<selected\.length-1\)/,'선택한 동행과 다음 일정 여부가 바캉스 장면에 전달되어야 합니다.');
assert.match(app,/if\(companion\)\{[\s\S]*?relation=companion;scene\.classList\.add\('has-encounter'\)/,'동행을 선택하면 선택 상대가 직접 등장해야 합니다.');
assert.match(app,/if\(!record\.vacationMemories\.includes\(memory\)\)record\.vacationMemories\.push\(memory\)/,'동행 추억은 중복 저장되면 안 됩니다.');
assert.match(css,/\.vacation-companion-choice\{/,'모바일 동행 선택 UI가 필요합니다.');
console.log('PASS: 혼자·동행 바캉스 선택과 인연 추억 저장');
