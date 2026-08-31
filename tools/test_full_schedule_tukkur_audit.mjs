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

assert.ok(app.includes("stage.style.setProperty('--layer-npc-scale','1');"),'렌더러는 일정별 NPC 확대값을 사용하면 안 됩니다.');
assert.ok(!app.includes("npc.style.setProperty('width','160px','important')"),'렌더러는 NPC에 인라인 확대 크기를 넣으면 안 됩니다.');
assert.match(finalCss,/#activityStage\.schedule-layered \.schedule-scene-layer\.layer-npc\{transform:translateX\(-50%\)!important/,'최종 NPC 규칙은 개별 스케일을 제거해야 합니다.');

const education=['reading','arithmetic','manners'];
for(const id of education)assert.match(css,new RegExp('#activityStage:is\\(\\.action-reading,\\.action-arithmetic,\\.action-manners\\).*96px'),'교육 '+id+'도 96px 쯔꾸르 계약에 포함돼야 합니다.');
assert.match(css,/#activityStage:is\(\.action-reading,\.action-arithmetic,\.action-manners\) \.stage-character\.pixel-sprite,#activityStage:is\(\.action-reading,\.action-arithmetic,\.action-manners\) \.stage-npc\.npc-teacher\{width:96px!important;height:96px!important/,'글읽기·셈하기·예절의 선화와 훈장은 모두 96px이어야 합니다.');
console.log('PASS: 20 schedule specs plus 3 education scenes use the 96px actor contract');
