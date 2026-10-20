class_name ExoduserWorld
extends Node2D

const NativePlayerProjectileStoreScript = preload("res://scripts/native_player_projectile_store.gd")
var _native_player_projectiles: RefCounted
const NativeFireballWorldConsumerScript = preload("res://scripts/native_fireball_world_consumer.gd")
var _native_player_projectile_consumer: RefCounted

signal telemetry_event(kind: String, data: Dictionary)
signal native_resource_load_changed(entry: RefCounted, phase: String)
signal native_source_extra_image_changed(image: RefCounted, phase: String)
signal native_source_object_image_changed(image: RefCounted, phase: String)
signal native_source_object_meta_changed(source_key: String, meta: Dictionary, phase: String)

const ENEMY_FACTORY = preload("res://scripts/enemy_factory.gd")
const NATIVE_WORLD_PHASE = preload("res://scripts/native_world_phase.gd")
const NATIVE_BIRTH_PHASE = preload("res://scripts/native_projectile_birth_phase.gd")
const NATIVE_HIT_FX = preload("res://scripts/native_projectile_hit_fx.gd")
const NATIVE_DEATH_FX = preload("res://scripts/native_death_fx_adapter.gd")
const NATIVE_FLOATING_TEXT = preload("res://scripts/native_floating_text_adapter.gd")
const NATIVE_GROUND_SURFACE = preload("res://scripts/native_ground_surface_adapter.gd")
const MAP_FILE = "res://data/map.json"
const ENCOUNTERS_FILE = "res://data/encounters.json"
const ELLIPSE_SEGMENTS = 128
const NATIVE_RESOURCE_LOAD_SCHEMA = "fdg.native-world-resource-load-publication.v1"
const NATIVE_RESOURCE_PUBLICATION_KIND = "ACTUAL_NATIVE_RESOURCE_LOAD_PUBLICATION"
const NATIVE_RESOURCE_LOAD_SCOPE = "existing_world_prop_loads_only"

const NATIVE_SOURCE_IMAGE_MAPPING_SCHEMA = "fdg.native-world-canonical-image-mapping.v1"
const SOURCE_CANONICAL_COMMIT = "9a4534b42f74093095ebc3364a25dd104e93b379"
const SOURCE_EXTRA_IMAGE_SCHEMA = "fdg.native-world-source-extra-images.v1"
const SOURCE_EXTRA_ACTUAL_KIND = "ACTUAL_SOURCE_PUBLICATION"
const SOURCE_OBJECT_META_SCHEMA = "fdg.native-world-source-object-meta.v1"
const SOURCE_BOOT_MAP_SCHEMA = "fdg.native-world-source-boot-map-build.v1"
const SOURCE_BOOT_MAP_STATE_SCRIPT = "res://scripts/native_source_new_run_state.gd"
const SOURCE_BOOT_MAP_SCHEDULER_SCOPE = "native_two_scene_tree_process_frame_awaits"
const SOURCE_OBJECT_META_MERGE_FIELDS = ["sz","light","large","mega","rot","flip","alpha","filter","edgeErase","blend","_renderLayer","renderLayer","col","collision","colSz","colW","colH","colParts","keepAR","pivotX","pivotY","squareDraw","wallKit","wallUnit","srcRect","sourceSize","trimOffset","assetOrigin"]
const SOURCE_OBJECT_INITIAL_META = {
	"diablo_hell_corpse_tree": {"sz":920,"large":1,"keepAR":1,"sway":0.0045},
	"diablo_hell_torch": {"sz":150,"keepAR":1},
	"diablo_hell_torch_flame": {"sz":150,"keepAR":1,"anim":{"frames":8,"cols":4,"rows":2,"interval":110}},
	"dead_tree": {"sz":64,"col":1,"sway":0.018},
	"dead_tree_02": {"sz":64,"col":1,"sway":0.016},
	"dead_tree_03": {"sz":64,"col":1,"sway":0.014},
	"skull_pile": {"sz":32},
	"bone_rocks": {"sz":32},
	"poison_pool": {"sz":32},
	"frozen_bones": {"sz":32},
	"lava_crack": {"sz":40},
	"fire_pillar": {"sz":64,"col":1},
	"rune_mark": {"sz":40},
	"bones": {"sz":32},
	"vine_roots": {"sz":40},
	"corpse": {"sz":40},
	"eyeball": {"sz":24},
	"eye1_bloodshot": {"sz":24},
	"eye2_terror": {"sz":24},
	"glow_flower_blue": {"sz":32,"light":1},
	"glow_flower_yellow": {"sz":32,"light":1},
	"centipede": {"sz":40},
	"larva": {"sz":32},
	"minibug": {"sz":24},
	"chitin_debris": {"sz":32},
	"pit_lava": {"sz":200,"collision":true},
	"pit_poison": {"sz":200,"collision":true},
	"pit_ice": {"sz":200,"collision":true},
	"pit_corpse": {"sz":200,"collision":true},
	"pit_bugs": {"sz":200,"collision":true},
	"lava_straight": {"sz":300,"collision":true},
	"lava_straight_v2": {"sz":300,"collision":true},
	"lava_s": {"sz":300,"collision":true},
	"lava_s_v4b": {"sz":300,"collision":true},
	"lava_s_v5c": {"sz":300,"collision":true},
	"lava_l": {"sz":200,"collision":true},
	"lava_l_v6a": {"sz":300,"collision":true},
	"lava_l_v6b": {"sz":300,"collision":true},
	"lava_l_v6c": {"sz":300,"collision":true},
	"lava_l_v6d": {"sz":300,"collision":true},
	"lava_l_90": {"sz":200,"collision":true,"rot":90},
	"lava_l_180": {"sz":200,"collision":true,"rot":180},
	"lava_l_270": {"sz":200,"collision":true,"rot":270},
	"boss_gate_col": {"sz":250,"col":1},
	"m_ctree1": {"sz":250,"col":1,"large":1},
	"m_ctree2": {"sz":250,"col":1,"large":1},
	"m_ctree3": {"sz":250,"col":1,"large":1,"eyeOvl":1},
	"m_ctree4": {"sz":250,"col":1,"large":1},
	"m_ctree5": {"sz":250,"col":1,"large":1,"eyeOvl":1},
	"m_ctree6": {"sz":250,"col":1,"large":1},
	"m_ctree7": {"sz":250,"col":1,"large":1,"eyeOvl":1},
	"m_ctree8": {"sz":250,"col":1,"large":1},
	"m_ctree9": {"sz":250,"col":1,"large":1,"eyeOvl":1},
	"m_ctree10": {"sz":250,"col":1,"large":1},
	"m_ctree11": {"sz":250,"col":1,"large":1},
	"m_ctree12": {"sz":250,"col":1,"large":1},
	"m_atree1": {"sz":250,"col":1,"large":1,"touchAnim":{"frames":2,"radius":120}},
	"m_cage_gate": {"sz":300,"col":1,"large":1},
	"m_sword_pile": {"sz":200,"col":1,"large":1},
	"m_hang_cage": {"sz":280,"col":1,"large":1},
	"m_skull_altar": {"sz":300,"col":1,"large":1},
	"m_obelisk": {"sz":300,"col":1,"large":1},
	"m_flesh_ball": {"sz":270,"col":1,"large":1},
	"m_penta_circle": {"sz":350,"col":1,"large":1},
	"m_flesh_maw": {"sz":200,"col":1,"large":1},
	"m_skull_totem": {"sz":240,"col":1,"large":1,"keepAR":1,"colW":30,"colH":20,"colOy":88},
	"m_bone_arch": {"sz":300,"col":1,"large":1},
	"m_eye_tree": {"sz":350,"col":1,"large":1},
	"m_throne": {"sz":250,"col":1,"large":1},
	"m_dragon_skeleton": {"sz":1500,"large":1,"keepAR":1,"col":1,"collision":true,"colW":650,"colH":350,"colOy":-37},
	"m_dragon_3d": {"sz":3000,"large":1,"keepAR":1,"col":1,"collision":true,"colW":838,"colH":715,"colOy":-6},
	"m_usergore1": {"sz":220,"keepAR":1},
	"m_usergore2": {"sz":220,"keepAR":1},
	"m_usergore3": {"sz":220,"keepAR":1,"anchorBottom":1},
	"m_usergore4": {"sz":220,"keepAR":1,"anchorBottom":1},
	"m_usergore5": {"sz":220,"keepAR":1,"anchorBottom":1},
	"m_usergore6": {"sz":220,"keepAR":1,"anchorBottom":1},
}
const SOURCE_OBJECT_DECO_META_INPUTS = {
	"m_tree1": {"sz":100},
	"m_tree2": {"sz":100},
	"m_tree3": {"sz":100},
	"m_eye": {"sz":40},
	"m_eye1": {"sz":40},
	"m_eye2": {"sz":40},
	"m_poison": {"sz":48},
	"m_fblue": {"sz":40,"light":1},
	"m_fyellow": {"sz":40,"light":1},
	"m_fbones": {"sz":48},
	"m_larva": {"sz":56},
	"m_mini": {"sz":40},
	"m_ctree1": {"sz":400,"large":1,"colSz":60},
	"m_ctree2": {"sz":400,"large":1,"colSz":60},
	"m_ctree3": {"sz":400,"large":1,"colSz":60},
	"m_ctree4": {"sz":400,"large":1,"colSz":60},
	"m_ctree5": {"sz":400,"large":1,"colSz":60},
	"m_ctree6": {"sz":400,"large":1,"colSz":60},
	"m_ctree7": {"sz":400,"large":1,"colSz":60},
	"m_ctree8": {"sz":400,"large":1,"colSz":60},
	"m_ctree9": {"sz":400,"large":1,"colSz":60},
	"m_ctree10": {"sz":400,"large":1,"colSz":60},
	"m_ctree11": {"sz":400,"large":1},
	"m_ctree12": {"sz":400,"large":1},
	"m_ctree13": {"sz":400,"large":1,"col":1,"colSz":60},
	"m_ctree14": {"sz":400,"large":1,"col":1,"colSz":60},
	"m_ctree15": {"sz":400,"large":1,"col":1,"colSz":60},
	"m_ctree16": {"sz":400,"large":1,"col":1,"colSz":60},
	"m_ctree17": {"sz":400,"large":1,"col":1,"colSz":60},
	"m_ctree18": {"sz":400,"large":1,"col":1,"colSz":60},
	"m_ctree19": {"sz":400,"large":1,"col":1},
	"m_ctree20": {"sz":400,"large":1,"col":1},
	"m_atree1": {"sz":400,"large":1},
	"m_cage_gate": {"sz":300,"large":1},
	"m_sword_pile": {"sz":200,"large":1},
	"m_hang_cage": {"sz":280,"large":1},
	"m_skull_altar": {"sz":300,"large":1},
	"m_obelisk": {"sz":300,"large":1},
	"m_flesh_ball": {"sz":270,"large":1},
	"m_penta_circle": {"sz":350,"large":1},
	"m_flesh_maw": {"sz":200,"large":1},
	"m_skull_totem": {"sz":240,"large":1},
	"m_bone_arch": {"sz":300,"large":1},
	"m_eye_tree": {"sz":350,"large":1},
	"m_throne": {"sz":250,"large":1},
	"m_mega_statue": {"sz":480,"large":1,"mega":1,"col":1,"colSz":140,"keepAR":1},
	"m_mega_ribs": {"sz":900,"large":1,"mega":1,"col":1,"colW":380,"colH":150,"keepAR":1},
	"m_mega_chapel": {"sz":520,"large":1,"mega":1,"col":1,"colSz":110,"keepAR":1},
	"m_mega_head": {"sz":720,"large":1,"mega":1,"col":1,"colW":260,"colH":160,"keepAR":1},
	"m_flesh_g0": {"sz":352},
	"m_flesh_g0f": {"sz":352,"flip":1},
	"m_flesh_h0": {"sz":352},
	"m_flesh_h0f": {"sz":352,"flip":1},
	"m_tumor00": {"sz":150},
	"m_tumor00f": {"sz":150,"flip":1},
	"m_tumor01": {"sz":150},
	"m_tumor01f": {"sz":150,"flip":1},
	"m_tumor02": {"sz":150},
	"m_tumor10": {"sz":150},
	"m_tumor11": {"sz":150},
	"m_tumor12": {"sz":150},
	"m_fixblk0": {"sz":150},
	"m_fixblk1": {"sz":150},
	"m_fleshwall_a": {"sz":300},
	"m_fleshwall_af": {"sz":300,"flip":1},
	"m_fleshwall_b": {"sz":300},
	"m_fleshwall_bf": {"sz":300,"flip":1},
	"m_usergore1": {"sz":220},
	"m_usergore2": {"sz":220},
	"m_usergore3": {"sz":220},
	"m_usergore4": {"sz":220},
	"m_usergore5": {"sz":220},
	"m_usergore6": {"sz":220},
	"m_c1tree": {"sz":1450,"large":1,"col":1,"colW":380,"colH":230,"keepAR":1},
	"m_c1bn": {"sz":640,"large":1,"col":1,"colW":250,"colH":70,"keepAR":1},
	"m_c1bnf": {"sz":560,"large":1,"flip":1,"col":1,"colW":220,"colH":62,"keepAR":1},
	"m_c1bs": {"sz":640,"large":1,"col":1,"colW":250,"colH":70,"keepAR":1},
	"m_c1bsf": {"sz":560,"large":1,"flip":1,"col":1,"colW":220,"colH":62,"keepAR":1},
	"m_c1bw": {"sz":640,"large":1,"col":1,"colW":110,"colH":230,"keepAR":1},
	"m_c1bwf": {"sz":560,"large":1,"flip":1,"col":1,"colW":98,"colH":200,"keepAR":1},
	"m_c1be": {"sz":640,"large":1,"col":1,"colW":95,"colH":230,"keepAR":1},
	"m_c1bef": {"sz":560,"large":1,"flip":1,"col":1,"colW":85,"colH":200,"keepAR":1},
	"m_c1cnw": {"sz":480,"large":1,"col":1,"colSz":170,"keepAR":1},
	"m_c1cne": {"sz":480,"large":1,"col":1,"colSz":170,"keepAR":1},
	"m_c1csw": {"sz":480,"large":1,"col":1,"colSz":170,"keepAR":1},
	"m_c1cse": {"sz":480,"large":1,"col":1,"colSz":170,"keepAR":1},
	"m_c1cnef": {"sz":300,"large":1,"flip":1,"col":1,"colSz":105,"keepAR":1},
	"m_c1cswf": {"sz":300,"large":1,"flip":1,"col":1,"colSz":105,"keepAR":1},
	"m_c1camp": {"sz":380,"large":1,"col":1,"colW":130,"colH":80,"keepAR":1},
	"m_c1altar": {"sz":330,"large":1,"col":1,"colSz":95,"keepAR":1},
	"m_c1pool": {"sz":300,"large":1,"col":1,"colSz":85,"keepAR":1},
	"m_c1cocoon": {"sz":280,"large":1,"col":1,"colSz":80,"keepAR":1},
	"m_c1gbattle": {"sz":880,"keepAR":1},
	"m_c1gbattlef": {"sz":720,"flip":1,"keepAR":1},
	"m_c1gbattler": {"sz":640,"rot":9,"keepAR":1},
	"m_c1gpath": {"sz":460,"keepAR":1},
	"m_c1gpathf": {"sz":400,"flip":1,"keepAR":1},
	"m_c1gpock": {"sz":620,"keepAR":1},
	"m_c1groot": {"sz":760,"keepAR":1},
	"m_c1grootf": {"sz":660,"flip":1,"keepAR":1},
	"m_c1grootr": {"sz":600,"rot":-7,"keepAR":1},
	"m_c1gtoxic": {"sz":550,"keepAR":1},
	"m_c1gtoxicf": {"sz":450,"flip":1,"keepAR":1},
	"m_c1gcorpse": {"sz":600,"keepAR":1},
	"m_c1gcorpsef": {"sz":500,"flip":1,"keepAR":1},
	"m_c1gedge": {"sz":800,"keepAR":1},
	"m_c1gedgef": {"sz":760,"flip":1,"keepAR":1},
	"m_c1sbone": {"sz":150,"keepAR":1},
	"m_c1sroot": {"sz":150,"keepAR":1},
	"m_c1spod": {"sz":150,"keepAR":1},
	"m_c2p1": {"sz":380,"large":1,"col":1,"colSz":70,"keepAR":1},
	"m_c2p1b": {"sz":320,"large":1,"flip":1,"col":1,"colSz":58,"keepAR":1},
	"m_c2p2": {"sz":360,"large":1,"col":1,"colSz":62,"keepAR":1},
	"m_c2hive": {"sz":360,"large":1,"col":1,"colSz":90,"keepAR":1},
	"m_c2webp": {"sz":340,"large":1,"col":1,"colSz":55,"keepAR":1},
	"m_c2webpf": {"sz":340,"large":1,"flip":1,"col":1,"colSz":55,"keepAR":1},
	"m_c2pit": {"sz":200,"large":1,"col":1,"collision":1,"colSz":80},
	"m_c2chitin": {"sz":56},
	"m_c2larva": {"sz":52},
	"m_c2mini": {"sz":36},
	"m_c2mush": {"sz":56,"light":1},
	"m_c2glow": {"sz":44,"light":1},
	"m_c2eye": {"sz":52},
	"m_c2edgeS": {"sz":860,"large":1,"col":1,"colSz":70,"keepAR":1},
	"m_c2edgeSf": {"sz":860,"large":1,"flip":1,"col":1,"colSz":70,"keepAR":1},
	"m_c2edge": {"sz":1100,"large":1,"col":1,"colSz":70,"keepAR":1},
	"m_c2edgef": {"sz":1100,"large":1,"flip":1,"col":1,"colSz":70,"keepAR":1},
	"m_c2edgeL": {"sz":1320,"large":1,"col":1,"colSz":70,"keepAR":1},
	"m_c2edgeLf": {"sz":1320,"large":1,"flip":1,"col":1,"colSz":70,"keepAR":1},
	"m_c2curveL": {"sz":1500,"large":1,"mega":1,"keepAR":1},
	"m_c2curveR": {"sz":1500,"large":1,"mega":1,"keepAR":1},
	"m_c2brokenMega": {"sz":1250,"large":1,"mega":1,"keepAR":1},
	"m_c2hiveWall": {"sz":1480,"large":1,"mega":1,"keepAR":1},
	"m_c2slimeCliff": {"sz":1350,"large":1,"mega":1,"keepAR":1},
	"m_c2chitinArch": {"sz":1400,"large":1,"mega":1,"keepAR":1},
	"m_c2deepHive": {"sz":1450,"large":1,"mega":1,"keepAR":1},
	"m_c2exitFrame": {"sz":1500,"large":1,"mega":1,"keepAR":1},
	"m_c2ridgeL": {"sz":1600,"large":1,"mega":1,"keepAR":1},
	"m_c2ridgeR": {"sz":1600,"large":1,"mega":1,"keepAR":1},
	"m_c2floorpatch": {"sz":280},
	"m_c2backRidgeL": {"sz":1050,"alpha":0.68,"keepAR":1},
	"m_c2backRidgeR": {"sz":1050,"alpha":0.68,"keepAR":1},
	"m_c2backJaw": {"sz":940,"alpha":0.65,"keepAR":1},
	"m_c2backHive": {"sz":980,"alpha":0.72,"keepAR":1},
	"m_c2skinHookL": {"sz":1100,"alpha":0.68,"keepAR":1},
	"m_c2skinHookR": {"sz":1100,"alpha":0.68,"keepAR":1},
	"m_c2skinRibArc": {"sz":1120,"alpha":0.68,"keepAR":1},
	"m_c2skinWebArc": {"sz":1080,"alpha":0.68,"keepAR":1},
	"m_c2skinJawArc": {"sz":1100,"alpha":0.68,"keepAR":1},
	"m_c2skinDepthArch": {"sz":1120,"alpha":0.68,"keepAR":1},
	"m_c2midRidgeL": {"sz":900,"keepAR":1},
	"m_c2midRidgeR": {"sz":900,"keepAR":1},
	"m_c2midJaw": {"sz":860,"keepAR":1},
	"m_c2midRib": {"sz":880,"keepAR":1},
	"m_c2midHive": {"sz":820,"keepAR":1},
	"m_c2seamChitin": {"sz":220,"keepAR":1},
	"m_c2seamEgg": {"sz":320,"keepAR":1},
	"m_c3p1": {"sz":400,"large":1,"col":1,"colSz":72,"keepAR":1},
	"m_c3p1b": {"sz":330,"large":1,"flip":1,"col":1,"colSz":60,"keepAR":1},
	"m_c3p2": {"sz":360,"large":1,"col":1,"colSz":70,"keepAR":1},
	"m_c3shrine": {"sz":360,"large":1,"col":1,"colSz":85,"keepAR":1},
	"m_c3cage": {"sz":360,"large":1,"col":1,"colSz":40,"keepAR":1},
	"m_c3cagef": {"sz":360,"large":1,"flip":1,"col":1,"colSz":40,"keepAR":1},
	"m_c3pit": {"sz":200,"large":1,"col":1,"collision":1,"colSz":80},
	"m_c3fbones": {"sz":56},
	"m_c3bones": {"sz":44},
	"m_c3deco": {"sz":48},
	"m_c3ritual": {"sz":380,"keepAR":1},
	"m_c3hellritual": {"sz":380,"alpha":0.56,"keepAR":1},
	"m_c3debris": {"sz":150},
	"m_c3gsnow": {"sz":200},
	"m_c3gcrack": {"sz":240},
	"m_c3gplates": {"sz":200},
	"m_c3gdark": {"sz":190},
	"m_c3sealshrine": {"sz":400,"large":1,"col":1,"colSz":92,"keepAR":1},
	"m_c3crystals": {"sz":340,"large":1,"col":1,"colSz":80,"keepAR":1},
	"m_c3tree": {"sz":410,"large":1,"col":1,"colSz":62,"keepAR":1},
	"m_c3corpse": {"sz":300,"large":1,"col":1,"colSz":96,"keepAR":1},
	"m_c3stalag": {"sz":320,"large":1,"col":1,"colSz":82,"keepAR":1},
	"m_c3sealbeast": {"sz":400,"large":1,"col":1,"colSz":92,"keepAR":1},
	"m_c3rampart": {"sz":470,"large":1,"col":1,"colW":210,"colH":72,"keepAR":1},
	"m_c3hellrampart": {"sz":520,"large":1,"col":1,"colW":210,"colH":72,"keepAR":1},
	"m_c3helltower": {"sz":620,"large":1,"col":1,"colSz":92,"keepAR":1},
	"m_c3hellback_mass": {"sz":1450,"large":1,"alpha":0.52,"renderLayer":-4,"keepAR":1},
	"m_c3hellrampart_shell": {"sz":1100,"large":1,"alpha":0.82,"renderLayer":-2,"keepAR":1},
	"m_c3hellrampart_mid_a": {"sz":1700,"large":1,"alpha":0.84,"renderLayer":-2,"keepAR":1,"srcRect":[0,180,900,790],"sourceSize":[1632,970],"trimOffset":[0,180],"assetOrigin":"runtime-crop"},
	"m_c3hellrampart_mid_b": {"sz":1700,"large":1,"alpha":0.86,"renderLayer":-2,"keepAR":1,"srcRect":[780,0,852,850],"sourceSize":[1632,970],"trimOffset":[780,0],"assetOrigin":"runtime-crop"},
	"m_c3helltower_shell": {"sz":1300,"large":1,"alpha":0.9,"renderLayer":-2,"keepAR":1},
	"m_c3hellgate_shell": {"sz":980,"large":1,"alpha":0.92,"renderLayer":-2,"keepAR":1},
	"m_c3hellrubble_front_a": {"sz":1200,"large":1,"alpha":0.86,"renderLayer":-1,"keepAR":1,"srcRect":[0,540,900,430],"sourceSize":[1632,970],"trimOffset":[0,540],"assetOrigin":"runtime-crop"},
	"m_c3hellrubble_front_b": {"sz":1200,"large":1,"alpha":0.82,"renderLayer":-1,"keepAR":1,"srcRect":[720,470,912,500],"sourceSize":[1632,970],"trimOffset":[720,470],"assetOrigin":"runtime-crop"},
	"m_c3hellsil_spire_a": {"sz":480,"large":1,"alpha":0.68,"renderLayer":-1,"keepAR":1,"srcRect":[20,20,820,380],"sourceSize":[820,380],"trimOffset":[0,0],"assetOrigin":"runtime-crop"},
	"m_c3hellsil_spire_b": {"sz":460,"large":1,"alpha":0.66,"renderLayer":-1,"keepAR":1,"srcRect":[860,0,740,420],"sourceSize":[740,420],"trimOffset":[0,0],"assetOrigin":"runtime-crop"},
	"m_c3hellsil_pillar": {"sz":500,"large":1,"alpha":0.7,"renderLayer":-1,"keepAR":1,"srcRect":[360,250,300,650],"sourceSize":[300,650],"trimOffset":[0,0],"assetOrigin":"runtime-crop"},
	"m_c3hellsil_rubble_a": {"sz":430,"large":1,"alpha":0.62,"renderLayer":-1,"keepAR":1,"srcRect":[0,540,900,430],"sourceSize":[900,430],"trimOffset":[0,0],"assetOrigin":"runtime-crop"},
	"m_c3hellsil_rubble_b": {"sz":430,"large":1,"flip":1,"alpha":0.58,"renderLayer":-1,"keepAR":1,"srcRect":[0,540,900,430],"sourceSize":[900,430],"trimOffset":[0,0],"assetOrigin":"runtime-crop"},
	"m_c3hellground_shadow": {"sz":760,"alpha":0.22,"filter":"grayscale(1) brightness(.26) contrast(1.25)","renderLayer":-11,"keepAR":1},
	"m_c3hellground_dark": {"sz":620,"alpha":0.055,"renderLayer":-10,"keepAR":1},
	"m_c3hellground_plate": {"sz":500,"alpha":0.035,"renderLayer":-10,"keepAR":1},
	"m_c3hellfissure": {"sz":430,"alpha":0.24,"filter":"grayscale(1) sepia(1) saturate(7) hue-rotate(315deg) brightness(.72)","blend":"screen","renderLayer":-9,"keepAR":1},
	"m_c3hellcenter_stain": {"sz":320,"alpha":0.1,"filter":"grayscale(1) brightness(.46) contrast(1.28) saturate(.16)","renderLayer":1,"keepAR":1},
	"m_c3hellcenter_plate": {"sz":280,"alpha":0.055,"filter":"grayscale(1) brightness(.42) contrast(1.2)","renderLayer":1,"keepAR":1},
	"m_c3hellcenter_vein": {"sz":260,"alpha":0.11,"filter":"grayscale(1) sepia(1) saturate(6) hue-rotate(315deg) brightness(.56)","blend":"screen","renderLayer":1,"keepAR":1},
	"m_c3wall_i": {"sz":520,"large":1,"col":1,"colParts":[{"x":0,"y":0,"w":270,"h":52,"rot":-45}],"keepAR":1,"wallKit":"CH3_HELLWINTER_V1","wallUnit":8,"srcRect":[12,12,1111,1137],"sourceSize":[1254,1254],"trimOffset":[95,66],"assetOrigin":"crop-atlas"},
	"m_c3wall_l": {"sz":420,"large":1,"col":1,"colParts":[{"x":112,"y":-82,"w":152,"h":52,"rot":-45},{"x":112,"y":82,"w":152,"h":52,"rot":45}],"keepAR":1,"pivotX":0.27,"pivotY":0.5,"wallKit":"CH3_HELLWINTER_V1","wallUnit":8,"srcRect":[1135,12,618,1106],"sourceSize":[1254,1254],"trimOffset":[323,75],"assetOrigin":"crop-atlas"},
	"m_c3wall_end": {"sz":520,"large":1,"col":1,"colParts":[{"x":0,"y":0,"w":238,"h":52,"rot":-45}],"keepAR":1,"wallKit":"CH3_HELLWINTER_V1","wallUnit":8,"srcRect":[1765,12,882,897],"sourceSize":[1254,1254],"trimOffset":[182,174],"assetOrigin":"crop-atlas"},
	"m_c3wall_gate": {"sz":650,"large":1,"col":1,"colParts":[{"x":-220,"y":135,"w":110,"h":44,"rot":-45},{"x":220,"y":135,"w":110,"h":44,"rot":45}],"keepAR":1,"pivotX":0.5,"pivotY":0.36,"squareDraw":1,"wallKit":"CH3_HELLWINTER_V1","wallUnit":8,"srcRect":[12,1161,1482,646],"sourceSize":[1536,1024],"trimOffset":[20,229],"assetOrigin":"crop-atlas"},
	"m_c3hellcarcass": {"sz":760,"large":1,"edgeErase":0.08,"col":1,"colW":220,"colH":88,"keepAR":1},
	"m_c3helldormant": {"sz":650,"large":1,"edgeErase":0.1,"col":1,"colW":170,"colH":96,"keepAR":1},
	"m_c3hellexecution": {"sz":720,"large":1,"edgeErase":0.03,"col":1,"colW":165,"colH":76,"keepAR":1},
	"m_c3hellprison": {"sz":560,"large":1,"edgeErase":0.03,"col":1,"colW":145,"colH":88,"keepAR":1},
	"m_c3hellgate": {"sz":820,"large":1,"keepAR":1},
	"m_c3hellcorpsefield": {"sz":400,"large":1,"keepAR":1},
	"m_c3hellcorpsefieldf": {"sz":400,"large":1,"flip":1,"keepAR":1},
	"m_c3bridge": {"sz":490,"large":1,"col":1,"colW":220,"colH":60,"keepAR":1},
	"m_c3cavwall": {"sz":560,"large":1,"col":1,"colW":150,"colH":80,"keepAR":1},
	"m_c3cliff": {"sz":560,"large":1,"col":1,"colSz":120,"keepAR":1},
	"m_c3ridge": {"sz":560,"large":1,"col":1,"colW":150,"colH":55,"keepAR":1},
	"m_c4p1": {"sz":400,"large":1,"col":1,"colSz":72,"keepAR":1},
	"m_c4p1b": {"sz":330,"large":1,"flip":1,"col":1,"colSz":60,"keepAR":1},
	"m_c4p2": {"sz":360,"large":1,"col":1,"colSz":70,"keepAR":1},
	"m_c4brazier": {"sz":300,"large":1,"col":1,"colSz":80,"keepAR":1},
	"m_c4pit": {"sz":200,"large":1,"col":1,"collision":1,"colSz":80},
	"m_c4fire": {"sz":220,"large":1,"col":1,"colSz":50,"keepAR":1},
	"m_c4crack": {"sz":56},
	"m_c5p1": {"sz":400,"large":1,"col":1,"colSz":75,"keepAR":1},
	"m_c5p1b": {"sz":330,"large":1,"flip":1,"col":1,"colSz":62,"keepAR":1},
	"m_c5p2": {"sz":380,"large":1,"col":1,"colSz":90,"keepAR":1},
	"m_c5banner": {"sz":380,"large":1,"col":1,"colSz":50,"keepAR":1},
	"m_c5bannerf": {"sz":380,"large":1,"flip":1,"col":1,"colSz":50,"keepAR":1},
	"m_c5totem": {"sz":260,"large":1,"col":1,"colSz":55,"keepAR":1},
	"m_c5arch": {"sz":300,"large":1,"col":1,"colSz":60,"keepAR":1},
	"m_c5bones": {"sz":44},
	"m_c5deco": {"sz":48},
	"m_c6p1": {"sz":400,"large":1,"col":1,"colSz":75,"keepAR":1},
	"m_c6p1b": {"sz":330,"large":1,"flip":1,"col":1,"colSz":62,"keepAR":1},
	"m_c6p2": {"sz":360,"large":1,"col":1,"colSz":68,"keepAR":1},
	"m_c6eyetotem": {"sz":340,"large":1,"col":1,"colSz":55,"keepAR":1},
	"m_c6eyetotemf": {"sz":340,"large":1,"flip":1,"col":1,"colSz":55,"keepAR":1},
	"m_c6corpse": {"sz":52},
	"m_c6rune": {"sz":44,"light":1},
	"m_c6eye": {"sz":36},
	"m_c7p1": {"sz":420,"large":1,"col":1,"colSz":70,"keepAR":1},
	"m_c7p1b": {"sz":340,"large":1,"flip":1,"col":1,"colSz":58,"keepAR":1},
	"m_c7p2": {"sz":380,"large":1,"col":1,"colSz":70,"keepAR":1},
	"m_c7garg": {"sz":340,"large":1,"col":1,"colSz":70,"keepAR":1},
	"m_c7gargf": {"sz":340,"large":1,"flip":1,"col":1,"colSz":70,"keepAR":1},
	"m_c7obelisk": {"sz":300,"large":1,"col":1,"colSz":50,"keepAR":1},
	"m_c7throne": {"sz":260,"large":1,"col":1,"colSz":55,"keepAR":1},
	"m_c7rune": {"sz":44,"light":1},
}
const SOURCE_OBJECT_IMAGE_SCHEMA = "fdg.native-world-source-object-images.v1"
const SOURCE_OBJECT_EDGE_AMOUNTS = {"m_c3hellcarcass": 0.08, "m_c3helldormant": 0.10,
	"m_c3hellexecution": 0.03, "m_c3hellprison": 0.03}
const SOURCE_OBJECT_CSS_FILTERS = {
	"m_c3hellground_shadow": "grayscale(1) brightness(.26) contrast(1.25)",
	"m_c3hellfissure": "grayscale(1) sepia(1) saturate(7) hue-rotate(315deg) brightness(.72)",
	"m_c3hellcenter_stain": "grayscale(1) brightness(.46) contrast(1.28) saturate(.16)",
	"m_c3hellcenter_plate": "grayscale(1) brightness(.42) contrast(1.2)",
	"m_c3hellcenter_vein": "grayscale(1) sepia(1) saturate(6) hue-rotate(315deg) brightness(.56)"}
const SOURCE_GROUND_WAIT_KEYS: Array[String] = ["gt_soil", "gt_ch2", "gt_ch3", "gt_hellwinter", "gt_ch4", "gt_ch5", "gt_ch6", "gt_ch7"]
const SOURCE_GROUND_FALLBACK_URI = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

class RawSourceImageEntry extends RefCounted:
	var _scope = "extra"
	var _canvas_field_policy = "extra_undefined_fields"
	var _source_key = ""
	var _replacement_kind = ""
	var _object_error_handler_active = false
	var _special_flags: Dictionary = {}
	var _owner_ref: WeakRef
	var _epoch: int
	var _sequence: int
	var _slot: String
	var _source_src: String
	var _native_path: String
	var _kind = "Image"
	var _phase = "CONSTRUCTED"
	var _requested = false
	var _pending = false
	var _terminal = false
	var _complete = false
	var _natural_width = 0
	var _natural_height = 0
	var _texture: Texture2D
	var _cpu_image: Image
	var _failure_reason = ""
	var _processing_gap = ""
	var _fallback_attempted = false
## Declarations only: initial map33 + CH_DECO250 + direct dragons2. No images
## are manufactured for these keys; actual entries come from observed loads.
const CANONICAL_SOURCE_OBJECT_DECLARATIONS = {
	"diablo_hell_corpse_tree": {"src":"assets/map/ch1/diablo_hell_corpse_tree_v1.png","source":"game.html:17896;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"diablo_hell_torch": {"src":"assets/map/ch1/diablo_field_torch_base_v1.png","source":"game.html:17897;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"diablo_hell_torch_flame": {"src":"assets/map/ch1/diablo_field_torch_flame_v1.png","source":"game.html:17898;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"dead_tree": {"src":"assets/map/ch1/floor_objects/tree_dead_01.png","source":"game.html:17899;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"dead_tree_02": {"src":"assets/map/ch1/floor_objects/tree_dead_02.png","source":"game.html:17899;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"dead_tree_03": {"src":"assets/map/ch1/floor_objects/tree_dead_03.png","source":"game.html:17899;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"skull_pile": {"src":"assets/map/ch1/floor_objects/deco_bones_04.png","source":"game.html:17900;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"bone_rocks": {"src":"assets/map/ch1/floor_objects/deco_bones_03.png","source":"game.html:17900;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"poison_pool": {"src":"assets/map/ch1/floor_objects/poison_pool.png","source":"game.html:17901;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"frozen_bones": {"src":"assets/map/ch1/floor_objects/frozen_bones.png","source":"game.html:17902;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"bones": {"src":"assets/map/ch1/floor_objects/bones.png","source":"game.html:17903;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"vine_roots": {"src":"assets/map/ch1/floor_objects/vine_roots.png","source":"game.html:17903;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"corpse": {"src":"assets/map/ch1/floor_objects/corpse.png","source":"game.html:17904;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"eyeball": {"src":"assets/map/ch1/floor_objects/eyeball.png","source":"game.html:17904;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"glow_flower_blue": {"src":"assets/map/ch1/floor_objects/glow_flower_blue.png","source":"game.html:17906;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"glow_flower_yellow": {"src":"assets/map/ch1/floor_objects/glow_flower_yellow.png","source":"game.html:17906;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"minibug": {"src":"assets/map/ch1/floor_objects/minibug.png","source":"game.html:17907;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_01": {"src":"assets/map/ch1/collision/cursed_tree_01.png","source":"game.html:17912;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_02": {"src":"assets/map/ch1/collision/cursed_tree_02.png","source":"game.html:17912;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_03": {"src":"assets/map/ch1/collision/cursed_tree_03.png","source":"game.html:17913;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_04": {"src":"assets/map/ch1/collision/cursed_tree_04.png","source":"game.html:17913;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_05": {"src":"assets/map/ch1/collision/cursed_tree_05.png","source":"game.html:17914;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_06": {"src":"assets/map/ch1/collision/cursed_tree_06.png","source":"game.html:17914;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_07": {"src":"assets/map/ch1/collision/cursed_tree_07.png","source":"game.html:17915;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_08": {"src":"assets/map/ch1/collision/cursed_tree_08.png","source":"game.html:17915;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_09": {"src":"assets/map/ch1/collision/cursed_tree_09.png","source":"game.html:17916;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_10": {"src":"assets/map/ch1/collision/cursed_tree_10.png","source":"game.html:17916;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_11": {"src":"assets/map/ch1/collision/cursed_tree_11.png","source":"game.html:17917;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"cursed_tree_12": {"src":"assets/map/ch1/collision/cursed_tree_12.png","source":"game.html:17917;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"anim_tree_01": {"src":"assets/map/ch1/collision/anim_tree_01.png","source":"game.html:17918;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"pit_lava": {"src":"assets/map/ch1/collision/pit_lava.png","source":"game.html:17919;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"pit_poison": {"src":"assets/map/ch1/collision/pit_poison.png","source":"game.html:17919;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"pit_corpse": {"src":"assets/map/ch1/collision/pit_corpse.png","source":"game.html:17920;18614 initial Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
	"m_tree1": {"src":"assets/map/ch1/floor_objects/tree_dead_01.png","source":"game.html:17926;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_tree2": {"src":"assets/map/ch1/floor_objects/tree_dead_02.png","source":"game.html:17926;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_tree3": {"src":"assets/map/ch1/floor_objects/tree_dead_03.png","source":"game.html:17926;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_eye": {"src":"assets/map/ch1/floor_objects/eyeball.png","source":"game.html:17927;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_eye1": {"src":"assets/map/ch1/floor_objects/eye1_bloodshot.png","source":"game.html:17927;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_eye2": {"src":"assets/map/ch1/floor_objects/eye2_terror.png","source":"game.html:17927;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_poison": {"src":"assets/map/ch1/floor_objects/poison_pool.png","source":"game.html:17928;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_fblue": {"src":"assets/map/ch1/floor_objects/glow_flower_blue.png","source":"game.html:17929;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_fyellow": {"src":"assets/map/ch1/floor_objects/glow_flower_yellow.png","source":"game.html:17929;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_fbones": {"src":"assets/map/ch1/floor_objects/frozen_bones.png","source":"game.html:17930;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_larva": {"src":"assets/map/ch1/floor_objects/larva.png","source":"game.html:17931;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_mini": {"src":"assets/map/ch1/floor_objects/minibug.png","source":"game.html:17931;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_ctree1": {"src":"assets/map/ch1/collision/cursed_tree_01.png","source":"game.html:17939;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree2": {"src":"assets/map/ch1/collision/cursed_tree_02.png","source":"game.html:17940;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree3": {"src":"assets/map/ch1/collision/cursed_tree_03.png","source":"game.html:17941;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree4": {"src":"assets/map/ch1/collision/cursed_tree_04.png","source":"game.html:17942;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree5": {"src":"assets/map/ch1/collision/cursed_tree_05.png","source":"game.html:17943;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree6": {"src":"assets/map/ch1/collision/cursed_tree_06.png","source":"game.html:17944;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree7": {"src":"assets/map/ch1/collision/cursed_tree_07.png","source":"game.html:17945;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree8": {"src":"assets/map/ch1/collision/cursed_tree_08.png","source":"game.html:17946;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree9": {"src":"assets/map/ch1/collision/cursed_tree_09.png","source":"game.html:17947;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree10": {"src":"assets/map/ch1/collision/cursed_tree_10.png","source":"game.html:17948;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree11": {"src":"assets/map/ch1/collision/cursed_tree_11.png","source":"game.html:17949;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree12": {"src":"assets/map/ch1/collision/cursed_tree_12.png","source":"game.html:17950;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_ctree13": {"src":"assets/map/ch1/collision/rotforest_tree_01.png","source":"game.html:17952;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_ctree14": {"src":"assets/map/ch1/collision/rotforest_tree_02.png","source":"game.html:17953;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_ctree15": {"src":"assets/map/ch1/collision/rotforest_tree_04.png","source":"game.html:17954;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_ctree16": {"src":"assets/map/ch1/collision/rotforest_tree_03.png","source":"game.html:17955;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_ctree17": {"src":"assets/map/ch1/collision/rotforest_tree_03.png","source":"game.html:17956;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_ctree18": {"src":"assets/map/ch1/collision/rotforest_tree_04.png","source":"game.html:17957;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_ctree19": {"src":"assets/map/ch1/collision/rotforest_tree_02.png","source":"game.html:17958;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_ctree20": {"src":"assets/map/ch1/collision/rotforest_tree_01.png","source":"game.html:17959;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_atree1": {"src":"assets/map/ch1/collision/anim_tree_01.png","source":"game.html:17960;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_cage_gate": {"src":"assets/map/ch1/collision/cage_gate.png","source":"game.html:17961;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_sword_pile": {"src":"assets/map/ch1/collision/sword_pile.png","source":"game.html:17962;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_hang_cage": {"src":"assets/map/ch1/collision/hang_cage.png","source":"game.html:17963;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_skull_altar": {"src":"assets/map/ch1/collision/skull_altar.png","source":"game.html:17964;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_obelisk": {"src":"assets/map/ch1/collision/obelisk.png","source":"game.html:17965;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_flesh_ball": {"src":"assets/map/ch1/collision/flesh_ball.png","source":"game.html:17966;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_penta_circle": {"src":"assets/map/ch1/collision/penta_circle.png","source":"game.html:17967;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_flesh_maw": {"src":"assets/map/ch1/collision/flesh_maw.png","source":"game.html:17968;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_skull_totem": {"src":"assets/map/ch1/collision/skull_totem.png","source":"game.html:17969;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_bone_arch": {"src":"assets/map/ch1/collision/bone_arch.png","source":"game.html:17970;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_eye_tree": {"src":"assets/map/ch1/collision/eye_tree.png","source":"game.html:17971;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_throne": {"src":"assets/map/ch1/collision/throne.png","source":"game.html:17972;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_mega_statue": {"src":"assets/map/ch1/collision/mega_statue.png","source":"game.html:17975;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_mega_ribs": {"src":"assets/map/ch1/collision/mega_ribs.png","source":"game.html:17976;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_mega_chapel": {"src":"assets/map/ch1/collision/mega_chapel.png","source":"game.html:17977;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_mega_head": {"src":"assets/map/ch1/collision/mega_head.png","source":"game.html:17978;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_flesh_g0": {"src":"assets/map/ch1/floor_objects/flesh_g_0.png","source":"game.html:17979;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_flesh_g0f": {"src":"assets/map/ch1/floor_objects/flesh_g_0.png","source":"game.html:17980;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_flesh_h0": {"src":"assets/map/ch1/floor_objects/flesh_h_0.png","source":"game.html:17981;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_flesh_h0f": {"src":"assets/map/ch1/floor_objects/flesh_h_0.png","source":"game.html:17982;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_tumor00": {"src":"assets/map/ch1/floor_objects/clean_tumor_0_0.png","source":"game.html:17983;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_tumor00f": {"src":"assets/map/ch1/floor_objects/clean_tumor_0_0.png","source":"game.html:17984;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_tumor01": {"src":"assets/map/ch1/floor_objects/clean_tumor_0_1.png","source":"game.html:17985;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_tumor01f": {"src":"assets/map/ch1/floor_objects/clean_tumor_0_1.png","source":"game.html:17986;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_tumor02": {"src":"assets/map/ch1/floor_objects/clean_tumor_0_2.png","source":"game.html:17987;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_tumor10": {"src":"assets/map/ch1/floor_objects/clean_tumor_1_0.png","source":"game.html:17988;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_tumor11": {"src":"assets/map/ch1/floor_objects/clean_tumor_1_1.png","source":"game.html:17989;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_tumor12": {"src":"assets/map/ch1/floor_objects/clean_tumor_1_2.png","source":"game.html:17990;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_fixblk0": {"src":"assets/map/ch1/floor_objects/fixed_black_0.png","source":"game.html:17991;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_fixblk1": {"src":"assets/map/ch1/floor_objects/fixed_black_1.png","source":"game.html:17992;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_fleshwall_a": {"src":"assets/map/ch1/floor_objects/flesh_wall_a.png","source":"game.html:17993;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_fleshwall_af": {"src":"assets/map/ch1/floor_objects/flesh_wall_a.png","source":"game.html:17994;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_fleshwall_b": {"src":"assets/map/ch1/floor_objects/flesh_wall_b.png","source":"game.html:17995;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_fleshwall_bf": {"src":"assets/map/ch1/floor_objects/flesh_wall_b.png","source":"game.html:17996;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_usergore1": {"src":"assets/map/ch1/floor_objects/provided_gore_01.png","source":"game.html:17997;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_usergore2": {"src":"assets/map/ch1/floor_objects/provided_gore_02.png","source":"game.html:17998;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_usergore3": {"src":"assets/map/ch1/floor_objects/provided_gore_03.png","source":"game.html:17999;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_usergore4": {"src":"assets/map/ch1/floor_objects/provided_gore_04.png","source":"game.html:18000;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_usergore5": {"src":"assets/map/ch1/floor_objects/provided_gore_05.png","source":"game.html:18001;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_usergore6": {"src":"assets/map/ch1/floor_objects/provided_gore_06.png","source":"game.html:18002;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1tree": {"src":"assets/map/ch1/collision/prop_corpsetree.png","source":"game.html:18005;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1bn": {"src":"assets/map/ch1/collision/bound_n.png","source":"game.html:18006;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1bnf": {"src":"assets/map/ch1/collision/bound_n.png","source":"game.html:18007;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1bs": {"src":"assets/map/ch1/collision/bound_s.png","source":"game.html:18008;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1bsf": {"src":"assets/map/ch1/collision/bound_s.png","source":"game.html:18009;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1bw": {"src":"assets/map/ch1/collision/bound_w.png","source":"game.html:18010;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1bwf": {"src":"assets/map/ch1/collision/bound_w.png","source":"game.html:18011;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1be": {"src":"assets/map/ch1/collision/bound_e.png","source":"game.html:18012;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1bef": {"src":"assets/map/ch1/collision/bound_e.png","source":"game.html:18013;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1cnw": {"src":"assets/map/ch1/collision/corner_nw.png","source":"game.html:18014;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1cne": {"src":"assets/map/ch1/collision/corner_ne.png","source":"game.html:18015;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1csw": {"src":"assets/map/ch1/collision/corner_sw.png","source":"game.html:18016;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1cse": {"src":"assets/map/ch1/collision/corner_se.png","source":"game.html:18017;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1cnef": {"src":"assets/map/ch1/collision/corner_ne.png","source":"game.html:18018;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1cswf": {"src":"assets/map/ch1/collision/corner_sw.png","source":"game.html:18019;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1camp": {"src":"assets/map/ch1/collision/prop_camp.png","source":"game.html:18020;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1altar": {"src":"assets/map/ch1/collision/prop_altar.png","source":"game.html:18021;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1pool": {"src":"assets/map/ch1/collision/prop_pool.png","source":"game.html:18022;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1cocoon": {"src":"assets/map/ch1/collision/prop_cocoon.png","source":"game.html:18023;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gbattle": {"src":"assets/map/ch1/floor_objects/prop_g_battle.png","source":"game.html:18024;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gbattlef": {"src":"assets/map/ch1/floor_objects/prop_g_battle.png","source":"game.html:18025;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gbattler": {"src":"assets/map/ch1/floor_objects/prop_g_battle.png","source":"game.html:18026;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gpath": {"src":"assets/map/ch1/floor_objects/prop_g_battle.png","source":"game.html:18027;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gpathf": {"src":"assets/map/ch1/floor_objects/prop_g_battle.png","source":"game.html:18028;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gpock": {"src":"assets/map/ch1/floor_objects/prop_g_battle.png","source":"game.html:18029;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1groot": {"src":"assets/map/ch1/floor_objects/prop_g_root.png","source":"game.html:18030;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1grootf": {"src":"assets/map/ch1/floor_objects/prop_g_root.png","source":"game.html:18031;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1grootr": {"src":"assets/map/ch1/floor_objects/prop_g_root.png","source":"game.html:18032;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gtoxic": {"src":"assets/map/ch1/floor_objects/prop_g_toxic.png","source":"game.html:18033;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gtoxicf": {"src":"assets/map/ch1/floor_objects/prop_g_toxic.png","source":"game.html:18034;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gcorpse": {"src":"assets/map/ch1/floor_objects/prop_g_corpse.png","source":"game.html:18035;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gcorpsef": {"src":"assets/map/ch1/floor_objects/prop_g_corpse.png","source":"game.html:18036;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gedge": {"src":"assets/map/ch1/floor_objects/prop_g_edge.png","source":"game.html:18037;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1gedgef": {"src":"assets/map/ch1/floor_objects/prop_g_edge.png","source":"game.html:18038;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1sbone": {"src":"assets/map/ch1/floor_objects/prop_s_bone.png","source":"game.html:18039;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1sroot": {"src":"assets/map/ch1/floor_objects/prop_s_root.png","source":"game.html:18040;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c1spod": {"src":"assets/map/ch1/floor_objects/prop_s_pod.png","source":"game.html:18041;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2p1": {"src":"assets/map/ch2/collision/prop_a.png","source":"game.html:18044;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2p1b": {"src":"assets/map/ch2/collision/prop_a.png","source":"game.html:18045;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2p2": {"src":"assets/map/ch2/collision/prop_b.png","source":"game.html:18046;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2hive": {"src":"assets/map/ch2/collision/prop_hive.png","source":"game.html:18047;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2webp": {"src":"assets/map/ch2/collision/prop_webp.png","source":"game.html:18048;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2webpf": {"src":"assets/map/ch2/collision/prop_webp.png","source":"game.html:18049;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2pit": {"src":"assets/map/ch2/collision/pit_bugs.png","source":"game.html:18050;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2chitin": {"src":"assets/map/ch2/floor_objects/chitin_debris.png","source":"game.html:18051;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2larva": {"src":"assets/map/ch2/floor_objects/larva.png","source":"game.html:18052;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2mini": {"src":"assets/map/ch2/floor_objects/minibug.png","source":"game.html:18053;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2mush": {"src":"assets/map/ch2/floor_objects/toxic_mushroom.png","source":"game.html:18055;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2glow": {"src":"assets/map/ch2/floor_objects/mushroom_glow_01.png","source":"game.html:18056;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2eye": {"src":"assets/map/ch2/floor_objects/eye_mushroom.png","source":"game.html:18057;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2edgeS": {"src":"assets/map/ch2/./wall_edge_tile.png","source":"game.html:18058;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2edgeSf": {"src":"assets/map/ch2/./wall_edge_tile.png","source":"game.html:18059;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2edge": {"src":"assets/map/ch2/./wall_edge_tile.png","source":"game.html:18060;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2edgef": {"src":"assets/map/ch2/./wall_edge_tile.png","source":"game.html:18061;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2edgeL": {"src":"assets/map/ch2/./wall_edge_tile.png","source":"game.html:18062;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2edgeLf": {"src":"assets/map/ch2/./wall_edge_tile.png","source":"game.html:18063;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2curveL": {"src":"assets/map/ch2/mega/wall_curve_l.png","source":"game.html:18065;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_c2curveR": {"src":"assets/map/ch2/mega/wall_curve_r.png","source":"game.html:18066;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_c2brokenMega": {"src":"assets/map/ch2/mega/wall_broken_mega.png","source":"game.html:18067;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_c2hiveWall": {"src":"assets/map/ch2/mega/hive_wall_mega.png","source":"game.html:18068;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_c2slimeCliff": {"src":"assets/map/ch2/mega/slime_cliff.png","source":"game.html:18069;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_c2chitinArch": {"src":"assets/map/ch2/mega/chitin_arch.png","source":"game.html:18070;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_c2deepHive": {"src":"assets/map/ch2/mega/deep_hive.png","source":"game.html:18071;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_c2exitFrame": {"src":"assets/map/ch2/mega/exit_organic_frame.png","source":"game.html:18072;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_c2ridgeL": {"src":"assets/map/ch2/mega/wall_ridge_l.png","source":"game.html:18073;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_c2ridgeR": {"src":"assets/map/ch2/mega/wall_ridge_r.png","source":"game.html:18074;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"key_magenta","deco_error_fallback":true},
	"m_c2floorpatch": {"src":"assets/map/ch2/./ground.png","source":"game.html:18075;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2backRidgeL": {"src":"assets/map/ch2/mega/wall_ridge_l.png","source":"game.html:18077;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c2backRidgeR": {"src":"assets/map/ch2/mega/wall_ridge_r.png","source":"game.html:18078;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c2backJaw": {"src":"assets/map/ch2/mega/wall_broken_mega.png","source":"game.html:18079;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c2backHive": {"src":"assets/map/ch2/mega/hive_wall_mega.png","source":"game.html:18080;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c2skinHookL": {"src":"assets/map/ch2/mega/wall_skin_hook_l.png","source":"game.html:18082;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2skinHookR": {"src":"assets/map/ch2/mega/wall_skin_hook_r.png","source":"game.html:18083;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2skinRibArc": {"src":"assets/map/ch2/mega/wall_skin_rib_arc.png","source":"game.html:18084;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2skinWebArc": {"src":"assets/map/ch2/mega/wall_skin_web_arc.png","source":"game.html:18085;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2skinJawArc": {"src":"assets/map/ch2/mega/wall_skin_jaw_arc.png","source":"game.html:18086;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2skinDepthArch": {"src":"assets/map/ch2/mega/wall_skin_depth_arch.png","source":"game.html:18087;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2midRidgeL": {"src":"assets/map/ch2/mega/wall_ridge_l.png","source":"game.html:18089;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c2midRidgeR": {"src":"assets/map/ch2/mega/wall_ridge_r.png","source":"game.html:18090;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c2midJaw": {"src":"assets/map/ch2/mega/wall_broken_mega.png","source":"game.html:18091;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c2midRib": {"src":"assets/map/ch2/mega/chitin_arch.png","source":"game.html:18092;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c2midHive": {"src":"assets/map/ch2/mega/hive_wall_mega.png","source":"game.html:18093;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c2seamChitin": {"src":"assets/map/ch2/floor_objects/chitin_debris.png","source":"game.html:18095;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c2seamEgg": {"src":"assets/map/ch2/collision/prop_hive.png","source":"game.html:18096;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"hard_alpha","deco_error_fallback":true},
	"m_c3p1": {"src":"assets/map/ch3/collision/prop_a.png","source":"game.html:18099;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3p1b": {"src":"assets/map/ch3/collision/prop_a.png","source":"game.html:18100;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3p2": {"src":"assets/map/ch3/collision/prop_b.png","source":"game.html:18101;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3shrine": {"src":"assets/map/ch3/collision/prop_iceshrine.png","source":"game.html:18102;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3cage": {"src":"assets/map/ch3/collision/prop_icecage.png","source":"game.html:18103;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3cagef": {"src":"assets/map/ch3/collision/prop_icecage.png","source":"game.html:18104;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3pit": {"src":"assets/map/ch3/collision/pit_ice.png","source":"game.html:18105;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3fbones": {"src":"assets/map/ch3/floor_objects/frozen_bones.png","source":"game.html:18106;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3bones": {"src":"assets/map/ch3/floor_objects/bones.png","source":"game.html:18107;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3deco": {"src":"assets/map/ch3/floor_objects/deco_bones_03.png","source":"game.html:18108;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3ritual": {"src":"assets/map/ch3/floor_objects/prop_ice_ritual.png","source":"game.html:18110;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3hellritual": {"src":"assets/map/ch3/floor_objects/prop_hellwinter_ritual.png","source":"game.html:18111;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3debris": {"src":"assets/map/ch3/floor_objects/prop_ice_debris.png","source":"game.html:18112;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3gsnow": {"src":"assets/map/ch3/floor_objects/prop_ice_gsnow.png","source":"game.html:18113;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3gcrack": {"src":"assets/map/ch3/floor_objects/prop_ice_gcrack.png","source":"game.html:18114;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3gplates": {"src":"assets/map/ch3/floor_objects/prop_ice_gplates.png","source":"game.html:18115;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3gdark": {"src":"assets/map/ch3/floor_objects/prop_ice_gdark.png","source":"game.html:18116;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3sealshrine": {"src":"assets/map/ch3/collision/prop_ice_sealshrine.png","source":"game.html:18118;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3crystals": {"src":"assets/map/ch3/collision/prop_ice_crystals.png","source":"game.html:18119;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3tree": {"src":"assets/map/ch3/collision/prop_ice_tree.png","source":"game.html:18120;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3corpse": {"src":"assets/map/ch3/collision/prop_ice_corpsepile.png","source":"game.html:18121;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3stalag": {"src":"assets/map/ch3/collision/prop_ice_stalag.png","source":"game.html:18122;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3sealbeast": {"src":"assets/map/ch3/collision/prop_ice_sealbeast.png","source":"game.html:18123;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3rampart": {"src":"assets/map/ch3/collision/prop_ice_rampart.png","source":"game.html:18124;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3hellrampart": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18125;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3helltower": {"src":"assets/map/ch3/collision/prop_hellwinter_tower.png","source":"game.html:18126;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3hellback_mass": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18127;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3hellrampart_shell": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18128;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3hellrampart_mid_a": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18129;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3hellrampart_mid_b": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18130;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3helltower_shell": {"src":"assets/map/ch3/collision/prop_hellwinter_tower.png","source":"game.html:18131;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3hellgate_shell": {"src":"assets/map/ch3/floor_objects/prop_hellwinter_gate.png","source":"game.html:18132;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3hellrubble_front_a": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18133;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3hellrubble_front_b": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18134;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3hellsil_spire_a": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18135;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3hellsil_spire_b": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18136;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3hellsil_pillar": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18137;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3hellsil_rubble_a": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18138;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3hellsil_rubble_b": {"src":"assets/map/ch3/collision/prop_hellwinter_rampart.png","source":"game.html:18139;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3hellground_shadow": {"src":"assets/map/ch3/floor_objects/prop_ice_gdark.png","source":"game.html:18140;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"filter","deco_error_fallback":true},
	"m_c3hellground_dark": {"src":"assets/map/ch3/floor_objects/prop_ice_gdark.png","source":"game.html:18141;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3hellground_plate": {"src":"assets/map/ch3/floor_objects/prop_ice_gplates.png","source":"game.html:18142;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3hellfissure": {"src":"assets/map/ch3/floor_objects/prop_ice_gcrack.png","source":"game.html:18143;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"filter","deco_error_fallback":true},
	"m_c3hellcenter_stain": {"src":"assets/map/ch3/floor_objects/prop_ice_gdark.png","source":"game.html:18144;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"filter","deco_error_fallback":true},
	"m_c3hellcenter_plate": {"src":"assets/map/ch3/floor_objects/prop_ice_gplates.png","source":"game.html:18145;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"filter","deco_error_fallback":true},
	"m_c3hellcenter_vein": {"src":"assets/map/ch3/floor_objects/prop_ice_gcrack.png","source":"game.html:18146;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"filter","deco_error_fallback":true},
	"m_c3wall_i": {"src":"assets/map/ch3/collision/prop_hellwinter_wall_atlas.png","source":"game.html:18147;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3wall_l": {"src":"assets/map/ch3/collision/prop_hellwinter_wall_atlas.png","source":"game.html:18148;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3wall_end": {"src":"assets/map/ch3/collision/prop_hellwinter_wall_atlas.png","source":"game.html:18149;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3wall_gate": {"src":"assets/map/ch3/collision/prop_hellwinter_wall_atlas.png","source":"game.html:18150;18880-18894 CH_DECO Image","shared_atlas":true,"replacement":"","deco_error_fallback":true},
	"m_c3hellcarcass": {"src":"assets/map/ch3/collision/prop_hellwinter_carcass.png","source":"game.html:18151;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"edge_erase","deco_error_fallback":true},
	"m_c3helldormant": {"src":"assets/map/ch3/collision/prop_hellwinter_dormant.png","source":"game.html:18152;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"edge_erase","deco_error_fallback":true},
	"m_c3hellexecution": {"src":"assets/map/ch3/collision/prop_hellwinter_execution.png","source":"game.html:18153;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"edge_erase","deco_error_fallback":true},
	"m_c3hellprison": {"src":"assets/map/ch3/collision/prop_hellwinter_prison.png","source":"game.html:18154;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"edge_erase","deco_error_fallback":true},
	"m_c3hellgate": {"src":"assets/map/ch3/floor_objects/prop_hellwinter_gate.png","source":"game.html:18155;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3hellcorpsefield": {"src":"assets/map/ch3/floor_objects/prop_hellwinter_corpsefield.png","source":"game.html:18156;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3hellcorpsefieldf": {"src":"assets/map/ch3/floor_objects/prop_hellwinter_corpsefield.png","source":"game.html:18157;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3bridge": {"src":"assets/map/ch3/collision/prop_ice_bridge.png","source":"game.html:18158;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3cavwall": {"src":"assets/map/ch3/collision/prop_ice_cavwall.png","source":"game.html:18160;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3cliff": {"src":"assets/map/ch3/collision/prop_ice_cliff.png","source":"game.html:18161;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c3ridge": {"src":"assets/map/ch3/collision/prop_ice_ridge.png","source":"game.html:18162;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c4p1": {"src":"assets/map/ch4/collision/prop_a.png","source":"game.html:18165;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c4p1b": {"src":"assets/map/ch4/collision/prop_a.png","source":"game.html:18166;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c4p2": {"src":"assets/map/ch4/collision/prop_b.png","source":"game.html:18167;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c4brazier": {"src":"assets/map/ch4/collision/prop_brazier.png","source":"game.html:18168;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c4pit": {"src":"assets/map/ch4/collision/pit_lava.png","source":"game.html:18169;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c4fire": {"src":"assets/map/ch4/collision/fire_pillar.png","source":"game.html:18170;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c4crack": {"src":"assets/map/ch4/floor_objects/lava_crack.png","source":"game.html:18171;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c5p1": {"src":"assets/map/ch5/collision/prop_a.png","source":"game.html:18174;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c5p1b": {"src":"assets/map/ch5/collision/prop_a.png","source":"game.html:18175;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c5p2": {"src":"assets/map/ch5/collision/prop_b.png","source":"game.html:18176;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c5banner": {"src":"assets/map/ch5/collision/prop_banner.png","source":"game.html:18177;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c5bannerf": {"src":"assets/map/ch5/collision/prop_banner.png","source":"game.html:18178;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c5totem": {"src":"assets/map/ch5/collision/skull_totem.png","source":"game.html:18179;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c5arch": {"src":"assets/map/ch5/collision/bone_arch.png","source":"game.html:18180;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c5bones": {"src":"assets/map/ch5/floor_objects/bones.png","source":"game.html:18182;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c5deco": {"src":"assets/map/ch5/floor_objects/deco_bones_04.png","source":"game.html:18183;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c6p1": {"src":"assets/map/ch6/collision/prop_a.png","source":"game.html:18187;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c6p1b": {"src":"assets/map/ch6/collision/prop_a.png","source":"game.html:18188;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c6p2": {"src":"assets/map/ch6/collision/prop_b.png","source":"game.html:18189;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c6eyetotem": {"src":"assets/map/ch6/collision/prop_eyetotem.png","source":"game.html:18190;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c6eyetotemf": {"src":"assets/map/ch6/collision/prop_eyetotem.png","source":"game.html:18191;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c6corpse": {"src":"assets/map/ch6/floor_objects/corpse.png","source":"game.html:18194;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c6rune": {"src":"assets/map/ch6/floor_objects/rune_mark.png","source":"game.html:18195;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c6eye": {"src":"assets/map/ch6/floor_objects/eyeball.png","source":"game.html:18196;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c7p1": {"src":"assets/map/ch7/collision/prop_a.png","source":"game.html:18199;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c7p1b": {"src":"assets/map/ch7/collision/prop_a.png","source":"game.html:18200;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c7p2": {"src":"assets/map/ch7/collision/prop_b.png","source":"game.html:18201;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c7garg": {"src":"assets/map/ch7/collision/prop_gargoyle.png","source":"game.html:18202;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c7gargf": {"src":"assets/map/ch7/collision/prop_gargoyle.png","source":"game.html:18203;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c7obelisk": {"src":"assets/map/ch7/collision/obelisk.png","source":"game.html:18204;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c7throne": {"src":"assets/map/ch7/collision/throne.png","source":"game.html:18205;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_c7rune": {"src":"assets/map/ch7/floor_objects/rune_mark.png","source":"game.html:18207;18880-18894 CH_DECO Image","shared_atlas":false,"replacement":"","deco_error_fallback":true},
	"m_dragon_skeleton": {"src":"img/map_dragon_skeleton.png","source":"game.html:18899 direct Image","shared_atlas":false,"replacement":"luma_key","deco_error_fallback":false},
	"m_dragon_3d": {"src":"img/map_dragon_3d.png","source":"game.html:18900 direct Image","shared_atlas":false,"replacement":"","deco_error_fallback":false},
}
## Existing map.json key/resource contracts. Matching a path proves neither
## original pixel bytes nor an unported current-source replacement callback.
const NATIVE_SOURCE_PROP_PATHS = {
	"m_ctree13": "res://assets/map/props/rotforest_tree_01.png",
	"m_ctree14": "res://assets/map/props/rotforest_tree_02.png",
	"m_ctree15": "res://assets/map/props/rotforest_tree_04.png",
	"m_ctree16": "res://assets/map/props/rotforest_tree_03.png",
	"m_ctree17": "res://assets/map/props/rotforest_tree_03.png",
	"m_ctree18": "res://assets/map/props/rotforest_tree_04.png",
	"m_ctree19": "res://assets/map/props/rotforest_tree_02.png",
	"m_ctree20": "res://assets/map/props/rotforest_tree_01.png",
	"m_fbones": "res://assets/map/props/frozen_bones.png",
	"corpse": "res://assets/map/props/corpse.png",
	"m_c1sroot": "res://assets/map/props/prop_s_root.png",
	"m_c1groot": "res://assets/map/props/prop_g_root.png",
	"m_c1tree": "res://assets/map/props/prop_corpsetree.png",
	"m_c1sbone": "res://assets/map/props/prop_s_bone.png",
	"m_c1cocoon": "res://assets/map/props/prop_cocoon.png",
	"m_hang_cage": "res://assets/map/props/hang_cage.png",
	"m_c1spod": "res://assets/map/props/prop_s_pod.png",
	"m_c1camp": "res://assets/map/props/prop_camp.png",
	"m_sword_pile": "res://assets/map/props/sword_pile.png",
	"m_bone_arch": "res://assets/map/props/bone_arch.png",
	"m_penta_circle": "res://assets/map/props/penta_circle.png",
	"m_c1altar": "res://assets/map/props/prop_altar.png",
	"m_skull_totem": "res://assets/map/props/skull_totem.png",
	"m_fyellow": "res://assets/map/props/glow_flower_yellow.png",
	"m_c1gtoxic": "res://assets/map/props/prop_g_toxic.png",
	"m_c1pool": "res://assets/map/props/prop_pool.png",
	"m_c1gtoxicf": "res://assets/map/props/prop_g_toxic.png",
	"pit_poison": "res://assets/map/props/pit_poison.png",
}
const CANONICAL_SOURCE_EXTRA_GLOBALS = {
	"_bossRoomBg": {"src": "assets/map/ch1/boss_room_bg.png", "source": "game.html:18615"},
	"_bossGateImgs": {"kind": "array", "source": "game.html:18640-18667", "replacement": "remove_white_bg", "paths": [
		"assets/map/ch1/collision/boss_gate.png", "assets/map/ch1/collision/boss_gate.png",
		"assets/map/ch1/collision/boss_gate.png", "assets/map/ch1/collision/boss_gate.png",
		"assets/map/ch1/collision/boss_gate.png", "assets/map/ch1/collision/boss_gate.png",
		"assets/map/ch1/collision/boss_gate.png"]},
	"_impSpr": {"src": "assets/vfx/impact_basic_sheet.png", "source": "game.html:19184"},
	"_skullWallImg": {"src": "assets/map/ch2/skull_wall_tile.png", "source": "game.html:11616"},
	"_wallEdgeImg": {"src": "assets/map/ch2/wall_edge_tile.png", "source": "game.html:11618"},
	"_pathBgImg": {"src": "assets/map/ch1/map_1-2.jpg?v=20260817-paint2", "source": "game.html:11987-11993"},
	"_voidVistaImg": {"src": "assets/map/ch1/void_vista.jpg?v=20260817-vista", "source": "game.html:11619-11620"},
	"_GROUND_TILES": {"kind": "dictionary", "source": "game.html:27089-27102;27215", "paths": {
		"gt_soil": "assets/map/ch1/ground_dark_soil.png?v=20260403-floorfix",
		"gt_ch2": "assets/map/ch2/ground.png?v=20260816-detail",
		"gt_ch3": "assets/map/ch3/ground.png?v=20260816-detail",
		"gt_hellwinter": "assets/map/ch3/ground_hellwinter.png?v=20260829-canonical",
		"gt_ch4": "assets/map/ch4/ground.png?v=20260816-detail",
		"gt_ch5": "assets/map/ch5/ground.png?v=20260816-detail",
		"gt_ch6": "assets/map/ch6/ground.png?v=20260816-detail",
		"gt_ch7": "assets/map/ch7/ground.png?v=20260816-detail"}},
}
const SOURCE_CURRENT_IMAGE_OWNER_GAPS = [
	"game.html:18886 CH_DECO image error fallback src replacement",
	"game.html:18887-18889 edgeErase/filter/hardAlpha/keyMagenta current image replacement",
	"game.html:18890 sharedAtlas source Image identity owner",
	"game.html:18899 dragon skeleton luma-key replacement",
	"game.html:18667 boss gate remove-white-bg replacement",
]

class NativeResourceLoadEntry extends RefCounted:
	var _owner_ref: WeakRef
	var _owner_instance_id: int
	var _registry_epoch: int
	var _sequence: int
	var _object_id: String
	var _src: String
	var _request_origin: String
	var _canonical_source_src = ""
	var _canonical_source_keys: Array[String] = []
	var _canonical_path_mapping_bound = false
	var _source_mapping_error = ""
	var _requested = true
	var _pending = true
	var _load_call_performed = false
	var _terminal = false
	var _complete = false
	var _natural_width = 0
	var _natural_height = 0
	var _phase = "PENDING"
	var _failure_reason = ""
	var _texture: Texture2D
	var _prop_ref: WeakRef
	var _prop_attached = false
	var _transitions: Array[String] = ["REQUESTED", "PENDING"]

var map_data: Dictionary = {}
var player: Node2D
var _enemies: Array = []
var _chunks: Dictionary = {}
var _chunk_specs: Array = []
var _flow: PackedInt32Array
var _flow_target = Vector2i(-1, -1)
var _flow_clock = 0.0
var _tile_size = 40.0
var collision_count = 0
var ready_for_player = false
var _native_startup_error = "startup_not_completed"
var _encounter_factory = ENEMY_FACTORY.new()
var _encounter_report: Dictionary = {}
var _native_frame = 0.0
var _native_ticks = 0.0
var _native_clock_updates = 0
var _native_owner_phase_updates = 0
var _native_owner_dispatches = 0
var _native_queue_dispatches = 0
var _native_phase_entries: Array[Dictionary] = []
var _native_dynamic_spawn_count = 0
var _native_random_draw_count = 0
var _native_last_ticks = 1.0
var _native_fx_hi_fps = false
var _native_hit_fx: Node2D
var _native_floating_text: Node2D
var _native_death_fx: Node2D
var _native_ground_surface: Node2D
var _native_fx_external_refs: Array[WeakRef] = []
var _native_projectile_emitter: Node
var _native_birth_ticks = 0.0
var _native_particle_pre_updates = 0
var _native_birth_phase_updates = 0
var _native_initial_report: Dictionary = {}
var _native_initial_order_by_instance: Dictionary = {}
var _native_initial_install_revision = 0
var _native_resource_load_entries: Array[NativeResourceLoadEntry] = []
var _native_resource_load_epoch = 1
var _native_resource_load_revision = 0
var _native_resource_load_calls = 0
var _native_resource_prop_build_complete = false
var _native_resource_load_closed = false
var _native_source_object_entries: Dictionary = {}
var _native_source_mapping_gaps: Dictionary = {}
var _native_source_mapping_revision = 0
var _source_extra_state = "UNBOUND"
var _source_extra_epoch = 1
var _source_extra_images: Array[RawSourceImageEntry] = []
var _source_extra_globals: Dictionary = {}
var _source_extra_gate_images: Array[RawSourceImageEntry] = []
var _source_extra_ground_images: Dictionary = {}
var _source_extra_events: Array[Dictionary] = []
var _source_extra_load_calls = 0
var _source_extra_deferred_pending = 0
var _source_extra_refresh_gaps: Array[String] = []
var _source_object_state = "UNBOUND"
var _source_object_epoch = 1
var _source_object_images: Array[RawSourceImageEntry] = []
var _source_object_current: Dictionary = {}
var _source_object_shared_images: Dictionary = {}
var _source_object_events: Array[Dictionary] = []
var _source_object_processing_gaps: Dictionary = {}
var _source_object_meta_gaps: Dictionary = {}
var _source_object_load_calls = 0
var _source_object_alias_reuses = 0
var _source_object_deferred_pending = 0
var _source_object_meta_state = "UNBOUND"
var _source_object_meta_epoch = 0
var _source_object_meta_current: Dictionary = {}
var _source_object_meta_namespace_ref: Variant = null
var _source_object_meta_owned_refs: Dictionary = {}
var _source_object_meta_undefined: Dictionary = {}
var _source_object_meta_sequences: Dictionary = {}
var _source_object_meta_deco_inputs: Dictionary = {}
var _source_object_meta_events: Array[Dictionary] = []
var _source_object_meta_sequence = 0
var _source_object_meta_merge_count = 0
var _source_object_meta_callback_write_count = 0
var _boot_map_state_ref: WeakRef = null
var _boot_map_state_id = 0
var _boot_map_builder: Callable = Callable()
var _boot_map_builder_owner_id = 0
var _boot_map_binding = "UNBOUND"
var _boot_map_epoch = 1
var _boot_map_error = ""
var _boot_map_closed = false
var _boot_map_defer: Variant = 0
var _boot_map_queued = 0
var _boot_map_promise: NativeBootMapBuildHandle = null
var _boot_map_resolver: Callable = Callable()
var _boot_map_sequence = 0
var _boot_map_in_builder = false
var _boot_map_in_resolve = false
var _boot_map_last_result: Dictionary = {}

## One queued source buildMapCache operation (game26051 promise). It is never
## rejected; only owner/state loss settles it as CANCELLED/NOT_READY.
class NativeBootMapBuildHandle extends RefCounted:
	signal finished(result: Dictionary)
	var _owner_ref: WeakRef
	var _owner_instance_id = 0
	var _epoch = 0
	var _sequence = 0
	var _frames = 0
	var _finished = false
	var _result: Dictionary = {}

	func _settle(result: Dictionary) -> void:
		if _finished:
			return
		_finished = true
		_result = result
		finished.emit(result.duplicate())

	func is_finished() -> bool:
		return _finished

	func get_result() -> Dictionary:
		return _result.duplicate()

func _ready() -> void:
	var encounters: Variant = JSON.parse_string(FileAccess.get_file_as_string(ENCOUNTERS_FILE))
	# Validate before creating world children. An invalid encounter source cannot
	# leave a partially installed enemy registry or emit spawn/ready events.
	if not _encounter_factory.validate_source(encounters)["valid"]:
		_native_startup_error = "invalid_canonical_encounter_source"
		return
	# Clock publication precedes every priority0 actor. The late node is added
	# before enemy/projectile children and consumes the same paused scene clock.
	process_physics_priority = -1
	_native_hit_fx = NATIVE_HIT_FX.new()
	_native_hit_fx.name = "NativeProjectileHitEffects"
	if not _native_hit_fx.configure(self):
		_native_startup_error = "native_hit_fx_configuration_rejected"
		_native_hit_fx.free()
		_native_hit_fx = null
		return
	_native_floating_text = NATIVE_FLOATING_TEXT.new()
	_native_floating_text.name = "NativeFloatingText"
	add_child(_native_floating_text)
	if not _native_floating_text.configure(self) or not _native_hit_fx.bind_native_floating_text_sink(
			Callable(_native_floating_text, "emit_native_text"),
			Callable(_native_floating_text, "advance_native_text"),
			Callable(_native_floating_text, "get_snapshot")):
		_native_startup_error = "native_floating_text_binding_rejected"
		_native_floating_text.free()
		_native_floating_text = null
		_native_hit_fx.free()
		_native_hit_fx = null
		return
	add_child(_native_hit_fx)
	_native_hit_fx.process_physics_priority = 3
	var native_phase = NATIVE_WORLD_PHASE.new()
	native_phase.name = "NativeOwnerAndWarningPhase"
	native_phase.configure(self)
	add_child(native_phase)
	var birth_phase = NATIVE_BIRTH_PHASE.new()
	birth_phase.name = "NativeProjectileBirthPhase"
	birth_phase.configure(self)
	add_child(birth_phase)
	# P2-001b: 사망 연출·피격 임팩트 어댑터 (핏자국/시체/고어/데드임팩트/death_blood/임팩트).
	_native_death_fx = NATIVE_DEATH_FX.new()
	_native_death_fx.name = "NativeDeathFx"
	add_child(_native_death_fx)
	if not _native_death_fx.configure(self):
		_native_startup_error = "native_death_fx_configuration_rejected"
		_native_death_fx.free()
		_native_death_fx = null
		return
	map_data = JSON.parse_string(FileAccess.get_file_as_string(MAP_FILE))
	_tile_size = float(map_data["tile_size"])
	_native_ground_surface = NATIVE_GROUND_SURFACE.new()
	_native_ground_surface.name = "NativeGroundSurface"
	add_child(_native_ground_surface)
	if not _native_ground_surface.configure(self) or not _native_ground_surface.is_native_surface_ready():
		_native_startup_error = "native_ground_surface_not_ready"
		_native_ground_surface.free()
		_native_ground_surface = null
		return
	_build_collision()
	_build_props()
	_chunk_specs = map_data["chunks"]
	_update_visible_chunks(get_start_position(), true)
	install_native_encounters(encounters)
	ready_for_player = true
	_native_startup_error = ""
	telemetry_event.emit("world_ready", {"stage": 0, "tiles": 40000, "collision_shapes": collision_count, "source_tile_sha": map_data["source"]["native_tile_sha256"]})

func get_native_startup_error() -> String:
	return _native_startup_error

func get_start_position() -> Vector2:
	var p: Array = map_data.get("start_position", [4020, 7420])
	return Vector2(float(p[0]), float(p[1]))

func get_exit_position() -> Vector2:
	var p: Array = map_data.get("exit_position", [4020, 300])
	return Vector2(float(p[0]), float(p[1]))

func get_enemies() -> Array:
	return _enemies

func get_native_frame() -> float:
	return _native_frame

func read_native_source_player_projectile_context() -> Dictionary:
	var main: Node = get_parent()
	if not is_inside_tree() or is_queued_for_deletion() or not is_instance_valid(main) or main.is_queued_for_deletion() or main.get_script()==null or main.get_script().resource_path!="res://scripts/main.gd" or main.get("world")!=self:
		return {"ready":false,"reason":"actual_source_clock_main_unbound"}
	return main.read_native_source_player_projectile_context(self)

func read_native_source_frame_input() -> Dictionary:
	var main: Node = get_parent()
	if not is_inside_tree() or is_queued_for_deletion() or not is_instance_valid(main) or main.is_queued_for_deletion() or main.get_script()==null or main.get_script().resource_path!="res://scripts/main.gd" or main.get("world")!=self:
		return {"ready":false,"reason":"actual_platform_frame_input_main_unbound","source_clock_ready":false}
	return main.read_native_source_frame_input(self)

func get_native_world_identity() -> Array:
	# Preserve source ens reference identity. Dynamic appends do not replace it.
	return _enemies

func localize_native_text(value: Variant) -> Variant:
	# The current native slice uses the original Korean strings. Other locales
	# and the original settings/localization owner have not been ported here.
	return value

func get_native_text_font() -> Font:
	if not ResourceLoader.exists(NATIVE_HIT_FX.FONT_PATH, "FontFile"):
		return null
	return ResourceLoader.load(NATIVE_HIT_FX.FONT_PATH, "FontFile") as Font

func emit_native_text(x: float, y: float, text: Variant, color: Variant,
		life: Variant = null, size: Variant = null, num_str: Variant = null) -> bool:
	if not is_instance_valid(_native_floating_text):
		return false
	return _native_floating_text.emit_native_text(x, y, text, color, life, size, num_str)

func get_native_text_snapshot() -> Dictionary:
	return _native_floating_text.get_snapshot() if is_instance_valid(_native_floating_text) else {"ready": false}

func get_native_map_surface_context() -> Dictionary:
	# Read only the current canonical map contract. The surface owns no layout,
	# mask, collision, navigation or scene-generation policy.
	return {"schema": map_data.get("schema"), "stage": map_data.get("stage"),
		"width": map_data.get("width"), "height": map_data.get("height"),
		"tile_size": map_data.get("tile_size")}

## Native-view input only. The existing collision rectangle export is the
## geometry authority; these new deterministic view IDs are not authored props.
func get_native_floor_view_source() -> Dictionary:
	var reason: String = _native_floor_view_source_error()
	return {"schema":"fdg.native-floor-view-source.v1", "ready":reason.is_empty(),
		"status":"NATIVE_VIEW_SOURCE_AVAILABLE" if reason.is_empty() else "NOT_READY", "reason":reason,
		"scope":"approved_native_ch1_collision_rectangles_only", "publisher_owner":self,
		"source_file":MAP_FILE, "stage":map_data.get("stage"), "tile_size":map_data.get("tile_size"),
		"wall_count":map_data.get("collision_rects", []).size() if reason.is_empty() else 0,
		"floor_reader":Callable(self,"get_native_floor_wall_packet") if reason.is_empty() else Callable(),
		"current_texture_reader":Callable(self,"get_native_current_source_object_texture") if reason.is_empty() else Callable(),
		"height_supplied":false, "material_assigned":false, "full_source_floor_ready":false}

func get_native_floor_wall_packet() -> Array:
	if not _native_floor_view_source_error().is_empty(): return []
	var walls: Array = []
	for index in range(map_data.collision_rects.size()):
		var rect: Array = map_data.collision_rects[index]
		var x: float = rect[0]
		var y: float = rect[1]
		var width: float = rect[2]
		var height: float = rect[3]
		walls.append({"id":"native_wall_rect_%04d" % index,
			"world":[x + width * 0.5, y + height * 0.5], "rot":0, "scale":1.0,
			"ground_footprint":[Vector2(x,y),Vector2(x+width,y),Vector2(x+width,y+height),Vector2(x,y+height)],
			"source_rect":rect.duplicate(), "source_index":index,
			"source_kind":"CANONICAL_NATIVE_COLLISION_RECT", "height":null, "meta":{},
			"authored_prop_id":false, "geometry_edited":false})
	return walls

func _native_floor_view_source_error() -> String:
	var reason: String = _native_resource_registry_lifecycle_error()
	if not reason.is_empty(): return reason
	var main: Node = get_parent()
	if not ready_for_player or not is_instance_valid(main) or main.get_script() == null \
			or main.get_script().resource_path != "res://scripts/main.gd" or main.get("world") != self \
			or not is_instance_valid(player) or player.is_queued_for_deletion() or main.get("player") != player \
			or player.get_parent() != main or global_transform != Transform2D.IDENTITY:
		return "actual_native_floor_owner_missing"
	var context: Dictionary = get_native_map_surface_context()
	if context.get("schema") != "exoduser.godot.ch1-native-first.v1" or context.get("stage") != 0 \
			or context.get("width") != 200 or context.get("height") != 200 or context.get("tile_size") != 40 \
			or not map_data.get("collision_rects") is Array:
		return "unsupported_native_floor_context"
	for rect in map_data.collision_rects:
		if not rect is Array or rect.size() != 4: return "invalid_native_collision_rect"
		for value in rect:
			if not (value is int or value is float) or not is_finite(float(value)): return "invalid_native_collision_rect"
		if rect[2] <= 0 or rect[3] <= 0: return "invalid_native_collision_rect"
	return ""

## Original-pipeline current texture, not the mapped approximate prop image.
## This owner alone accesses its image holder; consumers receive no private field.
func get_native_current_source_object_texture(source_key: String) -> Dictionary:
	var publication: Dictionary = get_native_source_object_image(source_key)
	var reason: String = publication.get("reason", "")
	var image: Variant = publication.get("image")
	var texture: Texture2D = null
	if reason.is_empty() and image is RawSourceImageEntry and image._phase == "LOADED" and image._complete:
		texture = image._texture
	if reason.is_empty() and (not is_instance_valid(texture) or texture.get_width() <= 0 or texture.get_height() <= 0):
		reason = "CURRENT_SOURCE_TEXTURE_NOT_LOADED"
	return {"schema":"fdg.native-current-object-texture.v1", "publisher_owner":self, "source_key":source_key,
		"ready":reason.is_empty(), "status":"CURRENT_SOURCE_TEXTURE_AVAILABLE" if reason.is_empty() else "NOT_READY",
		"reason":reason, "texture":texture if reason.is_empty() else null,
		"source_path":CANONICAL_SOURCE_OBJECT_DECLARATIONS.get(source_key, {}).get("src", ""),
		"original_pixel_identity_proven":false, "processing_pixel_parity_verified":false, "full_stage_ready":false}

func get_native_baked_environment_publication() -> Dictionary:
	# Publish only the existing selected source chunks. No map/height/texture
	# construction, fallback artwork or admission mutation happens here.
	var main: Node = get_parent()
	var result := {"schema":"fdg.native-baked-environment.v1","ready":false,"reason":"actual_baked_owner_missing",
		"source_root":"assets/map/ch1/production_finish","phase":"smoothing","source_over":true,
		"declared":0,"entries":[],"source_nodes":[],"terrain_height_supplied":false,"full_composition_ported":false}
	if not is_inside_tree() or is_queued_for_deletion() or not ready_for_player or not is_instance_valid(main) or main.is_queued_for_deletion() or not main.is_inside_tree() or main.get("world") != self or main.get_script() == null or main.get_script().resource_path != "res://scripts/main.gd" or global_transform != Transform2D.IDENTITY:
		return result
	if map_data.get("stage") != 0 or map_data.get("width") != 200 or map_data.get("height") != 200 or map_data.get("tile_size") != 40 or _chunk_specs.size() != 64:
		result.reason="unsupported_current_baked_context"
		return result
	result.declared=_chunk_specs.size()
	result.source_nodes=_chunks.values().duplicate()
	for spec in _chunk_specs:
		var key: String = str(spec.get("x"))+","+str(spec.get("y"))
		var source: Variant = spec.get("source_rect")
		var wr: Variant = spec.get("world_rect")
		var declaration_valid: bool = source is Array and source.size() == 4 and wr is Array and wr.size() == 4 and str(spec.get("texture","")).begins_with("res://assets/map/production_finish/")
		if declaration_valid:
			for index in range(4):
				declaration_valid = declaration_valid and (source[index] is int or source[index] is float) and is_finite(float(source[index])) and float(source[index]) == float([1,1,1024,1024][index]) and (wr[index] is int or wr[index] is float) and is_finite(float(wr[index]))
			declaration_valid = declaration_valid and float(wr[2]) > 0 and float(wr[3]) > 0
		if not declaration_valid:
			result.reason="invalid_source_chunk_declaration"
			result.entries=[]
			return result
		if not _chunks.has(key): continue
		var candidate: Variant = _chunks[key]
		if not is_instance_valid(candidate) or not candidate is Sprite2D:
			result.reason="current_source_chunk_owner_lost"
			result.entries=[]
			return result
		var sprite: Sprite2D = candidate
		var rect := Rect2(float(wr[0]),float(wr[1]),float(wr[2]),float(wr[3]))
		var crop := Rect2(float(source[0]),float(source[1]),float(source[2]),float(source[3]))
		if not is_instance_valid(sprite) or sprite.is_queued_for_deletion() or sprite.get_parent() != self or not sprite.is_inside_tree() or sprite.texture == null or sprite.texture.resource_path != spec.texture or sprite.texture.get_size() != Vector2(1026,1026) or not sprite.region_enabled or sprite.region_rect != crop or not sprite.position.is_equal_approx(rect.get_center()) or not (sprite.scale*crop.size).is_equal_approx(rect.size):
			result.reason="current_source_chunk_not_ready_or_mismatched"
			result.entries=[]
			return result
		result.entries.append({"id":key,"node":sprite,"texture":sprite.texture,"source_rect":crop,"world_rect":rect,
			"visible":sprite.is_visible_in_tree(),"modulate":sprite.modulate,"blend":"source-over","filter":"linear","height":null})
	result.ready=not result.entries.is_empty()
	result.reason="" if result.ready else "no_current_chunks_admitted"
	return result

func get_native_ground_surface_snapshot() -> Dictionary:
	return _native_ground_surface.get_snapshot() if is_instance_valid(_native_ground_surface) else {"ready": false}

## These are the existing native prop load admissions, not the source _OBJ_SPR
## collection. The returned Array is fresh; each entry retains its actual identity.
## A lost registry returns null rather than manufacturing an empty live collection.
func get_native_resource_load_entries() -> Variant:
	if _native_resource_registry_lifecycle_error() != "":
		return null
	return _native_resource_load_entries.duplicate()

func get_native_resource_load_texture(entry: Variant) -> Variant:
	if _native_resource_entry_error(entry) != "":
		return null
	return entry._texture

## Source declarations and native path bindings are metadata, not new images.
func get_native_source_image_declarations() -> Dictionary:
	return {"schema": NATIVE_SOURCE_IMAGE_MAPPING_SCHEMA,
		"canonical_commit": SOURCE_CANONICAL_COMMIT,
		"source_object_count": CANONICAL_SOURCE_OBJECT_DECLARATIONS.size(),
		"objects": CANONICAL_SOURCE_OBJECT_DECLARATIONS.duplicate(true),
		"native_prop_paths": NATIVE_SOURCE_PROP_PATHS.duplicate(true),
		"extra_globals": CANONICAL_SOURCE_EXTRA_GLOBALS.duplicate(true),
		"extra_declared_slot_count": 14 + CANONICAL_SOURCE_EXTRA_GLOBALS["_bossGateImgs"]["paths"].size(),
		"declaration_only": true, "source_mapping_complete": false}

## Original extra constructors in source order. Resource requests are native
## synchronous; onload callbacks are deferred on this World, not fake timers.
func register_native_source_extra_images() -> Dictionary:
	var reason = _native_resource_registry_lifecycle_error()
	if reason != "":
		return {"status": "NOT_READY", "reason": reason, "schema": SOURCE_EXTRA_IMAGE_SCHEMA}
	if _source_extra_state != "UNBOUND":
		return {"status": "ALREADY_REGISTERED" if _source_extra_state == "REGISTERED" else "NOT_READY",
			"reason": "source_extra_constructor_once", "snapshot": get_native_source_extra_images_snapshot()}
	_source_extra_state = "REGISTERING"
	var epoch = _source_extra_epoch
	for name in ["_skullWallImg", "_wallEdgeImg", "_voidVistaImg", "_pathBgImg", "_bossRoomBg"]:
		var raw = _new_native_source_extra_image(name, CANONICAL_SOURCE_EXTRA_GLOBALS[name]["src"])
		if _source_extra_epoch != epoch or _source_extra_image_error(raw) != "":
			return {"status": "NOT_READY", "reason": "SOURCE_EXTRA_REGISTRATION_OWNER_LOST"}
		_source_extra_globals[name] = raw
		_request_native_source_extra_image(raw)
		if _source_extra_epoch != epoch or _source_extra_lifecycle_error() != "":
			return {"status": "NOT_READY", "reason": "SOURCE_EXTRA_REGISTRATION_OWNER_LOST"}
	_source_extra_globals["_bossGateImgs"] = _source_extra_gate_images
	var gate_paths: Array = CANONICAL_SOURCE_EXTRA_GLOBALS["_bossGateImgs"]["paths"]
	for index in range(gate_paths.size()):
		var raw = _new_native_source_extra_image("_bossGateImgs[%d]" % index, gate_paths[index])
		if _source_extra_epoch != epoch or _source_extra_image_error(raw) != "":
			return {"status": "NOT_READY", "reason": "SOURCE_EXTRA_REGISTRATION_OWNER_LOST"}
		_request_native_source_extra_image(raw)
		if _source_extra_epoch != epoch or _source_extra_lifecycle_error() != "":
			return {"status": "NOT_READY", "reason": "SOURCE_EXTRA_REGISTRATION_OWNER_LOST"}
		# Source sets src before pushing the original Image. Deferred onload
		# later replaces only this index; already captured raw refs stay alive.
		_source_extra_gate_images.append(raw)
	var impact = _new_native_source_extra_image("_impSpr", CANONICAL_SOURCE_EXTRA_GLOBALS["_impSpr"]["src"])
	if _source_extra_epoch != epoch or _source_extra_image_error(impact) != "":
		return {"status": "NOT_READY", "reason": "SOURCE_EXTRA_REGISTRATION_OWNER_LOST"}
	_source_extra_globals["_impSpr"] = impact
	_request_native_source_extra_image(impact)
	if _source_extra_epoch != epoch or _source_extra_lifecycle_error() != "":
		return {"status": "NOT_READY", "reason": "SOURCE_EXTRA_REGISTRATION_OWNER_LOST"}
	_source_extra_globals["_GROUND_TILES"] = _source_extra_ground_images
	for key in SOURCE_GROUND_WAIT_KEYS:
		var raw = _new_native_source_extra_image("_GROUND_TILES." + key,
			CANONICAL_SOURCE_EXTRA_GLOBALS["_GROUND_TILES"]["paths"][key])
		if _source_extra_epoch != epoch or _source_extra_image_error(raw) != "":
			return {"status": "NOT_READY", "reason": "SOURCE_EXTRA_REGISTRATION_OWNER_LOST"}
		_request_native_source_extra_image(raw)
		if _source_extra_epoch != epoch or _source_extra_lifecycle_error() != "":
			return {"status": "NOT_READY", "reason": "SOURCE_EXTRA_REGISTRATION_OWNER_LOST"}
		_source_extra_ground_images[key] = raw
	_source_extra_state = "REGISTERED"
	return {"status": "SOURCE_EXTRA_REGISTERED", "schema": SOURCE_EXTRA_IMAGE_SCHEMA,
		"source_scope": "exact_wait_extra_21_slots", "source_global_parity_proven": false,
		"snapshot": get_native_source_extra_images_snapshot()}

func get_native_source_extra_image_entries() -> Variant:
	if _source_extra_lifecycle_error() != "":
		return null
	return _source_extra_images.duplicate()

func get_native_source_extra_images_snapshot() -> Dictionary:
	var entries: Array = []
	var raw_count = 0
	var canvas_count = 0
	for image in _source_extra_images:
		if image._kind == "Image":
			raw_count += 1
		else:
			canvas_count += 1
		entries.append({"sequence": image._sequence, "slot": image._slot,
			"reference_kind": image._kind, "source_src": image._source_src,
			"native_resource_path": image._native_path, "phase": image._phase,
			"requested": image._requested, "pending": image._pending, "terminal": image._terminal,
			"complete": image._complete if image._kind == "Image" else null,
			"naturalWidth": image._natural_width if image._kind == "Image" else null,
			"declared_undefined_fields": [] if image._kind == "Image" else ["src", "complete", "naturalWidth"],
			"image_instance_id": image.get_instance_id(),
			"texture_instance_id": image._texture.get_instance_id() if is_instance_valid(image._texture) else 0,
			"failure_reason": image._failure_reason, "processing_gap": image._processing_gap,
			"fallback_attempted": image._fallback_attempted})
	var current_gate_ids: Array = []
	for image in _source_extra_gate_images:
		current_gate_ids.append(image.get_instance_id())
	return {"schema": SOURCE_EXTRA_IMAGE_SCHEMA, "registration_state": _source_extra_state,
		"status": "SOURCE_EXTRA_REGISTRY_AVAILABLE" if _source_extra_lifecycle_error() == "" else "NOT_READY",
		"reason": _source_extra_lifecycle_error(), "raw_entries": raw_count,
		"canvas_entries": canvas_count, "extra_wait_slots": 21,
		"current_gate_instance_ids": current_gate_ids, "globals_declared": _source_extra_globals.size(),
		"ground_wait_keys": SOURCE_GROUND_WAIT_KEYS.duplicate(), "load_calls": _source_extra_load_calls,
		"deferred_onloads_pending": _source_extra_deferred_pending, "events": _source_extra_events.duplicate(true),
		"onload_dispatch_scope": "original_defined_callbacks_only_16",
		"entries": entries, "refresh_callback_gaps": _source_extra_refresh_gaps.duplicate(),
		"unported_ground_keys": ["gt_03", "gt_void_wall"],
		"compatibility_branch": "native_desktop_remove_white_bg", "source_platform_predicates_bound": false,
		"source_platform_parity_proven": false, "browser_async_timing_parity_proven": false,
		"source_obj_spr_coverage_bound": false, "source_wait_complete": false,
		"full_stage_ready": false, "gpu_render_proven": false}

func cancel_native_source_extra_images(reason: String = "CALLER_CANCEL") -> Dictionary:
	_source_extra_state = "CANCELLED"
	_withdraw_native_source_extra_images()
	return {"status": "CANCELLED", "reason": reason, "source_wait_complete": false}

func _source_extra_lifecycle_error() -> String:
	var reason = _native_resource_registry_lifecycle_error()
	if reason != "":
		return reason
	if _source_extra_state not in ["REGISTERING", "REGISTERED"]:
		return "SOURCE_EXTRA_REGISTRY_" + _source_extra_state
	return ""

func _source_extra_image_error(image: Variant) -> String:
	var reason = _source_extra_lifecycle_error()
	if reason != "":
		return reason
	if typeof(image) != TYPE_OBJECT or not is_instance_valid(image) or not (image is RawSourceImageEntry):
		return "SOURCE_EXTRA_IMAGE_NOT_OWNED"
	if image._scope != "extra":
		return "SOURCE_EXTRA_IMAGE_SCOPE_MISMATCH"
	if image._owner_ref == null or not is_same(image._owner_ref.get_ref(), self) or image._epoch != _source_extra_epoch:
		return "SOURCE_EXTRA_IMAGE_OWNER_LOST"
	if not _source_extra_images.has(image):
		return "SOURCE_EXTRA_IMAGE_NOT_REGISTERED"
	if image._processing_gap != "":
		return image._processing_gap
	if image._phase == "LOADED" and not is_instance_valid(image._texture):
		return "SOURCE_EXTRA_IMAGE_TEXTURE_LOST"
	return ""

func _new_native_source_extra_image(slot: String, src: String) -> RawSourceImageEntry:
	var image = RawSourceImageEntry.new()
	image._owner_ref = weakref(self)
	image._epoch = _source_extra_epoch
	image._sequence = _source_extra_images.size() + 1
	image._slot = slot
	image._source_src = src
	image._native_path = "res://" + src.split("?", false, 1)[0]
	_source_extra_images.append(image)
	_emit_native_source_extra_image(image, "CONSTRUCTED")
	return image

func _emit_native_source_extra_image(image: RawSourceImageEntry, phase: String) -> void:
	_source_extra_events.append({"sequence": image._sequence, "slot": image._slot,
		"phase": phase, "image_instance_id": image.get_instance_id()})
	native_source_extra_image_changed.emit(image, phase)

func _request_native_source_extra_image(image: RawSourceImageEntry) -> void:
	if _source_extra_image_error(image) != "":
		return
	image._requested = true
	image._pending = true
	image._phase = "PENDING"
	_source_extra_load_calls += 1
	_emit_native_source_extra_image(image, "PENDING")
	if _source_extra_image_error(image) != "":
		return
	var returned: Variant = load(image._native_path)
	image._pending = false
	image._terminal = true
	image._complete = true
	if returned is Texture2D and is_instance_valid(returned) and returned.get_width() > 0 and returned.get_height() > 0:
		image._texture = returned
		image._natural_width = returned.get_width()
		image._natural_height = returned.get_height()
		image._phase = "LOADED"
		if image._slot.begins_with("_bossGateImgs[") or image._slot == "_pathBgImg" or image._slot.begins_with("_GROUND_TILES."):
			_source_extra_deferred_pending += 1
			call_deferred("_native_source_extra_onload", image, _source_extra_epoch)
	else:
		image._phase = "ERROR"
		image._failure_reason = "SOURCE_EXTRA_NATIVE_LOAD_FAILED:" + image._slot
		_emit_native_source_extra_image(image, "ERROR")
		if _source_extra_image_error(image) != "":
			return
		if image._slot.begins_with("_GROUND_TILES."):
			_native_source_ground_fallback(image)
		else:
			return
	if _source_extra_image_error(image) != "":
		return
	_emit_native_source_extra_image(image, image._phase)

func _native_source_ground_fallback(image: RawSourceImageEntry) -> void:
	# Original onerror clears itself, changes SAME Image.src to _FB64, then
	# performs a real fallback decode. No file absence is turned into success.
	if _source_extra_image_error(image) != "":
		return
	image._fallback_attempted = true
	image._source_src = SOURCE_GROUND_FALLBACK_URI
	image._pending = true
	image._terminal = false
	image._complete = false
	image._phase = "PENDING_FALLBACK"
	_emit_native_source_extra_image(image, "PENDING_FALLBACK")
	if _source_extra_image_error(image) != "":
		return
	var decoded = Image.new()
	var err = decoded.load_png_from_buffer(Marshalls.base64_to_raw(SOURCE_GROUND_FALLBACK_URI.get_slice(",", 1)))
	image._pending = false
	image._terminal = true
	image._complete = true
	if err == OK and decoded.get_width() > 0 and decoded.get_height() > 0:
		image._cpu_image = decoded
		image._texture = ImageTexture.create_from_image(decoded)
		image._natural_width = decoded.get_width()
		image._natural_height = decoded.get_height()
		image._phase = "LOADED"
		_source_extra_deferred_pending += 1
		call_deferred("_native_source_extra_onload", image, _source_extra_epoch)
	else:
		image._phase = "ERROR"
		image._failure_reason = "SOURCE_GROUND_FALLBACK_DECODE_FAILED"

func _native_source_extra_onload(image: RawSourceImageEntry, epoch: int) -> void:
	if epoch != _source_extra_epoch or _source_extra_image_error(image) != "":
		return
	_source_extra_deferred_pending -= 1
	if image._slot.begins_with("_bossGateImgs["):
		var index = int(image._slot.get_slice("[", 1).trim_suffix("]"))
		if index >= _source_extra_gate_images.size() or not is_same(_source_extra_gate_images[index], image):
			image._processing_gap = "SOURCE_GATE_CURRENT_REFERENCE_CHANGED"
			return
		var canvas = _native_source_remove_white_bg(image)
		if canvas != null:
			_source_extra_gate_images[index] = canvas
			_emit_native_source_extra_image(canvas, "CURRENT_CANVAS_REPLACED")
			if _source_extra_image_error(canvas) != "":
				return
		_source_extra_refresh_gaps.append("game.html:18667 conditional _queueMapCacheRefresh unbound")
	elif image._slot == "_pathBgImg":
		_source_extra_refresh_gaps.append("game.html:11988-11992 stream reset/conditional _queueMapCacheRefresh unbound")
	elif image._slot.begins_with("_GROUND_TILES."):
		_source_extra_refresh_gaps.append("game.html:27213 conditional _queueMapCacheRefresh unbound")

func _native_source_remove_white_bg(raw: RawSourceImageEntry) -> RawSourceImageEntry:
	if OS.get_name() not in ["macOS", "Windows", "Linux", "FreeBSD", "NetBSD", "OpenBSD", "BSD"]:
		raw._processing_gap = "NATIVE_DESKTOP_COMPATIBILITY_BRANCH_UNAVAILABLE"
		return null
	var source_image: Image = raw._texture.get_image()
	if source_image == null or source_image.is_empty():
		raw._processing_gap = "SOURCE_GATE_CPU_IMAGE_UNAVAILABLE"
		return null
	var canvas_image = source_image.duplicate() as Image
	canvas_image.convert(Image.FORMAT_RGBA8)
	var rgba: PackedByteArray = canvas_image.get_data()
	for index in range(0, rgba.size(), 4):
		var r = int(rgba[index])
		var g = int(rgba[index + 1])
		var b = int(rgba[index + 2])
		var avg = float(r + g + b) / 3.0
		if avg > 220.0 and absi(r - g) < 20 and absi(g - b) < 20:
			rgba[index + 3] = 0
		elif avg > 180.0 and absi(r - g) < 25 and absi(g - b) < 25:
			rgba[index + 3] = int(float(rgba[index + 3]) * maxf(0.0, (avg - 180.0) / 40.0 * -1.0 + 1.0))
	canvas_image = Image.create_from_data(canvas_image.get_width(), canvas_image.get_height(), false, Image.FORMAT_RGBA8, rgba)
	var canvas = RawSourceImageEntry.new()
	canvas._owner_ref = weakref(self)
	canvas._epoch = _source_extra_epoch
	canvas._sequence = _source_extra_images.size() + 1
	canvas._slot = raw._slot
	canvas._kind = "Canvas"
	canvas._phase = "LOADED"
	canvas._terminal = true
	canvas._cpu_image = canvas_image
	canvas._texture = ImageTexture.create_from_image(canvas_image)
	_source_extra_images.append(canvas)
	return canvas

func _read_native_source_extra_image_field(image: Variant, field: String) -> Dictionary:
	var reason = _source_extra_image_error(image)
	var record = {"publisher_owner": self, "image_reference": image, "field": field,
		"field_present": false, "status": "NOT_READY", "reason": reason,
		"source_publication_kind": SOURCE_EXTRA_ACTUAL_KIND,
		"source_scope": "actual_native_extra_image_constructor_fields", "full_stage_ready": false}
	if reason != "":
		return record
	if field not in ["src", "complete", "naturalWidth"]:
		record["reason"] = "SOURCE_EXTRA_IMAGE_FIELD_UNSUPPORTED:" + field
		return record
	record["native_publication_state"] = "LOADING" if image._pending else ("LOADED" if image._phase == "LOADED" else "ERROR")
	record["field_present"] = true
	record["status"] = "SOURCE_EXTRA_FIELD_PUBLISHED"
	record["reason"] = ""
	record["declared_undefined"] = image._kind == "Canvas"
	if image._kind == "Canvas":
		record["value"] = null
	else:
		record["value"] = image._source_src if field == "src" else (image._complete if field == "complete" else image._natural_width)
	record["native_texture_reference"] = image._texture
	return record

func _withdraw_native_source_extra_images() -> void:
	_source_extra_epoch += 1
	for image in _source_extra_images:
		image._texture = null
		image._cpu_image = null
	_source_extra_images.clear()
	_source_extra_globals.clear()
	_source_extra_gate_images.clear()
	_source_extra_ground_images.clear()
	_source_extra_deferred_pending = 0

## Original constructor order: initial33, CH_DECO230 new/20 reused, dragons2.
## This registry is independent of both native prop mapping and extra images.
func get_source_object_meta_publication() -> Dictionary:
	var reason = _source_object_meta_lifecycle_error()
	if reason == "" and _source_object_meta_current.size() != _source_object_meta_owned_refs.size():
		reason = "SOURCE_OBJECT_META_CURRENT_KEYSET_CHANGED"
	if reason == "":
		for key in _source_object_meta_owned_refs:
			reason = _source_object_meta_entry_error(key)
			if reason != "":
				break
	return {"publisher_owner": self, "schema": SOURCE_OBJECT_META_SCHEMA,
		"publication_kind": "ACTUAL_SOURCE_OBJECT_META_PUBLICATION",
		"status": "SOURCE_OBJECT_META_CURRENT_PUBLISHED" if reason == "" else "NOT_READY",
		"reason": reason, "obj_meta": _source_object_meta_current if reason == "" else null,
		"registration_state": _source_object_meta_state, "epoch": _source_object_meta_epoch,
		"current_keys": _source_object_meta_current.size(), "initial_keys": SOURCE_OBJECT_INITIAL_META.size(),
		"deco_merge_count": _source_object_meta_merge_count, "sequence": _source_object_meta_sequence,
		"callback_write_count": _source_object_meta_callback_write_count,
		"events": _source_object_meta_events.duplicate(true), "gaps": _source_object_meta_gaps.duplicate(),
		"unbound_filter_baked_writers": SOURCE_OBJECT_CSS_FILTERS.keys(),
		"source_scope": "actual_original_meta_initialization_inplace_merge_current_writer",
		"source_obj_spr_coverage_bound": false, "source_wait_complete": false, "full_stage_ready": false}

func get_native_source_object_meta(source_key: String, field: String = "") -> Dictionary:
	var reason = _source_object_meta_entry_error(source_key)
	var meta: Variant = _source_object_meta_current.get(source_key) if reason == "" else null
	var presence: Dictionary = {}
	var undefined_fields: Array = []
	if reason == "":
		for name in meta:
			presence[name] = true
			if _source_object_meta_undefined[source_key].has(name) and meta[name] == null:
				undefined_fields.append(name)
	var present = reason == "" and (field == "" or meta.has(field))
	var undefined = present and field != "" and _source_object_meta_undefined[source_key].has(field) and meta[field] == null
	return {"publisher_owner": self, "schema": SOURCE_OBJECT_META_SCHEMA, "source_key": source_key,
		"status": "SOURCE_OBJECT_META_CURRENT_AVAILABLE" if reason == "" else "NOT_READY", "reason": reason,
		"meta": meta, "present": present, "field": field, "field_present": present,
		"declared_undefined": undefined, "value": (meta if field == "" else meta.get(field)) if present else null,
		"field_presence": presence, "declared_undefined_fields": undefined_fields,
		"sequence": _source_object_meta_sequences.get(source_key, 0), "epoch": _source_object_meta_epoch,
		"source_scope": "same_current_original_meta_dictionary_fields", "full_stage_ready": false}

func _source_object_meta_lifecycle_error() -> String:
	var reason = _source_object_lifecycle_error()
	if reason != "":
		return reason
	if _source_object_meta_state not in ["INITIALIZING", "INITIALIZED", "MERGING", "MERGED"]:
		return "SOURCE_OBJECT_META_" + _source_object_meta_state
	if _source_object_meta_epoch != _source_object_epoch:
		return "SOURCE_OBJECT_META_EPOCH_LOST"
	if _source_object_meta_namespace_ref == null or not is_same(_source_object_meta_namespace_ref, _source_object_meta_current):
		return "SOURCE_OBJECT_META_CURRENT_NAMESPACE_CHANGED"
	return ""

func _source_object_meta_entry_error(source_key: String) -> String:
	var reason = _source_object_meta_lifecycle_error()
	if reason != "":
		return reason
	if not _source_object_meta_current.has(source_key):
		return "SOURCE_OBJECT_META_KEY_ABSENT:" + source_key
	if not _source_object_meta_owned_refs.has(source_key) \
			or not is_same(_source_object_meta_current[source_key], _source_object_meta_owned_refs[source_key]):
		return "SOURCE_OBJECT_META_CURRENT_REFERENCE_CHANGED:" + source_key
	return ""

func _initialize_native_source_object_meta() -> bool:
	if _source_object_lifecycle_error() != "" or _source_object_meta_state != "UNBOUND":
		return false
	_source_object_meta_state = "INITIALIZING"
	_source_object_meta_epoch = _source_object_epoch
	_source_object_meta_current = {}
	_source_object_meta_namespace_ref = _source_object_meta_current
	for key in SOURCE_OBJECT_INITIAL_META:
		if _source_object_meta_lifecycle_error() != "":
			return false
		var meta: Dictionary = SOURCE_OBJECT_INITIAL_META[key].duplicate(true)
		_register_native_source_object_meta_ref(key, meta)
		_emit_native_source_object_meta(key, meta, "INITIALIZED")
		if _source_object_meta_entry_error(key) != "":
			return false
	_source_object_meta_state = "INITIALIZED"
	return true

func _register_native_source_object_meta_ref(source_key: String, meta: Dictionary) -> void:
	_source_object_meta_sequence += 1
	_source_object_meta_current[source_key] = meta
	_source_object_meta_owned_refs[source_key] = meta
	_source_object_meta_undefined[source_key] = {}
	_source_object_meta_sequences[source_key] = _source_object_meta_sequence

func _source_meta_js_truthy(value: Variant) -> bool:
	match typeof(value):
		TYPE_NIL:
			return false
		TYPE_BOOL:
			return value
		TYPE_INT, TYPE_FLOAT:
			return value != 0 and not is_nan(float(value))
		TYPE_STRING:
			return not value.is_empty()
	return true

func _merge_native_source_object_meta(source_key: String) -> bool:
	if _source_object_meta_lifecycle_error() != "" or not _source_object_meta_deco_inputs.has(source_key):
		return false
	_source_object_meta_state = "MERGING"
	var d: Dictionary = _source_object_meta_deco_inputs[source_key]
	if not _source_object_meta_current.has(source_key):
		_register_native_source_object_meta_ref(source_key, {})
	if _source_object_meta_entry_error(source_key) != "":
		return false
	var prev: Dictionary = _source_object_meta_current[source_key]
	var prev_undefined: Dictionary = _source_object_meta_undefined[source_key]
	var assigned: Dictionary = {}
	var assigned_undefined: Dictionary = {}
	for field in SOURCE_OBJECT_META_MERGE_FIELDS:
		var d_field: String = "renderLayer" if field == "_renderLayer" else field
		var d_present = d.has(d_field)
		var d_value: Variant = d.get(d_field)
		var prev_present = prev.has(field)
		var prev_value: Variant = prev.get(field)
		var value: Variant = null
		var undefined = false
		if field in ["alpha", "filter", "edgeErase", "blend", "_renderLayer", "renderLayer", "pivotX", "pivotY"]:
			value = d_value if d_present else prev_value
			undefined = not d_present and (not prev_present or (prev_undefined.has(field) and prev_value == null))
		elif field in ["sz", "light", "large", "mega", "rot", "flip"]:
			value = d_value if _source_meta_js_truthy(d_value) else (32 if field == "sz" else 0)
		else:
			if _source_meta_js_truthy(d_value):
				value = d_value
			elif _source_meta_js_truthy(prev_value):
				value = prev_value
			elif field in ["col", "keepAR", "squareDraw", "collision"]:
				value = false if field == "collision" else 0
			else:
				value = prev_value
				undefined = not prev_present or (prev_undefined.has(field) and prev_value == null)
		assigned[field] = value
		if undefined:
			assigned_undefined[field] = true
	# Evaluate all RHS fields first, then Object.assign writes the SAME _prev.
	for field in assigned:
		prev[field] = assigned[field]
		if assigned_undefined.has(field):
			prev_undefined[field] = true
		else:
			prev_undefined.erase(field)
	_source_object_meta_current[source_key] = prev
	_source_object_meta_merge_count += 1
	_emit_native_source_object_meta(source_key, prev, "MERGED")
	if _source_object_meta_entry_error(source_key) != "":
		return false
	if _source_object_meta_merge_count == SOURCE_OBJECT_DECO_META_INPUTS.size():
		_source_object_meta_state = "MERGED"
	return true

func _emit_native_source_object_meta(source_key: String, meta: Dictionary, phase: String) -> void:
	_source_object_meta_events.append({"source_key": source_key, "phase": phase,
		"sequence": _source_object_meta_sequences[source_key], "merge_count": _source_object_meta_merge_count,
		"callback_write_count": _source_object_meta_callback_write_count, "epoch": _source_object_meta_epoch})
	native_source_object_meta_changed.emit(source_key, meta, phase)

func _write_native_source_object_meta_edge(source_key: String, epoch: int) -> bool:
	if epoch != _source_object_epoch or _source_object_meta_entry_error(source_key) != "":
		return false
	if not SOURCE_OBJECT_EDGE_AMOUNTS.has(source_key) or not _source_object_current.has(source_key):
		return false
	var current: Variant = _source_object_current[source_key]
	if _source_object_image_error(current) != "" or current._kind != "Canvas" \
			or current._replacement_kind != "edge_erase" \
			or current._special_flags.get("_edgeErased") != SOURCE_OBJECT_EDGE_AMOUNTS[source_key]:
		return false
	var meta: Dictionary = _source_object_meta_current[source_key]
	meta["_edgeErased"] = 1
	_source_object_meta_undefined[source_key].erase("_edgeErased")
	_source_object_meta_callback_write_count += 1
	_source_object_meta_gaps.erase(source_key)
	_emit_native_source_object_meta(source_key, meta, "CALLBACK_WRITE")
	return epoch == _source_object_epoch and _source_object_meta_entry_error(source_key) == ""

func _withdraw_native_source_object_meta() -> void:
	_source_object_meta_state = _source_object_state
	_source_object_meta_namespace_ref = null
	_source_object_meta_current.clear()
	_source_object_meta_owned_refs.clear()
	_source_object_meta_undefined.clear()
	_source_object_meta_sequences.clear()
	_source_object_meta_deco_inputs.clear()

func register_native_source_object_images() -> Dictionary:
	var reason = _native_resource_registry_lifecycle_error()
	if reason != "":
		return {"status": "NOT_READY", "reason": reason, "schema": SOURCE_OBJECT_IMAGE_SCHEMA}
	if _source_object_state != "UNBOUND":
		return {"status": "ALREADY_REGISTERED" if _source_object_state in ["REGISTERED", "REGISTERED_PARTIAL"] else "NOT_READY",
			"reason": "source_object_constructor_once", "snapshot": get_native_source_object_images_snapshot()}
	_source_object_state = "REGISTERING"
	var epoch = _source_object_epoch
	_source_object_meta_deco_inputs = SOURCE_OBJECT_DECO_META_INPUTS.duplicate(true)
	for key in CANONICAL_SOURCE_OBJECT_DECLARATIONS:
		var declaration: Dictionary = CANONICAL_SOURCE_OBJECT_DECLARATIONS[key]
		if declaration["deco_error_fallback"] and _source_object_meta_state == "UNBOUND":
			if not _initialize_native_source_object_meta():
				return {"status": "NOT_READY", "reason": "SOURCE_OBJECT_META_INITIALIZATION_OWNER_LOST"}
		var src: String = declaration["src"]
		var raw: RawSourceImageEntry = _source_object_shared_images.get(src) if declaration["shared_atlas"] else null
		if raw == null:
			raw = _new_native_source_object_image(key, src)
			if epoch != _source_object_epoch or _source_object_image_error(raw) != "":
				return {"status": "NOT_READY", "reason": "SOURCE_OBJECT_REGISTRATION_OWNER_LOST"}
			raw._replacement_kind = declaration["replacement"]
			raw._object_error_handler_active = declaration["deco_error_fallback"]
			if raw._replacement_kind == "filter":
				_source_object_processing_gaps[key] = "SOURCE_OBJ_CSS_FILTER_RASTER_AUTHORITY_UNBOUND:" + key
			if declaration["shared_atlas"]:
				_source_object_shared_images[src] = raw
			_request_native_source_object_image(raw)
			if epoch != _source_object_epoch or _source_object_image_error(raw) != "":
				return {"status": "NOT_READY", "reason": "SOURCE_OBJECT_REGISTRATION_OWNER_LOST"}
		else:
			if epoch != _source_object_epoch or _source_object_image_error(raw) != "":
				return {"status": "NOT_READY", "reason": "SOURCE_OBJECT_SHARED_IMAGE_OWNER_LOST:" + key}
			_source_object_alias_reuses += 1
		_source_object_current[key] = raw
		if declaration["deco_error_fallback"]:
			if not _merge_native_source_object_meta(key):
				return {"status": "NOT_READY", "reason": "SOURCE_OBJECT_META_MERGE_OWNER_LOST:" + key}
	_source_object_state = "REGISTERED_PARTIAL"
	return {"status": "SOURCE_OBJECTS_REGISTERED_PARTIAL", "schema": SOURCE_OBJECT_IMAGE_SCHEMA,
		"source_scope": "canonical_source_object_constructors_current_refs",
		"source_obj_spr_coverage_bound": false, "source_wait_complete": false,
		"snapshot": get_native_source_object_images_snapshot()}

func get_native_source_object_image_entries() -> Variant:
	if _source_object_lifecycle_error() != "":
		return null
	return _source_object_images.duplicate()

func get_native_source_object_image(source_key: String) -> Dictionary:
	var reason = _source_object_lifecycle_error()
	var image: Variant = null
	if reason == "" and not CANONICAL_SOURCE_OBJECT_DECLARATIONS.has(source_key):
		reason = "SOURCE_OBJECT_KEY_UNKNOWN:" + source_key
	if reason == "" and not _source_object_current.has(source_key):
		reason = "SOURCE_OBJ_CURRENT_IMAGE_UNBOUND:" + source_key
	if reason == "":
		image = _source_object_current[source_key]
		reason = _source_object_image_error(image, true)
	if reason == "" and _source_object_processing_gaps.has(source_key):
		reason = _source_object_processing_gaps[source_key]
	return {"publisher_owner": self, "schema": SOURCE_OBJECT_IMAGE_SCHEMA, "source_key": source_key,
		"image": image, "current_entry_valid": reason == "",
		"status": "SOURCE_OBJECT_CURRENT_IMAGE_AVAILABLE" if reason == "" else "NOT_READY",
		"reason": reason, "source_publication_kind": SOURCE_EXTRA_ACTUAL_KIND,
		"source_obj_spr_coverage_bound": false, "source_wait_complete": false, "full_stage_ready": false}

func get_native_source_object_images_snapshot() -> Dictionary:
	var entries: Array = []
	var raw_count = 0
	var canvas_count = 0
	for image in _source_object_images:
		if image._kind == "Image":
			raw_count += 1
		else:
			canvas_count += 1
		entries.append({"sequence": image._sequence, "source_key": image._source_key, "slot": image._slot,
			"reference_kind": image._kind, "scope": image._scope, "canvas_field_policy": image._canvas_field_policy,
			"source_src": image._source_src if image._kind == "Image" else null,
			"native_resource_path": image._native_path, "phase": image._phase,
			"requested": image._requested, "pending": image._pending, "terminal": image._terminal,
			"complete": image._complete, "naturalWidth": image._natural_width, "naturalHeight": image._natural_height,
			"declared_undefined_fields": ["src"] if image._kind == "Canvas" else [],
			"image_instance_id": image.get_instance_id(),
			"texture_instance_id": image._texture.get_instance_id() if is_instance_valid(image._texture) else 0,
			"replacement_kind": image._replacement_kind, "special_flags": image._special_flags.duplicate(),
			"onerror_active": image._object_error_handler_active, "fallback_attempted": image._fallback_attempted,
			"failure_reason": image._failure_reason, "processing_gap": image._processing_gap})
	var current: Array = []
	for key in _source_object_current:
		var image: RawSourceImageEntry = _source_object_current[key]
		current.append({"source_key": key, "image_instance_id": image.get_instance_id(),
			"reference_kind": image._kind, "current_entry_valid": get_native_source_object_image(key)["current_entry_valid"]})
	return {"schema": SOURCE_OBJECT_IMAGE_SCHEMA, "registration_state": _source_object_state,
		"status": "SOURCE_OBJECT_REGISTRY_AVAILABLE" if _source_object_lifecycle_error() == "" else "NOT_READY",
		"reason": _source_object_lifecycle_error(), "raw_entries": raw_count, "canvas_entries": canvas_count,
		"current_keys": _source_object_current.size(), "current_source_keys": _source_object_current.keys(),
		"alias_reuses": _source_object_alias_reuses, "shared_url_groups": _source_object_shared_images.size(),
		"load_calls": _source_object_load_calls, "deferred_onloads_pending": _source_object_deferred_pending,
		"entries": entries, "current_images": current, "events": _source_object_events.duplicate(true),
		"processing_gaps": _source_object_processing_gaps.duplicate(), "metadata_write_gaps": _source_object_meta_gaps.duplicate(),
		"unported_css_filters": SOURCE_OBJECT_CSS_FILTERS.duplicate(),
		"browser_canvas_raster_parity_proven": false, "original_pixel_identity_proven": false,
		"source_obj_spr_coverage_bound": _source_object_capture_error() == "",
		"source_wait_complete": false, "full_stage_ready": false, "gpu_render_proven": false}

func cancel_native_source_object_images(reason: String = "CALLER_CANCEL") -> Dictionary:
	_source_object_state = "CANCELLED"
	_withdraw_native_source_object_images()
	return {"status": "CANCELLED", "reason": reason, "source_wait_complete": false}

func _source_object_lifecycle_error() -> String:
	var reason = _native_resource_registry_lifecycle_error()
	if reason != "":
		return reason
	if _source_object_state not in ["REGISTERING", "REGISTERED", "REGISTERED_PARTIAL"]:
		return "SOURCE_OBJECT_REGISTRY_" + _source_object_state
	return ""

func _source_object_image_error(image: Variant, require_processing_authority: bool = false) -> String:
	var reason = _source_object_lifecycle_error()
	if reason != "":
		return reason
	if typeof(image) != TYPE_OBJECT or not is_instance_valid(image) or not (image is RawSourceImageEntry):
		return "SOURCE_OBJECT_IMAGE_NOT_OWNED"
	if image._scope != "object" or image._owner_ref == null or not is_same(image._owner_ref.get_ref(), self) \
			or image._epoch != _source_object_epoch:
		return "SOURCE_OBJECT_IMAGE_OWNER_LOST"
	if image._canvas_field_policy != "obj_declared_image_fields":
		return "SOURCE_OBJECT_IMAGE_FIELD_POLICY_CHANGED"
	if not _source_object_images.has(image):
		return "SOURCE_OBJECT_IMAGE_NOT_REGISTERED"
	if require_processing_authority and image._processing_gap != "":
		return image._processing_gap
	if image._phase == "LOADED" and not is_instance_valid(image._texture):
		return "SOURCE_OBJECT_IMAGE_TEXTURE_LOST"
	return ""

func _source_object_capture_error() -> String:
	if _source_object_state == "UNBOUND":
		return "SOURCE_OBJ_SPR_COVERAGE_AUTHORITY_UNBOUND"
	var reason = _source_object_lifecycle_error()
	if reason != "":
		return reason
	if _source_object_state == "REGISTERING" or _source_object_current.size() != CANONICAL_SOURCE_OBJECT_DECLARATIONS.size():
		return "SOURCE_OBJ_CURRENT_COVERAGE_INCOMPLETE"
	for key in CANONICAL_SOURCE_OBJECT_DECLARATIONS:
		if not _source_object_current.has(key):
			return "SOURCE_OBJ_CURRENT_IMAGE_UNBOUND:" + key
		reason = _source_object_image_error(_source_object_current[key], true)
		if reason != "":
			return reason
	if not _source_object_processing_gaps.is_empty():
		return _source_object_processing_gaps.values()[0]
	if not _source_object_meta_gaps.is_empty():
		return _source_object_meta_gaps.values()[0]
	if _source_object_deferred_pending != 0:
		return "SOURCE_OBJ_CURRENT_ONLOAD_PROCESSING_PENDING"
	return ""

func _new_native_source_object_image(source_key: String, src: String) -> RawSourceImageEntry:
	var image = RawSourceImageEntry.new()
	image._scope = "object"
	image._canvas_field_policy = "obj_declared_image_fields"
	image._owner_ref = weakref(self)
	image._epoch = _source_object_epoch
	image._sequence = _source_object_images.size() + 1
	image._slot = source_key
	image._source_key = source_key
	image._source_src = src
	image._native_path = "res://" + src.split("?", false, 1)[0]
	_source_object_images.append(image)
	_emit_native_source_object_image(image, "CONSTRUCTED")
	return image

func _emit_native_source_object_image(image: RawSourceImageEntry, phase: String) -> void:
	_source_object_events.append({"sequence": image._sequence, "source_key": image._source_key,
		"phase": phase, "image_instance_id": image.get_instance_id()})
	native_source_object_image_changed.emit(image, phase)

func _request_native_source_object_image(image: RawSourceImageEntry) -> void:
	if _source_object_image_error(image) != "":
		return
	image._requested = true
	image._pending = true
	image._phase = "PENDING"
	_source_object_load_calls += 1
	_emit_native_source_object_image(image, "PENDING")
	if _source_object_image_error(image) != "":
		return
	var returned: Variant = load(image._native_path)
	image._pending = false
	image._terminal = true
	image._complete = true
	if returned is Texture2D and is_instance_valid(returned) and returned.get_width() > 0 and returned.get_height() > 0:
		image._texture = returned
		image._natural_width = returned.get_width()
		image._natural_height = returned.get_height()
		image._phase = "LOADED"
		_queue_native_source_object_onload(image)
	else:
		image._phase = "ERROR"
		image._failure_reason = "SOURCE_OBJECT_NATIVE_LOAD_FAILED:" + image._source_key
		_emit_native_source_object_image(image, "ERROR")
		if _source_object_image_error(image) != "":
			return
		if image._object_error_handler_active:
			_native_source_object_deco_fallback(image)
		else:
			return
	if _source_object_image_error(image) == "":
		_emit_native_source_object_image(image, image._phase)

func _native_source_object_deco_fallback(image: RawSourceImageEntry) -> void:
	if _source_object_image_error(image) != "" or not image._object_error_handler_active:
		return
	# Original onerror=null, same Image.src=_FB64, original onload retained.
	image._object_error_handler_active = false
	image._fallback_attempted = true
	image._source_src = SOURCE_GROUND_FALLBACK_URI
	image._pending = true
	image._terminal = false
	image._complete = false
	image._phase = "PENDING_FALLBACK"
	_emit_native_source_object_image(image, "PENDING_FALLBACK")
	if _source_object_image_error(image) != "":
		return
	var decoded = Image.new()
	var err = decoded.load_png_from_buffer(Marshalls.base64_to_raw(SOURCE_GROUND_FALLBACK_URI.get_slice(",", 1)))
	image._pending = false
	image._terminal = true
	image._complete = true
	if err == OK and decoded.get_width() > 0 and decoded.get_height() > 0:
		image._cpu_image = decoded
		image._texture = ImageTexture.create_from_image(decoded)
		image._natural_width = decoded.get_width()
		image._natural_height = decoded.get_height()
		image._phase = "LOADED"
		_queue_native_source_object_onload(image)
	else:
		image._phase = "ERROR"
		image._failure_reason = "SOURCE_OBJECT_FALLBACK_DECODE_FAILED:" + image._source_key

func _queue_native_source_object_onload(image: RawSourceImageEntry) -> void:
	if image._replacement_kind != "" and _source_object_image_error(image) == "":
		_source_object_deferred_pending += 1
		call_deferred("_native_source_object_onload", image, _source_object_epoch)

func _native_source_object_onload(raw: RawSourceImageEntry, epoch: int) -> void:
	if epoch != _source_object_epoch or _source_object_image_error(raw) != "":
		return
	_source_object_deferred_pending -= 1
	var key: String = raw._source_key
	if not _source_object_current.has(key) or not is_same(_source_object_current[key], raw):
		raw._processing_gap = "SOURCE_OBJ_CURRENT_REFERENCE_CHANGED:" + key
		_source_object_processing_gaps[key] = raw._processing_gap
		return
	if raw._replacement_kind == "filter":
		raw._processing_gap = "SOURCE_OBJ_CSS_FILTER_RASTER_AUTHORITY_UNBOUND:" + key
		_source_object_processing_gaps[key] = raw._processing_gap
		return
	var current = _native_source_object_process_canvas(raw)
	if current == null:
		_source_object_processing_gaps[key] = raw._processing_gap
		return
	if epoch != _source_object_epoch or _source_object_image_error(raw) != "":
		return
	_source_object_current[key] = current
	if not is_same(current, raw):
		_emit_native_source_object_image(current, "CURRENT_CANVAS_REPLACED")
		if epoch != _source_object_epoch or _source_object_image_error(current) != "":
			return
	if raw._replacement_kind == "edge_erase":
		if not _write_native_source_object_meta_edge(key, epoch):
			if _source_object_lifecycle_error() == "":
				_source_object_meta_gaps[key] = "SOURCE_OBJ_META_CURRENT_AUTHORITY_LOST:_edgeErased:" + key

func _native_source_object_process_canvas(raw: RawSourceImageEntry) -> RawSourceImageEntry:
	var kind: String = raw._replacement_kind
	var marker = "_hardAlpha" if kind == "hard_alpha" else ("_keyed" if kind == "key_magenta" else "_lumaKeyed")
	if kind in ["hard_alpha", "key_magenta", "luma_key"] \
			and (not raw._complete or raw._natural_width < 4 or raw._special_flags.has(marker)):
		return raw
	var source_image: Image = raw._texture.get_image()
	if source_image == null or source_image.is_empty():
		raw._processing_gap = "SOURCE_OBJ_CPU_IMAGE_UNAVAILABLE:" + raw._source_key
		return null
	var pixels = source_image.duplicate() as Image
	pixels.convert(Image.FORMAT_RGBA8)
	var rgba: PackedByteArray = pixels.get_data()
	var flags: Dictionary = {}
	match kind:
		"hard_alpha":
			for i in range(3, rgba.size(), 4):
				if rgba[i] < 255:
					rgba[i] = 0
			flags["_hardAlpha"] = 1
		"key_magenta":
			for i in range(0, rgba.size(), 4):
				if rgba[i] > 200 and rgba[i + 2] > 200 and rgba[i + 1] < 90:
					rgba[i + 3] = 0
				elif rgba[i] > 150 and rgba[i + 2] > 150 and rgba[i + 1] < 120 and int(rgba[i]) - int(rgba[i + 1]) > 50:
					rgba[i + 3] = int(float(rgba[i + 3]) * 0.12)
			flags["_keyed"] = 1
		"luma_key":
			for i in range(0, rgba.size(), 4):
				var mx = maxi(rgba[i], maxi(rgba[i + 1], rgba[i + 2]))
				rgba[i + 3] = int(float(rgba[i + 3]) * clampf(float(mx - 16) / 64.0, 0.0, 1.0))
			flags["_lumaKeyed"] = 1
		"edge_erase":
			var amount: float = SOURCE_OBJECT_EDGE_AMOUNTS[raw._source_key]
			rgba = _native_source_object_edge_alpha(rgba, pixels.get_width(), pixels.get_height(), amount)
			flags["_edgeErased"] = amount
			flags["_glVer"] = 1
		_:
			raw._processing_gap = "SOURCE_OBJ_REPLACEMENT_KIND_UNSUPPORTED:" + kind
			return null
	pixels = Image.create_from_data(pixels.get_width(), pixels.get_height(), false, Image.FORMAT_RGBA8, rgba)
	var canvas = RawSourceImageEntry.new()
	canvas._scope = "object"
	canvas._canvas_field_policy = "obj_declared_image_fields"
	canvas._owner_ref = weakref(self)
	canvas._epoch = _source_object_epoch
	canvas._sequence = _source_object_images.size() + 1
	canvas._source_key = raw._source_key
	canvas._slot = raw._slot
	canvas._native_path = raw._native_path
	canvas._replacement_kind = kind
	canvas._kind = "Canvas"
	canvas._phase = "LOADED"
	canvas._terminal = true
	canvas._complete = true
	canvas._natural_width = pixels.get_width()
	canvas._natural_height = pixels.get_height()
	canvas._special_flags = flags
	canvas._cpu_image = pixels
	canvas._texture = ImageTexture.create_from_image(pixels)
	_source_object_images.append(canvas)
	return canvas

func _native_source_object_edge_alpha(rgba: PackedByteArray, w: int, h: int, amount: float) -> PackedByteArray:
	var left = w
	var top = h
	var right = -1
	var bottom = -1
	for py in range(h):
		for px in range(w):
			if rgba[(py * w + px) * 4 + 3] <= 8:
				continue
			left = mini(left, px)
			right = maxi(right, px)
			top = mini(top, py)
			bottom = maxi(bottom, py)
	if right < left or bottom < top:
		return rgba
	var edge = maxi(1, int(floor(float(mini(right - left + 1, bottom - top + 1)) * amount + 0.5)))
	var top_edge = maxi(1, int(floor(float(edge) * 0.25 + 0.5)))
	for py in range(top, bottom + 1):
		for px in range(left, right + 1):
			var ai = (py * w + px) * 4 + 3
			if rgba[ai] == 0:
				continue
			var q = minf(1.0, minf(float(px - left) / edge, minf(float(right - px) / edge,
				minf(float(py - top) / top_edge, float(bottom - py) / edge))))
			if q < 1.0:
				var s = q * q * (3.0 - 2.0 * q)
				rgba[ai] = int(floor(float(rgba[ai]) * s + 0.5))
	return rgba

func _read_native_source_object_image_field(image: Variant, field: String) -> Dictionary:
	var reason = _source_object_image_error(image)
	var record = {"publisher_owner": self, "image_reference": image, "field": field,
		"field_present": false, "status": "NOT_READY", "reason": reason,
		"source_publication_kind": SOURCE_EXTRA_ACTUAL_KIND,
		"source_scope": "actual_native_object_constructor_fields",
		"current_processing_authority_bound": false, "processing_gap": "",
		"full_stage_ready": false}
	if reason != "":
		return record
	var processing_reason: String = _source_object_processing_gaps.get(image._source_key, image._processing_gap)
	record["current_processing_authority_bound"] = processing_reason == ""
	record["processing_gap"] = processing_reason
	if field not in ["src", "complete", "naturalWidth", "naturalHeight"]:
		record["reason"] = "SOURCE_OBJECT_IMAGE_FIELD_UNSUPPORTED:" + field
		return record
	record["native_publication_state"] = "LOADING" if image._pending or not image._terminal else ("LOADED" if image._phase == "LOADED" else "ERROR")
	record["field_present"] = true
	record["status"] = "SOURCE_OBJECT_FIELD_PUBLISHED"
	record["reason"] = ""
	record["declared_undefined"] = image._kind == "Canvas" and field == "src"
	match field:
		"src":
			record["value"] = null if image._kind == "Canvas" else image._source_src
		"complete":
			record["value"] = image._complete
		"naturalWidth":
			record["value"] = image._natural_width
		"naturalHeight":
			record["value"] = image._natural_height
	record["native_texture_reference"] = image._texture
	return record

func _withdraw_native_source_object_images() -> void:
	_source_object_epoch += 1
	for image in _source_object_images:
		image._texture = null
		image._cpu_image = null
	_source_object_images.clear()
	_source_object_current.clear()
	_source_object_shared_images.clear()
	_source_object_processing_gaps.clear()
	_source_object_meta_gaps.clear()
	_source_object_deferred_pending = 0
	_withdraw_native_source_object_meta()

## Preserve the exact actual entry under every currently registered source key.
## No declaration is converted to a placeholder or an unrequested image object.
func get_native_source_object_entries() -> Variant:
	if _native_resource_registry_lifecycle_error() != "":
		return null
	return _native_source_object_entries.duplicate()

func get_native_source_object_entry(source_key: String) -> Dictionary:
	var declaration: Variant = CANONICAL_SOURCE_OBJECT_DECLARATIONS.get(source_key)
	var reason = _native_resource_registry_lifecycle_error()
	if reason == "" and not (declaration is Dictionary):
		reason = "SOURCE_OBJECT_KEY_UNKNOWN:" + source_key
	if reason == "" and not _native_source_object_entries.has(source_key):
		reason = "SOURCE_OBJECT_NATIVE_ENTRY_UNBOUND:" + source_key
	var entry: Variant = _native_source_object_entries.get(source_key)
	if reason == "":
		reason = _native_resource_entry_error(entry)
	if reason == "" and _native_source_mapping_gaps.has(source_key):
		reason = _native_source_mapping_gaps[source_key]
	var result = {"schema": NATIVE_SOURCE_IMAGE_MAPPING_SCHEMA,
		"status": "NATIVE_SOURCE_KEY_ENTRY_AVAILABLE" if reason == "" else "NOT_READY",
		"reason": reason, "source_key": source_key,
		"source_src": declaration["src"] if declaration is Dictionary else "",
		"native_resource_path": NATIVE_SOURCE_PROP_PATHS.get(source_key, ""),
		"path_mapping_bound": reason == "", "current_entry_valid": reason == "",
		"source_mapping_complete": false, "original_pixel_identity_proven": false,
		"source_publication_kind": NATIVE_RESOURCE_PUBLICATION_KIND}
	if entry != null:
		result["entry"] = entry
	return result

func get_native_source_image_mapping_snapshot() -> Dictionary:
	var reason = _native_resource_registry_lifecycle_error()
	var missing: Array = []
	var gaps: Array = []
	var aliases: Array = []
	var bindings: Array = []
	var seen_entries: Array = []
	for key in CANONICAL_SOURCE_OBJECT_DECLARATIONS:
		if not _native_source_object_entries.has(key):
			missing.append(key)
			continue
		var entry: NativeResourceLoadEntry = _native_source_object_entries[key]
		var current = get_native_source_object_entry(key)
		bindings.append({"source_key": key, "source_src": CANONICAL_SOURCE_OBJECT_DECLARATIONS[key]["src"],
			"native_resource_path": entry._src, "sequence": entry._sequence,
			"current_entry_valid": current["current_entry_valid"], "reason": current["reason"]})
		if current["reason"] != "":
			gaps.append({"source_key": key, "reason": current["reason"]})
		if not seen_entries.has(entry):
			seen_entries.append(entry)
			if entry._canonical_source_keys.size() > 1:
				aliases.append({"source_keys": entry._canonical_source_keys.duplicate(),
					"source_src": entry._canonical_source_src, "sequence": entry._sequence,
					"same_actual_texture_verified": current["current_entry_valid"],
					"verification_scope": "native_terminal_admission_only",
					"source_image_identity_proven": false})
	for key in _native_source_mapping_gaps:
		if not _native_source_object_entries.has(key):
			gaps.append({"source_key": key, "reason": _native_source_mapping_gaps[key]})
	return {"schema": NATIVE_SOURCE_IMAGE_MAPPING_SCHEMA,
		"status": "NATIVE_SOURCE_MAPPING_AVAILABLE" if reason == "" else "NOT_READY",
		"reason": reason, "canonical_commit": SOURCE_CANONICAL_COMMIT,
		"revision": _native_source_mapping_revision,
		"declared": CANONICAL_SOURCE_OBJECT_DECLARATIONS.size(),
		"mapped": _native_source_object_entries.size(), "missing": missing.size(),
		"missing_source_keys": missing, "bindings": bindings, "aliases": aliases, "gaps": gaps,
		"extra_declared_slots": 14 + CANONICAL_SOURCE_EXTRA_GLOBALS["_bossGateImgs"]["paths"].size(),
		"extra_current_authority_bound": _source_extra_capture_error() == "",
		"extra_current_authority_scope": "exact_wait_extra_21_slots",
		"dynamic_replacement_owner_bound": false,
		"current_image_owner_gaps": SOURCE_CURRENT_IMAGE_OWNER_GAPS.duplicate(),
		"original_pixel_identity_proven": false, "source_mapping_complete": false,
		"source_wait_complete": false, "full_stage_ready": false}

## Explicit callers use the same real loader/registry, without a Sprite2D view.
## Admission is native-only; this does not extend source _OBJ_SPR coverage.
func request_native_prop_resource_load(object_id: String, src: String) -> Dictionary:
	var reason = _native_resource_registry_lifecycle_error()
	if reason == "" and (object_id.is_empty() or not src.begins_with("res://") or src.length() <= 6):
		reason = "NATIVE_PROP_LOAD_REQUEST_INVALID"
	if reason != "":
		return {"status": "NOT_READY", "reason": reason, "native_scope": NATIVE_RESOURCE_LOAD_SCOPE,
			"source_mapping_complete": false}
	var entry = _request_native_prop_texture({"id": object_id, "texture": src}, "EXPLICIT_NATIVE_PROP_LOAD_REQUEST")
	var entry_error = _native_resource_entry_error(entry)
	return {"status": "NATIVE_LOAD_TERMINAL" if entry_error == "" and entry._terminal else "NOT_READY",
		"reason": entry_error, "entry": entry, "phase": entry._phase,
		"complete": entry._complete, "naturalWidth": entry._natural_width,
		"native_scope": NATIVE_RESOURCE_LOAD_SCOPE, "source_mapping_complete": false}

func get_native_resource_load_snapshot() -> Dictionary:
	var reason = _native_resource_registry_lifecycle_error()
	var entries: Array = []
	var pending = 0
	var loaded = 0
	var failed = 0
	var terminal = 0
	var gaps: Array = []
	if reason == "":
		for entry in _native_resource_load_entries:
			var entry_error = _native_resource_entry_error(entry)
			if entry_error != "":
				gaps.append({"sequence": entry._sequence, "reason": entry_error})
			if entry._pending:
				pending += 1
			if entry._phase == "LOADED":
				loaded += 1
			if entry._phase == "FAILED":
				failed += 1
			if entry._terminal:
				terminal += 1
			entries.append(_native_resource_entry_snapshot(entry, entry_error))
	return {"schema": NATIVE_RESOURCE_LOAD_SCHEMA,
		"status": "NATIVE_LOAD_REGISTRY_AVAILABLE" if reason == "" else "NOT_READY",
		"reason": reason, "native_scope": NATIVE_RESOURCE_LOAD_SCOPE,
		"source_publication_kind": NATIVE_RESOURCE_PUBLICATION_KIND,
		"owner_instance_id": get_instance_id(), "registry_epoch": _native_resource_load_epoch,
		"revision": _native_resource_load_revision, "load_calls": _native_resource_load_calls,
		"prop_build_complete": _native_resource_prop_build_complete,
		"registered": entries.size(), "pending": pending, "loaded": loaded,
		"failed": failed, "terminal": terminal, "entries": entries, "gaps": gaps,
		"source_mapping_complete": false, "source_obj_spr_coverage_bound": false,
		"source_extra_globals_bound": _source_extra_capture_error() == "", "source_wait_complete": false,
		"full_stage_ready": false, "gpu_upload_proven": false, "gpu_render_proven": false}

## The canonical collection is populated from _OBJ_SPR_MAP and later source
## replacements (game.html:18614,18887-18900). Native props do not prove coverage.
func get_source_obj_spr_publication() -> Dictionary:
	var reason = _source_object_capture_error()
	if reason == "":
		return {"publisher_owner": self, "source_publication_kind": SOURCE_EXTRA_ACTUAL_KIND,
			"status": "SOURCE_OBJ_CURRENT_IMAGES_PUBLISHED", "obj_spr": _source_object_current,
			"source_scope": "canonical_source_object_constructors_current_refs",
			"original_pixel_identity_proven": false, "source_wait_complete": false, "full_stage_ready": false}
	var publication = _native_source_publication_not_ready(reason)
	publication["mapping"] = get_native_source_image_mapping_snapshot()
	# Diagnostic subset has a different key; no partial obj_spr publication.
	publication["mapped_obj_spr"] = get_native_source_object_entries()
	publication["source_object_images"] = get_native_source_object_images_snapshot()
	publication["current_obj_spr_diagnostic"] = _source_object_current.duplicate() if _source_object_lifecycle_error() == "" else null
	return publication

## Unknown globals are not declared absent or null. There is no fabricated
## empty gate array/ground-tile dictionary to make the source wait resolve.
func capture_source_extra_img_globals() -> Dictionary:
	var reason = _source_extra_capture_error()
	if reason != "":
		var unavailable = _native_source_publication_not_ready(reason)
		unavailable["declared_globals"] = CANONICAL_SOURCE_EXTRA_GLOBALS.duplicate(true)
		unavailable["extra_declared_slots"] = 21
		return unavailable
	var globals: Dictionary = {}
	for name in CANONICAL_SOURCE_EXTRA_GLOBALS:
		globals[name] = {"present": true, "value": _source_extra_globals[name]}
	return {"publisher_owner": self, "source_publication_kind": SOURCE_EXTRA_ACTUAL_KIND,
		"status": "SOURCE_EXTRA_GLOBALS_PUBLISHED", "globals": globals,
		"source_scope": "actual_native_extra_constructors_exact_wait_fields",
		"source_global_parity_proven": false, "unported_ground_keys": ["gt_03", "gt_void_wall"],
		"source_obj_spr_coverage_bound": false, "source_wait_complete": false, "full_stage_ready": false}

func _source_extra_capture_error() -> String:
	var reason = _source_extra_lifecycle_error()
	if reason != "":
		return reason
	if _source_extra_state != "REGISTERED" or _source_extra_globals.size() != 8:
		return "SOURCE_EXTRA_IMAGE_GLOBALS_AUTHORITY_INCOMPLETE"
	for name in CANONICAL_SOURCE_EXTRA_GLOBALS:
		if not _source_extra_globals.has(name):
			return "SOURCE_EXTRA_CURRENT_GLOBAL_UNBOUND:" + name
		if name in ["_bossGateImgs", "_GROUND_TILES"]:
			continue
		reason = _source_extra_image_error(_source_extra_globals[name])
		if reason != "":
			return reason
	if not is_same(_source_extra_globals["_bossGateImgs"], _source_extra_gate_images) \
			or _source_extra_gate_images.size() != 7:
		return "SOURCE_EXTRA_CURRENT_GATE_ARRAY_OWNER_CHANGED"
	for image in _source_extra_gate_images:
		reason = _source_extra_image_error(image)
		if reason != "":
			return reason
	if not is_same(_source_extra_globals["_GROUND_TILES"], _source_extra_ground_images) \
			or _source_extra_ground_images.size() != SOURCE_GROUND_WAIT_KEYS.size():
		return "SOURCE_EXTRA_CURRENT_GROUND_DICTIONARY_OWNER_CHANGED"
	for key in SOURCE_GROUND_WAIT_KEYS:
		if not _source_extra_ground_images.has(key):
			return "SOURCE_EXTRA_CURRENT_GROUND_IMAGE_UNBOUND:" + key
		reason = _source_extra_image_error(_source_extra_ground_images[key])
		if reason != "":
			return reason
	return ""

## Source-shaped compatibility fields describe this actual native load entry.
## The distinct publication kind cannot be accepted as ACTUAL_SOURCE_PUBLICATION.
func read_source_image_field(image: Variant, field: String) -> Dictionary:
	if typeof(image) == TYPE_OBJECT and is_instance_valid(image) and image is RawSourceImageEntry:
		if image._scope == "object":
			return _read_native_source_object_image_field(image, field)
		return _read_native_source_extra_image_field(image, field)
	var reason = _native_resource_entry_error(image)
	var record = {"publisher_owner": self, "image_reference": image, "field": field,
		"field_present": false, "source_publication_kind": NATIVE_RESOURCE_PUBLICATION_KIND,
		"native_scope": NATIVE_RESOURCE_LOAD_SCOPE, "source_mapping_complete": false,
		"status": "NOT_READY", "reason": reason}
	if reason != "":
		return record
	var entry: NativeResourceLoadEntry = image
	record["native_publication_state"] = "LOADING" if entry._pending else ("LOADED" if entry._phase == "LOADED" else "ERROR")
	match field:
		"src":
			record["value"] = entry._canonical_source_src if entry._canonical_path_mapping_bound else entry._src
		"complete":
			record["value"] = entry._complete
		"naturalWidth":
			record["value"] = entry._natural_width
		_:
			record["reason"] = "NATIVE_IMAGE_FIELD_UNSUPPORTED:" + field
			return record
	record["field_present"] = true
	record["status"] = "NATIVE_FIELD_PUBLISHED"
	record["reason"] = ""
	record["native_texture_reference"] = entry._texture
	record["native_texture_ready"] = entry._phase == "LOADED" and not (entry._texture is PlaceholderTexture2D)
	record["requested"] = entry._requested
	record["pending"] = entry._pending
	record["terminal"] = entry._terminal
	record["native_resource_path"] = entry._src
	record["canonical_path_mapping_bound"] = entry._canonical_path_mapping_bound
	record["canonical_source_src"] = entry._canonical_source_src
	record["canonical_source_keys"] = entry._canonical_source_keys.duplicate()
	record["source_mapping_error"] = entry._source_mapping_error
	record["original_pixel_identity_proven"] = false
	return record

func _native_source_publication_not_ready(unbound_reason: String) -> Dictionary:
	var lifecycle_reason = _native_resource_registry_lifecycle_error()
	return {"status": "NOT_READY", "reason": lifecycle_reason if lifecycle_reason != "" else unbound_reason,
		"publisher_owner": self, "source_publication_kind": NATIVE_RESOURCE_PUBLICATION_KIND,
		"native_scope": NATIVE_RESOURCE_LOAD_SCOPE, "source_mapping_complete": false,
		"source_wait_complete": false, "texture_ready": false, "full_stage_ready": false}

func _native_resource_registry_lifecycle_error() -> String:
	if _native_resource_load_closed:
		return "NATIVE_RESOURCE_REGISTRY_OWNER_EXITED"
	if is_queued_for_deletion():
		return "NATIVE_RESOURCE_REGISTRY_OWNER_QUEUED"
	if not is_inside_tree():
		return "NATIVE_RESOURCE_REGISTRY_OWNER_NOT_IN_TREE"
	if get_tree() != Engine.get_main_loop():
		return "NATIVE_RESOURCE_REGISTRY_FOREIGN_TREE"
	return ""

func _native_resource_entry_error(entry: Variant) -> String:
	var lifecycle_error = _native_resource_registry_lifecycle_error()
	if lifecycle_error != "":
		return lifecycle_error
	if typeof(entry) != TYPE_OBJECT or not is_instance_valid(entry) or not (entry is NativeResourceLoadEntry):
		return "NATIVE_RESOURCE_ENTRY_NOT_OWNED"
	if entry._owner_ref == null or not is_same(entry._owner_ref.get_ref(), self) \
			or entry._owner_instance_id != get_instance_id() or entry._registry_epoch != _native_resource_load_epoch:
		return "NATIVE_RESOURCE_ENTRY_OWNER_MISMATCH"
	var registered = false
	for actual_entry in _native_resource_load_entries:
		if is_same(actual_entry, entry):
			registered = true
			break
	if not registered:
		return "NATIVE_RESOURCE_ENTRY_NOT_REGISTERED"
	if entry._phase == "LOADED":
		if not is_instance_valid(entry._texture):
			return "NATIVE_RESOURCE_ENTRY_TEXTURE_LOST"
		if entry._texture.get_width() != entry._natural_width or entry._texture.get_height() != entry._natural_height:
			return "NATIVE_RESOURCE_ENTRY_TEXTURE_CHANGED"
	if entry._prop_attached:
		var prop: Variant = entry._prop_ref.get_ref() if entry._prop_ref != null else null
		if not is_instance_valid(prop) or prop.is_queued_for_deletion() or not prop.is_inside_tree():
			return "NATIVE_RESOURCE_ENTRY_PROP_LOST"
		if prop.get_parent() != self or prop.get_tree() != get_tree() or not is_same(prop.texture, entry._texture):
			return "NATIVE_RESOURCE_ENTRY_PROP_CUSTODY_CHANGED"
	return ""

func _native_resource_entry_snapshot(entry: NativeResourceLoadEntry, error: String) -> Dictionary:
	return {"sequence": entry._sequence, "object_id": entry._object_id, "src": entry._src,
		"request_origin": entry._request_origin,
		"canonical_source_src": entry._canonical_source_src,
		"canonical_source_keys": entry._canonical_source_keys.duplicate(),
		"canonical_path_mapping_bound": entry._canonical_path_mapping_bound,
		"source_mapping_error": entry._source_mapping_error,
		"requested": entry._requested, "pending": entry._pending,
		"load_call_performed": entry._load_call_performed, "terminal": entry._terminal,
		"phase": entry._phase, "complete": entry._complete,
		"naturalWidth": entry._natural_width, "naturalHeight": entry._natural_height,
		"failure_reason": entry._failure_reason, "transitions": entry._transitions.duplicate(),
		"texture_instance_id": entry._texture.get_instance_id() if is_instance_valid(entry._texture) else 0,
		"texture_path": entry._texture.resource_path if is_instance_valid(entry._texture) else "",
		"native_texture_ready": error == "" and entry._phase == "LOADED" and not (entry._texture is PlaceholderTexture2D),
		"prop_attached": entry._prop_attached, "current_entry_valid": error == "", "entry_error": error}

func _prepare_native_source_object_entry(entry: NativeResourceLoadEntry) -> void:
	if entry._request_origin != "WORLD_PROP_BUILD":
		return
	var declaration: Variant = CANONICAL_SOURCE_OBJECT_DECLARATIONS.get(entry._object_id)
	if not (declaration is Dictionary):
		entry._source_mapping_error = "SOURCE_OBJECT_KEY_UNKNOWN:" + entry._object_id
		return
	if NATIVE_SOURCE_PROP_PATHS.get(entry._object_id) != entry._src:
		entry._source_mapping_error = "SOURCE_OBJECT_NATIVE_PATH_NOT_BOUND:" + entry._object_id
		return
	entry._canonical_source_src = declaration["src"]
	entry._canonical_source_keys.append(entry._object_id)
	entry._canonical_path_mapping_bound = true

func _register_native_source_object_entry(entry: NativeResourceLoadEntry) -> void:
	if not entry._canonical_path_mapping_bound or not entry._terminal:
		return
	var key = entry._object_id
	var declaration: Dictionary = CANONICAL_SOURCE_OBJECT_DECLARATIONS[key]
	# Current post-onload image authority is not supplied by a file/path match.
	if declaration["replacement"] != "":
		entry._source_mapping_error = "SOURCE_OBJECT_REPLACEMENT_OWNER_UNBOUND:" + key
		_native_source_mapping_gaps[key] = entry._source_mapping_error
		return
	var prior: Variant = _native_source_object_entries.get(key)
	if prior == null and declaration["shared_atlas"]:
		for actual_key in _native_source_object_entries:
			var candidate: NativeResourceLoadEntry = _native_source_object_entries[actual_key]
			if CANONICAL_SOURCE_OBJECT_DECLARATIONS[actual_key]["shared_atlas"] \
					and candidate._canonical_source_src == entry._canonical_source_src:
				prior = candidate
				break
	if prior != null:
		# Duplicate prop instances do not create another source Image. Shared
		# source aliases retain ONE actual admission only after identity agrees.
		if _native_resource_entry_error(prior) != "" or not is_instance_valid(entry._texture) \
				or not is_same(prior._texture, entry._texture):
			entry._source_mapping_error = "SOURCE_OBJECT_NATIVE_IMAGE_IDENTITY_CONFLICT:" + key
			_native_source_mapping_gaps[key] = entry._source_mapping_error
			return
		if not prior._canonical_source_keys.has(key):
			prior._canonical_source_keys.append(key)
		_native_source_object_entries[key] = prior
	else:
		_native_source_object_entries[key] = entry
	_native_source_mapping_revision += 1

func _request_native_prop_texture(data: Dictionary, origin: String = "WORLD_PROP_BUILD") -> NativeResourceLoadEntry:
	var entry = NativeResourceLoadEntry.new()
	entry._owner_ref = weakref(self)
	entry._owner_instance_id = get_instance_id()
	entry._registry_epoch = _native_resource_load_epoch
	entry._sequence = _native_resource_load_entries.size() + 1
	entry._object_id = str(data["id"])
	entry._src = data["texture"]
	entry._request_origin = origin
	_prepare_native_source_object_entry(entry)
	_native_resource_load_entries.append(entry)
	_native_resource_load_revision += 1
	# Observable synchronous pending admission, immediately before the SAME
	# existing load call. This is not an invented async wait or JS Image state.
	native_resource_load_changed.emit(entry, "PENDING")
	var owner_error = _native_resource_entry_error(entry)
	if owner_error != "":
		entry._failure_reason = owner_error
		return entry
	entry._load_call_performed = true
	_native_resource_load_calls += 1
	var returned: Variant = load(data["texture"])
	entry._pending = false
	entry._terminal = true
	entry._complete = true
	if returned is Texture2D and is_instance_valid(returned) \
			and returned.get_width() > 0 and returned.get_height() > 0:
		entry._texture = returned
		entry._natural_width = returned.get_width()
		entry._natural_height = returned.get_height()
		entry._phase = "LOADED"
	else:
		entry._phase = "FAILED"
		entry._failure_reason = "NATIVE_PROP_LOAD_RETURNED_NULL" if returned == null else "NATIVE_PROP_LOAD_RETURNED_INVALID_TEXTURE"
	entry._transitions.append(entry._phase)
	entry._transitions.append("TERMINAL")
	_native_resource_load_revision += 1
	_register_native_source_object_entry(entry)
	native_resource_load_changed.emit(entry, entry._phase)
	return entry

func _exit_tree() -> void:
	# Release only this registry's references. Existing Sprite2D children and
	# their Texture resources remain owned by the original World/tree lifecycle.
	_native_resource_load_closed = true
	_source_extra_state = "OWNER_EXITED"
	_withdraw_native_source_extra_images()
	_source_object_state = "OWNER_EXITED"
	_withdraw_native_source_object_images()
	_native_resource_load_epoch += 1
	_native_source_object_entries.clear()
	_native_source_mapping_gaps.clear()
	for entry in _native_resource_load_entries:
		entry._texture = null
		entry._prop_ref = null
	_native_resource_load_entries.clear()
	_withdraw_native_boot_map()

## Binds the actual Main.source_state child and an optional real 0-arg
## buildMapCache owner. No stage execution, G.on write or fallback builder.
func bind_native_boot_map_source_state(state: Node, builder: Callable = Callable()) -> Dictionary:
	var reason = _boot_map_state_error(state)
	if reason == "":
		reason = _boot_map_builder_error(builder)
	if reason == "" and (_boot_map_queued or _boot_map_in_builder or _boot_map_in_resolve):
		reason = "SOURCE_BOOT_MAP_REBIND_WHILE_QUEUED"
	if reason != "":
		_boot_map_error = reason
		var rejected = get_source_boot_map_build_publication()
		rejected["status"] = "NOT_READY"
		rejected["reason"] = reason
		return rejected
	_boot_map_epoch += 1
	_boot_map_state_ref = weakref(state)
	_boot_map_state_id = state.get_instance_id()
	_boot_map_builder = builder
	_boot_map_builder_owner_id = builder.get_object().get_instance_id() if not builder.is_null() else 0
	_boot_map_binding = "BOUND"
	_boot_map_error = ""
	return get_source_boot_map_build_publication()

## Source `defer` writer only: numeric validation, no stage execution.
func set_native_boot_map_defer(value: Variant) -> bool:
	if _boot_map_owner_error() != "" or not (value is int or value is float) or not is_finite(float(value)):
		return false
	_boot_map_defer = value
	return true

## game26051 queue. While queued, every call returns the SAME handle.
func queue_native_boot_map_build() -> Dictionary:
	var owner_reason = _boot_map_owner_error()
	if owner_reason != "":
		_boot_map_error = owner_reason
		return _boot_map_queue_record("NOT_READY", owner_reason, null, false)
	if _boot_map_queued:
		if _boot_map_promise != null:
			return _boot_map_queue_record("SOURCE_BOOT_MAP_QUEUED", "", _boot_map_promise, true)
		# Promise.resolve(): an already fulfilled operation, not a new build.
		var resolved = _new_boot_map_handle()
		resolved._settle({"schema": SOURCE_BOOT_MAP_SCHEMA, "status": "SOURCE_FULFILLED", "reason": "",
			"source_promise_fulfilled": true, "builder_called": false, "source_stage_ready": false})
		return _boot_map_queue_record("SOURCE_FULFILLED", "", resolved, false)
	var reason = _boot_map_binding_error()
	if reason != "":
		_boot_map_error = reason
		return _boot_map_queue_record("NOT_READY", reason, null, false)
	_boot_map_queued = 1
	_boot_map_sequence += 1
	var handle = _new_boot_map_handle()
	_boot_map_promise = handle
	_boot_map_resolver = Callable(handle, "_settle")
	_boot_map_error = ""
	# Invoked directly: the first process_frame wait starts now.
	_run_native_boot_map_frames(handle, get_tree())
	return _boot_map_queue_record("SOURCE_BOOT_MAP_QUEUED", "", handle, false)

func read_native_boot_map_build_promise() -> Variant:
	if _boot_map_binding_error() != "":
		return null
	return _boot_map_promise

## Consumes only this World's own handle: finished result or current epoch signal.
func await_native_boot_map_build(handle: Variant) -> Dictionary:
	if typeof(handle) != TYPE_OBJECT or not is_instance_valid(handle) or not (handle is NativeBootMapBuildHandle) \
			or handle._owner_ref == null or not is_same(handle._owner_ref.get_ref(), self) \
			or handle._owner_instance_id != get_instance_id():
		return {"schema": SOURCE_BOOT_MAP_SCHEMA, "status": "NOT_READY", "reason": "SOURCE_BOOT_MAP_HANDLE_NOT_OWNED"}
	var owner_reason = _boot_map_owner_error()
	if owner_reason != "":
		return {"schema": SOURCE_BOOT_MAP_SCHEMA, "status": "NOT_READY", "reason": owner_reason}
	if handle._finished:
		return handle.get_result()
	if handle._epoch != _boot_map_epoch or not is_same(handle, _boot_map_promise):
		return {"schema": SOURCE_BOOT_MAP_SCHEMA, "status": "NOT_READY", "reason": "SOURCE_BOOT_MAP_HANDLE_NOT_CURRENT"}
	var result: Dictionary = await handle.finished
	return result

func get_source_boot_map_build_publication() -> Dictionary:
	var reason = _boot_map_binding_error()
	var state: Variant = _boot_map_state_ref.get_ref() if _boot_map_state_ref != null else null
	var resolver_owner: Variant = _boot_map_resolver.get_object() if _boot_map_resolver.is_valid() else null
	return {"schema": SOURCE_BOOT_MAP_SCHEMA, "publisher_owner": self, "owner_instance_id": get_instance_id(),
		"status": "SOURCE_BOOT_MAP_LIFECYCLE_BOUND" if reason == "" else "NOT_READY", "reason": reason,
		"binding": _boot_map_binding, "epoch": _boot_map_epoch, "last_error": _boot_map_error,
		"source_state": state if reason == "" else null, "source_state_instance_id": _boot_map_state_id,
		"builder_bound": not _boot_map_builder.is_null(), "builder_owner_instance_id": _boot_map_builder_owner_id,
		"defer": _boot_map_defer, "queued": _boot_map_queued, "current_promise": _boot_map_promise,
		"resolver_bound": _boot_map_resolver.is_valid(),
		"resolver_handle_instance_id": resolver_owner.get_instance_id() if resolver_owner != null else 0,
		"resolver_matches_promise": resolver_owner != null and is_same(resolver_owner, _boot_map_promise),
		"queue_sequence": _boot_map_sequence, "in_builder": _boot_map_in_builder,
		"in_resolve": _boot_map_in_resolve, "last_result": _boot_map_last_result.duplicate(),
		"native_scheduler_scope": SOURCE_BOOT_MAP_SCHEDULER_SCOPE,
		"browser_raf_parity_proven": false, "fallback_16ms": false,
		"map_stage_implemented": false, "build_map_cache_writer_ported": false,
		"source_stage_ready": false, "gpu_ready": false, "source_g_on_written": false}

func _boot_map_owner_error() -> String:
	if _boot_map_closed:
		return "SOURCE_BOOT_MAP_OWNER_EXITED"
	if is_queued_for_deletion():
		return "SOURCE_BOOT_MAP_OWNER_QUEUED"
	if not is_inside_tree():
		return "SOURCE_BOOT_MAP_OWNER_NOT_IN_TREE"
	return ""

func _boot_map_state_error(state: Variant) -> String:
	var reason = _boot_map_owner_error()
	if reason != "":
		return reason
	if typeof(state) != TYPE_OBJECT or not is_instance_valid(state) or not (state is Node):
		return "SOURCE_BOOT_MAP_STATE_MISSING"
	if state.is_queued_for_deletion() or not state.is_inside_tree() \
			or state.get_parent() != self or state.get_tree() != get_tree():
		return "SOURCE_BOOT_MAP_STATE_NOT_PHYSICAL_CHILD"
	var script: Variant = state.get_script()
	if not (script is Script) or script.resource_path != SOURCE_BOOT_MAP_STATE_SCRIPT:
		return "SOURCE_BOOT_MAP_STATE_SCRIPT_MISMATCH"
	var g: Variant = state.read_current_g()
	if not (g is Dictionary):
		return "SOURCE_BOOT_MAP_CURRENT_G_UNAVAILABLE"
	if not g.has("map"):
		return "SOURCE_BOOT_MAP_CURRENT_G_MAP_FIELD_ABSENT"
	return ""

func _boot_map_builder_error(builder: Callable) -> String:
	if builder.is_null():
		return ""
	if not builder.is_valid():
		return "SOURCE_BOOT_MAP_BUILDER_INVALID"
	var owner: Variant = builder.get_object()
	if not is_instance_valid(owner):
		return "SOURCE_BOOT_MAP_BUILDER_OWNER_LOST"
	if owner is Node and (owner.is_queued_for_deletion() or not owner.is_inside_tree() or owner.get_tree() != get_tree()):
		return "SOURCE_BOOT_MAP_BUILDER_OWNER_NOT_IN_TREE"
	if builder.get_argument_count() != 0:
		return "SOURCE_BOOT_MAP_BUILDER_ARITY_MISMATCH"
	return ""

func _boot_map_binding_error() -> String:
	if _boot_map_binding != "BOUND":
		var owner_reason = _boot_map_owner_error()
		return owner_reason if owner_reason != "" else "SOURCE_BOOT_MAP_STATE_UNBOUND"
	var state: Variant = _boot_map_state_ref.get_ref() if _boot_map_state_ref != null else null
	var reason = _boot_map_state_error(state)
	if reason == "" and state.get_instance_id() != _boot_map_state_id:
		reason = "SOURCE_BOOT_MAP_STATE_IDENTITY_CHANGED"
	if reason == "" and not _boot_map_builder.is_null():
		reason = _boot_map_builder_error(_boot_map_builder)
		if reason == "" and _boot_map_builder.get_object().get_instance_id() != _boot_map_builder_owner_id:
			reason = "SOURCE_BOOT_MAP_BUILDER_IDENTITY_CHANGED"
	return reason

func _new_boot_map_handle() -> NativeBootMapBuildHandle:
	var handle = NativeBootMapBuildHandle.new()
	handle._owner_ref = weakref(self)
	handle._owner_instance_id = get_instance_id()
	handle._epoch = _boot_map_epoch
	handle._sequence = _boot_map_sequence
	return handle

func _boot_map_queue_record(status: String, reason: String, handle: Variant, reused: bool) -> Dictionary:
	return {"schema": SOURCE_BOOT_MAP_SCHEMA, "status": status, "reason": reason, "promise": handle,
		"same_promise_reused": reused, "epoch": _boot_map_epoch, "queued": _boot_map_queued,
		"native_scheduler_scope": SOURCE_BOOT_MAP_SCHEDULER_SCOPE, "source_stage_ready": false}

## Two SceneTree.process_frame awaits are the explicit native compatibility for
## the source double requestAnimationFrame; not browser RAF or 16ms parity.
func _run_native_boot_map_frames(handle: NativeBootMapBuildHandle, tree: SceneTree) -> void:
	for frame in range(2):
		await tree.process_frame
		if handle._epoch != _boot_map_epoch or not is_same(handle, _boot_map_promise):
			return
		var reason = _boot_map_binding_error()
		if reason != "":
			_boot_map_epoch += 1
			_cancel_native_boot_map("NOT_READY", reason)
			return
		handle._frames = frame + 1
	# Second callback: try { if (G.map) buildMapCache() } finally { ... }.
	var result = {"schema": SOURCE_BOOT_MAP_SCHEMA, "status": "SOURCE_FULFILLED", "reason": "",
		"handle_sequence": handle._sequence, "epoch": handle._epoch, "frames": handle._frames,
		"source_promise_fulfilled": true, "rejected": false, "map_truthy": false,
		"builder_called": false, "builder_error_observable": false, "map_cache_verified": false,
		"source_stage_ready": false}
	var g: Dictionary = _boot_map_state_ref.get_ref().read_current_g()
	result["map_truthy"] = _source_meta_js_truthy(g.get("map"))
	if result["map_truthy"]:
		if _boot_map_builder.is_null():
			# Source would throw here; the promise still fulfills, never fake cache.
			result["status"] = "NOT_READY"
			result["reason"] = "SOURCE_BOOT_MAP_BUILDER_MISSING"
		else:
			_boot_map_in_builder = true
			_boot_map_builder.call()
			_boot_map_in_builder = false
			result["builder_called"] = true
	if handle._epoch != _boot_map_epoch or not is_same(handle, _boot_map_promise):
		return
	# finally: reset queued/promise/resolver before the captured resolver runs.
	_boot_map_queued = 0
	var captured: Callable = _boot_map_resolver
	_boot_map_resolver = Callable()
	_boot_map_promise = null
	_boot_map_last_result = result.duplicate()
	_boot_map_error = result["reason"]
	if captured.is_valid():
		_boot_map_in_resolve = true
		captured.call(result)
		_boot_map_in_resolve = false

func _cancel_native_boot_map(status: String, reason: String) -> void:
	var handle: NativeBootMapBuildHandle = _boot_map_promise
	_boot_map_queued = 0
	_boot_map_resolver = Callable()
	_boot_map_promise = null
	_boot_map_error = reason
	if handle == null:
		return
	var result = {"schema": SOURCE_BOOT_MAP_SCHEMA, "status": status, "reason": reason,
		"handle_sequence": handle._sequence, "epoch": handle._epoch, "frames": handle._frames,
		"source_promise_fulfilled": false, "rejected": false, "builder_called": false,
		"source_stage_ready": false}
	_boot_map_last_result = result.duplicate()
	handle._settle(result)

func _withdraw_native_boot_map() -> void:
	_boot_map_closed = true
	_boot_map_epoch += 1
	_cancel_native_boot_map("CANCELLED", "SOURCE_BOOT_MAP_OWNER_EXITED")
	_boot_map_binding = "OWNER_EXITED"
	_boot_map_state_ref = null
	_boot_map_state_id = 0
	_boot_map_builder = Callable()
	_boot_map_builder_owner_id = 0

func bind_native_player_q_control(adapter: Object) -> bool:
	if not ready_for_player or not is_instance_valid(player) or player.get_combat_world()!=self:
		return false
	return player.bind_native_q_control(adapter)

func bind_native_player_combat_qe(adapter: Object) -> bool:
	# Install only on this World's existing Player after actual suppliers pass.
	# No second Player, neutral stat defaults, or automatic input activation.
	if not ready_for_player or not is_instance_valid(player) or not is_instance_valid(adapter):
		return false
	if not player.has_method("bind_native_combat_qe") or not player.has_method("get_combat_world") or player.get_combat_world() != self:
		return false
	return player.bind_native_combat_qe(adapter)

func bind_native_player_resource_regeneration(adapter: Object) -> bool:
	if not ready_for_player or not is_instance_valid(player) or not is_instance_valid(adapter):
		return false
	if not player.has_method("bind_native_resource_regeneration") or not player.has_method("get_combat_world") or player.get_combat_world() != self:
		return false
	return player.bind_native_resource_regeneration(adapter)

func bind_native_player_source_resources(authority: Node) -> bool:
	if not ready_for_player or not is_instance_valid(player) or not is_instance_valid(authority):
		return false
	if authority.get_parent() != self or not player.has_method("bind_native_source_resources"):
		return false
	return player.bind_native_source_resources(authority)

func sample_native_random_unit() -> float:
	return _sample_native_random_unit_with_receipt(null)

func get_native_projectile_fx_context() -> Dictionary:
	var external_live = 0
	for reference in _native_fx_external_refs:
		if is_instance_valid(reference.get_ref()):
			external_live += 1
	# This new native renderer has an explicit, scoped particle policy. Do not
	# claim these options are the unported original OPT/Tier/slowMo globals.
	return {"schema": "exoduser.godot.native-projectile-fx-context.v1",
		"is_mobile": OS.has_feature("android") or OS.has_feature("ios"),
		"hi_fps": _native_fx_hi_fps, "dt_sp": _native_last_ticks,
		"frame_reset_epoch": _native_clock_updates,
		"dynamic_particle_limit": 1000, "external_vfx_live_count": external_live,
		"shake_percent": 100.0, "vibration_enabled": false,
		"float_text_enabled": true, "battle_test_active": false,
		"text_pool_limit": 40, "budget_scope": "new_native_hit_fx_only",
		"clock_mode": "godot_delta_native60"}

func register_external_native_hit_fx(node: Node2D) -> void:
	if is_instance_valid(node):
		_native_fx_external_refs.append(weakref(node))

func supports_native_projectile_hit_fx(element: String, dark_ball: bool) -> bool:
	return is_instance_valid(_native_hit_fx) and _native_hit_fx.supports(element, dark_ball)

func emit_native_projectile_hit_fx(request: Dictionary) -> void:
	if is_instance_valid(_native_hit_fx):
		_native_hit_fx.emit(request)

func emit_native_parts(origin: Vector2, color: String, count: int) -> void:
	if is_instance_valid(_native_hit_fx):
		_native_hit_fx.emit_parts(origin, Color(color), count)

func emit_native_source_particle(request: Dictionary) -> bool:
	if not is_instance_valid(_native_hit_fx):
		return false
	return _native_hit_fx.emit_source_particle(request)

func emit_native_channel_particle(raw: Dictionary) -> bool:
	for key in ["x", "y", "vx", "vy", "sz", "life"]:
		var value: Variant = raw.get(key)
		if not (value is int or value is float) or not is_finite(float(value)):
			return false
	if not raw.get("col") is String or not Color.html_is_valid(raw["col"]):
		return false
	# Values have already been sampled by the actual owner. This adapter only
	# changes the source packet's field names/types; it makes no random draws.
	return emit_native_source_particle({"position": Vector2(raw["x"], raw["y"]),
		"velocity": Vector2(raw["vx"], raw["vy"]), "color": Color(raw["col"]),
		"size": float(raw["sz"]), "life_ticks": float(raw["life"])})

func get_native_runtime_snapshot() -> Dictionary:
	return {"native_frame": _native_frame, "ticks": _native_ticks,
		"clock_updates": _native_clock_updates,
		"owner_phase_updates": _native_owner_phase_updates,
		"owner_dispatches": _native_owner_dispatches,
		"queue_dispatches": _native_queue_dispatches,
		"managed_owners": _native_phase_entries.size(),
		"dynamic_spawn_count": _native_dynamic_spawn_count,
		"random_draw_count": _native_random_draw_count,
		"particle_pre_updates": _native_particle_pre_updates,
		"birth_phase_updates": _native_birth_phase_updates,
		"initial_install_revision": _native_initial_install_revision,
		"initial_encounter_report_unchanged": _encounter_report == _native_initial_report}

func bind_native_projectile_emitter(emitter: Node) -> bool:
	if is_instance_valid(_native_projectile_emitter) or not is_instance_valid(emitter):
		return false
	if emitter.get_parent() != self or not emitter.has_method("advance_birth_phase"):
		return false
	_native_projectile_emitter = emitter
	return true

func register_native_phase_consumer(actor: Node2D, owner_step: Callable, queue_step: Callable = Callable()) -> bool:
	if not is_instance_valid(actor) or not owner_step.is_valid():
		return false
	for entry in _native_phase_entries:
		if entry["actor"].get_ref() == actor:
			return false
	# Transfer AI clock ownership only. Render/VFX nodes retain their own source
	# render clocks. An actor cannot execute this phase twice automatically.
	actor.set_physics_process(false)
	_native_phase_entries.append({"actor": weakref(actor), "owner_step": owner_step, "queue_step": queue_step})
	return true

func register_summoned_enemy(enemy: CharacterBody2D) -> Dictionary:
	if not is_instance_valid(enemy) or enemy.get_parent() != null or not is_instance_valid(player):
		return {"valid": false, "errors": ["summon_instance_or_target_invalid"]}
	if not enemy.has_method("set_player") or not enemy.has_signal("telemetry_event") or _enemies.has(enemy):
		return {"valid": false, "errors": ["summon_consumer_interface_invalid"]}
	if not enemy.has_method("is_native_registry_ready") or not enemy.is_native_registry_ready() or not enemy.has_method("advance_native_phase"):
		return {"valid": false, "errors": ["summon_native_dependencies_not_ready"]}
	if enemy.set_player(player) == false:
		return {"valid": false, "errors": ["summon_target_binding_rejected"]}
	if not register_native_phase_consumer(enemy, Callable(enemy, "advance_native_phase")):
		return {"valid": false, "errors": ["summon_owner_phase_registration_rejected"]}
	enemy.telemetry_event.connect(_forward_event)
	_enemies.append(enemy)
	add_child(enemy)
	_native_dynamic_spawn_count += 1
	# Runtime children join actual combat queries; the initial source16 report
	# remains the frozen initial installation rather than a fabricated snapshot.
	return {"valid": true, "errors": [], "registered": true,
		"registry_index": _enemies.size() - 1, "native_frame": _native_frame}

func register_native_initial_consumer(enemy: CharacterBody2D, record: Dictionary) -> Dictionary:
	# This is an explicit late installation API. Main/factory never calls it
	# automatically, and the original source record/support/runtime is retained.
	if not is_instance_valid(player) or not is_instance_valid(enemy) or enemy.get_parent() != null or _enemies.has(enemy):
		return {"valid": false, "errors": ["initial_consumer_instance_or_target_invalid"]}
	var order = int(record.get("order", -1))
	var rows: Array = _encounter_report.get("records", [])
	if order < 0 or order >= rows.size() or rows[order].get("record") != record:
		return {"valid": false, "errors": ["initial_consumer_source_record_mismatch"]}
	if rows[order].get("status") == "supported":
		return {"valid": false, "errors": ["initial_consumer_already_installed"]}
	if record.get("id") != "ch1_initial_004" or order != 3 or record.get("etype") != 7 or record.get("element") != "physical" or record.get("mods") != ["M30"]:
		return {"valid": false, "errors": ["initial_consumer_exact_type7_gate"]}
	var script = enemy.get_script() as Script
	if script == null or script.resource_path != "res://scripts/enemy_type7_physical_flesh_crawler.gd" or not enemy.has_method("get_snapshot"):
		return {"valid": false, "errors": ["initial_consumer_actual_type7_script_required"]}
	var snapshot: Dictionary = enemy.get_snapshot()
	if not snapshot.get("source_owner_dispatch_ready", false) or not enemy.has_method("advance_native") or not enemy.has_method("advance_projectile_warnings"):
		return {"valid": false, "errors": ["initial_consumer_dependencies_not_ready"]}
	enemy.set_player(player)
	if not register_native_phase_consumer(enemy, Callable(enemy, "advance_native"), Callable(enemy, "advance_projectile_warnings")):
		return {"valid": false, "errors": ["initial_consumer_owner_phase_rejected"]}
	var registry_index = 0
	while registry_index < _enemies.size():
		var current: Node = _enemies[registry_index]
		var current_order = _native_initial_order_by_instance.get(current.get_instance_id())
		if current_order == null or int(current_order) > order:
			break
		registry_index += 1
	enemy.telemetry_event.connect(_forward_event)
	_enemies.insert(registry_index, enemy)
	_native_initial_order_by_instance[enemy.get_instance_id()] = order
	add_child(enemy)
	rows[order]["status"] = "supported"
	rows[order]["reason"] = ""
	rows[order]["consumer_profile"] = "native_ch1_etype7_physical_flesh_crawler_v1"
	rows[order]["source_support"] = record["support"].duplicate(true)
	rows[order]["consumer_config"] = "res://scripts/native_type7_runtime.gd"
	_encounter_report["supported_count"] += 1
	_encounter_report["unsupported_count"] -= 1
	_native_initial_install_revision += 1
	_native_initial_report = _encounter_report.duplicate(true)
	return {"valid": true, "errors": [], "registered": true,
		"registry_index": registry_index, "source_order": order,
		"native_frame": _native_frame, "source_record_preserved": rows[order]["record"] == record}

func _physics_process(delta: float) -> void:
	_native_ticks = 0.0
	_native_birth_ticks = 0.0
	if not ready_for_player or not is_instance_valid(player):
		return
	_native_ticks = minf(delta * 60.0, 3.0)
	_native_last_ticks = _native_ticks
	_native_frame += _native_ticks
	_native_clock_updates += 1

func advance_native_owner_phase() -> void:
	if _native_ticks <= 0.0 or not ready_for_player or not is_instance_valid(player):
		return
	if is_inside_tree() and get_tree().paused:
		return
	_native_owner_phase_updates += 1
	# Appended summoned owners participate after their producer, in source order.
	# Every queued warning runs only after all managed owner AI has completed.
	var index = 0
	while index < _native_phase_entries.size():
		var entry: Dictionary = _native_phase_entries[index]
		var actor: Variant = entry["actor"].get_ref()
		if is_instance_valid(actor) and entry["owner_step"].is_valid():
			entry["owner_step"].call(_native_ticks, _native_frame, _enemies)
			_native_owner_dispatches += 1
		index += 1
	# Source poolUpdate follows all owner AI, before warning release/projectiles.
	if is_instance_valid(_native_hit_fx) and _native_hit_fx.advance_particle_pre_projectile(_native_ticks):
		_native_particle_pre_updates += 1
	for entry in _native_phase_entries:
		var actor: Variant = entry["actor"].get_ref()
		if is_instance_valid(actor) and entry["queue_step"].is_valid():
			entry["queue_step"].call(_native_ticks, _native_frame, _enemies)
			_native_queue_dispatches += 1
	_native_birth_ticks = _native_ticks
	_native_ticks = 0.0

func advance_native_birth_phase() -> void:
	if _native_birth_ticks <= 0.0 or (is_inside_tree() and get_tree().paused):
		return
	# All preexisting priority1 projectiles have now advanced. Births queued by
	# owner AI and warnings share their source append order in the emitter.
	if is_instance_valid(_native_projectile_emitter):
		_native_projectile_emitter.advance_birth_phase(_native_birth_ticks, _native_frame)
	# Source player pProjs follow all enemy projectile births, before HitFX3.
	if is_instance_valid(_native_player_projectile_consumer):
		_native_player_projectile_consumer.advance_native(self)
	_native_birth_phase_updates += 1
	_native_birth_ticks = 0.0

func install_native_encounters(source: Variant) -> Dictionary:
	var validation: Dictionary = _encounter_factory.validate_source(source)
	if not validation["valid"]:
		return validation
	if not _encounter_report.is_empty() or not _enemies.is_empty():
		return {"valid": false, "errors": ["already_installed"], "installed": false}
	var prepared: Dictionary = _encounter_factory.consume_atomic(source, self)
	if not prepared["valid"]:
		return prepared
	var instances: Array = prepared["instances"]
	prepared.erase("instances")
	prepared["installed"] = true
	_encounter_report = prepared
	_native_initial_report = prepared.duplicate(true)
	_enemies = instances
	for enemy in _enemies:
		_native_initial_order_by_instance[enemy.get_instance_id()] = int(enemy.data["order"])
		if is_instance_valid(player):
			enemy.set_player(player)
		enemy.telemetry_event.connect(_forward_event)
		add_child(enemy)
	telemetry_event.emit("native_encounters_installed", {"source_count": prepared["source_count"], "supported_count": prepared["supported_count"], "unsupported_count": prepared["unsupported_count"]})
	return get_encounter_report()

func get_encounter_report() -> Dictionary:
	return _encounter_report.duplicate(true)

func set_player(value: Node2D) -> void:
	player = value
	for enemy in _enemies:
		enemy.set_player(value)
	_build_flow()

func _forward_event(kind: String, data: Dictionary) -> void:
	telemetry_event.emit(kind, data)

func _process(delta: float) -> void:
	if not is_instance_valid(player):
		return
	var actual_fps = Engine.get_frames_per_second()
	if actual_fps > 80.0:
		_native_fx_hi_fps = true
	elif actual_fps < 55.0:
		_native_fx_hi_fps = false
	_update_visible_chunks(player.global_position, false)
	_flow_clock += delta
	if _flow_clock >= 0.25:
		_flow_clock = fmod(_flow_clock, 0.25)
		_build_flow()

func _update_visible_chunks(center: Vector2, synchronous: bool) -> void:
	# Full native world data is retained. Only the original nearby 1000px plates are admitted.
	var half_view = get_viewport_rect().size * 0.5 + Vector2(1050, 1050)
	var cam := get_viewport().get_camera_2d()
	if cam:
		half_view = get_viewport_rect().size / cam.zoom * 0.5 + Vector2(1050, 1050)
	var visible_rect = Rect2(center - half_view, half_view * 2.0)
	for spec in _chunk_specs:
		var key = str(spec["x"]) + "," + str(spec["y"])
		var wr: Array = spec["world_rect"]
		var rect = Rect2(float(wr[0]), float(wr[1]), float(wr[2]), float(wr[3]))
		var wanted = rect.intersects(visible_rect)
		if _chunks.has(key):
			_chunks[key].visible = wanted
			continue
		if not wanted:
			continue
		var texture_path: String = spec["texture"]
		var texture: Texture2D
		if synchronous:
			texture = load(texture_path)
		else:
			var status = ResourceLoader.load_threaded_get_status(texture_path)
			if status == ResourceLoader.THREAD_LOAD_INVALID_RESOURCE:
				ResourceLoader.load_threaded_request(texture_path)
				continue
			if status != ResourceLoader.THREAD_LOAD_LOADED:
				continue
			texture = ResourceLoader.load_threaded_get(texture_path)
		var sprite = Sprite2D.new()
		sprite.texture = texture
		sprite.region_enabled = true
		sprite.region_rect = Rect2(1, 1, 1024, 1024)
		sprite.region_filter_clip_enabled = true
		sprite.position = rect.get_center()
		sprite.scale = Vector2.ONE * (1000.0 / 1024.0)
		sprite.z_index = -3000
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		add_child(sprite)
		_chunks[key] = sprite

func _build_collision() -> void:
	var body = StaticBody2D.new()
	body.name = "NativeMapCollision"
	body.collision_layer = 1
	body.collision_mask = 0
	add_child(body)
	for rect in map_data["collision_rects"]:
		var size = Vector2(float(rect[2]), float(rect[3]))
		var shape = RectangleShape2D.new()
		shape.size = size
		_add_shape(body, shape, Vector2(float(rect[0]), float(rect[1])) + size * 0.5)
	# Native isW treats positions outside the complete 8000px world as walls.
	for rect in [Rect2(-400, -400, 8800, 400), Rect2(-400, 8000, 8800, 400), Rect2(-400, 0, 400, 8000), Rect2(8000, 0, 400, 8000)]:
		var edge = RectangleShape2D.new()
		edge.size = rect.size
		_add_shape(body, edge, rect.get_center())
	for data in map_data["prop_colliders"]:
		var origin = Vector2(float(data["position"][0]), float(data["position"][1]))
		var radii = Vector2(float(data["radii"][0]), float(data["radii"][1]))
		if data["kind"] == "circle":
			var circle = CircleShape2D.new()
			circle.radius = radii.x
			_add_shape(body, circle, origin)
		else:
			# Original numeric ellipse remains in map_data/is_world_blocked.
			# Godot's physical ellipse is a 128-segment inscribed polygon, not changed source geometry.
			var points = PackedVector2Array()
			for i in ELLIPSE_SEGMENTS:
				var angle = TAU * float(i) / ELLIPSE_SEGMENTS
				points.append(Vector2(cos(angle) * radii.x, sin(angle) * radii.y))
			var polygon = ConvexPolygonShape2D.new()
			polygon.points = points
			_add_shape(body, polygon, origin)
	_build_hill_collision(body)

func _add_shape(body: StaticBody2D, shape: Shape2D, origin: Vector2) -> void:
	var node = CollisionShape2D.new()
	node.shape = shape
	node.position = origin
	body.add_child(node)
	collision_count += 1

func _build_hill_collision(body: StaticBody2D) -> void:
	var hill: Dictionary = map_data["hill"]
	var center = Vector2(float(hill["cx"]), float(hill["cy"])) * _tile_size
	var radii = Vector2(float(hill["rx"]), float(hill["ry"])) * _tile_size
	for i in ELLIPSE_SEGMENTS:
		var a = TAU * float(i) / ELLIPSE_SEGMENTS
		var b = TAU * float(i + 1) / ELLIPSE_SEGMENTS
		var mid = center + Vector2(cos((a + b) * 0.5) * radii.x, sin((a + b) * 0.5) * radii.y) * float(hill["inner"])
		if _hill_ramp_at(mid / _tile_size) >= 0.0:
			continue
		var points = PackedVector2Array()
		for sample in [[a, hill["inner"]], [a, hill["outer"]], [b, hill["outer"]], [b, hill["inner"]]]:
			points.append(Vector2(cos(float(sample[0])) * radii.x, sin(float(sample[0])) * radii.y) * float(sample[1]))
		var shape = ConvexPolygonShape2D.new()
		shape.points = points
		_add_shape(body, shape, center)

func _hill_ramp_at(tile: Vector2) -> float:
	var h: Dictionary = map_data["hill"]
	if tile.x < float(h["rampX0"]) or tile.x > float(h["rampX1"]):
		return -1.0
	var t = (tile.x - float(h["rampX0"])) / (float(h["rampX1"]) - float(h["rampX0"]))
	var half_width = lerpf(float(h["rampHalf0"]), float(h["rampHalf1"]), t)
	return t if absf(tile.y - float(h["rampY"])) <= half_width else -1.0

func is_world_blocked(pos: Vector2) -> bool:
	if pos.x < 0 or pos.y < 0 or pos.x >= 8000 or pos.y >= 8000:
		return true
	var cell = Vector2i(floori(pos.x / _tile_size), floori(pos.y / _tile_size))
	if int(map_data["tiles"][cell.y * 200 + cell.x]) == 1:
		return true
	var h: Dictionary = map_data["hill"]
	var tile = pos / _tile_size
	if _hill_ramp_at(tile) < 0:
		var q = (tile - Vector2(float(h["cx"]), float(h["cy"]))) / Vector2(float(h["rx"]), float(h["ry"]))
		if q.length() >= float(h["inner"]) and q.length() <= float(h["outer"]):
			return true
	for prop in map_data["prop_colliders"]:
		var q = (pos - Vector2(float(prop["position"][0]), float(prop["position"][1]))) / Vector2(float(prop["radii"][0]), float(prop["radii"][1]))
		if q.length_squared() < 1.0:
			return true
	return false

func has_line_of_sight(from: Vector2, to: Vector2) -> bool:
	var steps = maxi(1, int(from.distance_to(to) / 16.0))
	for i in range(1, steps):
		if is_world_blocked(from.lerp(to, float(i) / steps)):
			return false
	return true

func can_move(pos: Vector2, radius: float) -> bool:
	# Same four point samples as native canMv; hill and prop ellipses remain analytic.
	for corner in [Vector2(-radius, -radius), Vector2(radius, -radius), Vector2(-radius, radius), Vector2(radius, radius)]:
		if is_world_blocked(pos + corner):
			return false
	return true

func native_safe_point(x: float, y: float, radius: float) -> Variant:
	# Source safePt: current point, then T..T*5 in T/2 increments, with
	# eight directions in ascending index order. No new random placement.
	if can_move(Vector2(x, y), radius):
		return {"x": x, "y": y}
	var distance = _tile_size
	while distance <= _tile_size * 5.0:
		for index in range(8):
			var angle = PI / 4.0 * index
			var nx = x + cos(angle) * distance
			var ny = y + sin(angle) * distance
			if can_move(Vector2(nx, ny), radius):
				return {"x": nx, "y": ny}
		distance += _tile_size / 2.0
	return null

func _build_props() -> void:
	for data in map_data["props"]:
		var entry = _request_native_prop_texture(data)
		if entry._phase != "LOADED":
			# Preserve the actual failed terminal (complete=true/width0) and skip
			# only its missing view instead of dereferencing a null texture.
			continue
		var sprite = Sprite2D.new()
		sprite.name = str(data["id"])
		sprite.texture = entry._texture
		var size = Vector2(float(data["draw_size"][0]), float(data["draw_size"][1]))
		var pivot = Vector2(float(data["pivot"][0]), float(data["pivot"][1]))
		sprite.centered = false
		sprite.scale = size / sprite.texture.get_size()
		sprite.offset = -sprite.texture.get_size() * pivot
		sprite.position = Vector2(float(data["position"][0]), float(data["position"][1]))
		sprite.rotation_degrees = float(data["rotation_degrees"])
		sprite.flip_h = bool(data["flip_h"])
		sprite.modulate.a = float(data["alpha"])
		sprite.z_as_relative = false
		sprite.z_index = -2500 if data["ground"] else int(sprite.position.y / 4.0)
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		add_child(sprite)
		entry._prop_ref = weakref(sprite)
		entry._prop_attached = true
	_native_resource_prop_build_complete = true

func _build_flow() -> void:
	if not is_instance_valid(player):
		return
	var target = Vector2i(floori(player.global_position.x / 40.0), floori(player.global_position.y / 40.0))
	if target == _flow_target and not _flow.is_empty():
		return
	_flow_target = target
	_flow.resize(40000)
	_flow.fill(-1)
	if target.x < 0 or target.y < 0 or target.x >= 200 or target.y >= 200:
		return
	var queue = PackedInt32Array()
	queue.resize(40000)
	var head = 0
	var tail = 1
	var first = target.y * 200 + target.x
	queue[0] = first
	_flow[first] = 0
	while head < tail:
		var index = queue[head]
		head += 1
		var x = index % 200
		var y = int(index / 200)
		for offset in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1), Vector2i(1, 1), Vector2i(-1, 1), Vector2i(1, -1), Vector2i(-1, -1)]:
			var xx = x + offset.x
			var yy = y + offset.y
			if xx < 0 or yy < 0 or xx >= 200 or yy >= 200:
				continue
			var ni = yy * 200 + xx
			if _flow[ni] >= 0 or int(map_data["tiles"][ni]) == 1:
				continue
			if offset.x and offset.y and (int(map_data["tiles"][y * 200 + xx]) == 1 or int(map_data["tiles"][yy * 200 + x]) == 1):
				continue
			_flow[ni] = _flow[index] + 1
			queue[tail] = ni
			tail += 1

func get_path_direction(pos: Vector2) -> Vector2:
	if not is_instance_valid(player):
		return Vector2.ZERO
	if _flow.is_empty():
		_build_flow()
	var at = Vector2i(floori(pos.x / 40.0), floori(pos.y / 40.0))
	if at.x < 0 or at.y < 0 or at.x >= 200 or at.y >= 200:
		return (player.global_position - pos).normalized()
	var best = _flow[at.y * 200 + at.x]
	var chosen = at
	for dy in range(-1, 2):
		for dx in range(-1, 2):
			var n = at + Vector2i(dx, dy)
			if n.x < 0 or n.y < 0 or n.x >= 200 or n.y >= 200:
				continue
			var value = _flow[n.y * 200 + n.x]
			if dx and dy and (int(map_data["tiles"][at.y * 200 + n.x]) == 1 or int(map_data["tiles"][n.y * 200 + at.x]) == 1):
				continue
			if value >= 0 and (best < 0 or value < best):
				best = value
				chosen = n
	return (player.global_position - pos).normalized() if chosen == at else (Vector2(chosen) * 40.0 + Vector2(20, 20) - pos).normalized()

# The original incremental shRebuild/shQuery order for Q targets and blue consumers.
var _q_spatial_frame := -1.0
var _q_spatial_grid: Dictionary = {}
var _q_spatial_membership: Dictionary = {}

func query_native_enemies(x: float, y: float, radius: float) -> Array:
	if not ready_for_player or not is_finite(x) or not is_finite(y) or not is_finite(radius) or radius<0.0:return []
	if _q_spatial_frame!=_native_frame:
		_q_spatial_frame=_native_frame
		for enemy in _enemies:
			if not is_instance_valid(enemy):continue
			var id: int = enemy.get_instance_id()
			var old: Variant = _q_spatial_membership.get(id)
			var key: int = int(enemy.global_position.x/128.0)+int(enemy.global_position.y/128.0)*10000
			var live: bool = enemy.get("alive")==true
			if old!=null and (not live or int(old)!=key):
				var cell: Array = _q_spatial_grid[int(old)]
				var index: int = cell.find(enemy)
				if index>=0:
					cell[index]=cell[-1]
					cell.pop_back()
				_q_spatial_membership.erase(id)
			if not live:continue
			if not _q_spatial_membership.has(id):
				if not _q_spatial_grid.has(key):_q_spatial_grid[key]=[]
				_q_spatial_grid[key].append(enemy)
				_q_spatial_membership[id]=key
	var result: Array = []
	for cy in range(int((y-radius)/128.0),int((y+radius)/128.0)+1):
		for cx in range(int((x-radius)/128.0),int((x+radius)/128.0)+1):
			var key: int = cx+cy*10000
			if _q_spatial_grid.has(key):result.append_array(_q_spatial_grid[key])
	return result

func get_native_e_wave_draw_rows() -> Array:
	return _native_hit_fx.get_native_e_wave_draw_rows() if is_instance_valid(_native_hit_fx) else []

func bind_native_player_projectile_store(main: Node) -> bool:
	if is_instance_valid(_native_player_projectiles) or main != get_parent():
		return false
	var store: RefCounted = NativePlayerProjectileStoreScript.new()
	if not store.configure(main, self):
		return false
	_native_player_projectiles = store
	return true

func borrow_native_player_projectile(main: Node) -> Dictionary:
	return _native_player_projectiles.borrow(main) if is_instance_valid(_native_player_projectiles) else {"ready": false, "reason": "actual_world_packet_store_unbound"}

func publish_native_player_projectile(main: Node, packet: RefCounted) -> Dictionary:
	return _native_player_projectiles.publish(main, packet) if is_instance_valid(_native_player_projectiles) else {"ready": false, "reason": "actual_world_packet_store_unbound"}

func retire_native_player_projectile(main: Node, packet: RefCounted, recycle: bool) -> Dictionary:
	return _native_player_projectiles.retire(main, packet, recycle) if is_instance_valid(_native_player_projectiles) else {"ready": false, "reason": "actual_world_packet_store_unbound"}

func read_native_player_projectiles(main: Node) -> Variant:
	return _native_player_projectiles.read_live(main) if is_instance_valid(_native_player_projectiles) else null

func get_native_player_projectile_store_snapshot() -> Dictionary:
	return _native_player_projectiles.get_snapshot() if is_instance_valid(_native_player_projectiles) else {"ready": false, "reason": "actual_world_packet_store_unbound", "latest_full_game": false}

func bind_native_player_projectile_consumer(main: Node) -> bool:
	if is_instance_valid(_native_player_projectile_consumer) or main!=get_parent() or not is_instance_valid(_native_player_projectiles):
		return false
	var consumer: RefCounted=NativeFireballWorldConsumerScript.new()
	if not consumer.configure(main,self):
		return false
	_native_player_projectile_consumer=consumer
	return true

func begin_native_player_projectile_iteration(main: Node) -> Dictionary:
	return _native_player_projectiles.begin_native_iteration(main) if is_instance_valid(_native_player_projectiles) else {"ready":false,"reason":"actual_world_packet_store_unbound"}

func finish_native_player_projectile_iteration(main: Node,survivors: int) -> bool:
	return _native_player_projectiles.finish_native_iteration(main,survivors) if is_instance_valid(_native_player_projectiles) else false

func get_native_player_projectile_consumer_snapshot() -> Dictionary:
	return _native_player_projectile_consumer.get_snapshot() if is_instance_valid(_native_player_projectile_consumer) else {"mounted":false,"full_skill_complete":false}

func _record_native_fireball_projectile_release(fields: Dictionary) -> void:
	if is_instance_valid(_native_player_projectile_consumer):
		_native_player_projectile_consumer.record_native_release(fields)

# Local source damage field invocations: same actor/registry, nested stack order.
# Other hurtE owners and source clocks are not manufactured by this field owner.
const NativeNormalEnemyFieldsScript = preload("res://scripts/native_source_normal_enemy_fields.gd")
var _native_normal_enemy_field_calls: Array = []

func read_native_normal_enemy_damage_fields(enemy: Node) -> Dictionary:
	if not ready_for_player or not is_inside_tree() or not is_instance_valid(enemy) or enemy.is_queued_for_deletion() or enemy.get_parent() != self or not _enemies.has(enemy) or not enemy.has_method("read_native_source_damage_fields"): return {"ready": false, "reason": "actual_normal_actor_not_registered"}
	return enemy.read_native_source_damage_fields(self)

func begin_native_normal_enemy_field_call(enemy: Node) -> RefCounted:
	var fields: Dictionary = read_native_normal_enemy_damage_fields(enemy)
	if fields.get("ready") != true or fields.get("legacy_pending_poise") != 0.0: return null
	var invocation: RefCounted = NativeNormalEnemyFieldsScript.new()
	invocation.configure(self, enemy)
	_native_normal_enemy_field_calls.append({"call": invocation, "actor": weakref(enemy)})
	return invocation

func is_native_normal_enemy_field_call_current(invocation: RefCounted, enemy: Node) -> bool:
	if _native_normal_enemy_field_calls.is_empty() or not is_instance_valid(invocation): return false
	var current: Dictionary = _native_normal_enemy_field_calls[-1]
	return current["call"] == invocation and current["actor"].get_ref() == enemy and read_native_normal_enemy_damage_fields(enemy).get("ready") == true

func end_native_normal_enemy_field_call(invocation: RefCounted) -> bool:
	if _native_normal_enemy_field_calls.is_empty() or _native_normal_enemy_field_calls[-1]["call"] != invocation: return false
	invocation.close()
	_native_normal_enemy_field_calls.pop_back()
	return true

func get_native_normal_enemy_poise_hit(invocation: RefCounted) -> Callable:
	if _native_normal_enemy_field_calls.is_empty() or not is_instance_valid(invocation): return Callable()
	var actor: Variant = _native_normal_enemy_field_calls[-1]["actor"].get_ref()
	if not is_instance_valid(actor) or not is_native_normal_enemy_field_call_current(invocation, actor): return Callable()
	# The World does not store this self-bound Callable. The invocation keeps
	# only weak World/actor handles, avoiding a self-owned callback graph.
	return invocation.get_poise_hit_callable()

# One shared implementation for legacy scalar and the typed owner boundary.
func _sample_native_random_unit_with_receipt(completion_receipt: Variant) -> float:
	_native_random_draw_count += 1
	var sample: float = float(randi()) / 4294967296.0
	if completion_receipt is Dictionary:
		completion_receipt["sample_result"] = {"completed":true,"value":sample}
	return sample

func read_native_source_random_unit(main: Variant, services: Variant,
		completion_receipt: Variant) -> Dictionary:
	var source := "World.sample_native_random_unit/shared_operation"
	if not completion_receipt is Dictionary:
		return {"status":"NOT_READY","provider":"rand","source":source,
			"reason":"rand_receipt_type","sample_invoked":false,"sample_completed":false,
			"consumption":"NONE","raw_receipt":completion_receipt}
	if not completion_receipt.is_empty():
		return {"status":"NOT_READY","provider":"rand","source":source,
			"reason":"rand_receipt_not_fresh","sample_invoked":false,"sample_completed":false,
			"consumption":"NONE","completion_receipt":completion_receipt}
	if not main is Node or not is_instance_valid(main) or not services is RefCounted \
			or not is_instance_valid(services) or not main.is_native_source_rand_context_current(services, self):
		return {"status":"NOT_READY","provider":"rand","source":source,
			"reason":"rand_owner_unavailable","sample_invoked":false,"sample_completed":false,
			"consumption":"NONE","completion_receipt":completion_receipt}
	completion_receipt["sample_invoked"] = true
	var scalar_return: Variant = _sample_native_random_unit_with_receipt(completion_receipt)
	var sample: Variant = completion_receipt.get("sample_result")
	var completed: bool = sample is Dictionary and typeof(sample.get("completed")) == TYPE_BOOL \
		and sample.get("completed") == true and sample.has("value")
	if not is_instance_valid(main) or not main.is_native_source_rand_context_current(services, self):
		return {"status":"NOT_READY","provider":"rand","source":source,
			"reason":"rand_owner_changed_after_sample","sample_invoked":completion_receipt.get("sample_invoked", "UNKNOWN"),
			"sample_completed":true if completed else "UNKNOWN",
			"consumption":"COMPLETED" if completed else "UNKNOWN",
			"completion_receipt":completion_receipt,"raw_result":sample,"raw_call_return":scalar_return}
	if not completed:
		return {"status":"NOT_READY","provider":"rand","source":source,
			"reason":"sampler_completion_unobserved","sample_invoked":completion_receipt.get("sample_invoked", "UNKNOWN"),
			"sample_completed":"UNKNOWN","consumption":"UNKNOWN","completion_receipt":completion_receipt,
			"raw_result":sample,"raw_call_return":scalar_return}
	var value: Variant = sample["value"]
	if typeof(value) != TYPE_FLOAT or is_nan(value) or is_inf(value) or value < 0.0 or value >= 1.0:
		return {"status":"UNSUPPORTED_OPERAND","provider":"rand","source":source,
			"reason":"rand_sample_outside_supported_native_domain","sample_invoked":true,
			"sample_completed":true,"consumption":"COMPLETED","completion_receipt":completion_receipt,
			"raw_result":sample,"raw_call_return":scalar_return}
	return {"status":"READY","provider":"rand","source":source,"reason":"","value":value,
		"non_finite":false,"sample_invoked":true,"sample_completed":true,"consumption":"COMPLETED",
		"completion_receipt":completion_receipt,"raw_result":sample,"raw_call_return":scalar_return}
