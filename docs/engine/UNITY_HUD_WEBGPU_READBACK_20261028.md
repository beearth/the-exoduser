# UNITY 웹(WebGPU) HUD 스킬 바 회색 띠 — Readback 결함 수정 — 2026-10-28

배정: 유니티 총괄(개발툴 DT-16 발견). 브랜치 `claude/unity-pc-hud-webgpu-20261028`(origin/unity/main에서 분기). 비교 캡처 `I:\EXODUSER-Storage\devtools\web\compare_hud_pc_vs_web.png`.

## 원인

`NativeHud.BuildLabelCleanBar()`(NativeHud.cs 115~)는 스킬 바 원본의 키 글자 픽셀을 지운 런타임 복사본을 만든다. 복사본은 `Graphics.Blit(bar, rt)` 뒤 `Texture2D.ReadPixels`(동기 GPU Readback)로 얻는다. WebGL/WebGPU는 RenderTexture를 동기로 읽을 수 없어 복사본이 빈(흰) 텍스처가 되고, 그 위에 `GUI.color (.8,.8,.8)`가 곱해져 밝은 회색 띠가 나온다.
같은 Readback이 `NativeInventoryWebLayout.BakeKnightLit()`(기사 실루엣 밝기·그림자 굽기)에도 있다.

## 수정

| 항목 | 내용 |
|---|---|
| 새 `NativeCpuPixels.UseCpu(texture)` | `Application.platform == WebGLPlayer`이고 소스 텍스처가 읽기 가능(`isReadable`)일 때만 참 |
| `BuildLabelCleanBar` | 참이면 `bar.GetPixels32()`를 복사본에 넣는다(Readback 없음). 거짓(데스크톱)이면 **기존 Blit + ReadPixels 경로 그대로** |
| `BakeKnightLit` | 같은 방식. 참이면 `knight.GetPixels32()`, 아니면 기존 경로 |
| 소스 텍스처 | `ui_bar_only.png.meta` `isReadable: 1`, `inventory/knight.png.meta`는 60바이트 스텁이던 것을 같은 형식의 전체 TextureImporter 블록 + `isReadable: 1`로(guid 유지). 이 폴더는 `SourceTextureImporter`가 모든 텍스처를 비압축·8192로 가져오므로 CPU 픽셀이 Blit 결과와 같은 해상도·값이다 |

PC(데스크톱) 화면은 **코드 경로가 그대로**라 바뀌지 않는다(읽기 가능 플래그는 메모리만 약 8MB 늘린다: 바 2460×546 + 기사 688×1024).

## 같은 결함이 남은 곳 (고치지 않음)

| 위치 | 내용 |
|---|---|
| `NativeGame.WorldDrops.cs` `StripBackground`(45행) | 드랍 아이템 그림의 배경 제거에 같은 Blit+ReadPixels. 아이템 텍스처가 많아 읽기 가능으로 바꾸기엔 범위가 크다 → 웹 드랍 표시가 문제면 별도 과제 |
| `NativeHud.cs` `Pixels(RenderTexture)`(157행) | QA 프로브용(화면에 영향 없음) |
| 캡처 하네스(`NativeGame.M1Check.cs` 등) | 검수 전용 |

## 검증

- Roslyn 컴파일 0 오류.
- 웹 확인(WebGPU 빌드에서 스킬 바 회색 띠가 사라지고 키 글자가 지워진 바가 나오는지)은 웹 빌드를 돌리는 개발툴 DT-16 쪽에서 한다. 이 브랜치로 웹 빌드를 만들어 `compare_hud_pc_vs_web.png`와 같은 구도로 다시 비교해야 한다.
- PC 1x 캡처 전후 비교(바뀌지 않아야 함)는 Unity 순번 뒤에 채운다.
