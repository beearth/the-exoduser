최신은 **11-04 팔 비율 수정**: 위팔 0.180H·아래팔 0.145H·손 0.100H, attempt prop2 14포즈 FAIL 0(최대 1.958mm). 도구 `proportion_fix.py`·`measure_proportion.py`·`render_proportion_front.py`·`compose_proportion_board.py`, 계획 `proportion-plan.json`. 상세는 docs/engine/UNITY_CHAR_MODULAR_REST_GROWTH_20261104.md 하단.

# 전사 모듈 제작 도구

최신은 **11-04 Sonnet 마무리**: 03:20 소켓 한정 rest 증가분 기준을 그대로 두고 수정 뒤 attempt `sonnet1`에서 **실패 쌍 0·스카프/머리 0**(14포즈, 최대 gate 1.896mm). native 37,628tri·61뼈(couter 2 추가)·25묶음. 수정 내역·실측 숙임 각도·검사 표는 `I:/EXODUSER-Storage/char-modular/numeric/sonnet-summary.md`, `docs/engine/UNITY_CHAR_MODULAR_REST_GROWTH_20261104.md` 하단. 이 통과는 Blender 수동 포즈 표본 검사이며 Animator/Unity 실게임 판정이 아니다.

- `fix_sonnet_ab.py`: 11-04 수정 3종+가중치 누락 정점 1개(대검 소켓 2mm·elbow_l/r_couter·W13_A_077 띠 22mm·스카프 목 Head 10%). 후보 파일은 인수로 받은 경로에만 저장한다.
- `measured-bow.json`: Unity 에디터 배치(`WarriorClipNeckMeasure`)로 잰 컨트롤러 클립 neck·Head 최대 앞숙임. `head_bow_measured` 포즈가 읽는다.
- `export_unity.py`: A+B 24묶음→한 draw mesh(흑철 단일 100%), 텍스처 없는 A는 단색 타일, 대검은 월드 정렬 별도 FBX, `Socket_Weapon_R`(칼날=-up)·`Grip_L` 소켓 생성. `export_texture_input.py`: A포즈 rest 24묶음 회색 GLB.
- `audit_rest_growth.py`: attempt 라벨 `sonnet1`/`sonnet2`(같은 라벨 재실행·세 번째 거부), `head_bow_measured` 포즈, 닫힌 머리 AABB 밖 표본은 내부로 세지 않는 가드. 기준값(3mm/2mm·소켓 허용표) 변경 없음.

- `cleanup_0320.py`: B 머리/머리카락 고정·스카프 내부 면 삭제/고리 여유/neck-Spine 가중치·국소 이상 면 보완. `inspect_cleanup.py`에서 잔류 선 원인4.38m solidify spike 확인.
- `inspect_local_topology.py`, `finalize_cleanup_topology.py`: spike 제거 후5변 구멍, A104 접촉 내부 shell을 원 A 외면과 cap으로 고쳐4대상 manifold 확인.
- `rest_contact_policy.py`, `test_rest_contact_policy.py`: 명시16소켓 허용표, 스카프 rest 면제 금지, 대검 범위. 열린 면을0/PASS로 치환하지 않는다.
- `audit_rest_growth.py`: 원래 triangle ID로 rest 집합을 저장, 새 겹침의 폐체적 표본 깊이 증가분. Head4포즈 스카프 절대검사 포함.1차→한 번 보완→2차까지이며 현재2차 실패로 재실행 거부.
- `refine_0320_contacts.py`:1차 원인 면 곡률/3판 접촉 보완.2차 결과를 무시하고 더 호출하지 않는다. `inventory_0320.py`와 `package_0320_report.py`는 이미 끝난 원본/측정값의 읽기·인수용이며 새 테스트/저장을 하지 않는다.

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
