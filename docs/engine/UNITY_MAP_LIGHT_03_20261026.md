# UNITY-MAP-LIGHT-03 — 플레이어 어둠홀 원인 재분석

상태: **CPU_ANALYZED_GPU_BLOCKED / 수정·신규 실행 미완료**. **VISUAL VERDICT: RETOUCH**.

지정 시작 SHA `8fb4072dbaab414203da69989159c327f9ca53f9`, 전용 브랜치 `codex/unity-map-light-03-20261026`. 기존 Unity AFTER에 플레이어 r470 어둠홀이 없다는 가설은 기존 픽셀·코드 대조로 지지되지 않았다. 임의 광량 증폭이나 검증되지 않은 코드 수정을 하지 않았다. 이 문서는 결함 수정 완료·새 빌드 인수 보고가 아니다.

수치·행 정본은 snapshot SHA256 `dee094fd165e9b2fb3fbf0eb9cacc3bc3eddeb2c8eeea9c4772ba6cbc1f05209`. 실제 입력 경로·SHA는 외부 `source-analysis-inputs.json`.

## 원인 분석과 수정 판단

| 항목 | 코드·픽셀 근거 | 판단 |
|---|---|---|
| 반해상도 좌표 | 웹 `_pushLight`: 좌표×.5/r=floor(470×.5)=235, 캐시를 화면에2배. Unity `NativeFieldLighting.Light`: full-screen 좌표와 floor(470×.5)×2=470; shader는 정규화 UV×logicalSize로 계산 | 좌표·반경 이중 절반 적용 없음 |
| stamp | half r235의 최근접은250. `HoleRect(470)`은250 atlas rect, shader `(px−center)/(470×2)+.5` | 웹 half stamp500px를470px 지름으로 줄이고 최종940px 지름으로 그리는 것과 동일 |
| destination-out | `alpha=.38; alpha*=1−saturate(a×stamp)` 및 premultiplied RGB=(6,16,9)/255×alpha | 방향 오류 없음 |
| 중심 | 플레이어·카메라(4020,7420), 1920×1080, 등불 화면 중심(960,534), P.y−6 | 위치 오류 없음 |
| 어둠홀 강도 | a=.86±.03, 중앙잔여 alpha=.0418~.0646, 외곽 .38 | 중앙에 주변 어둠의 약83~89%가 제거됨. 이 패스는 베이스 아트 이상의 발광을 추가하지 않음 |
| 코드↔실제 Unity | LIGHT02 OFF 바닥 픽셀에 원본470 stamp·.38 어둠·환경/안개/grade 공식을 적용. 허용된 a .83~.89와 fog pulse .20~.36만 탐색 | 14,863픽셀에서 RGB byte MAE **.352799/255**, a=.89/fog=.27. 원본470 어둠홀이 기존 AFTER에서 실제로 렌더됨을 강하게 뒷받침 |
| 대안 반경 | 같은 픽셀의235/470/940 반경 모델과 대조. `radius-hypotheses.json`은 비네트 미포함 근사라 작은 차이가 있음 | RGB MAE 약1.918 / .352 / 4.312. 반경235 축소 오류 모델이 실제와 더 불일치 |
| 웹의 추가 중앙광 | snapshot4653~4691은 펫 r250 색광원/어둠홀도 수집.55203 bloom,55288~55321 iris sprite/halo 등 웹 전용 레이어 존재. LIGHT02 메타데이터상 적·펫·전투 후 복원 상태 | 전체 웹 이미지의 추가 밝기를 r470 단독 결함으로 특정할 수 없음. 웹 center glow ci6는 false 유지. 각 추가 레이어의 정확한 기여량은 이번 격리 재캡처 없이 확정하지 않음 |
| 수정 | 생산 코드/조명값/공용 NativeGame.cs 변경0 | 원인 미확정 상태에서 임의로 r/a·합성을 바꾸지 않음 |

`source-formula-fit.json`의 오차는 encoded sRGB RGB byte 평균절대차다. 원본 Canvas2D gradient/캐시 양자화까지 동일하다는 인증은 아니다. a/fog는 캡처 시점의 직접 telemetry가 아니라 허용 범위 내 가장 맞는 값이며, 정적 픽셀 대조와 새 런타임 검증을 구분한다. 중앙60px의 플레이어를 제외하고 x320..1599/y80..829를8px 간격으로 샘플링했다. 외곽·동적 오브젝트와 웹 미이식 환경의 완전 동등성은 주장하지 않는다.

## 기존 캡처 방사 밝기 프로필

중심(960,534), 반경0~600px/20px 간격,1440개 등각 방향의 원본픽셀 평균. 휘도 지표는 encoded sRGB Y′=.2126R+.7152G+.0722B(0..255); 물리적 linear luminance가 아니다. 각 이미지의 같은 좌표·각도를 사용했다. HUD를 제외하기 위해 공통 y60..839만 포함하므로 r320 이상은 부분 원호이며 표본 수를 명시한다. r0~40은 캐릭터/웹 적·펫에 오염되어 바닥 전용 측정으로 읽지 않는다. 0반경은 동일 픽셀을 반복한다.

| 반경 px | Unity 02 AFTER | 웹 | Unity 조명 OFF | 표본 수 |
|---:|---:|---:|---:|---:|
| 0 | 195.522 | 113.923 | 209.292 | 1440 |
| 20 | 43.067 | 83.947 | 42.907 | 1440 |
| 40 | 45.124 | 90.992 | 45.336 | 1440 |
| 60 | 44.661 | 69.667 | 44.958 | 1440 |
| 80 | 42.356 | 61.527 | 42.584 | 1440 |
| 100 | 42.029 | 55.898 | 42.580 | 1440 |
| 120 | 42.662 | 50.888 | 43.511 | 1440 |
| 140 | 40.970 | 45.533 | 41.677 | 1440 |
| 160 | 40.587 | 42.732 | 42.282 | 1440 |
| 180 | 40.760 | 40.567 | 43.624 | 1440 |
| 200 | 40.205 | 38.400 | 43.187 | 1440 |
| 220 | 39.417 | 36.767 | 43.322 | 1440 |
| 240 | 37.920 | 34.779 | 42.510 | 1440 |
| 260 | 37.811 | 34.421 | 42.429 | 1440 |
| 280 | 37.148 | 33.633 | 42.307 | 1440 |
| 300 | 36.700 | 33.305 | 42.783 | 1440 |
| 320 | 36.487 | 33.633 | 42.725 | 1301 |
| 340 | 35.632 | 32.974 | 42.762 | 1231 |
| 360 | 35.073 | 32.679 | 42.964 | 1185 |
| 380 | 34.680 | 32.354 | 42.878 | 1149 |
| 400 | 35.184 | 32.533 | 43.117 | 1119 |
| 420 | 34.699 | 32.163 | 42.914 | 1093 |
| 440 | 34.219 | 31.685 | 42.850 | 1071 |
| 460 | 33.811 | 31.328 | 42.750 | 1053 |
| 480 | 33.505 | 30.836 | 42.518 | 968 |
| 500 | 33.718 | 30.702 | 42.833 | 874 |
| 520 | 33.214 | 30.211 | 41.965 | 814 |
| 540 | 33.130 | 29.960 | 41.849 | 766 |
| 560 | 33.906 | 30.329 | 43.156 | 728 |
| 580 | 33.709 | 30.657 | 42.792 | 694 |
| 600 | 33.865 | 30.945 | 43.067 | 664 |

Unity 중심20px42~43/외곽600px33.865로 이미 어둠홀의 밝기 변화가 있다. 웹은20px83.947/100px55.898/180px40.567로 더 작은 국소 추가 밝기가 두드러진다. 이 표만으로 펫과 다른 발광의 정확한 기여를 분리하지 않는다. 신규 AFTER03가 없으므로 **수정 전/후 표의 후 열은 미측정**이며 기존02를 후03로 재표기하지 않는다.

## GPU 공유 차단과 남은 실행

실행 전 ps에서 사용자 Player3개38141/48476/52157 이외에 다음 QA Player가 이미 실행 중이었다. 이 작업이 시작하지 않은 프로세스이므로 종료하지 않았다.

`PID61637 …/_out/UNITY-MAP-LIGHT-02/build/EXODUSER-Unity.app/Contents/MacOS/EXODUSER Settings QA`

여러 CPU 작업 경계에서 계속 살아 있음을 확인했다. 사용자 지시의 “다른 Codex의 Unity가 돌고 있으면 GPU 작업을 시작하지 말라”에 따라 Editor/import/build/새 Player/Chrome/node/GPU 캡처·측정 실행0. 사용자에게 재확인 요청0. 실행을 반복해서 통과시키거나 숨은 대체 GPU 경로를 사용하지 않았다.

| 요청 항목 | 실제 결과 |
|---|---|
| 기존 AFTER·웹 프로필 | 완료, `radial-before.csv`, `radial-method.json` |
| 원인 코드 확인·수정 | 의심한4오류 불일치, 실제 어둠홀 동작 근거 확보. 수정0, 웹 추가광의 단독 원인은 미확정 |
| 빌드1회·시작 재캡처·프로필 후 | GPU 차단, 미실시. Library 복사0 |
| 제단 재캡처 | GPU 차단, 미실시 |
| 프레임시간1회 | 미실시. 기존02 평균8.361290/p95 8.487210/p99 8.902835ms는 과거값만 참조. 새 비교값·개선 주장 없음 |
| 기존 이미지 재결합 | `captures/player_light_existing_compare_1x.png`3840×1080, Unity02 AFTER\|WEB. `player_light_existing_crop_1x.png`1920×780, 각 crop(480,60,960,780), 무리샘플링. 기존 재료 재사용이라고 manifest에 표시 |
| 요청된 신규 이미지 | `player_light_compare_1x.png`/신규 크롭·제단 파일을 생성했다고 보고하지 않음 |
| 실패·재실행 | 새 Unity 빌드/테스트 실행 자체0, 실패한 실행 반복0, 새 진단 테스트 파일0 |
| 보호 | NativeLobby/NativeLobbyVideo/오디오/intro-silence/타 WIP/일반 사용자 저장 변경0. NativeGame.cs hunk0. 매프레임 코드 변경·할당·로드 추가0 |

## Git·보고 경계

origin 지정01 ref를 fetch하고8fb4072와 대조, origin/main은fab7a167c30c6421bda8cf6d4c2ee2e7753e87f3. 지정 no-checkout worktree/02와 같은 sparse pattern/read-tree 후 tracked INDEX/WORK 깨끗함 확인. 자기 docs만 경로 지정 commit·새03브랜치 비강제 push. 원격03은 작업 시작 시 없음. hook `.githooks` 유지, -A/main push/force/reset/rebase0. 원격 SHA와 정상 worktree 제거 최종 결과는 외부 DONE.txt. PC 동기화 미확인.

## MAP PRODUCTION REPORT (§23)

| 항목 | 상태 |
|---|---|
| STAGE | CH1-1, 기존 캡처의 조명 CPU 분석만 |
| MASTER | silhouette/regions/main route/side spaces 변경0, 공통 가이드 전체 읽음 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경0 |
| LARGE | source assets/composites/overlap/repeated silhouette 변경0 |
| MEDIUM | connections/remaining holes 변경0 |
| GROUND | shadow 어둠홀 원본식 대조, contamination/structure integration 변경0 |
| PLAYABLE | arena/travel/breathing/threat 공간 변경0; 실제 combat readability 새 검수0 |
| LANDMARK | primary/secondary/tertiary 변경0; 제단 새 검수0 |
| CAMERA QA | START 기존02 분석, EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 새 실행0 |
| TECH QA | route/collision/pageerror/404/seam/loading 새 검수0; performance GPU 차단 |
| FILES | stage-owned docs만, concurrent touched0, unrelated touched0 |
| GIT | 자기 docs만 stage/commit/push, SHA 외부 DONE, deploy0 |
| VISUAL VERDICT | **RETOUCH — 결함 수정·새 빌드·새 캡처 미완료** |
| NEXT PASS | GPU 사용 해제 뒤 기존 fixture로1회 빌드/시작·제단·프레임 측정. 웹 펫/추가광 없는 같은 장면을 분리해야 중앙광의 정확한 원인 판정 가능. r/a 임의 상향 금지 |
