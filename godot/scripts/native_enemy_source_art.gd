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
