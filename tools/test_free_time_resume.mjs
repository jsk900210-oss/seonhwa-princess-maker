import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

assert.ok(app.includes('activityFrames.eating='),'자유행동 먹거리 동작 프레임이 등록되어야 합니다.');
assert.ok(app.includes("const frames=activityFrameSet(activity)||activityFrameSet('errand')||spriteFrames.down"),'활동 전용 프레임이 없어도 안전한 대체 동작으로 진행해야 합니다.');
assert.ok(app.includes('try{await exploreMarket();}')&&app.includes('marketShoppingActive=false;'),'저잣거리 종료 여부와 관계없이 일정 상태가 복구되어야 합니다.');
assert.ok(app.includes("freeTimeVariant?.activity||'errand'")&&app.includes("stageCharacter.style.removeProperty('left')"),'자유행동이 끝나면 캐릭터 위치를 복구하고 다음 활동으로 진행해야 합니다.');

console.log('free-time resume regression passed');
