# D4 연구 03 — 카메라·가림 처리·전투 가독성·피격 피드백 (2026-11-05, 레인 D4-3)

> 목적: 디아블로4(이하 D4)가 **무엇을, 왜, 어떻게** 만들었는지 공개 자료로 공부하고, 우리 Unity URP에서 **같은 결과**를 내는 방법을 정한다. 복제가 아니다. D4의 에셋·코드·수치를 그대로 가져오지 않고, 이 게임의 LOCK(1-1 원근 피치 34°, 먼 적이 보여야 함, 점 금지, 실버 헬 톤) 안에서 다시 설계한다.
> 범위: 연구·문서만. 코드·Core 수치 변경 없음.
> 자료 규칙: 공개 자료(공식 블로그·분기 업데이트·패치노트, 개발자 인터뷰, 신뢰할 만한 기사·가이드)만 썼다. 게임 파일·프레임 캡처 분석은 하지 않았다.
> **조사 한계(중요):** 이 세션의 네트워크 정책 때문에 원문 페이지 직접 열람(WebFetch)이 막혔다(news.blizzard.com·wowhead.com·gamingbolt.com 모두 DNS 차단). 모든 내용은 검색 엔진이 원문에서 뽑아 준 발췌로 확인했다. 원문 전문 대조는 "미확인"이다. 원문 확인이 필요한 항목은 §7에 적었다.

---

## 0. 우리 게임에 바로 적용할 규칙 10개 (수치 포함)

수치 출처 표기: **[D4 확인]** = D4 공개 자료에서 확인한 사실, **[D4 추정]** = 공개 자료로 확인되지 않은 D4 동작, **[우리 제안]** = D4 원칙을 우리 LOCK에 맞춰 정한 시작값(플레이테스트로 조정).

| # | 규칙 | 시작 수치 | 근거 |
|---|---|---|---|
| R1 | **피치는 고정, 줌은 거리만.** 보스 아레나·탈것·연출 줌은 피치 34°를 두고 카메라 거리만 바꾼다. | 기본 거리 ×1.00, 아레나 최대 ×1.20, 전환 0.6초 ease-in-out. 피치 변화 0° | [D4 확인] 고정 각도 카메라 + 시즌4 "Standard/Far" 두 단계 줌(거리만). [우리 제안] 배율 |
| R2 | **가림 1단계 = 가리는 물체를 연하게.** 카메라→플레이어 가슴 높이 구(球) 캐스트에 걸린 고목 줄기·수관·벽만 투명화. 땅·늪·다리는 대상 아님. | 캐스트 반경 0.6u, 목표 알파 0.30, 사라짐 0.15초, 돌아옴 0.30초, 해제 히스테리시스 0.2초 | [D4 추정] 환경 가림 처리 방식은 공식 공개 없음. [우리 제안] 수치 |
| R3 | **가림 2단계 = 완전히 가려지면 실루엣.** 플레이어가 가려진 부분만 단색 실루엣으로 그린다. 기본 켜짐, 옵션에서 색 변경. | 실루엣 알파 0.65, 색 = 실버 헬 강철 토큰, 가려진 비율과 무관하게 가려진 픽셀만 | [D4 확인] "Highlight Player When Obscured" 옵션 + 플레이어 하이라이트 색 설정 |
| R4 | **디더링 금지, 부드러운 알파로.** D4·타 게임에서 흔한 스크린도어(점 패턴) 컷아웃은 우리 "점 금지" 규칙 위반이다. 투명화는 깊이 선패스 + 알파 블렌드로, 원형 컷아웃을 쓰면 가장자리를 부드러운 그라디언트로 한다. | 컷아웃 반경 화면 높이의 9%, 가장자리 페더 35%, 3x 크롭에서 점 0개 | [우리 규칙] CLAUDE.md 4.2-7. 디더 방식은 [일반 기법](§2 참고) |
| R5 | **먼 적은 지우지 않는다.** 안개·비네트·어둠·투명화가 적 레이어를 덮지 않는다. 적은 안개 영향 상한을 둔다. 엘리트·보스는 나무 뒤에서도 실루엣(R3과 같은 방식, 적 전용 색). | 적 안개 감쇠 상한 25%, 엘리트·보스 가림 실루엣 알파 0.5 | [우리 LOCK] 카메라 LOCK(11-03). [D4 확인] 몬스터 하이라이트 색 옵션 존재 |
| R6 | **화려함의 위계.** 큰 소리·큰 빛·큰 화면 VFX는 궁극기·보스 대기술만. 기본 공격은 배경에 녹는다. 대신 모든 공격 VFX는 자체 발광을 가져 어두운 곳에서도 읽힌다. | 발광(HDR) 3단계: 기본 ≤1.5, 스킬 ≤3, 궁극기·보스 ≤6. 기본 공격은 화면 섬광 0 | [D4 확인] 2021-12 분기 업데이트(VFX): 시끄러운 FX는 궁극기 전용, 약한 스킬은 배경에 녹음, 발광 VFX로 어두운 곳 가독성 |
| R7 | **바닥 예고는 바닥과 반대색, 채움으로 시간 표시.** 빨강 바닥에 빨강 원을 쓰지 않는다. 외곽선은 처음부터 다 그리고, 안쪽 채움이 커지며 남은 시간을 보여 준다. | 예고 시간: 일반 0.6초, 엘리트 0.8초, 보스 대기술 1.0~1.2초. 외곽선 명도 대비 L* 차 ≥30 | [D4 확인] 공략: 보스 바닥 예고는 빨간 원, 우버 릴리트 1.2초 지연. [D4 확인] 플레이어 불만: "빨강 위 빨강" 가독성 문제. [우리 제안] 수치 |
| R8 | **타격은 방향을 가진다.** 피격 이펙트·튀는 방향·래그돌 힘은 공격 방향을 따른다. 광역·근접 판정은 한 프레임 한 번이 아니라 애니메이션에 맞춰 여러 프레임에 걸쳐 쓸고 지나간다(Core 판정 범위 안에서 표현만). | 피격 섬광 2프레임(≈33ms@60fps) 흰 은빛 틴트, 히트스톱: 일반 0, 강타·치명 45ms, 보스 그로기·처치 90ms | [D4 확인] 2021-12 업데이트: 공격 방향을 따르는 피격 이펙트, 애니메이션 데이터로 맞는 위치·래그돌 힘 계산, 여러 프레임 판정. [D4 추정] 히트스톱 수치는 공개 자료 없음 |
| R9 | **숫자는 종류별 색, 옵션으로 줄인다.** 일반·치명·특수(우리 기검참 등) 3계열 색, "특수 타격만 표시" 옵션. 원색 노랑 금지 → 실버 헬 토큰 안에서 명도·채도로 구분. | 일반 은백, 치명 = 밝은 황동빛 은(토큰), 특수 = 청은. 표시 0.8초, 치명은 1.3배 크기 | [D4 확인] 흰색 일반·노랑 치명·하늘색 오버파워·주황 치명 오버파워, "모든 피해 숫자 표시" 끄기 옵션 |
| R10 | **소리는 겹(레이어)과 매번 다른 변주.** 휘두름 → 타격(재질) → 몬스터 목소리(아픔·비명) → 고어. 매 재생마다 피치·볼륨 랜덤. 위험한 몬스터 소리는 중요도 시스템으로 믹스 위로 올린다. 부서지는 물체도 몬스터 처치만큼 시원하게. | 피치 ±6%, 볼륨 ±2dB, 위험 소리 우선순위 상위 8개만 덕킹 면제 | [D4 확인] 2021-10 분기 업데이트(사운드)·사운드 디자이너 인터뷰. [우리 제안] 수치 |

---

## 1. 카메라

### 1.1 무엇을

| 항목 | 내용 | 구분 |
|---|---|---|
| 시점 | 고정 각도의 원근 탑다운("아이소메트릭"이라 부르지만 원근 3D). 회전 없음 | 확인(출처 2개 이상: Blizzard 2021-06 업데이트 "isometric point of view", GDC 2024 Pink 강연 "90피트 위", Steam 토론 "fixed angles") |
| 피치·FOV 수치 | **공식 수치 없음.** Steam 커뮤니티에 "30°/60°"라는 주장 하나뿐(무엇을 잰 값인지 불명). 치트 테이블 커뮤니티가 FOV·수직각을 바꾸는 모드를 공개 → 엔진 안에 두 값이 따로 있다는 정황만 있음 | 추정 |
| 거리 | GDC 2024 강연 소개문에 "머리 위 90피트(≈27m) 아이소메트릭 카메라"라는 표현. 연출적 표현이라 정밀 측정치로 쓰면 안 됨 | 추정(출처 1개) |
| 줌 | 출시 때 1단계. 시즌4(2024-03 발표)에 "Standard / Far" 2단계 추가. PC 기본 Far, Steam Deck 기본 Standard, 콘솔도 두 옵션. "탈것 탔을 때 줌과 거의 같음"이라는 커뮤니티 증언. 퍼센트 수치는 공개 안 됨. 시야가 늘어 그리기 거리·성능 부담이 생겨 PTR에서 확인했다 | 확인(PCGamesN, Icy Veins, Blizzard 포럼 3개) |
| 탈것 | 말을 타면 카메라가 멀어진다(위 Far 비교 증언) | 확인(포럼 2개 증언) / 공식 수치 없음 |
| 실시간 시네마틱 | 컷신에서는 게임 카메라보다 훨씬 가까이 줌해 캐릭터를 보여 준다. 그래서 캐릭터 모델 품질을 근접에도 맞췄다 | 확인(2021-06 업데이트 Kotelnikoff 발언, GameSpot 기사) |
| 캐릭터 화면 점유 | D3보다 카메라가 영웅에 더 가깝고 영웅이 화면을 더 많이 차지한다 | 확인(GameSpot "Closer Look at Evil", 2021-06 업데이트) |
| 흔들림 | "Screen Shake Effects" 옵션으로 끌 수 있다. 일부 연출·큰 사건에서만 흔들림 | 확인(Gfinity, Game8 등 설정 가이드 2개 이상) / 진폭·길이 수치 없음 |
| 실내·실외 차이 | 공개된 카메라 수치 차이 없음. 던전은 "어둠으로의 회귀" 원칙으로 조명을 어둡게 하고, 가독성을 위해 디테일을 넣고 빼는 위치를 고른다(2022-03 환경 아트 업데이트) | 확인(조명 방침) / 카메라 수치 차이는 미확인 |

### 1.2 왜

- 프리프로덕션에서 여러 카메라를 시도했고(3인칭 포함) 결국 아이소메트릭이 "디아블로답다"고 판단했다(Matt McDaid, GamingBolt 보도). → **카메라를 먼저 고정하고 모든 아트를 그 카메라에 맞춘다.** 아트 디렉터 John Mueller: "디아블로의 모든 것은 아이소메트릭 시점에 봉사한다. 캐릭터 정밀도와 디테일 균형은 게임 카메라에서 통해야 한다."
- 시즌4 줌은 출시 뒤 "화면이 답답하다"는 플레이어 피드백 때문에 추가했다. 피치는 그대로 두고 거리만 늘렸다.

### 1.3 우리 Unity URP에서

- 1-1은 피치 34° LOCK(ForestA2, 거리 16.5u — `NativeRemodel3D.cs` `Pitch`·`DistU`, 7958690 기준). R1의 아레나 ×1.20은 16.5u → 19.8u. D4처럼 **카메라를 먼저 고정하고 아트를 거기에 맞추는 순서**가 우리 LOCK과 같다. 바꿀 것 없음.
- 줌은 `Cinemachine`(또는 기존 카메라 리그)의 거리 값만 보간한다. 피치·FOV는 상수로 잠근다. 보스 아레나 진입 때 거리 ×1.0→×1.2를 0.6초에 보간(R1).
- 흔들림은 `CinemachineImpulseSource`(또는 자체 오프셋)로 **위치 오프셋만**, 회전 흔들림은 쓰지 않는다(피치 LOCK 보호). 옵션 토글 필수. 시작값: 보스 내려찍기 진폭 0.12u·0.25초, 궁극기 0.08u·0.2초, 일반 타격 0.
- 시네마틱용 근접 카메라는 게임 카메라와 별개 카메라로 두고, 끝나면 게임 카메라로 0.4초 블렌드.

---

## 2. 가림 처리 (Occlusion)

### 2.1 무엇을 — D4에서 확인된 것

| 항목 | 내용 | 구분 |
|---|---|---|
| 플레이어 가림 실루엣 | 플레이어가 **완전히** 가려지면 플레이어가 고른 색의 실루엣으로 보인다. 설정 "Highlight Player When Obscured", 메뉴 Gameplay → Highlights | 확인(Blizzard 포럼 143175, 154897 + 설정 가이드 Mythic Drop·Icy Veins) |
| 플레이어 외곽선·색 | 평소에도 플레이어 하이라이트(외곽선) 색을 고를 수 있다. 플레이어들은 "외곽선이 너무 희미해 화면이 바쁘면 내 캐릭터를 못 찾는다", "두께도 조절하게 해 달라"고 요구 | 확인(포럼 2개) |
| 발밑 원 | 협동(카우치 코옵)에서 플레이어 발밑에 색 원이 있다. 특정 버프 중 원이 사라지면 캐릭터를 못 찾는다는 버그 보고 → 발밑 원이 위치 찾기의 핵심 장치라는 증거 | 확인(포럼 196962, 1개) |
| 몬스터 하이라이트 | 몬스터 하이라이트 색 설정이 있다. 엘리트 전용 외곽선 옵션은 확인 못 함 | 확인(설정 가이드) / 엘리트 전용은 미확인 |
| 완전 가림이 잦은 곳 | 월드 보스처럼 거대한 몸이 플레이어를 덮을 때 | 확인(포럼 1개) |

### 2.2 D4에서 공개 자료로 확인되지 않은 것

- 나무·벽·지붕을 **어떻게** 연하게 하는지(알파 페이드? 원형 컷아웃? 디더?)는 Blizzard가 공개한 기술 자료가 없다. 조사한 공식 분기 업데이트(2020-02 ~ 2022-03)·패치노트·레이트레이싱 공지(1.3.5, 2024-03) 어디에도 시각적 가림 처리 설명이 없다. 2021-10 업데이트의 "occlusion"은 **소리** 가림(실시간 오디오 오클루전)이다.
- 따라서 "D4는 디더로 나무를 뚫는다" 같은 말은 **추정**이다. 이 문서는 그런 주장을 근거로 쓰지 않는다.
- 일반 업계 기법(참고만): ① 트리거/레이에 걸린 물체의 머티리얼 불투명도 파라미터를 시간에 따라 낮춘다(디아블로식 벽 숨기기 — Unreal 포럼). ② 플레이어 화면 위치 둘레에 원형 구멍(스크린도어 점 패턴 가장자리). ③ D2는 연결된 벽 "체인" 단위로 숨겼다(D2 모드 커뮤니티 분석). ②의 점 패턴은 우리 "점 금지" 위반이라 쓰지 않는다.

### 2.3 왜

- D4의 선택(확인된 부분)은 **"환경을 지우기보다 플레이어를 드러낸다"** 쪽이다. 실루엣은 환경 구도(나무·건물의 무게감)를 해치지 않고 위치만 알려 준다. 플레이어 불만이 "실루엣이 완전 가림에서만 켜진다", "외곽선이 약하다"인 것을 보면, **부분 가림에서도 위치가 보여야 한다**는 것이 D4 출시 뒤 남은 숙제다. 우리는 처음부터 부분 가림까지 처리한다(R3: 가려진 픽셀만 실루엣).

### 2.4 우리 Unity URP에서 같은 결과를 내는 방법

1-1은 거대 고목 전경이 핵심 구도라 **고목을 통째로 지우면 장면이 무너진다.** 그래서 2단 구조로 한다.

**1단계 — 가리는 물체 페이드(R2)**
- 판정: 매 프레임 카메라 위치 → 플레이어 가슴(발밑 + 1.0u)으로 `Physics.SphereCastAll`(반경 0.6u), 레이어 `Occluder`만. 보스·엘리트가 화면 안 8u 이내면 그 대상에도 같은 캐스트(최대 3개).
- 대상: `Occluder` 레이어에 넣은 고목 줄기·수관·큰 바위·벽·지붕. **땅·다리·늪 수면·작은 소품은 넣지 않는다**(발밑 가독성 유지).
- 표현: 해당 렌더러에 `MaterialPropertyBlock`으로 `_Fade`(1→0.30) 보간. 셰이더는 URP Lit 기반 커스텀으로 ① 깊이 선패스(ZWrite On, ColorMask 0) ② 알파 블렌드 본패스. 선패스가 있어야 반투명 나무 안쪽 가지끼리 정렬이 깨지지 않는다.
- 시간: 사라짐 0.15초, 돌아옴 0.30초, 캐스트에서 빠진 뒤 0.2초 유예(깜빡임 방지).
- 대안(고목 수관이 너무 넓을 때): 셰이더에서 화면 공간 원형 컷아웃(플레이어 화면 위치 중심, 반경 = 화면 높이 9%, 가장자리 35% 부드러운 그라디언트, 최저 알파 0.30). **점 패턴 금지.**

**2단계 — 가림 실루엣(R3·R5)**
- URP `Renderer Feature`의 `Render Objects` 패스 2개: 대상 레이어(`Hero`, `EliteBoss`)를 Depth Test = Greater로 한 번 더 그려, 다른 물체 뒤에 있는 픽셀만 단색으로 칠한다. 이렇게 하면 부분 가림도 가려진 부분만 칠해진다.
- 색: 플레이어 = 실버 헬 강철 토큰(알파 0.65), 엘리트·보스 = 적 전용 토큰(알파 0.5). 일반 몬스터는 기본 끔(화면 소음 방지), 옵션.
- 픽셀풍 캐릭터(저해상도 실시간 렌더)는 저해상도 RT 단계에서 실루엣을 같이 그려 업스케일할 때 계단이 캐릭터와 같게 맞춘다.

**발밑 원**
- 플레이어 발밑 원(디칼 또는 Projector)은 `Occluder`보다 위에 그리고(ZTest Always, 플레이어 반경 안에서만) 어떤 버프·연출에서도 끄지 않는다. D4의 "버프 중 발밑 원이 사라짐" 버그를 반면교사로 삼는다.

**먼 적 보호(R5, 카메라 LOCK)**
- 안개: 적 레이어 셰이더에서 안개 계수를 `min(fog, 0.25)`로 상한. 비네트·어둠 후처리는 적 레이어를 마스크로 빼거나 강도를 화면 가장자리 15%까지만.
- 판정 캡처에 "고목 뒤 플레이어 + 먼 적 3마리 이상"이 한 장에 보이는 장면을 넣는다(CLAUDE.md 맵 관문 규칙).

---

## 3. 전투 가독성

### 3.1 무엇을·왜 (D4 확인 사실)

| 항목 | 내용 | 출처 |
|---|---|---|
| 정보 vs 몰입 | GM Rod Fergusson·게임 디렉터 Joe Shely가 "전장 정보와 몰입 사이의 균형"을 핵심 과제로 언급. "처치 시간(Time to kill)"이 전투 설계의 가장 중요한 지표 중 하나 | IGN 인터뷰(Wowhead 정리 329803). 원문 세부는 미확인 |
| 몬스터 설계 | 몬스터를 "가족(family)"과 "역할(archetype)"로 설계. 가족마다 전투 스타일·느낌이 다르고, 역할마다 전투에서 하는 일이 다르다. 예: 드라운드 무리형은 떼로 와서 광역기가 시원하게 느껴지도록 | 2020-02 분기 업데이트(RPG Site, Gematsu) |
| 2.5.0(시즌11, 2025-10) 개편 | "몬스터 행동이 너무 예측 가능했다" → 전투 중 반응·적응하도록. 몬스터마다 분명한 역할·정체성. 엘리트 어픽스는 디자인 겹침을 줄이고 **시각적 명료성 개선** | Blizzard 2.5.0 PTR 공지, Wccftech, Worthplaying |
| VFX 위계 | 시끄러운 FX는 궁극기 같은 강한 스킬에만, 약한 스킬은 배경에 녹게 | 2021-12 분기 업데이트(VFX), PureDiablo·DiabloFans 정리 |
| 어두운 곳 가독성 | PBR 조명에 환경광만 의존하면 특히 어두운 곳에서 무기 휘두름이 안 보인다. 그래서 많은 VFX가 발광(emissive)으로 주변을 비추고, 일부 궁극기는 잠시 날씨·조명을 바꾼다. 효과를 균일하게 키우는 대신 생성량·속도·발광·색 범위를 따로 조정 | 2021-12 업데이트 |
| 성장에 따른 강도 | 같은 스킬도 업그레이드·아이템이 쌓이면 시각 강도가 커진다 | 2021-12 업데이트 |
| 캐릭터 명도 | 콘셉트 색을 PBR 값으로 옮길 때 "기본 명도(value) 규칙"을 지켜 현실에 접지시킨다. 게임 카메라에서 "익숙한 실루엣"이 보여야 한다 | 2021-06 업데이트(Mueller), Massively OP |
| 환경 디테일 배치 | 가독성을 위해 디테일을 넣을 곳·뺄 곳을 고른다 | 2022-03 환경 아트 업데이트(Gematsu, Windows Central) |
| 바닥 예고 | 보스 바닥 예고는 빨간 원이 표준(그리고어 번개 원, 메피스토 혜성 낙하 지점). 우버 릴리트는 표식 3개가 1.2초 간격 뒤 터진다 | 공략 3개(Noobfeed, DiabloBytes, Skycoach) — 제3자 |
| 예고의 한계 | 플레이어: "빨강 위 빨강 위 빨강" 시각 소음, 빨간 바닥에 빨간 원. 일부 엘리트 어픽스(떨어지는 검)는 보스 공격보다 빠르고 센데 "위험 공격 예고"가 없다 → 예고 규칙이 적 종류마다 일관되지 않다 | Blizzard 포럼 243631 |
| 엘리트·체력 표시 | "몬스터 체력바 항상 표시" 옵션 권장 | 설정 가이드 |

### 3.2 우리 Unity URP에서

- **명도 3층(R6 확장):** 바닥(L* 15~35) < 적(L* 35~60, 채도 낮음) < 플레이어·탄·예고(L* 60~90 또는 강한 발광). 실버 헬 톤은 은빛 강철이라 플레이어가 밝은 쪽에 서기 쉽다. 적은 어둡고 채도 낮게, 위험한 탄만 높은 명도로.
- **바닥 예고(R7):** URP Decal Projector. 외곽선(두께 0.06u)은 시작부터 100%, 안쪽 채움이 0→100%로 커지며 남은 시간을 보여 준다. 터지기 직전 0.1초 섬광. 색은 바닥 색을 샘플해 반대편 명도로 자동 선택(늪 녹갈색 위에서는 밝은 은백, 밝은 다리 위에서는 짙은 적흑+밝은 외곽선). **같은 위험도는 적 종류와 무관하게 같은 예고 규칙**(D4 불만의 반면교사).
- **위험도 3단 예고:** 일반 0.6초 / 엘리트 0.8초 / 보스 대기술 1.0~1.2초. 보스 무브셋 수치는 보스 보드(`engine/UNITY_BOSS_BATTLE_BOARD_20261026.md`)가 정답이고, 이 표는 신규 설계의 시작값이다.
- **엘리트 표시:** 이름판 + 어픽스 아이콘(이모지 금지) + 발밑 얇은 고리(적 토큰). 보스는 화면 상단 체력바.
- **여러 프레임 판정 표현(R8):** 휘두르기 VFX의 쓸고 지나가는 각도를 애니메이션 커브로 두고, Core가 판정한 프레임에 맞춰 피격 이펙트를 순서대로 띄운다. Core 판정 자체는 바꾸지 않는다.

---

## 4. 피격 피드백

### 4.1 무엇을·왜 (D4 확인 사실)

| 항목 | 내용 | 구분 |
|---|---|---|
| 방향성 타격 | 피격 이펙트를 공격 방향(주문·근접)을 따라 흐르게 다시 만들었다. 애니메이션과 애니메이션되는 판정 영역 데이터로 몬스터의 가장 정확한 피격 위치를 찾고, 래그돌에 방향성 물리 힘을 준다 | 확인(2021-12 업데이트 + 정리 기사 2개) |
| 다중 프레임 판정 | 예전에는 광역·근접 스킬이 한 프레임에 한 번 판정. 이제 판정 영역을 여러 프레임에 걸쳐 애니메이션해 VFX와 맞춘다. 예: 회오리(Whirlwind)는 캐릭터와 함께 도는 부채꼴 판정 | 확인(2021-12 업데이트) |
| 래그돌 | 판정이 정확해져 몬스터 래그돌이 더 "날것"처럼(visceral) 반응 | 확인 |
| 피격 섬광 | "Combat Hit Flash" 토글, "Reduce Strobing" 토글이 있다 → 기본으로 피격 섬광이 있고, 끌 수 있다 | 확인(설정 가이드 2개 이상) / 길이 수치 없음 |
| 피해 숫자 | 흰색 = 일반, 노랑 = 치명(가이드마다 엇갈림), 하늘색/청록 = 오버파워, 주황 = 치명 오버파워(가장 드묾). "모든 피해 숫자 표시"를 끄면 특수 타격만 뜬다. 최신 "Combat Text"에서 종류별 표시 선택 | 확인(Beebom·Exputer·Alcasthq — 노랑·흰색 의미는 출처끼리 엇갈림) |
| 히트스톱 | **공개 수치 없음.** 인터뷰들은 "visceral", "grounded"(클로즈 베타 피드백 뒤 전투를 더 접지감 있게), D3의 매끄러운 전투 계승을 말할 뿐 정지 프레임 수는 공개 안 함 | 미확인 |
| 사운드 레이어 | 사운드 감독 Kris Giampa: "보람 있는 전투" 전통 유지, 깔끔하지만 펀치 있는 믹스가 플레이에 맞춰 변함. **오디오 중요도 시스템**으로 중요한 몬스터 소리가 튀어나오게 함. 부서지는 물체도 몬스터 처치만큼 시원하고 믿을 만해야 함. 몬스터 목소리는 마지막 레이어(공격 기합, 처치 시 비명). 고어는 양배추·멜론·마요네즈 녹음 | 확인(2021-10 업데이트 + DiabloFans·NME·Worthplaying 정리) |
| 매번 다른 소리 | 사운드 디자이너 Dan Christian: 모든 효과음을 재생할 때마다 피치·볼륨 등을 랜덤화. "때릴 때 소리가 디아블로 게임 감각의 큰 부분" | 확인(Screen Rant 인터뷰, 1개 + 2021-10 업데이트 정신과 일치) |
| 처치 연출 길이 | 공개 수치 없음. 래그돌 + 고어 + 비명 레이어로 구성된다는 것만 확인 | 미확인 |

### 4.2 우리 Unity URP에서

- **피격 섬광(R8):** 적 머티리얼에 `_HitFlash`(0~1) 프로퍼티, 맞은 순간 1 → 2프레임 유지 → 0.06초에 0. 색은 순백이 아닌 은백(실버 헬). 픽셀풍 렌더에서는 저해상도 RT 단계에서 적용해 점 잡티가 생기지 않게 한다. 옵션 "피격 섬광" 토글.
- **히트스톱(R8, 추정 기반 제안):** D4는 공개 수치가 없다. 핵앤슬래시라 다수 타격이 잦으므로 **일반 타격 0ms**(멈추면 리듬이 깨짐), 강타·치명 45ms(대상만 정지, 플레이어는 진행), 보스 그로기·처치 90ms(전역 타임스케일 0.05). 같은 프레임에 여러 적이 맞아도 히트스톱은 한 번만.
- **방향성 이펙트:** 피격 파티클 방향 = 공격자→피격자 벡터 + 무기 궤적 접선. 처치 때 래그돌(또는 픽셀 렌더용 사망 애니) 밀림 거리 0.4~1.2u(타격 세기 비례).
- **피해 숫자(R9):** TextMeshPro, Cinzel 숫자. 0.8초 동안 위로 0.6u 떠오르며 마지막 0.25초에 사라짐. 같은 적에 0.1초 안에 겹치면 합산 표시. 원색 노랑 금지 → 치명은 실버 헬 토큰의 밝은 황동빛 은, 특수(기검참 등)는 청은. 옵션: 전부 / 특수만 / 끔.
- **사운드(R10):** 레이어 순서 = 휘두름(공격자) → 타격(재질: 살·뼈·나무·금속) → 피격 목소리(30% 확률, 같은 적 0.5초 쿨다운) → 처치 시 고어+비명. 매 재생 피치 ±6%, 볼륨 ±2dB. Unity Audio Mixer에 "위험" 그룹을 두고 보스 예고음·엘리트 기합은 덕킹 면제(동시 8개 상한). 부서지는 물체(늪 나무·항아리)에도 같은 타격 레이어.
- **처치 연출 길이(제안):** 일반 0.4~0.7초(쓰러짐·래그돌), 엘리트 0.9초(+짧은 섬광), 보스 2~3초(슬로 90ms 히트스톱 → 0.5초 타임스케일 0.3 → 쓰러짐). 시체·잔해는 판정과 무관하게 남겨도 됨.

---

## 5. 만든 과정 (공개된 이야기)

| 시기 | 무엇 | 출처 |
|---|---|---|
| 프리프로덕션 | 3인칭 등 여러 카메라를 시도 → 아이소메트릭이 "디아블로답다"고 결정. 카메라를 고정한 뒤 모든 아트를 그 카메라 기준으로 만듦 | GamingBolt(Matt McDaid), 2021-06 업데이트(Mueller) |
| 2020-02 | 몬스터를 가족·역할로 나눠 전투 역할부터 설계. 첫 분기 업데이트에서 UI 설계·컨트롤러 지원도 공개 | RPG Site, Gematsu |
| 2021-06 | 캐릭터 아트: 콘셉트 색을 PBR 명도 규칙에 맞추는 과정, 게임 카메라 가독성이 최우선 | Blizzard 2021-06, Massively OP |
| 2021-10 | 사운드: 중요도 시스템, 랜덤화, 오디오 오클루전 | 2021-10 업데이트 |
| 2021-12 | VFX·판정: 방향성 피격, 다중 프레임 판정, 발광 VFX, 시끄러움 위계 — **새 엔진으로 프레임 단위 전투를 정밀하게 만든 결과** | 2021-12 업데이트 |
| 2022 클로즈 베타 | 피드백 뒤 전투를 "더 접지감 있게"(grounded) 조정 | PureDiablo(Shely·Fergusson 인터뷰 정리) |
| 2023 오픈 베타 | 베타 회고 공지로 피드백→변경 목록 공개 | Blizzard 오픈 베타 회고(원문 미열람) |
| 2024-03 시즌4 | 플레이어 피드백 → Far 줌 추가, 영구 반영 | PCGamesN, Icy Veins, Blizzard 포럼 |
| 2024-03 패치 1.3.5 | 레이트레이싱 그림자·반사, AO·접촉 그림자 개선 | The FPS Review, Blizzard |
| 2025-10 2.5.0 | "몬스터가 너무 예측 가능" → 전투 반응 개편, 어픽스 시각 명료성 개선 | Blizzard 2.5.0 PTR 공지 |
| 출시 후 상시 | 새 직업은 출시 뒤 여러 시즌 동안 "의도대로 되는가, 실제로 느낌이 좋은가"를 보고 계속 수정 | Maxroll 개발자 인터뷰 |

**배울 점:** D4도 처음부터 맞추지 못했다. 카메라 거리(시즌4), 몬스터 반응(2.5.0), 예고 일관성(포럼 불만 진행 중)은 출시 뒤에 고쳤다. 우리는 데모 v0 전에 ① 가림 2단계 ② 예고 일관 규칙 ③ 먼 적 보호를 먼저 넣어, D4가 출시 뒤에 받은 불만을 시작 단계에서 막는다. 수치는 모두 시작값이고 Mac 실게임 판정(10초 무음 영상·1x/3x 크롭)으로 조정한다.

---

## 6. 출처 (확인 날짜 2026-11-05, 모두 검색 발췌로 확인, 원문 직접 열람은 네트워크 차단)

| # | 출처 | 날짜 | URL |
|---|---|---|---|
| S1 | Blizzard, Diablo IV Quarterly Update — June 2021 (캐릭터 아트) | 2021-06 | https://news.blizzard.com/en-us/article/23665024/diablo-iv-quarterly-updatejune-2021 |
| S2 | Massively OP, quarterly update shines a light on character art | 2021-06-30 | https://massivelyop.com/2021/06/30/diablo-iv-quarterly-update-shines-a-light-on-character-art/ |
| S3 | GameSpot, Diablo 4 Wants You To Take A Closer Look At Evil | 2021 | https://gamespot.com/articles/diablo-4-wants-you-to-take-a-closer-look-at-evil/1100-6512547/ |
| S4 | Blizzard, Diablo IV Quarterly Update — December 2021 (VFX) | 2021-12-20 | https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021 |
| S5 | PureDiablo, Quarterly Dev update December 2021 | 2021-12 | https://www.purediablo.com/diablo-4-quarterly-dev-update |
| S6 | DiabloFans, Quarterly Update December 2021 | 2021-12 | https://www.diablofans.com/news/49863-diablo-iv-quarterly-update-december-2021 |
| S7 | DiabloFans, Quarterly Update October 2021 (사운드) | 2021-10 | https://www.diablofans.com/news/49640-diablo-iv-quarterly-update-october-2021 |
| S8 | NME, Developer diary explains the sound design of Diablo IV | 2021-10 | https://www.nme.com/news/gaming-news/developer-diary-explains-the-sound-design-of-diablo-iv-3065308 |
| S9 | Worthplaying, deep dive into sound design | 2021-10-07 | https://worthplaying.com/article/2021/10/7/news/128754-diablo-iv-gets-new-game-director-gives-us-a-deep-dive-into-sound-design-trailer/ |
| S10 | Screen Rant, Why Diablo 4 Sounds So Haunting (Dan Christian) | 2023 | https://screenrant.com/diablo-4-sound-music-interview/ |
| S11 | Gematsu, quarterly update details environmental art | 2022-03 | https://www.gematsu.com/2022/03/diablo-iv-quarterly-update-details-environmental-art |
| S12 | Windows Central, March 2022 quarterly update | 2022-03 | https://www.windowscentral.com/diablo-4-march-2022-quarterly-update |
| S13 | RPG Site, first Quarterly Update (UI·co-op·monster families) | 2020-02 | https://www.rpgsite.net/news/9492-diablo-iv-discusses-ui-design-coop-controller-support-and-cannibals-in-first-quarterly-update |
| S14 | Gematsu, quarterly update UI design, controller, co-op | 2020-02 | https://gematsu.com/2020/02/diablo-iv-quarterly-update-ui-design-controller-support-co-op-and-cannibal-tribes |
| S15 | PCGamesN, Season 4 camera distance | 2024-03 | https://www.pcgamesn.com/diablo-4/season-4-camera-distance |
| S16 | Icy Veins, New Zoomed Out View in Season 4 | 2024-03 | https://www.icy-veins.com/d4/news/blizzard-detail-new-zoomed-out-view-coming-in-diablo-4-season-4/ |
| S17 | Blizzard 포럼, Camera will now zoom out | 2024-03 | https://us.forums.blizzard.com/en/d4/t/camera-will-now-zoom-out/154838 |
| S18 | GamingBolt, Developers Once Considered Full Third-Person Camera | 2021 | https://gamingbolt.com/diablo-4-developers-once-considered-full-third-person-camera-view |
| S19 | GDC Vault, The View from Above: Designing Compelling Quests for Diablo IV (Harrison Pink) | 2024-03 | https://gdcvault.com/play/1034226/The-View-from-Above-Designing |
| S20 | Steam 토론, Not an "isometric" game (30°/60° 주장 — 미검증) | 2023 | https://steamcommunity.com/app/2344520/discussions/0/4629232694089269511/ |
| S21 | Blizzard 포럼, Player highlight needs improved | 2023~2024 | https://us.forums.blizzard.com/en/d4/t/player-highlight-needs-improved/143175 |
| S22 | Blizzard 포럼, Improve Character Outline | 2024 | https://us.forums.blizzard.com/en/d4/t/improve-character-outline/154897 |
| S23 | Blizzard 포럼, Undercity player outline circle disappears | 2024 | https://us.forums.blizzard.com/en/d4/t/undercity-accessibility-issue-player-outline-circle-disappears/196962 |
| S24 | Mythic Drop, Diablo 4 gameplay settings | 2023~ | https://mythicdrop.com/guide/diablo-4-gameplay-settings |
| S25 | Icy Veins, 7 Hidden Things You Should Do | 2023 | https://www.icy-veins.com/d4/news/how-to-make-diablo-4-even-better-7-hidden-things-you-should-do/ |
| S26 | Can I Play That?, Diablo IV accessibility review | 2023-07-18 | https://caniplaythat.com/2023/07/18/diablo-iv-accessibility-review/ |
| S27 | Gfinity, How to turn off screen shake | 2023 | https://www.gfinityesports.com/article/diablo-4-turn-off-screen-shake |
| S28 | MMOPIXEL, Season 13 Best Settings (Combat Text) | 2026-05 | https://www.mmopixel.com/news/diablo-4-season-13-best-settings |
| S29 | Beebom, Damage Colors Explained | 2023 | https://beebom.com/diablo-4-damage-colors-explained |
| S30 | Exputer, Overpower guide | 2023 | https://exputer.com/guides/diablo-4-overpower/ |
| S31 | AlcastHQ, why combat text has different colours | 2023 | https://alcasthq.com/diablo-4-why-does-combat-text-have-different-colours/ |
| S32 | Blizzard 포럼, falling swords dangerous attack telegraph | 2025 | https://us.forums.blizzard.com/en/d4/t/i-wish-those-falling-swords-had-the-dangerous-attack-telegraph/243631 |
| S33 | Noobfeed, Beat Tormented Grigoire | 2026 | https://www.noobfeed.com/articles/diablo-4-beat-tormented-grigoire |
| S34 | Skycoach, Mephisto Boss Guide | 2024~ | https://skycoach.gg/blog/diablo-4/articles/mephisto-guide |
| S35 | Instant-Carry, Season 3 Uber Bosses Guide (릴리트 1.2초) | 2024 | https://instant-carry.com/blog/diablo-iv-season-3-how-to-kill-all-uber-bosses-guide/ |
| S36 | Blizzard, The 2.5.0 PTR: What You Need to Know | 2025-10 | https://news.blizzard.com/en-us/article/24242857/the-2-5-0-ptr-what-you-need-to-know |
| S37 | Wccftech, PTR tests big core changes (monster combat) | 2025-10 | https://wccftech.com/diablo-iv-ptr-tests-big-core-changes-itemization-monster-combat-progression/ |
| S38 | Wowhead, IGN Interview — Combat Design and Visuals, Information versus Immersion | 2022 | https://www.wowhead.com/diablo-4/news/diablo-iv-ign-interview-combat-design-and-visuals-information-versus-immersion-329803 |
| S39 | PureDiablo, Diablo 4 Interview on Combat (grounded) | 2022 | https://www.purediablo.com/diablo-4-interview-on-combat |
| S40 | Maxroll, Diablo 4 Exclusive Developer Interview | 2024~ | https://maxroll.gg/d4/news/diablo-4-exclusive-developer-interview |
| S41 | The FPS Review, Ray Tracing and AO update (1.3.5) | 2024-03-26 | https://www.thefpsreview.com/2024/03/26/diablo-iv-adds-ray-tracing-and-updates-to-ambient-occlusion-contact-shadows/ |
| S42 | Unreal 포럼, Diablo Style Wall Hiding (일반 기법 참고) | — | https://forums.unrealengine.com/t/diablo-style-wall-hiding-in-blueprints/9697 |
| S43 | Phrozen Keep, D2 Wall Transparency (일반 기법 참고) | — | https://d2mods.info/forum/viewtopic.php?t=63795 |

## 7. 남은 일·미확인

- **원문 직접 열람:** S1·S4·S36·S38은 원문 전문을 다시 읽어 인용을 확인해야 한다(이번 세션은 해당 도메인 차단). 네트워크 허용 환경(Mac)에서 1회 대조.
- **D4 환경 가림 방식:** 공식 자료 없음. GDC Vault의 D4 렌더링·기술 아트 강연이 있으면 추가 조사(이번 검색에서는 퀘스트 강연 S19만 나옴).
- **히트스톱·처치 연출 수치:** 공개 자료 없음. R8·§4.2 수치는 우리 제안이며 Mac 실게임 판정으로 정한다.
- **적용 연결:** R2~R5는 Mac에서 진행 중인 가림 투명화 구현의 판정 기준으로 넘긴다. R7은 보스 보드, R9·R10은 UI·사운드 문서에 반영할 때 해당 SSOT에서 수치를 확정한다(이 문서는 연구 기록이며 SSOT가 아니다).
