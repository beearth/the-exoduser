# A15 키 목록 지역 글꼴·긴 이름 PC 소유 인수 — 2026-10-27

## 고정 기준·결론

- 지정된 Unity 기준은 원격 `unity/main` **`d8f874a34ad088603ba6c76ac41e9b709b63a470`**. 검토 당시 재조회한 원격은 자식 **`94cc7dce10f868d734e95496c5df64e5732442b3`**(Game 탭 계약 문서 변경)이며 두 대상 blob은 동일하다. `codex/unity-mac-20261024`의 마지막 확인 SHA는 `d8f874a34`의 부모 **`412124ef5efa73611bf0d33dd211074e4d10132e`**다. 두 patch의 대상 `unity/Assets/Exoduser/Runtime/NativeKeyBindList.cs` base blob은 **`4abe399e66264c30f9622c24e1306688e4dcf7fd`**. `NativePauseMenu.cs` blob **`e35eccc603cda438fd31a26bf44cc44ef3688880`**, `NativeA15SettingsLabels.cs` blob **`8a05bf4735883f624a6a9f163faeb23058d9e892`**, exact43 JSON blob **`d17da73d04db511538e0774f26d13b192538d46e`**. 제품 적용 전에는 Mac 소유자가 원격 HEAD와 target blob을 다시 확인해야 한다.
- Mac 보고 `docs/engine/UNITY_MAC_A15_FONT_COVERAGE_20261027.md`의 정적 결과는 **15 locale/170 ID×locale** 글리프 결손, `el key.action.shield` 실제 키 버튼 직전 잘림 **RETOUCH**, 긴 이름 12행/10 locale 근사다. Mac 제목/탭 el/th/zh 실화면 PASS는 키 목록 PASS가 아니다.
- **인수 판정:** 첫 [지역 글꼴 패치](a15-keylist-regional-font-pc-owner.patch)는 원본 그대로 승인 가능(SHA-256 **`F706E7B9F270C8B258B7234F782CC48B49BE8611A58CDAAFEC489CE2940CFE14`**). 둘째 원본 원본 장문 패치는 **수정 필요**(SHA-256 `36F723BCB55EEB38A3AEFA4E2D2F50392BEE8278491EEA369E8C8A78990FEC2B`). 대신 [PC 소유 수정본](a15-keylist-long-name-fit-pc-owner.patch) SHA-256 **`F456EF12593E4BCD237FC3F5FD9DDA0DB4043B0751A2643351711502F68C17DA`**를 첫 patch 다음에 적용한다. 세 자료 모두 I: 검토본이고 Mac/G: 제품·Editor·push 변경 **0**.

| 검토점 | 사실과 승인 경계 |
| --- | --- |
| 글꼴·ko 복원 | 첫 patch는 `FontForLocale(LocaleCode,null)`로 지역 font를 얻고 `LocaleCode`가 ko로 돌아오면 `regionalFont=null`로 원래 `regular/semi/bold/serif`를 다시 쓴다. 한글이 포함된 native-only 문구는 기존 font를 쓴다. 네 지역 리소스(`NativeCaptionNotoSerif`, Thai, CJKsc, CJKtc)가 `Resources/Art/fonts`에 있는 것을 확인했다. 리소스 load 실패·런타임 shaping은 검수 전이며 성공 주장 금지. |
| 폭 계산과 그리기 | 첫 patch의 `Width`와 `Run` 모두 동일 `LabelFont(text,source)`→`Style(Font,px)`를 사용한다. `Style` cache key를 font instance ID와 px로 나눠 지역 font와 기본 font의 스타일 혼용을 막는다. 별도 `CalcHeight` 호출은 이 렌더러에 없으며 `Run`의 32px glyph rect를 사용한다. Atlas의 ⌨/🎮/⟨⟩는 기존 경로를 유지한다. 태국어/복합문자는 코드포인트별 그리기의 실제 shaping PASS가 아니다. |
| 원본 장문 문제 | 원본 둘째 patch는 `NameW=327.09`을 넘는 이름을 공백 기준 2행으로 나누고, 그도 안 되면 15→10px 축소한다. **10px에서도 넘는 이름을 막는 clip이 없다.** `Run`은 glyph별 Label을 놓으므로 마지막 글자가 x=345.09의 주 키 버튼 쪽에 그려질 수 있다. 이 상태로는 hitbox가 맞아도 화면상 버튼을 가리는 위험이 남는다. |
| 수정본의 한 hunk | `DrawActionName` 내부에 `GUI.BeginGroup(Rect(row.x+NameX,row.y,NameW,RowH))`/`EndGroup`을 짝지어 이름의 그리기만 clip한다. x는 그룹 로컬 0, 중심 y는 기존 26/17/36. `NameX=8`, `NameW=327.09`, `MainX=345.09`이므로 이름 clip 오른쪽은 row+335.09, 버튼 왼쪽보다 **10px 앞**이다. `DrawKbmRow`의 `mainR/altR/delR`, 클릭·캡처, `RowH=53`, `RowPitch=57`, ContentHeight/scroll, 저장은 그대로다. 10px에도 폭이 남는 번역은 버튼을 가리지 않지만 이름이 잘릴 수 있어 실화면 RETOUCH로 남긴다. |

## 적용 조건과 대표 검수

I: 격리 복사에 base blob을 byte 그대로 꺼내 `git hash-object`로 `4abe399e…`을 확인했다. 첫 patch `git apply --check --ignore-space-change` PASS→격리 적용 PASS→수정 둘째 patch 같은 검사/적용 PASS. **일반 `git apply --check`는 첫 patch `:29`, 둘째 patch `:213`에서 실패**했다. 원본 C# CRLF와 LF patch 문맥 차이이므로 Mac 정확 base에 두 patch를 **순서대로 `--ignore-space-change`**로 적용하고 결과 diff가 이 파일의 표시/스타일 hunk뿐인지 확인한다. CRLF/LF 혼합 가능성이 있어 줄바꿈/빌드 검사도 필요하다. Mac 컴파일·Player는 이 인수에서 실행하지 않았다.

대표 합격 조건은 `el key.action.shield`와 정적 초과 최대 예시 `bg key.action.shield`(~464px @15px), `uk key.action.shield`(~384px @15px), 그리고 나머지 12행을 실제 Unity `Width`/동일 style로 측정하여 **각 1행 또는 2행 폭 ≤327.09px**, 두 번째 줄 y≤row+53, 이름의 최종 픽셀이 **row+335.09 이전**임을 화면에서 확인하는 것이다. 각 row의 주 키 버튼 왼쪽은 row+345.09이며 클릭은 보이는 버튼에서만 확인한다. 1280×720과 1920×1080에서 첫/마지막 행, 긴 이름, 스크롤 하단, ko 복귀, F8 el/th/zh/ko, Esc/Tab 캡처 후 키 Rect 불변을 확인한다. 원 보고의 464/395/384px은 Pillow 근사이므로 Unity 실제 폭·폰트/Thai shaping·29언어 GUI 결과로 승격하지 않는다. 필요하면 너무 긴 문구의 10px clip은 별도 시각 RETOUCH로 기록한다.

관련 제품 문서 변경은 **Mac이 실제 적용하고 검수한 뒤** `UNITY_MAC_A15_FONT_COVERAGE_20261027.md`의 대기/PASS 상태와 A16 키 목록 현황에 반영한다. 이 보고는 패치 인수 판단이며 제품 상태 변경이 아니다.
