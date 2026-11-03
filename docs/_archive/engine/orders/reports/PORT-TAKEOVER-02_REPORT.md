# PORT-TAKEOVER-02 — G 몬스터 이동음 실제 큐 연결

2026-10-24 KST. 사용자 지시 "이식작업 여기서 계속하자"로 기존 인수 브랜치에서 재개했다. 기준 HEAD `915d29615d8672cc750c685bd4fec288721099dd`, fetch 후 `origin/main=fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3`. 공용 PC main/INDEX/WORK, 원 PC WIP 및 다른 팀 작업은 수정하지 않았다. 이 브랜치는 main 병합본이 아니다.

## 원인과 구현 범위

G kernel은 이동음 key/볼륨/피치를 계산했으나 G service의 `play_sample`은 `playSample_monster_move_asset_missing`만 기록했다. Main에 7개 원본 MP3를 등록하고 `request_native_enemy_move_sample`로 이미 사용하는 SND03/SND07 소비자에 전달한다. 새 재생기·버스·피해/패링/저장 writer를 만들지 않는다. 인수된 실제 G service·현재 stage·캐릭터·옵션·원본 음원 준비를 확인하며 같은 key의 정상 30ms 거절은 미이식 오류로 세지 않는다.

원본 게임은 `godot/source_snapshot/game.html`, SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`. 원본 수치 변경 없이 빠진 `playSample` 호출을 연결했으므로 이 호출 내부의 공유 난수 1회도 실제 소비한다. 이미 계산한 `_r(1,.15)` 피치를 다시 추첨하지 않는다. 전체 웹↔native RNG·청감 일치 인수는 아니다.

| 항목 | 고정 원본 / 실제 구현 |
|---|---|
| 키 매핑 | G10227–10236, G32082–32098; 아래 7키 |
| 감지/상태 | G38669–38677: `d<1000`, stunned/frozen 제외, 원본 적 루프당 최대 3요청 |
| 볼륨 | `max(.03,.35*(1-d/1000))`; G kernel의 이미 계산한 값을 그대로 큐에 전달 |
| 위치 | 원본 호출은 `playSample`이며 `playSampleAt`이 아니다. `_at`로 추가 거리 감쇠/팬을 계산하지 않음 |
| CD | `60+floor(random*60)` = 60~119 source ticks; 양수일 때 `sp` 감소 |
| 피치/난수 | `_r(1,.15)` 뒤 G12367 `0.92+random*.16` 추가 곱; 서로 다른 난수 2회 |
| 큐 | m_* 비우선순위, 같은 키 30ms 억제, 데스크톱 프레임당 처리 6개 |
| 실제 노드 | m_*는 PROJ 우선순위1; 기존 backend 동시 저우선순위 한도5. 따라서 7키를 같은 프레임에 넣으면 큐 처리6/실제 시작5 |
| 믹스/종료 | 기존 OPT sfx gain·버스·pause/source-loss 정리·캐릭터 세대 필터 재사용 |
| 파일 | `godot/assets/sfx/monster_move/`; 7×33,062 = 231,434 bytes. 각 source/destination 전 파일 SHA256 동일 |

| key | 원본 `sfx/monster/` 및 Godot basename | G etype |
|---|---|---|
| m_melee | melee_walk.mp3 | 20,47 |
| m_archer | archer_walk.mp3 | 21 |
| m_swarm | swarm_move.mp3 | 3,13,14 |
| m_tank | tank_step.mp3 | 일반29 |
| m_caster | caster_move.mp3 | 7 |
| m_splitter | splitter_walk.mp3 | 16 |
| m_mother | mother_walk.mp3 | 17 |

## 검수 근거와 실패 보존

증거는 `I:/EXODUSER-Storage/qa/port-resume-20261024/`에만 저장한다. 수정 전 Main/G service/테스트 사본과 SHA256, `movement-assets.json`, 실행별 stdout/stderr/receipt, `verification.json`을 보존한다. 매 실행 별도 APPDATA/namespace를 썼으며 제품 사용자 슬롯을 열지 않는다. 테스트는 순차 실행한다.

| 검사 | 결과 / 경계 |
|---|---|
| 변경 전 47h 입력 하니스 | 18단계 중 PASS13/NOT_READY5, SCRIPT ERROR0. 신규 게임·생성·인트로·필드·처치·줍기·장착·물약·성장·부활·save handoff의 명시 검사. 자연 수동 종주 아님; 물약·부활은 배치 보조 사용 |
| 변경 전 보스 이후 | gate/최종사망/clear/end/lobby가 NOT_READY. 240초 runner timeout 뒤 종료 복구에서 EXDEV가 발생해 exit0 아님. 원 override를 I:에 복사·SHA256 대조한 뒤 자기 파일만 지웠다. runner를 cross-drive copy/verify/unlink와 긴 E2E 한도로 수정 |
| 첫 이동음 검사 | 테스트 추가 후 tab/space parse 오류1을 먼저 수정; 정식 RED는 64검사/1실패, ERROR0 — `G movement sample bridge exists` |
| 연결 후 첫 검사 | 8실패, ERROR0. 실제 Main 직접 부팅 fixture에 캐릭터 선택이 없어서 guard가 정상 거절. diagnostics 후 9실패; 테스트가 item0 placeholder를 선택한 실행도 9실패. 실제 기존 picker item1/선택 callback으로 수정; 제품 guard 완화0 |
| 한도 검사 | 106검사/1실패, ERROR0. 큐6개와 PROJ 노드5개를 같은 한도로 기대한 테스트 오류. 원본 policy/node_admission 대조 후 두 assertion으로 분리 |
| 최종 집중 검사 | 107검사/0실패, exit0/SCRIPT ERROR0/ERROR0, Dummy. 7원본 decode/큐·난수1회·중복/paused/foreign caller 거절·실제 AudioStreamPlayer 5개 재생 상태 확인. 청감 미검수 |
| 첫 전체 G 회귀 | 191검사/1실패, ERROR0. 자식3을 World step 종료 뒤 처음 관측했을 때 HP296/mhp437. 같은 step의 후속 피해 뒤 값을 탄생값으로 검사한 기존 하니스 관측 시점 문제. World는 configure 후 `add_child`하며 원본 반감은 등록 전에 적용됨을 추적했다. `child_entered_tree`에서 같은 alive/원소/HP=mhp/양쉴드0 assertion을 수행하도록 시점을 옮겼다. 제품 HP/피해/생성 코드 변경0, 최초 실패 로그 보존 |
| G 관측 시점 수정 후 | 190검사/0실패, exit0/ERROR0. 실제 출생 수에 따라 검사 수가 변한다. 같은 탄생 assertion 유지 |
| 기존 sound40 첫 회귀 | 44검사/1실패, ERROR0. 기존 AUDIO-01 `aa8e4c604`는 그래프 종착점을 SFX로 바꿨으나 테스트가 Master 직결을 기대. 사운드 SSOT의 SFX→Master 계약과 해당 커밋 diff를 대조해 기대 경로를 SFX로 맞추고 SFX→Master assertion을 추가했다. 제품 믹스/graph 변경0 |
| 직접 회귀 / 변경 후 47h | 외부 `verification.json`, 아래 최종 기록 참조 |

직접 회귀 최종: G runtime190/0, sound40 45/0, player_shield166/0(oracle840필드), combat_kill47/0. 네 실행 모두 exit0/SCRIPT ERROR0/ERROR0. 집중 이동음107/0도 별개다. 첫 audio mode 시도는 `--headless` 때문에 실제 driver가 Dummy였으므로 WASAPI 청감 성공으로 보고하지 않는다.

변경 후 47h는 전체18행을 기록하고 exit0/SCRIPT ERROR0/ERROR0으로 종료했으나 **overall=NOT_READY, PASS11/NOT_READY7, continuous_E2E=false**다. 자연 처치·줍기·장착·자동 물약·부활·save handoff의 명시 검사는 통과했다. 물약 단계의 관측 HP484.76/max493 이후 실제 전투 중 HP0/fallen이 되어 lv1/AP0/SP0으로 남았고 성장 투자도 NOT_READY다. 보스 진입/최종 사망/clear/end/lobby는 계속 NOT_READY다. 변경 전13/5와 결과가 같다고 주장하지 않는다. 공유 난수 소비가 복구된 비고정 자연 입력 실행이며, 장비/최대HP부터 이전669와 다르다. 랜덤 실행 차이와 게임 회귀의 전체 분리는 미검증이다. HP/XP/보스 gate를 주입하거나 성공할 때까지 반복하지 않는다.

최종 출력 경로 검사에서는 `--display-driver headless --audio-driver WASAPI`로 창 없이 실행하여 **실제 driver=WASAPI, 107/0, 재생 노드5, exit0/SCRIPT ERROR0/ERROR0**을 확인했다(`test_pc_enemy_actors_runtime-2026-10-24T00-06-08-916Z/receipt.json`). 파형 캡처·사람의 청감·웹 동일 음향 판정은 하지 않았다.

Camera2D physics interpolation warning은 기존 경고이며 ERROR0과 구분한다. 실패 로그를 지우거나 성공으로 바꾸지 않는다.

## 문서 동기화·남은 범위

코드 변경 후 docs 전체에서 `playSample_monster_move`, `request_native_enemy_move_sample`, `monster_move`, `mSfxCd`, 이동음 키/거리/CD를 검색했다. 사운드 master의 과거 .4/50~100, 몬스터 사운드 문서의 과거 거리400/.25를 고정 원본 .35/1000/60~119 식으로 정정했다. 현재 후보 상태는 WORK_BOARD·PORT_STATUS·HUD_SOUND context와 CHANGELOG에 연결한다. 오래된 source trace·과거 결과는 당시 snapshot으로 보존한다.

남은 미이식은 G의 charge/groggy/magic 절차음, `_addBlastLight`, `hitStop_42825`, 전체 정예/modifier/HOLD 경계, 웹 1x 시각·청감 비교 및 자연 보스→clear→로비다. Q/E 판정·피해식·맵·세이브 형식·2_3 문서 변경0. 맵 제작/카메라 QA를 수행하지 않아 새 visual PASS 판정은 없다. 기존 후보 VISUAL RETOUCH를 유지한다.

최종 SHA·원격 확인·잔여 WIP는 외부 DONE.json에 기록한다. main 통합/PC·Mac 전체 동기화/패키지/Steam 배포 완료가 아니다.

첫 커밋은 `tools` Junction을 Node가 I: 실체 경로로 해석하여 `guard.js`가 I:의 비실행 루트에서 game.html을 찾는 문제로 중단됐다. 설치된 Node의 `--preserve-symlinks-main`을 확인하고 해당 명령의 NODE_OPTIONS에만 추가해 E: 현재 게임을 대상으로 원래 6개 guard 검사 PASS, docs-sync-check --staged 통과를 확인했다. Git hook/config/검사 판정 변경이나 비활성화는 없다. 명령 뒤 환경값을 복원하며 자동 생성 guard.baseline.json은 기존 WIP와 함께 미스테이징으로 유지한다.
