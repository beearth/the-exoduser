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
| 미지원 표시·투자 차단 | pPierce는 효과0이므로 신규투자/예약 버튼·API 비활성, 기존값 환불 허용. pDot(DOT피해/지속)·pPred(이속)·pRegen(물약쿨)·pGuard(보호중HP리젠)·pHunter(보스/정예별칭)는 선택 상세에 효과 일부 미지원과 현재적용범위를 표시 |
| 배경 | 웹과 같은 CloudFront 기사원화1120×896, 동일 CSS .17 검정·ellipse66%74%/55→100%마스크, viewport고정. 확대/이동하는 트리와 별도, Art/ui/stat/knight_background.png. 원본URL/SHA는 third/stat/background-source.json |

## 검증과 한계

I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/third/stat/: red.json(성장상태 누락 재현)·red-live.json(실전투 미연결 재현) → green-malformed-legacy.json **7311 검사 PASS**. 웹 evaluatePlan2200입력, 비선형 AP비용·FIFO차단/취소·실투자·stale거절·전체환불·unknown저장·무치유·반복장비·마법합연산을 검사했다. 추가 malformed/legacy회귀 red-malformed-legacy.json→green-malformed-legacy.json은 정상구형근성의65SP환불·동일인스턴스/저장재로드 중복0·마커저장순서·overflow실패폐쇄·실패전후원본raw불변·중첩unknown왕복을 포함한다. live-web-stats.json은 실제 웹 applyStats 정본을 같은장비에 실행한 값(STR1:HP532, STR1/DEX1/INT1/GRIT2:HP534/MP484/ST244/쉴드290). STR기여표+5는 장비HP배율 전의 기본기여이며 실제최대HP는526→532다.

전체 Core/Runtime 독립컴파일 오류0. 기존경고 유지. 최종 정식빌드/Player/M1/1920·3840 나란히비교·입력·지속성 검수는 부모의 동일패키지 영수증에 연결하며 이 문서만으로 시각PASS 선언하지 않는다.

남은 경계: 현재전투능력치 요약 drawer, 웹 원본의 일부 조건부 이동/물약쿨/관통·DOT지속 소비는 기존 executor 미지원 범위다. 기여표는 웹 정의이고 모든 조건부효과를 구현완료로 해석하지 않는다. 선택 상세에서 미지원 효과를 확인할 수 있고 관통의 신규 AP소모는 막았다. pHunter는 현재 EnemySpawn에 존재하는 etype>=90 분기만 연결했으며 원본의 isBoss/isElite 별칭 자체가 없는 상태는 생성하지 않았다. 일반 mouse·전체언어·청음·전체패시브전투oracle는 미검증. 제작자 자체판정은 Player 실물 이후 기록한다.
