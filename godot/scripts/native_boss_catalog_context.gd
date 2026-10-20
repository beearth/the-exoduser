extends RefCounted
## Explicit read-only chapter data. Null retains the original CH1 contract.
## No global provider setting, actor connection, RNG or IO.
const Default = preload("res://scripts/native_ch1_boss_catalog.gd")
const _METHODS = ["source_receipt","boss_for_stage","move_by_id","phase_by_index","combos_for_stage"]

static func resolve(provider: Variant = null) -> Dictionary:
	if provider==null: return {"ready":true,"catalog":Default}
	if not provider is GDScript: return _failed("catalog_provider_required")
	var methods: Array = []
	for method: Dictionary in provider.get_script_method_list(): methods.append(method["name"])
	for name: String in _METHODS:
		if not methods.has(name): return _failed("catalog_method_missing:"+name)
	var receipt: Variant = provider.source_receipt()
	if not receipt is Dictionary or receipt.get("ready",true)!=true: return _failed("catalog_receipt_unready")
	var original: Dictionary = Default.source_receipt()
	if receipt.get("source_game_sha256")!=original["source_game_sha256"] \
		or receipt.get("global_move_count")!=original["global_move_count"] \
		or receipt.get("global_combo_count")!=original["global_combo_count"] \
		or receipt.get("move_manifest")!=original["move_manifest"]: return _failed("catalog_source_mismatch")
	return {"ready":true,"catalog":provider}

static func bind(token: Dictionary, provider: Variant) -> Dictionary:
	if provider!=null:
		token["_chapter_catalog"]=provider
		token["_chapter_catalog_path"]=provider.resource_path
		token["_chapter_source_hash"]=Default.source_receipt()["source_game_sha256"]
	return token

static func from_token(token: Dictionary) -> Dictionary:
	if not token.has("_chapter_catalog"):
		if token.has("_chapter_catalog_path") or token.has("_chapter_source_hash"): return _failed("chapter_context_missing")
		return resolve()
	var provider: Variant = token["_chapter_catalog"]
	var result: Dictionary = resolve(provider)
	if not result["ready"]: return result
	if provider==null or token.get("_chapter_catalog_path")!=provider.resource_path \
		or token.get("_chapter_source_hash")!=Default.source_receipt()["source_game_sha256"]:
		return _failed("chapter_context_mismatch")
	return result

static func _failed(reason: String) -> Dictionary:
	return {"ready":false,"reason":reason}
