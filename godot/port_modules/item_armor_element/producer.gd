extends RefCounted
## Read-only source INV.equipped.armor provider. No player/save/drop ownership.
## The reader returns the caller's CURRENT inventory, not an armor snapshot.

var _inventory_reader: Callable

func configure_inventory_reader(reader: Callable) -> bool:
	if not reader.is_valid():
		return false
	_inventory_reader = reader
	return true

func clear_inventory_reader() -> void:
	_inventory_reader = Callable()

func get_equipped_armor() -> Variant:
	if not _inventory_reader.is_valid():
		return null
	var inventory: Variant = _inventory_reader.call()
	if not inventory is Dictionary:
		return null
	var equipped: Variant = inventory.get("equipped")
	if not equipped is Dictionary:
		return null
	var armor: Variant = equipped.get("armor")
	# Return the original Dictionary identity. Never synthesize EL.P gear.
	if not armor is Dictionary or armor.is_empty():
		return null
	return armor

func get_armor_element() -> Variant:
	var armor: Variant = get_equipped_armor()
	return armor.get("el") if armor is Dictionary else null

func get_armor_identity() -> Variant:
	var armor: Variant = get_equipped_armor()
	return armor.get("id") if armor is Dictionary else null

func get_native_element_multiplier(attacker_element_id: int) -> float:
	return element_multiplier(attacker_element_id, get_armor_element())

static func element_multiplier(attacker: int, defender: Variant) -> float:
	# Source EL={P:0,F:1,I:2,D:3,L:4,H:5,E:6}; elMul(a,d).
	# Missing/null/string armor.el must not coerce to physical0.
	if not (defender is int or defender is float):
		return 1.0
	if attacker == 1 and defender == 2:
		return 2.0
	if attacker == 2 and defender == 1:
		return 2.0
	if attacker == 3 and defender == 4:
		return 2.0
	if attacker == 4 and defender == 3:
		return 2.0
	if attacker == 3 and defender == 5:
		return 2.0
	if attacker == 5 and defender == 3:
		return 2.0
	if attacker == 6 and defender == 4:
		return 2.0
	if attacker == 4 and defender == 6:
		return 2.0
	if attacker == defender and attacker != 0:
		return 0.5
	return 1.0
