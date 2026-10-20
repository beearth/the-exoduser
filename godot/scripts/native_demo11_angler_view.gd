extends Node2D
const SHEET=preload("res://assets/fieldboss/fieldboss_angler.png")
var record: Dictionary
func _draw() -> void:
 if record.is_empty() or record.asleep or record.hid:return
 var cell: Vector2=Vector2(SHEET.get_size())/Vector2(4,2)
 var frame: int=int(record.frame)&7
 draw_texture_rect_region(SHEET,Rect2(-150,-150,300,300),Rect2(Vector2(frame%4,frame/4)*cell,cell))
