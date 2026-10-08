# EXODUSER: HELL LORD — 실제 스킬 시연 영상 편집 현행 계약

동기화: **2026-10-08**. 코드: [marketing_edit_20261008.jsx](../../tools/marketing_edit_20261008.jsx). 관련 기록: [신규 정상 맵 촬영 manifest](FRESH_CAPTURE_MANIFEST_20261008.md), [촬영 스튜디오](INGAME_CAPTURE_STUDIO_20261008.md), [채널 조건](EXPOSURE_CHANNELS_20261008.md), [게시문안](SOCIAL_VIDEO_COPY_20261008.md).

이 문서는 총괄의 최신 **manual 제외·Steam 37초** 편집 결정을 반영한다. 템플릿 초기 48초/Shorts A 24초와 중간 가로 42초안은 현재 납품 계약이 아니다. **cloud native build·frame·render·오디오·게시 검증은 대기**이며 코드/타임라인 대조를 영상 검수 PASS로 표시하지 않는다.

제작 스킬 `video-editing`의 `SKILL.md`, `references/compose.md`, `assembly.md`, `clip-geometry.md`를 적용했다. 이번 동기화 담당 소유는 **본 문서 하나**다. JSX 변경·실제 hosted 입력/프로젝트/렌더·Steam 교체·게시·커밋은 총괄 책임이며 다른 파일은 수정하지 않는다.

## 1. 입력·선정·제외

| 항목 | 현행 계약 |
|---|---|
| 촬영 출처 | 최신 촬영 Git `2f5aa0e88e32ff2d82a93f9c6098643d8d1f6427`의 실제 인게임. 정상 1장 맵·실제 이벤트 증거는 촬영 manifest 기준. 완전 AI 생성 영상으로 실제 플레이 대체 금지 |
| Steam 동일성 | 개발 런타임 촬영이며 Steam 배포 데모 바이너리·전체 에셋 동일성은 **미검증**. 공개 문안은 개발 빌드와 데모 차이 가능성을 명시 |
| 채택 5종 | `parry.webm`, `rage_slam.webm`, `fire.webm`, `ice_orb.webm`, `blackhole.webm`. 모두 **staged 고레벨 스킬 시연**이며 일반 데모 난이도·성장 수치의 증거가 아님 |
| manual 제외 | 총괄의 최신 육안 판단: 튜토리얼 경고와 잦은 피격으로 자사 홍보 소재 품질 미달. 중간 가로본에 넣었던 5초를 최종 편집에서 제외. **raw 보존**, 일반 플레이를 staged 결과로 대체했다고 설명하지 않음 |
| ancestor 제외 | 현행 장비·도감 발동 조건 미충족으로 실제 성공 신규 산출물 미확보. 최종 입력·타임라인에서 제외. 오래된 성공 촬영을 신규 원본으로 편입하지 않음 |
| staging 공개 | 모든 채택 전투 컷에 작은 시연·개발 빌드 표시. 실제 원음 유지. 공개 문안에서 일반 Lv1 플레이 혼합이라고 설명하지 않음 |
| 입력 위치 | 총괄이 hosted runtime에 준비할 `/home/user/exoduser-fresh/`. 소스 config에 manual/ancestor가 남아도 선택 타깃의 shots에 없으면 가져오지 않음 |
| 실제 길이 | 기본 `sourceDuration=null`. 코드가 입력 디렉터리의 `probe.json`을 읽어 해당 source key의 숫자 초를 설정하며, 없으면 총괄이 config에 직접 입력. 유효한 길이·trim·파일 존재를 확인한 뒤 project 생성 |
| 선택 로고 | `/home/user/exoduser-fresh/logo.png`가 있을 때만 import. 없으면 native EXODUSER 텍스트와 HELL LORD 부제를 사용 |
| 폰트 | 코드 실제 `fontFamily="DM Sans"`. 설치 폰트 목록·실제 native 출력의 글리프/줄바꿈 검수는 총괄이 확인 |
| 오디오 | 원본 게임 오디오만 사용. 새 AI 영상·보이스·음악·효과음 생성 없음. CTA 4초는 무음. 게임 자체 AI 보조 아트·SFX/BGM 공개는 유지 |

촬영 manifest에는 일반 데모 원본의 실제 사망·입력 로그와 로컬 보존 사실도 기록했다. 최종 편집 입력에서는 제외한다.

## 2. 최종 편집 타임라인·원본 trim

| 타깃 | 화면 | 타임라인 초 | 총 길이·프레임 | 영상 출력 목표 |
|---|---|---|---|---|
| `steam` | 1920×1080, 16:9 | parry **0–4** → rage_slam **4–11** → fire **11–19** → ice_orb **19–26** → blackhole **26–33** → CTA **33–37** | **37초 / 1,110f** | H.264 8-bit, 30fps, **20Mbps**, AAC |
| `youtube` | 동일 가로 마스터 | `steam`으로 resolve. 같은 프로젝트·동일 편집 사용 가능 | **37초 / 1,110f** | 동일 |
| `shortsA` | 1080×1920, 9:16 | parry **0–5** → rage_slam **5–12** → CTA **12–16** | **16초 / 480f** | H.264 8-bit, 30fps, **12Mbps**, AAC |
| `shortsB` | 1080×1920, 9:16 | fire **0–8** → ice_orb **8–15** → blackhole **15–22** → CTA **22–26** | **26초 / 780f** | H.264 8-bit, 30fps, **12Mbps**, AAC |

| 원본 | source trim 시작 | 가로 사용 길이·구간 | 세로 사용 길이·구간 | 필요한 최소 소스 길이 |
|---|---:|---|---|---:|
| parry | **5초** | 4초 / **5–9** | A 5초 / **5–10** | **10초** |
| rage_slam | **1초** | 7초 / **1–8** | A 7초 / **1–8** | **8초** |
| fire | **2초** | 8초 / **2–10** | B 8초 / **2–10** | **10초** |
| ice_orb | **29/30초** | 7초 / **0.966667–7.966667** | B 7초 / **0.966667–7.966667** | **7.966667초** |
| blackhole | **1초** | 7초 / **1–8** | B 7초 / **1–8** | **8초** |

시간은 모두 초 단위이며 원본 위치와 편집 타임라인을 구분한다. `from + dur`가 probe 소스 길이를 초과하거나 30fps 경계에 맞지 않으면 코드가 오류로 중단한다. 자동 루프·정지 프레임·임의 속도 변경으로 부족분을 채우지 않는다. 촬영 원본의 측정 렌더 FPS와 최종 30fps 인코딩 FPS는 별도 값이다.

## 3. 코드와 일치하는 화면·텍스트 좌표

| 요소 | x / y / width / height (px) | 구현·검수 기준 |
|---|---|---|
| 가로 영상 | **0 / 0 / 1920 / 1080** | 원본을 spine `fit=contain`으로 전체 화면 보존. 이전 검정 프레임 축소 방식 제외 |
| 가로 설명 | **54 / 34 / 1740 / 60**, font **34**, weight **700** | 투명 native frame의 짧은 편집 설명. 배경 영상 전체가 보이며 실제 영상의 전조/피해 숫자와 겹치지 않는지 검수 |
| 가로 시연 표시 | **54 / 1000 / 1700 / 38**, font **22** | `Staged skill demonstration · Development build`, muted text. 모든 전투 컷에 표시 |
| 세로 제목 | **84 / 150 / 840 / 58**, font **32** | EXODUSER: HELL LORD, 중앙 정렬 |
| 세로 설명 | **84 / 228 / 840 / 128**, font **60**, weight **700** | 실제 해당 스킬 컷과 문구를 대조 |
| 세로 데모 안내 | **84 / 365 / 840 / 54**, font **34**, weight **700** | FREE DEMO ON STEAM |
| 세로 중앙 detail | **0 / 445 / 1080 / 880** | `<media fit="cover">`로 중앙 전투 확대. 원본 일부가 crop됨을 인정하며 시각 검수 필요 |
| 세로 시연 표시 | **84 / 1340 / 840 / 36**, font **23** | `Staged skill demo · Development build` |
| 세로 하단 전체 context | **120 / 1390 / 840 / 472** | 같은 원본·같은 trim의 `<media fit="contain">`. 전투 전체를 하단에서 함께 보여줌. 중앙 detail만으로 전체 전투가 보인다고 설명하지 않음 |

세로는 중앙의 확대 detail와 하단 전체 context를 동시에 표시한다. 두 화면은 같은 소스·같은 시간이며 영상 자체에 가짜 HUD를 추가하지 않는다. 원본은 Canvas 캡처이므로 HTML HUD가 모두 들어 있다고 주장하지 않는다. 하단 context가 플랫폼 앱 UI에 가려질 수 있으므로 실제 Shorts/Reels/TikTok 미리보기에서 확인하고 필요 시 총괄이 좌표·문서를 함께 조정한다.

| CTA 요소 | 가로 x/y/w/h | 세로 x/y/w/h | 공통/차이 |
|---|---|---|---|
| 실제 선택 로고 | **192/90/1536/450** | **60/430/960/400** | contain. 없으면 EXODUSER text: 가로 y310 / 세로 y600, h150/font76 |
| HELL LORD | **192/540/1536/90** | **60/850/960/90** | font 가로46/세로64, weight700 |
| PLAY THE FREE STEAM DEMO | **192/690/1536/100** | **60/1020/960/170** | font 가로64/세로60, weight700 |
| WINDOWS · STEAM | **192/810/1536/60** | **60/1240/960/60** | font34 |
| FOR DEAR GAMERS | **192/920/1536/50** | **60/1350/960/50** | font28 |

## 4. 오디오·API·실행 계약

`p.cut(handle,{from,dur,at,fit:"contain"})` spine은 원본 게임 오디오를 한 번만 보존한다. 가로는 투명 text overlay만 추가한다. 세로는 opaque native frame 위에 picture-only compose media 두 개를 배치한다. `<media>`의 picture-only 동작을 오디오 복제나 새 배경음으로 해석하지 않는다. CTA 마지막 4초는 원본 오디오 컷이 없어 의도적 무음이다.

| 항목 | 확인·대기 상태 |
|---|---|
| API | `project({dir,size,fps,background})`, add/cut/compose, native frame/media/text. React/DOM 없음. 코드에 render/upload/게시 호출 없음 |
| hosted 설치 확인 | 총괄이 설치 CLI의 `--bitrate`와 `/opt/fable/types/fable.d.ts` 존재를 확인했다고 전달. 이것은 이번 composition의 실제 build 성공 증거가 아님 |
| 소스 preflight | probe.json 숫자 초 → 선택 타깃 sourceDuration/trim → 파일 존재 → project. 실제 hosted 입력 파일과 metadata 확인은 총괄 실행 대기 |
| H.264 | 문서화된 depth8 native 기본. 추정 `codec:"h264"` override를 넣지 않음 |
| AAC | 출력 요구 AAC. 읽은 render API에 오디오 코덱 필드가 없어 추정 필드 추가 없음. 렌더 후 ffprobe로 확인하고 필요 시 원음 유지 AAC 먹싱/재인코딩을 총괄이 결정 |
| bitrate | 20,000,000 / 12,000,000bps 목표. 고정 비트레이트나 정확한 파일 크기를 보장하지 않음 |
| native build / render | **실행 대기**, 픽셀·청취·A/V 동기·클리핑·실제 장면 승인 **미검증** |
| 코드·문서 대조 | source trim·컷 총합·좌표·DM Sans·원음 경로를 읽기 전용 대조. 이 확인을 영상 PASS로 표시하지 않음 |
| Steam 공개 | 최종 렌더·검수·업로드·공개 상점 확인 전 기존 납품 영상 교체 완료로 표시하지 않음 |

총괄의 후속 순서: hosted 입력/probe 확인 → 타깃별 fresh project build → 첫 프레임·컷 경계·중앙 detail/전체 context·시연 표시·CTA contact sheet → 최종 render → ffprobe·재생/청취 → 플랫폼 공개 조건 대조 → 실제 게시 URL/Steam 노출 기록.

```sh
EXODUSER_EDIT_TARGET=steam higgsedit build /home/user/marketing_edit_20261008.jsx
EXODUSER_EDIT_TARGET=shortsA higgsedit build /home/user/marketing_edit_20261008.jsx
EXODUSER_EDIT_TARGET=shortsB higgsedit build /home/user/marketing_edit_20261008.jsx
higgsedit frame /home/user/exoduser-edits/20261008/steam-master-37s 0.1 --out /home/user/exoduser-edits/20261008/parry-first.png
higgsedit render /home/user/exoduser-edits/20261008/steam-master-37s --depth 8 --bitrate 20M --out /home/user/exoduser-edits/20261008/EXODUSER_STEAM_37S_1080P30.mp4
higgsedit render /home/user/exoduser-edits/20261008/shorts-a-16s --depth 8 --bitrate 12M --out /home/user/exoduser-edits/20261008/EXODUSER_SHORTS_A_16S_1080P30.mp4
higgsedit render /home/user/exoduser-edits/20261008/shorts-b-26s --depth 8 --bitrate 12M --out /home/user/exoduser-edits/20261008/EXODUSER_SHORTS_B_26S_1080P30.mp4
```

위는 총괄이 JSX를 hosted 경로로 옮긴 뒤 실행할 명령 예시이며 본 문서 동기화 담당은 실행하지 않았다. whole-script build는 해당 프로젝트 timeline을 대체하므로 독립 프로젝트를 사용한다.

## 5. 문서 동기화·추가 통합 필요

2026-10-08 docs 전체 관련 검색 결과, 과거 9월 영상은 제작·납품 이력으로 보존한다. 새 37초 영상으로 업로드 완료된 것이 아니다. 원본 provenance·staging은 신규 촬영 manifest와 함께 읽는다. 게임 아트/오디오 AI 공개 및 YouTube 합성 음악 공개 설정은 [채널 조건](EXPOSURE_CHANNELS_20261008.md)을 따른다.

**총괄 후속 수정 필요:** `SOCIAL_VIDEO_COPY_20261008.md`의 가로 설명 초안에는 일반 Lv1 플레이와 staged 스킬 혼합 문장이 남아 있다. 최종 가로본에서 manual이 제외됐으므로 **staged high-level skill demonstrations**로 수정해야 한다. 본 동기화에서는 지정 소유 밖 파일을 변경하지 않았다.

본 작업의 변경 파일은 이 문서 하나다. 게임 코드·JSX·원본·다른 문서·계정·게시·커밋은 변경하지 않았다.

## 실제 입력 컨테이너 검수 보완

원본 MediaRecorder WebM에는 format.duration 메타데이터가 없어 첫 probe가 실패했다. GitHub 원본 SHA256를 먼저 검증한 뒤 클라우드에서 FFmpeg `-map 0 -c copy`로 WebM 컨테이너만 다시 작성했다. 영상 VP9/음성 Opus를 재인코딩하지 않았으며 실제 picture/audio 편집은 Higgsedit로 수행한다. probe 길이는 parry10.000, rage_slam8.010, fire10.984, ice_orb7.991, blackhole9.990초. ice_orb의 1+7초 trim은 실제 컨테이너보다 0.009초 길어 검증에서 차단되었으므로 29/30초 시작으로 1프레임 앞당겼다. 최종 7초 컷·총 길이는 유지하고 자동 루프/부족분 정지프레임을 쓰지 않는다.
