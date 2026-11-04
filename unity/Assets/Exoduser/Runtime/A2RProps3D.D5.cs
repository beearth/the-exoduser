using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public static class A2RD5
    {
        public static readonly bool On=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-d5-off")<0;
        public static readonly bool Debug10=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-wind-debug10")>=0;
    }
    public sealed partial class A2RProps3D
    {
        readonly List<Mesh> d5WindMeshes=new List<Mesh>();
        // Root-space height, not each primitive's bounds: a crown and its trunk bend together.
        public static float D5WindWeight(float existing,float height,float low,float high)
        {
            if(high-low<=.00001f)return existing;
            return Math.Max(existing,Math.Max(0,Math.Min(1,(height-low)/(high-low))));
        }
        public void D5PrepareWind(GameObject model)
        {
            if(!A2RD5.On)return;
            var filters=model.GetComponentsInChildren<MeshFilter>(true);float low=float.PositiveInfinity,high=float.NegativeInfinity;
            foreach(var f in filters){if(f.sharedMesh==null||!f.sharedMesh.isReadable||f.name.Contains("portion"))continue;foreach(var v in f.sharedMesh.vertices){float y=model.transform.InverseTransformPoint(f.transform.TransformPoint(v)).y;low=Mathf.Min(low,y);high=Mathf.Max(high,y);}}
            foreach(var f in filters)
            {
                var source=f.sharedMesh;if(source==null||!source.isReadable||f.name.Contains("portion"))continue;
                var vertices=source.vertices;var colors=source.colors;if(colors.Length!=vertices.Length)colors=new Color[vertices.Length];bool changed=false;
                for(int i=0;i<vertices.Length;i++){float y=model.transform.InverseTransformPoint(f.transform.TransformPoint(vertices[i])).y;float r=D5WindWeight(colors[i].r,y,low,high);if(r>colors[i].r){colors[i].r=r;changed=true;}}
                if(!changed)continue;var mesh=Instantiate(source);mesh.name=source.name+" D5 height wind";mesh.colors=colors;f.sharedMesh=mesh;d5WindMeshes.Add(mesh);
            }
        }
        public void D5WindScale(float multiplier)
        {
            var block=new MaterialPropertyBlock();var seen=new HashSet<Material>();foreach(var r in visuals.GetComponentsInChildren<MeshRenderer>(true))for(int i=0;i<r.sharedMaterials.Length;i++)
            {
                var m=r.sharedMaterials[i];if(m==null||!m.HasProperty("_A2R3DWind"))continue;r.GetPropertyBlock(block,i);
                // Do not create a slot block over a renderer-wide sight mask.
                if(block.HasVector("_A2R3DWind")){var v=block.GetVector("_A2R3DWind");v.x*=multiplier;block.SetVector("_A2R3DWind",v);r.SetPropertyBlock(block,i);}
                if(seen.Add(m)){var v=m.GetVector("_A2R3DWind");v.x*=multiplier;m.SetVector("_A2R3DWind",v);}
            }
        }
        public void D5VisibleWind(Camera camera,string output)
        {
            var planes=GeometryUtility.CalculateFrustumPlanes(camera);var groups=new Dictionary<string,int[]>();var text=new System.Text.StringBuilder();var block=new MaterialPropertyBlock();
            foreach(var r in UnityEngine.Object.FindObjectsByType<MeshRenderer>(FindObjectsInactive.Exclude,FindObjectsSortMode.None))
            {
                if(!r.enabled||r.name.Contains("portion")||!GeometryUtility.TestPlanesAABB(planes,r.bounds)||(occlusion!=null&&!occlusion.CaptureLodIncluded(r)))continue;
                var f=r.GetComponent<MeshFilter>();float maxR=0;if(f!=null&&f.sharedMesh!=null&&f.sharedMesh.isReadable)foreach(var color in f.sharedMesh.colors)maxR=Mathf.Max(maxR,color.r);
                for(int i=0;i<r.sharedMaterials.Length;i++){var m=r.sharedMaterials[i];if(m==null)continue;r.GetPropertyBlock(block,i);if(!block.HasVector("_A2R3DWind"))r.GetPropertyBlock(block);var wind=block.HasVector("_A2R3DWind")?block.GetVector("_A2R3DWind"):m.HasProperty("_A2R3DWind")?m.GetVector("_A2R3DWind"):Vector4.zero;int[] count;if(!groups.TryGetValue(m.shader.name,out count)){count=new int[3];groups[m.shader.name]=count;}count[0]++;if(wind.x>0)count[1]++;if(maxR>.4f)count[2]++;string name=r.name;for(var t=r.transform.parent;t!=null;t=t.parent)name=t.name+"/"+name;text.AppendLine(name+" shader="+m.shader.name+" slot="+i+" amp="+wind.x+" Rmax="+maxR+" instancing="+m.enableInstancing);}
            }
            foreach(var pair in groups)text.Insert(0,pair.Key+" visibleSlots="+pair.Value[0]+" nonzeroAmp="+pair.Value[1]+" RmaxAbove04="+pair.Value[2]+"\n");
            text.Insert(0,"time="+Time.time+" windOn="+Shader.GetGlobalFloat("_A2R3DWindOn")+" windOff="+Shader.GetGlobalFloat("_A2RWindOff")+"\n");System.IO.File.WriteAllText(output,text.ToString());
        }
        public List<GameObject> D5Hide(string category)
        {
            var hidden=new List<GameObject>();foreach(Transform t in visuals.GetComponentsInChildren<Transform>(true))
            {
                bool match=category=="ao"?t.name=="A2R 3D rooted foot AO":category=="hellrot"?t.name=="detail":category=="d4"?t.name.Contains("flesh_root_")||t.name.Contains("corpse_")||t.name.Contains("bone_pile_"):category=="d3"?t.name.Contains("r3_tree_")||t.name.Contains("r3_prop_"):false;
                if(match&&t.gameObject.activeInHierarchy){hidden.Add(t.gameObject);t.gameObject.SetActive(false);}
            }return hidden;
        }
        void OnDestroy(){foreach(var mesh in d5WindMeshes)if(mesh!=null)Destroy(mesh);d5WindMeshes.Clear();}
    }
}
