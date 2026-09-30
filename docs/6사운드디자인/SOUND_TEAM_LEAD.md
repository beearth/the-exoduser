# 사운드 팀장 관리 문서 — 지옥의 길 (THE EXODUSER)

> **이 문서의 역할**: 사운드 프로젝트의 **관리 허브**. 현황판·이슈 트래커·작업 백로그·규칙을 한 곳에 모은다.
> 시스템 상세 스펙(몬스터 사망음 매핑, 우선순위, BGM 큐 규칙 등)은 [`6사운드디자인.md`](./6사운드디자인.md)가 진실 공급원이고, 이 문서는 **무엇이 문제이고 다음에 무엇을 할지**를 관리한다.
>
> - 담당: 사운드 팀장 (Claude)
> - 최초 작성: 2026-09-30
> - 전수조사 도구: `python3 tools/sound_audit.py` (`--list`로 전체 경로 출력) · BGM 측정: `tools/bgm_compress_eval.py`, `tools/bgm_browser_check.cjs`
> - 갱신 규칙: 사운드 작업이 끝날 때마다 §3 현황 수치, §4 이슈 상태, §5 백로그, §8 인계, §9 작업 로그를 갱신한다.

---

## 1. 사운드 톤 — 이 게임은 어떻게 들려야 하는가

| 축 | 방향 | 금지 |
|---|---|---|
| 세계관 | 지옥 고딕 — 흑철, 뼈, 지옥불, 성가대, 쇠사슬 | 밝은 판타지 효과음, 만화식 효과음 |
| 타격감 | 저음 펀치 + 짧은 고음 크랙. 무거운 쪽을 우선 | 길게 늘어지는 꼬리 (대량 처치 시 뭉개짐) |
| BGM | 오케스트라+합창+메탈 혼합, 장별 색 (숲=부패, 벌레굴=점액, 얼음=냉기, 화염, 군단=전쟁, 사도마굴=뼈, 지옥성=혼돈) | 장 분위기와 안 맞는 곡 혼입 (예: h0_explore는 1장 느낌이라 공용 풀 제외 — 사용자 지시) |
| 보이스 | 캐릭터 DESIGN LOCK과 같은 인물로 들려야 함 (실버테일=영어 여성 전사) | 같은 캐릭터인데 음색이 바뀌는 것 |
| 믹스 | 스킬 > 보이스 > 플레이어 피격 > 사망 > 발소리 > 타격 > 투사체 > 앰비언트 (`_SFX_PRI`) | 대량 전투에서 보이스·스킬음이 묻히는 것 |

## 2. 역할과 작업 절차

### 2.1 사운드 작업 파이프라인
1. **기획** — 이벤트·트리거·우선순위 등급(`_SFX_PRI`)·동시 재생 상한을 먼저 정한다.
2. **생성** — SFX·보이스: ElevenLabs (프롬프트는 `docs/10ai에셋프롬프트모음/`). BGM·주제가: Suno ([주제가_SUNO_프롬프트.md](./주제가_SUNO_프롬프트.md)).
3. **후보 청취** — 후보 3개 이상을 `_cand_` 접두어로 두고 사용자 청취 후 채택. 채택 후 후보 파일은 정리 목록(§4)에 올린다.
4. **규격화** — §6 규격대로 변환(길이·라우드니스·포맷).
5. **연결** — `game.html`의 `SFX` 레지스트리(파일 키 → 경로)에 등록하고 우선순위 등급을 지정한다.
6. **검수** — 실제 게임에서 대량 전투 상황으로 청취. `tools/sound_audit.py`로 누락 0 확인.
7. **문서** — `6사운드디자인.md` 스펙 + 이 문서 §9 작업 로그·§8 인계 갱신. 동기화 규칙(CLAUDE.md docs/ 동기화)대로.

### 2.2 팀장 체크 루틴 (사운드 작업마다)
- [ ] `python3 tools/sound_audit.py` 실행 → 누락(missing)이 늘지 않았는가
- [ ] 새 파일이 NFC(완성형) 한글 이름인가 (§4 S-01 참고)
- [ ] 새 BGM이 WAV가 아니라 규격 포맷인가 (§6)
- [ ] 새 텍스트(보이스 자막 등)가 있으면 `번역대상_전체목록.md` 등록
- [ ] DEMO/EA 에셋 동기화 대상인지 확인 (CLAUDE.md 배포 절차의 `sfx bgm` 복사)

## 3. 현황판 (2026-09-30 전수조사, S-01·S-03 반영 후)

`tools/sound_audit.py` 기준. 한글 경로는 NFC로 정규화해 비교.

| 항목 | 수치 | 비고 |
|---|---|---|
| 코드가 참조하는 오디오 경로 | 294 | `game.html`·`index.html`·lang/data js (S-03 전 316) |
| 실제 오디오 파일 | 398 | sfx 21MB, bgm 약 1.1GB (NFD 중복 1.16GB 제거 후) |
| 참조했는데 파일 없음 | **0** | S-03 전 22개 — 전부 호출 없는 레거시 테이블이었음 |
| 파일 있는데 참조 없음 | 104 (22.2MB) | 교체된 구버전·미연결 에셋 (S-04, S-05) |
| NFD 중복 BGM | 0 (제거 전 71개 / 1.16GB) | S-01 완료 2026-09-30 |
| 게임이 로드하는 WAV | BGM 17곡 / **869MB** + SFX 2개 | 압축 후보 준비됨, 청취 대기 (S-02) |
| 공용 풀 안 바이트 동일 쌍 | 2쌍 / 105.4MB | S-09 |

### 3.1 에셋 구성

| 폴더 | 파일 수 | 내용 |
|---|---|---|
| `sfx/death/` (+`ACE/` 43) | 106 | 몬스터 사망. 게임은 `ACE/` 업그레이드판 사용, 루트 48개는 구버전 |
| `sfx/voice/` | 67 | 플레이어·실버테일 보이스 |
| `sfx/monster/` | 26 | 이동·피격 아키타입 (`_ARCH_SFX`, `_ETYPE_SFX`) |
| `sfx/skillsound/` | 23 | 스킬별 |
| `sfx/hit/` | 15 | 타격 |
| `sfx/pet/`, `sfx/storm/` | 각 10 | 펫 보이스(미연결), 전기폭풍 |
| 기타 (`beam weapon pickup misc q_parry sword_parry swing drop equipment magic ice boss spike_trap`) | 60 | |
| `bgm/` 장별 7폴더 + `공통` + `cutscene` | 79곡 (중복 제외) | `BGM.tracks` (game.html) |

## 4. 이슈 트래커

상태: 🔴 미착수 · 🟡 진행중 · 🟢 완료 · 🟠 총괄 결정 필요 · ⚪ 보류

| ID | 심각도 | 이슈 | 근거 | 제안 조치 | 상태 |
|---|---|---|---|---|---|
| S-01 | 높음 | **BGM 71곡이 NFD/NFC 두 벌로 git에 중복** — 1.16GB 낭비. 한글 폴더(`1장_썩은숲`, `공통` 등)가 macOS 자모 분리형(NFD)으로 한 번 더 커밋됨. 두 벌 MD5 71/71 동일. | `git ls-files -z bgm` → 152개 중 NFD 71 | NFD 사본 `git rm`. Windows(NTFS)는 두 이름을 별개 폴더로 체크아웃하므로 G:\ 작업본에도 폴더가 두 개 있을 수 있음 → 확인 후 정리. 이후 커밋 전 NFC 검사. **2026-09-30 사용자 승인 → NFD 사본 71개 `git rm` 완료.** 코드의 NFD 경로 참조 0건, NFC 사본 71개 전부 존재 확인, 누락 경로 수 22 그대로. 남은 일: G:\ 작업본에서 pull 후 NFD 폴더가 남아 있으면 삭제, macOS에서 커밋 시 `git config core.precomposeunicode true` | 🟢 |
| S-02 | 높음 | **BGM WAV 17곡(869MB)을 게임이 직접 로드** — `(Remastered).wav` 계열. 로딩·메모리·배포 용량 부담, itch/Steam 패키지 비대화 | `sound_audit.py` WAV 항목 | OGG Vorbis q6 / MP3 256k로 변환 후 `BGM.tracks` 경로 교체. 원본 WAV는 저장소 밖 보관. **2026-09-30 진행**: 17곡 측정, 대표 3곡 × 후보 3종(MP3 256k·OGG q6·Opus 160k) 생성 → `audio_review/S-02/`. 라우드니스 차 0.0 LU, 클리핑 0, Chromium에서 MP3·Opus는 샘플 정확, OGG는 끝 4~15ms 패딩. 잠정 권고 MP3 256k (869→약 145MB). **청취 검수 미완료** — [S02 비교 문서](S02_BGM_COMPRESSION_20260930.md) §4 | 🟡 |
| S-03 | 낮음 | 레거시 `SFX_MAP`·`BGM_MAP`·`bgmPlay()` (DAY 10) — 호출처 0, 없는 파일 22개 참조 (`sfx/sk_*.mp3`, `bgm/h0~h6_*.mp3`, `bgm/title.mp3`, `sfx/boss_*.mp3`) | `game.html` 9774~9830, grep 호출 0 | 죽은 코드 삭제 (게임 동작 변화 없음). **2026-09-30 완료**: `SFX_MAP`·`_sfxFileCache`·`BGM_MAP`·`_bgmBufCache`·`_bgmGetCtx()`·`bgmPlay()` 68행 삭제. `setVol`/페이드가 null 체크로 참조하는 `let _bgmCtx,_bgmGainA…` 선언 1행은 유지. 검증: 인라인 스크립트 6개 `node --check` 통과, 헤드리스 Chromium 로드 pageerror 0·오디오 404 0·로비 BGM 재생·`BGM.setVol` 정상, `sound_audit.py` 누락 22→0. 마스터 바이블·AI 파이프라인 v3.1 문서에 삭제 기록 추가 | 🟢 |
| S-04 | 중간 | **펫 경고 보이스 10개 미연결** — 까마귀/고양이 × `warn_hp50·crisis_hp30·hp_critical·boss_aoe·boss_groggy`. 파일은 있으나 `_petSayUrgent`는 말풍선만 띄움 | `sfx/pet/`, `game.html` 8849·8932·8958 | `SFX`에 `pet_<who>_<id>` 등록 → `_petSayUrgent`에서 id 매칭 시 재생, VOICE 등급. **총괄 결정 필요**: 음성이 한국어뿐이다 — 영어 등 다른 로케일에서 (a) 한국어 음성 그대로 재생 (b) 무음·말풍선만 (c) 로케일별 음성 추가 제작 중 선택. 결정 전 코드 연결 보류 | 🟠 |
| S-05 | 낮음 | 구버전·후보 파일 잔존 — `sfx/death/` 루트 48개(ACE로 교체됨), `_english_backup/` 5, `drop/_cand_legend2`, `hit/impact_hitxxxxxxxx…`, `weapon/bow_hit1333…` 등 | `sound_audit.py --list` | `_archive`로 이동 또는 삭제. 청취 가치 있는 것만 남김 | ⚪ |
| S-06 | 중간 | 미연결이지만 쓸 만한 에셋 — `voice_wakeup_ko/en`, `silvertail_parry_fail1~4`, `spike_trap_deploy/hit`, `boss_grab/slash`, `repentance` | 같은 목록 | 각 트리거 존재 여부 확인 후 연결 or 폐기 결정 | 🔴 |
| S-07 | 낮음 | `sfx/SFX_README.md`가 실제 폴더와 불일치 (`chain/` 등 없는 폴더, `death/ACE`·`pet/`·`storm/` 누락) | README vs 폴더 | 이 문서 §3.1로 대체하고 README는 링크만 | 🔴 |
| S-08 | 낮음 | `6사운드디자인.md` "예정 항목"의 ElevenLabs 보이스 목록·포맷 규칙이 비어 있음 | 해당 문서 519행 | §6 규격을 옮기고, 보이스 ID 표 작성 | 🔴 |
| S-09 | 중간 | **공용 풀에 바이트 동일 파일 2쌍** — `흰눈의 맹세 (Remastered).wav` = `흰눈의 맹세2 (Remastered).wav`(66.7MB), `Coronam Ferro (Remastered).wav` = `Coronam Ferro2(Remastered).wav`(38.7MB). MD5 동일, Suno ID도 같음. 자동 재생에서 이 두 곡이 다른 곡보다 2배 자주 나오고, 드롭다운에 같은 곡이 두 번 보임 | `md5sum`, `survey_17wav.jsonl` | **총괄 결정 필요**: "2"가 원래 다른 테이크였다면 올바른 파일을 다시 내보내 교체, 아니면 "2" 항목을 풀·드롭다운·파일에서 제거(105.4MB 절감). S-02 변환 전에 정하면 변환 대상도 15곡으로 준다 | 🟠 |
| S-10 | 낮음 | **원본 WAV의 반복 이음새** — 드롭다운으로 한 곡 고정(`loop=true`) 시 끝→처음 전환 단차: `네메시아의 강림2` −12.9dBFS(들릴 수 있는 수준), `Neon Hellfire Protocol` 1·2 −31dBFS. 끝 무음이 긴 곡(`고개 하나만` 2.9초, `Wrath of the Golden Age` 2.1초, `Cathedral of Steel` 1.9초, `Just One More Hill` 1.6초)은 반복 때 그만큼 공백. 자동 모드(`onended`→다음 곡)에는 영향 없음 | `survey_17wav.jsonl` `seam_jump_dbfs`·`trail_silence_ms` | 청취로 실제 거슬리는지 확인 → 거슬리면 `BGM.playTrack`에 반복 경계 짧은 페이드 추가, 또는 변환 시 끝 무음 트림 | 🔴 |

## 5. 백로그 (우선순위 순)

| 순위 | 작업 | 연결 이슈 | 필요한 것 |
|---|---|---|---|
| ~~1~~ | ~~NFD 중복 BGM 제거~~ — 완료 2026-09-30 | S-01 | — |
| 2 | BGM WAV → 압축 포맷 변환 + 경로 교체 — **후보 준비됨** | S-02 | 대표 3곡 청취(A/B) → 포맷 채택. S-09 결정 선행 권장 |
| 3 | 펫 경고 보이스 연결 | S-04 | 🟠 총괄 결정: 비한국어 로케일 정책 |
| ~~4~~ | ~~레거시 SFX_MAP/BGM_MAP 제거~~ — 완료 2026-09-30 | S-03 | — |
| 5 | 미연결 에셋 연결/폐기 판정 | S-05, S-06 | 사용자 청취 |
| 6 | 보스 19종 사운드 프로필 커버리지 점검 (`_BOSS_SFX`) | — | 보스 바이블 대조 |
| 7 | 7장 BGM 곡 수 균형 (1장 25곡 vs 2·5·6장 각 2곡) | — | Suno 추가 생성 |
| 8 | 라우드니스 일괄 측정·정규화 — WAV 17곡 측정 완료(−16.3~−14.6 LUFS, TP −3.6~−2.4 dBTP), MP3 59곡 미측정 | §6 | `bgm_compress_eval.py` 확장 |
| 9 | 공용 풀 바이트 동일 2쌍 정리 | S-09 | 🟠 총괄 결정 |
| 10 | 반복 이음새·끝 무음 청취 확인 | S-10 | 청취 |

## 6. 에셋 규격

| 종류 | 포맷 | 라우드니스 목표 | 길이 | 이름 규칙 |
|---|---|---|---|---|
| BGM (게임 내) | OGG q6 또는 MP3 256k, 44.1kHz 스테레오 | −16 LUFS 통합, 피크 −1 dBTP | 루프 지점 명시 | `bgm/<N장_이름>/<곡명>.mp3` — 한글은 **NFC** |
| BGM 원본 | WAV 24bit | — | — | 저장소 밖 보관 |
| SFX | MP3 192k 또는 OGG, 모노 가능 | 피크 −1 dBTP, 종류 내 체감 음량 통일 | 타격·사망 ≤ 1.2초 (대량 동시 재생) | `sfx/<카테고리>/<이름><번호>.mp3` 소문자·언더스코어 |
| 보이스 | MP3 192k 모노 | −18 LUFS | 대사 + 앞뒤 무음 ≤ 80ms | `sfx/voice/<캐릭터>_<상황><번호>.mp3`, 로케일 `_ko/_en` |
| 후보 | 규격 동일 | — | — | `_cand_` 접두어 — 채택 후 반드시 정리 |

> 위 라우드니스 목표는 팀장 제안값이다. WAV 17곡은 측정했다(−16.3~−14.6 LUFS, 목표보다 약 1 LU 큼). MP3 59곡은 미측정 (백로그 8).

## 7. 관련 문서

| 문서 | 내용 |
|---|---|
| [6사운드디자인.md](./6사운드디자인.md) | 시스템 스펙 (사망음, 이동음, 보스 프로필, BGM 큐, 우선순위, 보이스) |
| [주제가_SUNO_프롬프트.md](./주제가_SUNO_프롬프트.md) | 주제가·BGM 생성 프롬프트 |
| [MAGIC_HIT_ELEVENLABS_20260910.md](./MAGIC_HIT_ELEVENLABS_20260910.md), [BISQO_MAGIC_HIT_20260910.md](./BISQO_MAGIC_HIT_20260910.md) | 마법 피격음 생성 기록 |
| [PROJECTILE_HIT_CANDIDATES_20260910.md](./PROJECTILE_HIT_CANDIDATES_20260910.md), [PROJECTILE_PLAYER_HIT_20260910.md](./PROJECTILE_PLAYER_HIT_20260910.md) | 투사체 피격음 후보·채택 |
| [TRAILER_CHARACTER_VOICE_FIX_20260909.md](./TRAILER_CHARACTER_VOICE_FIX_20260909.md) | 트레일러 보이스 교정 |
| [보석_장착음_20260927.md](./보석_장착음_20260927.md) | 보석 장착음 |
| `sfx/SFX_README.md` | 구 폴더 설명 (S-07: 불일치) |
| [S02_BGM_COMPRESSION_20260930.md](./S02_BGM_COMPRESSION_20260930.md) | S-02 WAV 압축 후보 비교 (용량·길이·루프·메타데이터·Chromium 실측) |

## 8. 인계 — 로컬 PC·통합 빌드팀

브랜치: `claude/admiring-albattani-dvaosd` (클라우드 세션 작업). **`main`에는 아직 병합되지 않았다.** `main`은 이 브랜치 분기 후 다른 팀 커밋이 쌓여 있으나(분기점 `577cf11`), 겹치는 파일 구간은 없다(`game.html` 변경 위치가 서로 다름, 마스터 바이블은 `main`이 첫 줄 부근만 수정).

### 9.1 커밋

| 커밋 (전체 SHA) | 내용 | 변경 파일 |
|---|---|---|
| `ff1577fcb98599fafa1b5b383bdaf2a24de14b31` | 사운드 팀장 문서·전수조사 도구 신설 | A `docs/6사운드디자인/SOUND_TEAM_LEAD.md`, A `tools/sound_audit.py`, M `docs/6사운드디자인/6사운드디자인.md` |
| `d9c3ae0193065eaf17c09732292cc983de528973` | **S-01** NFD 중복 BGM 71개 삭제 | D 71개 (아래 표), M `SOUND_TEAM_LEAD.md` |
| `cdde059b8771ab01758361086dab3b18faf0773d` | **S-03** 레거시 `SFX_MAP`·`BGM_MAP`·`bgmPlay` 삭제 | M `game.html` (−68/+1행), M 마스터 바이블·AI 파이프라인 v3.1 (삭제 기록 주석) |
| `1c2a4089c3276bd0705f5be5a4a041d0898191f8` | **S-02** 압축 후보·측정 도구 | A `audio_review/S-02/` (후보 9·측정 3·README), A `tools/bgm_compress_eval.py`, A `tools/bgm_browser_check.cjs`, A `S02_BGM_COMPRESSION_20260930.md`, M `6사운드디자인.md`, M `.vercelignore` (+`audio_review/`) |

S-01 삭제 파일 내역 (전부 자모 분리형 NFD 경로, 같은 이름의 NFC 경로 파일은 유지):

| 폴더 | 삭제 수 |
|---|---|
| `bgm/공통/` | 30 |
| `bgm/1장_썩은숲/` | 25 |
| `bgm/3장_얼음굴/` | 4 |
| `bgm/4장_화염지대/`, `bgm/7장_지옥성/` | 각 3 |
| `bgm/2장_벌레굴/`, `bgm/5장_지옥군단/`, `bgm/6장_사도마굴/` | 각 2 |
| **합계** | **71 (1.16 GB)** |

### 9.2 S-01 검증 결과 (이 브랜치 HEAD 기준, 클라우드에서 확인)

| 검증 | 결과 |
|---|---|
| 정상(NFC) BGM 보존 | 삭제한 71개 각각의 NFC 짝이 HEAD 트리에 존재하고 git blob 해시 동일 — **71/71** |
| HEAD의 `bgm/` 항목 | 81개, NFD 경로 0 |
| 코드의 NFD 경로 참조 | 0건 (`game.html`·`index.html`·`*.js`) |
| 코드가 참조하는 BGM 경로 | 76개 전부 HEAD 트리에 존재 (S-03 전에는 레거시 `BGM_MAP`의 15개 누락, 호출처 0이었음 → S-03에서 제거) |
| 빌드·배포 설정 | `build_itch.cjs`·`build-nwjs.mjs`는 `bgm/` 통째 복사 → NFD 폴더 제거로 패키지 중복도 사라짐. `.vercelignore`의 BGM 항목은 NFC 경로라 영향 없음 |
| 실행 확인 | 헤드리스 Chromium, `node server.cjs`로 `game.html` 로드: pageerror 0, 오디오 404 0, 로비 BGM 재생 (S-03 반영 상태에서 측정) |
| git 저장소 용량 | 두 벌이 같은 blob을 공유했으므로 **저장소 기록 용량은 거의 줄지 않음**. 줄어드는 곳은 체크아웃 작업 폴더와 빌드 산출물 |

### 9.3 미확인 — 로컬·패키지 반영

아래는 클라우드에서 확인할 수 없어 **미확인**이다. 확인한 사람이 날짜와 함께 이 표를 갱신한다.

| 항목 | 상태 | 확인 방법 |
|---|---|---|
| `main` 병합 | 미확인 (미병합) | 총괄 승인 후 PR/병합. 병합 전까지 `main`·Vercel에는 NFD 사본이 남아 있음 |
| `G:\exoduser` 로컬 반영 | 미확인 | pull 후 `bgm\` 안에 같은 이름처럼 보이는 폴더가 두 개면 NFD 쪽 삭제. `python tools/sound_audit.py` 실행 → `NFD duplicate files: 0`, `missing: 0` |
| `G:\exoduser-DEMO`, `G:\exoduser-ea` | 미확인 | 두 폴더의 `bgm\`에도 중복 폴더가 복사돼 있을 수 있음 → 같은 방법으로 정리. S-03은 `game.html` 변경이므로 CLAUDE.md DEMO/EA 동기화 절차 전체 실행 필요 |
| NW.js·itch·Steam 패키지 | 미확인 | 다음 빌드에서 `bgm/` 용량이 약 1.16 GB 줄었는지, 게임 내 BGM 재생 정상인지 |
| Vercel 웹 | 미확인 | 병합·배포 후 BGM 재생·404 확인 |
| macOS에서 커밋하는 PC | 미확인 | `git config core.precomposeunicode true` 설정 여부 |

## 9. 작업 로그

| 날짜 | 작업 | 결과 |
|---|---|---|
| 2026-09-30 | 사운드 팀장 문서 신설, 전수조사 도구 `tools/sound_audit.py` 추가, 첫 전수조사 | 이슈 S-01~S-08 등록. 게임 코드·에셋 변경 없음 |
| 2026-09-30 | S-01 NFD 중복 BGM 71개(1.16GB) git에서 제거 (사용자 승인) | 게임 참조 경로 변화 없음 (`sound_audit.py`: 누락 22 유지, NFD 중복 0) |
| 2026-09-30 | S-03 레거시 사운드 코드 삭제 (`cdde059`) | 누락 경로 22→0, 헤드리스 로드 pageerror 0 |
| 2026-09-30 | S-02 WAV 17곡 측정 + 대표 3곡 압축 후보 9개 (`1c2a408`) | 잠정 권고 MP3 256k, **청취 미검수**. 신규 이슈 S-09(바이트 동일 2쌍)·S-10(반복 이음새) 등록 |
| 2026-09-30 | 인계 섹션(§8) 작성, S-04를 총괄 결정 필요로 전환 | 로컬·패키지 반영은 미확인으로 구분 |
