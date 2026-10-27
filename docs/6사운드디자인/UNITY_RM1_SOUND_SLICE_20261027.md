# RM-1 사운드 — 1-1 리모델링 슬라이스 Unity 사운드 (2026-10-27 사운드 총괄)

근거: CTO 지시(2026-10-27, 사용자 원문 "이식작업은 대충 된거같으니까 유니티 리모델링 작업들어간다 오늘부터"). 첫 목표는 1-1 리모델링 슬라이스, 즉 맵 RM-1(`docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md`)과 다크드루이드 리모델링입니다. 사운드 총괄이 맡는 범위는 아래 네 가지입니다.
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

- 오디오 카테고리는 웹 `_SFX_PRI`를 따릅니다(`TELL:12, SKILL:10, VOICE:9, PLAYER_HIT:8, DEATH:4, STEP:3, HIT:2, PROJ:1, AMB:0`). `NativeFeedbackAudio`의 우선순위 정수(지금은 10/2)를 이 표로 넓힙니다.
- 소리를 낼 지점에 Unity 시뮬레이션 이벤트가 없으면 Core에 `FeedbackEvent` 큐잉 한 줄만 추가합니다. 시뮬레이션 상태는 바꾸지 않으며, 기존 oracle 결과가 같아야 합니다.
- 브랜치는 `claude/unity-pc-sound-rm1-20261027`입니다(origin/unity/main 기준 worktree `G:\exoduser-wt\`). 병합은 PC 관례대로 origin/unity/main을 브랜치에 merge한 뒤 비강제로 unity/main에 반영합니다. main에는 넣지 않습니다.

### 트랙 B — 새 후보 생성 (SFX Forge·ElevenLabs, 키마다 3개 → 총괄 판정 → 사용자 청음)
| 키 | 용도 | 카테고리·길이 | 프롬프트 요지(영문으로 생성) |
|---|---|---|---|
| `tell_melee` | 일반 근접몹 `windup` 진입(AD3 2단계) | hit, 0.35s | short low breathy swell, creature inhale and leather creak before a strike, no high tones |
| `tell_ranged` | 원거리 60f 공격링 시작(AD3 2단계) | skill, 0.6s | taut bowstring and bone scrape tension rising, brief bright attack only, dry |
| `tell_boss` | 보스 전조. `SFX.charge()` 대체 후보, 드루이드 전 패턴 공통 | skill, 0.9s | deep rising sub swell with rotten wood creak and root tearing, ominous build, cut tail short |
| `roll_body` | 전사 구르기 | hit, 0.45s | armored body roll on damp forest soil, cloth and leather whoosh then dull earth thud, mail jingle minimal |
| `druid_burrow` | 드루이드 굴파기 진입(`bossDruidUnder`) | skill, 0.9s | heavy body sinking into wet rotten earth, roots snapping, soil collapse rumble |
| `druid_erupt` | 드루이드 분출(`bossDruidErupt`) | skill, 0.8s | violent eruption from underground, dirt and roots bursting upward, low impact boom, debris patter |
| `druid_sink` | 1-1 마지막 사망 침강 도주(1.1s 시트 + 0.3s 유지 + 0.3s 페이드) | skill, 1.7s | wounded creature slowly sinking into swamp soil, wet suction, roots closing over, fading rumble, no scream |

- 모든 프롬프트에 붙이는 공통 금지 조건: CH1 규칙(불씨·차임 금지, 높은 순음 금지), voice/music/melody 금지.
- 출력 위치는 `G:\exoduser-wt\_out\sfx_forge\` staging입니다. 청음 페이지는 기존 `review_20261026.html` 형식에 **RM-1 묶음**으로 추가합니다. 파형·스펙트럼 시트는 `_analysis/sheet_rm1_*.png`에 둡니다.
- 판정 기준: 길이 범위, 6kHz 이상 에너지가 어택에만 있는지, 피크 −1dBTP 이하, 무음 꼬리 정리.

### 트랙 C — 채택 반영 (사용자 청음 뒤)
- 웹: AD3 2단계(예고음 3키 연결, 같은 키 120ms 쿨다운, 화면 밖 몹 제외), 구르기 소리 교체, 드루이드 굴파기·분출·침강 소리 연결
- Unity: 같은 키를 트랙 A 구조에 등록
- DEMO·EA 동기화(CLAUDE.md 배포 명령)

## 3. 완료 조건 (슬라이스)
- 기능: Unity 1-1 한 판(START → R2 전투 → 드루이드 → 침강)에서 위 키가 웹과 같은 시점에 나는 것을 수신 로그(Receipt keys)로 확인
- 귀: 녹음 1개(약 60초)를 사운드 총괄이 듣고 판정. 예고음이 혼전에서 묻히지 않는지, 환경음이 BGM을 덮지 않는지 확인
- 디자인 7장 규칙 위반 0

## 4. 기록
| 날짜 | 내용 |
|---|---|
| 2026-10-27 | CTO 지시로 착수. 현황 조사(Unity = 게임 안 BGM·환경음·적 피격·구르기·드루이드 소리 없음), 트랙 A·B·C 결정. 트랙 B(7키×3개)를 먼저 sound-simple에 배정하고, 이어서 트랙 A |
