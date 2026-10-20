# P2-002B — 좌상 미니맵 + hudCorner 화폐 (2026-10-20)

## 원본 추적
| 항목 | 원본 행 | 구현 |
|---|---|---|
| 컨테이너 | #mmWrap 2585(캔버스 #mm 130×130 + img/mm_frame.png 166×166), CSS 382~386(top8/left8·scale .85·#mm top18/left18), 952(.on opacity .94 — 최신 재정의), 953(frame drop-shadow·brightness — 근사 생략 기록) | hud.gd NativeMinimap(8,8)·scale .85·modulate .94, MinimapCanvas(18,18) 130², 프레임=원본 PNG 복사 |
| 타일 캐시 | drawMM 60177~60207 + _mmTickBuild 60082~60101: sc=min((130−8)/mw,mh)=0.61, 1=벽 스킵(투명), 2=#887766, 4=#443355, 그 외 #665544; 분산 빌드(카메라 100² 우선·10행/프레임) | world.map_data(공개 var — world.gd 무수정, 읽기만) 200×200 타일 → Image 122² 1회 빌드(ImageTexture 오프스크린 캐시). 분산 빌드는 고정 맵 1회 빌드로 근사(기록) |
| 프레임 렌더 | 60195~60196 바닥 rgba(0,0,0,.45)+캐시, 60180 20프레임 주기 | world.get_native_frame() 기준 20프레임 주기 queue_redraw |
| 플레이어 마커 | _mmDrawPlayerMarker 60142~60166: 14px 원형 초상(img/ui/minimap_warrior.png)+방향 삼각형(흰 채움·검 테두리, R+5.5/±3.4)+흑(2px·R+0.5)/백(1px·R−0.5) 이중 링 | 동일 geometry — 초상 원본 PNG 복사, facing 벡터 각도 |
| 소환굴/적 | 60216~60222(SPAWN_HOLE.col #aa4444·α.85·r=1.5+size·1.5), 60224~60233(적 2×2 ELC[el]·30프레임 갱신·60캡), ELC 14338 | 동일 — G.spawnHoles(state G, 신규 []), 적=world.get_enemies()+data.element_id |
| hudCorner | 2666~2669 + CSS 327~329(top178/left16·'Cinzel' 폴백·.62rem≈10px·opacity .48·색 rgba(196,187,168,.72)), 값 60325: `✦ P.sp( +P.ap)` / `◇ calcCP().total`(≥1e5 compact 60237·그 외 en-US 콤마) | NativeHudCorner(16,178)·modulate .48. **✦ U+2726·◇ U+25C7 = 원본 텍스트 글리프(이모지 아님)** — Noto Serif KR 폴백에서 정상 렌더 확인(zoom_corner.png) |
| calcCP | 49487~49509 전문(statStr=1 27993·pDefAdd=_altDef×30 28019·장비 19필드·elements dmg×.8) | `_native_calc_cp` 1:1 포트 — 입력은 전부 state owner getter(p/stats/passives/inventory). 테스트에서 독립 재계산과 정수 일치 |

## 경계 (미이식 — 목록)
지역 시스템(G._regions: 클리어 틴트·앵글러/필드보스 색점·자물쇠 — 웹 좌상 색점 6개가 이것) /
출구 ▲(!G.bossAlive 조건, 신규 true라 원본도 비노출) / 분산 빌드(1회 빌드 근사) /
맵 오브젝트 마커(bonfire·trap·altar — 1장 map.json props에 없음) / frame 필터(953) /
spCnt 클릭(J 능력치 패널) / **나눔명조 1순위 글꼴**(웹폰트 Google Fonts — 저장소에 파일 없음,
Noto Serif KR 유지. 교체는 사용자 승인 필요 — 목록만) / ui-scale(1.0 고정).

## 검증 (원로그 G:\exoduser-wt\_out\p2-002b\logs\)
- test_p2002b_minimap_corner **15/0 PASS**: ① 캐시 생성·sc=(130−8)/200·원점 pad4·초상 로드·
  적 버퍼 1~60·wrap/캔버스/프레임 geometry·spCnt "✦ 0"·cpHud=calcCP 독립 재계산 일치·콤마 경로
  ② owner addExp 20→lv2: "✦ 3 +1"·CP 재계산 갱신.
- 회귀 전부 기준선: p1002e/f/g·p2001a/b/c/e·p2002a·contracts PASS, 초기화 117/2·시작상태 145/2·
  재생 88/0·레슨 30/0.
- 화면: cmp_topleft_1x.png(좌 웹·우 Godot 1x) — 프레임 에셋·맵 실루엣(동일 1장 맵 나비형)·
  플레이어 원형 마커 일치, zoom_corner.png — ✦/◇ 글리프 정상. cmp_full_web_vs_godot.png 전체 구도.

## 보강 (총괄 검수 지적 — 웹 런타임 실측 반영)
- **hudCorner 판정 정정**: CSS 327~329는 기본값일 뿐, 실제 화면은 **ui-refinement.css
  1319~1322 재정의**가 결정 — 웹 getComputedStyle 실측(web_hud_measure.json):
  rect(16,188) 108×58.3 / bg 115deg rgba(21,19,18,.9)→rgba(13,15,17,.84) /
  border-top 1px rgba(178,140,86,.4)·border-left 2px rgba(184,141,81,.64) /
  padding 7 10 8 / **opacity .94**(기존 .48은 game.html 328의 구값) /
  글자 rgba(238,222,194,.93)·11.2px·min-width 86 / 행 구분선 1px rgba(164,127,82,.2)+pad-top4.
  → 흑철 패널+금빛 상단/좌측선+구분선+뼈색 글자로 재구현, 1x 가독 확보(cmp_topleft_1x_v2.png).
  box-shadow·inset 하이라이트는 근사 생략 기록.
- **미니맵 색점 분류(웹 실측)**: ① 소환굴 14개(G.spawnHoles, #aa4444 r1.95~3.6 — 화면 점 다수)
  ② 필드보스 사이트 4개(_FB_SITES, ELC색 r3: 파랑/주황/보라/노랑 — G._regions 시스템)
  ③ 적 5개(2×2, ELC[e.el] — 이 실행 웹 e.el=0 회백) ④ 플레이어.
  Godot: 적 점은 동일 규칙으로 **그려짐**(1x 확대 zoom_godot_mm.png — 포트 적 element_id=3이라
  보라: 색 규칙 동일·encounter 데이터 차, 소유=wt-p2g). 소환굴은 마커 구현됐으나 포트
  스포너가 G.spawnHoles를 기록하지 않아 비노출(world 소유 — 경계). FB 4점=지역 시스템 미이식(경계).
- 테스트 16/0으로 갱신(패널 geometry 단정 추가), p2002a·contracts 재PASS.

