import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ctx={};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(new URL('../src/monthly-calendar.js',import.meta.url),'utf8'),ctx);
const cal=ctx.SeonhwaCalendar;
for(const [start,length,end] of [['2000-02-01',29,'2000-02-29'],['2001-02-01',28,'2001-02-28'],['2001-04-01',30,'2001-04-30'],['2001-01-01',31,'2001-01-31']]){
 const days=cal.expand(['study','work','rest'],start);
 assert.equal(days.length,length);assert.equal(days.at(-1).date,end);
 assert.equal(new Set(days.map(d=>d.date)).size,length);
 assert.equal(days[9].id,'study');assert.equal(days[10].id,'work');assert.equal(days[20].id,'rest');
}
assert.equal(cal.expand(['work'],'2001-01-07').length,4);
assert.equal(cal.expand(['work','rest'],'2001-12-21')[11].date,'2002-01-01');
assert.equal(cal.period('2000-02-21').days,9);
assert.throws(()=>cal.period('invalid'));
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const ledgerCode=app.slice(app.indexOf('function createMonthlyLedger('),app.indexOf('function daysUntilEnding('));
vm.runInContext('const game={monthlyLedger:null};'+ledgerCode,ctx);
ctx.records=cal.expand(['a','a','a'],'2001-01-01').map(d=>({date:d.date,action:{name:'test',cost:2},actualChange:{}}));
const reports=vm.runInContext('recordMonthlySchedule(records)',ctx);
assert.equal(reports.length,1);assert.equal(reports[0].expense,62);assert.equal(reports[0].activities.test,31);
assert.equal(vm.runInContext('game.monthlyLedger',ctx),null);
console.log('PASS: calendar periods, leap years, mid-period saves, year rollover, month-end ledger');
