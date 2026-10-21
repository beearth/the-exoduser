# BOSS11-02 — 다크드루이드 텔레그래프와 아레나 카메라

기준 `391158e30b3418330a425ec4ee6d7f71ce0c1cbd`, 작업 branch `codex/boss11-02-20261021`. **VISUAL VERDICT: RETOUCH / 보스전 데모 완성 인수 불가.** 위험 면·충전의 정지 표본은 개선됐지만 전23패턴 자연 전투와 유효 성능 표본은 확보하지 못했다. PC 전투 코어/판정/피해/패링/HP/저장/번역 목록 byte 변경0. 본체 atlas와 공유 림은 BOSS11-01 그대로다. 새 이미지0.

## 설계 근거와 적용 경계

사용자가 지정한 디아블로3·4/PoE2 공식을 이 작업의 디자인 기준으로 적용한다. 위험의 **위치·범위**는 처음부터 면으로 고정하고, 별도의 **진행 경계**를 움직여 시간을 표현한다. 환경 장식과 공격을 구분하는 뼈색/먹색 대비를 쓰며, 도넛의 빈틈을 위험으로 칠하지 않는다. Blizzard의 [2021년12월 개발 설명](https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021)은 전투에서 치명적인 공격의 가독성을 우선하고 animated target area와 피해 적용의 일치를 강조한다. 여기서 채움/충전/안전 공간을 분리한 구체적 구현은 사용자 원칙에 따른 이 프로젝트의 설계이며, 세 게임의 모든 공격이 같은 셰이더를 쓴다는 주장이 아니다.

`boss11_visual_reader.gd`는 Main의 기존 boss actor와 source_state를 한 번 바인딩하고, actor `_enemy`와 현재 G의 기존 queue를 읽는다. source owner 요청/상태 쓰기/RNG 호출0. 이 private snapshot 필드에 대한 결합은 네이티브 actor 구현에 의존한다. reader 설치는 `product_scene.gd`의 기존 초기화 경로 하나이며, field에서는 숨기고 처리하지 않는다. dormant actor는 그리지 않는다. 실제 PC owner의 정상 spawn/tick/gate를 우회하지 않는다. 따라서 fixture 그림을 자연 패턴 실행이나 완성된 제품 보스전으로 세지 않는다.

## 모양·범위·시간 규칙

| 패턴/원본 상태 | 모양과 읽는 값 | 충전/시점 | 현재 검수 |
|---|---|---|---|
| slam / bossSlamWind→bossSlam | 원, si0의 `1000+_bossPhase×80`; phase4=1320 | 처음 관측한 source wind countdown W를 보존, wind `1-(st2+8)/(W+8)`, strike `1-st2/(W+8)`; 실제 strike8f를 포함 | 면/0·50·95% 정지 표본 개선; 하단 HUD 가림·자연 타격 미검증, RETOUCH |
| tideWave / `_tideWaves` | 도넛, 외곽 `r+w`, 내곽 `max(0,r-w)`, `gapAng±gapSize`는 비움 | 이미 진행 중인 파동은 실제 r에 맞춰 이동; 충전 완료 상태1.12 | 중간 r1000/w60/gapAng-.65/gapSize.8 표본에서 빈틈 식별. maxR1750/다중 파동 자연 상태는 미검증 |
| groundFissure / `_fissures` | 폭w=140의 **이동 궤적 보조 띠** + 현재 tip의 폭발 원 explR. 궤적 자체 피해 판정은 원 소스에 없음 | 종착 충전 `len/maxLen`, 이동 tip=`origin+direction(ang)×len`; 기존 굴절 추적 유지 | fixture maxLen2304/explR691.2. 종착이 외곽 나무와 화면 우측에 가려 RETOUCH |
| burrowStrike / bossDruidUnder | `_diveTx/_diveTy`, 반경 `r+120`=164 (r44) | `1-st2/_underMax`, underMax 없을 때 첫 실제 관측 countdown; Erupt는 활성1.12 | 확정 지점 원 표본 개선; 실제 추적/잠행/분출 시점 미검증 |
| chaseAoe / `_chaseAoes[].zones` | 미타격 zone의 x/y/r, source r450 | `t/delay` (source delay90), hit zone은 숨김 | 면과 내부 진행 경계 식별; 실제 생성·순차 발동 미검증 |
| lavaPools / `_lavaPools` | 각 pool x/y/r, source r150·3개·간격360 | 각 `t/warnT` (55/73/91f), 활성 이후1.12로 clamp | fixture는 세 원에 같은50%를 넣어 모양 비교. 실제 reader는 각 source timer를 따름 |
| slashCombo / bossSlashWind | 부채꼴, `r+P.r+300`, facing±1.2rad; r44/P.r15이면359 | 관측 wind countdown 진행 | 정지 부채꼴 개선, 실제 반복 slash 타격창/추적 미검증 |
| sweep / bossSweepWind | 부채꼴, `r+P.r+400`, facing±1.7rad; r44/P.r15이면459 | 관측 wind countdown 진행 | 정지 부채꼴 개선, 자연 타격창 미검증 |
| spin / bossSpinWind,bossSpin | si0 원 반경500 | wind countdown, 활성1.12 | 정지 원 개선, 활성 검기/이동 미검증 |
| grab / bossGrabWind | 원 `r+P.r+200`=259 | `_grabWindMax`의 실제 st2, 없으면 관측 countdown | 정지 원 개선; 기존 잡기·피해·제어 판정 불변 |
| jump / bossJumpWind,bossJump | 실제 jumpX/Y의 착지 접촉 원300 | wind의 관측 countdown | 착지 접촉만. 이후 shockMax800 이동 파동 전체를 위험 원으로 오표시하지 않음; 자연 도약 미검증 |
| poisonTrail / `_poisonPools` | 게시된 pool의 x/y/r만 표시 | 활성1.12 | 기존 queue가 실제 제공될 때만. 자연 검수/전용 캡처 없음 |
| seekerMines / `_seekerMines` | 각 실제 mine x/y/r | t/armT | source queue만. 자연 검수/전용 캡처 없음 |
| projectiles / elemBall / beanStorm / rapidMissile / fan / burst / mine | 기존 projectile renderer와 raw 색·parryClass 그대로 | 탄별 원래 계약 그대로; 가짜 지면 위험 면을 덧씌우지 않음 | BC09 통과. before/after projectiles는 **391158e3의 동일 도형 대비 표본 복사**, 실제 탄/Q/E 증거 아님 |
| charge / multiDash | 충돌로 달라지는 미래 종점을 임의로 생성하지 않음 | 실제 경로 예고 미완료 | NOT_READY — 새 면/전용 캡처 없음 |
| shock | 이동 shockR와 접촉 폭18에 대한 별도 예고 미연결 | 미완료 | NOT_READY — 전용 캡처 없음 |
| summon | 실제 소환 위치 게시 전 가짜 위험 구역 생성하지 않음 | 미완료 | NOT_READY — 전용 캡처 없음 |

23종 전체를 완료로 세지 않는다. 전용 정지 표본11종(slam/tideWave/groundFissure/burrowStrike/chaseAoe/lavaPools/slashCombo/sweep/spin/grab/jump), 기존 대비 도형 projectiles1종이다. 나머지12종(charge,burst,shock,fan,poisonTrail,multiDash,elemBall,beanStorm,summon,mine,seekerMines,rapidMissile)은 자연 전투 및 독립 before/after 미확보다. source queue가 누락되면 화면을 꾸미기 위해 합성하지 않는다. 처음 관측한 wind timer를 전체로 쓰므로 렌더러가 wind 중간에 붙는 경우 정확한 전체 진행도는 보장하지 못한다.

## 공유 셰이더/머티리얼 계약

| 항목 | 코드값/계약 |
|---|---|
| 파일 | shaders/boss11_telegraph.gdshader + scripts/boss11_telegraph.gd |
| 공유 | static ShaderMaterial1개, renderer당 Polygon2D32개를 ready에서 선생성. 사용 슬롯을 초과하면 추가 생성 없이 생략하므로 대량 동시 hazard 스트레스는 미검증 |
| 진행 uniform | `instance uniform float progress`1개. 각 mark의 instance parameter를 갱신해 서로 다른 타이머가 공유 material을 덮지 않음. 틱 material/resource 생성0 |
| 도형 데이터 | vertex COLOR: R0=원/.4=도넛/.7=부채꼴/1=띠, G=도넛 내경비 또는 궤적 flag.5, B=도넛 half-gap radians 또는 sector spread/TAU. 별도 uniform 없음 |
| 좌표 | 로컬 정점 -1..1, mask 반경.98, 배치 scale=extent/.98. 텍스처/새 이미지 불필요 |
| 색 | bone RGB(1,.87,.65), 충전 전면·섬광 RGB(1,.97,.85), ink RGB(.055,.045,.035). 기존 blue/green 탄색 변경0 |
| 면 alpha | 기본.16 → 충전.38, 진행 전면 +.16, 섬광 +.3 |
| 경계 | derivative AA: max(fwidth(d),.0001); 먹색2.5~1.7 screen px, 밝은 경계4.5~3.5 screen px; 밝은 경계 alpha.95/먹색.94 |
| 진행 경계 | charge=반경비(띠는 길이비, 도넛은 띠 폭비). 진행 경계 smoothstep 폭±.012, 전면 범위.025 |
| 섬광 | progress>1에서 `max(0,1-(progress-1)/.12)`; clamp 상한1.12. 활성 상태1.12는 섬광0 |
| strike 후 시각 | 관측 bossSlam/Slash/Sweep→recover 때 이전 mark만.10초 보존, progress=1.001+(elapsed×1.19). 전투 타이머를 쓰거나 지연하지 않음 |
| fissure 궤적 | 위 원본에는 통과 띠의 접촉 피해가 없으므로 alpha×.38. 실제 위험 강조는 종착 원이다 |

## 카메라 규칙

| 항목 | 값/연결 |
|---|---|
| ARENA_ZOOM | .28. 기존 field .70에서 축소, 원래 zoom을 configure에서 보존 |
| TRANSITION_SECONDS | 1.0초, smoothstep `t²(3-2t)`; 재전환 때 현재 blend부터 이어감 |
| ARENA_CENTER_WEIGHT | .85. 실제 player 위치에서 arena center로 blend×.85만큼 화면 중심 이동 |
| 처리 | physics priority100, 기존 Camera2D 하나의 zoom/global_position만 작성. hit-fx의 shake offset writer 보존 |
| 진입/퇴장 | product_scene.activate_space → _frame_arrival → set_arena. 기존 별도 arrival camera 생성/긴 reveal은 이1초 전환으로 대체 |
| 클리어 | 기존 native_demo_boss_defeated(stage) 신호를 읽어 set_arena(false). 신호 발생·게이트·보스 HP·사망 판정 변경0 |
| 복귀 | 보존 zoom과 player follow로1초 복귀. 신규 카메라/게임 UI 개발 문구0 |
| 한계 | 1600×900에서 플레이어 약20px로 작음. slam의 하단은 고정 HUD에 가리며 fissure 끝은 외곽 mass와 겹침. .28은 후보 값이며 완성 카메라 인수 아님 |

## 캡처·테스트·성능

외부 산출물 `~/exoduser-wt/_out/BOSS11-02/`, captures에1600×900 및 무리사이즈1x640×600 crop(480,150), PNG56개. charge_0/50/95와 impact_flash 포함. 원본 before7종은 BOSS11-01의 **after** PNG를 동일 byte로 복사해391158e3 기준을 보존한다(옛 붉은 before를 새 기준으로 쓰지 않음). 추가5종 before는 기준 fixture에 예고 renderer가 없던 상태를 재현한 빈 예고 대조군이며 원래 존재했던 캡처가 아니다. after는 새 카메라와 새 도형을 함께 적용하므로 색만의 A/B 실험은 아니다. fixture는 source actor/HP/게이트를 구동하지 않는다. body는 동일 idle atlas 정지 표본이며 기존 HP widget에 fixture7500/10000을 표시한다. 프로젝트 UI에 개발 상태 문구를 넣지 않았다.

BC01~10 각1회 통과(354,093 assertions/실패0). 새 visual contract18검사 통과(원본 enemy/G 불변, 동시 mark material 공유, 각 timer, 도넛 source half-gap, camera1초 midpoint/끝/복귀 및 shake offset 보존). logs/tests.json에 원본 저장. 이 테스트는 실제 전투 판정·자연 게임 QA의 대체가 아니다. 원본 source-game은 이전 출력의 hash 고정 oracle만 읽었다.

**arena 명목 성능 단1회: INVALID. focus_lost_frames=1449, valid=false.** 원시 p95=8.628ms/p99=9.150ms/mean144.940fps/draw201/ticks612는 유효 성능 결과로 인수하거나8.383ms와 비교하지 않는다. provider product_space=field, arena view만 활성화한 명목 표본이다. 재시도0. 따라서 요청한 `focus_lost0` 및 이전8.383ms 대비 악화 없음은 **미입증**이다. 성능 후의 fissure alpha flag 교정은 별도 captures-only로 촬영했으며 새 성능 측정은 하지 않았다. PID81277 공존·종료0, 자체 Godot 동시1개 이하·마감0.

첫 import에서 tip 타입 추론 parse 오류를 명시 Vector2로 수정했다. 초기 이미지에서 textureless UV 미전달과 ink smoothstep 방향 오류를 발견해 local VERTEX 좌표/경계식을 교정했다. fissure 궤적 구분값이 vertex color 범위 밖이라 전송되지 않는 문제는 G=.5 flag로 고쳤다. 실패 로그는 보존하고 최종 PNG만 최신 검수본으로 교체했다. BC suite를 다시 실행해 숫자를 늘리지 않았다.

운영 예외: 최초 R cwd에서 HEAD/branch/INDEX/WORK를 읽기 조회했다. 사용자 지시의 모든 git 명령 worktree cwd 조건을 위반했으며, 이 조회로 R tracked/index 파일을 바꾸지는 않았다. fetch 및 이후 모든 Git/Godot 명령은 새 worktree cwd/set-e에서 실행했다. main은 조회만 하고 병합/push하지 않는다. 강제·reset/rebase·hook 비활성0.

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 boss telegraph/camera read-only candidate |
| MASTER | silhouette/regions/main route/side spaces 변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 변경0; 종착 가림은 남음 |
| LARGE | 기존 atlas/환경/공유 림 유지; composites/overlap/repetition 변경0 |
| MEDIUM | connections/holes 변경0 |
| GROUND | shadow/contamination/structure integration 변경0 |
| PLAYABLE | arenaR1700/travel/breathing/threat geometry 불변; 예고 면만 추가 |
| LANDMARK | primary/secondary/tertiary 변경0 |
| CAMERA QA | ARENA 표본만. START/EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미검수 |
| TECH QA | route/collision/seam 변경0·재검수0; 신규 구문/visual18·BC10suite PASS; loading 최초 오류 교정; 유효 performance 미확보 |
| FILES | 신규 telegraph shader/pool/reader/camera/capture/contract test 및 product_scene 초기화/전환부, 관련 docs만 |
| GIT | 경로지정 stage·정상 hook·비강제 자기 branch push. SHA/원격 검증/정리는 외부 DONE.txt |
| VISUAL VERDICT | RETOUCH — 제품 전23패턴 자연 검수·끝점 가림·작은 플레이어·유효 성능 표본 미해결 |
| NEXT PASS | PC owner의 실제 state/queue 출판과 연결 검수, 전23패턴 시간 연속 촬영, fissure/큰 파동 안전 공간·카메라 보완 및 별도 승인된 유효 성능 측정 |
