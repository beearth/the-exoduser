using System;using System.Collections.Generic;using UnityEngine;using UnityEngine.Animations;using UnityEngine.Playables;
namespace Exoduser.UnityPort
{
    // Generic Animator + manual Playables: one sample per Core tick; no wall clock/root motion authority.
    public sealed class NativeDruidRigAnimator:IDisposable
    {
        readonly Animator animator;readonly Transform model;readonly Vector3 basePosition,baseScale;readonly Quaternion baseRotation;
        readonly Transform[] bones;readonly Vector3[] positions,scales;readonly Quaternion[] rotations;
        readonly Dictionary<string,AnimationClip> clips=new Dictionary<string,AnimationClip>(StringComparer.OrdinalIgnoreCase);
        readonly HashSet<string> missing=new HashSet<string>();
        PlayableGraph graph;AnimationPlayableOutput output;AnimationClipPlayable playable;AnimationClip current;
        int previousTick=int.MinValue,entered;string previousRole;
        public string Role {get;private set;}public string Clip {get;private set;}public bool MissingClip {get;private set;}
        public int MissingStates {get{return missing.Count;}}public bool Humanoid {get{return animator.isHuman;}}public bool AvatarValid {get{return animator.avatar!=null&&animator.avatar.isValid;}}
        public string[] AvailableClips {get{return new List<string>(clips.Keys).ToArray();}}
        public NativeDruidRigAnimator(GameObject source,string resource)
        {
            model=source.transform;animator=source.GetComponent<Animator>()??source.AddComponent<Animator>();animator.applyRootMotion=false;animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;
            foreach(var clip in Resources.LoadAll<AnimationClip>(resource))
            {
                if(clip.name.StartsWith("__preview__",StringComparison.Ordinal))continue;
                foreach(string key in new[]{"Idle","Walk","Run"})if(clip.name.Equals(key,StringComparison.OrdinalIgnoreCase)||clip.name.EndsWith("|"+key,StringComparison.OrdinalIgnoreCase)||clip.name.EndsWith("_"+key,StringComparison.OrdinalIgnoreCase))clips[key]=clip;
            }
            basePosition=model.localPosition;baseRotation=model.localRotation;baseScale=model.localScale;
            bones=source.GetComponentsInChildren<Transform>(true);positions=new Vector3[bones.Length];rotations=new Quaternion[bones.Length];scales=new Vector3[bones.Length];
            for(int i=0;i<bones.Length;i++){positions[i]=bones[i].localPosition;rotations[i]=bones[i].localRotation;scales[i]=bones[i].localScale;}
            graph=PlayableGraph.Create("Druid Core tick Generic");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);output=AnimationPlayableOutput.Create(graph,"Druid Animator",animator);graph.Play();
        }
        public void Sample(string state,string move,int tick,bool moving,bool frozen)
        {
            if(previousTick==tick||frozen)return;
            string role=NativeDruidRigPolicy.Role(state);
            if(state=="idle"&&moving)role="Walk";
            if(role!=previousRole){entered=tick;previousRole=role;}
            Role=role;MissingClip=role=="Hold"||!clips.ContainsKey(role);
            if(MissingClip&&missing.Add((move??"")+":"+state))Debug.Log("[DruidRig] no authored action for "+state+"/"+move+"; hold Idle@0 or bind pose");
            string desired=MissingClip?"Idle":role;AnimationClip clip;
            if(!clips.TryGetValue(desired,out clip))
            {
                MissingClip=true;Clip="bind";animator.enabled=false;
                for(int i=0;i<bones.Length;i++){bones[i].localPosition=positions[i];bones[i].localRotation=rotations[i];bones[i].localScale=scales[i];}
            }
            else
            {
                animator.enabled=true;
                if(current!=clip){if(playable.IsValid())graph.DestroyPlayable(playable);playable=AnimationClipPlayable.Create(graph,clip);playable.SetApplyFootIK(false);playable.SetApplyPlayableIK(false);playable.SetSpeed(0);output.SetSourcePlayable(playable);current=clip;}
                double time=MissingClip?0:((tick-entered)/60.0)%Math.Max(.0001,clip.length);
                playable.SetTime(time);graph.Evaluate(0);Clip=MissingClip?"Idle@0 (held)":clip.name;
            }
            model.localPosition=basePosition;model.localRotation=baseRotation;model.localScale=baseScale;previousTick=tick;
        }
        public void Dispose(){if(graph.IsValid())graph.Destroy();}
    }
}
