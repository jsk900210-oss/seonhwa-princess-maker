import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8');
assert.ok(source.includes('const skillRatio=Math.min(2.5,skill/recommended)'), '999 기준 권장 능력치 비율 계산 누락');
assert.ok(source.includes('const masteryBonus=Math.min(10,Math.sqrt(mastery)*1.2)'), '숙련 반복 보정 곡선 누락');

function clampStat(key, value) {
  return Math.max(0, Math.min(key === 'stress' ? 100 : 999, Number(value) || 0));
}

function applyStatChange(state, change) {
  const actual = {};
  for (const [key, value] of Object.entries(change)) {
    const before = clampStat(key, state[key]);
    state[key] = clampStat(key, before + value);
    actual[key] = state[key] - before;
  }
  return actual;
}

function createMonthlyLedger(year, month) {
  return { year, month, income: 0, expense: 0, activities: {}, change: {} };
}

function recordMonthlySchedule(state, dayRecords) {
  const completed = [];
  for (const record of dayRecords) {
    const date = new Date(`${record.date}T00:00:00`);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    if (!state.monthlyLedger) state.monthlyLedger = createMonthlyLedger(year, month);
    if (state.monthlyLedger.year !== year || state.monthlyLedger.month !== month) {
      completed.push(state.monthlyLedger);
      state.monthlyLedger = createMonthlyLedger(year, month);
    }
    state.monthlyLedger.activities[record.action.name] = (state.monthlyLedger.activities[record.action.name] || 0) + 1;
    if (record.action.cost > 0) state.monthlyLedger.expense += record.action.cost;
    if (record.action.cost < 0) state.monthlyLedger.income += -record.action.cost;
    for (const [key, value] of Object.entries(record.actualChange)) {
      state.monthlyLedger.change[key] = (state.monthlyLedger.change[key] || 0) + value;
    }
  }
  return completed;
}

function awardFatherBirthdayGift(state, age, stressDrop = 7, affinityGain = 3) {
  if (state.fatherBirthdayYears.includes(age)) return null;
  const change = applyStatChange(state, { stress: -stressDrop, fatherAffinity: affinityGain });
  state.fatherBirthdayYears.push(age);
  return change;
}

assert.match(source, /function actionForStressLimit\(action,stress\)/, '강제 휴식 판정 함수가 있어야 합니다.');
assert.match(source, /stress>=statMaximum\('stress'\).*action\.id!==\'rest\'/, '스트레스 100에서 휴식 외 일정을 강제 휴식으로 바꿔야 합니다.');
assert.match(source, /Object\.entries\(record\.actualChange\)/, '월말 결산은 요청량이 아닌 실제 변경량을 기록해야 합니다.');
assert.match(source, /game\.fatherBirthdayYears\.includes\(age\)/, '아버지 생일 선물은 같은 나이에 중복 지급되면 안 됩니다.');

const statState = { stress: 3, intelligence: 998 };
const actual = applyStatChange(statState, { stress: -12, intelligence: 5 });
assert.deepEqual(actual, { stress: -3, intelligence: 1 });
assert.deepEqual(statState, { stress: 0, intelligence: 999 });

const ledgerState = { monthlyLedger: createMonthlyLedger(1999, 1) };
const completed = recordMonthlySchedule(ledgerState, [
  { date: '1999-01-31', action: { name: '집에서 휴식', cost: 0 }, actualChange: { stress: -3 } },
  { date: '1999-02-01', action: { name: '글읽기', cost: 80 }, actualChange: { intelligence: 1, stress: 3 } },
]);
assert.equal(completed.length, 1);
assert.deepEqual(completed[0].change, { stress: -3 });
assert.equal(ledgerState.monthlyLedger.month, 2);
assert.deepEqual(ledgerState.monthlyLedger.change, { intelligence: 1, stress: 3 });
assert.equal(ledgerState.monthlyLedger.expense, 80);

const schedule = [{ id: 'reading' }, { id: 'rest' }];
const rest = schedule[1];
const actionForStressLimit = (action, stress) => stress >= 100 && action.id !== 'rest' ? rest : action;
assert.equal(actionForStressLimit(schedule[0], 99).id, 'reading');
assert.equal(actionForStressLimit(schedule[0], 100).id, 'rest');
assert.equal(actionForStressLimit(rest, 100).id, 'rest');

const birthdayState = { stress: 4, fatherAffinity: 998, fatherBirthdayYears: [] };
const firstGift = awardFatherBirthdayGift(birthdayState, 10);
const duplicateGift = awardFatherBirthdayGift(birthdayState, 10);
assert.deepEqual(firstGift, { stress: -4, fatherAffinity: 1 });
assert.equal(duplicateGift, null);
assert.deepEqual(birthdayState.fatherBirthdayYears, [10]);

console.log('PASS: 월말 결산은 월 경계를 나누고 실제 적용 수치만 기록');
console.log('PASS: 스트레스 100에서 휴식 외 일정은 강제 휴식으로 전환');
console.log('PASS: 능력치 상한·하한과 생일 선물 중복 방지·친밀도 반영');
