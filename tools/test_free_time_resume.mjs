import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

assert.ok(app.includes("stageNpc.hidden=true;stageNpc.className='stage-npc'"),'자유행동에는 상인을 남기지 않아야 합니다.');
assert.ok(app.includes("const frames=activityFrameSet(activity)||activityFrameSet('errand')||spriteFrames.down"),'활동 전용 프레임이 없어도 안전한 대체 동작으로 진행해야 합니다.');
assert.ok(app.includes('try{await exploreMarket();}')&&app.includes('marketShoppingActive=false;'),'저잣거리 종료 여부와 관계없이 일정 상태가 복구되어야 합니다.');
const freeTimeBranch=app.slice(app.indexOf("}else if(action.id==='freeTime')"),app.indexOf("}else if(action.id==='vacation')"));
assert.ok(app.includes("freeTimeVariant?.activity||'errand'")&&!freeTimeBranch.includes("stageCharacter.style.removeProperty('left')")&&app.includes("stageCharacterImage.style.removeProperty('transform')"),'자유행동은 결과까지 마지막 위치를 유지하고 다음 날 공통 초기화에서 좌표를 복구해야 합니다.');

console.log('free-time resume regression passed');
