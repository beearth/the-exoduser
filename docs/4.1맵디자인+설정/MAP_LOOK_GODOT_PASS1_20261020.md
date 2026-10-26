# MAP-LOOK 1차 — Godot 맵 표현 강화 (2026-10-20, PC Claude)

> 사용자 결정: "이식전부터 맵목표는 POE2 레스트포위키드를 목표로 하자", "입체감 생동감 부분 광원이나 그런것들의 목표야",
> "지금부터 작업해 … 맵 이식은 딱히 안해도 돼고", "입체감 원근감 생동감등 신경쓰고".
> 상위: [맵 개선 프로젝트](MAP_IMPROVEMENT_PROJECT.md) §1 레퍼런스 목표·G8·MAP-023/024 · [Godot 개조 전략](../engine/FDG_GODOT_CUSTOM_STRATEGY_20261020.md) §8.
> 브랜치 `claude/map-look-20261020`. 기반으로 LOOK-001(Mac Codex `f5b16102e`) 비교 코드를 합쳤으나 제품 경로는 새로 만들었다(LOOK-001 B안은 설정 시점 화면만 복제하는 비교용이라 게임에 못 씀).

## 1. 구성 (표시 전용 — 충돌·동선·스폰·지역·시뮬레이션 불변)

| 층 | 구현 | 파일 |
|---|---|---|
| 어둠 | 원본 화면 오버레이의 라이트맵 어둠 단계를 끄고(`set_native_lightmap_enabled(false)`) 월드 캔버스 `CanvasModulate` 환경광을 사용한다. 2026-10-26 현재 기본값은 (.35,.33,.38), 맵 룩 화면 색보정의 어두운 영역 감마는 .75다. 맵 룩 OFF일 때 감마 1.0으로 원본 보정을 유지한다. 안개·환경광·비네트는 원본 값 유지 | `scripts/native_map_look.gd`, `scripts/native_screen_lighting.gd`, `data/map_look_ch1.json` |
| 부분 광원 (G8, MAP-023) | `PointLight2D` 37개 + 소환굴 14개(G.spawnHoles를 0.5초마다 읽어 생성·소멸 동기화). 광원마다 색·반경·깜빡임(불) 또는 박동(생체·독). 반경 비례 높이(반경×0.45) — 요철 조명 N·L이 바닥에 닿게. z 범위 전체(기본 ±1024는 바닥 z −3000·액터 y/4를 못 비춤) | 같은 스크립트, `data/map_look_ch1.json` |
| 요철 | 그림 명암에서 노멀을 실시간 계산하는 캔버스 셰이더(바닥 청크 bump 2.8, 소품 2.2). 노멀맵 파일·AI 생성 0 | `assets/vfx/map_look_lit.gdshader` |
| 입체감 | 소품 29개 투사 그림자: 같은 그림 알파를 흐려(12px) 남동쪽 오프셋(폭×.08, 높이×.06), 세로 소품(해골 토템·교수대·뼈 아치)은 밑동 기준으로 눕혀 기울임. 월드 광원 북서 고정(MAP-012). 나무 밑동 `LightOccluder2D` 15개 — 플레이어·모닥불 광원이 실제 그림자를 드리움 | `assets/vfx/map_look_silhouette.gdshader` |
| 원근감 | 맵 경계 밖 27곳에 흐린 근경 실루엣(썩은 나무 그림, 16px 흐림, 어두운 단색 α.82). 카메라와의 거리×0.12만큼 더 움직여 시차. 걷는 바닥(경계 다각형) 안으로 들어오거나 플레이어를 덮으면 α .28로 옅어짐(전경 3% 원칙·MAP-002) | 같은 셰이더 |
| 생동감 (MAP-024) | 나무 8·시체나무·고치·교수대 수관 흔들림(정점 셰이더, 밑동 고정, 개체별 위상), 포자 38개(흐린 큰 입자 α.22, 화면 따라 생성·월드 고정), 캠프 불씨 34개 | 같은 스크립트 |

켜짐: 일반 실행 기본 ON. 테스트 하니스(SceneTree 스크립트) 부팅은 OFF라 기존 테스트 기준선 불변. 강제: 실행 인자 `--map-look=on|off` 또는 main 메타 `native_map_look`.

## 1-2. 2차 추가 (같은 날)

| 층 | 구현 |
|---|---|
| 빛줄기(생동감·깊이) | 수관 틈 빛줄기 8개(−32°, 폭 176~272·길이 700~1000). 절차 생성 텍스처(길이 방향 생성→바닥 끝 고임, 폭 방향 부드러운 소멸 — 1차 딱딱한 띠 RETOUCH 후 교체), 가산·α.17, 0.37Hz 일렁임, 줄기마다 먼지 14개, 바닥 끝에 옅은 광원(반경 폭×1.1·세기 .5) |
| 지역 분위기(MAP-010) | 2026-10-26 현재 4지역 환경광: 북서 (.34,.32,.37), 북동 (.35,.37,.43), 남서 (.33,.37,.38), 남동 (.35,.33,.38). 지역 이동 시 서서히 전환(초당 0.6). 2026-10-20 1차 값은 각각 (.22,.21,.31), (.23,.26,.37), (.21,.28,.33), (.28,.25,.28)였다. |
| 번개 지역 섬광 | 북동 지역에서 7~16초마다 0.42초 두 번 번쩍(환경광 → (.55,.62,.85) 55%), 고정 seed |

시작 공터: 빛줄기 2개가 플레이어 주변 바닥에 고여 1차의 단조로움이 줄었다(`_out/maplook-v8/start_on.png`).
전투 가독성: 시작 지점 기검참 ON/OFF 1x 비교(`_out/maplook-atk/attack_off_left_on_right_1x.png`) — 플레이어 빛 안이라 OFF와 같은 선명도. 광원 밖 적 탄막 가독성은 미검수.
전후 비교 시트: [maplook_pass1_before_after.jpg](maplook_pass1_before_after.jpg) (캠프·제단·시체 나무·고치, 왼쪽 전/오른쪽 후).

## 1-3. 3차 추가 — 전투 동적 광원 (같은 날)

투사체·검기·피격 섬광이 주변을 비춘다(PoE2식). main·world 직속 자식을 0.1초마다 훑어 스크립트(기반 스크립트 포함) 이름으로 판별, 효과 노드 자식으로 PointLight2D를 붙인다(효과가 사라지면 함께 사라짐). 동시 최대 18개.

| 스크립트 | 색 | 반경 | 세기 |
|---|---|---|---|
| enemy_projectile_fire | 1.0/.48/.18 | 230 | .95 |
| enemy_projectile_lightning | .62/.76/1.0 | 230 | .95 |
| enemy_projectile_ice | .52/.86/1.0 | 200 | .8 |
| enemy_projectile_holy | 1.0/.92/.62 | 220 | .85 |
| enemy_projectile_dark | .58/.26/.80 | 190 | .7 |
| crescent(기검참) | .86/.88/1.0 | 260 | .7 |
| hit_effect(피격 섬광) | 1.0/.90/.76 | 170 | .85 |

검수: 시작 지점 기검참 전/후 1x(`_out/maplook-v10/attack_before_after_fxlight.png`) — 검기 주변 바닥이 은빛으로 밝아짐. 적 투사체 광원은 실전 캡처 미검수.

## 2. 광원 표 (data/map_look_ch1.json)

| id | 위치(소품) | 색 RGB | 반경 | 세기 | 움직임 |
|---|---|---|---|---|---|
| player_light | 플레이어 −20y | 1.0/.70/.46 | 560 | 1.05 | 깜빡임 .04·7 · 그림자 |
| camp_fire / camp_glow | m_c1camp −10y | 1.0/.46/.16 · 1.0/.62/.30 | 640 · 240 | 1.55 · .9 | 깜빡임 .16·11 / .22·17 · 그림자 |
| altar_ritual / penta_floor | m_c1altar −40y / m_penta_circle | .95/.10/.12 · .85/.08/.10 | 660 · 320 | .72 · .45 | 박동 .22·1.3 / .3·1.3 |
| skull_totem_eyes | m_skull_totem −70y | 1.0/.18/.10 | 180 | 1.0 | 박동 .25·2.1 |
| glow_flower | m_fyellow | 1.0/.86/.36 | 260 | 1.1 | 박동 .15·.9 |
| toxic_pool_n / toxic_growth_n | m_c1pool / m_c1gtoxic −20y | .38/.95/.30 · .45/1.0/.32 | 600 · 380 | .55 · .42 | 박동 .18·.6 / .2·.75 |
| toxic_pit_s / toxic_growth_s | pit_poison / m_c1gtoxicf −20y | 같은 독색 | 560 · 360 | .5 · .42 | 박동 .2·.65 / .2·.8 |
| cocoon_sick | m_c1cocoon −30y | .80/.86/.42 | 320 | .6 | 박동 .2·.5 |
| corpse_tree_heart | m_c1tree −120y | .95/.16/.14 | 620 | .85 | 박동 .3·1.05 |
| pods_n1/n2 | m_c1spod 2개 −10y | .95/.30/.20 | 200 | .7 | 박동 .3·1.4 / 1.2 |
| tree_glow ×8 | 썩은 나무 4종 | .92/.18/.14 | 그림 폭×.55 | .55 | 박동 .35·1.1 |
| spawn_hole ×14 | G.spawnHoles | .62/.10/.34 | 220+size×160 | .9 | 박동 .3·.8 |

## 3. 화면 검수 (PC Windows, Godot 4.7.2 Compatibility, 1920×1080 내부 뷰포트, 1x 직접 확인)

캡처: `G:/exoduser-wt/_out/maplook-v4/`·`maplook-v5/` (start·camp·altar·toxic_s·toxic_n·corpse_tree·hole·cocoon). 캡처 도구 `tests/capture_map_look.gd`.

| 장면 | 판정 |
|---|---|
| 캠프 | **좋음** — 모닥불빛이 텐트·상자·돌·플레이어 망토 옆면에 닿고 바깥은 차갑게 가라앉음. 캠프·토템 남동 그림자로 바닥에 붙음 |
| 제단 | 좋음 — 붉은 의식광이 제단·해골 토템·바닥을 물들임. 1차 과포화(윗면 중앙 타 버림) → 세기 1.25→.72·반경 560→660으로 정정 |
| 시체 나무 | 좋음 — 붉은 심장광으로 뿌리 덩어리가 입체적으로 읽힘 |
| 독 웅덩이 북 | 좋음 — 웅덩이 안이 녹색으로 빛남 |
| 독 웅덩이 남 | RETOUCH — pit_poison 원화가 이미 밝은 녹색 원판이라 빛을 줄여도 평평한 UI 원판처럼 보임(원화 문제) |
| 시작 공터 | 부분 — 플레이어 빛 웅덩이와 양옆 나무 붉은 혹 빛은 생겼으나 공터가 비어 단조로움. 바닥 안개·접지 그림자(PC Codex 진행 중)로 보강 예정 |
| 고치 | 좋음 — 1차에서 근경 실루엣이 걷는 바닥을 덮는 실패(검은 손가락 모양) → 경계 밖 720px·흐림 16px·걷는 영역 안 α×.35로 정정, 2차 통과 |

**VISUAL VERDICT: 1차 RETOUCH(진행 중)** — 부분 광원·접지 그림자·근경 원근은 목표 방향으로 확실히 개선. 시작 공터 단조로움·독 원판·전투 VFX 가독성(어두운 환경에서 검기·투사체) 미검수.

## 4. 성능 — 측정 한계 명시

PC에서 창을 화면 밖에 두고 재면 Windows가 백그라운드 창을 효율 코어로 돌려 맵 룩 OFF에서도 프레임 55~117ms·물리 1틱 17~20ms가 나왔다(절대값 무효). 같은 조건 ON/OFF 비교에서는 차이가 잡음 범위(ON 89.9/107.4ms vs OFF 97.5/105.6ms, draw call +6~8, 노드 +112). 앞쪽 지점만 느리고 뒤쪽은 ON 상태 5.9~6.0ms였던 실행도 있음. **정식 성능 수치는 Mac 실측으로 별도 확정 필요(미확인).**

## 5. 검증

`tests/test_map_look.gd` 16/0(하니스 기본 OFF·원본 라이트맵 유지 / ON 설치·광원 수·소환굴 14·그림자·전경·가림·재질 36·입자·어둠 이관 / G 키 집합·소품 위치·충돌 불변). 회귀: contracts·p2003a_lighting·p2002a_hud·p2004a_pets·p3002_spawn_holes·starter_state·p2007a 0실패.

## 6. 남은 것 / 병행 작업

- PC Codex 4건 병행(독립 모듈, 총괄이 연결): MAPLOOK-TOXIC 독액 수면, MAPLOOK-SHADOW 캐릭터·적 접지 그림자, MAPLOOK-MIST 월드 바닥 안개(광원에 물드는 안개), MAPLOOK-HOLE 소환굴 공허 연출.
- 전투 VFX 가독성(어두운 환경광에서 검기·투사체·피격 숫자) 검수, 필요 시 VFX를 환경광 예외로.
- 시작 공터 연출, pit_poison 원화, 2장 이후 맵 데이터(현재 1-1 전용 data/map_look_ch1.json).
- Mac 실측 성능.

## 7. 2026-10-26 시작 전투 공터 표시 개선

사용자 지적: 먼 카메라에서 맵이 너무 검고 공터가 비어 보이며, 스팀 전투 컷에서 몬스터가 읽히지 않았다. 기존 CH1-1 조명 맵의 실제 Godot 런타임을 대상으로 표시 레이어를 보강했다. 아래 바닥 질량은 충돌·소환·게임플레이 데이터를 바꾸지 않는다.

| 항목 | 현재 값 / 적용 위치 | 목적 |
|---|---|---|
| 기본 환경광 | RGB (.35,.33,.38), `data/map_look_ch1.json` | 맵의 큰 질감과 전투 외곽을 읽히게 함 |
| 지역 환경광 | 북서 (.34,.32,.37), 북동 (.35,.37,.43), 남서 (.33,.37,.38), 남동 (.35,.33,.38) | 지역색을 유지하며 검은 면적 축소 |
| 어두운 영역 감마 | 맵 룩 ON .75 / OFF 1.0, `native_screen_lighting.gd` | 원본 필터의 대비 1.05·밝기 .97은 유지, 맵 룩에서만 그림자 정보 표시 |
| 서쪽 큰 뿌리 | `prop_g_root.png`, 중심 (3420,7310), 1000×960, α .62 | 남서 생체나무와 전투 공터를 연결 |
| 동쪽 지면 | `prop_g_edge.png`, 중심 (4650,7050), 1050×620, α .72 | 오른쪽 외곽을 다른 실루엣으로 받침 |
| 남쪽 생체 바닥 | `flesh_g_0.png`, 중심 (4020,7900), 750×700, α .50 | 시작점 남쪽에서 공터로 피부 바닥이 이어지게 함 |
| 바닥 레이어 | z −2750, 원본 청크 −3000·지면 소품 −2500 사이, UV 바깥쪽 .02~.13 페이드 | 경계 이음새를 흐리고 전투 중앙을 열어 둠 |

격리 실행의 `runtime_gamma075_final/battle_015.png`는 일반 공격, `battle_052.png`는 지옥강타다. 1920×1080 원본 프레임이며 5마리 생존 적, 지옥강타 4히트가 기록됐다. 포스트프로세싱은 없고, 홍보 캡처 실행에서 HUD·펫 자막만 표시하지 않았다. 이미지와 실행 영수증은 `I:/EXODUSER-Storage/steam/gallery_combat_20261026/runtime_gamma075_final/`에 보존한다. 두 컷 모두 같은 카메라 위치이므로 스팀 갤러리에 동시에 넣을 후보로는 부적합하다.

`tests/test_map_look.gd` 격리 회귀 **28 assertions / 0 failures**: 맵 룩 OFF의 원본 감마·라이트맵, ON의 바닥 질량 3개와 z, 충돌 사각형 292개·기존 소품 위치·G 키 집합 불변. Godot stderr의 `SCRIPT ERROR`/`ERROR` 없음. 자연 물리 플레이·8방향 카메라 전체·지속 성능은 아직 검수되지 않았다.

추가 `duel_runtime_gamma075/ice_duel_105.png`에서는 북쪽 (4020,6660)의 기존 눈 몬스터 2개와 얼음보주 파쇄가 보인다. 캡처는 실제 런타임이지만 주변이 여전히 넓은 빈 바닥이므로 스팀 갤러리 후보로는 **RETOUCH**. 8개 카메라 지정 위치 중 START와 EARLY의 일부만 보았고 나머지 6지점·자연 플레이·지속 성능은 미검수다.

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1-1 시작 전투 공터 표시 레이어
MASTER: silhouette=남서 생체나무와 양측 지면 / regions=기존 4지역 / main route=남→북 원본 유지 / side spaces=원본 유지
OUTER MASS: LEFT=큰 뿌리 보강 / RIGHT=지면 보강 / TOP=미수정 / SOUTH=생체 바닥 보강 / major holes=상단 암부·다른 구역 미검수
LARGE: source assets=기존 root/edge/flesh 3종 / composites=표시 레이어 3 / overlap=중앙 전투 공간 비움 / repeated silhouette=같은 에셋 반복 없음
MEDIUM: connections=서쪽 나무→공터, 남쪽 바닥→공터 / remaining holes=상단 외곽
GROUND: shadow=기존 그림자 유지 / contamination=뿌리·살점 3패치 / structure integration=z −2750·가장자리 페이드
PLAYABLE: main arenas=기존 시작 공터 / travel space=기존 동선 / breathing space=중앙 개방 / threat space=인트로 적 5 / combat readability=지옥강타 4히트 캡처
LANDMARK: primary=남서 생체나무 / secondary=동쪽 지면 / tertiary=남쪽 생체 바닥
CAMERA QA: START=1920×1080 전투 2컷 RETOUCH / EARLY=눈 몬스터 2마리 얼음보주, 빈 바닥으로 RETOUCH / ARENA=미검수 / SIDE L=미검수 / SIDE R=미검수 / LANDMARK=미검수 / LATE=미검수 / EXIT=미검수
TECH QA: route=데이터 불변 / collision=292 불변 / pageerror=해당 없음 / 404=해당 없음 / seam=시작 컷 육안 확인 / loading=격리 실행 성공 / performance=미측정
FILES: stage-owned=map_look_ch1.json,native_map_look.gd,native_screen_lighting.gd,test_map_look.gd,이 문서 / concurrent touched=없음 / unrelated touched=보존
GIT: staged=본 작업 파일만 경로 지정 / commit=본 작업 코드·테스트·문서만 체크포인트 / push=별도 codex 브랜치에 백업 / deploy=없음
VISUAL VERDICT: RETOUCH
NEXT PASS: 남은 6개 카메라 지점의 큰 형태·상단 통로·전투 실측을 확인하고 서로 다른 장면의 스팀 컷을 선정
```
