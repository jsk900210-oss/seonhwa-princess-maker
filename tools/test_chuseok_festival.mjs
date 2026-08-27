import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');

assert.match(app,/const moonlightContestants=\[/,'고정 더미 참가자 명세가 필요합니다.');
const contestantBlock=app.match(/const moonlightContestants=\[([\s\S]*?)\n\];/)?.[1]||'';
assert.equal((contestantBlock.match(/scores:\[/g)||[]).length,7,'더미 참가자는 정확히 7명이어야 합니다.');
assert.match(contestantBlock,/scores:\[148,325,520,700\]/,'연령대별 대상 최고 경쟁 점수를 유지해야 합니다.');
assert.match(app,/playerStats\.sense\+playerStats\.manners\+playerStats\.dignity/,'센스·예절·기품을 모두 평가해야 합니다.');
assert.match(app,/index===0\?'대상':index===1\?'우수상':index<=3\?'장려상':'예선탈락'/,'결과는 4단계여야 합니다.');
assert.match(app,/prize:winner\.player\?'월백 옥패 노리개':null/,'선화는 대상일 때만 상품을 얻어야 합니다.');
assert.match(app,/const moonlightStoryBeats=\[/,'경연 이야기 명세가 필요합니다.');
const beats=app.match(/const moonlightStoryBeats=\[([\s\S]*?)\n\];/)?.[1]||'';
assert.equal((beats.match(/'[^']+'/g)||[]).length,17,'초청장·도착 중복 장면을 뺀 경연은 우승자 인터뷰를 포함한 17개 이야기 비트여야 합니다.');
assert.doesNotMatch(beats,/초청장을 다시 확인|경연장에 도착해 참가표/,'삭제 요청된 초청장 확인·참가표 수령 장면이 남아 있으면 안 됩니다.');
assert.match(app,/king-presenting-v1\.png/,'왕의 대상 시상 포즈가 필요합니다.');
assert.match(html,/id="moonlightPageant"/,'경연 전용 레이어 컨테이너가 필요합니다.');
assert.match(css,/\.pageant-winner/,'우승자 확대 레이어 규격이 필요합니다.');
assert.match(css,/@keyframes pageant-bow/,'예절 심사 절 동작이 필요합니다.');
assert.match(app,/moonlightMotionNames=\['opening-dialogue','opening-dialogue','title','final-lineup'/,'첫 대화 뒤 중복 준비 장면 없이 제목과 참가자 소개로 이어져야 합니다.');
assert.match(css,/@keyframes pageant-lineup-hair-tuck/,'참가자 머리카락 정돈 동작이 필요합니다.');
assert.match(css,/@keyframes pageant-lineup-hesitate/,'참가자 머뭇거림 동작이 필요합니다.');
assert.match(css,/@keyframes pageant-lineup-skirt-sway/,'참가자 치맛자락 흔들림 동작이 필요합니다.');
assert.match(css,/@keyframes pageant-lineup-look-around/,'참가자 좌우 살핌 동작이 필요합니다.');
assert.match(app,/motion==='dance'\?6:3/,'춤은 준비부터 마무리까지 6프레임이어야 합니다.');
assert.match(app,/moonlightActingPoseMap=\{invitation:\[1,2,3,4\],prepare:\[5,7,8\],enter:\[9,10,11\],bow:\[11,12,13\],finish:\[13,14,15\],interview:\[14,15,16\]\}/,'경연 핵심 행동별 연속 포즈 연결이 필요합니다.');
assert.match(app,/festivalWinnerInterview\(session\)/,'경연 마지막에 실제 대상 수상자 인터뷰가 필요합니다.');
assert.match(app,/function moonlightOpeningAnswer\(session\)/,'스테이터스에 따른 추석 선화의 시작 답변이 필요합니다.');
assert.match(app,/function moonlightOpeningDialogue\(session,beat\)/,'추석 시작 장면은 신수와 선화의 상반신 대화가 필요합니다.');
assert.match(app,/function waitForMoonlightAdvance\(beat\)/,'추석 장면은 비트별 최소 체류 시간을 가져야 합니다.');
assert.match(app,/beat<=1\?1600:700/,'추석 시작 대화는 최소 1.6초 뒤 진행할 수 있어야 합니다.');
assert.doesNotMatch(app,/overlay\.innerHTML=`\$\{festivalCrowd\(\)\}/,'추석 이벤트에 관객 실루엣이 계속 남아 있으면 안 됩니다.');
assert.match(css,/\.moonlight-pageant\.festival-pm3\{overflow:visible\}/,'추석 진행 버튼을 창 아래에 배치할 수 있어야 합니다.');
assert.match(css,/\.moonlight-pageant\.festival-pm3 \.pageant-hero-action,[^{]+\{[^}]*width:132px!important;[^}]*height:176px!important/,'추석 선화는 설날과 같은 축소 규격이어야 합니다.');
assert.doesNotMatch(app,/선화의 대답 듣기|<button class="pageant-next"/,'추석 경연에 별도 다음 버튼이 남아 있으면 안 됩니다.');
assert.match(app,/return waitForFestivalTapAdvance\(beat<=1\?1600:700\)/,'추석 경연은 화면 터치로 진행해야 합니다.');
assert.match(css,/\.moonlight-pageant\.festival-pm3 \.pageant-lineup \.is-player img\{[^}]*width:58px;[^}]*height:78px;[^}]*drop-shadow\(0 2px 2px/,'참가자 소개에서 선화만 과도하게 빛나거나 커지면 안 됩니다.');
assert.match(css,/\.pageant-interview p\{[^}]*word-break:keep-all;[^}]*text-wrap:pretty/,'우승자 인터뷰 대사는 한글 어절 중간에서 끊기지 않아야 합니다.');
for(const age of ['09','13','16','18'])for(let frame=1;frame<=6;frame+=1){
  const file=new URL(`../assets/events/holidays/moonlight-pageant/seonhwa/age-${age}/seonhwa-dance-${frame}-v4.png`,import.meta.url);
  assert.ok(fs.existsSync(file),`연령 ${age} 춤 ${frame}프레임이 필요합니다.`);
}
for(const age of ['09','13','16','18'])for(let frame=1;frame<=16;frame+=1){
  const file=new URL(`../assets/events/holidays/moonlight-pageant/seonhwa/age-${age}/acting-v5/seonhwa-acting-${String(frame).padStart(2,'0')}-v5.png`,import.meta.url);
  assert.ok(fs.existsSync(file),`연령 ${age} 경연 연기 ${frame}프레임이 필요합니다.`);
}
assert.match(app,/qaHoliday'\)==='chuseok'/,'경연 즉시 검수 모드가 필요합니다.');

console.log('PASS: 한가위 달빛 아씨 경연 8인·19장면·6프레임 춤·우승자 인터뷰');
