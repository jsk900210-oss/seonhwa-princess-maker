const bg = document.querySelector('.background');
const stableAppHeight=window.innerHeight;document.documentElement.style.setProperty('--stable-app-height',`${stableAppHeight}px`);
window.addEventListener('orientationchange',()=>setTimeout(()=>document.documentElement.style.setProperty('--stable-app-height',`${window.innerHeight}px`),250));
const character = document.querySelector('#character');
const missing = document.querySelector('#missing');
const panel = document.querySelector('#panel');
const panelTitle = document.querySelector('#panelTitle');
const panelBody = document.querySelector('#panelBody');
const originalPrologueScenes = [
  { image:'../assets/cinematics/prologue/p1-rainy-street.webp', chapter:'서장 · 비 오는 길', alt:'비 오는 마을길', rain:true, text:'저물녘부터 내리던 비가 좀처럼 그치지 않았다.' },
  { image:'../assets/cinematics/prologue/p2-child-collapsed.webp', chapter:'서장 · 발견', alt:'길가에 쓰러진 아이', rain:true, text:'길 한켠, 빗물 고인 길가에 작은 아이가 쓰러져 있었다. 선비는 걸음을 멈췄다.' },
  { image:'../assets/cinematics/prologue/p3-carry-home.webp', chapter:'서장 · 데려오다', alt:'아이를 데려오는 선비', rain:true, text:'선비는 아이를 품에 안고 제 집으로 걸음을 서둘렀다.' },
  { image:'../assets/cinematics/prologue/p4-fever-care.webp', chapter:'서장 · 밤새 돌봄', alt:'아이를 돌보는 한옥 방', rain:false, text:'선비는 약을 달이며 밤이 깊도록 곁을 떠나지 않았다.' },
  { image:'../assets/cinematics/prologue/p4b-fever-check.webp', chapter:'서장 · 남은 열기', alt:'아이의 열을 확인하는 선비', rain:false, text:'선비는 조심스럽게 아이의 이마에 손등을 대었다.' },
  { image:'../assets/cinematics/prologue/p5-dawn.webp', chapter:'서장 · 새벽', alt:'고요한 새벽', rain:false, text:'새벽이 되어서야 아이의 숨이 고르게 잦아들었다.' },
  { image:'../assets/cinematics/prologue/p6-awaken.webp', chapter:'서장 · 눈을 뜨다', alt:'눈을 뜬 아이', rain:false, text:'아침 볕이 문살에 들 무렵 아이가 눈을 떴다.' },
  { image:'../assets/cinematics/prologue/p7-no-memory.webp', chapter:'서장 · 기억이 없다', alt:'기억을 더듬는 아이', rain:false, text:'이름을 묻자 아이는 한동안 대답하지 못했다.' },
  { image:'../assets/cinematics/prologue/p7b-head-shake.webp', chapter:'서장 · 기억이 없다', alt:'고개를 젓는 아이', rain:false, text:'아이는 천천히 고개를 저었다. 아무것도 떠올릴 수 없었다.' },
  { image:'../assets/cinematics/prologue/p8-decision.webp', chapter:'서장 · 결심', alt:'따뜻한 죽을 내어주는 선비', rain:false, text:'선비는 아이가 기억을 되찾을 때까지 머물도록 했다.' }
];
const prologueScenes=window.SEONHWA_STORY?.prologue||originalPrologueScenes;
let prologueIndex=0, prologueTimer=null;
let prologueImageLayer=0, prologueRenderId=0;
let prologueSoundOn=true, rainAudio=null;
const SETTINGS_KEY='seonhwa-princess-settings-v1';
const defaultSettings={bgmEnabled:true,bgmVolume:100,sfxEnabled:true,sfxVolume:100,referralCode:''};
function loadSettings(){try{return {...defaultSettings,...JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')};}catch{return {...defaultSettings};}}
const userSettings=loadSettings();
function saveSettings(){localStorage.setItem(SETTINGS_KEY,JSON.stringify(userSettings));}
const scaledVolume=(base,kind)=>Math.max(0,Math.min(1,base*((userSettings[kind+'Volume']??100)/100)));
const gameMusic=new Audio();
gameMusic.preload='auto';gameMusic.loop=true;gameMusic.volume=.24;
const gameMusicTracks={home:'../assets/audio/music/gameplay/bgm-home-daily.mp3',market:'../assets/audio/music/gameplay/bgm-schedule.mp3'};
function vacationMusicPath(seasonName=game.season,ageValue=game.age){const age=ageValue>=18?'18':ageValue>=16?'16':ageValue>=13?'13':'09';const season={봄:'spring',여름:'summer',가을:'autumn',겨울:'winter'}[seasonName]||'spring';return `../assets/audio/music/vacation/age-${age}/vacation-${season}.mp3`;}
function playGameMusic(source,volume=.24){if(!source)return;const target=new URL(source,document.baseURI).href;if(gameMusic.src!==target){gameMusic.pause();gameMusic.src=target;gameMusic.currentTime=0;gameMusic.load();}gameMusic.dataset.track=source;gameMusic.dataset.baseVolume=String(volume);gameMusic.volume=scaledVolume(volume,'bgm');if(userSettings.bgmEnabled)gameMusic.play().catch(()=>{});else gameMusic.pause();}
function playHomeMusic(){playGameMusic(gameMusicTracks.home,.22);}
function playMarketMusic(){playGameMusic(gameMusicTracks.market,.20);}
function playVacationMusic(seasonName=game.season){
  const source=vacationMusicPath(seasonName);
  playGameMusic(source,.04);
  fadeAudio(gameMusic,scaledVolume(.28,'bgm'),900);
}
function stopGameMusic(){fadeAudio(gameMusic,0,350);}
function transitionPrologueToHomeMusic(){
  const prologueMusic=document.querySelector('#prologueMusic');
  playGameMusic(gameMusicTracks.home,.01);
  fadeAudio(gameMusic,scaledVolume(.22,'bgm'),1600);
  fadeAudio(prologueMusic,0,1600);
}

const game = { characterName:'', nannyName:'', guardianType:null, guardianName:'', profileSlot:null, age: 9, height:130, weight:28.5, month: 1, week: 1, season:'봄', money: 50000, cash:50000, health:42, strength:18, agility:20, intelligence:35, magic:8, mentality:30, dignity:36, manners:28, speech:14, sensitivity:40, sense:24, charm:30, stress:12, items: [], purchasedGoods:[], relations:{}, activityProgress:{}, activityUnlocksSeen:[], startingGiftId:null, fatherBirthdayYears:[], equippedOutfit:null, autoOutfit:true, dailySchedule: [null,null,null,null,null,null,null], birthday:null, currentDate:null, endingDate:null, ended:false, endingResult:null, birthdayCount:0, element:null, birthSeason:null, memory:0, truth:0, exposure:0, fatherAffinity:0, guardianTrust:50, nannyAffinity:50, lastGreetingDate:null, monthlyLedger:null };
const guardianDefs={
  cheongryong:{name:'청룡',mark:'龍',theme:'#294e67',gift:{name:'푸른 여의주 조각',change:{intelligence:5,magic:4}},intro:'동쪽의 푸른 숨결. 배움과 술법의 길을 살피는 신수입니다.'},
  baekho:{name:'백호',mark:'虎',theme:'#ddd8ce',gift:{name:'흰 범의 방울',change:{strength:5,agility:4}},intro:'서쪽의 굳센 발걸음. 위험 앞에서 용기와 무예를 북돋는 신수입니다.'},
  jujak:{name:'주작',mark:'朱',theme:'#a93e32',gift:{name:'붉은 깃의 매듭',change:{charm:5,sensitivity:4}},intro:'남쪽의 따뜻한 불빛. 상처를 보듬고 좋은 인연을 잇는 신수입니다.'},
  hyeonmu:{name:'현무',mark:'玄',theme:'#292d35',gift:{name:'검은 옥패',change:{mentality:5,health:4}},intro:'북쪽의 깊은 물결. 흔들리지 않는 마음과 보호의 힘을 지닌 신수입니다.'}
};
const guardianStoryScenes=[
  {chapter:'첫 장 · 하늘이 내린 벗',image:'../assets/cinematics/guardian/guardian-descent-age09.png',alt:'아홉 번째 생일 밤 아이 앞에 함께 나타난 네 신수',group:true,effect:'constellation',text:'아홉 번째 생일 밤, 고요하던 마당 위로 네 갈래의 별빛이 열렸습니다.'}
];
let guardianStoryIndex=0,guardianCinematicTimeline=[],guardianCinematicBeat=0,guardianInputLockedUntil=0,selectedGuardianType=null,introDialogueQueue=[],introDialogueIndex=0;
const statGroups = [
  { title: '신체', stats: [['health','체력'],['strength','힘'],['agility','민첩']] },
  { title: '지성·마음', stats: [['intelligence','지능'],['magic','마력'],['mentality','정신력']] },
  { title: '품격·소통', stats: [['dignity','기품'],['manners','예절'],['speech','화술']] },
  { title: '감각·매력', stats: [['sensitivity','감수성'],['sense','센스'],['charm','매력']] }
];
const statDisplayOrder=[...statGroups.flatMap(group=>group.stats.map(([key])=>key)),'stress','nannyAffinity','fatherAffinity','guardianTrust','memory','truth','exposure'];
const statDisplayRank=new Map(statDisplayOrder.map((key,index)=>[key,index]));
const orderedChangeEntries=(change={})=>Object.entries(change).sort(([left],[right])=>(statDisplayRank.get(left)??999)-(statDisplayRank.get(right)??999));
const expressions = [
  ['../assets/characters/seonhwa/age-09/base/seonhwa-age09-base.png','기본'],
  ['../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-happy.png','웃음'],
  ['../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-sad.png','슬픔'],
  ['../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-surprised.png','당황'],
  ['../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-angry.png','화남'],
  ['../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-tired.png','피곤함']
];
const homeConditionPoses={
  happy:'../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-happy.png',
  sad:'../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-sad.png',
  shocked:'../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-shocked.png',
  angry:'../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-angry.png',
  tired:'../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-tired.png',
  rebellious:'../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-rebellious.png',
  normal:'../assets/characters/seonhwa/age-09/base/seonhwa-age09-base.png'
};
const backgrounds = {
  home: '../assets/backgrounds/home/home-room-morning.webp',
  seodang: '../assets/backgrounds/seodang/seodang-day.webp',
  market: '../assets/backgrounds/market/market-day.webp',
  pharmacy: '../assets/backgrounds/pharmacy/pharmacy-day.webp',
  courtyard: '../assets/backgrounds/pixel-activities/close/courtyard.webp',
  etiquetteRoom: '../assets/backgrounds/pixel-activities/close/etiquette-room.webp',
  studyRoom: '../assets/backgrounds/pixel-activities/close/study-room-clear.webp',
  arithmeticRoom: '../assets/backgrounds/pixel-activities/close/arithmetic-room.webp',
  marketErrand: '../assets/backgrounds/pixel-activities/close/market-errand-v2.webp',
  herbField: '../assets/backgrounds/pixel-activities/close/herb-field-v2.webp',
  restRoom: '../assets/backgrounds/pixel-activities/close/rest-room.webp',
  houseWorkroom: '../assets/backgrounds/pixel-activities/close/kitchen-workroom.webp'
};
Object.assign(backgrounds,{
  farmJob:'../assets/backgrounds/pixel-jobs/farmwork.webp',childcareJob:'../assets/backgrounds/pixel-jobs/childcare.webp',kitchenJob:'../assets/backgrounds/pixel-jobs/kitchenhelp.webp',woodworkJob:'../assets/backgrounds/pixel-jobs/woodwork.webp',loomJob:'../assets/backgrounds/pixel-jobs/loomwork.webp',masonryJob:'../assets/backgrounds/pixel-jobs/masonry.webp',clinicJob:'../assets/backgrounds/pixel-jobs/clinichelp.webp',ferryJob:'../assets/backgrounds/pixel-jobs/ferryhelp.webp',merchantJob:'../assets/backgrounds/pixel-jobs/merchanthelp.webp'
});
const SAVE_KEY = 'seonhwa-princess-mvp-save-v2';
const SESSION_ACTIVE_KEY = 'seonhwa-princess-mvp-session-active';
const SAVE_SLOTS = [1,2,3,4,5];
const LEGACY_SAVE_KEYS = ['seonhwa-princess-mvp-save-v1'];
let pendingRecoverySave=null;
const statMaximum=key=>key==='stress'?100:999;
const clampStat=(key,value)=>Math.max(0,Math.min(statMaximum(key),Number(value)||0));
const boundedStats=[...new Set(statGroups.flatMap(group=>group.stats.map(([key])=>key)).concat(['stress','nannyAffinity','fatherAffinity','guardianTrust','memory','truth','exposure']))];
const legacyStatMap={healthiness:'mentality',study:'intelligence',arithmetic:'sense',arts:'sensitivity',martial:'strength',archery:'agility',riding:'agility',craft:'sense',cooking:'sense',embroidery:'sense',virtue:'dignity',medicine:'magic',commerce:'speech',reputation:'speech'};
const canonicalStatKey=key=>legacyStatMap[key]||key;
function canonicalizeChange(change={}){const result={};Object.entries(change).forEach(([key,value])=>{const mapped=canonicalStatKey(key);result[mapped]=(result[mapped]||0)+value;});return result;}
function migrateLegacyStats(){
  const average=(...keys)=>Math.round(keys.reduce((sum,key)=>sum+(Number(game[key])||0),0)/keys.length);
  if(!Number.isFinite(Number(game.strength)))game.strength=average('martial','health');
  if(!Number.isFinite(Number(game.agility)))game.agility=average('archery','riding','health');
  if(!Number.isFinite(Number(game.intelligence)))game.intelligence=average('study','arithmetic');
  if(!Number.isFinite(Number(game.magic)))game.magic=average('medicine','sensitivity');
  if(!Number.isFinite(Number(game.mentality)))game.mentality=average('healthiness','virtue');
  if(!Number.isFinite(Number(game.dignity)))game.dignity=average('virtue','reputation');
  if(!Number.isFinite(Number(game.speech)))game.speech=average('commerce','reputation');
  if(!Number.isFinite(Number(game.sense)))game.sense=average('craft','arts','arithmetic');
}
function normalizeStats(){migrateLegacyStats();boundedStats.forEach(key=>{if(Object.hasOwn(game,key))game[key]=clampStat(key,game[key]);});}
const growthProfile={9:[130,28.5],10:[135,31],11:[140,34],12:[145,38],13:[149,42],14:[153,45.5],15:[156,48.5],16:[158.5,51.5],17:[160.5,54],18:[162,56.5],19:[163,58]};
function expectedBodyMetrics(age=game.age){return growthProfile[Math.max(9,Math.min(19,Math.floor(Number(age)||9)))]||growthProfile[9];}
function normalizeBodyMetrics(){const [height,weight]=expectedBodyMetrics();if(!Number.isFinite(Number(game.height)))game.height=height;if(!Number.isFinite(Number(game.weight)))game.weight=weight;game.height=Math.max(100,Math.min(190,Math.round(Number(game.height)*10)/10));game.weight=Math.max(18,Math.min(100,Math.round(Number(game.weight)*10)/10));}
function applyAgeGrowth(previousAge,nextAge){if(nextAge<=previousAge)return;const [beforeHeight,beforeWeight]=expectedBodyMetrics(previousAge),[afterHeight,afterWeight]=expectedBodyMetrics(nextAge);normalizeBodyMetrics();game.height=Math.round((game.height+afterHeight-beforeHeight)*10)/10;game.weight=Math.round((game.weight+afterWeight-beforeWeight)*10)/10;}
const actionPresentation = {
  reading: { motion:'motion-calligraphy', location:'studyRoom', prop:'none', activity:'calligraphy', npc:'teacher' }, arithmetic: { motion:'motion-arithmetic', location:'arithmeticRoom', prop:'none', activity:'arithmetic', npc:'teacher' },
  manners: { motion:'motion-manners', location:'etiquetteRoom', prop:'none', activity:'manners', npc:'teacher' }, errand: { motion:'motion-errand', location:'marketErrand', prop:'none', activity:'errand', npc:null },
  sweeping: { motion:'motion-sweeping', location:'courtyard', prop:'none', activity:'sweeping', npc:'dolsoe' }, herbs: { motion:'motion-herbs', location:'herbField', prop:'none', activity:'herbs', npc:'herbalist' },
  houseclean: { motion:'motion-houseclean', location:'restRoom', prop:'none', activity:'houseclean', npc:null },
  farmwork: { motion:'motion-job-farm', location:'farmJob', prop:'none', activity:'farmwork', npc:null },
  childcare: { motion:'motion-job-childcare', location:'childcareJob', prop:'none', activity:'childcare', npc:null },
  kitchenhelp: { motion:'motion-job-kitchen', location:'kitchenJob', prop:'none', activity:'kitchenhelp', npc:null },
  woodwork: { motion:'motion-job-woodwork', location:'woodworkJob', prop:'none', activity:'woodwork', npc:null },
  loomwork: { motion:'motion-job-loom', location:'loomJob', prop:'none', activity:'loomwork', npc:null },
  masonry: { motion:'motion-job-masonry', location:'masonryJob', prop:'none', activity:'masonry', npc:null },
  clinichelp: { motion:'motion-job-clinic', location:'clinicJob', prop:'none', activity:'clinichelp', npc:null },
  rest: { motion:'motion-resting', location:'restRoom', prop:'none', activity:'sleep', npc:null },
  sleep: { motion:'motion-sleep', location:'restRoom', prop:'none', activity:'sleep', npc:null },
  shopping: { motion:'motion-walk', location:'marketErrand', prop:'none', activity:null, npc:null },
  painting: { motion:'motion-calligraphy', location:'studyRoom', prop:'none', activity:'calligraphy', npc:'teacher' },
  music: { motion:'motion-manners', location:'etiquetteRoom', prop:'none', activity:'manners', npc:'teacher' },
  dance: { motion:'motion-manners', location:'etiquetteRoom', prop:'none', activity:'manners', npc:'teacher' },
  swordsmanship: { motion:'motion-sweeping', location:'courtyard', prop:'none', activity:'sweeping', npc:null },
  spellcraft: { motion:'motion-herbs', location:'herbField', prop:'none', activity:'herbs', npc:null },
  cooking: { motion:'motion-arithmetic', location:'restRoom', prop:'none', activity:'arithmetic', npc:null },
  martial: { motion:'motion-sweeping', location:'courtyard', prop:'none', activity:'sweeping', npc:'dolsoe' },
  classics: { motion:'motion-calligraphy', location:'studyRoom', prop:'none', activity:'calligraphy', npc:'teacher' },
  innhelp: { motion:'motion-errand', location:'marketErrand', prop:'none', activity:'errand', npc:null },
  sewing: { motion:'motion-houseclean', location:'restRoom', prop:'none', activity:'houseclean', npc:null },
  copying: { motion:'motion-calligraphy', location:'studyRoom', prop:'none', activity:'calligraphy', npc:'teacher' },
  ferryhelp: { motion:'motion-job-ferry', location:'ferryJob', prop:'none', activity:'ferryhelp', npc:null },
  merchanthelp: { motion:'motion-job-merchant', location:'merchantJob', prop:'none', activity:'merchanthelp', npc:null },
  accounting: { motion:'motion-arithmetic', location:'arithmeticRoom', prop:'none', activity:'arithmetic', npc:'teacher' },
  tutoring: { motion:'motion-calligraphy', location:'studyRoom', prop:'none', activity:'calligraphy', npc:'teacher' },
  dungeon: { motion:'motion-herbs', location:'herbField', prop:'none', activity:'herbs', npc:null }
};
const vacationIllustrations=[
  {id:'vacation-age09-spring-cherry',age:9,season:'봄',name:'봄바람과 벚꽃',image:'../assets/events/vacation/photoreal/age-09/spring-cherry-wind.webp',effect:'petals',description:'봄바람에 머리카락을 넘기며 벚꽃을 맞던 9세의 추억.'},
  {id:'vacation-age09-spring-azalea',season:'봄',name:'진달래 계곡의 디딤돌',image:'../assets/events/vacation/photoreal/age-09/spring-azalea-stepping-stones.webp',effect:'calm',description:'진달래 핀 계곡의 디딤돌을 조심스레 건너던 9세의 추억.'},
  {id:'vacation-age09-spring-kite',season:'봄',name:'유채꽃 들판의 봄소풍',image:'../assets/events/vacation/photoreal/age-09/spring-kite-running.webp?v=0.62.46-debug',effect:'petals',description:'유채꽃과 벚꽃 사이에서 봄 도시락을 열어 본 9세의 추억.'},
  {id:'vacation-age09-summer-stream',season:'여름',name:'계곡의 맑은 조약돌',image:'../assets/events/vacation/photoreal/age-09/summer-stream-splash.webp?v=0.62.46-debug',effect:'calm',description:'맑은 계곡물 속에서 반짝이는 조약돌을 발견한 9세의 추억.'},
  {id:'vacation-age09-summer-shell',season:'여름',name:'바닷가의 작은 조개',image:'../assets/events/vacation/photoreal/age-09/summer-seaside-shell.webp',effect:'wave',description:'잔물결 곁에서 작은 조개를 들여다보던 9세의 추억.'},
  {id:'vacation-age09-summer-lotus',season:'여름',name:'연꽃 정자의 한낮',image:'../assets/events/vacation/photoreal/age-09/summer-lotus-pavilion.webp',effect:'wind',description:'연꽃 정자에서 부채를 부치며 수박을 먹던 9세의 추억.'},
  {id:'vacation-age09-autumn-chestnut',season:'가을',name:'가을 밤 줍기',image:'../assets/events/vacation/photoreal/age-09/autumn-chestnut-gathering.webp',effect:'leaves',description:'단풍 아래 잘 익은 밤을 발견한 9세의 추억.'},
  {id:'vacation-age09-autumn-maple',season:'가을',name:'단풍잎을 받던 길',image:'../assets/events/vacation/photoreal/age-09/autumn-maple-path.webp',effect:'leaves',description:'돌담길에서 손바닥에 내려앉은 단풍을 바라보던 9세의 추억.'},
  {id:'vacation-age09-autumn-chuseok',season:'가을',name:'추석의 보름달',image:'../assets/events/vacation/photoreal/age-09/autumn-chuseok-moon.webp',effect:'moon',description:'송편을 곁에 두고 환한 보름달을 올려다보던 9세의 추억.'},
  {id:'vacation-age09-winter-sled',season:'겨울',name:'눈 언덕의 썰매',image:'../assets/events/vacation/photoreal/age-09/winter-sledding.webp',effect:'snow',description:'눈보라를 가르며 전통 썰매를 타던 9세의 추억.'}
  ,{id:'vacation-age09-winter-seollal',season:'겨울',name:'설날 아침의 떡국',image:'../assets/events/vacation/photoreal/age-09/winter-seollal-tteokguk.webp',effect:'steam',description:'따뜻한 떡국 한 숟갈을 기다리던 설날 아침의 추억.'}
  ,{id:'vacation-age09-winter-snowball',season:'겨울',name:'눈사람을 위한 눈덩이',image:'../assets/events/vacation/photoreal/age-09/winter-snowball.webp',effect:'snow',description:'눈사람을 만들기 위해 커다란 눈덩이를 굴리던 9세의 추억.'}
  ,{id:'vacation-age13-spring-cherry',age:13,season:'봄',name:'꽃잎을 받는 오후',image:'../assets/events/vacation/photoreal/age-13/spring-cherry-wind.webp',effect:'petals',description:'흩날리는 벚꽃잎을 손바닥에 받아 보던 13세의 추억.'}
  ,{id:'vacation-age13-spring-azalea',age:13,season:'봄',name:'진달래 압화 노트',image:'../assets/events/vacation/photoreal/age-13/spring-azalea-stepping-stones.webp?v=0.62.46-debug',effect:'petals',description:'진달래 언덕에서 떨어진 꽃잎을 추억 노트에 간직한 13세의 봄.'}
  ,{id:'vacation-age13-spring-kite',age:13,season:'봄',name:'언덕 위의 연',image:'../assets/events/vacation/photoreal/age-13/spring-kite-running.webp',effect:'wind',description:'높은 봄바람을 따라 언덕에서 연을 날리던 13세의 추억.'}
  ,{id:'vacation-age13-summer-stream',age:13,season:'여름',name:'계곡을 건너는 발걸음',image:'../assets/events/vacation/photoreal/age-13/summer-stream-splash.webp',effect:'splash',description:'맑은 계곡의 바위를 디디며 물보라를 일으킨 13세의 추억.'}
  ,{id:'vacation-age13-summer-shell',age:13,season:'여름',name:'갯바위의 작은 게',image:'../assets/events/vacation/photoreal/age-13/summer-seaside-shell.webp?v=0.62.46-debug',effect:'wave',description:'잔잔한 물웅덩이에서 작은 게의 움직임을 관찰한 13세의 추억.'}
  ,{id:'vacation-age13-summer-lotus',age:13,season:'여름',name:'연꽃 정자의 바람',image:'../assets/events/vacation/photoreal/age-13/summer-lotus-pavilion.webp',effect:'wind',description:'연꽃 향이 번지는 정자에서 부채를 펼친 13세의 추억.'}
  ,{id:'vacation-age13-autumn-chestnut',age:13,season:'가을',name:'가을 숲의 밤바구니',image:'../assets/events/vacation/photoreal/age-13/autumn-chestnut-gathering.webp',effect:'leaves',description:'나무 집게로 잘 익은 밤을 바구니에 담은 13세의 추억.'}
  ,{id:'vacation-age13-autumn-maple',age:13,season:'가을',name:'햇빛에 비춘 단풍',image:'../assets/events/vacation/photoreal/age-13/autumn-maple-path.webp',effect:'leaves',description:'붉은 단풍잎을 햇빛에 비추어 바라본 13세의 추억.'}
  ,{id:'vacation-age13-autumn-chuseok',age:13,season:'가을',name:'등불과 추석 달',image:'../assets/events/vacation/photoreal/age-13/autumn-chuseok-moon.webp',effect:'moon',description:'등불과 송편을 들고 추석 보름달을 올려다본 13세의 추억.'}
  ,{id:'vacation-age13-winter-sled',age:13,season:'겨울',name:'얼음 위의 썰매',image:'../assets/events/vacation/photoreal/age-13/winter-sledding.webp',effect:'snow',description:'얼어붙은 마을 연못 위를 씩씩하게 달린 13세의 추억.'}
  ,{id:'vacation-age13-winter-seollal',age:13,season:'겨울',name:'설날 떡국 차림',image:'../assets/events/vacation/photoreal/age-13/winter-seollal-tteokguk.webp',effect:'steam',description:'설날 아침 따뜻한 떡국을 정성껏 담아낸 13세의 추억.'}
  ,{id:'vacation-age13-winter-snowball',age:13,season:'겨울',name:'눈사람의 마지막 눈덩이',image:'../assets/events/vacation/photoreal/age-13/winter-snowball.webp',effect:'snow',description:'웃으며 눈사람의 머리를 올려놓던 13세의 추억.'}
  ,{id:'vacation-age16-spring-cherry',age:16,season:'봄',name:'벚꽃빛 갈래치마',image:'../assets/events/vacation/photoreal/age-16/spring-cherry-wind.webp',effect:'petals',description:'벚꽃바람에 느슨한 땋은 머리와 그라데이션 치마가 함께 흩날린 16세의 추억.'}
  ,{id:'vacation-age16-spring-azalea',age:16,season:'봄',name:'진달래 곁의 봄비',image:'../assets/events/vacation/photoreal/age-16/spring-azalea-stepping-stones.webp',effect:'calm',description:'봄비가 그친 진달래 계곡에서 꽃을 살펴본 16세의 추억.'}
  ,{id:'vacation-age16-spring-kite',age:16,season:'봄',name:'진달래 나무그네',image:'../assets/events/vacation/photoreal/age-16/spring-kite-running.webp?v=0.62.46-debug',effect:'petals',description:'진달래가 만개한 나무 아래 그네에 앉아 봄바람을 느낀 16세의 추억.'}
  ,{id:'vacation-age16-summer-stream',age:16,season:'여름',name:'푸른 치마의 물장난',image:'../assets/events/vacation/photoreal/age-16/summer-stream-splash.webp',effect:'splash',description:'맑은 계곡에서 푸른 갈래치마 자락과 함께 물보라를 일으킨 16세의 추억.'}
  ,{id:'vacation-age16-summer-shell',age:16,season:'여름',name:'해질녘 조개바구니',image:'../assets/events/vacation/photoreal/age-16/summer-seaside-shell.webp',effect:'wave',description:'저녁 바닷바람을 맞으며 조개를 바구니에 모은 16세의 추억.'}
  ,{id:'vacation-age16-summer-lotus',age:16,season:'여름',name:'연꽃 정자의 차향',image:'../assets/events/vacation/photoreal/age-16/summer-lotus-pavilion.webp?v=0.62.46-debug',effect:'calm',description:'연꽃이 가득한 정자에서 맑은 연꽃차를 따라 본 16세의 추억.'}
  ,{id:'vacation-age16-autumn-chestnut',age:16,season:'가을',name:'밤바구니와 황금빛 숲',image:'../assets/events/vacation/photoreal/age-16/autumn-chestnut-gathering.webp',effect:'leaves',description:'황금빛 숲에서 잘 익은 밤을 주워 바구니에 담은 16세의 추억.'}
  ,{id:'vacation-age16-autumn-maple',age:16,season:'가을',name:'단풍 아래의 회전',image:'../assets/events/vacation/photoreal/age-16/autumn-maple-path.webp',effect:'leaves',description:'붉은 단풍 아래에서 풍성한 치마폭을 펼치며 돌아본 16세의 추억.'}
  ,{id:'vacation-age16-autumn-chuseok',age:16,season:'가을',name:'송편과 보름달',image:'../assets/events/vacation/photoreal/age-16/autumn-chuseok-moon.webp',effect:'moon',description:'송편을 들고 추석 보름달을 오래 바라본 16세의 추억.'}
  ,{id:'vacation-age16-winter-sled',age:16,season:'겨울',name:'얼음 아래의 반짝임',image:'../assets/events/vacation/photoreal/age-16/winter-sledding.webp?v=0.62.46-debug',effect:'snow',description:'겨울 강의 얼음 구멍에서 작은 물고기를 낚아 올린 16세의 추억.'}
  ,{id:'vacation-age16-winter-seollal',age:16,season:'겨울',name:'새해 첫 떡국',image:'../assets/events/vacation/photoreal/age-16/winter-seollal-tteokguk.webp',effect:'steam',description:'따뜻한 방에서 새해 첫 떡국을 먹은 16세의 추억.'}
  ,{id:'vacation-age16-winter-snowball',age:16,season:'겨울',name:'눈사람을 만드는 오후',image:'../assets/events/vacation/photoreal/age-16/winter-snowball.webp',effect:'snow',description:'양손으로 커다란 눈덩이를 굴려 눈사람을 만든 16세의 추억.'}
  ,{id:'vacation-age19-spring-cherry',age:19,season:'봄',name:'벚꽃 아래의 약속',image:'../assets/events/vacation/photoreal/age-19/spring-cherry-wind.webp',effect:'petals',description:'벚꽃잎을 손바닥에 받으며 새로운 계절을 맞은 19세의 추억.'}
  ,{id:'vacation-age19-spring-azalea',age:19,season:'봄',name:'진달래 물길의 발걸음',image:'../assets/events/vacation/photoreal/age-19/spring-azalea-stepping-stones.webp',effect:'calm',description:'봄비 뒤 맑아진 계곡의 디딤돌을 차분히 건넌 19세의 추억.'}
  ,{id:'vacation-age19-spring-kite',age:19,season:'봄',name:'봄 녹차밭의 새잎',image:'../assets/events/vacation/photoreal/age-19/spring-kite-running.webp?v=0.62.46-debug',effect:'calm',description:'푸른 차밭을 거닐며 여린 새잎을 살펴본 19세의 봄.'}
  ,{id:'vacation-age19-summer-stream',age:19,season:'여름',name:'한여름 계곡의 물보라',image:'../assets/events/vacation/photoreal/age-19/summer-stream-splash.webp',effect:'splash',description:'맑은 계곡물을 두 손으로 튀기며 웃은 19세의 추억.'}
  ,{id:'vacation-age19-summer-shell',age:19,season:'여름',name:'노을 바다의 조개바구니',image:'../assets/events/vacation/photoreal/age-19/summer-seaside-shell.webp',effect:'wave',description:'노을 진 물가에서 고운 조개를 바구니에 모은 19세의 추억.'}
  ,{id:'vacation-age19-summer-lotus',age:19,season:'여름',name:'연꽃 정자의 부채바람',image:'../assets/events/vacation/photoreal/age-19/summer-lotus-pavilion.webp',effect:'wind',description:'연꽃 향이 머무는 정자에서 부채로 더위를 식힌 19세의 추억.'}
  ,{id:'vacation-age19-autumn-chestnut',age:19,season:'가을',name:'황금 숲의 밤바구니',image:'../assets/events/vacation/photoreal/age-19/autumn-chestnut-gathering.webp',effect:'leaves',description:'황금빛 숲에서 잘 익은 밤을 정성껏 주운 19세의 추억.'}
  ,{id:'vacation-age19-autumn-maple',age:19,season:'가을',name:'단풍 사이의 춤',image:'../assets/events/vacation/photoreal/age-19/autumn-maple-path.webp',effect:'leaves',description:'붉은 단풍 아래에서 치마폭을 펼쳐 돌아본 19세의 추억.'}
  ,{id:'vacation-age19-autumn-chuseok',age:19,season:'가을',name:'송편과 한가위 달',image:'../assets/events/vacation/photoreal/age-19/autumn-chuseok-moon.webp',effect:'moon',description:'송편을 곁에 두고 밝은 한가위 달을 바라본 19세의 추억.'}
  ,{id:'vacation-age19-winter-sled',age:19,season:'겨울',name:'얼음판을 가르는 썰매',image:'../assets/events/vacation/photoreal/age-19/winter-sledding.webp',effect:'snow',description:'차가운 바람을 가르며 전통 썰매를 달린 19세의 추억.'}
  ,{id:'vacation-age19-winter-seollal',age:19,season:'겨울',name:'성년의 설날 떡국',image:'../assets/events/vacation/photoreal/age-19/winter-seollal-tteokguk.webp',effect:'steam',description:'따뜻한 떡국을 들며 새해를 맞은 19세의 추억.'}
  ,{id:'vacation-age19-winter-snowball',age:19,season:'겨울',name:'눈사람을 위한 마지막 눈덩이',image:'../assets/events/vacation/photoreal/age-19/winter-snowball.webp',effect:'snow',description:'커다란 눈덩이를 굴려 눈사람을 완성한 19세의 추억.'}
  ,{id:'vacation-modern-age16-summer-beach',age:16,season:'여름',name:'여름 바다의 책 한 권',image:'../assets/events/vacation/modern/age-16/summer-beach-reading.png',effect:'wave',rarity:'special',description:'강릉 바닷가의 그늘에서 책을 읽으며 쉬었던 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age16-summer-hanriver',age:16,season:'여름',name:'한강의 여름밤',image:'../assets/events/vacation/modern/age-16/summer-hanriver-picnic.png',effect:'calm',rarity:'special',description:'한강의 불빛을 바라보며 수박을 나누어 먹은 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age16-autumn-bungeoppang',age:16,season:'가을',name:'야시장의 붕어빵',image:'../assets/events/vacation/modern/age-16/autumn-nightmarket-bungeoppang.png',effect:'steam',rarity:'special',description:'따끈한 붕어빵의 김을 불며 가을 야시장을 거닐었던 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age16-autumn-photo',age:16,season:'가을',name:'등불 흐르는 가을 산책',image:'../assets/events/vacation/modern/age-16/autumn-lantern-photo.png?v=0.62.46-debug',effect:'leaves',rarity:'special',description:'도심 물길에 비친 등불을 바라보며 천천히 걸은 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age16-winter-village',age:16,season:'겨울',name:'눈 내리는 온천마을',image:'../assets/events/vacation/modern/age-16/winter-spa-village.png',effect:'snow',rarity:'special',description:'김이 오르는 돌길을 따라 눈 내리는 온천마을을 산책한 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age16-winter-jjimjilbang',age:16,season:'겨울',name:'황토방의 만화 시간',image:'../assets/events/vacation/modern/age-16/winter-jjimjilbang.png?v=0.62.46-debug',effect:'steam',rarity:'special',description:'따뜻한 황토방에 기대어 만화책과 식혜를 즐긴 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age19-summer-busan',age:19,season:'여름',name:'부산 바다의 노을',image:'../assets/events/vacation/modern/age-19/summer-busan-swimwear.png',effect:'wave',rarity:'special',description:'도시의 불빛이 켜지는 바다를 걸었던 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age19-summer-hanriver',age:19,season:'여름',name:'한강의 작은 불꽃',image:'../assets/events/vacation/modern/age-19/summer-hanriver-sparkler.png',effect:'calm',rarity:'special',description:'한강 다리 아래에서 작은 불꽃을 바라본 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age19-autumn-rain',age:19,season:'가을',name:'비 내린 야시장',image:'../assets/events/vacation/modern/age-19/autumn-rain-market.png',effect:'leaves',rarity:'special',description:'비에 젖은 골목에서 따뜻한 어묵을 고른 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age19-autumn-drum',age:19,season:'가을',name:'야시장의 따뜻한 군밤',image:'../assets/events/vacation/modern/age-19/autumn-lantern-drum.png?v=0.62.46-debug',effect:'leaves',rarity:'special',description:'가을 야시장에서 갓 깐 따뜻한 군밤을 맛본 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age19-winter-onsen',age:19,season:'겨울',name:'설경 속 노천온천',image:'../assets/events/vacation/modern/age-19/winter-openair-onsen.png',effect:'snow',rarity:'special',description:'눈 덮인 산과 소나무를 바라보며 온천의 김 속에서 쉬었던 현대의 특별한 추억.'}
  ,{id:'vacation-modern-age19-winter-garden',age:19,season:'겨울',name:'눈 내린 탕의 아침',image:'../assets/events/vacation/modern/age-19/winter-spa-garden.png?v=0.62.45-debug',effect:'steam',rarity:'special',description:'눈 덮인 한옥 정원을 바라보며 따뜻한 노천탕에서 맞이한 고요한 겨울 아침.'}
];
const spriteFrames = {
  down: [1,2,3].map(n=>`../assets/characters/seonhwa/age-09/sprites/walk/seonhwa-walk-down-${n}.png`),
  left: [1,2,3].map(n=>`../assets/characters/seonhwa/age-09/sprites/walk/seonhwa-walk-left-${n}.png`),
  right: [1,2,3].map(n=>`../assets/characters/seonhwa/age-09/sprites/walk/seonhwa-walk-right-${n}.png`)
};
const activityFrames = Object.fromEntries(['sweeping','manners','calligraphy','arithmetic','errand','herbs','rest'].map(name=>[name,[1,2,3].map(n=>`../assets/characters/seonhwa/age-09/sprites/activities/${name}-${n}.png`)]));
// 집에서 휴식은 이불에 누워 잠드는 3프레임 호흡 루프를 사용한다.
activityFrames.rest=[1,2,3].map(n=>`../assets/characters/seonhwa/age-09/sprites/activities/rest-${n}.png`);
activityFrames.calligraphy=[1,2,3].map(n=>`../assets/characters/seonhwa/age-09/sprites/activities/calligraphy-v2-${n}.png`);
// The third source cell belonged to calligraphy; keep arithmetic on the abacus-only frames.
activityFrames.arithmetic=[1,2,3].map(n=>`../assets/characters/seonhwa/age-09/sprites/activities/arithmetic-v2-${n}.png`);
activityFrames.manners=[1,2,3].map(n=>`../assets/characters/seonhwa/age-09/sprites/activities/manners-fixed-${n}.png`);
activityFrames.errand=[1,2,3].map(n=>`../assets/characters/seonhwa/age-09/sprites/activities/errand-character-v4-${n}.png`);
activityFrames.houseclean=[1,2,3,4,5,6].map(n=>`../assets/characters/seonhwa/age-09/sprites/activities/houseclean-side-${n}.png`);
activityFrames.sleep=[...activityFrames.rest];
// v0.62.55: face-consistent awake sprites and a simple tea-only rest loop.
activityFrames.sweeping=[1,2,3].map(n=>`../assets/characters/seonhwa/activity-consistent/age-09/sweeping-legacy-${n}.png`);
activityFrames.errand=[1,2,3].map(n=>`../assets/characters/seonhwa/age-09/sprites/activities/errand-character-v4-${n}.png`);
activityFrames.herbs=[1,2,3].map(n=>`../assets/characters/seonhwa/activity-consistent/age-09/herbs-legacy-${n}.png`);
activityFrames.tea=[1,1,1].map(n=>`../assets/characters/seonhwa/activity-consistent/age-09/rest-legacy-${n}.png`);
['farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','ferryhelp','merchanthelp'].forEach(name=>{activityFrames[name]=[1,2,3].map(n=>`../assets/characters/seonhwa/job-actions/${name}-${n}.png`);});
// The modular errand frames crop the top of the hair in frame 1. Keep the complete v4 frames.
const modularActivities=new Set(['calligraphy','arithmetic','manners','houseclean','rest','sleep']);
function activityFrameSet(activity){
  if(!modularActivities.has(activity))return activityFrames[activity];
  const name=activity==='sleep'?'rest':activity,age=String(growthAssetAge(growthVisualAge())).padStart(2,'0');
  return [1,2,3].map(frame=>`../assets/characters/seonhwa/activity-consistent/age-${age}/${name}-${frame}.png`);
}
const npcFrames = Object.fromEntries(['teacher','dolsoe','herbalist','nanny'].map(name=>[name,[1,2,3].map(n=>`../assets/characters/npcs/activity/${name}-${n}.png`)]));
npcFrames.teacherReading=[1,2,3].map(n=>`../assets/characters/npcs/activity/teacher-reading-${n}.png`);
const foods = [
  {id:'bunsik',name:'분식 세트',detail:'떡볶이 · 튀김 · 순대',price:45,change:{stress:-8,healthiness:-1}},
  {id:'gimbap',name:'김밥',detail:'채소와 달걀을 넣은 한 줄',price:30,change:{stress:-4,healthiness:1}},
  {id:'bulgogi',name:'불고기',detail:'달큰하게 양념한 쇠고기',price:85,change:{stress:-7,healthiness:3}},
  {id:'bibimbap',name:'비빔밥',detail:'나물과 고명을 비빈 밥',price:65,change:{stress:-6,healthiness:4}},
  {id:'gukbap',name:'국밥',detail:'뜨끈한 장국과 밥',price:55,change:{stress:-5,healthiness:2}},
  {id:'japchae',name:'잡채',detail:'채소와 당면 볶음',price:70,change:{stress:-6,healthiness:2}},
  {id:'tteokguk',name:'떡국',detail:'맑은 장국의 가래떡',price:60,change:{stress:-5,healthiness:2}},
  {id:'samgyetang',name:'삼계탕',detail:'닭과 약재를 푹 고은 탕',price:110,change:{stress:-5,healthiness:6}},
  {id:'galbijjim',name:'갈비찜',detail:'부드럽게 익힌 갈비',price:120,change:{stress:-9,healthiness:3}},
  {id:'jeongol',name:'전골',detail:'채소와 고기를 끓인 전골',price:95,change:{stress:-7,healthiness:5}}
];
const generalGoods = [
  {id:'wooden-doll',name:'나무 인형',price:120,type:'accessory',detail:'마음을 달래 주는 작은 장난감',change:{sensitivity:4,stress:-12}},
  {id:'basic-book',name:'천자문 서책',price:120,type:'event',detail:'글공부의 기초가 되는 서책',change:{intelligence:8}},
  {id:'poetry-book',name:'시조 모음집',price:400,type:'event',detail:'고운 운율을 익히는 시집',change:{sensitivity:12,speech:3}},
  {id:'ceramic-cup',name:'백자 찻잔',price:500,type:'accessory',detail:'차를 마실 때 쓰는 단정한 백자',change:{dignity:10,manners:3}},
  {id:'herbal-pill',name:'회복 환약',price:80,type:'accessory',detail:'기운을 회복시키는 약방의 환약',change:{health:10,stress:-4}},
  {id:'guardian-bell',name:'신수 방울',price:1000,type:'accessory',detail:'수호령의 기운을 맑게 울리는 방울',change:{magic:12,mentality:8},wealth:1000},
  {id:'coral-norigae',name:'산호 노리개',price:1500,type:'accessory',detail:'귀한 산호로 엮은 장신구',change:{charm:14,dignity:8},wealth:3000},
  {id:'jade-hairpin',name:'백옥 비녀',price:2200,type:'accessory',detail:'맑은 빛을 품은 상단의 귀물',change:{charm:18,reputation:10,manners:5},wealth:5000},
  {id:'pine-inkstone',name:'송연 벼루',price:260,type:'event',detail:'먹을 곱게 갈 수 있는 단단한 벼루',change:{intelligence:5,sense:3}},
  {id:'weasel-brush',name:'황모 붓',price:240,type:'event',detail:'섬세한 획을 살리는 글붓',change:{intelligence:4,arts:4}},
  {id:'wooden-abacus',name:'나무 주판',price:220,type:'event',detail:'셈을 빠르게 익히는 작은 주판',change:{intelligence:3,sense:6}},
  {id:'brass-compass',name:'놋쇠 패철',price:680,type:'accessory',detail:'방향과 지세를 살피는 도구',change:{sense:8,mentality:3}},
  {id:'embroidery-kit',name:'자수 꾸러미',price:360,type:'event',detail:'색실과 바늘이 담긴 침선 꾸러미',change:{sense:6,arts:5}},
  {id:'silk-pouch',name:'비단 향낭',price:430,type:'accessory',detail:'은은한 향이 배어 있는 작은 주머니',change:{charm:6,manners:4}},
  {id:'flower-shoes',name:'꽃신',price:520,type:'accessory',detail:'발끝에 작은 꽃무늬를 수놓은 신',change:{charm:8,dignity:4}},
  {id:'bamboo-flute',name:'대금 모형',price:620,type:'event',detail:'호흡과 음감을 익히는 연습용 악기',change:{arts:8,sensitivity:5}},
  {id:'gayageum-strings',name:'가야금 명주실',price:480,type:'event',detail:'맑은 음색을 내는 여분의 현',change:{arts:7,sensitivity:4}},
  {id:'dance-fan',name:'춤 부채',price:390,type:'accessory',detail:'춤사위의 손끝을 돋보이게 하는 부채',change:{agility:4,arts:5,charm:3}},
  {id:'bronze-mirror',name:'청동 거울',price:760,type:'accessory',detail:'단정한 몸가짐을 비추는 손거울',change:{charm:7,manners:6}},
  {id:'boxwood-comb',name:'회양목 빗',price:310,type:'accessory',detail:'머릿결을 가지런히 다듬는 촘촘한 빗',change:{charm:5,dignity:3}},
  {id:'plum-perfume',name:'매화 향수',price:880,type:'accessory',detail:'매화 향을 담은 작은 향병',change:{charm:9,reputation:3}},
  {id:'rice-cake-box',name:'약과 상자',price:180,type:'event',detail:'달콤한 약과가 정갈하게 담긴 상자',change:{stress:-10,health:2}},
  {id:'herbal-tea',name:'쌍화차 재료',price:210,type:'event',detail:'기운을 돋우는 약재와 꿀 꾸러미',change:{health:6,stress:-5}},
  {id:'dried-jujube',name:'말린 대추',price:140,type:'event',detail:'달고 따뜻한 기운의 대추',change:{health:4,stress:-3}},
  {id:'honey-jar',name:'토종꿀 단지',price:340,type:'event',detail:'산에서 얻은 향긋한 꿀',change:{health:7,stress:-4}},
  {id:'ginseng-tonic',name:'인삼 보약',price:920,type:'event',detail:'체력을 돋우는 진한 보약',change:{health:14,strength:4},wealth:1000},
  {id:'clear-mind-tonic',name:'총명탕',price:980,type:'event',detail:'정신을 맑게 가다듬는 약',change:{intelligence:10,mentality:7},wealth:1000},
  {id:'calming-incense',name:'안식향',price:540,type:'accessory',detail:'복잡한 마음을 가라앉히는 향',change:{mentality:6,stress:-10}},
  {id:'wooden-beads',name:'염주',price:470,type:'accessory',detail:'마음을 다스리며 기도할 때 쓰는 염주',change:{virtue:7,mentality:5}},
  {id:'protective-charm',name:'수호 부적',price:650,type:'accessory',detail:'나쁜 기운을 막는다고 전해지는 부적',change:{magic:5,mentality:6}},
  {id:'mountain-map',name:'산천 지도',price:580,type:'event',detail:'비경과 나루가 표시된 손그림 지도',change:{sense:7,intelligence:3}},
  {id:'hemp-rope',name:'삼베 밧줄',price:200,type:'event',detail:'탐사와 짐 운반에 쓰는 튼튼한 밧줄',change:{strength:3,agility:3}},
  {id:'oil-lantern',name:'들기름 등잔',price:330,type:'event',detail:'어두운 길을 밝히는 휴대 등잔',change:{sense:4,mentality:3}},
  {id:'flint-kit',name:'부싯돌 꾸러미',price:190,type:'event',detail:'야외에서 불을 피우는 도구',change:{sense:4,health:2}},
  {id:'leather-gloves',name:'가죽 손등개',price:410,type:'accessory',detail:'거친 일을 할 때 손을 보호한다',change:{strength:4,health:4}},
  {id:'rain-cape',name:'도롱이',price:450,type:'accessory',detail:'비바람을 막아 주는 짚 겉옷',change:{health:5,mentality:2}},
  {id:'winter-muffler',name:'털 목도리',price:560,type:'accessory',detail:'겨울 한기를 막아 주는 따뜻한 목도리',change:{health:6,stress:-3}},
  {id:'summer-fan',name:'합죽선',price:370,type:'accessory',detail:'여름 더위를 식히는 고운 부채',change:{dignity:4,stress:-5}},
  {id:'copper-ring',name:'동제 가락지',price:420,type:'accessory',detail:'소박한 무늬가 새겨진 가락지',change:{charm:4,virtue:2}},
  {id:'silver-ring',name:'은가락지',price:980,type:'accessory',detail:'단아한 광택을 지닌 은 장신구',change:{charm:8,dignity:6},wealth:1000},
  {id:'jade-ring',name:'옥가락지',price:1680,type:'accessory',detail:'맑은 옥으로 깎은 귀한 가락지',change:{charm:12,dignity:10},wealth:3000},
  {id:'amber-pendant',name:'호박 패물',price:1420,type:'accessory',detail:'따뜻한 빛을 품은 호박 장식',change:{charm:10,mentality:8},wealth:3000},
  {id:'moonstone',name:'월광석',price:1880,type:'accessory',detail:'달빛 아래 희미하게 빛나는 돌',change:{magic:15,sensitivity:8},wealth:3000},
  {id:'dragon-scale-charm',name:'용린 문양패',price:2600,type:'accessory',detail:'용의 비늘무늬를 새긴 수호패',change:{magic:16,strength:8,reputation:5},wealth:5000},
  {id:'white-tiger-token',name:'백호 발톱패',price:2450,type:'accessory',detail:'용기를 북돋는 백호 문양 장식',change:{strength:14,agility:8},wealth:5000},
  {id:'phoenix-pin',name:'주작 깃 비녀',price:2750,type:'accessory',detail:'불꽃과 깃털을 본뜬 화려한 비녀',change:{charm:15,magic:12},wealth:5000},
  {id:'turtle-shell-token',name:'현무 귀갑패',price:2500,type:'accessory',detail:'인내와 보호를 상징하는 귀갑 문양패',change:{health:14,mentality:12},wealth:5000},
  {id:'merchant-ledger',name:'상단 장부',price:720,type:'event',detail:'거래와 계산법을 기록한 장부',change:{sense:9,speech:5}},
  {id:'recipe-book',name:'조리 비방서',price:680,type:'event',detail:'계절 음식의 손맛을 적은 조리서',change:{sense:8,health:4}},
  {id:'medical-compendium',name:'향약 집성초',price:1320,type:'event',detail:'약초와 치료법을 정리한 의서',change:{intelligence:11,sense:7},wealth:1000}
];
let visitShopStock=[];
let visitShopPurchaseMade=false;
let pendingVisitShop=false;
function prepareVisitShopStock(){
  if(!Array.isArray(game.purchasedGoods))game.purchasedGoods=[];
  const owned=new Set(game.purchasedGoods);
  const eligible=generalGoods.filter(item=>!owned.has(item.id)&&(!item.wealth||game.money>=item.wealth));
  for(let index=eligible.length-1;index>0;index--){
    const swapIndex=Math.floor(Math.random()*(index+1));
    [eligible[index],eligible[swapIndex]]=[eligible[swapIndex],eligible[index]];
  }
  visitShopStock=eligible.slice(0,10).map(item=>item.id);
  visitShopPurchaseMade=false;
}
function rollVisitingMerchant(){
  if(game.ended||generalGoods.every(item=>game.purchasedGoods?.includes(item.id)))return false;
  pendingVisitShop=Math.random()<.18;
  return pendingVisitShop;
}
function openVisitingMerchant(){
  if(!pendingVisitShop)return;
  pendingVisitShop=false;
  document.querySelector('#speakerName').textContent='떠돌이 잡화상';
  document.querySelector('#dialogueText').textContent='“마침 좋은 물건이 들어왔습니다. 오늘은 하나만 골라 보시지요.”';
  openPanel('shop');
}
const outfits = [
  {id:'age09-neat',age:9,ageEnd:12,name:'단정한 배움 한복',price:180,tone:'단정함',seasons:['가을','겨울'],situations:['reading','arithmetic','manners'],change:{manners:4,virtue:3,charm:1}},
  {id:'age09-flower',age:9,ageEnd:12,name:'연분홍 꽃 한복',price:230,tone:'화려함',seasons:['봄'],situations:['shopping','vacation'],change:{charm:5,reputation:2,stress:1}},
  {id:'age09-active',age:9,ageEnd:12,name:'마을 활동 한복',price:160,tone:'활동성',seasons:['여름'],situations:['errand','sweeping','herbs','houseclean'],change:{health:3,craft:3,charm:-1}},
  {id:'age13-scholar',age:13,ageEnd:15,name:'옥색 학문 한복',price:280,tone:'단정함',seasons:['가을','겨울'],situations:['reading','arithmetic'],change:{study:5,manners:3,charm:1}},
  {id:'age13-festival',age:13,ageEnd:15,name:'명절 색동 한복',price:340,tone:'화려함',seasons:['봄','겨울'],situations:['manners','shopping','vacation'],change:{charm:6,reputation:3,stress:2}},
  {id:'age13-work',age:13,ageEnd:15,name:'생활 작업 한복',price:240,tone:'활동성',seasons:['여름'],situations:['errand','sweeping','herbs','houseclean'],change:{craft:5,health:3,charm:-1}},
  {id:'age16-court',age:16,ageEnd:17,name:'격식 당의 한복',price:480,tone:'격식',seasons:['가을','겨울'],situations:['manners','shopping'],change:{manners:6,virtue:4,charm:3,stress:2}},
  {id:'age16-art',age:16,ageEnd:17,name:'자수 예술 한복',price:520,tone:'화려함',seasons:['봄'],situations:['reading','vacation','shopping'],change:{arts:5,charm:7,reputation:2,stress:2}},
  {id:'age16-travel',age:16,ageEnd:17,name:'여행 활동 한복',price:390,tone:'활동성',seasons:['여름'],situations:['errand','herbs','sweeping','houseclean'],change:{health:4,martial:3,charm:-1}},
  {id:'age18-ceremony',age:19,ageEnd:19,assetAge:18,name:'성년 예복 한복',price:720,tone:'격식',seasons:['가을','겨울'],situations:['manners','shopping'],change:{manners:8,virtue:5,reputation:5,stress:3}},
  {id:'age18-silk',age:19,ageEnd:19,assetAge:18,name:'비단 연회 한복',price:780,tone:'화려함',seasons:['봄','겨울'],situations:['shopping','vacation'],change:{charm:10,reputation:4,virtue:-1,stress:3}},
  {id:'age18-simple',age:19,ageEnd:19,assetAge:18,name:'담백한 생활 한복',price:560,tone:'활동성',seasons:['여름','가을'],situations:['errand','sweeping','herbs','houseclean','rest'],change:{craft:5,health:4,virtue:3,charm:-2}},
  {id:'age18-premium-paradise',age:19,ageEnd:19,assetAge:18,name:'소문의 낙원 한복',price:1200,tone:'화려함',seasons:['봄','겨울'],situations:['manners','shopping','vacation'],change:{charm:14,reputation:8,virtue:2,manners:4,stress:4}},
  {id:'age18-ethnic-stage-v3',age:9,ageEnd:19,assetAge:18,name:'월백 무대 의상',price:0,cashPrice:5000,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['shopping','vacation'],change:{charm:20,reputation:14,arts:9,virtue:-2,stress:3}},
  {id:'age18-cash-ember-ethnic',age:9,ageEnd:19,assetAge:18,name:'홍염 자수 무대복',price:0,cashPrice:5500,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['shopping','vacation'],change:{charm:21,reputation:13,arts:10,virtue:-2}},
  {id:'age18-cash-solar-ceremony',age:9,ageEnd:19,assetAge:18,name:'태양 백금 예복',price:0,cashPrice:6000,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['shopping','vacation'],change:{charm:18,reputation:18,manners:9,arts:6}},
  {id:'age18-cash-ink-scholar',age:9,ageEnd:19,assetAge:18,name:'묵학 비상 예복',price:0,cashPrice:6500,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['reading','shopping','vacation'],change:{study:12,arts:12,reputation:12,charm:10}},
  {id:'age18-cash-starlight-pink',age:9,ageEnd:19,assetAge:18,name:'별빛 유리 무대복',price:0,cashPrice:7000,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['shopping','vacation'],change:{charm:24,reputation:16,arts:13,stress:-2}},
  {id:'age18-cash-rose-paisley',age:9,ageEnd:19,assetAge:18,name:'장미 페이즐리 무대복',price:0,cashPrice:7500,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['shopping','vacation'],change:{charm:23,reputation:15,arts:12,virtue:-3}},
  {id:'premium-midnight-lotus',age:9,ageEnd:18,name:'묵빛 연화 예복',price:1650,tone:'고급',seasons:['가을','겨울'],situations:['manners','shopping','vacation'],change:{charm:15,reputation:10,manners:7,virtue:4}},
  {id:'premium-moonlight-guard',age:9,ageEnd:18,name:'월백 수호 예복',price:1780,tone:'고급',seasons:['봄','겨울'],situations:['manners','reading','shopping'],change:{manners:12,reputation:9,study:5,charm:8}},
  {id:'premium-aurora-blossom',age:9,ageEnd:18,name:'새벽꽃 비단 예복',price:1850,tone:'고급',seasons:['봄','여름'],situations:['vacation','shopping','manners'],change:{charm:18,reputation:10,arts:7,virtue:2}},
  {id:'premium-crimson-festival',age:9,ageEnd:18,name:'자주빛 연회 예복',price:1720,tone:'고급',seasons:['가을','겨울'],situations:['shopping','vacation','manners'],change:{charm:16,reputation:11,manners:6,stress:2}},
  {id:'premium-ink-scholar',age:9,ageEnd:18,name:'먹빛 서생 예복',price:1600,tone:'고급',seasons:['가을','겨울'],situations:['reading','arithmetic','manners'],change:{study:10,arts:8,reputation:7,charm:6}}
];
foods.forEach(item=>{item.change=canonicalizeChange(item.change);});
generalGoods.forEach(item=>{item.change=canonicalizeChange(item.change);});
outfits.forEach(item=>{item.change=canonicalizeChange(item.change);});
const outfitAgeLabel=outfit=>outfit.age===outfit.ageEnd?`${outfit.age}세`:`${outfit.age}–${outfit.ageEnd}세`;
const outfitAvailable=outfit=>game.age>=outfit.age&&game.age<=outfit.ageEnd;
const growthAge=()=>game.age>=19?19:game.age>=16?16:game.age>=13?13:9;
const growthVisualAge=()=>game.age>=18?19:game.age>=16?16:game.age>=13?13:9;
const growthAssetAge=(age=growthAge())=>age===19?18:age;
const correctedAdultOutfits=new Set(['age13-scholar','age13-festival','age13-work','age16-court','age16-art','age16-travel','age18-premium-paradise']);
const correctedOutfitVariants=new Map([['13:age13-scholar','age13-scholar-fixed-v2']]);
const outfitImageForAge=(id,visualAge=growthVisualAge())=>{
  const outfit=outfits.find(item=>item.id===id);
  if(!outfit)return '';
  const assetAge=outfit.category==='cash'?growthAssetAge(visualAge):outfit.assetAge||growthAssetAge(visualAge),corrected=correctedOutfitVariants.get(`${visualAge}:${id}`),suffix=visualAge===19&&correctedAdultOutfits.has(id)?'-v2':'';
  return `../assets/characters/seonhwa/wardrobe/age-${String(assetAge).padStart(2,'0')}/${corrected||`${id}${suffix}`}.png`;
};
const outfitImage=id=>outfitImageForAge(id,growthVisualAge());
function homeCondition(){
  if(game.homeReaction==='shocked')return 'shocked';
  if(game.dignity<25||game.nannyAffinity<25||game.stress>=75)return 'rebellious';
  if(game.stress>=50)return 'angry';
  if(game.mentality<35||game.health<25)return 'sad';
  if(game.stress<30)return 'happy';
  return 'normal';
}
function updateHomeCharacter(){
  const condition=homeCondition();
  document.querySelector('#characterSlot').dataset.condition=condition;
  character.alt=`${game.characterName||'아이'} · ${condition}`;
  character.src=game.equippedOutfit?outfitImage(game.equippedOutfit):homeConditionPoses[condition];
}
function applyEquippedOutfit(){updateHomeCharacter();}
const outfitSituation={reading:['scholar','neat'],arithmetic:['scholar','neat'],manners:['court','ceremony','festival','neat'],errand:['travel','work','active'],sweeping:['work','active','simple'],herbs:['travel','work','active'],houseclean:['work','active','simple'],rest:['simple','neat'],sleep:['simple','neat'],shopping:['festival','flower','silk']};
const seasonPreference={봄:['flower','festival','art'],여름:['active','work','travel','simple'],가을:['scholar','neat','court'],겨울:['ceremony','silk','court','festival']};
function recommendOutfit(actionId=null){
  normalizeInventory();const owned=game.items.filter(item=>item.type==='outfit'&&outfits.some(outfit=>outfit.id===item.id));if(!owned.length)return null;
  const situation=outfitSituation[actionId]||[],season=seasonPreference[game.season]||[];
  const score=item=>{const outfit=outfits.find(entry=>entry.id===item.id);let value=0;if(outfit.situations.includes(actionId))value+=45;if(outfit.seasons.includes(game.season))value+=30;situation.forEach((tag,index)=>{if(item.id.includes(tag))value+=12-index;});season.forEach((tag,index)=>{if(item.id.includes(tag))value+=7-index;});value-=Math.max(0,game.age-outfit.ageEnd)*2;return value;};
  return owned.sort((a,b)=>score(b)-score(a))[0]?.id||null;
}
function updateAutoOutfit(actionId=null){if(!game.autoOutfit)return game.equippedOutfit;game.equippedOutfit=recommendOutfit(actionId);applyEquippedOutfit();return game.equippedOutfit;}
const activityOutfitFrameCache=new Map();
const activityOutfitStyleCache=new Map();
function activityOutfitPalette(outfitId){
  if(!outfitId)return null;
  if(/cash-ember|rose-paisley/.test(outfitId))return {skirt:[96,25,47],top:[185,68,93]};
  if(/cash-solar/.test(outfitId))return {skirt:[238,224,194],top:[203,163,62]};
  if(/cash-ink|ethnic-stage/.test(outfitId))return {skirt:[38,35,48],top:[91,70,109]};
  if(/cash-starlight/.test(outfitId))return {skirt:[213,155,195],top:[239,202,217]};
  if(/premium-midnight|premium-crimson|premium-ink/.test(outfitId))return {skirt:[35,31,38],top:[111,40,57]};
  if(/premium-moonlight/.test(outfitId))return {skirt:[239,228,199],top:[205,164,72]};
  if(/premium-aurora/.test(outfitId))return {skirt:[226,170,194],top:[244,222,227]};
  if(/active|work|travel|simple/.test(outfitId))return {skirt:[54,126,125],top:[220,172,74]};
  if(/flower|festival|art|silk/.test(outfitId))return {skirt:[211,96,120],top:[236,190,195]};
  if(/court|ceremony/.test(outfitId))return {skirt:[59,79,126],top:[218,187,112]};
  return {skirt:[143,171,145],top:null};
}
function sampleOutfitColor(data,width,height,startY,endY,fallback){
  const colors=[];
  for(let y=Math.floor(height*startY);y<Math.floor(height*endY);y+=Math.max(1,Math.floor(height/80)))for(let x=Math.floor(width*.18);x<Math.floor(width*.82);x+=Math.max(1,Math.floor(width/60))){
    const i=(y*width+x)*4,r=data[i],g=data[i+1],b=data[i+2],a=data[i+3],max=Math.max(r,g,b),min=Math.min(r,g,b);
    if(a<120||max>244||max<28||max-min<16||(r>145&&g>95&&b>75&&r>g&&g>b))continue;
    colors.push([r,g,b,max-min]);
  }
  if(!colors.length)return fallback;
  colors.sort((a,b)=>b[3]-a[3]);const chosen=colors.slice(0,Math.max(8,Math.floor(colors.length*.45)));
  return [0,1,2].map(channel=>Math.round(chosen.reduce((sum,color)=>sum+color[channel],0)/chosen.length));
}
function resolveActivityOutfitStyle(outfitId){
  if(!outfitId)return Promise.resolve(null);
  const age=growthVisualAge(),key=`${age}|${outfitId}`;
  if(activityOutfitStyleCache.has(key))return Promise.resolve(activityOutfitStyleCache.get(key));
  const fallback=activityOutfitPalette(outfitId);
  return new Promise(resolve=>{const outfitSource=new Image();outfitSource.onload=()=>{try{
    const canvas=document.createElement('canvas');canvas.width=outfitSource.naturalWidth;canvas.height=outfitSource.naturalHeight;
    const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(outfitSource,0,0);
    const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
    const style={top:sampleOutfitColor(pixels,canvas.width,canvas.height,.16,.48,fallback?.top||[220,205,178]),skirt:sampleOutfitColor(pixels,canvas.width,canvas.height,.48,.92,fallback?.skirt||[143,171,145])};
    activityOutfitStyleCache.set(key,style);resolve(style);
  }catch{resolve(fallback);}};outfitSource.onerror=()=>resolve(fallback);outfitSource.src=outfitImageForAge(outfitId,age);});
}
async function outfitActivityFrame(src,outfitId){
  // 누운 휴식 프레임은 이불까지 합쳐진 전용 원화이므로 의상 색상 치환을 하지 않는다.
  if(/\/(rest|sleep)-/.test(src))return src;
  const palette=await resolveActivityOutfitStyle(outfitId);if(!palette)return src;
  const key=`${growthVisualAge()}|${outfitId}|${src}`;if(activityOutfitFrameCache.has(key))return activityOutfitFrameCache.get(key);
  return new Promise(resolve=>{const source=new Image();source.onload=()=>{try{const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(source,0,0);const frame=context.getImageData(0,0,canvas.width,canvas.height),data=frame.data,isRest=/\/(rest|sleep)-/.test(src);
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4;if(data[i+3]<24)continue;const r=data[i],g=data[i+1],b=data[i+2];
      const pink=!isRest&&r>155&&g>42&&g<155&&b>52&&b<180&&r>g*1.32&&r>b*1.12;
      const central=x>canvas.width*.16&&x<canvas.width*.84&&y>canvas.height*.2&&y<canvas.height*.76;
      const skin=r>170&&g>92&&b>64&&r>g*1.07&&g>b*1.06;
      const ivory=central&&!skin&&r>188&&g>165&&b>130&&r-b<62&&r-g<45;
      const fallback=pink?palette.skirt:(ivory&&palette.top?palette.top:null);if(!fallback)continue;
      const light=Math.max(.62,Math.min(1.28,(r+g+b)/3/170));data[i]=Math.min(255,fallback[0]*light);data[i+1]=Math.min(255,fallback[1]*light);data[i+2]=Math.min(255,fallback[2]*light);
    }
    context.putImageData(frame,0,0);const result=canvas.toDataURL('image/png');activityOutfitFrameCache.set(key,result);resolve(result);}catch{resolve(src);}};source.onerror=()=>resolve(src);source.src=src;});
}
async function animateActivitySprite(image,motion,activity,npcImage,npc,outfitId,masteryRank=0){
  if(activity){
    const frames=activityFrameSet(activity);
    const sequence=activity==='errand'?[0,1,1,2,2,1,0]:activity==='houseclean'?[0,1,0,2,2,2]:activity==='sweeping'?[0,1,2,1,0,1,2,2,1,0,1,2,1,0]:activity==='sleep'?[0,1,2,1,0]:[0,1,2,1,0,1,2];
    const delay=Math.max(125,(activity==='errand'?270:activity==='houseclean'?360:activity==='sleep'?430:activity==='tea'?460:190)-masteryRank*35);
    const rankedSequence=masteryRank===2?[...sequence,...sequence.slice(1)]:sequence;
    for(const [step,frame] of rankedSequence.entries()){
      if(activity==='houseclean')image.parentElement.style.left=`${[74,58,32,32,55,74][step%6]}%`;
      if(activity==='sweeping')image.parentElement.style.left=`${[14,20,27,34,41,47,50,50,47,41,34,27,20,14][step%14]}%`;
      image.src=await outfitActivityFrame(frames[frame],outfitId);if(npc)npcImage.src=(npc==='teacher'?npcFrames.teacherReading:npcFrames[npc])[frame%3];await new Promise(resolve=>setTimeout(resolve,delay));
    }
    if(activity==='houseclean'||activity==='sweeping')image.parentElement.style.left='';
    return;
  }
  const direction=motion==='motion-walk'?'right':'down';
  const sequence=motion==='motion-walk'?[0,1,2,1,0,1,2,1]:[1,0,1,2,1,0,1];
  for(const frame of sequence){image.src=spriteFrames[direction][frame];await new Promise(resolve=>setTimeout(resolve,motion==='motion-walk'?135:170));}
}
function conditionEvent(stress, dayIndex){
  if(stress>=80||(stress>=70&&dayIndex%2===1))return 'mistake';
  if(stress>=55)return 'drowsy';
  return null;
}
const activitySkill={reading:'intelligence',arithmetic:'sense',manners:'manners',painting:'sensitivity',music:'sensitivity',dance:'agility',swordsmanship:'strength',spellcraft:'magic',cooking:'sense',martial:'strength',classics:'intelligence',errand:'speech',sweeping:'strength',herbs:'sense',houseclean:'sense',farmwork:'strength',childcare:'sensitivity',kitchenhelp:'sense',woodwork:'strength',loomwork:'sense',masonry:'strength',clinichelp:'intelligence',innhelp:'speech',sewing:'sense',copying:'intelligence',ferryhelp:'health',merchanthelp:'speech',accounting:'sense',tutoring:'intelligence',dungeon:'strength',rest:'mentality'};
const outcomeLabels={perfect:'완벽',success:'성공',struggle:'힘겨움',mistake:'실수'};
function activityOutcomeThresholds(action,stress){
  const skill=game[activitySkill[action.id]]||0;
  const mastery=activityProgressFor(action.id).attempts;
  const healthRatio=clampStat('health',game.health)/statMaximum('health');
  const healthBonus=healthRatio*24;
  const condition=(game.mentality||50)*.07-stress*.42;
  const success=Math.max(18,Math.min(94,44+skill*.09+Math.min(12,mastery*.28)+condition+healthBonus));
  const perfect=Math.max(6,success-(34-healthRatio*8));
  const struggle=Math.min(98,success+(22-healthRatio*10));
  return {perfect,success,struggle};
}
function judgeActivityOutcome(action,stress){
  if(['shopping','vacation'].includes(action.id))return 'success';
  if(action.id==='rest')return stress<35&&Math.random()<.35?'perfect':'success';
  const chance=activityOutcomeThresholds(action,stress);
  const roll=Math.random()*100;
  if(roll<=chance.perfect)return 'perfect';
  if(roll<=chance.success)return 'success';
  if(roll<=chance.struggle)return 'struggle';
  return 'mistake';
}
function resolvedActivityChange(action,outcome){
  if(['rest','vacation'].includes(action.id)&&['struggle','mistake'].includes(outcome))outcome='success';
  const change={};
  Object.entries(action.change).forEach(([key,value])=>{
    const beneficial=key==='stress'?value<0:value>0;
    const multiplier=beneficial?(outcome==='perfect'?1.5:outcome==='struggle'?.5:outcome==='mistake'?.25:1):1;
    change[key]=Math.round(value*multiplier);
  });
  if(outcome==='mistake'){
    change.stress=(change.stress||0)+2;
    change.health=(change.health||0)-1;
  }
  if(action.id==='rest'){
    change.stress=Math.min(0,change.stress||0);
  }
  return change;
}
const scheduleDialogue={
  reading:{perfect:['오늘 글자는 한 획도 흐트러지지 않았어요.','완벽하게 글공부를 마쳤어요.'],normal:['글의 뜻을 하나씩 알아가는 게 즐거워요.','오늘 배운 글자를 다시 써 볼래요.']},
  arithmetic:{perfect:['주판알 소리가 아주 반듯하구나.','셈을 한 번도 틀리지 않았어요.'],normal:['주판알을 튕기니 답이 보여요.','조금 천천히 세면 틀리지 않을 거예요.']},
  manners:{perfect:['몸가짐이 한결 단정해졌구나.','오늘 인사는 아주 다소곳했어요.'],normal:['치맛자락을 가지런히 잡아 보았어요.','바른 인사를 잊지 않을게요.']},
  dance:{perfect:['장단과 춤사위가 물 흐르듯 이어졌어요.'],normal:['발디딤과 손끝을 차분히 맞춰 보았어요.']},
  swordsmanship:{perfect:['검끝과 발디딤이 한 치도 흐트러지지 않았어요.'],normal:['기본 자세를 지키며 베기와 막기를 연습했어요.']},
  spellcraft:{perfect:['신수의 기운과 주문이 맑게 맞물렸어요.'],normal:['호흡을 가다듬고 작은 빛의 술법을 익혔어요.']},
  cooking:{perfect:['간과 불 조절이 꼭 알맞았어요.'],normal:['제철 재료를 다듬어 한 상을 차려 보았어요.']},
  errand:{perfect:['부탁받은 물건을 빠짐없이 사 왔어요.'],normal:['사람이 많아서 장바구니를 꼭 잡았어요.','진열대를 살펴보며 좋은 물건을 골랐어요.']},
  sweeping:{perfect:['마당에 티끌 하나 남지 않았어요.'],normal:['마당을 쓸고 나니 마음도 개운해요.']},
  herbs:{perfect:['좋은 약초만 골라 바구니를 채웠어요.'],normal:['뿌리가 다치지 않도록 조심히 뽑았어요.']},
  houseclean:{perfect:['방 안이 반짝반짝해졌어요.'],normal:['가구 밑까지 깨끗하게 닦았어요.']},
  farmwork:{perfect:['먹이와 밭일을 순서대로 완벽히 마쳤어요.'],normal:['가축에게 먹이를 주고 밭고랑을 고르게 다듬었어요.']},
  childcare:{perfect:['아이가 하루 종일 환하게 웃었어요.'],normal:['장난감으로 놀아 주고 다치지 않도록 살폈어요.']},
  kitchenhelp:{perfect:['재료 손질과 그릇 나르기를 막힘없이 해냈어요.'],normal:['채소를 다듬고 빈 그릇을 차곡차곡 옮겼어요.']},
  woodwork:{perfect:['연장과 목재를 쓰임새대로 완벽히 정리했어요.'],normal:['나무 결을 살피며 연장을 안전하게 정리했어요.']},
  loomwork:{perfect:['베틀의 북이 고른 장단으로 오갔어요.'],normal:['실이 엉키지 않도록 베틀을 천천히 움직였어요.']},
  masonry:{perfect:['흙과 기와를 제때 건네 일이 빠르게 끝났어요.'],normal:['흙을 나르고 기와를 한 장씩 조심히 전달했어요.']},
  clinichelp:{perfect:['약재를 정확히 나누고 탕약의 불도 잘 맞췄어요.'],normal:['약재를 분류하고 약탕기의 불을 살폈어요.']},
  ferryhelp:{perfect:['짐표와 꾸러미가 하나도 어긋나지 않았어요.'],normal:['짐표를 확인하고 나룻배까지 꾸러미를 옮겼어요.']},
  merchanthelp:{perfect:['손님마다 알맞은 물건을 건네고 셈도 정확했어요.'],normal:['상품을 건네고 주판으로 값을 차분히 계산했어요.']},
  tutoring:{perfect:['어린 학동이 어려운 대목을 모두 이해했어요.'],normal:['학동의 눈높이에 맞춰 글과 셈을 가르쳤어요.']},
  dungeon:{perfect:['비경 깊은 곳에서 귀한 보물을 찾았어요.'],normal:['낯선 길을 살피며 무사히 탐사를 마쳤어요.']},
  rest:{perfect:['푹 쉬었더니 몸이 가벼워졌어요.'],normal:['조용히 쉬면서 기운을 되찾았어요.']},
  vacation:{perfect:['아름다운 풍경을 오래 기억하고 싶어요.'],normal:['새로운 곳에 오니 마음이 편안해졌어요.']}
};
function pickLine(lines,index){return lines[index%lines.length];}
function objectParticle(word){const last=word.charCodeAt(word.length-1);return last>=0xAC00&&last<=0xD7A3&&(last-0xAC00)%28?'을':'를';}
function setScheduleDialogue(action,state,index){
  const education=action.category==='교육';
  const rankName=activityRankNames[activityRank(action.id)];
  let speaker=game.characterName||'아이',line='오늘도 차근차근 해볼게요.';
  if(state==='start'){
    if(game.stress>=55)line='오늘은 컨디션이 좋지 않아요.';
    else line=dedicatedJobIds.has(action.id)?`${rankName}답게 ${action.name}${objectParticle(action.name)} 차근차근 해볼게요.`:`오늘은 ${action.name}${objectParticle(action.name)} 열심히 해볼게요.`;
  }else if(state==='drowsy'){
    speaker=education?'훈장님':(game.guardianName||guardianDefs[game.guardianType]?.name||'수호신수');
    line=education?'수업 중에 졸면 배운 것을 놓치게 된다. 정신을 차리거라.':'많이 피곤해 보이는구나. 잠시 숨을 고르렴.';
  }else if(state==='mistake'){
    speaker=education?'훈장님':(game.guardianName||guardianDefs[game.guardianType]?.name||'수호신수');
    line=education?'졸다가 실수하다니, 오늘 배운 대목을 다시 익히거라.':'괜찮단다. 서두르지 말고 다시 해 보자.';
  }else if(state==='struggle'){
    line=game.stress>=55?'마음이 무거워 평소만큼 해내지는 못했어요.':'조금 어려웠지만 끝까지 포기하지 않았어요.';
  }else{
    line=pickLine(scheduleDialogue[action.id]?.[state==='perfect'?'perfect':'normal']||['오늘 일정을 무사히 마쳤어요.'],index);
    if(dedicatedJobIds.has(action.id)){
      const rankLead=rankName==='달인'?'달인의 솜씨로 막힘없이 해냈어요.':rankName==='숙련'?'이제 손에 익어 훨씬 능숙해졌어요.':'아직 서툴지만 하나씩 제대로 배웠어요.';
      line=`${rankLead} ${line}`;
    }
  }
  document.querySelector('#speakerName').textContent=speaker;
  document.querySelector('#dialogueText').textContent=line;
  document.querySelector('.dialogue').classList.add('schedule-speaking');
}
async function animateConditionEvent(stageCharacter,cue,type){
  cue.hidden=false;
  cue.textContent=type==='mistake'?'아차!':'꾸벅… Zzz';
  stageCharacter.classList.add(type==='mistake'?'condition-mistake':'condition-drowsy');
  await new Promise(resolve=>setTimeout(resolve,type==='mistake'?650:1250));
  stageCharacter.classList.remove('condition-mistake','condition-drowsy');
  cue.hidden=true;
}
const actions = [
  { id: 'reading', category: '교육', name: '글읽기', cost: 80, unlockAge:9, mentor:'훈장님', icon:'reading', summary: '지능 +5 · 정신력 +1 · 스트레스 +3', change: { intelligence:5, mentality:1, stress:3 } },
  { id: 'arithmetic', category: '교육', name: '셈하기', cost: 70, unlockAge:9, mentor:'훈장님', icon:'arithmetic', summary: '지능 +4 · 센스 +2 · 스트레스 +2', change: { intelligence:4, sense:2, stress:2 } },
  { id: 'manners', category: '교육', name: '예절 배우기', cost: 90, unlockAge:9, mentor:'예절 선생', icon:'manners', summary: '예절 +5 · 기품 +2 · 스트레스 +2', change: { manners:5, dignity:2, stress:2 } },
  { id: 'painting', category: '교육', name: '회화 배우기', cost: 130, unlockAge:13, mentor:'화공 스승', icon:'reading', intro:'붓끝으로 보이는 것 너머의 빛까지 담아 보거라.', summary:'감수성 +4 · 센스 +2 · 스트레스 +3', change:{sensitivity:4,sense:2,stress:3} },
  { id: 'music', category: '교육', name: '악기 배우기', cost: 140, unlockAge:13, mentor:'악기 선생', icon:'manners', intro:'소리를 서두르지 말고 먼저 네 호흡을 들어 보렴.', summary:'감수성 +3 · 기품 +2 · 스트레스 +3', change:{sensitivity:3,dignity:2,stress:3} },
  { id: 'dance', category: '교육', name: '전통 춤사위', cost: 145, unlockAge:13, mentor:'춤 선생', icon:'manners', intro:'장단을 먼저 마음에 담고, 발디딤과 손끝을 이어 보렴.', summary:'민첩 +3 · 기품 +3 · 매력 +2 · 스트레스 +3', change:{agility:3,dignity:3,charm:2,stress:3} },
  { id:'swordsmanship',category:'교육',name:'검술 수련',cost:165,unlockAge:13,unlockStats:{strength:35},mentor:'검술 사범',icon:'sweeping',intro:'칼을 휘두르기 전에 발과 호흡부터 바로 세워라.',summary:'힘 +4 · 민첩 +3 · 체력 +2 · 스트레스 +4',change:{strength:4,agility:3,health:2,stress:4}},
  { id:'spellcraft',category:'교육',name:'술법 수련',cost:175,unlockAge:13,unlockStats:{intelligence:45,mentality:35},mentor:'수호신수',icon:'herbs',intro:'기운을 억지로 잡지 말고 숨결을 따라 흐르게 하렴.',summary:'마력 +5 · 지능 +2 · 정신력 +3 · 스트레스 +4',change:{magic:5,intelligence:2,mentality:3,stress:4}},
  { id: 'cooking', category: '교육', name: '향토 음식 익히기', cost: 120, unlockAge:13, mentor:'찬모', icon:'arithmetic', intro:'제철 재료의 맛을 살리고 불과 간을 세심히 다루어야 한단다.', summary:'센스 +4 · 체력 +1 · 감수성 +2 · 스트레스 +3', change:{sense:4,health:1,sensitivity:2,stress:3} },
  { id: 'martial', category: '교육', name: '무예 수련', cost: 150, unlockAge:13, mentor:'무예 사범', icon:'sweeping', intro:'힘만 앞세우지 말고 발과 마음을 함께 다스려라.', summary:'힘 +4 · 민첩 +3 · 스트레스 +4', change:{strength:4,agility:3,stress:4} },
  { id: 'classics', category: '교육', name: '경전 심화', cost: 190, unlockAge:16, mentor:'경학 스승', icon:'reading', intro:'이제 글자를 읽는 데서 그치지 말고 뜻을 논해 보자꾸나.', summary:'지능 +6 · 기품 +2 · 스트레스 +4', change:{intelligence:6,dignity:2,stress:4} },
  { id: 'errand', category: '아르바이트', name: '장터 심부름', cost: -90, unlockAge:9, mentor:'장터 상인', icon:'errand', summary: '민첩 +3 · 화술 +2 · 스트레스 +4 · 90냥 획득', change: { agility:3, speech:2, stress:4 } },
  { id: 'sweeping', category: '아르바이트', name: '마당 쓸기', cost: -70, unlockAge:9, mentor:'돌쇠', icon:'sweeping', summary: '힘 +3 · 체력 +2 · 스트레스 +3 · 70냥 획득', change: { strength:3, health:2, stress:3 } },
  { id: 'herbs', category: '아르바이트', name: '약초 줍기', cost: -80, unlockAge:9, mentor:'약초꾼', icon:'herbs', summary: '센스 +2 · 지능 +1 · 체력 +1 · 스트레스 +4 · 80냥 획득', change: { sense:2, intelligence:1, health:1, stress:4 } },
  { id: 'houseclean', category: '아르바이트', name: '집 청소', cost: -60, unlockAge:9, mentor:'신수', icon:'houseclean', summary: '힘 +2 · 센스 +2 · 체력 +1 · 스트레스 +3 · 60냥 획득', change: { strength:2, sense:2, health:1, stress:3 } },
  { id:'farmwork',category:'아르바이트',name:'농가 일손 돕기',cost:-100,unlockAge:10,mentor:'농가 어른',icon:'herbs',summary:'체력 +3 · 힘 +3 · 기품 -1 · 스트레스 +4 · 100냥 획득',change:{health:3,strength:3,dignity:-1,stress:4}},
  { id:'childcare',category:'아르바이트',name:'아이 돌보기',cost:-85,unlockAge:10,mentor:'마을 어른',icon:'houseclean',summary:'감수성 +3 · 도덕 +2 · 스트레스 +4 · 85냥 획득',change:{sensitivity:3,virtue:2,stress:4}},
  { id:'kitchenhelp',category:'아르바이트',name:'주방 보조',cost:-115,unlockAge:10,mentor:'찬모',icon:'arithmetic',summary:'센스 +3 · 체력 +2 · 스트레스 +4 · 115냥 획득',change:{sense:3,health:2,stress:4}},
  { id:'woodwork',category:'아르바이트',name:'목공소 심부름',cost:-135,unlockAge:11,mentor:'목수',icon:'sweeping',summary:'힘 +4 · 센스 +2 · 스트레스 +5 · 135냥 획득',change:{strength:4,sense:2,stress:5}},
  { id:'loomwork',category:'아르바이트',name:'베틀방 돕기',cost:-140,unlockAge:11,mentor:'직조 장인',icon:'houseclean',summary:'센스 +4 · 감수성 +2 · 스트레스 +4 · 140냥 획득',change:{sense:4,sensitivity:2,stress:4}},
  { id:'masonry',category:'아르바이트',name:'기와·흙벽 보조',cost:-165,unlockAge:12,mentor:'와공',icon:'sweeping',summary:'체력 +4 · 힘 +4 · 기품 -2 · 스트레스 +5 · 165냥 획득',change:{health:4,strength:4,dignity:-2,stress:5}},
  { id:'clinichelp',category:'아르바이트',name:'약방 견습',cost:-170,unlockAge:12,unlockStats:{intelligence:70,sense:45},mentor:'의원',icon:'herbs',summary:'지능 +3 · 센스 +3 · 도덕 +1 · 스트레스 +4 · 170냥 획득',change:{intelligence:3,sense:3,virtue:1,stress:4}},
  { id: 'innhelp', category:'아르바이트', name:'주막 돕기', cost:-110, unlockAge:13, mentor:'주모', icon:'errand', intro:'손님상은 빠르게, 말씨는 상냥하게 부탁하마.', summary:'화술 +3 · 체력 +2 · 스트레스 +4 · 110냥 획득', change:{speech:3,health:2,stress:4} },
  { id: 'sewing', category:'아르바이트', name:'바느질 돕기', cost:-120, unlockAge:13, mentor:'침선장', icon:'houseclean', intro:'작은 바늘땀 하나가 옷의 맵시를 정하는 법이란다.', summary:'센스 +4 · 감수성 +1 · 스트레스 +3 · 120냥 획득', change:{sense:4,sensitivity:1,stress:3} },
  { id: 'copying', category:'아르바이트', name:'서책 필사', cost:-130, unlockAge:13, mentor:'서책방 주인', icon:'reading', intro:'또박또박 옮겨 적되 원문의 한 자도 빠뜨리지 말거라.', summary:'지능 +3 · 센스 +2 · 스트레스 +4 · 130냥 획득', change:{intelligence:3,sense:2,stress:4} },
  { id:'ferryhelp',category:'아르바이트',name:'나루터 짐 정리',cost:-190,unlockAge:14,mentor:'나루지기',icon:'errand',summary:'체력 +3 · 화술 +3 · 민첩 +2 · 스트레스 +5 · 190냥 획득',change:{health:3,speech:3,agility:2,stress:5}},
  { id:'merchanthelp',category:'아르바이트',name:'상점 판매 보조',cost:-205,unlockAge:14,unlockStats:{speech:55,sense:60},mentor:'잡화상',icon:'errand',summary:'화술 +4 · 센스 +3 · 평판 +1 · 스트레스 +5 · 205냥 획득',change:{speech:4,sense:3,reputation:1,stress:5}},
  { id: 'accounting', category:'아르바이트', name:'상단 장부 정리', cost:-180, unlockAge:16, mentor:'상단 행수', icon:'arithmetic', intro:'숫자 하나가 상단의 신뢰를 좌우하니 꼼꼼히 살펴보거라.', summary:'센스 +4 · 화술 +2 · 스트레스 +4 · 180냥 획득', change:{sense:4,speech:2,stress:4} },
  { id: 'tutoring', category:'아르바이트', name:'학동 가르치기', cost:-230, unlockAge:16, unlockStats:{intelligence:140,manners:80,speech:60}, mentor:'서당 훈장', icon:'reading', intro:'배운 바가 충분하니 이제 어린 학동에게 글과 셈, 예절을 일러 주거라.', summary:'지능 +2 · 화술 +4 · 기품 +2 · 스트레스 +5 · 230냥 획득', change:{intelligence:2,speech:4,dignity:2,stress:5} },
  { id: 'rest', category: '휴식', name: '집에서 휴식', cost: 0, summary: '스트레스 -12 · 체력 +2 · 정신력 +2', change: { health:2, mentality:2, stress:-12 } },
  { id: 'shopping', category: '휴식', name: '저잣거리', cost: 0, summary: '', change: {}, special:'market' },
  { id: 'vacation', category: '휴식', name: '바캉스', cost: 180, summary: '감수성 +3 · 매력 +1 · 스트레스 -25 · 추억 일러스트 획득', change: {sensitivity:3,charm:1,stress:-25}, special:'vacation' },
  { id: 'dungeon', category: '휴식', name: '비경 탐사', cost: 50, unlockAge:13, mentor:'수호신수', icon:'herbs', intro:'성 밖의 숨은 길에는 보물과 위험이 함께 있단다. 준비를 갖추고 나서자.', summary:'체력 +2 · 힘 +2 · 마력 +2 · 스트레스 +5 · 보물 은전 획득 가능', change:{health:2,strength:2,magic:2,stress:5}, special:'dungeon' }
];
const activityRequirements={reading:['지능',20],arithmetic:['센스',15],manners:['예절',15],painting:['감수성',80],music:['기품',70],dance:['민첩',75],swordsmanship:['힘',35],spellcraft:['마력',20],cooking:['센스',70],martial:['체력',80],classics:['지능',180],errand:['화술',12],sweeping:['힘',15],herbs:['센스',18],houseclean:['체력',20],farmwork:['힘',25],childcare:['감수성',30],kitchenhelp:['센스',30],woodwork:['힘',40],loomwork:['센스',45],masonry:['체력',45],clinichelp:['지능',70],innhelp:['화술',70],sewing:['센스',75],copying:['지능',85],ferryhelp:['체력',55],merchanthelp:['화술',55],accounting:['센스',170],tutoring:['지능',140],dungeon:['힘',80]};
const actionUnlocked=action=>game.age>=Number(action.unlockAge||9)&&Object.entries(action.unlockStats||{}).every(([stat,value])=>Number(game[stat]||0)>=value);
const newlyUnlockedActions=(previousAge,nextAge)=>actions.filter(action=>Number(action.unlockAge||9)>previousAge&&Number(action.unlockAge||9)<=nextAge&&Object.entries(action.unlockStats||{}).every(([stat,value])=>Number(game[stat]||0)>=value));
const activityRankNames=['견습','숙련','달인'];
const dedicatedJobIds=new Set(['farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','ferryhelp','merchanthelp']);
const jobRewardNames={farmwork:'튼튼한 곡식 자루',childcare:'아이의 종이꽃',kitchenhelp:'찬모의 조리 수첩',woodwork:'목수의 작은 자',loomwork:'명주실 타래',masonry:'와공의 기와패',clinichelp:'약방의 향약 꾸러미',ferryhelp:'나루터 통행패',merchanthelp:'상인의 행운 엽전'};
function normalizeActivityProgress(){
  if(!game.activityProgress||typeof game.activityProgress!=='object')game.activityProgress={};
  actions.forEach(action=>{const current=game.activityProgress[action.id]||{};game.activityProgress[action.id]={attempts:Math.max(0,Number(current.attempts)||0),successes:Math.max(0,Number(current.successes)||0),streak:Math.max(0,Number(current.streak)||0),perfectStreak:Math.max(0,Number(current.perfectStreak)||0),bestStreak:Math.max(0,Number(current.bestStreak)||0)};});
}
function activityProgressFor(id){normalizeActivityProgress();return game.activityProgress[id];}
function activityRank(id){const successes=activityProgressFor(id).successes;return successes>=30?2:successes>=10?1:0;}
function activityPay(action){if(action.category!=='아르바이트')return -action.cost;return Math.round((-action.cost)*[1,1.25,1.6][activityRank(action.id)]);}
function recordActivityProgress(action,outcome){
  if(!['교육','아르바이트'].includes(action.category))return {bonusPay:0,reward:null};
  const progress=activityProgressFor(action.id),succeeded=outcome!=='mistake';progress.attempts+=1;
  if(succeeded){progress.successes+=1;progress.streak+=1;progress.bestStreak=Math.max(progress.bestStreak,progress.streak);}else progress.streak=0;
  progress.perfectStreak=outcome==='perfect'?progress.perfectStreak+1:0;
  if(action.category!=='아르바이트'||progress.perfectStreak===0||progress.perfectStreak%3!==0)return {bonusPay:0,reward:null};
  const rewardName=jobRewardNames[action.id];
  if(rewardName&&Math.random()<.4){
    normalizeInventory();const rewardId=`job-reward-${action.id}`;
    if(!game.items.some(item=>item.id===rewardId)){const reward={id:rewardId,type:'event',name:rewardName,description:`${action.name} 연속 대성공으로 받은 기념품`,qty:1};game.items.push(reward);return {bonusPay:0,reward};}
  }
  return {bonusPay:Math.round(activityPay(action)*.5),reward:null};
}
function actionForStressLimit(action,stress){
  return stress>=statMaximum('stress')&&action.id!=='rest'?actions.find(item=>item.id==='rest'):action;
}

function awardVacationIllustration(){
  normalizeInventory();
  const owned=new Set(game.items.filter(item=>item.type==='event').map(item=>item.id));
  const currentAge=growthAge();
  const special=vacationIllustrations.filter(item=>item.rarity==='special'&&(item.age||9)===currentAge&&item.season===game.season&&!owned.has(item.id));
  if(special.length&&Math.random()<.08){
    const prize=special[Math.floor(Math.random()*special.length)];
    game.items.push({...prize,type:'event',qty:1});
    return prize;
  }
  const seasonal=vacationIllustrations.filter(item=>item.rarity!=='special'&&(item.age||9)===currentAge&&item.season===game.season);
  const fallback=vacationIllustrations.filter(item=>item.rarity!=='special'&&(item.age||9)===9&&item.season===game.season);
  const ageSeasonal=seasonal.length?seasonal:fallback;
  const undiscovered=ageSeasonal.filter(item=>!owned.has(item.id));
  const pool=undiscovered.length?undiscovered:ageSeasonal;
  const prize=pool[Math.floor(Math.random()*pool.length)]||vacationIllustrations[0];
  if(!owned.has(prize.id))game.items.push({...prize,type:'event',qty:1});
  return prize;
}
const endingRelationCandidates=[
  {id:'doyun',name:'도윤',role:'젊은 무관',image:'../assets/characters/romance/doyun/vacation.png',assetReady:true,minAge:13,ending:'무관의 아내',dialogues:['“활쏘기보다 고요한 풍경을 바라보는 일이 더 어렵군.”','“혼자 걷는 길인 줄 알았는데, 동행이 생겼군.”']},
  {id:'seojin',name:'서진',role:'선비',image:'../assets/characters/romance/seojin/vacation.png',assetReady:true,minAge:13,ending:'선비와의 삶',dialogues:['“책에서 읽던 풍경보다 직접 보는 모습이 더 아름답군요.”','“이 경치를 시로 남긴다면 어떤 첫 구절이 좋을까요?”']},
  {id:'yeonwoo',name:'연우',role:'화공',image:'../assets/characters/romance/yeonwoo/vacation.png',assetReady:true,minAge:13,ending:'화가의 동반자',dialogues:['“잠시 그대로 있어 봐. 이 순간을 그림에 담고 싶어.”','“같은 풍경도 함께 보는 사람에 따라 색이 달라 보여.”']},
  {id:'taegyeom',name:'태겸',role:'상단 후계자',image:'../assets/characters/romance/taegyeom/vacation.png',assetReady:true,minAge:13,ending:'대상인의 동반자',dialogues:['“좋은 물건보다 좋은 인연을 만나는 일이 더 귀하다고 하더군.”','“이 길 끝에 재미있는 장이 선다는데, 함께 가겠어?”']},
  {id:'hyeon',name:'현',role:'정체를 숨긴 왕자',image:'../assets/characters/romance/hyeon/vacation.png',assetReady:true,minAge:13,ending:'왕자의 연인',dialogues:['“내가 누구인지는 잠시 잊고, 오늘만 평범하게 걸어도 될까?”','“또 만났네. 이쯤 되면 우연이라고만 하기는 어렵겠어.”']}
];
const careerEndingCandidates=[
  {id:'queen',title:'백성을 품은 여왕',description:'기품과 지혜, 굳은 마음으로 백성의 삶을 살피는 군주가 되었습니다.',weights:{dignity:5,intelligence:4,mentality:3,manners:2,speech:2}},
  {id:'royal-scholar',title:'왕실 학사',description:'깊은 학문과 반듯한 품격으로 나라의 기록과 배움을 맡았습니다.',weights:{intelligence:5,dignity:2,manners:2,mentality:1}},
  {id:'village-teacher',title:'서당 훈장',description:'배운 것을 이웃과 나누며 오래도록 믿음 받는 스승이 되었습니다.',weights:{intelligence:4,manners:3,speech:2,mentality:1}},
  {id:'court-artist',title:'궁중 화원',description:'섬세한 감수성과 감각으로 시대의 풍경을 화폭에 남겼습니다.',weights:{sensitivity:5,sense:3,charm:1,intelligence:1}},
  {id:'renowned-painter',title:'이름난 화가',description:'자유로운 시선으로 사람들의 마음을 움직이는 그림을 남겼습니다.',weights:{sensitivity:4,sense:4,speech:1,charm:1}},
  {id:'court-dancer',title:'궁중 무희',description:'기품과 아름다운 몸짓으로 궁중 연회의 중심에 섰습니다.',weights:{dignity:4,charm:4,sensitivity:2,agility:2}},
  {id:'master-entertainer',title:'명망 높은 예인',description:'시와 음악, 춤과 화술을 두루 익힌 최고의 예인이 되었습니다.',weights:{charm:4,sensitivity:3,speech:3,sense:2}},
  {id:'great-general',title:'대장군',description:'강인한 몸과 흔들리지 않는 정신으로 나라를 지키는 장수가 되었습니다.',weights:{strength:5,agility:4,health:3,mentality:2},masteryJobs:['farmwork','woodwork','masonry','swordsmanship']},
  {id:'martial-instructor',title:'무예 교관',description:'단단한 체력과 민첩한 몸놀림으로 다음 세대를 가르쳤습니다.',weights:{strength:4,agility:4,health:3,manners:1}},
  {id:'royal-magician',title:'왕실 술법사',description:'깊은 정신력과 마력으로 신수와 사람 사이의 지혜를 밝혔습니다.',weights:{magic:5,mentality:4,intelligence:2,sensitivity:1}},
  {id:'secret-explorer',title:'비경 탐험가',description:'두려움 없는 발걸음으로 알려지지 않은 땅과 유물을 발견했습니다.',weights:{agility:4,health:3,magic:2,sense:3}},
  {id:'great-merchant',title:'대상인',description:'사람을 읽는 화술과 뛰어난 감각으로 큰 상단을 이끌었습니다.',weights:{speech:5,sense:4,intelligence:1,charm:1},moneyWeight:.012,masteryJobs:['merchanthelp','ferryhelp']},
  {id:'fashion-master',title:'의복 장인',description:'전통과 새로운 감각을 엮어 누구도 흉내 내지 못할 옷을 지었습니다.',weights:{sense:5,sensitivity:3,charm:2,dignity:1},masteryJobs:['loomwork','sewing']},
  {id:'royal-chef',title:'궁중 요리사',description:'세심한 손끝과 넉넉한 마음으로 사람들을 행복하게 하는 음식을 만들었습니다.',weights:{sense:4,health:3,sensitivity:2,manners:1},masteryJobs:['kitchenhelp','cooking']},
  {id:'physician',title:'명의',description:'학문과 따뜻한 마음으로 아픈 사람을 살피는 의원이 되었습니다.',weights:{intelligence:4,magic:2,mentality:3,health:2},masteryJobs:['clinichelp','herbs']},
  {id:'diplomat',title:'외교 사절',description:'품격 있는 화술과 지혜로 먼 나라와 새로운 길을 열었습니다.',weights:{speech:5,dignity:4,intelligence:2,manners:2}},
  {id:'guardian-keeper',title:'신수의 수호자',description:'신수와 가장 깊은 유대를 맺고 세상의 균형을 지키는 사람이 되었습니다.',weights:{magic:4,mentality:4,dignity:2},guardianWeight:8},
  {id:'quiet-life',title:'평온한 삶',description:'화려한 명성 대신 소중한 사람들과 따뜻하고 단단한 일상을 선택했습니다.',weights:{health:2,mentality:3,manners:2,sensitivity:2}}
];
const downfallEndingCandidates=[
  {id:'tyrant',title:'폭군',description:'힘과 권력을 좇는 동안 사람들의 마음을 잃고 외로운 지배자가 되었습니다.',test:()=>game.strength>=700&&game.dignity>=650&&game.manners<180&&game.guardianTrust<30},
  {id:'greedy-merchant',title:'탐욕스러운 거상',description:'수많은 은전을 모았지만 곁에 남은 진실한 인연은 없었습니다.',test:()=>game.money>=180000&&game.speech>=650&&game.manners<180&&game.nannyAffinity<35},
  {id:'fallen-magician',title:'타락한 술법사',description:'감당할 수 없는 힘을 탐하다 신수와의 약속을 저버렸습니다.',test:()=>game.magic>=700&&game.mentality<180&&game.nannyAffinity<30},
  {id:'disgraced-warrior',title:'파문당한 무관',description:'절제 없는 힘으로 큰 사고를 일으켜 무관의 이름을 잃었습니다.',test:()=>game.strength>=650&&game.agility>=550&&game.mentality<160&&game.manners<180},
  {id:'fraud-merchant',title:'사기꾼 행상',description:'재치만 믿고 거짓 거래를 이어가다 모든 장터에서 쫓겨났습니다.',test:()=>game.speech>=650&&game.sense>=600&&game.dignity<160&&game.guardianTrust<35},
  {id:'debt-runaway',title:'빚더미 도망자',description:'무리한 선택을 되풀이한 끝에 빈손으로 먼 길을 떠나야 했습니다.',test:()=>game.money<=100&&game.stress>=95&&game.mentality<180},
  {id:'forsaken',title:'신수에게 버림받은 자',description:'거듭된 불신으로 수호의 계약이 끊기고 신수의 빛도 사라졌습니다.',test:()=>game.nannyAffinity<=5&&game.guardianTrust<=5}
];
function careerEndingScore(candidate){const masteryScore=(candidate.masteryJobs||[]).reduce((score,id)=>score+Math.min(300,activityProgressFor(id).successes*8),0);return Object.entries(candidate.weights).reduce((score,[key,weight])=>score+clampStat(key,game[key])*weight,0)+Math.max(0,game.money||0)*(candidate.moneyWeight||0)+clampStat('guardianTrust',game.guardianTrust)*(candidate.guardianWeight||0)+masteryScore;}
function resolveCareerEnding(){return careerEndingCandidates.map((candidate,index)=>({...candidate,index,score:careerEndingScore(candidate)})).sort((left,right)=>right.score-left.score||left.index-right.index)[0];}
function resolveRelationEnding(){normalizeRelations();return endingRelationCandidates.map((candidate,index)=>({candidate,record:game.relations[candidate.id],index})).filter(entry=>entry.record.dateUnlocked&&entry.record.meetings>=5).sort((left,right)=>right.record.affinity-left.record.affinity||right.record.meetings-left.record.meetings||left.index-right.index)[0]||null;}
function resolveEnding(){
  const career=resolveCareerEnding(),downfall=downfallEndingCandidates.find(candidate=>candidate.test()),relation=downfall?null:resolveRelationEnding();
  const category=downfall?'downfall':relation?'relation':'career';
  const outcome=downfall||relation?.candidate||career;
  const ownedCards=new Set(game.items.filter(item=>item&&item.type==='event'&&vacationIllustrations.some(card=>card.id===item.id)).map(item=>item.id));
  const strongest=[...statGroups.flatMap(group=>group.stats)].map(([key,label])=>({key,label,value:clampStat(key,game[key])})).sort((left,right)=>right.value-left.value).slice(0,3);
  return {resolvedAt:new Date().toISOString(),category,endingId:outcome.id,title:category==='relation'?outcome.ending:outcome.title,description:category==='relation'?`${outcome.name}과(와) 함께 서로의 길을 존중하며 새로운 삶을 시작했습니다.`:outcome.description,careerId:career.id,careerTitle:career.title,partnerId:relation?.candidate.id||null,partnerName:relation?.candidate.name||null,partnerRole:relation?.candidate.role||null,relationMeetings:relation?.record.meetings||0,relationAffinity:relation?.record.affinity||0,strongest,collectionCount:ownedCards.size,collectionTotal:vacationIllustrations.length};
}
function normalizeRelations(){
  if(!game.relations||typeof game.relations!=='object')game.relations={};
  endingRelationCandidates.forEach(candidate=>{
    const saved=game.relations[candidate.id];
    const legacyMeetings=Number.isFinite(Number(saved))?Number(saved):0;
    const record=saved&&typeof saved==='object'?saved:{};
    const meetings=Math.max(0,Number(record.meetings??legacyMeetings)||0);
    game.relations[candidate.id]={meetings,affinity:Math.max(0,Math.min(100,Number(record.affinity)||meetings*5)),lastMetAt:record.lastMetAt||null,dateUnlocked:Boolean(record.dateUnlocked||(meetings>=5&&game.age>=16))};
  });
}
function relationRecord(id){normalizeRelations();return game.relations[id];}
function recordRelationEncounter(candidate){
  const record=relationRecord(candidate.id);record.meetings+=1;record.affinity=Math.min(100,record.affinity+5);record.lastMetAt=game.currentDate||null;
  if(record.meetings>=5&&game.age>=16)record.dateUnlocked=true;
  return record;
}
function balancedRelationCandidate(candidates){
  if(!candidates.length)return null;
  const minimum=Math.min(...candidates.map(candidate=>relationRecord(candidate.id).meetings));
  const pool=candidates.filter(candidate=>relationRecord(candidate.id).meetings<=minimum+1);
  return pool[Math.floor(Math.random()*pool.length)];
}
function waitForVacationTap(label='화면을 터치해 계속'){
  const scene=document.querySelector('#vacationScene'),button=document.querySelector('#vacationNext');button.textContent=label;
  return new Promise(resolve=>{const advance=event=>{event.preventDefault();scene.removeEventListener('click',advance);resolve();};scene.addEventListener('click',advance,{once:true});});
}
function renderVacationMotion(season){
  const layer=document.querySelector('#vacationMotion');
  const seasonClass={봄:'spring',여름:'summer',가을:'autumn',겨울:'winter'}[season];
  layer.className=seasonClass?`vacation-motion season-${seasonClass}`:'vacation-motion';
  const counts={봄:18,여름:9,가을:14,겨울:28};
  const count=counts[season]||12;
  layer.replaceChildren(...Array.from({length:count},(_,index)=>{
    const particle=document.createElement('i');
    particle.style.setProperty('--x',`${(index*37+11)%101}%`);
    particle.style.setProperty('--delay',`${-((index*.73)%8).toFixed(2)}s`);
    particle.style.setProperty('--duration',`${(5.8+(index%7)*.72).toFixed(2)}s`);
    particle.style.setProperty('--scale',`${(.55+(index%5)*.16).toFixed(2)}`);
    return particle;
  }));
}
async function playVacationScene(prize,index){
  const phone=document.querySelector('.phone'),scene=document.querySelector('#vacationScene'),image=document.querySelector('#vacationImage');
  const person=document.querySelector('#encounterCharacter'),talk=document.querySelector('#encounterDialogue');
  const sceneSeason=prize.season||game.season;
  const seasonalEffects={봄:new Set(['petals','wind','calm']),여름:new Set(['splash','wave','wind','calm']),가을:new Set(['leaves','moon','steam','calm']),겨울:new Set(['snow','steam','calm'])};
  const sceneEffect=seasonalEffects[sceneSeason]?.has(prize.effect)?prize.effect:'calm';
  playVacationMusic(sceneSeason);renderVacationMotion(sceneSeason);image.src=prize.image;document.querySelector('#vacationTitle').textContent=prize.name;scene.dataset.effect=sceneEffect;scene.dataset.season=sceneSeason;
  scene.classList.remove('has-encounter');scene.classList.add('child-live');person.hidden=true;talk.hidden=true;phone.classList.add('vacation-playing');scene.hidden=false;
  await waitForVacationTap('일러스트를 감상한 뒤 터치');
  const candidates=endingRelationCandidates.filter(candidate=>game.age>=candidate.minAge&&candidate.assetReady);
  const encounter=candidates.length>0&&Math.random()<.35;
  let relation=null;
  if(encounter){
    relation=balancedRelationCandidate(candidates);const fromLeft=Math.random()<.5;
    person.querySelector('img').src=relation.image;person.querySelector('img').alt=`엔딩 인연 후보 ${relation.name}`;
    person.className=`encounter-character ${fromLeft?'from-left':'from-right'}`;person.hidden=false;scene.classList.add('has-encounter');
    document.querySelector('#encounterName').textContent=relation.name;document.querySelector('#encounterText').textContent=relation.dialogues[Math.floor(Math.random()*relation.dialogues.length)];talk.hidden=false;
    recordRelationEncounter(relation);
    await waitForVacationTap('대화를 읽은 뒤 터치');
  }
  talk.hidden=true;person.hidden=true;scene.classList.remove('has-encounter','child-live');scene.hidden=true;scene.dataset.effect='';scene.dataset.season='';document.querySelector('#vacationMotion').replaceChildren();phone.classList.remove('vacation-playing');playHomeMusic();
  return relation;
}

function updateImageState() {
  const characterReady = character.complete && character.naturalWidth > 0;
  character.hidden = !characterReady;
  missing.hidden = characterReady;
}

function renderHud() {
  if(game.nannyName&&!game.guardianName){game.guardianName=game.nannyName;game.guardianType=game.guardianType||'hyeonmu';}
  normalizeStats();
  const date = game.currentDate ? new Date(`${game.currentDate}T00:00:00`) : null;
  document.querySelector('#dateLabel').textContent = date ? `${game.age}세 · ${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 · ${game.season} ${game.week}주` : '생일 설정 전';
  document.querySelector('#moneyLabel').textContent = `${game.money.toLocaleString()}냥`;
  document.querySelector('#cashLabel').textContent = `캐시 ${game.cash.toLocaleString()}원`;
  const guardian=guardianDefs[game.guardianType];
  document.querySelector('#speakerName').textContent = game.guardianName || guardian?.name || '수호신수';
  const companion=document.querySelector('#guardianCompanion');
  if(companion){companion.hidden=!guardian;document.querySelector('#guardianCompanionMark').textContent=guardian?.mark||'守';document.querySelector('#guardianCompanionName').textContent=game.guardianName||guardian?.name||'';if(guardian)document.querySelector('#guardianCompanionMark').style.background=guardian.theme;}
}

const guardianVoice={
  cheongryong:['배움의 기운은 맑은 물처럼 이어지는 법이지. 무리하지 말고 한 주를 골고루 짜 보자.','지혜를 쌓는 날과 마음을 쉬는 날이 함께 있어야 오래 나아갈 수 있단다.'],
  baekho:['겁내지 마라. 네가 고른 한 주라면 내가 끝까지 곁을 지키겠다.','몸이 지치기 전에 쉬는 것도 훌륭한 수련이다.'],
  jujak:['좋은 기운이 느껴지는구나! 즐겁게 배울 날과 신나게 쉬는 날을 골라 보자.','마음에 불꽃이 너무 커지면 잠시 쉬어도 괜찮단다.'],
  hyeonmu:['서두르지 않아도 괜찮다. 하루씩 차분히 채우면 한 주의 길이 보일 게다.','단단한 마음은 알맞은 쉼에서 시작되는 법이란다.']
};
function speakGuardian(context='home'){
  const guardian=guardianDefs[game.guardianType];if(!guardian||introDialogueQueue.length)return false;
  const name=game.guardianName||guardian.name,filled=game.dailySchedule.filter(Boolean).length;
  let line='';
  if(game.stress>=80)line=`${game.characterName}, 마음이 많이 지쳐 있구나. 이번 주에는 반드시 휴식을 넣자.`;
  else if(game.money<500)line='은전이 넉넉하지 않구나. 비용이 드는 교육보다 아르바이트와 휴식을 먼저 살펴보자.';
  else if(context==='schedule'&&filled===0)line='아직 비어 있는 일곱 날이 보이는구나. 먼저 요일을 고르고 하고 싶은 활동을 눌러 보렴.';
  else if(context==='schedule'&&filled<7)line=`지금 ${filled}일을 정했구나. 남은 ${7-filled}일도 무리하지 않게 채워 보자.`;
  else if(context==='schedule')line='일곱 날의 준비가 모두 끝났구나. 비용과 스트레스를 확인한 뒤 실행하면 된다.';
  else if(context==='return')line=`다시 만났구나, ${game.characterName}. 지난 기록은 내가 잘 지켜 두었다. 이번 주 일정부터 살펴볼까?`;
  else {const lines=guardianVoice[game.guardianType]||guardianVoice.hyeonmu;line=lines[Math.floor(Math.random()*lines.length)];}
  document.querySelector('#speakerName').textContent=name;document.querySelector('#dialogueText').textContent=line;
  return true;
}

const statLabels={health:'체력',strength:'힘',agility:'민첩',intelligence:'지능',magic:'마력',mentality:'정신력',dignity:'기품',manners:'예절',speech:'화술',sensitivity:'감수성',sense:'센스',charm:'매력',stress:'스트레스'};
statLabels.nannyAffinity='신수 유대감';
statLabels.fatherAffinity='아버지 친밀도';
function showLiveChanges(action){
  const items=orderedChangeEntries(action.change).map(([key,value])=>{const positive=key==='stress'?value<0:value>=0;const current=clampStat(key,game[key]);return `<span class="${positive?'up':'down'}">${statLabels[key]||key} <b>${current}</b> <small>(${value>0?'+':''}${value})</small></span>`;});
  if(action.cost!==0)items.push(`<span class="money">은전 ${action.cost>0?'-':'+'}${Math.abs(action.cost)}냥</span>`);
  document.querySelector('#liveChanges').innerHTML=items.join('');
  if(Object.values(action.change||{}).some(value=>Math.abs(value)>=8))game.homeReaction='shocked';
  else if(action.change&&Object.keys(action.change).length)game.homeReaction=null;
  updateHomeCharacter();
}
function renderActivityGauges(action){
  const box=document.querySelector('#activityGauges');
  const entries=orderedChangeEntries(action.change).filter(([,value])=>value!==0);
  if(!entries.length||['shopping','vacation'].includes(action.id)){box.hidden=true;box.innerHTML='';return;}
  box.innerHTML=entries.map(([key,value])=>{
    const max=statMaximum(key),next=clampStat(key,game[key]),current=clampStat(key,next-value);
    const beneficial=key==='stress'?value<0:value>0;
    const low=Math.min(current,next),width=Math.max(2,Math.abs(next-current));
    return `<div class="activity-gauge"><span class="activity-gauge-label">${statLabels[key]||key}</span><span class="activity-gauge-track"><i class="activity-gauge-before" style="width:${current/max*100}%"></i><i class="activity-gauge-delta ${beneficial?'up':'down'}" style="left:${low/max*100}%;width:${Math.max(2,width/max*100)}%"></i></span><span class="activity-gauge-value ${beneficial?'up':'down'}"><b>${current} → ${next}</b><small>${value>0?'▲':'▼'}${Math.abs(value)}</small></span></div>`;
  }).join('');
  box.hidden=false;
}

const greetingChoices={
  tired:[
    {line:'오늘은 마음이 조금 무거워요. 그래도 잘 해낼 수 있을까요?',choices:[['오늘은 천천히 해도 괜찮아.',{stress:-4,nannyAffinity:3},'곁에서 지켜봐 준다니 마음이 놓여요.'],['따뜻한 차부터 마시자.',{stress:-3,healthiness:2,nannyAffinity:2},'따뜻한 차를 마시면 기운이 날 것 같아요!'],['계획대로 움직여 보자.',{virtue:2,stress:2,nannyAffinity:-1},'네… 조금 힘들어도 해볼게요.']]},
    {line:'오늘은 아무것도 하고 싶지 않아요.',choices:[['잠깐 마음을 쉬게 하자.',{stress:-6,nannyAffinity:3},'고마워요. 마음이 조금 가벼워졌어요.'],['바람을 쐬고 오자.',{stress:-3,health:2,nannyAffinity:2},'바깥 공기를 마시면 기분이 나아질 것 같아요.'],['작은 일부터 시작하자.',{manners:2,stress:2,nannyAffinity:-1},'알겠어요. 하나씩 해볼게요.']]},
    {line:'어제 너무 무리했나 봐요. 마음이 복잡해요.',choices:[['오늘 일정은 가볍게 하자.',{stress:-5,nannyAffinity:3},'한결 마음이 편해졌어요.'],['따뜻하게 몸을 풀어보자.',{healthiness:3,stress:-3,nannyAffinity:2},'조금씩 움직이면 괜찮아질 것 같아요.'],['참는 것도 수련이란다.',{virtue:2,stress:2,nannyAffinity:-2},'네… 견뎌볼게요.']]}
  ],
  stressed:[
    {line:'마음이 자꾸 산만해져요. 잠깐 이야기해도 될까요?',choices:[['무슨 일이든 천천히 말해 줘.',{stress:-5,nannyAffinity:4},'제 이야기를 들어줘서 고마워요.'],['마당을 함께 걸어볼까?',{stress:-4,health:1,nannyAffinity:2},'함께 걸으면 기분이 좋아질 것 같아요!'],['오늘 할 일부터 정리해 보자.',{study:2,stress:1,nannyAffinity:-1},'해야 할 일부터 생각해 볼게요.']]},
    {line:'오늘은 작은 일에도 자꾸 짜증이 나요. 제가 이상한 걸까요?',choices:[['그럴 때도 있는 법이야.',{stress:-5,nannyAffinity:4},'그 말에 마음이 놓였어요.'],['무엇이 속상했는지 말해보렴.',{stress:-4,sensitivity:2,nannyAffinity:3},'차근차근 이야기해 볼게요.'],['마음을 다스리는 연습을 하자.',{virtue:3,stress:1,nannyAffinity:-1},'쉽지는 않지만 노력할게요.']]},
    {line:'잘하고 싶은데 마음처럼 되지 않아서 속상해요.',choices:[['이미 충분히 잘하고 있어.',{stress:-5,nannyAffinity:4},'조금 더 자신을 믿어볼게요.'],['어려운 부분부터 같이 보자.',{study:2,stress:-3,nannyAffinity:3},'함께라면 다시 해볼 수 있어요.'],['실수도 배움의 일부란다.',{sensitivity:2,virtue:1,nannyAffinity:2},'다음에는 덜 두려워할게요.']]}
  ],
  bright:[
    {line:'좋은 아침이에요! 오늘은 왠지 멋진 일이 생길 것 같아요.',choices:[['그 기운으로 즐겁게 보내자!',{charm:2,nannyAffinity:3},'네! 오늘 하루가 정말 기대돼요!'],['오늘 배우고 싶은 게 있니?',{study:2,nannyAffinity:2},'새로운 글을 하나 더 배우고 싶어요.'],['먼저 유모에게 인사부터 할까?',{manners:2,virtue:1,nannyAffinity:2},'좋은 아침이에요, 유모님!']]},
    {line:'뜰에 햇살이 참 예뻐요. 오늘은 무엇을 하면 좋을까요?',choices:[['함께 꽃을 보러 가자.',{sensitivity:3,stress:-2,nannyAffinity:3},'좋아요! 예쁜 꽃을 찾아볼래요.'],['새로운 공부에 도전해 보자.',{study:3,nannyAffinity:2},'오늘은 어려운 글도 읽어볼게요!'],['집안일을 먼저 도와주렴.',{virtue:3,craft:1,nannyAffinity:2},'네! 금방 깨끗하게 해둘게요.']]},
    {line:'어젯밤 재미있는 꿈을 꿨어요. 큰 궁궐을 걷고 있었어요.',choices:[['꿈 이야기를 더 들려주렴.',{sensitivity:3,nannyAffinity:4},'기억나는 장면을 모두 말해드릴게요.'],['언젠가 직접 볼 수도 있겠구나.',{charm:2,reputation:1,nannyAffinity:2},'정말 그런 날이 올까요?'],['꿈보다 오늘을 충실히 보내자.',{virtue:3,nannyAffinity:1},'네, 오늘 할 일부터 잘할게요.']]}
  ]
};
Object.values(greetingChoices).flat().forEach(scene=>scene.choices.forEach(choice=>{choice[1]=canonicalizeChange(choice[1]);}));
function showHomeGreeting(force=false){
  if(!game.birthday||document.querySelector('.phone').classList.contains('playing')||game.lastGreetingDate===game.currentDate)return false;
  game.lastGreetingDate=game.currentDate;
  if(!force&&Math.random()>=.18)return false;
  const mood=game.stress>=55?'tired':game.stress>=45?'stressed':'bright',scenes=greetingChoices[mood];
  const available=scenes.map((scene,index)=>({scene,index})).filter(item=>`${mood}-${item.index}`!==game.lastGreetingScene);
  const picked=available[Math.floor(Math.random()*available.length)]||{scene:scenes[0],index:0},scene=picked.scene;
  game.lastGreetingScene=`${mood}-${picked.index}`;
  document.querySelector('#speakerName').textContent=game.characterName||'아이';document.querySelector('#dialogueText').textContent=scene.line;
  document.querySelector('#homeGreetingSpeaker').textContent=game.characterName||'아이';
  document.querySelector('#homeGreetingLine').textContent=scene.line;
  document.querySelector('#homeGreetingPrompt').textContent=`${game.guardianName||guardianDefs[game.guardianType]?.name||'신수'}에게 어떻게 답할까요?`;
  const choices=document.querySelector('#homeGreetingChoices');choices.innerHTML=scene.choices.map((choice,i)=>`<button data-greeting-choice="${i}">${choice[0]}</button>`).join('');
  document.querySelector('#homeGreeting').hidden=false;document.querySelector('.phone').classList.add('greeting-active');
  choices.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>answerHomeGreeting(scene,Number(button.dataset.greetingChoice))));
  return true;
}
function answerHomeGreeting(scene,index){
  const [,change,result]=scene.choices[index];Object.entries(canonicalizeChange(change)).forEach(([key,value])=>game[key]=clampStat(key,(game[key]||0)+value));
  document.querySelector('#homeGreeting').hidden=true;document.querySelector('.phone').classList.remove('greeting-active');document.querySelector('#speakerName').textContent=game.characterName||'아이';document.querySelector('#dialogueText').textContent=result;showLiveChanges({change:canonicalizeChange(change),cost:0});renderHud();queueAutoSave();
}

function openPanel(type) {
  panel.hidden = false;
  if (type === 'schedule') {
    playHomeMusic();
    scheduleConfirmDismissed = false;
    renderSchedulePanel();
    speakGuardian('schedule');
    showScheduleConfirmation();
  } else if (type === 'status') {
    playHomeMusic();
    panelTitle.textContent = `${game.characterName || '아이'}의 상태`;
    normalizeBodyMetrics();
    normalizeRelations();
    const relationCards=endingRelationCandidates.map(candidate=>{const relation=game.relations[candidate.id];const phase=relation.dateUnlocked?'데이트 가능':relation.meetings>=5?'16세부터 데이트 가능':`${relation.meetings} / 5회 만남`;return `<div class="relation-card ${relation.dateUnlocked?'unlocked':''}"><b>${candidate.name}</b><small>${candidate.role}</small><span>${phase}</span><i style="--relation-progress:${Math.min(100,relation.meetings/5*100)}%"></i></div>`;}).join('');
    panelBody.innerHTML = `<div class="status-summary"><span>${game.age}세 · ${game.season} ${game.week}주</span><b>${game.money.toLocaleString()}냥</b></div><section class="body-profile" aria-label="성장 정보"><div><small>키</small><b>${game.height.toFixed(1)} cm</b></div><div><small>몸무게</small><b>${game.weight.toFixed(1)} kg</b></div></section>${statGroups.map(group => `<section class="stat-group"><h3>${group.title}</h3>${group.stats.map(([key,label]) => statBar(key,label)).join('')}</section>`).join('')}<section class="stat-group condition-group"><h3>현재 상태</h3>${statBar('stress','스트레스')}</section><section class="stat-group"><h3>수호 인연</h3>${statBar('nannyAffinity','신수 유대감')}${statBar('fatherAffinity','아버지 친밀도')}</section><section class="relation-group"><h3>인연</h3><p>13세부터 우정으로 만나며, 5회 만남과 16세 이상을 충족하면 데이트가 열립니다.</p><div class="relation-grid">${relationCards}</div></section>`;
  } else if (type === 'inventory') {
    playHomeMusic();
    renderInventory();
  } else if (type === 'shop') {
    playHomeMusic();
    prepareVisitShopStock();
    renderVisitShop();
  } else if (type === 'collection') {
    playHomeMusic();
    renderVacationCollection();
  } else {
    playHomeMusic();
    renderSavePanel();
  }
}

function renderVisitShop(){
  normalizeInventory();if(!Array.isArray(game.purchasedGoods))game.purchasedGoods=[];panelTitle.textContent='방문상점 · 잡화전';
  const owned=new Set(game.purchasedGoods);
  const displayed=visitShopStock.map(id=>generalGoods.find(item=>item.id===id)).filter(item=>item&&!owned.has(item.id));
  const cards=displayed.map(item=>`<button class="shop-card goods-card" data-general-good="${item.id}" ${(visitShopPurchaseMade||game.money<item.price)?'disabled':''}><i class="item-glyph type-${item.type}"></i><b>${item.name}</b><span>${item.price}냥</span><small>${item.detail}<br>${formatChanges(item.change)}</small></button>`).join('');
  const note=visitShopPurchaseMade?'이번 방문의 구매를 마쳤습니다. 다음 방문에 새 물건이 들어옵니다.':'이번 방문에는 진열된 물건 중 하나만 구매할 수 있습니다.';
  panelBody.innerHTML=`<div class="shop-greeting visiting-merchant"><img src="../assets/characters/companions/portraits/merchant.png" alt="집으로 찾아온 떠돌이 잡화상"><div><b>떠돌이 잡화상</b><p>집 앞에 들러 오늘의 물건 열 가지를 펼쳐 보였습니다.</p></div></div><div class="shop-money"><span>보유 은전 <b>${game.money.toLocaleString()}냥</b></span></div><p class="visit-shop-note">${note}<br>구매한 물건은 다시 진열되지 않습니다.</p><div class="shop-grid">${cards||'<p class="empty-shop">지금 살 수 있는 새 물건이 없습니다.</p>'}</div>`;
  panelBody.querySelectorAll('[data-general-good]').forEach(button=>button.addEventListener('click',()=>buyGeneralGood(button.dataset.generalGood)));
}
function buyGeneralGood(id){
  if(!Array.isArray(game.purchasedGoods))game.purchasedGoods=[];const good=generalGoods.find(item=>item.id===id);if(!good||visitShopPurchaseMade||game.money<good.price||game.purchasedGoods.includes(id))return;
  game.money-=good.price;applyShopChanges(good.change);game.purchasedGoods.push(id);visitShopPurchaseMade=true;
  document.querySelector('#dialogueText').textContent=`잡화상에게서 ${good.name}${objectParticle(good.name)} 구입했어요.`;showLiveChanges({change:good.change,cost:good.price});renderHud();renderVisitShop();queueAutoSave();
}
const inventoryCategories={all:'전체',accessory:'장신구',event:'이벤트'};
const inventoryTypeLabels={food:'음식',outfit:'의상',accessory:'장신구',event:'이벤트'};
function normalizeInventory(){
  if(!Array.isArray(game.items))game.items=[];
  game.items=game.items.map((item,index)=>typeof item==='string'?{id:`legacy-${index}`,type:'event',name:item,qty:1}:({...item,type:item.type||'event',qty:Math.max(1,item.qty||1)}));
  const vacationIds=new Set(vacationIllustrations.map(item=>item.id)),seenVacation=new Set();
  game.items=game.items.filter(item=>{if(!vacationIds.has(item.id))return true;item.qty=1;if(seenVacation.has(item.id))return false;seenVacation.add(item.id);return true;});
  const seenOutfits=new Set();
  game.items=game.items.filter(item=>{if(item.type!=='outfit')return true;item.qty=1;if(seenOutfits.has(item.id))return false;seenOutfits.add(item.id);return true;});
}
function inventoryImage(item){
  if(item.image)return item.image;
  if(item.type==='food')return `../assets/items/food/${item.id}.png`;
  if(item.type==='outfit')return outfitImage(item.id);
  return '';
}
function renderInventory(category='all'){
  normalizeInventory();panelTitle.textContent='소지품';
  const collectionCardIds=new Set(vacationIllustrations.map(item=>item.id));
  const filtered=game.items.filter(item=>item.type!=='outfit'&&!collectionCardIds.has(item.id)&&(category==='all'||item.type===category)).slice(0,180);
  const slots=Array.from({length:180},(_,index)=>{const item=filtered[index];if(!item)return '<div class="inventory-slot empty" aria-hidden="true"></div>';const image=inventoryImage(item);return `<button class="inventory-slot filled ${game.equippedOutfit===item.id?'equipped':''}" data-item="${item.id}" title="${item.name}">${image?`<img src="${image}" alt="">`:`<i class="item-glyph type-${item.type}"></i>`}<span>${item.name}</span>${item.qty>1?`<b>${item.qty}</b>`:''}${game.equippedOutfit===item.id?'<em>착용</em>':''}</button>`;}).join('');
  panelBody.innerHTML=`<div class="inventory-tabs">${Object.entries(inventoryCategories).map(([id,label])=>`<button data-inventory-tab="${id}" class="${category===id?'on':''}">${label}</button>`).join('')}</div><div class="inventory-count"><b>${filtered.length}</b> / 180칸</div><div class="inventory-grid">${slots}</div><div class="inventory-detail" id="inventoryDetail">아이템을 누르면 설명과 사용 버튼이 표시됩니다.</div>`;
  panelBody.querySelectorAll('[data-inventory-tab]').forEach(button=>button.addEventListener('click',()=>renderInventory(button.dataset.inventoryTab)));
  panelBody.querySelectorAll('[data-item]').forEach(button=>button.addEventListener('click',()=>showInventoryItem(button.dataset.item,category)));
}
function showInventoryItem(id,category){
  const item=game.items.find(entry=>entry.id===id),detail=document.querySelector('#inventoryDetail');if(!item)return;
  const action=item.type==='outfit'?`<button data-inventory-action="wear">${game.equippedOutfit===item.id?'벗기':'갈아입기'}</button>`:item.type==='food'?'<button data-inventory-action="use">먹기</button>':'';
  detail.innerHTML=`${item.type==='event'&&item.image?`<img class="event-collectible-preview" src="${item.image}" alt="${item.name}">`:''}<b>${item.name}</b><span>${inventoryTypeLabels[item.type]||'기타'} · ${item.qty||1}개</span>${item.description?`<p>${item.description}</p>`:''}${action}`;
  detail.querySelector('[data-inventory-action]')?.addEventListener('click',()=>{if(item.type==='outfit'){game.autoOutfit=false;game.equippedOutfit=game.equippedOutfit===item.id?null:item.id;applyEquippedOutfit();renderInventory(category);}else if(item.type==='food'){const food=foods.find(entry=>entry.id===item.id);if(food)applyShopChanges(food.change);item.qty-=1;if(item.qty<=0)game.items.splice(game.items.indexOf(item),1);document.querySelector('#dialogueText').textContent=`${item.name}을(를) 먹었어요.`;renderInventory(category);}});
}
const collectionAgeTabs=[['all','전체'],['9','9세'],['13','13세'],['16','16세'],['19','19세']];
function closeCollectionToHome(){panel.hidden=true;panelTitle.textContent='';panelBody.innerHTML='';playHomeMusic();}
function renderVacationCollection(ageFilter='all'){
  normalizeInventory();panelTitle.textContent='바캉스 수집도감';
  const ownedIds=new Set(game.items.filter(item=>item.type==='event').map(item=>item.id));
  const collected=vacationIllustrations.filter(item=>ownedIds.has(item.id)).length,total=vacationIllustrations.length;
  const percent=Math.round(collected/total*100);
  const filtered=ageFilter==='all'?vacationIllustrations:vacationIllustrations.filter(item=>(item.age||9)===Number(ageFilter));
  const filteredCollected=filtered.filter(item=>ownedIds.has(item.id)).length;
  const cards=filtered.map(item=>{const unlocked=ownedIds.has(item.id),age=item.age||9,special=item.rarity==='special';return `<button class="collection-card ${unlocked?'unlocked':'locked'} ${special?'special':''}" data-collection-id="${item.id}" ${unlocked?'':'disabled'} aria-label="${unlocked?`${age}세 ${item.season} 수집 완료`:`${age}세 ${item.season} 미수집`}"><div class="collection-art"><img src="${item.image}" alt="${unlocked?item.name:''}"><span>${unlocked?(special?'현대 희귀':'수집 완료'):'?'}</span></div><b>${age}세 · ${item.season}${special?' · 희귀':''}</b><small>${unlocked?item.name:'아직 발견하지 못한 추억'}</small></button>`;}).join('');
  const empty=`<div class="collection-empty"><b>${ageFilter}세의 추억은 아직 준비 중이에요.</b><span>새 일러스트가 추가되면 이곳에 표시됩니다.</span></div>`;
  panelBody.innerHTML=`<button class="collection-back" id="collectionBack" type="button" aria-label="수집도감에서 홈으로 돌아가기">← 뒤로가기</button><nav class="collection-age-tabs" aria-label="연령별 수집도감">${collectionAgeTabs.map(([id,label])=>`<button class="${ageFilter===id?'on':''}" data-collection-age="${id}" type="button">${label}</button>`).join('')}</nav><section class="collection-progress" aria-label="바캉스 일러스트 수집률"><div><b>전체 수집도 ${percent}%</b><span>${collected} / ${total}</span></div><div class="collection-track"><i style="width:${percent}%"></i></div>${ageFilter!=='all'?`<small>${ageFilter}세 수집 ${filteredCollected} / ${filtered.length}</small>`:''}</section>${cards?`<div class="collection-grid">${cards}</div>`:empty}<section class="collection-detail" id="collectionDetail">수집한 카드를 누르면 크게 볼 수 있어요.</section>`;
  document.querySelector('#collectionBack').addEventListener('click',closeCollectionToHome);
  panelBody.querySelectorAll('[data-collection-age]').forEach(button=>button.addEventListener('click',()=>renderVacationCollection(button.dataset.collectionAge)));
  panelBody.querySelectorAll('[data-collection-id]:not(:disabled)').forEach(button=>button.addEventListener('click',()=>showVacationCollectionCard(button.dataset.collectionId)));
}
function showVacationCollectionCard(id){
  const item=vacationIllustrations.find(entry=>entry.id===id),detail=document.querySelector('#collectionDetail');if(!item||!detail)return;
  detail.innerHTML=`<img src="${item.image}" alt="${item.name}"><div><b>${item.age||9}세 · ${item.season} · ${item.name}</b><p>${item.description}</p></div>`;
  detail.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function renderWardrobe(){
  panel.hidden=false;panelTitle.textContent='옷 갈아입기';
  const owned=game.items.filter(item=>item&&item.type==='outfit');
  panelBody.innerHTML=`<div class="auto-outfit"><div><b>계절·상황 자동 갈아입기</b><small>${game.autoOutfit?'보유한 한복 중 알맞은 옷을 자동 선택합니다.':'직접 선택한 한복을 계속 입습니다.'}</small></div><button id="autoOutfitToggle" class="${game.autoOutfit?'on':''}">${game.autoOutfit?'켜짐':'꺼짐'}</button></div><div class="wardrobe-grid"><button class="wardrobe-card ${!game.equippedOutfit?'on':''}" data-wear=""><img src="${expressions[0][0]}" alt="기본 한복"><b>기본 한복</b></button>${owned.map(item=>{const meta=outfits.find(outfit=>outfit.id===item.id);return `<button class="wardrobe-card ${game.equippedOutfit===item.id?'on':''}" data-wear="${item.id}"><img src="${outfitImage(item.id)}" alt="${item.name}"><b>${item.name}</b><small>${meta?`${outfitAgeLabel(meta)} · ${meta.seasons.join('·')}<br>`:''}${meta&&game.age>meta.ageEnd?'자라서 조금 꼭 맞음':'현재 몸에 맞음'}</small></button>`;}).join('')}</div>`;
  document.querySelector('#autoOutfitToggle').addEventListener('click',()=>{game.autoOutfit=!game.autoOutfit;if(game.autoOutfit)updateAutoOutfit();renderWardrobe();});
  panelBody.querySelectorAll('[data-wear]').forEach(button=>button.addEventListener('click',()=>{game.autoOutfit=false;game.equippedOutfit=button.dataset.wear||null;applyEquippedOutfit();renderWardrobe();}));
}

function renderSavePanel() {
  panelTitle.textContent = '게임 기록';
  const slots = SAVE_SLOTS.map(slot => readSave(slot));
  const slotCards = slots.map((saved, index) => {
    const slot = index + 1;
    const label = saved ? `${saved.game.characterName||'아이'} · ${saved.game.age}세 ${saved.game.month}월 ${saved.game.week}주` : '새로운 인연을 기다리는 빈 기록';
    const savedAt = saved ? new Date(saved.savedAt).toLocaleString('ko-KR') : '';
    const current=saved&&game.profileSlot===slot;
    return `<div class="save-slot ${saved ? 'filled' : 'empty'}"><div><b>인연 ${slot}${current?' · 현재 키우는 중':''}</b><small>${label}${savedAt ? ` · ${savedAt}` : ''}</small></div>${saved?`<div class="save-slot-actions"><button data-load-slot="${slot}" ${current?'disabled':''}>${current?'현재 기록':'이어하기'}</button><button data-delete-slot="${slot}" ${current?'disabled':''}>기록 삭제</button></div>`:''}</div>`;
  }).join('');
  panelBody.innerHTML = `
    <div class="save-info"><b>인연 기록 ${slots.filter(Boolean).length}/5</b><small>최대 다섯 명까지 동시에 키울 수 있으며 각 기록은 자동으로 저장됩니다.</small></div>
    <div class="save-grid">${slotCards}</div>
    <div class="save-actions">
      <button class="new-growth" id="startNewGrowth">새롭게 시작하기</button>
    </div>`;
  panelBody.querySelectorAll('[data-load-slot]').forEach(button => button.addEventListener('click', () => loadGame(Number(button.dataset.loadSlot))));
  panelBody.querySelectorAll('[data-delete-slot]').forEach(button => button.addEventListener('click', () => deleteCharacterRecord(Number(button.dataset.deleteSlot))));
  document.querySelector('#startNewGrowth').addEventListener('click',beginNewGrowth);
}

function readSave(slot = 1) {
  try { return JSON.parse(localStorage.getItem(`${SAVE_KEY}-slot-${slot}`)); } catch { return null; }
}

function readAutoSave() {
  try { return JSON.parse(localStorage.getItem(`${SAVE_KEY}-autosave`)); } catch { return null; }
}
function isPlayableSave(saved){
  const data=saved?.game;
  if(!data||typeof data!=='object'||data.ended)return false;
  if(typeof data.characterName!=='string'||!data.characterName.trim())return false;
  if(typeof data.birthday!=='string'||typeof data.currentDate!=='string')return false;
  const birthday=new Date(`${data.birthday}T00:00:00`);
  const currentDate=new Date(`${data.currentDate}T00:00:00`);
  return !Number.isNaN(birthday.getTime())&&!Number.isNaN(currentDate.getTime())&&currentDate>=birthday;
}
const saveTimestamp=saved=>{const timestamp=Date.parse(saved?.savedAt||'');return Number.isFinite(timestamp)?timestamp:0;};
function mostRecentExistingSave(){
  return [readAutoSave(),...SAVE_SLOTS.map(slot=>readSave(slot))]
    .filter(isPlayableSave)
    .sort((a,b)=>saveTimestamp(b)-saveTimestamp(a))[0]||null;
}

function writeSave(slot, payload) {
  localStorage.setItem(`${SAVE_KEY}-slot-${slot}`, JSON.stringify(payload));
}

function serializeSave() {
  return {
    version: SAVE_KEY,
    savedAt: new Date().toISOString(),
    game: { ...game },
    background: bg.getAttribute('src'),
    character: character.getAttribute('src')
  };
}

function applySavePayload(saved) {
  if (!isPlayableSave(saved)) return false;
  if(!SAVE_SLOTS.includes(Number(saved.game.profileSlot))){
    const matchingSlot=SAVE_SLOTS.find(slot=>{const record=readSave(slot);return record?.game?.characterName===saved.game.characterName&&record?.game?.nannyName===saved.game.nannyName&&record?.game?.birthday===saved.game.birthday;});
    saved.game.profileSlot=matchingSlot||SAVE_SLOTS.find(slot=>!readSave(slot))||null;
  }else{
    saved.game.profileSlot=Number(saved.game.profileSlot);
  }
  Object.assign(game, saved.game);
  if(!Number.isFinite(game.cash))game.cash=50000;
  if(!Number.isFinite(Number(game.fatherAffinity)))game.fatherAffinity=0;
  if(!Array.isArray(game.fatherBirthdayYears))game.fatherBirthdayYears=[];
  normalizeStats();
  normalizeRelations();
  normalizeActivityProgress();
  if(!Array.isArray(game.activityUnlocksSeen))game.activityUnlocksSeen=[];
  normalizeBodyMetrics();
  if(typeof game.autoOutfit!=='boolean')game.autoOutfit=true;
  normalizeInventory();
  document.querySelector('#birthdaySetup').hidden = Boolean(game.birthday);
  if (!Array.isArray(game.dailySchedule) || game.dailySchedule.length !== 7) game.dailySchedule = [null,null,null,null,null,null,null];
  if(!game.monthlyLedger&&game.currentDate){const date=new Date(`${game.currentDate}T00:00:00`);game.monthlyLedger=createMonthlyLedger(date.getFullYear(),date.getMonth()+1);}
  bg.src = backgrounds.home;
  applyEquippedOutfit();
  renderHud();
  setTimeout(()=>{if(!showHomeGreeting())speakGuardian('return');},350);
  panel.hidden = true;
  document.querySelector('#dialogueText').textContent = '저장한 시점으로 돌아왔어요.';
  return true;
}

function migrateLegacySave() {
  for (const key of LEGACY_SAVE_KEYS) {
    try {
      const legacy = JSON.parse(localStorage.getItem(key));
      if (legacy?.game && !localStorage.getItem(`${SAVE_KEY}-autosave`)) {
        localStorage.setItem(`${SAVE_KEY}-autosave`, JSON.stringify({ ...legacy, version: SAVE_KEY }));
      }
    } catch {}
  }
}

function saveGame(slot = 1, auto = false) {
  const payload = serializeSave();
  const key = auto ? `${SAVE_KEY}-autosave` : `${SAVE_KEY}-slot-${slot}`;
  localStorage.setItem(key, JSON.stringify(payload));
  if (!auto) {
    document.querySelector('#dialogueText').textContent = `${slot}번 슬롯에 현재 진행 상황을 저장했어요.`;
    renderSavePanel();
  }
}

let autoSaveTimer = null;
function writeLatestAutoSave(){
  if(!game.birthday)return false;
  const payload=serializeSave();
  localStorage.setItem(`${SAVE_KEY}-autosave`,JSON.stringify(payload));
  if(game.profileSlot)writeSave(game.profileSlot,payload);
  return true;
}
function queueAutoSave() {
  clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(writeLatestAutoSave,700);
}
function showRecoveryPrompt(){
  if(!isPlayableSave(pendingRecoverySave))return false;
  const saved=pendingRecoverySave,summary=document.querySelector('#recoverySummary');
  summary.textContent=`${saved.game.characterName||'아이'} · ${saved.game.age}세 ${saved.game.month}월 ${saved.game.week}주 · ${new Date(saved.savedAt).toLocaleString('ko-KR')}`;
  document.querySelector('#recoveryContinue').disabled=false;
  document.querySelector('#recoveryPrompt').hidden=false;
  return true;
}
function showUnavailableRecovery(){
  const prompt=document.querySelector('#recoveryPrompt');
  document.querySelector('#recoverySummary').textContent='이어갈 수 있는 기록이 없습니다. 새롭게 시작하기를 선택해 주세요.';
  document.querySelector('#recoveryContinue').disabled=true;
  prompt.hidden=false;
  document.querySelector('#recoveryFresh').focus();
}
function continueRecovery(){
  const saved=pendingRecoverySave;
  document.querySelector('#prologue').hidden=true;
  panel.hidden=true;
  if(!isPlayableSave(saved)||!applySavePayload(saved)){
    pendingRecoverySave=null;
    showUnavailableRecovery();
    return;
  }
  pendingRecoverySave=null;
  document.querySelector('#recoveryPrompt').hidden=true;
  playHomeMusic();
  queueAutoSave();
}
function declineRecovery(){
  pendingRecoverySave=null;
  document.querySelector('#recoveryPrompt').hidden=true;
  renderPrologue();
}
function initializeRecoverySession(){
  pendingRecoverySave=mostRecentExistingSave();
  localStorage.setItem(SESSION_ACTIVE_KEY,'1');
  setInterval(writeLatestAutoSave,5000);
}

function loadGame(slot = 1) {
  writeLatestAutoSave();
  const saved = readSave(slot);
  if (!saved) return;
  saved.game.profileSlot=slot;
  applySavePayload(saved);
}
function deleteCharacterRecord(slot){
  if(game.profileSlot===slot)return;
  const saved=readSave(slot);if(!saved)return;
  if(!window.confirm(`${saved.game.characterName||'아이'}의 인연 기록을 삭제할까요? 삭제한 기록은 되돌릴 수 없습니다.`))return;
  localStorage.removeItem(`${SAVE_KEY}-slot-${slot}`);
  renderSavePanel();
}

function resetGameState() {
  Object.assign(game, { characterName:'',nannyName:'',guardianType:null,guardianName:'',profileSlot:null,age:9,height:130,weight:28.5,month:1,week:1,season:'봄',money:50000,cash:50000,health:42,strength:18,agility:20,intelligence:35,magic:8,mentality:30,dignity:36,manners:28,speech:14,sensitivity:40,sense:24,charm:30,stress:12,items:[],purchasedGoods:[],relations:{},activityProgress:{},activityUnlocksSeen:[],startingGiftId:null,fatherBirthdayYears:[],equippedOutfit:null,autoOutfit:true,dailySchedule:[null,null,null,null,null,null,null],birthday:null,currentDate:null,endingDate:null,ended:false,endingResult:null,birthdayCount:0,element:null,birthSeason:null,memory:0,truth:0,exposure:0,fatherAffinity:0,guardianTrust:50,nannyAffinity:50,lastGreetingDate:null,monthlyLedger:null});
  document.querySelector('#liveChanges').innerHTML='';
  const greeting=document.querySelector('#homeGreeting');greeting.hidden=true;greeting.classList.remove('greeting-active');
  document.querySelector('#characterNameInput').value='';
  document.querySelector('#guardianNameInput').value='';
  syncBirthdaySelectors(true);
  document.querySelector('#birthdayTitle').textContent='아이의 이름과 생일';
  bg.src = backgrounds.home;
  character.src = expressions[0][0];
  renderHud();
  panel.hidden = true;
  document.querySelector('#birthdaySetup').hidden = true;
  document.querySelector('#dialogueText').textContent = '새로운 인연을 만날 준비를 해볼까요?';
}
function restartStudioIntro(){
  clearTimeout(prologueTimer);stopRain();stopGameMusic();
  const music=document.querySelector('#prologueMusic');music.pause();music.currentTime=0;
  prologueIndex=0;prologueImageLayer=0;prologueRenderId++;studioIntroFinished=false;
  document.querySelector('#prologue').hidden=true;document.querySelector('#recoveryPrompt').hidden=true;
  prologueSoundOn=true;
  syncPrologueSoundButton();
  const loading=document.querySelector('#studioLoading');loading.hidden=false;loading.classList.remove('is-leaving');
  loading.querySelectorAll('.studio-logo,.brush-logo span,.brush-logo i,.studio-logo b,.loading-seonhwa,.footprint,.loading-caption,.studio-start-sound').forEach(element=>{element.style.animation='none';void element.offsetWidth;element.style.animation='';});
}
function beginNewGrowth(){
  writeLatestAutoSave();
  if(SAVE_SLOTS.every(slot=>Boolean(readSave(slot)))){document.querySelector('#dialogueText').textContent='다섯 명을 모두 키우고 있어요. 새 인연을 시작하려면 기존 기록 하나를 삭제해주세요.';return;}
  resetGameState();restartStudioIntro();
}

function statBar(key, label) {
  const max = statMaximum(key);
  const value = Math.max(0, Math.min(100, (game[key] / max) * 100));
  const isCondition = key === 'stress';
  return `<div class="stat-row"><span>${label}</span><div class="stat-track"><i class="${isCondition ? 'condition' : ''}" style="width:${value}%"></i></div><b>${game[key]}</b></div>`;
}

let activeScheduleCategory='교육',scheduleCursor=0,selectedScheduleAction=null;
function scheduleProjection(){
  let money=game.money,stress=game.stress;
  game.dailySchedule.forEach(id=>{const action=actions.find(item=>item.id===id);if(!action)return;money=Math.max(0,money-action.cost);stress=clampStat('stress',stress+(action.change.stress||0));});
  return {money,stress};
}
function renderSchedulePanel() {
  panelTitle.textContent = `${game.season} ${game.week}주 일정`;
  if (!Array.isArray(game.dailySchedule) || game.dailySchedule.length !== 7) game.dailySchedule = [null,null,null,null,null,null,null];
  game.dailySchedule=game.dailySchedule.map(id=>{const action=actions.find(item=>item.id===id);return action&&actionUnlocked(action)?id:null;});
  const dayNames = ['월','화','수','목','금','토','일'],start=game.currentDate?new Date(`${game.currentDate}T00:00:00`):null;
  const daySlots = game.dailySchedule.map((id,index) => {
    const action = actions.find(item => item.id === id);
    const date=start?new Date(start.getFullYear(),start.getMonth(),start.getDate()+index):null,dateLabel=date?`${date.getMonth()+1}/${date.getDate()}`:'';
    return `<button class="day-slot ${action ? 'filled' : ''} ${scheduleCursor===index?'selected':''}" data-day="${index}" aria-label="${dayNames[index]}요일 ${action ? action.name : '비어 있음'}"><b>${dayNames[index]}</b><small>${dateLabel}</small><span>${action ? action.name : '빈칸'}</span></button>`;
  }).join('');
  const categoryTabs=['교육','아르바이트','휴식'].map(category=>`<button data-schedule-category="${category}" class="${activeScheduleCategory===category?'on':''}">${category}</button>`).join('');
  const actionCards=actions.filter(action=>action.category===activeScheduleCategory&&actionUnlocked(action)).map(action=>{const progress=activityProgressFor(action.id),rank=activityRankNames[activityRank(action.id)],requirement=activityRequirements[action.id],price=action.category==='아르바이트'?`+${activityPay(action)}냥`:action.cost>0?`-${action.cost}냥`:'무료',detail=['교육','아르바이트'].includes(action.category)?`${rank} · 경험 ${progress.attempts}일 · 성공 ${progress.successes}일${requirement?` · 권장 ${requirement[0]} ${requirement[1]}`:''}`:'';return `<button class="action ${selectedScheduleAction===action.id?'selected':''}" data-action="${action.id}"><img src="../assets/ui/activity-icons/activity-${action.icon||action.id}.png" alt=""><b>${action.name}</b><span>${price}</span><small>${action.summary||'직접 방문하여 선택'}</small>${detail?`<em>${detail}</em>`:''}</button>`;}).join('');
  const projection=scheduleProjection(),filled=game.dailySchedule.filter(Boolean).length;
  panelBody.innerHTML = `<div class="schedule-adviser"><b>${game.guardianName||guardianDefs[game.guardianType]?.name||'신수'}의 일정 조언</b><p>${projection.stress>=80?'스트레스가 높아 휴식을 넣는 것이 좋겠어요.':filled===7?'일주일 준비가 끝났어요. 실행 전에 비용과 상태를 확인하세요.':'요일을 고른 뒤 활동을 넣어 주세요.'}</p></div><div class="day-grid">${daySlots}</div><div class="schedule-tabs" role="tablist">${categoryTabs}</div><section class="schedule-category"><div class="action-grid">${actionCards}</div></section><div class="schedule-tools"><button id="scheduleFillRemaining" ${selectedScheduleAction?'':'disabled'}>선택 활동으로 빈칸 채우기</button><button id="scheduleClearAll" ${filled?'':'disabled'}>전체 비우기</button></div>`;
  panelBody.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => addDailyAction(button.dataset.action)));
  panelBody.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => selectScheduleDay(Number(button.dataset.day))));
  panelBody.querySelectorAll('[data-schedule-category]').forEach(button=>button.addEventListener('click',()=>{activeScheduleCategory=button.dataset.scheduleCategory;renderSchedulePanel();}));
  document.querySelector('#scheduleFillRemaining').addEventListener('click',fillRemainingSchedule);
  document.querySelector('#scheduleClearAll').addEventListener('click',clearAllSchedule);
}

let scheduleConfirmDismissed = false;
function showScheduleConfirmation() {
  if (!game.dailySchedule.every(Boolean) || scheduleConfirmDismissed) return;
  document.querySelector('#scheduleConfirm').hidden = false;
}
function hideScheduleConfirmation() {
  document.querySelector('#scheduleConfirm').hidden = true;
}

function applyShopChanges(change){Object.entries(canonicalizeChange(change)).forEach(([key,value])=>{game[key]=clampStat(key,(game[key]||0)+value);});renderHud();queueAutoSave();}
let marketShoppingActive=false;
let marketMealConsumed=false;
let activeShopMarketMode=false;
let activeOutfitShopCategory='general';
function closeMarketUiForTransition(){
  document.querySelector('#outfitPreview')?.remove();
  document.querySelector('#marketConfirm').hidden=true;
  document.querySelector('#marketExplore').hidden=true;
  panel.hidden=true;marketSelection=null;
}
function returnToMarketSelection(){
  panel.hidden=true;
  const stage=document.querySelector('#activityStage');
  stage.hidden=false;
  stage.className='activity-stage market-choice-stage';
  document.querySelector('#marketExplore').hidden=false;
  document.querySelector('#stageCharacter').hidden=true;
  document.querySelector('#stageNpc').hidden=true;
  document.querySelector('#stageProps').hidden=true;
  selectMarketShop(null);
}
const isCashOutfit=outfit=>outfit.category==='cash'||outfit.tone==='캐시';
const isPremiumOutfit=outfit=>!isCashOutfit(outfit)&&(outfit.id.startsWith('premium-')||outfit.tone==='고급');
const outfitShopCategory=outfit=>isCashOutfit(outfit)?'cash':isPremiumOutfit(outfit)?'premium':'general';
function renderShopPanel(tab='food',marketMode=marketShoppingActive,outfitCategory='general'){
  normalizeInventory();
  activeShopMarketMode=marketMode;
  activeOutfitShopCategory=outfitCategory;
  panelTitle.textContent=tab==='food'?'저잣거리 · 주막':'저잣거리 · 한복점';
  const keeper=tab==='food'?{name:'주모',image:'../assets/characters/npcs/shops/tavern-hostess.png',greeting:'어서 오세요. 따뜻한 음식이 준비되어 있답니다.'}:{name:'한복점 주인',image:'../assets/characters/npcs/shops/hanbok-owner.png',greeting:'어서 오세요. 곱게 지은 한복을 천천히 살펴보세요.'};
  const owned=new Set(game.items.filter(item=>typeof item==='object').map(item=>item.id));
  const foodCards=foods.map(food=>`<button class="shop-card visual-card" data-food="${food.id}" ${game.money<food.price||marketMealConsumed?'disabled':''}><img src="../assets/items/food/${food.id}.png" alt="${food.name}"><b>${food.name}</b><span>${food.price}냥</span><small>${marketMealConsumed?'이번 방문에는 이미 식사했어요':`${food.detail}<br>${formatChanges(food.change)}`}</small></button>`).join('');
  const visibleOutfits=outfits.filter(outfit=>outfitShopCategory(outfit)===outfitCategory);
  const outfitCards=visibleOutfits.map(outfit=>{const premium=isPremiumOutfit(outfit),cash=isCashOutfit(outfit),available=outfitAvailable(outfit),insufficient=cash?game.cash<outfit.cashPrice:game.money<outfit.price,locked=!available||owned.has(outfit.id)||insufficient,displayAge=available?growthVisualAge():outfit.age;return `<button class="shop-card outfit-card visual-card ${available?'available':''} ${premium?'premium':''} ${cash?'cash':''} ${locked?'locked':''}" data-outfit-preview="${outfit.id}" aria-label="${outfit.name} 미리보기"><img src="${outfitImageForAge(outfit.id,displayAge)}" alt="${outfit.name}"><b>${outfit.name}</b><span>${cash?`${outfit.cashPrice.toLocaleString()}원`:`${outfit.price}냥`}</span><small>${cash?'캐시 의상 · ':premium?'고급 의상 · ':''}${outfitAgeLabel(outfit)} · ${outfit.seasons.join('·')}<br>${formatChanges(outfit.change)}${owned.has(outfit.id)?'<br>보유 중':''}</small></button>`;}).join('');
  const outfitCategoryTabs=tab==='outfit'?`<div class="outfit-shop-tabs" role="tablist" aria-label="의상 등급"><button data-outfit-category="general" class="${outfitCategory==='general'?'on':''}">일반 의상</button><button data-outfit-category="premium" class="${outfitCategory==='premium'?'on':''}">고급 의상</button><button data-outfit-category="cash" class="${outfitCategory==='cash'?'on':''}">캐시 의상</button></div>`:'';
  const categoryName={general:'일반',premium:'고급',cash:'캐시'}[outfitCategory]||'일반';
  panelBody.innerHTML=`<div class="shop-greeting"><img src="${keeper.image}" alt="${keeper.name}"><div><b>${keeper.name}</b><p>${keeper.greeting}</p></div></div><div class="shop-money"><span>보유 은전 <b>${game.money.toLocaleString()}냥</b></span><span>테스트 캐시 <b>${game.cash.toLocaleString()}원</b></span></div>${marketMode?'':`<div class="shop-tabs"><button data-shop-tab="food" class="${tab==='food'?'on':''}">주막</button><button data-shop-tab="outfit" class="${tab==='outfit'?'on':''}">한복점</button></div>`}${outfitCategoryTabs}<h3 class="shop-list-title">${tab==='food'?`음식 메뉴 · ${foods.length}종`:`${categoryName} 의상 · ${visibleOutfits.length}벌`}</h3><div class="shop-grid">${tab==='food'?foodCards:outfitCards}</div><button id="shopBack">${marketMode?'저잣거리로 나가기':'일정으로 돌아가기'}</button>`;
  if(!marketMode)panelBody.querySelectorAll('[data-shop-tab]').forEach(button=>button.addEventListener('click',()=>renderShopPanel(button.dataset.shopTab,marketMode)));
  panelBody.querySelectorAll('[data-outfit-category]').forEach(button=>button.addEventListener('click',()=>renderShopPanel('outfit',marketMode,button.dataset.outfitCategory)));
  panelBody.querySelectorAll('[data-food]').forEach(button=>button.addEventListener('click',()=>buyFood(button.dataset.food)));
  panelBody.querySelectorAll('[data-outfit-preview]').forEach(button=>button.addEventListener('click',()=>showOutfitPreview(button.dataset.outfitPreview)));
  document.querySelector('#shopBack').addEventListener('click',()=>{if(marketMode)returnToMarketSelection();else renderSchedulePanel();});
}
function formatChanges(change){return orderedChangeEntries(change).map(([key,value])=>`${statLabels[key]||key} ${value>0?'+':''}${value}`).join(' · ');}
function showOutfitPreview(id){
  const outfit=outfits.find(item=>item.id===id);if(!outfit)return;
  normalizeInventory();
  const owned=game.items.some(item=>item.type==='outfit'&&item.id===id),cash=isCashOutfit(outfit),ageLocked=!outfitAvailable(outfit),insufficient=cash?game.cash<outfit.cashPrice:game.money<outfit.price;
  const previewGrowthAge=outfitAvailable(outfit)?growthVisualAge():outfit.age;
  const agePreview=cash?`<div class="cash-age-preview" role="group" aria-label="연령별 의상 미리보기"><span>연령별 모습</span><div>${[9,13,16,19].map(age=>`<button type="button" data-cash-preview-age="${age}" class="${age===previewGrowthAge?'on':''}" aria-pressed="${age===previewGrowthAge}">${age}세</button>`).join('')}</div></div>`:'';
  const reason=owned?'이미 구매한 의상입니다.':ageLocked?`${outfitAgeLabel(outfit)}에 구매할 수 있습니다.`:insufficient?`보유 ${cash?'캐시':'은전'}가 부족합니다.`:cash?'테스트 캐시로 구매할 수 있습니다.':'미리 입어본 뒤 구매할 수 있습니다.';
  const grade=cash?'캐시 의상':isPremiumOutfit(outfit)?'고급 의상':'일반 의상';
  panelBody.insertAdjacentHTML('beforeend',`<div class="outfit-preview-backdrop" id="outfitPreview"><section class="outfit-preview-card ${cash?'cash-preview':''}" role="dialog" aria-modal="true" aria-label="${outfit.name} 미리보기"><button class="outfit-preview-close" id="outfitPreviewClose" aria-label="미리보기 닫기">×</button><div class="outfit-preview-image"><img id="outfitPreviewImage" src="${outfitImageForAge(outfit.id,previewGrowthAge)}" alt="${previewGrowthAge}세 ${outfit.name} 전신 미리보기"></div><div class="outfit-preview-info"><small>${grade}</small><h3>${outfit.name}</h3><p>${outfitAgeLabel(outfit)} · ${outfit.seasons.join('·')}<br>${formatChanges(outfit.change)}</p>${agePreview}<b>${cash?`${outfit.cashPrice.toLocaleString()}원`:`${outfit.price.toLocaleString()}냥`}</b><em>${reason}</em><button id="outfitPreviewBuy" ${owned||ageLocked||insufficient?'disabled':''}>${owned?'구매 완료':cash?'테스트 캐시로 구매하기':'이 의상 구매하기'}</button></div></section></div>`);
  document.querySelector('#outfitPreviewClose').addEventListener('click',()=>document.querySelector('#outfitPreview')?.remove());
  document.querySelector('#outfitPreview').addEventListener('click',event=>{if(event.target.id==='outfitPreview')event.currentTarget.remove();});
  document.querySelectorAll('[data-cash-preview-age]').forEach(button=>button.addEventListener('click',()=>{
    const age=Number(button.dataset.cashPreviewAge),image=document.querySelector('#outfitPreviewImage');image.src=outfitImageForAge(outfit.id,age);image.alt=`${age}세 ${outfit.name} 전신 미리보기`;
    document.querySelectorAll('[data-cash-preview-age]').forEach(item=>{const selected=item===button;item.classList.toggle('on',selected);item.setAttribute('aria-pressed',String(selected));});
  }));
  document.querySelector('#outfitPreviewBuy').addEventListener('click',()=>buyOutfit(id));
}
async function buyFood(id){const food=foods.find(item=>item.id===id);if(!food||game.money<food.price||marketMealConsumed)return;marketMealConsumed=true;panel.hidden=true;const stage=document.querySelector('#activityStage'),image=document.querySelector('#stageCharacterImage'),character=document.querySelector('#stageCharacter');document.querySelector('#marketExplore').hidden=true;stage.hidden=false;stage.className='activity-stage map-restRoom eating-stage';document.querySelector('#stageMap').src=backgrounds.restRoom;document.querySelector('#stageNpc').hidden=true;document.querySelector('#stageProps').hidden=true;document.querySelector('#stageCaption').textContent=`주막 · ${food.name}`;character.hidden=false;character.className='stage-character pixel-sprite motion-eating';for(const n of [1,2,3,2,1,2,3]){image.src=await outfitActivityFrame(`../assets/characters/seonhwa/age-09/sprites/activities/eating-${n}.png`,game.equippedOutfit);await new Promise(r=>setTimeout(r,320));}stage.hidden=true;game.money-=food.price;applyShopChanges(food.change);document.querySelector('#dialogueText').textContent=`주막에서 ${food.name}을(를) 맛있게 먹었어요. 이번 저잣거리 방문의 식사는 끝났어요.`;showLiveChanges({change:food.change,cost:food.price});panel.hidden=false;renderShopPanel('food',true);queueAutoSave();}
function buyOutfit(id){normalizeInventory();const outfit=outfits.find(item=>item.id===id);if(!outfit||!outfitAvailable(outfit))return;const cash=isCashOutfit(outfit);if(cash?game.cash<outfit.cashPrice:game.money<outfit.price)return;if(game.items.some(item=>item.type==='outfit'&&item.id===id)){document.querySelector('#dialogueText').textContent=`${outfit.name}은(는) 이미 보유하고 있어요.`;renderShopPanel('outfit',activeShopMarketMode,activeOutfitShopCategory);return;}if(cash)game.cash-=outfit.cashPrice;else game.money-=outfit.price;game.items.push({id:outfit.id,type:'outfit',name:outfit.name,age:outfit.age,ageEnd:outfit.ageEnd,tone:outfit.tone,seasons:outfit.seasons,qty:1});game.equippedOutfit=id;applyEquippedOutfit();applyShopChanges(outfit.change);document.querySelector('#dialogueText').textContent=`${outfit.name}을(를) 구입하고 갈아입었어요.`;if(!cash)showLiveChanges({change:outfit.change,cost:outfit.price});renderHud();renderShopPanel('outfit',activeShopMarketMode,activeOutfitShopCategory);queueAutoSave();}

const marketPlaces=[
  {id:'food',side:-1,label:'주막'},
  {id:'outfit',side:1,label:'한복점'}
  // 추후 {id:'pub',side:-2,label:'주점'}, {id:'gift',side:2,label:'선물가게'} 추가 가능
];
let marketSelection=null,marketResolve=null;
function finishMarket(){
  if(typeof marketResolve!=='function')return;
  const resolve=marketResolve;
  marketResolve=null;
  closeMarketUiForTransition();
  resolve();
}
function selectMarketShop(type){
  marketSelection=type;
  const place=marketPlaces.find(item=>item.id===type);
  const enter=document.querySelector('#marketEnter');
  enter.disabled=!place;enter.dataset.shop=type||'';enter.textContent=place?`${place.label}으로 다음`:'다음';
  document.querySelector('#marketExplore').classList.toggle('has-selection',Boolean(place));
  document.querySelectorAll('[data-market-shop]').forEach(shop=>{
    const selected=shop.dataset.marketShop===type;shop.classList.toggle('selected',selected);shop.setAttribute('aria-pressed',String(selected));
  });
}
function askMarketShop(type){
  const place=marketPlaces.find(item=>item.id===type);
  if(!place)return;
  selectMarketShop(type);
  document.querySelector('#marketConfirmText').textContent=type==='food'?'주모를 선택하시겠습니까?':'한복점 주인을 선택하시겠습니까?';
  document.querySelector('#marketConfirm').hidden=false;
}
function closeMarketConfirm(){document.querySelector('#marketConfirm').hidden=true;selectMarketShop(null);}
function exploreMarket(){
  const explore=document.querySelector('#marketExplore'),stage=document.querySelector('#activityStage');document.querySelector('.phone').classList.add('market-playing');stage.classList.add('market-choice-stage');explore.hidden=false;document.querySelector('#marketConfirm').hidden=true;document.querySelector('#stageCharacter').hidden=true;document.querySelector('#stageNpc').hidden=true;document.querySelector('#stageProps').hidden=true;marketMealConsumed=false;marketSelection=null;selectMarketShop(null);
  return new Promise(resolve=>{marketResolve=()=>{document.querySelector('.phone').classList.remove('market-playing');explore.hidden=true;document.querySelector('#stageCharacter').hidden=false;document.querySelector('#stageProps').hidden=false;resolve();};});
}
function enterMarketShop(type){if(!type)return;const place=marketPlaces.find(item=>item.id===type);document.querySelector('#dialogueText').textContent=`${place?.label||'가게'} 주인이 “어서 오세요.” 하고 반겨요.`;document.querySelector('#marketExplore').hidden=true;document.querySelector('#activityStage').hidden=true;panel.hidden=false;renderShopPanel(type,true);}

function addDailyAction(id) {
  const chosenAction=actions.find(action=>action.id===id);
  if(!chosenAction||!actionUnlocked(chosenAction))return;
  const empty=game.dailySchedule.indexOf(null),target=game.dailySchedule[scheduleCursor]?scheduleCursor:(scheduleCursor>=0?scheduleCursor:empty);
  if (empty === -1&&target<0) {
    document.querySelector('#dialogueText').textContent = '7일 일정이 모두 찼어요. 요일 칸을 눌러 수정하세요.';
    return;
  }
  const index=target>=0?target:empty;game.dailySchedule[index]=id;selectedScheduleAction=id;
  if(chosenAction.intro&&!game.activityUnlocksSeen.includes(id)){
    game.activityUnlocksSeen.push(id);document.querySelector('#speakerName').textContent=chosenAction.mentor;document.querySelector('#dialogueText').textContent=chosenAction.intro;
  }else document.querySelector('#dialogueText').textContent = `${['월','화','수','목','금','토','일'][index]}요일에 ${chosenAction.name}을 넣었어요.`;
  const nextEmpty=game.dailySchedule.findIndex((item,nextIndex)=>!item&&nextIndex>index);scheduleCursor=nextEmpty>=0?nextEmpty:game.dailySchedule.indexOf(null);
  scheduleConfirmDismissed = false;
  renderSchedulePanel();
  if (game.dailySchedule.every(Boolean)) showScheduleConfirmation();
  queueAutoSave();
}

function selectScheduleDay(index){
  scheduleCursor=index;
  if(game.dailySchedule[index]){game.dailySchedule[index]=null;scheduleConfirmDismissed=false;hideScheduleConfirmation();document.querySelector('#dialogueText').textContent=`${['월','화','수','목','금','토','일'][index]}요일 일정을 비웠어요.`;}
  renderSchedulePanel();queueAutoSave();
}
function fillRemainingSchedule(){
  const action=actions.find(item=>item.id===selectedScheduleAction);if(!action||!actionUnlocked(action))return;
  game.dailySchedule=game.dailySchedule.map(id=>id||selectedScheduleAction);scheduleCursor=-1;scheduleConfirmDismissed=false;renderSchedulePanel();showScheduleConfirmation();queueAutoSave();
}
function clearAllSchedule(){game.dailySchedule=[null,null,null,null,null,null,null];scheduleCursor=0;selectedScheduleAction=null;scheduleConfirmDismissed=false;hideScheduleConfirmation();renderSchedulePanel();queueAutoSave();}

function clearDailyAction(index) {
  if (!game.dailySchedule[index]) return;
  game.dailySchedule[index] = null;
  scheduleConfirmDismissed = false;
  hideScheduleConfirmation();
  renderSchedulePanel();
  queueAutoSave();
}

function createMonthlyLedger(year,month){return {year,month,income:0,expense:0,activities:{},change:{}};}
function recordMonthlySchedule(dayRecords){
  const completed=[];
  dayRecords.forEach(record=>{
    const date=new Date(`${record.date}T00:00:00`),year=date.getFullYear(),month=date.getMonth()+1;
    if(!game.monthlyLedger)game.monthlyLedger=createMonthlyLedger(year,month);
    if(game.monthlyLedger.year!==year||game.monthlyLedger.month!==month){completed.push(game.monthlyLedger);game.monthlyLedger=createMonthlyLedger(year,month);}
    game.monthlyLedger.activities[record.action.name]=(game.monthlyLedger.activities[record.action.name]||0)+1;
    if(record.action.cost>0)game.monthlyLedger.expense+=record.action.cost;
    if(record.action.cost<0)game.monthlyLedger.income+=-record.action.cost;
    Object.entries(record.actualChange).forEach(([key,value])=>game.monthlyLedger.change[key]=(game.monthlyLedger.change[key]||0)+value);
  });
  return completed;
}
function daysUntilEnding(){
  if(!game.currentDate||!game.endingDate)return 7;
  const current=new Date(`${game.currentDate}T00:00:00`),ending=new Date(`${game.endingDate}T00:00:00`);
  return Math.max(0,Math.ceil((ending-current)/86400000));
}
function showMonthlyReport(ledger){
  panel.hidden=false;panelTitle.textContent=`${ledger.year}년 ${ledger.month}월 결산`;
  const activityRows=Object.entries(ledger.activities).sort((a,b)=>b[1]-a[1]).map(([name,count])=>`<li><span>${name}</span><b>${count}일</b></li>`).join('');
  const statRows=Object.entries(ledger.change).filter(([key,value])=>key!=='fatigue'&&value!==0).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).map(([key,value])=>`<li><span>${statLabels[key]||key}</span><b class="${key==='stress'?value<0?'good':'bad':value>0?'good':'bad'}">${value>0?'+':''}${value}</b></li>`).join('');
  const net=ledger.income-ledger.expense;
  const condition=game.stress>=75?'스트레스가 높아요. 다음 달에는 휴식이 필요해요.':game.stress>=50?'마음이 조금 무겁지만 잘 버텼어요.':'좋은 컨디션으로 한 달을 마쳤어요.';
  panelBody.innerHTML=`<section class="monthly-balance"><div><span>수입</span><b>+${ledger.income.toLocaleString()}냥</b></div><div><span>지출</span><b>-${ledger.expense.toLocaleString()}냥</b></div><div class="net"><span>합계</span><b class="${net>=0?'good':'bad'}">${net>=0?'+':''}${net.toLocaleString()}냥</b></div></section><section class="monthly-report-section"><h3>이번 달 활동</h3><ul>${activityRows||'<li>기록 없음</li>'}</ul></section><section class="monthly-report-section"><h3>능력치 변화</h3><ul>${statRows||'<li>변화 없음</li>'}</ul></section><p class="monthly-condition">${condition}</p><button id="closeMonthlyReport" class="monthly-continue">다음 달 시작</button>`;
  document.querySelector('#closeMonthlyReport').addEventListener('click',()=>{panel.hidden=true;document.querySelector('#dialogueText').textContent=`${game.month}월도 함께 힘내 보아요.`;openVisitingMerchant();});
}

async function runWeek() {
  if (!game.dailySchedule.every(Boolean)) return;
  hideScheduleConfirmation();
  const scheduled = game.dailySchedule.map(id => actions.find(item => item.id === id));
  const playableDays=Math.min(7,daysUntilEnding());
  const selected = scheduled.slice(0,playableDays);
  if(selected.length===0){game.ended=true;showEnding();return;}
  let projectedMoney=game.money;
  const unaffordable=selected.find(action=>{projectedMoney-=action.cost;return projectedMoney<0;});
  if (unaffordable) {
    document.querySelector('#dialogueText').textContent = `${unaffordable.name}을(를) 진행할 은전이 부족해요. 돈이 0냥 아래로 내려가지 않도록 일정을 다시 짜보자.`;
    panel.hidden = true;
    return;
  }
  const completedWeek = game.week;
  panel.hidden = true;
  const playbackResult = await playWeeklySchedule(selected);
  const completedLedgers=recordMonthlySchedule(playbackResult.dayRecords);
  game.homeReaction=null;
  const birthdayEvents=advanceGameDate(selected.length);
  const completedLedger=completedLedgers[0]||null;
  const counts = selected.reduce((map, action) => (map[action.name]=(map[action.name]||0)+1,map),{});
  const summary = Object.entries(counts).map(([name,count]) => count > 1 ? `${name} ${count}일` : name).join(' · ');
  document.querySelector('#dialogueText').textContent = birthdayEvents.length?birthdayEvents.map(event=>event.message).join(' '):(game.ended?`마지막 ${selected.length}일 일정(${summary})을 마쳤어요.`:`${completedWeek}주 일정(${summary})을 마쳤어요.`);
  if(birthdayEvents.length){const birthdayChange={};birthdayEvents.forEach(event=>Object.entries(event.change).forEach(([key,value])=>birthdayChange[key]=(birthdayChange[key]||0)+value));showLiveChanges({change:birthdayChange,cost:0});}
  game.dailySchedule = [null,null,null,null,null,null,null];
  bg.src = backgrounds.home;
  playHomeMusic();
  applyEquippedOutfit();
  renderHud();
  panel.hidden = true;
  rollVisitingMerchant();
  if (game.ended) showEnding();
  else if(completedLedger)showMonthlyReport(completedLedger);
  else openVisitingMerchant();
  clearTimeout(autoSaveTimer);
  writeLatestAutoSave();
}

function isoDate(date){ const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
function addYears(date, years){ const next=new Date(date); next.setFullYear(next.getFullYear()+years); return next; }
const startingBirthdayGifts=[
  {id:'birthday-calligraphy-set',name:'작은 붓과 벼루',change:{intelligence:6,sensitivity:3}},
  {id:'birthday-silk-ribbon',name:'비단 댕기',change:{charm:6,dignity:3}},
  {id:'birthday-training-bow',name:'작은 연습 활',change:{agility:5,strength:4}},
  {id:'birthday-etiquette-book',name:'예절 이야기책',change:{manners:6,mentality:3}},
  {id:'birthday-herb-pouch',name:'향긋한 약초 주머니',change:{health:5,sense:4}}
];
function applyStatChange(change){const actual={};Object.entries(canonicalizeChange(change)).forEach(([key,value])=>{const before=clampStat(key,game[key]);game[key]=clampStat(key,before+value);actual[key]=game[key]-before;});return actual;}
function awardStartingBirthdayGift(){
  if(game.startingGiftId)return startingBirthdayGifts.find(gift=>gift.id===game.startingGiftId)||null;
  const guardian=guardianDefs[game.guardianType],base=guardian?.gift||startingBirthdayGifts[Math.floor(Math.random()*startingBirthdayGifts.length)];
  const gift={id:`guardian-${game.guardianType||'gift'}-age09`,name:base.name,change:{...base.change}};
  gift.actualChange=applyStatChange(gift.change);game.startingGiftId=gift.id;
  game.items.push({id:gift.id,type:'event',name:gift.name,description:'아홉 번째 생일에 수호신수와 인연을 맺으며 받은 첫 축복',qty:1,source:'guardian-birthday'});
  return gift;
}
function awardFatherBirthdayGift(age){
  if(!Array.isArray(game.fatherBirthdayYears))game.fatherBirthdayYears=[];
  if(game.fatherBirthdayYears.includes(age))return null;
  const stressDrop=4+Math.floor(Math.random()*7),affinityGain=2+Math.floor(Math.random()*4),change=applyStatChange({stress:-stressDrop,fatherAffinity:affinityGain});
  game.fatherBirthdayYears.push(age);game.birthdayCount=game.fatherBirthdayYears.length;
  game.items.push({id:`father-birthday-letter-${age}`,type:'event',name:`아버지의 ${age}세 생일 선물`,description:'멀리 있는 아버지가 보낸 편지와 작은 선물',qty:1,source:'father-birthday'});
  return {age,change,message:`${age}세 생일을 맞아 아버지의 편지와 선물이 도착했어요. ${formatChanges(change)}`};
}
function syncBirthdaySelectors(reset=false){
  const year=document.querySelector('#birthdayYear'),month=document.querySelector('#birthdayMonth'),day=document.querySelector('#birthdayDay'),input=document.querySelector('#birthdayInput');
  if(!year||!month||!day||!input)return;
  if(!month.options.length)for(let value=1;value<=12;value+=1)month.add(new Option(`${value}월`,String(value)));
  if(reset){year.value='1990';month.value='1';day.innerHTML='';}
  const selectedMonth=Math.max(1,Math.min(12,Number(month.value)||1)),lastDay=new Date(1990,selectedMonth,0).getDate(),selectedDay=Math.max(1,Math.min(lastDay,Number(day.value)||1));
  day.innerHTML='';for(let value=1;value<=lastDay;value+=1)day.add(new Option(`${value}일`,String(value)));
  day.value=String(selectedDay);year.value='1990';input.value=`1990-${String(selectedMonth).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`;
}
function enforceBirthday1990(){syncBirthdaySelectors();}
function startWithBirthday(){
  enforceBirthday1990();
  const value=document.querySelector('#birthdayInput').value;
  const characterName=document.querySelector('#characterNameInput').value.trim();
  if(!characterName){document.querySelector('#birthdayTitle').textContent='아이의 이름을 지어주세요';return;}
  if(value<'1990-01-01'||value>'1990-12-31') return;
  const profileSlot=game.profileSlot||SAVE_SLOTS.find(slot=>!readSave(slot));
  if(!profileSlot){document.querySelector('#birthdayTitle').textContent='동시에 키울 수 있는 다섯 명의 기록이 모두 찼어요';return;}
  const birth=new Date(`${value}T00:00:00`);
  const start=addYears(birth,9);
  const ending=addYears(birth,19); ending.setDate(ending.getDate()+1);
  const month=birth.getMonth()+1; const birthSeason=seasonForMonth(month); const element=['금','수','목','화','토'][(birth.getMonth()+birth.getDate())%5];
  Object.assign(game,{characterName,guardianType:null,guardianName:'',nannyName:'',profileSlot,birthday:value,currentDate:isoDate(start),endingDate:isoDate(ending),age:9,height:130,weight:28.5,month,season:birthSeason,birthSeason,element,week:Math.floor((start.getDate()-1)/7)+1,ended:false,endingResult:null,birthdayCount:0,fatherBirthdayYears:[],fatherAffinity:0,startingGiftId:null});
  game.monthlyLedger=createMonthlyLedger(start.getFullYear(),month);
  document.querySelector('#birthdaySetup').hidden=true;
  guardianStoryIndex=0;showGuardianStory();
}
function showGuardianStory(){
  const story=document.querySelector('#guardianStory'),scene=guardianStoryScenes[guardianStoryIndex],copy=story.querySelector('.guardian-story-copy'),image=document.querySelector('#guardianStoryImage'),next=document.querySelector('#guardianStoryNext');
  story.hidden=false;story.classList.add('group-scene');story.dataset.effect=scene.effect;image.src=scene.image;image.alt=scene.alt;next.hidden=true;next.disabled=true;next.textContent='신수 선택하기';copy.classList.remove('is-changing');
  guardianCinematicTimeline=[
    {phase:'arrival',chapter:'첫 장 · 하늘이 내린 벗',text:'아홉 번째 생일 밤, 고요하던 마당 위로 네 갈래의 별빛이 열렸습니다.'},
    {phase:'child',chapter:'아이 · 올려다보다',text:'아이는 놀란 숨을 삼키고, 밤하늘을 가득 메운 존재들을 올려다보았습니다.'},
    {phase:'hyeonmu',chapter:'북쪽 · 현무',text:'가장 높은 구름 위에서 현무가 천천히 고개를 들었습니다. “흔들리지 않는 마음을 지켜 주마.”',cue:'water'},
    {phase:'cheongryong',chapter:'동쪽 · 청룡',text:'푸른 구름이 갈라지며 청룡이 몸을 일으켰습니다. “배움과 술법의 길을 밝혀 주마.”',cue:'cloud'},
    {phase:'baekho',chapter:'서쪽 · 백호',text:'백호는 아이와 눈을 맞추고 조용히 앞발을 내디뎠습니다. “두려움에 맞설 용기를 주마.”',cue:'mountain'},
    {phase:'jujak',chapter:'남쪽 · 주작',text:'주작이 붉은 날개를 펼치자 따뜻한 불빛이 마당에 번졌습니다. “상처를 보듬고 인연을 이어 주마.”',cue:'embers'},
    {phase:'convergence',chapter:'네 갈래의 빛',text:'네 신수의 빛이 아이 앞에 모였습니다. 하늘은 아이가 고를 단 하나의 인연을 기다렸습니다.',cue:'constellation'},
    {phase:'choice',chapter:'선택 · 한 벗과의 인연',text:'네 앞날을 함께할 한 벗을 고르거라.',ready:true}
  ];
  guardianCinematicBeat=0;renderGuardianCinematicBeat();
}
function renderGuardianCinematicBeat(){const story=document.querySelector('#guardianStory'),beat=guardianCinematicTimeline[guardianCinematicBeat],next=document.querySelector('#guardianStoryNext'),hint=document.querySelector('#guardianStoryHint');if(!beat)return;story.dataset.phase=beat.phase;document.querySelector('#guardianStoryChapter').textContent=beat.chapter;document.querySelector('#guardianStoryText').textContent=beat.text;if(beat.cue)playGuardianCinematicCue(beat.cue);next.hidden=!beat.ready;next.disabled=!beat.ready;hint.hidden=Boolean(beat.ready);guardianInputLockedUntil=Date.now()+450;}
function playGuardianCinematicCue(effect){
  if(!userSettings.sfxEnabled||!prologueSoundOn)return;const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
  const ctx=new AudioContext(),osc=ctx.createOscillator(),gain=ctx.createGain(),filter=ctx.createBiquadFilter(),frequency={cloud:380,mountain:170,embers:520,water:230,constellation:440}[effect]||320;osc.type=effect==='embers'?'triangle':'sine';osc.frequency.setValueAtTime(frequency,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(frequency*1.35,ctx.currentTime+.55);filter.type='lowpass';filter.frequency.value=1400;gain.gain.setValueAtTime(.001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(Math.max(.001,scaledVolume(.11,'sfx')),ctx.currentTime+.08);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.72);osc.connect(filter).connect(gain).connect(ctx.destination);osc.onended=()=>ctx.close().catch(()=>{});osc.start();osc.stop(ctx.currentTime+.75);
}
function nextGuardianStory(){const now=Date.now();if(now<guardianInputLockedUntil)return;if(guardianCinematicBeat<guardianCinematicTimeline.length-1){guardianCinematicBeat+=1;renderGuardianCinematicBeat();return;}guardianInputLockedUntil=now+550;document.querySelector('#guardianStory').hidden=true;document.querySelector('#guardianChoice').hidden=false;}
function chooseGuardian(type){if(!guardianDefs[type])return;selectedGuardianType=type;document.querySelectorAll('[data-guardian]').forEach(button=>button.classList.toggle('selected',button.dataset.guardian===type));const confirm=document.querySelector('#guardianChoiceConfirm');confirm.disabled=false;confirm.textContent=`${guardianDefs[type].name}과 인연 맺기`;}
function confirmGuardianChoice(){const guardian=guardianDefs[selectedGuardianType];if(!guardian)return;document.querySelector('#guardianChoice').hidden=true;document.querySelector('#guardianNameSetup').hidden=false;document.querySelector('#guardianNameMark').textContent=guardian.mark;document.querySelector('#guardianNameMark').style.background=guardian.theme;document.querySelector('#guardianNameDescription').textContent=guardian.intro;document.querySelector('#guardianNameInput').focus();}
function finishGuardianNaming(){
  const guardian=guardianDefs[selectedGuardianType],guardianName=document.querySelector('#guardianNameInput').value.trim();
  if(!guardian||!guardianName){document.querySelector('#guardianNameTitle').textContent='신수의 이름을 지어주세요';return;}
  Object.assign(game,{guardianType:selectedGuardianType,guardianName,nannyName:guardianName,nannyAffinity:50,guardianTrust:50});
  const guardianGift=awardStartingBirthdayGift(),fatherGift=awardFatherBirthdayGift(9);game.lastGreetingDate=game.currentDate;
  document.querySelector('#guardianNameSetup').hidden=true;panel.hidden=true;transitionPrologueToHomeMusic();
  const startingChanges={...(guardianGift?.actualChange||{})};Object.entries(fatherGift?.change||{}).forEach(([key,value])=>startingChanges[key]=(startingChanges[key]||0)+value);
  showLiveChanges({change:startingChanges,cost:0});renderHud();
  startIntroDialogue([
    {speaker:guardianName,line:`${game.characterName}, 네가 부른 이 이름을 소중히 간직하겠다.`},
    {speaker:guardianName,line:'오늘부터 네 일정과 마음의 변화를 곁에서 살피마.'},
    {speaker:guardianName,line:`첫 인연의 증표로 「${guardianGift.name}」의 축복을 건네겠다.`},
    {speaker:guardianName,line:fatherGift.message},
    {speaker:guardianName,line:'이제 첫 일주일의 계획을 함께 세워 보자.'}
  ]);
  queueAutoSave();
}
function reselectGuardian(){document.querySelector('#guardianNameSetup').hidden=true;document.querySelector('#guardianChoice').hidden=false;document.querySelector('#guardianNameInput').value='';}
function startIntroDialogue(lines){introDialogueQueue=lines;introDialogueIndex=0;document.querySelector('.dialogue').classList.add('tap-continue');renderIntroDialogue();}
function renderIntroDialogue(){const scene=introDialogueQueue[introDialogueIndex];if(!scene){document.querySelector('.dialogue').classList.remove('tap-continue');return;}document.querySelector('#speakerName').textContent=scene.speaker;document.querySelector('#dialogueText').textContent=scene.line;}
function advanceIntroDialogue(){if(!introDialogueQueue.length)return;introDialogueIndex+=1;if(introDialogueIndex>=introDialogueQueue.length){introDialogueQueue=[];introDialogueIndex=0;document.querySelector('.dialogue').classList.remove('tap-continue');document.querySelector('#speakerName').textContent=game.guardianName;document.querySelector('#dialogueText').textContent='아래의 일정 버튼을 눌러 첫 주를 계획해 보자.';return;}renderIntroDialogue();}
function advanceGameDate(days){
  if(!game.currentDate)return [];
  const previousAge=game.age;
  const previousDate=new Date(`${game.currentDate}T00:00:00`),date=new Date(previousDate); date.setDate(date.getDate()+days);
  const ending=new Date(`${game.endingDate}T00:00:00`);
  if(date>=ending){ date.setTime(ending.getTime()); game.ended=true; }
  game.currentDate=isoDate(date); game.month=date.getMonth()+1; game.season=seasonForMonth(game.month); game.week=Math.floor((date.getDate()-1)/7)+1;
  const birth=new Date(`${game.birthday}T00:00:00`); game.age=date.getFullYear()-birth.getFullYear()-((date.getMonth()<birth.getMonth()||(date.getMonth()===birth.getMonth()&&date.getDate()<birth.getDate()))?1:0);
  applyAgeGrowth(previousAge,game.age);
  const birthdayEvents=[];
  for(let age=Math.max(9,previousAge);age<=game.age;age+=1){const birthdayDate=addYears(birth,age);if(birthdayDate>previousDate&&birthdayDate<=date){const gift=awardFatherBirthdayGift(age);if(gift)birthdayEvents.push(gift);}}
  const unlocked=newlyUnlockedActions(previousAge,game.age);
  if(unlocked.length)birthdayEvents.push({message:`${game.age}세가 되어 새로운 활동이 열렸어요: ${unlocked.map(action=>action.name).join(' · ')}`,change:{}});
  if(game.autoOutfit)updateAutoOutfit();
  return birthdayEvents;
}
function seasonForMonth(month){ return month>=3&&month<=5?'봄':month>=6&&month<=8?'여름':month>=9&&month<=11?'가을':'겨울'; }
function showEnding(){
  if(!game.endingResult)game.endingResult=resolveEnding();
  const result=game.endingResult;
  const categoryLabel={relation:'인연 엔딩',career:'직업 엔딩',downfall:'몰락 엔딩'}[result.category];
  const partner=result.partnerName?`<div><small>함께한 인연</small><b>${result.partnerName} · ${result.partnerRole}</b></div>`:'';
  panel.hidden=false; panelTitle.textContent=`${game.characterName || '아이'}의 성장 기록`;
  panelBody.innerHTML=`<div class="ending-card ${result.category}"><small class="ending-date">마지막 생일 다음 날 · ${game.currentDate}</small><em>${categoryLabel}</em><h2>${result.title}</h2><p class="ending-lead">${result.description}</p><section class="ending-summary">${result.category==='relation'?`<div><small>성장한 직업 성향</small><b>${result.careerTitle}</b></div>`:''}${partner}<div><small>대표 능력</small><b>${result.strongest.map(stat=>`${stat.label} ${stat.value}`).join(' · ')}</b></div><div><small>바캉스 수집</small><b>${result.collectionCount} / ${result.collectionTotal}</b></div><div><small>마지막 은전</small><b>${Math.max(0,game.money).toLocaleString()}냥</b></div></section><button id="endingRestart">새로운 생일로 시작</button></div>`;
  document.querySelector('#endingRestart').addEventListener('click',beginNewGrowth);
}
function updatePrologueCopy(scene,index){
  const copy=document.querySelector('.prologue-copy');
  document.querySelector('#prologueChapter').textContent=scene.id?`서장 ${scene.id} · ${scene.chapter}`:scene.chapter;
  document.querySelector('#prologueText').innerHTML=`${scene.text}${scene.dialogue?`<br><em>${scene.dialogue}</em>`:''}`;
  document.querySelector('#prologueProgress').innerHTML=prologueScenes.map((_,i)=>`<i class="${i===index?'on':''}"></i>`).join('');
  document.querySelector('#prologueBack').disabled=index===0;
  document.querySelector('#prologueNext').textContent=index===prologueScenes.length-1?'이름 정하기':'다음';
  requestAnimationFrame(()=>copy.classList.remove('is-changing'));
}
function renderPrologue(){
  const scene=prologueScenes[prologueIndex],index=prologueIndex,wrap=document.querySelector('#prologue'),copy=document.querySelector('.prologue-copy');
  const images=[document.querySelector('#prologueImage'),document.querySelector('#prologueImageNext')],current=images[prologueImageLayer],incoming=images[1-prologueImageLayer],renderId=++prologueRenderId;
  wrap.hidden=false;wrap.classList.toggle('outdoor-rain',Boolean(scene.rain));wrap.classList.toggle('indoor-scene',!scene.rain);wrap.dataset.scene=scene.id||`S${index+1}`;clearTimeout(prologueTimer);updatePrologueAudio(Boolean(scene.rain));
  if(current.getAttribute('src')===scene.image){current.classList.add('active');updatePrologueCopy(scene,index);}
  else{
    copy.classList.add('is-changing');incoming.src=scene.image;incoming.alt=scene.alt;
    const reveal=()=>{if(renderId!==prologueRenderId)return;incoming.classList.add('active');current.classList.remove('active');prologueImageLayer=1-prologueImageLayer;updatePrologueCopy(scene,index);};
    if(incoming.complete)Promise.resolve(incoming.decode?.()).catch(()=>{}).finally(reveal);else incoming.addEventListener('load',reveal,{once:true});
  }
  prologueTimer=setTimeout(nextPrologue,8500);
}
function nextPrologue(){ if(prologueIndex<prologueScenes.length-1){prologueIndex++;renderPrologue();}else closePrologue(); }
function previousPrologue(){ if(prologueIndex>0){prologueIndex--;renderPrologue();} }
function closePrologue(){clearTimeout(prologueTimer);stopRain();document.querySelector('#prologue').hidden=true;document.querySelector('#birthdaySetup').hidden=false;}
function replayPrologue(){stopGameMusic();prologueIndex=0;document.querySelector('#birthdaySetup').hidden=true;renderPrologue();}
function ensureRainAudio(){
  if(rainAudio)return rainAudio;
  const Ctx=window.AudioContext||window.webkitAudioContext,ctx=new Ctx(),seconds=2,buffer=ctx.createBuffer(1,ctx.sampleRate*seconds,ctx.sampleRate),data=buffer.getChannelData(0);
  let body=0,detail=0;
  for(let i=0;i<data.length;i++){
    const white=Math.random()*2-1;
    body=body*.94+white*.06;
    detail=detail*.55+white*.45;
    data[i]=(body*.34+detail*.66)*(.72+Math.random()*.28);
  }
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='highpass';filter.frequency.value=320;filter.Q.value=.35;gain.gain.value=0;source.connect(filter).connect(gain).connect(ctx.destination);source.start();rainAudio={ctx,source,gain};return rainAudio;
}
function fadeAudio(audio,target,ms){if(!audio)return;const start=audio.volume,steps=12;let n=0;clearInterval(audio._fade);audio._fade=setInterval(()=>{n++;audio.volume=start+(target-start)*(n/steps);if(n>=steps){clearInterval(audio._fade);if(target===0)audio.pause();}},ms/steps);}
function stopRain(){if(!rainAudio)return;rainAudio.gain.gain.cancelScheduledValues(rainAudio.ctx.currentTime);rainAudio.gain.gain.linearRampToValueAtTime(0,rainAudio.ctx.currentTime+.5);}
function updatePrologueAudio(isRain){
  if(!prologueSoundOn)return;
  const music=document.querySelector('#prologueMusic');music.volume=scaledVolume(.42,'bgm');
  if(userSettings.bgmEnabled&&music.paused)music.play().catch(()=>{});else if(!userSettings.bgmEnabled)music.pause();
  if(!userSettings.sfxEnabled){stopRain();return;}
  const rain=ensureRainAudio();
  rain.ctx.resume().then(()=>{const now=rain.ctx.currentTime;rain.gain.gain.cancelScheduledValues(now);rain.gain.gain.setValueAtTime(rain.gain.gain.value,now);rain.gain.gain.linearRampToValueAtTime(isRain?scaledVolume(.42,'sfx'):0,now+.55);}).catch(()=>{});
}
function syncPrologueSoundButton(){
  const button=document.querySelector('#prologueSound');if(!button)return;
  const allOn=prologueSoundOn&&userSettings.bgmEnabled&&userSettings.sfxEnabled;
  button.textContent=!prologueSoundOn?'소리 켜기':!userSettings.sfxEnabled?'빗소리 켜기':!userSettings.bgmEnabled?'음악 켜기':'소리 끄기';
  button.setAttribute('aria-pressed',String(allOn));
}
function togglePrologueSound(){
  const allOn=prologueSoundOn&&userSettings.bgmEnabled&&userSettings.sfxEnabled;
  if(!allOn){prologueSoundOn=true;userSettings.bgmEnabled=true;userSettings.sfxEnabled=true;saveSettings();syncSettingsUi();updatePrologueAudio(Boolean(prologueScenes[prologueIndex].rain));}
  else{prologueSoundOn=false;fadeAudio(document.querySelector('#prologueMusic'),0,400);stopRain();}
  syncPrologueSoundButton();
}
function applyAudioSettings(){
  const base=Number(gameMusic.dataset.baseVolume||.22);gameMusic.volume=scaledVolume(base,'bgm');
  if(!userSettings.bgmEnabled)gameMusic.pause();else if(gameMusic.src)gameMusic.play().catch(()=>{});
  const music=document.querySelector('#prologueMusic');music.volume=scaledVolume(.42,'bgm');if(!userSettings.bgmEnabled)music.pause();
  if(!userSettings.sfxEnabled)stopRain();else if(!document.querySelector('#prologue').hidden)updatePrologueAudio(Boolean(prologueScenes[prologueIndex]?.rain));
  syncPrologueSoundButton();
}
function playSettingsTestSound(){
  if(!userSettings.sfxEnabled)return;const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext)return;
  const ctx=new AudioContext(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.frequency.value=620;gain.gain.value=Math.max(.001,scaledVolume(.08,'sfx'));osc.connect(gain).connect(ctx.destination);osc.start();gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.12);osc.stop(ctx.currentTime+.13);
}
function syncSettingsUi(){
  document.querySelector('#bgmEnabled').checked=Boolean(userSettings.bgmEnabled);document.querySelector('#sfxEnabled').checked=Boolean(userSettings.sfxEnabled);
  document.querySelector('#bgmVolume').value=userSettings.bgmVolume;document.querySelector('#sfxVolume').value=userSettings.sfxVolume;
  document.querySelector('#bgmValue').textContent=`${userSettings.bgmVolume}%`;document.querySelector('#sfxValue').textContent=`${userSettings.sfxVolume}%`;document.querySelector('#referralCode').value=userSettings.referralCode||'';
}
function openSettings(){syncSettingsUi();document.querySelector('#settingsModal').hidden=false;document.querySelector('.phone').classList.add('settings-open');document.querySelector('#settingsClose').focus();}
function closeSettings(){document.querySelector('#settingsModal').hidden=true;document.querySelector('.phone').classList.remove('settings-open');document.querySelector('#settingsButton').focus();}
function updateSoundSetting(kind,value){userSettings[kind]=value;saveSettings();syncSettingsUi();applyAudioSettings();}
function saveReferralCode(){
  const input=document.querySelector('#referralCode'),message=document.querySelector('#referralMessage');const code=input.value.trim().toUpperCase().replace(/[^A-Z0-9가-힣-]/g,'').slice(0,20);
  if(!code){message.textContent='추천코드를 입력해 주세요.';input.focus();return;}userSettings.referralCode=code;saveSettings();input.value=code;message.textContent='추천코드가 이 기기에 저장되었습니다. 서버 검증은 추후 연결됩니다.';
}
let studioIntroFinished=false;
function finishStudioIntro(){
  if(studioIntroFinished)return;
  studioIntroFinished=true;
  const loading=document.querySelector('#studioLoading');
  document.querySelector('#birthdaySetup').hidden=true;
  if(!showRecoveryPrompt())renderPrologue();
  loading.classList.add('is-leaving');
  setTimeout(()=>{loading.hidden=true;},520);
}

async function playWeeklySchedule(selected) {
  const phone = document.querySelector('.phone');
  const playback = document.querySelector('#activityPlayback');
  const stage = document.querySelector('#activityStage');
  const stageCharacter = document.querySelector('#stageCharacter');
  const stageCharacterImage = document.querySelector('#stageCharacterImage');
  const stageMap = document.querySelector('#stageMap');
  const stageProps = document.querySelector('#stageProps');
  const stageNpc = document.querySelector('#stageNpc');
  const stageNpcImage = document.querySelector('#stageNpcImage');
  const dayResult = document.querySelector('#dayResult');
  const conditionCue = document.querySelector('#conditionCue');
  const simulated={stress:game.stress};
  const weeklyChange={};
  const dayRecords=[];
  const scheduleStart=new Date(`${game.currentDate}T00:00:00`);
  const dayNames = ['월요일','화요일','수요일','목요일','금요일','토요일','일요일'];
  document.querySelector('#homeGreeting').hidden=true;
  phone.classList.remove('greeting-active');
  phone.classList.add('playing');
  playback.hidden = false;
  stage.hidden = false;
  stageCharacterImage.src = spriteFrames.down[1];
  for (let index = 0; index < selected.length; index += 1) {
    const plannedAction = selected[index];
    const action = actionForStressLimit(plannedAction,simulated.stress);
    const forcedRest = action.id!==plannedAction.id;
    if(forcedRest){
      selected[index]=action;
      game.dailySchedule[index]=action.id;
    }
    const presentation = actionPresentation[action.id]||actionPresentation.rest;
    const currentMasteryRank=activityRank(action.id);
    stage.hidden=false;stageCharacter.hidden=false;stageProps.hidden=false;
    setScheduleDialogue(action,'start',index);
    if(forcedRest)document.querySelector('#dialogueText').textContent='스트레스가 100에 도달해 오늘 일정은 집에서 휴식으로 변경했어요.';
    const dailyOutfit=game.autoOutfit?updateAutoOutfit(action.id):game.equippedOutfit;
    document.querySelector('#playbackDay').textContent = dayNames[index];
    document.querySelector('#playbackAction').textContent = action.name;
    document.querySelectorAll('#playbackWeek span').forEach((day,dayIndex)=>{day.classList.toggle('done',dayIndex<index);day.classList.toggle('current',dayIndex===index);});
    const outfitName=outfits.find(item=>item.id===dailyOutfit)?.name;
    const showOutfitName=action.id!=='rest'&&Boolean(outfitName);
    const restActivity=action.id==='rest'?(Math.random()<.5?'tea':'sleep'):null;
    document.querySelector('#stageCaption').textContent = `${dayNames[index]} · ${action.name}${['교육','아르바이트'].includes(action.category)?` · ${activityRankNames[currentMasteryRank]}`:''}${restActivity?` · ${restActivity==='tea'?'차 마시기':'잠자기'}`:''}${showOutfitName?` · ${outfitName}`:''}`;
    document.querySelector('#playbackProgress').style.width = `${((index + 1) / selected.length) * 100}%`;
    bg.src = backgrounds[presentation.location];
    stageMap.src = backgrounds[presentation.location];
    stageMap.alt = `${action.name} 활동 장소`;
    stageProps.className = `stage-props prop-${presentation.prop}`;
    stageNpc.hidden = !presentation.npc;
    stageNpc.className = presentation.npc ? `stage-npc npc-${presentation.npc}` : 'stage-npc';
    if(presentation.npc)stageNpcImage.src = (presentation.npc==='teacher'?npcFrames.teacherReading:npcFrames[presentation.npc])[0];
    stage.className = `activity-stage map-${presentation.location} action-${action.id} mastery-${currentMasteryRank}`;
    stageCharacter.className = `stage-character pixel-sprite ${presentation.motion}`;
    if(action.id==='shopping'){
      playMarketMusic();
      stageMap.src=backgrounds.market;
      document.querySelector('#stageCaption').textContent=`${dayNames[index]} · 저잣거리 · 좌우로 움직여 가게를 선택하세요`;
      marketShoppingActive=true;
      await exploreMarket();
      marketShoppingActive=false;
      playHomeMusic();
    }else if(action.id==='vacation'){
      closeMarketUiForTransition();
      const prize=awardVacationIllustration();
      stage.hidden=true;stageNpc.hidden=true;stageProps.hidden=true;stageCharacter.hidden=true;
      const metSomeone=await playVacationScene(prize,index);
      document.querySelector('#dialogueText').textContent=metSomeone?`바캉스에서 「${prize.name}」 일러스트와 ${metSomeone.name}의 인연 추억을 얻었어요.`:`바캉스에서 「${prize.name}」 일러스트를 획득했어요.`;
    }else await animateActivitySprite(stageCharacterImage,presentation.motion,restActivity||presentation.activity,stageNpcImage,presentation.npc,dailyOutfit,currentMasteryRank);
    const guaranteedSuccess=['rest','vacation'].includes(action.id);
    const condition=['shopping','rest','vacation'].includes(action.id)?null:conditionEvent(simulated.stress,index);
    let outcome=judgeActivityOutcome(action,simulated.stress);
    if(!guaranteedSuccess&&condition==='mistake')outcome='mistake';
    else if(!guaranteedSuccess&&condition==='drowsy'&&outcome!=='mistake')outcome='struggle';
    const resolvedChange=resolvedActivityChange(action,outcome);
    const isWork=action.category==='아르바이트',basePay=isWork?activityPay(action):0;
    let moneyChange=isWork?(outcome==='mistake'?0:outcome==='struggle'?Math.round(basePay*.5):basePay):-action.cost;
    if(action.id==='dungeon'){
      const treasure=outcome==='mistake'?0:outcome==='struggle'?30+Math.floor(Math.random()*41):outcome==='perfect'?150+Math.floor(Math.random()*91):80+Math.floor(Math.random()*81);
      moneyChange+=treasure;
    }
    const progressReward=recordActivityProgress(action,outcome);
    moneyChange+=progressReward.bonusPay;
    if(condition){
      setScheduleDialogue(action,condition,index);
      await animateConditionEvent(stageCharacter,conditionCue,condition);
    }
    setScheduleDialogue(action,outcome,index);
    stageCharacter.className = `stage-character pixel-sprite ${presentation.motion}${restActivity==='tea'?' rest-tea':''}`;
    const actualChange={};
    Object.entries(resolvedChange).forEach(([key,value])=>{const before=clampStat(key,game[key]||0),after=clampStat(key,before+value);game[key]=after;actualChange[key]=after-before;});
    const resolvedAction={...action,cost:-moneyChange,change:actualChange};
    renderActivityGauges(resolvedAction);
    game.money=Math.max(0,game.money+moneyChange);
    renderHud();
    const moneyLabel=document.querySelector('#moneyLabel');
    moneyLabel.classList.remove('money-changing');void moneyLabel.offsetWidth;moneyLabel.classList.add('money-changing');
    showLiveChanges(resolvedAction);
    const bonusText=progressReward.reward?` · ${progressReward.reward.name} 획득`:progressReward.bonusPay?` · 연속 대성공 보너스 +${progressReward.bonusPay}냥`:'';
    const moneyText = (moneyChange > 0 ? `은전 +${moneyChange}냥` : moneyChange < 0 ? `은전 ${moneyChange}냥` : isWork&&outcome==='mistake'?'실수하여 일당 없음':'비용 없음')+bonusText;
    const resultSummary=orderedChangeEntries(resolvedChange).filter(([,value])=>value!==0).map(([key,value])=>`${statLabels[key]||key} ${value>0?'+':''}${value}`).join(' · ');
    dayResult.innerHTML = `<b>${action.name} · ${outcomeLabels[outcome]}</b><span>${resultSummary||'능력치 변화 없음'}<br>${moneyText} · 현재 ${game.money.toLocaleString()}냥</span>`;
    if(action.id!=='vacation'){
      dayResult.hidden = false;
      await new Promise(resolve => setTimeout(resolve, 900));
      dayResult.hidden = true;
    }
    Object.entries(actualChange).forEach(([key,value])=>weeklyChange[key]=(weeklyChange[key]||0)+value);
    const activityDate=new Date(scheduleStart);activityDate.setDate(scheduleStart.getDate()+index);
    dayRecords.push({date:isoDate(activityDate),action:{...action,cost:-moneyChange},actualChange,outcome,moneyChange});
    simulated.stress=clampStat('stress',simulated.stress+(resolvedChange.stress||0));
  }
  playback.hidden = true;
  stage.hidden = true;
  stageCharacter.className = 'stage-character pixel-sprite';
  stageNpc.hidden = true;
  stageProps.className = 'stage-props prop-none';
  document.querySelector('#activityGauges').hidden = true;
  conditionCue.hidden = true;
  document.querySelector('.dialogue').classList.remove('schedule-speaking');
  document.querySelector('#speakerName').textContent=game.guardianName||guardianDefs[game.guardianType]?.name||'수호신수';
  phone.classList.remove('playing');
  return {weeklyChange,dayRecords};
}

document.querySelector('#marketEnter').addEventListener('click',event=>enterMarketShop(event.currentTarget.dataset.shop));
document.querySelectorAll('[data-market-shop]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();askMarketShop(button.dataset.marketShop);}));
document.querySelector('#marketConfirmNo').addEventListener('click',closeMarketConfirm);
document.querySelector('#marketConfirmYes').addEventListener('click',()=>{const type=marketSelection;document.querySelector('#marketConfirm').hidden=true;enterMarketShop(type);});
document.querySelector('#marketFinish').addEventListener('click',finishMarket);
document.querySelector('#marketFinish').addEventListener('pointerup',finishMarket);
document.querySelector('#scheduleConfirmYes').addEventListener('click',()=>{scheduleConfirmDismissed=false;runWeek();});
document.querySelector('#scheduleConfirmNo').addEventListener('click',()=>{scheduleConfirmDismissed=true;hideScheduleConfirmation();panel.hidden=false;renderSchedulePanel();});
window.addEventListener('keydown',event=>{if(document.querySelector('#marketExplore').hidden)return;if(event.key==='ArrowLeft')selectMarketShop('food');if(event.key==='ArrowRight')selectMarketShop('outfit');if(event.key==='Enter'&&marketSelection)enterMarketShop(marketSelection);});
bg.addEventListener('load', updateImageState);
document.querySelector('#wardrobeButton')?.addEventListener('click',renderWardrobe);
document.querySelector('#collectionBookButton')?.addEventListener('click',()=>openPanel('collection'));
document.querySelector('#gameRecordButton')?.addEventListener('click',()=>openPanel('save'));
document.querySelector('#settingsButton').addEventListener('click',openSettings);
document.querySelector('#settingsClose').addEventListener('click',closeSettings);
document.querySelector('#settingsModal').addEventListener('click',event=>{if(event.target.id==='settingsModal')closeSettings();});
document.querySelector('#bgmEnabled').addEventListener('change',event=>updateSoundSetting('bgmEnabled',event.target.checked));
document.querySelector('#sfxEnabled').addEventListener('change',event=>{updateSoundSetting('sfxEnabled',event.target.checked);playSettingsTestSound();});
document.querySelector('#bgmVolume').addEventListener('input',event=>updateSoundSetting('bgmVolume',Number(event.target.value)));
document.querySelector('#sfxVolume').addEventListener('input',event=>updateSoundSetting('sfxVolume',Number(event.target.value)));
document.querySelector('#sfxVolume').addEventListener('change',playSettingsTestSound);
document.querySelector('#referralSave').addEventListener('click',saveReferralCode);
document.querySelector('#referralCode').addEventListener('keydown',event=>{if(event.key==='Enter')saveReferralCode();});
bg.addEventListener('error', updateImageState);
character.addEventListener('load', updateImageState);
character.addEventListener('error', updateImageState);
document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel)));
document.querySelector('#closePanel').addEventListener('click', () => {if(marketShoppingActive)returnToMarketSelection();else{panel.hidden=true;playHomeMusic();}});
document.querySelector('#recoveryFresh').addEventListener('click',declineRecovery);
document.querySelector('#recoveryContinue').addEventListener('click',continueRecovery);
document.querySelector('#startGame').addEventListener('click', startWithBirthday);
document.querySelector('#guardianStoryNext').addEventListener('click',nextGuardianStory);
document.querySelector('#guardianStory').addEventListener('click',event=>{if(!event.target.closest('button'))nextGuardianStory();});
document.querySelectorAll('[data-guardian]').forEach(button=>button.addEventListener('click',()=>chooseGuardian(button.dataset.guardian)));
document.querySelector('#guardianChoiceConfirm').addEventListener('click',confirmGuardianChoice);
document.querySelector('#guardianNameConfirm').addEventListener('click',finishGuardianNaming);
document.querySelector('#guardianNameInput').addEventListener('keydown',event=>{if(event.key==='Enter')finishGuardianNaming();});
document.querySelector('#guardianReselect').addEventListener('click',reselectGuardian);
document.querySelector('#guardianCompanion').addEventListener('click',()=>speakGuardian('home'));
document.querySelector('#guardianCompanion').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();speakGuardian('home');}});
document.querySelector('.dialogue').addEventListener('click',advanceIntroDialogue);
document.querySelector('#birthdayMonth').addEventListener('change',()=>syncBirthdaySelectors());
document.querySelector('#birthdayDay').addEventListener('change',()=>syncBirthdaySelectors());
document.querySelector('#prologueNext').addEventListener('click',nextPrologue);
document.querySelector('#prologueBack').addEventListener('click',previousPrologue);
document.querySelector('#prologueSound').addEventListener('click',togglePrologueSound);
document.querySelector('#prologueSkip').addEventListener('click',closePrologue);
document.querySelector('#storyReplay').addEventListener('click',replayPrologue);
document.querySelector('#studioStartSound').addEventListener('click',finishStudioIntro);
prologueScenes.forEach(scene=>{const image=new Image();image.src=scene.image;});
guardianStoryScenes.forEach(scene=>{const image=new Image();image.decoding='async';image.src=scene.image;});
syncBirthdaySelectors(true);
syncSettingsUi();
renderHud();
updateHomeCharacter();
updateImageState();
migrateLegacySave();
initializeRecoverySession();
document.addEventListener('visibilitychange',()=>{if(document.hidden)writeLatestAutoSave();});
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('#settingsModal').hidden)closeSettings();});
window.addEventListener('pagehide',()=>{writeLatestAutoSave();localStorage.removeItem(SESSION_ACTIVE_KEY);});
