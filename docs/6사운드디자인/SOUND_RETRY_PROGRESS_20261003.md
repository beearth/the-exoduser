# 재도전 진행의 스테이지 음악 오류 격리 — source26

사망 화면의 재도전에서 동기 BGM 오류가 자원 완충·게임 재개·저장을 중단하는 실제 소스 경로를 고쳤다. parent `5616adea0d633d9e453bd2260a834e0822f25213`; source25 앱3400/사용자게임·세이브는 보존한다. 이 수정은 실제 Mac 플레이·청취 완료 증거가 아니다.

## 호출 경계

| id | 함수·적용 위치 | 새 처리 | 보존 |
|---|---|---|---|
| R01 | `initStage` 마지막 BGM stageKey/play | 음악 호출만 try/catch, `[BGM] stage start`와 같은 Error 기록 뒤 함수 반환 | 이전 stage 생성/캐시/조명 및 배경 초기화 순서; 그 예외는 그대로 전파 |
| R02 | `retryBtn.onclick` field/arena restore 뒤 BGM stageKey/play | 음악 호출만 try/catch, `[BGM] field retry`와 같은 Error 기록 뒤 공통 후처리 | `!(_forceCutscene||(G.stage===0&&!G._cutsceneDone))` 조건 및 기존 보류; 보스 필드46key/적·아이템·문·지역/일시공격 정리 |

전역 `BGM.play`에 catch를 넣지 않았다. 내부 stop·트랙 선택·재생 Promise·페이드·저장/오디오 backend와 dispatcher 정책은 불변이다. 동기 오류에서 진행을 이어가는 계약이며 실제 음악 복구·비동기 rejection 처리 개선을 주장하지 않는다. 다른 start/boot BGM 소비자는 기존대로다.

## 후속 상태·수치

| 처리 | 정확한 기존 계약 |
|---|---|
| 분기 | `_retryDruidFinale` 선행 → arena backup 또는 열린CH1 필드 capture/restore → 일반 `initStage` 재시작 |
| EXP | `Math.max(0,P.exp-~~(P.exp*0.3))`; 음향 오류 전에도 기존 위치에서1회 처리 |
| 자원·안전 | `P.s='idle'`, iframes300, kb{x:0,y:0}, 화톳불t300/r280. applyStats 뒤 `_refillRespawnResources`로최종HP/MP/ST/shield/기동게이지·돌진스톡 최대치/chargeCd0 |
| UI·게임 | 기존 HUD8 id의classList add, updateQS 뒤 G.on=true |
| 저장 | 기존 `if(_dbReady)await dbSave()`; 준비안됨이면0. DB 오류는 같은Error reject, 이미 재개된게임을 되돌리지 않음 |
| 맵·통계 | capture/restore46key·열린보스문·필드 적 원참조/HP·4지역·stageTime/_sStats·현재P/INV 불변. save/load의새stage생성계약 불변 |
| 일반 initStage | 해금 전CH1/다른일반필드 기존reset 유지. 음악오류를이유로reset정책을바꾸지않음 |

## 검수

| 단계 | 결과 | 정확 범위 |
|---|---|---|
| 원본 실패대조 | 새16 중4PASS/12FAIL | 양판 field/arena/general×play/stageKey 동기오류6각판. 정상 컷신보류/DB미준비와 비음향cache/save전파 대조2각판 |
| 후보 | 50PASS | 신규16+기존field복귀34. 후보2HTML과 실제 test source |
| 생산 | 86PASS | 실제 생산 retry50+기존 deathAudio36. source25 정상비교2는 별도baseline 환경조건이라 이번 실행에 포함하지 않음 |
| 실제 원문 | 양판 inlineJS6/importmap1 AST 및 실제 전체 retry async callback/capture·restore/helpers; 일반initStage 최종statement AST원문 | initStage전체 실행으로 바꾸지 않음 |
| 오류 검사 | G.on=false/P.s=dead에서시작, musicError1회로그/같은Error, 최종자원/QS/Gameon-before-save/EXP/iframes/bonfire 확인 | stage구성·audio·DB/stat/UI·render는 대역; actualnative·실디스크·청취 아님 |
| 필드 | field/arena 새6오류조건각판에서 원적3참조/HP/4지역/열린보스문 및initStage0 확인 | 일반stage생성은 기존대역으로reset수행 후 실제음악tail실행; field미보존 분기를역전하지않음 |
| 보존 | 각판2최소치환/+104B, 역치환source25전체byte-exact | 다른6개동일문자BGMcaller/전투공식/Q전용magic·E불가/보호2_3/index/savebuilder/schema 불변 |

초기 후보 조립은 재도전 음악 문자열이 본편7개 호출부에 존재하는 것을 확인해 assert로쓰기전중단했다. 실제 retry handler 구간1개로좁혀후보를만들었으며 production은성공후한번만적용했다. 게임오류와도구조립의범위확인 실패를분리하고 최초기록을보존한다. 검사원자료를제품완료건수로계산하지않는다.

## 정확한 source

| 파일 | bytes | SHA256 |
|---|---|---|
| `game.html` | 4034780 | `d35fed910223e1e43ee9a9d0457fb01ad1134582f62df846f0270d35b9a9830b` |
| `game-easy-test.html` | 3912449 | `7f0b324e4187f9b2633103de3919772526d57d1f4a9bba3fbd78a5b6be0d6e12` |
| `test/bossRespawnFieldState.test.cjs` | 28028 | `e6e2d9ca78ab0c43cb25b73b0efd29294751c89e807b6c2f53f16bfee45f6556` |

## 인계·문서·Git

QA0353 완료 `54b503f3-362a-49ec-bf33-945891b48f2a`의 두 caller 인계를 사용했다. 팀의 전체 initStage 순서모형/G.on 교차오염 결과를 root 실제 실행 증거로 쓰지 않고, 원본 G.on=false를 명시한 whole retry 검사와 실제 terminal audio statement 경계를 별도로 만들었다. 기존 QA0358 BGM 동기/Promise 조사와 중복 송신하지 않는다.

docs 전체 관련 키워드280행/77경로 검색 결과와 보호/manager 경계 분류를 보존한다. 현재 관련 정본11개에 새2caller/진행·저장·검수 경계를 동기화하고 정본1개를 추가한다. source25 package와 옛 조사/검수 수치는 해당 당시 이력으로 보존하며 소유 manager4·team 원자료·보호2_3를 수정하지 않는다. exact scope는 code2/test1/docs12=15이다.

원자료 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/root-retry-audio-source26/`: before/backups/baseline/candidate/replacements/baseline-test/candidate-test/production-test/keyword검색/applied/checkpoint 영수증. 실제NUL71→86→71의 root15만 commit/push/원격정확SHA 확인하며 타인67/manager4/게임·세이브를 보존한다.

현재 source25 앱3400은 source26 caller guard 미포함이다. 최신실제관찰 macOS잠금으로GUI입력0이며 같은후보 CH1 정상시작/4지역/보스문/사망·부활·재도전·native저장·청취/visual 인수는 미완이다. 소스 진행과 실제플레이를 분리한다.


## 2026-10-03 source26 Mac 실행본 — 재도전 음악 오류 격리 포함

| 항목 | 이번 확인 범위 |
|---|---|
| source/실행본 | `d7cff1fb9ef030acfc837041f0ccea93756b4b54` / job `c3902d79-03c0-4c25-9e66-a43226d10288` / port3401. initStage 마지막·field/arena retry의 BGM 동기 오류 격리2caller 포함 |
| 포장/기동 | 입력7918/runtime340 재사용·execute1회, payload7916 stage/app 각SHA exact·복사당6645491177B. bootstrap2 exact/arm64실행파일5. 실제title AX/JPEG2704×1696·HTTP4×200/정적3현재원문exact |
| 입력 변화 | 처음ioreg locktrue였으나 현재flag없음/console·loginDone=true 확인. 새앱Return1 정상전달→world intro 진행. 인증·잠금해제시도0. stale9click는노드수명오류/전달0이며새화면AX로교정 |
| 검수 한계 | source86PASS는당시코드검수/이번포장test반복0. 캐릭터/CH1시작·전투/획득/장착·4지역/보스문·사망/부활/재도전·정상저장재로드/청취/visual 완주 미인수. 타이틀·인트로를그완료로합산하지않음 |
| 보존 | source25/3400 포함기존11검수앱 존재/ID/profile·save메타만대조. 옛전체재인벤토리/세이브내용읽기·입력0, source25는이새2caller미포함의이전본. 원사용자앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0 |

정확한 경로·SHA·증거와실제플레이 Gate는 `docs/13출시·마케팅/MAC_CH1_SOURCE26_CANDIDATE_20261003.md`를 따른다. 옛source17 부분플레이와source25 타이틀을이번같은후보완주근거로합치지않는다.


## 2026-10-03 source27 Mac 별도 후보 — 포장/파일 검수 완료, 실제 기동 미실시

| 항목 | 현재 정확 상태 |
|---|---|
| 생산 코드 / job | `3c7dc6ab1cb0bc68cc3b969e27d06204fbe0f97f` / `953a5489-91eb-4d43-9c18-f05454ad27a7` / port3402. 일반 initStage 드루이드 ORB=[]/타이머3=0 각70B 포함 |
| 실제 포장 | frozen7918 입력/runtime340 재사용, 새job execute1회. stage/app payload7916 각각 전체SHA·coverage exact, 복사당6645491317B. source3 byte-exact/bootstrap2 역치환 exact/runtimearm64 실행파일5·plist ID 확인 |
| 증거 | physical 영수증31761B / SHA256 `94bcf7fe6ba1af2b39476511bc691b06b54c920ac636c8216f053ea638da385e` |
| 실제 기동 | 새앱 launch0/HTTP0/GUI입력0, profile/saveRoot 아직 존재하지 않음. CUA의 source26 화면 조회는 Mac 잠금으로 실패, 해제 질문 pending. 인증·잠금 우회0 |
| 인수 경계 | 생산104PASS는 이전 코드 검수이며 이번 포장 test반복0. 같은source27 CH1 시작·전투/획득/장착·4지역/보스문·보스 사망/부활/retry 진행보존·실저장·청취·시각 미인수 |
| 이전 실행본 | source26/3401 포함기존12검수앱 존재/plist ID/profile-save metadata만 확인. 내용hash·입력0. source26의 숲1·일반 사망retry·inventory는 이전 후보의 부분 플레이 이력이며 source27완주로 합산0 |
| 보존 | 기존67WIP/manager4/사용자23변경·원래게임/세이브 보존. 사용자 원래앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0. 삭제·cleanup·설치·새팀·새채팅0 |

앞선 source27 코드 checkpoint에서 “아직 포장하지 않음”은 당시 단계의 이력이다. 현재 실행 가능한 파일 후보는 준비됐으며 실제 Mac 플레이 인수는 대기다. 정확 앱/프로필·저장경로와 원문SHA는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`를 따른다. source26 음악 예외·source14 field복귀·46key 진행 보존 계약은 그대로 포함한다.
