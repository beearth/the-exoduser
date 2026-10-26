using System;
using UnityEngine;

namespace Exoduser.UnityPort {
 // Shared web affix definitions (Resources/Data/affix_defs_web.json, tools/affix-defs-web/build_affix_defs.cjs): name, kind (type 0 prefix,
 // 1 suffix, -1 legacy), unit and description of every affix id. Read by the forge and by the inventory item card; one copy only.
 // Empty unit / desc = the web has none for that id.
 [Serializable] public sealed class AffixDef {public string id,name,unit,desc;public int type;}
 [Serializable] sealed class AffixDefsFile {public AffixDef[] affixes;}
 public static class AffixDefs {
  static AffixDef[] all;
  public static AffixDef[] All {get{
   if(all==null){var d=JsonUtility.FromJson<AffixDefsFile>(Resources.Load<TextAsset>("Data/affix_defs_web").text);if(d==null||d.affixes==null||d.affixes.Length!=417)throw new InvalidOperationException("Web affix definition table mismatch");all=d.affixes;}
   return all;
  }}
 }
}
