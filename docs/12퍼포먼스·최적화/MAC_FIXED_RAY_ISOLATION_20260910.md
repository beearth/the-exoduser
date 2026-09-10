# Mac 화면 고정 금색 띠 — 광선 단독 비교

> 실제 사용자 서비스는 **https://the-exoduser.vercel.app**이다. 이전 hell-smoky 배포/테스트 안내는 다른 프로젝트였다. [배포 대상 정정](../13출시·마케팅/PRODUCTION_TARGET_CORRECTION_20260910.md).

2026-09-10 사용자가 WebGL2 비교 배포 후에도 Mac 인게임에서 동일한 그래픽 문제를 보고했고, 띠가 **화면에 고정**된다고 확인했다. 해당 Mac의 실제 백엔드 로그·FPS는 아직 받지 못했다. 해결 판정은 보류한다.

| 조사 항목 | 코드 근거 / 현행 계약 |
|---|---|
| 우선 가설 | `_atmoDraw`의 GOD_RAY가 화면에 고정된 금색 띠처럼 보일 가능성. 사용자 화면과 직접 대조 전이므로 확정 원인 아님 |
| 배치 | 부팅 때 광선5개(LOW3개), x0=((i+0.5)/5+(random−0.5)×.12)×W, 폭60~160px, tilt=(random−0.5)×W×.22 |
| 모양 | 단색 사다리꼴, y=−60~H×1.15, 상단 반폭w×.5/하단 반폭w×.9, soft gradient 없음. 카메라X를 적용하지 않음 |
| CH1 색/알파 | rc=#ffd98a, ra=.30. globalAlpha=ra×(.72+.28×sin(frame×.006+pulse))×a, a=.7~1.05 |
| 합성 | `_atmoDraw`가 screen 요청, 실제 합성은 해당 백엔드 프록시 구현을 따름. world 합성 후 HUD 전, PP_ON=true에서 실행. 이 경로는 OPT.atmos와 별도 |
| 비교 OFF | URL `ray=0`이면 `_ATMDBG.ray=0`, 광선 path만 생략 |
| 비교 ON | 파라미터 없음·ray=1·다른 값이면 기존 ray=1. 다른 입자·조명·블룸·세이브·맵 수치 유지 |
| 진단 로그 | ray 파라미터가 있으면 부팅1회 `[ATMOS] ray=0 또는 1 \| policy=ray-isolation-20260910` |
| 테스트 | 수정 전 ray=0에서도5개 path가 그려져 FAIL. 수정 후0개, 나머지192개 입자 명령 동일·합성 상태 복원 PASS. 카메라 이동 시 광선 좌표 불변도 확인. rendererOptIn11+lightingTextureFreshness6 포함 총19 PASS |
| 맥 확인 | 같은 장면에서 ?webgpu=0&ray=0 / ?webgpu=0&ray=1 비교. 전자에서만 사라지는지 확인 필요. 이동·전투·FPS는 별도 미측정 |

최신 전체 변경의 커밋·푸시·배포 요청에 이 비교 옵션도 포함한다. 기본 광선은 실기 결과 전까지 유지하며, 진단 플래그로 문제 레이어만 분리한다.
