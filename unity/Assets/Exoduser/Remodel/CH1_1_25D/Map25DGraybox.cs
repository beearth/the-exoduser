using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    [Serializable] public sealed class GB1Path {public string id,kind;public Vector4 bounds;public Vector4[] points;}
    [Serializable] public sealed class GB1Polygon {public string id;public Vector4 bounds;public Vector2[] points;}
    [Serializable] public sealed class GB1Landmark {public string id;public float x,z,height;}
    [Serializable] public sealed class GB1Node {public int id;public float x,z,height;}
    [Serializable] public sealed class GB1Layout
    {
        public Vector4 bounds;public int heightResolution;public GB1Path[] roads;public GB1Polygon[] pockets,wet,islands;public Vector4[] bridge;public GB1Landmark[] landmarks;public GB1Node[] nodes;public Vector2 camp;public float waterHeight;
        static float Segment(float x,float z,Vector4 a,Vector4 b,out float t){float dx=b.x-a.x,dz=b.y-a.y;t=Mathf.Clamp01(((x-a.x)*dx+(z-a.y)*dz)/Mathf.Max(.00001f,dx*dx+dz*dz));return Mathf.Sqrt((x-a.x-dx*t)*(x-a.x-dx*t)+(z-a.y-dz*t)*(z-a.y-dz*t));}
        public float RoadDistance(float x,float z,Vector4[] points){float best=1000;for(int i=1;i<points.Length;i++){float t;float d=Segment(x,z,points[i-1],points[i],out t)-Mathf.Lerp(points[i-1].z,points[i].z,t)*.5f;if(d<best)best=d;}return best;}
        public static bool Inside(float x,float z,Vector2[] p){bool b=false;for(int i=0,j=p.Length-1;i<p.Length;j=i++){var a=p[i];var c=p[j];if((a.y>z)!=(c.y>z)&&x<(c.x-a.x)*(z-a.y)/(c.y-a.y)+a.x)b=!b;}return b;}
        public float WalkDistance(float x,float z){float best=1000;foreach(var road in roads)if(x>=road.bounds.x&&z>=road.bounds.y&&x<=road.bounds.z&&z<=road.bounds.w)best=Mathf.Min(best,RoadDistance(x,z,road.points));foreach(var poly in pockets){if(x<poly.bounds.x||z<poly.bounds.y||x>poly.bounds.z||z>poly.bounds.w)continue;float d=1000;for(int i=0;i<poly.points.Length;i++){var a=poly.points[i];var b=poly.points[(i+1)%poly.points.Length];float t;d=Mathf.Min(d,Segment(x,z,new Vector4(a.x,a.y,0,0),new Vector4(b.x,b.y,0,0),out t));}if(Inside(x,z,poly.points))d=-d;best=Mathf.Min(best,d);}return best;}
        public bool RawWaterAt(float x,float z){bool water=false;foreach(var p in wet)if(x>=p.bounds.x&&z>=p.bounds.y&&x<=p.bounds.z&&z<=p.bounds.w&&Inside(x,z,p.points)){water=true;break;}if(!water)return false;foreach(var p in islands)if(x>=p.bounds.x&&z>=p.bounds.y&&x<=p.bounds.z&&z<=p.bounds.w&&Inside(x,z,p.points))return false;return true;}
        public bool WaterAt(float x,float z,float walkDistance){return RawWaterAt(x,z)&&(RoadDistance(x,z,bridge)<0||walkDistance>.36f);}
        public float RoadHeight(float x,float z,out Vector2 nearest){float best=10000,height=0;nearest=Vector2.zero;var p=roads[0].points;for(int i=1;i<p.Length;i++){float t,d=Segment(x,z,p[i-1],p[i],out t);if(d<best){best=d;height=Mathf.Lerp(p[i-1].w,p[i].w,t);nearest=new Vector2(Mathf.Lerp(p[i-1].x,p[i].x,t),Mathf.Lerp(p[i-1].y,p[i].y,t));}}return height;}
        public float Height(float x,float z){float d=WalkDistance(x,z);bool water=RawWaterAt(x,z);if(water&&WaterAt(x,z,d)&&RoadDistance(x,z,bridge)>0)return waterHeight-.16f;float far=3.4f+1.3f*Mathf.PerlinNoise(x*.035f+2,z*.034f+7);if(d>6)return far;Vector2 nearest;float h=RoadHeight(x,z,out nearest);float bank=Mathf.SmoothStep(0,1,Mathf.Clamp01(d/4));float mass=z<nearest.y?2.8f:3.2f+2.2f*Mathf.PerlinNoise(x*.09f+11,z*.08f+3);return Mathf.Lerp(h+bank*mass,far,Mathf.SmoothStep(0,1,Mathf.InverseLerp(4,6,d)));}
    }
    public sealed class GB1Grounded : MonoBehaviour
    {
        public Vector3 hitPoint,normal;public float embed=.04f,positiveGap;public bool queryHit;public string role;
    }
    [DefaultExecutionOrder(20010)]
    public sealed class Map25DGraybox : MonoBehaviour
    {
        public GB1Grounded[] Objects;public LayerMask QueryMask=1<<28;public int FloatingObjects {get;private set;}public float MaxPositiveGap {get;private set;}
        public void Audit(Camera camera,string path){var r=new Receipt();foreach(var o in Objects){if(o==null)continue;var body=o.transform.GetChild(0).GetComponent<MeshRenderer>();var foot=o.transform.position;if(body!=null)foot.y=body.bounds.min.y;CheckFoot(r,camera,o.name,foot);}foreach(var contact in FindObjectsByType<MeshRenderer>(FindObjectsInactive.Exclude))if(contact.enabled&&contact.name.StartsWith("HD2D contact: ",StringComparison.Ordinal)){Vector3 foot;if(Map25DContactShadows.TryGetFoot(contact,out foot)){r.actorLayers++;CheckFoot(r,camera,contact.name,foot);}}FloatingObjects=r.floating;MaxPositiveGap=r.maxPositiveGap;System.IO.File.WriteAllText(path,JsonUtility.ToJson(r,true));}
        void CheckFoot(Receipt r,Camera camera,string name,Vector3 foot){r.objects++;RaycastHit hit;bool ok=Physics.Raycast(foot+Vector3.up*60,Vector3.down,out hit,140,QueryMask,QueryTriggerInteraction.Ignore);float gap=ok?Mathf.Max(0,foot.y-hit.point.y):100;float pixels=0;if(ok){var a=camera.WorldToScreenPoint(foot);var b=camera.WorldToScreenPoint(hit.point);pixels=gap>0?Mathf.Abs(a.y-b.y):0;}if(!ok||gap>.03f||pixels>2){r.floating++;r.failures.Add(name+" gap="+gap+" px="+pixels);}r.maxPositiveGap=Mathf.Max(r.maxPositiveGap,gap);r.maxScreenGap=Mathf.Max(r.maxScreenGap,pixels);}
        [Serializable] sealed class Receipt {public string scope="Opaque greybox mesh bounds bottom and registered actor feet versus downward layer28 raycast; embed2–8cm. Positive vertical gap>3cm or projected foot gap>2px fails. Bridge is a designed span; deck collider is queried by actors. Water is a designed surface. No bitmap environment cards in GB1. Actor layers may include original partial walk overlays.";public int objects,actorLayers,floating;public float maxPositiveGap,maxScreenGap;public System.Collections.Generic.List<string> failures=new System.Collections.Generic.List<string>();}
    }
}
