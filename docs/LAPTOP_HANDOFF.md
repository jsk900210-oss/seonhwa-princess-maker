# 노트북 작업 인수인계 · 2026-09-09

## 받을 브랜치

- 저장소: https://github.com/jsk900210-oss/seonhwa-princess-maker
- 작업 브랜치: `agent/pixel-schedule-handoff` (main이 아님)
- 새 폴더에 받기: `git clone --branch agent/pixel-schedule-handoff https://github.com/jsk900210-oss/seonhwa-princess-maker.git`
- 기존 노트북 작업이 있다면 먼저 `git status` 확인. 미커밋 변경을 보존한 뒤 fetch / switch / `git pull --ff-only` 사용. 강제 reset 금지.

## 실행

Python 3 설치 후 저장소에서 `python -m http.server 5173 --bind 127.0.0.1` 실행.
브라우저: http://127.0.0.1:5173/src/?v=home-art-v4
Windows에서 python이 없다면 `py -m http.server 5173 --bind 127.0.0.1` 사용.
이는 노트북 자체 서버 주소이며 데스크톱 서버를 공유하는 주소가 아니다.
게임 세이브는 브라우저 localStorage에 있으므로 Git clone으로 이전되지 않는다.
기존 플레이를 이어갈 경우 게임의 저장 내보내기/불러오기 기능 존재 여부부터 확인한다.

## 현재 적용 내용

- 홈 나이 구간: 9~12 / 13~15 / 16~17 / 18세 이상.
- 검은 땋은 머리, 아이보리 저고리, 청록 고름, 살구 치마, 정면 두 손을 모은 자세.
- 9~12: `assets/characters/seonhwa/home/age-09-12/seonhwa-home-age09-12-transparent-v1.png`
- 나머지: 각 age 폴더의 `seonhwa-home-age{구간}-review-v4.png`.
- `review-v4-source.png`는 생성 원본이며 체크무늬가 그려진 비투명 RGB이다. 게임에 사용하지 말 것.
- `concept-*`는 과거 시안. 삭제하지 않았으나 게임 사용 경로는 아니다.
- 비교 이미지: `assets/characters/seonhwa/home/seonhwa-home-all-ages-review-v4.jpg`.
- src/app.js의 baseSpritePaths와 홈 렌더 연결 변경. 캐릭터 초기화 차단에서 위 홈 PNG만 허용.
- 홈 외 일정·이벤트 캐릭터는 재구성 전이라 계속 숨김. 다른 삭제 자산을 임의로 복원하지 말 것.
- 대화/일정 나이대별 폴더는 준비됐지만 새 선화 이미지는 아직 미제작.
- 서장 10장 보존. 기존 선화 전용 자산과 명절·휴가·엔딩 장면은 사용자 승인으로 삭제됨.
- 아이템 6종 재제작 완료. 나머지 아이템 전체 검수/수정은 미완료.

## 검증 및 다음 작업

- JS 문법 검사와 HTTP 200 확인 완료. 실제 홈 UI, 연령 전환, 긴 플레이 검증은 미완료.
- 투명 PNG는 RGBA/alpha 0~255 확인 및 어두운 배경 육안 검사. 머리카락/옷깃/발끝 확대 검수는 계속 필요.
- 13~15세 비율 및 성인 얼굴을 수정했지만 사용자 최종 디자인 확정은 아직 받지 않음.
- 홈 이미지의 새 경로가 다른 공용 렌더에도 쓰이는지 확인하고, 미제작 표정/의상을 완성됐다고 표기하지 말 것.
- 이미지 생성으로 원본 제작, 사용자 승인된 별도 Python 배경제거 사용.
- `tools/extract_seonhwa_home.py`, `tools/finish_home_review.py`, `tools/preview_home_ages.py`는 재현 도구.
- finish_home_review.py 원본 로딩은 데스크톱 generated_images 경로에 의존. 노트북에서는 저장소의 review-v4-source.png를 사용하도록 조정 필요. 완성 PNG 사용에는 이 도구 실행이 필요 없다.
- 이 문서에 푸시 성공을 미리 기록하지 않는다. 전달 시 원격 SHA와 로컬 SHA 일치를 확인한다.
