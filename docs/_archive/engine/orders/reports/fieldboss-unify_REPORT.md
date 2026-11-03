# fieldboss-unify — 1-1 필드보스 공통 helper 통합

기준은 fetch한 최신 `origin/main 0138c5bb9188d27cee10cb1a901d075092ddb88f`에 31 `76bcae8d216d2242984c70a3b4fad45ae3e8a3b4`, 32 `4a10102a`, 33 `f650c8d7`를 정상 merge한 `b51e2c789353f6befc2b7a8a041d395e2a009d15`다. Main·State·CHANGELOG·WORK_BOARD의 충돌은 양쪽 추가 내용을 보존했다. 의존 체인의 기존37/38 코드는 유지했으며 rebase/force/main push0. merge 원로그는 `_out/fieldboss-unify/merge.log`, 별도 merge commit은 위 b51e2c78이다.

33 보고서의 6개 통합 후보를 **한 파일 `godot/scripts/native_fieldboss_common.gd`**에 모았다. 기존 공개 API는 위임 wrapper로 유지하고, 보스별 AI·HP/ATK·면역·원문 prefix/ack 순서를 바꾸지 않았다.

| 33 통합안 영역 | 단일 helper로 이동 / 보존한 차이 |
|---|---|
| source math | 31/33 i32·32 i32/valid_player/number. FD의 fmod→trunc와31의 trunc→fposmod 연산 순서는 각각 보존(부동소수 동치 추정으로 교체0). 장/성급/HP·공격 식은 각 모델 유지 |
| provider | Main/World/State liveness, Marker 최초4개 고유성/유한 위치·조상 관계, provider 상실, named Marker 해석. FD의 tree/path identity·queued 검사와31/33 배열 순서는 별도 정책으로 유지 |
| field projectile facade | 기존35 registry의 field bind/aux·aggro context·birth·retire와 FD birth 위임. registry/pool/실제 carrier는 기존 하나. FD 큰탄 specialized 거절,31 에너지/60f warning,33 즉시탄은 그대로 |
| PC contact bridge | handler 실제 owner·Player snapshot·readback 필드 대조. 31의5필드와33의HP 포함6필드,32 continuation의 valid_player/ack를 유지. 피해/패링/KB 집행·보호 writer 변경0 |
| hit collection | 허가 hit owner·pause/stage/arena gate, CD8·정수 피해 적용, target 조회/회수. 31은 PC HP/final readback 전용,32/33만 기존 HP writer·null slot/면역·보상 차이 유지 |
| clock adapter | 기존 field registry의 primary/aux serial+sp 불일치 거부·clock 선택을 그대로 이동, family serial 비교 공유. 31/33 native World phase와32 continuation/pump를 새 clock으로 합치지 않음. pending 재실행/가짜 ack0 |

공용 Main/State는 **통합 구현 diff(b51e2c78 이후)0줄**. 의존 merge의 충돌 해소는 Main357–359·3075–3109, State1589–1640 부근의 양쪽 추가문 합집합이며 새로운 전투/저장/진행 동작을 쓰지 않았다. World/Player/hud/hurtE/PC 보호 경로의 자기 diff0. `native_demo11_boss_projectiles.gd`는 2·58–68·159행의 field facade·field clock 위임만 변경(+8/−42). 그 외 보스 collection/model의 공통 부분만 위임하고 고유 tick/view는 유지한다.

MAP11 확인: origin/main에는 map11-prod provider 설치/제품 Marker가 없다(Main/provider 및 tree 확인). 따라서 이번 단위는 **이름 계약 표만** 제공하며 Main 자동 bind/좌표/맵 파일은 추가하지 않았다. 아래 이름은 이 단위의 후속 MAP11 연결 계약이며, 제품 provider 인수/실제 배치 완료를 뜻하지 않는다.

| provider 하위 경로 / source slot 순서 | Main 호출·수명 계약 |
|---|---|
| `Markers/AnglerSW` → `Markers/AnglerSE` → `Markers/AnglerNW` → `Markers/AnglerNE` | 이 순서의 Marker2D 배열을 `bind_native_demo_anglers(provider,markers)`로 전달. 원소 순서2물/1불/3암/4뇌. 원본 좌표 복제0 |
| `Markers/FireDevil1`…`FireDevil4` | 기존 `bind_native_fire_devil_map(provider)`가 이름으로 해석. 현재 FD 이름을 변경하지 않음 |
| `Markers/Worm1`…`Worm4` | 이 순서의 Marker2D 배열을 `bind_native_demo_worms(provider,markers)`로 전달. 곰치 source slot0…3 유지 |

provider는 실제 Main.world의 descendant, 각 family에 배열 안에서 중복 없는 Marker4개를 최초1회 넘긴다. global_position으로 spawn/home을 초기화하고 매 tick 위치를 복제하지 않는다. provider/Marker 상실 시 중단한다. 이름 lookup 실패 시 원본 좌표/임의 위치 대체0. 신규 격리 통합 fixture는 이 표의 이름을 실제 Marker로 만들고 같은 Main의 세 collection·단일 registry·provider 소실을 검사한다. 제품 MAP11 배치나 자연 전투 인수는 미확인이다.

검증: 기존 앵글러 **1,402/0**, 화마귀 **906/0**, 곰치 **7,874/0** — 각 기존 검사 수와 동일·무수정·각1회. 직접 관련 PC readback **11/0**,35 registry **29/0**, 기존 합 **10,222/0**. 신규 동시 설치 fixture의 첫 실행은14검사/실패 assertion0이나 provider 해제 후 typed helper 인자에서 **ScriptError3건**으로 실패 판정했다. helper의 보관된 수명 참조를 Variant로 받아 기존 is_instance_valid guard에 도달하게 수정했고, 실패한 신규 fixture만 재실행해 **14/0·ERROR0**을 확인했다. 같은 실제 Main/3collection/12slot/단일 registry·provider 해제 중단을 검증했으며, 최종 기능 합은 **10,236/0**이다. 초기3건 오류와 실패 판정은 combined.json/err에 그대로 보존했다. 기존31/32/33·PC readback·35 registry 테스트5개는 b51e2c78 byte와 동일하며, 원본 oracle 호출에 명시 Node 절대경로 및 --source-game 절대경로를 사용한다. 신규 테스트만 `EXODUSER-fieldboss-unify-Isolated-20261021`, 기존 suite는 각 파일 USERDIR 상수, 실제 사용자 폴더0. Godot 전 exact pgrep≥2이면30초 대기, override 매회 설정 후0byte. 출력은 파일에만 저장하고 요약/실패 줄만 확인한다. 기존 suite 최종 ERROR0/skip0, 기존 Main Camera2D interpolation WARNING는 원문 보존. import exit0/ERROR0. 초기 combined.json의 exit0/14검사만으로 PASS를 만들지 않았다.

새 UI/텍스트/에셋/맵/시각 변경0, 신규 바이너리0. 틱 목록 생성API0. 별도 FPS/성능 벤치를 새로 돌리거나 전체120fps를 주장하지 않는다. 기존 미인수 PC producer·자연 전투·FD specialized terminal·MAP11 배치·시각 마감의 상태를 PASS로 변경하지 않는다. 원로그 `~/exoduser-wt/_out/fieldboss-unify/`; 자기 브랜치 push/원격 일치/DONE 뒤 자기 worktree 제거, R 시작/종료 비교를 보존한다.
