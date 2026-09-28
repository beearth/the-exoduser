# 장비창 전체 구성 정비 (2026-09-28)

| 항목 | 현행 규격 |
|---|---|
| 영역 비율 | 1201px 이상 장비:가방:정보 `1.25:1.1:.85`, 간격10px. 기존 작은 화면 배치는 유지한다. |
| 배경 | 장비 탭 외곽과 장비판의 원형 각인·큰 아치를 제거. 금속 질감과 낮은 대비의 기사 발 아래 낮은 타원 받침로 기사와 슬롯을 묶는다. |
| 장비판 | 654×560px. 16개 슬롯 위치는 `2_7 인벤토리+장비시스템.md`의 EQ_POS 표를 따른다. 기사는 기존 원화를 정식 alpha 컷아웃으로 분리해 유지한다. 표시 영역385×560px. |
| 슬롯 | 클릭 영역96×96px, 장식 영역96×128px. 승인 슬롯 원화 ossuary_socket_hf_v2.png를128×128px로 중앙 배치하고 외곽 배경은 CSS polygon으로 제한. 스킨62×62px(left17/top12), 명판13px(left/right19/bottom12)·글자10px. 선택은 프레임 brightness1.5/saturate1, 기본1.12/.85, 빈 홈.66/.55. 등급은 하단6px 마름모로 표시. |
| 화면 맞춤 | `inventory-paperdoll.js` ResizeObserver: `max(.1,min(2.1,(W-36)/654,(H-98)/560))`. 헤더·하단 현황 공간을 확보하고 초광폭에서도 장착도를 확대한다. |
| 현황 | 장착 부위·보석 홈·전투력은 박스 배경을 제거하고 상단 및 셀 사이 구분선으로 정리한다. |
| 연결 | `inventory-space.css?v=20260928-relic-frame1`, `inventory-paperdoll.js?v=20260928-equipment-cutout3`. 갑옷 픽셀을 보존한 로컬 컷아웃·로드 폴백·선택·호버·우클릭 해제·저장 형식 유지. |
| 이전 버전 검증 | Chromium 1940×1080, 3440×1440, 970×579, 390×844에서 슬롯16개가 장비판 경계와 하단 현황 안에 들어옴. 아치 pseudo-element 제거·pageerror0. 장비 선택·우클릭 해제·guard 통과. `tmp/equipment_cabinet_1940.png`, `tmp/equipment_cabinet_3440.png` 시각 검수. |


## 2026-09-28 기사 원화 보존과 중앙 구도 수정

| 항목 | 현행 규격 |
|---|---|
| 원인 | 밝기 임계값 마스크가 배경과 연결된 갑옷 그림자를 함께 지워 윤곽만 남김. 런타임 밝기 키/외곽 flood-fill 폐기 |
| 아트 | img/ui/inventory_knight_cutout_20260928.png, 688×1024 RGBA, 1265160바이트. Higgsfield image_background_remover job625361b0-5c91-425d-8321-771a9f172fd8. 신규 기사 생성 없음·기존 원화 보존 |
| 표시 | 385×560px, contain·mask none·opacity1·normal, brightness1.65/contrast1.02/drop-shadow(0 8px 12px #000). decode 완료 후 is-ready, 실패 시 기존 로컬 투명 기사 폴백 |
| 구도 | 장비판654×560px. 행 top30/162/294/426px·96px 슬롯. 바닥 받침 left/right225px·bottom9px·height26px·border-radius50%, 중앙 세로 레일 제거 |
| 맞춤 | max(.1,min(2.1,(W-36)/654,(H-98)/560)). 헤더와 하단 현황을 피하고 기사·카드를 함께 배율 조정 |
| 연결 | game.html의 기사 src는 로컬 PNG. inventory-space.css 캐시20260928-relic-frame1, inventory-paperdoll.js·knight-portrait.css 캐시20260928-equipment-cutout3. img/ 재귀 복사로 NW.js 패키지 포함 |
| 검증 | 2190×721 및2194×1234 CSS 화면에서16슬롯 잘림0·중심 hit16/16. 원래 기사 가슴·허벅지·종아리 그림자 보존 실화면 확인. 저장·아이템 수치 변경 없음 |


## 2026-09-28 승인 석재·황동 프레임의 장비 슬롯 적용

| 항목 | 구현 계약 |
|---|---|
| 원화 | `img/ui/ossuary_socket_hf_v2.png`. 사용자가 재지정한 기존 승인 원화를 재사용. 이전에는 유골함만 연결되어 있었음. 신규 이미지 생성 없음 |
| 적용 | 장비 탭의 `.inv-eq-slot` 16개. `inventory-space.css`의 마지막 장비창 규칙이 프레임을 표시 |
| 비율 | 슬롯 클릭 영역96×96px, `::before` inset −16px 0, 원화 background-size128×128px. 상·하 장식을 포함한 영역96×128px |
| 외곽 | CSS polygon: 50% 1%,58% 9%,55% 14%,78% 15%,94% 25%,94% 79%,81% 88%,58% 89%,50% 98%,42% 89%,19% 88%,6% 79%,6% 25%,22% 15%,45% 14%,42% 9%. 원화 외곽의 사각 빛 번짐을 제한 |
| 내부 | 스킨62×62px, left17/top12px. 이름 띠 높이13px·left/right19px·bottom12px·글자10px. 로드 실패 배경은 중앙60×72px 검은 그라데이션 |
| 등급 | 하단6×6px 마름모, left45/bottom5px, 테두리1px. 등급색은 기존 `--socket-tone` |
| 강조 | 기본 brightness1.12/saturate.85, 빈 슬롯 .66/.55, hover·selected 1.5/1. 선택 명판 #fff0c5. 전환 .14s, reduced-motion에서는 전환 없음 |
| 입력 | 프레임·아이콘·이름·등급 장식은 pointer-events:none. 기존96×96px 슬롯이 입력을 받음. 장착·저장 데이터와 기존 핸들러 유지 |
| 연결 | `game.html`의 `inventory-space.css?v=20260928-relic-frame1`. 기존 img/ 패키징 경로 재사용 |
| 실화면 검수 | CSS2162×721 및1097×617에서16개 프레임 표시, 장식 경계 잘림0, 중심 입력 대상16/16. viewport override 복원. 선택 동작의 지속 상태는 이번 프레임 검수에서 확정하지 않음 |
