# CH2-02 — si4 독립 World·실효 배치·충돌·Godot 표현

작업 `ch2-02` / 브랜치 `codex/ch2-02-20261020`. 추적 순서안 §4.2의 **독립 소비자 구현·기술 검수 완료**, 시각 판정 **RETOUCH**다. 제품 Main/World/실제 Player, 소환굴·지역·적·보스·클리어·전환은 연결하지 않았다. `full_stage_ready=false`이며 2장 전체 게임 완성을 뜻하지 않는다. 후속 단위 착수0.

## 기준·의존·원본 보존

| 항목 | 실제 기준 |
| --- | --- |
| R | /Users/fordeargamers/Projects/exoduser-migration-20261001, HEAD dd49171c5b88e211575a41f185395d6c0a14b184 / 기존 branch·INDEX·WORK 보존 |
| 최초 fetch main | e556b617190c325ca39f5add04357f5dea5ca87e. CH2-01과 CH1-04가 없어 승인된 의존 끝 사용 |
| CH2-01 기준 | 4013102a82c9ddc3bd7d0f75ba0159438f86d93f에서 --no-checkout 새 worktree·sparse 생성 |
| CH1-04 의존 | 5487245c3d857927cf8c0634d0ea5edb05650340의 기존 독립 World/reader/rectangle helper 인수. merge 0c63400fd867b5ea936fe868bf32bb6098671b7f |
| merge 처리 | CHANGELOG의 양쪽 신규 절을 보존하고 공통 과거 절은 byte동일 유지. 정상 pre-commit 통과. CH1-04 신규 파일/자산은 해당 부모의 인수분이며 이번 자체 수정과 구분 |
| 원본 | game.html 65,692행, SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 |
| 실행 폴더 / 원로그 L | ~/exoduser-wt/ch2-02 / ~/exoduser-wt/_out/ch2-02/ |

공유 `origin/main` ref는 작업 중 다른 fetch로 8524bbbb…와 299e48ac4dfbb7cedd313e791173c0d8ff20cb0a까지 전진했다. 관측한 모든 main의 game.html은 위 SHA와 동일하다(L/main-reference-drift.json). ref를 되감거나 추출 artifact의 실제 최초 main 출처를 바꾸지 않았다. 최신 내용이 바뀐 원본을 과거 fixture로 통과시킨 것이 아니다. PC 실행·동기화·기존 실행창 갱신은 미확인이다.

원화는 기존 파일 byte/hash를 참조하며 신규 PNG 복사·재인코딩·원본 쓰기0이다. 렌더 시 native alpha 제거는 private Image 복사본과 메모리 ImageTexture에만 적용한다. 기존 PNG/캐시 Texture2D의 RGB/파일은 보존한다. 선정 기존 tracked2397파일 SHA 변경0(공유 exporter·허용 CHANGELOG는 별도 허용 범위). 공용6파일·P2-006a·P3·Q/E·저장 형식·원본 HTML/JS·기존 CH1/CH2 snapshot·제품 map.json 변경0이다.

## 같은 파이프라인의 좁은 확장

공유 `export_ch1_area_source.mjs`는 **7행 추가/2행 삭제**다. optional `observeNative`로 전체 source snapshot을 JSON 캡처한 뒤 같은 private VM의 원 generator 상태를 계속 읽는다. 원 G flag와 최초 MAP_OBJS를 새로 추정·구성하지 않는다. stage0/1/4의 observer 없는 재추출 결과를 이전 CH2-01 도구와 전체 깊은 비교했고 게임 내용 차이0이다. snapshot 캡처 뒤 observer의 VM 변경이 이미 캡처한 snapshot에 역전파되지 않는 검사도 포함했다. CH1-02 조건의 대상 도구 필드만 수정했고 맵/지역/굴 회귀를 실제 실행했다.

신규 `export_ch2_area_resources.mjs`는 기존 CH1 rectangle helper를 그대로 가져온다. 원문 metadata merge/occ-foot·전체 initMapObjects·충돌 prefilter/isW/canMv/LOS 함수를 정확 AST 행/SHA로 캡처하고 실행한다. 원 함수 분기·수치 치환과 mkEn/전투 stub0이다. selector→genFromTemplate→START→regionInit은 CH2-01 파이프라인이다. 고정 seed20261020의 기존 생성 RNG 11회 뒤 initMapObjects의 추가 Math.random 소비는 실제0회다.

| 원문 행(game.html) | 실제 인수 |
| --- | --- |
| 17991–18117,18197–18201 | CH2S4 hand105·compose4·22점/w30/authoredWidth1, 기존 source snapshot 참조 |
| 17808,18486,18501–18504 | DECO_FORCE_AUTO, metadata in-place merge·occ-foot. undefined 값은 별도 경로 mask로 보존 |
| 25735–26472(nearFloor 26059–26074) | 전체 initMapObjects 실행. hand105의 최종 world/정규화 회전/role 관측. zone/overlap/CH2 scale은 원 loader가 전달하지 않아 새로 붙이지 않음 |
| 31685–31712,31672–31681,31723 | col prefilter, isW/canMv, hasLOS/dst. gate 포함 실제 analytic shape를 원문에서 추출 |
| 18427–18445 | 원 alpha keying 모드. mega magenta 제거/hardAlpha/일반을 구분해 메모리에만 적용 |
| 26517–26528 | gt_ch2 floor byte 참조. Godot preview path/명암은 별도 표현이며 원본 픽셀 동일성을 주장하지 않음 |

CLI: `node godot/tools/export_ch2_area_resources.mjs <explicit-root> <external-oracle-json>`. root 내 고정 si4_resources.json과 root 밖 명시 oracle JSON만 출력한다. symlink 조상/제품 경로/다른 schema·stage의 기존 파일·내부 evidence를 쓰기 전에 거부한다. 원본·PNG·기존 snapshot·저장 쓰기0이다.

## 실효 데이터·독립 소비 경계

`si4_resources.json` 112437byte / SHA256 `4bf1a8cab02f1ad2b3d199d0b05a155e51bbb59a9ff4911a6cb8c657fd4d0279`. reader는 이 pin과 CH2-01 순수 계약, 제공 bundle 전체 동일성·타입 및 원화 hash/크기를 검사한다. 손상·누락은 ready=false이며 부분 성공이나 실제 게임 READY로 바꾸지 않는다.

| 내용 | 관측·구현 |
| --- | --- |
| 게임플레이 타일 | 200²/T40/40000, 0/1/2/3/4=10722/28395/3/0/880, SHA4e965948e59fed49b7de6c2936ca24aa774e858532a7e22780d72519050eb3c8 |
| START/EXIT | [4020,7420]→[4020,1340]. gate metadata y31·출구y33/code3타일0 유지 |
| 원 generator 초기 객체 | boss_gate_col@(4020,1200) 1개. 빈 배열로 대체하지 않음 |
| 실효 객체 | 107=hand105+lore1+invisible gate collider1. Sprite105+lore marker1, 가짜 gate 그림0 |
| nearFloor | 105개 전체 순서·role·회전 검산, 입력 중42개가 원 탐색으로 이동. raw 좌표 수정0 |
| 실제 충돌 | 원문 analytic 원52개(원화 선언51+gate1). gate 중심4020/1200·반경100. 원형 strict 비교와 원 double 입력 보존 |
| 타일 Physics2D | RectangleShape2D 276개가 tile1의28395cell을 겹침 없이 정확히 덮음. 실제40000센터 대조 mismatch0 |
| 자산 | 기존 CH2 고유27파일 로딩/hash/크기 일치. 원화29개 전체 재복사0. hand keying none84/magenta17/hard_alpha4 |
| 렌더 | 원문 중심 pivot/size/keepAR/flip/rot/alpha·layer0 y-sort. alpha 1×96/.68×8/.72×1. Godot 연속 바닥 mesh/path shader |
| 동선 | CH1-04 BFS/swept fixture 재사용, 경로165점. 왕복330회 실제 fixture 이동·84렌더프레임 |
| 복제하지 않은 것 | CH1 stage0 hill·64baked chunks·stage0 actor0. CH2 기존 path22와 dead-end 중복점 유지 |

**prop Physics2D shape는 설치하지 않았다.** 원52원의 analytic query가 swept fixture를 이동·차단한다. 이 검증을 실제 CharacterBody2D Player의 충돌·전투 동등성으로 확대하지 않는다. tile 정적 Physics2D와 analytic prop을 구분한다. 원 double 입력은 IEEE754 LE base64로 운반하며 JSON 숫자만 읽을 때 생기는1203개 반올림 입력을 실제 source 수치로 복원했다. isW/canMv 각10998개 및 LOS400개 source 대조 모두0차이다.

World는 기존 CH1-04 독립 World를 상속하고 CH2 reader/바닥/prop 표현만 바꿨다. fixture actor·Camera2D뿐이며 Main·제품 World·실제 Player·저장 IO·적·굴·지역 writer·전환0이다. 굴11/총900·지역250/200/300/150은 source 계약만 유지한다. lore 도형은 상호작용 미연결 preview marker이고, 생동감/보스/사운드/전체 조명과 정식 진행 완료를 뜻하지 않는다.

## 실행·회귀·실패 원문

L에 각 command/override/stdout/stderr/engine/result를 보존했다. 기존 Godot4.7.2를 사용하고, **매 엔진 실행 전** 지정 pgrep/wc를 process-gate.jsonl에 남겼다. 2이상일 때30초 대기 후 재확인, 타 Godot 종료0, 자기 엔진 순차 실행이다. 신규 격리 `EXODUSER-ch2-02-Isolated-20261020`, 기존 suite는 각 파일 상수 이름 그대로다. override는 실행마다 작성하고 finally0byte다. import cache는 자기 과거 IT-05 cache의 새 APFS clone이며 원 cache 변경0이다.

| L prefix | 실제 결과 | 비고 |
| --- | --- | --- |
| extract / extract-final / extract-schema | exit0 | 최종107/105/52/276/27, queries10998/LOS400. 중복 합산0 |
| new-node-stable-provenance |7통과/0실패/0SKIP, exit0·stderr0 | 신규 Node 최종. new-node의 같은7/0도 원로그 보존 |
| new-godot |894단정/0실패, exit0·ERROR0 | source query·실제 타일 Physics·음성 reader 검사 |
| camera8 |1232단정/0실패, exit0·ERROR0 | 실제 GPU Apple M5 Pro/opengl3/gl_compatibility,1920×1080×8PNG |
| source-node |29통과/0실패, exit0 | CH2-01 11+CH1-01/03 각9 |
| ch1-assets-node / pit-node |각6통과/0실패, exit0 | 기존 자산 재추출92PNG·pit/collider delta |
| ch1-world-node |5건 중4통과/1실패, exit1 | **기존 CH1-04 검사 그대로**, 아래 출처 ref 차이1건 |
| map-node |37건 중28통과/9실패, exit1 | 기존 CH2-01 baseline과 실패명·순서 동일, 새 실패0 |
| import |exit0·ERROR0 | 자기 캐시와 sidecar 생성 |
| ch2-source-godot |362단정/0실패 | CH2-01 순수 source 계약, exit0·stderr0 |
| ch1-source/stage1/environment/world-godot |63/0·75/0·189/0·88/0 | 모두 exit0·ERROR0, CH1-02 실제 World·CH1-04 oracle 대조 포함 |
| contracts-godot |5그룹/실패단정0 | exit0·stderr0·ERROR0 |
| spawn-godot |6그룹298단정/0실패/0SKIP | 실제 GUI 렌더러, exit0·ERROR0 |
| regions-godot |43단정/0실패 | 실제 GUI 렌더러, exit0·ERROR0 |

기존 CH1-04 Node full bundle deep equality는 stored `source.main_sha=e556b617…`와 다른 fetch 뒤 ref `8524bbbb…` 차이로1건 실패했다. 기존 검사/fixture를 고치거나 PASS로 바꾸지 않았다. L/ch1-resource-provenance-comparison.json에서 두 기록 커밋의 game bytes SHA를 확인하고 **이 출처 필드 하나만 정규화한 별도 전체 깊은 대조0차이**를 남겼다. 신규 검사는 두 기록 SHA 모두 원본 byte 동일성을 먼저 증명한 뒤 출처 ref만 비교에서 정규화하고, 모든 게임 데이터/행·함수 hash/배열은 정확 비교한다. source 변경을 숨기는 정규화가 아니다.

맵9실패는 기존 culling fixture1·adapter pending2·Image 없는 지역 VM6이며 L/map-failure-comparison.json에 이름/순서를 보존했다. P3002 actors_registered10/unported_spawns158, P3003 full_fieldboss_combat=false, CH1-02 source-image 등록4개 NOT_READY는 해결하지 않았다. 기존 Camera2D interpolation 경고/P3002 ObjectDB8 누수 경고도 원 stderr에 남겼다. 신규/회귀 Godot SCRIPT ERROR/ERROR는 모두0이다. 사용자 전달 원문 **“로비 전체 회귀 8실패(main에서도 동일, QA-005 진단 중)”**는 이번 재실행·수정 없이 기록만 한다.

GPU 왕복84렌더프레임은60FPS cap에서1366.826ms인 짧은 fixture sweep이다. 적·보스·VFX가 없는 상태이며 전투 FPS/대규모 성능 benchmark로 보고하지 않는다. 브라우저 pageerror/404와 PC 검수는 해당 실행 대상이 아니어서 미확인이다.

## MAP PRODUCTION REPORT — §23

```text
STAGE: CH2-02 / si4 independent source consumer, product runtime unbound
MASTER: source path22/w30·hand105·nearFloor42보정·굴11/900·4분면 계약 보존
OUTER MASS: 원 mega17·boundary50의 실효 위치/규모/회전 소비. 충돌을 그림 경계로 바꾸지 않음
LARGE: 기존 원화27파일 참조, 원본 byte변경0. 일부 겹친 대형 질량·잘린 이미지 경계 잔존
MEDIUM: backfill9/filler12/seam6 원문 실효값 소비. 새 구조/zone/overlap 창작0
        연결 형태는 보이나 LANDMARK의 복잡한 겹침은 추가 시각 인수 필요
GROUND: 연속 world-space tiled mesh+Godot path shader. 청크 seam없음, 반복 패턴·접지 부족
        원문 alpha keying 메모리 소비. 별도 그림자·동적 오염/맥동 조명 미구현
PLAYABLE: START→EXIT 165점/왕복330fixture 성공. 측면 dead-end 보존
          실제 Player·전투/적·지역 클리어 미연결, 전투 가독성 최종판정 미확인
LANDMARK: 원 hive/거대 외피/기둥/출구 구조 식별. 새 lore 상호작용·보스 연출0
CAMERA QA (실제8PNG 개별 확인):
 START: 좌우 대형 외곽·알주머니가 입구를 둘러쌈. 중앙 통로 확보, 바닥 반복 뚜렷
 EARLY: 좌우 연결 연속. 우측 회전 외피/웹의 겹침과 일부 직선 절단 경계 잔존
 ARENA: 중앙 넓은 공간과 주변 기둥 식별. 평평한 반복 바닥·접지 그림자 부족
 SIDE L: 벌집/황색 구조·우측 깊은 홈 구분. 연결 외피 겹침이 밀집
 SIDE R: 측면 공간 보존. 아래 거대 외피가 시야를 크게 차지, 접합부 정리 필요
 LANDMARK: 대형 공동/층진 외피가 장소를 구분. 좌측 밀집도가 높고 경계 겹침 잔존
 LATE: 좌우 벌집과 상단 이동공간 확인. 바닥 단조로움/일부 자산 끝선 잔존
 EXIT: 중앙 거대 공동과 좌우 기둥 식별, fixture 접근 성공. 실제 전환 미연결
TECH QA:
 route/collision: source isW/canMv10998/10998·LOS400 차이0, 물리40000센터/union 차이0
 pageerror/404: browser 미실행, 미확인
 seam: 연속 바닥 tile/chunk gap없음. 원문 대형 자산 겹침/직선 끝선 시각 RETOUCH
 loading:27/27파일 byte/size/실제 texture 검사 성공, resource_errors=[]
 performance: GPU84프레임/1366.826ms@60cap, 단기 fixture; 전투 FPS 미확인
FILES:
 stage-owned: CH2 exporter/resource JSON/reader/World/preview/tests/UID3/report
 concurrent touched: 공유 source exporter optional continuation7+/2-, CHANGELOG top절
 unrelated touched:0; 기존 CH1 dependency 파일 자체 수정0
GIT: 자기 branch만 정상 commit/push, main/force/전체add/배포0. 원격 일치→DONE→자기WT제거
VISUAL VERDICT: RETOUCH
NEXT PASS: 원본 게임플레이 보존하에 겹침·직선 경계/바닥 반복/접지·조명 추가 시각 인수
           공용 Main/Player/지역/굴/전환은 별도 소유 인수·배정 전 무수정
```

## 제출·후속 경계

자체 변경은 공유 도구1+신규10코드/데이터/scene/test/UID 경로+보고서1+CHANGELOG1의13경로다. 자동 생성된 소유 밖 sidecar는 L/generated-sidecars로 보존해 제출에서 제외한다. `.gitignore` test_* 때문에 신규 Godot 테스트/UID 정확 경로만 force-add하고 정상 pre-commit을 사용한다. hook 우회0이다.

push 후 원격 branch SHA 일치를 읽어 확인하고 L/DONE.txt·submission-receipt.json에 실제 SHA/검수 수치를 남긴 뒤 자기 worktree와 자기 임시 cache만 제거한다. branch·원로그·8PNG·최종 보고서/리소스 사본은 L에 보존한다. R 보존 및 실제 제거 결과는 cleanup-receipt.json을 참조한다. 다음 CH2-03의 source/독립소비는 신규 배정 전 착수하지 않는다. 제품6에리어 진행은 추적 문서 §4.8의 별도 통합 권위가 필요하며 이번에 공용 연결을 추가하지 않는다.
