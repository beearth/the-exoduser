# ANIMVFX — foot-shadow-anchor 결과 (2026-10-02)

승인 렌더러 원문·기존 CH1 8방향 메타데이터 대조를 완료했다. **좌표 변환 누락과 GL/2D 몸체 중복 2건을 원문 하니스로 재현**했으며, 아래에 최소 미적용 후보를 남겼다. 57/57 검수 그룹과 읽기 전용 `git apply --check`가 통과했다. 이는 source/수식 검수이며 실게임·시각 PASS가 아니다. 해부학적 발 앵커는 메타데이터에 없어 UNKNOWN이다. 중심 앵커를 셀 바닥으로 임의 이동하지 않았다. corpse fade 보류를 유지한다.

실제 workdir는 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 소유 신규 파일은 `checks.mjs`, `result.md`, `evidence.json` 3개이며 후보 diff는 이 보고서에 포함한다. 생산 HTML·서버·에셋·공유 docs·기존 test·원담당 prefix·Git 인덱스는 수정하지 않았다.

## 1. 수신·Read·실행 구분

| 단계 | 실제 관측 UTC / KST | 근거·해석 |
|---|---|---|
| 이번 배정 수신 최초 관측 | 03:43:39 / 12:43:39 | 첫 도구 시계 경계. 원 메시지의 정확한 수신 시각은 제공되지 않아 이 관측값과 구분한다 |
| 선행 Read | 최초 실행 전에 완료; 정확한 첫 Read 시각 미기록 | AGENTS, 관리 §18, 연속 작업/조율 문서, 팀 MD, 원 과제, 시스템 SSOT를 실제 읽었다. 최신 task와 원 과제의 전체 재Read 성공을 03:54:16 / 12:54:16에 재기록했다 |
| 첫 소유 코드 산출 | 03:48:33 / 12:48:33 | `checks.mjs`만 작성, 생산 반영 없음 |
| 최초 명령 검수 | 03:48:52.398 / 12:48:52.398 | 50그룹 중 patch 문맥 검수 실패. 소유 코드의 diff 생성기를 수정했다 |
| 중간 검수 | 03:49:20.265 / 12:49:20.265 | 50그룹 출력 PASS였으나 이후 검토에서 SSAA 논리/백킹 해상도 비교 누락을 발견해 최종 인수에서 제외했다 |
| 보강 검수 실패 | 03:52:18.318, 03:52:51.817 / 12:52:18.318, 12:52:51.817 | easy의 HiDPI와 GL 플래시를 본편과 같다고 본 하니스 가정 실패. 원문 차이를 그대로 보존하도록 검수만 정정했다 |
| 최종 명령 검수 | 2026-10-02T03:53:25.281Z | 57/57 PASS, exit 0. 실제 GL uniform 호출 원문까지 실행한 수식 검수 |
| 산출·완료 인계 | `evidence.json`의 packaging/completedAt | 보고서와 증거 파일을 읽어 확인한 뒤 기록. 런타임 인수/커밋/원격 반영 완료를 뜻하지 않는다 |

시작 HEAD는 `96610b6546a31e882962470ea1f2164ce94edca6`였다. 최종 검수 HEAD는 `31454dfa49c90bac77351273fc32f0c1eb937928`였으며 검수 전후 동일했다. 병행 총괄 체크포인트에 따른 HEAD 이동을 관측했으며, 본 팀의 Git 쓰기는 없다. Changes 시작 23, 중간 47(03:49:37 UTC), 최종 검수 53, 완료값은 증거에 기록한다. 80/100 임계점에는 도달하지 않았다.

이전 원 CLI의 미전달 foot-shadow 과제와 이번 새 팀 채팅의 실행을 구분한다. 이전 corpse-flash 보충 근거를 발 앵커 검수로 재사용하지 않았다. 원 CLI의 새 동일 과제 수행 증거는 발견하지 못했으며 현재 CLI 생존/미수신을 새로 확정한 것은 아니다.

## 2. 원문 계약·수치 표

범위는 일반 CH1 8방향 몸체의 정상/보행 GL 큐와 대응 2D 몸체·그림자다. 보스·구울·슬라임·`_ch1StartMedium`, 간소 렌더·시체/파편, 타 챕터 고유 렌더는 이번 후보 대상이 아니다. e=(340,420), r=20, col=7,row=4, VW/VH=1280/800, cam=(100,200)를 작은 주입 fixture로 사용했다.

| source ID / 한글명 | 수치·슬롯 | 적용 위치 | 실제 공식·검수 | 판정·한계 |
|---|---|---|---|---|
| A-IDLE / 정지 아틀라스 | cell256, cols8, rows5, total40; 방향8 | `img/atlas_ch1_8dir.json` | col=idx%8, row=floor(idx/8), 셀(col×256,row×256); PNG2048×1280 | JSON 전체 슬롯·16 PNG의 각33바이트 헤더 확인. 픽셀 미해독 |
| A-WALK / 보행 오버레이 | 39종, 4프레임/종; idle와 동일 슬롯 | `img/atlas_ch1_8dir_walk.json` | frame=~~(walkDist/128)%4; 셀((col×4+frame)×256,row×256); PNG8192×1280 | 거리0,127,128,255,256,383,384,511,512 경계 확인 |
| A-HOUND / 피부없는 사냥개 | idx25,col1,row3 | idle/walk JSON | idle 있음, walk 없음 → idle만 큐/그림 | 기존 폴백 보존 |
| A-ANCHOR / 실제 발 위치 | foot/feet/pivot/anchor/offset 필드 없음 | 런타임 JSON 2개 | 셀 중심/alpha bbox/셀 바닥은 해부학적 발 좌표 계약이 아님 | UNKNOWN. 실제 방향·프레임별 픽셀/육안 근거 확보가 필요 |
| A-INVENTORY / 소스 목록 | manifest cols7 | `img/ch1_8dir/manifest.json` | `_load8DirAtlas`는 이 manifest를 읽지 않고 packed idle/walk JSON을 로드 | 7열 소스 목록과 8열 packed JSON 차이를 렌더 결함으로 분류하지 않음 |
| R-BODY / 몸체 중심·스케일 | B=max(7r,80); 정사각형 | game:queue5028,body51956; easy:queue4683,body50443 | 중심(e.x,e.y), 좌상단(e.x−B/2,e.y−B/2), idle+이동 walk | 셀/방향/프레임/UV/인스턴스 수 보존. 해부학적 발 바닥 정렬과는 별개 |
| R-WORLD / 월드 변환 | z=_ez×_cz; ss=_ssaa | game50105~ / easy48634~; proxy matrix | M = ss scale → 화면중심 기준 z scale → round(VW/2−cam.x+sx), round(VH/2−cam.y+sy) translate | 실제 원문 행렬·월드 변환을 실행. 줌·흔들림·fractional camera 포함 |
| R-RES / GL 해상도 | instancing uRes=(VW,VH); proxy uRes=(C.width,C.height) | game draw5042 / easy4697; viewport | instancing device center=logical center×(C.width/VW,C.height/VH) | 원문 GL uniform 호출을 기록했다. GL API는 호출 기록 stub이고 GPU 실행 아님 |
| R-SSAA / 백킹 배율 | 본편 resize ss=1; easy QA HiDPI는 DPR clamp[1,2] | game4381 / easy4151 | 후보 GL 큐=M(world)/ss, size=(B×M00/ss,B×M11/ss) | SSAA1.5/2 단독은 원 코드 결함이 아니다. 본편의1.5/2는 주입 회귀 조건 |
| S-ELLIPSE / 일반 그림자 | rx=.85r,ry=.25r,alpha=.18sa | prep 및 !queued 2D 폴백 | 중심(e.x,e.y+.35r), 같은 월드 M 적용 | 의도된 y 오프셋 보존 |
| S-BLOB / 접지 블롭 | rx=.95r,ry=.28r,alpha=.3sa; stamp128², 중심64,64 | game17693 / easy16779; prep 및 폴백 | dest=(cx−1.15rx+.12rx,cy−1.15ry+.18ry,2.3rx,2.3ry); 실제 stamp 중심=(e.x+.114r,e.y+.4004r), dest크기=(2.185r,.644r) | NW 광원→SE 그림자 이동 원문 주석 확인. 중심 offset을 결함으로 수정하지 않음. 쿼드 반올림·최종 alpha 픽셀 미검수 |
| F-POP / 피격 확대 | t=min(1,hf/6), B×(1+.05t), alpha=.8t | 본편 prep GL additive 패스 | 중심 유지, 최대5% 확대. hf=.5,3,6,12 주입에서 원문 결과 보존 | 연출. easy prep에는 이 GL flash 없음; 본편과 동일하다고 주장하지 않음. update/수명/부활 실행은 이번 검수 밖 |
| C-DEFER / 시체 fade | 새 fade·사망 타이밍 변경0 | 기존 corpse-flash 및 team §6a | 후보는 queue와 정상 몸체 guard만 변경 | corpse fade 보류 유지. 사망/보상/RNG/코퍼스 수명/수량은 이번 실행 대상 아님 |

`_dsBlob`의 stamp 중심 수치는 텍스처 사각형의 중심 변환 공식이다. 실제 그림자의 불투명 면적/해부학적 접지/최종 합성 성공을 뜻하지 않는다.

## 3. 재현 결함과 미적용 후보의 결과

| ID / 한글명 | 원문 재현 | 후보에서 확인한 변화 | 남는 Gate |
|---|---|---|---|
| D1 / GL 몸체 좌표 변환 누락 | z=.62에서 GL 중심(880,620), 크기140; 원문 월드 중심(788.8,536.4), 크기86.8. shake=(4,−3)에서 GL(880,620), 월드(884,617). cam=(100.25,200.75)에서 GL(879.75,619.25), 월드(880,619) | 월드 M을 적용한 뒤 ss로 나누어 실제 GL 논리 uRes에 맞춤. 7조건×2 HTML에서 device 중심/크기 오차≤0.0001. ss1.5/2 단독 배율은 그대로 보존 | 정상 부팅 실제 GL 화면·줌·흔들림 A/B, Float32·셰이더 각도 양자화·프록시 쿼드 반올림 |
| D2 / GL 성공 뒤 2D 몸체 중복 | GL idle+walk 2개가 큐/드로우되어 mode1이지만 일반 몸체는 `if(_a8)`로 다시 idle+walk 2번 drawImage | `if(_a8&&!_ensGLQueued)`로 정상 몸체2D 호출2→0. GL idle+walk2 유지, GL 꺼짐/한도 초과는2D 폴백 보존 | 실제 합성·알파/불투명도 변화 확인. SSOT의 중복 방지 계약을 복구하는 후보이며 아직 생산 반영 아님 |

행렬 회전/전단 성분이 있으면 후보 큐는 false를 반환해 2D 몸체·그림자로 폴백한다. 회전0.1rad 주입에서 폴백을 확인했다. 실제 월드 경로는 축 정렬 변환이며 이 guard는 확대 범위를 제한한다.

셰이더는 저장된 packedAlpha를 `floor(a_alpha/256)/1024−3.14159265`로 복원한다. '회전0' 의도에도 유한 양자화 잔차가 있어 정확한 픽셀 일치로 승격하지 않는다. UV/packedAlpha 값과 현재 셰이더는 후보에서 그대로다. 기존 atlasE/다른 instancing 경로의 전체 좌표 감사를 한 것은 아니다.

## 4. 재실행·검수 경계

`checks.mjs`는 현재 파일에서 실제 queue/prep/draw/body/shadow/matrix/월드 변환 코드를 작은 범위로 추출해 실행한다. 적 상태·에셋 준비 상태·texture·캔버스/GL API·시간 값은 fixture이다. Shader 문자열은 읽어 확인하며 compile/execute하지 않는다. PNG는 헤더만 읽는다. `performance.now()`는 상수 stub이므로 성능 측정은 없다.

57그룹 = 메타데이터3 + PNG헤더16 + HTML별18×2 + patch검수1 + 입력해시불변1. HTML별18은 해상도1, 변환7, 폴백/프레임 수/최소스케일/그림자6, 비축정렬1, 기존 flash계약1, 거리프레임경계1, loader권위1이다. 그룹 PASS는 결함 재현 및 후보 조건 충족이며 전체 게임 PASS가 아니다.

```sh
cd /Users/fordeargamers/Projects/exoduser-migration-20261001
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/team-followup-20261002/project-teams/ANIMVFX/checks.mjs
```

하니스는 JSON을 stdout으로 출력하고 파일을 추가하지 않는다. 후보는 메모리 원문에만 적용하며, `git apply --check -`는 입력 diff를 검수만 한다. 생산 반영 전 새 HEAD/원문 SHA에서 재검수하고, QA가 정규 visible 전체 부팅에서 GL 성공·2D 폴백 및 실제 접지를 별도 판정해야 한다.

## 5. docs 전체 검색과 총괄 동기화 변경안

코드 산출 후 관련 키워드로 docs 전체를 검색했다. 최근 검색 2026-10-02 03:53:24 UTC, exit0, 관련20문서. 명령은 증거에 기록했다. 이번 최신 task의 공유 docs 읽기 전용 계약에 따라 아래 정확한 변경안을 보고하며 총괄이 생산 인수와 함께 반영한다. 보호2_3 문서는 수정0.

| 문서·적용 위치 | 정확한 변경안 | 현재/후보 상태 구분 |
|---|---|---|
| [몬스터_스킨_렌더링_파이프라인.md](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md) §WebGL2 계약 및 렌더 흐름 | 'GL 성공 시 Canvas 본문 중복 방지' 행에 **2026-10-02 실제 source audit에서 정상 CH1 몸체 guard 미충족을 재현했으며 ANIMVFX result의 후보는 미적용** 상태를 추가. 인수 후 guard는 `if(_a8&&!_ensGLQueued)`, 좌표는 `x=(M00×worldX+M02)/ss`, `y=(M11×worldY+M12)/ss`, size는 `(B×M00/ss,B×M11/ss)`; b/c≠0은 기존2D 폴백. 실제 배열 M의 translation은 m[4]/m[5]라고 함께 명시 | 지금 '수정 완료'로 쓰지 않음. root 채택·생산 반영 후 source 검수와 화면 Gate를 분리 |
| 같은 문서 §'ch1 8방향 몹 풀(39종)'~빌드 예제 앞 | 현행 안내로 **'CH1 idle40종(8×5,cell256,2048×1280), walk39종(4f,8192×1280), skinless_hound idx25,col1,row3 idle 폴백; 전체 idx/col/row 목록은 몬스터_스킨_시스템.md §40종 목록 및 atlas_ch1_8dir.json이 SSOT'**로 교체. 현재 39종·7×6 및 sequential 배정 안내는 현행이 아님. `manifest.json cols7`은 비런타임 소스 inventory라고 구분 | 런타임 에셋/배정 변경0. 실제 authoritative JSON의 수치로 문서 모순 정리 |
| 같은 문서 §아틀라스 빌드 방법 | `CELL=48`·동적 square grid 예제는 **'구 빌드 예제 — 현행 CH1 아틀라스 계약과 불일치하므로 런타임 재생성에 사용하지 않음'**으로 명시. 이번 과제는 생성/빌드하지 않음 | 새 PixelLab 생성이나 에셋 빌드 계획을 승인한 것이 아님 |
| [몬스터_스킨_시스템.md](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.0애니메이션파이프라인/몬스터_스킨_시스템.md) §일반 렌더 다음 | 위 R-BODY/R-WORLD/R-RES/S-ELLIPSE/S-BLOB 수치 표를 추가. 발 metadata 없음→UNKNOWN; 셀 중심·셀 바닥과 실제 발은 구분. GL/2D 중복 방지 설명은 현 source 재현 결함/미적용 후보와 함께 상태 표시 | packed JSON40/39·8×5·256·4f·128거리 값 유지 |
| [ANIMATION_VFX_TEAM_MASTER.md](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md) §백로그109 및 최신 인수 말미 | **'foot-shadow-anchor: 새 팀 Read/원문 실행/57그룹 검수 완료, 변환 누락+중복 몸체2건 재현, 최소 후보 미적용. 실제 발 앵커 UNKNOWN, 실게임·시각 검수 미실시, corpse fade 보류 유지. 근거는 tools/team-followup-20261002/project-teams/ANIMVFX/result.md 및 evidence.json'** 추가 | 이전 corpse-flash/current CLI 상태와 분리. old delivery0 이력은 당시 기록으로 유지 |
| [VFX_구현가이드.md](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/5.1임펙트디자인/VFX_구현가이드.md) §몬스터 피격 플래시 | 변경 수치 없음. 본편 최대5% pop/.8t와 game-easy-test의 이전 플래시를 동일하다고 설명하지 않음. 이번 후보가 flash/update/사망/부활을 바꾸지 않는다는 범위와 root 인수 링크만 보충 가능 | fade/flash 신규효과·수명 변경0 |
| 관련 map/AI/ancestor/GPU 이력·조율 문서 | y정렬/16버킷/깊이순서·돌진 전조·전대 프레임·스킨 역사는 이번 후보가 바꾸지 않음. 총괄 COMBAT-REVIEW·MAC-COORDINATION·INDEPENDENT-NEXT의 당시 미전달 행은 새 팀 실행 인수에 연결 | 맵·시각 QA 수행 또는 2_3 수정 없음. 다른 문서의 역사상 실측을 이번 실측으로 재표기하지 않음 |

원문 조사가 찾은 문서 모순을 보고했으며 공유 docs가 이미 동기화됐다고 주장하지 않는다. 원격 SHA 인수 및 code+docs 커밋은 총괄 단계다.

## 6. 미적용 최소 diff

patch SHA-256: `8771cd8b15c745e19b87576f0bb2d7cf5cf8c05ae0ec30a7699747347ac0b4bb`. 아래 블록은 `checks.mjs`가 생성하고 `git apply --check`로 검수한 diff 원문이다. 생성 파일 수 제한 때문에 독립 candidate.patch는 만들지 않는다.

```diff
diff --git a/game.html b/game.html
--- a/game.html
+++ b/game.html
@@ -5028,14 +5028,16 @@
 function _queueEnemy8DirInstanced(bucket,img,sx,sy,sw,sh,x,y,dw,dh,alpha){
   if(bucket<0||bucket>=_ENS8_GL_GROUPS||!img||_ens8GLTotal>=_ENS8_GL_MAX)return false;
   const _cnt=_ens8GLCounts[bucket];if(_cnt>=_ENS_GL_MAX)return false;
   const _iw=img.width||img.naturalWidth||1,_ih=img.height||img.naturalHeight||1;
   const _o=(bucket*_ENS_GL_MAX+_cnt)*_ENS_GL_STRIDE;
   // 원본 8방향 프레임은 이미 회전된 상태다. 셰이더 회전은 0으로 고정한다.
   const _alphaQ=Math.max(0,Math.min(255,Math.round(Math.max(0,Math.min(1,alpha))*255)));
-  _ens8GLCpu[_o]=x;_ens8GLCpu[_o+1]=y;
+  const _m8=_mat();if(_m8[1]!==0||_m8[2]!==0)return false;
+  const _wx8=x-VW*.5+G.cam.x,_wy8=y-VH*.5+G.cam.y,_ss8=1/_ssaa;
+  _ens8GLCpu[_o]=(_m8[0]*_wx8+_m8[4])*_ss8;_ens8GLCpu[_o+1]=(_m8[3]*_wy8+_m8[5])*_ss8;
   _ens8GLCpu[_o+2]=sx/_iw;_ens8GLCpu[_o+3]=sy/_ih;_ens8GLCpu[_o+4]=sw/_iw;_ens8GLCpu[_o+5]=sh/_ih;
   _ens8GLCpu[_o+6]=Math.PI*1024*256+_alphaQ;
-  _ens8GLCpu[_o+7]=dw;_ens8GLCpu[_o+8]=dh;
+  _ens8GLCpu[_o+7]=dw*_m8[0]*_ss8;_ens8GLCpu[_o+8]=dh*_m8[3]*_ss8;
   _ens8GLCounts[bucket]=_cnt+1;_ens8GLImgs[bucket]=img;_ens8GLTotal++;
   return true
 }
@@ -51967,6 +51969,6 @@
         // 8dir 아틀라스 렌더
         const _a8=_ch8Atlas[1];
-        if(_a8){
+        if(_a8&&!_ensGLQueued){
           if(P){const _fdM2=dst2(P.x,P.y,e.x,e.y);if(_fdM2<640000&&P.hp>0)e.facing=Math.atan2(P.y-e.y,P.x-e.x)}
           const _baseSz=Math.max(e.r*7,80);
           const _dk8=_mobFacingDir8(e.facing);
diff --git a/game-easy-test.html b/game-easy-test.html
--- a/game-easy-test.html
+++ b/game-easy-test.html
@@ -4683,14 +4683,16 @@
 function _queueEnemy8DirInstanced(bucket,img,sx,sy,sw,sh,x,y,dw,dh,alpha){
   if(bucket<0||bucket>=_ENS8_GL_GROUPS||!img||_ens8GLTotal>=_ENS8_GL_MAX)return false;
   const _cnt=_ens8GLCounts[bucket];if(_cnt>=_ENS_GL_MAX)return false;
   const _iw=img.width||img.naturalWidth||1,_ih=img.height||img.naturalHeight||1;
   const _o=(bucket*_ENS_GL_MAX+_cnt)*_ENS_GL_STRIDE;
   // 원본 8방향 프레임은 이미 회전된 상태다. 셰이더 회전은 0으로 고정한다.
   const _alphaQ=Math.max(0,Math.min(255,Math.round(Math.max(0,Math.min(1,alpha))*255)));
-  _ens8GLCpu[_o]=x;_ens8GLCpu[_o+1]=y;
+  const _m8=_mat();if(_m8[1]!==0||_m8[2]!==0)return false;
+  const _wx8=x-VW*.5+G.cam.x,_wy8=y-VH*.5+G.cam.y,_ss8=1/_ssaa;
+  _ens8GLCpu[_o]=(_m8[0]*_wx8+_m8[4])*_ss8;_ens8GLCpu[_o+1]=(_m8[3]*_wy8+_m8[5])*_ss8;
   _ens8GLCpu[_o+2]=sx/_iw;_ens8GLCpu[_o+3]=sy/_ih;_ens8GLCpu[_o+4]=sw/_iw;_ens8GLCpu[_o+5]=sh/_ih;
   _ens8GLCpu[_o+6]=Math.PI*1024*256+_alphaQ;
-  _ens8GLCpu[_o+7]=dw;_ens8GLCpu[_o+8]=dh;
+  _ens8GLCpu[_o+7]=dw*_m8[0]*_ss8;_ens8GLCpu[_o+8]=dh*_m8[3]*_ss8;
   _ens8GLCounts[bucket]=_cnt+1;_ens8GLImgs[bucket]=img;_ens8GLTotal++;
   return true
 }
@@ -50454,6 +50456,6 @@
         // 8dir 아틀라스 렌더
         const _a8=_ch8Atlas[1];
-        if(_a8){
+        if(_a8&&!_ensGLQueued){
           if(P){const _fdM2=dst2(P.x,P.y,e.x,e.y);if(_fdM2<640000&&P.hp>0)e.facing=Math.atan2(P.y-e.y,P.x-e.x)}
           const _baseSz=Math.max(e.r*7,80);
           const _dk8=_mobFacingDir8(e.facing);
```

## 7. 남은 Gate

생산 code+docs 통합과 정확한 원격 SHA 인수는 총괄이 한다. QA는 정규 GL 부팅에서 실제 중복 제거 후 합성·줌/흔들림·폴백·방향/보행 프레임과 발 접지를 확인해야 한다. 발 좌표 조정은 기존 승인 에셋의 방향·프레임별 근거 확보 후 별도 결정한다. corpse fade 보류, 새 애니메이션/에셋 생성0, 시각 PASS 주장0을 유지한다.

