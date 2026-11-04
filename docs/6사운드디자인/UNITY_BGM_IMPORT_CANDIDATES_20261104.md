# Unity BGM 반입 후보 — 웹 79파일 (사운드 총괄, 2026-11-04)

- 배정: CTO 11-04. 유니티 총괄의 설정 1차(`edee9204a`)에서 BGM 선택이 실제 음악에 연결됐다. 당시 목록은 6값이었다. 현재 이 작업 브랜치는 P0·P1을 합쳐 18값(`auto`, 기존 5곡 키, 필드 Remastered 6곡, `forge` 셔플, P1 개별 8곡 중 필드 3곡을 제외한 5곡)을 지원한다. Core의 `NativeBgmSelection`을 유지하고 표현 계층 `NativeBgmCatalog`로 확장했다.
- 기준: 웹 정본 `G:/exoduser-wt/latest-web`(origin/main `06ac6882b`)의 `bgm/` 폴더 79파일이다(설정 목록 57곡 + 큐에만 있는 22파일). 곡 묶음은 game.html `BGM.tracks`(4113~4170행)다.
  - Unity 쪽 대조는 바이트(md5)로 했다.
  - 출처는 파일 메타데이터 태그다.
  - 길이·용량은 ffprobe로 쟀다.
  - 반입 추정 용량은 Unity Vorbis 약 128kbps로 가정했다.
- 스크립트·원자료: `I:/EXODUSER-Storage/bgm-import-20261104/`(`scan_bgm.cjs`, `tags.cjs`, `make_table.cjs`, `table.json`), 저장소 밖.

## 1. 요약

| 구분 | 파일 수 | 반입 추정 | 내용 |
|---|---:|---:|---|
| 이미 있음 | 10 | — | 같은 바이트가 Unity에 있음: 로비(Abyss Below), 1-1(Ashes of the Fallen Gate, `hell1`·`Startup/stage_first`), 보스(Crown of Ash and Iron), 사망·승리, 네메시아 인트로(네메시아의 강림 V3), 프롤로그 테마 4곡. 드루이드 BGM(`bgm_druid_boss`)은 ElevenLabs Music으로 만들었고 웹에는 없음 |
| **P0 반입 권장** | **3** | **15.0MB** | 1-1 필드 회전곡. 사용자가 06-02에 Remastered로 다시 뽑은 1장 곡 중 3곡 |
| P1 반입 가능 | 52 | 201.2MB | 1장 나머지, 2~7장, 공통 회전곡, 대장간 3곡, 사망·승리 두 번째 곡, 최종 보스, 나머지 Remastered |
| P2 보류 | 8 | — | 1-1 데모에 쓰이지 않는 컷신·인트로 곡, 출처 태그가 없는 파일 |
| 제외 | 6 | — | 같은 바이트 사본·`(1)` 사본 |

### 1.1 P0 판단 — 1-1 데모 한 판(10~15분)

- **반입 상태(11-04 유니티 총괄, `claude/unity-pc-options-wave1-20261104` `05231e112`, unity/main 미병합):** P0 3곡을 `Resources/Audio/Bgm/`에 mp3 192k로 반입했다 — `hell1_rot_ashes_banner.mp3`(420.00초·10.08MB), `hell1_rot_cathedral_steel.mp3`(288.88초·6.93MB), `hell1_rot_iron_oath.mp3`(247.24초·5.94MB), 세 곡 -16.24 LUFS(hell1 -15.98, 클리핑 없음). P0 당시 재생: 필드 진입 hell1 1회 → 3곡 셔플 순환(직전 곡 반복 없음), 설정 BGM auto일 때만, 특정 곡 선택 시 그 곡 반복(웹 playTrack loop). 설정 목록 6→9값. 청음 판정(사용자 귀) 전이며, 라이선스 확인은 §1.2에서 닫혔고 공개·업로드 없음.

- 웹은 장 BGM 1곡(1장 = Ashes of the Fallen Gate, 4:22)을 한 번 튼 뒤 `gameplay` 큐(40곡 이상)를 무작위로 섞는다. 반입 전 Unity는 `hell1` 한 곡을 반복했다. P0는 3곡 회전, 이 P1 브랜치는 6곡 회전이다. 데모 한 판이 10~15분이므로 같은 곡이 2~3번 반복된다.
- 회전곡은 3곡(15.9분, Vorbis 약 15MB)이면 한 판 동안 반복이 없다. 1장 회전 후보 15곡 중, 사용자가 06-02에 Remastered로 다시 뽑은 1장 곡(Ashes Under the Banner·Cathedral of Steel·Iron Oath Under Ash·Neon Hellfire Protocol·Wrath of the Golden Age)을 선호 신호로 보고 그중 길이가 긴 3곡을 골랐다. 3곡 모두 WAV 원본이라 반입 때 Vorbis로 변환한다.
- 곡 자체가 맞는지는 귀로 판정해야 한다. 원하면 R11 청음판(필드 플레이 영상 + 곡 후보)으로 사용자가 고를 수 있다.
- P0와 P1은 `Resources/Audio/Bgm/`에 mp3 192k로 반입했다. Core 지원 값은 그대로 두고 `NativeBgmCatalog`·`NativeFieldBgmRotation`이 표현 계층에서 목록/회전을 확장한다. unity/main 병합·Unity 컴파일·청음은 별도 관문이다.

### 1.2 라이선스·출처

- 79파일 중 76파일에 `made with suno` 태그가 있다. 대부분 아티스트는 `beearthone`(사용자 Suno 계정)이고, 생성일(2026-02-25 ~ 07-27)과 Suno 곡 id가 남아 있다. 기획서 v2.0의 AI 도구 목록에도 "Suno (BGM)"이 적혀 있다.
- **상업 이용: 유료 플랜 확인(사용자, 11-04).** Suno 곡의 상업 이용 권리는 생성 당시 유료 플랜(Pro·Premier) 구독 여부에 달려 있다. 사용자가 곡을 만들 당시 유료 플랜이었다고 확인했다(CTO 경유, 2026-11-04). 그래서 Suno 76곡은 상업 배포 조건을 충족한다. 13출시·마케팅의 "로컬 BGM 상업 배포 권리 별도 확인" 항목도 Suno 곡은 이것으로 닫힌다.
- 출처 확인이 필요한 3파일은 P2로 두었다. `공통/exoduser.mp3`(8초)·`공통/intro_voice.mp3`는 태그가 없다. `1장_썩은숲/h0_explore.mp3`는 다른 AI 음성 표시(AIGC `HUABAB…`)가 있고, 컷신 나레이션용이다.

### 1.3 P1 반입 순서 (데모 용량 기준, 사운드 총괄 결정 11-04)

데모 한 판에서 들리는 곡부터, 작은 묶음부터 넣는다. 누적 용량은 P0 15.0MB에 더한 값이다.

| 단계 | 묶음 | 곡 수 | 반입 추정 | 누적 | 이유 |
|---:|---|---:|---:|---:|---|
| 1 | 사망·승리 두 번째 곡(지옥 추락 사망 징글·탈출 성공 다른 take) | 2 | 4.8MB | 19.8MB | 데모에서 죽고 다시 할 때 같은 곡이 반복되는 것을 줄인다 |
| 2 | 대장간 3곡(복수의 대장간 2 take·Anvil Ashes) | 3 | 14.8MB | 34.6MB | 데모에서 대장간을 열면 지금은 필드곡이 그대로 흐른다 |
| 3 | 1장 Remastered 나머지(Neon Hellfire Protocol 2 take·Wrath of the Golden Age) | 3 | 10.4MB | 45.0MB | 1-1 필드 회전을 6곡으로 늘린다 |
| 4 | 1장 mp3 나머지 | 15 | 64.2MB | 109.2MB | 데모 밖. 본편 1장 회전용, 같은 곡 Remastered가 있으면 그쪽을 쓴다 |
| 5 | 공통 회전(네메시아·Coronam Ferro·고개 하나만 등) | 12 | 46.7MB | 155.9MB | 데모 밖, 본편 |
| 6 | 2~7장 | 16 | 56.7MB | 212.6MB | 데모 밖, 각 장 이식 때 |
| 7 | 최종 보스(Ignis et Sanguis) | 1 | 3.6MB | 216.2MB | 데모 밖 |

- 데모 패키지 권장 범위는 P0 + 1~3단계(11곡, 약 45MB)다.
- 출처 태그가 없는 3파일(P2)은 계속 보류한다.

### 1.4 P1 ①~③ 반입 상태 — 11-04 Codex

- 브랜치: `codex/unity-bgm-import-p1-20261104`, 기준 `d7aac2ea7`(options-wave1). unity/main 미병합.
- 사망·승리: 각각 기존 take → 두 번째 take로 이벤트 진입마다 교대. 일시정지 복귀는 새 이벤트로 세지 않는다. 대장간: 3곡 셔플, 한 바퀴 안의 중복 및 경계 연속 반복 없음. 필드: hell1 1회 → P0+P1 Remastered 6곡 셔플. 특정 파일 선택은 반복 재생, 사망·승리는 원래 이벤트 우선 정책 유지. 대장간을 닫으면 P0와 같은 필드 재진입 규칙으로 hell1부터 시작한다.
- `NativeBgmSelection`·`NativeBgmRotation`을 포함한 Core 파일 변경 0. 새 `NativeBgmCatalog`가 기존 정책을 호출하고 새 선택값만 추가하며, 호스트와 설정 목록이 같은 카탈로그를 사용한다.
- 기존 `a15_options_web.json`의 29언어 `bgm.values`/`bgm.labels` 재사용. 새 표시 문구·번호 0, 4600~4646 미사용.
- P1 실제 MP3 46.491MB, P0 포함 11곡 69.443MB. §1.3의 약 45MB는 Vorbis 128k 추정치다. 실제 192k 소스 용량 및 Unity 최종 패키지 용량과 구분한다. 최종 패키지 용량 미측정.
- 음량: 최종 MP3 -16.58~-16.26 LUFS, 전곡 -16±1 충족. P0와 같은 importer 설정. 2-pass 입력/출력·최종 재디코딩·ffprobe: [측정 원자료](UNITY_BGM_IMPORT_P1_LOUDNORM_20261104.json). 원본 변경 없음, 임시 원본은 변환 뒤 제거.
- 검사: BGM 실제 호스트 무음 계약 1,523·options-wave1 4,779(+배선31)·sound-wire43·pause-navigation52·startup-locale30 통과. 실제 Unity 컴파일은 공용 실행기의 HALT(재부팅 필요, 종료 불가 Player 기록)로 시작 거부. 에디터 오류 0 판정·실제 청음·사용자 실행본 갱신은 미확인.

| Unity Bgm 파일 | 웹 원본(bgm/ 아래) | 문맥 | 최종 LUFS | true peak dBTP | MP3 MB | 반입 상태 |
|---|---|---|---:|---:|---:|---|
| `death_alt.mp3` | `공통/지옥 추락 사망 징글.mp3` | death | -16.27 | -1.74 | 2.535 | 반입·정적 계약 통과 / Unity 미검증 |
| `victory_alt.mp3` | `공통/탈출 성공.mp3` | victory | -16.58 | -2.32 | 5.005 | 반입·정적 계약 통과 / Unity 미검증 |
| `forge_vengeance.mp3` | `공통/복수의 대장간.mp3` | forge | -16.26 | -2.80 | 7.126 | 반입·정적 계약 통과 / Unity 미검증 |
| `forge_vengeance_alt.mp3` | `공통/forge.mp3` | forge | -16.26 | -6.57 | 7.139 | 반입·정적 계약 통과 / Unity 미검증 |
| `forge_anvil_ashes.mp3` | `공통/Anvil Ashes.mp3` | forge | -16.26 | -2.27 | 8.672 | 반입·정적 계약 통과 / Unity 미검증 |
| `hell1_rot_neon_hellfire.mp3` | `1장_썩은숲/Neon Hellfire Protocol (Remastered).wav` | hell1 | -16.26 | -3.44 | 5.626 | 반입·정적 계약 통과 / Unity 미검증 |
| `hell1_rot_neon_hellfire_2.mp3` | `1장_썩은숲/Neon Hellfire Protocol2(Remastered).wav` | hell1 | -16.26 | -3.29 | 5.606 | 반입·정적 계약 통과 / Unity 미검증 |
| `hell1_rot_wrath_golden_age.mp3` | `1장_썩은숲/Wrath of the Golden Age (Remastered).wav` | hell1 | -16.26 | -2.90 | 4.782 | 반입·정적 계약 통과 / Unity 미검증 |

## 2. 전체 표

우선 = P0(반입 권장) / P1(반입 가능) / P2(보류) / 이미 있음 / 제외. "같은 Suno 곡 id"는 바이트는 다르지만 같은 생성곡(재인코딩·다른 버전)이라는 뜻이다.

| 우선 | 곡(Suno 제목) | 웹 경로(`bgm/` 아래) | 길이 | 원본 용량·형식 | 반입 추정(Vorbis 128k) | 웹 쓰임(BGM.tracks) | 출처 | 비고 |
|---|---|---|---:|---|---:|---|---|---|
| P0 | Ashes Under the Banner (Remastered) | `1장_썩은숲/Ashes Under the Banner (Remastered).wav` | 7:00 | 76.9MB wav 1536k | 6.6MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id b1d20cc2 | 반입 권장: 1-1 필드 회전곡. 사용자가 06-02 Remastered로 다시 뽑은 1장 곡(선호 신호), WAV → Vorbis 변환 / **반입:** options-wave1 P0, 본 브랜치에 포함 |
| P0 | Cathedral of Steel (Remastered) | `1장_썩은숲/Cathedral of Steel (Remastered).wav` | 4:49 | 52.9MB wav 1536k | 4.5MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id 2b9f8be7 | 반입 권장: 1-1 필드 회전곡. 사용자가 06-02 Remastered로 다시 뽑은 1장 곡(선호 신호), WAV → Vorbis 변환 / **반입:** options-wave1 P0, 본 브랜치에 포함 |
| P0 | Iron Oath Under Ash (Remastered) | `1장_썩은숲/Iron Oath Under Ash (Remastered).wav` | 4:07 | 45.3MB wav 1536k | 3.9MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id 765ec33c | 반입 권장: 1-1 필드 회전곡. 사용자가 06-02 Remastered로 다시 뽑은 1장 곡(선호 신호), WAV → Vorbis 변환 / **반입:** options-wave1 P0, 본 브랜치에 포함 |
| P1 | Ashes Under the Banner | `1장_썩은숲/Ashes Under the Banner.mp3` | 7:00 | 9.9MB mp3 199k | 6.6MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id e02bb38a | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Blade Choir of the Black Citadel | `1장_썩은숲/Blade Choir of the Black Citadel.mp3` | 4:07 | 5.6MB mp3 191k | 3.9MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 3858e95f | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Blood Moon Siege | `1장_썩은숲/Blood Moon Siege.mp3` | 4:13 | 6MB mp3 200k | 4MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id b32c89f9 | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Blood Moon Siege | `1장_썩은숲/Blood Moon Siege2.mp3` | 4:38 | 6.5MB mp3 195k | 4.3MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 5ee136f2 | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Bloodsteel Ascension | `1장_썩은숲/Bloodsteel Ascension 2.mp3` | 3:18 | 4.6MB mp3 195k | 3.1MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 0cf20f6d | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Bloodsteel Ascension | `1장_썩은숲/Bloodsteel Ascension.mp3` | 3:54 | 5.4MB mp3 192k | 3.6MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 6cbc735c | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Cathedral of Steel | `1장_썩은숲/Cathedral of Steel.mp3` | 3:31 | 4.8MB mp3 190k | 3.3MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 54f98fc1 | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Exoduser | `1장_썩은숲/Exoduser.mp3` | 5:11 | 7MB mp3 188k | 4.9MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id e48f0366 | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Exoduser2 | `1장_썩은숲/Exoduser2.1.mp3` | 5:09 | 6.8MB mp3 185k | 4.8MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id d6426f0f | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Exoduser | `1장_썩은숲/Exoduser2.mp3` | 5:27 | 7.3MB mp3 187k | 5.1MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 5b862da3 | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Exoduser3 | `1장_썩은숲/Exoduser3.mp3` | 5:06 | 6.9MB mp3 188k | 4.8MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 6f207911 | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Ashes of the Fallen Gate | `1장_썩은숲/hell1_ice.mp3` | 5:24 | 6.6MB mp3 171k | 5.1MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id 227a3c0a | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Iron Oath Under Ash | `1장_썩은숲/Iron Oath Under Ash.mp3` | 4:07 | 5.4MB mp3 185k | 3.9MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 2e40bf5b | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Neon Hellfire Protocol (Remastered) | `1장_썩은숲/Neon Hellfire Protocol (Remastered).wav` | 3:54 | 42.9MB wav 1536k | 3.7MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id 652eefe9 | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 / **반입:** `Bgm/hell1_rot_neon_hellfire.mp3`(정적 계약 통과, Unity·청음 미확인) |
| P1 | Neon Hellfire Protocol | `1장_썩은숲/Neon Hellfire Protocol.mp3` | 3:54 | 5.5MB mp3 199k | 3.7MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 66548815 | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Neon Hellfire Protocol2(Remastered) | `1장_썩은숲/Neon Hellfire Protocol2(Remastered).wav` | 3:54 | 42.8MB wav 1536k | 3.6MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id b83e05ce | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 / **반입:** `Bgm/hell1_rot_neon_hellfire_2.mp3`(정적 계약 통과, Unity·청음 미확인) |
| P1 | Wrath of the Golden Age (Remastered) | `1장_썩은숲/Wrath of the Golden Age (Remastered).wav` | 3:19 | 36.5MB wav 1536k | 3.1MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id a5661ec0 | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 / **반입:** `Bgm/hell1_rot_wrath_golden_age.mp3`(정적 계약 통과, Unity·청음 미확인) |
| P1 | Wrath of the Golden Age | `1장_썩은숲/Wrath of the Golden Age.mp3` | 3:19 | 4.7MB mp3 197k | 3.1MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 09c835b8 | 1-1 필드 장 BGM(4.4분) 뒤 회전 재생 후보(웹 gameplay 큐, 1장 폴더) |
| P1 | Carapace Cathedral | `2장_벌레굴/Carapace Cathedral.mp3` | 4:33 | 6MB mp3 183k | 4.3MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id e9ca5d27 | gameplay — 2~7장 또는 공통 회전 |
| P1 | Carapace Cathedral | `2장_벌레굴/hell2_insect.mp3` | 3:50 | 4.9MB mp3 180k | 3.6MB | hell2 | Suno  · 유료 플랜 확인(사용자, 11-04) · id 932cc4a1 | hell2 — 2~7장 또는 공통 회전 |
| P1 | 흰눈의 맹세 (Remastered) | `3장_얼음굴/흰눈의 맹세 (Remastered).wav` | 5:48 | 63.6MB wav 1536k | 5.4MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id c1fdaf20 | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 / 같은 바이트: 3장_얼음굴/흰눈의 맹세2 (Remastered).wav |
| P1 | Abyssal Drift | `3장_얼음굴/Abyssal Drift.mp3` | 2:47 | 3.6MB mp3 181k | 2.6MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id fee6c065 | gameplay — 2~7장 또는 공통 회전 |
| P1 | Inferno Liturgia | `3장_얼음굴/hell3_fire.mp3` | 4:50 | 6.3MB mp3 181k | 4.5MB | hell3 | Suno  · 유료 플랜 확인(사용자, 11-04) · id 672c6979 | hell3 — 2~7장 또는 공통 회전 |
| P1 | Abyssal Drift | `4장_화염지대/hell4_abyss.mp3` | 4:09 | 5.5MB mp3 187k | 3.9MB | hell4 | Suno  · 유료 플랜 확인(사용자, 11-04) · id 148df694 | hell4 — 2~7장 또는 공통 회전 |
| P1 | Ignis et Sanguis | `4장_화염지대/Ignis et Sanguis.mp3` | 3:47 | 5MB mp3 183k | 3.6MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id c44dda17 | gameplay — 2~7장 또는 공통 회전 / 같은 Suno 곡 id: 공통/finalboss.mp3 |
| P1 | Inferno Liturgia | `4장_화염지대/Inferno Liturgia.mp3` | 4:23 | 5.3MB mp3 168k | 4.1MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 360a0d8d | gameplay — 2~7장 또는 공통 회전 |
| P1 | Abyss Below | `5장_지옥군단/Abyss Below.mp3` | 4:25 | 5.6MB mp3 177k | 4.1MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 6a153a33 | gameplay — 2~7장 또는 공통 회전 |
| P1 | Teeth in the Choir | `5장_지옥군단/hell5_thunder.mp3` | 3:03 | 3.9MB mp3 179k | 2.9MB | hell5 | Suno  · 유료 플랜 확인(사용자, 11-04) · id 6785394d | hell5 — 2~7장 또는 공통 회전 |
| P1 | Midnight Cathedral of Ash | `6장_사도마굴/hell6_bone.mp3` | 2:53 | 4.1MB mp3 198k | 2.7MB | hell6 | Suno  · 유료 플랜 확인(사용자, 11-04) · id 096ab8b1 | hell6 — 2~7장 또는 공통 회전 / 같은 Suno 곡 id: 7장_지옥성/Midnight Cathedral of Ash.mp3 |
| P1 | Kiln of Broken Crowns | `6장_사도마굴/Kiln of Broken Crowns.mp3` | 3:36 | 4.9MB mp3 191k | 3.4MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id b4ec1ff0 | gameplay — 2~7장 또는 공통 회전 / 같은 Suno 곡 id: 7장_지옥성/hell7_chaos.mp3 |
| P1 | Kiln of Broken Crowns | `7장_지옥성/hell7_chaos.mp3` | 3:36 | 4.9MB mp3 191k | 3.4MB | hell7 | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id b4ec1ff0 | hell7 — 2~7장 또는 공통 회전 / 같은 Suno 곡 id: 6장_사도마굴/Kiln of Broken Crowns.mp3 |
| P1 | Midnight Cathedral of Ash | `7장_지옥성/Midnight Cathedral of Ash.mp3` | 2:53 | 4.1MB mp3 198k | 2.7MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 096ab8b1 | gameplay — 2~7장 또는 공통 회전 / 같은 Suno 곡 id: 6장_사도마굴/hell6_bone.mp3 |
| P1 | Teeth in the Choir | `7장_지옥성/Teeth in the Choir.mp3` | 2:33 | 3.5MB mp3 192k | 2.4MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 6035dfae | gameplay — 2~7장 또는 공통 회전 |
| P1 | 고개 하나만 (Remastered) 2 | `공통/고개 하나만 (Remastered) 2.wav` | 4:25 | 48.5MB wav 1536k | 4.1MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id 18189935 | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 |
| P1 | 고개 하나만 (Remastered) | `공통/고개 하나만 (Remastered).wav` | 4:59 | 54.8MB wav 1536k | 4.7MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id 8f176f69 | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 |
| P1 | 네메시아 강림 (Remastered) | `공통/네메시아 강림 (Remastered).wav` | 4:59 | 54.7MB wav 1536k | 4.7MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id 93d571eb | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 |
| P1 | 네메시아 강림 | `공통/네메시아 강림V5.mp3` | 4:59 | 6.5MB mp3 183k | 4.7MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 1cc84ff2 | gameplay — 2~7장 또는 공통 회전 |
| P1 | 네메시아의 강림 | `공통/네메시아의 강림.mp3` | 3:55 | 5.3MB mp3 189k | 3.7MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 63248a48 | gameplay — 2~7장 또는 공통 회전 |
| P1 | 네메시아의 강림2 (Remastered) | `공통/네메시아의 강림2 (Remastered).wav` | 2:25 | 26.6MB wav 1536k | 2.3MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id 7a78e67d | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 |
| P1 | 네메시아의 강림3(Remastered) | `공통/네메시아의 강림3(Remastered).wav` | 3:55 | 42.9MB wav 1536k | 3.7MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id 2862f07e | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 |
| P1 | 복수의 대장간 | `공통/복수의 대장간.mp3` | 4:54 | 6MB mp3 172k | 4.6MB | forge | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 86d35f6a | 대장간 화면 BGM(forge 큐) / **반입:** `Bgm/forge_vengeance.mp3`(정적 계약 통과, Unity·청음 미확인) |
| P1 | 지옥 추락 사망 징글 | `공통/지옥 추락 사망 징글.mp3` | 1:44 | 2.3MB mp3 187k | 1.6MB | death | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 72fbda1c | 사망·승리 큐 두 번째 곡(같은 Suno 제목의 다른 take, Unity 1곡으로 충분) / **반입:** `Bgm/death_alt.mp3`(정적 계약 통과, Unity·청음 미확인) |
| P1 | 탈출 성공 | `공통/탈출 성공.mp3` | 3:23 | 4.7MB mp3 194k | 3.2MB | victory | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 24eb606a | 사망·승리 큐 두 번째 곡(같은 Suno 제목의 다른 take, Unity 1곡으로 충분) / **반입:** `Bgm/victory_alt.mp3`(정적 계약 통과, Unity·청음 미확인) |
| P1 | Anvil Ashes | `공통/Anvil Ashes.mp3` | 5:60 | 7.8MB mp3 182k | 5.6MB | forge | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id b998e693 | 대장간 화면 BGM(forge 큐) / **반입:** `Bgm/forge_anvil_ashes.mp3`(정적 계약 통과, Unity·청음 미확인) |
| P1 | Coronam Ferro (Remastered) | `공통/Coronam Ferro (Remastered).wav` | 3:22 | 36.9MB wav 1536k | 3.2MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id eedb7fc5 | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 / 같은 바이트: 공통/Coronam Ferro2(Remastered).wav |
| P1 | Coronam Ferro | `공통/Coronam Ferro V2.mp3` | 3:22 | 4.5MB mp3 189k | 3.2MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id b74033b9 | gameplay — 2~7장 또는 공통 회전 |
| P1 | Coronam Ferro | `공통/Coronam Ferro.mp3` | 3:48 | 5MB mp3 185k | 3.6MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id c0749f24 | gameplay — 2~7장 또는 공통 회전 |
| P1 | Crown of Ash and Iron | `공통/Crown of Ash and Iron.mp3` | 3:21 | 4.4MB mp3 182k | 3.1MB | — | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id ba3fe411 | 설정 목록 — 2~7장 또는 공통 회전 |
| P1 | Ignis et Sanguis | `공통/finalboss.mp3` | 3:47 | 5MB mp3 183k | 3.6MB | finalboss | Suno  · 유료 플랜 확인(사용자, 11-04) · id c44dda17 | finalboss — 2~7장 또는 공통 회전 / 같은 Suno 곡 id: 4장_화염지대/Ignis et Sanguis.mp3 |
| P1 | 복수의 대장간 | `공통/forge.mp3` | 4:54 | 6.9MB mp3 197k | 4.6MB | forge | Suno  · 유료 플랜 확인(사용자, 11-04) · id 733d2711 | 대장간 화면 BGM(forge 큐) / **반입:** `Bgm/forge_vengeance_alt.mp3`(정적 계약 통과, Unity·청음 미확인) |
| P1 | Just One More Hill (Remastered) 2 | `공통/Just One More Hill (Remastered) 2.wav` | 4:33 | 50MB wav 1536k | 4.3MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id b89e5f8e | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 |
| P1 | Just One More Hill (Remastered) | `공통/Just One More Hill (Remastered).wav` | 4:50 | 53.1MB wav 1536k | 4.5MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id 86f55256 | Remastered 원본(WAV, 반입 시 Vorbis 변환). mp3판이 있으면 그쪽과 비교 |
| P2 | h0_explore | `1장_썩은숲/h0_explore.mp3` | 0:37 | 0.6MB mp3 128k | 0.6MB | cutscene_warintro | 다른 AI 음성 표시(AIGC HUABAB…) — 확인 필요 | 컷신·인트로용(1-1 데모 미사용) 또는 출처 확인 필요 |
| P2 | exoduser | `공통/exoduser.mp3` | 0:08 | 0.2MB mp3 194k | 0.1MB | — | 출처 태그 없음 — 확인 필요 | 컷신·인트로용(1-1 데모 미사용) 또는 출처 확인 필요 |
| P2 | intro_voice | `공통/intro_voice.mp3` | 1:45 | 1.6MB mp3 128k | 1.6MB | — | 출처 태그 없음 — 확인 필요 | 컷신·인트로용(1-1 데모 미사용) 또는 출처 확인 필요 |
| P2 | Ashes of the Fallen Gate | `공통/intro.mp3` | 4:22 | 5.8MB mp3 185k | 4.1MB | — | Suno  · 유료 플랜 확인(사용자, 11-04) · id 67912c16 | 컷신·인트로용(1-1 데모 미사용) 또는 출처 확인 필요 / 같은 Suno 곡 id: 1장_썩은숲/Ashes of the Fallen Gate.mp3 |
| P2 | 고개 하나만 | `cutscene/cutscene_goddess_1.mp3` | 4:59 | 6.3MB mp3 177k | 4.7MB | cutscene_goddess | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id eb5e6c23 | 컷신·인트로용(1-1 데모 미사용) 또는 출처 확인 필요 |
| P2 | 고개 하나만 | `cutscene/cutscene_goddess_2.mp3` | 4:25 | 5.7MB mp3 180k | 4.1MB | cutscene_goddess | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id ac4aab0c | 컷신·인트로용(1-1 데모 미사용) 또는 출처 확인 필요 |
| P2 | Just One More Hill | `cutscene/cutscene_goddess_en_1.mp3` | 4:33 | 6MB mp3 185k | 4.3MB | cutscene_goddess_en | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 0e2488ee | 컷신·인트로용(1-1 데모 미사용) 또는 출처 확인 필요 / 같은 바이트: 공통/Just One More Hill V4.mp3 |
| P2 | Just One More Hill | `cutscene/cutscene_goddess_en_2.mp3` | 4:50 | 6.4MB mp3 185k | 4.5MB | cutscene_goddess_en | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id d6102e0b | 컷신·인트로용(1-1 데모 미사용) 또는 출처 확인 필요 / 같은 바이트: 공통/Just One More Hill V5.mp3 |
| 이미 있음 | Ashes of the Fallen Gate | `1장_썩은숲/Ashes of the Fallen Gate.mp3` | 4:22 | 5.8MB mp3 185k | 4.1MB | hell1·gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 67912c16 | Unity Startup/stage_first.mp3 / 같은 Suno 곡 id: 공통/intro.mp3 |
| 이미 있음 | 네메시아의 강림 | `공통/네메시아의 강림 V3.mp3` | 2:25 | 3.4MB mp3 196k | 2.3MB | cutscene_nemesis·gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 8b28225c | Unity Startup/nemesis.mp3 |
| 이미 있음 | Crown of Ash and Iron | `공통/boss.mp3` | 2:43 | 3.8MB mp3 198k | 2.5MB | boss | Suno  · 유료 플랜 확인(사용자, 11-04) · id 1710b2e7 | Unity Bgm/boss.mp3 |
| 이미 있음 | 지옥 추락 사망 징글 | `공통/death.mp3` | 1:48 | 2.4MB mp3 184k | 1.7MB | death | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 5c3a014e | Unity Bgm/death.mp3 |
| 이미 있음 | Abyss Below | `공통/lobby.mp3` | 4:04 | 5MB mp3 172k | 3.8MB | lobby | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 7e6bf48a | Unity Lobby/lobby.mp3 |
| 이미 있음 | 탈출 성공 | `공통/victory.mp3` | 3:23 | 4.4MB mp3 180k | 3.2MB | victory | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 0878ead6 | Unity Bgm/victory.mp3 |
| 이미 있음 | prologue_theme_abyssal_fracture | `cutscene/prologue_theme_abyssal_fracture.mp3` | 4:05 | 5.6MB mp3 192k | 3.8MB | cutscene_prologue | Suno  · 유료 플랜 확인(사용자, 11-04) · id 8a1bb8cd | Unity Lobby/prologue_theme_abyssal_fracture.mp3 |
| 이미 있음 | prologue_theme_rebirth_gate_1 | `cutscene/prologue_theme_rebirth_gate_1.mp3` | 3:30 | 4.8MB mp3 192k | 3.3MB | cutscene_prologue | Suno  · 유료 플랜 확인(사용자, 11-04) · id 9fa91f35 | Unity Lobby/prologue_theme_rebirth_gate_1.mp3 |
| 이미 있음 | prologue_theme_rebirth_gate_2 | `cutscene/prologue_theme_rebirth_gate_2.mp3` | 3:35 | 4.9MB mp3 192k | 3.4MB | cutscene_prologue | Suno  · 유료 플랜 확인(사용자, 11-04) · id 27871b60 | Unity Lobby/prologue_theme_rebirth_gate_2.mp3 |
| 이미 있음 | prologue_theme | `cutscene/prologue_theme.mp3` | 3:43 | 5.1MB mp3 192k | 3.5MB | cutscene_prologue | Suno  · 유료 플랜 확인(사용자, 11-04) · id 9c391127 | Unity Lobby/prologue_theme.mp3 |
| 제외 | Cathedral of Steel | `1장_썩은숲/Cathedral of Steel (1).mp3` | 4:49 | 6.7MB mp3 193k | 4.5MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 1e8b3061 | 중복 사본 |
| 제외 | Neon Hellfire Protocol | `1장_썩은숲/Neon Hellfire Protocol (1).mp3` | 3:54 | 5.5MB mp3 197k | 3.6MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 3a876524 | 중복 사본 |
| 제외 | 흰눈의 맹세2 (Remastered) | `3장_얼음굴/흰눈의 맹세2 (Remastered).wav` | 5:48 | 63.6MB wav 1536k | 5.4MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id c1fdaf20 | 중복 사본 / 같은 바이트: 3장_얼음굴/흰눈의 맹세 (Remastered).wav |
| 제외 | Coronam Ferro2(Remastered) | `공통/Coronam Ferro2(Remastered).wav` | 3:22 | 36.9MB wav 1536k | 3.2MB | gameplay | Suno  · 유료 플랜 확인(사용자, 11-04) · id eedb7fc5 | 중복 사본 / 같은 바이트: 공통/Coronam Ferro (Remastered).wav |
| 제외 | Just One More Hill | `공통/Just One More Hill V4.mp3` | 4:33 | 6MB mp3 185k | 4.3MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id 0e2488ee | 중복 사본 / 같은 바이트: cutscene/cutscene_goddess_en_1.mp3 |
| 제외 | Just One More Hill | `공통/Just One More Hill V5.mp3` | 4:50 | 6.4MB mp3 185k | 4.5MB | gameplay | Suno (beearthone)  · 유료 플랜 확인(사용자, 11-04) · id d6102e0b | 중복 사본 / 같은 바이트: cutscene/cutscene_goddess_en_2.mp3 |

## 3. 기록

| 날짜 | 내용 |
|---|---|
| 2026-11-04 | 웹 79파일 조사, P0 3곡(15.0MB)·P1 52곡·P2 8·보유 10·제외 6. Suno 상업 권리 확인 필요 표시. 반입은 아직 안 함 |
| 2026-11-04 | 사용자 확인(CTO 경유): Suno 생성 당시 유료 플랜 → Suno 76곡 상업 이용 조건 확인, 출처 칸 갱신. P1 반입 순서 7단계 결정(데모 권장 = P0 + 1~3단계, 11곡 약 45MB). P2 3곡은 계속 보류 |

| 2026-11-04 | P1 ①~③ 8곡 반입·표현 계층 연결. Core 무수정, 18값 설정 목록, 필드 6곡·대장간 3곡 셔플 및 사망/승리 교대. 2-pass/검사 원자료 §1.4. 실제 Unity 컴파일은 HALT 차단, 청음 전 |
