import fs from 'node:fs';
import assert from 'node:assert/strict';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/schedule.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');

for(const asset of ['app.js','style.css','schedule.css'])assert.ok(html.includes(`${asset}?v=0.64.156-debug`),`${asset} 캐시 키가 표시 버전과 같아야 합니다.`);

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
assert.match(app,/motion==='dance'&&age==='13'[^\n]+length:10[^\n]+dance-10fps-v5[^\n]+flatMap\(frame=>\[frame,frame\]\)/,'13세 경연 춤은 10개 자세를 두 틱씩 유지해야 합니다.');
assert.match(css,/\.pageant-hero-frames\.is-dance img\{[^}]*animation-name:pageant-frame-20;[^}]*animation-duration:2s;[^}]*\.1s/,'경연 춤은 10fps를 유지하며 2초 동안 천천히 재생해야 합니다.');
assert.match(app,/festivalKingCut\(line,alt\)[^\n]+<b>왕<\/b>/,'경연을 주관하는 군주는 왕으로 표기해야 합니다.');
assert.doesNotMatch(app,/(황이 예절|황이 대상|알리는 황|시상하는 황|하사하는 황)/,'왕의 경연 대사와 설명에 황 표기가 남으면 안 됩니다.');
assert.match(app,/id:'hyeon',name:'현',role:'정체를 숨긴 왕세자'/,'현은 왕의 아들인 왕세자로 설정해야 합니다.');
assert.match(html,/id="moonlightPageant"/,'경연 전용 레이어 컨테이너가 필요합니다.');
assert.match(css,/\.pageant-winner/,'우승자 확대 레이어 규격이 필요합니다.');
assert.match(css,/@keyframes pageant-bow/,'예절 심사 절 동작이 필요합니다.');
assert.match(app,/moonlightMotionNames=\['opening-dialogue','opening-dialogue','title','final-lineup'/,'첫 대화 뒤 중복 준비 장면 없이 제목과 참가자 소개로 이어져야 합니다.');
assert.match(app,/function moonlightLineupGestureImage\(entry\)/,'13세 참가자 실제 동작 프레임 선택기가 필요합니다.');
assert.match(css,/@keyframes pageant-lineup-real-frames/,'정지 그림 흔들기 대신 실제 자세 이미지 교체 애니메이션이 필요합니다.');
assert.doesNotMatch(css,/@keyframes pageant-lineup-(?:hair-tuck|hesitate|skirt-sway|look-around)/,'정지 그림을 통째로 흔드는 가짜 동작이 남아 있으면 안 됩니다.');
for(let contestant=1;contestant<=7;contestant+=1)assert.ok(fs.existsSync(new URL(`../assets/events/holidays/moonlight-pageant/contestants/animation/age-13/contestant-${contestant}-gesture-v1.png`,import.meta.url)),`13세 참가자 ${contestant} 실제 3프레임 묶음이 필요합니다.`);
assert.ok(fs.existsSync(new URL('../assets/events/holidays/moonlight-pageant/contestants/animation/age-13/seonhwa-gesture-v1.png',import.meta.url)),'13세 선화 실제 3프레임 묶음이 필요합니다.');
for(let frame=1;frame<=10;frame+=1)assert.ok(fs.existsSync(new URL(`../assets/events/holidays/moonlight-pageant/seonhwa/age-13/dance-10fps-v5/seonhwa-dance-${String(frame).padStart(2,'0')}-v5.png`,import.meta.url)),`13세 쯔꾸르 춤 ${frame}프레임이 필요합니다.`);
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
assert.match(app,/function bindHolidayQaTap\(session,startBeat,beats,renderer,caption\)/,'명절 QA도 화면 터치로 다음 장면을 순환해야 합니다.');
assert.match(css,/\.moonlight-pageant\.festival-pm3\.tap-ready\{[^}]*pointer-events:auto/,'터치 준비가 끝난 경연 레이어는 실제 포인터 입력을 받아야 합니다.');
assert.match(css,/action-holiday-chuseok:not\(\[hidden\]\)[^}]*>\.dialogue,[^}]*action-holiday-seollal:not\(\[hidden\]\)[^}]*>\.dialogue\{display:none!important\}/,'추석·설날 이벤트 중에는 바깥 하단 설명창을 숨겨야 합니다.');
assert.match(css,/\.activity-stage:is\(\.action-holiday-chuseok,\.action-holiday-seollal\)\{[^}]*left:2%!important;[^}]*right:2%!important;[^}]*top:20%!important;[^}]*bottom:1%!important;[^}]*height:auto!important;[^}]*border:0!important;[^}]*background:none!important;[^}]*box-shadow:none!important/,'추석·설날 이벤트는 일반 일정용 쯔꾸르 액자 없이 화면 하단까지 넓게 보여야 합니다.');
assert.match(css,/\.activity-stage:is\(\.action-holiday-chuseok,\.action-holiday-seollal\)>\.stage-inner\{[^}]*border:0!important;[^}]*box-shadow:none!important/,'명절 이벤트 내부의 이중 액자도 제거해야 합니다.');
assert.match(css,/\.activity-stage:is\(\.action-holiday-chuseok,\.action-holiday-seollal\) \.stage-map\{opacity:0!important\}/,'명절 이벤트는 내부 배경을 겹쳐 그리지 않고 전체 화면 배경 하나만 사용해야 합니다.');
assert.match(app,/holidayBackground[\s\S]{0,220}bg\.src=holidayBackground;stageMap\.src=holidayBackground/,'추석 실제 진행에서는 전체 화면과 무대가 같은 배경 자산을 공유해야 합니다.');
assert.match(app,/holidayBackground[^\n]+bg\.src=holidayBackground;document\.querySelector\('#stageMap'\)\.src=holidayBackground/,'추석 QA에서도 전체 화면과 무대가 같은 배경 자산을 공유해야 합니다.');
assert.match(app,/function festivalLineup\(session\)[^\n]+lineup-gesture-frames/,'8인 소개 장면은 실제 동작 프레임을 사용해야 합니다.');
assert.doesNotMatch(app,/function festivalLineup\(session\)[^\n]+<figcaption>/,'8인 소개 장면에는 캐릭터 이름표를 표시하지 않아야 합니다.');
assert.match(css,/\.pageant-intro-lineup \.lineup-gesture-frames\{[^}]*width:74px;[^}]*height:100px;[^}]*animation:pageant-lineup-real-frames/,'8인 참가자는 확대된 실제 프레임 애니메이션으로 보여야 합니다.');
assert.match(css,/\.moonlight-pageant\.festival-pm3\.beat-4 \.pageant-intro-lineup\{[^}]*grid-template-rows:88px 112px/,'참가자 대열은 무대 원근에 맞는 앞뒤 두 열이어야 합니다.');
assert.match(css,/figure:nth-child\(-n\+4\)[^}]*\.lineup-gesture-frames\{[^}]*width:64px;[^}]*height:86px/,'뒤 열 참가자는 원근에 맞게 작아야 합니다.');
assert.match(css,/figure:nth-child\(n\+5\)[^}]*\.lineup-gesture-frames\{[^}]*width:80px;[^}]*height:108px/,'앞 열 참가자는 원근에 맞게 커야 합니다.');
assert.match(css,/\.sehwa-opening-dialogue>\.sehwa-dialogue-bust\{[^}]*width:62%;[^}]*height:132%;[^}]*mask-image:linear-gradient/,'경연 대화 초상은 동일 크기와 자연스러운 하단 페이드를 사용해야 합니다.');
assert.match(css,/\.sehwa-opening-dialogue>\.sehwa-dialogue-bust\{[^}]*bottom:-54%/,'경연 대화 초상은 무대 하단에 닿도록 충분히 내려와야 합니다.');
assert.match(css,/\.sehwa-opening-dialogue\.speaker-guardian>\.sehwa-dialogue-bust\{[^}]*left:-22%;[^}]*bottom:-2%;[^}]*width:112%;[^}]*object-position:center bottom/,'신수 대화 컷은 좌측 무대 하단에 고정해 빈 공간을 채워야 합니다.');
assert.match(css,/\.sehwa-opening-dialogue>\.sehwa-expression\{[^}]*bottom:-54%/,'선화 답변 초상도 신수와 같은 무대 바닥선에 닿아야 합니다.');

console.log('PASS: 한가위 달빛 아씨 경연 8인·19장면·6프레임 춤·우승자 인터뷰');
