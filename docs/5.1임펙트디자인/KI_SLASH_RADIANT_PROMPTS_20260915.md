# 기검참 GPT 생성 프롬프트 사양

도구: 내장 `image_gen`. 외부 API/CLI는 사용하지 않았다. 생성 결과는 두 파일 모두1254×1254이며 크롭·배경 제거·재인코딩 없이 복사했다. 런타임은 실제 이미지 크기를 기준으로 셀을 계산한다.

## 비행 검기

입력 참조: `assets/vfx/crescent_slash.webp`.

> Production-ready animated VFX sprite sheet for a dark fantasy action RPG. Square, exactly 3 equal columns by 3 equal rows, 9 right-facing crescent slashes, fixed center and orientation per cell. Replace the flat crescent with a white-hot cutting edge and 2–3 layered azure/cobalt ribbons, long tapered backward streaks and a few large clean needle shards. Frames: concentrated arc → rising energy → bright crest → peak crescent → shearing wave → thinning streamers → unwinding arcs → separated trails → sparse fading ribbons. Pure black RGB(0,0,0) additive background, black gaps, generous cell margins. No text, grid, borders, character, weapon, floor, stippling, dotted shading, grain, tiny particle spray, star field, checkerboard, or noise. Exactly nine sprites in row-major order.

## 명중광

> Production game VFX sprite sheet for a spectacular sword-energy hit impact. Square, exactly 2 equal columns by 2 equal rows, four centered frames on pure black #000000 additive background. Dominant horizontal razor slash pointing right through a compact white-hot contact nucleus, intersected by two oblique curved azure/cobalt energy blades. Frames: initial cross flash → bright broad cutting crest → elongated unwinding blade streaks → sparse dim fading filaments. Readable at100px; smooth luminous gradients, crisp clean ribbons and large needle streaks. At least48px empty margin in each cell. No explosion fireball, orb, flower, snowflake, dots, particle cloud, grit, stippling, grain, checkerboard, grid, border, text, label, weapon, character, or scene. Exactly four row-major frames.
