using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEngine;
using UnityEngine.Animations;
using Exoduser.UnityPort;
namespace Exoduser.CharacterLab {
 // A+B_G0 warrior (11-04 Sonnet revision): 24 body groups in one skinned draw mesh, sword separate under Socket_Weapon_R,
 // RotationConstraints on elbow_l/r_couter (0.5 upper arm + 0.5 forearm) and on the four tasset bones. Editor batch only.
 public static class ModularWarriorImport {
  const string Dir="Assets/Exoduser/Art/Characters/Warrior/Modular";
  const string Prefab="Assets/Exoduser/Resources/Characters/Warrior_Modular.prefab";
  static readonly string[] Families={"Iron","Leather","Cloth","Skin","Hair"};
  [Serializable] sealed class Contract {public int totalTriangles,triangles,swordTriangles,bones;public int[] materialTriangles;}
  [Serializable] sealed class Receipt {
   public bool passed,compileOnly=true,playerRun=false,humanoid,existingAnimator,rigidIron=true,defaultAdopted=false;
   public bool couterConstraintsPresent,tassetConstraintsPresent,constraintEvaluated;
   public int atlasWidth,atlasHeight,totalTriangles,bodyTriangles,swordTriangles,bones,capeBones,hairBones,materials,metalVertices,couterConstraintSources,tassetConstraints;
   public float swordTipHeightRest,swordMeshWorldErrorMm,bladeVsRight,bladeVsUp,bladeVsForward,bladeAngleDeg,gripToSwordMm,constraintHalfAngleDeg,constraintRestDeviationDeg,socketDeterminant;
   public string prefab,sourceCommit,flag="--hero-render=rigpixel --hero-rig=modular",visualStatus="RETOUCH_GAME_QA_PENDING",variant,note;
  }
  static Transform Find(GameObject root,string name)=>root.GetComponentsInChildren<Transform>(true).FirstOrDefault(t=>t.name==name);
  static void Require(bool condition,string message){if(!condition)throw new InvalidOperationException(message);}
  public static void Run(){
   AssetDatabase.Refresh();
   var contract=JsonUtility.FromJson<Contract>(File.ReadAllText(Dir+"/assembly-contract.json"));
   Require(contract!=null&&contract.totalTriangles>=25000&&contract.totalTriangles<=40000,"Whole hero triangle contract missing");
   var atlasPath=Dir+"/Warrior_Modular_BaseColor.png";
   var texture=(TextureImporter)AssetImporter.GetAtPath(atlasPath);
   texture.textureType=TextureImporterType.Default;texture.sRGBTexture=true;texture.maxTextureSize=4096;
   texture.filterMode=FilterMode.Bilinear;texture.wrapMode=TextureWrapMode.Clamp;texture.mipmapEnabled=false;
   texture.textureCompression=TextureImporterCompression.CompressedHQ;texture.alphaSource=TextureImporterAlphaSource.None;texture.SaveAndReimport();
   var old=AssetDatabase.LoadAssetAtPath<GameObject>("Assets/Exoduser/Resources/Characters/Warrior.prefab");
   Require(old!=null,"Existing Warrior prefab missing");
   var oldAnimator=old.GetComponent<Animator>();Require(oldAnimator!=null&&oldAnimator.runtimeAnimatorController!=null,"Existing Animator missing");
   var modelPath=Dir+"/Warrior_Modular.fbx";
   var importer=(ModelImporter)AssetImporter.GetAtPath(modelPath);
   importer.isReadable=true;importer.importAnimation=false;importer.importBlendShapes=false;importer.optimizeGameObjects=false;
   importer.materialImportMode=ModelImporterMaterialImportMode.ImportStandard;
   // A stale humanoid configuration from the previous (B-only) model would override the file's bone positions
   // (Rig Error: bone length mismatch). Read the skeleton once as Generic so only the FBX's own positions are used.
   importer.animationType=ModelImporterAnimationType.Generic;importer.avatarSetup=ModelImporterAvatarSetup.NoAvatar;importer.SaveAndReimport();
   var asset=AssetDatabase.LoadAssetAtPath<GameObject>(modelPath);
   var reference=(ModelImporter)AssetImporter.GetAtPath("Assets/Exoduser/Art/Characters/Warrior/RemasterR7/Warrior_R7.fbx");
   var human=reference.humanDescription.human;
   Require(human.Length>=20,"Reference HumanDescription missing");
   var transforms=asset.GetComponentsInChildren<Transform>(true);
   foreach(var bone in human)Require(transforms.Any(t=>t.name==bone.boneName),"Missing reference bone: "+bone.boneName);
   var hd=reference.humanDescription;
   hd.skeleton=transforms.Select(t=>new SkeletonBone{name=t.name,position=t.localPosition,rotation=t.localRotation,scale=t.localScale}).ToArray();
   importer.animationType=ModelImporterAnimationType.Human;importer.avatarSetup=ModelImporterAvatarSetup.CreateFromThisModel;
   importer.humanDescription=hd;importer.SaveAndReimport();
   asset=AssetDatabase.LoadAssetAtPath<GameObject>(modelPath);
   var instance=(GameObject)PrefabUtility.InstantiatePrefab(asset);
   var receipt=new Receipt{variant="A+B_G0_20261104"};{var atlasTex=AssetDatabase.LoadAssetAtPath<Texture2D>(atlasPath);receipt.atlasWidth=atlasTex.width;receipt.atlasHeight=atlasTex.height;}
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
    receipt.metalVertices=vertices.Count;
    Require(Find(instance,"hand_r_weapon")!=null&&Find(instance,"Socket_Weapon_R")!=null&&Find(instance,"Grip_L")!=null,"Required weapon sockets missing");
    var oldSocket=Find(old,"Socket_Weapon_R");
    var oldWeapon=oldSocket.Cast<Transform>().First(t=>t.GetComponentInChildren<MeshFilter>(true)!=null);
    var socket=Find(instance,"Socket_Weapon_R");var scale=socket.lossyScale;
    Require(Mathf.Abs(scale.x*scale.y*scale.z)>.000000001f,"Weapon socket scale invalid");
    socket.localScale=Vector3.Scale(socket.localScale,new Vector3(1/scale.x,1/scale.y,1/scale.z));
    var grip=Find(instance,"Grip_L");var gripScale=grip.lossyScale;Require(Mathf.Abs(gripScale.x*gripScale.y*gripScale.z)>.000000001f,"Grip_L scale invalid");
    grip.localScale=Vector3.Scale(grip.localScale,new Vector3(1/gripScale.x,1/gripScale.y,1/gripScale.z));
    receipt.socketDeterminant=Vector3.Dot(Vector3.Cross(socket.right,socket.up),socket.forward);
    Require(receipt.socketDeterminant>.99f,"Socket frame is not a proper rotation: "+receipt.socketDeterminant);
    var gripDeterminant=Vector3.Dot(Vector3.Cross(grip.right,grip.up),grip.forward);Require(gripDeterminant>.99f,"Grip_L frame is not a proper rotation: "+gripDeterminant);
    var weapon=UnityEngine.Object.Instantiate(oldWeapon.gameObject);weapon.name=oldWeapon.name;
    int swordTriangles=PlaceSword(weapon,socket,receipt);
    instance.AddComponent<NativeModularSecondaryMotion>();
    int cape=instance.GetComponentsInChildren<Transform>(true).Count(t=>t.name.StartsWith("Cape_",StringComparison.Ordinal));
    int hair=instance.GetComponentsInChildren<Transform>(true).Count(t=>t.name.StartsWith("RigHair_",StringComparison.Ordinal));
    Require(cape==12&&hair==6,"Auxiliary chain count mismatch: cape "+cape+" hair "+hair);
    // Elbow cups: 0.5 upper arm + 0.5 forearm, zero offset at rest. No new runtime code.
    int sources=0;
    foreach(string side in new[]{"l","r"}){
     string arm=side=="l"?"LeftArm":"RightArm",fore=side=="l"?"LeftForeArm":"RightForeArm";
     var couter=Find(instance,"elbow_"+side+"_couter");Require(couter!=null,"couter bone missing: "+side);
     Require(couter.parent==Find(instance,arm),"couter parent is not the upper arm: "+side);
     sources+=AddBlend(couter,new[]{Find(instance,arm),Find(instance,fore)},new[]{.5f,.5f});
    }
    receipt.couterConstraintsPresent=sources==4;receipt.couterConstraintSources=sources;
    // Tassets follow their thigh 90 percent (the Blender audit poses use the same follow amount).
    int tassets=0;
    foreach(var pair in new[]{("tasset_fl","LeftUpLeg"),("tasset_sl","LeftUpLeg"),("tasset_fr","RightUpLeg"),("tasset_sr","RightUpLeg")}){
     var bone=Find(instance,pair.Item1);Require(bone!=null,"tasset bone missing: "+pair.Item1);
     AddBlend(bone,new[]{Find(instance,"Hips"),Find(instance,pair.Item2)},new[]{.1f,.9f});tassets++;
    }
    receipt.tassetConstraints=tassets;receipt.tassetConstraintsPresent=tassets==4;
    CheckConstraintEvaluation(instance,animator,receipt);
    int bodyTriangles=(int)Enumerable.Range(0,Families.Length).Sum(i=>(long)skin.sharedMesh.GetIndexCount(i))/3;
    Require(bodyTriangles+swordTriangles>=25000&&bodyTriangles+swordTriangles<=40000,"Imported triangle budget failed");
    bool socketOk=receipt.bladeAngleDeg<3f&&receipt.gripToSwordMm<30f;
    if(socketOk)PrefabUtility.SaveAsPrefabAsset(instance,Prefab);AssetDatabase.SaveAssets();
    receipt.passed=socketOk;receipt.humanoid=true;receipt.existingAnimator=animator.runtimeAnimatorController==oldAnimator.runtimeAnimatorController;
    receipt.totalTriangles=bodyTriangles+swordTriangles;receipt.bodyTriangles=bodyTriangles;receipt.swordTriangles=swordTriangles;receipt.bones=skin.bones.Length;
    receipt.capeBones=cape;receipt.hairBones=hair;receipt.materials=Families.Length;receipt.prefab=Prefab;
    string output="I:/EXODUSER-Storage/char-modular/compile-current";var args=Environment.GetCommandLineArgs();for(int i=0;i<args.Length-1;i++)if(args[i]=="-output")output=args[i+1];
    for(int i=0;i<args.Length-1;i++)if(args[i]=="-sourceCommit")receipt.sourceCommit=args[i+1];
    string receiptName="ab-import.json";for(int i=0;i<args.Length-1;i++)if(args[i]=="-receiptName")receiptName=args[i+1];
    Directory.CreateDirectory(output);File.WriteAllText(Path.Combine(output,receiptName),JsonUtility.ToJson(receipt,true));
    Require(socketOk,"Socket check failed: blade vs -up "+receipt.bladeAngleDeg+" deg (right "+receipt.bladeVsRight+", up "+receipt.bladeVsUp+", forward "+receipt.bladeVsForward+"), grip to sword "+receipt.gripToSwordMm+" mm");
    Debug.Log("MODULAR_AB_IMPORT_PASS triangles="+receipt.totalTriangles+" bones="+receipt.bones+" rigidIron=true couter="+receipt.couterConstraintsPresent+" evaluated="+receipt.constraintEvaluated+"; visual QA pending");
   } finally {UnityEngine.Object.DestroyImmediate(instance);}
   EditorApplication.Exit(0);
  }
  // Two-source (or more) RotationConstraint whose result at rest equals the current rest rotation.
  static int AddBlend(Transform bone,Transform[] sources,float[] weights){
   var constraint=bone.gameObject.AddComponent<RotationConstraint>();
   for(int i=0;i<sources.Length;i++){Require(sources[i]!=null,"constraint source missing for "+bone.name);constraint.AddSource(new ConstraintSource{sourceTransform=sources[i],weight=weights[i]});}
   var rest=bone.rotation;var blended=Blend(sources,weights);
   constraint.rotationAxis=Axis.X|Axis.Y|Axis.Z;constraint.rotationAtRest=bone.localEulerAngles;
   constraint.rotationOffset=(Quaternion.Inverse(blended)*rest).eulerAngles;
   constraint.weight=1;constraint.constraintActive=true;constraint.locked=true;
   return sources.Length;
  }
  static Quaternion Blend(Transform[] sources,float[] weights){
   var result=sources[0].rotation;float total=weights[0];
   for(int i=1;i<sources.Length;i++){total+=weights[i];result=Quaternion.Slerp(result,sources[i].rotation,weights[i]/total);}
   return result;
  }
  // Best-effort evaluation of the real constraint in edit mode: turn only the forearm 40 degrees about its hinge
  // and check that the couter turns half of that. Reported honestly; failure to evaluate is not a pass claim.
  static void CheckConstraintEvaluation(GameObject instance,Animator animator,Receipt receipt){
   try {
    var fore=Find(instance,"RightForeArm");var couter=Find(instance,"elbow_r_couter");
    var controller=animator.runtimeAnimatorController;animator.runtimeAnimatorController=null;animator.enabled=true;
    var restRotation=couter.rotation;var restFore=fore.localRotation;
    animator.Rebind();animator.Update(0f);
    receipt.constraintRestDeviationDeg=Quaternion.Angle(couter.rotation,restRotation);
    var axis=Quaternion.Inverse(fore.rotation)*instance.transform.right;
    fore.localRotation=restFore*Quaternion.AngleAxis(40f,axis);
    animator.Update(0f);
    receipt.constraintHalfAngleDeg=Quaternion.Angle(couter.rotation,restRotation);
    receipt.constraintEvaluated=Mathf.Abs(receipt.constraintHalfAngleDeg-20f)<1.5f&&receipt.constraintRestDeviationDeg<.5f;
    fore.localRotation=restFore;animator.runtimeAnimatorController=controller;
    if(!receipt.constraintEvaluated)receipt.note="constraint evaluation in edit mode gave "+receipt.constraintHalfAngleDeg.ToString("F2")+" deg (expected 20); not claimed";
   } catch(Exception exception){receipt.constraintEvaluated=false;receipt.note="constraint evaluation not available in batch edit mode: "+exception.GetType().Name;}
  }
  static Material MakeMaterial(string family,string atlas){
   string path=Dir+"/WarriorModular_"+family+".mat";
   var material=AssetDatabase.LoadAssetAtPath<Material>(path);
   if(material==null){material=new Material(Shader.Find("Universal Render Pipeline/Lit"));AssetDatabase.CreateAsset(material,path);}
   material.name="WarriorModular_"+family;material.SetTexture("_BaseMap",AssetDatabase.LoadAssetAtPath<Texture2D>(atlas));
   material.SetColor("_BaseColor",Color.white);material.SetFloat("_Metallic",family=="Iron"?.85f:0);material.SetFloat("_Smoothness",family=="Iron"?.6f:family=="Skin"?.3f:.12f);
   material.SetFloat("_Cull",family=="Cloth"?0:2);EditorUtility.SetDirty(material);return material;
  }
  // The sword mesh is exported world-aligned at the A-pose rest (grip = Socket_Weapon_R origin, blade = -up).
  // It goes under the socket at world identity; blade direction and grip position are verified numerically.
  static int PlaceSword(GameObject weapon,Transform socket,Receipt receipt){
   string path=Dir+"/Warrior_Modular_Sword.fbx";
   var importer=(ModelImporter)AssetImporter.GetAtPath(path);importer.isReadable=true;importer.importAnimation=false;importer.materialImportMode=ModelImporterMaterialImportMode.None;importer.SaveAndReimport();
   var generated=AssetDatabase.LoadAssetAtPath<GameObject>(path).GetComponentsInChildren<MeshFilter>(true);
   var old=weapon.GetComponentsInChildren<MeshFilter>(true);Require(generated.Length==1&&old.Length==1,"Sword mesh count changed");
   var mesh=UnityEngine.Object.Instantiate(generated[0].sharedMesh);var matrix=generated[0].transform.localToWorldMatrix;
   var points=mesh.vertices;for(int i=0;i<points.Length;i++)points[i]=matrix.MultiplyPoint3x4(points[i]);
   mesh.vertices=points;mesh.RecalculateBounds();mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.name="Warrior_Modular_SwordMesh";
   string output=Dir+"/Warrior_Modular_SwordMesh.asset";var existing=AssetDatabase.LoadAssetAtPath<Mesh>(output);
   if(existing==null){AssetDatabase.CreateAsset(mesh,output);existing=mesh;}else{EditorUtility.CopySerialized(mesh,existing);UnityEngine.Object.DestroyImmediate(mesh);}
   old[0].sharedMesh=existing;
   // Grip and blade checks in the instance's world space (character at origin, rest pose).
   var world=points;var grip=socket.position;
   var ranked=world.OrderByDescending(p=>(p-grip).sqrMagnitude).Take(Mathf.Max(8,world.Length/100)).ToArray();
   var tip=Vector3.zero;foreach(var p in ranked)tip+=p;tip/=ranked.Length;
   var blade=(tip-grip).normalized;
   receipt.bladeAngleDeg=Vector3.Angle(blade,-socket.up);
   receipt.bladeVsRight=Vector3.Dot(blade,socket.right);receipt.bladeVsUp=Vector3.Dot(blade,socket.up);receipt.bladeVsForward=Vector3.Dot(blade,socket.forward);
   receipt.gripToSwordMm=world.Min(p=>(p-grip).magnitude)*1000f;
   weapon.transform.SetParent(null,false);weapon.transform.SetPositionAndRotation(Vector3.zero,Quaternion.identity);weapon.transform.localScale=Vector3.one;
   // Root cause 11-04: the legacy weapon prefab keeps a child "Model" at local scale 100 / y -0.8 (cm-authored legacy mesh).
   // The sword mesh above is already baked in world meters, so that child must be identity or the blade renders 100x off (tip -30 m).
   var meshNode=old[0].transform;meshNode.localPosition=Vector3.zero;meshNode.localRotation=Quaternion.identity;meshNode.localScale=Vector3.one;
   weapon.transform.SetParent(socket,true);
   var finalMatrix=meshNode.localToWorldMatrix;float worstError=0;Vector3 finalTipPoint=Vector3.zero;float lowest=float.MaxValue;
   for(int i=0;i<points.Length;i++){var q=finalMatrix.MultiplyPoint3x4(existing.vertices[i]);worstError=Mathf.Max(worstError,(q-points[i]).magnitude);if(q.y<lowest)lowest=q.y;}
   receipt.swordMeshWorldErrorMm=worstError*1000f;receipt.swordTipHeightRest=lowest-socket.root.position.y;
   Require(receipt.swordMeshWorldErrorMm<1f,"Sword mesh is not at its baked world position: error "+receipt.swordMeshWorldErrorMm+" mm (child Model transform not identity?)");
   return (int)existing.GetIndexCount(0)/3;
  }
 }
}
