# 사용자 스킬·구도 결함 수정 — 2026-10-30


## 2026-10-30 사용자 플레이 결함 수정 최종 실행 증거

| 항목 | 실제 검증 범위와 결과 |
|---|---|
| 코드 후보 | ef75f883e03fdc355392ff853bde4813e8412053, Core 트리546cad24a1e4f2988fb1a268ba35a43b67a90d19 유지 |
| 정식 빌드 | Unity6000.6.7f1 Win64, 6bcf428c, 컴파일 오류0·종료0 |
| 전 입력 | 16c7536f, LMB/RMB/Shift/E/Q/Ctrl/Space/1~4/F/Z/이동+Space 14사례·44검사 통과, 1190틱·20fps401장 |
| 표현/조준 | 조준오차 최대0.021356374px, 투사체 표현 위치오차 최대2.980232238e-8u, 구르기175px·중복스킬0 |
| M1 | 72cd32e1, 23단계 전부ok·firstBlocked 없음, D3D11 RX9070XT, exit0 |
| 실행 안전 | 최종 두 Player batch 실행 창0·잔여0·사용자 세이브 변경0. 임의 OS 손조작/전체 자연 플레이의 증거는 아님 |
| 촬영 방식 | 실제 FixedUpdate/Input System/Core/실제 카메라 렌더. batch RT는 HUD 제외. 자동 검사 강제 진행은 별도 표기 |
| 원본 대조 | 스킬8416·검기93·사슬/패링187165검사 불일치0. 최신H5 관련24섹션 대조만 확인, 미이식 기동스킬까지 최신 전체동등으로 확대하지 않음 |
| 산출물 | I:/EXODUSER-Storage/demo-art/playtest-fix/final-player, final-m1, final-build, oracles |

기술 범위는 입력·스킬 이동·누적 billboard·공통 카메라 설정 수정이다. 승인 A2의 숲/목교/재질/조명 전체 환경 제작은 이 후보에 포함되지 않으며 실제 현재 환경은 여전히 차이가 크다. 카메라/영웅 가독성 개선은 RETOUCH, 전체 A2 아트 PASS 아님. 기존 hidden Player 종료 지연은 같은 경로 두 번 확인 후 중단했으며 정상 종료가 검증된 공식 batch 경로만 최종 영수증에 사용했다.

## 변경 계약

| 대상 | 현행 계약 |
|---|---|
| 입력 | AimWorld가 ExoInput.MousePosition 사용, 구르기 입력을 스킬 키보다 먼저 전달 |
| 투사체 표현 | UpdateViews 전 로컬 위치·회전 복원, Late에서 tilt/lift 1회 적용 |
| 카메라 | Resources/Data/remodel_camera.json 한 곳. 피치48.7014126도·거리14u·FOV46.9453도·영웅표시2배·북쪽추적1.45u. NativeRemodelCamera/Rm1SliceBuilder 공유 |
| 접지 | 전사9시트 알파>64 발끝240프레임. 원본 그림·Core 판정 변경0 |
| 실행 파일 | I:/EXODUSER-Storage/demo-art/playtest-fix/final-build/EXODUSER-Unity.exe |
| Runtime SHA-256 | c40dc42c502aa5ba22936712bec354cce7a310ff83bb8fc4dd567aa132e73183 |

브리프의 완료 순서는 웹 전수 비교→대기열 영수증→공통 정상 통합→바탕화면이다. 이 문서의 후속 전달 영수증에서 최종 상태를 확정한다.


## MAP PRODUCTION REPORT

| 항목 | 실제 범위·판정 |
|---|---|
| STAGE | CH1-1 런타임 카메라·스킬 표현 QA. 지형·배치 재제작은 수행하지 않음 |
| MASTER: 실루엣/구역/주경로/곁공간 | 현행 RM1 유지. A2의 깊은 숲·목교·나무 질량과는 큰 차이. 현행 환경 전체 아트 PASS 아님 |
| OUTER MASS: 좌/우/상/남/주요 구멍 | 현행 유지, 별도 전 경계 시각 검수 미수행 |
| LARGE: 원본/합성/겹침/반복 | 현행 유지. 나무·폐허 저밀도/평평한 바닥 인상 남음 |
| MEDIUM: 연결/남은 틈 | 현행 유지, A2 환경 연결 제작 미포함 |
| GROUND: 그림자/오염/구조 접합 | 영웅 투명 하단 여백을 알파 발끝으로 보정. 실시간 캐릭터 그림자·재질·환경 접합 개선은 별도 맵/캐릭터 담당 |
| PLAYABLE: 주전장/이동/호흡/위협/가독성 | Core·충돌값 유지. 테스트 열린 발사 경로14사례·사슬700px·구르기175px 확인. 밀집전 실제 가독성/자연 전 구간 완주는 별도 검수 |
| LANDMARK: 주/부/소 | 변경 없음, A2 목교 제작 미포함 |
| CAMERA QA: 시작 | 승인A2 원본 및 현재1600×900 직접 열람·동일크기 비교·1x. 영웅 약9% 화면높이, 발끝 약59% 위치. 피치48.7014126/거리14/FOV46.9453/영웅2/북쪽추적1.45 |
| CAMERA QA: 초반/아레나/좌/우/랜드마크/후반/출구 | M1 자동23단계 실행 성공과 전 입력 연속 촬영은 있음. 모든 지점의 별도 시각·자연 동선 검수는 미수행 |
| TECH QA: 경로/충돌 | Core변경0·14입력44검사·M1 23단계. 해당 테스트 밖 전체 맵 충돌은 미검증 |
| TECH QA: pageerror/404 | 웹 비교 영수증 참조. API/저장/백엔드는 격리 QA 응답이므로 서버 기능 검수로 세지 않음 |
| TECH QA: seam/loading/performance | 전체 경계/실제 로딩UI/프레임 성능 목표는 미검증. Editor오류0·최종Player창잔여세이브변경0 |
| FILES: 자기/동시/무관 | 자기 Runtime 6개·공통JSON/메타·Rm1SliceBuilder·관련SSOT. 타팀 코드 미수정. 자기 자동임포트520개는 별도해시보존후 원본바이트 복원 |
| GIT | 자기정확경로 커밋·비강제공통통합·원격SHA·Desktop후속영수증 참조. Steam/외부게시 없음 |
| VISUAL VERDICT | RETOUCH (카메라/영웅 초점의 기술 개선). 전체 A2 환경·3D캐릭터 아트 PASS 아님 |
| NEXT PASS | 기존 맵/키샷 담당: 공통카메라로 A2 외곽질량·목교·지면재질·조명/접지 재작업, 캐릭터 담당: 실제3D영웅/그림자/모션. 같은 후보의 실제전구간·HUD포함1x 검수 필요 |


## 웹/Unity 전수 비교 최종 자료

- 웹은 고정 origin/main18aef1218의 실제 update/draw와 실제 브라우저 키/마우스 이벤트로1190틱·20fps401장. 제품 소스 수정0, 시작결계·대사·적/자동석궁만 QA상태로 격리했다. API는 QA메모리응답이며 실제백엔드·저장 검수 아님.
- 검기224px·악의구410px·사슬700px·구르기175px는 웹/Unity 일치. Q는sBlock, E는sDraw/sBash, Ctrl얼음보주·Space강타·1가시덫/F회복장판·미배정2~4/Z를 나란히 직접 확인했다.
- 자료: I:/EXODUSER-Storage/demo-art/playtest-fix/스킬-전수-비교.html (원본1600×900,1x·20fps슬라이더), 웹-Unity-14입력-연속비교.mp4, 전수-비교-축소목록.png, 악의구-수정전후-연속비교.png, A2-현재-동일크기.png, A2-영웅-1x.png. 축소목록만으로1x판정을 대체하지 않았다.
- 실제 웹pageerror0. 정적 URL18개(기존 UI이미지3·글꼴2·음원13)가 읽기용G자산경로에 없어404기록; 전체웹자산로딩 PASS로 주장하지 않는다. 스킬 원본 이미지와 궤적은 비교 자료에 포함됐다.
- 웹 첫 촬영482d71ff는240초 제한종료, 재촬영b533b4f8는14입력/1190틱/401장·JSON저장 완료 후 browser.close 지연. 격리프로필로 소유 확인한 Chrome44840/56660·촬영Node27320만 종료요청했다. Chrome HasExited=true 확인. 정상종료 PASS로 세지 않으며 실행기 잔류 감지의 WMI 사후목록과 실제HasExited를 구분한다. 같은 촬영 경로 추가 반복0.
- 카메라/영웅 가독성 RETOUCH. A2의3D영웅·숲/목교 질량·재질·조명과 현재화면의 차이는 남아 있다. Q/E의 잔광·링크 및 장판표현도 원본과 조형/잔상 차이가 있어 전체 VFX아트 PASS가 아니다. 기존 맵/캐릭터/VFX 담당의 후속범위다.

영상 순서(초): LMB0~1.35, RMB1.35~2.70, Shift2.70~4.05, E4.05~5.40, Q5.40~6.75, Ctrl6.75~9.25, Space9.25~10.60, 1키10.60~11.95, 2키11.95~13.30, 3키13.30~14.65, 4키14.65~16.00, F16.00~17.35, Z17.35~18.70, 구르기18.70~20.05. 왼쪽웹/오른쪽Unity, 각1600×900.

웹 실행기 b533b4f8 최종 영수증은 ok=false/exit=-1/창0/사용자세이브변경0, 잔류1(PID56288)을 실행기가 정리했다. 해당PID와 실행기5172는 최종조회에서없음, 두Chrome은HasExited=true다. 두임시프로필은 chrome_debug.log EBUSY로 완전삭제 미완료이며 browser-profile-cleanup.json에 정확경로를 남겼다. 사용자앱/브라우저·시스템설정 변경0. 영상은3200×900·20fps·401프레임·20.05초로 인코딩/추출프레임 직접확인 완료.


## 최종 공통 반영·바탕화면 전달 완료

- GitHub unity/main: expected2584e36e4a8fd60a27dd8fbae2730c3316d07ee8 → 642e31d2ec48268e5de3eed0945cc8c2b2dbfb60, 비강제정상반영·원격ref SHA직접대조. 검증 Unity tree46c611b68a25eb47752896538ac6954048acd535 유지, 새로 섞인 UI후속/HOLD후보0.
- 사용자 `C:/Users/심도진/Desktop/지옥의 길 (Unity).lnk` → I:/EXODUSER-Storage/demo-art/playtest-fix/final-build/EXODUSER-Unity.exe. 인자 `-force-d3d11 --remodel3d`, 작업폴더/아이콘 포함네속성·Runtime SHA c40dc42c502aa5ba22936712bec354cce7a310ff83bb8fc4dd567aa132e73183 확인. 기존settings-r4링크는 backup/desktop-before-20261030-071103.lnk 보존. 자동기동0.
- 영수증 desktop-delivery.json / final-candidate.json / MERGE_QUEUE.md. 제작자직접비교 완료, 독립총괄시각검수·Mac반영은미확인이다. 소스공통반영·PC바로가기전달과 전체아트PASS는 별개다.
- 브리프의 기술수정·컴파일/oracle·M1·전수연속비교·대기열·공통통합·Desktop전달은 완료. 남은 품질은 A2환경/3D영웅·VFX아트 RETOUCH, 기존hidden종료/웹촬영종료·임시로그잠금은 위실행제약으로 명시했다.
