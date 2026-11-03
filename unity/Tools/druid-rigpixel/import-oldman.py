# Blender format conversion only; input GLB is read-only. No Unity/render execution.
import bpy,sys,os,json,hashlib,struct
from mathutils import Matrix,Vector,Quaternion
source,output=sys.argv[sys.argv.index('--')+1:]
os.makedirs(output,exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps=60
bpy.ops.import_scene.gltf(filepath=source)
raw=open(source,'rb').read();document=json.loads(raw[20:20+struct.unpack_from('<I',raw,12)[0]].decode('utf8'))
source_names=set(n.get('name','') for n in document['nodes'])
for obj in list(bpy.context.scene.objects):
 if obj.name not in source_names:bpy.data.objects.remove(obj,do_unlink=True)
rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'];assert len(rigs)==1
rig=rigs[0];bones=set(b.name for b in rig.data.bones)
assert len(bones)==34 and all(n in bones for n in ['LeftHand','Cloak_Back_4','Panel_Front_2','Beard_2','Chain_L_2'])
socket=bpy.data.objects.get('StaffSocket_L');assert socket and socket.parent==rig and socket.parent_bone=='LeftHand'
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];assert set(o.name for o in meshes)=={'char1','FrontPanel','Staff_L','lantern_orb'}
body=bpy.data.objects['char1'];assert body.data.shape_keys and 'Fist_L' in body.data.shape_keys.key_blocks
triangles=sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons);assert triangles==78323
emission=sum(1 for p in body.data.polygons if body.data.materials[p.material_index].name=='druid_glow');assert emission>0
# v8.2 carries 31 actions (Idle/Walk plus 29 skill stages). Preserve their original seconds.
ad=rig.animation_data;assert ad
candidates=[]
if ad.action:candidates.append((ad.action,ad.action_slot))
for track in ad.nla_tracks:
 for strip in track.strips:
  if strip.action:candidates.append((strip.action,getattr(strip,'action_slot',None)))
chosen={}
expected={'Idle':120,'Walk':64,'slash1_tele':32,'slash1_act':8,'slash2_tele':24,'slash2_act':8,'slash3_tele':24,'slash3_act':8,'slash_rec':80,'slam_tele':48,'slam_act':6,'slam_rec':70,'charge_tele':54,'charge_run':40,'charge_rec':70,'grab_tele':60,'grab_lunge':18,'grab_hold':120,'grab_throw':60,'grab_miss_rec':80,'burrow_dive':50,'burrow_erupt_warn':30,'burrow_erupt':6,'burrow_rec':70,'fissure_tele':40,'fissure_act':20,'fissure_rec':60,'heart_tele':90,'heart_beat':60,'heart_pause':30,'heart_rec':90}
for key in expected:
 matches=[p for p in candidates if p[0].name.lower()==key.lower()]
 assert matches,'Missing v8.2 authored action '+key
 chosen[key]=matches[0]
ad.action=None
for pb in rig.pose.bones:pb.matrix_basis=Matrix.Identity(4)
for track in list(ad.nla_tracks):ad.nla_tracks.remove(track)
# glTF joint-child transforms are based at the joint head; Blender bone parents use its tail.
# Recover the socket rest world matrix from the GLB rather than retaining that importer offset.
parents={child:i for i,n in enumerate(document['nodes']) for child in n.get('children',[])}
def node_world(i):
 n=document['nodes'][i]
 if 'matrix' in n:m=Matrix([n['matrix'][row::4] for row in range(4)])
 else:
  r=n.get('rotation',[0,0,0,1]);m=Matrix.LocRotScale(Vector(n.get('translation',[0,0,0])),Quaternion((r[3],r[0],r[1],r[2])),Vector(n.get('scale',[1,1,1])))
 return node_world(parents[i])@m if i in parents else m
basis=Matrix(((1,0,0,0),(0,0,-1,0),(0,1,0,0),(0,0,0,1)))
index=next(i for i,n in enumerate(document['nodes']) if n.get('name')=='StaffSocket_L')
target=basis@node_world(index);bpy.context.view_layer.update()
socket_error=(socket.matrix_world.translation-target.translation).length
socket.matrix_world=target;bpy.context.view_layer.update()
socket_after=(socket.matrix_world.translation-target.translation).length
assert socket_after<.00001,'Socket rest correction failed'
clips=[];fps=bpy.context.scene.render.fps/bpy.context.scene.render.fps_base
for key,(action,slot) in chosen.items():
 action.name=key;action.use_fake_user=True;first,last=action.frame_range
 track=ad.nla_tracks.new();track.name=key;strip=track.strips.new(key,int(first),action)
 if slot:strip.action_slot=slot
 strip.name=key
 assert abs((last-first)-expected[key])<.001,'Clip duration mismatch '+key
 clips.append({'name':key,'sourceAction':key.lower(),'firstFrame':float(first),'lastFrame':float(last),'fps':fps,'duration':float(last-first)/fps})
bpy.context.scene.frame_set(0)
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.fbx(filepath=os.path.join(output,'OldmanV82.fbx'),use_selection=True,object_types={'ARMATURE','MESH','EMPTY'},add_leaf_bones=False,bake_anim=True,bake_anim_use_all_actions=False,bake_anim_use_nla_strips=True,bake_anim_simplify_factor=0,axis_forward='-Z',axis_up='Y',path_mode='STRIP',use_custom_props=False,use_mesh_modifiers=False)
report={'sourceVersion':'v8.2','sourceSha256':hashlib.sha256(raw).hexdigest(),'sourceBytes':len(raw),'rig':'Generic selected for exact 34-bone authored actions/socket; Unity Avatar.isHuman/isValid pending Mac import','bones':sorted(bones),'boneCount':len(bones),'triangles':triangles,'materials':sorted(set(m.name for o in meshes for m in o.data.materials if m)),'chestEmissionFaces':emission,'chestEmissionScope':'Authored v8.2 druid_glow material faces preserved; screen glow <=0.5% pending Mac','objects':sorted(o.name for o in bpy.context.scene.objects),'socketParent':'LeftHand','socketRestMetres':list(target.translation),'socketImportOffsetMetres':socket_error,'socketCorrectedErrorMetres':socket_after,'hornHeight':2.71,'meshHeight':2.82,'blendShapes':['Fist_L'],'clips':clips,'missingClips':['Run','Hit','Stagger','Death','Sink'],'fallbackPose':'Idle time zero, held; no synthetic skill action','scope':'Format conversion only; v8.2 meshes/weights/parents/auxiliary bones/blendshape retained. Importer helper Icosphere excluded. No Unity/Player/render execution'}
with open(os.path.join(output,'oldman-import.json'),'w',encoding='utf8',newline='\n') as handle:
 json.dump(report,handle,ensure_ascii=False,indent=2);handle.write('\n')
print('DRUID_IMPORT '+json.dumps(report))
