import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=readFileSync(join(root,'src','app.js'),'utf8');
const css=readFileSync(join(root,'src','schedule.css'),'utf8');

const chains=[
  ['sweeping','houseclean','farmwork','woodwork','masonry'],
  ['childcare','tutoring'],
  ['kitchenhelp','innhelp'],
  ['herbs','clinichelp'],
  ['loomwork','sewing'],
  ['errand','ferryhelp','merchanthelp'],
  ['copying','accounting']
];

assert.ok(app.includes('const jobUpgradeChains=['),'아르바이트 업그레이드 계보가 필요합니다.');
for(const chain of chains)for(const id of chain)assert.ok(app.includes(`'${id}'`),`${id}가 업그레이드 계보에 있어야 합니다.`);
assert.ok(app.includes('function visibleJobActions(){return jobUpgradeChains.map(activeJobInChain).filter(Boolean);}'),'계보별로 현재 가능한 최고 단계만 표시해야 합니다.');
assert.ok(app.includes("activeScheduleCategory==='아르바이트'?visibleJobActions()"),'아르바이트 목록은 업그레이드 결과만 보여야 합니다.');
assert.ok(app.includes('game.dailySchedule=game.dailySchedule.map(id=>{const chain=jobChainFor(id)'),'기존 세이브 일정은 현재 상위 단계로 변환되어야 합니다.');
assert.ok(app.includes("chain.slice(0,chain.indexOf(active.id))"),'하위 단계 숙련도는 상위 단계로 승계되어야 합니다.');
assert.match(app,/id:'woodwork'.*unlockStats:\{strength:120,sense:80\}/s);
assert.match(app,/id:'masonry'.*unlockStats:\{health:180,strength:180\}/s);
assert.match(app,/id: 'innhelp'.*unlockStats:\{speech:100,health:90\}/s);
assert.match(app,/id:'ferryhelp'.*unlockStats:\{health:150,speech:100,agility:100\}/s);
assert.match(app,/id: 'accounting'.*unlockStats:\{sense:300,intelligence:250\}/s);
assert.match(app,/id: 'sewing'.*unlockStats:\{sense:140,sensitivity:100\}/s);
assert.ok(app.includes('function jobUpgradeHint(action)'),'다음 단계와 해금 조건을 계산해야 합니다.');
assert.ok(app.includes('class="job-upgrade-hint"'),'아르바이트 카드에 다음 단계 조건을 표시해야 합니다.');
assert.ok(css.includes('.job-upgrade-category .compact-schedule-grid{grid-template-columns:repeat(2'),'모바일에서 해금 조건을 읽을 수 있도록 두 열로 배치해야 합니다.');

console.log('PASS: 아르바이트 7계보·스탯 해금·숙련도 승계');
