using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class A2RProps3D
    {
        public const float D5HeroHeight=1.61f,D5ShrubHeight=.64f;
        sealed class D5Growth {public GameObject go;public bool card;}
        readonly List<D5Growth> d5Growth=new List<D5Growth>();
        GameObject d5Shrubs;
        public static bool D5LowGrowth(string kind){return kind=="m_ctree14"||kind=="m_ctree20"||kind=="m_c1cocoon"||kind=="m_c1spod";}
        void D5RegisterGrowth(GameObject go,string kind,bool card){if(!A2RD5.On||go==null||!D5LowGrowth(kind))return;d5Growth.Add(new D5Growth{go=go,card=card});if(!card&&lastAo!=null)d5Growth.Add(new D5Growth{go=lastAo,card=false});}
        public void D5ShowGrowth(bool show)
        {
            foreach(var item in d5Growth)if(item.go!=null)item.go.SetActive(show&&(!item.card||!cards.Contains(item.go)));
            if(d5Shrubs!=null)d5Shrubs.SetActive(!show&&A2RClean.On);
        }
        void D5GrowthLook(bool on)
        {
            if(!A2RD5.On)return;
            if(on)D5ShowGrowth(false);else foreach(var item in d5Growth)if(item.go!=null)item.go.SetActive(true);
        }
        public static Bounds D5GeometryBounds(GameObject root)
        {
            bool first=true;Bounds bounds=new Bounds(root.transform.position,Vector3.zero);
            foreach(var renderer in root.GetComponentsInChildren<MeshRenderer>(true))
            {
                if(!renderer.enabled||renderer.name.Contains("portion"))continue;var filter=renderer.GetComponent<MeshFilter>();
                if(filter==null||filter.sharedMesh==null||!filter.sharedMesh.isReadable)continue;
                foreach(var vertex in filter.sharedMesh.vertices){var point=filter.transform.TransformPoint(vertex);if(first){bounds=new Bounds(point,Vector3.zero);first=false;}else bounds.Encapsulate(point);}
            }
            return bounds;
        }
        public static bool D5OffLane(float x,float z,Func<float,float,bool> walkable)
        {
            if(walkable==null||walkable(x,z))return false;
            for(int ring=1;ring<=3;ring++)for(int k=0;k<16;k++){float a=k*Mathf.PI/8,r=ring*.25f;if(walkable(x+Mathf.Cos(a)*r,z+Mathf.Sin(a)*r))return false;}
            return true;
        }
        public static List<Vector3> D5ShrubPlan(List<Vector2> trees,Func<float,float,bool> walkable)
        {
            var result=new List<Vector3>();if(walkable==null)return result;int index=0;
            for(float z=-73;z<=-41;z+=4)for(float x=19;x<=51;x+=4)
            {
                string id="d5-shrub-"+(index++);if(H01(id,1)>.7f||!D5OffLane(x,z,walkable))continue;
                bool near=false;for(int k=0;k<12;k++){float a=k*Mathf.PI/6;if(walkable(x+Mathf.Cos(a)*2.2f,z+Mathf.Sin(a)*2.2f)){near=true;break;}}
                if(!near&&trees!=null)foreach(var tree in trees)if((tree-new Vector2(x,z)).sqrMagnitude<6.25f){near=true;break;}
                if(!near)continue;
                foreach(var offset in new[]{Vector2.zero,new Vector2(.75f,.45f),new Vector2(-.55f,.75f)})
                {float px=x+offset.x,pz=z+offset.y;if(!D5OffLane(px,pz,walkable))continue;result.Add(new Vector3(px,pz,H01(id,result.Count+3)*360));if(result.Count>=48)return result;}
            }
            return result;
        }
        void D5BuildShrubs(List<Vector2> trees,Func<float,float,bool> walkable)
        {
            if(!A2RD5.On||NativeGame.Instance==null)return;d5Shrubs=new GameObject("A2R D5 Withered_Shrub clusters");d5Shrubs.transform.SetParent(visuals.transform,false);int count=0;
            foreach(var item in D5ShrubPlan(trees,walkable))if(NativeGame.Instance.D5PlaceShrub(d5Shrubs.transform,item.x,item.y,item.z)!=null)count++;
            Debug.Log("A2R_D5_SHRUBS count="+count+" maxHeight="+D5ShrubHeight+" offLaneRadius=.75 lowGrowthHidden="+d5Growth.Count);
        }
    }
}
