import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=readFileSync(join(root,'src','app.js'),'utf8');
const css=readFileSync(join(root,'src','schedule.css'),'utf8');

assert.ok(app.includes("action.category==='교육'?'pm3-phase-scene lesson-scene'"),'교육 장면은 공통 페이즈 영상 형식을 사용해야 합니다.');
assert.ok(app.includes("action.category==='아르바이트'?'pm3-phase-scene work-scene'"),'아르바이트 장면은 공통 페이즈 영상 형식을 사용해야 합니다.');
assert.ok(app.includes('제${playbackPhase.index}페이즈 · ${playbackPhase.week}주차'),'재생 화면에 페이즈와 주차가 보여야 합니다.');
assert.ok(app.includes('${activityRankNames[currentMasteryRank]}'),'교육·아르바이트 영상에 현재 숙련 단계가 보여야 합니다.');
assert.ok(css.includes('.activity-stage.pm3-phase-scene.lesson-scene:after'),'교육 영상 표지가 필요합니다.');
assert.ok(css.includes('.activity-stage.pm3-phase-scene.work-scene:after'),'아르바이트 영상 표지가 필요합니다.');

console.log('PASS: 교육·아르바이트 공통 페이즈 영상 형식');
