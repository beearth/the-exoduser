# ElevenLabs 마법 피격음 후보 — 2026-09-10

이 후보 제작 당시 사용자 지시: 이전 Python 합성 후보 4종은 채택하지 않는다. 처음 만든 `sfx/hit/player_projectile_impact.wav`를 당시 게임에 유지하고, 새 후보는 ElevenLabs로 생성한다. 코드의 샘플 매핑·유효 충돌 연결과 파일 SHA256 보존을 확인했다. 새 마법 후보는 선택 전이며 런타임 교체는 하지 않았다.

| 항목 | 값 |
|---|---|
| 생성 도구 | tools/generate_magic_hit_candidates.mjs → tools/elevenlabs_sfx.mjs |
| 실제 공급자 / 모델 | ElevenLabs / eleven_text_to_sound_v2 |
| API | POST https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128 |
| 요청 설정 | duration_seconds=0.5, prompt_influence=0.85, text≤450자 |
| 원본 | 마법_피격음_일레븐랩스/01_마력_파열.mp3, 02_암흑_마법_충돌.mp3, 03_전격_피격.mp3 |
| 비교 도구 | tools/prepare_magic_hit_audition.py |
| 비교 페이지 | 마법_피격음_일레븐랩스/여기서_들어보기.html |
| 후처리 | FFmpeg 디코드·48kHz 모노 변환, 후보 gain=min(0.75/peak,0.16/RMS). 생성 원본 MP3 보존. 새로운 합성 레이어 없음 |
| 비교 WAV | PCM16, round(samples×32767), 단발 gain0.55. 현재 소리에는 후보 정규화를 적용하지 않음 |
| 개별 비교 시간 | 4초, 0.15·0.85·1.55초 단발 + 2.5·2.6·2.7·2.8·2.9·3.0초 연속 |
| 전체 비교 | 현재→1→2→3, 각 4초 뒤 무음0.5초, 총18초 |
| 검증 기준 | 디코드 길이0.4~0.7초, peak>0.01, RMS>0.001, 비교 WAV peak<1·유한 샘플 |
| 브라우저 검증 | 현재+후보 총4개 duration4초·재생 위치0.25초 초과·readyState4·중복 재생 없음·페이지 오류 없음 PASS |
| 청감 평가 | 사용자 선택 대기. 자동 재생 검증만 완료 |

## 후보 측정값

원본 MP3를 float로 디코드하면 일부 peak가 1을 넘는다. 비교 WAV는 이를 포함한 peak에 맞춰 감쇄하여 클리핑 없이 저장했다.

| 번호 | 이름 | 디코드 길이(초) | 원본 peak | 원본 RMS | 비교용 정규화 gain | 연속 비교 peak |
|---|---|---:|---:|---:|---:|---:|
| 1 | 마력 파열 | 0.48 | 0.8592116236686707 | 0.16967273888739778 | 0.8728932190158721 | 0.4481206892078938 |
| 2 | 암흑 마법 충돌 | 0.48 | 1.3715119361877441 | 0.14308279126997436 | 0.546841759237401 | 0.41527709436903354 |
| 3 | 전격 피격 | 0.48 | 1.4359207153320312 | 0.23720972349754152 | 0.5223129605916826 | 0.5009297149642941 |

## 실제 생성 프롬프트

### 1 마력 파열

A compact magical energy orb bursting on contact: a dense arcane pop, layered with a brief shimmering granular energy shatter and a soft low-mid pressure pulse. Clearly supernatural spell damage. Single spell hit, dark fantasy RPG. Immediate onset, dry 200-300 ms decay. No launch whoosh, metal clang, wooden knock, gunshot, voice, music, drone, long reverb or harsh highs.

SHA256: `7333d10a347f1199674130780314f3a6ec24e9f9ce080638bd9b0510f95823e7`

### 2 암흑 마법 충돌

A cursed shadow bolt striking a warrior: a forceful hollow arcane whump with a gritty supernatural energy rupture, a very short inward suction and smoky magical fizz fading quickly. Weighty dark sorcery impact. Single spell hit, dark fantasy RPG. Immediate onset, dry 200-300 ms decay. No launch whoosh, metal clang, wooden knock, gunshot, voice, music, drone, long reverb or harsh highs.

SHA256: `55e8e7b1d68d5321b4de41a90e6b8f15e2bd921b128ec714d7d9b186f8477103`

### 3 전격 피격

A magical lightning projectile hitting a character: a punchy electrical zap with a dense energy snap and tiny sizzling arc fragments, a compact midrange impact underneath. Fantasy lightning damage, controlled and not shrill. Single spell hit, dark fantasy RPG. Immediate onset, dry 200-300 ms decay. No launch whoosh, metal clang, wooden knock, gunshot, voice, music, drone, long reverb or harsh highs.

SHA256: `fe0771d9ffa8c179a03ac261edc805c45a0bf59655107a4e5cba44fcc60e09c7`

요청·해시는 제작_기록.json, 측정값은 검증.json, 브라우저 결과는 재생_검증.json에 기록한다. 재실행 시 존재하는 MP3는 다시 생성하지 않는다. 기존 파일이 모두 완료되었을 때만 manifest status를 generated로 기록한다.

[공식 API 문서](https://elevenlabs.io/docs/api-reference/text-to-sound-effects/convert).


## 후속 적용 상태

현재 게임에는 사용자 선택③ [Freesound Bisqo855371 편집본](BISQO_MAGIC_HIT_20260910.md)을 연결했다. 이 문서의 후보·현재음 비교 파일은 제작 당시 소리를 보존한 이력이다.
