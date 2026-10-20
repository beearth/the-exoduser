extends Node2D
const SHEETS=[preload("res://assets/fieldboss/worm_burrow1.png"),preload("res://assets/fieldboss/worm_burrow2.png")]
var record: Dictionary
func _draw() -> void:
 if record.is_empty() or record.asleep or (record.phase=="hide" and record.hideT>54):return
 var frame: int=clampi(int(record.frame),0,11)
 var texture: Texture2D=SHEETS[1 if record.face else 0]
 var cell: Vector2=texture.get_size()/Vector2(4,3)
 draw_texture_rect_region(texture,Rect2(-75,-120,150,150),Rect2(Vector2(frame%4,int(frame/4))*cell,cell))
