const bg = document.querySelector('.background');
const activityBackdrop=document.querySelector('#activityBackdrop');
const stageMapElement=document.querySelector('#stageMap');
if(activityBackdrop&&stageMapElement){const syncActivityBackdrop=()=>{activityBackdrop.src=stageMapElement.src;activityBackdrop.alt=stageMapElement.alt||'현재 일정의 전체 배경';};new MutationObserver(syncActivityBackdrop).observe(stageMapElement,{attributes:true,attributeFilter:['src','alt']});}
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
const gameMusicTracks={home:'../assets/audio/music/gameplay/bgm-home-daily.mp3',market:'../assets/audio/music/gameplay/bgm-market-morning.mp3',work:'../assets/audio/music/gameplay/bgm-work-morning.mp3',education:'../assets/audio/music/gameplay/bgm-education-study.mp3'};
function vacationMusicPath(seasonName=game.season,ageValue=game.age){const age=ageValue>=18?'18':ageValue>=16?'16':ageValue>=13?'13':'09';const season={봄:'spring',여름:'summer',가을:'autumn',겨울:'winter'}[seasonName]||'spring';return `../assets/audio/music/vacation/age-${age}/vacation-${season}.mp3`;}
function stopCompetingBgm(active=gameMusic){document.querySelectorAll('audio').forEach(audio=>{if(audio!==active&&audio.id!=='rainAudio'){audio.pause();}});}
function playGameMusic(source,volume=.24,playbackRate=1){if(!source)return;stopCompetingBgm(gameMusic);const target=new URL(source,document.baseURI).href;if(gameMusic.src!==target){gameMusic.pause();gameMusic.src=target;gameMusic.currentTime=0;gameMusic.load();}gameMusic.playbackRate=playbackRate;gameMusic.dataset.track=source;gameMusic.dataset.baseVolume=String(volume);gameMusic.dataset.playbackRate=String(playbackRate);gameMusic.volume=scaledVolume(volume,'bgm');if(userSettings.bgmEnabled&&!gameMusic.paused&&gameMusic.src===target)return;if(userSettings.bgmEnabled)gameMusic.play().catch(()=>{});else gameMusic.pause();}
function playHomeMusic(){playGameMusic(gameMusicTracks.home,.22);}
function playMarketMusic(){playGameMusic(gameMusicTracks.market,.20);}
function playScheduleMusic(action){if(['shopping','vacation'].includes(action?.id))return;if(action?.category==='교육')playGameMusic(gameMusicTracks.education,.20,1.12);else if(action?.category==='아르바이트')playGameMusic(gameMusicTracks.work,.20,1.12);else playHomeMusic();}
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

const game = { characterName:'', nannyName:'', guardianType:null, guardianName:'', profileSlot:null, age: 9, height:130, weight:28.5, month: 1, week: 1, season:'봄', money: 50000, cash:50000, health:42, strength:18, agility:20, intelligence:35, magic:8, mentality:30, dignity:36, manners:28, speech:14, sensitivity:40, sense:24, charm:30, stress:0, items: [], purchasedGoods:[], relations:{}, activityProgress:{}, activityUnlocksSeen:[], completedPhases:[], startingGiftId:null, fatherBirthdayYears:[], sehwaWins:[], latestSehwaArtwork:null, equippedOutfit:null, autoOutfit:true, dailySchedule: [], scheduleFormat:'phase-v1', birthday:null, currentDate:null, endingDate:null, ended:false, endingResult:null, birthdayCount:0, element:null, birthSeason:null, memory:0, truth:0, exposure:0, fatherAffinity:0, guardianTrust:50, nannyAffinity:50, lastGreetingDate:null, lastGuardianTalkDate:null, lastGuardianTalkPhase:null, monthlyLedger:null };
const baseSpritePaths=Object.freeze({
  9:'../assets/characters/seonhwa/identity-semi-real-v9/seonhwa-age09-identity-v9.png',
  13:'../assets/characters/seonhwa/identity-semi-real-v9/seonhwa-age13-identity-v9.png',
  16:'../assets/characters/seonhwa/identity-semi-real-v9/seonhwa-age16-identity-v9.png',
  19:'../assets/characters/seonhwa/identity-semi-real-v9/seonhwa-age19-identity-v9.png'
});
const baseSpriteForAge=(age=game.age)=>baseSpritePaths[age>=18?19:age>=16?16:age>=13?13:9];
const baseSpritePath=baseSpritePaths[9];
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
let pendingActivityUnlocks=[];
let pendingHolidayRelation=null;
let schedulePlaybackSpeed=1;
const schedulePlaybackDelay=milliseconds=>new Promise(resolve=>setTimeout(resolve,Math.max(40,Math.round(milliseconds/schedulePlaybackSpeed))));
function syncPlaybackSpeedToggle(){const enabled=schedulePlaybackSpeed===2;document.querySelectorAll('[data-playback-speed-toggle]').forEach(button=>{button.classList.toggle('active',enabled);button.setAttribute('aria-pressed',String(enabled));button.textContent=enabled?'2배속 켜짐':'2배속';});}
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
  [baseSpritePath,'기본']
];
const homeConditionPoses={
  happy:()=>baseSpriteForAge(),
  sad:()=>baseSpriteForAge(),
  shocked:()=>baseSpriteForAge(),
  angry:()=>baseSpriteForAge(),
  tired:()=>baseSpriteForAge(),
  rebellious:()=>baseSpriteForAge(),
  normal:()=>baseSpriteForAge()
};
const backgrounds = {
  home: '../assets/backgrounds/home/home-room-morning.webp',
  seodang: '../assets/backgrounds/seodang/seodang-day.webp',
  market: '../assets/backgrounds/market/market-day.webp',
  marketSelection: '../assets/backgrounds/market/market-three-shops-v1.png',
  pharmacy: '../assets/backgrounds/pharmacy/pharmacy-day.webp',
  courtyard: '../assets/backgrounds/pixel-activities/close/courtyard.webp',
  etiquetteRoom: '../assets/backgrounds/pixel-activities/close/etiquette-room.webp',
  studyRoom: '../assets/backgrounds/pixel-activities/close/study-room-clear.webp',
  arithmeticRoom: '../assets/backgrounds/pixel-activities/close/arithmetic-room.webp',
  marketErrand: '../assets/backgrounds/pixel-activities/close/market-errand-v2.webp',
  herbField: '../assets/backgrounds/pixel-activities/close/herb-field-v2.webp',
  restRoom: '../assets/backgrounds/pixel-activities/close/rest-room.webp',
  tavernMeal: '../assets/backgrounds/market/tavern-meal-interior-v1.png',
  houseWorkroom: '../assets/backgrounds/pixel-activities/close/kitchen-workroom.webp'
};
Object.assign(backgrounds,{
  phaseStudy:'../assets/backgrounds/phase-scenes/study.webp',phaseArithmetic:'../assets/backgrounds/phase-scenes/arithmetic.webp',phaseEtiquette:'../assets/backgrounds/phase-scenes/etiquette.webp',phasePainting:'../assets/backgrounds/phase-scenes/painting.webp',phaseMusic:'../assets/backgrounds/phase-scenes/music.webp',phaseDance:'../assets/backgrounds/phase-scenes/dance.webp',phaseMartial:'../assets/backgrounds/phase-scenes/martial.webp',phaseMagic:'../assets/backgrounds/phase-scenes/magic.webp',phaseKitchen:'../assets/backgrounds/phase-scenes/kitchen.webp',phaseFarm:'../assets/backgrounds/phase-scenes/farm.webp',phaseChildcare:'../assets/backgrounds/phase-scenes/childcare.webp',phaseWoodwork:'../assets/backgrounds/phase-scenes/woodwork.webp',phaseLoom:'../assets/backgrounds/phase-scenes/loom.webp',phaseClinic:'../assets/backgrounds/phase-scenes/clinic.webp',phaseFerry:'../assets/backgrounds/phase-scenes/ferry.webp',phaseMerchant:'../assets/backgrounds/phase-scenes/merchant.webp',
  farmJob:'../assets/backgrounds/phase-scenes/farm.webp',childcareJob:'../assets/backgrounds/phase-scenes/childcare.webp',kitchenJob:'../assets/backgrounds/phase-scenes/kitchen.webp',woodworkJob:'../assets/backgrounds/phase-scenes/woodwork.webp',loomJob:'../assets/backgrounds/phase-scenes/loom.webp',masonryJob:'../assets/backgrounds/phase-scenes/woodwork.webp',clinicJob:'../assets/backgrounds/phase-scenes/clinic.webp',ferryJob:'../assets/backgrounds/phase-scenes/ferry.webp',merchantJob:'../assets/backgrounds/phase-scenes/merchant.webp'
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
  reading: { motion:'motion-calligraphy', location:'phaseStudy', prop:'none', activity:'calligraphy', npc:'teacher' }, arithmetic: { motion:'motion-arithmetic', location:'phaseArithmetic', prop:'none', activity:'arithmetic', npc:'teacher' },
  manners: { motion:'motion-manners', location:'phaseEtiquette', prop:'none', activity:'manners', npc:'teacher' }, errand: { motion:'motion-errand', location:'marketErrand', prop:'none', activity:'errand', npc:null },
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
  'holiday-seollal': { motion:'motion-manners', location:'restRoom', prop:'none', activity:'manners', npc:null },
  'holiday-chuseok': { motion:'motion-manners', location:'restRoom', prop:'none', activity:'manners', npc:null },
  painting: { motion:'motion-calligraphy', location:'phasePainting', prop:'none', activity:'calligraphy', npc:'teacher' },
  music: { motion:'motion-manners', location:'phaseMusic', prop:'none', activity:'sit', npc:'teacher' },
  dance: { motion:'motion-manners', location:'phaseDance', prop:'none', activity:'sit', npc:'teacher' },
  // 고급 교육도 현재 연령의 공통 베이스 얼굴을 사용한다. 전용 동작 자산이 없는 동안
  // 9세 고정 프레임으로 빠지지 않게 서기/집중 자세의 연령별 모듈 프레임을 연결한다.
  swordsmanship: { motion:'motion-sweeping', location:'phaseMartial', prop:'none', activity:'sweeping', npc:null },
  spellcraft: { motion:'motion-calligraphy', location:'phaseMagic', prop:'none', activity:'calligraphy', npc:null },
  cooking: { motion:'motion-job-kitchen', location:'phaseKitchen', prop:'none', activity:'kitchenhelp', npc:null },
  martial: { motion:'motion-sweeping', location:'phaseMartial', prop:'none', activity:'sweeping', npc:'dolsoe' },
  classics: { motion:'motion-calligraphy', location:'phaseStudy', prop:'none', activity:'calligraphy', npc:'teacher' },
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
// 일정 화면은 홈 대표 캐릭터와 분리된 9세 단일 쯔꾸르 기준 자산만 사용한다.
// 새 schedule-base / schedule-actions 폴더를 우선 사용하고, 빠진 프레임만 임시 기본값으로 되돌린다.
function unifiedAgeFolder(){return '09';}
function scheduleFramePath(file){return `../assets/characters/seonhwa/schedule-actions/v2/${file}`;}
function scheduleBasePath(file){return `../assets/characters/seonhwa/schedule-base/${file}`;}
const scheduleAssetRevision='0.64.269-debug';
const scheduleQaParams=new URLSearchParams(location.search);
const moonlightStandaloneQa=scheduleQaParams.get('qaHoliday')==='chuseok';
const sehwaStandaloneQa=scheduleQaParams.get('qaHoliday')==='seollal';
const sehwaHomeQaTheme=scheduleQaParams.get('qaSehwaHome');
const relationStandaloneQa=scheduleQaParams.has('qaRelation');
const relationQaControlsVisible=scheduleQaParams.get('qaPanel')==='1';
const endingStandaloneQa=scheduleQaParams.has('qaEnding');
const basePortraitStandaloneQa=scheduleQaParams.has('qaBaseAge');
const scheduleLayerStandaloneQa=scheduleQaParams.get('qa')==='1';
const lockedScheduleQaMode=scheduleQaParams.has('qaSchedules')||scheduleLayerStandaloneQa;
let scheduleQaForcedPattern=scheduleQaParams.get('qaPattern');
let scheduleLayerManifestPromise;
const scheduleLayerIds=new Set(['painting','music','dance','swordsmanship','spellcraft','classics','farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','innhelp','sewing','copying','ferryhelp','merchanthelp','accounting','tutoring']);
const scheduleLayerV2PilotIds=new Set(['kitchenhelp','childcare','painting','music','dance','sewing','copying','woodwork','loomwork','farmwork','swordsmanship','spellcraft','classics','masonry','clinichelp','innhelp','ferryhelp','merchanthelp','accounting','tutoring']);
function scheduleLayerManifest(){
  scheduleLayerManifestPromise??=fetch(`../manifest.json?v=${scheduleAssetRevision}`,{cache:'no-store'}).then(response=>{
    if(!response.ok)throw new Error(`schedule manifest HTTP ${response.status}`);
    return response.json();
  });
  return scheduleLayerManifestPromise;
}
async function scheduleLayerV2Spec(actionId){
  if(!scheduleLayerV2PilotIds.has(actionId))return null;
  const bundledSpec=window.SCHEDULE_LAYER_V2_SPECS?.[actionId];
  if(bundledSpec)return bundledSpec;
  const response=await fetch(`../assets/schedule-layers-v2/${actionId}/manifest.json?v=${scheduleAssetRevision}`,{cache:'no-store'});
  if(!response.ok)throw new Error(`schedule layer v2 manifest ${response.status}: ${actionId}`);
  return response.json();
}
function versionedScheduleAsset(src){return `${src}?v=${scheduleAssetRevision}`;}
function repeatedFrame(src){return [src,src,src];}
function frameTriplet(prefix, folder='actions'){
  const build=folder==='base'?scheduleBasePath:scheduleFramePath;
  return [1,2,3].map(frame=>versionedScheduleAsset(build(`${prefix}-${frame}.png`)));
}
function sheetTriplet(file,row,rows){
  return [1,2,3].map(frame=>`${scheduleFramePath(file)}?row=${row}&rows=${rows}&frame=${frame}`);
}
const spriteFrames = {
  get down(){return repeatedFrame(versionedScheduleAsset(scheduleBasePath('stand-front-v3-pixel.png')));},
  get left(){return repeatedFrame(versionedScheduleAsset(scheduleBasePath('stand-left-v3-pixel.png')));},
  get right(){return frameTriplet('errand-pixel-v2');}
};
const scheduleActionFrames={
  calligraphy:frameTriplet('calligraphy-pixel-v2'),
  arithmetic:frameTriplet('arithmetic-pixel-v2'),
  dance:frameTriplet('dance-fan-held-v1'),
  manners:frameTriplet('manners-pixel-v2'),
  sit:frameTriplet('sit-pixel-v2'),
  houseclean:frameTriplet('houseclean-pixel-v2'),
  errand:frameTriplet('errand-pixel-v2'),
  herbs:frameTriplet('herbs-pixel-v2'),
  farmwork:frameTriplet('farmwork-pixel-v2'),
  sweeping:frameTriplet('sweeping-pixel-v2'),
  childcare:frameTriplet('childcare-pixel-v2'),
  kitchenhelp:frameTriplet('kitchenhelp-pixel-v2'),
  woodwork:frameTriplet('woodwork-pixel-v2'),
  loomwork:frameTriplet('loomwork-pixel-v2'),
  masonry:frameTriplet('masonry-pixel-v2'),
  clinichelp:frameTriplet('clinichelp-pixel-v2'),
  ferryhelp:frameTriplet('ferryhelp-pixel-v2'),
  merchanthelp:frameTriplet('merchanthelp-pixel-v2'),
  eating:frameTriplet('eating-pixel-v2'),
  rest:frameTriplet('tea-pixel-v2'),
  sleep:frameTriplet('sleep-pixel-v2'),
  tea:frameTriplet('tea-pixel-v2'),
  fail:frameTriplet('fail-pixel-v2')
};
// 승인된 4장(age09/13/16/18-eyes-v2)을 모든 기본 쯔꾸르 동작의 단일 원본으로 사용한다.
// 잠자기도 연령별 기준 시트에서 불러와 얼굴·체형·기본 의상이 섞이지 않게 한다.
const canonicalActivityAliases={
  calligraphy:'calligraphy',reading:'calligraphy',study:'calligraphy',painting:'calligraphy',music:'calligraphy',classics:'calligraphy',copying:'calligraphy',tutoring:'calligraphy',
  dance:'dance',koreanDance:'dance',magic:'spell-cast',spellcraft:'spell-cast',
  arithmetic:'arithmetic',accounting:'arithmetic',cooking:'arithmetic',swordsmanship:'sword-strike',martial:'manners',dungeon:'manners',manners:'manners',sit:'sit',
  errand:'errand',farmwork:'farmwork',eating:'errand',
  herbs:'herbs',
  houseclean:'houseclean',
  sweeping:'sweeping',
  childcare:'childcare',
  kitchenhelp:'kitchenhelp',
  woodwork:'woodwork',
  loomwork:'loomwork',
  masonry:'masonry',
  clinichelp:'clinichelp',
  ferryhelp:'ferryhelp',
  merchanthelp:'merchanthelp',innhelp:'merchanthelp',sewing:'loomwork',
  rest:'rest',sleep:'sleep',tea:'tea'
};
function activityFrameSet(activity){
  if(activity && scheduleActionFrames[activity])return scheduleActionFrames[activity];
  const canonical=canonicalActivityAliases[activity]||'errand';
  return scheduleActionFrames[canonical]||scheduleActionFrames.errand;
}
const npcFrames = Object.fromEntries(['teacher','dolsoe','herbalist','nanny','child'].map(name=>[name,[1,2,3].map(n=>`../assets/characters/npcs/activity/${name}-${n}.png`)]));
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
const sundryGoods=[
  {id:'shop-silk-hairpin',name:'진주 비녀',price:680,type:'accessory',detail:'작은 진주를 단 단정한 비녀',change:{charm:6,manners:3}},
  {id:'shop-jade-hairpin',name:'옥꽃 비녀',price:1280,type:'accessory',detail:'옥으로 꽃잎을 다듬은 비녀',change:{charm:10,dignity:6}},
  {id:'shop-coral-norigae',name:'산호 노리개',price:1450,type:'accessory',detail:'붉은 산호알을 엮은 노리개',change:{charm:12,dignity:7}},
  {id:'shop-silk-bolt',name:'연분홍 비단',price:920,type:'event',detail:'옷과 소품을 지을 수 있는 고운 비단',change:{sense:6,charm:5}},
  {id:'shop-hand-mirror',name:'자개 손거울',price:760,type:'accessory',detail:'나전 문양을 입힌 작은 손거울',change:{charm:7,manners:4}},
  {id:'shop-boxwood-comb',name:'회양목 빗',price:360,type:'accessory',detail:'머릿결을 단정하게 다듬는 빗',change:{charm:4,dignity:3}},
  {id:'shop-plum-perfume',name:'매화 향수',price:880,type:'accessory',detail:'은은한 매화 향을 담은 향병',change:{charm:8,reputation:3}},
  {id:'shop-face-powder',name:'쌀분 백분',price:520,type:'accessory',detail:'곱게 간 쌀가루로 만든 백분',change:{charm:6}},
  {id:'shop-rouge',name:'홍화 연지',price:610,type:'accessory',detail:'홍화빛을 담은 작은 연지합',change:{charm:7,sensitivity:2}},
  {id:'shop-makeup-set',name:'단장 화장품 세트',price:1680,type:'accessory',detail:'백분·연지·눈썹먹을 갖춘 단장함',change:{charm:14,manners:5,reputation:3}},
  {id:'shop-flower-shoes',name:'수놓은 꽃신',price:740,type:'accessory',detail:'발끝에 꽃 자수를 놓은 신',change:{charm:7,dignity:4}},
  {id:'shop-silk-pouch',name:'비단 향낭',price:470,type:'accessory',detail:'좋은 향을 머금은 비단 주머니',change:{charm:5,manners:4}},
  {id:'shop-dance-fan',name:'매화 춤부채',price:590,type:'accessory',detail:'춤사위를 돋보이게 하는 부채',change:{agility:4,arts:5,charm:3}},
  {id:'shop-silver-ring',name:'은가락지',price:1080,type:'accessory',detail:'단아한 광택의 은 장신구',change:{charm:8,dignity:6}},
  {id:'shop-embroidery-kit',name:'자수 단장 꾸러미',price:640,type:'event',detail:'색실과 장식 매듭을 담은 꾸러미',change:{sense:6,arts:5,charm:2}}
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
  const current=new Date(`${game.currentDate}T00:00:00`);
  const previous=game.lastMerchantVisitDate?new Date(`${game.lastMerchantVisitDate}T00:00:00`):null;
  const weeksSince=previous?Math.floor((current-previous)/604800000):Infinity;
  if(weeksSince<6){pendingVisitShop=false;return false;}
  pendingVisitShop=Math.random()<.08;
  if(pendingVisitShop)game.lastMerchantVisitDate=game.currentDate;
  return pendingVisitShop;
}
function openVisitingMerchant(){
  if(!pendingVisitShop)return;
  pendingVisitShop=false;
  document.querySelector('.phone').classList.add('merchant-speaking');
  document.querySelector('#merchantVisit').hidden=false;
}
function closeVisitingMerchant(openShop=false){
  document.querySelector('#merchantVisit').hidden=true;
  document.querySelector('.phone').classList.remove('merchant-speaking');
  if(openShop)openPanel('shop');
  else{document.querySelector('#speakerName').textContent=game.guardianName||guardianDefs[game.guardianType]?.name||'수호신수';document.querySelector('#dialogueText').textContent='떠돌이 잡화상은 다음 장날을 기약하며 길을 떠났어요.';}
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
sundryGoods.forEach(item=>{item.change=canonicalizeChange(item.change);});
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
  return baseSpriteForAge(visualAge);
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
  const fallbackPose=homeConditionPoses[condition];
  character.src=game.equippedOutfit?outfitImage(game.equippedOutfit):(typeof fallbackPose==='function'?fallbackPose():fallbackPose);
}
function applyEquippedOutfit(){updateHomeCharacter();}
const outfitSituation={
  reading:['scholar','neat'],arithmetic:['scholar','neat'],painting:['art','scholar'],classics:['scholar','neat'],copying:['scholar','neat'],tutoring:['scholar','neat'],accounting:['scholar','neat'],
  manners:['court','ceremony','festival','neat'],music:['ceremony','festival'],dance:['festival','ceremony'],
  swordsmanship:['active','work'],martial:['active','work'],spellcraft:['court','ceremony'],cooking:['work','simple'],
  errand:['travel','work','active'],sweeping:['work','active','simple'],herbs:['travel','work','active'],houseclean:['work','active','simple'],
  farmwork:['work','active','simple'],childcare:['simple','neat'],kitchenhelp:['work','active'],woodwork:['work','active'],loomwork:['work','simple'],masonry:['work','active'],clinichelp:['scholar','neat'],innhelp:['work','active'],sewing:['simple','neat'],ferryhelp:['travel','work','active'],merchanthelp:['work','neat'],
  rest:['simple','neat'],tea:['simple','neat'],sleep:['simple','neat'],shopping:['festival','flower','silk']
};
const seasonPreference={봄:['flower','festival','art'],여름:['active','work','travel','simple'],가을:['scholar','neat','court'],겨울:['ceremony','silk','court','festival']};
function recommendOutfit(actionId=null){
  normalizeInventory();const owned=game.items.filter(item=>item.type==='outfit'&&outfits.some(outfit=>outfit.id===item.id));if(!owned.length)return null;
  const situation=outfitSituation[actionId]||[],season=seasonPreference[game.season]||[];
  const score=item=>{const outfit=outfits.find(entry=>entry.id===item.id);let value=0;if(outfit.situations.includes(actionId))value+=45;if(outfit.seasons.includes(game.season))value+=30;situation.forEach((tag,index)=>{if(item.id.includes(tag))value+=12-index;});season.forEach((tag,index)=>{if(item.id.includes(tag))value+=7-index;});value-=Math.max(0,game.age-outfit.ageEnd)*2;return value;};
  return owned.sort((a,b)=>score(b)-score(a))[0]?.id||null;
}
function updateAutoOutfit(actionId=null){
  if(!game.autoOutfit)return game.equippedOutfit;
  const recommended=recommendOutfit(actionId);
  // 보유 의상 중 추천할 수 있는 항목이 없을 때 착용 중인 옷을 벗기지 않는다.
  if(recommended)game.equippedOutfit=recommended;
  applyEquippedOutfit();
  return game.equippedOutfit;
}
const activityOutfitFrameCache=new Map();
const activityOutfitStyleCache=new Map();
const normalizedActivityFrameCache=new Map();
// 쯔꾸르 인물은 원본 파일 크기가 아니라 불투명한 머리-발끝 높이로 통일한다.
// 서기 100%를 기준으로 숙이기 98%, 앉기 94%, 바닥 동작 88%만 허용한다.
const activityPoseRatio=Object.freeze({standing:1,bent:.98,seated:.94,floorwork:.88});
function activityPoseType(src=''){
  if(/manners-sheet/.test(src))return 'standing';
  if(/core-sheet-v3.*row=5/.test(src))return 'floorwork';
  if(/core-sheet-v3.*row=3/.test(src))return 'floorwork';
  if(/core-sheet-v3.*row=1/.test(src))return 'seated';
  if(/core-sheet-v3.*row=4/.test(src))return 'bent';
  if(/rest-legacy|tea/.test(src))return 'seated';
  if(/houseclean|resting|rest-|sleep|eating|farmwork|masonry|herbs/.test(src))return 'floorwork';
  if(/calligraphy|arithmetic|childcare|kitchenhelp|woodwork|loomwork|clinichelp/.test(src))return 'seated';
  if(/sweeping|gather/.test(src))return 'bent';
  return 'standing';
}
function activityOutfitPalette(outfitId){
  if(!outfitId)return null;
  if(/cash-ember|rose-paisley/.test(outfitId))return {skirt:[96,25,47],top:[185,68,93],accent:[224,166,62]};
  if(/cash-solar/.test(outfitId))return {skirt:[238,224,194],top:[203,163,62],accent:[151,104,35]};
  if(/cash-ink|ethnic-stage/.test(outfitId))return {skirt:[38,35,48],top:[91,70,109],accent:[198,151,67]};
  if(/cash-starlight/.test(outfitId))return {skirt:[213,155,195],top:[239,202,217],accent:[123,78,163]};
  if(/premium-midnight|premium-crimson|premium-ink/.test(outfitId))return {skirt:[35,31,38],top:[111,40,57],accent:[194,145,60]};
  if(/premium-moonlight/.test(outfitId))return {skirt:[239,228,199],top:[205,164,72],accent:[112,83,42]};
  if(/premium-aurora/.test(outfitId))return {skirt:[226,170,194],top:[244,222,227],accent:[139,83,123]};
  if(/active|work|travel|simple/.test(outfitId))return {skirt:[54,126,125],top:[220,172,74],accent:[112,52,42]};
  if(/flower|festival|art|silk/.test(outfitId))return {skirt:[211,96,120],top:[236,190,195],accent:[124,44,61]};
  if(/court|ceremony/.test(outfitId))return {skirt:[59,79,126],top:[218,187,112],accent:[135,49,45]};
  return {skirt:[143,171,145],top:null,accent:[112,52,42]};
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
    const style={top:sampleOutfitColor(pixels,canvas.width,canvas.height,.16,.48,fallback?.top||[220,205,178]),skirt:sampleOutfitColor(pixels,canvas.width,canvas.height,.48,.92,fallback?.skirt||[143,171,145]),accent:fallback?.accent||[112,52,42]};
    activityOutfitStyleCache.set(key,style);resolve(style);
  }catch{resolve(fallback);}};outfitSource.onerror=()=>resolve(fallback);outfitSource.src=outfitImageForAge(outfitId,age);});
}
async function outfitActivityFrame(src,outfitId){
  const exact=outfitId?activityOutfitAsset(src,outfitId):null;
  if(exact&&await imageAssetExists(exact))return exact;
  // 전용 의상 프레임이 없을 때 색상 합성을 하지 않는다. 얼굴·머리·소품 변색보다
  // 깨끗한 기본 의상을 보여 주는 편이 안전하며, 전용 자산이 추가되면 자동 교체된다.
  return normalizeActivityFrame(src);
}
function activityOutfitAsset(src,outfitId){
  const file=(src.split('/').pop()||'').replace(/-v\d+(?=-\d+\.png$)/,'').replace(/-legacy(?=-\d+\.png$)/,'').replace(/-fixed(?=-\d+\.png$)/,'').replace(/-side(?=-\d+\.png$)/,'').replace(/-character(?=-\d+\.png$)/,'');
  const age=String(growthAssetAge(growthVisualAge())).padStart(2,'0');
  return `../assets/characters/seonhwa/activity-outfits/${outfitId}/age-${age}/${file}`;
}
function imageAssetExists(src){
  if(activityOutfitFrameCache.has(src))return Promise.resolve(activityOutfitFrameCache.get(src));
  return new Promise(resolve=>{const image=new Image();image.onload=()=>{activityOutfitFrameCache.set(src,true);resolve(true);};image.onerror=()=>{activityOutfitFrameCache.set(src,false);resolve(false);};image.src=src;});
}
function normalizeActivityFrame(src){
  if(normalizedActivityFrameCache.has(src))return Promise.resolve(normalizedActivityFrameCache.get(src));
  // 신규 픽셀 프레임은 이미 320×320 캔버스와 자세별 머리-발끝 규격으로
  // 완성되어 있다. 다시 자르거나 확대하면 NPC보다 흐려지고 크기가 변한다.
  if(src.includes('-pixel-')){normalizedActivityFrameCache.set(src,src);return Promise.resolve(src);}
  return new Promise(resolve=>{const source=new Image();source.onload=()=>{try{
    const frameMatch=src.match(/[?&]frame=([123])/),rowMatch=src.match(/[?&]row=(\d+)/),rowsMatch=src.match(/[?&]rows=(\d+)/);
    const sourceFrame=frameMatch?Number(frameMatch[1])-1:null;
    const totalRows=rowsMatch?Math.max(1,Number(rowsMatch[1])):1;
    const sourceRow=rowMatch?Math.max(0,Number(rowMatch[1])-1):0;
    const sourceWidth=sourceFrame===null?source.naturalWidth:Math.floor(source.naturalWidth/3);
    const sourceHeight=Math.floor(source.naturalHeight/totalRows);
    const sourceX=sourceFrame===null?0:sourceFrame*sourceWidth,sourceY=sourceRow*sourceHeight;
    const scan=document.createElement('canvas');scan.width=sourceWidth;scan.height=sourceHeight;const scanContext=scan.getContext('2d',{willReadFrequently:true});scanContext.drawImage(source,sourceX,sourceY,sourceWidth,sourceHeight,0,0,sourceWidth,sourceHeight);
    const shouldClean=sourceFrame!==null||src.includes('/schedule-actions/v2/');
    if(shouldClean){
      const pixels=scanContext.getImageData(0,0,scan.width,scan.height),data=pixels.data;
      // 배경색과 비슷한 얼굴·저고리 픽셀까지 전역 삭제하면 눈과 머리 주변이
      // 깨진다. 캔버스 가장자리와 실제로 연결된 밝은 체크/검은 배경만 지운다.
      const visited=new Uint8Array(scan.width*scan.height),queue=[];
      const isBackground=point=>{const index=point*4,red=data[index],green=data[index+1],blue=data[index+2],light=Math.min(red,green,blue),chroma=Math.max(red,green,blue)-light;return (light>=198&&chroma<=24)||(Math.max(red,green,blue)<=22&&chroma<=14);};
      const enqueue=point=>{if(point<0||point>=visited.length||visited[point]||!isBackground(point))return;visited[point]=1;queue.push(point);};
      for(let x=0;x<scan.width;x++){enqueue(x);enqueue((scan.height-1)*scan.width+x);}
      for(let y=0;y<scan.height;y++){enqueue(y*scan.width);enqueue(y*scan.width+scan.width-1);}
      for(let head=0;head<queue.length;head++){
        const point=queue[head],x=point%scan.width;data[point*4+3]=0;
        if(x>0)enqueue(point-1);if(x+1<scan.width)enqueue(point+1);enqueue(point-scan.width);enqueue(point+scan.width);
      }
      scanContext.putImageData(pixels,0,0);
    }
    // 마당쓸기 원화의 발밑에 흩어진 독립 낙엽/얼룩은 배우 본체와
    // 연결되지 않은 작은 조각이다. 가장 큰 연결 성분만 남겨 캐릭터와
    // 빗자루가 깨끗하게 보이게 한다.
    if(/core-sheet-v3.*row=4/.test(src)){
      const pixels=scanContext.getImageData(0,0,scan.width,scan.height),data=pixels.data;
      const visited=new Uint8Array(scan.width*scan.height),components=[];
      for(let start=0;start<visited.length;start++){
        if(visited[start]||data[start*4+3]<24)continue;
        const queue=[start],component=[];visited[start]=1;
        for(let head=0;head<queue.length;head++){
          const point=queue[head],x=point%scan.width,y=Math.floor(point/scan.width);component.push(point);
          for(const next of [point-1,point+1,point-scan.width,point+scan.width]){
            if(next<0||next>=visited.length||visited[next]||data[next*4+3]<24)continue;
            const nextX=next%scan.width;if(Math.abs(nextX-x)>1)continue;
            visited[next]=1;queue.push(next);
          }
        }
        components.push(component);
      }
      components.sort((a,b)=>b.length-a.length);
      for(const component of components.slice(1))for(const point of component)data[point*4+3]=0;
      scanContext.putImageData(pixels,0,0);
    }
    const data=scanContext.getImageData(0,0,scan.width,scan.height).data;
    let left=scan.width,top=scan.height,right=-1,bottom=-1;
    for(let y=0;y<scan.height;y++)for(let x=0;x<scan.width;x++){if(data[(y*scan.width+x)*4+3]<24)continue;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
    if(right<left||bottom<top){resolve(src);return;}
    // 넉넉한 중간 해상도로 정규화한 뒤 브라우저가 최종 크기로 한 번만
    // 축소하게 한다. 작은 296px 캔버스를 재확대하며 생기던 흐림을 막는다.
    const output=document.createElement('canvas');output.width=512;output.height=512;const context=output.getContext('2d');const width=right-left+1,height=bottom-top+1,padding=14;
    const poseScale=activityPoseRatio[activityPoseType(src)];
    const scale=Math.min((output.width-padding*2)/width,(output.height-padding*2)/height)*poseScale;const drawWidth=width*scale,drawHeight=height*scale,drawX=(output.width-drawWidth)/2,drawY=output.height-padding-drawHeight;
    context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.filter='contrast(1.065) saturate(1.035)';context.drawImage(scan,left,top,width,height,drawX,drawY,drawWidth,drawHeight);context.filter='none';const result=output.toDataURL('image/png');normalizedActivityFrameCache.set(src,result);resolve(result);
  }catch{resolve(src);}};source.onerror=()=>resolve(src);source.src=src;});
}
function applyFallbackSpriteMotion(image,step,totalSteps,activity){
  // 단일 이미지밖에 없는 일정은 억지로 PNG 전체를 흔들지 않는다.
  // 자연스러운 동작은 전용 자세 프레임이 준비된 경우에만 프레임 교체로 표현한다.
  if(image)image.style.transform='';
}
function clearFallbackSpriteMotion(image){
  if(!image)return;
  image.style.transform='';
}
async function animateNaturalFailure(actionId,image,level='mistake'){
  if(!image)return;
  if(actionId==='manners'){
    const closeHandFrames=[
      '../assets/characters/seonhwa/schedule-actions/v2/manners-pixel-v2-1.png',
      '../assets/characters/seonhwa/schedule-actions/v2/manners-pixel-v2-2.png',
      '../assets/characters/seonhwa/schedule-actions/v2/manners-pixel-v2-3.png'
    ];
    const sequence=level==='mistake'?[closeHandFrames[0],closeHandFrames[1],closeHandFrames[2],'../assets/schedule-layers-v2/childcare/hero-actions/stumble-sit-v1/seonhwa-stumble-3.png']:[closeHandFrames[0],closeHandFrames[1],closeHandFrames[2]];
    for(const [index,frame] of sequence.entries()){
      image.src=versionedScheduleAsset(frame);
      await schedulePlaybackDelay(level==='mistake'?190:160);
    }
    if(level!=='mistake'){image.style.transform='';image.style.transformOrigin='';}
    else await schedulePlaybackDelay(260);
    return;
  }
  const original=image.src;
  const forwardFallActivities=new Set(['sweeping','herbs','houseclean','martial']);
  const folder=forwardFallActivities.has(actionId)?'trip-forward-v1':'stumble-sit-v1';
  const prefix=forwardFallActivities.has(actionId)?'seonhwa-trip-forward':'seonhwa-stumble';
  const order=level==='mistake'?[1,2,3]:[1,2,1];
  image.style.transform='';
  if(actionId==='herbs'){
    image.src=versionedScheduleAsset('../assets/characters/seonhwa/schedule-actions/v2/herbs-startle-arms-up-v2.png');
    await schedulePlaybackDelay(level==='mistake'?210:175);
  }
  for(const frame of order){
    image.src=versionedScheduleAsset(`../assets/schedule-layers-v2/childcare/hero-actions/${folder}/${prefix}-${frame}.png`);
    await schedulePlaybackDelay(level==='mistake'?180:150);
  }
  if(level!=='mistake'){
    image.src=original;
    await schedulePlaybackDelay(180);
  }else await schedulePlaybackDelay(260);
}
async function animateErrandFall(image){
  if(!image)return;
  const frames=[1,2,3].map(frame=>versionedScheduleAsset(`../assets/schedule-layers-v2/childcare/hero-actions/trip-forward-v1/seonhwa-trip-forward-${frame}.png`));
  image.style.transform='';
  for(const frame of frames){
    image.src=frame;
    await schedulePlaybackDelay(175);
  }
  await schedulePlaybackDelay(260);
}
async function animateErrandNearFall(image){
  if(!image)return;
  const original=image.src;
  const stumble=[1,2,1].map(frame=>versionedScheduleAsset(`../assets/schedule-layers-v2/childcare/hero-actions/trip-forward-v1/seonhwa-trip-forward-${frame}.png`));
  image.style.transform='';
  for(const frame of stumble){
    image.src=frame;
    await schedulePlaybackDelay(150);
  }
  image.src=original;
  await schedulePlaybackDelay(170);
}
async function animateStudyPropDrop(activity,image){
  const props=document.querySelector('#stageProps');
  if(!props||!image)return;
  const isArithmetic=activity==='arithmetic';
  const propName=isArithmetic?'abacus':'paper';
  const startLeft=isArithmetic?54:31;
  const frames=isArithmetic?[
    {left:startLeft,bottom:30,rotate:-4,opacity:1,hero:'translateY(0) rotate(0deg)'},
    {left:startLeft+2,bottom:21,rotate:24,opacity:1,hero:'translateY(-1px) rotate(-4deg)'},
    {left:startLeft+5,bottom:8,rotate:68,opacity:1,hero:'translateY(1px) rotate(3deg)'},
    {left:startLeft+5,bottom:7,rotate:62,opacity:1,hero:'translateY(0) rotate(0deg)'}
  ]:[
    {left:startLeft,bottom:30,rotate:-6,opacity:1,hero:'translateY(0) rotate(0deg)'},
    {left:startLeft+4,bottom:28,rotate:14,opacity:1,hero:'translateY(-1px) rotate(-4deg)'},
    {left:startLeft+11,bottom:23,rotate:-18,opacity:1,hero:'translateY(-1px) rotate(3deg)'},
    {left:startLeft+19,bottom:16,rotate:28,opacity:1,hero:'translateY(1px) rotate(-2deg)'},
    {left:startLeft+25,bottom:8,rotate:-36,opacity:1,hero:'translateY(0) rotate(1deg)'},
    {left:startLeft+27,bottom:5,rotate:-29,opacity:1,hero:'translateY(0) rotate(0deg)'}
  ];
  props.hidden=false;
  props.className=`stage-props prop-${propName} study-prop-drop`;
  props.style.opacity='1';
  try{
    for(const frame of frames){
      props.style.setProperty('left',`${frame.left}%`,'important');
      props.style.setProperty('bottom',`${frame.bottom}%`,'important');
      props.style.setProperty('transform',`translateX(-50%) rotate(${frame.rotate}deg)`,'important');
      props.style.opacity=String(frame.opacity);
      image.style.transform=frame.hero;
      await schedulePlaybackDelay(isArithmetic?150:140);
    }
  }finally{
    image.style.transform='';
  }
}
async function animateStudyDeskCollapse(image,level='mistake'){
  if(!image)return;
  const poses=level==='mistake'?
    [
      'translate(0,0) rotate(0deg)',
      'translate(4px,5px) rotate(5deg)',
      'translate(10px,13px) rotate(12deg)',
      'translate(15px,21px) rotate(19deg)'
    ]:
    [
      'translate(0,0) rotate(0deg)',
      'translate(4px,7px) rotate(7deg)',
      'translate(8px,12px) rotate(11deg)',
      'translate(2px,3px) rotate(2deg)',
      'translate(0,0) rotate(0deg)'
    ];
  image.style.transformOrigin='58% 78%';
  try{
    for(const pose of poses){
      image.style.transform=pose;
      await schedulePlaybackDelay(level==='mistake'?180:150);
    }
    if(level==='mistake')await schedulePlaybackDelay(260);
  }finally{
    if(level!=='mistake'){image.style.transform='';image.style.transformOrigin='';}
  }
}
async function animateStudySweatWipe(activity,image){
  if(!image)return;
  const study=activity==='arithmetic'?'arithmetic':'calligraphy';
  const frames=[1,2,3].map(frame=>versionedScheduleAsset(scheduleFramePath(`${study}-pixel-v2-${frame}.png`)));
  image.style.transform='';
  image.style.transformOrigin='';
  for(const frame of frames){image.src=frame;await schedulePlaybackDelay(260);}
  await schedulePlaybackDelay(220);
}
async function animateActivitySprite(image,motion,activity,npcImage,npc,outfitId,masteryRank=0,dayIndex=0,outcome=null){
  if(activity){
    if(!outfitId)outfitId=game.autoOutfit?recommendOutfit(activity):game.equippedOutfit;
    // 신규/랜덤 활동의 전용 프레임이 빠져 있어도 일정 전체를 멈추지 않는다.
    const frames=activityFrameSet(activity)||activityFrameSet('errand')||spriteFrames.down;
    // 모든 일정은 세 장의 전용 프레임을 한 묶음으로 사용한다.
    // 제자리 활동은 손/상체 프레임만 바꾸고, 실제 이동이 필요한 마당쓸기만
    // 무대 위 위치를 바꾼다. 예전처럼 모든 동작을 좌우로 흔들지 않는다.
    const coreJobSequences={
      farmwork:[0,1,2,1,0],
      childcare:[0,1,2,1,0],
      kitchenhelp:[0,1,2,1,0],
      woodwork:[0,1,2,1,0],
      loomwork:[0,1,2,1,0],
      masonry:[0,1,2,1,0],
      clinichelp:[0,1,2,1,0],
      ferryhelp:[0,1,2,1,0],
      merchanthelp:[0,1,2,1,0]
    };
    const forcedErrandDirection=scheduleQaParams.get('qaDirection');
    const errandTravelsRight=activity==='errand'?(lockedScheduleQaMode&&['left','right'].includes(forcedErrandDirection)?forcedErrandDirection==='right':dayIndex%2===0):null;
    const errandRunCycle=[0,1,2,1,0,1,2,1,0,1];
    const fullErrandTrack=[-24,-8,8,24,40,56,72,88,104,124];
    const directedErrandTrack=errandTravelsRight===false?[...fullErrandTrack].reverse():fullErrandTrack;
    const errandFailed=activity==='errand'&&(outcome==='mistake'||outcome==='struggle');
    const errandTrack=errandFailed?directedErrandTrack.slice(0,6):directedErrandTrack;
    const sequence=coreJobSequences[activity]||
      (activity==='errand'?errandRunCycle.slice(0,errandTrack.length)
        :activity==='houseclean'?[0,1,2,1,0]
        :activity==='sweeping'?[0,1,2,1,0,1,2,1,0]
        :activity==='manners'?[0,1,2,1,0]
        :activity==='sleep'?[0,1,2,1,0]
        :activity==='tea'?[0,1,2,1,0]
        :[0,1,2,1,0]);
    const dedicatedJob=Object.hasOwn(coreJobSequences,activity);
    const staticFrameFallback=new Set(frames).size<=1;
    const delay=dedicatedJob?[360,300,240][masteryRank]:Math.max(130,(activity==='errand'?300:activity==='houseclean'?340:activity==='sweeping'?260:activity==='sleep'?430:activity==='tea'?460:240)-masteryRank*(activity==='errand'?20:30));
    const rankedSequence=masteryRank===2&&activity!=='errand'?[...sequence,...sequence.slice(1)]:sequence;
    const actor=image.parentElement;
    if(activity==='errand'){
      actor.dataset.errandDirection=errandTravelsRight?'right':'left';
      actor.dataset.errandStarting='true';
      actor.style.setProperty('left',`${errandTrack[0]}%`,'important');
      void actor.offsetWidth;
      delete actor.dataset.errandStarting;
    }
    try{
      for(const [step,frame] of rankedSequence.entries()){
        if(activity==='errand')actor.style.setProperty('left',`${errandTrack[step]}%`,'important');
        if(activity==='sweeping'){
          // 돌쇠 앞에서 멈춘 뒤 되돌아온다. 빗자루 끝까지 포함한 실제
          // 프레임 폭을 고려해 오른쪽 한계를 46%로 제한한다.
          const sweepTrack=[14,22,30,38,46,38,30,22,14];
          actor.style.setProperty('left',`${sweepTrack[step%sweepTrack.length]}%`,'important');
        }
        image.src=await outfitActivityFrame(frames[frame],outfitId);if(npc)npcImage.src=await normalizeActivityFrame((npc==='teacher'?npcFrames.teacherReading:npcFrames[npc])[frame%3]);
        if(staticFrameFallback)applyFallbackSpriteMotion(image,step,rankedSequence.length,activity);
        await schedulePlaybackDelay(delay);
      }
    }finally{
      clearFallbackSpriteMotion(image);
      if(activity==='sweeping')actor.style.removeProperty('left');
      delete actor.dataset.errandStarting;
    }
    return;
  }
  const direction=motion==='motion-walk'?'right':'down';
  const sequence=motion==='motion-walk'?[0,1,2,1,0,1,2,1]:[1,0,1,2,1,0,1];
  for(const frame of sequence){image.src=spriteFrames[direction][frame];await schedulePlaybackDelay(motion==='motion-walk'?135:170);}
}
async function playScheduleLayerScene(actionId,seonImage,rank,outcome,dayIndex){
  const inner=document.querySelector('#activityStage .stage-inner');
  const stage=document.querySelector('#activityStage');
  if(!inner||!stage)return;
  const v2Spec=await scheduleLayerV2Spec(actionId);
  const manifest=v2Spec?null:await scheduleLayerManifest();
  const spec=v2Spec||manifest.schedules?.[actionId];
  if(!spec)throw new Error(`schedule layer missing: ${actionId}`);
  const stageMap=document.querySelector('#stageMap');
  const base=`../assets/${v2Spec?'schedule-layers-v2':'schedule-layers'}/${actionId}`,v=`?v=${scheduleAssetRevision}`;
  if(stageMap&&spec.existingBackground)stageMap.src=v2Spec?`${base}/${spec.existingBackground}${v}`:spec.existingBackground;
  const make=(kind,file)=>{const img=document.createElement('img');img.className=`schedule-scene-layer layer-${kind}`;img.decoding='async';img.setAttribute('aria-hidden','true');img.src=`${base}/${file}${v}`;inner.appendChild(img);return img;};
  const failed=outcome==='mistake';
  const forcedPattern=lockedScheduleQaMode&&scheduleQaParams.get('qaSchedule')===actionId&&['success-a','success-b','fail-a','fail-b'].includes(scheduleQaForcedPattern)?scheduleQaForcedPattern:null;
  const patternKey=forcedPattern||`${failed?'fail':'success'}-${dayIndex%2===0?'a':'b'}`;
  const patternSpec=spec.patterns?.[patternKey];
  const patternFrames=v2Spec?patternSpec?.frames:patternSpec;
  const farmTillingFrames=['npc/farmer-tilling-v4/farmer-tilling-v4-1.png','npc/farmer-tilling-v4/farmer-tilling-v4-2.png','npc/farmer-tilling-v4/farmer-tilling-v4-3.png'];
  const farmChickenChaseFrames=['hero-actions/chicken-chase-v2/seonhwa-chicken-chase-1.png','hero-actions/chicken-chase-v2/seonhwa-chicken-chase-2.png','hero-actions/chicken-chase-v2/seonhwa-chicken-chase-3.png'];
  const childcareRunningFrames=['npc/child-running-v2/child-run-v2-1.png','npc/child-running-v2/child-run-v2-2.png','npc/child-running-v2/child-run-v2-3.png','npc/child-running-v3/child-run-v3-cross.png'];
  const childcareFallFrames=['npc/child-fall-v2/child-fall-v2-1.png','npc/child-fall-v2/child-fall-v2-2.png','npc/child-fall-v2/child-fall-v2-3.png'];
  const childcareChaseFrames=[...Array.from({length:6},(_,index)=>`hero-actions/chase-running-v3/seonhwa-chase-v3-${index+1}.png`),'hero-actions/chase-running-v4/seonhwa-chase-cross-v4-1.png','hero-actions/chase-running-v4/seonhwa-chase-cross-v4-2.png'];
  const childcareStumbleFrames=['hero-actions/stumble-sit-v1/seonhwa-stumble-1.png','hero-actions/stumble-sit-v1/seonhwa-stumble-2.png','hero-actions/stumble-sit-v1/seonhwa-stumble-3.png'];
  const childcareForwardFallFrames=['hero-actions/trip-forward-v1/seonhwa-trip-forward-1.png','hero-actions/trip-forward-v1/seonhwa-trip-forward-2.png','hero-actions/trip-forward-v1/seonhwa-trip-forward-3.png'];
  const childcareIdleFrames=['npc/child-idle-v2/child-idle-v2-1.png','npc/child-idle-v2/child-idle-v2-2.png','npc/child-idle-v2/child-idle-v2-3.png'];
  const childcarePlay=actionId==='childcare'&&!failed&&patternKey==='success-a';
  const npcFrames=actionId==='farmwork'?farmTillingFrames:actionId==='childcare'?(childcarePlay?childcareIdleFrames:childcareRunningFrames):(patternSpec?.npcFrames?.length===3?patternSpec.npcFrames:v2Spec?spec.npc?.frames||[]:spec.npc||[]);
  const heroFrames=actionId==='childcare'?(childcarePlay?spec.existingHeroFrames:childcareChaseFrames):actionId==='farmwork'&&patternKey==='fail-b'?farmChickenChaseFrames:patternSpec?.heroFrames?.length===3?patternSpec.heroFrames:spec.existingHeroFrames||[];
  const farmQaDirection=scheduleQaParams.get('qaDirection');
  const farmChaseTravelsRight=actionId==='farmwork'&&patternKey==='fail-b'?(lockedScheduleQaMode&&farmQaDirection?farmQaDirection==='right':Math.floor(dayIndex/14)%2===0):null;
  const childcareTravelsRight=actionId==='childcare'&&!childcarePlay?(lockedScheduleQaMode&&farmQaDirection?farmQaDirection==='right':dayIndex%2===0):null;
  const woodTransport=actionId==='woodwork'&&!failed&&Boolean(patternSpec?.woodTransport);
  const kitchenFlow=actionId==='kitchenhelp'&&!failed;
  const clinicPackingFlow=actionId==='clinichelp'&&!failed;
  const sewingThrow=actionId==='sewing'&&failed&&patternSpec?.action==='throw-cloth';
  const kitchenVegetableFrames=kitchenFlow?spec.patterns['success-a'].frames:[];
  const kitchenFireFrames=kitchenFlow?spec.patterns['success-b'].frames:[];
  const clinicHerbFrames=clinicPackingFlow?spec.patterns['success-a'].frames:[];
  const clinicPacketFrames=clinicPackingFlow?spec.patterns['success-b'].frames:[];
  const childcareHeroRunCycle=[0,6,3,1,7,4,2,5];
  const childcareNpcRunCycle=[0,3,2,3];
  const childcareTravelDistance=178;
  const childcareMinimumGap=34;
  const childcareChildStart=childcareTravelsRight===null?null:childcareTravelsRight?-20:120;
  const requiredHeroFrameCount=actionId==='childcare'&&!childcarePlay?8:3;
  const requiredNpcFrameCount=actionId==='childcare'&&!childcarePlay?4:3;
  if(heroFrames.length!==requiredHeroFrameCount||npcFrames.length!==requiredNpcFrameCount||patternFrames?.length!==3)throw new Error(`schedule layer frame count invalid: ${actionId}/${patternKey}`);
  const placement=spec.placement||{};
  const positionPercent=value=>Number.parseFloat(String(value??'').replace('%',''));
  let heroPosition=positionPercent(placement.heroLeft||'40%'),npcPosition=positionPercent(placement.npcLeft||'72%');
  // 146px 선화와 최대 178px 성인 NPC의 불투명 영역이 320px 무대에서
  // 맞닿지 않도록 중심 간격을 고정한다. 도구·작업대는 상호작용을 위해 제외한다.
  const minimumActorGap=58;
  if(Number.isFinite(heroPosition)&&Number.isFinite(npcPosition)&&Math.abs(npcPosition-heroPosition)<minimumActorGap){
    const actorsFaceRight=npcPosition>=heroPosition;
    const midpoint=(heroPosition+npcPosition)/2;
    heroPosition=Math.max(8,Math.min(92,midpoint+(actorsFaceRight?-minimumActorGap/2:minimumActorGap/2)));
    npcPosition=Math.max(8,Math.min(92,heroPosition+(actorsFaceRight?minimumActorGap:-minimumActorGap)));
    if(Math.abs(npcPosition-heroPosition)<minimumActorGap)heroPosition=npcPosition+(actorsFaceRight?-minimumActorGap:minimumActorGap);
  }
  if(childcareTravelsRight!==null){
    npcPosition=childcareChildStart;
    heroPosition=npcPosition+(childcareTravelsRight?-childcareMinimumGap:childcareMinimumGap);
    stage.dataset.childcareStarting='true';
  }
  if(childcarePlay){heroPosition=31;npcPosition=65;stage.dataset.childcarePlay='true';}
  if(kitchenFlow)stage.dataset.kitchenFlow='true';
  if(clinicPackingFlow)stage.dataset.clinicPacking='true';
  if(sewingThrow)stage.dataset.sewingThrow='true';
  const layers=[];
  stage.classList.add('schedule-layered');
  stage.dataset.actorSafeGap=String(minimumActorGap);
  stage.style.setProperty('--layer-hero-left',`${heroPosition}%`,'important');
  stage.style.setProperty('--layer-floor',placement.floorBottom||placement.heroBottom||'5%');
  stage.style.setProperty('--layer-npc-left',`${npcPosition}%`,'important');
  stage.style.setProperty('--layer-npc-scale','1');
  stage.style.setProperty('--layer-prop-left',placement.propLeft||'52%');
  stage.style.setProperty('--layer-prop-bottom',placement.propBottom||'7%');
  stage.style.setProperty('--layer-effect-left',placement.effectLeft||placement.propLeft||'52%');
  stage.style.setProperty('--layer-effect-bottom',placement.effectBottom||placement.propBottom||'7%');
  if(farmChaseTravelsRight!==null)stage.dataset.chaseDirection=farmChaseTravelsRight?'right':'left';
  if(childcareTravelsRight!==null)stage.dataset.childcareDirection=childcareTravelsRight?'right':'left';
  try{
    if(spec.backgroundOverlay)layers.push(make('background',spec.backgroundOverlay));
    const npc=make('npc',npcFrames[actionId==='farmwork'?1:0]);
    const patternLayer=v2Spec&&patternSpec?.layer==='effects'?'effect':'pattern';
    const pattern=make(`${patternLayer} ${patternKey} ${patternKey.startsWith('fail-')?'dedicated-failure':''}`,patternFrames[0]);
    if(patternSpec?.heroIncludesProp||(actionId==='farmwork'&&patternKey!=='fail-b'))pattern.hidden=true;
    layers.push(npc,pattern);
    if(actionId==='childcare'){
      void stage.offsetWidth;
      delete stage.dataset.childcareStarting;
    }
    const delay=actionId==='farmwork'&&patternKey==='fail-b'?280:actionId==='farmwork'?240:actionId==='childcare'?220:([360,300,250][rank]||300);
    const playbackLoopCount=actionId==='childcare'&&!childcarePlay?6:3;
    for(let loop=0;loop<playbackLoopCount;loop+=1){
      for(let frame=0;frame<3;frame+=1){
        let activeHeroFrame=heroFrames[frame],activeNpcFrame=npcFrames[frame],activePatternFrame=patternFrames[frame];
        if(actionId==='farmwork'&&patternKey!=='fail-b'){
          const tillingCycle=[1,2,1,2,1,2,1,2,1];
          activeNpcFrame=npcFrames[tillingCycle[loop*3+frame]];
        }
        if(actionId==='farmwork'&&patternKey==='fail-b'){
          npc.hidden=true;
          const travelStep=loop*3+frame;
          const travelProgress=travelStep/8;
          const travelsRight=farmChaseTravelsRight;
          const farmChaseCycle=[0,1,2,1,0,1,2,1,0];
          const chaseFrame=farmChaseCycle[travelStep];
          activeHeroFrame=farmChickenChaseFrames[chaseFrame];
          activePatternFrame=patternFrames[chaseFrame];
          const chaseGap=38;
          // 선화와 닭 모두 한쪽 창 밖에서 들어와 반대쪽 창 밖까지 완주한다.
          // 마지막 좌표를 무대 안에 남기면 공통 좌표 초기화 순간 선화가 뒤로
          // 되감겨 보이므로, 결과 전환 전에 확실히 화면 밖으로 보낸다.
          const heroStart=travelsRight?-25:125;
          const heroLeft=heroStart+(travelsRight?1:-1)*travelProgress*150;
          const chickenLeft=travelsRight?heroLeft+chaseGap:heroLeft-chaseGap;
          stage.style.setProperty('--layer-hero-left',`${heroLeft}%`,'important');
          stage.style.setProperty('--layer-prop-left',`${chickenLeft}%`,'important');
        }
        if(actionId==='childcare'&&!childcarePlay){
          const travelStep=loop*3+frame,travelsRight=childcareTravelsRight,totalTravelSteps=playbackLoopCount*3-1,fallStart=7,fallEnd=15,fallPhase=travelStep-fallStart,effectiveTravelStep=failed&&travelStep>fallStart?travelStep<=fallEnd?fallStart:travelStep-(fallEnd-fallStart):travelStep,progress=Math.min(1,effectiveTravelStep/totalTravelSteps);
          activeHeroFrame=childcareChaseFrames[childcareHeroRunCycle[travelStep%childcareHeroRunCycle.length]];
          activeNpcFrame=childcareRunningFrames[childcareNpcRunCycle[travelStep%childcareNpcRunCycle.length]];
          const childStart=childcareChildStart;
          const childLeft=childStart+(travelsRight?1:-1)*progress*childcareTravelDistance;
          const heroLeft=travelsRight?childLeft-childcareMinimumGap:childLeft+childcareMinimumGap;
          const fallen=failed&&travelStep>=fallStart&&travelStep<=fallEnd,fallFrame=fallPhase<3?fallPhase:fallPhase<7?2:fallPhase===7?1:0;
          const childLooksBack=fallen&&patternKey==='fail-b';
          const forcedFall=scheduleQaParams.get('qaFall');
          const fallsForward=patternKey==='fail-b'&&(forcedFall==='forward'||(forcedFall!=='seated'&&dayIndex%4===3));
          if(childLooksBack){activeHeroFrame=(fallsForward?childcareForwardFallFrames:childcareStumbleFrames)[fallFrame];activeNpcFrame=childcareIdleFrames[Math.min(2,fallFrame)];}
          if(fallen&&patternKey==='fail-a'){
            activeHeroFrame=childcareChaseFrames[0];
            activeNpcFrame=childcareFallFrames[fallFrame];
          }
          stage.style.setProperty('--layer-npc-left',`${childLeft}%`,'important');
          stage.style.setProperty('--layer-hero-left',`${heroLeft}%`,'important');
          pattern.hidden=!fallen;
          if(fallen){stage.style.setProperty('--layer-prop-left',`${patternKey==='fail-a'?childLeft:heroLeft}%`,'important');pattern.style.transform='translateX(-50%)';}
        }
        if(woodTransport){
          const travelStep=loop*3+frame,travelProgress=travelStep/8;
          const carryLeft=76-travelProgress*62;
          activeHeroFrame=heroFrames[frame];
          stage.style.setProperty('--layer-hero-left',`${carryLeft}%`,'important');
          stage.style.setProperty('--layer-prop-left',`${carryLeft+2}%`,'important');
          pattern.hidden=false;
          seonImage.style.removeProperty('transform');
          seonImage.style.setProperty('transform-origin','center bottom');
          stage.dataset.woodTransport='true';
        }
        if(kitchenFlow){
          const kitchenLeft=loop===0?'9%':loop===1?'49%':'72%',kitchenBottom=loop===0?'54%':'2%';
          activePatternFrame=loop===0?kitchenFireFrames[frame]:loop===1?kitchenVegetableFrames[frame]:kitchenVegetableFrames[2];
          stage.style.setProperty('--layer-effect-left',kitchenLeft);stage.style.setProperty('--layer-prop-left',kitchenLeft);stage.style.setProperty('--layer-effect-bottom',kitchenBottom);stage.style.setProperty('--layer-prop-bottom',kitchenBottom);
        }
        if(clinicPackingFlow){
          const clinicLeft=loop===0?'24%':loop===1?'48%':'72%';activePatternFrame=loop<2?clinicHerbFrames[frame]:clinicPacketFrames[frame];
          stage.style.setProperty('--layer-effect-left',clinicLeft);stage.style.setProperty('--layer-prop-left',clinicLeft);stage.style.setProperty('--layer-effect-bottom','1%');stage.style.setProperty('--layer-prop-bottom','1%');
        }
        if(sewingThrow){
          if(frame===1)activeHeroFrame='../../characters/seonhwa/schedule-actions/v2/herbs-startle-arms-up-v2.png';
          pattern.style.transform=frame===0?'translateX(-50%) rotate(0deg)':frame===1?'translate(8px,-18px) rotate(18deg)':'translate(78px,-42px) rotate(46deg)';
          pattern.style.opacity=frame===2?'.72':'1';
        }
        seonImage.src=v2Spec?`${base}/${activeHeroFrame}${v}`:`${activeHeroFrame}${v}`;
        npc.src=`${base}/${activeNpcFrame}${v}`;
        pattern.src=`${base}/${activePatternFrame}${v}`;
        await schedulePlaybackDelay(delay);
      }
    }
  }finally{
    // chase 좌표를 지우고 schedule-layered 클래스를 제거하기 전에 숨겨야
    // 기본 중앙 배치의 선화가 결과 전환 사이에 한 프레임 다시 나타나지 않는다.
    if(actionId==='childcare'||woodTransport||(actionId==='farmwork'&&patternKey==='fail-b'))seonImage.closest('.stage-character')?.setAttribute('hidden','');
    layers.forEach(layer=>layer.remove());
    stage.classList.remove('schedule-layered');
    delete stage.dataset.chaseDirection;
    delete stage.dataset.childcareDirection;
    delete stage.dataset.childcareStarting;
    delete stage.dataset.childcarePlay;
    delete stage.dataset.woodTransport;
    delete stage.dataset.kitchenFlow;
    delete stage.dataset.clinicPacking;
    delete stage.dataset.sewingThrow;
    delete stage.dataset.actorSafeGap;
    seonImage.style.removeProperty('transform');
    seonImage.style.removeProperty('transform-origin');
    ['--layer-hero-left','--layer-floor','--layer-npc-left','--layer-npc-scale','--layer-prop-left','--layer-prop-bottom','--layer-effect-left','--layer-effect-bottom'].forEach(name=>stage.style.removeProperty(name));
  }
}
function conditionEvent(stress,dayIndex,outcome=null){
  if(outcome==='mistake')return 'mistake';
  if(outcome==='struggle'&&stress>=55)return 'drowsy';
  return null;
}
const activitySkill={reading:'intelligence',arithmetic:'sense',manners:'manners',painting:'sensitivity',music:'sensitivity',dance:'agility',swordsmanship:'strength',spellcraft:'magic',cooking:'sense',martial:'strength',classics:'intelligence',errand:'speech',sweeping:'strength',herbs:'sense',houseclean:'sense',farmwork:'strength',childcare:'sensitivity',kitchenhelp:'sense',woodwork:'strength',loomwork:'sense',masonry:'strength',clinichelp:'intelligence',innhelp:'speech',sewing:'sense',copying:'intelligence',ferryhelp:'health',merchanthelp:'speech',accounting:'sense',tutoring:'intelligence',dungeon:'strength',rest:'mentality'};
const outcomeLabels={perfect:'완벽',success:'성공',struggle:'힘겨움',mistake:'실수',normal:'무난'};
function activityOutcomeThresholds(action,stress){
  const skill=game[activitySkill[action.id]]||0;
  const recommended=Math.max(50,Number(activityRequirements[action.id]?.[1])||100);
  const skillRatio=Math.min(2.5,skill/recommended);
  const mastery=activityProgressFor(action.id).attempts;
  const healthRatio=clampStat('health',game.health)/statMaximum('health');
  const healthBonus=healthRatio*14;
  const boundedStress=Math.max(0,Math.min(statMaximum('stress'),Number(stress)||0));
  const stressRatio=boundedStress/statMaximum('stress');
  const condition=Math.min(8,(game.mentality||0)*.04)-stressRatio*45;
  const masteryBonus=Math.min(10,Math.sqrt(mastery)*1.2);
  const success=Math.max(15,Math.min(92,32+skillRatio*20+masteryBonus+condition+healthBonus));
  const perfect=Math.max(4,success-(32-healthRatio*7));
  const struggle=Math.min(98,success+(22-healthRatio*7-stressRatio*4));
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
  if((['rest','vacation'].includes(action.id)||action.special==='date')&&['struggle','mistake'].includes(outcome))outcome='success';
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
const totalGrowthPhases=261;
const phaseStatTickDays=new Set([0,5,10]);
function phaseDailyChange(change,phaseDay=0){
  const scaled={};
  const applyGrowthStat=phaseStatTickDays.has(((Number(phaseDay)||0)%14+14)%14);
  Object.entries(change||{}).forEach(([key,value])=>{
    const numeric=Number(value)||0;
    scaled[key]=key==='stress'||numeric===0?numeric:applyGrowthStat?Math.sign(numeric)*Math.max(1,Math.round(Math.abs(numeric)*.5)):0;
  });
  const stress=Number(scaled.stress)||0;
  if(stress>0)scaled.stress=Math.max(1,Math.ceil(stress/3));
  else if(stress<0)scaled.stress=Math.min(-1,Math.round(stress/3));
  return scaled;
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
  farmwork:{perfect:['밭흙을 고르고 밭고랑을 반듯하게 완성했어요.'],normal:['호미삽으로 흙을 고르게 갈아 밭을 정돈했어요.']},
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
  cue.hidden=true;cue.textContent='';
  if(type==='mistake'){
    await new Promise(resolve=>setTimeout(resolve,180));
    return;
  }
  stageCharacter.classList.add('condition-drowsy');
  await new Promise(resolve=>setTimeout(resolve,1450));
  stageCharacter.classList.remove('condition-drowsy');
  cue.hidden=true;
}
const actions = [
  { id: 'reading', category: '교육', name: '글읽기', cost: 80, unlockAge:9, mentor:'훈장님', icon:'reading', summary: '지능 +5 · 정신력 +1 · 스트레스 +3', change: { intelligence:5, mentality:1, stress:3 } },
  { id: 'arithmetic', category: '교육', name: '셈하기', cost: 70, unlockAge:9, mentor:'훈장님', icon:'arithmetic', summary: '지능 +4 · 센스 +2 · 스트레스 +2', change: { intelligence:4, sense:2, stress:2 } },
  { id: 'manners', category: '교육', name: '예절 배우기', cost: 90, unlockAge:9, mentor:'예절 선생', icon:'manners', summary: '예절 +5 · 기품 +2 · 스트레스 +2', change: { manners:5, dignity:2, stress:2 } },
  { id: 'painting', category: '교육', name: '회화 배우기', cost: 130, unlockAge:13, mentor:'화공 스승', icon:'reading', intro:'붓끝으로 보이는 것 너머의 빛까지 담아 보거라.', summary:'감수성 +4 · 센스 +2 · 스트레스 +3', change:{sensitivity:4,sense:2,stress:3} },
  { id: 'music', category: '교육', name: '악기 배우기', cost: 140, unlockAge:13, mentor:'악기 선생', icon:'manners', intro:'소리를 서두르지 말고 먼저 네 호흡을 들어 보렴.', summary:'감수성 +3 · 기품 +2 · 스트레스 +3', change:{sensitivity:3,dignity:2,stress:3} },
  { id: 'dance', category: '교육', name: '전통 춤사위', cost: 145, unlockAge:13, mentor:'춤 선생', icon:'manners', intro:'장단을 먼저 마음에 담고, 발디딤과 손끝을 이어 보렴.', summary:'민첩 +3 · 기품 +3 · 매력 +2 · 스트레스 +3', change:{agility:3,dignity:3,charm:2,stress:3} },
  { id:'swordsmanship',category:'교육',name:'검술 수련',cost:165,unlockAge:13,unlockStats:{strength:120},mentor:'검술 사범',icon:'sweeping',intro:'칼을 휘두르기 전에 발과 호흡부터 바로 세워라.',summary:'힘 +4 · 민첩 +3 · 체력 +2 · 스트레스 +4',change:{strength:4,agility:3,health:2,stress:4}},
  { id:'spellcraft',category:'교육',name:'술법 수련',cost:175,unlockAge:13,unlockStats:{intelligence:150,mentality:100},mentor:'수호신수',icon:'herbs',intro:'기운을 억지로 잡지 말고 숨결을 따라 흐르게 하렴.',summary:'마력 +5 · 지능 +2 · 정신력 +3 · 스트레스 +4',change:{magic:5,intelligence:2,mentality:3,stress:4}},
  { id: 'classics', category: '교육', name: '경전 심화', cost: 190, unlockAge:16, mentor:'경학 스승', icon:'reading', intro:'이제 글자를 읽는 데서 그치지 말고 뜻을 논해 보자꾸나.', summary:'지능 +6 · 기품 +2 · 스트레스 +4', change:{intelligence:6,dignity:2,stress:4} },
  { id: 'errand', category: '아르바이트', name: '장터 심부름', cost: -90, unlockAge:9, mentor:'장터 상인', icon:'errand', summary: '민첩 +3 · 화술 +2 · 스트레스 +4 · 90냥 획득', change: { agility:3, speech:2, stress:4 }, retiredJob:true },
  { id: 'sweeping', category: '아르바이트', name: '마당 쓸기', cost: -70, unlockAge:9, mentor:'돌쇠', icon:'sweeping', summary: '힘 +3 · 체력 +2 · 스트레스 +3 · 70냥 획득', change: { strength:3, health:2, stress:3 }, retiredJob:true },
  { id: 'herbs', category: '아르바이트', name: '약초 줍기', cost: -80, unlockAge:9, mentor:'약초꾼', icon:'herbs', summary: '센스 +2 · 지능 +1 · 체력 +1 · 스트레스 +4 · 80냥 획득', change: { sense:2, intelligence:1, health:1, stress:4 }, retiredJob:true },
  { id: 'houseclean', category: '아르바이트', name: '집 청소', cost: -60, unlockAge:9, mentor:'신수', icon:'houseclean', summary: '힘 +2 · 센스 +2 · 체력 +1 · 스트레스 +3 · 60냥 획득', change: { strength:2, sense:2, health:1, stress:3 }, retiredJob:true },
  { id:'farmwork',category:'아르바이트',name:'농가 일손 돕기',cost:-110,unlockAge:9,mentor:'농가 어른',icon:'herbs',summary:'체력 +3 · 힘 +3 · 기품 -1 · 스트레스 +4 · 110냥 획득',change:{health:3,strength:3,dignity:-1,stress:4}},
  { id:'childcare',category:'아르바이트',name:'아이 돌보기',cost:-90,unlockAge:9,mentor:'마을 어른',icon:'houseclean',summary:'감수성 +3 · 기품 +2 · 스트레스 +4 · 90냥 획득',change:{sensitivity:3,virtue:2,stress:4}},
  { id:'kitchenhelp',category:'아르바이트',name:'주막 보조',cost:-120,unlockAge:10,unlockStats:{sense:80},mentor:'주모',icon:'arithmetic',intro:'재료 손질부터 손님상까지 주막일을 차근차근 익혀 보자.',summary:'센스 +3 · 체력 +2 · 화술 +1 · 스트레스 +4 · 120냥 획득',change:{sense:3,health:2,speech:1,stress:4}},
  { id:'woodwork',category:'아르바이트',name:'목공소 심부름',cost:-135,unlockAge:11,unlockStats:{strength:120,sense:80},mentor:'목수',icon:'sweeping',summary:'힘 +4 · 센스 +2 · 스트레스 +5 · 135냥 획득',change:{strength:4,sense:2,stress:5},retiredJob:true},
  { id:'loomwork',category:'아르바이트',name:'베틀방 돕기',cost:-140,unlockAge:11,unlockStats:{sense:120},mentor:'직조 장인',icon:'houseclean',summary:'센스 +4 · 감수성 +2 · 스트레스 +4 · 140냥 획득',change:{sense:4,sensitivity:2,stress:4},retiredJob:true},
  { id:'masonry',category:'아르바이트',name:'기와·흙벽 보조',cost:-165,unlockAge:13,unlockStats:{health:180,strength:180},mentor:'와공',icon:'sweeping',summary:'체력 +4 · 힘 +4 · 기품 -2 · 스트레스 +5 · 165냥 획득',change:{health:4,strength:4,dignity:-2,stress:5},retiredJob:true},
  { id:'clinichelp',category:'아르바이트',name:'약방 견습',cost:-170,unlockAge:11,unlockStats:{intelligence:100,sense:80},mentor:'의원',icon:'herbs',summary:'지능 +3 · 센스 +3 · 기품 +1 · 스트레스 +4 · 170냥 획득',change:{intelligence:3,sense:3,virtue:1,stress:4}},
  { id: 'innhelp', category:'아르바이트', name:'주막 운영 보조', cost:-155, unlockAge:12, unlockStats:{speech:100,health:90}, mentor:'주모', icon:'errand', intro:'이제 손님상과 계산까지 네가 살펴보렴.', summary:'화술 +3 · 체력 +2 · 센스 +1 · 스트레스 +4 · 155냥 획득', change:{speech:3,health:2,sense:1,stress:4}, retiredJob:true },
  { id: 'sewing', category:'아르바이트', name:'바느질', cost:-145, unlockAge:12, unlockStats:{sense:140,sensitivity:100}, mentor:'침선장', icon:'houseclean', intro:'베틀에서 고른 옷감을 작은 바늘땀으로 단정히 마무리하렴.', summary:'센스 +4 · 감수성 +2 · 스트레스 +3 · 145냥 획득', change:{sense:4,sensitivity:2,stress:3} },
  { id: 'copying', category:'아르바이트', name:'서책 필사', cost:-165, unlockAge:13, unlockStats:{intelligence:160}, mentor:'서책방 주인', icon:'reading', intro:'원문을 옮겨 적고 장부의 숫자까지 꼼꼼히 살펴보거라.', summary:'지능 +3 · 센스 +3 · 화술 +1 · 스트레스 +4 · 165냥 획득', change:{intelligence:3,sense:3,speech:1,stress:4} },
  { id:'ferryhelp',category:'아르바이트',name:'나루터 운송 보조',cost:-190,unlockAge:14,unlockStats:{health:150,speech:100,agility:100},mentor:'나루지기',icon:'errand',summary:'체력 +3 · 화술 +3 · 민첩 +2 · 스트레스 +5 · 190냥 획득',change:{health:3,speech:3,agility:2,stress:5},retiredJob:true},
  { id:'merchanthelp',category:'아르바이트',name:'상점 판매 보조',cost:-205,unlockAge:14,unlockStats:{speech:150,sense:150},mentor:'잡화상',icon:'errand',summary:'화술 +5 · 센스 +3 · 스트레스 +5 · 205냥 획득',change:{speech:4,sense:3,reputation:1,stress:5}},
  { id: 'accounting', category:'아르바이트', name:'상단 장부 정리', cost:-210, unlockAge:16, unlockStats:{sense:300,intelligence:250}, mentor:'상단 행수', icon:'arithmetic', intro:'숫자 하나가 상단의 신뢰를 좌우하니 꼼꼼히 살펴보거라.', summary:'센스 +4 · 지능 +2 · 화술 +2 · 스트레스 +4 · 210냥 획득', change:{sense:4,intelligence:2,speech:2,stress:4}, retiredJob:true },
  { id: 'tutoring', category:'아르바이트', name:'학동 가르치기', cost:-230, unlockAge:16, unlockStats:{intelligence:350,manners:220,speech:180}, mentor:'서당 훈장', icon:'reading', intro:'배운 바가 충분하니 이제 어린 학동에게 글과 셈, 예절을 일러 주거라.', summary:'지능 +2 · 화술 +4 · 기품 +2 · 스트레스 +5 · 230냥 획득', change:{intelligence:2,speech:4,dignity:2,stress:5} },
  { id: 'rest', category: '휴식', name: '집에서 휴식', cost: 0, summary: '14일 동안 스트레스 최대 -70 · 체력·정신력 회복', change: { health:2, mentality:2, stress:-15 } },
  { id: 'shopping', category: '휴식', name: '저잣거리', cost: 0, summary: '', change: {}, special:'market' },
  { id: 'vacation', category: '휴식', name: '바캉스', cost: 180, summary: '감수성 +3 · 매력 +1 · 스트레스 -35 · 추억 일러스트 획득', change: {sensitivity:3,charm:1,stress:-105}, special:'vacation' },
  { id: 'dungeon', category: '휴식', name: '비경 탐사', cost: 50, unlockAge:13, unlockAnyStats:[{strength:120},{magic:120}], mentor:'수호신수', icon:'herbs', intro:'성 밖의 숨은 길에는 보물과 위험이 함께 있단다. 준비를 갖추고 나서자.', summary:'체력 +2 · 힘 +2 · 마력 +2 · 스트레스 +5 · 보물 은전 획득 가능', change:{health:2,strength:2,magic:2,stress:5}, special:'dungeon' },
  {id:'holiday-seollal',category:'명절',name:'설날 행사 참가',cost:0,icon:'manners',holidayOnly:'설날',summary:'설날 고정 이벤트',change:{dignity:2,manners:2,stress:-10},special:'holiday'},
  {id:'holiday-chuseok',category:'명절',name:'한가위 달빛 아씨 경연',cost:0,icon:'manners',holidayOnly:'추석',summary:'센스·예절·기품을 겨루는 8인 궁중 경연',change:{},special:'holiday'},
  {id:'date-doyun',category:'인연',name:'도윤과 데이트',cost:100,unlockAge:16,relationId:'doyun',mentor:'도윤',icon:'manners',summary:'호감도 +12 · 감수성 +2 · 스트레스 -8',change:{sensitivity:2,stress:-8},special:'date'},
  {id:'date-seojin',category:'인연',name:'서진과 데이트',cost:100,unlockAge:16,relationId:'seojin',mentor:'서진',icon:'reading',summary:'호감도 +12 · 지능 +2 · 스트레스 -8',change:{intelligence:2,stress:-8},special:'date'},
  {id:'date-yeonwoo',category:'인연',name:'연우와 데이트',cost:100,unlockAge:16,relationId:'yeonwoo',mentor:'연우',icon:'manners',summary:'호감도 +12 · 감수성 +2 · 스트레스 -8',change:{sensitivity:2,stress:-8},special:'date'},
  {id:'date-taegyeom',category:'인연',name:'태겸과 데이트',cost:100,unlockAge:16,relationId:'taegyeom',mentor:'태겸',icon:'errand',summary:'호감도 +12 · 화술 +2 · 스트레스 -8',change:{speech:2,stress:-8},special:'date'},
  {id:'date-hyeon',category:'인연',name:'현과 데이트',cost:100,unlockAge:16,relationId:'hyeon',mentor:'현',icon:'manners',summary:'호감도 +12 · 기품 +2 · 스트레스 -8',change:{dignity:2,stress:-8},special:'date'}
];
actions.forEach(item=>{if(item.change)item.change=canonicalizeChange(item.change);});
const jobUpgradeChains=[
  ['sweeping','houseclean','farmwork','woodwork','masonry'],
  ['childcare','tutoring'],
  ['kitchenhelp','innhelp'],
  ['herbs','clinichelp'],
  ['loomwork','sewing'],
  ['errand','ferryhelp','merchanthelp'],
  ['copying','accounting']
];
const jobChainFor=id=>jobUpgradeChains.find(chain=>chain.includes(id));
function activeJobInChain(chain){return [...chain].reverse().map(id=>actions.find(action=>action.id===id)).find(action=>action&&actionUnlocked(action))||null;}
function visibleJobActions(){return jobUpgradeChains.map(activeJobInChain).filter(Boolean);}
const activityRequirements={reading:['지능',50],arithmetic:['센스',50],manners:['예절',50],painting:['감수성',150],music:['기품',150],dance:['민첩',150],swordsmanship:['힘',120],spellcraft:['지능·정신력',150],cooking:['센스',130],martial:['체력',150],classics:['지능',300],errand:['화술',40],sweeping:['힘',50],herbs:['센스',50],houseclean:['체력',50],farmwork:['힘',80],childcare:['감수성',80],kitchenhelp:['센스',80],woodwork:['힘',120],loomwork:['센스',120],masonry:['체력',140],clinichelp:['지능·센스',150],innhelp:['화술',130],sewing:['센스',140],copying:['지능',160],ferryhelp:['체력',150],merchanthelp:['화술·센스',150],accounting:['센스',300],tutoring:['지능',350],dungeon:['힘 또는 마력',120]};
const meetsStatSet=set=>Object.entries(set||{}).every(([stat,value])=>Number(game[stat]||0)>=value);
const actionUnlocked=action=>(lockedScheduleQaMode&&scheduleLayerIds.has(action.id))||(game.age>=Number(action.unlockAge||9)&&meetsStatSet(action.unlockStats)&&(!action.unlockAnyStats||action.unlockAnyStats.some(meetsStatSet))&&(!action.relationId||Boolean(relationRecord(action.relationId).dateUnlocked))&&(!action.holidayOnly||currentPhaseHoliday()?.name===action.holidayOnly));
const newlyUnlockedActions=(previousAge,nextAge)=>actions.filter(action=>!action.retiredJob&&Number(action.unlockAge||9)>previousAge&&Number(action.unlockAge||9)<=nextAge&&meetsStatSet(action.unlockStats)&&(!action.unlockAnyStats||action.unlockAnyStats.some(meetsStatSet)));
const activityRankNames=['견습','숙련','달인'];
const activityRankThresholds=[0,10,30];
const dedicatedJobIds=new Set(['farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','ferryhelp','merchanthelp']);
const jobRewardNames={farmwork:'튼튼한 곡식 자루',childcare:'아이의 종이꽃',kitchenhelp:'찬모의 조리 수첩',woodwork:'목수의 작은 자',loomwork:'명주실 타래',masonry:'와공의 기와패',clinichelp:'약방의 향약 꾸러미',ferryhelp:'나루터 통행패',merchanthelp:'상인의 행운 엽전'};
function normalizeActivityProgress(){
  if(!game.activityProgress||typeof game.activityProgress!=='object')game.activityProgress={};
  jobUpgradeChains.forEach(chain=>{
    const active=activeJobInChain(chain);if(!active)return;
    const merged={attempts:0,successes:0,phasePoints:0,completedPhases:0,streak:0,perfectStreak:0,bestStreak:0};
    chain.slice(0,chain.indexOf(active.id)).forEach(id=>{const progress=game.activityProgress[id];if(!progress)return;merged.attempts+=Number(progress.attempts)||0;merged.successes+=Number(progress.successes)||0;merged.phasePoints+=Number(progress.phasePoints)||0;merged.completedPhases+=Number(progress.completedPhases)||0;merged.streak=Math.max(merged.streak,Number(progress.streak)||0);merged.perfectStreak=Math.max(merged.perfectStreak,Number(progress.perfectStreak)||0);merged.bestStreak=Math.max(merged.bestStreak,Number(progress.bestStreak)||0);delete game.activityProgress[id];});
    const current=game.activityProgress[active.id]||{};Object.keys(merged).forEach(key=>{current[key]=key.endsWith('Streak')||key==='streak'?Math.max(Number(current[key])||0,merged[key]):(Number(current[key])||0)+merged[key];});game.activityProgress[active.id]=current;
  });
  actions.forEach(action=>{const current=game.activityProgress[action.id]||{},successes=Math.max(0,Number(current.successes)||0),legacyPoints=current.phasePoints===undefined?Math.min(30,Math.floor(successes/14)):Number(current.phasePoints);game.activityProgress[action.id]={attempts:Math.max(0,Number(current.attempts)||0),successes,phasePoints:Math.max(0,legacyPoints||0),completedPhases:Math.max(0,Number(current.completedPhases)||0),streak:Math.max(0,Number(current.streak)||0),perfectStreak:Math.max(0,Number(current.perfectStreak)||0),bestStreak:Math.max(0,Number(current.bestStreak)||0)};});
}
function activityProgressFor(id){normalizeActivityProgress();return game.activityProgress[id]||{attempts:0,successes:0,phasePoints:0,completedPhases:0,streak:0,perfectStreak:0,bestStreak:0};}
function activityRank(id){const points=activityProgressFor(id).phasePoints;return points>=activityRankThresholds[2]?2:points>=activityRankThresholds[1]?1:0;}
function activityPay(action){if(action.category!=='아르바이트')return -action.cost;return Math.round((-action.cost)*[1,1.25,1.6][activityRank(action.id)]);}
function recordActivityProgress(action,outcome){
  if(!['교육','아르바이트'].includes(action.category))return {bonusPay:0,reward:null,rankUp:null};
  const progress=activityProgressFor(action.id),succeeded=outcome!=='mistake';progress.attempts+=1;
  if(succeeded){progress.successes+=1;progress.streak+=1;progress.bestStreak=Math.max(progress.bestStreak,progress.streak);}else progress.streak=0;
  progress.perfectStreak=outcome==='perfect'?progress.perfectStreak+1:0;
  if(action.category!=='아르바이트'||progress.perfectStreak===0||progress.perfectStreak%3!==0)return {bonusPay:0,reward:null,rankUp:null};
  const rewardName=jobRewardNames[action.id];
  if(rewardName&&Math.random()<.4){
    normalizeInventory();const rewardId=`job-reward-${action.id}`;
    if(!game.items.some(item=>item.id===rewardId)){const reward={id:rewardId,type:'event',name:rewardName,description:`${action.name} 연속 대성공으로 받은 기념품`,qty:1};game.items.push(reward);return {bonusPay:0,reward,rankUp:null};}
  }
  return {bonusPay:Math.round(activityPay(action)*.5),reward:null,rankUp:null};
}
function awardPhaseMastery(dayRecords){
  const action=dayRecords[0]?.action;if(!action||!['교육','아르바이트'].includes(action.category))return null;
  const progress=activityProgressFor(action.id),previousRank=activityRank(action.id),completed=dayRecords.length;
  const diligent=dayRecords.filter(record=>record.outcome==='perfect'||record.outcome==='success'||record.outcome==='normal').length;
  const perfect=dayRecords.filter(record=>record.outcome==='perfect').length,rate=completed?diligent/completed:0;
  const earned=rate>=.9?3:rate>=.7?2:rate>=.5?1:0;
  progress.phasePoints+=earned;progress.completedPhases+=1;
  const currentRank=activityRank(action.id);
  return {action,earned,total:progress.phasePoints,rankUp:currentRank>previousRank?activityRankNames[currentRank]:null,rate:Math.round(rate*100),perfect};
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
  {id:'doyun',name:'도윤',role:'젊은 무관',motif:'최산',image:'../assets/characters/romance/doyun/vacation.png',baseSheet:'../assets/characters/romance/identity/fullbody-v2/doyun-age-13-v2.png',assetReady:true,minAge:13,ending:'무관의 아내',dialogues:['“활쏘기보다 고요한 풍경을 바라보는 일이 더 어렵군.”','“혼자 걷는 길인 줄 알았는데, 동행이 생겼군.”']},
  {id:'seojin',name:'서진',role:'선비',motif:'박보검',image:'../assets/characters/romance/seojin/vacation.png',baseSheet:'../assets/characters/romance/identity/fullbody-v2/seojin-age-13-v2.png',assetReady:true,minAge:13,ending:'선비와의 삶',dialogues:['“책에서 읽던 풍경보다 직접 보는 모습이 더 아름답군요.”','“이 경치를 시로 남긴다면 어떤 첫 구절이 좋을까요?”']},
  {id:'yeonwoo',name:'연우',role:'화공',motif:'박지훈',image:'../assets/characters/romance/yeonwoo/vacation.png',baseSheet:'../assets/characters/romance/identity/fullbody-v2/yeonwoo-age-13-v2.png',assetReady:true,minAge:13,ending:'화가의 동반자',dialogues:['“잠시 그대로 있어 봐. 이 순간을 그림에 담고 싶어.”','“같은 풍경도 함께 보는 사람에 따라 색이 달라 보여.”']},
  {id:'taegyeom',name:'태겸',role:'상단 후계자',motif:'최현욱',image:'../assets/characters/romance/taegyeom/vacation.png',baseSheet:'../assets/characters/romance/identity/fullbody-v2/taegyeom-age-13-v2.png',assetReady:true,minAge:13,ending:'대상인의 동반자',dialogues:['“좋은 물건보다 좋은 인연을 만나는 일이 더 귀하다고 하더군.”','“이 길 끝에 재미있는 장이 선다는데, 함께 가겠어?”']},
  {id:'hyeon',name:'현',role:'정체를 숨긴 왕세자',motif:'차은우',image:'../assets/characters/romance/hyeon/vacation.png',baseSheet:'../assets/characters/romance/identity/fullbody-v2/hyeon-age-13-v2.png',assetReady:true,minAge:15,ending:'왕세자의 연인',dialogues:['“내가 누구인지는 잠시 잊고, 오늘만 평범하게 걸어도 될까?”','“또 만났네. 이쯤 되면 우연이라고만 하기는 어렵겠어.”']}
];
function protagonistFullbodyForAge(age=game.age){
  return `${baseSpriteForAge(age)}?v=${scheduleAssetRevision}`;
}
function protagonistPortraitForAge(age=game.age){
  const actualAge=age>=19?18:age>=16?16:age>=13?13:9;
  return `../assets/characters/seonhwa/identity/seonhwa-face-age-${String(actualAge).padStart(2,'0')}-neutral.png`;
}
function relationPortraitAge(age=game.age){return age>=18?19:age>=16?16:13;}
function relationPortraitPath(candidate,age=game.age){return `../assets/characters/romance/identity/fullbody-v2/${candidate.id}-age-${relationPortraitAge(age)}-v2.png?v=${scheduleAssetRevision}`;}
function relationDialogueEmotion(episode){
  const cue=`${episode?.expression||''} ${episode?.pose||''}`;
  if(/놀라|충돌|날아간/.test(cue))return 'startled';
  if(/경계|날카로운|화/.test(cue))return 'angry';
  if(/난처|머쓱|고백 직전|숨긴/.test(cue))return 'shy';
  if(/안도|걱정|위험/.test(cue))return 'worried';
  if(/결심|책임|집중|판단|설명/.test(cue))return 'serious';
  if(/약속|함께|기대|손을 내미/.test(cue))return 'affectionate';
  if(/흥이 오른|장난기|웃|미소/.test(cue))return 'smile';
  return 'neutral';
}
function relationDialoguePosePath(candidate,episode,emotionOverride=null){const emotion=emotionOverride||relationDialogueEmotion(episode);return `../assets/characters/romance/dialogue-poses-v1/${candidate.id}/${candidate.id}-${emotion}-v1.png?v=${scheduleAssetRevision}`;}
function relationPortraitMarkup(candidate,className=''){return `<img class="relation-dialogue-cutout ${className}" src="${relationPortraitPath(candidate)}" alt="${candidate.name} ${relationPortraitAge()}세 전신">`;}
function applyRelationPortrait(element,candidate,episode=null){if(!element||!candidate)return;element.src=episode?relationDialoguePosePath(candidate,episode):relationPortraitPath(candidate);element.alt=episode?`${candidate.name} ${relationDialogueEmotion(episode)} 상반신`:`${candidate.name} ${relationPortraitAge()}세 전신`;}
const relationVoiceProgression={
  doyun:['아직은 내 일이라 생각했지만','지난번보다 네 발걸음을 믿게 됐어','이제는 네가 곁에 있어도 경계하지 않아','너와 걷는 길이라면 서두르지 않아도 좋겠군','앞으로도 내 옆자리를 비워 두겠다'],
  seojin:['처음 만난 분께 폐를 끼치고 싶진 않지만','당신과 나누면 어려운 글도 한결 쉬워집니다','요즘은 답보다 당신의 생각이 먼저 궁금해집니다','당신과 함께 읽은 구절은 오래 기억에 남겠군요','다음 장도 당신과 함께 넘기고 싶습니다'],
  yeonwoo:['혼자 그리는 데 익숙했는데','네가 보는 색을 조금은 알 것 같아','이제 화폭을 보면 네 표정부터 떠올라','네가 곁에 있으면 평범한 풍경도 달라 보여','마지막 빈자리는 네가 채워 줬으면 해'],
  taegyeom:['공짜 도움은 받지 않는 성격이지만','네 몫은 확실히 기억해 두겠어','이제는 셈보다 네 판단을 먼저 믿게 되네','너와 함께라면 먼 장길도 지루하지 않겠어','다음 거래가 아니라 다음 여행을 약속하지'],
  hyeon:['내 사정을 쉽게 말할 수는 없지만','너에게는 평범한 사람으로 기억되고 싶어','이상하게 네 앞에서는 경계를 늦추게 되는군','언젠가는 숨김없이 내 이야기를 들려주고 싶어','다음 문을 넘을 때는 네 곁에서 내 이름을 밝히겠다']
};
function relationReplyChoices(candidate,episode){
  const meeting=Math.max(1,Math.min(5,Number(episode?.id?.match(/-(\d)$/)?.[1])||1));
  const voice=relationVoiceProgression[candidate.id]?.[meeting-1]||'네가 말을 건네 주니 마음이 놓이는군';
  return [
    {line:`${episode?.scene||'이곳'}에서 하시던 일, 제가 도와드릴까요?`,reply:`${voice}. 함께해 준다면 고맙겠어.`,emotion:meeting>=4?'affectionate':'smile'},
    {line:`「${episode?.title||'오늘의 일'}」에 관해 조금 더 들려주세요.`,reply:`${voice}. 오늘 있었던 일부터 천천히 이야기해 줄게.`,emotion:meeting>=3?'shy':'serious'}
  ];
}
const relationScenePresentations={
  '활터':{src:'../assets/backgrounds/relations-v2/archery-ground-wide-v1.png',size:'cover',position:'center'},'집 마당':{src:'../assets/backgrounds/pixel-activities/courtyard.webp',size:'100% auto',position:'center 36%'},'마당':{src:'../assets/backgrounds/pixel-activities/courtyard.webp',size:'100% auto',position:'center 36%'},
  '산길 입구':{src:'../assets/backgrounds/pixel-activities/herb-field-v2.webp',size:'100% auto',position:'center 34%'},'어두운 길목':{src:'../assets/backgrounds/pixel-activities/herb-field.webp',size:'100% auto',position:'center 34%'},'강가 산책로':{src:'../assets/backgrounds/phase-scenes/ferry.webp',size:'100% auto',position:'center 32%'},
  '서당 서가':{src:'../assets/backgrounds/relations-v2/seodang-wide-v1.png',size:'cover',position:'center'},'서책상':{src:'../assets/backgrounds/relations-v2/seodang-wide-v1.png',size:'cover',position:'center'},'서당 마루':{src:'../assets/backgrounds/relations-v2/seodang-wide-v1.png',size:'cover',position:'center'},'서책방':{src:'../assets/backgrounds/relations-v2/seodang-wide-v1.png',size:'cover',position:'center'},
  '정자':{src:'../assets/events/holidays/moonlight-pageant/background/moonlight-courtyard-v1.webp',size:'cover',position:'center 46%'},'꽃밭 길':{src:'../assets/backgrounds/market/market-day.webp',size:'cover',position:'center 45%'},'화실':{src:'../assets/backgrounds/relations-v2/painting-studio-wide-v1.png',size:'cover',position:'center'},'연습 마루':{src:'../assets/backgrounds/phase-scenes/dance.webp',size:'100% auto',position:'center 34%'},'달빛 정원':{src:'../assets/events/holidays/moonlight-pageant/background/moonlight-courtyard-v1.webp',size:'cover',position:'center 46%'},'야외 화판 앞':{src:'../assets/backgrounds/relations-v2/painting-studio-wide-v1.png',size:'cover',position:'center'},
  '나루터':{src:'../assets/backgrounds/relations-v2/ferry-market-wide-v1.png',size:'cover',position:'center'},'저잣거리':{src:'../assets/backgrounds/market/market-day.webp',size:'cover',position:'center 45%'},'상단 장부방':{src:'../assets/backgrounds/phase-scenes/merchant.webp',size:'100% auto',position:'center 34%'},'나루터 저녁':{src:'../assets/backgrounds/relations-v2/ferry-market-wide-v1.png',size:'cover',position:'center'},'큰 장 입구':{src:'../assets/backgrounds/relations-v2/ferry-market-wide-v1.png',size:'cover',position:'center'},
  '등불 거리':{src:'../assets/backgrounds/relations-v2/official-gate-dusk-wide-v1.png',size:'cover',position:'center'},'큰 문 앞':{src:'../assets/backgrounds/relations-v2/official-gate-dusk-wide-v1.png',size:'cover',position:'center'}
};
function relationScenePresentation(episode){const presentation=relationScenePresentations[episode?.scene]||{src:'../assets/backgrounds/home/home-room-morning.webp',position:'center'};return {...presentation,size:'cover'};}
function playRelationEncounterScene(candidate,opening,resultLine='',episode=null){
  const scene=document.querySelector('#relationEncounterScene'),male=document.querySelector('#relationEncounterMale'),female=document.querySelector('#relationEncounterFemale'),speaker=document.querySelector('#relationEncounterSpeaker'),text=document.querySelector('#relationEncounterText'),next=document.querySelector('#relationEncounterNext'),choices=document.querySelector('#relationEncounterChoices');
  const presentation=relationScenePresentation(episode);scene.style.setProperty('--relation-scene-background',`url('${presentation.src}?v=${scheduleAssetRevision}')`);scene.style.setProperty('--relation-scene-size',presentation.size);scene.style.setProperty('--relation-scene-position',presentation.position);scene.dataset.location=episode?.scene||'집 안';
  applyRelationPortrait(male,candidate,episode);female.src=protagonistFullbodyForAge();female.alt=`${game.characterName||'선화'} ${game.age}세 상반신 인물화`;
  scene.hidden=false;scene.classList.remove('is-entered','is-leaving');requestAnimationFrame(()=>scene.classList.add('is-entered'));scene.dataset.speaker='male';speaker.textContent=candidate.name;text.textContent=opening||candidate.dialogues[0];choices.hidden=true;next.hidden=false;
  return new Promise(resolve=>{
    const finish=async()=>{scene.classList.add('is-leaving');await schedulePlaybackDelay(620);scene.hidden=true;scene.classList.remove('is-entered','is-leaving');scene.removeAttribute('data-speaker');male.removeAttribute('src');female.removeAttribute('src');resolve();};
    const showResult=()=>{scene.dataset.speaker='result';speaker.textContent='인연';text.textContent=resultLine||'서로의 마음에 작은 기억이 남았습니다.';next.hidden=false;next.onclick=finish;};
    const showChoices=()=>{next.hidden=true;choices.hidden=false;choices.replaceChildren(...relationReplyChoices(candidate,episode).map(choice=>{const button=document.createElement('button');button.type='button';button.textContent=choice.line;button.addEventListener('click',()=>{choices.hidden=true;next.hidden=false;scene.dataset.speaker='female';speaker.textContent=game.characterName||'선화';text.textContent=choice.line;next.onclick=()=>{male.src=relationDialoguePosePath(candidate,episode,choice.emotion);male.alt=`${candidate.name} ${choice.emotion} 상반신`;scene.dataset.speaker='male';speaker.textContent=candidate.name;text.textContent=choice.reply;next.onclick=showResult;};},{once:true});return button;}));};
    next.onclick=showChoices;
  });
}
const relationEpisodeCatalog={
  doyun:[
    {id:'doyun-1',title:'흩어진 화살',activities:['swordsmanship','martial'],scene:'활터',outfit:'젊은 무관 도포와 팔이 좁은 활동복',pose:'화살을 함께 줍고 몸을 살짝 숙인 자세',expression:'경계하다가 안심한 표정',camera:'반측면 허리샷',line:'활터에서 화살을 함께 주웠어요.'},
    {id:'doyun-2',title:'마당의 충돌',activities:['sweeping','farmwork'],scene:'집 마당',outfit:'소매를 걷은 일손복과 묶은 띠',pose:'빗자루를 들고 서로 비켜 서는 동작',expression:'머쓱하게 웃는 표정',camera:'정면 약간 아래에서 본 전신',line:'일손을 돕다 도윤과 마주쳤어요.'},
    {id:'doyun-3',title:'산길의 발자국',activities:['dungeon','herbs'],scene:'산길 입구',outfit:'짧게 묶은 여행 복장과 장갑',pose:'발자국을 짚으며 손바닥으로 흙을 살피는 동작',expression:'집중한 표정',camera:'대각선 원경 전신',line:'산길의 발자국을 함께 살폈어요.'},
    {id:'doyun-4',title:'강가의 약속',activities:['vacation'],scene:'강가 산책로',outfit:'바람에 잘 흩날리지 않는 담백한 나들이 옷',pose:'강을 향해 천천히 걷는 옆모습',expression:'차분히 말하는 표정',camera:'옆구도 허리 위 샷',line:'강가에서 도윤과 다시 만났어요.'},
    {id:'doyun-5',title:'나란히 선 활터',activities:['swordsmanship','vacation'],scene:'활터',outfit:'정돈된 무관 차림과 장식 없는 허리띠',pose:'활을 내려놓고 나란히 서서 쉬는 동작',expression:'약속을 건네는 미소',camera:'가까운 2인 반신샷',line:'도윤은 다음에 또 보자고 했어요.'}
  ],
  seojin:[
    {id:'seojin-1',title:'바뀐 서책',activities:['reading','classics'],scene:'서당 서가',outfit:'깨끗한 서생 옷과 얇은 겹깃',pose:'책장을 두 손으로 바로잡는 동작',expression:'예의 바른 첫인사',camera:'책장 옆 중경샷',line:'서책이 바뀌어 서진과 처음 말을 섞었어요.'},
    {id:'seojin-2',title:'먹이 번진 글',activities:['copying','reading'],scene:'서책상',outfit:'소매가 넓지 않은 필사복',pose:'번진 종이를 가볍게 들어 올리는 동작',expression:'난처하지만 다정한 미소',camera:'상단 사선 구도',line:'번진 글을 함께 닦아냈어요.'},
    {id:'seojin-3',title:'어려운 물음',activities:['tutoring','arithmetic'],scene:'서당 마루',outfit:'차분한 서생 차림과 매듭 장식',pose:'주판과 책을 번갈아 가리키는 동작',expression:'설명에 집중한 표정',camera:'탁자 너머 반신샷',line:'서진과 답을 맞추다 밤이 깊었어요.'},
    {id:'seojin-4',title:'정자의 시구',activities:['vacation'],scene:'정자',outfit:'가벼운 나들이 도포와 고운 허리끈',pose:'난간에 기대어 풍경을 바라보는 동작',expression:'조용히 읊조리는 표정',camera:'옆모습 원경',line:'정자에서 서진과 시를 읊었어요.'},
    {id:'seojin-5',title:'남겨 둔 책갈피',activities:['classics','vacation'],scene:'서책방',outfit:'책갈피가 잘 보이는 단정한 학자복',pose:'책갈피를 끼워 두고 돌아서는 동작',expression:'미소를 숨긴 눈빛',camera:'책상 위 클로즈업',line:'서진은 책갈피를 남기고 갔어요.'}
  ],
  yeonwoo:[
    {id:'yeonwoo-1',title:'날아간 화첩',activities:['painting','vacation'],scene:'꽃밭 길',outfit:'붓집이 달린 바람 잘 타는 작업복',pose:'날아간 화첩을 두 손으로 받아내는 동작',expression:'놀라다 안도하는 표정',camera:'전신 사선샷',line:'날아간 화첩을 주워 주며 연우를 만났어요.'},
    {id:'yeonwoo-2',title:'마르지 않은 색',activities:['painting'],scene:'화실',outfit:'색이 묻어도 자연스러운 화공 작업복',pose:'물감 접시를 옆으로 건네는 동작',expression:'차분한 집중 표정',camera:'책상 옆 중근경',line:'연우와 색을 나눠 썼어요.'},
    {id:'yeonwoo-3',title:'장단과 붓끝',activities:['music','dance'],scene:'연습 마루',outfit:'움직임이 넉넉한 공연복',pose:'장단에 맞춰 붓끝을 크게 돌리는 동작',expression:'흥이 오른 표정',camera:'움직임이 보이는 전신샷',line:'장단에 맞춰 붓이 같이 움직였어요.'},
    {id:'yeonwoo-4',title:'달빛 초상',activities:['vacation'],scene:'달빛 정원',outfit:'달빛 반사가 잘 어울리는 은은한 나들이옷',pose:'무릎을 세우고 앉아 멀리 바라보는 동작',expression:'그윽하게 미소 짓는 표정',camera:'측면 반신샷',line:'연우와 달빛을 바라봤어요.'},
    {id:'yeonwoo-5',title:'비워 둔 자리',activities:['painting','vacation'],scene:'야외 화판 앞',outfit:'바람에 살짝 흔들리는 가벼운 외출복',pose:'화폭의 빈 자리를 손끝으로 짚는 동작',expression:'함께 기다리는 눈빛',camera:'화판 너머 3/4샷',line:'연우의 화폭엔 늘 빈자리가 있었어요.'}
  ],
  taegyeom:[
    {id:'taegyeom-1',title:'잘못 묶인 짐표',activities:['errand','ferryhelp'],scene:'나루터',outfit:'짐 나르기 좋은 단단한 상단 복식',pose:'짐표를 바로 고쳐 묶는 동작',expression:'재빠르게 판단하는 표정',camera:'허리 높이 전신샷',line:'짐표를 바로잡다 태겸을 만났어요.'},
    {id:'taegyeom-2',title:'한 냥의 흥정',activities:['shopping','merchanthelp'],scene:'저잣거리',outfit:'장사꾼 느낌의 깔끔한 상단 옷',pose:'손가락으로 값을 세며 흥정하는 동작',expression:'장난기 있는 미소',camera:'맞은편 대치 구도',line:'태겸과 값부터 주고받았어요.'},
    {id:'taegyeom-3',title:'비에 젖은 장부',activities:['arithmetic','merchanthelp'],scene:'상단 장부방',outfit:'소매를 접은 계산용 복식',pose:'젖은 장부를 닦고 숫자를 세는 동작',expression:'집중하고 책임감 있는 표정',camera:'책상 위 대각선샷',line:'젖은 장부를 함께 정리했어요.'},
    {id:'taegyeom-4',title:'나루의 저녁',activities:['ferryhelp','vacation'],scene:'나루터 저녁',outfit:'바람을 덜 타는 두꺼운 외출복',pose:'짐을 내려놓고 차를 건네는 동작',expression:'조용히 웃는 표정',camera:'노을을 뒤로한 반신샷',line:'나루터에서 태겸과 차를 마셨어요.'},
    {id:'taegyeom-5',title:'함께 갈 장길',activities:['shopping','vacation'],scene:'큰 장 입구',outfit:'화사하지만 실용적인 상단 외출복',pose:'앞장서며 손을 내미는 동작',expression:'기대에 찬 미소',camera:'길을 함께 보는 2인 샷',line:'태겸은 다음 장에 같이 가자 했어요.'}
  ],
  hyeon:[
    {id:'hyeon-1',title:'평범한 윷놀이',activities:['manners','vacation'],scene:'마당',outfit:'신분을 드러내지 않는 평복',pose:'윷을 던진 뒤 고개를 기울이는 동작',expression:'웃음을 참는 표정',camera:'작은 탁자 위 반신샷',line:'윷놀이 판에서 현과 마주쳤어요.'},
    {id:'hyeon-2',title:'낯선 호위',activities:['dungeon','swordsmanship'],scene:'어두운 길목',outfit:'움직임이 편한 호위복과 짧은 망토',pose:'앞을 가로막고 몸을 낮추는 동작',expression:'경계하는 날카로운 눈빛',camera:'측면 전신샷',line:'위험한 길목에서 현이 앞을 막았어요.'},
    {id:'hyeon-3',title:'궁 밖의 소문',activities:['shopping','errand'],scene:'저잣거리',outfit:'평민처럼 보이는 단정한 외출복',pose:'사람들 틈에서 뒤돌아 듣는 동작',expression:'말을 아끼는 차분한 표정',camera:'군중 사이 3/4샷',line:'저잣거리에서 현의 이름을 들었어요.'},
    {id:'hyeon-4',title:'등불 아래 진심',activities:['vacation','spellcraft'],scene:'등불 거리',outfit:'등불빛을 받으면 은근히 빛나는 나들이복',pose:'등불을 손으로 가리며 서 있는 동작',expression:'고백 직전의 흔들리는 표정',camera:'등불 뒤 역광 반신샷',line:'등불 아래서 현이 말을 걸었어요.'},
    {id:'hyeon-5',title:'다시 만날 문',activities:['manners','vacation'],scene:'큰 문 앞',outfit:'신분을 밝힐 준비가 된 단정한 정장형 복식',pose:'문 쪽으로 한 걸음 내딛는 동작',expression:'결심한 듯한 표정',camera:'정면 대칭 구도',line:'현은 다음에 다시 보자 했어요.'}
  ]
};
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
function careerEndingScore(candidate){const masteryScore=(candidate.masteryJobs||[]).reduce((score,id)=>score+Math.min(600,activityProgressFor(id).phasePoints*20),0);return Object.entries(candidate.weights).reduce((score,[key,weight])=>score+clampStat(key,game[key])*weight,0)+Math.max(0,game.money||0)*(candidate.moneyWeight||0)+clampStat('guardianTrust',game.guardianTrust)*(candidate.guardianWeight||0)+masteryScore;}
function resolveCareerEnding(){return careerEndingCandidates.map((candidate,index)=>({...candidate,index,score:careerEndingScore(candidate)})).sort((left,right)=>right.score-left.score||left.index-right.index)[0];}
function resolveRelationEnding(){normalizeRelations();return endingRelationCandidates.map((candidate,index)=>({candidate,record:game.relations[candidate.id],index})).filter(entry=>entry.record.dateUnlocked&&entry.record.meetings>=5&&entry.record.affinity>=60&&['특별한 인연','연인'].includes(entry.record.relationship)).sort((left,right)=>right.record.affinity-left.record.affinity||right.record.meetings-left.record.meetings||left.index-right.index)[0]||null;}
function resolveEnding(){
  const career=resolveCareerEnding(),downfall=downfallEndingCandidates.find(candidate=>candidate.test()),relation=downfall?null:resolveRelationEnding();
  const category=downfall?'downfall':relation?'relation':'career';
  const outcome=downfall||relation?.candidate||career;
  const ownedCards=new Set(game.items.filter(item=>item&&item.type==='event'&&vacationIllustrations.some(card=>card.id===item.id)).map(item=>item.id));
  const strongest=[...statGroups.flatMap(group=>group.stats)].map(([key,label])=>({key,label,value:clampStat(key,game[key])})).sort((left,right)=>right.value-left.value).slice(0,3);
  return {resolvedAt:new Date().toISOString(),category,endingId:outcome.id,title:category==='relation'?outcome.ending:outcome.title,description:category==='relation'?`${outcome.name}과(와) 함께 서로의 길을 존중하며 새로운 삶을 시작했습니다.`:outcome.description,careerId:career.id,careerTitle:career.title,partnerId:relation?.candidate.id||null,partnerName:relation?.candidate.name||null,partnerRole:relation?.candidate.role||null,relationMeetings:relation?.record.meetings||0,relationAffinity:relation?.record.affinity||0,strongest,collectionCount:ownedCards.size,collectionTotal:vacationIllustrations.length};
}
function relationEndingVisual(result){
  if(result.category!=='relation'||!result.partnerId)return '';
  const candidate=endingRelationCandidates.find(item=>item.id===result.partnerId);if(!candidate)return '';
  const episode=relationEpisodeCatalog[candidate.id]?.at(-1),presentation=relationScenePresentation(episode);
  return `<figure class="relation-ending-visual" style="--ending-background:url('${presentation.src}?v=${scheduleAssetRevision}');--ending-background-position:${presentation.position}"><img class="ending-partner" src="${relationPortraitPath(candidate,19)}" alt="${candidate.name} 19세 전신"><img class="ending-seonhwa" src="${baseSpriteForAge(19)}?v=${scheduleAssetRevision}" alt="${game.characterName||'선화'} 19세 전신"><figcaption>${candidate.name}과(와) 나란히 시작하는 다음 이야기</figcaption></figure>`;
}
const soloEndingScenes={
  queen:['../assets/events/holidays/sehwa-contest/background/royal-contest-hall-v1.png','center 44%'], 'royal-scholar':['../assets/backgrounds/phase-scenes/study.webp','center 34%'], 'village-teacher':['../assets/backgrounds/seodang/seodang-day.webp','center 46%'], 'court-artist':['../assets/backgrounds/phase-scenes/painting.webp','center 34%'], 'renowned-painter':['../assets/backgrounds/pixel-activities/courtyard.webp','center 36%'], 'court-dancer':['../assets/backgrounds/phase-scenes/dance.webp','center 34%'], 'master-entertainer':['../assets/backgrounds/phase-scenes/music.webp','center 34%'], 'great-general':['../assets/backgrounds/phase-scenes/martial.webp','center 34%'], 'martial-instructor':['../assets/backgrounds/phase-scenes/martial.webp','center 34%'], 'royal-magician':['../assets/backgrounds/phase-scenes/magic.webp','center 34%'], 'secret-explorer':['../assets/backgrounds/pixel-activities/herb-field-v2.webp','center 34%'], 'great-merchant':['../assets/backgrounds/market/market-day.webp','center 45%'], 'fashion-master':['../assets/backgrounds/phase-scenes/loom.webp','center 34%'], 'royal-chef':['../assets/backgrounds/phase-scenes/kitchen.webp','center 34%'], physician:['../assets/backgrounds/phase-scenes/clinic.webp','center 34%'], diplomat:['../assets/backgrounds/phase-scenes/etiquette.webp','center 34%'], 'guardian-keeper':['../assets/events/holidays/moonlight-pageant/background/moonlight-courtyard-v1.webp','center 46%'], 'quiet-life':['../assets/backgrounds/home/home-room-morning.webp','center'],
  tyrant:['../assets/events/holidays/sehwa-contest/background/royal-contest-hall-v1.png','center 44%'], 'greedy-merchant':['../assets/backgrounds/phase-scenes/merchant.webp','center 34%'], 'fallen-magician':['../assets/backgrounds/phase-scenes/magic.webp','center 34%'], 'disgraced-warrior':['../assets/backgrounds/phase-scenes/martial.webp','center 34%'], 'fraud-merchant':['../assets/backgrounds/pixel-activities/market-errand-v2.webp','center 34%'], 'debt-runaway':['../assets/backgrounds/market/market-day.webp','center 45%'], forsaken:['../assets/backgrounds/home/home-room-morning.webp','center']
};
function careerEndingIllustrationPath(endingId){return `../assets/endings/career-illustrations-v1/${endingId}.webp?v=${scheduleAssetRevision}`;}
function soloEndingVisual(result){if(result.category==='relation')return '';if(result.category==='career')return `<figure class="solo-ending-visual career career-illustration"><img src="${careerEndingIllustrationPath(result.endingId)}" alt="${game.characterName||'선화'}의 ${result.title} 엔딩 장면"><figcaption>${result.title}</figcaption></figure>`;const [src,position]=soloEndingScenes[result.endingId]||soloEndingScenes['quiet-life'];return `<figure class="solo-ending-visual ${result.category}" style="--ending-background:url('${src}?v=${scheduleAssetRevision}');--ending-background-position:${position}"><img src="${baseSpriteForAge(19)}?v=${scheduleAssetRevision}" alt="${game.characterName||'선화'} 19세 전신"><figcaption>${result.title}</figcaption></figure>`;}
const relationEndingEpilogues={
  doyun:[{speaker:'도윤',side:'partner',line:'이제는 내가 앞서 지키는 길이 아니라, 네 곁에서 함께 걷는 길을 택하고 싶어.'},{speaker:'선화',side:'seonhwa',line:'그럼 저도 뒤따르지 않을게요. 같은 걸음으로 나란히 가요.'},{speaker:'후일담',side:'both',line:'다음 날 새벽, 두 사람은 빈 활터에서 같은 과녁을 바라보며 새로운 하루를 시작했습니다.'}],
  seojin:[{speaker:'서진',side:'partner',line:'책의 마지막 장을 덮어도 우리 이야기는 끝나지 않겠지요.'},{speaker:'선화',side:'seonhwa',line:'빈 여백은 남겨 둬요. 앞으로 함께 쓸 이야기가 많으니까요.'},{speaker:'후일담',side:'both',line:'다음 날, 두 사람은 서책방 창가에 나란히 앉아 아이들을 위한 첫 교재를 펼쳤습니다.'}],
  yeonwoo:[{speaker:'연우',side:'partner',line:'오래 비워 둔 화폭의 자리에 이제야 그리고 싶은 사람이 생겼어.'},{speaker:'선화',side:'seonhwa',line:'완성된 그림 속보다, 그림을 그리는 네 곁에 있고 싶어요.'},{speaker:'후일담',side:'both',line:'다음 날 아침, 두 사람은 문을 활짝 연 화실에서 같은 풍경을 서로 다른 빛으로 그렸습니다.'}],
  taegyeom:[{speaker:'태겸',side:'partner',line:'수많은 길의 값을 매겨 봤지만, 너와 걷는 길만은 셈할 수 없더군.'},{speaker:'선화',side:'seonhwa',line:'그 길은 거래하지 말아요. 대신 어디든 함께 가요.'},{speaker:'후일담',side:'both',line:'다음 장날, 두 사람은 첫 짐표에 서로의 이름을 나란히 적고 먼 상행길에 올랐습니다.'}],
  hyeon:[{speaker:'현',side:'partner',line:'다음에 만날 때에는 신분도 이름도 숨기지 않겠다고 약속했지.'},{speaker:'선화',side:'seonhwa',line:'저는 왕세자가 아니라, 제 앞에 선 현을 보고 대답할게요.'},{speaker:'후일담',side:'both',line:'다음 날 큰 문이 열렸고, 두 사람은 서로의 자리를 존중하며 같은 방향으로 걸어갔습니다.'}]
};
const soloEndingEpilogues={
  queen:[{speaker:'대전의 대신',side:'world',line:'전하께서 백성의 청을 먼저 들으신 뒤로 조정의 풍경이 달라졌습니다.'},{speaker:'선화',side:'seonhwa',line:'높은 자리는 멀리 보기 위한 곳이지, 사람을 내려다보는 곳이 아니에요.'},{speaker:'후일담',side:'both',line:'몇 해 뒤, 선화는 해마다 궁문을 열어 백성의 목소리를 직접 듣는 여왕으로 기억되었습니다.'}],
  'royal-scholar':[{speaker:'왕실 기록관',side:'world',line:'오늘도 전하께서 선화 학사의 기록부터 찾으셨습니다.'},{speaker:'선화',side:'seonhwa',line:'붓끝이 권세보다 오래 남는다는 마음으로 사실만 적겠습니다.'},{speaker:'후일담',side:'both',line:'선화가 정리한 기록은 훗날 나라의 잘못을 되풀이하지 않게 하는 귀한 거울이 되었습니다.'}],
  'village-teacher':[{speaker:'서당 아이들',side:'world',line:'훈장님, 오늘은 글자보다 세상 이야기를 먼저 들려주세요.'},{speaker:'선화',side:'seonhwa',line:'좋아요. 배움은 책을 읽는 데서 시작해 사람을 이해하는 데서 완성된답니다.'},{speaker:'후일담',side:'both',line:'작은 서당에서 자란 아이들은 먼 곳에 가서도 선화의 따뜻한 가르침을 잊지 않았습니다.'}],
  'court-artist':[{speaker:'도화서 화원',side:'world',line:'선화 화원의 그림에는 궁궐뿐 아니라 백성의 하루도 살아 있습니다.'},{speaker:'선화',side:'seonhwa',line:'화려한 것만 남기면 이 시대의 진짜 얼굴을 놓치게 되니까요.'},{speaker:'후일담',side:'both',line:'선화의 화첩은 궁 안과 저잣거리의 삶을 함께 담은 시대의 기록으로 남았습니다.'}],
  'renowned-painter':[{speaker:'그림을 보던 아이',side:'world',line:'이 그림을 보면 한 번도 가 본 적 없는 강가의 바람이 느껴져요.'},{speaker:'선화',side:'seonhwa',line:'그 마음이 닿았다면 그림은 이미 제 손을 떠나 네 것이 된 거란다.'},{speaker:'후일담',side:'both',line:'선화는 이름보다 그림이 먼저 길을 떠나는 화가가 되어 곳곳의 마음을 움직였습니다.'}],
  'court-dancer':[{speaker:'궁중 악사',side:'world',line:'마지막 장단이 끝났는데도 모두 숨을 쉬는 것조차 잊었습니다.'},{speaker:'선화',side:'seonhwa',line:'춤은 끝났지만 오늘 전하고 싶었던 마음은 오래 남을 거예요.'},{speaker:'후일담',side:'both',line:'선화의 춤은 절제된 기품과 힘을 함께 갖춘 궁중의 새로운 법도로 이어졌습니다.'}],
  'master-entertainer':[{speaker:'공연을 찾은 백성',side:'world',line:'선화 님의 노래와 이야기를 들으면 고단했던 하루가 가벼워집니다.'},{speaker:'선화',side:'seonhwa',line:'그 미소 하나면 오늘 무대에서 받을 값은 모두 받은 셈이에요.'},{speaker:'후일담',side:'both',line:'선화는 궁과 마을을 오가며 누구나 함께 웃을 수 있는 무대를 만들었습니다.'}],
  'great-general':[{speaker:'휘하 장수',side:'world',line:'장군께서 가장 앞에 서시니 병사들도 물러설 이유가 없습니다.'},{speaker:'선화',side:'seonhwa',line:'앞에 서는 것은 명예가 아니라 모두를 무사히 돌려보낼 책임이다.'},{speaker:'후일담',side:'both',line:'선화는 싸움을 즐기지 않되 피하지도 않는 장군으로 오래도록 국경을 지켰습니다.'}],
  'martial-instructor':[{speaker:'어린 수련생',side:'world',line:'교관님, 강해지면 누구에게도 지지 않게 되나요?'},{speaker:'선화',side:'seonhwa',line:'진짜 강함은 이길 힘보다 멈출 줄 아는 마음에서 나온단다.'},{speaker:'후일담',side:'both',line:'선화의 수련장은 힘과 절제를 함께 배우려는 이들의 든든한 터전이 되었습니다.'}],
  'royal-magician':[{speaker:'왕실 관측관',side:'world',line:'신수의 빛과 별의 흐름이 선화 술법사의 손에서 하나로 이어집니다.'},{speaker:'선화',side:'seonhwa',line:'힘을 부르는 것보다 어디에 써야 하는지 아는 일이 더 중요해요.'},{speaker:'후일담',side:'both',line:'선화는 술법을 두려움이 아닌 치유와 수호의 힘으로 바꾸어 나라에 새로운 길을 열었습니다.'}],
  'secret-explorer':[{speaker:'동행한 길잡이',side:'world',line:'지도에도 없는 길인데 선화 님은 어째서 망설이지 않습니까?'},{speaker:'선화',side:'seonhwa',line:'길이 없다는 건 아직 누군가 첫발을 내딛지 않았다는 뜻이니까요.'},{speaker:'후일담',side:'both',line:'선화가 남긴 지도와 기록은 뒤따르는 탐험가들이 무사히 돌아오는 이정표가 되었습니다.'}],
  'great-merchant':[{speaker:'상단의 행수',side:'world',line:'대방께서 정한 공정한 값 덕분에 작은 상인들도 다시 장에 나옵니다.'},{speaker:'선화',side:'seonhwa',line:'오래가는 거래는 한쪽의 이익보다 서로의 신뢰를 남겨야 해요.'},{speaker:'후일담',side:'both',line:'선화의 상단은 먼 나라까지 길을 넓혔지만 사람을 먼저 보는 원칙은 바뀌지 않았습니다.'}],
  'fashion-master':[{speaker:'젊은 침선장',side:'world',line:'스승님의 옷은 오래된 법도를 지키면서도 전에 없던 모습입니다.'},{speaker:'선화',side:'seonhwa',line:'전통은 그대로 멈추는 것이 아니라 다음 사람의 손에서 다시 피어나는 거예요.'},{speaker:'후일담',side:'both',line:'선화의 옷은 신분과 나이를 넘어 각자의 아름다움을 살리는 새로운 유행이 되었습니다.'}],
  'royal-chef':[{speaker:'수라간 나인',side:'world',line:'오늘 수라는 화려하지 않은데도 전하께서 가장 오래 기억하실 듯합니다.'},{speaker:'선화',side:'seonhwa',line:'좋은 음식은 귀한 재료보다 먹는 사람을 헤아리는 마음에서 시작해요.'},{speaker:'후일담',side:'both',line:'선화는 궁중의 맛을 백성의 식탁과 잇고 계절마다 따뜻한 한 끼를 나누었습니다.'}],
  physician:[{speaker:'회복한 환자',side:'world',line:'모두 포기했을 때 선화 의원님만 제 손을 놓지 않으셨습니다.'},{speaker:'선화',side:'seonhwa',line:'병을 고친 것은 약이지만 다시 일어선 것은 당신의 마음이에요.'},{speaker:'후일담',side:'both',line:'선화의 약방은 가난한 이도 문턱에서 돌아서지 않는 곳으로 오래 남았습니다.'}],
  diplomat:[{speaker:'먼 나라의 사절',side:'world',line:'서로 다른 말로 시작했지만 선화 공 덕분에 같은 뜻에 닿았습니다.'},{speaker:'선화',side:'seonhwa',line:'말이 다르다고 마음까지 먼 것은 아니니까요. 이제 함께 지킬 약속을 적어요.'},{speaker:'후일담',side:'both',line:'선화가 맺은 약속은 두 나라 사이에 상단과 학자, 가족들이 오가는 평화의 길이 되었습니다.'}],
  'guardian-keeper':[{speaker:'신수',side:'world',line:'처음 손을 맞잡던 아이가 이제 사람과 신수의 길을 함께 지키는구나.'},{speaker:'선화',side:'seonhwa',line:'제가 받은 빛을 혼자 간직하지 않고 모두가 돌아올 길에 밝힐게요.'},{speaker:'후일담',side:'both',line:'선화와 신수의 맹세는 오래된 균형을 회복하고 다음 수호자에게 이어졌습니다.'}],
  'quiet-life':[{speaker:'이웃 아이',side:'world',line:'선화 언니네 집은 언제 와도 따뜻한 차 냄새가 나요.'},{speaker:'선화',side:'seonhwa',line:'멀리 가지 않아도 함께 웃는 오늘이 제게는 가장 귀한 삶이란다.'},{speaker:'후일담',side:'both',line:'선화는 소중한 사람들과 계절을 돌보며 작지만 단단한 행복을 오래 지켜 갔습니다.'}],
  tyrant:[{speaker:'텅 빈 대전',side:'world',line:'명령은 온 나라에 닿았지만 진심으로 답하는 목소리는 하나도 남지 않았습니다.'},{speaker:'선화',side:'seonhwa',line:'모두가 두려워하면 복종할 줄 알았는데, 곁에 남는 사람은 없었구나.'},{speaker:'후일담',side:'both',line:'선화는 가장 높은 자리에 앉았으나 마음을 나눌 이 없이 차가운 권좌를 지켰습니다.'}],
  'greedy-merchant':[{speaker:'닫힌 장부방',side:'world',line:'곳간에는 은전이 넘쳤지만 함께 기뻐할 사람의 이름은 장부 어디에도 없었습니다.'},{speaker:'선화',side:'seonhwa',line:'모든 것에 값을 붙이다가 값으로 살 수 없는 것을 잃었구나.'},{speaker:'후일담',side:'both',line:'거대한 상단은 남았지만 선화의 문 앞에는 부탁도 안부도 찾아오지 않았습니다.'}],
  'fallen-magician':[{speaker:'희미해진 신수의 목소리',side:'world',line:'힘을 붙잡으려 할수록 우리 사이의 약속은 더 멀어졌다.'},{speaker:'선화',side:'seonhwa',line:'조금만 더 강해지면 되돌릴 수 있다고 믿었는데, 이제 빛조차 보이지 않아.'},{speaker:'후일담',side:'both',line:'선화는 금지된 술법의 흔적을 안고 홀로 떠돌며 잃어버린 약속을 뒤늦게 좇았습니다.'}],
  'disgraced-warrior':[{speaker:'닫힌 수련장',side:'world',line:'한때 환호하던 이름은 문에서 지워지고 부러진 무기만 마당에 남았습니다.'},{speaker:'선화',side:'seonhwa',line:'이기는 데만 마음을 빼앗겨 지켜야 할 것까지 내 손으로 무너뜨렸어.'},{speaker:'후일담',side:'both',line:'선화는 무관의 이름을 내려놓고 긴 시간 동안 힘을 다스리는 법을 처음부터 다시 배웠습니다.'}],
  'fraud-merchant':[{speaker:'장터의 방',side:'world',line:'선화가 모습을 보이자 상인들은 좌판을 거두고 손님들은 등을 돌렸습니다.'},{speaker:'선화',side:'seonhwa',line:'한 번의 재치로 얻은 은전보다 잃어버린 믿음이 훨씬 무겁구나.'},{speaker:'후일담',side:'both',line:'어느 장에도 머물 수 없게 된 선화는 이름을 감춘 채 먼 길을 떠돌았습니다.'}],
  'debt-runaway':[{speaker:'새벽의 빈집',side:'world',line:'독촉장이 문을 덮었고 남길 수 있는 짐은 작은 보퉁이 하나뿐이었습니다.'},{speaker:'선화',side:'seonhwa',line:'내일의 몫까지 오늘 써 버린 끝이 이렇게 가벼운 짐일 줄은 몰랐어.'},{speaker:'후일담',side:'both',line:'선화는 아무도 모르는 길로 떠나 작은 품삯부터 갚으며 다시 삶을 세워야 했습니다.'}],
  forsaken:[{speaker:'빛을 잃은 방',side:'world',line:'늘 곁을 맴돌던 신수의 기척이 사라지자 집 안에는 깊은 침묵만 남았습니다.'},{speaker:'선화',side:'seonhwa',line:'믿음을 시험하기만 했지, 내가 먼저 믿어 준 적은 없었구나.'},{speaker:'후일담',side:'both',line:'선화는 사라진 빛의 자리를 바라보며 다시 약속을 배울 긴 길을 시작했습니다.'}]
};
const careerEndingLetters={
  queen:['아버지, 오늘도 대전의 문을 열고 백성들의 청을 먼저 들었습니다.','높은 자리에 설수록 낮은 목소리에 귀 기울이라는 아버지의 가르침을 잊지 않으려 합니다.','누구도 억울하게 고개 숙이지 않는 나라를 지키겠습니다. 부디 오래 지켜봐 주세요.'],
  'royal-scholar':['아버지, 저는 왕실의 기록을 맡아 하루의 사실을 붓끝에 남기고 있습니다.','권세에 흔들리지 않는 한 줄이 훗날 나라의 잘못을 막는다는 것을 배웠습니다.','제가 배운 글을 바른 기억으로 돌려드리겠습니다. 아버지께 부끄럽지 않은 학사가 될게요.'],
  'village-teacher':['아버지, 저는 작은 서당의 훈장이 되었습니다.','삐뚤빼뚤한 첫 글자가 반듯해질 때마다 제가 받은 사랑을 아이들에게 돌려주는 기분입니다.','크게 이름나지 않아도 이 아이들의 내일을 밝혀 주는 스승으로 살겠습니다.'],
  'court-artist':['아버지, 도화서의 화원이 되어 궁궐과 백성의 하루를 함께 그리고 있습니다.','화려한 것만 남기지 말고 진짜 얼굴을 보라는 말씀을 이제야 알 것 같습니다.','제 그림이 우리가 살았던 시대를 정직하게 기억하도록 끝까지 바라보고 그리겠습니다.'],
  'renowned-painter':['아버지, 제 그림이 저보다 먼저 먼 고을을 여행한다는 소식을 들었습니다.','이름을 얻는 일보다 한 사람의 마음에 바람과 온기를 전하는 일이 더 귀하다는 것을 배웠습니다.','앞으로도 제가 본 세상을 과장하지 않고 다정하게 화폭에 담겠습니다.'],
  'court-dancer':['아버지, 궁중의 큰 연향에서 제 춤으로 마지막 장단을 맺었습니다.','한 걸음을 아름답게 보이려 수천 번 넘어지던 날들이 이제는 제 몸의 말이 되었습니다.','박수가 멎은 뒤에도 오래 남는 마음을 춤추는 사람이 되겠습니다.'],
  'master-entertainer':['아버지, 오늘도 장터의 작은 무대에서 노래와 이야기를 들려주었습니다.','고단한 얼굴에 웃음이 번지는 순간이면 제가 택한 길의 값을 충분히 받았다고 느낍니다.','궁과 마을 어디에서든 사람들의 하루를 가볍게 해 주는 재주꾼으로 살겠습니다.'],
  'great-general':['아버지, 저는 국경의 성루에서 모두가 무사히 돌아올 길을 살피고 있습니다.','앞에 선다는 것은 명예가 아니라 뒤의 사람을 지켜야 할 책임임을 매일 배웁니다.','싸움을 즐기지 않되 지켜야 할 때 물러서지 않는 장수가 되겠습니다.'],
  'martial-instructor':['아버지, 이제 저는 수련생들에게 칼을 드는 법보다 내려놓는 때를 먼저 가르칩니다.','강함은 상대를 꺾는 힘이 아니라 제 마음을 다스리는 데서 시작된다는 것을 알았습니다.','사람을 해치지 않고 지킬 줄 아는 무예를 다음 세대에 전하겠습니다.'],
  'royal-magician':['아버지, 별의 흐름과 신수의 기운을 살펴 궁과 마을의 재앙을 막고 있습니다.','힘을 부르는 재주보다 그 힘을 어디에 써야 하는지 판단하는 마음이 더 어렵고 중요했습니다.','두려움을 키우는 술법이 아니라 사람을 살리고 지키는 빛을 다루겠습니다.'],
  'secret-explorer':['아버지, 지도에 없던 산길 끝에서 오래된 유적과 돌아오는 길을 함께 찾았습니다.','첫발을 내딛는 용기만큼 뒤따를 사람에게 안전한 기록을 남기는 일이 중요했습니다.','먼 곳을 향하더라도 반드시 제 발로 돌아와 새로운 세상을 들려드리겠습니다.'],
  'great-merchant':['아버지, 제 상단의 짐이 이제 먼 나라의 장터까지 오가게 되었습니다.','한 번의 큰 이익보다 작은 상인과 오래 나누는 믿음이 더 값진 재산이라는 것을 배웠습니다.','어느 거래에서도 사람의 마음을 장부보다 먼저 살피겠습니다.'],
  'fashion-master':['아버지, 저는 사람마다 다른 삶과 몸에 어울리는 옷을 짓고 있습니다.','오래된 법도를 지키면서도 입는 이가 편안해야 전통이 다음 날로 이어진다는 것을 알았습니다.','제 손을 거친 옷이 누군가의 가장 당당한 하루가 되도록 정성껏 바느질하겠습니다.'],
  'royal-chef':['아버지, 수라간에서 계절의 재료로 따뜻한 한 상을 올리고 있습니다.','귀한 재료보다 먹는 사람의 몸과 마음을 헤아리는 일이 음식의 시작임을 배웠습니다.','궁의 맛을 백성의 식탁과 나누며 누구도 허기진 채 돌아서지 않게 하겠습니다.'],
  physician:['아버지, 제 약방에는 형편을 묻기 전에 아픈 곳부터 살피는 문이 열려 있습니다.','약이 병을 다스려도 다시 일어서는 힘은 사람의 마음과 곁을 지키는 손에서 온다는 것을 배웠습니다.','가난한 이도 문턱에서 돌아서지 않는 의원으로 오래 남겠습니다.'],
  diplomat:['아버지, 서로 다른 말과 풍습을 가진 이들과 마주 앉아 평화의 약속을 맺었습니다.','말이 다르다고 마음까지 먼 것은 아니며 먼저 듣는 사람이 길을 연다는 것을 배웠습니다.','제가 이은 길로 학자와 상인, 가족들이 두려움 없이 오가게 하겠습니다.'],
  'guardian-keeper':['아버지, 저는 신수와 함께 사람과 오래된 존재들의 경계를 지키고 있습니다.','받은 빛을 소유하지 않고 모두가 돌아올 길에 비추는 것이 수호자의 몫임을 알았습니다.','처음 제 손을 잡아 주셨던 것처럼 저도 다음 생명의 손을 놓지 않겠습니다.'],
  'quiet-life':['아버지, 저는 작은 집과 텃밭을 돌보며 계절마다 다른 차를 끓이고 있습니다.','멀리 이름을 떨치지 않아도 사랑하는 이와 웃는 오늘이 얼마나 귀한지 알게 되었습니다.','평범해서 더욱 단단한 이 행복을 오래 지키며 자주 소식 전하겠습니다.']
};
function endingEpilogueBeats(result){if(result.category==='relation')return relationEndingEpilogues[result.partnerId];if(result.category==='career')return careerEndingLetters[result.endingId]?.map((line,index,lines)=>({speaker:index===0?'아버지께':index===lines.length-1?'선화 올림':'선화의 편지',side:'seonhwa',line}));return soloEndingEpilogues[result.endingId];}
function endingEpilogueMarkup(result){const beats=endingEpilogueBeats(result);if(!beats?.length)return '';const first=beats[0],isLetter=result.category==='career';return `<section class="relation-ending-epilogue${isLetter?' ending-letter':''}" data-ending-beat="0"><small>${isLetter?'아버지께 보내는 편지':'결말 이야기'} · 1/${beats.length}</small><b>${first.speaker}</b><p>${first.line}</p><button type="button" id="endingEpilogueNext">다음</button></section>`;}
function bindEndingEpilogue(result){
  const beats=endingEpilogueBeats(result),epilogue=document.querySelector('.relation-ending-epilogue');if(!beats||!epilogue)return;
  const summary=document.querySelector('.ending-summary'),restart=document.querySelector('#endingRestart'),visual=document.querySelector('.relation-ending-visual,.solo-ending-visual');let index=0;summary.hidden=true;restart.hidden=true;
  const render=()=>{const beat=beats[index],label=result.category==='career'?'아버지께 보내는 편지':'결말 이야기';epilogue.dataset.endingBeat=String(index);epilogue.querySelector('small').textContent=`${label} · ${index+1}/${beats.length}`;epilogue.querySelector('b').textContent=beat.speaker;epilogue.querySelector('p').textContent=beat.line;epilogue.querySelector('button').textContent=index===beats.length-1?'성장 기록 보기':'다음';if(visual)visual.dataset.endingSpeaker=beat.side;};render();
  epilogue.querySelector('button').addEventListener('click',()=>{if(index<beats.length-1){index+=1;render();return;}epilogue.hidden=true;summary.hidden=false;restart.hidden=false;if(visual)visual.dataset.endingSpeaker='both';});
}
function normalizeRelations(){
  if(!game.relations||typeof game.relations!=='object')game.relations={};
  endingRelationCandidates.forEach(candidate=>{
    const saved=game.relations[candidate.id];
    const legacyMeetings=Number.isFinite(Number(saved))?Number(saved):0;
    const record=saved&&typeof saved==='object'?saved:{};
    const meetings=Math.max(0,Number(record.meetings??legacyMeetings)||0);
    const completedEpisodes=Array.isArray(record.completedEpisodes)?[...new Set(record.completedEpisodes.filter(id=>typeof id==='string'))]:[];
    const affinity=Math.max(0,Math.min(100,Number(record.affinity)||meetings*5));
    const relationship=record.relationship==='결별'?'결별':affinity>=80?'연인':affinity>=60?'특별한 인연':affinity>=35?'친구':'지인';
    game.relations[candidate.id]={meetings:Math.max(meetings,completedEpisodes.length),affinity,lastMetAt:record.lastMetAt||null,dateUnlocked:Boolean(record.dateUnlocked||(Math.max(meetings,completedEpisodes.length)>=5)),completedEpisodes,holidayFlags:record.holidayFlags&&typeof record.holidayFlags==='object'?record.holidayFlags:{},vacationMemories:Array.isArray(record.vacationMemories)?record.vacationMemories:[],relationship};
  });
}
function relationRecord(id){normalizeRelations();return game.relations[id];}
function recordRelationEncounter(candidate,episode=null){
  const record=relationRecord(candidate.id),isNew=episode&&!record.completedEpisodes.includes(episode.id);
  if(isNew){record.completedEpisodes.push(episode.id);record.meetings=Math.min(5,record.meetings+1);}
  record.affinity=Math.min(100,record.affinity+(isNew?7:2));record.lastMetAt=game.currentDate||null;
  if(record.meetings>=5)record.dateUnlocked=true;
  record.relationship=record.affinity>=80?'연인':record.affinity>=60?'특별한 인연':record.affinity>=35?'친구':'지인';
  return record;
}
function rollHolidayRelationEvent(){
  if(game.age<13)return null;
  const holiday=game.season==='봄'&&game.week===1?'설날':game.season==='가을'&&game.week===3?'추석':null;
  if(!holiday)return null;
  const year=new Date(`${game.currentDate}T00:00:00`).getFullYear(),flag=`${year}-${holiday}`;
  const eligible=endingRelationCandidates.filter(candidate=>{const record=relationRecord(candidate.id);return record.meetings>0&&!record.holidayFlags[flag];});
  if(!eligible.length)return null;
  const candidate=eligible.sort((left,right)=>relationRecord(left.id).meetings-relationRecord(right.id).meetings||relationRecord(left.id).affinity-relationRecord(right.id).affinity)[0],record=relationRecord(candidate.id);
  record.holidayFlags[flag]=true;record.affinity=Math.min(100,record.affinity+8);
  if(record.meetings<5){record.meetings+=1;record.completedEpisodes.push(`${candidate.id}-${flag}`);}
  if(record.meetings>=5)record.dateUnlocked=true;
  record.relationship=record.affinity>=80?'연인':record.affinity>=60?'특별한 인연':record.affinity>=35?'친구':'지인';
  const lines={설날:{doyun:'도윤과 새해 인사를 했어요.',seojin:'서진과 덕담을 나눴어요.',yeonwoo:'연우와 복주머니를 바꿨어요.',taegyeom:'태겸과 떡국을 먹었어요.',hyeon:'현과 윷놀이를 했어요.'},추석:{doyun:'도윤과 달을 봤어요.',seojin:'서진과 시를 읊었어요.',yeonwoo:'연우와 달빛을 그렸어요.',taegyeom:'태겸과 송편을 나눴어요.',hyeon:'현과 등불길을 걸었어요.'}};
  return {holiday,candidate,record,line:lines[holiday][candidate.id],flag};
}
const chuseokContestRanks=['예선탈락','장려상','우수상','대상'];
const moonlightContestants=[
  {id:'yeonhwa',name:'연화',scores:[95,220,360,500]},
  {id:'daon',name:'다온',scores:[115,255,410,560]},
  {id:'sodam',name:'소담',scores:[82,205,340,470]},
  {id:'gaeun',name:'가은',scores:[128,285,465,630]},
  {id:'chaeryeong',name:'채령',scores:[148,325,520,700]},
  {id:'bora',name:'보라',scores:[105,240,390,535]},
  {id:'eunseo',name:'은서',scores:[136,300,490,660]}
];
const moonlightStoryBeats=[
  '신수와 선화가 경연을 앞두고 서로의 마음과 준비를 확인했어요.',
  '선화가 무대 중앙으로 들어와 두 손을 모아 인사했어요.',
  '선화가 중앙에 머물며 팔과 손목, 손끝을 천천히 이어 춤췄어요.',
  '왕과 심사관이 센스·예절·기품을 차분히 심사했어요.',
  '여덟 참가자의 최종 순위와 수상 결과가 발표됐어요.',
  '왕이 대상 수상자에게 상을 수여하고 직접 축하했어요.',
  '대상 수상자가 자신의 반실사 모습으로 수상 소감을 전했어요.',
  '신수가 마지막 축하를 전하고 능력치와 보상이 기록되며 경연이 끝났어요.'
];
const moonlightMotionNames=['opening-dialogue','stage-enter','dance','royal-judging','ranking','award','winner-acceptance','guardian-congratulation'];
function moonlightAgeIndex(){return game.age>=18?3:game.age>=16?2:game.age>=13?1:0;}
function moonlightAssetAge(){return game.age>=18?'18':game.age>=16?'16':game.age>=13?'13':'09';}
function moonlightSeonhwaImage(){return `${baseSpriteForAge()}?v=${scheduleAssetRevision}`;}
const moonlightActingPoseMap={invitation:[1,2,3,4],prepare:[5,7,8],enter:[9,10,11],interview:[14,15,16]};
const moonlightPixelMotionMap={
  bow:['manners-pixel-1.png','manners-pixel-2.png','manners-pixel-1.png'],
  walk:['../schedule-base/walk-1-v2.png','../schedule-base/walk-2-v2.png','../schedule-base/walk-1-v2.png'],
  finish:['manners-pixel-1.png','manners-pixel-2.png','manners-pixel-1.png']
};
const moonlightAge13StageMotionMap={enter:[1,1,1],bow:[1,7,1],walk:[10,1,8],finish:[1,7,1]};
function moonlightTukkurPerformance(){
  const root='../assets';
  return {
    stage:`${root}/events/holidays/moonlight-pageant/background/moonlight-pageant-schedule-stage-v1.png?v=${scheduleAssetRevision}`,
    performer:`${root}/events/holidays/moonlight-pageant/seonhwa/seonhwa-pageant-raised-hands-pixel-v1.png?v=${scheduleAssetRevision}`
  };
}
function shuffled(items){return items.map(value=>({value,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(item=>item.value);}
function evaluateChuseokFestival(){
  const ageIndex=moonlightAgeIndex();
  const playerStats={sense:Number(game.sense)||0,manners:Number(game.manners)||0,dignity:Number(game.dignity)||0};
  const qaOverride=moonlightStandaloneQa&&scheduleQaParams.has('qaScore')?Math.max(0,Math.min(999,Number(scheduleQaParams.get('qaScore'))||0)):null;
  const playerScore=qaOverride??Math.round((playerStats.sense+playerStats.manners+playerStats.dignity)/3)+(Math.floor(Math.random()*9)-4);
  const entrants=[{id:'seonhwa',name:game.characterName||'선화',player:true,score:playerScore},...moonlightContestants.map((entry,index)=>({...entry,index,score:entry.scores[ageIndex]}))];
  const ranked=[...entrants].sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
  ranked.forEach((entry,index)=>entry.rank=index===0?'대상':index===1?'우수상':index<=3?'장려상':'예선탈락');
  const player=ranked.find(entry=>entry.player),winner=ranked[0];
  const average=(playerStats.sense+playerStats.manners+playerStats.dignity)/3;
  const reaction=average>=moonlightContestants[4].scores[ageIndex]?'자신감 넘침':average>=moonlightContestants[3].scores[ageIndex]?'차분한 자신감':average>=moonlightContestants[1].scores[ageIndex]?'긴장하지만 씩씩함':average>=moonlightContestants[2].scores[ageIndex]?'자신 없음':'부끄러움';
  return {entrants:shuffled(entrants),ranked,player,winner,overallRank:player.rank,reaction,change:canonicalizeChange({sense:2,manners:2,dignity:2,stress:-4}),opening:moonlightStoryBeats[0],summary:`한가위 달빛 아씨 경연 ${player.rank} · 종합 ${player.score}점`,prize:winner.player?'월백 옥패 노리개':null};
}
function moonlightEntrantImage(entry){
  if(entry.player)return moonlightSeonhwaImage();
  return `../assets/events/holidays/moonlight-pageant/contestants/age-${moonlightAssetAge()}/contestant-${entry.index+1}-winner-v1.png?v=${scheduleAssetRevision}`;
}
function moonlightAwardWinnerImage(entry){
  if(!entry.player)return moonlightEntrantImage(entry);
  return `${baseSpriteForAge()}?v=${scheduleAssetRevision}`;
}
function moonlightAcceptanceFrames(){
  const frame=number=>`../assets/events/holidays/moonlight-pageant/seonhwa/age-13/acceptance-v7/seonhwa-acceptance-${String(number).padStart(2,'0')}-v7.png?v=${scheduleAssetRevision}`;
  return [1,1,1,2,3,4,5,6,7,8,9,10,10,10,9,8,7,6,5,4,3,2].map(number=>({src:frame(number),fit:'1'}));
}
function moonlightLineupGestureImage(entry){
  if(moonlightAssetAge()!=='13')return '';
  const file=entry.player?'seonhwa-gesture-v1.png':`contestant-${entry.index+1}-gesture-v1.png`;
  return `../assets/events/holidays/moonlight-pageant/contestants/animation/age-13/${file}?v=${scheduleAssetRevision}`;
}
function festivalScoreboard(session,title){
  const best=Math.max(1,...session.ranked.map(entry=>entry.score));
  return `<section class="festival-scoreboard" aria-label="${title} ${session.ranked.length}인 심사표"><h3>${title}</h3>${session.ranked.map((entry,index)=>`<div class="festival-score-row ${entry.player?'is-player':''}"><b>${index+1}</b><span>${entry.name}</span><i><em style="width:${Math.max(4,Math.round(entry.score/best*100))}%"></em></i><strong>${entry.score}</strong></div>`).join('')}</section>`;
}
function festivalTitleCard(title,subtitle){return `<section class="festival-title-card"><small>왕실 명절 경연</small><h2>${title}</h2><p>${subtitle}</p></section>`;}
function festivalKingCut(line,alt){return `<section class="festival-character-cut king-cut"><img src="../assets/events/holidays/moonlight-pageant/king/king-seated-v1.png?v=${scheduleAssetRevision}" alt="${alt}"><p><b>왕</b>${line}</p></section>`;}
function festivalGuardianCut(session){
  const guardianType=game.guardianType||'hyeonmu';
  const name=game.guardianName||guardianDefs[guardianType]?.name||'신수';
  const line=session.overallRank==='대상'?`${game.characterName||'선화'}, 정말 축하해! 네가 끝까지 보여 준 마음이 달빛보다 더 빛났어.`:`${game.characterName||'선화'}, 오늘 끝까지 해낸 네가 자랑스러워. 정말 잘했어.`;
  return `<section class="festival-character-cut guardian-cut"><img src="../assets/cinematics/guardian/humanized/poses/${guardianType}-happy-transparent-v3.png?v=${scheduleAssetRevision}" alt="결과를 알려 주는 ${name}"><p><b>${name}</b>${line}</p></section>`;
}
function festivalCrowd(){return '<div class="festival-crowd" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>';}
function festivalLineup(session){return `<section class="pageant-lineup pageant-intro-lineup" aria-label="서로 다른 몸짓으로 차례를 기다리는 달빛 아씨 경연 참가자 8명">${session.entrants.map((entry,index)=>{const gesture=moonlightLineupGestureImage(entry);return `<figure class="${entry.player?'is-player ':''}${gesture?'has-gesture-frames':'static-lineup'}" style="--lineup-delay:${index*-0.31}s">${gesture?`<span class="lineup-gesture-frames" style="--lineup-frames:url('${gesture}')" role="img" aria-label="${entry.name}의 실제 대기 동작"></span>`:`<img src="${moonlightEntrantImage(entry)}" alt="${entry.name}">`}</figure>`;}).join('')}</section>`;}
function moonlightOpeningAnswer(session){
  const answers={'자신감 넘침':'장단과 발끝까지 충분히 익혔어요. 제가 준비한 달빛을 흔들림 없이 보여 드릴게요.','차분한 자신감':'호흡을 서두르지 않고 예를 다하면 제 춤의 마음이 전해질 거예요.','긴장하지만 씩씩함':'조금 떨리지만 신수가 곁에 있으니 첫 절부터 차분히 해 볼게요.','자신 없음':'아직 동작이 부족한 것 같아 걱정돼요. 그래도 배운 순서를 하나씩 떠올려 볼게요.','부끄러움':'많은 사람 앞에 서려니 떨려요… 그래도 달을 바라보며 끝까지 춰 볼게요.'};
  return answers[session.reaction]||answers['긴장하지만 씩씩함'];
}
function moonlightStatusExpression(session){
  const condition=homeCondition();
  return {happy:'joyful',sad:'sad',angry:'determined',rebellious:'determined',shocked:'startled',normal:sehwaDialogueExpression(session)}[condition]||sehwaDialogueExpression(session);
}
function moonlightOpeningDialogue(session,beat){
  const guardianType=game.guardianType||'hyeonmu';
  const name=game.guardianName||guardianDefs[guardianType]?.name||'신수',guardianTurn=beat===0,speaker=guardianTurn?name:(game.characterName||'선화');
  const line=guardianTurn?'점수보다 네가 준비한 빛을 보여 줘. 첫 절부터 마지막 발끝까지 내가 곁에서 지켜볼게.':moonlightOpeningAnswer(session);
  const condition=homeCondition(),expression=moonlightStatusExpression(session);
  const portrait=guardianTurn?`<img class="sehwa-dialogue-bust" src="../assets/cinematics/guardian/humanized/poses/${guardianType}-happy-transparent-v3.png?v=${scheduleAssetRevision}" alt="말하는 ${speaker}의 얼굴과 상체">`:`<span class="sehwa-dialogue-bust sehwa-expression expression-age-${sehwaAssetAge()} expression-${expression} pose-${condition}" style="--sehwa-expression-image:url('${sehwaExpressionAsset(expression)}')" role="img" aria-label="${condition} 상태의 ${expression} 표정으로 말하는 ${speaker}"></span>`;
  return `<section class="sehwa-opening-dialogue moonlight-opening-dialogue speaker-${guardianTurn?'guardian':'seonhwa'} status-${condition}">${portrait}<div role="dialog" aria-label="${speaker}의 대화"><p><b>${speaker}</b>${line}</p></div></section>`;
}
function festivalKingWinnerCongratulations(session){
  const winner=session.winner;
  return `<section class="festival-character-cut king-cut moonlight-award-congratulation"><img src="../assets/events/holidays/moonlight-pageant/king/king-presenting-v1.png?v=${scheduleAssetRevision}" alt="대상 수상자 ${winner.name}을 축하하는 왕"><p><b>왕</b>${winner.name}, 한가위 달빛 아씨 경연의 대상을 진심으로 축하한다. 오늘 보여 준 기품과 마음을 오래 간직하거라.</p></section>`;
}
function festivalWinnerAcceptance(session){
  const winner=session.winner,playerWinner=winner.player,name=winner.name;
  const answer=playerWinner?'감사합니다. 많이 떨렸지만 배운 장단과 마음을 끝까지 놓치지 않으려 했어요. 응원해 주신 모든 분과 이 기쁨을 나누고 싶어요.':'귀한 상을 내려 주셔서 감사합니다. 오늘의 가르침을 잊지 않고 더욱 정진하겠습니다.';
  const portrait=playerWinner
    ?`<img class="pageant-acceptance-bow is-static-gongsu" src="${baseSpriteForAge()}?v=${scheduleAssetRevision}" alt="두 손을 단정히 모으고 서서 감사 인사를 전하는 ${name}">`
    :`<img class="pageant-acceptance-bow is-contestant" src="${moonlightEntrantImage(winner)}" alt="자신의 전통 인사로 감사를 전하는 대상 수상자 ${name}">`;
  return `<section class="pageant-interview is-acceptance ${playerWinner?'is-seonhwa-winner':'is-contestant-winner'}" aria-label="대상 수상자 ${name}의 인사와 수상 소감"><figure>${portrait}<figcaption>대상 · ${name}</figcaption></figure><div><p class="pageant-interview-answer"><b>${name}</b>${answer}</p></div></section>`;
}
function renderMoonlightPageant(session,dayIndex){
  const overlay=document.querySelector('#moonlightPageant');if(!overlay)return;
  if(overlay._danceFrameTimer){window.clearInterval(overlay._danceFrameTimer);overlay._danceFrameTimer=null;}
  const beat=Math.min(7,dayIndex%8),opening=beat===0,entrance=beat===1,dance=beat===2,judging=beat===3,ranking=beat===4,award=beat===5,acceptance=beat===6,closing=beat===7;
  overlay.hidden=false;overlay.className=`moonlight-pageant festival-pm3 beat-${beat+1} motion-${moonlightMotionNames[beat]} reaction-${session.reaction.replaceAll(' ','-')}`;
  // 신수의 응원과 상태별 선화의 대답은 반드시 한 장면씩 교대한다.
  // 이 대화가 끝난 뒤에만 쯔꾸르 선화의 입장·인사·손끝 회전 무대를 노출한다.
  const performance=dance?moonlightTukkurPerformance():null;
  const hero=performance?`<section class="activity-stage pageant-schedule-window" aria-label="일정 진행 창 안의 한가위 경연 무대"><div class="stage-roof" aria-hidden="true"></div><div class="stage-inner pageant-schedule-inner"><img class="stage-map pageant-schedule-map" src="${performance.stage}" alt="보름달 아래 가로로 펼쳐진 궁중 한가위 경연 무대"><div class="stage-map-shade pageant-schedule-shade" aria-hidden="true"></div><span class="pageant-tukkur-performance" role="img" aria-label="선화가 같은 쯔꾸르 모습으로 왼쪽에서 입장해 인사하고 두 손을 머리 위에 둥글게 올린 채 반회전하여 오른쪽에서 멈춘다."><img class="pageant-tukkur-raised-hands" src="${performance.performer}" alt=""></span></div><p class="stage-caption">한가위 경연 · 선화의 인사</p></section>`:'';
  const king=judging?festivalKingCut('센스와 예절, 기품에 담긴 마음을 차분히 살펴보겠다.','한가위 경연을 심사하는 왕'):'';
  const board=ranking?festivalScoreboard(session,'참가자 8명 최종 순위와 수상 결과'):'';
  const winner=award?`<figure class="pageant-winner is-solo ${session.winner.player?'is-seonhwa':''}"><img src="${moonlightAwardWinnerImage(session.winner)}" alt="대상 수상자 ${session.winner.name}"></figure>`:'';
  const kingCongratulations=award?festivalKingWinnerCongratulations(session):'';
  const winnerAcceptance=acceptance?festivalWinnerAcceptance(session):'';
  const guardian=closing?festivalGuardianCut(session):'';
  const closingCard=closing?`<section class="festival-result-card festival-closing-card"><small>한가위 경연 완료</small><strong>${session.overallRank}</strong><p>센스 +2 · 예절 +2 · 기품 +2 · 스트레스 -4${session.prize?`<br>${session.prize} 획득`:''}</p></section>`:'';
  overlay.tabIndex=0;overlay.setAttribute('role','button');overlay.setAttribute('aria-label','화면을 터치해 다음 장면으로 이동');
  overlay.innerHTML=`${hero}${opening?moonlightOpeningDialogue(session,0):entrance?moonlightOpeningDialogue(session,1):''}${king}${board}${winner}${kingCongratulations}${winnerAcceptance}${guardian}${closingCard}`;
}
function waitForMoonlightAdvance(beat){
  // 회전 무대가 끝난 뒤에만 다음 장면 버튼을 보여, 입장·인사·정지까지 모두 읽을 수 있게 한다.
  return waitForFestivalTapAdvance(beat===2?8600:beat<=1?1600:700);
}
function waitForFestivalTapAdvance(minimumStay){
  const overlay=document.querySelector('#moonlightPageant');if(!overlay)return schedulePlaybackDelay(900);
  return new Promise(resolve=>window.setTimeout(()=>{
    overlay.classList.add('tap-ready');
    const next=document.createElement('button');next.type='button';next.className='festival-tap-next';next.textContent='다음 장면';next.setAttribute('aria-label','다음 장면으로 이동');overlay.append(next);
    const advance=async event=>{if(event.type==='keydown'&&!['Enter',' '].includes(event.key))return;overlay.removeEventListener('click',advance);overlay.removeEventListener('keydown',advance);next.remove();overlay.classList.remove('tap-ready');overlay.classList.add('is-leaving');await schedulePlaybackDelay(620);resolve();};
    overlay.addEventListener('click',advance);overlay.addEventListener('keydown',advance);
  },minimumStay));
}
function clearMoonlightPageant(){const overlay=document.querySelector('#moonlightPageant');if(overlay){if(overlay._danceFrameTimer){window.clearInterval(overlay._danceFrameTimer);overlay._danceFrameTimer=null;}overlay.hidden=true;overlay.innerHTML='';overlay.className='moonlight-pageant';}}
const sehwaContestants=[
  {id:'yeonhwa',name:'연화',scores:[118,270,455,650]},{id:'daon',name:'다온',scores:[142,315,520,720]},
  {id:'sodam',name:'소담',scores:[96,240,420,610]},{id:'gaeun',name:'가은',scores:[165,360,590,790]},
  {id:'chaeryeong',name:'채령',scores:[205,430,675,875]},{id:'bora',name:'보라',scores:[128,295,490,690]},
  {id:'eunseo',name:'은서',scores:[182,395,630,830]}
];
const sehwaStoryBeats=[
  '왕실 화원의 초청장을 펼치자 신수가 가장 먼저 선화를 응원했어요.','선화가 자신의 준비와 마음을 솔직하게 대답했어요.','「복을 그리는 왕실 세화 경연」의 막이 오르고 여덟 참가자가 화구 앞에 앉았어요.','왕이 주제 「까치·매화·새해 첫 해」를 발표했어요.','여덟 참가자가 각자의 화구와 화지를 준비했어요.','선화가 자리에 앉아 세화를 그리기 시작했어요.','먹을 곱게 갈고 붓끝을 가지런히 다듬었어요.','선화가 화지 위에 첫 먹선을 그었어요.','매화 가지와 까치의 윤곽을 완성했어요.','붉은 매화와 떠오르는 해에 색을 입혔어요.','마지막으로 낙관을 찍어 세화를 완성했어요.','여덟 참가자의 세화 점수가 차례로 집계됐어요.','선화의 최종 등급과 점수가 발표됐어요.','신수가 결과를 듣고 선화 곁으로 달려왔어요.'
];
function sehwaAgeIndex(){return game.age>=18?3:game.age>=16?2:game.age>=13?1:0;}
function sehwaAssetAge(){return game.age>=18?'18':game.age>=16?'16':game.age>=13?'13':'09';}
function sehwaFrame(kind,frame){
  if(kind==='drawing')return `../assets/events/holidays/sehwa-contest/seonhwa/drawing/age-${sehwaAssetAge()}/drawing-${frame}-v2.png?v=${scheduleAssetRevision}`;
  return `../assets/events/holidays/sehwa-contest/seonhwa/${kind}/age-${sehwaAssetAge()}/${kind}-${frame}.png?v=${scheduleAssetRevision}`;
}
const sehwaArtworkDefs={
  sensitivity:{title:'매향의 새벽',ability:'감수성',asset:'../assets/events/holidays/sehwa-contest/winning-artworks/sensitivity-v1.png',childAsset:'../assets/events/holidays/sehwa-contest/winning-artworks/sensitivity-child-v1.png'},
  charm:{title:'화접영복도',ability:'매력',asset:'../assets/events/holidays/sehwa-contest/winning-artworks/charm-v1.png',childAsset:'../assets/events/holidays/sehwa-contest/winning-artworks/charm-child-v1.png'},
  sense:{title:'까치와 풍년',ability:'센스',asset:'../assets/events/holidays/sehwa-contest/winning-artworks/sense-v1.png',childAsset:'../assets/events/holidays/sehwa-contest/winning-artworks/sense-child-v1.png'},
  dignity:{title:'해오름 학송도',ability:'기품',asset:'../assets/events/holidays/sehwa-contest/winning-artworks/dignity-v1.png',childAsset:'../assets/events/holidays/sehwa-contest/winning-artworks/dignity-child-v1.png'}
};
function sehwaArtworkAsset(theme,age){const def=sehwaArtworkDefs[theme];return Number(age)<=12?def?.childAsset:def?.asset;}
function sehwaContestYear(){
  const date=game.currentDate?new Date(`${game.currentDate}T00:00:00`):null;
  return date&&Number.isFinite(date.getTime())?date.getFullYear():616+Math.max(1,Number(game.age)||9)-8;
}
function normalizeSehwaWins(){
  const seen=new Set();
  game.sehwaWins=(Array.isArray(game.sehwaWins)?game.sehwaWins:[]).filter(record=>record&&Number.isFinite(Number(record.year))&&sehwaArtworkDefs[record.theme]&&!seen.has(Number(record.year))&&seen.add(Number(record.year))).map(record=>({...record,asset:sehwaArtworkAsset(record.theme,record.age)})).sort((a,b)=>Number(a.year)-Number(b.year));
  const latest=game.sehwaWins.at(-1)||null;
  game.latestSehwaArtwork=latest;
  return latest;
}
function selectSehwaArtwork(stats,year){
  const keys=['sensitivity','charm','sense','dignity'];
  const theme=[...keys].sort((a,b)=>(Number(stats[b])||0)-(Number(stats[a])||0)||((keys.indexOf(a)+year)%keys.length)-((keys.indexOf(b)+year)%keys.length))[0];
  const {title,ability}=sehwaArtworkDefs[theme];
  return {theme,title,ability,asset:sehwaArtworkAsset(theme,game.age)};
}
function awardSehwaArtwork(session){
  if(!session?.winner?.player)return null;
  normalizeSehwaWins();
  const year=sehwaContestYear(),existing=game.sehwaWins.find(record=>Number(record.year)===year);
  if(existing){game.latestSehwaArtwork=existing;renderHomeSehwaArtwork();return existing;}
  const stats=session.artworkStats||{charm:game.charm,sensitivity:game.sensitivity,sense:game.sense,dignity:game.dignity};
  const selected=selectSehwaArtwork(stats,year);
  const record={year,age:Number(game.age)||9,score:Number(session.player?.score)||0,wonAt:game.currentDate||null,stats:{...stats},...selected};
  game.sehwaWins.push(record);game.sehwaWins.sort((a,b)=>Number(a.year)-Number(b.year));game.latestSehwaArtwork=record;
  renderHomeSehwaArtwork();
  return record;
}
function renderHomeSehwaArtwork(){
  const gallery=document.querySelector('#homeSehwaGallery'),image=document.querySelector('#homeSehwaArtwork'),caption=document.querySelector('#homeSehwaCaption');
  if(!gallery||!image||!caption)return;
  const qaDef=sehwaArtworkDefs[sehwaHomeQaTheme],qaAge=Number(scheduleQaParams.get('qaAge'))||Number(game.age)||9;
  const record=qaDef?{year:sehwaContestYear(),age:qaAge,theme:sehwaHomeQaTheme,title:qaDef.title,ability:qaDef.ability,asset:sehwaArtworkAsset(sehwaHomeQaTheme,qaAge)}:normalizeSehwaWins();
  gallery.hidden=!record;
  if(!record){image.removeAttribute('src');image.alt='';caption.textContent='';return;}
  image.src=`${record.asset}?v=${scheduleAssetRevision}`;
  image.alt=`${record.year}년 세화 경연 우승작 ${record.title}`;
  caption.textContent=`${record.year}년 · ${record.title}`;
}
function evaluateSeollalFestival(){
  const ageIndex=sehwaAgeIndex();
  const stats={charm:Number(game.charm)||0,sensitivity:Number(game.sensitivity)||0,sense:Number(game.sense)||0,dignity:Number(game.dignity)||0};
  const weighted=Math.round(stats.charm*.35+stats.sensitivity*.50+stats.sense*.10+stats.dignity*.05);
  const qaOverride=sehwaStandaloneQa&&scheduleQaParams.has('qaScore')?Math.max(0,Math.min(999,Number(scheduleQaParams.get('qaScore'))||0)):null;
  const playerScore=qaOverride??Math.max(0,weighted+(Math.floor(Math.random()*9)-4));
  const entrants=[{id:'seonhwa',name:game.characterName||'선화',player:true,score:playerScore},...sehwaContestants.map((entry,index)=>({...entry,index,score:entry.scores[ageIndex]}))];
  const ranked=[...entrants].sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
  ranked.forEach((entry,index)=>entry.rank=index===0?'대상':index<=2?'우수상':index<=4?'장려상':'예선탈락');
  const player=ranked.find(entry=>entry.player),winner=ranked[0],median=sehwaContestants[3].scores[ageIndex];
  const reaction=playerScore>=sehwaContestants[4].scores[ageIndex]?'자신감 넘침':playerScore>=median?'차분한 자신감':playerScore>=sehwaContestants[1].scores[ageIndex]?'긴장하지만 씩씩함':playerScore>=sehwaContestants[2].scores[ageIndex]?'자신 없음':'부끄러움';
  return {entrants:shuffled(entrants),ranked,player,winner,artworkStats:stats,overallRank:player.rank,reaction,change:canonicalizeChange({charm:2,arts:3,sensitivity:2,sense:1,dignity:1,stress:-3}),summary:`복을 그리는 왕실 세화 경연 ${player.rank} · 종합 ${player.score}점`,prize:winner.player?'왕실 화원의 세화첩':null};
}
function sehwaOpeningAnswer(session){
  const answers={'자신감 넘침':'그동안 익힌 붓끝을 믿어요. 제 세화로 새해의 복을 환하게 보여 드릴게요.','차분한 자신감':'서두르지 않고 한 획씩 정성껏 그리면 제 마음이 전해질 거예요.','긴장하지만 씩씩함':'조금 떨리지만 신수가 곁에 있으니 끝까지 용기 내서 그려 볼게요.','자신 없음':'아직 부족한 것 같아 걱정되지만, 배운 순서부터 천천히 떠올려 볼게요.','부끄러움':'사람들이 모두 보고 있어서 떨려요… 그래도 종이 앞에서는 숨지 않을게요.'};
  return answers[session.reaction]||answers['긴장하지만 씩씩함'];
}
function sehwaDialogueExpression(session){
  return {'자신감 넘침':'determined','차분한 자신감':'smile','긴장하지만 씩씩함':'nervous','자신 없음':'sad','부끄러움':'shy'}[session.reaction]||'neutral';
}
// 9세 대화는 표정·포즈까지 고정된 낮은 한쪽 땋은머리 원화를 사용한다.
// 다른 연령은 해당 세트가 준비될 때까지 같은 연령의 기준 초상으로 안전하게 폴백한다.
function sehwaExpressionAsset(expression){
  const canonical={smile:'joyful',shy:'nervous',neutral:'nervous'}[expression]||expression;
  const dialogueAge=sehwaAssetAge();
  const portraitSets={
    '09':['joyful','nervous','sad','determined','startled'],
    '13':['joyful','nervous','sad','determined','startled']
  };
  if(portraitSets[dialogueAge]?.includes(canonical)){
    return `../assets/characters/seonhwa/dialogue/age-${dialogueAge}-${canonical}-lowbraid-dialogue-v1.png?v=${scheduleAssetRevision}`;
  }
  return `${baseSpriteForAge()}?v=${scheduleAssetRevision}`;
}
function sehwaOpeningDialogue(session,beat){
  if(!game.guardianType)return '';
  const name=game.guardianName||guardianDefs[game.guardianType]?.name||'신수';
  const guardianTurn=beat===0,speaker=guardianTurn?name:(game.characterName||'선화');
  const line=guardianTurn?'첫 획부터 완벽할 필요는 없어. 네가 담고 싶은 새해의 복을 보여 줘.':sehwaOpeningAnswer(session);
  const expression=sehwaDialogueExpression(session);
  const portrait=guardianTurn?`<img class="sehwa-dialogue-bust" src="../assets/cinematics/guardian/humanized/poses/${game.guardianType}-happy-transparent-v3.png?v=${scheduleAssetRevision}" alt="말하는 ${speaker}의 얼굴과 상체">`:`<span class="sehwa-dialogue-bust sehwa-expression expression-age-${sehwaAssetAge()} expression-${expression}" style="--sehwa-expression-image:url('${sehwaExpressionAsset(expression)}')" role="img" aria-label="${expression} 표정으로 말하는 ${speaker}"></span>`;
  return `<section class="sehwa-opening-dialogue speaker-${guardianTurn?'guardian':'seonhwa'}">${portrait}<div role="dialog" aria-label="${speaker}의 대화"><p><b>${speaker}</b>${line}</p></div></section>`;
}
function sehwaPreparationEnsemble(session){
  const base='../assets/events/holidays/sehwa-contest/preparation-scene/eight-entrant-v1';
  return `<section class="sehwa-eight-entrant-scene" aria-label="서로 다른 전통 땋은 머리를 한 참가자 8명이 좌우 네 자리씩 앉아 그림을 그리고 고민하는 장면"><img class="sehwa-ensemble-base" src="${base}/drawing-1-v2.png?v=${scheduleAssetRevision}" alt="왕실 세화 경연장에서 그림을 그리는 참가자 8명">${[2,3].map((frame,index)=>`<img class="sehwa-ensemble-motion-patch" src="${base}/drawing-${frame}-v2.png?v=${scheduleAssetRevision}" alt="" style="--sehwa-group-frame:${index}">`).join('')}</section>`;
}
function renderSehwaContest(session,beatIndex){
  const overlay=document.querySelector('#moonlightPageant');if(!overlay)return;
  const beat=Math.min(sehwaStoryBeats.length-1,Math.max(0,beatIndex)),opening=beat<=1,title=beat===2,intro=beat===3,preparing=beat===4,drawing=beat>=5&&beat<=10,vote=beat===11,result=beat===12,guardianResult=beat===13;
  const stageMap=document.querySelector('#stageMap'),sceneBackground=`../assets/events/holidays/sehwa-contest/background/royal-contest-hall-empty-v1.png?v=${scheduleAssetRevision}`;if(stageMap)stageMap.src=sceneBackground;if(bg)bg.src=sceneBackground;
  const frameUrls=[1,2,3].map(frame=>sehwaFrame('drawing',frame)),brushBase='../assets/events/holidays/sehwa-contest/seonhwa/drawing/age-13/painting-brush-10fps-v2',brushFrames=Array.from({length:10},(_,index)=>`${brushBase}/frame-${String(index+1).padStart(2,'0')}.png?v=${scheduleAssetRevision}`);
  const hero=drawing?(beat===5?`<span class="sehwa-hero is-brush-frames" style="--sehwa-brush-final:url('${brushFrames[9]}')" role="img" aria-label="외땋기와 댕기를 한 선화가 정면의 고정된 책상에서 손과 붓끝만 움직여 5초 동안 세화를 그리는 모습">${brushFrames.map((src,index)=>`<img src="${src}" alt="" style="--sehwa-brush-frame:${index}">`).join('')}</span>`:`<span class="sehwa-hero is-drawing" style="--sehwa-f1:url('${frameUrls[0]}');--sehwa-f2:url('${frameUrls[1]}');--sehwa-f3:url('${frameUrls[2]}')" role="img" aria-label="${sehwaStoryBeats[beat]}"></span>`):'';
  const titleCard=title?festivalTitleCard('복을 그리는 왕실 세화 경연','새해의 복을 한 폭의 세화에 담는 설날 행사'):'';
  const guardian=guardianResult?festivalGuardianCut(session):'';
  const board=vote?festivalScoreboard(session,'8인 세화 심사'):result?`<section class="festival-result-card"><small>최종 결과</small><strong>${session.overallRank}</strong><p>${session.player.score}점 · ${session.reaction}</p></section>`:'';
  const king=intro?festivalKingCut('새해의 복을 담아 까치와 매화, 첫 해를 한 폭에 그려 보이거라.','세화 경연의 주제를 알리는 왕'):'';
  overlay.hidden=false;overlay.className=`moonlight-pageant sehwa-contest festival-pm3 beat-${beat+1} reaction-${session.reaction.replaceAll(' ','-')}`;
  overlay.tabIndex=0;overlay.setAttribute('role','button');overlay.setAttribute('aria-label','화면을 터치해 다음 장면으로 이동');
  overlay.innerHTML=`${titleCard}${hero}${guardian}${opening?sehwaOpeningDialogue(session,beat):''}${preparing?sehwaPreparationEnsemble(session):''}${king}${board}`;
}
function waitForSehwaAdvance(beat){
  const minimumStay=beat===5?5000:beat<=1?1600:700;
  return waitForFestivalTapAdvance(minimumStay);
}
function presentHolidayRelation(){
  if(!pendingHolidayRelation)return false;
  const event=pendingHolidayRelation;pendingHolidayRelation=null;panel.hidden=true;
  playRelationEncounterScene(event.candidate,event.line,`호감 +8 · ${event.record.affinity} · ${event.record.meetings}/5 · ${event.record.relationship}`).then(()=>{if(!presentActivityUnlocks())openVisitingMerchant();queueAutoSave();});
  return true;
}
function nextRelationEpisode(candidate,activityId){return (relationEpisodeCatalog[candidate.id]||[]).find(episode=>episode.activities.includes(activityId)&&!relationRecord(candidate.id).completedEpisodes.includes(episode.id))||null;}
function maybeScheduleRelationEncounter(action){
  if(game.age<13||action.id==='vacation'||Math.random()>=.14)return null;
  const eligible=endingRelationCandidates.map(candidate=>({candidate,episode:nextRelationEpisode(candidate,action.id)})).filter(entry=>entry.episode);
  if(!eligible.length)return null;
  const minimum=Math.min(...eligible.map(entry=>relationRecord(entry.candidate.id).meetings));
  const pool=eligible.filter(entry=>relationRecord(entry.candidate.id).meetings===minimum),picked=pool[Math.floor(Math.random()*pool.length)];
  recordRelationEncounter(picked.candidate,picked.episode);return picked;
}
function balancedRelationCandidate(candidates){
  if(!candidates.length)return null;
  const minimum=Math.min(...candidates.map(candidate=>relationRecord(candidate.id).meetings));
  const pool=candidates.filter(candidate=>relationRecord(candidate.id).meetings<=minimum+1);
  return pool[Math.floor(Math.random()*pool.length)];
}
function relationOverlayCaption(candidate,episode){
  return episode?.title?`${candidate.name} · ${episode.title}`:candidate.name;
}
const vacationRelationDialogue={
  doyun:{open:'바람이 좋군. 함께 걷겠나?',reply:'그래. 천천히 가자.',close:'네 곁이라면 서두르지 않아도 되겠어.'},
  seojin:{open:'이 풍경, 한 줄로 남겨 볼래?',reply:'오늘은 글보다 오래 기억할래.',close:'그 답이 더 마음에 드는군.'},
  yeonwoo:{open:'잠시 그대로 있어 줄래?',reply:'또 나를 그리고 싶어?',close:'응. 지금 네 표정은 놓치기 싫어.'},
  taegyeom:{open:'좋은 길을 찾았어. 같이 갈래?',reply:'이번엔 어디로 데려가려고?',close:'네가 웃을 만한 곳으로.'},
  hyeon:{open:'오늘만은 신분도 근심도 잊자.',reply:'그럼 그냥 현으로 있을 거야?',close:'네 앞에서는 늘 그러고 싶어.'}
};
function compactVacationDialogue(relation,episode){
  const scripted=vacationRelationDialogue[relation.id];
  if(scripted)return scripted;
  const fallback=episode?.line||relation.dialogues[Math.floor(Math.random()*relation.dialogues.length)];
  return {open:fallback,reply:'그래, 조금 더 함께 걷자.',close:'오늘을 오래 기억하겠어.'};
}
function waitForVacationTap(label='화면을 터치해 계속',buttonOnly=false){
  const scene=document.querySelector('#vacationScene'),button=document.querySelector('#vacationNext');
  button.textContent=label;
  button.hidden=false;
  return new Promise(resolve=>{
    const target=buttonOnly?button:scene;
    const advance=event=>{event.preventDefault();target.removeEventListener('click',advance);resolve();};
    target.addEventListener('click',advance,{once:true});
  });
}
function chooseVacationCompanion(){
  normalizeRelations();
  const eligible=endingRelationCandidates
    .map(candidate=>({candidate,episode:nextRelationEpisode(candidate,'vacation')}))
    .filter(entry=>{
      const record=relationRecord(entry.candidate.id);
      return Boolean(
        entry.episode
        && record.dateUnlocked
        && record.meetings>=5
        && record.affinity>=80
        && ['특별한 인연','연인'].includes(record.relationship)
        && record.completedEpisodes.length>=3
      );
    })
    .map(entry=>entry.candidate);
  if(!eligible.length)return Promise.resolve(null);
  const phone=document.querySelector('.phone'),scene=document.querySelector('#vacationScene');
  scene.hidden=false;scene.classList.remove('child-live','has-encounter');phone.classList.add('vacation-playing');
  scene.insertAdjacentHTML('beforeend',`<div class="vacation-companion-choice" id="vacationCompanionChoice" role="dialog" aria-modal="true" aria-label="바캉스 동행 선택"><section><small>이번 여행</small><h3>누구와 갈까요?</h3><button data-vacation-companion="">혼자 간다</button>${eligible.map(candidate=>`<button data-vacation-companion="${candidate.id}">${candidate.name}과 함께 간다 <em>${relationRecord(candidate.id).affinity}</em></button>`).join('')}</section></div>`);
  return new Promise(resolve=>{document.querySelectorAll('[data-vacation-companion]').forEach(button=>button.addEventListener('click',()=>{const candidate=endingRelationCandidates.find(item=>item.id===button.dataset.vacationCompanion)||null;document.querySelector('#vacationCompanionChoice')?.remove();scene.hidden=true;phone.classList.remove('vacation-playing');resolve(candidate);},{once:true}));});
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
async function playVacationScene(prize,index,companion=null,scheduleStart=null,hasNextSchedule=false){
  const phone=document.querySelector('.phone'),scene=document.querySelector('#vacationScene'),image=document.querySelector('#vacationImage');
  const overlay=document.querySelector('#vacationDuoOverlay');
  const playerPortrait=document.querySelector('#vacationPlayerPortrait');
  const playerName=document.querySelector('#vacationPlayerName');
  const playerText=document.querySelector('#vacationPlayerText');
  const companionPortrait=document.querySelector('#vacationCompanionPortrait');
  const companionName=document.querySelector('#encounterName');
  const companionText=document.querySelector('#encounterText');
  const sceneSeason=prize.season||game.season;
  const phaseStart=scheduleStart?new Date(scheduleStart):new Date(`${game.currentDate}T00:00:00`);phaseStart.setDate(phaseStart.getDate()+Math.floor(index/14)*14);
  const dateFlow=document.querySelector('#vacationDateFlow');
  dateFlow.innerHTML='<b></b><span></span><i><em></em></i>';
  const seasonalEffects={봄:new Set(['petals','wind','calm']),여름:new Set(['splash','wave','wind','calm']),가을:new Set(['leaves','moon','steam','calm']),겨울:new Set(['snow','steam','calm'])};
  const sceneEffect=seasonalEffects[sceneSeason]?.has(prize.effect)?prize.effect:'calm';
  playVacationMusic(sceneSeason);renderVacationMotion(sceneSeason);image.src=prize.image;document.querySelector('#vacationTitle').textContent=prize.name;scene.dataset.effect=sceneEffect;scene.dataset.season=sceneSeason;
  try{if(image.getAttribute('src'))await image.decode();}catch(e){}
  image.style.animation='none';void image.offsetWidth;image.style.animation='';
  scene.classList.remove('has-encounter');scene.classList.add('child-live');overlay.hidden=true;phone.classList.add('vacation-playing');scene.hidden=false;
  syncPlaybackSpeedToggle();
  for(let day=0;day<14;day+=1){const date=new Date(phaseStart);date.setDate(phaseStart.getDate()+day);dateFlow.classList.remove('date-tick');void dateFlow.offsetWidth;dateFlow.classList.add('date-tick');dateFlow.querySelector('b').textContent=`${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일`;dateFlow.querySelector('span').textContent=`제${day+1}일 / 14일`;dateFlow.querySelector('em').style.width=`${Math.round((day+1)/14*100)}%`;await schedulePlaybackDelay(340);}
  let relation=null;
  if(companion){
    relation=companion;scene.classList.add('has-encounter');overlay.hidden=false;
    const episode=nextRelationEpisode(relation,'vacation');
    playerPortrait.src=protagonistPortraitForAge();
    playerName.textContent=game.characterName||'선화';
    companionPortrait.src=relation.baseSheet;
    companionPortrait.style.setProperty('--relation-sheet',`url('${relation.baseSheet}')`);
    companionPortrait.style.setProperty('--relation-age-position',relationAgePosition());
    companionName.textContent=relationOverlayCaption(relation,episode);
    const dialogue=compactVacationDialogue(relation,episode);
    playerText.textContent='';
    companionText.textContent=dialogue.open;
    const fromLeft=Math.random()<.5;
    overlay.classList.toggle('companion-left',fromLeft);
    overlay.classList.toggle('companion-right',!fromLeft);
    const record=recordRelationEncounter(relation,episode);
    record.affinity=Math.min(100,record.affinity+10);
    record.relationship=record.affinity>=80?'연인':record.affinity>=60?'특별한 인연':'친구';
    const memory=`${game.age}-${sceneSeason}`;
    if(!record.vacationMemories.includes(memory))record.vacationMemories.push(memory);
    await waitForVacationTap('다음',true);
    playerText.textContent=dialogue.reply;
    companionText.textContent=dialogue.close;
    await waitForVacationTap('대화 마치기',true);
  }
  overlay.hidden=true;scene.classList.remove('has-encounter');
  await waitForVacationTap('바캉스를 마치고 돌아가기',true);
  scene.classList.add('vacation-leaving');
  await schedulePlaybackDelay(900);
  scene.classList.remove('child-live','vacation-leaving');scene.hidden=true;scene.dataset.effect='';scene.dataset.season='';document.querySelector('#vacationMotion').replaceChildren();phone.classList.remove('vacation-playing');
  if(!hasNextSchedule)playHomeMusic();
  return relation;
}

function updateImageState() {
  const characterReady = character.complete && character.naturalWidth > 0;
  character.hidden = !characterReady;
  missing.hidden = characterReady;
}

function renderHomeSeason(date){
  const weather=document.querySelector('#homeWeather'),phone=document.querySelector('.phone');if(!weather||!phone)return;
  const month=date&&!Number.isNaN(date.getTime())?date.getMonth()+1:Number(game.month)||1;
  const day=date&&!Number.isNaN(date.getTime())?date.getDate():1;
  const season=[12,1,2].includes(month)?'winter':[3,4,5].includes(month)?'spring':[6,7,8].includes(month)?'summer':'autumn';
  const rainy=season!=='winter'&&((day+month*3)%7===0||(season==='summer'&&(day+month)%4===0));
  const snowy=season==='winter'&&((day+month*2)%5===0);
  phone.dataset.homeSeason=season;weather.dataset.weather=snowy?'heavy-snow':rainy?'rain':'clear';
  weather.replaceChildren(...Array.from({length:snowy?32:rainy?22:0},(_,index)=>{const particle=document.createElement('i');particle.style.setProperty('--particle-index',index);particle.style.setProperty('--particle-left',`${(index*37+day*11)%100}%`);particle.style.setProperty('--particle-delay',`${-((index*29)%31)/10}s`);return particle;}));
}
function renderHud() {
  if(game.nannyName&&!game.guardianName){game.guardianName=game.nannyName;game.guardianType=game.guardianType||'hyeonmu';}
  normalizeStats();
  const date = game.currentDate ? new Date(`${game.currentDate}T00:00:00`) : null;
  renderHomeSeason(date);
  const phase=phaseInfo();
  const phone=document.querySelector('.phone');
  phone.dataset.growthAge=String(growthVisualAge());
  document.querySelector('#dateLabel').textContent = date ? `${game.age}세 · ${date.getFullYear()}년 ${date.getMonth()+1}월 ${date.getDate()}일 · 제${phase.index}페이즈 ${phase.week}주차` : '생일 설정 전';
  document.querySelector('#moneyLabel').textContent = `${game.money.toLocaleString()}냥`;
  document.querySelector('#cashLabel').textContent = `캐시 ${game.cash.toLocaleString()}원`;
  renderHomeSehwaArtwork();
  const guardian=guardianDefs[game.guardianType];
  document.querySelector('#speakerName').textContent = game.guardianName || guardian?.name || '수호신수';
  const companion=document.querySelector('#guardianCompanion');
  if(companion){companion.hidden=true;document.querySelector('#guardianCompanionMark').textContent=guardian?.mark||'守';document.querySelector('#guardianCompanionName').textContent=game.guardianName||guardian?.name||'';if(guardian)document.querySelector('#guardianCompanionMark').style.background=guardian.theme;}
  if(game.birthday&&!phone.classList.contains('playing')&&!phone.classList.contains('market-playing')&&!phone.classList.contains('vacation-playing'))playHomeMusic();
}

function resetTransientScenes(){
  const phone=document.querySelector('.phone');
  const vacationScene=document.querySelector('#vacationScene');
  const vacationOverlay=document.querySelector('#vacationDuoOverlay');
  const vacationMotion=document.querySelector('#vacationMotion');
  const vacationNext=document.querySelector('#vacationNext');
  if(phone)phone.classList.remove('vacation-playing','market-playing','greeting-active','settings-open','merchant-speaking');
  if(vacationScene){
    vacationScene.hidden=true;
    vacationScene.classList.remove('has-encounter','child-live');
    vacationScene.dataset.effect='';
    vacationScene.dataset.season='';
  }
  if(vacationOverlay)vacationOverlay.hidden=true;
  if(vacationMotion)vacationMotion.replaceChildren();
  if(vacationNext)vacationNext.hidden=true;
}

const guardianVoice={
  cheongryong:['배움의 기운은 맑은 물처럼 이어지는 법이지. 무리하지 말고 한 주를 골고루 짜 보자.','지혜를 쌓는 날과 마음을 쉬는 날이 함께 있어야 오래 나아갈 수 있단다.'],
  baekho:['겁내지 마라. 네가 고른 한 주라면 내가 끝까지 곁을 지키겠다.','몸이 지치기 전에 쉬는 것도 훌륭한 수련이다.'],
  jujak:['좋은 기운이 느껴지는구나! 즐겁게 배울 날과 신나게 쉬는 날을 골라 보자.','마음에 불꽃이 너무 커지면 잠시 쉬어도 괜찮단다.'],
  hyeonmu:['서두르지 않아도 괜찮다. 하루씩 차분히 채우면 한 주의 길이 보일 게다.','단단한 마음은 알맞은 쉼에서 시작되는 법이란다.']
};
const guardianConversationSets={
  cheongryong:[
    {line:'배움이 뜻대로 되지 않을 때, 너는 무엇부터 돌아보겠느냐?',choices:[['모르는 대목을 다시 읽어 볼게요.',{intelligence:4,mentality:2,nannyAffinity:3,guardianTrust:2},'좋은 답이구나. 되짚는 일은 뒤로 가는 것이 아니라 뿌리를 깊게 내리는 일이란다.'],['신수의 힘으로 답을 알려 주세요.',{magic:2,mentality:-2,nannyAffinity:-1,guardianTrust:-3},'답을 받는 것보다 스스로 찾아낸 한 줄이 오래 남는 법이지.'],['오늘은 잠시 쉬고 내일 다시 볼래요.',{stress:-5,mentality:2,nannyAffinity:2},'쉴 때를 아는 것도 지혜다. 내일은 맑은 눈으로 다시 보자.']]},
    {line:'지혜와 힘 가운데 하나만 먼저 닦아야 한다면 무엇을 고르겠느냐?',choices:[['사람을 살리는 지혜를 고를게요.',{intelligence:3,magic:3,dignity:2,guardianTrust:3},'네 지혜가 누군가의 등불이 되기를 바라마.'],['나를 지킬 힘부터 기를게요.',{strength:3,mentality:2,guardianTrust:1},'스스로를 지킬 힘도 필요하지. 다만 그 힘의 쓰임을 잊지 말거라.'],['둘의 균형을 찾을게요.',{intelligence:2,strength:2,mentality:3,nannyAffinity:3},'균형을 택했구나. 서두르지 않으면 두 길은 결국 하나로 만난단다.']]}
  ],
  baekho:[
    {line:'실패가 두려워 발이 떨어지지 않을 때에는 어찌하겠느냐?',choices:[['작게라도 한 걸음 내디딜게요.',{strength:3,agility:2,mentality:2,guardianTrust:3},'그 한 걸음이면 충분하다. 다음 발은 내가 곁에서 지켜 주마.'],['실패하지 않을 때까지 피할래요.',{stress:-2,mentality:-3,guardianTrust:-4},'두려움은 피할수록 커진다. 준비가 되면 다시 내 손을 잡거라.'],['도움을 청하고 함께 해볼게요.',{speech:2,mentality:3,nannyAffinity:4},'도움을 청하는 것은 약함이 아니다. 동료를 믿는 용기이지.']]},
    {line:'강한 힘을 얻는다면 가장 먼저 어디에 쓰고 싶으냐?',choices:[['약한 사람을 지킬게요.',{strength:3,dignity:3,manners:2,guardianTrust:4},'그래, 지키기 위한 힘이 가장 오래 빛나는 법이다.'],['나를 무시한 사람에게 보여줄래요.',{strength:4,dignity:-3,manners:-2,guardianTrust:-3},'분노로 휘두른 힘은 결국 너에게 돌아온다. 마음부터 다스리거라.'],['힘을 자랑하지 않고 수련할게요.',{strength:2,mentality:4,nannyAffinity:3},'절제할 줄 아는 이가 진정 강한 사람이다.']]}
  ],
  jujak:[
    {line:'마음이 지친 사람을 만난다면 어떤 온기를 건네겠느냐?',choices:[['말없이 곁에 있어 줄게요.',{sensitivity:4,mentality:2,nannyAffinity:4},'따뜻한 침묵은 때로 백 마디 말보다 깊이 닿는단다.'],['즐거운 이야기로 웃게 할래요.',{speech:3,charm:2,stress:-3,guardianTrust:2},'네 웃음이 다른 이의 마음에도 작은 불씨가 되겠구나.'],['스스로 이겨내야 한다고 말할래요.',{mentality:2,sensitivity:-3,guardianTrust:-2},'굳센 말도 필요하지만, 상처 난 마음에는 먼저 온기가 필요하단다.']]},
    {line:'네가 가진 빛이 다른 사람보다 작아 보이면 어떻게 하겠느냐?',choices:[['내 빛의 색을 천천히 찾을게요.',{charm:3,sensitivity:3,mentality:3,nannyAffinity:3},'누구와도 같지 않은 네 빛을 나는 이미 보고 있단다.'],['더 화려하게 보여 주려고 애쓸래요.',{charm:4,stress:4,dignity:-2,guardianTrust:-1},'빛은 억지로 키우면 쉽게 흔들린다. 네 마음을 먼저 돌보렴.'],['다른 사람의 장점도 함께 배울게요.',{sense:3,sensitivity:2,manners:2,guardianTrust:3},'부러움을 배움으로 바꾸다니, 참 고운 선택이구나.']]}
  ],
  hyeonmu:[
    {line:'긴 길에서 성과가 보이지 않아도 계속 걸을 수 있겠느냐?',choices:[['하루에 할 수 있는 만큼 이어갈게요.',{mentality:4,health:2,guardianTrust:3},'작은 발걸음이 쌓여 가장 단단한 길이 되는 법이다.'],['결과가 없으면 다른 길로 갈래요.',{agility:2,mentality:-2,guardianTrust:-2},'길을 바꾸는 것도 선택이지만, 조급함 때문에 놓치는 것은 없는지 살펴보거라.'],['잠시 멈춰 방향을 확인할게요.',{sense:3,mentality:3,stress:-3,nannyAffinity:3},'멈춤은 포기가 아니다. 물길도 굽이치며 바다로 가는 법이지.']]},
    {line:'비밀을 지켜야 친구를 보호할 수 있다면 어떻게 하겠느냐?',choices:[['약속을 지키되 위험하면 도움을 청할게요.',{mentality:3,manners:2,speech:2,guardianTrust:4},'신중하고도 따뜻한 답이구나. 혼자 감당하지 않는 지혜도 중요하다.'],['무슨 일이 있어도 혼자 지킬게요.',{mentality:4,stress:4,nannyAffinity:-1},'책임감은 훌륭하지만 네 마음까지 다치게 두지는 말거라.'],['나와 상관없는 일이라고 외면할래요.',{stress:-2,dignity:-3,guardianTrust:-4},'외면은 잠시 편할 뿐이다. 인연을 지키는 마음을 다시 생각해 보렴.']]}
  ]
};
Object.values(guardianConversationSets).flat().forEach(scene=>scene.choices.forEach(choice=>{choice[1]=canonicalizeChange(choice[1]);}));
function guardianPortrait(mood='neutral'){return `../assets/cinematics/guardian/humanized/poses/${game.guardianType||'hyeonmu'}-${mood}-transparent-v3.png`;}
function openGuardianDialogueOverlay(mood='neutral'){
  const greeting=document.querySelector('#homeGreeting'),portrait=document.querySelector('#homeGreetingPortrait');
  greeting.classList.remove('mood-neutral','mood-happy','mood-concerned','mood-surprised');
  greeting.classList.add('guardian-overlay',`mood-${mood}`);
  greeting.dataset.guardian=game.guardianType||'hyeonmu';
  document.querySelector('.phone').classList.add('greeting-active','guardian-dialogue-active');
  portrait.hidden=false;portrait.src=guardianPortrait(mood);portrait.alt=`${game.guardianName||guardianDefs[game.guardianType]?.name||'신수'}의 ${mood} 표정`;
}
function closeGuardianDialogueOverlay(){
  const greeting=document.querySelector('#homeGreeting');
  greeting.hidden=true;greeting.classList.remove('guardian-overlay','mood-neutral','mood-happy','mood-concerned','mood-surprised');
  greeting.classList.remove('is-dissolving');
  delete greeting.dataset.guardian;
  document.querySelector('.phone').classList.remove('greeting-active','guardian-dialogue-active');
}
function dissolveGuardianDialogueOverlay(onComplete){
  const greeting=document.querySelector('#homeGreeting'),choices=document.querySelector('#homeGreetingChoices');
  if(greeting.classList.contains('is-dissolving'))return;
  greeting.classList.add('is-dissolving');
  choices.querySelectorAll('button').forEach(button=>button.disabled=true);
  window.setTimeout(()=>{closeGuardianDialogueOverlay();if(onComplete)onComplete();},1050);
}
function closeGuardianConversation(change){
  dissolveGuardianDialogueOverlay(()=>{showLiveChanges({change,cost:0});renderHud();queueAutoSave();});
}
function renderGuardianTalkResult(change){
  const result=document.querySelector('#guardianTalkResult');
  const entries=orderedChangeEntries(change).filter(([,value])=>value!==0);
  result.innerHTML=entries.map(([key,value])=>{
    const beneficial=key==='stress'?value<0:value>0;
    return `<span class="${beneficial?'up':'down'}"><b>${statLabels[key]||key}</b><em>${value>0?'+':''}${value}</em><small>현재 ${clampStat(key,game[key])}</small></span>`;
  }).join('');
  result.hidden=!entries.length;
}
function answerGuardianConversation(scene,index){
  const [reply,change,response]=scene.choices[index];
  const actualChange={};
  Object.entries(change).forEach(([key,value])=>{const before=clampStat(key,game[key]);game[key]=clampStat(key,before+value);actualChange[key]=game[key]-before;});
  const speaker=document.querySelector('#homeGreetingSpeaker'),line=document.querySelector('#homeGreetingLine'),prompt=document.querySelector('#homeGreetingPrompt'),choices=document.querySelector('#homeGreetingChoices'),portrait=document.querySelector('#homeGreetingPortrait');
  portrait.hidden=false;portrait.classList.add('is-listening');speaker.textContent=game.characterName||'아이';line.textContent=reply;prompt.textContent='';renderGuardianTalkResult(actualChange);choices.innerHTML='<button id="guardianDialogueContinue">신수의 이야기 듣기</button>';
  document.querySelector('#guardianDialogueContinue').addEventListener('click',()=>{portrait.classList.remove('is-listening');const positive=Object.entries(actualChange).filter(([,value])=>value!==0).every(([key,value])=>key==='stress'?value<=0:value>=0);openGuardianDialogueOverlay(positive?'happy':'concerned');speaker.textContent=game.guardianName||guardianDefs[game.guardianType]?.name||'신수';line.textContent=response;choices.innerHTML='<button id="guardianDialogueClose">대화 마치기</button>';document.querySelector('#guardianDialogueClose').addEventListener('click',()=>closeGuardianConversation(actualChange));});
}
function startGuardianConversation(){
  const guardian=guardianDefs[game.guardianType];if(!guardian||introDialogueQueue.length)return false;
  const phaseKey=phaseInfo().key;
  if(game.lastGuardianTalkPhase===phaseKey){speakGuardian('home');document.querySelector('#dialogueText').textContent=`이번 페이즈에는 이미 ${game.guardianName||guardian.name}과(와) 마음을 나누었어요. 다음 페이즈에 다시 이야기해 봐요.`;return false;}
  game.lastGuardianTalkDate=game.currentDate;game.lastGuardianTalkPhase=phaseKey;
  const scenes=guardianConversationSets[game.guardianType]||guardianConversationSets.hyeonmu,scene=scenes[Math.floor(Math.random()*scenes.length)];
  const portrait=document.querySelector('#homeGreetingPortrait');portrait.hidden=false;portrait.classList.remove('is-listening');portrait.src=guardianPortrait();portrait.alt=`${game.guardianName||guardian.name}의 모습`;
  const result=document.querySelector('#guardianTalkResult');result.hidden=true;result.innerHTML='';
  document.querySelector('#homeGreetingSpeaker').textContent=game.guardianName||guardian.name;document.querySelector('#homeGreetingLine').textContent=scene.line;document.querySelector('#homeGreetingPrompt').textContent=`${game.characterName||'아이'}은(는) 어떻게 답할까요?`;
  const choices=document.querySelector('#homeGreetingChoices');choices.innerHTML=scene.choices.map((choice,index)=>`<button data-guardian-answer="${index}">${choice[0]}</button>`).join('');
  document.querySelector('#homeGreeting').hidden=false;openGuardianDialogueOverlay(game.stress>=70?'concerned':'neutral');choices.querySelectorAll('[data-guardian-answer]').forEach(button=>button.addEventListener('click',()=>answerGuardianConversation(scene,Number(button.dataset.guardianAnswer))));queueAutoSave();return true;
}
function presentActivityUnlocks(){
  if(!pendingActivityUnlocks.length)return false;
  const unlocked=[...pendingActivityUnlocks];pendingActivityUnlocks=[];
  const guardian=guardianDefs[game.guardianType]||guardianDefs.hyeonmu,portrait=document.querySelector('#homeGreetingPortrait');
  portrait.hidden=false;portrait.classList.remove('is-listening');portrait.src=guardianPortrait();portrait.alt=`${game.guardianName||guardian.name}의 모습`;
  document.querySelector('#homeGreetingSpeaker').textContent=game.guardianName||guardian.name;
  document.querySelector('#homeGreetingLine').textContent=`네 성장을 지켜보던 이들이 새 길을 열어 주었구나. 이제 「${unlocked.map(action=>action.name).join(' · ')}」 활동을 선택할 수 있단다.`;
  document.querySelector('#homeGreetingPrompt').textContent='신수의 새 활동 안내';
  const result=document.querySelector('#guardianTalkResult');result.hidden=true;result.innerHTML='';
  const choices=document.querySelector('#homeGreetingChoices');choices.innerHTML='<button id="activityUnlockClose">일정에서 확인하기</button>';
  document.querySelector('#homeGreeting').hidden=false;openGuardianDialogueOverlay('happy');
  document.querySelector('#activityUnlockClose').addEventListener('click',()=>{closeGuardianDialogueOverlay();openVisitingMerchant();});
  return true;
}
function speakGuardian(context='home'){
  const guardian=guardianDefs[game.guardianType];if(!guardian||introDialogueQueue.length)return false;
  const name=game.guardianName||guardian.name,filled=game.dailySchedule.filter(Boolean).length;
  let line='';
  if(game.stress>=80)line=`${game.characterName}, 마음이 많이 지쳐 있구나. 이번 주에는 반드시 휴식을 넣자.`;
  else if(game.money<500)line='은전이 넉넉하지 않구나. 비용이 드는 교육보다 아르바이트와 휴식을 먼저 살펴보자.';
  else if(context==='schedule'&&filled===0)line='활동을 고르면 14일짜리 페이즈가 일정표에 차례로 추가된단다.';
  else if(context==='schedule')line=`지금 ${filled}개 페이즈를 계획했구나. 순서를 확인하고 실행하거나 더 추가해 보렴.`;
  else if(context==='return')line=`다시 만났구나, ${game.characterName}. 지난 기록은 내가 잘 지켜 두었다. 이번 주 일정부터 살펴볼까?`;
  else {const lines=guardianVoice[game.guardianType]||guardianVoice.hyeonmu;line=lines[Math.floor(Math.random()*lines.length)];}
  document.querySelector('#speakerName').textContent=name;document.querySelector('#dialogueText').textContent=line;
  return true;
}

const statLabels={health:'체력',strength:'힘',agility:'민첩',intelligence:'지능',magic:'마력',mentality:'정신력',dignity:'기품',manners:'예절',speech:'화술',sensitivity:'감수성',sense:'센스',charm:'매력',stress:'스트레스'};
statLabels.nannyAffinity='신수 유대감';
statLabels.fatherAffinity='아버지 친밀도';
statLabels.guardianTrust='신수 신뢰';
function showLiveChanges(action){
  const items=orderedChangeEntries(phaseDailyChange(action.change)).map(([key,value])=>{const positive=key==='stress'?value<0:value>=0;const current=clampStat(key,game[key]);return `<span class="${positive?'up':'down'}">${statLabels[key]||key} <b>${current}</b> <small>(${value>0?'+':''}${value})</small></span>`;});
  if(action.cost!==0)items.push(`<span class="money">은전 ${action.cost>0?'-':'+'}${Math.abs(action.cost)}냥</span>`);
  document.querySelector('#liveChanges').innerHTML=items.join('');
  if(Object.values(action.change||{}).some(value=>Math.abs(value)>=8))game.homeReaction='shocked';
  else if(action.change&&Object.keys(action.change).length)game.homeReaction=null;
  updateHomeCharacter();
}
function renderActivityGauges(action){
  const box=document.querySelector('#activityGauges');
  const entries=orderedChangeEntries(phaseDailyChange(action.change)).filter(([,value])=>value!==0);
  if(!entries.length||['shopping','vacation'].includes(action.id)){box.hidden=true;box.innerHTML='';return;}
  box.innerHTML=entries.map(([key,value])=>{
    const max=statMaximum(key),next=clampStat(key,game[key]),current=clampStat(key,next-value);
    const beneficial=key==='stress'?value<0:value>0;
    const low=Math.min(current,next),width=Math.max(2,Math.abs(next-current));
    return `<div class="activity-gauge"><span class="activity-gauge-label">${statLabels[key]||key}</span><span class="activity-gauge-track"><i class="activity-gauge-before" style="width:${current/max*100}%"></i><i class="activity-gauge-delta ${beneficial?'up':'down'}" style="left:${low/max*100}%;width:${Math.max(2,width/max*100)}%"></i></span><span class="activity-gauge-value ${beneficial?'up':'down'}"><b>${current} → ${next}</b><small>${value>0?'▲':'▼'}${Math.abs(value)}</small></span></div>`;
  }).join('');
  box.hidden=false;
}

function showHomeGreeting(force=false){
  if(!game.birthday||document.querySelector('.phone').classList.contains('playing')||game.lastGreetingDate===game.currentDate)return false;
  game.lastGreetingDate=game.currentDate;
  if(!force&&Math.random()>=.18)return false;
  return startGuardianConversation();
}
function renderStagePm3Hud(date,change={},action=null){
  const hud=document.querySelector('#stagePm3Hud');if(!hud)return;hud.hidden=false;
  const dateCard=hud.firstElementChild;dateCard.classList.remove('date-tick');void dateCard.offsetWidth;dateCard.classList.add('date-tick');
  const phaseCard=hud.querySelector('.stage-hud-phase');if(phaseCard){phaseCard.classList.remove('date-tick');void phaseCard.offsetWidth;phaseCard.classList.add('date-tick');}
  const dayNames=['일','월','화','수','목','금','토'];
  const phase=phaseInfo(date);
  const growthStart=addYears(new Date(`${game.birthday}T00:00:00`),9);
  const growthEnd=game.endingDate?new Date(`${game.endingDate}T00:00:00`):addYears(growthStart,10);
  const elapsedDay=Math.max(1,Math.floor((date-growthStart)/86400000)+1);
  const totalDays=Math.max(1,Math.floor((growthEnd-growthStart)/86400000)+1);
  document.querySelector('#stageHudDate').innerHTML=`<small>${Math.min(elapsedDay,totalDays)} / ${totalDays}</small><span>${date.getMonth()+1}월</span><b>${date.getDate()}</b><em>${dayNames[date.getDay()]}</em>`;
  document.querySelector('#stageHudMoney').textContent=`${game.money.toLocaleString()}냥`;
  const phaseLabel=document.querySelector('#stageHudPhase');
  if(phaseLabel)phaseLabel.textContent=`제${phase.index} / ${phase.total}페이즈`;
  const phaseProgress=document.querySelector('#stageHudPhaseProgress');
  if(phaseProgress)phaseProgress.style.width=`${phase.percent}%`;
  const affectedKeys=action&&action.change?Object.keys(action.change):Object.keys(change);
  const keys=[...new Set([...affectedKeys,'stress'])].filter(key=>statLabels[key]);
  document.querySelector('#stageHudStats').innerHTML=keys.map(key=>{const value=clampStat(key,game[key]),delta=change[key]||0,maximum=statMaximum(key),direction=delta>0?'▲':delta<0?'▼':'',beneficial=key==='stress'?delta<0:delta>0;return `<span class="stage-hud-stat ${delta?(beneficial?'up':'down'):''}"><b>${statLabels[key]}</b><i style="--value:${Math.round(value/maximum*100)}%"></i><em>${value}${delta?`<small>${direction}${Math.abs(delta)}</small>`:''}</em></span>`;}).join('');
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
    const relationCards=endingRelationCandidates.map(candidate=>{
      const relation=game.relations[candidate.id];
      const percent=Math.max(0,Math.min(100,relation.affinity));
      const filled=Math.max(1,Math.min(10,Math.ceil(percent/10)||0));
      const heartBar=Array.from({length:10},(_,index)=>`<span class="${index<filled?'on':''}">♥</span>`).join('');
      const phase=relation.dateUnlocked?(relation.affinity>=60?`${relation.relationship}`:`데이트 가능`):`${relation.meetings}/5`;
      return `<div class="relation-card ${relation.affinity>=60?'unlocked':''}"><b>${candidate.name}</b><small>${candidate.role}</small><span>${phase}</span><div class="relation-heart-meter" aria-label="${candidate.name} 호감도 ${percent}%">${heartBar}</div><em>${percent}%</em></div>`;
    }).join('');
    const phase=phaseInfo();
    panelBody.innerHTML = `<div class="status-summary"><span>${game.age}세 · 제${phase.index}페이즈 ${phase.week}주차</span><b>${game.money.toLocaleString()}냥</b></div><section class="body-profile" aria-label="성장 정보"><div><small>키</small><b>${game.height.toFixed(1)} cm</b></div><div><small>몸무게</small><b>${game.weight.toFixed(1)} kg</b></div></section>${statGroups.map(group => `<section class="stat-group"><h3>${group.title}</h3>${group.stats.map(([key,label])=>statBar(key,label)).join('')}</section>`).join('')}<section class="stat-group condition-group"><h3>현재 상태</h3>${statBar('stress','스트레스')}</section><section class="stat-group"><h3>수호 인연</h3>${statBar('nannyAffinity','신수 유대감')}${statBar('fatherAffinity','아버지 친밀도')}</section><section class="relation-group"><h3>인연</h3><p>5회 만남으로 데이트가 열리고, 호감도 60 이상과 특별한 관계부터 엔딩 후보가 됩니다.</p><div class="relation-grid">${relationCards}</div></section>`;
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
const dungeonGearDefs=[
  {id:'dungeon-bamboo-sword',name:'대나무 수련검',slot:'weapon',combat:'sword',power:12,description:'비경에서만 사용하는 가벼운 수련검'},
  {id:'dungeon-iron-sword',name:'무쇠 환도',slot:'weapon',combat:'sword',power:24,description:'산짐승을 상대하기 좋은 단단한 환도'},
  {id:'dungeon-moon-talisman',name:'달빛 부적',slot:'weapon',combat:'magic',power:14,description:'달빛의 기운을 모아 술법을 돕는 부적'},
  {id:'dungeon-dragon-orb',name:'청룡 여의주',slot:'weapon',combat:'magic',power:26,description:'깊은 비경에서 발견되는 술법의 보주'},
  {id:'dungeon-hide-vest',name:'가죽 배자',slot:'armor',combat:'guard',power:10,description:'충격을 줄여 주는 비경 전용 방어구'},
  {id:'dungeon-scale-armor',name:'비늘 갑옷',slot:'armor',combat:'guard',power:22,description:'신수의 비늘 무늬를 새긴 튼튼한 갑옷'},
  {id:'dungeon-wind-bell',name:'바람 방울',slot:'charm',combat:'sword',power:8,description:'발걸음을 가볍게 해 주는 작은 방울'},
  {id:'dungeon-fire-knot',name:'주작 매듭',slot:'charm',combat:'magic',power:9,description:'술법의 불씨를 지켜 주는 붉은 매듭'}
];
const inventoryCategories={all:'전체',accessory:'장신구',dungeonGear:'비경 장비',event:'이벤트'};
const inventoryTypeLabels={food:'음식',outfit:'의상',accessory:'장신구',dungeonGear:'비경 장비',event:'이벤트'};
function equippedDungeonGear(){normalizeInventory();return game.items.filter(item=>item.type==='dungeonGear'&&item.equipped);}
function dungeonGearPower(combat){return equippedDungeonGear().reduce((sum,item)=>{const gear=dungeonGearDefs.find(entry=>entry.id===item.id);return sum+(gear&&(gear.combat===combat||gear.combat==='guard')?gear.power:0);},0);}
function awardDungeonGear(){normalizeInventory();const owned=new Set(game.items.filter(item=>item.type==='dungeonGear').map(item=>item.id));const available=dungeonGearDefs.filter(item=>!owned.has(item.id));if(!available.length)return null;const gear=available[Math.floor(Math.random()*available.length)];const item={...gear,type:'dungeonGear',qty:1,equipped:false};game.items.push(item);return item;}
function normalizeInventory(){
  if(!Array.isArray(game.items))game.items=[];
  game.items=game.items.map((item,index)=>typeof item==='string'?{id:`legacy-${index}`,type:'event',name:item,qty:1}:({...item,type:item.type||'event',qty:Math.max(1,item.qty||1)}));
  game.items.forEach(item=>{
    if(item.source==='guardian-birthday'&&!item.statChange){const base=guardianDefs[game.guardianType]?.gift||startingBirthdayGifts[0];item.statChange=canonicalizeChange({...base.change});item.giftValue=480+Object.values(item.statChange).reduce((sum,value)=>sum+Math.max(0,value),0)*55;item.sellable=true;}
    if(item.source==='father-birthday'&&!item.statChange){const age=Number(String(item.id).match(/(\d+)$/)?.[1])||9;item.statChange=canonicalizeChange({stress:-7,fatherAffinity:3});item.giftValue=360+age*25+450;item.sellable=true;}
  });
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
  const slots=Array.from({length:180},(_,index)=>{const item=filtered[index];if(!item)return '<div class="inventory-slot empty" aria-hidden="true"></div>';const image=inventoryImage(item),equipped=game.equippedOutfit===item.id||Boolean(item.equipped);return `<button class="inventory-slot filled ${equipped?'equipped':''}" data-item="${item.id}" title="${item.name}">${image?`<img src="${image}" alt="">`:`<i class="item-glyph type-${item.type}"></i>`}<span>${item.name}</span>${item.qty>1?`<b>${item.qty}</b>`:''}${equipped?'<em>착용</em>':''}</button>`;}).join('');
  panelBody.innerHTML=`<div class="inventory-tabs">${Object.entries(inventoryCategories).map(([id,label])=>`<button data-inventory-tab="${id}" class="${category===id?'on':''}">${label}</button>`).join('')}</div><div class="inventory-count"><b>${filtered.length}</b> / 180칸</div><div class="inventory-grid">${slots}</div><div class="inventory-detail" id="inventoryDetail">아이템을 누르면 설명과 사용 버튼이 표시됩니다.</div>`;
  panelBody.querySelectorAll('[data-inventory-tab]').forEach(button=>button.addEventListener('click',()=>renderInventory(button.dataset.inventoryTab)));
  panelBody.querySelectorAll('[data-item]').forEach(button=>button.addEventListener('click',()=>showInventoryItem(button.dataset.item,category)));
}
function showInventoryItem(id,category){
  const item=game.items.find(entry=>entry.id===id),detail=document.querySelector('#inventoryDetail');if(!item)return;
  const action=item.type==='outfit'?`<button data-inventory-action="wear">${game.equippedOutfit===item.id?'벗기':'갈아입기'}</button>`:item.type==='food'?'<button data-inventory-action="use">먹기</button>':item.type==='dungeonGear'?`<button data-inventory-action="equip-dungeon">${item.equipped?'장착 해제':'비경 장착'}</button>`:(item.sellable||String(item.source||'').includes('birthday'))?`<button data-inventory-sell="${item.id}">${itemSalePrice(item).toLocaleString()}냥에 판매</button>`:'';
  detail.innerHTML=`${item.type==='event'&&item.image?`<img class="event-collectible-preview" src="${item.image}" alt="${item.name}">`:''}<b>${item.name}</b><span>${inventoryTypeLabels[item.type]||'기타'} · ${item.qty||1}개</span>${item.description?`<p>${item.description}</p>`:''}${action}`;
  detail.querySelector('[data-inventory-action]')?.addEventListener('click',()=>{if(item.type==='outfit'){game.autoOutfit=false;game.equippedOutfit=game.equippedOutfit===item.id?null:item.id;applyEquippedOutfit();renderInventory(category);}else if(item.type==='food'){const food=foods.find(entry=>entry.id===item.id);if(food)applyShopChanges(food.change);item.qty-=1;if(item.qty<=0)game.items.splice(game.items.indexOf(item),1);document.querySelector('#dialogueText').textContent=`${item.name}을(를) 먹었어요.`;renderInventory(category);}else if(item.type==='dungeonGear'){if(!item.equipped)game.items.filter(entry=>entry.type==='dungeonGear'&&entry.slot===item.slot).forEach(entry=>entry.equipped=false);item.equipped=!item.equipped;queueAutoSave();renderInventory(category);}});
  detail.querySelector('[data-inventory-sell]')?.addEventListener('click',()=>sellInventoryItem(item.id,false));
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
  panelBody.innerHTML=`<div class="auto-outfit"><div><b>계절·상황 자동 갈아입기</b><small>${game.autoOutfit?'보유한 한복 중 알맞은 옷을 자동 선택합니다.':'직접 선택한 한복을 계속 입습니다.'}</small></div><button id="autoOutfitToggle" class="${game.autoOutfit?'on':''}">${game.autoOutfit?'켜짐':'꺼짐'}</button></div><div class="wardrobe-grid"><button class="wardrobe-card ${!game.equippedOutfit?'on':''}" data-wear=""><img src="${baseSpriteForAge()}" alt="${game.age}세 기본 한복"><b>기본 한복</b></button>${owned.map(item=>{const meta=outfits.find(outfit=>outfit.id===item.id);return `<button class="wardrobe-card ${game.equippedOutfit===item.id?'on':''}" data-wear="${item.id}"><img src="${outfitImage(item.id)}" alt="${item.name}"><b>${item.name}</b><small>${meta?`${outfitAgeLabel(meta)} · ${meta.seasons.join('·')}<br>`:''}${meta&&game.age>meta.ageEnd?'자라서 조금 꼭 맞음':'현재 몸에 맞음'}</small></button>`;}).join('')}</div>`;
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
    const loadButton=saved&&!current?`<button data-load-slot="${slot}">불러오기</button>`:'';
    const deleteButton=saved&&!current?`<button class="delete-save" data-delete-slot="${slot}">삭제</button>`:'';
    const saveLabel=current?'현재 시점 저장':saved?'이 시점에 덮어쓰기':'여기에 저장';
    return `<div class="save-slot ${saved ? 'filled' : 'empty'} ${current?'current':''}"><div><b>저장 슬롯 ${slot}${current?' · 현재 자동저장':''}</b><small>${label}${savedAt ? ` · ${savedAt}` : ''}</small></div><div class="save-slot-actions"><button class="write-save" data-save-slot="${slot}">${saveLabel}</button>${loadButton}${deleteButton}</div></div>`;
  }).join('');
  panelBody.innerHTML = `
    <div class="save-info"><b>저장 기록 ${slots.filter(Boolean).length}/5</b><small>같은 게임도 여러 슬롯에 나누어 저장할 수 있어요. 다른 슬롯에 저장한 기록은 분기 시점으로 보존됩니다.</small></div>
    <div class="save-grid">${slotCards}</div>
    <div class="save-actions">
      <button class="new-growth" id="startNewGrowth">새롭게 시작하기</button>
    </div>`;
  panelBody.querySelectorAll('[data-save-slot]').forEach(button => button.addEventListener('click', () => saveGameToSlot(Number(button.dataset.saveSlot))));
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
  normalizeSehwaWins();
  normalizeStats();
  normalizeRelations();
  normalizeActivityProgress();
  if(!Array.isArray(game.activityUnlocksSeen))game.activityUnlocksSeen=[];
  normalizeBodyMetrics();
  if(typeof game.autoOutfit!=='boolean')game.autoOutfit=true;
  normalizeInventory();
  document.querySelector('#birthdaySetup').hidden = Boolean(game.birthday);
  normalizePhaseSchedule();
  if(!game.monthlyLedger&&game.currentDate){const date=new Date(`${game.currentDate}T00:00:00`);game.monthlyLedger=createMonthlyLedger(date.getFullYear(),date.getMonth()+1);}
  bg.src = backgrounds.home;
  applyEquippedOutfit();
  resetTransientScenes();
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
async function waitForHomeCharacterReady(){
  if(character.complete&&character.naturalWidth>0)return;
  if(typeof character.decode==='function'){
    try{await character.decode();return;}catch{}
  }
  await new Promise(resolve=>{
    const finish=()=>{character.removeEventListener('load',finish);character.removeEventListener('error',finish);resolve();};
    character.addEventListener('load',finish,{once:true});
    character.addEventListener('error',finish,{once:true});
  });
}
async function continueRecovery(){
  const saved=pendingRecoverySave;
  const continueButton=document.querySelector('#recoveryContinue');
  const phone=document.querySelector('.phone');
  continueButton.disabled=true;
  phone.classList.add('restoring-save');
  document.querySelector('#prologue').hidden=true;
  panel.hidden=true;
  resetTransientScenes();
  if(!isPlayableSave(saved)||!applySavePayload(saved)){
    phone.classList.remove('restoring-save');
    pendingRecoverySave=null;
    showUnavailableRecovery();
    return;
  }
  await waitForHomeCharacterReady();
  pendingRecoverySave=null;
  document.querySelector('#recoveryPrompt').hidden=true;
  requestAnimationFrame(()=>phone.classList.remove('restoring-save'));
  playHomeMusic();
  queueAutoSave();
}
function declineRecovery(){
  pendingRecoverySave=null;
  document.querySelector('#recoveryPrompt').hidden=true;
  resetTransientScenes();
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
  Object.assign(game, { characterName:'',nannyName:'',guardianType:null,guardianName:'',profileSlot:null,age:9,height:130,weight:28.5,month:1,week:1,season:'봄',money:50000,cash:50000,health:42,strength:18,agility:20,intelligence:35,magic:8,mentality:30,dignity:36,manners:28,speech:14,sensitivity:40,sense:24,charm:30,stress:0,items:[],purchasedGoods:[],relations:{},activityProgress:{},activityUnlocksSeen:[],startingGiftId:null,fatherBirthdayYears:[],sehwaWins:[],latestSehwaArtwork:null,equippedOutfit:null,autoOutfit:true,dailySchedule:[],scheduleFormat:'phase-v1',birthday:null,currentDate:null,endingDate:null,ended:false,endingResult:null,birthdayCount:0,element:null,birthSeason:null,memory:0,truth:0,exposure:0,fatherAffinity:0,guardianTrust:50,nannyAffinity:50,lastGreetingDate:null,lastGuardianTalkDate:null,lastGuardianTalkPhase:null,monthlyLedger:null});
  document.querySelector('#liveChanges').innerHTML='';
  const greeting=document.querySelector('#homeGreeting');greeting.hidden=true;greeting.classList.remove('greeting-active');
  document.querySelector('#characterNameInput').value='';
  document.querySelector('#guardianNameInput').value='';
  syncBirthdaySelectors(true);
  document.querySelector('#birthdayTitle').textContent='아이의 이름과 생일';
  bg.src = backgrounds.home;
  character.src = baseSpriteForAge(9);
  resetTransientScenes();
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

let activeScheduleCategory='교육',scheduleCursor=-1,scheduleTimelineOffset=0,scheduleTimelineMotion='',selectedScheduleAction=null;
function currentPhaseHoliday(dateValue=game.currentDate){
  if(!dateValue)return null;const start=new Date(`${dateValue}T00:00:00`),formatter=new Intl.DateTimeFormat('en-u-ca-chinese',{month:'numeric',day:'numeric'});
  for(let offset=0;offset<14;offset++){const date=new Date(start);date.setDate(start.getDate()+offset);const parts=Object.fromEntries(formatter.formatToParts(date).filter(part=>part.type==='month'||part.type==='day').map(part=>[part.type,Number(part.value)]));if(parts.month===1&&parts.day===1)return {id:'holiday-seollal',name:'설날',date};if(parts.month===8&&parts.day===15)return {id:'holiday-chuseok',name:'추석',date};}return null;
}
function normalizePhaseSchedule(){
  if(!Array.isArray(game.dailySchedule))game.dailySchedule=[];
  if(game.scheduleFormat!=='phase-v1'){
    const legacy=game.dailySchedule.filter(Boolean),compressed=[];
    legacy.forEach(id=>{if(compressed.at(-1)!==id)compressed.push(id);});
    game.dailySchedule=compressed;game.scheduleFormat='phase-v1';
  }
  game.dailySchedule=game.dailySchedule.map(id=>{if(id==='freeTime')return 'rest';const chain=jobChainFor(id),active=chain&&activeJobInChain(chain);return active?.id||id;}).filter(id=>{const action=actions.find(item=>item.id===id);return action&&actionUnlocked(action);});
  const holiday=currentPhaseHoliday();
  if(holiday)game.dailySchedule=[holiday.id];
  if(!Array.isArray(game.completedPhases))game.completedPhases=[];
}
function scheduleProjection(){
  let money=game.money,stress=game.stress;
  game.dailySchedule.forEach(id=>{const action=actions.find(item=>item.id===id);if(!action)return;const dailyStress=phaseDailyChange(action.change).stress||0;for(let day=0;day<14;day+=1){money=Math.max(0,money-action.cost);stress=clampStat('stress',stress+dailyStress);}});
  return {money,stress};
}
function masteryMeter(points){
  const current=Math.max(0,Number(points)||0);
  if(current>=activityRankThresholds[2])return {label:'달인 완성',percent:100};
  const skilled=current>=activityRankThresholds[1],start=skilled?activityRankThresholds[1]:0,target=skilled?activityRankThresholds[2]:activityRankThresholds[1];
  return {label:`${activityRankNames[skilled?1:0]} → ${activityRankNames[skilled?2:1]}까지 ${target-current}점`,percent:Math.round((current-start)/(target-start)*100)};
}
const scheduleActionIconAliases={dungeon:'herbs'};
function scheduleActionIcon(action){return action.icon||scheduleActionIconAliases[action.id]||(action.category==='인연'?'manners':'reading');}
function scheduleActionMoneyLabel(action){
  if(action.category==='아르바이트')return `일당 +${activityPay(action).toLocaleString()}냥`;
  if(action.cost>0)return `비용 -${action.cost.toLocaleString()}냥`;
  return '비용 0냥';
}
function renderSchedulePanel() {
  const phase=phaseInfo();
  panelTitle.textContent = `페이즈 일정 편성`;
  normalizePhaseSchedule();
  const filled=game.dailySchedule.length;
  if(scheduleCursor<0)scheduleCursor=Math.max(0,filled-1);
  scheduleCursor=Math.max(0,Math.min(scheduleCursor,Math.max(0,filled-1)));
  const scheduledEntries=game.dailySchedule.map((id,index)=>({kind:'queue',index,action:actions.find(item=>item.id===id)}));
  const openingPaperSlots=Array.from({length:Math.max(0,2-game.completedPhases.length-scheduledEntries.length)},()=>({kind:'paper'}));
  const nextEntries=Array.from({length:3},(_,offset)=>({kind:'queue',index:filled+offset,action:null}));
  const timeline=[...openingPaperSlots,...game.completedPhases.map(record=>({kind:'completed',record})),...scheduledEntries,...nextEntries];
  const latestStart=Math.max(0,timeline.length-5);scheduleTimelineOffset=Math.max(0,Math.min(scheduleTimelineOffset,latestStart));const timelineStart=Math.max(0,latestStart-scheduleTimelineOffset);
  const visibleTimeline=timeline.slice(timelineStart,timelineStart+5),phaseSlots=visibleTimeline.map(item=>{if(item.kind==='paper')return '<div class="phase-mini-slot opening-paper" aria-label="시작 불가"><b>시작 불가</b></div>';if(item.kind==='completed')return `<div class="phase-mini-slot completed"><small>제${item.record.index}페이즈</small><b>${item.record.name}</b></div>`;if(item.action)return `<button class="phase-mini-slot filled" data-phase-remove="${item.index}" aria-label="제${phase.index+item.index}페이즈 ${item.action.name} 일정 삭제"><small>제${phase.index+item.index}페이즈</small><b>${item.action.name}</b></button>`;const current=item.index===filled;return `<div class="phase-mini-slot ${current?'current':'empty'}" aria-hidden="true"><small>제${phase.index+item.index}페이즈</small>${current?'<b>편성 전</b>':''}</div>`;}).join(''),holiday=currentPhaseHoliday();
  const visibleJobIds=new Set(visibleJobActions().map(action=>action.id));
  const unseenUnlocked=actions.filter(action=>actionUnlocked(action)&&(!action.retiredJob||visibleJobIds.has(action.id))&&Number(action.unlockAge||9)>9&&!game.activityUnlocksSeen.includes(action.id));
  const scheduleCategories=['교육','아르바이트','휴식',...(actions.some(action=>action.category==='인연'&&actionUnlocked(action))?['인연']:[])];
  if(!scheduleCategories.includes(activeScheduleCategory))activeScheduleCategory='교육';
  const categoryTabs=scheduleCategories.map(category=>{const newCount=unseenUnlocked.filter(action=>action.category===category).length;return `<button data-schedule-category="${category}" class="${activeScheduleCategory===category?'on':''}">${category}${newCount?`<i>${newCount}</i>`:''}</button>`;}).join('');
  const availableActions=holiday?[actions.find(action=>action.id===holiday.id),actions.find(action=>action.id==='rest')]:activeScheduleCategory==='아르바이트'?visibleJobActions():actions.filter(action=>action.category===activeScheduleCategory&&actionUnlocked(action)&&action.id!=='shopping');
  const actionCards=availableActions.map(action=>`<button class="action compact-action ${selectedScheduleAction===action.id?'selected':''}" data-action="${action.id}" ${holiday&&filled?'disabled':''}><img class="schedule-action-face" src="../assets/ui/activity-icons/activity-${scheduleActionIcon(action)}.png" alt=""><b>${action.name}</b><small class="schedule-action-money">${scheduleActionMoneyLabel(action)}</small></button>`).join('');
  const timelineMotion=scheduleTimelineMotion;scheduleTimelineMotion='';
  panelBody.innerHTML = `<section class="phase-progress compact" aria-label="전체 성장 페이즈 진행률"><div><b>제${phase.index}페이즈</b><span>${phase.index} / ${phase.total}</span></div><div class="phase-progress-track"><i style="width:${phase.percent}%"></i></div></section><div class="phase-five-wrap"><button id="phasePrev" aria-label="이전 페이즈 기록" ${timelineStart>0?'':'disabled'}>◀</button><div class="phase-five-grid ${timelineMotion?`slide-${timelineMotion}`:''}">${phaseSlots}</div><button id="phaseNext" aria-label="다음 페이즈 기록" ${timelineStart<latestStart?'':'disabled'}>▶</button></div><small class="phase-slide-count">완료 이력은 회색으로 보존됩니다 · ${timelineStart+1}–${Math.min(timelineStart+5,timeline.length)} / ${timeline.length}</small>${holiday?`<p class="fixed-holiday-phase"><b>${holiday.name} 고정 페이즈</b><span>${holiday.date.getMonth()+1}월 ${holiday.date.getDate()}일 포함 · 참가하지 않으면 집에서 휴식</span></p>`:`<div class="schedule-tabs compact-tabs" role="tablist">${categoryTabs}</div>`}<section class="schedule-category compact-category ${activeScheduleCategory==='아르바이트'?'job-upgrade-category':''}"><div class="action-grid compact-schedule-grid">${actionCards}</div></section><div class="schedule-tools compact-tools"><button id="scheduleRunPhases" ${filled?'':'disabled'}>${filled}개 페이즈 실행</button><button id="scheduleClearAll" ${filled?'':'disabled'}>전체 비우기</button></div>`;
  panelBody.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => addDailyAction(button.dataset.action,button)));
  panelBody.querySelectorAll('[data-phase-remove]').forEach(button=>button.addEventListener('click',()=>clearDailyAction(Number(button.dataset.phaseRemove))));
  document.querySelector('#phasePrev').addEventListener('click',()=>{scheduleTimelineOffset=Math.min(latestStart,scheduleTimelineOffset+1);scheduleTimelineMotion='older';renderSchedulePanel();});
  document.querySelector('#phaseNext').addEventListener('click',()=>{scheduleTimelineOffset=Math.max(0,scheduleTimelineOffset-1);scheduleTimelineMotion='newer';renderSchedulePanel();});
  panelBody.querySelectorAll('[data-schedule-category]').forEach(button=>button.addEventListener('click',()=>{activeScheduleCategory=button.dataset.scheduleCategory;renderSchedulePanel();}));
  document.querySelector('#scheduleRunPhases').addEventListener('click',()=>{scheduleConfirmDismissed=false;showScheduleConfirmation();});
  document.querySelector('#scheduleClearAll').addEventListener('click',clearAllSchedule);
}

let scheduleConfirmDismissed = false;
function showScheduleConfirmation() {
  if (!game.dailySchedule.length || scheduleConfirmDismissed) return;
  document.querySelector('#scheduleConfirmText').textContent=`${game.dailySchedule.length}개 페이즈를 실행하시겠습니까?`;
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
function openHomeMarket(){
  document.querySelector('#speakerName').textContent='선화';
  document.querySelector('#dialogueText').textContent='저잣거리로 나가 볼까요?';
  playMarketMusic();
  marketShoppingActive=true;
  exploreMarket().then(()=>{
    marketShoppingActive=false;
    playHomeMusic();
    document.querySelector('#speakerName').textContent=game.guardianName||guardianDefs[game.guardianType]?.name||'수호신수';
    document.querySelector('#dialogueText').textContent='저잣거리에서 돌아왔어요.';
  });
}
function closeMarketUiForTransition(){
  document.querySelector('#outfitPreview')?.remove();
  panelBody.classList.remove('outfit-preview-open');
  document.querySelector('.phone').classList.remove('market-shop-open');
  document.querySelector('#marketConfirm').hidden=true;
  document.querySelector('#marketExplore').hidden=true;
  panel.hidden=true;marketSelection=null;
}
function returnToMarketSelection(){
  panel.hidden=true;
  panelBody.classList.remove('outfit-preview-open');
  document.querySelector('.phone').classList.remove('market-shop-open');
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
function itemSalePrice(item){
  const base=Number(item.purchasePrice||item.giftValue||0),bonus=Object.values(item.statChange||{}).reduce((sum,value)=>sum+Math.max(0,value),0);
  return Math.max(20,Math.round(base*(.36+Math.min(.18,(game.sense||0)/1000))+bonus*6));
}
function buySundryGood(id){
  normalizeInventory();const good=sundryGoods.find(entry=>entry.id===id);if(!good||game.money<good.price||game.items.some(item=>item.id===id))return;
  game.money-=good.price;const actual=applyStatChange(good.change);
  game.items.push({id:good.id,type:good.type,name:good.name,description:good.detail,qty:1,source:'sundry-shop',purchasePrice:good.price,statChange:actual,sellable:true});
  document.querySelector('#dialogueText').textContent=`잡화전에서 ${good.name}${objectParticle(good.name)} 구입했어요.`;showLiveChanges({change:actual,cost:good.price});renderHud();renderShopPanel('sundry',true);queueAutoSave();
}
function sellInventoryItem(id,returnToShop=false){
  normalizeInventory();const index=game.items.findIndex(item=>item.id===id),item=game.items[index];if(!item||(!item.sellable&&!String(item.source||'').includes('birthday')))return;
  const reversed={};Object.entries(item.statChange||{}).forEach(([key,value])=>reversed[key]=-value);
  if(item.source==='guardian-birthday')reversed.guardianTrust=(reversed.guardianTrust||0)-8;
  if(item.source==='father-birthday')reversed.fatherAffinity=(reversed.fatherAffinity||0)-8;
  const actual=applyStatChange(reversed),price=itemSalePrice(item);game.money+=price;game.items.splice(index,1);
  document.querySelector('#dialogueText').textContent=`${item.name}${objectParticle(item.name)} ${price.toLocaleString()}냥에 팔았어요. 선물에 깃든 능력도 함께 사라졌습니다.`;
  showLiveChanges({change:actual,cost:-price});renderHud();queueAutoSave();if(returnToShop)renderShopPanel('sundry',true);else renderInventory();
}
function renderShopPanel(tab='food',marketMode=marketShoppingActive,outfitCategory='general'){
  normalizeInventory();
  activeShopMarketMode=marketMode;
  activeOutfitShopCategory=outfitCategory;
  panelTitle.textContent=tab==='food'?'저잣거리 · 주막':tab==='outfit'?'저잣거리 · 포목전':'저잣거리 · 잡화전';
  const keeper=tab==='food'?{name:'주모',image:'../assets/characters/npcs/shops/market-tavern-keeper-v2.png',greeting:'어서 오세요. 따뜻한 음식이 준비되어 있답니다.'}:tab==='outfit'?{name:'포목전 주인',image:'../assets/characters/npcs/shops/market-cloth-keeper-v2.png',greeting:'어서 오세요. 곱게 지은 한복을 천천히 살펴보세요.'}:{name:'잡화전 주인',image:'../assets/characters/npcs/shops/market-goods-keeper-v2.png',greeting:'비녀부터 단장품까지 두루 살펴보세요. 가져온 물건도 값을 쳐 드리지요.'};
  const owned=new Set(game.items.filter(item=>typeof item==='object').map(item=>item.id));
  const foodCards=foods.map(food=>`<button class="shop-card visual-card" data-food="${food.id}" ${game.money<food.price?'disabled':''}><img src="../assets/items/food/${food.id}.png" alt="${food.name}"><b>${food.name}</b><span>${food.price}냥</span><small>${food.detail}<br>${formatChanges(food.change)}</small></button>`).join('');
  const visibleOutfits=outfits.filter(outfit=>outfitShopCategory(outfit)===outfitCategory);
  const outfitCards=visibleOutfits.map(outfit=>{const premium=isPremiumOutfit(outfit),cash=isCashOutfit(outfit),available=outfitAvailable(outfit),insufficient=cash?game.cash<outfit.cashPrice:game.money<outfit.price,locked=!available||owned.has(outfit.id)||insufficient,displayAge=available?growthVisualAge():outfit.age;return `<button class="shop-card outfit-card visual-card ${available?'available':''} ${premium?'premium':''} ${cash?'cash':''} ${locked?'locked':''}" data-outfit-preview="${outfit.id}" aria-label="${outfit.name} 미리보기"><img src="${outfitImageForAge(outfit.id,displayAge)}" alt="${outfit.name}"><b>${outfit.name}</b><span>${cash?`${outfit.cashPrice.toLocaleString()}원`:`${outfit.price}냥`}</span><small>${cash?'캐시 의상 · ':premium?'고급 의상 · ':''}${outfitAgeLabel(outfit)} · ${outfit.seasons.join('·')}<br>${formatChanges(outfit.change)}${owned.has(outfit.id)?'<br>보유 중':''}</small></button>`;}).join('');
  const sundryCards=sundryGoods.map(good=>`<button class="shop-card goods-card" data-sundry-buy="${good.id}" ${owned.has(good.id)||game.money<good.price?'disabled':''}><i class="item-glyph type-${good.type}"></i><b>${good.name}</b><span>${good.price.toLocaleString()}냥</span><small>${good.detail}<br>${formatChanges(good.change)}${owned.has(good.id)?'<br>보유 중':''}</small></button>`).join('');
  const sellable=game.items.filter(item=>item.sellable||String(item.source||'').includes('birthday'));
  const sellCards=sellable.map(item=>`<button class="shop-card goods-card sell-card" data-sundry-sell="${item.id}"><i class="item-glyph type-${item.type}"></i><b>${item.name}</b><span>${itemSalePrice(item).toLocaleString()}냥에 판매</span><small>${formatChanges(item.statChange||{})}<br>판매 시 능력 감소${item.source==='guardian-birthday'?' · 신수 신뢰도 감소':item.source==='father-birthday'?' · 아버지 친밀도 감소':''}</small></button>`).join('');
  const outfitCategoryTabs=tab==='outfit'?`<div class="outfit-shop-tabs" role="tablist" aria-label="의상 등급"><button data-outfit-category="general" class="${outfitCategory==='general'?'on':''}">일반 의상</button><button data-outfit-category="premium" class="${outfitCategory==='premium'?'on':''}">고급 의상</button><button data-outfit-category="cash" class="${outfitCategory==='cash'?'on':''}">캐시 의상</button></div>`:'';
  const categoryName={general:'일반',premium:'고급',cash:'캐시'}[outfitCategory]||'일반';
  const listTitle=tab==='food'?`음식 메뉴 · ${foods.length}종`:tab==='outfit'?`${categoryName} 의상 · ${visibleOutfits.length}벌`:`단장 잡화 · ${sundryGoods.length}종`;
  const cards=tab==='food'?foodCards:tab==='outfit'?outfitCards:sundryCards;
  panelBody.innerHTML=`<div class="shop-greeting"><img src="${keeper.image}" alt="${keeper.name}"><div><b>${keeper.name}</b><p>${keeper.greeting}</p></div></div><div class="shop-money"><span>보유 은전 <b>${game.money.toLocaleString()}냥</b></span><span>테스트 캐시 <b>${game.cash.toLocaleString()}원</b></span></div>${marketMode?'':`<div class="shop-tabs"><button data-shop-tab="food" class="${tab==='food'?'on':''}">주막</button><button data-shop-tab="outfit" class="${tab==='outfit'?'on':''}">포목전</button><button data-shop-tab="sundry" class="${tab==='sundry'?'on':''}">잡화전</button></div>`}${outfitCategoryTabs}<h3 class="shop-list-title">${listTitle}</h3><div class="shop-grid">${cards}</div>${tab==='sundry'?`<h3 class="shop-list-title">내 물건 판매</h3><div class="shop-grid">${sellCards||'<p class="empty-shop">판매할 수 있는 물건이 없습니다.</p>'}</div>`:''}<button id="shopBack" aria-label="저잣거리 상점 선택 화면으로 돌아가기">${marketMode?'← 저잣거리로 돌아가기':'일정으로 돌아가기'}</button>`;
  if(!marketMode)panelBody.querySelectorAll('[data-shop-tab]').forEach(button=>button.addEventListener('click',()=>renderShopPanel(button.dataset.shopTab,marketMode)));
  panelBody.querySelectorAll('[data-outfit-category]').forEach(button=>button.addEventListener('click',()=>renderShopPanel('outfit',marketMode,button.dataset.outfitCategory)));
  panelBody.querySelectorAll('[data-food]').forEach(button=>button.addEventListener('click',()=>buyFood(button.dataset.food)));
  panelBody.querySelectorAll('[data-outfit-preview]').forEach(button=>button.addEventListener('click',()=>showOutfitPreview(button.dataset.outfitPreview)));
  panelBody.querySelectorAll('[data-sundry-buy]').forEach(button=>button.addEventListener('click',()=>buySundryGood(button.dataset.sundryBuy)));
  panelBody.querySelectorAll('[data-sundry-sell]').forEach(button=>button.addEventListener('click',()=>sellInventoryItem(button.dataset.sundrySell,true)));
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
  panelBody.classList.add('outfit-preview-open');
  panelBody.insertAdjacentHTML('beforeend',`<div class="outfit-preview-backdrop" id="outfitPreview"><section class="outfit-preview-card ${cash?'cash-preview':''}" role="dialog" aria-modal="true" aria-label="${outfit.name} 미리보기"><button class="outfit-preview-close" id="outfitPreviewClose" aria-label="미리보기 닫기">×</button><div class="outfit-preview-image"><img id="outfitPreviewImage" src="${outfitImageForAge(outfit.id,previewGrowthAge)}" alt="${previewGrowthAge}세 ${outfit.name} 전신 미리보기"></div><div class="outfit-preview-info"><small>${grade}</small><h3>${outfit.name}</h3><p>${outfitAgeLabel(outfit)} · ${outfit.seasons.join('·')}<br>${formatChanges(outfit.change)}</p>${agePreview}<b>${cash?`${outfit.cashPrice.toLocaleString()}원`:`${outfit.price.toLocaleString()}냥`}</b><em>${reason}</em><button id="outfitPreviewBuy" ${owned||ageLocked||insufficient?'disabled':''}>${owned?'구매 완료':cash?'테스트 캐시로 구매하기':'이 의상 구매하기'}</button></div></section></div>`);
  const closePreview=()=>{document.querySelector('#outfitPreview')?.remove();panelBody.classList.remove('outfit-preview-open');};
  document.querySelector('#outfitPreviewClose').addEventListener('click',closePreview);
  document.querySelector('#outfitPreview').addEventListener('click',event=>{if(event.target.id==='outfitPreview')closePreview();});
  document.querySelectorAll('[data-cash-preview-age]').forEach(button=>button.addEventListener('click',()=>{
    const age=Number(button.dataset.cashPreviewAge),image=document.querySelector('#outfitPreviewImage');image.src=outfitImageForAge(outfit.id,age);image.alt=`${age}세 ${outfit.name} 전신 미리보기`;
    document.querySelectorAll('[data-cash-preview-age]').forEach(item=>{const selected=item===button;item.classList.toggle('on',selected);item.setAttribute('aria-pressed',String(selected));});
  }));
  document.querySelector('#outfitPreviewBuy').addEventListener('click',()=>buyOutfit(id));
}
async function buyFood(id){const food=foods.find(item=>item.id===id);if(!food||game.money<food.price)return;panel.hidden=true;const stage=document.querySelector('#activityStage'),character=document.querySelector('#stageCharacter'),mealScene=document.querySelector('#marketMealScene'),mealDish=document.querySelector('#marketMealDish');document.querySelector('#marketExplore').hidden=true;stage.hidden=false;stage.className='activity-stage map-tavernMeal eating-stage';document.querySelector('#stageMap').src=backgrounds.tavernMeal;document.querySelector('#stageNpc').hidden=true;document.querySelector('#stageProps').hidden=true;document.querySelector('#stageCaption').textContent=`주막 · ${food.name}`;character.hidden=true;mealDish.src=`../assets/items/food/${food.id}.png`;mealDish.alt=`상 위의 ${food.name}`;mealScene.hidden=false;mealScene.classList.remove('is-eating');void mealScene.offsetWidth;mealScene.classList.add('is-eating');await new Promise(r=>setTimeout(r,2240));mealScene.hidden=true;mealScene.classList.remove('is-eating');stage.hidden=true;game.money-=food.price;applyShopChanges(food.change);document.querySelector('#dialogueText').textContent=`주막 상에서 ${food.name}을(를) 맛있게 먹었어요. 다시 둘러볼 수 있어요.`;showLiveChanges({change:food.change,cost:food.price});panel.hidden=false;renderShopPanel('food',true);queueAutoSave();}
function buyOutfit(id){normalizeInventory();const outfit=outfits.find(item=>item.id===id);if(!outfit||!outfitAvailable(outfit))return;const cash=isCashOutfit(outfit);if(cash?game.cash<outfit.cashPrice:game.money<outfit.price)return;if(game.items.some(item=>item.type==='outfit'&&item.id===id)){document.querySelector('#dialogueText').textContent=`${outfit.name}은(는) 이미 보유하고 있어요.`;panelBody.classList.remove('outfit-preview-open');renderShopPanel('outfit',activeShopMarketMode,activeOutfitShopCategory);return;}if(cash)game.cash-=outfit.cashPrice;else game.money-=outfit.price;game.items.push({id:outfit.id,type:'outfit',name:outfit.name,age:outfit.age,ageEnd:outfit.ageEnd,tone:outfit.tone,seasons:outfit.seasons,qty:1});game.autoOutfit=false;game.equippedOutfit=id;applyEquippedOutfit();applyShopChanges(outfit.change);document.querySelector('#dialogueText').textContent=`${outfit.name}을(를) 구입하고 갈아입었어요. 일정에서도 이 의상이 유지돼요.`;if(!cash)showLiveChanges({change:outfit.change,cost:outfit.price});renderHud();panelBody.classList.remove('outfit-preview-open');renderShopPanel('outfit',activeShopMarketMode,activeOutfitShopCategory);queueAutoSave();}

const marketPlaces=[
  {id:'food',side:-1,label:'주막'},
  {id:'outfit',side:0,label:'포목전'},
  {id:'sundry',side:1,label:'잡화전'}
  // 추후 {id:'pub',side:-2,label:'주점'}, {id:'gift',side:2,label:'선물가게'} 추가 가능
];
let marketSelection=null,marketResolve=null,marketReturnToHome=false;
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
  document.querySelector('#marketConfirmText').textContent=type==='food'?'주모를 선택하시겠습니까?':type==='outfit'?'포목전 주인을 선택하시겠습니까?':'잡화전 주인을 선택하시겠습니까?';
  document.querySelector('#marketConfirm').hidden=false;
}
function closeMarketConfirm(){document.querySelector('#marketConfirm').hidden=true;selectMarketShop(null);}
function exploreMarket(){
  const explore=document.querySelector('#marketExplore'),stage=document.querySelector('#activityStage'),phone=document.querySelector('.phone'),stageMap=document.querySelector('#stageMap');marketReturnToHome=!phone.classList.contains('playing');stageMap.src=backgrounds.marketSelection;stageMap.alt='주막·포목전·잡화전이 늘어선 저잣거리';phone.classList.add('market-playing');stage.hidden=false;stage.classList.add('market-choice-stage');explore.hidden=false;document.querySelector('#marketConfirm').hidden=true;document.querySelector('#stageCharacter').hidden=true;document.querySelector('#stageNpc').hidden=true;document.querySelector('#stageProps').hidden=true;marketMealConsumed=false;marketSelection=null;selectMarketShop(null);
  return new Promise(resolve=>{marketResolve=()=>{phone.classList.remove('market-playing');explore.hidden=true;document.querySelector('#stageCharacter').hidden=false;document.querySelector('#stageProps').hidden=false;if(marketReturnToHome){stage.hidden=true;stage.className='activity-stage';stageMap.src=backgrounds.home;stageMap.alt='선화의 집';}marketReturnToHome=false;resolve();};});
}
function enterMarketShop(type){if(!type)return;const place=marketPlaces.find(item=>item.id===type);document.querySelector('#dialogueText').textContent=`${place?.label||'가게'} 주인이 “어서 오세요.” 하고 반겨요.`;document.querySelector('#marketExplore').hidden=true;document.querySelector('#activityStage').hidden=true;document.querySelector('.phone').classList.add('market-shop-open');panel.hidden=false;renderShopPanel(type,true);}

function exploreDungeon(){
  const explore=document.querySelector('#dungeonExplore'),player=document.querySelector('#dungeonPlayer'),message=document.querySelector('#dungeonMessage');
  const chest=document.querySelector('#dungeonChest'),monster=document.querySelector('#dungeonMonster'),finish=document.querySelector('#dungeonFinish');
  const controls=[...document.querySelectorAll('[data-dungeon-move]')];
  const position={x:0,y:4};let reward=0,gearReward=null,chestFound=false,monsterCleared=false,resolved=false;
  explore.hidden=false;explore.dataset.season=game.season;player.src=spriteFrames.down[1];chest.classList.remove('cleared');monster.classList.remove('cleared');
  const render=()=>{player.style.setProperty('--x',position.x);player.style.setProperty('--y',position.y);};
  const inspect=()=>{
    if(position.x===4&&position.y===0&&!chestFound){chestFound=true;const found=100+Math.floor(Math.random()*101);reward+=found;if(Math.random()<.45)gearReward=awardDungeonGear();chest.classList.add('cleared');message.textContent=gearReward?`낡은 상자에서 은전 ${found}냥과 「${gearReward.name}」을 발견했어요.`:`낡은 상자에서 은전 ${found}냥을 발견했어요.`;}
    if(position.x===3&&position.y===3&&!monsterCleared){monsterCleared=true;monster.classList.add('cleared');const mage=(game.magic+game.intelligence+dungeonGearPower('magic'))>(game.strength+game.health+dungeonGearPower('sword'));const combat=mage?'magic':'sword',score=mage?game.magic+game.intelligence+dungeonGearPower(combat):game.strength+game.health+dungeonGearPower(combat);const won=score>=90||Math.random()>.35;if(won){const found=40+Math.floor(Math.random()*61);reward+=found;message.textContent=`장착 장비의 도움을 받아 ${mage?'술법':'검술'}으로 산짐승을 물리치고 은전 ${found}냥을 얻었어요.`;}else message.textContent='산짐승을 피해 물러났어요. 소지품에서 비경 장비를 장착하고 다시 도전해 보세요.';}
    if(position.x===0&&position.y===4&&(chestFound||monsterCleared))message.textContent='돌아가는 문에 도착했어요. 탐사를 마칠 수 있습니다.';
  };
  const move=direction=>{if(resolved)return;const delta={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[direction];if(!delta)return;position.x=Math.max(0,Math.min(4,position.x+delta[0]));position.y=Math.max(0,Math.min(4,position.y+delta[1]));render();inspect();};
  const keydown=event=>{const direction={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[event.key];if(direction){event.preventDefault();move(direction);}};
  controls.forEach(button=>button.onclick=()=>move(button.dataset.dungeonMove));document.addEventListener('keydown',keydown);render();
  return new Promise(resolve=>{finish.onclick=()=>{if(resolved)return;resolved=true;document.removeEventListener('keydown',keydown);controls.forEach(button=>button.onclick=null);finish.onclick=null;explore.hidden=true;resolve({money:reward,gear:gearReward});};});
}

function addDailyAction(id,sourceButton) {
  const sourceRect=sourceButton?.getBoundingClientRect(),sourceMarkup=sourceButton?.innerHTML;
  const chosenAction=actions.find(action=>action.id===id);
  if(!chosenAction||!actionUnlocked(chosenAction))return;
  const holiday=currentPhaseHoliday();if(holiday&&game.dailySchedule.length)return;
  normalizePhaseSchedule();
  if(id==='shopping'&&game.dailySchedule.includes('shopping')){
    document.querySelector('#speakerName').textContent='수호신수';
    document.querySelector('#dialogueText').textContent='저잣거리는 한 페이즈에 한 번만 나갈 수 있어요.';
    renderSchedulePanel();
    return;
  }
  game.dailySchedule.push(id);scheduleCursor=game.dailySchedule.length-1;scheduleTimelineOffset=0;selectedScheduleAction=id;
  const firstSelection=!game.activityUnlocksSeen.includes(id);
  if(firstSelection)game.activityUnlocksSeen.push(id);
  if(chosenAction.intro&&firstSelection){document.querySelector('#speakerName').textContent=chosenAction.mentor;document.querySelector('#dialogueText').textContent=chosenAction.intro;}
  else document.querySelector('#dialogueText').textContent = `${chosenAction.name} 14일 페이즈를 일정 끝에 추가했어요.`;
  scheduleConfirmDismissed = false;
  renderSchedulePanel();
  requestAnimationFrame(()=>animateScheduleAssignment(sourceRect,sourceMarkup,game.dailySchedule.length-1));
  queueAutoSave();
}

function animateScheduleAssignment(sourceRect,sourceMarkup,phaseIndex){
  const target=panelBody.querySelector(`[data-phase-remove="${phaseIndex}"]`);if(!target)return;
  const previous=[...panelBody.querySelectorAll('.phase-mini-slot.filled')].filter(slot=>slot!==target);
  previous.slice(-2).forEach(slot=>{slot.classList.add('moved-left');slot.addEventListener('animationend',()=>slot.classList.remove('moved-left'),{once:true});});
  const shiftFromCenter=()=>{target.classList.add('conveyor-arrive');setTimeout(()=>target.classList.remove('conveyor-arrive'),460);};
  if(!sourceRect||matchMedia('(prefers-reduced-motion: reduce)').matches){shiftFromCenter();return;}
  const centerSlot=panelBody.querySelector('.phase-mini-slot.current'),targetRect=(centerSlot||target).getBoundingClientRect(),flyer=document.createElement('div');flyer.className='schedule-flying-card';flyer.innerHTML=sourceMarkup||`<b>${target.textContent}</b>`;document.body.appendChild(flyer);
  Object.assign(flyer.style,{left:`${sourceRect.left}px`,top:`${sourceRect.top}px`,width:`${sourceRect.width}px`,height:`${sourceRect.height}px`});
  const flight=flyer.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${targetRect.left-sourceRect.left}px,${targetRect.top-sourceRect.top}px) scale(.72)`,opacity:.92}],{duration:460,easing:'cubic-bezier(.2,.75,.25,1)',fill:'forwards'});
  flight.finished.finally(()=>{flyer.remove();shiftFromCenter();});
}

function clearAllSchedule(){game.dailySchedule=[];game.scheduleFormat='phase-v1';scheduleCursor=0;selectedScheduleAction=null;scheduleConfirmDismissed=false;hideScheduleConfirmation();renderSchedulePanel();queueAutoSave();}

function clearDailyAction(index) {
  if (!game.dailySchedule[index]) return;
  game.dailySchedule.splice(index,1);
  scheduleCursor=Math.min(scheduleCursor,Math.max(0,game.dailySchedule.length-1));
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
  document.querySelector('#closeMonthlyReport').addEventListener('click',()=>{panel.hidden=true;document.querySelector('#dialogueText').textContent=`${game.month}월도 함께 힘내 보아요.`;if(!presentHolidayRelation()&&!presentActivityUnlocks())openVisitingMerchant();});
}

function showPhaseReport(dayRecords,phaseStart){
  const counts={perfect:0,success:0,struggle:0,mistake:0};let income=0,expense=0;
  dayRecords.forEach(record=>{counts[record.outcome]=(counts[record.outcome]||0)+1;if(record.moneyChange>0)income+=record.moneyChange;else if(record.moneyChange<0)expense+=Math.abs(record.moneyChange);});
  const diligent=counts.perfect+counts.success+(counts.normal||0),rate=dayRecords.length?Math.round(diligent/dayRecords.length*100):0;
  const mastery=awardPhaseMastery(dayRecords);
  const result=document.querySelector('#dayResult');
  result.classList.add('phase-brief-result');
  const vacationPhase=dayRecords.length>0&&dayRecords.every(record=>record.action?.id==='vacation');
  const educationPhase=dayRecords.length>0&&dayRecords.every(record=>record.action?.category==='교육');
  const diligentLabel=educationPhase?'착실히 수업한 일수':'착실히 일한 일수';
  const workDaysLine=vacationPhase?'':`<p class="phase-work-days"><span>${diligentLabel}</span><strong>${dayRecords.length}일 중 ${diligent}일 (${rate}%)</strong></p>`;
  const moneyLine=educationPhase
    ?`<p class="phase-work-expense"><span>지출 금액${mastery?.rankUp?` · ${mastery.rankUp} 승급!`:''}</span><strong>-${expense.toLocaleString()}냥</strong></p>`
    :(vacationPhase&&income<=0)?'':`<p class="phase-work-income"><span>수입${mastery?.rankUp?` · ${mastery.rankUp} 승급!`:''}</span><strong>+${income.toLocaleString()}냥</strong></p>`;
  result.innerHTML=workDaysLine+moneyLine||'<p class="phase-work-days"><span>바캉스를 마쳤어요.</span></p>';
  const closePhaseReport=()=>{result.hidden=true;result.classList.remove('phase-brief-result');};
  result.hidden=false;
  return new Promise(resolve=>setTimeout(()=>{closePhaseReport();resolve();},3000));
}

async function runWeek() {
  normalizePhaseSchedule();if (!game.dailySchedule.length) return;
  hideScheduleConfirmation();
  const unlockedBefore=new Set(actions.filter(actionUnlocked).map(action=>action.id));
  const scheduled = game.dailySchedule.map(id => actions.find(item => item.id === id));
  const expanded=scheduled.flatMap(action=>Array.from({length:14},()=>action));
  const playableDays=Math.min(expanded.length,daysUntilEnding());
  const selected = expanded.slice(0,playableDays);
  if(selected.length===0){game.ended=true;showEnding();return;}
  let projectedMoney=game.money;
  const unaffordable=selected.find(action=>{projectedMoney-=action.cost;return projectedMoney<0;});
  if (unaffordable) {
    document.querySelector('#dialogueText').textContent = `${unaffordable.name}을(를) 진행할 은전이 부족해요. 돈이 0냥 아래로 내려가지 않도록 일정을 다시 짜보자.`;
    panel.hidden = true;
    return;
  }
  const phaseBefore=phaseInfo();
  panel.hidden = true;
  const playbackResult = await playWeeklySchedule(selected);
  const completedLedgers=recordMonthlySchedule(playbackResult.dayRecords);
  if(!Array.isArray(game.completedPhases))game.completedPhases=[];
  for(let offset=0;offset<playbackResult.dayRecords.length;offset+=14){const records=playbackResult.dayRecords.slice(offset,offset+14),names=[...new Set(records.map(record=>record.action.name))];game.completedPhases.push({index:phaseBefore.index+Math.floor(offset/14),name:names.join('·'),completedAt:records.at(-1)?.date||game.currentDate});}
  scheduleTimelineOffset=0;
  game.homeReaction=null;
  const birthdayEvents=advanceGameDate(selected.length);
  const phaseAfter=phaseInfo(),phaseAdvanced=phaseAfter.index>phaseBefore.index;
  pendingHolidayRelation=rollHolidayRelationEvent();
  const visibleJobIdsAfter=new Set(visibleJobActions().map(action=>action.id));
  pendingActivityUnlocks=actions.filter(action=>actionUnlocked(action)&&!unlockedBefore.has(action.id)&&(!action.retiredJob||visibleJobIdsAfter.has(action.id)));
  const completedLedger=completedLedgers[0]||null;
  const counts = selected.reduce((map, action) => (map[action.name]=(map[action.name]||0)+1,map),{});
  const summary = Object.entries(counts).map(([name,count]) => count > 1 ? `${name} ${count}일` : name).join(' · ');
  document.querySelector('#dialogueText').textContent = birthdayEvents.length?birthdayEvents.map(event=>event.message).join(' '):(game.ended?`마지막 ${selected.length}일 일정(${summary})을 마쳤어요.`:phaseAdvanced?`제${phaseBefore.index}페이즈를 마쳤어요. ${summary}의 기록을 정리하고 새 페이즈를 시작합니다.`:`제${phaseBefore.index}페이즈 ${phaseBefore.week}주차 일정(${summary})을 마쳤어요.`);
  if(birthdayEvents.length){const birthdayChange={};birthdayEvents.forEach(event=>Object.entries(event.change).forEach(([key,value])=>birthdayChange[key]=(birthdayChange[key]||0)+value));showLiveChanges({change:birthdayChange,cost:0});}
  game.dailySchedule = [];
  bg.src = backgrounds.home;
  playHomeMusic();
  applyEquippedOutfit();
  renderHud();
  panel.hidden = true;
  if(phaseAdvanced)rollVisitingMerchant();else pendingVisitShop=false;
  if (game.ended) showEnding();
  else if(completedLedger)showMonthlyReport(completedLedger);
  else if(!presentHolidayRelation()&&!presentActivityUnlocks())openVisitingMerchant();
  clearTimeout(autoSaveTimer);
  writeLatestAutoSave();
}

function isoDate(date){ const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
function addYears(date, years){ const next=new Date(date); next.setFullYear(next.getFullYear()+years); return next; }
// 프메3의 반월 페이즈를 현재 7일 일정에 맞춰 2주(14일) 단위로 적용한다.
// 일정은 계속 일주일씩 진행하고, 두 번째 주가 끝날 때 대화와 방문 이벤트가 갱신된다.
function phaseInfo(dateValue=game.currentDate){
  if(!game.birthday||!dateValue)return {index:1,week:1,key:'phase-1',total:1,remaining:0,percent:0};
  const birth=new Date(`${game.birthday}T00:00:00`),current=new Date(`${dateValue}T00:00:00`);
  if(Number.isNaN(birth.getTime())||Number.isNaN(current.getTime()))return {index:1,week:1,key:'phase-1',total:1,remaining:0,percent:0};
  const start=addYears(birth,9),ending=game.endingDate?new Date(`${game.endingDate}T00:00:00`):addYears(birth,19);
  if(Number.isNaN(start.getTime())||Number.isNaN(ending.getTime()))return {index:1,week:1,key:'phase-1',total:1,remaining:0,percent:0};
  const total=Math.max(1,Math.ceil((ending-start)/86400000/14));
  const elapsed=Math.max(0,Math.floor((current-start)/86400000)),index=Math.min(total,Math.floor(elapsed/14)+1),week=Math.floor((elapsed%14)/7)+1;
  const completed=Math.min(total,(index-1)+(week-1)/2),percent=Math.max(0,Math.min(100,Math.round(completed/total*100)));
  return {index,week,key:`phase-${index}`,total,remaining:Math.max(0,total-index),percent};
}
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
  const giftValue=480+Object.values(gift.actualChange).reduce((sum,value)=>sum+Math.max(0,value),0)*55;
  game.items.push({id:gift.id,type:'event',name:gift.name,description:'아홉 번째 생일에 수호신수와 인연을 맺으며 받은 첫 축복. 판매하면 축복 능력과 신수 신뢰도가 감소합니다.',qty:1,source:'guardian-birthday',statChange:{...gift.actualChange},giftValue,sellable:true});
  return gift;
}
function awardFatherBirthdayGift(age){
  if(!Array.isArray(game.fatherBirthdayYears))game.fatherBirthdayYears=[];
  if(game.fatherBirthdayYears.includes(age))return null;
  const stressDrop=4+Math.floor(Math.random()*7),affinityGain=2+Math.floor(Math.random()*4),change=applyStatChange({stress:-stressDrop,fatherAffinity:affinityGain});
  game.fatherBirthdayYears.push(age);game.birthdayCount=game.fatherBirthdayYears.length;
  const giftValue=360+age*25+Object.values(change).reduce((sum,value)=>sum+Math.max(0,value),0)*45;
  game.items.push({id:`father-birthday-letter-${age}`,type:'event',name:`아버지의 ${age}세 생일 선물`,description:'멀리 있는 아버지가 보낸 편지와 작은 선물. 판매하면 받은 능력과 아버지 친밀도가 감소합니다.',qty:1,source:'father-birthday',statChange:{...change},giftValue,sellable:true});
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
  Object.assign(game,{characterName,guardianType:null,guardianName:'',nannyName:'',profileSlot,birthday:value,currentDate:isoDate(start),endingDate:isoDate(ending),age:9,height:130,weight:28.5,month,season:birthSeason,birthSeason,element,week:Math.floor((start.getDate()-1)/7)+1,stress:0,ended:false,endingResult:null,birthdayCount:0,fatherBirthdayYears:[],fatherAffinity:0,startingGiftId:null});
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
function renderGuardianCinematicBeat(){const story=document.querySelector('#guardianStory'),beat=guardianCinematicTimeline[guardianCinematicBeat],next=document.querySelector('#guardianStoryNext'),hint=document.querySelector('#guardianStoryHint');if(!beat)return;story.dataset.phase=beat.phase;document.querySelector('#guardianStoryChapter').textContent=beat.chapter;document.querySelector('#guardianStoryText').textContent=beat.text;if(beat.cue)playGuardianCinematicCue(beat.cue);const ready=Boolean(beat.ready);next.hidden=!ready;next.disabled=!ready;if(hint){hint.hidden=true;hint.textContent='';}guardianInputLockedUntil=Date.now()+450;}
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
  Object.assign(game,{guardianType:selectedGuardianType,guardianName,nannyName:guardianName,nannyAffinity:50,guardianTrust:50,lastGuardianTalkDate:null});
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
function startIntroDialogue(lines){
  introDialogueQueue=lines;introDialogueIndex=0;
  const phone=document.querySelector('.phone'),greeting=document.querySelector('#homeGreeting'),portrait=document.querySelector('#homeGreetingPortrait');
  phone.classList.add('intro-guardian-active');
  greeting.hidden=false;portrait.classList.remove('is-listening');
  document.querySelector('#guardianTalkResult').hidden=true;
  openGuardianDialogueOverlay('neutral');
  renderIntroDialogue();
}
function renderIntroDialogue(){
  const scene=introDialogueQueue[introDialogueIndex];if(!scene)return;
  document.querySelector('#homeGreetingSpeaker').textContent=scene.speaker;
  document.querySelector('#homeGreetingLine').textContent=scene.line;
  document.querySelector('#homeGreetingPrompt').textContent=`${introDialogueIndex+1} / ${introDialogueQueue.length} · 아래의 다음을 눌러 계속`;
  const choices=document.querySelector('#homeGreetingChoices');
  choices.innerHTML=`<button id="introGuardianContinue" type="button">${introDialogueIndex===introDialogueQueue.length-1?'첫 일주일 시작하기 ›':'다음 ›'}</button>`;
  document.querySelector('#introGuardianContinue').addEventListener('click',advanceIntroDialogue,{once:true});
}
function advanceIntroDialogue(){
  if(!introDialogueQueue.length)return;introDialogueIndex+=1;
  if(introDialogueIndex>=introDialogueQueue.length){
    introDialogueQueue=[];introDialogueIndex=0;
    dissolveGuardianDialogueOverlay(()=>{
      document.querySelector('.phone').classList.remove('intro-guardian-active');
      document.querySelector('#speakerName').textContent=game.guardianName;
      document.querySelector('#dialogueText').textContent='아래의 일정 버튼을 눌러 첫 주를 계획해 보자.';
    });
    return;
  }
  renderIntroDialogue();
}
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
  if(game.autoOutfit)updateAutoOutfit();
  else applyEquippedOutfit();
  return birthdayEvents;
}
function seasonForMonth(month){ return month>=3&&month<=5?'봄':month>=6&&month<=8?'여름':month>=9&&month<=11?'가을':'겨울'; }
function showEnding(){
  if(!game.endingResult)game.endingResult=resolveEnding();
  const result=game.endingResult;
  const categoryLabel={relation:'인연 엔딩',career:'직업 엔딩',downfall:'몰락 엔딩'}[result.category];
  const partner=result.partnerName?`<div><small>함께한 인연</small><b>${result.partnerName} · ${result.partnerRole}</b></div>`:'';
  panel.hidden=false; panelTitle.textContent=`${game.characterName || '아이'}의 성장 기록`;
  const qaPool=result.category==='relation'?endingRelationCandidates:result.category==='career'?careerEndingCandidates:downfallEndingCandidates,qaIndex=Math.max(0,qaPool.findIndex(item=>item.id===result.endingId)),qaControls=endingStandaloneQa?`<nav class="ending-qa compact" aria-label="엔딩 QA"><button type="button" data-ending-id="${qaPool[(qaIndex-1+qaPool.length)%qaPool.length].id}">이전</button><span>${qaIndex+1}/${qaPool.length}</span><button type="button" data-ending-id="${qaPool[(qaIndex+1)%qaPool.length].id}">다음</button></nav>`:'';
  panelBody.innerHTML=`<div class="ending-card ${result.category}">${qaControls}<small class="ending-date">${game.currentDate}</small><em>${categoryLabel}</em><h2>${result.title}</h2>${relationEndingVisual(result)}${soloEndingVisual(result)}${endingEpilogueMarkup(result)}<p class="ending-lead">${result.description}</p><section class="ending-summary">${result.category==='relation'?`<div><small>직업 성향</small><b>${result.careerTitle}</b></div>`:''}${partner}<div><small>대표 능력</small><b>${result.strongest.map(stat=>`${stat.label} ${stat.value}`).join(' · ')}</b></div><div><small>수집</small><b>${result.collectionCount} / ${result.collectionTotal}</b></div><div><small>은전</small><b>${Math.max(0,game.money).toLocaleString()}냥</b></div></section><button id="endingRestart">새로운 생일로 시작</button></div>`;
  document.querySelector('#endingRestart').addEventListener('click',beginNewGrowth);
  document.querySelectorAll('[data-ending-id]').forEach(button=>button.addEventListener('click',()=>{const params=new URLSearchParams(location.search);params.set('qaEnding',button.dataset.endingId);location.search=params.toString();}));
  bindEndingEpilogue(result);
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
  resetTransientScenes();
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
  const playbackPhase=phaseInfo();
  const dayNames = ['월요일','화요일','수요일','목요일','금요일','토요일','일요일'];
  const moonlightSession=selected.some(action=>action.id==='holiday-chuseok')?evaluateChuseokFestival():null;
  const sehwaSession=selected.some(action=>action.id==='holiday-seollal')?evaluateSeollalFestival():null;
  document.querySelector('#homeGreeting').hidden=true;
  phone.classList.remove('greeting-active');
  phone.classList.add('playing');
  playback.hidden = false;
  syncPlaybackSpeedToggle();
  stage.hidden = false;
  stageCharacterImage.src = spriteFrames.down[1];
  const playbackWeek=document.querySelector('#playbackWeek');
  const playbackHolidayMark=document.querySelector('#playbackHolidayMark');
  if(playbackWeek)playbackWeek.innerHTML=Array.from({length:14},(_,day)=>`<span>${day+1}</span>`).join('');
  let stressRestUntilPhaseEnd=false;
  for (let index = 0; index < selected.length; index += 1) {
    if(index%14===0)stressRestUntilPhaseEnd=false;
    const activityDate=new Date(scheduleStart);activityDate.setDate(scheduleStart.getDate()+index);
    const weekdayLabels=['일','월','화','수','목','금','토'];
    const plannedAction = selected[index];
    if(simulated.stress>=statMaximum('stress'))stressRestUntilPhaseEnd=true;
    const action = stressRestUntilPhaseEnd&&plannedAction.id!=='rest'?actions.find(item=>item.id==='rest'):plannedAction;
    playScheduleMusic(action);
    renderStagePm3Hud(activityDate,{},action);
    const forcedRest = action.id!==plannedAction.id;
    if(forcedRest){
      selected[index]=action;
    }
    const presentation = actionPresentation[action.id]||actionPresentation.rest;
    clearMoonlightPageant();
    const currentMasteryRank=activityRank(action.id);
    stage.hidden=false;stageCharacter.hidden=true;stageProps.hidden=false;stageProps.removeAttribute('style');
    // 이동형 일정이 남긴 인라인 좌표와 방향을 매일 초기화한다. 특히 장터 심부름이
    // 창 밖에서 끝난 뒤 다음 일정의 선화가 그 좌표에서 시작하지 않게 한다.
    stageCharacter.style.removeProperty('left');
    delete stageCharacter.dataset.errandDirection;
    delete stageCharacter.dataset.errandStarting;
    setScheduleDialogue(action,'start',index);
    if(forcedRest)document.querySelector('#dialogueText').textContent='스트레스가 100에 도달해 오늘 일정은 집에서 휴식으로 변경했어요.';
    const dailyOutfit=game.autoOutfit?updateAutoOutfit(action.id):game.equippedOutfit;
    const playbackDay=document.querySelector('#playbackDay');
    playbackDay.classList.remove('date-tick');void playbackDay.offsetWidth;playbackDay.classList.add('date-tick');
    playbackDay.textContent = `${activityDate.getFullYear()}년 ${activityDate.getMonth()+1}월 ${activityDate.getDate()}일 (${weekdayLabels[activityDate.getDay()]})`;
    document.querySelector('#playbackAction').textContent = ['교육','아르바이트'].includes(action.category)
      ? `${action.category} · ${action.name} · ${activityRankNames[currentMasteryRank]}`
      : action.name;
    document.querySelector('#playbackDailyStats').innerHTML='';
    document.querySelectorAll('#playbackWeek span').forEach((day,dayIndex)=>{day.classList.toggle('done',dayIndex<=(index%14)-1);day.classList.toggle('current',dayIndex===(index%14));});
    if(playbackHolidayMark){
      const holidayIndex=activityDate.getDay()===0||activityDate.getDay()===6;
      playbackHolidayMark.hidden=!holidayIndex;
      phone.classList.toggle('schedule-holiday',holidayIndex);
    }
    const outfitName=outfits.find(item=>item.id===dailyOutfit)?.name;
    const showOutfitName=action.id!=='rest'&&Boolean(outfitName);
    const restActivity=action.id==='rest'?(index%14<7?'tea':'sleep'):null;
    document.querySelector('#stageCaption').textContent = `${action.name}${['교육','아르바이트'].includes(action.category)?` · ${activityRankNames[currentMasteryRank]}`:''}${restActivity?` · ${restActivity==='tea'?'차 마시기':'잠자기'}`:''}`;
    document.querySelector('#playbackProgress').style.width = `${((index + 1) / selected.length) * 100}%`;
    bg.src = backgrounds[presentation.location];
    stageMap.src = backgrounds[presentation.location];
    stageMap.alt = `${action.name} 활동 장소`;
    stageProps.className = `stage-props prop-${presentation.prop}`;
    stageNpc.hidden = !presentation.npc;
    stageNpc.className = presentation.npc ? `stage-npc npc-${presentation.npc}` : 'stage-npc';
    stageNpc.style.removeProperty('--relation-sheet');stageNpc.style.removeProperty('--relation-age-position');stageNpcImage.hidden=false;
    if(presentation.npc)stageNpcImage.src = await normalizeActivityFrame((presentation.npc==='teacher'?npcFrames.teacherReading:npcFrames[presentation.npc])[0]);
    const phaseSceneType=action.category==='교육'?'pm3-phase-scene lesson-scene':action.category==='아르바이트'?'pm3-phase-scene work-scene':'pm3-phase-scene daily-scene';
    stage.className = `activity-stage ${phaseSceneType} map-${presentation.location} action-${action.id} mastery-${currentMasteryRank}`;
    stage.classList.remove('scene-enter');void stage.offsetWidth;stage.classList.add('scene-enter');
    stageCharacter.className = `stage-character pixel-sprite ${presentation.motion}${restActivity==='tea'?' rest-tea':''}`;
    stageCharacter.hidden=false;
  let dungeonReward={money:0,gear:null},dateRelation=null;
  let holidayContestResult=null;
  let condition=null,outcome=null;
  if(scheduleLayerIds.has(action.id)||action.id==='errand'){
    outcome=judgeActivityOutcome(action,simulated.stress);
    condition=conditionEvent(simulated.stress,index,outcome);
  }
  if(action.id==='shopping'){
      playMarketMusic();
      stageMap.src=backgrounds.market;
      document.querySelector('#stageCaption').textContent=`저잣거리 · 좌우로 움직여 가게를 선택하세요`;
      marketShoppingActive=true;
      try{await exploreMarket();}
      finally{
        marketShoppingActive=false;
        closeMarketUiForTransition();
        stage.hidden=false;stageCharacter.hidden=false;stageProps.hidden=false;
        playHomeMusic();
      }
    }else if(action.id==='vacation'){
      closeMarketUiForTransition();
      if(index%14===0){
        const vacationCompanion=await chooseVacationCompanion();
        const prize=awardVacationIllustration();
        stage.hidden=true;stageNpc.hidden=true;stageProps.hidden=true;stageCharacter.hidden=true;
        const metSomeone=await playVacationScene(prize,index,vacationCompanion,scheduleStart,index<selected.length-1);
        document.querySelector('#dialogueText').textContent=metSomeone?`바캉스에서 「${prize.name}」 일러스트와 ${metSomeone.name}의 인연 추억을 얻었어요.`:`바캉스에서 「${prize.name}」 일러스트를 획득했어요.`;
      }else document.querySelector('#dialogueText').textContent='같은 여행지에서 느긋하게 휴식을 이어 갔어요.';
    }else if(action.id==='holiday-chuseok'){
      const holidayBackground=`../assets/events/holidays/moonlight-pageant/background/moonlight-courtyard-v1.webp?v=${scheduleAssetRevision}`;
      bg.src=holidayBackground;stageMap.src=holidayBackground;
      stageMap.alt='보름달이 뜬 궁중 한가위 달빛 아씨 경연장';
      stage.className=`activity-stage ${phaseSceneType} map-restRoom action-holiday-chuseok`;
      stageProps.className='stage-props prop-none';
      stageNpc.hidden=true;stageCharacter.hidden=true;
      holidayContestResult=moonlightSession;
      for(let beat=0;beat<moonlightStoryBeats.length;beat+=1){
        renderMoonlightPageant(holidayContestResult,beat);
        document.querySelector('#dialogueText').textContent=moonlightStoryBeats[beat];
        await waitForMoonlightAdvance(beat);
      }
    }else if(action.id==='holiday-seollal'){
      stageMap.src=`../assets/events/holidays/sehwa-contest/background/royal-contest-hall-empty-v1.png?v=${scheduleAssetRevision}`;
      stageMap.alt='왕실 화원의 설날 세화 경연장';
      stage.className=`activity-stage ${phaseSceneType} map-restRoom action-holiday-seollal`;
      stageProps.className='stage-props prop-none';
      stageNpc.hidden=true;stageCharacter.hidden=true;
      holidayContestResult=sehwaSession;
      for(let beat=0;beat<sehwaStoryBeats.length;beat+=1){
        renderSehwaContest(holidayContestResult,beat);
        document.querySelector('#dialogueText').textContent=beat===1?`선화: “${sehwaOpeningAnswer(holidayContestResult)}”`:sehwaStoryBeats[beat];
        await waitForSehwaAdvance(beat);
      }
      if(holidayContestResult.prize){
        if(!game.items.some(item=>item.id==='royal-sehwa-album'))game.items.push({id:'royal-sehwa-album',type:'event',name:'왕실 화원의 세화첩',description:'복을 그리는 왕실 세화 경연에서 대상을 받아 황에게 직접 하사받은 세화첩',qty:1,source:'seollal-sehwa-contest'});
        holidayContestResult.homeArtwork=awardSehwaArtwork(holidayContestResult);
      }
    }else if(action.id==='dungeon'){
      stageCharacter.hidden=true;stageNpc.hidden=true;stageProps.hidden=true;dungeonReward=await exploreDungeon();stageCharacter.hidden=false;stageProps.hidden=false;
    }else if(action.special==='date'){
      const relation=endingRelationCandidates.find(candidate=>candidate.id===action.relationId),record=relationRecord(action.relationId);dateRelation={candidate:relation,record};
      stageMap.src=backgrounds.market;stageMap.alt=`${relation.name}과 만난 저잣거리`;
      stageCharacter.hidden=true;stageProps.hidden=true;stageNpc.hidden=false;stageNpc.className='stage-npc npc-romance-date';applyRelationPortrait(stageNpc,relation);
      document.querySelector('#dialogueText').textContent=`${relation.name}과 만나기로 한 자리에 섰어요.`;
      await schedulePlaybackDelay(1250);
      record.affinity=Math.min(100,record.affinity+12);record.lastMetAt=game.currentDate||null;record.relationship=record.affinity>=80?'연인':record.affinity>=60?'특별한 인연':'친구';
      stageCharacter.hidden=false;stageProps.hidden=false;
    }else if(scheduleLayerIds.has(action.id)){
      stageNpc.hidden=true;stageProps.hidden=true;
      await playScheduleLayerScene(action.id,stageCharacterImage,currentMasteryRank,outcome,index);
    }else if(action.id==='rest'&&![0,7].includes(index%14)){
      const restFrames=activityFrameSet(restActivity)||activityFrameSet('sleep');
      stageCharacterImage.src=await outfitActivityFrame(restFrames[restActivity==='tea'?0:2],dailyOutfit);
      await schedulePlaybackDelay(180);
    }else await animateActivitySprite(stageCharacterImage,presentation.motion,restActivity||presentation.activity,stageNpcImage,presentation.npc,dailyOutfit,currentMasteryRank,index,outcome);
    const guaranteedSuccess=['rest','vacation','dungeon','holiday-chuseok','holiday-seollal'].includes(action.id)||action.special==='date';
    if(outcome===null)outcome=judgeActivityOutcome(action,simulated.stress);
    if(condition===null&&!['shopping','rest','vacation','dungeon','holiday-chuseok','holiday-seollal'].includes(action.id)&&!action.special)condition=conditionEvent(simulated.stress,index,outcome);
    if(action.id==='holiday-chuseok'||action.id==='holiday-seollal')outcome='success';
    if(action.id==='dungeon')outcome=dungeonReward.money>=140?'perfect':dungeonReward.money>0?'normal':'struggle';
    if(!guaranteedSuccess&&(outcome==='mistake'||outcome==='struggle')&&action.id!=='shopping'&&!scheduleLayerIds.has(action.id)){
      if(action.id==='errand'&&outcome==='mistake')await animateErrandFall(stageCharacterImage);
      else if(action.id==='errand'&&outcome==='struggle')await animateErrandNearFall(stageCharacterImage);
      else if((action.id==='reading'||action.id==='arithmetic')&&(outcome==='mistake'||outcome==='struggle'))await animateStudySweatWipe(action.id,stageCharacterImage);
      else await animateNaturalFailure(action.id,stageCharacterImage,outcome);
    }
    const fullPhaseHoliday=action.id==='holiday-seollal'||action.id==='holiday-chuseok';
    const resolvedChange=fullPhaseHoliday?{...resolvedActivityChange(action,outcome)}:phaseDailyChange(resolvedActivityChange(action,outcome),index%14);
    if(holidayContestResult){
      const contestChange=fullPhaseHoliday?holidayContestResult.change:phaseDailyChange(holidayContestResult.change,index%14);
      Object.entries(contestChange).forEach(([key,value])=>{resolvedChange[key]=(resolvedChange[key]||0)+value;});
    }
    const isWork=action.category==='아르바이트',basePay=isWork?activityPay(action):0;
    let moneyChange=isWork?(outcome==='mistake'?0:outcome==='struggle'?Math.round(basePay*.5):basePay):-action.cost;
    if(action.id==='dungeon'){
      moneyChange+=dungeonReward.money;
    }
    const progressReward=recordActivityProgress(action,outcome);
    moneyChange+=progressReward.bonusPay;
    if(condition){
      setScheduleDialogue(action,condition,index);
      await animateConditionEvent(stageCharacter,conditionCue,condition);
    }
    setScheduleDialogue(action,outcome,index);
    if(outcome==='mistake')document.querySelector('#dialogueText').textContent='';
    if(dateRelation)document.querySelector('#dialogueText').textContent=`${dateRelation.candidate.name}과 조금 더 가까워졌어요. ${dateRelation.record.relationship}예요.`;
    stageCharacter.className = `stage-character pixel-sprite ${presentation.motion}${restActivity==='tea'?' rest-tea':''}`;
    const actualChange={};
    Object.entries(resolvedChange).forEach(([key,value])=>{const before=clampStat(key,game[key]||0),after=clampStat(key,before+value);game[key]=after;actualChange[key]=after-before;});
    document.querySelector('#playbackDailyStats').innerHTML=orderedChangeEntries(actualChange).filter(([,value])=>value!==0).map(([key,value])=>{const after=clampStat(key,game[key]),before=after-value,beneficial=key==='stress'?value<0:value>0;return `<span class="${beneficial?'up':'down'}"><b>${statLabels[key]||key}</b> ${before}→${after} <small>${value>0?'+':''}${value}</small></span>`;}).join('')||'<span>오늘 능력치 변화 없음</span>';
    renderStagePm3Hud(activityDate,actualChange,action);
    const resolvedAction={...action,cost:-moneyChange,change:actualChange};
    renderActivityGauges(resolvedAction);
    game.money=Math.max(0,game.money+moneyChange);
    renderHud();
    const moneyLabel=document.querySelector('#moneyLabel');
    moneyLabel.classList.remove('money-changing');void moneyLabel.offsetWidth;moneyLabel.classList.add('money-changing');
    showLiveChanges(resolvedAction);
    const rewardText=dungeonReward.gear?` · ${dungeonReward.gear.name} 획득`:progressReward.reward?` · ${progressReward.reward.name} 획득`:progressReward.bonusPay?` · 연속 대성공 보너스 +${progressReward.bonusPay}냥`:'';
    const bonusText=`${progressReward.rankUp?` · ${progressReward.rankUp} 승급!`:''}${rewardText}`;
    const moneyText = (moneyChange > 0 ? `은전 +${moneyChange}냥` : moneyChange < 0 ? `은전 ${moneyChange}냥` : isWork&&outcome==='mistake'?'실수하여 일당 없음':'비용 없음')+bonusText;
    const resultSummary=orderedChangeEntries(actualChange).filter(([,value])=>value!==0).map(([key,value])=>`${statLabels[key]||key} ${value>0?'+':''}${value}`).join(' · ');
    const relationEvent=maybeScheduleRelationEncounter(action);
    const holidayResultText=holidayContestResult?`<br>${holidayContestResult.summary}`:'';
    const resultTitle=holidayContestResult?`${action.id==='holiday-seollal'?'복을 그리는 왕실 세화 경연':'한가위 달빛 아씨 경연'} · ${holidayContestResult.overallRank}`:`${action.name} · ${outcomeLabels[outcome]}`;
    dayResult.innerHTML = `<b>${resultTitle}</b><span>${resultSummary||'능력치 변화 없음'}${holidayResultText}<br>${moneyText} · 현재 ${game.money.toLocaleString()}냥${dateRelation?`<br>${dateRelation.candidate.name} +12 · ${dateRelation.record.affinity} · ${dateRelation.record.relationship}`:''}${relationEvent?`<br>${relationEvent.candidate.name} — ${relationEvent.episode.title}`:''}</span>`;
    if(relationEvent){document.querySelector('#dialogueText').textContent=relationEvent.episode.line;await playRelationEncounterScene(relationEvent.candidate,relationEvent.episode.line,`호감 ${relationRecord(relationEvent.candidate.id).affinity} · ${relationRecord(relationEvent.candidate.id).relationship}`,relationEvent.episode);}
    if(action.id!=='vacation'&&outcome!=='mistake'){
      if(action.id==='childcare')stageCharacter.hidden=true;
      dayResult.hidden = false;
      await schedulePlaybackDelay(900);
      dayResult.hidden = true;
    }
    Object.entries(actualChange).forEach(([key,value])=>weeklyChange[key]=(weeklyChange[key]||0)+value);
    dayRecords.push({date:isoDate(activityDate),action:{...action,cost:-moneyChange},actualChange,outcome,moneyChange});
    simulated.stress=clampStat('stress',simulated.stress+(resolvedChange.stress||0));
    if((action.id==='vacation'||action.id==='holiday-seollal'||action.id==='holiday-chuseok')&&index%14===0)index=Math.min(index+13,selected.length-1);
    if((index+1)%14===0||index===selected.length-1){
      const start=index-index%14,phaseRecords=dayRecords.slice(start,index+1);
      const vacationPhase=phaseRecords.length>0&&phaseRecords.every(record=>record.action?.id==='vacation');
      if(!vacationPhase){stageCharacter.hidden=true;stageNpc.hidden=true;stageProps.hidden=true;await showPhaseReport(phaseRecords,{...playbackPhase,index:playbackPhase.index+Math.floor(index/14)});}
    }
  }
  playback.hidden = true;
  stage.hidden = true;
  stageCharacter.className = 'stage-character pixel-sprite';
  stageCharacter.style.removeProperty('left');
  delete stageCharacter.dataset.errandDirection;
  delete stageCharacter.dataset.errandStarting;
  stageNpc.hidden = true;
  stageProps.className = 'stage-props prop-none';
  clearMoonlightPageant();
  document.querySelector('#activityGauges').hidden = true;
  document.querySelector('#stagePm3Hud').hidden = true;
  conditionCue.hidden = true;
  document.querySelector('.dialogue').classList.remove('schedule-speaking');
  document.querySelector('#speakerName').textContent=game.guardianName||guardianDefs[game.guardianType]?.name||'수호신수';
  phone.classList.remove('playing','schedule-holiday');
  bg.src=backgrounds.home;
  bg.alt='한옥 안채';
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
document.querySelectorAll('[data-playback-speed-toggle]').forEach(button=>button.addEventListener('click',event=>{event.stopPropagation();schedulePlaybackSpeed=schedulePlaybackSpeed===2?1:2;syncPlaybackSpeedToggle();}));
window.addEventListener('keydown',event=>{if(document.querySelector('#marketExplore').hidden)return;if(event.key==='ArrowLeft')selectMarketShop('food');if(event.key==='ArrowRight')selectMarketShop('outfit');if(event.key==='Enter'&&marketSelection)enterMarketShop(marketSelection);});
bg.addEventListener('load', updateImageState);
document.querySelector('#marketHomeButton')?.addEventListener('click',openHomeMarket);
document.querySelector('#wardrobeButton')?.addEventListener('click',renderWardrobe);
document.querySelector('#collectionBookButton')?.addEventListener('click',()=>openPanel('collection'));
document.querySelector('#settingsGameRecordButton')?.addEventListener('click',()=>{closeSettings();openPanel('save');});
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
character.addEventListener('error',()=>{
  const expectedBase=baseSpriteForAge();
  if(!game.equippedOutfit&&!character.src.endsWith(expectedBase.split('/').pop()))character.src=expectedBase;
  updateImageState();
});
document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel)));
document.querySelector('#closePanel').addEventListener('click', () => {if(marketShoppingActive)returnToMarketSelection();else{panel.hidden=true;playHomeMusic();}});
document.querySelector('#recoveryFresh').addEventListener('click',declineRecovery);
document.querySelector('#recoveryContinue').addEventListener('click',continueRecovery);
document.querySelector('#startGame').addEventListener('click', startWithBirthday);
document.querySelector('#guardianStoryNext').addEventListener('click',nextGuardianStory);
document.querySelector('#guardianStory').addEventListener('click',event=>{if(!event.target.closest('button'))nextGuardianStory();});
document.querySelectorAll('[data-guardian]').forEach(button=>button.addEventListener('click',()=>chooseGuardian(button.dataset.guardian)));
document.querySelector('#guardianChoiceConfirm').addEventListener('click',confirmGuardianChoice);
document.querySelector('#merchantVisitYes').addEventListener('click',()=>closeVisitingMerchant(true));
document.querySelector('#merchantVisitNo').addEventListener('click',()=>closeVisitingMerchant(false));
document.querySelector('#guardianNameConfirm').addEventListener('click',finishGuardianNaming);
document.querySelector('#guardianNameInput').addEventListener('keydown',event=>{if(event.key==='Enter')finishGuardianNaming();});
document.querySelector('#guardianReselect').addEventListener('click',reselectGuardian);
document.querySelector('#guardianCompanion').addEventListener('click',startGuardianConversation);
document.querySelector('#guardianCompanion').addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();startGuardianConversation();}});
document.querySelector('.dialogue').addEventListener('click',advanceIntroDialogue);
document.querySelector('#birthdayMonth').addEventListener('change',()=>syncBirthdaySelectors());
document.querySelector('#birthdayDay').addEventListener('change',()=>syncBirthdaySelectors());
document.querySelector('#prologueNext').addEventListener('click',nextPrologue);
document.querySelector('#prologueBack').addEventListener('click',previousPrologue);
document.querySelector('#prologueSound').addEventListener('click',togglePrologueSound);
document.querySelector('#prologueSkip').addEventListener('click',closePrologue);
document.querySelector('#storyReplay').addEventListener('click',replayPrologue);
document.querySelector('#studioStartSound').addEventListener('click',finishStudioIntro);
let scheduleQaLoopRunning=false;
let scheduleQaActionId='kitchenhelp';
async function startScheduleLayerQaPattern(pattern){
  scheduleQaForcedPattern=pattern;
  document.querySelectorAll('[data-qa-pattern]').forEach(button=>button.classList.toggle('active',button.dataset.qaPattern===pattern));
  if(scheduleQaLoopRunning)return;
  scheduleQaLoopRunning=true;
  const image=document.querySelector('#stageCharacterImage');
  const oneShotQa=scheduleQaActionId==='childcare'||(scheduleQaActionId==='farmwork'&&pattern==='fail-b');
  if(oneShotQa){
    try{
      await playScheduleLayerScene(scheduleQaActionId,image,0,pattern.startsWith('fail-')?'mistake':'success',pattern.endsWith('-b')?1:0);
      document.querySelector('#stageCaption').textContent=`QA · ${scheduleQaActionId==='childcare'?'아이 돌보기':'논가 닭 추격'} · 1회 재생 완료`;
    }finally{scheduleQaLoopRunning=false;}
    return;
  }
  while(scheduleLayerStandaloneQa){
    const activePattern=scheduleQaForcedPattern;
    await playScheduleLayerScene(scheduleQaActionId,image,0,activePattern.startsWith('fail-')?'mistake':'success',activePattern.endsWith('-b')?1:0);
  }
}
async function startStudyFailureQa(actionId){
  if(scheduleQaLoopRunning)return;
  scheduleQaLoopRunning=true;
  const image=document.querySelector('#stageCharacterImage'),props=document.querySelector('#stageProps');
  while(scheduleLayerStandaloneQa){
    props.hidden=true;
    image.src=await outfitActivityFrame(activityFrameSet(actionId)[0],game.equippedOutfit);
    await animateActivitySprite(image,actionPresentation[actionId]?.motion||'motion-study',actionId,null,null,game.equippedOutfit,0);
    await animateStudySweatWipe(actionId,image);
    await schedulePlaybackDelay(520);
  }
}
function initStudyFailureQa(actionId){
  ['studioLoading','prologue','birthdaySetup','recoveryPrompt','guardianStory','guardianChoice','guardianNaming'].forEach(id=>{const element=document.querySelector(`#${id}`);if(element)element.hidden=true;});
  panel.hidden=true;
  const phone=document.querySelector('.phone'),stage=document.querySelector('#activityStage'),presentation=actionPresentation[actionId];
  phone.classList.add('playing','schedule-qa-playing');
  stage.hidden=false;stage.className=`activity-stage pm3-phase-scene lesson-scene action-${actionId}`;
  document.querySelector('#activityPlayback').hidden=true;document.querySelector('#stagePm3Hud').hidden=true;
  document.querySelector('#stageMap').src=backgrounds[presentation.location];
  document.querySelector('#stageMap').alt=`${actions.find(action=>action.id===actionId)?.name||actionId} 실패 장면`;
  document.querySelector('#stageCaption').textContent=`QA · ${actionId==='reading'?'글읽기':'셈하기'} · 이마의 땀 닦기`;
  const character=document.querySelector('#stageCharacter');character.hidden=false;character.className=`stage-character pixel-sprite ${presentation.motion}`;
  document.querySelector('#stageNpc').hidden=true;document.querySelector('#stageProps').hidden=true;
  startStudyFailureQa(actionId);
}
async function startErrandQa(){
  if(scheduleQaLoopRunning)return;
  scheduleQaLoopRunning=true;
  const image=document.querySelector('#stageCharacterImage');
  while(scheduleLayerStandaloneQa){
    const forcedDirection=scheduleQaParams.get('qaDirection')==='left'?'left':'right';
    await animateActivitySprite(image,'motion-errand','errand',null,null,game.equippedOutfit,0,forcedDirection==='right'?0:1,'success');
    await schedulePlaybackDelay(480);
  }
}
function initErrandQa(){
  ['studioLoading','prologue','birthdaySetup','recoveryPrompt','guardianStory','guardianChoice','guardianNaming'].forEach(id=>{const element=document.querySelector(`#${id}`);if(element)element.hidden=true;});
  panel.hidden=true;
  const phone=document.querySelector('.phone'),stage=document.querySelector('#activityStage'),presentation=actionPresentation.errand;
  phone.classList.add('playing','schedule-qa-playing');
  stage.hidden=false;stage.className='activity-stage pm3-phase-scene work-scene map-marketErrand action-errand';
  document.querySelector('#activityPlayback').hidden=true;document.querySelector('#stagePm3Hud').hidden=true;
  document.querySelector('#stageMap').src=backgrounds[presentation.location];
  document.querySelector('#stageMap').alt='장터 심부름 양방향 이동 장면';
  document.querySelector('#stageCaption').textContent=`QA · 장터 심부름 · ${scheduleQaParams.get('qaDirection')==='left'?'오른쪽 창 밖→왼쪽 창 밖':'왼쪽 창 밖→오른쪽 창 밖'}`;
  const character=document.querySelector('#stageCharacter');character.hidden=false;character.className='stage-character pixel-sprite motion-errand';character.style.removeProperty('left');
  document.querySelector('#stageNpc').hidden=true;document.querySelector('#stageProps').hidden=true;
  startErrandQa();
}
function initScheduleLayerQa(){
  const actionId=scheduleQaParams.get('qaSchedule')||'kitchenhelp';
  if(actionId==='reading'||actionId==='arithmetic'){initStudyFailureQa(actionId);return;}
  if(actionId==='errand'){initErrandQa();return;}
  if(!scheduleLayerIds.has(actionId))return;
  scheduleQaActionId=actionId;
  ['studioLoading','prologue','birthdaySetup','recoveryPrompt','guardianStory','guardianChoice','guardianNaming'].forEach(id=>{const element=document.querySelector(`#${id}`);if(element)element.hidden=true;});
  panel.hidden=true;
  const phone=document.querySelector('.phone'),stage=document.querySelector('#activityStage');
  phone.classList.add('playing','schedule-qa-playing');
  stage.hidden=false;stage.className=`activity-stage pm3-phase-scene work-scene action-${actionId}`;
  document.querySelector('#activityPlayback').hidden=true;
  document.querySelector('#stagePm3Hud').hidden=true;
  document.querySelector('#stageCaption').textContent=`QA · ${actions.find(action=>action.id===actionId)?.name||actionId}`;
  const character=document.querySelector('#stageCharacter');character.hidden=false;character.className=`stage-character pixel-sprite ${actionPresentation[actionId]?.motion||'motion-study'}`;
  document.querySelector('#stageNpc').hidden=true;document.querySelector('#stageProps').hidden=true;
  const frameSummary=actionId==='childcare'?'선화 6프레임 · 아이 4프레임 · 1회 재생 후 버튼으로 다시 보기':'선화 고정 132px · 1→2→3 반복';
  const controls=document.createElement('aside');controls.className='schedule-layer-qa';controls.innerHTML=`<strong>${actionId} QA</strong><div>${['success-a','success-b','fail-a','fail-b'].map(pattern=>`<button type="button" data-qa-pattern="${pattern}">${pattern}</button>`).join('')}</div><div><button type="button" data-qa-speed="1">1×</button><button type="button" data-qa-speed="2">2×</button></div><small>${frameSummary}</small>`;phone.appendChild(controls);
  controls.querySelectorAll('[data-qa-pattern]').forEach(button=>button.addEventListener('click',()=>startScheduleLayerQaPattern(button.dataset.qaPattern)));
  controls.querySelectorAll('[data-qa-speed]').forEach(button=>button.addEventListener('click',()=>{schedulePlaybackSpeed=Number(button.dataset.qaSpeed);controls.querySelectorAll('[data-qa-speed]').forEach(item=>item.classList.toggle('active',Number(item.dataset.qaSpeed)===schedulePlaybackSpeed));}));
  controls.querySelector('[data-qa-speed="1"]').classList.add('active');
  startScheduleLayerQaPattern(['success-a','success-b','fail-a','fail-b'].includes(scheduleQaForcedPattern)?scheduleQaForcedPattern:'success-a');
}

function saveGameToSlot(slot){
  if(!SAVE_SLOTS.includes(slot)||!game.birthday)return;
  const existing=readSave(slot),current=game.profileSlot===slot;
  if(existing&&!current&&!window.confirm(`${slot}번 슬롯의 기존 기록을 현재 시점으로 덮어쓸까요?`))return;
  saveGame(slot,false);
}
function initMoonlightPageantQa(){
  ['studioLoading','prologue','birthdaySetup','recoveryPrompt','guardianStory','guardianChoice','guardianNaming'].forEach(id=>{const element=document.querySelector(`#${id}`);if(element)element.hidden=true;});
  panel.hidden=true;
  const qaAge=Math.min(18,Math.max(9,Number(scheduleQaParams.get('qaAge'))||13));
  const requestedQaScore=scheduleQaParams.get('qaScore');
  const qaScore=Math.min(999,Math.max(0,requestedQaScore===null?210:Number(requestedQaScore)));
  const qaDay=Math.min(moonlightStoryBeats.length,Math.max(1,Number(scheduleQaParams.get('qaBeat')||scheduleQaParams.get('qaDay'))||moonlightStoryBeats.length));
  const qaCondition=scheduleQaParams.get('qaCondition');
  game.age=qaAge;game.sense=qaScore;game.manners=qaScore;game.dignity=qaScore;game.guardianType=game.guardianType||'cheongryong';
  if(qaCondition==='angry')game.stress=55;
  else if(qaCondition==='sad')game.mentality=30;
  else if(qaCondition==='shocked')game.homeReaction='shocked';
  else game.stress=0;
  const session=evaluateChuseokFestival(),phone=document.querySelector('.phone'),stage=document.querySelector('#activityStage');
  phone.classList.add('playing','schedule-qa-playing');stage.hidden=false;stage.className='activity-stage pm3-phase-scene daily-scene action-holiday-chuseok';
  document.querySelector('#activityPlayback').hidden=true;document.querySelector('#stagePm3Hud').hidden=true;
  const holidayBackground=`../assets/events/holidays/moonlight-pageant/background/moonlight-courtyard-v1.webp?v=${scheduleAssetRevision}`;bg.src=holidayBackground;document.querySelector('#stageMap').src=holidayBackground;
  document.querySelector('#stageCharacter').hidden=true;document.querySelector('#stageNpc').hidden=true;document.querySelector('#stageProps').hidden=true;
  document.querySelector('#stageCaption').textContent=`한가위 달빛 아씨 경연 QA · ${qaDay}일차 · 선화 ${session.overallRank}`;
  bindHolidayQaTap(session,qaDay-1,moonlightStoryBeats,renderMoonlightPageant,'한가위 달빛 아씨 경연 QA');
}
function initSehwaContestQa(){
  ['studioLoading','prologue','birthdaySetup','recoveryPrompt','guardianStory','guardianChoice','guardianNaming'].forEach(id=>{const element=document.querySelector(`#${id}`);if(element)element.hidden=true;});
  panel.hidden=true;
  const qaAge=Math.min(18,Math.max(9,Number(scheduleQaParams.get('qaAge'))||13));
  const qaBeat=Math.min(sehwaStoryBeats.length,Math.max(1,Number(scheduleQaParams.get('qaBeat')||scheduleQaParams.get('qaDay'))||sehwaStoryBeats.length));
  game.age=qaAge;game.guardianType=game.guardianType||'cheongryong';
  const session=evaluateSeollalFestival(),phone=document.querySelector('.phone'),stage=document.querySelector('#activityStage');
  phone.classList.add('playing','schedule-qa-playing');stage.hidden=false;stage.className='activity-stage pm3-phase-scene daily-scene action-holiday-seollal';
  document.querySelector('#activityPlayback').hidden=true;document.querySelector('#stagePm3Hud').hidden=true;
  const holidayBackground=`../assets/events/holidays/sehwa-contest/background/royal-atelier-v1.webp?v=${scheduleAssetRevision}`;bg.src=holidayBackground;document.querySelector('#stageMap').src=holidayBackground;
  document.querySelector('#stageCharacter').hidden=true;document.querySelector('#stageNpc').hidden=true;document.querySelector('#stageProps').hidden=true;
  document.querySelector('#stageCaption').textContent=`복을 그리는 왕실 세화 경연 QA · ${qaBeat}/${sehwaStoryBeats.length}장면 · 선화 ${session.overallRank}`;
  bindHolidayQaTap(session,qaBeat-1,sehwaStoryBeats,renderSehwaContest,'복을 그리는 왕실 세화 경연 QA');
}
function bindHolidayQaTap(session,startBeat,beats,renderer,caption){
  const overlay=document.querySelector('#moonlightPageant');let beat=startBeat;
  const show=()=>{renderer(session,beat);overlay.classList.add('tap-ready');document.querySelector('#dialogueText').textContent=beats[beat];document.querySelector('#stageCaption').textContent=`${caption} · ${beat+1}/${beats.length}장면 · 화면 터치로 다음`;};
  overlay.addEventListener('click',()=>{beat=(beat+1)%beats.length;show();});
  overlay.addEventListener('keydown',event=>{if(!['Enter',' '].includes(event.key))return;event.preventDefault();beat=(beat+1)%beats.length;show();});
  show();
}
function initRelationEncounterQa(){
  ['studioLoading','prologue','birthdaySetup','recoveryPrompt','guardianStory','guardianChoice','guardianNaming'].forEach(id=>{const element=document.querySelector(`#${id}`);if(element)element.hidden=true;});
  panel.hidden=true;
  const requestedId=scheduleQaParams.get('qaRelation')||'seojin';
  const candidate=endingRelationCandidates.find(item=>item.id===requestedId)||endingRelationCandidates[1];
  const meeting=Math.min(5,Math.max(1,Number(scheduleQaParams.get('qaMeeting'))||1));
  const episode=relationEpisodeCatalog[candidate.id]?.[meeting-1];
  game.age=Math.min(18,Math.max(candidate.minAge,Number(scheduleQaParams.get('qaAge'))||candidate.minAge));
  game.characterName=game.characterName||'선화';
  const phone=document.querySelector('.phone');phone.classList.add('playing','relation-qa-playing');
  const controls=document.createElement('aside');controls.className='relation-event-qa';
  controls.innerHTML=`<strong>인연 이벤트 QA</strong><div>${endingRelationCandidates.map(item=>`<button type="button" data-relation-id="${item.id}" class="${item.id===candidate.id?'active':''}">${item.name}</button>`).join('')}</div><div>${Array.from({length:5},(_,index)=>`<button type="button" data-relation-meeting="${index+1}" class="${index+1===meeting?'active':''}">${index+1}회</button>`).join('')}</div><small>${candidate.role} ${candidate.name} · ${meeting}/5 · ${episode?.title||'첫 만남'}</small>`;
  if(relationQaControlsVisible)phone.appendChild(controls);
  const openQa=(id,nextMeeting)=>{const params=new URLSearchParams(location.search);params.set('qaRelation',id);params.set('qaMeeting',String(nextMeeting));params.set('qaAge',String(Math.max(endingRelationCandidates.find(item=>item.id===id)?.minAge||13,game.age)));location.search=params.toString();};
  controls.querySelectorAll('[data-relation-id]').forEach(button=>button.addEventListener('click',()=>openQa(button.dataset.relationId,meeting)));
  controls.querySelectorAll('[data-relation-meeting]').forEach(button=>button.addEventListener('click',()=>openQa(candidate.id,Number(button.dataset.relationMeeting))));
  playRelationEncounterScene(candidate,`${meeting}회차 · ${episode?.title||'첫 만남'} · ${episode?.scene||candidate.role}\n${episode?.line||`${candidate.role} ${candidate.name}과 마주쳤어요.`}`,relationQaControlsVisible?`QA · ${game.age}세 · ${episode?.pose||'화자 교대'} · ${episode?.expression||'표정 확인'} · ${episode?.camera||'전신 확인'}`:'',episode);
}
function initEndingQa(){
  ['studioLoading','prologue','birthdaySetup','recoveryPrompt','guardianStory','guardianChoice','guardianNaming'].forEach(id=>{const element=document.querySelector(`#${id}`);if(element)element.hidden=true;});
  const requestedId=scheduleQaParams.get('qaEnding')||'doyun',candidate=endingRelationCandidates.find(item=>item.id===requestedId),career=careerEndingCandidates.find(item=>item.id===requestedId),downfall=downfallEndingCandidates.find(item=>item.id===requestedId),selected=candidate||career||downfall||endingRelationCandidates[0];
  game.characterName='선화';game.age=19;game.currentDate='2009-11-13';game.endingDate='2009-11-13';game.ended=true;game.stress=20;game.money=50000;game.health=650;game.manners=620;game.dignity=640;
  game.relations={};if(candidate)game.relations[candidate.id]={meetings:5,affinity:85,dateUnlocked:true,completedEpisodes:relationEpisodeCatalog[candidate.id].map(episode=>episode.id),relationship:'연인',holidayFlags:{},vacationMemories:[]};
  const strongest=[{label:'기품',value:640},{label:'예절',value:620},{label:'체력',value:650}];game.endingResult=candidate?resolveEnding():{resolvedAt:new Date().toISOString(),category:career?'career':'downfall',endingId:selected.id,title:selected.title,description:selected.description,careerId:career?.id||null,careerTitle:career?.title||'',partnerId:null,partnerName:null,partnerRole:null,relationMeetings:0,relationAffinity:0,strongest,collectionCount:0,collectionTotal:vacationIllustrations.length};renderHud();showEnding();
}
function initBasePortraitQa(){
  ['studioLoading','prologue','birthdaySetup','recoveryPrompt','guardianStory','guardianChoice','guardianNaming'].forEach(id=>{const element=document.querySelector(`#${id}`);if(element)element.hidden=true;});
  panel.hidden=true;
  const requestedAge=Number(scheduleQaParams.get('qaBaseAge'))||9;
  game.age=requestedAge>=19?19:requestedAge>=16?16:requestedAge>=13?13:9;
  game.characterName='선화';
  document.querySelector('.phone').classList.remove('playing','schedule-qa-playing','market-playing','vacation-playing');
  renderHud();
  updateHomeCharacter();
  document.querySelector('#speakerName').textContent='베이스 검수';
  document.querySelector('#dialogueText').textContent=`${game.age}세 반실사 기본 얼굴 · 땋은 올림머리 · 오른쪽 꽃 장식 · 갈색 눈`;
}
prologueScenes.forEach(scene=>{const image=new Image();image.src=scene.image;});
guardianStoryScenes.forEach(scene=>{const image=new Image();image.decoding='async';image.src=scene.image;});
syncBirthdaySelectors(true);
syncSettingsUi();
renderHud();
updateHomeCharacter();
updateImageState();
if(endingStandaloneQa)initEndingQa();
else if(basePortraitStandaloneQa)initBasePortraitQa();
else if(relationStandaloneQa)initRelationEncounterQa();
else if(sehwaStandaloneQa)initSehwaContestQa();
else if(moonlightStandaloneQa)initMoonlightPageantQa();
else if(scheduleLayerStandaloneQa)initScheduleLayerQa();
else{
  migrateLegacySave();
  initializeRecoverySession();
  document.addEventListener('visibilitychange',()=>{if(document.hidden)writeLatestAutoSave();});
  window.addEventListener('pagehide',()=>{writeLatestAutoSave();localStorage.removeItem(SESSION_ACTIVE_KEY);});
}
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('#settingsModal').hidden)closeSettings();});
