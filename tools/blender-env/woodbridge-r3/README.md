# 썩은 숲·나무다리 R3 레시피와 검수 계약

현재 산출: I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3/
현재 원본: source/승인구도_납품동일.blend (packed)
현재 납품: delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3/
현재 판정: 위 루트 REPORT.md·직접-시각판정.json. Unity/게임 PASS가 아니다.

Git 레시피 실체는 I: code-checkpoint/woodbridge-r3이며 G: 전용 sparse 작업 폴더의 이 경로는 junction이다. 원래 작업 폴더의 공용 WIP/INDEX를 건드리지 않았다. 바이너리/원화/후보/렌더는 Git에 넣지 않는다.

## 현재 후보를 검수할 때

레시피는 원래 산출 루트에 복사해 실행한다. Node는 __dirname, Blender는 해당 I: 절대경로를 사용한다. launch.cjs로 무창 Blender를 한 작업씩 실행한다. Unity/Player를 실행하지 않는다.

1. 현재 .blend와 source/모듈명세_납품.json, 납품-파일영수증.json을 같은 후보로 확인한다.
2. verify_fbx.py → alpha_verify.cjs → verify_packed.py → validate.cjs로 현재 바이트를 검사한다. package.cjs는 파일을 변경하므로 필요할 때만 먼저 실행하고 새 영수증을 검사한다.
3. render_delivery.py(1920×1080 조립), render_delivery.py --modules(모든 모듈52도·같은 조명) → boards.cjs. final_report.cjs는 실제 직접 판정 JSON을 읽는다.
4. 기술 PASS와 실제 그림/1x/게임 PASS는 별도다. .blend를 바꾸거나 재수출하면 이전 SHA·렌더 근거를 재사용하지 않는다.

## 제작 이력의 의존성

앞단 제작 레시피는 각 입력 .blend와 r2 원본을 필요로 하는 순차 이력이다. 현재 최종본에 전체를 다시 실행하는 일괄 명령이 아니다. 원본/중간 후보는 I: 산출 source/에 보존했으며, 새 격리 산출 폴더에서만 경로를 바꾸어 재현한다.

초기 스캔/지면 제작→원본 Alpha 연결→실제 뒤틀린 나무 스캔→실제 high/low 베이크→지면 노멀 기저 수정→바닥 섬/전경 파단 목질/말뚝 교체→실물 넓은 잎의 처진 이끼→원래 연속 UV의 나무6맵4K 재베이크→수면 대리면/실물 뿌리 접합→우측 전경 질량→실물 낙엽 atlas/접지→흙·이끼암반 톤→다리 부패 BaseColor 재베이크→실제 행렬 회전 교정/기존 배치 보존→실제 전체 그루터기 스캔으로 제작법 전환/6맵2K→최종 접지/중경 조립→connect_medium_mass의 실제 접점/바깥 드레이프/북강둑 목질 연결→water_scum_finish의 반영/연속 부유막 대리면→freeze_candidate 순이다. bark_detail이 만든 표면 노드가 rebake_tree_uv의 입력이다. dense_moss_foam의 이끼 메시 부분은 후속으로 대체됐고 비정형 거품만 유지했다. replace_moss_fronds는 중간 이력이며 dense_photofronds가 현재 채택이다. UV를 바꾸는 이력 스크립트를 최종본에 반복 실행하지 않는다.

root_groundline의 잘린 그루터기는 후속 실제 전체 스캔으로 교체됐다. fix_rotation_geometry의 새 말뚝/균류 데이터만 adopt_rotation_fix가 인수했고, 잠재 Euler를 일괄 활성화한 조립은 채택하지 않았다. 최종 삼각형/규격/피벗은 현재 모듈명세 계약을 따른다.

폐기실험/의 불투명 천막형 이끼, 매끈한 섬유 코어, 절차적 전경 뿔은 현재 채택0이다. 해당 실패와 방법 전환은 REPORT.md에 명시한다.

출처는 Poly Haven CC0, 공식 API MD5·SHA를 출처-원본영수증.json에 기록했다. 유료 호출/구매0. game/Runtime/세이브/충돌 변경0. 새 스케줄/팀/서버/앱 실행0.
