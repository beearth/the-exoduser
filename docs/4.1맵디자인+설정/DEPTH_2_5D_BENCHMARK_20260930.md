# 2.5D 입체감 벤치마크 + 적용 로드맵 — 2026-09-30

> 상태: **조사·기획 전용. CODE CHANGE NONE.** `game.html`/런타임/`assets/map`/pass96·97 문서는 수정하지 않았다.
> 대상: 지옥의 길(EXODUSER) 탑다운 3/4 카메라, WebGL2(Windows 기본)/WebGPU(Mac 기본) 프록시 `X` + Canvas2D 폴백, CH1-1 8192² production master → 64청크.
> 코드 라인 번호는 2026-09-30 작업트리 기준(`game.html` 약 62k줄). 다른 세션 편집으로 수십 줄 밀릴 수 있다.
> 관련: [OUTER_DEPTH_MODEL](OUTER_DEPTH_MODEL.md) · [CH1_MAP_KIT_OptionB §6](CH1_MAP_KIT_OptionB.md) · [맵제작_타게임전수조사](맵제작_타게임전수조사.md) · [PASS95](CH1_ROTTEN_FOREST_BOUNDARY_PASS95_20260930.md) · [PASS96](CH1_ROTTEN_FOREST_MASS_READ_PASS96_20260930.md) · [PASS88](CH1_SUNBURST_TREE_PASS88_20260930.md)

---

## 1. 요약 — 왜 우리 맵은 평평해 보이는가

한 줄: **세로로 서 있어야 할 것(나무·군락·뿌리)이 전부 "바닥과 같은 평면"에 그려지고, 캐릭터는 그 평면 위에 항상 스티커처럼 붙는다.** 다른 2.5D ARPG의 입체감은 그림 품질이 아니라 ① 앞뒤 가림(occlusion) ② 발밑 접지 그림자 ③ 세로 물체만 따로 받는 빛/그림자 ④ 화면 앞 전경층, 네 가지 런타임 규칙에서 나온다. 우리는 넷 다 없다.

| # | 근본 원인 | 코드 근거 | 결과 |
|---|---|---|---|
| R1 | **엔티티↔오브젝트 인터리브 없음.** `MAP_OBJS`는 한 패스로 전부 그린 뒤 적, 그 뒤 플레이어를 그린다 | MAP_OBJS 루프 `game.html:49958–50140` → 적 `50353–51673` → `drawP()` `52111` | 나무 "뒤"(북쪽)로 걸어가도 캐릭터가 나무 캐노피 위에 그려짐. 가림이 0이라 뇌가 높이를 못 읽음 |
| R2 | **정렬 기준이 밑동이 아니라 스프라이트 중심.** 1회 정렬 `_renderLayer`→`a.y`(중심) | `24765–24766`; 나무 피벗 `.5,.5` 중심 그리기 `50113–50123`; 실제 밑동은 `ch1-living-detail.js:454` `foot=o.y+size*.45` | 오브젝트끼리도 앞뒤가 틀릴 수 있고, 인터리브를 넣어도 중심 y로는 오답 |
| R3 | **외곽 세로 질량이 배경에 베이크.** 36그루+6군락+뿌리다리가 바닥 청크 픽셀 | PASS95 `BAKE-95`; 청크 blit `49586–49603`, `_drawCh1StartOuter` `11048–11058` | 가릴 수도, 그림자를 드리울 수도, 별도 조명을 받을 수도 없음. 흔들림(`ch1-forest-sway.js`)도 바닥 픽셀째 옆으로 미는 2D 변위(±5px) |
| R4 | **적끼리도 y정렬 없음 + 플레이어는 항상 최상단.** WebGL 인스턴싱 배치는 `ens` 배열 순서 | `_prepEnemyInstanced` `5017–5089`(배치 `5086–5087`), 루프 `50360` | 겹친 몹의 앞뒤가 무작위, 플레이어가 몹 뒤에 설 수 없음 |
| R5 | **조명이 화면공간 "어둠 + 원형 구멍"뿐.** 방향광·그림자 투사·노멀 없음 | `_renderLighting` `4630–4667`(ambient fill + `destination-out` 스탬프), `_collectLights` `4590–4629`(플레이어/보스/화염장판/정적광만) | 바닥과 서 있는 나무가 같은 빛을 받음 → 부피감 0. 광원이 캐릭터 옆 나무 옆면을 밝히지 못함 |
| R6 | **그림자가 약하고 한 종류.** 적 타원 α.18, 플레이어 α.25; 오브젝트 접지 그림자는 CH1 일부 하드코딩 좌표만 | 적 `51151–51159`·`5051`·`5070`, 플레이어 `56050`, `Ch1LivingDetail.shadows` `ch1-living-detail.js:401–` (좌표 고정 분기 `406`,`415`) | 캐릭터가 떠 보임. 나무 그늘이 캐릭터 위로 떨어지지 않음 |
| R7 | **대기/깊이 효과가 "플레이어 중심 방사형"** — 월드 높이가 아니라 화면 거리 기준 | ATMOS 3-1 veil `50314–50352`(플레이어 중심 `destination-out` 그라데이션), 비네트 `drawAtmosphere` `49380–49421`, 패럴랙스 비활성 `_bgLayers=null` `49462`, 전경 프레이밍 `_ATMO_FG=false` `49171` | 안개가 "원근"이 아니라 "화면 가장자리 어둡게"로 읽힘. 원경/근경 층 분리 없음 |
| R8 | **GPU 프록시 `X`는 합성모드/필터/섀도블러를 무시.** | `globalCompositeOperation` setter no-op `5772`, `shadowBlur` no-op `5773`, `filter` 미구현(`_buildProxyX` `5743–5876`); 가산은 명시 `_setBlend()`만 (`5419`,`5591`) | Canvas2D식 트릭(`X.filter` 톤 `50051–50054`, `multiply` 틴트 등)은 Windows WebGL2 실사용 경로에서 **효과 없음**. 입체 기법은 사전 베이크 텍스처, `_setBlend`, 전용 셰이더로만 구현 가능 |

> 결론: pass 80~96의 "배경을 더 잘 그리기(림라이트·헤이즈·글린트·값 분리)"는 **R3 평면 안에서의 가독성 개선**이다. 입체감 부족의 1순위 원인(R1/R2/R4 가림 부재)과 무관하므로 몇 차를 더 돌려도 "평평함" 판정은 바뀌지 않는다.

---

## 2. 현재 프레임 draw order (CH1-1, WebGL2 기준)

`draw()` 시작 `49423`. 월드 좌표 변환 후 순서:

| 순서 | 레이어 | 위치(game.html) | 비고 / 깊이 관련 |
|---:|---|---|---|
| 1 | 패럴랙스 배경 | `49458–49493` | `_bgLayers=null` → **비활성** |
| 2 | 빈 영역 바닥 `_fillVoidWithFloor` | `49494` | CH1 production이 화면을 덮으면 생략 |
| 3 | 반딧불이 20개 | `49495–49508` | 바닥 아래 층(덮이면 생략) |
| 4 | 맵 캐시/스트림/플레이트/비스타 청크 | `49513–49606` | 일반 맵 바닥+벽 |
| 5 | CH1 production 64청크 (`_drawCh1BakedSpike`→`_drawCh1StartOuter`) | `49607`, `11048–11058` | **외곽 나무 36+군락6+뿌리 베이크 포함** |
| 6 | 숲 흔들림 오버레이 | `49608`, `ch1-forest-sway.js:71–103` | 청크 1–9타일 띠를 8스트립 수평 변위 |
| 7 | CH1 언덕 텍스처 | `49609`, `25108–25116` | 48차 알파 그림자 베이크 포함 |
| 8 | CH1 접지 그림자(선택 오브젝트) | `49610`, `ch1-living-detail.js:401` | 나무/포자/일부 뼈·웅덩이 |
| 9 | CH1 생체 디테일(바닥) | `49611` | |
| 10 | 보스 아레나 포탈 | `49616–49619` | |
| 11 | Ori 포인트라이트 (가산 의도) | `49621–49627` | GPU 프록시에선 `lighter` 무시 → 일반 알파 |
| 12 | 환경 데코 `_CH_DECO` | `49628–49671` | |
| 13 | 출구 타일 / 보스 게이트 / 아레나 FX | `49672–49957` | |
| 14 | **MAP_OBJS 전부 (한 패스)** | `49958–50140` | 정렬: 빌드 시 1회 `_renderLayer`→중심 y (`24766`). 손배치 나무 `m_ctree13~20` 포함 |
| 15 | CH1 생체 디테일(surfaceOnly) | `50142` | |
| 16 | 월드 아이템 / 소환굴 | `50145–50313` | |
| 17 | ATMOS 3-1 depth haze veil | `50314–50352` | 화면공간, 플레이어 중심 걷힘 |
| 18 | 적: 인스턴싱 배치(그림자+몸통) | `50359` → `5017–5089` | **배열 순서**, y정렬 없음 |
| 19 | 적: 개별 루프(특수몹·보스·텔레그래프·바닥그림자·HP바) | `50360–51673` | 그림자 `51151` |
| 20 | 적 투사체 | `51674–52110` | |
| 21 | **플레이어 `drawP()`** | `52111` (`53056–`) | 항상 모든 적/오브젝트 위. 그림자 `56050` |
| 22 | 부활 버스트·혈흔·VFX 인스턴싱·가산 VFX·히트임팩트 | `52125–52418` | |
| 23 | `drawAtmosphere` (grade multiply/lift/vignette) | `52485`, `49380` | multiply/screen은 GPU 프록시에서 무시될 수 있음(R8) |
| 24 | 일부 HUD(터렛·킬체인)·저체력·플래시·색수차 | `52487–52789` | 조명 이전에 그려짐 |
| 25 | 동적 조명 합성 (`_lightCvs` 반해상도) | `52790–52792`, `4630` | 어둠+원형 구멍. 오브젝트/캐릭터 구분 없음 |
| 26 | 블룸 | `52793` | |
| 27 | 필드보스/지상뱀장어/화마귀 | `52796–52798` | **조명 뒤에** 그려짐(별도 순서) |
| 28 | ATMOS 3-2 광선·사이드 안개 | `52799–52866` | |
| 29 | 토치 어둠 오버레이 | 이후 `_torchCache` 블록 | |
| 30 | ATMOS 3-3 비네트/그레이드(기본 OFF), 유령불꽃, 화톳불 결계 | `52867–52943` | |
| 31 | 2D 안개 레이어 / Three.js 안개 | `52944–52966` | |
| 32 | 환경광 오버레이 / 동적 비네팅 / 그레인 | `52967–53030` | |
| 33 | DOM HUD | 별도 | |

기존 깊이 관련 기능 인벤토리:

| 기능 | 있음? | 위치 | 평가 |
|---|---|---|---|
| 캐릭터 blob 그림자 | 있음 | 적 α.18 `51156`, 플레이어 α.25 `56050` | 너무 약하고 가장자리 하드. 광원 방향 무관 |
| 오브젝트 contact shadow | 부분 | `Ch1LivingDetail.shadows` (나무 뿌리 알파 기반, 포자 skew 실루엣 `437`) | 좋은 기법이나 CH1 일부·좌표 하드코딩 |
| 투사 그림자(skew) | 부분 | 포자/고치 `transform(1,0,-.65,-.32)` `ch1-living-detail.js:437` | 이 방식을 나무 전체로 일반화 가능 |
| 베이크 AO | 부분 | 언덕 48차, 외곽 헤일로 96차 | 배경 평면 안에서만 |
| 라이트맵 | 화면공간 반해상도 | `4630` | 방향성·높이 없음 |
| 노멀맵 | 없음 | — | 플레이어 아틀라스 로드시 1회 명암(`PLAYER_RELIEF_2_5D`)만 |
| Y-sort 인터리브 | **없음** | — | 문서마다 "planned only" |
| 전경 occluder | **없음** | — | `_ATMO_FG` 화면공간 기둥은 비활성 |
| 가림 시 페이드/실루엣 | **없음** | — | |
| 패럴랙스 | 비활성 | `49462` | |
| 안개 | 화면공간 3종 + Three.js FBM | `50314`, `52944`, `52964` | 높이/원근 기반 아님 |

---

## 3. 기존 조사 문서 대비 "조사했지만 미적용" 목록

| 문서 | 조사/계획된 항목 | 현재 코드 | 판정 |
|---|---|---|---|
| `맵제작_SSOT.md §8` | 레이어 순서 `STATIC PROP → GAME OBJECT → CHARACTER/ENEMY → FOREGROUND OCCLUDER → VFX` | FOREGROUND OCCLUDER 층 없음; STATIC PROP과 CHARACTER가 섞이지 않음 | **미적용** |
| `맵제작_타게임전수조사.md §2.4/§4/§6` | D4 "고정 카메라 덕분에 전경 가림", "원경 카드/스카이박스/전경 오클루더", "전경 오클루더 = Y소트 스프라이트: 일부" | Y소트 스프라이트 없음("일부"는 빌드시 1회 정렬을 과대표기) | **미적용** |
| `CH1_MAP_KIT_OptionB.md §6, 표 208/276, 303` | "캐노피/아치 FG는 코드가 하나 더 필요", "FG Y소트 — 그 전엔 캐노피 금지" | 코드 없음 | **미적용(선행조건으로 명시됨)** |
| `OUTER_DEPTH_MODEL.md §1–2` | OUTER-A/B/C 패럴랙스 0.3~0.5/0.15~0.3/0~0.15, 후보1 패럴랙스 6레이어 재활성, 후보4 저해상도 캐시 | `_bgLayers=null` 유지 | **미적용** |
| `OUTER_DEPTH_MODEL.md §3` | "매 프레임 Y-sort 없음 → 전경 occluder 별도" | 별도 occluder 없음 | **미적용** |
| `DIABLO_FIELD_REBUILD_PLAN §4` / `IMPLEMENTATION_CONTRACT §4` | BASE/GROUND/BACK/MID/FRONT/GAMEPLAY, "front = foreground occluders and atmosphere" | fieldrebuild QA 분기에도 front occluder 없음 | **미적용** |
| `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9 §13` | "Runtime에 남길 것: foreground occluder, major landmark" / "Baked: background vegetation" | 외곽 나무를 "background vegetation"으로 전부 베이크 → 플레이 가장자리 나무까지 가림 불가 | **해석 오류로 역적용** (가장자리 나무는 occluder 후보였음) |
| `LEVEL_DESIGN_RULES_SSOT.md §3/139` | PLAY/RIM/OUTER, 다층 패럴랙스로 깊이 | 패럴랙스 없음 | **미적용** |
| `CH1_VERTICAL_SLICE.md 174/195–196`, `MAP_DESIGN_CLOSURE.md 48/86`, `MAP_IMPLEMENTATION_ROADMAP.md 159` | 전경 occluder / Y-sort = planned only / NON-GOAL | 그대로 | **계속 연기됨** |
| `CH1_1_BLOCKOUT_MASTER.md 251` | 전역 패럴랙스·전경 occluder 미구현 | 그대로 | **미적용** |
| `PLAYER_RELIEF_2_5D_20260915.md` | 플레이어 아틀라스 좌상단 광원 명암(로드시 1회) | 적용됨 | 적용(단, 월드 광원과 무관한 고정 명암) |
| `CH1_LIVING_DETAIL_RUNTIME_20260925.md` | contact shadow 렌더 순서, 뿌리 알파 기반 접지 | 적용됨(일부 오브젝트) | 적용·확장 여지 |
| `CH1_HILL_DEPTH_PASS48.md` | 언덕 알파 실루엣 그림자 | 적용됨(정적 캐시) | 적용 |
| `12퍼포먼스·최적화/WebGL2_인스턴싱_전환계획.md` | 인스턴스 스프라이트 셰이더 | 적 인스턴싱만 적용(`_ensGLProg`) | 부분 — depth/sort 키 없음 |

패턴: **"조사 → 레이어 표에 FOREGROUND/Y-SORT 기재 → 1차 구현에서 제외 → 다음 문서에 planned only로 이월"** 이 8월부터 최소 8개 문서에서 반복됐다. 그 사이 제작은 전부 "배경 베이크 품질" 쪽으로 진행되었다.

---

## 4. 타게임 벤치마크

표기: **[1차]** 개발사/공식 자료, **[2차]** 모더·포럼·제3자 분석, **[미검증]** 1차 근거 미발견(플레이어 보고 등). 출처 번호는 §8.

| 게임 | 기법 | 구현 방식(구체) | 우리 대응 | 출처 |
|---|---|---|---|---|
| Pillars of Eternity 1 | 프리렌더 배경 + **깊이 패스** | Maya에서 배경을 4패스(final/depth/normal/albedo) 렌더 → Unity가 합성해 3D 캐릭터를 **픽셀 단위로 가림** + 실시간 조명 | T5 | [1차] S1 |
| Pillars of Eternity 1 | depth = "지면 위 높이" | 픽셀별 지면 위 높이를 정규화해 24bit 텍스처(배경과 동일 해상도)에 저장. 직교 카메라라 단순 비교로 정렬 | T5 (우리는 footY 기준선으로 단순화) | [2차·검색요약] S2 |
| Pillars of Eternity 1 | 캐릭터를 그림에 붙이는 조명 | 키(태양)+필 방향광 2개, 횃불·화염구 deferred 포인트광이 **배경 normal 패스와 캐릭터 둘 다** 비춤, 배경 색 샘플링 앰비언트, 저해상도 그림자맵 샘플로 캐릭터 그림자를 그림 속 그림자와 일치 | T4 키라이트 SSOT, T6 | [1차] S1 |
| Pillars of Eternity 2 | 동일 4패스 + 앵커포인트 | 동적 조명/그림자 엔진, 3D 식생 증가, 조명 필요 지점에 아티스트가 anchor point, 내비/충돌 별도 패스 | T5·T6 | [1차] S3 |
| Tyranny | Pillars 계열 | 2D 배경 + 깊이 텍스처로 가림, 기타 맵으로 빛/그림자/반사 | T5 | [2차] S4 |
| Disco Elysium | 3D 렌더 → 페인트오버 타일 | Blender 직교 카메라 렌더, 카메라투영 UV로 렌더/페인트 타일 정합, 3D 블록인이 동적 조명 담당, **depth-occlusion 셰이더**로 캐릭터 앞뒤 | T5 | [1차] S5 |
| Disco Elysium | 무엇을 라이브로 남기나 | 움직이는 것·줍는 것·시간 의존 요소(식생 평면, 소품, NPC)는 **그림에 굽지 않음**; 갈대·덤불은 투명 페인트 평면 + 왜곡 | 6.2 "가장자리 나무 베이크 중지" 근거 | [1차] S6 |
| Baldur's Gate EE (Infinity Engine) | **손으로 그린 wall polygon** | WED 파일: 화면공간 폴리곤 + 플래그(bit2–3 "cover animations"=스프라이트를 가림), 10×7.5타일 wall group으로 공간조회. 스프라이트가 폴리곤 안 + "뒤"이면 벽을 위에 다시 그림 | **T5 간이판의 직접 원형** | [1차 포맷문서] S7 |
| Diablo II (legacy) | 연결된 벽 타일 페이드 | 닫힌 벽 체인일 때만 투명화, 코너 타일 방향이 핵심 | T2 | [2차·모더] S8 |
| Diablo II: Resurrected | 2D 시뮬 위 3D 레이어 | 원본 스프라이트/격자 게임이 그대로 돌고 그 위에 PBR 3D 렌더러, 실제 높이차 추가, 레거시 토글 | 참고(우리도 NAV와 시각 분리) | [1차] S9, S10 |
| Diablo II: Resurrected | 벽 페이드 불일치 | 트라빈칼 상부 벽이 D2R에선 불투명·레거시에선 페이드 | 리스크 참고 | [미검증·플레이어] S11 |
| Diablo III | 3층 가독성 설계 | 배경/중경 액션/UI 분리. 배경은 톤다운·양식화, 캐릭터·몬스터에 **고대비 조명 베이크**, 지역당 주조색 1개 | 6.2 값 분리, T4 | [1차 GDC] S12, S13 |
| Diablo III | 가림 메시 전체 페이드 | 벽·천장을 별도 조각으로 분리, 카메라-플레이어 선을 막으면 완전 투명화(건물 진입 시 지붕 소멸) | T2 | [2차] S14, S15 |
| Diablo IV | 체적 공기층 + 커스텀 그림자 | Deferred, 정적 던전 그림자 사전계산 + 캐릭터 그림자 동적 오버레이, **빛 받는 먼지 입자로 깊이 평면 분리**, 커스텀 톤매핑, 식생 버텍스 셰이더 굽힘 | T4, T7 | [1차] S16 |
| Diablo IV | 아이코닉 카메라 기준 디테일 | 고정 카메라 기준으로 디테일 가감, 선택적 조명으로 길 암시, "사이 공간"을 체적으로 모델링 | T3, T7 | [1차 분기보고] S17 |
| Path of Exile 2 | Radiance Cascades GI | 상수 비용 스크린스페이스 GI, 시간누적 없음 → 부드러운 접지 어둠·반사광 | T4의 "접지 어둠" 동기 | [1차 ExileCon 기사] S18 |
| Path of Exile 1/2 | 가림 나무/벽 소멸 | 플레이어가 뒤로 가면 나무·벽이 사라짐(일부 벽 실패 사례), "가려지기 전에 페이드" 요청 | T2 | [미검증·플레이어] S19, S20 |
| Hades 1 | 3D 프리렌더 캐릭터 스프라이트 | Maya 리깅 + 손그림 텍스처 + **높이/AO 베이크** + 손그림 외곽선 → 다각도 스프라이트로 손그림 환경 위에 | PLAYER_RELIEF 확장 | [1차] S21 |
| Hades 1/2 | 명암 대비 + 공통 순흑 | 강한 키아로스쿠로, 캐릭터와 환경이 **같은 순흑 그림자 값** 공유 | T4 그림자 색 SSOT | [2차 분석] S22 |
| Hades II | 실시간 3D 캐릭터 | 캐릭터를 실시간 3D로 전환, 환경은 손그림 유지 | 참고 | [1차] S23, S24 |
| Hades 1/2 | 전경 가림/실루엣 | 전경·기둥 뒤에서 캐릭터 소실 보고, 실루엣 요청 → 강한 x-ray 없음 추정 | T2 실루엣 = 우리가 Hades보다 나아질 지점 | [미검증·플레이어] S25 |
| Torchlight 1/2 | 배경/캐릭터 질감 대비 | 배경은 부드러운 수채 느낌, 캐릭터는 선명한 외곽선·굵은 트림(고전 애니 규칙) | 6.2 값 분리 | [1차 인터뷰] S26 |
| Last Epoch | AO + 소프트 그림자 | 1.0에서 AO·스크린스페이스 소프트섀도, 1.0.5에서 "시야 가리는 나무" 씬별 수정 | T2, T4 | [1차 패치노트] S27, S28 |
| Grim Dawn / Titan Quest | 가림 페이드 | 통설은 있으나 1차 근거 미발견 | — | [미검증] |
| Baldur's Gate 3 (참고) | 구형 마스크 컷아웃 | 0.1초마다 캐릭터→카메라 spherecast, 충돌점에 노이즈 가장자리 월드스페이스 구 마스크로 가림체를 도려냄, 위치 시간 보간 | T2 대안(원형 컷아웃) | [2차 재현] S29 |

엔진 기법 요약:

| 기법 | 핵심 | 출처 |
|---|---|---|
| 발 피벗 Y-sort | Godot `y_sort_enabled`(같은 z_index 안에서만), 스프라이트 원점을 발로 오프셋. Unity Sprite Sort Point=Pivot, Transparency Sort Mode Custom Axis(Y=1), 다부위 캐릭터는 Sorting Group | S30, S31, S32, S33 |
| 배경 높이/깊이 맵 | 그림 옆에 픽셀별 높이/깊이 → 스프라이트 발 높이와 비교(Pillars/Tyranny/Disco). 싼 대안 = IE wall polygon + cover 플래그 | S1, S7, S34 |
| x-ray 실루엣 | 캐릭터 stencil 기록 → 반전 depth test 2패스로 가려진 부분만 단색. 2D는 마스크 렌더타겟 | S35, S36, S37 |
| 디더 페이드 | Bayer 패턴 discard, 불투명 유지라 정렬 문제 없음 | S38, S39 |
| 원형 컷아웃 | 플레이어 중심 월드/스크린 마스크 | S29 |
| 2D 노멀맵 조명 | Sprite Lamp(손그림 조명 프로파일→normal/depth/AO), SpriteIlluminator, Unity URP 2D light normal map | S40, S41, S42 |
| 2D 그림자 | Unity Shadow Caster 2D, 엣지 투영 하드섀도, 탑다운 타일맵 그림자 셰이더(각도·벽높이) | S43, S44, S45 |
| 높이/깊이 안개 | Godot depth fog vs height fog, volumetric FogVolume | S46, S47 |

---

## 5. 기법별 우리 구조 적용안

공통 제약: Windows 기본은 WebGL2 프록시 `X`(쿼드 배처). **합성모드/필터/섀도블러는 프록시에서 무시**(R8)되므로 모든 기법은 (a) 오프라인 베이크 텍스처, (b) 알파만 쓰는 일반 쿼드, (c) `_setBlend(true)` 가산, (d) 별도 WebGL 프로그램(`_ensGLProg`처럼 `_flush()` 후 직접 GL) 중 하나로 구현한다. 성능 봉인: 평상시 ~240FPS 관측(피부바닥 87차), 60fps@대규모 전투 유지.

기법별 근거: T1=S30–S33 · T2=S14/S15(D3 페이드), S29(BG3 컷아웃), S38/S39(디더), S35–S37(실루엣) · T3=S16/S17(D4 카메라 기준 전경) · T4=S1(Pillars 그림자 정합), S22(Hades 공통 순흑), S12(D3 캐릭터 고대비) · T5=S1/S2(Pillars depth), S5(Disco), **S7(IE wall polygon — 우리 구조에 가장 싼 원형)** · T6=S1, S40–S42 · T7=S16(D4 빛 받는 먼지), S46/S47.

| 기법 | 얻는 것 | 우리 구현 방식 | 성능 비용 | 에셋 파이프라인 영향 | 리스크 |
|---|---|---|---|---|---|
| **T1 Y-sort 인터리브 + 밑동 피벗** | 캐릭터가 나무/바위 뒤로 들어감. 입체감 1순위 | 프레임마다 "키 큰 오브젝트(sz≥200 또는 `occ:1`)"만 `footY` 키로 뽑아 적/플레이어와 병합 정렬. 드로우를 ① 바닥형 MAP_OBJS(기존 패스) ② 정렬 리스트(tall obj + 적 + 플레이어) 로 분리. `_OBJ_META`에 `footY`(밑동 y 오프셋 = 현 `ch1-living-detail` feet 값 재사용) 추가. 적 인스턴싱은 "정렬 구간 사이 flush" 또는 깊이값을 인스턴스 속성으로 넣고 depth test | 화면 내 tall obj 10~40 + 적 ≤수백 → 삽입정렬(거의 정렬 상태) O(n). 인스턴싱 배치가 쪼개지면 draw call 증가 → **깊이 버퍼 방식(인스턴스 z=footY)** 권장 | 에셋 변경 없음(메타만). 단 외곽 베이크 나무는 해당 안 됨 | 적 인스턴싱 배치 분할 시 drawcall 폭증(Track B 교훈). 투사체·VFX 순서 회귀 |
| **T2 가림 페이드 / x-ray 실루엣** | 가려져도 플레이어·보스·엘리트 가독성 유지 (D3/PoE/Hades) | (a) 페이드: 정렬 리스트의 tall obj 바운딩박스 ∩ 플레이어/보스 스크린 박스이면 obj 알파를 0.35~0.5로 lerp(200ms). (b) 실루엣: 플레이어를 가린 오브젝트 **뒤에 한 번 더** 단색(보라/청) 알파 0.5로 그림 — 프록시에 스텐실 없으므로 "가린 obj 목록이 있을 때만 플레이어 단색 재드로우" | 페이드: 오브젝트당 AABB 1회. 실루엣: 플레이어 1회 추가 드로우 | 없음. 단색 실루엣은 기존 `_buildOutlineAtlas` 캐시 재사용 가능 | 페이드 대상이 큰 캐노피면 화면 절반이 반투명 → 원형 컷아웃(디더) 대안 |
| **T3 전경 overhang / canopy 층** | 화면 하단(남쪽) 가장자리에 캐릭터 위를 덮는 가지·뿌리 → 카메라와 월드 사이 공기층 | 새 메타 `layer:'front'` MAP_OBJS를 **플레이어·VFX 뒤, 조명 전**(표 순서 22와 23 사이)에 그림. 플레이어 근접 시 T2 페이드 적용. 전투 공터 밖 RIM에만 배치 | 화면당 3~8장 | 새 RGBA 스프라이트 필요(캐노피 가지 오버행). 베이크된 외곽 나무 중 가장자리 것에서 윗부분을 잘라 재사용 가능 | 전투 가독성(SSOT "hide player/boss readability 금지") — RIM 밖/전투면 비침범 규칙 필수 |
| **T4 접지·투사 그림자 확장** | 모든 서 있는 물체와 캐릭터가 땅에 "박힘" | ① 캐릭터 blob: α.18/.25 → 소프트 방사 그라데이션 텍스처 1장(사전 베이크) α.35~.45, 크기 e.r 비례. ② 나무/군락: `Ch1LivingDetail.shadows`의 skew 실루엣(`transform(1,0,-.65,-.32)`)을 모든 `occ` 오브젝트에 일반화(오브젝트 타입당 1회 캐시). ③ 베이크 외곽: 오프라인으로 master에 동일 방향 skew 그림자 추가(빌더 레이어) | 캐시 텍스처 1쿼드/obj. 거의 0 | 빌더에 "shadow pass" 레이어 1개 | 광원 방향 통일 필요(현재 PLAYER_RELIEF 좌상단, 96차 림 = 북쪽 붉은 하늘) → **월드 키라이트 1개를 SSOT로 고정** |
| **T5 베이크 배경 depth/occlusion 마스크 (Pillars/IE 방식)** | 이미 베이크된 36그루·6군락이 캐릭터를 가림 | 오프라인: master와 같은 좌표의 **occluder 알파 + footY 맵**(나무 캐노피 픽셀에 "이 픽셀은 y=Y 기준선보다 남쪽 물체만 덮음") 을 청크별 생성. 런타임: 캐릭터를 그린 뒤, 캐릭터 발 y < 해당 occluder 기준선인 경우에만 그 occluder 조각을 다시 위에 그림(IE의 wall polygon과 동일 개념, Pillars는 depth 텍스처). 구현 간이판: 베이크 나무 목록(`placements.json`)의 각 나무 **캐노피 컷아웃 스프라이트**를 뽑아 T1 정렬 리스트에 "배경 재드로우 전용 tall obj"로 등록 | 화면 내 컷아웃 ≤10쿼드 | 빌더가 placements.json으로 나무별 컷아웃+footY 출력(원화 재생성 불필요) | 베이크 master와 컷아웃 픽셀 정합(색보정·헤일로 포함) 필요. sway 레이어와 이중 변위 |
| **T6 2D 노멀맵 조명(히어로 소품)** | 횃불·스킬 광원이 나무 옆면을 비춤 → 부피 | 히어로 소품(`m_c1tree` 시체나무, 손배치 8그루)만 노멀맵 생성(오프라인: 알파 거리장→높이→노멀, 또는 AI 노멀 추출). 전용 GL 프로그램: 광원 ≤8개 uniform, N·L. 캐릭터는 PLAYER_RELIEF 방식 유지 | 픽셀셰이더 대형 스프라이트 수장 — 저 | 소품당 노멀 PNG 1장 | 프록시 밖 별도 GL 경로(WebGPU 경로 이중 구현). 광원 방향 SSOT 필요 |
| **T7 패럴랙스·대기 원근층** | 화면 밖 세계의 깊이·스케일 | `OUTER_DEPTH_MODEL` 후보4: 저해상도 원경 카드 1~2장, 배속 0.15~0.3, **RIM 밖 void에만**. 안개를 화면공간 방사형 → **월드 y(북쪽=원경) 기반 그라데이션**으로 바꿔 북쪽 출구 방향이 깊어 보이게 | 1~2 drawImage | 원경 카드 1~2장 | CH1 production은 화면을 불투명으로 덮음 → 원경이 보일 void가 거의 없음. 효과 제한적 |
| **T8 카메라 틸트/수직 요소** | 절벽·높이차 | 현재 카메라 3/4 고정. 틸트는 전 에셋 재제작 → **비권장**. 대신 언덕/절벽 앞면 스프라이트를 T1 정렬 대상으로 | — | — | 높음(범위 과대) |

---

## 6. 우선순위 로드맵 TOP 7

| 순위 | 항목 | 한 줄 근거 | 선행 | 규모 |
|---:|---|---|---|---|
| ① | **T1 tall-object × entity Y-sort 인터리브 + footY 피벗** | 모든 벤치마크 게임의 공통 최소조건. 이것 없이는 ②③⑤가 성립 안 함 | 없음 | 중 (draw 루프 분할, heavy 에이전트) |
| ② | **T2 가림 페이드 + 플레이어/보스 실루엣** | ①을 넣는 순간 필요한 가독성 안전장치(D3·PoE·Hades 모두 보유) | ① | 소 |
| ③ | **T4 접지/투사 그림자 통일 + 월드 키라이트 SSOT** | 가장 싼 비용으로 "떠 있음" 제거. 이미 CH1 코드에 skew 그림자 원형 존재 | 없음(①과 병행) | 소 |
| ④ | **T5 베이크 외곽 나무 캐노피 컷아웃 재드로우** | 우리 맵 질량의 대부분이 베이크 → 여기서 가림이 생겨야 "숲 속"이 됨 | ① | 중 (빌더 + 메타) |
| ⑤ | **T3 전경 overhang 층 (RIM 한정)** | 화면 남쪽 가장자리의 공기층 = D4/Hades의 "카메라 앞 물체" | ①② | 소~중 (에셋 소량) |
| ⑥ | **T6 히어로 소품 노멀맵 조명** | 광원이 옆면을 비추는 순간 부피 체감. 비용 대비 효과는 ①~④ 이후 | 키라이트 SSOT | 중 |
| ⑦ | **T7 월드기준 대기 원근 + 원경 카드** | 방사형 안개를 월드 y 그라데이션으로 → 북쪽 깊이 | 없음 | 소 |

### 6.1 첫 구현 슬라이스 — CH1-1 "나무 뒤로 걷기" (스크린샷 검증 가능)

범위: **손배치 나무 `m_ctree13~20` 8그루 + 시체나무 `m_c1tree`만**. 베이크 외곽·적 인스턴싱 분할은 제외.

1. `_OBJ_META`의 해당 타입에 `occ:1, footY:<size×.45 (m_c1tree는 .2016)>` 추가 (`ch1-living-detail.js:453–454` 값 재사용 — 기존 그림자와 동일 밑동).
2. MAP_OBJS 패스(`49968`)에서 `occ` 오브젝트는 건너뛰고, 대신 **`drawP()` 호출 직전/직후로 분할**: `footY(obj) > P.y` 인 occ 오브젝트만 `drawP()` **뒤에** 그림(= 플레이어 앞). 나머지는 `drawP()` 앞. (적은 이번 슬라이스에서 기존 위치 유지 → 적은 나무 뒤로 못 들어감을 명시적 잔여로 기록)
3. T2 간이판: 플레이어 앞에 그려지는 occ 오브젝트의 화면 AABB가 플레이어 AABB와 겹치면 알파 1→0.45 (lerp 12프레임).
4. T4 간이판: 플레이어 blob 그림자 α.25→.38 + 소프트 텍스처.
5. 플래그 `?depthSlice=1`로만 활성(기존 경로 바이트 동일), 검증 후 기본값 전환.

수용 기준(스크린샷): 나무 북쪽(뒤)에 서면 캐노피가 캐릭터 상반신을 덮고 반투명해짐 / 남쪽(앞)에 서면 캐릭터가 밑동 위에 그려짐 / 충돌 원(`colSz 60`)과 시각 밑동의 어긋남이 눈에 띄는지 기록.

### 6.2 pass-96/97(베이크 가독성) 작업에 대한 권고

| 계속할 것 | 멈추거나 바꿀 것 |
|---|---|
| 외곽 군락의 값 분리·림·헤이즈(원경층 역할은 유효) | **플레이 경계에 닿는 나무를 더 베이크하지 말 것** — 가장자리 1열은 향후 T1/T5 런타임 스프라이트 후보 |
| `placements.json`/`features.json` 좌표 SSOT 유지 (T5 컷아웃 입력으로 그대로 쓰임) | 나무 **캐노피·줄기 레이어를 분리 저장**해 둘 것 (bake 시 합성 전 중간 산출물 보존) → T5 비용 절감 |
| 전투 바닥 보호(경계 300px 변경 0) | 베이크 그림자 방향을 **월드 키라이트 SSOT**(결정 전이면 기록만)와 맞출 것. 96차 림(북쪽 붉은 하늘)과 PLAYER_RELIEF(좌상단)가 이미 불일치 |
| 청크 cache key 갱신 규칙 | "입체감" 목표로 추가 retouch 차수를 늘리지 말 것 — 원인 R1/R2/R4는 베이크로 해결 불가 |

---

## 7. 검증 방법

| 항목 | 방법 | 통과 기준 |
|---|---|---|
| QA 위치 스크린샷 | `game.html?test=1&slot=demo&demo=1` (+`depthSlice=1`), 1600×900. PASS96 동일 좌표: 신고 위치(1766,6620)·중앙(4020,4450)·좌(1380,3860)·우(6600,3860) + **손배치 나무 8그루 각각 북/남/동/서 4지점** + 시체나무(102.5,90.5 tile) | before/after 쌍. 북쪽 지점에서 캐노피가 캐릭터를 덮고 페이드, 남쪽 지점에서 캐릭터가 앞 |
| 적 겹침(①완료 후) | 64적 스폰 후 나무 주변 몰이 | 적이 나무 뒤로 들어가며 발 y 순서로 겹침. 인스턴싱 drawcall 증가 ≤ +10/frame |
| 가독성 | 보스/엘리트가 캐노피 뒤일 때 실루엣 보임 | 플레이어·보스 픽셀 가시율 ≥60% (페이드 포함) |
| FPS 예산 | 기존 FRAME/PERF 계측(`?perf`), Edge·Chrome, 전경 12초 + 64적 12초 | 평상시 변화 ≤3%, 64적 60FPS 유지, 34ms 초과 0 |
| 회귀 | `test/ch1ForestSway.test.js`, `test/ch1SunburstTrees.test.js`, 충돌/isW 불변 | PASS, geometry hash 동일 |
| 렌더러 3종 | WebGL2(기본), `?webgpu=1`, Canvas2D 폴백 | 3경로 모두 동일 순서·페이드 동작 (R8: 합성모드 의존 금지) |

---

## 8. 출처

조사일 2026-09-30. S2는 Obsidian 포럼이 403이라 검색 요약으로만 확인.

| ID | URL |
|---|---|
| S1 | https://eternity.obsidian.net/eternity/news/update--79-graphics-and-rendering- |
| S2 | https://forums.obsidian.net/topic/70875-question-to-devs-how-does-the-depth-map-work/ |
| S3 | https://eternity.obsidian.net/eternity/news/pillars-of-eternity-ii-deadfire-update-30---from-blockout-to-completion-the-environments-of-pillars-ii |
| S4 | https://forum.unity.com/threads/how-did-the-obsidian-developers-do-the-art-for-tyranny-and-pillars-of-eternity.524984/ |
| S5 | https://discoelysium.com/devblog/2016/08/18/tiling-of-the-world |
| S6 | https://discoelysium.com/devblog/2019/01/23/from-render-to-paintover |
| S7 | https://iesdp.bgforge.net/file_formats/ie_formats/wed_v1.3 |
| S8 | https://d2mods.info/forum/viewtopic.php?t=63795 |
| S9 | https://www.gdcvault.com/play/1028028 |
| S10 | https://www.invenglobal.com/articles/15159/ |
| S11 | https://us.forums.blizzard.com/en/d2r/t/transparent-walls-of-travincal-temple/113380 |
| S12 | https://www.gamedeveloper.com/design/gdc-2012-diablo-iii-s-art-director-shows-off-design-process |
| S13 | https://www.gdcvault.com/play/1015306/The-Art-of-Diablo |
| S14 | https://answers.unity.com/questions/343581/how-to-achieve-diablo-style-walls.html |
| S15 | https://forums.unrealengine.com/t/diablo-style-wall-hiding-in-blueprints/9697 |
| S16 | https://news.blizzard.com/en-us/article/23964183/peeling-back-the-varnish-the-graphics-of-diablo-iv |
| S17 | https://diablo.blizzplanet.com/blog/comments/diablo-iv-quarterly-update-environment-art-march-2022 |
| S18 | https://80.lv/articles/radiance-cascades-new-approach-to-calculating-global-illumination |
| S19 | https://www.pathofexile.com/forum/view-thread/3626760 |
| S20 | https://www.pathofexile.com/forum/view-thread/3878473 |
| S21 | https://www.gamedeveloper.com/art/learn-how-supergiant-brought-i-hades-i-hand-painted-characters-to-life |
| S22 | https://www.pointnthink.fr/en/the-art-of-hades-en/ |
| S23 | https://store.steampowered.com/app/1145350/Hades_II/ |
| S24 | https://graphicsprogrammingconference.com/archive/2024/ |
| S25 | https://steamcommunity.com/app/1145350/discussions/2/599649402094619980/ |
| S26 | https://www.gamedeveloper.com/business/from-the-ashes-of-i-mythos-i-the-art-of-i-torchlight-i- |
| S27 | https://forum.lastepoch.com/t/last-epoch-1-0-patch-notes/62536 |
| S28 | https://www.lastepochtools.com/news/article/last-epoch-patch-1-0-5-notes-69977 |
| S29 | https://80.lv/articles/artist-recreated-baldur-s-gate-3-occlusion-cutout-effect |
| S30 | https://docs.godotengine.org/en/stable/classes/class_canvasitem.html |
| S31 | https://kidscancode.org/godot_recipes/4.x/2d/using_ysort/index.html |
| S32 | https://docs.unity3d.com/6000.0/Documentation/Manual/2d-renderer-sorting.html |
| S33 | https://docs.unity3d.com/6000.3/Documentation/Manual/sprite/sorting-group/sorting-group-landing.html |
| S34 | https://discussions.unity.com/t/pillars-of-eternity-style-per-pixel-occlusion-for-3d-object-on-a-flat-2d-background/945365 |
| S35 | https://godotshaders.com/shader/stencil-based-silhouette/ |
| S36 | https://www.gdquest.com/tutorial/godot/shaders/silhouette-2d/ |
| S37 | https://lindenreidblog.com/2018/03/17/x-ray-shader-tutorial-in-unity/ |
| S38 | https://danielilett.com/2020-04-19-tut5-5-urp-dither-transparency/ |
| S39 | https://godotshaders.com/shader/camera-occlusion-dither/ |
| S40 | https://www.snakehillgames.com/spritelamp/ |
| S41 | https://www.codeandweb.com/spriteilluminator |
| S42 | https://docs.unity3d.com/6000.4/Documentation/Manual/urp/2DLightProperties.html |
| S43 | https://docs.unity3d.com/6000.0/Documentation/Manual/urp/2DShadows.html |
| S44 | https://www.slembcke.net/blog/SuperFastHardShadows/ |
| S45 | https://godotshaders.com/shader/2d-top-down-shadows-tilemap-ready/ |
| S46 | https://docs.godotengine.org/en/latest/tutorials/3d/environment_and_post_processing.html |
| S47 | https://docs.godotengine.org/en/stable/tutorials/3d/volumetric_fog.html |

미검증 항목: Hades 전경층/실루엣 규칙, PoE 가림 방식(디더 vs 알파), Grim Dawn·Titan Quest·Last Epoch 페이드 구현, D3 per-mesh raycast 세부, 패럴랙스·비네트·카메라 틸트·blob 그림자의 게임별 1차 근거. 이 항목들은 일반 관행으로만 다뤘다.

## CODE CHANGE
**NONE.** 이 문서는 조사·계획 전용이다. `_MAP_SSOT_INDEX.md`에는 맵 에이전트가 작업을 마친 뒤 이 문서 포인터를 1줄 추가해야 한다(이번 작업에서는 해당 파일 미수정).

## 2026-10-06 독립 정사영 캐릭터·맵 consumer 포인터

완료ID `ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006`. 이번 독립 `http://127.0.0.1:3387/tools/2_5d-world-lab.html`은 주민v2 scene/cleanplate/기존nav1192를 읽기전용 소비하는 **동측 대표구간**이다. 기존이미지씬에디터의API·저장·Unity package/Prefab/FBX/PSD import 상태·주민/대화consumer를 변경하지 않았다. fullmap/본편교체가 아니다.

| 항목 | 현행범위 |
|---|---|
| 지형 | clipx4300…6560/y3200…4600,50°정사영/scale400,저장원본start4020/7740·exit4020/1740 불변 |
| 높이 | physicalheight UNKNOWN; authoreddepth240/inset90%는 시험 geometry. 실제heightmap/editorheight roundtrip 미구현 |
| 표시 | 전사/실버테일/드루이드12본plane·대표start5480/3740/terrain시험spawn5900/3820; 같은nav질의radius12/clipmargin12 |
| 전경 (최초 이력; 2026-10-07 최신절로대체) | 동측뿔mask11점/footY4320,actor20/40-foreground30 동일transparentpass,겹침시선택페이드opacity.32 |
| 결과 | 실제bone변형/8방향/1회공격/nav밖제한/효과/가림/정지중교체·reset관측. 원화1254²흐림·skirt hardseam **VISUALRETOUCH**,본편native6/청취/NPC실지급·save/상승/완전3D/A급미인수 |

정확맵source/UV/수식/수치/§23 MAP PRODUCTION REPORT는 `HELL_RIFT_2_5D_SLICE_20261006.md`, 캐릭터/공격/효과/UI/실검수는 `../4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`를따른다. 현재 MAP v2원자료는editor실행이없는projection검증후보이며실제editorroundtrip 채택으로계산하지않는다. 이전시점의CODE CHANGE NONE은당시조사범위이고이번구현은위별도코드다.


## 2.5D 현행 소비 계약·제작 목표 동기화 — 2026-10-06T13:37:48.744345+00:00

이 기록은 앞선 시점의 source/채택 대기 이력을 갱신하는 현재 독립 3387 결과다. 공통 목표는 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`(전사·실버테일·다크드루이드의 같은 지옥의 틈 2.5D 화면에서8방향·대기/보행/달리기/공격·깊이/가림). 관리3/전문15의 기존 역할별 코드 산출 목표를 유지하고 새 팀·관리 채팅·실행 세션은 추가하지 않는다.

| 항목 | 현재 상태 / 코드와 같은 계약 |
|---|---|
| 실제 팀 원자료 | 최초7+v2 4+v3 4+STORY v4 1=완료 소유 raw16 보존. source 도구·공식 end·bytes/fullSHA를 확인했다. 원자료 보존은 consumer/native 인수와 구분 |
| public 소비 | SKILL visual-pose-consumer·ANIMVFX actor-effect-lifetime·MAP scene-registration·QA slice-acceptance 4역할의 파생본을 실제 root lab에서 소비. BOSS/ENEMY/STORY 일반 본편 소비0 |
| 실제 맵 검사 | 실제 로딩 terrain.sourceSceneSnapshot()=K.clone(source)를90767 B canonical HTTP raw의 SHA256·보호 payload와 대조. world XY 투영 왕복 VERIFIED/1192타일. editorProvider 없음=PENDING; 실제 editor 저장·불러오기 인수0 |
| 표시 검사 | 실제 getWorldPosition→sceneToWorld의 actor 원점 world px를 제자리12 렌더 프레임 관측. drift 허용4 px/clip inset12·nav radius12. raw scene units·anchorY/h 비율을 접지 증거로 계산0 |
| source 규격 | 선언 frames×8방향을 순회, finite 양수 referenceHeight/asset width,height/rect, cell 내부 anchor. Infinity/NaN/숫자문자열/0 거부. 정상 crop별 anchor 변화 허용 |
| 검사 무효화 | 이동 키/blur/캐릭터/모션/reset/정지와 자동 attack→idle 시 이전PASS/FAIL=PENDING·samples0. paused 요청은PENDING, 완료 관측으로 계산0. snapshot 결과는 structuredClone |
| renderer/perf | 기존renderer1/RAF최대1/추가mixer0 유지, diagnostic job은12 samples 뒤 폐기. 새로운 save/scene/nav 쓰기·게임/빌드/서버 실행0. 실물폰·장시간FPS 미인수 |
| 실제 검증 | root Mac Chrome/3387 새21검사+자동모션해제5검사 PASS/새runtime0,3id×4mode에서144 프레임 앵커/nav 관측. 이전502/9+8+13+3 검사는 반복하지 않음. 실제 화면3장과 결과json 보존 |
| 시각 판정 | 맵1254² 확대 흐림·hard wedge·절벽 skirt seam이 남아 VISUAL VERDICT: RETOUCH. 새 높이는 authoredDepth240/inset.9 시험값/physicalHeight UNKNOWN. 본편 전투/NPCgrant·save·상승/native6/청취/IK 발픽셀/A급 인수0 |

정확 원화/셀/geometry/순서·수치·API·provenance는 `DIRECTIONAL_CHARACTER_RIGS_20261006.md`와 `HELL_RIFT_2_5D_SLICE_20261006.md`의 최신 실제 MAP·QA v3 public 소비 절 및 §23 MAP PRODUCTION REPORT을 따른다. 기존 역사 문서·본편2D 계약·다른stage LOCK는 독립lab 값으로 덮어쓰지 않는다. raw의 공식 완료ID/end/정확핀은 CH1_2_5D_TEAM_CANDIDATES_20261006.md에 보존한다. 외부 증거 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/v3-live-qa/`의 result.json21·mode-release-result.json5·final-diagnostics.png를 구분한다.

STORY v4는 요청2결함을 해결했지만 method provider의 this=ports를 분리 호출로 잃는 P2가 남아 일반 consumer 채택0이다. Claude8 담당에게만 `CH1-2_5D-STORY-METHOD-CONTEXT-20261006`으로 신규 v5 1파일/rs.call(ports)·cc.call(ports) 복원을 인계했으며, 이 기록 시점의 송신 인계와 이후 실제 peer/source/end 검수는 구분한다. 동일 TASK 재송신·다른 역할 중복지시0. Codex7 UIUX 첫 송신은 자동승인검토에서 도구승인필요/currentpolicynever로 거절되어 수신0/다른6미송신, ART 기존 선택 대기도 별도다. 전원 가동을 선언하지 않는다.

원격 exact `75ce5819ef6e1bbccb5a2acdf5a2db7142b6054e`(v3raw4) 및 `ac96c952b4f3a36e53cd210f745551dd13b8e146`(root code5+STORYv4raw1+상세docs3)의 보존을 확인했다. 후자는 actual80 checkpoint 시도에서 진행로그 hook 누락을 잡아 우회 없이 보완한 actual81 정상 commit이다. 전체 docs 관련 키워드 검색 후 관련15문서를 현재 계약/역할 상태로 동기화하며, 기존 bytes prefix와 백업을 보존한다. 현 관리 docs도 실제80부터 완료 소유 범위만 즉시 정상checkpoint한다. foreign68/owner STATELOG4/보호10/게임·scene/nav·sourcePNG·save/2_3·Q전용·어택티켓 금지·이전23 유지. paused 자동화·메일/권한/설치/Windows/게시/새팀 재개0.


## STORY v5 실제 완료·원자료 보존 동기화 — 2026-10-06T13:42:22.974466+00:00

이 절은 직전 v5 대기 기록 이후의 공식 완료 관측이다. `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 기존 역할별 목표는 유지한다.

| 항목 | 현행 실제 상태 |
|---|---|
| 원자료 | 최초7+v2 4+v3 4+STORY v4 1+v5 1=완료 소유 raw17. 새 v5 공식 ID `CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE` / actual end `436f895c-ae0f-4156-94ca-44155afd547c`@2026-10-06T13:39:06.362Z, source·end·idle 확인 |
| 의미검수 | `readCommitted` 실제84행 `rs.call(ports)` 및 `chapterGate` 실제101행 `cc.call(ports)`로 this=ports 회귀 해결. lookup/검증/호출 예외→UNKNOWN, thenable/accessor 거부, flags UNKNOWN과 authoritative true 독립 유지. 공식 종료문의91/109는 이전v4 위치이며 현재v5 위치로 혼동하지 않음 |
| 검증 경계 | 팀 신규 stdin7/7 PASS는 팀 source 검증. 개별 getter 반례의 신규stdout 증거는 없음; guard 유지는 root 읽기 검수 근거. root 기존 실제3387 신규21+5 검사 및 화면3장은 이전 실관찰로 보존하며 반복/합산 재검사0 |
| 채택 경계 | public 소비4(SKILL/ANIMVFX/MAP/QA) 유지. STORY v5 일반 consumer·아이템 지급·퀘스트등록·save·본편상승 채택0. editor roundtrip PENDING/native6·청취·IK 발픽셀·완전3D·A급 인수0 |
| 시각/팀 상태 | VISUAL VERDICT: RETOUCH(맵 확대 흐림·wedge·skirt seam). Codex7 첫송신 자동승인검토 거절/수신0·나머지6미송신, ART 기존선택대기. 새팀/실행세션/같은TASK 재송신·거절우회0 |

새 원자료는 `CH1_2_5D_TEAM_CANDIDATES_20261006.md` exact pin 표와 외부 `story-v5-official-receipt.json`으로 추적한다. 원본 v1–v4·게임·sourcePNG·scene/nav·save·foreign68·보호10·기존23은 유지한다. 완료소유만 actual80부터 즉시 code+docs checkpoint하고 정상push·remote exactSHA를 확인한다. paused 자동화/아침메일·권한·설치·Windows·게시 재개0.


## 현행 독립 3387 NPC·맵 연결 동기화 — 2026-10-06T14:40:05.634520+00:00

현행 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전clip2260×1400·주민미연결·실editor미인수 설명은 이전 관측이다. 아래는 최신 tools/2_5d-world-lab과 해당 파생 consumer의 실제 상태이며 다른stage LOCK/본편 계약을 바꾸지 않는다.

| 항목 | 코드와 같은 현행 상태 |
|---|---|
| 맵/카메라 | RIFT_TERRAIN.clip 0/0…8000/8000, groundTriangles32, source nav1192 불변. centre5430/3900·reset5480/3740, 정사영50°/scale400/기본높이3.5, 배우 위치를추종. physicalHeight UNKNOWN/depth240/inset.9 |
| 지면/절벽 | 2026-10-06 이력: skirt shade=1−.78f/maskFeatherApplied=false. 2026-10-07 현행: 고정globalUV·28선분 최단거리/120worldpx/opacity.38 sRGB 합성을 skirt·backplane 공용 불투명재질로 소비, shader 연결 뒤 maskFeatherApplied=true. ground-only sRGB soft-light alpha.4/nav1192/mirror480²/period320. sourcePNG1254²·1920²불변/원해상도 확대흐림 RETOUCH |
| NPC4 표시 | 기존1254²atlas SHA ff20e1f5… /displayScale1.8/정적billboard. sourcefeet 하란4660/6660·베린6020/5580·네사6300/5020·도릭5220/2500 불변. 배우/주민order=30+(footY−4320)/8000×10/뿔30 |
| 접근·대화 | displayApproach 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500/각120거리. nearest일치·navradius12검사. R/KeyR대화, 기존createRiftDialogue/session Map 사용; range140/line step≤20/radius12. 원본접근검사40거리/source.start·exit/nav변경0 |
| 선택·종료 | 실제베린gift1·재방문중복0·네사quest1, 총trial2/actualGrantfalse/editor-session-only. 이동·외형/모션/위치변경·pause·Escape·닫기·pagehide에서닫음. 대화중neutralidle/facing. 본편grant·quest등록·save·chaptergate0 |
| cue 소비 | interaction-cue-lifetime.mjs의mesh2 pool/추가RAF·timer0. 접근ring0xcdbb86/opacity.55/size.16/lift.003·열림marker0xc8623a/opacity.8/size.12/lift.42. NPC원본foot에표시/order=NPC+.5. pulse1.6Hz/depth.22; reduced-motion정적/캐시최대4·guard실패숨김·종료해제 |
| API·에디터 | scene-registration.editorRoundtrip이async save/load. format-only=FORMAT_VERIFIED/realEditorfalse, provider없음PENDING. 실제다운로드/import·90767B원본SHA c508e70d…동일검수5PASS. browser evidence의savedUTF8 SHA 불일치/input변조/async실패FAIL. lab metric-editor는provider미공급PENDING |
| 실관측 | 새최종Chrome/3387 actual23검사PASS/pageerror0/HTTP실패0/NPCatlas핀변조readyfalse·RAF0/pagehidecueNPC해제. 스냅샷복사·reduced-motion·외형교체·대화종료검사포함. 실제canvas영상522811B/DOM대화·소리미포함 |
| 팀/채택 | Claude8 기존7source/end/idle, raw24(기존17+이번7)후보보존. 신규raw와root파생consumer채택구분/public4역할유지/cue는기존ANIMVFX추가모듈. 신규STORYraw own-key P2/BOSSfootAnchor·referenceHeightUNKNOWN/MAPecho오류미채택 |
| 송신/보존 | Codex7전문첫송신자동승인검토거절/수신0·다른6미송신, ART기존선택대기/전원가동선언0. owner STATELOG4 별도/foreign68·보호10·기존23·sourcePNG/scene/nav/save·2_3/Q전용·어택티켓금지유지 |
| 인수/다음 Gate | VISUAL VERDICT: RETOUCH. 독립NPC표시·대화시험과본편연결/보스여정/native6/청취/IK발픽셀/A급 인수를구분. 고밀도지면·절벽/전경alpha·feather 보정 및본편consumer연결남음 |

전수 키워드검색 근거와 정확상세수치/API/핀/§23 MAP PRODUCTION REPORT: `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 현행목표 절. 실제editor/provenance는 MAP_SCENE_EDITOR_20261005.md, 공식완료ID·fullpin·후보미채택 및MAP/STORY경로·삭제규칙위반의실제증거/피해UNKNOWN은 CH1_2_5D_TEAM_CANDIDATES_20261006.md. 외부 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json/editor-final-result.json/화면/interactive-motion.webm/Git영수증을따른다. 이전QA를새검사로합산0. 코드/주요docs/raw는25a6e38df92c132cf6f1dd98db364391fbb18699에서완료소유NUL82 checkpoint, 나머지관련docs는80부터순차checkpoint·정상push/remoteexact로보존한다. paused자동화·아침메일/새팀·실행세션/설치·권한·게시·Windows재개0.


## 2026-10-07 현행 전경3·보행 바닥 가림 수정

완료ID `ROOT-RIFT-FOREGROUND-NAV-CONSUMER-20261007`. 독립3387 world-lab에서 원본 전경1→3을 연결했다. 이전 east-only/actor20·40 기록은 당시 이력이며 현행 계약은 아래와 같다. 기존 에디터 scene의 3조각·geometry·mask·PNG·nav1192는 불변이다.

| 적용 위치 | 현행 정확 계약 |
|---|---|
| terrain/lab 전경 | obj-east-horn footY4320/order30/mask11/triangle9; obj-west-root footY5360/order31.3/mask12/triangle10; obj-south-root footY6920/order33.25/mask10/triangle8 |
| 공통 앞뒤 순서 | actor·resident·전경 모두 `30+(footY-4320)/8000*10`; transparent=true/depthTest=false/depthWrite=false. 전경pivot(0,1)/rotationX−angle/alphaTest.01/원maskFeather0. 겹침 선택fade.32(OFF1) |
| 바닥 가림 차단 | 공용nav200²/40000B RedFormat/UnsignedByte·Nearest/no mipmaps. `(199-y)*200+x`에 walkable255/나머지0, `riftForegroundUV=(worldX/8000,1-worldY/8000)`. map_fragment 뒤 alpha×`1-step(.5,nav.r)`/후속 alphatest. 원nav 쓰기0 |
| API/snapshot | occluderFootY4320 호환값 유지; foreground 배열의 objectId/footY/renderOrder/opacity/maskPoints/triangles/sourceCrop/feather/nonWalkableOnly=true 추가. geometry/material 각3+공용navtexture1 terrain 소유·Set dispose1회/borrowedplate 중복dispose0 |
| 실제 관측 | 전경 등록/순서/원본 보존/선택fade 11유효성공 후 정지중disabled talk 클릭harness30초 timeout FAIL 보존. 남쪽 실제몸가림 발견 후 nav-alpha 수정. 수정후 신규4항목(바닥차단/실Haran대화/실KeyS이동/실shader·page·consoleerror0) PASS. 이전27을 이번검사 수에 재사용0 |
| 시각 인수 | 실제before east/south/north 캡처를 보존하고 수정후 south/east 열람. 남쪽몸가림 수정 확인; 서측 전경 전체/실전투·출구·8카메라 인수 UNKNOWN. 원판1254² 확대흐림 남음. VISUAL VERDICT: RETOUCH |
| 경계 | 독립lab≠본편/native6·청취·실보상save·물리높이·해부학적foot/IK·A급완성. 원자료45 미채택 보존과 public 별도구현을 구분 |

정확XY/crop/shader·실패/수정화면·§23 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md` 최신절. 근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/foreground-{before,after,mask}-*`. docs 전체 관련keyword 검색247매칭32파일을 현행/역사/타시스템으로 분류했다. ownerSTATELOG·잠금/보호문서·역사영수증은 수정0.
