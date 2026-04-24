# BOSS_00_FOREST_NORMAL_EYE_SENTINEL - 통합 기획서 v1.2

한국어 제목: 눈나무의 파수꾼
영어 제목: The Eye-Tree Sentinel
위치: si 0, 1장 썩은 숲, 1구역 일반 보스

문서 성격: 1-1 보스 단일 통합 바이블. 기획/비주얼/전투/애니/코드/BIC제출 전부 포함.
작성일: 2026-04-25
최종 수정: 2026-04-25 (v1.2 코드 실측 동기화)
작성자: Claude CTO + 심도진
기반 자료: BOSS_DESIGN_PRINCIPLES v1.0, BOSS_MASTER_SHEET v1.0, MASTER BIBLE v2.2, game.html 실제 코드
용도: 단일 문서로 GPT+Codex / Claude Code / Meshy 등 모든 파이프라인에 컨텍스트 전달

파일명 규약: BOSS_{si:2자리}_{CHAPTER}_{ROLE}_{NAME_EN}.md
  si=00~34, CHAPTER=FOREST/WORM/ICE/FLAME/LEGION/APOSTLE/CASTLE
  ROLE=NORMAL/MINI/CHAPTER/STORY/FINAL

===

## [SECTION 1] 보스 정체성

이름 한국어: 눈나무의 파수꾼
  ※ 코드 현재값: '숲의 감시자' — 코드 반영 시 이름 변경 필요
이름 영어: The Eye-Tree Sentinel
스테이지 인덱스: si 0
장: 1장 썩은 숲 (ROTTEN_FOREST)
역할: 1장 1구역 일반 보스
아키타입: A3 원거리 마법사형
난이도: 3 / 10
주 원소: 물리 (EL.P = 0)
  ※ 코드 실측: STG[0].be = EL.P (물리). 게임에 '독' 원소 없음 (EL = P/F/I/D/L/H/E 7종)
  ※ 독 컨셉은 VFX/비주얼로 표현 (독 안개, 독 장판 등), 원소 자체는 물리 유지
신성력 반응: 중
지옥 단수: 1단 (STG[0].hell = 0, 보장 부활 1회)
인게임 크기: r=22 (충돌 반지름), 렌더 크기는 아틀라스 스케일에 의존
  ※ 기획 의도: 96px 렌더로 시각적 존재감 확보 (코드 반영 시 렌더 스케일 조정)

학습 테마: 회피 + 부활 시스템 학습 (스테이지 1~5 구간, 첫 보스 특별 역할)
제작 티어: 독창 (당초 엘리트 분류였으나 BIC 쇼케이스 목적으로 승격)
우선순위: P0 (BIC 2026 필수)

한 문장 정의
  썩은 나무와 융합한 사도. 몸통이 수관이고, 수관 중앙에 거대한 단안이 박혀 있어 멀리서 감시한다. 이동은 땅속 뿌리 잠수로 이루어진다.

===

## [SECTION 2] 비주얼 정체성

실루엣 규칙
  - 인간 2배 크기
  - 수직 비대칭 실루엣
  - 상단 첨탑형 가시 나뭇가지 왕관 (뿔처럼 날카로움)
  - 왕관 중앙에 거대 단안, 지름 60cm 상당, 발광 녹색
  - 어깨와 가슴에 담쟁이 담요 (녹색)
  - 가슴 중앙에 해골 3개 박힘
  - 몸통은 검은 나무껍질 + 살점 혼합
  - 하반신은 두꺼운 뿌리 다발, 지면에 반쯤 박혀 있음
  - 팔 끝은 뿌리형 갈퀴

팔레트 (MASTER BIBLE 4.5 썩은 숲 기준 준수)
  - 기본 베이스: deep black-green (#0d1205)
  - 액센트: 썩은 이끼 (#4a7a1e)
  - 단안 발광: toxic poison green (#88ff44 근사치)
  - 독 수액 흐름: yellow-green (#ccff00 근사치)
  - 해골: bone white 살짝 녹색 틴트

아트 스타일
  - 베르세르크 미우라 켄타로 + FromSoftware Elden Ring 보스 디자인 혼합
  - 다크 고딕 판타지
  - 카라바조 명암법 (깊은 그림자 + 강한 림 라이트)
  - 핸드페인트 일러스트 톤

레퍼런스
  - 베르세르크 사도 변이체 (나무+인간 융합 계열)
  - Elden Ring Ancestor Spirit (거대 뿔 + 신성한 침묵)
  - Hollow Knight Watcher Knight (단안 공포감)
  - 부패한 숲의 정령 계열

절대 금지 비주얼
  - 붉은색 악마 뿔 (장 테마 충돌)
  - 전형적인 서양 판타지 언데드 스타일
  - 인간 얼굴이 드러남 (단안만 보여야 함)
  - 밝은 채도 (항상 어둡고 극적)

===

## [SECTION 3] 확보된 자산 인벤토리

2026-04-25 시점 확보 이미지

[A1] master_sheet_front_back_side.png
  - GPT 4o image 생성
  - 정면/후면/측면 3뷰 + 단안 클로즈업 + 후두부 샷
  - 용도: 캐릭터 바이블 메인, 트레일러 정면 일러스트, BIC 스크린샷, 스팀 키 아트

[A2] action_poses_6_front_view.png
  - GPT 4o image 생성
  - idle / burrow / emerge / entangle / miasma / hurt 6포즈
  - 뷰 각도: 정면 일러스트 뷰 (인게임 스프라이트로는 부적합)
  - 용도: 트레일러 오프닝, 아트북, 홍보 자료, 포스터

[A3] action_poses_6_isometric.png
  - 생성 예정 (GPT 4o image)
  - A2와 동일 6포즈, 아이소메트릭 3/4 탑다운 뷰
  - 카메라 각도: 45도 하향 + 45도 회전
  - 용도: 인게임 스프라이트 원본

자산 파일 경로 규약
  G:\hell\assets\concept\boss_01_eye_sentinel\master_sheet_3views.png
  G:\hell\assets\promo\boss_01_eye_sentinel\action_poses_front.png
  G:\hell\assets\sprites_src\boss_01_eye_sentinel\action_poses_iso.png
  G:\hell\assets\sprites\boss_01_eye_sentinel\pose_XX_NAME.png (개별 크롭본)
  G:\hell\img\bosses\boss_01_atlas.png (인게임 아틀라스)
  G:\hell\img\bosses\boss_01_atlas.json (프레임 매핑)

백업 규약
  로컬 이중: G: 드라이브 + 별도 외장 HDD
  클라우드: Google Drive 또는 OneDrive 자동 동기화
  원칙: 핵심 자산은 3곳에 존재

===

## [SECTION 4] 포즈별 상세 명세

6포즈 구성. 각 포즈는 인게임 애니 프레임으로 활용되거나 VFX 파티클과 조합된다.

[POSE 1] IDLE BREATHING
  설명: 뿌리 위에 서 있는 기본 대기 자세. 살짝 비대칭 스탠스. 팔 자연스럽게 옆으로 늘어뜨림.
  단안 상태: 반쯤 감김, 은은한 녹색 빛
  주변 VFX: 미세 포자 낙하, 뿌리 끝 흙먼지 미약
  프레임 수 (인게임): 4프레임 루프 (호흡 시뮬)
  재생 속도: 6 FPS
  인게임 사용: default state
  트레일러 사용: 보스 등장 후 홀드 컷 2초

[POSE 2] BURROWING DOWN
  설명: 땅으로 다이빙. 상반신 지면에 박히는 중. 흙 파편과 부러진 뿌리 공중에 뜸.
  단안 상태: 강렬한 녹색 플레어 (잠수 시 빛 방출)
  주변 VFX: 흙 파편 6-10개, 독 수액 방울, 잔뿌리 튕김
  프레임 수: 3프레임 단발 (빠른 전환)
  재생 속도: 12 FPS (급속)
  인게임 사용: jump 패턴 1단계 (땅속 잠수 개시)
  트레일러 사용: 역재생으로 임팩트 컷

[POSE 3] EMERGING UP
  설명: 땅을 뚫고 솟구쳐 등장. 팔 양옆으로 크게 벌림. 뿌리 사방으로 폭발적으로 확산.
  단안 상태: 완전 개안, 최대 발광 (포효 상태)
  주변 VFX: 흙 덩어리 20개 이상, 잔뿌리 15개, 포자 구름 확산
  프레임 수: 5프레임 (전개 과정)
  재생 속도: 10 FPS
  인게임 사용: jump 패턴 2단계 (재등장), 보스 첫 등장 시네마틱
  트레일러 사용: 오프닝 3초 슬로모션 + 네임카드 타이밍

[POSE 4] ROOT ENTANGLE CAST
  설명: 양팔 전방으로 뻗음. 손바닥 아래 방향. 지면에서 검은 가시 뿌리 폭발적으로 솟구침.
  단안 상태: 집중된 발광, 전방 응시
  주변 VFX: 가시 뿌리 4-6개 (각 길이 150cm 상당), 독 방울
  프레임 수: 4프레임 (차징 2 + 발동 2)
  재생 속도: 8 FPS
  인게임 사용: grab + poisonTrail 복합 패턴 (인탱글 + 독 장판)
  트레일러 사용: 플레이어 위협 고조 컷

[POSE 5] POISON MIASMA
  설명: 몸을 살짝 뒤로 기울임. 팔 위로 살짝 들어올림. 단안에서 독 수액이 대량 분출되어 안개로 변함.
  단안 상태: 최대 개안, 수액 대량 분출
  주변 VFX: 녹색 독 안개 구름 (캐릭터 높이의 1.5배), 독 웅덩이 지면에 형성
  프레임 수: 5프레임 (차징 3 + 분출 2)
  재생 속도: 6 FPS (느림)
  인게임 사용: poisonTrail + lavaPools 복합 패턴 (광역 독 장판)
  트레일러 사용: 긴장감 최고조 컷, 화면 가득 녹색 안개

[POSE 6] HURT STAGGER
  설명: 머리 뒤로 젖힘. 한 손 단안 쪽으로 뻗어 상처를 감싸는 듯. 몸 전체 뒤로 기울어짐.
  단안 상태: 균열 가시, 수액 분출
  주변 VFX: 수액 방울 20개 확산, 잔해 파편
  프레임 수: 3프레임 (단발 반응)
  재생 속도: 15 FPS (빠름)
  인게임 사용: 플레이어 결정타 시 리액션 프레임
  트레일러 사용: 처치 시퀀스 시작 컷

===

## [SECTION 5] 전투 로직 명세

### 부활 시스템 (핵심 정체성) — 확률+포인트 병행

EXODUSER 보스는 HP 0 도달해도 부활력 포인트가 남아 있고 확률 판정을 통과하면 풀피 부활한다.
이게 장르 정체성. 플레이어는 HP 깎기가 아니라 "부활력 고갈" 을 목표로 한다.
포인트 고갈 OR 확률 실패 → 둘 중 하나만 충족되면 최종 사망.

#### 부활력 포인트 (코드 구현 완료, mkEn 내 _revPts)

  초기 부활력 공식: 150 + round(si × 4.412)
    si 0 (1-1 눈나무의 파수꾼): 150
    si 17 (중반): 225
    si 34 (지옥 군주): 300

  부활 당 소모 (1차 즉시 부활 기준):
    기본: 10
    신성력 빌드 (antiRevive 어픽스 장착): +2~5 (min(5, suppress×10+2))
    holyPrison 존 내부 사망: +3
    플레이어 100% HP 상태에서 처치 (완벽 처치): +2
    합산 최대: ~15

  2차 폴백 부활 소모: 기본 10 고정 (보너스 없음)

#### 부활 확률 (1차 즉시 판정)

  _revCh = max(0, 1.25 + stage×0.05 - (deaths-1)×0.15 - suppress)
  si 0 기준 _revBase = 1.25 (125%)
  deaths=1 → 125%, deaths=2 → 110%, deaths=3 → 95% ...

  보장 부활 횟수 (코드: _maxGuar = hell+1)
    si 0 (hell=0): 보장 1회
    7단 지옥 (hell=6): 보장 7회

  억제 (suppress) 계산
    antiRevive 어픽스: 장비 등급에 따라 10~30%
    holyPrison 존: 15~30% (Lv1=15%, Lv10=30%)

#### 2차 폴백 부활 (3초 카운트다운)

  1차 판정 실패 시 발동, 별도 공식:
  _bossRevChance = max(0, 1.25 + stage×0.05 - deaths×0.25 - suppress)
  ※ (deaths-1)이 아닌 deaths×0.25 → 더 가혹한 감쇠
  부활력 포인트 0 이하 시 확률 무관 자동 실패
  성공 시 HP 50%, eShield 50%로 부활 (풀피가 아님), 포인트 10 소모

#### 부활 시 발생 효과 (1차 즉시 부활)

  - HP 풀피 회복 (e.hp = e.mhp)
  - eShield 풀피 (e.eShield = e.mhp, eShieldMax = e.mhp)
  - 페이즈 리셋 (_bossPhase = 0)
  - 무적 3초 (reviveIframes = 180)
  - 공격력 ×1.5 (7단 보스는 ×2) — 누적 적용!
  - 이속 ×1.25 (상한 1.6, 7단은 2.0)
  - 패턴 쿨다운 -30프레임 (하한 60, 7단은 20)
  - 포이즈 ×1.5 누적 증가 (부활마다 더 튼튼)
  - 순간이동: 플레이어 뒤 80+deaths×20 거리
  - 충격파: 100+deaths×30 반경, atk×(0.5+deaths×0.15) 데미지
  - 2차 부활부터: 전방위 투사체 (8+deaths×4 발)
  - 10% 확률 동반부활: 이전 처치 보스 중 랜덤 1마리 소환 (HP 40%, ATK 50%)

#### 부활력 UI 표시 (코드 구현 완료)

  1차 부활 시: "부활력 -N (잔여/최대)" 플로팅 텍스트
  2차 부활 시: "부활 성공! 부활력 잔여/최대" 플로팅 텍스트
  부활력 고갈 시: "☠ 부활력 고갈! 0/최대" 빨간색 텍스트
  완전 사망 시: "부활력 고갈!" 또는 "부활 실패..." 분기 표시

#### 예상 부활 횟수 (si 0 기준)

  억제 0% 시: 약 10~15회 (포인트 150 ÷ 10 = 15회, 확률은 9~10회째 실패 가능)
  antiRevive 20% 장착 시: 약 8~10회 (소모 12~15, 확률도 빠르게 감쇠)
  antiRevive + holyPrison 시: 약 6~8회 (소모 15, 확률 대폭 억제)

### 시그니처 무브 3선 (보스 성격 표현)

BOSS_MOVES 시스템 매핑
  절대 금지: 새 무브 id 추가, BOSS_MOVES 배열 수정, 기존 idx 변경
  허용: _BOSS_MOVESET[0] 에 이미 등록된 id만 사용

_BOSS_MOVESET[0] 등록 기술 (코드 실측, game.html 6043행)
  slashCombo, slam, sweep, charge, jump, burst, shock, fan,
  groundFissure, poisonTrail, spin, grab, multiDash,
  tideWave, chaseAoe, elemBall, beanStorm, lavaPools

[M1] jump = 땅속 잠수 후 재등장
  기술 id: jump (idx 3)
  기존 효과: 공중 점프 후 낙하 공격
  시각 재해석: 땅속으로 다이빙 -> 비활성 2-3초 -> 재등장
  애니 연결: POSE 2 (0.5s) -> 비가시 3s -> POSE 3 (0.5s)
  VFX 차이점: 원본 jump의 공중 점프 궤적 제거, 대신 지면 균열 + 흙기둥 + 재등장 지점 텔레그래프 원
  쿨다운: 180 프레임
  플레이어 대응: 재등장 지점이 텔레그래프됨, 해당 위치에서 벗어나면 회피

[M2] grab = 뿌리 인탱글 구속
  기술 id: grab (idx 8)
  기존 효과: 잡기 (보라색 패링 불가)
  시각 재해석: 보스 전방에서 가시 뿌리 튀어나와 플레이어 발목 구속
  애니 연결: POSE 4 (0.7s)
  VFX: 가시 뿌리 4-6가닥 지면에서 솟아남, 플레이어 발밑 구속 0.8초
  후속 연계: 구속 구역에 독 장판 자동 생성 (poisonTrail 체인 발동)
  쿨다운: 160 프레임
  플레이어 대응: 텔레그래프 시간 내 회피 전진, 사슬 스킬 캔슬 가능

[M3] poisonTrail = 독 장판 광역
  기술 id: poisonTrail (idx 40)
  기존 효과: 대시하며 독 웅덩이 생성 (4초 지속)
  시각 재해석: 제자리 또는 느린 회전하며 주변 전방위 독 안개 방출
  애니 연결: POSE 5 (0.8s)
  VFX: 캐릭터 주변 원형 독 안개 구름, 안개 내부에 웅덩이 3-4개 형성
  지속: 4초
  쿨다운: 140 프레임
  플레이어 대응: 안개 내부 체류 시 DOT, 외부 대기 또는 관통 회피

보조 무브 (AI가 상황에 따라 선택 가능)
  fan, elemBall: 원거리 탄환 기본기
  charge: 거리 좁힐 때
  shock: 근접 플레이어 튕김
  이들은 VFX 오버라이드 없이 기본 연출 사용

### 부활 단계별 전투 변화

[1-3회 부활 구간] 학습 단계
  외형 변화: 없음 또는 미세 (단안 약간 흐려짐)
  패턴 변화: 기본 M1 M2 M3 루프, 쿨다운 소폭 감소
  플레이어 경험: 처음엔 당황, 3회차쯤 "이거 계속 살아나는 거 맞네" 인지
  펫 학습 대사 유도 타이밍

[4-7회 부활 구간] 긴장 상승 단계
  외형 변화: 단안 균열 가시, 녹색 수액이 안개로 변해 주변 상시 떠다님
  패턴 변화:
    M1 재등장 직후 M3 자동 체인 (경계심 증가 표현)
    M2 구속 시간 연장 (0.8초 -> 1.2초)
    M3 독 안개 지속 시간 연장 (4초 -> 6초), 웅덩이 개수 증가 (3-4 -> 5-7)
  플레이어 경험: "진짜 얘 어떻게 죽이지?" 고민 발생. 빌드/전략 재검토 유도

[8-10회 부활 구간] 피날레 단계
  외형 변화: 단안 절반 붕괴, 뿌리 일부 시들어 떨어짐
  패턴 변화: 부활 시 전방위 투사체 (8 + deaths×4 발) 자동 발동 (코드 29689행)
  플레이어 경험: "마지막 한 번만 더" 긴장. 부활 확률 임계 진입

[부활 확률 0%] 최후의 일격
  부활 확률 5% 미만 진입 시 펫 경고
  1차 판정 실패 + 2차 카운트다운 판정도 실패 시 완전 사망
  사망 연출: 슬로모 + 단안 깨짐 + 뿌리 시들음 + 화면 페이드 + 침묵

### 플레이어 UX 필수 요소 (미구현 — 구현 필요)

[U1] 부활 확률 표시 UI
  위치: 보스 체력바 하단 또는 우측 인접
  현재 코드: addTxt로 부활 시 확률 % 플로팅 표시 (29652행)
  개선안: 상시 보스 UI에 부활 확률 게이지 추가

[U2] 부활 시 소모 표시 플로팅 텍스트
  위치: 보스 머리 위
  현재 코드: "💀 N차 부활! (×2^N)" + 확률% 표시 (29709행)
  형식: 이미 구현됨

[U3] 신성력 억제 피드백
  antiRevive 어픽스 장착 중인 플레이어가 보스 사망 유발 시
  현재 코드: "✟ 신성력 억제! (N%)" 표시 (29653행, 29730행)
  이미 구현됨

[U4] 마지막 부활 경고
  부활 확률 20% 미만일 때
  기획: 화면 하단 중앙 "MARK OF DEATH" 또는 "마지막 일격!" 고정 자막
  BGM 필터 변화 (하이패스 강조)
  ※ 미구현

[U5] 처치 카타르시스
  부활 확률 0% + 보스 HP 0 동시 도달 시
  기획: 0.8초 슬로모션 + 화면 페이드 + BGM 페이드아웃 + 잠깐 침묵 1초 후 효과음
  "VICTORY" 텍스트 없음 (침묵이 더 극적)
  ※ 미구현 — 현재는 hitStop + shake + flashCol 기본 연출만

### 펫 학습 대사 (game.html 기존 펫 시스템 활용)

[D0] 보스 첫 부활 목격 시 (기존 구현, 22592행)
  crow: "악의에 중독되면 악마가 돼서 부활력이 생긴대. 저 녀석처럼."
  cat: "혹시 너도...?"

[D1] 보스 1회차 부활 직후 (deaths === 1) — 미구현
  crow: "부활한다. 보통 한 번으로 안 죽어, 이놈들은."
  cat: "뭐야! 다시 일어났어! 계속 쳐!"

[D2] 보스 3회차 부활 (deaths === 3) — 미구현
  crow: "...부활력이 다 떨어져야 죽어. 계속 깎아."
  cat: "꾸준히! 신성력 장비 있으면 더 빨리 끝나!"

[D3] 부활 확률 50% 이하 진입 — 미구현
  crow: "...반쯤 왔다. 포기하지 마."

[D4] 부활 확률 20% 이하 진입 — 미구현
  crow: "거의 끝이다. 마지막 일격."
  cat: "조금만 더!!"

[D5] 부활 확률 5% 미만 (다음 사망이 거의 마지막) — 미구현
  crow: "...이게 마지막이야."
  cat: "집중해! 다음이 진짜야!"

이 대사는 보스 첫 만남에서 한 번씩만 트리거 (반복 금지, _petSayCD 사용)

### 플레이어 전략 도구 (기존 game.html 시스템 활용)

[T1] 신성력 빌드
  어픽스 antiRevive 장착 -> 부활 확률 감쇠 추가
  장비 implicit _iRevPow (bracelet_demon: 5~12%)
  ※ 구현 완료

[T2] holyPrison 존 스킬
  id: 'holyPrison', cat: 'tech'
  범위 내 몬스터 부활력 -15%~30% (Lv1=15%, Lv10=30%)
  Lv1 범위 400, Lv10 범위 697. 쿨 30초. 지속 10초
  ※ 구현 완료

[T3] 처형 스킬
  id: 'execution'. X키 사용.
  그로기 보스를 섬광 관통 처형. HP/MP/ST 10% 소모로 보스 최대HP 30% 순수 데미지.
  부활력 직접 삭감은 아니지만 부활 유발 속도를 올림 (빠른 부활 = 빠른 부활력 소진).
  ※ 구현 완료

이 3개 도구 중 하나라도 없으면 전투가 2~3배 길어질 수 있음.
BIC 심사위원이 이걸 모를 수 있으니 펫 대사로 가이드 필수.

### 절대 금지

  체력 80% 초과 단발 데미지 (즉사 패턴 금지)
  완전 무작위 탄막 (관찰 가능한 패턴 원칙)
  어택 티켓 시스템 (핵앤슬래쉬 장르 정체성)
  부위 파괴 (난이도 3에 과함, 이 보스에는 없음)
  부활 시 HP 낮은 상태로 부활 (1차 즉시부활은 풀피가 원칙)

===

## [SECTION 6] 등장 시네마틱 시퀀스

트레일러 핵심 컷. BIC 제출용.

시간축 (총 7초)

[00:00-00:01] 환경 인 타임
  플레이어 시점으로 썩은 숲 클리어링 진입
  어두운 숲 배경, 희미한 포자 파티클, 멀리서 나무 흔들림
  BGM 아직 없음, 숲의 바람소리 + 먼 풀벌레

[00:01-00:02] 지면 징조
  카메라 중앙에 작은 진동, 지면 균열 예고 파티클
  SFX: 낮은 럼블 시작
  조명: 약간 어두워짐

[00:02-00:03] 지면 폭발
  중앙 지면 폭발, 흙 기둥 1.5m 높이로 솟구침
  POSE 2 BURROWING DOWN 역재생 (보스가 위로 튀어나오는 효과)
  SFX: 지면 폭발 + 뿌리 찢어지는 소리
  화면 흔들림 강도 12

[00:03-00:05] 보스 등장 슬로모
  POSE 3 EMERGING UP 0.4x 속도 재생 (슬로모션)
  카메라 줌아웃으로 전체 실루엣 공개
  단안 플레어 최대
  네임카드 페이드인: "THE EYE-TREE SENTINEL" 상단 자막
  자막 폰트: Noto Sans KR Bold, 크기 48, 색 #e0f0c0
  BGM 드롭: bgm_boss_early 트랙 시작

[00:05-00:06] 포효 홀드
  POSE 1 IDLE BREATHING 로 전환
  카메라 살짝 진동 지속
  단안이 플레이어 방향으로 회전하며 응시
  SFX: 보스 포효 (ElevenLabs 생성)
  음량 덕킹: BGM 0.5초간 볼륨 감소 후 복귀

[00:06-00:07] 전투 시작
  레터박스 제거, UI (체력바, 스킬바) 페이드인
  보스 체력바 상단 표시: "눈나무의 파수꾼" + 체력 게이지
  플레이어 조작권 복구
  G.bossAlive = true

이 7초 시퀀스는 기존 game.html _enterBossArena() 함수 확장으로 구현.
절대 수정 금지 영역(BOSS_MOVES, BOSS_PHASES 등) 미터치.

===

## [SECTION 7] 사운드 명세

### BGM

  트랙: bgm_boss_early (기존)
  크로스페이드 2초 (탐험 BGM -> 보스 BGM)
  보스 처치 시 bgm_boss_early 페이드아웃 3초

### 현재 보스 SFX 설정 (코드 실측, game.html 14700행)

  si 0 보스 사운드 프로파일:
    howl: 'boss_howl', pitch 0.7 (묵직/낮음)
    die: 'death_boss', pitch 0.7
    hit: 'boss_hit', pitch 0.7
    hurt: 'monster_hurt', pitch 0.7

### SFX 신규 생성 필요

  [S1] 지면 폭발 (등장 시, 무거운 베이스 + 나무 파열음)
     출처: Freesound.org 조합 또는 ElevenLabs SFX
  [S2] 보스 포효 (등장 2초, 위기 1.5초, 사망 3초 총 3라인)
     출처: ElevenLabs 프리미엄
     스타일: 비인간 저음 + 식물성 삐걱거림 혼합
     프롬프트 예시:
       "Deep inhuman boss roar, low guttural bass rumble with wooden creaking
        and organic hissing undertones, 2 seconds, ominous, ancient forest spirit"
  [S3] 단안 충전음 (M3 poisonTrail 텔레그래프 시, 고주파 웅웅거림 0.8초)
  [S4] 뿌리 솟구침 (M2 entangle 시, 지면 찢어짐 + 나무 삐걱 0.4초)
  [S5] 독 안개 방출 (M3 시, 쉬이익 + 물 흐르는 느낌 1.2초)
  [S6] 피격음 (HURT 시, 나무 쪼개짐 + 액체 분출 0.3초)
  [S7] 처치음 (사망 시, 거대 나무 쓰러지는 크랙 + 바람 2.5초)

### 보이스 3라인 (ElevenLabs)

  등장: 위 S2 포효로 대체 (언어 없음)
  위기 (HP 50% 이하 진입 시): 낮은 신음 + 균열음 1초
  사망: 최후의 포효 -> 숨 끊기는 소리 2.5초

### 사운드 우선순위 시스템

  game.html 기존 시스템 사용
  보스 SFX는 우선순위 높음으로 지정, 일반 몹 SFX에 묻히지 않게

===

## [SECTION 8] 코드 통합 명세

### 절대 수정 금지 영역 (재확인)

  BOSS_MOVES 배열
  BOSS_COMBOS 배열
  BOSS_PHASES 객체
  _BOSS_MOVESET 배열 (단 si 0 값 내용은 이미 정의되어 있으므로 그대로 사용)
  _bossAI 함수 본체
  _bossScore, _bossStartPattern 등 보스 AI 코어 함수

### 수정 허용 영역

  _enterBossArena 함수 (등장 시네마틱 확장)
  보스 스프라이트 렌더 함수 (스켈레탈 렌더를 스프라이트 애니로 교체)
  VFX 파티클 추가 (poolPart, addParts 활용)
  SFX 호출 지점 (기존 우선순위 시스템 준수)
  atlas 로더 (신규 추가)

### 신규 추가 필요 파일

  G:\hell\img\bosses\boss_01_atlas.png  (6포즈 가로 배치 또는 grid)
  G:\hell\img\bosses\boss_01_atlas.json (프레임 좌표 + 메타)

### atlas.json 스키마 예시

  {
    "meta": { "image": "boss_01_atlas.png", "size": {"w": 2048, "h": 768} },
    "frames": {
      "idle_01": { "frame": {"x":0,"y":0,"w":256,"h":384}, "duration":100 },
      "idle_02": { "frame": {"x":256,"y":0,"w":256,"h":384}, "duration":100 },
      ...
      "burrow_01": { ... },
      "emerge_01": { ... },
      "entangle_01": { ... },
      "miasma_01": { ... },
      "hurt_01": { ... }
    },
    "animations": {
      "idle": ["idle_01","idle_02","idle_03","idle_04"],
      "burrow": ["burrow_01","burrow_02","burrow_03"],
      "emerge": ["emerge_01","emerge_02","emerge_03","emerge_04","emerge_05"],
      "entangle": ["entangle_01","entangle_02","entangle_03","entangle_04"],
      "miasma": ["miasma_01","miasma_02","miasma_03","miasma_04","miasma_05"],
      "hurt": ["hurt_01","hurt_02","hurt_03"]
    }
  }

### 상태 매핑 (보스 AI 상태 -> 애니 이름)

  e.s === 'idle' -> animations.idle 루프
  e.s === 'atk' && 현재 무브 id === 'jump' 1단계 -> animations.burrow
  e.s === 'atk' && 현재 무브 id === 'jump' 2단계 -> animations.emerge
  e.s === 'atk' && 현재 무브 id === 'grab' -> animations.entangle
  e.s === 'atk' && 현재 무브 id === 'poisonTrail' -> animations.miasma
  e.hurtT > 0 -> animations.hurt (단발 오버라이드)

### 폴백 규칙

  atlas 로드 실패 시 기존 프로시저럴 스켈레탈 렌더 유지
  게임이 이미지 없이도 항상 동작해야 함 (MASTER BIBLE 16.1 DAY 3-4 원칙)

### 등장 시네마틱 구현 체크리스트

  [ ] _enterBossArena 진입 시 플레이어 조작 잠금 7초
  [ ] 0-1초: 환경 파티클 추가, BGM 덕킹
  [ ] 1-2초: 지면 균열 텔레그래프 (기존 groundFissure VFX 재활용 가능)
  [ ] 2-3초: 흙기둥 파티클 대량 방출 (기존 addParts 사용), 화면 흔들림 12
  [ ] 3-5초: 슬로모션 0.4x 적용 (G.slowMo 활용), emerge 애니 재생
  [ ] 3-5초: 네임카드 DOM 요소 페이드인 (기존 UI 시스템)
  [ ] 5-6초: 포효 SFX 재생 (playSample, 우선순위 높음)
  [ ] 6-7초: 레터박스 제거, 조작권 복구, 보스 체력바 표시
  [ ] 모든 단계에서 Date.now() 사용 금지, 프레임 카운터 기반

===

## [SECTION 9] 작업 단계 로드맵

BIC 2026 제출 마감: 2026년 5-6월 (잔여 30-60일)
1-1 보스 할당 예산: 20일

[STAGE A] 비주얼 자산 확보 (5일)
  A-1 [완료] 마스터 3뷰 시트 GPT 4o 생성
  A-2 [완료] 액션 6포즈 정면 시트 GPT 4o 생성
  A-3 [진행 예정] 액션 6포즈 아이소메트릭 시트 GPT 4o 재생성
  A-4 개별 포즈 크롭 (photopea 또는 remove.bg 사용)
  A-5 96px 리사이징 + 안티앨리어싱 적용
  A-6 atlas 이미지 조립 + json 작성

[STAGE B] VFX 및 사운드 자산 (4일)
  B-1 ElevenLabs 포효 3라인 생성
  B-2 SFX 7종 Freesound/ElevenLabs 조합 생성
  B-3 파티클 레이어 정의 (녹색 포자, 흙 파편, 독 안개)
  B-4 단안 발광 셰이더 결정 (Canvas 2D additive blend)

[STAGE C] 코드 통합 (6일)
  C-1 atlas 로더 구현
  C-2 스프라이트 렌더 폴백 포함 작성
  C-3 상태->애니 매핑 로직
  C-4 등장 시네마틱 7초 시퀀스
  C-5 M1 jump VFX 오버라이드
  C-6 M2 grab VFX 오버라이드
  C-7 M3 poisonTrail VFX 오버라이드
  C-8 처치 연출 2초

  * C 단계는 GPT+Codex vs Claude Code 경쟁 작업 대상

[STAGE D] 테스트 및 폴리싱 (3일)
  D-1 프레임 드롭 체크 (60fps 유지 확인)
  D-2 GC 스파이크 없음 확인 (메모리 원칙)
  D-3 HTML div 쌍 카운트 검증 (무결성)
  D-4 외부 테스터 3명 플레이 피드백

[STAGE E] BIC 제출물 편집 (2일)
  E-1 트레일러 12초 보스전 시퀀스 녹화
  E-2 스크린샷 5장 촬영
  E-3 제출 폼 작성

총 20일. 버퍼 포함 25일.

===

## [SECTION 10] 파이프라인 담당 확정

비주얼 생성: GPT 4o image (확정)
기획 및 설계: Claude CTO (확정)
코드 구현: GPT+Codex vs Claude Code 경쟁 (양쪽에 본 문서 전달 후 결과 비교)
3D 변환: 1-1 보스는 미사용. 2-1 이후 양산 단계에서 Meshy + Mixamo + Blender
사운드: ElevenLabs (포효, 보이스) + Freesound (환경 SFX)
영상 편집: DaVinci Resolve 무료판 또는 Shotcut
탈락: Grok Imagine, PixelLab, 그록 API (동결 보관)

===

## [SECTION 11] 양식 파이프라인 비교 프롬프트

두 코드 파이프라인에 동일 조건으로 넘길 때 사용할 프롬프트 프레임.
본 문서 전체를 첨부 + 아래 지시를 함께 전달.

=== 프롬프트 시작 ===

[TASK]
게임 EXODUSER의 1-1 보스 "눈나무의 파수꾼"을 game.html에 통합한다.
첨부 문서 BOSS_01_EYE_SENTINEL.md 의 SECTION 8 (코드 통합 명세) 전부 구현.

[절대 금지]
- BOSS_MOVES, BOSS_COMBOS, BOSS_PHASES, _BOSS_MOVESET 배열 수정
- _bossAI 함수 본체 수정
- 게임루프 내 new, splice, filter, forEach, Date.now 사용
- setTimeout 사용 (결정론 파괴)
- 전체 파일 재작성 (str_replace만 사용)
- 존재하지 않는 함수 호출

[필수 작업]
1. atlas 로더 구현 (폴백 포함)
2. 상태 -> 애니 매핑
3. 등장 시네마틱 7초 (SECTION 8 체크리스트)
4. M1 M2 M3 VFX 오버라이드
5. 모든 수정 전에 .bak 백업
6. 수정 후 HTML div 쌍 카운트로 무결성 검증

[보고 형식]
1. 수정한 함수/영역 목록
2. 절대 수정 금지 영역 미터치 확인
3. 게임루프 new 없음 확인
4. div 쌍 카운트 전/후 수치
5. 런타임 테스트 결과

[언어] 한국어

=== 프롬프트 끝 ===

===

## [SECTION 12] 변경 이력

v1.0 (2026-04-25) 초판
  - 기존 대화 턴 10+에 흩어진 1-1 보스 정보 통합
  - 6포즈 명세 확정
  - 전투 로직 3무브 확정 (jump, grab, poisonTrail)
  - 등장 시네마틱 7초 시퀀스 확정
  - 자산 인벤토리 + 백업 규약 확정

v1.1 (2026-04-25) 부활 시스템 전면 재작성
  - v1.0 의 "상태 2개, 부활 1회" 단순 기술 전면 폐기
  - 실제 코드 기준 부활 로직 반영
  - 부활 단계별 전투 변화 4단계 추가
  - 플레이어 UX 5요소 추가 (U1~U5)
  - 펫 학습 대사 5종 추가 (D1~D5)
  - 전략 도구 3종 명시 (T1~T3)

v1.2 (2026-04-25) 부활력 포인트 시스템 코드 구현 + 동기화
  - 부활력 포인트 시스템 코드 구현 완료 (mkEn에 _revPts/_maxRevPts 추가)
    * 초기값: 150 + round(si × 4.412), si 0=150, si 34=300
    * 소모: 기본 10 + antiRevive(+2~5) + holyPrison(+3) + 완벽처치(+2)
  - 확률+포인트 병행 판정: 포인트 고갈 OR 확률 실패 = 최종 사망
  - 2차 폴백 부활(3초 카운트다운)도 포인트 연동: 포인트 0이면 자동 실패, 성공 시 10 소모
  - 부활력 UI 플로팅 텍스트 구현 (소모량, 잔여/최대, 고갈 표시)
  - 주 원소: '독' → '물리(EL.P)' 수정 (독 원소 게임에 없음, VFX로만 독 표현)
  - 보스 크기: r=22(충돌) + 렌더 스케일 분리 명시
  - 보스 SFX 프로파일 코드 실측 추가 (boss_howl pitch 0.7 등)
  - U1~U5 구현 상태 태깅, D0 기존 펫 대사 추가

차기 개정 트리거
  - 아이소메트릭 6포즈 확보 완료 시 SECTION 3 업데이트
  - ElevenLabs 포효 확정 시 SECTION 7 업데이트
  - 코드 통합 완료 시 SECTION 8 실제 수정 범위 기록
  - BIC 제출 완료 시 사후 평가 SECTION 추가
  - 보스 이름 코드 변경 시 ('숲의 감시자' → '눈나무의 파수꾼') SECTION 1 업데이트
