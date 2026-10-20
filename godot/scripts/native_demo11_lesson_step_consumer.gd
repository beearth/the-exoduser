extends Node
## PC 구현자가 상속하는 레슨 전용 포트. 전투/피해/자원 writer를 만들지 않는다.
## owner는 실제 world의 자손이어야 하며 단계별 lease 수명 동안 자신이 만든 자원만 복원한다.
## completed는 실제 PC 전투 증인이 원본 성공 조건을 만족했을 때만 반환한다.
## mock/constructor fixture의 completed를 실제 전투 인수로 보고해서는 안 된다.

func supports_lesson_step(_step: int) -> bool:
	return false

func begin_lesson_step(_step: int, _context: Dictionary) -> Dictionary:
	return {"ready": false, "reason": "pc_consumer_unavailable"}

func advance_lesson_step(_step: int) -> Dictionary:
	return {"ready": false, "reason": "pc_consumer_unavailable"}

func retry_lesson_step(_step: int) -> bool:
	return false

func restore_lesson_step(_step: int, _reason: String) -> void:
	pass
