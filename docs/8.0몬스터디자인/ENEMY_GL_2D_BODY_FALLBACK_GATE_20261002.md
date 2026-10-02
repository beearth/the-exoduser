# 적 8방향 GL/일반 body 실패 경계 — 정적 인수 (2026-10-02)

현재 queue/draw/facing/body의 원팀 추출 구간은 양판 모두 원문과 동일하다. 기존6/6 기록은 선택 buffer upload-prefix와 별도 body 호출을 관측한 source-sink 결과로만 인수한다. **생산 수정·새 테스트·기존 검사 재실행 0, 안전한 최소 생산 후보 미정/HOLD, 실게임·실제 GL·가시 픽셀 PASS 없음**.

이 문서는 원팀 원자료의 ‘idle 이중 출력/독립 CPU2D walk 커버/누락 없음’을 아래 관측 범위로 좁힌다. 원자료와 기존6/18/57/11·피격 플래시 QA 이력은 보존하며 합산하거나 새 runtime 검수로 승격하지 않는다.

## 근거·시점

| 근거 | 정확 경로·SHA-256·범위 |
|---|---|
| 실제 checkout / HEAD | `/Users/fordeargamers/Projects/exoduser-migration-20261001`; 총괄 제공 `b9fc1059345c862929e722ccb2e17591d50d5c1c` (이 작업 Git 재관측 0) |
| 현재 본편 | `game.html` — `34ba2b742523850bda8b6f204f86d216b74ce3264698277f6e6c728f9c75bdf7` |
| 현재 easy | `game-easy-test.html` — `24f820a162d8ef545caf910116119cb09db6980c0f9508d48867eff5dc7d8adb` |
| 정적 영수증 | `tmp/mac-migration-runtime/continued-review-20261002/anim-body-static/receipt.json` — `807b0f169ac5995c6a69dad510bfc792348f6a5c63fe035b7c0385984e8cf482`; 새 JS/GL 실행 0 |
| 원팀 원자료 | `tools/team-followup-20261002/supervisor-next/ANIMVFX/ANIMVFX-texture-failure-body-0548/{TASK.md,result.md,evidence.json,checks.mjs}`; formal completion `1a18b23f-aff4-4469-b28b-c4cb9f0d9476`, review `2026-10-02T06:05:08.186983+00:00` |
| 기존 검사 | `2026-10-02T05:59:15.754Z` 시작/`.790Z` 종료, 원영수증 exit0·6/6. 당시 full source는 main `dc711864…`, easy `1f139e0c…`; 현재 full SHA와 구분 |

원팀 결과/증거/checks SHA는 각각 `b3c9c905bb6b4c71b78cb9c559c334963712403c264a330285c38581c3aba688` / `9693803cda23924cf65bfb8decbf786ccad2591e58b6dba8ef1ee4742405c7e7` / `2b831f1e568d2d52104c4514338082092d8ace6e26f759e8dbc04e248feef261`이다. TASK SHA는 `31f61c904365c17d9eec1d9990a09b909f86ac58c60be7670157c9e27b860587`이며 모두 byte 보존한다.

## 현재 소스와 동일 추출 구간

| 구간 | main / easy 행 | byte·SHA-256 (양판 동일) |
|---|---|---|
| queue | 5028–5041 / 4683–4696 | 870 / `acbf8ebfdebb079e7196931721e8bdb9dfdbc9201a823ea81d8003c169d7b1a6` |
| draw | 5042–5061 / 4697–4716 | 976 / `4378a60213e9a2ad068b4b735e6a7cb7c617e10c8ade65899ff523b15c7a63e7` |
| facing | 22234–22238 / 21279–21283 | 201 / `38aa12292c84a2ba1e5c56cb61cc4f23f7c0d485040b3ab027271eb21f395b33` |
| body | 52000–52018 / 50489–50507 | 1164 / `a7fca5d0b0b49687ae59abc713097848860c357722d110c7ddb1a7a1fe9a11a9` |

위4는 원팀 checks의 동일 regex 경계이며 마지막 닫힘 행 EOL을 제외한다. 영수증의 추가 backend/caller whole-line 경계는 마지막 EOL을 포함한다. 따라서 draw 976/977byte 및 `_getTex`의 2586/2587·1787/1788byte 차이를 코드 변경으로 해석하지 않는다.

| id | 현행 접점·행 (main / easy) | 확인한 정적 사실·검증 경계 |
|---|---|---|
| C1 | prep idle/walk 5181–5197 / 4836–4851; draw 호출 5231 / 4885 | prep는 `_ch8Atlas[e._mobCh]||_ch8Atlas[1]` 선택, idle 등록 성공 뒤 optional walk 반환값을 받지 않고 `e._ensGLMode=1`. aggregate draw 반환값에는 적별 표시 성공 피드백이 없음 |
| C2 | 일반 body 외부 51986–52020 / 50475–50509 | `_eDrew=!!_ensGLQueued` 초기화 뒤의 `_ch8Atlas[1]` 일반 `if(_a8)` idle/walk body에는 queued guard가 없음. ch1StartMedium 및 boss/ghoul/slime/special 분기는 별도이며 모든 queued 적이 이 body에 진입한다고 일반화하지 않음 |
| C3 | draw 5042–5061 / 4697–4716 | `_getTex(img,true)` falsy면 해당 버킷 skip. nonnull 경로는 buffer·texture·`drawArraysInstanced(GL.TRIANGLE_STRIP,0,4,_cnt)` 호출 뒤 성공 검사 없이 `_drawn+=_cnt`. 양수 반환값은 실제 GL 성공/픽셀 증거가 아님 |
| C4 | X boot 6085–6089 / 5623–5627; proxy drawImage 6054–6063 / 5592–5601 | 성공한 `_useGL` boot의 X는 `_buildProxyX` GPU proxy. body의 Image `drawImage`도 같은 `_getTex→_setTex→_tQuad/_quad`로 전달됨. 독립 CPU/Canvas2D 구제를 관측하지 않음 |
| C5 | WebGL `_getTex` 5746–5769 / 5292–5310 | 소스 업로드 throw/0크기/최대치 초과 뒤 투명 RGBA1×1 업로드를 시도. `createTexture` nonnull 및 fallback 업로드 완료 때 그 투명 핸들을 캐시/반환할 수 있고 같은 `_glVer`는 재시도 없이 캐시 반환. createTexture null/2차 업로드 throw의 성공보장 0. 본편 URL 공유 경로와 easy 차이는 일반화하지 않음 |
| C6 | instanced shader 4951–4980 / 4606–4635 | sampled alpha≤0.001 discard 및 sampled alpha×packed per-instance alpha를 정적으로 확인. nonnull 핸들·양수 `_drawn`만으로 가시 픽셀을 보장하지 않음. 이 shader 사실을 bodyproxy shader의 픽셀/동일 전달 검수로 확대하지 않음 |
| C7 | 전체 draw prep 호출 51063 / 49562; queued 캡처 51240 / 49737 | 해당 일반 body 조건에서 prep 인스턴싱 뒤 body 호출도 가능함을 소스에서 확인. 전체 caller의 실제 실행·동일 픽셀 중첩·합성 alpha·실기 렌더링은 UNKNOWN |

기존 등록 상수는 버킷 한도 `_ENS_GL_MAX=512`, 전체 등록 한도 `_ENS8_GL_MAX=1024`, `_ENS8_GL_GROUPS=16`, `_ENS_GL_STRIDE=9`이며 이번 수치/공식/함수/에셋 변경은 0이다. 추가 정적 shader SHA는 `35cab177b7b6f8e832d4b4e4138fb1dd9c7c9b2cb9c5f6315d6a8e2f9c712b32`, proxy drawImage는 `7a2054e8ee3df16331768b89ade6e3d931d74fa76c30561fdc3aa10e598572f8`이다.

## 기존 fixture가 기록한 범위

| 판본·합성 경계 | idle/walk queue 반환 | 선택 idle/walk upload-prefix 존재 | 별도 body idle/walk drawImage 호출 | JS draw 누적 반환 |
|---|---|---|---|---:|
| main both_ready | true/true | 1/1 | 1/1 | 2 |
| main walk_tex_null | true/true | 1/0 | 1/1 | 1 |
| easy both_ready | true/true | 1/1 | 1/1 | 2 |
| easy walk_tex_null | true/true | 1/0 | 1/1 | 1 |

`glIdle/glWalk`의1/0은 선택 `bufferSubData` sentinel-prefix 입력으로 계산한다. checks의 `drawArraysInstanced(m,f,c)` 대역은 3번째 vertexCount4만 기록하고 4번째 instanceCount를 빠뜨리며 `glInst` 로그는 assert에 사용하지 않는다. 위 값은 실제 GL 개체/픽셀 수가 아니다. 원팀 idle2/walk2 또는 idle2/walk1 합산은 서로 다른 단위의 기록을 더한 값이며 같은 픽셀의 이중 출력 판정으로 사용하지 않는다.

queue 입력은 x9999/8888,y0이고 별도 body 입력은 e(340,420),r20,Pnull,walkDist200,sa1이다. queue walk UV sx256과 body frame sx1280도 다르다. bodyFactory는 `_eDrew=false/_usedSpr=false`로 시작해 실제 외부 `_eDrew=!!_ensGLQueued`와 구분하며, Pnull이라 플레이어 근접 facing 갱신도 실행하지 않는다. prep·전체 draw caller·같은 객체의 연결 실행·실제 `_getTex`·GL/Canvas 구현은 실행하지 않았다. walk-null은 대역의 합성 null이며 실제 backend의 투명 캐시 실패와 동일하게 취급하지 않는다.

## 생산·문서 Gate

| 항목 | 판정 | 다음 인수 경계 |
|---|---|---|
| 정적 source-sink | 기존6 기록 및 동일4 추출 fragment의 범위만 인수 | 새 실행/실 GL PASS 수치 없음 |
| 안전한 최소 후보 | 미정/HOLD, productionAccepted=false/runtimeAccepted=false | queue-only 또는 body-skip 단독 생산 채택 금지. draw 이후 실패 정보·버킷/적 대응·실제 caller 조율의 계약 먼저 필요 |
| 실제 표시/실패 복구 | UNKNOWN | 유효 자원·UV/기하·화면 위치·alpha·텍스처 수명·실제 GPU 결과/가시 픽셀 근거 필요. 같은 캐시를 쓰는 body 호출만으로 복구 완료 금지 |
| 전체 일반화 | UNKNOWN | 모든 queued 몹/다른 아틀라스/특수 body/플레이어·카메라·lifecycle/전체 frame 경로 미실행 |
| 유지 | 변경0 | 발 앵커 UNKNOWN·corpse fade 보류·스킨/프레임/좌표·전투·기존 hitFlash 계약. geometry/art/배치·맵/카메라 QA 0 |

| 정본 | 최소 동기화 | 원문 보존 범위 |
|---|---|---|
| [스킨 렌더링 파이프라인](몬스터_스킨_렌더링_파이프라인.md) | 기존35행 mode1→Canvas본문중복방지 설명 및78행 T4를 정정하고 부록 추가 | 승인한2접점 외 모든 기존 byte/개행 보존 |
| [스킨 시스템](../5.0애니메이션파이프라인/몬스터_스킨_시스템.md) | 기존45행 mode1→본문skip 설명 정정 및 작은 참조 부록 | 승인한1접점 외 모든 기존 byte/개행 보존 |
| [ANIM master](../5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md) | 일반 body Gate와 기존 hitFlash 검수를 구분하는 부록 추가 | 기존 전체 byte prefix 보존 |
| 2026-08-09 GPU 로드맵 / 2026-08-10 전체 작업보고 | 당시 skip·성능 설명을 역사로 분류 | 원문 수정0; 현재 body 보장으로 승격하지 않음 |

전체 docs 검색은 관련 regex를 `rg --no-config -n --with-filename --no-heading --color never --hidden --no-ignore`로 무절단 저장했다. 쓰기 전 163행/53문서/71001byte, raw SHA `49253e00729974768347c89399b539900767fb46f28cc5f71bc1eb573927db84`. 정확 path·행별 분류와 원문 백업은 `tmp/mac-migration-runtime/continued-review-20261002/anim-body-docs-backup/2026-10-02T09-05-06.157Z-8aa70d14-6c2d-49f5-9394-0e6106fa21e0/`에 보존한다. 분류 초안 SHA `17675f105671663c0bb2f9122aa95aacc894016f3e33665cd1de19f13f681c05`는 추가5.0 소유 승인 전 시점이며 최종 영수증에 승인/정본 완료 상태를 별도로 기록한다.

다른 renderer/backend·텍스처 캐시/워밍업·피격 플래시/VFX·보스·맵·은꼬리/에셋·펫·과거 검수·팀 영수증·LOCK 및 보호2_3는 이번 접점과 구분해 보존한다. root CHANGELOG/통합 기록은 총괄 소유다. 소스/테스트/원자료·실게임/native/UI/GL/DOM/픽셀/청취·서버/빌드/설치/삭제 작업은 0이다.
