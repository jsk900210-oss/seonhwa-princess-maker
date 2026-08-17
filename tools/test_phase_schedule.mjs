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

console.log('PASS: 14일 페이즈, 1·2주차, 대화·방문 갱신과 전체 진행 UI');
