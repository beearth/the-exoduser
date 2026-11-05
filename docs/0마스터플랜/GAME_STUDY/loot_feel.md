# 루팅 감각 연구 — 드롭·획득·장비 가시화가 "좋다"고 느껴지는 조건 (2026-11-05, 레인 LT)

- 브리프: [`BRIEF_OVERNIGHT2_20261105.md`](../worklog/cloud-lanes/BRIEF_OVERNIGHT2_20261105.md) LT 절. 정체성 한 줄 "33도 쿼터뷰 **루팅** 핵슬 탄막 액션 RPG"에서 "루팅"을 맡는다.
- 범위: ① 공개 드롭 수치 ② 드롭 순간 연출 문법 ③ 장비 가시화(CH 레인 요구표) ④ 비교 툴팁·추천·필터 관례 ⑤ 우리 Core 대조 "지금 못 하는 것" ⑥ 매뉴얼 11 수치 제안. 코드 수정 0, Core 수치 변경 0(제안은 **LT-C 번호**), 레퍼런스 에셋·코드 반입 0.
- 선행·병행 문서: [MANUAL 11 전리품](../MANUAL/11_loot_items.md)(brief: `claude/unity-cloud-manual-draft-20261105`), [`codex_menus_loot.md`](codex_menus_loot.md)(`codex/unity-study-menus-loot-20261105`), [아이템·어픽스 감사 IA](../../7아이템디자인/ITEM_AFFIX_AUDIT_20261105.md)(`claude/unity-cloud-item-affix-audit-20261105`), [캐릭터 파이프라인 CH](../MANUAL/CHARACTER_PIPELINE_20261105.md)(`claude/unity-cloud-character-20261105`), [ARPG 관례 G행](../ARPG_CONVENTIONS_CHECKLIST_20261105.md). 이 문서는 겹치는 곳은 링크만 두고, **공개 수치·장비 가시화 요구표·드롭 리듬 계산**에 집중한다.

## 조사 한계 (먼저 읽을 것)

1. **이 세션은 외부 페이지 본문을 하나도 열지 못했다.** 클라우드 네트워크 정책이 news.blizzard.com·pathofexile.com·poe2wiki.net·support.lastepoch.com·forums.crateentertainment.com·fandom·fextralife·steamcommunity·wikipedia·gamedeveloper.com을 전부 막았다(DNS 실패). 그래서 외부 근거는 **전부 "검색 발췌"**(검색 엔진이 돌려준 요약·인용)이고 "열림"은 0건이다. 원문 확인은 PC·Mac 세션이 해야 한다(§9 출처 표의 접속 열).
2. 발췌라서 **숫자는 그 발췌 안에 글자로 적힌 것만** 옮겼다. 영상·이미지 실측 0, 게임 파일 분석 0.
3. 표기: **[사실]** = 발췌 2곳 이상이 같은 말(또는 공식 패치노트 발췌), **[사실·1]** = 공식 1곳 또는 2차 매체 1곳, **[추정]** = 비교에서 끌어낸 우리 해석, **[제안]** = 우리 게임에 쓸 값, **[미확인]** = 조사 자료에 정보가 없음(기능이 없다는 뜻이 아님). 내부 코드는 **[코드]** + `파일:줄`로 적고 전부 열어 확인했다.
4. 공개 수치의 성격: ARPG 개발사는 **드롭 테이블 자체를 공개하지 않는다.** 공개되는 것은 ① 패치노트의 *상대 변화*(+40% 등) ② 난이도·보너스 배율(D3 토먼트) ③ 보장 규칙(보스 최소 1 희귀) ④ 필터·표시 문법의 매개변수 범위다. "분당 드롭 n개" 같은 절대값은 어느 게임도 공개하지 않았다 → 우리 기준은 우리 Core에서 **계산**해 세운다(§5).

---

## 0. 요약 (결론 10줄)

1. 공개 자료가 말하는 "좋은 루팅"의 공통점은 **① 적게 떨어지되 하나하나가 읽힌다(D4 Loot Reborn·D3 Loot 2.0) ② 보스·레어는 보장이 있다(PoE2 0.1.0c: 보스 최소 1 희귀, 금화 ≤50%) ③ 등급은 색+기둥+소리+지도 아이콘 4층으로 말한다(PoE 필터 문법·LE 1.3/1.4·Borderlands 기둥) ④ 이름표는 누르는 동안/토글(D4 Alt, PoE2 Z, LE X) ⑤ 장비는 몸에 보이고 반지·목걸이는 안 보인다(D4·LE·TL2·GD 공통)**이다.
2. 우리 Core 드롭 규칙은 이미 ②를 갖고 있다: 장보스 가중치에 일반·고급이 0이라 **3개 전부 희귀 이상**, 챕터보스 첫 롤 전설 확정 [코드 `WorldDrop.cs:14~15,59`]. 1-1 드루이드(장보스)는 **전설 1개 이상 48.7%**(계산 §5.1).
3. 일반몹은 처치당 45%×dropBonus, 전설은 **일반 처치 약 220회에 1개**, 유니크는 약 22,000회에 1개(§5.1). 1-1 한 판의 분당 수치는 처치 수 로그가 없어 **미검증**(Mac 측정 항목 §5.3).
4. 드롭 순간 표현은 Unity에 **아이콘+등급 기둥만** 있다. 이름표·드롭음·튀어나옴·지도 아이콘·자동 줍기 반경이 없다 [코드 `NativeGame.WorldDrops.cs:8~9,21~22,108~122`]. 줍기는 R키로 **화면 안 최고 등급 → 가장 가까운 것** 하나씩 [코드 `Simulation.cs:324~336`].
5. "최소 줍기 등급"은 표시 필터가 아니라 **생성 필터**다: 임계 미만은 아이템이 만들어지지 않는다 [코드 `WorldDrop.cs:65`]. MANUAL 11 D11-12의 답. 숨긴 것과 없는 것을 구별할 경로가 없다.
6. **색 문법 충돌**: 적 엘리트 등급 색(매직 `#4488ff`·레어 `#ffaa00`)이 아이템 희귀 `#4488ff`·전설 `#ffaa00`와 같다 [코드 `EliteTables.cs:26~27` vs 아이템 등급 표]. 화면에서 "파란 적"과 "파란 드롭"이 같은 말을 하지 않는다 → LT-C3·D11-8 근거.
7. 장비 가시화: Core가 외형에 줄 수 있는 키는 `slot·tier(0~4)·el(0~5)·rarity·wtype/btype/brType·uniqueArt`다 [코드 `ItemFactory.cs:117~127,131,147,262,286~287`]. 1-1(SiToHell 0)에서 나오는 tier는 일반 0·보스 1·레어몹 2 [코드 `EnemyFactory.cs:192`] → **가시 방어구 8슬롯 × tier 3단 = 24파트 + 무기 7 + 석궁 3 = 34메시**가 1-1 완성 범위(§3.3 표).
8. CH 요구표(§3.3)는 CH 0.1·§2 분할표를 그대로 쓰고 "외형 키·등급 색 규칙·세트 수·우선순위" 열을 더했다. 핵심 규칙: **외형 = (slot, tier) 세트, 원소 = 포인트 색, 등급 = 몸에 안 입힘(유니크만 전용 아트)** — CH 6-3 A·6-4 B와 같다.
9. 매뉴얼 11 수치 제안(§6)은 7건: 드롭 리듬 기준표 신설, 보스 보장 규칙 명문화, 이름표 자동 표시 3초, 자동 줍기 = 화폐·재료만, 지도 아이콘 층 추가, 등급 색 충돌 해소, 1-1 측정 항목.
10. Core 제안 3건(LT-C1 자동 줍기 반경, LT-C2 일반몹 무드롭 보정, LT-C3 엘리트 색을 표현 표로)과 사용자 결정 5건(§7). 외부 출처 ID 48(URL 54) 전부 "검색 발췌", 미검증 표기 항목 수는 §10.

---

## 1. ① 드롭 빈도·등급 분포·"큰 드롭" 간격 — 공개 수치

### 1.1 게임별로 공개된 것

| 게임 | 공개된 수치·규칙 | 성격 | 근거 | 출처 상태 |
|---|---|---|---|---|
| Diablo IV (시즌 4 Loot Reborn, 2024-05-14) | 몬스터가 **더 적게** 떨어뜨리고 떨어진 것의 가치가 높다. 희귀 2어픽스·전설 3어픽스로 어픽스 수를 줄였다. 변경은 영원의 영역에도 적용. Greater Affix는 WT3·4에서 어픽스마다 확률 발생, 값 ≈ 최대 롤 1.5배 | 방향·어픽스 수 [사실], 1.5배 [사실·1] | S-D1·S-D2·S-D3·S-D4 | 검색 발췌 |
| Diablo IV (오픈 베타 2023) | 베타 기간 전설 드롭률을 **일시적으로 올렸다**고 총괄이 확인 — "체험용 상향"이라는 사례 | [사실·1] | S-D9 | 검색 발췌 |
| Diablo IV 전설 천장(pity) | 공개 자료 없음. WoW의 불운 보호와 혼동 금지 | [미확인] | S-D9 검색 결과 | — |
| Diablo III Loot 2.0 (패치 2.0.1, 2014-02-25) | "적게, 더 좋게": 전체 드롭 수를 줄이고 전설 가치를 올림(Mosqueira·Martens 발언). **Smart Drop ≈ 85%**가 찾은 직업에 맞는 스탯. 토먼트 전설 보너스 **T1 +15% / T2 +32% / T3 +52% / T4 +75% / T5 +101% / T6 +131%**, 네팔렘 균열은 일반 +25%·T1 +44%·T2 +65%·T3 +90%(v2.0.3 기준, 2.3 이전) | 방향 [사실], 85% [사실](위키+포럼 다수), 토먼트 표 [사실·1](위키) | S-D10·S-D11·S-D12·S-D13·S-D15 | 검색 발췌 |
| Path of Exile 2 (0.1.0c, 2024-12-10) | 레어 몬스터 모드당 **희귀도 보너스 2배, 모드당 +10% 수량**. 엔드게임에서 레어가 모드를 더 갖게. **액트·맵 보스는 최소 1 희귀 보장, 유니크 몬스터 드롭의 금화 비율 ≤50%**("불운 보호"). 2회차 캠페인 보스는 화폐 대신 다른 아이템. Regal +40%·Lesser Jeweller +33%, Chaos 하향(상위 화폐로 재분배) | [사실](공식 패치노트 발췌 2곳) | S-P1·S-P2·S-P3 | 검색 발췌 |
| Path of Exile 2 (0.2.0g, 2025-05-01) | "**수량보다 희귀도**에 의존"해 아이템 스팸을 줄임. 보스는 초반 몇을 빼면 일반 등급을 안 떨어뜨림(모든 고유 보스 최소 1 희귀). 희귀 상자·스트롱박스 희귀도·수량 대폭 상향, 스트롱박스 Cruel +50%·엔드게임 +100%. 위스프 레어는 항상 희귀 1개 | [사실](공식 포럼+위키+2차) | S-P4·S-P5·S-P6·S-P7 | 검색 발췌 |
| Last Epoch | 유니크의 **Legendary Potential은 아이템 기본 파워로만 정해지고** 희귀도 모드·레벨은 무영향(공식 지원). Circle of Fortune 8랭크가 LP 확률 2배. 축복 "Grand Winds of Fortune" 유니크 드롭률 +16~22%. 1.3 필터 규칙에 기둥·지도 아이콘·드롭음, 1.4 독립 조절·규칙 상한 200 | LP 규칙 [사실·1](공식), CoF·축복 [사실·1](2차), 필터 [사실](codex §4.2) | S-L1·S-L2·S-L3, codex [L2][L10] | 검색 발췌 |
| Grim Dawn | v1.2(2023-11-16) 드롭 테이블·레벨 스케일 전면 개편(수치 비공개). 1.1.4.0 **부품·소모품·재료 자동 줍기 옵션**(기본 꺼짐), v1.2 자동 줍기 반경 확대 가능 | [사실·1] | S-G4·S-G5 | 검색 발췌 |
| Borderlands 3 | 2020-04-30 핫픽스 "메이헴 모드 전설·Anointed 드롭률 조정", 5-07 "전 메이헴 레벨 드롭률이 의도보다 낮았던 버그 수정". 저격총 비중 하향 같은 **아이템 종류 가중치 조정**도 패치노트로 공개. 백분율은 비공개 | [사실·1](2차 매체) | S-B5·S-B6 | 검색 발췌 |
| Torchlight II | 등급 색 외 드롭 수치 공개 없음 | [미확인] | S-T1~T3 | 검색 발췌 |
| GDC 강연(루팅 설계) | 검색에서 Borderlands·Diablo 루팅 전용 GDC 세션을 찾지 못함(일반 PCG 세션만) | [미확인] | — | — |

### 1.2 해석 — "좋다"고 느끼는 조건 [추정]

- **밀도보다 판독**: D3·D4·PoE2 세 번의 대형 개편이 모두 "덜 떨어뜨리고 하나하나를 읽게" 갔다. 우리 일반몹 45%(처치 2번에 1개)는 이미 "적은" 편이고, 문제는 떨어진 것이 **읽히지 않는 것**(이름표 없음)이다 → 빈도 조정보다 표시가 먼저.
- **보장이 감각을 만든다**: PoE2가 "불운 보호"라고 부른 것은 확률 상향이 아니라 **보스 최소 1 희귀·금화 상한**이라는 *하한선*이다. 우리 Core는 장보스·챕터보스에 하한이 있고(§5.1) 일반몹엔 없다. 일반몹 하한(연속 무드롭 보정)은 PoE2도 두지 않았다 → 사용자 결정(§7 LT-D2).
- **"큰 드롭"은 감각상 1판에 1~2번**: 공개 수치는 없지만 D3 토먼트 보너스가 "난이도를 올리면 전설이 더 자주"로 **난이도와 큰 드롭 간격을 묶는** 관례다. 우리는 1-1 보스에서 48.7%, 챕터보스에서 100%(§5.1) → "첫 전설" 체험을 보스에 두는 설계가 관례와 맞다.
- **직업 맞춤(Smart Drop 85%)**: 우리 Core엔 영웅별 선호 슬롯 가중이 없다(16슬롯 균등 [코드 `WorldDrop.cs:66,78`]). 영웅 수가 적은 데모 v0에서는 필요 없고, 영웅이 늘면 사용자 결정(LT-D5).

---

## 2. ② 드롭 순간의 연출 문법

### 2.1 공개 자료의 문법 요소

| 요소 | 게임별 사실 | 근거 | 출처 상태 |
|---|---|---|---|
| 등급 색 체계 | D4 흰/파/노/주황/금(이름), PoE2 흰/파/노/주황, LE 흰/파/노/주황/초록(세트)/보라(Exalted)/빨강(Legendary), **Grim Dawn은 관례를 바꿈**: 일반 흰 / 매지컬 노랑 / 레어 초록 / 에픽 파랑 / 레전더리 보라(MI는 같은 등급과 다른 색, 레어 MI 올리브), Torchlight II 일반 흰 / 매직 초록 / 레어 파랑 / 세트 보라 / 유니크 주황(세트 색은 자료 충돌), Borderlands 흰/초록/파랑/보라/주황(+BL2 Effervescent 무지개) | [사실](D4·PoE2·LE: codex §2.2·3.2·4.2 / GD·TL2·BL: 2차 2곳 이상) | codex [D11][P8][L7], S-G1·S-G2, S-T1~T3, S-B1·S-B2 | 검색 발췌 |
| 빛기둥 | Borderlands: 모든 드롭이 **등급 색으로 빛나 멀리서도 읽힘**, Effervescent는 **더 높은 기둥**으로 구별, BL2 색약 모드는 기둥 팔레트를 바꿈. PoE 필터 `PlayEffect <색> [Temp]`(Temp = 드롭 순간만). LE 1.3 규칙별 기둥 선택, 1.4 기둥·지도 아이콘 독립. D4 2024 Mythic Unique 전용 기둥(색·높이 비공개) | [사실] | S-B1·S-B3·S-B4, codex [P6][L10][L2][D6] | 검색 발췌 |
| 지도 아이콘 | PoE 필터 `MinimapIcon <크기 0~2> <색> <모양>`; LE 1.3 규칙별 지도 아이콘; D3 전설 미니맵 별 표시 | PoE·LE [사실], D3 [미확인](발췌 없음) | codex [P6][L10] | 검색 발췌 |
| 드롭 소리 | PoE `PlayAlertSound <1~16> [볼륨 0~300]`·`CustomAlertSound`·`DisableDropSound`; LE 1.3 규칙별 드롭음; D4 접근성 옵션 "등급별 전리품 오디오"(드롭 시/커서 위/바닥에 남아 있을 때 3종). **소리 길이·피치는 어느 게임도 비공개** | [사실] | codex [P6][L10][D3] | 검색 발췌 |
| 이름표 표시 키 | D4 **Alt 누르는 동안**(패드 L2), 옵션 "Push to Toggle"로 상시; 2차 가이드 "기본 약 10초 표시"(공식 아님). PoE2 Z 이름표 토글 + 전역 상태 HUD. LE **X 누르는 동안 필터 임시 해제**. Grim Dawn 바닥 이름표 = 필터 창(좌하단) 연동 | D4 Alt·토글 [사실](공식 포럼+가이드), 10초 [사실·1], PoE2·LE [사실](codex) | S-D7·S-D8, codex [P3][P5][L9], S-G3·S-G7 | 검색 발췌 |
| 글자 크기·색 문법 | PoE `SetFontSize 1~45`, `SetTextColor/SetBorderColor/SetBackgroundColor R G B [A] 0~255`(글자·테두리·배경 **분리**). LE 지원 문서도 글자색/배경색 구분 | [사실] | codex [P6][L8] | 검색 발췌 |
| 자동 줍기 | **장비 자동 줍기는 다섯 게임 모두 없음**(클릭·키). D3 금화·체력구슬 자동 줍기 **기본 반경 ≈3야드**, RoS 이후 어픽스 +1~2야드(Rondal's Locket 4~6). LE 금화는 밟으면 줍고 조각은 **클릭 1회 → 주변 진공**, 개발사는 조각 자동 줍기에 반대("조각은 화폐가 아니라 전리품"). Grim Dawn 1.1.4.0 부품·소모품·재료 자동 줍기 옵션(기본 꺼짐), 1.2 반경 확대. D4 재료·금화 자동 줍기 반경 수치 [미확인]. PoE2 금화 [미확인] | D3 [사실](위키+포럼), LE·GD [사실·1] | S-D14, S-L6, S-G4·S-G5 | 검색 발췌 |
| 보상 화면형 대조 | Hades는 바닥 더미가 아니라 **제시된 3개 중 선택** — 우리 정체성(바닥 루팅)과 반대 사례 | [사실] | codex §5.2 | 검색 발췌 |

### 2.2 문법 정리 — 드롭 한 번의 4단계와 우리 현황 [추정 + 코드]

| 단계 | 관례(공통) | 우리 Unity 현황 [코드] | 판정 |
|---|---|---|---|
| ① 처치 → 생성 | 시체 위치에서 흩어짐, 보스는 여러 개가 부채꼴 | 적 위치 ±15px 지터만(`WorldDrop.cs:71`), 튀어나옴·착지 없음, 아이콘은 3px 사인 부유(`NativeGame.WorldDrops.cs:108`) | 없음 |
| ② 바닥에 있는 동안 | 등급 기둥(순간+지속) + 이름표(키) + 지도 아이콘 + 대기 소리 | 기둥 60×160 가산, 2프레임 180ms, 알파 .46±.05(`:112~122`). **이름표·지도·소리 없음** | 부분 |
| ③ 줍기 | 클릭/키 1개씩, 반경 자동은 화폐·재료만 | R키: 화면 안(`NativeGame.cs:234` 뷰포트) 최고 등급 → 가까운 것, 누르고 있으면 9틱마다 반복(`Simulation.cs:170,324~336`), 가방 가득이면 토스트. 거리 제한 없음(화면 안이면 어디든) | 있음(관례보다 너그러움) |
| ④ 획득 알림 | 측면 토스트/로그, 등급색 이름 | "<등급> <이름> 획득!" 한국어 고정(`NativeGame.WorldDrops.cs:136,143`) + `PlayItemPickup` | 부분(번역 위반) |
| 보존 | 바닥 상한·필터 | 20개, 넘치면 **최저 등급 축출**(`WorldDrop.cs:82~96`) | 있음 |

- **"화면 안이면 어디든 R로 줍는다"**는 관례(접근 후 클릭)보다 편하다. 루팅 감각 측면에서는 **다가가는 동작이 보상 체험의 일부**(D4·PoE2·LE 전부 클릭)라서, 먼 아이템이 소리 없이 가방에 들어가면 "주웠다"는 느낌이 약하다 → §6 제안 6(줍기 연출: 아이콘이 플레이어로 날아드는 0.2초).

---

## 3. ③ 장비 가시화 — 어떤 슬롯이 보이는가, 세트·등급·염색 규칙

### 3.1 게임별 가시 슬롯 (공개 자료)

| 게임 | 몸에 보이는 슬롯 | 안 보이는 슬롯 | 외형 변경 체계 | 근거 | 출처 상태 |
|---|---|---|---|---|---|
| Diablo IV | **투구·흉갑·장갑·바지·부츠 + 무기**(워드롭 Ensemble이 바꾸는 범위) | 목걸이·반지(워드롭 항목 없음 → [추정]) | 워드롭: 장비를 **분해하면 외형 해금(계정 공유)**, 앙상블 슬롯 5개 시작·골드로 추가, **염색** 팔레트(2차 "최대 9종") | S-D5·S-D6, codex [D1] | 검색 발췌 |
| Path of Exile / 2 | 공식 가시 슬롯 목록 발췌 없음. MTX 체계로 추정: 바디아머·투구·장갑·부츠·무기·방패 스킨 판매, 2.6.1부터 **MTX가 아이템이 아니라 별도 슬롯**에 붙고 무기·유니크 스킨 외는 해당 슬롯에 장비가 없어도 표시 | 벨트·반지·목걸이 [추정] | 유료 MTX(스킨·이펙트·부착물), 염색 없음 | S-P9 | 검색 발췌·[추정] |
| Last Epoch | **투구·흉갑·방패·무기·장갑·부츠·등(Back)·포털**(2차 가이드), 세트·유니크는 대부분 전용 모델이나 **바디아머가 뒤처짐**(포럼) | 벨트(목록에 없음 → [추정])·장신구 | 트랜스모그 없음(2차) | S-L4·S-L5 | 검색 발췌 |
| Grim Dawn | 머리·어깨·가슴·손·다리·발·벨트 슬롯 존재(어깨 슬롯이 별도). 가시 여부 공식 목록 없음 — 포럼 "바지는 갑옷 밑이라 잘 안 보임", "장갑 숨기기 요청" → **보임** | 메달·반지·목걸이·유물 | **Illusionist**(확장): 외형 바꾸기, 비용은 캐릭터 레벨 비례, 되돌리기 무료, **외형 수집은 계정 공유**, 거래 불가 | S-G6 | 검색 발췌·[추정] |
| Torchlight II | 방어구 종류: **벨트·부츠·흉갑·장갑·투구·레깅스·방패·어깨**(위키 분류) → 전부 보임 [추정]. 캐릭터 12개 착용 + 펫 3개 | 반지·목걸이 | 없음 [미확인] | S-T2·S-T4 | 검색 발췌 |
| Borderlands | 무기만 보임. 방어구 슬롯 자체가 없고(쉴드·유물은 수치) 외형은 **스킨·헤드**로만 | 쉴드·유물·클래스모드 | 스킨·헤드(수집) | S-B1 [추정] | 검색 발췌·[추정] |

**공통점 [사실 3편 이상]**: 투구·흉갑·장갑·바지(다리)·부츠·무기(+방패)는 보이고, 반지·목걸이는 안 보인다. 벨트·어깨는 게임에 따라 다르다. 외형 변경은 "수집 → 계정 공유 → 적용"(D4·GD)이 관례이고, 등급 색을 몸에 입히는 게임은 없다(등급은 이름표·테두리·기둥의 일).

### 3.2 등급·세트·실루엣 규칙 [추정, 공개 자료의 공통점]

| 규칙 | 근거 | 우리 적용 |
|---|---|---|
| **세트는 실루엣이 다르다**: 어깨 폭·투구 높이·망토 길이가 바뀌어야 "갈아입었다"가 1x에서 읽힌다 | LE "세트·유니크는 전용 모델"(S-L5), D4 워드롭이 슬롯별 외형을 바꿈(S-D5) | CH §1.5 "실루엣 변화 ≥3텍셀" 그대로 |
| **등급은 몸에 안 입힌다**: 전설이라서 몸이 금색이 되는 게임이 없다. 유니크·세트만 전용 아트 | D4 2020 "희귀도는 아이콘 테두리"(codex [D5]), GD 등급 색 논쟁도 전부 이름 색(S-G2) | CH 6-4 B(기본 안 입힘, 유니크만 발광/문양) 지지 |
| **원소·재질은 색으로**: 같은 세트의 불/얼음 변형은 포인트 색만 바뀜 | 공개 자료 직접 근거 없음 [추정] (우리 이름 표가 이미 원소별 접두를 가짐) | `el` 0~5 → 포인트 색 2단 틴트, 실루엣 불변 |
| **외형 키는 아이템과 분리**해 두면 트랜스모그·염색이 공짜 | D4 워드롭·GD Illusionist가 "외형 수집"을 아이템과 분리 | CH 6-3 A(표현 JSON 매핑, Core 0) 지지. 염색·외형 변경 자체는 v0 밖(LT-D4) |

### 3.3 CH 레인 요구표 — 슬롯별 "보여야 하는 것" (Core 키 기준, 수정 0)

Core가 아이템에 주는 외형 결정 키 [코드]: `slot`(17), `tier` 0~4 → 이름 단계 `nameTier=min(tier,4)`(`ItemFactory.cs:118`), `el` 0~5(`WorldDrop.cs:67`; 무기·방패는 el=0 고정 `:114`), `rarity` 0~5, `wtype` 7종(`DropTablesData.cs:549~557`)·`btype` 3종(`:558~562`)·`brType` 2종(`ItemFactory.cs:262`), `uniqueArt` 27종 ui-01~27(`DropTablesData.cs:527~548`, 기본형 20개에 1~3개씩). 1-1(StageIndex 0, SiToHell 0)에서 실제 나오는 tier: 일반몹 0, 보스 1, 레어몹(etype 90~99) 2(`EnemyFactory.cs:192`), 시작 몹 세트 min(4, hell+2)=2(`Simulation.StartMobs.cs:66`).

| # | slot | 보임(CH 0.1) | 외형 키(제안) | 실루엣 변화 요소(1x ≥3텍셀) | 등급 표현(제안) | 세트 수: 1-1 / 전체 | 우선순위 |
|---|---|---|---|---|---|---|---|
| 0 | `weapon` | 보임(오른손 소켓) | **wtype 7종 = 메시 7**, tier 0~4 = 재질 5단(이름 접두 녹슨/강철/흑요석/심판의/천벌의 `DropTablesData.cs:564`), el 0~4 = 날 포인트 색 | 길이·머리 모양(검/단검/해머/메이스/곤봉/도끼/창) | 몸에 없음. 유니크 7종 전용 메시(sword·dagger·hammer·axe·mace·club·spear 각 1) | **7 메시 × 3 재질** / 7 × 5 + 유니크 7 | 1 — 현행 대검 1종만(CH 0.2) |
| 1 | `shield` | 보임(왼팔, CH 6-2) | tier 0~4 = 메시 또는 재질 5단(나무/철/강철/미스릴/파멸 `:572`) | 크기·테두리 | 유니크 2종(ui-12·ui-20) 전용 | 3 / 5 + 유니크 2 | 2 — Q 패링 규칙의 얼굴 |
| 2 | `boots` | 보임 | tier 5단(낡은/강철/흑요석/미스릴/천벌), el 포인트 | 발 덩어리 높이 | 유니크 1(ui-05) | 3 / 5 + 1 | 4 |
| 3 | `armor` | 보임(실루엣 1순위) | tier 5단(천/가죽/강철/미스릴/천벌 `:573`) → **1x 어깨 폭·가슴 명암이 단계마다 달라야 함**, el 포인트 | 견갑 폭·흉갑 두께 | 유니크 2(ui-10·ui-21) | 3 / 5 + 2 | **1** |
| 4 | `helmet` | 보임(머리 실루엣) | tier 5단(머리띠/헤드밴드/서클릿/티아라/왕관 `:574`) — 이름이 **낮을수록 작다** → 높이 변화가 이미 이름에 있음. 전설 3원소 "혼돈의 왕관"·4원소 "전지전능의 왕관"(`ItemFactory.cs:209~210`)은 이름만 바뀌므로 외형은 tier 4 공유 | 머리 높이·뿔/관 | 유니크 1(ui-17) | 3 / 5 + 1 | 2 |
| 5 | `bow` | 보임(등, CH 6-2) | btype 3종 = 메시 3, tier 재질 | 등 실루엣 | 유니크 1(ui-15, crossbow 기본형) | 3 × 1 재질 / 3 × 5 + 1 | 5 — 자동 석궁(B05) 발사 지점 |
| 6 | `gloves` | 보임 | tier 5단(천/가죽/강철/미스릴/천벌) | 팔 두께 | 유니크 3(ui-04·16·19) | 3 / 5 + 3 | 4 |
| 7 | `pants` | 보임 | tier 5단(천/가죽/강철/미스릴/천벌 `:576`) | 다리 실루엣·태싯 | 유니크 1(ui-23) | 3 / 5 + 1 | 3 |
| 8 | `belt` | 보임(얇음, 두께 ≥2텍셀) | tier 5단(허리띠/가죽/강철/미스릴/천벌) | 주머니 수 | 유니크 2(ui-07·13) | 3 / 5 + 2 | 6 |
| 12 | `cape` | 보임(Cape_ 9본) | tier 5단(낡은/가죽/강철사/미스릴/천벌 `:580`), el = 안감 색 | 길이·찢김 수 | 유니크 1(ui-01) | 3 / 5 + 1 | 3 — 키샷 실루엣 |
| 9·10·11·13·14·16 | `necklace` `ring1` `ring2` `bracelet` `headband`·`headband2`(귀걸이) | **비가시**(CH 6-5) | — (툴팁·아이콘만) | — | 유니크 아트는 **아이콘**만(ring ui-02, earring ui-06·22, necklace ui-14·18, bracelet ui-09) | 0 | — |
| 15 | `ossuary` | 비가시, 롤 없음(`ItemFactory.cs:66`) | — | — | 고정 유니크 | 0 | — |

- **1-1 완성 범위 합계**: 가시 방어구 8슬롯(shield·boots·armor·helmet·gloves·pants·belt·cape) × tier 3단 = **24파트** + 무기 7메시 + 석궁 3메시 = **34 메시**(재질 변주 제외). CH §1.1의 "렌더러 12"는 착용 1벌 기준이고, 이 34는 **만들어 둘 자산 수**다.
- **등급은 외형 키에 넣지 않는다**(CH 6-4 B). 단 하나 예외: 유니크는 `uniqueArt` 27종이 전용 아트를 가진다. 그중 가시 슬롯 3D 대상은 **21종**(weapon 7·crossbow 1·shield 2·armor 2·helmet 1·gloves 3·boots 1·pants 1·belt 2·cape 1), 비가시 6종(necklace 2·ring 1·bracelet 1·earring 2)은 아이콘만. 전설은 외형 변화 없음 + 이름표·기둥만 → MANUAL 11 D11-1 비색상 단서가 더 중요해진다.
- **원소 색 6단**(el 0~5)은 포인트 색만. 이름 표의 원소 접두(불꽃/냉기/그림자/전기/…)와 맞춰야 한다. 원소 5(여섯 번째)는 석궁·팔찌 이름 표가 5행이라 **기본 이름으로 떨어진다**(`ItemFactory.cs:152,264` 폴백) — 크래시는 아니지만 이름·색 대조표에 "el 5 = 접두 없음" 행이 필요하다 [코드].
- **LOCK 세트 A와 tier의 관계**(CH 6-1 보강 제안): LOCK의 "마디형 흑철 판금"은 **tier 1(강철) 세트**로 두고, tier 0(천/가죽/낡은)은 세트 A의 낡은 변형, tier 2(흑요석)는 검은 유리 포인트 변형으로 만들면 1-1 세 단계가 한 실루엣 안에서 재질로 갈린다. 챕터 2 이후(tier 3·4 미스릴·천벌)에서 실루엣을 바꾼다 → 사용자 결정 LT-D3.

---

## 4. ④ 비교 툴팁·추천 표시·필터 관례

MANUAL 11 §3.3과 codex §2.3·3.3·4.3이 툴팁 위계를 이미 다뤘다. 여기서는 **빠진 사실**과 우리 Unity 현황만 더한다.

| 관례 | 사실 | 우리 현황 [코드] | 판정 |
|---|---|---|---|
| 비교 입력 | D4 PC Shift / PS △ / Xbox Y 명시 키, 증가 녹색(codex [D8]). LE 기본/비교/Alt 상세 분리(codex [L11]). PoE **Alt = Advanced Mod Descriptions**(3.1.2, 2018-01: 모드 태그·티어 표시) — **바닥 아이템에는 티어를 안 보여 줌**(GGG 답변) | `NativeInventoryComparison.cs:8~14`: 호버 미리보기, 착용품 나란히, 차이는 "수치 차이 전체 보기", CP 차이는 가상 교체 계산. 유니크·전설 특수 텍스트·헬멧 원소 행 미이식(`:14`) | 있음(부분) |
| 티어 표기 방향 | PoE는 숫자가 낮을수록 좋음(T1 최상), 플레이어 혼동 사례 포럼 다수. 우리 2_7 유물 품질도 "1티어=최상" | 어픽스 `tier` 0~4(0이 최하 `ItemFactory.cs:355~370`) vs 유물 품질 1=최상(2_7 §990) — **방향이 반대** | 표시에서 통일 필요(§6-7) |
| 추천·업그레이드 표시 | D4 비교에서 증가 녹색/감소 빨강(codex [D8]); 바닥 이름표에 "업그레이드" 화살표를 붙이는 공식 사례는 발췌 없음 [미확인] | 없음. 등급만으로 R 우선순위 결정(`WorldDrop.cs:98~110`) | 없음 |
| 필터 규칙 상한 | D4 필터당 1~25, 동시 1개(codex [D2]); LE 200(1.4); PoE 텍스트 필터(상한 없음); Grim Dawn 좌하단 필터 창(등급·종류 체크) — "MI와 레어가 겹쳐 분리 못 함" 한계 | `MinPickRarity`·`MinPickLevelTier`만(`NativeGame.SettingsOptions.cs:23` → `Simulation.cs:313`). **생성 필터**(§5.2) | 부분 |
| 표시 키 | D4 Alt(누름)/Push to Toggle, PoE2 Z, LE X 임시 해제, D4 2차 "10초 기본 표시" | 없음(이름표 자체가 없음) | 없음 |
| 글자 크기 사용자화 | D4 글자 3단, LE 메뉴·툴팁·이름표·HUD 별 배율, PoE SetFontSize 1~45 | IMGUI 높이 기준 배율 1종 | 부분 |
| 등급 색 + 다른 단서 | D4 테두리 장식·오디오, PoE 아이콘·기둥·소리, LE 이름표·기둥·지도·소리 | 기둥만 | 부분 |

---

## 5. ⑤ 우리 Core 대조 — 드롭 리듬 계산과 "지금 못 하는 것"

### 5.1 Core 드롭 테이블로 계산한 기대 빈도 [코드 `WorldDrop.cs:14~17,50~70`, 계산은 이 문서]

가중치 합: 일반 100.01 / 엘리트 100.03 / 미니보스 100.1 / 장보스 100.2 / 챕터보스 100.7. dropBonus는 `Config.DropBonus`(장비 statDropBonus, 기본 1; `EliteTables.cs` DropBonus 열은 호출부에서 안 씀) [코드 `Simulation.cs:319`].

| 처치 대상 | 드롭 수 | 드롭 확률 | 등급 분포(드롭 1개당) | 희귀 이상 | 전설 이상 | 유니크 |
|---|---|---|---|---|---|---|
| 일반몹 | 1 | **45%** × dropBonus | 일반 65.0 / 고급 22.0 / 희귀 9.0 / 영웅 3.0 / 전설 1.0 / 유니크 0.01 % | 처치당 5.85% → **17처치에 1** | 처치당 0.45% → **약 220처치에 1** | **약 22,200처치에 1** |
| 엘리트(매직 이상) | 1 | 100% | 25 / 35 / 25 / 12 / 3 / 0.03 % | 40.0% | 3.0% | 0.03% |
| 미니보스(etype 90~99) | 2 | 100% | 10 / 25 / 30 / 25 / 10 / 0.1 % | 65% | 10% / 개 → 2개 중 ≥1: 19% | 0.1% |
| 장보스(1-1 드루이드 포함) | 3 | 100% | 0 / 0 / 29.9 / 49.9 / 19.96 / 0.2 % | **100%(3개 전부)** | 개당 19.96% → **3개 중 ≥1: 48.7%** | 3개 중 ≥1: 0.6% |
| 챕터보스(StageIndex 3·9·13·20·25·31·34) | 5 | 100% | 첫 롤 **전설 확정**, 나머지 0 / 0 / 0 / 29.8 / 69.5 / 0.7 % | 100% | **100%**, 기대 3.8개 | 4개 중 ≥1: 2.8% |

- 1-1 엘리트 비율은 hell 0에서 매직 3%·레어 0·챔피언 0 [코드 `EliteTables.cs:32`, `EnemyFactory.cs:74~82`] → 1-1 드롭은 거의 일반몹 45% 테이블이다.
- **분당·한 판당 절대값은 미검증**: 1-1 총 생성 수(`StageFlow.TotalSpawned`, 구멍별 `EnemyPools.SpawnHoleCount`)를 이 세션이 실행하지 못했다. 식만 둔다: 일반 처치 N회 → 장비 0.45N, 희귀+ 0.0585N, 영웅+ 0.018N, 전설 0.0045N. **[가정 N=150]**이면 장비 68·희귀+ 9·영웅+ 2.7·전설 0.7, 보스 포함 전설 기대 ≈ 1.3개/판. 측정 항목은 §5.3.
- 바닥 상한 20개(`LootStateCap`)는 N=150·45%에서 **줍지 않으면 금방 찬다**. 최저 등급 축출이라 "희귀 이상은 남는다"는 점은 좋다.

### 5.2 "지금 못 하는 것" 목록 (IA 감사와 겹치면 링크만)

| # | 항목 | 코드 근거 | 분류 | 관례 대조 | 비고 |
|---|---|---|---|---|---|
| L-01 | 바닥 **이름표 없음** | `NativeGame.WorldDrops.cs:8~9`(아이콘+기둥만) | 화면 | D4·PoE2·LE·GD 전부 있음 | ARPG G1 필수, MANUAL 11 §3.2 |
| L-02 | **드롭 순간 소리 없음**, 등급 장식음 없음 | Core에 `SfxPickup`만(`Simulation.Death.cs:162`), 표현 `PlayItemPickup`만(`WorldDrops.cs:142`) | 사운드 | PoE·LE·D4 등급별 드롭음 | MANUAL 11 §3.4, R10 청음 대기 |
| L-03 | 튀어나옴·착지·흩어짐 없음 | `WorldDrop.cs:71` ±15px 지터, `WorldDrops.cs:108` 사인 부유 | 화면 | 공통 관례(수치 비공개) | MANUAL 11 §3.2 [추정] 유지 |
| L-04 | 지도 아이콘 층 없음 | 미니맵 자체 상태는 ARPG I행 | 화면 | PoE·LE·D3 | 후속 |
| L-05 | **줍기 필터 = 생성 필터**: `rarity < MinPickRarity`면 아이템을 **만들지 않음** | `WorldDrop.cs:65`, `:70`(reqLv 하한) | Core 동작 사실 | 관례는 "표시 숨김"(D4·LE·PoE) | **D11-12 답**. 웹 2_7 §436은 "스킵/즉시분해"라 적는데 Core 호출부엔 분해 보상 지급이 없다 → 웹 oracle 대조 필요 [미확인] |
| L-06 | 자동 줍기 반경 없음(장비는 관례도 없음 → 문제 아님). **화폐·재료 드롭이 Core에 없어** 반경이 쓸 곳도 없음 | `WorldDrop.cs:10~11` 주석(유골 부위·유물·소켓석 미이식) | Core 미구현 | D3 3야드, GD 1.1.4.0/1.2 | IA §2.3 링크 |
| L-07 | 획득 토스트 **한국어 고정** | `WorldDrops.cs:136,143` | 번역 | 29개 언어 규칙 | ARPG G4 |
| L-08 | 일반몹 **무드롭 보정 없음** | `WorldDrop.cs:52` 단일 난수 | 설계 사실 | PoE2도 보스에만 하한. D4 pity [미확인] | item-system-full §1022 명시, IA B-12 |
| L-09 | **엘리트 색 = 아이템 등급 색**: 매직 `#4488ff`=희귀, 레어 `#ffaa00`=전설, 챔피언 `#ff4444`≈유니크 기둥 빨강 | `EliteTables.cs:26~28` vs 등급 표(MANUAL 11 §3.1) | 색 문법 충돌 | 관례는 적 등급 표시와 아이템 등급 색을 분리(D4 엘리트는 이름표 아이콘·테두리) [추정] | LT-C3, D11-8 추가 근거 |
| L-10 | 전설·유니크 **효과 미연결** → "첫 전설" 체험이 숫자 7개 | IA B-01 | Core | — | 링크만 |
| L-11 | 어픽스 티어가 플레이어 Lv/200 → 데모에서 T4·T5 불출 | IA B-06 | Core | "지역이 티어를 정한다" | 링크만 |
| L-12 | 유니크 장갑·벨트 potCd NaN, 부츠 chargeCharge 미부여 | IA B-09 | Core quirk | — | 링크만 |
| L-13 | **장비 가시화 0**: 영웅은 wtype 무관 대검 프리팹 1종 | CH 0.2(`NativeHeroMotion.cs:300`) | 표현 | 5게임 공통 "보인다" | §3.3 요구표 |
| L-14 | 비교 툴팁에 유니크·전설 특수 텍스트·헬멧 원소 행 없음 | `NativeInventoryComparison.cs:14` | 화면 | LE 상세 툴팁 | 후속 |
| L-15 | 어픽스 티어 0~4(0 최하) vs 유물 품질 1티어=최상 | `ItemFactory.cs:355~370`, 2_7 §990 | 표시 혼선 | PoE "T1 최상" 혼동 사례 | §6-7 |
| L-16 | 원소 5 석궁·팔찌 이름 폴백("석궁"/"악마의 팔찌") | `ItemFactory.cs:152,264`, `DropTablesData.cs:586~595`(5행) | 데이터 사실 | — | 이름·색 대조표에 행 추가, 수정은 사용자 결정 |
| L-17 | itemLv·reqLv가 플레이어 레벨에서 나옴(아이템은 "어디서 떨어졌나"를 기억 안 함) | `ItemFactory.cs:297~298` | 설계 사실 | LE/PoE 아이템 레벨 = 지역 | IA B-06과 같은 뿌리 |

### 5.3 Mac 측정 항목 (실행은 Mac 레인)

| 측정 | 방법 | 쓰는 곳 |
|---|---|---|
| 1-1 한 판 처치 수 N·소요 시간 | 공용 실행기, `Simulation.Kills`·`StageFlow.TotalSpawned` 로그 | §5.1 절대값, MANUAL 11 §3.0 |
| 장비 드롭 수·등급 분포 | `Simulation.Loot`·`CollectedLoot` 로그(등급별 카운트) | 계산 §5.1 검증(±10%면 PASS) |
| 바닥 20개 상한 도달 시각·축출 횟수 | `WorldDrop.Push` 축출 카운트(로그 추가는 표현 쪽, 승인 뒤) | 이름표 겹침 장면(L2) 설계 |
| 1-1 보스 드롭 3개의 등급 | 10판 | 48.7% 검증 |

---

## 6. ⑥ 매뉴얼 11 수치·문구 제안

| # | 매뉴얼 11 위치 | 제안 | 근거 | 상태 |
|---|---|---|---|---|
| 6-1 | §3 앞에 **§3.0 "드롭 리듬 기준표"** 신설 | §5.1 표를 그대로 넣고, "1-1 한 판 기대: 장비 0.45N, 희귀+ 0.0585N, 전설 0.0045N + 보스 48.7%"를 적는다. N은 Mac 측정 뒤 채움 | [코드]+계산 | N 미검증 |
| 6-2 | §2 디렉션 원칙 12 | "**보스는 보장한다**: 장보스 3개 전부 희귀 이상, 챕터보스 첫 드롭 전설 — 연출은 이 보장을 **보이게**(보스 드롭 3개 부채꼴 + 전설 기둥 1.0초 강조)" | PoE2 0.1.0c 보장 규칙과 같은 구조, 우리 Core는 이미 보장 | [사실]+[코드] |
| 6-3 | §3.2 라벨 표시 조건 | "**드롭 직후 3초 자동 표시**(희귀 이상, 표시 키 없이) → 이후 기본 집합" 추가. 값 3초는 [제안](D4 2차 '10초'는 공식 아님) | S-D7, codex [P5] | [추정] |
| 6-4 | §3.2 줍기 반경 행 | "**장비 자동 줍기 없음**(5게임 공통). 자동 줍기는 화폐·재료 전용이며 Core에 화폐·재료 드롭이 생길 때 반경을 정한다(참고: D3 기본 ≈3야드)" | S-D14, S-L6, S-G4 | [사실] |
| 6-5 | §3.2 신호 층 분리 행 | 4층(이름표·기둥·소리·툴팁)에 **⑤ 지도 아이콘 층** 추가(PoE MinimapIcon 크기 0~2, LE 1.4 독립 조절). 미니맵이 생기기 전까지는 "후속" | codex [P6][L2] | [사실] |
| 6-6 | §3.2 줍기 행 | "줍기 연출: 아이콘이 플레이어 쪽으로 0.2초 날아들고 등급색 섬광 1프레임" [제안]. 화면 안 R 줍기(거리 무관)는 Core 유지 | §2.2 해석 | [추정] |
| 6-7 | §3.3 툴팁 | "티어 표기 방향 통일: 어픽스 `tier` 0~4는 **T5~T1(1이 최상)으로 표시**하거나 '하/중/상옵' 글자로. 유물 품질 표기(1=최상)와 같은 방향" | L-15, PoE 혼동 사례 | [추정] |
| 6-8 | §3.1 등급 색 | D11-8 대안에 근거 추가: "적 엘리트 색(`EliteTables`)이 아이템 희귀·전설 색과 같다. 등급 색을 바꾸든 엘리트 색을 바꾸든 **한쪽은 바뀌어야** 한다" | L-09 | [코드] |
| 6-9 | §6 합격 기준 | L11 추가: "**1-1 보스 처치 장면에서 드롭 3개의 등급이 색·기둥 없이도(회색 캡처) 구별되고, 전설이 있으면 1x에서 먼저 눈에 든다**" | 6-2 | — |
| 6-10 | §8 결정 D11-12 | 답을 적는다: "`MinPickRarity`는 생성 필터(아이템이 안 생김). 표시 필터는 별도 기능. 즉시분해 보상 여부는 웹 oracle 대조 뒤" | L-05 | [코드] |

---

## 7. Core 제안(번호만, 수정 0)과 사용자 결정 항목

### Core 제안

| 번호 | 제안 | 이유 | 영향 |
|---|---|---|---|
| **LT-C1** | 화폐·재료 드롭(유골 부위·소켓석, IA §2.3)이 이식될 때 **자동 줍기 반경** 상수를 Core에 둔다(장비 제외) | 관례(D3 3야드·GD 1.2 반경) | WorldDrop 후속, 웹 oracle엔 없음 → 차이 기록 |
| **LT-C2** | 일반몹 연속 무드롭 k회 뒤 다음 처치 드롭 확정(k 제안 6 = 45% 기준 1.3% 꼬리 제거) | "첫 10분 무드롭" 체험 방지 | 웹 oracle과 **의도적 차이**. 사용자 결정 LT-D2 |
| **LT-C3** | `EliteTables.Col`(적 등급 색)을 Core 데이터에서 표현 표(`ItemRarityStyle`과 한 쌍)로 옮기고 아이템 등급 색과 **다른 팔레트**로 | L-09 색 충돌 | 전투 판정 무영향, 표시만 |

### 사용자 결정

| ID | 질문 | 추천 | 대안 |
|---|---|---|---|
| LT-D1 | 1-1 "첫 전설"을 보스 48.7%에 맡기나, 1-1 보스 첫 롤도 전설 확정으로(챕터보스 규칙 확장) 하나 | **현행 유지**(48.7% + 챕터보스 100%): 매 판 전설이면 가치 하락 | 1-1 한정 확정(데모 체험용, D4 베타 상향 사례) |
| LT-D2 | 일반몹 무드롭 보정(LT-C2) 도입 | 데모 v0는 **미도입**, 측정 N 뒤 재검토 | k=6 도입 |
| LT-D3 | LOCK 세트 A = tier 1(강철)로 두고 tier 0·2는 재질 변형(§3.3) | **채택** | tier 0을 LOCK으로 |
| LT-D4 | 염색·외형 변경(워드롭형) 범위 | **v0 밖**, 단 외형 키를 아이템과 분리(CH 6-3 A)해 둔다 | v0에 염색 1종 |
| LT-D5 | 영웅별 슬롯 가중(Smart Drop식) | 영웅 3 이상일 때 재논의 | 지금 도입 |

---

## 8. GD(디자인 바이블)·BH 레인에 넘기는 한 줄

- GD §6 "첫 전설 드롭" 목표 경험: **1-1 보스 처치 → 3개 부채꼴 → 전설 확률 48.7%, 전설이면 기둥·소리·이름표 3층이 동시에, 이름표에 전설 특수 효과 1줄**(지금은 효과 미연결 L-10). 챕터보스(1-4)에서 100%.
- BH 레인: 드롭 기둥은 화면 위쪽 1/3에서 알파 ≤.5(MANUAL 11 L4) — 탄막 가독성 판정표에 "바닥 드롭 20개 혼잡 장면" 1장 포함 요청.

---

## 9. 출처 (전부 검색 발췌, 열림 0 — 네트워크 정책. 원문 확인은 PC·Mac 세션)

| ID | 출처 | URL | 접속 |
|---|---|---|---|
| S-D1 | Blizzard, Season 4: Loot Reborn 안내 | https://news.blizzard.com/diablo4/24077223/ | 검색 발췌(DNS 차단) |
| S-D2 | mein-mmo, D4 시즌4 패치노트 "less loot, but stronger" | https://mein-mmo.de/en/diablo-4-season-4-patch-notes-show-what-gets-better-less-loot-but-stronger,1121161/ | 검색 발췌 |
| S-D3 | Yahoo/GamesRadar, "quality over quantity" | https://www.yahoo.com/entertainment/diablo-4-season-4s-loot-121121857.html | 검색 발췌 |
| S-D4 | Wowhead, Loot Reborn 개발 라이브스트림 요약 | https://www.wowhead.com/news=339150/diablo-4-season-4-loot-reborn-developer-update-livestream-summary | 검색 발췌 |
| S-D5 | Fextralife D4 Wiki, Wardrobe | https://diablo4.wiki.fextralife.com/Wardrobe | 검색 발췌(DNS 차단) |
| S-D6 | PC Invasion, D4 염색 | https://www.pcinvasion.com/?p=359503 | 검색 발췌 |
| S-D7 | 2차 가이드, D4 아이템 이름표 키·Push to Toggle | https://happindie.pages.dev/posts/how-to-hightlight-items-and-interactables-in-diablo-iv | 검색 발췌 |
| S-D8 | Blizzard D4 포럼, Hotkey to highlight loot | https://eu.forums.blizzard.com/en/d4/t/hotkey-to-highlight-loot/3624 | 검색 발췌 |
| S-D9 | Wowhead, 오픈 베타 전설 드롭률 상향 확인 | https://www.wowhead.com/diablo-4/es/news/increased-legendary-drop-rate-during-diablo-iv-beta-confirmed-332089 | 검색 발췌 |
| S-D10 | DiabloWiki, Loot 2.0 | https://di.diablowiki.net/Loot_2.0 | 검색 발췌(DNS 차단) |
| S-D11 | DiabloWiki, Smart Loot | https://di.diablowiki.net/Smart_loot | 검색 발췌 |
| S-D12 | DiabloWiki, Torment(T4) 전설 보너스 | https://di.diablowiki.net/T4 | 검색 발췌 |
| S-D13 | Blizzard D3 블로그, 토먼트·레벨 70 전설 | https://us.diablo3.com/blog/12383899 | 검색 발췌 |
| S-D14 | DiabloWiki Pickup Radius / Blizzard D3 포럼 2019 | https://di.diablowiki.net/Radius · https://us.forums.blizzard.com/en/d3/t/pickup-radius-items-2019/764 | 검색 발췌 |
| S-D15 | GameSpot, RoS 인터뷰(Loot 2.0 방향) | https://www.gamespot.com/articles/breathing-life-back-into-diablo-3-with-reaper-of-souls/1100-6417912/ | 검색 발췌 |
| S-P1 | PoE2 Wiki, Version 0.1.0c | https://www.poe2wiki.net/wiki/Version_0.1.0c | 검색 발췌(DNS 차단) |
| S-P2 | Sportskeeda, 0.1.0c "Unlucky drop protection" | https://sportskeeda.com/mmo/path-exile-2-poe2-patch-notes-0-1-0c | 검색 발췌 |
| S-P3 | GamesRadar, 0.1.0c 레어 몬스터·불운 보호 | https://www.gamesradar.com/games/action-rpg/path-of-exile-2-devs-know-the-action-rpg-is-not-rewarding-enough-so-a-patch-is-making-rare-monsters-less-stingy-and-introducing-unlucky-drop-protection-for-the-truly-unfortunate | 검색 발췌 |
| S-P4 | GGG 공식 포럼, 0.2.0g 패치노트 | https://www.pathofexile.com/forum/view-thread/3774647 | 검색 발췌(DNS 차단) |
| S-P5 | PoE2 Wiki, Version 0.2.0g | https://www.poe2wiki.net/wiki/Version_0.2.0g | 검색 발췌 |
| S-P6 | Mobalytics, 0.2.0g 정리 | https://mobalytics.gg/poe-2/guides/0-2-0-g-patch-notes | 검색 발췌 |
| S-P7 | devtrackers, GGG "Item changes in Path of Exile 2" | https://devtrackers.gg/pathofexile/p/e8b7a303-item-changes-in-path-of-exile-2 | 검색 발췌 |
| S-P8 | GameBanshee 3.1.2 패치노트 / GGG 포럼 Alt 티어 답변 | https://gamebanshee.com/k499f · https://www.pathofexile.com/forum/view-thread/3256342 | 검색 발췌 |
| S-P9 | PoE Wiki, Version 2.6.1 · MTX | https://poewiki.net/wiki/Version_2.6.1 · https://www.poewiki.net/wiki/MTX | 검색 발췌 |
| S-L1 | EHG 지원, Legendary Potential | https://support.lastepoch.com/hc/en-us/articles/46361924310555/ | 검색 발췌(DNS 차단) |
| S-L2 | Dot Esports, Circle of Fortune 랭크 보상 | https://dotesports.com/last-epoch/news/last-epoch-all-circle-of-fortune-rank-rewards | 검색 발췌 |
| S-L3 | Maxroll, 유니크·세트 파밍(축복 16~22%) | https://maxroll.gg/last-epoch/resources/unique-and-set-item-farming | 검색 발췌 |
| S-L4 | Sportskeeda, LE 캐릭터 커스터마이즈(가시 슬롯 목록) | https://www.sportskeeda.com/mmo/does-last-epoch-character-customization | 검색 발췌 |
| S-L5 | LE 포럼, Last Bear set visuals | https://forum.lastepoch.com/t/last-bear-set-visuals/64274 | 검색 발췌 |
| S-L6 | LE 포럼, 조각 자동 줍기(개발사 입장) | https://forum.lastepoch.com/t/auto-pickup-shards/57535 · https://forum.lastepoch.com/t/auto-pickup-crafting-materials-like-gold/49022 | 검색 발췌 |
| S-G1 | Crate 포럼, Items Color and Rarity | https://forums.crateentertainment.com/t/items-color-and-rarity-full-explanation/35245 | 검색 발췌(DNS 차단) |
| S-G2 | Crate 포럼, Why did Grim Dawn change the usual ARPG item colors | https://forums.crateentertainment.com/t/why-did-grim-dawn-change-the-usual-arpg-item-colors/157478 | 검색 발췌 |
| S-G3 | Crate 포럼, Grim Dawn's Loot Filter | https://forums.crateentertainment.com/t/grim-dawns-loot-filter/132955 | 검색 발췌 |
| S-G4 | Crate 포럼, Version 1.1.4.0(자동 줍기 옵션) | https://forums.crateentertainment.com/t/grim-dawn-version-1-1-4-0/86026 | 검색 발췌 |
| S-G5 | GamingBolt, v1.2.0.0 드롭 테이블 개편·반경 | https://gamingbolt.com/?p=570301 | 검색 발췌 |
| S-G6 | Crate, Grim Misadventure #112 Illusionist / PC Gamer | https://forums.crateentertainment.com/t/grim-misadventure-112-a-new-you/37579 · https://pcgamer.com/grim-dawns-new-illusionist-npc-will-let-you-change-your-lookfor-a-price | 검색 발췌 |
| S-G7 | Crate 포럼, Item names on the ground | https://forums.crateentertainment.com/t/item-names-on-the-ground/45575 | 검색 발췌 |
| S-T1 | Torchlight Wiki, Item quality | https://torchlight.fandom.com/wiki/Item_quality | 검색 발췌(DNS 차단) |
| S-T2 | GameBanshee, Torchlight II 리뷰(12착용+펫 3, 등급 색) | https://gamebanshee.com/ayfk | 검색 발췌 |
| S-T3 | Giant Bomb, Torchlight II(세트 색) | https://giantbomb.com/wiki/Games/Torchlight_II | 검색 발췌 |
| S-T4 | Torchlight Wiki, Helmets (T2) 방어구 분류 | https://torchlight.fandom.com/wiki/Helmets_(T2) | 검색 발췌 |
| S-B1 | Twinfinite, BL3 등급·기둥 | https://twinfinite.net/guides/borderlands-3-tips-and-tricks-for-beginners/2/ | 검색 발췌 |
| S-B2 | Sportskeeda, BL4 등급(원작과 동일) | https://www.sportskeeda.com/mmo/all-gear-rarities-borderlands-4 | 검색 발췌 |
| S-B3 | Twinfinite, BL2 Effervescent 기둥 | https://twinfinite.net/guides/borderlands-2-rainbow-rarity-explained-how-to-get-it-what-it-means-more/ | 검색 발췌 |
| S-B4 | Shacknews, BL2 색약 모드(기둥 팔레트) | https://www.shacknews.com/article/82849/borderlands-2-recieving-a-colorblind-mode | 검색 발췌 |
| S-B5 | EGM, BL3 메이헴 드롭률 핫픽스 2건 | https://egmnow.com/borderlands-3-hotfix-adjusts-drop-rates-in-mayhem-mode/ · https://egmnow.com/borderlands-3-update-reduces-loot-drops-in-mayhem-mode/ | 검색 발췌 |
| S-B6 | GameSpot, BL3 핫픽스(전설 가중치) | https://www.gamespot.com/articles/borderlands-3-patch-notes-for-the-latest-hotfix/1100-6473009/ | 검색 발췌 |
| S-X1 | Game Developer, Defining Loot Tables in ARPG Game Design(5계산) | https://www.gamedeveloper.com/design/defining-loot-tables-in-arpg-game-design | 검색 발췌(DNS 차단) |
| codex | `codex_menus_loot.md` [D1~D11][P1~P9][L1~L11][H1~H8] | 같은 폴더 | 내부 열림 |
| 내부 | `Runtime/Core/WorldDrop.cs`·`ItemFactory.cs`·`DropTablesData.cs`·`EliteTables.cs`·`EnemyFactory.cs`·`Simulation.cs`·`Simulation.StartMobs.cs`·`SimulationState.cs`, `Runtime/NativeGame.WorldDrops.cs`·`NativeGame.cs`·`NativeGame.SettingsOptions.cs`·`NativeInventoryComparison.cs`, `docs/7아이템디자인/*`, `docs/2_7 인벤토리+장비시스템/*` | unity/main 2f8ef03 | 열림 |

---

## 10. 검증 상태 집계

| 상태 | 수 | 내용 |
|---|---|---|
| 열림(원문 확인) | 외부 0 / 내부 전부 | 외부 사이트는 네트워크 정책으로 전부 차단 |
| 검색 발췌 | 외부 출처 ID 48, URL 54 | §9 |
| [사실] 2곳 이상 | 등급 색 6게임, PoE2 0.1.0c·0.2.0g 규칙, D3 Smart Drop 85%, D4 Loot Reborn 방향·어픽스 수, D4 Alt·토글, 가시 슬롯 공통점, LE 필터, D3 줍기 반경 | — |
| [미확인] | **9**: D4 pity · D4 자동 줍기 반경 · PoE2 금화 자동 줍기 · D3 미니맵 별 · PoE 공식 가시 슬롯 목록 · TL2 외형 변경 · 바닥 이름표 업그레이드 화살표 사례 · GDC 루팅 강연 · `MinPickRarity` 즉시분해 보상(웹 oracle) | 본문 표기 |
| [추정] | 9(§1.2 4·§3.2 4·§2.2 1) | 본문 표기 |
| 미검증 수치 | **1-1 처치 수 N·분당 드롭**(§5.1·5.3) | Mac 측정 |
