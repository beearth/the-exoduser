# DESIGN

## 1줄 정의
다크 판타지 핵앤슬래쉬 선형 스토리 ARPG. 로그라이트 아님.

## 핵심 차별화 2개
BULLET LANGUAGE 색-키 매칭 패링
CHAIN DRIVE Shift 홀드 tier 작살 기동

## 콘텐츠 규모
35스테이지 이상 / 35보스 이상 / 7챕터 / 6원소 / 22 액티브 이상 / 30 패시브 / 21 합체 이상 / 55 어픽스 이상 / 100종 몬스터 이상. 전부 이상 표기 유지.

## 아트 디렉션
맵 대기 Ori
실루엣 밀도 Hollow Knight
캐릭터 크리처 Berserk + FromSoftware
사운드 모션 Zelda BotW TotK
컬러 빨강 검정 황금 보라
금지 디자인 뿔악마 날개드래곤 갑옷해골병사 색바꾼슬라임 큰늑대 큰거미
오브젝트 스케일 캐릭터 180cm 기준. 문 210 횃불 40 상자 60 바위 50~150 나무 800~1200. 미적 과장 금지.

## 절대 금지
어택 티켓 시스템
일반몹 엘리트 히트스톱 [보스 한정]
게임루프 내 new splice filter forEach Date.now

## 불변 보호 영역
ELC[] ETYPE_COL[] _tseed() StageSeeder 보스콤보 idx0~48 CIN_LINES[] _INTRO_LINES 강화확률공식 업그레이드공식 컷신이미지매핑 ProxyX배칭

## 성능 봉인
평상시 140fps 이상 / 700마리 60fps / 격전 17ms 55fps
game.html 워밍업 47줄 수정 금지

## 빌드 티어
G:\exoduser 본섭 3333
G:\exoduser-DEMO itch 1-1 LV100
G:\exoduser-ea Steam EA 1챕터 LV500 14.99
G:\exoduser-release 7챕터

## 작업 규칙
편집은 str_replace 전용. 전체 재작성 금지.
커밋 push rebase 금지. 도진님 명시 지시 시에만.
game.html 편집은 main 브랜치에서만.
병렬 세션 4개 정상 운용. game.html 만 LOCK 배타.

## 원본 문서 포인터
GDD docs\HELL_EXODUSER_GDD_v4_2_BIC2026.docx
세계관 docs\HELL_EXODUSER_WORLDVIEW_v1.md
스토리 docs\HELL_EXODUSER_스토리바이블.docx
아키타입 docs\archetypes\
시네마틱 docs\cinematic\ACT1_CINEMATIC_STORYBOARD_v1.md
행사일정 docs\2026_하반기_게임행사_일정_v2.md
빌드체크 docs\HELL_EA_BUILD_CHECKLIST.md [경로 구버전 참고용]
맵 SSOT docs\4.1맵디자인+설정\_MAP_SSOT_INDEX.md [14문서 인덱스 P0 6종+P0.5 8종, c1024b7c]
