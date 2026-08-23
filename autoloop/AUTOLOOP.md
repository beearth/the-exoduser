[AUTOLOOP v1] EXODUSER 자율 작업 루프

=== 0. 환경 ===
루트: G:\exoduser (git 저장소)
주파일: G:\exoduser\game.html
서버: localhost:3333
G:\hell 은 구 빌드 복사본. 절대 건드리지 말 것.
편집은 str_replace 전용. 파일 전체 재작성 금지. 커밋 금지 (명시 지시 시에만).
상태파일: G:\exoduser\STATUS.md (CURSOR/CYCLE/FAILSTREAK/QUEUE/DONE LOG/PENDING/BLOCKED)
인박스: G:\exoduser\INBOX.md (사람이 넣는 우선처리 지시)

=== S0. INBOX 스캔 (매 사이클 최초) ===
사이클 진입 시 먼저 G:\exoduser\INBOX.md 를 읽는다.
- [NEW] 로 시작하는 미처리 항목이 있으면: 그 항목을 QUEUE 맨 앞에 임시 삽입하고 CURSOR 를 그 항목으로 돌린다. 처리 후 INBOX 해당 줄을 [DONE] 로 표시한다.
- [NEW] 항목이 없으면: 기존 CURSOR 항목을 그대로 진행한다.
INBOX 편집도 str_replace 전용. 없는 파일이면 스캔 스킵.

=== S0.5 세션 가드 ===
- 브랜치가 main 이 아니면 코드 파일 편집 금지. 문서 항목만 처리. CURSOR 가 코드 항목이면 BLOCKED 기록 후 STOP.
- game.html 편집 항목인 경우에만 autoloop\LOCK.gamehtml 확인. 존재하면 STOP. 없으면 생성 후 작업, 작업 종료 시 삭제.
- 문서 전용 항목은 LOCK 무시하고 진행.
- 커밋 push rebase 전면 금지. 필요하면 BLOCKED 에 기록하고 도진님 지시 대기.
- game.html 편집 시작 전 autoloop\snap.cmd 1회 실행.

=== 1. 상태 파일 확인 ===
최초 1회: G:\exoduser\STATUS.md 존재 확인.
없으면 아래 스키마로 생성. 있으면 읽고 CURSOR 다음 항목부터 재개.

# AUTOLOOP STATE
CURSOR: Q01
CYCLE: 0
FAILSTREAK: 0
## QUEUE
Q01 [TODO] 스트리밍 STEP 2
Q02 [TODO] perf 기준선 측정 준비
Q03 [TODO] ATMOS PHASE 2 부유 파티클 패럴랙스 + 광선 빔
Q04 [TODO] ATMOS PHASE 3 전경 실루엣
Q05 [TODO] 부스 버그 3종
Q06 [TODO] ATMOS PHASE 4 모션 3페이즈 재정의
Q07 [TODO] SFX 5레이어 + 16채널 우선순위
Q08 [TODO] BULLET LANGUAGE 패링 시그니처 사운드
## DONE LOG
## PENDING-RUN
## PENDING-PERF
## BLOCKED

=== 2. 사이클 프로토콜 ===
1사이클 = 아래 7단계. 중간에 도진님 확인 요청 금지. 사이클 끝나면 즉시 다음 사이클.

S1 진단: CURSOR 항목 관련 식별자를 grep. 히트 라인번호와 원문 인용.
S2 계획: 편집 지점 최대 3곳 확정. 4곳 이상 필요하면 항목을 쪼개서 큐에 재삽입 후 첫 조각만 진행.
S3 편집: str_replace 실행. 한 사이클 한 파일.
S4 검증:
  V1 grep으로 신규 문자열 존재 확인
  V2 편집 헝크 괄호/중괄호 균형 확인
  V3 편집 헝크에 new / splice / filter / forEach / Date.now() 없음 확인 (게임루프 내 금지)
  V4 git diff --stat 으로 변경 파일 1개 확인
  V5 불변 보호 영역 라인이 diff에 미포함 확인
  하나라도 실패 시 git checkout -- game.html 로 롤백, FAILSTREAK +1, BLOCKED 기록.
S5 런타임 미검증 항목은 PENDING-RUN 에 적재. 성능 재측정 필요 항목은 PENDING-PERF 에 적재. 루프는 멈추지 않음.
S6 상태 파일 갱신: CURSOR 다음 항목, CYCLE +1, DONE LOG 1줄 추가 (항목ID / 라인번호 / 변경요약 20자 이내).
S7 다음 사이클 진입.

=== 3. 절대 규칙 ===
불변 보호 영역 (수정 시 즉시 STOP):
ELC[] / ETYPE_COL[] / _tseed() / StageSeeder / 보스 콤보 idx 0~48 / CIN_LINES[] / _INTRO_LINES / 강화 확률 공식(99 x 0.99^n%) / 업그레이드 공식 / 도입 컷신 이미지 번호 매핑 / ProxyX 배칭.

게임루프 금지 패턴: new / splice / filter / forEach / Date.now(). 오브젝트 풀링 필수. 캔버스는 boot에서 1회 생성.

성능 봉인 기준: 평상시 140fps 이상 / 700마리 60fps / 격전 폭타 17ms 55fps.
game.html line 49342-49389 워밍업 47줄 수정 금지. 추가 진단 봉인 유지.

스트리밍 제약: 재합성 임계값 = 패딩 - 1타일. 임계값만 올리고 패딩 안 늘리면 블리드 재발.

히트스톱은 보스 한정 (메인보스/장보스/최종보스). 일반 몹/엘리트 금지.

=== 4. 아트 디렉션 상수 (전 작업 공통 적용) ===
맵/대기: Ori 계열. 다층 패럴랙스, 광원 산란, 부유 입자, 안개 깊이. 원색 남발 금지.
실루엣 밀도: Hollow Knight 계열. 전경 검정 실루엣 레이어로 프레이밍, 배경은 저채도 후퇴.
캐릭터/크리처: Berserk 만화 + FromSoftware. 살덩어리 변형, 눈알/입 기반 무기화, 인간 흔적 잔존.
금지 디자인: 뿔 악마, 날개 드래곤, 갑옷 해골병사, 색만 바꾼 슬라임, 그냥 큰 늑대/거미.
컬러: 빨강 + 검정 + 황금 + 보라.
사운드/모션: Zelda BotW/TotK. 예비-타격-후딜 3페이즈 명확 분리, 캔슬 윈도우 시각 표시, 임팩트 5층 동시 발화.
오브젝트 스케일: 캐릭터 180cm 현실 비율. 문 210cm / 횃불 40cm / 상자 60cm / 바위 50~150cm / 나무 800~1200cm. 미적 과장 금지.

=== 5. 큐 상세 ===
Q01 스트리밍 STEP 2: 청크 퇴거 주기 60 -> 180, 마진 2 -> 4, 단일 청크 패스 삭제. STEP 1(마진 2->4, 임계값 T*1->T*3)은 적용 완료 상태이므로 중복 편집 금지.
Q02 perf: ?perf=1 진입 시 [FRAME HITCH] / [MAP STREAM SPIKE] 로그가 정상 출력되는지 코드 경로만 확인. 수치 측정은 PENDING-PERF 로 이관.
Q03 ATMOS PHASE 2: drawAtmosphere 내 부유 파티클 패럴랙스 레이어 + 광선 빔 추가. 파티클은 기존 _ambData 풀 재사용, 신규 alloc 0. PP_TONE 챕터 인덱스 테이블 준수.
Q04 ATMOS PHASE 3: 전경 실루엣 레이어. 카메라 이동 대비 배속 패럴랙스. 플레이어 가림 시 알파 감쇠.
Q05 부스 버그 3종: (a) 게임패드 입력이 유휴 카운터를 초기화하지 않음 (b) 프레임 기반 타이머가 140fps에서 오작동 - 시간 기반으로 전환하되 루프 내 Date.now() 금지, 프레임 시작 시 캐시한 _now 재사용 (c) startGameFromDB() 오프라인 불가 - 로컬 폴백 경로. BOOTH_MODE 시스템 기존 커밋 존중.
Q06 모션 3페이즈: 22 액티브 스킬 모션을 예비/타격/후딜로 재정의, 캔슬 윈도우 시각 표시.
Q07 SFX 레이어: impact / cloth / metal / voice / environment 5층. 16채널 동시 재생, 우선순위 흡수 (SKILL 10 / VOICE 9 / DEATH 4 / HIT 2 / PROJ 1). 게임루프 내 alloc 0.
Q08 패링 시그니처: Q 무지개콩 패링(sBlock) 정답음 / E 빨간콩 패링(sBash) 정답음 / 오패링 음 3종 분리. 오패링은 탄이 그 자리 폭발 + 풀뎀 + 넉백 + 슬로우모 (반사/변환 아님).

=== 6. STOP 조건 ===
아래 발생 시 루프 중단하고 도진님에게 1줄 보고:
- 불변 보호 영역 수정이 불가피할 때
- 금지 패턴 없이는 구현 불가할 때
- grep 히트가 0개이거나 의도 지점이 2곳 이상 모호할 때
- FAILSTREAK 이 3 도달
- QUEUE 전부 DONE

=== 7. 사이클 보고 포맷 (사이클당 최대 6줄) ===
CYCLE n / Qxx
GREP: 파일:라인 (히트 수)
EDIT: 라인 -> 변경요약
VERIFY: V1-V5 결과
PENDING: RUN 또는 PERF 항목
NEXT: Qyy
