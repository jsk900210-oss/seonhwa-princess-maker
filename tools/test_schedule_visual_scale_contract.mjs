import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const css=fs.readFileSync(path.join(root,'src','schedule.css'),'utf8');
const painting=JSON.parse(fs.readFileSync(path.join(root,'assets','schedule-layers-v2','painting','manifest.json'),'utf8'));

assert.match(css,/action-reading \.stage-npc\.npc-teacher\{[^}]*width:146px!important;height:146px!important\}/,'글읽기 NPC는 146px 기준이어야 합니다.');
assert.match(css,/action-painting,.action-music,.action-dance,.action-sewing,.action-copying[^}]*layer-npc\{width:146px!important\}/,'회화·악기 등 전체 높이 NPC는 글읽기와 같은 146px 기준이어야 합니다.');
assert.match(css,/action-painting[^}]*layer-pattern\.success-a\{display:none!important\}/,'회화의 중복 붓·벼루 레이어를 숨겨야 합니다.');
assert.match(css,/모든 일정 쯔꾸르 선화[^]*?stage-character\.pixel-sprite\{[^}]*width:146px!important;[^}]*height:146px!important;/,'모든 일정 쯔꾸르 선화는 146px 공통 규격이어야 합니다.');
assert.match(css,/action-music[^}]*layer-pattern\.success-a\{[^}]*display:none!important/,'악기 배우기의 중복 악기 소품 레이어를 숨겨야 합니다.');
assert.match(css,/action-childcare[^}]*layer-npc\{width:84px!important;height:84px!important\}/,'아이 NPC는 별도의 아동 규격을 유지해야 합니다.');
assert.equal(painting.existingBackground,'../../backgrounds/phase-scenes/painting.webp','회화는 글읽기와 다른 전용 배경이어야 합니다.');
assert.deepEqual(painting.layerOrder,['existing-background','npc','existing-seonhwa','props','effects','failures']);

console.log('PASS: schedule NPC visible-height contract and painting layer separation');
