# Blender format conversion only; input GLB is read-only. No Unity/render execution.
import bpy,sys,os,json,hashlib,struct
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
# v7 carries the authored 34-bone idle/walk actions. Preserve them, never substitute old 24-bone Run.
ad=rig.animation_data;assert ad
candidates=[]
if ad.action:candidates.append((ad.action,ad.action_slot))
for track in ad.nla_tracks:
 for strip in track.strips:
  if strip.action:candidates.append((strip.action,getattr(strip,'action_slot',None)))
chosen={}
for key in ['Idle','Walk']:
 matches=[p for p in candidates if p[0].name.lower()==key.lower()]
 assert matches,'Missing v7 authored action '+key
 chosen[key]=matches[0]
ad.action=None
for track in list(ad.nla_tracks):ad.nla_tracks.remove(track)
clips=[];fps=bpy.context.scene.render.fps/bpy.context.scene.render.fps_base
for key,(action,slot) in chosen.items():
 action.name=key;action.use_fake_user=True;first,last=action.frame_range
 track=ad.nla_tracks.new();track.name=key;strip=track.strips.new(key,int(first),action)
 if slot:strip.action_slot=slot
 strip.name=key
 clips.append({'name':key,'sourceAction':key.lower(),'firstFrame':float(first),'lastFrame':float(last),'fps':fps,'duration':float(last-first)/fps})
bpy.context.scene.frame_set(0)
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.fbx(filepath=os.path.join(output,'OldmanV7.fbx'),use_selection=True,object_types={'ARMATURE','MESH','EMPTY'},add_leaf_bones=False,bake_anim=True,bake_anim_use_all_actions=False,bake_anim_use_nla_strips=True,bake_anim_simplify_factor=0,axis_forward='-Z',axis_up='Y',path_mode='STRIP',use_custom_props=False,use_mesh_modifiers=False)
report={'sourceVersion':'v7','sourceSha256':hashlib.sha256(raw).hexdigest(),'sourceBytes':len(raw),'rig':'Generic selected for exact 34-bone authored actions/socket; Unity Avatar.isHuman/isValid pending Mac import','bones':sorted(bones),'boneCount':len(bones),'triangles':triangles,'materials':sorted(set(m.name for o in meshes for m in o.data.materials if m)),'chestEmissionFaces':emission,'chestEmissionScope':'Authored v7 druid_glow material faces preserved; screen glow <=0.5% pending Mac','objects':sorted(o.name for o in bpy.context.scene.objects),'socketParent':'LeftHand','hornHeight':2.71,'meshHeight':2.82,'blendShapes':['Fist_L'],'clips':clips,'missingClips':['Run','slashCombo','slam','charge','grab','burrowStrike','groundFissure','heartbeat','Hit','Stagger','Death','Sink'],'fallbackPose':'Idle time zero, held; no synthetic skill action','scope':'Format conversion only; v7 meshes/weights/parents/auxiliary bones/blendshape retained. Importer helper Icosphere excluded. No Unity/Player/render execution'}
with open(os.path.join(output,'oldman-import.json'),'w',encoding='utf8',newline='\n') as handle:
 json.dump(report,handle,ensure_ascii=False,indent=2);handle.write('\n')
print('DRUID_IMPORT '+json.dumps(report))
