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
if(!app.includes('purchasedGoods:[]'))throw new Error('방문상점 별도 구매 기록 누락');
if(app.includes("game.items.push({id:good.id"))throw new Error('방문상점 상품이 소지품에 보관됨');
const goodsSection=app.slice(app.indexOf('const generalGoods = ['),app.indexOf('const outfits = ['));
const goodsCount=(goodsSection.match(/\{id:'/g)||[]).length;
if(goodsCount!==50)throw new Error(`방문상점 상품 수 오류: ${goodsCount}/50`);
if(!app.includes('function prepareVisitShopStock()'))throw new Error('방문별 무작위 진열 준비 로직 누락');
if(!app.includes('eligible.slice(0,10)'))throw new Error('방문상점 10종 제한 누락');
if(app.includes('repeatable:true'))throw new Error('반복 구매 가능한 상품이 남아 있음');
if(!app.includes('game.purchasedGoods.includes(id)'))throw new Error('구매 상품 재등장 방지 누락');
if(!app.includes('let visitShopPurchaseMade=false'))throw new Error('방문당 구매 상태 누락');
if(!app.includes('good||visitShopPurchaseMade||game.money'))throw new Error('방문당 1개 구매 제한 누락');
if(!app.includes('visitShopPurchaseMade=true'))throw new Error('방문 구매 완료 처리 누락');

console.log('PASS: 방문상점 50종·무작위 10종·방문당 1개·중복 구매 방지, 신규 아르바이트 9종 연결');
