# AD2 야간 1건 — 승인 탭 전환음 Unity 누락 전달 (2026-10-31)

상태: **승인 원본 파일·연결 명세 준비 / Runtime 통합·Player·청음 미검증**.
이번 단위는 기존 AD2/SND-10의 `ui_tab`만 다룬다. 전체 음질 PASS나 데모 완료를 뜻하지 않는다.

## 조사 근거

| 항목 | 고정한 입력·결과 |
|---|---|
| 작업본 | `I:/exoduser-wt/codex-sound`, `codex/pc-sound-takeover-20261028`, 시작 HEAD `9a9067b295a050580cdb0d0321e137f2a16ceab9` |
| 실제 Git | `.git` → `G:/exoduser/.git/worktrees/codex-sound`, common-dir `../..`. 명령 범위 `safe.directory`만 사용 |
| 원격 H5 | `0d42e0cbcd86ba2ecb82e6fce2944dec82f89bf5`의 `sfx/ui/tab.mp3` |
| 원격 Unity | `a861d03037ead23aa022b9be4ae7f9d83156d09c` |
| 승인 | `picks_r3.json` 제출 `2026-10-28T01:44:57.297Z`, `ui_tab = _preview_r3/ui_tab_r3c_proc.mp3` |
| 원본 대조 | 사용자 선택 가공본과 원격 H5 파일이 동일 byte. 전달 파일도 동일 |
| 실제 누락 | 위 Unity SHA의 `NativePanelTabBar.Requested → NativeGame.OnPanelRequested`는 창을 바꾸지만 `ui_tab` 요청이 없다. Audio Resources 트리에 해당 키도 없다 |
| 로더·분류 경계 | `NativeFeedbackAudio`는 `Audio/SFX`, `Audio/RM1`만 LoadAll. 미등록 키의 기본 분류는 EnemyHit·spatialBlend .5이므로 파일을 추가하고 PlayNow만 부르면 UI 계약을 만족하지 못한다 |

이는 **소스·자산 누락 확인**이다. Unity를 실행하거나 실제 입력·소리를 관찰한 결과가 아니다. 기존 UI 작성자가 Runtime 연결을 담당한다.

## 승인 파일 전달

| 항목 | 값 |
|---|---|
| 전달 파일 | `sound-delivery/night8h-20261031/ui_tab.mp3` |
| SHA-256 | `3a693839af04190e6255f3098c92528d95812fa5b4a84e4be1a01a5bf66a1a4b` |
| 크기 | 3,386 bytes |
| 실제 디코드 길이 | 48kHz stereo 분석 출력 7,200 프레임 = 0.150000초 |
| 분석 출력 sample peak / RMS | −4.868 / −24.665 dBFS (48kHz stereo 변환 조건) |
| 네이티브 입력 true peak | ffmpeg `ebur128=peak=true`: −1.6 dBFS. 0.15초 파일이라 integrated LUFS는 유효한 판단값으로 사용하지 않음 |
| 클리핑·디코드 오류 | 48kHz 분석 샘플 ≥1: 0개, ffmpeg decode 오류 0 |
| 처리 | 재생성·EQ·압축·정규화·루프화 없음. 승인 byte 보존 |

## UI 작성자 인수 명세

상세 manifest: `sound-delivery/night8h-20261031/manifest.json`.

| 계약 | 값·조건 |
|---|---|
| 논리 키 / 후보 import 경로 | `ui_tab` / `Resources/Audio/UI/ui_tab.mp3` |
| 음량 / pitch / 공간 / loop | `.22` / `1` / 2D(`spatialBlend=0`) / false |
| 믹서 | 기존 `SFX/UI`, 기존 SFX 사용자 설정을 따름. 사용자 설정값을 바꾸지 않음 |
| 재생 | 이미 열린 창의 다른 상단 탭으로 **실제 전환 성공한 뒤** 1회 |
| 재생하지 않음 | 활성 탭 재클릭, 사망·firstPractice 거부, 미지원 id, 열기 실패, 최초 단축키 열기, Layout/Repaint |
| 중복 방지 | 전환 1회에 `ui_panel_open/close`나 다른 confirm을 겹쳐 내지 않음 |
| 구현 경계 | Runtime/공용 씬·입력·세이브·선택설정은 이번 사운드 작업에서 편집하지 않음. UI 작성자가 현재 코드에 맞춰 연결 |
| 연결 주의 | Requested에는 단축키 호출도 있다. 거기에 무조건 재생을 달지 말고, 전환 전후의 실제 열린 창을 확인. `Audio/UI`를 로딩하고 UI로 명시 분류하거나 UI 소유 전용 source 사용 |
| 인수 검수 | 첫 열기→다른 탭→활성 탭 반복→거부 상태 각각 요청 0/1/0/0, UI 버스·설정 0 무음·중복 0을 실제 Player에서 확인. 사운드 작성자는 실행하지 않음 |

## 먼저 조사한 루프 3개

클립을 실제 ffmpeg 디코드해 연결부 샘플·레벨을 분석했다. 클릭/클리핑 결함을 확정하지 못했으므로 수정하거나 같은 정상 입력을 반복 검사하지 않았다.

| 승인 클립 | 실제 길이 | peak dBFS | 경계 단차 dBFS | clipped samples |
|---|---:|---:|---:|---:|
| `amb_hell_forest_bed` | 9.5초 | −6.221 | −43.535 | 0 |
| `amb_druid_arena` | 9.5초 | −11.961 | −80.456 | 0 |
| `bgm_druid_boss` | 120.084917초 | −4.385 | −115.770 | 0 |

경계 단차 수치만으로 음악적 루프 접합·청감을 PASS하지 않는다. 증거는 `I:/EXODUSER-Storage/demo-art/sound/night8h-20261031/loop-audit.json`이며 원본별 SHA를 포함한다.

## 남은 게이트·보존

- 승인된 한 건의 준비 범위만 마쳤다. Runtime 연결은 UI 작성자 인수 대기이며 실제 입력·청음·Unity 빌드·통합·배포는 미검증이다.
- `pick_r4` 내려찍기 에코는 선택되지 않은 후보 상태 유지. 기존 BGM/SFX 원본 수정 0, 유료 생성 0, 서버 재시작 0, Unity/UPM/Library 기동·예약 0.
- 독립 분석 코드·원격 소스 snapshot·manifest·파형 산출물은 `I:/EXODUSER-Storage/demo-art/sound/night8h-20261031/`에 있다. 기존 보고는 `I:/EXODUSER-Storage/codex-takeover/sound/REPORT.md`에 덧붙인다.
