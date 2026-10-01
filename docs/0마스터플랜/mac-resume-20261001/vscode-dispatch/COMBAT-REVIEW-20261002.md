# Mac QA·SKILL·ENEMY·ANIMVFX 후속 인수 — 2026-10-02

총괄 지원 검토 범위는 `tools/team-followup-20261002/combat-review/`와 이 문서다. 생산 HTML·공용 팀 MD·공용 인덱스·사용자 세이브 변경0, 게임·서버·빌드·UI 실행0이다. 지원 하위 에이전트의 소스 검수와 기존 Claude 원담당의 수신·Read·착수는 별개다.

2026-10-01 23:17:17 UTC에 현행 HEAD `5b8e6ba9d952d1148048c2889c588531640698fe`와 Git 43항목을 관찰했다. 시작 관찰23항목, 실제 감사 시작24→재감사 시작32→종료43항목이며 다른 지원 담당 산출도 함께 증가했다. 정확한 상태 원자료는 `tools/team-followup-20261002/combat-review/status-evidence.json`에 있다. 읽은 원담당 활용표 snapshot은 `2026-10-01T18:53:31.855475+00:00`이며 현재 CLI를 직접 접속해 새 수신을 확인한 기록이 아니다.

| 역할 | 원담당 최신 상태 | 승인된 다음 한 건 | 필요한 검수 게이트 | 이번 지원 진행 |
|---|---|---|---|---|
| QA | `host-native-acceptance` 준비, 전달0·Read0·미가동; 이전 D17 독립20그룹 인수 완료 | 독립 ITEM host의 실제 설치·생성·JSON 복원·해제 | root가 식별한 독립 UI·실제 오류 원문·행동별 카운터·CSP 위치; 사용자 탭 접근0 | 정상전투/첫처치 관측기와 새 입력경로 분석 CLI 준비. 이번 신규 실측0 |
| SKILL | `mortar-integration-ready` 준비, 전달0·Read0·미가동; 이전 실제3슬라이스19검사 인수 | 기존 mortar 가드의 현행 양쪽 생산 함수 문맥·드리프트·인접 회귀 확인 | 원함수 SHA·패치 적용가능성·동적 실제 MP 비용·정상/RNG parity; 생산 적용 뒤 실제 플레이는 별도 | 실제 현재 소스 새 감사38 PASS/0 FAIL. 헤더만 정규화한 미적용 patch 준비 |
| ENEMY | `telegraph-cancel-boundary` 준비, 전달0·Read0·미가동; roundrobin-order-effects 제출·runtime 검수 대기 | 기존 공격 예고의 피격·사망 취소 경계 원문 fixture | 예고 생성/상태정지/피격/사망의 실제 원문과 계약, 재현되면 최소 후보; 전투 수치·티켓 변경0 | 팀 SSOT·최신 과제 읽기 인수. 이 소스 fixture는 이번 실행하지 않음 |
| ANIMVFX | `foot-shadow-anchor` 준비, 전달0·Read0·미가동; 이전 corpse-flash 원담당 수동모형에 root actual12그룹 보충 | 승인 렌더러 발 위치·그림자 기준점 원문/metadata 대조 | 프레임·스케일·오프셋 근거 및 의도된 연출 구분, 실제 시각 검수 별도; corpse fade 보류 유지 | 팀 MD·최신 과제 읽기 인수. 이번 실화면·새 에셋·렌더 수정0 |

## SKILL: 기존 가드의 새 적용준비 근거

`node tools/team-followup-20261002/combat-review/mortar-integration-audit.mjs`를 실제 실행해 **38 PASS/0 FAIL**을 확인했다. 기존19검사의 반복 실행으로 집계한 숫자가 아니다. 현재 양쪽 실제 aim-start/confirm/fire 및 `_COST_BASE`·`_COST_SK`·`_COST_DPS`·`_skLv`·`_dpsCostMul`·`pMagicCost`·`mpCost`·`useMp`·`_r` 원문을 실행한다. 환경의 PASSIVES/어픽스/유니크 조회와 SFX는 fixture다.

| 새 확인 | 결과 | 한계 |
|---|---|---|
| 원담당 frozen과 현행 fire 함수 바이트 | 양쪽 SHA `cdeeead948d5518c6beeb8f3eee4fbf38eed8cc785165738f7150f8c375f2f49` 동일, 789자 | 전체 HTML SHA는 타 기능을 포함하므로 별도 기록 |
| aim/confirm/cost source parity | 양쪽 각 슬라이스 SHA 동일 | 전체 게임 parity 판정 아님 |
| Lv1/Lv5/Lv20 및 할인 하한 조합의 비용−0.25 MP | 원본 무료발사 재현, 후보는 발사·차감·쿨·RNG·음향카운터0, 조준 유지 | 실제 게임에서 MP가 감소하는 자연 입력은 미측정 |
| 정확 비용, voice RNG 두 분기 | 원본/후보 전체 P·bomb·lastCost·직접 호출된 RNG 카운터 동일 | 전체 프로그램 RNG와 실제 오디오 청취는 미검수 |
| 조준 중 magic discount 변경으로 비용 상승 | 실제 `pMagicCost`/`mpCost`가 확정 시 최신 비용을 계산하고 후보가 거부 | fixture PASSIVES 변경이며 사용자 상태를 쓰지 않음 |
| 저MP 릴리즈 실패 후 새 입력 없음 | `_mmCharging=false`, 추가4회 confirm에서 안내/RNG 반복0 | 실제 프레임 드라이버는 fixture |
| 합체 저MP 실패 | 기존 bomb 객체·기존 `_ioCd=77` 보존 | 기존 bomb은 경계검사용 fixture |

현행 소스의 실제 비용은 `~~(50 × (1+(maliceMortarLv−1)×0.35) × pMagicCost())`다. 레벨은 `P.skills.maliceMortar||1`, `pMagicCost()` 계수 하한은0.40이다. 할인없는 Lv1→10의 최종 MP는50→207이며 중간 원값207.5에 `~~`가 적용된다.207.5를 실제 차감 MP로 기록하지 않는다. 이 감사는 비용을 바꾸지 않는다. 새 raw에는 각 조합에서 계산된 actualCost와 원본/후보 상태가 모두 저장된다.

새로 확인한 적용 장애는 **owner patch의 파일 헤더**다. 기존 `mortar-confirm-source-{game,easy}.patch`의 `+++`가 `/private/tmp/claude-501/.../scratchpad/mm/...`를 가리켜 현행 Git의 `git apply --check`는 `No such file or directory`로 실패했다. 소스 문맥 드리프트나 생산 결함 추가를 의미하지 않는다. 원담당 patch는 그대로 보존했다.

지원 파생본 `tools/team-followup-20261002/combat-review/mortar-integration-targets.patch`에서 `--- a/game*.html`·`+++ b/game*.html` 헤더만 정규화했다. **각 @@ 이하 hunk 바이트가 원담당 patch와 동일**하며 combined `git apply --check`가 통과했다. patch는 미적용이다. 기존 가드는 함수 시작의 MP 재검사1줄이며 새 로직 후보를 설계하지 않았다.

첫 감사 원자료 `mortar-integration-first-run.json`의31 PASS/4 FAIL도 보존했다. 2 FAIL은 frozen 파일의 설명주석까지 비교한 지원 하니스 오류로, 원함수만 추출하도록 수정했다. 다른2 FAIL은 위 파일헤더의 실제 적용 준비 장애다. 최종 근거는 `mortar-integration-evidence.json`이다. 원담당 결과의 미래시각/전체 RNG0 표현을 현행 인수로 승격하지 않는다.

## docs 전체 검색과 생산 인수 전 동기화

`rg -n -i 'mortar|폭풍소환|fireMaliceMortar|light-normal-observer|qa_first_kill_cpu_probe|telegraph|foot.shadow' docs/ --glob '*.md'`를 실행했다. 기존 문서166매칭의 원문을 `tools/team-followup-20261002/combat-review/docs-search-20261002.txt`로 보존했다. 지원 도구 추가 후 관련 현행 계약과 미적용 상태를 이 문서에 기록했다. 공용 SSOT와 NFD 백업을 임의 수정하지 않는다.

아래 표는 지원 검토 시작에 읽은 정정 전 표기의 이력이다. **root가2026-10-01 23:19:22.401841 UTC에 canonical3문서의 mortar 비용 부분을 정정 완료**했고, 지원이 실제 수정내용과 `tools/team-followup-20261002/owner-dispatch/mortar-doc-sync.json`의 before/after SHA·백업기록을 읽어 인수했다. 비용에는 `~~` 정수반환·Lv10 최종207·최저 계수0.40에서83을 구분한다. 피해10/+15%와 역사 NFD백업은 보존했다. 다른 키의 오래된 비용 흔적은 이번 범위 밖 미검수다.

| 문서 | 정정 전 읽은 표기 | 현행 소스와 관계/후속 처리 |
|---|---|---|
| `docs/14밸런스+수치테이블/자원소비량표.md` 52·93행 | mortar base50·+35%/Lv | 현행 비용 SSOT와 일치 |
| `docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md` 정정 전135행 | base250·+15%/Lv·250→587 | 현행 base50/+35%와 불일치를 재현했고 root 정정 완료 |
| `docs/14밸런스+수치테이블/스킬별_DPS_자원소비표.md` 정정 전45·51·130행 | mortar250·+15%·MP250×DPS | 비용 부분3개소 root 정정 완료, 피해배율 분리 |
| `docs/14밸런스+수치테이블/스킬_밸런스_리포트.md` 정정 전78행 | 비용 MP250×DPS(+15%) | 비용 부분 root 정정 완료, 인접 피해배율+15% 보존 |
| `자원리젠+소모공식__NFD_0628_2305_백업.md` 133행 | base250·+15% | 기존 백업·정규화 보존 규칙 적용, 현행 계약으로 취급하지 않음 |

현행 canonical3문서의 mortar 비용 동기화 게이트는 root 정정으로 완료다. 생산 통합은 root가 원격 복구지점·함수 소유권을 확보한 뒤 순차 인수하며 이번 지원 완료는 후보 적용준비까지다. 원격 DNS오류와 Git쓰기 EPERM은 해소됐다고 주장하지 않는다.

## 실제 첫 처치·밀집 전투의 다음 실행 방법

이번 root 관찰에서 독립 host의3340 연결은 `connection refused`, 승인된 exact3340 서버 시작은 `listen EPERM`으로 종료됐다. Code CUA는 접근 권한 거절이므로 Claude 원담당 전달0을 유지한다. 기존 사용자 Chrome 게임은 읽기만 하며 입력·리로드·닫기0이다. **새 실제 정상전투·첫처치 CPU 표본은0건**이며 포트변경·직접HTTP·CDP 등으로 제한을 우회하지 않는다.

사용 가능한 승인 경로에서3340 독립 QA origin이 실제 응답하고 QA 단독 측정 슬롯이 열리면 아래 준비된 도구를 root가 사용한다. 과거 프로브 계획의3333/PC 경로를 그대로 실행하지 않는다.

| 목적 | 도구 | 사용·회수와 해석 |
|---|---|---|
| 정상 플레이25초·첫 관측 처치·밀집 | `tools/team-followup-20261001/QA/light-normal-observer.js` | 정상 부팅 뒤 승인된 QA 도구로 설치, 원상태를 쓰지 않고 실제 W/캔버스 좌클릭으로 시작. `__lightNormalQA`의 rows/draws/inputs/events/옵션/환경/raw를 회수.25초·자연사·전경이탈 자동종료, draw/listener 복원 확인 |
| 첫 사용 함수 비용 귀속 | `tools/qa_first_kill_cpu_probe.js` | 정상 부팅 뒤 별도 진단1회에만 설치, `__qaFirstKill.stop()`으로 복원/회수. 2D/GL 다수 wrapper와20,000 링버퍼이며 overhead 미측정. `firstDeathCandidateAt`는 처치증명이 아니므로 kills/입력 원자료와 함께 판단. profiler-off 경량 표본과 비용 비교 금지 |
| 현행 경량 raw의 새 경로 분석 | `tools/team-followup-20261002/combat-review/analyze-normal-capture.mjs` | `node .../analyze-normal-capture.mjs <새 raw.json> <새 analysis.json>`. 승인된 actual analyzer 함수만 추출하며 input/analyzer SHA와 시각 기록. 기존 하드코딩 원자료 경로를 덮어쓰지 않음 |
| 물리 준비 캐시 사용 진단 | `tools/team-followup-20261001/QA/physical-prewarm-observer.js` | 경량 관측기 뒤 추가2wrapper, 동일Canvas/cache·tint0·복원 기록. 이는 전체 전투 개선율 표본이 아님 |

새 분석 CLI의 인터페이스는 기존 `live-prewarm/raw.json`으로1회 확인했다. 보존된25,007ms·19처치 값과 `eligible=true`를 반환하고 raw SHA `16fcf4917ae4463dc1d50abbbc727267a3e927398349c2f4fe1d9f909b17aea9`를 기록했다. `analyzer-interface-old-sample.json`은 **오래된 자료로 새 CLI 입력경로를 검증한 것**이며 신규 성능 측정·개선 증거가 아니다. 새 관측에서 지연은 rAF상의 첫 kills 증가 배치, 밀집은 살아있는 적>=30의 연속 관측이며 정확 막타·화면내 적수·GPU완료로 바꾸지 않는다.

이번 최종 판정: **SKILL 소스 적용준비38 PASS, 생산0; QA 신규 runtime 미실행; ENEMY/ANIMVFX 다음 과제 읽기 검토만 완료.** 기존4개 원담당의 현재 과제 수신·실행·완료 상태는 총괄이 새 실제 CLI 증거를 얻기 전 변경하지 않는다.

23:18:28 UTC 종료 관찰은 Git49항목이며 양쪽 생산 HTML SHA가 감사 시작과 동일하다. 지원 코드 추가 후 docs 전체 동일 키워드 검색을 다시 실행한179매칭은 `docs-search-after-code-20261002.txt`로 보존했다. 두 신규 MJS 구문검사도 통과했다. 총괄의 실제 `git add`는 `.git/index.lock EPERM`, `ls-remote`는 DNS오류로 실패해 로컬 커밋·원격 checkpoint는 **미완료**다. 지원은 Git쓰기0이며 자기 소유 파일/문서로 보존하고 원격 백업 완료를 주장하지 않는다. 공식 기존 Codex4 전달도 승인필요·policy never로0이며 이 지원 검수를 기존11팀 전체 재가동으로 집계하지 않는다.
