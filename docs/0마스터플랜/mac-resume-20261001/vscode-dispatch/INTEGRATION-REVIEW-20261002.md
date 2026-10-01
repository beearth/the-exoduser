# Mac BUILD·SOUND·ITEM·BALANCE 독립 인수 — 2026-10-02

총괄 지원의 실제 파일 검수다. 기존 팀 세션의 추가 수신/실행으로 집계하지 않는다. 원담당 파일·공용 생산 코드·공유 인덱스·사용자 게임·세이브를 보존했다. 소유 범위는 `tools/team-followup-20261002/integration-review/`와 본 문서다. 원격 ref 확인·체크포인트·생산 반영은 root가 담당한다.

## 역할별 현황과 다음 한 건

최신 팀 상태의 기준은 `TEAM_UTILIZATION_20261001.json` snapshot `2026-10-01T18:53:31.855475Z`와 root의 이번 공식 기존 Codex4 completed 확인이다. 아래 완료는 제출/소스 인수이며 실제 앱 품질 완료가 아니다. SOUND 원담당의 읽기 전용 제한을 유지하고, 별도 지원 하니스만 실행했다.

| 역할 | 기존 제출·인수 상태 | 이번 실제 근거 | 다음 한 건 | 남은 native·저장·청취·패키지 게이트 |
|---|---|---|---|---|
| BUILD | production INM 소스 반영/인수 완료; 담당 독립13과 기존 root84 구분. 현재 실행 중 아님 | 이전 08cac1ce 앱의 핵심4파일만 직접 SHA 대조. index 동일, game/easy 현행과 불일치. node-main은 격리 port/save 두 변환만 차이 | root 복구 SHA 확인 후 변경된 생산 소스를 포함하는 고유 앱 입력 갱신 및 QA 단독 실제 HTTP/앱 인수 | 새 앱 생성0. 현재 앱에 후속 HTML 통합이 포함되지 않음. 실제 HTTP/HEAD wire/미디어/서명/저장→재실행 미검수 |
| SOUND | 기존 bone-pickup 제안은 읽기 전용 제출·실행0. mkitem-sideeffects-readonly 다음 과제 수신/Read 미확인; 현재 실행 중 아님 | actual mkItem/rollAffixes/유골 등록·지급·획득·그리드/_r 추출18그룹·84입력 PASS. 대역 mkItem과 등록 피치 생략을 검출하는 반례 포함 | 이번 source trace를 원담당에 한 번 인계한 뒤 QA 단독 실제 유골 획득/등록/중복 음 재생·청취 | 기존 세션 전달0. playSample/stat/save/UI backend는 대역, whole-game RNG·실청취·실저장·패키지 미검수 |
| ITEM | D13 callback 경계 root 독립2반례 및 담당13+인접19 PASS 인수. 후보 미적용; 현재 실행 중 아님 | 최신 팀 대장·실제 과제/receipt·root 인수 문서 확인. 같은 완료검사 재실행0 | 미정인 자식 피해·cap·겹침·저장 계약을 정리하고 담당 생산 caller 인수 후보 한 건 | 기본 비활성/생산 연결0. 실제 게임·전환/연쇄/보스·native·저장 미검수 |
| BALANCE | shared-mats 실제 합성파일14, 기존 memory16 인수. 후보 미적용; 현재 실행 중 아님 | 현재 server.cjs/node-main.js에서 원담당 actual-file 하니스를 소유 경로로 옮겨14 PASS. 원담당/생산 SHA 보존. exact 문맥 패치2개 apply-check PASS | root 순차 검토로 공유 악의 POST 두 곳에 동일 원후보 적용; 이후 QA 실제 ACK→디스크→재시작→GET 한 건 | EIO는 주입, ENOENT는 실제 OS. HTTP·fsync·전원손실·크래시·동시writer·Windows·앱 미검수 |

## SOUND 실제 소스·RNG 관측

본편 SHA `30ae8544524d7cd710383ebd10f4911bea3247e90b18a46c51c253e73ce9ba3f`, easy SHA `9c7c25c131f6175a464cffe2e981e946cf2a0af70ed04b969cc5292403799af8`에서 Acorn AST로 실제 함수와 데이터 선언을 추출했다. `mkItem`, `rollAffixes`, `_grantOssuaryIfNeeded`, `_boneRegister`, `_ossSetComplete`, `mkBonePart`, `pickupItem`, `playItemPickupSfx`, `_r`, 가방 크기/분류/그리드/배치와 관련 원데이터를 실행했다. mkItem/rollAffixes/_r 계측 래퍼는 원함수 호출을 보존한다. 합성 P.lv=42, 두 demo 값, LCG seed 0/7/4294967295를 사용했으며 검수환경을 원자료에 남겼다.

입력 아이템은 실제 `mkBonePart`에서 생성하여 id RNG1을 별도 기록한다. 아래 수치는 그 뒤 `pickupItem` 구간만의 소비다. 7경로×양판×3seed×2demo=84입력, 경로14그룹과 대역/피치 변이 검출4그룹으로 총18그룹 PASS다.

| 조건 | pickup RNG | 음 함수 호출 | 저장 함수 호출 | 관측 상태 |
|---|---:|---|---:|---|
| 처음 r0/t0 유골 등록, 유골함 미보유 | 42 | ghost_laugh 1 | 1 | mkItem 전체41(직접37+rollAffixes4), 등록 피치 _r1. 고정 유골함 실제 필드·스탯·소켓·어픽스 검증 |
| 유골함 장착 또는 가방 보유, 신규 등록 | 1 | ghost_laugh 1 | 1 | mkItem0, 가방 보유품 자동장착0, r0/t0 등록 유효 |
| 같은 부위의 하위 중복, 공간 있음 | 2 | 랜덤 pickup 풀1 | 1 | 기존 등록 보존, 중복 부위는 가방행. 선택1+피치1 |
| 유골함 보유, 같은 포인트 중복, 유골 탭 가방 가득 참 | 0 | 0 | 0 | false, 기존 가방/도감 byte·배열 identity 보존 |
| 유골함 미보유, 하위 중복, 유골 탭 가방 가득 참 | 41 | 0 | 0 | false 전에 유골함 생성·장착/알림/스탯 재계산 호출. 현재 지급 선행 순서의 상태 부작용이며 전체 무변화/RNG0 주장 금지 |
| 4번째 부위 r0/t0 등록 | 1 | ghost_laugh 1 | 1 | 실제 4부위 해금 조건·알림·shake2 호출 |

첫 유골에서 mkItem을 대역으로 바꾸면 pickup RNG42→1 및 생성 필드 불일치가 나타나 검수기가 검출한다. 등록 피치를 상수로 바꾸면 보유등록 RNG1→0 및 다음 RNG 상태가 달라져 검출한다. 현재 소스는 최종 고정 유골함 오버라이드 전에 랜덤 베이스/어픽스를 생성한다. 이것은 이번 좁은 경로의 관측이며 새 결함·전체 RNG 불변 또는 청취 품질 판정으로 확대하지 않는다.

`playSample`, notify/번역, addTxt, shake, recalcSt, dbSaveForce, systemLesson의 내부는 실행하지 않았다. 호출 기록만 인수한다. 실제 브라우저/오디오/저장/게임 부트0. 재실행은 `node tools/team-followup-20261002/integration-review/mkitem-sideeffects-source.mjs`; 원함수/상수 SHA와 trace는 `mkitem-sideeffects-evidence.json`, 출력은 `mkitem-sideeffects-tests.txt`다. 반복된1200칸 full 가방은 원자료에서 개수/SHA와 하니스 생성 규칙으로 보존하여 불필요한 전체 사본을 줄였다.

## BUILD 기존 앱과 현행 소스 구분

대상은 `outputs/mac-package-ready/mac-packager-08cac1ce-21fb-4874-b4df-c136df5ac269/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app/Contents/Resources/app.nw`다. 생성 소스는6be3a06b. 이번에는 4파일만 읽었으며 전체 에셋/manifest 해시·앱 실행·수정·재빌드0이다.

| 파일 | 현행 소스 SHA prefix | 앱 SHA prefix | 판정 |
|---|---|---|---|
| game.html | 30ae8544 | c868284a | 불일치: 이후 소스 인수를 기존 앱의 검수로 대신할 수 없음 |
| game-easy-test.html | 9c7c25c1 | 11b4e97b | 불일치: 이후 소스 인수를 기존 앱의 검수로 대신할 수 없음 |
| index.html | 38f4e0e | 38f4e0e | 실제 byte 동일 |
| node-main.js | 01b0c1d5 | f0f922cf | raw 불일치. diff는 PORT3333→3383과 고유 job SAVE_DIR 두 의도적 격리 변환뿐. 회귀/구형 서버로 판정하지 않음 |

앱에는 server.cjs가 없으며 내장 서버는 node-main.js다. 직접 small-file 결과·전체 SHA·node-main diff는 `package-four-file-drift.json`에 기록했다. 현재 root의3340 독립 host 연결거부 및 정확3340 startup EPERM 종료는 이번 QA 게이트이며, 서버/API/게임 검사0·권한 우회0이다. 기존 Chrome 사용자 게임의 입력/reload/close0이라는 root 관찰도 실제 앱 인수와 구분한다.

## BALANCE 공유 악의 패치 준비

원담당 `shared-mats-atomic-candidate.mjs`를 직접 import했다. actual-file 하니스는 원문에서 import/산출 경로만 소유 prefix로 바꿨다. 양쪽 현재 GET/POST/helper 추출 후 신규·교체·반복10입력/clamp/schema, 주입 부분 write/rename EIO에서 이전 bytes·GET 보존/ACK0/temp 정리, 실제 ENOENT, 원문 부분쓰기 손상 RED를14그룹으로 재실행했다. 원후보/생산 SHA 전후 동일이다. fixture는 `shared-mats-owned-fixtures/run-*/`의 검수용 합성 파일이며 사용자 세이브에 접근하지 않는다.

준비 패치는 `server.cjs.shared-mats.patch`와 `node-main.js.shared-mats.patch`다. 공통 POST의 원문 직접 write 한 줄을 원후보 atomicSaveJSON 호출로 바꾼다. server는 기존 helper/sequence를 그대로 재사용한다. node-main에는 현행 server의 검수된 helper/sequence를 readBody 뒤에 한 번 삽입한다. Acorn은 각각 helper1/sequence1을 확인했고 GET 원문은 유지한다. 두 패치는 기본 `git apply --check` status0이며 실제 apply0이다. 순차 반영 전에 root가 현행 SHA/타팀 diff를 다시 대조한다.

재실행은 `shared-mats-file-independent.mjs`와 `prepare-shared-mats-patches.mjs`다. 실제 파일 근거는 `shared-mats-file-independent.json`, 적용전 source/helper/route/candidate/patch SHA와 check 결과는 `shared-mats-patch-evidence.json`이다. EIO 주입과 OS ENOENT를 섞지 않는다. fsync/전원손실/크래시/동시writer/HTTP/Windows/패키지 미검수이며 앱 완성 주장0이다.

## 기록·보존

코드 산출 후 docs 전체에서 `mkItem|_grantOssuaryIfNeeded|_boneRegister|bonePart|ghost_laugh|playItemPickupSfx|atomicSaveJSON|_sharedMats|공유 악의|If-None-Match`를 rg 검색했다. 이 문서 작성 전121행/46문서이며 원자료는 `docs-keywords.txt`다. 생산 수치·계약 변경0이므로 관련 SSOT 원문을 수정하지 않고 검수 상태/한계만 이 소유 문서로 root에 인계한다.

실제 Changes 관측은 시작23→중간39→후속68이며 공유 작업 중 다른 담당 산출이 포함돼 전부 본인 변경으로 세지 않는다. final count는 `completion-summary.json`과 root checkpoint에 기록한다. 지원 commit/push/Git index 쓰기0, 원격 SHA 확인은 root 전담. 기존 팀 초안/한글 정규화 차이 보존. 새로운 팀 채팅/세션/자동화/기존 팀 전달/게임/서버/빌드/인코딩/청취0이다.

이번 root의 Codex4 공식 후속 send는 approval-required/policy never로 모두 거절되어 전달0/Read0이다. CUA Code 접근은 미승인으로 Claude7 전달0, 새 세션/CLI 우회0이다. GitHub ls-remote는 DNS 오류여서 이번 현재 소스의 원격 ref 확인은 미완료다. 앞선 완료 제출·기존 검증된 checkpoint와 이번 전달/원격 게이트를 구분한다.
