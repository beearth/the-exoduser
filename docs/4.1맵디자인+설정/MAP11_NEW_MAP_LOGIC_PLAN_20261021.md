# MAP11-16 — CH1-1 승인 아트 적용

기반 `1f797a8b71e5a1bd814e79be1a289b5e897a7aee` (`codex/map11-15-20261021`), 작업 `codex/map11-16-20261021`. 사용자 승인 MagicLight Seedream **5.0 Pro** 원본 1920² 2장을 제품 필드에 적용한다. 원본 위치 `outputs/map11-art-proof-20261021/` (R 읽기 전용). 새 생성·지출 없음. `floor_fissure_v1.png`는 붉은 균열 참고만, 런타임 미사용.

| id / 경로 (`godot/` 기준) | 수치·공식·적용 위치 |
|---|---|
| TREE / `assets/maps/map11/flesh_tree_seedream_rgba.png` | `flesh_tree_v1.png` → 녹색 chromaticity 거리 d, t=clamp((d−.16)/.24,0,1), alpha=t²(3−2t); 전이 배경 RGB(.26,.55,.23) unmix, G≤max(R,B) 스필 제한. bbox(345,73,1569,1845) → 1024×1482 straight RGBA. lossless·mipmap·alpha border fix |
| FLOOR / `assets/maps/map11/floor_fissure_seedream_tile.png` | `floor_fissure_v2.png` → 각 축 반주기960px offset, 경계192px smoothstep 혼합, Lanczos1024²·Gaussian .45px. 대변 픽셀 평균 일치. lossless·mipmap·repeat·linear mipmap sampling |
| TREE_INSTALL / `scripts/maps/map11/product_field_view.gd` | 기존 MAP11-09 BACK/MID/FRONT feet/spacing/회전/반전/가림/AABB 유지. forest_instances%2==0일 때만 신규 나무로 교체, 나머지 기존8종. 추가 tint(.84,.82,.82,1). 리소스 null이면 원8종 사용 |
| TREE_VARIATION (계승) | height[.72,1.24,.90,1.13,.81,1.30,1.02]·width[.80,1.18,.94,1.10,.87]·brightness[.78,1.16,.93,1.07,.86,1.22]·rotation[−.085,.045,−.025,.10,−.055,.02]rad·좌우반전. BACK fog.48/MID.13/FRONT0. 추가 node/collider0 |
| FLOOR_INSTALL / `scripts/maps/map11/product_surface.gdshader` | world UV scale760/1130/1830, 회전.27/−.89/1.73rad·기존3lookup 혼합 유지. blood=clamp(R−1.15G,0,.12); skin에 blood×(.65,−.55,−.48)로 D02 국소 붉은기 강화, 발광0. 동측 damp 유지 |
| PROCESS / `tools/prepare_map11_art.py` | Pillow+numpy 재현 스크립트. source/destination/receipt 경로를 인수로 받음. 원본 SHA256과 crop·출력 규격은 외부 asset-receipt.json 보존 |
| QA / `tests/capture_map11_art.gd` | 원 capture_map11_finish 벤치 기반 별도 하니스. 캡처1600×900, crop(480,150,640,600) 원픽셀. 성능1920×1080/240cap/60Hz·공간별 실제 입력150틱×4=600틱. setup에서만 tree 목록 접근, tick 목록/reflect API 추가0 |
| SAVE | import 이전부터 `EXODUSER-map11-16-Isolated-20261021`로 임시 project 설정. 실행 후 원 byte 복원. 실제 저장 폴더 접근0 |

필드 geometry/provider/region/Marker/보스룸 R1700/전투·저장 writer는 변경하지 않는다. 보스룸 내부 기존 아트와 독립 프리뷰도 유지한다. 기존 바닥 파생 PNG는 복구·이력용으로 보존한다. 관련 docs 전체 검색 근거는 `_out/MAP11-16/docs-all-matches.txt`.

## 검수 결과

| 검수 | 결과 |
|---|---|
| 관련 하니스 1회 | **23 PASS / 0 FAIL**, Godot ERROR0. import2회는 초기 전체 import 및 mipmap import이며 벤치 반복0 |
| 필드 600틱 | p95 **7.191ms**, 평균187.25fps (이전6.987ms / 189.38fps) |
| 아레나 600틱 | p95 **6.921ms**, 평균187.53fps (이전6.741ms / 188.81fps) |
| 성능 조건 | 1920×1080, Compatibility, Godot4.7.2 macOS, 원240cap/60Hz. 둘 다 p95≤8.33ms. 실제 Player 입력4방향150틱씩, 밀집전투/GPU timer/Windows 미측정 |
| 캡처 | `_out/MAP11-16/captures/01_field.png`, `02_outer_forest.png`, `03_boss_entrance.png` 각1600×900 + `01_field_1x.png` 640×600 원픽셀. 각 뷰 crop도 추가 보존 |
| 눈 검수 | 신규 나무 녹색 배경·스필 없음, 어두운 외곽 질량·막 조직 확인, 중앙 이동면 보존. 바닥의 큰 생체 균열은 붉고 비발광, 1x 잔점/모아레·타일 seam 미관측 |
| 남은 문제 | 입구 화면 위 기존 polygon의 직선 바닥 경계가 보임. 3scale 혼합으로 원본 균열 윤곽이 부드러워짐. 신규 나무 단일 실루엣은 기존8종과 혼합했으나 전체8뷰 반복성·밀집전투 가독성은 미인수 |

## MAP PRODUCTION REPORT

- STAGE: Godot CH1-1 MAP11-16.
- MASTER: silhouette/regions/main route/side spaces는 기존 남시작→북관문·필드 고리/4지역 유지. 재설계0.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH 기존 BACK/MID/FRONT 띠에 교대 flesh-tree, 기존 start/gate 중앙800units 시야 corridor 보존. major holes 신규 수정0.
- LARGE: 승인 Seedream tree1장+기존8종 composite 혼합. 기존 spacing/overlap 보존, 크기/회전/반전/명도 변형. 단일 신규 실루엣 전체맵 반복성은 후속.
- MEDIUM: 기존 root shoulder와 연결/접지 유지, 신규 medium0. 입구 상단 직선 경계 잔여.
- GROUND: 승인 v2를1024² seamless tile로 교체, D02 국소 혈색 강화. 기존 접지그림자/오염/decal 유지, 발광0.
- PLAYABLE: main arenas/travel/breathing/threat 면과 충돌 불변. 실제 Player 600틱 걷기·기존 arena 자동 진입/가림 검사 통과. combat readability는 정지 플레이어·펫 확인 범위, 밀집 전투 미검수.
- LANDMARK: primary 시체나무·심장제단 / secondary 관문 / tertiary 고치·뿌리 유지.
- CAMERA QA: LANDMARK 필드/서측 외곽/EXIT 관문3뷰+1x 직접 확인. START/EARLY/ARENA/SIDE R/LATE 전체8board 신규 인수 없음.
- TECH QA: route/collision/provider/Marker 소스 불변, 관련 렌더·전환 검사 PASS, pageerror/404 N/A(Godot). seam·loading 오류 미관측, 성능 위 표. tick 경로 reflect/list API 추가0.
- FILES: stage-owned 제품 field view/surface shader, 신규 에셋2장·import2개, 재현 도구·격리 capture 하니스·관련 docs. concurrent/unrelated 소스 수정0.
- GIT: 자기 브랜치 경로 지정stage/정상push와 원격 SHA대조. 배포/main push/강제push/rebase/reset0. R 읽기 전용, PC 동기화 미확인. SHA와 worktree 제거 결과는 외부 DONE.txt.
- VISUAL VERDICT: **RETOUCH** — 요청한 아트2장 적용·가독성·성능 범위 통과, 기존 입구 직선 지면 접합은 잔여. 자동 PASS를 전체 맵 시각 PASS로 대체하지 않음.
- NEXT PASS: 입구 지면 전이 마감·전체8뷰 반복성·밀집 전투 검수.

