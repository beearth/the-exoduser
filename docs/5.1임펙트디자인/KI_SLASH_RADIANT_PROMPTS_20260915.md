# 기검참 GPT 생성 프롬프트 사양

도구: 내장 `image_gen`. 외부 API/CLI는 사용하지 않았다. 생성 결과는 두 파일 모두1254×1254이며 크롭·배경 제거·재인코딩 없이 복사했다. 런타임은 실제 이미지 크기를 기준으로 셀을 계산한다.

## 비행 검기

입력 참조: `assets/vfx/crescent_slash.webp`.

> Production-ready animated VFX sprite sheet for a dark fantasy action RPG. Square, exactly 3 equal columns by 3 equal rows, 9 right-facing crescent slashes, fixed center and orientation per cell. Replace the flat crescent with a white-hot cutting edge and 2–3 layered azure/cobalt ribbons, long tapered backward streaks and a few large clean needle shards. Frames: concentrated arc → rising energy → bright crest → peak crescent → shearing wave → thinning streamers → unwinding arcs → separated trails → sparse fading ribbons. Pure black RGB(0,0,0) additive background, black gaps, generous cell margins. No text, grid, borders, character, weapon, floor, stippling, dotted shading, grain, tiny particle spray, star field, checkerboard, or noise. Exactly nine sprites in row-major order.

## 명중광

> Production game VFX sprite sheet for a spectacular sword-energy hit impact. Square, exactly 2 equal columns by 2 equal rows, four centered frames on pure black #000000 additive background. Dominant horizontal razor slash pointing right through a compact white-hot contact nucleus, intersected by two oblique curved azure/cobalt energy blades. Frames: initial cross flash → bright broad cutting crest → elongated unwinding blade streaks → sparse dim fading filaments. Readable at100px; smooth luminous gradients, crisp clean ribbons and large needle streaks. At least48px empty margin in each cell. No explosion fireball, orb, flower, snowflake, dots, particle cloud, grit, stippling, grain, checkerboard, grid, border, text, label, weapon, character, or scene. Exactly four row-major frames.

## 실버 재생성 (2026-10-11, MagicLight GPT Image 2.5 sunburst, 1:1)

비행 — 레퍼런스: 기존 `ki_slash_radiant_sheet.png`

> Game VFX sprite sheet, exactly 3x3 grid, 9 frames, keep the reference's layout, cell centers and right-facing crescent sword-energy slash shapes. Recolor fully to chrome silver: white-hot silver cutting edge, layered polished steel ribbons, cold metallic sheen. Monochrome silver-white only, no blue or any hue. Pure black background for additive blending, generous margins. No text, grid lines, dots, particles, grain, stippling or noise.

명중 — 레퍼런스: 기존 `ki_slash_hit_radiant_sheet.png`(검정 배경 합성본)

> Game VFX sprite sheet, exactly 2x2 grid, 4 frames, keep the reference's layout and centered right-pointing sword-slash hit impact shapes. Recolor fully to chrome silver: white-hot silver contact nucleus, polished steel blade streaks, cold metallic sheen. Monochrome silver-white only, no blue or any hue. Pure black background for additive blending, wide margins. No text, grid lines, dots, particles, grain, stippling or noise.

검은 층은 생성하지 않고 런타임에서 시트 밝기로 만든다(가산 배경 시트에 검정을 그려도 가산 합성에서는 보이지 않기 때문).
