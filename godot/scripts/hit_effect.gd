extends Node2D
## Original 2x2 / four-frame radiant sheet. No new image frames are authored.

const SHEET = preload("res://assets/vfx/ki_slash_hit_radiant_sheet.png")
const ADDITIVE = preload("res://assets/vfx/radiant.gdshader")
var _sprite: AnimatedSprite2D
var _age_frames: float = 0.0
var _frame_ticks: float = 3.0
var _width: float = 140.0
var _palette: int = 0

func configure(point: Vector2, direction: Vector2, width: float = 140.0, palette: int = 0, frame_ticks: float = 3.0) -> void:
	global_position = point
	z_as_relative = false
	z_index = clampi(int(point.y / 4.0) + 2, -4096, 4095)
	rotation = direction.angle()
	_width = width
	_palette = palette
	_frame_ticks = maxf(0.01, frame_ticks)
	if _sprite != null:
		_apply_display()

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	z_as_relative = false
	z_index = clampi(int(global_position.y / 4.0) + 2, -4096, 4095)
	_sprite = AnimatedSprite2D.new()
	_sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	var frames := SpriteFrames.new()
	frames.remove_animation("default")
	frames.add_animation("hit")
	frames.set_animation_loop("hit", false)
	frames.set_animation_speed("hit", 60.0 / _frame_ticks)
	for index in range(4):
		var frame := AtlasTexture.new()
		frame.atlas = SHEET
		frame.region = Rect2((index % 2) * 627, (index / 2) * 627, 627, 627)
		frames.add_frame("hit", frame)
	_sprite.sprite_frames = frames
	_sprite.animation = "hit"
	add_child(_sprite)
	_apply_display()

func _apply_display() -> void:
	_sprite.scale = Vector2.ONE * (_width / 627.0)
	var additive := ShaderMaterial.new()
	additive.shader = ADDITIVE
	additive.set_shader_parameter("hue_degrees", 150.0 if _palette == 2 else (40.0 if _palette == 1 else 0.0))
	_sprite.material = additive

func _process(delta: float) -> void:
	_age_frames += delta * 60.0
	if _age_frames >= _frame_ticks * 4.0:
		queue_free()
		return
	_sprite.frame = mini(3, int(floor(_age_frames / _frame_ticks)))
