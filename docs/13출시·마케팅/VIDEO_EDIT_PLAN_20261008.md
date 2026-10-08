# EXODUSER: HELL LORD — 실제 스킬 시연 영상 편집 현행 계약

동기화: **2026-10-08**. 코드: [marketing_edit_20261008.jsx](../../tools/marketing_edit_20261008.jsx), [준비 입력 생성 도구](../../tools/marketing_prepare_20261008.py). 관련 기록: [최종 납품·검수·게시 상태](VIDEO_DELIVERY_20261008.md), [신규 정상 맵 촬영 manifest](FRESH_CAPTURE_MANIFEST_20261008.md), [촬영 스튜디오](INGAME_CAPTURE_STUDIO_20261008.md), [채널 조건](EXPOSURE_CHANNELS_20261008.md), [게시문안](SOCIAL_VIDEO_COPY_20261008.md).

최종 편집은 **manual 제외·Steam 37초 / Shorts A 16초 / Shorts B 26초**다. 템플릿 초기 48초/Shorts A 24초와 중간 가로 42초안은 현재 납품 계약이 아니다. **보정 입력을 사용한 native build·최종 3종 render·전체 decode·원본 시간 대조·샘플 육안·오디오 신호 검사 완료**. 기술·시간·샘플 화면 검수는 §5의 실측 범위에서 PASS이며, **주관적인 전체 청취는 미수행**, 플랫폼 게시는 인증·로그인·Mac 잠금 해제 대기다. 완성 파일·해시·상세 검수·게시 상태는 [최종 납품 기록](VIDEO_DELIVERY_20261008.md)을 따른다.

네이티브 편집은 `video-editing`의 `SKILL.md`, `references/compose.md`, `assembly.md`, `clip-geometry.md`를 적용했다.

## 1. 입력·선정·제외

| 항목 | 현행 계약 |
|---|---|
| 촬영 출처 | 최신 촬영 Git `2f5aa0e88e32ff2d82a93f9c6098643d8d1f6427`의 실제 인게임. 정상 1장 맵·실제 이벤트 증거는 촬영 manifest 기준. 완전 AI 생성 영상으로 실제 플레이 대체 금지 |
| Steam 동일성 | 개발 런타임 촬영이며 Steam 배포 데모 바이너리·전체 에셋 동일성은 **미검증**. 공개 문안은 개발 빌드와 데모 차이 가능성을 명시 |
| 채택 5종 | 원본 `parry.original.webm`, `rage_slam.original.webm`, `fire.original.webm`, `ice_orb.original.webm`, `blackhole.original.webm`에서 준비한 같은 key의 **`*.prepared.mp4`**를 native 입력으로 사용. 모두 **staged 고레벨 스킬 시연**이며 일반 데모 난이도·성장 수치의 증거가 아님 |
| manual 제외 | 총괄의 최신 육안 판단: 튜토리얼 경고와 잦은 피격으로 자사 홍보 소재 품질 미달. 중간 가로본에 넣었던 5초를 최종 편집에서 제외. **raw 보존**, 일반 플레이를 staged 결과로 대체했다고 설명하지 않음 |
| ancestor 제외 | 현행 장비·도감 발동 조건 미충족으로 실제 성공 신규 산출물 미확보. 최종 입력·타임라인에서 제외. 오래된 성공 촬영을 신규 원본으로 편입하지 않음 |
| staging 공개 | 모든 채택 전투 컷에 작은 시연·개발 빌드 표시. 실제 원음 유지. 공개 문안에서 일반 Lv1 플레이 혼합이라고 설명하지 않음 |
| 입력 위치 | 실제 hosted 입력은 `/home/user/exoduser-fresh/prepared.json`과 해당 manifest의 5개 `*.prepared.mp4`. 최종 cloud output root는 **`/home/user/exoduser-edits/final-20261008`**. 소스 config에 manual/ancestor가 남아도 선택 shots에 없으면 가져오지 않음 |
| 실제 길이·native trim | `prepared.json`이 필수이며 없으면 build 중단. manifest의 `file`·`sourceDuration`이 원본 config와 선택적 `probe.json` 값을 덮어쓰고 모든 해당 native trim을 **0초**로 설정. 유효한 길이·파일 존재를 확인한 뒤 project 생성 |
| 선택 로고 | `/home/user/exoduser-fresh/logo.png`가 있을 때만 import. 없으면 native EXODUSER 텍스트와 HELL LORD 부제를 사용 |
| 폰트 | 코드 실제 `fontFamily="DM Sans"`. hosted 환경에 **DM Sans:400**, **DM Sans:700** 설치·폰트 검사 완료, fallback 없음. 샘플 화면 검수 결과는 §5 |
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
| parry | **148/30초** | 4초 / **4.933333–8.933333** | A 5초 / **4.933333–9.933333** | **9.933333초** |
| rage_slam | **29/30초** | 7초 / **0.966667–7.966667** | A 7초 / **0.966667–7.966667** | **7.966667초** |
| fire | **2초** | 8초 / **2–10** | B 8초 / **2–10** | **10초** |
| ice_orb | **29/30초** | 7초 / **0.966667–7.966667** | B 7초 / **0.966667–7.966667** | **7.966667초** |
| blackhole | **1초** | 7초 / **1–8** | B 7초 / **1–8** | **8초** |

위 표는 **보존한 원본 WebM의 구간**이며 native timeline의 trim은 모두 **0초**다. 준비 입력은 parry 5초, rage_slam 7초, fire 8초, ice_orb 7초, blackhole 7초로 먼저 잘라 인코딩했고 가로 parry만 그중 앞 4초를 사용한다. native 코드는 준비 입력의 `from + dur`·sourceDuration·30fps 경계를 검사한다. 자동 루프·부족분 정지 화면·임의 속도 변경으로 길이를 채우지 않는다. CFR30 변환은 원본 타임스탬프에 따른 프레임 선택·중복이며 움직임 보간이 아니다. 촬영 원본의 측정 렌더 FPS와 최종 30fps 인코딩 FPS는 별도 값이다.

| key | 원본 trim / 길이 | 이번 원본 video packet 끝 실측 | 준비 입력 / 검증 프레임 수 | 원본 구간 coverage |
|---|---|---:|---|---|
| parry | 148/30초 / 5초 | **9.954초** | `parry.prepared.mp4` / **150f** | 끝 298/30초 < 9.954초 |
| rage_slam | 29/30초 / 7초 | **7.977초** | `rage_slam.prepared.mp4` / **210f** | 끝 239/30초 < 7.977초 |
| fire | 2초 / 8초 | **10.966초** | `fire.prepared.mp4` / **240f** | 끝 10초 < 10.966초 |
| ice_orb | 29/30초 / 7초 | **7.974초** | `ice_orb.prepared.mp4` / **210f** | 끝 239/30초 < 7.974초 |
| blackhole | 1초 / 7초 | **9.974초** | `blackhole.prepared.mp4` / **210f** | 끝 8초 < 9.974초 |

이번 실제 5개 `*.original.webm`에는 format.duration이 없어 `max(video packet PTS + duration)`의 관측 끝값으로 원본 범위를 검증했다. 오디오 tail이나 remux format.duration을 원본 그림 길이로 대신하지 않았다. 이는 **이번 입력의 packet coverage 실측**이며, helper가 어떤 입력에서도 반드시 packet 감사를 수행한다는 보장은 아니다. 도구는 video stream duration → 사용 가능한 format.duration → packet extent 순서로 길이를 선택한다. 준비 출력은 각각 정확한 decoded frame count, 30fps, 원본 해상도, H.264/yuv420p·AAC를 검사한 뒤 5개 모두 통과할 때만 `prepared.json`을 발행한다.

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
| hosted 설치 확인 | CLI의 `--bitrate`, `/opt/fable/types/fable.d.ts`와 DM Sans 400/700 준비. 보정 입력으로 최종 3개 native 프로젝트 build·render 완료 |
| 소스 preflight | 보존 원본의 이번 video packet coverage 확인 → CFR30 H.264 CRF12 + AAC256kbps 준비 → 출력 framecount·metadata 검사 → `prepared.json` → native trim0·길이·파일 확인 → project |
| H.264 | depth8 native 기본 사용. 최종 마스터 3개 **H.264·30fps·정확한 프레임 수·전체 decode 정상** 확인 |
| AAC | 준비 입력은 원본 게임 오디오를 AAC256kbps로 인코딩. 최종 마스터 3개 **AAC stereo 48kHz·decode 정상** 확인. 신호 검사와 전체 청취는 구분 |
| bitrate | 20,000,000 / 12,000,000bps 목표. 고정 비트레이트나 정확한 파일 크기를 보장하지 않음 |
| native build / render | 최종 **Steam 37초 / Shorts A 16초 / Shorts B 26초 렌더 완료**. `--shards 1 --concurrency 1` 사용. 3개 프로젝트 check clean. 전체 decode·원본 시간 대조·샘플 화면 검수 PASS 범위는 §5 |
| 오디오 검수 | 게임 구간 신호 **max 0dB**, 마지막 CTA 구간 **max −91dB**, AAC decode 정상. **주관적인 전체 청취 미수행**. 신호 수치만으로 청취·클리핑·음량 승인 완료로 표시하지 않음 |
| Steam 공개 | **Steam Guard 휴대전화 인증 대기**. 기존 Steam 영상 교체·공개 상점 반영 미완료 |
| YouTube 공개 | **FDG 채널 로그인 대기**. 새 영상·Shorts 게시 미완료 |
| Discord | 기존 FDG 서버·첫 데모 공지 유지. 새 16초 영상 announcements 게시는 **Mac 잠금 해제 대기**, 실제 제출하지 않음 |

남은 검수 범위는 **전체 청취**이며, 플랫폼 게시는 로그인·인증·Mac 잠금 해제 후 실제 게시 URL/Steam 노출로 확인한다. 아래는 **최종 제작 구성의 재현 명령**이다.

```sh
higgsedit fonts add "DM Sans:400"
higgsedit fonts add "DM Sans:700"
python3 /home/user/marketing_prepare_20261008.py --input-dir /home/user/exoduser-fresh
EXODUSER_EDIT_TARGET=steam higgsedit build /home/user/marketing_edit_20261008.jsx
EXODUSER_EDIT_TARGET=shortsA higgsedit build /home/user/marketing_edit_20261008.jsx
EXODUSER_EDIT_TARGET=shortsB higgsedit build /home/user/marketing_edit_20261008.jsx
higgsedit frame /home/user/exoduser-edits/final-20261008/steam-master-37s 0.1 --out /home/user/exoduser-edits/final-20261008/parry-first.png
higgsedit render /home/user/exoduser-edits/final-20261008/steam-master-37s --depth 8 --bitrate 20M --shards 1 --concurrency 1 --out /home/user/exoduser-edits/final-20261008/EXODUSER_STEAM_37S_1080P30.mp4
higgsedit render /home/user/exoduser-edits/final-20261008/shorts-a-16s --depth 8 --bitrate 12M --shards 1 --concurrency 1 --out /home/user/exoduser-edits/final-20261008/EXODUSER_SHORTS_A_16S_1080P30.mp4
higgsedit render /home/user/exoduser-edits/final-20261008/shorts-b-26s --depth 8 --bitrate 12M --shards 1 --concurrency 1 --out /home/user/exoduser-edits/final-20261008/EXODUSER_SHORTS_B_26S_1080P30.mp4
```

whole-script build는 해당 프로젝트 timeline을 대체하므로 타깃별 독립 프로젝트를 사용했다. 원본 VP9/Opus WebM은 보존하며 prepared MP4를 새 media ID로 가져왔다.

## 5. 최종 렌더·원본 시간 대조 결과

최종 cloud 산출물은 `/home/user/exoduser-edits/final-20261008/`의 `EXODUSER_STEAM_37S_1080P30.mp4`, `EXODUSER_SHORTS_A_16S_1080P30.mp4`, `EXODUSER_SHORTS_B_26S_1080P30.mp4`다. **3개 렌더·기술·시간·샘플 화면 검수 완료**. 보존 파일·검수 이미지·QA JSON·SHA256는 [최종 납품 기록](VIDEO_DELIVERY_20261008.md)에 연결되어 있다.

| 최종 MP4 프레임 번호 n (0부터) | 출력 시각 n/30초 | Steam/A의 raw parry 원본 시각 | B의 raw fire 원본 시각 |
|---:|---:|---:|---:|
| 9 | 0.3초 | **5.233333초** | **2.3초** |
| 39 | 1.3초 | **6.233333초** | **3.3초** |
| 69 | 2.3초 | **7.233333초** | **4.3초** |
| 99 | 3.3초 | **8.233333초** | **5.3초** |

| 검수 대상 | 실제 결과 | 판정 범위·남은 검수 |
|---|---|---|
| Shorts A 최종 MP4 | 위 4개 프레임의 원본 대조 **MAE 1.69~1.98/255**, 30Hz 격자에서 source-time 오차 **0프레임** | 해당 패링 구간의 시간 진행 확인. 압축·리사이즈 후 픽셀이 완전히 동일하다는 의미가 아님 |
| Steam 최종 MP4 | 같은 4개 프레임의 원본 대조 **MAE 1.23~1.53/255**, 30Hz 격자에서 source-time 오차 **0프레임** | 해당 패링 구간의 시간 진행 확인. 모든 컷·전체 타임라인의 시각 승인으로 확대하지 않음 |
| Shorts B 최종 MP4 | 위 4개 프레임의 fire 원본 대조 **MAE 1.74~1.84/255**, 30Hz 격자에서 source-time 오차 **0프레임**. **9.3초 ice / 16.3초 blackhole / 24초 CTA 육안 PASS** | 최종 샘플 시간·화면 QA PASS |
| 최종 3개 기술 검사 | 전체 decode 오류 없음. Steam **1,110f**, A **480f**, B **780f**, 모두 **30fps·H.264·AAC stereo 48kHz** | 기술 QA PASS |
| 최종 화면 | **12프레임 contact sheet 육안 PASS**. 패링 폭발·피해 숫자·강타·불꽃·얼음·블랙홀·CTA·staged 표시 확인 | 기록한 샘플 화면 검수 범위. 모든 프레임의 주관적 시청을 수행했다는 의미가 아님 |
| 최종 3개 오디오 | 게임 구간 신호 **max 0dB**, CTA 구간 **max −91dB**, AAC decode 정상 | 신호·decode 확인 완료. **주관적인 전체 청취 미수행**, 청취·클리핑·음량 승인 PASS 주장 없음 |
| 공개 | Steam Guard 휴대전화 인증 / YouTube FDG 로그인 / Discord Mac 잠금 해제 대기 | Steam 기존 영상 교체·YouTube 신규 게시·Discord 새 영상 제출 미완료 |

## 6. 폐기한 초기 렌더·컨테이너 감사 이력

원본 MediaRecorder WebM에는 format.duration 메타데이터가 없어 첫 probe가 실패했다. GitHub 원본 SHA256를 먼저 검증한 뒤 클라우드에서 FFmpeg `-map 0 -c copy`로 WebM 컨테이너를 다시 작성한 중간 경로가 있었다. 이 remux는 VP9/Opus를 재인코딩하지 않았고 format 길이는 parry10.000, rage_slam8.010, fire10.984, ice_orb7.991, blackhole9.990초였다. **이 중간 컨테이너 길이를 최종 원본 coverage로 사용하지 않으며**, 최종 준비 입력은 §2의 실제 video packet 끝값·원본 구간에 따른 CFR30 H.264/AAC다.

직접 VP9 WebM을 가져와 6개 window로 렌더한 첫 MP4는 파일·코덱·프레임 검사 후 실제 화면 감사에서 **채택 폐기**했다. Shorts A 1.3초의 inset은 기대 source6.3초가 아닌 source5.033초와 픽셀 MAE1.65/255로 일치했고, 2.667초 window 경계에서 원본 위치가 점프했다. 초기 MP4와 초기 editable ZIP은 **납품·게시 대상에서 제외**하며 이력만 보존한다. 파일 생성·기술 검사 성공을 영상 PASS로 바꾸지 않는다. 도구 내부 원인 확정 주장도 하지 않는다.

준비된 패링 입력의 2초 시험에서는 native frame1.3초와 MP41.3초가 같은 실제 패링 폭발을 보여 보정 경로의 시간 진행을 확인했다. 이후 최종 3개를 새 media ID와 single-shard/single-concurrency로 렌더했고, Steam·A·B의 최종 MP4 대조 결과는 §5에 별도로 기록했다. 시험 성공과 최종 파일 감사는 별도 결과이며 전체 청취 승인으로 대신하지 않는다.

## 7. 문서 동기화 범위

2026-10-08 docs 전체에서 `marketing_prepare_20261008|marketing_edit_20261008|prepared.json|prepared.mp4|Higgsedit|steam-master-37s|final-20261008|CFR30`을 검색했다. 과거 9월 영상은 제작·납품 이력으로 보존한다. 새 37초 영상의 렌더 완료와 실제 플랫폼 게시 완료는 구분하며, 원본 provenance·staging은 신규 촬영 manifest와 함께 읽는다. 게임 아트/오디오 AI 공개 및 YouTube 합성 음악 공개 설정은 [채널 조건](EXPOSURE_CHANNELS_20261008.md)을 따른다.

현재 게시문안은 **staged high-level skill demonstrations**로 동기화되어 있다. 최종 산출물·검수 자료·플랫폼별 실제 게시 상태는 [납품·동기화 기록](VIDEO_DELIVERY_20261008.md)을 기준으로 관리한다.
