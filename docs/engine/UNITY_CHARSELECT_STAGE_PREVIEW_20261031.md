# 캐릭터 선택 사슬 재판정 — Unity 검토 전용 후보

사용자 2026-10-31 승인 한 건. 기존 UI CLI16552/기록01a18dd8-1d54-7be3-874a-55557d23b1cc, G:/exoduser-wt/codex-unity-ui만 사용한다. 일반 제품·unity/main·Desktop 채택은 승인 전 보류한다.

| 항목 | 현재 계약 |
|---|---|
| 검토 진입 | --unity-character-stage-preview 및 명시적 --unity-qa-sandbox 절대 경로. 기본 실행은 기존 영상/UI |
| 자동 검수 | --unity-character-stage-check -output 절대 경로. 한국어/독일어/프랑스어 ×1920×1080/1600×900, 5직업·이름창·기존 IMGUI 키보드/마우스 주입·36개 대기 연속 프레임 |
| 소스/훅 | 신규 NativeLobby.CharacterStage.cs·Tools/CharacterStagePreviewCapture.cs. 기존 SilverCharacter.DrawSilverScene에 조건부 배경 연결1줄, NativeLobby.OnGUI에 명시적 QA 입력 처리1줄 |
| 검수 도구 | 자기 Tools/character-stage-preview/analyze.cjs로 새36화면의 실제 가림/글자 교차·GPU알파 대조군 검사, review.cjs로 1920/1600 같은크기 참고 비교4장과 UI/무대1x72장 생성. 정적 Blender 비교를 새 Player로 표시하지 않음 |
| 원본 | I:/EXODUSER-Storage/demo-art/charselect/charselect_stage_geometry.glb SHA82ca46ab1e708a220eee8b1f5ede8d596d7b7bfbeb5e28e62c4a75477349b7e9 읽기 전용. Blender·원본 영웅·타인 작업본 수정0 |
| 기하 | 520개 원본 노드, 5재질 그룹, 176994정점/103124삼각형. 오른손→Unity Z반사·삼각 순서 반전·법선 역전치·UV V반전. 문 72/-58도, 뒤막12.6m, 후실 관문11.72m·안쪽 벽·턱·첨두 리브 추가 |
| 재질 | 보유 CC0 수도원 석재·산화철 6내장 이미지. 전용 URP PBR(StagePBR), BaseColor·GL Normal·금속B/매끄러움1−G×roughness. 전투 씬 전역 SH/sky 대신 국소 확산RGB(.012,.014,.018)과 실제 무대 광원 사용, 흑철에RGB(.28,.25,.23) 곱. 원본 텍스처 바이트 보존 |
| 카메라 | 독립 layer28·별도 RT·월드 원점(10000,0,10000). 로컬(3,2.85,-7.8)→(.95,1.5,.4), 수직화각24도. 게임 카메라·RenderSettings 변경0 |
| 전사 | 현재 Characters/Warrior 프리팹의 단일 인스턴스·기존 NativeHeroMotion 대기 재사용. 렌더 직전 실제 스킨으로 표시높이1.85m·석대0.48m 앵커 보정, Y회전−14도·대검/발 접지 계측. 기존 Idle/무기 홀드 샘플 뒤 흉곽0.8도·1.5rad/s 호흡, 원본 모션 파일 변경0. 독립 대기 표본은 Core Tick·피해·저장 호출0 |
| 잠금/흐름 | 전사/실버테일/헬거너/변성술사/창법사 순서와 뒤4잠금 유지. 미보유 직업 복제0·선택/이름/취소/뒤로/저장 코드는 변경0 |
| 보존 | 기존WIP·씬 실물615파일 5944926bytes I:착수백업/ 복사·SHA 일치 뒤 018ce33f2 정상 병합. 빌드 직전 다시 byte 고정 |
| 비용/채택 | 신규 유료/외부게시/일반실행본 교체0. 기존 Blender/depth-finish RETOUCH·미채택 및 실제 계측 실패1회 이력 유지 |

현재 독립컴파일0오류·기하 회귀4/4. 정식 빌드·실제 Player·기능·M1·1x·시각은 아직 미검증이다. 검수 결과와 가장 큰 결함은 I:/EXODUSER-Storage/demo-art/charselect/unity-preview-20261031/REPORT.md에 이어 기록한다.

## 첫 실제 후보 FAIL과 1회 보완

공식빌드6f5556b1 오류0/MCP제외212파일·160DLL/참조0. 처음 USB초기화 접근위반1회는 공식재시도 성공과 별도로 보존하며 UPM기동1실패·기존이력도 유지한다. Player f9e09f67 정상exit0·창/잔여/USER_SAVE0이나 5장 뒤 마우스 QA 실패와 전사 뒷모습·발 침하·밝은 후면을 직접 확인하여 FAIL1이다. 종료코드만으로 PASS하지 않는다.

검수자의 다른 MonoBehaviour OnGUI에서 입력을 직접 호출한 것이 GUI.Button hotControl 문맥과 달랐다. QA 입력은 이제 원래 NativeLobby.OnGUI/Draw에서 받으며 일반 입력/기본 실행은 바꾸지 않는다. 초기3프레임의 접지를 폐기하고 독립 부모 앵커에서 렌더 직전 매 프레임 교정한다. 전사 원본·NativeHeroView/Core/게임 카메라 변경0. 새 입력의 정식빌드·Player·M1·1x는 미검증이며 같은 실패 재발이면 중단한다.
