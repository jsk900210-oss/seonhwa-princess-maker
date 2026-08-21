import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const app=fs.readFileSync(path.join(root,'src','app.js'),'utf8');
const html=fs.readFileSync(path.join(root,'src','index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'src','style.css'),'utf8');
assert.ok(!html.includes('startTestThirteen')&&!html.includes('13세 테스트 시작'),'13세 바로가기 버튼이 남아 있습니다.');
assert.ok(!app.includes('startThirteenTestGrowth'),'13세 테스트 초기화 함수가 남아 있습니다.');
assert.ok(css.includes('.phone[data-growth-age="9"] .character-slot'),'9세 홈 전용 크기 규칙이 없습니다.');
for(const file of ['bgm-home-town-square.mp3','bgm-market-morning.mp3','bgm-work-morning.mp3','bgm-education-study.mp3'])assert.ok(fs.existsSync(path.join(root,'assets','audio','music','gameplay',file)),`${file} missing`);
assert.ok(app.includes("action?.category==='교육'")&&app.includes("action?.category==='아르바이트'"),'교육·아르바이트 BGM 분기가 없습니다.');
assert.ok(app.includes("game.birthday&&!phone.classList.contains('playing')&&!phone.classList.contains('market-playing')&&!phone.classList.contains('vacation-playing')")&&app.includes('playHomeMusic();'),'홈 화면에서 기존 홈 BGM을 복구하는 경계가 없습니다.');
assert.ok(!app.includes("waitForVacationTap('터치해 다음 칸으로'"),'바캉스 종료 후 추가 터치 대기가 남아 있습니다.');
assert.ok(app.includes('index<selected.length-1'),'바캉스 다음 일정 직행 조건이 없습니다.');
console.log('PASS: 13세 바로가기 제거, 9세 홈 축소, 홈·시장·일·교육 BGM 패턴');
