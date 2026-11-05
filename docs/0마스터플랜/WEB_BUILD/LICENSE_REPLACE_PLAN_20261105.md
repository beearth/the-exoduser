# 권리 점검 교체 계획표 (레인 LC 후속) — 행 96(비용 0 30 · 승인 필요 66) · 교체·제거 278건 분류: ① 1-1 데모 실제 사용 145 / ② 제출판 미사용·제외 133 · **제출 전 최소 교체 수 91**(CM이 데칼을 지우면 80, freesound·내레이션 확인 결과에 따라 최대 +10)

기준: [LICENSE_AUDIT_20261105](LICENSE_AUDIT_20261105.md) §3의 278건(권리 불명 202 + freesound CC 조건 미확인 8 + 생성 메시 정책 교체 68). 데모 범위 = 크로마 제출판 1-1 한 판(타이틀 → 로비 → 캐릭터 생성 → 1-1 필드 → 다크드루이드 → 클리어/사망). 스킬 세트 = Core가 실제로 지원하는 6종(`NativeSkillManagementPolicy.Supported`: kiSlash LMB·fireball RMB·spikeTrap 1·iceOrb Ctrl·giantSlam Space·holyDome F) + 기본 공격 3타·구르기·Q/E 패링([SKILL_SETTING_AUDIT](../../2_1%20스킬관리+합체시스템+자원/SKILL_SETTING_AUDIT_20261105.md) §1 "시작 스킬"·§5, [BRIEF_SKILL_MOTION_MAP](../worklog/cloud-lanes/BRIEF_SKILL_MOTION_MAP_20261105.md) 범위 줄). 교체 방법은 ①에만 적었다.

| 구분 | ① 1-1 데모 실제 사용 | ② 제출판 미사용·제외 | 합 |
|---|---:|---:|---:|
| 효과음(출처 0) 68 | **63** | 5 (`ice_storm`, `boss_hit`, `boss_howl`, `boss_howl1`, `death_boss`) | 68 |
| 첫인상 소리(출처 0) 3 | **3** (`enter`·`wakeup`·`entry_hover`) | 0 | 3 |
| 스킬 아이콘(출처 0) 98 | **13** (6종 ×2 + `kiSlash.png`) | 85 (미지원 42종 ×2 + 1) — K창 숨김 전제 | 98 |
| RM1 데칼(출처 0) 19 | **11** (bone 4·root 6·wet 1) | 8 (blood 4+노멀 4, 코드로 이미 비활성) | 19 |
| 키샷 소품(출처 0) 13 | 0 | 13 — CM M0 "소품 전부 비활성화" | 13 |
| 보스 아레나 흙(출처 0) 1 | **1** | 0 | 1 |
| freesound CC 미확인 8 | **8** (`pickup_*` 6·`druid_spore`·`intro_gate_original`) | 0 | 8 |
| 생성 메시(정책) 68 | **46** (전사 FBX 3+텍스처 7·드루이드 6·적 30) | 22 (`Ivan`·`Silvertail` FBX 8+텍스처 14, 프리팹 미연결·`Resources` 밖) | 68 |

합: **① 145 / ② 133**. 생성 메시 ①은 규정상 "AI 생성"으로 제출 가능하므로 **최소 교체 수에는 넣지 않았다**(§7).

## 1. 행 단위 교체표 — 96행 (제출 전 최소 교체 91 + 효과음 ② 5) · 비용 0 = 30 · 승인 필요 = 66

정렬: 제출판 노출 ○ → 비용 0 → 재생성(ElevenLabs). 노출 근거는 `unity/Assets/Exoduser/Runtime` 파일:줄(unity/main 64745756d). 무료 CC0 대체 후보는 이 세션 프록시가 polyhaven.com·freesound.org를 막아(403) 페이지를 열지 못했으므로 전부 **[미검증]**이고, docs(UNITY_KEYSHOT_A2 L199·202·236·308)의 과거 기록만 인용했다. ElevenLabs는 기존 구독 안(추가 결제 0)이지만 유료 생성이라 "승인 필요(D1)"로 표기했다. 예약·실행은 하지 않았다.

| # | 자산 경로 | 현재 출처·상태 | 1-1 제출판 노출 | 근거(파일:줄) | 교체 방법 | 담당 | 비용 | 비고 |
|---:|---|---|---|---|---|---|---|---|
| 1 | `Resources/Art/ui/skill_icons/orb/kiSlash.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 |
| 2 | `Resources/Art/ui/skill_icons/orb/kiSlash_dim.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 흐림(grayscale .85) |
| 3 | `Resources/Art/ui/skill_icons/orb/fireball.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 |
| 4 | `Resources/Art/ui/skill_icons/orb/fireball_dim.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 흐림(grayscale .85) |
| 5 | `Resources/Art/ui/skill_icons/orb/spikeTrap.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 |
| 6 | `Resources/Art/ui/skill_icons/orb/spikeTrap_dim.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 흐림(grayscale .85) |
| 7 | `Resources/Art/ui/skill_icons/orb/iceOrb.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 |
| 8 | `Resources/Art/ui/skill_icons/orb/iceOrb_dim.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 흐림(grayscale .85) |
| 9 | `Resources/Art/ui/skill_icons/orb/giantSlam.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 |
| 10 | `Resources/Art/ui/skill_icons/orb/giantSlam_dim.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 흐림(grayscale .85) |
| 11 | `Resources/Art/ui/skill_icons/orb/holyDome.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 |
| 12 | `Resources/Art/ui/skill_icons/orb/holyDome_dim.png` | 웹 img/skillskin_upscaled(04-10 snapshot), 출처 0 | ○ | NativeSkills.cs:168 (`Art/ui/skill_icons/orb/`+id) | ③ 우리 제작: Art/vfx 자체 시트 1프레임 크롭 + Unity 원형 베이크(U05 절차) | 클라우드(베이크 코드)·PC(디자인 총괄 1x 판정) | 0 | K창 구슬 흐림(grayscale .85) |
| 13 | `Resources/Art/ui/skill_icons/kiSlash.png` | 같음 | ○ | NativeHud.cs:41 | ③ 우리 제작(ki_slash_silver_sheet 크롭) | 클라우드·PC | 0 | HUD LMB 아이콘 |
| 14 | `Remodel/CH1_1/Materials/Decals/decal_bone.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | bone 데칼 |
| 15 | `Remodel/CH1_1/Materials/Decals/decal_bone_nrm.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | bone 노멀 데칼 |
| 16 | `Remodel/CH1_1/Materials/Decals/decal_bone_ribs.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | bone 데칼 |
| 17 | `Remodel/CH1_1/Materials/Decals/decal_bone_skull.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | bone 데칼 |
| 18 | `Remodel/CH1_1/Materials/Decals/decal_root.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | root 데칼 |
| 19 | `Remodel/CH1_1/Materials/Decals/decal_root_nrm.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | root 노멀 데칼 |
| 20 | `Remodel/CH1_1/Materials/Decals/decal_root_branch.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | root 데칼 |
| 21 | `Remodel/CH1_1/Materials/Decals/decal_root_branch_nrm.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | root 노멀 데칼 |
| 22 | `Remodel/CH1_1/Materials/Decals/decal_root_tangle.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | root 데칼 |
| 23 | `Remodel/CH1_1/Materials/Decals/decal_root_tangle_nrm.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | root 노멀 데칼 |
| 24 | `Remodel/CH1_1/Materials/Decals/decal_wet.png` | RM1 리모델 세션 제작, 기록 0 | ○(조건부) | RM1_Slice.unity `Decals` 루트(UNITY_RM1_SLICE §씬 구조); blood만 NativeGame.A2Forest.cs:59에서 비활성 | ③ 우리 제작: Blender 자체 베이크 — CM M0가 데칼도 끄면 ① 제거 | Mac(Blender) · CM 레인 확인(D8) | 0 | wet 데칼 |
| 25 | `Resources/Art/map/boss_arena/ground_dark_soil.png` | 제작 기록 0 | ○ | NativeArenaView.cs:8 / NativeGame.HellArenaLighting.cs:44 | ② CC0 대체: 이미 반입된 Art/map/a2/ground/A2_ForestSoil_BaseColor·Normal·Roughness(Poly Haven, KEYSHOT_A2 L199·202 기록)로 경로 교체 | 클라우드(코드 1줄 또는 파일 복사) | 0 | [미검증] polyhaven.com은 이 세션 프록시 403으로 미열람, docs 기록만 |
| 26 | `Resources/Audio/sword_swing1.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:58·74 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 평타 1타, 1.8초 |
| 27 | `Resources/Audio/sword_swing2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:58·74 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 평타 2타, 8.0초 |
| 28 | `Resources/Audio/sword_swing3.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:58·74 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 평타 3타, 8.0초 |
| 29 | `Resources/Audio/scarecrow_charge.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:58·76 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 기검참 홀드 충전 1·2단, 0.76초 |
| 30 | `Resources/Audio/sword_parry.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:110 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | Q/E 패링 성공·충전 3단, 1.03초 |
| 31 | `Resources/Audio/SFX/q_parry.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:108 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | Q 보호막 1단계, 2.04초 |
| 32 | `Resources/Audio/SFX/sword_back.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:111 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 패링 튕김, 1.03초 |
| 33 | `Resources/Audio/SFX/sword_back2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:111 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 패링 튕김, 1.03초 |
| 34 | `Resources/Audio/SFX/sword_back3.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:111 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 패링 튕김, 1.03초 |
| 35 | `Resources/Audio/SFX/voice_parry1.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:113 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 패링 성공 영어 대사(50%), 1.65초 |
| 36 | `Resources/Audio/SFX/voice_parry2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:113 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 패링 성공 영어 대사(50%), 1.07초 |
| 37 | `Resources/Audio/SFX/voice_parry3.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:113 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 패링 성공 영어 대사(50%), 1.49초 |
| 38 | `Resources/Audio/SFX/voice_parry4.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:113 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 패링 성공 영어 대사(50%), 1.49초 |
| 39 | `Resources/Audio/male_grunt.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:114 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 패링·평타 기합, 1.04초 |
| 40 | `Resources/Audio/voice_grunt.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:58·79 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 기합 풀, 0.84초 |
| 41 | `Resources/Audio/player_hit1.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:243 / Core Simulation.PlayerHurt.cs | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 피격 보이스(100ms 병합), 1.03초 |
| 42 | `Resources/Audio/player_hit2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:243 / Core Simulation.PlayerHurt.cs | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 피격 보이스(100ms 병합), 1.03초 |
| 43 | `Resources/Audio/player_hit3.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:243 / Core Simulation.PlayerHurt.cs | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 피격 보이스(100ms 병합), 1.03초 |
| 44 | `Resources/Audio/player_hit4.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:243 / Core Simulation.PlayerHurt.cs | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 피격 보이스(100ms 병합), 1.03초 |
| 45 | `Resources/Audio/SFX/footstep.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeGame.cs:387 / NativeFeedbackAudio.cs:327 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 걷기·구르기 시작, 0.39초 |
| 46 | `Resources/Audio/SFX/footstep2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:119·327 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 걷기 교대·구르기 끝, 2.04초 |
| 47 | `Resources/Audio/fireball.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | Vfx/SkillPresentation.cs:8 / NativeFeedbackAudio.cs:238 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 화염구 시전(vol .9·rate .7), 5.35초 |
| 48 | `Resources/Audio/spike_trap.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:58·76 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 가시덫 설치, 2.04초 |
| 49 | `Resources/Audio/heavy_hit.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:58·76 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 지옥강타 착탄, 1.03초 |
| 50 | `Resources/Audio/voice_holyDome.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:58·79 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 회복의 영역 시전 보이스, 0.76초 |
| 51 | `Resources/Audio/voice_holyDome2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:58·79 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 회복의 영역 시전 보이스 2, 1.07초 |
| 52 | `Resources/Audio/SFX/monster_hit.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:209~213 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | ghost·beast 계통 피격, 0.52초 |
| 53 | `Resources/Audio/SFX/monster_hit1.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:209~213 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | insect·bone·magic 계통 피격, 0.84초 |
| 54 | `Resources/Audio/SFX/monster_hit_flesh1.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:209~213 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | flesh 계통 피격, 2.04초 |
| 55 | `Resources/Audio/SFX/monster_hit_flesh2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:209~213 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | flesh 계통 피격, 2.04초 |
| 56 | `Resources/Audio/SFX/flat_hit.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:209~213 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | armor 계통 피격, 2.04초 |
| 57 | `Resources/Audio/SFX/death_armor.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 58 | `Resources/Audio/SFX/death_beast1.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 59 | `Resources/Audio/SFX/death_beast2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 60 | `Resources/Audio/SFX/death_beast3.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 61 | `Resources/Audio/SFX/death_beast4.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 62 | `Resources/Audio/SFX/death_bone.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 63 | `Resources/Audio/SFX/death_bone2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 64 | `Resources/Audio/SFX/death_bone3.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 65 | `Resources/Audio/SFX/death_bone_shatter1.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 66 | `Resources/Audio/SFX/death_bone_shatter2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 67 | `Resources/Audio/SFX/death_bone_shatter3.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 68 | `Resources/Audio/SFX/death_bone_shatter4.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 69 | `Resources/Audio/SFX/death_crack1.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 70 | `Resources/Audio/SFX/death_crack2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 71 | `Resources/Audio/SFX/death_crack3.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 72 | `Resources/Audio/SFX/death_crack4.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 73 | `Resources/Audio/SFX/death_crush2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 74 | `Resources/Audio/SFX/death_flesh.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 75 | `Resources/Audio/SFX/death_flesh2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 76 | `Resources/Audio/SFX/death_ghost.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 77 | `Resources/Audio/SFX/death_ghoul3_v2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 78 | `Resources/Audio/SFX/death_ghoul3_v3.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 79 | `Resources/Audio/SFX/death_ghoul3_v4.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 80 | `Resources/Audio/SFX/death_insect.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 81 | `Resources/Audio/SFX/death_insect2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 82 | `Resources/Audio/SFX/death_monster1.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 83 | `Resources/Audio/SFX/death_monster2.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 84 | `Resources/Audio/SFX/death_monster3.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 85 | `Resources/Audio/SFX/death_monster4.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 86 | `Resources/Audio/SFX/death_skull.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeEnemySfxTables.cs:8~18 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 1-1 etype 사망 풀(9풀), 0.7~2.0초 |
| 87 | `Resources/Audio/SFX/death_grunt.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:229 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 사망 15% 추가 신음, 1.52초 |
| 88 | `Resources/Audio/SFX/monster_die1.mp3` | 웹 sfx 2026-03 자동 저장, 출처 0 | ○ | NativeFeedbackAudio.cs:228 | ③ ElevenLabs 재생성 | PC(사운드 총괄, SFX Forge) | 구독 내 추가 결제 0 · **승인 필요(D1)** | 큰 개체(Size≥40) 사망 25% 추가음, 1.52초 |
| 89 | `Resources/Audio/Startup/enter.mp3` | 웹 assets/lobby/lobby_enter_sfx.mp3(05-18 snapshot), 출처 0 | ○ | NativeLobby.StartupPresentation.cs:31 | ③ ElevenLabs 재생성 | PC(사운드 총괄) | 구독 내 · **승인 필요(D1)** | 타이틀 ENTER·캐릭터 입장, 2.04초 |
| 90 | `Resources/Audio/Startup/wakeup.mp3` | 웹 sfx/voice/voice_wakeup.mp3(03-16), 출처 0 | ○ | NativeLobby.StartupPresentation.cs:31 | ③ ElevenLabs TTS 1줄 | PC(사운드 총괄) | 구독 내 · **승인 필요(D1)** | "Wake up, hey monster" 8.44초 |
| 91 | `Resources/Audio/UI/entry_hover.wav` | 웹 assets/lobby/11_loop.wav(05-18), 출처 0 | ○ | NativeLobby.UiSound.cs:52 | ③ ElevenLabs ambient 루프 | PC(사운드 총괄) | 구독 내 · **승인 필요(D1)** | 입장 버튼 hover 루프 30초 |
| 92 | `Resources/Audio/ice_storm.mp3` | 웹 sfx, 출처 0 | × | NativeFeedbackAudio.cs:58·76 | ① 제거 | PC(Resources 정리) | 0 | iceStorm 미이식(Core Supported 6종 밖) |
| 93 | `Resources/Audio/SFX/boss_hit.mp3` | 웹 sfx, 출처 0 | ×(폴백) | NativeFeedbackAudio.cs:125~126 | ① 제거(또는 RM1 클립 복사로 폴백 유지, D4) | PC(Resources 정리) | 0 | 드루이드는 druid_hit 사용, 폴백만 |
| 94 | `Resources/Audio/SFX/boss_howl.mp3` | 웹 sfx, 출처 0 | ×(폴백) | NativeBossSounds.cs:12~13 | ① 제거(또는 RM1 클립 복사로 폴백 유지, D4) | PC(Resources 정리) | 0 | druid_vo_phase 있으면 미사용 |
| 95 | `Resources/Audio/SFX/boss_howl1.mp3` | 웹 sfx, 출처 0 | ×(폴백) | NativeFeedbackAudio.cs:64·82 | ① 제거(또는 RM1 클립 복사로 폴백 유지, D4) | PC(Resources 정리) | 0 | 변형 번호 폴백 |
| 96 | `Resources/Audio/SFX/death_boss.mp3` | 웹 sfx, 출처 0 | ×(폴백) | NativeFeedbackAudio.cs:105 | ① 제거(또는 RM1 클립 복사로 폴백 유지, D4) | PC(Resources 정리) | 0 | druid_vo_last 있으면 미사용 |

### 1.1 추가 행(조건부) — freesound 출처 8 (노출 ○, 방법 ④ 사용자 결정)

| # | 자산 경로 | 현재 출처 | 근거 | 방법 | 담당 | 비용 |
|---:|---|---|---|---|---|---|
| E1 | `Resources/Audio/UI/pickup_item.mp3` | freesound #667271 alegemaate, CC 조건 [미검증](프록시 403) | NativeFeedbackAudio.cs:314 | ④ CC0/CC BY → 표기, NC/ND → ElevenLabs 1키 | 사용자(URL 확인) → PC | 0 또는 구독 내 |
| E2~E6 | `Resources/Audio/UI/pickup_rummage1~5.mp3` | freesound #257570 kodack, [미검증] | 같음 | 같음 | 같음 | 같음 |
| E7 | `Resources/Audio/RM1/druid_spore.mp3` | 3차 r3a = rummage2 재사용(DRUID_BOSS_SOUND_REMAKE §6.2) | RM1_AUDIO_KEYS.json:677 / NativeFeedbackAudio.cs:49 | 같음(NC/ND면 2차 후보 `druid_spore_v2a~d`로 복귀) | PC | 0 또는 구독 내 |
| E8 | `Resources/Audio/Lobby/intro_gate_original.mp3` | 음악 Suno(OK) + 내레이션 도구 기록 0 | NativeLobbyVideo.cs:83 | ④ ElevenLabs TTS 재녹음(D6) | PC | 구독 내 · 승인 필요 |


## 2. 효과음 68 → ElevenLabs 재생성 (① 63) — 묶음 설명

출처: 웹 `sfx/` 2026-02~05 자동 저장 커밋, 문서·태그 0(LICENSE_AUDIT §2.2). 교체 방법은 전부 ElevenLabs `eleven_text_to_sound_v2`(SFX)와 음성(TTS/보이스 SFX), 기존 SFX Forge 절차([SFX_FORGE_ELEVENLABS](../../6사운드디자인/SFX_FORGE_ELEVENLABS_20261021.md) 카탈로그 → 후보 3~4 → 사용자 청음 → `−1dBTP` 가공 → 같은 키 덮어쓰기). 코드 변경 0: 파일 이름을 그대로 쓴다.

| 장면 | 클립(현재 파일) | 수 | 용도(호출처) | 현재 길이 | 목표 길이 | 필요 생성 수(후보 3) | 비고 |
|---|---|---:|---|---|---|---:|---|
| 기본 공격 | `sword_swing1~3` | 3 | 평타 1·2·3타 휘두르기(`NativeFeedbackAudio`, `Feedback`) | 1.8 / 8.0 / 8.0초(2·3은 꼬리가 긴 원본) | 0.4~0.6초 | 9 | 카탈로그 `skill` 계열. 3타는 무게 다르게 |
| 기검참 충전 | `scarecrow_charge` | 1 | 홀드 충전 1·2단 도달음(6사운드디자인 "1·2단 완료") | 0.76초 | 0.5초 | 3 | 이름은 유지(코드 키) |
| 패링 | `sword_parry`, `q_parry`, `sword_back`·`2`·`3` | 5 | Q/E 패링 성공 금속음·충전 3단 완료·튕김(`FeedbackKind.Parry`) | 1.0 / 2.0 / 1.0초 | 0.3~0.6초 | 15 | 카탈로그 `hit/parry_clang` 이미 있음(SND-02 후보 재활용 가능) |
| 패링 보이스 | `voice_parry1~4`, `male_grunt` | 5 | 패링 성공 시 50% 영어 대사 / 기합(`Make("voice_parry"+n)`) | 1.0~1.7초 | 0.6~1.2초 | TTS 4줄 + 기합 3 | 전사 남성 보이스 1개 고정(실버테일 Sarah 전례). 대사는 기존 영어 4줄 그대로 |
| 기합 | `voice_grunt` | 1 | 평타·스킬 기합 풀 | 0.84초 | 0.6초 | 3 | |
| 피격 보이스 | `player_hit1~4` | 4 | 피해 1회당 1회, 100ms 병합(`Simulation.PlayerHurt`) | 1.03초 | 0.4~0.6초 | 12 | 같은 보이스로 4변형 |
| 발소리 | `footstep`, `footstep2` | 2 | 걷기 128px 간격·구르기 시작/끝 | 0.39 / 2.04초 | 0.25~0.35초 | 6 | 1-1 흙·낙엽 바닥 기준 |
| 스킬 | `fireball`, `spike_trap`, `heavy_hit` | 3 | 화염구 시전(vol .9·rate .7)·가시덫 설치·지옥강타 착탄 | 5.35 / 2.04 / 1.03초 | 0.6~1.2초 | 9 | 카탈로그 `skill/giant_slam_cast`·`spike_trap_cast` 이미 있음 |
| 회복의 영역 | `voice_holyDome`, `voice_holyDome2` | 2 | 영역 시전 보이스 | 0.76 / 1.07초 | 0.8초 | TTS 2줄 | 대사 유지 |
| 적 피격 | `monster_hit`, `monster_hit1`, `monster_hit_flesh1`·`2`, `flat_hit` | 5 | 계통별 피격(ghost·beast / insect·bone·magic / flesh / armor) | 0.5~2.0초 | 0.2~0.35초 | 15 | 카탈로그 `hit/blade_flesh`·`blade_bone` 이미 있음 |
| 적 사망 | `death_armor`, `death_beast1~4`, `death_bone`·`2`·`3`, `death_bone_shatter1~4`, `death_crack1~4`, `death_crush2`, `death_flesh`·`2`, `death_ghost`, `death_ghoul3_v2~4`, `death_grunt`, `death_insect`·`2`, `death_monster1~4`, `death_skull`, `monster_die1` | 32 | 1-1 etype 0~29·47이 닿는 9개 사망 풀(`NativeEnemySfxTables.DeathPools`) + 큰 개체 25%·15% 추가음 | 0.7~2.0초 | 0.5~1.2초 | 96 | 풀 구조를 유지하려면 32개 전부 필요. 풀을 계통당 2~3개로 줄이면 **18개**로 줄어듦(사운드 총괄 결정) |
| **합** | | **63** | | 127초 | | **SFX 51키 ×3 = 153 생성 + 음성 12키(TTS 6줄·기합/피격 변형 ~21)** | |

② 5개: `ice_storm`(iceStorm 미이식, 호출 불가), `boss_hit`·`boss_howl`·`boss_howl1`·`death_boss`(드루이드는 `druid_hit`·`druid_vo_phase`·`druid_vo_last`가 있으면 그쪽을 쓰므로 폴백만. 제출판에서는 **파일 제거**가 가장 간단하고, 폴백이 꼭 필요하면 RM1 클립을 복사).

**구독 범위 대조.** [API연결_가이드](../../API연결_가이드.md) §2: ElevenLabs는 "효과음·음성 주력, 10/30 웹 구독·잔액 확인". [SOUND_LEAD_MASTER](../../6사운드디자인/SOUND_LEAD_MASTER_20261026.md) R8 카운터: starter 90,000/월, 11-04 기준 40,176 사용(잔여 약 49,800, 11-13 초기화). 실측 단가는 DRUID_V81 135생성 = 1,122(약 8/생성), R10 91생성 = 1,377(약 15/생성). 153 SFX 생성 ≈ 1,200~2,300, TTS 6줄·보이스 변형 21 ≈ 500 이하 → **합 3,000 미만, 구독 범위 안**. 추가 결제·새 구독 0. 사용자 결정은 "범위 승인" 하나(§9 D1·D9).

## 3. 첫인상 소리 3 (① 3)

| 파일 | 용도 | 길이 | 교체 |
|---|---|---|---|
| `Audio/Startup/enter.mp3` | 타이틀 ENTER·캐릭터 입장(gain 2) | 2.04초 | ElevenLabs SFX "iron gate latch + low impact" 후보 3 |
| `Audio/Startup/wakeup.mp3` | 시작 인트로 "Wake up, hey monster"(VOICE 9) | 8.44초 | ElevenLabs TTS 1줄(네메시아 보이스, STY 대사 그대로) |
| `Audio/UI/entry_hover.wav` | 입장 버튼 hover 루프(0→.7 100ms) | 30.0초 루프 | ElevenLabs `ambient` 루프 10초 → 이음매 크로스페이드(hell_forest_bed 절차) |

## 4. 스킬 아이콘 98 (① 13 / ② 85)

- K창(`NativeSkills`)은 `Data/skill_defs_web.json`의 구슬 48개를 전부 그린다(미지원 42종은 배울 수 없는 상태로 표시). **제출판에서 미지원 스킬을 숨기면** 필요한 아이콘은 지원 6종 × (기본·`_dim`) 12 + `kiSlash.png` 1 = **13**. 숨기지 않으면 98 전부 ①이다(§9 D2).
- 13개 교체 방법(자체 제작 경로, 유료 생성 0 또는 gpt-image 소량): ① 원형 구슬 틀은 실버 헬 토큰으로 Unity에서 재조판(기존 U05 원형 마스크 절차) ② 중심 그림 6종(기검참 은빛 검기·화염구·가시덫·얼음 보주·지옥강타·회복의 영역)은 Art/vfx의 기존 자체 시트(ki_slash_silver_sheet·skill_ice_orb_sheet·skill_inferno_slam_sheet 등, 출처 GPT Image 확인됨)에서 1프레임을 잘라 쓰거나 gpt-image 6장(약 $0.1) ③ `_dim`은 기존 CSS 규칙(grayscale .85·brightness .6·contrast .92)으로 코드 베이크. 디자인 총괄 판정 1x·3x.
- 85개는 K창 숨김과 함께 `Resources`에서 제거(빌드 용량 2.9MB 중 2.5MB 절감).

## 5. RM1 데칼 19·키샷 소품 13·보스 아레나 흙 1 → CM 레인 대조

[BRIEF_CLEAN_MAP](../worklog/cloud-lanes/BRIEF_CLEAN_MAP_20261105.md) M0: "1-1 장면 복제(A2 Clean) → **소품 전부 비활성화** → 지면·다리·늪 수면·조명만 남김", 이후 M3~M6에서 고목 1·소품 2~3종만 절차대로 새로 만든다.

| 자산 | CM 대조 | 분류 | 남는 일 |
|---|---|---|---|
| 키샷 소품 FBX 9 + 텍스처 4 (`Art/map/keyshot`) | M0에서 비활성 대상(소품). M6의 바위·통나무·덤불은 새 절차 제작 | ② 13 | A2 Clean 병합 뒤 `Resources`에서 제거. 그 전까지 `layout.json` 로더가 참조하므로 빌드에는 들어감 → 제출판 flavor에서 keyshot 로드만 끄면 됨 |
| 데칼 blood 4 + 노멀 4 | `HellLighting`이 `Decals_blood*` 렌더러를 이미 비활성(KEYSHOT_A2 "검은 무늬") | ② 8 | 파일 제거 가능 |
| 데칼 bone 3+노멀 1, root 3+노멀 3, wet 1 = 11 | **CM 브리프에 데칼 언급 없음**. RM1_Slice `Decals` 루트는 소품이 아니라 지면 장식이라 M0 "지면만 남김"에서 남을 수 있음 | ① 11(조건부) | CM에 "데칼도 끈다"를 확인하면 ②로 내려 **최소 교체 수 80**. 남기면 자체 베이크(Blender, 뼈·뿌리·물기 3종 × 알베도+노멀)로 재제작 — 유료 0 |
| `Art/map/boss_arena/ground_dark_soil.png` | CM 범위 밖(아레나는 보스 레인). `NativeGame.HellArenaLighting`이 로드 | ① 1 | `Art/map/a2/ground/A2_ForestSoil_*`(Poly Haven CC0, 이미 반입)로 경로만 바꾸거나 같은 이름으로 복사. 코드 1줄 또는 파일 교체 |

## 6. freesound 8 → CC 조건 확인 (① 8)

클라우드 프록시가 freesound.org 접속을 막아(403) 라이선스를 못 읽었다. 사용자(또는 Mac)가 아래 두 페이지의 "License" 칸을 읽어 적어 주면 끝난다.

| 원본 | 확인 URL | 파생 파일 | CC0이면 | CC BY면 | CC BY-NC·ND면 |
|---|---|---|---|---|---|
| #667271 alegemaate "cloth grab" | https://freesound.org/s/667271/ | `Audio/UI/pickup_item.mp3` | 그대로, 크레딧 선택 | 크레딧에 "alegemaate, freesound #667271, CC BY 4.0" 표기 + `sfx/ui/ATTRIBUTION.txt` 신설 | ElevenLabs `ui` 1키 ×3 생성으로 교체 |
| #257570 kodack "rummage" | https://freesound.org/s/257570/ | `Audio/UI/pickup_rummage1~5.mp3`, `Audio/RM1/druid_spore.mp3`(3차 r3a = rummage2 재사용) | 같음 | 같음(kodack) | ElevenLabs `ui`·`skill` 2키 ×3 생성으로 교체(드루이드 포자는 DRUID_BOSS_SOUND_REMAKE 2차 후보 `druid_spore_v2a~d`로 되돌림 가능) |
| 인트로 내레이션 | — | `Audio/Lobby/intro_gate_original.mp3`(8.05초), `StreamingAssets/Lobby/intro.mp4` 음성 트랙 | — | — | 음성 생성 도구 기록이 없어 **ElevenLabs 재녹음**이 확실한 길(TTS 1~2줄, 네메시아 보이스). 영상은 음성만 교체(ffmpeg, 재인코딩 없이 오디오 트랙만) |

(웹 `sfx/hit/player_projectile_impact.wav` Bisqo #855371 CC BY 4.0은 `sfx/hit/ATTRIBUTION.txt`가 있고 Unity 미반입이라 대상 아님.)

## 7. 생성 메시 68 — CH·MQ·보스 레인 교체 대상과 중복 표기

| 자산 | 수 | 데모 사용 | 교체 레인(이미 배정) | 제출 시점에 남으면 |
|---|---:|---|---|---|
| 전사 `Art/Characters/Warrior` FBX 3(Rigged·Greatsword·R7) + 텍스처 7 | 10 | ① 영웅 본체 | **CH**([BRIEF_CHARACTER_DEEP](../worklog/cloud-lanes/BRIEF_CHARACTER_DEEP_20261105.md) C1~C3 파트 분할·갈아입기, 손 조형/스캔 기반) | "AI 생성(Meshy 7.1 메시·리깅, 유료 크레딧)"으로 공개 제출. 규정 위반 아님 |
| 아이반·실버테일 FBX 8 + 텍스처 14 | 22 | ② 프리팹 미연결, 캐릭터 선택 "준비 중" | CH 2단(데모 뒤) | 제출판 `Resources` 밖이라 빌드 미포함. 제거 불필요 |
| 다크드루이드 `Remodel/Boss/DarkDruid/Source` FBX 3 + 텍스처 3 | 6 | ① 검사용 프리팹(실패 원본 보존) | 보스 새 조형(UNITY_BOSS_DARK_DRUID_3D_IMPORT §16 결정, 1-1 드루이드 우선) | 같은 공개 |
| `Resources/Enemies3D` FBX 30 | 30 | ① `Data/enemy_rig_models.json`으로 전부 로드(1-1 etype 29종 + 2) | **MQ**([BRIEF_MONSTER_QUALITY](../worklog/cloud-lanes/BRIEF_MONSTER_QUALITY_20261105.md) 상위 1~2가족 M1·M2 먼저) | 같은 공개. 1-1 기대 등장 상위 5종(etype 7·16·1·47·4 = 한 판의 40%)부터 교체하면 화면 체감이 가장 큼 |

이 68은 권리 문제가 아니라 11-05 "생성 메시 폐기" 결정이므로 **최소 교체 수에 넣지 않는다**. 제출 전 교체되지 않은 모델은 §0 ⑩ "요청 시 도구 공개"에 따라 Meshy·Tripo를 적는다.

## 8. 제출 전 최소 교체 수

| 항목 | 수 | 조건 |
|---|---:|---|
| 효과음 ① | 63 | D3 축소 시 파일 수는 같고 생성 수만 줄어듦 |
| 첫인상 소리 | 3 | |
| 스킬 아이콘 | 13 | D2 숨김 전제(아니면 98) |
| RM1 데칼 | 11 | D8 확인되면 0 |
| 보스 아레나 흙 | 1 | 경로 교체 |
| **최소 교체 수** | **91** | D8 확인 시 **80** |
| 조건부 추가 | +8 | freesound가 NC/ND일 때 3키(6+1+1 파일)… 실제 파일 수 8 |
| 조건부 추가 | +2 | 내레이션 재녹음(D6) 파일 2 |
| 제거만(교체 아님) | 5 + 85 + 13 + 8 = 111 | ② 중 `Resources`에 남아 빌드에 들어가는 것. 용량 약 15MB 절감 |

일정 제안: D1~D8 결정 → 주 2(11-13~) 사운드 R11 생성·청음 → 주 3 아이콘 13·흙 1·데칼 → 주 7(12-18~) 공개 링크 빌드 전 LICENSE_AUDIT 첫 줄 재점검(권리 불명 0 목표).

## 9. 사용자 결정 항목(최종)

| # | 결정 | 기본안(총괄) | 영향 |
|---|---|---|---|
| D1 | ElevenLabs 재생성 범위 승인: SFX 51키 × 후보 3 = 153 생성 + 음성 12키(TTS 6줄·변형 21) + 첫인상 3키 ×3 + freesound 대체 최대 3키 ×3. 합 약 3,000 크레딧 미만, 구독 범위 안, 추가 결제 0 | 승인 → 사운드 총괄이 카탈로그·장면 카드 작성 뒤 R11로 생성 | 전투 소리 전부(63) |
| D2 | K창에서 미지원 스킬 42종을 제출판에서 숨길지 | 숨김(아이콘 13만 교체, 85 제거) — 배울 수 없는 스킬을 보여 주는 것이 데모에 득이 없음 | 아이콘 교체 13 vs 98 |
| D3 | 적 사망 풀 구조 유지(32개) vs 계통당 2~3개로 축소(18개) | 축소 — 데모에서 32종 차이는 들리지 않음 | 생성 수 96 → 54 |
| D4 | 보스 폴백 4(`boss_hit`·`boss_howl`·`boss_howl1`·`death_boss`) 제거 vs ElevenLabs 재생성 | 제거(드루이드 클립이 폴백을 덮음) | 0 vs 12 생성 |
| D5 | freesound 두 원본 라이선스 읽기(사용자 브라우저) | 사용자 2분 | CC BY면 크레딧 2줄, NC/ND면 3키 재생성 |
| D6 | 인트로 내레이션(`wakeup`·`intro_gate_original`·`intro.mp4` 음성) ElevenLabs 재녹음 승인 | 승인(TTS 3줄, 크레딧 미미) | 첫인상 음성 출처 확정 |
| D7 | 생성 메시 68이 01-06까지 남으면 "AI 생성(Meshy·Tripo)" 공개로 제출 | 수용(규정상 허용, CHROMA §2 ④와 일치) | 공개 문구 1줄 |
| D8 | CM 레인에 "RM1 데칼 11도 M0에서 끈다" 확인 | CM 브리프에 1줄 추가 요청 | 최소 교체 91 → 80 |
| D9 | **ElevenLabs 68건 일괄 승인 여부**(§1 승인 필요 66행 = 효과음 63 + 첫인상 3, 조건부 E8) | 일괄 승인 — 분할 승인은 청음 회차만 늘림 | 구독 내, 추가 결제 0 |
| D10 | **음악 교체 여부** | 교체 안 함 — BGM 22곡 Suno 유료 플랜 확인(11-04)·ElevenLabs Music 1곡으로 권리 문제 없음. 교체는 품질 사유일 때만 | 0 |

