import fs from 'node:fs';
import assert from 'node:assert/strict';

const css=fs.readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
const marker='/* v0.64.308 — 대화 초상은 상체를 선명하게 유지하고 하단 30%만 배경으로 녹인다. */';
const finalRule=css.slice(css.lastIndexOf(marker));

assert.ok(finalRule.includes('.sehwa-contest.festival-pm3 .sehwa-opening-dialogue.speaker-seonhwa>.sehwa-expression'));
assert.ok(finalRule.includes('.moonlight-pageant.festival-pm3 .sehwa-opening-dialogue.speaker-guardian>.sehwa-dialogue-bust'));
assert.ok(finalRule.includes('.festival-character-cut.king-cut img'));
assert.ok(finalRule.includes('#000 0 70%'));
assert.ok(finalRule.includes('transparent 100%'));
assert.equal(css.slice(finalRule.length+css.lastIndexOf(marker)).includes('mask-image:'),false);
console.log('PASS: event portraits keep a final lower-edge gradient contract');
