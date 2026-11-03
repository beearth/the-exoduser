# 전사 모듈 제작 도구

작업은 실제 `codex-rigpixel` worktree에서 한다. 원 전신 표면은 새 모델로 재사용하지 않는다. `Warrior_Modular.blend`는 고정된 저작 파일이며 Unity 자동 Blender 임포트를 막기 위해 Assets 밖에 둔다.

- `meshy_part.py`: 기존 총괄 DPAPI 로더 사용, 키 출력/저장 없음. 기본 dry-run. 30cr/파트, 전사500cr 상한, 공유 CALL.lock 배타 생성, POST 의도 선기록, 중복 제출 차단. 실차감/예약은 Git 밖 SPEND_LOG. shape FAIL은 기록을 남긴 명시적 수정1회만 가능하며 실패 비용도 상한에 포함한다. `run` 이후의 네트워크/다운로드 실패는 새 제출 대신 `resume`만 사용한다. 외부 잠금을 지우지 않는다.
- `split_views.py`: 브리프가 지정한 3면 시트를 정면/측면/후면 입력으로 분할한다. 디자인 합성/보정은 하지 않는다.
- `inspect_warrior.py`, `inspect_part.py`: Blender `-b` 계측/단독4뷰. 게임 검증을 대신하지 않는다.
- `modular_bind.py`, `assemble_warrior.py`: 새 파트 조립. 판금은 단일100%, 바탕 천/피부만 연속 스킨. 기본24뼈 이름/부모/행렬 보존 검사. 현재 저작 파일의 파트 목록과 미완료 상태는 외부 `assembly-current.json`과 REPORT에 기록한다.
- `test_meshy_part.py`: 키/네트워크 없이 비용·잠금·중복 방지 검사. TEMP/TMP는 I:의 자기 폴더로 지정한다.
- `test_rigid_bind.py`, `test_soft_bind.py`: 실제 평가된 Blender 정점으로 강체 거리 보존/A포즈 역스킨 왕복을 검사한다.

Blender 실행은 지정된 5.2.3 `-b -t 2 --python-exit-code 2 --python <파일> -- <인수>`만 쓴다. Python은 파일로만 넘기며 stdin 실행을 쓰지 않는다. 같은 테스트2회 실패면 멈추고 REPORT에 기록한다. PC Unity는 공용 실행기로 컴파일까지만, Player/빌드/실게임 판정은 하지 않는다.

Unity 연결과 비교판은 전체 파트·보조뼈·변형 렌더가 준비된 뒤에 한다. 단독 시트·모델·수치 검사로 완료나 디자인 PASS를 보고하지 않는다.
