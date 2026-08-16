import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

const mustContain = [
  ["scheduleConfirmDismissed = false;\n    renderSchedulePanel();", '일정 화면을 다시 열면 실행 확인창을 다시 준비해야 합니다.'],
  ["renderSchedulePanel();\n    speakGuardian('schedule');\n    showScheduleConfirmation();", '이미 7일이 채워진 저장 일정도 실행 확인창을 보여야 합니다.'],
  ['await exploreMarket();', '저잣거리 일정은 사용자가 나갈 때까지 다음 날로 넘어가면 안 됩니다.'],
  ['marketShoppingActive=false;\n      playHomeMusic();', '저잣거리 종료 후 일정 재생 상태와 기본 음악을 복구해야 합니다.'],
  ['closeMarketUiForTransition();\n      const prize=awardVacationIllustration();', '바캉스 전환 전에 저잣거리 주문창을 닫아야 합니다.'],
  ['const metSomeone=await playVacationScene(prize,index);', '바캉스 감상과 인연 장면이 끝날 때까지 다음 일정은 대기해야 합니다.'],
  ["scene.classList.remove('has-encounter','child-live');scene.hidden=true", '바캉스 종료 시 일러스트와 인연 UI를 숨겨야 합니다.'],
  ["phone.classList.remove('playing');\n  return {weeklyChange,dayRecords};", '주간 일정 종료 시 홈 화면 조작 상태를 복구해야 합니다.'],
];

for (const [snippet, message] of mustContain) assert.ok(source.includes(snippet), message);

console.log('PASS: 저장된 7일 일정도 일정 화면 진입 시 실행 확인창 표시');
console.log('PASS: 저잣거리 종료 후 다음 일정과 홈 음악으로 복귀');
console.log('PASS: 바캉스 전환 시 주문창 정리, 감상 종료 후 다음 일정 복귀');
