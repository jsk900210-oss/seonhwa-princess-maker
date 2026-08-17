import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=readFileSync(join(root,'src','app.js'),'utf8');
const names=['study','arithmetic','etiquette','painting','music','dance','martial','magic','kitchen','farm','childcare','woodwork','loom','clinic','ferry','merchant'];
names.forEach(name=>assert.ok(existsSync(join(root,'assets','backgrounds','phase-scenes',`${name}.webp`)),`${name} 전용 활동 배경이 필요합니다.`));
assert.ok(app.includes("motion:'motion-market-roam', location:'market'"),'자유행동은 저잣거리 보행이어야 합니다.');
assert.ok(app.includes('stopCompetingBgm(gameMusic)'),'장면 BGM은 중복 재생을 막아야 합니다.');
assert.ok(app.includes('showPhaseReport(playbackResult.dayRecords,phaseBefore)'),'페이즈 종료 결산이 필요합니다.');
console.log('PASS: 16종 전용 활동 배경, 저잣거리 자유행동, BGM 단일 재생, 페이즈 결산');
