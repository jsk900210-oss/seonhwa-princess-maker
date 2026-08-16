import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const app = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const css = readFileSync(new URL('../src/schedule.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const seasons = ['spring', 'summer', 'autumn', 'winter'];
const ages = ['09', '13', '16', '18'];

for (const age of ages) {
  for (const season of seasons) {
    const url = new URL(`../assets/audio/music/vacation/age-${age}/vacation-${season}.mp3`, import.meta.url);
    const path = fileURLToPath(url);
    assert.ok(statSync(path).size > 100_000, `${age}세 ${season} 주제곡 파일이 비어 있거나 손상됐습니다.`);
  }
}

assert.ok(app.includes('const sceneSeason=prize.season||game.season;') && app.includes('playVacationMusic(sceneSeason)'), '수집 카드의 실제 계절 주제곡을 선택해야 합니다.');
assert.ok(app.includes("const sceneEffect=seasonalEffects[sceneSeason]?.has(prize.effect)?prize.effect:'calm'"), '카드 계절과 맞지 않는 효과를 차단해야 합니다.');
assert.ok(app.includes('playGameMusic(source,.04);\n  fadeAudio(gameMusic,scaledVolume(.28,\'bgm\'),900);'), '사용자 터치 흐름 안에서 주제곡을 즉시 시작하고 페이드 인해야 합니다.');
assert.ok(!app.includes('window.setTimeout(()=>playGameMusic(source,.28),460)'), '지연 재생은 모바일 자동재생 차단을 유발할 수 있습니다.');
assert.ok(css.includes('.vacation-motion.season-spring i'), '봄 벚꽃 파티클이 필요합니다.');
assert.ok(css.includes('.vacation-motion.season-autumn i'), '가을 낙엽 파티클이 필요합니다.');
assert.ok(css.includes('.vacation-motion.season-winter i'), '겨울 눈 파티클이 필요합니다.');
assert.ok(css.includes('.vacation-scene[data-effect="snow"]:has(.vacation-motion.season-winter)::before'), '겨울 눈 효과는 구형 레이어와 중복 재생되면 안 됩니다.');
assert.ok(app.includes("if(/\\/(rest|sleep)-/.test(src))return src;"), '이불이 합쳐진 휴식 원화에는 의상 색상 치환을 적용하면 안 됩니다.');
assert.ok(css.includes('animation:vacation-child-camera 10.5s'), '눈에 보이는 2.5D 카메라 루프가 필요합니다.');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce){.vacation-motion{display:block}'), '움직임 제한 환경에서도 정적인 계절 아티팩트는 유지해야 합니다.');

console.log('PASS: 연령 4단계 × 계절 4종 바캉스 주제곡 16개 파일 확인');
console.log('PASS: 모바일 자동재생 차단을 피하는 즉시 재생·페이드 인 연결');
console.log('PASS: 2.5D 카메라 루프와 벚꽃·낙엽·눈·물빛 계절 레이어 연결');
