using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // RB1-8a greybox. Final roots/materials/water/occlusion belong to 8b..8d.
    public sealed class NativeArena3DView : IDisposable
    {
        readonly GameObject root;
        readonly BossArenaLayout layout;
        readonly List<GameObject> pillars=new List<GameObject>();
        Material grey; Mesh mesh; MeshFilter surface; int exits;
        public BossArenaLayout Layout { get { return layout; } }
        public NativeArena3DView(Transform parent,BossArenaLayout arena)
        {
            layout=arena;root=new GameObject("RB1-8a 회색 보스 아레나");root.transform.SetParent(parent,false);
            try
            {
                var shader=Shader.Find("Universal Render Pipeline/Lit");if(shader==null)throw new InvalidOperationException("URP/Lit missing");
                grey=new Material(shader){name="RB1-8a 회색 검수"};grey.SetColor("_BaseColor",new Color(.38f,.4f,.42f));grey.SetFloat("_Smoothness",.12f);grey.SetFloat("_Cull",0);
                surface=root.AddComponent<MeshFilter>();var renderer=root.AddComponent<MeshRenderer>();renderer.sharedMaterial=grey;renderer.shadowCastingMode=ShadowCastingMode.On;renderer.receiveShadows=true;
                Rebuild();
            }
            catch { Dispose();throw; }
        }
        void Rebuild()
        {
            var plan=NativeArena3DPlan.Build(layout);var vertices=new Vector3[plan.Vertices.Count];
            for(int i=0;i<vertices.Length;i++){var v=plan.Vertices[i];vertices[i]=new Vector3(v.X,v.Y,v.Z);}
            var next=new Mesh{name="RB1-8a 아레나 타일·연속 외곽",indexFormat=IndexFormat.UInt32};
            next.vertices=vertices;next.SetTriangles(plan.Triangles,0);next.RecalculateNormals();next.RecalculateBounds();
            surface.sharedMesh=next;if(mesh!=null)UnityEngine.Object.Destroy(mesh);mesh=next;
        }
        public void Sync(Simulation sim)
        {
            if(exits!=sim.Stage.Exits.Count){exits=sim.Stage.Exits.Count;Rebuild();}
            var data=sim.DruidPillars;
            while(pillars.Count>data.Count){int i=pillars.Count-1;UnityEngine.Object.Destroy(pillars[i]);pillars.RemoveAt(i);}
            while(pillars.Count<data.Count)
            {
                var go=GameObject.CreatePrimitive(PrimitiveType.Cylinder);go.name="RB1-8a Core 뿌리 기둥";go.transform.SetParent(root.transform,false);
                var collider=go.GetComponent<Collider>();if(collider!=null){collider.enabled=false;UnityEngine.Object.Destroy(collider);}
                var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterial=grey;renderer.shadowCastingMode=ShadowCastingMode.On;renderer.receiveShadows=true;pillars.Add(go);
            }
            for(int i=0;i<data.Count;i++){var p=data[i];pillars[i].transform.localPosition=new Vector3((float)p.X/100,NativeArena3DPlan.GroundHeight+1.6f,-(float)p.Y/100);pillars[i].transform.localScale=new Vector3((float)p.R/50,1.6f,(float)p.R/50);}
        }
        public void SetActive(bool on){if(root!=null)root.SetActive(on);}
        public void Dispose(){if(root!=null){root.SetActive(false);UnityEngine.Object.Destroy(root);}if(mesh!=null)UnityEngine.Object.Destroy(mesh);if(grey!=null)UnityEngine.Object.Destroy(grey);}
    }
}
