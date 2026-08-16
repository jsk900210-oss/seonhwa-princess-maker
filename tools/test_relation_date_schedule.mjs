import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/schedule-pm2.css',import.meta.url),'utf8');
for(const id of ['doyun','seojin','yeonwoo','taegyeom','hyeon'])assert.match(app,new RegExp(`id:'date-${id}'[\\s\\S]*?special:'date'`),`${id} 데이트 일정이 필요합니다.`);
assert.match(app,/!action\.relationId\|\|Boolean\(relationRecord\(action\.relationId\)\.dateUnlocked\)/,'5회 만남·16세 조건 전에는 데이트가 잠겨야 합니다.');
assert.match(app,/action\.special==='date'[\s\S]*?record\.affinity=Math\.min\(100,record\.affinity\+12\)/,'데이트 실행 시 호감도가 증가해야 합니다.');
assert.match(app,/actions\.some\(action=>action\.category==='인연'&&actionUnlocked\(action\)\)/,'해금된 상대가 있을 때만 인연 탭이 보여야 합니다.');
assert.match(css,/repeat\(auto-fit,minmax\(64px,1fr\)\)/,'네 개 일정 탭이 모바일 폭에 맞아야 합니다.');
console.log('PASS: 5회 만남 이후 데이트 일정·호감도·인연 탭 연결');
