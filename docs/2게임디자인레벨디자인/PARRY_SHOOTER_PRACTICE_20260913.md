# 단발 패링 — 발사 예고 링과 반사 처치

| 항목 | 현재 계약 |
|---|---|
| 적용 | 기초 튜토리얼 `chapter=1`, `step=0/1`. 몬스터 등장 → 예고 링 → 발사 → 올바른 패링 → 반사탄으로 발사 몬스터 처치. Q/E 홀딩 다수탄 과제는 기존 조건 유지 |
| 마법 | `step=0`, `EL.D`, 보라색 `#b26dff`, Q 패링 |
| 물리 | `step=1`, `EL.P`, 흰색 `#f4f4f4` 링, E 탭 패링. 실제 탄종은 엔진의 물리 이빨탄 규칙 사용 |
| 설명 | 링 완성 시 발사, 흰색 링은 물리탄(E)·속성색 링은 마법탄(Q), 이번 보라색은 암흑 마법탄이라고 안내. 패링 성공 후에도 반사탄으로 발사 몬스터를 처치해야 완료된다는 안내 유지 |
| 생성 | `spawnParryEnemy()`, 기존 `mkEn(...,G.stage,0,false,el,-1)` etype0 에셋. 플레이어 주위280px, `-π/2+i×π/4`, 최대8방향 시도. 안전 위치 보정 후 거리160~450px만 허용. `_lessonEnemy=true`, `_lessonStage=step`, hp/mhp1, atk0, elite0, mods[], spd0, idle |
| 표시 | `_spawnT=0`으로 본체 즉시 표시. `parryEnemy` 한 마리만 관리. 기존 `_drawEnemyShotWarnings()` → `_drawShootCharge()` 공통 렌더를 사용하며 전용 링을 중복 생성하지 않음 |
| 링 시간 | 최초45틱 대기 후 `_projChargeT=60`, `_projChargeBean='normal'`, `_projChargeCol=해당 색`. `tickParryEnemy()`가 `_dtSp`로 감소. 진행도 `1-_projChargeT/60`; 0이 되면 발사하고 색 제거. 일시정지 중 감소/발사 없음 |
| 발사 | 발사 몬스터 위치에서 현재 플레이어 방향, 속도3px/틱, life/ml360, dmg0, `_commit=true`, `_lessonShot=true`, 적대·유도100°/초. 엔진 스폰 배율 뒤 vx/vy를3px/틱으로 재설정. 발사 실패는60틱 대기 뒤 링부터 재시도 |
| 유도 반사 | `_parryHomingTarget()`은 활성 튜토리얼의 chapter1 step0/1에서만 살아 있는 `parryEnemy`를 반환. 다른 연습 단계는 기존 null 유지, 실전 최근접 적 타깃 선택은 유지 |
| 패링 기록 | 올바른 실제 Q/E 패링 이벤트에서 `parriedShot=shot` 기록. 패링 이벤트만으로 completeStep 호출하지 않음 |
| 처치 귀속 | 아군 반사탄의 일반 광역 적중 `hurtE` 옵션에 `_lessonParryShot=p._lessonShot?p:null` 전달. `hurtEnemy`는 대상이 현재 `parryEnemy`이고 `_lessonStage`가 일치하며, `opts._lessonParryShot===parriedShot===shot`, friendly·parryBlueBean이 모두 참일 때만 처치 인정 |
| 오인 방지 | 기검참·우클릭·다른 탄·이전 시도 탄·패링 이벤트 없는 반사 플래그는 처치 미인정. 동일 몬스터 중복 사망/완료 금지 |
| 완료 | 실제 처치 후 공통 사망음/VFX/시체 처리 및 `completeStep()`. 체크 후90틱 뒤 다음 과제. 경험치·아이템·처치 통계 지급 없음 |
| 재시도 | 탄 소실·수명 종료·플레이어와1200px 초과 시 탄/패링 기록/링·자세를 지우고60틱 대기 → 새60틱 링. 피격은 기존60틱 피해 표시 → HP/쉴드 복구 →45틱 대기 →60틱 링 |
| 정리 | `clearShot()`은 parriedShot 및 링 시간/색 제거. start/finish에서 parryEnemy/parriedShot 초기화. 다음 단발 과제는 이전 몬스터 참조를 연습 ens에서 제거하고 별도 몬스터 생성. 종료/건너뛰기는 기존 월드/플레이어 복구 |
| UI | 기존 제목/hint 리프 노드만 갱신. 이 변경은 기존 과제 개수·배지 개수를 늘리지 않음 |
| 캐시 | 본 변경 적용 키 `20260913-parry-shooter1`. 이후 튜토리얼 추가 변경의 캐시 키는 두 HTML의 script src를 따름 |

검증: `tools/test-parry-lesson.cjs`에서 두 게임 HTML의 실제 링 렌더·유도 타깃·반사탄 광역 피해 코드를 실행했다. 60틱 이전 미발사, 50% 링 색, 정지 중 유지, 몬스터 위치 발사, 패링만 미완료, 다른 공격/탄 제외, 반사 처치 후 완료 및 중복 방지/종료 정리를 확인했다. 기존 마우스·자원 실습 회귀 검사와 발사 예고·경고 오버레이·반사탄 적중 범위 검사도 통과했다.

브라우저 검증: 로컬 쉬운 게임의 별도 테스트 슬롯에서 두 단발 과제를 직접 준비하고 보라색/흰색 링·몬스터·설명 배치를 확인했다. 실제 keydown/keyup(Q 및 E 탭)을 게임 이벤트 처리기에 전달하여 엔진의 발사·패링·반사탄 이동·몬스터 사망·과제 완료까지 각각 통과했다. 과제 진입 및 링 중간 상태는 검증 도구로 준비했으며, 새 게임부터 전체 튜토리얼을 수동 플레이한 검사는 아니다.
