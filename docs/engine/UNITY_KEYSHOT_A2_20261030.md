# CH1-1 승인 A2 장면 — 제작 후보

사용자 승인 기준 `G:/exoduser/tmp/design-review/20261030_keyframe/APPROVED_1-1_keyframe_A2_woodbridge.png`를 직접 확인했다. 큰 거목·대각선 다리·오른쪽 독액 강·다층 안개·횃불/영웅 초점이 목표다. **현재 실게임 시각 미검증, 완료/채택 후보 아님.** 산출물은 I:/EXODUSER-Storage/steam-keyshot/a2/다.

| 항목 | 현재 코드·입력 계약 |
|---|---|
| 선행 통합 | 숲4c2797c7f + 공통642e31d2e → e82431e0d. 충돌은 기동 분기·양쪽 문서 보존, 공통 카메라·입력 수정 유지 |
| 활성화 | --remodel3d --unity-a2-forest에서만 조립. 일반 실행 채택0 |
| 자산 | r1 source1f80d0d37의 검증된11종·201파일을 Resources/Art/map/a2로 동일byte 인수. 새 루트 메타는 별도GUID. r2 최신은 HOLD/사용금지로 인수0 |
| 큰 질량 | 주간4·고목3·후경거목3층×5·먼카드2. 실제 좌표/배율은 NativeGame.A2Forest.cs. 이끼·균류·덤불4접합. 실제 가림·반복·보행은 미검증 |
| 다리 | 중심(41.8,-71.8)u/yaw−62°/scale(1,.55,.8), r1 길이8.43u 기반. 원본 지형·충돌 유지, 발 접지·동선 미검증 |
| 독액 | A2ToxicRiver: linear RGB(.075,.080,.023), 거품(.22,.24,.10), emission.012. 저주파 사인속도.12/.08, 법선.035/.025, smoothness.62→거품.16. 접촉깊이.025~.28u. 반영·GPU 표현은 미검증 |
| 수로 | 기존 River_/Pool_ 메시 재질 교체 + 비보행 외곽 z−94~−30u/81행/.8u/폭20u. x48부터 CanMove반경30px로 동쪽 비보행을 찾아+.4u. 표본 사이 보행 겹침·접합 미검증 |
| 횃불 | 기존 실제 화로·8프레임 불꽃, 위치(39.8,-75.2)/(44,-68.8)u. RGB(1,.55,.19)/강도7/반경5u/soft shadow |
| 분위기 | 배경/안개(.085,.115,.14), 밀도.028/far240u. 국소 달빛기둥3개/alpha.065/깊이·가장자리 감쇠. 그림자 적분 볼류메트릭이 아닌 메시 연출, 랜덤 노이즈0 |
| 임포트 | SourceTextureImporter v3. 기존 keyshot2 진단의 정확7종PBR은 Repeat/mipmap/Trilinear/aniso8/normal·linear. A2는 같은 색공간과Clamp. 공통UI분기 보존 |
| 기존 바닥 셰이더 | 작업 시작부터 실제 사용 중인 HellGroundPBR.shader가 미추적이고 .meta만 Git에 있음을 확인. 해당 원본 byte를 보존해 필수 런타임 소스로 함께 체크포인트하며 새 시각합격으로 세지 않음 |
| 촬영 | --unity-steam-keyshot+A2는 영상Open 없는 기존NativeGame fixture. batch GPU 월드RT1920×1080/HUD제외. 스크립트입력·생존보조·실제AI, 적/탄 직접주입0. 일반입장/손조작/HUD 검수와 구분 |
| 종료 | 미디어닫기·효과음정리·1초배출. 보스1100tick 제한 마지막 촬영 분기1099로 교정 |
| 검증 | 독립C#오류0. Unity컴파일·GPU·실제1080p/1x·M1·공통/바로가기 전부 미검증/미실행. 시작guard WIP byte보존, 사용자창/세이브 미조작, 구매/크레딧0 |

## MAP PRODUCTION REPORT

| 항목 | 현재 범위와 잔여 |
|---|---|
| STAGE / MASTER | CH1-1 부분 키샷. 기존6시시작/12시진행·Core 불변. 원화의 거목·다리·강 구도 목표 |
| OUTER MASS | LEFT/MID주간·RIGHT수로/거목·TOP3층숲·SOUTH낮은고목. 검은구멍·연속·반복은 실제카메라 미검증 |
| LARGE / MEDIUM | r1 거목/고목과 이끼/균류/덤불 연결. r2 HOLD 사용0. r1 정적RETOUCH를 실게임PASS로 올리지 않음 |
| GROUND | 원본높이맵 메시 경로 유지. 다리발접지·나무밑동·수로경계 겹침 미검증 |
| PLAYABLE | 전투면·회피·적·탄규칙 불변. 수직질량 가림·집단전투 가독성 검수 필수 |
| LANDMARK | 다리와두횃불. 전체맵·보스리모델 완료 아님 |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 현재후보 실제화면 전부미검증 |
| TECH QA | 독립C#0오류. Unity/GPU/route/collision/seam/loading/performance/M1 미실행 |
| FILES / GIT | 자기A2코드/셰이더/r1런타임/임포터·촬영/관련docs만. 공용WIP보존. 원격·채택 상태는 I:영수증 기준 |
| VISUAL VERDICT | 미검증 |
| NEXT PASS | 사용자 실행창 종료 허용/직접종료 뒤 공용실행기로 실제1920·1x·같은장소전투·원화비교→큰결함수정→같은후보M1→영수증/정상통합/바로가기 |

## 2026-10-31 재개
최신 공통 a861d0303의 진입 흐름·UI·전사 R5를 정상 병합했다. 기동 충돌은 공통의 일반 진입/명시적 빠른시작을 보존하고 A2 촬영 fixture 조건만 병존시켰다. 이번 소스의 GPU/시각/M1은 아직 미검증이다. PowerShell 호스트 시작 오류5는 CMD와 Node의 숨김 자식 PowerShell 경로로 작업을 계속했으며 전역 설정 변경0이다.
