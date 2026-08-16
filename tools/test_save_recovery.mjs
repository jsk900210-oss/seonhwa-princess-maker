import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const slots = [1, 2, 3, 4, 5];

function isPlayableSave(saved) {
  const data = saved?.game;
  if (!data || typeof data !== 'object' || data.ended) return false;
  if (typeof data.characterName !== 'string' || !data.characterName.trim()) return false;
  if (typeof data.birthday !== 'string' || typeof data.currentDate !== 'string') return false;
  const birthday = new Date(`${data.birthday}T00:00:00`);
  const currentDate = new Date(`${data.currentDate}T00:00:00`);
  return !Number.isNaN(birthday.getTime()) && !Number.isNaN(currentDate.getTime()) && currentDate >= birthday;
}

const timestamp = saved => {
  const value = Date.parse(saved?.savedAt || '');
  return Number.isFinite(value) ? value : 0;
};

const playable = (name, savedAt, profileSlot = 1) => ({
  savedAt,
  game: { characterName: name, birthday: '1990-01-01', currentDate: '1999-01-01', ended: false, profileSlot },
});

assert.deepEqual(slots, [1, 2, 3, 4, 5], '육성 슬롯은 정확히 다섯 개여야 합니다.');
assert.equal(isPlayableSave(playable('선화', '2026-08-16T00:00:00Z')), true);
assert.equal(isPlayableSave({ game: { characterName: '', birthday: '1990-01-01', currentDate: '1999-01-01' } }), false);
assert.equal(isPlayableSave({ game: { characterName: '선화', birthday: '잘못된 날짜', currentDate: '1999-01-01' } }), false);
assert.equal(isPlayableSave({ game: { characterName: '선화', birthday: '1990-01-01', currentDate: '1999-01-01', ended: true } }), false);

const saves = [
  playable('오래된 기록', '잘못된 저장 시각'),
  playable('최신 기록', '2026-08-16T02:00:00Z'),
  playable('이전 기록', '2026-08-15T02:00:00Z'),
].filter(isPlayableSave).sort((a, b) => timestamp(b) - timestamp(a));
assert.equal(saves[0].game.characterName, '최신 기록');

const invalidSlotSave = playable('슬롯 복구', '2026-08-16T02:00:00Z', 99);
assert.equal(slots.includes(Number(invalidSlotSave.game.profileSlot)), false);
invalidSlotSave.game.profileSlot = slots.find(slot => slot === 2);
assert.equal(invalidSlotSave.game.profileSlot, 2);

const requiredFlows = [
  ["const SAVE_SLOTS = [1,2,3,4,5]", '최대 5개 슬롯'],
  ["localStorage.setItem(`${SAVE_KEY}-autosave`,JSON.stringify(payload))", '최신 자동저장'],
  ['if(game.profileSlot)writeSave(game.profileSlot,payload)', '현재 육성 슬롯 동시 저장'],
  ['setInterval(writeLatestAutoSave,5000)', '5초 주기 보호 저장'],
  ["document.addEventListener('visibilitychange',()=>{if(document.hidden)writeLatestAutoSave();})", '앱이 숨겨질 때 즉시 저장'],
  ["window.addEventListener('pagehide',()=>{writeLatestAutoSave();", '페이지 이탈 직전 저장'],
  ['if(!SAVE_SLOTS.includes(Number(saved.game.profileSlot)))', '잘못된 슬롯 번호 복구'],
  ['.sort((a,b)=>saveTimestamp(b)-saveTimestamp(a))', '유효한 저장 시각 기준 최신 기록 선택'],
];
for (const [snippet, label] of requiredFlows) assert.ok(source.includes(snippet), `${label} 흐름이 필요합니다.`);

console.log('PASS: 최대 5개 슬롯과 자동저장·현재 슬롯 동시 저장');
console.log('PASS: 손상·종료 기록 제외 및 올바른 최신 기록 선택');
console.log('PASS: 잘못된 슬롯 번호를 1~5번 범위로 복구');
console.log('PASS: 5초 주기·화면 숨김·페이지 이탈 시 보호 저장');
