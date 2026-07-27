# 프롤로그 17컷 — ChatGPT(GPT Image) 생성용 프롬프트 시트

작성: 2026-07-26 / 확정 모델: GPT Image (본인 ChatGPT 구독으로 직접 생성)
근거: Higgsfield 파일럿 비교(p04·p09)에서 GPT 승 — `docs\cinematic\prologue\_model_test\` 참조
**추가 경로 (2026-07-27)**: Higgsfield MCP의 `gpt_image_2` 모델(OpenAI)로도 동일 퀄리티 생성 가능 —
Claude가 직접 생성·검수·적용까지 자동화 가능 (p01·p02가 이 경로로 교체됨). 16:9 / 2k / quality high 고정.

## 생성 규격
- **비율: 16:9 (와이드).** 16:9 선택이 안 되면 가로형(3:2, 1536×1024)으로 뽑아도 됨 —
  게임 렌더러가 cover 방식으로 자동 크롭하므로 **상하 10% 여백에 중요한 요소를 두지 말 것**
- 해상도: 가능한 최대 (2K급 권장)
- PNG 저장
- **텍스트/워터마크/레터박스(상하 검은띠) 절대 금지** — 프롬프트에 이미 포함돼 있음

## 저장 규칙
- 경로: `G:\exoduser\assets\cutscene\prologue\`
- 파일명: `p01.png` ~ `p17.png` (기존 파일 덮어쓰기)
- ✅ **17컷 전부 GPT 버전으로 교체 완료** (2026-07-27) — DEMO/EA 동기화 완료.
  - p04·p09: ChatGPT 직접 생성 (2026-07-26)
  - p01·p02·p03·p05~p08·p10~p17 (13컷): Higgsfield MCP `gpt_image_2` (OpenAI, 16:9, 2K, quality high),
    이 문서의 프롬프트 그대로 사용. 전량 2688×1520, 레터박스 없음 픽셀 검증, 검수 포인트(p13 기계팔 부식,
    p16 부패 우세) 통과. 구버전 15장은 `_old_20260727/` 백업.
  ※ p04에 인물 실루엣 1명 있음(콘티 무캐릭터 원칙 위반) — 마음에 걸리면 p04 프롬프트로 재생성.
  ※ nano_banana_2(회화풍)도 파일럿 시도했으나 GPT Image 2가 p04 톤에 더 근접해 최종 채택.
- 교체 후 확인: 브라우저 강력새로고침(Ctrl+Shift+R) → `http://127.0.0.1:3333/game.html?cutscene=1`

## 사용법
아래 블록을 **한 컷당 하나씩 통째로 복사**해서 ChatGPT에 붙여넣고 이미지 생성.
결과가 마음에 안 들면 같은 프롬프트로 재생성 (구독이라 무제한).

---

## p01 — 무수한 세계 (A01·A02) ✅ 교체완료 (2026-07-27, GPT Image 2)

> v1 문제: "희미한 빛 파편"만 지시해 검은 노이즈로 출력됨. 나레이션("우주에는 셀 수 없는 세계가 있다")이
> 읽히도록 파편을 **세계(구체)** 로 구체화, 깊이·성운·초점을 명시.
>
> **최종 채택본**: Higgsfield MCP `gpt_image_2` (16:9, 2K, quality high) + 아래 v2 프롬프트 그대로.
> 구버전은 `_old_20260727/` 백업. 참고 — 같은 프롬프트를 nano_banana_2로 돌리면 코믹풍으로 출력됨.

v2 프롬프트 (최종 채택):
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, oppressive scale, cinematic composition, a vast cosmic void filled with countless distant worlds, each world a glowing sphere of dim ember light wrapped in its own veil of dust, hundreds of spheres scattered at different depths, a few large detailed orbs in the foreground showing cracked ruined surfaces, fading to faint points of light in the far distance, rivers of dark ash nebula drifting between them, like dying stars in an endless black ocean, awe inspiring establishing shot, sense of infinite scale, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```
**검수 포인트: "세계들"로 읽혀야 함. 그냥 불똥/노이즈 점으로 나오면 폐기 후 재생성. 전경에 큰 구체 2~3개가 또렷해야 깊이가 생김**

## p01b — 끝없는 시대, 끝없는 메타우주 (A02) ✅ 신규 (2026-07-27, GPT Image 2)

> A01·A02가 p01 한 장을 공유하던 것을 분리 (사용자 지시). A02 멘트도 "끝없는 현실"→"끝없는 메타우주"로 변경
> (game.html KO/EN 반영: "끝없는 시대, 끝없는 메타우주" / "Endless ages. Endless metaverses.").
> 서로 다른 시대의 폐허(청동 신전/중세 첨탑/부식 철탑)를 두른 세계들로 시대감+다중우주감 표현.
> Higgsfield MCP `gpt_image_2` (16:9, 2K, high), 2688×1520, 레터박스 없음.

```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, oppressive scale, cinematic composition, drifting closer among a handful of colossal dying worlds in a black void, each sphere carrying the ruins of a different age on its surface, one crusted with ancient bronze temple ruins, one with crumbling medieval spires and cathedrals, one with corroded iron towers and collapsed machinery, all equally dead, cracked and smoldering with dim ember light, an endless procession of more ruined worlds receding behind them into infinite darkness, rivers of ash nebula between them, sense of endless ages and endless realities, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p02 — 하나의 지옥으로 수렴 (A03) ✅ 교체완료 (2026-07-27, GPT Image 2)

> v1 문제: 수렴 방향과 균열 초점이 흐릿해 컨셉이 안 읽힘. 소용돌이 깔때기 + 중심의 진홍 균열을
> 명확한 단일 초점으로 지시.
>
> **최종 채택본**: Higgsfield MCP `gpt_image_2` (16:9, 2K, quality high) + 아래 v2 프롬프트 그대로.
> 참고 — 같은 프롬프트를 nano_banana_2로 돌리면 나무결 같은 갈색 소용돌이/하프줄 평행선으로 출력됨.

v2 프롬프트 (최종 채택):
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, oppressive scale, cinematic composition, countless glowing worlds caught in a colossal downward maelstrom, streams of ember light bending and spiraling down like waterfalls of stars, every stream converging into one single crimson fissure at the center far below, the fissure a jagged crack of intense blood red light tearing through darkness, clear funnel shape, strong single focal point at the fissure, vast empty void surrounding the vortex, high angle looking down into the abyss, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```
**검수 포인트: 빛줄기가 전부 한 점(진홍 균열)으로 흘러야 "지옥은 하나다"가 읽힘. 균열이 화면에서 가장 밝은 요소여야 함**

## p03 — 재와 피의 검은 강 (A04)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, weathered stone and corroded iron, oppressive scale, cinematic composition, a black river of ash and clotted blood flowing down a colossal stone chasm, faint half formed faces in the current, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p04 — 석문 외부 (A05) ✅ 교체완료 (재생성 시에만 사용)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, weathered stone and corroded iron, oppressive scale, cinematic composition, one colossal stone gate at the end of a narrow causeway, religious relief carvings, hanging chains, heavy fog, single shaft of dim light, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p05 — 석문 내부, 봉인 (A06)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, weathered stone and corroded iron, oppressive scale, cinematic composition, a colossal sealed stone gate seen from inside, massive chains crossing it, rusted seals, absolute darkness beyond, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p06 — 끊어진 순환의 부조 (A07)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, weathered stone and corroded iron, oppressive scale, cinematic composition, a shattered stone relief of a circular cycle of souls, the ring broken at one point, fragments floating in place, gold leaf peeling, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p07 — 시체와 돌이 융합된 벽 (A08)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, weathered stone and corroded iron, oppressive scale, cinematic composition, a cavern wall built from fused corpses and stone, arms half absorbed into rock, centuries of mineral growth over flesh, full bleed image edge to edge, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p08 — 변형 중인 육체 (A09)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, oppressive scale, cinematic composition, close shot of a body mid transformation, human jaw still recognizable, bone erupting through, skin turning to hide and ash, backlit, full bleed image edge to edge, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p09 — 괴물과 장난감 (A10, 감정 정점) ✅ 교체완료 (재생성 시에만 사용)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, oppressive scale, cinematic composition, a fully transformed monster silhouette in near darkness, human traces in the jaw and one hand, a rusted child toy held in one claw, eyes catching dim light, face mostly in shadow, full bleed image edge to edge, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p10 — 지옥 천장의 실낱 균열 (A11)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, weathered stone, oppressive scale, cinematic composition, looking straight up at a hell ceiling, one hairline crack with a single shaft of pale light, immeasurable distance, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p11 — 팽팽한 쇠사슬, 갈라지는 돌 (A12, CHAIN DRIVE 예고)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, weathered stone and corroded iron, oppressive scale, cinematic composition, a heavy iron chain pulled taut across frame, anchored into a crack in colossal stone, stone splitting along the chain line, red light bleeding out, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p12 — 시대 지층의 잿더미 평원 (B01, 마케팅)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, weathered stone and corroded iron, oppressive scale, cinematic composition, a vast plain of ash, debris from different eras stacked like geological strata, bronze helmets, plate cuirasses and corroded metal plating buried in the same layer, fog, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p13 — 시대 혼재 무기 더미 (B02, 콘티 핵심 컷)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, weathered stone and corroded iron, oppressive scale, cinematic composition, close shot of a pile of half buried weapons in ash, an ancient bronze sword, a medieval greatsword, a matchlock firearm and one corroded mechanical arm, all sharing the same rust and ash, none emphasized, the mechanical arm as decayed and ancient as the other relics, full bleed image edge to edge, no human figures, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```
**검수 포인트: 기계 팔이 깨끗한 SF 부품처럼 나오면 폐기하고 재생성 (콘티 1-1 규칙)**

## p14 — 두 실루엣, 대등하게 (B03)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, oppressive scale, cinematic composition, two backlit silhouettes standing side by side in the same fog, one in heavy plate armor holding a greatsword, one a metal skeletal frame with flesh fused into it, equal in height and stance, faces not visible, realistic human proportions, full bleed image edge to edge, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p15 — 낙하 궤적의 수렴 (B04)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, oppressive scale, cinematic composition, countless small falling figures descending from a distant sky, all trajectories converging into one crimson fissure below, silhouettes only, varied shapes, single direction, figures too small to identify, full bleed image edge to edge, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

## p16 — 기계였던 것 (B05, 최고 실패위험 컷)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, weathered stone and corroded iron, oppressive scale, cinematic composition, close shot of a thing that was once a machine, corroded metal ribcage with flesh growing into it, cables hanging like tendons fused into nerves, moss and rust in the joints, one eye socket holding a cracked lens, the other a human eye, decay dominant over metal, centuries of corrosion, full bleed image edge to edge, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no clean robot, no neon, no hologram, no glitch effect, no letterbox, no black bars
```
**검수 포인트: 깨끗한 로봇으로 나오면 폐기 후 재생성. 부패·융합이 금속보다 우세해야 함 (콘티 명시)**

## p17 — 끝없이 떨어지는 형체들 (B06, 로드맵 훅)
```
Berserk manga ink texture, heavy crosshatching and etching linework, FromSoftware art direction, dark fantasy concept art, chiaroscuro lighting, deep black base, ember red and dull gold accents, volumetric fog, ash particles, oppressive scale, cinematic composition, wide distant shot of figures still falling from an unreachable height into a crimson fissure that keeps swallowing them, no end visible, figures tiny against the vast darkness, full bleed image edge to edge, no anime, no cartoon, no cute, no bright pastel, no text, no watermark, no logo, no winged dragon, no horned demon, no armored skeleton soldier, no clean surfaces, no neon, no hologram, no glitch effect, no letterbox, no black bars
```

---

## 교체 후 체크리스트
1. 17장 전부 `assets\cutscene\prologue\`에 p01~p17.png로 저장 (p04·p09는 이미 완료)
2. 로컬서버 켜기 (`npm run serve:test` 또는 기존 3333 서버)
3. `http://127.0.0.1:3333/game.html?cutscene=1` → 강력새로고침(Ctrl+Shift+R)
4. 프롤로그 19라인(18이미지: p01·p01b·p02~p17) 확인 → 여신 컷신 연결 확인
   (2026-07-27부터 B블록 p12~p17도 인게임 프롤로그에 포함 — 스토리보드 §3 참조)
5. 특히 p13(기계팔 부식)·p16(깨끗한 로봇 금지) 콘티 가드레일 검수

FDG / HELL: EXODUSER
