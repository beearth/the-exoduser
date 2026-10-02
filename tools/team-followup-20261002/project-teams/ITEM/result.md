# ITEM — D13 생산 통합 지도 인수

검수 기준: local HEAD `96610b6546a31e882962470ea1f2164ce94edca6`, 2026-10-02. 지정된 새 ITEM 관리 채팅에서 기존 미전달 백로그 한 건을 수행했다. 소유 산출은 이 보고서, `evidence.json`, `checks.mjs` 3개뿐이다. `task.md`·생산·원후보·공유 docs·Git 인덱스는 수정하지 않았다. 원격 정확 ref는 총괄의 전달 근거이며 이번 팀이 새로 조회/백업한 것은 아니다.

**결론: 정적 caller·lifecycle 지도 인수 완료 / 생산 연결 0 / runtimeReady=false 유지.** 기존 callback32는 반복하지 않았다. 이번 22 PASS는 AST/원문/출처/연결 부재의 정적 검사이며 실전·성능·저장·화면 통과가 아니다.

## 1. 수신·중복·검수 범위

| 단계 | 실제 근거 | 한계 |
|---|---|---|
| 수신/Read | 최신 project-teams/ITEM/task.md 전체 및 과거 owner-dispatch/ITEM-task.md 계약 Read. 첫 도구 완료 뒤 03:43:38 UTC 관찰 | 정확한 메시지 도착 시각을 추정하지 않음 |
| 원세션 대조 | 공식 read_thread의 「할당 작업 실행」 `01a0f6e6-1fbe-7df0-8d02-a9c2d9df3750`, 마지막 completed 턴 `d13-callback-boundary` | 새 integration-map 수신/실행 근거 없음. notLoaded를 종료/큐 전체 부재로 해석하지 않음 |
| 기존 완료 | 원담당 13+인접19, 총괄 실제 import 두 RED→GREEN·32 PASS. 현 후보 SHA `89ad082ac6c1b62159b0cceeabbd378367e589feff7ccbce1fd08e5035c4a632` 일치 | 보존된 검사 인수이며 이번 반복0 |
| 이번 실행 | 지정 Node24.15.0의 checks.mjs: 양쪽 inline JS AST, 함수·caller·assignment 위치/SHA, 기존 pass SHA, 공급 부재, docs 검색 | 함수 실행/eval/후보 import/fixture/브라우저0 |
| 초기 실패 | HTML importmap을 JavaScript로 파싱하여 Acorn Unexpected token (2:10), exit1 | 검수기에 JSON/importmap 제외와 행 탐색 최적화 적용. 생산 오류로 분류하지 않음 |
| 최종 정적 검수 | 2026-10-02T03:47:40.463Z, 22 PASS/0 FAIL | 초기 실패를 지우지 않고 evidence에 별도 보존 |

본문 SHA는 읽기 편의를 위해 16자리 접두어를 쓴다. **적용 전 대조에는 evidence.json의 전체 SHA-256을 사용한다.** 함수 해시는 Acorn이 식별한 함수 원문, assignment/call 해시는 해당 표현식 원문이다. 큰 source 사본은 만들지 않았다.

생산 입력: 본편 `30ae8544524d7cd710383ebd10f4911bea3247e90b18a46c51c253e73ce9ba3f`, easy `9c7c25c131f6175a464cffe2e981e946cf2a0af70ed04b969cc5292403799af8`.

## 2. 실제 caller·함수 소유권 지도

모든 생산 쓰기는 총괄의 순차 통합 범위이며 **이번 ITEM 쓰기 소유권은 새 3산출뿐**이다. 아래 팀은 계약 협의 대상이지 새 함수 쓰기권을 배정한 것이 아니다. `game.html`과 `game-easy-test.html`은 `/Users/fordeargamers/Projects/exoduser-migration-20261001/` 안의 파일이다.

| source ID·한글명 | 본편 / easy 현행 위치 | 함수/표현식 SHA 접두어 | caller 계약·관련 소유권 |
|---|---|---|---|
| C01 슬롯 가시덫 발동 | `_dispatchSkillSlot` 12435 / 11832; 실제 호출 12541 / 11937 | 함수 `f0f84687bcd648a7` / `014e24d8c4c7a420`; 호출 양쪽 `bf572ae5b9bf5998` | 악의·쿨 가드 뒤 activateSpikeTrap 호출 1곳. SKILL 발동 계약 + ITEM 출처, 생산 연결 총괄 |
| C02 원본 덫 생성 | `activateSpikeTrap` 43997 / 42701, push 44006 / 42710 | 양쪽 `f5d9f41ee12c8f51` | 실제 원함수는 동기. 합체 흡수/비용/쿨 실패는 새 객체0. 성공 후 새 객체만 wrapOriginalTrap의 private WeakMap·시전 token 등록. 생산에는 wrapper 없음 |
| C03 실제 DOT 인수 | `update` 안 36125 / 34929 | 호출 양쪽 `52e3481541923fcc` | `hurtE(e,fz.dmg,Math.atan2(e.y-fz.y,e.x-fz.x),true,{dot:true,shieldHit:true,_lessonAttack:'spikeTrap'},EL.P)` 그대로 유지. invokeDot 미연결. SKILL/BALANCE 틱 + ENEMY 최종 사망 계약 |
| C04 피해/최종 사망 | `hurtE` 40713 / 39513 | `a8578d7648197338` / `872faefc1e74136f` | 원함수 정상 반환 후 alive true/hp>0→false/hp<=0일 때만 큐. 쉴드흡수/부활/비처치 제외. 전체 ENEMY 피해함수를 일괄 교체하는 작업으로 확대하지 않음 |
| C05 전체 장판 pass | `update` 35851~36237 / 34655~35041, 압축 종료 36236 / 35040 | block 양쪽 `a78c383ab58ccdd9` (22,471 byte) | 현재 실제 pass와 기존 인수 block byte 동일. DOT 한 호출만 감싸고 전체 순회·부가 상태·압축 정상 완료 뒤 FIFO. 원 update 전체 SHA는 본편 `c37aa75077f5670d` / easy `5dddbe0861d1cf11` |
| C06 사망 후 방/보스 전환 | `checkRooms` 40379 / 39179; `_enterBossArena` 호출 40392 / 39192 | `98bf9b1a8b413c7f` / `1969b271c46ce27e` | hurtE 후처리의 전환 가능성을 무시하지 않는다. epoch/array 교체로 stale 큐 폐기 + 실제 clear 경계 연결 필요. ENEMY/MAP 진행 계약·총괄 순차 통합 |

원본·fusion·child 포트는 **검토 후보의 구분**이다. 실제 zone 객체에 새로운 owner/source 필드를 추가한 것이 아니며, 신뢰된 생성 caller를 제공해야 한다. `_pillarSpike:true`는 원본 등록에서 제외한다. 다른 생성 사이트나 비동기 원함수를 같은 wrapper에 임의 대입하지 않는다.

## 3. clear 미연결 지점과 상태 교체

아래 모든 지점은 현재 D13 clear **미연결**이다. array 참조 교체 시 wrapZonePass가 pending을 버리는 검사와, sources/usedCasts까지 explicit clear로 폐기하는 생명주기 연결은 다른 단계다. candidate는 P/캐릭터/장비 변경을 자동 관찰하지 않는다.

| lifecycle ID·한글명 | 본편 / easy 실제 상태 변경 | 함수 SHA 접두어 | 통합 계약·정확한 Gate |
|---|---|---|---|
| L01 stage 초기화 | `initStage` 30295 / 29115; 배열 교체 30314 / 29133 | `2b88d7b367a9b2bb` / `723ca3fcfc80a6b6` | 이전 출처·큐·시전 상태 폐기. boss-test 분기는 `_enterBossArena`로 조기 return하므로 아래 L02와 함께 연결. 일반 함수 entry 일괄 삽입으로 정책을 확정하지 않음 |
| L02 보스 입장/재입장 | `_enterBossArena` 29511 / 28344; 배열 교체 29524 / 28357 | `01f063493e7b07de` / `3ad280675ab8aa45` | checkRooms·initStage·_retryDruidFinale·_btResetBoss·boss-test caller 포함. caller 전체는 evidence.maps.lifecycleCallers에 기록 |
| L03 실제 사망 | `_fallenResolve` 42370 / 41167; 실패 분기 배열 교체 42390 / 41187 | 양쪽 `e5cb1a7a2c9dcd1` | 악마화 부활 성공은 앞에서 return하고 배열을 지우지 않는다. 성공까지 무조건 clear하는 새 정책을 추가하지 않는다. 실제 사망/부활/재시작 의도 대조가 필요 |
| L04 재도전 직접 reset | retryBtn async callback 61409 / 59743; 직접 배열 교체 61421 / 59755 | 양쪽 callback `c87b52a4021868a0` | 보스방 백업 복원 분기에서 initStage 없이 배열을 바꾼다. stage wrapper만 연결하면 누락. _retryDruidFinale 분기와 일반 initStage 분기도 별도 대조 |
| L05 캐릭터 변경 | `_loadCharAtlas` 10145 / 9596; `_charIdx=idx` 10147 / 9598 | 양쪽 `47f6cb0b5630535e` | 캐릭터 선택/스킬/UI 호출 및 dbRestore 포함. index assignment 표현식 `2c91a7ddb44bca76`. 초기 top-level index 설정도 기록하되 이것을 캐릭터 전환 실측으로 세지 않음 |
| L06 DB 복원 | `dbRestore` 3589 / 3362; equipped 교체 3616 / 3388 | `63385633575b5164` / `2785fd6138a7325f` | P identity를 유지하며 player 필드를 복원하고 장비를 교체할 수 있다. P 교체 감지만으로 충분하지 않음. false/부분복원/캐릭터 변경 경계도 필요. BUILD 저장 + ITEM 소비 계약 협의 |
| L07 DB 새 player | `startGameFromDB` 60384 / 58708; P=mkP 60408 / 58732 | `57f378abad7d2315` / `7d33a6e7ed3d4cae` | 새 player→DB restore→stage 생성→await. 기존 D13은 동기 pass 전용이며 전체 비동기 loader를 wrapZonePass로 감싸면 안 됨 |
| L08 demo/test 새 player | `_startDemoTest` P 교체 60015 / 58342; `_startDemoNew` 60190 / 58517; `_startTestChar` 60296 / 58620 | 각 함수 전체 SHA는 evidence.maps.functions | 각각 장비 재초기화와 이후 stage/restore 호출을 가진다. DB 경계6개만 연결하는 안으로 누락하지 않음 |
| L09 editor player | editor IIFE 61806 / 60137; P 교체 61807 / 60138 | 양쪽 `9f8cadfced9a77dc` | initStage 뒤 게임 비활성/숨김 player 위치를 설정하는 별도 부트. 이번 에디터/맵 실행0. 코드 수명 경계만 대조 |
| L10 web/DEMO 부트 player | `_boot` 61726 / 60060; P 교체 61882·62030 / 60213·60361 | `9ff0cdc7cd5d6c61` / `b99cc36d7e8b73e2` | localStorage 복원 콜백 및 startGameFromDB 분기 포함. 비동기 pending 생성/종료·늦은 정착·중복 clear 순서를 별도 계약으로 검수 |

양쪽 각4곳의 실제 `G._fireZones=[]` lifecycle 교체 표현식 SHA는 `d70ef36c46441a65…`다. 반면 `if(!G._fireZones)G._fireZones=[]`는 스킬의 **lazy 배열 초기화**다. 이를 전환 reset으로 취급해 새 출처를 지우지 않는다. 모든 직접 assignment와 caller의 전체 SHA·guard는 evidence에 있다.

pass 밖 또는 callback 사이에 **같은 배열 내부 변경**, 잠깐 A→B→A, alias/window 경유 수정, 임의 getter/Proxy까지 완전 관찰했다고 주장하지 않는다. 현재 clear는 sources/usedCasts/pending을 폐기하며 callbackErrors 진단 배열은 유지한다. 긴 stage의 토큰/진단 누적과 만료된 zone 처리의 비용도 runtime Gate에 남긴다. 새 정리 정책이나 cap을 구현하지 않았다.

## 4. SSOT 수치·공식·정책 계약표

원천: `docs/7아이템디자인/유니크_어픽스_리스트.md` D절 및 `UNIQUE_TOP8_HOOK_REVIEW_20261001.md`. 설계 제안과 게임 구현값을 구분한다.

| id·한글명 | 수치·공식·슬롯 | 적용 위치·검수 | 현재 상태/한계 |
|---|---|---|---|
| UI-13/U-D13 번지는 뿌리 | UI-13→belt, 제안 stat `_uTrapOffshoot` | 원본 spikeTrap DOT 최종 처치→사망 좌표 자식 | UI-13 배정은 계약 제안. 양쪽 게임에 stat/ID 소비 없음 |
| U-D13 피해 롤 | 정수20~40%, 하20~26/중27~33/상34~40; 저장 소수0.20~0.40; 자식 틱=원본 덫 틱×롤 | D절 수치 및 신규 binding/장착 소비가 선행 | 값은 이미 문서에 존재. 새 uniqueRoll shape/누락 보충/재롤을 이번에 정의하지 않음 |
| U-D13 크기·수명 | 반경150px, 지속180f=3초 (60f=1초), 원본 시전당 최대1 | candidate castToken usedCasts는 시전당1만 검토 | 실제 child payload·지속·반경 생성 없음 |
| U-D13 출처 | original만, fusion/child/불명 제외; child 처치 재귀0 | private WeakMap, `_pillarSpike:true` 원본 등록 거부 | 실제 caller 연결0. 실제 출혈·슬로우 소비/한도 인수 필요 |
| 원본 가시덫 | 비용 `_malCost(10)`; 쿨 `~~(600*(1+_cdRed()))`; 지속600f; 반경300+(Lv−1)×15; 즉발 피해0; 틱25f | 실제 activateSpikeTrap와 전체 pass 읽기 | D절의 '악의10'은 base 요약이다. 할인/난이도/쿨 감소를 고정10/600으로 덮지 않음 |
| 기존 겹침 cap | `if(e[_capKey]>=1)continue` → 해당 pass 같은 타입 적당 최대1히트 | 본편36086/easy34890. 주석의 '2존'과 실제 조건 불일치 확인 | cap 변경0. child의 기존 cap 참여·전역 활성 수·원본/자식 피해 중첩은 미결 |
| U-D17 연계 | D17는600px·정수1~3 이동 제안. 현재 source adapter는 D13 child 등록 경로 없음 | 이미 검수된 D17 후보의 제외 계약 유지 | D13 payload가 추가될 때 출처 보존/이동 제외·겹침을 별도 인수. D17 후보를 다시 제작/실행하지 않음 |

`_malCost`/`_cdRed`의 전체 경제 계산은 이번 실행 대상이 아니다. 원래 비용·쿨·피해·RNG/저장 계약을 바꾼 것으로 보고하지 않는다.

## 5. runtimeReady 해제 전 Gate

| Gate | 담당 경계 | 통과에 필요한 근거 | 이번 결과 |
|---|---|---|---|
| G01 정확한 생산 caller | 총괄 + ITEM/SKILL/ENEMY 계약 | 적용 직전 함수/블록 SHA·타팀 diff 재대조, 원본 생성과 DOT1곳·압축 후 drain 순차 연결 | 지도만 완료, 생산 연결0 |
| G02 수명 초기화 | 총괄 + MAP/BUILD/ITEM 계약 | L01~10·retry 직접 reset·부활 분기·비동기 loader·배열/캐릭터/장착 교체에서 stale 큐/출처 폐기와 신규 등록 보존 | clear 전부 미연결. 동기 후보를 비동기 경계 전체에 대입하지 않음 |
| G03 저장·장착 소비 | ITEM + BUILD/BALANCE/UIUX 계약 | D13 소수 롤의 신뢰된 생성/저장/복원/장착 소비, missing/invalid/legacy 처리·재롤0·툴팁/번역 | 미채택 스키마 유지, 공급0 |
| G04 payload·정책 | ITEM + BALANCE/ENEMY 계약 | 기존 D절 수치 구현, child 재귀0·합체 제외·슬로우/출혈, 전역 cap/겹침·D17 연계 결정 | 새 payload/수치/정책0 |
| G05 실제 사건/전환 | QA 승인 단독 슬롯 | 실제 원본 처치/쉴드/부활/연쇄/보스·stage/retry/load 전환, 동일tick append0·다음pass·적별 중첩·RNG/보상·실저장 검수 | 이번 UI/게임/서버/측정0 |
| G06 브라우저/제품 | 총괄/BUILD + QA | 모듈/MIME/수명 연결·게임/패키지 입력·저장 재실행, 실제 장판 수·shQuery·p95/p99·토큰/진단 누적 측정 | 준비가 실행/성능/제품 PASS가 아님 |

`enabled=true` AND `reviewOnly=true`는 검토 opt-in일 뿐 생산 채택 스위치가 아니다. `proposal/runtimeReady=false`는 위 Gate 인수 전 유지한다. 현재 원후보의 실제 포트/동기 계약만 재사용하고 새 저장스키마·효과정책을 보고서로 승인하지 않는다.

## 6. docs 동기화 인계안과 실행 영수증

checks 코드 추가 후 docs/ 전체에서 `U-D13|_uTrapOffshoot|자식 덫|자식덫|d13-deferred|d13-callback|G\._fireZones|activateSpikeTrap`를 rg 검색했다. 당시70행/24파일, 전체 경로와 검색 출력 SHA는 evidence.staticReview.docsSearch에 있다. 이번 허용 경로 밖 문서를 수정하지 않고 아래 **정확한 기록안**을 총괄에 인계한다.

| 동기화 대상 | 총괄이 반영할 기록안 | 유지할 사항 |
|---|---|---|
| ITEM_TEAM_MASTER.md D13 말미 | “2026-10-02 D13 통합지도: 현행 양쪽 AST/byte22검사, 원 pass 동일 SHA, caller·stage/death/retry/character/restore/demo/test/editor/web 경계 인수. clear/롤/payload 생산연결0, runtimeReady=false. 상세 project-teams/ITEM/result.md.” | 기존32 source 인수와 이번22 정적 검수 분리 |
| UNIQUE_TOP8_HOOK_REVIEW.md D13 간극 표 | 옛 줄 번호 대신 현재 activateSpikeTrap43997·DOT36125·pass35851/압축36236·hurtE40713와 함수/블록 SHA를 참고 링크로 추가. easy 대응은 본 보고서 C표 | 제안 원본/자식 규칙과 미결 cap·겹침 그대로 |
| 유니크_어픽스_리스트.md D절 | U-D13 수치는 그대로. 현행 훅 위치는 C표/새 통합지도 참고로 표기하고 미구현 상태 유지 | 20~40%·180f·150px·시전당1 변경0. 후보를 구현으로 갱신하지 않음 |
| 총괄 마스터/팀 활용표 | 새 관리 채팅의 독립 소유 d13-integration-map 산출·22 정적 PASS, 공유 생산0·callback32 반복0·후속 Gate 인수 대기 | 기존 원세션 완료/새 채팅 수행/11팀 동시가동 구분 |

검수 명령: `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/project-teams/ITEM/checks.mjs --record`. `--verify-report`는 읽기 전용7경로의 원문 보존·보고서22검사 표기·정확3산출·검수기 AST의 4검사를 통과했다. 이는 정적 지도22와 별도이며 callback32를 재실행하지 않는다. 초기 실패와 수정 후 PASS·시각·HEAD·읽기 범위·Changes 시작/중간/완료·파일 해시는 evidence에서 확인한다.

Changes는 공유 체크아웃 관찰이므로 증가분 전체를 ITEM 산출로 세지 않는다.80/100 한계의 중간·완료 상태는 evidence의 실제 count를 따른다. Git 쓰기/정리/자동화/새 세션/하위에이전트0. 이 한 건 이후 다른 backlog를 자동 시작하지 않는다.
