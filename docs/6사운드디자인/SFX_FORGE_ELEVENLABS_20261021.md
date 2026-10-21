# SFX Forge — ElevenLabs 효과음 생성 도구 (2026-10-21)

> 사용자 요청: 「ElevenLabs 사운드 이펙트로 지옥의 길 게임 효과음을 만들고 싶어. 스킬·타격·UI 효과음을 프롬프트로 생성하는 도구를 넣어줘.」
> 기존 단발 도구 `tools/elevenlabs_sfx.mjs`(REST 직접 호출, `sfx/` 직접 저장)는 그대로 둔다. SFX Forge는 SDK 기반으로 **분류별 하우스 스타일·후보 여러 개·청음 페이지·승격 단계**를 더한 도구다.

## 1. 구성

| 항목 | 값 |
|---|---|
| 도구 | `tools/sfx_forge.mjs` |
| 카탈로그 | `tools/sfx_forge_catalog.json` (`{ "sounds": [ {category,key,text,...} ] }`) |
| 테스트 | `test/sfxForge.test.js` (API 호출 없음, stub client) |
| 실행 | `npm run sfx:forge -- <gen\|batch\|promote\|list> ...` (`node --env-file=.env.local`) |
| SDK / 모델 | `@elevenlabs/elevenlabs-js` `textToSoundEffects.convert` / `eleven_text_to_sound_v2` |
| 키 | `.env.local`의 `ELEVENLABS_API_KEY`(gitignore, `npx -y @elevenlabs/cli@latest onboard` 가 저장). 도구는 키를 읽거나 출력하지 않는다 |
| 기본 형식 | `mp3_44100_128` |
| 후보 저장 | `../exoduser-wt/_out/sfx_forge/<category>/<key>/v<N>.mp3` + `manifest.json`(요청·바이트·시각). `SFX_FORGE_OUT`으로 변경 가능. 저장소·C 드라이브 밖 |
| 청음 페이지 | `../exoduser-wt/_out/sfx_forge/index.html` — 키별 후보를 나란히 재생 |
| 게임 반영 | `promote`만 `sfx/` 아래로 복사. `sfx/` 밖 경로 거부, 기존 파일은 `--force` 없이는 덮어쓰지 않음 |

## 2. 분류별 하우스 스타일 (CATEGORY_PRESETS)

`text`에는 소리 자체만 적고, 장르·감쇠·금지 꼬리는 분류가 붙인다. 형식은 [MAGIC_HIT_ELEVENLABS](MAGIC_HIT_ELEVENLABS_20260910.md)의 「소리+층 → 장르 → 시작/감쇠 → 금지 목록」을 따른다. `--raw`면 꼬리 없이 그대로 보낸다.

| 분류 | 기본 길이(초) | prompt influence | loop | 공통 꼬리 |
|---|---:|---:|---|---|
| skill | 1.2 | 0.7 | false | Single skill cast, dark hellish fantasy action RPG, weighty but restrained. Clear attack transient, controlled tail under one second. No voice, music, melody or long reverb. |
| hit | 0.5 | 0.85 | false | Single hit, dark fantasy action RPG. Immediate onset, dry 200-300 ms decay. No launch whoosh, voice, music, drone, long reverb or harsh highs. |
| ui | 0.5 | 0.8 | false | Game menu UI sound, dark gothic fantasy, iron, bone and ember textures. Short, clean and unobtrusive. No voice, music, chime melody or reverb tail. |
| ambient | 10 | 0.4 | true | Seamless looping background ambience for a dark hellish fantasy RPG. Even level, no sudden hits. No voice or music. |

## 3. 검증 규칙 (API 호출 전 거부)

| 규칙 | 값 |
|---|---|
| key | `^[a-z0-9][a-z0-9_-]{0,63}$` |
| 프롬프트 최종 길이 | ≤ 450자 |
| 길이 | 0.5–30초 (API 최소 0.5초 — UI 기본도 0.5초) |
| prompt influence | 0–1 |
| 후보 수 | 1–4 (`--variants`) |
| 재실행 | 이미 있는 `v<N>`은 다시 생성하지 않음(크레딧 절약). `--force`로만 재생성 |
| 응답 | 512바이트 미만이면 실패 처리 |

## 4. 사용법

```bash
# 카탈로그 확인만 (크레딧 0)
npm run sfx:forge -- batch --catalog tools/sfx_forge_catalog.json --dry-run
# 카탈로그 일부 생성, 후보 3개씩
npm run sfx:forge -- batch --catalog tools/sfx_forge_catalog.json --only parry_clang,blade_bone --variants 3
# 즉석 한 개
npm run sfx:forge -- gen --category ui --key gem_socket --text "A small dark gem snapping into an iron socket" --variants 2
# 청음 후 게임으로 승격
npm run sfx:forge -- promote --category hit --key parry_clang --variant 2 --to sfx/hit/parry_clang.mp3
# 청음 페이지 다시 만들기
npm run sfx:forge -- list
```

## 5. 초기 카탈로그 (14종, 미생성)

| 분류 | key | 용도 |
|---|---|---|
| skill | ki_slash_cast | 기검참 은빛 검기 |
| skill | giant_slam_cast | 지옥강타 |
| skill | ice_orb_cast | 얼음 보주 |
| skill | spike_trap_cast | 가시덫 |
| hit | blade_flesh | 근접 살 피격 |
| hit | blade_bone | 해골 피격 |
| hit | parry_clang | 패링 성공 |
| hit | crit_heavy | 크리티컬 |
| ui | menu_open / menu_close | 창 열기·닫기 |
| ui | button_hover / button_confirm | 버튼 호버·확인 |
| ui | skill_learn | 스킬 습득 |
| ambient | hell_forest_bed | 1장 숲 배경 루프 |

## 6. 상태

- 2026-10-21: 도구·카탈로그·테스트(9/9 PASS)·dry-run(14/14 유효)·`elevenlabs onboard check` 통과(키 끝자리 0ce8, SDK 선언·사용 확인).
- **실제 생성·청음·게임 반영은 아직 0건**. 후보를 만든 뒤 사용자 청음 선택 → `promote` → 게임 코드의 SFX 매핑 연결 → 이 문서 표 갱신 순서로 진행한다.
- 승격으로 `sfx/`가 바뀌면 배포 시 CLAUDE.md의 DEMO/EA 에셋 동기화 대상이 된다.
- ElevenLabs MCP(`tools/mcp_elevenlabs_launcher.cjs`, `claude mcp` local scope)도 같은 키(`.env.local` 우선)를 읽는다. 출력은 저장소 옆 `../exoduser-wt/_out/elevenlabs`(`ELEVENLABS_MCP_BASE_PATH`로 변경). MCP는 세션 시작 때 로드된다. Mac 등록: `claude mcp add ElevenLabs -s local -- node <W>/tools/mcp_elevenlabs_launcher.cjs`(uvx 필요).
