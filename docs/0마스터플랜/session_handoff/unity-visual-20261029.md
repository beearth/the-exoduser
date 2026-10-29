# Unity 시각 담당 NTFS 재개 인계 — 2026-10-29



## 2026-10-29 NTFS 재개 최종 제작·검수 영수증

- 빌드 입력: `e9dc9700a96613f316f0ea9e0ebff771b3cd000f`, 브랜치 `codex/pc-unity-visual-ntfs-20261029`. 공통 `13c23929eefa1780334935af2c17ba0802d72965`를 정상 병합한 후보이며 작업 브랜치 원격 SHA를 읽어 대조했다.
- Unity 6000.6.7f1 시작 f8eca84f 성공. 최종 Win64 빌드 8e05c001 컴파일0·BuildReport 오류0. 숨은 D3D11 Player 1dbb47b3 M1 23/23, RX9070XT, 사용자창0·잔여0·USER_SAVE 변경0.
- 기존 성공 피격 oracle 3000사례·47559검사·불일치0은 현재 Core 트리/웹 블롭이 동일해 보존했다. 새 oracle 실행으로 세지 않는다. 새 화면 배치의 40개 밀집 문자·HUD 경계·보스 예약20개 검사는 통과했다.
- RM-INT: 2D 2d585d6f와 최종3D 16b5187b 각1800틱·180기록·해시11640a5da4a88c94·기록 불일치0. 2D 실행본과 최종 실행본의 Runtime/Core DLL 바이트 동일을 확인하여 같은 성공검사를 반복하지 않았다.
- 최종 직접 판정: **요청 6건의 큰 차이 해소 범위 PASS / 전체 맵 VISUAL VERDICT: RETOUCH**. 제작자 직접 판정이며 독립 총괄 검수와 구분한다.

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
| VISUAL VERDICT | 요청6건의 큰 차이 해소 PASS, 전체 맵 RETOUCH, 독립 판정 미실행 |
| NEXT PASS | 맵 담당: 외곽 조형·독액·움직임 리모델. Unity UI 담당: 실제 통계 미이식 연결. 통합 담당: 같은 후보 unity/main·바로가기 검수. Mac 소유자: 소스 반영·실행 검수 |

최종 영수증은 `I:/EXODUSER-Storage/unity-visual/ntfs-20261029/최종-검수영수증.json`. `COMMON_RULES.md`의 지정 unity-integrator 제한 때문에 시각 담당의 직접 unity/main push/바로가기 교체는0이다. 구 update_unity_latest.ps1는 직접 Unity 실행·이전 빌드 삭제·구 E 경로가 포함돼 사용하지 않았다. 인계서에 허용된 대체 경로로 검증된 exe를 기존 바로가기 백업 후 연결하는 구체 절차를 준비한다. 기존 사용자 실행본·세이브·창은 보존한다.


- 문서 포함 최종 원격 후보: e87453039d9fa4c33bc08ae34a0439764df2c61a. 빌드입력 e9dc9700a96613f316f0ea9e0ebff771b3cd000f와 Unity 입력 byte 동일(후속1개 검수문서만).
- 이 문서는 main의 문서 인계다. Unity 제품 소스의 공통 통합·바탕화면 실행본 반영과 구분한다. COMMON_RULES의 지정 통합 담당 제한 때문에 해당 두 단계는 대기다.
