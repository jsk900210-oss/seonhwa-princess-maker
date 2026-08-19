# 코워크·Claude Code 인수인계 — 2026-08-19
## 현재 상태

- 실행 버전: `v0.63.69-debug`
- 일정 시스템: 프메3식 14일 페이즈 및 5칸 연속 편성
- 쯔꾸르 주인공: 나이 변화 없이 9세 단일 픽셀 베이스 사용
- 신규 픽셀 활동 자산: 20개 활동 × 3프레임 = 60장
- 신수: 홈 배경 위 투명 오버레이, 느린 슬라이드 등장, 표정별 투명 PNG 사용
- 저잣거리 자유 방문과 일정의 장터 심부름은 서로 다른 화면 규칙 사용

## 쯔꾸르 자산 규격

| 자세 | 머리끝~발끝/동작 최장축 | 캔버스 |
|---|---:|---:|
| 서기·걷기 | 280px | 320×320px |
| 숙이기 | 274px | 320×320px |
| 앉기 | 263px | 320×320px |
| 바닥 동작·잠자기 | 246px | 320×320px |

모든 결과물은 실제 알파 배경과 최소 8px 이상의 안전 여백을 가져야 한다. 잠자기는 세로 높이가 아니라 머리끝~발끝의 가로 최장축을 기준으로 한다.

## 핵심 경로

- 방향 베이스: `assets/characters/seonhwa/schedule-base/stand-*-v3-pixel.png`
- 방향 원본 시트: `assets/characters/seonhwa/schedule-base/seonhwa-schedule-turnaround-pixel-v3.png`
- 활동 최종 프레임: `assets/characters/seonhwa/schedule-actions/*-pixel-[1-3].png`
- 활동 원본 시트: `assets/characters/seonhwa/schedule-actions/source-pixel/`
- NPC 기준: `assets/characters/npcs/activity/`
- 신수 표정: `assets/cinematics/guardian/humanized/poses/*-transparent-v2.png`
- 일정 데이터 연결: `src/app.js`의 `spriteFrames`, `scheduleActionFrames`
- 일정 최종 레이아웃: `src/schedule.css` 하단의 최신 버전 규칙

## 제작 도구

- `tools/build_schedule_turnaround.mjs`: 방향 시트 분리 및 320px 픽셀 규격화
- `tools/build_pixel_schedule_actions.mjs`: 3×4 활동 시트를 3프레임 PNG로 분리하고 자세별 크기 계산
- `tools/build_guardian_transparent.mjs`: 신수 표정 시트의 투명 배경 처리
- `tools/clean_schedule_frame_fragments.mjs`: 구형 프레임의 체크 배경과 잔여 조각 정리
- `tools/test_pixel_schedule_assets.mjs`: 60개 픽셀 프레임 크기·알파·잘림 검사

## 현재 게임 연결

`scheduleActionFrames`는 다음 신규 픽셀 접두사를 사용한다.

- 교육/기본: `calligraphy`, `arithmetic`, `manners`, `sweeping`
- 생활: `herbs`, `childcare`, `kitchenhelp`, `houseclean`
- 직업: `woodwork`, `loomwork`, `masonry`, `clinichelp`, `ferryhelp`, `merchanthelp`
- 이동/휴식: `errand`, `tea`, `sleep`, `eating`, `sit`, `fail`

각 파일은 `<activity>-pixel-1.png`부터 `-3.png`까지 존재한다. 픽셀 프레임은 이미 완성 규격이므로 `normalizeActivityFrame()`에서 즉시 원본 경로를 반환한다.

## 검증 완료

- `node --check src/app.js`
- `node tools/test_phase_schedule.mjs`
- `node tools/test_job_mastery_and_scenes.mjs`
- `node tools/test_pixel_schedule_assets.mjs`
- `git diff --check`

위 검사는 2026-08-19 기준 모두 통과했다.

## 다음 작업 우선순위

1. 실제 모바일 화면에서 교육·아르바이트·휴식·장터 심부름을 각각 1페이즈 실행해 캐릭터 배치 확인
2. 캐릭터와 분리된 소품 레이어를 활동별로 배경 좌표에 배치
3. 실패 판정 시 `fail-pixel-*` 프레임을 실제 결과 분기에 연결
4. NPC도 머리끝~발끝 기준을 측정해 선화와 화면상 키를 교차 검수
5. 구형 활동 프레임과 중간 생성 시트는 참조가 완전히 끊긴 뒤 별도 정리 커밋에서 제거

## 주의 사항

- 홈 캐릭터 이미지를 일정 캐릭터로 사용하지 않는다.
- 구형 `schedule-actions` PNG를 신규 픽셀 파일 위에 덮어쓰지 않는다.
- 소품이 포함된 전체 이미지의 외곽 상자를 캐릭터 키로 계산하지 않는다.
- CSS 마지막 부분에 최신 보정 규칙이 있으므로 앞부분만 수정해 우선순위 충돌을 만들지 않는다.
- 삭제 전 `rg`로 코드 참조와 테스트 참조를 모두 확인한다.
