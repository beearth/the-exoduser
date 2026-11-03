using System;
using System.Collections.Generic;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // Presentation exclusion only: source placement, meshes, collisions and transforms are preserved.
    public sealed class A2RForegroundComposition
    {
        [Serializable] public sealed class Exclusion {public string id,reason;public float width,height,footViewportY;}
        [Serializable] public sealed class Receipt {public List<Exclusion> excluded=new List<Exclusion>();public int leftFrames,rightFrames;public float leftWidth,rightWidth;public int translucentEdgeTrunks;}
        sealed class Part {public Renderer body,fade;public bool originalEnabled;}
        sealed class Group {public Transform foot;public readonly List<Part> parts=new List<Part>();public Bounds bounds;public Rect rect;public bool frame,excluded;}
        readonly Dictionary<Transform,Group> groups=new Dictionary<Transform,Group>();
        readonly HashSet<Renderer> noMask=new HashSet<Renderer>();
        readonly List<Renderer> decorations=new List<Renderer>();readonly Dictionary<Renderer,bool> decorationEnabled=new Dictionary<Renderer,bool>();
        readonly Camera viewer;public Receipt Result {get;private set;}=new Receipt();
        public A2RForegroundComposition(Transform world,Camera camera){viewer=camera;foreach(var r in world.GetComponentsInChildren<Renderer>(true))if(r.name.Contains("수피 표면에 붙은 이끼")||r.name.Contains("수피에 접합한 버섯")){decorations.Add(r);decorationEnabled[r]=r.enabled;}}
        public void Track(Renderer body,Renderer fade,Transform foot){Group g;if(!groups.TryGetValue(foot,out g)){g=new Group{foot=foot};groups.Add(foot,g);}g.parts.Add(new Part{body=body,fade=fade,originalEnabled=body.enabled});}
        public bool AllowsMask(Renderer body){return !noMask.Contains(body);}
        public void Restore(bool active=false){noMask.Clear();foreach(var g in groups.Values)foreach(var p in g.parts){if(p.body!=null)p.body.enabled=p.originalEnabled;if(p.fade!=null)p.fade.enabled=active;}foreach(var p in decorationEnabled)if(p.Key!=null)p.Key.enabled=p.Value;}
        public void Update(Vector3 hero)
        {
            Restore(true);Result=new Receipt();var candidates=new List<Group>();
            foreach(var g in groups.Values){g.frame=false;g.excluded=false;bool any=false;foreach(var p in g.parts)if(p.body!=null&&p.originalEnabled&&p.body.gameObject.activeInHierarchy){if(!any){g.bounds=p.body.bounds;any=true;}else g.bounds.Encapsulate(p.body.bounds);}if(!any||g.bounds.size.y<2.2f)continue;
                var foot=viewer.WorldToViewportPoint(g.foot.position);if(g.foot.position.z>=hero.z-.05f||foot.z<=0||g.bounds.SqrDistance(viewer.transform.position)>225)continue;g.rect=Project(g.bounds);if(g.rect.xMax<=0||g.rect.xMin>=1||g.rect.yMax<=0||g.rect.yMin>=1)continue;
                string reason=null;if(foot.y<0)reason="남쪽 밑동이 화면 아래 밖";else if(g.rect.height>=.55f)reason="남쪽 줄기 화면 높이 55% 이상";
                bool edge=g.rect.xMin<.15f||g.rect.xMax>.85f;if(reason==null&&edge&&g.rect.width>.12f)reason="끝 액자 폭 12% 초과";
                if(reason!=null){Hide(g,reason,foot.y);continue;}if(edge)candidates.Add(g);
            }
            candidates.Sort((a,b)=>Mathf.Min(a.rect.center.x,1-a.rect.center.x).CompareTo(Mathf.Min(b.rect.center.x,1-b.rect.center.x)));
            foreach(var g in candidates){bool left=g.rect.center.x<.5f;if(left?Result.leftFrames>0:Result.rightFrames>0){Hide(g,"끝 액자 최대 1개",viewer.WorldToViewportPoint(g.foot.position).y);continue;}g.frame=true;foreach(var p in g.parts){noMask.Add(p.body);if(p.fade!=null)p.fade.enabled=false;}if(left){Result.leftFrames++;Result.leftWidth=g.rect.width;}else{Result.rightFrames++;Result.rightWidth=g.rect.width;}}
            foreach(var g in groups.Values)if(g.excluded)foreach(var r in decorations)if(r!=null&&r.enabled&&g.bounds.Contains(r.bounds.center))r.enabled=false;
        }
        void Hide(Group g,string reason,float footY){g.excluded=true;foreach(var p in g.parts){if(p.body!=null){p.body.enabled=false;noMask.Add(p.body);}if(p.fade!=null)p.fade.enabled=false;}Result.excluded.Add(new Exclusion{id=g.foot.name,reason=reason,width=g.rect.width,height=g.rect.height,footViewportY=footY});}
        Rect Project(Bounds b){Vector2 lo=new Vector2(float.PositiveInfinity,float.PositiveInfinity),hi=-lo;for(int i=0;i<8;i++){var p=viewer.WorldToViewportPoint(b.center+Vector3.Scale(b.extents,new Vector3((i&1)==0?-1:1,(i&2)==0?-1:1,(i&4)==0?-1:1)));if(p.z<=viewer.nearClipPlane)continue;lo=Vector2.Min(lo,p);hi=Vector2.Max(hi,p);}return float.IsPositiveInfinity(lo.x)?new Rect():Rect.MinMaxRect(lo.x,lo.y,hi.x,hi.y);}
    }
}
