# S-08 보유 보이스 목록 (2026-09-30)

> 관리: [SOUND_TEAM_LEAD.md](SOUND_TEAM_LEAD.md) S-08 · 범위: **보유 파일 조사까지** (신규 생성·연결 없음)
> 측정: ffmpeg 7.0.2로 길이·채널, `game.html` `_sampleFiles` 레지스트리로 게임 키, 코드 전체 문자열로 참조 여부. 대사 내용은 청취하지 않았다 — 대사는 문서에 적힌 것만 옮겼다.

## 1. 요약

| 그룹 | 파일 | 게임 키 등록 | 합계 길이 | 화자·언어 | 생성 기록 |
|---|---|---|---|---|---|
| 공용 전사 (`voice_*`, `male_grunt`) | 25 | 23 | 42.4초 | 남성, 대사 언어 **미기록** | **보이스 ID·대사 텍스트 미기록** |
| 실버테일 (`silvertail_*`) | 42 | 38 | 40.6초 | 여성, 영어 | ElevenLabs Sarah `EXAVITQu4vr4xnSDxMaL`, `eleven_multilingual_v2` / 말 없는 SFX는 `eleven_text_to_sound_v2` — [6사운드디자인.md 실버테일 절](6사운드디자인.md) |
| 펫 경고 (`sfx/pet/`) | 10 | 0 | 23.3초 | 까마귀·고양이, 한국어 | 미기록. S-04 (총괄 결정 대기) |
| 영어 백업 (`sfx/_english_backup/`) | 5 | 0 | 6.2초 | 남성, 영어 | 4개는 `sfx/voice/` 같은 이름 파일과 **바이트 동일**, `voice_flee_en.mp3`만 고유 |
| 인트로 내레이션 (`bgm/공통/intro_voice.mp3`) | 1 | BGM 경로로 참조 | 104.8초 | — | LAME 3.99.5 인코딩. 시네마틱 내레이터 ID `WS6naCm8T4gbyzsLnOjK`(docs/cinematic)와 같은 음성인지 **미확인** |
| **합계** | **83** | 61 | 217.3초 | | |

- 파일 메타데이터에는 생성 서비스 정보가 없다(전부 ffmpeg/LAME 재인코딩 태그). 보이스 출처는 문서 기록에만 의존한다.
- 문서에 기록된 ElevenLabs 보이스 ID는 2개뿐이다: 실버테일 Sarah `EXAVITQu4vr4xnSDxMaL`, 시네마틱 내레이터 `WS6naCm8T4gbyzsLnOjK`.
- 공용 전사 음성은 문서에 대사·보이스 ID가 없다. 재생성·추가 제작 때 같은 목소리를 맞출 근거가 없다는 뜻이다.

## 2. 미연결 보이스 (파일은 있으나 게임이 쓰지 않음)

| 파일 | 내용 (문서 기준) | 판단 |
|---|---|---|
| `voice/voice_wakeup_ko.mp3`, `voice/voice_wakeup_en.mp3` | 기상 대사 한/영 (현재 게임은 `voice_wakeup.mp3` 8.44초 사용) | S-06 — 로케일별 인트로 음성으로 쓸지 결정 필요. S-04 언어 정책과 같은 결정 |
| `voice/silvertail_parry_fail1~4.mp3` | 이전 영어 사망 대사, 패링 실패용 후보로 보존 (6사운드디자인.md) | S-06 — 패링 실패 이벤트 연결 여부 |
| `pet/*` 10개 | 펫 생존 경고 | S-04 🟠 |
| `_english_backup/*` 5개 | 공용 전사 영어판 백업 | S-05 — 4개는 현재 파일과 동일 사본 |
| `voice/silvertail_wakeup.mp3` | "Where... am I?" — 등록됐으나 재생 호출 없음 (문서: 미사용 보류) | S-12 |

## 3. 전체 목록

### 3.1 공용 전사
| 파일 | 길이(초) | 채널 | 게임 키 | 상태 | 코드 주석 |
|---|---|---|---|---|---|
| `voice/male_grunt.mp3` | 1.04 | stereo | `male_grunt` | 게임 사용 |  |
| `voice/voice_attack.mp3` | 1.72 | mono | `voice_attack`, `voice_execution` | 게임 사용 |  |
| `voice/voice_beam.mp3` | 1.41 | mono | `voice_beam` | 게임 사용 |  |
| `voice/voice_bladefuse.mp3` | 1.96 | mono | `voice_bladefuse` | 게임 사용 |  |
| `voice/voice_dark_skill.mp3` | 1.31 | mono | `voice_plague`, `voice_dark_skill` | 게임 사용 |  |
| `voice/voice_en1.mp3` | 1.57 | mono | `voice_en1` | 게임 사용 |  |
| `voice/voice_en2.mp3` | 1.31 | mono | `voice_en2` | 게임 사용 |  |
| `voice/voice_en3.mp3` | 1.31 | mono | `voice_en3` | 게임 사용 |  |
| `voice/voice_explode.mp3` | 0.76 | mono | `voice_explode`, `voice_lavaSummon` | 게임 사용 |  |
| `voice/voice_flee.mp3` | 1.96 | mono | `voice_flee` | 게임 사용 |  |
| `voice/voice_grunt.mp3` | 0.84 | mono | `voice_grunt` | 게임 사용 |  |
| `voice/voice_holyDome.mp3` | 0.76 | mono | `voice_holyDome` | 게임 사용 |  |
| `voice/voice_holyDome2.mp3` | 1.07 | mono | `voice_holyDome2` | 게임 사용 |  |
| `voice/voice_holyPrison.mp3` | 1.15 | mono | `voice_holyPrison` | 게임 사용 |  |
| `voice/voice_magic.mp3` | 0.76 | mono | `voice_magic`, `voice_demon_revive`, `voice_second_wind`, `voice_clear`, `voice_fuse` | 게임 사용 | equipment/ — 장비 장착 전용 (기본음 + 무기타입별 전용 + 희귀 룬 레이어) |
| `voice/voice_move.mp3` | 1.80 | mono | `voice_move` | 게임 사용 |  |
| `voice/voice_move2.mp3` | 1.96 | mono | `voice_move2` | 게임 사용 |  |
| `voice/voice_move3.mp3` | 1.49 | mono | `voice_move3` | 게임 사용 |  |
| `voice/voice_parry1.mp3` | 1.65 | mono | `voice_parry1` | 게임 사용 |  |
| `voice/voice_parry2.mp3` | 1.07 | mono | `voice_parry2` | 게임 사용 |  |
| `voice/voice_parry3.mp3` | 1.49 | mono | `voice_parry3`, `voice_parry4` | 게임 사용 |  |
| `voice/voice_ult.mp3` | 2.51 | mono | `voice_ult` | 게임 사용 |  |
| `voice/voice_wakeup.mp3` | 8.44 | mono | `voice_wakeup` | 게임 사용 |  |
| `voice/voice_wakeup_en.mp3` | 1.57 | mono | — | **미연결** |  |
| `voice/voice_wakeup_ko.mp3` | 1.49 | mono | — | **미연결** |  |

### 3.2 실버테일
| 파일 | 길이(초) | 채널 | 게임 키 | 상태 | 코드 주석 |
|---|---|---|---|---|---|
| `voice/silvertail_attack.mp3` | 0.84 | stereo | `silvertail_attack` | 게임 사용 |  |
| `voice/silvertail_beam.mp3` | 1.28 | mono | `silvertail_beam` | 게임 사용 |  |
| `voice/silvertail_clear1.mp3` | 0.97 | mono | `silvertail_clear1` | 게임 사용 |  |
| `voice/silvertail_clear2.mp3` | 1.33 | mono | `silvertail_clear2` | 게임 사용 |  |
| `voice/silvertail_cooldown.mp3` | 0.91 | mono | `silvertail_cooldown` | 게임 사용 |  |
| `voice/silvertail_dark.mp3` | 0.91 | mono | `silvertail_dark` | 게임 사용 |  |
| `voice/silvertail_dead1.mp3` | 0.84 | stereo | `silvertail_dead1` | 게임 사용 |  |
| `voice/silvertail_dead2.mp3` | 0.84 | stereo | `silvertail_dead2` | 게임 사용 |  |
| `voice/silvertail_dead3.mp3` | 0.84 | stereo | `silvertail_dead3` | 게임 사용 |  |
| `voice/silvertail_dead4.mp3` | 0.84 | stereo | `silvertail_dead4` | 게임 사용 | ACE 업그레이드 버전 사용 (2026-04-16) — sfx/death/ACE/ 폴더 |
| `voice/silvertail_demon_revive1.mp3` | 1.25 | mono | `silvertail_demon_revive1` | 게임 사용 |  |
| `voice/silvertail_demon_revive2.mp3` | 0.97 | mono | `silvertail_demon_revive2` | 게임 사용 |  |
| `voice/silvertail_execution1.mp3` | 1.02 | mono | `silvertail_execution1` | 게임 사용 |  |
| `voice/silvertail_execution2.mp3` | 1.25 | mono | `silvertail_execution2` | 게임 사용 |  |
| `voice/silvertail_explode.mp3` | 0.65 | mono | `silvertail_explode` | 게임 사용 |  |
| `voice/silvertail_fuse1.mp3` | 1.33 | mono | `silvertail_fuse1` | 게임 사용 |  |
| `voice/silvertail_fuse2.mp3` | 1.44 | mono | `silvertail_fuse2` | 게임 사용 |  |
| `voice/silvertail_grunt.mp3` | 0.84 | stereo | `silvertail_grunt` | 게임 사용 |  |
| `voice/silvertail_grunt1.mp3` | 0.73 | mono | `silvertail_grunt1` | 게임 사용 |  |
| `voice/silvertail_grunt2.mp3` | 0.84 | mono | `silvertail_grunt2` | 게임 사용 |  |
| `voice/silvertail_grunt3.mp3` | 0.65 | mono | `silvertail_grunt3` | 게임 사용 |  |
| `voice/silvertail_hit1.mp3` | 0.52 | stereo | `silvertail_hit1` | 게임 사용 |  |
| `voice/silvertail_hit2.mp3` | 0.52 | stereo | `silvertail_hit2` | 게임 사용 |  |
| `voice/silvertail_hit3.mp3` | 0.52 | stereo | `silvertail_hit3` | 게임 사용 |  |
| `voice/silvertail_hit4.mp3` | 0.52 | stereo | `silvertail_hit4` | 게임 사용 |  |
| `voice/silvertail_holy.mp3` | 0.97 | mono | `silvertail_holy` | 게임 사용 |  |
| `voice/silvertail_magic.mp3` | 1.44 | mono | `silvertail_magic` | 게임 사용 |  |
| `voice/silvertail_move.mp3` | 0.97 | mono | `silvertail_move` | 게임 사용 |  |
| `voice/silvertail_parry.mp3` | 0.91 | mono | `silvertail_parry` | 게임 사용 |  |
| `voice/silvertail_parry1.mp3` | 0.86 | mono | `silvertail_parry1` | 게임 사용 |  |
| `voice/silvertail_parry2.mp3` | 1.10 | mono | `silvertail_parry2` | 게임 사용 |  |
| `voice/silvertail_parry3.mp3` | 1.38 | mono | `silvertail_parry3` | 게임 사용 |  |
| `voice/silvertail_parry_fail1.mp3` | 0.65 | mono | — | **미연결** |  |
| `voice/silvertail_parry_fail2.mp3` | 0.86 | mono | — | **미연결** |  |
| `voice/silvertail_parry_fail3.mp3` | 0.78 | mono | — | **미연결** |  |
| `voice/silvertail_parry_fail4.mp3` | 0.84 | mono | — | **미연결** |  |
| `voice/silvertail_repentance.mp3` | 1.07 | mono | `silvertail_repentance` | 게임 사용 |  |
| `voice/silvertail_resource_fail.mp3` | 1.02 | mono | `silvertail_resource_fail` | 게임 사용 |  |
| `voice/silvertail_second_wind1.mp3` | 0.73 | mono | `silvertail_second_wind1` | 게임 사용 |  |
| `voice/silvertail_second_wind2.mp3` | 1.44 | mono | `silvertail_second_wind2` | 게임 사용 |  |
| `voice/silvertail_ult.mp3` | 1.75 | mono | `silvertail_ult` | 게임 사용 |  |
| `voice/silvertail_wakeup.mp3` | 1.20 | mono | `silvertail_wakeup` | 게임 사용 |  |

### 3.3 펫
| 파일 | 길이(초) | 채널 | 게임 키 | 상태 | 코드 주석 |
|---|---|---|---|---|---|
| `pet/cat_boss_aoe.mp3` | 2.04 | mono | — | **미연결** |  |
| `pet/cat_boss_groggy.mp3` | 1.70 | mono | — | **미연결** |  |
| `pet/cat_crisis_hp30.mp3` | 3.06 | mono | — | **미연결** |  |
| `pet/cat_hp_critical.mp3` | 3.60 | mono | — | **미연결** |  |
| `pet/cat_warn_hp50.mp3` | 3.16 | mono | — | **미연결** |  |
| `pet/crow_boss_aoe.mp3` | 1.57 | mono | — | **미연결** |  |
| `pet/crow_boss_groggy.mp3` | 1.25 | mono | — | **미연결** |  |
| `pet/crow_crisis_hp30.mp3` | 2.59 | mono | — | **미연결** |  |
| `pet/crow_hp_critical.mp3` | 2.74 | mono | — | **미연결** |  |
| `pet/crow_warn_hp50.mp3` | 1.62 | mono | — | **미연결** |  |

### 3.4 영어 백업
| 파일 | 길이(초) | 채널 | 게임 키 | 상태 | 코드 주석 |
|---|---|---|---|---|---|
| `_english_backup/voice_en1.mp3` | 1.57 | mono | — | **미연결** |  |
| `_english_backup/voice_en2.mp3` | 1.31 | mono | — | **미연결** |  |
| `_english_backup/voice_en3.mp3` | 1.31 | mono | — | **미연결** |  |
| `_english_backup/voice_flee_en.mp3` | 1.20 | mono | — | **미연결** |  |
| `_english_backup/voice_grunt.mp3` | 0.84 | mono | — | **미연결** |  |

### 3.5 인트로 내레이션
| 파일 | 길이(초) | 채널 | 게임 키 | 상태 | 코드 주석 |
|---|---|---|---|---|---|
| `bgm/공통/intro_voice.mp3` | 104.80 | stereo | — | 게임 사용 |  |

## 4. 다음 단계 (S-08 남은 일)

1. 공용 전사 음성의 대사 텍스트·보이스 ID 확보 — 원본 생성 기록(로컬 PC ElevenLabs 히스토리) 확인 또는 청취 받아쓰기. 클라우드에서는 불가.
2. 확보되면 `6사운드디자인.md` "예정 항목"의 보이스 목록을 이 문서로 대체.
3. 인트로 내레이션 화자 확인 (청취).
