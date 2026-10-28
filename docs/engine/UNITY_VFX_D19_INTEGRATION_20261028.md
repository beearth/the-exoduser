# VFX-D19 회복의 영역 Unity 표현 통합 — 2026-10-28

웹의 `holyDome` 게임 규칙·색은 변경하지 않는다. 이 문서는 `e505a211e`의 Unity 표현 변경을 `unity/main`에 통합하는 코드 기록이다. 웹 비교·사용자 결정의 원장은 `main:docs/5.1임펙트디자인/VFX_LEAD_MASTER_20261026.md` §VFX-D19다.

| 대상 | 코드 위치 | 값·동작 | 목적 |
|---|---|---|---|
| 문양 시트 | `Resources/Shaders/SkillAdditive.shader` | `_Flat` 경로의 가중치 `p.a × tintAlpha × max(p.r,p.g,p.b)` | 웹 `_tintHolyDome`의 밝기 제곱 알파 재현 |
| 문양 | `Runtime/NativeSkillView.cs` | `WebLitHolyDome = 0.11f`; 기존 `(.52 + .12 sin(3t)) × fade`에 곱함 | 웹의 후속 조명 패스 감쇠 근사 |
| 링 | 같은 파일 | `WebLitHolyDomeRing = 0.03f`; 기존 `(.64 + .18rp) × fade`에 곱함 | 웹에서 거의 보이지 않는 외곽 링 근사 |
| 겹침 캡처 | `Runtime/NativeGame.M1Check.cs` | `sim.Druid`가 있을 때만 정지 독탄 4개를 09b 컷에 임시 추가하고 제거 | 회복 장판 위 적 탄 가시성 확인. 필드에서 `sim.Druid == null`이면 해당 컷은 건너뜀 |

웹·Unity 기존 후보의 비교 수치(장판이 더한 G 평균 웹 2.5, Unity 2.4)는 위 main 원장의 기록이다. 새 병합 SHA의 컴파일·M1·화면 결과는 통합 검수 후 기록한다. `sim.Druid == null`인 일반 필드 M1의 09b 탄막 컷은 실행 증거로 세지 않는다.
