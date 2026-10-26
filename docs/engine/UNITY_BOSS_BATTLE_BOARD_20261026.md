# Unity 보스전 이식 보드 — 보스전 총괄 (2026-10-26 신설)

이 문서는 Unity 이식 마스터 보드(`UNITY_PORT_MASTER_20261026.md`)의 보스 관련 행을 쪼갠 하위 보드다. 진행률은 마스터 보드 행 상태(0/1/2/3)로만 말하고, 이 표는 그 행을 채우기 위한 작업 단위 목록이다.

- 담당: PC Claude **"보스전 총괄"** 세션 — 보스전 명세·원본 추적·검수·인수. 구현은 Sonnet 단순작업 세션, 배정은 전체총괄·맥북 총괄과 협의.
- 기준: **웹 보스전 그대로**(`game.html` main). 수치·무브 순서·전조 프레임·Q/E 판정·페이즈를 새로 설계하지 않는다. 보스 모델·모션·VFX·아레나 비주얼만 Unity에서 새로 제작 가능(마스터 보드 F군 원칙).
- 시각 판정: 디자인 총괄. 보스 BGM·보이스·SFX: 사운드총괄 협조. 아레나 맵 비주얼: 맵 총괄 협조.
- 상태 표기는 마스터 보드와 같다: `0 미착수` / `1 일부` / `2 웹동일 소스` / `3 실플레이 인수`.

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
| BX-01 | 보스 생성·HP/ATK/쉴드/부활력 공식·초기 상태 필드 | mkEn ib 분기, HELL_BOSSES | C01 틀 | 0 | 미배정 | oracle 대조 일치(레벨·난이도 표본) |
| BX-02 | `_bossAI` 틱 순서·Utility 점수·콤보·쿨다운·HP 페이즈 전환 | `_bossAI`, BOSS_MOVES | BX-01 | 0 | 미배정 | 같은 RNG 시드로 무브 선택열 일치 |
| BX-03 | 1-1 드루이드 기술 23종 실행기(전조→판정→회복) | BOSS_MOVES + 드루이드 전용 | BX-02, B07 | 0 | 미배정 | 기술별 투사체·장판 생성 인자 oracle 일치 |
| BX-04 | 보스 아레나 생성·진입·출구·재도전 | `genBossArena`, `_enterBossArena` | C04 | 0 | 미배정 | 타일·스폰·진입 좌표 일치, 맵 총괄 비주얼 협의 |
| BX-05 | 보스 피격·포이즈 리셋·패링 상호작용·사망 판정 | hurtE 보스 분기, `_poiseReset` | B07, B09 | 0 | 미배정 | 포이즈·스턴 프레임 oracle 일치 |
| BX-06 | 전조 표시·보스 카메라 | tele 프레임, 아레나 카메라 | BX-03 | 0 | 미배정 | 웹 나란히 캡처 + 디자인 총괄 판정 |
| BX-07 | 보스 바 HUD (A23) | `#bossBar` | BX-01 | 진행 중 | Sonnet(맥북 총괄 배정) | 표시 UI: 웹 나란히 캡처 1x 일치(2026-10-26 `_out/pc-a23/cmp` 1차 확인 — 칩 간격만 미세 차이). 보스 연결: 실보스 HP·포이즈 변화에 따라 갱신 |
| BX-08 | 보스 사망·클리어·보상·피날레(도달성 재확인) | 클리어 흐름, 피날레 v0.4 | BX-05 | 0 | 미배정 | 클리어 흐름 일치 |
| BX-09 | 필드보스 4종 | FIELDBOSS 추적 | BX-02 | 0 | 미배정 | |
| BX-10 | 나머지 보스(1장 si1·si2 → 2~7장) | CH1/3/4 추적 | BX-03 | 0 | 미배정 | 보스별 oracle + 실플레이 |
| BX-11 | 보스 표현(모델·모션·VFX·BGM) | 웹 에셋 → Unity 신규 가능 | BX-03 | 1 | 디자인·사운드 협조 | 디자인 총괄 PASS |

## 5-1. C01 적 공통 틀 (2026-10-26 전체총괄 제안으로 보스전 총괄이 계획)

보스는 일반 적과 같은 `mkEn`·`updateE`·`hurtE`를 지나간다. 그래서 C01 공통 틀이 BX 단위의 바닥이다. 범위는 **일반 적 100종이 올라탈 공통 틀까지**다. 개별 적 패턴 이식은 그다음 단위로 나눈다.

| ID | 단위 | 웹 원본 (2026-10-26 줄 번호) | 상태 | 완료 조건 |
|---|---|---|---|---|
| CX-01 | 적 수치 테이블 `ETYPE_HP/ATK/_ETYPE_SPD_RAW→ETYPE_SPD/R/RANGE/POISE/SHIELD/COL`(0~89), `ETYPE_ERES`, `ETYPE_COLS`, `RARE_ETYPE`(90~99), `ELITE_TIERS/ELITE_PROB/MOD_DEFS`, `DIFF_MUL/DIFF_LV_OFF`, `SI_TO_HELL/STG` | 30825~30911, 14336, 19916, 30957, 31035~31064, 9272/9276, 16660/16699 | 0 | 표 전 항목 C# 데이터 바이트 단위 일치 |
| CX-02 | `mkEn` 전체 (좌표 보정·monLv·스테이지 배율·엘리트 `rollElite`/`rollMods`·보스 `ib` 분기) — BX-01 포함 | 31122~31365 | 0 | 레벨·난이도·si·etype·ib 표본 oracle 일치 |
| CX-03 | `updateE` 공통 앞·뒤 처리와 etype별 분기 지점(분기 안 패턴은 비움) | 38586~41410 | 0 | etype0·보스 경로 tick 상태 oracle 일치 |
| CX-04 | `hurtE` 공통 (DR·쉴드→HP 분배·포이즈·넉백·사망 판정·보스 분기) — BX-05 일부 | 42112~43121 | 0 | 피해 표본 oracle 일치, 쉴드 규칙은 CLAUDE.md eShield 계약 그대로 |
| CX-05 | 적 표시 공통 (EnemyView 확장: etype별 시트·크기·색) | ETYPE_COL, 19916 `ETYPE_COLS` | 0 | 웹 나란히 캡처 |

- 현재 Unity: `SimulationState.cs`의 `EnemyState`와 `Simulation.cs`의 mkEn 축약(etype0 고정, 그 외 `NotSupportedException`). 둘 다 **Codex 소유 파일**이다.
- 방식: PC 새 파일(`Runtime/Core/Combat/Enemy/*`)에 공통 틀을 만들고, Codex 파일 연결은 patch + PC_TO_MAC_INBOX(main·codex 브랜치 두 곳)로 요청한다. Codex가 이의를 내면 그 부분은 멈춘다.
- 크기: `updateE` 약 2,800줄, `hurtE` 약 1,000줄. CX-03·CX-04는 한 번에 넘기지 않고 공통 앞·뒤 처리부터 잘라 명세한다.

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
