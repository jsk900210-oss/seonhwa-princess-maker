# 《선화공주 만들기》 GitHub 디렉터리 구조

이 저장소는 **실행 코드**, **게임에서 직접 사용하는 자산**, **제작 원본·참고자료**, **기획·검수 문서**, **생성·검사 도구**를 분리한다.

```text
seonhwa-princess-mvp/
├─ src/                         # 브라우저에서 실행되는 게임 코드
│  ├─ index.html                # 시작 화면
│  ├─ app.js                    # 게임 상태·일정·상점·도감 로직
│  ├─ story-data.js             # 프롤로그·서사 데이터
│  └─ *.css                     # 화면·일정·프롤로그 스타일
├─ assets/                      # 게임 및 제작에 사용하는 이미지·음원
│  ├─ audio/music/              # BGM
│  ├─ backgrounds/              # 홈·서당·저잣거리·활동 배경
│  ├─ characters/               # 선화·조연·상점 NPC·엔딩 인물
│  ├─ cinematics/prologue/      # 프롤로그 장면
│  ├─ events/                   # 주간 사건·바캉스 CG
│  ├─ items/food/               # 음식 아이콘
│  ├─ ui/                       # 활동·숙련도 UI 자산
│  ├─ reference/                # 이미지 생성·분할에 쓰는 참고 시트
│  └─ source-sheets/            # 버전별 생성 원본 시트 보존
├─ docs/
│  ├─ story/                    # 서사 원문·감사·구현 메모
│  ├─ qa/                       # 실제 재생 검수 보고서·QA 시트
│  └─ assets/                   # 미래 이미지 세트 계획
├─ tools/                       # 이미지 생성·분할·보정·검사 스크립트
├─ README.md                    # 현재 버전과 실행 방법
├─ CHANGELOG.md                 # 버전별 변경 사항
├─ UPDATE_ATTEMPTS.md           # 수정 시도와 검수 기록
├─ VERSIONING.md                # 버전 규칙
├─ GAMEPLAY_ROADMAP.md          # 현재 게임 개발 로드맵
└─ DIRECTORY_STRUCTURE.md       # 이 문서
```

## 자산 구분 원칙

- `assets/backgrounds`, `characters`, `events`, `items`, `ui`: 게임이 직접 불러오는 **배포 자산**
- `assets/reference`: 분할·보정 도구가 읽는 **제작 참고 시트**
- `assets/source-sheets`: 다시 제작할 때 필요한 **버전별 생성 원본**
- `docs/qa`: 실행 결과와 비교 시트 등 **검수 산출물**
- 복구용 ZIP·Git bundle: 저장소 밖 `outputs/github-recovery-backups`에 보관

## 구조 검사

```powershell
python tools/check_project_structure.py
python tools/verify_assets.py
```

첫 번째 명령은 필수 폴더·핵심 파일·정적 자산 참조를 확인한다. 두 번째 명령은 주요 PNG/WebP의 손상·해상도·투명도 형식을 확인한다.

## 작업 저장 규칙

1. 기능과 자산을 해당 폴더에 저장한다.
2. `README.md`, `CHANGELOG.md`, `UPDATE_ATTEMPTS.md`를 같은 버전으로 갱신한다.
3. 구조 검사와 자산 검사를 실행한다.
4. 디버깅 버전 커밋과 태그를 만든다.
5. GitHub에 `main`과 태그를 푸시하고 노션 스프린트를 갱신한다.
