# BC10 — 1장 보스 잡기·잠행 상태 packet

## 판정과 기준

**BC10 독립 packet 구현·원문 대조 완료.** 추적 문서 §5의 BC10은 남아 있으며 공용 수정 없이 가능한 범위다. 실제 플레이어 강제 위치·피해·패링·탄 등록·Main 연결은 구현하지 않았다. 순서안 다음은 BC11이며 이번 작업에서 착수하지 않았다.

| 항목 | 근거 |
|---|---|
| 작업 / 브랜치 | `bc10` / `codex/bc10-20261020` |
| 기준 | 시작·마감 fetch 후 `origin/main=6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d`. 요구한 최소 SHA 충족. 이 main에서 직접 분기 |
| 작업 방식 | `worktree add --no-checkout` 후 non-cone sparse-checkout. `/godot/ /docs/ /tools/ /.githooks/ /AGENTS.md /game.html /index.html /.gitignore /*.js /*.json`만. 대용량 웹 원본 에셋 미수신 |
| 원본 | game.html 65,692행 / SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; index.html 4,742행 / SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`. 시작·마감 main과 byte 동일 |
| 선행 계약 | BC05 시계 이후 switch / BC06 시작 snapshot / BC08 이동·충돌 계약. BC10은 선행 스크립트를 preload하거나 복제하지 않는 독립 계산 모듈 |
| 일반화 참고 | `codex/bc2-02-20261020` / `a3b5391c54bb62b9f784bf2acac12bfbd2747192` 위에서 분기하지 않음. BC04~07 회귀의 모듈 사본에만 일반화 버전 사용. BC01~03은 최신 main, BC08~09 모듈·BC04~09 무수정 테스트는 인수된 `0113315e487c3e8cef71db03aba6dc36114f10a3`에서 읽음. 파일별 원격 기준·hash는 `regression-manifest.json`. 이 사본들은 `_out/bc10/`에만 존재 |
| WORK_BOARD | `docs/engine/orders/WORK_BOARD.md` 시작·마감 동일. TRACE-BOSS-CH1 60행은 문서 추적, BC04~07 73~76행은 완료 표기. BC10 제어 상태 구현과 겹치는 진행 작업 없음. 작업판 수정0 |
| 변경 범위 | 신규 module/test와 자기 UID2, 이 보고서, CHANGELOG_SYNC 맨 위 절. 공용6파일·다른 담당 코드/테스트·설계/LOCK·Q/E·2_3·저장·원본·씬·프로젝트 설정 변경0 |
| R 보존 | R HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`; tracked index/work 및 index SHA256 `f705dda99b8826e2591370d7fad918bba3a80a294223fb89332a6e3076d7eeb9` 보존. fetch/worktree의 공통 Git 관리 메타데이터와 구별 |

## 구현과 원본 행 대응

신규 `godot/scripts/native_ch1_boss_control_states.gd`의 `begin_tick(si, enemy, sp, player, context={})`는 snapshot 사본으로 continuation을 만든다. `next_tick(token, response=null, rng=Callable())`는 원문 순서의 write/global_write/RNG/미실행 command와 다음 continuation을 반환한다. 이 모듈은 `st2`를 감소시키지 않는다. `full_tick_complete=false`이며 원문의 case별 `break` 경계를 유지한다.

| 원본 game.html | packet 동작·수치 |
|---|---|
| 40837–40843 | GrabWind의 atan2를 `_grabAng`에 기록하고 `speed*1.5*sp`로 접근. collision owner에 XY→실패하면 X→실패하면 Y 요청. X 성공 뒤 Y를 별도로 실행하지 않음. 난수 `>.6`일 때만 추가 난수와 poolPart 요청 |
| 40844–40851 | 시간이 끝났을 때 **이동 후** 거리 `< e.r+P.r+200`, `P.iframes<=0`, `P.s!='charge'`이면 Grab60. 실패 recover40. 번역→텍스트→shake10*OPT.shake/100 순서. BC06 시작의 거리120과 이 포획 반경은 별개 |
| 40852–40859 | 매 switch 진입에 P.x/y=`e.x/y+cos/sin(_grabAng)*25`, KB.x/y=0 대입을 순서 있는 `apply_boss_player_control` 요청으로 분리. 실제 player는 수정하지 않음. `%10===0 && P.iframes<=0`이면 `ToInt32(atk*.4*elMul(...))`, opts `{dtype:'grab'}`의 피해 owner 요청→parts |
| 40860–40867 | `st2<=0`이면 tick 요청 이후에도 별도 throw 요청: `ToInt32(atk*1.8*elMul(...))`, opts 없음. 피해 owner의 최신 e/P readback 뒤 KB를 cos/sin*18로 **대입**, P.iframes=30 대입 요청→번역/텍스트→shake15/SFX/parts→recover70. throw에는 별도의 iframe/charge gate를 추가하지 않음 |
| 41047–41050 | Dive 방향 추적. 난수 `<.5`일 때만 각도/size 2draw를 더 소비. 선택 VFX→P 위치 목표 복사→Under45/underMax45→e.iframes=max(기존 또는0,50)→SFX |
| 41051–41058 | 일반 Under는 먼저 목표 += `(P-목표)*.06*sp`, 그 후 `1-st2/(_underMax 또는45)`로 origin→목표 보간. e.iframes=max(기존 또는0,5). 종료에는 목표로 정확히 대입→선택 dust→Erupt40/eruptMax40/eruptHit=false→4인자 addTxt→SFX→shake12. 원문에 없는 collision/safePt 보정0 |
| 41059–41067 | `!_eruptHit && st2<=_eruptMax-8`일 때 **거리 판정 전에** `_eruptHit=true`. R=`r+120`(r44이면164), raw=`ToInt32(atk*2.2)`(atk46이면101). ordinary 중심은 e.x/y. blastLight→선택 hit VFX→선택 roots VFX→strict 거리/iframe/charge gate |
| 41068–41069 | `resolve_boss_erupt_contact` 요청만. 보호된 isPWin/hurtP/boss_hurtE/doParry/poise 소유자를 대체하지 않음. 원문 경로·raw의 원소 적용 전 절삭·패링 배수4/stun60/poise20·실패 poison+4/webSlow>=90/KB추가14를 descriptor에 기록. 실제 분기·피해·상태 집행은 owner 의존 |
| 41070–41072 | hit latch가 이미 true이거나 거리 밖이어도 종료 시 recover30. 40/70/30의 recover 설정 뒤 같은 switch에서 공통20 clamp를 실행하지 않음. 후속 BC05 시계 영역과 분리 |

`context.druid_finale`는 외부 predicate의 명시 bool 읽기다. true는 NOT_READY이며 피날레 추적·타깃 고정·피날레 중심을 일반 드루이드로 대체하지 않는다. 잠행은 si0/3만 받으며 si1/2에 추가하지 않는다. optional VFX와 OPT.shake도 명시 reader다. 잡기 state를 외부에서 제공받을 뿐 AI moveset·선택 조건을 추가하지 않는다.

`canMv`는 bool 응답, 번역은 문자열 응답이 필요하다. player 제어 및 보호 피해/접촉은 `ack=true`와 **전체 `enemy_after`·`player_after`**가 모두 있어야 진행한다. 기존 nested key까지 누락된 readback, ack-only, 누락 reader/RNG, 지원하지 않는 형태는 NOT_READY다. 이 계약 검사와 fixture readback은 실제 owner 연결 성공의 증거가 아니다.

## 검증 결과

신규 `godot/tests/test_boss_ch1_bc10_control.gd`는 Node 경로를 필수 `--node-bin=` 인자로 받는다. Node가 최신 main 원문의 두 case 구간을 직접 발췌해 격리 VM에서 평가하며 Godot 제품값으로 기대값을 생성하지 않는다. 원문 player 대입·hurtP·분출 보호 body만 명시된 미실행 owner 경계로 감싼다. callback은 fixture이며 실제 Q/E·HP 집행을 하지 않는다. enemy write·전역 write·FX/owner 요청 순서·분기/난수 수·player readback 이후 상태를 대조한다.

하니스 payload는 Node `fs.writeFileSync(...,'utf8')`로 고유 userdir 임시 JSON 파일에 쓴 뒤 Godot FileAccess로 읽는다. OS.execute 출력은 모든 조각을 결합해 UTF-8 로그에 남기며 `output[0]` 사용0. bc02/03 포함 기존 회귀에도 `--source-game=`를 명시했다. 원래 정수 경로는 Node JSON 직렬화 전에 표시해 정수 exact 비교, 비정수는 1e-10 상대 허용오차를 쓴다. 주입 readback 자체를 검사 결과로 세지 않고 실제 반환 snapshot·event만 대조한다.

| 검증 | 검사 / 실패 | 기준·원로그 |
|---|---:|---|
| 신규 최종 BC10 | **165,774 / 0** | `bc10-03.*`, source1,083사례, 이벤트4,829, 난수415draw; exit0/ERROR0/skip0 |
| BC01 | 681 / 0 | 최신 main 동일 파일, `bc01-regression-01.*` |
| BC02 | 5,257 / 0 | 최신 main 동일 파일, source-game 인자 |
| BC03 | 31,976 / 0 | 최신 main 동일 파일, source-game 인자 |
| BC04 | 21,899 / 0 | 일반화 모듈 + 무수정 기존 테스트 |
| BC05 | 18,424 / 0 | 일반화 모듈 + 무수정 기존 테스트 |
| BC06 | 14,099 / 0 | 일반화 모듈 + 무수정 기존 테스트 |
| BC07 | 14,531 / 0 | 일반화 모듈 + 무수정 기존 테스트 |
| BC08 | 24,788 / 0 | 인수된 선행 버전 동일 byte |
| BC09 | 56,664 / 0 | 인수된 0113315e 버전 동일 byte |
| BC01~09 합계 | **188,319 / 0** | 중복 실행 합산0, 각각 파일 상수 userdir |
| cold import | exit0 / ERROR0 | `import-01.*`, 외부 contracts 프로젝트 |
| test_contracts | **5그룹 / 0** | map/charge/projectile/pause_capture/damage, `contracts-01.*` |

source 사례는 GrabWind159·Grab297·Dive51·Under266·Erupt310이다. strict 포획/분출 반경·charge/iframe 회피·XY/X/Y/전부막힘·난수 .6/.5 경계·st2=0 tick+throw·피해 callback이 e/P를 바꾼 readback·sp .5/1/2 연속 잡기/잠행·45→40·8f 경계·hit latch 중복 방지를 포함한다. player 제어 요청329·grab 피해 요청71·분출 접촉 요청10은 **요청 수**이며 실제 집행 성공 수가 아니다.

신규 userdir는 `EXODUSER-bc10-Isolated-20261020`. 기존 회귀는 각 파일 USERDIR 그대로, contracts에는 상수가 없어 `EXODUSER-bc10-Contracts-Isolated-20261020` 외부 project wrapper를 사용했다. 저장/씬/Main을 수정하지 않았다. 모든 Godot launch 직전 지정된 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 결과를 `.gate.jsonl`에 기록했고 count>=2이면 30초 대기 후 다시 확인했다. 종료/강제 kill0. 실제 실행 버전은 Godot4.7.2 `ed1daf0bf`. Mac 검증이며 Windows 실행은 미확인이다.

## 실패와 한계

| 실행·관측 | 처리 |
|---|---|
| bc10-01 | 테스트의 `Control` 상수가 내장 클래스와 충돌해 Parse Error. exit0이어도 ERROR와 RESULT 부재로 실패 판정. 초기 test/module 및 원로그 보존 |
| bc10-02 | 별칭 ControlPacket 수정 후 207,956/0. 검토 중 기대 readback을 자기 자신과 비교하던 중복 검사를 발견 |
| bc10-03 | readback은 오직 입력으로 취급하도록 중복 비교 제거. 제품 코드·원문 기대값·실제 출력 검사는 그대로 두고 165,774/0을 최종 수치로 사용. 무의미한 검사 수 합산0 |
| 회귀 준비 | 일반화 브랜치에 BC04 기존 테스트가 없는 git show 실패를 확인. 승인된 0113315e의 테스트를 동일 byte로 외부 프로젝트에 읽어 해결. 기존 테스트 수정0 |
| 선재 로비 결함 | “로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)” 원문 유지. 이번 관련 범위 밖으로 로비 전체 회귀 재실행·해결 주장0 |

## docs 불일치와 제품 연결 의존 — 수정하지 않은 위치

| 항목 | 현재 근거 | 필요한 접점·판정 |
|---|---|---|
| WORK_BOARD의 main 병합 표기 | 73~76행은 BC04~07 main 병합 표기이나 기준 main tree에는 해당 모듈이 없음. main에는 BC01~03만 존재 | 작업판/소스 불일치로 보고만. 원격 인수 브랜치를 회귀에만 읽음. main 통합 판단은 총괄 소유 |
| 잠행 무적 표현 | trace103/161/262행과 `DARK_DRUID_DEMO_FINALE_DESIGN.md:52`의 주의. G41050/41056의 필드는 e.iframes이고 실제 hurtE gate는 reviveIframes | 이번 수치 기록을 실제 피해 면역 성공으로 세지 않음. immunity_verified=false |
| 잡기 강제 위치/KB 대입 | G40854–40855,40863–40864. player.gd:958은 `apply_native_posthurt_knockback`의 **추가** API이고 963은 읽기. global_position·_knockback은 player 소유 | 위치 강제 + KB0/KB18 대입 + iframe30의 정식 writer 필요. 기존 덧셈 API로 대입을 흉내 내는 연결0. 필요한 신규 접속 줄 수·정확한 owner API는 미확인. player 수정0 |
| grab dtype 피해 | G40857·40862. player.gd:866/909의 기존 damage API는 존재 | `{dtype:'grab'}`와 실제 hurtP gate/armor/elMul·최종 KB/iframe의 순서 보증 필요. 새 데미지 수식/우회 API 구현0 |
| 분출 패링·상태 | G41068–41069. player.gd:137의 기존 QE bind, native_normal_enemy_hurte.gd:149–151의 `boss_hurtE` NOT_READY guard | boss_hurtE·parryBank/doParry/poise 및 poison/webSlow owner 확정 필요. 보호 QE·2_3 수정0. 분기 callback이 원문 body를 실제 집행한다는 검증은 미확인 |
| 실제 encounter | trace §5 BC17, main.gd:106 _ready 및 실제 native clock/actor dispatcher 접점 | 이번 module 설치·tick·player writer bind 모두0. 원문 tick 전체/HP/실창1x/AI 자연 진입은 미확인. 접속 줄 수는 소유 확정 전 미확인 |

## 보존·제출 자료

원로그는 `~/exoduser-wt/_out/bc10/`. `preflight.json`의 기존228파일 hash, `r-before.json`, `latest-main-check.json`, `regression-manifest.json`, `suite-summary.json`, `verification.json`으로 보존·입력·판정을 대조한다. import가 외부 프로젝트 symlink를 통해 생성한 타 경로 UID193개·import metadata35개는 새로 생성된 untracked 파일임을 확인해 `_out/bc10/import-generated-*`에 경로/hash와 함께 옮겼다. 기존 tracked 파일 삭제·수정0, 자기 UID2만 제출한다. Godot 전역 editor_settings도 시작 byte 그대로다.

docs 키워드 전체 검색127행은 `docs-matches.txt`에 보존했다. 추적/설계/LOCK 문서는 읽기만 하고 상태와 미완 접점은 이 보고서에 기록했다. CHANGELOG_SYNC는 기존 본문을 byte 그대로 뒤에 유지하고 맨 위에 정상 형식의 BC10 절을 추가했다. 정상 pre-commit 훅으로 자기6경로만 commit하고 자기 branch만 비강제 push한다. 원격 SHA 일치와 DONE.txt 기록 후 자기 worktree만 제거하며 브랜치·원로그는 남긴다. 최종 SHA·수치·정리 결과는 DONE.txt에 기록한다.
