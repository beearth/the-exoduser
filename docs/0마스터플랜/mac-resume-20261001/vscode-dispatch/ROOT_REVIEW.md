# 총괄 인수 검토와 복구 기록

2026-10-01. 배정 기록 15파일은 `94b47f87d9ec09675fcd5a9b24e628ccd70a8ece`로 커밋·push 후 원격 `codex/mac-environment-20261001`과 일치 확인했다. 생산 본편/easy SHA는 배정 기준과 동일하고 공용 인덱스는 비어 있다.

## QA 분류 보강 — 진행 중

검증기·계획을 직접 읽었다. 기존 구현은 atmos1→2 변화를 `qualityAutoChange`와 E2 경고로 노출하고 동일 조건 A/B에 단독 사용 금지라고 명시한다. 하지만 상위 `valid:true`·콘솔 `VALID`·exit0과 “유효한 기준점” 표현이 진단 자료 유효성과 비교 기준점 자격을 충분히 분리하지 못한다. 최종 옵션이 없어도 품질 안정 항목이 true인 경로도 있다. 프로파일러·대조 측정 조건을 비교 적격 필수 조건으로 검사하지 않는다.

같은 QA T1 / `88c3f903-ece5-4640-8b0c-86feaaca0e53`에 [분류 보강 한 건](QA-classification-followup.md)을 전달했고 실제 Read 응답·추론 착수를 확인했다. 원자료는 보존한다. `diagnosticValid`와 `comparisonEligible` 분리, 품질 변화·최종 옵션 부재·계측/대조 조건 미확인의 부정 fixture, 명시적 비교 검사 계약을 요구했다. 이전 QA receipt의 done 상태는 최초 과업의 이력이며 이 후속 완료 증거가 아니다. 후속 결과 검수 전 새 실측 release는 없다.

`trusted`는 사람 물리 입력이나 막타 피해원을 증명하지 않고, fpsCap=0은 GPU 완료·화면 표시 FPS를 증명하지 않는다. 과거 ring97ms·PC329ms 해결로 확대하지 않는다.

## 총괄이 직접 재확인한 제한된 결과

| 대상 | 재실행/검토 | 범위 |
|---|---|---|
| ITEM | 후보·최소 patch·테스트 소스 읽기, `node --test .../ITEM/ring-png-candidate.test.mjs` 9/9 PASS | PNG/물리 폴백·지연 로드·실패·캐시 mock 계약. 생산 patch/PNG 자산 미반영, 실제 성능·시각 인수 아님 |
| SKILL | `node .../SKILL/ice-cancel-probe.selftest.mjs` 38/38 PASS | 리스너·rAF·재설치·0표본·양성대조·MP 분리 mock. 실제 입력/기능 PASS 아님 |
| UIUX | 감사 소스 읽기·`node .../UIUX/audit-dense.mjs` exit0 | 기존 PNG3/JSON1 해시 일치,20표본 중 표시19/숨김1,간극2.668px. 새 실화면·canvas 가림 해결 아님 |
| BALANCE | `node --test test/onHitFireballStack.test.js` 8PASS/2SKIP | MISSING_HOOK·재귀 NOT_REACHED 유지. 효과 구현/재귀 안전 PASS 아님 |
| BUILD | 복구 검사 소스·보고 읽기 | 모형 HTTP·fixture 저장 범위. 포트 충돌 handler 부재와 `_` 슬롯 목록 누락 확인을 복구 성공으로 세지 않음. 실제 서버/패키지 재실행 안 함 |

위 검사 Node는 v24.15.0이다. 팀 도구를 생산에 연결하지 않았고 팀 산출 전체의 최종 인수를 선언하지 않는다. MAP/ART/ENEMY/ANIMVFX/SOUND 및 QA 후속은 각각 결과와 필수 게이트를 추가 검수해야 한다.

## 진행 중 파일의 별도 WIP 복구 스냅샷

19:21:49 KST에 확인된 팀 도구·docs 61파일(590,956바이트)을 독립 임시 Git 인덱스로 캡처했다. 본창 팀 산출·미완료 산출·QA 후속 지시서 포함이며 인증·사용자 세이브·캐시·기존 정규화22경로·무관한 WIP는 제외했다. 기존 HEAD·공용 인덱스 바이트가 전후 동일했고 캡처 중 파일 변경0을 확인했다. 이후 팀 편집은 포함하지 않는다.

- 원격 ref: `codex/backup-vscode-wip-20261001-192149`
- SHA: `02b0532dc95571e70cdb6fdee2c73a10de91a0bd` — push 성공 후 ls-remote 일치 확인.
- 로컬 manifest: `tmp/github-backups/vscode-wip-20261001-192149/manifest.json`(개별 blob/SHA256·포함목록·제외범위·원격 확인시각).
- **미검수 작업의 복구 사본**이며 정식 통합·기능 완료·게임/패키지 배포가 아니다. 현재 브랜치/HEAD/공용 인덱스는 이 백업 때문에 이동하지 않았다.

## 분류 재검토2 — root 소유권 인수

2026-10-01T19:46:27.443364+09:00 QA CLI가 두 번 idle임을 확인했다. 기존 VS Code QA 선택 후 AX와 화면이 일치하지 않아 review2 지시는 입력/전송하지 않았다(전송0, 중복0). 승인된 대체 절차로 QA 도구·result·receipt의 이 최소 수정만 root가 인수한다. 수정 전 사본은 `tmp/qa-classification-review2-before/`에 보존했다. 새 실측 release 없음. 현재 원격 HEAD `2b2a861a`, WIP ref `02b0532d` 일치 확인.

재검토2 최소 수정 후 34/34 계약 PASS. 메타 존재만으로 비교 true 없음. profiler 누락·오타입·상충 포함, 실제 raw 진단 exit0·비교 exit1 유지. 도구 인수 완료, 새 게임 실측 별도.


## ROOT 후속 인수 — 경량 정상 전투 / BUILD / SOUND / ENEMY

QA 분류 재검토2는 root 소유 인수 뒤 34/34 회귀, 경량 관측기5테스트 및 원격 `7526bf63` / `db09c0b7`까지 확인했다. 이어 게임2회 단독 관측 완료·release 닫힘. 첫 시행0처치 별도 보존, 두 번째 첫 입력 후5.2727초 첫 처치/17.8899초 자연사/적 최대43. draw 간격 최대109.8ms, 첫 처치 CPU 원인 미확정·FPS 개선 주장 없음. 별도 프로필 조건 미충족과 초기 옵션 변화를 명시했다. [실측 근거](../Mac-정상전투-경량관측.md).

BUILD 기존26/26 계약을 root 재검사하고 기존 세션 `01a0f6e6-2e4c-7322-92d7-3aa309857856`에 포트 오류 후속1건만 queue했다. 실제 수신·소스 읽기10:52:33Z, 완료10:53:08Z 확인. root가 두 후보와 검사 코드를 읽고 13/13를 다시 실행해 통과했다. 실제 socket0, 후보만 인수·생산 미반영. NW.js 창의 기존 서버 오인 진입은 해결되지 않았다.

SOUND `aa3ac0ed-f4e5-44ad-a0b2-d4d2da045b84`의 읽기 전용 도구 구성 때문에 파일 저장이 막혔다. 기존 세션 마지막 보고를 root가 원문 추출해 result/receipt로 보존했다. 권한 확대·새 세션 없음. **root 소스 대조 정정:** 후보 `49851bd`의 main에는 SFX_MAP/BGM_MAP/bgmPlay 제거 및 howl phase2 억제가 있으나 easy에는 세 상수와 무조건 howl이 남는다. 양쪽 변경 제안은 기존 커밋 단순 채택이 아니라 easy 신규 확장이다. 자동 청취/실제 howl 횟수 검수0, 생산 적용0. 팀 보고를 현재 양쪽 구현 완료로 인수하지 않는다.

ENEMY 기존9/9 모의 검사 통과 후 root 추가 재현에서 `getTick()=>null`·rAF451회가 `elapsedTicks:null`, `tickSource:unavailable(_gameFrame)`, `inRangeTicks:451`, `FAIL_NO_FIRE`로 잘못 분류됐다. 시계 미확인 자료는 INCONCLUSIVE여야 한다. 물리 tick 누락을 rAF로 대체하는 결함이 있어 라이브 판정용 인수 보류. ENEMY 후속 지시는 native 입력 포커스를 확인할 수 없어 아직 전송하지 않았다. 전달 완료나 AI 자체 결함으로 보고하지 않는다.

BUILD 다음 한 건은 기존 세션의 실패 포트→NW.js 진입 차단 정적 추적/독립 후보다. `BUILD-entry-followup.md`를 공식 queue로1회 전달했다. 이 기록 시점에는 대기열 등록만 확인했고 실제 수신·착수·완료는 후속 receipt로 구분한다. 실제 게임/소켓/빌드는 금지했다.

BUILD failure-entry 후속 실제 수신/착수11:05:52Z·완료11:06:56Z. root가 전체 후보·검사 코드를 읽고19/19 재실행 PASS. 생산/실제NW.js 미인수. 다음은 기존 세션에 context-probe 하니스 준비1건만 queue, QA 중 실제 실행 금지. 실제 수신은 별도 확인한다.


## ROOT 긴 간격 후속 마감

기존run2 109.8ms는 최초공격 전/첫처치 관측보다 약5초 전으로 정정했다. 별도진단1회에서 `_warmupNext`의 IdleRequestCallback130.7/135.6/131.0ms를 브라우저scripts로 직접 귀속, 샘플스택 texImage2D 경로와 대조했다. 원래109.8ms의 소급 원인 확정은 하지 않는다. 새진단 무처치/15.216초 자연사, 별도draw103.3ms는 physicalImpactSheet/tint/getImageData 표본과 상관. source불변·프로파일중지·관측기복구·게임종료. [전체 시점·시계오차·한계·좁은 후보와 회귀기준](../Mac-긴간격-루프밖-귀속.md).

BUILD context-probe 기존세션 수신/착수11:10:12Z·완료11:11:26Z. root가 node/page/manifest/README를 읽었고 준비범위 인수. 실제NW.js 실행0·동일process/진입차단 미검수. 제한된 기존경로 검색에서 실행파일 미발견이므로 설치완료/전체미설치로 단정하지 않는다. 현재 대기는 기존 런타임경로 확보와6시나리오 실제검수다. QA는 종료되었지만 root가 NW.js 실행을 시작하지 않았다. 추가 중복지시 없음. ENEMY tick누락 오판정·SOUND easy불일치는 미인수 상태 유지.
