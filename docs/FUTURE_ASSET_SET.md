# 차기 시스템 이미지 세트

현재 게임에는 아직 연결하지 않고 다음 시스템 구현 시 즉시 사용할 수 있도록 준비한 자산이다.

- `assets/characters/companions/portraits`: 동행 조연 8명, 투명 PNG 384×384
- `assets/events/weekly-v2`: 주간 돌발 사건 12종, WebP 768×432. 선화 원화와 동일한 깨끗한 비주얼노벨 CG풍의 현재 사용본
- `assets/events/weekly`: 초기 민화풍 시안. 게임 연결에는 사용하지 않는다.
- `assets/endings/gallery`: 엔딩 도감 표지 10종, WebP 432×648
- `assets/ui/mastery`: 숙련도 6계열 × 5단계, 투명 PNG 128×128
- `assets/future-assets-manifest.json`: 시스템에서 사용할 안정적인 자산 ID

## 권장 연결

- 학문: 훈장, 학문 숙련 배지
- 예절: 예절 스승, 예절 숙련 배지
- 아르바이트: 돌쇠·장사꾼, 생활/상업 숙련 배지
- 약초: 약초꾼, 의술 숙련 배지
- 예술: 바느질 친구, 예술 숙련 배지
- 무예: 무예 교관

주간 사건은 계절 및 능력치 조건으로 선별하고, 엔딩 표지는 미발견 상태에서 CSS 실루엣 처리한다.
