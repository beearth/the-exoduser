# snd-01 — 순수 사운드 분류·플랫폼 한도 정책

## 범위와 기준

**구현·순수 검증 완료 / 기존 회귀 인수 BLOCKED.** SND-01의 독립 계산 모듈을 구현했다. 기존 재생기·전투음·게임 owner에는 연결하지 않았다. **실청취·실게임 사운드 인수는 미확인**이다. 회귀 실행 결과는 아래 원로그와 함께 별도로 기록한다.

| 항목 | 실제 기준 |
|---|---|
| 작업·브랜치 | `snd-01` / `codex/snd-01-20261020` |
| 실행 source | `/Users/fordeargamers/exoduser-wt/snd-01/godot` |
| 시작 fetch | 성공. 고정 `origin/main=9528ea35b429498fcf42fe3723008219ed0ed7e1`, 요청 최소 `19a713578`의 descendant 확인 후 새 worktree/branch 생성 |
| 지시서 | 직전 제출 [사운드 추적 §4.1](https://github.com/beearth/the-exoduser/blob/16a1984036031969b53f0b97a9fe78cb530836b2/docs/engine/FDG_SOURCE_TRACE_SOUND_20261020.md#41-1번-snd-01--순수-sfx-분류한도-정책-다음-차례-바로-구현). 기준 main에는 아직 해당 문서가 없어 원 제출본을 읽었다. 문서 자체를 복사·병합하지 않음 |
| 원본 근거 | 고정 main `game.html:12220–12245`, `12342–12356`. SHA-256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 환경 | 로컬 Godot `4.7.2.stable.official.ed1daf0bf`, `/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot`; Node v24.15.0. Godot 실행은 자기 작업 안에서 한 프로세스씩 순차 수행 |
| 사전 소유 확인 | WORK_BOARD의 QS-01·SETTINGS-S01·SV-CONTRACT·TRACE-SKILLS 등과 독립. 신규 policy/test 두 경로 부재 확인 후 생성. 공용 보드 행은 별도 수정하지 않고 이 보고서로 전달 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`: `codex/mac-live-play-time-main-20261017`, `dd49171c5b88e211575a41f185395d6c0a14b184`. 시작 tracked INDEX/WORK 각각 변경 없음. R에서 branch 전환·코드 편집·commit 없음 |

## 변경 파일과 구현 계약

| 파일 | 실제 변경 |
|---|---|
| `godot/port_modules/sound_source/policy.gd` | 신규. `extends RefCounted`, 전역 class_name 없음. 6개 static API와 원본 PRI8개·스킬 literal29개 |
| `godot/tests/test_sound_source_policy.gd` | 신규. 원본 JS oracle에서 얻은 등록키233개와 별도 수동 기대 경계60개, 복사 격리·형식·Main 미부팅 검사 |
| `docs/CHANGELOG_SYNC.md` | 기존 내용 앞에 같은 제목·표 형식의 SND-01 절 추가. 기존 나머지 byte 보존. pre-commit 훅 우회 없음 |
| 이 보고서 | 원본 행·수치·API·격리·검증 결과·미확인 범위 기록 |

`main.gd`, `hud.gd`, `world.gd`, `player.gd`, `native_normal_enemy_hurte.gd`, `native_source_new_run_state.gd` 및 기존 오디오 owner·기존 테스트는 **0줄**이다. 정책 모듈은 clock/RNG/Node/tree/IO/재생기·큐·autoload를 만들지 않는다. 새 에셋 생성·원본 변환·복사도 없다. 경로·볼륨 공식은 SND-01에 옮길 대상이 아니므로 그대로 보존했다. Godot import는 자기 WT의 엔진 캐시 준비이며 원본 에셋 변환 산출물을 제출하지 않는다.

| API / 데이터 | 원본 행 | 현재 native 계약 |
|---|---|---|
| `PRI` | 12225 | SKILL10 / VOICE9 / PLAYER_HIT8 / DEATH4 / STEP3 / HIT2 / PROJ1 / AMB0 |
| `is_footstep(key: String)` | 12230 | exact footstep 또는 footstep2 |
| `is_skill(key: String)` | 12355–12356 | 원본29개 집합 또는 chain_ / electric_storm / fire_magic / sword_swing prefix |
| `priority(key: String)` | 12231–12245 | 원본 if 순서 그대로. 보이스·boss·skill·death·hit·proj·ambient를 임의 통합하지 않음 |
| `category(key: String)` | 12342–12354 | 원본 if 순서 및 원문 key fallback 보존. death_ghoul은 앞 death_ 분기에서 g_death 반환 |
| `limits(is_mobile: bool)` | 12220–12229 | 아래 6필드의 새 독립 Dictionary. 모듈 API 키이며 저장 필드가 아님 |
| `skill_keys()->Array` | 12355 | 원본29개·순서를 유지한 독립 Array. 반환값 수정이 다음 호출에 영향을 주지 않음 |

| 한도 필드 | desktop | mobile |
|---|---:|---:|
| active_nodes | 48 | 16 |
| category_per_frame | 2 | 1 |
| samples_per_frame | 6 | 3 |
| proj_nodes | 5 | 2 |
| hit_nodes | 3 | 2 |
| step_nodes | 2 | 2 |

입력은 명시적 String/bool API다. `str()` 자동 보정·대소문자 변환·새 기본값을 넣지 않았다. JS 비문자 입력의 예외까지 Godot와 동등하다는 주장은 하지 않는다. `q_parry`/`sword_parry`는 오직 샘플 키 문자열이며 **Q/E·blackBean Q-only·docs/2_3·세이브 형식은 보호 범위로 변경하지 않았다.**

### 원본 분기에서 보존한 경계

| key | priority | category | is_skill | is_footstep |
|---|---:|---|---|---|
| footstep / footstep2 | 3 | 각 원문 key | false | true |
| m_melee / monster_crawl1 | 1 | 각 원문 key | false | false |
| player_dead1 | 9 | player_dead1 | false | false |
| silvertail_dead1 | 9 | g_voice | false | false |
| death_ghoul1 | 4 | g_death | false | false |
| monster_die2 | 2 | g_death | false | false |
| boss_hit | 10 | g_bossHit | false | false |
| monster_hurt | 2 | g_bossHit | false | false |
| chain_dash9 | 10 | g_chainDash | true | false |
| sword_swing7 | 10 | g_swing | true | false |
| bow_shot | 10 | bow_shot | true | false |

## 격리·원로그·재현

원로그 루트: `/Users/fordeargamers/exoduser-wt/_out/snd-01/`.

새 테스트의 최신 사용자 지정 격리 이름은 **`EXODUSER-snd-01-Isolated-20261020`**이다. 기존 추적의 옛 이름을 쓰지 않았다. Main을 부팅하지 않는 SceneTree script이므로 `override.cfg`를 만들지 않고 `_initialize`에서 프로세스 내 ProjectSettings만 설정한다. 실제 `OS.get_user_data_dir()`가 해당 이름으로 끝나는지 검사했다. 엔진 로그는 `--log-file`로 Git 밖 원로그 폴더에 지정하여 기본 게임 로그를 쓰지 않는다. 저장/API 호출 없음.

Main을 부팅하는 기존 회귀는 각 파일의 USERDIR 상수와 정확히 같은 이름을 자기 WT `godot/override.cfg`에 설정하고, 각 프로세스 종료 `finally`에서 0바이트로 비운다. 비어 있지 않은 기존 override 발견 시 실행을 중단하도록 실행기에 넣었다. `test_contracts`에는 격리 상수가 없고 Main/사용자 IO가 없으며, 원본 주석대로 save_report를 호출하지 않는다. 그 테스트는 override 없이 외부 엔진 로그만 사용했다. 새 테스트의 격리 완료를 기존 테스트에 소급하지 않는다.

```sh
python3 ~/exoduser-wt/_out/snd-01/run_godot.py test_p2001c_kill_rewards EXODUSER-P2001C-Isolated-20261020
```

순수 테스트는 다음 형태로 실행했다.

```sh
/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot --headless --path /Users/fordeargamers/exoduser-wt/snd-01/godot --log-file /Users/fordeargamers/exoduser-wt/_out/snd-01/policy-02.engine.log --script res://tests/test_sound_source_policy.gd
```

각 실행의 `.out/.err/.engine.log/.meta.json`에 stdout/stderr·argv·cwd·exit·시간을 보존한다. 기존 Godot 회귀 meta에는 격리 이름·override 사용 여부·PID·로그 SHA도 있다. `source-oracle.mjs/.json`, `oracle-comparison.json`, `protected-baseline.json`, `scope.json`, `run_godot.py`는 로컬 근거이며 Git 제출 파일이 아니다.

## 검증 결과

| 검증 | 결과 |
|---|---|
| 첫 `policy-01` | **INVALID**. 테스트의 `POLICY.get_script_method_list()`가 정적 클래스 호출로 해석되어 parse 오류. Godot exit0이었지만 RESULT 없음·stderr ERROR가 있어 통과로 세지 않음. 원로그 보존 |
| 수정 `policy-02` | 테스트의 Script 메서드 접근만 명시적 Script 변수로 정정. **1,194단정 / 0실패 / exit0 / stderr ERROR0**, isolated=true, Main_booted=false |
| 독립 source oracle | 최신 고정 game.html의 실제 4개 분류 함수·상수를 Node VM에서 실행. 233개 key×4개 값 **932/932 일치**. GDScript 구현을 기대값 생성기로 사용하지 않음 |
| 별도 경계·반환 격리 | 60개 수동 기대 사례, 29개 key 순서, PRI exact, String 시그니처, 2플랫폼 exact 필드집합, Dictionary/Array mutation 격리 포함. 위 1,194에 포함하며 별도 합산하지 않음 |
| 웹 사운드 기존 회귀 | audioBootLoading / audioContextResumeGate / footstepAudioPriority / kiSlashSwingSound / silvertailFemaleVoice **5파일·10tests / 10pass / 0fail / exit0**, stderr 없음 |
| WT import | 자기 WT headless import 1회 **exit0 / stderr 비어 있음**. 기존 source 1,272파일 byte 불변. 사전 백업한 전역 editor_settings-4.7.tres는 import 후 exact hash 동일 |

| 기존 Godot 회귀 | 단정 / 실패 또는 그룹 | exit | stderr ERROR / WARNING | USERDIR / override |
|---|---|---:|---|---|
| `test_contracts` | 5그룹 / 0실패 | 0 | 0 / 0 | 상수 없음 / 사용 안 함 |
| `test_p1002e_melee_hurte` | 80 / 0 | 0 | 0 / 1 | `EXODUSER-P1002E-Isolated-20261019` / 사용 |
| `test_p1002f_dedicated_hurte` | 225 / 0 | 0 | 0 / 1 | `EXODUSER-P1002F-Isolated-20261020` / 사용 |
| `test_p1002g_kislash_hurte` | 220 / 1 | 1 | 0 / 1 | `EXODUSER-P1002G-Isolated-20261020` / 사용 |
| `test_p2001c_kill_rewards` | 42 / 0 | 0 | 0 / 1 | `EXODUSER-P2001C-Isolated-20261020` / 사용 |
| `test_p2005b_giant_slam` | 12 / 0 | 0 | 1 / 2 | `EXODUSER-P2005B-Isolated-20261020` / 사용 |
| `test_p2005c_spike_holy` | 20 / 0 | 0 | 0 / 1 | `EXODUSER-P2005C-Isolated-20261020` / 사용 |
| `test_p2005d_ice_orb` | 20 / 0 | 0 | 0 / 1 | `EXODUSER-P2005D-Isolated-20261020` / 사용 |

**회귀 인수: BLOCKED.** 단정 기준 7종은 실패0, 검기 1종은 실패1이다. `test_p1002g_kislash_hurte`의 setup20/0·combat167/0·coverage33/1, 합계220/1이며 최종 `halts.size()==0` 기대가 실제6으로 실패했다. 현재 원로그는 halt 상세 reason을 출력하지 않으므로 원인은 **미확인**이다. 기존 테스트·전투 코드를 바꾸거나 단정을 완화·skip하지 않았다. 통과할 때까지 반복하지 않았으며 별도 기준 실행의 인과 재현도 하지 않았다. 신규 policy의 기존 제품 참조가 없다는 정적 결과와 원인 판정은 구분한다.

`test_p2005b_giant_slam`은 12/0·exit0이나 종료 시 `2 ObjectDB instances were leaked` 및 `1 resources still in use at exit`가 있어 **clean PASS가 아니다**. 나머지 기존 Main 회귀의 Camera2D physics-interpolation WARNING 1줄씩도 원로그에 보존했다. 모든 기존 회귀의 skipped 배열은 비어 있다. Godot 7개 테스트의 assertion 합계619/실패1과 contracts5그룹을 서로 다른 분모로 기록하며 새 테스트1,194와 합쳐 단일 전체 PASS로 만들지 않는다.


## docs 동기화·제출 범위·남은 작업

코드 변경 후 `docs/` 전체에서 `sfxPri|sfxCat|SKILL_SFX_KEYS|MAX_ACTIVE_NODES|sound_source|SFX_PRI`를 검색했다. 22 matching lines는 `docs-search.txt`에 보존했다. 기존 설계의 m_*→AMB, monster_die* 일반화, player_dead* category/100% 발성 설명 등은 앞선 추적에서 보고한 원본 불일치다. 이번에는 원본 동작과 수치를 바꾸지 않고 위 표와 CHANGELOG 최상단에 **현재 native 부분 구현 범위**를 기록했다. 타 설계 문서의 과거 이력을 임의 교정하지 않았다.

루트 `.gitignore:5`의 `test_*`가 신규 테스트를 제외하므로, 이 **명시적으로 승인된 새 테스트 1경로만** `git add -f -- godot/tests/test_sound_source_policy.gd`로 등록한다. ignore 규칙·훅을 바꾸거나 `git add -A`를 쓰지 않는다. Godot가 만든 `.gd.uid`·`.godot/`·비운 override는 제출 대상이 아니다. `docs/CHANGELOG_SYNC.md`를 함께 stage하고 실제 pre-commit 훅을 통과한 뒤 자기 브랜치만 비강제 push한다.

후속은 아직 SND-02 이후다. 재생기 연결, 음량/믹스, 큐/노드 수명, BGM·보이스 정책·샘플 파일 이식, 실청취·실게임·PC 인수는 이 작업의 완료 범위가 아니다. 새 정책이 기존 전투음의 실제 동작을 바꿨다고 보고하지 않는다.
