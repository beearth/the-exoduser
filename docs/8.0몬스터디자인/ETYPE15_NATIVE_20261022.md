# ETYPE-C15 고정 원본 대조표

기준: INTEG5 `godot/source_snapshot/game.html`, SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. 기존 몬스터_총관리.md의 “2~3”은 원본과 달라 2로 정정한다.

|순서/원본|항목|값/공식|
|---|---|---|
|31119–31363|constructor|stage0, diff5 일반: lv=max(1,P.lv), HP=floor(curve×2.925/(1+min(9,max(0,lv-1))/18)); curve=0.4lv³+199lv+100 (lv≤500), 아니면 50000000×1.0014^(lv-500). ATK=floor((50+1.95lv)×0.6)|
|30847/31138|speed|(max(.2,.45×1.3)+U×.08)×1.5; baseSpd 동일|
|30859/31140|radius|(12+U×2)×2×elite.scaleMul|
|31164/31183|poise/shield|poise=maxPoise=constructor HP; eShield=eShieldMax=HP|
|31165–31212|초기 상태|idle; st2=30+U×50; facing=U×2π; projT=180+U×120; projCd=240; _splitDone=false; reviveIframes=0|
|42792|분열 조건|etype===15 && !_splitDone; 치명 hurtE 중 PCI-09 consumer|
|42793–42795|수/위치|정확히 2회; i=0,1: angle=πi+U, distance=18+U×8; (x+cos(angle)distance,y+sin(angle)distance); mkEn(stage,15,false,parent.el,parent.room). canMv radius10 실패 시 safePt, 없으면 해당 자식 skip|
|42796|constructor 실패|ne==null이면 그 자식 continue|
|42797|분열체 변경|hp=~~(constructor.hp×.35); mhp=hp; eShield=eShieldMax=0; r=max(5,~~(parent.r×.6)); speed*=1.3; _splitDone=true. poise/maxPoise/baseSpd/atk는 constructor 값 유지|
|42798|등록/FX|ens.push(ne) 다음 addParts(ne.x,ne.y,parent.col,6); 다음 자식 난수는 FX 이후|
|42800|표현|분열! 위치(x,y−15), 색 #7b5b3b, 30f|
|PCI-09/PCI-11|사망 순서|PC 사망 확정→분열 consumer→최종 사망 단회→기존 속성장판/물약/rollDrop/addExp. 별도 Mac 보상 writer 없음|
|분열체 사망|재분열|_splitDone=true로 consumer 불필요; 일반 hurtE 사망/보상 각 1회|

## 구현 연결

|경로|역할/경계|
|---|---|
|native_demo11_etype15_spawn.gd|stage0/diff5 etype15 constructor·분열 consumer 본문. 자연 일반/매직1(M29/M30) admission; 자식은 같은 원본 elite selector→속도→반경→literal 난수 순서. stage/diff 확장 없음|
|native_demo11_etype15_actor.gd|전용 normal hurtE owner 상속; `_splitDone` 실제 readback 추가. 자식 포이즈는 축소 HP가 아닌 constructor HP. 비치명 PCI09 NOT_READY 해제 확인|
|enemy_factory.gd / main.gd|etype15 등록과 request_native_etype15_spawn; 기존 PC 구현 수정 없음|
|native_natural_enemy_base.gd|자연 etype15 분기 + 승인된 분열체 prepare/admit. 원본 생성 순서 유지|
|native_stage_spawn_adapter.gd|부모 Marker origin을 자식에 연결. 요청 위치→원본 radius10 canMv/safePt/null 순서. 예정 분모 증설0|
|World 기존 register_summoned_enemy|등록 직후 기존 `_bind_pcib_actor`→PCI02 호출. C15는 기존 dedicated owner API이므로 NOT_REQUIRED, type3 binder 복제/이중호출0|
|native_demo11_pcib_death_effects.gd|etype15_death_split consumer 등록. PC 실행자가 consumer 뒤 PCI11 단회 발행. Mac HP/보상/최종 사망 writer 추가0|

원본 공통 일반몹 사망은 42633 부활 roll(50%)에 따라 `revival_pending`일 수 있다. 이 경우 최종 사망으로 위장하지 않는다. 테스트는 `_revived=true`라는 단위 소유 입력으로 최종 사망 분기를 선택하며 제품 부활 확률/필드는 변경하지 않는다.

|검수|결과|
|---|---|
|고정 원본 oracle|원본 mkEn 함수·배열과 원본 분열 블록을 Node VM에서 직접 실행. lv1/99/100/500/501/1000 일반 constructor 및 분열체 필드 oracle 대조|
|test_demo11_etype15_runtime|151 checks / 0 failures. 실제 Main·fixture Marker 생성→nonlethal hurtE→lethal→2자식 등록→각 자식 lethal→kill 증가 정확히3→동일 token replay 보상0. PCI09→PCI11 순서 검증|
|기존 etype-b|1회 42 checks / 2 failures / ERROR0. 기존 검사 “type8 사망 owner 없음”, “deadPool owner 없음”이 이미 인수된 PCI09/PCI10을 거부한다고 기대하여 실패. 검사/PC 코드 우회 수정0|
|기존 etype-f|1회 33 checks / 0 failures / ERROR0|
|pcib_mac_calls|1회 31 assertions / 0 failures / ERROR0. Mac 테스트의 etype15 등록 기대값만 현행 APPLIED로 갱신|
|기존 etype-c|지정 baseline에 파일/등록 없음. 기존 suite 실행했다고 주장하지 않음; 신규 C15 suite로 검수|

## 남은 범위

- 분열 라벨(원본 42800)의 UI 표현과 charged projectile consumer는 미이식. 라벨을 개발 상태 문구로 대체하지 않음. 해당 투사체 발사 시 actor가 명시 HOLD하며 잘못된 탄종을 만들지 않는다.
- 빙결/DOT lifetime·일반몹 재부활 재스폰은 기존 PC/공통 owner의 미이식 경계를 유지한다. 부활 성공·완전한 전투/전체 게임 완료를 주장하지 않는다.
- 스냅샷/game.html·PC 전투 코어·PC 계약·PC 테스트·번역 목록·맵 비주얼/geometry 수정0.
- 원본 addParts(6)는 기존 World 공유 RNG FX를 다음 자식 전에 실행하며 인수된 파티클 풀 cap/highFPS 정책을 유지한다.
- E2E storage=on 결과는 아래에 단회 결과로 기록한다.


## E2E 단회 (2026-10-22)

`test_demo11_47h_e2e.gd -- --demo11-storage=on`: PASS13 / NOT_READY5 / FAIL0, exit0·ERROR0. 피해·사망·탄 주입0. 기존 fieldBoss HP/최종사망 및 보스 prefix/PCI11 미준비 경계를 우회하지 않았다. 전체 연속 클리어 PASS가 아니다. 상세 로그/요약은 `~/exoduser-wt/_out/ETYPE-C15/e2e.log`, `e2e-summary.json`.

### MAP PRODUCTION REPORT (admission 한정)

|항목|결과|
|---|---|
|STAGE|CH1-1; 맵 제작/비주얼 변경0|
|MASTER / OUTER MASS / LARGE / MEDIUM / GROUND / LANDMARK|기존 승인 맵 보존; 변경0|
|PLAYABLE|부모 Marker provenance를 자식에 인계; source 위치/radius10 검사·safePt·null 보존|
|CAMERA QA|START/EARLY/ARENA/SIDE/LANDMARK/LATE/EXIT 시각 검수 수행 안 함; headless 검사를 visual PASS로 대체하지 않음|
|TECH QA|실제 Main World 등록·Marker origin·split 위치/수치·PCI09/PCI11·보상 단회151/0; E2E13/5/0|
|FILES|stage visual/collision/assets0, adapter admission 추가만; 타 작업 변경0|
|GIT|본 작업 경로만 stage/commit, 전용 브랜치 비강제 push; main/deploy0|
|VISUAL VERDICT|RETOUCH — 맵 visual 판정은 미수행, 분열 라벨 남음|
|NEXT PASS|분열 라벨/투사체 및 공통 부활 재스폰 owner 인수 후 해당 전투·시각 검수|

R 명령 경로 누락으로 문서2개를 한 차례 잘못 썼으나 코드 쓰기 전 중단했고, 신규 문서는 worktree로 이동, 기존 문서는 시작시 clean HEAD byte로 복원했다. R tracked diff0 재확인. 이후 모든 mutation은 worktree PWD를 검사했다. 사용자 실제 저장 폴더·PID81277 접근/종료0. 최종 자기 Godot 종료 확인.

최종 tick 검토에서 상태 필드 목록은 const로 올리고 kb 사전은 x/y를 제자리 갱신하여 C15가 매 tick 새 목록/사전을 만들지 않게 했다. E2E 단회 후 이 할당 정리만 수행했고 최종 C15 suite를 재확인한다(E2E 추가 실행0).
