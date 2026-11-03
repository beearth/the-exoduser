using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Animations;
using UnityEngine.Playables;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // Manual Generic Playables. Core counters own phase time; Core owns planar movement.
    public sealed class NativeDruidRigAnimator : IDisposable
    {
        readonly Animator animator;
        readonly Transform model,hips,leftFoot,rightFoot;
        readonly Vector3 basePosition,baseScale;
        readonly Quaternion baseRotation;
        readonly Transform[] bones;
        readonly Vector3[] positions,scales;
        readonly Quaternion[] rotations;
        readonly Dictionary<string,AnimationClip> clips=new Dictionary<string,AnimationClip>(StringComparer.OrdinalIgnoreCase);
        readonly HashSet<string> missing=new HashSet<string>();
        PlayableGraph graph; AnimationPlayableOutput output; AnimationClipPlayable playable; AnimationClip current;
        int previousTick=int.MinValue,entered; string previousRole,previousState,recoveryMove;
        bool grabbed,hasFootSample; Vector3 clipRootStart,lastLeft,lastRight;
        public string Role {get;private set;} public string Clip {get;private set;} public bool MissingClip {get;private set;}
        public NativeDruidRigPolicy.Plan Phase {get;private set;}
        public float SampleSeconds {get;private set;} public float FootDeltaCm {get;private set;}
        public Vector3 LeftFoot {get{return leftFoot==null?Vector3.zero:leftFoot.position;}}
        public Vector3 RightFoot {get{return rightFoot==null?Vector3.zero:rightFoot.position;}}
        public float ChestPulse {get{return Phase.Name=="heart_beat"?.6f+.4f*Mathf.Pow(Mathf.Sin((float)(Phase.Frame/60)*Mathf.PI),2):1;}}
        public int MissingStates {get{return missing.Count;}}
        public bool Humanoid {get{return animator.isHuman;}}
        public bool AvatarValid {get{return animator.avatar!=null&&animator.avatar.isValid;}}
        public string[] AvailableClips {get{return new List<string>(clips.Keys).ToArray();}}
        public NativeDruidRigAnimator(GameObject source,string resource)
        {
            model=source.transform; animator=source.GetComponent<Animator>()??source.AddComponent<Animator>();
            animator.applyRootMotion=false; animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;
            foreach(var clip in Resources.LoadAll<AnimationClip>(resource))
            {
                if(clip.name.StartsWith("__preview__",StringComparison.Ordinal))continue;
                foreach(string key in NativeDruidRigPolicy.AllClips)
                    if(clip.name.Equals(key,StringComparison.OrdinalIgnoreCase)||clip.name.EndsWith("|"+key,StringComparison.OrdinalIgnoreCase))clips[key]=clip;
            }
            basePosition=model.localPosition;baseRotation=model.localRotation;baseScale=model.localScale;
            bones=source.GetComponentsInChildren<Transform>(true);positions=new Vector3[bones.Length];rotations=new Quaternion[bones.Length];scales=new Vector3[bones.Length];
            for(int i=0;i<bones.Length;i++)
            {
                positions[i]=bones[i].localPosition;rotations[i]=bones[i].localRotation;scales[i]=bones[i].localScale;
                if(bones[i].name=="Hips")hips=bones[i];if(bones[i].name=="LeftFoot")leftFoot=bones[i];if(bones[i].name=="RightFoot")rightFoot=bones[i];
            }
            graph=PlayableGraph.Create("Druid Core tick Generic");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);
            output=AnimationPlayableOutput.Create(graph,"Druid Animator",animator);graph.Play();
        }
        void ResetRoot(){model.localPosition=basePosition;model.localRotation=baseRotation;model.localScale=baseScale;}
        public void Sample(DruidData data,int tick,bool moving,bool frozen)
        {
            if(previousTick==tick||frozen)return;
            string state=data==null?null:data.S;
            if(state!=previousState&&(state=="bossGrabWind"||state=="idle"))grabbed=false;
            if(state=="bossGrab")grabbed=true;
            string skill=NativeDruidRigPolicy.StateMove(state);if(skill!=null)recoveryMove=skill;
            var plan=NativeDruidRigPolicy.Select(data,moving,grabbed,recoveryMove);
            string role=plan.Name+(plan.Held?" (held)":"");
            if(role!=previousRole){entered=tick;previousRole=role;hasFootSample=false;}
            Phase=plan;Role=role;MissingClip=plan.Held||!clips.ContainsKey(plan.Name);
            if(MissingClip&&missing.Add((data==null?"":data.RmMoveId)+":"+state))Debug.Log("[DruidRig] no authored action for "+state+"; hold Idle@0");
            string desired=MissingClip?"Idle":plan.Name;AnimationClip clip;
            ResetRoot();
            if(!clips.TryGetValue(desired,out clip))
            {
                MissingClip=true;Clip="bind";animator.enabled=false;
                for(int i=0;i<bones.Length;i++){bones[i].localPosition=positions[i];bones[i].localRotation=rotations[i];bones[i].localScale=scales[i];}
            }
            else
            {
                animator.enabled=true;
                if(current!=clip)
                {
                    if(playable.IsValid())graph.DestroyPlayable(playable);
                    playable=AnimationClipPlayable.Create(graph,clip);playable.SetApplyFootIK(false);playable.SetApplyPlayableIK(false);playable.SetSpeed(0);output.SetSourcePlayable(playable);current=clip;
                    playable.SetTime(0);graph.Evaluate(0);ResetRoot();clipRootStart=hips==null?Vector3.zero:model.InverseTransformPoint(hips.position);
                }
                double time=MissingClip?0:plan.Loop?((tick-entered)/60.0)%Math.Max(.0001,clip.length):plan.Frame/60.0;
                SampleSeconds=(float)Math.Max(0,Math.Min(clip.length,time));playable.SetTime(SampleSeconds);graph.Evaluate(0);ResetRoot();
                if(plan.StripHorizontalRoot&&hips!=null)
                {
                    var delta=model.InverseTransformPoint(hips.position)-clipRootStart;
                    model.position-=model.TransformVector(new Vector3(delta.x,0,delta.z));
                }
                Clip=MissingClip?"Idle@0 (held)":clip.name;
            }
            FootDeltaCm=hasFootSample?Mathf.Max(Vector3.Distance(LeftFoot,lastLeft),Vector3.Distance(RightFoot,lastRight))*100:0;
            lastLeft=LeftFoot;lastRight=RightFoot;hasFootSample=true;previousTick=tick;previousState=state;
        }
        public void Dispose(){if(graph.IsValid())graph.Destroy();}
    }
}
