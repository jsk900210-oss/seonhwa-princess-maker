import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=readFileSync(join(root,'src','app.js'),'utf8');

assert.ok(app.includes("id: 'freeTime', category: '휴식', name: '자유행동'"),'휴식 탭에 자유행동이 있어야 합니다.');
assert.ok(app.includes("['rest','freeTime','vacation','dungeon','holiday-chuseok']"),'자유행동은 실패하지 않아야 합니다.');
assert.ok(app.includes("name:'주막 간식'"),'자유행동에 주막 체류 결과가 있어야 합니다.');
assert.ok(app.includes("name:'작은 장신구'"),'자유행동에 장터 구매 결과가 있어야 합니다.');
assert.ok(app.includes("name:'노점 먹거리'"),'자유행동에 노점 체류 결과가 있어야 합니다.');
assert.ok(app.includes('phaseDailyChange(freeTimeVariant?{...freeTimeVariant.change}:resolvedActivityChange(action,outcome),index%14)'),'선택된 자유행동 결과가 페이즈 일차에 맞춰 적용되어야 합니다.');

console.log('PASS: 휴식 자유행동 3종·무실패·능력치 반영');
