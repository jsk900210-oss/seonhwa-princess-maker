import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=readFileSync(path.join(root,'src','app.js'),'utf8').replace(/\r\n/g,'\n');
const files=[
  'assets/characters/seonhwa/age-09/base/seonhwa-age09-base-v3-wonyoung-motif-transparent.png',
  'assets/characters/seonhwa/age-13/base/seonhwa-age13-base-v3-wonyoung-motif-transparent.png',
  'assets/characters/seonhwa/age-16/base/seonhwa-age16-base-v3-wonyoung-motif-transparent.png',
  'assets/characters/seonhwa/age-18/base/seonhwa-age18-base-v3-wonyoung-motif-transparent.png'
];
files.forEach(file=>assert.ok(existsSync(path.join(root,file)),`${file} missing`));
assert.ok(app.includes('const baseSpritePaths=Object.freeze({'),'연령별 반실사 베이스 매핑이 필요합니다.');
assert.ok(app.includes('const baseSpriteForAge=(age=game.age)=>'),'현재 나이에 맞는 베이스 선택기가 필요합니다.');
assert.ok(app.includes('character.src=game.equippedOutfit?outfitImage(game.equippedOutfit)'),'착용 의상과 연령별 기본 베이스 경로가 함께 유지되어야 합니다.');
assert.ok(app.includes('if(game.autoOutfit)updateAutoOutfit();\n  else applyEquippedOutfit();'),'수동 의상 모드에서도 나이 변경 직후 베이스를 갱신해야 합니다.');
assert.ok(app.includes("const basePortraitStandaloneQa=scheduleQaParams.has('qaBaseAge')")&&app.includes('function initBasePortraitQa()'),'나이별 홈 베이스를 단독 검수할 QA 경로가 필요합니다.');
console.log('PASS: 9·13·16·19세 반실사 베이스와 성장 선택 경로');
