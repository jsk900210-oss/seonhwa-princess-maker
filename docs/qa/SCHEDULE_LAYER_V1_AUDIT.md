# 일정 레이어 v1 품질 감사

- 감사일: 2026-08-21
- 대상: `assets/schedule-layers/`
- 판정 목적: v2 파일럿 제작 전 기존 묶음의 재사용 가능 범위 확인

## 결론

기존 묶음은 일정 ID와 과거 파일명 확인에만 사용한다. PNG를 복사·리사이즈하거나 v2 최종 자산으로 전환하지 않는다. 사용자 승인 전 기존 폴더는 삭제하거나 덮어쓰지 않는다.

## 기계 검사

| 항목 | 결과 |
|---|---:|
| 일정 폴더 | 22 |
| PNG | 359 |
| RGBA | 359 |
| 투명 픽셀 보유 | 359 |
| 빈 이미지 | 0 |
| 일정별 manifest | 0 |

RGBA와 투명도 보유 여부만으로 품질을 통과한 것으로 판단하지 않는다. 체크무늬가 픽셀로 구워진 이미지, 프레임 간 실루엣 변화, 합성 소품, 스타일 불일치는 별도 시각 판정 대상이다.

## 등급 기준

- `REJECT`: 그림체·비율·투명 배경·행동 의미·프레임 일관성 중 하나 이상이 배포 기준에 맞지 않음
- `REWORK`: 콘셉트만 참고할 수 있으나 신규 원본 제작 또는 대폭 보정이 필요함
- `REUSE`: 수정 없이 v2에 사용할 수 있음

## 폴더별 판정

| 일정 | 판정 | 근거 |
|---|---|---|
| painting | REWORK | 회화 콘셉트만 참고. NPC·패턴을 동일 픽셀 규격으로 재제작 필요 |
| music | REWORK | 악기 동작 콘셉트만 참고. 프레임 연결과 소품 비율 재설계 필요 |
| dance | REWORK | 춤 효과 콘셉트만 참고. 소매·리본과 기존 선화의 행동 일치 재검토 필요 |
| swordsmanship | REWORK | 표적·목검 콘셉트만 참고. 기존 선화 동작과 충돌 여부 재검토 필요 |
| spellcraft | REWORK | 효과 콘셉트만 참고. 동일 인물·알파·프레임 변화량 재제작 필요 |
| cooking | REWORK | 주방 배경 시설과 중복되는 솥·화덕 제거 후 재설계 필요 |
| martial | REWORK | 수련 소품 콘셉트만 참고. 선화 동작 범위와 맞춰 재제작 필요 |
| classics | REWORK | 책상·서책이 NPC 또는 패턴과 결합되지 않도록 분리 필요 |
| farmwork | REWORK | 농가 소품과 NPC 비율·바닥선 재설계 필요 |
| childcare | REJECT | 아이 NPC가 기존 임시 플레이스홀더와 동일 계열이며 실제 3프레임 동작 부족 |
| kitchenhelp | REJECT | 사용자 불합격 대표 사례. 주모·솥·도마·효과의 비율과 배치를 처음부터 재설계 |
| woodwork | REWORK | 작업 소품 크기와 NPC 실루엣 일관성 재검토 필요 |
| loomwork | REWORK | 베틀 배경 시설 중복과 실·북 레이어 분리 필요 |
| masonry | REWORK | 흙·기와의 전후 레이어와 실패 동작 재설계 필요 |
| clinichelp | REWORK | 약재·탕약과 의원 NPC를 분리하고 주방형 솥 중복 방지 필요 |
| innhelp | REWORK | 상·그릇·음식을 개별 레이어로 재구성 필요 |
| sewing | REWORK | 천·바늘·실을 NPC에서 분리하고 실제 프레임 차이 확보 필요 |
| copying | REWORK | 책상·종이·먹을 분리하고 기존 선화 손 위치에 맞춰 재배치 필요 |
| ferryhelp | REWORK | 짐·밧줄·물 효과의 바닥선과 원근 재설계 필요 |
| merchanthelp | REWORK | 상품·주판·동전 크기를 기존 선화 손과 맞춰 재제작 필요 |
| accounting | REWORK | 장부·주판·동전을 분리하고 배경 책상과 중복 방지 필요 |
| tutoring | REWORK | 학동을 실제 3프레임 NPC로 재제작하고 교재 레이어 분리 필요 |

`REUSE` 판정은 0건이다. 불확실한 자산을 승인 상태로 올리지 않는 원칙을 적용했다.

## 고정 선화 기준 — kitchenhelp

| 프레임 | 캔버스 | visible bbox | 바닥선 |
|---|---:|---:|---:|
| kitchenhelp-pixel-1.png | 320×320 | 76,41–244,304 | y=303 |
| kitchenhelp-pixel-2.png | 320×320 | 81,41–239,304 | y=303 |
| kitchenhelp-pixel-3.png | 320×320 | 81,41–238,304 | y=303 |

세 파일은 수정하거나 신규 이미지와 합성 저장하지 않는다.

## 별도 NPC 폴더 후보

- `teacher-*`, `dolsoe-*`, `herbalist-*`, `nanny-*`, `teacher-reading-*`: REWORK. 역할 참고용 후보이나 일부는 책상·바구니가 결합되어 있고 프레임별 폭 변화가 큼.
- `child-1~3`: REJECT. 세 프레임이 동일한 임시 플레이스홀더.
- `*-sheet*`, `*-chroma*`, `*-concept*`: REJECT. production 개별 PNG가 아님.
- `kitchen-aunt-tsukuru-v1.png`: REJECT. 체크무늬 배경이 구워진 비투명 가이드성 이미지.

## v2 전환 조건

1. `assets/schedule-layers-v2/`에 신규 제작
2. 정확히 1→2→3 반복
3. 개별 투명 PNG와 일정별 manifest 사용
4. 자동 검사와 HTTP 200 확인
5. 모바일 라이브 데모 승인
6. 승인 전 v1 참조와 폴더 유지
