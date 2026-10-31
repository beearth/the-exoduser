using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        void HellGroundSetup(Terrain ground)
        {
            var td=ground.terrainData;var layers=td.terrainLayers;if(layers.Length==0)return;
            // 기존 1025 높이맵의 2칸 간격 원본 표본. 충돌과 Core 좌표는 Terrain 원본을 유지한다.
            int stride=2,n=(td.heightmapResolution-1)/stride+1;var heights=td.GetHeights(0,0,td.heightmapResolution,td.heightmapResolution);
            var vertices=new Vector3[n*n];var uv=new Vector2[vertices.Length];var triangles=new int[(n-1)*(n-1)*6];
            for(int y=0;y<n;y++)for(int x=0;x<n;x++){int k=y*n+x;float u=x/(n-1f),v=y/(n-1f);vertices[k]=new Vector3(u*td.size.x,heights[y*stride,x*stride]*td.size.y,v*td.size.z);uv[k]=new Vector2(u,v);}
            int index=0;for(int y=0;y<n-1;y++)for(int x=0;x<n-1;x++){int a=y*n+x;triangles[index++]=a;triangles[index++]=a+n;triangles[index++]=a+1;triangles[index++]=a+1;triangles[index++]=a+n;triangles[index++]=a+n+1;}
            var mesh=new Mesh{name="기존 높이맵 표면",indexFormat=IndexFormat.UInt32};mesh.vertices=vertices;mesh.uv=uv;mesh.triangles=triangles;mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();
            var go=new GameObject("지옥 바닥 PBR 표면");go.transform.SetParent(ground.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;
            var renderer=go.AddComponent<MeshRenderer>();var material=new Material(Shader.Find("EXODUSER/HellGroundPBR"));renderer.sharedMaterial=material;renderer.shadowCastingMode=ShadowCastingMode.On;renderer.receiveShadows=true;
            material.SetTexture("_BaseMap",layers[0].diffuseTexture);material.SetTexture("_BumpMap",layers[0].normalMapTexture);
            string res="Art/map/hell_lighting/";
            foreach(var spec in new[]{new[]{"_RockMap","rock_ground_Diffuse"},new[]{"_AshMap","burned_ground_01_Diffuse"},new[]{"_RockNormal","rock_ground_nor_gl"},new[]{"_RockRough","rock_ground_Rough"}})
            {var tex=Resources.Load<Texture2D>(res+spec[1]);if(tex!=null){tex.filterMode=FilterMode.Trilinear;tex.mipMapBias=2;tex.anisoLevel=8;}material.SetTexture(spec[0],tex);}
            ground.drawHeightmap=false;ground.drawTreesAndFoliage=false;
        }
    }
}
