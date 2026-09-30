# 배포 빌드 전투 텍스처 첫 업로드 지연 보완 — 2026-09-29

대상은 퍼블리셔 검토용 `output/applications/publisher-20260929/EXODUSER_DEMO_WIN64_20260929`의 NW.js 0.111.2 빌드다. 원래 배포 스냅샷을 사용한 독립 QA 런타임과 실제 GPU 호출 계측으로 확인했다. 현재 dirty 소스를 통째로 배포본에 복사하지 않는다.

## 원인과 수정

| id | 확인 / 구현 |
|---|---|
| FIRST_UPLOAD | 물리 이빨입, 검기·피격·고어 시트가 기존 GPU 워밍업 수집에서 누락. 첫 실제 draw가 전체 시트의 texImage2D를 수행 |
| `_queueCombatTextureWarmup()` | Q·시작 보호막·플레이어 전용 항목 뒤, CH8·몬스터 수집 전에 공용 전투 이미지를 먼저 수집 |
| 투사체 | `_physMouthImg`, `_elemOrbImg`, `_waterBlueFlightImg` |
| 시작 전투 몬스터 | `_ch1StartMediumImgs`의 완료 다안육괴 시트 |
| 검기 | `_kiSlashRadiant.surfaces`의 원본 Image와 색상 Canvas |
| 타격 | `_goreImgs`, `_diImgs` |
| 최초 처치 / 덫 | `_corpses`의 첫16개128×128 Canvas GPU 사전 할당 및 `_mineTrapWardSheet`. 기존 시체 풀120개와 동적 내용 갱신 유지 |
| 공용 VFX | `_VFX_SHEETS`의 `parry_impact*`, `ki_slash_hit_*`, `magic_burst`, `land_fire`, `fire_burst`, `ice_slash`, `void_black` |
| READY | Image: complete 및 naturalWidth>0. Canvas: width/height>0. 미완료·실패 이미지 제외 |
| 기존 제한 | 일반 큐80장, 버퍼120, queued/GPU Set 중복 제거, 유휴1장 업로드,180f 재검사 유지 |
| 파일 | `game.html`, `game-easy-test.html`; 배포 스냅샷에도 같은 helper·호출만 이식 |

에셋·색상·조명·후처리·판정·전투 수치는 변경하지 않았다. 시스템 커밋은 이번 실측 시 약31.3GB/102.8GB로 이전 커밋 고갈 조건과 다르다. OS 설정은 변경하지 않았다.

## NW.js 실측

AMD Radeon RX 9070 XT / WebGL2 / NW.js 0.111.2 / Chromium148 / 1600×900 / High / 해상도100% /60fps 제한. 각12초. 측정에 포함한 표본은 hidden=0, blur=0, invalidPaused=0이다. 240Hz 모니터의 rAF 호출 수를 게임 FPS로 해석하지 않는다.

| 표본 | 생존 적 | draw 평균 / p99 / 최대(ms) | texImage2D 최대(ms) | rAF 최대 공백(ms) |
|---|---:|---|---:|---:|
| 수정 전 warm |40|1.356 /8.7 /151|37.2|170.9|
| 수정 후 first |40|0.640 /1.2 /1.3|0.2|34ms 초과0회|
| 수정 후 warm |55|1.262 /4.6 /13|0.2|34ms 초과0회|

게임 draw 수는 수정 전702/12초, 수정 후 각719/12초다. 전투와 스폰 시점이 완전히 동일한 결정론적 벤치마크는 아니므로 개선율·모든 상황의 무끊김을 주장하지 않는다. 최초 blur 표본 및 일시정지/5120×1440 오류 표본은 비교에서 제외했다. 근거: `tmp/publisher-lag-20260929/before-native-baseline.json`, `after-native-baseline.json`.

### 최종 이동·연속 공격 (같은 실제 NW.js)

| 표본 | 시간 / draw 수 | 실제 입력·전투 확인 | draw 평균 /p99/최대(ms) | update 최대(ms) |34ms 초과 공백|
|---|---|---|---|---:|---:|
| 1600×900 High100 |20초 /1199회=59.95fps|WASD 코드 입력·좌클릭 반복, 최대 이동400.278px, 처치3, 생존50|0.837 /1.5 /5.8|14.9|0|
| 5120×1440 전체화면 High100 |20초 /1198회=59.9fps|최대 이동328.031px, 누적 처치10, 생존47|0.972 /2.5 /23.1|6.5|0|

두 표본 모두 실제 focus/hidden/paused 오류0. 최종 초기 고정 구간12+12초도 draw max1.3/5.4ms, 공백0. 총64초 근거는 `tmp/publisher-lag-20260929/final-native-measurement.json` 및 이동·공격 종료 스크린샷이다. 측정 게임 소스 SHA256 `c459d7949464f70096490def48116f7a7b10d5b6b08de56f4df8a2708ec3942f`는 r2 배포 game.html과 일치한다. QA용 무적·ST 보충·저장 차단·계측은 출하 파일에 포함하지 않았다.

단계별 추가 검사에서 첫 부활 `void_black`43.3ms, 다안육괴·파란콩·덫 시트 및 첫 시체 Canvas 할당 누락을 찾아 추가했다. 마지막 표본에도 신규 드롭 스킨 업로드12.5ms와 draw23.1ms는 남는다. 중간 전체화면 변경 시 외곽 청크 준비 공백200.3ms도 관측했으며, 모든 화면 전환·스킬·보스·장시간의 지연을 해결했다고 주장하지 않는다.

## 검증

새 회귀 테스트는 각 보완 단계마다 실제 수집 누락으로2개 실패했고, 수정 후 메인/이지 테스트4개 통과했다. 관련 GPU·지연 로드·유휴 큐·플레이어·보호막 포함7파일18개 통과. 메인/이지 및 r2 배포 두HTML의 실행 inline script각6개 Acorn 구문PASS. guard6검사PASS(타 작업 WIP 경고 별도). 배포 ZIP 검증은 아래 완료 기록에 남긴다.

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 배포 스냅샷 전투 성능 QA |
| MASTER / OUTER MASS / LARGE / MEDIUM / GROUND / LANDMARK | geometry·배치·에셋 제작 변경 없음. 승인된 기존 스냅샷 유지 |
| PLAYABLE | 시작 전투 구역의 적·물리탄·검기·피격 GPU 제출 계측. 전투 공간과 판정 변경 없음 |
| CAMERA QA | START/초기 전투 확인. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전체8뷰는 이번 작업의 완료 판정 대상 아님 |
| TECH QA | 전투 텍스처 누락 수정·회귀18PASS·실제 NW.js 비교. 전체 경로·collision·404·seam 검수는 별도 기존 기준 유지 |
| FILES | 메인/이지 HTML의 helper·호출 및 회귀 테스트·관련 문서. 타 작업 dirty/staged 보존 |
| GIT / DEPLOY | 아래 완료 기록 참조. Drive 공유본은 별도 교체가 완료되기 전 기존 ZIP임 |
| VISUAL VERDICT | RETOUCH — 이번 성능 수정으로 전체 맵 시각 PASS를 선언하지 않음 |
| NEXT PASS | 이동·연속 공격·전체 화면40초 실측 완료. 장시간·보스·창 크기 변경/신규 드롭 경로는 추가 추적 |

## 로컬 패키지 완료 기록

| 항목 | 검증 결과 |
|---|---|
| 코드 커밋 | `30e9cf16ba683c2daaddae945099d445bccec2d0`, 코드·회귀·관련 문서12파일만 기록. 나머지 인덱스 항목 완전 동일 및 공유 파일의 기존 staging+이번 변경 일치 확인 |
| r2 ZIP | `output/applications/publisher-20260929/02_EXODUSER_DEMO_WIN64_20260929_r2.zip`,6,737,898,306바이트 |
| SHA256 | `d64038bfd35e87001b263037991fba1ea16206a164c212c219d2f6d1e9821a13` |
| 무결성 | 전체6,589개를 ZIP에서 다시 읽어 CRC·바이트 수·SHA256 대조. 모두 `build-manifest-r2.json`과 일치 |
| 변경 범위 | 원 배포 snapshot의 두HTML에 helper·호출22줄씩만 이식. ZIP의 다른6,587개 payload는 이전 manifest 해시 유지. QA·개인 세이브·프로필 제외 |
| 원본 보존 | 기존 `02_EXODUSER_DEMO_WIN64_20260929.zip`과 기존 checksum/manifest 유지. 추출 폴더의 두HTML은 r2, 원HTML 백업은 `tmp/publisher-lag-20260929/delivery-before-*` |
| Drive / Steam | 공유 Drive ZIP은 기존6,737,897,304바이트. r2 교체 승인 질문 대기. Steam 업로드0 |
| 근거 | `archive-verification-r2.json`, `delivery-patch.json`, `commit-verification.json` |

QA용 독립 런타임 PID28212의 실행 경로를 확인한 뒤 종료했다. 사용자 게임·브라우저 프로세스는 종료하지 않았다. 전체 worktree 변경110개는 타 작업을 포함하며, 자동 정리·타 파일 강제 커밋을 수행하지 않았다.
ㅇㅇㅇ