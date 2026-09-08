import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../src/life-care.js',import.meta.url),'utf8'),ctx);
const api=ctx.SeonhwaCare;
const state=(extra={})=>({money:1000,health:40,stress:0,dietPolicy:'balanced',illnessDays:0,...extra});
for(const [diet,cost,gain] of [['simple',8,0],['balanced',15,1],['nourishing',28,2]]){
 const s=state({dietPolicy:diet});const d=api.settleDay(s,false);assert.equal(d.cost,cost);assert.equal(s.health,40+gain);assert.equal(s.money,1000-cost);
}
let s=state({money:10,dietPolicy:'nourishing'});assert.equal(api.settleDay(s,false).cost,8);assert.equal(s.money,2);
s=state({money:0});api.settleDay(s,false);assert.equal(s.money,0);assert.equal(s.health,39);assert.equal(s.stress,1);
s=state({stress:95});assert.equal(api.beginDay(s),true);assert.equal(s.illnessDays,3);
for(let day=0;day<3;day++){s.stress-=5;api.settleDay(s,true);}assert.equal(s.illnessDays,0);assert.equal(api.beginDay(s),false);
s=state({illnessDays:3,stress:90});assert.equal(api.treat(s).ok,true);assert.equal(s.illnessDays,1);assert.equal(s.money,850);assert.equal(s.stress,82);
s=state({money:149,illnessDays:3});assert.equal(api.treat(s).ok,false);assert.equal(s.money,149);assert.equal(s.illnessDays,3);
s=state({health:999});assert.equal(api.settleDay(s,false).change.health,0);
s=state();for(let day=0;day<31;day++)api.settleDay(s,false);assert.equal(s.money,535);
// 일당과 식비를 상계하지 않고 월말 수입/지출을 각각 보존한다.
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
vm.runInContext('const game={monthlyLedger:null};'+app.slice(app.indexOf('function createMonthlyLedger('),app.indexOf('function daysUntilEnding(')),ctx);
ctx.records=[{date:'2001-01-31',action:{name:'farm',cost:-85},livingCost:15,actualChange:{}}];
const report=vm.runInContext('recordMonthlySchedule(records)[0]',ctx);assert.equal(report.income,100);assert.equal(report.expense,15);
console.log('PASS: diet costs, poverty fallback, illness recovery, treatment, monthly accounting');
