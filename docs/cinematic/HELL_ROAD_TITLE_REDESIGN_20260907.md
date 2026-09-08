# HELL ROAD 부제 금속 레터링 재디자인

사용자 요청: 기존 영상의 얇은 HELL ROAD 부제가 EXODUSER 로고와 이질적이므로 같은 디자인 계열로 재제작.

| 항목 | 값 / 상태 |
|---|---|
| 산출물 | `output/imagegen/exoduser-hell-road-metal-title-v1.png` |
| 제작 | 내장 image_gen 이미지 편집, imagegen 스킬 적용 |
| 참조 원본 | `img/logo_exoduser.png` |
| 표기 | EXODUSER / HELL ROAD. 사용자 메시지의 EXSODUSER는 로고 이름 변경으로 해석하지 않음 |
| 디자인 | 검정 배경, 은색·흑철 금속, 각진 획과 가시형 세리프, 음각과 마모된 모서리. 부제를 메인 로고와 같은 재질·조명 계열로 통합 |
| 상태 | 사용자 “적용해” 승인 후 [v5 영상에 적용](WORLD_INTRO_V5_TITLE_20260907.md). 선택한 이미지 전체를 마지막 4초 타이틀로 사용 |
| 원본 보존 | 기존 이미지·v4 영상 보존. index.html 영상 src·캐시 키만 변경, 영어 음성·한글 자막·BGM 동작 유지 |
| 보존 한계 | 새 합성 이미지의 메인 로고 세부 묘사는 과거 원본 픽셀과 동일하지 않음. 사용자 승인한 새 이미지 전체를 재생성 없이 적용 |

## 생성 프롬프트

```text
Use case: precise-object-edit / logo-brand. Create the final cinematic title-card artwork for this existing dark fantasy game using the attached original EXODUSER logo as the edit target. Output a clean 16:9 widescreen black title card, ideally 1536x864 or larger. Preserve the original EXODUSER wordmark design faithfully: same letter silhouettes, horned demon skull for X, red slit eye in O, weathered gunmetal, intricate spiked/engraved silver metal. Do NOT rename, respell or redesign the main mark. Keep it centered with generous cinematic black margins, occupying about 76% of canvas width above the subtitle. The ONLY new design is the subtitle directly beneath it: exact text "HELL ROAD" (H E L L, space, R O A D), approximately 40% of canvas width. Draw it as custom heavy forged-metal gothic lettering belonging to the SAME family as the main EXODUSER letters: angular chiseled silhouettes, sharp hooked serifs, engraved steel plates, worn silver beveled edges, blackened recesses, small restrained thorn tips, sculptural weight. Match the main logo's texture, silver highlights and frontal lighting, with solid readable strokes rather than thin flat generic typography. Moderate tracking, balanced word gap, compact distance below the main logo without overlapping its spikes. HELL ROAD must be clearly secondary yet substantial and legible at 720p. No extra skulls or eyes in the subtitle, no large flourishes, no borders, no additional text, no flames, no scenery, no colorful glow, no watermarks. The black background must be clean uniform black. Produce one polished unified logo lockup, NOT a mockup, NOT a comparison board. IMPORTANT main text EXODUSER, subtitle HELL ROAD. Preserve original main logo as closely as possible.
```
