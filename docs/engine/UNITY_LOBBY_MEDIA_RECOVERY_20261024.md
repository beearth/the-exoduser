# Unity v22b 미디어 복구

> 2026-10-24 원본 기준 정정: 이 문서의 “최신 v22b / 사용자 최신 override”는 승인 근거 미확인으로 철회한다. v22b 복사/재생 검사는 해당 후보의 결과만 뜻한다. [원본 대조](UNITY_SOURCE_BASELINE_20261024.md).


실행 원본은 `world_intro_v22b_paint_en.mp4`, 98,177,870B다. SHA256은 `cd9fa7486fd1cf18952605408f5b1bae416a97b2307806476bc329498413199e`다. GitHub 도구의64MiB IPC한도 때문에 130,903,828문자 base64 단일 전송은 실패했다. 원본의 byte를 변경하거나 품질을 낮추지 않고 네 부분으로 Git에 보관한다. 보관 부분·도구·문서는 I:의 Tools/docs 실체에 두고 실제 조립된 runtime만 SSD에 둔다.

| Git 경로 `unity/Tools/MediaRecovery/world-intro-v22b/` | Bytes | Git blob |
|---|---:|---|
| part-01.bin | 31,457,280 | a08d8bc629d7b954cf585a77ce276adbef142f32 |
| part-02.bin | 31,457,280 | 303a213498d31fc66a1a49120624d22dc4b517fb |
| part-03.bin | 31,457,280 | bc92f5a7ef4a843e21546de7b6a88966a7f8260e |
| part-04.bin | 3,806,030 | 617b10e259ed3907c19938b0d8e80bd6decd5ecc |

각 부분의 SHA256과 전체 SHA256은 같은 폴더 `manifest.json`에 있다. 원본은 G: 제작 경로/I: 기존 archive에서 보존한다. 4부분 모두 공식 GitHub blob 업로드의 반환 SHA와 대조했다. 이 자체는 branch 반영/실제 Player 검수를 대신하지 않는다.

새 checkout에서 Unity 열기/빌드 전에 실행한다:

```powershell
& C:/nvm4w/nodejs/node.exe unity/Tools/restore-lobby-media.cjs --project <checkout>/unity
```

도구는 부분 SHA·전체 SHA·쓰기 뒤 SHA를 검사하고 `Assets/StreamingAssets/Lobby/world_intro_v22b_paint_en.mp4`로 복구한다. 이 파일만 정확한 ignore 경로로 지정한다. 파일 누락 시 Editor verifier/build 준비에서 명확한 복구 오류를 내며 대체 구버전으로 성공 처리하지 않는다. 원본 디코드 음성은 v17과 동일하며 컷/자막 timing 유지한다. 사용자 세이브·인증·Godot는 건드리지 않는다.
