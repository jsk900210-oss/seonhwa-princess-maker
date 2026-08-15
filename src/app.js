const bg = document.querySelector('.background');
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
function vacationMusicPath(){const age=game.age>=18?'18':game.age>=16?'16':game.age>=13?'13':'09';const season={봄:'spring',여름:'summer',가을:'autumn',겨울:'winter'}[game.season]||'spring';return `../assets/audio/music/vacation/age-${age}/vacation-${season}.mp3`;}
function playGameMusic(source,volume=.24){if(!source)return;if(!gameMusic.src.endsWith(source.replace('../','/'))){gameMusic.pause();gameMusic.src=source;gameMusic.currentTime=0;}gameMusic.dataset.baseVolume=String(volume);gameMusic.volume=scaledVolume(volume,'bgm');if(userSettings.bgmEnabled)gameMusic.play().catch(()=>{});else gameMusic.pause();}
function playHomeMusic(){playGameMusic(gameMusicTracks.home,.22);}
function playMarketMusic(){playGameMusic(gameMusicTracks.market,.20);}
function playVacationMusic(){playGameMusic(vacationMusicPath(),.28);}
function stopGameMusic(){fadeAudio(gameMusic,0,350);}
function transitionPrologueToHomeMusic(){
  const prologueMusic=document.querySelector('#prologueMusic');
  playGameMusic(gameMusicTracks.home,.01);
  fadeAudio(gameMusic,scaledVolume(.22,'bgm'),1600);
  fadeAudio(prologueMusic,0,1600);
}

const game = { characterName:'', nannyName:'', profileSlot:null, age: 9, height:130, weight:28.5, month: 1, week: 1, season:'봄', money: 50000, cash:50000, health:42, strength:18, agility:20, intelligence:35, magic:8, mentality:30, dignity:36, manners:28, speech:14, sensitivity:40, sense:24, charm:30, stress:12, items: [], relations:{}, equippedOutfit:null, autoOutfit:true, dailySchedule: [null,null,null,null,null,null,null], birthday:null, currentDate:null, endingDate:null, ended:false, birthdayCount:0, element:null, birthSeason:null, memory:0, truth:0, exposure:0, guardianTrust:50, nannyAffinity:50, lastGreetingDate:null, monthlyLedger:null };
const statGroups = [
  { title: '신체', stats: [['health','체력'],['strength','힘'],['agility','민첩']] },
  { title: '지성·마음', stats: [['intelligence','지능'],['magic','마력'],['mentality','정신력']] },
  { title: '품격·소통', stats: [['dignity','기품'],['manners','예절'],['speech','화술']] },
  { title: '감각·매력', stats: [['sensitivity','감수성'],['sense','센스'],['charm','매력']] }
];
const statDisplayOrder=[...statGroups.flatMap(group=>group.stats.map(([key])=>key)),'stress','nannyAffinity','guardianTrust','memory','truth','exposure'];
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
const SAVE_KEY = 'seonhwa-princess-mvp-save-v2';
const SESSION_ACTIVE_KEY = 'seonhwa-princess-mvp-session-active';
const SAVE_SLOTS = [1,2,3,4,5];
const LEGACY_SAVE_KEYS = ['seonhwa-princess-mvp-save-v1'];
let pendingRecoverySave=null;
const statMaximum=key=>key==='stress'?100:999;
const clampStat=(key,value)=>Math.max(0,Math.min(statMaximum(key),Number(value)||0));
const boundedStats=[...new Set(statGroups.flatMap(group=>group.stats.map(([key])=>key)).concat(['stress','nannyAffinity','guardianTrust','memory','truth','exposure']))];
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
const growthProfile={9:[130,28.5],10:[135,31],11:[140,34],12:[145,38],13:[149,42],14:[153,45.5],15:[156,48.5],16:[158.5,51.5],17:[160.5,54],18:[162,56.5]};
function expectedBodyMetrics(age=game.age){return growthProfile[Math.max(9,Math.min(18,Math.floor(Number(age)||9)))]||growthProfile[9];}
function normalizeBodyMetrics(){const [height,weight]=expectedBodyMetrics();if(!Number.isFinite(Number(game.height)))game.height=height;if(!Number.isFinite(Number(game.weight)))game.weight=weight;game.height=Math.max(100,Math.min(190,Math.round(Number(game.height)*10)/10));game.weight=Math.max(18,Math.min(100,Math.round(Number(game.weight)*10)/10));}
function applyAgeGrowth(previousAge,nextAge){if(nextAge<=previousAge)return;const [beforeHeight,beforeWeight]=expectedBodyMetrics(previousAge),[afterHeight,afterWeight]=expectedBodyMetrics(nextAge);normalizeBodyMetrics();game.height=Math.round((game.height+afterHeight-beforeHeight)*10)/10;game.weight=Math.round((game.weight+afterWeight-beforeWeight)*10)/10;}
const actionPresentation = {
  reading: { motion:'motion-calligraphy', location:'studyRoom', prop:'none', activity:'calligraphy', npc:'teacher' }, arithmetic: { motion:'motion-arithmetic', location:'arithmeticRoom', prop:'none', activity:'arithmetic', npc:'teacher' },
  manners: { motion:'motion-manners', location:'etiquetteRoom', prop:'none', activity:'manners', npc:'teacher' }, errand: { motion:'motion-errand', location:'marketErrand', prop:'none', activity:'errand', npc:null },
  sweeping: { motion:'motion-sweeping', location:'courtyard', prop:'none', activity:'sweeping', npc:'dolsoe' }, herbs: { motion:'motion-herbs', location:'herbField', prop:'none', activity:'herbs', npc:'herbalist' },
  houseclean: { motion:'motion-houseclean', location:'restRoom', prop:'none', activity:'houseclean', npc:null },
  rest: { motion:'motion-resting', location:'restRoom', prop:'none', activity:'sleep', npc:null },
  sleep: { motion:'motion-sleep', location:'restRoom', prop:'none', activity:'sleep', npc:null },
  shopping: { motion:'motion-walk', location:'marketErrand', prop:'none', activity:null, npc:null }
};
const vacationIllustrations=[
  {id:'vacation-age09-spring-cherry',age:9,season:'봄',name:'봄바람과 벚꽃',image:'../assets/events/vacation/photoreal/age-09/spring-cherry-wind.webp',effect:'petals',description:'봄바람에 머리카락을 넘기며 벚꽃을 맞던 9세의 추억.'},
  {id:'vacation-age09-spring-azalea',season:'봄',name:'진달래 계곡의 디딤돌',image:'../assets/events/vacation/photoreal/age-09/spring-azalea-stepping-stones.webp',effect:'petals',description:'진달래 핀 계곡의 디딤돌을 조심스레 건너던 9세의 추억.'},
  {id:'vacation-age09-spring-kite',season:'봄',name:'강바람과 연날리기',image:'../assets/events/vacation/photoreal/age-09/spring-kite-running.webp',effect:'wind',description:'강바람을 따라 전통 연을 날리며 달리던 9세의 추억.'},
  {id:'vacation-age09-summer-stream',season:'여름',name:'계곡의 물보라',image:'../assets/events/vacation/photoreal/age-09/summer-stream-splash.webp',effect:'splash',description:'시원한 계곡물을 두 손으로 튀기며 웃던 9세의 추억.'},
  {id:'vacation-age09-summer-shell',season:'여름',name:'바닷가의 작은 조개',image:'../assets/events/vacation/photoreal/age-09/summer-seaside-shell.webp',effect:'wave',description:'잔물결 곁에서 작은 조개를 들여다보던 9세의 추억.'},
  {id:'vacation-age09-summer-lotus',season:'여름',name:'연꽃 정자의 한낮',image:'../assets/events/vacation/photoreal/age-09/summer-lotus-pavilion.webp',effect:'wind',description:'연꽃 정자에서 부채를 부치며 수박을 먹던 9세의 추억.'},
  {id:'vacation-age09-autumn-chestnut',season:'가을',name:'가을 밤 줍기',image:'../assets/events/vacation/photoreal/age-09/autumn-chestnut-gathering.webp',effect:'leaves',description:'단풍 아래 잘 익은 밤을 발견한 9세의 추억.'},
  {id:'vacation-age09-autumn-maple',season:'가을',name:'단풍잎을 받던 길',image:'../assets/events/vacation/photoreal/age-09/autumn-maple-path.webp',effect:'leaves',description:'돌담길에서 손바닥에 내려앉은 단풍을 바라보던 9세의 추억.'},
  {id:'vacation-age09-autumn-chuseok',season:'가을',name:'추석의 보름달',image:'../assets/events/vacation/photoreal/age-09/autumn-chuseok-moon.webp',effect:'moon',description:'송편을 곁에 두고 환한 보름달을 올려다보던 9세의 추억.'},
  {id:'vacation-age09-winter-sled',season:'겨울',name:'눈 언덕의 썰매',image:'../assets/events/vacation/photoreal/age-09/winter-sledding.webp',effect:'snow',description:'눈보라를 가르며 전통 썰매를 타던 9세의 추억.'}
  ,{id:'vacation-age09-winter-seollal',season:'겨울',name:'설날 아침의 떡국',image:'../assets/events/vacation/photoreal/age-09/winter-seollal-tteokguk.webp',effect:'steam',description:'따뜻한 떡국 한 숟갈을 기다리던 설날 아침의 추억.'}
  ,{id:'vacation-age09-winter-snowball',season:'겨울',name:'눈사람을 위한 눈덩이',image:'../assets/events/vacation/photoreal/age-09/winter-snowball.webp',effect:'snow',description:'눈사람을 만들기 위해 커다란 눈덩이를 굴리던 9세의 추억.'}
  ,{id:'vacation-age13-spring-cherry',age:13,season:'봄',name:'꽃잎을 받는 오후',image:'../assets/events/vacation/photoreal/age-13/spring-cherry-wind.webp',effect:'petals',description:'흩날리는 벚꽃잎을 손바닥에 받아 보던 13세의 추억.'}
  ,{id:'vacation-age13-spring-azalea',age:13,season:'봄',name:'진달래 계곡의 봄비',image:'../assets/events/vacation/photoreal/age-13/spring-azalea-stepping-stones.webp',effect:'petals',description:'봄비가 갠 계곡에서 진달래를 살며시 만지던 13세의 추억.'}
  ,{id:'vacation-age13-spring-kite',age:13,season:'봄',name:'언덕 위의 연',image:'../assets/events/vacation/photoreal/age-13/spring-kite-running.webp',effect:'wind',description:'높은 봄바람을 따라 언덕에서 연을 날리던 13세의 추억.'}
  ,{id:'vacation-age13-summer-stream',age:13,season:'여름',name:'계곡을 건너는 발걸음',image:'../assets/events/vacation/photoreal/age-13/summer-stream-splash.webp',effect:'splash',description:'맑은 계곡의 바위를 디디며 물보라를 일으킨 13세의 추억.'}
  ,{id:'vacation-age13-summer-shell',age:13,season:'여름',name:'바닷물 속 조개',image:'../assets/events/vacation/photoreal/age-13/summer-seaside-shell.webp',effect:'wave',description:'얕은 바닷물을 걸으며 예쁜 조개를 모은 13세의 추억.'}
  ,{id:'vacation-age13-summer-lotus',age:13,season:'여름',name:'연꽃 정자의 바람',image:'../assets/events/vacation/photoreal/age-13/summer-lotus-pavilion.webp',effect:'wind',description:'연꽃 향이 번지는 정자에서 부채를 펼친 13세의 추억.'}
  ,{id:'vacation-age13-autumn-chestnut',age:13,season:'가을',name:'가을 숲의 밤바구니',image:'../assets/events/vacation/photoreal/age-13/autumn-chestnut-gathering.webp',effect:'leaves',description:'나무 집게로 잘 익은 밤을 바구니에 담은 13세의 추억.'}
  ,{id:'vacation-age13-autumn-maple',age:13,season:'가을',name:'햇빛에 비춘 단풍',image:'../assets/events/vacation/photoreal/age-13/autumn-maple-path.webp',effect:'leaves',description:'붉은 단풍잎을 햇빛에 비추어 바라본 13세의 추억.'}
  ,{id:'vacation-age13-autumn-chuseok',age:13,season:'가을',name:'등불과 추석 달',image:'../assets/events/vacation/photoreal/age-13/autumn-chuseok-moon.webp',effect:'moon',description:'등불과 송편을 들고 추석 보름달을 올려다본 13세의 추억.'}
  ,{id:'vacation-age13-winter-sled',age:13,season:'겨울',name:'얼음 위의 썰매',image:'../assets/events/vacation/photoreal/age-13/winter-sledding.webp',effect:'snow',description:'얼어붙은 마을 연못 위를 씩씩하게 달린 13세의 추억.'}
  ,{id:'vacation-age13-winter-seollal',age:13,season:'겨울',name:'설날 떡국 차림',image:'../assets/events/vacation/photoreal/age-13/winter-seollal-tteokguk.webp',effect:'steam',description:'설날 아침 따뜻한 떡국을 정성껏 담아낸 13세의 추억.'}
  ,{id:'vacation-age13-winter-snowball',age:13,season:'겨울',name:'눈사람의 마지막 눈덩이',image:'../assets/events/vacation/photoreal/age-13/winter-snowball.webp',effect:'snow',description:'웃으며 눈사람의 머리를 올려놓던 13세의 추억.'}
  ,{id:'vacation-age16-spring-cherry',age:16,season:'봄',name:'벚꽃빛 갈래치마',image:'../assets/events/vacation/photoreal/age-16/spring-cherry-wind.webp',effect:'petals',description:'벚꽃바람에 느슨한 땋은 머리와 그라데이션 치마가 함께 흩날린 16세의 추억.'}
  ,{id:'vacation-age16-spring-azalea',age:16,season:'봄',name:'진달래 곁의 봄비',image:'../assets/events/vacation/photoreal/age-16/spring-azalea-stepping-stones.webp',effect:'petals',description:'봄비가 그친 진달래 계곡에서 꽃을 살펴본 16세의 추억.'}
  ,{id:'vacation-age16-spring-kite',age:16,season:'봄',name:'바람을 따라 달리는 연',image:'../assets/events/vacation/photoreal/age-16/spring-kite-running.webp',effect:'wind',description:'강한 봄바람 속에서 연과 땋은 머리를 날리며 달린 16세의 추억.'}
  ,{id:'vacation-age16-summer-stream',age:16,season:'여름',name:'푸른 치마의 물장난',image:'../assets/events/vacation/photoreal/age-16/summer-stream-splash.webp',effect:'splash',description:'맑은 계곡에서 푸른 갈래치마 자락과 함께 물보라를 일으킨 16세의 추억.'}
  ,{id:'vacation-age16-summer-shell',age:16,season:'여름',name:'해질녘 조개바구니',image:'../assets/events/vacation/photoreal/age-16/summer-seaside-shell.webp',effect:'wave',description:'저녁 바닷바람을 맞으며 조개를 바구니에 모은 16세의 추억.'}
  ,{id:'vacation-age16-summer-lotus',age:16,season:'여름',name:'연잎을 든 정자',image:'../assets/events/vacation/photoreal/age-16/summer-lotus-pavilion.webp',effect:'wind',description:'연꽃 향이 번지는 정자에서 연잎을 들어 본 16세의 추억.'}
  ,{id:'vacation-age16-autumn-chestnut',age:16,season:'가을',name:'밤바구니와 황금빛 숲',image:'../assets/events/vacation/photoreal/age-16/autumn-chestnut-gathering.webp',effect:'leaves',description:'황금빛 숲에서 잘 익은 밤을 주워 바구니에 담은 16세의 추억.'}
  ,{id:'vacation-age16-autumn-maple',age:16,season:'가을',name:'단풍 아래의 회전',image:'../assets/events/vacation/photoreal/age-16/autumn-maple-path.webp',effect:'leaves',description:'붉은 단풍 아래에서 풍성한 치마폭을 펼치며 돌아본 16세의 추억.'}
  ,{id:'vacation-age16-autumn-chuseok',age:16,season:'가을',name:'송편과 보름달',image:'../assets/events/vacation/photoreal/age-16/autumn-chuseok-moon.webp',effect:'moon',description:'송편을 들고 추석 보름달을 오래 바라본 16세의 추억.'}
  ,{id:'vacation-age16-winter-sled',age:16,season:'겨울',name:'얼음 위를 가르는 썰매',image:'../assets/events/vacation/photoreal/age-16/winter-sledding.webp',effect:'snow',description:'두툼한 겨울옷과 긴 땋은 머리로 얼음 썰매를 즐긴 16세의 추억.'}
  ,{id:'vacation-age16-winter-seollal',age:16,season:'겨울',name:'새해 첫 떡국',image:'../assets/events/vacation/photoreal/age-16/winter-seollal-tteokguk.webp',effect:'steam',description:'따뜻한 방에서 새해 첫 떡국을 먹은 16세의 추억.'}
  ,{id:'vacation-age16-winter-snowball',age:16,season:'겨울',name:'눈사람을 만드는 오후',image:'../assets/events/vacation/photoreal/age-16/winter-snowball.webp',effect:'snow',description:'양손으로 커다란 눈덩이를 굴려 눈사람을 만든 16세의 추억.'}
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
const modularActivities=new Set(['calligraphy','arithmetic','manners','houseclean','errand','rest','sleep']);
function activityFrameSet(activity){
  if(!modularActivities.has(activity))return activityFrames[activity];
  const name=activity==='sleep'?'rest':activity,age=String(growthAge()).padStart(2,'0');
  return [1,2,3].map(frame=>`../assets/characters/seonhwa/activity-modular/age-${age}/${name}-${frame}.png`);
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
  {id:'age18-ceremony',age:18,ageEnd:18,name:'성년 예복 한복',price:720,tone:'격식',seasons:['가을','겨울'],situations:['manners','shopping'],change:{manners:8,virtue:5,reputation:5,stress:3}},
  {id:'age18-silk',age:18,ageEnd:18,name:'비단 연회 한복',price:780,tone:'화려함',seasons:['봄','겨울'],situations:['shopping','vacation'],change:{charm:10,reputation:4,virtue:-1,stress:3}},
  {id:'age18-simple',age:18,ageEnd:18,name:'담백한 생활 한복',price:560,tone:'활동성',seasons:['여름','가을'],situations:['errand','sweeping','herbs','houseclean','rest'],change:{craft:5,health:4,virtue:3,charm:-2}},
  {id:'age18-premium-paradise',age:18,ageEnd:18,name:'소문의 낙원 한복',price:1200,tone:'화려함',seasons:['봄','겨울'],situations:['manners','shopping','vacation'],change:{charm:14,reputation:8,virtue:2,manners:4,stress:4}},
  {id:'age18-ethnic-stage-v3',age:9,ageEnd:18,assetAge:18,name:'월백 무대 의상',price:0,cashPrice:5000,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['shopping','vacation'],change:{charm:20,reputation:14,arts:9,virtue:-2,stress:3}},
  {id:'age18-cash-ember-ethnic',age:9,ageEnd:18,assetAge:18,name:'홍염 자수 무대복',price:0,cashPrice:5500,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['shopping','vacation'],change:{charm:21,reputation:13,arts:10,virtue:-2}},
  {id:'age18-cash-solar-ceremony',age:9,ageEnd:18,assetAge:18,name:'태양 백금 예복',price:0,cashPrice:6000,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['shopping','vacation'],change:{charm:18,reputation:18,manners:9,arts:6}},
  {id:'age18-cash-ink-scholar',age:9,ageEnd:18,assetAge:18,name:'묵학 비상 예복',price:0,cashPrice:6500,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['reading','shopping','vacation'],change:{study:12,arts:12,reputation:12,charm:10}},
  {id:'age18-cash-starlight-pink',age:9,ageEnd:18,assetAge:18,name:'별빛 유리 무대복',price:0,cashPrice:7000,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['shopping','vacation'],change:{charm:24,reputation:16,arts:13,stress:-2}},
  {id:'age18-cash-rose-paisley',age:9,ageEnd:18,assetAge:18,name:'장미 페이즐리 무대복',price:0,cashPrice:7500,tone:'캐시',category:'cash',forSale:true,seasons:['봄','여름','가을','겨울'],situations:['shopping','vacation'],change:{charm:23,reputation:15,arts:12,virtue:-3}},
  {id:'premium-midnight-lotus',age:9,ageEnd:18,name:'묵빛 연화 예복',price:1650,tone:'고급',seasons:['가을','겨울'],situations:['manners','shopping','vacation'],change:{charm:15,reputation:10,manners:7,virtue:4}},
  {id:'premium-moonlight-guard',age:9,ageEnd:18,name:'월백 수호 예복',price:1780,tone:'고급',seasons:['봄','겨울'],situations:['manners','reading','shopping'],change:{manners:12,reputation:9,study:5,charm:8}},
  {id:'premium-aurora-blossom',age:9,ageEnd:18,name:'새벽꽃 비단 예복',price:1850,tone:'고급',seasons:['봄','여름'],situations:['vacation','shopping','manners'],change:{charm:18,reputation:10,arts:7,virtue:2}},
  {id:'premium-crimson-festival',age:9,ageEnd:18,name:'자주빛 연회 예복',price:1720,tone:'고급',seasons:['가을','겨울'],situations:['shopping','vacation','manners'],change:{charm:16,reputation:11,manners:6,stress:2}},
  {id:'premium-ink-scholar',age:9,ageEnd:18,name:'먹빛 서생 예복',price:1600,tone:'고급',seasons:['가을','겨울'],situations:['reading','arithmetic','manners'],change:{study:10,arts:8,reputation:7,charm:6}}
];
foods.forEach(item=>{item.change=canonicalizeChange(item.change);});
outfits.forEach(item=>{item.change=canonicalizeChange(item.change);});
const outfitAgeLabel=outfit=>outfit.age===outfit.ageEnd?`${outfit.age}세`:`${outfit.age}–${outfit.ageEnd}세`;
const outfitAvailable=outfit=>game.age>=outfit.age&&game.age<=outfit.ageEnd;
const outfitAssetAge=outfit=>outfit.category==='cash'?growthAge():outfit.assetAge||outfit.age;
const growthAge=()=>game.age>=18?18:game.age>=16?16:game.age>=13?13:9;
const correctedAdultOutfits=new Set(['age13-scholar','age13-festival','age13-work','age16-court','age16-art','age16-travel','age18-premium-paradise']);
const outfitImage=id=>{
  const outfit=outfits.find(item=>item.id===id);
  if(outfit?.category==='cash')return `../assets/characters/seonhwa/wardrobe/age-${String(growthAge()).padStart(2,'0')}/${id}.png`;
  if(outfit?.assetAge)return `../assets/characters/seonhwa/wardrobe/age-${String(outfit.assetAge).padStart(2,'0')}/${id}.png`;
  const age=growthAge();
  const suffix=age===18&&correctedAdultOutfits.has(id)?'-v2':'';
  return `../assets/characters/seonhwa/wardrobe/age-${String(age).padStart(2,'0')}/${id}${suffix}.png`;
};
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
function activityOutfitPalette(outfitId){
  if(!outfitId)return null;
  if(/premium-midnight|premium-crimson|premium-ink/.test(outfitId))return {skirt:[35,31,38],top:[111,40,57]};
  if(/premium-moonlight/.test(outfitId))return {skirt:[239,228,199],top:[205,164,72]};
  if(/premium-aurora/.test(outfitId))return {skirt:[226,170,194],top:[244,222,227]};
  if(/active|work|travel|simple/.test(outfitId))return {skirt:[54,126,125],top:[220,172,74]};
  if(/flower|festival|art|silk/.test(outfitId))return {skirt:[211,96,120],top:[236,190,195]};
  if(/court|ceremony/.test(outfitId))return {skirt:[59,79,126],top:[218,187,112]};
  return {skirt:[143,171,145],top:null};
}
function outfitActivityFrame(src,outfitId){
  const palette=activityOutfitPalette(outfitId);if(!palette)return Promise.resolve(src);
  const key=`${outfitId}|${src}`;if(activityOutfitFrameCache.has(key))return Promise.resolve(activityOutfitFrameCache.get(key));
  return new Promise(resolve=>{const source=new Image(),garment=new Image();let sourceReady=false,garmentReady=false,garmentFailed=false;const render=()=>{if(!sourceReady||(!garmentReady&&!garmentFailed))return;try{const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(source,0,0);const frame=context.getImageData(0,0,canvas.width,canvas.height),data=frame.data;
    const texture=document.createElement('canvas');texture.width=canvas.width;texture.height=canvas.height;const textureContext=texture.getContext('2d',{willReadFrequently:true});
    if(garmentReady){const gw=garment.naturalWidth,gh=garment.naturalHeight;textureContext.drawImage(garment,gw*.22,gh*.30,gw*.56,gh*.48,0,0,canvas.width,canvas.height);}
    const textureData=garmentReady?textureContext.getImageData(0,0,canvas.width,canvas.height).data:null,isRest=/\/(rest|sleep)-/.test(src);
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4;if(data[i+3]<24)continue;const r=data[i],g=data[i+1],b=data[i+2];
      const pink=!isRest&&r>155&&g>42&&g<155&&b>52&&b<180&&r>g*1.32&&r>b*1.12;
      const central=x>canvas.width*.16&&x<canvas.width*.84&&y>canvas.height*.2&&y<canvas.height*.76;
      const ivory=central&&r>188&&g>165&&b>130&&r-b<62&&r-g<45;
      const fallback=pink?palette.skirt:(ivory&&palette.top?palette.top:null);if(!fallback)continue;
      const textured=textureData&&textureData[i+3]>80?[textureData[i],textureData[i+1],textureData[i+2]]:fallback;
      const light=Math.max(.58,Math.min(1.35,(r+g+b)/3/170));data[i]=Math.min(255,textured[0]*light);data[i+1]=Math.min(255,textured[1]*light);data[i+2]=Math.min(255,textured[2]*light);
    }
    context.putImageData(frame,0,0);const result=canvas.toDataURL('image/png');activityOutfitFrameCache.set(key,result);resolve(result);}catch{resolve(src);}};source.onload=()=>{sourceReady=true;render();};source.onerror=()=>resolve(src);garment.onload=()=>{garmentReady=true;render();};garment.onerror=()=>{garmentFailed=true;render();};source.src=src;garment.src=outfitImage(outfitId);});
}
async function animateActivitySprite(image,motion,activity,npcImage,npc,outfitId){
  if(activity){
    const frames=activityFrameSet(activity);
    const sequence=activity==='errand'?[0,1,1,2,2,1,0]:activity==='houseclean'?[0,1,2,1,0,1]:activity==='sleep'?[0,1,2,1,0]:[0,1,2,1,0,1,2];
    const delay=activity==='errand'?270:activity==='houseclean'?360:activity==='sleep'?430:190;
    for(const frame of sequence){image.src=await outfitActivityFrame(frames[frame],outfitId);if(npc)npcImage.src=(npc==='teacher'?npcFrames.teacherReading:npcFrames[npc])[frame%3];await new Promise(resolve=>setTimeout(resolve,delay));}
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
const activitySkill={reading:'intelligence',arithmetic:'sense',manners:'manners',errand:'speech',sweeping:'strength',herbs:'sense',houseclean:'sense',rest:'mentality'};
const outcomeLabels={perfect:'완벽',success:'성공',struggle:'힘겨움',mistake:'실수'};
function activityOutcomeThresholds(action,stress){
  const skill=game[activitySkill[action.id]]||0;
  const healthRatio=clampStat('health',game.health)/statMaximum('health');
  const healthBonus=healthRatio*24;
  const condition=(game.mentality||50)*.07-stress*.42;
  const success=Math.max(18,Math.min(94,44+skill*.09+condition+healthBonus));
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
  errand:{perfect:['부탁받은 물건을 빠짐없이 사 왔어요.'],normal:['사람이 많아서 장바구니를 꼭 잡았어요.','진열대를 살펴보며 좋은 물건을 골랐어요.']},
  sweeping:{perfect:['마당에 티끌 하나 남지 않았어요.'],normal:['마당을 쓸고 나니 마음도 개운해요.']},
  herbs:{perfect:['좋은 약초만 골라 바구니를 채웠어요.'],normal:['뿌리가 다치지 않도록 조심히 뽑았어요.']},
  houseclean:{perfect:['방 안이 반짝반짝해졌어요.'],normal:['가구 밑까지 깨끗하게 닦았어요.']},
  rest:{perfect:['푹 쉬었더니 몸이 가벼워졌어요.'],normal:['조용히 쉬면서 기운을 되찾았어요.']},
  vacation:{perfect:['아름다운 풍경을 오래 기억하고 싶어요.'],normal:['새로운 곳에 오니 마음이 편안해졌어요.']}
};
function pickLine(lines,index){return lines[index%lines.length];}
function objectParticle(word){const last=word.charCodeAt(word.length-1);return last>=0xAC00&&last<=0xD7A3&&(last-0xAC00)%28?'을':'를';}
function setScheduleDialogue(action,state,index){
  const education=['reading','arithmetic','manners'].includes(action.id);
  let speaker=game.characterName||'아이',line='오늘도 차근차근 해볼게요.';
  if(state==='start'){
    if(game.stress>=55)line='오늘은 컨디션이 좋지 않아요.';
    else line=`오늘은 ${action.name}${objectParticle(action.name)} 열심히 해볼게요.`;
  }else if(state==='drowsy'){
    speaker=education?'훈장님':(game.nannyName||'유모');
    line=education?'수업 중에 졸면 배운 것을 놓치게 된다. 정신을 차리거라.':'많이 피곤해 보이는구나. 잠시 숨을 고르렴.';
  }else if(state==='mistake'){
    speaker=education?'훈장님':(game.nannyName||'유모');
    line=education?'졸다가 실수하다니, 오늘 배운 대목을 다시 익히거라.':'괜찮단다. 서두르지 말고 다시 해 보자.';
  }else if(state==='struggle'){
    line=game.stress>=55?'마음이 무거워 평소만큼 해내지는 못했어요.':'조금 어려웠지만 끝까지 포기하지 않았어요.';
  }else{
    line=pickLine(scheduleDialogue[action.id]?.[state==='perfect'?'perfect':'normal']||['오늘 일정을 무사히 마쳤어요.'],index);
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
  { id: 'reading', category: '교육', name: '글읽기', cost: 80, summary: '지능 +5 · 정신력 +1 · 스트레스 +3', change: { intelligence:5, mentality:1, stress:3 } },
  { id: 'arithmetic', category: '교육', name: '셈하기', cost: 70, summary: '지능 +4 · 센스 +2 · 스트레스 +2', change: { intelligence:4, sense:2, stress:2 } },
  { id: 'manners', category: '교육', name: '예절 배우기', cost: 90, summary: '예절 +5 · 기품 +2 · 스트레스 +2', change: { manners:5, dignity:2, stress:2 } },
  { id: 'errand', category: '아르바이트', name: '장터 심부름', cost: -90, summary: '민첩 +3 · 화술 +2 · 스트레스 +4 · 90냥 획득', change: { agility:3, speech:2, stress:4 } },
  { id: 'sweeping', category: '아르바이트', name: '마당 쓸기', cost: -70, summary: '힘 +3 · 체력 +2 · 스트레스 +3 · 70냥 획득', change: { strength:3, health:2, stress:3 } },
  { id: 'herbs', category: '아르바이트', name: '약초 줍기', cost: -80, summary: '센스 +2 · 지능 +1 · 체력 +1 · 스트레스 +4 · 80냥 획득', change: { sense:2, intelligence:1, health:1, stress:4 } },
  { id: 'houseclean', category: '아르바이트', name: '집 청소', cost: -60, summary: '힘 +2 · 센스 +2 · 체력 +1 · 스트레스 +3 · 60냥 획득', change: { strength:2, sense:2, health:1, stress:3 } },
  { id: 'rest', category: '휴식', name: '집에서 휴식', cost: 0, summary: '스트레스 -12 · 체력 +2 · 정신력 +2', change: { health:2, mentality:2, stress:-12 } },
  { id: 'shopping', category: '휴식', name: '저잣거리', cost: 0, summary: '', change: {}, special:'market' },
  { id: 'vacation', category: '휴식', name: '바캉스', cost: 180, summary: '감수성 +3 · 매력 +1 · 스트레스 -25 · 추억 일러스트 획득', change: {sensitivity:3,charm:1,stress:-25}, special:'vacation' }
];
function actionForStressLimit(action,stress){
  return stress>=statMaximum('stress')&&action.id!=='rest'?actions.find(item=>item.id==='rest'):action;
}

function awardVacationIllustration(){
  normalizeInventory();
  const owned=new Set(game.items.filter(item=>item.type==='event').map(item=>item.id));
  const currentAge=growthAge();
  const seasonal=vacationIllustrations.filter(item=>(item.age||9)===currentAge&&item.season===game.season);
  const fallback=vacationIllustrations.filter(item=>(item.age||9)===9&&item.season===game.season);
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
async function playVacationScene(prize,index){
  const phone=document.querySelector('.phone'),scene=document.querySelector('#vacationScene'),image=document.querySelector('#vacationImage');
  const person=document.querySelector('#encounterCharacter'),talk=document.querySelector('#encounterDialogue');
  playVacationMusic();image.src=prize.image;document.querySelector('#vacationTitle').textContent=prize.name;scene.dataset.effect=prize.effect||'';
  scene.classList.remove('has-encounter');person.hidden=true;talk.hidden=true;phone.classList.add('vacation-playing');scene.hidden=false;
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
  talk.hidden=true;person.hidden=true;scene.classList.remove('has-encounter');scene.hidden=true;scene.dataset.effect='';phone.classList.remove('vacation-playing');playHomeMusic();
  return relation;
}

function updateImageState() {
  const characterReady = character.complete && character.naturalWidth > 0;
  character.hidden = !characterReady;
  missing.hidden = characterReady;
}

function renderHud() {
  normalizeStats();
  const date = game.currentDate ? new Date(`${game.currentDate}T00:00:00`) : null;
  document.querySelector('#dateLabel').textContent = date ? `${game.age}세 · ${game.season} ${game.week}주` : '생일 설정 전';
  document.querySelector('#moneyLabel').textContent = `${game.money.toLocaleString()}냥`;
  document.querySelector('#cashLabel').textContent = `캐시 ${game.cash.toLocaleString()}원`;
  document.querySelector('#speakerName').textContent = game.nannyName || '유모';
}

const statLabels={health:'체력',strength:'힘',agility:'민첩',intelligence:'지능',magic:'마력',mentality:'정신력',dignity:'기품',manners:'예절',speech:'화술',sensitivity:'감수성',sense:'센스',charm:'매력',stress:'스트레스'};
statLabels.nannyAffinity='유모 친밀도';
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
    const max=statMaximum(key),current=clampStat(key,game[key]),next=clampStat(key,current+value);
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
  document.querySelector('#homeGreetingPrompt').textContent=`${game.nannyName||'유모'}에게 어떻게 답할까요?`;
  const choices=document.querySelector('#homeGreetingChoices');choices.innerHTML=scene.choices.map((choice,i)=>`<button data-greeting-choice="${i}">${choice[0]}</button>`).join('');
  document.querySelector('#homeGreeting').hidden=false;document.querySelector('.phone').classList.add('greeting-active');
  choices.querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>answerHomeGreeting(scene,Number(button.dataset.greetingChoice))));
  return true;
}
function answerHomeGreeting(scene,index){
  const [,change,result]=scene.choices[index];Object.entries(canonicalizeChange(change)).forEach(([key,value])=>game[key]=clampStat(key,(game[key]||0)+value));
  document.querySelector('#homeGreeting').hidden=true;document.querySelector('.phone').classList.remove('greeting-active');document.querySelector('#speakerName').textContent=game.characterName||'아이';document.querySelector('#dialogueText').textContent=result;showLiveChanges({change,cost:0});renderHud();
}

function openPanel(type) {
  panel.hidden = false;
  if (type === 'schedule') {
    playHomeMusic();
    renderSchedulePanel();
  } else if (type === 'status') {
    playHomeMusic();
    panelTitle.textContent = `${game.characterName || '아이'}의 상태`;
    normalizeBodyMetrics();
    normalizeRelations();
    const relationCards=endingRelationCandidates.map(candidate=>{const relation=game.relations[candidate.id];const phase=relation.dateUnlocked?'데이트 가능':relation.meetings>=5?'16세부터 데이트 가능':`${relation.meetings} / 5회 만남`;return `<div class="relation-card ${relation.dateUnlocked?'unlocked':''}"><b>${candidate.name}</b><small>${candidate.role}</small><span>${phase}</span><i style="--relation-progress:${Math.min(100,relation.meetings/5*100)}%"></i></div>`;}).join('');
    panelBody.innerHTML = `<div class="status-summary"><span>${game.age}세 · ${game.season} ${game.week}주</span><b>${game.money.toLocaleString()}냥</b></div><section class="body-profile" aria-label="성장 정보"><div><small>키</small><b>${game.height.toFixed(1)} cm</b></div><div><small>몸무게</small><b>${game.weight.toFixed(1)} kg</b></div></section>${statGroups.map(group => `<section class="stat-group"><h3>${group.title}</h3>${group.stats.map(([key,label]) => statBar(key,label)).join('')}</section>`).join('')}<section class="stat-group condition-group"><h3>현재 상태</h3>${statBar('stress','스트레스')}</section><section class="relation-group"><h3>인연</h3><p>13세부터 우정으로 만나며, 5회 만남과 16세 이상을 충족하면 데이트가 열립니다.</p><div class="relation-grid">${relationCards}</div></section>`;
  } else if (type === 'inventory') {
    playHomeMusic();
    renderInventory();
  } else if (type === 'collection') {
    playHomeMusic();
    renderVacationCollection();
  } else {
    playHomeMusic();
    renderSavePanel();
  }
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
  const filtered=game.items.filter(item=>!collectionCardIds.has(item.id)&&(category==='all'||item.type===category)).slice(0,180);
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
function renderVacationCollection(){
  normalizeInventory();panelTitle.textContent='바캉스 수집도감';
  const ownedIds=new Set(game.items.filter(item=>item.type==='event').map(item=>item.id));
  const collected=vacationIllustrations.filter(item=>ownedIds.has(item.id)).length,total=vacationIllustrations.length;
  const percent=Math.round(collected/total*100);
  const cards=vacationIllustrations.map(item=>{const unlocked=ownedIds.has(item.id),age=item.age||9;return `<button class="collection-card ${unlocked?'unlocked':'locked'}" data-collection-id="${item.id}" ${unlocked?'':'disabled'} aria-label="${unlocked?`${age}세 ${item.season} 수집 완료`:`${age}세 ${item.season} 미수집`}"><div class="collection-art"><img src="${item.image}" alt="${unlocked?item.name:''}"><span>${unlocked?'수집 완료':'?'}</span></div><b>${age}세 · ${item.season}</b><small>${unlocked?item.name:'아직 발견하지 못한 추억'}</small></button>`;}).join('');
  panelBody.innerHTML=`<section class="collection-progress" aria-label="바캉스 일러스트 수집률"><div><b>수집도 ${percent}%</b><span>${collected} / ${total}</span></div><div class="collection-track"><i style="width:${percent}%"></i></div></section><div class="collection-grid">${cards}</div><section class="collection-detail" id="collectionDetail">수집한 카드를 누르면 크게 볼 수 있어요.</section>`;
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
function mostRecentExistingSave(){
  return [readAutoSave(),...SAVE_SLOTS.map(slot=>readSave(slot))]
    .filter(isPlayableSave)
    .sort((a,b)=>new Date(b.savedAt||0)-new Date(a.savedAt||0))[0]||null;
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
  if(!saved.game.profileSlot){
    const matchingSlot=SAVE_SLOTS.find(slot=>{const record=readSave(slot);return record?.game?.characterName===saved.game.characterName&&record?.game?.nannyName===saved.game.nannyName&&record?.game?.birthday===saved.game.birthday;});
    saved.game.profileSlot=matchingSlot||SAVE_SLOTS.find(slot=>!readSave(slot))||null;
  }
  Object.assign(game, saved.game);
  if(!Number.isFinite(game.cash))game.cash=50000;
  normalizeStats();
  normalizeRelations();
  normalizeBodyMetrics();
  if(typeof game.autoOutfit!=='boolean')game.autoOutfit=true;
  normalizeInventory();
  document.querySelector('#birthdaySetup').hidden = Boolean(game.birthday);
  if (!Array.isArray(game.dailySchedule) || game.dailySchedule.length !== 7) game.dailySchedule = [null,null,null,null,null,null,null];
  if(!game.monthlyLedger&&game.currentDate){const date=new Date(`${game.currentDate}T00:00:00`);game.monthlyLedger=createMonthlyLedger(date.getFullYear(),date.getMonth()+1);}
  bg.src = backgrounds.home;
  applyEquippedOutfit();
  renderHud();
  setTimeout(()=>showHomeGreeting(),350);
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
  Object.assign(game, { characterName:'',nannyName:'',profileSlot:null,age:9,height:130,weight:28.5,month:1,week:1,season:'봄',money:50000,cash:50000,health:42,strength:18,agility:20,intelligence:35,magic:8,mentality:30,dignity:36,manners:28,speech:14,sensitivity:40,sense:24,charm:30,stress:12,items:[],relations:{},equippedOutfit:null,autoOutfit:true,dailySchedule:[null,null,null,null,null,null,null],birthday:null,currentDate:null,endingDate:null,ended:false,birthdayCount:0,element:null,birthSeason:null,memory:0,truth:0,exposure:0,guardianTrust:50,nannyAffinity:50,lastGreetingDate:null,monthlyLedger:null});
  document.querySelector('#liveChanges').innerHTML='';
  const greeting=document.querySelector('#homeGreeting');greeting.hidden=true;greeting.classList.remove('greeting-active');
  document.querySelector('#characterNameInput').value='';
  document.querySelector('#nannyNameInput').value='';
  document.querySelector('#birthdayInput').value='1990-01-01';
  document.querySelector('#birthdayTitle').textContent='아이와 유모의 이름';
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
  const soundButton=document.querySelector('#prologueSound');
  if(soundButton){soundButton.textContent='소리 끄기';soundButton.setAttribute('aria-pressed','true');}
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

function renderSchedulePanel() {
  panelTitle.textContent = `${game.season} ${game.week}주 일정`;
  if (!Array.isArray(game.dailySchedule) || game.dailySchedule.length !== 7) game.dailySchedule = [null,null,null,null,null,null,null];
  game.dailySchedule=game.dailySchedule.map(id=>actions.some(action=>action.id===id)?id:null);
  const dayNames = ['월','화','수','목','금','토','일'];
  const daySlots = game.dailySchedule.map((id,index) => {
    const action = actions.find(item => item.id === id);
    return `<button class="day-slot ${action ? 'filled' : ''}" data-day="${index}" aria-label="${dayNames[index]}요일 ${action ? action.name : '비어 있음'}"><b>${dayNames[index]}</b><span>${action ? action.name : '빈칸'}</span></button>`;
  }).join('');
  const categories = ['교육', '아르바이트', '휴식'].map(category => `<section class="schedule-category"><h3>${category}</h3><div class="action-grid">${actions.filter(action => action.category === category).map(action => `<button class="action" data-action="${action.id}"><img src="../assets/ui/activity-icons/activity-${action.id}.png" alt=""><b>${action.name}</b><span>${action.cost > 0 ? `-${action.cost}냥` : action.cost < 0 ? `+${-action.cost}냥` : '무료'}</span><small>${action.summary}</small></button>`).join('')}</div></section>`).join('');
  panelBody.innerHTML = `<p class="schedule-help">활동을 누르면 월요일부터 다음 빈 날짜에 들어갑니다. 채운 날짜를 누르면 삭제됩니다.</p><div class="day-grid">${daySlots}</div>${categories}`;
  panelBody.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => addDailyAction(button.dataset.action)));
  panelBody.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => clearDailyAction(Number(button.dataset.day))));
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
  const outfitCards=visibleOutfits.map(outfit=>{const premium=isPremiumOutfit(outfit),cash=isCashOutfit(outfit),insufficient=cash?game.cash<outfit.cashPrice:game.money<outfit.price,locked=!outfitAvailable(outfit)||owned.has(outfit.id)||insufficient;return `<button class="shop-card outfit-card visual-card ${outfitAvailable(outfit)?'available':''} ${premium?'premium':''} ${cash?'cash':''} ${locked?'locked':''}" data-outfit-preview="${outfit.id}" aria-label="${outfit.name} 미리보기"><img src="../assets/characters/seonhwa/wardrobe/age-${String(outfitAssetAge(outfit)).padStart(2,'0')}/${outfit.id}.png" alt="${outfit.name}"><b>${outfit.name}</b><span>${cash?`${outfit.cashPrice.toLocaleString()}원`:`${outfit.price}냥`}</span><small>${cash?'캐시 의상 · ':premium?'고급 의상 · ':''}${outfitAgeLabel(outfit)} · ${outfit.seasons.join('·')}<br>${formatChanges(outfit.change)}${owned.has(outfit.id)?'<br>보유 중':''}</small></button>`;}).join('');
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
  const previewAge=cash?growthAge():outfitAssetAge(outfit);
  const agePreview=cash?`<div class="cash-age-preview" role="group" aria-label="연령별 의상 미리보기"><span>연령별 모습</span><div>${[9,13,16,18].map(age=>`<button type="button" data-cash-preview-age="${age}" class="${age===previewAge?'on':''}" aria-pressed="${age===previewAge}">${age}세</button>`).join('')}</div></div>`:'';
  const reason=owned?'이미 구매한 의상입니다.':ageLocked?`${outfitAgeLabel(outfit)}에 구매할 수 있습니다.`:insufficient?`보유 ${cash?'캐시':'은전'}가 부족합니다.`:cash?'테스트 캐시로 구매할 수 있습니다.':'미리 입어본 뒤 구매할 수 있습니다.';
  const grade=cash?'캐시 의상':isPremiumOutfit(outfit)?'고급 의상':'일반 의상';
  panelBody.insertAdjacentHTML('beforeend',`<div class="outfit-preview-backdrop" id="outfitPreview"><section class="outfit-preview-card ${cash?'cash-preview':''}" role="dialog" aria-modal="true" aria-label="${outfit.name} 미리보기"><button class="outfit-preview-close" id="outfitPreviewClose" aria-label="미리보기 닫기">×</button><div class="outfit-preview-image"><img id="outfitPreviewImage" src="../assets/characters/seonhwa/wardrobe/age-${String(previewAge).padStart(2,'0')}/${outfit.id}.png" alt="${previewAge}세 ${outfit.name} 전신 미리보기"></div><div class="outfit-preview-info"><small>${grade}</small><h3>${outfit.name}</h3><p>${outfitAgeLabel(outfit)} · ${outfit.seasons.join('·')}<br>${formatChanges(outfit.change)}</p>${agePreview}<b>${cash?`${outfit.cashPrice.toLocaleString()}원`:`${outfit.price.toLocaleString()}냥`}</b><em>${reason}</em><button id="outfitPreviewBuy" ${owned||ageLocked||insufficient?'disabled':''}>${owned?'구매 완료':cash?'테스트 캐시로 구매하기':'이 의상 구매하기'}</button></div></section></div>`);
  document.querySelector('#outfitPreviewClose').addEventListener('click',()=>document.querySelector('#outfitPreview')?.remove());
  document.querySelector('#outfitPreview').addEventListener('click',event=>{if(event.target.id==='outfitPreview')event.currentTarget.remove();});
  document.querySelectorAll('[data-cash-preview-age]').forEach(button=>button.addEventListener('click',()=>{
    const age=Number(button.dataset.cashPreviewAge),image=document.querySelector('#outfitPreviewImage');image.src=`../assets/characters/seonhwa/wardrobe/age-${String(age).padStart(2,'0')}/${outfit.id}.png`;image.alt=`${age}세 ${outfit.name} 전신 미리보기`;
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
  const empty = game.dailySchedule.indexOf(null);
  if (empty === -1) {
    document.querySelector('#dialogueText').textContent = '7일 일정이 모두 찼어요. 요일 칸을 눌러 수정하세요.';
    return;
  }
  game.dailySchedule[empty] = id;
  document.querySelector('#dialogueText').textContent = `${['월','화','수','목','금','토','일'][empty]}요일에 ${actions.find(action => action.id === id).name}을 넣었어요.`;
  scheduleConfirmDismissed = false;
  renderSchedulePanel();
  if (game.dailySchedule.every(Boolean)) showScheduleConfirmation();
  queueAutoSave();
}

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
  document.querySelector('#closeMonthlyReport').addEventListener('click',()=>{panel.hidden=true;document.querySelector('#dialogueText').textContent=`${game.month}월도 함께 힘내 보아요.`;});
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
  advanceGameDate(selected.length);
  const completedLedger=completedLedgers[0]||null;
  const counts = selected.reduce((map, action) => (map[action.name]=(map[action.name]||0)+1,map),{});
  const summary = Object.entries(counts).map(([name,count]) => count > 1 ? `${name} ${count}일` : name).join(' · ');
  document.querySelector('#dialogueText').textContent = game.ended?`마지막 ${selected.length}일 일정(${summary})을 마쳤어요.`:`${completedWeek}주 일정(${summary})을 마쳤어요.`;
  game.dailySchedule = [null,null,null,null,null,null,null];
  bg.src = backgrounds.home;
  playHomeMusic();
  applyEquippedOutfit();
  renderHud();
  panel.hidden = true;
  if (game.ended) showEnding();
  else if(completedLedger)showMonthlyReport(completedLedger);
  queueAutoSave();
}

function isoDate(date){ const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
function addYears(date, years){ const next=new Date(date); next.setFullYear(next.getFullYear()+years); return next; }
function startWithBirthday(){
  const value=document.querySelector('#birthdayInput').value;
  const characterName=document.querySelector('#characterNameInput').value.trim();
  const nannyName=document.querySelector('#nannyNameInput').value.trim();
  if(!characterName||!nannyName){document.querySelector('#birthdayTitle').textContent='두 이름을 모두 지어주세요';return;}
  if(value<'1990-01-01'||value>'1990-12-31') return;
  const profileSlot=game.profileSlot||SAVE_SLOTS.find(slot=>!readSave(slot));
  if(!profileSlot){document.querySelector('#birthdayTitle').textContent='동시에 키울 수 있는 다섯 명의 기록이 모두 찼어요';return;}
  const birth=new Date(`${value}T00:00:00`);
  const start=addYears(birth,9);
  const ending=addYears(birth,18); ending.setDate(ending.getDate()+1);
  const month=birth.getMonth()+1; const birthSeason=seasonForMonth(month); const element=['금','수','목','화','토'][(birth.getMonth()+birth.getDate())%5];
  Object.assign(game,{characterName,nannyName,profileSlot,birthday:value,currentDate:isoDate(start),endingDate:isoDate(ending),age:9,height:130,weight:28.5,month,season:birthSeason,birthSeason,element,week:1,ended:false,birthdayCount:1});
  game.monthlyLedger=createMonthlyLedger(start.getFullYear(),month);
  document.querySelector('#birthdaySetup').hidden=true;
  panel.hidden=true;
  transitionPrologueToHomeMusic();
  document.querySelector('#dialogueText').textContent=`${birthSeason}에 태어난 ${element} 기운의 아이. ${characterName}의 아홉 번째 생일부터 이야기를 시작해요.`;
  renderHud();
  queueAutoSave();
  setTimeout(()=>showHomeGreeting(),250);
}
function advanceGameDate(days){
  if(!game.currentDate)return;
  const previousAge=game.age;
  const date=new Date(`${game.currentDate}T00:00:00`); date.setDate(date.getDate()+days);
  const ending=new Date(`${game.endingDate}T00:00:00`);
  if(date>=ending){ date.setTime(ending.getTime()); game.ended=true; }
  game.currentDate=isoDate(date); game.month=date.getMonth()+1; game.season=seasonForMonth(game.month); game.week=Math.floor((date.getDate()-1)/7)+1;
  const birth=new Date(`${game.birthday}T00:00:00`); game.age=date.getFullYear()-birth.getFullYear()-((date.getMonth()<birth.getMonth()||(date.getMonth()===birth.getMonth()&&date.getDate()<birth.getDate()))?1:0);
  applyAgeGrowth(previousAge,game.age);
  if(game.autoOutfit)updateAutoOutfit();
}
function seasonForMonth(month){ return month>=3&&month<=5?'봄':month>=6&&month<=8?'여름':month>=9&&month<=11?'가을':'겨울'; }
function showEnding(){
  panel.hidden=false; panelTitle.textContent=`${game.characterName || '아이'}의 성장 기록`;
  panelBody.innerHTML=`<div class="ending-card"><h2>마지막 생일 다음 날</h2><p>${game.age}세 · ${game.season}</p><p>아홉 살 생일부터 이어진 ${game.characterName || '아이'}의 성장 이야기가 완성되었습니다.</p><button id="endingRestart">새로운 생일로 시작</button></div>`;
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
  wrap.hidden=false;wrap.classList.toggle('outdoor-rain',Boolean(scene.rain));clearTimeout(prologueTimer);updatePrologueAudio(Boolean(scene.rain));
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
  let last=0;for(let i=0;i<data.length;i++){const white=Math.random()*2-1;last=last*.985+white*.15;data[i]=last*(.35+Math.random()*.3);}
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='highpass';filter.frequency.value=650;gain.gain.value=0;source.connect(filter).connect(gain).connect(ctx.destination);source.start();rainAudio={ctx,source,gain};return rainAudio;
}
function fadeAudio(audio,target,ms){if(!audio)return;const start=audio.volume,steps=12;let n=0;clearInterval(audio._fade);audio._fade=setInterval(()=>{n++;audio.volume=start+(target-start)*(n/steps);if(n>=steps){clearInterval(audio._fade);if(target===0)audio.pause();}},ms/steps);}
function stopRain(){if(!rainAudio)return;rainAudio.gain.gain.cancelScheduledValues(rainAudio.ctx.currentTime);rainAudio.gain.gain.linearRampToValueAtTime(0,rainAudio.ctx.currentTime+.5);}
function updatePrologueAudio(isRain){
  if(!prologueSoundOn)return;
  const music=document.querySelector('#prologueMusic');music.volume=scaledVolume(.42,'bgm');
  if(userSettings.bgmEnabled&&music.paused)music.play().catch(()=>{});else if(!userSettings.bgmEnabled)music.pause();
  if(!userSettings.sfxEnabled){stopRain();return;}
  const rain=ensureRainAudio();rain.ctx.resume();rain.gain.gain.cancelScheduledValues(rain.ctx.currentTime);rain.gain.gain.linearRampToValueAtTime(isRain?scaledVolume(.34,'sfx'):0,rain.ctx.currentTime+.65);
}
function togglePrologueSound(){prologueSoundOn=!prologueSoundOn;const button=document.querySelector('#prologueSound');button.textContent=prologueSoundOn?'소리 끄기':'소리 켜기';button.setAttribute('aria-pressed',String(prologueSoundOn));if(prologueSoundOn)updatePrologueAudio(Boolean(prologueScenes[prologueIndex].rain));else{fadeAudio(document.querySelector('#prologueMusic'),0,400);stopRain();}}
function applyAudioSettings(){
  const base=Number(gameMusic.dataset.baseVolume||.22);gameMusic.volume=scaledVolume(base,'bgm');
  if(!userSettings.bgmEnabled)gameMusic.pause();else if(gameMusic.src)gameMusic.play().catch(()=>{});
  const music=document.querySelector('#prologueMusic');music.volume=scaledVolume(.42,'bgm');if(!userSettings.bgmEnabled)music.pause();
  if(!userSettings.sfxEnabled)stopRain();else if(!document.querySelector('#prologue').hidden)updatePrologueAudio(Boolean(prologueScenes[prologueIndex]?.rain));
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
function openSettings(){syncSettingsUi();document.querySelector('#settingsModal').hidden=false;document.querySelector('#settingsClose').focus();}
function closeSettings(){document.querySelector('#settingsModal').hidden=true;document.querySelector('#settingsButton').focus();}
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
    stage.hidden=false;stageCharacter.hidden=false;stageProps.hidden=false;
    setScheduleDialogue(action,'start',index);
    if(forcedRest)document.querySelector('#dialogueText').textContent='스트레스가 100에 도달해 오늘 일정은 집에서 휴식으로 변경했어요.';
    const dailyOutfit=game.autoOutfit?updateAutoOutfit(action.id):game.equippedOutfit;
    document.querySelector('#playbackDay').textContent = dayNames[index];
    document.querySelector('#playbackAction').textContent = action.name;
    document.querySelectorAll('#playbackWeek span').forEach((day,dayIndex)=>{day.classList.toggle('done',dayIndex<index);day.classList.toggle('current',dayIndex===index);});
    document.querySelectorAll('#playbackWeek span').forEach((day,dayIndex)=>{day.classList.toggle('done',dayIndex<index);day.classList.toggle('current',dayIndex===index);});
    const outfitName=outfits.find(item=>item.id===dailyOutfit)?.name;
    const showOutfitName=action.id!=='rest'&&Boolean(outfitName);
    document.querySelector('#stageCaption').textContent = `${dayNames[index]} · ${action.name}${showOutfitName?` · ${outfitName}`:''}`;
    document.querySelector('#playbackProgress').style.width = `${((index + 1) / selected.length) * 100}%`;
    bg.src = backgrounds[presentation.location];
    stageMap.src = backgrounds[presentation.location];
    stageMap.alt = `${action.name} 활동 장소`;
    stageProps.className = `stage-props prop-${presentation.prop}`;
    stageNpc.hidden = !presentation.npc;
    stageNpc.className = presentation.npc ? `stage-npc npc-${presentation.npc}` : 'stage-npc';
    if(presentation.npc)stageNpcImage.src = (presentation.npc==='teacher'?npcFrames.teacherReading:npcFrames[presentation.npc])[0];
    stage.className = `activity-stage map-${presentation.location} action-${action.id}`;
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
      const prize=awardVacationIllustration();
      stage.hidden=true;stageNpc.hidden=true;stageProps.hidden=true;stageCharacter.hidden=true;
      const metSomeone=await playVacationScene(prize,index);
      document.querySelector('#dialogueText').textContent=metSomeone?`바캉스에서 「${prize.name}」 일러스트와 ${metSomeone.name}의 인연 추억을 얻었어요.`:`바캉스에서 「${prize.name}」 일러스트를 획득했어요.`;
    }else await animateActivitySprite(stageCharacterImage,presentation.motion,presentation.activity,stageNpcImage,presentation.npc,dailyOutfit);
    const guaranteedSuccess=['rest','vacation'].includes(action.id);
    const condition=['shopping','rest','vacation'].includes(action.id)?null:conditionEvent(simulated.stress,index);
    let outcome=judgeActivityOutcome(action,simulated.stress);
    if(!guaranteedSuccess&&condition==='mistake')outcome='mistake';
    else if(!guaranteedSuccess&&condition==='drowsy'&&outcome!=='mistake')outcome='struggle';
    const resolvedChange=resolvedActivityChange(action,outcome);
    const resolvedAction={...action,change:resolvedChange};
    if(condition){
      setScheduleDialogue(action,condition,index);
      await animateConditionEvent(stageCharacter,conditionCue,condition);
    }
    setScheduleDialogue(action,outcome,index);
    stageCharacter.className = `stage-character pixel-sprite ${presentation.motion}`;
    renderActivityGauges(resolvedAction);
    const actualChange={};
    Object.entries(resolvedChange).forEach(([key,value])=>{const before=clampStat(key,game[key]||0),after=clampStat(key,before+value);game[key]=after;actualChange[key]=after-before;});
    game.money=Math.max(0,game.money-action.cost);
    renderHud();
    const moneyLabel=document.querySelector('#moneyLabel');
    moneyLabel.classList.remove('money-changing');void moneyLabel.offsetWidth;moneyLabel.classList.add('money-changing');
    showLiveChanges(resolvedAction);
    const moneyText = action.cost > 0 ? `은전 -${action.cost}냥` : action.cost < 0 ? `은전 +${-action.cost}냥` : '비용 없음';
    const resultSummary=orderedChangeEntries(resolvedChange).filter(([,value])=>value!==0).map(([key,value])=>`${statLabels[key]||key} ${value>0?'+':''}${value}`).join(' · ');
    dayResult.innerHTML = `<b>${action.name} · ${outcomeLabels[outcome]}</b><span>${resultSummary||'능력치 변화 없음'}<br>${moneyText} · 현재 ${game.money.toLocaleString()}냥</span>`;
    if(action.id!=='vacation'){
      dayResult.hidden = false;
      await new Promise(resolve => setTimeout(resolve, 900));
      dayResult.hidden = true;
    }
    Object.entries(resolvedChange).forEach(([key,value])=>weeklyChange[key]=(weeklyChange[key]||0)+value);
    const activityDate=new Date(scheduleStart);activityDate.setDate(scheduleStart.getDate()+index);
    dayRecords.push({date:isoDate(activityDate),action,actualChange});
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
  document.querySelector('#speakerName').textContent=game.nannyName||'유모';
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
document.querySelector('#prologueNext').addEventListener('click',nextPrologue);
document.querySelector('#prologueBack').addEventListener('click',previousPrologue);
document.querySelector('#prologueSound').addEventListener('click',togglePrologueSound);
document.querySelector('#prologueSkip').addEventListener('click',closePrologue);
document.querySelector('#storyReplay').addEventListener('click',replayPrologue);
document.querySelector('#studioStartSound').addEventListener('click',finishStudioIntro);
prologueScenes.forEach(scene=>{const image=new Image();image.src=scene.image;});
syncSettingsUi();
renderHud();
updateHomeCharacter();
updateImageState();
migrateLegacySave();
initializeRecoverySession();
document.addEventListener('visibilitychange',()=>{if(document.hidden)writeLatestAutoSave();});
window.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.querySelector('#settingsModal').hidden)closeSettings();});
window.addEventListener('pagehide',()=>{writeLatestAutoSave();localStorage.removeItem(SESSION_ACTIVE_KEY);});
