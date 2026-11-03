using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 // 영웅 표현만 소유한다. Core 위치·조준·피격 판정·카메라에는 쓰지 않는다.
 public sealed class NativeHeroView {
  readonly GameObject root,model;
  readonly NativeHeroMotion motion;
  readonly NativeRigPixelAlternateMotion alternate;
  public int Visual {get;private set;}
  readonly Light fill,rim;
  readonly Transform leftFoot,rightFoot;
  readonly Exoduser.CharacterLab.CapeSpring cape;
  Simulation previousSimulation;Vector3 previousGround;bool previousWorld3D;
  public bool Ready {get{return model!=null&&(motion!=null||alternate!=null);}}
  public NativeHeroMotion Motion {get{return motion;}}
  public GameObject Model {get{return model;}}
  public NativeHeroView(Transform parent,int visual=0){
   Visual=visual;string resource=NativeRigPixelPolicy.HeroResource(visual);
   var prefab=Resources.Load<GameObject>(resource);
   if(prefab==null){Debug.LogError("[Hero3D] 런타임 프리팹 누락: "+resource);return;}
   root=new GameObject("Hero 3D");root.transform.SetParent(parent,false);
   model=Object.Instantiate(prefab,root.transform);model.name=resource.Substring(resource.LastIndexOf('/')+1);model.transform.localPosition=Vector3.zero;model.transform.localRotation=Quaternion.identity;model.transform.localScale=Vector3.one;
   foreach(var t in model.GetComponentsInChildren<Transform>(true))t.gameObject.layer=30;
   foreach(var r in model.GetComponentsInChildren<Renderer>(true)){r.renderingLayerMask=3;r.shadowCastingMode=ShadowCastingMode.On;r.receiveShadows=true;}
   var a=model.GetComponent<Animator>();leftFoot=a.GetBoneTransform(HumanBodyBones.LeftFoot);rightFoot=a.GetBoneTransform(HumanBodyBones.RightFoot);
   if(visual==0)motion=model.GetComponent<NativeHeroMotion>()??model.AddComponent<NativeHeroMotion>();
   else {alternate=model.GetComponent<NativeRigPixelAlternateMotion>()??model.AddComponent<NativeRigPixelAlternateMotion>();alternate.Visual=visual;}
   cape=model.GetComponent<Exoduser.CharacterLab.CapeSpring>();
   fill=MakeLight("Hero neutral fill",new Color(1,.97f,.94f),6f,5f);
   rim=MakeLight("Hero cool edge",new Color(.62f,.75f,.86f),1.6f,4f);
  }
  Light MakeLight(string name,Color color,float intensity,float range){
   var l=new GameObject(name).AddComponent<Light>();l.transform.SetParent(root.transform,false);l.type=LightType.Point;l.color=color;l.intensity=intensity;l.range=range;l.shadows=LightShadows.None;l.cullingMask=1<<30;
   l.GetUniversalAdditionalLightData().renderingLayers=2;
   return l;
  }
  public void Sync(Simulation simulation,bool moving){
   if(!Ready||simulation==null)return;
   var p=simulation.Player;bool world3D=NativeRemodel3D.Active;
   // 같은 발밑 앵커를 사용한다. 2D 아레나는 기울인 바닥 기준으로 모델을 앞에 표시한다.
   var ground=NativeRemodel3D.Point(p.X,p.Y);if(!world3D)ground.z=-3;
   var floor=world3D?Quaternion.identity:Quaternion.Euler(-35,0,0);
   float yaw=Mathf.Atan2(Mathf.Cos(p.Facing),-Mathf.Sin(p.Facing))*Mathf.Rad2Deg;
   root.transform.SetPositionAndRotation(ground,floor*Quaternion.Euler(0,yaw,0));
   root.transform.localScale=Vector3.one*(world3D?.87f:.80f);
   if(!ReferenceEquals(previousSimulation,simulation)||previousWorld3D!=world3D||Vector3.Distance(previousGround,ground)>2f)cape?.ResetState();
   previousSimulation=simulation;previousWorld3D=world3D;previousGround=ground;
   motion?.Sync(simulation,moving);alternate?.Sync(simulation,moving);
   fill.transform.position=ground+floor*new Vector3(-.7f,1.8f,-1.4f);
   rim.transform.position=ground+floor*new Vector3(.9f,1.5f,1.1f);
  }
  public void PixelLighting(){if(fill!=null)fill.enabled=false;if(rim!=null)rim.enabled=false;motion?.EnableRigPixelMotion();}
  public void Dispose(){if(root!=null){root.SetActive(false);Object.Destroy(root);}}
  public float FootError(){
   if(!Ready||leftFoot==null||rightFoot==null)return 0;
   return Mathf.Min(model.transform.InverseTransformPoint(leftFoot.position).y,model.transform.InverseTransformPoint(rightFoot.position).y)-.055f;
  }
 }
}
