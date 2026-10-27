# Unity Mac 지원 설정 저장·복원 — 2026-10-26

> 아래 2026-10-26 인수는 당시 v1 빌드의 이력이다. 현재 v2 키바인딩 후보 상태는 [A15/A16 후속](UNITY_MAC_KEYBIND_PERSISTENCE_20261027.md)을 따른다. 같은 `native-settings-v1/settings.v1.json` 경로에서 JSON `version=2`를 기록하며 기존 v1은 기본 키 20개로 읽는다.

현재 native 메뉴가 지원하는 SFX/BGM 0–100, FPS 30/60/120/144/244/무제한(0), fullscreen bool만 저장한다. 신규 해상도·모드·설정은 추가하지 않았다. 최초 파일 없는 부팅은 기존 60/60/FPS120과 현재 화면을 유지한다. 기존 기본값 복원은 60/60/FPS0이고 fullscreen을 변경하지 않는다. FPS0은 실제 Application.targetFrameRate=-1, vSync=0이며 fixedDeltaTime=1/60과 전투값은 변경하지 않는다.

## 원본 대조와 보존 경계

취득된 `character-source-current/tutorial-source/game.html` SHA256 `d73d691989c1cb847cb500ce02ae81430c575fb90d732a5af131742c96d2c8c5`의 48878 saveSettings는 hellcave_settings에 binds/binds2/opt를 저장하고, 48914–48915는 SFX/BGM 변경 후 저장, 49400/49430은 부팅 OPT 및 BGM 적용이다. 49218–49241 Electron 화면 모드/해상도는 별도 hellcave_screen이다. 이번 작업은 현재 native 지원 항목에 한정한다. 웹/Godot/캐릭터/전투 저장은 읽거나 이주하지 않는다. 현재 full web 게임 전체 설정 이식 완료를 의미하지 않는다.

## 저장과 실패 처리

일반 실행은 Application.persistentDataPath/native-settings-v1 아래 settings.v1.json, settings.v1.bak, settings.lock을 사용한다. schema=exoduser.unity.settings/version=1/revision 및 네 지원 값만 저장한다. 기존 CharacterRosterStore의 배타 lease, revision 충돌 검사, 임시 파일 Flush(true), File.Replace+backup, codec roundtrip 검증 패턴을 settings 전용으로 좁게 재사용했다. CharacterRosterStore는 수정하지 않았다.

파일 없을 때 읽기만으로 디렉터리를 생성하지 않는다. 손상 데이터는 유효 backup이 있으면 복원하고 이후 명시 변경 저장 때 손상 원본도 별도 보존한다. unknown schema/version, 8192 bytes 초과, IO 오류는 자동 downgrade/덮어쓰기를 막는다. 유효 backup 없는 오류는 기존 부팅 기본값과 저장 문제 안내를 유지한다. 쓰기 실패는 직전 disk bytes와 현재 유효 session/host/UI 값을 유지하며, 다음 사용자 변경으로 재시도할 수 있다. 성공 저장 전까지 저장 실패 안내를 유지한다.

오디오/FPS는 기존 production host callback에 적용 후 저장한다. fullscreen은 한 coroutine owner와 generation으로 이전 요청을 무효화하고 실제 Screen.fullScreen을 안정 확인한다. UI와 disk는 요청 bool의 낡은 사본이 아닌 관측된 host bool을 사용한다. 호스트가 요청을 적용하지 못하면 현재 화면을 보존하고 안내한다.

## 일반 사용자 설정을 보호하는 QA 경계

### 2026-10-27 CoreTests 독립 컴파일 복구

`NativeSettingsStorageScope`의 A05 QA 신원 검사를 Unity API 없이 수행하도록 제품명·identifier를 호출자가 명시 전달한다. `NativeGame.SettingsPersistence`, 로비 캐릭터 저장소, A15/패드 QA 호출부는 실제 `Application.productName`·`Application.identifier`를 전달한다. 기존 4인자 `TryResolve`는 일반 저장·settings fixture를 유지하지만 A05 cinematic QA 요청에는 빈 신원을 전달해 거부한다. Core의 `UnityEngine` 직접 참조는 0개다.

| 경계 | 수치·조건 | 결과 |
|---|---|---|
| A05 QA 신원 | product `EXODUSER Settings QA`, identifier `com.fordeargamers.exoduser.settingsqa` 정확히 일치 | 불일치 시 `IoError`, 일반 개인 root로 fallback 없음 |
| QA 경로 | 절대 `-output`, 부모 `_out`, 폴더 접두사 `UNITY-MAC-A05-IO-`, `qa-output.marker` 정확히 `EXODUSER_MAC_A05_IO_V1\n` | 실패 시 저장소 열지 않음 |
| QA 플래그 | `--unity-cinematic-persistence-review`; settings fixture 또는 다른 `--unity-*-smoke/capture/review` 혼합 거부 | 기존 다른 QA의 settings I/O 금지 유지 |
| 저장 위치 | QA `<output>/native-settings-v1`; 일반 `<Application.persistentDataPath>/native-settings-v1` | 로비 roster도 같은 신원·marker 검사를 거쳐 QA `<output>/character-roster-v1` |
| v2 보존 | `cinSeen:true` boolean, 미지 `gpKeyMap` JSON, 기존 binds·binds2/설정 4값 | scope 수정은 codec/store 저장 공식에 손대지 않음 |

실측: 수정 전 `CoreTests.csproj` CS0103 2건, 수정 후 CoreTests **35/35 PASS·CS0103 0**. 독립 .NET 격리 회귀 **18/18 PASS**는 신원/marker/절대 root/혼합 flag 실패 폐쇄, 일반 경로 비생성, v2 `cinSeen`·미지 JSON 왕복, 손상 파일 쓰기 거부와 원본 bytes 보존을 검사했다. 영수증은 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-CORE-SETTINGS-FIX-20261027/`에 있다. 새 Unity Editor/Player 빌드 및 사용자 앱 실행 0회다.

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

각 phase JSON은 실제 targetFrameRate/vSync/fullscreen, SFX AudioSource.volume, lobby BGM AudioSource.volume 및 relative gain과 모델 일치를 판정한다. display/audio PNG 뒤 native movie/audio callback을 닫고 1초 drain 후 종료한다. 이 fixture는 production callback을 통한 scripted 좁은 인수이며 OS 키보드/마우스 입력이나 전체 pause/HUD suite를 대신하지 않는다. 실제 Player와 화면의 최종 인수는 아래 결과를 따른다. 새 OS 입력 검사는 반복하지 않고 기존 키보드 인수를 유지한다.

ROOT 실제 QA identity ARM64 빌드는 오류 0, write/read/write-failure host 검사는 각각 9/9/10 PASS였다. 최초 fixture PNG는 lobby blocking으로 설정 UI가 가려져 화면 인수에 실패했다. fixture만 오디오 측정값을 먼저 보존한 뒤 기존 SelectPreview/EnterNativeTest 경로로 입장하고 menu=true/Running=false/ShowSettings를 적용하도록 보정했다. 렌더 프레임 대기 및 preview 성공·!lobby.IsBlocking·SettingsOpen assertion 후 display/audio를 촬영한다. production scene/audio 동작 변경은 없다. ROOT는 수정 source의 defaults/invalid에서 실제 설정 UI를 추가 인수한다. 기존 순수/host 통과 검사는 반복하지 않는다.

로드 실패 후 사용자 변경 저장이 NotLoaded로 거부될 때 최초 InvalidData/UnsupportedVersion 등 구체 상태를 보존하도록 host flush를 보정했다. invalid fixture는 기본60/60/120 확인 후 실제 SFX25 변경·flush를 호출하여 원래 오류+문제 안내 유지/손상 primary bytes 불변/live25와 후속 실제 AudioSource gain 일치를 확인한다. unknown 파일 덮어쓰기 금지는 유지한다. 아래 최종 invalid 인수를 완료했으며 기존 통과 suite를 반복하지 않았다.

## ROOT 최종 인수

최종 제품 source `9d587ca157478c2a131eddb3c64346a08396a9a1`. 정상 identity ARM64 빌드 오류0 / 1,971,682,318 bytes. 일반 실행본은 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-SETTINGS-PERSISTENCE-20261026/build-settings-release/EXODUSER-Unity.app`이다. 기존 사용자 앱38141/48476/52157은 보존했고 새 일반본으로 자동 재시작하지 않았다. [전체 영수증](UNITY_MAC_SETTINGS_PERSISTENCE_ACCEPTANCE_20261026.json).

실제 별도 QA 프로세스6회·63/63 PASS: write9/read9/write-failure10은 d1733584b, defaults9는 캡처 보정 a8c9d6240, 손상13/범위초과13은 최종9d587ca15다. 최초35/45/FPS144/fullscreen=true가 종료 후 새 프로세스에서 실제 AudioSource gain·targetFrameRate/vSync·Screen.fullScreen까지 일치했다. Busy 실패는 disk bytes와 live SFX25를 유지했다. 실제 기본값 메뉴 callback은60/60/0(-1 host), fullscreen 유지와 disk revision2를 확인했다. 손상/범위초과는60/60/120으로 부팅하며 이후 SFX25 변경에도 오류 안내와 원본 bytes를 보존했다.

초기3회 PNG는 로비가 설정을 가려 시각 증거에서 제외했다. 보정 후 defaults 화면/소리2장 및 invalid 소리1장을 직접 열어 값·저장 성공/오류 안내·하단 버튼의 잘림/겹침 없음을 확인했다. 검수 경로 수정은 제품 입장 흐름 변경이 아니다. 새 OS 입력 PASS로 확대하지 않는다.

QA product/id와 Application.persistentDataPath는 정상본과 분리됐다. 일반 prefs는 전체 QA 이전 hash와 동일하다. 일반 캐릭터 JSON/lock은 별도 write/read 이후 readonly baseline부터 나머지 단계 이후까지 동일했다. 모든 phase는 명시 output만 사용했고 roster store를 열지 않는 assertion을 통과했다. 일반 settings 파일에서 테스트0, 기존 전체 suite·영상·물리 마우스 문제 재시도0.
