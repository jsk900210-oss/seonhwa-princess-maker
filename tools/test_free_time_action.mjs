import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=readFileSync(join(root,'src','app.js'),'utf8');

assert.ok(app.includes("id: 'freeTime', category: '휴식', name: '자유행동'"),'휴식 탭에 자유행동이 있어야 합니다.');
assert.ok(app.includes("['rest','freeTime','vacation','dungeon','holiday-chuseok']"),'자유행동은 실패하지 않아야 합니다.');
assert.ok(!app.includes("activity:'eating',cost:"),'자유여행에서 앉아서 먹는 동작이 남아 있으면 안 됩니다.');
assert.ok(app.includes("name:'비단 리본 구매'")&&app.includes("name:'작은 장신구 구매'")&&app.includes("name:'문방 소품 구매'"),'자유행동 구매 결과 3종이 있어야 합니다.');
assert.ok(app.includes("stageNpc.className='stage-npc npc-purchase-merchant'")&&app.includes("stageCharacter.classList.add('is-purchasing')"),'자유여행 구매자·상인 모션이 필요합니다.');
assert.ok(app.includes('phaseDailyChange(freeTimeVariant?{...freeTimeVariant.change}:resolvedActivityChange(action,outcome),index%14)'),'선택된 자유행동 결과가 페이즈 일차에 맞춰 적용되어야 합니다.');

console.log('PASS: 휴식 자유행동 3종·무실패·능력치 반영');
