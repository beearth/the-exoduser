using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;
using Exoduser.UnityPort;
namespace Exoduser.CharacterLab {
 public static class ModularWarriorImport {
  const string Dir="Assets/Exoduser/Art/Characters/Warrior/Modular";
  const string Prefab="Assets/Exoduser/Resources/Characters/Warrior_Modular.prefab";
  static readonly string[] Families={"Iron","Leather","Cloth","Skin","Hair"};
  [Serializable] sealed class Contract {public int totalTriangles,triangles,swordTriangles,bones;public int[] materialTriangles;}
  [Serializable] sealed class Receipt {
   public bool passed,compileOnly=true,playerRun=false,humanoid,existingAnimator,rigidIron,defaultAdopted=false;
   public int totalTriangles,bodyTriangles,swordTriangles,bones,capeBones,hairBones,materials;
   public string prefab,sourceCommit,flag="--hero-render=rigpixel --hero-rig=modular",visualStatus="RETOUCH_GAME_QA_PENDING";
  }
  static Transform Find(GameObject root,string name)=>root.GetComponentsInChildren<Transform>(true).FirstOrDefault(t=>t.name==name);
  static void Require(bool condition,string message){if(!condition)throw new InvalidOperationException(message);}
  public static void Run(){
   AssetDatabase.Refresh();
   var contract=JsonUtility.FromJson<Contract>(File.ReadAllText(Dir+"/assembly-contract.json"));
   Require(contract!=null&&contract.totalTriangles>=25000&&contract.totalTriangles<=40000,"Whole hero triangle contract missing");
   var atlasPath=Dir+"/Warrior_Modular_BaseColor.png";
   var texture=(TextureImporter)AssetImporter.GetAtPath(atlasPath);
   texture.textureType=TextureImporterType.Default;texture.sRGBTexture=true;texture.maxTextureSize=2048;
   texture.filterMode=FilterMode.Bilinear;texture.wrapMode=TextureWrapMode.Clamp;texture.mipmapEnabled=false;
   texture.textureCompression=TextureImporterCompression.CompressedHQ;texture.alphaSource=TextureImporterAlphaSource.None;texture.SaveAndReimport();
   var old=AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Exoduser/Resources/Characters/Warrior.prefab");
   Require(old!=null,"Existing Warrior prefab missing");
   var oldAnimator=old.GetComponent<Animator>();Require(oldAnimator!=null&&oldAnimator.runtimeAnimatorController!=null,"Existing Animator missing");
   var modelPath=Dir+"/Warrior_Modular.fbx";
   var importer=(ModelImporter)AssetImporter.GetAtPath(modelPath);
   importer.isReadable=true;importer.importAnimation=false;importer.importBlendShapes=false;importer.optimizeGameObjects=false;
   importer.materialImportMode=ModelImporterMaterialImportMode.ImportStandard;
   importer.animationType=ModelImporterAnimationType.Human;importer.avatarSetup=ModelImporterAvatarSetup.CreateFromThisModel;importer.SaveAndReimport();
   var asset=AssetDatabase.LoadAssetAtPath<GameObject>(modelPath);
   var reference=(ModelImporter)AssetImporter.GetAtPath("Assets/Exoduser/Art/Characters/Warrior/RemasterR7/Warrior_R7.fbx");
   var human=reference.humanDescription.human;
   Require(human.Length>=20,"Reference HumanDescription missing");
   var transforms=asset.GetComponentsInChildren<Transform>(true);
   foreach(var bone in human)Require(transforms.Any(t=>t.name==bone.boneName),"Missing reference bone: "+bone.boneName);
   var hd=reference.humanDescription;
   hd.skeleton=transforms.Select(t=>new SkeletonBone{name=t.name,position=t.localPosition,rotation=t.localRotation,scale=t.localScale}).ToArray();
   importer.humanDescription=hd;importer.SaveAndReimport();
   asset=AssetDatabase.LoadAssetAtPath<GameObject>(modelPath);
   var instance=(GameObject)PrefabUtility.InstantiatePrefab(asset);
   try {
    instance.name="Warrior_Modular";instance.transform.SetPositionAndRotation(Vector3.zero,Quaternion.identity);instance.transform.localScale=Vector3.one;
    var animator=instance.GetComponent<Animator>();
    Require(animator!=null&&animator.avatar!=null&&animator.avatar.isValid&&animator.avatar.isHuman,"Modular avatar invalid");
    animator.runtimeAnimatorController=oldAnimator.runtimeAnimatorController;animator.applyRootMotion=false;animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;
    var skins=instance.GetComponentsInChildren<SkinnedMeshRenderer>(true);Require(skins.Length==1,"Expected one combined draw mesh");
    var skin=skins[0];Require(skin.sharedMesh.subMeshCount==Families.Length,"Expected four families plus black hair");
    var mapped=new Material[Families.Length];int iron=-1;
    for(int i=0;i<Families.Length;i++){
     string source=skin.sharedMaterials[i]!=null?skin.sharedMaterials[i].name:"";
     int family=Array.FindIndex(Families,name=>source.IndexOf("WarriorModular_"+name,StringComparison.Ordinal)>=0);
     if(family<0&&contract.materialTriangles!=null){int count=(int)skin.sharedMesh.GetIndexCount(i)/3;family=Array.IndexOf(contract.materialTriangles,count);}
     Require(family>=0,"Unknown exported material family: "+source);
     mapped[i]=MakeMaterial(Families[family],atlasPath);if(Families[family]=="Iron")iron=i;
    }
    Require(iron>=0,"Iron family missing");skin.sharedMaterials=mapped;skin.updateWhenOffscreen=true;
    var weights=skin.sharedMesh.boneWeights;var vertices=new HashSet<int>(skin.sharedMesh.GetTriangles(iron));
    foreach(int index in vertices){var w=weights[index];Require(Mathf.Abs(w.weight0-1)<.00001f&&w.weight1+w.weight2+w.weight3<.00001f,"Metal vertex is not single bone 100%");}
    Require(Find(instance,"hand_r_weapon")!=null&&Find(instance,"Socket_Weapon_R")!=null&&Find(instance,"Grip_L")!=null,"Required weapon sockets missing");
    var oldSocket=Find(old,"Socket_Weapon_R");
    var oldWeapon=oldSocket.Cast<Transform>().First(t=>t.GetComponentInChildren<MeshFilter>(true)!=null);
    var socket=Find(instance,"Socket_Weapon_R");var scale=socket.lossyScale;
    Require(Mathf.Abs(scale.x*scale.y*scale.z)>.000000001f,"Weapon socket scale invalid");
    socket.localScale=Vector3.Scale(socket.localScale,new Vector3(1/scale.x,1/scale.y,1/scale.z));
    var weapon=UnityEngine.Object.Instantiate(oldWeapon.gameObject,socket);
    weapon.name=oldWeapon.name;weapon.transform.localPosition=oldWeapon.localPosition;weapon.transform.localRotation=oldWeapon.localRotation;weapon.transform.localScale=oldWeapon.localScale;
    int swordTriangles=ReplaceSwordMesh(weapon);
    instance.AddComponent<NativeModularSecondaryMotion>();
    int cape=instance.GetComponentsInChildren<Transform>(true).Count(t=>t.name.StartsWith("Cape_",StringComparison.Ordinal));
    int hair=instance.GetComponentsInChildren<Transform>(true).Count(t=>t.name.StartsWith("RigHair_",StringComparison.Ordinal));
    Require(cape==12&&hair==3,"Auxiliary chain count mismatch");
    int bodyTriangles=(int)Enumerable.Range(0,Families.Length).Sum(i=>(long)skin.sharedMesh.GetIndexCount(i))/3;
    Require(bodyTriangles+swordTriangles>=25000&&bodyTriangles+swordTriangles<=40000,"Imported triangle budget failed");
    PrefabUtility.SaveAsPrefabAsset(instance,Prefab);AssetDatabase.SaveAssets();
    var receipt=new Receipt{passed=true,humanoid=true,existingAnimator=animator.runtimeAnimatorController==oldAnimator.runtimeAnimatorController,
     rigidIron=true,totalTriangles=bodyTriangles+swordTriangles,bodyTriangles=bodyTriangles,swordTriangles=swordTriangles,bones=skin.bones.Length,
     capeBones=cape,hairBones=hair,materials=Families.Length,prefab=Prefab};
    string output="I:/EXODUSER-Storage/char-modular/compile-current";var args=Environment.GetCommandLineArgs();for(int i=0;i<args.Length-1;i++)if(args[i]=="-output")output=args[i+1];
    for(int i=0;i<args.Length-1;i++)if(args[i]=="-sourceCommit")receipt.sourceCommit=args[i+1];
    Directory.CreateDirectory(output);File.WriteAllText(Path.Combine(output,"modular-import.json"),JsonUtility.ToJson(receipt,true));
    Debug.Log("MODULAR_IMPORT_PASS triangles="+receipt.totalTriangles+" bones="+receipt.bones+" rigidIron=true; visual QA pending");
   } finally {UnityEngine.Object.DestroyImmediate(instance);}
   EditorApplication.Exit(0);
  }
  static Material MakeMaterial(string family,string atlas){
   string path=Dir+"/WarriorModular_"+family+".mat";
   var material=AssetDatabase.LoadAssetAtPath<Material>(path);
   if(material==null){material=new Material(Shader.Find("Universal Render Pipeline/Lit"));AssetDatabase.CreateAsset(material,path);}
   material.name="WarriorModular_"+family;material.SetTexture("_BaseMap",AssetDatabase.LoadAssetAtPath<Texture2D>(atlas));
   material.SetColor("_BaseColor",Color.white);material.SetFloat("_Metallic",family=="Iron"?.85f:0);material.SetFloat("_Smoothness",family=="Iron"?.6f:family=="Skin"?.3f:.12f);
   material.SetFloat("_Cull",family=="Cloth"?0:2);EditorUtility.SetDirty(material);return material;
  }
  static int ReplaceSwordMesh(GameObject weapon){
   string path=Dir+"/Warrior_Modular_Sword.fbx";
   var importer=(ModelImporter)AssetImporter.GetAtPath(path);importer.isReadable=true;importer.importAnimation=false;importer.materialImportMode=ModelImporterMaterialImportMode.None;importer.SaveAndReimport();
   var generated=AssetDatabase.LoadAssetAtPath<GameObject>(path).GetComponentsInChildren<MeshFilter>(true);
   var old=weapon.GetComponentsInChildren<MeshFilter>(true);Require(generated.Length==1&&old.Length==1,"Sword mesh count changed");
   var mesh=UnityEngine.Object.Instantiate(generated[0].sharedMesh);var from=mesh.bounds;var to=old[0].sharedMesh.bounds;
   var factors=new Vector3(to.size.x/from.size.x,to.size.y/from.size.y,to.size.z/from.size.z);
   var points=mesh.vertices;for(int i=0;i<points.Length;i++)points[i]=Vector3.Scale(points[i]-from.center,factors)+to.center;
   mesh.vertices=points;mesh.RecalculateBounds();mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.name="Warrior_Modular_SwordMesh";
   string output=Dir+"/Warrior_Modular_SwordMesh.asset";var existing=AssetDatabase.LoadAssetAtPath<Mesh>(output);
   if(existing==null){AssetDatabase.CreateAsset(mesh,output);existing=mesh;}else{EditorUtility.CopySerialized(mesh,existing);UnityEngine.Object.DestroyImmediate(mesh);}
   old[0].sharedMesh=existing;return (int)existing.GetIndexCount(0)/3;
  }
 }
}
