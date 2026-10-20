# SND-09 — 실제 BGM 연결 경계 보고

## 판정

**BLOCKED / 구현 미착수.** 순서안은 끝나지 않았으나 SND-09 자체가 Main configure·postStage 및 실제 stage/boss/forge owner 연결을 요구한다. 사용자 지시 “native DSP·Main 연결이 필요하면 보고하고 멈춤”, “Main·State·공용 연결을 요구하면 구현하지 말고 필요한 줄·위치·근거만 보고”에 따라 여기서 중단한다. SND-08은 원문 모델 검증본이며 native DSP adapter는 계속 HOLD다. 새 BGM 모델이나 fixture를 만들어 실제 연결 완료로 대신하지 않았다. 이 제출은 중단 근거 보고 완료이며 SND-09 구현 완료가 아니다.

## 기준·의존

- fetch 후 확인한 `origin/main`: **ad497089c7955d3e344e1488e5286e9b0ddd9092**.
- main에 미포함인 SND-08: **fad57669af865505ebb60975e5cc2fbda8910677**, `codex/snd-08-20261020`. 사용자 기준 분기 규칙에 따라 이 끝에서 `codex/snd-09-20261020`를 만들었다. 최신 main과 선행 브랜치는 서로 ancestor가 아니며 main merge는 수행하지 않았다. 아래 현재 위치·원본 근거는 분기 기준이 아닌 **위 최신 main**의 blob을 직접 읽어 기록했다.
- `worktree add --no-checkout` 후 sparse-checkout으로 보고서·CHANGELOG·기존 추적 문서/보고서·정상 훅에 필요한 경로만 받았다. Godot 프로젝트·대용량 원본 에셋 checkout 없음.
- 최신 main `game.html` SHA256: **4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4**. SND-08 분기와 byte 동일. trace·postStage producer·options 두 파일도 byte 동일이다. Main은 MAP-LOOK 설치 2줄이 추가되어 기존 SND-08 보고서의 후반 위치가 +2행 이동했다. `source-comparison.json`과 `relevant-main-diff.patch`에 보존했다.
- R=`/Users/fordeargamers/Projects/exoduser-migration-20261001`의 HEAD/branch/tracked INDEX/WORK는 시작·종료 대조한다. R checkout·index 변경 없음. fetch의 원격 추적 ref 갱신과 자기 worktree 관리만 수행한다.

## 중단 근거와 필요한 접점

최신 main `docs/engine/FDG_SOURCE_TRACE_SOUND_20261020.md:197`은 SND-09를 “음악 실제재생”으로 정하고 `native_bgm.gd`·06 backend adapter·**Main configure**를 함께 요구한다. 선행은 05/06/08과 실제 stage/boss/forge owner이며 **main/postStage 공용조정 전 연결 HOLD**, 미이식 owner를 fixture 완료로 대체 금지다. 같은 문서 207–215행은 공용 최소 접점과 기존 실제 options/State의 소유권을 제한한다. 아래는 승인·소유자/API 확정에 필요한 후보이며 실제 패치나 확정 추가 행 수가 아니다.

| 최신 main 파일·위치 | 필요한 위치·줄 후보 | 원본/현재 코드 근거 |
|---|---|---|
| `godot/scripts/main.gd:1953–1975` owner 필드 구역 | BGM owner 보관 1줄 후보 | 현재 attack stream/queue/active/bus 상태다. 별도 음악 수명 owner가 필요하며 기존 attack owner를 덮어쓰지 않는다 |
| `godot/scripts/main.gd:278–280`, 설치 구현 `1977` 부근 | BGM configure 약 4–8줄 후보; preload/API/실제 reader 구체화 후 재산정 | 원본 `game.html:3980–4212` 재생 수명·현재 옵션/scene 준비 상태가 필요. 항상 READY나 복제 State를 주입하여 연결 완료로 삼을 수 없다 |
| `godot/scripts/main.gd:474–481` postStage configure | 실제 `bgm_stage_key` / `bgm_play` callback 2항목 후보. 실제 wrapper 필요 줄 수는 API 확정 전 미정 | 현재 configure에는 두 항목 모두 없다. `godot/port_modules/source_post_stage_owner/producer.gd:62–63`의 필수 callback, `226–236` gate→key→play 소비 순서가 근거. 기존 `boss_request`/`force_cutscene` 등 미연결 항목을 dummy로 채우지 않는다 |
| `godot/scripts/main.gd:492–493` exit | BGM owner dispose 약 1줄 후보 | 현재 attack dispose만 호출. 원본 `game.html:4174–4206` stop·fade의 timer/Audio identity 정리 보존 필요 |
| 실제 stage/boss/forge/death owner: Main/World 등 담당 확정 필요 | 자연 요청별 약 1–2줄 후보; native 정확 위치·총행 수 미확정 | 아래 원본 호출표 기준. trace 208행도 Main/World 중 이벤트 소유자가 미확인이라고 명시한다. 타인 파일을 수정하거나 미확정 위치를 확정된 연결점으로 보고하지 않는다 |
| `godot/scripts/native_source_player_initialization_services.gd:489–492`, `godot/port_modules/npc_interaction/source_options_state.gd:3,8–16` | 기존 실제 options Dictionary 읽기 재사용 후보. 이 파일·State 필드 추가 0줄 | `bgmVol:60`, `bgmTrack:"auto"`가 이미 있다. 별도 저장/복원·새 OPT/P/G·전역 audio State 신설 금지. 기존 Main의 `read_native_attack_audio_settings:2012`는 SFX용이며 BGM 완료 경로가 아니다 |

trace의 예전 Main 행 번호는 수정하지 않았고, 이 표만 최신 main으로 재확인했다. 사용자가 요구한 공용·다른 담당 파일 변경 0줄을 유지하므로 위 접점은 구현하지 않았다.

| 최신 main `game.html` 위치 | 보존해야 할 실제 자연 호출 |
|---|---|
| 31669 | stage 진입 `BGM.play(BGM.stageKey(si))` |
| 35877–35881 | druid finale/hell boss에 따른 boss/finalboss 선곡, death 유지, 보스 종료 후 stage 복귀·revive guard |
| 43872 | 사망 fadeOut(500), 600ms 뒤 death |
| 43896 | 다음 stage 초기화 후 stageKey 재생 |
| 43899 | 승리 fadeOut(800), 1000ms 뒤 victory |
| 50515–50517 / 44079 | forge 열기 play('forge'), 패널 종료 시 기존 forgeOpen에 따른 stage 복귀 |
| 4186–4207 | fade 50ms tick·handle/Audio identity, 볼륨 반영 |

주 경로는 HTMLAudio BGM(`3980–4212`)이며 legacy `bgmPlay`의 2초 전환을 자연 BGM 경로로 승격하지 않는다. 순서안의 곡 bytecopy 제안보다 사용자의 원본 에셋 바이트 참조 한정을 우선한다. 이번 음원 복사·생성·변환·decode·재생은 모두 0이다.

SND-08의 원문 EQ Q=.8(`game.html:12418–12421`), compressor threshold=-6/knee=30/ratio=2/attack=.015/release=.35(`12448–12449`)의 native 동등 출력은 아직 미검증이다. SND-08 보고서 및 `_out/snd-08/native-dsp-probe.out`의 Godot property inspection에서는 filter Q·compressor knee 직접 property가 없었다. 이를 생략하거나 검증 없이 resonance로 치환하지 않는다. 이는 검증된 adapter가 없다는 선행 상태이며 별도 DSP 구현이 불가능하다는 뜻이 아니다. **HTMLAudio BGM 자체를 위 SFX EQ 체인으로 통과시켜야 한다는 주장은 하지 않는다.** SND-09의 독립적인 중단 이유는 이미 필수 Main/postStage 공용 접점이다.

## 확인 결과·미검증

- 최신 main의 제안 경로 `godot/scripts/native_bgm.gd`, `godot/tests/test_sound_source_bgm_runtime.gd`, `godot/assets/bgm/source/`에 tracked 파일 0개. `proposed-runtime-paths.txt`에 명령 결과를 남겼다.
- 최신 main tracked docs 전체에서 SND-09/native_bgm/bgm_stage_key/native DSP/native_sound_mix 관련 검색 6행을 `docs-keyword-search.txt`에 보존했다. 과거 postStage 문서의 원본 64475행을 현재 원문 행으로 오인하지 않는다.
- **제품 코드 변경 0파일/0줄, 공용·다른 담당 파일 변경 0줄, 신규 테스트 0, Godot 실행 0, 테스트 실행 0, 테스트 PASS 주장 0, 원본 에셋 생성/변환/복사 0.** 문서 변경은 이 보고서 신규 1파일과 CHANGELOG_SYNC 맨 위 절 추가 1파일뿐이다.
- 구현 중단이므로 test_contracts/기존 사운드 회귀·decode·PCM·청감·실게임 화면/녹음·PC 인수는 실행/검증하지 않았다. SND-08의 과거 PASS 수치를 SND-09 결과로 합산하지 않았다.
- Godot를 실행하지 않아 과부하 대기 진입·override.cfg 작성도 0회다. 향후 실행 시에는 반드시 사용자 지정 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 확인 후 2 이상이면 30초씩 대기하고, 신규 격리 이름 `EXODUSER-snd-09-Isolated-20261020` / 기존 파일 상수 이름과 실행별 override 비움을 적용해야 한다.
- 문서/제출 검사는 staged diff whitespace, 정상 docs-sync check·pre-commit 훅, 허용 2파일만 stage 여부, 기존 파일 byte 보존, R HEAD/branch/tracked INDEX/WORK 대조다. 결과는 원로그 `verification.json` / `commit.log` / `submission.json`으로 남긴다.

## 제출·정리

브랜치 `codex/snd-09-20261020`의 이 2문서만 정상 commit 후 비강제 push하고 원격 SHA를 대조한다. 그 뒤 Git 밖 `~/exoduser-wt/_out/snd-09/DONE.txt`에 **status=BLOCKED**, branch/SHA/수치 및 보고 제출 완료를 기록하고 자기 worktree만 제거한다. 최종 SHA·원격 일치·worktree 제거·R 불변의 실제 결과는 DONE/submission.json에 기록한다. main push·force push·rebase·git add -A·훅 우회 없음. 원로그·보고서 사본·브랜치는 남는다.
