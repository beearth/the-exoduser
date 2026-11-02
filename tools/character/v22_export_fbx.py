"""Export the repaired bind meshes and parse every FBX in Blender."""
import bpy,sys,argparse,json,numpy as np
from pathlib import Path

def run(root,evidence):
 rows=[]
 for char in ['transmuter','spearmage']:
  dest=root/char;bpy.ops.wm.open_mainfile(filepath=str(dest/'character.blend'))
  arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');arm.data.pose_position='REST';arm.location.z=0
  bpy.ops.object.select_all(action='DESELECT')
  for o in bpy.context.scene.objects:
   if o.type=='ARMATURE' or(o.type=='MESH' and any(m.type=='ARMATURE' for m in o.modifiers)):o.select_set(True)
  bpy.context.view_layer.objects.active=arm
  bpy.ops.export_scene.fbx(filepath=str(dest/'character.fbx'),use_selection=True,object_types={'ARMATURE','MESH'},add_leaf_bones=False,bake_anim=False,path_mode='COPY',embed_textures=True,axis_forward='-Z',axis_up='Y')
  for clip in ['character','walking','running']:
   bpy.ops.wm.read_factory_settings(use_empty=True);bpy.ops.import_scene.fbx(filepath=str(dest/(clip+'.fbx')))
   rig=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];actions=list(bpy.data.actions)
   row={'id':char,'file':clip+'.fbx','bones':len(rig.data.bones),'meshCount':len(meshes),'actions':[{'name':a.name,'durationSeconds':float(a.frame_range[1]-a.frame_range[0])/bpy.context.scene.render.fps} for a in actions]}
   assert len(rig.data.bones)==24,(char,clip,'unexpected skeleton')
   if clip=='character':
    assert meshes,'FBX model has no mesh'
    points=[]
    for o in meshes:
     a=np.empty(len(o.data.vertices)*3,dtype=np.float64);o.data.vertices.foreach_get('co',a);a=a.reshape((-1,3));matrix=np.array(o.matrix_world);points.append(a@matrix[:3,:3].T+matrix[:3,3])
    points=np.concatenate(points);row['heightMeters']=float(np.ptp(points[:,2]));assert abs(row['heightMeters']-1.65)<.002
    images={n.image.name for m in bpy.data.materials if m.use_nodes for n in m.node_tree.nodes if n.type=='TEX_IMAGE' and n.image}
    row['materialImageCount']=len(images)
    # FBX embedded images load lazily; force decoding before testing availability.
    file_images=[im for im in bpy.data.images if im.source=='FILE']
    for im in file_images:_=im.pixels[:4]
    row['missingImages']=[im.name for im in file_images if not im.has_data or min(im.size)==0]
    assert images and not row['missingImages'],'Embedded FBX textures did not round trip'
   else:
    expected=31/30 if clip=='walking' else 19/30
    assert len(actions)==1 and abs(row['actions'][0]['durationSeconds']-expected)<.0001,(char,clip,row)
   rows.append(row);print('FBX_ROUNDTRIP',json.dumps(row),flush=True)
 (evidence/'fbx-roundtrip.json').write_text(json.dumps({'scope':'Blender parse, height, images, skeleton and clip duration. Unity Humanoid/URP/Animator still pending.','rows':rows,'passed':True},indent=2),encoding='utf8')

if __name__=='__main__':
 args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
 p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--evidence',type=Path,required=True);a=p.parse_args(args);run(a.root,a.evidence)
