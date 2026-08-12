const bg = document.querySelector('.background');
const character = document.querySelector('#character');
const missing = document.querySelector('#missing');
const loadStatus = document.querySelector('#loadStatus');
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

const game = { age: 9, month: 1, week: 1, season:'봄', money: 1200, health: 42, study: 35, fatigue: 18, items: [], dailySchedule: [null,null,null,null,null,null,null], birthday:null, currentDate:null, endingDate:null, ended:false, birthdayCount:0, element:null, birthSeason:null, memory:0, truth:0, exposure:0, guardianTrust:50 };
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
let expressionIndex = -1;
const backgrounds = {
  home: '../assets/backgrounds/home/home-room-morning.webp',
  seodang: '../assets/backgrounds/seodang/seodang-day.webp',
  market: '../assets/backgrounds/market/market-day.webp',
  pharmacy: '../assets/backgrounds/pharmacy/pharmacy-day.webp'
};
const SAVE_KEY = 'seonhwa-princess-mvp-save-v1';
const actionPresentation = {
  reading: { motion:'motion-study', location:'seodang' }, arithmetic: { motion:'motion-study', location:'seodang' },
  manners: { motion:'motion-bow', location:'seodang' }, errand: { motion:'motion-walk', location:'market' },
  sweeping: { motion:'motion-sweep', location:'market' }, herbs: { motion:'motion-gather', location:'pharmacy' },
  rest: { motion:'motion-rest', location:'home' }
};
const actions = [
  { id: 'reading', category: '교육', name: '글읽기', cost: 80, summary: '학문 +6 · 피로 +4', change: { study: 6, fatigue: 4 } },
  { id: 'arithmetic', category: '교육', name: '셈하기', cost: 70, summary: '학문 +4 · 피로 +3', change: { study: 4, fatigue: 3 } },
  { id: 'manners', category: '교육', name: '예절 배우기', cost: 90, summary: '학문 +2 · 피로 +3', change: { study: 2, fatigue: 3 } },
  { id: 'errand', category: '아르바이트', name: '장터 심부름', cost: -60, summary: '체력 +3 · 피로 +6 · 60냥 획득', change: { health: 3, fatigue: 6 } },
  { id: 'sweeping', category: '아르바이트', name: '마당 쓸기', cost: -40, summary: '체력 +2 · 피로 +5 · 40냥 획득', change: { health: 2, fatigue: 5 } },
  { id: 'herbs', category: '아르바이트', name: '약초 줍기', cost: -50, summary: '체력 +2 · 학문 +1 · 피로 +6', change: { health: 2, study: 1, fatigue: 6 } },
  { id: 'rest', category: '휴식', name: '집에서 휴식', cost: 0, summary: '피로 -10 · 체력 +2', change: { health: 2, fatigue: -10 } }
];

function updateImageState() {
  if (bg.complete && bg.naturalWidth) {
    loadStatus.textContent = `배경 로드 성공 · ${bg.naturalWidth}×${bg.naturalHeight}`;
  } else if (bg.complete) {
    loadStatus.textContent = '배경 로드 실패';
    loadStatus.style.background = '#8b2f2f';
  }
  const characterReady = character.complete && character.naturalWidth > 0;
  character.hidden = !characterReady;
  missing.hidden = characterReady;
}

function renderHud() {
  const date = game.currentDate ? new Date(`${game.currentDate}T00:00:00`) : null;
  document.querySelector('#dateLabel').textContent = date ? `${game.age}세 · ${game.season} ${game.week}주` : '생일 설정 전';
  document.querySelector('#moneyLabel').textContent = `${game.money.toLocaleString()}냥`;
  document.querySelector('#healthLabel').textContent = `체력 ${game.health}`;
  document.querySelector('#studyLabel').textContent = `학문 ${game.study}`;
  document.querySelector('#fatigueLabel').textContent = `피로 ${game.fatigue}`;
}

function openPanel(type) {
  panel.hidden = false;
  if (type === 'schedule') {
    renderSchedulePanel();
  } else if (type === 'status') {
    panelTitle.textContent = '선화의 상태';
    panelBody.innerHTML = `<div class="status-summary"><span>${game.age}세 · ${game.season} ${game.week}주</span><b>${game.money.toLocaleString()}냥</b></div>${statGroups.map(group => `<section class="stat-group"><h3>${group.title}</h3>${group.stats.map(([key,label]) => statBar(key,label)).join('')}</section>`).join('')}`;
  } else if (type === 'inventory') {
    panelTitle.textContent = '소지품';
    panelBody.innerHTML = game.items.length ? game.items.map(item => `<p>${item}</p>`).join('') : '<p class="empty-note">아직 가진 물건이 없습니다.<br>생일이나 명절 이벤트에서 얻을 수 있어요.</p>';
  } else {
    renderSavePanel();
  }
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
  document.querySelector('#birthdaySetup').hidden = Boolean(game.birthday);
  if (!Array.isArray(game.dailySchedule) || game.dailySchedule.length !== 7) game.dailySchedule = [null,null,null,null,null,null,null];
  bg.src = saved.background || backgrounds.home;
  character.src = saved.character || expressions[0][0];
  renderHud();
  panel.hidden = true;
  document.querySelector('#dialogueText').textContent = '저장한 시점으로 돌아왔어요.';
}

function resetGame() {
  Object.assign(game, { age:9, month:1, week:1, money:1200, health:42, study:35, fatigue:18, items:[], dailySchedule:[null,null,null,null,null,null,null], birthday:null,currentDate:null,endingDate:null,ended:false, healthiness:76, arithmetic:22, manners:28, arts:18, martial:12, archery:5, riding:3, craft:24, cooking:20, embroidery:15, virtue:36, charm:30, sensitivity:40, medicine:8, commerce:10, reputation:14, stress:12 });
  bg.src = backgrounds.home;
  character.src = expressions[0][0];
  renderHud();
  panel.hidden = true;
  document.querySelector('#birthdaySetup').hidden = false;
  document.querySelector('#dialogueText').textContent = '새로운 10년을 시작해 볼까요?';
}

function statBar(key, label) {
  const max = ['fatigue','stress','health','healthiness'].includes(key) ? 100 : 999;
  const value = Math.max(0, Math.min(100, (game[key] / max) * 100));
  const isCondition = key === 'fatigue' || key === 'stress';
  return `<div class="stat-row"><span>${label}</span><div class="stat-track"><i class="${isCondition ? 'condition' : ''}" style="width:${value}%"></i></div><b>${game[key]}</b></div>`;
}

function renderSchedulePanel() {
  panelTitle.textContent = `${game.season} ${game.week}주 일정`;
  if (!Array.isArray(game.dailySchedule) || game.dailySchedule.length !== 7) game.dailySchedule = [null,null,null,null,null,null,null];
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
  await playWeeklySchedule(selected);
  game.money -= totalCost;
  selected.forEach(action => Object.entries(action.change).forEach(([key, value]) => game[key] = Math.max(0, game[key] + value)));
  if (game.fatigue >= 40) character.src = '../assets/characters/seonhwa/age-09/fullbody-expressions/seonhwa-age09-fullbody-tired.png';
  const lastAction = selected[selected.length - 1];
  bg.src = backgrounds[actionPresentation[lastAction.id].location];
  advanceGameDate(7);
  const counts = selected.reduce((map, action) => (map[action.name]=(map[action.name]||0)+1,map),{});
  const summary = Object.entries(counts).map(([name,count]) => count > 1 ? `${name} ${count}일` : name).join(' · ');
  document.querySelector('#dialogueText').textContent = `${completedWeek}주 일정(${summary})을 마쳤어요.`;
  game.dailySchedule = [null,null,null,null,null,null,null];
  renderHud();
  panel.hidden = true;
  if (game.ended) showEnding();
}

function isoDate(date){ const y=date.getFullYear(); const m=String(date.getMonth()+1).padStart(2,'0'); const d=String(date.getDate()).padStart(2,'0'); return `${y}-${m}-${d}`; }
function addYears(date, years){ const next=new Date(date); next.setFullYear(next.getFullYear()+years); return next; }
function startWithBirthday(){
  const value=document.querySelector('#birthdayInput').value;
  if(value<'1990-01-01'||value>'1990-12-31') return;
  const birth=new Date(`${value}T00:00:00`);
  const start=addYears(birth,9);
  const ending=addYears(birth,18); ending.setDate(ending.getDate()+1);
  const month=birth.getMonth()+1; const birthSeason=seasonForMonth(month); const element=['금','수','목','화','토'][(birth.getMonth()+birth.getDate())%5];
  Object.assign(game,{birthday:value,currentDate:isoDate(start),endingDate:isoDate(ending),age:9,month,season:birthSeason,birthSeason,element,week:1,ended:false,birthdayCount:1});
  document.querySelector('#birthdaySetup').hidden=true;
  document.querySelector('#dialogueText').textContent=`${birthSeason}에 태어난 ${element} 기운의 아이. 선화의 아홉 번째 생일부터 이야기를 시작해요.`;
  renderHud();
}
function advanceGameDate(days){
  if(!game.currentDate)return;
  const date=new Date(`${game.currentDate}T00:00:00`); date.setDate(date.getDate()+days);
  const ending=new Date(`${game.endingDate}T00:00:00`);
  if(date>=ending){ date.setTime(ending.getTime()); game.ended=true; }
  game.currentDate=isoDate(date); game.month=date.getMonth()+1; game.season=seasonForMonth(game.month); game.week=Math.floor((date.getDate()-1)/7)+1;
  const birth=new Date(`${game.birthday}T00:00:00`); game.age=date.getFullYear()-birth.getFullYear()-((date.getMonth()<birth.getMonth()||(date.getMonth()===birth.getMonth()&&date.getDate()<birth.getDate()))?1:0);
}
function seasonForMonth(month){ return month>=3&&month<=5?'봄':month>=6&&month<=8?'여름':month>=9&&month<=11?'가을':'겨울'; }
function showEnding(){
  panel.hidden=false; panelTitle.textContent='선화의 성장 기록';
  panelBody.innerHTML=`<div class="ending-card"><h2>마지막 생일 다음 날</h2><p>${game.age}세 · ${game.season}</p><p>아홉 살 생일부터 이어진 선화의 성장 이야기가 완성되었습니다.</p><button id="endingRestart">새로운 생일로 시작</button></div>`;
  document.querySelector('#endingRestart').addEventListener('click',resetGame);
}
function renderPrologue(){
  const scene=prologueScenes[prologueIndex], wrap=document.querySelector('#prologue'), image=document.querySelector('#prologueImage');
  wrap.hidden=false; wrap.classList.toggle('outdoor-rain',Boolean(scene.rain)); wrap.classList.add('scene-change'); clearTimeout(prologueTimer);
  setTimeout(()=>{image.src=scene.image;image.alt=scene.alt;document.querySelector('#prologueChapter').textContent=scene.id?`서장 ${scene.id} · ${scene.chapter}`:scene.chapter;document.querySelector('#prologueText').innerHTML=`${scene.text}${scene.dialogue?`<br><em>${scene.dialogue}</em>`:''}`;document.querySelector('#prologueProgress').innerHTML=prologueScenes.map((_,i)=>`<i class="${i===prologueIndex?'on':''}"></i>`).join('');document.querySelector('#prologueNext').textContent=prologueIndex===prologueScenes.length-1?'생일 정하기':'다음';wrap.classList.remove('scene-change');},220);
  prologueTimer=setTimeout(nextPrologue,5200);
}
function nextPrologue(){ if(prologueIndex<prologueScenes.length-1){prologueIndex++;renderPrologue();}else closePrologue(); }
function closePrologue(){clearTimeout(prologueTimer);document.querySelector('#prologue').hidden=true;document.querySelector('#birthdaySetup').hidden=false;}
function replayPrologue(){prologueIndex=0;document.querySelector('#birthdaySetup').hidden=true;renderPrologue();}

async function playWeeklySchedule(selected) {
  const phone = document.querySelector('.phone');
  const playback = document.querySelector('#activityPlayback');
  const stage = document.querySelector('#activityStage');
  const stageCharacter = document.querySelector('#stageCharacter');
  const stageCharacterImage = document.querySelector('#stageCharacterImage');
  const dayResult = document.querySelector('#dayResult');
  const dayNames = ['월요일','화요일','수요일','목요일','금요일','토요일','일요일'];
  phone.classList.add('playing');
  playback.hidden = false;
  stage.hidden = false;
  stageCharacterImage.src = character.src;
  for (let index = 0; index < selected.length; index += 1) {
    const action = selected[index];
    const presentation = actionPresentation[action.id];
    document.querySelector('#playbackDay').textContent = dayNames[index];
    document.querySelector('#playbackAction').textContent = action.name;
    document.querySelector('#stageCaption').textContent = `${dayNames[index]} · ${action.name}`;
    document.querySelector('#playbackProgress').style.width = `${((index + 1) / 7) * 100}%`;
    bg.src = backgrounds[presentation.location];
    stageCharacter.className = `stage-character ${presentation.motion}`;
    await new Promise(resolve => setTimeout(resolve, 850));
    stageCharacter.className = 'stage-character';
    const moneyText = action.cost > 0 ? `은전 -${action.cost}냥` : action.cost < 0 ? `은전 +${-action.cost}냥` : '비용 없음';
    dayResult.innerHTML = `<b>${action.name} 완료</b><span>${action.summary}<br>${moneyText}</span>`;
    dayResult.hidden = false;
    await new Promise(resolve => setTimeout(resolve, 430));
    dayResult.hidden = true;
  }
  playback.hidden = true;
  stage.hidden = true;
  phone.classList.remove('playing');
}

bg.addEventListener('load', updateImageState);
bg.addEventListener('error', updateImageState);
character.addEventListener('load', updateImageState);
character.addEventListener('error', updateImageState);
document.querySelectorAll('[data-panel]').forEach(button => button.addEventListener('click', () => openPanel(button.dataset.panel)));
document.querySelector('#closePanel').addEventListener('click', () => panel.hidden = true);
document.querySelector('#saveMenu').addEventListener('click', () => openPanel('save'));
document.querySelector('#startGame').addEventListener('click', startWithBirthday);
document.querySelector('#prologueNext').addEventListener('click',nextPrologue);
document.querySelector('#prologueSkip').addEventListener('click',closePrologue);
document.querySelector('#storyReplay').addEventListener('click',replayPrologue);
document.querySelector('#characterSlot').addEventListener('click', () => {
  expressionIndex = (expressionIndex + 1) % expressions.length;
  const [file, label] = expressions[expressionIndex];
  character.src = file;
  document.querySelector('#expressionPreview').hidden = true;
  document.querySelector('#dialogueText').textContent = `선화의 ${label} 표정이에요.`;
});

renderHud();
updateImageState();
renderPrologue();
