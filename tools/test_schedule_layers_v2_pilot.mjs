import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
for(const activityId of ['kitchenhelp','childcare','painting','music','dance','sewing','copying','woodwork','loomwork','farmwork','swordsmanship','spellcraft','classics','masonry','clinichelp','innhelp','ferryhelp','merchanthelp','accounting','tutoring']){
  const manifest=JSON.parse(fs.readFileSync(new URL(`../assets/schedule-layers-v2/${activityId}/manifest.json`,import.meta.url),'utf8'));
  assert.deepEqual(manifest.animation.sequence,[1,2,3],`${activityId}는 1→2→3 순환이어야 합니다.`);
  assert.equal(manifest.existingHeroFrames.length,3,'기존 선화 3프레임을 참조해야 합니다.');
  const heroFrameId=['painting','copying','spellcraft','classics','tutoring'].includes(activityId)?'calligraphy':activityId==='swordsmanship'?'manners':activityId==='accounting'?'arithmetic':activityId==='innhelp'?'merchanthelp':activityId==='sewing'?'loomwork':activityId==='music'?'sit':activityId;
  assert.ok(manifest.existingHeroFrames.every(path=>path.includes(`characters/seonhwa/schedule-actions/${heroFrameId}-pixel-`)),'신규 선화로 교체하면 안 됩니다.');
  for(const key of ['success-a','success-b','fail-a','fail-b'])assert.equal(manifest.patterns[key].frames.length,3,`${activityId} ${key}는 3프레임이어야 합니다.`);
}
const paintingManifest=JSON.parse(fs.readFileSync(new URL('../assets/schedule-layers-v2/painting/manifest.json',import.meta.url),'utf8'));
assert.deepEqual(paintingManifest.placement,{heroLeft:'34%',floorBottom:'5%',npcLeft:'68%',npcScale:.86,propLeft:'43%',propBottom:'13%',effectLeft:'46%',effectBottom:'14%'},'회화 소품과 스승은 책상 원근에 맞는 좌표를 사용해야 합니다.');
assert.ok(app.includes("const scheduleLayerV2PilotIds=new Set(['kitchenhelp','childcare','painting','music','dance','sewing','copying','woodwork','loomwork','farmwork','swordsmanship','spellcraft','classics','masonry','clinichelp','innhelp','ferryhelp','merchanthelp','accounting','tutoring'])"),'활성 일정 v2 20종이 모두 필요합니다.');
assert.ok(app.includes('window.SCHEDULE_LAYER_V2_SPECS?.[actionId]')&&html.includes('schedule-layer-manifests.js'),'file 실행에서도 v2 명세 번들을 사용해야 합니다.');
assert.ok(app.includes("if(actionId==='farmwork'&&patternKey==='fail-b'){")&&app.includes('npc.hidden=true;'),'농가 실패 B는 선화의 닭 추격만 보여야 합니다.');
assert.ok(app.includes("if(outcome==='mistake')document.querySelector('#dialogueText').textContent=''"),'실수 판정은 설명 글씨 없이 실패 모션으로 전달해야 합니다.');
assert.ok(app.includes("if(action.id!=='vacation'&&outcome!=='mistake')"),'실수 판정에서 결과 글씨 팝업을 표시하면 안 됩니다.');
assert.ok(app.includes("scheduleQaParams.get('qaPattern')"),'QA 패턴 강제 재생이 필요합니다.');
assert.ok(app.includes("const failed=outcome==='mistake'"),'struggle은 전용 실패 레이어를 사용하면 안 됩니다.');
assert.ok(!app.includes("setProperty('--layer-hero-scale'"),'일정별 선화 배율 적용이 남아 있습니다.');
assert.match(css,/activity-stage\.schedule-layered \.stage-character\.pixel-sprite\{[\s\S]*?width:146px!important;[\s\S]*?height:146px!important;/,'레이어 일정 선화 크기가 고정되지 않았습니다.');
assert.ok(css.includes('activity-stage.action-woodwork.schedule-layered .schedule-scene-layer.layer-effect{width:126px!important}'),'목공소 작업대가 선화를 과도하게 가리면 안 됩니다.');
assert.ok(css.includes('activity-stage.action-childcare.schedule-layered .schedule-scene-layer.layer-pattern.fail-b{left:70%!important;bottom:18%!important;width:44px!important}'),'아이 돌보기 실패 소품은 아이 얼굴보다 작아야 합니다.');
console.log('PASS: 활성 일정 v2 20종, file 번들, QA 패턴, 선화 고정 크기');
