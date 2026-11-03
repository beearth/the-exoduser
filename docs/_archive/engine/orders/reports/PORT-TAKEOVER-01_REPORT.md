# PORT-TAKEOVER-01 — 중단된 PC 적 이식 인수

2026-10-23 KST. 사용자 직접 인수 지시에 따라 기존 PC Claude의 적 9종(+일반 소환굴 etype29) WIP를 최신 Mac 코드 위에 연결한다. 이 문서의 기술 검사 통과는 전체 이식·자연 생성·웹 시각 동일성 완료를 뜻하지 않는다.

| 항목 | 값 |
|---|---|
| 기준 코드 | `9734e2e793f66f696fab34815859f5082388748e`, `origin/codex/g04-02-20261023` |
| 원격 main 관측 | `fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3`; 공용 PC HEAD는 `5659d14d38b8068518cb5866a336bf930a1abbce`. fetch만 수행, 공용 main/INDEX/WORK 무수정 |
| PC 원 WIP | `G:/exoduser-wt/pc-boss-parity`, `claude/pc-enemy-actors-20261023`, HEAD `df828f88d` 계열. 14파일을 외부 `inherited-original/`에 byte 사본·SHA256 manifest·full-index patch로 보존 |
| 작업 폴더 | `E:/exoduser-wt/codex-port-takeover-20261023`, `codex/port-takeover-20261023` |
| 원본 게임 | `godot/source_snapshot/game.html`, SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209` |
| 원본 추적 | `ctx/` 15종·최신 17c/17d·ENEMY-VIS-01·SWEEP-B3·E2E-TAIL-02·G04-02 및 이전 PC 세션 마지막 인계. ctx의 오래된 현황은 최신 코드로 재확인 |
| 결합 방식 | 원 7파일의 명시 diff만 `git apply --3way`, 충돌0. 신규 제품4·전용 테스트2·원본 VM 오라클1은 원 byte 복사. 원 작업 폴더·사용자 세이브·기존 실행창 무수정 |
| 실행 격리 | Godot 4.7.2, 매 실행 별도 APPDATA와 override namespace. import도 별도 APPDATA. 제품 사용자 폴더 사용0, 기존 .godot 복사0, 자동 서버 재시작0 |
| 증거 폴더 | `E:/exoduser-wt/_out/port-takeover-20261023/`, 실행별 stdout/stderr/receipt 및 원 WIP manifest |

## 이식된 부분 계약

| etype | 원본 행동 / 주요 분기 | 인수 범위 |
|---|---|---|
| 3 | 현자7의 소환 자식·일반 이동/탄 | 일반 non-boss elite0, 원문 생성·AI·기존 피해/등록 owner |
| 7 | G38963 부근 / G40779–40798, 거리100 미만 텔레포트 전조·요마3 소환 | 일반 생성·텔레포트·소환 자식, 원본 RNG 순서 |
| 13 | G38992, 거미줄 투사체 | 일반 생성·탄·거미줄 접촉의 기존 플레이어 writer 연결 |
| 14 | G39001, 급강하 | 일반 생성·상태 tick·기존 hurtP/패링 owner |
| 16 | G39018, 덫 설치 | 일반 생성·덫 raw/수명·감속 |
| 17 | G39032, 모체·거미13 소환 | 부모 Marker 출처 유지·자식 원본 mkEn |
| 20 | G39059, 빈 근접 분기 | 원본 공통 이동만. 새 근접·투사체 공격을 추가하지 않음 |
| 21 | G39063, 기본 원거리 빙궁수 | 일반 생성·기본 원거리 탄 |
| 47 | G39409–39431, 분신·텔레포트 | 반환된40 분신을 ens에 push하지 않는 원문 유지. 텔레포트 조건 `60<d<1200`, 전조120틱 |
| 29 | G39126, 일반 소환굴 빙마 / G42819 사망탄 | 문지기29 생성자와 분리. 일반 원본 수치, 기존 PCI09에서 G 사망탄8발·전조60틱 인계 |

| 공통 항목 | 원본 계약 / 코드 |
|---|---|
| 자연 입력 | 소환굴이 이미 선택한 etype·elite·mods·speed_u·radius_u·literal·spawn_n을 소비. 재추첨/다른 종 대체0. elite>0/mods[] 외는 `elite_modifier_owner_required` HOLD |
| 기본 수치 검증 | Lv1 HP875 / ATK31, 원소 undefined(-1) 유지. radius=`(ETYPE_R+radius_u*2)*2`, speed=`(max(.2,raw*1.3)+.04)*1.5`; 되살아난 직후 무적15틱. 원본 값 변경0 |
| 시간 권위 | World `advance_native_phase`, 별도 actor 물리 tick 없음. 서비스의 경고·hazard는 같은 원본 프레임만 처리 |
| 거미줄 | G35086 `_webSlow=90` 대입. G33007~33024 idle tick에서 감소, 양수이면 이동×.5 |
| 덫 | G34701 `_trapSlowT=~~(120*(1-min(.5,slowRes)))` 대입. idle 감소·×.5, 빙결과 중복 곱하지 않음 |
| 재시작 | G63458 기존 생명주기 commit에서 web/trap slow0. 저장 payload 필드 추가0 |
| 보호 | Q/E의 블랙빈 분류·판정·비용, 기존 HP/poise/피해식과 저장 형식·맵 배치 변경0. 2_3 문서 무수정. 공격 동시 제한 추가0 |

## 검수와 실제로 고친 시험 조건

이전 원 로그 `runtime_fix3.log`는 Main/World가 null인 채 fixture install을 호출한 SCRIPT ERROR와 timeout이다. storage-on 부팅은 `EXODUSER-demo11-` 접두사를 요구하는데 원 runtime namespace는 `EXODUSER-pc-enemy-actors-...`이다. 이번 독립 런에서는 기존 PC 단위검사 계약인 `--demo11-storage=off`를 명시하여 부팅을 통과했다. namespace 검사를 지우거나 제품 저장 거절 gate를 풀지 않았다.

첫 완료된 runtime은 141검사/1실패, ERROR0. etype47 시험 배치260px에서는 원본 거리 gate에 도달하기 전에 플레이어 가까이 접근하여 teleport를 관측하지 못했다. 원문 조건은 그대로 두고 시험 Marker 반경만600px로 변경했다. 초기 거리·원본 CD·최소 거리/CD를 관측값으로 보존하고 기존 teleport 전조/완료 assertion은 유지했다. 같은 제품 코드로 후속 1회 141검사/0실패, ERROR0. 자식 생성 수의 원본 RNG 차이로 검사 수는 동적이며, 검사 수를 올리려고 게임 상태를 바꾸지 않았다.

| 실행 | 결과 | 한계 |
|---|---|---|
| clean import, 기준 최신 코드 | exit0, SCRIPT ERROR0/ERROR0 | Windows fresh source import만 검수 |
| 기준 `pc_player_shield` | 166/0, 원본 oracle840필드 비교, ERROR0 | 헤드리스 단위검사. Camera2D interpolation warning1 |
| `pc_enemy_actors_kernel` | 86case·59,700tick·2,775,483검사/0실패, ERROR0 | 원본 VM과 같은 fixture env, 실제 전투·시각·청감 인수 아님 |
| `pc_enemy_actors_runtime` 첫 실행 | 141/1, ERROR0 | 위 47 fixture 거리 미충족 |
| 거리 조건 수정 후 runtime | 141/0, ERROR0 | 실제 Main/World/기존 PC owner에 시험 Marker·직접 tick·피해 주입 사용. 자연 플레이 증거 아님 |

## 창 모드 관찰·시험 원인 수정

현재 모니터를 다시 조회하여 오른쪽 보조 화면(Windows X5120/Y0, Godot `--position 7040,0`)에서 1920×1080 창으로 실행했다. always_on_top/no_focus=false. 외부 화면 캡처 대신 viewport texture 2장을 저장했고 창은 각 시험 종료 때 함께 닫혔다.

| 실행 | 결과 / 원인 | 보존·변경 |
|---|---|---|
| 첫 GUI, `06-37-01-837Z` | 141/1·ERROR0, 7 teleport 미관측. `enemy_isolated_tick221.png`에 대상 플레이어 HP0 | 원실패/이미지 보존. 수천 tick AI 관찰 fixture에 생존 무적100000틱만 명시, 제품 피해식·확률·판정 변경0 |
| 생존 fixture 후 GUI, `06-39-18-308Z` | 147/6·ERROR0. 7 소환 자식의 '탄생 시 HP/쉴드'를 첫 cohort 강제 처치 이후까지 살아남은 Node 목록에서 다시 검사 | 후반 상태를 탄생값으로 가정한 시험 오류. G40793의 원본 계약을 생성 직후 첫 World birth 관측으로 옮김. alive·원소·HP/mhp·shield와 shield_max=0 검사는 그대로, 모든 자식 birth 관측을 추가 |
| 최종 GUI, `06-42-54-028Z` | **148/0, SCRIPT ERROR0/ERROR0**, Camera2D warning1. target 생존·7/47 TP 전조/완료·7 소환3·17 소환13·29 사망탄8발·등록/clock·처치 보상 검사 통과 | 동일 제품 코드. 실제 Main/World 위 시험 Marker·수동 tick·직접 피해 주입이며 자연 입력 플레이 아님 |

최종 PNG는 위 증거 폴더의 `test_pc_enemy_actors_runtime-2026-10-23T06-42-54-028Z/{enemy_cohort_tick181,enemy_isolated_tick221}.png`. 스프라이트·탄·장식의 렌더 존재만 관찰했다. 개체가 겹쳐 있고 웹 같은 장면 1x 상대 캡처가 없으므로 **VISUAL VERDICT: RETOUCH**. SFX 검수는 Dummy 오디오 실행으로 불가능하다. 반복 성공으로 실패를 덮지 않고 원인별 첫 실패/후속 실행을 모두 보존한다.

회귀 첫 boss_parity는 `--artifacts-dir` runner 인수 누락으로 `B02_oracle_inputs` 1실패/ERROR0. 제품을 바꾸지 않고 이미 생성한 실행 폴더를 해당 인수로 전달하도록 runner를 고쳤다.

| 최종 직접 회귀 | 결과 | 실행 경계 |
|---|---|---|
| player_shield | 166/0, 원본 oracle840필드 비교 | 기준 후보1회, G 결합 후1회. 새 결합의 쉴드/Player 회귀 확인 |
| boss_parity | 44/0 | runner 인수 누락 실패1회 뒤 인수 수정 후1회. 앵글러→보스/처치/출구는 테스트에 명시된 fixture를 사용 |
| combat_kill | 47/0 | 1회, 원 테스트 결과 `damage_or_death_injected=false`, fallback=false. source/harness가 정의한 좁은 첫 전투 범위 |
| growth_ui | 36/0 | 1회, 창 비교·저장IO 미포함 기능 검사 |

위 최종4종 모두 exit0/SCRIPT ERROR0/ERROR0. 각 Camera2D physics interpolation warning1은 남아 있으며 ERROR0과 구분한다. 전체 E2E는 이번 작업에서 실행하지 않았다. 이전 Mac 11PASS/7NOT_READY 등의 값을 이번 PC 실행으로 재사용하지 않는다.

## 소유 파일·문서 동기화

제품 신규4: `native_demo11_etype_g_{actor,decor,kernel,spawn}.gd`. 공용 접점은 보존 WIP의 명시 7구역만 결합했다: `enemy_factory.gd`, `main.gd`, `native_demo11_etype_e_spawn.gd`, `native_demo11_pcib_death_effects.gd`, `native_natural_enemy_base.gd`, `native_stage_spawn_adapter.gd`, `player.gd`. 테스트 신규2·원본 VM 오라클1은 `test_pc_enemy_actors_{kernel,runtime}.gd`, `pc_enemy_actors_source_oracle.cjs`다.

코드 결합 후 docs 전체에서 `PC-ENEMY-ACTORS`, G 계열/etype, `webSlow`, `trapSlowT`를 검색했다. 웹 설계 수치는 변경0이며, 현행 후보 상태는 이 보고서·WORK_BOARD·PORT_STATUS·마스터·CHANGELOG·ctx README/ENEMY_AI에 기록한다. 기존 lifecycle 문서의 'web/trap 대응 필드 없음'을 후보 구현/초기화로 정정했다. 당시 원본·구현 snapshot이나 과거 보고서의 수치는 이력으로 유지한다. `2_3` 수정0.

### MAP PRODUCTION REPORT

| 항목 | 범위·판정 |
|---|---|
| STAGE | MAP11 시작 구역의 적 fixture 관찰만, 맵 제작/geometry/충돌 변경0 |
| MASTER | 기존 silhouette/regions/main route/side spaces 보존, 전범위 재검수 없음 |
| OUTER MASS | 시작 LEFT/RIGHT/SOUTH의 생체 외곽 유지 관찰, TOP/major holes 미검수 |
| LARGE | 기존 source assets/composites/overlap 유지, 전범위 반복 silhouette 미검수 |
| MEDIUM | connection/remaining holes 변경0·전범위 미검수 |
| GROUND | 기존 shadow/contamination/structure integration 유지, 전범위 미검수 |
| PLAYABLE | 적 fixture 렌더·탄 존재 확인, 자연 arena/travel/breathing/threat 동선 및 전투 가독성 전체 미검수 |
| LANDMARK | primary/secondary/tertiary 변경0·미검수 |
| CAMERA QA | START 1920×1080 엔진 캡처2장, EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 미검수 |
| TECH QA | 시작 맵 로딩·새 actor parse ERROR0. route/collision/seam 전범위·성능 측정 미수행; pageerror/404 웹 해당 없음 |
| FILES | stage-owned 맵 변경0, concurrent/unrelated 변경0, own G scripts/전용시험/관련docs만 |
| GIT | 자기 브랜치 검수 후보만. main/Steam/deploy0, 최종 SHA는 외부 DONE.json |
| VISUAL VERDICT | **RETOUCH** — 기술 검수와 다른 단계, 전체 맵/웹 동일성 인수 아님 |
| NEXT PASS | 자연 소환굴 입력·살아 있는 군집 전투·웹 동일 장면1x·청감·남은 명시 unported |

## 남은 범위

- elite/modifier 및 기존 B/F/D/HOLD, 전체 소환굴 자연 순회, 모든 스킨·원소·실제 자연 사망/부활은 전체 완료가 아니다.
- 서비스 snapshot의 `unported`: 이동 샘플 사운드, charge/groggy/magic SFX, `_addBlastLight`, `hitStop_42825`. 횟수/문자열을 원 결과 그대로 보존한다. 무음·연출 생략을 완료로 보고하지 않는다.
- 거미줄/덫·텔레포트/고유 장식은 웹과 같은 장면 1x 대조·청감 검수가 남는다. 런타임 통과를 시각 PASS로 바꾸지 않는다.
- 최신 main의 새 Skill Forge 구슬 작업은 이 고정 native 후보에 자동 반영된 것이 아니다.
- 전체 연속 E2E, 자연 보스→출구→클리어→로비, PC/Mac/원격 main 전체 동기화, 새 패키지/Steam 배포 미완료.

최종 commit·remote SHA는 커밋 이후 외부 `DONE.json`에 기록한다. 자기 commit SHA를 미리 추측하지 않는다.
