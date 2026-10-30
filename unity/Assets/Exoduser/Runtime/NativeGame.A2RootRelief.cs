using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        void A2RootRelief(Terrain ground)
        {
            var source=Resources.Load<GameObject>("Art/map/a2/rootrelief/Models/A2_Root_Cluster_Patch");
            var template=Resources.Load<Material>("Art/map/a2/rootrelief/Materials/A2_Root_Cluster_Patch");
            Material field=null;
            foreach(var renderer in ground.GetComponentsInChildren<MeshRenderer>())if(renderer.name=="지옥 바닥 PBR 표면")field=renderer.sharedMaterial;
            if(source==null||template==null||field==null||template.shader==null||!template.shader.isSupported)
            {Debug.LogError("[A2] 연속 뿌리 부조 자산/지면 재질 누락. 기존 거목 접합 유지");return;}
            var material=new Material(template);
            foreach(var key in new[]{"_BaseMap","_BumpMap","_RockMap","_AshMap","_RockNormal","_RockRough","_ForestMap","_ForestNormal","_ForestRough","_SoilMap","_SoilNormal","_SoilRough","_RootMap","_RootNormal","_RootRough"})
                if(field.HasProperty(key)&&material.HasProperty(key))material.SetTexture(key,field.GetTexture(key));
            foreach(var key in new[]{"_ForestBlend","_ForestTextureMix","_SoilTextureMix","_Smoothness","_Metallic","_Cutoff"})
                if(field.HasProperty(key)&&material.HasProperty(key))material.SetFloat(key,field.GetFloat(key));
            int placed=0;
            foreach(var placement in new[]{new Vector4(34.8f,-70.5f,1.7f,75),new Vector4(49,-64.8f,1.35f,170),new Vector4(53.3f,-77,1.3f,237),new Vector4(29.5f,-64,1.35f,85)})
            {
                float baseY=NativeRemodel3D.GroundY(placement.x,placement.y);
                var go=Instantiate(source,a2Root.transform);go.name="A2 연속 뿌리 부조";
                go.transform.SetPositionAndRotation(new Vector3(placement.x,baseY,placement.y),Quaternion.Euler(0,placement.w,0));go.transform.localScale=Vector3.one*placement.z;
                var filters=go.GetComponentsInChildren<MeshFilter>();
                if(filters.Length!=1||!filters[0].sharedMesh.isReadable||filters[0].sharedMesh.colors.Length!=filters[0].sharedMesh.vertexCount)
                {Debug.LogError("[A2] 부조 메시 읽기/재질 가중 누락. 기존 거목 접합 유지");go.SetActive(false);Destroy(go);continue;}
                var filter=filters[0];var mesh=Instantiate(filter.sharedMesh);var vertices=mesh.vertices;
                var center=filter.transform.TransformPoint(mesh.bounds.center);
                var horizontalCenter=new Vector3(center.x-placement.x,0,center.z-placement.y);
                for(int i=0;i<vertices.Length;i++)
                {
                    var p=filter.transform.TransformPoint(vertices[i])-horizontalCenter;float bed=A2ForestLayout.Water(p.x,p.z)&&!A2ForestLayout.Island(p.x,p.z)?A2ForestLayout.WaterLevel-.18f:NativeRemodel3D.GroundY(p.x,p.z);
                    p.y+=bed-baseY;vertices[i]=filter.transform.InverseTransformPoint(p);
                }
                mesh.vertices=vertices;mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();filter.sharedMesh=mesh;
                foreach(var renderer in go.GetComponentsInChildren<MeshRenderer>()){renderer.sharedMaterial=material;renderer.shadowCastingMode=ShadowCastingMode.On;renderer.receiveShadows=true;}
                placed++;
            }
            Debug.Log("[A2] 연속 뿌리 부조 "+placed+"개. 원본면·UV 보존/Collider 추가0");
        }
    }
}
