# BC2-09 — wallPush queue 계산

기준은 fetch한 `origin/main` **0105159934d0c2a8b167bd51518dca1e0fafe50a**이며,
BC2-08 **4b0c919d83d81635081bacf430f55a27d52ff0f1**을 정상 merge한
**fbd53c8e7103a59bad8e46a21197d335957ebaaf**에서 작업했다. rebase 없음.
브랜치: `codex/bc2-09-20261020`. 원로그: `~/exoduser-wt/_out/bc2-09/`.

| 근거·접점 | 구현·보호 범위 |
|---|---|
| 최신 main `game.html` G37077 | `t += sp` → `dist += spd*sp` → 이동한 중심의 strict strip 판정 → `hit=true` → 피해 요청 → KB → block → shake → 안정 압축·length trim. 수명/거리가 끝난 tick에도 명중을 먼저 계산 |
| onehit·charge | `!hit && P.iframes<=0`, `abs(parallel)<25`, `perpendicular<w/2`. charge 제외·패링 분기·플레이어 반경 확장 없음. iframe이 해제되어도 hit 벽 재명중 없음 |
| G38003–38012 / BC2-03 | 기존 생성부의 maxT60/maxDist2000/w1300/spd35/hit=false를 참조. 생성 모듈과 fixture 수정 없음 |
| 독립 API | `Native` 이름 등록 없이 `native_ch2_boss_wall_push.gd`의 begin_tick/next_tick snapshot·continuation. chapter/context·BC07 요청 packet 재사용. alias queue와 제거된 entry 상태까지 보존 |
| 외부 owner 읽기 경계 | 원본 `~~(dmg*elMul(el,ar().el))`은 미실행 요청 descriptor. 보호 owner의 명시 ack와 entry/player 사후 snapshot을 받아 이후 KB·trim 계산. 실제 owner·G queue·충돌·피해·음향·화면 호출은 0, 연결 HOLD |

원본 SHA-256: `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`.
main blob과 일치한다. oracle은 파일을 스트리밍하여 해시하고 G37077만 VM에 넣는다.
Node는 자기 소유 UTF-8 fixture 파일을 쓰고 Godot는 그 파일을 읽는다.
OS.execute 진단은 전체 output을 join하며 node/source 경로는 명시 인자다.
실제 hurtP/elMul 본문 검증은 하지 않았으며 fixture helper의 읽기·쓰기 순서만 대조했다.

| 검증 | 실제 결과 |
|---|---|
| 신규 원본 대조 | 최종 **3,729검사 / 0실패**, exit0·SCRIPT ERROR0·skip0. 226상황/1,484event/100명중/charge15/명중 후 제거34 |
| 직접 관련 기존 회귀 | BC2-03 new_start만 무수정 1회, **25,749검사 / 0실패**, exit0·SCRIPT ERROR0·skip0. 전체 회귀를 실행했다고 주장하지 않음 |
| 핵심 결함 주입 4종 | charge 제외 / hit 재명중 / strict 경계 완화 / trim 선행 모두 검출. 각각 assertion 실패 **64 / 30 / 12 / 104**. charge 변이는 별도 경계 검사의 후속 SCRIPT ERROR도 발생; 검출 근거는 앞선 64개 assertion 실패 |
| 필수 인자 누락 | --node-bin / --source-game 각각 exit1·1실패로 거절. 성공 합계 제외 |
| 실패·재검 기록 | 첫 실행에서 잘못된 catalog 타입 continuation의 String/Object 비교가 SCRIPT ERROR를 일으킴. 타입 guard 추가 후 재실행. 최초 결과의 failures=0은 PASS로 인정하지 않음 |

실행마다 Godot pgrep 수가 2 이상이면 30초 대기했다. 신규 격리명은
`EXODUSER-bc2-09-Isolated-20261020`, 기존 회귀는 파일 상수의 이름을 사용한다.
총 10회 실행(import1·신규2·기존1·변이4·인자거절2)의 실행 로그·gate·exit/error/result는 외부 원로그에 보존하고 override.cfg는 종료 시 비운다.
결함 주입은 검증 사본에만 적용하고 최종 제품과 동일 바이트로 복구한다.

변경은 신규 모듈·UID, 신규 테스트·UID·oracle, 이 보고서와 CHANGELOG_SYNC 절뿐이다.
공용 Main/State/저장·6파일·다른 담당·기존 모듈·기존 테스트·원본·세이브 형식·바이너리 변경 0.
다음 단위 구현은 하지 않았다. 실제 충돌/피해 owner·Main 연결은 HOLD이며 실전 동작은 미확인.
