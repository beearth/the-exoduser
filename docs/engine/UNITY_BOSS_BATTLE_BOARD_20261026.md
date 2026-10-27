# Unity 보스전 이식 보드 — 보스전 총괄 (2026-10-26 신설)

이 문서는 Unity 이식 마스터 보드(`UNITY_PORT_MASTER_20261026.md`)의 보스 관련 행을 쪼갠 하위 보드다. 진행률은 마스터 보드 행 상태(0/1/2/3)로만 말하고, 이 표는 그 행을 채우기 위한 작업 단위 목록이다.

- 담당: PC Claude **"보스전 총괄"** 세션 — 보스전 명세·원본 추적·검수·인수. 구현은 Sonnet 단순작업 세션, 배정은 전체총괄·맥북 총괄과 협의.
- 기준: **웹 보스전 그대로**(`game.html` main). 수치·무브 순서·전조 프레임·Q/E 판정·페이즈를 새로 설계하지 않는다. 보스 모델·모션·VFX·아레나 비주얼만 Unity에서 새로 제작 가능(마스터 보드 F군 원칙).
- 시각 판정: 디자인 총괄. 보스 BGM·보이스·SFX: 사운드총괄 협조. 아레나 맵 비주얼: 맵 총괄 협조.
- 상태 표기는 마스터 보드와 같다: `0 미착수` / `1 일부` / `2 웹동일 소스` / `3 실플레이 인수`.

## M1 우선순위 (2026-10-27, CLAUDE.md §총괄 자율 결정)

- 유니티 이식 최우선은 M1 "1-1 한 판 완주"입니다. 보스전 몫은 C03 1-1(si0) 다크드루이드(웹과 같은 기술 구성)와 C01 1-1 일반 몹입니다. 나머지 보스(si1~)는 M1 뒤로 미룹니다.
- 1-1 일반 몹 범위(웹 `rollEtype` si0 원문, 31055~): `HELL_SPAWN[0]` 중 `_CH1_OPENING_EXCLUDED_ET`(2·22·30·43)를 뺀 etype 0,1,3~21,23~29,47. 원거리·근접 각 50%.
- 진행 순서:
  1. CX-03a(진행 중)
  2. CX-04 `hurtE` 공통
  3. CX-03b DOT·엘리트
  4. CX-03c 공통 상태 머신
  5. CX-06(신설) 1-1 etype별 AI 분기와 `rollEtype`
  6. BX-02 `_bossAI`, BX-03 드루이드 기술, BX-04 보스방 진입, BX-08 사망(STY-D9 웹 반영분 포함)
  7. Simulation 연결 patch(맥북 총괄 창구)

## 1. 마스터 보드 대응 행

| 마스터 행 | 항목 | 현재 상태 | 이 보드 단위 |
|---|---|---|---|
| A23 | 보스 HP·쉴드·포이즈 바 `#bossBar` | 진행 중(표시 UI) | BX-07 — 표시 UI는 맥북 총괄 PC-A20~A24 순서로 Sonnet(local_f344c67e)이 `pc-unity-win`에서 진행 중. 보스전 총괄은 중복 배정하지 않고 보스 연결(트리거)·실보스 인수만 맡는다 |
| C03 | 보스 19종·BOSS_MOVES | 0 | BX-01~BX-06, BX-09, BX-10 |
| C01 | 일반 몬스터 공통 틀 | 1 | CX-01~CX-05 (§5-1) |
| C07 일부 | 보스방 진입·출구·클리어 | 0 | BX-04, BX-08 |
| F01/F02/F04 일부 | 보스 모션·전조 VFX·보스 BGM | 1(공용) | BX-11 |

## 2. 현재 Unity 상태 (2026-10-26 확인)

- `origin/codex/unity-mac-20261024`의 C#에 보스 코드는 없다. `Runtime/Core/Simulation.cs:153`에 "원본 34456은 보스에서만 포이즈를 리셋한다"는 주석 한 줄만 있다.
- 에셋은 웹 사본이 브랜치에 들어 있다: `assets/sprites/boss/boss_dark_druid_*`, `assets/vfx/boss/*`, `assets/3d/boss_01.glb`.
- 선행 의존: B01 이동·충돌(1), B07 포이즈·패링 Q/E(1, 수정금지 문서 1:1), C01 적 공통 틀(1, etype0만), B09 피격 피드백(1).

## 3. 웹 원본 기준점 (game.html, 2026-10-26 main 기준 줄 번호)

| 항목 | 위치 |
|---|---|
| `BOSS_MOVES` (무브 정의: tele/rec/feint/delay/range/phase/combo/tags/cd) | 9820~ |
| `_isNormalDruidBoss` (si0/si3 일반 드루이드 분기) | 16940 |
| `genBossArena(si)` 아레나 생성 | 30699 |
| `_enterBossArena(retry)` 진입·재도전 | 30751 |
| `_bossAI(e,sp,d)` 보스 AI 틱 | 38375 |
| `HELL_BOSSES` (챕터별 보스 배정) | 16690 |
| `_poiseReset(e)` | 20002 |
| `mkEn(x,y,si,etype,ib,el,room)` 보스 생성 공용 | 31122 |
| `#bossBar` DOM (이름·HP·쉴드·포이즈·상태) | 2701 |

줄 번호는 game.html 편집으로 계속 밀린다. 명세 작성 때마다 함수명으로 다시 찾아 확인한다.

## 4. 재사용 가능한 선행 자료 (Godot 시기)

Godot 이식은 중단됐지만 **웹 원본 추적 결과는 엔진과 무관하게 재사용**한다. 단, 줄 번호는 2026-10-20~22 기준이라 재확인이 필요하다.

| 자료 | 내용 | 재사용 |
|---|---|---|
| `docs/engine/FDG_SOURCE_TRACE_BOSS_CH1_20261020.md` | 1장 4슬롯(si0 드루이드 23기술 / si1 독버섯 거인 21 / si2 지옥기형 10 / si3 드루이드 23), HP·ATK 공식, 상태 필드, 틱 순서, 페이즈, 24개 기술 start→state→종료, 사망·클리어 | BX-01~05 명세의 1차 근거 |
| `docs/engine/FDG_SOURCE_TRACE_BOSS_CH3/CH4_20261020.md` | 3·4장 보스 추적 | BX-10 |
| `docs/engine/FDG_SOURCE_TRACE_FIELDBOSS_20261020.md` | 필드보스 4종 수명·패턴·보상 | BX-09 |
| `origin/claude/pc-boss-core-20261022` | 보스 AI 틱 owner·hurtE 보스 분기·사망 판정 + **원본 oracle**(Node VM 실행 대조) | oracle 방식·추출 범위 재사용 (GDScript 코드는 미사용) |
| `origin/claude/pc-boss-parity-20261022` | B-01 보스방 추적, B-02 몸통 충돌(원본 34349)·진입 시 소환굴 비움 | 함정 목록으로 재사용 |
| `origin/codex/boss11-0x`, `parity-boss-0x` | 전조 가독성·아레나 카메라 RETOUCH 기록 | BX-06·BX-11 시각 기준 참고 |

주의: 위 추적 문서 §0.2 — `_DEMO_LAST_STAGE=0`과 `_isDruidFinale`의 `G.stage===3` 조건이 동시에 참일 수 없어 **현재 원본 일반 실행에서 si3 피날레는 도달 불가**다. 피날레(BX-08)는 원본 도달성 재확인 후 진행한다.

## 5. 작업 단위

순서는 **1-1 다크드루이드(si0) 한 마리를 끝까지 웹과 같게** 만든 뒤 넓힌다. 데모·Steam 첫 보스이기 때문이다.

| ID | 단위 | 웹 원본 | 선행 | 상태 | 담당 | 완료 조건 |
|---|---|---|---|---|---|---|
| BX-01 | 보스 생성·HP/ATK/쉴드/부활력 공식·초기 상태 필드 | mkEn ib 분기, HELL_BOSSES | C01 틀 | 2 웹동일 소스(CX-02 mkEn ib 분기 9d11d4325, Unity 드루이드 생성 SpawnDruid d1638a472) | d05·d01 | oracle 대조 일치(레벨·난이도 표본) |
| BX-02 | `_bossAI` 틱 순서·Utility 점수·콤보·쿨다운·HP 페이즈 전환 | `_bossAI`, BOSS_MOVES | BX-01 | 2 웹동일 소스(si0만, 조건부 — oracle 입력 커밋본 전환·오브 좌표 float 오차) | d01 d1638a472(druid-boss-oracle 48케이스 0, 보스전 총괄 200케이스 재검사 2,262건 불일치=c141 오브 좌표 float 오차 ~1.3e-3), 표현 6908358f3 RETOUCH | 같은 RNG 시드로 무브 선택열 일치 |
| BX-03 | 1-1 드루이드 기술 23종 실행기(전조→판정→회복) | BOSS_MOVES + 드루이드 전용 | BX-02, B07 | 2 웹동일 소스(si0만, 조건부 — oracle 입력 커밋본 전환·오브 좌표 float 오차) | d01 d1638a472(druid-boss-oracle 48케이스 0, 보스전 총괄 200케이스 재검사 2,262건 불일치=c141 오브 좌표 float 오차 ~1.3e-3), 표현 6908358f3 RETOUCH | 기술별 투사체·장판 생성 인자 oracle 일치 |
| BX-04 | 보스 아레나 생성·진입·출구·재도전 | `genBossArena`, `_enterBossArena` | C04 | 1 연결됨(C07 03721c49d genBossArena 이식, d01) — 아레나 바닥 웹 흙 타일 반영(a8a94de29), oracle 미확인 | d01 | 타일·스폰·진입 좌표 일치, 맵 총괄 비주얼 협의 |
| BX-05 | 보스 피격·포이즈 리셋·패링 상호작용·사망 판정 | hurtE 보스 분기, `_poiseReset` | B07, B09 | 2 웹동일 소스(si0만, 조건부 — oracle 입력 커밋본 전환·오브 좌표 float 오차) | d01 d1638a472(druid-boss-oracle 48케이스 0, 보스전 총괄 200케이스 재검사 2,262건 불일치=c141 오브 좌표 float 오차 ~1.3e-3), 표현 6908358f3 RETOUCH | 포이즈·스턴 프레임 oracle 일치 |
| BX-06 | 전조 표시·보스 카메라 | tele 프레임, 아레나 카메라 | BX-03 | 0 | 미배정 | 웹 나란히 캡처 + 디자인 총괄 판정 |
| BX-07 | 보스 바 HUD (A23) | `#bossBar` | BX-01 | 진행 중 | Sonnet(맥북 총괄 배정) | 표시 UI: 웹 나란히 캡처 1x 일치(2026-10-26 `_out/pc-a23/cmp` 1차 확인 — 칩 간격만 미세 차이). 보스 연결: 실보스 HP·포이즈 변화에 따라 갱신 |
| BX-08 | 보스 사망·클리어·보상·피날레(도달성 재확인) | 클리어 흐름, 피날레 v0.4 | BX-05 | 1 B08 경로로 동작(M1 12단계 침강·출구 ok) — 정본 DeathHead(CX-04c1)로 합치기는 M1 뒤 | d01(연결)·보스전 총괄(판정) | 클리어 흐름 일치 |
| BX-09 | 필드보스 4종 | FIELDBOSS 추적 | BX-02 | 0 | 미배정 | |
| BX-10 | 나머지 보스(1장 si1·si2 → 2~7장) | CH1/3/4 추적 | BX-03 | 0 | 미배정 | 보스별 oracle + 실플레이 |
| BX-11 | 보스 표현(모델·모션·VFX·BGM) | 웹 에셋 → Unity 신규 가능 | BX-03 | 1 | 디자인·사운드 협조 | 디자인 총괄 PASS. 드루이드 원화 PASS. 표현 RETOUCH는 사용자 방침(보스전·맵은 이식 단계에서 대충, 아트는 UI 이식 뒤 Unity 리메이크·아트 바이블 v2)으로 10-27 디자인총괄이 철회. d01 처리분: 아레나 흙 타일 a8a94de29·줌 0.80·림 헤어라인 df43aa110 |
| BX-12 | 보스 3D 외형(사용자 희망 10-27: No Rest for the Wicked 수준 모델·동작). 행동·수치는 웹 그대로, 외형만 끌어올림(맵과 같은 원칙). M1 뒤에 착수 | — | BX-03 | 0 | 미배정 | 시각 판정은 디자인총괄. 유료 크레딧 지출은 사용자 확인 필요 |

- BX-08 의존: si0 다크드루이드 침강 도주(STY-D9, 사용자 확정 10-27, 연출만) — 웹 game.html 반영 뒤 웹과 같게 옮김. Unity 선행 금지. 근거 `docs/11내러티브·로어디자인/CH1_STORY_SPINE_20261027.md` §3.1. 웹 반영 fb4c929aa → 원격 반영 fce195067(main) — 스토리총괄 검수 PASS c0463b47c·디자인총괄 PASS(재생 66/18/18틱 확정), BX-08 기준

## 5-1. C01 적 공통 틀 (2026-10-26 전체총괄 제안으로 보스전 총괄이 계획)

보스는 일반 적과 같은 `mkEn`·`updateE`·`hurtE`를 지나간다. 그래서 C01 공통 틀이 BX 단위의 바닥이다. 범위는 **일반 적 100종이 올라탈 공통 틀까지**다. 개별 적 패턴 이식은 그다음 단위로 나눈다.

| ID | 단위 | 웹 원본 (2026-10-26 줄 번호) | 상태 | 완료 조건 |
|---|---|---|---|---|
| CX-01 | 적 수치 테이블 `ETYPE_HP/ATK/_ETYPE_SPD_RAW→ETYPE_SPD/R/RANGE/POISE/SHIELD/COL`(0~89), `ETYPE_ERES`, `ETYPE_COLS`, `RARE_ETYPE`(90~99), `ELITE_TIERS/ELITE_PROB/MOD_DEFS`, `DIFF_MUL/DIFF_LV_OFF`, `SI_TO_HELL/STG` | 30825~30911, 14336, 19916, 30957, 31035~31064, 9272/9276, 16660/16699 | 2 웹동일 소스(데이터·oracle 2,784/0, 연결 전) | 표 전 항목 C# 데이터 바이트 단위 일치. 브랜치 claude/unity-pc-c01-20261026 80ea201b4(StageDef→EnemyStageDef 개명 포함), 보고서 UNITY_CX01_ENEMY_TABLES_20261026. unity/main 병합 ab563f98c(10-27, PC 병합·병합 뒤 oracle 2,784/0·204,592/0·빌드 오류 0) |
| CX-02 | `mkEn` 전체 (좌표 보정·monLv·스테이지 배율·엘리트 `rollElite`/`rollMods`·보스 `ib` 분기) — BX-01 포함 | 31122~31365 | 2 웹동일 소스(mkEn 전체·oracle 538케이스 204,592/0·변이 22/23, 연결 전) | 레벨·난이도·si·etype·ib 표본 oracle 일치. 브랜치 claude/unity-pc-c01-20261026 9d11d4325, 보고서 UNITY_CX02_ENEMY_SPAWN_20261026. unity/main 병합 ab563f98c(10-27, PC 병합·병합 뒤 oracle 2,784/0·204,592/0·빌드 오류 0) |
| CX-03a | 적 루프 앞처리(티어링·컬링·벽 끼임·타이머) + `updateE` 앞~DOT 직전 | 34415~34494, 38587~38721 | 2 웹동일 소스(L1+U1, oracle 1,240케이스 3,246,746/0·변이 86/87, 연결 전) | tick 상태 oracle 일치. 브랜치 claude/unity-pc-c01-20261026 a05ee1467, 보고서 UNITY_CX03A_ENEMY_TICK_HEAD_20261027. 명세 `E:/exoduser-wt/_out/pc-cx03a/SPEC.md` |
| CX-03b | ATK 리셋·DOT 5종·엘리트 모디파이어 틱·오라 ATK·비어그로 대기 게이트 | 약 38722~38888 | 1-1 etype(0~29·47) 범위는 d05 C01-AI aeb998ba2(enemy-ai oracle 474케이스 713,918/0)로 연결됨, 나머지 etype은 M1 뒤 | CX-04·CX-02 의존 |
| CX-03c | etype 분기 뒤 공통 상태 머신(windup→attack·projT·공전 대기 등) | 38586~41410 중 etype 분기 뒤 | 1-1 etype(0~29·47) 범위는 d05 C01-AI aeb998ba2(enemy-ai oracle 474케이스 713,918/0)로 연결됨, 나머지 etype은 M1 뒤 | etype0·보스 경로 tick 상태 oracle 일치 |
| CX-04a | `hurtE` 앞부분(관문·피해 배율·에너지쉴드 흡수) — 함수 첫 줄 ~ `// ═══ 데미지 → HP 직행 ═══` 앞줄 | 42178~42420 | 2 웹동일 소스(H1, oracle 960케이스 933,221/0·변이 135/138, 연결 전) | 피해 표본 oracle 일치, 쉴드 규칙은 CLAUDE.md eShield 계약 그대로. 브랜치 claude/unity-pc-c01-20261026 dfe67be3b, 보고서 UNITY_CX04A_ENEMY_HURT_HEAD_20261027 |
| CX-04b | `hurtE` HP 적용 ~ 포이즈 블록 끝(흡수·onHit·피격 경직·빙결 게이지·넉백·포이즈) | 42421~42567 | 2 웹동일 소스(H2, oracle 746+연결672, 2,437,201/0·변이 131/132, 연결 전) 확정(b4b00507e) | 피해 표본 oracle 일치. 브랜치 claude/unity-pc-c01-20261026 c03388fb1, 보고서 UNITY_CX04B_ENEMY_HURT_BODY_20261027 |
| CX-04c1 | `hurtE` 사망부 앞쪽(디코이·도플갱어·보스 부활·일반몹 부활·On-Kill·STY-D9 침강·콤보·문지기) `if(e.hp<=0){` ~ `// ═══ 지옥의 잔해 드롭 ═══` 앞 — BX-05·BX-08 상태 근거 | 42568~42817 | 2 웹동일 소스(H3a, oracle 1,071+연결414, 4,225,618/0·변이 474/486), 브랜치 6496a5660, 보고서 UNITY_CX04C1_ENEMY_HURT_DEATH_HEAD_20261027, 연결 전 | 명세 `E:/exoduser-wt/_out/pc-cx04c1/SPEC.md`. 비고: BX-05·BX-08 묶음, STY-D9 원격 반영 fce195067 기준 |
| CX-04c2 | `hurtE` 잔해 드롭 ~ 함수 끝(`}finally{_shBufI--}` 포함) + **함수 전체 통합 oracle**(H1→H2→H3, 같은 적 재진입 포함) | 42818~43191 | 0 | M1 뒤 (c1 인수 완료 10-27) |
| CX-05 | 적 표시 공통 (EnemyView 확장: etype별 시트·크기·색) | ETYPE_COL, 19916 `ETYPE_COLS` | 0 | 웹 나란히 캡처 |
| CX-06 | 1-1 일반 몹 etype별 AI 분기(M1 우선순위 절의 etype 목록) + `rollEtype`(si0) | `rollEtype` 31055~, `updateE` etype 분기 | 0 | etype별 tick 상태 oracle 일치 |

- 현재 Unity: `SimulationState.cs`의 `EnemyState`와 `Simulation.cs`의 mkEn 축약(etype0 고정, 그 외 `NotSupportedException`). 둘 다 **Codex 소유 파일**이다.
- 방식: PC 새 파일(`Runtime/Core/` 평면(하위 폴더 금지 — .NET 검사 와일드카드))에 공통 틀을 만들고, Codex 파일 연결은 patch + PC_TO_MAC_INBOX(main·codex 브랜치 두 곳)로 요청한다. Codex가 이의를 내면 그 부분은 멈춘다.
- 크기: `updateE` 약 2,800줄, `hurtE` 약 1,000줄. CX-03·CX-04는 한 번에 넘기지 않고 공통 앞·뒤 처리부터 잘라 명세한다.
- 미확인: CX-02·03a는 `JsMath`(fdlibm 포트)로 `Atan2`/`Cos`/`Sin`을 V8과 비트 일치시킴(.NET Windows 약 2.3만 값 확인). `Math.Pow`는 .NET 그대로 — Mac·IL2CPP 비트 일치는 상태 3 때 실측

## 5-2. H5 백로그 (웹 결함, M1 뒤 CTO가 웹 수정 세션에 배정)

Unity 이식 중 찾은 웹 결함. 이식은 웹 그대로 두고, 웹 수정은 M1 범위 밖이다. 웹 행 번호는 2026-10-27 origin/main(6089f2ff2) game.html을 텍스트로 다시 찾은 값이다.

| ID | 내용 | 웹 행(origin/main 기준) | 의도·영향 | 판정·처리 |
|---|---|---|---|---|
| H5-01 | 독웅덩이 테두리가 GPU 프록시에서 속 찬 원판으로 그려짐 | game.html 10886~10888 `_drawDruidPoolClip`(`#a9d76a` α×0.55, `arc(r)` 뒤 `arc(max(0,r-1.2), …, true)` 역방향). 같은 패턴 2곳: 57772(`lp` 장판 `_la*1.8`), 58236(`pp` `_ppF*.55`) | 의도는 1.2px 고리. 프록시가 역방향 감김을 무시해 원판이 웅덩이 그림을 덮음(납작한 네온 면) | 디자인총괄 판정(10-27): 웹 버그, Unity는 1.2px 선 유지. 피해 판정 원 r은 웹과 같은 계약이라 변경 없음 |
| H5-02 | 보스 동반부활 mkEn 인자 자리 오류 | game.html 42788 `mkEn(_sx,_sy,G.stage,0,true,_cet,0)`(시그니처 x,y,si,etype,ib,el,room). 아레나 보스 생성은 30954 `mkEn(…,si,0,true,STG[si].be,0)` | `_cet`(이전 보스 etype)가 el 자리로 감, etype은 늘 0. 아레나 보스가 etype 0이라 `_killedBosses`가 전부 0 → `et!==e.etype` 필터에서 풀이 비어 일반 플레이에서는 도달 불가 | 기획 확인 필요(어느 보스를 되살릴지) — M1 뒤 CTO가 사용자에게 의도 확인. Unity는 웹 그대로(CX-04c1) |

## 6. 작업 방식

- Core 계산은 B군과 같은 방식: 원본 함수 줄 범위 추출 → Node VM oracle → C# 새 파일 대조. Codex 소유 `Simulation.cs`·`NativeGame` 수정은 patch + PC_TO_MAC_INBOX(main·codex 브랜치 두 곳).
- 테스트의 강제 스폰·임의 HP·강제 패턴은 자연 플레이 증거가 아니다. 상태 `3`은 사람이 직접 보스를 잡아 확인했을 때만.
- 구현은 Sonnet 세션 1단위씩, 실패 2회면 중단하고 원인 보고.

## 7. 기록

| 날짜 | 내용 |
|---|---|
| 2026-10-26 | 보드 신설. Unity 보스 코드 0 확인, 선행 자료 정리, 순서 = 1-1 드루이드 우선 |
| 2026-10-26 | 전체총괄 제안으로 C01 적 공통 틀(CX-01~05)도 보스전 총괄이 계획. A23·C03 담당 이관 확인(마스터 보드 반영은 맥북 총괄 docs 커밋) |
| 2026-10-26 | A23 표시 UI는 맥북 총괄 순서로 Sonnet 진행 중임을 확인(중복 배정 안 함, 1차 비교 캡처 확인). CX-01 명세 작성: `E:/exoduser-wt/_out/pc-cx01/SPEC.md` → 맥북 총괄에 Sonnet 배정 요청 |
| 2026-10-26 | CX-01 인수(단순작업2, 8faade542). 웹 몬스터_총관리.md와 코드 차이: RAW_R 13곳·RAW_COL[65] — docs 수정은 별도 |
| 2026-10-27 | STY-D9 회신(웹 가능·si0만·표시만), CX-02 배정 |
| 2026-10-27 | CX-02 인수(9d11d4325), CX-03을 a/b/c로 분할, CX-03a 배정 |
| 2026-10-27 | M1 우선순위 결정·CX-06·BX-12 신설 |
| 2026-10-27 | CX-01·CX-02 unity/main 병합 ab563f98c(PC 병합·병합 뒤 oracle 2,784/0·204,592/0·빌드 오류 0) |
| 2026-10-27 | CX-03a 인수(a05ee1467), JsMath 도입, CX-04 명세 작성 중 |
| 2026-10-27 | CX-04를 a/b/c로 분할, CX-04a 배정, STY-D9 웹 반영(fb4c929aa) 접수 |
| 2026-10-27 | CX-04a 인수(dfe67be3b), CX-04b 배정, pure 주석 낡음 판정(동작은 계약대로) |
| 2026-10-27 | CX-04b 조건부 인수(c03388fb1, NaN 비교 규칙 보완 조건), CX-04c를 c1/c2로 분할, c1 배정 |
| 2026-10-27 | CX-04c1 인수, CX-04b 확정, M1 재배분(BX-02/03/05=d01, C01 연결·AI=d05), CX-04c2는 M1 뒤 |
| 2026-10-27 | 드루이드 표현 RETOUCH 철회(사용자 방침), druid-boss-oracle 기본 소스 커밋본 전환 |
| 2026-10-27 | RM-B1 드루이드 리모델링 명세 — 착수(claude/unity-pc-rmb1-20261027). 명세 main 091ea32b9, RB1-1·2 Core 구현 cb150716c(플래그 기본 꺼짐, 끈 상태 oracle 5,421,635/0, m1-check 17 ok), 판정 대기. 명세 §8 구현 기록 |
| 2026-10-27 | RM-B1 RB1-1·2 PASS(46abcde7c, 조건부 PASS 뒤 심장 박동 쿨 수정 확인): 수정 커밋 46abcde7c(브랜치 claude/unity-pc-rmb1-20261027), P3 박동 A·B 각 2회 확인, 끈 상태 oracle 5,421,635/0. 이길 수 있는가는 RB1-4·5에서 판정. 명세 §8.6 |
