import bpy,sys,numpy as np,os
a=sys.argv[sys.argv.index('--')+1:];txt="구조 검증용, 최종 조형 아님"
sc=bpy.context.scene
for o in list(bpy.data.objects):bpy.data.objects.remove(o)
f=bpy.data.fonts.load('/System/Library/Fonts/AppleSDGothicNeo.ttc');c=bpy.data.curves.new('t','FONT');c.body=txt;c.font=f;c.size=1;o=bpy.data.objects.new('t',c);sc.collection.objects.link(o)
m=bpy.data.materials.new('w');m.use_nodes=True;n=m.node_tree;n.nodes.clear();e=n.nodes.new('ShaderNodeEmission');e.inputs[0].default_value=(1,1,1,1);e.inputs[1].default_value=1;u=n.nodes.new('ShaderNodeOutputMaterial');n.links.new(e.outputs[0],u.inputs[0]);c.materials.append(m)
ca=bpy.data.cameras.new('c');ca.type='ORTHO';ca.ortho_scale=14;co=bpy.data.objects.new('c',ca);sc.collection.objects.link(co);sc.camera=co;co.location=(6.5,.45,10)
w=bpy.data.worlds.new('w');w.use_nodes=True;w.node_tree.nodes['Background'].inputs[1].default_value=0;sc.world=w
sc.render.engine='CYCLES';sc.cycles.device='CPU';sc.cycles.samples=16;sc.render.resolution_x=560;sc.render.resolution_y=48;sc.render.film_transparent=False;sc.view_settings.view_transform='Standard';sc.render.filepath=os.environ['TMPDIR']+'/lbl.png';bpy.ops.render.render(write_still=True)
L=bpy.data.images.load(sc.render.filepath);L.colorspace_settings.name='Non-Color';lw,lh=L.size;l=np.array(L.pixels[:],dtype=np.float32).reshape(lh,lw,L.channels)[...,:3]
for i in range(0,len(a),2):
    im=bpy.data.images.load(a[i]);im.colorspace_settings.name='Non-Color';w_,h=im.size;p=np.array(im.pixels[:],dtype=np.float32).reshape(h,w_,im.channels);rw=min(lw,w_);y0=h-lh;p[y0:h,:rw,:3]=np.maximum(p[y0:h,:rw,:3]*.25,l[:lh,:rw]);p4=np.dstack([p[...,:3],np.ones((h,w_))]);g=bpy.data.images.new('o',w_,h,alpha=False);g.colorspace_settings.name='Non-Color';g.pixels=p4.ravel();g.filepath_raw=a[i+1];g.file_format='PNG';g.save();bpy.data.images.remove(g);bpy.data.images.remove(im)
print('LABEL_OK')
