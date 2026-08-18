import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const app = readFileSync(join(root, 'src', 'app.js'), 'utf8').replace(/\r\n/g, '\n');
const ages = ['09', '13', '16', '18'];
const modular = ['calligraphy', 'arithmetic', 'manners', 'houseclean', 'errand', 'rest'];

for (const age of ages) {
  for (const activity of modular) {
    for (let frame = 1; frame <= 3; frame += 1) {
      assert.ok(existsSync(join(root, 'assets', 'characters', 'seonhwa', 'activity-consistent', `age-${age}`, `${activity}-${frame}.png`)), `${age}세 ${activity} ${frame} 프레임이 필요합니다.`);
    }
  }
}
for (const activity of ['sweeping', 'errand', 'herbs']) {
  for (let frame = 1; frame <= 3; frame += 1) {
    assert.ok(existsSync(join(root, 'assets', 'characters', 'seonhwa', 'activity-consistent', 'age-09', `${activity}-legacy-${frame}.png`)), `${activity} 얼굴 보정 프레임이 필요합니다.`);
  }
}

assert.ok(app.includes('activity-consistent/age-${age}/${name}-${n}.png'), '연령별 일정은 얼굴 보정 프레임을 사용해야 합니다.');
assert.ok(app.includes('깨끗한 기본 의상을 보여 주는 편이 안전'), '전용 의상 프레임이 없을 때 얼굴을 변색하는 합성을 사용하면 안 됩니다.');
assert.ok(app.includes('presentation.npc,dailyOutfit,currentMasteryRank'), '일정 동작에는 그날 착용 의상이 전달되어야 합니다.');
assert.ok(app.includes("Math.random()<.5?'tea':'sleep'"), '집에서 휴식은 차 마시기와 잠자기 중 하나를 무작위 선택해야 합니다.');
assert.ok(app.includes("rest:'rest',sleep:'rest',tea:'rest'"), '차 마시기와 잠자기는 연령별 휴식 기준 프레임을 사용해야 합니다.');
assert.ok(app.includes('const canonicalActivityAliases={')&&app.includes("sleep:'rest',tea:'rest'"), '모든 동작은 승인된 연령별 시트 별칭을 사용해야 합니다.');
const futureMap = JSON.parse(readFileSync(join(root, 'assets', 'characters', 'seonhwa', 'activity-consistent', 'future-activity-map.json'), 'utf8'));
for (const activity of ['swordsmanship','spellcraft','cooking','koreanDance','tutoring','farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','ferryhelp','merchanthelp','dungeon']) {
  assert.ok(modular.includes(futureMap.mapping[activity]), `${activity}의 해금 전 표준 동작 매핑이 필요합니다.`);
}

console.log('PASS: 4개 성장 연령 × 공통 일정 얼굴 프레임 존재');
console.log('PASS: 마당 쓸기·장터 심부름·약초 줍기 얼굴 보정 프레임 존재');
console.log('PASS: 전용 의상 부재 시 기준 얼굴 보호 및 차/잠 휴식 무작위 선택');
console.log('PASS: 해금 전 교육·아르바이트·비경 동작의 기준 세트 예약');
