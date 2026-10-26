# Unity Mac 초반 stage 무음 계측 — 2026-10-26

최초 checkpoint f25b35622는 QA fixture만 추가했다. ROOT baseline 출력 증거 후 NativeLobby.Begin의 `movie.Open(fdg_intro.mp4,false,false,false)`에서 muted 인자 하나만 true로 바꾼다. volume1/재생/영상 bytes 및 다음 단계는 그대로 유지한다.

## 확정 stage 계약

ROOT와 Claude Opus5.5의 읽기 전용 대조: 원본 index.html 605 FDG video muted, 580/4599 title muted, 629 cinVideo 초기 muted, 2273–2275 tryBGM의 splash/cinematic 차단, 2508–2509 Gate unmute. 원본 `docs/3.1 ui hud 디자인/스플래시_인트로_시퀀스.md:80`의 실버테일은 splash==2 `title_motion_hd_20260929.mp4` 반복 키아트다. 캐릭터 선택 cs_idle_silvertail 영상이 아니다. 캐릭터 선택·생성/별도 presentation decoder는 이번 범위에서 제외한다.

| stage | 영상 voice | 별도 음향/BGM |
|---|---|---|
| FDG fdg_intro.mp4 | muted | BGM 정지 |
| SplashTitle HD 또는 SD | muted | BGM 정지 |
| LobbyPage.Title intro.mp4 | muted, 첫 frame freeze | BGM 정지 |
| StartGate | intro unmute/volume .6 | 기존 enter SFX source1×oneShot2, prologue BGM .6 |
| WorldIntro 정본 steam | voice1 | BGM .22 |
| Lobby | 기존 loop muted | lobby BGM .65 |

BGM gain은 기존 effective BgmRelativeGain을 곱한다. fixture만 실제 callback으로 BGM45/relative .75를 선택해 Gate .45/World .165/lobby .4875가 유지되는지 본다. 이는 현재 세션 설정 gain 검사이며 disk restore나 제품 기본값 변경이 아니다. 영상 bytes/offset/자막/설정 저장·기본값/전투/전역 Listener·mixer를 변경하지 않는다. FDG audio track 있음, HD/SD track 없음, intro track 있음은 원본 매체 읽기 결과이며 런타임 청음 PASS가 아니다.

## QA 실행과 자료 의미

`NativeGame.IntroSilenceCapture.cs`와 NativeGame의 QA dispatch/legacyFixture 항목만 추가했다. 기존 `-settingsQa true` 별도 identity product `EXODUSER Settings QA` / identifier `com.fordeargamers.exoduser.settingsqa`에서만 실행하며 absolute output/phase 필수다. 정상 identity 또는 누락/상대 output은 fail closed다. suffix -smoke 때문에 일반 settings 및 roster store IO는 모두 비활성화되며 receipt에서도 두 store 경로/설정 store 미생성을 확인한다.

```sh
"$QA_APP_EXECUTABLE" --unity-intro-silence-smoke -output "$ABSOLUTE_Q/baseline" -intro-silence-phase baseline
# ROOT baseline 회수 및 별도 제품 수정 뒤
"$QA_APP_EXECUTABLE" --unity-intro-silence-smoke -output "$ABSOLUTE_Q/final" -intro-silence-phase final
```

FDG 재생→focus pause/resume→Begin 재진입→SplashTitle HD→SD direct probe→Title intro freeze→실제 StartGate→World→lobby BGM의 짧은 구간만 계측한다. FDG/SplashTitle/Title/Gate/World PNG를 남긴다. SD direct probe는 기존 fallback과 같은 `Open(SD,true,true,false)` 파라미터를 QA에서 직접 호출하며 정상 오류 fallback 경로 검수라고 주장하지 않는다. Gate 후 `Flow.TickGate(16,...)`의 기존 watchdog 경계로 World를 열어 다음 voice/BGM 복귀만 관측한다. 113초 완주나 자연 Gate 종료 증명이 아니다.

fixture는 lobbySmoke=true와 lobbyControlsSmoke=true를 함께 설정해 기존 Update의 매 frame focus=true 강제를 피한다. scripted SetPlaybackFocus(false/true)는 실제 OS focus 조작과 구분한다. 외부 OS 입력을 검증했다고 주장하지 않는다.

snapshot에는 실제 stage/filename, prepared/error/ended/isPlaying/frame/time 진행, audioOutputMode, Voice·music·startupAudio의 mute/volume/isPlaying/clip, 각 source 최대 peak와 sample-window RMS 최대값 및 관측창 중 wasPlaying, 전체 Listener peak/RMS를 기록한다. 새 stage에서 .15초 drain 뒤(Enter SFX 관측 Gate는 즉시) FDG/SplashTitle/Title의 AudioSource route·music/startup 비재생·Listener peak≤.0001 및 RMS≤.00001을 별도 silentOutputMatches로 판정한다. Voice source의 mute 전 peak는 무음 조건으로 강제하지 않는다. enter SFX는 Gate 첫 sample부터 실제 기존 PlayStartupEnter 호출 후 source로 관측한다. 출력 data는 Unity source/Listener 계측이며 기기 청음 인증이나 개별 혼합 음원의 식별 증명이 아니다. 오디오 route가 Direct이면 Listener 표본만으로 direct output 무음을 주장하지 않는다. 기본 AudioSource route 상태가 receipt에 남는다.

baseline은 harnessPassed와 contractPassed/observedDifferences를 분리한다. 현재 FDG의 Voice.mute=false 차이는 contractPassed=false와 해당 stage 차이로 남기며 harness 성공으로 무음 성공을 가장하지 않는다. final은 확정 stage의 mute와 실제 silent output 계약 일치를 추가 필수 검사한다. Gate/World/lobby는 BGM actual wasPlaying과 source/Listener positive peak를, Gate는 enter startup source의 wasPlaying/positive peak도 계약에 포함한다. World/Gate voice의 wasPlaying도 확인하되 원본 음성의 특정 순간에 발화가 있다는 가정으로 개별 voice peak를 강제하지 않는다. Gate .6/World1 voice와 BGM .6/.22/.65×현재 relative gain도 검사한다. 유음 lobby 이후 Begin 재진입 FDG도 별도 snapshot으로 남겨 무음 복귀를 검사한다. 마지막에 native movie/audio callback을 닫고 1초 drain 후 종료한다.

## 현재 인수 상태

Runtime + Editor Unity 참조 정적 컴파일 오류0. 새 Player/실제 재생·출력·시각 검수는 ROOT 대기다. 기존 영상 완주/설정/전투/전체 suite는 재실행하지 않았다. ROOT 소유 WORK_BOARD/PLAYABLE 및 타 WIP는 포함하지 않는다.

## ROOT 실제 baseline 회수와 제품 최소 보정

f25b35622 QA ARM64 빌드 오류0, harness19/19 PASS, contractPassed=false를 확인했다. FDG playing Voice.mute=false, 실제 Listener peak .1878839/RMS .0494865, resume peak .3682925, 유음 lobby→FDG 재진입 peak .1878839였다. HD/SD 키아트 및 frozen intro Title은 Listener0이었다. 이 실관측과 원본 muted 계약에 따라 Begin FDG Open의 세 번째 인자만 true로 수정한다. 실제 수정 후 무음 출력은 ROOT final 인수 대기다.

Gate snapshot은 time0→1.208/frame0→29, VideoPlayer.isPlaying=true/Voice.mute=false/volume.6이나 Voice.wasPlaying=false/peak0이었다. 실제 enter SFX peak2와 BGM peak .00843/volume .45는 관측됐다. World voice peak .53489/BGM .165, lobby BGM .4875와 positive output도 확인됐다. Gate 첫1.2초의 voice0이 원본 track 무음 구간인지 freeze 후 native 재생 문제인지는 아직 미확정이다. 따라서 Gate 제품 오디오는 수정하지 않았고, 해당 voice.wasPlaying 계약 실패를 전체 해결로 주장하지 않는다. 원본 발음 시작 시점의 읽기 전용 확인 후 필요한 QA 관측창 보강을 별도 결정한다.

ROOT 추가 읽기 전용 매체 대조: 원본/QA intro.mp4는 2,901,738 bytes로 동일하며 MP4 soun track의 mp4a/esds objectTypeIndication=0x6b(MPEG1 audio/MP3), AVFoundation audio tracks=0이었다. native 미지원 가능성이 있어 첫1.2초 무음만으로 설명하지 않는다. fixture snapshot에 VideoPlayer.audioTrackCount/controlledAudioTrackCount를 추가해 실제 런타임 인식을 기록한다. 아직 MP3 분석/최종 원인 판정 및 Gate 제품 수정은 대기하며 영상 bytes는 변경하지 않았다.

## 원본 Gate soundtrack의 native track0 복구

ROOT가 원본 MP4 stsc/stco/stsz packet 순서로 재인코딩 없이 추출한 raw MP3만 Resources/Audio/Lobby/intro_gate_original.mp3에 인수했다. 원본 intro.mp4는 2,901,738 bytes / SHA256 `0891964d17e19c9080fe07da97e7ee00e26918b5e51da8909b3d11e149f99620`로 보존된다. raw MP3는 128,731 bytes / SHA256 `0ce817e5bb7ce4a8c4fa1df51e92698bf28c896375615b6ab9aa085ff330cc7f`, MPG3 stereo44100 / 8.045688s다. ROOT afconvert PCM 분석의 첫0–.25s peak .0743, .75–1s peak .6045로 초반부터 유효한 원본 음원임을 확인했다. 기존 enter.mp3는 이 soundtrack을 대신하지 않는다. ROOT QA 분석 파일은 Git에 넣지 않는다.

NativeLobbyVideo의 prepareCompleted에서 filename이 정확히 intro.mp4이고 실제 native audioTrackCount==0일 때만 기존 Voice AudioSource에 이 clip을 연결한다. native Video audioOutputMode=None을 명시하여 외부 Voice와 native route가 겹치지 않게 한다. native track이 있거나 다른 영상이면 기존 route 그대로다. 새 일반 decoder framework는 만들지 않았으며 같은 파일의 작은 runtime polling component만 이 soundtrack을 추종하고 Close 즉시 callback을 분리한다.

원본 MP4 edit list media_time=1105@44100에 따라 source 위치는 video.time+1105/44100(0.0250567s)이다. 임의 delay를 추가하지 않는다. Title 첫 frame freeze는 voice 재생을 시작하지 않으며 muted를 유지한다. 기존 StartGate의 Play/Mute(false)/Volume(.6) 이후 영상이 실제 재생될 때만 같은 Voice를 재생한다. pause/focus/재개/seek/끝/Close/reopen에 동일 상태를 적용하며 재개는 현재 video 시각에 원본 offset을 더해 맞춘다. 영상 끝에서는 멈추고, clip의 실제 끝을 넘은 재생은 재시작하지 않는다. 다음 World/다른 영상으로 Open하면 이전 Voice와 poll을 분리해 누출·중복을 막는다. 영상 bytes/offset/설정/mix/default/다른 영상 오디오는 그대로다.

fixture는 usesIntroAudioFallback, actual clip, voice.time/timeSamples와 native track count를 기록한다. Video None + 명시적 external Voice(AudioSource)를 별도 audioRoute로 표시해 native route와 구분한다. frozen Title의 stopped/muted, Gate original clip positive output/포커스 pause와 resume, World/lobby/FDG에서 fallback 해제 및 종료 후 Player/Voice release를 검사한다. ROOT는 이전 baseline 이후 이 source로 FDG 무음+Gate 원본 복귀를 함께 final 인수한다. Runtime+Editor 정적 컴파일 오류0이며 실제 Player/출력 PASS는 아직 대기다.
