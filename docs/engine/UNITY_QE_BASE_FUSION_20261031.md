# Q·E 무료 기본 합체와 원본 표시 대조 — 2026-10-31

상태: 빌드165d02f2의 기검3타 중심 앵커 결함을 발견해 전달 보류했다. 중심·구르기 수정 빌드53ac26ee는 수치·M1을 통과했지만 검기의 지형 수평 잘림이 실제 화면에서 실패했다. 기검 전용3D 재질의 합성 깊이를 바꾼 새 후보를 준비 중이다. 전체 게임 동작 일치 완료가 아니다. 선행 전달은 UNITY_GAMEPLAY_PARITY_20261031.md 및 gameplay-parity/desktop-delivery.json이다.

## 발견

웹 시작 캐릭터는 maliceSwipe1/shieldThrow1/shieldFuse=true다. _ensureBaseWingStrike는 기존 저장에서도 두 스킬을 최소1렙, 합체true, activeRMBSk=maliceSwipe로 보장한다. Unity는 이 시작 상태와 _autoShieldThrow 전체가 빠져 E가 기본 원형 타격만 실행했다. 1배율 화면에서 Q 오라·E 불꽃 호 누락도 확인했다. 최초 실행 경계7개 중 핵심5개가 실패했다. 이후 반사·중복 타격·쿨 보상·원본 마커 경계를 추가했으며 현재14개 모두 확인한다. 이프레임 검사의 초기 무적600을0으로 통제한 이유는 원본이 기존 무적을 감소시키지 않고 max(기존,40)을 적용하기 때문이다.

## 원본 수치와 소유

| 항목 | 웹·현재 구현 계약 | 적용 경로 |
|---|---|---|
| 기본 보유/복원 | maliceSwipe·shieldThrow 최소1, shieldFuse=true | InitStartingSkills·RestoreSkills·CombatRestoreState |
| E 탭/홀드 | 기존 sDraw→sBash 또는 kiGather→sBash, 상태 전환 때 자동 강화1회 | TickPlayerCombat→AutoShieldThrow |
| 별 수/장비 배율 | 합체2성=1.2, 비합체1, 공통 ×(1+skillBoost) | ShieldThrowFusionMultiplier |
| 합체 레벨 | max(1,min(maliceSwipe,shieldThrow)) | 발동당 계산 |
| 쿨다운 | 합체 max(120,720-레벨×15), 비합체720, 매틱1+회복영역 보너스1 감소 | ShieldThrowCd |
| 강화/무적 | 강화40틱, iframes=max(기존,40), 같은 시전틱에 강화는39 | ShieldWingTicks·Player.Iframes |
| 파동 발사점/속도 | 플레이어+방향×25px, 방향×12px/틱 | ShieldWaves |
| 합체 사거리/판정 | M=(1+(합체렙-1)×.05)×clamp(충전,1,3); 사거리210M, 길이r=50M, 폭95M | InShieldWave |
| 판정 경계 | along>-r, along<r+20, abs(perp)<폭/2+적반경; 벽 무시, dist>=maxDist이면 소멸 | TickShieldThrow |
| 합체 피해 | trunc((견갑atk 또는3 + baseAtk×.3 +10)×(1+(shieldThrow렙-1)×.12)×10×(1.5+(합체렙-1)×.12)×합체배율) | 원본 _autoShieldThrow |
| 파동 피격 | 적당1회, 진행방향 넉백30+shieldThrow렙×3, 원본 e.boss=true면 포이즈30 차감, 그 외 _groggy=true/groggyT90/state hit | 적 현재 상태/원본 마커 |
| 비합체 | 견갑 없으면 미발동. 피해trunc((atk+baseAtk×.3+10)×shieldThrow렙×10×3×배율), 범위180+(렙-1)×20 즉시 원형 피해 | 기존 _gSlamHit 원형·속성·포이즈 계약 |
| 반사 | 일반 적탄→유도 블루콩, 대상600px, 대상 없으면 속도×-2, 수명120, 피해trunc(pParryProjDmg(원피해,true)×1.5), 물리 자원3배 | 기존 ParryRules·Druid.Projectiles |
| 반사 제외 | 무지개탄 blackBean은 Q 전용. 리모델 보스 고유 반사 금지 계약 보존 | 원본 금지/리모델 SSOT |
| 저장 | 소유 스킬 두 키와 fused.shieldFuse, activeRMBSk를 기록, 나머지 raw 키·순서 보존 | CombatSaveCodec·NativeGame.CombatSave |

원본의 큰 에너지탄(_fbEnergy/_fdEnergy)은 현재 BossProjectile 모델에 아직 없으므로 이 범위의 자연 반사 완료를 주장하지 않는다. 다른 합체·숙련 축적 전체·미이식 스킬은 별도 후속이다.

## 원본 표시

| 자산/표시 | 규격·알고리즘 |
|---|---|
| Q 오라 | 원본 assets/vfx/vfx_shield_aura.png 동일byte, 5×4/셀480×480/20셀. 현행 웹처럼 앞2셀을8 draw마다 교대. 외곽+20px 흡수 코어2층 |
| Q 반경 | ParryRules.SBlockChargeRadius: 240틱에100→500px, 오라 반경은절반, 오라 크기반경×3.75×pulse; 14px/9px 점선·폭2.5px |
| E 강화 호 | 원본 assets/vfx/flame_blade_swing_8f.png 동일byte, 4×2/8셀. 셀1px 인셋·프레임floor(progress×8), 크기(200+견갑추가범위×8)×충전×레벨범위 |
| E 진행 | sBash=(24-st2)/40, sRecover=(40-st2)/40, progress>=1 숨김, 강화수명>0 조건 |
| 합성·3D 앵커 | 웹 GPU 프록시처럼 원본 일반 알파, 기존 normal-blend 셰이더 재사용. 중심 앵커로 추가 발밑 lift 없음, 3D 몸 중앙보정 .5u. 판정 점선은 실제 지면 좌표 |

원자산 SHA256: Q 5ddc7d15db2ef112f9901ccd3d02d812d7ab361fbb4a49165f6141e7ca22672e, E 2aaa6d8e04ea2f37228c460be8f335886d9365f372f81bcff1a0671db35af8d1. 신규 생성/유료 지출0. 원본 파동은 별도 검기 본체가 없고 먼지 중심이다. 세부 먼지·음향·기폭팔 변색 전체는 아직 별도 검수 대상이다.

## 검수

- 실제 웹 _autoShieldThrow 함수와 파동 판정 식을 추출한192조합/경계4704점, 총6336검사 불일치0. 입력 각도를 양쪽 float로 통일했다. 최초608건은 Core float facing과 웹 double facing을 다른 입력으로 준 정확 경계의 차이였고 초기 실패 파일을 보존했다.
- 실제 Simulation E 경계14개: 신규보유·기존상태진입·무적·쿨다운·강화·생성·소멸·무지개탄 제외·블루콩수명·한번피격·그로기.
- save2604/0, dash-parry187165/0, skill13216/0 및 저장경계6 통과.
- 현재 전체 Runtime280개 C# 독립컴파일 오류0. 과거 응답파일에서 최신 UI NativeUiAudit를 빠뜨린 실패는 보존하고 현재 파일목록으로 다시 생성했다. 정식 Unity 컴파일 근거와 구분한다.
- 정식 빌드·실제3D Player Q/E 표시·새로운 Core/DLL의 M1·비교영상·1배율 판정·공통/바탕화면 전달 전까지 미검증 유지.

E의 색 지정 충격파도 지옥강타 화염 시트의 재착색에서 원본 이중 링으로 바꿨다. 반경30+(maxR-30)×진행, 선폭12×(1-진행×.55)+5px, 외곽반경1.075배/폭max(2,선폭×.28), 불투명도min(1,1.1×fade)/.7×fade다. 기본 타격#66aadd, 비합체불꽃#ff7a24. 지옥강타 전용 시트 표현은 유지한다.

추가 실제 제어 검사에서 물리 패링1발당 지옥강타 쿨30틱 회복 누락을 재현했다. Simulation.ApplyParrySuccess에서 resourceMul==3일 때 max(0,GiantSlamCd-30)을 적용한다. 쿨100에서 일반1틱감소99 뒤 패링69를 확인하는 RED→GREEN 검사다. 천공쇄기·유니크 프레임별 추가 쿨 회복은 해당 미이식 경계로 남긴다.

회복영역 종료 경계의 원문은 영역 수명 갱신 전 보너스를 계산한다. 현재 프레임의 영역 참조를 보존해 새 E 쿨다운에도 마지막 틱 보너스를 유지했다. 쿨705→703, 영역 소멸을 함께 검사한다. 추가 후 실제 실행 경계는13검사다.

원문 엄격 보존 정정: 파동은 일반 보스 표식 ib가 아니라 e.boss를 검사한다. 현재 웹 mkEn은 boss를 부여하지 않으므로 보통 ib 보스도 _groggy 마커 쪽을 탄다. IsBoss로 임의 치환하면 포이즈30을 추가로 깎는 차이가 생겨 RED로 재현했으며, 별도 원본 boss 필드로 보존했다. 앞 표의 보스30 설명은 boss=true일 때만 해당한다. 기존 그로기 마커를90틱 실제 스턴으로 해석하지 않는다. 현재 실행 경계14개다.

최초 연습 실제Core88검사는 통과했다. 기존 skill-sim의 “원형 밖160px 적 무피해”1건은 무료 파동이 그 적을 타격해 실패했다. 원형만 검사하는 기존 fixture에서 shieldThrow만0으로 격리하고 실제 기본 합체는 별도 실행 경계/원문 직사각 판정에서 유지한다. 제품의 사거리·판정을 축소하지 않는다.

## HUD·스킬창 실제 키 대응

현재 웹 CSS는 물리7번에 qsE(마법), 9번에 skSlotRMB(칼등)를 배치한다. 네이티브는 그 의미를 반대로 사용해 실제 RMB 악의구/E 칼등 입력과 아이콘이 뒤집혀 있었다. 현재 웹 CSS와 실제 _slotSkId를 직접 실행해13위치를 추출했고, SkillDockBinding으로 물리 HUD와 의미 순서 스킬창 사이7↔9를 연결했다. HUD의 기본RMB=fireball/E=maliceSwipe, 클릭 대상·강화 상태·E 쿨705가 일치한다. 설정을 X/V로 바꾸면 HUD와 스킬창 키·제목도 같은 값으로 갱신한다. 바인딩 Version이 바뀔 때만 HUD 문자열을 갱신한다. 스킬창은 실행 가능한 E를 미이식으로 표기하지 않고 기본 불꽃칼날 합체를 표시한다.

오프라인 실제 웹13슬롯+키변경/클릭/쿨18검사 차이0. -qe-ui 1 --unity-skill-smoke는 실제 Player의 기존 HUD 콜백을 통해 기본키/변경키 마법·칼등 스킬창4장을1600×900으로 찍고 월드틱/HP 보존을 확인한다. 기존 사용자 바인딩은 해당 격리 Player 안에서 복원하며 실제 손조작으로 보고하지 않는다. 현재 실화면은 아직 미검증이다.

## 합체 강화·기검 성장 저장 정정

| 항목 | 원본·수정 후 계약 | 수정 전 차이 |
|---|---|---|
| 불꽃칼날 강화 | 호스트 maliceSwipe의 캐릭터50렙당 해금·20렙 상한. 구성원 최저레벨+1을 둘 모두에 max 적용. 높은 구성원은 내리지 않음 | 호스트만+1 |
| 합체 강화 SP | 구성원 최저렙1~8은2, 9~19는6. UI도 같은 실제 비용 표시 | 고정1 |
| 기검참 강화 | 기본 학습, 일반 강화 SP1·50렙당 해금·20렙 상한. 실제 Config.KiSlashLevel과 Skills를 함께 갱신 | 강화 버튼·학습 상태 누락 |
| 기검참 저장 | skills.kiSlash를 소유해 Codec 왕복 후 실제 검기 레벨 복원, 기존 누락 저장은 기본1 | 성장 레벨 누락·복원1 |

현재 웹 _skCtx/_skLearnUp/_skillUpSpCost/_fuseUpSpCost를 직접 실행했다. 합체1,470사례는 수정 전455차이→0, 기검210사례의 조건·수치·SP·실제 저장왕복1,470검사는 수정 전1,025실패→0이다. 메타데이터 upSp5가 아니라 실제 실행 함수의 SP1을 보존한다. 전체 학습/다운그레이드/리셋 구현 완료를 뜻하지 않는다. 실제 Player 검수는 기존 콜백으로 여는4장에 강화 후 칼등/기검2장을 추가하며 총14검사를 계획한다. 사용자 저장을 사용하지 않는다.

## 기검 3타 홀드와 Q 취소 연속 대조

동일 스타터 장비·이동키를 유지하고 실제 웹 update에 119/159/210틱 LMB 홀드, 110틱째 Q로 취소하는 네 입력을 각각260틱 실행했다. 1,040틱 중 홀드·충전·검기 수치 자체는 일치했고 Q취소 사례의 뒤150틱이 달랐다. 원본 _tryKiSlashQCancel처럼 activeLMBSk=kiSlash의 wWindup/wSwing/wRecover에서 Q 홀드·MP10 이상·기존 Q쿨0 조건이면 즉시 sBlock으로 들어간다. 취소 틱에는 이동하지 않으며, 충전 중이었다면 충전값·콤보를0으로 초기화한다. 기존 일반 공격/다른 자세의 진입 규칙은 유지한다. 실제 Core 동일 입력1,040틱의 위치·상태·타이머·자원·충전·콤보·검기 위치/피해/수명/반경 차이는 수정 후0이다.

Player의 -combo-parity 1 입력4종/1,040틱·348장과 동일 웹 연속 화면을 추가 검수한다. 가상 Input System 입력을 실제 FixedUpdate로 전달하며 사용자 OS 손조작으로 보고하지 않는다. 앞선 a17e37b8은 b086 입력으로 제품컴파일0오류였으나 대기 취소와 슬롯 획득이 겹쳐 래퍼만 중지했다. 소유 Editor/ImportWorker 자연 종료를 확인하고 자동임포트519파일을 I:백업·복구했다. 새 Q취소를 포함하지 않으므로 이 빌드를 채택하지 않으며 정식 전체 게이트를 고유 경로에서 다시 진행한다. 보완 동안 자기 유휴 예약을 반환하고 A2 뒤 재예약했다.

원본 실제 DOM 강화 버튼6장에서도 기본 SP2 합체 강화→두 구성2렙/SP2, 기검 강화→2렙/SP1을 확인했다. 오류/누락0·무창·잔여0. 합체 중인 Native 스킬창 슬롯/선택 제목/모체 이름은 원본처럼 불꽃칼날로 표시하며 재료 구슬의 개별 이름은 유지한다. 원본 웹 스킬창의 오래된 RMB/E 고정 표기와 현재 실제 BINDS의 차이는 원본 UI의 관측값이며, Native는 실제 바인딩 키를 표시한다.

## 02시 야간 보류 경계 — 최신 운영표 적용

현재 입력05f298426103fd593d43d6285282770516e3aa0b, Unity tree c0f477c27cde838ec8516d27400ea6be2587363a, Core tree7aa7929f5b687a76b25063d7e51e6c6556cbcfd5다. 전사 중심앵커 공통018ce33f2를 정상 병합했으며 Q/E 초기화와 중심 스프라이트 정리를 모두 보존했다. 현재280개 Runtime 독립컴파일 오류0·중복 소스 경고0, 관련 원본/실제 Core 회귀는 통과했다.

I:/EXODUSER-Storage/codex-takeover/NIGHT_ROSTER_20261031.md의 00:5x 사용자 소음 지시는 현재 작업 시작15:41UTC보다 늦게15:55UTC 갱신됐다. “08:00 KST까지 동시 작업은 3개만: 맵 숲·보스 드루이드·영웅 전사. UI 겹침·게임 구동 대조·MCP 병합은08:00 이후 다시 띄운다”를 확인해 게임대조는 HOLD한다. 자기 r2 미착수 대기 래퍼11952만 소유 확인 후 취소했고 자기예약만 반환했다. A2의 서버/예약/잠금은 변경하지 않았다.

| 게이트 | 현재 상태 |
|---|---|
| 원본 E·합체/기검 강화·저장·Q취소·HUD 대조 | 통과, 새 수치·코드 근거는 앞 절과 오프라인 영수증 |
| b086 빌드a17e37b8 | 제품컴파일0오류, 래퍼 중지/새Q취소 미포함으로 미채택 |
| 최신05f r2 정식 빌드 | 아직 미착수, 야간 HOLD로 대기만 취소 |
| 같은 새DLL M1·실제 Player540틱/1040틱·강화 UI6장 | 미실행 |
| Q/E·3타 새 비교영상·동일크기/1x | 원본 촬영 준비, 새Player 증거 없음·미검증 |
| MERGE_QUEUE READY·새묶음 unity/main·Desktop | 미완료. READY 제출/미검수 후보 채택 없음 |

일반 Desktop은 현재 전사 담당이 검수·전달한 hero/night-anchor-20261031/build이며 -force-d3d11 --remodel3d와 시작폴더/아이콘을 읽어 확인했다. 이 Q/E 후보로 교체하지 않았다. 전체 게임 동작 정합·미이식39스킬·전체 아트 완료가 아니다. 08:00 이후 기존 담당 재개 시 입력05f/동일 Unity tree를 먼저 확인하고 고유 빌드 경로에서 나머지 게이트를 순서대로 진행한다. 새예약·자동화·별도 담당은 만들지 않는다.

야간 마감 추가: 원본3타 촬영은 cf026001로 정상 종료했다. 1,040틱·동작348장/부팅1장, 기존 숫자 전용 로그와1,040행 차이0·페이지오류/누락0·창/잔여0이다. 자기3344 서버도 소유 확인 후 종료했다. 기존 미추적55/55 SHA256 동일. 새 Player와 비교한 영상은 아직 없다.

## 재개 시점 확인

2026-10-31 02:26 KST: origin/unity/main 최신을 fetch·merge 확인했으며 이미 현재 HEAD의 조상이다. HEAD21a983c63/Unity tree c0f477c27/Core tree7aa7929f5는 위 검수 입력과 같다. origin/main6264ba37e의 game.html·index.html·localization-runtime.js도 기존 웹 기준0d42e0cb와 동일 Git blob이다. 관련 원문 검수는 같은 입력의 유효 결과를 재사용하며 새 실행으로 계산하지 않는다. tracked INDEX/WORK는 모두 비어 있었고 기존 미추적56개는 재개-착수보존.json에 SHA256을 기록했다. 기존 A2 잠금·예약 뒤 같은 담당 gameplay-parity로 정식 빌드와 후속 Player 검수 순번을 신청했다. 현재 산출물은 gameplay-parity/재개-QE-정식빌드.log다. 과거 야간 HOLD는 이 재개 시점의 현재 상태가 아니다.


## 2026-10-31 04:18 시작 스킬 실제 대조

새 3D 빌드 1c4b8e34(f4238e241 입력)는 오류0, 같은 실행본 hidden M1 8ce69de8의23단계·이동540틱·기검1040틱·구르기80틱·스킬창6장·시작14입력1350틱 검사를 통과했다. 실제1600×900의 Combo210-210에서 기검 하단 수평 잘림이 사라지고 중심 오차0을 확인했다. 다만 실제 웹1350틱의 추가 대조에서 자원·상태·위치260틱 차이, 쿨다운까지 포함하면303틱 차이가 발견되어 이 빌드는 공통/바탕화면에 채택하지 않았다. 해당 화면은 새 Core 수정의 실행 증거로 재사용하지 않는다.

| 항목 | 현재 원문과 수정 내용 | 근거와 한계 |
|---|---|---|
| Shift 3단 자동 발사 | 홀드12틱 도달 시 키업 전에 발사. 키업 발사는 이벤트 단계, 자동 발사는 홀드 증가 뒤, 비행63px/틱·끌림16틱·거리700px은 기존 원문 수치 유지 | 14틱 홀드 사례의 첫 발사11번 틱·최대131.25px 시간차 해소. 벽 도우미·장기 홀드 착지 재발사·파생 이동기는 이 사례로 검증하지 않음 |
| 스킬 키 이벤트 | DispatchSkillKeys를 일반 자원 재생·StateTicks 감소 앞에 실행. Roll 우선순위·Space 중복 시전 차단은 유지 | 지옥강타 첫 상태 타이머10→9, iceOrb 진입 첫 틱의 비idle 재생 배율 일치 |
| 얼음보주 종료 | idle 복귀 때 기존 StateTicks 보존. 마법 자세→기존 투사체 이동→쿨다운→얼음보주 자동 파쇄→장판 순서 | 119번 틱에 파편8발을 원점 반경47px에 생성, 첫 이동은 다음 틱. 임의 타이머0 초기화·생성 틱8.5px 선행 이동 제거 |
| 회복의 영역 | 자원 재생 앞에서 첫 겹침 영역의 평탄 회복(10+Lv×2)/60을 적용한 뒤 기본 HP/MP/ST 재생을2배. 장판 후반 중복 회복 제거 | Lv1·idle·MP330에서 첫 틱330.2125, 80틱 뒤347.0(웹 double 기준). 다중 영역은 첫 영역만 적용하는 원문 계약 |
| Q 보호막 쿨다운 | sBlock 동안 SbCd 감소 정지, 해제 다음 틱부터 감소 | 기본30틱. 기존 실제 hold14 사례에서43틱 쿨다운 차이 해소. 보호 설계 문서2_3은 변경하지 않음 |
| 비교 난수 | SkillRandom01은 검수에서만 .5를 공급하며 기본null일 때 기존 독립 LCG를 그대로 사용 | 실제 웹 Math.random=.5 통제와 얼음 파편 좌표를 대조하기 위한 주입점. 정상 게임 난수 고정 아님 |

현재 제품 소스의 설치 Unity Core/Runtime 독립 컴파일 오류0(기존 경고2/15), 실제 원문1350틱의 위치·자원·상태/타이머·쿨다운·악의·무적·게이지·보주·파편 좌표 모두 차이0이다. 기존 이동540·기검1040·구르기80·E14경계도 차이0. 도구는 unity/Tools/gameplay-parity/StartingSkillsTrace.cs, 실행은 GameplayParity.dll --starting-skills-trace <web-all-skills.json> <inventory_seed.json> <출력.json>. NativeGame.PlaytestCapture에는 네 쿨다운·Q 쿨다운·악의·보주 상태/타이머를 추가해 새 Player에서도 같은 값을 확인한다.

증거: I:/EXODUSER-Storage/demo-art/gameplay-parity/starting-skill-red01/결과.json, starting-skill-red02-strict/결과.json, starting-skill-candidate05-source-phases/결과.json, starting-skill-product-gates/영수증.json, starting-skill-independent-compile/영수증.json. 변경 전7파일은 starting-skill-source-before/목록.json에 byte 보존했다. **이 새 Core의 정식 빌드·동일 M1·실제 Player·영상/1배율·공통/바탕화면 전달은 아직 미완료**다. 전체55개 중 기존 실행 소유8개의 이번 입력 범위만 다뤘으며 전체 스킬·자연 전투·후반 진행 완료가 아니다.


### 2026-10-31 04:22 제품 회귀 재확인

현재 제품 소스로 시작 스킬1350·이동540·기검1040·구르기80·E14경계가 모두 불일치0이다. 보호막 쿨다운이 경직/기절 동안 멈추던 추가 결함은 현재 원문33211과 생존4자세×5쿨다운20조건으로8실패를 재현한 뒤, 입력 차단과 독립적으로 쿨다운을 감소시켜20/0으로 수정했다. sBlock 유지 중에는 감소하지 않는다. 도구 옵션은 --shield-cooldown-trace <Q쿨다운-생존자세-원문.json> <출력.json>이며, RED는 I:/EXODUSER-Storage/demo-art/gameplay-parity/Q쿨다운-생존자세-RED.json에 보존했다.

현재 Core로 새로 추출·컴파일한 저장2604·돌진패링187165·스킬13216도 모두0, 최초 연습88·기존 스킬 실행107도 통과했다. 새 oracle은 starting-source-oracle/suite-save-oracle.json, 제품 회귀는 starting-skill-product-gates/영수증.json 및 starting-skill-integrations/영수증.json에 있다. 현재 전체는 여전히 진행 중이며 새 정식 빌드·같은 M1/Player·영상·공통/바탕화면은 미완료다.
