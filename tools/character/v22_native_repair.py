"""Repair the approved v22 models without changing source images or body topology."""
import bpy,sys,argparse,json,hashlib,math,numpy as np
from pathlib import Path
from mathutils import Vector
from mathutils.kdtree import KDTree

def digest_mesh(mesh):
 co=np.empty(len(mesh.vertices)*3,dtype=np.float32);mesh.vertices.foreach_get('co',co)
 uv=np.empty(len(mesh.uv_layers.active.data)*2,dtype=np.float32);mesh.uv_layers.active.data.foreach_get('uv',uv)
 return {'vertices':len(mesh.vertices),'faces':len(mesh.polygons),'positionsSha256':hashlib.sha256(co.tobytes()).hexdigest(),'uvSha256':hashlib.sha256(uv.tobytes()).hexdigest()}

def base_pixels(mesh):
 bsdf=next(n for n in mesh.materials[0].node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 im=bsdf.inputs['Base Color'].links[0].from_node.image
 pix=np.empty(len(im.pixels),dtype=np.float32);im.pixels.foreach_get(pix)
 return im,pix.reshape((im.size[1],im.size[0],4))

def replace_rear_core(obj):
 mesh=obj.data;im,pixels=base_pixels(mesh);uv=mesh.uv_layers.active.data
 metal=mesh.materials[0].copy();metal.name='Gauntlet_Rear_Steel_Inlay'
 bsdf=next(n for n in metal.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
 for key,value in [('Base Color',(.045,.052,.065,1)),('Metallic',.7),('Roughness',.4)]:
  for link in list(bsdf.inputs[key].links):metal.node_tree.links.remove(link)
  bsdf.inputs[key].default_value=value
 mesh.materials.append(metal);slot=len(mesh.materials)-1;changed=[]
 for p in mesh.polygons:
  c=obj.matrix_world@p.center
  if not (.445<c.x<.57 and c.y>.031 and 1.285<c.z<1.345):continue
  u=sum(uv[i].uv.x for i in p.loop_indices)/len(p.loop_indices);v=sum(uv[i].uv.y for i in p.loop_indices)/len(p.loop_indices)
  rgb=pixels[min(im.size[1]-1,max(0,int(v*im.size[1]))),min(im.size[0]-1,max(0,int(u*im.size[0]))),:3]
  if rgb[2]>.15 and rgb[2]>rgb[0]*1.3 and rgb[2]>rgb[1]*1.04:
   p.material_index=slot;changed.append(p.index)
 assert len(changed)>70,'Duplicate core region not identified'
 return {'materialFacesChanged':len(changed),'faceIndices':changed,'change':'Rear duplicate blue lens uses native steel inlay material; original front blue core retained','newTextures':0}

def hull(points):
 points=sorted(set(points))
 def cross(o,a,b):return(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
 lo=[];hi=[]
 for p in points:
  while len(lo)>1 and cross(lo[-2],lo[-1],p)<=0:lo.pop()
  lo.append(p)
 for p in reversed(points):
  while len(hi)>1 and cross(hi[-2],hi[-1],p)<=0:hi.pop()
  hi.append(p)
 return lo[:-1]+hi[:-1]

def refine_patch_uv(mesh):
 im,pixels=base_pixels(mesh);layer=mesh.uv_layers.active.data
 original=[v.uv.copy() for v in layer];center=original[0].copy()
 def skin_only(factor):
  for face in mesh.polygons:
   values=[center+(original[i]-center)*factor for i in face.loop_indices]
   for a in range(9):
    for b in range(9-a):
     uv=values[0]*(1-(a+b)/8)+values[1]*(a/8)+values[2]*(b/8)
     rgb=pixels[min(im.size[1]-1,max(0,int(uv.y*im.size[1]))),min(im.size[0]-1,max(0,int(uv.x*im.size[0]))),:3]
     if not(rgb[0]>.55 and rgb[1]>.4 and rgb[2]>.35 and rgb[0]>rgb[1]):return False
  return True
 before=skin_only(1)
 factor=next((v for v in [1,.75,.5,.25,.125,.0625] if skin_only(v)),None)
 assert factor is not None,'No clean adjacent skin UV region; do not hide with a guessed texture'
 for i,v in enumerate(layer):v.uv=center+(original[i]-center)*factor
 return {'beforeAllPatchSamplesSkin':before,'afterAllPatchSamplesSkin':True,'uvScaleAroundAdjacentSkin':factor,'newTextures':0}

def close_back(obj,arm):
 inv=obj.matrix_world.inverted();deps=bpy.context.evaluated_depsgraph_get();ev=obj.evaluated_get(deps)
 def ray(x,z):
  hit,loc,n,idx=ev.ray_cast(inv@Vector((x,4,z)),Vector((0,-1,0)))
  return (obj.matrix_world@loc,idx) if hit else (None,None)
 holes=[];good=[]
 for x in np.arange(-.04,.0401,.002):
  for z in np.arange(1.25,1.3201,.002):
   loc,idx=ray(float(x),float(z))
   if loc is not None and loc.y<.06:holes.append((float(x),float(z)))
   elif loc is not None and loc.y>.075 and (abs(x)>.022 or z>1.296):good.append((float(x),float(z),loc.y))
 assert 8<len(holes)<300,('Unexpected hole footprint',len(holes))
 outline=hull(holes);center=np.mean(outline,axis=0)
 outline=[tuple(center+(np.array(p)-center)*(1+.003/max(np.linalg.norm(np.array(p)-center),.001))) for p in outline]
 def features(x,z):z=z-1.285;return[1,x,z,x*x,x*z,z*z]
 fit=np.linalg.lstsq(np.array([features(x,z) for x,z,y in good]),np.array([y for x,z,y in good]),rcond=None)[0]
 # Reuse an adjacent back-skin UV triangle; no pixel editing or replacement texture.
 loc,idx=ray(0,1.305);assert loc is not None and loc.y>.07;uv_reference_face=idx
 p=obj.data.polygons[idx];uv=obj.data.uv_layers.active.data
 a=np.array([[*(obj.matrix_world@obj.data.vertices[v].co)[::2],1] for v in p.vertices])
 b=np.array([list(uv[l].uv) for l in p.loop_indices]);uv_fit=np.linalg.solve(a,b)
 world=[Vector((x,float(np.dot(features(x,z),fit))+.0006,z)) for x,z in [tuple(center)]+outline]
 local=[inv@v for v in world];faces=[(0,i+1,(i+1)%len(outline)+1) for i in range(len(outline))]
 mesh=bpy.data.meshes.new('BackSkin_Repair');mesh.from_pydata(local,[],faces);mesh.update()
 patch=bpy.data.objects.new('BackSkin_Repair',mesh);bpy.context.scene.collection.objects.link(patch)
 patch.parent=obj.parent;patch.matrix_parent_inverse=obj.matrix_parent_inverse.copy();patch.matrix_world=obj.matrix_world.copy()
 mesh.materials.append(obj.data.materials[0]);layer=mesh.uv_layers.new(name='UVMap')
 for face in mesh.polygons:
  face.use_smooth=True
  for loop in face.loop_indices:
   v=world[mesh.loops[loop].vertex_index];layer.data[loop].uv=np.array([v.x,v.z,1])@uv_fit
 for group in obj.vertex_groups:patch.vertex_groups.new(name=group.name)
 kd=KDTree(len(obj.data.vertices))
 for v in obj.data.vertices:kd.insert(obj.matrix_world@v.co,v.index)
 kd.balance()
 for i,v in enumerate(world):
  weights={}
  closest=kd.find_n(v,4);den=sum(1/max(d,.0001)**2 for co,idx,d in closest)
  for co,idx,d in closest:
   influence=(1/max(d,.0001)**2)/den
   for g in obj.data.vertices[idx].groups:weights[g.group]=weights.get(g.group,0)+g.weight*influence
  total=sum(weights.values())
  for group,value in weights.items():patch.vertex_groups[group].add([i],value/total,'REPLACE')
 mod=patch.modifiers.new('Armature','ARMATURE');mod.object=arm
 uv_refinement=refine_patch_uv(mesh)
 return patch,{'holeSamples':len(holes),'addedVertices':len(world),'addedTriangles':len(faces),'outlineXZ':outline,'uvReferenceFace':uv_reference_face,'uvRefinement':uv_refinement,'newTextures':0,'change':'Small skinned back-surface patch; clean adjacent source UV region and interpolated source weights'}

def run(source,out):
 receipts=[]
 for name in ['transmuter','spearmage']:
  dest=out/name;dest.mkdir(parents=True,exist_ok=True)
  if (dest/'character.glb').exists() or (dest/'character.blend').exists():raise RuntimeError('Preserve existing candidate '+str(dest))
  bpy.ops.wm.read_factory_settings(use_empty=True);src=source/'models'/name/'rig-glb/character.glb';bpy.ops.import_scene.gltf(filepath=str(src))
  obj=next(o for o in bpy.context.scene.objects if o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers));arm=obj.modifiers[0].object
  before=digest_mesh(obj.data);bones={b.name:[list(r) for r in b.matrix_local] for b in arm.data.bones}
  selected=[obj,arm]
  if name=='transmuter':change=replace_rear_core(obj)
  else:patch,change=close_back(obj,arm);selected.append(patch)
  assert digest_mesh(obj.data)==before,'Original body geometry/UV changed'
  assert bones=={b.name:[list(r) for r in b.matrix_local] for b in arm.data.bones},'Rest bones changed'
  for o in bpy.context.scene.objects:
   if o.type=='MESH' and o not in selected:o.hide_render=True
  bpy.ops.object.select_all(action='DESELECT')
  for o in selected:o.select_set(True)
  bpy.context.view_layer.objects.active=arm
  bpy.ops.wm.save_as_mainfile(filepath=str(dest/'character.blend'))
  bpy.ops.export_scene.gltf(filepath=str(dest/'character.glb'),export_format='GLB',use_selection=True,export_animations=True)
  receipts.append({'id':name,'source':str(src),'sourceSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'bodyGeometryAndUVPreserved':True,'restSkeletonPreserved':True,'body':before,'boneCount':len(bones),'change':change})
  print('REPAIRED',name,flush=True)
 (out/'repair-receipt.json').write_text(json.dumps({'status':'CANDIDATE_REQUIRES_REIMPORT_VISUAL_AND_MOTION_QA','runtimeApplied':False,'paidCalls':0,'models':receipts},indent=2),encoding='utf8')

if __name__=='__main__':
 args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
 p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);p.add_argument('--out',type=Path,required=True);a=p.parse_args(args);run(a.source,a.out)
