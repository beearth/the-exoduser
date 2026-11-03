# F-1 소유 staging 재시도 — 테스트 실행 전 차단 (2026-11-04)

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
