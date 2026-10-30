using System;
#if UNITY_5_3_OR_NEWER
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
#endif
namespace Exoduser.UnityPort
{
    public enum HeroMotionKind { Idle,Run,Roll,Swing,Recover,Charge,SlamWindup,SlamStrike,SlamRecover,Cast,Hurt,Dead,Guard,Bash,BashRecover }
    public struct HeroMotionInput
    {
        public string State;
        public int Tick,Combo,SkillCastCount;
        public float RemainingTicks,RollRemaining,EffectiveHealth,Charge;
        public bool Rolling,Moving,KiAttack;
    }
    public struct HeroMotionSample { public HeroMotionKind Kind; public float Phase,ContactPhase; public int Combo; }
    public sealed class NativeHeroMotionClock
    {
        int lastTick=-1,enteredTick,deathTick,skillTick=-1000,hurtTick=-1000,lastCast,basicCombo;
        string previousState;
        float previousHealth,recoveryLength=1;
        bool initialized,wasDying;
        public void Reset() { initialized=false;wasDying=false;lastTick=-1;previousState=null;skillTick=hurtTick=-1000;basicCombo=0; }
        static float Clamp(float v) => float.IsNaN(v)||float.IsInfinity(v)?0:Math.Max(0,Math.Min(1,v));
        static float Smooth(float t){t=Clamp(t);return t*t*(3-2*t);}
        public static float PoseWeight(HeroMotionSample sample)
        {
            float t=Clamp(sample.Phase);
            switch(sample.Kind)
            {
                case HeroMotionKind.Idle:case HeroMotionKind.Run:return 0;
                case HeroMotionKind.Recover:case HeroMotionKind.BashRecover:case HeroMotionKind.SlamRecover:return 1-Smooth((t-.5f)*2);
                case HeroMotionKind.Cast:case HeroMotionKind.Roll:return t<=0||t>=1?0:(float)Math.Sin(t*Math.PI);
                case HeroMotionKind.Hurt:return 1-Smooth(t);
                default:return 1;
            }
        }
        public static float RollLowering(float phase)
        {
            float t=Clamp(phase);if(t<=0||t>=1)return 0;
            float wave=(float)Math.Sin(t*Math.PI);return .20f*wave*wave;
        }
        public static float LocomotionTime(int coreTick,float clipSeconds,bool moving)
        {
            if(!moving||coreTick<=0||float.IsNaN(clipSeconds)||float.IsInfinity(clipSeconds)||clipSeconds<=0)return 0;
            return (float)((coreTick/(60d*clipSeconds))%1d);
        }
        public static float RollTuckWeight(float phase)
        {
            float t=Clamp(phase);return Smooth(t/.15f)*Smooth((1-t)/.15f);
        }
        public static void TuckFootOffset(float legLength,out float down,out float back)
        {
            float length=float.IsNaN(legLength)||float.IsInfinity(legLength)?0:Math.Max(0,legLength);
            down=length*.20f;back=length*.10f;
        }
        public HeroMotionSample Evaluate(HeroMotionInput q)
        {
            if(initialized&&q.Tick<lastTick)Reset();
            bool fresh=!initialized;
            if(fresh){previousHealth=q.EffectiveHealth;lastCast=q.SkillCastCount;previousState=null;}
            bool dying=q.State=="dead"||q.State=="fallen"||q.EffectiveHealth<=0;
            if(dying&&!wasDying)deathTick=q.Tick;
            wasDying=dying;
            if(q.State!=previousState)
            {
                enteredTick=q.Tick;
                if(q.State=="wRecover"||q.State=="sRecover")recoveryLength=Math.Max(1,q.RemainingTicks);
                if(q.State=="wSwing"&&!q.KiAttack)basicCombo=basicCombo%3+1;
            }
            if(!fresh&&q.Tick!=lastTick)
            {
                if(q.EffectiveHealth<previousHealth-.001f)hurtTick=q.Tick;
                if(q.SkillCastCount!=lastCast)skillTick=q.Tick;
            }
            previousState=q.State;previousHealth=q.EffectiveHealth;lastCast=q.SkillCastCount;lastTick=q.Tick;initialized=true;
            var s=new HeroMotionSample {Kind=HeroMotionKind.Idle,Combo=q.KiAttack?Math.Max(1,Math.Min(3,q.Combo)):Math.Max(1,basicCombo),ContactPhase=q.KiAttack?0:.4f};
            if(dying){s.Kind=HeroMotionKind.Dead;s.Phase=Clamp((q.Tick-deathTick)/48f);return s;}
            if(q.Rolling){s.Kind=HeroMotionKind.Roll;s.Phase=Clamp(1-q.RollRemaining/18f);return s;}
            switch(q.State)
            {
                case "wSwing":s.Kind=HeroMotionKind.Swing;s.Phase=Clamp((5-q.RemainingTicks)/5f);break;
                case "wRecover":s.Kind=HeroMotionKind.Recover;s.Phase=Clamp(1-q.RemainingTicks/recoveryLength);break;
                case "sRecover":s.Kind=HeroMotionKind.BashRecover;s.Phase=Clamp(1-q.RemainingTicks/recoveryLength);break;
                case "sBash":s.Kind=HeroMotionKind.Bash;s.Phase=Clamp(1-q.RemainingTicks/20f);s.ContactPhase=.4f;break;
                case "wWindup":case "kiGather":case "sDraw":s.Kind=HeroMotionKind.Charge;s.Phase=Clamp(q.Charge/120f);break;
                case "gSlamWindup":s.Kind=HeroMotionKind.SlamWindup;s.Phase=Clamp(1-q.RemainingTicks/10f);break;
                case "gSlam1":s.Kind=HeroMotionKind.SlamStrike;s.Phase=Clamp(1-q.RemainingTicks/10f);break;
                case "gSlamRecover":s.Kind=HeroMotionKind.SlamRecover;s.Phase=Clamp(1-q.RemainingTicks/12f);break;
                case "stagger":case "pStun":s.Kind=HeroMotionKind.Hurt;s.Phase=Clamp((q.Tick-enteredTick)/18f);break;
                case "sBlock":case "peaceShield":s.Kind=HeroMotionKind.Guard;break;
                case "iceOrb":s.Kind=HeroMotionKind.Cast;s.Phase=Clamp((q.Tick-enteredTick)/18f);break;
                default:
                    if(q.Tick-hurtTick<12){s.Kind=HeroMotionKind.Hurt;s.Phase=Clamp((q.Tick-hurtTick)/12f);}
                    else if(q.Tick-skillTick<18){s.Kind=HeroMotionKind.Cast;s.Phase=Clamp((q.Tick-skillTick)/18f);}
                    else if(q.Moving)s.Kind=HeroMotionKind.Run;
                    break;
            }
            return s;
        }
    }

#if UNITY_5_3_OR_NEWER
    /// <summary>Core를 읽는 전사 표현. 루트 위치·방향·충돌·판정의 writer는 NativeGame이다.</summary>
    [DefaultExecutionOrder(90)]
    public sealed class NativeHeroMotion : MonoBehaviour
    {
        readonly NativeHeroMotionClock clock=new NativeHeroMotionClock();
        Animator animator;
        HumanPoseHandler poseHandler;
        HumanPose pose;
        Simulation observedSimulation;
        Transform rightUpper,rightFore,rightHand,leftUpper,leftFore,leftHand,socket;
        Transform hips,chest,head,leftThigh,leftShin,leftFoot,rightThigh,rightShin,rightFoot;
        SkinnedMeshRenderer bodyRenderer;
        Mesh rollBakeMesh;
        readonly List<Vector3> rollVertices=new List<Vector3>();
        int[] rollBodyIndices;
        int rollGroundTick=-1;
        float rollGroundPhase=-1,rollGroundShift;
        Quaternion leftGripRelative;
        int speedHash=Animator.StringToHash("Speed");
        readonly int runStateHash=Animator.StringToHash("Base Layer.Run"),idleStateHash=Animator.StringToHash("Base Layer.Idle"),holdStateHash=Animator.StringToHash("ArmR_HoldWeapon.HoldWeapon");
        int holdLayer=-1;
        float runSeconds=1,holdSeconds=1;
        int spineBend=-1,chestBend=-1,spineTwist=-1,chestTwist=-1;
        bool ready;
        HeroMotionSample current;
        HeroMotionInput observed;
        public HeroMotionKind MotionKind {get{return current.Kind;}}
        public float MotionPhase {get{return current.Phase;}}
        public int ComboStep {get{return current.Combo;}}

        void Awake(){Bind();}
        void Bind()
        {
            animator=GetComponent<Animator>()??GetComponentInChildren<Animator>(true);
            if(animator==null||animator.avatar==null||!animator.avatar.isValid||!animator.avatar.isHuman||animator.runtimeAnimatorController==null)return;
            animator.applyRootMotion=false;
            animator.speed=0;
            animator.cullingMode=AnimatorCullingMode.AlwaysAnimate;
            holdLayer=animator.GetLayerIndex("ArmR_HoldWeapon");
            foreach(var clip in animator.runtimeAnimatorController.animationClips)
            {
                if(clip.name=="Warrior_Run")runSeconds=clip.length;
                else if(clip.name=="Warrior_Walk_ArmR_Hold")holdSeconds=clip.length;
            }
            rightUpper=animator.GetBoneTransform(HumanBodyBones.RightUpperArm);rightFore=animator.GetBoneTransform(HumanBodyBones.RightLowerArm);rightHand=animator.GetBoneTransform(HumanBodyBones.RightHand);
            leftUpper=animator.GetBoneTransform(HumanBodyBones.LeftUpperArm);leftFore=animator.GetBoneTransform(HumanBodyBones.LeftLowerArm);leftHand=animator.GetBoneTransform(HumanBodyBones.LeftHand);
            hips=animator.GetBoneTransform(HumanBodyBones.Hips);chest=animator.GetBoneTransform(HumanBodyBones.Chest)??animator.GetBoneTransform(HumanBodyBones.Spine);head=animator.GetBoneTransform(HumanBodyBones.Head);
            leftThigh=animator.GetBoneTransform(HumanBodyBones.LeftUpperLeg);leftShin=animator.GetBoneTransform(HumanBodyBones.LeftLowerLeg);leftFoot=animator.GetBoneTransform(HumanBodyBones.LeftFoot);
            rightThigh=animator.GetBoneTransform(HumanBodyBones.RightUpperLeg);rightShin=animator.GetBoneTransform(HumanBodyBones.RightLowerLeg);rightFoot=animator.GetBoneTransform(HumanBodyBones.RightFoot);
            foreach(var t in GetComponentsInChildren<Transform>(true))if(t.name=="Socket_Weapon_R"){socket=t;break;}
            if(rightHand==null||leftHand==null||socket==null)return;
            leftGripRelative=Quaternion.Inverse(rightHand.rotation)*leftHand.rotation;
            poseHandler=new HumanPoseHandler(animator.avatar,animator.transform);
            poseHandler.GetHumanPose(ref pose);
            spineBend=Muscle("Spine Front-Back");chestBend=Muscle("Chest Front-Back");spineTwist=Muscle("Spine Twist Left-Right");chestTwist=Muscle("Chest Twist Left-Right");
            PrepareRollContact();
            ready=true;
        }
        void PrepareRollContact()
        {
            foreach(var renderer in GetComponentsInChildren<SkinnedMeshRenderer>(true))
                if(renderer.sharedMesh!=null&&(bodyRenderer==null||renderer.sharedMesh.vertexCount>bodyRenderer.sharedMesh.vertexCount))bodyRenderer=renderer;
            if(bodyRenderer==null)return;
            var mesh=bodyRenderer.sharedMesh;var bones=bodyRenderer.bones;
            var cape=new bool[bones.Length];for(int i=0;i<bones.Length;i++)cape[i]=bones[i]!=null&&bones[i].name.StartsWith("Cape_",StringComparison.Ordinal);
            var weights=mesh.isReadable?mesh.boneWeights:null;var indices=new List<int>(mesh.vertexCount);
            bool IsCape(int index,float weight){return weight>0&&index>=0&&index<cape.Length&&cape[index];}
            for(int i=0;i<mesh.vertexCount;i++)
            {
                if(weights!=null&&i<weights.Length)
                {
                    var w=weights[i];
                    if(IsCape(w.boneIndex0,w.weight0)||IsCape(w.boneIndex1,w.weight1)||IsCape(w.boneIndex2,w.weight2)||IsCape(w.boneIndex3,w.weight3))continue;
                }
                indices.Add(i);
            }
            rollBodyIndices=indices.ToArray();rollVertices.Capacity=mesh.vertexCount;
            rollBakeMesh=new Mesh{name="Hero roll body contact",hideFlags=HideFlags.HideAndDontSave};rollBakeMesh.MarkDynamic();
        }
        static int Muscle(string name){return Array.IndexOf(HumanTrait.MuscleName,name);}
        void SetMuscle(int index,float value){if(index>=0)pose.muscles[index]=Mathf.Clamp(value,-1,1);}
        void BlendMuscle(int index,float value,float weight){if(index>=0)pose.muscles[index]=Mathf.Lerp(pose.muscles[index],Mathf.Clamp(value,-1,1),weight);}
        void OnDestroy(){poseHandler?.Dispose();poseHandler=null;if(rollBakeMesh!=null){if(Application.isPlaying)Destroy(rollBakeMesh);else DestroyImmediate(rollBakeMesh);}}

        public void Sync(Simulation sim,bool moving)
        {
            if(sim==null)return;
            if(!ReferenceEquals(observedSimulation,sim)){clock.Reset();observedSimulation=sim;rollGroundTick=-1;rollGroundPhase=-1;}
            if(!ready)Bind();
            var p=sim.Player;
            observed=new HeroMotionInput {State=p.State,Tick=sim.TickCount,RemainingTicks=p.StateTicks,RollRemaining=(float)sim.RollMoveT,Rolling=sim.RollActive,Moving=moving,EffectiveHealth=p.Hp+p.Shield,Combo=sim.KiComboStep,KiAttack=sim.Config.ActiveAttack=="kiSlash",Charge=p.KiChargeActive?p.KiChargeTicks:(float)sim.KgChg,SkillCastCount=sim.SkillCastCount};
            current=clock.Evaluate(observed);
            if(ready)SampleLocomotion();
        }

        void SampleLocomotion()
        {
            // 자동 시간은 멈추고 실제 Core의 절대 tick만 표본 시각으로 쓴다.
            // 같은 tick에도 다시 표본화하므로 이전 LateUpdate의 HumanPose/IK가 누적되지 않는다.
            bool moving=observed.Moving&&current.Kind!=HeroMotionKind.Dead;
            animator.speed=0;
            animator.SetFloat(speedHash,moving?4f:0f);
            animator.Play(moving?runStateHash:idleStateHash,0,NativeHeroMotionClock.LocomotionTime(observed.Tick,runSeconds,moving));
            if(holdLayer>=0)
            {
                animator.SetLayerWeight(holdLayer,1);
                animator.Play(holdStateHash,holdLayer,NativeHeroMotionClock.LocomotionTime(observed.Tick,holdSeconds,moving));
            }
            animator.Update(0f);
        }

        struct GripPose
        {
            public Vector3 Hand,Blade;
            public float Bend,Twist,Lower;
            public GripPose(Vector3 hand,Vector3 blade,float bend=0,float twist=0,float lower=0){Hand=hand;Blade=blade;Bend=bend;Twist=twist;Lower=lower;}
        }
        static float Ease(float t){t=Mathf.Clamp01(t);return t*t*(3-2*t);}
        static GripPose Lerp(GripPose a,GripPose b,float t)
        {
            t=Ease(t);return new GripPose(Vector3.Lerp(a.Hand,b.Hand,t),Vector3.Slerp(a.Blade,b.Blade,t),Mathf.Lerp(a.Bend,b.Bend,t),Mathf.Lerp(a.Twist,b.Twist,t),Mathf.Lerp(a.Lower,b.Lower,t));
        }
        static GripPose ReadyPose(){return new GripPose(new Vector3(.24f,1.18f,.23f),new Vector3(.2f,.28f,.94f),-.08f,.05f);}
        static GripPose SwingPose(int combo,float progress,float contact)
        {
            GripPose start,hit,end;
            if(combo==3)
            {
                start=new GripPose(new Vector3(.10f,1.64f,.03f),new Vector3(.05f,.92f,-.35f),.14f,-.10f);
                hit=new GripPose(new Vector3(.05f,1.33f,.35f),new Vector3(.02f,-.68f,.73f),-.38f,.04f,.08f);
                end=new GripPose(new Vector3(.03f,1.15f,.40f),new Vector3(.02f,-.66f,.75f),-.42f,.08f,.10f);
            }
            else
            {
                float side=combo==2?-1:1;
                start=new GripPose(new Vector3(side*.30f,1.30f,.06f),new Vector3(side*.86f,.28f,-.40f),.06f,-side*.30f);
                hit=new GripPose(new Vector3(side*.12f,1.15f,.40f),new Vector3(-side*.18f,.02f,.98f),-.22f,side*.16f,.025f);
                end=new GripPose(new Vector3(-side*.12f,1.02f,.30f),new Vector3(-side*.91f,-.26f,.30f),-.18f,side*.32f,.025f);
            }
            if(contact>0&&progress<contact)return Lerp(start,hit,progress/contact);
            return Lerp(hit,end,(progress-contact)/Mathf.Max(.01f,1-contact));
        }
        static GripPose BashPose(float progress)
        {
            var start=new GripPose(new Vector3(.20f,1.22f,.10f),new Vector3(-.15f,.84f,.52f),.10f,-.18f);
            var contact=new GripPose(new Vector3(.10f,1.18f,.48f),new Vector3(-.10f,.16f,.98f),-.22f,.16f,.05f);
            var end=new GripPose(new Vector3(.08f,1.14f,.50f),new Vector3(-.12f,.08f,.99f),-.26f,.18f,.06f);
            return progress<.4f?Lerp(start,contact,progress/.4f):Lerp(contact,end,(progress-.4f)/.6f);
        }

        void LateUpdate()
        {
            if(!ready||observedSimulation==null)return;
            SampleLocomotion();
            var leftFootPosition=leftFoot!=null?leftFoot.position:Vector3.zero;var rightFootPosition=rightFoot!=null?rightFoot.position:Vector3.zero;
            var leftFootRotation=leftFoot!=null?leftFoot.rotation:Quaternion.identity;var rightFootRotation=rightFoot!=null?rightFoot.rotation:Quaternion.identity;
            // 이 Core tick의 기본포즈 위에 절대 자세를 덮는다. Core와 이동 루트에는 쓰지 않는다.
            poseHandler.GetHumanPose(ref pose);
            float t=current.Phase;
            float weight=NativeHeroMotionClock.PoseWeight(current);
            var grip=ReadyPose();bool twoHands=true;
            switch(current.Kind)
            {
                case HeroMotionKind.Idle:
                case HeroMotionKind.Run:
                    // 승인된 보행/무기 홀드 포즈를 유지하고 흉곽 호흡만 더한다.
                    SetMuscle(chestBend,Mathf.Sin(observed.Tick*.025f)*.025f);
                    poseHandler.SetHumanPose(ref pose);return;
                case HeroMotionKind.Swing:grip=SwingPose(current.Combo,t,current.ContactPhase);break;
                case HeroMotionKind.Recover:grip=Lerp(SwingPose(current.Combo,1,current.ContactPhase),ReadyPose(),t);break;
                case HeroMotionKind.Bash:grip=BashPose(t);break;
                case HeroMotionKind.BashRecover:grip=Lerp(BashPose(1),ReadyPose(),t);break;
                case HeroMotionKind.Charge:grip=Lerp(ReadyPose(),new GripPose(new Vector3(.08f,1.62f,.02f),new Vector3(.05f,.94f,-.32f),.12f,-.10f,.03f),Mathf.Min(1,.5f+t));break;
                case HeroMotionKind.SlamWindup:grip=Lerp(ReadyPose(),new GripPose(new Vector3(.05f,1.68f,.08f),new Vector3(0,.96f,-.28f),.18f,0,.025f),t);break;
                case HeroMotionKind.SlamStrike:grip=Lerp(new GripPose(new Vector3(.05f,1.68f,.08f),new Vector3(0,.96f,-.28f),.18f),new GripPose(new Vector3(.04f,1.25f,.38f),new Vector3(0,-.72f,.69f),-.44f,0,.10f),Mathf.Min(1,t/.35f));break;
                case HeroMotionKind.SlamRecover:grip=Lerp(new GripPose(new Vector3(.04f,1.25f,.38f),new Vector3(0,-.72f,.69f),-.44f,0,.10f),ReadyPose(),t);break;
                case HeroMotionKind.Guard:grip=new GripPose(new Vector3(.14f,1.25f,.30f),new Vector3(-.18f,.88f,.43f),-.15f,-.12f,.025f);break;
                case HeroMotionKind.Cast:grip=Lerp(ReadyPose(),new GripPose(new Vector3(.32f,1.20f,.15f),new Vector3(.7f,-.38f,.6f),-.15f,.12f),Mathf.Sin(t*Mathf.PI));twoHands=false;break;
                case HeroMotionKind.Hurt:grip=Lerp(new GripPose(new Vector3(.20f,1.12f,.18f),new Vector3(.55f,-.40f,.73f),.32f,-.15f,.06f),ReadyPose(),t);break;
                case HeroMotionKind.Roll:
                    grip=new GripPose(new Vector3(.12f,1.15f,.22f),new Vector3(.15f,.58f,-.8f),-.40f,0,NativeHeroMotionClock.RollLowering(t));
                    pose.bodyRotation=pose.bodyRotation*Quaternion.Euler(360*Ease(t),0,0);break;
                case HeroMotionKind.Dead:
                    grip=new GripPose(new Vector3(.22f,1.05f,.12f),new Vector3(.75f,-.35f,.5f),-.5f,0,.70f*Ease(t));
                    pose.bodyRotation=pose.bodyRotation*Quaternion.Euler(84*Ease(t),0,-8*Ease(t));twoHands=false;break;
            }
            BlendMuscle(spineBend,grip.Bend*.6f,weight);BlendMuscle(chestBend,grip.Bend*.4f,weight);BlendMuscle(spineTwist,grip.Twist*.6f,weight);BlendMuscle(chestTwist,grip.Twist*.4f,weight);
            float lowering=current.Kind==HeroMotionKind.Roll?grip.Lower:grip.Lower*weight;
            pose.bodyPosition+=Vector3.down*(lowering/Mathf.Max(.1f,animator.humanScale));
            poseHandler.SetHumanPose(ref pose);
            if(current.Kind==HeroMotionKind.Roll){ApplyRollTuck(t);FitRollBodyToFloor(t);return;}
            if(current.Kind==HeroMotionKind.Dead)return;
            if(lowering>.00001f)
            {
                // 골반 하강은 발목을 내리는 대신 무릎 굽힘으로 받는다. 이동의 원 Animator 발 위치는 보존한다.
                SolveArm(leftThigh,leftShin,leftFoot,leftFootPosition,transform.forward-transform.right*.12f);
                SolveArm(rightThigh,rightShin,rightFoot,rightFootPosition,transform.forward+transform.right*.12f);
                if(leftFoot!=null)leftFoot.rotation=leftFootRotation;if(rightFoot!=null)rightFoot.rotation=rightFootRotation;
            }
            var rightBaseUpper=rightUpper.localRotation;var rightBaseFore=rightFore.localRotation;var rightBaseHand=rightHand.localRotation;
            var desiredHand=transform.TransformPoint(grip.Hand);
            SolveArm(rightUpper,rightFore,rightHand,desiredHand,transform.right+transform.forward*.25f);
            var desiredBlade=transform.TransformDirection(grip.Blade.normalized);
            rightHand.rotation=Quaternion.FromToRotation(-socket.up,desiredBlade)*rightHand.rotation;
            BlendArm(rightUpper,rightFore,rightHand,rightBaseUpper,rightBaseFore,rightBaseHand,weight);
            var leftBaseUpper=leftUpper.localRotation;var leftBaseFore=leftFore.localRotation;var leftBaseHand=leftHand.localRotation;
            if(twoHands)
            {
                // 손잡이 -0.15m의 오른손 중심보다 폼멜 쪽 9cm에 보조 손을 고정한다.
                var target=socket.position+socket.up*.09f;
                SolveArm(leftUpper,leftFore,leftHand,target,-transform.right+transform.forward*.20f);
                leftHand.rotation=rightHand.rotation*leftGripRelative;
            }
            else if(current.Kind==HeroMotionKind.Cast)
            {
                SolveArm(leftUpper,leftFore,leftHand,transform.TransformPoint(new Vector3(-.18f,1.26f,.48f)),-transform.right);
            }
            BlendArm(leftUpper,leftFore,leftHand,leftBaseUpper,leftBaseFore,leftBaseHand,weight);
        }

        void ApplyRollTuck(float phase)
        {
            if(hips==null)return;
            float tuck=NativeHeroMotionClock.RollTuckWeight(phase);
            var rolling=transform.rotation*Quaternion.Euler(360*Ease(phase),0,0);
            if(chest!=null)chest.rotation=Quaternion.AngleAxis(50*tuck,transform.right)*chest.rotation;
            if(head!=null)head.rotation=Quaternion.AngleAxis(20*tuck,transform.right)*head.rotation;
            TuckLeg(leftThigh,leftShin,leftFoot,rolling,tuck);TuckLeg(rightThigh,rightShin,rightFoot,rolling,tuck);
            var r0=rightUpper.localRotation;var r1=rightFore.localRotation;var r2=rightHand.localRotation;
            SolveArm(rightUpper,rightFore,rightHand,hips.position+rolling*new Vector3(.14f,.14f,.12f),rolling*(Vector3.right+Vector3.forward*.20f));
            // 긴 대검은 바닥에 가까운 진행축을 유지하고, 파지점과 팔꿈치만 몸 가까이 묶는다.
            rightHand.rotation=Quaternion.FromToRotation(-socket.up,transform.TransformDirection(new Vector3(.10f,.10f,-.99f).normalized))*rightHand.rotation;
            BlendArm(rightUpper,rightFore,rightHand,r0,r1,r2,tuck);
            var l0=leftUpper.localRotation;var l1=leftFore.localRotation;var l2=leftHand.localRotation;
            SolveArm(leftUpper,leftFore,leftHand,socket.position+socket.up*.09f,rolling*(-Vector3.right+Vector3.forward*.20f));
            leftHand.rotation=rightHand.rotation*leftGripRelative;BlendArm(leftUpper,leftFore,leftHand,l0,l1,l2,tuck);
        }
        static void TuckLeg(Transform thigh,Transform shin,Transform foot,Quaternion rolling,float tuck)
        {
            if(thigh==null||shin==null||foot==null)return;
            float length=Vector3.Distance(thigh.position,shin.position)+Vector3.Distance(shin.position,foot.position);
            NativeHeroMotionClock.TuckFootOffset(length,out float down,out float back);
            var target=Vector3.Lerp(foot.position,thigh.position+rolling*new Vector3(0,-down,-back),tuck);
            var rotation=foot.rotation;SolveArm(thigh,shin,foot,target,rolling*Vector3.forward);foot.rotation=rotation;
        }
        void FitRollBodyToFloor(float phase)
        {
            if(bodyRenderer==null||rollBakeMesh==null||rollBodyIndices==null||rollBodyIndices.Length==0||hips==null)return;
            if(rollGroundTick!=observed.Tick||rollGroundPhase!=phase)
            {
                bodyRenderer.BakeMesh(rollBakeMesh,false);rollBakeMesh.GetVertices(rollVertices);
                var toModel=transform.worldToLocalMatrix*bodyRenderer.transform.localToWorldMatrix;
                float min=float.MaxValue;foreach(int index in rollBodyIndices)if(index<rollVertices.Count)min=Mathf.Min(min,toModel.MultiplyPoint3x4(rollVertices[index]).y);
                float clearance=.03f*NativeHeroMotionClock.RollTuckWeight(phase);
                rollGroundShift=min<float.MaxValue?clearance-min:0;
                rollGroundTick=observed.Tick;rollGroundPhase=phase;
            }
            // 모델/게임 루트는 건드리지 않는다. 양끝 clearance0으로 기립 복귀의 새 높이 팝을 피한다.
            hips.position+=transform.TransformVector(Vector3.up*rollGroundShift);
        }

        static void BlendArm(Transform upper,Transform fore,Transform hand,Quaternion baseUpper,Quaternion baseFore,Quaternion baseHand,float weight)
        {
            upper.localRotation=Quaternion.Slerp(baseUpper,upper.localRotation,weight);
            fore.localRotation=Quaternion.Slerp(baseFore,fore.localRotation,weight);
            hand.localRotation=Quaternion.Slerp(baseHand,hand.localRotation,weight);
        }

        static void SolveArm(Transform upper,Transform fore,Transform hand,Vector3 target,Vector3 hint)
        {
            if(upper==null||fore==null||hand==null)return;
            var a=upper.position;float l1=Vector3.Distance(a,fore.position),l2=Vector3.Distance(fore.position,hand.position);
            if(l1<.001f||l2<.001f)return;
            Vector3 delta=target-a;float distance=Mathf.Clamp(delta.magnitude,Mathf.Abs(l1-l2)+.001f,l1+l2-.001f);
            Vector3 direction=delta.sqrMagnitude>.000001f?delta.normalized:Vector3.forward;
            var bend=Vector3.ProjectOnPlane(hint,direction).normalized;
            if(bend.sqrMagnitude<.001f)bend=Vector3.Cross(direction,Vector3.up).normalized;
            float along=(l1*l1+distance*distance-l2*l2)/(2*distance),height=Mathf.Sqrt(Mathf.Max(0,l1*l1-along*along));
            var elbow=a+direction*along+bend*height;
            upper.rotation=Quaternion.FromToRotation(fore.position-a,elbow-a)*upper.rotation;
            fore.rotation=Quaternion.FromToRotation(hand.position-fore.position,(a+direction*distance)-fore.position)*fore.rotation;
        }
    }
#endif
}
