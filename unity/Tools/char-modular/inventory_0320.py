"""Read current saved authoring metadata for handoff; no pose/BVH/test/save."""
import bpy
import json
from pathlib import Path
folder=Path(__file__).parent
bpy.ops.wm.open_mainfile(filepath=str((folder/"Warrior_Modular.blend").resolve()))
parts=[o for o in bpy.context.scene.objects if o.type=="MESH"]
rig=next(o for o in bpy.context.scene.objects if o.type=="ARMATURE")
rows=[{"name":o.name,"group":o.get("char_modular_group"),"source":o.get("char_modular_source"),"sourceId":o.get("char_modular_source_id"),
       "role":o.get("char_modular_role"),"bone":o.get("char_modular_bone","soft"),"triangles":sum(len(f.vertices)-2 for f in o.data.polygons)} for o in parts]
result={"scope":"Saved-file inventory only, not a new test","revision":"0320_rest_growth","triangles":sum(r["triangles"] for r in rows),
        "bones":len(rig.data.bones),"objects":len(parts),"groups":len({r["group"] for r in rows}),"parts":rows}
Path("I:/EXODUSER-Storage/char-modular/inventory-0320-current.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
print("SAVED_INVENTORY_ONLY",result["triangles"],"triangles",result["bones"],"bones",result["groups"],"groups; no test/save")
