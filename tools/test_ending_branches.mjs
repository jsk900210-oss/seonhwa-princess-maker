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

console.log('PASS: 인연 5 + 직업 18 + 몰락 7 = 총 30개 엔딩');
console.log('PASS: 몰락→인연→직업 우선순위와 결과 저장 연결');
