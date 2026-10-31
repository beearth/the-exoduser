# DOC-SYNC — PC 문서 동기화 감사 보고 (2026-10-20)

## 1. 기준·소유·판정 경계

| 항목 | 확인 |
|---|---|
| 작업 폴더 / 브랜치 | `G:\exoduser-wt\codex-doc-sync` / `codex/doc-sync-pc-20261020` |
| 시작 HEAD | `2845f96e97d4803e4fb8ab4f3d5c0ff8e80d4353` (INDEX/WORK tracked 변경 없음으로 시작) |
| fetch 때 origin/main | `af9a59f444409305201ccc20fe4878d4cdd678aa` — fetch만 수행, merge/rebase/checkout 없음. 후속 공유 ref 관측 `2602ae5ce8967627f8572fff57b8a4b217052710`; 감사 입력은 시작 HEAD로 고정 |
| 원본 | **이 worktree의** `game.html`, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, split 기준 65,693행(마지막 개행 뒤 빈 항목 포함) |
| 지시 | `WORK_BOARD.md` → `MAC_ORDERS_20261020.md` 작업6. 경로·실행은 사용자 PC 지시 우선 |
| 변경 | docs만. game.html/index.html/Godot 코드·에셋·레슨·Q/E·세이브·override.cfg 변경 0. 공용 GDScript 변경 **0줄** |
| 실행 | Godot/웹 게임 실행 0, import 0, 서버 조작 0. 아래 검수는 **문서·정적/순수 원본식**만. 기존 담당의 실행 결과를 이번 PASS로 재사용하지 않음 |
| 완료 범위 | 아래 25작업의 문서 연결과 아래 대조표의 계약을 감사. 저장소 전체 과거 설계·번역·백업의 모든 숫자가 현행과 같다는 인증은 아님 |

## 2. 오늘 통합 작업 전수 목록과 원본 접점

이 표는 작업 누락 방지용이다. 관측/시각 작업은 새로운 게임 수치를 만들지 않았으며, 당시 테스트 수치·실측값은 원보고서의 역사 기록으로 보존했다.

| 작업 | 검토 문서 (docs/engine/ 파일명) | 원본 game.html 근거 / 대조 초점 |
|---|---|---|
| P1-002.C | FDG_GAME_DEVELOPMENT_PLAN.md / FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md | 42383 HP 차감 owner; 문서-only로 제품 쓰기 변경 없음 |
| P1-002.D | FDG_P1_002_CLOCK_PRODUCER_20261019.md | 32742 stageTime/playTime에 sp 누산. 초기 미연결 기록과 J 이후 배선 구분 |
| P1-002.E | FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md | 42345~42354 쉴드 선흡수→잔여HP, 42486 opts.poiseHit 게이트 |
| P1-002.F | 같은 문서 전용 적 절 | 같은 hurtE 계약의 전용4종 연결; 새 피해계수 없음 |
| P1-002.G | 같은 문서 kiSlash 절 | 42486~42490 포이즈는 쉴드 후 잔여 dmg, 스턴 중 ×1.5는 42336 |
| P1-002.H | FDG_GAME_DEVELOPMENT_PLAN.md H행 | 입력 관측 작업; 당시 봇 PC 인수를 사람/Mac 플레이 인수로 확대하지 않음 |
| P2-001a | FDG_P2_001A_HIT_FEEDBACK_20261020.md | 53961~53968 HP/쉴드/그로기바, 61849~61868 단발 숫자, 32584 히트스톱 비활성 |
| P2-001b | FDG_P2_001B_DEATH_IMPACT_FX_20261020.md | 24800~24859 deathFX, 24915 풀120/54531 draw25. 후속 f/g 정정 우선 |
| P2-001c | FDG_P2_001C_KILL_REWARDS_20261020.md | 32002~32038 드랍, 43092~43158 보상·경험치, 24735~24825 사망음 |
| P2-001d | 계획표 및 e/f/g/004a/005a의 d 대조 인용 | 웹 대조 관측 작업. 41496~41541 펫 비공격 원본에 따라 108~156 피해 귀속은 미특정 유지 |
| P2-001e | FDG_P2_001E_FIRSTFIGHT_CORRECTNESS_20261020.md | 31567 스테이지 자원 충전, 63956 악의구슬1000 초기 경로. 피해 펫 귀속은 후속004a 정정과 구분 |
| P2-001f | FDG_P2_001F_DEATH_BLOOD_TIMING_20261020.md | 54580~54581 VFX 클록 두 분기/61849 renderSp1. 단순 frameTime=고정초 아님 |
| P2-001g | FDG_P2_001G_KILL_CORE_AND_START_SPAWNS_20261020.md | 18871 원소 시트 선택/63424~63431 링580·5마리·결계300/280. 당시 스폰 미구현은 h/i 이후 이력 |
| P2-001h | FDG_P2_001H_INTRO_CURTAIN_SEQUENCE_20261020.md | 63412 on=true/iframes600, 63424~63440 링·결계·900ms |
| P2-001i | FDG_P2_001I_BOOT_INTRO_WIRING_20261020.md | 63277~63293 인트로 초기화, 63413 HUD on. 당시 clock 차단은 j 이전 이력 |
| P2-001j | FDG_P2_001J_LESSON_FLOW_AND_CLOCK_20261020.md | 32107~32112 레슨 순서, 32742 시간 증가. 레슨 자체는 parry-lesson.js 별도 원본이므로 이 감사에서 game.html만으로 단계 수치까지 인증하지 않음 |
| P2-001k | FDG_P2_001K_LESSON_PANEL_PRACTICE_20261020.md | 42111 활성 레슨 hurtEnemy 위임. 연습0~7/allows는 다른 담당 소유, 설계 변경 없음 |
| P2-002a | FDG_P2_002A_HUD_20261020.md | CSS310/712~740 슬롯, 44147 sweep, 60336 타이머. 시작 슬롯·쿨 미연결 기록은005 후속과 구분 |
| P2-002b | FDG_P2_002B_MINIMAP_CORNER_20261020.md | 60177~60233 미니맵, 49487~49509 CP. 외부 CSS 최종값과 game.html 기본값 구분 |
| P2-003a | FDG_P2_003A_LIGHTING_20261020.md | 4505 ambient/4693 lighting/55352~55419 후처리; 과거 6단계 표현과 7행 표는 분류 차이, 숫자 재측정 없음 |
| P2-004a | FDG_P2_004A_PETS_20261020.md | 9243 PETS/9389~9495 발화/41496~41541 xbow·iris 비공격. 티어쿨 문서 정정 |
| P2-005a | FDG_P2_005A_START_SKILLS_20261020.md | 27681~27682 6슬롯/ULT null, 63993~64014 지급·배정 |
| P2-005b | FDG_P2_005B_GIANT_SLAM_20261020.md | 31960~31996 비용, 46453~46501 강타·쿨·시트 |
| P2-005c | FDG_P2_005C_SPIKE_HOLY_20261020.md | 45507~45517 가시덫, 37413 틱25/37471 감속90, 46709~46713 돔, 32709 플랫회복 |
| P2-005d | FDG_P2_005D_REGEN_ICEORB_20261020.md | 32705~32720 회복, 44511/44556 계수, 46757~46818 보주, 42445~42457 프리즌/38644~38657 해동·감쇠 |

## 3. 불일치 정정표

문서 경로는 모두 `docs/` 상대다. 같은 항목의 중복 문서는 행별로 전부 표시했다. 정수화는 원본 `~~`를 그대로 표기하며 새 밸런스 제안이 아니다.

| id | 문서 / 항목 | 감사 전 문서값 | 원본값·행 | 조치 |
|---|---|---|---|---|
| D01 | 2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md / giantSlam 요약 | 쿨10→8초 | max(60,1800−(Lv−1)×12)f 후 쿨감·정수화, 46455~46456 | 현행식으로 정정 |
| D02 | 같은 문서 / giantSlam2 | 기본10초·습득/시전 혼합 | 같은 기본식, pillarSlam/infernoSlam일 때만420f, 46450~46456 | 기본/합체·습득/시전 구분 |
| D03 | 같은 문서 / 기본 강타 영웅 시트 | giantSlam=earth 시트 | 지면kind giant/영웅 vfxKind inferno, 46492~46501 | 기존 지면 재질 유지·영웅 시트 정정 |
| D04 | 같은 문서 / iceOrb 피해·MP | 정수화 누락·숫자를 _skMul 인자로 기재 | _skMul('iceOrb')=8+(Lv−1)×3.2; base 먼저~~ 후 +useMp×2; 칼날 min1; MP~~, 44511·44556·46757·46770~46786·31994 | 함수 인자·순서·최소값 명시 |
| D05 | 같은 문서 / 파편저항 회복 | 5초에10% | −.002×sp, 빙결 중 return으로 감쇠 생략, 38644~38653 | 주석 아닌 연산을 기재; 비빙결50틱에 .10 감소 |
| D06 | 2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md / stCost/mpCost | ~~ 누락 | stCost raw와 cap 각각~~/MP~~, 31984~31995 | 일반식 정정 |
| D07 | 같은 문서 / weapon | pAtkCost 할인 일반식처럼 표기 | 조기 반환 일반5/kiSlash10+(Lv−1)×2, 31985 | 할인·90%캡 미경유 명시 |
| D08 | 같은 문서 / giantSlam | base250·+10%/Lv | base50·+45%/Lv; raw Lv1=50/Lv10=252, 31961·31976 | 정정 |
| D09 | 같은 문서 / 악의구슬 | 추가20 | 원가20→_malCost(20)=10, 레슨 면제, 28080~28084·46453~46454 | 원가/실소비 구분 |
| D10 | 같은 문서 / magic | base250·+15% | base10·+.35/Lv, 31964·31978 | 정정 |
| D11 | 같은 문서 / iceOrb | base250·+15% | base50·+.35/Lv; Lv1=50/Lv10=207, 31964·31978·31994 | 정정 |
| D12 | 같은 문서 / holyDome 회복 | 리젠×2만 | 자연×2＋플랫(10+Lv×2)/60×sp×fuseMul, 32705~32720 | 플랫·게이트·자연율 분리 보충 |
| D13 | 14밸런스+수치테이블/자원소비량표.md / kiSlash | Lv1/5/10=10/28/48 | 10/18/28, 31985 | 산술 오기 정정 |
| D14 | 같은 문서 / 강타 악의표 쿨 | 10→8초 | 46453~46456 현행 기본식·원가20/실10 | 정정 |
| D15 | 14밸런스+수치테이블/스킬데미지공식표.md / iceOrb 투사체행 | 300/390 | base 계수 Lv1=8/Lv10=36.8, 실제식에useMp×2와30%, 44511·44556·46770~46786 | 정정 |
| D16 | 같은 문서 / iceOrb 마법행 | b6/g4.8·Lv20열27.6·10초 | b8/g6.4×.5·Lv20=68.8, 쿨20→최소10초, 44511·44556·46818 | 정정 |
| D17 | 같은 문서 / iceOrb 중복행 | 300/390 | base 계수 Lv1=8/Lv20=68.8＋실제 칼날/AoE식 | 정정 |
| D18 | 같은 문서 / holyDome pDot | 지속24초·힐량2배 | maxT=720+Lv×30, t+=sp/직접만료, pDotDur 미경유, 46710·37200·37255~37261 | DOT 지속과 자연리젠 구분 |
| D19 | 14밸런스+수치테이블/스킬_밸런스_리포트.md / iceOrb | ×5×.3/+15% | D04와 동일한 현재 원본식 | 정정; 과거 DPS 순위는 새측정값으로 재계산하지 않음 |
| D20 | 2_4 펫시스템/2_4 펫시스템.md / 발화쿨 | 단일15초·긴급 모든쿨 무시 | 티어[1200,720,480,360,240,0]f, 긴급도id쿨 검사·T5입찰·하위티어 최소300, 9408·9433~9478 | 정정 |
| D21 | 6사운드디자인/6사운드디자인.md / HUMANOID·BEAST | death_heavy 계열 | death_humanoid/death_beast 풀, 24737·24747·24771·24776 | 매핑 정정 |
| D22 | 같은 문서 / 일반·추가 사망음 볼륨 | .35~.7/추가.5/신음.3·전체신음 | 기본 ARMOR.525/대형1.05/그외.825×layer; 추가.75·신음.45×sfxVol, 일반 분기 한정, 24818~24825 | 게이트·실볼륨식 정정 |
| D23 | 같은 문서 / 변형 목록 | 구 death_heavy·splat·crush1~3 등 혼재 | 원본 _DEATH_VARIANTS 24735~24755, humanoid10/bone12 등 | 전체 카테고리 풀을 원본대로 정정; 미분류heavy키는 풀 미등록임을 구분 |
| D24 | 2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md / 이식 범위 | 10/17 이력만으로 최신 범위 불명 | worldItems20/rollDrop45%/hp물약→악의(16721·32015·28250~28259) | 생성 레코드≠줍기·인벤완료 보충 |
| D25 | 3.1 ui hud 디자인/exoduser-hud-redesign.md / 현행과 제안 | 예전 설계/초기 포트 보고와 구분 불명 | 시작슬롯64013/쿨44147/타이머60336 | 현행 주석 추가; 폰트·CSS·미연결 범위 분리 |
| D26 | 5.1임펙트디자인/VFX_구현가이드.md / 클록·풀 | 오늘 통합분의 혼동 방지 주석 없음 | death_blood64렌더프레임/시체풀120·draw25/히트스톱0/강타inferno | 근거행 포함 별도 감사표 보충 |

## 4. 유지·보호·미확인 표

| 문서 / 항목 | 문서값 / 원본값 | 판정·조치 |
|---|---|---|
| 7아이템디자인/exoduser-item-system-full.md STEP6 | normal45%, 가중치65/22/9/3/1/.01 / 32012~32018 동일 | 유지. 과거 코드 샘플·전체 어픽스409종의 개별 설명은 이번 1:1 인증 대상 아님 |
| 14밸런스 DPS표 / 가시덫 | _skMul14+5.6(Lv−1), ×.75, 25f/악의구슬원가10 | 44522·44556·45507~45517·37413 일치, 유지 |
| 2_1·DPS표 / 돔 | r500+20Lv, 지속720+30Lv, cd1800, 플랫10+2Lv | 46709~46713·32709 일치, 유지. _gcCd/돔자체 가속 제외(36517·36679), 강타/보주는 sp+bonus(36678·36687) |
| 2_1 / 빙결 축적 | 쉴드 후 잔여만 | 42345~42354·42445~42457 일치. 보스 표시 분모90(53967)와 실설정180(42453)은 원본 내부 차이이며 임의수정하지 않음 |
| 2_4 / 펫4종 비공격 | xbow·iris 이동/조명만 | 41496~41541 일치, 유지. e 당시 펫피해 재귀속 추정은004a에서 반증됨; 이번 새 피해 원인 단정 없음 |
| 2_4 / 자막 불투명도 | 최대.6/지수.6 | _updatePetBubble 경로, 기존 계약 유지. 패드·음성·번역·미연결대사는004b 담당 |
| UI / 미니맵·타이머 | 130px/166px·20f 갱신·stageTime/60 | 2585·60177~60233·60336 대조. 지역 생산자·외부 CSS의 실제 화면값은 별도 시스템/당시 실측 경계 |
| 5.1 / 사망 애니메이션 | 128셀·16프레임·frameTime4 | 19679·24859 동일. 64렌더프레임이지 60Hz고정수명 보장 아님 |
| 6사운드 / 프레임 보이스 | 일반6/보스1·크로스쿨5 | 24807·24810 동일, 유지. 좌우pan은 Godot 미지원 경계 유지 |
| **수정금지 docs/2_3** / 그로기 | 일반 그로기 ×1.5 | 42336 일치. 155행의 구 명칭 '대왕치기'는 46543 현재 '지옥강타 1'과 다름 — **보고만, 문서 수정0** |
| **수정금지 docs/2_3** / Q/E | 판정·보상·입력 계약 | 이번 범위는 hurtE·문서만. 전체 Q/E 수치 일치 PASS 인증 없음, 파일변경0 |
| 백업·시점 기록 | __NFD_0628_2305_백업, 2026-04/05 비교표, CHANGELOG 과거 변경 | 당시 기록 보존. 과거값 잔존을 현행 수치로 승인하지 않음 |
| 범위 밖 낡은 비용 행 | 자원리젠 문서 charge/finisher 등 구250 모델 | 오늘 이식 대상 giantSlam/magic/iceOrb만 정정. 나머지는 이번 게임플레이 담당 범위 밖이며 현행 근거로 사용 금지 주석. 전체 자원표 현행화 완료는 주장하지 않음 |
| 기존 엔진 보고서 | a/b/c/e/i 등의 '미이식' 문장 | 당시 검사·실패 수치는 보존. 후속 작업으로 해소된 항목은 이번 UI/인벤/VFX 주석 및 본 표로 구분; 원로그 없는 과거 수치 소급수정 없음 |

## 5. 검수 명령·수치·로그

모든 산출물은 `G:\exoduser-wt\_out\DOC-SYNC-pc\`. 실행 코드가 아닌 외부 임시 감사 도구만 작성했다.

| 실행 | 명령 / 결과 | 근거·한계 |
|---|---|---|
| 전체 docs 검색 | `C:\nvm4w\nodejs\node.exe G:\exoduser-wt\_out\DOC-SYNC-pc\inspect.cjs docs <쉼표구분정규식> [경로필터] [행구간]` | docs 비engine Markdown 전체 순회 후 필터. 스킬·14밸런스·펫·인벤·7아이템·UI·VFX·음향·2_3 검색 원문은 `docs-<timestamp>.txt`. 엔진 문서는 별도 type/engine 검색. 검색일치≠모든 행 검증 |
| 원본 검색 | 같은 inspect.cjs `source <패턴> x <행구간>` | `source-<timestamp>.txt`. 원본을 실행중 웹 서버에서 읽지 않고 이 worktree 디스크에서 읽음 |
| 첫 하니스 오류 | audit.cjs 첫 호출 `git show` → ENOBUFS | Node 기본출력버퍼 초과. 해당 읽기만 maxBuffer32MiB로 보완. 최초 스택은 대화 도구 원로그, `initial-error.txt`는 요약임을 명시 |
| 완료된 첫 감사 | `C:\nvm4w\nodejs\node.exe G:\exoduser-wt\_out\DOC-SYNC-pc\audit.cjs` → **91검사 중90통과/1실패** | `audit-run1.out/.err`, `audit-result.json`. 원본함수 순수식23＋원본계약47＋문서표기16＋경계5. 실패=Git 한글경로 quoted display를 docs 외 경로로 오인한 **하니스** |
| 실패검사만 재검증 | `C:\nvm4w\nodejs\node.exe G:\exoduser-wt\_out\DOC-SYNC-pc\failed-scope-recheck.cjs` → **1검사/0실패** | `scope-recheck.out/.err/.json`. NUL 경로 사용으로 수정. 앞90개 기통과 검사는 반복하지 않음. 두 실행을 단일 whole-run PASS로 소급하지 않음 |
| diff 공백 | `git -c core.whitespace=cr-at-eol diff --check` → exit0 | `whitespace-check.out/.err` 빈 로그. 원본 CRLF 유지. 기본 diff --check는 기존 CRLF 추가줄을 trailing whitespace로 보고했음; 전파일 LF정규화·전역설정변경 없음 |
| 보호 경계 | baseline 대비 game.html/index.html/godot diff 없음·game.html byte일치 | 위 audit-result의 개별 경계검사 통과. 공용GDScript0줄/에셋0/override0/세이브0 |
| 보고서·소유 검수 | `C:\nvm4w\nodejs\node.exe G:\exoduser-wt\_out\DOC-SYNC-pc\final-check.cjs` → **33검사 중32통과/1실패** | `final-check.out/.err/.json`. 25작업/26정정/47원본계약 및 허용경로 검수. 실패는 밸런스 리포트 기존 U+FFFD를 신규 UTF-8 손상으로 오인한 하니스 |
| 문자 실패만 재검증 | `C:\nvm4w\nodejs\node.exe G:\exoduser-wt\_out\DOC-SYNC-pc\unicode-recheck.cjs` → **2검사/0실패** | `unicode-recheck.out/.err/.json`. strict UTF-8 decode 성공. 60/69/109/291행의 기존 대체문자 포함 문자열이 HEAD와 byte decode 후 동일함을 확인; 관련 없는 기존 손상은 수정하지 않음 |

순수식 검사는 원본 `_COST_BASE/_COST_DPS/_COST_SK/_SK_MUL`과 `_skLv/_dpsCostMul/stCost/mpCost/_malCost/_skMul`을 추출하여 Node VM의 명시 입력으로 실행했다. 할인1/ST상한10000 fixture, Lv1/5/10/20 기준이며 원본 전체 게임·Godot 자원 owner·실사용 입력의 실행증거가 아니다.

## 6. 변경 파일·Git 영수증

설계 문서10개(2_1 본문/자원리젠, 14밸런스3개, 2_4, 2_7, 3.1 HUD, 5.1 VFX, 6사운드)＋공동작업판＋본 보고서. 경로 지정 스테이징만 사용한다. 테스트파일/제품코드 신규추가 없음.

- 문서 본체 커밋 SHA: **`1f02065db883eb4781b2cdfed9188f66608da028`**, parent=`2845f96e97d4803e4fb8ab4f3d5c0ff8e80d4353`。12파일, +204/−32줄, docs만.
- 본체는 `git push origin HEAD` 성공 후 `git ls-remote origin refs/heads/codex/doc-sync-pc-20261020`가 위 SHA와 일치함을 확인했다. `content-push-restored.out/.err`에 보존. main push/merge 없음.
- 보고서 내용 커밋과 이를 인용하는 최종 보고 커밋은 분리한다. 최종 자기 SHA는 Git 밖 push 영수증 및 사용자 최종응답으로 확인한다.
- 기존 commit hook의 guard.js는 원본 인라인 스크립트9개 검사 등을 자동 실행해 PASS를 출력했으나 `tools/guard.baseline.json`의 lines만64266→65693으로 자동 썼다. 첫 push는 이 tracked 변경을 감지해 **실행 전 차단**했다(`content-push.err`). 훅 변경파일·diff를 `hook-guard.baseline.json`/`hook-baseline.diff`로 보존한 뒤 그 한 줄만 apply_patch로 원복했다. 코드/도구 변경을 문서 커밋에 포함하지 않았으며 훅을 끄거나 우회하지 않았다. 훅 PASS는 Godot/게임 실행 검수 아님.

## 7. 남은 것·총괄 인수 요청

1. 총괄의 문서 변경 검수·main 통합은 아직 별도다. 원격 main은 감사 중 전진했으므로 이 브랜치를 강제 동기화/재기준화하지 않았다.
2. 2_3 구 명칭은 수정권자에게 전달. P2-001l/004b/006a/007a/P3 생산자와 충돌하는 제품 수정 없음.
3. 새 Godot/Mac/사람 실플레이·화면 인수·패키지·Steam 배포 증거 없음. AAA 목표 달성 인증 아님.
4. 과거 비교표·백업 및 오늘 범위 밖 비용 행의 정리는 별도 승인 범위로 남김. 외부 CSS·parry-lesson.js 고유 수치와 전체 어픽스 개별 설명은 본 game.html 감사만으로 전수 PASS라 부르지 않는다.
5. 밸런스 리포트의 기존 대체문자 포함4행은 원문 보존(별도 복구 필요). 현재 수정에서 새로 생긴 문자 손상은 없음.
