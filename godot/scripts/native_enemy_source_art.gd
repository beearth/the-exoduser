extends RefCounted
## Display-only preparation for the already admitted natural actor.
## Snapshot53640-53675: home-selected 8-dir cell; max(r*7,80), no fixed template size.
## Called once before the existing atlas textures/sprites are prepared. No PC fields written.
static func prepare(animation: Dictionary, native: Dictionary, radius: float) -> void:
 var col: int=int(native.get("_mob8Col",animation.get("column",0)))
 var row: int=int(native.get("_mob8Row",animation.get("row",0)))
 animation.column=col;animation.row=row
 animation.base_rect=[col*256,row*256,256,256]
 animation.walk_frame_rects=[]
 for frame in 4:animation.walk_frame_rects.append([(col*4+frame)*256,row*256,256,256])
 animation.draw_height=maxf(radius*7.0,80.0)

# Snapshot5483-5489: proxy _tQuad snaps both screen-space edges independently.
# Node2D transform only; no movement/camera/AI write.
static func screen_rect(actor: Node2D,size_: float) -> Rect2:
 var transform_: Transform2D=actor.get_global_transform_with_canvas()
 var top: Vector2=(transform_*(Vector2.ONE*(-size_*.5))+Vector2(.5,.5)).floor()
 var bottom: Vector2=(transform_*(Vector2.ONE*(size_*.5))+Vector2(.5,.5)).floor()
 var inverse: Transform2D=transform_.affine_inverse()
 var local_top: Vector2=inverse*top
 return Rect2(local_top,inverse*bottom-local_top)
static func snap_sprite(actor: Node2D,sprite: Sprite2D,size_: float,cell: float=256) -> void:
 var rect: Rect2=screen_rect(actor,size_)
 sprite.position=rect.get_center();sprite.scale=rect.size/cell
