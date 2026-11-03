using System;
using UnityEditor;
using UnityEngine;
namespace Exoduser {
 public static class A2RR17Checks {
  public static string[] ExpectedModels(){var names=new System.Collections.Generic.List<string>(A2RR16Calibration.Names);foreach(var n in new[]{"bnd0","bnd3","bnd5","bnd18","c1tree","ctree13","ctree14","ctree15","ctree16","ctree17","ctree18","ctree19","ctree20","fg_rot01","fg_rot03"})names.Add(n+"_far");return names.ToArray();}
  public static int VerifyMaterials(){int count=0;foreach(var guid in AssetDatabase.FindAssets("t:Material",new[]{"Assets/Exoduser/Resources/A2R/Models3D/Materials"})){
   var material=AssetDatabase.LoadAssetAtPath<Material>(AssetDatabase.GUIDToAssetPath(guid));foreach(var shader in new[]{"LitOpaque","LitFade"}){var copy=new Material(material){shader=Resources.Load<Shader>("A2R/"+shader)};try{foreach(var key in new[]{"_SPECULARHIGHLIGHTS_OFF","_ENVIRONMENTREFLECTIONS_OFF"})if(!copy.IsKeywordEnabled(key))throw new Exception("Model reflection path enabled: "+material.name+" "+shader+" "+key);if(ShaderUtil.ShaderHasError(copy.shader))throw new Exception("Shader compile error "+shader);}finally{UnityEngine.Object.DestroyImmediate(copy);}}count++;
   }if(count==0)throw new Exception("No model materials");Debug.Log("A2R_R17_MATERIAL_PASS opaque and fade keyword transfer: "+count);return 0;
  }
  public static int VerifyFarLods(){
   int count=0;
   foreach(var guid in AssetDatabase.FindAssets("t:Prefab",new[]{"Assets/Exoduser/Resources/A2R/Models3D/Prefabs"})){
    string path=AssetDatabase.GUIDToAssetPath(guid);if(!path.EndsWith("_far.prefab",StringComparison.Ordinal))continue;
    var root=UnityEngine.Object.Instantiate(AssetDatabase.LoadAssetAtPath<GameObject>(path));
    try{UnityPort.A2RProps3D.ApplyRenderBudget(root,5,true);var levels=root.GetComponent<LODGroup>().GetLODs();
     if(levels.Length!=1||levels[0].renderers.Length==0)throw new Exception("R17 RED: far tree selects empty LOD: "+path);
     foreach(var r in levels[0].renderers)if(!r.gameObject.activeInHierarchy||r.shadowCastingMode!=UnityEngine.Rendering.ShadowCastingMode.Off)throw new Exception("Far tree inactive or casts shadows "+path);
     UnityPort.A2RProps3D.ApplyRenderBudget(root,5,true);if(root.GetComponent<LODGroup>().GetLODs().Length!=1)throw new Exception("Far LOD policy not idempotent");count++;
    }finally{UnityEngine.Object.DestroyImmediate(root);}
   }
   if(count!=15)throw new Exception("Expected 15 far species");Debug.Log("A2R_R17_FAR_PASS nonempty visible LOD and shadows off: "+count);return 0;
  }
 }
}
