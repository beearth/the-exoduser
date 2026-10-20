# BC2-02 — 장 catalog 일반화와 2장 공통 계산 재사용

## 판정·승인·기준

**BC2-02 계산 접점 구현 및 원본 대조 자료 준비.** 이전 `d7116024`의 HOLD 이후 맥북총괄이 “BC02~BC07은 Mac Codex가 만든 Mac 소유 모듈(main 병합분 포함)이므로 맥북총괄이 수정을 허용”한다고 승인했다. 승인 조건인 장 catalog 인자화, 기본 CH1 동작 보존, 기존 BC01~BC08 테스트 무수정·동일 검사 수·0실패를 이번 실행에서 검증했다. 공용 6파일·PC/클라우드 담당 파일에는 작업 수정을 하지 않았다.

| 항목 | 근거 |
|---|---|
| 작업·브랜치 | `bc2-02` / `codex/bc2-02-20261020` |
| 기준 동기화 | fetch한 최신 main `26c050a99a711e793a6c2413395acda09b0c1614`. 기존 HOLD 끝에서 같은 브랜치를 재개하고 정상 merge `bb7d7ec3faee277c341cdd5936772e88cae7f84f`로 main을 포함. 기존 원격 이력 재작성 없음 |
| 선행 | BC2-01은 main 미포함으로 인수 끝 `6e6f2f58633bb7a54fa0cf1a9cd3df3dc1535aba`를 유지. CH2 catalog는 수정하지 않고 공개 API만 호출 |
| worktree | `worktree add --no-checkout` + non-cone sparse-checkout. 웹 대용량 에셋은 받지 않음. 외부 최소 Godot 프로젝트로 원본/수정 모듈과 무수정 회귀 파일을 검증 |
| 원본 | 최신 main game.html 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; index.html 4,742행, SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`. 둘 다 수정0 |
| 보호 | 공용 6파일·다른 담당·기존 테스트·원본·저장·형식·씬·프로젝트 설정·바이너리 변경0. latest main의 다른 담당 변경은 기준 merge로만 수용, 이 작업 코드 diff와 구별 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`의 HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`, tracked index/work 보존 |

## 구현 계약·변경 위치

| 파일 (`godot/scripts/`) | 변경·호출 계약 |
|---|---|
| native_boss_catalog_context.gd | 새 읽기 provider 검증. null은 원래 CH1 catalog를 즉시 선택하고 token도 원래 모양 유지. 명시 provider는 source hash·전역59기술/combos·manifest 및 공개 메서드를 확인. continuation은 script 참조·경로·source hash를 묶어 누락/변조를 NOT_READY로 반환 |
| native_ch1_boss_spawn_contract.gd (BC02) | 마지막 선택 인자 `chapter_catalog=null` 추가. 실제 si/hell/Set을 읽으며 RNG·배치·초기화 순서 유지. 원본 G31170의 `min(hell+1,4)`로 dropTier 계산: CH1=1 유지, CH2=2. 전역 CD59칸 유지 |
| native_ch1_boss_utility.gd (BC03) | 마지막 선택 인자 추가. 장의 stage/Set 검증만 공급받고 원래 score·gate·난수 계산 재사용. stage 위장 없음 |
| native_ch1_boss_selector.gd (BC04) | 마지막 선택 인자 추가. 59 score·combo·선택·Utility 내부 호출까지 같은 provider 전달. cooldown/RNG/이력/command 순서 보존 |
| native_ch1_boss_phase.gd (BC05) | phase_transition/clock_step/begin_phase_effects 마지막 선택 인자, phase_effect_step은 token 문맥 사용. clock의 dispatch_phase 내부 phase_transition에도 전달. 원래 helper ack/readback·full_tick_complete=false 유지 |
| native_ch1_boss_pattern_start.gd (BC06) | begin_start 마지막 선택 인자, next_start는 token 문맥. CH2 공통22기술만 기존24개 시작 구현에서 재사용. 신규10은 `pattern_start_owner_required`로 닫힘. 임의 프로그램으로 소유 경계 우회 없음 |
| native_ch1_boss_melee_states.gd (BC07) | begin_tick 마지막 선택 인자, next_tick은 같은 token의 stage 검증. CH2 공통 slashCombo/slam/sweep 3계열·6state의 기존 수식/command 계산을 실제 si4~9로 재사용 |
| native_ch2_boss_catalog_bridge.gd | BC01의 전역59 manifest + BC2-01의 장별 공개 읽기 API를 결합. move/phase/combo 표나 공통 수식 복제0 |
| native_ch2_boss_reuse.gd | 2장 전용 진입점. 위 모듈에 bridge를 명시 전달하며 continuation도 CH2 provider/si4~9인지 확인. 전역 catalog 설정·live singleton 없음 |

명시 catalog를 생략하는 기존 호출의 인자 순서·실패 규약·결과 키·token 형태는 유지한다. 원래 CH1 source_receipt도 유지한다. BC04~07 제품과 UID는 승인된 원격 버전을 가져와 일반화했다. BC08 제품과 기존 BC04~08 테스트는 외부 검증 프로젝트에서만 읽고 이번 제품 변경으로 가져오지 않았다.

## 의존 버전과 무수정 회귀

BC01~03은 위 최신 main과 동일 원본이다. 나머지 원격 제품/테스트 기준은 BC04 `818e9b2027afa37fadbf13a6b79b885abdb95f6b`, BC05 `e1850171849de176ad7d5df61e2cd296705ad7b7`, BC06 `1110eec6c2deacd43c6c20dd52affff33d4e4d47`, BC07 `edcbc480491a2b9c55abbb99fcda3dc47073583c`, BC08 `1b901f124bc4d1f2eaf55cb615a216abce69c634`다. 파일별 SHA256은 `approved/dependencies.json`, 최종 byte 대조는 `approved/scope-verification.json`에 기록한다.

| 무수정 기존 테스트 | 일반화 전 검사 / 실패 | 최종 일반화 후 검사 / 실패 | 테스트 파일 |
|---|---:|---:|---|
| BC01 | 681 / 0 | 681 / 0 | 동일 byte |
| BC02 | 5,257 / 0 | 5,257 / 0 | 동일 byte |
| BC03 | 31,976 / 0 | 31,976 / 0 | 동일 byte |
| BC04 | 21,899 / 0 | 21,899 / 0 | 동일 byte |
| BC05 | 18,424 / 0 | 18,424 / 0 | 동일 byte |
| BC06 | 14,099 / 0 | 14,099 / 0 | 동일 byte |
| BC07 | 14,531 / 0 | 14,531 / 0 | 동일 byte |
| BC08 | 24,788 / 0 | 24,788 / 0 | 동일 byte |
| **BC01~BC08 합계** | **131,655 / 0** | **131,655 / 0** | 검사 수·파일 동일 |
| BC2-01 추가 회귀 | 7,169 / 0 | 7,169 / 0 | 동일 byte |
| **신규 BC2-02** | 해당 없음 | **44,891 / 0** | 지정 격리 테스트 |

`before-bc01`~`before-bc08`은 일반화 전, `verified-bc01`~`verified-bc08`은 마지막 제품 수정 후 결과다. 중간 `after-*`, `final-*`도 각각 같은 기존 검사 수/0실패지만 합계에 중복 산입하지 않는다. 기존 검사 축소·skip·기대값 변경0. 모든 위 최종 실행은 exit0, ERROR0, stderr 빈 값이다. 이번 작업에서 전체 contracts/로비/실전·시각·성능·PC 검증은 수행하지 않았다.

## 2장 독립 원본 fixture 대조

새 `godot/tests/test_boss_ch2_bc2_02_reuse.gd`와 `bc2_02_source_oracle.cjs`가 원본 game.html을 Node VM으로 직접 평가한다. 기존 BC02~07 원본 하니스의 발췌/driver를 재사용하고 CH2 실제 si4~9 입력을 추가했다. 기대 결과는 Godot 제품 모듈에서 만들지 않는다. 원본 전체 hash 불일치·필수 인자 누락은 실패이며 PASS/skip으로 처리하지 않는다.

| 원본 대조 영역 | 최종 fixture 수 | 검증 내용·한계 |
|---|---:|---|
| BC02 생성 수치 | 36 | 6stage×6level, 81필드·정수HP/ATK/부활점·6난수·배치 reader 순서. G31119–31363, 성장/난도 helper 참조 |
| BC03 score | 1,770 | 6stage×59기술×5phase, 원본 gate/score/RNG 수. G37650–37699, 최종 Set 전체 참조 |
| BC04 selector | 168 | 각 stage gate와 각5phase의 양수 선택 사례, enemy/player_stats/start 요청/난수 ledger·입력 불변. G38373–38442. 전체 입력 공간 전수 주장은 아님 |
| BC05 phase·clock | 143 | phase 수치, threshold·각 checkpoint의 처음/중간/마지막 사례, dispatch_phase 재진입 포함. G38235–38313 및 원래10개 clock 발췌 |
| BC06 시작 | 792 | 공통22기술의 enemy/queue/전체 event 순서·RNG·nested readback. G37701–38233. 신규10 start 제외 |
| BC07 근접 | 816 | 공통6state의 enemy/player/globals/전체 event 순서·RNG·주입된 contact readback. G41074–41183. 실제 피해·패링 성공 판정 아님 |
| **합계** | **3,725** | 순수 계산·fixture 대조 |

추가 경계 검사: null/명시CH1 provider, 잘못된 source receipt·누락형태·무난수 거절, 미지원 stage, 신규10기술 NOT_READY, token provider/hash/path 누락·변조, 합성 owner ack/readback 금지. 실제 시각/전투 성공을 증명하는 검사는 아니다.

실행 명령은 `run_one.py` 원로그에 argv 전체로 남겼다. 신규 실행은 `-- --source-game=/Users/fordeargamers/exoduser-wt/bc2-02/game.html --node-bin=/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`. 기존 BC02/03에도 source-game 절대경로 인자를 전달했다. Node 경로는 제품 코드에 고정하지 않고 필수 인자로 받는다. `OS.execute` 출력은 `"".join(output)`으로 읽고 fixture는 자기 userdir에 UTF-8로 쓴다. Godot JSON 숫자 변환 때문에 RNG의 원래 IEEE754 bit를 hex로 함께 운반하며 정수 프로토콜 필드만 명시적으로 int 복원했다. 허용오차를 늘리거나 기대값을 제품값으로 바꾸지 않았다.

## 실패 이력·수정 근거

| 실행 | 실제 관측 | 후속 조치 |
|---|---|---|
| reuse-01 | 41,472검사 / 1,674실패, exit1. phase effect 경계 driver의 RNG 누락으로 SCRIPT ERROR도 발생 | JSON 전송에서 최댓값 직전 난수가 1로 반올림되고 phase 배열이 float가 된 하니스 문제 수정. 원래 binary bit 복원/정수 필드 명시, effect RNG 주입. 원본 기대값 유지 |
| reuse-02 | 44,515 / 36실패, exit1 | 모두 CH2 dropTier의 실제 제품 결함. 기존1 고정을 원본 G31170의 hell+1 cap4로 수정. CH1은 원래1 유지 |
| reuse-03 | 44,515 / 0, exit0 | 위 수정 후 원본 대조. 마지막 clock 확장 전의 중간 결과 |
| 추가 정적 발견 | clock dispatch_phase의 내부 호출이 provider를 누락 | 같은 chapter_catalog 전달로 수정하고, 원본 clock 사례를 fixture에 추가한 뒤 최종 회귀 전체 재실행 |
| reuse-04 | 44,891 / 0, exit0 | 최종 확대 대조. fixture 3,725개, skip0·ERROR0·stderr 빈 값 |

초기 실패의 stdout/stderr/engine/gate/JSON 및 수정 전 파일 snapshot을 모두 보존했다. 초기 오류를 PASS로 합산하지 않았다.

## 다음 단위·실제 연결 HOLD

BC2-03 신규10기술 시작과 후속 신규 state/queue 단위, 실제 전투/Main/State/World 연결은 구현하지 않았다. 새 재사용 진입점은 enemy/player/queue snapshot·command·continuation을 반환하는 계산 경계다. 실제 `Main` enemy 생성/AI dispatch, State 상태 적용, 효과 executor의 ack/readback, 투사체/범위 큐, 피해/패링/부활 owner 연결은 별도 통합 결정이 필요하며 **HOLD**다. 공용 6파일을 바꾸어 연결하지 않았다.

CH2 catalog는 기존 물리 일반보스(si4~9) 범위만 인수했다. 다른 장·다른 속성·특수 보스 provider 지원과 실제 통합 성능은 **미확인**이다.

## 격리·산출물

매 Godot 호출 전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 실행하고 2이상이면30초씩 대기했다. 이 작업의 Godot 호출은 직렬이다. 신규 userdir는 `EXODUSER-bc2-02-Isolated-20261020`, 기존 회귀는 각 테스트의 상수 이름이다. 실행마다 override.cfg를 설정하고 finally에서0byte로 비웠다. 실제 저장 폴더를 테스트 대상으로 사용하지 않았다.

변경 제품은 승인 BC02~07의6모듈+읽기 context/bridge/CH2 entry3개, 기존 UID4개·신규 UID4개, 신규 테스트/원본 하니스, 이 보고서, CHANGELOG_SYNC 맨위절이다. 기존 BC01/BC08/BC2-01 및 기존 테스트 변경0. 바이너리는 커밋하지 않는다.

원로그는 `~/exoduser-wt/_out/bc2-02/approved/`(전후 프로젝트·실행·scope·정상 hook·push·remote 검증)에, 이전 HOLD 로그는 같은 작업 root에 보존한다. 자기 브랜치만 정상 push하고 원격 SHA 일치 확인 후 root `DONE.txt`에 브랜치·SHA·최종 수치를 쓰고 자기 worktree를 제거한다. 최종 SHA는 순환 참조를 피하기 위해 커밋 내부 보고서 대신 외부 DONE/remote 검증에 기록한다.
