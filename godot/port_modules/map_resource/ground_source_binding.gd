extends RefCounted
## Isolated CH1-1 ground SOURCE-BINDING body (MAP port, R12).
## Binds the ENGINE-first-supplied real soil/litter Texture2D into the EXISTING
## ground stack (ground_provider R5 -> ground_surface R4 -> producer/litter R1/R2
## materials) through an explicit sourceReady gate. It is the "actual binding body":
##   body 1  source_ready  — gate: the ENGINE texture is bindable ONLY when it is an
##                           import-present, loadable Texture2D with real dims. A raw
##                           PNG on disk WITHOUT a Godot import (.import sidecar) is
##                           NOT ready (ResourceLoader.exists is false) -> ready=false,
##                           and NO copy/hash/import is done here.
##   body 2  bind          — consume the ORIGINAL producer/litter material + the R4
##                           pass structure (pass 0 soil / pass 1 litter); bind only
##                           source-ready textures; apply the effective-parent z.
##   body 3  update/terminate — owner refresh + teardown (delegates to the surface).
##
## The effective-parent z (soil -3002 / litter -3001) is a CENTRAL decision: it is
## applied ONLY when a central z decision supplies it (REFERENCE values below are the
## recorded source truth, NEVER invented/applied unprovided). No MainWorld input/
## placement/geometry; the original pass 0/1 geometry + relative z are unchanged (the
## base z is set on the surface container only, so pass z 0/1 derive -3002/-3001).
## Existing baked chunks are not toggled. zones_mask/SVG/zoneblend remain HELD (no
## access). No soil/litter/ground/provider success suite or PNG is re-run.

const Provider := preload("res://port_modules/map_resource/ground_provider.gd")

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-ground-source-binding-r12-20261014"

## Recorded source truth for the ground container's effective-parent z. These are a
## CENTRAL decision — recorded here for reference ONLY; never applied unless a central
## z decision passes them in. soil is the base; litter = base + the pass-1 relative z.
const REFERENCE_EFFECTIVE_Z := {"soil": -3002, "litter": -3001}

const KINDS := ["soil", "litter"]

var _provider

func _ensure() -> void:
	if _provider == null:
		_provider = Provider.new()

## The texture to bind for `kind`: a central/ENGINE-supplied override takes precedence
## (read-only, caller-owned — the "ENGINE 첫공급 source texture" input), else the
## EXISTING product resource via the R5 provider (null when absent; nothing minted).
func _resolve_source(kind: String, source_textures: Dictionary) -> Texture2D:
	if source_textures.has(kind) and source_textures[kind] is Texture2D:
		return source_textures[kind]
	_ensure()
	if kind == "soil":
		return _provider.load_soil()
	elif kind == "litter":
		return _provider.load_litter()
	return null

## Body 1 — sourceReady gate. Ready ONLY for an import-present, loadable Texture2D
## with real (>0) dimensions. import-absent / null / 0-sized -> ready=false + gap; no
## copy/hash/import performed.
func source_ready(kind: String, source_textures: Dictionary = {}) -> Dictionary:
	var tex := _resolve_source(kind, source_textures)
	if tex == null:
		return {
			"kind": kind, "ready": false,
			"gap": {
				"status": "import-absent / canonical-missing -> ready=false (NOT minted, NOT imported here)",
				"required": "an ENGINE-imported res:// Texture2D for '" + kind + "' (raw PNG without a Godot import is invisible to ResourceLoader)",
			},
		}
	var w := tex.get_width()
	var h := tex.get_height()
	if w <= 0 or h <= 0:
		return {
			"kind": kind, "ready": false,
			"gap": {
				"status": "texture has no real dimensions (0-sized) -> ready=false",
				"required": "a decoded ENGINE texture with w>0 and h>0",
			},
		}
	return {"kind": kind, "ready": true, "dims": [w, h]}

## Apply the CENTRAL effective-parent z decision to the surface CONTAINER only. The
## pass 0/1 relative z is left intact (z_as_relative), so soil derives the base and
## litter derives base+1. Absent decision -> not applied + gap (never invented).
func _apply_effective_z(surface, z_decision: Dictionary) -> Dictionary:
	if z_decision.is_empty():
		return {
			"z_applied": false,
			"gap": {
				"status": "no central effective-parent z decision -> z NOT applied (not invented)",
				"required": "a central z decision {soil:<base>} (or {soil,litter}); source reference is " + str(REFERENCE_EFFECTIVE_Z),
			},
		}
	var base: int = int(z_decision.get("soil", z_decision.get("soil_base", REFERENCE_EFFECTIVE_Z["soil"])))
	var litter_z: int = int(z_decision.get("litter", base + 1))
	var consistent := litter_z == base + 1   # pass-1 relative z == 1
	if surface != null:
		surface.z_index = base                # container only; pass geometry/z untouched
	return {
		"z_applied": surface != null,
		"soil_effective_z": base,
		"litter_effective_z": base + 1,
		"central_consistent": consistent,     # false if central's litter != soil+1 (reported, not overwritten)
	}

## Body 2 — bind the source-ready textures into the EXISTING surface (original
## producer/litter material + R4 pass structure) and apply the central z. Not-ready
## kinds bind as null (the surface still builds its 2 passes; nothing invented).
func bind(surface, z_decision: Dictionary = {}, source_textures: Dictionary = {}) -> Dictionary:
	var soil_r := source_ready("soil", source_textures)
	var litter_r := source_ready("litter", source_textures)
	var soil_tex: Texture2D = _resolve_source("soil", source_textures) if soil_r["ready"] else null
	var litter_tex: Texture2D = _resolve_source("litter", source_textures) if litter_r["ready"] else null
	surface.bind_textures(soil_tex, litter_tex)   # original material/passes consumed as-is
	var z := _apply_effective_z(surface, z_decision)
	return _report(surface, soil_r, litter_r, z)

## Body 3 — owner update: refresh the already-bound surface with (possibly new) source
## textures + re-apply the central z. Delegates to the surface's idempotent refresh.
func update(surface, z_decision: Dictionary = {}, source_textures: Dictionary = {}) -> Dictionary:
	var soil_r := source_ready("soil", source_textures)
	var litter_r := source_ready("litter", source_textures)
	var soil_tex: Texture2D = _resolve_source("soil", source_textures) if soil_r["ready"] else null
	var litter_tex: Texture2D = _resolve_source("litter", source_textures) if litter_r["ready"] else null
	surface.update_surface(soil_tex, litter_tex)
	var z := _apply_effective_z(surface, z_decision)
	return _report(surface, soil_r, litter_r, z)

## Body 3 — teardown. Delegates to the surface (frees the 2 passes); provider cache
## is released. No asset/import touched.
func terminate(surface) -> void:
	if surface != null:
		surface.terminate()
	_provider = null

func _report(surface, soil_r: Dictionary, litter_r: Dictionary, z: Dictionary) -> Dictionary:
	var gaps: Array = []
	if not soil_r["ready"]: gaps.append(soil_r["gap"])
	if not litter_r["ready"]: gaps.append(litter_r["gap"])
	if not z.get("z_applied", false) and z.has("gap"): gaps.append(z["gap"])
	var snap: Dictionary = surface.snapshot() if surface != null else {}
	return {
		"soil_ready": soil_r["ready"],
		"litter_ready": litter_r["ready"],
		"soil_bound": soil_r["ready"],       # bound == ready (null bound otherwise)
		"litter_bound": litter_r["ready"],
		"all_source_ready": soil_r["ready"] and litter_r["ready"],
		"z_applied": z.get("z_applied", false),
		"soil_effective_z": z.get("soil_effective_z", null),
		"litter_effective_z": z.get("litter_effective_z", null),
		"central_z_consistent": z.get("central_consistent", null),
		"surface_built": snap.get("bound", false),
		"pass_count": snap.get("child_count", 0),
		"soil_pass_z": snap.get("soil_z", null),      # relative pass z (unchanged: 0)
		"litter_pass_z": snap.get("litter_z", null),  # relative pass z (unchanged: 1)
		"gaps": gaps,
	}

## Exact R source -> proposed res:// target (passthrough of the R5 provider proposal).
func source_to_target() -> Dictionary:
	_ensure()
	return _provider.source_to_target()

## The source->target gaps for resources not yet imported into the product.
func gaps() -> Array:
	_ensure()
	return _provider.gap()

## Kept DISTINCT from the §23 VISUAL verdict: the Root's real texture bytes and the
## class/material schema are ENGINE-owned and currently insufficient — a separate
## incompleteness from "visual not observed" (no render run here).
func root_gap() -> Dictionary:
	return {
		"kind": "root_actual_texture_and_class_schema",
		"status": "insufficient — real Root soil/litter texture bytes + the consuming class/material schema are ENGINE-owned; NOT resolvable in this isolated binding unit",
		"distinct_from": "the §23 VISUAL_NOT_OBSERVED verdict (which concerns the absence of a real render/GPU observation, not the source import)",
	}
