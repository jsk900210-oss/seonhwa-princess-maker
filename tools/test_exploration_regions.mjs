import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../src/exploration-rules.js',import.meta.url),'utf8'),ctx);
const api=ctx.SeonhwaExploration;
assert.equal(new Set(api.regions.map(r=>r.id)).size,4);
const weak={strength:20,stress:0},strong={strength:300,combatSkill:200,combatAttack:100,combatDefense:50,stress:0};
for(const region of api.regions){
 for(const point of [region.chest,region.monster])assert.ok(point.every(n=>n>=0&&n<=4));
 assert.ok(api.combat(strong,region,{},0).chance>api.combat(weak,region,{},0).chance);
 assert.ok(api.combat(strong,region,{},0).chance>=api.combat({...strong,stress:100},region,{},0).chance);
 assert.equal(api.combat(weak,region,{},1).won,false);
}
const mage=api.combat({magic:300,magicSkill:200},api.regions[0],{},0);assert.equal(mage.style,'magic');assert.equal(mage.change.magicReputation,3);
assert.ok(api.combat(weak,api.regions[0],{sword:100},0).chance>api.combat(weak,api.regions[0],{},0).chance);
const saved={};api.remember(saved,api.regions[0],{won:true,chest:true,money:160,date:'2001-01-01'});
const restored=JSON.parse(JSON.stringify(saved));api.remember(restored,api.regions[0],{won:false,chest:false,money:0,date:'2001-01-02'});
assert.equal(restored.exploration.regions['east-forest'].visits,2);assert.equal(restored.exploration.regions['east-forest'].victories,1);assert.equal(restored.exploration.regions['east-forest'].earnings,160);
// 실제 탐험 UI 함수의 재방문 보상 중복 및 종료 핸들러 정리를 검증한다.
const element=()=>({hidden:false,dataset:{},style:{setProperty(){}},classList:{add(){},remove(){}},setAttribute(){},remove(){},prepend(){},querySelector(){return board;}});
const board=element(),nodes={};
const controls=['up','down','left','right'].map(d=>({...element(),dataset:{dungeonMove:d}}));
const choices=api.regions.map(r=>({...element(),dataset:{exploreRegion:r.id}}));
ctx.document={querySelector:id=>nodes[id]||(nodes[id]=element()),querySelectorAll:()=>controls,createElement:()=>({...element(),querySelectorAll:()=>choices}),addEventListener(){},removeEventListener(){}};
ctx.game={...strong,season:'봄',currentDate:'2001-01-01'};ctx.spriteFrames={down:['','sprite']};ctx.dungeonGearPower=()=>0;ctx.awardDungeonGear=()=>null;
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');vm.runInContext(app.slice(app.indexOf('function exploreDungeon('),app.indexOf('function addDailyAction(')),ctx);
const pending=ctx.exploreDungeon();choices[0].onclick();
for(let i=0;i<3;i++)controls[3].onclick();controls[0].onclick();
controls[2].onclick();controls[3].onclick(); // same enemy again
nodes['#dungeonFinish'].onclick();const result=await pending;
assert.equal(ctx.game.exploration.regions['east-forest'].visits,1);assert.ok(result.money<=60);assert.equal(nodes['#dungeonFinish'].onclick,null);
const cancelled=ctx.exploreDungeon();nodes['#dungeonFinish'].onclick();await cancelled;
assert.equal(ctx.game.exploration.regions['east-forest'].visits,1);
console.log('PASS: regions, combat progression, stress, save records, UI cleanup and repeat encounter');
