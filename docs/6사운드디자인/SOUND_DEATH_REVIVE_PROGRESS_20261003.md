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


## 2026-10-03 source28 Mac 파일 후보 / source27 실제 플레이 후속

이 절은 이전 포장·잠금 대기 이후의 상태다. 이전 날짜별 기록은 당시 이력으로 보존한다.

| 항목 | 확인한 상태와 남은 검수 |
|---|---|
| 최신 파일 후보 | source28 / job `2242869e-903a-4917-a38c-e0f6c02ff47c` / port3403 / 입력 커밋 `f376e3ce9c3524fa7874078c6738e1e5ab8a1e5b` / **PACKAGED_NOT_RUNTIME_ACCEPTED** |
| 포함 코드 | field 복귀의 `P.poison=0;P._rbPoison=[];P._rbBurn=[];` 양판 각44B 및 이전 initStage 드루이드 초기화. 생산89PASS는 경계 대역 포함 코드 검수 이력이며 실제 앱 완주 증거가 아님 |
| 실제 파일 검수 | frozen7918 입력 중 bootstrap2 파생. stage/app payload7916 각각 전체SHA 일치, source3 exact, bootstrap2 전체 역치환 exact, arm64 실행파일5와 plist ID 확인. 재빌드·검사 반복0 |
| source28 실제 플레이 | launch0/native입력0. 물리 검수 시 새 profile/saveRoot 미생성. 전투·보스 사망/부활·열린 문/몬스터 보존·실저장·청취·카메라 인수 미완료 |
| source27 실제 장착/일반retry | 정상 전사 시작→연습 건너뛰기→CH1 첫 필드. 장착4건 후 CP1857. 일반 사망→다시 일어서라로 HP549/549 MP376/376 SP279/279 및 장비 유지 확인 |
| source27 마지막 관찰 | 첫 처치1/32, EXP2/15, 악의997, 시간55초, HP0. Controls 설정 화면에서 대기. 앞선 완충 관찰을 현재 생존으로 계산하지 않음. 아이템 줍기·4지역·보스 해금/사망 미인수 |
| 보존 | source27 포함 기존13 검수앱 존재/Info.plist ID 확인. 기존 profile/save 내용 변경0. 원사용자 앱 정확 위치 UNKNOWN; 전체 원본hash 보존 검증으로 확대0 |
| 물리 영수증 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source28-build/physical-receipt.json` 32859B / SHA256 `2b677de448db516036e2d32069f5b326e5aec535104f7db0072c57b5d21e5bda` |

파생 port3403·격리 user-state는 원본 서버3333·저장 schema 변경이 아니다. source27 부분 플레이를 source28 제품 인수로 합산하지 않는다. 상세 successor 경로·SHA·장착 표는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`의 후속 기록을 따른다.

파일 복사 검수는 음악/효과음/사망·부활 음성 청취 검수가 아니다. 새 청취 인수0.

## 2026-10-08 — 방패 반복음 정지의 음원 소유권

<!-- ROOT-SHIELD-LOOP-STOP-OWNER-20261008 -->

실제 main의 전역 `_stopShieldLoop` 한 함수 변경이다. 이전 날짜별 source25·lesson·호출자 검수는 당시 이력으로 보존한다. 새 코드의 stage·URL 제한은 없으며, 사용자 열린 IAB13은 old-loaded source 그대로 두었다.

| 항목 | 현재 계약 |
|---|---|
| 소유권 | 호출 당시 `src=_shieldLoopSrc`, `gain=_shieldLoopGain`을 캡처하고 전역 두 참조를 외부 음향 호출 전에 null로 해제한다. 캡처 source가 없으면 반환하며 정지 예약을 만들지 않는다. |
| fade | 캡처 gain이 있으면 .0001까지 `actx().currentTime+.1`의 기존100ms fade를 시도한다. 이 try/catch는 정지 예약과 독립이다. |
| 지연 정지 | 기존150ms setTimeout callback은 캡처한 src.stop()만 시도한다. 옛 A의 예약이 새 B의 전역 슬롯을 읽거나 정지·해제하지 않는다. 예약 오류와 callback stop 오류는 각각 catch한다. |
| 유지 | _startShieldLoop의 shield_loop·loop=true·0.25×sfxVol()·호출자/순서, beam/BGM, 음원/음량식, 전투·자원·저장 스키마 변경0. 새 timer 종류·disconnect·RAF·G 상태 없음. |
| 신규 검수 | 실제 _startShieldLoop와 _stopShieldLoop 전체를 Node1/VM9에서 통제 AudioContext·source/gain·timer 큐로 최초1회 실행: 9그룹20조건 PASS, FAIL/setup/미도달0, exit0. A→B 빠른 교체, 단독 정지, fade/context 오류, 반복·빈 정지, stop/예약 오류, fade 중 재진입 B, gain 없는 source 포함. |
| 한계 | 실제 WebAudio/장치·청취·GPU/Chrome·사망/부활 전체 경로는 NOT_RUN. 예약/stop 실패 때 실제 음향 종료·자원해제 보장0. start 부분 생성 실패·기존 caller의 앞선 음향 예외·beam/BGM 수명은 별도 미완료다. |
| source | working4113185B/eac1dfb2080a1602e66823431b94f515858acb5f92f1f29339b8bd29d3e7b4d4, owned4113000B/a8939c3dd4ca27f0baa90d55ec50f8a959b85aaa21c950c0b92a0fb39c2d000b. 외부 working/HEAD 선 fullbytes백업·한 hunk 역변환 exact, 기존 foreign185B 미채택 보존. |
| 관련 문서 | 코드 후 허용텍스트1021/Markdown818 대상 관련검색1회: 11경로11행11회. 현재4개 동기화, 유지된 lesson caller·역사7개와 무관 반사루프1개 보존. 현재4 중 사운드 본문은 미매칭 필수 추가이므로 처리 합집합12경로. 전수 fullread·보호2_3/giant owner본문 검사로 확대하지 않았다. |
| 근거·판정 | 외부 E/ch1-shield-loop-stop-owner-20261008/implementation-receipt.json·validation-receipt.json·source-peer.json·docs-search.json·docs-disposition.json·visual-verdict.json. peer blocking0. UI_NOT_ASSESSED/VISUAL RETOUCH이며 native6·청취·실보상save 인수 아님. 정상 소유 commit/push/remoteexact는 completion 영수증으로 별도 확정한다. |

§23 MAP PRODUCTION REPORT: STAGE=actualmain global audio helper; MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK=맵·geometry·collision·route·배치 변경0; CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT=NOT_RUN; TECH QA=통제CPU20조건만, native/pageerror/404/실청취 미관측; FILES=game1hunk+현재docs4/타인WIP보존; GIT=소유범위 정상보존 결과는 별도completion; VISUAL VERDICT: RETOUCH.

## ROOT-BGM-FADE-INTERVAL-OWNER-20261008 — 같은 캐시 음원 재생의 이전 페이드 격리

실제 main `BGM.stop/_onEnded/fadeOut` 3개 hunk를 구현했다. 이전 코드의 같은 cached Audio 재생에서 오래된 fade callback이 새 volume .3을 .27로 낮추는 반례를 통제 실행으로 확인했다. Audio 객체는 재사용되므로 interval handle과 현재 Audio identity를 함께 소비한다. 전역 BGM controller 범위이며 CH1/URL opt-in 전용 기능이 아니다.

| 접점/항목 | 현재 소비 계약 | 유지/한계 |
|---|---|---|
| `BGM.stop()` | 기존 `_fade`를 캡처하고 `_fade=null`로 소유권 해제 후 취소; Audio가 이미 null이어도 실행 | numeric handle 0도 취소; Audio pause 예외의 기존 caller 전파 유지 |
| `BGM._onEnded()` | 다음 source가 확정된 뒤 이전 interval을 해제/취소하고 기존 cache Audio를 가져와 재생 | source 없음 early return, 곡 선택/act queue/RNG 유지 |
| `BGM.fadeOut(dur)` | 생성한 interval handle과 현재 `_cur===a`를 callback마다 검사; 이전 callback은 새 interval/volume/current를 변경하지 않음 | Audio mismatch는 자기 interval만 해제; 새 playback generation field 없음 |
| 정상 fade 완료 | 자기 interval 해제 뒤 기존 onended=null/pause/currentTime=0; 현재 Audio가 같을 때만 current/key 비움 | native media scheduling/장치 해제 미인수 |
| cadence/수치 | 기존 50ms, `step=a.volume/(dur/50)`, `max(0,a.volume-step)`, caller dur 유지 | 기본 volume .3, cache LRU6 및 setVol 중 생성시 step snapshot 유지 |
| 코드 범위 | game.html 3 hunk, 순증 380B | DOM/새 G상태/타이머 종류/RAF/에셋/전투/자원/save/PNG/scene/nav 변경 0 |
| exact source | working 4113649B / 6520ea19f795fbdb79278c3a3b847c8c6bcfd948a0319518ba0a40f330ad9c3e | owned 4113464B / ace47367a622a45ba815ccad503bdc3a94baa995af00ab2de5fdb0d36f72d68b |
| 타인 WIP | game foreign185B, 설정3.3 foreign2948B 미채택 유지 | working/HEAD 선 fullbytes backup, 같은 ownhunk/inverse exact, 소유 blob만 stage |

검수 epoch: 최초 physical Node1/VM13 중 이전 반례 VM1·조건1 REPRODUCED는 별도다. 최종 실제 whole BGM + 통제 Audio/document/timer VM12·12그룹36PASS/FAIL0/setup0/미도달0/unhandled 계측0/exit0이다. 이전 반례와 최종 PASS를 37개 clean 합격으로 합산하지 않는다. 같은 cache play/playTrack/next곡·교체 fade·현재 Audio 교체/null·정상 선형 fade·volume 변경·early return·pause 예외 경계를 한정 인수했다. Codex185 실제 최종3hunk 정적 peer blocking0/추가 patch0은 CPU 또는 청취가 아니다.

실제 HTMLAudio/Chrome/GPU/청취/새 PNG/save 실행 0, native NOT_RUN, UI_NOT_ASSESSED다. 300ms error retry의 오래된 _onEnded, death600/victory1000·beam 등 별도 지연 producer, pending/autoplay/부분 시작 예외와 장치 정리는 미해결/미인수다. 방패 stop 완료와 이 BGM 한정 계약을 전체 음향 인수로 합치지 않는다. 기존 사용자 IAB13은 old-loaded source 그대로이며 신규 코드를 실시간 적용했다고 주장하지 않는다.

코드 후 docs whole 관련검색 1회: eligible text1022/Markdown818, 112경로·298행·351회. current4만 동기화하고 나머지 무관100/다른 유지 consumer7/역사 감사1을 구분했다. 112문서 전수 fullread 주장은 하지 않는다. 준비 parent 부재 helper read/write0 1회는 제품·suite FAIL이 아니며 같은 CPU/검색/옛 완료를 반복하지 않는다.

§23 MAP PRODUCTION REPORT: STAGE=actual main global BGM interval owner; MASTER(silhouette/regions/main route/side spaces), OUTER MASS(LEFT/RIGHT/TOP/SOUTH/major holes), LARGE(source assets/composites/overlap/repeated silhouette), MEDIUM(connections/remaining holes), GROUND(shadow/contamination/structure integration), LANDMARK(primary/secondary/tertiary)=맵·원자료 변경 없음/새 시각 평가 없음. PLAYABLE(main arenas/travel/breathing/threat/combat readability)=게임플레이 변경 없음. CAMERA QA(START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT)=NOT_RUN. TECH QA route NOT_RUN/collision unchanged/pageerror·404 NOT_OBSERVED/seam은 통제 audio owner만/loading unchanged/performance 미측정. FILES=owned game1+current docs4; foreign WIP 미채택. GIT 최종 commit/push는 외부 completion receipt의 실제 결과를 따른다. VISUAL VERDICT: RETOUCH; UI_NOT_ASSESSED/audio NOT_RUN. 정상 CH1-1 boss 개방→사망·부활→재도전/native6/청취/실보상 SaveACK/A급 인수 미완료다.

근거: E/ch1-bgm-fade-owner-20261008/{implementation-receipt,cpu-execution-receipt,cpu-result,validation-receipt,visual-verdict,docs-search,docs-disposition,docs-completion-receipt,completion-receipt}.json 및 codex-185-official/manifest.json. WOLF 쓰기의 automatic approval dangerous 거절은 구체 사유 미제공이며 추가 접근·실행·채택하지 않는다.

## 2026-10-08 빔 샘플 지연 콜백 소유권

`ROOT-BEAM-LOOP-CALLBACK-OWNER-20261008`: 실제 `SFX.beamStart/beamStop` 샘플 분기2hunk/+149B. 과거 beam 미완료 기록은 당시 epoch이며 아래 소유권 경계만 새 구현 완료다. 전반 음향·청취 인수를 뜻하지 않는다.

| 적용 위치 | 현재 소유·수치 계약 | 보존·한계 |
|---|---|---|
| `beamStart`의 `next` | 매 start의 캡처 `lg`와 `next`가 현재 `_beamLoopGain/_beamLoopNext`와 같을 때만 RNG·source 생성. `src.connect(lg)` | 기존 `beam_r1/r2/r3` 3종·정상 RNG·`0.8*sfxVol()`·`loop=false` |
| `src.onended` | 캡처 source가 현재 `_beamLoopSrc`일 때만 캡처한 `next()` 호출; next 내부 gain/function 검사도 적용 | 이전 체인·같은 체인의 이전 source callback은 새 샘플/참조를 만들지 않음. native 이벤트 원자성 주장 없음 |
| `beamStop` 샘플 분기 | `src/gain` 캡처 → 전역 next/src/gain 3개 null → onended 해제·fade·정지 예약을 각각 독립 try | `.0001`까지100ms fade, 캡처한 source만150ms 뒤 stop. setter/fade/actx 예외도 뒤 예약 시도와 분리; 예약 실패는 기존 catch로 격리 |
| 기존 범위 | 앞 oscillator 분기·호출자·player/boss 공유 채널·전투·자원·save·원음원 불변 | 앞 oscillator 예외는 샘플 정리 도달을 막을 수 있음. 부분 start/재진입 원자성0, stop 없이 새 start면 이전 단발은 자연 종료까지 남을 수 있음 |
| 최초 CPU | Node1 / new Function factory17 / VM context0; 11그룹36조건 PASS(동작35+정적1), FAIL/setup/미도달/계측 unhandled0, exit0 | 수정 전 전역 지연 stop/이전 onended 재생성 반례2는 별도 재현; 최종36·옛 suite와 합산0 |
| CPU Gates | 149/150ms·실 connect·source/gain/next 각각 stale·자연 next·같은 체인 replay·empty/missingbuffer/repeat stop·setter/fade/actx/currentTime/timer/stop 예외 | 실제 WebAudio·기기 자원 해제·청취·Chrome/GPU·새 PNG/save 실행0. timer/stop 실패 시 실제 종료 보장0 |

QA 공식 raw는 보존했다. 원 하니스는 실행 전 누락·실패 exit·시간 port·factory/VM 분리 보정이 필요해 CPU 실행0으로 보존했고, 보정 하니스로만 최초 Node1을 실행했다. 제품 실패·CPU 재시도로 합산하지 않는다. Source peer204 blocking0/findings0. 사용자 기존 IAB13은 이전 로드 상태로 무조작 유지한다. `VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED / native NOT_RUN / NOT_LISTENED`; §23 전체 및 정확 핀·보존 결과는 외부 `ch1-beam-loop-callback-owner-20261008/visual-verdict.json`, `validation-receipt.json`, `completion-receipt.json`에 기록한다.
