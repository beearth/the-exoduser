# Numerical FBX contract only. No Unity, Player or rendering.
import bpy,sys,os,json,math
from mathutils import Matrix,Vector
source,output=sys.argv[sys.argv.index('--')+1:]
meta=json.load(open(os.path.join(os.path.dirname(source),'oldman-import.json'),encoding='utf8'))
bpy.ops.wm.read_factory_settings(use_empty=True);bpy.context.scene.render.fps=60
bpy.ops.import_scene.fbx(filepath=source)
rigs=[o for o in bpy.context.scene.objects if o.type=='ARMATURE'];assert len(rigs)==1
rig=rigs[0];meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
errors=[]
if set(o.name for o in meshes)!={'char1','FrontPanel','Staff_L','lantern_orb'}:errors.append('Non-source helper mesh')
socket=bpy.data.objects.get('StaffSocket_L')
if not socket or socket.parent!=rig or socket.parent_bone!='LeftHand':errors.append('Staff socket lost')
ad=rig.animation_data_create()
for track in ad.nla_tracks:track.mute=True
ad.action=None
for bone in rig.pose.bones:bone.matrix_basis=Matrix.Identity(4)
bpy.context.view_layer.update()
socket_error=(socket.matrix_world.translation-Vector(meta['socketRestMetres'])).length
if socket_error>.0001:errors.append('Socket GLB rest mismatch '+str(socket_error))
expected={c['name']:c for c in meta['clips']};clips=[]
root_clips={'charge_run','grab_lunge','burrow_dive','burrow_erupt'}
for action in list(bpy.data.actions):
 if not action.name.startswith(rig.name+'|'):continue
 key=action.name[len(rig.name)+1:]
 if key not in expected:continue
 ad.action=action
 if action.slots:ad.action_slot=action.slots[0]
 first,last=action.frame_range;required=expected[key]['lastFrame']-expected[key]['firstFrame']
 if abs((last-first)-required)>.001:errors.append('Length '+key)
 frames=[]
 for i in range(int(round(required))+1):
  bpy.context.scene.frame_set(int(first)+i);bpy.context.view_layer.update()
  frames.append([rig.matrix_world@rig.pose.bones[b].head for b in ['LeftFoot','RightFoot','Head']])
 # Slip is horizontal translation; an authored foot lift is not sliding.
 slip=max(math.hypot(sample[b].x-frames[0][b].x,sample[b].y-frames[0][b].y) for sample in frames for b in [0,1])*100
 lift=max(abs(sample[b].z-frames[0][b].z) for sample in frames for b in [0,1])*100
 if key not in root_clips and key!='Walk' and slip>.02:errors.append('Static feet '+key+' '+str(slip)+'cm')
 stance=0
 if key=='charge_run':
  floor=min(sample[b].z for sample in frames for b in [0,1])
  for a,b in zip(frames,frames[1:]):
   for foot in [0,1]:
    if a[foot].z<=floor+.00001 and b[foot].z<=floor+.00001:stance=max(stance,(b[foot]-a[foot]).length*100)
  if stance>.02:errors.append('Charge contact slip '+str(stance))
 probe=0 if key=='Walk' else 2
 motion=max((sample[probe]-frames[0][probe]).length for sample in frames)
 if key in ['Idle','Walk'] and motion<.0001:errors.append('Static locomotion '+key)
 clips.append({'name':key,'frames':float(last-first),'seconds':float(last-first)/60,'footLiftCm':lift,'staticFootSlipHorizontalCm':None if key in root_clips or key=='Walk' else slip,'rootClip':key in root_clips,'chargeStanceStepMaxCm':stance if key=='charge_run' else None,'motionProbeMetres':motion})
if set(c['name'] for c in clips)!=set(expected):errors.append('31 expected clips required')
body=bpy.data.objects['char1'];fist=body.data.shape_keys and 'Fist_L' in body.data.shape_keys.key_blocks
if not fist:errors.append('Fist_L lost')
if not all(n in rig.data.bones for n in ['Cloak_Back_4','Panel_Front_2','Beard_2','Chain_L_2']):errors.append('Auxiliary chain lost')
triangles=sum(len(p.vertices)-2 for o in meshes for p in o.data.polygons)
if len(rig.data.bones)!=34 or triangles!=78323:errors.append('Topology changed')
report={'passed':not errors,'scope':'Blender FBX numerical only; Core movement/rotation/Unity runtime foot plant pending Mac','sourceVersion':meta['sourceVersion'],'clipCount':len(clips),'boneCount':len(rig.data.bones),'triangles':triangles,'socketRestErrorMetres':socket_error,'blendShape':'Fist_L' if fist else None,'staticFootToleranceCm':.02,'clips':clips,'errors':errors}
with open(output,'w',encoding='utf8',newline='\n') as handle:json.dump(report,handle,ensure_ascii=False,indent=2)
print('DRUID_FBX_VERIFY '+json.dumps({'passed':report['passed'],'clips':len(clips),'errors':errors,'maxStaticCm':max(c['staticFootSlipHorizontalCm'] or 0 for c in clips),'socketErrorMetres':socket_error}))
assert not errors,'; '.join(errors)
