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
assert.match(app,/const relationEndingEpilogues=/,'다섯 인연 엔딩의 전용 후일담 데이터가 필요합니다.');
for(const id of ['doyun','seojin','yeonwoo','taegyeom','hyeon'])assert.match(app,new RegExp(`${id}:\\[\\{speaker:[\\s\\S]*?\\}\\]`),`${id} 인연 엔딩에는 3장면 대화가 필요합니다.`);
assert.match(app,/성장 기록 보기/,'세 장면을 마친 뒤 성장 기록을 열어야 합니다.');
assert.match(app,/const soloEndingScenes=/,'직업·몰락 엔딩별 무인 배경 규격이 필요합니다.');
assert.match(app,/function soloEndingVisual\(result\)/,'직업·몰락 엔딩에는 승인된 선화 전신 장면이 필요합니다.');
assert.match(app,/const soloEndingEpilogues=/,'직업·몰락 엔딩별 전용 후일담 데이터가 필요합니다.');
const soloEpilogueBlock=app.slice(app.indexOf('const soloEndingEpilogues='),app.indexOf('function endingEpilogueBeats'));
for(const id of [...careerBlock.matchAll(/\{id:'([^']+)'/g),...downfallBlock.matchAll(/\{id:'([^']+)'/g)].map(match=>match[1]))assert.match(soloEpilogueBlock,new RegExp(`(?:'${id}'|${id}):\\[\\{speaker:[\\s\\S]*?\\}\\]`),`${id} 엔딩에는 3장면 후일담이 필요합니다.`);
assert.match(app,/function endingEpilogueBeats\(result\)/,'모든 엔딩이 공통 후일담 진행기를 사용해야 합니다.');
assert.match(app,/bindEndingEpilogue\(result\)/,'엔딩 화면에서 공통 후일담을 시작해야 합니다.');
assert.match(app,/careerEndingCandidates\.find\(item=>item\.id===requestedId\)/,'직업 엔딩을 즉시 실행할 QA가 필요합니다.');
assert.match(app,/downfallEndingCandidates\.find\(item=>item\.id===requestedId\)/,'몰락 엔딩을 즉시 실행할 QA가 필요합니다.');

console.log('PASS: 인연 5 + 직업 18 + 몰락 7 = 총 30개 엔딩');
console.log('PASS: 몰락→인연→직업 우선순위와 결과 저장 연결');
