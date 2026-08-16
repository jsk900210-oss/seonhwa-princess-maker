import assert from 'node:assert/strict';

const skilled=100,master=300,totalWeeks=52*10;
assert.equal(Math.ceil(skilled/7),15,'7일 집중 시 숙련은 약 15주여야 합니다.');
assert.equal(Math.ceil(master/7),43,'7일 집중 시 달인은 약 43주여야 합니다.');
assert.ok(master<totalWeeks,'주 1회 편성으로 10년 안에 달인 달성이 가능해야 합니다.');
assert.ok(master>totalWeeks/2,'주 1회 편성 시 달인은 성장 후반에 달성해야 합니다.');
console.log('PASS: 숙련 100회·달인 300회 장기 성장 속도');
