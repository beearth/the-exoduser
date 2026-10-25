# Unity Mac 지원 설정 저장·복원 — 2026-10-26

현재 native 메뉴가 지원하는 SFX/BGM 0–100, FPS 30/60/120/144/244/무제한(0), fullscreen bool만 저장한다. 신규 해상도·모드·설정은 추가하지 않았다. 최초 파일 없는 부팅은 기존 60/60/FPS120과 현재 화면을 유지한다. 기존 기본값 복원은 60/60/FPS0이고 fullscreen을 변경하지 않는다. FPS0은 실제 Application.targetFrameRate=-1, vSync=0이며 fixedDeltaTime=1/60과 전투값은 변경하지 않는다.

## 원본 대조와 보존 경계

취득된 `character-source-current/tutorial-source/game.html` SHA256 `d73d691989c1cb847cb500ce02ae81430c575fb90d732a5af131742c96d2c8c5`의 48878 saveSettings는 hellcave_settings에 binds/binds2/opt를 저장하고, 48914–48915는 SFX/BGM 변경 후 저장, 49400/49430은 부팅 OPT 및 BGM 적용이다. 49218–49241 Electron 화면 모드/해상도는 별도 hellcave_screen이다. 이번 작업은 현재 native 지원 항목에 한정한다. 웹/Godot/캐릭터/전투 저장은 읽거나 이주하지 않는다. 현재 full web 게임 전체 설정 이식 완료를 의미하지 않는다.

## 저장과 실패 처리

일반 실행은 Application.persistentDataPath/native-settings-v1 아래 settings.v1.json, settings.v1.bak, settings.lock을 사용한다. schema=exoduser.unity.settings/version=1/revision 및 네 지원 값만 저장한다. 기존 CharacterRosterStore의 배타 lease, revision 충돌 검사, 임시 파일 Flush(true), File.Replace+backup, codec roundtrip 검증 패턴을 settings 전용으로 좁게 재사용했다. CharacterRosterStore는 수정하지 않았다.

파일 없을 때 읽기만으로 디렉터리를 생성하지 않는다. 손상 데이터는 유효 backup이 있으면 복원하고 이후 명시 변경 저장 때 손상 원본도 별도 보존한다. unknown schema/version, 8192 bytes 초과, IO 오류는 자동 downgrade/덮어쓰기를 막는다. 유효 backup 없는 오류는 기존 부팅 기본값과 저장 문제 안내를 유지한다. 쓰기 실패는 직전 disk bytes와 현재 유효 session/host/UI 값을 유지하며, 다음 사용자 변경으로 재시도할 수 있다. 성공 저장 전까지 저장 실패 안내를 유지한다.

오디오/FPS는 기존 production host callback에 적용 후 저장한다. fullscreen은 한 coroutine owner와 generation으로 이전 요청을 무효화하고 실제 Screen.fullScreen을 안정 확인한다. UI와 disk는 요청 bool의 낡은 사본이 아닌 관측된 host bool을 사용한다. 호스트가 요청을 적용하지 못하면 현재 화면을 보존하고 안내한다.

## 일반 사용자 설정을 보호하는 QA 경계

기존 모든 --unity-*-smoke/capture/review는 이 store의 읽기/쓰기를 비활성화한다. 새 --unity-settings-persistence-smoke만 absolute -output이 필수이며 누락/상대경로는 fail closed다. 별도 QA identity가 아니어도 fixture는 거부한다. QA 저장은 해당 output/native-settings-v1만 사용하며 캐릭터 roster는 열지 않는다.

Unity 자체 창 prefs도 격리하기 위해 PortVerification.Build의 `-settingsQa true`는 productName `EXODUSER Settings QA`, identifier `com.fordeargamers.exoduser.settingsqa`, identifier override=true로 빌드한다. finally에서 기존 product/id/override를 복원한다. 일반 build는 기존 identity를 사용한다. ROOT는 실행 전 QA Info.plist identity를 실제 확인하고 일반 prefs hash를 전후 비교한다. runtime receipt는 product, identifier, Application.persistentDataPath 원문, explicit settings directory를 함께 기록한다.

## 좁은 검증 결과와 ROOT 인수 명령

worker가 실행한 순수 .NET settings 모델/IO 검사: 61 PASS. 별도 프로세스 write 3 PASS, read 2 PASS. atomic/backup/손상·범위·unknown·oversize/lock·IO실패/revision충돌/legacy QA 비활성/출력경로 failclosed를 검증했다. 자료: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-SETTINGS-PERSISTENCE-20261026/model-results/`.

Unity 번들 Roslyn으로 Runtime + Editor C# 정적 컴파일 오류 0(기존 JsonUtility용 CS0649 경고). 이는 Unity Player 실행·시각·실제 fullscreen 인수가 아니다. 기존 전체 suite는 재실행하지 않았다.

ROOT가 QA identity 앱에서 아래 명령을 **각 별도 프로세스**로 실행한다. APP은 QA 빌드의 Contents/MacOS 실제 executable 절대경로, Q는 별도 인수 output 절대경로다. 사용자 일반 앱/설정 파일에서 실행하지 않는다.

```sh
"$APP" --unity-settings-persistence-smoke -output "$Q/roundtrip" -settings-phase write
"$APP" --unity-settings-persistence-smoke -output "$Q/roundtrip" -settings-phase read
"$APP" --unity-settings-persistence-smoke -output "$Q/roundtrip" -settings-phase write-failure
"$APP" --unity-settings-persistence-smoke -output "$Q/roundtrip" -settings-phase defaults
```

write는 35/45/FPS144, 연속 fullscreen false→true 후 저장한다. read는 새 프로세스에서 값과 실제 fullscreen=true를 검증한다. write-failure는 배타 lock을 잡아 Busy와 disk bytes 불변/실제 session25를 확인한다. defaults는 실제 pause navigation/기본값 callback을 호출해 60/60/0을 확인한다. invalid는 별도 `$Q/invalid/native-settings-v1/settings.v1.json`에 `broken`을 준비하고(backup 없이) 다음을 실행한다.

```sh
"$APP" --unity-settings-persistence-smoke -output "$Q/invalid" -settings-phase invalid
```

각 phase JSON은 실제 targetFrameRate/vSync/fullscreen, SFX AudioSource.volume, lobby BGM AudioSource.volume 및 relative gain과 모델 일치를 판정한다. display/audio PNG 뒤 native movie/audio callback을 닫고 1초 drain 후 종료한다. 이 fixture는 production callback을 통한 scripted 좁은 인수이며 OS 키보드/마우스 입력이나 전체 pause/HUD suite를 대신하지 않는다. ROOT의 실제 Player phase/화면/키보드 인수는 아직 별도 대기다. QA 후 동일 source normal identity build도 ROOT가 수행한다.

ROOT 실제 QA identity ARM64 빌드는 오류 0, write/read/write-failure host 검사는 각각 9/9/10 PASS였다. 최초 fixture PNG는 lobby blocking으로 설정 UI가 가려져 화면 인수에 실패했다. fixture만 오디오 측정값을 먼저 보존한 뒤 기존 SelectPreview/EnterNativeTest 경로로 입장하고 menu=true/Running=false/ShowSettings를 적용하도록 보정했다. 렌더 프레임 대기 및 preview 성공·!lobby.IsBlocking·SettingsOpen assertion 후 display/audio를 촬영한다. production scene/audio 동작 변경은 없다. ROOT는 수정 source의 defaults/invalid에서 실제 설정 UI를 추가 인수한다. 기존 순수/host 통과 검사는 반복하지 않는다.
