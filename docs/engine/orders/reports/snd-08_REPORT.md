# snd-08 — 원문 믹스·합성 그래프와 비전투 레시피

## 제출 범위와 미완 경계

**공용0줄의 독립 원문 모델·레시피·원본 생성 버퍼 구현/검증본이다. 실제 Godot DSP 출력 adapter는 미구현/HOLD다.** 이 제출을 가청 native EQ/컴프레서/oscillator/FM 재생 완성으로 인수하면 안 된다. `native_sound_mix.gd`라는 순서안의 제안 경로를 사용하지만 구현은 주입 media graph owner이며 AudioServer 효과를 임의 근사해 연결하지 않는다. native DSP/Q·knee·ramp/전체 출력 PCM·청감·PC 동등성은 미확인이고 native_parity=UNVERIFIED다.

Main/State/기존 공용 연결은 전부0줄이다. 다음 SND-09는 실제 Main 공용 접점이 필요하므로 착수하지 않았으며 필요한 위치/후보 줄/원본 근거를 아래에 기록한다.

| 항목 | 실제 기준 |
|---|---|
| 작업 / branch | `snd-08` / `codex/snd-08-20261020` |
| 최신 main | fetch 후 `e556b617190c325ca39f5add04357f5dea5ca87e`, game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 기준 / 의존 | SND-07 `a0c673010a64825ad2add85ec13d26321e4f80c3`가 main에 없어 그 끝에서 분기. 최신 main은 이미 ancestor, 추가 merge 불필요. 이 HEAD+신규10파일 상태에서 실행 |
| 작은 WT | `/Users/fordeargamers/exoduser-wt/snd-08`, worktree add --no-checkout -b→필요 경로만 sparse-checkout set --no-cone→새 빈 index read-tree 초기화. 웹 대용량 에셋 checkout0 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001` HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`, 시작 tracked INDEX/WORK0. HEAD/branch/tracked INDEX/WORK 보존 |
| 지시서 / 격리 | [사운드 추적 §4.2](../../FDG_SOURCE_TRACE_SOUND_20261020.md). 새 테스트는 `EXODUSER-snd-08-Isolated-20261020`. click/pickup→potion→forge/crystal 순서로 별도 검증 후 다음 소단위 구현 |
| 원로그 | `/Users/fordeargamers/exoduser-wt/_out/snd-08/`, raw 보고서 사본/DONE/submission은 WT 제거 뒤에도 보존 |

## 신규 API·소유 경계

| 파일 / API | 구현 계약 |
|---|---|
| `godot/scripts/native_sound_mix.gd` | 독립 RefCounted. 생성자(media,gain_reader), mbus/status/snapshot/dispose. 첫 mbus는 source10노드/연결을 만들고 cache hit는 같은 mbus의 현재 gain만 다시 설정. status READY는 **injected_source_graph** 준비 상태이며 native_DSP_parity_verified=false |
| mix adapter | create/set_param/connect_nodes/disconnect_node/destination. source가 명시 대입한 값·생성/연결 순서를 보존한다. WebAudio 기본값의 임의 재정의·Godot EQ 대역/공진값·knee 보정·자동 category 라우팅 추가0 |
| `godot/port_modules/sound_source/synthesis.gd` | 독립 RefCounted. play(tone/noise/dist/fm/sub,args), snapshot/status/cancel_all. media/master/RNG 주입. 자체 clock/RNG·Node·IO·실제 oscillator 출력0. Noise PCM와 Dist512곡선은 원본처럼 runtime PackedFloat32Array로 생성하며 파일 출력0 |
| synthesis adapter | current_time/sample_rate, node/parameter/connection/automation/buffer/transport/ended/timeout 프로토콜. incomplete adapter는 NOT_READY. source start/stop throw는 명시 THREW/error packet으로 비교, 임의 GDScript 예외 catch가 아님 |
| 합성 수명 | helpers의 자체 active counter, maximum은 주입(기본 desktop48). 기존 SND-07/game active 집합과 합산0. 성공 뒤 active+1, ended/timeout은 token bool guard로1회 감소/캡처 노드 disconnect. 새 owner cancel_all은 old FM mod/carrier까지 중지, 새 instance 노드 침범0 |
| `godot/port_modules/sound_source/cue_recipes.gd` | dispatch(kind,args)/schedule(callback,ms) 주입. click/pickup/potion/forge/crystalEquip 원문 호출 배열·순서만. 정상 cue 중첩 허용, owner의 명시 cancel_pending만 이전 generation 지연 요청 무효화 |
| cue 실패 | dispatch가 THREW packet이면 원본 throw처럼 뒤의 즉시 층/타이머 등록을 진행하지 않음. delayed callback도 그 batch를 중단하고 packet 반환. 실제 GDScript runtime throw/로그 자동 처리라고 주장하지 않음 |
| crystal sample | `sample,[equip_rare,.38,1.12,true]` 요청을 그대로 전달. **실제 sample dispatcher는 미연결(sample_bound=false)**. bool 우선을 numeric priorityOverride로 오인·변경0. 이 요청의 PCM/실재생 완료로 세지 않음 |
| 시험 지원 | 새 `test_sound_source_mix.gd`, `test_sound_source_cue_recipes.gd`, `sound_source_graph_fake.gd`, 원본 Node VM generator2개/fixture2개. graph fake는 실제 DSP adapter가 아니며 명시적으로 test 전용 |
| docs | 이 보고서와 CHANGELOG_SYNC 최상단 절만 직접 수정. 기존 기획/trace·타인 문서·공용 보드0줄 |

공용6파일(main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd), 기존 SND01~07 제품/테스트/HTML/에셋0줄. 원본 에셋은 읽기 근거만 사용하며 생성/변환/신규 복사0. 절차적 noise/곡선은 원본 함수가 생성하던 **메모리 수치 버퍼**를 그대로 이식한 것이며 새 WAV/MP3/리샘플 파일이나 대체 음원을 만들지 않았다.

## 최신 main 행·정확한 값

| game.html 행 | 보존한 동작 |
|---|---|
| 12408–12460 mbus | cache hit마다 gain=sfxVol. highShelf6000Hz/−9dB→peaking3000/Q.8/−5dB→lowShelf250/+4dB→master compressor threshold−6/knee30/ratio2/attack.015/release.35→destination |
| 12428–12458 subbus | hit threshold−12/ratio8/attack.001/release.08/input gain.55, skill−8/4/.003/.15/input gain.8, boss gain1. source가 생성하는 input reference만 유지. helper/sample을 새 category 경로로 자동 우회시키지 않음 |
| 12270–12273 / 12409,12452 | sample voice gain=min(1,(vol\|\|1)×sfxVol)와 mbus sfxVol은 별도 적용. 실제 원본 _playSampleNow+mbus를 실행해0/60/100에서 voice/master/product=0/0/0, .6/.6/.36,1/1/1 대조. sample vol0/rate0 fallback도 보존. 이것은 수식/모델 교차 검증이며 실제 SND-07→mixer 배선 증거가 아님 |
| 12463–12476 Tone | _r(v)=v×(1+(random−.5)×2×.05). 초기freq와 존재하는 freqEnd 각각 RNG1; freqEnd0도20Hz floor. type 기본sine, attack기본.004. gain0→linear vol at t+a→exponential .0001 at t+dur, stop t+dur+.02. start/stop 실패는 stop/disconnect prefix 후 THREW |
| 12478–12494 Noise | len=truncate(sampleRate×dur), 각 Float32=Math.random×2−1. type기본lowpass, filterEnd 존재 시floor20/RNG0, attack기본.002, envelope동일. buffer 생성→PCM 쓰기→source/filter/gain 순서. 다른 helper처럼 active cap을 RNG/생성보다 먼저 검사 |
| 12496–12512 Dist | 초기freq만 _r, truthy freqEnd에floor20(끝값 random화0), type기본sawtooth, amt0/생략→20.512 Float32곡선 `(π+am)x/(π+am\|x\|)`, x=i×2/511−1, oversample4x directive. attack.003 |
| 12515–12531 FM | mod freq mFreq, depth mDepth→exponential1, carrier초기freq만_r, truthy cEnd floor20. carrier 기본sine/attack.003. mod→depth→carrier.frequency와carrier→gain→mbus. start mod/carrier→stop mod/carrier 순서. carrier ended가 정리 |
| 12533–12545 Sub | sine/초기freq RNG0, truthy fEnd만floor8. gain=vol at t와t+.006 뒤exponential.0001 at t+dur.20Hz로 잘못 통일하지 않음 |
| 합성 성공/실패 | source timeout=(dur+.5)초, ended/timeout 중복 감소0. Noise/Dist/FM/Sub의 start/stop 예외에는 source의 Tone 전용 cleanup을 임의 추가하지 않으며 관측된 prefix/active0 보존. backend의 생성/parameter/connect 임의 예외는 검사 범위 밖 |
| 12772–12776 /12839–12840 | click Tone1800/.03/sine/.025/2400. pickup FM1400/700/200/.07/.06/sine/2200, FM2000/1000/150/.06/.035/sine/2800, Tone3200/.04/sine/.015 순서 |
| 12756–12761 | potion0ms:FM500/100/300/.06/.05/sine/700 + Noise.03/4000/.015/6000/.002/bandpass.55ms:FM650/130/350/.06/.045/sine/900 + Noise.02/5000/.012/7000/.001/bandpass.110ms:FM850/170/400/.07/.045/sine/1100 + Tone1200/.04/sine/.025.170ms:FM1100/220/300/.1/.05/sine/1400 + Noise.03/10000/.015/12000/.001/highpass |
| 12827–12837 | forge FM1800/400/1200/.15/.08→Sub100/.05/.04→Noise.03/8000/.05/4000/.001/highpass. crystal sample요청→Noise.025/3400/.012/1700/.003/bandpass→Tone880/.14/sine/.014/1320/.006→65ms 뒤Tone1760/.19/sine/.007/1046/.008 |

## 검증과 원로그

매 Godot 직전 사용자 지정 pgrep count를 확인,2 이상이면30초씩 대기한다. cue-phase3/contracts/bgm-selection은2→30초 후1, native-dsp-probe는2→30초→2→30초 후1. 각 실행의 실제 count/argv/HEAD/PID/시각/exit/출력SHA는 `.meta.json`. 새 테스트 지정격리/기존 각 USERDIR, 상수 없는 contracts는 SND-08 override. 실행마다 override를 쓰고 finally0byte, 로그는 Git 밖 --log-file. contracts 준비는 검증된 엔진 cache1006파일 동일 byte 복사만(import0)이다.

| 검사 | 실제 결과 |
|---|---|
| mix-01 실패 | adapter disconnect 이름이 Object.disconnect(signal,callable)와 충돌해 compile 실패. sourcecase0/step0/최종7단정1실패와stderr를 보존하며 PASS 제외 |
| mix-02 실패 | 이름을 disconnect_node로 수정 후 source26/55 대조는 통과, native 준비 상태 테스트의 잘못된 bool 비교1개로5717/1. 비교식을 null로 정정. 제품값/원본 기대값 변경0 |
| mix-03 / mix-final | 각각5717/0,5728/0. 후자는 실제 sample+mbus 이중 gain source oracle와 incomplete adapter 검사 보강. 최종 submit 결과와 중복 합산0 |
| **mix-submit** | **5728단정/0실패/exit0/stderr 비어 있음**, source26시나리오55단계, isolated=true/Main_booted=false/nodes_left0/native_DSP_parity_verified=false |
| **cue-phase1→2→3** | 순서대로 click/pickup31/0(3사례5단계)→potion55/0(5사례12단계)→forge/crystal·실패/취소133/0(11사례25단계). 각각exit0/stderr 비어 있음. 코드 범위를 순서대로 확장한 별도 검수 로그 |
| **cue-submit** | **133단정/0실패/exit0/stderr 비어 있음**,11시나리오25단계. 즉시/지연 dispatch 실패 prefix·overlap·취소된 old generation 무효·Synthesis까지18개 helper graph 경로 포함 |
| 독립 전체 trace | mix19,477 scalar leaf/최대차8.881784197001252e−16, cue854 leaf/차0. 불일치 모두0, 수치 상대허용1e−12, key/배열순서/문자/null/bool은 정확 대조 |
| 원본 생성 Float32 | noise4버퍼1373값 + distortion4곡선2048값 = **고유8배열/3421값 전부 Float32 byte 동일**. SHA는 float32-byte-comparison.json. 반복 snapshot 검사를 고유 PCM 수로 부풀리지 않음. 바이너리 asset 출력0. 필터/oscillator/믹스 후 전체 출력 PCM 검증은 아님 |
| 재생성·입력 | Node VM 원문 generator2개 재실행으로 fixture와 raw oracle byte 동일. tested-inputs-final.json의10개 코드/시험/fixture SHA와 staged blob 대조 |
| contracts | 전체5그룹/failed_assertions0/only=[]/exit0/stderr 비어 있음 |
| SND01~04 회귀 | policy1194/0·catalog687/0·queue606/0·voice2435/0, 각exit0/stderr 비어 있음 |
| SND05~07 회귀 | BGM선곡1308/0·BGM수명2400/0·실제sample backend2004/0, 각exit0/stderr 비어 있음. 기존 SND07의 실제 MP3/Dummy 검증을 신규 SND08 DSP 검증으로 세지 않음 |
| 웹 | audioBootLoading/audioContextResumeGate/footstepAudioPriority 3파일7pass/0fail/0skip/exit0/stderr 비어 있음 |
| 보호 | 기존 tracked game.html/godot **1337파일 SHA256 동일**. 공용/State/기존 제품·test·에셋0줄, sparse 제외 staged삭제0, override 최종0byte |

단정/그룹/단계/leaf/Float32는 다른 분모라 합산하지 않는다. 전달된 선재 결함 원문 **로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)**는 원문만 보존하며 로비 전체 재실행/수정/추가 판정0이다.

`native-dsp-probe.*`는 실제 설치 엔진 ClassDB의 Compressor/Filter/EQ property를 별도 읽은 원로그와 probe script다. Compressor property는 threshold/ratio/gain/attack_us/release_ms/mix/sidechain이며 **knee가 없다**. Filter는 cutoff_hz/resonance/gain/db를 제공하며 source Q.8에 대응하는 Q property가 없다. 따라서 source knee30을 생략하거나 Q를 검증 없이 resonance로 치환해서 native 완료라고 할 수 없다. 별도 검증된 DSP adapter가 없는 현재는 이 부분을 HOLD로 남긴다(자체 DSP로 구현 불가능하다는 주장은 아님). 모델 PASS를 native 효과 지원 증거로 바꾸지 않기 위한 inspection이며 DSP 출력 검증은 아니다. source의 Q.8/knee30/ramp를 검증된 adapter 없이 Godot의 다른 공진/압축/프레임 Tween 값으로 대신하지 않았다.

## SND-09 공용 접점 — 구현하지 않음

순서안의 다음 단위는 실제 BGM owner의 Main configure·자연 stage/boss/forge/death 연결을 요구한다. 사용자 지시에 따라 다음 단위의 코드/asset/공용 변경0이며 아래는 위치·추가 줄 후보·근거만이다. 후보 수치는 패치가 아니라 trace의 예상 범위로, 현재 소유자와 실제 API 확정 전 exact patch로 취급하면 안 된다.

| 현재 위치 | 필요한 후보 줄 / 근거 |
|---|---|
| `godot/scripts/main.gd:1951–1973` 주변 owner 필드 구역 | 신규 BGM owner 보관1줄 후보. 현재는 attack streams/queue/active/bus만 소유. 기존 attack owner를 덮어쓰거나 전역 State owner 신설 금지 |
| `main.gd:276–278` 설치 구역 | 새 owner configure 약4–8줄 후보. 실제 현재 options/scene/stage reader를 받아야 하며 stub/항상READY callback으로 대체 금지. source BGM3980–4212 lifecycle, stage31669/보스35877–35881가 근거 |
| `main.gd:472–479` postStage configure | 실제 bgm_stage_key/bgm_play callback2항목 후보. 현재 current_g/current_p 등만 있고 BGM2개 누락. `source_post_stage_owner/producer.gd:228–235`가 key 계산과 실제 play를 소비하므로 선언만으로 자연 연결 완료 판정 금지 |
| `main.gd:490–491` exit | 새 BGM owner dispose1줄 후보. 지금은 attack dispose만 있음. source stop/fade4174–4206·Audio identity 보존 필요 |
| stage/boss/forge/death 실제 owner | 자연 요청별약1–2줄 후보, 실제 담당 위치는 합의 필요. source stage31669, boss35877–35881, death43872, win43899, forge50517/44079. 미이식 owner를 fixture로 대체0 |

SND-08 내부의 native DSP 출력 adapter도 아직 없으므로 SND-09를 SND-08 native 오디오 완성을 전제로 자동 착수하지 않는다. actual Godot Q/knee/ramp 동등성, mixer와sample 공동 active owner, 실제 sample dispatcher와 opts 저장복원·청감/PC 인수는 후속 검수 경계다.

## 제출·정리

정확한 신규10경로+보고서/CHANGELOG만 stage, ignore된 새 test2개만 경로 지정 add -f. 정상 docs pre-commit 훅·자기 branch만 비강제 push·원격 SHA 일치 확인→Git 밖 DONE.txt 작성→자기 snd-08 WT만 worktree remove --force. branch/원격/원로그/보고서 사본 보존. main push/push force/rebase/훅 우회/git add -A0. 실제 SHA/제거/R 불변 재확인은 DONE/submission.json. DONE의 완료 대상은 source model 제출/정리이며 **SND-08 전체 native DSP 완료 상태가 아니다**.

관련 docs 전체 tracked keyword 검색1412행을 docs-keyword-search.txt에 보존했다. 새 상태는 이 보고서·CHANGELOG로만 동기화했다. 재현은 자기 branch의 새 sparse WT에서 generator2개를 실행하고 run_godot.py로 test_sound_source_mix/test_sound_source_cue_recipes를 각각 지정격리로 실행한다. 원로그 compare.py는 전체 trace·Float32 byte 대조와 재생성/보호 검사를 수행한다.
