# S-02 BGM WAV 압축 후보 비교 (2026-09-30)

> 관리: [SOUND_TEAM_LEAD.md](SOUND_TEAM_LEAD.md) S-02 · 상태: **후보 준비 완료, 청취 미검수**
> 원본 WAV는 한 파일도 수정·삭제하지 않았다. 게임 코드(`BGM.tracks`)도 아직 WAV를 가리킨다.

## 1. 문제 — 게임이 WAV 17곡을 그대로 쓴다

| 항목 | 값 |
|---|---|
| 대상 | `BGM.tracks.gameplay`(공용 풀 50곡) 중 `(Remastered).wav` **17곡** + 설정 BGM 드롭다운 17항목 |
| 규격 | 전곡 48 kHz · 16 bit · 스테레오 PCM (1,536 kb/s) |
| 합계 | **869.1 MB · 75.4분** (곡당 27.8~80.6 MB) |
| 로딩 방식 | `BGM._getAudio()` → `new Audio(src)` + `preload='auto'`, 최근 6곡 LRU 캐시 (`_CACHE_MAX:6`, 주석: ".wav 트랙이 커서") |
| 반복 방식 | 자동 모드: 곡 끝(`onended`) → 다음 곡. 드롭다운으로 한 곡 고정 시 `a.loop=true` |
| 패키지 영향 | `build_itch.cjs`·`build-nwjs.mjs` 모두 `bgm/` 폴더 통째 복사 → 869 MB 전부 itch/Steam/NW.js 빌드에 포함. Vercel은 `.vercelignore`에서 WAV를 제외하지 않음 |

**부담의 실체**: HTMLAudio는 스트리밍 재생이라 디코딩된 PCM을 메모리에 통째로 올리지 않는다. 그래서 문제는 CPU보다 **전송량과 패키지 용량**이다. 로컬 서버(localhost)에서는 WAV도 10~60 ms 만에 재생 가능 상태가 돼서, 로컬 측정으로는 차이가 드러나지 않는다(§3.3).

## 2. 후보와 대표곡

**대표곡 3곡** — 성격이 다른 곡으로 골랐다.

| 곡 | 이유 |
|---|---|
| `1장_썩은숲/Ashes Under the Banner (Remastered).wav` | 최대 용량(80.6 MB, 420초), 메탈 계열 — 심벌·기타 고역 손실 확인용 |
| `3장_얼음굴/흰눈의 맹세 (Remastered).wav` | 오케스트라·합창, 다이내믹 폭 최대(LRA 11.5) — 잔향 꼬리 손실 확인용 |
| `공통/네메시아의 강림2 (Remastered).wav` | 145초 짧은 곡, 끝 무음 없음 — 반복(loop) 이음새 확인용 |

**후보 3종** — `tools/bgm_compress_eval.py encode`로 생성. 원본 태그(`comment` = Suno 생성 ID) 유지.

| 후보 | 코덱 설정 |
|---|---|
| `mp3_256k` | libmp3lame 256 kb/s CBR |
| `ogg_q6` | libvorbis q6 (≈170 kb/s VBR) |
| `opus_160k` | libopus 160 kb/s VBR |

파일 위치: `audio_review/S-02/` (9개, 65 MB). **`bgm/` 밖에 둔 이유**: 두 빌드 스크립트가 `bgm/`을 통째로 복사하기 때문이다. `audio_review/`는 NW.js·itch 빌드 목록에 없고, Vercel은 `.vercelignore`에 추가해 제외했다.

## 3. 측정 결과

### 3.1 용량

| 곡 | 원본 WAV | MP3 256k | OGG q6 | Opus 160k |
|---|---|---|---|---|
| Ashes Under the Banner | 80.64 MB | 13.44 MB (16.7%) | 8.89 MB (11.0%) | 8.69 MB (10.8%) |
| 흰눈의 맹세 | 66.72 MB | 11.12 MB (16.7%) | 7.22 MB (10.8%) | 7.21 MB (10.8%) |
| 네메시아의 강림2 | 27.84 MB | 4.64 MB (16.7%) | 2.99 MB (10.7%) | 2.95 MB (10.6%) |
| **17곡 전체 환산** | **869 MB** | **≈145 MB** | **≈94 MB** | **≈94 MB** |

17곡 환산은 대표곡 비율을 곱한 추정치다. 전곡을 인코딩해서 잰 값이 아니다.

### 3.2 길이·라우드니스·피크·태그 (ffmpeg 7.0.2 디코드 기준)

| 곡 / 판 | 길이 | 샘플 수 차 | LUFS | True Peak | 클리핑 | 원본 대비 잔차 | Suno 태그 |
|---|---|---|---|---|---|---|---|
| Ashes — WAV | 420.00 s | — | −14.9 | −2.4 dBTP | 0 | — | 있음 |
| Ashes — MP3 | 420.02 s | 0 | −14.9 | −2.3 | 0 | −36.4 dB | 유지 |
| Ashes — OGG | 420.00 s | 0 | −14.9 | −2.0 | 0 | −25.9 dB | 유지 |
| Ashes — Opus | 420.01 s | 0 | −14.9 | −2.0 | 0 | −23.0 dB | 유지 |
| 흰눈 — WAV | 347.48 s | — | −15.4 | −3.0 | 0 | — | 있음 |
| 흰눈 — MP3 | 347.52 s | 0 | −15.4 | −3.1 | 0 | −32.7 dB | 유지 |
| 흰눈 — OGG | 347.48 s | 0 | −15.4 | −2.9 | 0 | −23.8 dB | 유지 |
| 흰눈 — Opus | 347.49 s | 0 | −15.4 | −3.0 | 0 | −21.7 dB | 유지 |
| 네메2 — WAV | 145.00 s | — | −15.7 | −2.5 | 0 | — | 있음 |
| 네메2 — MP3 | 145.03 s | 0 | −15.7 | −2.5 | 0 | −36.1 dB | 유지 |
| 네메2 — OGG | 145.00 s | 0 | −15.7 | −2.4 | 0 | −25.1 dB | 유지 |
| 네메2 — Opus | 145.01 s | 0 | −15.7 | −2.2 | 0 | −23.0 dB | 유지 |

- 라우드니스는 9개 후보 모두 원본과 0.0 LU 차이다. 볼륨 재조정은 필요 없다.
- True Peak는 최대 +0.4 dB 올랐지만(Ashes의 OGG·Opus) 전부 −2.0 dBTP 이하라서 클리핑 위험은 없다.
- **잔차(null test)는 음질 점수가 아니다.** 손실 압축은 귀에 안 들리는 성분을 버리도록 설계돼 있어서, 잔차가 크다고 더 나쁘게 들리는 것은 아니다. 원본을 얼마나 파형 그대로 옮겼는지 보는 참고값일 뿐이다. 음질 판정은 §4 청취로만 한다.
- 컨테이너에 표시되는 길이(0.01~0.04초 더 긺)는 인코더 패딩 표기다. 실제 디코드 샘플 수는 ffmpeg 기준 전부 원본과 같다.

### 3.3 Chromium(게임 엔진) 실측 — `tools/bgm_browser_check.cjs`

게임과 같은 Chromium에서 `new Audio()` 로드와 `decodeAudioData` 전체 디코드를 측정했다.

| 곡 / 판 | 재생 가능까지 (localhost) | 디코드 샘플 수 | 원본 대비 | 끝 무음 |
|---|---|---|---|---|
| Ashes — WAV | 60 ms | 20,160,000 | — | 0.6 ms |
| Ashes — MP3 | 11 ms | 20,160,000 | **정확** | 0.6 ms |
| Ashes — OGG | 23 ms | 20,160,704 | **+704 (+14.7 ms)** | 15.3 ms |
| Ashes — Opus | 21 ms | 20,160,000 | **정확** | 0.6 ms |
| 흰눈 — WAV | 13 ms | 16,679,040 | — | 0.4 ms |
| 흰눈 — MP3 | 11 ms | 16,679,040 | 정확 | 0.4 ms |
| 흰눈 — OGG | 17 ms | 16,679,360 | +320 (+6.7 ms) | 7.0 ms |
| 흰눈 — Opus | 26 ms | 16,679,040 | 정확 | 0.4 ms |
| 네메2 — WAV | 10 ms | 6,960,000 | — | 0 ms |
| 네메2 — MP3 | 15 ms | 6,960,000 | 정확 | 0 ms |
| 네메2 — OGG | 18 ms | 6,960,192 | +192 (+4.0 ms) | 4.3 ms |
| 네메2 — Opus | 16 ms | 6,960,000 | 정확 | 0 ms |

- 9개 후보 모두 Chromium에서 재생·디코드 오류가 없다.
- **OGG Vorbis만 Chromium에서 끝에 4~15 ms 무음이 붙는다.** ffmpeg 디코드에서는 정확했으니 Chromium의 Vorbis 끝 처리 차이다. 드롭다운 한 곡 반복(`loop=true`)에서 이음새마다 짧은 틈이 생길 수 있다.
- MP3(LAME 갭리스 헤더)와 Opus는 Chromium에서도 샘플 단위로 정확하다.
- localhost에서는 WAV도 즉시 재생돼서 로딩 시간 차이는 측정되지 않았다. 네트워크 기준 추정(계산값): 50 Mbps 회선에서 전체 다운로드는 Ashes WAV 12.9초, MP3 2.2초, Opus 1.4초다. HTMLAudio는 받는 대로 재생하므로 체감 차이는 첫 재생 지연보다 **데이터 사용량·패키지 크기** 쪽이 크다.

## 4. 청취 검수 — 아직 안 됨

사람이 듣지 않았으므로 **음질 검수는 미완료**다. 확인할 것:

| 곡 | 들어볼 곳 | 확인 포인트 |
|---|---|---|
| Ashes Under the Banner | 드럼·심벌이 몰리는 후반부 | 심벌 "치익" 뭉개짐(프리에코), 기타 고역 흐려짐 |
| 흰눈의 맹세 | 합창·잔향 꼬리, 조용한 구간 | 잔향 끝 지글거림, 조용한 부분 노이즈 |
| 네메시아의 강림2 | 설정 → BGM 드롭다운에서 이 곡 고정 → 반복 전환 순간 | 원본 자체에 이음새 튐 있음(S-10), 후보가 더 나빠지는지 |

방법: 원본과 후보를 같은 볼륨으로 번갈아 듣기(A/B). 가능하면 파일명을 가리고 맞히기(ABX). 헤드폰과 스피커 둘 다.

## 5. 팀장 권고 (청취 전 잠정)

| 순위 | 후보 | 근거 |
|---|---|---|
| 1 | **MP3 256k** | Chromium 샘플 정확(반복 안전). 게임이 참조하는 나머지 BGM 59곡이 이미 MP3라 포맷 일관성. 브라우저·OS 호환성 가장 넓음. 용량 83% 절감(869 → 약 145 MB) |
| 2 | Opus 160k | 가장 작음(약 94 MB). Chromium 샘플 정확. 단 웹 버전을 Safari로 여는 유저가 있으면 호환성 확인 필요 |
| 3 | OGG q6 | 용량은 Opus와 같지만 Chromium 끝 패딩 때문에 반복 재생 곡에 불리 |

**최종 채택은 §4 청취 후.** 채택 후 할 일: 17곡 전체 변환 → `BGM.tracks.gameplay`와 설정 드롭다운(`game.html` 2767~2783행 부근) 경로 교체 → 원본 WAV를 저장소 밖(로컬 원본 보관 폴더)으로 이동 → DEMO/EA 동기화.

## 6. 재현 방법

```bash
python3 tools/bgm_compress_eval.py survey                              # 17곡 전체 측정
python3 tools/bgm_compress_eval.py encode audio_review/S-02 "bgm/…wav"  # 후보 생성+비교
node server.cjs   # 다른 창
PW=$(npm root -g)/playwright node tools/bgm_browser_check.cjs '["bgm/…wav","audio_review/S-02/…mp3"]'
```

원자료: `audio_review/S-02/measure_ffmpeg.jsonl`, `measure_chromium.jsonl`, `survey_17wav.jsonl`.
측정 환경: 클라우드 컨테이너, ffmpeg 7.0.2 (imageio-ffmpeg 정적 빌드), Playwright 1.56.1 Chromium.
