# FDG Godot Windows x64 native preview — 2026-10-13

## 후속 Web preset 공존 정렬 — 2026-10-13

[Web 실제 플레이 첫 배송](FDG_GODOT_WEB_PLAYABLE_FIRST_20261013.md)을 추가하면서 `export_presets.cfg`의 기존 Windows preset0 원1054B는 보존하고 Web preset1만 더했다. `tools/godot-native-preview/build_windows_preview.py`는 현재10232B/SHA `5fd910f459604bc9ca599bfe823f53331b925a8a0cd8ff22039316a4fb05a75d`이며 새 `override_preset_option(preset,index,key,value)`가 해당 preset의 options section만 교체한다. 기존 Windows main은index0·Web builder는index1을 지정한다. 새로운 pure helper3검사(Windows 수정 시 Web 보존/Web 수정 시 Windows 보존/없는key 거부)는 첫3PASS다. 앞선 Windows ZIP/PE/PCK/ICU/자원 검사·수출은 동결했고 재실행0이며, 아래 Windows artifact 해시와 Windows 실행 미검수 상태는 당시 결과로 유지한다. 후속 Web 실제 플레이 완료를 Windows 실행 관측으로 소급하지 않는다.


## 현재 제작 상태

현재 native 지원5/미이식11 소비를 Windows x64 preview로 실제 export했고, exported PCK만 mount한 신규 고유3 검사가 최초 모두 PASS했다(exit0/2.049584041초). 원 물 PNG2를 프로젝트 내부 imported Resource로 포함해 runtime 외부 파일 의존을 제거했다. 검사는 Mac local editor의 새 headless fixture이며 Windows EXE 실행·공개 픽셀·전체 AI·최저사양240FPS 검증을 뜻하지 않는다. 예상 missing 에러1을 제외한 unexpected error0, 성공 재실행0이다. 이후 별도 필수 ICU 검사1에서 첫 PCK의 TextServer 설정false/데이터 부재가 실제 FAIL했으므로 첫3 PASS를 완전한 standalone 패키지 판정으로 쓰지 않는다. 부모가 export setting1leaf를 true로 수리해 별도 output으로 다시 export했고, 실패 ICU leaf만 후속 PASS했다. 최신 package의 PE/PCK directory/ZIPCRC 검수도 인수했다. 최초 resource3 PASS + 추가 ICU1 FAIL(assertion2)→실패leaf1 PASS를 구분한다.

| 항목 | 현재 범위 / 경계 |
|---|---|
| parent / 백업 | `3a30d5397e16f76d4cd4dd0d995054c2bcb62501`; 외부 `windows-native-preview-first/new-owned-path-absence.json`에 새 검사/SSOT HEAD·WORK 부재. `backup-before-production/manifest.json`, `backup-before-water-resources/manifest.json`, `backup-before-owned-tools/manifest.json`은 제품 담당의 byte-backup |
| 검사 / SSOT 소유 | 새 `godot/tests/test_windows_native_package.gd`와 이 문서만. 코드·자산·preset/export/build·공통6문서/README·Git은 부모/제품 담당 소유; 타인 WIP 보존 |
| native 지원 범위 | 기존 원 CH1 frozen16의 medium dark2, physical flesh1, physical spine1, ice soul1=5지원/11미이식. 이번 검사에서 원16/full337/seed/factory의 gameplay 계약을 다시 validate하지 않음; 전체AI 지원 승격0 |
| 기존 Mac 실제 앱 | 인간의 source1 fullscreen paused 앱·browser31 유지. 새 source load/GUI 입력/launch/reload0. fixture에서 main bootstrap/user://qa report·기존 latest-session.json 호출/쓰기0 |
| 배송 설정 | Compatibility/OpenGL3 desktop·native physics60/보간·render cap240/VSync0·viewport1920×1080/window1280×720. native/render 설정값 불변. export용 `internationalization/locale/include_text_server_data=true` **1leaf만 source project 수정**; 실제 Windows driver/refresh rate 미관측 |
| protected / combat | `2_3` 문서와 HP/ST/피해/감속/AI/phase/crop 수치 불변. 원24원화/24FPS·새모델/리깅 제작 주장0 |
| 렌더 목표 | 우리 Steam 최소 Windows 등급1080p240 목표는 실측 미검증. 실제 Windows native 플레이·전체UI·픽셀·저사양 성능 보장0 |
| VISUAL VERDICT | **RETOUCH** — 패키지 기술 성립과 공개 플레이/원화/전체경로/성능 검수 분리 |

## 1차 reference / 변경 의도

| reference | 이번 단위의 적용 |
|---|---|
| [이전 ice 소비 정본](FDG_GODOT_ETYPE4_ICE_SOUL_FLAME_20261013.md) | 이전 외부 raw PNG loader/portable=false 수치는 당시 이력으로 보존. 현재 내부패키지 leaf는 이 새 정본이 설명하며 기존본문을 덮어쓰지 않음 |
| `docs/5.0애니메이션파이프라인/몬스터_스킨_시스템.md` | 기존 sprite/body PNG와 gameplay animation 계약을 보존. 새2 copy는 가공/원화 증가가 아닌 export dependency 준비 |
| `godot/project.godot` / export preset | native60과 render240을 나눔. export/import는 별도 staging에서 수행하며 원 geometry/camera/combat/AI 값을 바꾸지 않음 |
| 제품 / tool receipt | `water-resource-production-ready-receipt.json`, `water-original-copy-manifest.json`, `owned-tools-production-receipt.json`, `build-actual-first/build-manifest.json`의 producer/export 이력. source/config 생성 때의 pending은 실제 loader/PCK 검사 결과와 구별 |

## 내부 dependency / 실제 API

| leaf / 소비 위치 | 현재 값 / 소비 / 한계 |
|---|---|
| flight 경로 | 원 `assets/vfx/water_blue_projectile_sheet.png`→`godot/assets/vfx/water_blue_projectile_sheet.png` byte 동일 copy. runtime `res://assets/vfx/water_blue_projectile_sheet.png` |
| impact 경로 | 원 `assets/vfx/Water_ImpactWater_Sheet.png`→`godot/assets/vfx/Water_ImpactWater_Sheet.png` byte 동일 copy. runtime `res://assets/vfx/Water_ImpactWater_Sheet.png` |
| `enemy_projectile_ice.gd:72` | private `_original_texture(path:String)->Texture2D` / static `_original_textures:Dictionary` cache 유지. `ResourceLoader.exists(path,"Texture2D")`→`ResourceLoader.load(path,"Texture2D") as Texture2D`; 실제 imported export remap/cache identity 확인. 이전 raw Image.load_from_file/globalize_path 의존 제거 |
| `enemy_projectile_ice.gd:41`, `:157` | 실제 `_ready` WaterFlight 및 `_add_impact` WaterImpact에 packed Texture2D 소비. loader null은 **Sprite2D 할당 전** `missing_original_water_texture` end/queue/return. 실제 missing fixture에서 end1/blank sprite 설치0·unexpected error0. 누락 경로 입력은 새 profile 복사이며 제품 asset 삭제/실행중 actor 값 강제0 |
| `enemy_projectile_ice.gd:171` | public configure/snapshot 서명 불변. snapshot `portable_export_dependency_packaged=bool(data["portable_export_dependency_packaged"])` 현행 true. Clock/damage/homing/contact/render crop 본문 불변은 제품 담당의 static preservation receipt이며 이번 전투 재검사 근거가 아님 |
| `enemy_factory.gd:374`, `:382`, `:394` | fixed projectile portable flagtrue·animation/impact 내부 경로/external_original_file=false/packaged_original_copy=true. required 물2경로는 `ResourceLoader.exists(path,"Texture2D")`로 admission 전 검사. 본 검사에서 validate_source/consume_atomic/factory 설치 호출0 |
| `runtime.projectile.animation` / `.impact` | texture 내부경로2·external_original_file=false·packaged_original_copy=true·loader imported ResourceLoader. 기존 full numeric contract74/60/120/.667/8flight/16impact는 값수정0·기완료 oracle 재실행0 |
| `runtime.projectile.portable_export_dependency_packaged` | true. prepared imported dependencies가 실제 이번 exported PCK에서 load된 것을 확인. 전체 Windows 동작/AI/visual 완료 flag가 아님 |
| `assets`의 물2 entry | inside_godot_assets=true, reuse_original_repository_file=false, copied_from_original_repository_file=true, new_copy/new_hash/required/missing_is_admission_error/portable_export_packaged=true, bytes/SHA 아래 표. original_source_dependency deep copy에 옛 외부 경로와 당시 false metadata를 보존 |
| 현재 scope / packaging | external_original_water_PNG_dependencies=0, packaged_original_water_PNG_dependencies=2, new_PNG_copy_or_processing=2, new_PNG_hashes=2, water_resource_packaging_prepared=true. source_config_creation_scope는 원값 보존. scope.portable_export_completed=false / packaging.complete_standalone_preview_export_verified=false는 생성 당시 metadata이며 이번 artifact 검사의 상태를 소급 쓰지 않음 |
| 의도 / 한계 | exporter는 raw PNG 대신 imported remap/texture artifact를 포함할 수 있다. 아래 byte identity는 **원 PNG→Godot 내부 원본 copy**의 증거, actual PCK Texture2D 로드가 배송 dependency 증거다. PCK의 raw PNG byte가 그대로 들어간다고 추정하지 않음 |

### 원본2 byte identity — 제품 담당 manifest 인수

| 원본 / 내부 동일 basename | bytes | source before/after = destination SHA256 | 현재 범위 |
|---|---:|---|---|
| `water_blue_projectile_sheet.png` | 501466 | `81c7c640d429cb0ffda887cb4de0adf7e01f02435bcb369e517d2d94f81267af` | 원본 변경0·가공0·Godot 내부 동일 copy |
| `Water_ImpactWater_Sheet.png` | 186899 | `6ce330a1a1a25f7ceb9bcf66987a547c92789ac085f860034dec17deea7710d9` | 원본 변경0·가공0·Godot 내부 동일 copy |
| 합계 | 688365 | 새 copy2/별개 원본 hash2. 검사 worker의 원 PNG 재해시0 | 기존17PNG/source16 재검수0 |

### 제품 artifact — producer READY receipt 인수

| 파일 | bytes / SHA256 | 현재 경계 |
|---|---|---|
| `godot/scripts/enemy_projectile_ice.gd` | 9612 / `073abaea90ca76e240e02c621d898b10c3a72ff6fe673d5f5c69777bd7d04f2a` | 최종 loader/resource leaf. 원source/gameplay값 변경0; 검사 worker 재해시0 |
| `godot/scripts/enemy_factory.gd` | 43198 / `ebdae843f0c8d291e917e1e09f9c6eddface1026d3298bbae52eeefa376b99fb` | 최종 loader/resource leaf. 원source/gameplay값 변경0; 검사 worker 재해시0 |
| `godot/data/etype4_ice_soul_flame.json` | 38013 / `eeb448bc13e74784713497c5198c374911e56fbd6578e27ec03904214ec98435` | 최종 loader/resource leaf. 원source/gameplay값 변경0; 검사 worker 재해시0 |

## export / 실행 package

| 항목 | 실제값 / 상태 |
|---|---|
| Godot / preset | `4.7.2.stable.official.ed1daf0bf` / `Windows Native Preview x64` / Windows Desktop x86_64 / template PE machine0x8664 |
| 공식 template | 외부 `templates/windows_release_x86_64.exe`,109268480B. 공식4.7.2 stable template provenance는 `templates/download-receipt.json` 참조 |
| preset leaf | export_filter=all_resources/include_filter=*.json/exclude_filter=tests/*,tools/*,README.md,run.command,*.md; embed_pck=false/encrypt_pck=false/encrypt_directory=false; custom release template 외부 경로. console_wrapper0/codesign=false/application.modify_resources=false/ANGLE0/D3D12 0/shader_baker=false |
| export 격리 | 외부 stage/godot에서 source asset/data file symlink·metadata/code/cache copy. installed editor settings/기존 user report 수정0. 첫 export 후 원 project는 ICU export setting1leaf만 수리; 전투/render/native60 값 불변. import log의 reimport 대상 PNG명은 신규 물2만이라는 부모 결과 인수; 기존17/원16 반복 import/해시 검사0 |
| 최초 output 위치 | 외부 `windows-native-preview-first/build-actual-first/package/`; ICU누락 당시 이력. 앞선 예정 `B/package/EXODUSER.pck`와 구분 |
| 최초/최종 `EXODUSER-native-preview.exe` | 109268480B / SHA `d34d36f3be1a6c49c56525ae86469b92e4f417ddf0b43cf00dd80c385c4b0562`. `build-actual-first/build-manifest.json` 실제 output 영수증 |
| 최초 ICU누락 `EXODUSER-native-preview.pck` | 117132364B / SHA `bd7838c36d2dd7ba00206c1ff3865dff066b28187fbb0c2937b8668a1dcfba75`. `build-actual-first/build-manifest.json` 실제 output 영수증 |
| launcher | 같은 package의 `launch_windows.cmd`; runtime은 same-directory EXE/PCK 및 fullscreen/cap240 요청. 실제 Windows 실행0 |
| 최종 output 위치 | `windows-native-preview-first/build-icu-repair/package/`. ICU setting 수리 후 두 번째 export exit0; 재import0. 성공3 resource 검사 재실행0 |
| 최종 PCK | 121929956B / SHA `bd786be82167fd92ffdfc36e72fa2b79192c165eeaea354b1e56517eaf1ebf5d`. 최초117132364B/bd7838...와 별도 history |
| EXE PE | AMD64 machine0x8664 / PE32+ optional header0x20b, 공식release template와 bytehash동일. actual Windows 프로세스/한국어 glyph 실행0 |
| PCK directory | format4 /최종288entries, 첫287대비 added=icudt_godot.dat1/changed=project.binary1/removed0. 기존286entry size+저장MD5+flags metadata동일. **payload PNG 재해시/직접 전체 byte 비교0이므로 동일성 증거를 그 이상 확대하지 않음** |
| 최종 artifact receipt | 외부 `package-final-artifact-receipt.json`. PE/PCK directory 및 ZIP검수는 부모 결과이며 아래 actual PCK headless 검사와 Windows 실행 증거를 구분 |

### 최종 ZIP / 6파일 — 부모 artifact receipt 인수

| artifact | bytes / SHA256 | 검수 경계 |
|---|---|---|
| `EXODUSER-Godot-Preview-Windows-x64-20261013.zip` | 157457375 / `321af5874f84805fef92b636920ef1989b35c2be7b5e3c757f281b1aa21ff6a7` | 폴더 EXODUSER-Godot-Preview-Windows-x64·6파일/uncompressed231301651B·ZIPCRC 모두 PASS; Windows 실행0 |
| `EXODUSER-native-preview.exe` | 109268480 / `d34d36f3be1a6c49c56525ae86469b92e4f417ddf0b43cf00dd80c385c4b0562` | 최종 ZIP내 파일; 실제 실행/전체UI/240 증거 아님 |
| `EXODUSER-native-preview.pck` | 121929956 / `bd786be82167fd92ffdfc36e72fa2b79192c165eeaea354b1e56517eaf1ebf5d` | 최종 ZIP내 파일; 실제 실행/전체UI/240 증거 아님 |
| `launch_windows.cmd` | 466 / `ef16d67f5b3a75f223991f6d887ecd1490b6880513232b95468c3802e8119d46` | 최종 ZIP내 파일; 실제 실행/전체UI/240 증거 아님 |
| `README-KO.txt` | 1492 / `00c1d13d99248e63b77212a3517cd08330925e05213ee5a84de5bcdbec4966f5` | 최종 ZIP내 파일; 실제 실행/전체UI/240 증거 아님 |
| `LICENSE-Godot.txt` | 1149 / `b0435e3b3e4e55238f05f4b306f30524a1b2e20147810d436eaa554fa6855c80` | 최종 ZIP내 파일; 실제 실행/전체UI/240 증거 아님 |
| `COPYRIGHT-Godot.txt` | 100108 / `cb1980c88089573bcacd7221d777c689bb8bbd778799f24c27fca0fe5f774d6d` | 최종 ZIP내 파일; 실제 실행/전체UI/240 증거 아님 |

## 신규 검사 결과 / chronology

| 고유 그룹 | 독립적인 delivery oracle | 최초 결과 |
|---|---|---|
| `packed_water_consumers` | 실제 exported PCK만 mount한 빈 외부 project에서 imported Texture2D·production cache identity→WaterFlight/WaterImpact 소비 및 snapshot packagedtrue. lifecycle/전투 physics 호출0 | PASS |
| `missing_water_consumer` | profile 복사의 missing 내부 asset 경로를 실제 `_ready`에 전달해 end/queue·blank sprite 설치0. 실제 예상 missing 오류1을 개별 begin/end marker로 분리 | PASS; 정상 loader error와 혼합0 |
| `packed_runtime_dependencies` | main.tscn load만/instantiate0;15script·7JSON/font/UI/ki VFX·active map/consumer runtime 선언 내부asset107의 존재·로드. geometry/원337/sourcefactory oracle/Factory.validate_source 재실행0 | PASS |

| 실행 leaf / raw | 실제값 / 계수 |
|---|---|
| 첫 고유3 실행 | exit0/2.049584041초/3 PASS/failed_assertions0/incomplete_groups[]. 성공 재실행0·fixture/product 수리0 |
| actual mount | `--path B/tests/empty-project` 실행 전 실제 빈 디렉터리 확인; `--main-pack B/build-actual-first/package/EXODUSER-native-preview.pck`; `--script /Users/fordeargamers/the-exoduser/godot/tests/test_windows_native_package.gd`; `--log-file B/tests/runtime-first.log` |
| 실행 host | Mac local editor4.7.2 headless. stock Windows release의 외부 script 지원을 가정하지 않음. Windows EXE launch/public pixel/performance evidence=false |
| load 계수 | fixture 명시 resource load 요청130 / active runtime 선언 unique resources107 /JSON read9(물profile2+필수7). engine 전체 load·GPU 부하/프레임 계측으로 해석하지 않음 |
| time / 게임 / 저장 | explicit physics method0/automatic simulation ticks0/main instances0/factory installs0/user report writes0/live inputs0/PNG hashes0/기완료 suite0. scene bootstrap은 ResourceLoader.load만 하고 instantiate하지 않음 |
| stderr oracle | 오류1은 `Required packaged original water texture is missing: res://assets/vfx/__fdg_missing_package_water_fixture__.png`의 **예상 거부**. expected_missing_error_lines1/unexpected_error_lines[]; 모든 stderr가0이라고 쓰지 않음 |
| preflight 이력 | 첫 실행 전 source에서 발견한 possible orphan 경로를 producer가 null-before-Sprite allocation으로 정렬. 최초 runtime FAIL/재실행 이력으로 만들지 않음. 첫 test의 typed Texture2D/Sprite2D cast 정렬도 실행 전 fixture 작성 과정 |
| 첫3 실행의 test SHA | 162행/8425B / `633d9851d2ddfc2d4815eac00d7325fef5f4ba3ec54950ad588240c39cd99ab6`. 외부 first-test-source.gd 보존 |
| 외부 증거 | `tests/first-three.stdout.log`, `first-three.stderr.log`, `runtime-first.log`, `first-three-receipt.json`, `contracts-ledger.json`, `owned-final.diff`, `owned-freeze-receipt.json`. 이전 architecture-pending.json은 생성 당시 초안으로 별도 보존 |

이 검사는 새 package의 imported 리소스 성립을 확인한다. main/world/player startup·실제 factory 설치·원16 record 수치·337raw·전투 damage/상태/시간/살아있는 AI를 재검사하지 않았다. headless fixture profile은 검사 대상 PNG 경로 외 gameplay fields를 바꾸지 않았고 running actor HP/좌표/state/timer·callback 승리 주입을 하지 않았다. 공개 인간 Mac 앱과 user session report를 건드리지 않았다.

## 추가 필수 ICU dependency — 기존3 성공과 별도 이력

| leaf / source 요구 | 현재 관측 / 후속 |
|---|---|
| export setting | 정확 `internationalization/locale/include_text_server_data`, project `[internationalization]`의 `locale/include_text_server_data=true`가 Windows release TextServer support data export 조건. 부모의 공식4.7.2 exporter/ProjectSettings 근거 인수; 실제 Windows glyph 관측은 아님 |
| required packed data | `res://icudt_godot.dat`. 새 `packaged_icu_data`만 실제 FileAccess 존재/read size/ICU header를 검사. 수리 PCK에서 fixed prefix32B read, actual length4797472B/header size144/ICU magicDA27/common data formatCmnD·declared header뒤 payload 존재 확인. 전체locale 내용 또는 Windows glyph rendering 검사는 아님 |
| 최초 추가 leaf | first PCK에만 `--only=packaged_icu_data` 한 번. exit1 /0.25572500000000004초 /1그룹FAIL(assertion2) /incomplete0. exported settingfalse·ICU data absent; header/size는 미관측(읽지 않은 값을 유효 data처럼 쓰지 않음) |
| 기존 성공 동결 | 앞의3 PASS/resource130/declared107/JSON9는 당시 first PCK 검사 이력으로 보존. 이 추가 실행 resource load0/JSON0/physics0/main0/source validate0·기존3 재실행0 |
| 실제 후속 | 부모가 export setting1leaf만 백업 후 true로 수리·새 output으로 export. 동일191행/10115B/SHA의 `--only=packaged_icu_data`만 재실행: exit0/0.25378241700000004초/1 PASS/assertion0/incomplete0/stderr0. actual exported settingtrue/ICU4797472B. 성공3 및 기존 combat/source/PNG 반복0 |
| 최종 고유 결과 | 새 고유4 유효 완료: 첫resource3 PASS + 별도ICU1 FAIL2assert→부모setting 수리→실패ICU1 PASS. 최초4 PASS 주장0·기존 성공 재실행0. header/loader 검사는 native game physics/공개 Windows 글리프/성능검사가 아님 |
| raw / source history | `tests/icu-first.stdout.log`, `icu-first.stderr.log`, `runtime-icu-first.log`, `icu-first-receipt.json`, `icu-repaired.stdout.log`, `icu-repaired.stderr.log`, `runtime-icu-repaired.log`, `icu-repaired-receipt.json`; 추가 test191행/10115B/SHA `b4414b011070530a423225212d244550b33cc23e3573784873f70e877eee5bb3`. 첫3 source는 first-test-source.gd에 그대로 보존 |

## MAP PRODUCTION REPORT (§23)

| 항목 | 현재 결과 / 미완 |
|---|---|
| MASTER / STAGE | 지원5/미11의 Windows preview export·내부 water dependency2. 원 snapshot/record/seed/맵 제작0 |
| LARGE / MEDIUM / GROUND / LANDMARK | geometry/nav/collision/배치/material/원PNG 가공0. PCK의 선언 texture 로드는 맵 픽셀/동선QA가 아님 |
| PLAYABLE / COMBAT | 기존 native 소비 유지. 이번 package 검사 main/world/player startup·factory 설치·전투/clock 소비0. Windows native 실제 플레이 미관측 |
| CAMERA QA | 현재 인간 Mac paused source1 앱 보존·새 Windows 공개 pixels0 |
| TECH QA | export exit0 + fresh actual PCK 신규3 첫PASS. 예상 missing 거부1/unexpected0·physics0·성공 재실행0. 첫 PCK ICU 필수 leaf1 FAIL(assertion2)→setting1leaf 수리/별도 export→실패leaf1 PASS. PE/PCK metadata/6파일ZIPCRC 인수; Windows 실제실행/최저240 미검증 |
| FILES / GIT | 이 worker 새test/SSOT만, Git/stage/rollback0. 정상 code+docs checkpoint는 부모 담당; 실제 성공 전 commit 완료표시0 |
| VISUAL VERDICT | **RETOUCH** — 실제 Windows 플레이/전체UI·원화·전체AI/status·전체맵경로/최소사양1080p240 미검증 |
| NEXT PASS | 성공 package를 Windows 실제 기기로 실행해 공개 입력/물탄·감속·UI/driver/performance 확인. 기술 package 검사는 이를 대체하지 않음 |

## 2026-10-21 INTEG-6c 후속 계약

INTEG-6c에서 stage_project는 로컬 override.cfg를 복사하지 않는다(Web builder도 공용 helper 사용). Windows/Web export exclude_filter에도 override.cfg를 추가했다. 로컬파일은 보존하며 프로젝트 기본 저장 이름은 origin/main 기존값을 따른다. 소형stage fixture 검증PASS, 실제 재수출/배포0. 위 artifact해시·당시builder 크기는 과거 검수값이며 현재 파일 byte의 해시로 해석하지 않는다. 상세·실패이력·한계: [INTEG-6c](INTEG6C_REGRESSION_20261021.md) (engine 기준 상대경로).
