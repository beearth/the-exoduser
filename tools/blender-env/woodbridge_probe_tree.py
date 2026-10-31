"""색/법선/원본재질을 같은52도에서 분리한다. 납품/공식 렌더/영수증은 변경하지 않는다."""
import bpy,bmesh,sys
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');path=Path(__file__).with_name('woodbridge_render.py');original=path.read_text(encoding='utf8')
def probe(mode):
 o=bpy.data.objects['RF_Ancient_Rotten_Tree'];o.data=(bpy.data.objects['RF_Ancient_Rotten_Tree_High'].data if mode.startswith('원본') else o.data).copy()
 if mode.endswith('정규화'):
  size=max(max(v.co[k] for v in o.data.vertices)-min(v.co[k] for v in o.data.vertices) for k in range(3));factor=8/size;o.scale=(factor,)*3;o.location.z=-min(v.co.z for v in o.data.vertices)*factor
 if mode.endswith('자동법선'):
  bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free()
  for f in o.data.polygons:f.use_smooth=True
  o.data.normals_split_custom_set([(0,0,0)]*len(o.data.loops));o.data.update()
 for i,mat in enumerate(list(o.data.materials)):
  if not mat or not mat.use_nodes:continue
  mat=mat.copy();o.data.materials[i]=mat;n=mat.node_tree.nodes;l=mat.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED')
  if mode.endswith('색만'):
   em=n.new('ShaderNodeEmission');em.inputs[1].default_value=1;col=bs.inputs['Base Color']
   if col.is_linked:l.new(col.links[0].from_socket,em.inputs[0])
   else:em.inputs[0].default_value=col.default_value
   out=next(q for q in n if q.type=='OUTPUT_MATERIAL');l.new(em.outputs[0],out.inputs[0])
  elif mode in ['납품_노멀제외','납품_자동법선']:
   for link in list(bs.inputs['Normal'].links):l.remove(link)
for mode in ['납품_광원검수정규화']:
 code=original.replace('S=bpy.context.scene\n',"S=bpy.context.scene\nprobe('"+mode+"')\n",1).replace('S.cycles.samples=32','S.cycles.samples=12').replace('S.render.resolution_x=1600;S.render.resolution_y=1000','S.render.resolution_x=800;S.render.resolution_y=500').replace('for side in [0,1]','for side in [1]').replace("S.render.filepath=str(R/'renders'/(r['id']+('_side' if side else '')+'.png'))","S.render.filepath=str(R/'compare'/'진단_"+mode+".png')")
 code='\n'.join(line for line in code.splitlines() if not ('입력_' in line and 'write_text' in line));sys.argv=['probe','--modules','--only','RF_Ancient_Rotten_Tree']
 try:exec(compile(code,str(path),'exec'))
 except SystemExit:pass
print('동일각도4종 분리 진단 렌더 완료·실제 파일 무변경',flush=True)
