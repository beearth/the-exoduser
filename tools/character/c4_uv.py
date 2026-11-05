# Source: Blender manual Smart UV Project. Measures only; does not change the saved file.
import bpy,bmesh,json,sys,math
import numpy as np
OUT=sys.argv[sys.argv.index('--')+1];res={}
for n in ('A_helm','A_chest','A_pauldron.L','A_glove.L','A_greave.L','B_helm','B_coat','B_shoulder.L','B_bracer.L','B_boot.L'):
    o=bpy.data.objects[n];o.hide_set(False);o.hide_viewport=False;bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=math.radians(66),island_margin=.005);bpy.ops.object.mode_set(mode='OBJECT')
    me=o.data;me.calc_loop_triangles();uv=me.uv_layers.active.data;ua=0;dens=[];w=[]
    for t in me.loop_triangles:
        a,b,c=[uv[i].uv for i in t.loops];A=abs((b-a).cross(c-a))/2;ua+=A
        if t.area>1e-8:dens.append(math.sqrt(A/t.area));w.append(t.area)
    d=np.array(dens);bm=bmesh.new();bm.from_mesh(me);ul=bm.loops.layers.uv.active;bm.faces.ensure_lookup_table();isl=0;seen=set()
    for f in bm.faces:
        if f.index in seen:continue
        isl+=1;st=[f];seen.add(f.index)
        while st:
            x=st.pop()
            for l in x.loops:
                for e in (l.edge,):
                    for g in e.link_faces:
                        if g.index in seen:continue
                        ok=False
                        for m in g.loops:
                            if m.edge==e and ((m[ul].uv-l.link_loop_next[ul].uv).length<1e-5 or (m[ul].uv-l[ul].uv).length<1e-5):ok=True
                        if ok:seen.add(g.index);st.append(g)
    bm.free();res[n]={'tris':len(me.loop_triangles),'islands':isl,'uv_used':round(ua,3),'density_p5_p95_ratio':round(float(np.percentile(d,95)/max(np.percentile(d,5),1e-6)),2)};print('UV',n,res[n],flush=True)
json.dump(res,open(OUT,'w'),indent=1);print('UV_DONE')
