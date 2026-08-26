import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const root=new URL('../',import.meta.url);
const catalog=app.slice(app.indexOf('const relationEpisodeCatalog='),app.indexOf('function relationRecord'));
for(const id of ['doyun','seojin','yeonwoo','taegyeom','hyeon']){
  assert.equal((catalog.match(new RegExp(`id:'${id}-[1-5]'`,'g'))||[]).length,5,`${id} needs five unique episodes`);
}
for(const key of ['scene','outfit','pose','expression','camera']){
  assert.equal((catalog.match(new RegExp(`${key}:'`,'g'))||[]).length,25,`each romance episode needs a ${key} visual spec`);
}
assert.match(app,/completedEpisodes/);
assert.match(app,/maybeScheduleRelationEncounter\(action\)/);
assert.match(app,/nextRelationEpisode\(relation,'vacation'\)/);
assert.match(app,/record\.meetings=Math\.min\(5,record\.meetings\+1\)/);
assert.match(app,/record\.dateUnlocked=true/);
assert.match(app,/scheduleQaParams\.get\('qaMeeting'\)/,'인연 QA에서 1~5회차를 직접 선택할 수 있어야 합니다.');
assert.match(app,/data-relation-id/,'인연 QA에서 다섯 후보를 직접 전환할 수 있어야 합니다.');
assert.match(app,/data-relation-meeting/,'인연 QA에 다섯 회차 버튼이 있어야 합니다.');
assert.match(app,/const relationVoiceProgression=/,'남자 주인공별 1~5회 관계 말투 진행표가 필요합니다.');
assert.match(app,/relationReplyChoices\(candidate,episode\)/,'회차별 장소와 제목을 반영한 선택지를 사용해야 합니다.');
assert.match(app,/male\.src=relationDialoguePosePath\(candidate,episode,choice\.emotion\)/,'선택 결과에 따라 남자 주인공 반응 포즈가 바뀌어야 합니다.');
assert.match(app,/episode\?\.pose.*episode\?\.expression.*episode\?\.camera/s,'인연 QA 결과에 회차별 시각 지침이 표시되어야 합니다.');
const backgroundMap=app.slice(app.indexOf('const relationScenePresentations='),app.indexOf('function relationScenePresentation'));
const episodeScenes=[...catalog.matchAll(/scene:'([^']+)'/g)].map(match=>match[1]);
for(const scene of new Set(episodeScenes))assert.ok(backgroundMap.includes(`'${scene}':`),`${scene} 인연 배경 매핑이 필요합니다.`);
for(const [,path] of backgroundMap.matchAll(/src:'\.\.\/([^']+)'/g))assert.ok(fs.existsSync(new URL(path,root)),`${path} 인연 배경 파일이 필요합니다.`);
assert.ok(!backgroundMap.includes('spring-flower-market.webp'),'인물이 합성된 꽃시장 이벤트 이미지를 인연 배경으로 사용하면 안 됩니다.');
assert.ok(!backgroundMap.includes('autumn-festival.webp'),'인물이 합성된 등불 축제 이벤트 이미지를 인연 배경으로 사용하면 안 됩니다.');
assert.ok(!backgroundMap.includes('spring-stream-v2.webp'),'선화가 포함된 휴양 이미지를 인연 배경으로 사용하면 안 됩니다.');
assert.ok(!backgroundMap.includes('autumn-maple-v2.webp'),'선화가 포함된 휴양 이미지를 인연 배경으로 사용하면 안 됩니다.');
assert.match(app,/--relation-scene-size/,'장면별 모바일 배경 배율을 적용해야 합니다.');
assert.match(app,/--relation-scene-position/,'장면별 모바일 배경 위치를 적용해야 합니다.');
assert.match(app,/playRelationEncounterScene\(relationEvent\.candidate[\s\S]*relationEvent\.episode\)/,'실제 일정 인연 이벤트에도 회차별 배경을 전달해야 합니다.');
assert.match(app,/function protagonistFullbodyForAge\(age=game\.age\)\{\s*return `\$\{baseSpriteForAge\(age\)\}\?v=\$\{scheduleAssetRevision\}`;/,'인연 장면 선화는 검수 완료된 연령별 반실사 베이스를 사용해야 합니다.');
assert.match(app,/function relationPortraitPath\(candidate,age=game\.age\).*fullbody-v2.*relationPortraitAge/,'남자 인연 전신은 게임 나이에 맞는 13·16·19세 v2 자산을 사용해야 합니다.');
assert.ok(!app.includes('../assets/characters/dialogue-fullbody/seonhwa/age-'),'인연 장면에 예전 SD 선화 전신 경로가 남아 있으면 안 됩니다.');
console.log('PASS: 인연 후보 5명 × 고유 만남 5회, 시각 정보와 일정·바캉스 기록, 데이트 해금 연결');
