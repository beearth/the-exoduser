using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Presentation only (Core untouched): a giant tree instance fades while its own mesh blocks the camera's line to the player,
    // or to an enemy within a third of the screen height of the player. Other trees stay opaque. Alpha blend, no dither.
    public sealed partial class NativeGame
    {
        const float A2TreeFadeAlpha=.3f,A2TreeFadeSeconds=.15f,A2TreeFadeHold=.25f,A2TreeMinHeight=4,A2TreeCell=.7f,A2TreeNearRange=34;
        const int A2TreeMaxEnemyTargets=40;
        sealed class A2FadeRenderer
        {
            public Renderer renderer;public Material[] opaque,fade;public Color[] tint;public MaterialPropertyBlock block;public bool swapped;
        }
        sealed class A2FadeTree
        {
            public GameObject root;public Bounds bounds;public readonly List<A2FadeRenderer> renderers=new List<A2FadeRenderer>();public readonly List<Renderer> attached=new List<Renderer>();
            public HashSet<long> cells;public float alpha=1,holdUntil;public bool blocking,attachedHidden;
        }
        readonly List<A2FadeTree> a2FadeTrees=new List<A2FadeTree>(),a2FadeNear=new List<A2FadeTree>();
        readonly Dictionary<Material,Material> a2FadeMaterials=new Dictionary<Material,Material>();
        readonly List<Vector3> a2FadeTargets=new List<Vector3>();
        GameObject a2FadeRootSeen;int a2FadeNearFrame=-999;
        // QA: frame cost and how many instances block right now. --a2-tree-fade-off keeps the test running but draws every tree opaque (before/after comparison).
        public int A2TreeFadeBlocking{get;private set;}
        public double A2TreeFadeLastMs{get;private set;}
        public double A2TreeFadeMaxMs{get;private set;}
        static readonly bool A2TreeFadeOff=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2-tree-fade-off")>=0;

        static bool A2FadeCandidate(string name)
        {
            return name=="A2_Hollow_Loft_Tree"||name=="A2_Ancient_Rotten_Tree"||name=="A2 전경 바깥 거목"||name.StartsWith("A2 外곽 ",StringComparison.Ordinal);
        }
        static long A2FadeKey(Vector3 p)
        {
            long x=Mathf.FloorToInt(p.x/A2TreeCell)+1048576,y=Mathf.FloorToInt(p.y/A2TreeCell)+1048576,z=Mathf.FloorToInt(p.z/A2TreeCell)+1048576;
            return x<<42|y<<21|z;
        }
        void A2TreeFadeScan()
        {
            a2FadeRootSeen=a2Root;a2FadeTrees.Clear();a2FadeNear.Clear();a2FadeNearFrame=-999;
            var moss=new List<Renderer>();
            foreach(Transform child in a2Root.transform)
            {
                string name=child.name;
                if(name=="A2 수피 표면에 붙은 이끼"||name=="A2 수피에 접합한 버섯"){moss.AddRange(child.GetComponentsInChildren<Renderer>());continue;}
                if(!A2FadeCandidate(name))continue;
                var renderers=child.GetComponentsInChildren<MeshRenderer>();if(renderers.Length==0)continue;
                var bounds=renderers[0].bounds;foreach(var r in renderers)bounds.Encapsulate(r.bounds);
                if(bounds.size.y<A2TreeMinHeight)continue;
                var tree=new A2FadeTree{root=child.gameObject,bounds=bounds};
                foreach(var r in renderers)
                {
                    var entry=new A2FadeRenderer{renderer=r,opaque=r.sharedMaterials,block=new MaterialPropertyBlock()};
                    entry.tint=new Color[entry.opaque.Length];r.GetPropertyBlock(entry.block);
                    var shared=entry.block.isEmpty?(Color?)null:entry.block.GetColor("_BaseColor");
                    for(int i=0;i<entry.opaque.Length;i++){var m=entry.opaque[i];entry.tint[i]=shared.HasValue?shared.Value:m!=null&&m.HasProperty("_BaseColor")?m.GetColor("_BaseColor"):Color.white;}
                    tree.renderers.Add(entry);
                }
                a2FadeTrees.Add(tree);
            }
            // Moss and fungus are glued to a trunk but placed as siblings: they must not stay floating in the air when that trunk fades.
            foreach(var r in moss)
            {
                if(r==null)continue;A2FadeTree best=null;float nearest=9;var c=r.bounds.center;
                foreach(var tree in a2FadeTrees){var q=tree.bounds.center-c;q.y=0;float d=q.sqrMagnitude;if(d<nearest){nearest=d;best=tree;}}
                best?.attached.Add(r);
            }
        }
        // The real mesh when it is readable; otherwise the trunk core of the bounds (the RF3 ancient trees are not readable).
        static void A2FadeBuildCells(A2FadeTree tree)
        {
            tree.cells=new HashSet<long>();
            foreach(var entry in tree.renderers)
            {
                var filter=entry.renderer.GetComponent<MeshFilter>();if(filter==null||filter.sharedMesh==null||!filter.sharedMesh.isReadable)continue;
                var matrix=filter.transform.localToWorldMatrix;var points=filter.sharedMesh.vertices;
                for(int i=0;i<points.Length;i++)tree.cells.Add(A2FadeKey(matrix.MultiplyPoint3x4(points[i])));
            }
            if(tree.cells.Count>0)return;
            var c=tree.bounds.center;float radius=Mathf.Min(tree.bounds.extents.x,tree.bounds.extents.z)*.35f;
            for(float y=tree.bounds.min.y;y<=tree.bounds.max.y;y+=A2TreeCell*.5f)for(float x=-radius;x<=radius;x+=A2TreeCell*.5f)for(float z=-radius;z<=radius;z+=A2TreeCell*.5f)
                if(x*x+z*z<=radius*radius)tree.cells.Add(A2FadeKey(new Vector3(c.x+x,y,c.z+z)));
        }
        static bool A2FadeSegmentBlocked(A2FadeTree tree,Vector3 from,Vector3 to)
        {
            var delta=to-from;float length=delta.magnitude;if(length<.01f)return false;var ray=new Ray(from,delta/length);
            if(!tree.bounds.IntersectRay(ray,out float enter)||enter>length)return false;
            if(tree.cells==null)A2FadeBuildCells(tree);
            // Stop short of the target: bark right at a body's feet is contact, not occlusion.
            float end=length-.45f,step=A2TreeCell*.5f;
            for(float d=Mathf.Max(0,enter);d<end;d+=step)if(tree.cells.Contains(A2FadeKey(ray.GetPoint(d))))return true;
            return false;
        }
        void A2FadeCollectTargets()
        {
            a2FadeTargets.Clear();var p=Simulation.Player;var player=NativeRemodel3D.Point(p.X,p.Y);
            a2FadeTargets.Add(player+Vector3.up*.25f);a2FadeTargets.Add(player+Vector3.up*.85f);a2FadeTargets.Add(player+Vector3.up*1.45f);
            var screen=r3Cam.WorldToScreenPoint(player);float reach=r3Cam.pixelHeight/3f,reach2=reach*reach;int added=0;
            foreach(var e in Simulation.Enemies)
            {
                if(!e.Alive)continue;var at=NativeRemodel3D.Point(e.X,e.Y);var s=r3Cam.WorldToScreenPoint(at);if(s.z<=0)continue;
                float dx=s.x-screen.x,dy=s.y-screen.y;if(dx*dx+dy*dy>reach2)continue;
                a2FadeTargets.Add(at+Vector3.up*.7f);if(++added>=A2TreeMaxEnemyTargets)break;
            }
        }
        Material A2FadeMaterial(Material source)
        {
            if(source==null)return null;
            if(a2FadeMaterials.TryGetValue(source,out var fade))return fade;
            bool full=source.IsKeywordEnabled("_METALLICSPECGLOSSMAP")||source.IsKeywordEnabled("_OCCLUSIONMAP");
            var template=Resources.Load<Material>(full?"Art/map/a2/occlusion/A2_TreeFade_Full":"Art/map/a2/occlusion/A2_TreeFade_Normal");
            if(template==null){Debug.LogError("[A2 고목 투명화] 템플릿 재질 누락");a2FadeMaterials[source]=null;return null;}
            fade=R3Track(new Material(template));fade.name=source.name+" (tree fade)";
            foreach(var id in new[]{"_BaseMap","_BumpMap","_MetallicGlossMap","_OcclusionMap"})if(source.HasProperty(id)&&fade.HasProperty(id))fade.SetTexture(id,source.GetTexture(id));
            foreach(var id in new[]{"_BumpScale","_Smoothness","_Metallic","_OcclusionStrength"})if(source.HasProperty(id)&&fade.HasProperty(id))fade.SetFloat(id,source.GetFloat(id));
            a2FadeMaterials[source]=fade;return fade;
        }
        void A2FadeApply(A2FadeTree tree)
        {
            bool opaque=tree.alpha>=.999f;
            foreach(var entry in tree.renderers)
            {
                if(entry.renderer==null)continue;
                if(opaque)
                {
                    if(!entry.swapped)continue;
                    entry.renderer.sharedMaterials=entry.opaque;entry.swapped=false;
                    for(int i=0;i<entry.opaque.Length;i++)entry.renderer.SetPropertyBlock(null,i);
                    continue;
                }
                if(!entry.swapped)
                {
                    if(entry.fade==null){entry.fade=new Material[entry.opaque.Length];for(int i=0;i<entry.opaque.Length;i++)entry.fade[i]=A2FadeMaterial(entry.opaque[i]);}
                    bool ready=true;foreach(var m in entry.fade)ready&=m!=null;if(!ready)continue;
                    entry.renderer.sharedMaterials=entry.fade;entry.swapped=true;
                }
                for(int i=0;i<entry.fade.Length;i++){var c=entry.tint[i];c.a=tree.alpha;entry.block.Clear();entry.block.SetColor("_BaseColor",c);entry.renderer.SetPropertyBlock(entry.block,i);}
            }
            bool hide=tree.alpha<.95f;
            if(hide!=tree.attachedHidden){tree.attachedHidden=hide;foreach(var r in tree.attached)if(r!=null)r.enabled=!hide;}
        }
        void A2TreeOcclusionLate()
        {
            if(a2Root==null||a2Field==null||r3Cam==null||Simulation==null)return;
            long started=System.Diagnostics.Stopwatch.GetTimestamp();
            if(a2FadeRootSeen!=a2Root)A2TreeFadeScan();
            if(a2FadeTrees.Count==0)return;
            var player=NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y);
            if(Time.frameCount-a2FadeNearFrame>=15)
            {
                a2FadeNearFrame=Time.frameCount;a2FadeNear.Clear();float range=A2TreeNearRange*A2TreeNearRange;
                foreach(var tree in a2FadeTrees){var q=tree.bounds.center-player;q.y=0;if(q.sqrMagnitude<range||tree.alpha<.999f)a2FadeNear.Add(tree);}
            }
            A2FadeCollectTargets();var eye=r3Cam.transform.position;float now=Time.unscaledTime,rate=(1-A2TreeFadeAlpha)/A2TreeFadeSeconds*Time.unscaledDeltaTime;int blocking=0;
            foreach(var tree in a2FadeNear)
            {
                bool blocked=false;for(int i=0;i<a2FadeTargets.Count&&!blocked;i++)blocked=A2FadeSegmentBlocked(tree,eye,a2FadeTargets[i]);
                if(blocked){tree.holdUntil=now+A2TreeFadeHold;blocking++;}
                tree.blocking=blocked;
                if(A2TreeFadeOff)continue;
                float goal=now<tree.holdUntil?A2TreeFadeAlpha:1,next=Mathf.MoveTowards(tree.alpha,goal,rate);
                if(next==tree.alpha)continue;tree.alpha=next;A2FadeApply(tree);
            }
            A2TreeFadeBlocking=blocking;
            A2TreeFadeLastMs=(System.Diagnostics.Stopwatch.GetTimestamp()-started)*1000.0/System.Diagnostics.Stopwatch.Frequency;
            if(A2TreeFadeLastMs>A2TreeFadeMaxMs)A2TreeFadeMaxMs=A2TreeFadeLastMs;
        }
    }
}
