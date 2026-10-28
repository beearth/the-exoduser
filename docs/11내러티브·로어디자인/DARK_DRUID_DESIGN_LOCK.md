# 다크드루이드(1-1 si0 · 1-4 si3) 디자인 고정 — DESIGN LOCK v0.2

> 작성: 2026-10-28, 보스 3D 제작 세션(보스전 총괄 지시, 보스 보드 §8.3 ⓪). **디자인총괄 조건부 PASS(2026-10-28, 수정 1건 반영해 v0.2).** ① 시트 진행 가능.
> 목적: Unity 3D 리메이크(RM-B1·RM-B4)의 모델·시트·리깅·애니메이션이 모두 같은 인물을 만들도록 외형을 한 곳에 고정한다.
> 규칙(CLAUDE.md 작업물 퀄리티 7·8항): 같은 캐릭터는 모든 이미지에서 얼굴 문양·장신구·갑옷·머리가 동일하다. **점(잔점·점묘·디더링·반짝이 점)과 네온은 어디에도 없다.**

## 0. 결정 요약 (한눈에)

| # | 항목 | 결정 | 근거 |
|---|---|---|---|
| D1 | **지팡이 쥐는 법** | **한 손(캐릭터 왼손). 오른손은 비워 둔다** | §3 |
| D2 | 인물 | 늙은 숲지기. **사슴 두개골 가면** 아래로 늙은 남자의 아래 얼굴(턱수염·얇은 입)과 눈이 보인다 | §1, 메모 "악역도 매력적으로" |
| D3 | 얼굴 문양 | 가면 이마 정중앙 **"매듭 인장" 1개**(고리 + 뿌리 세 갈래). 그 외 얼굴 문양 없음 | §2 |
| D4 | 비율 | 머리 가면 기준 7.9등신, 정수리 2.20m / 뿔 끝 2.70m. **Meshy 인간형 리그 호환 설계**(손가락 뼈 없음) | §4 |
| D5 | 발광 | 두 군데뿐: 지팡이 랜턴, 가슴뼈 틈. **색상각 55~68°(병든 황록)**, 웹의 순연두(≈90°)는 쓰지 않는다 | §5 |
| D6 | 목숨별 몸 | 같은 모델 한 벌. 100/85/70%는 코드 스케일. 지팡이도 같이 스케일 | §7 |
| D7 | 키 값 | `height_meters` = **2.70**(뿔 끝 포함 바운딩 박스 기준) | §4, §9 |

## 1. 인물

- 정체(STY-D8): **노인.** 늙어 죽기가 두려워 마을 사람을 숲에 바치고 수명을 샀다. 숲(기생수)의 숲지기이며 새로 떨어진 자를 거름으로 거둔다. 부활할수록 몸이 줄어든다 = 빌린 수명이 빠져나가는 것.
- 한 장면에서 읽혀야 하는 것: **① 오래 산 노인 ② 숲과 이어진 몸 ③ 두려움이 아니라 확신(냉정·여유).** 괴물이 아니다. 점잖게 거두러 온 늙은 사제다.
- 악역도 매력적이어야 한다(사용자 확정 · 네메시아 리마스터 선례): **얼굴을 해골·갈라진 문양·노이즈로 뭉개지 않는다.** 악함은 눈빛·자세·소재(뼈·뿌리·깃털)·조명으로 낸다.
- 표정(시트 기본): 무표정에 가까운 차분함, 입 닫음, 눈은 정면. 컷별 표정은 전투 연출 쪽에서 별도 지정한다(시트에 표정 강한 이미지를 쓰지 않는다 — 표정 복제 사고 방지).
- 대사 근거(STY-12, 변경 없음): 등장 "새 거름이 떨어졌군." / 침강 "숲은 아직 배고프다. 둥지에서 보자." / si3 사망 "…죽기 싫었을 뿐이다."(si3 사망에서 인간 형체를 새로 보여 주지 않는다 — 몸이 뿌리 덩어리로 무너지는 연출, RM-B4).

## 2. 고정 사양 (모든 이미지·모델 동일)

### 2.1 머리·얼굴

| 항목 | 고정값 | 프롬프트 문구 |
|---|---|---|
| **가면** | 뼈색 **사슴 두개골 가면**이 이마~콧등을 덮는다. 눈구멍 2개, 코뼈는 길고 가늘다. 어두운 윤기 없는 뼈색(#b9ad90 계열), 표면에 가는 금과 이끼 한 줌(왼쪽 광대뼈 아래 1곳) | `weathered deer-skull mask covering forehead to nose bridge, dull aged bone, matte` |
| **얼굴 아래** | 마른 늙은 남자의 아래 얼굴: 각진 턱선, 깊은 볼, **얇게 다문 입**. 피부는 잿빛이 도는 창백한 올리브(얼룩·문양·흉터 없음) | `gaunt aged man's lower face, sharp jaw, thin closed lips, ashen pale skin, clean, no scars no marks` |
| **눈** | 가면 눈구멍 안, **좁고 차분한 눈**. 홍채는 탁한 올리브(색상각 ≈60°)로 아주 약하게만 빛난다. 눈꼬리가 처졌다 | `narrow calm eyes inside the mask sockets, dull olive irises, faint glow` |
| **수염** | 길고 가는 잿빛 흰 수염, 끝을 **뼈 고리 1개**로 묶음. 가슴 중앙까지 | `long thin ash-grey beard tied with one small bone ring` |
| **머리카락** | 가면 뒤에서 어깨까지 늘어진 **뻣뻣한 잿흑색 긴 머리**(가닥은 굵게 뭉쳐서, 잔 가닥·반짝임 없음) | `long lank ash-black hair in thick heavy strands` |
| **뿔(가지뿔)** | 가면 위에서 자란 **마른 나무 가지뿔 1벌**, 좌우 주가지 2개, 가지는 한쪽 5개 안팎. **가지 굵기 2cm 이상**(메시화 때 끊기지 않게). 폭 1.3m, 이마 위로 0.5m. 좌우 비대칭 가지 모양은 허용하되 이 LOCK 시트의 모양 그대로 고정한다. 이끼 늘어짐은 굵은 가닥 6개 이하 | `one set of dry bark-brown branching antlers, thick tines, span 1.3 m, at most six hanging moss strands` |
| **문양(문신 역할)** | **매듭 인장 1개**: 가면 **이마 정중앙**, 지름 4cm, **음각**(새긴 홈, 칠·발광 없음). 모양 = 닫힌 고리 하나를 **위에서 아래로 갈라지는 뿌리 세 갈래**가 관통. 의미 = 숲과 이어진 빌린 수명(RM-B4 "탯줄 매듭"과 같은 계열). **그 외 얼굴 문양 없음** | `one small carved knot-sigil at the mask forehead center: a ring pierced by a three-pronged root, engraved groove only, no glow, no other face marks` |
| 귀·귀걸이 | 없음(머리카락에 가림) | — |

### 2.2 몸·의상

| 항목 | 고정값 | 프롬프트 문구 |
|---|---|---|
| **어깨 덮개(망토)** | **깃털 망토.** 크고 납작한 **잎 모양 큰 깃털**(깃털 하나 6cm 이상, 청흑색 #1c2024에 청동 갈색 가장자리 #6b4a2a), 어깨 덮개에서 **종아리 중간까지** 내려온다(바닥에 닿지 않음, 바닥에서 25cm 이상 위). 앞은 열려 있고 뒷판은 하나로 늘어진다. 가시·톱니 견갑 금지 | `raven-feather mantle of large flat leaf-shaped feathers, blue-black with bronze-brown edges, ends mid-calf, open at the front, no spikes` |
| **가슴** | 앞이 열려 **갈비뼈가 보이는 마른 몸통**, 나무껍질 판이 갈비뼈 사이를 덮음. **가슴뼈 중앙에 손바닥 크기의 틈 1개**(약한 황록 발광, §5) | `bark-plated ribcage open at the front, one palm-sized sternum slit with faint sickly olive glow` |
| **허리** | 가죽 허리띠 + **작은 사슴 두개골 1개**(허리띠 정중앙) + 왼쪽 엉덩이에서 늘어진 **뼈구슬 사슬 3알** | `leather belt with one small deer skull at the center, bone-bead chain of three at the left hip` |
| **앞 자락** | 허리띠 아래 **어두운 천 앞자락 1장**(폭 22cm, 무릎까지). 위쪽에 얼굴과 **같은 매듭 인장**(음각 느낌 자수) 1개, 세로 룬 한 줄. 인장은 얼굴·앞자락 **두 곳뿐** | `dark cloth front panel to the knee with the same knot-sigil near the top and one vertical rune line` |
| **왼팔(지팡이 쪽)** | 넓은 소매가 손목까지, 아래팔에 **나무껍질 보호대** | `left arm in a wide sleeve to the wrist with a bark bracer` |
| **오른팔(빈 쪽)** | **소매 없음.** 숲에 먹힌 팔: 나무껍질결이 보이는 마른 맨팔, 갈라진 틈에 **발광 없음**(웹 초상화의 팔 위 초록 균열은 쓰지 않는다). 손은 **기다란 손가락이 한 덩어리로 붙은 갈고리 손**(§4) | `bare gaunt right arm with bark-grain skin, long clawed fingers fused into one curved mass, no glow` |
| **다리** | 무릎 아래 **나무껍질 정강이 보호대**, 신발은 **발톱 셋 달린 새 발 모양 장화**(발톱은 장화와 한 덩어리) | `bark-grain greaves, bird-claw boots with three toe claws fused into the boot` |
| **이끼** | 탁한 이끼(#36421f)를 어깨·정강이에 소량. 넓은 초록 면 금지 | `muted dull moss in small patches only` |
| **금속** | 사슬·고리뿐. 둔한 흑철, 하이라이트 중성(L-8). 동전·방울·금장식 없음(웹 초상화의 동전 장식은 점처럼 읽혀 제외) | `dull dark iron only, no coins, no gold` |

### 2.3 한눈에 구분되는 실루엣 3가지 (1x에서 읽혀야 함)

1. **가지뿔 + 사슴 두개골** 머리. 2. **종 모양으로 퍼진 깃털 망토.** 3. **한 손에 쥔 머리 큰 지팡이**(랜턴 불빛이 지팡이 끝에만).

## 3. 지팡이 — 한 손 (D1)

**결정: 한 손, 캐릭터 왼손.** 오른손은 항상 비어 있다.

| 이유 | 설명 |
|---|---|
| 웹 원본 일치 | `boss_dark_druid_8dir_v3.png`·`f0.png` 모두 왼손에 쥔 한 손 자세, FDG 본체 문서도 "왼손 지팡이" |
| 내려찍기 원형 | 승인-보스-1이 정한 원형 **127(Charged_Ground_Slam)은 한 손 기준.** 두 손이면 TM-A(예비 262f)를 다시 열어야 해서 추가 비용 |
| 빈 오른손의 쓸모 | 2번 기술 거름 거두기(잡기)의 "손 뻗는 동작"·가시 뿌리 줄기 시전에 쓴다. 갈고리 손이 서사(숲에 먹힌 팔)와 맞는다 |
| **127 좌우 반전** | 127(Charged_Ground_Slam) 원형은 높이 들어 내려치는 손이 **오른손**이다. LOCK은 지팡이를 **왼손**에 쥐므로 127을 붙일 때 **Humanoid 클립 Mirror(좌우 반전)를 켠다**(무료, 승인-보스-1 범위 안). 손질 단계에서 혼선이 없도록 여기에 고정한다 |
| 쥐는 방식 | 손가락 뼈가 없으므로 **왼손은 반쯤 말아 쥔 덩어리**로 모델링하고, 쥐기는 블렌드셰이프 `Fist_L` + 지팡이 소켓 `StaffSocket_L`로 한다(캐릭터 보드 §3-1 ⑤) |

### 3.1 지팡이 사양 (소품 시트 기준)

| 항목 | 고정값 |
|---|---|
| 전체 길이 | **2.30m**(정수리보다 길고 뿔 끝보다 짧음) |
| 쥐는 위치 | 끝에서 **0.85m**, 가죽 감개 20cm. 감개 위쪽에 **작은 새 두개골 1개**(지름 8cm) |
| 몸통 | 꼬인 나무뿌리, 지름 4cm, 어두운 껍질색 |
| 머리 | **뿌리 발톱 케이지**(높이 0.40m): 가는 뿌리 5~6가닥이 **랜턴 구슬**(지름 16cm, 황록 발광)을 감싸 쥔다. 구슬은 케이지 안쪽에 박혀 땅에 직접 닿지 않는다 |
| 밑동 | 뼈 마개를 씌운 뭉툭한 끝 |
| **내려찍기 접촉부** | 케이지 **아랫면**(뿌리 발톱). 구슬은 닿지 않음 |
| Core 대응 | RM-B1 §8.4 `TipX/TipY` = 몸 반지름 + 70은 **초기값**이다. 3D에서는 케이지 접촉점이 발동 첫 프레임에 이 점에 오도록 ④ 이후 손질한다(LOCK은 기하만 정한다) |
| 장식 | 매달린 동전·종·글자 없음. 늘어진 굵은 이끼 가닥 3개 이하 |

## 4. 비율과 리그 호환 (D4)

Meshy 인간형 리그(뼈 24개, **손가락 뼈 없음**)에 맞게 **형태 단계에서** 설계한다.

| 항목 | 값 |
|---|---|
| 정수리(가면 위) 높이 | **2.20m**. 뿔 끝까지 **2.70m**(= `height_meters`) |
| 등신 | 가면 높이 0.28m, 정수리까지 **7.9등신** |
| 어깨 폭 | 몸통 0.62m, 깃털 어깨 덮개 포함 0.90m |
| 팔 길이 | 선 자세에서 손끝이 허벅지 중간 |
| 자세(시트) | **A포즈**: 똑바로 서서 팔을 몸에서 40° 벌려 내림, 다리 어깨너비. **구부정함은 애니메이션이 만든다(모델은 곧게)** |
| 손 | 양손 모두 **손가락이 갈라지지 않은 한 덩어리**(왼손 = 반쯤 쥔 덩어리, 오른손 = 갈고리). 손가락 사이 틈 금지 |
| 다리 분리 | 망토 자락이 **두 다리 사이를 가리지 않는다.** 앞 자락(22cm)은 허벅지 사이 틈을 막지 않고 무릎 위에서 끝낸다 |
| 팔-몸통 간격 | A포즈에서 팔과 몸통 사이 최소 12cm, 손과 허벅지 사이 최소 10cm |
| 머리-어깨 | 뿔이 어깨·망토에 닿지 않는다. 목이 8cm 이상 보인다 |
| 발 | 장화 한 덩어리, 발톱은 길이 12cm 이하로 장화와 붙임 |
| 자유 뼈(Unity에서 추가) | 망토 뒷판 `Cloak_Back`(체인 4), 앞 자락 `Panel_Front`(체인 2), 수염 `Beard`(체인 2), 허리 사슬 `Chain_L`(체인 2), 지팡이 소켓 `StaffSocket_L`, 쥐기 블렌드셰이프 `Fist_L`. ③ 리깅에서는 이 부위가 몸에 가중되고 ⑤ 보정에서 전용 뼈로 재가중한다(전사 `CapeSpring` 선례) |

## 5. 색·재질·발광 (D5)

| 토큰 | 값 | 쓰는 곳 | 재질 |
|---|---|---|---|
| BONE | `#b9ad90` | 가면·허리 두개골·뼈구슬·지팡이 새 두개골 | 무광(거칠기 0.6~0.75), 광택 없음 |
| FEATHER | `#1c2024` + 가장자리 `#6b4a2a` | 망토 | 무광, 거칠기 0.8 |
| BARK | `#4a3826`(밝은 면 `#5c4733`) | 뿔·팔·정강이·지팡이 | 무광, 거칠기 0.85, 결은 세로 방향 큰 홈 |
| MOSS | `#36421f` | 이끼 | 탁함. 원색 초록 금지 |
| CLOTH | `#26211d`, 룬 `#6b4a2a` | 앞 자락 | 무광 |
| GLOW | **`#9ea83a`**(색상각 ≈65°, 병든 황록) | 지팡이 랜턴, 가슴뼈 틈, 눈 | 발광. 아래 규칙 |

- **발광은 두 곳 + 눈**: 랜턴(지름 16cm), 가슴뼈 틈(손바닥 크기), 눈(아주 약하게). 한 화면에서 발광 픽셀 합계 0.5% 이하(아트 바이블 V6). **색상각 55~68°, 75° 이상 금지**: 게임 독 VFX는 순녹색(88~120°)이라 보스 발광이 독 탄·독 장판과 겹치면 "피해야 하는 범위" 신호가 흐려진다(아트 바이블 V1 §6).
  - **웹 원본과 다른 점**: 웹 스프라이트의 발광은 순연두(≈90°)다. 3D에서는 위 색으로 바꾼다. 디자인총괄이 뒤집을 수 있다(§10 열린 질문 1).
- 금속은 하이라이트를 중성으로(L-8). 보스는 Hero Light 레이어를 쓰지 않는다(보스 보드 §8.3). 웅덩이 테두리 Fresnel `CharacterLit_PoolRim`은 쓴다.
- **재질에 새기는 디테일**(깔끔해도 디테일이 산다): 깃털은 하나하나 중심맥이 보이는 큰 형태, 뼈는 가는 금과 풍화, 껍질은 세로 홈. 점으로 읽히는 질감 대신 **선·면의 요철**로 낸다.

## 6. 금지 목록

| 금지 | 이유 |
|---|---|
| 점·잔점·점묘·디더링·반짝이 점·잔노이즈(머리카락·깃털·갑옷·피부 어디에도) | CLAUDE.md 8항. 생성 후 1x 확대로 확인 |
| 네온·형광·순녹색 발광(색상각 75° 이상) | 아트 바이블, 독 VFX와 겹침 |
| 얼굴을 해골·갈라진 문양·노이즈로 뭉개기, 가면 아래 얼굴 문양 추가 | 메모 "악역도 매력적으로" |
| 인장의 위치·모양 변경, 인장 3개 이상 | 문신처럼 같은 모양·같은 위치 |
| 가시·톱니 견갑, 비늘형 어깨 | 깃털 망토가 정본 |
| 동전·방울·금장식, 가는 늘어진 체인 다수 | 점처럼 읽히고 메시가 깨진다 |
| 손가락이 갈라진 손, 손가락 사이 틈 | Meshy 인간형 리그(손가락 뼈 없음) |
| 망토가 바닥에 끌림·두 다리 사이를 덮음 | 리깅 가중치 꼬임 |
| 두 손으로 지팡이 쥐기, 오른손에 무기 | D1 |
| 가는 가지(2cm 미만) 뿔·긴 가시 | 메시화 때 끊김 |

## 7. 목숨별·형태별 (같은 모델, 코드/셰이더로 변화)

| 목숨 | 몸 크기 | 외형 변화(모델은 한 벌, 아래는 코드·Timeline·머티리얼) |
|---|---|---|
| L1 숲지기 (100%) | 1.00 | 기본형 |
| L2 뿌리 각성 (85%) | 0.85 | 쓰러짐 연출에서 등에 **뿌리 3개가 꽂힌다**(별도 오브젝트, 견갑골 사이 소켓). 본체 메시 변경 없음 |
| L3 수명 소진 (70%) | 0.70 | 깃털이 일부 떨어진 듯한 머티리얼 오버레이("껍질이 벗겨짐"), 독액 수위는 맵 쪽 |
| L4 (RM-B4, 1-4) | 노인 = L3 몸의 55% | **심장 덩어리에 박힌 노인.** 얼굴·가면·인장·장신구·지팡이·옷은 이 LOCK 본체 그대로. 심장 덩어리는 RM-B4 별도 항목(인간 형체로 돌아가는 모습 금지, 얼굴을 뭉개지 않음) |

- 지팡이·장신구는 몸과 같이 스케일한다. 목숨마다 모델을 새로 만들지 않는다.

## 8. 시트 생성 사양 (① 단계용, 판정 통과 뒤에만)

경로·설정은 캐릭터 보드 §3-1 ①이 정본이다. 이 절은 드루이드에 쓸 **레퍼런스와 문구**만 정한다.

| 항목 | 값 |
|---|---|
| 서비스 | OpenAI `gpt-image-2.5-sunburst` `/v1/images/edits`, 1536×1024 high |
| 상한 | **6장 · 약 $0.36**(사용자 승인 [결정-보스-2]). 반려 2회면 멈춘다 |
| 계획 | S1 body 4뷰(정면·3/4·측면·뒤, 빈손 A포즈) / S2 머리 4뷰(가면·인장·눈·수염 확인) / S3 지팡이 소품 시트(정면·측면·머리 확대·밑동) / **S4~S6 = 재생성 여유**(필요할 때만) |
| 레퍼런스 | Image 1 = `assets/sprites/boss/boss_dark_druid_8dir_v3.png` 정면 셀(회색 #808080 배경으로 합성, **640×360 + 블러 5로 뭉개 구도만**) / Image 2 = `boss_dark_druid_portrait.png`에서 **얼굴·가면·수염 크롭**(표정은 문구로 중립 지정) / Image 3(지팡이 시트만) = 포트레이트의 지팡이 머리 크롭 |
| 배경·조명 | 회색 #808080, 평면 조명, 그림자·바닥·림라이트 없음. 직교, 뷰 사이 빈 회색 간격 |
| 공통 문구 | `Painterly realistic dark fantasy, Berserk ink density with FromSoftware material and form, muted dark palette, matte materials. Strictly NO speckles, NO dots, NO dithering, NO sparkle points, NO glints, NO noise grain, NO stippling anywhere.` (gen.py COMMON 그대로) |
| 소품 시트 | `Game prop design sheet, prop only, empty scene, nobody in the picture` 문구 사용. weapon/blade/gun 단어는 모더레이션에 걸리므로 쓰지 않는다 |
| 합격 기준 | §2 고정 사양과 일치(가면·인장 위치·수염 고리·뿔 모양·망토 길이·발광 색), 손가락 갈라짐 없음, 1x 확대에 점 없음, 뷰 사이 겹침 없음, **정수리 2.20m : 뿔 끝 2.70m 비율** |
| Meshy 입력 | 정면→측면→뒤 3뷰를 1024²로 분할(첫 장 = 정면). 시트 원본은 `E:/exoduser-wt/_out/unity-charsheet/dark_druid/` |

핵심 문구(body 시트, 영어 — 이미지 모델 입력용):

```
Character model sheet for building a 3D game model. The same single character shown four times side by side, left to right: FRONT, FRONT THREE-QUARTER, exact SIDE PROFILE facing right, BACK. Neutral A-pose, feet shoulder-width apart, arms held out and down about 40 degrees from the body, relaxed hands with fingers together, no fingers separated. Full body from antler tips to soles with margin.
Keep this character from Image 1 (body, cloak, staff-free) and the face/mask from Image 2, but with a calm neutral expression, mouth closed.
An aged forest-keeper: weathered deer-skull mask covering forehead to nose bridge with one small carved knot-sigil (a ring pierced by a three-pronged root) at the forehead center, gaunt aged man's lower face with thin closed lips, narrow calm eyes with faint dull olive glow, long ash-grey beard tied with one bone ring, long lank ash-black hair, one set of thick dry bark-brown branching antlers span 1.3 m.
Raven-feather mantle of large flat leaf-shaped feathers, blue-black with bronze-brown edges, ending mid-calf, open at the front, no spikes. Bark-plated open ribcage with one palm-sized sternum slit, faint sickly olive glow. Leather belt with one small deer skull and a chain of three bone beads at the left hip. Dark cloth front panel to the knee with the same knot-sigil. Left arm: wide sleeve and bark bracer. Right arm: bare gaunt bark-grain arm, long clawed fingers fused into one curved mass. Bark greaves, bird-claw boots with three toe claws fused into the boot. EMPTY HANDS: no staff, no weapon anywhere in this sheet.
```

## 9. 리깅 값 (③ 단계용)

| 항목 | 값 |
|---|---|
| 도구 | Meshy `POST /openapi/v1/rigging`, `input_task_id` = ② 작업 ID, 5cr 1회 |
| `height_meters` | **2.70**(뿔 끝 포함 바운딩 박스). ③ 호출 직전에 메시를 열어 실제 바운딩 박스 높이를 재서 다르면 그 값을 쓴다(재호출 금지이므로 호출 전에 확정) |
| 합격 | Humanoid 필수 뼈 17개 대응, 가중치 합 1, 발 접지, 망토·뿔 가중치 꼬임 없음 |
| 확인 항목(보스전 총괄 요청) | **뿔이 Head 뼈를 따라 움직이는지**(목 아래 뼈에 묶이지 않았는지) 가중치를 확인한다. 가지뿔 정점의 Head 가중치 합이 거의 1이어야 한다 |
| 이후 | Unity 임포트(④)는 이 세션 범위 밖. Humanoid 매핑·`Fist_L`·`StaffSocket_L`·`Cloak_Back` 추가는 ④⑤에서 |

## 10. 열린 질문 — 디자인총괄 판정 반영 (조건부 PASS, 2026-10-28)

1. **발광 색상각 — 확정 `#9ea83a`(≈65.5°)**: 웹 순연두(≈90°) 대신 쓴다. 범위 55~68°, 채도는 지금 수준 이하(더 올리면 금·황동으로 읽혀 "실버 헬 금 폐기" 원칙과 충돌). **70~74°로 올리지 않는다**: 독 VFX(88~120°)·회복의 영역 라임(VFX-D18, 사용자 지정색)과 둘 다 떨어지는 자리가 60~68°다. (v0.1의 `#a8a23a`는 실제 색상각 ≈57°라서 `#9ea83a`로 정정함)
2. **가면 + 아래 얼굴 노출 — PASS.** 두개골만 쓰면 괴물로 읽혀 서사(수명을 산 늙은 사제)가 사라진다. 수염 고리·얇은 입은 S2 머리 시트에서 1x로 확인한다.
3. **매듭 인장 — PASS.** 두 곳(가면 이마·앞자락), 음각, 발광 없음 그대로. **S2에서 인장 모양이 확정되면 그 크롭을 이 문서에 기준 이미지로 붙이고 이후 모든 시트·모델의 레퍼런스로 쓴다**(NEMESIA 문신 기준 이미지 방식). → §13 대기 항목.
4. ~~지팡이 3D 메시 예산~~ **해소(보스전 총괄 2026-10-28, 디자인총괄 동의 — 지팡이는 실루엣 3요소라 실제 메시 필수, 뿌리 케이지 5~6가닥 굵기 2cm 이상 유지)**: 지팡이는 **Unity 직접 모델링**(ProBuilder·절차 메시)이다. 소품 시트만 ①의 6장 안에서 만들고 지팡이용 Meshy 추가 생성은 하지 않는다(승인 범위 밖). 지팡이 끝 위치는 RM-B1 명세 `TipX/TipY`(몸 반지름 + 70)에 맞춘다.

## 11. 근거 문서

`assets/sprites/boss/boss_dark_druid_8dir_v3.png`(신체·망토·지팡이 구성) · `boss_dark_druid_portrait.png`(얼굴·가면·지팡이 머리) · `boss_dark_druid_f0.png` · `docs/engine/FDG_DARK_DRUID_BODY_20261011.md` · `docs/HELL_EXODUSER_WORLDVIEW_v2.md` · `CH1_STORY_SPINE_20261027.md`(STY-D7~D9) · `docs/engine/UNITY_BOSS_RM1_DARK_DRUID_20261027.md`(목숨별 몸 100/85/70%, 지팡이 끝 몸+70) · `UNITY_BOSS_RM4_FINAL_DARK_DRUID_20261028.md`(L4 융합 형태 요구) · `UNITY_BOSS_BATTLE_BOARD_20261026.md` §8.3·§8.5.1·§8.6 · `UNITY_CHARACTER_BOARD_20261027.md` §3-1 · `UNITY_ART_BIBLE_V1_20261026.md` §6 · `NEMESIA_DESIGN_LOCK.md`·`WARRIOR_DESIGN_LOCK.md`(형식·점 금지 규칙).

## 12. 기록

| 날짜 | 내용 |
|---|---|
| 2026-10-28 | v0.1 초안 작성(보스 3D 제작 세션). D1 한 손 결정. 디자인총괄 판정 대기 |
| 2026-10-28 | v0.1a: 보스전 총괄 보충 반영 — 127은 Humanoid Mirror(§3), 뿔 Head 가중치 확인(§9), 지팡이 Unity 직접 모델링(§10-4 해소). 디자인 사양 변경 없음 |
| 2026-10-28 | **v0.2: 디자인총괄 조건부 PASS 반영** — GLOW `#a8a23a`(실제 ≈57°) → `#9ea83a`(≈65.5°) 정정, §10 판정 기록. 재판정 불필요, 시트 결과물은 1x로 다시 본다. ① 시트 진행 가능 |

## 13. 시트 확정 뒤 붙일 기준 이미지 (대기)

- 매듭 인장 크롭(S2 확정 후), 얼굴·가면 크롭, 지팡이 머리 크롭. 확정되면 `assets/` 폴더에 두고 이후 시트·메시의 레퍼런스로 쓴다.
