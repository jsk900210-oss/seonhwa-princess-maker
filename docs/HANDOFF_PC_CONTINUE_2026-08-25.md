# 《선화공주 만들기》 PC 이어 작업 인계서

작성일: 2026-08-25  
저장소: `https://github.com/jsk900210-oss/seonhwa-princess-maker.git`  
작업 브랜치: `agent/pixel-schedule-handoff`  
기능 기준 커밋: `f423a15`  
게임 버전: `v0.64.11-debug`

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

## 다른 PC에서 이미 이어서 작업 중인 경우

다른 PC의 기존 작업과 이 인계본은 **커밋과 브랜치 기준으로 구분할 수 있습니다.** 먼저 아래 네 명령의 결과를 확인합니다.

```powershell
git status --short --branch
git branch --show-current
git log -5 --oneline
git remote -v
```

이 인계본의 구분 기준은 다음과 같습니다.

- 기능 기준 커밋: `f423a15`
- 최초 PC 인계 문서 커밋: `1126943`
- 공통 작업 브랜치: `agent/pixel-schedule-handoff`
- `git status`에 표시되는 수정·신규 파일: 아직 해당 PC에만 있는 로컬 작업
- 위 기준 커밋 뒤의 다른 커밋: 다른 PC에서 추가한 작업일 가능성이 있으므로 커밋 메시지와 변경 파일 확인 필요

### 다른 PC의 미커밋 작업 보존

미커밋 변경이 있으면 바로 `pull`, `reset`, `clean`하지 않습니다. 먼저 그 PC 전용 보존 브랜치를 만듭니다.

```powershell
git switch -c pc-existing-work-20260825
git status --short
```

그다음 실제 작업 파일만 명시적으로 스테이징하고 커밋합니다. `.local-backup-logs/`나 대용량 개인 백업은 함께 추가하지 않습니다.

```powershell
git add <실제로 수정한 파일 또는 폴더>
git commit -m "backup: 다른 PC 기존 작업 보존"
```

커밋할 수 없는 중간 파일은 저장소 밖의 별도 폴더에 복사해 보존합니다. 사용자가 확인하기 전에는 파일을 삭제하거나 되돌리지 않습니다.

### 두 PC 작업 비교

기존 작업을 보존한 뒤 원격 정보를 받아 비교합니다.

```powershell
git fetch origin
git log --left-right --graph --cherry-pick --oneline origin/agent/pixel-schedule-handoff...pc-existing-work-20260825
git diff --name-status origin/agent/pixel-schedule-handoff...pc-existing-work-20260825
```

- 왼쪽(`<`)은 GitHub 작업 브랜치에만 있는 커밋입니다.
- 오른쪽(`>`)은 다른 PC 보존 브랜치에만 있는 커밋입니다.
- 같은 파일을 양쪽에서 수정했다면 자동 덮어쓰지 말고 파일별로 내용을 비교한 뒤 병합합니다.
- 비교와 병합이 끝나기 전에는 `main`으로 전환하거나 병합하지 않습니다.

### 다른 PC의 Codex에 전달할 시작 문구

```text
프로젝트의 docs/HANDOFF_PC_CONTINUE_2026-08-25.md를 먼저 끝까지 읽어줘.
다른 PC에서 작업 중이던 변경이 있을 수 있으니 먼저 git status, branch,
log, fetch를 확인하고 기준 커밋 f423a15 및 인계 커밋 1126943과 비교해줘.
기존 변경은 별도 브랜치와 커밋으로 보존하고 pull, reset, clean은 자동 실행하지 마.
충돌 가능성이 있는 파일은 어느 PC 변경인지 구분해서 보고한 뒤 이어서 작업해줘.
```

## 로컬 데모 실행

저장소 루트에서 실행합니다.

```powershell
python -m http.server 8000
```

- 게임: `http://127.0.0.1:8000/src/`
- 인연 대화 QA: `http://127.0.0.1:8000/src/?qaRelation=seojin&qaAge=13&v=0.64.11-debug`
- 잠금 일정 QA 예시: `http://127.0.0.1:8000/src/?qa=1&qaSchedule=farmwork&qaPattern=success-a`

## 현재 확정 상태

- 프메3식 14일 1페이즈 일정과 설날·추석 한 페이즈 이벤트 구조가 적용되어 있습니다.
- 인연 대화는 남자 인연이 왼쪽, 선화가 오른쪽에서 현재 화자 한 명씩 교대합니다.
- 선화 9·13·16·18세와 남자 인연 5명의 대화 전신은 `640×960` RGBA 공통 규격입니다.
- 같은 게임의 진행 시점을 최대 5개 슬롯으로 나누어 저장할 수 있습니다.
- 잠금 일정 레이어는 QA URL에서 성공 A/B·실패 A/B를 즉시 실행할 수 있습니다.
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

- 라이브 게임: `https://jsk900210-oss.github.io/seonhwa-princess-maker/src/?v=f423a15`
- 인연 대화 QA: `https://jsk900210-oss.github.io/seonhwa-princess-maker/src/?qaRelation=seojin&qaAge=13&v=f423a15`
- GitHub Pages 배포 기록: `https://github.com/jsk900210-oss/seonhwa-princess-maker/actions/runs/32788988286`

## 작업 완료 시 기록 순서

1. 버전을 한 단계 올립니다.
2. `README.md`, `CHANGELOG.md`, `UPDATE_ATTEMPTS.md`를 갱신합니다.
3. 문법·경로·PNG HTTP 200과 모바일 표시를 검수합니다.
4. 작업 브랜치에만 커밋·푸시합니다.
5. GitHub Pages를 작업 브랜치 기준으로 배포합니다.
6. Notion 통합 프로젝트와 결과서에 커밋·배포 링크를 기록합니다.
