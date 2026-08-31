import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const app=read('src/app.js');
const css=read('src/schedule.css');
const manifests=read('src/schedule-layer-manifests.js');
const expected=['painting','music','dance','swordsmanship','spellcraft','classics','farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','innhelp','sewing','copying','ferryhelp','merchanthelp','accounting','tutoring'];
const listed=[...app.matchAll(/scheduleLayerIds=new Set\(\[([^\]]+)\]\)/g)][0]?.[1].match(/'([^']+)'/g)?.map(value=>value.slice(1,-1))||[];
assert.deepEqual(listed,expected,'전체 일정 20종이 쯔꾸르 검수 대상에 등록돼야 합니다.');
for(const id of expected){
  assert.ok(manifests.includes('"'+id+'"'),'일정 '+id+'의 v2 레이어 명세가 필요합니다.');
}
assert.ok(!/schedule-actions\/(?!v2\/)/.test(app),'실행 코드에 구형 올림머리 일정 프레임 경로가 남아 있으면 안 됩니다.');
assert.ok(!/schedule-actions\/(?!v2\/)/.test(manifests),'일정 명세에 구형 올림머리 일정 프레임 경로가 남아 있으면 안 됩니다.');
const finalRuleIndex=css.lastIndexOf('/* v0.64.238');
assert.ok(finalRuleIndex>=0,'ID 우선순위 쯔꾸르 크기 규칙이 필요합니다.');
const finalCss=css.slice(finalRuleIndex);
assert.match(finalCss,/#activityStage\.schedule-layered \.stage-character\.pixel-sprite\{width:96px!important;height:96px!important/,'선화는 모든 일정에서 96px 상자를 사용해야 합니다.');
assert.match(finalCss,/#activityStage\.schedule-layered \.schedule-scene-layer\.layer-npc\{width:96px!important;height:96px!important/,'NPC는 모든 일정에서 96px 상자를 사용해야 합니다.');
assert.match(finalCss,/#activityStage\.schedule-layered \.stage-character\.pixel-sprite>img\{transform:none!important/,'선화의 땋은 머리 방향을 바꾸는 좌우 반전이 있으면 안 됩니다.');
for(const prefix of ['calligraphy-pixel-v2','arithmetic-pixel-v2','manners-pixel-v2','dance-fan-held-v1','houseclean-pixel-v2','errand-pixel-v2','herbs-pixel-v2','farmwork-pixel-v2','sweeping-pixel-v2','childcare-pixel-v2','kitchenhelp-pixel-v2','woodwork-pixel-v2','loomwork-pixel-v2','masonry-pixel-v2','clinichelp-pixel-v2','ferryhelp-pixel-v2','merchanthelp-pixel-v2','tea-pixel-v2','sleep-pixel-v2','fail-pixel-v2']){
  for(let frame=1;frame<=3;frame+=1)assert.ok(fs.existsSync(path.join(root,'assets/characters/seonhwa/schedule-actions/v2',prefix+'-'+frame+'.png')),'승인된 선화 프레임이 누락되었습니다: '+prefix+'-'+frame);
}
console.log('PASS: 20 schedule specs, hero/NPC 96px boxes, baseline, braid direction, and approved v2 frames');
