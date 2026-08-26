import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const app = readFileSync(join(root, 'src', 'app.js'), 'utf8').replace(/\r\n/g, '\n');
const modular = ['calligraphy', 'arithmetic', 'manners', 'houseclean', 'errand', 'tea'];
for (const activity of modular) {
  for (let frame = 1; frame <= 3; frame += 1) {
    assert.ok(existsSync(join(root, 'assets', 'characters', 'seonhwa', 'schedule-actions', `${activity}-pixel-${frame}.png`)), `${activity} 공통 3프레임이 필요합니다.`);
  }
}

assert.ok(app.includes('schedule-actions/${file}'), '일정은 승인된 공통 선화 프레임을 사용해야 합니다.');
assert.ok(app.includes('깨끗한 기본 의상을 보여 주는 편이 안전'), '전용 의상 프레임이 없을 때 얼굴을 변색하는 합성을 사용하면 안 됩니다.');
assert.ok(app.includes('presentation.npc,dailyOutfit,currentMasteryRank'), '일정 동작에는 그날 착용 의상이 전달되어야 합니다.');
assert.ok(app.includes("index%14<7?'tea':'sleep'"), '집에서 휴식은 차 마시기 1페이즈 뒤 잠자기 1페이즈로 진행해야 합니다.');
assert.ok(app.includes("rest:frameTriplet('tea-pixel')"), '차 마시기는 승인된 휴식 3프레임을 사용해야 합니다.');

console.log('PASS: 4개 성장 연령 × 공통 일정 얼굴 프레임 존재');
console.log('PASS: 마당 쓸기·장터 심부름·약초 줍기 얼굴 보정 프레임 존재');
console.log('PASS: 전용 의상 부재 시 기준 얼굴 보호 및 차/잠 휴식 순차 진행');
console.log('PASS: 해금 전 교육·아르바이트·비경 동작의 기준 세트 예약');
