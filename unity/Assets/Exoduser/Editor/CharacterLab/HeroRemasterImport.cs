using System;
using System.Collections.Generic;
using System.Linq;
using UnityEditor;
using UnityEngine;
namespace Exoduser.CharacterLab {
 // 생성 원본과 보정 .blend는 I: 보관, 여기서는 게임이 쓰는 FBX·텍스처만 연결한다.
 public static class HeroRemasterImport {
  const string Dir="Assets/Exoduser/Art/Characters/Warrior/RemasterR7";
  const string Model=Dir+"/Warrior_R7.fbx";
  static readonly string[] Parts={"Iron","Hair","Skin","Cloth","Leather"};
  static readonly (string human,string bone)[] Bones={
   ("Hips","Hips"),("Spine","Spine02"),("Chest","Spine01"),("UpperChest","Spine"),("Neck","neck"),("Head","Head"),
   ("LeftShoulder","LeftShoulder"),("LeftUpperArm","LeftArm"),("LeftLowerArm","LeftForeArm"),("LeftHand","LeftHand"),
   ("RightShoulder","RightShoulder"),("RightUpperArm","RightArm"),("RightLowerArm","RightForeArm"),("RightHand","RightHand"),
   ("LeftUpperLeg","LeftUpLeg"),("LeftLowerLeg","LeftLeg"),("LeftFoot","LeftFoot"),("LeftToes","LeftToeBase"),
   ("RightUpperLeg","RightUpLeg"),("RightLowerLeg","RightLeg"),("RightFoot","RightFoot"),("RightToes","RightToeBase")};
  public static void Import(){
   AssetDatabase.Refresh();
   ConfigureTexture("BaseColor",false,false);ConfigureTexture("Normal",true,false);ConfigureTexture("MetallicSmoothness",false,true);
   ConfigureModel();
   var old=AssetDatabase.LoadAssetAtPath<GameObject>(WarriorImport.PrefabPath);
   if(old==null)throw new Exception("기존 전사 운반 자세·대검 원본 누락");
   var oldAnimator=old.GetComponent<Animator>();
   var oldSocket=old.GetComponentsInChildren<Transform>(true).First(t=>t.name=="Socket_Weapon_R");
   var oldWeapon=oldSocket.Cast<Transform>().First(t=>t.GetComponentInChildren<MeshFilter>()!=null);
   var instance=(GameObject)PrefabUtility.InstantiatePrefab(AssetDatabase.LoadAssetAtPath<GameObject>(Model));
   try {
    instance.name="Warrior";instance.transform.SetPositionAndRotation(Vector3.zero,Quaternion.identity);instance.transform.localScale=Vector3.one;
    var animator=instance.GetComponent<Animator>();animator.runtimeAnimatorController=oldAnimator.runtimeAnimatorController;
    animator.applyRootMotion=false;animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;
    var materials=Parts.Select(MakeMaterial).ToArray();
    foreach(var skin in instance.GetComponentsInChildren<SkinnedMeshRenderer>(true)){
     if(skin.sharedMesh.subMeshCount!=Parts.Length)throw new Exception("R7 부위별 하위 메시 순서/개수 불일치");
     skin.sharedMaterials=materials;skin.updateWhenOffscreen=true;
    }
    var cape=instance.AddComponent<CapeSpring>();EditorUtility.CopySerialized(old.GetComponent<CapeSpring>(),cape);
    // Blender에서 손 본에 직접 붙인 파지 원점을 그대로 사용한다.
    var socket=instance.GetComponentsInChildren<Transform>(true).First(t=>t.name=="Socket_Weapon_R");
    var scale=socket.lossyScale;
    if(Mathf.Abs(scale.x)<.000001f||Mathf.Abs(scale.y)<.000001f||Mathf.Abs(scale.z)<.000001f)throw new Exception("R7 대검 소켓 배율 오류");
    socket.localScale=Vector3.Scale(socket.localScale,new Vector3(1/scale.x,1/scale.y,1/scale.z));
    if(!instance.GetComponentsInChildren<Transform>(true).Any(t=>t.name=="Grip_L"))throw new Exception("Blender 본 부착 왼손 파지 원점 누락");
    var weapon=UnityEngine.Object.Instantiate(oldWeapon.gameObject,socket);
    weapon.name=oldWeapon.name;weapon.transform.localPosition=oldWeapon.localPosition;weapon.transform.localRotation=oldWeapon.localRotation;weapon.transform.localScale=oldWeapon.localScale;
    PrefabUtility.SaveAsPrefabAsset(instance,"Assets/Exoduser/Resources/Characters/Warrior.prefab");AssetDatabase.SaveAssets();
   } finally {UnityEngine.Object.DestroyImmediate(instance);}
   HeroVerification.VerifyR7();Debug.Log("HERO_R7_IMPORT_PASS");
  }
  static void ConfigureTexture(string suffix,bool normal,bool linear){
   var imp=(TextureImporter)AssetImporter.GetAtPath(Dir+"/"+suffix+".png");if(imp==null)throw new Exception("R7 텍스처 누락: "+suffix);
   imp.textureType=normal?TextureImporterType.NormalMap:TextureImporterType.Default;imp.sRGBTexture=!normal&&!linear;
   imp.mipmapEnabled=true;imp.maxTextureSize=2048;imp.textureCompression=TextureImporterCompression.CompressedHQ;
   imp.alphaSource=linear?TextureImporterAlphaSource.FromInput:TextureImporterAlphaSource.None;imp.alphaIsTransparency=false;imp.SaveAndReimport();
  }
  static Material MakeMaterial(string part){
   string path=Dir+"/HeroR7_"+part+".mat";var mat=AssetDatabase.LoadAssetAtPath<Material>(path);
   if(mat==null){mat=new Material(Shader.Find("Universal Render Pipeline/Lit"));AssetDatabase.CreateAsset(mat,path);}mat.name="HeroR7_"+part;
   mat.SetTexture("_BaseMap",AssetDatabase.LoadAssetAtPath<Texture2D>(Dir+"/BaseColor.png"));
   mat.SetTexture("_BumpMap",AssetDatabase.LoadAssetAtPath<Texture2D>(Dir+"/Normal.png"));mat.EnableKeyword("_NORMALMAP");
   Color tint=Color.white;float smooth=.37f,bump=.18f;
   if(part=="Iron"){tint=new Color(.60f,.65f,.70f);smooth=.80f;bump=.32f;}
   if(part=="Hair"){tint=new Color(.36f,.34f,.33f);smooth=.12f;}
   if(part=="Cloth"){tint=new Color(.85f,.72f,.74f);smooth=.13f;bump=.24f;}
   if(part=="Leather"){tint=new Color(.76f,.72f,.68f);smooth=.20f;bump=.25f;}
   mat.SetColor("_BaseColor",tint);mat.SetFloat("_Smoothness",smooth);mat.SetFloat("_BumpScale",bump);mat.SetFloat("_Cull",2);
   mat.SetFloat("_Metallic",part=="Iron"?1:0);mat.SetFloat("_SmoothnessTextureChannel",0);
   mat.SetTexture("_MetallicGlossMap",part=="Iron"?AssetDatabase.LoadAssetAtPath<Texture2D>(Dir+"/MetallicSmoothness.png"):null);
   if(part=="Iron")mat.EnableKeyword("_METALLICSPECGLOSSMAP");else mat.DisableKeyword("_METALLICSPECGLOSSMAP");
   EditorUtility.SetDirty(mat);return mat;
  }
  static void ConfigureModel(){
   var imp=(ModelImporter)AssetImporter.GetAtPath(Model);imp.isReadable=true;imp.importAnimation=false;imp.importBlendShapes=false;
   imp.meshCompression=ModelImporterMeshCompression.Off;imp.materialImportMode=ModelImporterMaterialImportMode.None;
   imp.animationType=ModelImporterAnimationType.Human;imp.avatarSetup=ModelImporterAvatarSetup.CreateFromThisModel;imp.SaveAndReimport();
   var go=AssetDatabase.LoadAssetAtPath<GameObject>(Model);var human=new List<HumanBone>();var skeleton=new List<SkeletonBone>();
   foreach(var t in go.GetComponentsInChildren<Transform>(true))skeleton.Add(new SkeletonBone{name=t.name,position=t.localPosition,rotation=t.localRotation,scale=t.localScale});
   foreach(var pair in Bones){if(!skeleton.Any(s=>s.name==pair.bone))throw new Exception("R7 필수 본 누락: "+pair.bone);var bone=new HumanBone{humanName=pair.human,boneName=pair.bone};bone.limit.useDefaultValues=true;human.Add(bone);}
   var hd=imp.humanDescription;hd.human=human.ToArray();hd.skeleton=skeleton.ToArray();hd.upperArmTwist=.5f;hd.lowerArmTwist=.5f;hd.upperLegTwist=.5f;hd.lowerLegTwist=.5f;hd.armStretch=.05f;hd.legStretch=.05f;hd.hasTranslationDoF=false;imp.humanDescription=hd;imp.SaveAndReimport();
  }
 }
}
