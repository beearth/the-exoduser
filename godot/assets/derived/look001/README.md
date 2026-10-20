# LOOK-001 파생 노멀맵

원본 PNG에서 결정적으로 계산한 후보이며 AI 생성은 사용하지 않는다. 원본 RGB 밝기는 재질 요철의 추정치이고 실제 지형 높이·충돌·측정된 표면 방향이 아니다. Gaussian sigma 2px → alpha 가중 밝기 → 프레임별 Sobel → strength 2 → OpenGL normal. 원본 크기·알파를 보존한다.

PNG 바이너리와 Godot import 캐시는 커밋하지 않는다. `manifest.json`은 원본/파생 SHA-256, 프레임 격리 크기, 알고리즘과 정확한 재현 인수를 기록한다. 현재 19개 PNG는 이 폴더에만 생성한다.

작업 전용 Python 환경에 `tools/look001_requirements.txt`를 설치한 뒤 저장소 루트에서:

```sh
<task-venv>/bin/python tools/look001_derive_normals.py --project godot --sources godot/assets/derived/look001/sources.json --output assets/derived/look001/ --strength 2 --blur-radius 2 --green-channel opengl
python3 tools/look001_run_compare.py --import-only
./godot/run-look-001.command --mode B
```

새 import도 동시 실행 잠금·전역 프로세스 수 확인·격리 userdir·override 종료 정리를 적용한다. 기본 게임/프로젝트 설정에서는 이 폴더를 로드하지 않는다.
