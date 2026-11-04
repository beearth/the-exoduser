# Blender format conversion only; input GLB is read-only. No Unity/render execution.
# v9.1 (husk + old man + phase states + intro/death). Usage: blender -b --factory-startup --python import-oldman.py -- <glb> <outDir>
import bpy,sys,os,json,hashlib,struct,math
from mathutils import Matrix,Vector,Quaternion
source,output=sys.argv[sys.argv.index('--')+1:]
os.makedirs(output,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps=60
bpy.ops.import_scene.gltf(filepath=source)
raw=open(source,'rb').read();document=json.loads(raw[20:20+struct.unpack_from('<I',raw,12)[0]].decode('utf8'))
nodes=document['nodes'];source_names=set(n.get('name','') for n in nodes)
for obj in list(bpy.context.scene.objects):
 if obj.name not in source_names:bpy.data.objects.remove(obj,do_unlink=True)
rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'];assert len(rigs)==1
rig=rigs[0];bones=set(b.name for b in rig.data.bones)
joints=len(document['skins'][0]['joints']);assert len(bones)==joints,'Bone count differs from GLB skin'
husk_bones=sorted(b for b in bones if b.startswith('HK_'));hp_bones=sorted(b for b in bones if b.startswith('HP_'));om_bones=sorted(b for b in bones if b.startswith('OM_'))
old_bones=sorted(b for b in bones if not b.startswith(('HK_','HP_','OM_')))
assert len(old_bones)==34 and all(n in bones for n in ['LeftHand','Cloak_Back_4','Panel_Front_2','Beard_2','Chain_L_2']),'Old man 34 bones changed'
assert len(hp_bones)==6 and om_bones==['OM_Lift','OM_Staff'] and len(husk_bones)>0
assert rig.data.bones['Hips'].parent and rig.data.bones['Hips'].parent.name=='OM_Lift','Hips must hang under OM_Lift'
assert rig.data.bones['OM_Staff'].parent and rig.data.bones['OM_Staff'].parent.name=='LeftHand'
socket=bpy.data.objects.get('StaffSocket_L');assert socket and socket.parent==rig and socket.parent_bone=='OM_Staff','StaffSocket_L must hang under OM_Staff'
mesh_nodes=[n for n in nodes if 'mesh' in n];source_meshes=set(n['name'] for n in mesh_nodes)
old_meshes={'char1','FrontPanel','Staff_L','lantern_orb'};assert old_meshes<=source_meshes
husk_meshes=sorted(source_meshes-old_meshes);assert len(husk_meshes)>=9 and all(n.startswith('Husk_') for n in husk_meshes),'Unexpected mesh nodes '+str(husk_meshes)
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];assert set(o.name for o in meshes)==source_meshes,'Blender meshes differ from GLB nodes'
def glb_tris(name):
 node=next(n for n in mesh_nodes if n['name']==name)
 return sum(document['accessors'][p['indices']]['count']//3 for p in document['meshes'][node['mesh']]['primitives'])
def tris(o):return sum(len(p.vertices)-2 for p in o.data.polygons)
for o in meshes:assert tris(o)==glb_tris(o.name),'Triangle mismatch '+o.name
old_tris=sum(tris(o) for o in meshes if o.name in old_meshes);husk_tris=sum(tris(o) for o in meshes if o.name in husk_meshes)
assert old_tris==78323,'Old man triangles changed '+str(old_tris)
body=bpy.data.objects['char1'];assert body.data.shape_keys and 'Fist_L' in body.data.shape_keys.key_blocks
emission=sum(1 for p in body.data.polygons if body.data.materials[p.material_index].name=='druid_glow');assert emission>0
# Actions: 31 authored (Idle/Walk + 29 skill stages) + 7 v9 (3 one-frame states, 2 collapses, intro, death). Keep their authored seconds.
ad=rig.animation_data;assert ad
candidates=[]
if ad.action:candidates.append((ad.action,ad.action_slot))
for track in ad.nla_tracks:
 for strip in track.strips:
  if strip.action:candidates.append((strip.action,getattr(strip,'action_slot',None)))
expected={'Idle':120,'Walk':64,'slash1_tele':32,'slash1_act':8,'slash2_tele':24,'slash2_act':8,'slash3_tele':24,'slash3_act':8,'slash_rec':80,'slam_tele':48,'slam_act':6,'slam_rec':70,'charge_tele':54,'charge_run':40,'charge_rec':70,'grab_tele':60,'grab_lunge':18,'grab_hold':120,'grab_throw':60,'grab_miss_rec':80,'burrow_dive':50,'burrow_erupt_warn':30,'burrow_erupt':6,'burrow_rec':70,'fissure_tele':40,'fissure_act':20,'fissure_rec':60,'heart_tele':90,'heart_beat':60,'heart_pause':30,'heart_rec':90,
 'state_P1':1,'state_P2':1,'state_P3':1,'phase12_collapse':120,'phase23_collapse':120,'intro_reveal':165,'death_sink':150}
assert len(expected)==38
chosen={}
for key in expected:
 matches=[p for p in candidates if p[0].name.lower()==key.lower()]
 assert matches,'Missing v9.1 authored action '+key
 chosen[key]=matches[0]
# ---- sockets / rigid husk parts: glTF joint-child transforms are based at the joint head; Blender bone parents use its tail.
# Recover every bone-parented object's rest world matrix from the GLB instead of retaining that importer offset.
parents={child:i for i,n in enumerate(nodes) for child in n.get('children',[])}
def node_world(i):
 n=nodes[i]
 if 'matrix' in n:m=Matrix([n['matrix'][row::4] for row in range(4)])
 else:
  r=n.get('rotation',[0,0,0,1]);m=Matrix.LocRotScale(Vector(n.get('translation',[0,0,0])),Quaternion((r[3],r[0],r[1],r[2])),Vector(n.get('scale',[1,1,1])))
 return node_world(parents[i])@m if i in parents else m
basis=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
for pb in rig.pose.bones:pb.matrix_basis=Matrix.Identity(4)
ad.action=None
bpy.context.view_layer.update()
index_by_name={n.get('name',''):i for i,n in enumerate(nodes)}
bone_children=[o for o in bpy.context.scene.objects if o.parent==rig and o.parent_type=='BONE']
assert any(o.name=='StaffSocket_L' for o in bone_children)
husk_sockets=[o for o in bone_children if o.name.startswith('HuskSocket_')];assert len(husk_sockets)>=9,'Husk sockets lost: '+str(len(husk_sockets))
socket_error=0.0
for o in bone_children:
 target=basis@node_world(index_by_name[o.name]);socket_error=max(socket_error,(o.matrix_world.translation-target.translation).length)
 o.matrix_world=target
bpy.context.view_layer.update()
socket_after=0.0
for o in bone_children:
 target=basis@node_world(index_by_name[o.name]);socket_after=max(socket_after,(o.matrix_world.translation-target.translation).length)
assert socket_after<.0001,'Socket rest correction failed '+str(socket_after)
# Rigid husk meshes hang on those sockets (object parent) and are authored with their vertices already in rest-world space (node world = identity).
# The importer's child local is not consistent with the corrected socket, so restore their rest world from the GLB as well (their parent socket is already fixed).
rigid_error=0.0;rigid_after=0.0;rigid_count=0
for name in husk_meshes:
 o=bpy.data.objects[name]
 if o.parent is not None and o.parent!=rig:
  target=basis@node_world(index_by_name[name]);rigid_error=max(rigid_error,(o.matrix_world.translation-target.translation).length)
  o.matrix_world=target;rigid_count+=1
bpy.context.view_layer.update()
for name in husk_meshes:
 o=bpy.data.objects[name]
 if o.parent is not None and o.parent!=rig:
  target=basis@node_world(index_by_name[name]);rigid_after=max(rigid_after,(o.matrix_world.translation-target.translation).length)
assert rigid_count>=6 and rigid_after<.0001,'Rigid husk part rest restore failed '+str(rigid_after)
target=basis@node_world(index_by_name['StaffSocket_L'])
rest_socket=list(target.translation)
# ---- Footprint measurement (rest pose of state_P1 for the husk legs, state_P3 for the old man's feet).
# centre = midpoint of the two ankle bone heads, radius = farthest horizontal distance of the foot-weighted vertices. World metres, scene scale 1.
def pose_with(key):
 action,slot=chosen[key];ad.action=action
 if slot:ad.action_slot=slot
 bpy.context.scene.frame_set(int(action.frame_range[0]));bpy.context.view_layer.update()
def foot_circle(mesh_names,left,right,groups):
 depsgraph=bpy.context.evaluated_depsgraph_get()
 cl=rig.matrix_world@rig.pose.bones[left].head;cr=rig.matrix_world@rig.pose.bones[right].head
 centre=(cl+cr)*.5;radius=0.0;count=0;zmin=1e9;span=[1e9,1e9,-1e9,-1e9]
 for name in mesh_names:
  obj=bpy.data.objects[name];ev=obj.evaluated_get(depsgraph);me=ev.to_mesh()
  names={g.index:g.name for g in obj.vertex_groups}
  for v in me.vertices:
   if not v.groups:continue
   top=max(v.groups,key=lambda g:g.weight)
   if names.get(top.group) not in groups:continue
   w=ev.matrix_world@v.co;count+=1;zmin=min(zmin,w.z)
   radius=max(radius,math.hypot(w.x-centre.x,w.y-centre.y))
   span=[min(span[0],w.x),min(span[1],w.y),max(span[2],w.x),max(span[3],w.y)]
  ev.to_mesh_clear()
 assert count>20,'No foot vertices for '+left
 return {'radiusMetres':radius,'centreMetres':[centre.x,centre.y],'ankleSpanMetres':(cl-cr).length,'footVertices':count,'soleMinZMetres':zmin,'boundsMetres':span}
pose_with('state_P3')
oldman_foot=foot_circle(['char1'],'LeftFoot','RightFoot',{'LeftFoot','LeftToeBase','RightFoot','RightToeBase'})
oldman_height=0.0
for name in ['char1']:
 depsgraph=bpy.context.evaluated_depsgraph_get();ev=bpy.data.objects[name].evaluated_get(depsgraph);me=ev.to_mesh()
 zs=[(ev.matrix_world@v.co).z for v in me.vertices];oldman_height=max(zs)-min(zs);ev.to_mesh_clear()
pose_with('state_P1')
husk_leg_meshes=[n for n in husk_meshes if n in ('Husk_Leg_L','Husk_Leg_R')];assert len(husk_leg_meshes)==2
husk_foot=foot_circle(husk_leg_meshes,'HK_LeftFoot','HK_RightFoot',{'HK_LeftFoot','HK_LeftToeBase','HK_RightFoot','HK_RightToeBase'})
husk_top=-1e9
depsgraph=bpy.context.evaluated_depsgraph_get()
for name in husk_meshes:
 ev=bpy.data.objects[name].evaluated_get(depsgraph);me=ev.to_mesh()
 for v in me.vertices:husk_top=max(husk_top,(ev.matrix_world@v.co).z)
 ev.to_mesh_clear()
# Back to the pristine rest pose and an NLA strip per action.
ad.action=None
for pb in rig.pose.bones:pb.matrix_basis=Matrix.Identity(4)
for track in list(ad.nla_tracks):ad.nla_tracks.remove(track)
bpy.context.view_layer.update()
clips=[];fps=bpy.context.scene.render.fps/bpy.context.scene.render.fps_base
for key,(action,slot) in chosen.items():
 action.name=key;action.use_fake_user=True;first,last=action.frame_range
 track=ad.nla_tracks.new();track.name=key;strip=track.strips.new(key,int(first),action)
 if slot:strip.action_slot=slot
 strip.name=key
 assert abs((last-first)-expected[key])<.001,'Clip duration mismatch '+key+' '+str(last-first)
 clips.append({'name':key,'sourceAction':key.lower(),'firstFrame':float(first),'lastFrame':float(last),'fps':fps,'duration':float(last-first)/fps})
bpy.context.scene.frame_set(0)
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.fbx(filepath=os.path.join(output,'OldmanV91.fbx'),use_selection=True,object_types={'ARMATURE','MESH','EMPTY'},add_leaf_bones=False,bake_anim=True,bake_anim_use_all_actions=False,bake_anim_use_nla_strips=True,bake_anim_simplify_factor=0,axis_forward='-Z',axis_up='Y',path_mode='STRIP',use_custom_props=False,use_mesh_modifiers=False)
report={'sourceVersion':'v9.1','sourceSha256':hashlib.sha256(raw).hexdigest(),'sourceBytes':len(raw),'rig':'Generic selected for exact 65-bone authored actions/sockets; Unity Avatar.isHuman/isValid pending Mac import',
 'bones':sorted(bones),'boneCount':len(bones),'oldManBones':len(old_bones),'huskBones':len(husk_bones),'huskPoseBones':len(hp_bones),'oldManHelperBones':om_bones,
 'triangles':old_tris+husk_tris,'oldManTriangles':old_tris,'huskTriangles':husk_tris,
 'materials':sorted(set(m.name for o in meshes for m in o.data.materials if m)),'chestEmissionFaces':emission,'chestEmissionScope':'Authored druid_glow material faces of char1 preserved; screen glow <=0.5% pending Mac',
 'objects':sorted(o.name for o in bpy.context.scene.objects),'huskMeshes':husk_meshes,'huskSockets':sorted(o.name for o in husk_sockets),
 'socketParent':'OM_Staff','socketRestMetres':rest_socket,'socketImportOffsetMetres':socket_error,'socketCorrectedErrorMetres':socket_after,'rigidHuskImportOffsetMetres':rigid_error,'rigidHuskCorrectedErrorMetres':rigid_after,'rigidHuskParts':rigid_count,
 'hornHeight':2.71,'meshHeight':2.82,'blendShapes':['Fist_L'],
 'footprint':{'scope':'rest pose of state_P3 (old man) / state_P1 (husk legs); centre = midpoint of the two ankle bone heads, radius = farthest horizontal distance of foot-weighted vertices; Blender world metres at scale 1','oldMan':oldman_foot,'husk':husk_foot,'oldManMeshHeightMetres':oldman_height,'huskTopMetres':husk_top},
 'oldManFootRadiusMetres':oldman_foot['radiusMetres'],'huskFootRadiusMetres':husk_foot['radiusMetres'],'huskTopMetres':husk_top,
 'clips':clips,'missingClips':['Run','Hit','Stagger','Death','Sink'],'fallbackPose':'Idle time zero, held; no synthetic skill action',
 'scope':'Format conversion only; v9.1 meshes/weights/parents/auxiliary bones/blendshape retained. Importer helper Icosphere excluded. No Unity/Player/render execution'}
with open(os.path.join(output,'oldman-import.json'),'w',encoding='utf8',newline='\n') as handle:
 json.dump(report,handle,ensure_ascii=False,indent=2);handle.write('\n')
print('DRUID_IMPORT '+json.dumps({k:report[k] for k in ('sourceVersion','boneCount','oldManBones','huskBones','huskPoseBones','triangles','oldManTriangles','huskTriangles','oldManFootRadiusMetres','huskFootRadiusMetres','huskTopMetres','socketImportOffsetMetres','rigidHuskImportOffsetMetres','rigidHuskCorrectedErrorMetres','rigidHuskParts')}))
