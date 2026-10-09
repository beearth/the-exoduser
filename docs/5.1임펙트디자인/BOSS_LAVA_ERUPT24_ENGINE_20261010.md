# 보스 화염비 용암 분출24 — 2026-10-10

`ROOT-ENGINE-BOSS-LAVA-ERUPT24-20261010`. 실제 보스 `fireRain` 착탄의 9장 표시만 새24 원화로 개선한다. 기존 공용 `lava_erupt`와 원 PNG·전투·지면 예고를 유지하며, 엘리트와 악의기둥을 새 보스 시트로 바꾸지 않는다.

## 실제 소비와 시간

| 항목 | 현재 계약 |
|---|---|
| 시작 | `_bossStartPattern` case fireRain의 원 `_frN` 선언 뒤 `_loadBossLavaEruptClip()` prefetch. 등록 시 자동로드0; 같은 공유promise/Image1·실패 자동retry0 |
| 생성 | 원 phase·12+4×phase개/개당3 RNG·delay30+6i·반경400+random×200/누적상한없음 보존. loader가 수·위치·피해·RNG를 변경하지 않음 |
| 착탄 | `!fr.hit && fr.t>=fr.delay`에서 원hit 설정 뒤 1회. 원size=min(fr.r×2.5,360), 실제보스360²·center(fr.x,fr.y−90)/angle0/isSkillfalse/basealpha.85 |
| 선택 | 원 `_VFX_SHEETS.lava_erupt.img` ready면 exact 원sheet객체 alias boss_lava_erupt. 원img미준비는 원id 요청/factoryno-op; 새clip pending/invalid/drawerror는 원9generic fallback |
| 원factory | frame768²/3열/9장/speed5/maxFrames9/명목45진행. 24×5=120으로 수명변경0 |
| phase | (frame+fraction)/maxFrames를 새 clip reference.75초에 매핑. bornGameTime!==undefined(0포함)은 _vfMix, nonborn은 t/frameTime. 안정game초/실32FPS/24셀자연노출 보장0 |
| geometry | dw=dh=768×원scale. caller의 −size×.25 shift만 사용/helper추가Yshift0. 명목지면anchor(.5,.75); source640의320,480 등록은물리접지인수와다름 |
| 새ready | 원end/alpha/cull/budget뒤 새helper의한셀Canvaslighter·유효alpha clamp0..1·finallycontext복원, 성공시원genericGL제출0/같은compaction |
| 원fallback | 원GLadditive/Canvaslighter/timed-grid/시계·원9등록·Image 불변. 원9 공유소비를 다시 실행해 새 완료로 세지 않음 |
| 전투/예고 | fr.r+P.r·iframe/charge·fr.dmg×elMul·KB6·detonate·shake4·결정적입자8·장판fade20·SFX/save 보존. fade20과VFX45진행은다름 |
| 공유 제외 | 엘리트M30/M32원lava_erupt9, `_drawDarkPillar` direct3열0..8→3..8반복을유지. game-easy-test 이번반영0 |

## 원화·리소스

| 항목 | 값 |
|---|---|
| 생성 | Higgsfield gpt_image_2_5/sunburst/max/4k/transparent/3:2/reference1/count1,단1job e05cd56a-96a8-40d8-8baa-e217fd38e29e,견적15credit/실debit·잔액조회0/추가job0 |
| 참고 | 원vfx_lava_erupt.png 정상HTTPS/fullbytesexact,2304²/3×3/768셀/SHA e1adf5874ea4e3a7894639eed5665112e8a78ed288a5cd6f00171c605e1096ac/원본불변 |
| 원raw | 3504×2336/6×4/584nominal셀. 24실형태변화·actualRGBA검정/회색 직접판독/backplate0 |
| 제품PNG | assets/vfx/boss/boss_lava_erupt_24_20261010.png,3840×2560/640셀/6×4/24,6175466B/SHA 227280f60cb9266d1dd31285ea46be345c2e3cc2ddd23c11acd3ee42ac777bb5 |
| 제품JSON | assets/vfx/boss/boss_lava_erupt_24_20261010.clip.json,229B/SHA a3cf87cdb8cbbae8e97c7df198c29ed83fe5172485d97910fa8e0c7e2faa552d |
| flat9 | format=exoduser-atlas-clip/version1/name=boss_lava_erupt/sourcePath 위PNG/columns6/rows4/frameCount24/fps32/loopfalse. reference24÷32=.75초는유도값/추가durationfield0 |
| packing | commonrelativecrop[-217,-444,207,73]424×517/scale1/resample0/owncellintersection·투명padding. perframe denseband정수ground등록→320,480. 위444px가512anchor384에서잘려640선택 |
| 최초packing | ownα>4/16loss0·neighbor0·edgealpha0·원copypixel exact·visibleRGBA/black/gray각24unique. 원점·후기방울궤적/물리접지는추정 |
| loader | strictflat9/공통runtime3API·reference.75/512or640or768정방grid 검사 후 immutable inset1rect24/ready. 등록시 새fetch/Image0, fireRain진입에서처음prefetch |

## 메모리·검수·남은 판단

| 항목 | 결과/한계 |
|---|---|
| 정적RGBA8 | 원20.25MiB+새37.5MiB=57.75MiB. CPU/GPU각1copy115.5MiB는가정값/실copy·scratch·driver·peak미측정 |
| 초기로드 | fireRain이없는초기화에서신규fetch/Image0인소스계약. 렉감소·GPU할당절감 실측으로 해석하지 않음 |
| 동시성 | 원visualpool20/drawbudget5/cull유지. 공격제한/모든동시착탄가시보장0/누적공격상한추가0 |
| source최초 | 별도epoch1/8그룹114조건PASS/actionable0/blocking0; actualwhole통제함수·realruntime 소비이며 wholegame아님 |
| actualPNG최초 | 별도first epoch1/8PASS·1alpha oracleFAIL/helper24, 별도delta epoch2/0PASS·1alpha oracleFAIL/helper5. 첫24상 singlecell/독립RGBAoracle/24unique/nonempty통과·재실행0. source와합산0/PNG전체PASS 아님 |
| PNG검수한계 | pure setter진단 .85→216/255로literal/tolerance oracle의backend정밀도충돌을확인. helper관측값·delta5상태가저장되지않아직접대조/native복원·회전·scale·born·clamp aggregate미확정. process종료로PNG decode총2/cache재사용계약미충족; 추가decode/helper0/제품finding0·수정0 |
| 준비와 수정 | 읽기추출StopIteration1+lazyfixture writer indentAssertion1은제품실행전준비2건/PASS합산0. 최초source전lazyrefinement1/제품실행뒤code수정0 |
| 시각 | ROOT rawRGBA/ground등록proof/360px키프레임 직접판독. 상승핵→어두운crown→갈라짐→잔불은읽힘. 마지막darklip·열잔존/중후기연속성·실지면접지는RETOUCH |
| 본편인수 | actualnormalmain/정상줌/전체보스전/GPU·동시성능/청취·실save/AAA未인수. 그림장수24·resource32FPS·화면FPS를구분 |

**VISUAL VERDICT: RETOUCH.** 새24 원화와 실제main consumer 연결을 전체보스전품질·성능인수로대신하지 않는다. 서버/사용자게임·save를무단조작하지않고, 현재 환경 경계가해소되면 실제상태를먼저확인한뒤검수한다.
