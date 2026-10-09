# 보스 돌진 벽충돌: 기존 중성 지면충격24 소비 — 2026-10-10

`ROOT-ENGINE-BOSS-CHARGE-WALL-IMPACT-20261010`. 보스 돌진이 모든 이동 시도에서 벽에 막혔을 때 기존 충격파·카메라·음향과 함께 중앙 지면충격24를 요청한다. 해당 분기에는 이전 전용 atlas가 없었다. 원8장 교체나 새24장 원화 제작이 아니라 이미 승인된 중성 리소스의 새 consumer다.

## 실제 접촉 조건과 표시

| 항목 | 현재 계약 |
|---|---|
| 실제 범위 | `case 'bossCharge'`의 `canMv(nx,ny,e.r)`→x-only→y-only 세 시도 모두 false, `_isDruidFinale(e)`가 false인 벽막힘 분기만 |
| 호출 위치 | 기존 `shockR=0;shockMax=800;s='bossShock';st2=20` 및 `shake=25*OPT.shake/100;SFX.groggy()` 뒤, 원 `break` 앞 |
| 새 요청 | `playVFXAng('boss_meteor_hit',e.x,e.y,150/768,2,0,false)` 벽충돌 상태전환당1회, 기본alpha1 |
| 표시 중심/영역 | 마지막 유효 실제 `e.x/e.y`, 중앙150×150. 별도 벽접촉점 추정·좌표 이동0, shockMax800 피해범위 표시 아님 |
| 단축 미끄러짐 | 전체 이동 불가 뒤 x-only 또는 y-only가 가능하면 원 위치 변화만; 새 벽충격 요청0 |
| Finale 양축막힘 | 원 recover96/SFX.groggy/break. 새 벽충격 요청0 |
| Finale 거리 종료 | `_druidChargeLeft-=spd` 뒤 <=0이면 원 recover96/break. 새 벽충격 요청0 |
| stage0/3 | 기존 `druid_trail`의6frame gate만 유지. 새 소비에는 별도 stage gate가 없으므로 nonfinal stage0/3 양축막힘도 요청1회 |
| 이미지 미준비/실패 | 기존 factory no-op·원 shockwave/카메라/SFX 유지. 이 벽분기에는 원 atlas 폴백이 없음 |
| 중복 방지 | 원 `s='bossShock'` 상태전환 및 즉시break 보존; 바뀐 상태에서 같은 벽충돌 분기를 반복하지 않음 |

## 공유 리소스 및 엔진

| 항목 | 기존 승인 계약 |
|---|---|
| id/name | `boss_meteor_hit` |
| PNG/clip | `assets/vfx/boss/boss_meteor_hit_24_20261010.png` / `.clip.json` |
| atlas | 6열×4행/24장/768×768 셀/4608×3072 |
| clip FPS/loop/duration | 30/false/.8초 |
| 실제 consumer 진행 | 기존 frameTime2/maxFrames24 normalized 진행, 명목48 render 진행 단위 |
| 시간 경계 | 그림장수·clip FPS·화면FPS는 다름. 고정 게임초 또는 자연재생24셀 모두 노출을 보장하지 않음 |
| 이미지와 metadata | 기존 등록Image·JSON loader·same-image rect24 cache·pending metadata direct24grid 재사용 |
| 표시 예산 | 기존 pool20/drawbudget5·cull·합성·종료 그대로. 공격 제한 아님, 모든 동시효과 가시 보장 아님 |
| 이번 변경0 | 원화/PNG/JSON/등록/Image/runtime/loader/helper/editor 변경 및 생성job0 |

## 원 전투·상태 계약 보존

| 항목 | 현재 계약 |
|---|---|
| 준비 | `bossChargeWind`: 기존 방향추적, Finale st2<=18 방향고정; 종료 시 bossCharge50, echDx/cos·echDy/sin, SFX.charge 및 입자8 |
| 이동 | `(_isDruidFinale(e)?18:35)*sp`, 전체→x-only→y-only 순서·성공축 위치만 변경 |
| 벽접촉 | shockR0/shockMax800/bossShock20, 카메라25·groggy, 원break 유지 |
| 플레이어 접촉 | 거리 `<P.r+e.r+80`, 원 iframe<=0, isPWin 우선·detonate/일반 패링·doParry/poise20 보존. 새벽충격 요청0 |
| 패링값 | `_pd=~~((P.baseAtk+weaponAtk+enhMulAtk)*5*pParryDmg())`, detonate stunned60, 일반 stunned90/상대KB18/parryBank 그대로 |
| 일반 접촉 피해 | P.s!='charge'에 `~~(e.atk*2*elMul(e.el,ar().el))`, 실제 중심 방향KB12; 접촉 뒤 원 recover40 |
| 타임아웃 | 원 trailing RNG 이후 st2<=0→recover40. 새벽충격 요청0 |
| 직접 RNG | 벽충돌 분기 RNG0. noncontact continuation은 emission-test1회, 방출 시 x/y/size3회 추가. 외부 음향/입자/피해 helper 내부 총RNG는 미계수 |
| 후속 충격파 | 기존 bossShock source 불변/이번 실행0. 반경·피해·수명 변경0 |
| 보호 | 원PNG/전투/RNG/SFX/save·Q전용blackBean/E불가·어택티켓금지·보호2_3 보존 |

## 검수와 인수 경계

| 항목 | 결과 |
|---|---|
| 최초 source epoch | Node1/첫 epoch1/3그룹158조건 PASS, source actionable0/blocking0. 검수기 준비/실행실패는 source-peer 영수증의 별도 계수 |
| 실제 검수 범위 | whole bossCharge의 통제 before/after. 이동 경로/Finale/접촉/패링/피해/타임아웃·RNG 순서·정확한중심/1요청·changed-state no-op |
| 제외 실행 | 기존 bossShock/등록/factory/render/loader/helper/runtime/PNG/native/GPU/wholegame 실행0 |
| 준비 이력 | 초기 범위 메모의 stage0/3 전체제외 해석은 실행 전 폐기. 현재 계약은 Finale 예외만이며 nonfinal stage0/3도 포함 |
| 제품 source 실행 뒤 수정 | 0 |
| 실제 시각 | 중앙150px·벽과의 위치관계·원shockwave 조화·정상줌·전체보스전/GPU/동시성능·청취·실save/AAA 미검수 |

**VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED.** source PASS를 실제 전투 화면 품질로 대신하지 않는다. 정상줌 검토에서는 충돌 중심의 크기·벽접촉 인지·shockwave와의 조화 및 동시성능을 확인해야 한다. 기존 환경 복구·잠금해제/사용자 게임 상태의 경계는 그대로이며 이 단위가 환경조작을 승인하지 않는다.

관련 정본: [승인 중성 지면24 및 Meteor 소비](BOSS_METEOR_IMPACT24_ENGINE_20261010.md). 기존 완료 원화/등록/소비 검수는 이번 source 결과에 합산하지 않는다.
