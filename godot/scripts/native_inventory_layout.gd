extends RefCounted
## TI-01: read-only inventory layout; no INV owner, coordinate writer or bag cap.
## Latest main game.html:15829-15834,16180-16210,16247-16256 (2026-10-20).
## BAG_MAX is supplied by the caller. Integer grid coordinates/dimensions are the
## native seam; unsupported non-numeric/fractional row input returns null/false.

const SLOT_READER = preload("res://port_modules/equipment_affix_reader/producer.gd")
const INV_COLS: int = 10
const MELEE_TYPES = ["sword", "dagger", "hammer", "mace", "club", "axe", "spear"]
const BOW_TYPES = ["crossbow", "repeater", "arcane"]
# Explicitly represents JS's omitted item=INV.bag[skip]; null means all categories.
# No BAG_MAX default is introduced just to make the item argument optional.
const ITEM_FROM_SKIP: int = -1

static func source_item_size(item: Variant) -> Variant:
	if not item is Dictionary:
		return null
	var slot: Variant = item.get("slot")
	if slot == "weapon" and MELEE_TYPES.has(item.get("wtype")):
		return [2, 2]
	if slot == "bow" and BOW_TYPES.has(item.get("btype")):
		return [2, 2]
	if (slot is String or slot is StringName) and SLOT_READER.SLOT_NAMES.has(str(slot)):
		return [2, 2]
	return [1, 1] # bonePart and unknown/missing slots (16187).

static func source_item_category(item: Variant) -> Variant:
	if not item is Dictionary:
		return null
	return "ossuary" if item.get("slot") in ["ossuary", "bonePart"] else "equipment"

static func source_inventory_rows(bag_max: int) -> int:
	return maxi(10, ceili(float(bag_max) * 4.0 / float(INV_COLS)))

## A fresh grid stores the ORIGINAL bag index; later records overwrite earlier
## cells exactly as _invGrid does. Do not omit skip here: the search compares it.
static func build_grid(bag: Array, skip: int, item: Variant, bag_max: int) -> Variant:
	var context: Variant = _context_item(bag, skip, item)
	if context != null and not context is Dictionary:
		return null
	var category: Variant = source_item_category(context) if context != null else null
	var rows: int = source_inventory_rows(bag_max)
	var grid: Array = []
	for _row in range(rows):
		var cells: Array = []
		cells.resize(INV_COLS)
		cells.fill(-1)
		grid.append(cells)
	for index in range(bag.size()):
		var entry: Variant = bag[index]
		if _source_falsy(entry):
			continue # JS !it: sparse/unoccupied records are not normal item fallbacks.
		if not entry is Dictionary:
			return null
		if entry.get("_gx") == null or entry.get("_gy") == null:
			continue
		if category != null and source_item_category(entry) != category:
			continue
		var gx: Variant = entry["_gx"]
		var gy: Variant = entry["_gy"]
		if not _finite_number(gx) or not _finite_number(gy):
			return null
		var size: Array = source_item_size(entry)
		for dy in range(size[1]):
			for dx in range(size[0]):
				var ry: float = float(gy) + dy
				var rx: float = float(gx) + dx
				if ry >= rows or rx >= INV_COLS:
					continue # Source upper-bound clipping; no coordinate repair.
				if ry < 0.0 or ry != floor(ry):
					return null # Source would throw on undefined g[ry].
				if rx >= 0.0 and rx == floor(rx):
					grid[int(ry)][int(rx)] = index
				# JS negative/fractional x is an Array property, not an indexed cell.
	return grid

## y then x; skip is an index, never item identity. Null means no space or an
## unsupported native input; neither result writes/repairs the input inventory.
static func find_space(bag: Array, w: int, h: int, skip: int, item: Variant, bag_max: int) -> Variant:
	if w <= 0 or h <= 0:
		return null
	var grid: Variant = build_grid(bag, skip, item, bag_max)
	if grid == null:
		return null
	for y in range(grid.size() - h + 1):
		for x in range(INV_COLS - w + 1):
			if _cells_allow(grid, x, y, w, h, skip):
				return {"x": x, "y": y}
	return null

static func can_place(bag: Array, index: int, gx: int, gy: int, bag_max: int) -> bool:
	if index < 0 or index >= bag.size() or not bag[index] is Dictionary:
		return false
	var item: Dictionary = bag[index]
	var size: Array = source_item_size(item)
	if gx < 0 or gy < 0 or gx + size[0] > INV_COLS or gy + size[1] > source_inventory_rows(bag_max):
		return false
	var grid: Variant = build_grid(bag, index, item, bag_max)
	return grid != null and _cells_allow(grid, gx, gy, size[0], size[1], index)

static func _cells_allow(grid: Array, gx: int, gy: int, w: int, h: int, skip: int) -> bool:
	for dy in range(h):
		for dx in range(w):
			var value: int = grid[gy + dy][gx + dx]
			if value != -1 and value != skip:
				return false
	return true

static func _context_item(bag: Array, skip: int, item: Variant) -> Variant:
	if item is int and item == ITEM_FROM_SKIP:
		return bag[skip] if skip >= 0 and skip < bag.size() else null
	return item

static func _finite_number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _source_falsy(value: Variant) -> bool:
	if value == null:
		return true
	if value is bool:
		return not value
	if value is int or value is float:
		return value == 0 or is_nan(float(value))
	return value is String and value.is_empty()
