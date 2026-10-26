# Mac A15 exact43 설정 글꼴 적용범위 — 2026-10-27

## 실제 스타일·자료 범위

`NativePauseMenu`의 설정 제목/4탭은 `NativeGame`이 건넨 `NativeLobbyNotoSansKR-Regular`로 만든 로컬 `title`/`tabButton`/`activeTab` 스타일을 쓴다. `NativeKeyBindList`는 `regular`·`semi`·`bold`를 같은 번들 NotoSansKR 3종에서, 입력 대기 안내 `serif`를 `NanumMyeongjo-Regular`에서 읽는다. 목록의 `Width`와 `Run`은 같은 `Style(Font,px)`를 사용하며 `CalcSize` 결과로 배치한다. `⌨`·`🎮`와 캡처 괄호 `⟨⟩`의 해당 목록 지점은 `keybind_glyphs` 아틀라스로 그려서 cmap 결손 계산에서 제외했다. 세계관 자막의 지역별 스타일 검수는 설정 화면 판정에 포함하지 않는다.

원본 `a15_settings_labels_exact.json`의 43 ID에서 아직 실화면 검수하지 않은 23 locale만 대상으로 실제 표시 문자열(영어 fallback 포함)과 해당 스타일의 TTF/OTF cmap을 대조했다. `ar`은 제품의 영어 fallback 정책으로 제외했다. ko/en/ja/es/cs는 앞선 실제 Player 증거와 구분한다. 결과는 `_out/A15-FONT-COVERAGE-20261027/audit.json`에 ID·문구·폰트 역할·누락 코드포인트별로 보존한다. 현재 폰트에서 **15 locale/170 ID×locale 행**에 누락이 있고, `da/fr/id/it/ms/nl/no/sv` 8 locale은 이 43개 문구에 누락이 없다.

## 누락 최소표

| locale | 누락 ID×locale 행 | 서로 다른 누락 글자 수 | 코드포인트 예시 | 현 폰트 역할 |
|---|---:|---:|---|---|
| `bg` | 1 | 15 | U+041D, U+0430, U+0431, U+0432, U+0437 | serif |
| `de` | 1 | 1 | U+00FC | serif |
| `el` | 33 | 20 | U+03A0, U+03AC, U+03AD, U+03AE, U+03AF | regular, semi, bold, serif |
| `fi` | 1 | 1 | U+00E4 | serif |
| `hu` | 6 | 4 | U+00E1, U+00E9, U+0151, U+0171 | semi, serif, regular |
| `pl` | 12 | 6 | U+0105, U+0119, U+0141, U+0142, U+015B | serif, bold, regular |
| `ptbr` | 1 | 1 | U+00E3 | serif |
| `ro` | 13 | 3 | U+0103, U+0219, U+021B | semi, bold, serif, regular |
| `ru` | 1 | 18 | U+041D, U+0430, U+0431, U+0432, U+0435 | serif |
| `th` | 35 | 47 | U+0E01, U+0E02, U+0E04, U+0E07, U+0E08 | regular, semi, bold, serif |
| `tr` | 20 | 6 | U+00FC, U+011F, U+0130, U+0131, U+015E | serif, semi, regular, bold |
| `uk` | 16 | 21 | U+0406, U+041D, U+0430, U+0431, U+0432 | semi, bold, serif, regular |
| `vi` | 1 | 5 | U+00ED, U+1EA5, U+1EB7, U+1ED9, U+1EE7 | serif |
| `zh` | 27 | 30 | U+4EFB, U+5173, U+51FB, U+5251, U+52A8 | regular, semi, bold, serif |
| `zht` | 2 | 11 | U+4EFB, U+53D6, U+610F, U+6216, U+6309 | serif, regular |

## 적용·소유 경계

Mac 소유 설정 제목의 실제 누락은 `el` U+03AF, `th` 태국 문자, `zh` U+8BBE의 3 locale이다. `NativePauseMenu`는 이 3 locale에 한해 이미 번들된 `NativeCaptionNotoSerif`·`NotoSerifThai-Regular`·`NotoSerifCJKsc-Regular`를 자기 `title`/탭 스타일에 적용한다. locale이 ko로 돌아가거나 번역 리소스/지역 폰트가 없으면 원래 폰트와 ko/en 문구로 돌아간다. 공유 `GUI.skin`과 HUD 스타일은 변경하지 않는다. QA 전용 F8 순환에 `el/th/zh`를 추가해 같은 앱에서 위험 문자를 볼 수 있게 했다.

목록은 PC 소유 `NativeKeyBindList`의 `Width`/`Run`/스타일 cache 접점에 새 hunk가 필요하다. [검토용 지역 글꼴 patch](unity_patches/A15_keylist_regional_font_seam.patch)는 **제품 미적용**이다. 번역 리소스가 유효하고 locale이 해당될 때만 지역 폰트로 폭과 렌더를 함께 계산하며, native-only 한글 문구는 기존 폰트를 쓴다. 기존 스타일 cache가 네 기본 역할만 구분하므로 폰트 instance ID를 키로 분리한다. PC owner가 인수하기 전에는 키 목록 15 locale의 누락을 PASS로 승격하지 않는다.

폰트 cmap의 정적 대조에서는 `NativeCaptionNotoSerif`가 해당 유럽어·키릴 문자, `NotoSerifThai-Regular`가 태국어, `NotoSerifCJKsc/tc-Regular`가 중국어 간·번체 exact43 문구를 모두 포함한다(아틀라스 글자 제외). 이 결과는 IMGUI shaping, 행 폭, 높이, 실제 글리프 이미지의 PASS가 아니다. 빌드/실화면 결과와 일반 마우스·전체29 GUI 경계는 아래 후속에 별도 기록한다.
## 빌드·실화면·긴 행 후속

Mac 소유 제목/탭 보정과 F8 QA 순환만 포함한 Unity 6000.6.7f1 ARM64 Settings QA `PortVerification.Build` **1회 Succeeded**, 오류0(기존 UAC1001만). [빌드 receipt](/Users/fordeargamers/exoduser-wt/_out/A15-FONT-COVERAGE-20261027/build-receipt.json). 격리 marker 루트 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-A15-FONT-20261027`의 플래그 Player PID36563 **1회** 로그에 `A15_LABEL_RESOURCE loaded=True ids=43`, `el=Ρυθμίσεις`·`th=ตั้งค่า`·`zh=设置` 및 최종 ko `설정`이 남았다. 같은 창의 `settings-el/th/zh.jpg`에서 세 제목의 글자가 보이고 `settings-ko-restored.jpg`에서 원래 한글 글꼴·문구 복귀를 확인했다. 이 3제목·탭의 **VISUAL VERDICT: PASS**는 1280×720 내용 영역에 한정한다.

창 선택 중 같은 번들의 인자 없는 QA PID36574가 별도로 열려 일반 로비가 표시됐다. 즉시 종료하고 증거에서 제외했다. 개인 프로필에 명시적 입력/저장은 하지 않았지만 그 프로세스의 일반 프로필 **읽기 가능성은 배제할 수 없다**. 격리 PID36563과 사용자 기존 앱 3개는 별도였다. 빌드 생성 tracked 413파일·untracked meta 2파일은 `_out/A15-FONT-COVERAGE-20261027/`에 보존 후 작업 상태로 복원했다.

그리스어 실화면의 `key.action.shield`는 오른쪽 키 버튼 바로 앞에서 문구가 끊겨 보인다. 다른 긴 행은 [정적 폭 추정 영수증](/Users/fordeargamers/exoduser-wt/_out/A15-FONT-COVERAGE-20261027/long-row-static.json)에서 지역 폰트 15px/자간 .6px 기준 이름칸 327.09px를 넘는 **12행/10 locale**으로 좁혔다. 예: `bg key.action.shield` 약464px, `el key.action.shield` 약395px, `uk key.action.shield` 약384px. 이 폭은 Pillow의 글자별 advance 근사이며 Unity의 실제 `GUIStyle.CalcSize` 판정은 아니다. PC 소유 목록의 지역 폰트 patch와 장문 배치 수정이 인수·실화면 검증되기 전에는 키 목록 **VISUAL VERDICT: RETOUCH/HOLD**다. `ar` 영어 fallback·전체29 GUI·물리 마우스는 기존 HOLD를 유지한다.

키 목록의 새 owner 검토물은 순서가 있는 두 개의 **미적용** patch다: [지역 폰트·폭/렌더 스타일 일치](unity_patches/A15_keylist_regional_font_seam.patch) 다음 [장문 이름 2행 fit](unity_patches/A15_keylist_long_name_fit_after_font.patch). 현재 Mac `NativeKeyBindList.cs` blob에서 첫 patch `git apply --check --ignore-space-change` PASS, `_out/A15-FONT-COVERAGE-20261027/patchcheck/` 격리복사에 첫 patch를 적용한 뒤 둘째 patch 검사 PASS다. 둘째는 공백 기준 2행 분할과 긴 단어의 10px 하한 축소를 제안한다. 두 patch 모두 PC owner 인수·컴파일·Player 검증 전이므로 현재 제품의 키 목록 폰트/장문 문제는 열린 상태다.

[수정 후 코드포인트 재대조](/Users/fordeargamers/exoduser-wt/_out/A15-FONT-COVERAGE-20261027/postfix-codepoints.json)는 Mac 적용 Settings 5 ID와 **PC patch 가정** KeyList 38 ID의 미검수23 locale 결손을 각각 0으로 계산했다. PC KeyList 값 0은 제품 적용 전의 정적 예측이다.
