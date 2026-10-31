# 웹 입력 소비 상태와 사슬 연결 — 2026-10-31

기준b9cf4e5820d4ce13dbe24fdb923183156b4148b8의 실제 조작 입력 후속 소스 후보다. Core 소유11종/미이식44종 그대로다. 실제 Player/M1·NativeUI 저장3단계·입력장치·영상·1x·공통/Desktop은 미완료 **NOT_READY**다. 이 변경은 HID 종료 정지의 해결책이나 우회가 아니다. Both2 입력 설정은 유지한다.

| 구분 | 웹 실제 상태 | 이전 연결 | 후보 |
|---|---|---|---|
| 키보드 act/just | K, just 읽으면K만false | Unity Down 순간만 전달 | K 소비 상태 보관·실제 조건이 열릴 때 읽음 |
| 키보드 held | KH, K 소비와 별개 | 물리 홀드 | KH 유지 |
| 마우스 act/held | MB, 명시적으로false면 새 mousedown 전까지false | 물리 홀드로 다음 틱 다시true | 물리 상태와 행동 상태 분리 |
| 마우스 just | MBjust, 읽으면false·틱 끝 일괄false | 프레임 Down | 동일 소비, 빠른 down/up도 just 유지 |
| 주/보조 바인드 | 주 입력이true면 보조 just는 읽지 않음 | Down OR | 같은 단락평가 |
| 기동파괴 입력 | 발사 지연3틱이 지난 뒤 isJust(shield)→weapon | 발사 직후 키 입력 누락 | 키 K 버퍼를 조건 성립 때 소비 |
| 기동파괴 착지 | MB2·MBjust2·K.KeyE만false, KH.KeyE 유지 | combatEHeld도false | 홀드 유지·새 진입만 소비 |
| 같은 틱 착지 뒤 | 소비된 무기 act/마법 held는 다시 읽음 | Tick 초반 값이 남음 | 공급자에서 재조회해 소비 반영 |

SourceInputBuffer는 SetPhysical/Act/Held/Just/ClearCode/EndTick/Reset을 제공한다. 실제 웹 _chkAct/_chkJust/_chkHeld/isJust를 실행한64조건·5,120동작·**53,512값0**이다. keydown 반복 이벤트를 직접 주입하면 K를 다시 세울 수 있으나 Native의 실제 OS 자동 반복 이벤트 생성은 이 검사 범위 밖이다. 현재 Native는 InputSystem Down/물리 상태를 폴링하므로 OS 문자 반복과 완전 동일하다고 주장하지 않는다.

기동파괴 연속 검사는 이전의 isJust 무동작 스텁을 벗어나 K/KH·실제 isJust/isAct/isHeld·실제 idle case를 실행했다. 216조건×50틱=10,800프레임에서 **176,112값0**이다. 발사 직후0/1/2/5틱의 E 입력 후 계속 홀드, Lv1/10/20·티어1/2/3·비용 직전/정확/여유·방향0/.8을 포함한다. 착지 때 KH까지 지우던144차이를 RED로 보존하고 combatEPrev에 소비 경계를 반영해0으로 수정했다.

NativeKeyBindInput의 기존 Down/Held API는 유지한다. 실제 게임 조작에는 SourceAct/SourceHeld/SourceJust를 별도로 연결한다. 각 Unity 렌더 프레임에서 물리 상태를1회 읽고, 시뮬레이션 틱 끝에 마우스 just만 지운다. ClearSourceCode는 논리 액션이 아닌 웹 원문 literal 코드(mouse2/KeyE)를 지우므로 사용자 바인드를 임의로 바꾸지 않는다.

Simulation의 SourceJustInput/SourceActInput/SourceHeldInput/SourceClearInput 공급자는 실제 FixedUpdate의 한 틱에만 붙이고 finally에서 해제한다. StepInput·CPU·스크립트 검수·첫 훈련은 기존 명시 입력 경로를 유지한다. 새 실행 때 원문 입력 버퍼를 초기화한다. Native 연결은 설치 참조 컴파일까지 확인했으며 실제 키보드·마우스·패드와 실제 Player 동작은 아직 미검증이다.

고정43묶음 **9,107,540비교단위 불일치0**, 설치 Unity 참조 Core/Runtime 오류0(기존경고2/17). 근거: 키마입력-소비상태-원문.json, 기동파괴-키보드홀드-원문-r2.json, source-buffer-green/, chain-source-held-red/·green/, source-input-final-cpu/, source-input-independent-compile-r1/. 현재 시스템의 공식 메모리 여유10GB 조건을 지켜 신규 GPU/Player 실행0이다. 사용자 저장·장치·서비스·권한 변경0, 종료 취소/추가kill0이다.

### 2026-10-31 기동불꽃 현행 소스 범위

[상세 계약](UNITY_CHAINASSAULT_PARITY_20261031.md) — 기동불꽃 비합체 소스 후보를 추가해 현재 Core 실행·학습·저장 소유12종/미이식43종이다. MP20+Lv×2 예약, 직격450+(Lv−1)×25, 중첩3/6/9배 수명·20틱DOT·3기폭 호출·구형별칭/숙련 복원·실제키마소비를 대조했다. 고정55묶음10,989,987단위0·설치참조 오류0. 원본 착지/기폭시트·장판 묶음mesh·24틱광원·기동불꽃 SFX 후보 연결, 실제Player/M1/UI3단계/영상/1x/공통/Desktop/Mac은 미완료 NOT_READY다.

### 2026-10-31 비사슬 동시 입력 우선순위

실제 idle 원문·입력 소비함수를 실행해 E/LMB/마법/Q/Shift와 장판 유무를 대조했다. 기존768조건4,608값에서128차이를 재현했고 현재 제품은0이다. 일반공격과 기검 Lv1/3/20, ST0/4/5/9/10/14/48/100까지6,144조건36,864값도0이다. 비용은 이 검사의 통제값이며 일반5, 기검10+(Lv−1)×2다.

| 입력·경계 | 웹과 현행 Core | 수정 전 |
|---|---|---|
| LMB+E, 공격ST충분 | Q/Shift+E기폭 다음 무기 우선; E just 미소비 | E가 먼저 sDraw로 진입·ST미소모·E소비 |
| LMB+마법, 공격ST부족 | 공격을 못 하면 뒤의 마법 분기 진행 | LMB홀드만으로 마법 전체 차단 |
| LMB+E, 공격ST부족 | E진입 허용 | 기존 동작 유지 |

`IdleWeaponHasPriority`는 실제 공격 비용을 낼 수 있을 때만 참이다. Q/사슬/기폭·이동·공격비용·쿨다운을 변경하지 않는다. 통제 원문은 useStPct의 자원 차감만 명시값으로 공급하며 적·시각·OS입력 검수로 확대하지 않는다. 근거 `I:/EXODUSER-Storage/demo-art/gameplay-parity/resume-20261031-0900/`의 비사슬-동시입력-RED.json·비사슬-동시입력-성장원문.json·비사슬-동시입력-GREEN제품.json, 입력검사.csproj와 NonChainPriorityProgram.cs. 설치 Unity 참조 제품 Core127/Runtime176소스 컴파일 오류0(기존경고2/17).

현재 제품의 기존55묶음10,989,987비교단위도 모두0이다(`resume-20261031-0900/product-input-cpu/영수증.json`). 새 입력 성장36,864값을 합친56묶음11,026,851값0은 CPU범위이며 실제 Player검수로 확대하지 않는다.
