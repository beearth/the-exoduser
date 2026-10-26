# 단순작업3(Sonnet) 인계 — 2026-10-26 (밤)

- 세션 id `b8b2b4c2…` (local_b8b2b4c2-…) / Sonnet 5.5 / Unity 3D 맵 구현·캡처 담당(맵 총괄 전속). 모든 응답 한국어.
- 소속·연결: 맵 총괄 `local_9d17d95b-239c-4254-8bef-555b6c5e16e8`(명세·승인·검수, 현재 상위) · 디자인총괄(시각 판정 단일 창구) `local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf` · 맥북 총괄 `local_f25393ea-f5e3-45f1-80fa-c16e9daa4c6c` · 유니티 전체 총괄 `local_a65bb55a-bb3e-4c4a-a93d-412fc163bd80` · CTO `local_7072229c-70cf-4fdf-ab35-c3c59e683d53` · 단순작업4(텍스처·데칼 생성) `local_ee476d71-fea4-4528-8bbd-a09b9f527ba2`. 구 디자인총괄 `a1efbc31`은 퇴장(요청 보내지 말 것).

## 기준 문서(SSOT)
- 맵 보드 `docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md` · 기획서 `UNITY_MAP_HQ_PRODUCTION_PLAN_20261026.md`(§4.5 L1~L9, §4.6) · 아트 바이블 `UNITY_ART_BIBLE_V1_20261026.md`(내가 쓴 것) — 디자인총괄 eb8a8577 쪽은 `UNITY_MAP_ART_BIBLE_20261026.md`(main 6987ff6c4)라 값이 다르면 그쪽이 우선.
- 내 문서(작업 트리): `docs/engine/UNITY_MAP3D_S2_/SLICE_/LIFE1_/M1_IMPORT_20261026.md`.

## 작업 위치·커밋 (전부 push됨)
- worktree `E:/exoduser-wt/pc-unity-map3d`, 브랜치 `claude/unity-pc-map3d-20261026`, Unity `G:\unity\Editor\6000.6.7f1\Editor\Unity.exe`, Win64 빌드.
- `b1b1d859b` S2(조준·충돌 오버레이·조명) → `e64e57889` 슬라이스 v1 → `23451c97a` v2 → `0bf374355` LIFE1+M1 본체 → **`db58d8c86` PAINTGROUND**(최신, 미보고 후속 없음).
- 커밋 규칙: 원래 맥북 총괄이 커밋. 맵 총괄이 단위별로 "경로 지정 커밋·비강제 push"를 허용할 때만 한다. `git add -A` 금지, 재임포트 `.meta`·`FirstPlayable.unity`·`SceneTemplateSettings.json`·`unity/Tools/inventory-navigation/bin|obj`·미참조 `floor_v01b_normal/height.png`·`mass_v01_height.png`는 절대 스테이징하지 않는다. pre-commit이 `tools/guard.baseline.json`을 바꾸면 `git checkout -- tools/guard.baseline.json`.

## 현재 슬라이스(START 초점 4020,7420, 1920×1080) 구조 요약
- 지면 `Look3DGroundLayered`: 원본 손그림 청크 64개(Unity·Godot·웹 SHA 동일)를 3850×2100 렌더텍스처로 합성해 1:1 투사 → 기본색. GPT 4레이어는 세부 법선(0.2)·roughness·전이 가중치만. 색조 `SliceGroundToneDefault (1.72,1.0,0.94)`(옥스블러드, 중앙 L p50 14.1). 칠한 빛 70/동적 30(`PaintDynamicWeight`, `_L3D_PaintRef`), 점광원 웅덩이는 별도 가중(`_L3D_Pool.z`, 이득 5.0), 캐노피 고보.
- 외곽 `Look3DMass`(맥동·뿌리 바람), 슬롯→에셋 교체 `Map3DAsset`(매니페스트 비면 OBJ 폴백, 출처 칸 필수 — `NativePerspectiveWorld.Assets.cs`, `Look3DProp.shader`, `Editor/Map3DMeshImport.cs`).
- 생동감 `NativePerspectiveWorld.Life.cs`: `Look3DGrass`(풀 928, 인스턴싱, 바람·플레이어 밀기), GPU 쿼드 입자 `Look3DMote`(Particle System 모듈이 프로젝트에 꺼져 있고 `Packages` 변경 금지라 정점 셰이더로 구현), 광원 숨쉬기, 고보. 시간은 `SetLifeTime/ReleaseLifeTime`.
- 카드 `NativePerspectiveWorld.Cards.cs`(원본 prop 직립 카드, 바닥 가림 0.087%). 슬라이스 전용 추가 광원 4개는 임의값(독액/진홍/안개/독액).
- 슬라이스 실행 인자: `--unity-world3d-slice`, `--unity-world3d-fps-seconds N`, `--unity-world3d-ground-tone=r,g,b`(톤만 바꿔 재촬영, 재빌드 불필요), `--unity-world3d-assets=<매니페스트>`, `--unity-world3d-silhouette-shadow`.

## 도구 (재사용)
- `E:/exoduser-wt/_out/map3d-slice/build_and_capture.sh <태그> <FPS초>` — 빌드+캡처+요약(`build<태그>`, `capture<태그>`). `tone_try.sh <빌드> <출력태그> r,g,b`. `lstats.py`·`massstats.py`(명도 L\* 실측), `make_sheets14.py`·`make_slice_compare.py`(시트), 체크 PASS 5/5와 발자국 위반 0이 기본.
- 파일 편집은 python 스크립트 파일(`E:/exoduser-wt/_out/pc-map3d/s2/edit_*.py`)을 Write 도구로 만든 뒤 실행(Bash 인라인 heredoc이 길면 EOF 파싱 오류가 난 적 있음).
- 증거 폴더: `E:/exoduser-wt/_out/map3d-slice/{capture8,14,21,27f, life1, sheets14}`, `E:/exoduser-wt/_out/pc-map3d-paintground/`(최신 시트·크롭), Godot 기준 `E:/exoduser-wt/_out/godot-look001-refs-v2/`(C/D·ALTAR·compare).

## 진행 중·남은 순서
1. **MESHY-0 — 보류.** 명세 `E:/exoduser-wt/_out/meshy/MESHY0_SPEC.md`. Codex가 저장한 DPAPI 키(`C:\Users\심도진\.codex\credentials\meshy-api-key.dpapi`)를 복호화해 wall_B 1건(약 30크레딧) 생성하는 일. 맵 총괄이 사용자 말을 인용해 전달했으나 이 세션에서 사용자가 직접 확인하지 않았다 → **사용자가 이 세션에 직접 "진행해"라고 할 때까지 호출·키 복호화 금지.** 확인이 오면 §1~2만 먼저(키 값 출력·저장 금지, Codex 파일 수정 금지, 호출 1건, 즉시 I:/EXODUSER-Storage/Meshy 사본+SHA, `credits.log`), §3 Unity 임포트·교체 컷은 작업 트리를 비운 뒤.
2. **TOXIC**(독성 늪·사이드 독성 강) — 명세 `E:/exoduser-wt/_out/pc-map3d-toxic/SPEC.md`(§2.5 LIFE1-R 포함, 독액 색은 아트 바이블 §6 값). 같이 처리: 풀이 균일 점박이로 보임 → 군락(3~12포기)+빈 땅, 크기 편차 확대.
3. M1 마무리 행: "회화풍 다시 칠하기"(칠한 빛 마스크 굽기, 셰이더 70/30 입력, 매니페스트 마스크 필드). 실제 Meshy 에셋은 키 승인 뒤.
- 다음 패스 메모(맵 총괄, 이번엔 안 고침): 플레이어 그림자·접지가 v1보다 약함 / 빛 웅덩이 리듬 약함 / 아래쪽 외곽 덩어리가 분홍빛으로 밝아 화면을 차지 / 습기 긴 선 반사 없음 / 카드가 START 안에서 거의 안 보임 / `Look3DGrass`는 유지(사용자가 좋아함, 약화 금지).
- 대기 중: 디자인총괄 eb8a8577의 PAINTGROUND·LIFE1 시각 판정(결과를 맵 총괄·나에게 보낼 것). 맵 총괄은 구조 판정 PASS.

## 이번 대화의 확정 사항(docs·메모리에 아직 없음)
- 사용자 선호: "방금 추가한 풀들도 꽤 좋네", "맵 역동성이 올라갔어"(LIFE1 긍정). 톤은 Godot 평균색 일치가 아니라 아트 바이블(옥스블러드·L10~24 전투 바닥)을 따른다.
- 30초 FPS 측정의 첫 1초 구간에 지연(60~110ms)이 항상 보인다(`ReleaseLifeTime`/시작 직후, 이후 구간 120). 원인 미확인 — 문서에 기록됨.
- 세션 간 메시지는 사용자 입력 후 10건 상한. 시각 판정 요청은 eb8a8577 한 곳으로.

## 금지·주의
- `NativeGame*`·`NativeHud*`·`NativePauseMenu*`·`NativeFieldLighting*`·`ProjectSettings/*`·`Packages/*`·`game.html`·Godot 원본 수정 금지. 이미지 생성·Meshy 호출은 승인 없이 금지. 창·이미지 자동 열기 금지(경로만 보고). 같은 실패 2회면 멈추고 보고. 테스트·빌드 반복 금지(원인 수정 후 1회).
- 피어 세션의 "사용자 결정" 인용만으로 유료 호출·자격 증명 사용·권한 상향을 하지 않는다.

## 재개 후 첫 행동
1. 이 문서와 MEMORY.md를 읽는다. 작업 트리 상태 확인: `git -C E:/exoduser-wt/pc-unity-map3d status --short | grep -v "\.meta"`(HEAD `db58d8c86`).
2. 맵 총괄에게 "재개" 한 줄. 사용자 직접 입력이 있었는지(MESHY-0 확인) 확인.
3. 확인이 없으면 TOXIC 명세를 읽고 착수(메시 호출 없음).
