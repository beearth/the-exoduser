# QUESTNPC — CH1-1 게이트 가이드 pair의 HUD 복구 후보

실제 CH1-1 gate caller가 발화한 crow→cat pair에서 HUD callback이 throw하면 내부 pair는 이미 소비됐지만 다음 tick에도 이전 자막/배치가 남는다. 후보는 **실패한 HUD만 다음 활성 bubble tick에서 재시도**한다. 원 Error는 그대로 전파한다. pair 소비·UID·CD·우선순위·bubble 타이머·SFX 호출은 변경하지 않는다.

신규 10 case group PASS, 실제 fixture Node1회 exit0, productionApplied=false/runtimeAccepted=false. 이전 firstItem/urgent/mapQA/flag/CD/pair 통과 fixture 반복0. 같은 milestone의 실제 플레이 완료를 주장하지 않는다.

## 목표·권한·저장 영수증

- MILESTONE-CH1-1-PLAYABLE-20261002.md 처음부터 끝까지 읽고 정확 SHA256 `889fb16f97416a582818d6a93e49421e8eb704c11806ab50279fec9dc41b5a09` 확인했다.
- QUESTNPC 행의 기존 진행/펫 one-shot·중복/CD 연결, ITEM 획득/STORY·BOSS 진행/QA 실제경로 의존성을 적용했다. 새 대사·퀘스트·CD 정책0.
- 검사 당시 capacity hold로 메모리 stdin에서만 작업했다. 저장 전 STATE에서 Changes60, allowNewOwnedFiles=true, epoch `capacity-after-6a39b828-1212`, 역할당 저장1반복/최대2파일을 실제 확인했다.
- 소유는 이 새 폴더의 checks.mjs/result.md 두 파일뿐이다. 이전 산출·TASK·shared production/docs·Git/index·타팀 WIP·사용자게임/save·서버/빌드/audio장치 변경·실행0. 보호2_3/Q-only blackBean/attacktickets금지·LOCK·수치·저장 schema 보존.
- root checkpoint SHA는 STATE 제공 `6a39b828dda2332e482888609a81a05dfa2c1458`이며 개인 Git 검증0. 최신 HEAD를 개인 검증했다고 주장하지 않는다.

## 범위와 실제 관측

실제 full gate caller(main40506–40530/easy39308–39332, 실행 snapshot)의 region 경로를 호출했다. 합성 `G.stage=0`, `G._fbDone=true`, cleared-region count4, regions 존재, bossAlive true, arena false 조건이다. gate unlock 자체는 실제 source가 설정했고 addTxt/victory는 sink다. player lv501/full HP·MP·ST, dt를 명시하여 생존 재발화를 막고 기존 lv>500 return으로 gameplay tail을 생략했다.

gate source → actual urgent → actual say/HUD/SFX → crow240f/cat pair240f, UID boss_gate_open, ID CD1800f. 다음 update에서 dt240으로 실제 timer의 pair 전환을 발생시켰다. **초기 helper 수락은 HUD/SFX/pair 완료와 별개**이며 정상·예외를 따로 관측했다.

| 신규 group (양판 각각) | primary | 후보 및 assertion |
|---|---|---|
| pair textContent setter 예외 | cat 내부상태·pairFired=true/pair=null인데 HUD text는 이전 crow. 다음 tick에도 stale | 같은 Error identity 유지. 다음 tick에 cat text 복구, t239f/CD1559f, SFX 추가 호출0 |
| pair fontSize setter 예외 | text는 바뀌지만 side/style 완료 전에 throw; 다음 tick에 이전 왼쪽 배치 | 다음 tick 전체 HUD 재적용 → right20px, cat coords. bubble/CD/tier는 원본과 동등 |
| pair AudioContext.createOscillator 예외 | HUD 완료 후 오디오 throw | dirty=false. 원본과 다음 전체 snapshot 동등; SFX 재시도0 |
| 정상 gate→pair→후속 tick | HUD/SFX 정상 | 원본과 candidate 전체 snapshot deepEqual. 재호출 gate event는 gameplay latch로 중복0 |
| pending HUD 상태에서 bubble 종료/취소 | candidate pair fault 후 t0/pair null | 다음 tick dirty=false, opacity0. 만료 자막을 되살리지 않음 |

양판 ×5=10 group. 예외 직후 원본/candidate 전체 snapshot도 deepEqual(신규 dirty flag 제외)이며 동일 Error 객체가 전파된다. 실패 tick에서 pair t240f/CD1560f, 복구 tick에서 t239f/CD1559f. 복구 중 timer·UID/CD를 reset하거나 pair/SFX를 다시 실행하지 않는다. text/style 정상 control에 쓰인 dt240은 하니스가 지정한 시간 입력이며 브라우저 실제 프레임 간격이 아니다.

## 후보 계약

| 접점 | old | candidate |
|---|---|---|
| runtime helper state | HUD 실패 기록 없음 | module `let _petHUDDirty=false` 한 개. P/G/INV/세이브 필드 추가0 |
| _petBubbleShow | 예외 전파 후 부분 DOM 상태 | full 기존 body try/catch. throw 시 dirty=true 후 같은 Error rethrow. 성공 또는 subtitle 미존재 early return은 dirty=false |
| _updatePetBubble 활성 branch | 전환 뒤에는 fade만 갱신 | 기존 pair 전환 다음, fade 직전에 dirty&&t>0이면 현재 who/txt의 HUD만 재적용 |
| 완전 종료 branch | opacity0 | 먼저 dirty=false, 기존 hide 처리 유지 |
| normal/SFX-only fault | 기존 정책 | 동일. SFX 예외로 dirty를 세우거나 재시도하지 않음 |

새 dirty flag는 실패가 있는 경우에만 추가 HUD 호출을 만든다. 정상 핫패스는 boolean 분기 하나이며 신규 배열/closure/대사할당을 추가하지 않는다. _petBubbleShow의 기존 예외를 삼키지 않는다. persistent 실패는 다음 활성 tick에도 같은 Error를 전파할 수 있다. 제품의 전체 frame 회복을 보장하는 패치는 아니다.

### 채택 가능한 양판 patch

다음 unified diff는 실제 추출한 original/candidate 함수 body 전체다. production 적용0. root는 최신 소유 anchor와 mapQA WIP/다른 UI 변경을 확인해 순차 통합한다.

```diff
--- a/game.html
+++ b/game.html
@@ -9045,1 +9045,2 @@
 const _PET_OP_MAX=0.6;
+let _petHUDDirty=false;
@@ -9046,20 +9047,23 @@
-function _petBubbleShow(who,txt){
-  const _ps=$('petSubtitle');if(!_ps)return;
-  const _isCrow=who==='crow';
-  const _img=$('petPortrait'),_txt=$('petBubbleTxt');
-  if(_img)_img.src='img/'+(_isCrow?'crow':'cat_pet')+'/portrait.png?v=4';
-  if(_txt){
-    _txt.textContent=_padifyHint(txt);
-    // 프레임 내 텍스트박스 영역 (이미지 표시폭 480px→높이 320px 기준 px좌표)
-    if(_isCrow){_txt.style.left='92px';_txt.style.top='237px';_txt.style.width='306px';_txt.style.height='51px'}
-    else{_txt.style.left='122px';_txt.style.top='250px';_txt.style.width='190px';_txt.style.height='42px'}
-    _txt.style.fontSize='0.92rem';
-  }
-  // 까마귀=왼쪽, 고양이=오른쪽 (프레임 방향에 맞춤)
-  if(_isCrow){_ps.style.left='20px';_ps.style.right='auto'}
-  else{_ps.style.right='20px';_ps.style.left='auto'}
-  // 게임 전체 UI 스케일(--ui-scale = min(sw/1920, sh/1080))에 직접 연결 — HUD와 동일하게 창 크기 따라감
-  _ps.style.transformOrigin=_isCrow?'left bottom':'right bottom';
-  _ps.style.transform='scale(calc(var(--ui-scale) * 1.5))';
-  _ps.style.opacity=_PET_OP_MAX;
-}
+function _petBubbleShow(who,txt){
+  try{
+  const _ps=$('petSubtitle');if(!_ps){_petHUDDirty=false;return;}
+  const _isCrow=who==='crow';
+  const _img=$('petPortrait'),_txt=$('petBubbleTxt');
+  if(_img)_img.src='img/'+(_isCrow?'crow':'cat_pet')+'/portrait.png?v=4';
+  if(_txt){
+    _txt.textContent=_padifyHint(txt);
+    // 프레임 내 텍스트박스 영역 (이미지 표시폭 480px→높이 320px 기준 px좌표)
+    if(_isCrow){_txt.style.left='92px';_txt.style.top='237px';_txt.style.width='306px';_txt.style.height='51px'}
+    else{_txt.style.left='122px';_txt.style.top='250px';_txt.style.width='190px';_txt.style.height='42px'}
+    _txt.style.fontSize='0.92rem';
+  }
+  // 까마귀=왼쪽, 고양이=오른쪽 (프레임 방향에 맞춤)
+  if(_isCrow){_ps.style.left='20px';_ps.style.right='auto'}
+  else{_ps.style.right='20px';_ps.style.left='auto'}
+  // 게임 전체 UI 스케일(--ui-scale = min(sw/1920, sh/1080))에 직접 연결 — HUD와 동일하게 창 크기 따라감
+  _ps.style.transformOrigin=_isCrow?'left bottom':'right bottom';
+  _ps.style.transform='scale(calc(var(--ui-scale) * 1.5))';
+  _ps.style.opacity=_PET_OP_MAX;
+  _petHUDDirty=false;
+  }catch(e){_petHUDDirty=true;throw e}
+}
@@ -9159,23 +9163,24 @@
-function _updatePetBubble(){
-  // 쿨다운 감소
-  for(const k in _petDlgCD){_petDlgCD[k]-=_dtSp;if(_petDlgCD[k]<=0)delete _petDlgCD[k]}
-  for(let _ti=0;_ti<6;_ti++)if(_petTierCD[_ti]>0){_petTierCD[_ti]-=_dtSp;if(_petTierCD[_ti]<0)_petTierCD[_ti]=0}
-  // 말풍선 타이머
-  if(_petBubble.t>0){
-    _petBubble.t-=_dtSp;
-    // 메인 말풍선 끝 → 페어 발동
-    if(_petBubble.t<=0&&_petBubble.pair&&!_petBubble.pairFired){
-      _petBubble.pairFired=true;
-      _petBubble.who=_petBubble.pair.who;_petBubble.sourceTxt=_petBubble.pair.sourceTxt;_petBubble.txt=_petBubble.pair.txt;
-      _petBubble.mt=_petBubble.pair.mt;_petBubble.t=_petBubble.pair.mt;
-      _petBubble.pair=null;
-      // 자막 갱신 (페어 대사) + 후발 사운드
-      _petBubbleShow(_petBubble.who,_petBubble.txt);
-      _petSfx(_petBubble.who,false);
-    }
-    // 자막 페이드아웃 (표시 순간부터 전체 지속시간에 걸쳐 점점 흐려지며 사라짐)
-    if(_petBubble.t>0){const _ps=$('petSubtitle');if(_ps){const _r=_petBubble.mt>0?_petBubble.t/_petBubble.mt:0;_ps.style.opacity=(Math.pow(Math.max(0,Math.min(1,_r)),0.6)*_PET_OP_MAX).toFixed(2)}}
-  }
-  // 대사 완전 종료 시 자막 숨김
-  if(_petBubble.t<=0&&!_petBubble.pair){const _ps=$('petSubtitle');if(_ps&&_ps.style.opacity!=='0')_ps.style.opacity='0'}
-}
+function _updatePetBubble(){
+  // 쿨다운 감소
+  for(const k in _petDlgCD){_petDlgCD[k]-=_dtSp;if(_petDlgCD[k]<=0)delete _petDlgCD[k]}
+  for(let _ti=0;_ti<6;_ti++)if(_petTierCD[_ti]>0){_petTierCD[_ti]-=_dtSp;if(_petTierCD[_ti]<0)_petTierCD[_ti]=0}
+  // 말풍선 타이머
+  if(_petBubble.t>0){
+    _petBubble.t-=_dtSp;
+    // 메인 말풍선 끝 → 페어 발동
+    if(_petBubble.t<=0&&_petBubble.pair&&!_petBubble.pairFired){
+      _petBubble.pairFired=true;
+      _petBubble.who=_petBubble.pair.who;_petBubble.sourceTxt=_petBubble.pair.sourceTxt;_petBubble.txt=_petBubble.pair.txt;
+      _petBubble.mt=_petBubble.pair.mt;_petBubble.t=_petBubble.pair.mt;
+      _petBubble.pair=null;
+      // 자막 갱신 (페어 대사) + 후발 사운드
+      _petBubbleShow(_petBubble.who,_petBubble.txt);
+      _petSfx(_petBubble.who,false);
+    }
+    if(_petHUDDirty&&_petBubble.t>0)_petBubbleShow(_petBubble.who,_petBubble.txt);
+    // 자막 페이드아웃 (표시 순간부터 전체 지속시간에 걸쳐 점점 흐려지며 사라짐)
+    if(_petBubble.t>0){const _ps=$('petSubtitle');if(_ps){const _r=_petBubble.mt>0?_petBubble.t/_petBubble.mt:0;_ps.style.opacity=(Math.pow(Math.max(0,Math.min(1,_r)),0.6)*_PET_OP_MAX).toFixed(2)}}
+  }
+  // 대사 완전 종료 시 자막 숨김
+  if(_petBubble.t<=0&&!_petBubble.pair){_petHUDDirty=false;const _ps=$('petSubtitle');if(_ps&&_ps.style.opacity!=='0')_ps.style.opacity='0'}
+}
--- a/game-easy-test.html
+++ b/game-easy-test.html
@@ -8500,1 +8500,2 @@
 const _PET_OP_MAX=0.6;
+let _petHUDDirty=false;
@@ -8501,20 +8502,23 @@
-function _petBubbleShow(who,txt){
-  const _ps=$('petSubtitle');if(!_ps)return;
-  const _isCrow=who==='crow';
-  const _img=$('petPortrait'),_txt=$('petBubbleTxt');
-  if(_img)_img.src='img/'+(_isCrow?'crow':'cat_pet')+'/portrait.png?v=4';
-  if(_txt){
-    _txt.textContent=_padifyHint(txt);
-    // 프레임 내 텍스트박스 영역 (이미지 표시폭 480px→높이 320px 기준 px좌표)
-    if(_isCrow){_txt.style.left='92px';_txt.style.top='237px';_txt.style.width='306px';_txt.style.height='51px'}
-    else{_txt.style.left='122px';_txt.style.top='250px';_txt.style.width='190px';_txt.style.height='42px'}
-    _txt.style.fontSize='0.92rem';
-  }
-  // 까마귀=왼쪽, 고양이=오른쪽 (프레임 방향에 맞춤)
-  if(_isCrow){_ps.style.left='20px';_ps.style.right='auto'}
-  else{_ps.style.right='20px';_ps.style.left='auto'}
-  // 게임 전체 UI 스케일(--ui-scale = min(sw/1920, sh/1080))에 직접 연결 — HUD와 동일하게 창 크기 따라감
-  _ps.style.transformOrigin=_isCrow?'left bottom':'right bottom';
-  _ps.style.transform='scale(calc(var(--ui-scale) * 1.5))';
-  _ps.style.opacity=_PET_OP_MAX;
-}
+function _petBubbleShow(who,txt){
+  try{
+  const _ps=$('petSubtitle');if(!_ps){_petHUDDirty=false;return;}
+  const _isCrow=who==='crow';
+  const _img=$('petPortrait'),_txt=$('petBubbleTxt');
+  if(_img)_img.src='img/'+(_isCrow?'crow':'cat_pet')+'/portrait.png?v=4';
+  if(_txt){
+    _txt.textContent=_padifyHint(txt);
+    // 프레임 내 텍스트박스 영역 (이미지 표시폭 480px→높이 320px 기준 px좌표)
+    if(_isCrow){_txt.style.left='92px';_txt.style.top='237px';_txt.style.width='306px';_txt.style.height='51px'}
+    else{_txt.style.left='122px';_txt.style.top='250px';_txt.style.width='190px';_txt.style.height='42px'}
+    _txt.style.fontSize='0.92rem';
+  }
+  // 까마귀=왼쪽, 고양이=오른쪽 (프레임 방향에 맞춤)
+  if(_isCrow){_ps.style.left='20px';_ps.style.right='auto'}
+  else{_ps.style.right='20px';_ps.style.left='auto'}
+  // 게임 전체 UI 스케일(--ui-scale = min(sw/1920, sh/1080))에 직접 연결 — HUD와 동일하게 창 크기 따라감
+  _ps.style.transformOrigin=_isCrow?'left bottom':'right bottom';
+  _ps.style.transform='scale(calc(var(--ui-scale) * 1.5))';
+  _ps.style.opacity=_PET_OP_MAX;
+  _petHUDDirty=false;
+  }catch(e){_petHUDDirty=true;throw e}
+}
@@ -8610,23 +8614,24 @@
-function _updatePetBubble(){
-  // 쿨다운 감소
-  for(const k in _petDlgCD){_petDlgCD[k]-=_dtSp;if(_petDlgCD[k]<=0)delete _petDlgCD[k]}
-  for(let _ti=0;_ti<6;_ti++)if(_petTierCD[_ti]>0){_petTierCD[_ti]-=_dtSp;if(_petTierCD[_ti]<0)_petTierCD[_ti]=0}
-  // 말풍선 타이머
-  if(_petBubble.t>0){
-    _petBubble.t-=_dtSp;
-    // 메인 말풍선 끝 → 페어 발동
-    if(_petBubble.t<=0&&_petBubble.pair&&!_petBubble.pairFired){
-      _petBubble.pairFired=true;
-      _petBubble.who=_petBubble.pair.who;_petBubble.txt=_petBubble.pair.txt;
-      _petBubble.mt=_petBubble.pair.mt;_petBubble.t=_petBubble.pair.mt;
-      _petBubble.pair=null;
-      // 자막 갱신 (페어 대사) + 후발 사운드
-      _petBubbleShow(_petBubble.who,_petBubble.txt);
-      _petSfx(_petBubble.who,false);
-    }
-    // 자막 페이드아웃 (표시 순간부터 전체 지속시간에 걸쳐 점점 흐려지며 사라짐)
-    if(_petBubble.t>0){const _ps=$('petSubtitle');if(_ps){const _r=_petBubble.mt>0?_petBubble.t/_petBubble.mt:0;_ps.style.opacity=(Math.pow(Math.max(0,Math.min(1,_r)),0.6)*_PET_OP_MAX).toFixed(2)}}
-  }
-  // 대사 완전 종료 시 자막 숨김
-  if(_petBubble.t<=0&&!_petBubble.pair){const _ps=$('petSubtitle');if(_ps&&_ps.style.opacity!=='0')_ps.style.opacity='0'}
-}
+function _updatePetBubble(){
+  // 쿨다운 감소
+  for(const k in _petDlgCD){_petDlgCD[k]-=_dtSp;if(_petDlgCD[k]<=0)delete _petDlgCD[k]}
+  for(let _ti=0;_ti<6;_ti++)if(_petTierCD[_ti]>0){_petTierCD[_ti]-=_dtSp;if(_petTierCD[_ti]<0)_petTierCD[_ti]=0}
+  // 말풍선 타이머
+  if(_petBubble.t>0){
+    _petBubble.t-=_dtSp;
+    // 메인 말풍선 끝 → 페어 발동
+    if(_petBubble.t<=0&&_petBubble.pair&&!_petBubble.pairFired){
+      _petBubble.pairFired=true;
+      _petBubble.who=_petBubble.pair.who;_petBubble.txt=_petBubble.pair.txt;
+      _petBubble.mt=_petBubble.pair.mt;_petBubble.t=_petBubble.pair.mt;
+      _petBubble.pair=null;
+      // 자막 갱신 (페어 대사) + 후발 사운드
+      _petBubbleShow(_petBubble.who,_petBubble.txt);
+      _petSfx(_petBubble.who,false);
+    }
+    if(_petHUDDirty&&_petBubble.t>0)_petBubbleShow(_petBubble.who,_petBubble.txt);
+    // 자막 페이드아웃 (표시 순간부터 전체 지속시간에 걸쳐 점점 흐려지며 사라짐)
+    if(_petBubble.t>0){const _ps=$('petSubtitle');if(_ps){const _r=_petBubble.mt>0?_petBubble.t/_petBubble.mt:0;_ps.style.opacity=(Math.pow(Math.max(0,Math.min(1,_r)),0.6)*_PET_OP_MAX).toFixed(2)}}
+  }
+  // 대사 완전 종료 시 자막 숨김
+  if(_petBubble.t<=0&&!_petBubble.pair){_petHUDDirty=false;const _ps=$('petSubtitle');if(_ps&&_ps.style.opacity!=='0')_ps.style.opacity='0'}
+}
```

## 실행·출력·수정 이력

실제 fixture는 지정 Node `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module -`에 **checks.mjs와 byte 동일한 메모리 코드**를 heredoc `QUESTNPC_MILESTONE_MEMORY`로 전달한 단1회다.

UTC 2026-10-02T12:06:49.658Z ~ 12:06:49.790Z / KST 21:06:49.658 ~ 21:06:49.790. exit0, 하니스 실패0. 초기 실행코드를 수정하거나 case를 재실행한 이력0. checks SHA256 `69ff31d25546b278cb292fd9278a919504f8d31626f2bdf86e21f95dc40c63ac`, 9914 bytes.

**stdout capture 한계:** 최초 max_output_tokens1000으로 반환돼 원래16612 tokens의 JSON이 tool에서 잘렸다. 모든 assertion 종료는 exit0로 확인했지만 전체 case/fragment JSON 원문을 보존했다고 주장하지 않는다. 보존 가능한 tool prefix/suffix와 truncation 안내를 아래 JSON에 그대로 넣었다. 전체 stdout을 되찾으려 완료 검사를 재실행하지 않았다.

이후 SHA-only Node 유틸리티, 그리고 source patch materialization-only Node 유틸리티를 실행했다. 후자는 env/update/event/case를 실행하지 않고 source 함수·hash·candidate body만 재추출했으며 당시 source 전체 SHA가 검수 snapshot과 동일함을 확인했다. 이 유틸리티 실행을 fixture2회로 집계하지 않는다. 파일 저장 utility도 fixture 실행0.

## 대역·제품 인수 Gate

full pet state/priority/opacity와 full dispatcher/updatePet/urgent/fire/bid/say/CD/timer/SFX/playFM 등을 실제 source로 사용했다. update는 실제 guard prefix/pet call만 연결했고 중간/나머지 gameplay·AI는 생략했다. DOM leaf setter/style, AudioContext/node parameters/connect/start/stop, translation/padify, timer/playNoise, movement, regions count/victory는 합성 대역이다. text/style throw의 자연 DOM 도달성 또는 실제 audio device 실패를 관측하지 않았다.

이 패치가 CH1-1 획득·사망·부활·재도전 전체를 검수하지는 않는다. BOSS 필드복원 SSOT는 의존성 레퍼런스로 읽었고 맵 geometry/collision/camera/asset 제작·수정·QA 작업0. 실제 gate/필드 부활 진행은 BOSS/QA 담당 source와 root 동일 후보 통합에 의존한다. BUILD/QA 단일 실행 슬롯 전 실제 게임·빌드·화면·청취·native·map VISUAL·배포 완료0.

## docs 검색과 정확 root handoff

펫 SSOT의 표시/페이드/후발 호출 구간을 먼저 읽었다. 후보 후 전체 docs rg를 1회 실제 수행, exit0. 공유 docs 수정0. 검색 raw는 아래 evidence에 포함한다.

| 정본 | old | 통합 시 new |
|---|---|---|
| 2_4/대사_스크립트.md:51,62,67 | 표시 helper 및 pair 전환 시 1회 HUD 호출, 매tick fade | HUD throw 시 runtime dirty=true·원Error 유지. 다음 활성 timer tick에서 현재 who/txt HUD만 재적용; 성공/종료 dirty=false |
| 같은 문서:64–66 | opacity 최대0.6 / (t/mt)^0.6×0.6 / 종료 opacity0 | 수치·공식 동일. 재적용 뒤 같은tick 기존fade로 opacity를 결정; timer reset0 |
| 2_4/2_4 펫시스템.md 표시/대사 시스템 | CD/UID/pair 정책 | 기존 정책 보존. HUD 복구 후보가 helper 수락·음성/pair 완료를 보장하지 않음을 보충 |
| 11내러티브·로어디자인/펫_대사_스크립트.md:89 | 수락≠DOM·후발 완료 | 그대로 유지하며 이번 HUD-only 재시도 계약 연결. 튜토리얼 one-shot 소비 변경0 |
| 2_4/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:55 | 종전 표시/SFX 예외 미검수 | 종전 결과 그대로. 이번 별도 gate-pair 후보 링크만 연결; firstItem 재검수 완료로 변경0 |
| REGION_CLEAR_GATE_20260930.md:50 | gate개방/텍스트/SFX.victory/boss_gate_open | gate조건·latch/대사4초/ID30초·연출 유지. HUD복구는 펫 helper 계약으로 연결 |
| 번역대상_펫대사.md:221–230 및 키바인딩 docs:103 | 기존 H07/H08·padify 표시 | 대사·언어키·pad글리프 정책 변경0. retry도 기존 _petBubbleShow/_padifyHint 사용 |
| 역사 attribution/이전 evidence | 역사 함수/관측 | 수정0. 이번 근거와 혼합하지 않음 |

root가 후보를 production에 채택할 때 코드+canonical docs 동기화 및 소유 Git/checkpoint를 수행한다. 이번 담당은 공유 docs/Git 작업0. source acceptance와 실제 HUD display/pair/audio acceptance를 별도 표시한다.

## 보존 evidence

전체 원출력이 아닌 **반환된 truncated tool output**임을 아래 `stdoutComplete=false`로 표시한다. patch materialization JSON은 온전한 함수 body/hash 영수증이다.

```json
{
  "goalSHA256": "889fb16f97416a582818d6a93e49421e8eb704c11806ab50279fec9dc41b5a09",
  "checksSHA256": "69ff31d25546b278cb292fd9278a919504f8d31626f2bdf86e21f95dc40c63ac",
  "checksBytes": 9914,
  "execution": {
    "chunkId": "9e73dc",
    "exitCode": 0,
    "originalTokenCount": 16612,
    "wallTimeSeconds": 0.033765375,
    "stdoutComplete": false,
    "retainedToolOutput": "Warning: truncated output (original token count: 16612)\nTotal output lines: 2106\n\n{\n  \"taskId\": \"QUESTNPC-CH1-1-gate-pair-HUD-reconcile-memory\",\n  \"startUTC\": \"2026-10-02T12:06:49.658Z\",\n  \"endUTC\": \"2026-10-02T12:06:49.790Z\",\n  \"sources\": [\n    {\n      \"file\": \"/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html\",\n      \"sha256\": \"391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2\"\n    },\n    {\n      \"file\": \"/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html\",\n      \"sha256\": \"21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a\"\n    }\n  ],\n  \"fragments\": [\n    {\n      \"file\": \"/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html\",\n      \"name\": \"actual full pet state\",\n      \"fromLine\": 8980,\n      \"toLine\": 9018,\n      \"sha256\": \"3133b77010c7f2ae7aba12fa5553d82b8c141d643e6faf01b8749e86f1b4f6d7\"\n    },\n    {\n      \"file\": \"/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html\",\n      \"name\": \"actual priority state\",\n      \"fromLine\": 9085,\n      \"toLine\": 9089,\n      \"sha256\": \"2dfcd3df763296ca3ff2ce52c6ef5f9a2b3c52f0087899e9315863e939f69960\"\n    },\n    {\n      \"file\": \"/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html\",\n      \"name\": \"opacity\",\n      \"fromLine\": 9045,\n      \"toLine\": 9045,\n      \"sha256\": \"a7eef8d7e48d24adef18f721ad40f540e9cc128abd86b4d810dfc14e92dbf242\"\n    },\n    {\n      \"file\": \"/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html\",\n      \"name\": \"_checkPetDialogue\",\n      \"fromLine\": 9184,\n      \"toLine\": 9415,\n      \"sha256\": \"660b4ad74fe1792067e88dab0826c644bd925439c3adde1c678ff4b18f751ef3\"\n    },\n    {\n      \"file\": \"/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html\",\n      \"name\": \"_petTierOf\",\n      \"fromLine\": 9091,\n      \"toLine\": 9100,\n      \"sha256\": \"f3910551bc3a70f0776527c62b0b76a3b43f460a0bcd9247a055b41a0de09cb9\"\n    },\n    {\n      \"file\": \"/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html\",\n      \"name\": \"_petSay\",\n      \"fromLine\": 9066,\n      …15612 tokens truncated…\"\",\n          \"who\": \"\",\n          \"txt\": \"\",\n          \"dur\": 0,\n          \"cd\": 0,\n          \"pw\": null,\n          \"pt\": null,\n          \"pd\": 0\n        },\n        \"bubble\": {\n          \"who\": \"cat\",\n          \"txt\": \"문 열렸어! 이제 보스 잡으러 가자!\",\n          \"t\": 0,\n          \"mt\": 240,\n          \"pair\": null,\n          \"pairFired\": true,\n          \"_uid\": \"boss_gate_open\"\n        },\n        \"cd\": {\n          \"boss_gate_open\": 1559\n        },\n        \"tiers\": [\n          59,\n          59,\n          59,\n          59,\n          59,\n          0\n        ],\n        \"activeNodes\": 1,\n        \"dom\": {\n          \"petSubtitle\": {\n            \"style\": {\n              \"left\": \"20px\",\n              \"right\": \"auto\",\n              \"transformOrigin\": \"left bottom\",\n              \"transform\": \"scale(calc(var(--ui-scale) * 1.5))\",\n              \"opacity\": \"0\"\n            }\n          },\n          \"petPortrait\": {\n            \"style\": {},\n            \"src\": \"img/cat_pet/portrait.png?v=4\"\n          },\n          \"petBubbleTxt\": {\n            \"style\": {\n              \"fontSize\": \"0.92rem\",\n              \"left\": \"92px\",\n              \"top\": \"237px\",\n              \"width\": \"306px\",\n              \"height\": \"51px\"\n            },\n            \"textContent\": \"…지옥문이 열렸다. 안에서 그것이 기다리고 있어.\",\n            \"children\": []\n          }\n        },\n        \"trace\": {\n          \"urgent\": [\n            {\n              \"id\": \"boss_gate_open\",\n              \"inFrame\": false,\n              \"returned\": true\n            }\n          ],\n          \"oscillatorCalls\": 2,\n          \"noise\": 1,\n          \"timers\": 1,\n          \"gate\": 1,\n          \"victory\": 1,\n          \"hudWrites\": 2\n        }\n      }\n    }\n  ],\n  \"newCaseGroups\": 10,\n  \"productionApplied\": false,\n  \"runtimeAccepted\": false,\n  \"newFiles\": 0,\n  \"priorFixtureRuns\": 0,\n  \"policy\": \"HUD-only retry after caught render exception; same Error propagated; CD/UID/pair consumption and SFX unchanged\"\n}\n"
  },
  "patchMaterialization": {
    "chunkId": "399f5f",
    "exitCode": 0,
    "purpose": "patch materialization only; no env/test/case execution",
    "sourceReadUTC": "2026-10-02T12:14:47.048Z",
    "sources": [
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "sha256": "391155f3700e584cebf260942a95cfd4f4bbcc2cd6d700c6db65084ab7ad35d2"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "sha256": "21a4d3b73b6ddcf765ec1e4a9505329c9f28248828f95b5cbc8993f005f52c0a"
      }
    ],
    "patches": [
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
        "showOriginalSHA": "fc0ba0e3136e0c8a898dfb5c7d2de13dc61bb33b844c4035ec0fa7aa610a6f22",
        "showCandidateSHA": "ce87d44cfeb2af92aa54f9b53fbeb42533f4738a35473aeeacffdc55d7439f54",
        "timerOriginalSHA": "a9a102db61ad844dea0fe59d73f04da476fc4b82c9f7ed146c60e7e352e14b82",
        "timerCandidateSHA": "4ae0486d5a55fe26eebaf19aa51ad16a18c7829babf2d86957df472d5575e2fa",
        "originalShow": "function _petBubbleShow(who,txt){\n  const _ps=$('petSubtitle');if(!_ps)return;\n  const _isCrow=who==='crow';\n  const _img=$('petPortrait'),_txt=$('petBubbleTxt');\n  if(_img)_img.src='img/'+(_isCrow?'crow':'cat_pet')+'/portrait.png?v=4';\n  if(_txt){\n    _txt.textContent=_padifyHint(txt);\n    // 프레임 내 텍스트박스 영역 (이미지 표시폭 480px→높이 320px 기준 px좌표)\n    if(_isCrow){_txt.style.left='92px';_txt.style.top='237px';_txt.style.width='306px';_txt.style.height='51px'}\n    else{_txt.style.left='122px';_txt.style.top='250px';_txt.style.width='190px';_txt.style.height='42px'}\n    _txt.style.fontSize='0.92rem';\n  }\n  // 까마귀=왼쪽, 고양이=오른쪽 (프레임 방향에 맞춤)\n  if(_isCrow){_ps.style.left='20px';_ps.style.right='auto'}\n  else{_ps.style.right='20px';_ps.style.left='auto'}\n  // 게임 전체 UI 스케일(--ui-scale = min(sw/1920, sh/1080))에 직접 연결 — HUD와 동일하게 창 크기 따라감\n  _ps.style.transformOrigin=_isCrow?'left bottom':'right bottom';\n  _ps.style.transform='scale(calc(var(--ui-scale) * 1.5))';\n  _ps.style.opacity=_PET_OP_MAX;\n}",
        "candidateShow": "function _petBubbleShow(who,txt){\n  try{\n  const _ps=$('petSubtitle');if(!_ps){_petHUDDirty=false;return;}\n  const _isCrow=who==='crow';\n  const _img=$('petPortrait'),_txt=$('petBubbleTxt');\n  if(_img)_img.src='img/'+(_isCrow?'crow':'cat_pet')+'/portrait.png?v=4';\n  if(_txt){\n    _txt.textContent=_padifyHint(txt);\n    // 프레임 내 텍스트박스 영역 (이미지 표시폭 480px→높이 320px 기준 px좌표)\n    if(_isCrow){_txt.style.left='92px';_txt.style.top='237px';_txt.style.width='306px';_txt.style.height='51px'}\n    else{_txt.style.left='122px';_txt.style.top='250px';_txt.style.width='190px';_txt.style.height='42px'}\n    _txt.style.fontSize='0.92rem';\n  }\n  // 까마귀=왼쪽, 고양이=오른쪽 (프레임 방향에 맞춤)\n  if(_isCrow){_ps.style.left='20px';_ps.style.right='auto'}\n  else{_ps.style.right='20px';_ps.style.left='auto'}\n  // 게임 전체 UI 스케일(--ui-scale = min(sw/1920, sh/1080))에 직접 연결 — HUD와 동일하게 창 크기 따라감\n  _ps.style.transformOrigin=_isCrow?'left bottom':'right bottom';\n  _ps.style.transform='scale(calc(var(--ui-scale) * 1.5))';\n  _ps.style.opacity=_PET_OP_MAX;\n  _petHUDDirty=false;\n  }catch(e){_petHUDDirty=true;throw e}\n}",
        "originalTimer": "function _updatePetBubble(){\n  // 쿨다운 감소\n  for(const k in _petDlgCD){_petDlgCD[k]-=_dtSp;if(_petDlgCD[k]<=0)delete _petDlgCD[k]}\n  for(let _ti=0;_ti<6;_ti++)if(_petTierCD[_ti]>0){_petTierCD[_ti]-=_dtSp;if(_petTierCD[_ti]<0)_petTierCD[_ti]=0}\n  // 말풍선 타이머\n  if(_petBubble.t>0){\n    _petBubble.t-=_dtSp;\n    // 메인 말풍선 끝 → 페어 발동\n    if(_petBubble.t<=0&&_petBubble.pair&&!_petBubble.pairFired){\n      _petBubble.pairFired=true;\n      _petBubble.who=_petBubble.pair.who;_petBubble.sourceTxt=_petBubble.pair.sourceTxt;_petBubble.txt=_petBubble.pair.txt;\n      _petBubble.mt=_petBubble.pair.mt;_petBubble.t=_petBubble.pair.mt;\n      _petBubble.pair=null;\n      // 자막 갱신 (페어 대사) + 후발 사운드\n      _petBubbleShow(_petBubble.who,_petBubble.txt);\n      _petSfx(_petBubble.who,false);\n    }\n    // 자막 페이드아웃 (표시 순간부터 전체 지속시간에 걸쳐 점점 흐려지며 사라짐)\n    if(_petBubble.t>0){const _ps=$('petSubtitle');if(_ps){const _r=_petBubble.mt>0?_petBubble.t/_petBubble.mt:0;_ps.style.opacity=(Math.pow(Math.max(0,Math.min(1,_r)),0.6)*_PET_OP_MAX).toFixed(2)}}\n  }\n  // 대사 완전 종료 시 자막 숨김\n  if(_petBubble.t<=0&&!_petBubble.pair){const _ps=$('petSubtitle');if(_ps&&_ps.style.opacity!=='0')_ps.style.opacity='0'}\n}",
        "candidateTimer": "function _updatePetBubble(){\n  // 쿨다운 감소\n  for(const k in _petDlgCD){_petDlgCD[k]-=_dtSp;if(_petDlgCD[k]<=0)delete _petDlgCD[k]}\n  for(let _ti=0;_ti<6;_ti++)if(_petTierCD[_ti]>0){_petTierCD[_ti]-=_dtSp;if(_petTierCD[_ti]<0)_petTierCD[_ti]=0}\n  // 말풍선 타이머\n  if(_petBubble.t>0){\n    _petBubble.t-=_dtSp;\n    // 메인 말풍선 끝 → 페어 발동\n    if(_petBubble.t<=0&&_petBubble.pair&&!_petBubble.pairFired){\n      _petBubble.pairFired=true;\n      _petBubble.who=_petBubble.pair.who;_petBubble.sourceTxt=_petBubble.pair.sourceTxt;_petBubble.txt=_petBubble.pair.txt;\n      _petBubble.mt=_petBubble.pair.mt;_petBubble.t=_petBubble.pair.mt;\n      _petBubble.pair=null;\n      // 자막 갱신 (페어 대사) + 후발 사운드\n      _petBubbleShow(_petBubble.who,_petBubble.txt);\n      _petSfx(_petBubble.who,false);\n    }\n    if(_petHUDDirty&&_petBubble.t>0)_petBubbleShow(_petBubble.who,_petBubble.txt);\n    // 자막 페이드아웃 (표시 순간부터 전체 지속시간에 걸쳐 점점 흐려지며 사라짐)\n    if(_petBubble.t>0){const _ps=$('petSubtitle');if(_ps){const _r=_petBubble.mt>0?_petBubble.t/_petBubble.mt:0;_ps.style.opacity=(Math.pow(Math.max(0,Math.min(1,_r)),0.6)*_PET_OP_MAX).toFixed(2)}}\n  }\n  // 대사 완전 종료 시 자막 숨김\n  if(_petBubble.t<=0&&!_petBubble.pair){_petHUDDirty=false;const _ps=$('petSubtitle');if(_ps&&_ps.style.opacity!=='0')_ps.style.opacity='0'}\n}",
        "newState": "let _petHUDDirty=false;"
      },
      {
        "file": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html",
        "showOriginalSHA": "fc0ba0e3136e0c8a898dfb5c7d2de13dc61bb33b844c4035ec0fa7aa610a6f22",
        "showCandidateSHA": "ce87d44cfeb2af92aa54f9b53fbeb42533f4738a35473aeeacffdc55d7439f54",
        "timerOriginalSHA": "ec177353a6713bbfcc2b487429dceed6120adcc19f375c51907b92e3577821e4",
        "timerCandidateSHA": "a9b20eb0e8bbc7493dfc93e6322681de2accaac3e97e7f233932cf8b6b24dd77",
        "originalShow": "function _petBubbleShow(who,txt){\n  const _ps=$('petSubtitle');if(!_ps)return;\n  const _isCrow=who==='crow';\n  const _img=$('petPortrait'),_txt=$('petBubbleTxt');\n  if(_img)_img.src='img/'+(_isCrow?'crow':'cat_pet')+'/portrait.png?v=4';\n  if(_txt){\n    _txt.textContent=_padifyHint(txt);\n    // 프레임 내 텍스트박스 영역 (이미지 표시폭 480px→높이 320px 기준 px좌표)\n    if(_isCrow){_txt.style.left='92px';_txt.style.top='237px';_txt.style.width='306px';_txt.style.height='51px'}\n    else{_txt.style.left='122px';_txt.style.top='250px';_txt.style.width='190px';_txt.style.height='42px'}\n    _txt.style.fontSize='0.92rem';\n  }\n  // 까마귀=왼쪽, 고양이=오른쪽 (프레임 방향에 맞춤)\n  if(_isCrow){_ps.style.left='20px';_ps.style.right='auto'}\n  else{_ps.style.right='20px';_ps.style.left='auto'}\n  // 게임 전체 UI 스케일(--ui-scale = min(sw/1920, sh/1080))에 직접 연결 — HUD와 동일하게 창 크기 따라감\n  _ps.style.transformOrigin=_isCrow?'left bottom':'right bottom';\n  _ps.style.transform='scale(calc(var(--ui-scale) * 1.5))';\n  _ps.style.opacity=_PET_OP_MAX;\n}",
        "candidateShow": "function _petBubbleShow(who,txt){\n  try{\n  const _ps=$('petSubtitle');if(!_ps){_petHUDDirty=false;return;}\n  const _isCrow=who==='crow';\n  const _img=$('petPortrait'),_txt=$('petBubbleTxt');\n  if(_img)_img.src='img/'+(_isCrow?'crow':'cat_pet')+'/portrait.png?v=4';\n  if(_txt){\n    _txt.textContent=_padifyHint(txt);\n    // 프레임 내 텍스트박스 영역 (이미지 표시폭 480px→높이 320px 기준 px좌표)\n    if(_isCrow){_txt.style.left='92px';_txt.style.top='237px';_txt.style.width='306px';_txt.style.height='51px'}\n    else{_txt.style.left='122px';_txt.style.top='250px';_txt.style.width='190px';_txt.style.height='42px'}\n    _txt.style.fontSize='0.92rem';\n  }\n  // 까마귀=왼쪽, 고양이=오른쪽 (프레임 방향에 맞춤)\n  if(_isCrow){_ps.style.left='20px';_ps.style.right='auto'}\n  else{_ps.style.right='20px';_ps.style.left='auto'}\n  // 게임 전체 UI 스케일(--ui-scale = min(sw/1920, sh/1080))에 직접 연결 — HUD와 동일하게 창 크기 따라감\n  _ps.style.transformOrigin=_isCrow?'left bottom':'right bottom';\n  _ps.style.transform='scale(calc(var(--ui-scale) * 1.5))';\n  _ps.style.opacity=_PET_OP_MAX;\n  _petHUDDirty=false;\n  }catch(e){_petHUDDirty=true;throw e}\n}",
        "originalTimer": "function _updatePetBubble(){\n  // 쿨다운 감소\n  for(const k in _petDlgCD){_petDlgCD[k]-=_dtSp;if(_petDlgCD[k]<=0)delete _petDlgCD[k]}\n  for(let _ti=0;_ti<6;_ti++)if(_petTierCD[_ti]>0){_petTierCD[_ti]-=_dtSp;if(_petTierCD[_ti]<0)_petTierCD[_ti]=0}\n  // 말풍선 타이머\n  if(_petBubble.t>0){\n    _petBubble.t-=_dtSp;\n    // 메인 말풍선 끝 → 페어 발동\n    if(_petBubble.t<=0&&_petBubble.pair&&!_petBubble.pairFired){\n      _petBubble.pairFired=true;\n      _petBubble.who=_petBubble.pair.who;_petBubble.txt=_petBubble.pair.txt;\n      _petBubble.mt=_petBubble.pair.mt;_petBubble.t=_petBubble.pair.mt;\n      _petBubble.pair=null;\n      // 자막 갱신 (페어 대사) + 후발 사운드\n      _petBubbleShow(_petBubble.who,_petBubble.txt);\n      _petSfx(_petBubble.who,false);\n    }\n    // 자막 페이드아웃 (표시 순간부터 전체 지속시간에 걸쳐 점점 흐려지며 사라짐)\n    if(_petBubble.t>0){const _ps=$('petSubtitle');if(_ps){const _r=_petBubble.mt>0?_petBubble.t/_petBubble.mt:0;_ps.style.opacity=(Math.pow(Math.max(0,Math.min(1,_r)),0.6)*_PET_OP_MAX).toFixed(2)}}\n  }\n  // 대사 완전 종료 시 자막 숨김\n  if(_petBubble.t<=0&&!_petBubble.pair){const _ps=$('petSubtitle');if(_ps&&_ps.style.opacity!=='0')_ps.style.opacity='0'}\n}",
        "candidateTimer": "function _updatePetBubble(){\n  // 쿨다운 감소\n  for(const k in _petDlgCD){_petDlgCD[k]-=_dtSp;if(_petDlgCD[k]<=0)delete _petDlgCD[k]}\n  for(let _ti=0;_ti<6;_ti++)if(_petTierCD[_ti]>0){_petTierCD[_ti]-=_dtSp;if(_petTierCD[_ti]<0)_petTierCD[_ti]=0}\n  // 말풍선 타이머\n  if(_petBubble.t>0){\n    _petBubble.t-=_dtSp;\n    // 메인 말풍선 끝 → 페어 발동\n    if(_petBubble.t<=0&&_petBubble.pair&&!_petBubble.pairFired){\n      _petBubble.pairFired=true;\n      _petBubble.who=_petBubble.pair.who;_petBubble.txt=_petBubble.pair.txt;\n      _petBubble.mt=_petBubble.pair.mt;_petBubble.t=_petBubble.pair.mt;\n      _petBubble.pair=null;\n      // 자막 갱신 (페어 대사) + 후발 사운드\n      _petBubbleShow(_petBubble.who,_petBubble.txt);\n      _petSfx(_petBubble.who,false);\n    }\n    if(_petHUDDirty&&_petBubble.t>0)_petBubbleShow(_petBubble.who,_petBubble.txt);\n    // 자막 페이드아웃 (표시 순간부터 전체 지속시간에 걸쳐 점점 흐려지며 사라짐)\n    if(_petBubble.t>0){const _ps=$('petSubtitle');if(_ps){const _r=_petBubble.mt>0?_petBubble.t/_petBubble.mt:0;_ps.style.opacity=(Math.pow(Math.max(0,Math.min(1,_r)),0.6)*_PET_OP_MAX).toFixed(2)}}\n  }\n  // 대사 완전 종료 시 자막 숨김\n  if(_petBubble.t<=0&&!_petBubble.pair){_petHUDDirty=false;const _ps=$('petSubtitle');if(_ps&&_ps.style.opacity!=='0')_ps.style.opacity='0'}\n}",
        "newState": "let _petHUDDirty=false;"
      }
    ]
  },
  "docsSearch": {
    "command": "rg -n --max-columns 360 --max-columns-preview '_petBubbleShow|_updatePetBubble|pairFired|boss_gate_open|후발 대사|표시/SFX 예외' docs/",
    "exitCode": 0,
    "raw": "docs/2_4 펫시스템/PET_FIRST_ITEM_ACCEPTANCE_FALLTHROUGH_20261002.md:55:표시/SFX 예외는 실제 helper에서 잡지 않으며 이번 예외 정책·fault 검수 추가는 없다. pair 중단 뒤 안내 재생, 장기 경쟁, 다른 튜토리얼 소비, 실제 패드/언어별 표시·음성·게임/native·저장·빌드의 판정은 미검수다.\ndocs/11내러티브·로어디자인/펫_대사_스크립트.md:89:- **1회성 대사**: `_petTut`는 각 분기의 계약으로 관리한다. `tut_firstItem`만 `_petSayCD` true 수락 후 flag를 소비하고 return하며 false는 미소비 후 후속 분기를 검사한다. 다른 튜토리얼의 flag·return 계약은 유지한다. 수락은 DOM 표시·후발 대사 완료를 뜻하지 않는다.\r\ndocs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md:50:| 개방 연출 | 기존 유지: `🔥 지옥문이 열렸습니다` + `SFX.victory` + `boss_gate_open` 펫 대사 + 포탈 빨강→파랑 |\ndocs/16번역·로컬라이제이션/번역대상_펫대사.md:221:| H07 | boss_gate_open | crow | …지옥문이 열렸다. 안에서 그것이 기다리고 있어. | ✅ | line 33380 |\r\ndocs/16번역·로컬라이제이션/번역대상_펫대사.md:222:| H08 | boss_gate_open | cat | 문 열렸어! 이제 보스 잡으러 가자! | ✅ | line 33380 |\r\ndocs/16번역·로컬라이제이션/번역대상_펫대사.md:230:> **Phase 30 (2026-06-30)**: H07/H08 (boss_gate_open) _EN은 있었으나 26개 lang 파일 전체 누락 발견 → 26개 언어 전파 완료. (감사: `_audit_missing2.py` 큰따옴표 값 파싱으로 적발)\r\ndocs/2_4 펫시스템/대사_스크립트.md:37:- `id`: 대사 고유 키 / `who`: 선발 화자 (`crow`=핵터, `cat`=디로이) / `pairWho/pairTxt`: 티키타카(후발 대사)\r\ndocs/2_4 펫시스템/대사_스크립트.md:51:### 표시 함수 `_petBubbleShow(who, txt)` (line ~7524)\r\ndocs/2_4 펫시스템/대사_스크립트.md:62:### 페이드/종료 (`_updatePetBubble`, line ~7587)\r\ndocs/2_4 펫시스템/대사_스크립트.md:64:- **반투명 시작 캡 `_PET_OP_MAX=0.6` (2026-07-27)**: 표시 순간부터 최대 불투명도 0.6으로 시작 — 캐릭터 위에 겹쳐도 게임 화면이 비쳐 보이도록. 게임 시작 직후 탄막 속에서 가이드가 바로 떠야 하므로 0.45는 너무 흐려서 0.6으로 상향. `_petBubbleShow`의 초기 opacity와 매 프레임 페이드 양쪽에 곱해짐. (변천: 1.0 → 0.62 → 0.45 → 0.6)\r [... omitted end of long line]\ndocs/2_4 펫시스템/대사_스크립트.md:67:- 티키타카 후발 대사 발동 시 `_petBubbleShow(_petBubble.who, _petBubble.txt)` 재호출\r\ndocs/2_4 펫시스템/대사_스크립트.md:493:| boss_gate_open | 지옥문 개방 | …지옥문이 열렸다. 안에서 그것이 기다리고 있어. | 문 열렸어! 이제 보스 잡으러 가자! |\ndocs/2_4 펫시스템/대사_스크립트.md:495:| region_clear | [REGION] 지역 1곳 클리어 (4/4 제외 — 그때는 boss_gate_open) | — | 한 지역 클리어! 미니맵에서 다음 지역을 확인해. |\ndocs/3.3 키바인딩+설정/3.3 키바인딩+설정.md:103:- 펫 대사·튜토리얼 힌트가 패드모드에서 키보드 키 대신 **패드 글리프** 표시. `_petBubbleShow`의 텍스트 세팅에 적용.\r\ndocs/0마스터플랜/mac-resume-20261001/gap-attribution-evidence/attribution.json:1409:          \"function\": \"_updatePetBubble\",\n"
  },
  "productionApplied": false,
  "runtimeAccepted": false,
  "priorFixtureRuns": 0
}
```
