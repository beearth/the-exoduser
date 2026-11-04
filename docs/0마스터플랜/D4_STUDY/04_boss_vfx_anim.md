# D4 연구 04 — 디아블로4 보스전·VFX·캐릭터 애니메이션 분석 (복제 아님, 공부)

- 레인: D4-4 (연구·문서만, 코드 변경 0). 작성 2026-11-04, 클라우드 CTO 배정.
- 목적: 디아블로4(이하 D4)가 보스전·VFX·애니메이션·캐릭터 가독성을 **무엇을 → 왜 → 어떻게** 했는지 공개 자료로 정리하고, 1-1 다크 드루이드(리깅 3D → 실시간 저해상도 픽셀 렌더)에 **같은 결과를 내는 우리 방법**으로 옮긴다. D4의 에셋·코드·수치는 가져오지 않는다. 레퍼런스 하나만 따르지 않는다는 CLAUDE.md §4.1에 따라, D4에서 배운 것은 이미 있는 노레위 기준(M1~M7)과 겹치는 부분만 규칙으로 올렸다.
- 범위 확대본(11-04 CTO): 캐릭터·몬스터·보스 동작 전반과 도구·방식 결정안은 [04_character_monster_boss_anim.md](04_character_monster_boss_anim.md).
- 선행 문서: `CLAUDE.md`, `docs/engine/UNITY_BOSS_BATTLE_BOARD_20261026.md`(§8.1 M1~M7, §8.5.4 봇 사망, §8.5.6.3 림 양면·회색 실루엣, LOCK v0.5 호박색 발광).
- 금지 지킴: 게임 파일·프레임 캡처 분석 0, 공개 자료만.

## 조사 범위와 한계 (먼저 읽기)

- 이 세션은 네트워크 정책 때문에 `news.blizzard.com`·`wowhead.com`·`icy-veins.com`·`diablofans.com`·`gamedeveloper.com` 원문 페이지를 직접 열지 못했다. **검색 엔진 결과의 요약과 인용 문장만으로** 사실을 맞췄다. 원문 전체를 읽은 것이 아니므로 아래 "확인한 사실"도 "검색 인용 기준"이다. 원문 열람이 되는 환경(PC·Mac)에서 출처 표의 ★ 표시 3건을 다시 읽어 인용을 확정하는 것이 남은 일이다.
- **D4 보스·애니메이션 전용 GDC 세션은 찾지 못했다.** 확인된 D4 관련 GDC 세션은 GDC 2024 Technical Artist Summit의 물 셰이더 발표(Aaron Aikman, "H2O in H3LL")뿐이다. 그래서 D4 보스의 프레임 수치(예비동작·발동·회복 비율)는 **공개 자료로 확인 불가**다. 이 문서는 그 빈칸을 D4 숫자로 채우지 않고 "미확인"으로 둔다.
- 같은 회사 전작의 공개 발표인 GDC 2013 "The VFX of Diablo"(Julian Love, 디아블로3)는 VFX 원칙의 뿌리로 참고했다. D4 사실과 섞지 않고 따로 표시한다.
- 표기: **[사실]** = 서로 다른 출처 2개 이상이 같은 내용. **[단일]** = 출처 1개. **[추정]** = 공개 자료가 없어 업계 관례·우리 판단으로 메운 것. **[반면교사]** = D4가 비판받은 부분(플레이어·언론 출처라 설계 의도가 아님).

---

## 0. 드루이드전에 바로 적용할 규칙 10개

Core 수치·판정은 바꾸지 않는다(CLAUDE.md §1). 아래에서 Core에 닿는 항목(⑤)은 **제안**이며 결정은 보스전 총괄·CTO가 한다. 나머지는 표현층(셰이더·VFX·UI·카메라·Animator) 규칙이다.

| # | 규칙 | 수치 | D4 근거 → 우리 문제 |
|---|---|---|---|
| ① | **시각 우선순위 3층.** 보스 예고 > 보스 본체 실루엣 > 플레이어 스킬 VFX. 보스 예고 범위 안에서는 플레이어 스킬 VFX의 가산 밝기를 줄인다 | 예고 영역 안 플레이어 VFX 알파 ×0.5 이하, 동시 예고 최대 2개(M4 유지) | D4는 "큰 폭발을 내면서도 화면을 읽히게" 하는 철학으로 강한 효과를 궁극기에만 둔다 [사실]. 반대로 출시 후 "보스 기술이 항상 시각 우선권을 가져야 한다"는 요구가 계속 나왔다 [반면교사] |
| ② | **예고는 바닥과 절대 같은 색·밝기가 아니다.** 예고 지면 표식 = 은백 테두리 선 + 진행형 채움. 독 VFX(황록)·보스 발광(호박색)·플레이어 화염색과 색상이 겹치지 않는다 | 테두리 1x 화면 2px, 휘도 Y ≥ 200(바닥 Y 70~80 대비 2.5배 이상). 채움 알파 0.15 → 0.45(예비동작 진행률에 비례). 테두리 색상은 바닥 평균 색과 색상환 60° 이상 떨어뜨린다 | 안다리엘 등 보스 공격이 "바닥과 똑같거나 플레이어 공격과 똑같아 보인다", "환경에 섞인다"는 비판 [반면교사, 2건] → 우리 아레나는 어둡게 깎인 바닥(§8.5.6.3 Y 7~11 과보정)이라 같은 위험이 크다 |
| ③ | **예고 길이는 피해 크기에 비례.** M1(큰 기술 ≥ 40f, 작은 기술 ≥ 24f)을 지키고, 한 번에 플레이어 최대 HP 50% 이상을 깎는 기술은 시각 예고 + 소리 예고 + 범위 표시 셋을 다 갖춘다 | 고피해 기술 예비동작 ≥ 60f, 소리 예고는 예비동작 시작 0~6f 안 | 릴리스(Echo of Lilith)의 원샷 패턴이 "어렵게 만들지 못해 인위적으로 어렵게 했다"는 비판 [반면교사]. 원샷은 "드물고 극도로 잘 예고될 때만" 공정하다는 플레이어 합의 [반면교사] |
| ④ | **큰 동작 뒤 빈틈을 눈으로 보이게.** M3(회복 ≥ max(예비동작, 60f))을 화면에서도 읽히게 한다. 회복 동안 보스 발광을 낮추고, 자세를 낮게 둔다 | 회복 구간 가슴·눈 호박색 발광 강도 ×0.5, 회복 앞 1/3 안에 머리 높이 −10% 이상 | D4 스태거 상태에서 보스는 "멈추고 공격을 멈춘다", 바 색이 노랑 → 하늘색으로 바뀌어 빈틈을 알린다 [사실] |
| ⑤ | **(제안·Core) 행동불능 직후 큰 기술 판정 금지.** 플레이어 기절·잡힘이 풀린 뒤 회피 1회를 쓸 시간이 지나기 전에는 보스 큰 기술의 판정이 시작되지 않는다 | 해제 뒤 ≥ 30f(약 0.5초) 동안 새 큰 기술 판정 0. 리모델 7기술 기준으로 하니스에서 확인 | §8.5.4 봇 사망: 잡기 회복 중 기절 → `bossSweep`에 사망. D4 회피는 기본 1회·쿨다운 5초라 회피를 쓴 직후 연속 위험이 치명적이다 [사실] → 우리도 "피할 수 없는 연속"은 디자인 실패로 본다. 옛 sweep 세트는 이미 리모델에서 빠졌으나, 리모델 grab 뒤에도 같은 조건을 하니스로 막는다 |
| ⑥ | **보스 HP바 = 목숨 경계 눈금 + 포이즈 바.** HP바에 목숨 비율 경계(1 / .6 / .4)를 눈금으로 미리 보이고, 바로 아래 얇은 포이즈 바를 둔다. 포이즈 붕괴 때 바 색이 바뀌고 90f 비틀거림(M7)과 함께 몸에서 형태 하나가 떨어진다(표현만) | 포이즈 바 높이 = HP바의 25%, 붕괴 시 은백 → 호박색 전환 0.2초. 형태 변화 1개(껍질 조각·뿔 끝 등, LOCK 대조) | D4: HP바 아래 노란 스태거 바, CC가 쌓이면 채워짐, 가득 차면 보스가 쓰러지고 추가 피해 [사실]. 보스마다 스태거 때 정해진 부상(아샤바 팔날 파괴 → 휩쓸기 범위 축소) [사실]. 안다리엘 HP바 4구간·듀리엘 2구간 [단일] |
| ⑦ | **큰 형태가 먼저, 디테일은 줄인다.** 1x 게임 시점에서 보스 덩어리의 평균 휘도가 바닥과 분명히 다르다. 재질은 껍질·뼈·천 세 단계 휘도로 나눈다 | 보스 실루엣 평균 Y − 바닥 평균 Y ≥ 25(Mac 1x 캡처 실측). 재질 3단 휘도 간격 ≥ 15. 실루엣 높이 = 영웅 ×2.8 / ×2.38(설계값, `rawAlphaHeightPx` 실측) | D4 아트 디렉터: 디테일은 고정 시점 카메라에 맞춰 조정했고, 갑옷은 큰 형태를 선호하며 가독성을 해치는 것은 줄인다 [사실]. 금속·가죽·천은 카메라에서 잘 읽힌다 [단일] → 우리 P1·P2 "거의 검은 실루엣"(§8.5.4 #8 FAIL) |
| ⑧ | **림은 앞면·윤곽에만, 몸 전체를 칠하지 않는다.** 시선 림은 `N·V`를 앞면 법선으로만 계산하고(양면 카드 뒷면 제외), 화면 위쪽·키라이트 반대 가장자리 띠로 제한한다 | 림 폭 ≤ 픽셀 렌더 텍셀 1개, 강도 ≤ 0.35, 색 = 차가운 은빛(실버 헬). 보스 화면 면적 중 림이 차지하는 비율 ≤ 8% | D4는 물리 기반 조명을 규칙으로 쓰되 가독성을 위해 규칙을 깬다고 말한다 [사실]. 등 뒤에서 피부를 통과하는 빛(릴리스 날개)을 따로 다뤘다 [단일] → §8.5.6.3 "P1 껍질 은색 유령"(양면 깃털 뒷면 림) 결함의 해법 |
| ⑨ | **기술의 빛이 아레나를 밝힌다.** 큰 기술 접점 순간에 점광원 하나를 켜서 바닥 범위가 빛으로도 보이게 한다 | 접점 점광원 6~10f, 반경 = 기술 판정 반경, 동시 2개 이하, 화면 비네트·안개 위로 먼 적을 지우지 않는다(카메라 LOCK) | D4: 엄격한 PBR이면 어두운 곳에서 무기 휘두름이 안 보여서, 많은 효과가 스스로 빛을 내 주변을 밝힌다 [사실] |
| ⑩ | **등장은 짧게, 카메라는 거리만.** 등장 연출 → 이름·HP바 → 첫 공격까지 정적 시간을 둔다. 피치 34°는 그대로, 거리만 보스전 줌(0.90 승인)으로 0.6초 전환 | 등장 ≤ 240f(4초), 스킵 가능. HP바 등장 뒤 첫 예비동작까지 ≥ 60f. 퇴장(침강)은 피격 판정 끝난 뒤 ≤ 180f | D4 아샤바는 덩치가 커 카메라를 멀리 뺐다 [사실]. D4 시네마틱은 게임 엔진 안에서 플레이어 캐릭터로 만든다 [사실]. 보스 등장·로딩·사망 연출의 "죽은 시간"을 플레이어가 재서 불만 [반면교사] |

---

## 1. 보스 설계

### 1.1 확인한 것

| 항목 | 무엇을 | 등급 | 출처 |
|---|---|---|---|
| 스태거 바 | 보스는 군중 제어(CC) 면역. 대신 CC가 맞을 때마다 HP바 아래 노란 바가 찬다. 강한 CC일수록 많이 찬다 | [사실] | S10, S11, S12 |
| 스태거 상태 | 바가 차면 보스가 쓰러지거나 멈추고 공격을 멈춘다. 바는 하늘색으로 바뀌어 시간이 지나며 빠지고, 다 빠지면 다시 공격. 이 동안 "CC 상태 적에게 주는 추가 피해"가 적용된다 | [사실] | S10, S11, S13 |
| 스태거 부상 | 보스마다 스태거 때 정해진 부상. BlizzCon 2019 아샤바: 팔날을 부수면 큰 휩쓸기 공격의 범위·면적이 줄어 위험 지역이 안전해진다 | [사실] | S10, S14, S15 |
| HP바 구간 | 안다리엘 HP바 4구간(구간마다 물약), 듀리엘 2구간 | [단일] | S16 |
| 페이즈 | 릴리스: 첫 HP바를 다 깎으면 2페이즈, 2페이즈는 아레나 바닥이 조각으로 무너지고 빈 곳에 서면 즉사 | [사실] | S17, S18 |
| 회피 | 모든 직업에 짧은 회피, 기본 1회·쿨다운 5초(장화로 횟수 추가) | [사실] | S19, S20 |
| 몬스터 철학 | 몬스터는 "가족" 단위로 설계하고 가족마다 전투 방식과 느낌이 다르다. 한 가족 안에서 각 개체가 다른 역할을 맡아 매 전투에 다른 판단을 요구 | [사실] | S21, S22 |

### 1.2 왜 그렇게 했나

- **CC 면역 + 스태거**: 보스가 CC에 묶여 아무것도 못 하면 보스전이 아니다. 그렇다고 CC 빌드를 무의미하게 만들 수도 없다. 그래서 CC를 "게이지 쌓기"로 바꿔 **보스는 계속 움직이되, 플레이어 행동이 쌓이면 정해진 빈틈이 온다**. [추정: 설계 의도 문장은 원문 미열람]
- **스태거 부상(아샤바 팔날)**: 빈틈이 보상으로 끝나지 않고 **이후 전투 형태를 바꾼다**. 플레이어가 "내가 저 보스를 바꿨다"는 감각을 받는다. [사실: 범위 축소, 의도는 추정]

### 1.3 비판받은 것 [반면교사]

| 문제 | 내용 | 출처 |
|---|---|---|
| 바닥에 섞이는 예고 | 안다리엘·Beast in the Ice의 공격이 환경에 섞이거나 거의 예고 없이 발동. 안다리엘 기술이 바닥이나 플레이어 공격과 똑같아 보인다 | S23, S24 |
| 대본식 대기 | 안다리엘·듀리엘 전투가 대본식 대기 시간으로 끊긴다. 플레이어는 더 분명한 예고와 더 나은 시각 대비를 원했다 | S23 |
| 아레나 가림 | 듀리엘 아레나에서 큰 벽이 아래 1/3을 가린다 | S25 |
| 원샷 | 릴리스의 원샷이 "인위적 난이도"라는 비판. 원샷은 드물고 극도로 잘 예고돼야 한다는 의견 | S18, S26, S27 |
| 시각 우선권 | "보스 기술은 항상 시각 우선권을 가져야 한다", 출시 첫날부터 나온 요구 | S28 |
| 죽은 시간 | 플레이어가 보스전의 등장 연출·로딩·사망 연출 시간을 재서 불만 | S29 |

### 1.4 우리 Unity에서 같은 결과를 내는 방법

| D4가 얻은 결과 | 우리 방법 | 연결 |
|---|---|---|
| CC 빌드도 보스전에서 의미 | 이미 있는 포이즈(`_poiseReset`, BX-05)를 HP바 아래 **포이즈 바**로 노출. Core 수치 무변경, UI만 | 규칙 ⑥ |
| 빈틈이 전투 형태를 바꿈 | 포이즈 붕괴 90f 때 몸의 형태 1개 탈락(LOCK 대조, 표현만). 기술 범위를 줄이는 것은 Core 변경이라 **이번 데모 v0에서는 표현만**, 범위 축소는 CTO 결정 | 규칙 ⑥ |
| 페이즈가 눈에 보임 | 목숨 전환(1→.6→.4)을 HP바 눈금으로 미리 보이고, 전환 때 무릎 꿇기·축소·침강(RB1-4)을 쓴다 | 규칙 ⑥ |
| (반면교사) 섞이는 예고 | 예고 표식 휘도·색상 규칙을 수치로 강제하고, Mac 1x 캡처에서 바닥과 같이 재서 판정 | 규칙 ② |
| (반면교사) 원샷 | 고피해 기술은 시각+소리+범위 3중 예고, 예비동작 ≥ 60f | 규칙 ③ |
| (반면교사) 피할 수 없는 연속 | 행동불능 해제 뒤 ≥ 30f 판정 금지(Core 제안) | 규칙 ⑤ |
| (반면교사) 죽은 시간 | 등장 ≤ 4초·스킵, 퇴장 ≤ 3초 | 규칙 ⑩ |

- **패턴 수**: D4 보스의 기술 수를 공개 자료로 셀 수 없었다(가이드마다 다르고 시즌마다 바뀜). 우리 리모델 7기술(§8.5.4)·약 44초 전투 길이 판단에 D4 숫자는 근거가 되지 못한다. **미확인**.
- **예고 시간·회피 창**: D4 공개 자료에 프레임 수치 없음. **미확인**. 우리 수치는 M1~M4(노레위 감각에서 정한 값)를 그대로 쓴다.

---

## 2. 애니메이션

### 2.1 확인한 것

| 항목 | 내용 | 등급 | 출처 |
|---|---|---|---|
| 전투 감각 | 전투는 "정성 들여 만든 애니메이션과 VFX" 덕에 묵직하게 느껴진다 | [사실] | S1, S2 |
| 히트 방향 | 피격 효과가 공격 방향을 따르고, 몬스터가 죽인 스킬에 따라 다르게 죽는다 | [사실] | S4, S5, S6 |
| 블렌딩·정지 동작 | 블렌딩과 "멈춤 애니메이션"을 둬서 디아블로3과 이동 감각이 다르다(아트 디렉터 존 뮬러) | [단일, 2차 재게시] | S30 |
| 애니메이션 디렉터 | 닉 칠라노(Nick Chilano) 크레딧, 게임플레이 애니메이션과 물리 기반 사망 | [단일] | S31 |
| 시네마틱 | 탑다운용 엔진이라 처음엔 카메라 컷·피사계심도 도구도 없었다. 시네마틱 애니메이션은 대부분(80~90%) 키프레임 | [단일] | S32 |

### 2.2 확인하지 못한 것

- 예비동작·발동·회복 프레임 비율, 애니메이션 캔슬 규칙, 루트 모션 사용 방식: **D4 공개 자료 없음(미확인)**.

### 2.3 우리 방법 (D4 사실 + 노레위 기준 M1~M7의 공통점)

| 결과 | 우리 방법 | 등급 |
|---|---|---|
| 무게 | M1(예비동작 ≥ 40f, 앞 1/3 안에 큰 자세 변화), M2(발동 12f 전 방향 고정), M3(회복 ≥ max(예비동작, 60f)) 유지. 127 내려찍기 재타이밍 **예비 48 / 발동 6 / 회복 70**(§8.5.1)은 비율 약 39% : 5% : 56%로, "짧은 발동·긴 회복"이라는 두 레퍼런스의 공통점과 맞다 | [추정: D4 비율 미확인, 노레위·업계 관례] |
| 부드러움 | M6: 클립 사이 크로스페이드 0.12~0.2초, Core 프레임이 정답이고 Animator는 재생 속도만 맞춘다. 루트 모션은 표시 보정만, Core 좌표 불변 | 기존 규칙 |
| 캔슬 | 보스는 발동 뒤 캔슬 없음(M2). D4의 플레이어 쪽 블렌딩·정지 동작은 우리 영웅 쪽 일이라 이 문서 범위 밖 | 기존 규칙 |
| 히트 리액션 | 보스 피격은 additive 흔들림만(경직 없음), 피격 스파크와 흔들림 방향을 **공격 방향**으로 기울인다. 히트스톱 4~6f(M7) | 규칙 ⑨ 보완. D4 히트 방향 [사실] |
| 사망 | 드루이드 최종 사망은 침강. 침강 시작 = 마지막 피격 판정 뒤 | 규칙 ⑩ |
| 픽셀 렌더 주의 | 저해상도 렌더에서는 작은 자세 변화가 1~2텍셀에 묻힌다. 예비동작의 자세 변화는 **실루엣 외곽이 4텍셀 이상** 움직이게 키를 잡는다(1x 캡처로 확인) | [추정] |

---

## 3. VFX

### 3.1 확인한 것

| 항목 | 내용 | 등급 | 출처 |
|---|---|---|---|
| 철학 | 리드 VFX 아티스트 대니얼 브릭스(2021-12 분기 업데이트): 큰 폭발과 눈에 띄는 스킬 효과를 내면서도 많은 플레이어·몬스터가 있어도 화면을 분명하게 | [사실] | S4, S5, S6 |
| 시각 우선순위 | 큰 효과는 궁극기 같은 강한 스킬에만, 약한 스킬은 배경으로 | [사실] | S5, S6 |
| 빛을 내는 효과 | 엄격한 PBR이면 어두운 곳에서 무기 휘두름이 안 보여서 많은 효과가 빛을 내 주변을 밝힌다. 일부 궁극기는 날씨·조명을 잠시 바꾼다 | [사실] | S5, S6 |
| 균형 | 게임플레이 명확성과 주제 몰입 사이의 균형 | [사실] | S5, S7 |
| 몬스터 표시 | 쉴드 어픽스 몬스터를 "더 시각적으로 두드러지게", 반사 어픽스를 "더 구별되게 + 반사 피해를 포물선 투사체로" 바꾼 패치 | [단일] | S33 |
| 피격 발광 끄기 | 적 피격 발광을 옵션으로 끌 수 있다. 플레이어·적·NPC·물체 외곽선 색을 고를 수 있다 | [사실] | S34, S35, S36 |
| (전작) 디아블로3 GDC 2013 | 효과의 핵심 일은 게임 규칙을 보여 주는 것. 어디서 오는지 알 수 있게, 게임을 방해하지 않게. 채도 낮은 효과는 복잡한 환경에서 읽기 어렵다 | [단일, 발표 노트] | S37, S38 |

### 3.2 왜

- 어두운 고딕 톤(PBR·그림자·볼류메트릭)을 지키면 화면이 어두워져 **정보가 사라진다**. D4는 톤을 포기하지 않고, **정보를 가진 효과만 빛을 내게** 해서 둘을 같이 얻었다. [사실 + 추정 연결]
- 어픽스 패치는 "규칙(쉴드·반사)이 있는데 화면에서 안 보이면 불공정"이라는 판단으로 읽힌다. **규칙이 있으면 표시가 있어야 한다.** [추정]

### 3.3 우리 단계표 (예고 → 접점 → 본체 → 잔여)

CLAUDE.md §6 VFX 설계물 형식. 수치는 표현층 제안이며 길이는 Core 기술 상태 길이를 따른다.

| 단계 | 언제 | 무엇이 보이나 | 밝기·색 규칙 | 밀도 |
|---|---|---|---|---|
| 예고 | 예비동작 0f ~ 발동 직전 | 지면 은백 테두리(2px) + 채움 알파 0.15 → 0.45, 보스 자세 변화, 소리 tell | 테두리 Y ≥ 200, 바닥과 색상 60° 이상. 호박색·황록 금지(보스 발광·독과 혼동) | 동시 예고 ≤ 2(M4) |
| 접점 | 발동 첫 1~3f | 짧은 섬광 + 점광원 1개(6~10f) | 화면에서 가장 밝은 순간은 여기 하나. Bloom 임계 넘는 흰 원판 금지(L9 D2 베이지 원판 교훈) | 점광원 동시 ≤ 2 |
| 본체 | 발동 판정 구간 | 판정 모양 그대로의 실체(흙·뿌리·독). **판정 원과 VFX 외곽 오차 ≤ 1텍셀** | 예고 테두리보다 한 단계 어둡게, 채도는 바닥보다 높게 | 화면 파티클 상한 [추정] 400개, 보스 몫 ≤ 60% |
| 잔여 | 판정 끝 ~ 회복 끝 | 연기·흙먼지·독 고임(남는 판정이 있으면 그 범위만) | 판정이 없는 잔여는 알파 ≤ 0.3, 0.5초 안에 사라짐. 판정이 남는 잔여는 독 VFX 황록 테두리 1.2px(H5-01 계약) | — |

- **플레이어 VFX와의 우선순위**: 보스 예고 영역 안의 플레이어 스킬 가산 효과는 알파 ×0.5 이하(규칙 ①). 우리 실버 헬 톤은 플레이어 효과가 이미 은·화염 계열이므로, 보스 예고에 은백을 쓰면 겹칠 위험이 있다. **판정 캡처에서 겹치면 예고 테두리를 차가운 청백(색상 200°대)으로 옮긴다**(디자인총괄 판정 대상). [추정]

---

## 4. 캐릭터 실루엣·재질 (드루이드 회색 실루엣 문제)

### 4.1 확인한 것

| 항목 | 내용 | 등급 | 출처 |
|---|---|---|---|
| 카메라 맞춤 디테일 | 디테일은 고정 시점 카메라에 맞춰 조정해 읽히게. 갑옷은 큰 형태를 선호, 가독성 해치는 것은 줄인다. 캐릭터 충실도와 디테일 균형은 게임 카메라에서 성립해야 한다 | [사실] | S2, S8, S9 |
| 재질 | PBR은 주로 재질·표면에 도움. 금속·가죽·천이 카메라에서 잘 읽힌다. PBR 규칙을 가끔 깨되 가독성과 보기 좋음이 최우선 | [사실] | S8, S9 |
| 옛 거장 회화 | 르네상스·중세·낭만주의 회화(제리코 「메두사호의 뗏목」, 렘브란트 금투구 병사)를 기준으로, 도구 규칙을 깨서 그 느낌에 맞췄다 | [사실] | S8, S39 |
| 어둠과 그림자 | 어두운 톤 = 하드웨어가 허락하는 만큼의 그림자. 볼류메트릭으로 공기 속 입자를 비춘다. HDR로 순수한 검정까지 재현. 어둠 마법이 빛을 빼앗는 "음의 광원"도 썼다 | [사실] | S3, S40, S41 |
| 투과광 | 빛이 뒤에서 피부를 통과하는 표현(릴리스 날개) | [단일] | S3 |

**주의**: D4가 캐릭터에 "림 라이트"를 쓴다는 공식 문장은 찾지 못했다. 외곽선 하이라이트는 **옵션(접근성)** 으로 있다(S34~S36). 즉 D4의 기본 가독성은 림이 아니라 **큰 형태 + 재질 분리 + 빛을 내는 효과 + 조명 설계**에서 온다고 읽는 것이 맞다. [사실 + 추정]

### 4.2 우리 문제와 대응

| 우리 결함(보드) | 원인 | D4에서 배운 것 | 우리 방법 |
|---|---|---|---|
| P1·P2 "거의 검은 실루엣", 두개골·뿔이 안 읽힘(§8.5.4 #8) | 아레나 바닥 Y 7~11로 과보정 + 보스 재질이 한 덩어리 | 큰 형태 우선, 재질이 카메라에서 읽혀야 한다 | 바닥 Y 70~80 복구(boss-fix-b) 뒤, 보스 평균 Y − 바닥 Y ≥ 25. 껍질·뼈·천 3단 휘도(간격 ≥ 15). 두개골·뿔은 가장 밝은 단 |
| P1 껍질 "은색 유령"(§8.5.6.3 ①) | 시선 림 `1-saturate(dot(n,view))`가 양면 깃털 카드 뒷면에서 몸 전체를 칠함 | PBR을 깨더라도 가독성을 위해 깨야 한다. 몸 전체를 칠하는 것은 가독성이 아니다 | 림은 앞면 법선만(`VFACE`/`IsFrontFace`로 뒷면 0), 강도 ≤ 0.35, 폭 ≤ 1텍셀, 보스 면적 중 ≤ 8% |
| 발광 | LOCK v0.5: 호박색 ≤ 0.5%, 플레이어 화염보다 한 단계 낮게 | D4: 정보가 있는 것만 빛난다 | 발광은 가슴 틈·창·랜턴 구슬·눈만 유지. 예비동작 때 +, 회복 때 ×0.5(규칙 ④)로 **발광 자체를 예고 정보로** 쓴다 |
| 픽셀 렌더에서 형태 뭉개짐 | 저해상도 RT에서 작은 형태가 사라짐 | 디테일은 카메라에 맞춰 줄인다 | 1x에서 4텍셀보다 작은 장식은 형태로 만들지 말고 색 면으로만. 두개골 실루엣 외곽은 어깨선 위로(머리 v2 PASS 유지) |
| 키 라이트 방향 | — | 옛 거장 회화의 한쪽 키 라이트·깊은 그림자 [추정 연결] | 보스방 키 라이트를 카메라 기준 앞-위-한쪽(30~45°)으로 두어 두개골·뿔 위쪽 면이 밝고 몸 아래가 어둡게. 림 대신 이 명암 단계가 먼저 |

---

## 5. 등장·퇴장·카메라

| 항목 | 내용 | 등급 | 출처 |
|---|---|---|---|
| 큰 보스 카메라 | 아샤바가 커서 카메라를 멀리 빼 모두가 싸우는 장면을 담았다 | [사실] | S14, S15 |
| 엔진 시네마틱 | 대부분의 이야기 컷신은 게임 모델로 엔진 안에서, 플레이어 캐릭터가 나온다 | [사실] | S42, S43 |
| 시네마틱 기법 | 높이를 속이려면 발을 숨긴다 | [단일] | S32 |
| 죽은 시간 | 등장 연출·로딩·사망 연출의 대기 시간이 불만 | [반면교사, 단일] | S29 |

### 우리 방법

- **카메라 LOCK 안에서만**: 피치 34° 유지, 보스전 줌은 거리만(18.3, 줌 0.90 승인), 0.6초 전환. D4가 큰 보스에서 카메라를 뺀 것과 같은 결과를 피치 변경 없이 얻는다.
- **등장(≤ 240f, 스킵 가능)**: ① 아레나 진입 → 카메라 거리 전환 0.6초 ② 드루이드 일어남(예비동작처럼 무게 있게, 실루엣이 처음 다 보이는 순간에 키 라이트) ③ 이름·HP바(목숨 눈금·포이즈 바) 표시 ④ ≥ 60f 정적 → 첫 예비동작. 플레이어 조작은 ③부터 가능.
- **퇴장(≤ 180f)**: 마지막 피격 판정 → 히트스톱 6f → 침강. 침강 중 피해 판정 0, 출구 표시는 침강 끝 직후.
- **"발을 숨겨 높이 속이기"는 쓰지 않는다**: 우리는 발밑 = Core 원(보드 §8.5.4 #2 발 접지)이 규칙이다. 시네마틱 기법과 게임플레이 판정은 섞지 않는다.

---

## 6. 우리 현재 결함 3개와 연결 요약

| 결함 | 규칙 | 담당(보드 기준) | 확인 방법 |
|---|---|---|---|
| 회색·검은 실루엣, 은색 유령 | ⑦ ⑧ (+④ 발광) | boss-fix-a(림 양면)·boss-fix-b(바닥 Y) | Mac 1x 캡처: 보스 평균 Y − 바닥 Y ≥ 25, 림 면적 ≤ 8%, 3x 점 0 |
| 예고 가독성 | ① ② ③ ⑨ | 보스전 총괄(RB1-3 예고 표현) | Mac 1x: 예고 테두리 Y ≥ 200, 플레이어 VFX와 겹친 10초 영상에서 예고가 끝까지 보임 |
| 봇 사망(기절 뒤 연속) | ⑤ (+③) | 보스전 총괄·CTO(Core 제안) | 하니스: 행동불능 해제 뒤 30f 안 큰 기술 판정 0회, 리모델 7기술 72판 |

---

## 7. 출처

검색일 2026-11-04. 날짜는 검색 결과에 표시된 발행 시점(연-월), "경"은 검색 결과의 경과 일수로 역산, "—"는 발행일 미확인. ★ = 원문 재열람 필요(인용 확정용).

| ID | 출처 | 날짜 | URL |
|---|---|---|---|
| S1 ★ | Blizzard, Diablo IV Quarterly Update — June 2021(캐릭터·몬스터 아트) | 2021-06 | https://news.blizzard.com/en-us/article/23665024/diablo-iv-quarterly-updatejune-2021 |
| S2 | God is a Geek, Development of Diablo IV update reveals character and monster art | 2021-07 | https://www.godisageek.com/2021/07/development-of-diablo-iv-update-reveals-character-and-monster-art/ |
| S3 ★ | Blizzard, Peeling Back the Varnish: The Graphics of Diablo IV | 2023-06 | https://news.blizzard.com/en-gb/article/23964183/peeling-back-the-varnish-the-graphics-of-diablo-iv |
| S4 ★ | Blizzard, Diablo IV Quarterly Update — December 2021(VFX, Daniel Briggs) | 2021-12 | https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021 |
| S5 | DiabloFans, Diablo IV Quarterly Update December 2021 | 2021-12 | https://www.diablofans.com/news/49863-diablo-iv-quarterly-update-december-2021 |
| S6 | Icy Veins 포럼, Quarterly Update December 2021 … Visual Effects | 2021-12 | https://www.icy-veins.com/forums/topic/63196-diablo-4-quarterly-update-december-2021-skill-ranks-affixes-legendary-affix-transfers-paragon-talents-visual-effects/ |
| S7 | Fextralife, Diablo IV Quarterly Update Focuses on Legendary Items and More | 2021-12 | https://fextralife.com/diablo-iv-quarterly-update-focuses-on-legendary-items-and-more/ |
| S8 | PCGamesN, "Diablo is the apex of dark fantasy in ARPGs"(John Mueller) | 2021 | https://www.pcgamesn.com/diablo-4/artwork-interview-john-mueller |
| S9 | GameSpot, Diablo 4's Art Direction Emphasizes Hand-Crafted Details … | 2021 | https://www.gamespot.com/articles/diablo-4s-art-direction-emphasizes-hand-crafted-details-plenty-of-customization-and-just-enough-realism/1100-6493411/ |
| S10 | Game Rant, Diablo 4: Staggering Explained | 2023 | https://gamerant.com/diablo-4-d4-staggering-explained/ |
| S11 | GINX, Diablo 4 Staggering System Explained | 2023 | https://www.ginx.tv/en/diablo-4/stagger-bar-bosses |
| S12 | Game8, How to Stagger Bosses | 2023 | https://game8.co/games/Diablo-4/archives/410475 |
| S13 | Blizzard 포럼, Question about boss staggering | 2023 | https://us.forums.blizzard.com/en/d4/t/question-about-boss-staggering/37882 |
| S14 | MMO-Champion, BlizzCon 2019 — Diablo IV Systems and Features | 2019-11 | https://www.mmo-champion.com/content/8828-BlizzCon-2019-Diablo-IV-Systems-and-Features |
| S15 | PureDiablo, Diablo 4 Systems and Features Panel BlizzCon 2019 | 2019-11 | https://www.purediablo.com/gameinfo/diablo-4-systems-and-features-panel-blizzcon-2019 |
| S16 | Icy Veins, Uber Andariel boss guide / GINX, Duriel boss guide | 2023~ | https://icy-veins.com/d4/guides/uber-andariel-boss-guide · https://www.ginx.tv/en/duriel-boss-guide-how-to-beat |
| S17 | Dexerto, Diablo 4 Lilith Boss Guide | 2023 | https://www.dexerto.com/diablo/diablo-4-lilith-boss-guide-how-to-beat-all-her-stages-2175157/ |
| S18 | TheGamer, How To Defeat Lilith | 2023 | https://www.thegamer.com/diablo-4-defeat-lilith-creator-of-sanctuary-boss-guide/ |
| S19 | Fextralife 위키, Evade | — | https://diablo4.wiki.fextralife.com/Evade |
| S20 | Sportskeeda, How to get more evade charges in Diablo 4 | — | https://sportskeeda.com/mmo/how-get-evade-charges-diablo-4 |
| S21 | Blizzard Watch, Diablo 4 monster families | 2020-02 | https://blizzardwatch.com/2020/02/26/diablo-4-monster-families/ |
| S22 | GamingBolt, inventory and action bar changes, monster families | 2020-02 | https://gamingbolt.com/diablo-4-inventory-and-action-bar-changes-monster-families-and-more-revealed |
| S23 | Icy Veins, Why Diablo 4's Tormented Lair Bosses Feel Off | — | https://www.icy-veins.com/d4/news/why-diablo-4s-tormented-lair-bosses-feel-off/ |
| S24 | Blizzard 포럼, Horrible boss fight design | 2023 | https://us.forums.blizzard.com/en/d4/t/horrible-boss-fight-design-spoilers/31099 |
| S25 | Blizzard 포럼, Duriel Boss design laughably bad | 2023 | https://us.forums.blizzard.com/en/d4/t/duriel-boss-design-laughably-bad/39278 |
| S26 | Dexerto, players can't stand "lazy" design of endgame boss | — | https://dexerto.com/diablo/diablo-4-players-cant-stand-lazy-design-of-endgame-boss-2540868 |
| S27 | Steam 토론, Diablo IV 보스 원샷 | — | https://steamcommunity.com/app/2344520/discussions/0/4335357901530523196 |
| S28 | Blizzard 포럼, Feedback: Improve Visual Clarity in Boss Fights | 2025-05경 | https://us.forums.blizzard.com/en/d4/t/feedback-improve-visual-clarity-in-boss-fights/220269 |
| S29 | Icy Veins, Diablo 4 Players Are Timing Boss Fights | 2025(시즌 8) | https://www.icy-veins.com/d4/news/diablo-4-players-are-timing-boss-fights-and-the-results-are-painful/ |
| S30 | NeoGAF(AusGamers 인터뷰 재게시), Blizzard Explains the Game's New Animation Technology | — | https://www.neogaf.com/threads/diablo-4-blizzard-explains-the-game%E2%80%99s-new-animation-technology.1513357/ |
| S31 | ArtStation Magazine, Diablo IV — Character, Animation, Technical Art, VFX Art Blast | 2023-07 | https://magazine.artstation.com/2023/07/blizzard-entertainment-diablo-iv-character-animation-technical-art-vfx-art-blast/ |
| S32 | Icy Veins, Behind Lilith's Performance: Blizzard Shows How Diablo 4's Cinematics Come Together | 2026-09경 | https://www.icy-veins.com/d4/news/behind-liliths-performance-blizzard-shows-how-diablo-4s-cinematics-come-together/ |
| S33 | Fextralife 위키, Patch Notes(Shielded·Reprisal 어픽스 표시 변경) | — | https://diablo4.wiki.fextralife.com/Patch_Notes |
| S34 | PC Gamer, You can turn off enemy glow in Diablo 4 | 2021-02 | https://www.pcgamer.com/you-can-turn-off-enemy-glow-in-diablo-4 |
| S35 | GINX, All Diablo 4 Accessibility Options Explained | 2023 | https://ginx.tv/en/diablo-4/accessibility-options |
| S36 | Blizzard, Diablo IV 접근성 소개 | 2023 | https://news.blizzard.com/diablo4/23954932 |
| S37 | GDC Vault, Technical Artist Bootcamp: The VFX of Diablo(Julian Love, 디아블로3) | 2013-03 | https://gdcvault.com/play/1017660/Technical-Artist-Bootcamp-The-VFX |
| S38 | JangaFX, Exploring and Modernizing The VFX Methods of Diablo 3 | — | https://jangafx.com/insights/diablo-3-vfx-experiments |
| S39 | GamesHub, Diablo 4 revives classical art for a new generation | 2023 | https://www.gameshub.com/news/features/diablo-4-art-director-interview-classical-art-for-a-new-generation-2623172/ |
| S40 | PureDiablo, The Graphics of Diablo 4 | 2023-06 | https://www.purediablo.com/the-graphics-of-diablo-4 |
| S41 | Graphics Programming weekly, Issue 291 | 2023-06-11 | https://www.jendrikillner.com/post/graphics-programming-weekly-issue-291/ |
| S42 | TheGamer, Cinematic Story Moments In Diablo 4 Will Feature Your Character | — | https://www.thegamer.com/diablo-4-cinematics-feature-in-game-character/ |
| S43 | PCGamesN, Diablo 4's rogue reveal trailer was rendered in the game engine | 2020 | https://www.pcgamesn.com/diablo-4/in-engine-cinematics |
| — | (참고, D4 보스 아님) GDC 2024 TA Summit "H2O in H3LL"(Aaron Aikman) | 2024-03 | https://schedule.gdconf.com/session/technical-artist-summit-h2o-in-h3ll-the-various-forms-of-water-in-diablo-iv/901730 |
| — | (원문 미확인) IGN 인터뷰 Wowhead 정리, Combat Design and Visuals, Information versus Immersion | 2022 | https://www.wowhead.com/diablo-4/news/diablo-iv-ign-interview-combat-design-and-visuals-information-versus-immersion-329803 |

## 8. 남은 일

1. 원문 열람 가능한 환경에서 ★ S1·S3·S4와 IGN 인터뷰 원문을 읽고 인용 문장을 확정한다(현재는 검색 인용 기준).
2. 규칙 ⑤(행동불능 해제 뒤 30f)는 Core 변경 제안이다. 보스전 총괄·CTO 결정 전까지 구현하지 않는다.
3. 규칙 ②·⑦·⑧의 휘도 수치는 Mac 1x 캡처 실측으로 확정한다. 지금 값은 바닥 목표 Y 70~80 기준의 시작값이다.
4. 화면 파티클 상한 400개는 추정값이다. Mac 실게임 프로파일 뒤 고친다.
