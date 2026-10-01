# 맥북 11팀 총괄 인수 — 2026-10-02

기준 HEAD는 `5b8e6ba9d952d1148048c2889c588531640698fe`다. 기존 11팀의 완료·미전달·런타임 게이트를 확인하고 총괄 포함4명으로 지원 검수를 수행했다. 기존 팀 새 세션/중복 채팅 생성0, PC 팀 재가동0, 새 자동화/주기 변경0이다. 지원 작업의 완료를 기존11팀의 새 지시 수신/동시 실행으로 세지 않는다.

| 팀 | 이번 총괄/지원 근거 | 원담당 새 전달·실측 상태 / 다음 한 건 |
|---|---|---|
| QA | 독립 host 실제 UI 연결을 시도했으나 connection refused. 정상전투/첫처치 도구와 새 raw 분석 CLI 준비 | Claude 새 전달0; 신규 실측0. 3340 및 승인된 UI 슬롯 회복 후 host 설치/생성/JSON복원/해제·단독 정상전투 |
| SKILL | 현행 양쪽 actual aim/confirm/fire·실제 비용 경계38 PASS. 기존 patch의 scratchpad 목적지를 헤더만 정규화, hunk byte 동일/apply-check PASS | Claude 전달0; 생산 미적용. 원격복구·순차 소유권 확보 뒤 mortar 최소 가드 인수·실제 플레이 |
| ENEMY | 최신 telegraph-cancel 과제/SSOT와 이전 제출 상태 확인 | Claude 전달0; 새 source fixture/실전0. 공격예고 피격/사망 취소 경계 한 건 유지 |
| ANIMVFX | 최신 발 위치/그림자 anchor 과제·이전 source 보충 인수 확인 | Claude 전달0; 새 시각0. corpse fade 보류와 분리된 foot-shadow 계약 대조 |
| MAP | 읽기전용 source Gate9 PASS, 과거PNG15개 SHA 일치. LATE/EXIT 분리·START/주랜드마크 좌표 보드 정정 | Claude 전달0; 신규 현행8뷰0/8, M5 전체경로 미검수. VISUAL VERDICT RETOUCH |
| ART | 기존 wa24 제출·emg1 LOCK 다음 과제 및 카메라 가이드 인수 | Claude 전달0; 새 생성/픽셀검수0. emg1 후보 LOCK 대조 한 건 유지 |
| UIUX | 공식 기존 latest turn completed 확인·기존 유골함 source15 인수 상태 유지 | 후속 cross-panel-focus-source 전달1회 시도→승인제한 거절/Read0. native/패드/레이아웃 미검수 |
| ITEM | 공식 기존 D13 callback32 source 인수·기본 비활성/미적용 상태 확인 | d13-integration-map 전달1회 시도→승인제한 거절/Read0. caller·정책·runtime 게이트 유지 |
| BUILD | 기존 앱 핵심4파일 SHA 대조. index 동일, 양쪽 HTML은 현행과 다름. node-main 두 격리 변환은 의도된 차이 | packaged-source-delta 전달1회 시도→승인제한 거절/Read0. 원격 입력확인 전 새 빌드0, 앱 runtime/HTTP 미검수 |
| BALANCE | 검수된 shared-mats actual-file14를 별도 소유 하니스로 인수. 현행 양쪽 exact context patch 준비·apply-check PASS | shared-mats-integration-ready 전달1회 시도→승인제한 거절/Read0. 생산 미적용·HTTP/fsync/crash/concurrency 미검수 |
| SOUND | actual mkItem/rollAffixes/등록/획득/그리드/_r source18그룹·84입력 PASS. 첫등록 pickup RNG42(생성41+pitch1)를 분리 | Claude 전달0. whole-game RNG0·실청취/저장/패키지 미검수. 원담당 읽기전용 제한 유지 |

## 완료 산출과 문서 동기화

- [전투 source 검수](COMBAT-REVIEW-20261002.md): mortar38검사 및 헤더 정정 미적용 patch, 새 raw 분석 CLI. 원담당 patch·초기 실패자료 보존.
- [MAP/ART/UIUX 인수](MAP-ART-REVIEW-20261002.md): MAP PRODUCTION REPORT·정정8뷰·9 source검사. 과거 PNG 무결성을 현행 시각 PASS로 대체하지 않았다.
- [BUILD/SOUND/ITEM/BALANCE 인수](INTEGRATION-REVIEW-20261002.md): actual RNG trace·기존 앱 입력 차이·shared-mats 양쪽 미적용 patch/실파일14검수와 한계.
- mortar 비용 문서3개를 실제 `_COST_BASE=50`, `_COST_DPS=.35`, `_COST_SK.mortar=maliceMortar`, `mpCost=~~(50×(1+(Lv−1)×.35)×pMagicCost())`로 정정했다. 할인계수1의 Lv1→10 최종50→207, 중간원값207.5; 최저계수.4에서20→83. 피해10/+15%·역사 NFD백업과 타키 수치는 이번 범위 밖으로 보존했다. 원자료/수정전 로컬복사/문서SHA는 `tools/team-followup-20261002/owner-dispatch/mortar-doc-sync.json`.

## 확인된 실행·백업 제약

| 단계 | 이번 실제 결과 | 완료 여부 |
|---|---|---|
| VS Code 기존 Claude7 전달 | 설치 경로의 Code CUA가 `Computer Use was not approved to use Code`로 거절. Mac 잠금/11팀종료로 단정하지 않음 | 전달0/Read0; 다른 CLI/UI 경로 우회0 |
| 기존 Codex4 전달 | 공식 send tool이 각1회 `MCP tool call requires approval, but approval policy is never`로 거절 | 전달0/Read0; 재전송/대체세션0 |
| 게임/독립 host3340 | 새 host URL `ERR_CONNECTION_REFUSED`; exact HOST127.0.0.1/PORT3340/격리 SAVE_DIR의 server.cjs 기동1회가 listen EPERM 종료 | 서버/API/신규게임/실측0; 다른 binding/서버/권한 우회0 |
| Git 체크포인트 | 자기 task파일의 git add1회가 `.git/index.lock` EPERM 종료 | 공용인덱스 변경0, 새 commit0 |
| GitHub 원격 | `git ls-remote origin refs/heads/codex/mac-environment-20261001 refs/heads/main` DNS오류 | 현재 원격SHA 미확인, 새 push0/백업 미완료 |
| 기존 관리 자동화 | Mac 로컬 matching automation 설정 발견0; PC 전달의5분ACTIVE 이력을 유지 | 현재 독립 재검증 아님, 수정/새생성0 |

기존 사용자 게임 탭1573846373은 초기상태를 읽기만 했고 입력·reload·close·계측0이다. 기존 EXODUSER 앱·원래 Mac3333·사용자 저장·PC 팀·초안을 조작하지 않았다. 생산 핵심5파일은 시작/완료 SHA가 동일하고 한글 백업22항목·BUILD config-draft와 공용 빈인덱스를 보존한다. 지원 실파일은 각자의 새 합성 fixture뿐이다.

Changes 시작23→중간43/49/68, 완료는 `root-acceptance.json`의 실제 최종값을 따른다. 이번 파일들의 로컬 SHA manifest는 복구/인수용이며 Git 커밋이나 GitHub 체크포인트가 아니다. 80/100 기준을 낮추거나 소스를 ignore/삭제하지 않았다. 원격·Git쓰기·runtime 권한 회복을 확인하기 전에는 생산 적용·새 패키지 생성·11팀 재전달 완료를 선언하지 않는다.

다음 승인 한 건은 원격복구 확인 뒤 준비된 mortar/shared-mats patch를 순차 인수하는 것이다. 정상 서버/UI 슬롯이 열리면 첫 처치·밀집 CPU 및 MAP 정정8뷰·M5 전체경로의 실제 측정을 우선한다. 준비와 실제 실행은 계속 구분한다.


## 권한 환경 변경 뒤 후속 확인

앞선 EPERM/DNS/승인거절은 당시 이력이다. unrestricted/network-enabled 변경 뒤 원격 작업브랜치5b8e6ba9 exactHEAD를 확인했다. 지정127.0.0.1:3340/격리SAVE_DIR의 Node서버 기동과 /api/slots ok=true·기존1슬롯 응답을 확인했다. 저장 수정/삭제0·새게임/실측0. BUILD 재전달1회는 active writer 거절로 전달0·중복실행0이며 다른팀 신규지시는 아직 재전송하지 않았다.

자기 검수 산출만 범위 한정 checkpoint한다. 최종commit/push/정확원격SHA는 tmp/mac-migration-runtime/coordination-resume-checkpoint-20261002.json에 남긴다. 원래22한글백업·BUILD초안·생산코드·사용자게임/저장을 보존한다. 서버 응답확인은 게임/맵8뷰/청취/앱 인수와 구분한다.
