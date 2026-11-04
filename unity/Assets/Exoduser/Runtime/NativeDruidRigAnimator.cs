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
        readonly Transform model,hips,leftFoot,rightFoot,omLift,huskLeftFoot,huskRightFoot;
        readonly Vector3 basePosition,baseScale;
        readonly Quaternion baseRotation;
        readonly Transform[] bones;
        readonly Vector3[] positions,scales;
        readonly Quaternion[] rotations;
        readonly Dictionary<string,AnimationClip> clips=new Dictionary<string,AnimationClip>(StringComparer.OrdinalIgnoreCase);
        readonly HashSet<string> missing=new HashSet<string>();
        // v9.1 state layer: the 1-frame state_P1/2/3 clips own these bones (old-man lift/hide, husk root scale, husk plate/skull/crown hinges); the 31 skill clips only carry the P1 constants for them.
        readonly int[] overlayIndex; readonly Dictionary<string,OverlayPose> overlays=new Dictionary<string,OverlayPose>();
        sealed class OverlayPose {public Vector3[] position,scale; public Quaternion[] rotation;}
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
        // Extra uniform scale of the old-man subtree (OM_Lift) relative to the root scale, set by the view before Sample (1 = authored proportion to the husk).
        public float OldManScale {get;set;}=1;
        public Vector3 OldManLeftFoot {get{return leftFoot==null?Vector3.zero:leftFoot.position;}}
        public Vector3 HuskLeftFoot {get{return huskLeftFoot==null?Vector3.zero:huskLeftFoot.position;}}
        public Vector3 HuskRightFoot {get{return huskRightFoot==null?Vector3.zero:huskRightFoot.position;}}
        public string Overlay {get;private set;}
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
                if(bones[i].name=="OM_Lift")omLift=bones[i];if(bones[i].name=="HK_LeftFoot")huskLeftFoot=bones[i];if(bones[i].name=="HK_RightFoot")huskRightFoot=bones[i];
            }
            var owned=new List<int>();
            for(int i=0;i<bones.Length;i++)if(IsOverlayBone(bones[i].name))owned.Add(i);
            overlayIndex=owned.ToArray();
            graph=PlayableGraph.Create("Druid Core tick Generic");graph.SetTimeUpdateMode(DirectorUpdateMode.Manual);
            output=AnimationPlayableOutput.Create(graph,"Druid Animator",animator);graph.Play();
            CaptureOverlays();
        }
        // OM_Lift/OM_Staff hide or lift the old man, HK_Root scales the husk, HP_* hinge its parts. Names come from the v9.1 rig table (PREP section 10).
        static bool IsOverlayBone(string name){return name=="OM_Lift"||name=="OM_Staff"||name=="HK_Root"||name.StartsWith("HP_",StringComparison.Ordinal);}
        public bool HasOverlays {get{return overlays.Count==NativeDruidRigPolicy.StateClips.Length&&overlayIndex.Length>=9;}}
        void ResetBones(){for(int i=0;i<bones.Length;i++){bones[i].localPosition=positions[i];bones[i].localRotation=rotations[i];bones[i].localScale=scales[i];}}
        // The state clips are one constant frame each: sample them once at construction and keep the bone values.
        void CaptureOverlays()
        {
            foreach(string state in NativeDruidRigPolicy.StateClips)
            {
                AnimationClip clip;if(!clips.TryGetValue(state,out clip))continue;
                var temporary=AnimationClipPlayable.Create(graph,clip);temporary.SetApplyFootIK(false);temporary.SetApplyPlayableIK(false);temporary.SetSpeed(0);output.SetSourcePlayable(temporary);temporary.SetTime(0);
                ResetRoot();graph.Evaluate(0);ResetRoot();
                var pose=new OverlayPose{position=new Vector3[overlayIndex.Length],rotation=new Quaternion[overlayIndex.Length],scale=new Vector3[overlayIndex.Length]};
                for(int k=0;k<overlayIndex.Length;k++){var bone=bones[overlayIndex[k]];pose.position[k]=bone.localPosition;pose.rotation[k]=bone.localRotation;pose.scale[k]=bone.localScale;}
                overlays[state]=pose;graph.DestroyPlayable(temporary);
            }
            ResetBones();ResetRoot();
        }
        void ApplyOverlay(string state)
        {
            OverlayPose pose;Overlay=state;
            if(state!=null&&overlays.TryGetValue(state,out pose))
                for(int k=0;k<overlayIndex.Length;k++){var bone=bones[overlayIndex[k]];bone.localPosition=pose.position[k];bone.localRotation=pose.rotation[k];bone.localScale=pose.scale[k];}
            if(omLift!=null&&Mathf.Abs(OldManScale-1)>.00001f){omLift.localScale*=OldManScale;omLift.localPosition*=OldManScale;}   // the old man grows about his own origin and keeps the authored distance in his own body lengths (P3: 2.7 m in front of the husk origin)
        }
        void ResetRoot(){model.localPosition=basePosition;model.localRotation=baseRotation;model.localScale=baseScale;}
        NativeDruidRigPolicy.Plan? forcedPlan; bool remodel=true; int collapseElapsed=-1;
        // remodel/collapseElapsed come from Simulation.DruidLife (Core, read only); forced = the view's intro/death clip plan (null = Core-selected action).
        public void Configure(bool remodel,int collapseElapsed,NativeDruidRigPolicy.Plan? forced){this.remodel=remodel;this.collapseElapsed=collapseElapsed;forcedPlan=forced;}
        // The plan Sample() will play for this Core state, without mutating anything (the view needs it first to pick the scale).
        public NativeDruidRigPolicy.Plan PlanFor(DruidData data,bool moving)
        {
            if(forcedPlan.HasValue)return forcedPlan.Value;
            string state=data==null?null:data.S;bool g=grabbed;string recovery=recoveryMove;
            if(state!=previousState&&(state=="bossGrabWind"||state=="idle"))g=false;
            if(state=="bossGrab")g=true;
            string skill=NativeDruidRigPolicy.StateMove(state);if(skill!=null)recovery=skill;
            return NativeDruidRigPolicy.Select(data,moving,g,recovery,remodel,collapseElapsed);
        }
        public void Sample(DruidData data,int tick,bool moving,bool frozen)
        {
            if(frozen)return;
            // The scale factor is applied on every call; the pose itself is only resampled when the Core tick or the selected clip/frame changed.
            if(previousTick==tick&&!forcedPlan.HasValue)return;
            if(previousTick==tick&&forcedPlan.HasValue&&Phase.Name==forcedPlan.Value.Name&&Math.Abs(Phase.Frame-forcedPlan.Value.Frame)<.0001)return;
            string state=data==null?null:data.S;
            if(state!=previousState&&(state=="bossGrabWind"||state=="idle"))grabbed=false;
            if(state=="bossGrab")grabbed=true;
            string skill=NativeDruidRigPolicy.StateMove(state);if(skill!=null)recoveryMove=skill;
            var plan=forcedPlan.HasValue?forcedPlan.Value:NativeDruidRigPolicy.Select(data,moving,grabbed,recoveryMove,remodel,collapseElapsed);
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
                ApplyOverlay(plan.Transition?null:plan.Overlay);
            }
            FootDeltaCm=hasFootSample?Mathf.Max(Vector3.Distance(LeftFoot,lastLeft),Vector3.Distance(RightFoot,lastRight))*100:0;
            lastLeft=LeftFoot;lastRight=RightFoot;hasFootSample=true;previousTick=tick;previousState=state;
        }
        public void Dispose(){if(graph.IsValid())graph.Destroy();}
    }
}
