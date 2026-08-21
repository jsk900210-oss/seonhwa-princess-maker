import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/app.js', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const scheduleCss = readFileSync(new URL('../src/schedule.css', import.meta.url), 'utf8').replace(/\r\n/g, '\n');

assert.match(source,/stressRestUntilPhaseEnd=false/,'페이즈 휴식 고정 상태가 필요합니다.');
assert.match(source,/if\(simulated\.stress>=statMaximum\('stress'\)\)stressRestUntilPhaseEnd=true/,'스트레스 100부터 남은 페이즈를 휴식으로 고정해야 합니다.');
assert.match(source,/const vacationPhase=phaseRecords\.length>0&&phaseRecords\.every/,'바캉스 전용 페이즈를 판별해야 합니다.');
assert.match(source,/if\(!vacationPhase\)await showPhaseReport/,'바캉스 뒤 결과 대기 없이 다음 일정 또는 홈으로 가야 합니다.');
assert.match(source,/stress:-105/,'바캉스 스트레스 회복은 페이즈 환산 후 -35여야 합니다.');

const mustContain = [
  ["scheduleConfirmDismissed = false;\n    renderSchedulePanel();", '일정 화면을 다시 열면 실행 확인창을 다시 준비해야 합니다.'],
  ["renderSchedulePanel();\n    speakGuardian('schedule');\n    showScheduleConfirmation();", '이미 7일이 채워진 저장 일정도 실행 확인창을 보여야 합니다.'],
  ['await exploreMarket();', '저잣거리 일정은 사용자가 나갈 때까지 다음 날로 넘어가면 안 됩니다.'],
  ['marketShoppingActive=false;\n        closeMarketUiForTransition();', '저잣거리 종료 후 일정 재생 상태와 화면을 복구해야 합니다.'],
  ['stage.hidden=false;stageCharacter.hidden=false;stageProps.hidden=false;\n        playHomeMusic();', '저잣거리 종료 후 활동 화면과 기본 음악을 복구해야 합니다.'],
  ['closeMarketUiForTransition();\n      if(index%14===0){', '바캉스 전환 전에 저잣거리 주문창을 닫아야 합니다.'],
  ['const metSomeone=await playVacationScene(prize,index,vacationCompanion,scheduleStart,index<selected.length-1);', '바캉스 동행 선택·감상·인연 장면이 끝날 때까지 다음 일정은 대기해야 합니다.'],
  ["if(action.id==='vacation'&&index%14===0)index=Math.min(index+13,selected.length-1);", '14일 바캉스 장면 종료 후 중복 재생 없이 다음 일정으로 이동해야 합니다.'],
  ["scene.classList.remove('has-encounter','child-live');scene.hidden=true", '바캉스 종료 시 일러스트와 인연 UI를 숨겨야 합니다.'],
  ["phone.classList.remove('playing','schedule-holiday');", '주간 일정 종료 시 홈 화면 조작 상태를 복구해야 합니다.'],
];

for (const [snippet, message] of mustContain) assert.ok(source.includes(snippet), message);

assert.match(scheduleCss, /\.phone\.playing\.market-playing>\.dialogue\{[\s\S]*?bottom:9\.5%/, '저잣거리 대화창은 하단 귀가 버튼보다 위에 있어야 합니다.');
assert.match(scheduleCss, /\.phone\.playing\.market-playing>nav\{[\s\S]*?safe-area-inset-bottom/, '저잣거리 귀가 버튼은 모바일 안전 영역을 반영해야 합니다.');

console.log('PASS: 저장된 7일 일정도 일정 화면 진입 시 실행 확인창 표시');
console.log('PASS: 저잣거리 종료 후 다음 일정과 홈 음악으로 복귀');
console.log('PASS: 저잣거리 대화창과 집으로 돌아가기 버튼 영역 분리');
console.log('PASS: 바캉스 전환 시 주문창 정리, 감상 종료 후 다음 일정 복귀');
