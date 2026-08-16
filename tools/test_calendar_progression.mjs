import assert from 'node:assert/strict';

const DAY = 86_400_000;

function addYears(date, years) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

function daysUntilEnding(current, ending) {
  return Math.max(0, Math.ceil((ending - current) / DAY));
}

function ageAt(date, birth) {
  return date.getFullYear() - birth.getFullYear()
    - ((date.getMonth() < birth.getMonth()
      || (date.getMonth() === birth.getMonth() && date.getDate() < birth.getDate())) ? 1 : 0);
}

function simulateBirthday(birth) {
  let current = addYears(birth, 9);
  const ending = addYears(birth, 19);
  ending.setDate(ending.getDate() + 1);
  const reachedBirthdays = [];
  let activityDays = 0;
  let weekRuns = 0;

  while (current < ending) {
    const previous = new Date(current);
    const playableDays = Math.min(7, daysUntilEnding(current, ending));
    assert.ok(playableDays >= 1 && playableDays <= 7, '마지막 일정 길이는 1~7일이어야 합니다.');
    current = new Date(current);
    current.setDate(current.getDate() + playableDays);
    if (current >= ending) current = new Date(ending);
    activityDays += playableDays;
    weekRuns += 1;

    for (let age = 10; age <= 19; age += 1) {
      const birthday = addYears(birth, age);
      if (birthday > previous && birthday <= current) reachedBirthdays.push(age);
    }
  }

  assert.equal(current.getTime(), ending.getTime(), '종료일을 정확히 맞춰야 합니다.');
  assert.equal(activityDays, Math.round((ending - addYears(birth, 9)) / DAY), '종료일 밖의 활동이 반영되면 안 됩니다.');
  assert.equal(ageAt(current, birth), 19, '최종 성장 나이는 19세여야 합니다.');
  assert.deepEqual([...new Set(reachedBirthdays)], [10,11,12,13,14,15,16,17,18,19], '모든 성장 생일을 한 번씩 지나야 합니다.');

  return {activityDays, weekRuns};
}

const first = new Date(1990, 0, 1);
const last = new Date(1990, 11, 31);
let birthdays = 0;
let shortestFinalWeek = 7;
let longestFinalWeek = 0;

for (let cursor = new Date(first); cursor <= last; cursor.setDate(cursor.getDate() + 1)) {
  const birth = new Date(cursor);
  const result = simulateBirthday(birth);
  const ending = addYears(birth, 19);
  ending.setDate(ending.getDate() + 1);
  const totalDays = Math.round((ending - addYears(birth, 9)) / DAY);
  const finalWeek = totalDays % 7 || 7;
  shortestFinalWeek = Math.min(shortestFinalWeek, finalWeek);
  longestFinalWeek = Math.max(longestFinalWeek, finalWeek);
  assert.ok(result.weekRuns > 500, '10년 성장에는 충분한 주간 실행 횟수가 필요합니다.');
  birthdays += 1;
}

console.log(`PASS: 1990년 생일 ${birthdays}개 전체 검사`);
console.log(`PASS: 마지막 일정 길이 ${shortestFinalWeek}~${longestFinalWeek}일, 종료일 초과 활동 0건`);
console.log('PASS: 10~19세 생일 이벤트 경계 및 최종 19세 종료 검증');
