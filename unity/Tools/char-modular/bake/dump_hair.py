import bpy, numpy as np
bpy.ops.wm.open_mainfile(filepath="G:/exoduser-wt/codex-rigpixel/unity/Tools/char-modular/Warrior_Modular.blend")
sc=bpy.context.scene
rig=next(o for o in sc.objects if o.type=="ARMATURE")
for b in rig.pose.bones: b.matrix_basis.identity()
bpy.context.view_layer.update()
o=sc.objects["Warrior_Hair"]
dg=bpy.context.evaluated_depsgraph_get(); ev=o.evaluated_get(dg)
me=ev.to_mesh(); me.calc_loop_triangles()
uvl=me.uv_layers["UVMap"].data
M=o.matrix_world
rows=[]
for t in me.loop_triangles:
    w=[tuple(M@me.vertices[v].co) for v in t.vertices]
    uv=[tuple(uvl[l].uv) for l in t.loops]
    rows.append([*np.array(uv).ravel()*4096, *np.array(w).ravel()])
a=np.array(rows)
np.save("I:/EXODUSER-Storage/char-modular/texfix/hair_tris.npy",a)
allv=np.array([tuple(M@v.co) for v in me.vertices]); print("tris",len(a),"bbox",allv.min(0),allv.max(0),"uvmax",a[:,:6].max(),a[:,:6].min())
print("head bone",tuple(rig.matrix_world@rig.pose.bones["Head"].head))
