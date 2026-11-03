using System;using System.Collections.Generic;using UnityEngine;using UnityEngine.Animations;using UnityEngine.Playables;
namespace Exoduser.UnityPort {
 // Generic Animator driven by Core ticks, not wall time or root motion. Empty slots stay at bind pose.
 public sealed class NativeEnemyRigAnimator:IDisposable {
  readonly Animator animator;readonly GameObject model;readonly EnemyRigDefinition definition;
  readonly Dictionary<string,AnimationClip> clips=new Dictionary<string,AnimationClip>(StringComparer.OrdinalIgnoreCase);
  readonly Transform[] bones;readonly Vector3[] positions,scales;readonly Quaternion[] rotations;
  PlayableGraph graph;AnimationPlayableOutput output;AnimationClipPlayable current;AnimationClip clip;
  public EnemyRigState State {get;private set;}public int MissingStates {get;private set;}readonly HashSet<EnemyRigState> missing=new HashSet<EnemyRigState>();
  public NativeEnemyRigAnimator(GameObject model,EnemyRigDefinition definition){
   this.model=model;this.definition=definition;animator=model.GetComponent<Animator>()??model.AddComponent<Animator>();animator.applyRootMotion=false;animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;
   foreach(var c in Resources.LoadAll<AnimationClip>(definition.modelResource))if(!c.name.StartsWith("__preview__",StringComparison.Ordinal)){clips[c.name]=c;int cut=c.name.LastIndexOf('|');if(cut>=0)clips[c.name.Substring(cut+1)]=c;}
   bones=model.GetComponentsInChildren<Transform>(true);positions=new Vector3[bones.Length];scales=new Vector3[bones.Length];rotations=new Quaternion[bones.Length];
   for(int i=0;i<bones.Length;i++){positions[i]=bones[i].localPosition;scales[i]=bones[i].localScale;rotations[i]=bones[i].localRotation;}
   graph=PlayableGraph.Create("Enemy Core tick "+model.name);graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);output=AnimationPlayableOutput.Create(graph,"Generic Animator",animator);graph.Play();
  }
  public void Sample(EnemyRigSample sample,double distance){
   State=sample.State;string name=definition.Clip(State);AnimationClip desired=null;if(!string.IsNullOrEmpty(name))clips.TryGetValue(name,out desired);
   if(desired==null){if(missing.Add(State)){MissingStates++;Debug.LogWarning("[EnemyRig] "+definition.modelResource+" missing "+State+" clip; bind pose until authored");}animator.enabled=false;Restore();return;}
   animator.enabled=true;if(desired!=clip){if(current.IsValid())graph.DestroyPlayable(current);current=AnimationClipPlayable.Create(graph,desired);current.SetApplyFootIK(false);current.SetApplyPlayableIK(false);current.SetSpeed(0);output.SetSourcePlayable(current);clip=desired;}
   double progress=State==EnemyRigState.Move?distance/Math.Max(1,definition.stride):State==EnemyRigState.Death?Math.Min(1,(double)sample.Age/Math.Max(1,definition.deathTicks)):sample.Normalized;
   if(State==EnemyRigState.Move||State==EnemyRigState.Idle)progress-=Math.Floor(progress);
   current.SetTime(progress*Math.Max(.0001,clip.length));graph.Evaluate(0);
   // A clip cannot move/resize the presentation root away from the Core anchor.
   model.transform.localPosition=positions[0];model.transform.localRotation=rotations[0];model.transform.localScale=scales[0];
  }
  void Restore(){for(int i=0;i<bones.Length;i++)if(bones[i]!=null){bones[i].localPosition=positions[i];bones[i].localRotation=rotations[i];bones[i].localScale=scales[i];}}
  public void Dispose(){if(graph.IsValid())graph.Destroy();}
 }
}
