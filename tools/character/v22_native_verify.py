"""Semantic checks for the v22 native mesh repairs; run through Blender."""
import bpy, json, sys, argparse, numpy as np
from pathlib import Path
from mathutils import Vector

def blue_back_faces(obj):
 mesh=obj.data;uv=mesh.uv_layers.active.data;cache={};count=0
 for p in mesh.polygons:
  c=obj.matrix_world@p.center
  if not (.445<c.x<.57 and c.y>.031 and 1.285<c.z<1.345):continue
  mat=mesh.materials[p.material_index];bsdf=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
  links=list(bsdf.inputs['Base Color'].links)
  if not links:rgb=bsdf.inputs['Base Color'].default_value[:3]
  elif links[0].from_node.type=='TEX_IMAGE':
   im=links[0].from_node.image
   if im.name not in cache:
    arr=np.empty(len(im.pixels),dtype=np.float32);im.pixels.foreach_get(arr);cache[im.name]=arr.reshape((im.size[1],im.size[0],4))
   u=sum(uv[i].uv.x for i in p.loop_indices)/len(p.loop_indices);v=sum(uv[i].uv.y for i in p.loop_indices)/len(p.loop_indices)
   rgb=cache[im.name][min(im.size[1]-1,max(0,int(v*im.size[1]))),min(im.size[0]-1,max(0,int(u*im.size[0]))),:3]
  else:raise AssertionError('Unsupported base color graph; inspect explicitly')
  if rgb[2]>.25 and rgb[2]>rgb[0]*1.45 and rgb[2]>rgb[1]*1.08:count+=1
 return count

def verify(source,out):
 rows=[]
 for name in ['transmuter','spearmage']:
  bpy.ops.wm.read_factory_settings(use_empty=True)
  bpy.ops.import_scene.gltf(filepath=str(source/name/'character.glb'))
  meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers)]
  bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
  row={'id':name,'checks':{}}
  if name=='transmuter':
   row['backBlueFaces']=sum(blue_back_faces(o) for o in meshes);row['checks']['no_duplicate_rear_blue_core']=row['backBlueFaces']==0
  else:
   hits=[]
   for x,z in [(0,1.27),(-.01,1.28),(0,1.278)]:
    ys=[]
    for o in meshes:
     ev=o.evaluated_get(deps);inv=o.matrix_world.inverted();hit,loc,n,idx=ev.ray_cast(inv@Vector((x,4,z)),Vector((0,-1,0)))
     if hit:ys.append((o.matrix_world@loc).y)
    hits.append(max(ys) if ys else None)
   row['backSurfaceY']=hits;row['checks']['back_skin_closed']=all(y is not None and y>.06 for y in hits)
  rows.append(row)
 result={'models':rows,'passed':all(all(r['checks'].values()) for r in rows)}
 out.write_text(json.dumps(result,indent=2),encoding='utf8');print(json.dumps(result),flush=True)
 return result['passed']

if __name__=='__main__':
 args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
 p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args(args)
 if not verify(a.source,a.out):raise RuntimeError('V22 native repair acceptance checks failed')
