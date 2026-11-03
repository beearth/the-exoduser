using System;
using System.Collections.Generic;
using UnityEngine;
namespace Exoduser.UnityPort
{
    public static class NativeArenaActorMetrics
    {
        [Serializable] public sealed class Frame
        {
            public string texture;
            public int x,y,w,h,left,right,bottom,top;
        }
        [Serializable] sealed class Data
        {
            public float heroIdleWorld,bossIdleFraction;
            public Frame[] frames;
        }
        static Data data;
        static readonly Dictionary<string,Frame> frames=new Dictionary<string,Frame>();
        static Data Profile
        {
            get
            {
                if(data!=null)return data;
                var asset=Resources.Load<TextAsset>("Data/arena_actor_bounds");
                if(asset==null)throw new InvalidOperationException("arena alpha bounds missing");
                data=JsonUtility.FromJson<Data>(asset.text);
                foreach(var f in data.frames)frames[f.texture+":"+f.x+":"+f.y]=f;
                return data;
            }
        }
        public static float HeroModelWorld
        {
            get;
            private set;
        }
        public static float HeroIdleWorld
        {
            get
            {
                return HeroModelWorld>0?HeroModelWorld:Profile.heroIdleWorld;
            }
        }
        public static void CalibrateHero(GameObject model)
        {
            HeroModelWorld=0;
            if(model==null||model.transform.parent==null)return;
            var root=model.transform.parent;
            float lo=float.PositiveInfinity,hi=float.NegativeInfinity;
            foreach(var renderer in model.GetComponentsInChildren<Renderer>())
            {
                Bounds bounds;
                var skinned=renderer as SkinnedMeshRenderer;
                if(skinned!=null&&skinned.sharedMesh!=null)bounds=skinned.sharedMesh.bounds;
                else
                {
                    var mf=renderer.GetComponent<MeshFilter>();
                    if(mf==null||mf.sharedMesh==null)continue;
                    bounds=mf.sharedMesh.bounds;
                }
                for(int n=0;n<8;n++)
                {
                    var local=bounds.center+Vector3.Scale(bounds.extents,new Vector3((n&1)==0?-1:1,(n&2)==0?-1:1,(n&4)==0?-1:1));
                    float y=root.InverseTransformPoint(renderer.transform.TransformPoint(local)).y;
                    lo=Mathf.Min(lo,y);
                    hi=Mathf.Max(hi,y);
                }
            }
            float h=(hi-lo)*.87f;
            if(h>.6f&&h<3)HeroModelWorld=h;
            Debug.Log("[RB1-8] hero rest-mesh height="+HeroModelWorld+" rootScale=.87 bossTarget="+HeroIdleWorld*2.8f+" GPU silhouette measurement=review PNG");
        }
        public static float ModelHeightPixels(GameObject model,Camera camera,out Rect rect)
        {
            rect=new Rect();
            if(model==null)return 0;
            float x0=float.PositiveInfinity,y0=x0,x1=float.NegativeInfinity,y1=x1;
            foreach(var r in model.GetComponentsInChildren<Renderer>())
            {
                if(!r.enabled||!r.gameObject.activeInHierarchy)continue;
                var b=r.bounds;
                for(int n=0;n<8;n++)
                {
                    var v=camera.WorldToScreenPoint(b.center+Vector3.Scale(b.extents,new Vector3((n&1)==0?-1:1,(n&2)==0?-1:1,(n&4)==0?-1:1)));
                    if(v.z<=0)continue;
                    x0=Mathf.Min(x0,v.x);
                    x1=Mathf.Max(x1,v.x);
                    y0=Mathf.Min(y0,v.y);
                    y1=Mathf.Max(y1,v.y);
                }
            }
            if(float.IsPositiveInfinity(x0))return 0;
            rect=Rect.MinMaxRect(x0,y0,x1,y1);
            return rect.height;
        }
        public static float BossIdleFraction
        {
            get
            {
                return Profile.bossIdleFraction;
            }
        }
        public static bool TryFrame(Sprite sprite,out Frame f)
        {
            _ = Profile;
            return frames.TryGetValue(sprite.texture.name+":"+(int)sprite.rect.x+":"+(int)sprite.rect.y,out f);
        }
        // Source alpha rectangle projected after final billboard pose. Occlusion/weapon exclusion needs the PNG review.
        public static float HeightPixels(SpriteRenderer renderer,Camera camera,out Rect rect)
        {
            rect=new Rect();
            if(renderer==null||renderer.sprite==null||camera==null)return 0;
            Frame f;
            if(!TryFrame(renderer.sprite,out f))return -1;
            var s=renderer.sprite;
            float minX=float.PositiveInfinity,minY=minX,maxX=float.NegativeInfinity,maxY=maxX;
            foreach(float x in new[]
            {
                (f.left-s.pivot.x)/s.pixelsPerUnit,(f.right-s.pivot.x)/s.pixelsPerUnit
            }
            )foreach(float y in new[]
            {
                (f.bottom-s.pivot.y)/s.pixelsPerUnit,(f.top-s.pivot.y)/s.pixelsPerUnit
            }
            )
            {
                var p=camera.WorldToScreenPoint(renderer.transform.TransformPoint(new Vector3(x,y,0)));
                if(p.z<=0)return -1;
                minX=Mathf.Min(minX,p.x);
                maxX=Mathf.Max(maxX,p.x);
                minY=Mathf.Min(minY,p.y);
                maxY=Mathf.Max(maxY,p.y);
            }
            rect=Rect.MinMaxRect(minX,minY,maxX,maxY);
            return rect.height;
        }
    }
}
