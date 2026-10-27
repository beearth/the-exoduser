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
