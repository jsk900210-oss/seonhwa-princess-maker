import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
const jobs=['farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','ferryhelp','merchanthelp'];
for(const id of jobs){
  const asset=path.join(root,'assets/backgrounds/pixel-jobs',`${id}.webp`);
  if(!fs.existsSync(asset)||fs.statSync(asset).size<10000)throw new Error(`전용 직업 배경 누락 또는 손상: ${id}`);
  for(let frame=1;frame<=3;frame++){
    const sprite=path.join(root,'assets/characters/seonhwa/job-actions',`${id}-v2-${frame}.png`);
    if(!fs.existsSync(sprite)||fs.statSync(sprite).size<5000)throw new Error(`전용 직업 동작 누락 또는 손상: ${id}-${frame}`);
  }
  if(!app.includes(`location:'${id.replace('work','Job').replace('childcare','childcareJob').replace('kitchenhelp','kitchenJob').replace('woodJob','woodworkJob').replace('loomJob','loomJob').replace('masonry','masonryJob').replace('clinichelp','clinicJob').replace('ferryhelp','ferryJob').replace('merchanthelp','merchantJob')}'`)){
    const expected={farmwork:'farmJob',childcare:'childcareJob',kitchenhelp:'kitchenJob',woodwork:'woodworkJob',loomwork:'loomJob',masonry:'masonryJob',clinichelp:'clinicJob',ferryhelp:'ferryJob',merchanthelp:'merchantJob'}[id];
    if(!app.includes(`location:'${expected}'`))throw new Error(`전용 직업 장면 연결 누락: ${id}`);
  }
}
if(!app.includes("const activityRankNames=['견습','숙련','달인']"))throw new Error('3단계 숙련 명칭 누락');
if(!app.includes('successes>=30?2:successes>=10?1:0'))throw new Error('성공 횟수 승급 기준 누락');
if(!app.includes("[1,1.25,1.6][activityRank(action.id)]"))throw new Error('숙련별 보수 배율 누락');
if(!app.includes('progress.perfectStreak%3!==0'))throw new Error('연속 대성공 보상 기준 누락');
if(!app.includes('masteryJobs'))throw new Error('직업 숙련 엔딩 반영 누락');
if(!app.includes('const delay=dedicatedJob?[360,300,240][masteryRank]'))throw new Error('전용 직업 숙련별 프레임 속도 누락');
if(!app.includes('currentRank>previousRank?activityRankNames[currentRank]:null'))throw new Error('10회·30회 성공 승급 알림 누락');
if(!app.includes('progressReward.rankUp?` · ${progressReward.rankUp} 승급!`'))throw new Error('일정 결과의 승급 표시 누락');
if(!app.includes("if(current>=30)return {label:'달인 완성',percent:100}"))throw new Error('일정 카드 달인 진행도 누락');
if(!app.includes('class="mastery-meter"'))throw new Error('일정 카드 숙련 진행 바 누락');
for(const id of ['swordsmanship','spellcraft'])if(!app.includes(`id:'${id}'`))throw new Error(`신규 교육 누락: ${id}`);
console.log('PASS: 전용 직업 장면 9종, 3단계 숙련·보수·연속 대성공·엔딩 반영, 검술·술법 교육');
