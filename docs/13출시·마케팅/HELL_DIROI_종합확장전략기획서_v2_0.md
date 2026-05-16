# HELL: EXODUSER + DIROI 종합 확장 전략 기획서 v2.0

> **원본**: HELL_DIROI_종합확장전략기획서_v2_0.docx | v2.0 · 2026.05 | FDG (FOR DEAR GAMERS) | 대표 SIM DOJIN
> **분류**: 출시·마케팅 전략 / 글로벌 확장 / 펀딩

---

FDG · FOR DEAR GAMERS
HELL: EXODUSER
지옥: 탈주자
+ DIROI (동반작)
종합 확장 전략 기획서
Global Expansion & Funding Master Plan
Steam · 멀티스토어 · 콘솔 · 크로스플랫폼 · 펀딩
v2.0 · 2026.05
대표 · SIM DOJIN
다크 판타지 핵앤슬래쉬 ARPG · 7챕터 폭로 서사 · 100+ 몬스터 · 35+ 보스

# 목차
1. Executive Summary
2. 비전 및 스튜디오 정체성
3. 듀얼 IP 전략 - HELL EXODUSER + DIROI
4. 시장 분석 - 인디 ARPG 벤치마크 (Dead Cells, Hades, Hollow Knight)
5. PC 운영 전략 - 멀티스토어 (Steam, 스토브, Epic, GOG, Itch.io)
6. 콘솔 확장 전략 - Steam Deck, Switch, Xbox, PlayStation
7. 크로스 플랫폼 계정 - EOS 통합
8. 기술 아키텍처 - NW.js 통일 + OAuth 정공법
9. 펀딩 전략 - 국내 지원사업 + 퍼블리셔 + 크라우드펀딩
10. 출시 로드맵 (M0~M24)
11. 마케팅 전략 - 40년 게이머의 진정성
12. KPI 및 매출 예측
13. 리스크 및 대응
14. 부록 (가격표, 기술 스택, 펀딩 캘린더, 빌드 레퍼런스)

# 1. Executive Summary
FDG (FOR DEAR GAMERS)는 광주 소재 1인 인디 스튜디오로, 다크 판타지 핵앤슬래쉬 ARPG "HELL: EXODUSER"를 메인 IP, 7원소 퍼즐 로그라이트 "DIROI"를 동반작으로 동시 개발 중이다.
HELL은 1인 개발 인디 ARPG의 글로벌 진출 표준 경로(Dead Cells, Hollow Knight, Salt and Sanctuary)를 따르며, Steam 얼리액세스 + 멀티스토어 + 콘솔 이식 + 한국 정부 지원사업 다층 자금 채널로 안정적 출시를 도모한다.
DIROI는 30개국 번역 자산 + PC/모바일 듀얼 BM(Vampire Survivors 모델)을 활용한 글로벌 동시 출시작으로, HELL의 마케팅 견인차 + IP 확장 베이스 역할을 동시에 수행한다.

## 핵심 의사결정 요약
결정 사항 12개
1. HELL EXODUSER 메인 IP, DIROI 동반작 포지션. 두 게임 별도 출시 일정 운영.
2. HELL Steam 얼리액세스: $14.99 (EA) → $19.99 (1.0). 다크판타지 ARPG 표준 가격.
3. DIROI Steam 얼리액세스: $7.99 (EA) → $9.99 (1.0). 캐주얼 가격.
4. 두 게임 모두 NW.js 통일 (Electron 폐기). 빌드 도구 단일화.
5. 멀티스토어: Steam (메인) + 스토브 (한국 인디) + Epic + GOG + Itch.io.
6. 가챠 · 시즌패스 · 시간 게이트 · P2W 일절 도입하지 않음.
7. HELL은 PC/콘솔 중심 (모바일 우선순위 낮음, 출시 1년 후 검토). DIROI는 PC/모바일 동시.
8. EOS 통합으로 PC/모바일/콘솔 계정 + 진행도 연동. PC 구매자 모바일 광고 자동 제거.
9. KOCCA 2026 일반형 PC 제작지원 (최대 4억) 또는 인디게임 데브캠프 (최대 8,500만) 신청.
10. 광주 GICON 인디스타즈 (도진님 지역 강점) + 부산 BIC + 성남 인디크래프트 병행.
11. EA 6~12개월 성과 검증 후 퍼블리셔 컨택 (네오위즈 1순위, 스마일게이트 / Raw Fury / Devolver 검토).
12. 텀블벅 + Kickstarter 크라우드펀딩 - 1.0 정식 출시 직전 시점.

## 매출 시나리오 (24개월 누적, HELL+DIROI 합산)
시나리오
HELL PC
DIROI PC
DIROI 모바일
지원금/펀드
24개월 누적
보수적
8,000만원
5,000만원
3,000만원
8,500만원
약 2.5억
기준
3억
1.6억
4억
1.5억
약 10.1억
낙관적
12억
5억
30억
3억
약 50억
산정 근거: HELL은 ARPG 평균가 $17.5 × 70% 스토어 수익률, DIROI는 $7 평균가 적용. 11장 KPI 섹션 상세 참조.

# 2. 비전 및 스튜디오 정체성
## 2.1 FDG (FOR DEAR GAMERS)
"사랑하는 게이머들에게"라는 의미를 가진 솔로 인디 스튜디오. 사업자등록번호 767-32-01971, 본사 광주광역시. 대표 SIM DOJIN.
개발자 배경: 1982년생, 게임 경험 40년의 중년 게이머. 5살부터 오락실에 심취, 코딩 캠프 6개월 수료 후 1인 게임 개발 시작. 인디 행사 도전 단계.
## 2.2 스튜디오 철학
비강압 (Non-predatory): 플레이어 시간을 가장 귀한 자원으로 본다. 광고/과금으로 시간 빼앗는 설계 금지.
점진적 완성도: Dead Cells, Hollow Knight, Hades, Stardew Valley처럼 분기 메이저 업데이트로 작품을 완성.
글로벌 동등성: 30개국 번역 (DIROI 기준), 동시 출시로 영어권 외 시장에 정성껏 어필.
IP 우선: HELL EXODUSER가 메인 IP, DIROI가 동반작. 두 작품 모두 "엑소듀서 세계관" 확장의 일부.
40년 게이머의 진정성: 마케팅 핵심 메시지. 한국 인디 씬의 "진심으로 만든" 게임 포지셔닝.
## 2.3 게임별 한 줄 정의
HELL: EXODUSER
"오리 · 할로우 나이트급 비주얼 + 베르세르크 · 프롬소프트 작화로 빚어낸, 매스 러시와 패링이 살아있는 다크 판타지 핵앤슬래쉬 ARPG"
장르: 다크 판타지 핵앤슬래쉬 ARPG (스토리 중심, 로그라이트 아님)
포지셔닝: 7챕터 선형 진행 + 폭로 서사 (검은신화 오공형 보스 사연 누적)
차별점: BULLET LANGUAGE (색-키 매칭 패링) + CHAIN DRIVE (사슬 홀딩 차지 기동) + 매스 러시 (어택 티켓 시스템 금지)
콘텐츠: 100+ 몬스터 · 35+ 보스 · 48+ 패턴 · 58+ 콤보 · 22+ 액티브 · 30 패시브 · 21+ 합체 · 55+ 어픽스
타겟 시장: 한국 · 일본 · 미국 · 유럽 1차, 중국 · 동남아 2차

DIROI
"플레이 시간 5분으로도, 100시간으로도 충분히 만족스러운, 30개국 언어로 만나는 한국발 7원소 퍼즐 로그라이트"
장르: 탑다운 퍼즐 디펜스 × Vampire Survivors 스타일 로그라이트
포지셔닝: 엑소듀서(Exoduser) 본편의 스핀오프 - 안내고양이 "디로이" 주인공
차별점: 30개국 글로벌 동시 출시, PC + 모바일 멀티플랫폼, 비강압 BM
타겟 시장: 한국 · 일본 · 미국 · 유럽 1차, 중국 · 동남아 · 남미 2차

# 3. 듀얼 IP 전략 - HELL EXODUSER + DIROI
FDG는 HELL과 DIROI를 "엑소듀서 세계관" 공통 IP 하에 운영하되, 각 게임의 시장 포지션과 BM은 완전히 분리한다.
## 3.1 게임별 포지셔닝 비교
구분
HELL EXODUSER (메인)
DIROI (동반작)
장르
다크 판타지 핵앤슬래쉬 ARPG
퍼즐 디펜스 × 로그라이트
주력 시장
PC + 콘솔 (코어)
PC + 모바일 (캐주얼/코어 양면)
EA 가격
$14.99 / ₩19,800
$7.99 / ₩9,900
1.0 가격
$19.99 / ₩24,500
$9.99 / ₩12,500
BM
단품 패키지
PC 단품 / 모바일 무료+광고
출시 형태
Steam EA → 1.0 → 콘솔
Steam EA → 1.0 + 모바일 글로벌
주력 지표
판매량 · 위시리스트 · 평점
DAU · 광고 매출 · IAP · 판매량
타겟 플레이타임
30~80시간
5분~100시간 (캐주얼+코어)
퍼블리셔
네오위즈 1순위
스마일게이트 / Raw Fury
콘솔 우선순위
Switch + Steam Deck 1순위
Steam Deck만 즉시
## 3.2 듀얼 IP의 시너지
HELL의 다크판타지 코어 팬 → DIROI의 캐주얼 라이트 플레이로 휴식 → HELL 복귀
DIROI 모바일 30개국 글로벌 출시 → HELL 위시리스트 견인 ("FDG의 다른 작품" 노출)
Steam 번들 (HELL + DIROI 동시 구매 할인) → 평균 객단가 상승
크라우드펀딩 시 두 게임 굿즈 + 사운드트랙 패키지 → 펀딩 금액 1.5~2배 효과
퍼블리셔 협상 시 "단일 게임이 아닌 IP 가진 스튜디오" 포지션 → 협상력 ↑
## 3.3 출시 순서 결정
두 작품 동시 개발이지만 출시 시점은 분리. HELL이 메인 IP로서 우선 순위.
DIROI 먼저 출시 (M2~M8 모바일까지) - 가벼운 게임으로 시장 진입, 수익 + 학습 + 마케팅 베이스 확보
HELL Steam EA 출시 (M6~M8 사이) - DIROI 트래픽을 HELL 위시리스트로 변환
HELL 1.0 정식 출시 (M14~M18) - DIROI 1.0 마무리 후 풀 마케팅 집중
HELL 콘솔 이식 (M18+) - Switch, Steam Deck 우선

# 4. 시장 분석 - 인디 ARPG 벤치마크
HELL EXODUSER는 인디 ARPG 시장에서 Dead Cells, Hollow Knight, Salt and Sanctuary, Hades 등의 글로벌 성공 사례를 벤치마크로 삼는다.
## 4.1 인디 ARPG 시장 성공 사례
게임
개발사 규모
출시년도
누적 판매
Steam 평점
Hollow Knight
3인 (Team Cherry)
2017
1,500만+
압도적 긍정
Dead Cells
Motion Twin (소형)
2018
1,000만+
압도적 긍정
Hades
Supergiant (소형)
2020
1,000만+
압도적 긍정
Salt and Sanctuary
2인 (Ska Studios)
2016
300만+
매우 긍정적
Blasphemous
The Game Kitchen (15인)
2019
500만+
매우 긍정적
Tunic
1인 (Andrew Shouldice)
2022
200만+
매우 긍정적
산나비 (Sanabi)
원더포션 (3인)
2023
100만+
매우 긍정적
Black Myth: Wukong
Game Science (140인)
2024
2,000만+ (1주)
압도적 긍정

HELL EXODUSER에 적용 가능한 인사이트
1. Team Cherry 3인, Motion Twin 5인 등 소규모 팀이 글로벌 1000만 판매 달성. 1인 개발도 동일 경로 가능.
2. Hollow Knight도 출시 시점 콘텐츠 70%에서 EA, 무료 DLC 4회 추가로 "평생 가치" 구축.
3. Dead Cells의 "매번 다른 도전" + Hades의 "내러티브 + 핵슬" 조합 = HELL의 매스 러시 + 7챕터 폭로 서사.
4. 산나비는 한국 인디 ARPG 글로벌 성공 표준 사례. 네오위즈 퍼블리싱 + 글로벌 마케팅 = 100만 판매.
5. Black Myth: Wukong은 "보스 사연 누적 폭로" 구조의 매스 마켓 검증. HELL도 동일 구조 채택.
6. 평균가 $19.99~$24.99 인디 ARPG = 단품 가격대 표준. 페이월/DLC 강요 없이 단품으로도 1000만 판매 가능.
## 4.2 DIROI 시장 비교 (Vampire Survivors 모델)
지표
Vampire Survivors
Survivor.io
DIROI 목표
BM
PC $4.99 + 모바일 무료/광고
F2P + 가챠 + IAP
PC $7.99 + 모바일 무료/광고
누적 다운로드/판매
PC 1,000만+ / 모바일 3,000만+
모바일 8,000만+
PC 6,000~60,000 / 모바일 100만+
누적 매출 추정
$5,700만+ (PC만)
$5억+ (IAP only)
기준 약 5억 / 낙관 30억
라이브옵스 부담
분기 업데이트만
월 단위 콘텐츠 + 이벤트
분기 업데이트만 (지속가능)
가챠 도입
없음
있음 (핵심 수익)
없음 (FDG 약속)
결론: VS 모델은 솔로 인디 운영 가능, Survivor.io 모델은 불가능. DIROI는 VS 경로 채택.
## 4.3 한국 인디 ARPG 성공 사례 - 산나비
산나비 (Sanabi, 원더포션) - 한국 인디 ARPG의 글로벌 성공 표준
개발사: 원더포션 (3인 팀)
출시: 2023.11 (Steam) → 2024 Switch · PS5 · Xbox
퍼블리셔: 네오위즈 (한국) + Maximum Entertainment (글로벌)
누적 판매: 100만+ (1년)
Steam 평점: 매우 긍정적 (95%+)
굿즈 크라우드펀딩: 14억 3,500만 원 (텀블벅, 한국 인디 게임 펀딩 최고 기록)
HELL EXODUSER 적용 포인트: 1) 네오위즈 퍼블리싱 모델 검증됨, 2) BIC 출품 이후 글로벌 진출 경로, 3) 굿즈 펀딩이 본편 매출과 별개 수익 채널 형성

# 5. PC 운영 전략 - 멀티스토어 동시 운영
Steam을 메인으로 하고, 스토브 (한국 인디 핵심), Epic (낮은 수수료), GOG (DRM-free 코어 유저), Itch.io (데모 배포·커뮤니티)를 단계적으로 입점.
## 5.1 게임별 가격 정책
### HELL EXODUSER
시기
가격
비고
스팀 페이지 공개
—
위시리스트 시작, 가격 미공개
얼리액세스 출시 (M6~M8)
$14.99 / ₩19,800
콘텐츠 50%. EA 할인 가격
EA 기간 (~M14)
동일 유지
EA 기간 중 가격 인상 금지
1.0 정식 출시 (M14~M18)
$19.99 / ₩24,500
콘텐츠 100% 완성, 33% 인상
1.0 후 정기 세일
20~30% 할인
스팀 정기 세일 참여
사운드트랙 DLC
$4.99 / ₩6,500
1.0 이후 출시
DLC 캠페인 (ASH RAIDER)
$9.99 / ₩12,500
1.0 이후 6~12개월

### DIROI
시기
가격
비고
스팀 페이지 공개
—
위시리스트 시작, 가격 미공개
얼리액세스 출시 (M2)
$7.99 / ₩9,900
콘텐츠 30%
EA 기간 (~M14)
동일 유지
EA 기간 중 가격 인상 금지
1.0 정식 출시 (M14)
$9.99 / ₩12,500
콘텐츠 100% 완성, 25% 인상
1.0 후 정기 세일
20~30% 할인
스팀 정기 세일 참여
사운드트랙 DLC
$2.99 / ₩3,900
1.0 이후 출시
모바일 광고 제거 IAP
$3.99 / ₩5,500
출시 시점부터
## 5.2 PC 스토어 5개 비교
스토어
수수료
특성
HELL 적합도
DIROI 적합도
Steam
30% (+$100 등록비)
압도적 1위, 디스커버리 양날의 검
★★★ 필수
★★★ 필수
스토브 (STOVE)
30%
한국 인디 전용, 심의 비용 지원
★★★ 필수
★★★ 필수
Epic Games Store
12% (첫 100만 달러 0%)
수수료 매력적, 트래픽 작음
★★ 권장
★★ 권장
GOG
30%
DRM-free, 코어 PC 게이머
★★ 1.0 후
★ 1.0 후
Itch.io
0~30% (자유)
인디 친화, 데모 배포 자유
★★ 데모용
★★ 데모용
## 5.3 스토브 (STOVE) - 한국 인디 최우선 입점
스토브가 FDG에 특히 좋은 이유
1. 스마일게이트 메가포트 운영. IndieGo 지원 경험 이력 → 관계 시작점 있음.
2. 한국 게임물관리위원회 자체등급분류사업자 - 등급 분류 절차 간소화.
3. 입점 게임 심의 비용 지원 (인디는 3만~200만 원 부담, 학생/개인은 큰 짐).
4. 한국어 게임에 매우 유리. 정성껏 한 한국어 = 스토브 큐레이션 노출 가능성 큼.
5. "스토브 인디 어워즈" 매년 개최. 한국 인디 씬과 가장 밀접한 플랫폼.
6. "스토브인디 ECO (Ecosystem Creator Opportunity)" 글로벌 진출 지원 프로그램.
7. 입점 문의: stove.store@smilegate.com
## 5.4 단계별 입점 우선순위
M0: Steam 페이지 공개 (HELL + DIROI 양쪽, 위시리스트 시작)
M1: Itch.io 데모/EA 베타 빌드 배포 (마케팅 채널)
M2: ★ DIROI Steam EA + 스토브 동시 입점
M4: Epic Games Store 입점 신청 (인디 트랙)
M6~8: ★ HELL Steam EA + 스토브 동시 입점
M14: ★ DIROI 1.0 정식 출시 + GOG 입점
M14~18: ★ HELL 1.0 정식 출시 + GOG 입점
M18+: Humble Store 입점 + Humble Bundle 참여 검토

# 6. 콘솔 확장 전략
HELL EXODUSER는 PC 출시 6~12개월 후 콘솔 이식 진행. DIROI는 Steam Deck만 즉시 진입.
## 6.1 콘솔 플랫폼 비교
플랫폼
수익 분배
특성
HELL 우선순위
DIROI 우선순위
Steam Deck
30% (Steam 동일)
Steam 출시 시 자동, Verified 검증만
★★★ 즉시
★★★ 즉시
Nintendo Switch
30%
퍼즐/로그라이트/ARPG 강세, 인디 친화
★★★ 1순위
★★★ 1순위
Xbox (ID@Xbox)
12~30%
Game Pass 협상 가능, 인디 트랙
★★ 2순위
★★ 2순위
PlayStation
30%
라이센싱 절차 까다로움
★★ 2~3순위
★ 3순위
Meta Quest VR
30%
유니크 인디 강세
★ 검토 안 함
★ 검토 안 함
## 6.2 콘솔 이식 현실적 접근
솔로 인디의 콘솔 이식 - 위탁 vs 자체
Steam Deck: 검증 무료, Steam 출시와 동시 자동. 가장 빠른 "콘솔" 진입.
Switch / Xbox: 별도 SDK · 인증 필요. 솔로로는 시간 소모 큼.
→ 콘솔 이식 전문 퍼블리셔 위탁 검토:
Whitethorn Games (Calico, Wholesome Direct)
Forever Entertainment (Panzer Dragoon: Remake)
Maximum Entertainment (산나비 글로벌 콘솔 이식 담당)
PlayStation: 인디 진입 장벽 가장 높음. 1.0 출시 후 충분한 트랙 레코드 확보 후 시도.
Black Myth: Wukong이 PS5 출시 후 시장 폭발 → 인디 ARPG도 PS5 검토 가치 있음.
## 6.3 HELL EXODUSER 콘솔 이식 로드맵
M14~M16: Steam 1.0 출시 + 평점 안정화 + 6개월 트랙 레코드 확보
M16~M18: Switch 이식 시작 (Maximum Entertainment 또는 자체)
M18: Switch 출시 + Game Pass 협상 시작 (Xbox)
M20~M24: Xbox 출시 + PS5 검토 (퍼블리셔 통해)

# 7. 크로스 플랫폼 계정 - EOS 통합
Epic Online Services로 5개 플랫폼(Steam/Epic/Switch/Google/Apple) 계정을 통합 관리. DAU 무관 영구 무료.
## 7.1 EOS 활용 범위
Account Linking: 모든 플랫폼 계정을 하나의 EOS 계정에 연결
Player Data Storage: 진행도(캐릭터, 골드, 업적) 모든 기기 동기화 (유저당 4MB 무료)
Achievements: 플랫폼 간 통합 업적 관리
Leaderboards: 리더보드 (통합 또는 분리 선택)
Friends: 친구 시스템 (HELL 멀티플레이 검토 시)
## 7.2 DIROI: PC 구매자 → 모바일 광고 자동 제거
작동 방식 (핵심 기능)
1. 유저가 Steam/스토브/Epic 등에서 DIROI 구매 → 첫 실행 → EOS 계정 생성/연결.
2. 같은 유저가 모바일 DIROI 첫 실행 → "EOS 계정으로 로그인하시겠습니까?" 안내.
3. 로그인 후 EOS에서 라이센스 확인 → 모바일 광고 자동 제거 적용.
4. 결제 정보는 EOS에 저장하지 않음. 라이센스 확인만 수행 (애플 ToS 안전).
## 7.3 HELL: 콘솔 ↔ PC 진행도 동기화
HELL EXODUSER는 PC와 콘솔 간 진행도 동기화. Switch 휴대용에서 시작 → PC로 이어 플레이 가능. 산나비도 동일 구조.
Steam Cloud 1차 (PC + Steam Deck)
EOS Player Data Storage 2차 (PC ↔ Switch ↔ Xbox)
Supabase 백엔드 3차 (모든 플랫폼 통합 리더보드, 출시 후 검토)

# 8. 기술 아키텍처 - NW.js 통일
## 8.1 빌드 구조
HELL과 DIROI 모두 NW.js로 통일. Electron 빌드는 보관 후 폐기.
게임
현재 빌드
정식 빌드 (예정)
백엔드
HELL 데모
G:\hell-build\ (NW.js, 로그인 없음)
유지 (BIC/Next Fest용)
—
HELL 정식
G:\hell\Electron\ (폐기)
NW.js 신규 구축
Supabase
DIROI
G:\pentafall\out\DIROI-win64\ (NW.js, OAuth 완성)
동일 구조 확장
Firebase
## 8.2 NW.js 채택 근거
두 게임 모두 HTML5/JS 기반 - NW.js 친화적
DIROI에서 OAuth 정공법 완성 (2026.05.15) - HELL에 패턴 이식 가능
nw-builder + node-main.js로 HTTP 서버 통합
빌드 도구 1개로 통일 시 유지보수 부담 50% 절감
## 8.3 OAuth 정공법 (DIROI 완성)
NW.js .exe 환경에서 OAuth signInWithPopup이 COOP 정책으로 차단되는 문제 해결책.
사용자가 "Google 로그인" 클릭
NW.js의 nw.Shell.openExternal로 시스템 기본 브라우저 호출
외부 브라우저에서 accounts.google.com OAuth 화면 표시
로그인 완료 후 http://localhost:14267/oauth-callback (DIROI) 또는 :3333/oauth-callback (HELL)으로 리다이렉트
NW.js의 node-main.js HTTP 서버가 콜백 받음
게임 창에서 폴링하던 fetch가 토큰 받아 Firebase/Supabase 인증 완료
게임 자동 진입. 로그아웃 시 nw.App.restart() 자동 재시작
## 8.4 백엔드 통합
게임
백엔드
OAuth Provider
주요 테이블
HELL
Supabase (THE EXODUSER, tevlznuhjqcnzgewlswx)
Google
characters, saves
DIROI
Firebase (diroi-40d26)
Google
users, scores
향후 검토: 두 게임의 백엔드를 Supabase 단일로 통합하여 운영 부담 감소.

# 9. 펀딩 전략
솔로 인디 스튜디오 FDG가 HELL+DIROI 개발·운영 자금을 확보하기 위한 7개 채널을 다층적으로 운영. 단일 채널 의존은 리스크 → 분산 전략.
## 9.1 자금 채널 7개
채널
규모
시점
우선순위
국내 정부 지원사업 (KOCCA)
1억~4억
M0~M2 신청
★★★ 최우선
지자체 지원사업 (광주 GICON)
1,000만~5,000만
M0~M3
★★ 병행
국내 퍼블리셔 (네오위즈 등)
1억~5억 + 마케팅
M6~M14
★★ 조건부
해외 인디 퍼블리셔 (Raw Fury)
$50K~500K + 글로벌 마케팅
M8~M14
★★ 조건부
해외 액셀러레이터 (Google IGA)
$10K~50K + 멘토십
M0~M3
★ 부가적
크라우드펀딩 (텀블벅+KS)
5,000만~5억
M13
★★ 마케팅 효과 큼
자체 자금 (EA 매출 재투자)
EA 매출의 60~80%
M2~
★★★ 기반
## 9.2 KOCCA 일반형 게임콘텐츠 제작지원 - HELL 1순위
2026년 콘진원 일반형 게임 제작지원 - PC 분야
지원 규모: 1년차(개발형) 과제당 최대 4억 / 2년차(출시형) 최대 2억
신청 자격: 국내 중소 게임기업 (개인사업자 포함)
지원 항목: 인건비, 게임 개발 도구(엔진/AI/협업 툴) 비용까지 포함 (2026년 신규)
신청 시기: 매년 2월~3월 (2026년 3월 3일 마감)
협약 기간: 4월~11월 (8개월)
HELL 적합도: ★★★ EA 출시 전 "개발형" 신청 → EA 출시 후 "출시형" 신청 가능
신청 채널: e나라도움 (gosims.go.kr)
## 9.3 KOCCA 코리아 인디게임 데브캠프 - 2순위
개인 사업자 트랙
지원 규모: 개인 부문 과제당 최대 8,500만 원 (4단계 경쟁 오디션 통과 시)
총 규모: 60억 원, 1단계 130개 선발 → 4단계 최종 20개
신청 자격: 창업 7년 미만 법인 · 개인사업자 · 예비창업자
단계별 혜택: 개발장려금 + 멘토링 + 해외 전시 참가 (교토, 부산, 쾰른) + 사업화 프로그램
신청 시기: 2월 23일 ~ 3월 23일 (2026년 일정)
FDG 적합도: 개인사업자 등록 완료 → 개인 부문 신청 가능
신청 채널: 콘진원 사업관리시스템
## 9.4 광주 GICON 인디스타즈 - 지역 강점
도진님 거주지 광주 - 지역 우선 혜택
운영 기관: 광주정보문화산업진흥원 (GICON)
대표 프로그램: "광주글로벌게임센터 인디스타즈" (현재 10기 진행)
지원 내용: 입주 공간, 멘토링, 마케팅 지원, 해외 전시 참가 지원
사업 공고: GICON 홈페이지 (www.gicon.or.kr) 수시 공고
FDG 우선순위: 광주 거주 → 지역 우선 혜택 활용 가능, 다른 지자체보다 접근성 압도적
## 9.5 국내 퍼블리셔 (EA 성과 검증 후)
퍼블리셔
대표작
HELL 적합도
DIROI 적합도
네오위즈
스컬, 산나비, P의 거짓, 안녕서울
★★★ 1순위
★★
스마일게이트 (스토브)
데이브 더 다이버 (퍼블리싱)
★★
★★★ 1순위
카카오게임즈 오션드라이브
로스트 아이돌론스, 섹션13
★★
★★
크래프톤 (인디 부문)
마법소녀 루루핑
★
★★
슈퍼크리에이티브
(인디 퍼블리싱 확장 중)
★
★
국내 퍼블리셔 협상 시 주의사항
퍼블리싱 계약 평균: 50:50 수익 분배. 인기 IP는 60:40~70:30까지.
퍼블리셔 가치: "마케팅 + 해외 진출 + 콘솔 이식". 단순 자금만 필요하면 정부 지원이 유리.
EA 출시 후 6~12개월 성과가 좋으면 협상력 압도적 상승 → 무리해서 EA 전에 계약하지 말 것.
계약 전 "Voyer Law Video Game Publishing Agreement Market Report" 등으로 시장 평균 조건 확인.
퍼블리셔에 IP 소유권 양도 거부. 라이센싱 형태만 협상 가능.
## 9.6 해외 인디 퍼블리셔
퍼블리셔
강점
대표작
HELL 적합도
Devolver Digital
B급/예술성 인디, 글로벌 마케팅
Hotline Miami, Cult of the Lamb
★★★ 톤 적합
Raw Fury
예술성·내러티브, 콘솔 이식
Cassette Beasts, Blue Prince
★★★ 적합
Humble Games
인디 큐레이션, 번들 노출
Forager, Unpacking
★★ 적합
Annapurna Interactive
감성·내러티브 프리미엄
Stray, Outer Wilds
★★ 톤 차이
Whitethorn Games
콘솔 이식 전문
Calico
★★★ 콘솔용
11 bit studios
동유럽, 사회성 인디
Frostpunk
★ 톤 차이
Devolver / Raw Fury - HELL에 가장 적합한 후보
Devolver: Cult of the Lamb 같은 "귀여운 외형 + 깊은 게임플레이" 인디 강세. 다크판타지 톤과 부합.
Raw Fury: "Monsters Are Coming" 등 다크 인디 강세. HELL의 매스 러시 ARPG 톤 일치.
둘 다 자율적 인디 운영 존중 + 글로벌 마케팅 + 콘솔 이식 강점.
접근 방법: GDC, Gamescom, BIC 등 페스티벌에서 직접 컨택 또는 데모 빌드 + 피칭덱 이메일.
## 9.7 크라우드펀딩 - 1.0 출시 직전 최강 카드
산나비 사례 - 굿즈 펀딩 14억 3,500만 원
원더포션의 "산나비"는 본편 게임 출시 후 굿즈 펀딩으로 14.35억 원 모집.
한국 인디 게임 크라우드펀딩 표준 모범 사례.
HELL+DIROI 듀얼 IP 활용: 텀블벅 펀딩 → 두 게임 굿즈 + 사운드트랙 + 컬렉터스 에디션 패키지.
타이밍: M13 (1.0 출시 1개월 전). EA 1년 운영 후 팬 베이스 충분히 형성된 시점.
타겟 금액: 텀블벅 1억 (기준) ~ 3억 (낙관), Kickstarter $50K (글로벌).

# 10. 출시 로드맵 (M0~M24)
시점
HELL
DIROI
펀딩/확장
마일스톤
M-1
—
—
KOCCA 신청 (3월)
지원사업 준비
M0 (현재)
Steam 페이지 공개
Steam 페이지 공개
광주 GICON 컨택
위시리스트 시작
M1
Itch.io 데모
Itch.io 데모
BIC/인디크래프트 출품
페스티벌 출품
M2
EA 빌드 작업
★ Steam EA + 스토브
KOCCA 결과 (4월)
DIROI EA 30%
M3
—
EA 핫픽스
EA 매출 안정화
—
M4
EA 빌드 진행
Epic 입점 신청
EA 데이터 수집
—
M5
EA 빌드 진행
EA 업데이트 0.40
—
DIROI Ch.4~5
M6
EA 빌드 완성
Epic 출시
—
—
M7
—
Capacitor 모바일 개발
Google IGA 신청
—
M8
★ HELL Steam EA + 스토브
★ DIROI 안드로이드 출시
KOCCA 출시형 신청
HELL Ch.1~3 ARPG
M10
EA 핫픽스
iOS 출시
—
DIROI 30개국 동시
M11
EA 업데이트 v0.6
EA 업데이트 0.80
—
HELL Ch.4~5
M13
1.0 마케팅 준비
1.0 마케팅 준비
★ 텀블벅 + Kickstarter
크라우드펀딩
M14
EA 업데이트 v0.8
★ DIROI 1.0 정식 출시
퍼블리셔 컨택
DIROI 스토리 완결
M16
★ HELL 1.0 정식 출시
DLC 1
Whitethorn 등 컨택
HELL 7챕터 완결
M18
Switch 이식 시작
—
—
콘솔 진입
M20
Switch 출시
DLC 1 동기화
엑소듀서 본편 기획
—
M22
Xbox/PS 협상
콘텐츠 추가
—
IP 확장
M24
DLC 캠페인 출시
—
—
FDG 팀 확장 검토

## 10.1 Phase별 우선순위
Phase 1 (M-1~M2): 출시 및 자금 확보 (최우선)
KOCCA 2026 일반형 PC 또는 코리아 인디게임 데브캠프 신청 (마감 3월 초·중순)
광주 GICON 인디스타즈 컨택 (도진님 지역 강점)
Steam 페이지 공개 (HELL + DIROI 양쪽), 위시리스트 시작
BIC 2026, 인디크래프트 2026 출품 - 둘 다 진행 중 ✅
Itch.io 데모 배포 → 커뮤니티 시드
M2 DIROI Steam + 스토브 동시 EA 출시
Phase 2 (M3~M8): DIROI 안정화 + HELL EA 출시
DIROI EA 분기 업데이트 사이클 정착 (0.40, 0.60)
Capacitor 기반 DIROI 모바일 빌드 작업 병행
M7 Google Play Indie Games Accelerator 신청 (6~7월)
M8 ★ HELL Steam EA 출시 + DIROI 안드로이드 글로벌 출시
HELL은 ARPG 코어 유저, DIROI는 캐주얼+모바일 유저 동시 확보
Phase 3 (M9~M16): 1.0 완성 + 크라우드펀딩
DIROI EA 업데이트 0.80 + 모바일 동기화
HELL EA 업데이트 v0.6, v0.8
M13 텀블벅 + Kickstarter 동시 펀딩 진행 (HELL + DIROI 패키지)
M14 DIROI 1.0 정식 출시 + 가격 25% 인상
M16 HELL 1.0 정식 출시 + 가격 33% 인상
이 시점 두 게임 평점 "매우 긍정적" 유지가 펀딩 성공의 핵심
Phase 4 (M17~M24): 콘솔 확장 + IP
Switch, Steam Deck 콘솔 이식 (전문 퍼블리셔 위탁 또는 자체)
Xbox Game Pass 협상, PS5 검토
텀블벅 굿즈 펀딩 2차 (1.0 출시 안정화 후)
DLC 캠페인 출시 (ASH RAIDER, 바이킹 여전사)
엑소듀서 본편 또는 다른 스핀오프 기획 시작
FDG 1인 → 외주 협업 → 소규모 팀 확장 검토 (Poncle, Team Cherry 경로)

# 11. 마케팅 전략
## 11.1 코어 메시지
FDG 마케팅 4대 메시지
1. "40년 게이머의 진정성" - 1982년생, 5살부터 오락실 심취한 중년 게이머가 1인으로 직접 만든 게임
2. "오리 + 할로우 나이트급 그래픽 + 베르세르크 + 프롬소프트 작화" - 비주얼 어필
3. "BULLET LANGUAGE 패링 + CHAIN DRIVE 사슬 차지" - 차별화 시스템
4. "100+ 몬스터, 35+ 보스, 48+ 패턴" - 풍부한 콘텐츠
## 11.2 마케팅 채널
채널
콘텐츠
타겟
예상 도달
YouTube
트레일러, 보스전, 시스템 소개
ARPG 코어, 다크판타지 팬
10만+ (한국 인디 평균)
X (Twitter)
GIF, 스크린샷, 개발 일지
글로벌 인디 팬
5천 팔로워 목표 (출시까지)
Discord
데모 테스터 커뮤니티
코어 팬
500명 목표
Reddit
r/IndieGaming, r/SoulsGames
다크 소울라이크 팬
1만+ 노출
인디 인플루언서
Aliensrock, splattercatgaming 등
글로벌 인디 시청자
10만+
한국 매체
디스이즈게임, 인벤, 게임샷
한국 게이머
5만+
BIC 현장 시연
심사위원/관람객 직접 접점
업계 + 코어 팬
수백 명 직접 체험
Steam Next Fest
데모 노출, 라이브 스트리밍
글로벌 PC 게이머
위시리스트 1만+ 가능
일본 매체
Gamer.ne.jp, ファミ通, 4Gamer
일본 코어 게이머
5만+ (일본 시장 두 번째)
## 11.3 비주얼 자산 (제작 중)
32:10 울트라와이드 키 비주얼 (HELL 7챕터 시리즈)
메인 키 비주얼: 대성당 + 일식 + 군단 + 좌측 주인공 + 검은 고양이 + 우측 하단 FOR DEAR GAMERS 사인
색 팔레트: 빨강 + 검정 + 황금 + 보라 단일 액센트
AI 툴: Midjourney (맵), ChatGPT (텍스처/키비주얼), Ludo.ai (스프라이트/VFX), PixelLab MCP (병행), Suno (BGM)
3D 보스 모션: Blender MCP → FBX → PNG 시퀀스 → TexturePacker
## 11.4 페스티벌 출품 일정
페스티벌
시기
참여 게임
역할
BIC 2026
8월 (부산)
HELL + DIROI
심사 대기 중 ✅
인디크래프트 2026
여름 (성남)
HELL + DIROI
5/11 제출 완료 ✅
Steam Next Fest 6월
6/15~22
DIROI (옵션)
결정 필요 (D-19)
Steam Next Fest 10월
10월 중순
HELL + DIROI
확정
BitSummit (일본)
8월 (교토)
DIROI 검토
30개국 번역 자산 활용
TGS (일본)
9월
DIROI 검토
—
Gamescom (독일)
8월
HELL (퍼블리셔 통해)
—
G-STAR (한국)
11월
HELL + DIROI
1.0 출시 직후 마케팅

# 12. KPI 및 매출 예측
## 12.1 HELL PC - 24개월 누적
시나리오
EA 위시리스트
EA 첫 주 판매
24개월 누적 판매
24개월 누적 매출
보수적
10,000
1,000장
8,000장
약 8,000만 원
기준
40,000
4,000장
30,000장
약 3억 원
낙관적
150,000
15,000장
100,000장
약 12억 원
계산: 평균가 $17.5 (EA $14.99 + 1.0 $19.99 가중) × 70% 스토어 수익률 × 1,300원/달러
## 12.2 DIROI PC - 24개월 누적
시나리오
EA 위시리스트
EA 첫 주 판매
24개월 누적 판매
24개월 누적 매출
보수적
5,000
500장
6,000장
약 5,000만 원
기준
20,000
2,000장
20,000장
약 1.6억 원
낙관적
100,000
10,000장
60,000장
약 5억 원
## 12.3 DIROI 모바일 - 24개월 누적
지표
보수적
기준
낙관적
24개월 누적 다운로드
20만
100만
600만
피크 DAU
1,500
8,000
50,000
ARPDAU (광고+IAP)
$0.05
$0.10
$0.20
24개월 누적 매출
약 3,000만 원
약 4억 원
약 30억 원
## 12.4 지원금 + 펀드 - 24개월 누적
채널
보수적
기준
낙관적
KOCCA 일반형/데브캠프
0 (탈락)
8,500만 원
4억 원
광주 GICON 등 지자체
0
2,000만 원
5,000만 원
크라우드펀딩 (텀블벅+KS)
3,000만 원
5,000만 원
2억 원
퍼블리셔 어드밴스
0
5,000만 원
5억 원
합계
약 3,000만 원
약 1.5억 원
약 3억 원
## 12.5 24개월 누적 합계 (HELL + DIROI + 지원금)
시나리오
PC 매출
모바일 매출
지원금/펀드
총합
보수적
약 1.3억
약 3,000만
약 3,000만
약 2.0억
기준
약 4.6억
약 4억
약 1.5억
약 10.1억
낙관적
약 17억
약 30억
약 3억
약 50억
## 12.6 핵심 KPI 목표
KPI
HELL 목표
DIROI 목표
근거
EA 출시일 위시리스트
40,000+
20,000+
다크 인디 ARPG + 30개국 번역
EA Steam 평점
매우 긍정적
긍정적 이상
산나비, VS 등 기준
모바일 D7 잔존율
—
10%+
캐주얼 평균 8~12%
광고 시청률 (DAU)
—
60%+
보상형 위주 설계
광고 제거 IAP 전환율
—
1.0%+
VS 추정치
1.0 출시 평점
매우 긍정적
매우 긍정적
Dead Cells, Hades 기준
1.0 출시 시 위시리스트
150,000+
100,000+
EA 14개월 누적

# 13. 리스크 및 대응
## 13.1 주요 리스크 8가지
리스크
발생 가능성
영향도
대응 방안
KOCCA/지원사업 전부 탈락
낮음
치명적
3개 다 신청, 1개 합격 확률 통계적으로 높음
Steam KYC 거부 (반복)
낮음
치명적
사업자/은행 명의 통일, 재제출 준비 (현재 진행 중)
EA 출시 후 위시리스트 부진
중간
치명적
Next Fest + BIC + 인플루언서 3중 노출
NW.js OAuth 호환성 회귀
낮음
높음
DIROI 패턴 검증 완료, 핫픽스 가능
1인 개발 번아웃
높음
치명적
주 6일 작업, 일요일 절대 휴식, BIC 후 1주 휴가
퍼블리셔 미체결
중간
보통
셀프 퍼블리싱 + Steam Direct로 자력 출시 가능
크라우드펀딩 미달성
중간
보통
EA 1년 후 진행, 부가 채널화 (핵심 의존 금지)
콘솔 이식 비용 초과
중간
보통
Switch는 Whitethorn 위탁, Steam Deck은 자동
## 13.2 절대 안 하는 것 (FDG의 약속)
Self-Imposed Rules
1. 가챠 (캐릭터/무기/스킨 랜덤 뽑기) - 절대 도입하지 않음
2. 시즌 패스 ("패스 안 사면 손해" 구조) - 도입하지 않음
3. 시간 게이트 (에너지, 대기 시간, 광고 시청 강요) - 도입하지 않음
4. P2W (결제 시 게임플레이 유리) - 절대 도입하지 않음
5. 강제 광고 (게임플레이 중 인터럽트) - 도입하지 않음
6. EA 중 가격 인상 (1.0 시점 제외) - 하지 않음
7. PC 구매자에게 추가 IAP 강요 - 하지 않음. 단품 구매로 모든 콘텐츠 제공
8. 퍼블리셔에 IP 소유권 양도 - 거부. 라이센싱 형태만 협상 가능
9. 어택 티켓 시스템 (HELL의 핵슬 정체성 훼손) - 절대 도입하지 않음
10. AI 생성 자산 표기 의무 위반 - Steam/플랫폼 정책 준수
## 13.3 백업 계획
git AutoGit 시간별 커밋 (현재 운영 중)
Electron 폴더 보관 (NW.js 이주 실패 시 rollback)
Steam 빌드와 별도로 itch.io DRM-free 빌드 유지 (Steam 차단 시 대안)
Supabase/Firebase 데이터 주 1회 백업
두 게임 동시 개발 - 한 작품 일정 지연 시 다른 작품으로 마케팅 유지

# 14. 부록
## 14.1 통합 가격표
플랫폼
HELL
DIROI
Steam EA
₩19,800 / $14.99
₩9,900 / $7.99
Steam 1.0
₩24,500 / $19.99
₩12,500 / $9.99
스토브 EA
₩19,800
₩9,900
스토브 1.0
₩24,500
₩12,500
Epic
₩24,500 / $19.99
₩12,500 / $9.99
GOG (1.0 후)
₩24,500 / $19.99
₩12,500 / $9.99
Itch.io
데모 (PWYW)
데모 (PWYW)
사운드트랙 DLC
₩6,500 / $4.99
₩3,900 / $2.99
DLC 캠페인
₩12,500 / $9.99
—
Google Play (DIROI)
—
무료 / 광고 제거 ₩5,500
App Store (DIROI)
—
Google Play 동일
## 14.2 펀딩 캘린더 (연간)
시기
프로그램
신청 마감
1~2월
지자체 사업 사전 공개 (광주 GICON 등)
공고별 상이
2~3월
KOCCA 일반형 게임 제작지원
3월 초
2~3월
KOCCA 코리아 인디게임 데브캠프
3월 23일
3~4월
서울 SBA 게임콘텐츠 사업화 지원
공고 확인
6~7월
Google Play Indie Games Accelerator
7월 초
연중
광주 GICON 인디스타즈 등 지자체 수시 공고
공고 확인
연중
스마일게이트 IndieGo, 스토브 ECO 프로그램
공고 확인
연중
네오위즈·카카오게임즈 인디 퍼블리싱 상시 문의
상시
연중
해외 퍼블리셔 (Raw Fury, Devolver 등) 컨택
상시
## 14.3 기술 스택
영역
기술
비고
웹/PC 코어
NW.js (HELL + DIROI 통일)
Vite는 DIROI만, HELL은 단일 HTML
스팀 통합
Steamworks SDK + greenworks
업적, 클라우드 세이브
Epic 통합
Epic Online Services SDK
EOS (무료, 평생)
스토브 통합
Stove Indie SDK
한국 등급분류 통합
모바일 (DIROI)
Capacitor
Vite 코드 재활용
광고 (DIROI 모바일)
Google AdMob + 미디에이션
AppLovin, Unity Ads
분석
Tenjin + Sensor Tower
ARPDAU, 잔존, eCPM
계정 통합
EOS Account Linking
5-way 연동 (Steam/Epic/Switch/Google/Apple)
진행도 동기화
EOS Player Data Storage
유저당 4MB 무료
콘솔 (Switch)
Whitethorn 위탁 또는 자체 SDK
검토 중
백엔드
Supabase (HELL) / Firebase (DIROI)
통합 검토 중
## 14.4 빌드 위치 레퍼런스
빌드
경로
상태
용도
HELL 데모 (NW.js)
G:\hell-build\
활성
BIC/Next Fest 데모
HELL 정식 (NW.js)
TBD (신규 구축 예정)
계획
Steam 출시용
HELL Electron (구)
G:\hell\Electron\
폐기 예정
백업 후 보관
DIROI (NW.js)
G:\pentafall\out\DIROI-win64\
활성
OAuth 완성 빌드
## 14.5 주요 자격증명 및 식별자
법적 이름 (여권 영문): SIM DOJIN
일반 영문 표기: Shim Dojin
사업자명: FDG (FOR DEAR GAMERS)
사업자등록번호: 767-32-01971
주소: 광주광역시 남구 용대로 92-1
Steam 계정: simsia1987@gmail.com (계정명: shimdojin)
Steam Direct: $100 결제 완료 (HELL용)
비즈니스 이메일: contact@voisun.com
전화: +82-10-6758-2189
Firebase 프로젝트 (DIROI): diroi-40d26
Supabase 프로젝트 (HELL): tevlznuhjqcnzgewlswx (THE EXODUSER)
Google OAuth Client ID (DIROI): 481724501638-s0ttgrhhpa9vlilm8fm0o58jllpkirq7
## 14.6 즉시 액션 리스트 (이번 주)
BIC 2026 심사 결과 확인 (5/16 이후)
Steam KYC 회신 모니터링 (Thelma)
Steam Next Fest 6월 vs 10월 결정
HELL Electron 폴더 백업 (G:\hell\Electron-archived-20260515\)
Steam Direct 추가 결제 검토 (DIROI용 $100)
KOCCA 2026 공고 정독, 일반형 PC와 데브캠프 둘 다 신청 준비 (3월 마감 대비)
광주 GICON 홈페이지 인디스타즈 모집 공고 확인
스마일게이트 메가포트 (stove.store@smilegate.com) 입점 문의 이메일 발송
Itch.io 데모 빌드 업로드 준비
EOS SDK 통합 가능성 사전 검토
## 14.7 참고 자료
Hollow Knight, Dead Cells, Hades 출시·운영 사례 분석
산나비 (Sanabi) 한국 인디 ARPG 글로벌 성공 사례
Vampire Survivors 모바일 출시 분석 (Pocket Gamer, Kotaku, 2023)
한국 모바일 게임 시장 인사이트 (Sensor Tower, AB180, 2024)
KOCCA 2026 게임지원사업 설명회 자료집 (kocca.kr)
광주정보문화산업진흥원 (GICON) 인디스타즈 공고
스토브 인디 창작자 센터 (forcreators.stoveindie.com)
Google Play Indie Games Accelerator 공식 페이지
Raw Fury, Devolver Digital 공식 사이트 (퍼블리싱 문의)


— 끝 —
FOR DEAR GAMERS  ·  2026
사랑하는 게이머들에게.