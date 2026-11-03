using System;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 // Presentation-only: reads the existing fixture clock. Does not implement either hero's class rules.
 [DefaultExecutionOrder(90)]
 public sealed class NativeRigPixelAlternateMotion : MonoBehaviour {
  public int Visual;
  Animator animator;Transform hips,chest,head,ru,rf,rh,lu,lf,lh,weapon,hub,fold;
  Transform lt,ls,lfoot,rt,rs,rfoot;
  readonly RigPixelLocomotionClock gait=new RigPixelLocomotionClock();
  Simulation previous;float recovery=1;string previousState;bool leftPlanted,rightPlanted;Vector3 leftPlant,rightPlant;
  Quaternion weaponBind,hubBind,foldBind;Vector3 modelBind;
  void Awake(){Bind();}
  Transform Named(string name){foreach(var t in GetComponentsInChildren<Transform>(true))if(t.name==name)return t;return null;}
  void Bind(){
   animator=GetComponent<Animator>();if(animator==null||animator.avatar==null||!animator.avatar.isValid||!animator.avatar.isHuman)return;
   animator.applyRootMotion=false;animator.speed=0;animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;
   Transform B(HumanBodyBones b)=>animator.GetBoneTransform(b);
   hips=B(HumanBodyBones.Hips);chest=B(HumanBodyBones.Chest);head=B(HumanBodyBones.Head);
   ru=B(HumanBodyBones.RightUpperArm);rf=B(HumanBodyBones.RightLowerArm);rh=B(HumanBodyBones.RightHand);
   lu=B(HumanBodyBones.LeftUpperArm);lf=B(HumanBodyBones.LeftLowerArm);lh=B(HumanBodyBones.LeftHand);
   lt=B(HumanBodyBones.LeftUpperLeg);ls=B(HumanBodyBones.LeftLowerLeg);lfoot=B(HumanBodyBones.LeftFoot);
   rt=B(HumanBodyBones.RightUpperLeg);rs=B(HumanBodyBones.RightLowerLeg);rfoot=B(HumanBodyBones.RightFoot);
   weapon=Named("Socket_Gun");hub=Named("Socket_BackHub");fold=Named("BackBladeFold_R");
   if(weapon!=null)weaponBind=weapon.localRotation;if(hub!=null)hubBind=hub.localRotation;if(fold!=null)foldBind=fold.localRotation;
   modelBind=transform.localPosition;
  }
  public void Sync(Simulation sim,bool moving){
   if(sim==null||animator==null||animator.runtimeAnimatorController==null)return;
   if(!ReferenceEquals(previous,sim)){previous=sim;gait.Reset();leftPlanted=rightPlanted=false;previousState=null;GetComponent<NativeRigPixelSecondaryMotion>()?.ResetState();}
   var p=sim.Player;if(p.State!=previousState){if(p.State=="wRecover")recovery=Mathf.Max(1,p.StateTicks);previousState=p.State;}
   bool dead=p.Hp<=0||p.State=="dead"||p.State=="fallen";
   float phase=gait.Observe(sim.TickCount,transform.parent.position.x,NativeRemodel3D.Active?transform.parent.position.z:transform.parent.position.y,1/Mathf.Max(.01f,transform.lossyScale.y),Visual==1?2.25:2.6,moving&&!dead&&!sim.RollActive);
   transform.localPosition=modelBind;
   animator.SetFloat("Speed",moving&&!dead?4:0);animator.Play(moving&&!dead?"Base Layer.Run":"Base Layer.Idle",0,moving?phase:0);animator.Update(0);
   float strike=p.State=="wSwing"?1-Mathf.Clamp01(p.StateTicks/5f):p.State=="wRecover"?1:0;
   float action=p.State=="wSwing"?Mathf.Sin(Mathf.PI*Mathf.Clamp01(strike)):p.State=="wRecover"?Mathf.Clamp01(p.StateTicks/recovery):0;
   float breath=Mathf.Sin(sim.TickCount/60f*2.3f)*.6f;
   if(chest!=null)chest.localRotation*=Quaternion.Euler(breath+(dead?65:0),Visual==1?action*18:0,0);
   if(Visual==2&&weapon!=null){
    // Stable shoulder stock with a support-hand grip; never run Warrior's two-hand blade solver.
    weapon.localRotation=weaponBind;weapon.localPosition=new Vector3(.19f,1.39f,.04f-action*.035f);
    Arm(ru,rf,rh,transform.TransformPoint(new Vector3(.20f,1.25f,.27f-action*.035f)),transform.right);
    Arm(lu,lf,lh,transform.TransformPoint(new Vector3(.17f,1.32f,.67f-action*.035f)),-transform.right);
   } else if(Visual==1){
    // Rotary blade stays attached to upper back; hands never grip the primary weapon.
    if(hub!=null)hub.localRotation=hubBind*Quaternion.Euler(0,0,-strike*200*action);
    if(fold!=null)fold.localRotation=foldBind*Quaternion.Euler(0,0,-75*action);
    Arm(ru,rf,rh,transform.TransformPoint(new Vector3(.31f,1.01f,.05f)),transform.right);
    Arm(lu,lf,lh,transform.TransformPoint(new Vector3(-.31f,1.01f,.05f)),-transform.right);
   }
   bool plant=moving&&!sim.RollActive&&!dead;
   Plant(lt,ls,lfoot,plant,ref leftPlanted,ref leftPlant);Plant(rt,rs,rfoot,plant,ref rightPlanted,ref rightPlant);
   if(sim.RollActive&&hips!=null){hips.rotation=Quaternion.AngleAxis(360*(1-Mathf.Clamp01((float)sim.RollMoveT/18)),transform.right)*hips.rotation;}
  }
  void Plant(Transform thigh,Transform shin,Transform foot,bool moving,ref bool planted,ref Vector3 anchor){
   if(foot==null)return;float height=transform.InverseTransformPoint(foot.position).y;
   if(!moving||height>.13f){planted=false;return;}
   if(!planted){anchor=foot.position;planted=true;}
   if(Vector3.Distance(anchor,foot.position)>.22f*transform.lossyScale.y){anchor=foot.position;return;}
   var rotation=foot.rotation;Arm(thigh,shin,foot,anchor,transform.forward);foot.rotation=rotation;
  }
  static void Arm(Transform upper,Transform lower,Transform end,Vector3 target,Vector3 hint){
   if(upper==null||lower==null||end==null)return;
   Vector3 a=upper.position,b=lower.position,c=end.position,delta=target-a;float l1=Vector3.Distance(a,b),l2=Vector3.Distance(b,c);
   float d=Mathf.Clamp(delta.magnitude,.001f,Mathf.Max(.002f,l1+l2-.0001f));if(l1<.0001f||l2<.0001f)return;
   var dir=delta.normalized;var side=Vector3.ProjectOnPlane(hint,dir).normalized;if(side.sqrMagnitude<.1f)side=Vector3.ProjectOnPlane(Vector3.up,dir).normalized;
   float along=(l1*l1-l2*l2+d*d)/(2*d);var elbow=a+dir*along+side*Mathf.Sqrt(Mathf.Max(0,l1*l1-along*along));
   upper.rotation=Quaternion.FromToRotation(b-a,elbow-a)*upper.rotation;
   lower.rotation=Quaternion.FromToRotation(end.position-lower.position,target-lower.position)*lower.rotation;
  }
 }
}
