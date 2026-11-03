# 전사 모듈 제작 도구

현재 native는 **A+B_G0_20261104 / BVH2회 미통과·중단**이다. B 단독본 검사 금지. `hybrid-contract.json`, `docs/engine/UNITY_CHAR_MODULAR_HYBRID_20261104.md`와 외부 REPORT가 최신이다. 이전 FBX/Resources prefab은 B 단독본이며 새 A+B로 검수하면 안 된다.

- `Warrior_Tripo_Parts.glb`: 채택한 A 원본107조각. B 머리/머리카락 이외 신체를 이 원본으로 교체했다. A 머리/머리카락3·27은 제외한다. `hybrid_contract.py`가 원 G0의25번호와 최신 브리프 축약번호를 대응한다.
- `build_hybrid.py`: 실제 native를 먼저 열어 B 머리/머리카락만 남기고 A105조각·G0 원 A포즈 골격을 조립. 원점/회전 정렬·25묶음·감면·망토30mm 실루엣 필터/10개 넓은 끝단. 원점0과 실제 관절 합격은 별개다. 텍스처를 생성하지 않는다.
- `geometry_metrics.py`, `test_geometry_metrics.py`: 평가된 world metre의 FromObject BVH.1mm/내포/좌표변환/1.5mm 경계 기준물 보정. 열린 면의 거리/무부호 접촉과 닫힌 체적의 표본 내부 깊이를 분리한다. 정점거리는 정확한 연속 침투 깊이가 아니다.
- `hybrid_poses.py`, `audit_hybrid.py`: A+B guard 뒤10개 수동 포즈×1,144쌍, 실제140/120도 확인, CSV/JSON/요약. attempt1→근거 있는 수정→attempt2까지만. 같은 attempt 재실행이나3차 호출을 거부한다. 실제 Animator/Unity 판정이 아니다.
- `repair_hybrid_inners.py`:1차 결과가 지목한 A 단단판의 빈 안쪽 면만1.2mm 보완, 삼각형 예산 유지. B 머리/머리카락·대검·일괄 배치 이동 없음.
- `render_hybrid_diagnostic.py`, `package_hybrid_report.py`: 기존2차 CSV의 접촉 쌍을 빨강으로 표시한 진단과 문서/계약. BVH 재검사·원본 저장·통과1x판 생성은 하지 않는다. 수치 미통과라 LOCK 나란히 최종판/텍스처/Unity 인수로 진행하지 않았다.

작업은 실제 `codex-rigpixel` worktree에서 한다. 원 전신 표면은 새 모델로 재사용하지 않는다. `Warrior_Modular.blend`는 고정된 저작 파일이며 Unity 자동 Blender 임포트를 막기 위해 Assets 밖에 둔다.

- `meshy_part.py`: 기존 총괄 DPAPI 로더 사용, 키 출력/저장 없음. 기본 dry-run. 30cr/파트, 전사500cr 상한, 공유 CALL.lock 배타 생성, POST 의도 선기록, 중복 제출 차단. 실차감/예약은 Git 밖 SPEND_LOG. shape FAIL은 기록을 남긴 명시적 수정1회만 가능하며 실패 비용도 상한에 포함한다. `run` 이후의 네트워크/다운로드 실패는 새 제출 대신 `resume`만 사용한다. 외부 잠금을 지우지 않는다.
- `split_views.py`: 브리프가 지정한 3면 시트를 정면/측면/후면 입력으로 분할한다. 디자인 합성/보정은 하지 않는다.
- `inspect_warrior.py`, `inspect_part.py`: Blender `-b` 계측/단독4뷰. 게임 검증을 대신하지 않는다.
- `modular_bind.py`, `assemble_warrior.py`: 새 파트 조립. 판금은 단일100%, 바탕 천/피부만 연속 스킨. 기본24뼈 이름/부모/행렬 보존 검사. 현재 저작 파일의 파트 목록과 미완료 상태는 외부 `assembly-current.json`과 REPORT에 기록한다.
- `test_meshy_part.py`: 키/네트워크 없이 비용·잠금·중복 방지 검사. TEMP/TMP는 I:의 자기 폴더로 지정한다.
- `test_rigid_bind.py`, `test_soft_bind.py`: 실제 평가된 Blender 정점으로 강체 거리 보존/A포즈 역스킨 왕복을 검사한다.

Blender 실행은 지정된 5.2.3 `-b -t 2 --python-exit-code 2 --python <파일> -- <인수>`만 쓴다. Python은 파일로만 넘기며 stdin 실행을 쓰지 않는다. 같은 테스트2회 실패면 멈추고 REPORT에 기록한다. PC Unity는 공용 실행기로 컴파일까지만, Player/빌드/실게임 판정은 하지 않는다.

Unity 연결과 비교판은 전체 파트·보조뼈·변형 렌더가 준비된 뒤에 한다. 단독 시트·모델·수치 검사로 완료나 디자인 PASS를 보고하지 않는다.
