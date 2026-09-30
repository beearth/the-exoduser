# CH1-1 2.5D 깊이 슬라이스 2차 (BORDER FOREGROUND) — 2026-10-01

> 스펙: [MAP_IMPROVEMENT_PROJECT.md](MAP_IMPROVEMENT_PROJECT.md) §8(설계·분류표 8.4) — MAP-003 + MAP-004 + MAP-020(확인만). 1차 = [DEPTH_SLICE1_20261001.md](DEPTH_SLICE1_20261001.md).
> 상태: **구현 완료·2차 기본 OFF**(`ch1-border-foreground.js`의 `DEFAULT_ON=false` 한 줄로 전환). 시험 `?borderFg=1`/`G._borderFg=true`, 2차만 끄기 `?borderFg=0`, `?depthSlice=0`이면 1·2차 모두 꺼짐.
> 방식: **청크 재굽기 없음.** 구운 64청크는 그대로 두고, 같은 좌표·같은 원본·같은 밝기의 경계 나무·군락을 런타임 스프라이트로 엔티티 위(또는 밑동 기준 앞뒤)에 한 번 더 그린다. 굽기에서 `tree_fade`로 잘린 '걸을 수 있는 영역 쪽 수관·가지'가 덧그림에서 되살아나 오버행이 된다. master·geometry·충돌·베이크 버전 무변.

## 1. 착수 확인 (§8.4 지시 이행) — 분류 수정

`captures/depth_slice2/recon/` (밑동 좌표 + isW 보행 프로브 `walkable_probe.json`):

| 검증 대상 | 결과 | 조치 |
|---|---|---|
| T4 (158,159) | 북 3/3 보행·남 차단 — 남쪽 베이크 잔존, 북쪽 수관은 잘림 | 전경(fg) 유지 ✓ |
| T1 T10 T31 T32 T34 T35 (+동급 T33) | **베이크에서 tree_fade로 완전 소거 — 현재 화면에 나무가 없음** (recon/T1·T10·T31·T32·T34_base.png). 밑동 주변 양방향 보행 가능, **충돌 콜라이더 없음** | **이번 패스 제외** (원안 분할 → 보류). 복원하면 충돌 없는 몸통을 통과하는 모순 + 전투 동선 위 신규 가림물 — '충돌 변경 금지' 제약과 충돌. 후속 제안 §6 |
| M1 M2 M3 M5 | 군락 몸체는 비보행 숲 안, 잘린 수관만 보행 영역 위로 — M3 남측 240px 보행 가능(분할 필요 확인) | 원안 유지 ✓ (M1 M2 M3 분할 / M5 전경) |

최종 대상 13: 전경 나무 9(T3 T4 T5 T13 T16 T18 T19 T20 T24) + 전경 군락 M5 + 분할 군락 M1 M2 M3.

## 2. 코드 계약

| 항목 | 값 |
|---|---|
| 새 파일 | `ch1-border-foreground.js` (`globalThis.Ch1BorderForeground`, 다른 CH1 런타임과 동일 패턴) |
| game.html 배선 | 스크립트 태그 1 + 호출 2줄: `drawBack`(Ch1AltarMoat.draw 직후 — 청크 스택 바로 위·엔티티 아래) / `drawFront`(1차 `_dsDrawFrontPass()` 직후 — 엔티티 위) |
| game-easy-test.html | 호출 2줄만(스크립트 태그 없음 — 다른 CH1 런타임과 동일, `globalThis` 가드로 no-op) |
| build-nwjs.mjs | 복사 목록에 `'ch1-border-foreground.js',` 1줄 |
| 배치 데이터 | placements.json 발췌 표를 파일에 내장(`_trees`/`_masses`, index 포함) — **테스트가 json(version `20260930-rotforest-96`)과 일치를 잠금** |
| 좌표 변환 (굽기 스크립트 `tmp/ch1_rotforest90_bake_patch.py`와 동일) | 나무: 한 변 `round(410×scale)` bake px·기준점 가로 중앙/세로 74%·밝기 ×.9 / 군락: 폭 `width` bake px·세로 72%·밝기 ×.70·flip / bake px=값×8192/200, 월드=bake×1000/1024 (→ 밑동 월드 y = ty×40). round 지점까지 동일 |
| 밝기·반전 | GPU 프록시는 CSS filter 무시 → variant·flip 조합당 오프스크린 캔버스에 1회 사전 굽기(`filter='brightness(…)'`는 실제 Canvas2D) |
| 전경/분할 | fg=항상 엔티티 위. split=1차와 같은 규칙: `P.y < anchorY(=ty×40)`일 때만 위, 남쪽이면 `drawBack`(청크 위·엔티티 아래 — 잘린 수관 복원만) |
| 가림 | **수관 영역만**: 나무=스프라이트 상단~높이 60%, 군락=~58% (밑동·뿌리 아래 겹침은 가리지 않음). 겹치면 알파 1→.62 lerp(K .22, 1차와 동일) + `_dsDrawPlayerGhost()` 재사용(α.55). 고스트는 **프레임당 1회 가드**(`_dsPSnap.gN`, 1차 프런트 패스와 공유 — game.html/easy-test 각 1줄 추가). 적 고스트 없음(비용) |
| 컬링·상한 | 화면 AABB 컬링(줌 반영, sway와 동일식) + 프레임당 그리기 상한 `MAX_DRAWS=12` |
| 텍스처 예산 | 실측 `qa()`: 인스턴스 13, 빌드 7조합(나무 4 variant + 군락 v2/v2flip/v1flip), **texBytes 45.09MB**(나무 4×1024² + 군락 3×2048×1152, RGBA). 프레임당 그리기 실측 back 0~1 / front 2~4 |

## 3. 검증

### 테스트 — 신규 `test/ch1BorderForeground.test.js` **8/8 PASS**
placements.json 일치(index·좌표·variant·scale/width/flip) / 분류표(전경 9+M5, 분할 M1 M2 M3, 인너 제외) / 좌표 변환(410×scale·74%/72%·중앙 정렬·bake→월드) / 게이트(OFF·타 스테이지·보스아레나 = draw 0) / 가림 판정(수관만, 밑동 아래 제외) / 배선(태그+호출 2줄·easy-test 호출만·build-nwjs·고스트 1회 가드) / 소스 에셋 크기(군락 2048×1152).
기존 회귀: depthSlice 10 + ch1SunburstTrees/ForestSway + ch1AltarMoat/FaceLife/HighGround/LivingDetail/HandDecor **84/84 PASS**, pageerror/404 0.

### 스크린샷 (captures/depth_slice2/, 어둠 .38, 게임플레이 진입, 펫 대사·regionBanner·areaTitle 숨김, OFF/ON+1x 크롭)
| 증거 | 파일 쌍 | 판독 |
|---|---|---|
| 남쪽 전경 나무 | `T18_*`, `T19_*`, `T20_*`, `T5_*` | 남쪽 경계 나무의 잘린 북측 가지가 복원되어 엔티티 위 오버행 (트렁크가 폴리곤 밖이라 변화는 얇은 띠 — 벤치마크 예상과 일치) |
| 대형 전경 나무 | `seam_T4_{off,on}` | OFF=수관이 잘려 넓은 공터 / ON=수관 복원·플레이어 위 덮임+페이드+고스트. 덧그림과 베이크 남측 잔존부가 한 그루로 읽힘(이음매 미검출) |
| 군락 전경 | `M5_{off,on}(_crop)` | OFF=플레이어가 군락 위 스티커 / ON=수관이 앞, 고스트로 판독 |
| 분할 군락 북/남 | `M1_north_*`, `M1_south_*`, `M2_south_*`, `M3_south_*` | 북=군락이 앞(가림+고스트) / 남=플레이어가 앞 |
| 경계 가독성(MAP-020) | `qa_report_{off,on}` | 신고 위치에서 T16 군락이 플레이어 앞에 서며 남쪽 경계가 '세워진 숲'으로 읽힘 — §6 잔여 참고 |
| QA 카메라 | `qa_{report,center,left,right}_*` | 4곳 전후 |

### 성능 (Edge/WebGL2, draw() 계측+rAF, 10초, 단일 탭 순차)
| 구간 | OFF | ON | 판정 |
|---|---|---|---|
| 유휴(T4 수관 아래, 페이드+고스트 활성) | 238.8 FPS / draw 0.647ms | 239.7 FPS / draw 0.744ms | +0.1ms, FPS 차 ≤0.4% |
| 64적 전투 | 237.9 FPS / draw 1.359ms | 239.3 FPS / draw 1.276ms | 노이즈. 스폰 직후 워밍업 스파이크 1회는 OFF 구간 발생(플래그 무관) | **G7 PASS (≤3%)** |

## 4. 게이트 자가 판정 (최종은 팀장)

| 게이트 | 자가 | 근거 |
|---|---|---|
| G1 입체감 | PASS | 경계 수관이 엔티티를 덮는 오버행 최초 구현 (M5/M1/T4 전후) |
| G2 가독성 | PASS(조건부) | 가림 시 .62 페이드+고스트 α.55로 플레이어 판독. 단 **적은 고스트 없음** — 수관 아래 적 가독은 §6 잔여 |
| G3 톤 | PASS 추정 | 신규 그림 0 — 같은 원본·같은 밝기 배율 재사용 |
| G6 기술 | PASS | 재굽기·geometry·충돌·베이크 버전 무변, 테스트 84/84·pageerror 0, OFF 경로 draw 0 테스트 잠금 |
| G7 성능 | PASS | 위 표. 텍스처 +45.1MB(예산 기록) |

## 5. MAP-020 확인 (촬영만 — 새 그림 없음)

전경 덧그림이 있는 지점(T16·T18~T20·M5)에서는 남쪽 경계가 '앞에 서 있는 숲'으로 읽힌다(`qa_report_on`). 그 사이 구간은 여전히 어두운 평면 흙으로 읽힘 — 부족. **제안**: ① 경계 밑동 접지 그림자 띠(런타임, NW광 SE 그림자)로 벽 밑선 강조 ② 경계 1열에 낮은 명도 리프트(베이크 재작업 필요 — 96차 중단 결정과 상충하므로 팀장 판단) ③ 전경 대상 확대(남쪽 유지 분류 T2 T7 T8 T15 T28 T29 일부를 전경으로 승격).

## 6. 잔여·한계 / 백로그 갱신 제안 (MAP_IMPROVEMENT_PROJECT.md는 팀장이 갱신)

1. **인너 나무 7그루(T1 T10 T31~T35) 보류** — 베이크 완전 소거+무충돌. 제안: 신규 백로그 "MAP-003b: 인너 나무 복원 = 오버레이 + `colSz` 콜라이더 추가 + 스폰/동선 검토" (충돌 변경이라 별도 승인 필요).
2. **적 고스트 없음** — 수관 아래 몹이 가려짐(의도된 비용 절감). 필요 시 엘리트/보스만 고스트 후보.
3. **sway 비동기화** — 베이크 숲은 `ch1-forest-sway`가 벽타일 대역을 ±5px 변위하지만 덧그림은 정지. 이음매 크롭에서 체감 못했으나(오버레이 불투명부가 덮음) 장시간 관찰 항목. 필요 시 덧그림에 동일 변위 적용.
4. **T4 몸통 자리 보행 가능**(충돌 없음) — 플레이어가 전경 나무 몸통 위치까지 걸어 들어갈 수 있음(고스트로 판독은 유지). MAP-003b와 같이 콜라이더 검토.
5. 군락 수관 아래(58% 하한 이하) 겹침은 가리지 않는 규칙이라, 군락 뿌리 언저리에서는 페이드 없이 덮이는 픽셀이 일부 있음 — 실플레이 관찰 항목.
6. MAP-013 완전판(버킷 간 y정렬)·베이크 외곽 나머지 나무(T5 분류 밖 21그루)는 1차 문서 잔여와 동일.

## CODE CHANGE

신규 `ch1-border-foreground.js`(+`test/ch1BorderForeground.test.js`). `game.html`: 스크립트 태그 1·호출 2줄·고스트 프레임 가드 1줄. `game-easy-test.html`: 호출 2줄·고스트 가드 1줄. `build-nwjs.mjs`: 복사 목록 1줄. 충돌·geometry·베이크·타 스테이지 무변, 기본 OFF(`DEFAULT_ON=false`). QA 스크립트=`tmp/depth_slice2/`(비추적), 촬영=`captures/depth_slice2/`(비추적).
