# RM-1 사운드 — 1-1 리모델링 슬라이스 Unity 사운드 (2026-10-27 사운드 총괄)

근거: 유니티 총괄 공지(local_59ad835c, 10-27): 사운드는 Unity Audio Mixer 기반으로 새로 구성하고, 호출 시점은 Core 이벤트, 공간음은 3D. CTO 지시(2026-10-27, 사용자 원문 "이식작업은 대충 된거같으니까 유니티 리모델링 작업들어간다 오늘부터"). 첫 목표는 1-1 리모델링 슬라이스, 즉 맵 RM-1(`docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md`)과 다크드루이드 리모델링입니다. 사운드 총괄이 맡는 범위는 아래 네 가지입니다.
- 1-1 숲 배경음·환경음
- 전투 타격·구르기·패링
- 드루이드 예고음(AD3 TELL 범주)
- 드루이드 침강

원칙:
- 이미 고른 SFX Forge 결과(SND-02)를 먼저 씁니다.
- 새 후보는 ElevenLabs(SFX Forge)로 바로 만듭니다.
- 새 소리는 사용자가 듣고 고른 뒤에만 반영합니다.
- 반영할 때는 웹과 Unity에 같은 키·같은 파일로 넣습니다. 웹이 기준이라는 원칙(CLAUDE.md §총괄 자율 결정)을 지키기 위해서입니다.
- 디자인 7장 규칙을 따릅니다: CH1에서는 불씨 소리와 차임을 쓰지 않고, 높은 순음 배음을 400ms 넘게 끌지 않으며, 6kHz 이상 성분은 어택 순간에만 둡니다.

## 1. 현황 (웹 origin/main `3dd29ac61` · Unity origin/unity/main `6b5419078`)

| 영역 | 웹(기준) | Unity 지금 |
|---|---|---|
| 1-1 탐험 BGM | `hell1` = `bgm/1장_썩은숲/Ashes of the Fallen Gate.mp3` | 없음(로비·시작 오디오만) |
| 보스전 BGM | 드루이드 아레나 진입 → `boss` = `bgm/공통/boss.mp3`. 처치 후 `victory`, 사망 `death` | 없음 |
| 숲 환경음 | `amb_hell_forest_bed`: `hell1`일 때 루프, gain .15×sfxVol, 다른 키에서는 800ms 페이드 정지(SND-02) | 없음 |
| 적 피격 | `hurtE`: `_hitSfxForEtype(e.etype)`의 key·pitch를 vol .3으로 재생, 쿨다운 8f(`_hitSfxCd`) | 없음 |
| 치명타 | `crit_heavy`: vol .45, rate ±5%, 쿨다운 12f(SND-02) | 없음 |
| 적 사망 | `_DEATH_VARIANTS` 기반 무작위 | 없음 |
| 보스 피격·포효·사망 | `_BOSS_SFX[0]`(hit `boss_hit`, howl `boss_howl`, die `death_boss`, 각 pitch) | 없음 |
| 플레이어 타격(기검참) | `sword_swing1~3`·`scarecrow_charge` | 있음(`NativeFeedbackAudio` 16키) |
| 패링 | `sword_parry` + 보이스 | 검 소리만 있음(`sword_parry`) |
| 플레이어 피격 | `player_hit1~4` | 있음(B09) |
| 구르기 | **전용 소리 없음.** 웹 구르기 코드가 `footstep`(.55, rate 1.15±.1)과 `footstep2`(.5)를 빌려 씀 | 없음 |
| 드루이드 예고 | 프로시저럴 `SFX.charge()` 하나(상승 휘익+럼블). 예: `case'fan'` 확산탄 | 없음. Unity에는 프로시저럴 합성기가 없어 샘플이 꼭 필요함 |
| 드루이드 굴파기·분출 | 진입 시 프로시저럴 `SFX.groggy()`, 분출 시 `SFX.detonate()` | 없음 |
| 드루이드 침강 도주(마지막 사망) | `_druidSinkStart`: 사망 흔들림·섬광·사망 소리는 그대로. 침강 자체 소리는 없음 | 없음 |

결론: Unity 1-1에는 BGM·환경음·적 피격·사망·구르기·드루이드 소리가 전부 없습니다. 웹도 구르기·예고·드루이드 동작은 임시 소리(발소리 차용·프로시저럴)뿐입니다.

## 2. 결정 (총괄 자율 결정)

### 트랙 A — 웹에 이미 있는 소리를 Unity로 옮김 (청음 불필요, 구현 sound-simple)
웹에 이미 반영된 키라서 사용자 청음 없이 옮깁니다. 값(음량·rate·쿨다운·우선순위)은 웹과 같게 맞춥니다.

| # | 내용 | 웹 출처 |
|---|---|---|
| A1 | 게임 BGM 버스: `hell1` → 드루이드 아레나 `boss` → `victory`, 사망 `death`. 웹 `BGM.play`와 같은 키·전환 조건(`bKey` 판정, 아레나를 벗어나면 `stageKey`로 복귀) | `BGM` 객체·`hell1`/`boss`/`victory`/`death` 파일 목록 |
| A2 | 환경음 `amb_hell_forest_bed`: `hell1`과 연동. 페이드·음량은 SND-02 그대로 | `_ambSync` |
| A3 | 적 피격: 1-1 etype(0~29·47)의 `_hitSfxForEtype` 표를 그대로 옮김. vol .3, 쿨다운 8f | `hurtE` |
| A4 | 치명타 `crit_heavy`: vol .45, 쿨다운 12f | `hurtE` 치명타 블록 |
| A5 | 1-1 적 사망 소리(`_DEATH_VARIANTS` 중 1-1 etype이 쓰는 묶음) | 사망 처리부 |
| A6 | 드루이드 보스 피격·포효·사망: 1-1 드루이드가 실제로 쓰는 `_BOSS_SFX` 프로필(조회식을 따라가 확인) | `_BOSS_SFX` |
| A7 | 구르기: 웹과 같은 임시 소리(`footstep`·`footstep2`, 같은 음량·rate). 트랙 B의 `roll_body`가 채택되면 교체 | 구르기 처리부 |
| A8 | 독성 강(양 사이드 남→북)·비보행 늪의 3D 환경 소스. 위치는 맵 RM-1 씬의 강 스플라인·늪 오브젝트에서 받음(맵 보드 T6: 맵은 위치만, 소리는 사운드 쪽). 강 = 스플라인을 따라 12m 간격 루프 소스, 늪 = 늪마다 기포 원샷 무작위 2~6초 간격. 소리는 트랙 B `amb_toxic_river`·`toxic_bubble` 채택본(채택 전에는 비워 둠) | 맵 RM-1 명세 `E:/exoduser-wt/_out/rm1/SPEC.md` |

- **구조는 Unity Audio Mixer로 새로 만듭니다**(CLAUDE.md §Unity 리모델링, `cf506002d`: Core는 유지하고 표현은 Unity 도구로). 믹서 에셋 `Exoduser.mixer`의 그룹 구성:
  - `Master` 아래에 `Music`, `Ambience`, `SFX`
  - `SFX` 아래에 `Tell`, `PlayerHit`, `Skill`, `Voice`, `EnemyHit`, `Death`, `Step`, `UI`
- 설정 음량(BGM·SFX)은 exposed parameter로 연결합니다.
- 스냅샷은 `Explore`와 `Boss` 두 개입니다. `Boss`에서는 `Ambience`를 −8dB로 내립니다.
- `Tell` 그룹에 Send를 걸고 `EnemyHit`·`Ambience`에 Duck Volume(−4dB, attack 10ms, release 250ms)을 넣습니다. 혼전에서도 예고음이 묻히지 않게 하려는 것입니다.
- 웹 음량·rate·쿨다운은 시작값으로만 쓰고, 최종값은 녹음을 듣고 정합니다.
- `NativeFeedbackAudio`의 보이스 관리(48보이스 한도·낮은 우선순위부터 밀어내기)는 유지하고, 각 보이스의 출력만 해당 믹서 그룹으로 보냅니다.
- 드루이드는 리모델링 대상이라(보스는 새로 설계) A6는 임시 연결이고, 트랙 B의 드루이드 키가 채택되면 교체합니다.
- 오디오 카테고리는 웹 `_SFX_PRI`를 따릅니다(`TELL:12, SKILL:10, VOICE:9, PLAYER_HIT:8, DEATH:4, STEP:3, HIT:2, PROJ:1, AMB:0`). `NativeFeedbackAudio`의 우선순위 정수(지금은 10/2)를 이 표로 넓힙니다.
- 소리를 낼 지점에 Unity 시뮬레이션 이벤트가 없으면 Core에 `FeedbackEvent` 큐잉 한 줄만 추가합니다. 시뮬레이션 상태는 바꾸지 않으며, 기존 oracle 결과가 같아야 합니다.
- 브랜치는 `claude/unity-pc-sound-rm1-20261027`입니다(origin/unity/main 기준 worktree `G:\exoduser-wt\`). 병합은 PC 관례대로 origin/unity/main을 브랜치에 merge한 뒤 비강제로 unity/main에 반영합니다. main에는 넣지 않습니다.
- **구현 배정과 착수 시점(유니티 총괄 local_59ad835c, 10-27)**: 트랙 A 구현 Sonnet은 유니티 총괄이 배정합니다. 착수는 RM-0(URP·패키지, local_7bb6eaac, 브랜치 `claude/unity-rm0-engine-20261027`)이 unity/main에 병합된 뒤입니다. 사운드 총괄은 명세와 귀 판정만 맡습니다.
- **공간음(3D)**: 환경 소스(독성 강 흐름·늪 기포, A8)는 `AudioSource.spatialBlend=1`, Logarithmic rolloff, min 4m / max 30m, 출력 그룹은 `Ambience`입니다. 숲 바닥 환경음 `amb_hell_forest_bed`는 2D(공간감 없이 화면 전체에 깔림)로 둡니다. 적 피격·예고·사망은 `spatialBlend=0.5`로 방향감만 줍니다(멀어져도 작아지지 않게 rolloff 끔). 플레이어 소리(타격·피격·구르기·패링)와 BGM·UI는 2D입니다. AudioListener는 플레이어 위치에 둡니다(카메라 높이 때문에 거리감이 틀어지지 않게).

### 트랙 B — 새 후보 생성 (SFX Forge·ElevenLabs, 키마다 3개 → 총괄 판정 → 사용자 청음)
| 키 | 용도 | 카테고리·길이 | 프롬프트 요지(영문으로 생성) |
|---|---|---|---|
| `tell_melee` | 일반 근접몹 `windup` 진입(AD3 2단계) | hit, 0.35s | short low breathy swell, creature inhale and leather creak before a strike, no high tones |
| `tell_ranged` | 원거리 60f 공격링 시작(AD3 2단계) | skill, 0.6s | taut bowstring and bone scrape tension rising, brief bright attack only, dry |
| `tell_boss` | 보스 전조. `SFX.charge()` 대체 후보, 드루이드 전 패턴 공통. 다크드루이드 RM-B1 명세 §4·RB1-4(텔레그래프 소리)의 기본 소리 — 그 명세가 패턴별로 소리를 나누면 변형 키를 추가 | skill, 0.9s | deep rising sub swell with rotten wood creak and root tearing, ominous build, cut tail short |
| `tell_parry` | 드루이드 RM-B1 §4 "패링 가능 근접" 예고(무기 끝 섬광과 같은 프레임). 기술 1(1·2타)·2·3·10 | hit, 0.2s | short dull iron glint scrape on a gnarled staff tip, one quick metallic tick, dry, no ringing tail |
| `tell_grab` | 드루이드 RM-B1 §4 "잡기" 예고(60f, 눈빛·손 뻗기). 기술 6 | skill, 1.0s | low creaking of living wood stretching, roots tightening like a hand closing, hollow rotten wind drawn inward, slow ominous build |
| `roll_body` | 전사 구르기 | hit, 0.45s | armored body roll on damp forest soil, cloth and leather whoosh then dull earth thud, mail jingle minimal |
| `druid_burrow` | 드루이드 굴파기 진입(`bossDruidUnder`) | skill, 0.9s | heavy body sinking into wet rotten earth, roots snapping, soil collapse rumble |
| `druid_erupt` | 드루이드 분출(`bossDruidErupt`) | skill, 0.8s | violent eruption from underground, dirt and roots bursting upward, low impact boom, debris patter |
| `amb_toxic_river` | 1-1 양 사이드 독성 강 흐름(A8, 3D 루프) | ambient, 10s loop | slow viscous toxic sludge river flowing, thick bubbling liquid, low gurgle, no water splash brightness |
| `toxic_bubble` | 늪·강 기포 터짐(A8, 3D 원샷) | hit, 0.4s | single thick toxic bubble rising and popping in viscous sludge, wet low plop, short |
| `druid_sink` | 1-1 마지막 사망 침강 도주(1.1s 시트 + 0.3s 유지 + 0.3s 페이드) | skill, 1.7s | wounded creature slowly sinking into swamp soil, wet suction, roots closing over, fading rumble, no scream |

- **예고음 체계 = RM-B1 §4 표시 3종과 1:1**: 패링 가능 근접 `tell_parry`, 피해야 하는 범위 `tell_boss`(드루이드 기술 4·5·7·8·9·11·12와 2·3의 범위 쪽 공통), 잡기 `tell_grab`. 일반몹은 `tell_melee`·`tell_ranged`. 한 화면에 겹치는 예고는 최대 2개라는 RM-B1 규칙에 맞춰, 같은 키는 120ms 안에 다시 내지 않습니다.
- **트랙 B2(드루이드 연출음, 유니티 총괄 요청으로 E: 초안 기준 즉시 생성)**: 드루이드 리모델링에서 새로 생긴 연출 소리입니다. 키마다 3개씩 만들고, 판정 기준은 트랙 B와 같습니다.

| 키 | 용도(RM-B1) | 카테고리·길이 | 프롬프트 요지 |
|---|---|---|---|
| `druid_staff_tap` | P1 진입, 지팡이로 바닥 3번. 한 번 두드리는 소리를 3회 재생(rate ±4%) | hit, 0.5s | heavy gnarled wooden staff striking damp forest earth once, deep hollow knock with root resonance |
| `druid_roots_rise` | 뿌리 기둥 4개가 솟음(P1 진입) | skill, 1.5s | massive roots tearing up through soil and rising, cracking bark, dirt cascade, deep groan of living wood |
| `druid_root_pierce` | 쓰러짐 2.0초 동안 뿌리가 등에 꽂힘(P2·P3 진입) | skill, 0.8s | thick root stabbing into a body, wet wood piercing flesh-like bark, tight crunch, no scream |
| `druid_heartbeat` | 숲의 심장 박동, 박동 1회 = 1번 재생(3박) | skill, 1.0s | enormous organic heartbeat pulsing through the ground, deep sub thump with wet fibrous squeeze, short pressure wave |
| `druid_tide` | 독액 해일이 수로에서 솟아 퍼짐(P3 기술 10) | skill, 1.5s | wave of thick toxic sludge surging up from a channel and spreading outward, heavy viscous rush, low roar |
- 모든 프롬프트에 붙이는 공통 금지 조건: CH1 규칙(불씨·차임 금지, 높은 순음 금지), voice/music/melody 금지.
- 출력 위치는 `G:\exoduser-wt\_out\sfx_forge\` staging입니다. 청음 페이지는 기존 `review_20261026.html` 형식에 **RM-1 묶음**으로 추가합니다. 파형·스펙트럼 시트는 `_analysis/sheet_rm1_*.png`에 둡니다.
- 판정 기준: 길이 범위, 6kHz 이상 에너지가 어택에만 있는지, 피크 −1dBTP 이하, 무음 꼬리 정리.

### 트랙 C — 채택 반영 (사용자 청음 뒤)
- 웹: AD3 2단계(예고음 3키 연결, 같은 키 120ms 쿨다운, 화면 밖 몹 제외), 구르기 소리 교체, 드루이드 굴파기·분출·침강 소리 연결
- Unity: 같은 키를 트랙 A 구조에 등록
- DEMO·EA 동기화(CLAUDE.md 배포 명령)

## 5. 1차 판정 (2026-10-27 사운드 총괄 — 수치 `metrics_rm1.json` + 시트 16장 눈 확인)

공통 사항
- ElevenLabs가 낸 skill·hit 후보 대부분이 +2~+4dBTP로, 디코딩하면 1.0을 넘습니다. 디코딩 값에 넘친 부분이 그대로 남아 있어서 게인만 낮춰도 손실 없이 고쳐집니다.
- 그래서 추천본은 모두 **−1dBTP 게인 정규화 + 뒤 무음 정리(남길 꼬리 30ms, 끝 10ms 페이드)**를 한 가공본으로 청음에 올립니다.

| 키 | 추천 | 판단 근거 | 추가 가공 |
|---|---|---|---|
| `tell_melee` | v1 | 0.12초 부근에서 부풀었다 줄어듦. 셋 다 넓은 대역 숨소리 계열이지만 6k 이상 비율이 1.7% 이하라 규칙 안. v1 소리가 가장 큼 | 정규화만 |
| `tell_ranged` | v2 | 어택 뒤 시위 울림이 2~5kHz에 머물고, 6k 이상 비율은 뒤쪽 1.0%뿐. v1(뒤 14%)·v3(딸깍 연속, 뒤 12%)은 6k 규칙 위반 | 정규화 |
| `tell_boss` | v2 | 셋 중 유일하게 0.4초까지 부풀다 끊김(예고=상승). v1·v3는 앞에서 터지고 줄어들어 폭발처럼 들림 | 정규화 |
| `tell_parry` | v2 | 가장 짧음(−40dB까지 245ms). 6k 이상은 어택에 몰림. v3는 100ms에 두 번째 딸깍이 있어 탈락 | 0.25s로 자르고 끝 20ms 페이드 |
| `tell_grab` | **다시 생성** | 셋 다 빠른 딸깍(래칫) 12~15번이라 "1초 동안 손을 뻗으며 쌓이는 예고"로 읽히지 않음 | r2 |
| `roll_body` | v1 | 옷 휘익 → 몸 닿음 → 0.13초에 작은 두 번째 닿음(구르고 멈춤)이 들어 있음. v2·v3는 저역 96% 이상이라 둔탁함 | 정규화 |
| `druid_burrow` | v1 | 흙·나무 삐걱임이 0.7초까지 이어짐. 넘친 샘플이 가장 적음(67) | 정규화 |
| `druid_erupt` | **다시 생성** | 셋 다 저역 99.8% 붐 하나뿐. 흙·뿌리가 터져 오르는 질감이 없고, 넘친 샘플이 2.6k~3.6k개 | r2 |
| `druid_sink` | v1 | 거품·삐걱임 펄스가 1.3초에 걸쳐 천천히 가라앉음. v2는 16kHz까지 쏟아지는 소음, v3는 앞에서 크게 터짐 | 정규화 |
| `amb_toxic_river` | v2 | 이음매 0.7dB, 레벨 편차 1.3dB, 튀는 소리 없음. v1·v3는 이음매 6.8·5.7dB에 펑 하는 튐이 있어 루프용 탈락 | RMS −24dBFS로 올림 |
| `toxic_bubble` | v3 | 짧고 깨끗한 퐁 소리 한 번이라 3D로 반복해도 거슬리지 않음. v2는 음높이가 올라가는 "뽀옹"(만화풍)이라 탈락. v1은 대안(작은 거품 꼬리) | 정규화 |
| `druid_staff_tap` | v2 | 저역이 가장 많음(10.8%). 셋 다 −26dBTP로 아주 작음 | −1dBTP로 올림 |
| `druid_roots_rise` | v3 | 저역 52%로 가장 무거움. 그래도 6k 이상이 뒤쪽까지 9.8% 남아 CH1 규칙 위반 → 가공 필요 | 6.5kHz 로우패스(12dB/oct, 앞 50ms 제외) + 정규화 |
| `druid_root_pierce` | v3 | 6k 이상은 어택에만 있고(뒤 0.1%), 저역 47%로 묵직함. 뒤 무음 600ms | 뒤 무음 정리 + 정규화 |
| `druid_heartbeat` | **다시 생성** | 셋 다 0.1초짜리 저음 쿵 하나뿐(킥 드럼). 심장 박동(두 박자 쿵-쿵)과 축축한 조임 질감이 없음 | r2 |
| `druid_tide` | v2 | 5kHz 위가 어둡고 끈적한 쏟아짐. v1·v3는 14kHz까지 밝은 물소리 | 정규화 |

다시 생성할 3키 (r2, 키마다 3개):
- `tell_grab` (skill, 1.0s): "slow continuous low swell of straining living wood and roots tightening, one long creak that builds in tension and pressure toward the end, hollow rotten wind drawn in, no rapid clicking"
- `druid_erupt` (skill, 0.8s): "ground bursting open from below, crunchy dirt explosion with splintering wood and roots tearing upward, debris and soil raining down, moderate low impact, not a pure sub boom"
- `druid_heartbeat` (skill, 0.8s): "giant organic heartbeat, double thump lub-dub through the ground, wet fibrous muscle squeeze on each beat, short low pressure swell between, no electronic kick"

## 3. 완료 조건 (슬라이스)
- 기능: Unity 1-1 한 판(START → R2 전투 → 드루이드 → 침강)에서 위 키가 웹과 같은 시점에 나는 것을 수신 로그(Receipt keys)로 확인
- 귀: 녹음 1개(약 60초)를 사운드 총괄이 듣고 판정. 예고음이 혼전에서 묻히지 않는지, 환경음이 BGM을 덮지 않는지 확인
- 디자인 7장 규칙 위반 0

## 4. 기록
| 날짜 | 내용 |
|---|---|
| 2026-10-27 | CTO 지시로 착수. 현황 조사(Unity = 게임 안 BGM·환경음·적 피격·구르기·드루이드 소리 없음), 트랙 A·B·C 결정. 트랙 B(7키×3개)를 먼저 sound-simple에 배정하고, 이어서 트랙 A |
| 2026-10-27 | CLAUDE.md §Unity 리모델링(`cf506002d`)에 맞춰 트랙 A 구조를 Audio Mixer(그룹 11개·스냅샷 Explore/Boss·Tell 덕킹)로 확정. 웹 값은 시작값으로만 사용 |
| 2026-10-27 | 유니티 총괄 공지 반영: 트랙 A 구현 배정 = 유니티 총괄, 착수 = RM-0 병합 뒤. 공간음 규칙 추가. 맵 RM-1에 독성 강·늪이 합쳐져(fd7bebcc4) A8과 트랙 B 2키(`amb_toxic_river`·`toxic_bubble`)를 추가해 트랙 B는 9키. `tell_boss`는 드루이드 RM-B1 RB1-4 텔레그래프 소리를 맡음 |
| 2026-10-27 | 드루이드 RM-B1 초안(`E:/exoduser-wt/_out/boss-rm-druid/UNITY_BOSS_RM1_DARK_DRUID_20261027.md`, 아직 origin 미커밋) §3·§4를 읽고, 예고음을 표시 3종과 1:1로 결정. 트랙 B에 `tell_parry`·`tell_grab`을 추가해 11키×3이 됨. 새 연출음 5키는 트랙 B2로 보류(명세가 main에 커밋된 뒤 생성) |
| 2026-10-27 | 유니티 총괄 요청: 트랙 B2(드루이드 연출음 5키)를 드루이드 명세 커밋을 기다리지 않고 E: 초안 기준으로 바로 생성. 타이밍이 바뀌어도 사용자 청음 전이라 다시 만드는 비용이 작음 |
| 2026-10-27 | 트랙 B A8 2키 `amb_toxic_river`(ambient 10s 루프)·`toxic_bubble`(hit, 0.4s→API 최소 0.5s) × 3 = 6후보 생성(sound-simple, 카탈로그 `tools/sfx_forge_catalog_rm1.json` 9키로 확장, staging `ambient/amb_toxic_river`·`hit/toxic_bubble`). 측정 `_analysis/metrics_rm1.json`·시트 `sheet_rm1_<key>.png`, 청음 페이지 RM-1 묶음 9키·27후보. 루프 이음매 RMS 차(마지막 50ms−처음 50ms): v1 +6.8dB·v2 +0.7dB·v3 +5.7dB, v2만 잘림 0·피크 −12.1dBTP(v1·v3은 +0.9/+0.6dBTP·잘림 30/9, 음량 RMS는 v2가 −29.2dBFS로 6~7dB 작음) |
| 2026-10-27 | 트랙 B 추가 2키(`tell_parry`·`tell_grab`)와 트랙 B2 5키(`druid_staff_tap`·`druid_roots_rise`·`druid_root_pierce`·`druid_heartbeat`·`druid_tide`) × 3 = 21후보 생성(sound-simple, 카탈로그 `tools/sfx_forge_catalog_rm1.json` 16키). 이로써 트랙 B 11키 + B2 5키 = 16키 × 3 = 48후보. 측정 `_analysis/metrics_rm1.json`(정점→−30/−40dB 감쇠·저역<120Hz 추가)·시트 `sheet_rm1_<key>.png`, 청음 페이지 RM-1 묶음을 총괄 지정 순서(예고음 5 → roll_body → druid 3 → 독성 강 2 → 드루이드 연출 5)로 재배열. `tell_parry`: 정점→−40dB 240~330ms(전부 400ms 이내)·6kHz 이상은 뒤 구간 0.1~1.1%, v3은 100ms 부근에 2번째 틱. `druid_heartbeat`: 저역<120Hz 98~99.7%, v1 −9.0dBTP 무잘림 / v2·v3 +2.3·+1.8dBTP 잘림 230·356 → −1dBTP 가공본(`_preview_rm1/druid_heartbeat_v2·v3_tp-1.mp3`, 게인 −3.36·−2.88dB, −1.54·−1.55dBTP, 잘림 0) 병기. `druid_staff_tap`은 셋 다 −26dBTP로 매우 작음(승격 때 게인 보정 필요) |
| 2026-10-27 | 48후보 1차 판정(§5): 13키 추천+가공 방식, 3키(`tell_grab`·`druid_erupt`·`druid_heartbeat`) 다시 생성 r2. 다시 생성된 후보까지 판정한 뒤 사용자 청음 한 번에 요청 |
