# Unity 능력치 실상태·계획 이식 — 2026-11-02 3차

웹 기준은 origin/main stat-panel-ui.js와 game.html applyStats/_processPassiveQueue, growth-tree-fixed-background.css다. 기존 A13의 미이식 상태 표는 2026-10-26 당시 기록이며 현행 상태는 아래 표를 따른다.

| 항목 | 현행 구현·수치 |
|---|---|
| 실상태 | Simulation.Growth: stats STR/DEX/INT/VIT/LCK, passives26, grit, player.passiveQueue. UI는 STR/DEX/INT/LCK/GRIT 5노드·패시브26허브/260랭크·265개 정의 |
| 비용·상한 | 일반 능력치 1SP/점·500상한, GRIT 1SP/점·int범위 무제한. 패시브10랭크, 비용1/1/1/2/2/2/3/3/3/5 AP, 이후기존레거시환불5 |
| 계획 | Base의 실제 투자값이 변하면 계획 폐기·새로 생성. SP/AP 실제잔고로 검증하고 비용부족·음수·상한초과·stale 적용 거절. 변경 적용 전에는 전투값·저장 불변. 전체환불·개별환불·취소·적용 연결 |
| 예약 | AP부족 또는 기존큐 있으면 즉시 FIFO예약·저장 요청. 개별취소, 같은패시브 총10랭크상한. 짝수레벨 AP획득 뒤 앞순서 비용을 감당할 때만 자동투자. 환불로 낮춘 패시브의 기존 예약은 적용 때 제거 |
| 수치 표시 | 길 카운터·습득/변경필터·노드뱃지·랭크별·AP잔고·현재→다음/계획 기여는 실제 live/draft 값. 미이식 문자열/대시 제거. 변경목록·예약목록은 우측 스크롤 안에 표시 |
| 실제전투 연결 | STR ATK/HP/리젠, DEX ST/공속/이속/석궁입력, INT MP/쉴드/마법ATK/리젠, LCK 치명/드랍, GRIT HP·MP·ST +1/점과 전체GRIT 방어 floor(×.5). pAtk/Magic/Melee/Bow/Xbow·Human/Demon·Critical/Drop·Vital/Stamina/Fortify/Armor·Rage/Malice 기존입력에 연결. PParry/PRegen/PGuard/PCharge 입력만 전달하며 보호공식은 변경0. 풍요/포식/침식축적/추적자 적피해 입력과 HP/ST/MP 회복배율 연결 |
| 자원 보호 | 장비 계산→성장기여→maxima 대입→현재값 min 순서. 투자/반복 장비갱신으로 HP/MP/ST/쉴드 치유0·중복가산0 |
| 저장 | 기존 combat-save-v1 root stats/passives/grit와 player.passiveQueue를 동일 web키로 보존. 미지 top/중첩키·비소유 섹션 유지. load의 음수/비정수/범위밖 투자값 및 present stats/passives/player 비Object, passiveQueue 비Array/비문자열원소, gritCostModeV2 비Bool은 쓰기금지 경로로 반환. 필드 누락은 허용하되 명시 null은 읽지 못한 기존값 보존을 위해 실패폐쇄한다. 기검참 강화레벨1~20도 CaptureSkills→Config.KiSlashLevel 저장/복원 연결 |
| 구형 근성 비용 이관 | grit>0·마커없음/false면 옛누적SP=grit×3+(grit−1)×grit/2, 환불=옛누적−현재grit=grit×(grit+3)/2. 실제복원SP에 1회 더한 뒤 marker=true 저장. grit10/SP0→SP65. 환불 int범위 또는 잔고합산 overflow는 BlockCombatSave. 미환불 상태의 WriteInto도 거절해 marker만 먼저 전환 불가 |
| 미지원 표시·투자 차단 | pPierce는 효과0이므로 신규투자/예약 버튼·API 비활성, 기존값 환불 허용. pDot(DOT피해/지속)·pPred(이속)·pRegen(물약쿨)·pGuard(보호중HP리젠)는 선택 상세에 효과 일부 미지원과 현재적용범위를 표시 |
| 배경 | 웹과 같은 CloudFront 기사원화1120×896, 동일 CSS .17 검정·ellipse66%74%/55→100%마스크, viewport고정. 확대/이동하는 트리와 별도, Art/ui/stat/knight_background.png. 원본URL/SHA는 third/stat/background-source.json |

## 검증과 한계

I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/third/stat/: red.json(성장상태 누락 재현)·red-live.json(실전투 미연결 재현) → green-malformed-legacy.json **7311 검사 PASS**. 웹 evaluatePlan2200입력, 비선형 AP비용·FIFO차단/취소·실투자·stale거절·전체환불·unknown저장·무치유·반복장비·마법합연산을 검사했다. 추가 malformed/legacy회귀 red-malformed-legacy.json→green-malformed-legacy.json은 정상구형근성의65SP환불·동일인스턴스/저장재로드 중복0·마커저장순서·overflow실패폐쇄·실패전후원본raw불변·중첩unknown왕복을 포함한다. live-web-stats.json은 실제 웹 applyStats 정본을 같은장비에 실행한 값(STR1:HP532, STR1/DEX1/INT1/GRIT2:HP534/MP484/ST244/쉴드290). STR기여표+5는 장비HP배율 전의 기본기여이며 실제최대HP는526→532다.

전체 Core/Runtime 독립컴파일 오류0. 기존경고 유지. 최종 정식빌드/Player/M1/1920·3840 나란히비교·입력·지속성 검수는 부모의 동일패키지 영수증에 연결하며 이 문서만으로 시각PASS 선언하지 않는다.

남은 경계: 현재전투능력치 요약 drawer, 웹 원본의 일부 조건부 이동/물약쿨/관통·DOT지속 소비는 기존 executor 미지원 범위다. 기여표는 웹 정의이고 모든 조건부효과를 구현완료로 해석하지 않는다. 선택 상세에서 미지원 효과를 확인할 수 있고 관통의 신규 AP소모는 막았다. pHunter는 현재 EnemySpawn에 존재하는 etype>=90 분기만 연결했으며 원본의 isBoss/isElite 별칭 자체가 없는 상태는 생성하지 않았다. 일반 mouse·전체언어·청음·전체패시브전투oracle는 미검증. 제작자 자체판정은 Player 실물 이후 기록한다.

## 첫 정식 Player 뒤 시각 정합 — 3차 후속

첫 Player `third/ui-first-retry/1920x1080-ko-3차-능력치.png`와 웹 `third/web/stat-1920.png`를 직접 1x로 비교했다. 웹3384 동일 source에서 무음·API쓰기차단 fixture로 실제 DOM과 PNG를 재확인했고 브라우저/임시프로필을 종료·삭제했다. 측정 원문은 `third/stat/visual/dom.json`, 부모의 전체 CSS 측정은 `third/web-layout/stat-1920.json`이다. 게임 기능·저장/Core 수정0, NativeStatPanel 렌더/입력rect만 수정했다.

| 요소 | 웹 측정에 맞춘 현행 설계 좌표·스타일 |
|---|---|
| 트리 | viewport (283,148,1150,793), 고정 기사 배경·자동 scale, 원점/선택 경로는 금색→웹 회색. 값0배지는 selected/hover에서만, 투자값>0은 유지 |
| 우측 원화판 | inspector (1453,148,420,845), same iron_covenant frame 원본 resource inner_rail_iron_covenant 4% source slice/6px 테두리. detail (1477,210,372,585.2)·실제내용폭366, 제목라벨(1477,170) |
| 글꼴·기여 | 웹과 같은 기존 Hahmlet400. 이름36/투자값25/기여현재18/다음24px. 첫 기여행은30px패딩+28.8pxline, 다음행24px패딩+37.2pxline. 값열은 실제 문자열너비+min38/42·12pxgap으로 계산 |
| 제목/AP | 제목520×64 y80·가용본문가운데(AP0 x629.33), AP카드 y80/h64/right1873·라벨14/숫자24px. 숫자길이에 따라 카드폭/제목중앙을 함께 조정해 큰 잔고 겹침 방지 |
| 좌측 | x47, 검색y190/220×44, 길카드y244+85.17n/220×82.17. 필터 y847.2·힌트 y896.2는 기존 실제 bottom 고정. 기존처럼 무작정 전체12px 이동하지 않음 |
| 제어 | 예약(1477,820.2,372,49)은 붉은 plaque 제거·웹 회색gradient/#939696 border/inset2. footer 취소(1531.11,1004,97.5,44)·적용(1642.61,1003,123.5,46)·닫기(1780.11,1004,88.89,44)의 테/배경·disabled .48/채도.3 유지. 줌판(1294.48,952,138.52,40) 복원 |

독립 Runtime 컴파일 오류0(`third/stat/visual/runtime-compile.json`). 첫 시도는 이전 response파일에 새 UiSoundCapture partial 누락으로 도구입력 오류였고 현재 Runtime 파일목록을 다시 수집해 정상 컴파일했다. 변경 후 정식 Player의 최종 union build·1x 검수는 부모가 수행하며, 이 소스 정합만으로 최종 시각PASS를 선언하지 않는다.

## 최종 Player 영수증 — 3차

빌드53412e1f(af70a6a2c5)·같은패키지UI6699ddaa 76PNG/1920·2560·3840/기능14 PASS·M1653caf5c23/23. 모두공식ok·창0·잔여0·USER_SAVE0, Runtime06a013b876120aafbd6d8adb3adf0f0171a2bc81187b6207222a23fabe14e2a7. 직접1x·확대및담당재검수완료. 전체미이식/잔여차이는 UNITY_WEB_PARITY_THIRD_20261102.md에명시한RETOUCH이며, 자연플레이/OS입력/전체언어검증과구분한다. 근거 I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/third/review/.

2026-11-04 D-U1: pHunter는 Core `Simulation.HunterMul`이 웹 `_hunterMul`(D-002 뒤)처럼 보스·정예·레어(etype≥90)에 +10%/랭크를 주므로 미지원 안내를 지웠다. 근거·대조는 `DEBUG_LEAD_BOARD_20261103.md` D-U1, `Tools/hunter-oracle`.
