# FDG 인트로 배경 재질 비교 — 2026-11-01

## 담당·범위

| 항목 | 내용 |
|---|---|
| 담당 | 이 대화의 Codex. 사용자 “니가해”로 FDG 인트로 담당 인수 |
| 요청 | “배경제질도 바꿔보고”. 기존 FDG 원본의 배경 재질 비교 시안 제작 |
| 원본 | `img/fdg_intro/fdg_reference.png`, 1672×941 |
| 도구 | 내장 `image_gen` 이미지 편집. 사용자가 “편집도구 알아서 해”로 도구 선택 승인. 실제 모델 ID는 도구 응답에 없어 특정 모델명을 주장하지 않음 |
| 서비스 정책 | 사용자 “메직라이트는 이제 삭제해 리스트에서” 적용. `AGENTS.md` §5 및 이미지 도구 정본·팀 시작 지침·아트/VFX 현행 지침 갱신. 과거 제작 기록은 이력으로 보존 |
| 소유 변경 | 재질 시안 PNG 2개, 이 문서, 위 현행 지침 5개 |
| 기존 입력 상태 | `G:/exoduser`, main, HEAD `f22e172840e42cf487a7508f5c0c4fc893aec89e`. 기존 공유 INDEX에 타 팀 변경 다수, tracked WORK diff 없음. 대상 지침 5개는 INDEX/WORK 변경 없음 확인 후 수정 |
| 원격 관측 | `git fetch origin main` 성공. 관측 `origin/main=2285643604486c5bfd9615ef7deb318c84845931`; 로컬 HEAD와 다름. 자동 pull/merge·서버 재시작 없음 |
| 수정 전 백업 | `tmp/fdg-material-backup-20261101-r1/`에 지침 5개 원본 및 `asset-receipt.json` 보존 |

## 산출물·판정

| ID | 파일 | 재질·규격 | 직접 확인·판정 |
|---|---|---|---|
| A | `img/fdg_intro/material_studies_20261101/fdg_black_forged_iron.png` | 검은 단조철, 산화·망치결·거친 반사. PNG 1672×941, 2,873,737 bytes | 원본 방사형 석재 균열이 사라지고 금속 표면으로 변경됨. 거친 결이 강하여 배경 존재감이 큼. 비교용 보존 |
| B | `img/fdg_intro/material_studies_20261101/fdg_black_obsidian.png` | 검은 흑요석, 넓은 유리질 면·붉은 광맥·드문 균열. PNG 1672×941, 1,914,113 bytes | 더 매끈한 면으로 재질 구분이 분명하고 중앙 로고 주변이 상대적으로 차분함. 정지 시안 우선 추천 후보 |

- 두 출력 모두 원본과 같은 크기로 직접 열람했다. 중앙 늑대 엠블럼·붉은 눈·`FDG` 문자·하단 장식·외곽 테두리가 유지되는 것을 육안 확인했다. 생성 편집이므로 보호 영역의 원본 byte/픽셀 동일성을 보장하지 않는다.
- 추천은 정지 이미지의 재질·구도 관측이다. 사용자 채택, 1080p 영상 변환, 실제 게임 스플래시 연결·재생·스킵 검수는 아직 하지 않았다.
- 기존 `video/fdg_intro.mp4`, 원본 PNG, `index.html`, `fdg_intro.html`은 변경하지 않았다. 서비스 계정 삭제·해지·과거 에셋 삭제도 수행하지 않았다.

| 파일 | SHA-256 |
|---|---|
| A | `a876fa52ab46d58f32c1d41caa78cebc27a2004336ab86ed9b6d5a692d4ca5ed` |
| B | `bc0d6d8b1acc77881c397b8d4f234dd5850df345ca5485b69a0e5bd6a63a9142` |

## 사용 프롬프트

두 편집 모두 `referenced_image_paths=["G:/exoduser/img/fdg_intro/fdg_reference.png"]`, `transparent_background=false`로 원본에서 각각 독립 생성했다. 최초 생성 파일은 `C:/Users/심도진/.codex/generated_images/01a19684-3d53-7060-abe6-c0bf1724444a/`에 유지하고 프로젝트 경로로 복사했다.

### A — 검은 단조철

```text
Use case: precise-object-edit. Edit target: the provided FDG studio intro artwork. Create ONE full-size 16:9 finished background-material variation, preferably 1920x1080 or larger. Change ONLY the broad black stone background surface to a single continuous plane of aged black forged iron, with rich believable hammered microtexture, subtle heat-darkened oxidation, broad restrained satin highlights, minute scratches and pits, and a little dark reddish patina. Remove the old radiating stone cracks completely; do not retain the stone grain. Make the changed material unmistakably metal yet dark, elegant and cinematic. Preserve the original EXACT central wolf crest silhouette and all of its details, position, size, red eyes, the exact FDG lettering F D G, its typeface and spacing, the ornamental horizontal flourish, and the ornate metal border on all four sides. Preserve the reference composition and scale precisely, front-on flat artwork, no perspective shift. Retain only sparse dim embers/smoke in bottom corners. Use a broad soft upper-center grazing light that reveals the iron material while leaving the emblem the clear focal point. Black and charcoal tones with extremely restrained red accents. No new symbols, text, captions, labels, imagery, machinery, rivet patterns, tiles, panel seams, molten lava, large sparks or neon. Produce the entire artwork, no comparison layout, no split image. This is a background material study, not a logo redesign.
```

출력 원본: `exec-21cd38df-7c39-46dd-a17f-f1f6764ae7b6.png`.

### B — 검은 흑요석

```text
Use case: precise-object-edit. Edit target: supplied original FDG intro art. Produce one completed wide 16:9 image, original framing and size. Change ONLY the large stone background to a continuous monolithic BLACK OBSIDIAN volcanic glass surface. It must look clearly different from rough stone or hammered metal: broad smooth silky black glass planes, extremely restrained dark wine-red mineral wisps inside the glass, subtle smoky depth, a few sparse irregular fine fractures catching muted silver light, gentle broad satin reflections. No small regular grain, no pebbled surface, no dense scratches, no radiating cracks. Predominantly nearly-black charcoal, dark polished yet not mirror-like. The emblem and text must read sharply against a quieter and smoother material. KEEP the entire original ornate metal perimeter frame in exactly the same position and shape; KEEP the central sharp metal wolf crest, exact red eyes, its location and scale; KEEP exact lettering 'FDG' with the same font, spacing, size, position, metallic finish and horizontal flourish below. Same flat straight-on composition, no redesign or perspective shift. Keep restrained haze and tiny embers only near bottom corners. Soft upper-center grazing light reveals the glass texture without any hot white blown highlight. No new text, no labels, no added runes, no tiles, no molten lava, no landscape or props. Return the full single artwork, not a comparison grid. Preserve visual identity aggressively, vary background material only.
```

출력 원본: `exec-8eb735f4-ea20-45c9-b0e7-b269f2c11638.png`.
