using System;
using System.Linq;
using UnityEditor;
using UnityEngine;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
namespace Exoduser.CharacterLab {
 public static class HeroVerification {
  public static void VerifyR7All(){VerifyR7Grip();VerifyR7Carry();}
  public static void VerifyR7Carry(){
   VerifyR7();var holder=new GameObject("R7 운반 자세 검사");
   try {
    var view=new NativeHeroView(holder.transform);var sim=new Simulation(SourceStarterFixture.CreateBasicWeapon());
    foreach(bool moving in new[]{false,true}){
     if(moving)sim.Tick(1,0,sim.Player.X+300,sim.Player.Y,false,false);
     view.Sync(sim,moving);typeof(NativeHeroMotion).GetMethod("LateUpdate",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic).Invoke(view.Motion,null);
     var socket=view.Model.GetComponentsInChildren<Transform>(true).First(t=>t.name=="Socket_Weapon_R");
     float down=Vector3.Dot(-socket.up,view.Model.transform.up);
     if(down>-.30f)throw new Exception("R7 운반 칼끝이 아래를 향하지 않음: "+down);
     if(!view.Motion.TryGetBladeTip(out var tip))throw new Exception("R7 운반 칼끝 누락");
     float height=Vector3.Dot(tip-view.Model.transform.position,view.Model.transform.up);
     if(height<.02f||height>.45f)throw new Exception("R7 운반 칼끝 접지 여유 오류: "+height);
     Debug.Log("HERO_R7_CARRY_PASS moving="+moving+" down="+down+" height="+height);
    }
   } finally {UnityEngine.Object.DestroyImmediate(holder);}
  }
  public static void VerifyR7Grip(){
   VerifyR7();var holder=new GameObject("R7 실제 파지 검사");
   try {
    var view=new NativeHeroView(holder.transform);
    foreach(var sample in new[]{("wSwing",5),("wSwing",3),("wSwing",1),("sBash",20),("sBash",12),("sBash",1),("sBlock",1)}){
     var sim=new Simulation(SourceStarterFixture.CreateBasicWeapon());sim.Player.State=sample.Item1;sim.Player.StateTicks=sample.Item2;
     view.Sync(sim,false);
     typeof(NativeHeroMotion).GetMethod("LateUpdate",System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic).Invoke(view.Motion,null);
     var transforms=view.Model.GetComponentsInChildren<Transform>(true);
     var left=transforms.First(t=>t.name=="Grip_L");var socket=transforms.First(t=>t.name=="Socket_Weapon_R");
     float error=Vector3.Distance(left.position,socket.position+socket.up*.09f);
     var animator=view.Model.GetComponent<Animator>();var shoulder=animator.GetBoneTransform(HumanBodyBones.LeftUpperArm);var elbow=animator.GetBoneTransform(HumanBodyBones.LeftLowerArm);var wrist=animator.GetBoneTransform(HumanBodyBones.LeftHand);
     Debug.Log("R7 파지 진단 shoulder="+shoulder.position+" wrist="+wrist.position+" grip="+left.position+" target="+(socket.position+socket.up*.09f)+" reach="+(Vector3.Distance(shoulder.position,elbow.position)+Vector3.Distance(elbow.position,wrist.position))+" offset="+Vector3.Distance(left.position,wrist.position));
     if(error>.003f||Vector3.Dot(left.up,socket.up)<.999f)throw new Exception("R7 실제 장갑 중심 파지 오류: "+sample.Item1+" 오차m="+error);
     Debug.Log("HERO_R7_GRIP_PASS "+sample.Item1+" distance="+error);
    }
   } finally {UnityEngine.Object.DestroyImmediate(holder);}
  }
  public static void VerifyR7(){
   Verify();
   var prefab=Resources.Load<GameObject>("Characters/Warrior");
   var instance=(GameObject)PrefabUtility.InstantiatePrefab(prefab);
   try {
    var skin=instance.GetComponentsInChildren<SkinnedMeshRenderer>(true).OrderByDescending(s=>s.sharedMesh.vertexCount).First();
    var mesh=skin.sharedMesh;
    Debug.Log("R7 실제 하위메시 면수 "+string.Join(",",Enumerable.Range(0,mesh.subMeshCount).Select(i=>skin.sharedMaterials[i].name+":"+(mesh.GetIndexCount(i)/3))));
    var expectedFaces=new System.Collections.Generic.Dictionary<string,int>{{"HeroR7_Iron",43352},{"HeroR7_Hair",7416},{"HeroR7_Skin",1653},{"HeroR7_Cloth",38126},{"HeroR7_Leather",2890}};
    for(int i=0;i<mesh.subMeshCount;i++)if(mesh.GetIndexCount(i)/3!=expectedFaces[skin.sharedMaterials[i].name])throw new Exception("R7 부위별 하위메시 재질 오배정: "+skin.sharedMaterials[i].name);
    var weaponSocket=instance.GetComponentsInChildren<Transform>(true).First(t=>t.name=="Socket_Weapon_R");
    var weapon=weaponSocket.GetComponentsInChildren<Renderer>(true).First();
    float diagonal=weapon.bounds.size.magnitude;
    if(diagonal<1||diagonal>2.5f||Vector3.Distance(weapon.bounds.center,weaponSocket.position)>1.2f)throw new Exception("R7 대검 월드 크기/파지 원점 오류: 대각m="+diagonal);
    if(!mesh.isReadable)throw new Exception("R7 구르기·망토 접점 검사를 위한 스킨 읽기 누락");
    foreach(string part in new[]{"Iron","Hair","Skin","Cloth","Leather"})
     if(!skin.sharedMaterials.Any(m=>m!=null&&m.name=="HeroR7_"+part))throw new Exception("R7 부위별 물성 누락: "+part);
    var hair=skin.sharedMaterials.First(m=>m.name=="HeroR7_Hair");
    if(hair.GetFloat("_Metallic")!=0||hair.GetFloat("_Smoothness")>.2f||hair.GetTexture("_MetallicGlossMap")!=null)throw new Exception("R7 흑발의 금속 반사 회귀");
    var cape=instance.GetComponent<CapeSpring>();
    if(cape==null||cape.ChainCount!=3)throw new Exception("R7 망토 3열×3마디 연결 누락");
    var names=skin.bones.Select(b=>b.name).ToArray();int capeVertices=0;
    foreach(var weights in mesh.boneWeights){
     var ids=new[]{weights.boneIndex0,weights.boneIndex1,weights.boneIndex2,weights.boneIndex3};
     var ws=new[]{weights.weight0,weights.weight1,weights.weight2,weights.weight3};bool cloth=false,leg=false;float sum=0;
     for(int i=0;i<4;i++){sum+=ws[i];if(ws[i]<=.00001f)continue;string name=names[ids[i]];cloth|=name.StartsWith("Cape_");leg|=name.Contains("Leg")||name.Contains("Foot")||name.Contains("Toe");}
     if(Mathf.Abs(sum-1)>.001f)throw new Exception("R7 스킨 가중치 합 오류");
     if(cloth){capeVertices++;if(leg)throw new Exception("R7 망토에 다리 가중치 잔존");}
    }
    if(capeVertices<2000)throw new Exception("R7 망토 재가중 정점 누락");
    Debug.Log("HERO_R7_MATERIAL_CAPE_SKIN_PASS capeVertices="+capeVertices);
   } finally {UnityEngine.Object.DestroyImmediate(instance);}
  }
  public static void Verify(){
   var prefab=Resources.Load<GameObject>("Characters/Warrior");
   if(prefab==null)throw new Exception("게임이 읽을 전사 3D 프리팹이 없습니다");
   var animator=prefab.GetComponent<Animator>();
   if(animator==null||animator.avatar==null||!animator.avatar.isValid||!animator.avatar.isHuman)throw new Exception("전사 Humanoid 아바타 오류");
   if(prefab.GetComponentsInChildren<SkinnedMeshRenderer>(true).Length==0)throw new Exception("전사 스킨 메시 누락");
   if(!prefab.GetComponentsInChildren<Transform>(true).Any(t=>t.name=="Socket_Weapon_R"))throw new Exception("전사 대검 소켓 누락");
   if(prefab.GetComponent<CapeSpring>()==null)throw new Exception("전사 망토 보조뼈 동작 누락");
   foreach(var r in prefab.GetComponentsInChildren<Renderer>(true))foreach(var m in r.sharedMaterials)
    if(m==null||m.shader==null||ShaderUtil.ShaderHasError(m.shader))throw new Exception("전사 재질·셰이더 오류");
   var holder=new GameObject("전사 계약 검수");
   try {
    var visual=new NativeHeroView(holder.transform);var sim=new Simulation(SourceStarterFixture.CreateBasicWeapon());
    for(int i=0;i<12;i++)sim.Tick(1,0,sim.Player.X+300,sim.Player.Y,true,false);
    string before=JsonUtility.ToJson(sim.Player);int tick=sim.TickCount,casts=sim.SkillCastCount;
    visual.Sync(sim,true);visual.Sync(sim,false);
    if(before!=JsonUtility.ToJson(sim.Player)||sim.TickCount!=tick||sim.SkillCastCount!=casts)throw new Exception("전사 표현이 Core 상태를 변경함");
    if(!visual.Ready)throw new Exception("전사 런타임 표현 생성 실패");
   } finally {UnityEngine.Object.DestroyImmediate(holder);}
   Debug.Log("HERO_RESOURCE_AVATAR_SKIN_WEAPON_CAPE_PASS");
  }
 }
}
