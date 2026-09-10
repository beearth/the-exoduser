# Mac 화면 고정 금색 띠 — 광선 단독 비교

> 실제 사용자 서비스는 **https://the-exoduser.vercel.app**이다. 이전 hell-smoky 배포/테스트 안내는 다른 프로젝트였다. [배포 대상 정정](../13출시·마케팅/PRODUCTION_TARGET_CORRECTION_20260910.md).

2026-09-10 사용자가 WebGL2 비교 배포 후에도 Mac 인게임에서 동일한 그래픽 문제를 보고했고, 띠가 **화면에 고정**된다고 확인했다. 기본 ray OFF 배포 후 사용자가 금색 띠 해소를 확인했다. 이후 빠른 이동 시 필터 사각 경계·약40FPS 하락은 별도 미해결 제보이며 [카메라 마스크 조사](CAMERA_MASK_COVERAGE_20260910.md)로 추적한다. 해당 Mac의 실제 백엔드 로그는 아직 받지 못했다.

| 조사 항목 | 코드 근거 / 현행 계약 |
|---|---|
| 화면 근거 | 사용자 스크린샷2026-09-10 165113.png에서 화면 전체 높이 금색 띠5개·HUD 정상 확인. GOD_RAY의 색·개수·단색 사다리꼴·카메라 비결합과 일치. 기본 OFF 배포 후 사용자 금색 띠 해소 확인 |
| 배치 | 부팅 때 광선5개(LOW3개), x0=((i+0.5)/5+(random−0.5)×.12)×W, 폭60~160px, tilt=(random−0.5)×W×.22 |
| 모양 | 단색 사다리꼴, y=−60~H×1.15, 상단 반폭w×.5/하단 반폭w×.9, soft gradient 없음. 카메라X를 적용하지 않음 |
| CH1 색/알파 | rc=#ffd98a, ra=.30. globalAlpha=ra×(.72+.28×sin(frame×.006+pulse))×a, a=.7~1.05 |
| 합성 | `_atmoDraw`가 screen 요청, 실제 합성은 해당 백엔드 프록시 구현을 따름. world 합성 후 HUD 전, PP_ON=true에서 실행. 이 경로는 OPT.atmos와 별도 |
| 기본 OFF | 파라미터 없음·ray=0·1 이외의 값이면 `_ATMDBG.ray=0`, 광선 path만 생략. 로비 진입·캐릭터 생성에서 URL이 재구성돼도 기본 OFF 유지 |
| 진단 ON | 정확히 ray=1일 때만 기존 광선 재현. 다른 입자·조명·블룸·세이브·맵 수치 유지 |
| 진단 로그 | 부팅1회 `[ATMOS] ray=0 또는 1 \| policy=ray-default-off-20260910`, 기본 진입도 로그 출력 |
| 테스트 | 수정 전 ray=0에서도5개 path가 그려져 FAIL. 수정 후0개, 나머지192개 입자 명령 동일·합성 상태 복원 PASS. 카메라 이동 시 광선 좌표 불변도 확인. rendererOptIn11+lightingTextureFreshness6 포함 총19 PASS |
| 맥 확인 | 기본 OFF 이후 사용자 금색 띠 해소 확인. ray=1 대조 실험 로그 없음. 이동 필터 사각형 재발·약40FPS 제보는 별도 조사 |

최초 비교 배포는 기본 ON이어서 일반 링크·로비에서 재진입하면 여전히 광선이 보였다. 스크린샷 확인 후 기본 OFF로 변경했다. 새 회귀는 파라미터 없음/0/false/true에서 path0개, 명시적1에서5개 및 카메라 비결합·입자 유지·상태 복원을 확인한다. Mac 금색 띠 해소는 사용자 확인이며, 이동 필터·전투·FPS 검증은 PENDING이다.

## 기본 OFF 배포 검증

| 항목 | 결과 |
|---|---|
| 코드 / 배포 | b591e9983 main 푸시, dpl_7YDNrYP1kSQD4eV9bYdnjXJYvhTp READY, the-exoduser.vercel.app alias |
| 실제 공개 game SHA256 | 5d0f9ba2fb57dce3f520d40ed60fae41c7b7c9a05e57dc254e297d28a3a9b73f, 고정 배포물과 일치 |
| Windows Chrome | ray 쿼리 없는 일반 초기화에서 _ATMDBG.ray=0, ray-default-off-20260910 로그, WebGL2 실제 컨텍스트, pageerror0 |
| 화면 검수 한계 | 초기 인트로를 넘긴 테스트 게임 캡처에 대사 오버레이가 남아 있음. Windows의 ON 캡처에서도 Mac 사진의 굵은 금색 띠는 재현되지 않았으므로 사진만으로 Mac 해결 판정하지 않음 |
| 증거 | captures/renderer_optin_20260910/ray-default-off-live.json, ray-default-off-live.png, ray-diagnostic-on-live.png |
| 저장 | 브라우저 내부 API fixture만 사용, 실제 사용자 슬롯 쓰기 없음 |
| 실기 | Mac 금색 띠 해소 사용자 확인. 이동 중 사각 필터·약40FPS 제보는 별도 미해결 |
