# UIUX-HUD-OCCLUSION-CANDIDATE — 다음 승인 작업 결과

## 수신·착수·완료 구분

NEXT_TASK를 읽고 이전 UIUX-result 및 팀 MD의 부분 완료 상태를 확인했다. 이 과제의 중복 실행 산출은 없었다. 같은 기존 대화에서 현 소스 `_drawEnemyShotWarnings` → 투사체/VFX → 피해숫자 → world restore 경로를 읽고 후보 작성·작은 Node 회귀를 실행했다. 실제 model/session ID는 도구에서 확인하지 못했으므로 receipt의 실제 ID는 null, 배정 문서 ID는 별도 필드로 기록했다. 생산 파일·공용 테스트·총괄 MD·타팀 파일은 편집하지 않았다.

지정된 독립 후보 및 합성 회귀 산출은 완료했다. **생산 적용/Canvas 실화면 판정/성능 검수는 미완료**다. opacity/표시 조건/공격 수/전조60f/물리E·마법Q 패링/수치·수명·저장을 바꾸지 않는다.

## 원인 근거와 후보 분리

직전 배정에서 실제 열었던 before/after/final PNG3장 및 final JSON20표본(표시19/숨김1)을 재사용했다. 중앙 charge 라벨과 damage/플레이어 가림 근거이며 이번에 새 게임 화면을 찍지 않았다. PNG/DOM20표본에는 canvas 라벨 개별 bbox/피해수치 좌표가 없다. 아래 합성 fixture를 실제 적 좌표라고 주장하지 않는다.

현 소스는 경고 링/라벨을 적 본체 뒤·탄막 앞에서 그린다. 이후 투사체와 VFX가 있으므로 라벨이 뒤에서 덮일 수 있는 경로는 확인됐지만 특정 PNG의 가림 원인이 모두 이 순서라고 확정하지 않는다. 피해숫자는 뒤쪽 별도 패스이나 서로 겹치거나 이후 효과/페이드에 묻힐 수 있다. CSS 변경으로 canvas 내부 문제를 해결하지 않는다.

| 후보 | 파일·정확한 역할 | 판정/제약 |
|---|---|---|
| P1 draw 우선순위 독립 hunk | `tools/team-followup-20261001/UIUX/charge-priority.candidate.diff` — `_drawProjectileChargeLabel` 호출을 프레임 큐로 저장, 기존 그리기를 `_paintProjectileChargeLabel`로 분리. draw 시작에 큐를 비우고 기존 damage 패스 종료 뒤 world restore 직전에 flush | 미적용. 기존 링은 원래 위치/시점 유지, 텍스트/좌표/13px/배경.92/20px/폭캐시 유지. 라벨이 피해숫자를 다시 덮을 위험이 있어 이것만 단독 채택하지 말 것. 후처리 atmosphere/나중 패스/GL batching은 별도 검수 |
| P2 charge/damage 배치 독립 함수 | `tools/team-followup-20261001/UIUX/layout-candidate.mjs` — 실제 측정 bbox 입력, charge 우선 배치/피해수치 후순위. 반환은 원래 ID 순서, 표시 좌표 deltaY만 후보 | 합성 회귀14/14. 생산 경로 연결 안 됨. 공격 ticket/라벨 삭제/숫자 축약 없음. 원래 게임 객체를 수정하지 않는 순수 계산 |
| P3 인수/해상도 조건 | 아래 표 및 기존 `QA-capture-conditions.md` D01/D02/D06 | 실제 world→화면 변환과 글자 치수·안정 ID 연결을 총괄이 확정한 뒤에만 hunk 적용 검토 |

## P2 배치 계약 — 제안 수치, 현행 확정값 아님

| 항목 | 후보 계약 |
|---|---|
| 좌표 | 논리 화면 px bbox(x,y,w,h), viewport(x,y,w,h), 별도 HUD/플레이어 등 예약 bbox. NaN/0크기/중복ID/알 수 없는 kind 거절 |
| 최소 간격 | 기본4px. charge 높이20px fixture이면 step24px |
| charge 위치 | 원위치 → 위1step → 아래1step → 위2step → 아래2step. X 좌표는 유지, 최대2step 이동 |
| damage 위치 | 원위치 → 아래1step → 위1step. 실제 폰트/비트맵 크기에 따라 step=h+gap |
| 우선순위 | charge 먼저, 동일 종류는 입력 순서. 입력 순서는 실제 안정 ID와 함께 고정해야 함. 출력 순서는 원입력과 같으므로 그리기 caller가 damage→charge 패스를 명시 |
| 대상 연계 | 이동된 항목에는 원래 중심→새 중심의 leader 좌표 반환. 실제 선 렌더는 미연결. 선이 플레이어/탄을 가리지 않는지 QA 필요 |
| 포화 | 슬롯 없음/너무 긴 문구면 원위치 보존 및 unresolved=true. 개수·문구·공격을 제거/합치지 않음. 포화 이후 무겹침 PASS 금지 |
| 보호 | t.x/y/life/ml·치명타/피해 수치·원래 알파 계산과 drawNumStr는 변경하지 않음. 화면 이동은 그리기용 translate 또는 복사한 좌표에만 사용 |
| 수명·안정성 | 모듈은 프레임 상태를 저장하지 않음. 실게임에서는 생성 ID/슬롯 재사용/카메라 이동 시 안정성·깜빡임 검수 필요. 실제 시간 안정성은 미구현 |
| 비용 | 최대5후보×기존 bbox 순회: O(n(n+m)) 상한의 실험용 구현. 실게임 성능 최적화 완료 아님. 밀집 프로파일 전 핫패스 채택 금지 |

실제 damage 측정은 `drawNumStr`의 비트맵 gap/폭·bounce/흔들림과 일반 텍스트의 실제 폰트/외곽선을 포함해야 한다. label은 기존 `_chargeLabelMetrics` 캐시(ctx/label/font + font 로드 무효화)를 유지한다. 실제 transform은 world translate의 Math.round/카메라 shake, `_tzoom`, SSAA/DPR, 논리VW/VH와 CSS 표시크기 차이를 모두 포함해야 하며 X.getTransform 지원을 GL/WebGPU에 가정하지 않는다. 이 연결이 미확정이라 P2를 생산 hunk에 억지로 넣지 않았다.

## 결정적 검증 결과

| 검사 | 결과 |
|---|---|
| layout 구문/합성 회귀 | `node --check …/layout-candidate.mjs`, `node …/layout-candidate.test.mjs`: exit0,14/14. 원위치/중복24px분리/charge우선/damage후순위/입력불변/포화/해상도3종/긴문구/예약HUD/잘못된좌표/중복ID/빈프레임/줌동치 |
| 120동일 좌표 fixture | 입력120→출력120. 분리5개, unresolved115개. 밀집 실화면 해결 증거가 아니라 포화 정직성/보존 회귀 |
| hunk 생성/구문 | `node …/build-priority-candidate.mjs`: exit0. 현재 본편에서 정확한 함수·두 유일 앵커를 읽어 diff 생성; 변경 후보 메모리의 실행 inline script4개 vm 구문 PASS |
| 큐 VM 검사 | enqueue2회 즉시 paint0, flush 뒤 paint2, 재flush 추가0. 원문/좌표 순서 보존. 원자료 `priority-validation.json` |
| 최종 hunk 재검증 2026-10-01T11:48:40Z | 생성된3hunk를 메모리에서 역순 재구성해 기대 후보와 전체 텍스트 동일 확인/exit0. 생산 game.html 재읽기 동일 확인. 디스크 적용/Git 명령0 |
| 최초 생성기 오류 | importmap JSON을 JS로 파싱해 SyntaxError/exit1. 실행용 script 타입 필터를 수정한 뒤 재실행 성공. 실패를 숨기거나 생산 오류로 기록하지 않음 |
| docs 전체 검색 | `rg -n 'UI-03|_drawEnemyShotWarnings|_drawProjectileChargeLabel|_FLOAT_TEXT_ENABLED|피해숫자' docs/ --glob '*.md'`: exit0. 원본 매칭 `next-doc-matches.txt` |

명령 로그는 `layout-validation.txt`, hunk 입력SHA/실행 script수는 `priority-validation.json`에 보관했다. module/importmap 검증 제외는 명시적이며 이번 변경은 일반 inline 영역만 대상으로 한다. diff를 디스크/공용 인덱스에 apply하지 않았다.

## QA 해상도·채택 게이트

| 조건 | 필수 비교·미완료 게이트 |
|---|---|
| 본편1280×800/1324×982 | 동일 seed/적·스킬·카메라·장비에서 원본/P1/P2 별도 비교. 공격전/최대밀집/발사직전/직후 영상. bbox·원위치·delta·leader·unresolved·paint 순서 기록 |
| 390×844 / KO·EN | 실제 측정 긴 예고 문구 폭/피해숫자 bounce/좌우 모서리. 글꼴 축소/클립/예고 삭제로 PASS 만들지 않음. oversized/unresolved는 RETOUCH |
| 줌1/.62, shake, DPR/SSAA | 원래 적/숫자 좌표와 배치 화면 좌표 및 역변환 대조. 순수 합성 줌동치 PASS로 실제 카메라 PASS 대체 금지 |
| 렌더러 | WebGPU/GL/Canvas 지원 경로 각각 paint 순서·font cache·save/restore·합성/alpha·후처리 영향, UI 클릭 통과/설정 재열기/기존 HUD 겹침 |
| 피해/전투 보호 | 숫자 개수/문구/수명/알파 불변, 예고60f 및 물리E·마법Q 계약 불변, 링과 라벨 대상 연계 유지. 라벨/leader가 플레이어를 가리지 않는지 확인 |
| 쉬운판 | FRAME_DROP_HUD_TEXT 기록상 이 경고 함수 없음. P1은 본편만 대상이고 쉬운판에 새 기능 추가 금지. damage 경로는 쉬운판을 별도 읽고 소유권 확정 후 후보 검토 |
| 성능·최종 판정 | QA 전용 단일 실행에서 추가 bbox 측정/배치 CPU·메모리/긴프레임을 분리. 현재 판정은 **후보 정적 PASS / 시각 미검수 / 밀집 포화 RETOUCH** |

## docs 인계

소유권 밖 문서는 수정하지 않는다. 총괄이 실제 채택할 경우 `UI_UX_IMPROVEMENT_PROJECT_20260930.md`에 P1/P2와 시각 상태를 기록하고, `탄막시스템_총정리.md`의 `_drawEnemyShotWarnings` 표에서 링 원래 패스/텍스트 최종 world 패스를 분리해야 한다. `PHYSICAL_PROJECTILE_VISIBILITY_20260914.md`, `FRAME_DROP_HUD_TEXT_20260928.md`, 최적화 문서에는 기존 폭캐시 보존/새 큐 회수 및 실제 비용을 동기화한다. 후보 step/gap 수치는 적용 전까지 확정 설계로 반영하지 않는다.

다음은 총괄의 함수 소유권·정확한 bbox 변환 연결 인수와 QA 단독 실화면/성능 검수다. 새 세션/게임/서버/브라우저/유료서비스/이미지/인코딩/대형빌드/PC/Git조작은 실행하지 않았다.
