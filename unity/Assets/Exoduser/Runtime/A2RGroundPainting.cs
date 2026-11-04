using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    // Projection follows the existing terrain; no height/collision writer is introduced.
    public static class A2RGroundPainting
    {
        static Texture2D Art(string id){long t0=A2RStage.Tick();var t=Resources.Load<Texture2D>("A2R/C10/Art/"+id);long elapsed=A2RStage.Tick()-t0;A2RStage.Acc("지면타일 Art Load",t0);A2RLoadProbe.GroundLoaded(id,t,elapsed);if(t==null)throw new InvalidOperationException("Missing C10 painting: "+id);return t;}
        static Material Paint(string id,bool water)
        {
            var shader=Resources.Load<Shader>("A2R/GroundPainting");if(shader==null)throw new InvalidOperationException("A2R GroundPainting shader missing");var m=new Material(shader){name="C10 projected "+id,renderQueue=water?3010:2475};m.SetTexture("_MainTex",Art(id));m.SetTexture("_NormalTex",Art(id+"_normal"));m.SetTexture("_MaskTex",Art(id+"_mask"));m.SetTexture("_WaterTex",Art("r3_water"));m.SetFloat("_Water",water?1:0);return m;
        }
        static void Place(Transform root,string name,List<Vector3> vertices,List<Vector2> uv,List<int> triangles,Material material,List<Color> colors=null)
        {
            var mesh=new Mesh{name=name};mesh.SetVertices(vertices);mesh.SetUVs(0,uv);mesh.SetTriangles(triangles,0);if(colors!=null)mesh.SetColors(colors);mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();var go=new GameObject(name);go.transform.SetParent(root,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=material;r.shadowCastingMode=ShadowCastingMode.Off;r.receiveShadows=true;
        }
        public static int Build(Transform root,A2RWebAssets.Tile[] tiles,A2RWebAssets.River[] river,Func<float,float,float,bool> canMove,Material actualWater)
        {
            if(tiles==null||tiles.Length!=64)throw new InvalidOperationException("C10 ground requires all 64 original tiles");
            A2RLoadProbe.BeginGround();
            foreach(var tile in tiles)
            {
                long tm=A2RStage.Tick();var vertices=new List<Vector3>();var uv=new List<Vector2>();var triangles=new List<int>();const int n=40;
                for(int y=0;y<=n;y++)for(int x=0;x<=n;x++){float wx=(tile.x+x/(float)n)*10,wz=-(tile.y+y/(float)n)*10;vertices.Add(new Vector3(wx,NativeRemodel3D.GroundY(wx,wz)+.012f,wz));uv.Add(new Vector2(x/(float)n,1-y/(float)n));}
                for(int y=0;y<n;y++)for(int x=0;x<n;x++){int a=y*(n+1)+x;triangles.AddRange(new[]{a,a+1,a+n+1,a+1,a+n+2,a+n+1});}
                A2RStage.Acc("지면타일 정점계산",tm);tm=A2RStage.Tick();Place(root,"C10 terrain projection "+tile.asset,vertices,uv,triangles,Paint(tile.asset,false));A2RStage.Acc("지면타일 Place+Paint(Art포함)",tm);
            }
            if(river!=null&&river.Length>1)
            {
                var vertices=new List<Vector3>();var uv=new List<Vector2>();var triangles=new List<int>();var colors=new List<Color>();int row=0;
                for(int s=0;s+1<river.Length;s++)for(int k=0;k<=24;k++)
                {
                    float t=k/24f;Vector3 At(int i){var p=river[Mathf.Clamp(i,0,river.Length-1)];return new Vector3(p.x,p.y,p.width);}var a=At(s-1);var b=At(s);var c=At(s+1);var d=At(s+2);var q=.5f*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);q.x+=24*Mathf.Sin(q.y*.007f)+12*Mathf.Sin(q.y*.015f);q.z+=28*Mathf.Sin(q.y*.0055f)+18*Mathf.Cos(q.y*.012f);float px=q.x,py=q.y,width=q.z;
                    for(int j=0;j<=16;j++){float u=j/16f,wx=(px+(u*2-1)*width)/100,wz=-py/100;vertices.Add(new Vector3(wx,-.445f,wz));uv.Add(new Vector2(u,(py-3200)/1800));colors.Add(new Color(1,1,1,canMove(wx*100,-wz*100,0)?0:1));}
                    if(row>0)for(int j=0;j<16;j++){int cell=row*17+j;triangles.AddRange(new[]{cell-17,cell-16,cell,cell-16,cell+1,cell});}row++;
                }
                // The diffuse-only moat cap hid the actual surface reflections. Both meshes now
                // share the existing real water material/planar reflection, with C10 water paint.
                Place(root,"C10 original moat strip and banks",vertices,uv,triangles,actualWater,colors);
            }
            A2RLoadProbe.EndGround();A2RStage.Dump("지면타일");return tiles.Length;
        }
    }
}
