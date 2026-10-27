# C04-ORACLE-2 조사 메모 (작업 중, 2026-10-27) — 웹 코드에서 읽은 규칙

> 상태: **코드 읽기만 끝났고 추출 스크립트·JSON 산출은 아직 없다.** 이어서 `tools/c04-oracle/extract-progress.mjs`를 만들어 `ch1_1_progress.json`·`ch1_1_run.json`·`ch1_1_boss.json`을 뽑는다. 줄 번호는 `origin/main` 커밋본(cc898c690 이후, 2026-10-27 오전) 기준이며 **추출 때 receipt에 다시 기록**한다(main이 움직이면 줄이 밀린다). 이 메모의 사실은 모두 커밋본 game.html에서 읽은 것이다.

## 0. 먼저 고칠 것 (이미 push된 README 오류)
- README §1·§4에서 `etype29 (100,8)`을 "보스방 중앙"이라 적었는데 **틀림**. 그 적은 **문지기(Gate Guardian, `G._gateGuard`)**다: `initStage`가 `_ggTx=G._bossCx(100), _ggTy=G._gateY+3(=8)`에 etype `[29,39,49,59,69,79,89][hell]`(1-1은 29)를 `mkEn`, hp×4·atk×2·r×1.4·poise80·elite3·`_isGateGuard`. 호위 엘리트 4~6마리(반지름 55px 원) + 외곽 일반 8~12마리(반지름 100~180px)를 `canMv` 통과하는 칸에만 둔다 → 초기 적 중 무작위 11~15마리가 이것이다(`initStage` 줄 31615~31650대). README 정정은 이번 단위 README 개정 때 함께.

## 1. C04-3 규칙 (진행·클리어·게이트)

### 소환굴 (`update()` 줄 35641~35697)
- `_gameFrame<120`이면 트리거 차단. 플레이어와 2000px(제곱 4,000,000) 안으로 오면 `h._triggered=true` → 연출 지연 90프레임 → 총량 `_spawnHoleCount(size,si)`만큼 **순차 소환**, 간격 `~~(900/총량)`에 커브(초반 0.6× → 중반 1.4× → 후반 0.3~0.8×). 전부 소환하면 `G.spawnHoles.splice`로 **굴 제거**(파괴 조건 아님, 소환 완료=제거). 생존 적 `G._aliveEns>=700`이면 소환 대기.
- 총량 `_spawnHoleCount(size,si)` (줄 31033): 크기 type S(≤.3)/M(≤.5)/L; `SPAWN_HOLE.cnt={S:50,M:100,L:100}`; **1-1(si===0)은 `ceil(ceil(base*.5)*.3)`** → S=8, M=15, L=15.
- 소환 위치: 굴 중심에서 `120+rand*300+size*150` px 반경 무작위, `isW` 막히면 30회 재시도 후 나선 탐색, 최종 실패 시 굴 중심. 몹은 `mkEn(x,y,si,rollEtype(si),false,undefined,h.room)`(무작위 etype).

### 지역(4분면) 클리어 (`_regionInit` 줄 60700, `_regKill` 60731, `_regionCheckClears` 60769, `_regionTick` 60781)
- 200×200 필드(한 변 ≥180)만 지역 분할. 중앙 (100,100)을 경계로 0=NW·1=NE·2=SW·3=SE (1-1 이름 `_REG_CH1_KO=['북서 · 어둠','북동 · 번개','남서 · 물','남동 · 불']`).
- 지역 total = 그 지역에 있는 소환굴들의 `_spawnHoleCount` 합(소환굴 확정 뒤 `_regionInit`에서 계산). 킬 귀속 = **스폰 위치**(`e._homeX/_homeY`, 없으면 사망 위치) 기준, **보스(`e.ib`) 제외**(`_regKill`은 모든 사망 경로에서 호출).
- 지역 클리어 조건(15프레임마다 검사): `(kills/total + 문지기보너스) ≥ 0.8(_REG_CLEAR_RATIO)` **그리고** 담당 앵글러(필드보스) 생존 아님(`_regionFbAlive`). 문지기 보너스 0.10은 `G._gateGuardKilled`이고 그 지역이 `G._regGateIdx`일 때만 더해진다. `_regGateIdx=(gty<100?0:2)+(gtx<100?0:1)`에 문지기 좌표 (100.5, 8.5)를 넣으면 **NE=1**(x=100.5는 100 미만이 아니므로). total 0이고 앵글러도 없는 지역은 시작 때 조용히 클리어.
- 지역→앵글러(필드보스) 매핑: `_FB_SITES=[[58,158],[148,150],[52,42],[148,42]]`(SW물/SE화/NW암/NE뇌), `_REG_FB_TO_REG=[2,3,0,1]`.

### 필드보스(심연의 앵글러, 1-1 전용) (`_fbTick` 줄 61050, `_fbTickOne`, `_fbMarkDead` 61039)
- `initStage` 직후 첫 `_fbTick`에서 4마리 생성(`_FB_COUNT=4`, `_fbMk`: hp `_fbHp(P.lv)=~~((1800+lv*350)*_FB_HP_MUL)`, r=120, asleep), 플레이어가 `_FB_WAKE=1000`px 안으로 오면 깨어남. 4마리 다 죽으면 `G._fbDone=true`.
- 데미지 경로: `_fmApply(m,dmg,true)`(줄 18702, `hitCd` 8프레임). 테스트 훅에서 `fb.hitCd=0` 후 큰 값 적용.

### 지옥문(=보스방 입장) 개방 (`checkRooms` 줄 41871~41895)
- `!G._bossArena && G.bossAlive && !G._bossUnlocked`일 때 30프레임마다: `_krakenOk = (G.stage!==0 || G._fbDone)`, 지역이 있으면 `_krakenOk && _regionClearedCount()>=4` → `G._bossUnlocked=true`(문구 "지옥문이 열렸습니다"). 지역이 없는 맵은 구 규칙(처치율+문지기 0.1 ≥ 0.8).
- **결정적:** 1-1의 "EXIT 열림" = 4지역 클리어 **그리고** 앵글러 4마리 처치.

### 출구 타일 (EXIT) 입장 (`checkRooms` 줄 41896~41924)
- `!G.stageCleared && G.exits.length>0 && G._bossLoadPhase<=0`에서 플레이어 타일이 `G.exits` 중 하나와 **정확히 같은 타일**이면(`ptx===ex.x&&pty===ex.y`): 던전(`G.bossAlive&&!G._bossArena`)이면 — 1-1에서 `!G._fbDone`이면 입장 차단(문구 "심연의 앵글러를 모두 처치하라"), `!G._bossUnlocked`이면 차단(문구 "지옥문이 봉인됨 — 지역 클리어 n/4"), 아니면 `G._bossLoadPhase=1` → 아레나 로딩.
- 로딩 상태 머신(`checkRooms` 줄 41787~41815): phase1 페이드아웃 50프레임(`_bossLoadT/50`, 1이 되면 `_enterBossArena()`) → phase2 네임카드 130프레임 → phase3 페이드인 50프레임 → phase4 입장 연출 100프레임(보스 `stunned=90`, `reviveIframes=110`) → 0.
- 보스 게이트(`boss_gate_col`, 타일 (99~101,5), 맵값 3): 1-1에서는 **절대 열리지 않는다**(MAP_OBJS에서 지우는 코드 없음, `G.bossGateOpen`은 처음부터 `true`이고 문지기 처치 때 다시 `true`로 세팅만). 출구 타일(y=7)이 게이트(y=5) **앞**이라 게이트는 길목 장식·충돌이고 입장은 출구 타일 밟기다. 즉 C04의 "게이트 열림" 사건은 `_bossUnlocked` 하나뿐.
- START 북쪽 게이트: `_applyCh1StartNorthGate(map,mw,mh)`(줄 30024) = `bossCx=100,gateY=5,exitY=7`, x88..112·y2..35 영역을 전부 0으로 파고, (99..101,5)=3(게이트), (99..101,7)=2(출구). `genFromTemplate` 줄 30502에서 `si===0&&(_MAP_COMPOSE[0].forestBoundary||_DIABLO_FIELD_QA)`일 때 적용(1-1은 forestBoundary).

## 2. C04-5 규칙 (보스 아레나)

- 아레나 생성 `genBossArena(si)`(줄 30700): 128×108, 외곽 전부 벽(1) 위에 **1-1은 `_BOSS_ARENA_TYPE[SI_TO_HELL[0]]=0` = 원형 투기장**(`il=it=2, ir=126, ib=106`, 반지름 `rr=min(ir-il,ib-it)/2-1 = min(124,104)/2-1 = 51`). `cx=64, cy=54`. 진입 지점 하단 중앙 `entY=ib-3=103`(x=cx±3, y=entY-2..entY+1을 바닥 4로 열어 둠), 보스 스폰 `bossY=cy`(정중앙, 7×5 바닥 확보), **출구** `exitY`는 `cx` 열에서 위에서부터 첫 바닥(4) 바로 위 벽 타일(`exitY=y-1`), `exitX=cx`, 출구 타일은 **벽으로 유지**(보스 사망 시 뚫림). 벽에 인접한 바닥은 5(경계 룬). 반환 `{map,mw,mh,rooms:[{x:2,y:2,w:124,h:104,cx,cy,type:'boss'}],exitX,exitY,entryX:cx,entryY:entY,bossX:cx,bossY}`.
- 진입 `_enterBossArena(retry)`(줄 30752): 던전 백업 `_preArenaBackup`(사망 시 게이트 입구 리스폰용), 던전 잔여 몹을 킬로 카운트, `ens=[]`, `MAP_OBJS=[]`, `G.map=arena.map`(`G.mw=128,G.mh=108`), `G.exits=[]`, `G._bossArena=true`, `G._bossArenaExit={x:exitX,y:exitY}`, `G._bossArenaGate` 동일, `G._bossArenaEntry={x:entryX,y:entryY}`, `G.bossSealed=true`, **플레이어 `P.x=(entryX+.5)*T, P.y=(entryY+.5)*T`**, 보스 `mkEn((bossX+.5)*T,(bossY+.5)*T,si,0,true,STG[si].be,0)`(`ens.push`), `G.bossAlive=true`.
- 보스 사망 후 (`checkRooms` 30프레임 주기, 줄 41820~41860): 보스·부활대기 보스 없으면 `G.bossAlive=false`, 보물상자 월드아이템을 보스방 중앙 `(bossRoom.cx+.5)*T`에 푸시, **아레나 출구 뚫기**: `G.map[exitY][exitX]=0`(양옆 1칸도 벽이면 0) → 3타일 폭, `G.exits.push({x:exitX,y:exitY})`, `buildMapCache()`.
- 아레나 출구 타일 밟기 → `G.stageCleared=true` (보스 사망 `!G.bossAlive` 상태에서) → 클리어 패널(`_showClearResult`)·`P.sp+=10`. 다음 단계는 클리어 패널 버튼 → `nextStage()`(줄 43899): `G.stage++`(챕터 마지막 스테이지면 다음 챕터 `startSi`), `initStage(G.stage)`. 데모(`_DEMO_MODE && G.stage===_DEMO_LAST_STAGE`)는 종료 화면.
- 사망/재도전: `_enterBossArena(true)`(줄 17087 호출), 던전 복귀 좌표는 `_preArenaBackup` + `G._bossEntY=_gateY-2+.5`. (이 부분은 아직 코드 미확인 — 보스방 사망 리스폰 규칙이 C04-5 범위인지 맵 총괄에 물을 것.)

## 3. 한 판 진행 기록(`ch1_1_run.json`) 설계 — 구현 계획
1. 부팅: extract.mjs와 같은 route(커밋본) + `window._btFramePause=true`(원래 loop 틱 정지) + `G._cutsceneDone=true; if(!P)P=mkP(); G.stage=0; initStage(0); G.on=true; G.paused=false`. 진행은 `update()`를 직접 호출해 프레임을 센다(`_gameFrame`은 update 안에서 증가).
2. 안전 훅: 매 프레임 `P.hp=P.mhp; P.iframes=999`(사망·피격으로 진행 끊기지 않게 — 이것이 테스트 훅임을 receipt에 적는다).
3. 진행: 각 소환굴 위치로 `P.x/P.y` 순간이동 → `update()` 반복(굴이 트리거·소환 끝나 제거될 때까지, 상한 프레임) → 살아 있는 일반 적을 `hurtE(e,1e9,0,true)`로 처치(`_regKill`·`_stageKills`·문지기 분기가 정상 경로로 돈다). 문지기는 `G._gateGuard`를 같은 식으로 처치. 앵글러 4마리는 근처로 순간이동해 깨운 뒤 `_fmApply(fb,1e9,true)`(`fb.hitCd=0`).
4. 사건 로깅(30프레임 단위 + 상태 변화): `{frame, sec=frame/60, event}` — 지역 i 클리어(`R[i].cleared`), 문지기 처치(`_gateGuardKilled`), 앵글러 사망(`_fbAliveCount`), `_fbDone`, `_bossUnlocked`, 소환굴 제거(`G.spawnHoles.length` 감소), 보스 로딩 phase 1~4, `G._bossArena`, `G.bossAlive=false`, 아레나 출구 뚫림, `G.stageCleared`. 각 사건에서 `G.map` 스냅샷과 비교한 **막힘→걷기/걷기→막힘 타일 목록**을 같이 기록(5프레임마다 40,000칸 비교로 충분).
5. 아레나: 진입 후 `G.mw/G.mh/G.rooms/G._bossArenaEntry/Exit/P위치/보스 위치/map 해시`를 덤프하고 아레나 걷기 격자(128×108, 같은 `isW`)와 보스 사망 뒤 출구 뚫린 타일 목록. 보스는 `hurtE` 반복(부활 단계 있음, 상한 두고).
6. 무작위(소환 위치·etype·문지기 호위)가 있으니 **2~3회** 돌려 사건 순서·시각 범위를 적는다. 사건 순서가 같아야 한다(지역 클리어 순서는 순간이동 순서에 의존하므로 순서 자체는 정답이 아니라 "4개 모두 + 앵글러 4 + 문지기" 집합이 정답).

## 4. compare.mjs 확장 (명세 §2 마지막 줄)
- Unity 입력에 `progress`(게이트별 열림 사건 순서·바뀐 타일: `{ "events": [{"name":"regionCleared","index":0}, ..., {"name":"bossUnlocked"}], "tilesChanged": {"bossUnlocked": [[tx,ty,0|1]...]} }`)와 `boss`(`{ "entry":[tx,ty], "bossSpawn":[tx,ty], "exitTile":[tx,ty], "arena":{"w":128,"h":108}, "arenaWalk": 128x108 }`) 항목 추가. 자기 시험: 동일 입력 차이 0 / 게이트 타일 1개 변경 시 그것만.
- 1-1에서 맵 타일이 **진행 중 안 바뀐다**면(위 코드 읽기로는 던전 쪽 타일 변화 없음 — 아레나 출구만 뚫림) 그 사실을 oracle로 못 박는다. 실제 로그에서 확인.

## 5. 마무리 체크리스트 (명세 §3~§6)
- README에 C04-3·C04-5 절 + §0의 정정. 맵 보드 §2.0 oracle 줄에 새 SHA·파일 추가(main, 경로 지정, 비강제 push; 임시 worktree에서 `checkout --detach origin/main` 후 cherry-pick 방식, 끝나고 reparse 확인 뒤 삭제).
- INBOX 짧은 항목 1개 main·unity/main(INBOX 파일만). 문구: "C04-3·C04-5 웹 정답 추가: 브랜치 claude/unity-pc-c04-oracle-20261027 <SHA>, docs/engine/c04_oracle/README.md §C04-3·§C04-5. 정본 보드: origin/main docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md §2.0".
- 보스전 총괄(`list_sessions`에서 "보스전 총괄")에게 `ch1_1_boss.json` 경로 한 줄.
- 보고(SPEC2 §6): SHA들, 게이트별 열림 조건 한 줄씩, 진행 사건 수·순서, 보스 진입·복귀 좌표, 자기 시험 결과, 웹 특이점, worktree 삭제 결과(이미 `pc-c04-notice-main/-unity` 삭제 완료, reparse 0).
