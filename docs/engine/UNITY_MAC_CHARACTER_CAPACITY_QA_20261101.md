# Mac 캐릭터 개수 제한 해제 — 실제 제품 인수 2026-11-01

## 현재 판정

캐릭터 목록 개수 제한과 임의64KiB 제한을 제거한 제품을 실제 Mac ARM64 Player로 인수했다. 일반 Mac 앱 설치·실행과 정상 제품명 Win64 패키지 빌드 완료. Windows 실제 실행과3840 화면은 통과하지 않았다. 아래 범위의231검사 PASS이며 전체 게임 이식/전투 진행 저장 완료 판정은 아니다.

| 항목 | 현재 계약 / 증거 |
|---|---|
| 제품 기반 | 공통 c3362d2df1a9abe964061c256cc528e9b9248b97 → 제품 a9ddfbffce87c9be34c9d2fd39626081ec7f3423 → 실제 빌드 입력/QA 2a0eea0001622e116c7c3efd5f6701f1432f6fa9 |
| 후속 커밋 범위 | 실제 검수 문서·영수증과 Tools/normalize-mac-app.py. 빌드한 Assets/Packages/ProjectSettings subtree는2a0eea00과 동일. 개인 facing-ground 소스를 공통으로 합치지 않음 |
| CharacterRoster | Capacity=5 및 count guard 제거. Ordinal HashSet 중복 검사. trim/UTF-16 2~8/금지문자/전사0만 생성/잠긴4직업/선택·삭제 계약 유지 |
| CharacterRosterStore | v1/2 읽기, 새 정상쓰기 version2. 읽기시 v1 원문 불변. 첫 v2 저장의 bak에 직전 v1 raw bytes 보존. 임의64KiB 상한 제거; 읽기배열 표현 한계 int.MaxValue 초과만 TooLarge |
| 저장 식별자 | schema=exoduser.unity.character-roster. characters.v1.json / characters.v1.bak / characters.lock 그대로. 이름 목록·선택만 저장; P/G/INV·웹/Godot/계정 저장 형식 이식 아님 |
| 기존 보호 | revision 충돌·배타잠금·원자교체·codec 왕복·손상 원문 보존·실패시 live 불변 유지. v1 구앱은 version2를 UnsupportedVersion으로 거부하여 오래된5개 backup 강등/덮어쓰기 방지 |
| QA 실행 | --unity-character-store-smoke -roster-phase capacity-* -output <절대 fixture> + --unity-qa-sandbox <별도 절대 sandbox>. 일반앱은 명시 fixture 없으면 정상 제품 흐름 |
| 설치된 일반 Mac 앱 | /Users/fordeargamers/Applications/EXODUSER.app, ARM64, 내부 실행파일 Contents/MacOS/EXODUSER |
| 일반 제품명 / id | EXODUSER · Unity 이식 검증판 / com.ForDearGamers.EXODUSER----Unity----------------- 유지. CFBundleExecutable만 ASCII EXODUSER로 정규화; 제품 표시명·gameData/app.info·저장 위치 유지 |
| Mac 정상 패키지 서명 | 비ASCII 메인 실행파일이 nestedCode로 다시 seal되는 문제 확인. ASCII 정규화 후 로컬 ad-hoc 서명 및 codesign --verify --deep --strict 성공. Apple Developer 배포서명/공증 완료라는 뜻 아님 |
| 정상 Mac 실제 실행 | 설치된 바로 그 앱에서 M1 23/23 +6개 재실행/입장19/19, 각 종료0. 실제 사용자 게임 프로필 대신 명시 절대 sandbox 사용 |
| Win64 정상 패키지 | build-win64-user/EXODUSER-Unity.exe, x64/Mono, BuildSucceeded/errors0, 정상 제품명·id 유지. Windows 실행/PC 설치는 별도 수신·실행 증거 전 미검증 |

## 실제 검사 내역

| 실제 Player phase | 검사 | 확인한 내용 |
|---|---:|---|
| capacity-create |25|6개 생성, 첫→여섯째 선택, scroll4, 검수6 직접 입장, v2 쓰기 |
| capacity-reload |19|새 프로세스에서6개·선택 복원, 여섯째 직접 입장 |
| capacity-promote |21|197B v1/5개 원문불변 읽기→여섯째 생성시 v2 승격, bak 원문동일 |
| capacity-promoted-reload |19|새 프로세스6개 복원과 첫 v1 raw backup 유지 |
| capacity-large |20|실제 Unity JsonUtility 5,000개 로드·마지막4999 선택/검수5000 입장 |
| capacity-large-reload |20|새 프로세스5,000개/전체 Ordinal 이름·선택 복원 |
| CharacterSmoke / DeleteSmoke |17 /9|기존 생성·거부·취소·삭제 회귀 |
| 기존 persistence 4개 새 프로세스 |7+3+3+3|생성·재로드삭제·삭제복원·빈목록·미래버전 보호 |
| 같은 QA 앱 M1 |23|Apple M5 Pro/Metal. headless=true/guiRepaints=0; GUI 시각 통과로 세지 않음 |
| 설치된 일반 앱 M1 |23|일반 제품/id의 실제 설치본, headless 범위 |
| 설치된 일반 앱 capacity-reload |19|실제1920×1080에서6개 복원·여섯째 입장 |
| **합계** |**231**|전부 PASS, 모든 소유 Player 정상 종료0 |

5,000개 seed89,018B → 실제 저장109,029B로64KiB 초과를 확인했다. v1 원본 bak SHA256=5c0b332c5da3b5cf1f57be0cccadaae75c3725f59701b60033a54d1eac0fcdda. API focus loss/return과 자동재개 금지를 검수했으며 물리 OS 입력 검수와 구분한다. 해당 fixture는 listener pause/volume0, DirectVideo0을 기록했다. 실제 출력 peak 샘플은 수집하지 않아 무음 peak 통과를 주장하지 않는다.

### 시각 판정

**VISUAL VERDICT: PASS — 1920×1080 캐릭터 목록 범위.** 실제 정상 앱의 검수5/검수6 카드·여섯째 붉은 선택·활성 새 캐릭터·개수6·입장 버튼과 QA의 검수4999/검수5000·개수5000 화면을 원본1920×1080 PNG로 확인했다. 두 카드의 이름/선택과 버튼 잘림 없음. 전투/맵 전체 시각 판정은 아니다.

3840×1080은 Metal surface 생성 기록이 있으나 직접 GUI 관측은 Unity 시작 로고에 머물렀다. **FAIL/미검증 유지**, 3840 roster PASS로 대체하지 않았다. 원인 확정0·그래픽 refactor0. 해당 본인 GUI 앱은 정상 Quit 후 종료0.

## 입력·빌드 재현 근거

| 항목 | 값 |
|---|---|
| Unity Editor |6000.6.7f1 ARM64, 기존 설치 유지. 한 번에 하나의 Editor/Player만 사용 |
| 원 제품 tracked 입력 |Assets/Packages/ProjectSettings 3,484경로/2,122,559,711B. manifest SHA256 355bf869ce3d16dd6c3c753784dfbddef9d606cf3ddc8ef286f7492f36159851 |
| 순수 archive |2,125,250,560B, SHA256 73aee4d7ac0c5ed0d208b717291234f0e2f49264bc36b728669e4e3edf61d506 |
| QA overlay |capacity QA partial +meta로3,486경로. private facing-ground 추가입력 제외 |
| 첫 빌드 실패 |C# 오류0이나 VerifyLobby에서 복원되지 않은 world intro mp4 누락. exit2/앱없음. 성공으로 덮어쓰지 않고 원 로그 보존 |
| 필수 비Git 미디어 |후보 Git recovery manifest를 권위로2개 mp4 원본 SHA 검증 후 복원. QA+미디어 총3,488필수경로, prebuild missing/extra/different0 |
| world_intro_v22b_steam.mp4 |102,204,634B / SHA256 3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f |
| warrior_story_v23_clean.mp4 |94,795,327B / SHA256 8b8248424b63d808dc225576fda44e39d459709963f97923ffaa38a51dba28ab |
| import 분류 |677meta GUID 유지,28material 직렬화/URP editor 정규화,1ProjectSettings migration,56개 generated meta. 이후 MakeScene/URP derived4파일+SceneTemplateSettings. C#/shader 변경0, 미확인 non-meta 입력0. 최종 consumed manifest3,545파일 |
| Mac QA/일반 build |Succeeded/errors0, 4,433,950,308B /4,433,950,396B(서명 정규화 전) |
| Win64 QA/일반 build |Succeeded/errors0, 4,461,953,167B /4,461,953,365B. 정상/QA Win64 Core·Runtime DLL byte동일 |
| Windows module |공식 Hub install-modules --version6000.6.7f1 --module windows-mono 설치완료. 설치pkg378,614,809B / SHA256 53376fa2c7e7ead4e8334b2eb299a68842edc7d34b80c18f9579206e7cc47dc6, Unity 서명/Apple 공증 신뢰 확인. Editor 교체/재설치/OS보안변경0 |

## 패키지 identity와 수신

| 정상 산출물 | bytes | SHA256 |
|---|---:|---|
| Mac EXODUSER 실행파일 |51,440|a85c5572458c52c83592ff1c772531411af0c351d8390e067111eb11d764566c |
| Mac Exoduser.Runtime.dll |1,432,576|88ebffc75675d616cecfe7b1efb87a2f7e170d9cfa17a8f76ea41cf25f9a77af |
| Mac Exoduser.Core.dll |700,416|efbd6a5079c5113bb69d4035b4b274c48b95edeec59bf9e5daad0f8474c89376 |
| Win64 EXODUSER-Unity.exe |667,136|9806abde4a406ed68647e9505852c49f6aa72a372f4f084e2aa2821affea57a2 |
| Win64 Exoduser.Runtime.dll |1,435,136|2284cee4c457fa87246f29cb7a03679e0c8effba1e7966b75cd92b86b3cff907 |
| Win64 Exoduser.Core.dll |700,416|1b5d2df494600ea98529fe2f25e7e4ffbd143ccc459919f5448c798cf353153c |
| EXODUSER-Mac-ARM64-characters-20261101.zip |2,160,652,882|5e001e6eb525dbb9881e42f5d5fd5983609bf863d52fea1cad2036fb46fe9711 |
| EXODUSER-Windows-x64-characters-20261101.zip |2,172,346,702|c1cfd4497f3a3a1e4a4bc126a32718675c0ce0bb5547f4b9fbad2523cef6d6e4 |

Mac ZIP은 재전개 후 strict/deep 서명·실행 권한·Core/Runtime SHA를 확인했다. Win64 ZIP의 exe/Core/Runtime도 원 빌드 SHA와 대조했다. 두 ZIP은2GiB 초과이며 단일 GitHub asset 업로드 완료로 기록하지 않는다.

배포물은 Mac 로컬 `_out/mac-character-unlimited-qa-20261101/delivery/`에 보관한다. PC 수신 승인 경로는 `I:/EXODUSER-Storage/character-capacity/20261101-unlimited/receiver/`. Mac 사설192.168.0.233:3334에만 bind하고 PC192.168.0.146만 허용하는 일시 read-only Node 서버가 정확한 Win64 ZIP 한 개의 GET/HEAD를 제공한다. listing/임의파일/쓰기/공용인터넷 bind/방화벽 변경0. PC 크기/SHA 수신 영수증 전에는 실제 수신 완료로 기록하지 않는다. 수신 후 이 프로세스만 정상 종료한다.

## 사용자 상태 보존과 한계

전후15,168항목/2,169파일을 비교했다. 실제 일반 제품 게임 세이브·native-settings JSON 변경0. 일반앱 검수 직전 원문 백업이 있는 제품 engine preferences는 defaults import 후 raw SHA와 cache semantics를 모두 원복 확인했다. 정상 프로필 게임 플레이를 임의로 시작하지 않았다.

**명시 예외:** `~/Library/Preferences/com.fordeargamers.exoduser.settingsqa.plist` 한 파일은 최초 크기828B/SHA만 기록하고 원문을 백업하지 않았다. 초기 SHA=a6321ae15151ba8a9c83a254738e457ed2a440ca8c0e47fcba5403c755aac8eb, 이후 SHA=16482d6244edc7c11a53408730c781be5ee9f4703dd79a4a407f14d3fd675e9c. 최초 bytes를 찾지 못해 초기 상태 정확 복구는 미확인이다. 알 수 없는 값을 추측하거나 삭제하지 않았다. 추가3840 시도는 별도 원문 백업으로 직전16482d62 상태까지 정확 복원했다. 모든 사용자 상태 불변/최초 QA plist 복원 완료라고 주장하지 않는다.

## 재현 도구와 증거 위치

`python3 unity/Tools/normalize-mac-app.py /절대/EXODUSER.app --backup /절대/고유백업.app --receipt /절대/새영수증.json`은 앱을 APFS 사본으로 먼저 보존하고 실행파일/CFBundleExecutable을 EXODUSER로 맞춘 뒤 로컬 ad-hoc 서명과 strict/deep 검증을 한다. 원 제품명/id와 Core/Runtime SHA 불변을 검증한다. `--check`는 읽기검증만 하며 backup을 요구하지 않는다. 설치된 일반앱과 ZIP 재전개본에서 --check를 실제 실행했다. 출력 영수증은 새 파일이어야 한다.

원 로그·입력 manifest·개별 phase 영수증·원본 PNG·보존 결과는 `/Users/fordeargamers/exoduser-wt/_out/mac-character-unlimited-qa-20261101/` 및 `manager-preparation/`에 있다. [기계 요약](UNITY_MAC_CHARACTER_CAPACITY_QA_20261101.json). 보호된 공유 UI checkout/HEAD/index에 checkout/reset/stash/merge를 실행하지 않았다. 기존 UI 담당의 private 작업은 별도 유지한다.
