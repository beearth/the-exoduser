# 1-1 드루이드 v8.1 7기술 효과음 — G1 장면 목록 (사운드 총괄, 2026-11-04)

- 배정: CTO 11-04 순회 배정. 데모 v0 ② 보스전. 짝 문서는 임펙트 총괄의 [VFX G1 표](../5.1임펙트디자인/DRUID_V81_SKILL_VFX_G1_20261104.md)(unity/main `55cac6960`)다. 이 표는 같은 **예고 → 접점 → 본체 → 잔여** Core 틱에 소리를 맞춘다.
- 숫자의 정답은 Core다. 보스 아레나 브랜치(`codex/unity-boss-arena-20261103` `85a0c3557`)의 `DruidRemodelData.cs` RB1-7 값과 클립 연결([PREP §9.1](../engine/UNITY_BOSS_RIGPIXEL_DRUID_PREP_20261104.md))을 읽었다. Core가 바뀌면 이 표의 틱을 다시 계산하고, 소리 때문에 Core를 바꾸지 않는다.
- 이미 채택한 소리는 다시 만들지 않는다([SND-09](DRUID_BOSS_SOUND_REMAKE_20261028.md)): `druid_whip` v3a, `druid_slam` r4e2, `druid_drag` v2a, `druid_fissure` v2b, `druid_burrow` s3d, `druid_erupt`·`druid_heartbeat`(SND-08), 예고음 `tell_parry`(= `tell_melee`)·`tell_boss`·`tell_grab`, 목소리 `druid_vo_*`, 피격 `druid_hit`·`druid_hit_heavy`. 이 표는 **비어 있는 순간**만 채운다.

## 1. 공통 기준

### 1.1 성격·금지

드루이드는 썩은 숲의 늙은 사제다. 소리도 그 몸과 땅의 재질로만 만든다. 쓰는 재질은 썩은 나무, 젖은 흙, 뿌리, 껍질, 뼈 장식, 늪이다.

금지: 합성음, 전자음(신스 상승음·전자 휙·드론), 마법 차임, 금속 광택, 괴물 포효, 네온 느낌, 음악. 생성 문구 꼬리에 "organic and physical, no synth, no electronic, no magic chime, no music, no voice"를 넣는다.

### 1.2 레퍼런스 — 노레위(No Rest for the Wicked)의 무게감

보스 보드 §8.5.1의 공통점을 소리에 옮기면 다음 네 가지다.

| 원칙 | 소리로 |
|---|---|
| 무게 있는 예비동작 | 예고 동안은 작게 차오르는 소리(땅 들썩임·뿌리 삐걱)다. 접점보다 10dB 이상 작게 두고, 마지막 12틱(조준 고정)에서 시작한다 |
| 끝까지 가는 공격 | 접점은 짧고 두껍게 친다(앞 무음 0, 0.1초 안에 정점). 판정 틱과 ±2틱(33ms) 안에서 맞춘다 |
| 큰 동작 뒤 빈틈 | 접점 뒤에 흙 파편·먼지가 가라앉는 꼬리(0.6~1초)를 남겨, 회복 동안 "무거웠다"가 이어진다 |
| 신호 순서 | 귀로 읽히는 순서도 예고음 > 플레이어 피격 > 보스 본체다. 본체 소리가 예고음을 가리지 않게 같은 순간에는 겹치지 않는다(VFX §1.3과 같은 원칙) |

### 1.3 신호 (Core 무수정)

| 신호 | 얻는 곳 |
|---|---|
| Core가 직접 내는 소리 | `host.Sound` — 예고음(`TellKey`), `druid_vo_attack`(내려찍기·돌진 기합), `druid_drag`, `druid_fissure`, `druid_burrow`, `druid_erupt`, `druid_heartbeat` |
| 소리 코드가 시각을 계산하는 소리 | 예고 이벤트 + `DruidRemodelData` 틱(지금 `druid_whip`·`druid_slam`이 이 방식) |
| 사건 | `BossFx`(`wallSlam`·`druidAbsorb`·`druidHeartbeat`·`druidDust`·`druidRoots`), 균열 `Fissures[i].Exploded`, 보스 상태 `d.S`·`St2`·`SlashIdx`·`HbBeat`의 이전/지금 비교 — VFX `DruidSkillVfxView`와 같은 신호를 쓴다 |

## 2. 7기술 장면 목록

틱 0은 기술 시작(예고 시작)이다. "채택"은 지금 게임에 있는 소리, **R7**은 이번 청음 후보(새 키), "제안"은 시각만 옮기는 안이다.

### ① slashCombo — 가지 채찍 3연 (202틱)

| 틱 | 단계 | 소리 | 키 | 상태 | VFX 짝 |
|---:|---|---|---|---|---|
| 0 / 46 | 예고 1·2 | 근접 예고음 | `tell_parry` | 채택 | 무기 끝 섬광 |
| 38 / 74 | 발동 1·2 +2틱(판정) | 채찍 | `druid_whip` | 채택(rate .97/1.0) | 궤적 호 0.13초 |
| 82 | 예고 3 | 바닥 예고음(패링 불가) | `tell_boss` | 채택 | 부채꼴 데칼·구슬 빛 |
| 110 | 발동 3 +2틱 | 채찍 + **구슬 땅 치기** | `druid_whip`(1.06) + `druid_slash3_ground` | R7 | 코어 0.8H·흙 파편·먼지 0.5초 |

### ② slam — 거름 내려찍기 (134틱)

| 틱 | 단계 | 소리 | 키 | 상태 | VFX 짝 |
|---:|---|---|---|---|---|
| 0 | 예고 | 근접 예고음 | `tell_parry` | 채택 | 금 간 원 데칼 |
| 40 | 예고 마지막 12틱 | **땅이 들림** | `druid_slam_lift` | R7 | 흙 조각 들썩임 |
| 52 | 발동 0틱 | 기합 | `druid_vo_attack` | 채택 | 지팡이 촉 접지 |
| 54 | 발동 +2틱 | 내려찍기 착지 | `druid_slam` | 채택, **시각 제안 58 → 54** | 코어 1.2H 정점 |
| 56 | 착지 직후 | **흙 파편 떨어짐** | `druid_debris` | R7 | 흙 파편 10~14개·먼지 0.6~0.8초 |

시각 제안: 지금 `druid_slam`은 예고 + `SlamActive`(58틱 = 판정)에 난다. 화면 접점(코어 정점)은 발동 +2틱(54)이라 소리가 4틱(67ms) 늦다. 소리 코드의 지연만 `Tele + 2`로 바꾸는 안이다. 판정은 그대로 58이다.

### ③ charge — 뿌리 끌기 돌진 (최대 192틱)

| 틱 | 단계 | 소리 | 키 | 상태 | VFX 짝 |
|---:|---|---|---|---|---|
| 0 | 예고 | 근접 예고음 | `tell_parry` | 채택 | 직선 데칼 |
| 46 | 예고 마지막 12틱 | **뒷발 흙 걷어차기** | `druid_charge_kick` | R7 | 먼지 0.3초 |
| 58 | 돌진 시작 | 기합 + 뿌리 끌기 | `druid_vo_attack` + `druid_drag` | 채택 | 고랑 데칼·6틱마다 먼지 |
| 접촉 | 플레이어 접촉 | 플레이어 피격 | `player_hit*` | 채택(공용) | `CombatImpactView` |
| 98(벽) | `wallSlam`, 흔들림 25 | **벽·기둥 충돌** + 흙 파편 | `druid_wall_crash` + `druid_debris` | R7 | 코어 1.2H·파편 12개 반원 |

### ④ grab — 거름 거두기 (잡힘 264틱 / 빗나감 168틱)

| 틱 | 단계 | 소리 | 키 | 상태 | VFX 짝 |
|---:|---|---|---|---|---|
| 0 | 예고 | 잡기 예고음 | `tell_grab` | 채택 | 눈빛 2개·손 독기 |
| 68 / 78 | 뻗기 스텝 2회 | **무거운 걸음** | `druid_grab_step` | R7 | 발 디딤 흙먼지 |
| 84 | 잡힘(손 닿음) | **덩굴이 감음** | `druid_grab_bind` | R7 | 코어 0.5H·덩굴 3가닥 |
| 94~194 | 잡힘 120틱, 20틱마다 | **생명 흡수** | `druid_absorb` | R7 | `druidAbsorb` 호박 줄기 |
| 204 | 던지기, 흔들림 15 | **덩굴 끊김·던짐** | `druid_grab_throw` | R7 | 덩굴 조각 4개·착지 먼지 |
| 84(빗나감) | `miss_rec` 84 | 걸음만(두 번째 스텝까지) | `druid_grab_step` | R7 | 먼지 1회 |

흡수는 Core가 10틱마다 회복하지만 소리는 20틱마다(6번) 낸다. 같은 소리가 1초에 6번 나면 시끄럽기 때문이다. 음량은 착지음보다 6dB 작게 둔다.

### ⑤ burrowStrike — 땅속 잠행 기습 (217틱)

| 틱 | 단계 | 소리 | 키 | 상태 | VFX 짝 |
|---:|---|---|---|---|---|
| 0 | 잠행(예고) | 땅으로 꺼짐 | `druid_burrow` | 채택 | 무너지는 고리 |
| 56 | 지하 추적 45틱 | **땅 밑을 지나감**(둔덕 위치 3D 음원) | `druid_burrow_move` | R7 | 흙 둔덕 한 줄 |
| 101 | 분출 예고 34틱 | **둥근 균열이 자람** | `druid_erupt_warn` | R7 | 방사 균열 |
| 135 | 분출 | 분출 + **뿌리 가시** | `druid_erupt` + `druid_root_spikes` | `druid_erupt` 채택, **시각 제안 101 → 135** / 가시 R7 | 코어 1.2H·뿌리 가시·흙기둥 |

시각 제안: 지금 `druid_erupt`는 분출 예고가 **시작될 때**(Core `bossDruidErupt` 진입) 난다. 화면의 분출은 예고 끝(34틱 뒤)이다. 예고 시작에는 `druid_erupt_warn`을 내고, `druid_erupt`는 34틱 늦춰 분출 순간에 맞추는 안이다. 소리 코드의 지연만 바꾸고 Core는 그대로 둔다.

### ⑥ groundFissure — 가시 뿌리 줄기 (보스 102틱, 균열은 길이에 따라)

| 틱 | 단계 | 소리 | 키 | 상태 | VFX 짝 |
|---:|---|---|---|---|---|
| 0 | 예고 | 바닥 예고음 | `tell_boss` | 채택 | 직선 진행형 데칼 |
| 42 | 예고 끝(지팡이 꽂음) | **지팡이 꽂기** + 균열 달림 | `druid_staff_tap` + `druid_fissure` | 꽂기 R7(지금 빈 키) / 균열 채택 | 촉 아래 흙먼지 |
| 42 + Len/14 | 균열 끝(`Exploded`), 흔들림 12 | **뿌리 가시** + 흙 파편 | `druid_root_spikes` + `druid_debris` | R7(⑤·②와 공용) | ② 묶음 ExplR·가시 |

`druid_staff_tap`은 P1 등장 연출(지팡이 세 번, `ScheduleDruidIntroSounds`)과 같은 키다. 1~3차 후보가 모두 안 맞아 지금 파일이 비어 있다. R7은 1~3차와 겹치지 않게 꽂기·비틀기·마른 딱으로 만들었다.

### ⑦ heartbeat — 숲의 심장 박동 (P3, 360틱)

| 틱 | 단계 | 소리 | 키 | 상태 | VFX 짝 |
|---:|---|---|---|---|---|
| 0 | 예고 1(90틱) | 바닥 예고음 + **뿌리 핏줄 퍼짐** | `tell_boss` + `druid_heart_vein` | 핏줄 R7 | 뿌리 핏줄 선(알파 .15 → .4) |
| 90 / 180 / 270 | 박동 1·2·3 | 박동 + **파동 퍼짐** | `druid_heartbeat` + `druid_heart_wave` | 박동 채택 / 파동 R7 | 파동 띠 12틱 |
| 120 / 210 | 예고 2·3(60틱) | 핏줄 퍼짐(1.5배 빠르게) | `druid_heart_vein` | R7 | 핏줄 다시 짙어짐 |

## 3. R7 청음 후보 (2026-11-04)

- 새 키 15개 × 해석 3개(a~c) × 변형 3 = 135개를 만들었다. ElevenLabs `eleven_text_to_sound_v2`, 구독 범위 안이다. 카탈로그는 `I:/EXODUSER-Storage/sound-r7-20261104/catalog_r7.json`(저장소 밖)이다.
- 가공은 R6과 같다: 앞 무음 제거(피크 −35dB) → 키별 최대 길이·60ms 페이드 → 평균 음량 목표 → 피크 −1dB.
- 생성이 약한 변형 처리:
  - 첫 생성에서 5개 해석(`grab_step` a, `staff_tap` a·c, `heart_wave` c, `slash3_ground` c)의 변형이 대부분 피크 −18dB 아래로 작게 나왔다. 문구를 "loud·close-miked"로 바꿔 15개를 다시 만들었다.
  - 두 번째에도 일부가 −19 ~ −24dB로 작았다. 같은 방법을 세 번째로 반복하지 않고, 피크 −26dB 미만만 뺐다(2개). −18dB 미만은 카드에 "원본이 작아 크게 키움" 주의를 단다.
  - 결과: 카드 15장, 후보 133줄.
- 비용: ElevenLabs 구독 카운터 33,411 → 34,533(1,122, 월 90,000). `SPEND_LOG.md`에 적었다.
- 고르기 페이지는 `http://127.0.0.1:3399/pick_r7.html`(PICKSETS `r7`)이다. 카드마다 다음을 붙였다.
  - 그 기술의 동작 영상: v8.2 클립을 §9.1 연결표대로 Core 틱 길이에 맞추고, 34° 게임 카메라에서 30fps로 Blender 무창 렌더했다.
  - 단계 띠와 소리 시각 표시
  - VFX G1 단계 설명
- "장면에서 듣기"는 영상과 같은 박자로 재생한다. 드루이드 BGM(`bgm_druid_boss`)과 채택 아레나 앰비언스 위에서, 그 기술의 채택 소리를 Core 시각에 놓고 후보를 ★ 시각에 끼운다. 시각 제안 2건(내려찍기 54, 분출 135)은 장면에 반영했다.
- 영상은 미리보기다. 실제 게임 rig-pixel 화면은 Mac 판정 전이다. 돌진 회복 때 제자리로 돌아가는 것, 지하 추적 중 지팡이 머리가 보이는 것은 렌더 한계다.

## 4. 반영 (사용자 청음 뒤)

1. 고른 후보를 Unity `Resources/Audio/RM1/<키>.mp3`로 넣는다. 키와 시작 음량은 `NativeFeedbackAudio.StartVolume`에 등록한다.
2. 시각은 §1.3 신호로 잡는다. Core가 소리를 내지 않는 순간은 VFX `DruidSkillVfxView`와 같은 상태 비교로 소리 코드에서 낸다. Core는 바꾸지 않는다.
3. 시각 제안 2건(내려찍기 54, 분출 135)은 소리 코드의 지연만 바꾼다.
4. PC는 컴파일까지만 한다. 소리 수(Receipt)와 한 판 청음은 Mac에서 판정한다.

## 4.1 사용자 선택 결과와 반영 (2026-11-04)

사용자가 `pick_r7.html`을 제출했다(`_submitted/r7__20261103T222911077Z.json`, 2026-11-04 07:29 KST, 메모 0건). 채택 10키는 Unity `Resources/Audio/RM1/druid_<키>.mp3`로 넣고 시작 음량 .5로 연결했다. 브랜치는 `claude/unity-pc-sound-r5`이고, PC 컴파일 오류 0이다. 청음은 Mac에서 한다.

| 키 | 결과 | 채택 가공본(`_out/sfx_forge/_r7/single/`) | Unity 연결 신호(Core 무변경) |
|---|---|---|---|
| `druid_slash3_ground` | 채택 | `slash3_ground_b2` | 3타 예고 이벤트 + `SlashLinkTele+(SlashActive−SlashHitAt)`(채찍 3타와 같은 시각) |
| `druid_slam_lift` | 채택 | `slam_lift_b1` | 보스 상태 `bossSlamWind`에서 `St2 ≤ AimFixTicks`가 된 첫 틱 |
| `druid_debris` | 채택 | `debris_c3` | 내려찍기 예고 + `Tele+4` / Fx `wallSlam` +2틱 / 균열 `Exploded` +2틱 |
| `druid_charge_kick` | 채택 | `charge_kick_c3` | `bossChargeWind`에서 `St2 ≤ AimFixTicks`가 된 첫 틱(원거리 잡기가 돌진 예고로 바뀐 경우도 포함) |
| `druid_wall_crash` | 채택 | `wall_crash_c1` | Core Fx `wallSlam` |
| `druid_grab_step` | **전부 안 맞음** | — | 연결 없음 |
| `druid_grab_bind` | 채택 | `grab_bind_c3` | 보스 상태가 `bossGrab`으로 들어간 틱 |
| `druid_absorb` | **전부 안 맞음** | — | 연결 없음 |
| `druid_grab_throw` | 채택 | `grab_throw_b3` | 보스 상태가 `bossGrab`에서 나간 틱(던지기·탈출, 사망 제외) |
| `druid_burrow_move` | **전부 안 맞음** | — | 연결 없음 |
| `druid_erupt_warn` | 채택 | `erupt_warn_a2` | Core `druid_erupt` 이벤트(분출 예고 시작) 그 틱 |
| `druid_root_spikes` | 채택 | `root_spikes_a3` | 분출 순간(위 이벤트 + `BurrowEruptWarn`) / 균열 `Exploded` 그 틱 |
| `druid_staff_tap` | **전부 안 맞음**(4차 연속) | — | 키는 비어 있는 그대로 |
| `druid_heart_vein` | 채택 | `heart_vein_c2` | 심장 박동 예고 이벤트(rate 1) / 박동 1·2 + `HeartbeatPause`(rate 1.5) |
| `druid_heart_wave` | **전부 안 맞음** | — | 연결 없음(박동은 기존 `druid_heartbeat`만) |

- 시각 제안 2건을 적용했다. 사용자는 이 시각으로 장면을 들었다. 소리 코드의 지연만 바꿨다.
  - `druid_slam`: `Tele+SlamActive` → `Tele+2`
  - `druid_erupt`: Core 이벤트 즉시 → `BurrowEruptWarn`틱 늦춤. 같은 소리가 두 번 나지 않게 즉시 재생은 막았다.
- 코드 구성
  - 이벤트 + 지연으로 내는 소리는 `NativeFeedbackAudio`의 `SlamOnLanding`·`DruidExtras`에 있다.
  - 상태·Fx를 보고 내는 소리는 새 `NativeDruidSoundCues`에 있다. Core 읽기 전용이고, `NativeBossView`의 `prevBossState`와 같은 방식이다.
  - 둘 다 `PlayDruidCue`를 거쳐 Receipt·큐 규칙을 그대로 탄다.
- "전부 안 맞음" 5키는 같은 방향으로 다시 만들지 않는다. `staff_tap`은 4번 연속 불채택이라 방향을 바꿀지 총괄이 판단한다. 나머지 4키(걸음·흡수·땅속 이동·파동)는 그 순간을 소리 없이 둔다.

## 5. 기록

| 날짜 | 내용 |
|---|---|
| 2026-11-04 | G1 장면 목록 작성. 7기술 × 단계별 소리·키·상태·VFX 짝을 정리했다. 빈 순간은 15키다. 시각 제안 2건(`druid_slam` 58 → 54, `druid_erupt` 101 → 135)을 냈다. R7 후보 135개와 `pick_r7.html`(동작 영상·시간표 동기)을 만들었고, 청음 전이다 |
| 2026-11-04 | 사용자 선택 결과(§4.1): 채택 10키·전부 안 맞음 5키. 채택 10키를 Unity에 연결했다(`claude/unity-pc-sound-r5`, 시각 제안 2건 적용, PC 컴파일 오류 0). Mac 청음 전 |
