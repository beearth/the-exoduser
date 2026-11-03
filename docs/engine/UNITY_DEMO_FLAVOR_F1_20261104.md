# F-1 staging 복구 — 02:10 경로 키 수정 후 중단 (2026-11-04)

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
