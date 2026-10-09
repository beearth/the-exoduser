# CH1 보스 착지·탄막 전조 — source23 현행 계약

기존 점프 착지 경고30~60px는 즉시 피해 반경300px보다 작고, fan 전조108도는 실제 탄 확산126~169.2도보다 좁았다. 실제 draw 소비자의 양판3접점만 교정한다. 기존 코드 복구점 `533b5843d93e8b501bd8c089b3123ba80be41e88`에서 원본·관련 docs 백업 후 적용했으며, 공용 AI producer·자원·보상·필드 사망복귀·저장 코드는 그대로다.

| ID / 적용 위치 | 현재값 / 공식 | 보존·한계 |
|---|---|---|
| jump 바닥 경계 | `X.arc(e.jumpX,e.jumpY,300,0,2π)` fill/stroke 둘 다, 비행 전구간 고정300px | 기존 중심·색·알파·그림자·점프높이 save/translate 불변. 타이머40f, 착지 후 bossShock25f 유지 |
| 착지 즉시 피해 | `dst(P.x,P.y,e.x,e.y)<300`, iframes≤0·s≠charge, `floor(atk×1.8×elMul)` | 피해 producer 수정0. 넉백15와 후속 shockMax=`800+stage×50`도 유지. 표시 경계300 자체는 strict `<300`의 외곽선 |
| 충돌 중심 | 정상 canMv 허용 시 착지 e.x/y=jumpX/Y | canMv 거부 시 마지막 유효 위치에 착지할 수 있어 목표 경고와 실제 중심의 기존 괴리는 별도 미완. 위치 문제 해결로 확대하지 않음 |
| fan 전조 폭 | `fw=π×(.7+e._bossPhase×.06)` | 실제 `fanW` 발사식과 동일. 중심 facing, 최초/최종 탄은 facing±fanW/2 |
| fan 표시 길이 | `fanR=120+stage×3` | 근거리 방향/확산 표식. life400 투사체의 전체 사거리를 표시하지 않음 |
| fan 발사 수 | `floor(max(10,4+min(stage,5))×(1+(phase−1)×.12))` | stage0에서는 phase0~4 각각8/10/11/12/13발. 이전 문서의 ‘최소10’은 phase0 보정 누락이므로 정정. 코드 탄 수 변경0 |
| phase0~4 전조 폭 | 126 / 136.8 / 147.6 / 158.4 / 169.2도 | 원래108도와 구분. 스폰 시 초기화되는 _bossPhase를 실제 producer와 동일하게 참조 |
| fan 오브 | 기존5개·각도 `facing−fw/2+fw×i/4` | 오브 위치 거리15+p×20·크기3+p×3, fill/stroke alpha 및 sa복원 불변 |
| scope | game.html / game-easy-test.html 각각3치환, +11B | 실제 caller의 alive/on-screen·구울/slime 제외 및 eLite=false 경로 확인. 같은 공용 상태의 다른 보스도 표시를 동일 실제식에 맞춤; 다른 상태 경로 불변 |
| source pin | game.html: 4033706B / SHA256 82e87076d5c4e0045380d2a68b2a7305931b4b9f551151d75dd018f47179a468<br>game-easy-test.html: 3911375B / SHA256 fd01916afa9c2b9d1178cd3c4543d6ce39a23879485f54b42f03106c8410b110 | 역변환 source22 byte-exact, producer·타이밍·RNG·패링·좌표 불변 |

## 검수와 팀 후보의 차이

ANIMVFX0247 실제 완료 UUID `76c91e7a-f06e-4ae3-af78-521c3dc2efb5`, UTC2026-10-03T02:50:39.086 원문을 직접 읽어 소유 draw 접점을 확인했다. 해당 jump `300*p` 후보는 비행 초반 위험 범위를 축소하며, 착지 tick에서 update가 bossShock로 바뀌면 draw의 p=1을 보장할 수 없다. 따라서 원총괄 후보는 전체 비행에 반경300을 고정한다. 원팀 원자료는 변경하지 않는다.

| 근거 | 실제 결과 / 검증 범위 |
|---|---|
| 신규 test/bossLandingFanTelegraph.test.cjs | 현재 코드의 실제 draw 블록·실제 bossJump/fan update 분기를 VM에서 실행. source22 원본4 PASS/4 FAIL → production8 PASS |
| 후보 대조 | 원팀300×진행도 변형6 PASS/2 FAIL: 시작/중간/마지막 비행 모두 위험경계를 미리 알리는 계약을 만족하지 못함 |
| jump 실제 분기 | st2=40/39/20/1에서250px 플레이어가 경고 안에 포함; 착지 분기를 실행하면180 피해.299px 피해/300·301px 제외, 무적/charge 제외 확인 |
| fan 실제 분기 | phase0~4에서 renderer 각 경계가 최초/최종 실제 spawn 탄의 atan2와 일치, 탄 수·life400·recover45 보존. 다른 상태에 두 경고 호출0 |
| 통합 검사 | 신규8+기존 laser1+CH1배정/감옥예약2+inline구문1=12 PASS. 양판 합산 JS12(모듈4 포함)·importmapJSON2 구문 확인 |
| 대역·미검수 | Canvas 호출·SFX·canMv·피해 기록은 대역. 실제 GPU 픽셀·CH1 자연 플레이·프레임 성능·청취 미완. 모듈을 classic vm.Script로 파싱한 최초 보조검사는 도구 분류 오류였고 module-aware node --check로 교정; 게임 결함으로 계산0 |
| 패키지 경계 | source23 앱3398의 포장·타이틀·HTTP 확인. source22/3397 앱은 당시 코드 보존. 동일 후보 native 전체 흐름은 미완 |

## MAP PRODUCTION REPORT — 전투 표시만

| §23 항목 | 이번 작업 결과 |
|---|---|
| STAGE | CH1-1/si0 자연 moveset3의 jump/fan 포함 공용 draw |
| MASTER | silhouette/regions/main route/side spaces 변경0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경0 |
| LARGE | source assets/composites/overlap/repeated silhouette 변경0 |
| MEDIUM | connections/remaining holes 변경0 |
| GROUND | shadow/contamination/structure integration 변경0 |
| PLAYABLE | arenas/travel/breathing/threat 공간 및 충돌 불변. 전투 경고 크기/각도를 실제 피해·발사식에 정렬 |
| LANDMARK | primary/secondary/tertiary 변경0 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 실제 화면 전수검수 미실시; 카메라 변경0 |
| TECH QA | 위 실제 source 분기·구문 검사. route/collision/pageerror/404/seam/loading/performance 실제 전수검수 미실시 |
| FILES | 양판 코드2·신규 검사1·관련 docs11=14 own scope. manager STATE/LOG4·보호67·타팀 원자료 변경0 |
| GIT | 원총괄 own14 코드+docs checkpoint/push 및 원격 정확SHA 영수증으로 확인. 배포0 |
| VISUAL VERDICT | RETOUCH — 기존 전체 CH1 환경 판정 유지. 이번 패치 실제 화면은 미검수이며 테스트로 visual PASS 승격0 |
| NEXT PASS | source23 별도 패키지와 동일 후보 정상 CH1 시작→전투/획득/장착→4지역/보스문→보스 사망/부활→재도전. 경고 대비·벽막힘 중심·실제청취/성능 검수 |


### 2026-10-10 보스 점프 착지의 선택 임팩트24

bossJump 착지의 기본 피16만 이미지 ready 시 기존 중성 지면24로 단일 교체한다(겹침0·미준비16 폴백). 중앙150²/speed2/angle0/defaultalpha1이며 원 `_partCnt<=300`·angle RNG·흰 링/flash·음향·경고/판정300·후속 충격파를 보존한다. [현재 정본](BOSS_JUMP_IMPACT24_ENGINE_20261010.md). 실제150px/정상줌 전투·동시성능은 미검수, VISUAL RETOUCH/UI_NOT_ASSESSED.
