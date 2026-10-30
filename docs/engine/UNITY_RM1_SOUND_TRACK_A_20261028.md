# Unity RM-1 사운드 트랙 A 구현 (A1~A8) — 2026-10-28

명세·판정 기준: main `docs/6사운드디자인/UNITY_RM1_SOUND_SLICE_20261027.md` §2 트랙 A·§6.6 (사운드 총괄). 브랜치 `claude/unity-pc-sound-rm1-20261027` (채택 11키 `48fdc2e29` 위에 origin/unity/main `b280ddf61`을 merge한 뒤 쌓음). Core 규칙: 시뮬레이션 상태·난수를 바꾸지 않고 `FeedbackEvent` 큐잉만 추가했다.

## 1. 믹서 `Resources/Audio/Exoduser.mixer`

| 항목 | 값 |
|---|---|
| 그룹 | `Master` > `Music` · `Ambience` · `SFX`; `SFX` > `Tell` `PlayerHit` `Skill` `Voice` `EnemyHit` `Death` `Step` `UI` |
| exposed | `SfxVol`(SFX 그룹 볼륨, dB = 20log10(설정%/100)) · `MusicVol`(Music 그룹, dB = 20log10(설정%/60)) |
| 스냅샷 | `Explore`(기본) · `Boss`(`Ambience` −8 dB). 보스 BGM 키(`boss`)가 되면 0.5초 전환 |
| 덕킹 | `Tell` 그룹에 Send 2개(레벨 0 dB) → `EnemyHit`·`Ambience` 그룹의 Duck Volume. 임계 −20 dB · ratio 1.5(150 %) · attack 10 ms · release 250 ms · knee 0 (명세의 −4 dB는 예고음 레벨 약 13 dB 초과 기준 근사값, **실제 덕킹 깊이는 아직 측정하지 않음**) |
| 숲 바닥음 음량 | `Ambience`는 `SfxVol`과 묶지 않는다(Boss 스냅샷 −8 dB와 충돌). 음원 볼륨에 설정 SFX%를 직접 곱한다 |

빌더: `Editor/Rm1SoundMixerBuilder.cs` (`Build` → 에셋 생성, `ConfigureDuck` → Duck/Send 수치. 내부 API라 리플렉션). 에셋은 커밋되어 있으므로 다시 돌릴 필요 없음(이미 있으면 `Build`가 거부).

## 2. 코드 구조

| 파일 | 역할 |
|---|---|
| `Runtime/NativeAudioMixer.cs` | 믹서 로드·그룹 조회·설정 음량·스냅샷 전환 |
| `Runtime/NativeFeedbackAudio.cs` | 보이스 관리(48 한도·우선순위 퇴출 유지)에 믹서 그룹·`_SFX_PRI` 정수·공간음 추가. 적 피격/치명타/사망, 보스 피격/사망, 구르기, 논리 키(예고음·드루이드) 처리, Receipt 로그 |
| `Runtime/NativeGameMusic.cs` | A1 BGM 버스(`hell1`→`boss`→`victory`, `death`) + A2 숲 바닥음(`hell1`일 때만, 페이드 0.8초) |
| `Runtime/NativeAmbientSources.cs` | A8 3D 환경 소스(강 12 m 간격 루프, 늪 기포 2~6초) |
| `Runtime/NativeBossSounds.cs` | 보스 포효(웹 `_BOSS_SFX[0].howl`) |
| `Runtime/NativeEnemySfxTables.cs` | 웹 `_DEATH_VARIANTS` 중 1-1 etype가 닿는 묶음(웹 소스에서 생성) |
| `Runtime/Core/EnemySoundTables.cs` | 웹 `_HUMANOID_ET`… 8집합 + `_hitSfxForEtype` + `_deathSfxKey` 분류 |
| `Editor/SourceAudioImporter.cs` | `Audio/Bgm/`만 스트리밍·MP3. 나머지는 기존대로 PCM |

### Core에 추가한 이벤트 (모두 알림만, 난수 없음)

| 종류 | 위치 | 비고 |
|---|---|---|
| `EnemyHit` / `BossHit` | `hurtE` 컨텍스트의 `PlaySample`/`HitSfxForEtype` 연결 | 웹 `_hitSfxCd` 8f 쿨다운, 변형 선택은 어댑터 |
| `EnemyCrit` | `EnemyHurtContext.OnCrit` | `crit_heavy` .45, 12f 쿨다운 |
| `EnemyDeath` / `BossDeath` | `KillEnemy` | 사망 묶음·버스트는 어댑터 |
| `Roll` | `StartRollAngle` | 임시 `footstep`(.55, 1.15±.1) + `footstep2`(.5, +80 ms) |
| 논리 키 `tell_melee` | 일반몹 `windup` 진입(`UpdateEnemyBody`) | AD3 2단계 |
| 논리 키 `tell_ranged` | 원거리 60f 공격링 시작(`Shot` 경고 생성·폴백 링) | 〃 |
| 드루이드 텔레그래프 | `DruidBoss.StartPattern` 첫 진입(`RmTell`) + 슬래시 2·3타 + 분출·해일 고리·박동 | §6.6 표 그대로. `IBossHost.Sound`(기본 구현 빈 메서드) |
| P1 진입 | `StageFlow` BossIntro → `ScheduleDruidIntroSounds` | 지팡이 3번(24f 간격) → 뿌리 기둥 |
| P2·P3 진입 / 침강 | `Simulation.DruidRemodel` | `druid_root_pierce` / `druid_sink` |

### 미채택 키의 임시 처리

| 논리 키 | 임시 처리 |
|---|---|
| `tell_parry` | `tell_melee` 파일 |
| `druid_staff_tap` · `druid_root_pierce` | 비움 — Receipt에 "no file yet"으로 한 줄 찍음 |
| `roll_body` | `footstep`·`footstep2` |

`NativeFeedbackAudio.LogicalFiles`의 한 줄을 바꾸면 채택본이 들어간다.

`druid_burrow`는 사용자 3차 선택본을 연결해 임시 `tell_boss` 대체를 해제했다(§6.6).

### 규칙 구현

- 예고음: 같은 키 120 ms(8틱) 안 재발 금지, 동시에 2개 초과 금지, 화면 밖 몹 제외(`OnScreen`), 우선순위 12.
- 공간음: 적 피격·예고·사망은 `spatialBlend` 0.5 + 거리 감쇠 없음, 플레이어 소리·BGM·UI는 2D, A8은 `spatialBlend` 1 · Logarithmic · 4~30 m · `Ambience`. `AudioListener`는 플레이어 위치(`ListenerAt`).
- 시작 음량은 `RM1_AUDIO_KEYS.json`·웹 값. 최종 음량은 녹음을 듣고 정한다.

## 3. 제출 방법 (Receipt·녹음)

`Tools/rm1-sound-timeline` — 실제 `Simulation`(적 AI 켬, `DruidRemodel` 켬, 아레나 진입은 `StageFlow`)을 돌려 Core가 낸 소리 이벤트를 `timeline-r2.json`(일반 전투 30초)·`timeline-druid.json`(아레나 진입 → P1~P3 → 침강, 6805틱)로 쓴다.
`Editor/Rm1SoundCapture.cs` — 그 타임라인을 **실제 어댑터·믹서**로 재생하며 `AudioRenderer`로 믹스를 녹음한다(`-executeMethod Exoduser.UnityPort.Editor.Rm1SoundCapture.RunR2|RunDruid -timeline <json> -output <prefix>`). 출력 `<prefix>.wav`, `<prefix>.receipt.txt`.

한계:
- NativeGame 전체를 띄운 한 판이 아니라 **Core 타임라인 재생**이다(맵·렌더 없음). 소리를 내는 코드(`NativeFeedbackAudio`·`NativeGameMusic`·`NativeAmbientSources`·믹서)는 게임과 같은 것을 쓴다.
- 이벤트 사이 3초 넘는 간격은 3초로 줄였다(Receipt의 frame은 원래 틱).
- A8의 강·늪 위치는 맵 RM-1 씬이 아직 unity/main에 없어 **시험용 좌표**다(`AddRiver`/`AddSwamp`로 맵이 넘겨주면 됨).
- 드루이드 페이즈는 디버그 이동이 아니라 실제 전투 진행(스크립트 플레이어가 라이프를 깎음)이다.
- 기존 오라클: 적 피격 CX-04a는 변경 전후 동일(둘 다 4796 실패 = 기존 상태), 드루이드 리모델링 테스트 229/0 통과. 기검참 feedback-oracle은 변경 전에도 컴파일되지 않는 상태(Simulation 일부 파일 미포함).

## 4. 기록

| 날짜 | 내용 |
|---|---|
| 2026-10-28 | 트랙 A A1~A8 구현·Receipt/녹음 하니스. 믹서 에셋 생성(Duck 수치는 `ConfigureDuck`로 설정·읽기 확인). 덕킹 깊이는 미측정 |

## 5. 2차 제출 측정 (사운드 총괄 §6.7 요청, 2026-10-28)

| 항목 | 설정 | 측정(R2 타임라인, 30초, E 마법 3회 포함) |
|---|---|---|
| 피크 제어 (§6에서 2단으로 바뀜) | `SFX` 그룹 페이더 뒤 Compressor: 임계 −9.2 dB · attack 10 ms · release 40 ms · makeup 0 (Unity 압축기는 ratio가 없고 임계 위에서 attack/release로만 움직임). 임계는 `SfxCompThreshold`로 노출 | 최종 믹스 피크 **−4.44 dBFS**(0.600) · 압축기 끈 기준 대비 전체 RMS 변화 **−0.79 dB**. 같은 설정으로 세 번 잰 범위: 피크 −3.6~−4.4 dBFS, RMS 변화 −0.6~−1.0 dB(실행마다 보이스 겹침이 조금 달라 흔들림) |
| 덕킹 | 임계 −45 dB · ratio 1.33(133 %) · attack 10 ms · release 250 ms. `Tell`의 Send는 **페이더 앞(pre-fader)**, 레벨 0 dB. 임계 −20 dB일 때는 사이드체인 레벨이 낮아 덕킹이 0 dB였음 | Ambience: Explore **−4.07 dB**, Boss **−4.18 dB**(예고 6회, 0.3초 창 RMS 비교, 같은 타임라인에서 Tell 이벤트만 뺀 녹음과 대조). EnemyHit: 같은 이펙트 설정이지만 A/B 녹음 내용이 예고 구간 밖에서도 달라(보이스 배정 차이로 추정) 직접 수치가 −5~−10 dB로 흔들려 **신뢰 못 함** |
| 그룹 RMS (1초 창 중앙값 / 전체, dBFS) | 분리 녹음(다른 그룹 음원 mute) | Music Explore −30.5 / −29.2 · Music Boss(boss 트랙) −27.8 / −24.0 · Ambience Explore −38.7 / −38.7 · Ambience Boss −46.6 / −45.7 · SFX Explore −23.3 / −22.6 · SFX Boss −22.8 / −22.5 |
| Ambience − Music (Explore, 중앙값) | | **−8.2 dB** (기준 ≤ −6) |
| Ambience Boss − Explore | 스냅샷 −8 dB | 중앙값 **−7.84 dB**, 전체 RMS −7.06 dB. 1초 창별로는 거의 전부 −8.0 dB이고 예고음이 겹친 4개 창에서만 벗어남(분리 녹음에서 Tell 음원을 켜 둔 영향으로 추정) |
| 기술 11(포자 꼬투리) | `seekerMines`는 P3 목록에 있음 | 이번 드루이드 타임라인(시드 13: 12기술 전부 등장)에 텔레그래프 1회 Receipt에 있음(`#11 seekerMines telegraph`, frame 6334, 녹음 106.8초) |

주의: 덕킹 임계는 Tell 음원의 사이드체인 레벨(−7 dB 근처에서 시작)에 의존하므로, 예고음 시작 음량이 바뀌면 임계·ratio를 다시 맞춰야 한다(`Rm1SoundMixerBuilder.ConfigureDuck -duckThr -duckRatio -compThr ...`).

## 6. 귀 판정 대응 수정 (사운드 총괄 §6.7 우선 지시, 2026-10-28)

사용자가 첫 녹음을 듣고 "메아리"라고 했다. 원인을 하나씩 확인했다.

| # | 원인 | 위치 | 조치 |
|---|---|---|---|
| 1 | **BGM이 약 0.4초마다 되감김** — 녹음 속 같은 0.4초 조각 반복(rec 4.4·4.8·5.2 s가 모두 원본 0.303 s와 r=0.75, 자기상관 400 ms 봉우리) | **하니스(AudioRenderer 오프라인 녹음) × 스트리밍 클립의 상호작용**. 런타임 `NativeGameMusic`은 재생 시작(`Stop`→`Play`)을 키가 바뀔 때 한 번만 하며 매 프레임 되풀이하지 않는다(코드 확인). 다만 `Audio/Bgm/`을 스트리밍으로 임포트한 것이 원인을 만들었으므로 임포트를 `CompressedInMemory`(MP3)로 바꿔 실제 게임에서도 스트리밍 스레드 의존을 없앴다 | `SourceAudioImporter` v3. 확인: BGM만 10초 녹음해 원본(ffmpeg 디코드)과 1~2초 간격 100 ms 조각 대조 → 모든 조각이 일정한 오프셋(0.475 s)으로 원본 t−오프셋과 일치(r=1.00) |
| 2 | 구르기 소리 둘이 같은 frame에 겹침 | `Simulation.Roll.cs`가 `footstep2`를 시작 때 같이 냈음 | 웹대로 분리: 시작 frame에 `footstep`(.55, 1.15±.1), 끝(`FinishRoll`) frame에 `footstep2`(.5, 1±.1) (`Roll` 이벤트 `Step` 0/1). Receipt 예: frame 121 start → frame 138 end (rec 4.02 → 4.30 s) |
| 3 | 플레이어 피격음이 0.13초 안에 3개 | Core는 피해 1회마다 1번 큐잉하지만 피격이 연달아 들어오면 그대로 재생 | 어댑터에서 Core 100 ms(6틱) 안에 또 오는 `player_hit*`는 1번만(Receipt에 `DROPPED another player hit within 100 ms`). 새 타임라인에서 재생된 쌍 중 6틱 미만 간격 0 |
| 4 | 같은 frame인데 rec가 다름 | 조각난 Sample 이벤트의 `frame=`을 어댑터의 직전 틱(`CurrentTick`)으로 찍던 **Receipt 표기 오류**(소리 시각이 아니라 표기). `Make(…, e)`로 이벤트 자신의 틱을 쓰도록 고침 | Receipt 끝에 `TIME AXIS CHECK`(같은 Core frame의 소리가 서로 다른 rec 시각에 시작한 frame 수) 추가 — R2·드루이드 모두 0 |
| 5 | 파이프라인에 소리가 두 번 재생되는 경로가 있는지 | — | null test(`Rm1SoundNullTest`): 키를 앞뒤 1초 무음과 함께 어댑터+믹서로 녹음, 원본 디코드와 비교. 아래 표 |

### null test 결과 (`Tools`에 스크립트 없음, 산출물 `null_test.txt`)

| 키 | 믹서 통과 이득 | 잔차 RMS(녹음 대비) | 원본 꼬리 / 녹음 꼬리(−60 dBFS) | 두 번째 사본(상대 상관) |
|---|---|---|---|---|
| tell_grab | −3.6 dB | −20.9 dB | 0.86 s / 0.86 s | 0.12 |
| tell_boss | −3.0 dB | −54.5 dB | 0.75 s / 0.75 s | 0.15 |
| boss_hit | +0.4 dB | −22.6 dB | 1.05 s / 1.05 s | 0.19 |
| player_hit1 | 0.0 dB | −240 dB (완전 일치) | 0.98 s / 0.98 s | 0.10 |
| footstep | −3.0 dB | −46.4 dB | 0.34 s / 0.34 s | 0.15 |

해석: 모노 클립은 `spatialBlend` .5에서 등전력 패닝으로 −3 dB(정상). 잔차가 큰 키(tell_grab −21, boss_hit −23)는 44.1 kHz→48 kHz 재샘플러 차이와 공간화 때문이고 꼬리 길이가 원본과 같으며 다른 시각에 두 번째 사본(상관 > 0.2)이 없어 리버브·이중 재생은 없다. 시작 지연은 2.7~24 ms(오디오 버퍼 정렬).

### 피크 제어 (2단)

SFX 단계 하나로는 R2 피크와 전체 RMS 변화(≤ 1 dB)를 함께 맞추지 못했다(임계 −11 dB → 피크 −3.3 dBFS이지만 RMS −1.3 dB). `Master` 그룹에 빠른 Compressor를 한 단 더 두어(임계 −8 dB · attack 10 ms · release 10 ms, 노출 `MasterCompThreshold`) 첫 단이 놓친 피크만 잡도록 했다.

| 설정 | R2 피크 | R2 RMS 변화(압축기 끈 기준) | 드루이드 피크 / RMS 변화 |
|---|---|---|---|
| SFX −6 dB / 40 ms + Master −8 dB / 10 ms (최종 기본값) | **−3.92 dBFS** | **−0.82 dB** | −3.95 dBFS / −0.18 dB |

BGM 되감김이 사라져 음악이 제대로 깔려서 이 표의 그룹 RMS는 §5와 다르다(1초 창 중앙값 / 전체, dBFS): Music Explore −29.7 / −27.1 · Music Boss −23.3 / −22.4 · Ambience Explore −38.7 / −38.7 · Ambience Boss −46.6 / −45.7 · SFX Explore −24.0 / −23.0 · SFX Boss −23.9 / −22.9. Ambience − Music(Explore, 중앙값) **−9.1 dB**. Ambience Boss − Explore 중앙값 −7.84 dB. 덕킹(Ambience, 예고 6회): Explore **−4.06 dB**, Boss **−3.68 dB**. EnemyHit 덕킹은 이번에는 다시 재지 않았다(A/B 녹음 내용 불일치로 §5와 같은 이유로 신뢰 못 함).

### 6.1 결정론 수정과 EnemyHit 덕킹 (같은 날 추가)

- 같은 키 30 ms 중복 차단이 `Time.realtimeSinceStartup`을 쓰고 있어 오프라인 녹음 속도에 따라 어느 소리가 걸러지는지가 실행마다 달랐다(A/B 녹음 내용 불일치의 원인). Core 틱(60/s)으로 바꿔 결정적으로 만들었다. 게임 안에서는 둘이 같은 33 ms이다.
- 그 뒤 A/B 녹음의 예고 구간 밖 에너지 비는 ±0.02 dB(같은 내용). 덕킹 깊이(에너지 가중, 예고 구간 0.05~0.45초): **EnemyHit Explore −4.18 dB**(5창), Ambience Explore −3.95 dB, Ambience Boss −4.17 dB. 목표 −4±1 dB 충족.
- 피크 제어 기본값을 SFX −6 dB / Master −8 dB로 정리(이전 −9.2 dB는 새 결정적 타임라인에서 RMS 변화가 −1.03 dB로 경계를 넘음).

### 6.2 드루이드 기준 녹음용 스크립트 플레이어 (SND-09 요청)

`Tools/rm1-sound-timeline` 드루이드 시나리오의 플레이어를 실제 플레이에 가깝게 바꿨다(같은 시드 13).
- 텔레그래프를 보고 판단: 보스가 Wind/Dive/Slash 상태에 들어가는 순간 85 %는 피하기로 정함(구르기 또는 패링 가능한 공격이면 45 %는 패링 시도), 15 %는 안 피함. 구르기는 타격 직전(남은 9틱)에 시작해 무적 14틱이 타격을 덮는다.
- 공격 리듬 22틱 간격(초당 약 2.7타). 소환된 졸개는 바로 처치. 맞으면 자리를 옮기고 60틱 무적(웹 한방캡과 같은 길이).
- 결과(이번 시드): 본 공격 53개 중 구르기 회피 36, 패링 시도 11, 안 피함 6. 플레이어 피격음은 1분당 약 20번(이전 스크립트 43번). 피한 공격 비율이 높은데도 피격음이 남는 것은 텔레그래프로 읽히지 않는 피해(독 웅덩이·투사체·장판 틱)가 계속 들어오기 때문이다 — 목표였던 "받은 공격의 약 30%"에는 미치지 못하고 약 65 % 수준이다.
- 패링 성공 7회(Receipt에 `PARRY` 줄). **Core는 패링 성공에 소리를 큐잉하지 않는다**(웹 `doParry`는 Q 패링이면 `q_parry`, 아니면 `sword_parry`+`sword_back`에 50 % 확률로 `voice_parry1~4`/`male_grunt`). 이 소리는 Unity에 아직 연결되어 있지 않다.
- 보스 피격음: `boss_hit`에 8틱 쿨다운을 어댑터에서도 명시했다. Core의 `hurtE` 컨텍스트가 이미 모든 적 피격에 같은 8틱 쿨다운을 공유하므로 이 규칙은 추가로 걸러내는 소리가 없다. 60초 창의 `boss_hit` 110번은 쿨다운이 아니라 플레이어 공격 리듬(22틱)이 낸 수이다.

### 6.3 패링 소리와 SND-09 드루이드 채택 11키 연결 (2026-10-28)

**패링 성공 소리(웹 `doParry`, game.html 38667):** Core `ApplyParrySuccess`가 `FeedbackKind.Parry`를 큐잉(`Step` 1 = Q 패링: `qParry || sBlock || peaceShield || SbParryT>0`, 상태·난수 변경 없음). 어댑터: Q 패링 `q_parry` .9(1±.08) / 그 외 `sword_parry` 1(1±.1) + `sword_back`·`sword_back2`·`sword_back3` 중 하나 .5(1.1±.1), 이어서 50 % `voice_parry1~4`(1±.03) 아니면 `male_grunt`(1±.15). 분류 SKILL/Skill(`q_parry`·`sword_parry`)·VOICE/Voice(`voice_*`·`male_grunt`)·HIT/PlayerHit(`sword_back*`), 2D. 파일은 웹 sfx에서 그대로(`voice_parry4`는 웹 표가 `voice_parry3.mp3`를 가리켜서 같은 파일).

**보스 피격 구조(`BossHitRequest`):** 변형 목록(`BossHitVariants`, 지금은 `boss_hit` 1개, 채택된 `druid_hit` 4개가 들어올 자리)을 무작위 순환하되 같은 변형 연속 금지, rate ±6 %, 연타 감쇠(앞 피격과 0.6초(36틱) 안이면 ×0.85씩, 바닥 ×0.55, 쉬면 원래대로), 어댑터의 `boss_hit` 8틱 쿨다운 명시. 지금은 `boss_hit`에 먼저 걸려 있다.

**SND-09 채택 11키(사용자 청음 2026-10-28, 가공본 `G:/exoduser-wt/_out/sfx_forge/` 기준, 경로는 `RM1_AUDIO_KEYS.json` `source`와 Receipt의 `(adopted …)`에 남음):**

| 키 | 채택본 | 트리거(Core 이벤트) | 그룹 | 시작 음량 |
|---|---|---|---|---|
| `druid_vo_pain` | `_preview_druid/druid_vo_pain_v2a_proc` | 보스가 HP 8 %를 잃을 때마다(`BossPainCheck`), 최소 3초 간격, 새 라이프 HP 회복 시 기준 갱신. rate ±5 % | Voice | .6 |
| `druid_vo_attack` | `…vo_attack_v2a_proc` | 내려찍기(`bossSlam` 진입)·돌진(`bossCharge` 진입)·해일 고리 솟음, 직전 기술이 같으면 생략(`PrevMove`). rate ±5 % | Voice | .7 |
| `druid_vo_phase` | `…vo_phase_v2c_proc` | P1 인트로(호스트 `NativeBossSounds.Howl`, `boss_howl` 대체)·P2·P3 시작(`BeginLife`) | Voice | 1.0 |
| `druid_vo_fall` | `…vo_fall_v2a_proc` | P1·P2 끝 쓰러질 때(`RemodelZeroHp`), `druid_root_pierce`는 40틱 뒤로 미룸 | Voice | .7 |
| `druid_vo_last` | `…vo_last_v2a_proc` | `BossDeath`(마지막 침강 직전), `death_boss` 대체 | Voice | .75 |
| `druid_drag` | `…drag_v2a_proc` | 기술 3 돌진 시작 1회 | Skill | .6 |
| `druid_fissure` | `…fissure_v2b_proc` | 기술 4 균열이 달려가는 순간 | Skill | .6 |
| `druid_pod` | `…pod_v2d_proc` | 기술 11 꼬투리 배치 | Skill | .5 |
| `druid_summon` | `…summon_v2c_proc` | 기술 9 졸개가 나오는 순간 | Skill | .6 |
| `amb_druid_arena` | `…amb_druid_arena_v2d_proc` | 보스 BGM 동안 숲 바닥음 대신 루프(`NativeGameMusic`, 같은 .15×SFX, Boss 스냅샷 −8 dB 적용) | Ambience | .15 |
| `bgm_druid_boss` | `music/druid_bgm_b.mp3` | 보스 아레나 BGM. 게인 −3.4 dB 후 192k mp3 재인코딩(원본 피크 −0.8 → −4.4 dBFS), `CompressedInMemory` | Music | .6 |

음량은 임시 시작값(명세는 `druid_hit` .3만 지정)이고 청음 뒤 조정한다. 다시 만드는 5키(`druid_hit`·`druid_hit_heavy`·`druid_whip`·`druid_slam`·`druid_spore`)는 지금 소리 그대로(`boss_hit`) 두었다.

**확인:** Unity 컴파일 오류 0. 같은 시드 13 드루이드 타임라인 Receipt(녹음 v4 아님): `druid_vo_pain` 25 · `druid_vo_attack` 17 · `druid_vo_phase` 3 · `druid_vo_fall` 2 · `druid_vo_last` 1 · `druid_drag` 8 · `druid_fissure` 5 · `druid_pod` 1 · `druid_summon` 0(이 시드 전투에서 기술 9 미사용), 패링 소리 14줄(성공 7회 × 2). 녹음의 보스 구간 BGM은 새 `bgm_druid_boss`와 일치(r=0.99, 일정 오프셋), 옛 `boss.mp3`와는 불일치.

### 6.4 sound-lead SND-09 2차 채택 3키와 sink 이동 (2026-10-28)

| 키 | 파일(`Audio/RM1/`) | 채택본 | 연결 | 시작 음량 |
|---|---|---|---|---|
| `druid_hit` | `druid_hit.mp3` | `_preview_druid2/druid_hit_v3d_proc.mp3` | 보스 피격(`BossHit`)에서 `boss_hit` 대신. 변형 1개(a~c 사용 안 함), rate ±6 %(중심 1.0), 연타 감쇠(0.6초 안 ×0.85, 바닥 ×0.55), 8틱 쿨다운 그대로 | Core 전달값 .3 |
| `druid_hit_heavy` | `druid_hit_heavy.mp3` | `_preview_druid2/druid_hit_heavy_v3d_proc.mp3` | 보스에 대한 치명타(`EnemyCrit`)에서 `crit_heavy` 대신, 쿨다운 30틱, rate ±5 %. 휘청임(poise) 알림은 Core에 없어 연결하지 않음 | .6 |
| `druid_whip` | `druid_whip.mp3` | `_preview_druid2/druid_whip_v3a_proc.mp3` | 기술 1(slashCombo) 1·2·3타 모두(사운드 총괄 정정): Core의 각 타 텔레그래프 알림(`#1 slashCombo telegraph`, `… hit 2 telegraph`, `… hit 3 telegraph`)을 신호로, 타격 시점에 재생. 2·3타는 텔레그래프 + SlashLinkTele 24 + 스윙 확인 2 = 26틱 뒤(정확), 1타는 기술 데이터 텔레그래프 32 + 2 = 34틱 뒤(Core가 위상 보정 길이를 알리지 않아 추정). 같은 파일, rate 1타 .97 · 2타 1.00 · 3타 1.06 (±3 %), Skill 그룹 | .55 |

- `druid_slam`·`druid_spore`는 3차 제작 중이라 소리를 그대로 둔다. 키별 음량은 임시값이고 실제 플레이 판정 때 조정한다.
- 변경은 어댑터(`NativeFeedbackAudio`)와 `RM1_AUDIO_KEYS.json`·mp3뿐이고 Core는 바뀌지 않았다.
- `druid_sink`: Core 알림은 어댑터가 무시하고, `NativeGame.BossSinkDraw`가 침강 구멍이 보이는 첫 틱(`SinkHoleTick` = 37)에 `PlaySinkHole`을 호출한다. 녹음 하니스는 `BossDeath` 틱 + 37에 같은 행을 넣는다(`051af9033`).
- 확인 상태: Roslyn(Core + 어댑터) 오류 0. Unity 플레이어 빌드 오류 0은 **빌드 미확인**.

- 3차 채택 `druid_spore`: `Audio/RM1/druid_spore.mp3` ← `_preview_r3/druid_spore_r3a_proc.mp3`(웹 `pickup_rummage2.mp3` 가공본). 기술 5 독포자 부채(fan): Core의 `#5 fan telegraph` 알림을 신호로 발사 시점(텔레그래프 38틱 뒤)에 1회, rate ±5 %, Skill 그룹, 시작 음량 .55.
- `druid_spore` 원본이 웹에서는 아이템 줍기 소리다. Unity에 줍기 소리를 넣을 때 같은 파일이 들어가면 사운드 총괄에 알린다. `druid_slam`은 가공본을 다시 고르는 중이라 소리를 그대로 둔다.
- 4차 `druid_slam`(`Audio/RM1/druid_slam.mp3` ← `_preview_r4/druid_slam_r4e2_proc.mp3`, 3차 선택 r3d에 음량 상향·중간 메아리 약 0.22초를 반영한 추천안 e2, **사용자 컨펌 전 선반영(pick_r4)** — 다른 후보를 고르면 파일 교체 커밋 하나만 바꾼다): 거름 내려찍기(기술 2) 착지 순간 1회. Core의 `#2 slam telegraph` 알림을 신호로 텔레그래프(기술 데이터 48) + SlamActive(6) = 54틱 뒤에 재생, Skill 그룹, 음량 .7, rate ±4 %.

### 6.5 신규 오디오 메타 추적 (2026-10-28)

`acf2fb948`에는 아래 채택 MP3의 Unity `.meta` 5개가 추적되지 않았다. 전용 브랜치에서 기존 RM1 오디오와 동일한 `AudioImporter` 설정으로 메타를 추가했다. 소리 파일·재생 키·음량·Core 규칙은 바꾸지 않았다. `druid_slam`의 e2는 위 §6.4대로 사용자 청음 확인 전 선반영 상태다.

| 파일 | 메타 GUID | 적용 위치 |
|---|---|---|
| `druid_hit.mp3` | `7b3d4c810eaa4a69a4d3a58b8b1345f0` | `Audio/RM1` 보스 일반 피격 |
| `druid_hit_heavy.mp3` | `87fd6f8327224c3b89dfeb94624df2f5` | `Audio/RM1` 보스 치명타 |
| `druid_slam.mp3` | `309cae39b15a49bca3b5966814f8d7ab` | `Audio/RM1` 기술 2 착지 |
| `druid_spore.mp3` | `199527322ffb4f959a119648d81e5d4a` | `Audio/RM1` 기술 5 발사 |
| `druid_whip.mp3` | `6eb1775ab7c04ed7ad61a518861a10fe` | `Audio/RM1` 기술 1 3타 |

### 6.6 드루이드 잠행 전조 채택본 연결 (2026-10-28)

`G:/exoduser-wt/_out/sfx_forge/picks_rm1.json`에 기록된 사용자 3차 선택 `_preview_s3/druid_burrow_s3d_proc.mp3`를 `Audio/RM1/druid_burrow.mp3`로 동일 바이트 복사했다. `NativeFeedbackAudio`의 임시 `tell_boss` 매핑을 제거하고 `burrowStrike`의 `druid_burrow` 알림을 해당 파일에 연결했다. 시작 음량 .45, `SFX/Skill`, 우선순위 10, 공간 혼합 .5·거리 감쇠 없음. Core와 발생 시점은 바꾸지 않았다. 파일 길이는 약 0.554초, 크기 10074바이트다. Unity 메타 GUID는 `dc99856a5cff4e75bd13dafc0d1237aa`다. 이 후보의 새 Unity 빌드·녹음·Player 청음은 아직 수행되지 않았다.

## AD2 ui_tab Runtime 인수 후보 — 2026-10-31

사용자 선택 r3c 동일byte(3386B/SHA3a693839af04190e6255f3098c92528d95812fa5b4a84e4be1a01a5bf66a1a4b)를 Audio/UI/ui_tab으로 추가했다. NativeFeedbackAudio는 Audio/UI도 로드하며 ui_tab을 UI/2D·우선순위10으로 명시한다. 이미 열린 다른 창으로 실제 전환 확정 후 PlayUiTab이 raw gain.22/pitch1/loopfalse로 즉시1회 재생한다. 최초열기·활성탭·거부·Layout/Repaint0, 기존SFX설정/믹서계약 유지. 전체branch에 중단3D가 있어 오디오 단일diff만 통합 가능하며 현재 순수입력 정식Unity/Player/동일M1/사용자청음은 미검증이다. 상세는 UNITY_UI_TAB_AUDIO_20261031.md.
