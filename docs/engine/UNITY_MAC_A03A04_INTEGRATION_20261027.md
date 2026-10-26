# Mac Unity A03/A04 최소 인수 — 2026-10-27

원본은 PC 제품 후보 `codex/ui-resume-player-20261026` `97227ceb7c4a33becd2fe55d4ab1712dc8013182`(Runtime tree `8376905b93fc0df4170c9ecc67acb47577990f99`)다. 전달 문서 `docs/engine/ui_handoff/a03-a04-mac-handoff.md`·audit·validation·source-audit.json은 PC 전달 커밋 `d132f425b67a16bc1d393eea710778d86222abd5`에서 읽었으며 Mac에 복제하지 않았다. 인수 전 Mac HEAD는 `e804c3935aa99086785733888418e5c143ede0e2`다. 수정 전 `NativeLobby.cs`와 A04 partial 3개는 `_out/UNITY-MAC-A03A04-20261027/before-files/`에 SHA256과 함께 백업했다.

| ID·적용 위치 | PC 원본·적용 값 | Mac 연결·경계 |
|---|---|---|
| A03 `Resources/Data/patch_notes.json`·`.meta` | 버전 `0.7.5`·`0.7.0` 두 본문. JSON SHA256 `e4eac388…`, 신규 GUID `ec2dc819ffb7444f9cf201d327ef3d2a` | PC blob 동일; 이전 0.7.7 WIP 대체 없음 |
| A03 `Resources/Data/patch_notes_labels.json`·`.meta` | 29언어×3키=87; SHA256 `bbea905b…`, GUID `0dcb193892544857a8e72b47a9c028f4` | PC blob 동일. 이 수치는 PC 정적 검수 분모이며 Mac GUI 번역 검수 아님 |
| A03 `Runtime/NativeLobby.PatchNotes.cs`·`.meta` | 패치노트 launcher·modal·입력 처리 partial; SHA256 `31486351…`, GUID `d7653376759e46ec85794eaaf7677f4f` | PC blob 동일. Mac `DrawLobby()`에서 키 처리·타 UI 입력 차단·launcher·modal 호출만 연결 |
| A04 `Resources/Data/character_dialog_labels.json`·`.meta` | 29언어×14키=406; SHA256 `423a5689…`, GUID `e91422e4597c4213923390065c80f3b1` | PC 교정 최종 blob 동일. 생성·삭제 질문/버튼과 초점 복귀 문구 lookup |
| A04 `Resources/Data/visual_select_labels.json`·`.meta` | 29언어×42키=1,218; SHA256 `4383fe4c…`, GUID `c04740a73cab44c390509ea746df3436` | PC blob 동일. 시각선택 표시 lookup |
| A04 `NativeLobby.Characters.cs`·`.CharacterPresentation.cs`·`.CharacterDelete.cs` | 전달 후보의 세 partial 결과와 byte 동일 | 원본 세 파일의 A04 최소 hunk 적용. `NativeLobby.cs`에는 `character-create-card` 초점 hunk만 추가. 캐릭터 데이터·저장·미디어 로직은 변경 없음 |

`NativeLobby.cs` 전체 덮어쓰기와 branch merge는 하지 않았다. Mac의 `arabicCaptionPreview` 초기화, `arabicCaptionOverlay` world 합성, `NativeLobbyBuildLabels.Draw(913f)`, 누적 19 patch 및 설정 v2 파일을 보존했다. 새 GUID 5개는 각각 Unity Assets에서 유일하다. A01 title 원화, raw `cin_title_logo.png`, 지역 글꼴/HOLD 자산, 콘텐츠 차이 7곳은 이번 A03/A04 인수 범위 밖이며 기존 판단을 바꾸지 않았다. `docs/` 전체에서 관련 키워드를 검색해 이 기록과 작업판·변경 로그를 동기화했다. 확정 설계 `docs/2_3 돌진+패링+방패시스템`은 수정하지 않았다.

Unity 6000.6.7f1 `-batchmode -nographics -quit`로 최종 import·script compile 1회 실행했다. 로그 `_out/UNITY-MAC-A03A04-20261027/final-import-compile.log`의 종료 코드 0, C# `error CS` 0·`warning CS` 0, 새 UAC 0이며 기존 `NativeCharacterPresentationPlayback.Video`의 UAC1001만 기록됐다. 네 JSON은 각 GUID로 `TextScriptImporter`가 가져왔다. import가 만든 무관한 tracked Resources `.meta` 411개를 HEAD bytes로 복원하고 새 무관 `.meta` 1개를 제거해 제품 변경을 위 표의 파일로 한정했다. **컴파일 PASS / Player·GUI·OS 키보드·실제 화면·저장 회귀 미검증**이다.
