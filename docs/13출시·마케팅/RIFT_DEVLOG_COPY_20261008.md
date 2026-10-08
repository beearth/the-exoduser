# 지옥의 틈 개발 기록 01 — 최종 편집 문안

수정: 2026-10-08 · FOR DEAR GAMERS / FDG · **가로 34초 / 세로 20초 편집 구성에 맞춘 문안. 완성 렌더·게시·공개 확인은 별도 기록한다.**

## 1. 이번 영상의 사실 범위

| 항목 | 최종 기준 |
|---|---|
| 게임·공간명 | **EXODUSER: HELL LORD / 지옥의 틈**. 확정된 공식 영문 공간명은 없으므로 영어 본문에도 한국어 이름과 설명을 함께 사용 |
| 의미 | 전투 사이 망자들이 머무는 공간을 만드는 개발 기록 |
| 가로 | **34초 / 1,020프레임 / 1920×1080 / 30fps**. 실제 보행 4초 → Oct 5 콘셉트 6초 → Oct 6 보행 9초 → 근거리 주민 이동 2초 → 보행·향후 망자 이야기 9초 → CTA 4초 |
| 세로 | **20초 / 600프레임 / 1080×1920 / 30fps**. Oct 6 실제 보행 6+6+4초 → CTA 4초. 콘셉트 원화 컷은 세로 편집에 없음 |
| 녹화 출처 | **2026-10-06 별도 개발 녹화. 공개 Steam 데모와 다른 개발 중 화면입니다.** 정확한 녹화 커밋은 미확인. Oct 8 신규 촬영·최신 상태라고 쓰지 않음 |
| 콘셉트 출처 | 2026-10-05 `hell-rift-painterly-v2.png`. 실제 게임플레이와 구분 |
| 실제로 보이는 것 | 공간 보행·주민의 근거리 이동. **녹화에 대화창이 없으므로 대화 시연·주민 숫자를 강조하지 않음** |
| 아직 미완료 | 실제 퀘스트·보상·영구저장 연결. 완료·지급·저장 시연으로 소개하지 않음 |
| 데모 구분 | 공개 배포 바이너리와 직접 대조하지 않았으므로 **특정 기능이 현재 데모에 포함되지 않는다고 단정하지 않음**. 별도 개발 녹화라는 출처를 표시하고 공개 데모 CTA와 구분 |
| 오디오 | 원본 개발 녹화 두 개에 오디오 스트림 없음. 기존 사용자 채택 Suno 주제가 **‘심연의 탈주’ / `bgm/cutscene/prologue_theme.mp3`**를 **편집 BGM**으로 추가. 현장 녹음·실제 Rift 원음으로 소개하지 않음. 내레이션 없음 |
| AI 공개 | 게임 아트·오디오에 AI 보조 자산 사용. 이번 BGM은 기존 Suno 생성 주제가. 실제 개발 화면을 새 AI 영상으로 대체하지 않음 |
| 제외 | 신규 캐릭터 완료, Oct 7 본편 연결 시연, Oct 8 선명도 개선 완료, 모든 스테이지 연결 완료, 미확정 출시일·콘텐츠 수·가격 |

이전 초안의 ‘현재 데모 미포함’ 단정과 이동·대화 프리뷰 설명을 폐기하고 위 출처·실제 화면 기준으로 수정했다. [납품 기록](/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/docs/13출시·마케팅/RIFT_DEVLOG_DELIVERY_20261008.md)과 [native 편집 코드](/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/tools/marketing_rift_edit_20261008.jsx)를 대조했다.

## 2. 확정 KR / EN 온스크린 문구

첫 프레임부터 실제 보행 화면. 아래 문구는 현행 JSX와 일치한다. `\n`은 줄바꿈이며 문자로 출력하지 않는다. 영문 공간 설명은 공식 영문 명칭 확정으로 해석하지 않는다.

### 가로 34초

| 구간 | 실제 소재 | KR | EN | 출처 태그 |
|---|---|---|---|---|
| 0–4초 | Oct 6 보행 hook | 전투가 끝나면, 어디로 갈까? | WHERE DO SOULS GO BETWEEN BATTLES? | 지옥의 틈 · 개발 기록 01 |
| 4–10초 | Oct 5 콘셉트 원화 | 망자들이 머무는 틈 | A PLACE BETWEEN STAGES | 2026.10.05 · 콘셉트 원화 |
| 10–19초 | Oct 6 실제 보행 | 그림 속으로 걸어 들어가다 | FROM PAINTING TO PLAYABLE SPACE | 2026.10.06 · 실제 보행 |
| 19–21초 | 근거리 주민 이동 | 틈에 머무는 이들 | SOULS THAT LINGER | 2026.10.06 · 개발 녹화 |
| 21–30초 | 보행·향후 이야기 예고 | 다음은, 망자들의 이야기 | NEXT: THE STORIES THEY LEFT BEHIND | 지옥의 틈 · 개발 중 |
| 30–34초 | 로고·기존 공개 데모 CTA | 지옥의 틈 · 개발 기록 01 | FREE WINDOWS DEMO ON STEAM | 개발 중 화면 · 공개 데모와 다름 / Separate development build / FOR DEAR GAMERS |

### 세로 20초

| 구간 | 실제 소재 | KR | EN | 출처 태그 |
|---|---|---|---|---|
| 0–6초 | Oct 6 보행 | 전투가 끝나면,\n어디로 갈까? | BETWEEN BATTLES | 개발 기록 01 |
| 6–12초 | Oct 6 보행 | 망자들이\n머무는 곳 | WHERE SOULS LINGER | 지옥의 틈 · 개발 중 |
| 12–16초 | Oct 6 보행 | 그림에서\n걸어 다니는 공간으로 | FROM ART TO FIRST WALK | 2026.10.06 · 실제 개발 녹화 |
| 16–20초 | 로고·기존 공개 데모 CTA | 지옥의 틈 · 개발 기록 01 | FREE WINDOWS DEMO ON STEAM | 개발 중 화면 · 공개 데모와 다름 / Separate development build / FOR DEAR GAMERS |

공통 상태 표시는 **‘개발 중 화면 · 공개 데모와 다름’ / ‘Separate development build’**. ‘PLAYABLE SPACE’는 화면 속 보행 프리뷰를 뜻하며 공개 플레이 가능·퀘스트 완성·데모 업데이트 완료를 의미하지 않는다. ‘다음은, 망자들의 이야기’는 향후 개발 기록 소재이며 이번 영상에 대화창이 나온다는 설명이 아니다.

## 3. YouTube 가로 영상 제목·설명

KR 제목:

```text
전투가 끝나면, 어디로 갈까? | 지옥의 틈 개발 기록 01
```

EN 제목:

```text
Where Do Souls Go Between Battles? | EXODUSER: HELL LORD Devlog 01
```

한영 설명 복붙안:

```text
전투가 끝나면, 어디로 갈까?

EXODUSER: HELL LORD의 ‘지옥의 틈’ 첫 개발 기록입니다. 전투 사이 망자들이 머무는 공간을 만들고 있습니다. 10월 5일 콘셉트 원화에서 6일 실제 보행 화면으로 이어집니다.

2026-10-06 별도 개발 녹화. 공개 Steam 데모와 다른 개발 중 화면입니다. 실제 퀘스트·보상·영구저장 연결은 아직 제작 중입니다.

이곳의 망자들은 어떤 이야기를 품고 있을까요? 다음 개발 기록도 함께 봐주세요.

Where do souls go between battles?

The first development record of 지옥의 틈, a space where the dead linger between battles in EXODUSER: HELL LORD. From the October 5 concept art to the October 6 walking footage.

Recorded in a separate development build on October 6, 2026. This work-in-progress footage differs from the public Steam demo. Quest, reward and persistent-save integration is still in development.

What stories might these souls carry? Follow for future devlogs.

현재 공개 Windows 데모 / Current public Windows demo — separate from the development footage shown here:
https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/?utm_source=youtube&utm_medium=organic_video&utm_campaign=foreign_pilot_202610&utm_content=rift_devlog01

AI·음원 공개: 게임은 AI 보조 아트·오디오를 사용합니다. 이 영상은 실제 프로젝트 콘셉트 원화와 개발 녹화로 구성했습니다. 원본 녹화는 무음이며, 기존 사용자 채택 Suno 주제가 ‘심연의 탈주’(prologue_theme.mp3)를 편집 BGM으로 추가했습니다. 내레이션은 없습니다.
AI/audio disclosure: The game uses AI-assisted art and audio. This video uses actual project concept art and development footage. The source recordings are silent; the existing Suno-generated project theme “심연의 탈주” (prologue_theme.mp3) was added as editorial background music. No narration.

FOR DEAR GAMERS / FDG
```

## 4. YouTube Shorts 제목·설명

KR 제목:

```text
전투가 끝난 뒤, 어디로 갈까? | 지옥의 틈 개발 중
```

EN 제목:

```text
Between Battles, Where Do Souls Linger? | EXODUSER Devlog 01
```

한영 설명 복붙안:

```text
전투 사이, 망자들이 머무는 곳. EXODUSER: HELL LORD의 ‘지옥의 틈’ 보행 프리뷰입니다.
2026-10-06 별도 개발 녹화. 공개 Steam 데모와 다른 개발 중 화면입니다. 실제 퀘스트·보상·영구저장 연결은 제작 중입니다.

Between battles, the dead linger. A walking preview of 지옥의 틈 in EXODUSER: HELL LORD.
Recorded in a separate development build on October 6, 2026. This work-in-progress footage differs from the public Steam demo. Quest, reward and persistent-save integration is unfinished.

다음 개발 기록도 함께 봐주세요. / Follow for future devlogs.
현재 공개 데모: Steam에서 EXODUSER: HELL LORD 검색. 영상은 별도 개발 빌드 화면입니다.
For the current public demo, search Steam for EXODUSER: HELL LORD. This video shows a separate development build.

게임은 AI 보조 아트·오디오를 사용합니다. 실제 개발 녹화에 기존 Suno 주제가 ‘심연의 탈주’를 편집 BGM으로 추가했습니다. 원본 녹화는 무음이며 내레이션은 없습니다.
The game uses AI-assisted art/audio. Actual development footage, with the existing Suno theme “심연의 탈주” added as editorial BGM. Source recordings are silent; no narration.
FOR DEAR GAMERS / FDG
```

Shorts 설명 URL 클릭·미연결 관련 영상·미확인 새 원본 URL을 안내하지 않는다. 관련 영상은 실제 연결 확인 후에만 안내를 추가한다.

## 5. Threads 재사용

언어별 아래 한 가지와 세로 영상을 사용한다. 세로 영상에는 Oct 5 콘셉트 컷이 없으므로 원화 비교를 직접 보여준다고 설명하지 않는다. 공개 영상 URL은 실제 확인 후에만 첨부한다.

KR:

```text
전투가 끝나면, 어디로 갈까?

EXODUSER: HELL LORD의 ‘지옥의 틈’. 전투 사이 망자들이 머무는 공간을 만들고 있습니다.

2026-10-06 별도 개발 녹화. 공개 Steam 데모와 다른 개발 중 화면입니다. 퀘스트·보상·영구저장 연결은 제작 중입니다.

게임은 AI 보조 아트·오디오를 사용합니다. 실제 보행 녹화에 기존 Suno 주제가 ‘심연의 탈주’를 편집 BGM으로 추가했습니다. 내레이션은 없습니다.

이곳의 망자들은 어떤 이야기를 품고 있을까요?
— FOR DEAR GAMERS / FDG
```

EN:

```text
Where do souls go between battles?

지옥의 틈, a space for the dead in EXODUSER: HELL LORD.

Separate development footage recorded Oct 6, 2026; it differs from the public Steam demo. Quest/reward/save integration is unfinished.

AI-assisted game art/audio. Actual walking footage with the existing Suno theme “심연의 탈주” added as editorial BGM; no narration.

What stories might these souls carry?
— FOR DEAR GAMERS / FDG
```

## 6. Discord 재사용

FDG 소유 또는 개발 기록 공유가 허용된 채널에 맞춰 사용한다. 새 YouTube URL은 실제 공개 확인 후 한 줄로 첨부한다. 아래는 가로 원본 공유 기준이며 세로만 공유할 경우 Oct 5 콘셉트 원화 문장을 제거한다.

KR:

```text
전투가 끝나면, 어디로 갈까? — 지옥의 틈 개발 기록 01

FDG에서 EXODUSER: HELL LORD의 ‘지옥의 틈’ 첫 개발 기록을 공유합니다. 전투 사이 망자들이 머무는 공간으로, 이번 영상은 10월 5일 콘셉트 원화와 6일 실제 보행 녹화를 이어 붙였습니다.

2026-10-06 별도 개발 녹화. 공개 Steam 데모와 다른 개발 중 화면입니다. 실제 퀘스트·보상·영구저장 연결은 아직 제작 중입니다.

이곳의 망자들은 어떤 이야기를 품고 있을까요? 장면에서 궁금했던 부분을 알려주세요.

게임은 AI 보조 아트·오디오를 사용합니다. 원본 녹화는 무음이며, 기존 사용자 채택 Suno 주제가 ‘심연의 탈주’(prologue_theme.mp3)를 편집 BGM으로 추가했습니다. 내레이션은 없습니다.
— FOR DEAR GAMERS / FDG
```

EN:

```text
Where do souls go between battles? — EXODUSER: HELL LORD Devlog 01

FDG is sharing the first development record of 지옥의 틈, a space where the dead linger between battles. This video follows the October 5 concept art and October 6 walking footage.

Recorded in a separate development build on October 6, 2026. This work-in-progress footage differs from the public Steam demo. Quest, reward and persistent-save integration is still in development.

What stories might these souls carry? Tell us what made you curious in the scene.

The game uses AI-assisted art and audio. The source recordings are silent; the existing Suno-generated project theme “심연의 탈주” (prologue_theme.mp3) was added as editorial BGM. No narration.
— FOR DEAR GAMERS / FDG
```

## 7. 출처·게시 전 대조

- [소재 출처·SHA256](/Users/fordeargamers/.codex/worktrees/marketing-gameplay-20261008/the-exoduser/marketing/captures/rift-20261008/provenance.json): 실제 Oct 6 녹화 두 개, Oct 5 콘셉트 원화, 기존 주제가·로고를 구분. 녹화 정확 커밋은 `UNKNOWN`으로 유지한다.
- [주제가 채택 정본](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/6사운드디자인/주제가_SUNO_프롬프트.md:70): Suno 인스트루멘털 ‘심연의 탈주’, 기존 프로젝트 파일 `bgm/cutscene/prologue_theme.mp3`. 이번 편집에서 생성한 신곡·Rift 녹음 원음이 아니다.
- [콘텐츠 계획](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md), [Oct 6 구현 기록](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md), [Oct 7 본편·대화 연결 기록](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/11내러티브·로어디자인/RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md): 후속 구현 기록을 이번 영상에 보이는 기능으로 설명하지 않는다.
- 제목·설명·댓글에서 대화창·주민 수·퀘스트·보상·저장 시연을 주장하지 않는다. 배포 바이너리 대조 없이 ‘현재 데모 미포함’을 단정하지 않는다.
- 최종 렌더의 34초/20초, 실제 문구·보행·BGM을 확인한 뒤 공개 URL·게시 상태를 별도 기록한다. 외부 계정 생성·연락·게시 완료를 문안 작성으로 계산하지 않는다.
