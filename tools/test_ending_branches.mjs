import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
const relationBlock=app.match(/const endingRelationCandidates=\[(.*?)\n\];/s)?.[1]||'';
const careerBlock=app.match(/const careerEndingCandidates=\[(.*?)\n\];/s)?.[1]||'';
const downfallBlock=app.match(/const downfallEndingCandidates=\[(.*?)\n\];/s)?.[1]||'';
const countIds=block=>(block.match(/\{id:'/g)||[]).length;

assert.equal(countIds(relationBlock),5,'인연 엔딩은 5개여야 합니다.');
assert.equal(countIds(careerBlock),18,'직업 엔딩은 18개여야 합니다.');
assert.equal(countIds(downfallBlock),7,'몰락 엔딩은 7개여야 합니다.');
assert.equal(countIds(relationBlock)+countIds(careerBlock)+countIds(downfallBlock),30,'전체 엔딩은 정확히 30개여야 합니다.');
assert.ok(app.includes("const category=downfall?'downfall':relation?'relation':'career'"),'몰락→인연→직업 판정 우선순위가 필요합니다.');
assert.ok(app.includes('if(!game.endingResult)game.endingResult=resolveEnding()'),'엔딩 결과는 한 번 판정한 뒤 저장되어야 합니다.');
assert.match(app,/function relationEndingVisual\(result\)/,'인연 엔딩에는 두 주인공의 전신 장면이 필요합니다.');
assert.match(app,/relationPortraitPath\(candidate,19\)/,'인연 엔딩 상대는 승인된 19세 전신을 사용해야 합니다.');
assert.match(app,/baseSpriteForAge\(19\)/,'인연 엔딩 선화는 승인된 19세 베이스를 사용해야 합니다.');
assert.match(app,/scheduleQaParams\.has\('qaEnding'\)/,'5개 인연 엔딩을 즉시 확인할 QA 진입점이 필요합니다.');
assert.match(app,/data-ending-id/,'QA 화면에서 인연 엔딩 5개를 전환할 수 있어야 합니다.');
assert.match(app,/return game\.activityProgress\[id\]\|\|\{attempts:0,successes:0,phasePoints:0/,'미해금 직업의 숙련 기록이 없어도 엔딩 점수 계산이 중단되면 안 됩니다.');

console.log('PASS: 인연 5 + 직업 18 + 몰락 7 = 총 30개 엔딩');
console.log('PASS: 몰락→인연→직업 우선순위와 결과 저장 연결');
