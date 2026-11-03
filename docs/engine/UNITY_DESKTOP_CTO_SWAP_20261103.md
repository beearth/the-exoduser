# 바탕화면 Unity 수동 교체 — 2026-11-03 22:35 지시

바탕화면 실행본을 정확히 **unity/main 385e76ce1cfed6dc2a2b5401d1cdb7d4426e6d15**로 교체했다. 메타데이터 갱신 시각 2026-11-03 22:44:59, by=codex-fullrun(cto-swap). 이전 **9f0d00cf8**은 고정 build_prev 하나로 보존했다. 새 Windows 빌드는 1회이며 런타임 소스는 수정하지 않았다.

## 절차·소유 경계

- 실행 작업본 G:/exoduser-wt/codex-unity-uisound. 깨끗한 codex/unity-demo-flavor-20261103 @20f276b5c198211dd4641e488644ef1748b23413에서 지정 SHA로 detached checkout했다. 빌드·검수 뒤 같은 브랜치/SHA로 복귀했다. 이 문서 커밋은 배포 패키지의 소스와 별도다.
- 최신 origin/unity/main이 지정 SHA와 일치함을 fetch 후 확인했다. 공용 bin I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1만 사용했고 cto-swap 예외, --unity-mute, 숨은 데스크톱, QA sandbox를 적용했다. -remodel-scenes 1, -flavor full 포함.
- BuildLoop run.lock을 보유해 중복 교체를 막았다. 기존 스케줄러·설정은 변경하지 않았다. 교체 직전 해당 패키지를 사용하는 프로세스가 없음을 확인했다. 사용자 프로세스 종료 없음.
- 고정 I:/EXODUSER-Storage/unity-latest/build에 빌드. 기존 build_prev를 정리하고 실제 9f build를 build_prev로 이동했다. 실패 시 이 원본을 복원하는 절차를 준비했으며 이번에는 복원할 실패가 없었다.

## 같은 패키지 검증

| 검사 | 실제 결과 | 근거 |
|---|---|---|
| Windows 빌드 | Succeeded, build errors0, compileErrors0, USER_SAVE0, 6,729,700,708 bytes | Editor job ae89f8ac, desktop-build-receipt.json |
| M1 | 23/23, GUI repaint2118, AMD Radeon RX9070XT, 57477ms | Player d968660a, desktop-smoke/m1/m1-check.json |
| 홀드 스킵 | WorldIntro → Lobby, held3.0s | Player d111f632, desktop-smoke/intro/intro-keys.json |
| 지옥문 목표 | 실제 1-1 다리/필드 위 두 줄: 정화한 지역0/4, 처치0/26·심연 아귀 남음 | desktop-smoke/m1/caps/03-move.png 원본1600×900 직접 열람 |
| 사망 화면 진입 | 실제 Core revive=true/death=true, 실제 필드·보스 카메라, persistenceDisabled=true | Player b3f94c6c, desktop-smoke/death/death-screen-capture.json 및 death_07_panel_enter_1600x900.png 직접 열람 |
| 실행 보호 | 세 Player 모두 exit0, windows0, leftovers0, desktopClosed=true, USER_SAVE0 | 공용 _exec/done의 위 세 job 영수증 |
| 설치/바로가기 | build-commit.json SHA385e76ce1, 기존 lnk Target/Args/수정시각 유지, 실행 파일 존재 | desktop-shortcut-current.json / desktop-deploy-state.json |

Editor 로그의 errorLogs 집계3과 빌드/컴파일 오류 수는 별도다. 빌드 및 컴파일 오류0을 영수증에서 확인했다. Licensing token/Curl 종료 로그가 있으며 지정 세 Player는 모두 정상 종료했다.

지정 네 스모크의 배포 확인이다. 전체 UI 겹침·미술 품질·자연 1-1 완주는 이번에 재판정하지 않았다. 사망 PNG는 진입 fade 중간 프레임이다.

## 고정 근거 위치

- 메타데이터: I:/EXODUSER-Storage/unity-latest/build-commit.json
- 외부 보고서·상태·스모크 요약: I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/REPORT.md, desktop-deploy-state.json, desktop-smoke-summary.json
- Editor 로그: I:/EXODUSER-Storage/unity-jobs/codex-unity-uisound/logs/ae89f8ac.log
- Player 영수증: I:/EXODUSER-Storage/unity-jobs/_exec/done/d968660a.json, d111f632.json, b3f94c6c.json

바로가기는 C:/Users/심도진/Desktop/지옥의 길 (Unity).lnk, 대상 I:/EXODUSER-Storage/unity-latest/build/EXODUSER-Unity.exe, 인자 -force-d3d11 --remodel3d다. 설치 파일은 배포 예외로 유지하고 과거 시도별 빌드 폴더는 만들지 않았다. Mac의 전체 시각 검수와 알려진 UI 겹침 게이트 후속은 유지한다.
