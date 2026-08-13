const bg = document.querySelector('.background');
const character = document.querySelector('#character');
const missing = document.querySelector('#missing');
const panel = document.querySelector('#panel');
const panelTitle = document.querySelector('#panelTitle');
const panelBody = document.querySelector('#panelBody');
const originalPrologueScenes = [
  { image:'../assets/cinematics/prologue/01-rainy-road.webp', chapter:'서장 · 비 오는 밤', alt:'비 오는 밤길', text:'비가 억수같이 쏟아지던 어느 날, 사내는 길가에 쓰러진 아이를 발견했다.' },
  { image:'../assets/cinematics/prologue/02-rescue-room.webp', chapter:'서장 · 낯선 아이', alt:'아이를 돌보는 한옥 방', text:'사내는 차마 아이를 외면하지 못하고 집으로 데려와 밤새 곁을 지켰다.' },
  { image:'../assets/cinematics/prologue/03-memory-loss.webp', chapter:'서장 · 잃어버린 기억', alt:'기억을 잃은 아이와 사내', text:'다음 날 눈을 뜬 아이는 아무것도 기억나지 않는다고 말했다. 사내는 아이가 기억을 되찾을 때까지 돌봐주기로 마음먹었다.' }
];
const prologueScenes=window.SEONHWA_STORY?.prologue||originalPrologueScenes;
let prologueIndex=0, prologueTimer=null;
let prologueSoundOn=false, rainAudio=null;

const game = { characterName:'', nannyName:'', age: 9, month: 1, week: 1, season:'봄', money: 1200, health: 42, study: 35, fatigue: 18, items: [], equippedOutfit:null, autoOutfit:true, dailySchedule: [null,null,null,null,null,null,null], birthday:null, currentDate:null, endingDate:null, ended:false, birthdayCount:0, element:null, birthSeason:null, memory:0, truth:0, exposure:0, guardianTrust:50, nannyAffinity:50, lastGreetingDate:null };
Object.assign(game, { healthiness: 76, arithmetic: 22, manners: 28, arts: 18, martial: 12, archery: 5, riding: 3, craft: 24, cooking: 20, embroidery: 15, virtue: 36, charm: 30, sensitivity: 40, medicine: 8, commerce: 10, reputation: 14, stress: 12 });
const statGroups = [
  { title: '기초 능력', stats: [['health','체력'],['healthiness','건강'],['study','학문'],['arithmetic','산술'],['manners','예절']] },
  { title: '예술·기술', stats: [['arts','예능'],['craft','솜씨'],['cooking','요리'],['embroidery','자수'],['sensitivity','감수성']] },
  { title: '무예·전문', stats: [['martial','무예'],['archery','궁술'],['riding','승마'],['medicine','의술'],['commerce','상업']] },
  { title: '인품·상태', stats: [['virtue','덕망'],['charm','매력'],['reputation','평판'],['stress','스트레스'],['fatigue','피로']] }
];
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
const SAVE_KEY = 'seonhwa-princess-mvp-save-v1';
const statMaximum=key=>key==='fatigue'?100:999;
const clampStat=(key,value)=>Math.max(0,Math.min(statMaximum(key),Number(value)||0));
const boundedStats=[...new Set(statGroups.flatMap(group=>group.stats.map(([key])=>key)).concat(['nannyAffinity','guardianTrust','memory','truth','exposure']))];
function normalizeStats(){boundedStats.forEach(key=>{if(Object.hasOwn(game,key))game[key]=clampStat(key,game[key]);});}
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
  {id:'vacation-spring-stream',season:'봄',name:'봄 계곡의 꽃잎',image:'../assets/events/vacation/spring-stream-v2.webp',description:'맑은 계곡에서 꽃잎을 바라보던 봄날의 초현실적 4K 추억.'},
  {id:'vacation-summer-seaside',season:'여름',name:'여름 바닷가의 조개',image:'../assets/events/vacation/summer-seaside-v2.webp',description:'바닷가 마을에서 조개를 주웠던 여름날의 초현실적 4K 추억.'},
  {id:'vacation-autumn-maple',season:'가을',name:'가을 정자의 단풍',image:'../assets/events/vacation/autumn-maple-v2.webp',description:'붉은 단풍 아래 정자를 거닐었던 가을날의 초현실적 4K 추억.'},
  {id:'vacation-winter-snow',season:'겨울',name:'겨울 한옥의 첫눈',image:'../assets/events/vacation/winter-snow-v2.webp',description:'눈 내린 한옥 뜰에서 첫눈을 바라보던 겨울날의 초현실적 4K 추억.'}
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
const npcFrames = Object.fromEntries(['teacher','dolsoe','herbalist','nanny'].map(name=>[name,[1,2,3].map(n=>`../assets/characters/npcs/activity/${name}-${n}.png`)]));
npcFrames.teacherReading=[1,2,3].map(n=>`../assets/characters/npcs/activity/teacher-reading-${n}.png`);
const foods = [
  {id:'bunsik',name:'분식 세트',detail:'떡볶이 · 튀김 · 순대',price:45,change:{stress:-8,fatigue:-3,healthiness:-1}},
  {id:'gimbap',name:'김밥',detail:'채소와 달걀을 넣은 한 줄',price:30,change:{stress:-4,fatigue:-3,healthiness:1}},
  {id:'bulgogi',name:'불고기',detail:'달큰하게 양념한 쇠고기',price:85,change:{stress:-7,fatigue:-5,healthiness:3}},
  {id:'bibimbap',name:'비빔밥',detail:'나물과 고명을 비빈 밥',price:65,change:{stress:-6,fatigue:-4,healthiness:4}},
  {id:'gukbap',name:'국밥',detail:'뜨끈한 장국과 밥',price:55,change:{stress:-5,fatigue:-6,healthiness:2}},
  {id:'japchae',name:'잡채',detail:'채소와 당면 볶음',price:70,change:{stress:-6,fatigue:-3,healthiness:2}},
  {id:'tteokguk',name:'떡국',detail:'맑은 장국의 가래떡',price:60,change:{stress:-5,fatigue:-5,healthiness:2}},
  {id:'samgyetang',name:'삼계탕',detail:'닭과 약재를 푹 고은 탕',price:110,change:{stress:-5,fatigue:-10,healthiness:6}},
  {id:'galbijjim',name:'갈비찜',detail:'부드럽게 익힌 갈비',price:120,change:{stress:-9,fatigue:-6,healthiness:3}},
  {id:'jeongol',name:'전골',detail:'채소와 고기를 끓인 전골',price:95,change:{stress:-7,fatigue:-7,healthiness:5}}
];
const outfits = [
  {id:'age09-neat',age:9,name:'단정한 배움 한복',price:180,tone:'단정함',change:{manners:4,virtue:3,charm:1}},
  {id:'age09-flower',age:9,name:'연분홍 꽃 한복',price:230,tone:'화려함',change:{charm:5,reputation:2,fatigue:1}},
  {id:'age09-active',age:9,name:'마을 활동 한복',price:160,tone:'활동성',change:{health:3,craft:3,charm:-1}},
  {id:'age13-scholar',age:13,name:'옥색 학문 한복',price:280,tone:'단정함',change:{study:5,manners:3,charm:1}},
  {id:'age13-festival',age:13,name:'명절 색동 한복',price:340,tone:'화려함',change:{charm:6,reputation:3,fatigue:2}},
  {id:'age13-work',age:13,name:'생활 작업 한복',price:240,tone:'활동성',change:{craft:5,health:3,charm:-1}},
  {id:'age16-court',age:16,name:'격식 당의 한복',price:480,tone:'격식',change:{manners:6,virtue:4,charm:3,fatigue:2}},
  {id:'age16-art',age:16,name:'자수 예술 한복',price:520,tone:'화려함',change:{arts:5,charm:7,reputation:2,fatigue:2}},
  {id:'age16-travel',age:16,name:'여행 활동 한복',price:390,tone:'활동성',change:{health:4,martial:3,charm:-1}},
  {id:'age18-ceremony',age:18,name:'성년 예복 한복',price:720,tone:'격식',change:{manners:8,virtue:5,reputation:5,fatigue:3}},
  {id:'age18-silk',age:18,name:'비단 연회 한복',price:780,tone:'화려함',change:{charm:10,reputation:4,virtue:-1,fatigue:3}},
  {id:'age18-simple',age:18,name:'담백한 생활 한복',price:560,tone:'활동성',change:{craft:5,health:4,virtue:3,charm:-2}}
];
const growthAge=()=>game.age>=18?18:game.age>=16?16:game.age>=13?13:9;
const correctedAdultOutfits=new Set(['age13-scholar','age13-festival','age13-work','age16-court','age16-art','age16-travel']);
const outfitImage=id=>{
  const age=growthAge();
  const suffix=age===18&&correctedAdultOutfits.has(id)?'-v2':'';
  return `../assets/characters/seonhwa/wardrobe/age-${String(age).padStart(2,'0')}/${id}${suffix}.png`;
};
function homeCondition(){
  if(game.homeReaction==='shocked')return 'shocked';
  if(game.virtue<25||game.nannyAffinity<25||game.stress>=75)return 'rebellious';
  if(game.fatigue>=55)return 'tired';
  if(game.stress>=50)return 'angry';
  if(game.healthiness<35||game.health<25)return 'sad';
  if(game.fatigue<30&&game.stress<30)return 'happy';
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
  const score=item=>{const outfit=outfits.find(entry=>entry.id===item.id);let value=0;situation.forEach((tag,index)=>{if(item.id.includes(tag))value+=30-index*3;});season.forEach((tag,index)=>{if(item.id.includes(tag))value+=18-index*2;});value-=Math.max(0,game.age-outfit.age)*2;return value;};
  return owned.sort((a,b)=>score(b)-score(a))[0]?.id||null;
}
function updateAutoOutfit(actionId=null){if(!game.autoOutfit)return game.equippedOutfit;game.equippedOutfit=recommendOutfit(actionId);applyEquippedOutfit();return game.equippedOutfit;}
const activityOutfitFrameCache=new Map();
function activityOutfitPalette(outfitId){
  if(!outfitId)return null;
  if(/active|work|travel|simple/.test(outfitId))return {skirt:[54,126,125],top:[220,172,74]};
  if(/flower|festival|art|silk/.test(outfitId))return {skirt:[211,96,120],top:[236,190,195]};
  if(/court|ceremony/.test(outfitId))return {skirt:[59,79,126],top:[218,187,112]};
  return {skirt:[143,171,145],top:null};
}
function outfitActivityFrame(src,outfitId){
  const palette=activityOutfitPalette(outfitId);if(!palette)return Promise.resolve(src);
  const key=`${outfitId}|${src}`;if(activityOutfitFrameCache.has(key))return Promise.resolve(activityOutfitFrameCache.get(key));
  return new Promise(resolve=>{const source=new Image();source.onload=()=>{try{const canvas=document.createElement('canvas');canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(source,0,0);const frame=context.getImageData(0,0,canvas.width,canvas.height),data=frame.data;
    for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){const i=(y*canvas.width+x)*4;if(data[i+3]<24)continue;const r=data[i],g=data[i+1],b=data[i+2];
      const pink=r>155&&g>42&&g<155&&b>52&&b<180&&r>g*1.32&&r>b*1.12;
      const central=x>canvas.width*.16&&x<canvas.width*.84&&y>canvas.height*.2&&y<canvas.height*.76;
      const ivory=central&&r>188&&g>165&&b>130&&r-b<62&&r-g<45;
      const target=pink?palette.skirt:(ivory&&palette.top?palette.top:null);if(!target)continue;
      const light=(r+g+b)/3/170;data[i]=Math.min(255,target[0]*light);data[i+1]=Math.min(255,target[1]*light);data[i+2]=Math.min(255,target[2]*light);
    }
    context.putImageData(frame,0,0);const result=canvas.toDataURL('image/png');activityOutfitFrameCache.set(key,result);resolve(result);}catch{resolve(src);}};source.onerror=()=>resolve(src);source.src=src;});
}
async function animateActivitySprite(image,motion,activity,npcImage,npc,outfitId){
  if(activity){
    const sequence=activity==='errand'?[0,1,1,2,2,1,0]:activity==='houseclean'?[0,1,2,3,4,5]:activity==='sleep'?[0,1,2,1,0]:[0,1,2,1,0,1,2];
    const delay=activity==='errand'?270:activity==='houseclean'?360:activity==='sleep'?430:190;
    for(const frame of sequence){image.src=await outfitActivityFrame(activityFrames[activity][frame],outfitId);if(npc)npcImage.src=(npc==='teacher'?npcFrames.teacherReading:npcFrames[npc])[frame%3];await new Promise(resolve=>setTimeout(resolve,delay));}
    return;
  }
  const direction=motion==='motion-walk'?'right':'down';
  const sequence=motion==='motion-walk'?[0,1,2,1,0,1,2,1]:[1,0,1,2,1,0,1];
  for(const frame of sequence){image.src=spriteFrames[direction][frame];await new Promise(resolve=>setTimeout(resolve,motion==='motion-walk'?135:170));}
}
function conditionEvent(fatigue, stress, dayIndex){
  const peak=Math.max(fatigue,stress);
  if(peak>=80||((fatigue>=70||stress>=70)&&dayIndex%2===1))return 'mistake';
  if(peak>=55)return 'drowsy';
  return null;
}
const activitySkill={reading:'study',arithmetic:'arithmetic',manners:'manners',errand:'commerce',sweeping:'health',herbs:'medicine',houseclean:'craft',rest:'healthiness'};
const outcomeLabels={perfect:'완벽',success:'성공',struggle:'힘겨움',mistake:'실수'};
function judgeActivityOutcome(action,fatigue,stress){
  if(['shopping','vacation'].includes(action.id))return 'success';
  const skill=game[activitySkill[action.id]]||0;
  const condition=(game.healthiness||50)*.08-fatigue*.42-stress*.34;
  const chance=Math.max(18,Math.min(92,48+skill*.09+condition));
  const roll=Math.random()*100;
  if(roll<=Math.max(6,chance-32))return 'perfect';
  if(roll<=chance)return 'success';
  if(roll<=Math.min(96,chance+20))return 'struggle';
  return 'mistake';
}
function resolvedActivityChange(action,outcome){
  const change={};
  Object.entries(action.change).forEach(([key,value])=>{
    const beneficial=(key==='fatigue'||key==='stress')?value<0:value>0;
    const multiplier=beneficial?(outcome==='perfect'?1.5:outcome==='struggle'?.5:outcome==='mistake'?.25:1):1;
    change[key]=Math.round(value*multiplier);
  });
  if(outcome==='mistake'){
    change.fatigue=(change.fatigue||0)+2;
    change.stress=(change.stress||0)+3;
    change.health=(change.health||0)-1;
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
    if(Math.max(game.fatigue,game.stress)>=55)line='오늘은 컨디션이 좋지 않아요.';
    else line=`오늘은 ${action.name}${objectParticle(action.name)} 열심히 해볼게요.`;
  }else if(state==='drowsy'){
    speaker=education?'훈장님':(game.nannyName||'유모');
    line=education?'수업 중에 졸면 배운 것을 놓치게 된다. 정신을 차리거라.':'많이 피곤해 보이는구나. 잠시 숨을 고르렴.';
  }else if(state==='mistake'){
    speaker=education?'훈장님':(game.nannyName||'유모');
    line=education?'졸다가 실수하다니, 오늘 배운 대목을 다시 익히거라.':'괜찮단다. 서두르지 말고 다시 해 보자.';
  }else if(state==='struggle'){
    line=Math.max(game.fatigue,game.stress)>=55?'몸이 무거워 평소만큼 해내지는 못했어요.':'조금 어려웠지만 끝까지 포기하지 않았어요.';
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
  { id: 'reading', category: '교육', name: '글읽기', cost: 80, summary: '학문 +6 · 피로 +4', change: { study: 6, fatigue: 4 } },
  { id: 'arithmetic', category: '교육', name: '셈하기', cost: 70, summary: '학문 +4 · 피로 +3', change: { study: 4, fatigue: 3 } },
  { id: 'manners', category: '교육', name: '예절 배우기', cost: 90, summary: '학문 +2 · 피로 +3', change: { study: 2, fatigue: 3 } },
  { id: 'errand', category: '아르바이트', name: '장터 심부름', cost: -60, summary: '체력 +3 · 피로 +6 · 60냥 획득', change: { health: 3, fatigue: 6 } },
  { id: 'sweeping', category: '아르바이트', name: '마당 쓸기', cost: -40, summary: '체력 +2 · 피로 +5 · 40냥 획득', change: { health: 2, fatigue: 5 } },
  { id: 'herbs', category: '아르바이트', name: '약초 줍기', cost: -50, summary: '체력 +2 · 학문 +1 · 피로 +6', change: { health: 2, study: 1, fatigue: 6 } },
  { id: 'houseclean', category: '아르바이트', name: '집 청소', cost: -35, summary: '솜씨 +2 · 체력 +2 · 피로 +5', change: { craft: 2, health: 2, fatigue: 5 } },
  { id: 'rest', category: '휴식', name: '집에서 휴식', cost: 0, summary: '피로 -10 · 체력 +2', change: { health: 2, fatigue: -10 } },
  { id: 'shopping', category: '휴식', name: '저잣거리', cost: 0, summary: '', change: {}, special:'market' },
  { id: 'vacation', category: '휴식', name: '바캉스', cost: 180, summary: '피로 -20 · 스트레스 -15 · 추억 일러스트 획득', change: {fatigue:-20,stress:-15}, special:'vacation' }
];

function awardVacationIllustration(){
  normalizeInventory();
  const owned=new Set(game.items.filter(item=>item.type==='event').map(item=>item.id));
  // 바캉스 일러스트는 계절마다 대표컷 한 장만 사용한다.
  const prize=vacationIllustrations.find(item=>item.season===game.season)||vacationIllustrations[0];
  if(!owned.has(prize.id))game.items.push({...prize,type:'event',qty:1});
  return prize;
}
const endingRelationCandidates=[
  {id:'doyun',name:'도윤',role:'젊은 무관',image:'../assets/characters/romance/doyun/vacation.png',minAge:14,ending:'무관의 아내',dialogues:['“활쏘기보다 고요한 풍경을 바라보는 일이 더 어렵군.”','“혼자 걷는 길인 줄 알았는데, 동행이 생겼군.”']},
  {id:'seojin',name:'서진',role:'선비',image:'../assets/characters/romance/seojin/vacation.png',minAge:14,ending:'선비와의 삶',dialogues:['“책에서 읽던 풍경보다 직접 보는 모습이 더 아름답군요.”','“이 경치를 시로 남긴다면 어떤 첫 구절이 좋을까요?”']},
  {id:'yeonwoo',name:'연우',role:'화공',image:'../assets/characters/romance/yeonwoo/vacation.png',minAge:14,ending:'화가의 동반자',dialogues:['“잠시 그대로 있어 봐. 이 순간을 그림에 담고 싶어.”','“같은 풍경도 함께 보는 사람에 따라 색이 달라 보여.”']},
  {id:'taegyeom',name:'태겸',role:'상단 후계자',image:'../assets/characters/romance/taegyeom/vacation.png',minAge:14,ending:'대상인의 동반자',dialogues:['“좋은 물건보다 좋은 인연을 만나는 일이 더 귀하다고 하더군.”','“이 길 끝에 재미있는 장이 선다는데, 함께 가겠어?”']},
  {id:'hyeon',name:'현',role:'정체를 숨긴 왕자',image:'../assets/characters/romance/hyeon/vacation.png',minAge:15,ending:'왕자의 연인',dialogues:['“내가 누구인지는 잠시 잊고, 오늘만 평범하게 걸어도 될까?”','“또 만났네. 이쯤 되면 우연이라고만 하기는 어렵겠어.”']}
];
function waitForVacationTap(label='화면을 터치해 계속'){
  const scene=document.querySelector('#vacationScene'),button=document.querySelector('#vacationNext');button.textContent=label;
  return new Promise(resolve=>{const advance=event=>{event.preventDefault();scene.removeEventListener('click',advance);resolve();};scene.addEventListener('click',advance,{once:true});});
}
async function playVacationScene(prize,index){
  const phone=document.querySelector('.phone'),scene=document.querySelector('#vacationScene'),image=document.querySelector('#vacationImage');
  const person=document.querySelector('#encounterCharacter'),talk=document.querySelector('#encounterDialogue');
  image.src=prize.image;document.querySelector('#vacationTitle').textContent=prize.name;
  scene.classList.remove('has-encounter');person.hidden=true;talk.hidden=true;phone.classList.add('vacation-playing');scene.hidden=false;
  await waitForVacationTap('일러스트를 감상한 뒤 터치');
  const candidates=endingRelationCandidates.filter(candidate=>game.age>=candidate.minAge&&candidate.assetReady);
  const encounter=candidates.length>0&&Math.random()<.35;
  let relation=null;
  if(encounter){
    relation=candidates[Math.floor(Math.random()*candidates.length)];const fromLeft=Math.random()<.5;
    person.querySelector('img').src=relation.image;person.querySelector('img').alt=`엔딩 인연 후보 ${relation.name}`;
    person.className=`encounter-character ${fromLeft?'from-left':'from-right'}`;person.hidden=false;scene.classList.add('has-encounter');
    document.querySelector('#encounterName').textContent=relation.name;document.querySelector('#encounterText').textContent=relation.dialogues[Math.floor(Math.random()*relation.dialogues.length)];talk.hidden=false;
    game.relations=game.relations||{};game.relations[relation.id]=(game.relations[relation.id]||0)+1;
    await waitForVacationTap('대화를 읽은 뒤 터치');
  }
  talk.hidden=true;person.hidden=true;scene.classList.remove('has-encounter');scene.hidden=true;phone.classList.remove('vacation-playing');
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
  document.querySelector('#speakerName').textContent = game.nannyName || '유모';
}

const statLabels={health:'체력',healthiness:'건강',study:'학문',arithmetic:'산술',manners:'예절',arts:'예능',martial:'무예',craft:'솜씨',cooking:'요리',embroidery:'자수',virtue:'덕망',charm:'매력',sensitivity:'감수성',medicine:'의술',commerce:'상업',reputation:'평판',stress:'스트레스',fatigue:'피로'};
statLabels.nannyAffinity='유모 친밀도';
function showLiveChanges(action){
  const items=Object.entries(action.change).map(([key,value])=>{const inverse=key==='fatigue'||key==='stress';const positive=inverse?value<0:value>=0;return `<span class="${positive?'up':'down'}">${statLabels[key]||key} ${value>0?'+':''}${value}</span>`;});
  if(action.cost!==0)items.push(`<span class="money">은전 ${action.cost>0?'-':'+'}${Math.abs(action.cost)}냥</span>`);
  document.querySelector('#liveChanges').innerHTML=items.join('');
  if(Object.values(action.change||{}).some(value=>Math.abs(value)>=8))game.homeReaction='shocked';
  else if(action.change&&Object.keys(action.change).length)game.homeReaction=null;
  updateHomeCharacter();
}
function renderActivityGauges(action){
  const box=document.querySelector('#activityGauges');
  const entries=Object.entries(action.change||{}).filter(([,value])=>value!==0);
  if(!entries.length||['shopping','vacation'].includes(action.id)){box.hidden=true;box.innerHTML='';return;}
  box.innerHTML=entries.map(([key,value])=>{
    const max=statMaximum(key),current=clampStat(key,game[key]),next=clampStat(key,current+value);
    const beneficial=(key==='fatigue'||key==='stress')?value<0:value>0;
    const low=Math.min(current,next),width=Math.max(2,Math.abs(next-current));
    return `<div class="activity-gauge"><span class="activity-gauge-label">${statLabels[key]||key}</span><span class="activity-gauge-track"><i class="activity-gauge-before" style="width:${current/max*100}%"></i><i class="activity-gauge-delta ${beneficial?'up':'down'}" style="left:${low/max*100}%;width:${Math.max(2,width/max*100)}%"></i></span><span class="activity-gauge-value ${beneficial?'up':'down'}">${value>0?'▲':'▼'} ${Math.abs(value)}</span></div>`;
  }).join('');
  box.hidden=false;
}

const greetingChoices={
  tired:[
    {line:'오늘은 몸이 조금 무거워요. 그래도 잘 해낼 수 있을까요?',choices:[['오늘은 천천히 해도 괜찮아.',{fatigue:-4,nannyAffinity:3},'곁에서 지켜봐 준다니 마음이 놓여요.'],['따뜻한 차부터 마시자.',{stress:-3,healthiness:2,nannyAffinity:2},'따뜻한 차를 마시면 기운이 날 것 같아요!'],['계획대로 움직여 보자.',{virtue:2,fatigue:2,nannyAffinity:-1},'네… 조금 힘들어도 해볼게요.']]},
    {line:'자꾸 눈이 감겨요. 조금 더 누워 있어도 될까요?',choices:[['잠깐 더 쉬렴.',{fatigue:-6,nannyAffinity:3},'고마워요. 금방 기운을 차릴게요.'],['세수하고 바람을 쐬자.',{fatigue:-3,health:2,nannyAffinity:2},'찬물에 세수하면 정신이 들 것 같아요.'],['늦기 전에 일어나자.',{manners:2,fatigue:2,nannyAffinity:-1},'알겠어요. 얼른 준비할게요.']]},
    {line:'어제 너무 무리했나 봐요. 팔다리가 뻐근해요.',choices:[['오늘 일정은 가볍게 하자.',{fatigue:-5,stress:-2,nannyAffinity:3},'한결 마음이 편해졌어요.'],['따뜻하게 몸을 풀어보자.',{healthiness:3,fatigue:-3,nannyAffinity:2},'조금씩 움직이면 괜찮아질 것 같아요.'],['참는 것도 수련이란다.',{virtue:2,stress:2,nannyAffinity:-2},'네… 견뎌볼게요.']]}
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
function showHomeGreeting(force=false){
  if(!game.birthday||document.querySelector('.phone').classList.contains('playing')||game.lastGreetingDate===game.currentDate)return false;
  game.lastGreetingDate=game.currentDate;
  if(!force&&Math.random()>=.18)return false;
  const mood=game.fatigue>=55?'tired':game.stress>=45?'stressed':'bright',scenes=greetingChoices[mood];
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
  const [,change,result]=scene.choices[index];Object.entries(change).forEach(([key,value])=>game[key]=clampStat(key,(game[key]||0)+value));
  document.querySelector('#homeGreeting').hidden=true;document.querySelector('.phone').classList.remove('greeting-active');document.querySelector('#speakerName').textContent=game.characterName||'아이';document.querySelector('#dialogueText').textContent=result;showLiveChanges({change,cost:0});renderHud();
}

function openPanel(type) {
  panel.hidden = false;
  if (type === 'schedule') {
    renderSchedulePanel();
  } else if (type === 'status') {
    panelTitle.textContent = `${game.characterName || '아이'}의 상태`;
    panelBody.innerHTML = `<div class="status-summary"><span>${game.age}세 · ${game.season} ${game.week}주</span><b>${game.money.toLocaleString()}냥</b></div>${statGroups.map(group => `<section class="stat-group"><h3>${group.title}</h3>${group.stats.map(([key,label]) => statBar(key,label)).join('')}</section>`).join('')}`;
  } else if (type === 'inventory') {
    renderInventory();
  } else if (type === 'collection') {
    renderVacationCollection();
  } else {
    renderSavePanel();
  }
}
const inventoryCategories={all:'전체',food:'음식',outfit:'의상',accessory:'장신구',event:'이벤트'};
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
  const filtered=game.items.filter(item=>category==='all'||item.type===category).slice(0,180);
  const slots=Array.from({length:180},(_,index)=>{const item=filtered[index];if(!item)return '<div class="inventory-slot empty" aria-hidden="true"></div>';const image=inventoryImage(item);return `<button class="inventory-slot filled ${game.equippedOutfit===item.id?'equipped':''}" data-item="${item.id}" title="${item.name}">${image?`<img src="${image}" alt="">`:`<i class="item-glyph type-${item.type}"></i>`}<span>${item.name}</span>${item.qty>1?`<b>${item.qty}</b>`:''}${game.equippedOutfit===item.id?'<em>착용</em>':''}</button>`;}).join('');
  panelBody.innerHTML=`<div class="inventory-tabs">${Object.entries(inventoryCategories).map(([id,label])=>`<button data-inventory-tab="${id}" class="${category===id?'on':''}">${label}</button>`).join('')}</div><div class="inventory-count"><b>${filtered.length}</b> / 180칸</div><div class="inventory-grid">${slots}</div><div class="inventory-detail" id="inventoryDetail">아이템을 누르면 설명과 사용 버튼이 표시됩니다.</div>`;
  panelBody.querySelectorAll('[data-inventory-tab]').forEach(button=>button.addEventListener('click',()=>renderInventory(button.dataset.inventoryTab)));
  panelBody.querySelectorAll('[data-item]').forEach(button=>button.addEventListener('click',()=>showInventoryItem(button.dataset.item,category)));
}
function showInventoryItem(id,category){
  const item=game.items.find(entry=>entry.id===id),detail=document.querySelector('#inventoryDetail');if(!item)return;
  const action=item.type==='outfit'?`<button data-inventory-action="wear">${game.equippedOutfit===item.id?'벗기':'갈아입기'}</button>`:item.type==='food'?'<button data-inventory-action="use">먹기</button>':'';
  detail.innerHTML=`${item.type==='event'&&item.image?`<img class="event-collectible-preview" src="${item.image}" alt="${item.name}">`:''}<b>${item.name}</b><span>${inventoryCategories[item.type]||'기타'} · ${item.qty||1}개</span>${item.description?`<p>${item.description}</p>`:''}${action}`;
  detail.querySelector('[data-inventory-action]')?.addEventListener('click',()=>{if(item.type==='outfit'){game.autoOutfit=false;game.equippedOutfit=game.equippedOutfit===item.id?null:item.id;applyEquippedOutfit();renderInventory(category);}else if(item.type==='food'){const food=foods.find(entry=>entry.id===item.id);if(food)applyShopChanges(food.change);item.qty-=1;if(item.qty<=0)game.items.splice(game.items.indexOf(item),1);document.querySelector('#dialogueText').textContent=`${item.name}을(를) 먹었어요.`;renderInventory(category);}});
}
function renderVacationCollection(){
  normalizeInventory();panelTitle.textContent='바캉스 수집도감';
  const ownedIds=new Set(game.items.filter(item=>item.type==='event').map(item=>item.id));
  const collected=vacationIllustrations.filter(item=>ownedIds.has(item.id)).length,total=vacationIllustrations.length;
  const percent=Math.round(collected/total*100);
  const cards=vacationIllustrations.map(item=>{const unlocked=ownedIds.has(item.id);return `<button class="collection-card ${unlocked?'unlocked':'locked'}" data-collection-id="${item.id}" ${unlocked?'':'disabled'} aria-label="${unlocked?`${item.season} 수집 완료`:`${item.season} 미수집`}"><div class="collection-art"><img src="${item.image}" alt="${unlocked?item.name:''}"><span>${unlocked?'수집 완료':'?'}</span></div><b>${item.season}</b><small>${unlocked?item.name:'아직 발견하지 못한 추억'}</small></button>`;}).join('');
  panelBody.innerHTML=`<section class="collection-progress" aria-label="바캉스 일러스트 수집률"><div><b>수집도 ${percent}%</b><span>${collected} / ${total}</span></div><div class="collection-track"><i style="width:${percent}%"></i></div></section><div class="collection-grid">${cards}</div><section class="collection-detail" id="collectionDetail">수집한 카드를 누르면 크게 볼 수 있어요.</section>`;
  panelBody.querySelectorAll('[data-collection-id]:not(:disabled)').forEach(button=>button.addEventListener('click',()=>showVacationCollectionCard(button.dataset.collectionId)));
}
function showVacationCollectionCard(id){
  const item=vacationIllustrations.find(entry=>entry.id===id),detail=document.querySelector('#collectionDetail');if(!item||!detail)return;
  detail.innerHTML=`<img src="${item.image}" alt="${item.name}"><div><b>${item.season} · ${item.name}</b><p>${item.description}</p></div>`;
  detail.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function renderWardrobe(){
  panel.hidden=false;panelTitle.textContent='옷 갈아입기';
  const owned=game.items.filter(item=>item&&item.type==='outfit');
  panelBody.innerHTML=`<div class="auto-outfit"><div><b>계절·상황 자동 갈아입기</b><small>${game.autoOutfit?'보유한 한복 중 알맞은 옷을 자동 선택합니다.':'직접 선택한 한복을 계속 입습니다.'}</small></div><button id="autoOutfitToggle" class="${game.autoOutfit?'on':''}">${game.autoOutfit?'켜짐':'꺼짐'}</button></div><div class="wardrobe-grid"><button class="wardrobe-card ${!game.equippedOutfit?'on':''}" data-wear=""><img src="${expressions[0][0]}" alt="기본 한복"><b>기본 한복</b></button>${owned.map(item=>`<button class="wardrobe-card ${game.equippedOutfit===item.id?'on':''}" data-wear="${item.id}"><img src="${outfitImage(item.id)}" alt="${item.name}"><b>${item.name}</b><small>${item.age<game.age?'자라서 조금 꼭 맞음':'현재 몸에 맞음'}</small></button>`).join('')}</div>`;
  document.querySelector('#autoOutfitToggle').addEventListener('click',()=>{game.autoOutfit=!game.autoOutfit;if(game.autoOutfit)updateAutoOutfit();renderWardrobe();});
  panelBody.querySelectorAll('[data-wear]').forEach(button=>button.addEventListener('click',()=>{game.autoOutfit=false;game.equippedOutfit=button.dataset.wear||null;applyEquippedOutfit();renderWardrobe();}));
}

function renderSavePanel() {
  panelTitle.textContent = '게임 기록';
  const saved = readSave();
  panelBody.innerHTML = `<div class="save-info">${saved ? `저장 기록: ${saved.game.age}세 ${saved.game.month}월 ${saved.game.week}주 · ${new Date(saved.savedAt).toLocaleString('ko-KR')}` : '저장된 기록이 없습니다.'}</div><div class="save-actions"><button id="saveGame">현재 진행 저장</button><button id="loadGame" ${saved ? '' : 'disabled'}>저장 기록 불러오기</button><button class="danger" id="resetGame">처음부터 시작</button></div>`;
  document.querySelector('#saveGame').addEventListener('click', saveGame);
  document.querySelector('#loadGame').addEventListener('click', loadGame);
  document.querySelector('#resetGame').addEventListener('click', resetGame);
}

function readSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch { return null; }
}

function saveGame() {
  const payload = { savedAt: new Date().toISOString(), game: { ...game }, background: bg.getAttribute('src'), character: character.getAttribute('src') };
  localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
  document.querySelector('#dialogueText').textContent = '현재 진행 상황을 저장했어요.';
  renderSavePanel();
}

function loadGame() {
  const saved = readSave();
  if (!saved) return;
  Object.assign(game, saved.game);
  normalizeStats();
  if(typeof game.autoOutfit!=='boolean')game.autoOutfit=true;
  normalizeInventory();
  document.querySelector('#birthdaySetup').hidden = Boolean(game.birthday);
  if (!Array.isArray(game.dailySchedule) || game.dailySchedule.length !== 7) game.dailySchedule = [null,null,null,null,null,null,null];
  bg.src = saved.background || backgrounds.home;
  applyEquippedOutfit();
  renderHud();
  setTimeout(()=>showHomeGreeting(),350);
  panel.hidden = true;
  document.querySelector('#dialogueText').textContent = '저장한 시점으로 돌아왔어요.';
}

function resetGame() {
  Object.assign(game, { age:9, month:1, week:1, money:1200, health:42, study:35, fatigue:18, items:[], equippedOutfit:null, autoOutfit:true, dailySchedule:[null,null,null,null,null,null,null], birthday:null,currentDate:null,endingDate:null,ended:false, nannyAffinity:50,lastGreetingDate:null, healthiness:76, arithmetic:22, manners:28, arts:18, martial:12, archery:5, riding:3, craft:24, cooking:20, embroidery:15, virtue:36, charm:30, sensitivity:40, medicine:8, commerce:10, reputation:14, stress:12 });
  document.querySelector('#liveChanges').innerHTML='';document.querySelector('#homeGreeting').hidden=true;
  bg.src = backgrounds.home;
  character.src = expressions[0][0];
  renderHud();
  panel.hidden = true;
  document.querySelector('#birthdaySetup').hidden = false;
  document.querySelector('#dialogueText').textContent = '새로운 10년을 시작해 볼까요?';
}

function statBar(key, label) {
  const max = statMaximum(key);
  const value = Math.max(0, Math.min(100, (game[key] / max) * 100));
  const isCondition = key === 'fatigue' || key === 'stress';
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
  const filled = game.dailySchedule.filter(Boolean).length;
  panelBody.innerHTML = `<p class="schedule-help">활동을 누르면 월요일부터 다음 빈 날짜에 들어갑니다. 채운 날짜를 누르면 삭제됩니다.</p><div class="day-grid">${daySlots}</div>${categories}<button class="run-month" id="runWeek" ${filled === 7 ? '' : 'disabled'}>${game.week}주 일정 실행 (${filled}/7)</button>`;
  panelBody.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', () => addDailyAction(button.dataset.action)));
  panelBody.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => clearDailyAction(Number(button.dataset.day))));
  document.querySelector('#runWeek').addEventListener('click', runWeek);
}

function applyShopChanges(change){Object.entries(change).forEach(([key,value])=>{game[key]=clampStat(key,(game[key]||0)+value);});renderHud();}
let marketShoppingActive=false;
let marketMealConsumed=false;
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
function renderShopPanel(tab='food',marketMode=marketShoppingActive){
  normalizeInventory();
  panelTitle.textContent=tab==='food'?'저잣거리 · 주막':'저잣거리 · 한복점';
  const keeper=tab==='food'?{name:'주모',image:'../assets/characters/npcs/shops/tavern-hostess.png',greeting:'어서 오세요. 따뜻한 음식이 준비되어 있답니다.'}:{name:'한복점 주인',image:'../assets/characters/npcs/shops/hanbok-owner.png',greeting:'어서 오세요. 곱게 지은 한복을 천천히 살펴보세요.'};
  const owned=new Set(game.items.filter(item=>typeof item==='object').map(item=>item.id));
  const foodCards=foods.map(food=>`<button class="shop-card visual-card" data-food="${food.id}" ${game.money<food.price||marketMealConsumed?'disabled':''}><img src="../assets/items/food/${food.id}.png" alt="${food.name}"><b>${food.name}</b><span>${food.price}냥</span><small>${marketMealConsumed?'이번 방문에는 이미 식사했어요':`${food.detail}<br>${formatChanges(food.change)}`}</small></button>`).join('');
  const outfitCards=outfits.map(outfit=>`<button class="shop-card outfit-card visual-card ${outfit.age===game.age?'available':''}" data-outfit="${outfit.id}" ${outfit.age!==game.age||owned.has(outfit.id)||game.money<outfit.price?'disabled':''}><img src="../assets/characters/seonhwa/wardrobe/age-${String(outfit.age).padStart(2,'0')}/${outfit.id}.png" alt="${outfit.name}"><b>${outfit.name}</b><span>${outfit.price}냥</span><small>${outfit.age}세 · ${outfit.tone}<br>${formatChanges(outfit.change)}${owned.has(outfit.id)?'<br>구매 완료':''}</small></button>`).join('');
  panelBody.innerHTML=`<div class="shop-greeting"><img src="${keeper.image}" alt="${keeper.name}"><div><b>${keeper.name}</b><p>${keeper.greeting}</p></div></div><div class="shop-money">보유 은전 <b>${game.money.toLocaleString()}냥</b></div>${marketMode?'':`<div class="shop-tabs"><button data-shop-tab="food" class="${tab==='food'?'on':''}">주막</button><button data-shop-tab="outfit" class="${tab==='outfit'?'on':''}">한복점</button></div>`}<h3 class="shop-list-title">${tab==='food'?'음식 메뉴':'한복 상품'}</h3><div class="shop-grid">${tab==='food'?foodCards:outfitCards}</div><button id="shopBack">${marketMode?'저잣거리로 나가기':'일정으로 돌아가기'}</button>`;
  if(!marketMode)panelBody.querySelectorAll('[data-shop-tab]').forEach(button=>button.addEventListener('click',()=>renderShopPanel(button.dataset.shopTab,marketMode)));
  panelBody.querySelectorAll('[data-food]').forEach(button=>button.addEventListener('click',()=>buyFood(button.dataset.food)));
  panelBody.querySelectorAll('[data-outfit]').forEach(button=>button.addEventListener('click',()=>buyOutfit(button.dataset.outfit)));
  document.querySelector('#shopBack').addEventListener('click',()=>{if(marketMode)returnToMarketSelection();else renderSchedulePanel();});
}
function formatChanges(change){return Object.entries(change).map(([key,value])=>`${statLabels[key]||key} ${value>0?'+':''}${value}`).join(' · ');}
async function buyFood(id){const food=foods.find(item=>item.id===id);if(!food||game.money<food.price||marketMealConsumed)return;marketMealConsumed=true;panel.hidden=true;const stage=document.querySelector('#activityStage'),image=document.querySelector('#stageCharacterImage'),character=document.querySelector('#stageCharacter');document.querySelector('#marketExplore').hidden=true;stage.hidden=false;stage.className='activity-stage map-restRoom eating-stage';document.querySelector('#stageMap').src=backgrounds.restRoom;document.querySelector('#stageNpc').hidden=true;document.querySelector('#stageProps').hidden=true;document.querySelector('#stageCaption').textContent=`주막 · ${food.name}`;character.hidden=false;character.className='stage-character pixel-sprite motion-eating';for(const n of [1,2,3,2,1,2,3]){image.src=await outfitActivityFrame(`../assets/characters/seonhwa/age-09/sprites/activities/eating-${n}.png`,game.equippedOutfit);await new Promise(r=>setTimeout(r,320));}stage.hidden=true;game.money-=food.price;applyShopChanges(food.change);document.querySelector('#dialogueText').textContent=`주막에서 ${food.name}을(를) 맛있게 먹었어요. 이번 저잣거리 방문의 식사는 끝났어요.`;showLiveChanges({change:food.change,cost:food.price});panel.hidden=false;renderShopPanel('food',true);}
function buyOutfit(id){normalizeInventory();const outfit=outfits.find(item=>item.id===id);if(!outfit||outfit.age!==game.age||game.money<outfit.price)return;if(game.items.some(item=>item.type==='outfit'&&item.id===id)){document.querySelector('#dialogueText').textContent=`${outfit.name}은(는) 이미 보유하고 있어요.`;renderShopPanel('outfit');return;}game.money-=outfit.price;game.items.push({id:outfit.id,type:'outfit',name:outfit.name,age:outfit.age,tone:outfit.tone,qty:1});game.equippedOutfit=id;applyEquippedOutfit();applyShopChanges(outfit.change);document.querySelector('#dialogueText').textContent=`${outfit.name}을(를) 구입하고 갈아입었어요.`;showLiveChanges({change:outfit.change,cost:outfit.price});renderShopPanel('outfit');}

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
  document.querySelector('#marketConfirmText').textContent=`${type==='food'?'주모':'한복점 주인'}를 선택하시겠습니까?`;
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
  renderSchedulePanel();
}

function clearDailyAction(index) {
  if (!game.dailySchedule[index]) return;
  game.dailySchedule[index] = null;
  renderSchedulePanel();
}

async function runWeek() {
  if (!game.dailySchedule.every(Boolean)) return;
  const selected = game.dailySchedule.map(id => actions.find(item => item.id === id));
  const totalCost = selected.reduce((sum, action) => sum + action.cost, 0);
  if (totalCost > game.money) {
    document.querySelector('#dialogueText').textContent = `이번 주에 ${totalCost.toLocaleString()}냥이 필요해요. 일정을 다시 짜보자.`;
    panel.hidden = true;
    return;
  }
  const completedWeek = game.week;
  panel.hidden = true;
  const weeklyChange = await playWeeklySchedule(selected);
  game.money -= totalCost;
  Object.entries(weeklyChange).forEach(([key,value])=>game[key]=clampStat(key,(game[key]||0)+value));
  game.homeReaction=null;
  advanceGameDate(7);
  const counts = selected.reduce((map, action) => (map[action.name]=(map[action.name]||0)+1,map),{});
  const summary = Object.entries(counts).map(([name,count]) => count > 1 ? `${name} ${count}일` : name).join(' · ');
  document.querySelector('#dialogueText').textContent = `${completedWeek}주 일정(${summary})을 마쳤어요.`;
  game.dailySchedule = [null,null,null,null,null,null,null];
  bg.src = backgrounds.home;
  applyEquippedOutfit();
  renderHud();
  panel.hidden = true;
  if (game.ended) showEnding();
}

function isoDate(date){ const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
function addYears(date, years){ const next=new Date(date); next.setFullYear(next.getFullYear()+years); return next; }
function startWithBirthday(){
  const value=document.querySelector('#birthdayInput').value;
  const characterName=document.querySelector('#characterNameInput').value.trim();
  const nannyName=document.querySelector('#nannyNameInput').value.trim();
  if(!characterName||!nannyName){document.querySelector('#birthdayTitle').textContent='두 이름을 모두 지어주세요';return;}
  if(value<'1990-01-01'||value>'1990-12-31') return;
  const birth=new Date(`${value}T00:00:00`);
  const start=addYears(birth,9);
  const ending=addYears(birth,18); ending.setDate(ending.getDate()+1);
  const month=birth.getMonth()+1; const birthSeason=seasonForMonth(month); const element=['금','수','목','화','토'][(birth.getMonth()+birth.getDate())%5];
  Object.assign(game,{characterName,nannyName,birthday:value,currentDate:isoDate(start),endingDate:isoDate(ending),age:9,month,season:birthSeason,birthSeason,element,week:1,ended:false,birthdayCount:1});
  document.querySelector('#birthdaySetup').hidden=true;
  document.querySelector('#dialogueText').textContent=`${birthSeason}에 태어난 ${element} 기운의 아이. ${characterName}의 아홉 번째 생일부터 이야기를 시작해요.`;
  renderHud();
  setTimeout(()=>showHomeGreeting(),250);
}
function advanceGameDate(days){
  if(!game.currentDate)return;
  const date=new Date(`${game.currentDate}T00:00:00`); date.setDate(date.getDate()+days);
  const ending=new Date(`${game.endingDate}T00:00:00`);
  if(date>=ending){ date.setTime(ending.getTime()); game.ended=true; }
  game.currentDate=isoDate(date); game.month=date.getMonth()+1; game.season=seasonForMonth(game.month); game.week=Math.floor((date.getDate()-1)/7)+1;
  const birth=new Date(`${game.birthday}T00:00:00`); game.age=date.getFullYear()-birth.getFullYear()-((date.getMonth()<birth.getMonth()||(date.getMonth()===birth.getMonth()&&date.getDate()<birth.getDate()))?1:0);
  if(game.autoOutfit)updateAutoOutfit();
}
function seasonForMonth(month){ return month>=3&&month<=5?'봄':month>=6&&month<=8?'여름':month>=9&&month<=11?'가을':'겨울'; }
function showEnding(){
  panel.hidden=false; panelTitle.textContent=`${game.characterName || '아이'}의 성장 기록`;
  panelBody.innerHTML=`<div class="ending-card"><h2>마지막 생일 다음 날</h2><p>${game.age}세 · ${game.season}</p><p>아홉 살 생일부터 이어진 ${game.characterName || '아이'}의 성장 이야기가 완성되었습니다.</p><button id="endingRestart">새로운 생일로 시작</button></div>`;
  document.querySelector('#endingRestart').addEventListener('click',resetGame);
}
function renderPrologue(){
  const scene=prologueScenes[prologueIndex], wrap=document.querySelector('#prologue'), image=document.querySelector('#prologueImage');
  wrap.hidden=false; wrap.classList.toggle('outdoor-rain',Boolean(scene.rain)); wrap.classList.add('scene-change'); clearTimeout(prologueTimer);
  updatePrologueAudio(Boolean(scene.rain));
  setTimeout(()=>{image.src=scene.image;image.alt=scene.alt;document.querySelector('#prologueChapter').textContent=scene.id?`서장 ${scene.id} · ${scene.chapter}`:scene.chapter;document.querySelector('#prologueText').innerHTML=`${scene.text}${scene.dialogue?`<br><em>${scene.dialogue}</em>`:''}`;document.querySelector('#prologueProgress').innerHTML=prologueScenes.map((_,i)=>`<i class="${i===prologueIndex?'on':''}"></i>`).join('');document.querySelector('#prologueBack').disabled=prologueIndex===0;document.querySelector('#prologueNext').textContent=prologueIndex===prologueScenes.length-1?'이름 정하기':'다음';wrap.classList.remove('scene-change');},220);
  prologueTimer=setTimeout(nextPrologue,5200);
}
function nextPrologue(){ if(prologueIndex<prologueScenes.length-1){prologueIndex++;renderPrologue();}else closePrologue(); }
function previousPrologue(){ if(prologueIndex>0){prologueIndex--;renderPrologue();} }
function closePrologue(){clearTimeout(prologueTimer);fadeAudio(document.querySelector('#prologueMusic'),0,500);stopRain();document.querySelector('#prologue').hidden=true;document.querySelector('#birthdaySetup').hidden=false;}
function replayPrologue(){prologueIndex=0;document.querySelector('#birthdaySetup').hidden=true;renderPrologue();}
function ensureRainAudio(){
  if(rainAudio)return rainAudio;
  const Ctx=window.AudioContext||window.webkitAudioContext,ctx=new Ctx(),seconds=2,buffer=ctx.createBuffer(1,ctx.sampleRate*seconds,ctx.sampleRate),data=buffer.getChannelData(0);
  let last=0;for(let i=0;i<data.length;i++){const white=Math.random()*2-1;last=last*.985+white*.15;data[i]=last*(.35+Math.random()*.3);}
  const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();source.buffer=buffer;source.loop=true;filter.type='highpass';filter.frequency.value=650;gain.gain.value=0;source.connect(filter).connect(gain).connect(ctx.destination);source.start();rainAudio={ctx,source,gain};return rainAudio;
}
function fadeAudio(audio,target,ms){if(!audio)return;const start=audio.volume,steps=12;let n=0;clearInterval(audio._fade);audio._fade=setInterval(()=>{n++;audio.volume=start+(target-start)*(n/steps);if(n>=steps){clearInterval(audio._fade);if(target===0)audio.pause();}},ms/steps);}
function stopRain(){if(!rainAudio)return;rainAudio.gain.gain.cancelScheduledValues(rainAudio.ctx.currentTime);rainAudio.gain.gain.linearRampToValueAtTime(0,rainAudio.ctx.currentTime+.5);}
function updatePrologueAudio(isRain){
  if(!prologueSoundOn)return;const music=document.querySelector('#prologueMusic');if(music.paused){music.volume=0;music.play().catch(()=>{});fadeAudio(music,.42,700);}const rain=ensureRainAudio();rain.ctx.resume();rain.gain.gain.cancelScheduledValues(rain.ctx.currentTime);rain.gain.gain.linearRampToValueAtTime(isRain?.34:0,rain.ctx.currentTime+.65);
}
function togglePrologueSound(){prologueSoundOn=!prologueSoundOn;const button=document.querySelector('#prologueSound');button.textContent=prologueSoundOn?'소리 끄기':'소리 켜기';button.setAttribute('aria-pressed',String(prologueSoundOn));if(prologueSoundOn)updatePrologueAudio(Boolean(prologueScenes[prologueIndex].rain));else{fadeAudio(document.querySelector('#prologueMusic'),0,400);stopRain();}}

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
  const simulated={fatigue:game.fatigue,stress:game.stress};
  const weeklyChange={};
  const dayNames = ['월요일','화요일','수요일','목요일','금요일','토요일','일요일'];
  document.querySelector('#homeGreeting').hidden=true;
  phone.classList.remove('greeting-active');
  phone.classList.add('playing');
  playback.hidden = false;
  stage.hidden = false;
  stageCharacterImage.src = spriteFrames.down[1];
  for (let index = 0; index < selected.length; index += 1) {
    const action = selected[index];
    const presentation = actionPresentation[action.id]||actionPresentation.rest;
    stage.hidden=false;stageCharacter.hidden=false;stageProps.hidden=false;
    setScheduleDialogue(action,'start',index);
    const dailyOutfit=game.autoOutfit?updateAutoOutfit(action.id):game.equippedOutfit;
    document.querySelector('#playbackDay').textContent = dayNames[index];
    document.querySelector('#playbackAction').textContent = action.name;
    document.querySelectorAll('#playbackWeek span').forEach((day,dayIndex)=>{day.classList.toggle('done',dayIndex<index);day.classList.toggle('current',dayIndex===index);});
    document.querySelectorAll('#playbackWeek span').forEach((day,dayIndex)=>{day.classList.toggle('done',dayIndex<index);day.classList.toggle('current',dayIndex===index);});
    const outfitName=outfits.find(item=>item.id===dailyOutfit)?.name;
    document.querySelector('#stageCaption').textContent = `${dayNames[index]} · ${action.name}${outfitName?` · ${outfitName}`:''}`;
    document.querySelector('#playbackProgress').style.width = `${((index + 1) / 7) * 100}%`;
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
      stageMap.src=backgrounds.market;
      document.querySelector('#stageCaption').textContent=`${dayNames[index]} · 저잣거리 · 좌우로 움직여 가게를 선택하세요`;
      marketShoppingActive=true;
      await exploreMarket();
      marketShoppingActive=false;
    }else if(action.id==='vacation'){
      const prize=awardVacationIllustration();
      stage.hidden=true;stageNpc.hidden=true;stageProps.hidden=true;stageCharacter.hidden=true;
      const metSomeone=await playVacationScene(prize,index);
      document.querySelector('#dialogueText').textContent=metSomeone?`바캉스에서 「${prize.name}」 일러스트와 ${metSomeone.name}의 인연 추억을 얻었어요.`:`바캉스에서 「${prize.name}」 일러스트를 획득했어요.`;
    }else await animateActivitySprite(stageCharacterImage,presentation.motion,presentation.activity,stageNpcImage,presentation.npc,dailyOutfit);
    const condition=['shopping','vacation'].includes(action.id)?null:conditionEvent(simulated.fatigue,simulated.stress,index);
    let outcome=judgeActivityOutcome(action,simulated.fatigue,simulated.stress);
    if(condition==='mistake')outcome='mistake';
    else if(condition==='drowsy'&&outcome!=='mistake')outcome='struggle';
    const resolvedChange=resolvedActivityChange(action,outcome);
    const resolvedAction={...action,change:resolvedChange};
    if(condition){
      setScheduleDialogue(action,condition,index);
      await animateConditionEvent(stageCharacter,conditionCue,condition);
    }
    setScheduleDialogue(action,outcome,index);
    stageCharacter.className = `stage-character pixel-sprite ${presentation.motion}`;
    renderActivityGauges(resolvedAction);
    showLiveChanges(resolvedAction);
    const moneyText = action.cost > 0 ? `은전 -${action.cost}냥` : action.cost < 0 ? `은전 +${-action.cost}냥` : '비용 없음';
    const resultSummary=Object.entries(resolvedChange).filter(([,value])=>value!==0).map(([key,value])=>`${statLabels[key]||key} ${value>0?'+':''}${value}`).join(' · ');
    dayResult.innerHTML = `<b>${action.name} · ${outcomeLabels[outcome]}</b><span>${resultSummary||'능력치 변화 없음'}<br>${moneyText}</span>`;
    if(action.id!=='vacation'){
      dayResult.hidden = false;
      await new Promise(resolve => setTimeout(resolve, 900));
      dayResult.hidden = true;
    }
    Object.entries(resolvedChange).forEach(([key,value])=>weeklyChange[key]=(weeklyChange[key]||0)+value);
    simulated.fatigue=clampStat('fatigue',simulated.fatigue+(resolvedChange.fatigue||0));
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
  return weeklyChange;
}

document.querySelector('#marketEnter').addEventListener('click',event=>enterMarketShop(event.currentTarget.dataset.shop));
document.querySelectorAll('[data-market-shop]').forEach(button=>button.addEventListener('click',event=>{event.preventDefault();askMarketShop(button.dataset.marketShop);}));
document.querySelector('#marketConfirmNo').addEventListener('click',closeMarketConfirm);
document.querySelector('#marketConfirmYes').addEventListener('click',()=>{const type=marketSelection;document.querySelector('#marketConfirm').hidden=true;enterMarketShop(type);});
document.querySelector('#marketFinish').addEventListener('click',finishMarket);
document.querySelector('#marketFinish').addEventListener('pointerup',finishMarket);
window.addEventListener('keydown',event=>{if(document.querySelector('#marketExplore').hidden)return;if(event.key==='ArrowLeft')selectMarketShop('food');if(event.key==='ArrowRight')selectMarketShop('outfit');if(event.key==='Enter'&&marketSelection)enterMarketShop(marketSelection);});
bg.addEventListener('load', updateImageState);
document.querySelector('#wardrobeButton')?.addEventListener('click',renderWardrobe);
bg.addEventListener('error', updateImageState);
character.addEventListener('load', updateImageState);
character.addEventListener('error', updateImageState);
document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel)));
document.querySelector('#closePanel').addEventListener('click', () => {if(marketShoppingActive)returnToMarketSelection();else panel.hidden=true;});
document.querySelector('#saveMenu').addEventListener('click', () => openPanel('save'));
document.querySelector('#startGame').addEventListener('click', startWithBirthday);
document.querySelector('#prologueNext').addEventListener('click',nextPrologue);
document.querySelector('#prologueBack').addEventListener('click',previousPrologue);
document.querySelector('#prologueSound').addEventListener('click',togglePrologueSound);
document.querySelector('#prologueSkip').addEventListener('click',closePrologue);
document.querySelector('#storyReplay').addEventListener('click',replayPrologue);
renderHud();
updateHomeCharacter();
updateImageState();
renderPrologue();
