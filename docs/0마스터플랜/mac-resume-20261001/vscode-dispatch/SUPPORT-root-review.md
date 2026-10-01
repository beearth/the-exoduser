# 지원 후보 3건 인수 — 2026-10-01

기준 HEAD `8d221540594cddebcb9f73fd785f3f82df631268`. 생산 게임·easy·로비·서버 변경 0. 원 ART/SKILL/ENEMY 파일은 읽기 전용으로 보존하고 아래 지원 후보만 검수했다.

| 담당 → 원 역할 | 인수 대상 | 검수와 한계 |
|---|---|---|
| ITEM → ENEMY | `ITEM/enemy-support-probe.js` | null/비정상/역행/정체 tick에서 INCONCLUSIVE. rAF와 실제 tick 증가를 분리하며 관측하지 못한 tick을 보충하지 않는다. 120 rAF 연속 정체 기준. 원9 assertion+새17 시험 통과; root Node runner는 기존 스크립트1+새17=18개로 표시. 실게임 tick 연결·AI 품질 검수 아님. |
| UIUX → ART | `UIUX/art-support-finalcrop.mjs` | 실제 draw 원문의 clip/letterbox/camera/zoom/shake/cover와 4화면비×3시점 대조. 원4PASS12FAIL→후보16PASS. fade0은 가시성 증거 아님. 눈·발·자막 픽셀 판정 UNKNOWN. |
| BALANCE → SKILL | `BALANCE/skill-support-probe.js` | 두 끝점만으로 충전/환급 확정 금지. 연속 updateSeq·전체 rechargeTrace가 실제 충전식을 만족할 때만 충전 확인. 기본 reader는 trace 미제공. 정정66 assertion+새9 시험 통과. |

## 독립 감사와 root 보강

BUILD가 14:38:24Z 실제 읽기 후 독립33검사를 실행해 31PASS/2FAIL을 제출했다. S1은 cancelAnimationFrame이 취소 전에 예외를 던지면 ID를 잃어 재정리가 안 되는 문제, S2는 사용자 주입 reader가 반환한 필드 getter 예외가 전체 처리 밖으로 빠져 listener3개가 남는 문제다. 원 실패 evidence와 지원 원본은 `tools/team-followup-20261001/root-review/support-before/`에도 보존했다.

root가 지원 SKILL 후보의 취소 실패 ID를 유지하고 재dispose를 허용했다. 소비된 callback의 ID는 진입 시 비우며 표본 전체 처리 예외도 기록·dispose하여 UNKNOWN으로 분류한다. 실제 브라우저 취소 API가 계속 실패하는 경우 즉시 해제를 보장하지 않는다. 취소되지 않은 callback이 실행돼도 disposed 상태에서는 관측/재예약하지 않는다.

14:41:47Z root가 BUILD의 독립 검사 코드를 복사해 수정 후보를 실제 실행했다: **33PASS/0FAIL**. `findings` 배열의 S1/S2 두 행은 입력·결과 추적용이며 최종 실패 수가 아니다. 별도로 ENEMY18 시험, ART16 시험, SKILL9 시험 및 정정66 assertion PASS. 원 실패 로그·기존 잘못된 기대값14FAIL·fixture 초기 실패 로그를 덮어쓰지 않았다. 최종 해시는 `root-review/support-final-evidence.json`, 명령 결과는 `outputs/team-review-20261001/support/root-validation.json`을 따른다.

## 운영과 다음 검수

Claude 기존7 세션은 14:41Z 조회에서 idle. native 최신 확인은 Mac locked이며 기존 초안·큐는 UNKNOWN. ITEM/UIUX/BALANCE는 지원 후보 제출 완료로 정정한다. BUILD는 독립 감사 완료; root가 S1/S2 보강·재검수 완료. 새로운 팀/세션이나 중복 지시는 없다.

다음은 기존3340·격리된 새 origin·기본 품질의 정상 전투 단독 측정이다. 첫 처치 전부터 시작하여 자연 밀집까지 이어가고 소스SHA/해상도/옵션/전경을 기록한다. CPU draw와 rAF 간격은 분리하고 GL 비용은 별도 미측정으로 둔다. 옵션 변경·관측 누락은 성능 인수에서 제외한다. 아직 실전 성능 또는 패키지 완료가 아니다.
