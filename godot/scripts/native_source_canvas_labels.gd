extends RefCounted
## Exact snapshot _getAtlasTxt raster + fillText placement for the existing No1034/1151 labels.
const ATLAS=preload("res://assets/source_labels/revive.res")
static var _rows: Dictionary={}
static var _ready:=false
static func prepare() -> void:
 if _ready:return
 var source: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://data/source_revive_labels.json"))
 for key in source.entries:
  var row: Dictionary=source.entries[key]
  _rows[key]={"source":Rect2(row.source[0],row.source[1],row.source[2],row.source[3]),"offset":Vector2(row.offset[0],row.offset[1])}
 _ready=true
static func snap(canvas: Node2D,rect: Rect2) -> Rect2:
 var transform_: Transform2D=canvas.get_global_transform_with_canvas()
 if transform_.x.y!=0 or transform_.y.x!=0:return rect
 var inverse: Transform2D=transform_.affine_inverse()
 var top: Vector2=inverse*((transform_*rect.position+Vector2(.5,.5)).floor())
 var bottom: Vector2=inverse*((transform_*rect.end+Vector2(.5,.5)).floor())
 return Rect2(top,bottom-top)
static func draw(canvas: Node2D,key: String,at: Vector2,alpha: float) -> bool:
 if not _rows.has(key):return false
 var row: Dictionary=_rows[key]
 canvas.draw_texture_rect_region(ATLAS,snap(canvas,Rect2(at+row.offset,row.source.size)),row.source,Color(1,1,1,alpha))
 return true
