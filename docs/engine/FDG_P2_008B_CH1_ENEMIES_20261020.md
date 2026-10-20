# P2-008b — 초기 16개 다음 exact 소비자

## 원본과 적용 경계

`game.html` SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, `encounters.json` SHA256 `91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa`.
초기 16개 데이터와 `native_final`·원 `support=false/runtime=null`은 수정하지 않는다. factory capability만 추가한다. 소환굴 등록·세이브·레슨·입력·Q/E 판정 변경 없음.

| 항목 | order11 exact 값 / 근거 |
|---|---|
| id / 원형 | `ch1_initial_012` / etype47 그림자 쌍둥이. 원 레코드 이름은 `native etype 47` 유지 |
| 좌표 / 거리 기준 | [3969.716234383507,494.7575176250593]. 시작점 [4020,7420]과의 직선거리 기준으로 다음 개체. 실제 이동 경로 최근접 검수와 다름 |
| HP / mhp / ATK | 875 / 875 / 31. 실드 875/875, 포이즈 875/875. mkEn `game.html:31120-31185`, 초기 호출 이후 `native_final` 그대로 |
| 반지름 / 속도 / 속성 | 26.665450139902532 / 0.7655834316909312px/native tick / physical(0). elite0·mods[]·aura=null |
| 스킨 | flesh_crawler, CH1 8방향 atlas col6 row0, cell256, draw_height186.65815097931772. 기존 원본 16개 atlas 재사용; 임의 etype47 별도 그림으로 교체하지 않음 |
| 분신 타이머 | `_stCloneCd=221.1318963347003`, `_stCloneT=82.6070635765791`; 생성식 Cd200+U60/T80+U40 (`31285-31286`) |
| TP 타이머 | `_stTpCd=131.94252423010767`, 생성식120+U40 (`31287`), 시작 `_tpWarnT=0`, `_tpWarnMax=30` (`31194`) |
| 이동 | LOS/800 어그로, range400이면 d>30 flow×1 (`38681-38705`), idle×1.6 (`40456-40497`). 접촉 공격 목록에47 없음 (`40498-40503`) |
| 분신 분기 | idle에서 두 타이머 감소→CloneT≤0 && ens.length<200이면 Cd로 재설정→offset(U−.5)×60 두 번→`mkEn(...,40,false,e.el||EL.D,e._ri)`→hp/mhp trunc×.3, shield0, atk trunc×.5 (`39407-39416`) |
| **분신 등록 없음** | 위 분기에는 `ens.push`가 없고, `mkEn`은 객체를 return할 뿐 (`31361-31362`). actor/레지스트리/스폰 카운터를 추가하지 않는다. physical0은 JS falsy라 clone el3(dark). `_ri` 부재는 room 부재로 기록 |
| constructor 부작용 | 충돌 반경10→safePt→난이도·레벨·elite/M29/M30·속도/반경·HP/ATK·idle/facing/proj/bossPattern/orbit/wraithPhase/wraithCd/erratic RNG와 결정적 skin 계산. 일반11draw/매직12draw. 미등록 객체의 관측 가능한 필드만 receipt로 보존하며 type40 AI를 허위로 등록하지 않음 |
| TP 경고 | 기존 warning 감소/완료가 먼저. 없으면 Cd≤0 && 60<d<1200에서 P+polar(U2π,60+U40), canMv 성공 시120/120·색#cc44ff. 생성 update에서는120 유지; 실패 Cd30. recover/stun 동안 분기 정지 (`39419-39428`) |
| TP 완료 | 목적지 재검사. 실패여도 Cd120+U40·WarnT0 재설정. 성공 시 비보스·iframes≤0·state≠charge·거리<(r+10)×2+Pr에서 trunc(31×10.5×elMul)=325(현 물리 무상성), 추가 KB120. 즉시 착지 탄 없음 (`20006-20048`,`39421`) |
| 공통 탄 | projCd240 / projT274.3530197069049, d<400에서 charge60. 완료 시 actor-center 물리 원본 kernel, raw trunc31×.8=24, life trunc400×.3=120. 기존 정규화·연소·sweep/벽 kernel 재사용 (`20122-20155`,`40505-40518`) |
| 경고 렌더 | **TP 조준 원 없음**(원본 폐기 유지). 별도 물리탄 차징 원+13px bold 라벨은 `24096-24122`. Q/E 판정 추가 아님 |

## 자원과 의도적 미완료

기존 원본 자원 21개(8 idle atlas+8 walk atlas+TP4+물리탄1) 총26,835,117B를 이 worktree의 웹 원본과 바이트 대조: 21일치/0불일치. 새 그림 생성·변형·재복사0. 이미 존재하는 동일 파일을 재사용한다.

TP의 연기·도착 스프라이트·버스트·번개는 기존 TP renderer를 재사용하며 색은47=#cc44ff, 기존7=#8833cc를 유지한다. 기존 renderer가 미이식으로 표시한 literal 파티클·blast light·shake·공유 RNG 전역 픽셀 동등성까지 이번 기능 PASS로 주장하지 않는다. `full_teleport_particle_light_shake_parity=false`를 프로필·snapshot에 명시. 기술 검사와 실제 창/픽셀 검수는 별도 게이트다.

실제 Main 문맥의 G/P/OPT를 읽을 수 없거나 mkEn safePt가 null이면 대체 적 생성 없이 `shadow_error`에 정지 사유를 남긴다. 이는 source null dereference를 정상 분신 성공으로 꾸미지 않는 경계다.

## 다음 순서

| 최근접 순 | order | etype | 남은 핵심 |
|---|---|---|---|
| 1 | 9 | 21 | dark 공통 탄 range800/life240, 원거리 거리 유지 |
| 2 | 5 | 25 | 물리탄+얼음 장판 life480 |
| 3 | 2 | 29 | slam45·8방향 얼음탄·빙결/사망 얼음기둥 |
| 4 | 3 | 7 | M30·TP·소환 실제 생산자 의존성 |
| 5 | 6 | 6 | 호위·방패 추적·bash |
| 6 | 7 | 7 | M30 없는 별도 exact 스킨/소환 프로필 |

수치/근거/실행 결과/커밋은 [작업 보고서](orders/reports/P2-008b_REPORT.md)에 누적한다.
