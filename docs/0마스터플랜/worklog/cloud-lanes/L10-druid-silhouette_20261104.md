# L10 — preview 6 드루이드 보스 "회색 평면 실루엣" 원인·최소 수정 (2026-11-04)

상태: **컴파일 미확인·화면 미검수(Mac).** Unity 실행 0, Core 변경 0, 카메라(피치 34°) 변경 0.
기준: `claude/unity-integration-preview6-20261104` @ `6229288c0`. 결함 출처: Mac 보고 `claude/unity-mac-report-20261104` @ `4264abe0c` L8-1 (`run-l8-1/caps/boss-pattern-bossSlam.png`, `--remodel3d --enemy-render=rigpixel --boss-render=rigpixel`, fallbacks 0).
선행 기록: 보스 문서 `7e96e04d6` ① "P1 껍질 은색 유령 — 53b411c2b 시선 림이 양면 깃털 카드 뒷면에서 몸 전체를 칠함". 그 수정 레인 `boss-fix-a`(Codex, PC 로컬)는 원격 브랜치가 없다(`git ls-remote origin` 에 boss-fix·rim 0). preview 6 안의 셰이더 마지막 변경은 `53b411c2b` 그대로다 → **이미 알려진 원인 ①과 같은 결함이 미수정 상태로 들어와 있다.**

## 렌더 경로 (rig-pixel 드루이드)

`NativeDruidRigPixelView.cs:36` 모델·`Shaders/DruidRigPixelToon`·`Shaders/RigPixelComposite` 로드 → `:79-82` 모든 재질을 툰 재질로 교체(`_PaletteColor` 단색, 알파=`_SurfaceTag` 0.6/0.7/0.8/1) → `:65` 정사영 캡처 카메라(near .05) → `:223` Point RT(ARGB32 Linear) → `:227` 합성 쿼드(`RigPixelComposite`: 면 중앙값·합의 평탄화, 달 쪽 외곽 림 `RimStrength .26`). 실패 시 `:255` `Fail` → 옛 보스 대체.

## 원인 후보

| # | 후보 | 위치 | 근거 | 확신도 |
|---|---|---|---|---|
| 1 | **B4 시선 림이 법선이 반대인 양면 카드 전체를 은회색으로 칠함.** 원본 망토·깃털은 양면 재질(`DarkDruidAssetBuilder.cs:88` "double-sided (mantle/feathers)")인데 툰 셰이더는 `Cull Back`이고 `facing=saturate(dot(n,view))`. 보이는 면의 셰이딩 법선이 카메라 반대면 facing=0 → `fres=1` → 림 2단 전부(+0.30/0.37/0.46) + 채움광 최저 칸. 팔레트가 #1c2024 급(≈0.11)이라 림 가산이 본색의 3~4배 → 카드마다 같은 회청색 면, 합성의 면 중앙값이 더 평탄화 | `DruidRigPixelToon.shader:32,34,45` | ① 셰이더 산식 ② PC 후보 캡처 판정 `7e96e04d6` ① "은색 유령" 동일 원인 ③ Mac fallbacks 0 → 2D 대체가 아니라 rig-pixel 자체의 색 | **높음 → 수정함** |
| 2 | 림 크기가 어두운 팔레트에 비해 절대값으로 큼(정상 법선이라도 34° 시점에서 비스듬한 깃털 카드는 facing<.45 → 림). 1을 고쳐도 껍질 가장자리 깃털이 회색 띠로 남을 수 있음 | `:45` `.55`/`.78` 단, 가산 `(.30,.37,.46)` | 산식만(캡처 없음) | 중간 — 수정 안 함(디자인 값, Mac 재확인 뒤) |
| 3 | 근평면 예외 → 옛 2D 영구 대체 | `NativeDruidRigPixelView.cs:111` | Mac fallbacks 0, 이번 증상과 무관. `phase23_collapse` 뼈 상자 6,144px 문제(`7e96e04d6` ②)는 별도 | 낮음(이번 증상) |
| 4 | 합성 면 중앙값·합의 평탄화가 음영 칸을 지움 | `RigPixelComposite.shader:68-80` | 설계 의도(잔점 제거). 1의 균일 림 위에서 평면감을 키우는 보조 요인 | 낮음 |
| 5 | RT `RenderTextureReadWrite.Linear` 색공간 | `NativeDruidRigPixelView.cs:223` | 영웅·적 RT와 같은 설정, 회색화 근거 없음 | 낮음 |

## 수정 (최소)

`DruidRigPixelToon.shader` 법선 정규화 직후 한 줄: `n=dot(n,view)<0?-n:n;` — 보이는 면 쪽으로 셰이딩 법선을 돌린 뒤 조명·금속·채움광·림을 계산한다. 뒤집힌 카드는 facing이 크게 나와 림이 빠지고, 진짜 외곽(보간 법선이 0 근처)은 facing이 작게 남아 림을 유지한다. 림 수치·Cull·합성·카메라·Core는 그대로.

## Mac 재확인

1. 이 브랜치를 preview 6(+L8 `8a5740a22`)에 병합한 트리로 빌드, L8과 같은 조건 `--remodel3d --unity-fullrun-qa --enemy-render=rigpixel --boss-render=rigpixel`, 1920×1080.
2. `boss-entry`, `boss-pattern-bossSlam` 캡처를 L8-1과 나란히: 껍질 몸통이 회청색 단색 면이 아니라 어두운 팔레트+달빛 단계로 읽히고, 은색은 외곽선 1~2 텍셀 띠에만 남으면 PASS. fallbacks 0 유지, Exception 0.
3. 껍질 가장자리 깃털이 아직 회색 띠면 후보 2(림 단 `.55` 제거 또는 가산 축소)로 넘어간다. 전체가 여전히 회색이면 1의 가정(법선 반대)이 틀린 것이므로 `Cull Off`+`SV_IsFrontFace` 법선 뒤집기 A/B를 한다.
