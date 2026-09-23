# Mac 전투 중 약20FPS 제보 — 조사 중

사용자는 M5 Pro MacBook에서 몬스터가 조금 늘어나면 약20FPS까지 내려가며 Windows PC에서는 같은 문제가 없다고 재차 확인했다. 저사양·GPU 고장으로 판정하지 않는다. 앞선 약40FPS 제보의 후속이며, 사각 필터 수정 배포를 새로 로드한 상태인지와 실제 Mac U/D 값은 아직 받지 못했다.

| 항목 | 확인 / 범위 |
|---|---|
| 현재 배포한 필터 수정 | `254ef6f7d`, the-exoduser.vercel.app. 조명 캐시 카메라 갱신과 0-opacity 토치 생략. 이 수정으로 Mac 전투 FPS가 해결됐다는 증거 없음 |
| Mac 분기 조사 | `_bootRenderer`는 기본 WebGL2, `webgpu=1`만 WebGPU 시도. 몬스터 처리에 직접적인 `IS_MAC` 분기는 찾지 못함 |
| 별도 안개 분기 | `IS_MAC&&navigator.gpu`면 `_fogGLInit` 예약 생략. 실제 활성 renderer가 아니라 API 존재 여부를 검사하는 잔여 분기. 성능 저하 원인으로 확인되지 않아 변경하지 않음 |
| 기존 성능 LOCK | A/B/D1 수명·restore 처리, preserveDrawingBuffer/depth 등 변경 없음. 이번 신규 제보에 필요한 몬스터 밀도 측정만 수행 |
| 독립 측정 | `tmp/profile_enemy_density_20260910.py`, `captures/renderer_optin_20260910/enemy-density.json` |
| 측정 환경 | Windows Chrome headless / RX9070XT / WebGL2 / 1440×900. 초기 seed 고정, 로컬 API fixture. 몬스터10/40/80, 조건당 준비1.2초+측정3.5초. 실제 사용자 슬롯 접근 없음 |
| 그리기 호출 | 수정 후 조건별 약118/212/333회 매 프레임. GL drawElements+drawArraysInstanced만 계측. 몬스터·투사체 증가와 함께 늘어남 |
| 참고 결과 | 수정 전 각 조건 약239FPS, 수정 후 약229/239/236FPS. 수정 후 평균 U .127/.217/.298ms, D1.126/1.615/2.205ms. 두 실행 모두 pageerror0. 20FPS 미재현 |
| 비교 한계 | 단일 순차 실행·실시간 AI/효과 차이·다른 세션 CPU 부하가 있어 작은 시간차로 회귀 여부나 Mac 성능을 확정할 수 없음. Windows 결과를 Mac 해결 판정에 사용하지 않음 |
| 필요한 Mac 자료 | 느린 순간 화면 우측 FPS 표시의 E/P/pj와 U/D, 사용 브라우저·실제 renderer·렌더 크기. U/D는 JS 로직/그리기 제출 시간이며 GPU 완료 시간 전체가 아님 |
| 사용자 안내 | 기존 FPS 표시가 켜져 있으면 화면 오른쪽 중앙 FPS 아래 E/P/pj 및 U/D를 확인 가능. 아직 해당 값 요청에 응답 없음 |
| 다음 단계 | Mac U/D로 로직 비용과 렌더 제출 지연 구분. 둘 다 낮으면 GPU 완료·브라우저 프레임 지연을 추가 계측. 원인 확인 전 몬스터/공격 수 감소나 GPU 옵션 변경을 성능 해결로 배포하지 않음 |
| 현재 판정 | OPEN — Mac 전투20FPS 문제 미해결. 이번 조사에서 제품 코드 변경/배포 없음 |
