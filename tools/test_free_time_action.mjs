import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=readFileSync(join(root,'src','app.js'),'utf8');
const css=readFileSync(join(root,'src','schedule.css'),'utf8');

assert.ok(app.includes("id: 'freeTime', category: '휴식', name: '자유행동'"),'휴식 탭에 자유행동이 있어야 합니다.');
assert.ok(app.includes("['rest','freeTime','vacation','dungeon','holiday-chuseok','holiday-seollal']"),'자유행동은 실패하지 않아야 합니다.');
assert.ok(!app.includes("activity:'eating',cost:"),'자유여행에서 앉아서 먹는 동작이 남아 있으면 안 됩니다.');
assert.ok(app.includes("name:'장터 산책'")&&app.includes("name:'가게 구경'")&&app.includes("name:'골목 나들이'"),'자유행동은 구매가 아닌 나들이 결과 3종이어야 합니다.');
assert.ok(app.includes("stageProps.hidden=true;stageProps.className='stage-props prop-none'")&&app.includes("stageNpc.hidden=true;stageNpc.className='stage-npc'"),'자유행동에는 상인·상품 합성을 표시하지 않아야 합니다.');
assert.ok(app.includes("activity:'errand'")&&app.includes("freeTimeVariant?.activity||'errand'"),'자유행동은 승인된 선화 보행 동작을 사용해야 합니다.');
assert.ok(app.includes("forcedFreeTimeDirection==='right':index%2===0")&&app.includes("freeTimeTravelsRight?'none':'scaleX(-1)'"),'자유행동은 일차별로 좌우 진행 방향과 바라보는 방향을 맞춰야 합니다.');
assert.ok(app.includes("currentMasteryRank,index,'success'")&&app.includes('const fullErrandTrack=[-24,-8,8,24,40,56,72,88,104,124]'),'자유행동은 좌측 화면 밖과 우측 화면 밖 사이의 전체 동선을 완주해야 합니다.');
assert.ok(app.includes("if(actionId==='freeTime'){initFreeTimeQa();return;}")&&app.includes("'좌측 끝→우측 끝':'우측 끝→좌측 끝'"),'자유행동 좌우 전체 동선을 직접 확인하는 QA 경로가 있어야 합니다.');
assert.ok(!app.includes('freeTimeVariant?.stop'),'자유행동에 중앙 정지 좌표가 남아 있으면 안 됩니다.');
assert.ok(app.includes('phaseDailyChange(freeTimeVariant?{...freeTimeVariant.change}:resolvedActivityChange(action,outcome),index%14)'),'선택된 자유행동 결과가 페이즈 일차에 맞춰 적용되어야 합니다.');

console.log('PASS: 휴식 자유행동 3종·무실패·능력치 반영');
