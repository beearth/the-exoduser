> **폐기(11-04 제작법 변경):** 이 문서의 가져오기·staging·lease 방식은 2연속 FAIL로 없앴다. 현행 저장 계약은 [UNITY_DEMO_FLAVOR_20261103.md](UNITY_DEMO_FLAVOR_20261103.md)의 "저장 계약". 아래는 당시 기록이다.

# F-1 staging 복구 — 02:20 보강 PC 검증 (2026-11-04)

**최신: GUID staging·소유 회수·승격 전 대조·경합 재시도 보강. 지정38/38·전체 계약6/6/동작64/64·두 프로세스7/7, PC 공용 컴파일348efe7a 1회 오류0·USER_SAVE0. Mac 미판정.**

## 02:20 보강 결과

- 최신 origin/unity/main6ef1899cb를 자기 브랜치에 병합했다(0029545ea). Desktop 교체3은 정확한db26d55f6에서 빌드1회 시도했으나 ReleaseMetadataSync가 sparse checkout에 없는 release-version.json을 읽다 실패했다(13f54a0b, exit2·컴파일오류0). 지정된 재시도0을 지켜 설치385e76ce1 유지, Player/디자인캡처0. 이는 별도 [교체 기록](UNITY_DESKTOP_CTO_SWAP_20261104.md)과 DEFECTS/REPORT에 기록한다.
- staging은 `<target>.legacy-import-<GUID N>`으로 매 호출 고유하다. catch는 자기 GUID 폴더만 정리한다. 구형 고정 staging과 형식이 맞는 버려진 GUID staging은 lease를 CreateNew한 호출만 회수한다. 기존 lease Open은 회수 소유로 보지 않고 기존 staging을 보존한다.
- `CaptureStores`로 store/파일 목록과 크기를 처음 기록하고, Move 직전에 source 재관측 및 staging을 각각 같은 목록/크기와 대조한다. 누락·크기차·복사 중 새 source 파일·store의 .tmp·.bak만 있는 store는 승격하지 않는다. 원본은 쓰지 않는다.
- `.DS_Store`·`Thumbs.db`·`desktop.ini`는 staging 정리 시 허용한다. 나머지 미지 데이터·하위 폴더·링크·활성 writer는 보존하고 실패한다. `NativeFlavorStorage`는 실패를 캐시하지 않아 같은 root/ns의 다음 TryResolve가 lease 경합 해제 후 재시도한다.
- 수정 전 확장 회귀는 기존 lease Open이 구형 staging을 지운 지점에서 RED였다. 수정 후 지정38/38, 전체 계약6/6·동작64/64. 마지막 원본 파일 집합/바이트 불변, 승격 전 누락/크기/source 목록변경/tmp 거부, 같은 TryResolve 경합 후 성공을 확인했다. 같은 실패 재발0.
- 독립 프로세스 fixture7/7: 한 프로세스가 실제 배타 lease를 잡은 동안 다른 프로세스의 import가 차단되고 staging을 보존한다. 해제 후 별도 프로세스가 회수/이전 성공, 원본/목적 bytes 일치·신규 lease 잔류0. Windows에서1회 실행했다.
- PC 공용 bin `PortVerification.CheckCorePresence` 1회 통과: job348efe7a, ok/exit0·compileErrors0·userSaveChanged0, Unity6000.6.7f1 및 종료 확인. errorLogs2는 컴파일 오류와 구분한다. source 변경 이후 Player/추가 빌드0.

Mac 검수 명령(.NET SDK8, 별도 격리 경로만 사용):

```text
dotnet run --project <repo>/unity/Tools/demo-flavor-tests/ImportConcurrentTests.csproj -- <repo>/unity/Library/f1-two-process-fixture
```

한 fixture가 lease-holder/importer 두 프로세스를 띄우며 실제 사용자 저장은 사용하지 않는다. Mac 파일 공유/메타파일 동작 및 Unity 런타임은 아직 미검증이다. Player UI 인자는 `--unity-build-flavor demo --unity-mute --unity-qa-sandbox <빈 절대 경로>`이며 sandbox는 legacy 이전을 생략하므로 위 직접 IO fixture와 구분한다.

증거: 레인 f1-tests/result.log·full-regression.log·concurrent.log, 공용 done/348efe7a.json·logs/348efe7a.log. 테스트 바이너리/fixture는 확인 후 정리한다.

---

## 02:25 이력 (아래는 당시 상태)

**최신 상태: 지정 회귀 30/30, 전체 flavor 계약 6/6·동작 58/58 통과. PC 공용 bin 컴파일 1회 통과(31e88306, 오류0·USER_SAVE0), Mac 런타임 검수 대기.**

## 02:25 실제시각 지시 수행

- CLAUDE.md 및 브리프 지정 절 확인, 최초 미커밋 0. fetch 후 origin/unity/main `5ce03758f57daca409cb18876e75ab48f6df705a`은 이미 병합되어 있었다.
- 원인: 실패 경로에서도 `FileMode.OpenOrCreate`가 만든 새 lease가 남아 남의 staging/저장 폴더 파일 집합을 바꿨다. 이전 기록의 "테스트 계약 불일치" 해석은 최신 CTO 판정으로 대체한다. 이는 제품 결함이며 보존 검사는 유지한다.
- 제품 수정: staging 파일 충돌은 lease 생성 전에 거부한다. `createLease` 플래그로 신규/기존 파일을 구분한다. 신규는 `CreateNew`와 `DeleteOnClose`를 사용해 이번 호출만 소유하고 닫을 때 제거한다. 기존은 `Open`·삭제 옵션 없음으로 열어 내용/파일을 보존한다. 생성 경쟁 시 CreateNew가 실패하며 다른 lease를 덮어쓰거나 지우지 않는다.
- 회귀 강화: 실패·성공 후 새 lease 잔류 0, 예상 밖 staging/활성 staging-file writer 거부 후 저장 폴더 전체 파일 집합/바이트 불변, 기존 nonempty lease 내용 보존을 추가했다. 실패했던 staging-file 보존 검사는 약화하지 않았다.
- 수정 후 지정 테스트 1회 `PASS 30 import-recovery checks`. 전체 회귀 1회 `contracts 6/6`, `PASS TOTAL 58`. 잠금→실패→staging 정리→해제→1회 재시도 성공, 원본3파일 및 모든 시나리오 종료 후 원본 파일 집합/바이트 불변을 확인했다. 이번 회차 재실패 0·두 번째 원인 수정 0이다.
- 전체 회귀의 standalone Roslyn에는 JSON 역직렬화 필드에 대한 CS0649 경고가 있으며 실행 실패는 없었다. 이는 Unity 컴파일 결과와 별도로 기록한다.
- PC 공용 bin `PortVerification.CheckCorePresence` 컴파일 1회 통과: `ok=true`, exit0, compileErrors0, userSaveChanged0, Unity6000.6.7f1, 프로세스 종료 확인. 작업ID `31e88306`, 로그 `I:/EXODUSER-Storage/unity-jobs/codex-unity-uisound/logs/31e88306.log`, 결과 `done/31e88306.json`, 별도 receipt `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/f1-compile-receipt.json`. errorLogs1과 라이선스 토큰 갱신 오류/종료 Curl42 로그는 컴파일 오류와 구분하며 전체 로그 오류0을 주장하지 않는다. 재컴파일하지 않았다.
- Player/Windows 빌드/바탕화면/Steam 변경0, 실제 사용자 저장 경로 접근0. 격리 fixture와 테스트 바이너리는 확인 후 정리하고 핵심 로그/결과를 남긴다. 컴파일이 자동 변경한 button_iron.png.meta의 filterMode/공백은 이번 작업 소유의 생성 변경임을 대조한 뒤 HEAD로만 원복한다.
- Mac 인계 인자: `--unity-build-flavor demo --unity-mute --unity-qa-sandbox <빈 절대 격리 경로>`로 로비 저장/재시작·완료 화면/상점 버튼을 검수한다. sandbox는 의도적으로 legacy 탐색/이전을 생략하므로 이 인자만으로 마이그레이션 검수를 대체하지 않는다. macOS 이전/lease 수명·잠금·중단 staging 복구는 Unity 테스트에서 전용 빈 fixture 루트만 NativeFlavorSavePaths에 직접 전달해 검수한다(실제 사용자 저장 사용 금지). PC 회귀/컴파일은 Mac 실파일·Player 판정을 대신하지 않는다.

---

## 02:10 이력 (아래는 당시 상태)

**최신 상태: 지정 테스트 1회·25검사 통과 뒤 `staging file preserved` 실패. 전체 회귀/PC 컴파일 미실행, 병합/Mac 검수 요청 보류.**

## 02:10 실제시각 지시 수행

- CLAUDE.md와 브리프 지정 절을 확인하고 미커밋 0에서 시작했다. fetch 후 origin/unity/main `5ce03758f57daca409cb18876e75ab48f6df705a`은 이미 병합된 상태였다.
- Snapshot 키를 만드는 한 곳에만 `Path.GetRelativePath(root,p).Replace('\\','/')`를 적용했다. 조회 키는 변경하지 않았다. NativeFlavorSavePaths/NativeFlavorStorage에는 상대 경로 dictionary 키 비교가 없어 제품 코드는 수정하지 않았다.
- 수정 후 지정 테스트 1회: 잠금 실패→catch staging 정리→해제 후 재시도 성공·원본3파일 바이트 일치, 구형 staging 복구, 잠긴 원본의 재실패 정리, 미지 내용 보존, 다른 importer 및 staging-file writer 보존/해제 후 복구, 기존 목적 저장/잔류 staging 불변, staging 파일 충돌 거부까지 25검사 통과.
- 다음 전체 파일 집합 보존 비교에서 실패했다. 읽기 전용 fixture 확인 결과 충돌 staging 파일은 8바이트 `preserve` 그대로였으나, Prepare가 충돌을 거부하기 전에 0바이트 `.EXODUSER-HELL-FULL.legacy-import.lock`을 새로 만들어 Snapshot 파일 수가 달라졌다. 원본 save 손상 증거는 아니며, 실패 경로의 lease 생성 부작용과 테스트의 전체 파일 집합 보존 계약이 불일치한다.

오류 원문:

```text
FAIL after 25 checks: staging file preserved
```

브리프의 "또 실패하면 멈추고 오류 원문을 남긴다"에 따라 제품/테스트 추가 수정·재실행·전체 회귀·PC 공용 bin 컴파일은 하지 않았다. 전체 시나리오 종료 시점의 원본 비교는 미도달이다. Player/Windows 빌드/바탕화면/Steam 변경 0, 사용자 저장 경로 접근 0.

다음 검토 대상: 충돌 staging 파일은 lease를 생성하기 전에 거부할지 결정하고, 원본 및 기존 파일 바이트 보존 검사를 유지한 채 검증한다. 로그 `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/f1-tests/result.log`, SHA는 REPORT 맨 위.

---

## 01:55 이력 (아래는 당시 상태)

**최신 상태: 공유 잠금 수정 및 핵심 이전/원본 보존 10검사 통과. 구형 staging 비교의 Windows 경로 키 오류로 전체 회귀 미통과, PC 컴파일 0회. 병합/Mac 검수 요청 보류.**

## 01:55 실제시각 지시 수행

- CLAUDE.md와 브리프 지정 절을 읽고 미커밋 0에서 시작했다. 최신 `origin/unity/main 5ce03758f57daca409cb18876e75ab48f6df705a`을 병합했다(병합 SHA `4b0bef66c290faa50925171fb6a864743251c5fa`).
- 테스트의 Snapshot 읽기만 `FileStream(FileAccess.Read, FileShare.ReadWrite)`로 바꿨다. 제품 코드의 원본 잠금/보존 정책은 바꾸지 않았다.
- 회귀 준비: 오프라인 Roslyn 실행기에 기존 flavor 전체 계약/동작 검사 모드를 추가했다(`recovery.cjs --full`). 기존 영어 호환 API 검사는 공통 병합으로 바뀐 최신 영어 번역을 따르게 했다. **전체 모드는 아래 중단 때문에 실행하지 않았다.**
- 수정 후 지정 테스트 1회: 잠긴 원본 이전 거부, destination 미생성, catch staging 정리, 잠금 중 원본 바이트 불변, 해제 후 1회 재시도 성공, 복사한 3파일 바이트 일치, 재시도 후 원본 파일 집합/바이트 불변, 구형 staging 회수 후 Prepare 성공까지 10검사 통과.
- 다음 비교에서 실패했다. Snapshot의 `Path.GetRelativePath` 키는 Windows에서 역슬래시인데 구형 staging 검사는 슬래시 리터럴 키로 dictionary를 조회한다. 제품 파일 IO 오류가 아니라 비교 코드의 경로 키 불일치다.

오류 원문:

```text
FAIL after 10 checks: The given key 'character-roster-v1/characters.v1.json' was not present in the dictionary.
```

브리프의 **"또 실패하면 멈추고 오류 원문을 REPORT에 남긴다"**에 따라 추가 테스트/테스트 코드 수정, F-1 전체 회귀, PC 공용 bin 컴파일은 하지 않았다. Player/Windows 빌드/바탕화면/Steam 변경 0, 사용자 저장 경로 접근 0. 원본 바이트 불변은 이번 격리 fixture의 잠금 실패 및 해제 후 성공 구간에서 확인했으며, 나머지 시나리오와 Unity 런타임까지 통과했다고 보지 않는다.

재개 첫 조치: Snapshot 키와 조회 키의 구분자를 통일한다. 원본 보존 비교는 유지하고 해당 테스트 1회 → 전체 회귀 1회 → PC 공용 bin 컴파일 1회 순서로 진행한다. 로그는 `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/f1-tests/result.log`.

---

## 이전 이어받기 중단 이력

**현재 상태: 구현 초안 보존, 회귀 미통과·PC 컴파일 0회. 병합/Mac 검수 요청 보류.**

## 새 스레드 이어받기 결과

- 사용자 지정 worktree/브랜치에서 최초 미커밋 0을 확인하고 CLAUDE.md를 읽었다. 시작 시 fetch한 `origin/unity/main c4b388903c54cab88d0fcddec9df5ef51eea9d48`을 병합했다(병합 커밋 `c8bf42cd8e1c19b87d33e26ee093e0477964ac07`). 번역 목록·종료 문구·Overlay·CHANGELOG 충돌은 최신 이야기 문구/번호를 따르고 기존 위시리스트 버튼/레인 기록을 보존했다. 공통 브랜치에는 push하지 않는다.
- NativeFlavorSavePaths: 이번 호출이 만든 staging을 catch에서 정리하고, 목적 폴더 없이 구형 staging만 남으면 정리 후 복사 1회만 시도한다. 기존 destination을 우선한다. namespace별 배타 파일 lease로 동시 importer를 거부하고, 정리 전 모든 staging 파일 잠금을 검사한다. 허용된 flat store의 json/bak 복사본만 정리하며 링크·알 수 없는 내용은 보존한다. 원본에는 삭제/쓰기 호출을 추가하지 않았다.
- 이전 회귀 초안의 미구현 marker/token 계약은 제거했다. 구형 marker 없는 staging의 실제 복구·잠금 실패 후 catch 정리·해제 후 1회 성공·원본 파일 집합/바이트 불변·기존 destination 및 다른 writer 보존을 검사하도록 변경했다.
- NuGet restore 초기화 문제를 재시도하지 않고, 프로젝트에 이미 쓰는 설치된 Unity .NET SDK/Roslyn 직접 컴파일 방식을 전용 `recovery.cjs`에 적용했다. 외부 패키지나 다운로드는 없다. 이는 격리 C# 파일 IO 테스트이며 Unity Player 실행이 아니다.

| 실행 | 실제 결과 |
|---|---|
| 1 (수정 전 RED) | 실행됨. `FAIL after 2 checks: F-1: catch removes failed attempt staging`으로 F-1 재현 |
| 2 (수정 후) | 잠금 실패·destination 미생성·catch staging 제거 3검사 통과. 다음 `Unchanged`에서 `File.ReadAllBytes` 공유 모드가 테스트 자체의 ReadWrite 잠금과 충돌해 실패 |

**사용자의 같은 테스트 2회 실패 시 정지 규칙에 따라 세 번째 테스트·추가 소스 수정·PC 컴파일을 하지 않았다.** 해제 후 재시도 성공과 원본 전체 바이트 불변, abandoned staging 복구 및 나머지 검사는 아직 실행되지 않았다. 원본 바이트 불변을 PASS로 보고하지 않는다.

재개 시 첫 조치: `Unchanged`가 잠긴 원본을 읽을 때 기존 ReadWrite 핸들과 양립하는 공유 모드를 사용하도록 테스트를 고치고, 위 전체 회귀를 통과한 뒤 PC 공용 bin 컴파일 1회. 현재 production 초안은 병합하지 않는다.

- 로그: `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/f1-tests/result.log`
- 상태: 같은 경로 상위의 `f1-validation.json` 및 `REPORT.md` 맨 위 SHA.
- Player 실행 0, Unity/Windows 빌드 0, PC 컴파일 0, 바탕화면/Steam 변경 0. 사용자 저장 경로 접근 0. 실행한 파일 IO는 자기 Library의 전용 fixture뿐이다.

---

## 이전 스레드 차단 이력 (보존)

**F-1 미수정. PC 컴파일·Player·빌드·Desktop 교체·Steam 작업 미실행.** 사용자 지정 동일2FAIL 정지 규칙에 따라 테스트 인프라 오류 두 번 뒤 멈췄다. 이 커밋은 회귀 테스트 초안과 도구 설정·차단 기록이며 구현 완료나 Mac PASS 요청이 아니다.

## 소유·공통 확인

- 같은 worktree G:/exoduser-wt/codex-unity-uisound, codex/unity-demo-flavor-20261103 @d3e37ff8e51cb69aef26bca3e573bdd1f5512435에서 시작. 최초 staged/tracked/untracked 변경0.
- fetch 후 origin/unity/main22aa8c30b020a2657c7352c74b2da59e0d8fa701의 CLAUDE·운영 매뉴얼§2·F-1 브리프를 읽었다. F-1 대상 NativeFlavorSavePaths/Storage는 자기 브랜치와 내용이 같았다. 브리프의 공통 병합 문구보다 최신 사용자 지시가 우선하므로 공통 병합을 하지 않았다. 공통 병합·배포·Steam·새 유료 승인은 PC Claude CTO local_7072229c 전용으로 유지한다.
- 소유 변경은 unity/Tools/demo-flavor-tests의 전용 ImportRecoveryTests.cs/csproj, global.json, NuGet.Config와 이 문서/CHANGELOG뿐이다. 기존 Desktop eaf 실패·385 원복 기록과 build-commit.json은 이번 작업에서 바꾸지 않았다.

## 실패 두 번 — 실제 F-1 테스트가 아님

| 순서 | 조치·관측 | 판정 |
|---|---|---|
| 1 | .NET 기본 SDK10.0.400, NuGet.targets782 GetRestoreSettingsTask: Value cannot be null (Parameter path1) | restore 실패, 테스트 Main 실행0 |
| 2 | 저장소의 기존 도구 관례대로 SDK8.0.301 고정·NuGet 외부 source 제거. 빈 APPDATA를 프로세스 한정 KnownFolder 경로로 보정, DOTNET_CLI_HOME은 자기 NTFS Library로 지정. NuGet.targets694에서 같은 path1 오류 | 동일 오류 재발, 테스트 Main 실행0. 규칙에 따라 중지 |

정확한 누락 NuGet 경로의 근본 원인은 아직 확정하지 못했다. SDK/프로젝트 설정을 변경한 뒤 두 번째 시도를 했으며, 세 번째 실행이나 다른 실행 경로 우회는 하지 않았다. 전용 결과 fixture가 생성되지 않았고 의미 있는 잠금/해제/재시도 결과도 없다. PC 컴파일로 옛 소스만 확인하는 일은 하지 않았다.

## 작성한 회귀 초안·설계 계약

ImportRecoveryTests.cs는 실제 임시 파일 잠금→실패→소유 staging 제거→해제 후1회 재시도 성공, 원본 전체 파일 집합/바이트 불변, 소유 표식 없는 staging 보존, 다른 import lease·다른 staging-file writer 보존, 소유 컨테이너의 외부 파일 보존, 기존 destination 우선 및 원본 불변을 검사하도록 작성했다. **아직 컴파일/실행되지 않은 초안이다.**

예정된 소유 증명 계약은 별도 배타 lease와 staging 내부 marker의 동일 임의 token·정규화 source/destination·허용 파일 목록이다. 원본 save·유효 destination은 삭제하지 않는다. marker 없는 옛 staging은 소유를 증명할 수 없으므로 자동 삭제하지 않는다. 현재 production에는 이 계약을 구현하지 않았으며 기존 영구 차단 결함이 남아 있다.

## 남은 순서

1. CTO가 NuGet path1 초기화 오류의 원인을 해결하고 다음 실행을 재개한다. 현재 동일2FAIL 한도에서 재시도하지 않는다.
2. 회귀 초안으로 기존 F-1을 실제 재현한 뒤 소유 증명을 갖춘 cleanup/recovery를 같은 NativeFlavorSavePaths에 구현한다. 새 코드 뒤 관련 테스트1회, PC 공용 bin 컴파일1회.
3. 원본·다른 writer·유효 destination 불변 및 소유 staging만 정리되는 것을 확인하고 자기 정확 경로 커밋/push. Mac 실파일 재시작 검수·공통 병합은 CTO 인계한다.

추가 환경 한계: G: 여유96,393,805,824B를 확인했다. 자기 Unity Library/PlayerDataCache6,388,547,307B의 정리를 검토했으나 실행 승인이 'blocked by policy'로 거부되어 삭제하지 않았다. 다른 삭제 경로로 우회하지 않았다. 새 대형 산출물0이다.
