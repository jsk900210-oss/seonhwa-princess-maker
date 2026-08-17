import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=readFileSync(join(root,'src','app.js'),'utf8');
const css=readFileSync(join(root,'src','schedule.css'),'utf8');

assert.ok(app.includes('Math.floor(elapsed/14)+1'),'한 페이즈는 14일이어야 합니다.');
assert.ok(app.includes('Math.floor((elapsed%14)/7)+1'),'페이즈는 1주차와 2주차로 나뉘어야 합니다.');
assert.ok(app.includes('phaseAfter.index>phaseBefore.index'),'두 번째 주 종료 시 페이즈가 갱신되어야 합니다.');
assert.ok(app.includes('if(phaseAdvanced)rollVisitingMerchant()'),'방문객은 페이즈 경계에서만 판정해야 합니다.');
assert.ok(app.includes('lastGuardianTalkPhase===phaseKey'),'신수 대화는 페이즈마다 갱신해야 합니다.');
assert.ok(app.includes('phase.index} / ${phase.total}'),'일정 화면에 현재/전체 페이즈 수가 보여야 합니다.');
assert.ok(css.includes('.phase-progress-track'),'페이즈 진행률 막대가 필요합니다.');
assert.ok(app.includes('[-2,-1,0,1,2].map'),'편성창은 가운데 현재 칸을 기준으로 총 5칸이어야 합니다.');
assert.ok(app.includes('class="phase-mini-slot current"'),'가운데 편성 전 칸이 보여야 합니다.');
assert.ok(app.includes('game.dailySchedule.push(id);scheduleCursor=game.dailySchedule.length-1'),'새 페이즈는 가운데 칸에 채워져야 합니다.');
assert.ok(app.includes('class="action compact-action'),'스케줄 항목은 이름 중심의 간결한 버튼이어야 합니다.');
assert.ok(css.includes('grid-template-columns:repeat(5,minmax(0,1fr))'),'편성 5칸이 한 줄에 유지되어야 합니다.');
assert.ok(css.includes('.compact-schedule-grid'),'교육·아르바이트·휴식 목록은 한 화면용 격자여야 합니다.');
assert.ok(css.includes('Main categories are broad, dark tabs'),'큰 카테고리와 세부 일정의 시각적 위계가 필요합니다.');
assert.ok(css.includes('.compact-tabs button.on'),'선택한 큰 카테고리가 진한 탭으로 보여야 합니다.');
assert.ok(css.includes('.compact-schedule-grid>.compact-action'),'세부 일정은 작은 이름 버튼으로 보여야 합니다.');

console.log('PASS: 14일 페이즈와 PM3식 5칸 편성·간결한 활동 목록');
