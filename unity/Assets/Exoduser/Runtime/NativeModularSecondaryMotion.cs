using System;
using System.Collections.Generic;
using UnityEngine;
namespace Exoduser.UnityPort {
 [DefaultExecutionOrder(110)]
 public sealed class NativeModularSecondaryMotion : MonoBehaviour {
  sealed class Spring {public Transform bone;public Quaternion rest;public Vector2 angle,velocity;public bool hair;}
  sealed class Follow {public Transform bone,upper,lower,parent;public Quaternion rest;public Vector3 direction;public float amount;}
  Spring[] springs;Follow[] followers;
  Vector3 lastPosition,lastVelocity;float lastYaw;bool initialized;
  void Awake(){Bind();}
  void Bind(){
   if(springs!=null)return;
   var names=new Dictionary<string,Transform>(StringComparer.Ordinal);
   foreach(var bone in GetComponentsInChildren<Transform>(true))names[bone.name]=bone;
   var cloth=new List<Spring>();
   foreach(var pair in names){bool hair=pair.Key.StartsWith("RigHair_",StringComparison.Ordinal);
    if(hair||pair.Key.StartsWith("Cape_",StringComparison.Ordinal))cloth.Add(new Spring{bone=pair.Value,rest=pair.Value.localRotation,hair=hair});
   }
   var follow=new List<Follow>();
   void Add(string name,string upper,string lower,float amount){
    if(!names.TryGetValue(name,out var bone)||!names.TryGetValue(upper,out var a)||!names.TryGetValue(lower,out var b)||bone.parent==null)return;
    follow.Add(new Follow{bone=bone,upper=a,lower=b,parent=bone.parent,rest=bone.localRotation,
     direction=bone.parent.InverseTransformDirection(b.position-a.position).normalized,amount=amount});
   }
   foreach(string side in new[]{"Left","Right"}){
    Add("Modular_Pauldron_"+side,side+"Arm",side+"ForeArm",.45f);
    Add("Modular_Tasset_"+side+"Front",side+"UpLeg",side+"Leg",.9f);
    Add("Modular_Tasset_"+side+"Back",side+"UpLeg",side+"Leg",.35f);
   }
   springs=cloth.ToArray();followers=follow.ToArray();
  }
  public void ResetState(){Bind();initialized=false;foreach(var spring in springs){spring.angle=spring.velocity=Vector2.zero;spring.bone.localRotation=spring.rest;}}
  void LateUpdate(){
   Bind();
   foreach(var follow in followers){
    var baseline=follow.parent.TransformDirection(follow.direction);var actual=follow.lower.position-follow.upper.position;
    if(actual.sqrMagnitude<.000001f)continue;
    var delta=Quaternion.FromToRotation(baseline,actual.normalized);
    follow.bone.rotation=Quaternion.Slerp(Quaternion.identity,delta,follow.amount)*(follow.parent.rotation*follow.rest);
   }
   float dt=Mathf.Min(Time.deltaTime,.0333333f);if(dt<=0)return;
   var position=transform.position;float yaw=transform.eulerAngles.y;
   if(!initialized||Vector3.Distance(position,lastPosition)>2){lastPosition=position;lastVelocity=Vector3.zero;lastYaw=yaw;initialized=true;return;}
   var speed=(position-lastPosition)/dt;var acceleration=transform.InverseTransformDirection((speed-lastVelocity)/dt);
   float turn=Mathf.DeltaAngle(lastYaw,yaw)/dt;
   int steps=Mathf.Max(1,Mathf.CeilToInt(dt*120));float h=dt/steps;
   foreach(var spring in springs){
    float limit=spring.hair?6:10;
    var target=new Vector2(Mathf.Clamp(-acceleration.z*.12f,-limit,limit),Mathf.Clamp(acceleration.x*.1f-turn*.008f,-limit,limit));
    for(int step=0;step<steps;step++){
     spring.velocity+=(target-spring.angle)*(spring.hair?120:75)*h;spring.velocity*=Mathf.Exp(-14*h);
     spring.angle=Vector2.ClampMagnitude(spring.angle+spring.velocity*h,limit);
    }
    spring.bone.localRotation=spring.rest*Quaternion.Euler(spring.angle.x,0,spring.angle.y);
   }
   lastPosition=position;lastVelocity=speed;lastYaw=yaw;
  }
 }
}
