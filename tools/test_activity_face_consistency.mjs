import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const app = readFileSync(join(root, 'src', 'app.js'), 'utf8').replace(/\r\n/g, '\n');
const ages = ['09', '13', '16', '18'];
const modular = ['calligraphy', 'arithmetic', 'manners', 'houseclean', 'rest'];

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

assert.ok(app.includes('activity-consistent/age-${age}/${name}-${frame}.png'), '연령별 일정은 얼굴 보정 프레임을 사용해야 합니다.');
assert.ok(app.includes("const skin=r>170&&g>92&&b>64"), '의상 팔레트 적용 중 얼굴 피부를 보호해야 합니다.');
assert.ok(app.includes("Math.random()<.5?'tea':'sleep'"), '집에서 휴식은 차 마시기와 잠자기 중 하나를 무작위 선택해야 합니다.');

console.log('PASS: 4개 성장 연령 × 공통 일정 얼굴 프레임 존재');
console.log('PASS: 마당 쓸기·장터 심부름·약초 줍기 얼굴 보정 프레임 존재');
console.log('PASS: 의상 적용 시 얼굴 보호 및 차/잠 휴식 무작위 선택');
