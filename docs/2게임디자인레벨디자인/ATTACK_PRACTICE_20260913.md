# WASD 시작·좌우클릭 처치 과제·연습 사망 연출

| 항목 | 현재 구현 |
|---|---|
| 적용 | `parry-lesson.js`, 일반 `game.html`, `game-easy-test.html`. 기초 연습 상위 항목은 11개 유지 |
| 시작 | 활성 연습의 `phase==='intro'`에서 물리 `KeyW/KeyA/KeyS/KeyD` 중 하나가 들어오면 `beginPractice()` 실행. 기존 시작 버튼도 같은 함수 사용 |
| 시작 함수 | `active` 및 `phase==='intro'` 확인 후 `phase='practice'`, `cooldown=45`, `resetPose()`, 버튼 blur, render. 반복 입력으로 재초기화하지 않음. 시작 이벤트는 이후 기존 입력 처리로 전달되어 설정된 방향키라면 그대로 이동 |
| 시작 안내 | 버튼 `W / A / S / D 또는 클릭하여 시작`. 시작만으로 이동 미션 완료하지 않음. Q 등 다른 키는 시작 트리거가 아님 |
| 좌클릭 | `step=-2`, 기본공격 기검참으로 적 3마리 실제 처치. `leftKills` 0→3일 때만 `leftClickDone` 및 기존 90틱 성공 전환 |
| 기본공격 설정 | 연습 동안 `P.activeLMBSk='kiSlash'`, `P.skills.kiSlash=Math.max(1,P.skills.kiSlash||0)`. 기존 고레벨 유지. 종료/건너뛰기 시 원래 좌클릭 선택과 스킬 객체 복구. 기검참을 비활성화하는 null 설정 제거 |
| 우클릭 | `step=-1`, 기본 우클릭 마법탄으로 별도 적 3마리 실제 처치. `rightKills` 0→3일 때만 `rightClickDone` 및 기존 90틱 성공 전환 |
| 공격 대상 생성 | 각 과제 진입 시 `spawnAttackEnemies()`. `mkEn(...,G.stage,0,false,EL.P,-1)`로 etype0 생성. HP/mhp1, atk0, elite0, mods[], spd0. `_lessonEnemy=true`, `_lessonStage=현재 step` |
| 생성 위치 | 플레이어 기준 좌클릭 반경120px, 우클릭220px. 최대24회 시도하여3마리. 시도 i의 각도 `−π/2+(i%3−1)×0.65+floor(i/3)×π/4`. mkEn 안전 보정 후450px 밖·생성 실패·기존 과제 적과40px 미만 겹침 제외 |
| 대상 격리 | `attackEnemies` 배열에 들어 있고 `_lessonStage`가 현재 과제인 살아 있는 연습 적만 인정. 시작 및 종료에서 목록 초기화. 일반 전투 적은 연습 중 피해 차단 유지 |
| 기본공격 판정 | `hurtE`에서 `ang,opts`를 연습 `hurtEnemy`에 전달. `step=-2`에서 기검참 검기 `updateCrescents()`의 `_lessonAttack='kiSlash'` 또는 동반 근접 타격(`P.s==='wSwing' && _lessonAttack==='weapon'`) 인정. 검기는 현재 휘두르기 상태가 끝나도 인정. 기존 검기 피해·속도·거리·소모값 유지 |
| 마법 판정 | `step=-1`, `opts.magic&&opts.fireball&&!opts._fromTurret&&!opts.dot`. 시전 종료 뒤 날아온 탄도 인정. 허공 공격·단순 시전·포탑·잘못된 공격·이전 과제 대상은 미인정 |
| 진행 표시 | `updateAttackPractice()`가 제목 및 hint 리프 노드에 현재 공격·`처치 N/3` 안내. 체크리스트도 좌/우클릭 각각 적3마리 처치 표시 |
| 사망 공용 호출 | 처치 즉시 hp0/alive=false 이후 `deathFX(x,y,r,col,false,false,etype)`로 사망음/VFX, `_addCorpse(e,killAng,power)`로 시체, `_addGorePiece(x,y,'flesh')`1회, `_addDeathImpact(x,y,r)`1회 |
| 시체 방향/세기 | 전달된 유한 ang 우선, 없으면 플레이어→적 방향. power=`min(8,dmg/max(1,e.mhp)×20)`. 공용 시체 함수의 그래픽 설정·풀/물리 정책 유지 |
| 분노 처치 | 기초 `step=7`, `P.s==='gSlamWindup'`에서 기존 연습 적 처치 허용. 위 공용 사망 연출을 추가하고 기존 fire 폭발 반경100/72틱 및 주황 파티클24개 유지. 공격 과제 카운트와 분리 |
| 보상/중복 | 일반 hurtE의 보상 분기로 들어가지 않음. 경험치·전리품·G.kills/스테이지 처치 수 지급 없음. alive를 먼저 내려 동일 적 반복 히트의 처치/사망 연출 중복 차단 |
| 캐시 | 양쪽 HTML의 `parry-lesson.js` 버전 `20260913-kislash-basic1`. resource-practice는 `20260913-resource-sets1` |
| 자동 검증 | WASD4키 시작/다른 키 차단/반복 초기화 방지, 기본공격·마법 각각3처치, 허공·잘못된 공격·포탑·중복 처치 제외, 시전 종료 후 마법/기검참 인정, 기초6처치 및 분노24처치의 사망음/시체/혈흔 호출 검사. 양쪽 HTML의 실제 updateCrescents를 실행해 적중 집계·중복 방지·원래 좌클릭 선택/스킬 레벨 복구 확인 |
| 브라우저 검증 | 실제 hitArc와 기본 마법 발사/update로 좌/우3처치·다음 단계 진행 확인. 분노 activateGiantSlam에서 연습 적24마리 사망·시체24개 생성·G.kills 증가0 확인. 기검참 판정은 원본 updateCrescents 자동 검사로 검증 |

자원 실습의 최신 Q/E/Shift 묶음 안내와 관련 캐시는 [RESOURCE_SKILL_SETS_20260913.md](RESOURCE_SKILL_SETS_20260913.md)를 따른다.
