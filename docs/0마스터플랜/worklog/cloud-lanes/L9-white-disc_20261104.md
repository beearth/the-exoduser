# L9 — 피격·처치 지점 "베이지 반투명 다각형 원판 + 흰 섬광" (Mac 판정 D2) 분석·최소 수정

- 날짜: 2026-11-04 · 레인: 클라우드 L9 · 브랜치 `claude/unity-cloud-white-disc-20261104` (기준 unity/main 386be384e)
- 근거 결함: `claude/unity-mac-report-20261104` @1c855153f `reports/mac_20261104.md` D2 (`run-combo4-1920/caps/combat.png`)
- **상태: 컴파일 미확인(PC) · 화면 미검수(Mac).** Core 변경 0, 2D 경로 동작 변경 0.

## 1. 후보 표

| # | 파일:줄 | 생성 시점 | 색·알파 | 3D에서만 보이는(두드러지는) 이유 | 확신도 |
|---|---|---|---|---|---|
| 1 | `Runtime/KiImpactView.cs:72-75`(16각형 `coreShape`), `:155-166`(`DrawBursts` 코어), `:67-68`(재질) | 매 `KiSlashHit`(기검참 명중 = 기본 공격 피격·처치 모두) 접점, 5틱 | `#FFF4D0`→`#FFD9A0`(크림·베이지). `CoreAlpha` .35→**1**→.75→.5→.25. `SkillAdditive` `_Flat=1` + 흰 텍스처 = 가장자리 감쇠 없는 균일 채움, `_DepthTest=8`(Always), 가산 | ① 3D 볼륨(`NativeGame.HellLighting.cs:26-30`)만 ACES·노출 +.25·대비 16·**Bloom 임계 1.1**을 건다 → 알파 1 틱의 크림 가산(≈+1.0)이 임계를 넘어 **흰 섬광**, 이어지는 .75~.25 틱이 **베이지 반투명 원판**으로 남음. ② `IsFeelSprite`라 `Remodel3DBillboards`(`NativeGame.Remodel3D.cs:161`)에서 below=0·피치 34° 기울임 → 원판 중심이 적 발밑 지면점에 카메라를 향해 서고, ZTest Always라 지형·몸에 가리지 않음. ③ 리그 픽셀 적·지형 사이에서 하드 엣지 16각형이 그대로 보여 "다각형"으로 읽힘. 지름 = 영웅 키×.35(3타 ×.6×충전 최대 2.2 → 키의 1.3배) | **높음** — 다각형(명시적 16각 메시)·베이지색·반투명 감쇠·흰 피크가 한 객체로 결함 문구 4요소와 모두 일치. 피격 경로에서 유일한 단색 다각형 원판 |
| 2 | `Runtime/Vfx/NativeImpactView.cs:53,59-60`(Point Light), `:52-58`(은빛 플립북) | HP 감소 관찰 접점마다 0.16s, 빛 0.08s | 은빛 별 시트(흰색, `KiSlashAdditive` 가산) + 점광원 `(1,.68,.34)` 세기 1.5/2.4·범위 1.2/1.8 | 2D 바닥은 비조명 스프라이트라 빛 영향 0. 3D 지형은 실제 조명을 받아 **따뜻한 원형 조명 자국**이 생기고, 흰 별은 Bloom으로 번짐 | 중 — 흰 섬광의 일부. 원판은 부드러운 원형이라 "다각형"과는 덜 맞음. 웹 원화·의도된 접점이라 이번에 손대지 않음 |
| 3 | `Runtime/Vfx/CombatImpactTimeline.cs:95` + `Resources/Art/vfx/combat/impact_el0_sheet_v2.png`(c885bbacd) | `EnemyHit/Crit/BossHit` 9프레임 | 셀 전체에 베이지 `rgb(94,80,65)` 후광 알파 .2~.38(v2는 구판보다 면적·알파 큼), 흰 코어. `add` 재질 ZTest Always | 3D 리그 적은 `EnemyRigAnchor` 크기(키×비율)로 그려져 후광 면적이 커지고, 3D 후처리로 밝아짐. 후반 프레임 후광이 일그러진 다각형 | 중하 — 가산 기여 ≈+.07~.14라 단독으로는 옅음. 1번 제거 뒤에도 원판이 남으면 다음 후보 |
| 4 | `Runtime/Vfx/NativeImpactView.cs:61` → `Vfx/ImpactGroundPatch.cs:40-45`(DecalProjector) | 접점마다 1.2s 그을음 | 그을음 `#1B1410` 알파 .35 | 3D에서만 데칼 | 낮음 — 어두운 갈색, 베이지 아님 |
| 5 | `Runtime/Vfx/CombatImpactView.cs:138-156`(혈흔 지면 투영) | 처치·치명 | 어두운 피 시트 ×.9 | 3D에서만 투영 볼륨 | 낮음 — 셰이더가 볼륨 밖·시트 밖을 clip, 색이 짙은 적갈색 |

참고: `SG_SkillGround`의 `_HairColor` 기본값이 베이지(.875,.839,.761)지만 함수 본문에서 쓰지 않아 제외.

## 2. 수정(커밋함) — 후보 1

`Runtime/KiImpactView.cs` `DrawBursts`:

```diff
-                b.core.enabled=alpha>0;b.core.color=ContactColor(age,alpha);
+                b.core.enabled=alpha>0&&!NativeRemodel3D.Active;b.core.color=ContactColor(age,alpha);
```

- 3D 경로에서만 평면 16각 코어를 끈다. 3D 접점 코어는 `NativeImpactView`의 웹 은빛 플립북(기본 활성, `--unity-impact-baseline` 아닐 때)이 이미 맡으므로 접점 정점이 비지 않는다. 스파크 선·명중 시트·잉크·흔들림·`ImpactReceipt` 불변.
- 2D(`NativeRemodel3D.Active=false`) 동작은 바이트 단위로 같다. `run-ki.cjs` 소스 배선 검사 6개는 이 줄을 보지 않는다.
- 남는 일(디자인): G1 §3 "백색 코어 0.35×키"를 3D에서 다시 넣으려면 평면 다각형이 아니라 방사 감쇠 텍스처 + 지면 깊이 테스트로 새로 만든다. 이번 범위 밖.

### 후보 1이 부족할 때 다음 최소안(미적용)

- 2번: `NativeImpactView.cs:59` `b.Power` 를 3D에서 절반(1.5→.75, 2.4→1.2)으로, 또는 Light `cullingMask`를 지형 레이어 제외.
- 3번: 3D 리그 경로에서 `Impact` 모드 클립 알파 상한 .6, 또는 v2 시트 후광 알파를 구판 수준으로 재생성(`tools/vfx/remaster_element_hits.py`).

## 3. Mac 재확인

- 빌드: 이 브랜치 SHA(아래 보고)를 Mac에서 빌드.
- 인자: `--remodel3d --unity-fullrun-qa --enemy-render=rigpixel --boss-render=rigpixel` (D2가 난 판과 같음). 1-1 필드 전투 캡처 `caps/combat.png`.
- 판정: 기검참 1·2·3타 명중·처치 지점에 크림/베이지 다각형 원판이 0, 흰 별 섬광은 0.16s 안에 사라짐, 먼 적 가시성 유지. 1x·3x 크롭.
- 대조: 같은 인자에 `--unity-impact-baseline`을 더하면 NativeImpactView가 꺼져 접점 코어가 없어지는지(정상: 스파크만).
- 2D 회귀: `--remodel3d` 없이 한 판 — 기존처럼 크림 코어가 보여야 정상.
- 원판이 남으면: 후보 2(지면 조명 자국)·3(v2 후광) 순으로 위 미적용안 적용.
