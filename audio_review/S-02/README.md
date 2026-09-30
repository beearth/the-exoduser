# S-02 BGM 압축 후보 — 청취용

게임이 쓰지 않는 청취 비교용 파일입니다. `bgm/` 밖에 있어서 빌드·배포에 포함되지 않습니다 (`.vercelignore` 제외, NW.js/itch 빌드 목록에 없음).

| 원본 (게임 폴더) | 후보 |
|---|---|
| `bgm/1장_썩은숲/Ashes Under the Banner (Remastered).wav` | `Ashes Under the Banner (Remastered).{mp3_256k.mp3, ogg_q6.ogg, opus_160k.opus}` |
| `bgm/3장_얼음굴/흰눈의 맹세 (Remastered).wav` | `흰눈의 맹세 (Remastered).{…}` |
| `bgm/공통/네메시아의 강림2 (Remastered).wav` | `네메시아의 강림2 (Remastered).{…}` |

듣는 법과 확인 포인트: `docs/6사운드디자인/S02_BGM_COMPRESSION_20260930.md` §4.
측정 원자료: `measure_ffmpeg.jsonl`, `measure_chromium.jsonl`, `survey_17wav.jsonl`.
청취 결과는 `docs/6사운드디자인/SOUND_TEAM_LEAD.md` S-02에 적어 주세요. 채택이 끝나면 이 폴더는 삭제합니다.
