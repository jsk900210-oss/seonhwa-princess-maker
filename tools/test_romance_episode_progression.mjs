import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const catalog=app.match(/const relationEpisodeCatalog=\{([\s\S]*?)\n\};\nconst careerEndingCandidates=/)?.[1]||'';
for(const id of ['doyun','seojin','yeonwoo','taegyeom','hyeon']){
  assert.equal((catalog.match(new RegExp(`id:'${id}-[1-5]'`,'g'))||[]).length,5,`${id} needs five unique episodes`);
}
for(const key of ['scene','outfit','pose','expression','camera']){
  assert.equal((catalog.match(new RegExp(`${key}:'`,'g'))||[]).length,25,`each romance episode needs a ${key} visual spec`);
}
assert.match(app,/completedEpisodes/);
assert.match(app,/maybeScheduleRelationEncounter\(action\)/);
assert.match(app,/nextRelationEpisode\(relation,'vacation'\)/);
assert.match(app,/record\.meetings=Math\.min\(5,record\.meetings\+1\)/);
assert.match(app,/record\.dateUnlocked=true/);
console.log('PASS: 인연 후보 5명 × 고유 만남 5회, 시각 정보와 일정·바캉스 기록, 데이트 해금 연결');
