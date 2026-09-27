# Steam 빌드 검토 반려 대응 — 2026-09-26

대상: EXODUSER: HELL LORD, AppID 4749590, 반려 BuildID 25482996. Steam Support는 2026-09-26에 언어 지역 표시, 데모 빌드, 콘텐츠 설문의 게임 내 구매 표기를 필수 수정 사항으로 통보했다.

## 2026-09-27 목적 정정: 공개 대상은 본편이 아닌 체험판

사용자는 제출한 데모 빌드를 Steam의 **체험판**으로 공개하려는 의도였다. 기존 AppID 4749590은 유형이 `게임`인 본편이므로, 이 AppID의 빌드 검토에서는 데모가 본편 빌드로 반려된다. 본편의 `관련 항목 보기` 화면에서 기존 연결 체험판이 없음을 확인한 뒤 `체험판 추가`로 별도 앱 **EXODUSER: HELL LORD Demo / AppID 5337590**을 생성했다. Steamworks의 새 앱 화면에서 유형 `체험판`, 상위 아이템 `EXODUSER: HELL LORD (4749590)`, 상태 `미출시`를 확인했다. 데모 상점 ItemID는 `1346593`, 데모 상점/개발자/베타 패키지는 각각 `1844321`/`1844319`/`1844320`이다. 별도 체험판 상점 페이지 옵션은 선택하지 않았다. 기본적으로 본편 상점에 데모 버튼을 표시하는 경로다.

기존 BuildID 25482996은 본편 앱 4749590에 있으므로 데모 앱 빌드로 자동 이전되지 않는다. 2026-09-27에 별도 체험판 앱 5337590에 빌드 25550483을 올리고 아래와 같이 두 검토를 요청했다. Valve 승인 전에는 공개 출시가 아니다. 승인 후 데모를 출시하고 본편 상점을 재게시하여 다운로드 버튼을 표시한다. [Steam 체험판 공식 문서](https://partner.steamgames.com/doc/store/application/demos).

### 체험판 AppID 5337590 제출 기록 — 2026-09-27

| 항목 | 설정·검증 결과 |
|---|---|
| 앱/디포/빌드 | 데모 AppID `5337590`, Windows 디포 `5337591`, 기본 브랜치 BuildID `25550483`, 디포 manifest `5366201260107331431`. Steamworks 빌드 기록에서 기본 브랜치 적용 확인 |
| 출하 파일 | `out/EXODUSER-steam-languages-20260923`의 검증된 데모 패키지. `EXODUSER.exe`, `package.nw/package.json` 진입점 `index.html?demo=1`, `_LOBBY_BUILD='demo'`, `_DEMO_MODE=true`. SteamPipe VDF는 `output/steam_demo_20260927/` |
| 플랫폼·실행 | Windows x64, `EXODUSER.exe` 기본 실행 옵션. Steamworks 기술 설정 게시 결과 `Publish to steam OK`, `Publishing successful!` 확인 |
| 상점·콘텐츠 | 별도 데모 상점 페이지 비활성, 본편 다운로드 버튼 경로. 시스템 요구 사항은 본편에서 상속. 콘텐츠 설문 `830019` 게시; 게임 내 구매 없음, 설명형 캡션 없음, 생성형 AI 사전 제작 자산 고지 |
| 이미지·아이콘 | 본편 상점 캡슐 3종과 라이브러리 자산 4종을 데모에 가져와 업로드. `img/icon-256.png`를 바로 가기 아이콘 및 자동 변환 앱 아이콘으로 업로드. Steamworks 상점·빌드의 모든 체크리스트에 `✔` 확인 |
| 출시 예정일 | 내부 예정 `2026-10-23 10:00 KST`, 고객 표시 `출시 예정`. 이 설정은 자동 공개 출시가 아님 |
| 상점 검토 | Steamworks 랜딩에 `체험판이 검토 대기열에 있습니다` 표시. 지원 티켓 `HT34B4RDR6PVC5` |
| 빌드 검토 | Steamworks 랜딩에 `체험판 빌드가 검토 대기열에 있습니다` 표시. 지원 티켓 `HT3GYNBPYJ5TQ8` |
| 공개 상태 | 데모 미출시. Valve 승인과 출시 절차 남음. 본편 AppID `4749590`은 데모로 재검토 요청하지 않음 |

검토 Notes에는 두 AppID의 관계, `Welcome to the Demo`/`Enter Demo`/`DEMO CHARACTER`가 의도된 체험판 문구라는 점, 언어 선택 및 한국어 자막 확인 경로, 첫 플레이 구역 후 체험판 종료, 게임 내 구매·설명형 캡션 부재를 기재했다. Steamworks의 검토 제출 날짜 표시는 타임존 변환으로 `2026-09-26`이지만 한국 표준시 작업일은 `2026-09-27`이다. 상점 승인과 빌드 승인은 각각 별도 검토이며, 승인 전 공개 또는 다운로드 가능 상태로 보고하지 않는다.

### 2026-09-27 체험판 지역 언어 선택명 보정

| 내부 코드 | 게임 내 선택명 | Steamworks 인터페이스·자막 | 제외한 지역 항목 |
|---|---|---|---|
| `es` | `Español (España)` | Spanish - Spain | Spanish - Latin America |
| `ptbr` | `Português (Brasil)` | Portuguese - Brazil | Portuguese - Portugal |

로비·시네마틱·캐릭터 선택 4곳(`index.html`)과 게임 설정 1곳(`game.html`)의 선택명을 조정했다. 번역 테이블·저장 코드·영상 자막 내용은 그대로다. `test/steamLanguageRegionLabels.test.js`에서 소스와 데모 패키지 선택명 5곳을 확인했다. 원본 `out/EXODUSER-steam-languages-20260923` 패키지의 두 HTML을 동일하게 패치하고 `language-package-manifest.json`의 크기·SHA-256을 재계산했다. 새 데모 빌드 업로드 및 검토 Notes 갱신은 별도 확인 기록을 추가한다.

Steamworks의 현재 빌드 검토 티켓 `HT3GYNBPYJ5TQ8` Notes에는 이미 `Spanish - Spain`/`Portuguese - Brazil` 대응과 데모 범위가 명시돼 있고 BuildID `25550483` 검토가 진행 중이다. 수정 패키지의 새 빌드는 아직 업로드되지 않았다. SteamCMD의 기존 설치 경로는 한글 경로 실행 제한으로 실패했고, 영문 경로 실행은 인증 캐시가 없어 `Invalid Password`로 종료됐다. 비밀번호를 프로젝트나 문서에 저장하지 않았다. 새 BuildID를 업로드·기본 브랜치에 적용하기 전에는 선택명 보정이 Steam 배포 빌드에 반영됐다고 주장하지 않는다.

| 항목 | 반려 당시 | 2026-09-26 처리 및 확인 |
|---|---|---|
| 스페인어 | 게임 내 단일 `Español` (`es`) 선택에 Steam 상점 스페인·중남미 2종 표시 | Steamworks 기본 정보에서 중남미 인터페이스·자막 해제. 스페인 인터페이스·자막 유지. 상점 변경 비교에서 해당 언어 삭제만 확인 후 `pubresult=success`로 게시. 전체 언어 표에서 `Spanish - Spain`만 표시 확인 |
| 포르투갈어 | 게임 내 단일 `Português` (`ptbr`) 선택에 Steam 상점 브라질·포르투갈 2종 표시 | 포르투갈 인터페이스·자막 해제. 브라질 인터페이스·자막 유지. 같은 게시에서 반영. 전체 언어 표에서 `Portuguese - Brazil`만 표시 확인 |
| 지원 언어 수 | Steam 상점 31개 지역 항목 | 29개 지역 항목. 인터페이스·자막 표시, 완벽 오디오 없음. 내부 선택 언어 29개와 지역 항목 수 일치 |
| 게임 내 구매 | 콘텐츠 설문에 체크됐으나 BuildID 25482996에 해당 콘텐츠 없음 | 콘텐츠 설문 `In-game purchases` 해제, 새 설문 ID 829793을 생성하고 게시. 설문 이력에서 829793 활성, 구 설문 797213 비활성 확인. 상점 베타의 Interactive Elements에 게임 내 구매 문구가 없음 |
| 데모 빌드 | `Welcome to the Demo`, `Enter Demo`, `DEMO CHARACTER`; 1-1 뒤 종료 | 미해결. 현재 기본/검토 브랜치에 배정된 25482996은 의도된 데모 빌드. 정식 게임으로 재검토 요청하지 않음 |

언어 변경 게시 전 View Diffs에 기존 출시일 초안(2026-12-01 → 2027-12-01)이 함께 있었다. 게시 전에 초안 출시일을 기존 공개 값인 **2026-12-01 10:00 KST**로 맞춰 View Diffs에 언어 2종 제거만 남긴 뒤 게시했다. 게시 후 기존 **2027-12-01 10:00 KST** 출시일 변경안을 미게시 초안으로 복원했다. 고객 표시 방식은 `Coming soon`이다.

## 빌드 검토 재요청 조건

현재 패키지 진입점은 `package.json`의 `index.html?demo=1`, 로비는 `index.html`의 `_LOBBY_BUILD='demo'`, 게임은 `game.html`의 `_DEMO_MODE=true`와 `_DEMO_LAST_STAGE=0`이다. 명칭만 바꾸면 실제 게임 진행 범위가 그대로 제한되므로 Steam의 정식 게임 검토 요구를 충족하지 않는다. 정식/얼리 액세스 출시 범위를 실제로 구현·검증하고 별도 출하 패키지로 빌드한 다음 새 BuildID를 기본 및 검토 브랜치에 배정해야 한다. 그때 Notes에 가능한 진행 경로와 테스트 계정을 기록하여 재검토를 요청한다. 현재 25482996의 재제출은 보류한다.

데모를 Steam에서 제공하려면 정식 게임 AppID와 연결되는 별도 데모 AppID 경로를 검토한다. 기존 4749590을 데모로 가장하거나 데모 제한을 숨기지 않는다. 이전 검토의 캡션 카테고리 해제는 유지한다. 컨트롤러 오버레이/분리 일시정지 및 추천 구성은 Valve가 필수 반려가 아닌 권장 사항으로 분류했으며 이 작업에서는 수정하지 않았다.

참고: [Steam 데모 문서](https://partner.steamgames.com/doc/store/application/demos), [Steam 언어 코드](https://partner.steamgames.com/doc/store/localization/languages), [Steam 출시 절차](https://partner.steamgames.com/doc/store/releasing).

## 2026-09-26 정식 모드 출하 가능성 시험

원본 공개 데모 설정은 건드리지 않고 `tmp/steam-full-probe-index.html`, `tmp/steam-full-probe-game.html`에 격리 복사했다. 복사본에서만 `_LOBBY_BUILD='full'`, `_DEMO_MODE=false`로 전환했다. 로컬 `server.cjs` 포트 3333에서 로비와 `?test=1&stage=2`(1-3), `?test=1&stage=3`(1-4), `?test=1&stage=34`(7-3)를 브라우저로 확인했다. 로비는 `OFFICIAL / All Chapters · No Level Cap`을 표시했고 세 스테이지는 전투 화면으로 진입했다. `?bosstest=1` 전용 보스 아레나도 열렸지만 일반 진행의 보스전 근거로 사용하지 않는다. 이 시험은 실제 Steam EXE, 신규 캐릭터의 정상 진행, 1-1부터 1-4까지의 연속 완주, 저장·재실행, 전체 35개 구역을 검증하지 않는다.

| 출시 게이트 | 관찰 | 판정 |
|---|---|---|
| 정식 모드 진입 | 격리 복사본에서 진입 가능 | 기술 일부 PASS |
| 정상 진행 | 단계별 직접 점프만 확인. 연속 완주·저장·재실행 미검증 | 미검증 |
| 1-3·1-4 시각 | 시작 카메라에서 비슷한 바닥·배치가 반복됨. 전체 맵과 다른 7개 카메라 위치는 미검수 | VISUAL VERDICT: RETOUCH |
| 7-3 최종 구역 시각 | 전투 시작 화면은 반복되는 평면 타일 바닥과 동일한 적 전조 배치 위주. 별도 지옥성 환경의 완성 판정 불가 | VISUAL VERDICT: RETOUCH |
| 전체 콘텐츠 | 소스에 35개 스테이지 데이터는 있으나 `_DUNGEON_SPEC`의 11·16·33은 `ready:false`, 후반 몬스터 데이터에는 placeholder 주석이 있음 | 정식 35구역 완성 주장 불가 |
| Steam 제출 | 공개 기본/검토 브랜치 BuildID 25482996은 여전히 데모. 새 BuildID 없음 | 재검토 보류 |

### MAP PRODUCTION REPORT — 1-3·1-4·7-3 시작 화면 점검 범위

| §23 항목 | 확인 결과 |
|---|---|
| STAGE | 1-3 (`si2`), 1-4 (`si3`), 7-3 (`si34`) |
| MASTER — silhouette / regions / main route / side spaces | 이번 시험에서 전체맵 계획과 이동 경로를 검증하지 않음 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / holes | 시작 카메라 화면만 관찰. 전체 외곽 판정 불가 |
| LARGE — assets / composites / overlap / repeat | 원본 에셋·합성 계약 미검증. 1-3·1-4 시작 화면 구성이 유사하고 7-3 시작 화면에는 대형 환경 덩어리보다 평면 타일이 우세함 |
| MEDIUM — connections / holes | 미검증 |
| GROUND — shadow / contamination / integration | 양쪽 시작 화면 모두 어두운 바닥 표시. 스테이지별 차별성 부족; 바닥과 구조물 연결의 전체맵 검증은 미완 |
| PLAYABLE — arenas / travel / breathing / threat / combat | `?test=1&stage=` 직접 진입 후 전투 HUD와 적 전조 표시 확인. 이동·보스·진행 완료 미검증 |
| LANDMARK — primary / secondary / tertiary | 시작 화면에서 스테이지 고유 랜드마크를 판정하지 못함 |
| CAMERA QA — START | 1-3·1-4·7-3 직접 관찰. 앞의 두 구역은 유사한 환경 구성, 7-3은 반복 타일 바닥 |
| CAMERA QA — EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 미검증 |
| TECH QA — route / collision / seam / performance | 미검증 |
| TECH QA — pageerror / 404 / loading | 두 스테이지 로딩 후 전투 화면 표시. 브라우저 로그에 로컬 서버 슬롯 로드 실패 후 로컬 저장 폴백과 Three.js 중복 로드 경고가 기록됨. 실제 패키지 검증 아님 |
| FILES — stage-owned / concurrent touched / unrelated touched | 맵·게임 소스 변경 없음. 시험 복사본만 `tmp/`에 생성 |
| GIT — staged / commit / push / deploy | 시험으로 인한 소스 변경·업로드 없음 |
| VISUAL VERDICT | **RETOUCH** — 시작 화면만의 제한된 판정이며 전체 스테이지 PASS 아님 |
| NEXT PASS | 1-3·1-4 각각 MASTER→OUTER→GROUND→PLAYABLE→LANDMARK 순으로 완성하고 8개 카메라·전투·경로·저장 QA 수행. 그 뒤 35구역 범위 또는 EA 범위를 정해 Steam 상점 설명과 빌드를 일치시킬 것 |

Steam은 본편 빌드를 상점 설명의 기능이 들어 있는 거의 최종 상태로 요구한다. [Steam 출시 절차](https://partner.steamgames.com/doc/store/releasing). 얼리 액세스 역시 현재 구매할 가치가 있는 플레이 가능한 게임이어야 하며 단순 기술 데모는 이르다고 안내한다. [Steam 얼리 액세스 기준](https://partner.steamgames.com/doc/store/earlyaccess).
