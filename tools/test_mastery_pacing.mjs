import assert from 'node:assert/strict';

const skilled=10,master=30;
assert.equal(Math.ceil(skilled/3),4,'매 페이즈 최상 평가라도 숙련까지 최소 4페이즈가 필요해야 합니다.');
assert.equal(Math.ceil(master/3),10,'매 페이즈 최상 평가라도 달인까지 최소 10페이즈가 필요해야 합니다.');
assert.equal(Math.ceil(master/2),15,'보통의 우수 평가라면 달인까지 약 15페이즈가 필요해야 합니다.');
console.log('PASS: 페이즈 평가형 숙련 10점·달인 30점 성장 속도');
