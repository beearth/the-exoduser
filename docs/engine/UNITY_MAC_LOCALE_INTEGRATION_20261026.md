# Mac Unity 자막 지역 글꼴·일반 HUD 이름표 gate — 2026-10-26

## 소스와 선택 범위

Mac 작업 브랜치 `codex/unity-mac-20261024`의 수정 전 HEAD `a3c13bb3a9c7f0f050c2f92c63104019df6da62f`는 tracked INDEX/WORK가 깨끗했다. `NativeLobby.cs` SHA256 `9ece3805bab894f0d7267ef6b02a31cd550317661ac0173000df0b5043de5d76`, `NativeGame.cs` SHA256 `c70f186bed63f32264d734e423b0386117a037a8f5530e95215bdb6579610301`이었다. 두 파일을 `_out/UNITY-MAC-LOCALE-20261026/backup`에 바이트 백업했다.

정상 fetch한 PC 브랜치 `codex/ui-resume-player-20261026` 원격 SHA는 `c2af68a8284e665b9ac6fc6e68fc7cae3f208cdc`다. 원작성자 커밋 `2935c705b`(이름표 gate), `add394900`(20언어 Noto Serif), `5ee67eb5e`(지역 4글꼴)에서 아래 소유 범위만 대조해 이식했다. `UiResumeReview.cs`, PC 소지품·생성창 WIP, 전체 브랜치 merge, QA fixture는 인수하지 않았다. 공용 마스터의 현행 UI/UX 우선 범위와 기존 Mac 실행·저장 보존 규칙을 따른다.

## 코드 계약

| 위치 | 적용 조건 | 결과 |
|---|---|---|
| `NativeLobby.Styles` | 최초 1회 | 기본 Nanum 본문/그림자, 기존 Noto Serif 본문/그림자, 지역 4개 본문/그림자 쌍 생성. 지역 리소스 누락 시 해당 쌍은 null |
| `UseNotoCaptionForLanguage` | `es/fr/de/ptbr/it/ru/uk/pl/cs/hu/ro/bg/el/tr/vi/sv/da/no/fi/nl` | 기존 Noto Serif 자산 선택, 20언어 × 32큐 |
| 지역 선택 | `zh/zht/ja/th` | 각 지역 글꼴이 로드되면 해당 본문/그림자 쌍 선택, 미로드면 기본 Nanum 쌍 |
| 기본·복귀 | `ko/en/id/ms/ar` 및 리소스 미로드 | 기존 `NanumMyeongjo-Regular`의 동일 `caption/captionShadow` 객체, fontSize 50, LowerCenter, wordWrap true |
| 세계관 자막 | 선택된 스타일 | `CalcHeight`와 실제 `GUI.Label` 본문은 같은 스타일, 그림자는 짝 스타일. 32큐 텍스트·시간 변경 없음 |
| `NativeLobby.DiagnosticUiEnabled` | 명시적 `--unity-ui-diagnostics`만 true | 인스턴스 초기화에 캐시한 기존 `diagnosticPreview` 읽기 전용 노출 |
| `NativeGame.OnGUI` 이름표 | 진단 true이고 `ActiveCharacterName.Length>0` | 기존 `(16,12,420,50)` 패널과 `(28,20,396,40)` 이름표 표시. 일반 실행은 미표시. 우상단 상태·하단 HUD·이름 저장 변경 없음 |

## 지역 실행 자산

아래 파일들은 PC 원작성자 `5ee67eb5e`의 바이트를 그대로 가져왔다. `Resources/Art/fonts/` 아래이고 각 원본 글꼴과 OFL 텍스트에 별도 `.meta`가 있다. 6개 신규 GUID는 Unity Assets 전체에서 중복 0이다. 원본 자료 및 라이선스의 더 상세한 출처는 PC `UNITY_REGIONAL_CAPTION_FONTS_20261026.md`와 `regional-font-assets-20261026.json`에 기록돼 있다.

| 언어 | Resources 이름 / 글꼴 파일 | 파일 bytes | SHA256 | 현행 32큐 cmap 누락 |
|---|---|---:|---|---:|
| `zh` | `NotoSerifCJKsc-Regular.otf` | 24,543,080 | `2a2eae2628df83556c54018c41e20fa532c1b862c5256ae8b3f23feb918d12ca` | 0 |
| `zht` | `NotoSerifCJKtc-Regular.otf` | 24,541,904 | `234301038e76e7c35c43113785024700c4e4fe7bdce1d1fbbc42fca7e6683798` | 0 |
| `ja` | `NotoSerifCJKjp-Regular.otf` | 24,573,864 | `d9854c7a8ef170b5a7932558856fd64eb8de0b007cd823fed6f9f514ad2803d3` | 0 |
| `th` | `NotoSerifThai-Regular.ttf` | 59,668 | `6ac215670f2719de202b566e4fc25a47a2e72c2cb9d2ab19e1aae3c01373ab79` | 0 |
| CJK OFL | `NotoSerifCJK-OFL.txt` | 4,301 | `6a73f9541c2de74158c0e7cf6b0a58ef774f5a780bf191f2d7ec9cc53efe2bf2` | — |
| Thai OFL | `NotoSerifThai-OFL.txt` | 4,380 | `2e98fd23a52d253db8612cd5942c8f2ff4111b21d2367050fdca91d8ccc374a0` | — |

Mac 현행 자막 JSON SHA256은 `32202897b58d1a1c29e149afaff8b32e9490633a1ae8b2c7350092ac28235562`로 PC 원작성자 입력과 같다. 20개 Noto 언어의 cmap 누락 0 및 지역 4개 누락 0은 PC 정적 감사 결과다. Cmap 통과는 글자 조형·Thai 성조·CJK 글꼴 형태·720p 줄바꿈·RTL의 실제 화면 합격 판정이 아니다.

## 빌드·Player 검수

- Unity `6000.6.7f1` 1회 배치 빌드: `StandaloneOSX` ARM64 `Succeeded`, 오류 0, 출력 앱 2,048,745,678 bytes. 신규 글꼴 4종과 OFL 2종을 임포트했고, 최종 12개 신규 파일(각 `.meta` 포함)이 PC `5ee67eb5e`와 바이트 일치한다. Unity가 오래된 `.meta` 버전 경고를 기록했으나 임포트·빌드에 실패하지 않았다.
- 실제 새 Player에서 세계관 재생 중 키보드 언어 메뉴로 `zh`, `zht`, `ja`, `th`를 차례로 선택하고 각 언어의 대표 자막을 화면에서 확인했다. 이어 `ko`로 돌아와 한국어 자막을 확인했다. `zh-caption.png`, `ja-caption.png`, `th-caption.png`, `ko-return.png`는 자막이 보이는 대표 프레임이다. `zht` 문장은 실제 Player 화면에서 보았지만 저장된 `zht-caption.png` 시점은 다음 큐 사이여서 자막이 없다. 이는 확인한 프레임의 가시 글리프 판정이며 29언어 전체 큐·자간·모든 해상도의 조형 합격은 아니다.
- 일반 옵션 없는 새 Player에서 기존 캐릭터를 선택해 게임·연습 화면까지 진입했다. `normal-hud.png`에는 좌상단 개발용 이름표가 없고 우상단 상태와 하단 HUD가 남아 있다. `--unity-ui-diagnostics` 이름표 표시 경로는 조건식으로 검증했고 별도 Player 시각 실측은 하지 않았다.
- 새 검수 Player만 종료했다. 기존 Player PID `38141/48476/52157/61637`는 유지됐다. 사용자 저장 SHA256은 작업 전후 `91c703949ae75be62fdaac1432f76e046ce72bf0aa9e9be0a72ec084102c87cd`로 동일했다. Unity 임포트가 건드린 기존 추적 파일 234개와 생성 파일 4개는 백업 후 원래 바이트로 복원했고, 이 작업 산출물만 남겼다.
- 앱·영수증·PNG는 I: 볼륨 미연결로 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOCALE-20261026/`에 보존한다. OS 언어 메뉴 마우스 조작과 `ar` RTL은 별도 미확인이다.

## 후속 720p Player 증거 — 2026-10-26

커밋 `b93852293ba4155b06ba1dfd0b15acb15bc2fcd7`의 **같은 ARM64 빌드**만 재실행했다. 새 빌드·제품 코드 수정은 없었다. `--unity-frontend-review -output /Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOCALE-20261026/qa-followup`으로 캐릭터 목록을 고유 폴더에 격리했고, 이 QA 옵션은 native 설정 저장 IO도 비활성화한다. QA 목록에는 검수용 `검수자` 한 명만 넣었다. 일반 사용자 캐릭터 목록 SHA256은 전후 `91c703949ae75be62fdaac1432f76e046ce72bf0aa9e9be0a72ec084102c87cd` 그대로다.

`zht-visible-720p.png`에 실제 번체 자막 `流入同一個地獄。`을 저장했다. 앞선 `zht-caption.png`는 큐 사이의 빈 프레임이었다. `--unity-ui-diagnostics`를 함께 준 별도 격리 Player에서는 `diagnostic-nameplate-720p.png`에 좌상단 `검수자 · Preview` 이름표, 우상단 상태, 하단 HUD를 직접 확인했다. 앞선 일반 실행의 이름표 미표시와 진단 실행의 표시를 각각 실제 화면에서 본 것이다.

원본 JSON의 각 지역 최장 **cue20**은 `start=69.502`, `end=74.142`초다. 키보드로 69.291667초 컷으로 이동한 뒤 약 2초에 걸쳐 다음을 같은 1280×720 Player에서 연속 저장했다. 보이는 범위에서 네 지역 모두 문장 전체가 한 줄로 중앙에 있고 양끝·하단 잘림이 없으며 본문 주위 어두운 그림자가 유지된다.

| 언어 | cue20 원문 | 저장 PNG | 화면 판정 |
|---|---|---|---|
| `zh` | `地狱中的每个怪物……都曾是某处的某个人。` | `zh-cue20-720p.png` | 한 줄·잘림 없음·그림자 보임 |
| `zht` | `地獄中的每個怪物……都曾是某處的某個人。` | `zht-cue20-720p.png` | 한 줄·잘림 없음·그림자 보임 |
| `ja` | `地獄の怪物はみな……かつて、どこかの誰かだった。` | `ja-cue20-720p.png` | 한 줄·잘림 없음·그림자 보임 |
| `th` | `อสูรทุกตนในนรก… ครั้งหนึ่งเคยเป็นใครสักคน ณ ที่ใดสักแห่ง` | `th-cue20-720p.png` | 한 줄·잘림 없음·그림자 보임 |
| `ko` 복귀 | `지옥의 모든 괴물은… 한때, 어딘가의 누군가였다.` | `ko-return-cue20-720p.png` | 같은 큐 한국어 기본 스타일 복귀 |

PNG는 `qa-followup/`에 보존했다. 이 판정은 cue20의 720p 가시 결과이며 전체 32큐·다른 해상도·정교한 Thai 성조 조형·`ar` RTL의 합격으로 확대하지 않는다. 이번 검수 Player는 모두 종료했고 기존 일반 Player PID `38141/48476/52157`는 살아 있었다. 원래 관측됐던 설정 QA PID `61637`은 종료 시점에 보이지 않았으며 이번 검수에서 조작하지 않았다.

## 2026-10-26 아랍어 후보 경계

이 문서의 `ko/en/id/ms/ar` 일반 IMGUI 기본·복귀 계약은 현재도 유지된다. `--unity-arabic-caption-preview`가 있는 실행에서만 `ar` 세계관 본문을 별도 ATG RenderTexture로 합성한다. `cdc50a1e6` ARM64 720p에서 32큐 전부의 가시 문구·결합·순서·문장부호·한 줄/잘림 없음과 `ar→ko` 복귀를 확인했다. cue32(0-based 31)의 강제 RTL 오류는 LTR 지정으로 수정했다. 최신 `9cc2759c1`에서는 내용 폭 배경으로 바꾸고 720p 긴·짧은 대표 큐, 1080p 긴 대표 큐·메뉴·`ar→ko`를 검수했다. 최신 빌드의 32큐 전수·1080p 전수는 주장하지 않으며 일반 실행으로 채택하지 않았다. QA 저장 격리에는 frontend-review와 새 절대 `-output` 경로를 함께 쓴다. [별도 후보 기록](UNITY_MAC_ARABIC_CAPTION_PREVIEW_20261026.md).
