# MAPLOOK-TOXIC — 화면 비교 자료 준비

- 작업ID: `maplook-toxic`, Mac 독립 브랜치 `codex/maplook-toxic-mac-20261020`.
- 기준: fetch 후 `origin/main` **0119f3048a459a458ba142d98f68126b8e281be1**. 요구된 `ad497089c`가 조상임을 확인했다.
- 사용자 승인: 독립 toxic_surface 모듈·전용 절차 셰이더·신규 테스트만 작성, 공통 맵 룩의 MODULES 자동 설치를 사용한다. 신규 이미지/AI 생성, 원본 텍스처·재질·visible·z 변경, 공유 RNG·게임플레이·맵 공유 데이터 수정은 하지 않는다.
- 선행 검토: MAP_LOOK_GODOT_PASS1_20261020, native_map_look.gd, CLAUDE 작업물 퀄리티·디자인, UI_FOUNDATION/UI_COMPOSITION. 맵 제작 가이드 §23과 기존 CH1 콘셉트를 적용한다.
- 원로그·화면 비교: `/Users/fordeargamers/exoduser-wt/_out/maplook-toxic/`. 현재 작업자가 보는 Mac 실행본의 자료이며 PC 실행·통합·최종 디자인 승인을 뜻하지 않는다.

## 대상·근거와 표시 계약

| id | 원본 game.html 행 / map.json 배치 | 전용 표시 |
|---|---|---|
| m_c1pool | 17617·18163; (6700,1740), 465×377.9476744186, prop_pool.png | 녹색 액면만 잔물결·끊어진 반사·거품·낮은 증기 |
| pit_poison | 18166·18407; (6500,5580), 200×200 | 불균일한 어두운 흡수층으로 밝은 원판/동심원 대비 억제, 움직이는 비동심 물결 |
| m_c1gtoxic | 17628·18163; (6740,1620), 538.3888888889×550 | 독성 액체 부분만 동일 효과, 흙/석재 보존 |
| m_c1gtoxicf | 17629·18166; (6500,5460), 440.5×450, flip_h | 같은 텍스처 참조, 원본 반전·오프셋·스케일 보존 |

`world.gd:3242–3267`의 실제 Sprite2D를 읽어 동일 Texture2D 참조·transform·offset·flip·frame·필터·z로 자기 Sprite2D 4개를 만든다. 원본에 자식을 달지 않는다. 원본 가시성·위치 변경은 자기 노드만 따라가며, 원본이 없어지면 자기 표시만 숨긴다. 같은 world에 중복 설치하면 기존 모듈을 반환한다. 알려진 네 id 이외는 설치하지 않는다.

| 계약 / 상수 | 값 |
|---|---|
| 진입 / 관찰 | static install(world: Node2D, map_data: Dictionary, player: Node2D) → Node2D; get_snapshot() |
| 연결 | native_map_look.gd:20 MODULES의 기존 toxic_surface 경로, 설치 547–556행. 연결 파일 수정 0줄 |
| 독립 RNG | RandomNumberGenerator, seed=20261020+id.hash(); id별 고정 phase/거품 8개, 공유 randf/seed 호출 없음 |
| 거품 | alpha>.95와 녹색 성분을 만족하는 UV 후보 선택(최대128회), 반경 .006–.014, 수명 phase 고정; 0.13 cycle/sec |
| 시간 | _clock+=delta, 셰이더 visual_time으로 전달; 물결 기준 0.24×초, 불규칙 흐름에 이동 리본 반사 |
| 마스크 | 원본 텍셀 중심·상하좌우·대각 3×3 최소 alpha의 smoothstep(.90,.99) × 원본 RGBA alpha smoothstep(.12,.98) × 녹색 액면 × 내부 basin. 마스크만 원본1텍셀 축소; pit 중심UV(.5,.57), 나머지(.5,.50), 종축1.22, basin반경.32–.47. 지면은 상대 녹색 비율 smoothstep(.04,.30), 분모max(g,.015)로 어두운 액체를 판별. 증기도 동일 마스크 |
| 합성 | unshaded blend_mix, 새로운 광원 0. 상부 어둠/불규칙 흡수·회녹색 반사, 포화 형광색·additive bloom 사용 없음 |
| 표면 색·강도 | 깊은 색(.014,.024,.018)–(.037,.055,.025), 반사(.30,.34,.21), 증기(.15,.19,.12); opacity최대.86. pit흡수 .56+deep×.25, 기타.18+deep×.16(지면×.35). 리본.19·반사.34·증기혼합.45, sheen gain pit1.25/기타.85 |
| 원본 | PNG 3개 바이트 변경 0; SHA256은 protected-sha256-start.json / 최종 보존 영수증 |

독성 광원의 밝기·CanvasModulate·기존 bump 재질은 공통 룩 담당의 기존 값 그대로다. 원화에 그려진 동심원과 테두리를 지우거나 새 원화로 교체하지 않는다.

## 검증과 화면

검수 결과는 실행 후 아래 표에 기록한다. 테스트 이름·격리 이름·실행 명령·종료 코드·stderr는 각각 *.result.json / *.stdout.log / *.stderr.log에 보존한다. 신규 테스트는 EXODUSER-maplook-toxic-Isolated-20261020, 기존은 각 파일 상수(상수 없는 contracts/encounter에는 별도 격리 이름)를 사용한다. 모든 Godot 실행 직전에 pgrep 개수를 기록하고 2 이상이면30초 대기한다. 실행마다 override.cfg를 만들고 finally에서 0바이트로 비운다.

| 실행 | 실측 결과 |
|---|---|
| 신규 최종 macOS GPU | **80검사/0실패**, exit0, 실제 Main 자동 설치·기본 OFF·원본 보존·공유 RNG·결정성 포함. 실제 생산 셰이더 네 표면×256×256 전체 픽셀의 투명 외부 누출0, t1/t13 변화 확인, 전체 viewport1920×1080 |
| 예비 headless | 66/0. 최종 GPU80검사가 이를 포함하며 최종 결과를 대체하지 않는다 |
| contracts / encounter_factory | **5그룹/0**, **3그룹/0** |
| p3002_spawn_holes / p3003_regions | **298/0**, **43/0**, SKIP0 |
| map_look | **16/0**, 기본 OFF 기존 lightmap 보존, ON 설치·게임플레이 불변 |
| p2003a_lighting / p2002a_hud / p2004a_pets | **12/0**, **36/0**, **20/0**, SKIP0 |
| native_main_source_starter_state / p2007a_ui_polish | **148/0**, **115/0**, SKIP0 |
| 기존 회귀 합계 | **688검사+8그룹/0실패**. 소유 코드·기존 테스트 수정0; default OFF 부팅 시 toxic 노드0이므로 기존 하니스 경로에 새 표시 없음 |
| 원본/공용 보존 | 공용6파일·native_map_look·native_screen_lighting·map_look_ch1.json·map.json·PNG3 등 보호13파일 SHA256 시작/끝 동일; 기존 제품/테스트 파일 diff0 |
| 실행/관찰 | 모든 종료 override0바이트, 최종 ERROR0. Camera2D physics interpolation 경고 보존, P3002 ObjectDB8·HUD ObjectDB2 기존 종료 경고 원문 보존. 회귀9종은60FPS 제한, contracts는 원래240FPS 계약으로 실행. FPS 성능 판정 아님 |

contracts 첫 실행은 실행기에 --max-fps60을 넘긴 잘못으로 pause_capture의 원래240FPS 단정1건이 실패(4그룹/1실패)했다. 테스트·제품 코드는 바꾸지 않고 해당 CLI 제한만 제거하여 test_contracts-corrected에서5그룹/0으로 재확인했다. 첫 실패 로그도 그대로 보존한다. 사용자 고지 로비 전체8실패(QA-005)는 이 단위에서 재실행·수정하지 않았으며 이 회귀 합계에 포함하지 않는다.

전후 화면은 공통 맵 룩 ON에서 동일 카메라·zoom1·시간 고정으로 자기 모듈 visible만 변경한다. 비교 PNG는 왼쪽 before / 오른쪽 after. 1x는 원본 viewport 픽셀을 확대·축소 없이 그대로 잘랐다.

| 화면 | 경로(원로그 폴더 기준) |
|---|---|
| 북쪽 전체 / 남쪽 전체 | north_full_before.png·north_full_after.png / south_full_before.png·south_full_after.png, 각각1920×1080 |
| 전체 비교 | north_full_comparison.png / south_full_comparison.png, 각각3840×1080 |
| 웅덩이 1x | pool_1x_before.png / pool_1x_after.png / pool_1x_comparison.png |
| 남쪽 pit 1x | pit_1x_before.png / pit_1x_after.png / pit_1x_comparison.png |
| 독성 지면 1x 2곳 | growth_n_1x_* / growth_s_1x_* |
| 셰이더 시간 비교 | 각 id_ToxicSurface_shader_t1.png / shader_t13.png. 실제 생산 셰이더 단독 GPU 검사 |
| 관찰값 | capture-report.json: 자동 설치 module 목록·대상·seed·phase·거품 UV·실제 viewport·카메라·draw calls |

**VISUAL VERDICT: RETOUCH** — 작업자 Mac 실창·1x 직접 검토. 북쪽 원화의 나무/뼈 테두리와 기존 젖은 하이라이트를 보존하면서 액면의 불규칙 반사·낮은 증기 움직임을 추가했다. 남쪽 pit의 밝은 초록 면과 동심원 대비는 줄었으나 원화의 완전한 원형 테두리·중앙 고리와 스티커 같은 인상은 남는다. 원본 재질을 바꾸지 않는 이번 범위의 부분 개선이며 PoE2/No Rest 수준 전체 맵 달성이나 최종 디자인 승인으로 판정하지 않는다. 어두운 독성 지면의 상대 녹색 마스크 보정 후 최종 1x 네 곳을 재검토했다. 지면 반사·증기는 절제된 강도이며 정지화면에서의 변화가 작다. 반짝이는 다량 입자나 형광 안개로 부풀리지 않았다.

초기 GPU01은 경계 누출33곳, GPU02는2곳으로 실패했다. 실패 로그와 화면은 visual-01/·visual-02/에 보존했다. 3×3 원본 alpha 최소값으로 effect만1텍셀 안쪽에 제한하고 테스트를 네 표면256×256 전체 픽셀 검사로 강화했다. GPU03(80/0) 이후 지면의 효과가 1x에서 너무 약한 것을 발견해 상대 녹색 마스크/지면 흡수 강도를 조정했으며 visual-03/에 해당 중간본을 보존했다. 최종 toxic-gpu-final(80/0) 실행과 최종 폴더의 자료만 제출 기준이다. capture-report.json에서 북/남 각각 draw call160→162, 실제 화면에 보이는 자기 표면2개 증가를 관찰했다. 정지 화면 수치이며 전투 FPS 판정은 아니다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 관측 범위 |
|---|---|
| STAGE / MASTER | 기존 CH1-1의 4개 독성 표면 표시 작업. silhouette·regions·main route·side spaces 변경 0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH·major holes 변경 0. 전체 구조 신규 검수 범위 아님 |
| LARGE | 기존 prop_pool·pit_poison·prop_g_toxic 바이트 참조; composites·배치 overlap·반복 실루엣 변경 0 |
| MEDIUM | connections·remaining holes 변경 0 |
| GROUND | 기존 그림자 보존; 원본 알파 내부 독성 액면만 움직임·흡수·반사·증기. 토양 바깥 표시 누출 GPU 검증 |
| PLAYABLE | arenas·travel·breathing·threat space·충돌/이동/소환/리전/보상 변경 0. 실제 전투 성능 측정 아님 |
| LANDMARK | 북/남 독성 포켓 두 곳의 보조 표면 효과. 다른 primary/secondary/tertiary 변경 0 |
| CAMERA QA | SIDE R 북/남 독성 포켓1920×1080·1x4곳. START/EARLY/ARENA/SIDE L/LANDMARK/LATE/EXIT 전체 종주는 이 단위에서 재검수하지 않음 |
| TECH QA | 기존 회귀 / 실제 GPU 알파·시간 변화 검증. route/collision 변경0; pageerror/404는 웹 실행 범위 아님; seam은 원본 알파 경계 검사. 로딩·정지화면 draw 수만 기록, 전투 FPS 달성 주장 없음 |
| FILES | stage-owned 모듈1·셰이더1·신규 테스트1 및 UID3·본 보고서·CHANGELOG_SYNC 최상단 절. concurrent/unrelated/common 수정0 |
| GIT | sparse worktree; 자기 파일만 stage, 정상 pre-commit, 자기 브랜치 비강제 push·원격 SHA 대조 후 DONE.txt·자기 worktree 제거. 영수증은 원로그에 보존 |

상태: **화면 비교 자료 준비**. 원격 SHA·보존 검증·정리 결과는 원로그 DONE.txt / final-receipt.json이 기준이다.
