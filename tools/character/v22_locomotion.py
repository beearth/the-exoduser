"""Author contact-corrected locomotion on the repaired native rigs."""
import bpy,sys,argparse,json,math,hashlib,shutil,numpy as np
from pathlib import Path

def sole(arm,meshes,frame):
 bpy.context.scene.frame_set(math.floor(frame),subframe=frame-math.floor(frame));bpy.context.view_layer.update()
 deps=bpy.context.evaluated_depsgraph_get();lowest=math.inf
 for obj in meshes:
  ev=obj.evaluated_get(deps);mesh=ev.to_mesh();a=np.empty(len(mesh.vertices)*3,dtype=np.float64);mesh.vertices.foreach_get('co',a);a=a.reshape((-1,3))
  mat=np.array(obj.matrix_world);z=a@mat[2,:3]+mat[2,3];lowest=min(lowest,float(z.min()));ev.to_mesh_clear()
 return lowest

def curves(action):
 for layer in action.layers:
  for strip in layer.strips:
   for bag in strip.channelbags:
    yield from bag.fcurves

def assign(arm,action):
 arm.animation_data.action=action
 if len(action.slots):arm.animation_data.action_slot=action.slots[0]

def run(source,root,evidence):
 evidence.mkdir(parents=True,exist_ok=True);rows=[]
 for char in ['transmuter','spearmage']:
  dest=root/char;master=dest/'character.blend';backup=evidence/(char+'.bind-before-locomotion.blend')
  if backup.exists():raise RuntimeError('Existing locomotion work must be preserved')
  shutil.copy2(master,backup);bpy.ops.wm.open_mainfile(filepath=str(master));bpy.context.scene.render.fps=30
  arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');bind=arm.animation_data.action;bind.use_fake_user=True
  meshes=[o for o in bpy.context.scene.objects if o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers)]
  for clip,expected in [('walking',32),('running',20)]:
   before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(source/'models'/char/'rig-glb'/(clip+'.glb')))
   extra=set(bpy.data.objects)-before;other=next(o for o in extra if o.type=='ARMATURE')
   diff=max(abs(arm.data.bones[b.name].matrix_local[r][c]-b.matrix_local[r][c]) for b in other.data.bones for r in range(4) for c in range(4))
   assert diff<.0001,('Rest skeleton mismatch: retarget before copying channels',char,clip,diff)
   action=other.animation_data.action.copy();action.name=char+'_'+clip+'_R1';action.use_fake_user=True;assign(arm,action)
   for obj in extra:bpy.data.objects.remove(obj,do_unlink=True)
   first,last=map(float,action.frame_range);assert abs(first-1)<.0001 and abs(last-expected)<.0001,(first,last)
   frames=np.arange(1,expected+.001,.5);original=[]
   for f in frames:
    bpy.context.scene.frame_set(int(f),subframe=float(f-int(f)));arm.location.z=0;bpy.context.view_layer.update();original.append(sole(arm,meshes,float(f)))
   offsets=[-z for z in original] if clip=='walking' else [-min(original)]*len(frames)
   for f,z in zip(frames,offsets):
    bpy.context.scene.frame_set(int(f),subframe=float(f-int(f)));arm.location.z=z;arm.keyframe_insert(data_path='location',index=2,frame=float(f),group='ContactRoot')
   for fc in curves(action):
    if fc.data_path=='location' and fc.array_index==2:
     for k in fc.keyframe_points:k.interpolation='LINEAR'
   actual=[sole(arm,meshes,float(f)) for f in np.arange(1,expected+.001,.25)]
   if clip=='walking':assert max(abs(z) for z in actual)<.0025,('Contact correction residual',max(abs(z) for z in actual))
   else:assert abs(min(actual))<.0025 and (max(actual)-min(actual))>.015,'Running flight must remain'
   bpy.context.scene.frame_start=1;bpy.context.scene.frame_end=expected
   bpy.ops.object.select_all(action='DESELECT');arm.select_set(True);bpy.context.view_layer.objects.active=arm
   bpy.ops.export_scene.fbx(filepath=str(dest/(clip+'.fbx')),use_selection=True,object_types={'ARMATURE'},add_leaf_bones=False,bake_anim=True,bake_anim_use_all_actions=False,bake_anim_use_nla_strips=False,bake_anim_step=.5,bake_anim_simplify_factor=0,axis_forward='-Z',axis_up='Y')
   row={'id':char,'clip':clip,'fps':30,'frames':[1,expected],'durationSeconds':(expected-1)/30,'restMatrixMaxDifference':diff,'beforeSoleMeters':[min(original),max(original)],'afterSoleMeters':[min(actual),max(actual)],'rootCorrectionMeters':[min(offsets),max(offsets)],'samples':len(actual),'runningFlightPreserved':clip=='running','sourceAction':action.name,'fbxContains':'armature animation only; native mesh/UV untouched'}
   rows.append(row);print('CONTACT_AUTHORED',json.dumps(row),flush=True)
  assign(arm,bind);arm.location.z=0;bpy.context.scene.frame_set(1);bpy.context.preferences.filepaths.save_version=0
  bpy.data.orphans_purge(do_recursive=True)
  bpy.ops.wm.save_as_mainfile(filepath=str(master))
 (root/'locomotion-receipt.json').write_text(json.dumps({'status':'NATIVE_CONTACT_VERIFIED_FBX_UNITY_IMPORT_PENDING','runtimeApplied':False,'clips':rows},indent=2),encoding='utf8')

if __name__=='__main__':
 args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
 p=argparse.ArgumentParser();p.add_argument('--source',type=Path,required=True);p.add_argument('--root',type=Path,required=True);p.add_argument('--evidence',type=Path,required=True);a=p.parse_args(args);run(a.source,a.root,a.evidence)
