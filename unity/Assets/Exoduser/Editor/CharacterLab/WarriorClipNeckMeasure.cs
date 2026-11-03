using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using UnityEditor;
using UnityEngine;
namespace Exoduser.CharacterLab {
 // 에디터 배치 전용 측정. Player/빌드/런타임 코드 아님. Warrior_Locomotion.controller가 참조하는 클립만 읽고
 // neck·Head 뼈의 rest 대비 앞숙임(캐릭터 오른쪽 축 기준 +각 = 앞으로 숙임) 최대값을 잰다.
 public static class WarriorClipNeckMeasure {
  const string Dir="Assets/Exoduser/Art/Characters/Warrior";
  static float Twist(Quaternion q,Vector3 axis){
   axis.Normalize();
   float projection=Vector3.Dot(new Vector3(q.x,q.y,q.z),axis);
   float angle=2f*Mathf.Atan2(projection,q.w)*Mathf.Rad2Deg;
   while(angle>180f)angle-=360f;while(angle<-180f)angle+=360f;
   return angle;
  }
  public static void Run(){
   string output="I:/EXODUSER-Storage/char-modular/sonnet";var args=Environment.GetCommandLineArgs();
   for(int i=0;i<args.Length-1;i++)if(args[i]=="-output")output=args[i+1];
   AssetDatabase.Refresh();
   var prefab=AssetDatabase.LoadAssetAtPath<GameObject>(Dir+"/Warrior.prefab");
   var controller=prefab.GetComponent<Animator>().runtimeAnimatorController;
   var clips=controller.animationClips.Distinct().ToArray();
   var instance=(GameObject)PrefabUtility.InstantiatePrefab(prefab);
   var text=new StringBuilder();
   try {
    instance.transform.SetPositionAndRotation(Vector3.zero,Quaternion.identity);instance.transform.localScale=Vector3.one;
    var animator=instance.GetComponent<Animator>();animator.applyRootMotion=false;
    var neck=animator.GetBoneTransform(HumanBodyBones.Neck);var head=animator.GetBoneTransform(HumanBodyBones.Head);
    if(neck==null||head==null)throw new InvalidOperationException("neck/Head bone missing");
    var restNeck=neck.localRotation;var restHead=head.localRotation;
    var rightNeck=Quaternion.Inverse(neck.parent.rotation)*Vector3.right;
    var rightHead=Quaternion.Inverse(neck.rotation)*Vector3.right;
    text.AppendLine("{\"prefab\":\""+Dir+"/Warrior.prefab\",\"controller\":\""+controller.name+"\",\"sign\":\"positive = forward bow about character right axis\",\"clips\":[");
    for(int c=0;c<clips.Length;c++){
     var clip=clips[c];float neckMax=-999,neckMin=999,headMax=-999,headMin=999,sumMax=-999,sumNeck=0,sumHead=0,sumTime=0;int frames=0;
     float step=1f/60f;
     for(float t=0;t<=clip.length+1e-4f;t+=step){
      neck.localRotation=restNeck;head.localRotation=restHead;
      clip.SampleAnimation(instance,Mathf.Min(t,clip.length));
      float n=Twist(neck.localRotation*Quaternion.Inverse(restNeck),rightNeck);
      float h=Twist(head.localRotation*Quaternion.Inverse(restHead),rightHead);
      neckMax=Mathf.Max(neckMax,n);neckMin=Mathf.Min(neckMin,n);headMax=Mathf.Max(headMax,h);headMin=Mathf.Min(headMin,h);
      if(n+h>sumMax){sumMax=n+h;sumNeck=n;sumHead=h;sumTime=t;}
      frames++;
     }
     text.Append("{\"clip\":\""+clip.name+"\",\"length\":"+clip.length.ToString("R")+",\"frames\":"+frames+",\"humanMotion\":"+(clip.isHumanMotion?"true":"false")+
      ",\"neckForwardMaxDeg\":"+neckMax.ToString("F3")+",\"neckBackMaxDeg\":"+(-neckMin).ToString("F3")+
      ",\"headForwardMaxDeg\":"+headMax.ToString("F3")+",\"headBackMaxDeg\":"+(-headMin).ToString("F3")+
      ",\"sumForwardMaxDeg\":"+sumMax.ToString("F3")+",\"sumNeckDeg\":"+sumNeck.ToString("F3")+",\"sumHeadDeg\":"+sumHead.ToString("F3")+",\"sumTime\":"+sumTime.ToString("F3")+"}");
     text.AppendLine(c<clips.Length-1?",":"");
    }
    text.AppendLine("]}");
   } finally {UnityEngine.Object.DestroyImmediate(instance);}
   Directory.CreateDirectory(output);File.WriteAllText(Path.Combine(output,"clip-neck-head.json"),text.ToString());
   Debug.Log("WARRIOR_CLIP_NECK_MEASURE_DONE clips="+clips.Length);
   EditorApplication.Exit(0);
  }
 }
}
