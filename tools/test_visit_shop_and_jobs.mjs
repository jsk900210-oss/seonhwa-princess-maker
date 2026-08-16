import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../src/index.html',import.meta.url),'utf8');
const requiredGoods=['wooden-doll','basic-book','poetry-book','ceramic-cup','herbal-pill','guardian-bell','coral-norigae','jade-hairpin'];
const requiredJobs=['farmwork','childcare','kitchenhelp','woodwork','loomwork','masonry','clinichelp','ferryhelp','merchanthelp'];

for(const id of requiredGoods)if(!app.includes(`id:'${id}'`))throw new Error(`방문상점 누락: ${id}`);
for(const id of requiredJobs)if(!app.includes(`id:'${id}'`))throw new Error(`아르바이트 누락: ${id}`);
if(!html.includes('data-panel="shop"'))throw new Error('방문상점 홈 버튼 누락');
if(!app.includes("renderVisitShop()"))throw new Error('방문상점 렌더링 연결 누락');
if(!app.includes('errand-character-v4-'))throw new Error('장터 심부름 기존 v4 프레임 복구 누락');
if(!app.includes("restActivity==='tea'?' rest-tea':''"))throw new Error('차 마시기 전용 표시 영역 누락');

console.log('PASS: 방문상점 8종, 신규 아르바이트 9종, 장터·차 휴식 복구 연결');
