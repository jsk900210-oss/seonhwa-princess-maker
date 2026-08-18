import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
assert.match(app,/entry\.record\.meetings>=5&&entry\.record\.affinity>=60&&\['특별한 인연','연인'\]\.includes\(entry\.record\.relationship\)/,'5회 만남만으로 인연 엔딩이 확정되면 안 됩니다.');
assert.match(app,/record\.relationship=record\.affinity>=80\?'연인':record\.affinity>=60\?'특별한 인연':record\.affinity>=35\?'친구':'지인'/,'호감도에 따라 관계 단계가 갱신되어야 합니다.');
assert.match(app,/호감도 60 이상과 특별한 관계부터 엔딩 후보/,'상태 화면에서 인연 엔딩 조건을 안내해야 합니다.');
console.log('PASS: 5회 만남은 데이트 해금, 호감도 60·특별한 인연부터 엔딩 후보');
