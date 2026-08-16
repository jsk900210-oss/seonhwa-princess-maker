import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/dungeon.css',import.meta.url),'utf8');

assert.match(html,/id="dungeonBoard"[^>]*role="application"/,'비경 이동판이 필요합니다.');
assert.equal((html.match(/data-dungeon-move=/g)||[]).length,4,'모바일 방향 버튼 4개가 필요합니다.');
assert.match(html,/id="dungeonChest"/,'보물상자가 필요합니다.');
assert.match(html,/id="dungeonMonster"/,'몬스터 조우가 필요합니다.');
assert.match(app,/function exploreDungeon\(\)/,'비경 탐사 흐름이 필요합니다.');
assert.match(app,/ArrowUp:'up'.*ArrowDown:'down'.*ArrowLeft:'left'.*ArrowRight:'right'/s,'PC 방향키 이동이 필요합니다.');
assert.match(app,/game\.magic\+game\.intelligence.*game\.strength\+game\.health/,'술법과 검술 판정이 필요합니다.');
assert.match(app,/dungeonReward=await exploreDungeon\(\)/,'주간 일정이 비경 탐사를 기다려야 합니다.');
assert.match(app,/moneyChange\+=dungeonReward/,'탐사 보상이 은전에 반영되어야 합니다.');
assert.match(css,/grid-template-rows:minmax\(0,1fr\) auto auto auto/,'모바일 세로 화면에 맞는 배치가 필요합니다.');
console.log('PASS: 비경 이동·상자·몬스터·전투 판정·일정 복귀 연결');
