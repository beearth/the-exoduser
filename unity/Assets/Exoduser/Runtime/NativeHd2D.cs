using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // 표현 정책만 소유한다. Core·세이브·입력은 변경하지 않는다.
    public static class NativeHd2D
    {
        public static readonly bool Enabled = Array.IndexOf(Environment.GetCommandLineArgs(), "--legacy-models") < 0;
        [Serializable] sealed class Foot { public string texture; public int x, y; public float bottom; }
        [Serializable] sealed class Feet { public Foot[] feet; }
        static readonly Dictionary<Sprite,float> footCache = new Dictionary<Sprite,float>();
        static readonly Dictionary<string, float> bottoms = new Dictionary<string, float>();
        sealed class ActorPose
        {
            public Transform parent;
            public Vector3 position;
            public Quaternion rotation;
            public bool projected, rollSet;
            public float rollOffset;
        }
        static readonly Dictionary<SpriteRenderer, ActorPose> actors = new Dictionary<SpriteRenderer, ActorPose>();
        static readonly Dictionary<SpriteRenderer,SpriteRenderer> overlayBases = new Dictionary<SpriteRenderer,SpriteRenderer>();
        static readonly Dictionary<SpriteRenderer,float> contactWidths = new Dictionary<SpriteRenderer,float>();
        static readonly HashSet<SpriteRenderer> pivotFeet = new HashSet<SpriteRenderer>();
        static readonly Dictionary<SpriteRenderer,Material> originalMaterials=new Dictionary<SpriteRenderer,Material>();
        static readonly Dictionary<SpriteRenderer,int> centered=new Dictionary<SpriteRenderer,int>();
        static Material lit, contact;
        static readonly MaterialPropertyBlock shadowBlock = new MaterialPropertyBlock();
        static readonly Dictionary<SpriteRenderer, MeshRenderer> shadows = new Dictionary<SpriteRenderer, MeshRenderer>();
        static bool loaded;
        static readonly List<SpriteRenderer> deadActors = new List<SpriteRenderer>();
        public static bool IsActor(SpriteRenderer sr) { return sr!=null&&actors.ContainsKey(sr); }
        // UpdateViews가 모든 writer 전에 원본을 복원한 뒤 Actor가 새 자세를 확정한다.
        // 등록과 투영은 별개다. writer 없는 프레임에도 같은 원본으로 재투영할 수 있다.
        static ActorPose CapturePose(SpriteRenderer sr)
        {
            var tr=sr.transform;
            if(!actors.TryGetValue(sr,out var pose))
            { pose=new ActorPose();actors[sr]=pose; }
            pose.parent=tr.parent;pose.position=tr.localPosition;pose.rotation=tr.localRotation;
            pose.projected=false;pose.rollSet=false;
            return pose;
        }
        public static void RestoreSourcePoses()
        {
            PruneActors();
            foreach(var pair in actors)
            {
                var tr=pair.Key.transform;var pose=pair.Value;
                if(!pose.projected)continue;
                tr.localPosition=pose.position;tr.localRotation=pose.rotation;pose.projected=false;
            }
        }
        public static void ReleaseActor(SpriteRenderer sr)
        { if(sr!=null)RemoveActor(sr); }
        static float SourceRoll(ActorPose pose)
        { return ((pose.parent!=null?pose.parent.rotation:Quaternion.identity)*pose.rotation).eulerAngles.z; }
        public static void Actor(SpriteRenderer sr,bool pivotIsFoot=false,float contactWidth=0f)
        {
            if (!Enabled || sr == null) return;
            NativeHd2DSurface.Unbind(sr);centered.Remove(sr);if(!originalMaterials.ContainsKey(sr))originalMaterials[sr]=sr.sharedMaterial;
            CapturePose(sr);contactWidths[sr]=contactWidth;overlayBases.Remove(sr);
            if(pivotIsFoot)pivotFeet.Add(sr);else pivotFeet.Remove(sr);
            if (sr.sprite != null) sr.sprite.texture.filterMode = FilterMode.Point;
            if (lit == null)
            {
                var shader = Resources.Load<Shader>("Shaders/HD2DSpriteLit");
                if (shader == null) throw new InvalidOperationException("HD2D sprite shader missing");
                lit = new Material(shader) { name = "HD2D pixel actors" };
            }
            sr.sharedMaterial = lit;
            if(actors.Count>2048)PruneActors();
        }
        public static void Overlay(SpriteRenderer overlay,SpriteRenderer body)
        {
            Actor(overlay);if(Enabled&&overlay!=null&&body!=null)overlayBases[overlay]=body;
        }
        public static bool IsCentered(SpriteRenderer sr){return centered.TryGetValue(sr,out var frame)&&frame==Time.frameCount;}
        public static void Center(SpriteRenderer sr)
        {
            if(!Enabled||sr==null)return;NativeHd2DSurface.Unbind(sr);RemoveActor(sr);centered[sr]=Time.frameCount;
        }
        public static void Grounded(SpriteRenderer sr){if(!Enabled||sr==null)return;NativeHd2DSurface.Unbind(sr);RemoveActor(sr);centered.Remove(sr);}
        public static void ForgetActorForSurface(SpriteRenderer sr){if(ReferenceEquals(sr,null))return;RemoveActor(sr);centered.Remove(sr);}
        static void RemoveActor(SpriteRenderer sr)
        {
            if(sr!=null&&actors.TryGetValue(sr,out var pose)&&pose.projected){sr.transform.localPosition=pose.position;sr.transform.localRotation=pose.rotation;pose.projected=false;}
            if(shadows.TryGetValue(sr,out var shadow)&&shadow!=null)
            {
                shadow.enabled=false;
                if(Application.isPlaying)UnityEngine.Object.Destroy(shadow.gameObject);else UnityEngine.Object.DestroyImmediate(shadow.gameObject);
            }
            if(sr!=null&&originalMaterials.TryGetValue(sr,out var original)&&sr.sharedMaterial==lit)sr.sharedMaterial=original;originalMaterials.Remove(sr);
            actors.Remove(sr);contactWidths.Remove(sr);pivotFeet.Remove(sr);overlayBases.Remove(sr);shadows.Remove(sr);
        }
        static void PruneActors()
        {
            deadActors.Clear();foreach(var actor in actors.Keys)if(actor==null)deadActors.Add(actor);
            foreach(var actor in deadActors)RemoveActor(actor);deadActors.Clear();
        }
        public static void BeginProjection()
        {
            PruneActors();deadActors.Clear();foreach(var pair in centered)if(pair.Key==null)deadActors.Add(pair.Key);foreach(var key in deadActors)centered.Remove(key);deadActors.Clear();foreach(var shadow in shadows.Values)if(shadow!=null)shadow.enabled=false;
        }
        public static void ProjectFlatActors(Camera camera)
        {
            BeginProjection();
            foreach(var pair in actors)if(pair.Key!=null&&pair.Key.enabled&&pair.Key.gameObject.activeInHierarchy)
                ProjectActor(pair.Key,camera,SourceRoll(pair.Value),false);
        }
        public static void ProjectActor(SpriteRenderer sr,Camera camera,float roll,bool ground3D=true)
        {
            if(sr==null||camera==null)return;
            if(!actors.TryGetValue(sr,out var pose))pose=CapturePose(sr);
            if(!pose.rollSet){pose.rollOffset=Mathf.DeltaAngle(SourceRoll(pose),roll);pose.rollSet=true;}
            var source=pose.parent!=null?pose.parent.TransformPoint(pose.position):pose.position;
            var anchor=SnapAnchor(camera,source);
            var rotation=camera.transform.rotation*Quaternion.Euler(0,0,SourceRoll(pose)+pose.rollOffset);
            var footSource=overlayBases.TryGetValue(sr,out var body)&&body!=null?body:sr;
            float below=(pivotFeet.Contains(footSource)?0:FootLift(footSource.sprite))*Mathf.Abs(footSource.transform.lossyScale.y);
            sr.transform.SetPositionAndRotation(anchor+camera.transform.up*below,rotation);
            pose.projected=true;
            if(footSource!=sr)return; // 원본보행은 부분 overlay다. 같은발선·그림자1개를 공유한다.
            if(!shadows.TryGetValue(sr,out var shadow)||shadow==null)
            {
                var go=GameObject.CreatePrimitive(PrimitiveType.Quad);go.name="HD2D contact: "+sr.name;
                var collider=go.GetComponent<Collider>();
                if(Application.isPlaying)UnityEngine.Object.Destroy(collider);else UnityEngine.Object.DestroyImmediate(collider);
                go.transform.SetParent(sr.transform.parent,false);
                shadow=go.GetComponent<MeshRenderer>();
                if(contact==null)contact=new Material(Resources.Load<Shader>("Shaders/HD2DContact")){name="HD2D contact shadow"};
                shadow.sharedMaterial=contact;shadows[sr]=shadow;
            }
            shadow.enabled=true;
            shadowBlock.Clear();shadowBlock.SetFloat("_Opacity",sr.color.a);shadow.SetPropertyBlock(shadowBlock);
            shadow.sortingOrder=sr.sortingOrder-1;
            shadow.transform.SetPositionAndRotation(anchor+(ground3D?Vector3.up:Vector3.forward)*.018f,ground3D?Quaternion.Euler(90,0,0):Quaternion.identity);
            float width=contactWidths.TryGetValue(sr,out var fixedWidth)&&fixedWidth>0?fixedWidth:sr.sprite.rect.width/sr.sprite.pixelsPerUnit*Mathf.Abs(sr.transform.lossyScale.x)*.5f;
            width=Mathf.Clamp(width,.24f,2.8f);
            shadow.transform.localScale=new Vector3(width,width*.6f,1);

        }
        public static float FootLift(Sprite sprite)
        {
            if(footCache.TryGetValue(sprite,out var cached))return cached;
            if (!loaded)
            {
                var json = Resources.Load<TextAsset>("Data/hd2d_feet");
                if (json == null) throw new InvalidOperationException("HD2D feet metadata missing");
                var data = JsonUtility.FromJson<Feet>(json.text);
                foreach (var f in data.feet) bottoms[f.texture + ":" + f.x + ":" + f.y] = f.bottom;
                loaded = true;
            }
            var rect = sprite.rect;
            float bottom;
            if(!bottoms.TryGetValue(sprite.texture.name+":"+(int)rect.x+":"+(int)rect.y,out bottom))bottom=0;
            float lift=(sprite.pivot.y-bottom)/sprite.pixelsPerUnit;footCache[sprite]=lift;return lift;
        }
        public static Vector3 SnapAnchor(Camera camera, Vector3 anchor)
        {
            if (camera == null || camera.pixelHeight <= 0) return anchor;
            var screen = camera.WorldToScreenPoint(anchor);
            screen.x = Mathf.Round(screen.x); screen.y = Mathf.Round(screen.y);
            var snapped=camera.ScreenToWorldPoint(screen);
            // 원점에서 먼 world 좌표의 native 역투영 잔차를 카메라 평면에서 보정한다.
            // 허용치를 늘리지 않고 최종 출력 화소에 맞춘다. 기존 source depth는 유지한다.
            var projection=camera.projectionMatrix;
            for(int i=0;i<3;i++)
            {
                var actual=camera.WorldToScreenPoint(snapped);
                float ux=camera.orthographic?2*camera.orthographicSize*camera.aspect/camera.pixelWidth:2*actual.z/(projection.m00*camera.pixelWidth);
                float uy=camera.orthographic?2*camera.orthographicSize/camera.pixelHeight:2*actual.z/(projection.m11*camera.pixelHeight);
                snapped+=camera.transform.right*((screen.x-actual.x)*ux)+camera.transform.up*((screen.y-actual.y)*uy);
            }
            return snapped;
        }
    }
}
