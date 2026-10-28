# PC Unity 전체 미리보기 — 2026-10-29

별도 브랜치 `codex/pc-preview-all-20261029`에 대기 후보를 통합한다. `unity/main`에는 반영하지 않는다. 빌드·캡처·로그 원본은 `I:/EXODUSER-Storage/unity-preview/`에 보존한다.

## 충돌 처리

| 파일 | 선택과 이유 |
|---|---|
| `NativeGame.cs` | 최신 공통 줄기의 `AimWorld()`를 보존해 3D 바닥 투영을 유지한다. 자동 병합된 `ExoInput` 전환은 보존한다. |
| `NativeKeyBindInput.cs` | 10-29 `4d7b82a0b`의 웹 마우스 1=중간·2=오른쪽 변환을 보존하고, 10-28 입력 후보의 `ExoInput.MouseDown/Mouse/KeyDown/Key`로 읽는다. |

## 검증 상태

통합 진행 중. 컴파일·Player·시각 판정은 아직 미확인이다. 원격 기준 SHA·포함 후보·최종 검증은 완료 시 갱신한다.

보스 충돌: `NativeGame.BossView.cs`는 최신 10-28 21:57 RB1-3 예고 뷰 초기화·해제를 채택하고, 오전 사운드 변경의 `sinkSounded.Clear()`를 함께 유지한다. 예고와 침강 소리의 상태 초기화가 모두 필요하다.

RM-1 충돌: `Rm1SliceBuilder.cs`의 FPS·캡처 진입부는 공용 job 서버용 `ExoArgs.Get()`를 보존하고, 최신 RM-1의 `AudioListener.volume = 0f` 무음 처리를 결합했다. 원시 프로세스 인자로 되돌리면 job 인자 전달이 끊어진다.

RM-B1 중복 예고 충돌: `NativeGame.BossView.cs`는 앞서 통합한 동일 예고 구현과 침강 사운드 초기화가 모두 있는 현재 통합본을 유지했다. 별도 해시 `00353dda9`도 정상 병합해 출처를 보존한다.
