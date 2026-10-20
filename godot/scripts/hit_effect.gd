extends Node2D
## Original 2x2 / four-frame radiant sheet. No new image frames are authored.

# P2-007a — 원본 명중광(game.html 19360~19366): ki_slash_hit_silver_sheet.png(바이트 복사) 2×2·4프레임,
# 색 변환 폐지(_kiSlashTintSurfaces 동일 참조) + 검은 잉크 층(_drawKiHitShadows 19370~19378: 일반 합성,
# 1.14배, alpha .85×(1−fr×.18), fr=⌊age/3⌋ 0~3).
const SHEET = preload("res://assets/vfx/ki_slash_hit_silver_sheet.png")
const ADDITIVE = preload("res://assets/vfx/radiant.gdshader")
const INK = preload("res://assets/vfx/ki_slash_ink.gdshader")
var _sprite: AnimatedSprite2D
var _ink: AnimatedSprite2D
var _age_frames: float = 0.0
var _frame_ticks: float = 3.0
var _width: float = 140.0
var _palette: int = 0
var _with_ink: bool = false # 잉크 층은 _playKiSlashHit(19380) 명중에만 — 풀차지 섬광(16846 playVFXAng)은 없음

func configure(point: Vector2, direction: Vector2, width: float = 140.0, palette: int = 0, frame_ticks: float = 3.0, with_ink: bool = false) -> void:
	global_position = point
	z_as_relative = false
	z_index = clampi(int(point.y / 4.0) + 2, -4096, 4095)
	rotation = direction.angle()
	_width = width
	_palette = palette
	_with_ink = with_ink
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
	_ink = AnimatedSprite2D.new()
	_ink.name = "Ink"
	_ink.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	_ink.sprite_frames = frames
	_ink.animation = "hit"
	var ink_material := ShaderMaterial.new()
	ink_material.shader = INK
	_ink.material = ink_material
	add_child(_ink)
	_sprite.sprite_frames = frames
	_sprite.animation = "hit"
	add_child(_sprite)
	_apply_display()

func _apply_display() -> void:
	_sprite.scale = Vector2.ONE * (_width / 627.0)
	_ink.visible = _with_ink
	_ink.scale = Vector2.ONE * (_width * 1.14 / 627.0)
	_ink.modulate.a = 0.85 * (1.0 - float(_ink.frame) * 0.18)
	var additive := ShaderMaterial.new()
	additive.shader = ADDITIVE
	additive.set_shader_parameter("hue_degrees", 0.0) # 19361 색 변환 폐지 — palette 인자 무시(원본 _kiSlashPalette=0)
	_sprite.material = additive

func _process(delta: float) -> void:
	_age_frames += delta * 60.0
	if _age_frames >= _frame_ticks * 4.0:
		queue_free()
		return
	_sprite.frame = mini(3, int(floor(_age_frames / _frame_ticks)))
	_sprite.modulate.a = 1.0 - float(_sprite.frame) / 4.0 * 0.3 # 54584 _vAlpha=1−(frame/maxFrames)·.3 (VFX 풀 가산)
	_ink.frame = _sprite.frame
	_ink.modulate.a = 0.85 * (1.0 - float(_ink.frame) * 0.18)
