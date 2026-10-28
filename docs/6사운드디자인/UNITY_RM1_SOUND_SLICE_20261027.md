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

### 5.1 r2 판정과 합성(레이어) 방식 전환 (2026-10-27)
- r2 판정: 3키 모두 탈락.
  - `tell_grab`: 여전히 딸깍이 연속됨
  - `druid_erupt`: −19~−24dBTP로 작고, 뒤쪽 6k 이상이 66~74%
  - `druid_heartbeat`: 쿵 한 번뿐이고 두 박자가 아님
- 같은 문장으로 세 번째 생성을 하지 않고, 이미 있는 후보를 겹치고 다듬어 만듭니다. 확정된 방법(숫자는 고정, 결과는 사운드 총괄이 판정)은 아래와 같습니다.
- **`druid_heartbeat_comp`** (0.65s, 쿵-쿵):
  1. 재료는 r1 v3 원본의 0~180ms 구간
  2. 첫 박: 0ms에 0dB
  3. 둘째 박: 210ms에 −4dB, 피치 −8%(리샘플)
  4. 두 박 모두 끝 40ms 페이드
  5. 전체 110Hz 아래만 남기지 말고 원본 그대로 두고, `toxic_bubble` v1 원본을 각 박 +15ms 위치에 −16dB로 겹침(축축한 질감)
  6. −1dBTP 정규화
- **`druid_erupt_comp`** (0.8s):
  1. r1 v2 원본(저음 붐)을 250Hz 로우패스, −6dB
  2. `druid_burrow` v2 원본의 0~400ms(흙·나무 어택)를 0dB로 0ms에 겹침
  3. r2 v2 원본(파편)을 +18dB, 6kHz 로우패스로 60ms 위치에 겹침
  4. 합친 뒤 −1dBTP 정규화, 끝 60ms 페이드
- **`tell_grab_comp`** (1.0s, 쌓이는 예고):
  1. 바닥층: 사인 45Hz→60Hz 상승 스윕, 진폭은 0→1 지수 곡선(0.95s), 끝 50ms 페이드, −10dBFS
  2. 위층: r2 v2 원본(부드러운 삐걱임)에 게인 곡선 −14dB→0dB 직선을 적용
  3. 합친 뒤 −1dBTP 정규화
- 판정 기준(합성본):
  - 6k 이상 뒤 구간 3% 이하
  - 잘림 0
  - 시트에서 heartbeat는 두 박, grab은 끝으로 갈수록 커지는지 확인

## 6. 2차 제작 — 장면 기준 (2026-10-27 사용자 청음 반려 뒤)

### 6.1 반려와 원인
- 사용자 청음: "다 좀 안맞다 상황하고". 16키 추천본(§5·§5.1) 전부 반려. 사용자는 "내가 고를 수 있는 옵션도 있어야지"라고도 함.
- 원인(총괄 판단): 1차 문구가 "low swell", "metallic tick"처럼 소리 모양만 적었고, 누가·무엇이·어디서 내는 소리인지(장면)를 적지 않았다. 고르기도 총괄이 수치·그림으로 했다. 수치로는 불량(잘림·긴 꼬리·고음 잔향)만 걸러 낼 수 있고, 장면에 맞는지는 판정할 수 없다.
- 바뀌는 점: ① 문구를 장면 기준으로 다시 쓴다(§6.2). ② "총괄 추천"을 붙이지 않는다. 수치 불량만 "주의"로 표시한다. ③ 사용자가 직접 고르고 결과가 파일로 남는 고르기 페이지를 만든다(§6.3).

### 6.2 장면 카드와 생성 문구 (키마다 4개, ElevenLabs)
공통 꼬리말(모든 문구 끝에 붙임): `dark fantasy ARPG, rotting forest, organic and physical, no synth, no electronic whoosh, no magic chime, no music, no voice`. 1-1 일반몹은 눈이 여러 개 달리고 이빨·촉수가 있는 살덩이 괴물(다안 육괴, `docs/8.0몬스터디자인/CH1_1_START_다안육괴_중형몬스터.md`)이다. 드루이드는 굽은 나무 지팡이를 든 늙은 숲지기다(`docs/engine/UNITY_BOSS_RM1_DARK_DRUID_20261027.md`).

| 키 | 장면(무엇이 보이는가) | 뒤따르는 일 | 길이 | 문구 |
|---|---|---|---|---|
| `tell_melee` | 살덩이 괴물이 몸을 뒤로 젖히며 물어뜯을 준비 | 약 0.4초 뒤 물기 | 0.35s | wet guttural snarl of a many-eyed flesh beast rearing back to bite, slimy sinew stretching, short and close |
| `tell_ranged` | 살덩이 괴물의 목이 부풀며 썩은 덩어리를 뱉을 준비(공격링 60f) | 1초 뒤 발사 | 0.6s | bloated flesh creature's throat swelling and gurgling as it builds up to spit a glob of rot, wet bubbling rise that stops right before the spit |
| `tell_boss` | 드루이드 범위 기술 직전, 바닥에 어두운 독액 얼룩이 점점 진해짐 | 얼룩 자리에 뿌리·독이 터짐 | 0.9s | deep groan beneath a forest floor, soil cracking and dark sap seeping upward, pressure building, ends abruptly |
| `tell_parry` | 드루이드 지팡이 끝이 한 번 번쩍임(패링 가능 근접, 기술 1·2·3·10) | 14~20f 뒤 지팡이 타격 | 0.25s | short scrape of an iron-capped gnarled wooden staff being raised for a strike, one dry metallic glint, no ringing |
| `tell_grab` | 드루이드 눈이 빛나고 나무껍질 같은 손을 뻗은 채 멈춤(60f) | 1초 뒤 잡기 | 1.0s | old forest keeper's hoarse hungry breath drawn in as a gnarled bark hand creaks open and reaches out, knuckles of wood cracking, dead leaves rustling, slow tense build |
| `roll_body` | 갑옷 입은 전사가 젖은 흙·낙엽 위로 구름 | — | 0.45s | armored warrior dodge roll on damp forest dirt and dead leaves, leather and chainmail shuffle, one body thud, quick |
| `druid_burrow` | 드루이드가 땅속으로 뛰어들어 사라짐(기술 7 시작) | 흙 흔적이 플레이어를 따라옴 | 0.8s | robed old man plunging into the ground, wet soil collapsing over him, roots snapping shut, muffled |
| `druid_erupt` | 플레이어 발밑에서 드루이드가 흙과 뿌리를 뚫고 솟음 | 피격 판정 | 0.7s | violent burst of earth and roots from beneath the ground, clods of wet dirt and splintering wood flying, heavy and close |
| `druid_sink` | 세 번째 쓰러짐 뒤 드루이드가 땅속으로 천천히 가라앉아 달아남(STY-D9) | 대사 "숲은 아직 배고프다…" | 2.5s | slow sinking into rotting forest ground, mud and roots dragging a body down, long wet gurgling swallow of earth fading out |
| `amb_toxic_river` | 아레나 가장자리를 도는 얕은 독액 수로 | 반복 | 8s 루프 | slow viscous toxic sludge stream flowing over roots, thick bubbling liquid, occasional plop, seamless loop, no birds, no wind |
| `toxic_bubble` | 늪·수로 표면에서 기포 하나가 터짐(2~6초마다) | — | 0.4s | single thick bubble bursting in a pool of toxic sludge, viscous wet pop, close |
| `druid_staff_tap` | P1 시작, 드루이드가 지팡이로 바닥을 3번 두드림 | 3번째 뒤 뿌리 기둥 솟음 | 0.5s | heavy gnarled wooden staff struck once on hard packed earth, deep dull knock with ground resonance |
| `druid_roots_rise` | 아레나 뿌리 기둥 4개가 땅을 찢고 솟음 | — | 1.2s | massive tree roots tearing up through soil and rising into pillars, deep wood groaning and cracking, dirt falling |
| `druid_root_pierce` | 쓰러진 드루이드가 무릎 꿇고, 등에 뿌리가 꽂힘(2.0초 연출 시작) | 플레이어가 뿌리를 때릴 수 있음 | 0.6s | thick wooden roots stabbing into an old body, wet crunch and bark splintering, short |
| `druid_heartbeat` | P3, 아레나 전체가 숲의 심장 박동에 맞춰 울림(3박, 박마다 45f) | 박마다 파동 피해 | 0.8s(1박) | giant heartbeat thumping deep underground in a rotten forest, roots throbbing with it, single beat, low and physical |
| `druid_tide` | P3, 독액 수로에서 독액 고리가 솟아 퍼짐(틈 1곳) | 고리에 닿으면 피해 | 1.5s | wave of thick toxic sludge surging out of a stream and spreading across the ground, heavy liquid rush with gurgling foam |

- 1차·r2·합성 후보는 지우지 않고 고르기 페이지에 "이전 후보"로 함께 둔다(사용자가 이전 것을 고를 수도 있음).
- 가공은 1차와 같다: −1dBTP 정규화, 뒤 무음 정리, 루프는 이음매 확인. 원본은 그대로 둔다.

### 6.3 고르기 페이지 `pick_rm1.html` (sound-simple 제작)
- 위치: `G:\exoduser-wt\_out\sfx_forge\pick_rm1.html`. 로컬 서버 `G:\exoduser-wt\_out\sfx_forge\_tools\serve.cjs`(127.0.0.1:3399, 정적 파일 + `POST /api/picks`)로 연다. 미리보기 창(정적 그림)에서는 소리가 안 나므로 반드시 서버 주소로 연다.
- 키마다 카드 1장: 장면 설명(§6.2 표의 장면·뒤따르는 일), 가능하면 해당 원화 한 장(드루이드 = `assets/sprites/boss/boss_dark_druid_{dive,emerge,attack,idle}.png` 중 맞는 칸, 일반몹 = 다안 육괴 원화).
- 후보마다 재생 버튼 2개:
  - **그냥 듣기**
  - **장면에서 듣기**: 1-1 BGM(`bgm/1장_썩은숲/Ashes of the Fallen Gate.mp3`)과 숲 바닥음(`sfx/ambient/hell_forest_bed.mp3`)을 게임 음량 비율로 깔고, 1초 뒤 후보를 재생한다. "뒤따르는 일"이 있으면 그 소리를 이어서 낸다. 예: `tell_parry` 뒤 18f에 지팡이 휘두름과 타격음, `tell_melee` 뒤 0.4초에 물기 타격음. 기존 게임 소리 중에서 sound-simple이 고른다(무엇을 썼는지 페이지에 적는다).
- 후보마다 고르기 단추(라디오)를 둔다. 키마다 추가 선택지 두 개: "전부 안 맞음 — 다시"와 메모 칸.
- 선택은 바뀔 때마다 자동 저장한다 → `G:\exoduser-wt\_out\sfx_forge\picks_rm1.json`(`{key:{pick:"<파일 경로>"|"none", memo:"..."}}`). 페이지 맨 위에 "저장됨 HH:MM:SS"와 고른 키 수(n/16)를 표시한다.
- 꾸밈은 `rm1_listen_16.html`과 같은 흑철·뼈색 톤. 이모지 금지.
- 수치 불량(잘림, 6kHz 이상 뒤 구간 3% 초과, 꼬리가 목표 길이의 2배 초과)은 후보 옆에 "주의: <이유>"만 작게 적는다. 추천 표시는 없다.

### 6.4 사용자 고르기 결과 (2026-10-27 `picks_rm1.json`, 메모 없음)
**채택 11키** — 사용자가 귀로 고른 것이 최종이다. 아래 "주의"는 기록만 하고 소리는 바꾸지 않는다.

| 키 | 채택본 (`G:\exoduser-wt\_out\sfx_forge\` 기준) | 원본 | 반영 메모 |
|---|---|---|---|
| `tell_melee` | `_preview_s2/tell_melee_s2_v3_proc.mp3` | `hit/tell_melee_s2/v3.mp3` | 주의 6k 뒤 3.3% — 그대로 |
| `tell_ranged` | `_preview_s2/tell_ranged_s2_v3_proc.mp3` | `skill/tell_ranged_s2/v3.mp3` | |
| `tell_boss` | `_preview_s2/tell_boss_s2_v3_proc.mp3` | `skill/tell_boss_s2/v3.mp3` | 썩은 숲 성격이라 웹에서는 드루이드 전조에만 쓴다(다른 장 보스는 `SFX.charge()` 유지) |
| `tell_grab` | `_preview_s2/tell_grab_s2_v4_proc.mp3` | `skill/tell_grab_s2/v4.mp3` | 주의 6k 뒤 37.6% — 사용자 선택 우선. 게임 안 녹음에서 거슬리면 꼬리만 LP |
| `druid_erupt` | `_preview_s2/druid_erupt_s2_v4_proc.mp3` | `skill/druid_erupt_s2/v4.mp3` | |
| `druid_sink` | `_preview_s2/druid_sink_s2_v3_proc.mp3` | `skill/druid_sink_s2/v3.mp3` | |
| `amb_toxic_river` | `_preview_s2/amb_toxic_river_s2_v1_proc.mp3` | `ambient/amb_toxic_river_s2/v1.mp3` | 이음매 3.7dB → 루프 끝·처음 크로스페이드로 1dB 이하로만 정리(음색 변경 금지) |
| `toxic_bubble` | `_preview_s2/toxic_bubble_s2_v4_proc.mp3` | `hit/toxic_bubble_s2/v4.mp3` | |
| `druid_roots_rise` | `_preview_s2/druid_roots_rise_s2_v4_proc.mp3` | `skill/druid_roots_rise_s2/v4.mp3` | 주의 6k 뒤 29.4% — 사용자 선택 우선 |
| `druid_heartbeat` | `_preview_s2/druid_heartbeat_s2_v4_proc.mp3` | `skill/druid_heartbeat_s2/v4.mp3` | |
| `druid_tide` | `_preview_s2/druid_tide_s2_v1_proc.mp3` | `skill/druid_tide_s2/v1.mp3` | |

**전부 안 맞음 5키** — `tell_parry`, `roll_body`, `druid_burrow`, `druid_staff_tap`, `druid_root_pierce`. 메모가 없어 방향을 알 수 없으므로, 3차(s3)는 후보 4개를 **서로 다른 해석**으로 만든다(한 문구 4번이 아니라 4가지 방향). 사용자가 고른 방향을 다음 기준으로 삼는다. 공통 꼬리말은 §6.2와 같다.

| 키 | a | b | c | d |
|---|---|---|---|---|
| `tell_parry` (0.25s로 컷) | quick sharp blade-edge shing as light catches a weapon tip, single bright scrape, very short | short whoosh of a heavy wooden staff drawn back fast, air cut, tight | dry wooden creak of a gnarled staff gripped hard right before a swing, short | short dull iron ring of a weapon being readied, cut off immediately, no sustain |
| `roll_body` | quick body roll on soft forest dirt, cloth and leather rustle, soft thud, no metal | fast whoosh of a heavy cloak during a dodge roll, fabric flap, light ground scuff | armored knight rolling on gravel and dirt, plate armor clatter, heavy thump | short evasive dash through dry leaves, leaves crunch and scatter, boot skid |
| `druid_burrow` | something diving fast into loose earth, quick soil whoosh and thud, dirt settling | deep underground rumble as a body tunnels down, muffled earth grinding | roots coiling around a body and dragging it into the ground, wood creak and crumbling soil | wet mud splash and suction as a figure sinks into a bog in one motion |
| `druid_staff_tap` | wooden staff butt slammed on forest dirt, soft heavy thud, dull and earthy | staff struck on a stone floor, hard wooden crack with short echo | ritual staff tap on the ground with a deep low boom spreading through the earth | gnarled staff knocked on a hollow tree root, hollow wooden knock |
| `druid_root_pierce` | roots bursting up and impaling, fast wood splinter and crack | wet organic stab with a short squelch | roots burrowing into bark-like skin, slow creaking crunch | wooden spike thrust into a body, thick thunk with a crack |

- 고르기 페이지는 같은 `pick_rm1.html`에 5키만 3차 후보를 맨 위에 추가한다(2차 후보는 접어 둔 묶음으로). 채택 11키 카드는 "채택됨" 표시로 접는다. `picks_rm1.json`의 기존 선택은 지우지 않는다.

### 6.5 트랙 C 반영 범위 (채택 11키)
- **웹(game.html)**
  - AD3 2단계: `tell_melee` = 일반 근접몹 `windup` 진입, `tell_ranged` = 원거리 60f 공격링 시작(`_emitEnemyShot`의 경고 생성). 두 키 모두 같은 키 120ms 쿨다운, 화면 밖 몹 제외, 분류 `TELL`.
  - 드루이드(si0·si3) 전조: 기존 `SFX.charge()` 호출 중 보스가 다크드루이드일 때만 `tell_boss`로 바꾸고, 잡기 전조는 `tell_grab`으로 바꾼다. 다른 보스는 그대로 둔다.
  - 드루이드 분출 `SFX.detonate()` → `druid_erupt`, 침강 도주 `_druidSinkStart` 시작에 `druid_sink`, 드루이드 독액 해일(tideWave를 쓰면) 발동에 `druid_tide`.
  - 웹에 대응 장면이 없는 키(`druid_roots_rise`·`druid_heartbeat`·`amb_toxic_river`·`toxic_bubble`)는 웹에 넣지 않는다(Unity 리모델링 전용).
  - 음량은 1차값(예고 .45, 드루이드 연출 .5, 침강 .55)으로 넣고 게임 녹음으로 조정. `6사운드디자인.md` 키 표 갱신, DEMO·EA 동기화.
- **Unity**: 트랙 A 구조(믹서)는 RM-0 병합 뒤 유니티 총괄 배정이다. 지금은 채택 11키 파일을 `claude/unity-pc-sound-rm1-20261027` 브랜치의 `unity/Assets/Exoduser/Resources/Audio/RM1/<key>.mp3`로 넣고, 키·용도·분류(`_SFX_PRI`)·믹서 그룹·공간음 값을 적은 `RM1_AUDIO_KEYS.json`을 같이 둔다(코드 변경 없음). 유니티 총괄에 브랜치와 커밋을 알린다.

### 6.6 트랙 A 판정 기준 — 드루이드 기술별 소리 키 (2026-10-28 사운드 총괄)

유니티 총괄이 트랙 A(A1~A8) 구현을 RM-0 세션(`local_7bb6eaac`)에 배정했다(브랜치 `claude/unity-pc-sound-rm1-20261027`, 채택 11키 파일은 이미 `48fdc2e29`에 있음 — 새로 넣지 말고 그 위에 쌓는다). 드루이드 기준 명세는 main `091ea32b9`의 `docs/engine/UNITY_BOSS_RM1_DARK_DRUID_20261027.md`(§3 기술 12종·§4 텔레그래프), Core는 unity/main `cfc5a0957`. A6(웹 `_BOSS_SFX` 임시 연결) 중 피격·포효·사망은 그대로 두고, 기술 소리는 아래 표가 대신한다.

**규칙**
- 텔레그래프 1개 = 예고음 1개, 텔레그래프가 시작되는 프레임에 낸다. 패링 가능하면 `tell_parry`가 우선(바닥 예고가 같이 떠도 `tell_boss`는 내지 않는다).
- `tell_*`는 120ms 안에 같은 키를 다시 내지 않는다. 화면에 겹치는 예고가 최대 2개(§4)라 예고음도 동시에 2개를 넘지 않는다.
- 미채택 키는 아래 "대기 중" 칸대로 둔다. 비워 두는 키도 Receipt에는 키 이름을 찍는다(파일 없음 표시). `druid_burrow`는 2026-10-28 사용자 3차 선택 s3d를 전용 Unity 브랜치에 연결했으며 아직 `unity/main`에는 없다.

| # | 기술 | 시점 | 키 | 현재 파일·대기 상태 |
|---|---|---|---|---|
| 1 | 가지 채찍 3연 | 1·2타 텔레그래프 시작 | `tell_parry` | `tell_melee` |
| 1 | 〃 | 3타(패링 불가) 텔레그래프 시작 | `tell_boss` | — |
| 2 | 거름 내려찍기 | 35f 시작 | `tell_parry` | `tell_melee` |
| 3 | 뿌리 끌기 돌진 | 40f 시작 | `tell_parry` | `tell_melee` |
| 4 | 가시 뿌리 줄기 | 25f 시작 | `tell_boss` | — |
| 5 | 독포자 부채 | 25f 시작 | `tell_boss` | — |
| 6 | 거름 거두기(잡기) | 60f 시작(눈빛·손 뻗기) | `tell_grab` | — |
| 7 | 땅속 잠행 기습 | 땅속으로 들어감(50f 시작) | `druid_burrow` | 3차 사용자 선택 s3d 연결 후보(`9a9067b29`), 빌드·청음 미확인 |
| 7 | 〃 | 발밑에서 솟음(판정) | `druid_erupt` | — |
| 8 | 기생 뿌리 추적 | 첫 장판 20f 시작만 | `tell_boss` | — |
| 9 | 거름 일으키기 | 45f 시작 | `tell_boss` | — |
| 10 | 독액 해일 | 60f 시작(틈 밝힘) | `tell_parry` | `tell_melee` |
| 10 | 〃 | 고리가 솟아 퍼짐(판정 시작) | `druid_tide` | — |
| 11 | 포자 꼬투리 | 25f 시작 | `tell_boss` | — |
| 12 | 숲의 심장 박동 | 패턴 시작 1회 | `tell_boss` | — |
| 12 | 〃 | 박동 판정마다(3박) | `druid_heartbeat` | — |
| — | P1 진입 | 지팡이 3번 | `druid_staff_tap` ×3(rate ±4%) | 비움 |
| — | P1 진입 | 뿌리 기둥 4개 솟음 | `druid_roots_rise` | — |
| — | P2·P3 진입 | 쓰러져 등에 뿌리 꽂힘 | `druid_root_pierce` | 비움 |
| — | 3번째 쓰러짐 | 침강 도주 | `druid_sink` | — |
| — | 구르기(A7) | 구르기 시작 | `roll_body` | 웹 `footstep`·`footstep2` |

2026-10-28 전용 Unity 브랜치 `codex/pc-sound-takeover-20261028`의 `9a9067b29`: `picks_rm1.json`에서 사용자 선택 `druid_burrow`=`_preview_s3/druid_burrow_s3d_proc.mp3`를 확인했다. `Audio/RM1/druid_burrow.mp3`(10074바이트, 0.554초)를 동일 바이트로 복사하고 임시 `tell_boss` 매핑을 해제했다. 원본·복사본 SHA-256은 `eabfa03391127db4f58ab5416a347fafd852fa2898777769d93ab521607aeb14`로 같다. 시작 음량 .45, `SFX/Skill`, 우선순위 10, 공간 혼합 .5·거리 감쇠 없음. 정적 JSON·diff 검사는 통과했으나 공용 Unity 빌드 순번 대기로 컴파일·oracle·m1-check·Player·청음은 아직 확인하지 못했다. 이 적용은 Unity 리모델링의 `burrowStrike` 전조이며 웹 본편의 소리·트리거를 새로 바꾸지는 않았다.

**판정에 필요한 제출물**
1. Receipt 로그: 소리 1회마다 한 줄 — 프레임, 키, 낸 곳(기술 번호/이벤트), 믹서 그룹, 음량, 파일 유무. 1-1 한 판(START → R2 전투 → 드루이드 P1~P3 → 침강) 전체.
2. 녹음 60초 1개: 드루이드전에서 `tell_parry`(대기 중 `tell_melee`)·`tell_boss`·`tell_grab`·`druid_erupt`·`druid_heartbeat`·`druid_tide`가 각 1회 이상 들어가게(디버그 페이즈 이동 허용, 쓴 방법을 적는다). R2 전투(일반몹 예고·피격·사망·환경음·독성 강)는 30초 1개 추가.
3. 판정 항목: 예고음이 혼전·BGM에 묻히지 않음(Tell 덕킹 동작), 환경음이 BGM을 덮지 않음, `Boss` 스냅샷에서 환경음 −8dB, 같은 키 겹침 0, 디자인 7장 규칙 위반 0.

**기존 키 편입 — `fireball` (2026-10-28 유니티 총괄 공지)**
- UI 세션이 A18 작업 중 E 마법(우클릭) 시전 예외를 막으려고 웹 `sfx/magic/fireball.mp3`를 `unity/Assets/Exoduser/Resources/Audio/fireball.mp3`로 넣고 `NativeFeedbackAudio` 허용 목록에 추가했다(unity/main `40256751b`). 파일·키 이름은 그대로 쓴다.
- 트랙 A 기준: 분류 `SKILL`(10, 웹 `_SKILL_SFX_KEYS`에 있음), 믹서 그룹 `SFX/Skill`, 2D(플레이어 소리), 시작값은 웹 E 마법 시전과 같게 음량 .9·rate .7±.1(`game.html` 화염구 시전 2곳). 웹의 다른 사용처(.6/1/.5, 혈류 계열)는 Unity에 해당 기술이 들어올 때 따로 정한다.
- 트랙 A 구현 때 `RM1_AUDIO_KEYS.json`에 이 키를 같은 형식으로 한 줄 추가한다(파일은 옮기지 않는다).

### 6.7 트랙 A 1차 판정 (2026-10-28 사운드 총괄)

제출: RM-0 세션, 브랜치 `claude/unity-pc-sound-rm1-20261027` `5797c22fb`(48fdc2e29 + origin/unity/main `b280ddf61` merge, unity/main 미병합), 구현 문서 `docs/engine/UNITY_RM1_SOUND_TRACK_A_20261028.md`, 산출물 `E:/exoduser-wt/_out/rm1-sound/`. 녹음은 Simulation(적 AI·DruidRemodel·StageFlow)이 낸 소리 이벤트 타임라인을 실제 어댑터(`NativeFeedbackAudio`·`NativeGameMusic`·`NativeAmbientSources`)와 `Exoduser.mixer`로 재생해 AudioRenderer로 뜬 것(3초 넘는 간격은 3초로 줄임). 드루이드 페이즈는 디버그 이동 없이 실제 진행.

**기능(Receipt) — PASS**
- 드루이드 Receipt를 §6.6 표와 출처별로 대조: 기술 1의 1·2타 `tell_parry`(9·9회)·3타 `tell_boss`(9), 2 `tell_parry`(6), 3 `tell_parry`(11), 4 `tell_boss`(8), 5 `tell_boss`(5), 6 `tell_grab`(4), 7 `druid_burrow`(2, 임시 tell_boss)→`druid_erupt`(2), 8 첫 장판만 `tell_boss`(2), 9 `tell_boss`(1), 10 `tell_parry`(2)→`druid_tide`(2), 12 `tell_boss`(1)→`druid_heartbeat` 3박, P1 진입 `druid_staff_tap`×3(파일 없음)→`druid_roots_rise`, P2·P3 `druid_root_pierce`(2, 파일 없음), `druid_sink` 1. 표와 어긋난 줄 0.
- 같은 키 예고음 겹침 0(DROPPED 0). BGM `hell1`→`boss`(스냅샷 Boss)→`victory`. 대기 키 표시 규칙대로.
- 기술 11(포자 꼬투리)은 이번 한 판에서 나오지 않아 미검증.

**수치(불량 검사만) — 조건부**
| 녹음 | 길이 | 샘플 피크 | 0.9 이상 | 전체 RMS | 400ms RMS 최대 / 중앙 |
|---|---|---|---|---|---|
| 드루이드 60초(39.7~99.7초) | 60.0s | 0.882(−1.09dBFS) | 0 | −19.5dBFS | −14.3 / −20.9 |
| 드루이드 전체 | 114.0s | 0.884 | 0 | −20.3 | −11.8 / −22.1 |
| R2 전투 | 35.9s | 0.974(−0.23dBFS) | 5샘플(25.2초) | −20.0 | −11.6 / −21.7 |
- R2 25.2초: 0.2초 안에 사망 2(`death_crack3` .88·`death_crack2` .76)+플레이어 피격 2가 겹쳐 여유 0.2dB. 잘림은 없지만 혼전이 더 커지면 잘린다 → SFX 버스에 피크 제어 필요.
- 덕킹: 설정값(임계 −20dB·ratio 1.5·attack 10ms·release 250ms)만 있고 실제 깊이 미측정. 목표 −4dB.
- 환경음 대 BGM, Boss 스냅샷 −8dB는 섞인 녹음에서 분리해 잴 수 없음 → 그룹별 분리 녹음 필요.

**귀 판정 — 사용자 청음 대기**: 시안 폴더 `tmp/design-review/20261028_rm1_sound/`(드루이드 60초·R2 mp3 + Receipt). 총괄은 소리를 들을 수 없어 수치로는 불량만 거른다(§6.1).

**RM-0 지시(2차 제출)**
1. SFX 버스(또는 Master)에 피크 제어(Compressor 등): 같은 타임라인 R2 녹음 샘플 피크 ≤ −3dBFS(0.708), 전체 RMS 변화 1dB 이내.
2. 덕킹 실측: Tell이 나는 구간과 안 나는 구간에서 `Ambience`·`EnemyHit` 그룹만 분리 녹음해 깊이를 잰다. −4dB ±1dB가 되게 임계·ratio 조정.
3. 그룹별 분리 녹음 RMS 표(Music·Ambience·SFX, Explore와 Boss 각각): 탐험 중 Ambience 중앙값이 Music보다 6dB 이상 작은지, Boss에서 Ambience가 Explore 대비 −8dB인지.
4. 기술 11이 Core P3 기술 목록에 있으면 다음 타임라인에 포함, 없으면 Receipt 요약에 "미사용"으로 적는다.
5. 음량(시작값)은 사용자 청음 결과가 올 때까지 바꾸지 않는다.

**사용자 청음 1차 (2026-10-28)**: 드루이드 60초 앞부분을 듣고 "메아리같이 들린다". 믹서에는 리버브·에코 효과가 없다(`Exoduser.mixer` 효과 = Attenuation 12·Duck Volume 2·Send 2). Receipt에서 찾은 원인 후보와 RM-0 수정 지시(2차 지시 5건보다 먼저):
1. 구르기: 웹은 `footstep`(.55, rate 1.15±.1)을 구르기 시작에, `footstep2`(.5, rate 1±.1)를 구르기 끝 `_finishRoll`에 낸다. Unity는 둘을 같은 frame에 내서 비슷한 쿵 두 개가 살짝 어긋나 겹친다 → 끝 frame으로 분리.
2. 플레이어 피격음 몰림: frame 2692·2699·2700에 `player_hit` 3개가 0.13초 안에 났다 → 웹처럼 실제 HP 피해 1회당 1번(무적 프레임 뒤), 100ms 안 재발은 1번.
3. host 이벤트 시간축 어긋남: 같은 frame인데 rec가 다르다(frame 748 `boss_hit` 13.65s / `player_hit4` 14.15s) → Core frame 기준으로 맞춤.
4. 파이프라인 null test: 키 몇 개를 무음 사이에 한 번씩 믹서로 녹음해 원본과 빼기 비교(이중 재생 경로 확인).

**사용자 청음 2차 (2026-10-28)**: "메아리는 BGM 포함 전부 다 들려" → 효과음 겹침이 아니라 녹음 전체 문제. `rec-druid.wav`의 100ms 조각을 `boss.mp3` 원본과 대조하니 rec 4.4·4.8·5.2초가 모두 원본 0.303초(r=0.75), 5.0·5.4초가 원본 0.503초(r=0.70)와 맞았다(정상이면 rec t ↔ 원본 t−2.83초). 녹음 자기상관에도 400.0ms·800ms 봉우리(20~30초 구간 0.556). **BGM이 약 0.4초마다 재시작되거나 같은 0.4초 버퍼가 반복 기록됨** → 1차 녹음은 귀 판정 무효, 위 수치 표의 피크·RMS도 다시 잰다. RM-0에 최우선 지시: `NativeGameMusic`의 재생 재시작 조건과 `Rm1SoundCapture`(captureDeltaTime·AudioRenderer·간격 줄이기)를 확인하고, 런타임 문제인지 녹음 도구 문제인지 밝힐 것. 수정 확인 = BGM만 10초 녹음해 1초 간격 조각이 원본과 연속으로 맞는지(r≥0.9).

**2차 제출 판정 (2026-10-28, `5abee7623`, `E:/exoduser-wt/_out/rm1-sound/submit2/`)** — 귀 판정 보류(반려)
- BGM 반복 미수정: `druid_full.wav` 대조에서 rec 4.8·5.2초 → 원본 0.367초(r=0.87), 5.4초 → 0.567초(r=0.93). 구르기 `footstep`·`footstep2` 같은 frame 12쌍도 그대로. 메아리 지시 2건이 반영되기 전에 만든 제출이다.
- 수치(조건부 인정, 재녹음 뒤 같은 방법으로 다시 잼): SFX 그룹 Compressor(임계 −9.2dB·attack 10ms·release 40ms) → R2 피크 −4.44dBFS(3회 −3.6~−4.4)·RMS −0.79dB / 덕킹 임계 −45dB·ratio 1.33·Tell Send pre-fader → Ambience Explore −4.07dB·Boss −4.18dB, EnemyHit 깊이 미확정 / 그룹 RMS 1초 창 중앙값 Music Explore −30.5·Boss −27.8, Ambience Explore −38.7·Boss −46.6, SFX Explore −23.3·Boss −22.8 → Ambience−Music −8.2dB, Boss Ambience −7.84dB / 기술 11 텔레그래프 frame 6334 1회 / `fireball` R2 3회(.90·Skill).
- 남은 순서: BGM 재시작 원인 판별(런타임/녹음 도구)·BGM 10초 연속성 r≥0.9 → 메아리 3건 수정 → 재녹음 → 총괄 수치 확인 → 사용자 청음.

**재녹음 제출 판정 (2026-10-28, `4dd31bac3`, `E:/exoduser-wt/_out/rm1-sound/submit4/`)** — 수치 PASS, 사용자 청음 요청
- BGM 되감김 원인(RM-0): AudioRenderer 오프라인 녹음 × 스트리밍 임포트 클립. 런타임 `NativeGameMusic`은 키가 바뀔 때만 Stop→Play. 실제 게임도 스트리밍 스레드에 기대지 않게 `Audio/Bgm` 임포트를 CompressedInMemory(.meta loadType 2→1)로 변경.
- 총괄 재확인: `druid_full.wav` 100ms 조각을 `boss.mp3`와 대조, rec 4.0~5.4초가 원본 0.389→1.789초로 0.2초씩 연속(r=0.88~0.98). 자기상관 400ms 봉우리 소멸. 피크 드루이드 60초 −4.05dBFS·R2 −4.19dBFS, 0.9 이상 0.
- 메아리 3건: 구르기 `footstep` 시작 frame / `footstep2` 끝 frame 분리(예: frame 532→549), `player_hit` 100ms 안 재발 DROPPED, Receipt 시간축 표기 버그 수정(TIME AXIS CHECK 0). null test 5키 꼬리 길이 원본과 같고 두 번째 사본 상관 ≤0.19 → 이중 재생 경로 없음.
- 믹스: 피크 제어 2단(SFX Compressor −9.2dB/40ms + Master Compressor −8dB/10ms), R2 RMS 변화 −0.75dB·드루이드 −0.17dB. 그룹 RMS 중앙값 Music Explore −29.7·Boss −23.3, Ambience Explore −38.7·Boss −46.6, SFX Explore −24.0·Boss −23.9 → Ambience−Music −9.1dB, Boss Ambience −7.84dB. Ambience 덕킹 Explore −4.06·Boss −3.68dB. EnemyHit 덕킹 미확정(유지).
- 청음 페이지 `http://127.0.0.1:3399/listen_trackA.html`(새 녹음 `druid_v2`·`r2_v2`), 시안 폴더 `tmp/design-review/20261028_rm1_sound/`.

**최종 제출 (2026-10-28, `0b7576ec1`, `E:/exoduser-wt/_out/rm1-sound/submit5/`)** — `4dd31bac3`·submit2~4를 대체. 수치 PASS, 사용자 청음 요청
- 추가 수정: 같은 키 30ms 중복 차단을 `Time.realtimeSinceStartup`에서 Core 틱 기준으로 바꿔 녹음이 결정적이 됨(예고 구간 밖 A/B 에너지 비 ±0.02dB). 덕킹(에너지 가중) EnemyHit Explore −4.18dB·Ambience Explore −3.95dB·Ambience Boss −4.17dB → EnemyHit 포함 목표 −4±1 충족.
- 피크 제어 최종: SFX Compressor −6dB/40ms + Master Compressor −8dB/10ms. R2 피크 −3.92dBFS·RMS 변화 −0.82dB, 드루이드 −3.95dBFS·−0.18dB.
- 총괄 재확인: BGM 조각이 원본과 0.2초씩 연속(r=0.96~0.98), 피크 위와 같음, TIME AXIS 0. 장면 시각은 submit4와 같다. 청음 페이지 녹음을 `druid_v3`·`r2_v3`로 교체.

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
| 2026-10-27 | §5 1차 판정 실행(sound-simple): 가공본 13개 `_preview_rm1/<key>_v<N>_proc.mp3`(−1dBTP 정규화+뒤 무음 정리 공통, tell_parry v2 0.25s 컷, amb_toxic_river v2 RMS −24.0dBFS·이음매 0.7dB·피크 −6.9dBTP, druid_staff_tap v2 −1dBTP로 +24.7dB, druid_roots_rise v3 6.5kHz LP로 6k 이상 뒤 구간 9.8%→2.0%) + r2 재생성 3키(`tell_grab_r2`·`druid_erupt_r2`·`druid_heartbeat_r2`) × 3 = 9후보와 각각의 −1dBTP 가공본 9개. 측정 `_analysis/metrics_rm1_proc.json`, r2 시트 `sheet_rm1_<key>_r2.png` 3장, 청음 페이지는 키마다 맨 앞에 "총괄 추천(가공본)"·r2 3키는 r2 가공본 3개 + r1 "탈락" 표시. r2 결과(수치 사실): `tell_grab_r2`는 여전히 딸깍 연속(시트 확인, 큰 딸깍 약 9~10회·펄스 근사 11/16/20), `druid_heartbeat_r2`는 저역<120Hz 96.7~99.4%이고 시트상 파형은 첫 수십 ms에 쿵이 몰리고 이후는 작은 잔진동뿐이라 두 박자(쿵-쿵)가 눈으로 확인되지 않음(박 근사 4/5/2는 잔진동 포함 수치), `druid_erupt_r2`는 6kHz 이상이 뒤 구간 66.5~74.2%(v2만 어택 3.4%)로 CH1 고역 규칙 크게 초과하고 원본 피크가 −19~−24dBTP로 매우 작음(가공 게인 +18~+22dB). 2회째 생성이라 재생성은 총괄 판정 대기 |
| 2026-10-27 | r2 3키 탈락 판정, 세 번째 생성 대신 합성 방식(§5.1)으로 전환. sound-simple은 296K로 재생성(clear) 후 인계 문서로 재개 |
| 2026-10-27 | §5.1 합성본 3키 제작(sound-simple, `_analysis/rm1_comp.py`·재료는 staging 원본): `druid_heartbeat_comp` 0.65s(−1.6dBTP·잘림 0·6k 뒤 0.0·저역<120Hz 98.6%·시트에서 0~180ms·210~400ms 두 박 확인) / `druid_erupt_comp` 0.8s(−1.6dBTP·잘림 0·6k 뒤 0.0·저역 97.9%·정점 160ms) / `tell_grab_comp` 1.0s(−1.6dBTP·잘림 0·6k 뒤 0.1%·정점 945ms·끝으로 갈수록 커짐, 단 위층 r2 v2의 딸깍 줄무늬가 시트에 그대로 남음 — 청음 판정 필요). 6k 이상 뒤 구간 3% 이하·잘림 0 기준 3키 모두 충족. 시트 `sheet_rm1_comp.png`, 측정 `metrics_rm1_proc.json`의 `comp`, 청음 페이지는 3키 맨 앞에 "총괄 추천(합성본)"·r2 가공본은 "탈락" 표시 |
| 2026-10-27 | 합성본 3키 판정 PASS(사운드 총괄, `sheet_rm1_comp.png` 눈 확인): heartbeat는 0ms·210ms 두 박이 분명하고, erupt는 흙·나무 어택 위에 붐이 0.6초 동안 줄어들며, grab은 삐걱임과 저음이 끝으로 갈수록 커짐. 6k 뒤 0~0.1%, 잘림 0. 16키 추천본 확정 → 사용자 청음 요청 |
| 2026-10-27 | 사용자 청음 "다 좀 안맞다 상황하고" → 16키 추천본 전부 반려. 원인 = 장면 없는 문구와 수치 기준 추천. §6 2차 제작(장면 카드·새 문구 16키×4·고르기 페이지 `pick_rm1.html`, 추천 표시 없음) 결정, sound-simple 배정 |
| 2026-10-27 | §6 2차 제작 실행(sound-simple): 카탈로그 `tools/sfx_forge_catalog_rm1_s2.json`(16키, 키 `<key>_s2`)로 ElevenLabs 64후보(16×4) 생성, staging `<cat>/<key>_s2/v1~v4.mp3`(원본 보존, 1차·r2·합성 후보 유지). API 최소 0.5s라 tell_melee·tell_parry·roll_body·toxic_bubble은 0.5s로 생성. 가공(1차와 같음, 루프는 RMS −24dBFS): `_preview_s2/<key>_s2_v<N>_proc.mp3` 64개, 전부 TP −1.3~−1.9dBTP(루프 v2만 RMS 기준 −4.8)·잘림 0. 수치 "주의" 18후보(6kHz 이상 뒤 구간 >3%: tell_melee v2~v4, tell_grab v2·v4, roll_body v1~v4, druid_erupt v1, druid_roots_rise v1~v4, druid_root_pierce v1 / 루프 이음매 RMS 차 >3dB: amb_toxic_river v1·v3·v4)이며 추천은 붙이지 않음. 이전 후보 60개(r1 v1~v3 정규화본 35개 `_preview_s2/prev/` + 1차 추천 가공본 13 + r2 가공본 9 + 합성본 3)는 키마다 접어 둠. 고르기 페이지 `pick_rm1.html`(장면 카드·그냥/장면에서 듣기·라디오·"전부 안 맞음"+메모·`picks_rm1.json` 자동 저장)과 서버 `_tools/serve.cjs`(127.0.0.1:3399, Range·`/game/` 읽기 전용 별칭 bgm/·sfx/·`GET/POST /api/picks`)는 저장소 밖 `G:\exoduser-wt\_out\sfx_forge\`. headless·음소거 검수: audio 124개 readyState≥1·오류 0, 선택→저장→새로고침 복원·장면 재생 오류 0 |
| 2026-10-27 | 사용자 고르기 완료(`picks_rm1.json`): 채택 11키, 전부 안 맞음 5키(메모 없음). §6.4 채택표·3차(s3) 4방향 문구, §6.5 트랙 C 범위 결정. sound-simple 배정 |
| 2026-10-27 | §6.4 3차(s3) 제작(sound-simple): "전부 안 맞음" 5키(`tell_parry`·`roll_body`·`druid_burrow`·`druid_staff_tap`·`druid_root_pierce`)를 키마다 서로 다른 해석 4개(a~d, 문구마다 1개)로 ElevenLabs 20개 생성 — 카탈로그 `tools/sfx_forge_catalog_rm1_s3.json`, staging `<cat>/<key>_s3a~d/v1.mp3`(키가 문구마다 달라 `_s3a`~`_s3d`). 가공 1차와 같음(tell_parry만 0.25s 컷+끝 20ms 페이드): `_preview_s3/<key>_s3<a~d>_proc.mp3` 20개, 전부 잘림 0·TP −1.1~−2.3dBTP. 수치 주의 6kHz 이상 뒤 구간 3% 초과: tell_parry a 71.5%, roll_body d 71.2%, druid_burrow c 29.6%, druid_root_pierce a 29.1%·b 27.1%. `pick_rm1.html`: 5키 카드는 3차 후보(방향 한 줄 표기)를 맨 위에, 2차는 접은 묶음으로 옮기고 채택 11키 카드는 "채택됨: <후보>"를 표시해 접음. `picks_rm1.json` 기존 16키 선택 보존(검수 때 백업·복구 확인). headless·음소거: audio 144개 오류 0, 저장·복원·배지 확인 |
| 2026-10-27 | §6.5 트랙 C 웹 반영(sound-simple): 채택 7키(`tell_melee`·`tell_ranged`·`tell_boss`·`tell_grab`·`druid_erupt`·`druid_sink`·`druid_tide`)를 `sfx/tell/`·`sfx/boss/`로 복사, `game.html`에 `_sampleFiles` 7키·`_sfxPri`(tell_*=TELL·druid_*=SKILL)·헬퍼 `_playTell`(120ms 쿨다운·화면 밖 제외)·`_bossTellSfx`·`_playDruidSfx`, 연결 = `updateE` windup 진입·`_emitEnemyShot` 경고·`_bossStartPattern` 내 `SFX.charge()` 19곳(드루이드일 때만 `tell_boss`, 잡기는 `tell_grab`)·`bossDruidUnder` 분출·`tideWave`·`_druidSinkStart`. 웹에 장면 없는 4키는 미반영. `6사운드디자인.md` 키 표 갱신. 헤드리스 검증 통과(상세 6사운드디자인.md). 음량은 1차값 |
| 2026-10-27 | §6.5 트랙 C Unity 전달(sound-simple): 채택 11키 mp3 + `RM1_AUDIO_KEYS.json`(키·용도·믹서 그룹·`_SFX_PRI` 분류·공간음·시작 음량·쿨다운)을 브랜치 `claude/unity-pc-sound-rm1-20261027`(origin/unity/main `cfc5a0957` 기준)의 `unity/Assets/Exoduser/Resources/Audio/RM1/`에 커밋 `48fdc2e29`, 브랜치만 push(unity/main 병합 안 함, 코드 변경 없음, `.meta`는 Unity가 임포트 때 생성). `amb_toxic_river`는 s2 v1 가공본에 등전력 크로스페이드 1.5초(루프 6.5초)로 이음매 RMS 차 3.7→0.4dB·샘플 점프 0.0001, 게인·음색 변경 없음(`_analysis/rm1_river_loop.py`, `_preview_s2/amb_toxic_river_loop.mp3`). 웹은 DEMO·EA 동기화 완료(`game.html`·`gamedemo.html` 동일 패치 + sfx 7개) |
| 2026-10-28 | 유니티 총괄 공지: 트랙 A(A1~A8) 구현 = RM-0 세션 `local_7bb6eaac`, 브랜치 `claude/unity-pc-sound-rm1-20261027`. §6.6 드루이드 기술 12종 → 소리 키 표·3차 대기 키 임시값·Receipt/녹음 제출 기준 작성, RM-0 세션에 전달 |
| 2026-10-28 | 유니티 총괄 공지: UI 세션이 E 마법 예외 해소용으로 `fireball`을 Unity에 넣음(unity/main `40256751b`). §6.6에 트랙 A 편입 기준(SKILL·`SFX/Skill`·2D·.9/rate .7±.1) 추가, RM-0 세션에 전달 |
| 2026-10-28 | 트랙 A 1차 제출(RM-0, `5797c22fb`) 판정 §6.7: Receipt 기능 PASS(§6.6 대조 어긋남 0·겹침 0, 기술 11 미검증), 수치 조건부(R2 피크 −0.23dBFS·덕킹 깊이·그룹 음량 미측정), 귀 판정은 사용자 청음 대기. RM-0에 2차 지시 5건 |
| 2026-10-28 | 사용자 청음 "메아리같이 들린다" → 원인 후보 3건(구르기 발소리 2개 같은 frame·플레이어 피격음 0.13초 3연속·host 이벤트 시간축 어긋남)+null test를 RM-0에 우선 지시(§6.7) |
| 2026-10-28 | 사용자 "BGM 포함 전부 메아리" → 녹음 BGM이 0.4초마다 원본 앞부분으로 되돌아감을 원본 대조로 확인. 1차 녹음 무효, RM-0 최우선 지시(런타임/녹음 도구 원인 판별·BGM 연속성 r≥0.9 확인 후 재녹음) |
| 2026-10-28 | 트랙 A 2차 제출(`5abee7623`) 판정: BGM 0.4초 반복·구르기 발소리 동시 재생 미수정으로 귀 판정 보류. 피크 제어·Ambience 덕킹·그룹 음량·기술 11·fireball은 수치 조건부 인정(재녹음 뒤 재측정), EnemyHit 덕킹 미확정 |
| 2026-10-28 | 트랙 A 재녹음(`4dd31bac3`) 판정: BGM 되감김(오프라인 녹음×스트리밍 임포트, BGM CompressedInMemory로 변경)·메아리 3건 수정을 원본 대조로 재확인, 수치 PASS(EnemyHit 덕킹만 미확정). 1·2차 녹음 무효. 사용자 청음 요청 |
| 2026-10-28 | 트랙 A 최종 제출(`0b7576ec1`, submit5): 중복 차단 Core 틱 기준으로 결정화, EnemyHit 덕킹 −4.18dB로 확정, 피크 −3.9dBFS. 총괄 재확인 PASS, 청음 페이지 교체 |
