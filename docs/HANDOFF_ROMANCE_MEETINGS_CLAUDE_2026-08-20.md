# 남자 인연 5명 — 만남 일러스트 연결 인계서 (Claude → Codex)

작성: Claude / 브랜치 `agent/pixel-schedule-handoff` / 기준 버전 v0.63.76-claude-debug.2

## 0. 요약
- **목적**: 인연 5명(도윤·서진·연우·태겸·현)의 **5회 만남 각각에 장면 일러스트**를 붙여 게임에 연결.
- **현재**: 데이터·트리거·대사·연령별 전신 시트·바캉스 이미지는 이미 연결됨. **비어 있는 건 만남별 장면 일러스트 25장 + 그 표시 연결.**
- **분담**: 아트 25장 = Codex(이미지 생성) / 코드 연결 = Claude(또는 이 스펙대로 Codex). 동시 수정 금지(충돌).

## 1. 이미 연결된 것 — 건드리지 말 것
- `endingRelationCandidates` (src/app.js): 5명 데이터(id·name·role·motif·baseSheet·vacation image·minAge·ending·dialogues).
- `relationEpisodeCatalog` (src/app.js): 25개 에피소드(id·title·activities·scene·outfit·pose·expression·camera·line).
- 만남 로직: `maybeScheduleRelationEncounter(action)` → `nextRelationEpisode(candidate,activityId)`(activities 매칭·미완료) → `recordRelationEncounter`(최대 5회 → `dateUnlocked`).
- 표시 지점: `playRelationEncounterScene`(일정 중 만남), 바캉스 듀오 오버레이 `#vacationDuoOverlay`, 데이트 scene(`npc-romance-date`). **현재 전부 baseSheet 인물 포트레이트만 사용.**
- 기존 자산: `identity/fullbody/{id}-age-13-16-19-fullbody-v1.png`(연령 3연속 시트, 1692×929), `{id}/vacation.png`(768×1280), 얼굴 identity 시트.

## 2. 이번에 채울 것
1. **만남별 장면 일러스트 25장** (5명 × 5회) — 현재 없음. → Codex.
2. **`episode.image` 필드 + 표시 연결** — 현재 없음. → Claude(코드).

## 3. 아트 스펙 (Codex) — 25장

각 장면은 **선화 + 해당 인연 2인** 장면 일러스트. 저장 경로는 표의 마지막 열.


### 도윤 (doyun) · 젊은 무관 · 캐스팅 모티프 최산

| # | id | 제목 | 장면 | 의상 | 포즈 | 표정 | 카메라 | 트리거 활동 | 저장 경로 |
|---|----|------|------|------|------|------|--------|-----------|-----------|
| 1 | doyun-1 | 흩어진 화살 | 활터 | 젊은 무관 도포와 팔이 좁은 활동복 | 화살을 함께 줍고 몸을 살짝 숙인 자세 | 경계하다가 안심한 표정 | 반측면 허리샷 | swordsmanship,martial | `assets/characters/romance/doyun/meet-1.png` |
| 2 | doyun-2 | 마당의 충돌 | 집 마당 | 소매를 걷은 일손복과 묶은 띠 | 빗자루를 들고 서로 비켜 서는 동작 | 머쓱하게 웃는 표정 | 정면 약간 아래에서 본 전신 | sweeping,farmwork | `assets/characters/romance/doyun/meet-2.png` |
| 3 | doyun-3 | 산길의 발자국 | 산길 입구 | 짧게 묶은 여행 복장과 장갑 | 발자국을 짚으며 손바닥으로 흙을 살피는 동작 | 집중한 표정 | 대각선 원경 전신 | dungeon,herbs | `assets/characters/romance/doyun/meet-3.png` |
| 4 | doyun-4 | 강가의 약속 | 강가 산책로 | 바람에 잘 흩날리지 않는 담백한 나들이 옷 | 강을 향해 천천히 걷는 옆모습 | 차분히 말하는 표정 | 옆구도 허리 위 샷 | vacation | `assets/characters/romance/doyun/meet-4.png` |
| 5 | doyun-5 | 나란히 선 활터 | 활터 | 정돈된 무관 차림과 장식 없는 허리띠 | 활을 내려놓고 나란히 서서 쉬는 동작 | 약속을 건네는 미소 | 가까운 2인 반신샷 | swordsmanship,vacation | `assets/characters/romance/doyun/meet-5.png` |

### 서진 (seojin) · 선비 · 캐스팅 모티프 박보검

| # | id | 제목 | 장면 | 의상 | 포즈 | 표정 | 카메라 | 트리거 활동 | 저장 경로 |
|---|----|------|------|------|------|------|--------|-----------|-----------|
| 1 | seojin-1 | 바뀐 서책 | 서당 서가 | 깨끗한 서생 옷과 얇은 겹깃 | 책장을 두 손으로 바로잡는 동작 | 예의 바른 첫인사 | 책장 옆 중경샷 | reading,classics | `assets/characters/romance/seojin/meet-1.png` |
| 2 | seojin-2 | 먹이 번진 글 | 서책상 | 소매가 넓지 않은 필사복 | 번진 종이를 가볍게 들어 올리는 동작 | 난처하지만 다정한 미소 | 상단 사선 구도 | copying,reading | `assets/characters/romance/seojin/meet-2.png` |
| 3 | seojin-3 | 어려운 물음 | 서당 마루 | 차분한 서생 차림과 매듭 장식 | 주판과 책을 번갈아 가리키는 동작 | 설명에 집중한 표정 | 탁자 너머 반신샷 | tutoring,arithmetic | `assets/characters/romance/seojin/meet-3.png` |
| 4 | seojin-4 | 정자의 시구 | 정자 | 가벼운 나들이 도포와 고운 허리끈 | 난간에 기대어 풍경을 바라보는 동작 | 조용히 읊조리는 표정 | 옆모습 원경 | vacation | `assets/characters/romance/seojin/meet-4.png` |
| 5 | seojin-5 | 남겨 둔 책갈피 | 서책방 | 책갈피가 잘 보이는 단정한 학자복 | 책갈피를 끼워 두고 돌아서는 동작 | 미소를 숨긴 눈빛 | 책상 위 클로즈업 | classics,vacation | `assets/characters/romance/seojin/meet-5.png` |

### 연우 (yeonwoo) · 화공 · 캐스팅 모티프 박지훈

| # | id | 제목 | 장면 | 의상 | 포즈 | 표정 | 카메라 | 트리거 활동 | 저장 경로 |
|---|----|------|------|------|------|------|--------|-----------|-----------|
| 1 | yeonwoo-1 | 날아간 화첩 | 꽃밭 길 | 붓집이 달린 바람 잘 타는 작업복 | 날아간 화첩을 두 손으로 받아내는 동작 | 놀라다 안도하는 표정 | 전신 사선샷 | painting,vacation | `assets/characters/romance/yeonwoo/meet-1.png` |
| 2 | yeonwoo-2 | 마르지 않은 색 | 화실 | 색이 묻어도 자연스러운 화공 작업복 | 물감 접시를 옆으로 건네는 동작 | 차분한 집중 표정 | 책상 옆 중근경 | painting | `assets/characters/romance/yeonwoo/meet-2.png` |
| 3 | yeonwoo-3 | 장단과 붓끝 | 연습 마루 | 움직임이 넉넉한 공연복 | 장단에 맞춰 붓끝을 크게 돌리는 동작 | 흥이 오른 표정 | 움직임이 보이는 전신샷 | music,dance | `assets/characters/romance/yeonwoo/meet-3.png` |
| 4 | yeonwoo-4 | 달빛 초상 | 달빛 정원 | 달빛 반사가 잘 어울리는 은은한 나들이옷 | 무릎을 세우고 앉아 멀리 바라보는 동작 | 그윽하게 미소 짓는 표정 | 측면 반신샷 | vacation | `assets/characters/romance/yeonwoo/meet-4.png` |
| 5 | yeonwoo-5 | 비워 둔 자리 | 야외 화판 앞 | 바람에 살짝 흔들리는 가벼운 외출복 | 화폭의 빈 자리를 손끝으로 짚는 동작 | 함께 기다리는 눈빛 | 화판 너머 3/4샷 | painting,vacation | `assets/characters/romance/yeonwoo/meet-5.png` |

### 태겸 (taegyeom) · 상단 후계자 · 캐스팅 모티프 최현욱

| # | id | 제목 | 장면 | 의상 | 포즈 | 표정 | 카메라 | 트리거 활동 | 저장 경로 |
|---|----|------|------|------|------|------|--------|-----------|-----------|
| 1 | taegyeom-1 | 잘못 묶인 짐표 | 나루터 | 짐 나르기 좋은 단단한 상단 복식 | 짐표를 바로 고쳐 묶는 동작 | 재빠르게 판단하는 표정 | 허리 높이 전신샷 | errand,ferryhelp | `assets/characters/romance/taegyeom/meet-1.png` |
| 2 | taegyeom-2 | 한 냥의 흥정 | 저잣거리 | 장사꾼 느낌의 깔끔한 상단 옷 | 손가락으로 값을 세며 흥정하는 동작 | 장난기 있는 미소 | 맞은편 대치 구도 | shopping,merchanthelp | `assets/characters/romance/taegyeom/meet-2.png` |
| 3 | taegyeom-3 | 비에 젖은 장부 | 상단 장부방 | 소매를 접은 계산용 복식 | 젖은 장부를 닦고 숫자를 세는 동작 | 집중하고 책임감 있는 표정 | 책상 위 대각선샷 | arithmetic,merchanthelp | `assets/characters/romance/taegyeom/meet-3.png` |
| 4 | taegyeom-4 | 나루의 저녁 | 나루터 저녁 | 바람을 덜 타는 두꺼운 외출복 | 짐을 내려놓고 차를 건네는 동작 | 조용히 웃는 표정 | 노을을 뒤로한 반신샷 | ferryhelp,vacation | `assets/characters/romance/taegyeom/meet-4.png` |
| 5 | taegyeom-5 | 함께 갈 장길 | 큰 장 입구 | 화사하지만 실용적인 상단 외출복 | 앞장서며 손을 내미는 동작 | 기대에 찬 미소 | 길을 함께 보는 2인 샷 | shopping,vacation | `assets/characters/romance/taegyeom/meet-5.png` |

### 현 (hyeon) · 정체를 숨긴 왕자 · 캐스팅 모티프 차은우

| # | id | 제목 | 장면 | 의상 | 포즈 | 표정 | 카메라 | 트리거 활동 | 저장 경로 |
|---|----|------|------|------|------|------|--------|-----------|-----------|
| 1 | hyeon-1 | 평범한 윷놀이 | 마당 | 신분을 드러내지 않는 평복 | 윷을 던진 뒤 고개를 기울이는 동작 | 웃음을 참는 표정 | 작은 탁자 위 반신샷 | manners,vacation | `assets/characters/romance/hyeon/meet-1.png` |
| 2 | hyeon-2 | 낯선 호위 | 어두운 길목 | 움직임이 편한 호위복과 짧은 망토 | 앞을 가로막고 몸을 낮추는 동작 | 경계하는 날카로운 눈빛 | 측면 전신샷 | dungeon,swordsmanship | `assets/characters/romance/hyeon/meet-2.png` |
| 3 | hyeon-3 | 궁 밖의 소문 | 저잣거리 | 평민처럼 보이는 단정한 외출복 | 사람들 틈에서 뒤돌아 듣는 동작 | 말을 아끼는 차분한 표정 | 군중 사이 3/4샷 | shopping,errand | `assets/characters/romance/hyeon/meet-3.png` |
| 4 | hyeon-4 | 등불 아래 진심 | 등불 거리 | 등불빛을 받으면 은근히 빛나는 나들이복 | 등불을 손으로 가리며 서 있는 동작 | 고백 직전의 흔들리는 표정 | 등불 뒤 역광 반신샷 | vacation,spellcraft | `assets/characters/romance/hyeon/meet-4.png` |
| 5 | hyeon-5 | 다시 만날 문 | 큰 문 앞 | 신분을 밝힐 준비가 된 단정한 정장형 복식 | 문 쪽으로 한 걸음 내딛는 동작 | 결심한 듯한 표정 | 정면 대칭 구도 | manners,vacation | `assets/characters/romance/hyeon/meet-5.png` |

## 4. 얼굴·정체성 일관성 (필수)
- **인연 얼굴/체형**: 각 캐릭터의 기존 `identity/fullbody/{id}-age-13-16-19-fullbody-v1.png` 와 `identity/romance-male-age-13-16-19-motif-master-v3.png` 를 참조로 **동일 인물** 유지. 새 얼굴로 바뀌면 안 됨.
- **연령**: 1차에서는 대표 연령 **16세 기준 1장씩**(총 25장) 권장. (13/16/19 연령별 3종 세트는 2차로 분리 — 과도한 물량 방지.)
- **선화**: 함께 나오면 `identity/seonhwa-face-age-XX-neutral.png` 기준(만남 시 연령). 얼굴 동일성 유지.
- **의상·포즈·표정·카메라·장면**: 위 표 스펙 그대로.

## 5. 규격
- **형식**: PNG. 장면 일러스트이므로 배경 꽉 채움(투명 불필요).
- **비율**: 바캉스 이미지와 동일 계열 권장 — 세로 **768×1280**(3:5) 또는 만남 오버레이에 맞는 세로. (오버레이 표시 영역 확정 후 Claude가 CSS로 맞춤.)

## 6. 저장 경로·네이밍
- `assets/characters/romance/{id}/meet-{n}.png` (n=1~5, 에피소드 순서). 기존 `{id}/vacation.png`와 같은 폴더.
- 정확한 매핑은 3장 표의 "저장 경로" 열 그대로.

## 7. 코드 연결 (Claude 담당 권장)
1. `relationEpisodeCatalog`의 각 에피소드에 `image:'../assets/characters/romance/{id}/meet-{n}.png'` 필드 추가(25곳).
2. `playRelationEncounterScene(candidate,opening,resultLine)` → **episode(또는 image) 인자 확장**. `#relationEncounterScene`에 장면 일러스트를 배경/전면으로 표시(있으면), 없으면 기존 baseSheet 포트레이트 폴백.
3. 호출부(app.js, 현재 `playRelationEncounterScene(relationEvent.candidate, relationEvent.episode.line, ...)`)에서 `episode` 전달.
4. 바캉스 듀오 오버레이·데이트 scene도 `episode.image` 있으면 배경으로 사용(선택).
> ⚠ 이 코드 연결을 **Claude가 하면 Codex는 이미지 25장만** 지정 경로에 생성해 드롭인. `src/app.js`의 `relationEpisodeCatalog`/표시 함수를 Codex가 동시에 고치지 말 것(충돌).

## 8. 충돌 방지·절차
- 브랜치 `agent/pixel-schedule-handoff`, 기준 v0.63.76-claude-debug.2.
- 한 번에 한 에이전트만 git 작업. 검수 전 `main` 병합 금지.
- 순서 제안: (1) Claude가 episode.image 필드+표시 연결(폴백 포함) 커밋 → (2) Codex가 25장 생성해 지정 경로 저장 → (3) 라이브 확인 → (4) 검수 후 병합.
