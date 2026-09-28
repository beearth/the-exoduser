# WASD 시작·좌우클릭 처치 과제·연습 사망 연출

| 항목 | 현재 구현 |
|---|---|
| 적용 | `parry-lesson.js`, 일반 `game.html`, `game-easy-test.html`. 기초 연습 상위 항목은 12개 유지 |
| 시작 | 활성 연습의 `phase==='intro'`에서 물리 `KeyW/KeyA/KeyS/KeyD` 중 하나가 들어오면 `beginPractice()` 실행. 기존 시작 버튼도 같은 함수 사용 |
| 시작 함수 | `active` 및 `phase==='intro'` 확인 후 `phase='practice'`, `cooldown=45`, `resetPose()`, 버튼 blur, render. 반복 입력으로 재초기화하지 않음. 시작 이벤트는 이후 기존 입력 처리로 전달되어 설정된 방향키라면 그대로 이동 |
| 시작 안내 | 버튼 `W / A / S / D 또는 클릭하여 시작`. 시작만으로 이동 미션 완료하지 않음. Q 등 다른 키는 시작 트리거가 아님 |
| 좌클릭 | `step=-2`, 기본공격 기검참으로 적 10마리 실제 처치하고 그중 적어도 1마리는 3타를 180틱(3초) 충전해 발사한 3단 검기로 처치. `leftKills>=10 && leftFullChargeKill`에서만 `leftClickDone` 및 기존 90틱 성공 전환. 10마리를 먼저 처치해도 3단 검기 처치 전에는 연습 지속, 표시 카운트는 10에서 고정 |
| 기본공격 설정 | 연습 동안 `P.activeLMBSk='kiSlash'`, `P.skills.kiSlash=Math.max(1,P.skills.kiSlash||0)`. 기존 고레벨 유지. 종료/건너뛰기 시 원래 좌클릭 선택과 스킬 객체 복구. 기검참을 비활성화하는 null 설정 제거 |
| 우클릭 | `step=-1`, 기본 우클릭 마법탄으로 별도 적 5마리 실제 처치. 동시에 최대 3마리를 유지하며 부족하면 보충. `rightKills` 0→5일 때만 `rightClickDone` 및 기존 90틱 성공 전환 |
| 공격 대상 생성 | 각 과제 진입 시 `spawnAttackEnemies()`. `mkEn(...,G.stage,0,false,EL.P,-1)`로 etype0 생성. HP/mhp1, atk0, elite0, mods[], spd0. `_lessonEnemy=true`, `_lessonStage=현재 step` |
| 생성 위치 | 플레이어 기준 좌클릭 반경120px, 우클릭220px. 각 과제에서 동시에 최대3마리 유지. 좌클릭 10처치·3단 검기 처치, 우클릭 5처치까지 각각 부족한 대상을 보충. 최대48회 시도, 좌클릭 시도 각도에는 `leftKills` 회전 오프셋을 더함. mkEn 안전 보정 후450px 밖·생성 실패·기존 과제 적과40px 미만 겹침 제외. 좌클릭 완료 시 남은 연습 적 제거 후 우클릭 대상 생성 |
| 대상 격리 | `attackEnemies` 배열에 들어 있고 `_lessonStage`가 현재 과제인 살아 있는 연습 적만 인정. 시작 및 종료에서 목록 초기화. 일반 전투 적은 연습 중 피해 차단 유지 |
| 기본공격 판정 | `hurtE`에서 `ang,opts`를 연습 `hurtEnemy`에 전달. `step=-2`에서 기검참 검기 `updateCrescents()`의 `_lessonAttack='kiSlash'` 또는 동반 근접 타격(`P.s==='wSwing' && _lessonAttack==='weapon'`) 인정. 3단 검기 처치 조건은 실제 검기 적중 시 `c.step===3 && c.chargeScale>=2.2-1e-6`로 전달한 `_lessonFullCharge`만 인정하고 근접 타격은 제외. 검기는 현재 휘두르기 상태가 끝나도 인정. 기존 검기 피해·속도·거리·소모값 유지 |
| 마법 판정 | `step=-1`, `opts.magic&&opts.fireball&&!opts._fromTurret&&!opts.dot`. 시전 종료 뒤 날아온 탄도 인정. 허공 공격·단순 시전·포탑·잘못된 공격·이전 과제 대상은 미인정 |
| 진행 표시 | `updateAttackPractice()`가 좌클릭 `처치 N/10 · 3단 차징 검기 처치 N/1`, 우클릭 `처치 N/5`를 각각 안내. 좌클릭 3타 홀딩 중에는 `P._kiChargeT/180`을 이용한 0~100% 진행 게이지와 0~3단 표시. 체크리스트는 좌클릭 10마리+3단 차징, 우클릭 5마리 |
| 사망 공용 호출 | 처치 즉시 hp0/alive=false 이후 `deathFX(x,y,r,col,false,false,etype)`로 사망음/VFX, `_addCorpse(e,killAng,power)`로 시체, `_addGorePiece(x,y,'flesh')`1회, `_addDeathImpact(x,y,r)`1회 |
| 시체 방향/세기 | 전달된 유한 ang 우선, 없으면 플레이어→적 방향. power=`min(8,dmg/max(1,e.mhp)×20)`. 공용 시체 함수의 그래픽 설정·풀/물리 정책 유지 |
| 분노 처치 | 기초 `step=7`, `P.s==='gSlamWindup'`에서 기존 연습 적 처치 허용. 위 공용 사망 연출을 추가하고 기존 fire 폭발 반경100/72틱 및 주황 파티클24개 유지. 공격 과제 카운트와 분리 |
| 보상/중복 | 일반 hurtE의 보상 분기로 들어가지 않음. 경험치·전리품·G.kills/스테이지 처치 수 지급 없음. alive를 먼저 내려 동일 적 반복 히트의 처치/사망 연출 중복 차단 |
| 캐시 | 기검참 적용 당시 `20260913-kislash-basic1`; 현재 패링 링·반사 처치 버전은 [단발 패링 문서](PARRY_SHOOTER_PRACTICE_20260913.md) 참조. 자원 실습의 현재 버전은 [자원 실습 문서](RESOURCE_PRACTICE_20260912.md) 참조 |
| 자동 검증 | WASD4키 시작/다른 키 차단/반복 초기화 방지, 좌클릭10처치+3단 검기 실제 처치 및 우클릭5처치, 좌·우클릭 대상 재보충·단계 전환 시 잔여 대상 제거, 일반 10처치만으로는 미완료, 허공·잘못된 공격·포탑·중복 처치 제외, 시전 종료 후 마법/기검참 인정, 기초15처치 및 분노24처치의 사망음/시체/혈흔 호출 검사. 양쪽 HTML의 실제 updateCrescents를 실행해 3단 출처·적중 집계·중복 방지·원래 좌클릭 선택/스킬 레벨 복구 확인 |
| 브라우저 검증 | 기존 좌/우3처치·분노24처치 기록은 이전 규격. 2026-09-28 로컬 Chrome에서 좌클릭 단계 화면을 열어 10처치·3단 검기 0/1·차징 게이지·대상 3마리의 표시와 패널 내 가독성 확인. 우클릭 5마리 체크 문구도 1920×1080 브라우저에서 확인. 10처치+3단 검기 및 우클릭 5처치 판정은 양쪽 HTML 자동 검증 통과. 전체 과정을 실제 마우스로 끝까지 플레이한 검수는 아직 수행하지 않음 |

자원 실습의 최신 Q/E/Shift 묶음 안내와 관련 캐시는 [RESOURCE_SKILL_SETS_20260913.md](RESOURCE_SKILL_SETS_20260913.md)를 따른다.
