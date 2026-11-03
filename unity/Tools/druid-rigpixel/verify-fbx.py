# Read the converted FBX in Blender; numerical asset gate, never a Unity/visual PASS.
import bpy,sys,os,json,math
source,output=sys.argv[sys.argv.index('--')+1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.scene.render.fps=60
bpy.ops.import_scene.fbx(filepath=source)
rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'];assert len(rigs)==1
rig=rigs[0];meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
assert set(o.name for o in meshes)=={'char1','FrontPanel','Staff_L','lantern_orb'},'Non-source helper mesh exported'
socket=bpy.data.objects.get('StaffSocket_L');assert socket and socket.parent==rig and socket.parent_bone=='LeftHand','Staff socket lost'
clips=[]
for action in list(bpy.data.actions):
 if not action.name.startswith(rig.name+'|'):continue
 key='Walk' if action.name.endswith('|Walk') else 'Idle' if action.name.endswith('|Idle') else None
 if not key:continue
 rig.animation_data_create()
 for track in rig.animation_data.nla_tracks:track.mute=True
 rig.animation_data.action=action
 if action.slots:rig.animation_data.action_slot=action.slots[0]
 first,last=action.frame_range;positions=[]
 for fraction in [0,.25,.5,.75]:
  bpy.context.scene.frame_set(int(first+(last-first)*fraction));bpy.context.view_layer.update()
  positions.append(tuple(rig.matrix_world@rig.pose.bones['LeftFoot' if key=='Walk' else 'Head'].head))
 movement=max((sum((p[j]-positions[0][j])**2 for j in range(3)))**.5 for p in positions)
 assert movement>(.005 if key=='Walk' else .0001),'Locomotion is static/unbound: '+action.name
 clips.append({'name':action.name,'role':key,'probeBone':'LeftFoot' if key=='Walk' else 'Head','motionRangeMetres':movement,'first':float(first),'last':float(last)})
assert set(c['role'] for c in clips)=={'Walk','Idle'},'Both v7 authored takes required'
body=bpy.data.objects['char1'];assert body.data.shape_keys and 'Fist_L' in body.data.shape_keys.key_blocks,'v7 Fist_L lost'
assert all(name in rig.data.bones for name in ['Cloak_Back_4','Panel_Front_2','Beard_2','Chain_L_2']),'v7 auxiliary chain lost'
report={'blendShape':'Fist_L','assetGate':'Blender FBX numerical only; Unity/Mac gates pending','meshObjects':[o.name for o in meshes],'boneCount':len(rig.data.bones),'triangles':sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons),'socket':'LeftHand/StaffSocket_L','clips':clips}
assert report['boneCount']==34 and report['triangles']==78323
with open(output,'w',encoding='utf8') as handle:json.dump(report,handle,ensure_ascii=False,indent=2)
print('DRUID_FBX_VERIFY '+json.dumps(report))
