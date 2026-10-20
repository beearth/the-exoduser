# P2-001k — 패링 레슨 패널 디자인 마감 + 연습 본문(-3/-2/-1) (2026-10-20)

## 1. 패널 디자인 — 원본 추적·실측
착수 전 docs/3.1 UI_FOUNDATION_20260924.md(parryLesson 절)·UI_COMPOSITION_20260925.md
확인, 웹 getComputedStyle 실측(`_out/p2-001k/web/lesson_styles.json` — ui-refinement 등
뒤쪽 재정의 포함 최종값):

| 요소 | 실측(웹) | Godot |
|---|---|---|
| 패널 | x1464·w400·top16(우여백 56), 패딩 68/24/20, 폰트 'Nanum Myeongjo' serif 15px | 동일 지오메트리·패딩, NotoSerifKR 대체(나눔명조/Cinzel 에셋 미보유 — 잔여) |
| ::before | rgba(16,13,14,.96) + 상단 radial rgba(71,23,18,.53)→48% + border-image frame.png(18px) | ColorRect+GradientTexture2D radial+NinePatch(frame.png 원본 복사, 22%≈276px 슬라이스를 18px 보더로 쓰기 위해 런타임 82px 축소 — 에셋 파일 불변) |
| 문장 | crest.png 174×58 top6 중앙 | 동일(EXPAND_IGNORE_SIZE) |
| 배경막 | #parryLessonBackdrop opacity .5 | ColorRect 흑 0.5 |
| 키캡 | Cinzel 28px #fff0df, 선 #e0c18b, grad(51,44,44)→(16,14,16), r4, 0 8px 패딩 h62 | 동일 수치(그라디언트는 중간값 단색 — 근사 기록) |
| 제목/부제/본문 | 29px 700 #f4e6d2 ls.87 / 12px #c2b6a9 / 14px #e8d9c6 lh1.7 | 동일 |
| 목표 행 | 14px, 현재 #fff0df·bg #551819aa·선 #a34d3f·왼쪽 2px #ec7958, 완료 #b2d6ac, 체크박스 | 동일(왼쪽 강조색은 StyleBoxFlat 1색 제약으로 #a34d3f 통일 — 근사 기록), 완료 박스 녹색 채움 |
| 버튼 | 시작 min44 grad(88,22,17)→(36,8,9)·선 #b6614b·#fff0df 700 / 스킵 min36 #1d1413·선 #665044·#dccbb6 | 동일 수치(그라디언트 중간값) |
| 진행바 | h2 #42322d / 채움 #e0c18b, margin-top12 | 동일 |
| 구조 | eyebrow+status → 키캡 → 제목 → 부제 → **현재 행 → 상세(hint/hold)** → 나머지 체크리스트(12행, label(119): step<2는 "Q/E · " 접두) → 안전문구 → 본문 스크롤·하단 버튼 고정 | 동일(placeDetails 170~174 상응 재배치, ScrollContainer+고정 버튼) |

## 2. 연습 본문 — 원본 추적
| 단계 | 행 | 원문 | Godot |
|---|---|---|---|
| 진입 | 177/37 | beginPractice(버튼·WASD) | 동일(버튼·_unhandled_input) |
| -3 이동 | 512~515 | directionHeld 중 이동거리 ≥120 → completeStep | velocity 증인으로 이동거리 합산(동일 식) |
| 적 스폰 | 231~247 | 반경 120/220·동시 3·각 -π/2+(j%3-1)·.65+⌊j/3⌋·π/4·d>450/서로<40 거부·mkEn(etype0,EL.P) 후 hp1·atk0·spd0 등 덮어쓰기(롤은 소비) | 동일(mkEn 미러 draw 순서 — 커튼 5링과 동일·journal 기록) |
| 처치 위임 | **42111** | `if(_parryLesson?.active){_parryLesson.hurtEnemy(e,dmg,ang,opts);return;}` | hurte owner 42111 게이트를 실제 위임으로 — provider(parry_lesson_active)가 holder의 현재 lesson 참조를 동봉, hurtE 본문 판정은 비실행(원본 동일). **레슨 비활성 경로는 무변경(Q/E·2_3 불변)** |
| hurtEnemy | 646~683 | left(651: kiSlash/weapon)·right(652: magic+fireball, 터렛/도트 제외)만 크레딧, e.hp=0·deathFX·시체·flesh 고어·DI, 10/풀차지·5 달성 시 completeStep, 아니면 재스폰 | 동일 슬라이스(left/right). rage/reflected/trap 분기는 해당 스텝 미이식 — no-credit 반환(원본 657 동일) |
| 사망 연출 | 664~668 | deathFX 코어+_addCorpse+_addGorePiece('flesh')+_addDeathImpact — 대형 버스트·provider 고어 롤 없음 | adapter `spawn_native_lesson_kill_fx` 신설(동일 구성) |
| 풀차지 | 19837 | `_lessonFullCharge: c.step===3&&c.chargeScale>=2.2` | 포트 crescent가 이미 동일 opts 전달 — 그대로 소비 |
| 유지 | 508~509 | 연습 중 HP/MP/ST 리필·iframes 0 | state p + player 반영 |
| 순서 | 501 | -3→-2→-1→**8(가시덫)**→0..7, 전환 90틱 | P2-001l 후속: step 8 실제 가시덫 10처치+120px 탈출→0 실제 Q 반사 처치→1 정직 정지. 1~7·챕터2는 미이식. [현행 문서](FDG_P2_001L_LESSON_STEPS_ALLOWS_20261020.md) |
| 종료 | 685~700 | ens/HP/좌표/스냅샷 복원 | 적·bonfire·LMB·HP·좌표 복원(+레슨 전용 적 정리) |
| dismissed | 16~22 | localStorage skipKey | 포트 설정 저장 owner 부재 — 세션 seen만(잔여) |
| allows | 30~34 | 단계별 입력 제한 | API 제공(allows/_actions). **입력 강제 배선은 보류** — 시작 스킬 트랙(플레이어 입력)과 충돌 회피, 보고 명시 |

## 3. 변경
- `native_parry_lesson_flow.gd` 전면 개정(위 표), `native_death_fx_adapter.gd`
  +spawn_native_lesson_kill_fx(+DI helper 공용화), `native_normal_enemy_hurte.gd`
  42111 위임(활성+참조 있을 때만 — 없으면 종전 halt 유지), services provider에
  lesson_reference 동봉, 시퀀스가 레슨 owner를 holder에 publish_current
  ("native_main_binding" origin — ORIGINS 화이트리스트), assets/ui/hell_gothic
  frame.png·crest.png 원본 복사.
- main.gd·hud.gd·player.gd **무변경**(입력 경로 비접촉 — 충돌면 없음).

## 4. 검증 (원로그 G:\exoduser-wt\_out\p2-001k\)
- 신규 `test_p2001k_lesson_practice` **32/0**: 패널 계약 스팟(지오메트리·frame 9슬라이스
  18px·crest 174×58·bg .96·backdrop .5·title 29/#f4e6d2·키캡 28·12행·버튼 텍스트/min44) +
  연습(-3 이동 120 → -2 스폰 3·mkEn draw 순서·**실 hurtE 42111 위임**(outcome
  lesson_delegated)·10처치+풀차지 → -1 비마법 크레딧 거부·마법 5 → step 8 정직 정지·
  가짜 진행 없음 → 스킵 복원: 5링 복귀·레슨 적 정리).
- 회귀 전체: p2001j 21/0 · p2001i 18/0 · p2001h 124/0 · update_clock 30/0 ·
  source_lesson 30/0 · intro_curtain 2종 PASS · p1002e 93/0 · p1002f 243/0 ·
  p1002g 168/0 · p2001a 31/0 · p2001b 37/0 · p2001c 39/0 · p2002a 36/0 · p2002b 16/0 ·
  contracts 5/0 · factory 3=기준선 · etype0 1=기준선 · initialization 2=선재.
- 화면: `cmp_p2k_lesson_panel_1x.png` — 웹/Godot 같은 단계(intro/-3 이동/-2 기검참)
  1x 패널 크롭 3쌍. 판정: 구성·순서·색·강조행·체크박스·버튼·크레스트/프레임까지 같은
  게임으로 읽힘, 1x 가독 양호. 잔여 차이: 폰트(나눔명조·Cinzel 대체), 행 간격 소폭,
  그라디언트 단색 근사.

## 5. 잔여 (목록)
1. practice step 8(가시덫)·0~7(패링/Q·E 홀딩/사슬/대시/분노)·챕터2 자원 연습 — 해당
   시스템 이식 후(가시덫=시작 스킬 트랙).
2. allows 입력 강제 배선(시작 스킬 트랙과 조율 필요 — API는 준비됨).
3. dismissed 저장(localStorage 상응 설정 저장 owner 부재).
4. 폰트 에셋(Nanum Myeongjo·Cinzel)·버튼/키캡 그라디언트·현재행 왼쪽 강조색(#ec7958)
   — 근사 기록.
5. start/finish의 projs/worldItems/스킬·슬롯·BINDS2 저장·복원(포트 미보유 상태).

## 6. 총괄 검수 반영 (2026-10-20 2차) — 요소별 차이표
지적 3건 수정: ①굵기 — NotoSerifKR-VF에 FontVariation(wght)으로 실측 font-weight 적용
(제목 700·버튼 700·본문/행/부제 400) ②우상단 상태 라벨 — autowrap 해제·원본 텍스트
(일시정지/연습 중/성공/COMPLETE)·kind 색(127 data-kind: step%2==0 매직=보라 #c5a4f2
실측 step-2 / 피지컬=노랑 #e0c18b) ③행 순서 — 원본 DOM(110~111: checklist 전 행 유지 +
details(hint·hold·meter)가 placeDetails(174)로 현재 행 뒤 삽입) 그대로 재구현 → 완료
행이 현재 행 위에 유지. 추가: 보라 홀드 문구+8px 미터(실측 h8·accent=kind색,
charge/120 채움=253 holdMeter.value).

| 요소 | 차이 | 비고 |
|---|---|---|
| 패널 지오메트리/패딩/배경/프레임/크레스트/배경막 | 없음 | 실측 일치 |
| 키캡 위치(우측 정렬)·연습 중 kind 테두리/26px | 없음 | 3차 정정 — 실측 rect right=콘텐츠 우변(1826)·step2 실측 테두리 #c5a4f2·26px (2차까지 좌측이었던 오기 정정) |
| 홀드 미터 트랙(차지 0에서도 표시) | 없음 | 트랙 상시 표시(8px) — 트랙 색만 근사(아래) |
| 제목/부제/본문/행/버튼/진행바 색·크기·굵기 | 없음 | FontVariation wght 적용 |
| 상태 라벨(우상단) 텍스트·kind 색 | 없음 | 실측 #c5a4f2/#e0c18b |
| 행 순서(완료→현재→상세→잔여)·체크박스 | 없음 | placeDetails 재현 |
| 홀드 문구·미터(보라/8px/채움) | 없음 | 실측 반영 |
| 키캡 굵기 | 남음(근사) | 실측 400이나 원본 Cinzel의 시각 무게 — 대체 글꼴(NotoSerifKR)에서 wght700으로 시각 등가 보정 |
| 글꼴 패밀리 | 남음(에셋) | Nanum Myeongjo·Cinzel 에셋 미보유 — NotoSerifKR-VF 대체 |
| 버튼/키캡 그라디언트 | 남음(근사) | linear-gradient를 중간값 단색으로(StyleBoxFlat) |
| 현재 행 왼쪽 강조색 | 남음(근사) | #ec7958 왼쪽 2px — StyleBoxFlat 단색 제약으로 #a34d3f 통일 |
| 행 간격 | 남음(소폭) | 웹 행높이 38px 대비 수 px 차 — 폰트 메트릭 차이 |
| 홀드 미터 트랙 색 | 남음(근사) | <progress> 기본 트랙(의사요소 — 실측 불가) → 패널 진행바 바닥색 #39312a 채택 |
