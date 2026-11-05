# 크로마 어워즈 제출용 권리 점검 (레인 LC) — 총 자산 1,673(Mac 실제 파일 1,656 · 3.81GB) · 실제 사용 1,430(+씬 참조 추정 232) · 권리 불명 202 · 교체 또는 제거 필요 210(권리) + 정책 교체 68(생성 메시)

기준: origin/unity/main `64745756d` (2026-11-05), `git ls-tree -r origin/unity/main -- unity/Assets` 4,510행(meta 2,338 제외 2,172 → 코드 `.cs`·asmdef 등 499 제외 **비코드 자산 1,673**). 규정 근거: [CHROMA_AWARDS_PLAN §0 위험표 IP·음악](../CHROMA_AWARDS_PLAN_20261105.md) — 권리 없는 IP 불가, 음악은 직접 제작·라이선스·허가·AI 생성만, AI 도구는 요청 시 정확히 공개(§0 ⑩).

| 항목 | 값 | 설명 |
|---|---|---|
| 총 자산 수 | **1,673** | unity/Assets 비코드 파일(meta 제외). 이미지 1,057 · 오디오 154 · 영상 12 · FBX 88 · 폰트 17(+OFL 9) · 셰이더 43 · VFX 그래프 10 · Unity 파생(mat·asset·anim 등) 163 · JSON 96 · 커서 bytes 24 |
| 실제 사용 수 | **1,430** | Resources 1,418 + StreamingAssets 12 = 빌드 포함 확정. 폴더마다 Runtime 코드 리터럴·`Resources/Data/*.json` 참조를 대조했다(§4). 그 밖에 씬·프리팹 경유 Art/Remodel/Rendering/VFX 232는 "참조 추정"(GUID 전수 대조는 이 체크아웃에 바이너리·씬이 없어 미실시). 미사용 확인 1식: `a2/Models/RF_Foam_Bank`(KEYSHOT_A2 "r1 Foam_Bank 현재 사용0") |
| 권리 불명 수 | **202** | 출처 문서·메타 태그·커밋 메시지 어디에도 제작 방법이 없는 파일. 오디오 71 · 스킬 아이콘 98 · RM1 데칼 19 · 키샷 소품 FBX 9+텍스처 4 · 보스 아레나 흙 1 (§3) |
| 교체 또는 제거 필요 수 | **210 + 68** | 권리 기준 210 = 권리 불명 202 + freesound 출처 CC 조건 미확인 8. 정책 기준 68 = 생성 메시 폐기 결정(DIRECTION_RESET 11-05)에 걸리는 Meshy·Tripo FBX 44 + 그 텍스처 24. 둘은 겹치지 않는다 |

가장 큰 위험 한 줄: **웹 초기(2026-02~03) 효과음 68개(`Audio/*.mp3` 17 + `Audio/SFX` 51)가 1-1 전투의 타격·사망·발소리·기합 전부인데 출처 기록이 0이다.** 제거하면 전투가 무음이 되므로 제출 전 ElevenLabs 재생성(구독 범위 안, 사운드 총괄)으로 전량 교체해야 한다.

---

## 1. 방법과 한계

1. 경로 전수: `git ls-tree -r origin/unity/main --name-only -- unity/Assets` → 확장자·폴더 히스토그램(§4 표의 수치).
2. 1차 분류: 폴더·이름 규칙(`Art/map/a2/*`, `Enemies3D/*`, `Audio/RM1/*` 등).
3. 증빙 대조: `unity/Tools/Fixtures/{source_receipt,inventory-assets,lobby-assets}.json`, `unity/Tools/character-ui/art-provenance.json`, `Resources/Enemies3D/{enemy3d,pilot}-provenance.json`, `Resources/Audio/RM1/RM1_AUDIO_KEYS.json`, `Resources/Art/TitleSignboard/A/manifest.json`, `Art/fonts/*-OFL.txt` 9개, [ART_TEAM_MASTER](../../17게임아트팀/ART_TEAM_MASTER.md), [UNITY_BGM_IMPORT_CANDIDATES §1.2](../../6사운드디자인/UNITY_BGM_IMPORT_CANDIDATES_20261104.md)(`claude/unity-pc-sound-bgm-license-20261104` 8eb59883), [6사운드디자인.md](../../6사운드디자인/6사운드디자인.md) 음원 출처 주석, [SOUND_LEAD_MASTER](../../6사운드디자인/SOUND_LEAD_MASTER_20261026.md), [UNITY_KEYSHOT_A2](../../engine/UNITY_KEYSHOT_A2_20261030.md), [UNITY_RM_INT_RUNTIME_HOOK](../../engine/UNITY_RM_INT_RUNTIME_HOOK_20261028.md), [UNITY_CHARACTER_BOARD](../../engine/UNITY_CHARACTER_BOARD_20261027.md), [UNITY_BOSS_DARK_DRUID_3D_IMPORT](../../engine/UNITY_BOSS_DARK_DRUID_3D_IMPORT_20261029.md), `docs/8.0몬스터디자인/UNITY_CH1_1_ENEMY_3D_RIG_G0_20261103.md`, [STEAM_DEMO_UPLOAD_PRECHECK X4·X5](../../13출시·마케팅/STEAM_DEMO_UPLOAD_PRECHECK_20261104.md), 영수증 트리아지 `codex/unity-asset-receipt-triage-20261105:docs/engine/ASSET_RECEIPT_TRIAGE_20261105.md`(바이트 정합 판정 12건, 출처 변경 없음).
4. 실제 사용: `unity/Assets/Exoduser/Runtime`·`Editor`의 `Resources.Load` 리터럴 273개와 `Resources/Data/*.json`의 `Art/…` 경로를 폴더 단위로 대조. 오디오는 파일 이름 어근 154개 중 144개가 코드에 직접 등장하고, 나머지 10개(`ddung_*` 6, `voice_parry2~4`, `boss_howl1`)는 접두어+번호 동적 로드다.
5. 웹 원본의 최초 커밋: `git log origin/main --diff-filter=A -- <경로>`. 2026-02~05의 `auto: … 자동 저장/sync snapshot` 커밋은 출처 정보가 없다.
6. 실제 파일 대조(11-05 추가): Mac 자산 목록 [RESOURCES_INVENTORY_MAC_20261105](RESOURCES_INVENTORY_MAC_20261105.md)·`resources_inventory_mac_20261105.csv`(`claude/unity-mac-report-20261104` 295c002ff, unity/main 64745756d와 Runtime 차이 0) 1,656행을 이 표의 폴더 그룹에 합쳤다(§2.7). 차이 17 = 이 표에만 있는 Editor 비코드 6·Scenes 3·Rendering 13·루트 asset 2(Mac 조사 범위 밖, 빌드 미포함) − Mac에만 있는 복원 영상 3(`world_intro_v22b_steam`·`world_intro_v23_newopening_steam`·`warrior_story_v23_clean`, MediaRecovery 조립본) + Mac이 포함한 Remodel `.cs` 4. Mac 발견: 자산 옆에 LICENSE·README·출처 안내 파일이 있는 자산은 11개뿐이고 전부 `Remodel/CH1_3/Data/ch1_3_source_receipt.json` 하나를 가리킨다 — 안내 파일 부재는 권리 없음이 아니며, 이 문서 §2의 출처 열이 그 교차 결과다.
7. 한계: 자산 바이너리와 씬(`.unity`)이 이 체크아웃에 없어 GUID 참조 전수·파일 메타 태그 재검사는 하지 않았다. BGM의 `made with suno` 태그는 11-04 PC 문서를 인용했다. 각 AI 서비스의 약관 원문은 열지 않았고 "유료 플랜·구독 사용 기록이 docs에 있는가"만 적었다.

분류 기호: **자체** 자체 제작 / **AI** AI 생성(도구·요금제) / **CC0** Poly Haven 등 / **OFL** 폰트 / **상용** 상용 라이선스 / **불명** 출처 불명 / **CC?** 출처는 있으나 라이선스 조건 미확인.

## 2. 전수 분류표 (폴더 단위)

### 2.1 폰트 — 17파일, 라이선스 파일 9, 전부 제출 가능

| 파일 | 라이선스 파일 | 출처 | 실제 사용 | 판정 |
|---|---|---|---|---|
| Cinzel-400/600.ttf, Cinzel-VariableFont_wght.ttf | Cinzel-OFL.txt (© 2020 Cinzel Project Authors, SIL OFL 1.1) | Google Fonts | 코드 3경로 | OFL, 제출 가능 |
| CinzelDecorative-Bold.ttf | CinzelDecorative-OFL.txt (© 2012 Natanael Gama, OFL 1.1) | Google Fonts | 코드 | OFL |
| Hahmlet-300-ko/400-ko.ttf | Hahmlet-OFL.txt (© 2020 hyper-type, OFL 1.1) | Google Fonts | 코드 | OFL |
| NanumMyeongjo-Regular.ttf | NanumMyeongjo-OFL.txt (© 2010 NHN, OFL 1.1, Reserved Font Name Nanum) | 네이버 나눔 | 코드 | OFL. 이름 변경 금지 조항만 유의 |
| NativeLobbyNotoSansKR-{Regular,SemiBold,Bold}.ttf, NotoSansKR.ttf | NativeLobbyNotoSansKR-OFL.txt (© 2014-2021 Adobe, Reserved Font Name 'Source', OFL 1.1) | Google Noto | 코드 | OFL. `NotoSansKR.ttf`는 같은 OFL이 덮으나 전용 OFL 파일 이름이 없음 → 크레딧에 함께 표기 |
| NativeCaptionNotoSerif.ttf | NativeCaptionNotoSerif-OFL.txt | Google Noto | 코드 | OFL |
| NotoNaskhArabic-Regular.ttf | NotoNaskhArabic-OFL.txt | Google Noto | 코드(아랍 자막 2 asset) | OFL |
| NotoSerifCJK{jp,sc,tc}-Regular.otf | NotoSerifCJK-OFL.txt | Google Noto | 코드 | OFL |
| NotoSerifThai-Regular.ttf | NotoSerifThai-OFL.txt | Google Noto | 코드 | OFL |
| ArabicCaption*.asset ×4 | — | Unity 폰트 에셋(자체 파생) | 코드 | 자체 |

Mac 목록의 폰트 내부 라이선스 칸: 17개 중 16개가 OFL 문구(Thai는 OFL URL), NanumMyeongjo만 "NHN Corporation"(동봉 OFL 파일이 라이선스를 증명). `Cinzel-400/600.ttf`의 패밀리명은 "EXODUSER Latin Serif", `NativeLobbyNotoSansKR-*.ttf`는 "EXODUSER Lobby Sans KR"로 바뀐 파생본이다 — OFL은 파생본 이름 변경을 허용하고 Reserved Font Name(Cinzel Decorative 'Cinzel', Noto Sans KR 'Source')을 쓰지 않았으며 같은 OFL 파일을 동봉했으므로 조건 충족. 크레딧에는 원 폰트 이름으로 적는다.

### 2.2 오디오 — 154파일 (mp3 145·wav 9)

| 폴더 | 수 | 출처·증빙 | 실제 사용 | 판정 |
|---|---|---|---|---|
| `Audio/Bgm` | 16 | Suno 15곡(`hell1`, `hell1_rot_*` 6, `forge_*` 3, `boss`, `death`·`_alt`, `victory`·`_alt`) — 계정 beearthone, 생성 당시 유료 플랜(사용자 확인 11-04, UNITY_BGM_IMPORT_CANDIDATES §1.2·PRECHECK X4 해소). `bgm_druid_boss` 1곡 ElevenLabs Music(DRUID_BOSS_SOUND_REMAKE L6) | `Audio/Bgm/`+키 동적 로드, 설정 18값 | **AI, 제출 가능** |
| `Audio/Lobby` | 6 | `lobby`·`prologue_theme*` 4 = Suno(같은 근거). `intro_gate_original` = 웹 `video/intro.mp4`의 오디오 트랙을 재인코딩 없이 추출(UNITY_MAC_INTRO_SILENCE) — 음악은 Suno(Ashes of the Fallen Gate, id 67912c16)이나 **내레이션 음성의 생성 도구 기록 없음**(BGM 문서 P2 `intro_voice.mp3` "태그 없음 — 확인 필요"와 같은 음성) | 코드 | Suno 5 제출 가능 · `intro_gate_original` 1 **CC?/확인 필요** |
| `Audio/Startup` | 4 | `nemesis`(네메시아의 강림 V3)·`stage_first`(Ashes of the Fallen Gate) = Suno. `enter` = 웹 `assets/lobby/lobby_enter_sfx.mp3`(2026-05-18 sync snapshot, 출처 0). `wakeup` = 웹 `sfx/voice/voice_wakeup.mp3` "Wake up, hey monster"(2026-03-16 자동 저장, 출처 0) | 코드 | Suno 2 제출 가능 · **불명 2** |
| `Audio/Ambient` | 1 | `amb_hell_forest_bed` ElevenLabs SFX Forge(SFX_FORGE_ELEVENLABS ambient 행, SOUND_LEAD R8) | 코드 | AI, 제출 가능 |
| `Audio/RM1` | 37 | 전부 ElevenLabs `eleven_text_to_sound_v2` 2차·3차 후보 가공본(RM1_AUDIO_KEYS `source: s2 …`, DRUID_BOSS_SOUND_REMAKE, DRUID_V81_SKILL_SFX_G1, AD3). 예외 `druid_spore` = 3차 r3a "웹 `pickup_rummage2`"(DRUID_BOSS_SOUND_REMAKE §6.2) → freesound #257570 파생 | `Audio/RM1/`+키 | AI 36 제출 가능 · `druid_spore` 1 **CC?** |
| `Audio/UI` | 20 | `ddung_1~3`·`_dark` 6 = ElevenLabs(DECISION_SOUND 제작란). `ui_button_hover/confirm`·`ui_panel_open/close`·`ui_tab` 5 = ElevenLabs(SND10). `ui_levelup.wav`·`ui_pickup_chime.wav` 2 = 웹 Web Audio 합성 코드를 OfflineAudioContext로 렌더(UNITY_UI_SOUND_MATCH) = 자체. `pickup_item` 1 = freesound **#667271**(alegemaate), `pickup_rummage1~5` 5 = freesound **#257570**(kodack) — 6사운드디자인 "출시 전 CC 라이선스·저작자 표기 확인 필요", PRECHECK X5 미해소. `entry_hover.wav` 1 = 웹 `assets/lobby/11_loop.wav`(05-18 snapshot, 출처 0) | 코드(ddung은 접두어 동적) | AI 11·자체 2 제출 가능 · **CC? 6** · **불명 1** |
| `Audio/SFX` | 53 | `crit_heavy`(SND-02 R2 ElevenLabs 채택)·`amb_hell_forest_bed`(중복 사본) 2 = AI. 나머지 51(`death_*` 32, `monster_hit*` 4, `monster_die1`, `boss_hit/howl/howl1`, `death_boss`, `footstep/2`, `flat_hit`, `q_parry`, `sword_back1~3`, `voice_parry1~4`) = 웹 `sfx/death|monster|hit|misc|swing|voice`에서 바이트 이식. 최초 커밋 2026-03-16~03-31 `auto: 자동 저장/auto-save`, 어떤 문서에도 제작 도구·구매·라이선스 기록 없음(6사운드디자인 전체·FDG_SOURCE_TRACE_SOUND·SOUND_LEAD 검색 0) | 코드(어근 전부 등장) | AI 2 · **불명 51** |
| `Audio/*.mp3`(루트) | 17 | `fireball`, `heavy_hit`, `ice_storm`, `male_grunt`, `player_hit1~4`, `scarecrow_charge`, `spike_trap`, `sword_parry`, `sword_swing1~3`, `voice_grunt`, `voice_holyDome/2` — 위와 같은 2026-02-27~05-01 자동 저장 커밋, 출처 0 | 코드 | **불명 17** |

오디오 합계: 제출 가능 75(Suno 22 · ElevenLabs 51 · 자체 2) / CC 조건 미확인 8 / 출처 불명 71.

### 2.3 영상 — 12파일 (`StreamingAssets/Lobby`)

| 파일 | 출처·증빙 | 실제 사용 | 판정 |
|---|---|---|---|
| `title_motion_C2_final_20261102.mp4` | Kling(Pro 구독, 무료 체험 워터마크판 미사용 — ART_TEAM_MASTER 2026-10-28·11-02, UNITY_TITLE_SIGNBOARD_A) | 코드 | AI, 제출 가능 |
| `title_motion_20261028.mp4` | Kling 4.0 첫=끝 프레임 7초(ART_TEAM_MASTER 10-28) | 코드 폴백 경로 아님(구형, 미참조) | AI, 미사용 |
| `title_motion_20260929.mp4`, `title_motion_hd_20260929.mp4` | 웹 09-29 커밋 `13da66824`, 제작 도구 기록 없음(AI 영상 추정, MagicLight Hailuo 사용 시기) | 코드 폴백(`title_motion_20260929`) | **AI(도구 미기록) → 확인 필요** |
| `cs_idle_warrior_cs3_4k.mp4`, `cs_idle_silvertail_4k.mp4`, `cs_idle_hellgunner.mp4`, `cs_idle_spearmage.mp4`, `cs_idle_transmuter.mp4` | 웹 `img/exoduser_*/idle_*.mp4`·`assets/charselect/idle_*.mp4`(09-29 같은 커밋), 도구 기록 없음(이미지→영상 AI 추정) | 코드 5 | **AI(도구 미기록) → 확인 필요** |
| `lobby_varkan_crypt_loop_v2_unity.mp4` | 웹 `assets/lobby/lobby_varkan_crypt_loop_v2.mp4`(09-28) 재인코딩, 도구 기록 없음 | 코드 | **AI(도구 미기록) → 확인 필요** |
| `intro.mp4` | 웹 `video/intro.mp4`(2026-02-27 최초), 세계관 인트로 초기판. 영상·내레이션 도구 기록 없음, 음악 Suno | 코드 | **확인 필요**(내레이션 음성 출처) |
| `fdg_intro.mp4` | 회사 로고 영상(08-10 커밋), 제작 기록 없음. 로고 원화는 자체 브랜드 | 코드 | 자체 추정, 제작 기록 보강 필요 |

Mac 디스크에는 위 12개 외에 복원 영상 3개(`world_intro_v22b_steam.mp4` 102.2MB·`world_intro_v23_newopening_steam.mp4` 90.1MB·`warrior_story_v23_clean.mp4` 94.8MB, 합 287MB)가 더 있다(StreamingAssets 15파일 339MB). 코드가 참조하지만 unity/main `Assets`에 없는 영상: `world_intro_v22b_steam.mp4`·`world_intro_v23_newopening_steam.mp4`·`warrior_story_v23_clean.mp4`(`unity/Tools/MediaRecovery/*/part-*.bin`으로 분할 보관, 빌드 때 조립). 제작은 GPT Image 정지화 + MagicLight Hailuo 2.3 영상화 + ElevenLabs 내레이션 + Suno(ART_TEAM_MASTER §3.2b·§3.2c, docs/cinematic). 제출 빌드에 들어가면 같은 "AI 생성, 유료 포인트" 분류다.

### 2.4 3D 모델 — 88 FBX

| 폴더 | 수 | 출처·증빙 | 실제 사용 | 판정 |
|---|---|---|---|---|
| `Art/Characters/Warrior` (Rigged·Greatsword·RemasterR7/Warrior_R7; Walk·Run은 `.anim`으로 분리) | 3 | Meshy multi-image-to-3d 7.1 + Meshy rigging(유료 크레딧, 사용자 승인 10-27·10-28·10-31, UNITY_CHARACTER_BOARD UCH-02a/02c/03a, UNITY_HERO_RUNTIME R7 35cr+5cr). Blender 보정 | `Characters/Warrior` 프리팹 경유 | AI. **정책 교체**(생성 메시 폐기) |
| `Art/Characters/Ivan`, `Silvertail` (각 Rigged·Walk·Run·무기) | 8 | Meshy 6건 130cr(UCH-05·06, 사용자 승인 10-28) | 프리팹 미연결(캐릭터 보드 "Unity 임포트 대기") | AI. 정책 교체 |
| `Remodel/Boss/DarkDruid/Source` (00_Druid_Rig·10_Slam127·11_Walk) | 3 | Meshy `dd_rig_20261028_2247` rigged FBX 동일 바이트, Meshy 애니메이션 127 Charged_Ground_Slam(UNITY_BOSS_DARK_DRUID_3D_IMPORT, SHA 기록) | 검사용 프리팹(실패 원본 보존) | AI. 정책 교체(새 조형 결정) |
| `Resources/Enemies3D` | 30 | Meshy 메시 + 인간형 Meshy 리깅 / 비인간형 Tripo 자동 리깅(pilot-provenance `*_rig_*/basic_animations_walking_glb.glb`, `eyemass_meshy_tripo_rigged.glb`; ENEMY_3D_RIG_G0 §4.1 결정). 동작 클립은 `unity/Tools/enemy3d/import-anim-v1.py`가 Blender 5.2.3에서 생성(enemy3d-provenance `generator`) = 자체. Mixamo는 Tripo 리깅 비교 1회에만 등장, 반입 0 | `Data/enemy_rig_models.json` → `Enemies3D/<모델>` | AI(Meshy·Tripo 유료 크레딧, 상업 약관 docs 미열람). **정책 교체** |
| `Resources/Art/map/a2/Models` (RF_* 11) | 11 | Blender 자체 제작(blender-env forest-r1, UNITY_RM_INT_RUNTIME_HOOK 10-30: "Poly Haven CC0 Rock Face/Bark Brown02/Burned Ground01", 고목은 CC0 스캔 재구성, 출처-실물대조.json) | A2 임포터 화이트리스트, `RF_Foam_Bank`만 사용 0 | 자체+CC0, 제출 가능 |
| `Resources/Art/map/a2/r3/Models` (RF3_* 17) | 17 | Blender woodbridge-r2(같은 문서 10-30, "거목은 CC0 실물 목질", RF3_Moss_Cushion "R3 CC0") | A2 임포터 | 자체+CC0, 제출 가능 |
| `a2/roots` PineRoots_A/B, `a2/stump` Scanned_Stump, `a2/rootrelief` Root_Cluster_Patch, `a2/raisedroots` Raised_Root_Cluster, `a2/foreground` Scanned_Foreground_Log | 6 | Poly Haven CC0 — pine_roots·tree_stump_01(Rob Tuytel)·root cluster(KEYSHOT_A2 "새 뿌리 출처"·"실제 스캔 큰 밑동"·"기존CC0 A2_Root_Cluster_Patch"). Blender decimate만 적용(DIRECTION_RESET 11-05 AT 1차: 전경 로그 45,719△) | 코드 리터럴 | CC0, 제출 가능. 품질 사유 재작업 예정(권리 문제 아님) |
| `a2/hollow` Hollow_Loft_Tree | 1 | Blender 자체(v4b, KEYSHOT_A2 "큰 질량") | 코드 리터럴 | 자체 |
| `Resources/Art/map/keyshot` (brazier·fallen_root·ribs·rock_0~3·rotten_mass·rubble) | 9 | `layout.json` scope "1-1 남부~중부 외곽 암반·부패 뿌리 연속 질량". **제작 방법·출처 문서 없음**(docs/engine·0마스터플랜 검색 0). 텍스처 이름 `stump/trunk_albedo_tinted_1k`·`*_normal_baked_1k`는 Blender 베이크 자체 제작 정황 | 코드 `Art/map/keyshot/`+모듈 | **불명 9**(자체 추정, 기록 보강 또는 교체) |

### 2.5 이미지 — 1,057파일 (png 1,014·jpg 43)

| 폴더 | 수 | 출처·증빙 | 실제 사용 | 판정 |
|---|---|---|---|---|
| `Resources/Art/map/a2/**` 텍스처 | 161 | Poly Haven CC0(Forest Floor eye-candy.xyz, forest_leaves_02·pine_roots·tree_stump_01 Rob Tuytel, rock_face·rock_ground·burned_ground·bark_brown_02) + Blender 베이크(r1/r3 BaseColor·Normal·AO·Curvature·Rough·Metal). KEYSHOT_A2 "숲 바닥 출처"·"지면"·"새 뿌리 출처", RUNTIME_HOOK 10-30 "출처" | A2 임포터·코드 | CC0+자체, 제출 가능. 크레딧에 "Powered by Poly Haven" 권장(의무 아님) |
| `Resources/Art/map/hell_lighting` | 9 | `rock_face`·`rock_ground`·`burned_ground_01`·`bark_brown_02` `_Diffuse/_nor_gl/_Rough` = Poly Haven 명명 규칙·CC0(KEYSHOT_A2 "기존 CC0 rock_ground"). `torch_flame.png` 시트 출처 미기록 | 코드 `Art/map/hell_lighting/`+이름 | CC0 8 · `torch_flame` 1 자체 추정(기록 없음) |
| `Resources/Art/map/production_finish` | 64 | 웹 `assets/map/ch1/production_finish/chunk_*.png`(source_receipt.json 143행 SHA 일치). 1-1 맵 원화 — AI 이미지 생성(프롬프트 파일 `assets/map/ch1/rottenwood_living_hell_v4~v7_prompt.txt`, MAP_OBJECT_SEEDREAM_PIPELINE·ART_TEAM_MASTER §3.1 Seedream/GPT Image, MagicLight 유료 포인트) | `Data/ch1_map`→`Map.Data.chunks` 텍스처 | AI, 제출 가능 |
| `Resources/Art/map/props` | 27 | 웹 `assets/map/ch1/*` 소품 컷아웃 — Seedream 5.0 Pro 파이프라인(MAP_OBJECT_SEEDREAM_PIPELINE 2026-09-30 사용자 승인) | `Map.Data.props` | AI, 제출 가능 |
| `Resources/Art/map/boss_arena/ground_dark_soil.png` | 1 | FDG_SOURCE_VISUAL_PREVIEW "soil1", 제작 기록 없음 | 코드 | **불명 1** |
| `Resources/Art/map/keyshot` 텍스처 | 4 | 위 keyshot FBX의 베이크 텍스처 | 코드 | **불명 4**(FBX와 함께) |
| `Resources/Art/enemy` (atlas_ch1_8dir ×8 등) | 17 | PixelLab pro 모드 생성(몬스터_스킨_렌더링_파이프라인 "소스 `img/ch1_8dir/…` PixelLab 생성", 2026-04). 영수증 트리아지 12건 중 8건은 "의도된 갱신" | 코드 `Art/enemy/atlas_ch1_8dir_`+방향 | AI(PixelLab 유료, 약관 docs 미열람), 제출 가능 |
| `Resources/Art/player` | 10 | 8방향 전사 스프라이트. 웹 `assets/sprites/player/*/prompt_*.txt` 정황(PixelLab/AI 생성) | 코드 `Art/player/`+방향 | AI, 제출 가능 |
| `Resources/Art/boss/dark_druid` | 7 | 드루이드 2D 시트(웹 보스 스킨, PixelLab 계열) | 코드 | AI |
| `Resources/Art/vfx` (루트 15·combat 47·boss 10·field 7) | 79 | GPT Image 2.5(MagicLight) 시트(KI_SLASH_RADIANT_PROMPTS 2026-10-11) + 5.1 `*_IMPACT24_ENGINE` 문서의 24프레임 시트(imagegen·ffmpeg 가공) | 코드 20경로 | AI, 제출 가능 |
| `VFX/RM1/T_SoftCircle.png` | 1 | 셰이더그래프용 자체 텍스처 | mat | 자체 |
| `Resources/Art/ui/skill_icons` (kiSlash + orb 48×2) | 98 | 웹 `img/skillskin_upscaled/*`(2026-04-10 `auto: sync snapshot`). 2_1 문서: 일부 "사용자 제공 원화 크롭"(skyCrusher), 나머지 제작 도구 기록 없음(기획서 v2.0은 Ludo.ai/PixelLab 병행만 언급). 구슬 48×2는 Unity에서 원형 마스크로 재가공(U05) | 코드 `Art/ui/skill_icons/orb/`+id | **불명 98**(AI 또는 사용자 원화 추정) |
| `Resources/Art/ui/inventory` | 90 | 웹 `img/ui/*`(inventory-assets.json SHA). 유니크 27종 = Higgsfield GPT Image(UI-05만 Seedream, ART_TEAM_MASTER 2026-10-08), 철판·소켓·봉안함 = 은빛 UI 원화(gpt-image 편집, `unity/Tools/ui-assets/원화출처.json`) | 코드 37경로 | AI, 제출 가능 |
| `Resources/Art/ui/silver_hell` | 52 | 실버 헬 UI 원화: OpenAI gpt-image-2/2.5 API(ART_TEAM_MASTER 10-27~10-31, $0.13~0.8) + 웹 CSS SVG 래스터(gate_enter_line·panel_corner = 자체, UNITY_UI_ASSETS) | 코드 32경로 | AI+자체 |
| `Resources/Art/ui/stat`·`skill`·`settings`·`death`·`currency`·`boss`·`forge`·`tutorial`·`lobby_poster`·`overlay`·`keybind`·`clear`·`area`·루트 | 87 | 웹 현행 UI 원화 재추출(UNITY_UI_ASSETS "현행 웹에서 기존 static 숨김 CSS로 다시 추출"), 화폐 오브 = 내장 imagegen(CURRENCY_RENAME), 글리프 아틀라스 = 자체 폰트 조판 | 코드 | AI+자체 |
| `Resources/Art/ui/cursors/*.bytes` | 24 | 웹 커서(05-21 "커서 대개편") 자체 가공 | 코드 | 자체 추정 |
| `Resources/Art/FullscreenWide` | 128 | 웹 전체화면 원화 64종 × 21:9/32:9(`Data/fullscreen_wide.json` 원본 SHA·decoded RGBA 일치). 타이틀 배경·로비·사망 원화 = gpt-image/Kling 정지화(UNITY_TITLE_SIGNBOARD_A) | `Data/fullscreen_wide.json` | AI |
| `Resources/Art/Loading`(+Difficulty 10) | 74 | 웹 `img/lording/*` 리마스터 — GPT Image 2.5·Seedream(ART_TEAM_MASTER §4.2) | 코드 `Art/Loading/`+이름 | AI |
| `Resources/Art/Startup`(Nemesis 21 + 2) | 23 | 웹 `assets/cutscene/images/00~20.png` 동일 바이트(UNITY_MAC_STARTUP_FLOW, `Data/startup_source_ledger.json`) — GPT Image 2.5 sunburst(ART_TEAM_MASTER §4.1) | 코드 | AI |
| `Resources/Art/CharacterSelect`(generated 4 포함) | 33 | 웹 `assets/charselect/*`(art-provenance.json SHA), 포스터는 영상 첫 프레임(AI), `generated/*`는 절차 생성(자체) | `Data/character_presentation_media_20261025.json`·코드 | AI+자체 |
| `Resources/Art/lobby` | 24 | 눈알 로고 gpt-image-2 리마스터, 바르칸 idle(AI), 초상(AI); lobby-assets.json SHA | 코드 | AI |
| `Resources/Art/TitleSignboard` A 5·C2 3 | 8 | A = 웹 승인 정지화(gpt-image) 무손실 변환(manifest.json `externalGenerationCalls: 0`), C2 = Kling 프레임 | 코드 | AI |
| `Resources/Art/PetBubble` | 2 | 디로이·핵터 말풍선 초상(PETS LOCK, GPT Image) | 코드 | AI |
| `Remodel/CH1_1/Materials/Decals` | 19 | 피·뼈·뿌리·물기 데칼 + 노멀. **제작 기록 없음**(RM1_SLICE·RUNTIME_HOOK은 사용·비활성만 언급) | RM1_Slice 씬 | **불명 19** |
| `Remodel/CH1_1/Materials/Ground` | 9 | `ch1_1_r1r2_colormap*` = 웹 1-1 맵 원화에서 구운 컬러맵(AI 원화 파생), `floor_v01b~03b` = map3d 바닥 원화(Seedream) | 씬 | AI 파생 |
| `Remodel/CH1_1/Materials/Mass` | 2 | `mass_v01` = "기존 확정 아트 map3d mass_v01"(RM1_SLICE) — Seedream→Meshy→Godot 2.5D 렌더(ART_TEAM_MASTER 10-21 map3d) | 씬 | AI |
| `Remodel/CH1_1/Generated`·`CH1_3/Generated` png | 3 | Unity 베이크 산출 | 씬 | 자체 |
| `Remodel/Boss/DarkDruid/Source` png | 3 | Meshy rigged GLB 내장 BaseColor·Normal·MetalRough 추출 | 검사용 | AI, 정책 교체 |
| `Art/Characters/**` png | 21 | Meshy PBR 텍스처(Warrior·Ivan·Silvertail·무기·R7) | 프리팹 | AI, 정책 교체 |
| `Rendering/Sandbox/terrain_oxblood.png` | 1 | 샌드박스 단색 지형 | RM_Sandbox 씬(개발용) | 자체 |

### 2.6 셰이더·VFX·Unity 파생·데이터·코드

| 구분 | 수 | 출처 | 판정 |
|---|---|---|---|
| `.shader` 31 · `.hlsl` 1 · `.shadergraph` 11 | 43 | 전부 자체 작성. 43파일 헤더에 Copyright·License·URL 0(전수 grep) | 자체 |
| `.vfx` 7 · `.vfxblock` 3 | 10 | Unity VFX Graph 자체 | 자체 |
| `.mat` 80 · `.asset` 59 · `.terrainlayer` 8 · `.unity` 4 · `.prefab` 3 · `.anim` 3 · `.mixer` 2 · `.playable`·`.mask`·`.cubemap`·`.controller` | 163 | Unity 에디터 파생물 | 자체 |
| `Resources/Data/*.json` 51 · Remodel·Editor·keyshot·TitleSignboard·RM1 JSON 45 | 96 | 게임 데이터·영수증·레이아웃. 29개 언어 표시 문자열 포함 | 자체 |
| `.cs` 493 · asmdef 3 · asmref 1 · py 1 · ps1 1 | 499 | 자체 작성(Runtime·Editor·Core). 서드파티 소스 반입 0(헤더 grep: 라이선스 문구 0) | 자체 |
| `Packages/manifest.json` | — | Unity 공식 패키지 10종(URP 17.6.0·Shader Graph·VFX Graph·Cinemachine 6.6.0·Input System 1.20.1·ProBuilder 6.1.4·Timeline·AI Navigation 2.0.16) = Unity Companion License, 빌드 포함 가능. `com.coplaydev.unity-mcp`(git aa5fc638) = **MIT**(저장소 LICENSE 확인 "Copyright (c) 2025 CoplayDev"), Editor 전용·플레이어 빌드 미포함 | 제출 가능 |
| 레퍼런스 자산 | 0 | Fontainebleau·Book of the Dead·Megascans·Unity Asset Store·Mixamo 자산은 `unity/Assets`에 **반입 0**(docs 검색: 11-05 에셋 분해 측정·비교 용도만, CLAUDE.md "레퍼런스의 에셋·코드는 반입하지 않는다" 준수) | — |

### 2.7 실제 파일 열 — Mac 목록 합산 (1,656파일 · 3,631MiB = 3.81GB)

Mac이 디스크에서 읽은 크기·해상도·길이를 §2 폴더 그룹에 맞춰 합쳤다. 안내 파일 열은 전 그룹 "없음"(예외 Remodel CH1_3 Data의 영수증 1개). 해상도는 그룹 안 최소~최대, mp4 길이·FBX 내부는 Mac도 못 읽었다.

| 그룹(§2 행) | 파일 | 크기 | 해상도 / 길이 | 판정 요약 |
|---|---|---|---|---|
| 폰트(+OFL·asset) | 30 | 105.6MB | — | OFL |
| Audio/Bgm | 16 | 85.3MB | 62.2분 | Suno·ElevenLabs |
| Audio/Lobby | 6 | 25.5MB | 19.1분 | Suno 5 · 확인 1 |
| Audio/Startup | 4 | 9.4MB | 7.0분 | Suno 2 · 불명 2 |
| Audio/Ambient | 1 | 0.1MB | 0.2분 | ElevenLabs |
| Audio/RM1(+json) | 38 | 0.8MB | 0.7분 | ElevenLabs 36 · CC? 1 |
| Audio/UI | 20 | 7.8MB | 0.8분 | AI 11 · 자체 2 · CC? 6 · 불명 1 |
| Audio/SFX | 53 | 2.1MB | 1.7분 | AI 2 · **불명 51** |
| Audio/루트(+mixer 2) | 19 | 1.2MB | 0.6분 | **불명 17** |
| StreamingAssets 영상 | 15 | 339.4MB | 길이 미읽음 | AI(Kling 확정 2, 도구 미기록 10, 복원 3) |
| Art/Characters(Meshy) | 51 | 307.8MB | 2048²~4096² | AI, 정책 교체 |
| DarkDruid Source | 6 | 65.0MB | 2048² | AI, 정책 교체 |
| Enemies3D(+json 2) | 32 | 95.1MB | FBX 내장 | AI, 정책 교체 |
| map/a2 r1 Models | 11 | 2.4MB | — | 자체+CC0 |
| map/a2/r3(모델·재질·텍스처) | 91 | 207.1MB | 1024²~4096² | 자체+CC0 |
| map/a2 기타(Poly Haven·ground·hollow 등) | 131 | 177.3MB | 1024²~4096² | CC0+자체 |
| map/hell_lighting | 9 | 22.9MB | 1024²~2048² | CC0 8 · 기록 없음 1 |
| map/production_finish | 64 | 120.0MB | 1026² 고정 | AI |
| map/props | 27 | 18.9MB | 32²~1143×1400 | AI |
| map/keyshot(FBX 9·텍스처 4·json 1) | 14 | 8.6MB | 1024² | **불명 13** |
| map/boss_arena | 1 | 2.1MB | 1024² | **불명 1** |
| Art/enemy | 17 | 26.2MB | 1774×887~8192×1280 | AI(PixelLab) |
| Art/player | 10 | 0.4MB | 384×512~1008×48 | AI |
| Art/boss | 7 | 16.7MB | 887×1774~2400×724 | AI |
| Art/vfx | 79 | 97.2MB | 256²~6144×1152 | AI |
| ui/skill_icons | 98 | 2.9MB | 118²~420×512 | **불명 98** |
| ui/inventory | 90 | 29.2MB | 51²~1836×858 | AI |
| ui/silver_hell | 52 | 9.8MB | 120×9~2560×1440 | AI+자체 |
| ui/기타 | 87 | 25.9MB | 34²~3200×1456 | AI+자체 |
| ui/cursors | 24 | 0.1MB | bytes | 자체 추정 |
| FullscreenWide | 128 | **1,061.2MB** | 1660×700~7680×2160 | AI. 용량 1위(WebGL 300MB 상한의 3.5배, WG 레인 참고) |
| Loading(+Difficulty) | 74 | 396.0MB | 1672×941~5119×1439 | AI. 용량 2위 |
| Startup | 23 | 74.3MB | 835×348~2048×1152 | AI |
| CharacterSelect | 33 | 43.0MB | 64²~3840×2160 | AI+자체 |
| lobby | 24 | 41.6MB | 384×624~3072×7488 | AI |
| TitleSignboard(+manifest) | 9 | 24.3MB | 44×203~5760×1620 | AI |
| PetBubble | 2 | 3.5MB | 1536×1024 | AI |
| Remodel Decals | 19 | 14.7MB | 256²~1024² | **불명 19** |
| Remodel Ground(+json 2) | 11 | 57.0MB | 1024²~4260×3031 | AI 파생 |
| Remodel Mass | 2 | 4.4MB | 1024² | AI |
| Remodel 기타(씬·Generated·Data·mat·cs) | 123 | 93.9MB | 128²~256² | 자체 |
| Shaders·Resources/VFX·VFX·QA | 53 | 1.7MB | — | 자체 |
| Data | 51 | 2.3MB | — | 자체 |
| 기타(Resources 루트 1) | 1 | 0.0MB | — | 자체 |

4096px 이상 이미지 91장, 오디오 총 92.3분. 권리 불명 202파일의 용량은 약 45MB(skill_icons 2.9 + Decals 14.7 + keyshot 8.6 + 효과음 3.3 + boss_arena 2.1 + Startup 2종·entry_hover 약 12)로 전체의 1.2%지만, 1-1 전투 소리 전부가 들어 있다.

## 3. 교체 또는 제거 필요 목록

### 3.1 권리 불명 (202) — 제출 전 교체 또는 출처 입증

| # | 자산 | 수 | 1-1 데모 영향 | 권장 조치 | 담당 |
|---|---|---|---|---|---|
| R1 | `Audio/SFX` 51 + `Audio/*.mp3` 17 (타격·사망·발소리·기합·보스 포효·패링) | 68 | **치명**: 전투 소리 전부 | ElevenLabs SFX Forge로 키별 재생성(구독 범위, SFX_FORGE 카탈로그 `hit/blade_flesh·blade_bone·parry_clang` 등 이미 있음) 후 같은 키에 덮어쓰기. `voice_parry1~4`·`male_grunt`·`voice_grunt`·`player_hit1~4`·`voice_holyDome`는 ElevenLabs 보이스(실버테일 전례 Sarah)로 재녹음 | 사운드 총괄 |
| R2 | `Audio/Startup/enter.mp3`, `Audio/Startup/wakeup.mp3`, `Audio/UI/entry_hover.wav` | 3 | 첫인상(ENTER·기상 음성·호버 루프) | ElevenLabs 재생성("Wake up, hey monster"는 TTS 1줄) | 사운드 총괄 |
| R3 | `Resources/Art/ui/skill_icons` 98 | 98 | 스킬 창·HUD 아이콘 전부 | 2_1 문서에서 "사용자 제공 원화" 목록 확인 → 사용자 원화는 출처 기록만 추가, 나머지는 gpt-image로 재생성(실버 헬 톤 통일 기회) | 디자인 총괄 |
| R4 | `Remodel/CH1_1/Materials/Decals` 19 | 19 | RM1 데칼(피·뼈·뿌리) | 제작 세션 기록 찾기(I:/EXODUSER-Storage/demo-art) → 없으면 자체 베이크로 재제작 | 맵 |
| R5 | `Resources/Art/map/keyshot` FBX 9 + 텍스처 4 | 13 | 1-1 외곽 암반·뿌리 질량 | Blender 레시피 파일(tools/blender-env 또는 I:) 확인해 "자체 제작"으로 기록. 없으면 Poly Haven CC0 암석으로 교체 | 맵 |
| R6 | `Resources/Art/map/boss_arena/ground_dark_soil.png` | 1 | 보스 아레나 바닥 | Poly Haven CC0 soil 또는 a2 ForestSoil로 교체 | 맵 |

### 3.2 출처는 있으나 라이선스 조건 미확인 (8)

| # | 자산 | 수 | 출처 | 조치 |
|---|---|---|---|---|
| C1 | `Audio/UI/pickup_item.mp3` | 1 | freesound #667271 (alegemaate) | freesound 페이지에서 CC0/CC-BY 확인. CC-BY면 크레딧 표기, CC-BY-NC면 교체(ElevenLabs). PRECHECK X5 |
| C2 | `Audio/UI/pickup_rummage1~5.mp3`, `Audio/RM1/druid_spore.mp3` | 6 | freesound #257570 (kodack) 슬라이스 | 같은 절차. `druid_spore`는 r3a 채택본이라 CC 조건에 따라 ElevenLabs 후보로 되돌릴 수 있음 |
| C3 | `Audio/Lobby/intro_gate_original.mp3`, `StreamingAssets/Lobby/intro.mp4` | 2 | 음악 Suno(OK) + 내레이션 음성 도구 미기록 | 내레이션 생성 도구(ElevenLabs 계정 이력) 확인. 확인 못 하면 ElevenLabs로 재녹음·재합성 |

(웹 `sfx/hit/player_projectile_impact.wav` Bisqo #855371 CC BY 4.0은 `sfx/hit/ATTRIBUTION.txt`로 출처가 정리돼 있으나 Unity에는 반입되지 않았다.)

### 3.3 정책 교체 (68) — 권리 아닌 결정 사항

Meshy·Tripo 생성 메시 FBX 44(Characters 11 · DarkDruid 3 · Enemies3D 30)와 텍스처 24(Characters 21 · DarkDruid 3). DIRECTION_RESET 11-05 "AI 3D 생성 메시를 자산 기본형으로 쓰는 방식을 폐기" + CHROMA 플랜 §2 ④ "생성 메시 금지 유지". 크로마 규정상으로는 AI 생성이라 제출 가능하고 유료 크레딧 사용 기록이 있다. 제출 시점(01-06)까지 손 조형·스캔 기반으로 교체되지 않은 모델이 남으면 **"AI 생성(Meshy/Tripo)"으로 공개**하고 제출한다(§0 ⑩).

### 3.4 AI 생성 영상 도구 기록 보강 (10)

`title_motion_20260929`·`_hd`, `cs_idle_*` 5, `lobby_varkan_crypt_loop_v2_unity`, `intro.mp4`, `fdg_intro.mp4`. 권리 위험은 낮다(자체 원화를 AI로 움직인 것). 다만 §0 ⑩ "요청 시 도구 정확 공개"를 위해 생성 도구·요금제(MagicLight Hailuo 추정)를 ART_TEAM_MASTER 로그에서 역추적해 적는다. 무료 체험(워터마크·상업 불가) 결과물이 섞였는지가 확인 포인트다.

## 4. 실제 사용 대조표 (폴더 → 코드·데이터 참조)

| Resources 폴더 | 파일 | 참조 방식 | 근거 |
|---|---|---|---|
| Art/ui | 351 | 리터럴 91경로(`Art/ui/inventory/items/`·`skill_icons/orb/`·`stat/`·`silver_hell/*` 등) + `Data/inventory_icons.json` | Runtime grep |
| Art/map | 348 | a2 24경로·hell_lighting 6·keyshot 5·boss_arena 1 리터럴, production_finish·props는 `Map.Data.chunks/props` 텍스처 경로(`NativeGame.StreamChunks`) | Runtime grep·`Data/ch1_map.json` |
| Art/FullscreenWide | 128 | `Data/fullscreen_wide.json` 64행 `resource` | Data |
| Art/vfx | 79 | 리터럴 15 + `Art/vfx/combat/`·`field/` 접두어 | Runtime grep |
| Art/Loading | 74 | `Art/Loading/`·`Art/Loading/Difficulty/` 접두어 | Runtime grep |
| Audio/SFX·RM1·UI·Bgm·Lobby·Startup·Ambient·루트 | 154 | 어근 144 직접 + 6 `ddung_` 접두어 + `voice_parry`·`boss_howl` 변형 번호 | Runtime grep |
| Art/CharacterSelect | 33 | 리터럴 15 + `Data/character_presentation_media_20261025.json` | 둘 다 |
| Art/fonts | 30 | 리터럴 20(폰트 전부) | Runtime grep |
| Art/lobby·Startup·TitleSignboard·enemy·player·boss·PetBubble | 73 | 리터럴 각 1~10 + `Data/startup_source_ledger.json` | Runtime grep |
| Audio 외 Enemies3D | 32 | `Data/enemy_rig_models.json` `modelResource: Enemies3D/<모델>` 30 | Data |
| VFX/Impact·VFX/RM1·QA·Shaders | 46 | `Shaders/*` 38리터럴, `VFX/Impact` 6, `QA/GroundDecal` 2 | Runtime grep |
| Data | 51 | `Data/*` 리터럴 51 | Runtime grep |
| StreamingAssets/Lobby | 12 | 파일명 리터럴 11(`title_motion_20261028.mp4`만 미참조) | Runtime grep |
| Art/Characters·Remodel·Rendering·VFX(Resources 밖) | 232 | 프리팹·씬(`RM1_Slice.unity`, `Remodel3DLoad`)·URP 설정 경유 — 폴더 단위 참조 확인, 파일 단위 GUID 전수 미실시 | 추정 |
| Editor 비코드 6 · Scenes 3 | 9 | 개발 전용(MapLint 프로필·LookDev 프리셋·RM_Sandbox) | 빌드 미포함 |

## 5. 제출 패키지에 넣을 크레딧 초안 (영문, 요청 시 공개용)

- Fonts: Cinzel, Cinzel Decorative, Hahmlet, Nanum Myeongjo (NHN), Noto Sans KR / Noto Serif / Noto Serif CJK / Noto Naskh Arabic / Noto Serif Thai — SIL Open Font License 1.1.
- Scanned textures and meshes: Poly Haven (CC0) — Forest Floor (eye-candy.xyz), forest_leaves_02, pine_roots, tree_stump_01, rock_face, rock_ground, burned_ground_01, bark_brown_02 (Rob Tuytel et al.). "Powered by Poly Haven".
- Music: Suno (paid plan, 2026-02~07) 22 tracks; ElevenLabs Music 1 track (Druid boss theme).
- Sound: ElevenLabs text-to-sound (51 files, RM-1 boss and UI); freesound.org #667271 alegemaate, #257570 kodack (조건 확인 뒤 표기 문구 확정).
- Images and video: OpenAI gpt-image-2 / 2.5, MagicLight (Seedream 5.0 Pro, GPT Image 2.5 sunburst, Hailuo 2.3), Higgsfield (GPT Image 2.5, Seedream), Kling 4.0 (Pro), PixelLab (8-direction enemy sprites).
- 3D (교체 전까지): Meshy 7.1 (mesh, rigging, animation library), Tripo (auto rigging).
- Engine: Unity 6 URP, Cinemachine, Input System, ProBuilder, Timeline, Shader Graph, VFX Graph (Unity Companion License). Editor tooling: MCP for Unity (CoplayDev, MIT) — not shipped.

## 6. 남은 일

1. 사운드 총괄: R1·R2 71개 ElevenLabs 재생성 명세(키·장면 카드·길이) → 사용자 청음 → 같은 키 덮어쓰기. C1·C2 freesound 조건 확인.
2. 디자인 총괄: R3 스킬 아이콘 98 출처 분리(사용자 원화 vs 미기록) 뒤 재생성 범위 확정.
3. 맵: R4·R5·R6 제작 기록 복원 또는 CC0 교체.
4. 아트: §3.4 영상 10개 생성 도구 역추적 → ART_TEAM_MASTER 로그에 추가.
5. 이 표는 unity/main `64745756d` 기준, 실제 파일 열은 Mac 목록 295c002ff 기준이다. 자산이 늘면 §2 표에 행을 추가하고 첫 줄 4개 숫자를 갱신한다. 제출 직전(01-05) 1회 재점검한다.
