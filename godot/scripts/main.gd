extends Node2D
const UI = preload("res://scripts/native_demo_ui_i18n.gd")
## Native Godot scene. No WebView, HTTP API or browser save access.

signal native_demo_boss_defeated(stage_index: int) # DEMO11-37 -> DEMO11-38, final death only
const NativeDemoEndFlow = preload("res://scripts/native_demo_end_flow.gd")
var native_demo_end_flow: CanvasLayer

const DemoPauseMenu = preload("res://scripts/native_demo_pause_menu.gd")
var native_demo_pause_menu: CanvasLayer

const Demo11Authority = preload("res://scripts/native_demo11_authority.gd")
const NativePerspectiveViewScript = preload("res://scripts/native_perspective_view.gd")
const WorldScript = preload("res://scripts/world.gd")
const PlayerScript = preload("res://scripts/player.gd")
const CrescentScript = preload("res://scripts/crescent.gd")
const HudScript = preload("res://scripts/hud.gd")
const CaptureScript = preload("res://scripts/performance_capture.gd")
const SourceResourcesScript = preload("res://scripts/native_source_resource_authority.gd")
const SourceParameters = preload("res://port_modules/player_resource_parameters_source/producer.gd")
const SourceStateScript = preload("res://scripts/native_source_new_run_state.gd")
const SourceProvidersScript = preload("res://scripts/native_source_player_providers.gd")
const SourceInitializationScript = preload("res://scripts/native_source_player_initialization.gd")
const SourceInitializationServicesScript = preload("res://scripts/native_source_player_initialization_services.gd")
const SourceLessonScript = preload("res://port_modules/parry_lesson_source/producer.gd")
const ForgeScript = preload("res://scripts/native_forge_panel.gd") # DEMO11-27
const AutoPotionScript = preload("res://scripts/native_potion_recovery.gd") # DEMO11-25
const RegenerationPhaseScript = preload("res://scripts/native_source_player_regeneration_phase.gd") # P2-005d
const NativeSpriteInspector = preload("res://port_modules/native_sprite_resource_readiness/producer.gd")
const NativePlayerSpriteExpectation = preload("res://scripts/native_player_sprite_expectation.gd")
const IntroCurtainViewScript = preload("res://port_modules/character_clip/intro_curtain_view.gd")
const IntroCurtainFinishScript = preload("res://port_modules/character_clip/intro_curtain_source_finish.gd")
const IntroCurtainSequenceScript = preload("res://scripts/native_intro_curtain_sequence.gd") # P2-001i
const SourceImageWaitScript = preload("res://port_modules/source_object_sprite_wait_owner/producer.gd")
const SourcePrepareViewScript = preload("res://port_modules/source_prepare_start_map_view_owner/producer.gd")
const SourcePostStageScript = preload("res://port_modules/source_post_stage_owner/producer.gd")
const QAdapterScript = preload("res://scripts/native_combat_qe_adapter.gd")
const NativeFireballPhaseScript = preload("res://scripts/native_fireball_phase.gd")
const QBurstDrawScript = preload("res://port_modules/character_clip/shield_burst_draw_caller.gd")
const M29ContactServicesScript = preload("res://scripts/native_m29_contact_services.gd") # PC-M29-PARRY
const CombatPackBScript = preload("res://scripts/native_combat_pack_b.gd") # PC-COMBAT-PACK-B
