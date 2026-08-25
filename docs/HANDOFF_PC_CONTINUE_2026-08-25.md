# 《선화공주 만들기》 PC 이어 작업 인계서

작성일: 2026-08-25  
저장소: `https://github.com/jsk900210-oss/seonhwa-princess-maker.git`  
작업 브랜치: `agent/pixel-schedule-handoff`  
기능 기준 커밋: `9a15bd5`
게임 버전: `v0.64.50-debug`

## 다른 PC에서 처음 받기

PowerShell에서 작업할 상위 폴더로 이동한 뒤 실행합니다.

```powershell
git clone --branch agent/pixel-schedule-handoff --single-branch https://github.com/jsk900210-oss/seonhwa-princess-maker.git
Set-Location .\seonhwa-princess-maker
git status --short --branch
git log -5 --oneline
```

이미 저장소를 받은 PC에서는 기존 로컬 변경을 먼저 확인하고, 변경이 없을 때 다음 순서로 갱신합니다.

```powershell
git status --short --branch
git fetch origin
git switch agent/pixel-schedule-handoff
git pull --ff-only origin agent/pixel-schedule-handoff
```

로컬 변경이 표시되면 덮어쓰거나 초기화하지 말고 먼저 별도 커밋 또는 백업으로 보존합니다.

## 로컬 데모 실행

저장소 루트에서 실행합니다.

```powershell
python -m http.server 5173
```

- 게임: `http://127.0.0.1:5173/src/?v=0.64.50-debug`
- 인연 대화 QA: `http://127.0.0.1:5173/src/?qaRelation=seojin&qaAge=13&v=0.64.50-debug`
- 일정 QA 예시: `http://127.0.0.1:5173/src/?qa=1&qaSchedule=farmwork&qaPattern=success-a&v=0.64.50-debug`

## 현재 확정 상태

- 프메3식 14일 1페이즈 일정과 설날·추석 한 페이즈 이벤트 구조가 적용되어 있습니다.
- 인연 대화는 남자 인연이 왼쪽, 선화가 오른쪽에서 현재 화자 한 명씩 교대합니다.
- 선화 9·13·16·18세와 남자 인연 5명의 대화 전신은 `640×960` RGBA 공통 규격입니다.
- 같은 게임의 진행 시점을 최대 5개 슬롯으로 나누어 저장할 수 있습니다.
- 잠금 일정 레이어는 QA URL에서 성공 A/B·실패 A/B를 즉시 실행할 수 있습니다.
- 약초 실패는 손을 머리 위로 드는 놀람 프레임 뒤에 앞으로 넘어집니다.
- 농가 닭 추격과 아이 돌보기 추격은 한 장면 안에서 방향·안전 간격을 유지합니다.
- 활성 일정의 125개 프레임 묶음은 정지 이미지 중복 방지 검사를 통과해야 합니다.
- 전체 Node 회귀 테스트는 39개이며 자산 감사 결과는 0 errors, 0 warnings입니다.
- `main`에는 자동 병합하지 않으며 검수는 `agent/pixel-schedule-handoff`에서 계속합니다.

## 이어 작업 전 필수 확인

```powershell
git status --short --branch
git branch --show-current
git log -5 --oneline
git fetch --prune
node --check src/app.js
git diff --check
```

`pull`, `reset`, `clean`은 작업 트리 상태를 확인하기 전에 자동 실행하지 않습니다.

## GitHub에 포함하지 않은 로컬 백업

다음은 게임 실행·배포에 필요하지 않은 작업 PC 전용 백업이므로 커밋하지 않았습니다.

- `.local-backup-logs/` — 로컬 자동 백업 로그
- `assets/cinematics/guardian/humanized/poses/_pre_defringe_v2_backup/` — 신수 배경제거 전 원본 16개

이 백업까지 다른 PC로 옮겨야 한다면 Git이 아니라 개인 저장소나 외장 저장장치로 별도 복사합니다. 게임의 현재 실행본과 이어 작업에는 필요하지 않습니다.

## 공개 확인 주소

- 로컬 최신 게임: `http://127.0.0.1:5173/src/?v=0.64.50-debug`
- 공개 게임은 작업 브랜치를 GitHub에 푸시하고 Pages 배포가 완료된 뒤 새 커밋 주소로 갱신합니다.

## 작업 완료 시 기록 순서

1. 버전을 한 단계 올립니다.
2. `README.md`, `CHANGELOG.md`, `UPDATE_ATTEMPTS.md`를 갱신합니다.
3. 문법·경로·PNG HTTP 200과 모바일 표시를 검수합니다.
4. 작업 브랜치에만 커밋·푸시합니다.
5. GitHub Pages를 작업 브랜치 기준으로 배포합니다.
6. Notion 통합 프로젝트와 결과서에 커밋·배포 링크를 기록합니다.
