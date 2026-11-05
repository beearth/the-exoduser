# 스킬 모션 맵 — 1-1 데모 세트를 모캡 라이브러리 클립에 맞춘다 (2026-11-05, 레인 SM)

**요약: 데모 세트 동작 28개(영웅 1 · 전사 대검). Core 틱·루트 이동·판정·캔슬 창을 파일:줄로 적고, 라이브러리(Mixamo) 범주와 접점 정렬 규칙, 없을 때 대안 ①②③을 붙였다. 라이브러리에 없을 가능성이 큰 동작 6개(충전 홀드 2·Q 받아치기 1·얼음보주 홀드 1·사슬기동 2). Core 수정 0. Core 변경이 필요한 항목은 §6에 `CP-SM-nn` 제안으로만 적었다.**

- 사용자 결정(브리프 §0 원문): "믹사모 같은 데서 모션을 가져오고 거기에 맞게 스킬을 디자인해야겠네, 일단은." → **D-MO-1 1단 = Mixamo.** 클립을 Core 틱에 맞춰 자른다. 클립에 맞춰 Core를 바꾸지 않는다.
- 브리프: [BRIEF_SKILL_MOTION_MAP_20261105](../0마스터플랜/worklog/cloud-lanes/BRIEF_SKILL_MOTION_MAP_20261105.md). 이 문서는 브리프 §1(클라우드 몫)이다. §2(Mac 매칭·리타깃·자르기)는 Mac이 하고, 결과는 §8 체크리스트에 채운다.
- 기준 Core: unity/main `03af52e7`(이 브랜치 기반) `unity/Assets/Exoduser/Runtime/Core`. 기본 공격 1타는 **CW 레인 적용값**(`claude/unity-cloud-core-windup-20261105` `28af4472`, `Simulation.cs:33·37·126~131·167`): wWindup 6 고정 → wSwing 5 → wRecover `max(base−6, 4)`(시작 장비 28), 합계 39. CW 병합 전 unity/main은 0/5/34다(`Simulation.cs:116·139`).
- 읽은 문서: SK 감사 [SKILL_SETTING_AUDIT_20261105](SKILL_SETTING_AUDIT_20261105.md)(`claude/unity-cloud-skill-setting-audit-20261105`), MO 레인 `MANUAL/MOTION_PIPELINE_20261105.md` §3 타이밍 표·D-MO-2, `MANUAL/MO_FOLLOW/MO_FOLLOW_20261105.md` §2h 키 포즈 표(틱 0/6/8/11/39)·§2e Mixamo 이용 조건(둘 다 `claude/unity-mac-motion-20261105`), [UNITY_HERO_MOTION_20261030](../engine/UNITY_HERO_MOTION_20261030.md) 표현 계약표, [BRIEF_CORE_WINDUP_20261105](../0마스터플랜/worklog/cloud-lanes/BRIEF_CORE_WINDUP_20261105.md).
- 설계 금지(CLAUDE.md §7) 유지: 어택 티켓 없음, 무지개탄은 Q(sBlock)로만 패링(`ParryRules.cs:100` `ECanReflect`가 blackBean을 E에서 제외), `docs/2_3` 설계 무변경. 이 문서는 표현(클립·포즈)만 다루며 판정·수치를 바꾸지 않는다.
- 표시 문자열 추가 0건(번역 등록 없음).

## 0. Mixamo 이용 조건 (문서 머리, MO_FOLLOW §2e 인용)

- [Adobe Mixamo FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html)(2021-09-14 수정): "royalty free for personal, commercial, and non-profit projects", 예시에 비디오 게임 제작 포함.
- [Adobe Terms of Use](https://www.adobe.com/legal/terms.html)에 Mixamo 이름은 없고, §3.5(샘플 파일)·§3.6(콘텐츠 파일) 일반 조항이 파일 단독 추출·배포를 제한한다. Mixamo 클립이 어느 조항인지 공식 문구를 찾지 못했다. Adobe 커뮤니티 글(2022, 직원 표시 없음)은 "원본 재배포만 금지, 게임 엔진 에셋 패키지 배포 금지"로 설명한다.
- **확인 중:** 원본 FBX 재배포 제한이 크로마 제출(다운로드 링크 = 게임플레이 영상으로 읽힘)과 충돌하는지. 충돌이 확인되면 브리프 §3 중단 조건대로 클립을 "참고용"으로 강등하고 2단 외주로 넘긴다. 이 문서의 매핑은 그 경우에도 외주 발주 사양으로 그대로 쓴다.
- 출처 규칙: 클립마다 Mixamo 클립 이름·길이·fps·자른 프레임·접점 정렬 근거를 §8 표에 Mac이 적는다. 이 문서의 "라이브러리 키워드"는 검색어 후보이고 실제 이름이 아니다.

## 1. 틱·프레임 변환 규칙

| 항목 | 값 | 근거 |
|---|---|---|
| Core 틱 | 60틱 = 1초 | MOTION_PIPELINE §3 |
| 클립 fps | 30fps(Mixamo 기본) → **클립 1프레임 = Core 2틱** | 브리프 §1-3 |
| 접점 정렬 | 접점 프레임 = ⌊접점 틱 ÷ 2⌋. 홀수 틱 접점은 앞 프레임에 두고 다음 프레임이 팔로스루 | 자르기 규칙(이 문서) |
| 길이 상한 | Core 총 틱 ÷ 60 × 1.5초 이내면 자르기만으로 맞춘다. 넘으면 ①②③ 대안 | 브리프 §1-3 |
| 재생 방식 | Unity 표현은 `animator.speed=0`로 두고 Core 틱의 절대시각으로 표본화한다(진행률 0~1). 클립 fps와 무관하게 Core 틱이 정답 | UNITY_HERO_MOTION "대기·달리기"·"일반 대검" 행 |
| 루트 이동 | Core가 플레이어 좌표를 움직이고 표현은 루트 위치·yaw를 호출자가 넣는다. **Unity Apply Root Motion 끔.** 구르기·도약 클립은 루트 모션 포함본을 받되(궤적·발 미끄럼 대조용) 적용은 끈다 | UNITY_HERO_MOTION "공개 연결"·"대기·달리기"(Root Motion 끔) |
| 이동 속도 | `PlayerSpeed=2.6`px/틱 + 부츠(`SimulationState.cs:23`, 측정 2.72). 공격·시전 중 .8, E 발도 .5, Q 홀드 .35, E 충전 .18, 지옥강타 .35 | `Simulation.cs:105·191~199`, `Simulation.PlayerCombat.cs:62·65·84·88`, `Simulation.Skills.cs:433` |

## 2. 데모 세트 표 (28동작)

열: 동작 / Core 상태·틱(예비 → 접점 → 회복, 파일:줄) / 루트 이동 / 판정 모양·무기 / 캔슬 창 / 동작 유형(§3 범주) / 접점 위치 규칙 / 클립 요구(§4 공통 외) / 라이브러리 키워드(후보) / 없을 때 대안 ①잇기 ②포즈 홀드 ③2단 외주 / Core 제안.

틱은 입력 틱 = 0. "접점"은 피해가 적용되는 틱이다. 루트 이동 "입력 이동"은 Core가 방향키 입력으로 좌표를 옮기는 것이고 클립에는 루트 모션을 넣지 않는다.

### 2.1 기본 상태·이동

| # | 동작 | Core 상태·틱 | 루트 이동 | 판정·무기 | 캔슬 창 | 동작 유형 | 접점 위치 규칙 | 클립 요구 | 라이브러리 키워드 | 없을 때 대안 | Core 제안 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| M01 | idle | `idle`, 틱 제한 없음. 흉곽 호흡은 표현이 덧붙임(`sin(tick×.025)×.025`) | 0 | — | 모든 입력 즉시 | 대기 | — | 루프 2~4초, 대검 양손 운반(아래·뒤) | "Great Sword Idle", "Sword And Shield Idle", "Idle" | ① 없음 ② 현재 Warrior_Locomotion `Idle` 유지 ③ — | 없음 |
| M02 | walk(느린 이동) | Core에 walk 상태 없음. 공격·시전 중 .8배, E 발도 .5, Q 홀드 .35, E 충전 .18 이동(§1) | 입력 이동 2.6×배율 px/틱 | — | — | 이동(느림) | — | 루프, In Place, 대검 운반 자세 유지. 상체는 공격 클립과 블렌드(상체 마스크) | "Great Sword Walk", "Sword And Shield Walk", "Walking" | ① 없음 ② `Walk` 상태 유지 ③ — | 없음 |
| M03 | run(전속) | `idle`에서 입력 이동 1.0배(`Simulation.cs:105`). 첫 틱부터 전속(MOTION_PIPELINE §3) | 2.6+부츠 px/틱 = 약 163px/초 | — | — | 이동(전속) | — | 루프, In Place. 발 주기가 2.72px/틱 보폭과 맞게 재생 속도 보정 | "Great Sword Run", "Sword And Shield Run", "Running" | ① 없음 ② `Run` 상태 유지 ③ — | 없음 |

### 2.2 기본 공격·기검참 (LMB)

시작 스킬은 LMB=기검참이다(`Simulation.Skills.cs:53~60`, SK 감사 §1). 일반 무기(`ActiveAttack!="kiSlash"`)는 Core에 콤보 추적이 없어 **모든 스윙이 1타**다(CW `Simulation.cs:128`). 기검참은 `KiComboStep`으로 1·2·3타가 갈린다. 기본 공격 3타 = 기검참 1·2·3타로 매핑한다.

| # | 동작 | Core 상태·틱 | 루트 이동 | 판정·무기 | 캔슬 창 | 동작 유형 | 접점 위치 규칙 | 클립 요구 | 라이브러리 키워드 | 없을 때 대안 | Core 제안 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| M04 | 기본 공격 1타(CW 적용) | 입력 0 → `wWindup` 6(틱 0~5, `BasicWindupTicks` CW `Simulation.cs:33·130`) → `wSwing` 5(틱 6~10) → **접점 틱 8**(`HitArc` st2가 3을 지날 때, `Simulation.cs:136`; 기검 검기는 swing 시작 틱 6 발사, CW `:146`) → `wRecover` 28(틱 11~38, `max(base−6,4)`, base=`(int)(16/((spd‖.3)×AttackSpeedMultiplier))` `Simulation.cs:139`·CW `:37`) → idle 39 | 입력 이동 .8배(예비·swing·회복 모두, `Simulation.cs:105`). 클립 루트 모션 0 | 호: 사거리 `WeaponRange‖50`+적 반경, 호 ±`WeaponArc‖.95`rad(≈±54°), `Simulation.cs:211~222`. 대검 양손 | 구르기·스킬 키는 전 구간에서 끊음. Q는 idle·sRecover, E는 idle에서만 진입(`PlayerCombat.cs:46·68`)이라 불가. 다음 공격 입력은 idle(틱 39)부터 | 수평 베기 (1타는 오른쪽→왼쪽 큰 수평) | 접점 = 칼날이 정면(Facing)을 지나는 프레임. 예비 끝(틱 6)=칼이 가장 뒤로 당겨진 프레임, 팔로스루 끝(틱 11)=칼이 반대쪽 끝 | 39틱=0.65초, 30fps 19~20프레임. 상한 0.975초(29프레임) 이내면 자르기만. 예비 3프레임·휘두름 2~3프레임·회복 14프레임 | "Great Sword Slash", "Sword And Shield Slash", "Standing Melee Attack Horizontal" | ① 예비가 짧은 클립이면 idle→공격 사이에 "Great Sword Idle" 마지막 2프레임을 예비로 잇기 ② 예비 6틱을 예비 포즈 1프레임 홀드 ③ 외주 | 없음(D-MO-2 적용 중) |
| M05 | 기본 공격 2타(기검 2타) | 입력 0 → `wSwing` 5 즉시(`KiComboStep%3==1`, CW `Simulation.cs:134~136`; 검기 발사 틱 0) → 접점 틱 2 → `wRecover` base 34(틱 5~38) → idle 39 | 입력 이동 .8배 | M04와 같은 호. 검기 반경 55, 비행 `300+(Lv−1)×15`px, 속도 14(`KiSlash.cs:60~65`) | M04와 같음. 2타는 1타 뒤 `KiComboTicks` 120틱 안에 입력(`KiSlash.cs:49`) | 수평 베기(1타 반대 방향, 왼쪽→오른쪽) | 접점 = 틱 2 = 클립 프레임 1. **예비가 없다**: 클립 첫 프레임이 이미 뒤로 당긴 자세여야 한다 | 39틱. 예비 0~1프레임·휘두름 2~3·회복 17프레임 | "Great Sword Slash"(반대 방향 버전), "Standing Melee Attack Horizontal", "Sword And Shield Attack" 2연속 콤보 클립의 둘째 베기 | ① 1타 클립을 좌우 반전(Mirror)해 쓰기 ② 1타 클립 그대로 ③ 외주 | **CP-SM-01**(2타에도 예비 6을 넣을지는 D-MO-3 후속 결정. 적용 전까지 2타는 예비 0으로 자른다) |
| M06 | 기검 3타 충전 홀드 | 입력 0 → `wWindup` 999 홀드(`KiChargeActive=true`, `Simulation.cs:111~113`), `KiChargeTicks` +1/틱 최대 120, 티어 = ⌊틱/40⌋(0~3, `KiSlash.cs:30~33`) | 입력 이동 .8배(홀드 중에도 이동 허용) | 판정 없음(홀드) | 구르기로 끊어도 충전 유지(`Simulation.Roll.cs:64` 조건), 피격은 충전 면제(`PlayerPoise.cs:40` kiCharging) | 시전(두 손) / 충전 자세 | 접점 없음. 칼을 들어 올린 "충전 자세" 1포즈를 티어 0·1·2·3(0·40·80·120틱)에서 조금씩 더 높이거나 떨림 추가 | 루프 또는 홀드 포즈. 길이 제한 없음(999) | "Great Sword Casting", "Sword And Shield Power Up", "Standing 2H Magic Attack"(시작 포즈만) | ① "Great Sword Idle" 1프레임 + "Casting" 시작 2프레임 잇기 ② 1타 예비 끝 포즈(틱 6 프레임) 홀드 + 티어마다 1프레임씩 위로 ③ 외주(충전 자세는 영웅 고유 동작) | 없음 |
| M07 | 기검 3타 발사 | 홀드 해제 틱 0 → `wSwing` 5(검기 틱 0 발사, `Simulation.cs:127~131`) → 접점 틱 2 → `wRecover` base 34 → idle 39 | 입력 이동 .8배 | 검기 반경 `120×(1+T×.4)`, 비행 `350+(Lv−1)×15`, 피해 `×2^T`(`KiSlash.cs:40·62~65`) | M05와 같음. 발사 뒤 `KiCooldownTicks` 20 | 내려치기(위에서 아래로 큰 베기) | 접점 = 검 최저점 프레임(틱 2 = 프레임 1). M06 충전 포즈에서 바로 이어져야 하므로 **클립 첫 프레임 = 충전 포즈** | 39틱. M06 끝 포즈와 첫 프레임 일치 | "Standing Melee Attack Downward", "Great Sword High Attack", "Sword And Shield Attack"(내려치기) | ① M06 포즈 → 내려치기 클립 중간부터 잇기 ② 1타 클립을 세로로 재생 불가 → M04 재사용(표현 하향) ③ 외주 | 없음 |

### 2.3 구르기·Q·E (2_3 설계 불변, 표기만)

| # | 동작 | Core 상태·틱 | 루트 이동 | 판정·무기 | 캔슬 창 | 동작 유형 | 접점 위치 규칙 | 클립 요구 | 라이브러리 키워드 | 없을 때 대안 | Core 제안 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| M08 | 구르기 | 트리거 틱 0 → `bladeDash` 18(`RollRules.cs:11`, `Simulation.Roll.cs:62~64`), 무적 앞 14틱(`RollRules.cs:12`) | **Core가 175px(=250×.7) ease-out으로 이동**(`RollRules.cs:10·36~40`), 벽에서 정지. 클립 루트 모션은 적용 끔 | 피해 없음. 게이지 45 | 끊을 수 없음(`CanRoll` moveT>0 불가). 구르기는 stagger·대부분 상태를 끊는다(`Roll.cs:39~44`). sDraw·kiGather·충전 중에는 상태 유지한 채 이동만(`Roll.cs:64`) | 구르기 | 접점 없음. **몸이 땅에 닿는 프레임 = 틱 9(이동 절반)**. 기립 완료 = 틱 18. Core 이동 곡선(ease-out)과 클립 몸 위치를 1x에서 대조 | 18틱=0.3초=9프레임. 상한 0.45초(13~14프레임). Mixamo 구르기는 보통 1초 이상이라 **자르기 필수**(진입 2·구름 5·기립 2프레임) | "Stand To Roll", "Standing Dive Forward", "Sprinting Forward Roll", "Dodge Roll"(실제 이름 확인) | ① 전반부(구름)만 쓰고 기립은 "Getting Up" 앞 2프레임 ② 구름 중간 포즈 1프레임 홀드 + 회전 보간 ③ 외주 | 없음 |
| M09 | Q 막기 진입·홀드 | Q 틱 0 → `sBlock` 999(`PlayerCombat.cs:46~49`, MP 10), 패링창 `LSbParryT`=20틱(`ParryRules.cs:25·211`), 이후 홀드(MP 5%/초 소모, `ParryRules.cs:215`) | 입력 이동 .35배(`PlayerCombat.cs:62`) | 투사체: 20px 흡수·100px 패링(`ParryRules.cs:72~76`). 근접: `MeleeParry` | 구르기 가능(끝나면 sBlock 복귀, `Roll.cs:63·86`). 해제는 Q 놓기 | 막기·받아치기(막기 자세) | 접점 없음. 진입 2~3프레임 뒤 **방어 포즈 홀드**(대검을 세워 몸 앞) | 진입 0.1초(3프레임) + 홀드 루프 | "Sword And Shield Block", "Sword And Shield Block Idle", "Great Sword Block"(있는지 확인), "Standing Block Idle" | ① 방패 막기 클립의 상체만 + 대검 손 위치 재타깃 ② 1타 예비 포즈를 방어 포즈로 홀드 ③ 외주 | 없음 |
| M10 | Q 받아치기 성공 반응 | 성공 틱에 `ApplyParrySuccess`(`PlayerCombat.cs:217~235`): **상태 변경 없음**(sBlock 유지), 히트스톱 `HitStopTicks`·흔들림·"PARRY!" 텍스트만 | 0 | 무지개탄 포함 Q 전용 패링(§7 금지 유지) | — | 막기·받아치기(튕겨냄) | 접점 = 틱 0(성공 즉시). 클립은 접점 프레임부터 시작해 반동 4~6프레임 | 상태 없이 겹쳐 재생(상체 레이어). 12틱 이내 | "Sword And Shield Block React", "Standing Block React", "Parry"(이름 확인) | ① M09 홀드 포즈 + "Hit Reaction" 상체 2프레임 역재생(튕김) ② M09 포즈에서 칼만 15° 들어 올리는 1프레임 홀드 ③ 외주 | 없음(표현만) |
| M11 | Q 해제(릴리스 패링) | Q 놓기 틱 0 → `idle`, `SbParryT` 12틱 카운트다운(`ParryRules.cs:15`, `PlayerCombat.cs:44·59~60`) | 입력 이동 1.0 | 12틱 동안 받아치기 가능 | — | 막기·받아치기(해제) | 접점 없음. M09 홀드 포즈 → idle 운반 포즈 복귀 12틱(6프레임) | 6프레임 | M09 클립의 끝부분(역재생) | ① M09 역재생 ② 블렌드 0.2초 ③ — | 없음 |
| M12 | E 발도(sDraw) | E 틱 0 → `sDraw`(`PlayerCombat.cs:68`), 탭(≤10틱 안에 놓기, `SdGrace` `ParryRules.cs:13`) → sBash, 홀드(>10) → kiGather | 입력 이동 .5배(`:84`) | 없음 | — | 밀치기(예비) | 접점 없음. 칼등을 돌려 드는 예비 최대 10틱(5프레임) | 5프레임, M13 첫 프레임과 일치 | M13 클립 앞부분 | ① M13 앞 5프레임 ② — ③ — | 없음 |
| M13 | E 타격(sBash) | 진입 틱 0 → `sBash` 20(`ParryRules.cs:12`, `PlayerCombat.cs:82`) → **접점 틱 8**(st2가 12를 지날 때, `ParryRules.cs:18·188`, `BashStrike.cs:15`) → 틱 20에 sRecover | 입력 이동 .8배(`:65`) | **원**: 반경 `⌊(70+견갑 bonusRange×4)×(1+(L−1)×.05)×chg⌋`(`ParryRules.cs:37~40`), 패링창 = 앞 16틱(`ParryWin`, st2>4) | 구르기 가능. Shift 캔슬·sRecover→sDraw 재진입은 **Core 미구현**(`PlayerCombat.cs:10~11`) | 밀치기(칼등·방패 치기) | 접점 = 칼등이 정면을 지나는 프레임(틱 8 = 프레임 4). 패링창이 접점 앞이므로 **예비 동안 이미 칼등이 앞을 향해야** 읽힌다 | 20틱=0.33초=10프레임. 상한 0.5초(15프레임) | "Sword And Shield Kick"(밀치기 대체), "Great Sword Kick", "Shield Bash"(이름 확인), "Standing Melee Punch" | ① "Kick"의 상체를 버리고 M04 1타 예비(칼등 방향 뒤집기) 잇기 ② 1타 클립 좌우 반전 + 칼 회전 90° ③ 외주 | 없음 |
| M14 | E 회복(sRecover) | 틱 0 → `sRecover` `⌊28/(1+pParry×.1)⌋`=28(`ParryRules.cs:137`, `PlayerCombat.cs:97`) → idle | 입력 이동 .8배 | 없음 | **Q로 캔슬 가능**(`PlayerCombat.cs:46` sRecover→sBlock), 구르기 가능 | 밀치기(회복) | 접점 없음. M13 끝 자세에서 운반 포즈로 28틱(14프레임) | 14프레임, 평타 회복이 아니라 **E 끝 자세에서** 복귀(UNITY_HERO_MOTION "E 타격·회복") | M13 클립 뒷부분 | ① M13 뒷부분 늘려 쓰기 ② 끝 포즈 홀드 + 블렌드 ③ — | 없음 |
| M15 | E 충전(kiGather) | sDraw 10틱 초과 → `kiGather`(`PlayerCombat.cs:76`), `KgChg` +2/틱, 티어 60·120·180(`ParryRules.cs:199`), 186에서 자동 발사(`:201`), 18 미만 놓으면 불발(`:200`) | 입력 이동 .18배(`:88`) | 없음(발사는 M13 ×배율 `min(3,…)`, `:203`) | 피격 면제 없음(`PlayerPoise.cs:40`은 kiGather를 stagger 제외만) | 충전 자세(한 손·칼등) | 접점 없음. 최대 93틱(186/2) 홀드. 티어 3단 포즈 변화 | 홀드 루프 | "Sword And Shield Power Up", "Great Sword Casting"(시작 포즈) | ① M12 끝 포즈 + "Power Up" 떨림 상체 ② M12 끝 포즈 홀드 ③ 외주 | 없음 |

### 2.4 슬롯 스킬 6개 (Core 이식분 전부)

| # | 동작 | Core 상태·틱 | 루트 이동 | 판정·무기 | 캔슬 창 | 동작 유형 | 접점 위치 규칙 | 클립 요구 | 라이브러리 키워드 | 없을 때 대안 | Core 제안 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| M16 | 지옥강타(Space) | 입력 틱 0 → **접점 틱 0**(`CastGiantSlam`이 `gSlamWindup` 진입과 같은 틱에 `GiantSlamHit`, `Simulation.Skills.cs:225~232`) → `gSlamWindup` 10 → `gSlam1` 10 → `gSlamRecover` 12(`SkillRules.cs:62`, `Skills.cs:437~439`) → idle 틱 32 | 입력 이동 .35배 전 구간(`Skills.cs:433`) | **원** 반경 `500+(Lv−1)×15`(`SkillRules.cs:63`), 파동 ×2 45틱 | 구르기 트리거가 상태를 bladeDash로 바꿔 끊김(`Roll.cs:39~44`·tick 순서 `Simulation.cs:94~102`, 실측 미실시) | 도약 내려찍기(제자리) | 접점 = 틱 0 = **클립 첫 프레임이 지면 충격 프레임**. 10/10/12틱은 접점 뒤 압축→반동→운반 복귀(UNITY_HERO_MOTION "지옥강타")이지 예비가 아니다 | 32틱=0.53초=16프레임. 충격 프레임부터 뒤쪽만 자른다. 예비(도약)는 Core에 없어 **쓸 수 없음** | "Great Sword Jump Attack", "Sword And Shield Jump Attack", "Standing Melee Attack Downward"(충격 프레임 이후) | ① 충격 프레임 이후 16프레임만 ② 충격 포즈 1프레임 + 기립 블렌드 ③ 외주 | **CP-SM-02**: 접점을 windup 끝(틱 10)으로 옮기면 도약 클립 예비를 그대로 쓸 수 있다. 판정 시점이 10틱 늦어지는 Core 변경이라 제안만 |
| M17 | 악의구(RMB, 홀드 연사) | 입력 틱 0 → `magicCast` `⌊14/pMagicSpd⌋`=7(`Fireball.cs:59`, pMagicSpd 2) → **접점(발사) 틱 7**(`:68` `FireMaliceOrb`) → `magicRecover` 12 → 홀드면 틱 19에 다시 cast(`:75`) | 입력 이동 .8배(`:67·72`) | 투사체: 반경 12→최대, 사거리 `400+(Lv−1)×50`, 유도(`SkillRules.cs:91~97`) | 구르기 가능. 연사 루프 19틱 | 시전(한 손, 투사체 밀어내기) | 접점 = 손이 가장 앞으로 뻗은 프레임(틱 7 = 프레임 3). 회복 6프레임 뒤 다시 프레임 0으로 루프 | 19틱=0.32초=9~10프레임 루프. 상한 0.48초. 대검은 왼손 운반 유지, 오른손 시전 | "Standing 1H Magic Attack 01", "Standing 1H Cast Spell 01", "Great Sword Casting" | ① "1H Magic Attack" 앞 10프레임만 ② 밀어내기 포즈 1프레임 홀드 + 팔 보간 ③ 외주 | 없음 |
| M18 | 가시덫(1) | `Cast("spikeTrap")`만 호출, **상태 변경 없음**(`Skills.cs:200~211`). 표현은 `SkillCastCount` 변화를 보고 18틱 제스처(UNITY_HERO_MOTION "일반 시전") | 입력 이동 1.0(잠금 없음) | 설치 원 `300+(Lv−1)×15`, 600틱 | 입력 잠금 0(겹쳐 재생) | 시전(한 손, 바닥 찍기) | 접점 = 틱 0(설치 즉시). 클립은 손이 바닥을 향한 프레임부터 18틱(9프레임) | 9프레임, 상체 레이어로 겹침 | "Standing 1H Cast Spell 01"(아래로), "Standing 2H Magic Area Attack"(바닥) | ① 바닥 찍기 2프레임 + 복귀 ② 포즈 1프레임 ③ — | 없음(시전 잠금을 넣는 Core 제안은 하지 않는다: 손맛 변경) |
| M19 | 회복의 영역(F) | `Cast("holyDome")`만, 상태 변경 없음(`Skills.cs:274~282`). 18틱 제스처 | 입력 이동 1.0 | 원 `500+Lv×20`, `720+Lv×30`틱 | 입력 잠금 0 | 시전(두 손, 위로) | 접점 = 틱 0. 두 손을 올린 프레임부터 18틱 | 9프레임, 상체 레이어. 대검은 등 뒤 또는 한 손에 걸침 | "Standing 2H Cast Spell 01", "Great Sword Casting" | ① 2H Cast 앞 9프레임 ② 포즈 1프레임 ③ — | 없음 |
| M20 | 얼음보주 진입·홀드(Ctrl) | 입력 틱 0 → `iceOrb`(`Skills.cs:294·303`) 최대 120틱 자동 파쇄(`SkillRules.cs:77`) | 0(이동 불가, 보주 안) | 무적(`PlayerHurt.cs:60`), 구르기 불가(`Roll.cs:40`) | 재입력·Space 파쇄 | 시전(두 손) / 포즈 홀드 | 접점 없음. 웅크려 두 손을 모은 포즈 홀드 | 홀드 루프 ≤2초 | "Standing 2H Cast Spell"(중간 포즈), "Kneeling Idle"? "Crouch Idle" | ① 2H Cast 중간 포즈 → Crouch Idle 잇기 ② 포즈 1프레임 홀드 + 호흡 ③ 외주 | 없음 |
| M21 | 얼음보주 파쇄·Shift 탈출 | 파쇄 틱 0 → `idle`(`Skills.cs:343`), 칼날 `4+Lv×4`개. Shift: 180px 순간이동 + 무적 30(`Skills.cs:310~314`, `SkillRules.cs:77`) | **Core가 180px 즉시 이동**(Shift일 때만) | 파쇄 원 `(100+Lv×5)×scale` | — | 시전(두 손, 펼침) | 접점 = 틱 0(파쇄). 두 손 펼치는 프레임 1장 + 복귀 6프레임 | 6프레임 | M19 클립 끝부분, "Standing 2H Magic Area Attack" 충격 프레임 | ① M19 뒤 6프레임 ② 포즈 1프레임 ③ — | 없음 |
| M22 | 사슬기동 홀드·던지기(Shift) | 홀드 1·6·12틱 = 티어 1·2·3(`ChainDash.cs:11`), 놓는 틱 0 → `HarpActive`, 갈고리 63px/틱 비행(`:16`), 300/500/700px → 5/8/11틱(`PlayerCombat.cs:147~155`). **`Player.State` 변경 없음**(표현은 `HarpActive` 읽음) | 0(비행 중 본체 정지) | 없음(통과 피해는 M23) | 피격 무시(`PlayerHurt.cs:61`) | 던지기(한 손 사슬) | 접점 = 놓는 틱 0 = 사슬이 손을 떠나는 프레임. 홀드 12틱(6프레임)은 당기는 예비 | 홀드 ≤6프레임 + 던지기 3프레임 | "Throw Object", "Standing Throw", "Sword And Shield Power Up"(홀드) | ① "Power Up" 홀드 + "Throw" 놓는 프레임 잇기 ② 한 손 앞으로 뻗은 포즈 1프레임 ③ 외주 | 없음 |
| M23 | 사슬기동 끌려감·착지 | 비행 끝 틱 0 → `DashActive`, 당김 7/11/16틱(`ChainDash.cs:13`), 통과 피해 적 반경+20(`:109~121`), 착지 무적 48·착지 연출 30(`:18`, `PlayerCombat.cs:165`) | **Core가 당김 속도로 이동**(`PlayerCombat.cs:160~162`) | 통과 피해(물리) | 끊을 수 없음(피격 무시) | 도약(끌려감) + 착지 | 접점 = 당김 시작 틱 0(몸이 뜨는 프레임), 착지 = 당김 끝 틱 | 당김 ≤16틱(8프레임) + 착지 30틱(15프레임) | "Falling Idle"(끌려감 대체), "Falling To Landing", "Hard Landing", "Standing Jump" | ① "Jump" 상승 3프레임 → "Falling Idle" 홀드 → "Hard Landing" 잇기 ② 몸을 앞으로 기울인 포즈 1프레임 + 착지 포즈 1프레임 ③ 외주 | 없음 |

### 2.5 피격·사망

| # | 동작 | Core 상태·틱 | 루트 이동 | 판정·무기 | 캔슬 창 | 동작 유형 | 접점 위치 규칙 | 클립 요구 | 라이브러리 키워드 | 없을 때 대안 | Core 제안 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| M24 | 피격 경직(stagger, 방향 4) | 피격 틱 0 → `stagger` **6틱**(`PlayerPoise.cs:12·40`, `PlayerCombat.cs:243`) → idle. 포이즈 −1(4점) | 넉백 1~12px(피해/최대HP×30), 매 틱 ×.65 감쇠(`PlayerHurt.cs:122~124`, `Simulation.cs:203~209`), 방향 = 공격원 반대 | — | 구르기로 즉시 끊음(`Roll.cs:42`) | 피격(방향 4: 앞·뒤·좌·우) | 접점 = 틱 0(맞는 순간 = 클립 첫 프레임이 충격 포즈). Core 6틱은 너무 짧아 **표현은 18틱 제스처를 상태와 독립으로 재생**(UNITY_HERO_MOTION "피격"). 방향은 넉백 각 − Facing으로 4분류 | 9프레임 × 4방향, 상체 우선(이동 중이면 하체는 이동 유지) | "Standing React Large From Front / Back / Left / Right", "Hit Reaction", "Great Sword Impact" | ① Front 1종 + 상체 yaw 보정으로 4방향 ② 충격 포즈 1프레임 + 넉백 이동만 ③ — | 없음(stagger 6틱 연장 제안은 하지 않는다: 2_3 설계 불변) |
| M25 | 피격 기절(pStun) | 포이즈 0 → `pStun` `⌊240×(1−min(.5,ccRes+stunRes))⌋`=240틱(`PlayerPoise.cs:12·22·37`), 끝나면 무적 60·포이즈 4(`PlayerCombat.cs:102`) | 0(넉백만) | 무방비 | 구르기(포이즈 4 복구, `Roll.cs:43`)·스킬(`Skills.cs:171`)로 탈출 | 피격(기절 홀드) | 접점 = 틱 0. 비틀거림 진입 9프레임 → 기절 루프 → 탈출 시 즉시 끊김 | 루프 4초 | "Stunned", "Dizzy Idle", "Standing Idle Shaking"(이름 확인) | ① M24 Front 끝 포즈 → "Idle" 흔들림 루프 ② 고개 숙인 포즈 1프레임 + 상체 sin 흔들림 ③ 외주 | 없음 |
| M26 | 쓰러짐(fallen, 사망 1종) | HP 0 → `fallen` 300틱(`Revive.cs:76`), 무적 9999, 충전 취소 | 0 | — | 없음(5초 대기) | 사망(쓰러져 유지) | 접점 = 틱 0. 48틱(24프레임) 안에 최종 자세 도달 후 유지(UNITY_HERO_MOTION "쓰러짐·사망") | 24프레임 + 홀드 | "Standing Death Forward 01", "Falling Back Death", "Great Sword Death", "Kneeling Down"(무릎 꿇음 유지) | ① "Kneeling Down" 앞 24프레임 + 홀드 ② 무릎 포즈 1프레임 ③ — | 없음 |
| M27 | 사망 확정(dead, 사망 2종) | 틱 300에 부활 실패 → `dead`(`Revive.cs:97`) | 0 | — | — | 사망(완전 쓰러짐) | 접점 = fallen→dead 전환 틱. M26 유지 자세에서 **다시 일어나지 않고** 완전히 눕는 24프레임 | 24프레임 + 홀드 | "Dying", "Falling Forward Death", "Great Sword Death" | ① M26 끝 포즈 → "Dying" 뒷부분 ② M26 포즈 유지(전환 없음) ③ — | 없음 |
| M28 | 부활 기립 | 틱 300에 성공 → `idle`, 무적 120, 자원 전량(`Revive.cs:88~92`) | 0 | — | 즉시 조작 가능 | 기립 | 접점 없음. 무릎 포즈 → 운반 idle 30틱 이내(무적 120 안) | 15프레임 | "Getting Up", "Stand Up", "Kneeling To Standing"(이름 확인) | ① "Getting Up" 앞 15프레임 ② 블렌드 0.5초 ③ — | 없음 |

## 3. 동작 유형 분류와 접점 위치 규칙

| 범주 | 데모 세트 | 접점이 클립 어디에 있어야 하는가 | 자르기 기준 |
|---|---|---|---|
| 수평 베기 | M04·M05 | 칼날이 캐릭터 정면(Facing) 선을 지나는 프레임 | 접점 프레임 = ⌊접점 틱/2⌋(M04: 프레임 4, M05: 프레임 1). 앞은 예비 틱만큼, 뒤는 회복 틱만큼 |
| 내려치기 | M07 | 검 최저점 프레임(칼끝이 가장 낮은 프레임) | 접점 틱 2 = 프레임 1. 첫 프레임이 충전 포즈 |
| 찌르기 | (데모 세트 없음. 미이식 후보 §7) | 팔이 가장 뻗은 프레임 | — |
| 회전 베기 | (미이식 회전참 §7) | 칼이 정면을 지나는 프레임, 한 바퀴마다 1회 | — |
| 도약 내려찍기 | M16 | **지면 충격 프레임**(발·칼이 바닥에 닿는 프레임). Core 접점이 틱 0이라 충격 프레임이 클립 첫 프레임 | 충격 이후만 32틱(16프레임) |
| 밀치기 | M12~M14 | 칼등(또는 방패)이 정면을 지나는 프레임 | 접점 틱 8 = 프레임 4(sDraw 포함 시 +5) |
| 막기·받아치기 | M09~M11 | 접점 없음(홀드). 받아치기 성공은 접점 프레임부터 반동 | 진입 3프레임 + 홀드 + 해제 6프레임 |
| 구르기 | M08 | 몸이 땅에 닿는 프레임 = 틱 9(이동 거리 절반, ease-out이라 시간상 약 틱 7~9) | 9프레임 전부 |
| 시전(한 손) | M17·M18 | 손이 가장 앞(또는 아래)으로 뻗은 프레임 | M17 프레임 3, M18 프레임 0 |
| 시전(두 손) | M19·M20·M21·M06 | 두 손이 가장 올라간/모인 프레임 | 프레임 0 또는 홀드 |
| 던지기·끌려감 | M22·M23 | 사슬이 손을 떠나는 프레임 / 몸이 뜨는 프레임 / 발이 닿는 프레임 | 홀드 ≤6 + 던지기 3 / 당김 ≤8 + 착지 15 |
| 피격(방향 4) | M24·M25 | 충격 포즈 = 클립 첫 프레임 | 9프레임 × 4, 기절은 루프 |
| 사망(2종) | M26·M27(+M28 기립) | 최종 자세 도달 = 24프레임째 | 24프레임 + 홀드 |
| 대기·이동 | M01~M03 | — | 루프 |

## 4. 클립 요구 사양 (공통)

| 항목 | 값 | 근거 |
|---|---|---|
| fps | 30 | 브리프 §1-3. Core 2틱 = 1프레임 |
| 스킨 | Without Skin(FBX, 애니메이션만) | 브리프 §1-3. 리그는 C3b Humanoid(MO 레인) |
| 기준 포즈 | T 포즈. 우리 뼈대는 A 포즈라 Unity 에디터 Enforce T-Pose 1회(사용자 손) 또는 Blender 절차 출처 확보 뒤 | MO_FOLLOW §2·§4(Apply Pose as Rest 절차 미확보) |
| 무기 | 대검 양손 그립. Mixamo 양손 무기 클립은 "Great Sword" 계열, 한 손 계열은 손 위치를 리타깃 뒤 IK로 보정 | 브리프 §1-3, UNITY_HERO_MOTION R7 파지 보정 이력 |
| 루트 모션 | 구르기(M08)·도약·끌려감(M23)·순간이동(M21)은 루트 모션 포함본으로 받되 Unity에서 **Apply Root Motion 끔**(Core가 좌표를 움직인다). 제자리 공격·시전·피격은 In Place | 브리프 §1-3 + §1 표 "루트 이동" |
| 길이 상한 | Core 총 틱 ÷ 60 × 1.5초. 넘으면 §2 대안 ①②③ | 브리프 §1-3 |
| 재생 | `animator.speed=0`, Core 틱 절대시각 표본화(현행 표현 계약). 클립 자르기는 "Core 틱 → 프레임" 매핑표(§8)로 | UNITY_HERO_MOTION |
| 상체·하체 | 이동 중 시전·피격(M17~M19·M24)은 상체 마스크 레이어로 겹친다. 하체는 M02·M03 유지 | §2 "클립 요구" 열 |
| 표현 구분 | 기본 공격 1타 예비는 `Player.BasicWindup=true`로 기검 충전(M06)과 구분한다. 현행 `NativeHeroMotion.cs:252`는 `wWindup` 전부를 Charge로 분류하므로 M04 예비가 M06 포즈로 보인다 — 표현 수정(MO 레인 몫, Core 변경 아님) | CW `Simulation.cs:97·130`, BASIC_ATTACK_DAMAGE CW 절 "표현 구분" |
| 점 금지 | 픽셀 렌더 뒤 3x 크롭 점 0 | CLAUDE.md §4.2-7 |

**Core 총 틱 → 클립 프레임 표**

| 동작 | Core 총 틱 | 초 | 프레임(30fps) | 상한(×1.5) 프레임 |
|---|---|---|---|---|
| M04 1타 | 39 | 0.65 | 19.5 | 29 |
| M05 2타 / M07 3타 발사 | 39 | 0.65 | 19.5 | 29 |
| M08 구르기 | 18 | 0.30 | 9 | 13 |
| M13 E 타격 (+M12 ≤10 +M14 28) | 20 (58) | 0.33 (0.97) | 10 (29) | 15 (43) |
| M16 지옥강타 | 32 | 0.53 | 16 | 24 |
| M17 악의구 1회 | 19 | 0.32 | 9.5 | 14 |
| M18·M19 시전 제스처 | 18(표현) | 0.30 | 9 | 13 |
| M23 당김+착지 | 16+30 | 0.77 | 23 | 34 |
| M24 경직 | 6(표현 18) | 0.10(0.30) | 3(9) | 4(13) |
| M26·M27 사망 | 48(도달) | 0.80 | 24 | 36 |

## 5. 캔슬 창 요약 (Core 기준, 표현이 끊김을 그려야 하는 곳)

| 상태 | 구르기 | 스킬 키 | Q | E | 공격 입력 | 피격 | 근거 |
|---|---|---|---|---|---|---|---|
| wWindup(1타 예비) | 끊김 | 끊김 | 불가 | 불가 | 무시 | 포이즈 −1·stagger(충전 면제 없음) | CW `Simulation.cs:138~147`, BRIEF_CORE_WINDUP §1 |
| wWindup(기검 충전) | 상태 유지한 채 이동 | — | 불가 | 불가 | 놓으면 발사 | 면제(kiCharging) | `Roll.cs:64`, `PlayerPoise.cs:40` |
| wSwing / wRecover | 끊김 | 끊김 | 불가 | 불가 | idle부터 | stagger | `Roll.cs:39~44` |
| sBlock | 끊김 후 복귀 | — | 놓기 | 불가 | 불가 | 패링/흡수 | `Roll.cs:63·86`, `PlayerCombat.cs:51~63` |
| sDraw / kiGather | 상태 유지한 채 이동 | — | 불가 | 놓기 | 불가 | stagger 제외, 포이즈 −1 | `Roll.cs:64`, `PlayerPoise.cs:40` |
| sBash | 끊김 | — | 불가 | — | 불가 | 앞 16틱 패링 | `ParryRules.cs:11·30` |
| sRecover | 끊김 | — | **캔슬 → sBlock** | — | 불가 | stagger | `PlayerCombat.cs:46` |
| gSlam* | 끊김(미실측) | — | 불가 | 불가 | 불가 | stagger | `Simulation.cs:94~102` 순서 |
| magicCast / magicRecover | 끊김 | — | 불가 | 불가 | 불가 | stagger | `Fireball.cs:63~78` |
| iceOrb | **불가** | 파쇄 | 불가 | 불가 | 파쇄 | **무적** | `Roll.cs:40`, `PlayerHurt.cs:60` |
| HarpActive / DashActive | 불가 | 불가(SkillBusy) | — | — | — | **무적** | `Skills.cs:136`, `PlayerHurt.cs:61` |
| stagger | 끊김 | 가능 | — | — | — | 포이즈 −1 | `Roll.cs:42`, `Skills.cs:170~171` |
| pStun | 끊김(포이즈 4) | 끊김(포이즈 4) | — | — | — | 포이즈 유지 | `Roll.cs:43`, `Skills.cs:171` |

## 6. 스킬 디자인 조정안 — "표현만"과 "Core 제안" 구분

### 6.1 표현만 (Core 변경 0, 이 문서 범위)

| 항목 | 조정 | 근거 |
|---|---|---|
| 기본 공격 1타 예비 | `BasicWindup` 플래그로 M04 예비 포즈(칼 뒤로 당김)와 M06 충전 포즈를 분리 | §4 "표현 구분" |
| 2타 예비 0 | 클립 첫 프레임을 뒤로 당긴 자세로 자른다(M05). 1타 클립 Mirror가 ① 대안 | §2.2 |
| 지옥강타 접점 틱 0 | 충격 프레임 이후만 쓴다. 도약 예비는 그리지 않는다(판정과 어긋남) | §2.4 M16 |
| 시전 상태 없는 스킬(가시덫·회복의 영역) | 18틱 상체 제스처를 겹쳐 재생, 이동·입력 잠금 없음 | UNITY_HERO_MOTION "일반 시전" |
| 피격 6틱 | 18틱 제스처를 상태와 독립 재생, 구르기 입력 시 즉시 끊음 | UNITY_HERO_MOTION "피격" |
| Q 받아치기 성공 | 상태 변경이 없으므로 상체 반동 클립을 히트스톱 틱 동안 겹침. 무지개탄 반사도 같은 클립(Q 전용 유지) | `PlayerCombat.cs:217~235` |
| 사슬기동 | `Player.State`가 안 바뀌므로 `HarpActive`·`DashActive`·`DashLeft`로 M22·M23 구간을 계산 | `PlayerCombat.cs:127~169` |
| 걷기·달리기 | Core 속도 배율(1.0/.8/.5/.35/.18)로 Run·Walk 블렌드 | §1 |

### 6.2 Core 제안 (사용자 승인 뒤 별도 레인, 이 문서는 적용하지 않음)

| 번호 | 제안 | 이유(동작 쪽) | 영향(판정 쪽) | 크기 |
|---|---|---|---|---|
| **CP-SM-01** | 기검 2타에도 예비 6틱(1타와 같은 `BasicWindup` 경로), 회복 base−6 | 1타는 예비가 있고 2타는 없으면 두 클립의 첫 프레임 자세가 달라 연결이 끊긴다 | 2타 판정이 6틱 늦어진다. D-MO-2가 "1타 기준"이라 후속 결정(BRIEF_CORE_WINDUP §1 D-MO-3) | S |
| **CP-SM-02** | 지옥강타 접점을 `gSlamWindup` 끝(틱 10)으로 이동, 10/10/12 유지 | 현재 접점 틱 0이라 도약·내려찍기 클립의 예비를 쓸 수 없다. 노레위 감각(예비동작 → 끝까지 가는 공격)과 어긋난다 | 판정 10틱(0.17초) 지연, 웹 oracle 불일치 1건 추가, 1-1 밸런스 영향 미측정 | M |
| **CP-SM-03** | E sBash·sRecover의 Shift 캔슬과 sRecover→sDraw 재진입(Core 미구현 항목, `PlayerCombat.cs:10~11`) 이식 | 웹에 있는 캔슬이 Core에 없어 클립 끊김 지점을 웹과 같게 그릴 수 없다 | 웹 규칙 이식이라 설계 변경 아님. SK 감사 BL-02와 묶을 수 있음 | M |

stagger 6틱 연장, 시전 중 이동 잠금, 어택 티켓은 **제안하지 않는다**(2_3 설계 불변·핵앤슬래시·CLAUDE.md §7).

## 7. 미이식 스킬 중 데모 세트 후보 (동작 유형만)

SK 감사 §2.2의 47종 중 추천빌드 1~2단계·LMB 대체 후보 4종. 전부 Core 미구현이며 이식은 SK 감사 BL-11(사용자 결정 "데모 v0 범위에 넣을지") 뒤다. 이 문서는 동작 유형만 적는다.

| 스킬 | 키 | 동작 유형 | 접점 규칙 | 라이브러리 키워드 | Core 제안 |
|---|---|---|---|---|---|
| 회전참 whirlwind | LMB | 회전 베기(연속, 히트 간격 `max(3,⌊15/(spd×dex)⌋)`) | 칼이 정면을 지날 때마다 1회 | "Great Sword Spin Attack"? "Standing Melee Attack 360 High"(이름 확인) | SK BL-11 밖, 별도(미구현) |
| 악의기둥 darkPillar | 1~4 | 시전(두 손, 바닥 찍기), 9기둥 30틱 틱 | 손이 바닥에 닿는 프레임 | "Standing 2H Magic Area Attack" | SK BL-11 |
| 해골무덤 boneWall | 1~4 | 시전(한 손, 앞으로 밀기) | 손이 가장 뻗은 프레임 | "Standing 1H Cast Spell" | SK BL-11 |
| 악의폭풍 maliceStorm | 1~4 | 시전(두 손, 위로 올림) | 두 손 최고점 | "Standing 2H Cast Spell" | SK BL-11 |

## 8. Mac 매칭 체크리스트 (로그인 뒤 채움)

첫 목표 3개는 브리프 §2: **M01 idle · M03 run(또는 M02 walk) · M04 1타(6/5/28)**. 합격이면 M08 구르기 → M05·M07 → M24 피격 → M26 사망 순.

| # | 동작 | 검색 키워드 | 선정 클립 이름 | 길이·fps | 루트 모션 | 자른 프레임(시작~끝) | 접점 프레임 | 접점 정렬 근거 | 판정 |
|---|---|---|---|---|---|---|---|---|---|
| M01 | idle | Great Sword Idle / Idle | | | | | — | | |
| M02 | walk | Great Sword Walk / Walking | | | In Place | | — | | |
| M03 | run | Great Sword Run / Running | | | In Place | | — | | |
| M04 | 1타 | Great Sword Slash / Standing Melee Attack Horizontal | | | In Place | | 4 (틱 8) | 칼날이 정면을 지나는 프레임 | |
| M05 | 2타 | (M04 Mirror) / Horizontal 반대 | | | In Place | | 1 (틱 2) | | |
| M06 | 충전 홀드 | Great Sword Casting / Power Up | | | — | | — | | |
| M07 | 3타 발사 | Standing Melee Attack Downward | | | In Place | | 1 (틱 2) | 검 최저점 | |
| M08 | 구르기 | Stand To Roll / Dive Forward | | | 포함(적용 끔) | | 땅 닿음 ≈ 프레임 4(틱 9) | Core ease-out 곡선과 대조 | |
| M09~M11 | Q | Sword And Shield Block (Idle/React) | | | — | | — | | |
| M12~M14 | E | Great Sword Kick / Sword And Shield Kick | | | In Place | | 4 (틱 8) | 칼등이 정면 | |
| M15 | E 충전 | Power Up | | | — | | — | | |
| M16 | 지옥강타 | Great Sword Jump Attack | | | 포함(적용 끔) | 충격 프레임부터 16 | 0 (틱 0) | 지면 충격 | |
| M17 | 악의구 | Standing 1H Magic Attack 01 | | | In Place | | 3 (틱 7) | 손 최대 전방 | |
| M18 | 가시덫 | Standing 1H Cast Spell 01 | | | In Place | | 0 | | |
| M19 | 회복의 영역 | Standing 2H Cast Spell 01 | | | In Place | | 0 | | |
| M20·M21 | 얼음보주 | 2H Cast 중간 포즈 / Crouch Idle | | | — | | 0 | | |
| M22·M23 | 사슬기동 | Throw Object / Falling Idle / Hard Landing | | | 포함(적용 끔) | | 0 / 당김 끝 | | |
| M24 | 피격 4방향 | Standing React Large From Front/Back/Left/Right | | | In Place | | 0 | 충격 포즈 첫 프레임 | |
| M25 | 기절 | Stunned / Dizzy | | | — | | — | | |
| M26 | 쓰러짐 | Kneeling Down / Standing Death Forward | | | In Place | | 24프레임 도달 | | |
| M27 | 사망 확정 | Dying / Great Sword Death | | | In Place | | 24프레임 도달 | | |
| M28 | 기립 | Getting Up | | | In Place | | — | | |

판정: 사용자 영상 판정(자연스러움) + CTO 틱 일치 확인 + 독립 검수. MO_FOLLOW 7항목 채점 ○ 6 이상이 합격(브리프 §3).

## 9. 요약 수치

| 항목 | 수 | 내용 |
|---|---|---|
| 데모 세트 동작 | **28** | M01~M28 (기본 상태 3·공격 4·구르기/Q/E 8·슬롯 스킬 8·피격/사망 5) |
| Core에 상태가 있는 동작 | 19 | M01·M04~M09·M12~M17·M20·M21·M24~M27. 상태 없음 9: M02·M03(idle 이동)·M10·M11(플래그)·M18·M19(카운터)·M22·M23(HarpActive/DashActive)·M28 → 표현이 플래그·카운터로 그림 |
| 라이브러리에 없을 가능성이 큰 동작 | **6** | M06 기검 충전 홀드 · M15 E 충전 홀드 · M10 Q 받아치기 성공 반응(무지개탄 반사 포즈 공유) · M20 얼음보주 홀드 · M22 사슬 던지기 · M23 끌려감(한 클립으로 안 됨, 3클립 잇기) |
| 길이 상한 초과 위험 | 2 | M08 구르기(상한 0.45초, 라이브러리 구르기는 보통 1초 이상)·M16 지옥강타(도약 예비를 쓸 수 없음) |
| Core 제안 | 3 | CP-SM-01(2타 예비)·CP-SM-02(지옥강타 접점)·CP-SM-03(E 캔슬 이식). 적용 전 |
| 미이식 데모 후보 | 4 | 회전참·악의기둥·해골무덤·악의폭풍(동작 유형만) |

## 10. 검증·한계

- Core 인용은 unity/main `03af52e7`와 CW 브랜치 `28af4472`를 `git show`로 읽어 파일:줄을 적었다. CW 병합 전에는 M04가 0/5/34이고, M05·M07의 회복 34도 시작 장비(spd .45×1.0336) 측정값이다. 공속이 올라 `spd×mul>1.6`이면 1타 회복이 하한 4에 걸려 총 길이가 늘어난다(BASIC_ATTACK_DAMAGE CW 절).
- 라이브러리 키워드는 검색어 후보다. Mixamo에 로그인하지 않았고 클립 이름·길이·fps를 확인하지 않았다. "없을 가능성이 큰 동작 6"은 범주상 모캡 라이브러리에 드문 동작(충전 홀드·받아치기 반동·웅크림 홀드·사슬 끌려감)을 고른 것이며 Mac 검색 결과로 바뀐다.
- 구르기·지옥강타의 "구르기로 끊김"은 `Simulation.cs:94~102` 틱 순서로 읽은 것이고 실게임 로그로 확인하지 않았다.
- 표현 쪽(`NativeHeroMotion.cs`·스프라이트 `NativeGame.cs`)의 상태 매핑 수정은 MO 레인 몫이라 이 문서는 요구만 적었다.
- 크로마 제출과 Mixamo 재배포 조항의 충돌 여부는 미확인(§0). 충돌이면 이 매핑은 2단 외주 발주 사양으로 쓴다.
