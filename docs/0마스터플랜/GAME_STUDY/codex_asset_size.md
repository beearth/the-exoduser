# Resources 용량 절감 계획과 정적 대조표

작성일: 2026-11-05 KST. **계획 문서이며 자산·코드·임포트 설정 변경 및 제품 검증 결과가 아니다.**

## 1. 범위·기준·결론

- [사실] 작업본 `E:/exoduser-wt/codex-study-combat-team`, 브랜치 `codex/unity-study-asset-size-20261105`, 기준 HEAD `75add6ff4a6209e2590a7a626ffb4c37b5f0268e`. 시작 시 tracked/untracked 변경 없음. 먼저 `I:/EXODUSER-Storage/codex-takeover/study-asset-size/CX7_our_tech_audit.md`를 읽고 원본 집계와 대조했다.
- [사실] 작성 범위는 이 문서 하나. checkout·sparse 변경, 자산 이동·삭제, Unity·Player 실행, 빌드, stage·commit·push를 하지 않았다. 이번의 문서 한 개·커밋 금지 지시를 일반 운영 규칙보다 우선한다. 총괄 검토 뒤 커밋할 상태로 인계한다.
- [사실] 기준 프로젝트 버전은 `unity/ProjectSettings/ProjectVersion.txt:1`의 **6000.6.7f1**. 공식 근거는 요청한 Unity 6000 계열 중 버전이 고정된 6000.0 문서와 동일 주제의 6000.6 문서를 사용했다. 웹 확인일은 2026-11-05다.
- [사실] Resources 원본은 **2,881,554,015 byte = 2,748.06 MiB = 2.684 GiB**다. 브리프의 ‘2.75GB’는 약칭이며, 십진 GB로는 2.882GB다. 이하 `MiB=2^20 byte`, `GiB=2^30 byte`로 통일한다.
- [추정] 우선순위는 **카탈로그 도달불가 후보 확인 → 데모 콘텐츠 포함 목록 → 유지할 와이드 원화 압축 시험 → 필요한 해상도만 축소 → Addressables 단계 전환**이다. 단순 미참조 후보 정리만으로 전체 문제가 해결되지는 않는다.

표기: `[사실]`은 해당 SHA의 Git blob·스크립트·직렬화된 `.meta` 또는 URL에서 확인했다는 뜻이다. `[추정]`은 제안·작업량·이론적인 텍스처 payload 계산이다. 원본 byte, 임포트 payload, Player 설치 크기, Steam 다운로드 크기, RAM/VRAM은 서로 다른 지표다. **이번에는 실제 빌드 감소량·로드 시간·메모리·시각 품질 모두 미확인**이다.

경로 약어: `RES/`=`unity/Assets/Exoduser/Resources/`, `R/`=`unity/Assets/Exoduser/Runtime/`, `E/`=`unity/Assets/Exoduser/Editor/`. 소스 파일:줄은 위 HEAD 기준이다.

### A2R은 별도 보존분

| 구분 | 확인 내용 | 이 계획의 합계 처리 |
|---|---|---|
| 현재 HEAD의 Resources | [사실] 1,417개 원본, 2,881,554,015 byte. `RES/A2R` 없음 | 본문 기준 분모 |
| `codex/unity-a2r-keep-20261105` | [사실] 로컬 ref `3c07e220658ddf819929fd5f538a2f5f5067ab6f`. `RES/A2R`의 .meta 제외 797파일/1,247,335,249 byte = 1,189.55MiB = 1.162GiB | 별도 보존. 브리프의 ‘A2R 1.19GB’와 단위·집계 범위를 함께 기록하며 현재 절감량에 합산하지 않음 |
| `origin/unity/main` | [사실] 조사 시 로컬 ref `0a5802e84eb90ea62fa96dd1518034bc49edeeaf`에도 `RES/A2R` 없음 | 원격 fetch를 하지 않았으므로 최신 원격 상태 확인이라는 뜻은 아님 |

현재 `Art/map/a2` 386.82MiB는 위 A2R 보존분과 **다른 경로**다. ‘A2R 제거로 현재 빌드 1.19GB 절감’이라는 계획은 성립하지 않는다. 보존 브랜치 병합 여부도 이번 계획의 실행 대상이 아니다.

## 2. 폴더별 원본 크기

[사실] 재현 명령은 `git ls-tree -r -l HEAD -- unity/Assets/Exoduser/Resources`. blob byte를 합산하고 `.meta`를 제외했다. 디스크에서 sparse로 빠진 파일도 Git tree를 통해 포함한다. `.meta`는 용량 합계에서는 제외하고 §5 설정 조사에는 포함했다. Resources 밖 StreamingAssets 원본 68,692,282 byte는 감사의 별도 수치이며 이 분모에 더하지 않는다.

### Resources 바로 아래

| 폴더 | 원본 파일 수 | Git 원본 byte | MiB |
|---|---:|---:|---:|
| Art | 1135 | 2,639,706,495 | 2517.42 |
| Audio | 157 | 138,608,912 | 132.19 |
| Characters | 1 | 10,113 | 0.01 |
| Data | 51 | 2,437,965 | 2.33 |
| Enemies3D | 32 | 99,711,618 | 95.09 |
| QA | 1 | 1,227 | 0.00 |
| Shaders | 27 | 85,886 | 0.08 |
| VFX | 13 | 991,799 | 0.95 |
| **합계** | **1417** | **2,881,554,015** | **2748.06** |

### Art 바로 아래

| 폴더 | 원본 파일 수 | Git 원본 byte | MiB |
|---|---:|---:|---:|
| boss | 7 | 17,529,137 | 16.72 |
| CharacterSelect | 33 | 45,044,234 | 42.96 |
| enemy | 17 | 27,507,104 | 26.23 |
| fonts | 30 | 110,748,202 | 105.62 |
| FullscreenWide | 128 | 1,112,785,500 | 1061.23 |
| Loading | 74 | 415,262,186 | 396.02 |
| lobby | 24 | 43,659,500 | 41.64 |
| map | 348 | 586,511,657 | 559.34 |
| PetBubble | 2 | 3,628,529 | 3.46 |
| player | 10 | 448,467 | 0.43 |
| Startup | 23 | 77,902,311 | 74.29 |
| TitleSignboard | 9 | 25,479,589 | 24.30 |
| ui | 351 | 71,252,957 | 67.95 |
| vfx | 79 | 101,947,122 | 97.22 |

### map 하위

| 폴더 | 원본 파일 수 | Git 원본 byte | MiB |
|---|---:|---:|---:|
| a2 | 233 | 405,608,808 | 386.82 |
| boss_arena | 1 | 2,201,462 | 2.10 |
| hell_lighting | 9 | 23,986,288 | 22.88 |
| keyshot | 14 | 9,061,382 | 8.64 |
| production_finish | 64 | 125,797,652 | 119.97 |
| props | 27 | 19,856,065 | 18.94 |

하위 표는 상위 표의 분해이므로 서로 더하지 않는다. 직접 파일을 담은 전체 88개 폴더의 중복 없는 합산표는 부록 A에 있다.

## 3. Resources.Load 키 전수 대조

### 3.1 방법과 판정의 한계

[사실] HEAD의 `unity/Assets/**/*.cs` **491파일 전체**에서 `Resources.Load`, `LoadAll`, `LoadAsync` 호출 형태를 검색했다. 텍스트상 호출은 Editor `Load` 31개, 그 외 `Load` 370개·`LoadAll` 2개, `LoadAsync` 0개다. 335개 소스 행에 분포한다. 이는 C# 컴파일러의 호출 그래프나 실행 횟수가 아니며, QA·조건부 코드도 포함한다. 별도 Resources 디렉터리는 `unity/Assets` tree에 없고, 대상 원본 1,417개에서 확장자를 뺀 키의 충돌은 0개다.

1. [사실] 1,417개 키를 C# 전체 및 Resources JSON 56파일의 문자열과 대조했다. 전체 경로가 있는 상수·헬퍼 인자·데이터 필드도 보존 근거로 취급했다. 문자열이 코드에 있다는 것만으로 실제 호출 가능·데모 사용이 증명되지는 않는다.
2. [사실] 아래 표의 접두사+배열·숫자·방향·데이터 필드를 풀었다. 헬퍼에 넘기는 문자열, 중간에서 만드는 `glyph_`, `node_`, `slot_`, `impact_el`도 확인했다. `LoadAll` 폴더는 포함하는 자산 전체를 보호했다.
3. [사실] 자동 대조는 보수적으로 전체 문자열 집합과 접두사를 조합한다. 실제 호출과 무관한 문자열이 우연히 일치해도 보존 쪽으로 남긴다. 따라서 ‘문자열 근거/조합 근거/패턴 포함’은 실제 사용 확정 개수가 아니다. 반대로 무제한 인자·외부 저장값·직렬화 의존성까지 닫히지 않은 범위는 **판단 불가**로 남겼다.
4. [사실] 와이드 카탈로그는 문자열 일치 뒤 `Find`의 선택 조건까지 별도로 추적했다. 빈 `native` 행의 68개 출력은 일반 문자열 불일치 후보와 겹치지 않는 별도 후보로 분리했다.

**씬·프리팹·머티리얼·FontAsset·VFX의 GUID 직접 참조와 Resources 위치는 별개다.** Resources 안에는 코드 미참조 자산도 포함될 수 있고, Resources 밖 자산도 씬·프리팹의 의존성이면 빌드에 포함될 수 있다. 이번 작업은 스크립트 안 키 대조이므로, 아래 ‘미참조 후보’를 **삭제 가능 자산**으로 바꾸지 않는다. 실제 제외 전에는 활성 Build Profile 씬부터 GUID 의존성과 에디터 생성 경로를 확인해야 한다. [Unity 6000.0 빌드 크기 문서](https://docs.unity3d.com/6000.0/Documentation/Manual/ReducingFilesize.html)

### 3.2 동적 키 해석표

| 호출·생성 근거 | 해석한 키·패턴 | 이번 판정 |
|---|---|---|
| `R/NativeFullscreenArtwork.cs:13–23`, `RES/Data/fullscreen_wide.json` | `rows[].outputs[].resource` → `Art/FullscreenWide/{00..63}-{21,32}` 128개. `Find`는 `native`가 비어 있지 않고 원본 texture.name과 파일명이 같아야 선택 | 카탈로그 문자열 전체 보호 뒤 빈 native 34행/68출력은 §3.4 후보로 분리. 나머지 60개도 데모 실제 표시 여부는 미확인 |
| `R/NativeUiViewport.cs:39`, `R/NativeLoadingSelection.cs:7` | `Art/Loading/{01..12,15,16,18,19}{빈문자,-16,-21,-32}`. 허용 외 index는 01로 치환. `-unavailable-qa`는 의도적 누락 시험 | 기본 16개+와이드48개 보호. 임의 숫자 전체로 과대 확장하지 않음 |
| `R/NativeNextDifficultyPanel.cs:9,21` | `Art/Loading/{09,07,11,15,19}`, `Art/Loading/Difficulty/{동일 ID}-{dim,hover}` | 10개 사전 필터 원화는 현재 사용 후보. 단순 중복 원화로 삭제 제안하지 않음 |
| `R/NativeGame.cs:393,445–446,470–471,532`, `RES/Data/ch1_map.json` | map의 `chunks[].texture`, `props[].texture`; `Art/player/{south,south-east,east,north-east,north,north-west,west,south-west}`; `Art/enemy/atlas_ch1_8dir_{빈문자,walk_}{east,south_east,south,south_west,west,north_west,north,north_east}` | `SpriteFor(resource)`까지 추적. map 데이터의 경로 문자열과 8방향 atlas 보존 |
| `R/NativeEnemyRigRenderer.cs:22,38`, `R/NativeEnemyRigAnimator.cs:14`, `E/Enemy3DImportCheck.cs:43` | `Data/enemy_rig_models`의 `models[].modelResource` → `Enemies3D/*`; `LoadAll<AnimationClip>(같은 FBX 키)` | 모델 30개 및 내장 애니메이션 경로 보호. provenance 2파일은 판단 불가로 보존 |
| `R/NativeFeedbackAudio.cs:59,63` | `Audio/`+key; `LoadAll<AudioClip>`의 `Audio/{SFX,RM1,UI}` 전체 | 이름별 미발견만으로 이 세 폴더의 클립을 미참조 처리하지 않음 |
| `R/NativeAmbientSources.cs:74`, `R/NativeGameMusic.cs:31,73–75`, `R/NativeLobby.cs:63`, `R/NativeLobby.StartupPresentation.cs:52` | `Audio/RM1/`+`NativeSoundWire` 상수; `Audio/Lobby/`·`Audio/Startup/`+호출 문자열; `Audio/Bgm/`+선택값, boss일 때 `bgm_druid_boss` 우선/원래 이름 폴백 | 고정 문자열은 조합. BGM의 열린 선택값 나머지는 판단 불가. 임의 키가 전체 Resources를 읽는 것으로 확장하지 않음 |
| `R/NativeDecisionSound.cs:15–16`, `R/NativeCurrencyOrb.cs:7–11` | `Audio/UI/ddung_{1..3}{빈문자,_dark}`; `Art/ui/currency/malice-orb-stage-{1..4}` | CLI clamp·배열 상한까지 해석 |
| `R/Core/NativeCursorSteps.cs:9,24`, `R/NativeCursorOption.cs:18` | `Art/ui/cursors/cursor_{dark,purple}_{20,24,28,32,40,48,56,64,80,96,112,128}` | `.bytes`를 TextAsset으로 읽는 24키 보호 |
| `R/NativeLobby.cs:39`, `R/NativeLobby.CharacterPresentation.cs:54–56`, `R/NativeLobby.SilverCharacter.cs:22–27` | `Art/lobby/`+Art 인자; `Art/CharacterSelect/`+cuts/busts/portrait/poster 배열. `Art/ui/silver_hell/emblem_{silvertail,hellgunner,transmuter,spearmage}_disabled` | 배열 이름과 `emblem_warrior_ui64`를 보호. 큰 이전 emblem은 별도 후보 |
| `R/NativeLobby.SilverHell.cs:24,173,228–230`, `R/NativeLobby.SilverLobby.cs:133` | `Art/ui/silver_hell/btn_thorn_{normal,primary}_{24,32,48,64,96}_{1,2}x`; `lobby_enter_{ready,disabled}_{1,2}x` | 높이 배열·화면 밀도 두 단계 해석. 일괄 UI 밉맵 변경 금지와 별개 |
| `R/NativeLobby.StartupPresentation.cs:47`, `R/NativeTitleSignboard.cs:8,31` | `Art/Startup/Nemesis/{00..20}`; `Art/TitleSignboard/C2/{still,fall-near,fall-far}` | 현재 생성 루프·Root 상수 보호. `TitleSignboard/A`는 이 로더의 키가 아님 |
| `R/NativeInventory.cs:38–51`, `R/NativeGame.UiFinishCapture.cs:142` | `Art/ui/inventory/unique/`+uniqueArt+`_cut` (QA에서는 `ui-{01..27}_cut`); `items/`+baseKey+`{_cutout,_phys}`. ring1/2→ring, headband/2→earring 변환 | JSON 전체 경로는 보존. 저장 아이템 입력·현재 제품 도달성까지 완전 해석하지 못한 나머지는 판단 불가 |
| `R/NativeInventoryStorage.cs:17`, `R/NativeInventoryOssuary.cs:17,38` | `storage/slot_`+InventoryState.Slots; `ossuary/bone_{skull,torso,arms,legs}_dim` | 기존 파일명에 맞는 슬롯 패턴과 4개 bone 보호 |
| `R/NativeStatPanel.cs:69,107,355`, `RES/Data/stat_defs_web.json` | `Art/ui/stat/glyph_`+defs의 glyph; `node_{stat,major,passive}_{selected,base}`; `Tex(name)` 고정 인자 | 단순 문자열 찾기로 빠졌던 glyph31개·node6개를 조합/패턴에 복구 |
| `R/NativeSkills.cs:167–169,218`, `R/NativeHudSkills.cs:41` | `Art/ui/skill_icons/orb/`+id+`{빈문자,_dim}`; `Art/ui/skill/empty_socket_{2..4}` | socket은 확정 패턴. orb의 정의·장착·저장 상태 전체 도메인은 판단 불가로 남김 |
| `R/NativePauseMenu.A15Web.cs:540,550` | `Art/ui/settings/{char,cursor}_`+idx | 기존 숫자 접미 파일 전체를 보수적 패턴 보호. 옵션 유효 범위와 실제 선택성은 추가 확인 |
| `R/NativeHud.cs:40–46`, `R/NativeSkills.cs:72`, `R/NativeSkillView.cs:52–55`, `R/KiSlashView.cs:24,31–34` | `Required(path)`, `Tex(path)`, `Whole(path)`, `Material(resource)` 호출 인자의 완전 경로 | 래퍼 본문의 변수 이름만 보고 판단 불가 전체로 만들지 않고 호출 인자 대조 |
| `R/NativeDruidArt.cs:12,18–24`, `R/NativeDruidBody.cs:110–130` | `Art/boss/dark_druid/`+`{base8_v3,attack,walk,beast,transform,dive,emerge}`; `Art/vfx/boss/`+리터럴/상수 | BodyDir/VfxDir 조합 보호. 이전 독구슬 후보는 현 스크립트 경로와 불일치 |
| `R/Vfx/CombatImpactView.cs:95–98,127–130`, `R/Vfx/CombatImpactTimeline.cs:94–105` | `Art/vfx/combat/`+Sheet/Fallback; `impact_el{0..5}{_sheet_v2,_boss_sheet_v2}`; 고정 Boom/Flip 인자 | v2 12키를 패턴 복구. 구판 `_sheet` 및 교체 전 원화는 후보 |
| `R/NativeSkillView.Malice.cs:89–93`, `R/NativeGame.WorldDrops.cs:78` | `Art/vfx/{skill_malice_smoke,skill_malice_arcane,skill_malice_impact_pal}`; `world_item_drop_beams_v3_0{1..4}` | 배열/프레임 4개 패턴 보호 |
| `R/NativeGame.A2Field.cs:53–63`, `R/NativeGame.A2Forest.cs:196`, `R/NativeGame.A2Arena.cs:38` | `Art/map/a2/ground/`+필수 배열, `A2_FieldMoss_`+채널; foreground/hollow/stump 특수 모델、roots의 `A2_`+id、나머지 `RF3_`+source | 고정·조합 문자열 보호. r3 선택 변환·머티리얼/FBX 내장 참조까지 닫히지 않은 나머지는 판단 불가 |
| `R/NativeGame.HellEnvironment.cs:24,41–50`, `R/NativeGame.HellGround.cs:20–22`, `R/NativeGame.HellArenaLighting.cs:44` | keyshot/layout의 module; `hell_lighting/{rock_face,rock_ground,bark_brown_02}_{Diffuse,nor_gl}`; stump/trunk의 `{_albedo_tinted_1k,_normal_baked_1k}` 및 ground의 Diffuse/normal/Rough 배열 | 완전·접두사 문자열은 보호. 나머지 map 의존성은 판단 불가 |
| `R/NativeA15SettingsLabels.cs:91–98`, `R/NativeLobby.cs:100–104` | 언어→Font 경로 사전의 완전 키 | CJK 폰트가 크다는 이유로 미참조 취급하지 않음. 나머지 FontAsset 간 직접 참조는 판단 불가 |
| Editor `PortVerification.cs:24–32,66–81,124`, `Hd2dRuntimeVerification.cs:285` | map texture·shader 이름 배열·Audio 키·로비 이름·폰트 weight·inventory 이름 | Editor에만 쓰는 증거도 보수적으로 보존. Player 필요성과는 별도 |

### 3.3 전체 1,417개 분류

| 분류 | 파일 수 | 원본 byte | MiB | 해석 |
|---|---:|---:|---:|---|
| 문자열 근거 | 486 | 1,023,292,470 | 975.89 | 전체 키 문자열 발견. 직접 호출·상수·데이터 중 하나이며 실제 도달성 보장 아님 |
| 미참조 후보 | 73 | 66,209,943 | 63.14 | 보호 근거 불일치, 삭제 확정 아님 |
| 조합 근거 | 166 | 266,015,750 | 253.69 | 접두사+문자열, glyph 등 조합으로 보호 |
| 카탈로그 도달불가 후보 | 68 | 686,901,106 | 655.08 | outputs에는 있으나 native가 비어 현재 Find가 선택하지 못함 |
| 판단 불가 | 361 | 392,602,612 | 374.42 | 동적 입력/직렬화 의존성을 닫지 못해 보존 |
| 패턴 포함 | 263 | 446,532,134 | 425.85 | 숫자·방향·배열·LoadAll 패턴 보호 |
| 합계 | 1,417 | 2,881,554,015 | 2,748.06 | 위 분류는 서로 배타적 |

‘문자열 근거·조합 근거·패턴 포함’은 정적 대조의 상한이며 데모 포함 명세가 아니다. 카탈로그 도달불가 후보 68개와 일반 미참조 후보 73개, 합계 **141개/753,111,049 byte = 718.22MiB**는 추가 검토 대상이다. 73개 안의 폰트 OFL 고지 9개/39,596 byte는 라이선스 전달 대상이므로 삭제 절감량에 넣지 않는다.

### 3.4 와이드 카탈로그 도달불가 후보 68개

[사실] `NativeFullscreenArtwork.Find`는 빈 `native` 행을 건너뛴다. `fullscreen_wide.json` 64행 중 **34행이 빈 값**이다. 이 로더에서는 아래 68개 outputs에 도달할 수 없다. 다른 스크립트에서 `Art/FullscreenWide/`를 직접 구성하는 호출도 검색되지 않았다. **데이터에 경로가 있다는 사실과 현재 로더가 선택한다는 사실을 구별**한다. 향후 native 매핑을 붙이려는 보존 원화인지, 실제 데모에서 제외할 원화인지는 총괄이 콘텐츠 목록과 직접 참조를 확인해 결정한다.

두 열의 실제 경로는 각각 `RES/Art/FullscreenWide/{ID}-21.png`, `{ID}-32.png`다. 모든 행은 `[사실: 스크립트 도달불가 후보]`이며 byte는 원본 크기다.

| ID | -21 원본 byte | -32 원본 byte | 합계 MiB |
|---|---:|---:|---:|
| 00 | 6,247,072 | 10,116,175 | 15.61 |
| 01 | 12,810,914 | 15,296,602 | 26.81 |
| 02 | 5,795,385 | 8,570,672 | 13.70 |
| 07 | 9,825,182 | 14,644,612 | 23.34 |
| 08 | 9,679,682 | 13,960,889 | 22.55 |
| 09 | 9,702,540 | 13,748,956 | 22.37 |
| 10 | 9,909,486 | 15,387,987 | 24.13 |
| 11 | 9,308,640 | 14,296,110 | 22.51 |
| 12 | 9,447,873 | 14,638,933 | 22.97 |
| 13 | 9,535,896 | 14,655,545 | 23.07 |
| 14 | 11,500,635 | 16,923,120 | 27.11 |
| 15 | 9,532,519 | 15,061,285 | 23.45 |
| 16 | 8,265,786 | 12,849,390 | 20.14 |
| 17 | 8,085,262 | 12,266,042 | 19.41 |
| 18 | 7,325,138 | 11,190,000 | 17.66 |
| 19 | 10,287,946 | 16,048,614 | 25.12 |
| 20 | 10,954,831 | 16,208,189 | 25.90 |
| 21 | 9,731,040 | 14,570,263 | 23.18 |
| 22 | 11,154,008 | 16,830,378 | 26.69 |
| 23 | 9,951,153 | 14,843,020 | 23.65 |
| 24 | 10,056,362 | 15,148,033 | 24.04 |
| 25 | 7,064,384 | 10,778,332 | 17.02 |
| 26 | 5,536,335 | 8,458,049 | 13.35 |
| 27 | 6,721,339 | 9,951,690 | 15.90 |
| 28 | 5,658,459 | 8,186,290 | 13.20 |
| 29 | 5,868,350 | 8,372,876 | 13.58 |
| 30 | 5,354,636 | 7,920,282 | 12.66 |
| 31 | 5,544,229 | 8,547,138 | 13.44 |
| 32 | 7,717,265 | 12,522,662 | 19.30 |
| 33 | 6,360,443 | 9,399,231 | 15.03 |
| 34 | 6,636,203 | 10,355,593 | 16.20 |
| 35 | 6,261,187 | 9,329,232 | 14.87 |
| 36 | 5,151,951 | 8,083,938 | 12.62 |
| 63 | 2,083,255 | 2,675,592 | 4.54 |
| **34행/68파일 합계** | | **686,901,106 byte** | **655.08** |

### 3.5 일반 미참조 후보 73개 전체

[사실] 아래는 완전 경로 문자열·접두사 조합·동적 보호 패턴에 모두 불일치한 목록이다. ID 접미사가 비슷하다는 이유로 같은 파일이라고 합치지 않았다. 동적 범위 미해석분은 이 목록 대신 §3.6에 넣었다. 제외량의 **검토 상한 63.14MiB**이며 현재 확보된 빌드 절감량은 0이다.

아래 경로는 `RES/` 기준이다. ‘기능 검토’는 대체 자산·폴백·해당 화면을 확인한 다음 포함 명세에서 판단한다는 뜻이다. 라이선스는 별도 전달 위치를 유지하고, QA/ledger는 도구 소비자를 확인한다.

| 미참조 후보 경로 | 원본 byte | 후속 확인 |
|---|---:|---|
| Art/CharacterSelect/emblem_hellgunner.png | 458,950 | 기능 검토·직접 참조 확인 |
| Art/CharacterSelect/emblem_silvertail.png | 1,999,161 | 기능 검토·직접 참조 확인 |
| Art/CharacterSelect/emblem_spearmage.png | 458,617 | 기능 검토·직접 참조 확인 |
| Art/CharacterSelect/emblem_transmuter.png | 654,833 | 기능 검토·직접 참조 확인 |
| Art/CharacterSelect/emblem_warrior.png | 2,022,762 | 기능 검토·직접 참조 확인 |
| Art/fonts/CinzelDecorative-OFL.txt | 4,393 | 라이선스 고지 보존; 절감 대상 제외 |
| Art/fonts/Cinzel-OFL.txt | 4,383 | 라이선스 고지 보존; 절감 대상 제외 |
| Art/fonts/Hahmlet-OFL.txt | 4,477 | 라이선스 고지 보존; 절감 대상 제외 |
| Art/fonts/NanumMyeongjo-OFL.txt | 4,497 | 라이선스 고지 보존; 절감 대상 제외 |
| Art/fonts/NativeCaptionNotoSerif-OFL.txt | 4,396 | 라이선스 고지 보존; 절감 대상 제외 |
| Art/fonts/NativeLobbyNotoSansKR-OFL.txt | 4,387 | 라이선스 고지 보존; 절감 대상 제외 |
| Art/fonts/NotoNaskhArabic-OFL.txt | 4,382 | 라이선스 고지 보존; 절감 대상 제외 |
| Art/fonts/NotoSerifCJK-OFL.txt | 4,301 | 라이선스 고지 보존; 절감 대상 제외 |
| Art/fonts/NotoSerifThai-OFL.txt | 4,380 | 라이선스 고지 보존; 절감 대상 제외 |
| Art/lobby/character_1.png | 1,670,201 | 기능 검토·직접 참조 확인 |
| Art/lobby/character_2.jpg | 116,564 | 기능 검토·직접 참조 확인 |
| Art/lobby/character_3.jpg | 217,115 | 기능 검토·직접 참조 확인 |
| Art/lobby/character_4.jpg | 98,738 | 기능 검토·직접 참조 확인 |
| Art/lobby/fdg_poster.png | 2,576,842 | 기능 검토·직접 참조 확인 |
| Art/lobby/logo_exoduser.png | 749,787 | 기능 검토·직접 참조 확인 |
| Art/lobby/title_bg_20261028.jpg | 602,775 | 기능 검토·직접 참조 확인 |
| Art/player/dash-flight-v1.png | 98,277 | 기능 검토·직접 참조 확인 |
| Art/TitleSignboard/A/background.png | 9,727,967 | 현재 Root는 C2; 이전 A 보존 의도/직접 참조 확인 |
| Art/TitleSignboard/A/hands.png | 590,436 | 현재 Root는 C2; 이전 A 보존 의도/직접 참조 확인 |
| Art/TitleSignboard/A/manifest.json | 2,833 | QA/원본 이력 도구 소비자 확인 |
| Art/TitleSignboard/A/motion-mask.png | 600,832 | 현재 Root는 C2; 이전 A 보존 의도/직접 참조 확인 |
| Art/TitleSignboard/A/silvertail.png | 2,049,791 | 현재 Root는 C2; 이전 A 보존 의도/직접 참조 확인 |
| Art/TitleSignboard/A/still.png | 10,392,306 | 현재 Root는 C2; 이전 A 보존 의도/직접 참조 확인 |
| Art/ui/death/cat_portrait.png | 1,829,510 | 기능 검토·직접 참조 확인 |
| Art/ui/death/crow_portrait.png | 1,799,019 | 기능 검토·직접 참조 확인 |
| Art/ui/minimap_silvertail.png | 10,168 | 기능 검토·직접 참조 확인 |
| Art/ui/mm_frame.png | 1,058,678 | 기능 검토·직접 참조 확인 |
| Art/ui/silver_hell/lobby_enter_btn_silver_20261029.png | 746,305 | 기능 검토·직접 참조 확인 |
| Art/ui/silver_hell/lobby_enter_disabled.png | 343,179 | 기능 검토·직접 참조 확인 |
| Art/ui/silver_hell/name_panel.png | 105,858 | 기능 검토·직접 참조 확인 |
| Art/ui/tutorial/parry-plaque-v1.png | 2,651,144 | 기능 검토·직접 참조 확인 |
| Art/vfx/boss/druid_poison_orb.png | 1,996,511 | 기능 검토·직접 참조 확인 |
| Art/vfx/boss/proj_firedevil_orb.png | 2,026,932 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Blood_FBF_4x4.png | 96,797 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Blood_FBF_4x4_matte.png | 100,564 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/boss/boss_death_blood_24_20261010.png | 5,662,466 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Dark_MediumImpact.png | 186,350 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Ice_ImpactIce_Sheet.png | 186,236 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Ice_MistSmoke_FBF_4x4.png | 72,494 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/impact_el0_boss_sheet.png | 167,626 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el0_sheet.png | 46,580 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el1_boss_sheet.png | 150,050 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el1_sheet.png | 45,354 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el2_boss_sheet.png | 170,647 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el2_sheet.png | 54,434 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el3_boss_sheet.png | 163,678 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el3_sheet.png | 48,000 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el4_boss_sheet.png | 162,692 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el4_sheet.png | 44,881 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el5_boss_sheet.png | 193,680 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/impact_el5_sheet.png | 103,782 | 현재 동적 경로는 v2; 구판 직접 참조 확인 |
| Art/vfx/combat/Lightning_BasicImpact.png | 67,807 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Lightning_BasicImpact_el4.png | 67,056 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Lightning_ImpactLightning_Sheet.png | 186,360 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Lightning_ImpactLightning_Sheet_el4.png | 181,822 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Lightning_Lightning_FBF_4x3.png | 65,909 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Lightning_Lightning_FBF_4x3_el4.png | 62,038 | 기능 검토·직접 참조 확인 |
| Art/vfx/combat/Poison_MediumImpact.png | 185,807 | 기능 검토·직접 참조 확인 |
| Art/vfx/field/proj_bolt_comet.png | 325,439 | 기능 검토·직접 참조 확인 |
| Art/vfx/field/proj_elem_orb.png | 2,372,630 | 기능 검토·직접 참조 확인 |
| Art/vfx/field/proj_elem_orb_el.png | 2,323,667 | 기능 검토·직접 참조 확인 |
| Art/vfx/skill_ice_orb_sheet.png | 2,449,331 | 기능 검토·직접 참조 확인 |
| Art/vfx/skill_malice_impact.png | 55,744 | 기능 검토·직접 참조 확인 |
| Art/vfx/skill_spike_thorn.png | 2,461,785 | 기능 검토·직접 참조 확인 |
| Data/character_presentation_media_20261025.json | 13,331 | QA/원본 이력 도구 소비자 확인 |
| Data/character_ui.json | 1,113 | QA/원본 이력 도구 소비자 확인 |
| Data/keybind_web.json | 31,427 | QA/원본 이력 도구 소비자 확인 |
| Data/startup_source_ledger.json | 6,679 | QA/원본 이력 도구 소비자 확인 |
| **73파일 합계** | **66,209,943** | **63.14MiB, 고지9개 포함** |

### 3.6 판단 불가 361개

| 폴더 | 원본 파일 수 | Git 원본 byte | MiB |
|---|---:|---:|---:|
| Art/fonts | 2 | 7,067 | 0.01 |
| Art/map/a2/foreground/Materials | 1 | 1,373 | 0.00 |
| Art/map/a2/foreground/Textures | 3 | 11,374,122 | 10.85 |
| Art/map/a2/hollow/Materials | 2 | 8,217 | 0.01 |
| Art/map/a2/Materials | 11 | 25,106 | 0.02 |
| Art/map/a2/Models | 10 | 2,403,640 | 2.29 |
| Art/map/a2/r3/Materials | 17 | 40,596 | 0.04 |
| Art/map/a2/r3/Models | 2 | 463,112 | 0.44 |
| Art/map/a2/r3/Textures | 57 | 208,141,350 | 198.50 |
| Art/map/a2/rootrelief/Textures | 3 | 11,730,425 | 11.19 |
| Art/map/a2/roots/Materials | 2 | 8,462 | 0.01 |
| Art/map/a2/roots/Textures | 6 | 33,160,611 | 31.62 |
| Art/map/a2/stump/Materials | 1 | 4,233 | 0.00 |
| Art/map/a2/stump/Textures | 3 | 15,162,378 | 14.46 |
| Art/map/a2/Textures | 77 | 73,462,325 | 70.06 |
| Art/map/hell_lighting | 8 | 22,690,425 | 21.64 |
| Art/map/keyshot | 4 | 8,005,825 | 7.63 |
| Art/ui/inventory/items | 5 | 1,085,757 | 1.04 |
| Art/ui/inventory/unique | 27 | 1,263,144 | 1.20 |
| Art/ui/skill_icons/orb | 97 | 2,873,462 | 2.74 |
| Enemies3D | 2 | 87,530 | 0.08 |
| Shaders | 13 | 51,086 | 0.05 |
| VFX/Impact | 8 | 552,366 | 0.53 |
| **합계** | **361** | **392,602,612** | **374.42** |

나머지 map에는 직접 로드하지 않는 FBX 외부 텍스처·머티리얼이 포함된다. `Shader.Find("EXODUSER/...")`와 shader include 이름은 Resources 키가 아니므로 키 대조 불일치만으로 셰이더를 제외하지 않는다. 원본 provenance·UI Toolkit 설정도 같은 이유로 보존한다. §3.4/3.5의 후보와 이 범위를 합쳐 ‘미사용 총량’이라고 보고하지 않는다.

## 4. 데모 콘텐츠 분리와 Addressables·AssetBundle안

[사실] `unity/Packages/manifest.json`에 `com.unity.addressables` 의존성은 없다. Resources는 로드 여부와 무관하게 빌드 포함 경로다. Addressables는 AssetBundle을 다루는 상위 시스템이며, 번들은 플랫폼별로 빌드한다. **로컬 번들로 포장만 바꾸면 전체 설치량이 자동으로 줄지 않는다.** 데모에 배포하지 않을 그룹을 정하고 실제 빌드·depot 포함 목록에서 빠져야 한다. [Unity 6000.0 Resources](https://docs.unity3d.com/6000.0/Documentation/Manual/LoadingResourcesatRuntime.html), [AssetBundles](https://docs.unity3d.com/6000.0/Documentation/Manual/AssetBundlesIntro.html)

### 권장 그룹과 로드 계약

| 그룹 [추정: 설계안] | 포함 규칙 | 로드·해제·배포 계약 |
|---|---|---|
| Bootstrap | 오류 화면·기본 언어·최소 shader/설정·로딩 UI | 작은 직접 참조 또는 최소 Resources. 다른 모든 그룹을 당기는 참조 금지 |
| FrontendCommon | 현재 타이틀 C2·로비·확정 선택 UI·공통 폰트/음향 | 타이틀 진입 전에 비동기 준비. 화면 전환 뒤 참조/handle 수명 종료. 폴백 정지 화면 유지 |
| FrontendWide | 실제 도달하는 21:9/32:9 원화와 로딩 와이드 | 처음에는 두 비율 모두 데모 로컬에 포함해 오프라인·화면비 변경 보장. 비율별 optional depot은 설치·옵션 복구 UX를 설계한 뒤 별도 검토 |
| CH1_1 | 한 판의 맵·드루이드·적·스킬·SFX·공통 의존성 | 데모의 전체 플레이 경로를 한 번에 예열. 전투 프레임에서 최초 동기 다운로드/로드 금지 |
| Shared | 두 그룹 이상이 쓰는 폰트·셰이더·공통 텍스처 | 하나의 의존성 소유 그룹으로 정하고 중복 빌드 분석. 매우 큰 공통 번들 하나로 회귀하지 않음 |
| FullGameOnly | 데모에서 닫힌 챕터·사용 불가 콘텐츠·도달불가 후보 중 보존 대상 | Resources 밖에서 원본 보존, 데모 catalog와 배포 목록에서는 제외. 정식용 별도 catalog에만 등록 |
| EditorQA | 캡처 fixture·원본 provenance·검수 전용 자산 | 도구 경로와 Player 실행 옵션 계약을 먼저 확인. 제품에 실제 필요한 QA 기능은 임의 삭제하지 않음 |

`NativeFullscreenArtwork`와 `NativeLoadingArtwork` 캐시는 현재 Texture2D를 유지한다. API만 Addressables로 바꾸지 말고 캐시가 소유하는 handle, 화면 교체/로비 복귀 때 release, 진행 중 요청 취소·재진입·실패 복구를 설계한다. 로딩이 완료되기 전 동기 `Draw`/`SpriteFor`가 자산을 요구하는 코드에는 준비 단계를 먼저 둔다. 기존 키를 새 address로 명시 매핑해 JSON·래퍼 호출자를 같은 작업에서 바꾼다. `LoadAll`은 label/manifest 열거로 바꾸되 FBX 내장 AnimationClip과 Audio 전체 예열의 의미를 보존한다.

### 방식·작업량 비교

모든 일수는 `[추정]`, 담당 1명의 실작업 인일이며 Mac·PC 검수 대기와 품질 수정 반복은 별도다. 아래 대안들은 서로 더하지 않는다.

| 방식 | 구체 작업 | 예상 작업량 | 선택 근거·제약 |
|---|---|---:|---|
| 단기 포함 명세 + 현 Resources 유지 | 후보 141개의 직접 참조 확인, 데모에 필요한 카탈로그·폴백 명세, approved 제외/압축 정책 설계·구현, 동일 콘텐츠 검사 | 2–4인일 | 가장 작은 선행 변화. 자산 이동은 별도 구현 작업 승인 후 실시. 이 문서에서는 실행하지 않음 |
| 원화만 Addressables 1차 | 패키지 버전 호환 확인·고정, FrontendWide/Loading 그룹, 키 매핑·비동기 예열·handle/캐시 해제·전환 실패 복구, 중복 분석·오프라인 QA | 5–8인일 | 권장 이행 단위. 큰 원화부터 검증하고 전투 로드는 다음 단계 |
| 전체 Resources Addressables 전환 | 위 작업 + map/rig FBX subasset·VFX·Audio LoadAll·언어 fallback·직접 참조 이행, demo/full catalog·플랫폼별 빌드·회귀 검수 | 총 12–20인일 | 403개 텍스트상 호출을 단순 치환하는 비용이 아님. 1차 5–8인일을 포함한 총량 |
| 직접 AssetBundle 관리 | `BuildPipeline.BuildAssetBundles`, 명세·의존성 순서·키→bundle/asset 매핑·캐시·무결성·버전 호환·UnLoad 수명·재시도·플랫폼 빌드 자체 구현 | 원화 7–11인일, 전체 15–25인일 | 기존 번들 운영층이 없는 상태에서는 권장하지 않음. Addressables와 같은 압축 payload라 이름만 바꿔 추가 절감되지 않음 |

[사실] Addressables 공식 이행 문서는 로딩 코드 변경과 해제 코드 추가를 요구하며, Resources 자산을 Addressable로 표시하면 자동 이동도 일어날 수 있다고 설명한다. 따라서 현 작업에서 체크박스를 켜는 시험도 하지 않는다. 직접 참조와 Addressable을 혼용하면 디스크·메모리 중복이 생길 수 있다. 번들에는 플랫폼별 빌드와 공유 의존성 관리가 필요하다. [Resources 이행](https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/convert-resources-system.html), [중복과 이행](https://docs.unity3d.com/Packages/com.unity.addressables@2.7/manual/AddressableAssetsMigrationGuide.html)

## 5. .meta 기반 텍스처 규칙

### 5.1 현재 직렬화 설정

[사실] Exoduser 전체 TextureImporter `.meta`는 1,057개이며 감사의 수치와 일치한다. 그중 이번 Resources 안 텍스처는 **998개**다. 나머지 59개를 Resources 원본 분모에 합치지 않았다. Standalone `overridden:1`은 전체 0개다. 값은 import artifact 실측이 아니며, 상위 필드와 DefaultTexturePlatform 필드가 서로 다를 수 있다.

| .meta 필드 | Exoduser 전체1,057개 | Resources 안998개 |
|---|---|---|
| 상위 maxTextureSize | 64:1 / 256:4 / 1024:47 / 2048:631 / 4096:85 / 8192:289 | 64:1 / 256:4 / 1024:47 / 2048:574 / 4096:84 / 8192:288 |
| DefaultTexturePlatform maxTextureSize | 1024:13 / 2048:194 / 4096:4 / 8192:846 | 2048:167 / 8192:831 |
| Default textureCompression | 0:853 / 1:27 / 2:177 | 0:831 / 2:167 |
| enableMipMap | 0:569 / 1:488 | 0:544 / 1:454 |
| isReadable | 0:1033 / 1:24 | 0:975 / 1:23 |
| streamingMipmaps | 0:1057 | 0:998 |

압축 숫자 의미: 0=Uncompressed, 1=Compressed, 2=CompressedHQ. 이는 소스 enum과 대조한 직렬화 값이며 실제 BC7 artifact 확인을 대신하지 않는다.

| RES/Art 하위 | 텍스처 .meta 수 | Default max | Default 압축 | mip | Read/Write |
|---|---:|---|---|---|---|
| FullscreenWide | 128 | 8192:128 | 0:128 | 0:128 | 0:128 |
| Loading | 74 | 8192:74 | 0:74 | 0:74 | 0:74 |
| TitleSignboard | 8 | 8192:8 | 0:8 | 0:8 | 0:8 |
| map | 266 | 2048:167 / 8192:99 | 0:99 / 2:167 | 0:99 / 1:167 | 0:254 / 1:12 |
| ui | 327 | 8192:327 | 0:327 | 0:43 / 1:284 | 0:323 / 1:4 |
| enemy | 17 | 8192:17 | 0:17 | 0:17 | 0:17 |
| player | 10 | 8192:10 | 0:10 | 0:10 | 0:10 |

`SourceTextureImporter.cs:17–44`는 Art 경로에 다시 정책을 적용한다. 일반 원화는 uncompressed/max8192/no-mip, UI 일반 분기는 mip+Trilinear, player/enemy는 Point다. a2와 지정 PBR은 max2048/HQ 압축/mip/Trilinear/aniso8이다. 상위 max2048만 보고 UI가 이미 2K로 제한되었다고 쓰면 안 된다. `.meta` 한 필드만 바꿔도 후처리기가 다시 덮어쓸 수 있으므로 향후 구현은 경로 정책과 플랫폼 설정을 함께 설계해야 한다.

### 5.2 보존해야 하는 기존 제약

| 근거 | 현재 계약 [사실] | 계획에 주는 제약 |
|---|---|---|
| `E/SourceTextureImporter.cs:7–13,42` | `ui/lobby_poster/*`, `ui/silver_hell/`의 `btn_*`, `lobby_enter_*`, `visual_*`, `name_*`, `panel_frame*`, `panel_corner*`, `guide_button_glow`는 OriginalUiNoMipmaps | 해당 원화는 no-mip/Bilinear를 보존. 모든 UI에 mip을 켜거나 끄는 일괄 규칙 금지 |
| `E/SilverUiImportCheck.cs:18–30` | 위 silver_hell 대상 및 `Art/CharacterSelect/UI/button_iron.png`를 2회 재임포트해 **mipmapCount==1, !mipmapEnabled, Bilinear, meta 불변**을 요구 | 기존 품질 관문이다. 이번에 실행하지 않았으므로 통과했다고 쓰지 않음 |
| `E/PortVerification.cs:24–27` | map chunk 1026×1026, walk atlas 폭8192, Ki/Hit 시트1254×1254 검증 | 좌표로 Sprite.Create 하는 atlas는 자동 max 축소 대상에서 제외. 셀 경계/정수 pixel 보존 필요 |
| `R/NativeNextDifficultyPanel.cs:19–21` | 사전 필터 lossless sRGB 원화 사용. GPU ARGB32 캐시 후보의 과거 실패를 주석에 명시 | 암부/색공간/hover 품질 확인 전 dim·hover를 실시간 생성으로 대체하지 않음. 주석은 이번 실측 증거가 아님 |
| Read/Write Resources 23개 | CPU가 읽을 수 있는 texture 사본 가능 | GetPixels/합성/커서용 경로를 확인한 뒤 개별 판단. Read/Write 해제를 설치량 절감으로 계산하지 않음 |

[사실] Unity는 mip chain이 보통 디스크·메모리에 약 33%를 더하며 축소 렌더 품질에 도움이 된다고 설명한다. max 해상도 제한과 mip streaming은 목적이 다르다. Read/Write는 CPU 접근용 사본 때문에 메모리를 늘릴 수 있다. BC7은 8bit/pixel, RGBA32는 32bit/pixel이며 플랫폼/API 지원에 따라 fallback될 수 있다. [6000.0 mipmaps](https://docs.unity3d.com/6000.0/Documentation/Manual/texture-mipmaps-introduction.html), [현재 계열 6000.6 mipmaps](https://docs.unity3d.com/6000.6/Documentation/Manual/texture-mipmaps-introduction.html), [Texture Importer](https://docs.unity3d.com/6000.0/Documentation/Manual/texture-type-default.html), [6000.6 GPU 포맷](https://docs.unity3d.com/6000.6/Documentation/Manual/texture-formats-reference.html)

### 5.3 적용할 규칙 제안

모두 `[추정: 후속 구현안]`이며 미적용이다.

| 용도 | 압축·색공간 | max·밉맵·필터 | 통과 조건 |
|---|---|---|---|
| 유지할 FullscreenWide·Loading 배경 | PC DX11/12 및 대상 Mac Metal에서 BC7 HQ 시험. RGB24/RGBA32와 암부·피부·그라데이션 비교, 실패한 원화만 uncompressed 예외 | 우선 원본 해상도 유지해 압축만 분리 시험. 다음에 4096 cap 검토. no-mip/Bilinear 유지 | 1920×1080·3840×1080, 21:9/32:9 전환·움직이는 중심 영상 합성, 1x/3x 비교. 원본 중심영역 좌표·밝기 유지 |
| UI 원화·글자·9-slice·선 | 최초 일괄 압축 제외. 큰 배경판만 BC7 별도 시험, 얇은 글자/알파/테두리는 uncompressed 유지 | OriginalUiNoMipmaps의 mipCount=1 유지. 다른 UI의 기존 mip 정책도 별도 비교 전 유지. 개별 최대 표시 pixel의 1x/2x 밀도를 만족하는 cap | 자간·원화 글자·테두리·hover·alpha fringe·9-slice 이음선 변화 없음 |
| 3D a2/PBR 지면·나무 | 현재 HQ 압축 우선 유지. base color sRGB, normal/rough/mask 데이터는 linear; normal은 NormalMap importer 유지 | 기본2048, 작은 props/mask1024, 매우 작은 보조512를 개별 시험. mip ON/Trilinear/aniso8 보존 | 34° 카메라 근경·먼 적·보스 아레나에서 재질/접지·기울어진 면의 깜빡임 확인 |
| player/enemy/VFX atlas | 색·알파 압축은 셀 경계와 palette 검증 뒤 개별 적용 | atlas 좌표 계약 유지, max8192 필요한 walk는 보존. Point·mip OFF 보존, VFX는 기존 filter 유지 | 모든 방향·프레임·sprite rect 검증과 실제 전투 가독성 |
| 커서 .bytes·폰트·영상 | TextureImporter 규칙 대상 아님 | 별도 자산 파이프라인·언어/미디어 포함 명세 | PNG `.bytes`를 이미지 importer 설정으로 줄인다고 계산하지 않음 |

max4096은 제안 상한이며 원본보다 확대하지 않는다. 32:9 3840pixel 화면의 전체 배경에 max2048을 일괄 적용하면 확대가 발생하므로 기본안으로 채택하지 않는다. PNG 재압축만으로 임포트된 텍스처의 GPU 포맷·해상도가 바뀌지 않는다. 무손실 원본을 Git에 보존하면서 importer·플랫폼 규칙으로 배포 payload를 줄인다. [Unity 6000.0 빌드 크기 분석](https://docs.unity3d.com/6000.0/Documentation/Manual/ReducingFilesize.html)

## 6. Steam 데모 목표와 공개 비교

| 구분 | 공개 확인값·URL | 사용할 수 있는 해석 |
|---|---|---|
| Halls of Torment: Prelude | [사실] Steam 시스템 요구사항에 Windows/Linux **1GB available space**. 무료 Prelude의 별도 공개 페이지: https://store.steampowered.com/app/2316660/Halls_of_Torment_Prelude/ | 유사 장르 공개 체험판의 요구 디스크 공간 사례 1개. 실제 설치 크기·Steam 압축 다운로드 byte는 **미확인**. 정식판 수치를 데모값으로 바꾸지 않음 |
| Steamworks Demos 공식 안내 | [사실] 데모는 별도 AppID/depot/build를 가진다. 범위·품질 지침은 있지만 확인한 안내에서 일률적인 GB 권장값은 찾지 못함: https://partner.steamgames.com/doc/store/application/demos | Valve 의무 용량 목표가 있다고 주장하지 않음 |
| 우리 현재 Steam 데모 | [사실] 이번 HEAD의 실제 Steam manifest·설치 파일·다운로드 byte를 측정하지 않음 | Resources 2,748.06MiB로 현재 Steam 용량을 대신하지 않음 |
| 우리 1차 목표 | [추정: 제안] **다운로드 ≤1.0GiB, 설치 ≤2.0GiB/OS**, 1-1 한 판·타이틀/로비·필수 언어·모든 화면비·오프라인 재실행 포함 | 총괄이 baseline Build Report/depot 실측 뒤 확정할 내부 목표. 타 게임의 실측값 또는 보장값이 아님 |
| 후속 검토선 | [추정: 제안] 설치1.0GiB는 품질·전체 흐름 검증 후 검토할 도전 목표 | 지금 달성 가능하다고 확약하지 않음. 목표를 맞추려고 UI 가독성·32:9 지원·언어·폴백을 임의 삭제하지 않음 |

다운로드 시간 계산은 참고 가정이다. [추정] 1GiB를 유효20Mbit/s로 받으면 약7.2분, 50Mbit/s면 약2.9분이다(프로토콜·설치·디스크 비용 제외). 위 목표는 체험 진입 비용을 줄이려는 제안이며 공개 사례와 동일한 아트·엔진이라는 가정은 없다.

## 7. 줄어드는 양과 실행 순서

### 7.1 원본 포함 범위와 빌드 절감량을 분리

| 순서·작업 [추정: 실행안] | [사실] 검토 원본 범위 | [추정] 가능한 감소·계산 경계 | 선행 조건·작업량 |
|---|---:|---|---|
| 0 기준 측정·포함 명세 | Resources 2,748.06MiB | 이 단계 절감0. Player/Steam baseline 확보 | 총괄/빌드 담당 0.5–1인일. 이번에는 실행 안 함 |
| 1 빈 native 카탈로그 후보 정리 검토 | 와이드68개 655.08MiB | 원본 포함 범위0–655.08MiB. 실제 설치 감소는 해당 imported object의 Build Report 기여량이며 별도 측정 | 다른 호출/직접 참조·향후 보존 의도·실제 화면 확인 0.5–1인일. 제외 또는 native 연결 중 하나를 결정 |
| 2 일반 미참조 후보 검토 | 73개 63.14MiB, 이 중 OFL9개0.038MiB 보존 | 고지 제외 기능 후보64개 원본 상한 약63.11MiB. 삭제 가능량 확정0 | 후보별 대체 화면·QA·GUID 참조 확인 0.5–1.5인일. 단계1과 파일 중복 없음 |
| 3 유지 원화의 압축 | FullscreenWide128개 1,061.23MiB; 단계1 전부 제외 시60개406.16MiB | §7.2의 payload 계산만 사용. PNG byte에 BC7 압축률을 곱하지 않음 | 압축만 우선 시험·대상 PC/Mac 품질 검수 1–2인일 |
| 4 필요한 해상도만 제한 | 128개 중4096 초과25개; 제외 후60개 중 별도 계산 | BC7 상태의 4096 cap 추가 이론 감소: 전체128개100.30MiB, 유지60개30.23MiB | 압축 통과 뒤 해상도 영향 분리. 실제 화면·좌표 검수 1–2인일. 단계3과 중복 합산 금지 |
| 5 데모 제외 콘텐츠 분리 | FullGameOnly는 아직 미확정 | **판단 불가**. 추후 콘텐츠 명세에서 닫힌 그룹의 실측 byte만 더함 | 언어·난이도·대체 캐릭터·모든 fallback 계약 확인. 큰 폴더라는 이유로 제외 금지 |
| 6 원화 Addressables → 전투 확장 | FrontendWide/Loading, 후속 CH1_1 | 로컬 재포장만 하면 절감0 또는 overhead 증가 가능. 데모에서 배포하지 않는 그룹만 실측 감소로 인정 | §4의5–8인일/총12–20인일. 패키지화와 압축 효과 중복 집계 금지 |
| 보존 A2R | 별도 브랜치1,189.55MiB | **현재 HEAD 절감0** | 현재 분모 밖. 반입 시 별도 예산·참조 감사 |

단계1+2의 원본 검토 상한은 718.22MiB(라이선스 고지 제외 약718.18MiB)다. 이 상한을 빌드·다운로드 감소 보장으로 쓰지 않는다. ‘2,748.06−718.22’를 제품 설치 크기로 보고하는 것도 금지한다.

### 7.2 와이드 원화의 텍스처 payload 산식

[사실] 128개 PNG **모두**의 Git blob에서 IHDR 폭·높이를 읽었다. 픽셀 합계 **620,980,304**, 원본 최대 폭7680/최대 높이2160, `.meta`128개 모두 max8192/uncompressed/no-mip/ReadWrite0다. 바이너리를 Unity로 임포트하거나 색·알파 채널의 실제 GPU 포맷을 확인한 것은 아니다.

[추정] RGB24면 `Σ(W×H×3)`, RGBA32면 `Σ(W×H×4)`, BC7이면 `Σ(ceil(W/4)×ceil(H/4)×16)` byte다. cap은 긴 변 기준 비율 유지·원본보다 확대하지 않음·가장 가까운 정수 반올림으로 계산했다. 실제 importer rounding·플랫폼 지원은 후속 실측으로 대체한다. no-mip 기준이며 압축 Player 파일/Steam 다운로드로 환산하지 않는다. [BC7·RGB/RGBA 포맷 근거](https://docs.unity3d.com/6000.0/Documentation/Manual/texture-formats-reference.html)

| 범위·긴 변 cap | 계산 해상도 변경 파일 수 | RGB24 가정 MiB | RGBA32 가정 MiB | BC7 가정 MiB |
|---|---:|---:|---:|---:|
| 전체128개 / 8192 | 0 | 1776.64 | 2368.85 | 592.44 |
| 전체128개 / 4096 | 25 | 1475.91 | 1967.87 | 492.14 |
| 유지60개 / 8192 | 0 | 708.86 | 945.15 | 236.40 |
| 유지60개 / 4096 | 4 | 618.16 | 824.21 | 206.17 |

전체128개 원본 유지 시, RGB24/RGBA32 가정에서 같은 해상도 BC7으로 바꾸는 이론 payload 감소는 **1,184.20–1,776.41MiB**다. 이는 원본 PNG 총량보다 클 수 있는데 측정 대상이 다르기 때문이다. 단계1로68개가 실제 제외된다면 **남는60개에 대해서만** 압축 효과를 계산한다. 60개 원본 해상도에서 RGB24/RGBA32→BC7 감소는 **472.46–708.75MiB**다. 전체128개 압축 감소와68개 제외 감소를 그대로 더하지 않는다.

기준128개 RGB24/RGBA32 가정과 ‘68개 제외+유지60개 BC7/4096’의 이론 최종 payload 차이는 약 **1,570.47–2,162.68MiB**다. 실제 imported 포맷이 다르거나 후보가 직접 참조로 남으면 이 계산도 달라진다. **채택 가능한 품질·실제 빌드 감소량은 미확인**이다.

### 7.3 후속 실행 관문

1. 총괄이 이 계획과 후보를 검토하고, 데모에 남길 화면·언어·난이도·폴백·QA 범위를 확정한다. 원본 보존분을 포함한 GUID 의존성은 씬·프리팹에서 별도로 닫는다.
2. 후속 구현 레인에서 경로/임포트 정책·key catalog·코드를 같은 변경으로 관리한다. 현재 문서 단계에서 자산 이동·삭제·자동 Addressable 표시를 실행하지 않는다.
3. 대상 OS별 동일 콘텐츠 Build Report로 원본 경로→imported payload→설치 파일 기여량을 연결한다. 기존 baseline이 없으면 먼저 하나를 확보하고, 후보당 반복 빌드/해시 manifest는 만들지 않는다.
4. Mac 판정 담당이 동일 SHA Player에서 타이틀→로비→선택→로딩→1-1 전투/보스→종료/복귀를 확인한다. 1920×1080·3840×1080 및21:9, 1x/3x, UI no-mip gate, 어두운 그라데이션·밝기·알파·동기로드 지연·캐시 해제·오프라인 재실행·화면비 전환을 확인한다. 원화 제외로 검은 판/블러 채움을 새로 넣지 않는다.
5. 실제 Steam depot의 OS별 다운로드·설치 byte와 포함 목록을 확인한 뒤 §6의 내부 목표를 판정한다. 업로드·Publish·Set Live는 별도 작업이며 이 계획의 완료 조건에 포함하지 않는다.

## 부록 A. 직접 파일을 담은 전체 폴더 크기

[사실] 각 blob은 자신의 바로 위 폴더에 한 번만 합산했다. 경로는 `RES/` 기준이며 이 표의 합계가 전체2,881,554,015 byte다. `.meta`와 빈 디렉터리는 제외한다.

| 폴더 | 원본 파일 수 | Git 원본 byte | MiB |
|---|---:|---:|---:|
| Art/boss/dark_druid | 7 | 17,529,137 | 16.72 |
| Art/CharacterSelect | 27 | 34,279,277 | 32.69 |
| Art/CharacterSelect/generated | 4 | 7,498,451 | 7.15 |
| Art/CharacterSelect/UI | 2 | 3,266,506 | 3.12 |
| Art/enemy | 17 | 27,507,104 | 26.23 |
| Art/fonts | 30 | 110,748,202 | 105.62 |
| Art/FullscreenWide | 128 | 1,112,785,500 | 1061.23 |
| Art/Loading | 64 | 376,950,598 | 359.49 |
| Art/Loading/Difficulty | 10 | 38,311,588 | 36.54 |
| Art/lobby | 24 | 43,659,500 | 41.64 |
| Art/map/a2/foliage/Materials | 1 | 2,186 | 0.00 |
| Art/map/a2/foreground/Materials | 1 | 1,373 | 0.00 |
| Art/map/a2/foreground/Models | 1 | 1,702,204 | 1.62 |
| Art/map/a2/foreground/Textures | 3 | 11,374,122 | 10.85 |
| Art/map/a2/ground | 12 | 32,813,628 | 31.29 |
| Art/map/a2/hollow/Materials | 3 | 12,321 | 0.01 |
| Art/map/a2/hollow/Models | 1 | 647,516 | 0.62 |
| Art/map/a2/Materials | 11 | 25,106 | 0.02 |
| Art/map/a2/Models | 11 | 2,530,244 | 2.41 |
| Art/map/a2/r3/Materials | 17 | 40,596 | 0.04 |
| Art/map/a2/r3/Models | 17 | 8,957,948 | 8.54 |
| Art/map/a2/r3/Textures | 57 | 208,141,350 | 198.50 |
| Art/map/a2/raisedroots/Models | 1 | 1,712,284 | 1.63 |
| Art/map/a2/rootrelief/Materials | 1 | 1,368 | 0.00 |
| Art/map/a2/rootrelief/Models | 1 | 1,723,756 | 1.64 |
| Art/map/a2/rootrelief/Textures | 3 | 11,730,425 | 11.19 |
| Art/map/a2/roots/Materials | 2 | 8,462 | 0.01 |
| Art/map/a2/roots/Models | 2 | 1,484,472 | 1.42 |
| Art/map/a2/roots/Textures | 6 | 33,160,611 | 31.62 |
| Art/map/a2/stump/Materials | 1 | 4,233 | 0.00 |
| Art/map/a2/stump/Models | 1 | 909,900 | 0.87 |
| Art/map/a2/stump/Textures | 3 | 15,162,378 | 14.46 |
| Art/map/a2/Textures | 77 | 73,462,325 | 70.06 |
| Art/map/boss_arena | 1 | 2,201,462 | 2.10 |
| Art/map/hell_lighting | 9 | 23,986,288 | 22.88 |
| Art/map/keyshot | 14 | 9,061,382 | 8.64 |
| Art/map/production_finish | 64 | 125,797,652 | 119.97 |
| Art/map/props | 27 | 19,856,065 | 18.94 |
| Art/PetBubble | 2 | 3,628,529 | 3.46 |
| Art/player | 10 | 448,467 | 0.43 |
| Art/Startup | 2 | 2,769,335 | 2.64 |
| Art/Startup/Nemesis | 21 | 75,132,976 | 71.65 |
| Art/TitleSignboard/A | 6 | 23,364,165 | 22.28 |
| Art/TitleSignboard/C2 | 3 | 2,115,424 | 2.02 |
| Art/ui | 8 | 2,081,749 | 1.99 |
| Art/ui/area | 1 | 22,784 | 0.02 |
| Art/ui/boss | 3 | 1,254,344 | 1.20 |
| Art/ui/clear | 1 | 11,963 | 0.01 |
| Art/ui/currency | 4 | 413,907 | 0.39 |
| Art/ui/cursors | 24 | 137,613 | 0.13 |
| Art/ui/death | 5 | 5,970,832 | 5.69 |
| Art/ui/forge | 2 | 975,314 | 0.93 |
| Art/ui/inventory | 9 | 7,489,462 | 7.14 |
| Art/ui/inventory/crystals | 5 | 3,185,021 | 3.04 |
| Art/ui/inventory/items | 22 | 16,488,639 | 15.72 |
| Art/ui/inventory/ossuary | 10 | 2,127,608 | 2.03 |
| Art/ui/inventory/storage | 17 | 26,652 | 0.03 |
| Art/ui/inventory/unique | 27 | 1,263,144 | 1.20 |
| Art/ui/keybind | 1 | 15,710 | 0.01 |
| Art/ui/lobby_poster | 2 | 4,799,794 | 4.58 |
| Art/ui/overlay | 1 | 21,494 | 0.02 |
| Art/ui/settings | 5 | 213,637 | 0.20 |
| Art/ui/silver_hell | 52 | 10,325,747 | 9.85 |
| Art/ui/skill | 13 | 4,345,014 | 4.14 |
| Art/ui/skill_icons | 1 | 206,925 | 0.20 |
| Art/ui/skill_icons/orb | 97 | 2,873,462 | 2.74 |
| Art/ui/stat | 39 | 4,189,148 | 4.00 |
| Art/ui/tutorial | 2 | 2,812,994 | 2.68 |
| Art/vfx | 15 | 16,701,808 | 15.93 |
| Art/vfx/boss | 10 | 56,491,126 | 53.87 |
| Art/vfx/combat | 45 | 5,253,412 | 5.01 |
| Art/vfx/combat/boss | 2 | 8,373,716 | 7.99 |
| Art/vfx/field | 7 | 15,127,060 | 14.43 |
| Audio | 19 | 1,216,100 | 1.16 |
| Audio/Ambient | 1 | 153,016 | 0.15 |
| Audio/Bgm | 16 | 89,455,758 | 85.31 |
| Audio/Lobby | 6 | 26,788,501 | 25.55 |
| Audio/RM1 | 38 | 826,706 | 0.79 |
| Audio/SFX | 53 | 2,205,854 | 2.10 |
| Audio/Startup | 4 | 9,825,534 | 9.37 |
| Audio/UI | 20 | 8,137,443 | 7.76 |
| Characters | 1 | 10,113 | 0.01 |
| Data | 51 | 2,437,965 | 2.33 |
| Enemies3D | 32 | 99,711,618 | 95.09 |
| QA | 1 | 1,227 | 0.00 |
| Shaders | 27 | 85,886 | 0.08 |
| VFX/Impact | 12 | 816,732 | 0.78 |
| VFX/RM1 | 1 | 175,067 | 0.17 |
| **합계** | **1417** | **2,881,554,015** | **2748.06** |

## 인계 상태

[사실] 지정 Markdown 문서만 작성했다. 원본·소스·설정·checkout·sparse와 Git HEAD는 변경하지 않았고 커밋·push도 하지 않았다. 조사용 임시 파일은 지정 `study-asset-size` 디렉터리 안에서만 사용하고 정리했다. 정적 대조 결과와 계획을 인계하며, Unity 임포트·빌드·실제 Steam 크기·시각 품질은 전부 미확인이다.
