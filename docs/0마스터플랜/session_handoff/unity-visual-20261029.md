# Unity 시각 담당 NTFS 재개 인계 — 2026-10-29



## 2026-10-29 NTFS 재개 최종 제작·검수 영수증

- 빌드 입력: `e9dc9700a96613f316f0ea9e0ebff771b3cd000f`, 브랜치 `codex/pc-unity-visual-ntfs-20261029`. 공통 `13c23929eefa1780334935af2c17ba0802d72965`를 정상 병합한 후보이며 작업 브랜치 원격 SHA를 읽어 대조했다.
- Unity 6000.6.7f1 시작 f8eca84f 성공. 최종 Win64 빌드 8e05c001 컴파일0·BuildReport 오류0. 숨은 D3D11 Player 1dbb47b3 M1 23/23, RX9070XT, 사용자창0·잔여0·USER_SAVE 변경0.
- 기존 성공 피격 oracle 3000사례·47559검사·불일치0은 현재 Core 트리/웹 블롭이 동일해 보존했다. 새 oracle 실행으로 세지 않는다. 새 화면 배치의 40개 밀집 문자·HUD 경계·보스 예약20개 검사는 통과했다.
- RM-INT: 2D 2d585d6f와 최종3D 16b5187b 각1800틱·180기록·해시11640a5da4a88c94·기록 불일치0. 2D 실행본과 최종 실행본의 Runtime/Core DLL 바이트 동일을 확인하여 같은 성공검사를 반복하지 않았다.
- 제작자 제출 당시 자체 PASS 표기는 아래 중앙 CTO 독립 판정 RETOUCH로 대체한다. 6항목 전체·보스 리마스터·AAA 완성 PASS가 아니다.

| 요청 | 최종 직접 확인 | 비교 이미지(1600×900 원본을 좌우 배치) |
|---|---|---|
| 거대한 붉은 빛줄기 | 시야를 덮던 띠·끝 사각면 제거, 약한 광원 흔적만 남음 | I:/EXODUSER-Storage/unity-visual/compare_01_빛줄기.png |
| 피격 붉은 막 | 지형·캐릭터가 읽히는 약한 반응. Core 초기.25×색.25=.0625 | I:/EXODUSER-Storage/unity-visual/compare_02_피격막.png |
| 작은 캐릭터 | 웹과 유사한 원본 픽셀 높이로 복원. 카메라 H는 실제900 | I:/EXODUSER-Storage/unity-visual/compare_03_카메라.png |
| 평평한 분홍 바닥 | 기존 피부 컬러맵 주름·혈관과 냉한 회색 톤 복원, 잘못된 알파 광택 제거 | I:/EXODUSER-Storage/unity-visual/compare_04_피부바닥.png |
| 보스 바닥·문자 겹침 | 토양 경계 완화, 실제 드루이드 몸 경계에 글자0, 피해·상태 문자 공유 배치 | I:/EXODUSER-Storage/unity-visual/compare_05_보스문자.png |
| 클리어 경계·작은 글자 | 검은 계단 단절 제거, 제목21px·결과폭368px·버튼하단80px | I:/EXODUSER-Storage/unity-visual/compare_06_클리어.png |

웹은 정확 game.html 블롭을 별도 서버로 읽고 상태를 고정해 캡처했다. 페이지오류0·사용자창0, 캡처 실행 ee73ec65/실제 보스AI 34e22765. 이는 실제 OS 입력 종단 검수가 아니다. 보스 AI 프레임·레벨·통계·방향/모션 프레임이 완전히 같다는 주장은 하지 않는다. 보스 바닥과 글자·실루엣 가림, 결과 글자 크기/외곽을 비교하는 근거다.

### MAP PRODUCTION REPORT

| 구분 | 이번 범위와 판정 |
|---|---|
| STAGE | CH1-1 RM-1 시작~R2 및 기존 드루이드 아레나/출구 표현 |
| MASTER | 기존 실루엣·구역·주 경로·곁공간 유지. 새 맵 설계0 |
| OUTER MASS | 좌/우/상/남 덩어리·큰 구멍 재설계0. 기존 둥치 반복 실루엣은 맵 담당 재작업 |
| LARGE | 기존 웹 피부 컬러맵·기존 메시 사용. 새 합성/실루엣 제작0·새 충돌 덮침0 |
| MEDIUM | 기존 연결 유지. 외곽 중간 연결의 전체 품질은 별도 미완성 |
| GROUND | 기존 높이 전후 동일. 컬러맵 주름/normal·매끄러움.08·광원 연결 수정, 오염·혈관 원본 유지 |
| PLAYABLE | 넓은 전투공간·이동/휴식/위협 공간·Core 불변. M1 전투23/23, 보스 문자 가림 개선 |
| LANDMARK | 주/보조/세부 랜드마크 변경0·전체 리모델 판정 대상 아님 |
| CAMERA QA | START/EARLY는03-move, ARENA는11a, EXIT는13 캡처 직접 확인. SIDE L/R·LANDMARK·LATE 전체 맵 독립 시각 검수는 미실행, RM-INT start/mid/north/east 보조 증거 |
| TECH QA | 자연 보스 게이트/출구 M1통과·Core 충돌/전투 기록 동일. 웹 pageerror0. 404는 전수 검증 아님. 아레나 계단 seam 해소. UPM/로딩 성공. 성능 수치는 이번 최적화 PASS로 주장하지 않음 |
| FILES | 자기 시각 코드·피부 입력·관련 docs만 반영. 자동 임포트450파일은 I:에 SHA 보존 후 현재HEAD 바이트 복구. tools/guard.baseline.json·미추적 meta는 별도 보존 |
| GIT | 정확경로 커밋·작업브랜치 비강제push/원격SHA 대조. unity/main·실행본 반영은 지정 통합 담당 대기 |
| VISUAL VERDICT | 중앙 CTO 독립 판정 RETOUCH, 제한 개선만 인수. 6항목 전체 PASS 아님 |
| NEXT PASS | 맵 담당: 외곽 조형·독액·움직임 리모델. Unity UI 담당: 실제 통계 미이식 연결. 통합 담당: 같은 후보 unity/main·바로가기 검수. Mac 소유자: 소스 반영·실행 검수 |

최종 영수증은 `I:/EXODUSER-Storage/unity-visual/ntfs-20261029/최종-검수영수증.json`. `COMMON_RULES.md`의 지정 unity-integrator 제한 때문에 시각 담당의 직접 unity/main push/바로가기 교체는0이다. 구 update_unity_latest.ps1는 직접 Unity 실행·이전 빌드 삭제·구 E 경로가 포함돼 사용하지 않았다. 인계서에 허용된 대체 경로로 검증된 exe를 기존 바로가기 백업 후 연결하는 구체 절차를 준비한다. 기존 사용자 실행본·세이브·창은 보존한다.


- 문서 포함 최종 원격 후보: e87453039d9fa4c33bc08ae34a0439764df2c61a. 빌드입력 e9dc9700a96613f316f0ea9e0ebff771b3cd000f와 Unity 입력 byte 동일(후속1개 검수문서만).
- 이 문서는 main의 문서 인계다. Unity 제품 소스의 공통 통합·바탕화면 실행본 반영과 구분한다. COMMON_RULES의 지정 통합 담당 제한 때문에 해당 두 단계는 대기다.


## 2026-10-29 지정 통합 최종 인수 — RETOUCH 기술 반영

작업ID `unity-ntfs-visual-reviewed-integration-20261029T140030Z`. 중앙 Codex CTO가 기존 NTFS 담당을 이 한 건의 unity-integrator로 지정했다. 같은 G 작업본·세션에서 수행했으며 새 팀/작업본/CLI writer를 만들지 않았다.

| 경계 | 최종 결과·근거 |
|---|---|
| 소스/원격 | expected unity/main13c23929eefa1780334935af2c17ba0802d72965를 fetch·원격조회·조상검사 후 정확 후보273773008115698a005138fa4ff741a3cc1d8d17로 비강제 fast-forward 반영. 원격 SHA 동일 확인. 다른 대기 Mac/runner/보스 후보 추가0 |
| 빌드입력 | e9dc9700a96613f316f0ea9e0ebff771b3cd000f와 후보의 unity tree1f77e160a60a93317d24b24998095a90935fc2cd 동일. 후속은 검수문서만, Unity 입력 변경0 |
| 기존 실행 증거 | Win 빌드8e05c001 컴파일0/빌드오류0, Player1dbb47b3 M1 23/23·창0·잔여0·USER_SAVE0, RM-INT2D/3D1800틱·180기록 전체동일/해시11640a5da4a88c94. 기존 oracle 재사용과 새검사 구분 유지. 성공 빌드/M1/oracle/웹 검수 반복0 |
| 실행파일 | I:/EXODUSER-Storage/unity-visual/ntfs-20261029/accepted-build/EXODUSER-Unity.exe, SHA256 9806abde4a406ed68647e9505852c49f6aa72a372f4f084e2aa2821affea57a2 재대조 |
| 일반 바로가기 | 바탕화면 지옥의 길 (Unity).lnk만 위 exe로 연결. 인자 -force-d3d11 --remodel3d, 시작폴더 accepted-build, 아이콘 같은exe,0. 저장 후 네 속성·해시·반영시 원격273773008 재조회 |
| 보존 | 일반 바로가기 변경전 사본은 원래와 동일 SHA c2e22c41f88f6089e9270db8ce610757d7907cfe2f26ec80cd34676716900ebb. 미리보기 바로가기 SHA ac9a0cf88cee2739e33c195ed84cd361daf079b9ee529cacc092f9254e4560d0 전후동일. 구 실행본·unity-latest 폴더·사용자 게임/세이브·양쪽guard·MP4원본/임포트사본·oldI·과거실패 기록 보존 |
| 작업 제외 | 자동 사용자앱 실행0, Unity 새시작0, 구 updater 사용0, 외부배포/Steam/SetLive0, 비용/삭제/OS·신뢰·예약설정 변경0, CTO_STATE 쓰기0 |
| 공백 예외 | root의 전체 diff --check는 normal.png.meta의 Unity 생성 빈 scalar7행 trailing whitespace 때문에 status2. root-intake-cosmetic-exception.json의 제한 검증exit0·의미영향없음 예외를 이 단위에서 인수. 전체 diff-check PASS로 기록하지 않음, 원본/검사설정/빌드 변경0 |

### 중앙 CTO 독립 시각 판정 — 최종 RETOUCH

root가 compare_04/02/05/06과 accepted-m1/caps의03-move·11a-druid-volley·13-stage-clear를 실제1600×900로 직접 확인했다. 거대한 붉은 띠 제거·피격 알파 계약·피부 주름 복원·검은 계단 단절 해소만 제한 범위에서 인수했다. **회귀 없는 기존 기술 수정의 분리 가능한 RETOUCH 통합**이며 6항목 전체·보스 리마스터·AAA 완성 PASS가 아니다. 신규 FAIL 보스 아트 채택0. 앞선 제작자 자체 PASS 표기는 이 독립 판정으로 대체한다.

| 남은 결함 | 담당·다음 실제 검수 대상 |
|---|---|
| 보스 문자 좌우 열의 과도한 확산·낮은 색 대비 | Unity 전투표현/UI 담당: 실제 밀집 보스전에서 배치폭·대비 수정 후 같은 시점1x 비교 |
| 반복 외곽 둥치·지면 접합 | 맵 담당: 외곽 큰형태/중간연결/접지 리모델 후 실제 게임 카메라·전투 가독성 검수 |
| 클리어 미이식 통계·하단 희미한 문구·상단 LV/SP 겹침 | Unity UI 담당: 실제 상태 연결·대비·겹침 수정 후 클리어1x 검수 |

이 단위의 source 통합과 로컬 바로가기 연결은 완료했다. 손 조작 Player 종단검수·Mac 반영/실행·전체 맵/보스 리마스터 완성은 별도이며 이번 증거로 완료 처리하지 않는다. MAP PRODUCTION REPORT의 최종 VISUAL VERDICT는 **RETOUCH**다. 위 남은 결함은 후속 담당의 다음 패스이며 이 한 건 결과 제출 후 대기한다.

실제 근거: I:/EXODUSER-Storage/unity-visual/ntfs-20261029의 지정통합-선행확인.json, 지정통합-소스반영.json, 통합-바로가기-선행확인.json, shortcut-after.json, root-intake-cosmetic-exception.json, 지정통합-최종영수증.json. 제품소스 반영 SHA와 그 뒤 문서 전용 SHA를 최종 영수증에서 분리한다.
