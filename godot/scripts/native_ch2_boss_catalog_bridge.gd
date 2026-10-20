extends RefCounted
## BC2-02: combine the existing global manifest with the adopted CH2 catalog.
## No copied move/phase/combo tables or common combat formulas.
const Global = preload("res://scripts/native_ch1_boss_catalog.gd")
const Chapter = preload("res://scripts/native_ch2_boss_catalog.gd")

static func source_receipt() -> Dictionary:
	var receipt: Dictionary = Chapter.source_receipt()
	receipt["move_manifest"]=Global.source_receipt()["move_manifest"]
	return receipt

static func boss_for_stage(si: int) -> Dictionary:
	return Chapter.boss_for_stage(si)
static func move_by_id(id: String) -> Dictionary:
	return Chapter.move_by_id(id)
static func phase_by_index(phase: int) -> Dictionary:
	return Chapter.phase_by_index(phase)
static func combos_for_stage(si: int, phase: int) -> Array:
	return Chapter.combos_for_stage(si,phase)
