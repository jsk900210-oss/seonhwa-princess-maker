# 선화공주 만들기 — 작업 인수인계 진입점
작업을 시작하기 전에 반드시 `docs/HANDOFF_COWORK_CLAUDE_2026-08-19.md`를 읽고 실제 코드와 자산을 교차 확인한다.

## 확정 규칙

- 홈 대표 캐릭터와 일정 실행용 쯔꾸르 캐릭터는 별도 자산이다.
- 일정 캐릭터는 모든 나이에서 9세 픽셀 베이스 하나를 사용한다.
- 일정 캐릭터는 NPC와 같은 선명한 픽셀 스타일을 사용한다.
- 신규 일정 프레임은 `320×320px` 실제 투명 PNG다.
- 본체 규격은 서기 280px, 숙이기 274px, 앉기 263px, 바닥/잠자기 246px다.
- 크기는 파일 전체가 아니라 불투명한 캐릭터의 머리끝~발끝으로 판단한다.
- 캐릭터와 책상·바구니·빗자루 등 소품은 분리한다.
- 픽셀 프레임에 `normalizeActivityFrame()` 크기 보정을 다시 적용하지 않는다.
- 기존 부드러운 활동 원화나 중간 시트는 신규 픽셀 프레임과 섞어 사용하지 않는다.

## 필수 검사

```powershell
node --check src/app.js
node tools/test_phase_schedule.mjs
node tools/test_job_mastery_and_scenes.mjs
node tools/test_pixel_schedule_assets.mjs
```

현재 기준 버전은 `v0.63.69-debug`다.
