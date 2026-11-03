using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    // Optional visual height candidate. Core tiles/collision and the original field are never edited.
    public sealed class A2RDepthRelief:MonoBehaviour
    {
        sealed class Bed {public MeshFilter filter;public Mesh original,replacement;}
        readonly List<Bed> beds=new List<Bed>();A2FieldLayout original,candidate;GameObject mound;bool on;
        public int LoweredVertices {get;private set;}public float MoundRise {get{return .65f;}}
        public static bool Requested {get{return Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-depth-relief")>=0;}}
        public void Initialize(Transform world,MapData data,Vector2 camp,Func<float,float,bool> walkable,Material soil)
        {
            original=NativeRemodel3D.Field;candidate=new A2FieldLayout(data);
            // Re-register the exact original walk surfaces via their public presentation API.
            foreach(Transform child in world)
            {
                bool deck=child.name=="A2 시작 목교";if(!deck&&child.name!="A2 흙에 이어진 스캔 뿌리")continue;
                foreach(var filter in child.GetComponentsInChildren<MeshFilter>())
                {
                    if(NativeGroundSkillProjection.IsProxy(filter)||filter.sharedMesh==null||!filter.sharedMesh.isReadable)continue;var v=filter.sharedMesh.vertices;var xyz=new float[v.Length*3];for(int i=0;i<v.Length;i++){var p=filter.transform.TransformPoint(v[i]);xyz[i*3]=p.x;xyz[i*3+1]=p.y;xyz[i*3+2]=p.z;}
                    if(deck)candidate.RegisterDeckSurface(xyz,filter.sharedMesh.triangles,child.position.y+.4f);else candidate.RegisterSurface(xyz,filter.sharedMesh.triangles);
                }
            }
            var floor=world.Find("A2 전체 필드 지면");if(floor!=null)foreach(var filter in floor.GetComponentsInChildren<MeshFilter>())
            {
                if(NativeGroundSkillProjection.IsProxy(filter)||filter.sharedMesh==null||!filter.sharedMesh.isReadable)continue;var v=filter.sharedMesh.vertices;int changed=0;for(int i=0;i<v.Length;i++){var p=filter.transform.TransformPoint(v[i]);if(original.TerrainHeight(p.x,p.z)>=-.46f)continue;bool underBridge=p.x>40.5f&&p.x<46&&p.z<-66&&p.z>-77;if(!underBridge&&walkable(p.x*100,-p.z*100))continue;if(p.y<=-1.6f)continue;p.y=-1.6f;v[i]=filter.transform.InverseTransformPoint(p);changed++;}if(changed==0)continue;var clone=Instantiate(filter.sharedMesh);clone.name=filter.sharedMesh.name+" A2R nonwalk swamp bed";clone.vertices=v;clone.RecalculateNormals();clone.RecalculateTangents();clone.RecalculateBounds();beds.Add(new Bed{filter=filter,original=filter.sharedMesh,replacement=clone});LoweredVertices+=changed;
            }
            const int n=64;const float radius=6;var points=new List<Vector3>();var uv=new List<Vector2>();var tri=new List<int>();var xyzMound=new float[(n+1)*(n+1)*3];
            for(int y=0;y<=n;y++)for(int x=0;x<=n;x++){float wx=camp.x/100+(x/(float)n-.5f)*radius*2,wz=-camp.y/100+(y/(float)n-.5f)*radius*2;float distance=Vector2.Distance(new Vector2(wx,wz),new Vector2(camp.x/100,-camp.y/100))/radius;float rise=.65f*Mathf.Pow(1-Mathf.SmoothStep(0,1,distance),2);var p=new Vector3(wx,original.TerrainHeight(wx,wz)+rise+.002f,wz);int at=points.Count*3;xyzMound[at]=p.x;xyzMound[at+1]=p.y;xyzMound[at+2]=p.z;points.Add(p);uv.Add(new Vector2(wx/80,-wz/80));}
            for(int y=0;y<n;y++)for(int x=0;x<n;x++){int a=y*(n+1)+x;tri.AddRange(new[]{a,a+n+1,a+1,a+1,a+n+1,a+n+2});}candidate.RegisterSurface(xyzMound,tri.ToArray());
            mound=new GameObject("A2R optional camp mound +0.65m");mound.transform.SetParent(world,false);var mesh=new Mesh{name="A2R camp mound original ground material"};mesh.SetVertices(points);mesh.SetUVs(0,uv);mesh.SetTriangles(tri,0);mesh.RecalculateNormals();mesh.RecalculateTangents();mound.AddComponent<MeshFilter>().sharedMesh=mesh;var renderer=mound.AddComponent<MeshRenderer>();renderer.sharedMaterial=soil;renderer.shadowCastingMode=ShadowCastingMode.On;var query=new GameObject("A2R mound visible surface query");query.transform.SetParent(mound.transform,false);query.layer=28;query.AddComponent<MeshCollider>().sharedMesh=mesh;
            // Register a new receiver, never read or replace its depth material/texture properties.
            NativeGroundSkillProjection.RegisterReceiver(mound.GetComponent<MeshFilter>());SetLook(true);Debug.Log("A2R_DEPTH_RELIEF mound=0.65 loweredVertices="+LoweredVertices+" Core tiles/collision unchanged");
        }
        public void SetLook(bool enabled){on=enabled;NativeRemodel3D.Field=enabled?candidate:original;if(mound!=null)mound.SetActive(enabled);foreach(var b in beds)if(b.filter!=null)b.filter.sharedMesh=enabled?b.replacement:b.original;}
        void OnDestroy(){if(on&&NativeRemodel3D.Field==candidate)NativeRemodel3D.Field=original;foreach(var b in beds)if(b.replacement!=null)Destroy(b.replacement);}
    }
}
