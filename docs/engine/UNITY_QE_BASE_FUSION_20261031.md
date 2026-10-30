# Q·E 무료 기본 합체와 원본 표시 대조 — 2026-10-31

상태: 구현·오프라인 검사 완료, 정식 Unity 빌드·같은 Player·M1·영상은 대기. 전체 게임 동작 일치 완료가 아니다. 선행 전달은 UNITY_GAMEPLAY_PARITY_20261031.md 및 gameplay-parity/desktop-delivery.json이다.

## 발견

웹 시작 캐릭터는 maliceSwipe1/shieldThrow1/shieldFuse=true다. _ensureBaseWingStrike는 기존 저장에서도 두 스킬을 최소1렙, 합체true, activeRMBSk=maliceSwipe로 보장한다. Unity는 이 시작 상태와 _autoShieldThrow 전체가 빠져 E가 기본 원형 타격만 실행했다. 1배율 화면에서 Q 오라·E 불꽃 호 누락도 확인했다. 초기 경계 검사11개 중 핵심5개가 실패했으며 구현 뒤11개 모두 통과했다. 이프레임 검사의 초기 무적600을0으로 통제한 이유는 원본이 기존 무적을 감소시키지 않고 max(기존,40)을 적용하기 때문이다.

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
| 파동 피격 | 적당1회, 진행방향 넉백30+shieldThrow렙×3, 보스 포이즈30 차감, 일반 _groggy=true/groggyT90/state hit | 적 현재 상태/원본 마커 |
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
- 실제 Simulation E 경계11/11: 신규보유·기존상태진입·무적·쿨다운·강화·생성·소멸·무지개탄 제외·블루콩수명·한번피격·그로기.
- save2604/0, dash-parry187165/0, skill13216/0 및 저장경계6 통과.
- 현재 전체 Runtime277개 C# 독립컴파일 오류0. 과거 응답파일에서 최신 UI NativeUiAudit를 빠뜨린 실패는 보존하고 현재 파일목록으로 다시 생성했다. 정식 Unity 컴파일 근거와 구분한다.
- 정식 빌드·실제3D Player Q/E 표시·새로운 Core/DLL의 M1·비교영상·1배율 판정·공통/바탕화면 전달 전까지 미검증 유지.

E의 색 지정 충격파도 지옥강타 화염 시트의 재착색에서 원본 이중 링으로 바꿨다. 반경30+(maxR-30)×진행, 선폭12×(1-진행×.55)+5px, 외곽반경1.075배/폭max(2,선폭×.28), 불투명도min(1,1.1×fade)/.7×fade다. 기본 타격#66aadd, 비합체불꽃#ff7a24. 지옥강타 전용 시트 표현은 유지한다.

추가 실제 제어 검사에서 물리 패링1발당 지옥강타 쿨30틱 회복 누락을 재현했다. Simulation.ApplyParrySuccess에서 resourceMul==3일 때 max(0,GiantSlamCd-30)을 적용한다. 쿨100에서 일반1틱감소99 뒤 패링69를 확인하는 RED→GREEN 검사다. 천공쇄기·유니크 프레임별 추가 쿨 회복은 해당 미이식 경계로 남긴다.

회복영역 종료 경계의 원문은 영역 수명 갱신 전 보너스를 계산한다. 현재 프레임의 영역 참조를 보존해 새 E 쿨다운에도 마지막 틱 보너스를 유지했다. 쿨705→703, 영역 소멸을 함께 검사한다. 추가 후 실제 실행 경계는13검사다.
