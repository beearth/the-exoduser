# 보스 점프 착지: 기존 중성 지면 임팩트24 선택 소비 — 2026-10-10

`ROOT-ENGINE-BOSS-JUMP-IMPACT-20261010`. 보스 점프 착지에서 쓰던 피16장만, 이미지 준비 시 이미 승인된 중성 지면충격24장으로 바꾼다. 피와 지면충격을 겹치지 않는다. 새 원화 제작이나 전체 사망효과 교체가 아니다.

## 실제 연결

| 항목 | 현재 계약 |
|---|---|
| 실제 caller | `case 'bossJump'`, `e.st2<=0` 착지의 `deathFX(e.x,e.y,e.r,e.col,false,false,e.etype,'boss_meteor_hit')` |
| 선택 API | `deathFX(x,y,r,col,isBoss,noSound,et,impactId)`의 선택8번째 인자. 기존 caller는 생략 |
| 준비 조건 | `impactId==='boss_meteor_hit' && _VFX_SHEETS.boss_meteor_hit?.img` |
| 새 표시 | `playVFXAng('boss_meteor_hit',x,y,150/768,2,0,false)` 1회. 기본 alpha1 |
| 표시 영역 | 실제 착지 좌표 중심150×150. 피해반경300이나 충격파 `shockMax`를 표시하는 원이 아님 |
| 표시 guard | 원 `_tooMany=_partCnt>300` 스냅샷, `if(!_tooMany)` 유지. guard 탈락은 새·원 atlas 모두 요청0 |
| 미준비/다른 선택 | `death_blood`16, 원 scale·speed·randomangle·alpha1.5 유지. missing 등록/null 또는 img 없음도 원16 |
| 기본 scale | `_deathBloodScale(r)=max(.8,min(4.8,.35+max(1,Number(r)||8)*.075))` |
| 기본 speed | `isBoss?6:4` |
| 기본 angle | `Math.random()*Math.PI*2`, 선택분기 전에 정확히1회 소비. 새 angle0에도 원 RNG 순서 보존 |
| 남는 입자 | 원 흰 링·중앙 flash·기타 `deathFX` 입자 그대로. 선택 atlas 단일 교체이며 입자 제거 아님 |
| 음향 | 기존 `deathFX` etype/noSound/보스 음향 분기·throttle·큐·상한 그대로. 오디오 포함 RNG의 고정총수는 주장하지 않음 |

## 공유 리소스와 시간

| 항목 | 기존 승인 리소스 계약 |
|---|---|
| id/name | `boss_meteor_hit` |
| PNG | `assets/vfx/boss/boss_meteor_hit_24_20261010.png` |
| clip | `assets/vfx/boss/boss_meteor_hit_24_20261010.clip.json` |
| atlas | 6열×4행/24장/셀768×768/전체4608×3072 |
| clip FPS/loop/duration | 30/false/.8초, 공유 데이터값 |
| 실제 consumer | 기존 `frameTime=2`, `maxFrames=24` normalized 진행. 명목48 render 진행 단위 |
| 시간 한계 | 고정 게임초/24FPS/화면FPS와 동일하지 않음. 자연재생 중24셀 전부 노출을 보장하지 않음 |
| 이미지/캐시 | 기존 등록Image·JSON loader·동일 image의 lazy rect24 cache 재사용. 이번 신규 등록/이미지/JSON/runtime/loader/helper 변경0 |
| metadata 미준비 | 기존 동일 새 PNG direct24grid 계약 유지 |
| PNG 미준비 | 이 caller는 기존 `death_blood`16으로 폴백 |
| 표시 정책 | 기존 pool20/drawbudget5 그대로. 공격제한 아님, 모든 동시효과 표시 보장 아님 |

## 전투·경고 보존

| 항목 | 현재 값/한계 |
|---|---|
| 점프 진행 | 기존 `prog=1-e.st2/40`, 기존 이동 보간 및 `canMv` 통과 좌표만 채택 |
| 준비/경고 중심 | `jumpX/jumpY`의 radius300. 벽으로 실제 착지가 막히면 실제 `e.x/e.y`와 다를 수 있음; 이번 수정0 |
| 착지 | `e.s='bossShock'`, `e.st2=25`, `shockR=0`, `shockMax=800+G.stage*50` |
| 화면 반응 | `shake=25*OPT.shake/100`, `SFX.groggy`, `flashT=5`, `flashCol='#ffaa00'` |
| 착지 판정 | 실제 중심 `dst(P,e)<300`, 원 iframe/charge guard, `~~(e.atk*1.8*elMul(e.el,ar().el))`, KB15 |
| 후속 충격파 | 기존 radius진행 `4.5*sp`, 접촉창18, 피해 `~~(e.atk*1.4*elMul(e.el,ar().el))`, KB8 |
| 회복 | 원 종료 guard 및 recover55 유지. 40/25/55는 기존 진행값이지 wallclock초 아님 |
| 비행 trail | stage0/3 기존 `druid_trail`/6frame 호출 불변. 이번 리소스/동작 제작0 |
| 보호 계약 | 전투/RNG/save/원PNG·다른 `deathFX` caller·Q전용blackBean/E불가·어택티켓금지 불변 |

## 최초 검수와 남은 작업

| 검수 | 결과와 범위 |
|---|---|
| source 첫 epoch | Node1, 실제 whole `deathFX`+`bossJump` 통제4그룹144조건 PASS/actionable0/blocking0 |
| 실행 계수 | direct deathFX before23/after27. 실제 착지12회씩 포함 파생 body before35/after39. jump matched16회씩, after changed-state no-op12 별도 |
| 보존 관측 | ready 단일24/원16 폴백/part300·301/RNG순서·사운드분기·좌표·이동·판정·중복착지방지 |
| source 외 경계 | `bossShock` byteexact만; 등록/factory/loader/helper/runtime/PNG/native/GPU/wholegame 실행0 |
| 준비 이력 | ROOT UTF-8 bytes literal SyntaxError1은 제품쓰기·실행 전. 이미지ready guard 한정보강1은 첫 source 실행 전. 둘 다 제품실패/PASS조건 합산0 |
| 실행 후 수정 | 제품 source 실행 후 code 수정0. 기존 완료 suite/원화 재검사0 |
| 새 제작 | 신규 원화/이미지/clip/job0. 기존 neutral24 재사용이며 새 그림24 제작으로 세지 않음 |
| 시각 인수 | 실제150px/원 흰링·flash/거대 충격파 조화·정상줌·전체보스전·GPU·동시성능·청취·실save/AAA 미검수 |

**VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED.** 24장 연결과 source 검수를 실제 인게임 화면 품질로 대신하지 않는다. 다음 인수는 기존 환경 복구 승인·실제 조작 상태 확인 후 정상줌 전투에서 중앙충격/원입자/경고의 조화와 동시성능을 판단하는 것이다. 이 문서가 서버 재시작·사용자 게임 조작을 승인하지 않는다.

관련 기존 정본: [중성 지면24 제작 및 Meteor consumer](BOSS_METEOR_IMPACT24_ENGINE_20261010.md), [Slam 재사용 연결](BOSS_SLAM_IMPACT24_ENGINE_20261010.md). 이들 완료 unit 검수는 이번 결과에 합산하지 않는다.
