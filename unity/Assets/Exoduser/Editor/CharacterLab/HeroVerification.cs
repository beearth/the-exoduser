using System;
using System.Linq;
using UnityEditor;
using UnityEngine;
using Exoduser.UnityPort;
using Exoduser.UnityPort.Core;
namespace Exoduser.CharacterLab {
 public static class HeroVerification {
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
