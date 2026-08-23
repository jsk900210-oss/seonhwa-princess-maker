import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');

assert.match(app,/const moonlightContestants=\[/,'고정 더미 참가자 명세가 필요합니다.');
const contestantBlock=app.match(/const moonlightContestants=\[([\s\S]*?)\n\];/)?.[1]||'';
assert.equal((contestantBlock.match(/scores:\[/g)||[]).length,7,'더미 참가자는 정확히 7명이어야 합니다.');
assert.match(contestantBlock,/scores:\[148,325,520,700\]/,'연령대별 대상 최고 경쟁 점수를 유지해야 합니다.');
assert.match(app,/playerStats\.sense\+playerStats\.manners\+playerStats\.dignity/,'센스·예절·기품을 모두 평가해야 합니다.');
assert.match(app,/index===0\?'대상':index===1\?'우수상':index<=3\?'장려상':'예선탈락'/,'결과는 4단계여야 합니다.');
assert.match(app,/prize:winner\.player\?'월백 옥패 노리개':null/,'선화는 대상일 때만 상품을 얻어야 합니다.');
assert.match(app,/const moonlightStoryBeats=\[/,'14일 이야기 명세가 필요합니다.');
const beats=app.match(/const moonlightStoryBeats=\[([\s\S]*?)\n\];/)?.[1]||'';
assert.equal((beats.match(/'[^']+'/g)||[]).length,14,'경연은 정확히 14개 이야기 비트여야 합니다.');
assert.match(app,/king-presenting-v1\.png/,'왕의 대상 시상 포즈가 필요합니다.');
assert.match(html,/id="moonlightPageant"/,'경연 전용 레이어 컨테이너가 필요합니다.');
assert.match(css,/\.pageant-winner/,'우승자 확대 레이어 규격이 필요합니다.');
assert.match(css,/@keyframes pageant-bow/,'예절 심사 절 동작이 필요합니다.');
assert.match(app,/moonlightMotionNames=\['invitation','prepare','guardian-cheer'/,'스토리별 선화 동작 연결이 필요합니다.');
assert.match(app,/qaHoliday'\)==='chuseok'/,'경연 즉시 검수 모드가 필요합니다.');

console.log('PASS: 한가위 달빛 아씨 경연 8인·14일·대상 단독 상품 규정');
