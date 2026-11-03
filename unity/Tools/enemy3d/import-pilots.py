# Asset-format conversion only; source GLBs remain untouched. Run Blender -b -P this_file.
import bpy, sys, os, json, math
from mathutils import Vector
BASE='I:/EXODUSER-Storage/boss/enemy3d-20261104/'
OUT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../../Assets/Exoduser/Resources/Enemies3D'))
os.makedirs(OUT,exist_ok=True)
models=[('SpineApostle',BASE+'spine_rig_20261104_0024/basic_animations_walking_glb.glb'),('EyeMass',BASE+'tripo/eyemass_meshy_tripo_rigged.glb')]
results=[]
for name,src in models:
 bpy.ops.wm.read_factory_settings(use_empty=True)
 bpy.ops.import_scene.gltf(filepath=src)
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
 rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE']
 assert sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons)>8000, 'Armature preview mesh must never be shipped as the model'
 # Convert textured material to a small set of broad colour planes for the shared hero toon shader.
 # Preserve skin/bone/eye planes by deterministic palette assignment, no new texture or noise.
 palette=[(.045,.025,.020),(.16,.075,.045),(.28,.16,.10),(.38,.29,.18),(.20,.25,.14),(.53,.49,.31),(.76,.71,.53),(.32,.045,.025)]
 for obj in meshes:
  original=list(obj.data.materials); images=[]
  for mat in original:
   image=None
   if mat and mat.use_nodes:
    for node in mat.node_tree.nodes:
     if node.type=='TEX_IMAGE' and node.image and ('base' in node.image.name.lower() or image is None):image=node.image
   images.append(image)
  cache={im.name:(list(im.pixels),im.size[0],im.size[1]) for im in images if im}
  uv=obj.data.uv_layers.active.data if obj.data.uv_layers.active else None
  assignments=[]
  for face in obj.data.polygons:
   im=images[min(face.material_index,len(images)-1)] if images else None
   c=(.28,.16,.10)
   if im and uv:
    pixels,w,h=cache[im.name];u=sum(uv[k].uv.x for k in face.loop_indices)/len(face.loop_indices);v=sum(uv[k].uv.y for k in face.loop_indices)/len(face.loop_indices)
    n=(int(v%1*h)*w+int(u%1*w))*4;c=tuple(pixels[n:n+3])
   assignments.append(min(range(len(palette)),key=lambda k:sum((c[j]-palette[k][j])**2 for j in range(3))))
  obj.data.materials.clear()
  for c in palette:
   hexcode=''.join('%02x'%round(x*255) for x in c);mat=bpy.data.materials.new('enemy_'+hexcode);mat.diffuse_color=(*c,1);mat.use_nodes=True;mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*c,1);obj.data.materials.append(mat)
  for face,k in zip(obj.data.polygons,assignments):face.material_index=k
  for face in obj.data.polygons:face.use_smooth=True
 actions=list(bpy.data.actions)
 for action in actions:action.name='Walk'
 bpy.context.scene.render.fps=60
 bpy.ops.object.select_all(action='SELECT')
 bpy.ops.export_scene.fbx(filepath=os.path.join(OUT,name+'.fbx'),use_selection=True,object_types={'ARMATURE','MESH'},add_leaf_bones=False,bake_anim=bool(actions),bake_anim_use_all_actions=True,bake_anim_use_nla_strips=False,bake_anim_simplify_factor=0,axis_forward='-Z',axis_up='Y',path_mode='STRIP')
 results.append({'model':name,'source':src,'bones':sum(len(o.data.bones) for o in rigs),'triangles':sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons),'actions':[a.name for a in actions],'palettePlanes':len(palette)})
with open(os.path.join(OUT,'pilot-provenance.json'),'w',encoding='utf8') as f:json.dump(results,f,ensure_ascii=False,indent=2)
print('ENEMY3D_CONVERSION',json.dumps(results))
