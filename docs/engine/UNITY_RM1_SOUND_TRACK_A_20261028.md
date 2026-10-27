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

### 3차 청음 대기 키 (파일 없음 처리)

| 논리 키 | 임시 처리 |
|---|---|
| `tell_parry` | `tell_melee` 파일 |
| `druid_burrow` | `tell_boss` 파일 |
| `druid_staff_tap` · `druid_root_pierce` | 비움 — Receipt에 "no file yet"으로 한 줄 찍음 |
| `roll_body` | `footstep`·`footstep2` |

`NativeFeedbackAudio.LogicalFiles`의 한 줄을 바꾸면 채택본이 들어간다.

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
