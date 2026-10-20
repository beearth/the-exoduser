# DEMO11-46 Mac 로컬 export·실행 검수

현재 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`의 제품 코드로 로컬 QA 앱을 만든다. P5-001a 당시 없던 Mac 프리셋을 추가했다. 배포 승인·공증·Windows 인수나 미병합 기능의 완료를 뜻하지 않는다. 실제 단계별 결과는 [DEMO11-46 보고서](../engine/orders/reports/demo11-46_REPORT.md)를 따른다.

공식 [Godot 4.7.2 export templates](https://github.com/godotengine/godot-builds/releases/tag/4.7.2-stable)의 tpz와 SHA512-SUMS를 대조하고 macos.zip만 `_out/demo11-46/templates/`에 보존했다. 표준 전역 templates 폴더에는 설치하지 않는다. [공식 macOS export 문서](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_macos.html)의 Universal 2·고유 bundle identifier·로컬 ad-hoc 서명 방식이다. notarization·Developer ID·공개 배포는 수행하지 않는다.

```sh
python3 tools/export_demo11_mac.py \
  --godot-bin /Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot \
  --template /Users/fordeargamers/exoduser-wt/_out/demo11-46/templates/macos.zip \
  --out-dir /Users/fordeargamers/exoduser-wt/_out/demo11-46

python3 tools/run_demo11_mac.py \
  --app /Users/fordeargamers/exoduser-wt/_out/demo11-46/mac/Godot.app \
  --out-dir /Users/fordeargamers/exoduser-wt/_out/demo11-46 \
  --label field-review --scene field
```

출력에 기존 앱이 있으면 덮어쓰지 않고 중단한다. 다른 출력 경로를 선택한다. 모든 Godot 작업은 정확한 pgrep 명령과 2개 이상30초 대기를 적용한다. QA 앱의 경로도 `Godot.app/Contents/MacOS/Godot`로 만들어 다른 작업의 같은 gate에 집계된다. bundle ID는 `com.exoduser.demo11-46`로 기존 게임과 구별한다.

editor/export는 override.cfg를 무시한다. 따라서 export 도구는 자기 worktree의 project.godot에 격리명 `EXODUSER-demo11-46-Isolated-20261021`·QA package name·ASTC/S3TC import를 임시 적용하고 finally에서 원본 bytes를 복원한다. Windows/Web preset bytes도 유지한다. 정상 제품 실행에는 exporter 원본을 바꾸지 않으며 Main/State/Player 코드를 수정하지 않는다. 실행 전에 PCK project.binary를 오프라인으로 읽어 namespace·main scene·bundle ID를 검증한다. 검사 실패 시 앱을 실행하지 않는다.

공식 template는 command-line scene override가 비활성화되어 있다. 기존 독립 로비만 검사하려면 별도 출력에 `--entry-scene lobby`로 export한 뒤 그 앱에 `--scene lobby`로 실행한다. 로비 variant ID는 `com.exoduser.demo11-46.lobby`. 이는 시작 씬만 지정한 **별도 진단 앱**이며 로비→필드 router를 구현하거나 왕복 검수를 대체하지 않는다.

Main 미병합인 06c 저장·복원, 07 로비 인계, 09 실제 설정, 38/39 종료 흐름 등은 실패와 구분한다. 04의 슬롯 이름 메타 IO와 실제 Player 진행 복원도 구분한다. 가짜 payload/직접 save 쓰기로 이어하기 화면을 꾸미지 않는다. 기존 게임 창·서버는 재시작하지 않는다. 자기 QA 앱의 정상 UI 종료를 원칙으로 하되, 이번에는 화면 승인 거절로 자기 PID만 SIGTERM 정리했으며 정상 종료·종료 저장으로 세지 않았다.

산출물은 checkout 밖 `~/exoduser-wt/_out/demo11-46/`에 둔다. `.git/info/exclude`에는 `/_out/demo11-46/`·`/godot/demo11-46-export/` 예방 패턴을 추가했다. 앱/템플릿/pack/import cache/원로그를 Git에 넣지 않는다.

초기 시행착오의 격리 한계: 처음 두 번의 editor import는 override.cfg만으로 격리하려 했으나 editor가 이를 무시했다. 앱/게임 저장 함수는 실행하지 않았지만 engine의 기본 First user-dir 존재확인/생성 가능성을 배제할 수 없다. 기존 저장 내용은 읽거나 복구 명목으로 추가 접근하지 않았다. 해당 구간을 First 접근0으로 주장하지 않으며 초기 로그·공식 main.cpp의 setup(...,editor)/ensure_user_data_dir 근거를 `_out`에 보존했다. 이후의 수정 도구·패키지·앱은 실제 격리값으로 확인한다.
