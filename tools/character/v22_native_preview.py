"""Repeatable studio preview; this is not an actual Unity camera."""
import bpy,sys,argparse,math
from pathlib import Path
from mathutils import Vector

def point(obj,target):obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
def setup():
 s=bpy.context.scene;s.render.engine='CYCLES';s.cycles.samples=8;s.cycles.use_denoising=True;s.cycles.device='CPU';s.render.threads_mode='FIXED';s.render.threads=4
 s.render.resolution_percentage=100;s.render.image_settings.file_format='PNG';s.world=bpy.data.worlds.new('QA_World');s.world.color=(.14,.14,.14);s.view_settings.view_transform='AgX'
 camera=bpy.data.objects.new('QA_Camera',bpy.data.cameras.new('QA_Camera'));s.collection.objects.link(camera);s.camera=camera;camera.data.type='ORTHO'
 for name,loc,power,size in [('Key',(-3,-4,5),450,4),('Fill',(3,-2,3),220,3),('Rim',(1,3,4),400,3)]:
  data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;o=bpy.data.objects.new(name,data);s.collection.objects.link(o);o.location=loc;point(o,(0,0,.9))
 bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.005));o=bpy.context.object;o.name='QA_Ground';mat=bpy.data.materials.new('QA_Ground');mat.diffuse_color=(.055,.06,.07,1);o.data.materials.append(mat)
def render(out,view):
 s=bpy.context.scene;camera=s.camera;angle=math.radians(180 if view=='rear' else 25);e=math.radians(8);center=(0,0,.84)
 camera.location=Vector(center)+Vector((math.sin(angle)*math.cos(e)*4,-math.cos(angle)*math.cos(e)*4,math.sin(e)*4));point(camera,center);camera.data.ortho_scale=1.95
 s.render.resolution_x=768;s.render.resolution_y=1024;s.render.filepath=str(out);bpy.ops.render.render(write_still=True)
if __name__=='__main__':
 args=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
 p=argparse.ArgumentParser();p.add_argument('--root',type=Path,required=True);p.add_argument('--character',choices=['transmuter','spearmage'],required=True);p.add_argument('--out',type=Path,required=True);p.add_argument('--view',choices=['rear','walk'],default='rear');a=p.parse_args(args)
 bpy.ops.wm.open_mainfile(filepath=str(a.root/a.character/'character.blend'))
 if a.view=='walk':
  arm=next(o for o in bpy.context.scene.objects if o.type=='ARMATURE');action=bpy.data.actions[a.character+'_walking_R1'];arm.animation_data.action=action
  if len(action.slots):arm.animation_data.action_slot=action.slots[0]
  first,last=map(float,action.frame_range);f=first+(last-first)*.25;bpy.context.scene.frame_set(math.floor(f),subframe=f-math.floor(f))
 setup();render(a.out,a.view)
