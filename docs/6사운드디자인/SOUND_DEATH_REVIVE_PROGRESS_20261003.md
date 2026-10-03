# 사망·부활 진행의 오디오 오류 격리 — source25

실제 게임 source에 적용한 오류 격리 계약이다. 실제 Mac 플레이·청취·보스완주의 증명은 아니다. parent `feee434f65d6df2979f54a43afea973cce93da66`, 이전 source24 앱3399는 그대로 보존한다.

| id | 적용 위치 | 오류 후 이어지는 처리 / 유지 값 |
|---|---|---|
| D01 | `die / ultUnmute` | 마력연사·얼음송곳 해제/중복사망 guard/부활 판정. 음향 복원 성공 보장0 |
| D02 | `die / voice_second_wind` | 1회부활 사용표시·HP/MP/ST100%·iframes120·기존text/return |
| D03 | `die / SFX.beamStop·_stopShieldLoop` | 각각 독립 catch. 첫 stop 실패가 둘째 stop을 막지 않으며 300f fallen카운트/무적/연출 유지 |
| D04 | `die / player_dead1~4` | 기존 키·.8·`_r(1,.1)`·pri1·정상난수호출 유지. 자연/장비/스킬 부활력과 사전roll 계산 계속 |
| D05 | `_fallenResolve / SFX.levelup·voice_demon_revive` | 각각 독립 catch. 자원최대복원/idle·iframes120·기존텍스트·펫·30파티클 후속 |
| D06 | `_fallenResolve / SFX.die` | dead/사망통계 뒤 catch. `G.on=false` 및 전투 임시상태정리·사망화면/리플레이버튼·펫대사 후속 |
| D07 | `_fallenResolve / BGM.fadeOut / 예약 BGM.play` | fade500ms와 기존setTimeout600ms callback 각 catch. 사망UI 후속. callback음악성공 보장0 |
| D08 | `deathFX / !noSound` 직접음향 블록 | audio분류·버스트throttle5f/일반6·보스1 voice상한·gain/pitch/pan 정상기준 유지. 예외로그 후 기존flash/혈흔part·VFX실행. 시각예외는 catch하지 않음 |
| D09 | 일반보스 `_reviveTimer` 성공음 | 180f끝 판정·HP50%·revPts10소모·recover60/iframes90·spawn55/VFXpending40 보존. 재생실패가 상위업데이트로 탈출하지 않음 |
| D10 | 일반보스 `_reviveTimer` 확정사망음 | 기존완전사망/타이머0/flash·shake 보존. 게이트확정30f 검사 구조 변경0 |
| D11 | 실제 `loop` 첫 `_sfxFrameReset` | 소비자catch에서 오류 기록 후 update/draw/다음RAF 진행. backend·dispatcher 내부에 새catch없음. 비음향 update/draw의 기존 오류 처리 불변 |

## 실제 검수와 경계

| 항목 | 근거 / 한계 |
|---|---|
| source | AST로 양판 실제 `die`, `_fallenResolve`, `_r`, `deathFX`, `loop`, `_sfxFrameReset`와 revive-timer IfStatement 추출. inlineJS6/importmap1 각판 구문 확인 |
| 원본 | 공통36 중2PASS(비음향visual오류전파)/34FAIL(양판17audio장애조건). 잘못된 visual경로 대역·loop `_actx` 누락·185콜백/184물리틱 가정을 교정한 최종 결과. 최초 출력과 교정 영수증 보존 |
| 후보/생산 | 후보38PASS: 공통36+정상동등2. 생산38+기존bossRespawnFieldState34=72PASS |
| 정상동등 | 일반사망/장비부활/악마부활/보스180f성공·실패/일반·보스deathFX 7시나리오 + 실제loop185콜백의 events/state/RNG/타이머 동등 |
| loop | backend직접throw·context획득throw를 실제flush/loop에서 실행, 다음RAF1·후속update/draw 확인. 보스부활음 큐의 다음flush throw 뒤185콜백/184물리틱, HP500(대역mhp1000)/revPts10/queue0 유지 |
| 대역 | DOM·음향·clock/RAF큐·render sink·update 대역. loop본문은 실제지만 update는 actualboss timer branch 소비대역이다. 실제 전체물리/적AI/기기/native청취·사용자플레이 아님 |
| 오류전파 | backend동일Error전파 및 flush finally 전체배치폐기/성공prefix재시도0 불변. context획득은finally앞이므로 실패때queue잔류/다음프레임재시도는 기존정책. 노드/decoder/장치복구 완료 선언0 |
| 불변 | 양판 각12최소치환/+858B, 역치환source24전체exact. index/저장builder/schema/capture·restore46keys·피해/확률/Q전용패링·2_3설계 불변 |
| 미완 | 같은후보Mac 정상시작·4지역·보스문·사망/부활/재도전·저장재로드/청취/visual 미인수. source25앱3400 포장·타이틀·HTTP 확인/source24앱3399는 이전 코드 보존 |

## 정확한 source

| 파일 | bytes | SHA256 |
|---|---|---|
| `game.html` | 4034676 | `78f37f3b22b1c2584c43d2b7d89e05b549fdb3b9c6a3a77a8a6e740ed3dce05b` |
| `game-easy-test.html` | 3912345 | `87c00f2d24405274b50f4f5bce52917ae35de0f0803dddd855e676d6c3fe2470` |
| `index.html` | 342119 | `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` |
| `test/deathAudioProgress.test.cjs` | 13287 | `20eb420a3b9698b329965d2f5c5a2a41e458fb9a47483fb27922d70a4d2658d5` |

각 소비자의 `[SFX]` prefix로 오류를 기록한다. 새 save/진행 필드가 없으며 성공한 사운드나 파티클을 rollback하지 않는다.

## 인계·보존

SOUND0329(`01a0ffcf-9a2c-7f60-b5ea-1177ee1a3811`)의 player death/deathFX·loop 근거를 인수했다. 팀의 누적10경계16PASS를 이번 부분채택 PASS로 사용하지 않고 root가 새 원본 실패대조를 했다. player입구/성공부활/BGM/일반boss음향 catch는 root의 신규 검수다. lazydecode pending 및 SOUND0338누적11경계 후보는 이번에 채택하지 않았다.

원자료: `/Users/fordeargamers/Projects/exoduser-migration-20261001/tmp/mac-migration-runtime/continued-review-20261003/root-death-audio-source25/`의 before-receipt/backups/replacements/baseline-test-final/candidate-test-complete/production-test/production-test-receipt/fixture-corrections. docs전체 관련키워드188줄/34경로 검색과 동기화·보호67/manager4·타인WIP/앱/게임·세이브 보존 후 code2/test1/docs13 정확scope16 commit/push/remote SHA를 별도 영수증에 보존한다. source검사/보고서를 제품완료 건수로 계산하지 않는다.


## 2026-10-03 source25 Mac 실행본 — 사망·부활 오디오 오류 격리 포함

| 항목 | 이번 확인 범위 |
|---|---|
| 코드/후보 | `b9c1a2e6559fd907c6ba0b72b8a5f6d19b9f88b5` / job `a05224ef-0b57-4b87-ab0a-fba20aeb2a45` / port3400. die·fallenResolve·deathFX 및 실제loop의 음향예외 격리 포함 |
| 포장/기동 | 입력7918/기존runtime340/execute1회. payload7916 stage/app각SHA exact, 복사당6645490969B. 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·HTTP4×200/정적3원문exact |
| 이전 검수 | source25 생산검사72PASS는 당시source검수이며 이번 포장단계test반복0. source24 콤보와 이전 필드복귀 수정 포함 |
| 실제 입력 | macOS ioreg의 `CGSSessionScreenIsLocked=true` 읽기확인. GUI입력0/새캐릭터0/잠금해제 새회신 대기. 인증·잠금 우회0 |
| 남은 목표 | 같은후보 CH1-1 시작·전투/획득/장착·4지역/보스문·사망/부활/재도전·저장/청취/visual 미인수. QA의retry BGM예외 후보는별도root실제handler검수/채택대기이며이번앱에포함했다고주장하지않음 |
| 보존 | source24/3399 포함기존10검수앱 존재/plist ID와profile/save 메타만대조. 사용자게임·세이브입력0/보호67/manager4 보존. 원래사용자앱59376baf/08cac1ce 정확경로UNKNOWN |

정확한 경로·SHA·검수 경계는 [source25 Mac 후보](../13출시·마케팅/MAC_CH1_SOURCE25_CANDIDATE_20261003.md)를 따른다. source24 타이틀·source17 부분플레이를 이번 같은후보 완주 근거로 합산하지 않는다.


## 2026-10-03 source26 — 재도전의 BGM 실패와 진행 분리

| id / 소비자 | 현재 오류 경계와 후속 처리 |
|---|---|
| R01 / `initStage` 마지막 스테이지 음악 | `try{BGM.play(BGM.stageKey(si));}catch(e){console.error("[BGM] stage start",e);}`. stageKey/play 동기 오류를 기록하고 함수 정상 반환. 앞선 맵 생성/캐시/조명 예외는 catch하지 않음 |
| R02 / `retryBtn.onclick` 필드·arena 복귀 음악 | 기존 컷신 보류 조건 그대로, 그 조건을 통과한 음악 호출만 catch/`[BGM] field retry` 기록. 공통 자원/idle/iframes300·화톳불300f/r280→최종스탯/완충→HUD/QS→G.on=true→준비된DB 저장 계속 |
| 진행·저장 | 기존 EXP30% 정수 손실·46-key 필드/열린 보스문/적 HP·지역/현재 P·INV·통계 보존. 해금 전 일반재시작 유지. dbSave 본문/schema/API 변경0; 저장 예외는 그대로 reject |
| 검수 | 신규16 원본4PASS/12FAIL→후보 신규16+기존34=50PASS. 생산50+기존음향36=86PASS. 실제 전체 retry handler·capture/restore 실행, 일반 initStage는 기존 생성대역 뒤 실제 마지막 음악 statement만 실행. 전체맵/native/기기청취·실저장 검수 아님 |
| 적용 경계 | 본편/Easy 각2호출부·+104B, 역치환source25전체exact. BGM 본체/stop/Promise·backend·음량·곡선택/RNG·공식·Q/E·보호2_3 불변. source26 앱3401 포장·타이틀·입력 전달 확인. source25 앱3400은 이전 코드로 보존; native 완주/청취/실세이브 인수 미완 |

정본은 `docs/6사운드디자인/SOUND_RETRY_PROGRESS_20261003.md`다. source25 사망·부활72PASS와 포장·타이틀 기록은 당시 인수 이력이며 이번 실제 Mac 사망/재도전 완료로 합산하지 않는다.


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
