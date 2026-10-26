# UNITY-START-PARITY-03 — 필드 전역 밝기 합성 분리

상태: **RUNTIME_REVIEWED_RETOUCH**, GPU 검수 완료/밝기 동일성 미완료. 최종 판정과 SHA는 `~/exoduser-wt/_out/UNITY-START-PARITY-03/DONE.txt`에 기록한다.

부모 `2ecc4e4abf958adf041c304e126a17f87df9510c`, 같은 `codex/unity-start-parity-01-20261026` 브랜치. 정본 snapshot SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`. main/PC/사용자 실행본 반영이 아니다.

## 원인 분리

| 단계 / id | 정본·측정 | 결과 / 변경 |
|---|---|---|
| MAP_TEXTURE | 시작 화면의 chunk_3_6/4_6/3_7/4_7 웹 사본과 Unity PNG SHA256 동일4/4, 픽셀차0. 기존 LIGHT02 조명 OFF 캡처와 같은 월드좌표 원본 crop를 비교 | 5개80×60 바닥 영역 평균채널 차 −.029167..−.045000/255. 1024→1000 bilinear 재구성과 실제 raster의 미세차. 텍스처 import가 +6 전역 차이를 만든 근거 없음 |
| IMPORT / CAMERA | Gamma project, chunk sRGBTexture1, no mipmap, textureCompression0. 해당 floor는 불투명 texture로 덮임 | 설정·카메라 배경 변경0. 화면 밖/투명영역까지 동일하다는 주장은 아님 |
| BLOOM_NORMAL | source4481–4497/55203: sixth-size canvas, multiply RGB60, self copy±2px/globalAlpha.18, 최종 globalAlpha.08. GPU proxy6028의 globalCompositeOperation setter는 no-op; pipeline5592는 SrcAlpha/OneMinusSrcAlpha | Unity composite가 `world + bloom*.08`로 가산하던 오류. **`world*(1−.08)+bloom*.08`**로 교정. 값·반경 보상0; 기존 캐시·RT·pass 그대로 |
| OTHER_LIGHTING | ambient(6,16,9,.38), env(100,160,255,.06), fog pulse .28±.08/4초, vignette .2, CSS contrast1.05→brightness.97 | 이번 값·순서·위상 변경0. 원본 encoded sRGB 감마 합성 유지. 나머지 잔차를 이 값의 오류로 단정하지 않음 |
| PRACTICE_BACKDROP | 정본 parry-lesson.css1: left45% transparent→#08070ba6, opacity.5; native practice는 해당 backdrop 미이식 | 오른쪽 공간 차이에 별도 기여. 이번 필드 조명 수정에 UI 전체 이식을 끼워 넣지 않음. 방사표는 원본 방식대로 mask0이므로 포함됨 |
| ICC | 재사용 웹 PNG에 Display P3 Gamut with sRGB Transfer ICC, Unity PNG 무태그 | 이전 표와 동일하게 저장 byte Y′를 기본 표로 유지하되 웹을 sRGB로 변환한 보조표도 기록. 저장byte를 양쪽 모두 엄밀한 sRGB라 해석하지 않음 |

조명 OFF 대조는 **기존 Unity 실제 캡처 + 웹과 동일byte인 원본 texture의 같은 floor 좌표**다. 기존 web-start-lesson-intro 자체는 조명이 화면 전체에 적용돼 완전한 무조명 영역이 없다. 새 웹 OFF runtime을 찍었다는 주장은 하지 않는다. CPU 합성 예측과 새 GPU 실측을 구분한다. 원시 근거 `texture-stage.json`, `texture-source-byte-audit.json`, `pixel-probes.json`, `source-composite-cpu-prediction.json`.

## 검수 계약·소유

빌드1회→기존 ordinary-entry54tick 시작+900프레임1회→제단 capture-only1회→기존 HUD/practice 각1회. 웹 PNG 재사용. 새 진단 테스트파일0. 실제 실패 시 무수정 재실행0, 같은 항목2회 실패 시 중지. GPU 직전 사용자 PID38141/48476/52157 제외 타 Editor/Player를 검사하며 있으면5분 간격 최대90분 대기. 자기 실행만 관리한다.

이번 생산코드 소유는 FieldLighting.shader1hunk뿐. NativeGame.cs0hunk, NativeLobby/NativeLobbyVideo/audio/intro-silence/UNITY-MAC-20261024 WIP 불변. 매프레임 load/allocation/추가RT/pass0. 전용 output의 QA identity·roster만 사용. path명시 commit/push, hooks 유지. 실제 검수 결과는 아래와 같다.

## 실제 검수 결과

**STATUS: RUNTIME_REVIEWED_RETOUCH / VISUAL VERDICT: RETOUCH. VERIFIED 아님.**

실제 렌더 입력 `416d4f2692ee1c671f8bc3768528104ffb35358e`, Unity6000.6.7f1/ARM64/Release 빌드1회,errors0/2,010,502,006bytes. 이후 생산코드 변경0. 시작은 actual ordinary-entry callback→Curtain54tick→레슨Intro, active0/held5/irisTarget4/iris.t104, player(4020,7420). 원본 웹 screenshot 재사용, 신규 웹 실행·캡처0. OS입력시험 아님.

블룸 일반합성 오류는 수정했고, 아래 실제 밝기 감소가 관찰됐다. **남은 차이의 전체 원인을 확정하거나 전역 오프셋 해소를 완료하지는 못했다.** r260/400/580 잔차 +4.039426/+3.706712/+5.094275는 유지된다. 바닥빛·어둠alpha·환경광 등을 임의로 낮추지 않았다. CSS 실습backdrop는 미이식이 코드로 확인되지만 잔차 전체를 설명한다고 단정하지 않는다. 추가 미확정 원인을 보상값으로 덮거나 동일 캡처를 반복하지 않았다.

### 시작 방사 표 — 이전 방법과 직접 대조

중심(960,534),r0..600/20,각1440,round=floor(v+.5),공통x0..1919/y60..839,mask0. 저장byte Y′=.2126R+.7152G+.0722B. **WEB은 P3 ICC이므로 이 표는 엄밀한 양쪽sRGB 표가 아니라 기존02 저장byte 방법의 연속이다.** `radial-start.csv`에는 WEB을ICC로sRGB변환한 별도열도 있다. r0는actor픽셀,바닥광량판정에서제외;각외측부분원호/UI/동적나무/펫/전경차이포함.

| r | Unity02 | Unity03 | WEB 저장byte | 이전차 | 이후차 | samples |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 193.594200 | 178.313400 | 84.343800 | +109.250400 | +93.969600 | 1440 |
| 20 | 70.224776 | 64.951244 | 63.382552 | +6.842223 | +1.568692 | 1440 |
| 40 | 71.135259 | 65.398564 | 60.631586 | +10.503673 | +4.766978 | 1440 |
| 60 | 67.765538 | 62.716271 | 56.573714 | +11.191824 | +6.142557 | 1440 |
| 80 | 61.386451 | 56.939001 | 52.051546 | +9.334905 | +4.887455 | 1440 |
| 100 | 57.392038 | 53.269838 | 48.543864 | +8.848175 | +4.725974 | 1440 |
| 120 | 54.622588 | 50.665430 | 46.170673 | +8.451915 | +4.494757 | 1440 |
| 140 | 50.056363 | 46.381623 | 42.527548 | +7.528815 | +3.854075 | 1440 |
| 160 | 47.203645 | 43.703463 | 39.998130 | +7.205515 | +3.705333 | 1440 |
| 180 | 45.758233 | 42.373206 | 38.197874 | +7.560359 | +4.175332 | 1440 |
| 200 | 43.230974 | 40.083020 | 36.232105 | +6.998869 | +3.850915 | 1440 |
| 220 | 41.341006 | 38.333496 | 34.541855 | +6.799151 | +3.791641 | 1440 |
| 240 | 39.738523 | 36.875814 | 33.097706 | +6.640816 | +3.778108 | 1440 |
| 260 | 38.633046 | 35.891413 | 31.851988 | +6.781058 | +4.039426 | 1440 |
| 280 | 38.003126 | 35.302965 | 31.156702 | +6.846425 | +4.146263 | 1440 |
| 300 | 38.339472 | 35.628053 | 30.993772 | +7.345700 | +4.634281 | 1440 |
| 320 | 38.244202 | 35.546815 | 31.526271 | +6.717931 | +4.020545 | 1301 |
| 340 | 37.682133 | 35.032533 | 31.029975 | +6.652158 | +4.002557 | 1231 |
| 360 | 37.382922 | 34.800477 | 30.961648 | +6.421274 | +3.838829 | 1185 |
| 380 | 36.007810 | 33.501090 | 29.690133 | +6.317677 | +3.810956 | 1149 |
| 400 | 35.781884 | 33.265327 | 29.558615 | +6.223269 | +3.706712 | 1119 |
| 420 | 35.099521 | 32.673339 | 29.127706 | +5.971814 | +3.545632 | 1093 |
| 440 | 34.212240 | 31.854461 | 28.987999 | +5.224241 | +2.866462 | 1071 |
| 460 | 34.163264 | 31.820306 | 28.380455 | +5.782809 | +3.439851 | 1053 |
| 480 | 33.681365 | 31.401086 | 27.999066 | +5.682299 | +3.402020 | 968 |
| 500 | 33.959474 | 31.659638 | 27.894998 | +6.064476 | +3.764640 | 874 |
| 520 | 33.258071 | 30.991946 | 28.768411 | +4.489660 | +2.223534 | 814 |
| 540 | 32.899982 | 30.686227 | 26.190785 | +6.709198 | +4.495443 | 766 |
| 560 | 33.401217 | 31.133459 | 25.311335 | +8.089882 | +5.822124 | 728 |
| 580 | 32.316149 | 30.413076 | 25.318801 | +6.997348 | +5.094275 | 694 |
| 600 | 30.566439 | 28.876541 | 27.290097 | +3.276342 | +1.586444 | 664 |

색관리 보조열의03−WEB sRGB: r20 +1.450891,r40 +4.746791,r60 +6.065854,r260 +4.038059,r400 +3.778215,r580 +5.115013. ICC 변환만으로 전역잔차가 해결되지 않는다. `captures/start_compare_1x.png`는Unity | 재사용WEB을sRGB로정규화한3840×1080,리샘플0/양쪽원본1920×1080. 기존byte방식보드는`start_compare_stored_bytes_1x.png`,확대는`player_4x.png`nearest4x. 실제 board와1x crop파일을열어시각확인했다. 원본WEB unchanged SHA와색관리방식은manifest.

### 제단 회귀1회

기존 field-lighting fixture `altar/after/capture-only`1회. 같은 camera(5900,4060), primary→animation→naturalcat은기존fixture의한실행에서회수;제단성능추가0. `captures/altar_compare_1x.png` Unity03 | 지정FIELD-VERIFY-01 WEB,3840×1080/리샘플0/P3→sRGB. 해자타원·서쪽다리·언덕/props/actors·빛층 유지,새UV뒤집힘·검정면·소실은관찰되지않음. 전체시각은 **RETOUCH**: 원본과다른펫/전경/UI·중앙바닥빛차이잔존.

| r | 03 | WEB 저장byte | 03−WEB | 설명 |
|---:|---:|---:|---:|---|
| 20 | 61.903656 | 43.582140 | +18.321517 | mask0/펫·본체포함 |
| 40 | 65.141945 | 45.251757 | +19.890188 | mask0/펫·본체포함 |
| 60 | 60.998074 | 37.329413 | +23.668661 | mask0/펫·본체포함 |
| 120 | 52.776558 | 40.878866 | +11.897692 | mask0/펫·본체포함 |
| 260 | 41.617753 | 37.722718 | +3.895035 | mask0/펫·본체포함 |
| 400 | 31.907713 | 29.542250 | +2.365463 | mask0/펫·본체포함 |
| 580 | 41.862882 | 38.156076 | +3.706806 | mask0/펫·본체포함 |

`radial-altar.csv`의historical_FIELDVERIFY native는ec6e7b0a의과거사진이며이후Ori추가전이다. 정확한직전부모before가없으므로중앙+18.321517을이번블룸의회귀로단정하지않는다. 블룸수정은동일input에서world×.08을제거하는방향이며중앙수치보상은하지않았다. 제단원본과의전체밝기동등성은미완료.

### 성능·기존검사·실행횟수

| 항목 | 실제 결과 |
|---|---|
| 성능1회 | 180warmup/900frames/cap120/vsync0. mean **8.435439690ms**,p95 **8.838421665ms**,p99 **9.924829938ms**. running/focused/render/cache900,RT재생성0. p95>8.333ms이므로120fps보장인증아님 |
| 과거성능경계 | 02 mean8.640282/p959.303167/p9911.413166은b03cb9ed6 이전가산floor빌드. df7e5bb01의정확한전후성능A/B가아니므로성능개선율주장0 |
| GC | release profilerGcValid=false. API rawupdate/render0은GC0인증아님. 새코드는1fragment식뿐,추가load/allocation/RT/pass0은정적검토근거 |
| HUD1회 | exit0,**55checks/0fail**,720/1080/idle/chargePNG4개. OS입력아님 |
| practice1회 | exit0,**5checks/0fail**,11kills,원run참조/player/config/resources/RNG/clock/actors복원true. 첫2조건범위 |
| 빌드/장면 | build1/start1/altar1/성능1/HUD1/practice1. GPU실패0/무수정실패반복0/새진단test파일0. 시각잔차발견후튜닝·추가GPU0 |
| CPU preflight | Editor시작전전체byte감사의importedmeta278+Packages2차이로중지1. 직전02실제build-input과대조하는감사코드로교정:의도한shader1개외전부동일. 이는실패Unity빌드/재빌드아님. 분석용numpy미설치·cwd누락각1도코드교정,동일실패반복0 |
| GPU소유 | 각실행직전사용자38141/48476/52157외Unity없음. 대기0. 자기Editor3938/Player4255,4278,4284,4290모두exit0;타프로세스종료0;사용자3개최종생존 |
| NativeGame | 이번diff0/추가hunk0. NativeLobby/NativeLobbyVideo/audio/intro-silencefixture/타WIP변경·병합0 |
| 저장/라벨 | output QA identity·roster만. 실제사용자저장접근0. 시작검수이름은기존StartParityCapture격리캐릭터전용;일반실행자동생성0. 이번새개발상태문구/이모지0 |
| Git | 같은전용branch,path지정commit/push·hooks유지. 원격前2ecc4e4ab→렌더416d4f269→최종docs SHA는DONE. -A/mainpush/force/reset/rebase0. 기존사용자창/PC/main/Steam반영0 |
| worktree | **RETOUCH이므로보존**. VERIFIED조건미충족으로정상제거대상아님 |

원본normal pipeline5592/proxy6028이직접수정근거다. 외부명세의premultipliedAlpha기본false도확인했지만새브라우저GPUreadback없이이를드라이버버그라단정하거나ambientRGB를추가premultiply하지않았다: [W3C WebGPU copy metadata](https://www.w3.org/TR/2022/WD-webgpu-20220531/#dictdef-gpuimagecopytexturetagged). 원본수치와관련없는감쇠보상0.

## MAP PRODUCTION REPORT (§23)

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 START/ALTAR 기존field lighting QA |
| MASTER | silhouette/regions/main route/side spaces보존 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes배치변경0 |
| LARGE | source assets/composites/overlap/repeated silhouette변경0 |
| MEDIUM | connections/remaining holes제작변경0 |
| GROUND | source bloom최종합성만일반alpha복원;shadow/contamination/structure integration배치보존 |
| PLAYABLE | arenas/travel/breathing/threat공간불변;START/ALTAR실화면가독성관찰,밀집전투미실시 |
| LANDMARK | primary/secondary/tertiary배치불변;해자·서쪽다리유지관찰 |
| CAMERA QA | START/ALTAR1x실제열람RETOUCH. EARLY/ARENA/SIDE L/SIDE R/LATE/EXIT별도실시0 |
| TECH QA | build/runtime exit0,shader-error/exception표식없음. route/collision/pageerror/404/seam/loading전수재인수아님;성능단회위표 |
| FILES | shader1hunk+관련docs. 공용NativeGame0hunk/unrelated0 |
| GIT | 동일branch정상path지정commit/비강제push;finalSHA외부DONE;deploy0 |
| VISUAL VERDICT | **RETOUCH — 잔차미해소,VERIFIED아님** |
| NEXT PASS | 남은global/국소잔차및원본practice backdrop의기여분리가미완료. 이번승인횟수내실행종료/추가미확정값튜닝0 |
