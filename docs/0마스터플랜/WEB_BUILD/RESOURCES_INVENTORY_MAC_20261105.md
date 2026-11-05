# 자산 전수 목록과 영어 문자열 점검 (2026-11-05, Mac)

크로마 제출 준비용 읽기 전용 조사이다. **코드와 자산은 바꾸지 않았다.** 권리 판정은 하지 않았고 LC 레인의 재료이다. 기준 파일은 `a1ee5666c` 체크아웃이고, 조사한 경로와 Runtime은 `unity/main` `64745756d`와 차이가 없다(`git diff --name-only`). 복원 스크립트로 내려받은 영상도 디스크에 있는 대로 포함했다.

## 1. 자산 목록

[`resources_inventory_mac_20261105.csv`](resources_inventory_mac_20261105.csv): 파일 1,656개, 3.81GB. 열: 경로, 확장자, 크기, guid, 이미지 해상도, 오디오 길이·채널·레이트, 폰트 패밀리·라이선스 칸, 주변 안내 파일, 비고.

지시 범위 밖이지만 게임에 실릴 수 있어 `Art`, `Remodel`, `VFX`도 넣었다.

| 위치 | 파일 | 크기 |
|---|---|---|
| `Exoduser/Resources` | 1,418 | 2,882MB |
| `StreamingAssets` | 15 | 356MB |
| `Exoduser/Art` | 51 | 323MB |
| `Exoduser/Remodel` | 161 | 246MB |
| `Exoduser/VFX` | 11 | 0.7MB |

| 종류 | 파일 | 크기 |
|---|---|---|
| png | 1,013 | 2,636MB |
| mp4 | 15 | 356MB |
| fbx | 88 | 355MB |
| mp3 | 145 | 131MB |
| jpg | 43 | 87MB |
| unity 장면 | 2 | 78MB |
| otf / ttf | 3 / 14 | 74MB / 37MB |
| asset | 46 | 35MB |
| wav | 9 | 8MB |

### LC가 볼 것

- **권리 안내 파일이 거의 없다.** LICENSE, README, 출처 이름의 파일이 가까운 폴더에 있는 자산은 11개뿐이고, 그것도 `ch1_3_source_receipt.json` 하나이다. **안내 파일 부재는 권리 없음을 뜻하지 않는다.** 출처는 docs와 커밋 기록에서 찾아야 한다.
- **폰트 패밀리:** Cinzel, Cinzel Decorative, EXODUSER Latin Serif, EXODUSER Lobby Sans KR, Hahmlet, Hahmlet Light, NanumMyeongjo, Noto Naskh Arabic, Noto Sans KR Thin, Noto Serif, Noto Serif CJK JP·SC·TC, Noto Serif Thai. 대부분 폰트 내부 라이선스 칸에 라이선스 문구가 있고, NanumMyeongjo는 해당 칸에 회사 이름만 읽혔다. EXODUSER 두 폰트는 이름을 바꾼 파생본으로 보여 원본 확인이 필요하다(추정).
- **못 읽은 값:** mp4 길이·해상도, fbx 내부, Normal png 2개 해상도(`Atlas_moss_01_Normal`, `Atlas_shrub_03_Normal`). 크기와 guid는 있다.
- **용량:** WebGL 상한(계획 300MB)에 비해 큰 값이다. 1-1에 필요한 분량은 이 목록만으로 나오지 않는다.

## 2. 영어 데이터

[`english_data_gaps_mac_20261105.csv`](english_data_gaps_mac_20261105.csv). `Resources/Data/*.json`을 훑었다. 파일마다 구조가 달라 판정은 휴리스틱이다.

| 항목 | 수 | 해석 |
|---|---|---|
| ko·en 짝 또는 29언어 항목 | 436 | |
| 영어 비어 있음 | 1 | `a15_options_web` entries[81] |
| 영어 칸에 한글 섞임 | 2 | `a15_options_web` entries[82~83]. ID 묶음이라 실제 표시 문구가 아닐 수 있음 |
| 영어 짝이 없는 한글 문자열 | 3,992 | **대부분 누락이 아니다.** 아래 |

`visual_select_labels.json`의 1,955개는 언어별로 나뉜 구조에서 한글을 키로 쓰는 것이다. **번역 층이 한글을 키로 쓰는 구조**(`Translate`, `T`, `L` 호출)도 있어 `affix_defs_web` 672, `skill_defs_web` 273, `bossbar_web` 225 등은 런타임에 번역될 수 있다. 위 CSV는 **검토 후보 목록**이고 누락 확정이 아니다.

**29언어 전체 누락은 세지 않았다.** 지시의 핵심인 en만 봤다.

## 3. 코드 한글 문자열

[`korean_code_literals_mac_20261105.csv`](korean_code_literals_mac_20261105.csv). `Runtime/**/*.cs`의 한글 문자열 2,888개.

| 분류 | 수 |
|---|---|
| 제품 코드, 근처에 언어 분기 없음 | 2,044 |
| 제품 코드, 근처에 언어 분기 있음 | 74 |
| QA·캡처·검사 코드 | 나머지 |

제품 코드 상위: `Core/DropTablesData.cs` 652, `NativeInventoryComparison.cs` 93, `Core/EnemyTables.cs` 79, `NativeSkills.cs` 75, `NativeStatPanel.cs` 61, `NativeInventoryDock.cs` 59, `NativePauseMenu.cs` 52.

**2,044는 상한이다.** 번역 키로 쓰이는 문자열, 표시되지 않는 내부 값, 디버그 문구가 섞여 있다. 줄 단위 정규식이라 분기 판정은 근사이다.

### 코드를 읽어 확인한 고정 문자열

| 위치 | 내용 | 확인 |
|---|---|---|
| `NativeGame.WorldDrops.cs:143` | 획득 알림 `Toast(... + " 획득!")` | **한글 고정.** `Toast`(`NativeGame.cs:555`)에 번역 없음 |
| `NativeInventoryDock.cs:468` | `" 악의오브 획득."` | 문자열 확인, 호출 경로는 안 봄 |

## 4. 다음 단계에서 필요한 것

**실제 영어 설정으로 1-1을 돌려 화면에 한글이 남는지 보는 것이 가장 확실하다.** 이 조사에서는 하지 않았다. 앞선 영상 촬영에 `-qa-locale en`을 줘도 HUD에 한글이 나왔는데, 그 인자가 영어 화면을 보장하는지는 확인하지 않았다.
