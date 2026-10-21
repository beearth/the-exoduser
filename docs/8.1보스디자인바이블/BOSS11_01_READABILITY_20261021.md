# BOSS11-01 — 새 1-1 아레나 위 보스 가독성 검수

기준 `cb154e8dea4717666026da5365bbd43172dd7b90` (`codex/demo11-integ4-20261021`). **VISUAL VERDICT: RETOUCH. 전체 요청 완료 아님.** 신규 이미지/제품 전투 코드/게이트/HP·피해·패링·최종 사망 변경0. PCI-11 및 앵글러 HP/final readback 대기를 유지한다.

## 검수 범위와 실제 산출물

`godot/tests/capture_boss11_01.gd`는 기존 Main 프리뷰 관례를 따르는 비제품 전용 fixture다. `Map11ProductScene.activate_space("arena")`로 화면만 전환한다. 제품 게이트 플래그·신호·보스 소유자 주입은 없다. 기존 보스 idle atlas의 첫414×620 셀을 직접 배치한다. 이동은 위치 변경, 피격은 tint 표본으로서 실제 이동 애니메이션·피격 이벤트 검증이 아니다. 발사체는 녹색/청색 대비용 도형이며 실제 탄 registry·패링 가능성 검증이 아니다. HP바는 DEMO11-42 실제 위젯에 fixture 값7500/10000·채움375px를 표시한다. 실제 HP readback 검증으로 세지 않는다.

시작 warmup 후 subtree 처리·카메라 보간을 멈추고 같은 구도로 before/after를 찍는다. `before`는 붉은 경고선의 비교 대조군이며 기존 제품 보스 렌더 캡처가 아니다. 현재 기준의 `native_demo11_boss_actor.gd`에는 본체 `_draw`/Sprite2D가 없고, projectile fallback은 raw.col 단색 원이다. 따라서 이 산출물을 완성된 실제 보스전으로 해석하면 안 된다.

| 산출물 | 계약 |
|---|---|
| 캡처 | `~/exoduser-wt/_out/BOSS11-01/captures/`; before/after 각각10뷰·원본1600×900 및1x크롭640×600(480,150), 총40PNG |
| 보드 | idle / movement / slam / tideWave / burrowStrike / lavaPools / chaseAoe / groundFissure / projectiles / hit |
| 격리 user dir | `EXODUSER-BOSS11-01-Isolated`; 실제 저장 폴더 사용0 |
| 변경 적용 위치 | `scripts/boss11_readability.gd` 상수 → 위 capture fixture만. 제품 call site0 |
| 링 감쇠 | 적용0. 비교 대조군부터 경고선 색/명도만으로 분리 가능한지 검토 |
| 공유 림 | 새 ShaderMaterial 생성0. `MAP11Detail.material_`를 본체에 공유, rim_color만 instance uniform |

## 수치 SSOT

아래 신규 시각 후보의 단일 정의는 `godot/scripts/boss11_readability.gd`다. 판정 범위·원본 시간·피해를 변경하지 않는다.

| 상수 | 값 | 용도 |
|---|---|---|
| WARNING | #f2d69a | 위험 경계의 옅은 황토색; 입력 대응/패링 분류를 의미하지 않음 |
| INK | #16191d | 경계의 어두운 분리선 |
| HALO / EDGE | 14 / 6 world px | 검은 외곽선/밝은 경계. zoom .60에서8.4/3.6 screen px |
| RIM | RGBA(.82,.77,.61,.48) | 기존 actor_rim 내부 실루엣 셰이더의 보스 fixture 인스턴스값 |
| ZOOM / CAMERA_Y | .60 / -90 | fixture 전용 구도; 제품 카메라 수정0 |
| SLAM_R / TIDE_R | arena_preview.SLAM_R=1320 / TIDE_R=1750 | 기존 phase4 slam / tide 범위 참조. 룸 R1700으로 잘라내지 않음 |
| FISSURE_LENGTH / FISSURE_BLAST | arena_preview의2304 / 691.2 | 기존 균열 길이/종착 범위. 실제 종착 경고는 현재 카메라 밖 |
| ERUPT_R / POOL_R / CHASE_R | 164 / 150 / 450 | source r44+120 / 독늪 / 추적폭발; fixture 범위 도형만 |

## 가독성 판정

| 항목 | before | after | 판정/한계 |
|---|---|---|---|
| 보스 실루엣 대 바닥 | 망토·가지 외곽이 어두운 바닥과 합쳐짐 | 공유 내부 림으로 가지·망토 경계 일부 분리 | RETOUCH — 정지 atlas만; 걷기·야수·잠행·공격 실루엣 미검증 |
| 붉은 링 대 경고선 | 같은 붉은 계열이라 환경으로 오독 가능 | 황토 경계+검은 외곽선이 붉은 균열과 분리 | 후보 개선. 제품 패턴마다 시간/방향/위험 내부 표현 미연결 |
| 큰 slam/tide | 경계 일부 화면 밖 | 대비 개선해도 전체 범위가 화면 밖 | RETOUCH — 시야 밖 위협의 예고/카메라 구성 미해결 |
| groundFissure | 종착점 화면 밖 | 색만 바꿔도 종착점은 화면 밖 | RETOUCH — 종착점/실제 진행 방향 카메라 검수 필요 |
| 발사체·패링 표시 | 녹색/청색 도형 분리 | 동일 표본 유지 | RETOUCH — 도형 대비만 확인. 실제 raw 탄·Q/E·magic 분류 증거0 |
| HP바 | 기존500px 레일/hell_title/값 | 동일 위젯·7500/10000·375px | 화면 구성 확인. 실제 HP와 hide/show/사망/부활 readback 미검증 |
| 플레이어·HUD 중첩 | 초기 캡처에서 HUD와 겹침 발견 | 최종 구도는 플레이어 위치와 카메라를 고정해 재촬영 | 제품 카메라/실제 근접 전투에서 재검수 필요 |

## 23패턴 누락을 완료로 세지 않는 표

| 수준 | move id |
|---|---|
| 범위 도형 후보 캡처만(실제 텔레그래프 실행 아님) | slam, tideWave, burrowStrike, lavaPools, chaseAoe, groundFissure |
| 실제 패턴별 렌더·예고·발사체·애니메이션 미검수 | slashCombo, sweep, charge, jump, burst, shock, fan, poisonTrail, spin, grab, multiDash, elemBall, beanStorm, summon, mine, seekerMines, rapidMissile |

보호된 Q/E·blackBean magic 계약은 변경하지 않는다. 파란색 도형을 추가했다는 이유로 패링 가능을 새로 선언하지 않는다. 후속은 보스 snapshot을 읽기만 하는 실제 본체/패턴 렌더러와 각 실제 탄의 원본 시각 계약을 먼저 연결하고, 23패턴 모두 실제 상태/시간으로 같은 fixture에서 촬영해야 한다. PC 게이트 대기를 우회할 필요는 없다.

## 검증과 한계

BC01~10 각1회, 합계354,093assertions/실패0으로 통과. 원본 source-game은 `c3cf8ce6:game.html`에서 읽어 외부 출력 폴더에 보존, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`를 기존 suite에서 확인했다. 테스트 출력은 외부 tests.json/각 suite 로그. 추가 기존 demo11 boss actor fixture는 actual_spawn 거부 뒤 hp Dictionary 접근 오류로 멈춰 종료했다. 실패를 PASS로 합산하지 않는다. phase_readback/projectiles 추가 suite는 실행하지 않았다. 코어·기존 suite 수정0.

arena 명목 표본1회: p95 **8.383ms**, p99 **9.164ms**, focus_lost0, 611physics ticks, draw149, 평균158.255fps. 8.33ms 목표 초과. PID81277 공존·종료0. 표본의 provider product_space는 field이며 직접 arena view만 활성화한 명목 렌더 표본이다. 정당한 보스 입장·실제 전투·최종 캡처와 같은 고정 카메라 성능 증거가 아니다. 성능 재시도0. 캡처 구도 보정은 별도 captures-only 실행으로 성능을 재측정하지 않았다.

운영 오류: 추가 actor suite가 오류로 남아 있던 중 captures-only 프로세스를 시작해 잠시 자체 Godot2개가 겹쳤다. 새 캡처와 오류 suite의 자체 PID만 종료하고, 자체 Godot0 확인 후 최종 캡처1개로 다시 실행했다. 해당 겹침 중 캡처는 최종 세트로 쓰지 않았으며 앞서 완료한 성능 표본과는 겹치지 않았다. R에서 초기 Git 조회/fetch를 실행한 것은 읽기 전용 지시 위반이며 파일·index 변경0; 이후 명령은 worktree cwd에서 수행했다.

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 arena boss composition fixture |
| MASTER | silhouette/regions/main route/side spaces 기존 유지 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 변경0, major holes 재심사 미실시 |
| LARGE | 기존 atlas·아레나 재사용; composites/overlap/repetition 변경0 |
| MEDIUM | connections 변경0; remaining holes 재심사0 |
| GROUND | shadow/contamination/structure integration 변경0; 링 감쇠0 |
| PLAYABLE | R1700 유지, travel/breathing/threat geometry 변경0; 가독성 후보만 검수 |
| LANDMARK | primary/secondary/tertiary 기존 유지 |
| CAMERA QA | ARENA만; START/EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미실시 |
| TECH QA | route/collision/seam 변경0·재검수0; GPU capture 생성; 성능 목표초과; 실제 전투 미검수 |
| FILES | 신규 상수/격리 fixture/본문만; 공용 제품 수정0 |
| GIT | 자기 branch에 경로지정 stage·정상 hook·비강제 push; main merge/push·배포0 |
| VISUAL VERDICT | RETOUCH |
| NEXT PASS | 실제 읽기 전용 본체/23패턴 renderer·실제 탄/패링 색·카메라 밖 경고·HP readback 검수 |
