# Unity 캐릭터 총괄 보드 (2026-10-27~)

- 총괄: PC Claude 세션 "유니티 캐릭터 총괄"(Opus). 2026-10-27 사용자가 이 역할을 지정했다.
- 맡는 일: Unity 리모델링에서 플레이어 영웅의 3D 외형을 만든다. 범위는 캐릭터 시트 → 3D 메시 → 리깅 → Animator → 인게임 판정이다. 명세·판정은 총괄이 하고, 실행은 Sonnet이 한다.
- 범위 밖: 전투 규칙(`Runtime/Core`, 웹 oracle 정답), 보스 외형(BX-12, 보스전 총괄), 맵(맵 총괄). 톤 최종 판정은 디자인총괄(통합 컨셉 4장 T1~T8)이 한다.
- 기준 문서: 각 캐릭터 DESIGN LOCK(`docs/11내러티브·로어디자인/WARRIOR_DESIGN_LOCK.md`, `docs/archetypes/silvertail/SILVERTAIL_LOCKED_SPEC_v1_2.md`, `docs/17게임아트팀/IVAN_T8_KEYART_V35_20261026.md`), `docs/0마스터플랜/EXODUSER_DESIGN_CONCEPT_V1_20261026.md` 4장, `docs/17게임아트팀/ART_TEAM_MASTER.md` 절대 규칙 R1~R8.

## 1. 대상

| id | 캐릭터 | 원화 상태 | Unity 단계 |
|---|---|---|---|
| warrior | 대검전사 | LOCK 확정(앵커) | UCH-01 시트 |
| silvertail | 실버테일 | LOCK v1.2(단검 1·왼쪽 허벅지) | UCH-01 시트 |
| ivan | 아이반(검은 연기) | T8 r4 확정 | UCH-01 시트 |
| spearmage | 창법사 | 원화 RETOUCH 중 | 원화 채택 뒤 |
| transmuter | 변성술사 | 원화 RETOUCH 중(활·낫·거대 장검 가변) | 원화 채택 뒤 |

## 2. 단계

| 단위 | 내용 | 상태 |
|---|---|---|
| UCH-01 | Unity용 캐릭터 시트 1차: 3명 × body(정면·3/4·측면·뒤, A포즈)·head·weapon, 회색 배경·평면 조명, 뷰 분할(Meshy 다중 입력용) | **완료** (9장 PASS, $0.645) |
| UCH-02 | 시트 → 3D 메시 시험(Meshy, 1명 1건) → Unity 6000.6.7f1 임포트·스케일·재질 | 대기 |
| UCH-03 | 리깅(휴머노이드)·Animator 기본(대기·이동·구르기·공격 1) | 대기 |
| UCH-04 | 인게임 판정: 1-1 맵 위 1920×1080·1x 크롭, 전사·실버테일 옆 T1~T8 | 대기 |

## 3. 결정 기록

| 날짜 | 결정 | 근거 |
|---|---|---|
| 2026-10-27 | 1차 대상 = 전사·실버테일·아이반. 창법사·변성술사는 원화 채택 뒤 | LOCK이 확정된 캐릭터만 3D 기준으로 삼는다 |
| 2026-10-27 | 시트 생성 = OpenAI `gpt-image-2.5-sunburst` images/edits(기존 맵 텍스처·아이반 키아트와 같은 경로), 1536×1024 high, 상한 12회·$6 | 사용자 "지피티 api로해"(3D 에셋), 아이반 r4 선례 |
| 2026-10-27 | body 시트는 빈손 A포즈, 무기는 별도 시트. 실버테일 등검(허브+접힌 날)은 몸에 붙은 장비라 body에 포함 | 리깅·무기 소켓 분리 |
| 2026-10-27 | 실버테일 단검은 LOCK v1.2대로 1자루(왼쪽 허벅지). 캐릭터 선택 컷 `silvertail_cut.png`의 2자루는 따르지 않는다 | LOCK [A][C] |

## 4. 로그

- 2026-10-27 UCH-01 명세 `E:/exoduser-wt/_out/unity-charsheet/SPEC.md`(Git 밖)를 작성하고 Sonnet에 배정했다.
- 2026-10-27 UCH-01 1차: 호출 12회, $0.43, 7장 생성. 총괄 판정은 전사 body·head·weapon PASS, 아이반 body·head PASS(body는 뷰 2·3이 맞닿아 재분할), 실버테일 head PASS, 실버테일 body **RETOUCH**다. RETOUCH 사유는 날이 척추를 따라 곧게 허리까지만 내려온다는 점이다. ㄱ자 접힘·오른쪽 엉덩이·종아리 끝이 없고 측면 보기에서 날이 사라졌다. 실버테일·아이반 weapon은 OpenAI 모더레이션(violence)에 차단됐다. 전사 weapon은 "ceremonial sword prop" 문구로 통과했다. 교훈: 무기 시트는 weapon/gun/blade/dagger 단어를 피하고 "game prop design sheet, prop only, nobody"로 쓴다. R2 명세는 `SPEC_R2.md`다.
- 2026-10-27 UCH-01 R2: 호출 4회, $0.21, 모더레이션 차단 0. 누적 16회 $0.645. 총괄 판정 **9장 전부 PASS** → UCH-01 완료.
  - 실버테일 body r2b(편집 2회): 허브 → 척추 → 오른쪽 엉덩이 ㄱ자 접힘 → 종아리 끝이 3/4·측면·뒤 보기에서 읽힌다. 정면은 오른쪽 허벅지 바깥으로 끝만 보이고 중앙이 깨끗하다. 단검은 왼쪽 허벅지에 1자루다.
  - 실버테일 weapon: 날이 접힌 상태(경첩 위치 포함)로 그려졌다. 펼친 상태는 리깅에서 경첩을 회전해 만든다(조건부 PASS).
  - 아이반 weapon: r4 크롭의 원통 약실·삼각 문양 고리·총구 고리와 일치한다. 개머리는 r4에 보이지 않아 새로 그렸으므로 모델링 때 키아트 전신과 대조한다.
  - 아이반 body는 뷰 2·3 사이 전경 0 열에서 다시 분할해 4뷰가 됐다.
  - 최종 파일: `E:/exoduser-wt/_out/unity-charsheet/<id>/`(`<id>_body`·`_head`·`_weapon`, 실버테일 body=`silvertail_body_r2b.png`), Meshy용 뷰 `<id>/views/*.png` 1024², 격자 `lineup_r2.jpg`.
