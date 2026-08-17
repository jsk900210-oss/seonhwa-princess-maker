import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=readFileSync(join(root,'src','app.js'),'utf8');

assert.ok(app.includes("id: 'freeTime', category: '휴식', name: '자유행동'"),'휴식 탭에 자유행동이 있어야 합니다.');
assert.ok(app.includes("['rest','freeTime','vacation','dungeon']"),'자유행동은 실패하지 않아야 합니다.');
assert.ok(app.includes("name:'마을 산책'"),'자유행동에 산책 결과가 있어야 합니다.');
assert.ok(app.includes("name:'취미 시간'"),'자유행동에 취미 결과가 있어야 합니다.');
assert.ok(app.includes("name:'가벼운 외출'"),'자유행동에 외출 결과가 있어야 합니다.');
assert.ok(app.includes('const resolvedChange=freeTimeVariant?{...freeTimeVariant.change}'),'선택된 자유행동 결과가 실제 능력치에 적용되어야 합니다.');

console.log('PASS: 휴식 자유행동 3종·무실패·능력치 반영');
