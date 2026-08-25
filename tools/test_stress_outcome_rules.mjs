import assert from 'node:assert/strict';
import fs from 'node:fs';

const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');

assert.match(app,/const boundedStress=Math\.max\(0,Math\.min\(statMaximum\('stress'\),Number\(stress\)\|\|0\)\)/,'스트레스는 허용 범위로 고정해야 합니다.');
assert.match(app,/stressRatio\*45/,'성공 판정에 연속적인 스트레스 감점을 적용해야 합니다.');
assert.doesNotMatch(app,/stress>=80\|\|\(stress>=70&&dayIndex%2===1\)/,'특정 스트레스에서 날짜 홀짝으로 실수를 확정하면 안 됩니다.');
assert.match(app,/conditionEvent\(simulated\.stress,index,outcome\)/,'상태 연출은 이미 결정된 결과를 따라야 합니다.');

const healthRatio=.7,base=72;
const thresholds=stress=>{
  const stressRatio=Math.max(0,Math.min(100,stress))/100;
  const success=Math.max(15,Math.min(92,base-stressRatio*45));
  const perfect=Math.max(4,success-(32-healthRatio*7));
  const struggle=Math.min(98,success+(22-healthRatio*7-stressRatio*4));
  return {success,perfect,mistake:100-struggle};
};
const samples=[0,10,25,40,55,70,85,100].map(thresholds);
for(let index=1;index<samples.length;index+=1){
  assert.ok(samples[index].success<=samples[index-1].success,'스트레스 상승 시 성공 확률이 증가하면 안 됩니다.');
  assert.ok(samples[index].perfect<=samples[index-1].perfect,'스트레스 상승 시 완벽 확률이 증가하면 안 됩니다.');
  assert.ok(samples[index].mistake>=samples[index-1].mistake,'스트레스 상승 시 실수 확률이 감소하면 안 됩니다.');
}

console.log('PASS: 스트레스 상승→성공 단조 감소·실수 단조 증가');
