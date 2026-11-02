# 여성 2인 얼굴 원형·헤어 LOCK 및 게임 제작 준비 v19

2026-11-02 사용자 확정: “비대칭 단발이랑 굻은 포니테일로 하자”, “인게임에 넣을수있게 이제”, “얼굴은 저대로 가져가 이제 원형으로 잡고”. 현재 해석은 복근형 변성술사=굵은 높은 포니테일, 창법사=비대칭 단발이다. 사용자가 얼굴을 원형으로 확정했으므로 아래 원본 PNG 2장을 변경하지 않는 얼굴 정본으로 고정한다.

| 캐릭터 | 얼굴 원형 | SHA-256 | 현행 헤어 |
|---|---|---|---|
| 복근형 / transmuter | independent_woni_face_v17.png | 15ab7e47b4a9b3efd4ac4062b4ef7e528ae69fca7f382b60f2543b6094fd912d | 흑갈색 굵은 높은 포니테일 |
| 창법사 / spearmage | independent_liv_face_v17.png | fc2198af2bec17d8895fcb400368c76f7698614764d6134b6d520b1bc8760e32 | 먹자주 비대칭 단발 |

얼굴 원본은 assets/art-reference/female-faces/20261102/와 아래 패키지의 *.face-lock.png에 동일 바이트로 보존했다. 후속 얼굴은 이 원본 한 명만 참조하며 이전 동일 얼굴 합본, 상대 캐릭터 얼굴, 미채택 생성 얼굴을 기준으로 삼지 않는다. 머리·갑주·포즈 변경을 이유로 눈/코/입/턱 구조를 재디자인하지 않는다. 파생 렌더는 원본과 대조하며 원본 얼굴 PNG 자체는 교체하지 않는다.

## 준비한 파일

패키지: assets/characters/female-heroes/20261102-v19/. 바탕화면 사본: 엑소듀서_검토/캐릭터_인게임준비_20261102/.

| 파일 | 범위 | 상태 |
|---|---|---|
| transmuter.face-lock.png / spearmage.face-lock.png | 확정된 얼굴 원형 2장 | 원본 해시 고정 |
| transmuter-thick-ponytail.front.png | 복근형·굵은 포니테일·왼팔 단일 청색 코어, RGBA 전신 | 정면 원화·알파 검증 |
| spearmage-asymmetric-bob.front.png | 창법사·비대칭 단발·복부 갑주·가슴선/허벅지, RGBA 전신 | 정면 원화·알파 검증 |
| transmuter.turnaround.png | 정면 / **왼쪽 측면(인물이 화면 오른쪽을 향함)** / 후면 | 3면 제작 참조 |
| spearmage.turnaround.png | 정면 / **오른쪽 측면(인물이 화면 왼쪽을 향함)** / 후면 | 3면 제작 참조 |
| transmuter.turnaround.before_side_correction.png | 측면 방향 교정 전 | 보존 이력, 현행 입력 제외 |
| face-lock.json / production-manifest.json | 원형 해시·역할·상태·입력 영역 | 원화 제작 계약 |
| alpha-audit.json | 실제 RGBA 알파·경계·픽셀 규격·피벗 제안 | 정적 분석, 런타임 승인 아님 |
| generation.receipt.json | 실제 전체 프롬프트·입력·출력 해시 | 내장 image_gen 이력 |
| preview.html | 밝은/어두운/체크 배경과 정본·3면 보기 | 원화 검토 페이지 |

내장 image_gen 5회(포니테일+투명화 1회, 단발 투명화 1회, 3면 2회, 복근형 측면 방향 교정 1회)를 사용했다. 실제 모델 ID·비용은 미노출이다. 투명화는 원본 컷아웃에 가까운 생성 편집이며 픽셀 동일 추출이라고 주장하지 않는다. 알파 존재·원형 파일 동일 바이트·HTTP 응답은 검증했고, 머리 가장자리와 실사용 발 접지는 엔진 화면 검토가 남았다. 3면 시트의 보이지 않던 등/옆 구조는 추정이며 보정된 정사영 3D 모델의 증거가 아니다. 복근형의 코어 장갑은 해부학적 왼팔에만 둔다.

## 현재 적용 경계

현재 산출물은 **게임 제작 원화 패키지**다. 플레이어용 3D 메시·UV/PBR 텍스처 세트·Humanoid 리그·대기/걷기/공격 클립·다방향 전투 스프라이트는 아직 없다. production-manifest의 gameplayReady와 runtimeApplied는 false다. 정지 전신 PNG를 기존 플레이어에 덮어씌워 완성으로 취급하지 않는다.

Unity 본편과 localhost:3333 웹 중 적용 대상을 질문했으며 답변 대기다. 답변 전 엔진 의존 작업이나 기존 캐릭터 선택/전투 코드는 변경하지 않았다. 현재 웹 index.html의 두 직업은 folder가 비어 있고 comingSoon=true이며 해당 잠금을 해제하지 않았다. Unity 캐릭터 보드는 시트→메시→리깅/Animator→실제 인게임 검수 단계를 요구한다. 그 문서의 오래된 원화/은발 기준보다 이 얼굴·헤어 최신 LOCK이 우선하지만 기존 팀의 작업 경로·예약은 인수 없이 변경하지 않는다.

Unity 선택 시: 이 정본의 각도/의상 검토 → 메시/얼굴 닮음 → UV/재질 → 머리·망토·장갑 분리와 리그 → 대기/이동/공격·무기 소켓 → 같은 빌드 1x 게임 카메라 검수. 웹 선택 시: 현재 플레이어 리소스 계약을 확인한 뒤 실제 카메라의 기준 프레임부터 검수하고 idle/walk/attack 방향 시트를 연결한다. 승인 마법창 3종은 별도 정본으로 유지하며 금속 강체 규칙을 따른다. 유료 3D 작업은 잔액/승인 범위 확인 전 제출하지 않았다.

저장·검증·격리 Git 백업 도우미는 output/character_style_variations_20261101/finalize-gameprep-v19.cjs다. 공유 INDEX·타 팀 WIP·실행 중인 서버·게임은 보존했다.
