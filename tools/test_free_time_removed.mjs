import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=readFileSync(join(root,'src','app.js'),'utf8');
const css=readFileSync(join(root,'src','schedule.css'),'utf8');

assert.ok(!app.includes("id: 'freeTime'"),'자유행동 일정 항목이 남아 있으면 안 됩니다.');
assert.ok(!app.includes("action.id==='freeTime'")&&!app.includes("action-freeTime"),'자유행동 실행·QA 분기가 남아 있으면 안 됩니다.');
assert.ok(!css.includes('free-time-market')&&!css.includes('action-freeTime'),'자유행동 전용 CSS가 남아 있으면 안 됩니다.');
assert.ok(app.includes("if(id==='freeTime')return 'rest'"),'기존 저장 일정의 자유행동은 집에서 휴식으로 안전하게 변환해야 합니다.');

console.log('PASS: 자유행동 제거 및 기존 저장 일정 휴식 전환');
