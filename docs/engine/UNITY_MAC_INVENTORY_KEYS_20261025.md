# Mac 소지품 키보드 이식 — 2026-10-25

기존 소지품 UI/상태/장착/해제 핸들러를 재사용하는 후속 단위. 선택·비교·상세·장착·해제를 키보드로 연결하며 아이템 생성·저장·전투 공식은 변경하지 않는다.

- 방향키는 실제 가방 좌표/장착 슬롯 배치로 인접 장비를 선택한다. Home/End는 현재 영역의 처음/끝, G는 가방/장착 영역 전환이며 영역별 이전 선택을 유지한다.
- C는 비교/선택 상세를 바꾸고 PgUp/PgDn은 상세 스크롤이다. Enter는 기존 장착/해제 핸들러만 호출한다. 레벨·가방 공간 제한은 기존 모델이 결정한다.
- 장착/해제 후 같은 아이템 선택을 따라가고 가방 항목이 화면 밖이면 자동 스크롤한다. 입력 유지·창 복귀 직후 연속 장착/해제를 차단한다. Tab/ESC 닫기는 키 해제 후 명시적 입력으로 처리한다.
- 조작 안내와 Enter 라벨을 추가한다. 마우스 선택/드래그는 유지하며 창 포커스 상실 때만 드래그를 취소한다. 단축키 G/C는 이번 네이티브 UI 편의를 위한 키이며 원본 웹 단축키와 동일하다는 주장은 하지 않는다.

새 모델33/33·실제 Player17/17 PASS. 화면/OS 키보드 검수는 아래 최종 결과를 따른다. 기존 통과군 재실행0. 기존 담당만 source/빌드/GPU/docs를 소유하며 새 팀·자동화·PC 재가동은 없다.

첫 source65150e51e: ARM64 errors0·Player17/17. CUA 실제 C 상세·Enter1.5초 장착/중복해제차단 확인. 최소화→Raise 후 제어가 계속 회색이고 새Enter가 반응하지 않아 OS복귀 인수 보류. 별도 CLI fixture에서만 app/host/menu/navigation/held 상태를 기록하는 진단을 추가해 원인을 좁힌다. 기존33/17은 반복하지 않는다. 장착 안내 마침표가 단독줄로 내려가는 이전 표시 문제도 명시적2줄로 교정하고 2해상도만 재캡처한다.

## 최종 인수

source `219c9d3fed61d4f21bf1faf5a000efe4729de36f`, GitHub branch 일치 확인 후 build-inventory-keys-focus 빌드 ARM64/errors0/1,533,227,893 bytes. 신규 모델33과 Player17은 기존 source65150e51e에서 완료했으며 진단/줄바꿈 변경 후 재실행하지 않았다.

| 검수 | 결과/근거 |
|---|---|
| 실제 macOS 앱 실행 | LaunchServices `open -n ...app --args`로 시작한 PID36214 단독 실행 |
| 최소화·복원 | CUA 최소화→Raise에서 window→dialog→window 전환. 로그 app/host/nav false→true, fence true→false 확인 |
| 복귀 후 해제 | 새 Return으로 불꽃 석궁 해제, 활 슬롯 비움·소지품10→11·해제 메시지 직접 확인 |
| 나머지 입력 | G 영역 왕복, Right 선택→녹슨 해머, C 상세, ESC 닫기→Tab 다시 열기 확인 |
| 표시 | 최초6PNG 확인, 장착 안내의 단독 마침표 문제를 명시적2줄로 수정한 1280/1920 PNG2장 추가 확인. 상세 캡처 일부의 회색은 fixture 입력 fence가 유지된 상태이며 실제 CUA 해제 뒤 정상 밝기 확인 |
| 실행 로그 | inventory-focus-launchservices-219c9d3fe.log에 Exception/Error 없음. CmdQ 정상 종료 후 일반 실행본 별도 열기 |

진단 결론: 실행 파일을 Popen으로 직접 시작한 PID36172에서는 Raise 뒤에도 Application.isFocused=false가 유지됐다. 같은 빌드를 macOS LaunchServices로 시작하면 복귀가 정상이다. 따라서 앱 입력 보호 로직을 완화하지 않았으며 직접 실행 방식의 현상을 게임 결함 수정으로 보고하지 않는다. 이후 OS 창 검수는 macOS 앱 실행 방식으로 한다. 초기 CUA 바인딩이 중복 일반 앱 PID36173을 시작한 것을 발견해 즉시 정상 종료했고, 단독 PID36214에서 최종 판정했다.

검수 산출물: `_out/UNITY-MAC-LOBBY-20261025/inventory-keys-65150e51e`(Player17/6PNG), `inventory-focus-launchservices-219c9d3fe`(수정2PNG), 같은 이름 `.log`(OS trace). 일반 실행에는 trace가 켜지지 않는다. 전체 언어/RTL·패드·정밀 마우스와 전투 저장은 이번 인수 범위가 아니다.
