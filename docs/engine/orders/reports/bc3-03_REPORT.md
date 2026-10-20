# BC3-03 — 3장 신규 7기술 시작 command/ack 계획

## 기준·의존·변경 범위

| 항목 | 확인 |
|---|---|
| 작업 / 브랜치 | bc3-03 / codex/bc3-03-20261020 |
| 기준 main | fetch 후 56c939fb010cb29d8ff262442339e11a68634817. 요청 하한 249c26fad 이후이며 BC06 native_ch1_boss_pattern_start.gd가 main에 존재 |
| 의존 병합 | main에서 --no-checkout+sparse worktree를 만들고 ec9f14492f587d4d3dfea5780c55bd709875e3e6을 정상 --no-ff merge. 병합 db726b51dae7c6e9e62763a7117c127da99112eb의 두 부모는 위 main과 ec9. rebase 없음 |
| 병합 충돌 | CHANGELOG 맨 위 추가 충돌만 해결. main 원본 3,698,776byte 전체를 보존하고 BC3-01r 절 10행을 앞에 추가. main에 이미 있던 충돌 표식 12행도 보존했으며 별도 원본·검증 로그에 기록 |
| 지시서 | trace-boss-ch3 7a3080a4 §2.2/2.3·§5.2의 BC3-03. BC3-02는 건너뜀 |
| 자기 변경 | 제품 파일 1개, 새 테스트·원본 oracle 각 1개, 자기 UID 2개, 이 보고서, CHANGELOG 절: 총 7개 |
| 보호 범위 | 기존 공유 제품·테스트, Main/State/World/hurtE·저장·spawn 색·BC08 변경 0줄. 이전 bc3-01/01r 브랜치 보존 |
| 원본 | game.html 65,692행, SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. main·의존 병합 후 원본 동일, 변경 없음 |
| R 보존 | /Users/fordeargamers/Projects/exoduser-migration-20261001, HEAD dd49171c5b88e211575a41f185395d6c0a14b184, branch codex/mac-live-play-time-main-20261017. tracked INDEX/WORK 빈 상태 유지 |

기준은 의존을 병합한 db726b51이다. ec9의 신규 파일 6개와 CHANGELOG 절은 명시 승인된 의존 병합이며, 이번 구현의 7개 파일과 구분한다. BC06은 main의 파일을 직접 preload한다. 미병합 BC06/WIP 이송은 없다.

## 원문 시작·호출 순서

native_ch3_boss_new_start.gd는 BC06의 _write/_apply/_call/_text/_ensure/_append/_packet/_draw/_aim/_map/_i32와 catalog context 검증을 재사용한다. 기존 공유 21개·CH2 고유 9개의 본문은 복제하지 않았다. 새 API는 아래 7개만 소유하며 나머지는 new_ch3_start_required로 거부한다. 기존 30개나 미지원 case를 완료 수에 포함하지 않는다.

| game.html 행 | 시작 case와 계약 |
|---|---|
| 37703–37705 | _atkParryable은 기존 Common 분류 사용. tele=~~(mv.tele*BOSS_PHASES[phase].teleM)+extraDelay. CH3는 si2 보정·드루이드 피날레가 false. raw start는 selector의 Set/move.phase 조건을 다시 검사하지 않음 |
| 37720–37721 | laser: 현재 facing→laserAng/laserLen0→bossLaserWind/tele 또는 50→_T 경고→SFX.magic0. 시작에서 player 재조준·발사·피해·무적 부여 없음 |
| 37738–37749 | teleStrike: angle RNG→distance RNG→canMv 요청. false면 뒤 80의 safePt 요청. 명시 null이면 원위치, 좌표 응답이면 그 좌표 사용. warnX/Y→origX/Y→prepMax→bossTelePrep/st2→_T 문자→charge. 실제 teleport 없음 |
| 37846–37853 | delaySlash: P 방향 facing→Hold 상태→30+~~(U90) st2→dsMaxT→번역하지 않는 raw ‘⚠ ...!’→charge. metadata tele/rec로 대체하지 않음 |
| 37854–37859 | perilThrust: P 방향 facing→bossPerilWind/tele 또는 25→_T 문자→charge. thrust·접촉·패링·피해 미집행 |
| 37992–38002 | gravityWell: P 방향과 거리*.4 계산→queue ensure ack→append(x/y,t0,max180,r900,pull9) ack→문자→magic3→recover25. dmg/el/src 필드 없음 |
| 38161–38177 | safeCorner: ensure ack 후 Q=~~(U4), W/H의 50/42 fallback·T40·중심±*.22. safeR650/fullR=W*.5/warn120/max150/dmg~~atk3/el. append ack→안전 좌표 문자→보스 경고→magic0→shake10→recover60 |
| 38192–38211 | tidalWipe: ensure ack 후 Q4방향·맵 가장자리·각 π/2,π,1.5π,0. actor._bossPhase로 spd12+phase2/thick300+phase50, 방향별 폭·warn80/max180/dist0/dmg~~atk2.5/el. append ack→_L 방향+_T 파도 문자→magic2→shake10→recover50 |

phase 인자는 tele 계산에, actor._bossPhase는 tidal payload에 각각 사용한다. missing/null actor phase는 원문처럼 0이며 지원 fixture 범위는 0..4(소수 포함)이다. map의 0/null/missing fallback, 음수·소수 치수, 큰 ATK의 JS ToInt32도 원문과 대조했다. _T/_L은 원문 인자를 가진 값 recipe로 반환한다. tidal의 concat/_L/_T recipe를 실제로 소비할 owner 인수는 별도 HOLD다.

시작에서 지정하는 recover는 25/60/50 그대로다. 다음 update의 공통 recover20 clamp를 당겨 적용하지 않는다. teleStrike 착지 후 bossRec35는 G41015–41046의 후속 state이며, 이번 start가 만들지 않는 것도 검사한다. metadata.rec35를 시작 후딜로 쓰거나 실제 bossRec runtime 검증을 완료했다고 보고하지 않는다. 새 4계열의 9개 runtime state 소비는 후속 단위다.

## API·ack·불변

| API / 경계 | 계약 |
|---|---|
| source_receipt | ready/source hash·7 start_ids·상태 4계열/queue 3개·원본 범위·live_combat_connected=false/save_io=false/full_tick_complete=false |
| begin_start(si,id,enemy,distance,phase,extra_delay,context) | si10..13/7ID·실제 catalog 의존 검증. 필수 actor/P/r/facing/공격/원소/map reader를 검사하고 BC06 형식 program/token 반환 |
| next_start(token,response,rng) | owner/version/id/si·catalog Script/path/hash/pc/pending 검증. snapshot write/event 뒤 요청을 1개씩 executed=false로 반환. 다음 단계는 ack:true 필수 |
| teleport readback | canMv는 bool, safePt는 명시 null 또는 유한 x/y Dictionary. ack/value 누락과 오형식은 NOT_READY |
| RNG | 태그·원문 행·unit ledger는 BC06 _draw 사용. provider 없음·비유한 수·범위 밖 unit이면 NOT_READY. 실패 시 부분 enemy/command/continuation 없음 |
| 입력·queue | caller token/context/enemy 불변. ensure/append는 owner 요청만 반환. 기존 queue 항목과 다른 queue 보존을 fixture에서 확인 |
| 완료 의미 | done=true는 시작 계획의 끝이며 full_tick_complete=false. 테스트 ack는 계약 fixture로서 실제 효과 owner의 집행 성공을 의미하지 않음 |

실제 actor/world/queue/SFX/UI·공유 RNG·저장 IO를 실행하지 않는다. 기존 owner 연결은 후속 통합 접점이다.

## 독립 원본·정밀도·검사

새 oracle은 채택된 BC06/BC2-03의 원문 VM event driver 형식을 재사용한다. 전체 SHA와 9개 구간 SHA를 실행 전에 고정 검증한다. 기대값은 제품 GDScript가 아닌 원문 _bossStartPattern 7개 case의 실제 VM 호출에서 얻는다. 모든 write/command/RNG event 순서, queue와 최종 snapshot을 대조한다.

307사례에는 4stage×5phase×7case, tele=0/±.25, Q 경계의 직전·동일·직후, delay U 경계, collision/safePt 세 경로, actor phase와 인자 phase 분리, null/소수/음수 map 치수·큰 ATK, P 일치·축·뒤 방향을 포함했다. 기존 queue와 helper 내부의 추가 RNG 소비를 주입하고 KR/EN recipe도 검사했다. 결과는 2,719 event·241 RNG다.

OS.execute 출력은 전체 join하고 Node는 --node-bin, 원본은 --source-game으로 받는다. fixture는 새 격리 user dir 안의 UTF-8 파일로 수송한다. JSON 숫자는 정수 문자열/binary64 hex로 복원한다. 실수 비교는 채택 BC06/BC2-03의 상대/절대 1e-12를 늘리지 않고 재사용했으며, 정수 기대값은 정확 동등 비교한다. 타입·ID/상태/문자·배열·순서·소비수도 정확 비교한다. binary64 수송과 초월함수 결과 비교는 구분하며, 모든 실수 출력의 비트 동일을 주장하지 않는다. 기존 검사·기대값·허용오차 변경은 없다.

오류 fixture는 지원 밖 stage/타 owner ID·phase·누락 reader·잘못된 actor phase/map, missing/invalid RNG, 조작 token/provider/path/hash, 누락 ack·잘못된 readback, unknown op를 거부하고 입력 불변을 검사한다. 전역 RNG seed 전후와 제품의 IO/scene/RNG 진입 부재도 확인했다. 별도 Node 거부 검사는 변조 원본을 SHA 단계에서 exit1로 거부했으며 fixture 생성은 없었다. 임시 복사는 삭제했다.

## 실행 결과

Godot 4.7.2.stable.official.ed1daf0bf를 headless --verbose로 실제 실행했다. 이전 보고의 PASS는 가산하지 않았다.

| 원로그 basename | 실제 수치 | exit / ERROR / ObjectDB / resource잔류 | 소요초 |
|---|---|---|---:|
| import-01 | import | 0 /0 /0 /0 | 13.256 |
| new-start-01 | 6,824단정 /0실패 | 0 /0 /0 /0 | 273.645 |
| bc2-02-regression | 44,891단정 /0실패 | 0 /0 /0 /0 | 41.154 |
| bc2-03-regression | 25,749단정 /0실패 | 0 /0 /0 /0 | 17.292 |
| catalog-regression | 43,491단정 /0실패 | 0 /0 /0 /0 | 6.797 |
| contracts | 5그룹 /0실패 | 0 /0 /0 /0 | 2.331 |

신규 6,824/0, 관련 기존 회귀 114,131/0, contracts 5그룹/0이다. skip 0·정상 stderr 0byte이며, 종료 ERROR·ObjectDB 누수·리소스 잔류 모두 0이다.

총 6회 모두 실행 직전 지정 pgrep으로 count<2를 확인했다. count2일 때 30초씩 총 24회 기다렸다. 자기 Godot는 순차 1개이며 타 프로세스를 종료하지 않았다. override는 매 run 설정하고 finally에서 0byte로 비웠다. 새 USERDIR은 EXODUSER-bc3-03-Isolated-20261020, 기존 3개 suite는 각 파일 상수 이름이다. 상수가 없는 contracts만 EXODUSER-bc3-03-Contracts-Isolated-20261020을 사용했다.

신규 전체 실행은 273.645초였다. continuation마다 현재 catalog/context 검증을 재사용하는 비용을 포함한다. 실전 60Hz/FPS·전투·화면 성능을 검수한 결과가 아니다. 검사 수를 줄이거나 공통 catalog에 캐시를 추가하지 않았다.

## 후속·HOLD·제출

실제 9state의 clock/판정과 3queue 소비는 후속 단위다. 기존 공유 21개·CH2 고유 9개의 owner 인수나 미지원 접점도 완료로 승격하지 않는다. spawn 색·BC08은 다른 창 소유다. Main/State/World/hurtE·Q/E·저장·actor/sound/HUD 실집행 연결 HOLD를 유지한다. 다음 BC3-04는 별도 배정 전 착수하지 않는다.

원로그는 ~/exoduser-wt/_out/bc3-03/에 보관한다. 원본 fixture·변조 거부·*.gate.jsonl/*.out/*.err/*.engine.log/*.json·의존 병합 부모/CHANGELOG 원본·실행/제출 byte 검증·R 보존 검증을 포함한다. Godot가 만든 다른 untracked UID/import/cache는 staging하지 않는다.

정상 훅·경로 지정 staging·자기 브랜치 push·원격 SHA 일치·DONE 작성 후 자기 worktree를 제거한다. 최종 SHA·부모·원격·R/이전 브랜치 보존·정리 기록은 외부 submission.json/DONE.txt/cleanup-verification.json에 남긴다. main push/force/reset/rebase/add -A는 없다.
