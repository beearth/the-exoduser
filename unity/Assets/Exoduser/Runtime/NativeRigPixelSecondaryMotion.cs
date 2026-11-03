using System;
using System.Collections.Generic;
using UnityEngine;
namespace Exoduser.UnityPort {
 // Small damped secondary rotations on separated cloth/hair weights, after the 24-bone pose.
 [DefaultExecutionOrder(110)]
 public sealed class NativeRigPixelSecondaryMotion : MonoBehaviour {
  Transform[] bones;Quaternion[] rest;Vector2[] angle,velocity;Vector3 lastPosition,lastVelocity;float lastYaw;bool initialized;
  void Bind(){
   if(bones!=null)return;var list=new List<Transform>();foreach(var t in GetComponentsInChildren<Transform>(true))if(t.name.StartsWith("RigCloth_",StringComparison.Ordinal)||t.name.StartsWith("RigHair_",StringComparison.Ordinal))list.Add(t);
   bones=list.ToArray();rest=new Quaternion[bones.Length];angle=new Vector2[bones.Length];velocity=new Vector2[bones.Length];for(int i=0;i<bones.Length;i++)rest[i]=bones[i].localRotation;
  }
  public void ResetState(){Bind();initialized=false;Array.Clear(angle,0,angle.Length);Array.Clear(velocity,0,velocity.Length);for(int i=0;i<bones.Length;i++)bones[i].localRotation=rest[i];}
  void LateUpdate(){
   Bind();float dt=Mathf.Min(Time.deltaTime,.05f);if(dt<=0)return;var position=transform.position;float yaw=transform.eulerAngles.y;
   if(!initialized||Vector3.Distance(position,lastPosition)>2){lastPosition=position;lastYaw=yaw;lastVelocity=Vector3.zero;initialized=true;return;}
   var speed=(position-lastPosition)/dt;var acceleration=transform.InverseTransformDirection((speed-lastVelocity)/dt);
   float turn=Mathf.DeltaAngle(lastYaw,yaw)/dt;int steps=Mathf.Max(1,Mathf.CeilToInt(dt*120));float h=dt/steps;
   for(int i=0;i<bones.Length;i++){
    bool hair=bones[i].name.StartsWith("RigHair_",StringComparison.Ordinal);float limit=hair?12:18;
    var target=new Vector2(Mathf.Clamp(-acceleration.z*.35f,-limit,limit),Mathf.Clamp(acceleration.x*.25f-turn*.018f,-limit,limit));
    for(int j=0;j<steps;j++){velocity[i]+=(target-angle[i])*(hair?100:80)*h;velocity[i]*=Mathf.Exp(-12*h);angle[i]+=velocity[i]*h;angle[i]=Vector2.ClampMagnitude(angle[i],limit);}
    bones[i].localRotation=rest[i]*Quaternion.Euler(angle[i].x,0,angle[i].y);
   }
   lastPosition=position;lastVelocity=speed;lastYaw=yaw;
  }
 }
}
