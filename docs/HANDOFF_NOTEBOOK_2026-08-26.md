# 노트북 작업 인계 — 2026-08-26

## 현재 기준점

- 브랜치: `agent/pixel-schedule-handoff`
- 최신 작업 버전: `v0.64.121-debug`
- 최신 기능 기준 커밋: `73adb85` (`feat: visualize career and downfall endings`)
- 기준 브랜치: `agent/pixel-schedule-handoff`
- 라이브 QA: `https://jsk900210-oss.github.io/seonhwa-princess-maker/src/?qaEnding=queen&v=73adb85`

GitHub의 `agent/pixel-schedule-handoff`와 로컬 HEAD는 `73adb85`로 일치한다. 인연 이벤트의 선화는 9·13·16·19세 승인된 반실사 베이스를 사용한다.

## 다른 PC에서 이어받기

기존 저장소가 있는 PC에서는 먼저 사용자 변경을 확인하고 자동 `pull`, `reset`, `clean`을 실행하지 않는다.

```powershell
git status --short --branch
git fetch origin
git switch agent/pixel-schedule-handoff
git log -1 --oneline
```

로그에 `73adb85 feat: visualize career and downfall endings`가 포함되는지 확인한다. 해당 PC의 브랜치가 뒤처져 있고 작업 트리가 깨끗할 때만 사용자가 직접 fast-forward 병합한다.

```powershell
git merge --ff-only origin/agent/pixel-schedule-handoff
```

새로 받는 PC에서는 다음처럼 복제한다.

```powershell
git clone --branch agent/pixel-schedule-handoff https://github.com/jsk900210-oss/seonhwa-princess-maker.git
cd seonhwa-princess-maker
git log -1 --oneline
```

로컬 확인 주소는 `http://127.0.0.1:8000/src/?v=0.64.121-debug`이다.

## 완료 — 남자 주인공 5인 연령별 이미지 전면 검수·재제작

대상은 도윤·서진·연우·태겸·현의 13세·16세·19세, 총 15개 이미지다.

- 실제 인연 장면은 `assets/characters/romance/identity/fullbody-v2/{id}-age-{13|16|19}-v2.png`를 게임 나이에 따라 선택한다.
- 5인×3연령 총 15개 파일은 실제 알파 투명 PNG이며 인물별 역할 복식과 동일 인물 성장선을 적용했다.
- 각 인물은 13→16→19세 동안 동일 인물로 보여야 하며 얼굴형, 눈, 코, 입, 피부색, 체형 성장선이 이어져야 한다.
- 다섯 인물의 의상 실루엣과 색을 서로 확실히 구분한다.
- 반실사 쯔꾸르풍, 전신, 실제 알파 투명 PNG로 통일한다.
- 이미지 생성 결과가 체크무늬를 RGB 배경으로 굳혀 내보낼 수 있으므로, 적용 전 반드시 `RGBA`, 알파 최소값 0, 모서리 알파 0을 검사한다.
- 기존 파일을 덮지 말고 `v2` 등 버전 파일을 만든 뒤 코드에서 참조한다.

### 인물별 의상 방향

- 도윤: 젊은 무관. 활동적인 무관복, 팔이 좁은 소매, 활·검을 다루기 좋은 실루엣. 왕실 금장 금지.
- 서진: 학문에 집중하는 선비. 단정한 유생/서생 도포. 차분한 밝은 중성색. 현과 같은 청회색 도포+검은 갓 조합을 피한다.
- 연우: 화공. 붓집과 작업 흔적이 어울리는 부드러운 색의 작업복. 선비복과 구별한다.
- 태겸: 상단 후계자. 실용적인 상단 복식과 정돈된 허리띠. 왕족·무관 문양 금지.
- 현: 정체를 숨긴 왕자. 누가 봐도 왕처럼 보이던 남색·금색 용문양, 패물, 화려한 띠를 제거한다. 일반 선비처럼 검은 갓과 소박한 도포를 착용하되 서진과 색·깃·띠·소매 실루엣이 겹치지 않게 한다. 예: 현은 먹색/회갈색 외출 도포, 서진은 옅은 옥색/미색 학자복.

현의 선비복 시안은 작업 중 생성했으나 배경이 실제 투명이 아닌 체크무늬 RGB로 출력되어 프로젝트에는 넣지 않았다. 노트북에서 재생성 또는 정밀 알파 추출 후 검수해야 한다.

## 완료 — 인연 배경 무인 장면만 선별

- 25개 회차 배경에는 선화와 상대 남성 외의 별도 인물, 군중, 상인, 행인 실루엣이 없어야 한다.
- `relationSceneBackgrounds`의 현재 매핑을 전수 확인한다.
- 특히 저잣거리, 꽃시장, 축제, 장터 계열 배경은 기존 인물이 포함됐을 가능성이 높으므로 무인 배경으로 교체한다.
- 배경 자체에 사람이 그려져 있으면 CSS로 가리지 말고 다른 자산을 선택하거나 무인 버전을 제작한다.

## 완료 — 배경 과대 확대 수정

- 현재 `.relation-encounter-scene`은 세로 화면에서 가로 배경을 `background-size: cover`로 표시해 좌우가 크게 잘리고 확대되어 보인다.
- 단순히 `contain`으로 바꿔 검은 여백을 만들지 말고, 인연 이벤트용 세로 크롭/배경 레이어를 준비하거나 장면별 `background-position`과 완만한 확대율을 지정한다.
- 360·390·430px 세로 화면에서 장소의 핵심 요소가 보이고, 인물 뒤 배경 원근이 자연스러운지 확인한다.
- QA URL: `src/?qaRelation={doyun|seojin|yeonwoo|taegyeom|hyeon}&qaMeeting={1-5}&qaAge={13|16|19}`

## 완료 — 인연 대사 다양화

- 현재 `relationReplyChoices(candidate)`가 모든 인물·회차에 같은 두 선택지를 돌려쓴다.
- 별도 상세 작업 요청서는 Codex 작업 산출물 `outputs/claude-relation-dialogue-handoff.md`에 작성되어 있다. 노트북에 파일이 없다면 `relationEpisodeCatalog`의 25개 회차를 기준으로 각 회차에 첫 대사 1개, 선화 선택지 2개, 선택별 상대 답변 2개를 작성한다.
- 인물 말투와 1→5회 관계 진전을 구분하고 중복 문장 검사를 추가한다.

## 저장소 주의사항

다음 미추적 폴더는 사용자 백업이므로 임의로 스테이징하거나 삭제하지 않는다.

- `.local-backup-logs/`
- `assets/cinematics/guardian/humanized/poses/_pre_defringe_v2_backup/`

## 다음 작업

1. 직업 엔딩 18종과 몰락 엔딩 7종에 맞는 선화 전용 행동 포즈 제작
2. 직업·몰락 엔딩별 3장면 후일담 연결
3. 모바일 360·390·430px 전수 검수

## 완료 절차

1. `README.md`와 최근 Git 로그 확인
2. 15개 남자 주인공 자산과 25개 무인 배경/구도 검수
3. 모바일 QA 및 전체 Node 테스트
4. 버전, `README.md`, `CHANGELOG.md`, `UPDATE_ATTEMPTS.md` 갱신
5. `agent/pixel-schedule-handoff` 커밋·푸시
6. GitHub Pages 배포 확인
7. 기존 Notion 작업 기록 페이지에 버전, 커밋, 테스트, 라이브 링크 기록
