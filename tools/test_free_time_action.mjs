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
assert.ok(app.includes("activity:'errand'")&&app.includes("stageCharacterImage.style.setProperty('transform','none','important')"),'자유행동은 승인된 선화 보행 동작과 오른쪽 진행 방향을 사용해야 합니다.');
assert.ok(app.includes("for(const position of [30,freeTimeVariant?.stop??56])"),'자유행동 이동 구간은 짧은 2단계여야 합니다.');
assert.ok(app.includes("stop:48")&&app.includes("stop:58")&&app.includes("stop:68"),'세 나들이는 서로 다른 저잣거리 정지 위치를 사용해야 합니다.');
assert.ok(app.includes('phaseDailyChange(freeTimeVariant?{...freeTimeVariant.change}:resolvedActivityChange(action,outcome),index%14)'),'선택된 자유행동 결과가 페이즈 일차에 맞춰 적용되어야 합니다.');

console.log('PASS: 휴식 자유행동 3종·무실패·능력치 반영');
