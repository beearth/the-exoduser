# 기검참 피드백 source oracle

원본 함수를 Node VM에서 오프라인 실행하고 순수 C# 코어를 .NET8에서 비교한다. Unity Player에 JS는 포함하지 않는다. `Tools`는 I: Junction이며 출력도 I:에 지정한다. 상세 수치·제한은 `docs/engine/UNITY_FEEDBACK_CORE_20261024.md`가 정본이다.

```powershell
C:/nvm4w/nodejs/node.exe unity/Tools/feedback-oracle/export.cjs --source-root E:/exoduser-wt/codex-port-takeover-20261023 --dependency-root G:/exoduser
C:/nvm4w/nodejs/node.exe unity/Tools/feedback-oracle/run.cjs --project E:/exoduser-wt/codex-port-takeover-20261023/unity --out I:/EXODUSER-Storage/qa/unity-port-20261024/feedback-runs --label feedback-green-new
```

`--source-root`와 `--project`는 Junction 실체와 달리 실제 checkout을 명시한다. acorn은 기존 개발 dependency의 `--dependency-root`에서 읽는다. 새 결과는 새 label로 저장하여 RED/기존 결과를 덮어쓰지 않는다. 실제 Editor/Player/오디오/화면 검수는 별도다.
