# TOOLS — pixelfx(patch-gg): 코드로 그리는 픽셀 이펙트 244종 + Claude Code 스킬 (2026-11-05, 클라우드 조사)

출처(CTO 11-05 전달): 사용자 공유 "오늘코딩" Shorts ②. 저장소 확인: `github.com/patch-gg/pixelfx` **[열림]**(포크 다수: fewismuch·peacepiece7·bf-gamedev 등은 232~246 표기).

## ① 목적 · 단계
- **임팩트(VFX) 단계의 플립북 재료**(CTO 사전 판단). 프리셋을 그대로 쓰는 것은 금지, **팔레트(실버 헬)·타이밍(예고→접점→본체→잔여, 5.1 임펙트 문서)**을 우리 값으로 바꿔 렌더한 시트만 쓴다. 효과는 JS 함수(코드)라 결정론적·수정 가능.
- 적합 판단: **적합(재료로만).** 이펙트가 24×38px 캐릭터 스케일·1px 디테일로 그려져 우리 저해상도 픽셀 렌더 스케일과 맞다. 라이선스 MIT(상업 가능). 단 효과의 "느낌"은 레트로 2D 게임 톤이라 그대로는 2.5D 장면과 어긋남 → 팔레트·발광(light 버퍼)·프레임 수를 우리 VFX 4단계 표에 맞춘 뒤 NativeImpactView 플립북과 나란히 판정.

## ② 입력 형식
- 효과 id(`<category>/<name>`), 옵션 JSON(`palette` 어두움→밝음 hex 램프, `seed`, `x/y/flip/angle/light`), 선택 캐릭터 마스크(actor). 출력은 PNG 시트 + Aseprite식 JSON.

## ③ 옵션 전수표
라이선스 **MIT**(코드·효과; `gallery/fonts` Patch Pixel 폰트는 제외, NOTICE.md) · 최근 커밋 **2026-10-31 "pixelfx 0.3.0: give the effects a body that performs them"** **[열림]** · 의존: 브라우저 사용 시 0, CLI 도구는 Node.js(버전 미표기) · 설치 `npm i github:patch-gg/pixelfx` 또는 `src/core`+필요 효과 복사.

| 옵션 | 무엇을 바꾸나 | 우리 설정값 | 근거 |
|---|---|---|---|
| 효과 정의 `src/fx/<category>/<name>.js`: 순수 `draw(p, t, o)` / 시뮬 `create(o)`(120 Hz 스텝) | 시간 t만으로 프레임 결정(루프 무봉합) vs 파티클 시뮬 | 접점·본체는 순수 draw형 우선(프레임 재현성) | README·docs/AUTHORING.md **[열림]** |
| `meta`: `name, desc, tags, size, origin, duration, loop, fps, bg, options` | 캔버스 크기·원점·길이·루프·fps·기본 옵션 | `fps 30`, `duration` = 우리 4단계 합(예 예고 0.2 + 접점 0.07 + 본체 0.3 + 잔여 0.5초), `loop false`(임팩트) | AUTHORING **[열림]**; 5.1 임펙트 타이밍 표(G1 산출물) |
| `o.palette`(hex 램프, `fit(o.palette, n)`로 길이 무관) | 색 | **실버 헬 토큰 램프**(은빛 강철·차가운 하이라이트, 원색 초록·노랑 금지) | AUTHORING **[열림]**; DESIGN_CONCEPT_SILVER_HELL |
| `o.seed` | 결정론 난수(Math.random·Date 금지) | 고정 시드(예 1105) | 〃 |
| 예약 옵션 `x, y, flip, angle, light` | 배치·반전·회전·가산 발광 | light는 Bloom 임계 1.1과 충돌 주의(11-04 D2 베이지 원판 사고) → light 낮게 | 〃; CHANGELOG 11-04 L9 |
| actor 효과(`actor: 2`, `o.actor = {mask, pixels, x, y, w, h, head, chest}`) | 캐릭터 몸에 그리는 효과(스톡 더미 24×38) | **쓰지 않음**(우리 캐릭터는 3D 픽셀 렌더; 몸 위 효과는 재생성 필요) | README caveat **[열림]** |
| 타이밍 관례(AUTHORING): charge → release(1~2프레임 백색 플래시) → spread → hold → break/melt → long decay; 히트 프리즈 0.03~0.2초; 스냅 히트 0.3~0.8초; 대형 2~4초 | 단계 길이 | 우리 표로 매핑: 예고=charge, 접점=release(백색 플래시는 은빛으로 톤 다운), 본체=spread/hold, 잔여=decay | AUTHORING **[열림]** |
| `node tools/render.mjs <id> --sheet` | 투명 PNG 그리드 + Aseprite식 JSON(frames rect·duration·`meta.pixelfx{fps,loop,columns,pivot}`) | 시트 내보내기 기본 | README·tools/render.mjs **[열림]** |
| render 플래그: `--gif`, `--mp4`(루프면 3회), `--sheet`, `--all`(컨택트 400프레임), `--no-actor`, `--out DIR`(기본 records/), `--max N`(16), `--zoom N`, `--scale N`(자동 2~8), `--loops N`, `--fps N`, `--seed N`, `--bg NAME`, `--opts JSON` | 렌더 옵션. **`--palette`는 플래그가 아니라 `--opts` JSON 안**; `--frames/--size/--columns` 없음; 모르는 `--name`은 다음 인자를 먹고 무시 | `--sheet --no-actor --opts '{"palette":[…실버 헬…],"seed":1105}'` | tools/render.mjs **[열림]** |
| `node tools/sheets.mjs` | 전체 라이브러리 시트 일괄 | 쓰지 않음(필요 효과만) | README **[열림]** |
| `tools/new.mjs`, `check.mjs`(2ms/프레임·루프 이음·키 순서 검사), `act.mjs`(캐릭터 동작 확인) | 저작·검사 | 새 효과는 new → render → check 루프 | AUTHORING **[열림]** |
| Claude Code 스킬: `/plugin marketplace add patch-gg/pixelfx` → `/plugin install pixelfx@pixelfx` 또는 `skills/pixelfx`를 `~/.claude/skills/`에 복사 | 자연어로 찾기·변주·내보내기 | 설치는 사용자 승인(설정 변경) 뒤; 설치 없이 CLI만으로도 가능 | README **[열림]** |
| Unity 임포트 | Aseprite JSON 임포터(Unity 2D Aseprite Importer 패키지 등)로 읽힘 | 시트 PNG + JSON → 우리 플립북 재질(NativeImpactView) 프레임 규격으로 변환 스크립트 필요 `[미검증]` | README **[열림]**(임포터 호환 서술만) |

## ④ 절차 (Mac 실습용: 입력 · 명령 · 기대 출력)
1. 준비: `git clone https://github.com/patch-gg/pixelfx`(Node 설치본 사용, 전체 경로), 효과 후보 3개 고르기(예 `melee/slash-arc`, `impacts/hit-spark`, `holy/burst` — 실제 id는 `src/fx/` 목록에서 확인).
2. 팔레트 파일 `tools/tm/silverhell_palette.json`(실버 헬 토큰 6~8색 램프, 어두움→밝음) 작성.
3. 명령(효과당):
   ```
   node tools/render.mjs melee/slash-arc --sheet --no-actor --zoom 3 --seed 1105 \
     --opts "$(cat tools/tm/silverhell_palette.json)" --out I:/EXODUSER-Storage/tm/pixelfx/out
   ```
4. 기대 출력: `out/<name>/<name>.png`(투명 시트) + `<name>.json`(프레임 rect·duration) + `contact.png`. 3개 효과 × (프리셋 원색 / 실버 헬 팔레트) 비교판 `MANUAL/img/tools-pixelfx-board.png`.
5. 타이밍 수정이 필요하면 `src/fx/...js`의 `meta.duration`·단계 비율을 5.1 표 값으로 바꾸고 `node tools/check.mjs <id>` 통과 뒤 재렌더.
6. Unity 반입은 비교판 PASS 뒤(NativeImpactView 플립북 규격 변환 스크립트 작성, 승인 뒤).

## ⑤ 출력 형식 · 네이밍
- `VFX_<스킬>_<단계>_pfx.png` + `.json`, 프레임 크기는 효과 `meta.size`(96~320px), fps 30. 원색 프리셋 시트는 저장소에 넣지 않는다(비교판에만).

## ⑥ 검수 방법
- 비교판: 프리셋 원색 ↔ 실버 헬 팔레트, 1x·3x, 10초 무음 영상(접점 플래시가 흰 섬광으로 터지지 않는지 — 11-04 D2 사고 기준).
- 4단계 타이밍이 5.1 표와 ±1프레임 안. 점 0(파티클 잔점은 decay 끝에서 1px 점으로 남기 쉬움 → 마지막 10% 프레임 알파 컷).

## ⑦ 금지 · 흔한 실패
- 프리셋 그대로(원색·레트로 톤) 반입 금지.
- actor 효과를 우리 캐릭터에 그대로 쓰기(스톡 더미 전용).
- `--palette`를 플래그로 넘기기(무시되고 다음 인자를 먹음) → `--opts` JSON.
- light 버퍼 강한 값 + 3D Bloom 조합(베이지 원판 재발).
- Patch Pixel 폰트 재배포 금지(MIT 제외).

## ⑧ 실습 기록
- Mac 실습 대기. 기록: 커밋 SHA(pixelfx), 효과 id 3개, 팔레트 파일, 비교판 경로, check.mjs 결과, 점 수, SHA.
