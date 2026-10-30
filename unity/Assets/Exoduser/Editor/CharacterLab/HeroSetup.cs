using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.CharacterLab {
 public static class HeroSetup {
  public static void Prepare(){
   AssetDatabase.Refresh();
   var source=AssetDatabase.LoadAssetAtPath<GameObject>(WarriorImport.PrefabPath);
   if(source==null)throw new System.Exception("인수한 전사 프리팹을 읽지 못함");
   var instance=(GameObject)PrefabUtility.InstantiatePrefab(source);
   try {
    instance.name="Warrior";instance.transform.SetPositionAndRotation(Vector3.zero,Quaternion.identity);instance.transform.localScale=Vector3.one;
    var body=AssetDatabase.LoadAssetAtPath<Material>(WarriorImport.MatPath);
    var weapon=AssetDatabase.LoadAssetAtPath<Material>(WarriorImport.Dir+"/Weapon/Warrior_Greatsword_Mat.mat");
    foreach(var r in instance.GetComponentsInChildren<Renderer>(true)){
     var mat=r is SkinnedMeshRenderer?body:weapon;if(mat==null)throw new System.Exception("전사 재질 누락");
     var ms=r.sharedMaterials;for(int i=0;i<ms.Length;i++)ms[i]=mat;r.sharedMaterials=ms;r.shadowCastingMode=ShadowCastingMode.On;r.receiveShadows=true;
    }
    Directory.CreateDirectory("Assets/Exoduser/Resources/Characters");
    PrefabUtility.SaveAsPrefabAsset(instance,"Assets/Exoduser/Resources/Characters/Warrior.prefab");
    AssetDatabase.SaveAssets();HeroVerification.Verify();
   } finally {Object.DestroyImmediate(instance);}
  }
 }
}
