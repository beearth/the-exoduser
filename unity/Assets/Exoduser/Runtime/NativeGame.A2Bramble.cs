using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        Mesh[] a2BrambleMeshes;
        Material a2BrambleMaterial;

        void A2Bramble(GameObject root,float x,float z)
        {
            if(a2BrambleMeshes==null)
            {
                var bark=Resources.Load<Material>("Art/map/a2/hollow/Materials/A2_Loft_Bark");
                if(bark==null){Debug.LogError("[A2] 고사 덤불 목질 누락. 기존 사진 덤불 유지");return;}
                a2BrambleMaterial=new Material(bark);a2BrambleMaterial.name="A2 마른 잔가지 목질";
                a2BrambleMaterial.SetColor("_BaseColor",new Color(1.1f,.8f,.5f));
                a2BrambleMaterial.SetFloat("_Smoothness",0);a2BrambleMaterial.SetFloat("_BumpScale",.45f);
                a2BrambleMaterial.SetFloat("_SpecularHighlights",0);a2BrambleMaterial.EnableKeyword("_SPECULARHIGHLIGHTS_OFF");
                a2BrambleMaterial.SetFloat("_EnvironmentReflections",0);a2BrambleMaterial.EnableKeyword("_ENVIRONMENTREFLECTIONS_OFF");
                a2BrambleMeshes=new Mesh[3];for(int i=0;i<3;i++)a2BrambleMeshes[i]=A2BrambleMesh(i);
            }
            foreach(var renderer in root.GetComponentsInChildren<MeshRenderer>())renderer.enabled=false;
            var go=new GameObject("A2 입체 고사 덤불");go.transform.SetParent(root.transform,false);
            int variant=Mathf.Abs(Mathf.RoundToInt(x*17+z*31))%3;
            go.AddComponent<MeshFilter>().sharedMesh=a2BrambleMeshes[variant];go.AddComponent<MeshRenderer>().sharedMaterial=a2BrambleMaterial;
        }

        static Mesh A2BrambleMesh(int variant)
        {
            var points=new List<Vector3>();var uv=new List<Vector2>();var triangles=new List<int>();
            for(int stem=0;stem<13;stem++)
            {
                float angle=stem*2.399963f+variant*.71f,h=.85f+.40f*(.5f+.5f*Mathf.Sin(stem*7.1f+variant));
                var radial=new Vector3(Mathf.Cos(angle),0,Mathf.Sin(angle));var side=Vector3.Cross(Vector3.up,radial);
                var start=radial*(.05f+.07f*(stem%3));var end=radial*(.25f+.28f*(stem%4)/3f)+Vector3.up*h;
                var bend=side*(.08f*Mathf.Sin(stem*4.1f));
                A2Twig(points,uv,triangles,start,end,bend,.032f,6,5);
                for(int branch=0;branch<3;branch++)
                {
                    float u=.3f+branch*.22f,sign=(stem+branch)%2==0?1:-1;
                    var from=Vector3.Lerp(start,end,u)+bend*Mathf.Sin(u*Mathf.PI);
                    var to=from+radial*(.20f+.08f*branch)+side*sign*(.17f+.07f*(stem%3))+Vector3.up*(.26f+.07f*branch);
                    A2Twig(points,uv,triangles,from,to,radial*.06f,.011f,4,5);
                    for(int fork=0;fork<2;fork++)
                    {
                        var origin=Vector3.Lerp(from,to,.46f+fork*.25f);
                        var tip=origin+radial*.12f+side*sign*(fork==0?-.14f:.13f)+Vector3.up*(.19f+.06f*fork);
                        A2Twig(points,uv,triangles,origin,tip,side*.025f,.0065f,3,4);
                    }
                }
            }
            var mesh=new Mesh{name="A2 고사 가지 군집 "+variant};mesh.SetVertices(points);mesh.SetUVs(0,uv);mesh.SetTriangles(triangles,0);mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();return mesh;
        }

        static void A2Twig(List<Vector3> points,List<Vector2> uv,List<int> triangles,Vector3 from,Vector3 to,Vector3 bend,float radius,int rings,int sides)
        {
            int start=points.Count;float length=Vector3.Distance(from,to);
            for(int ring=0;ring<=rings;ring++)
            {
                float u=ring/(float)rings;var center=Vector3.Lerp(from,to,u)+bend*Mathf.Sin(u*Mathf.PI);
                var tangent=(to-from+bend*(Mathf.PI*Mathf.Cos(u*Mathf.PI))).normalized;
                var side=Vector3.Cross(tangent,Mathf.Abs(tangent.y)>.95f?Vector3.right:Vector3.up).normalized;var normal=Vector3.Cross(tangent,side);
                float width=Mathf.Lerp(radius,.0008f,Mathf.Pow(u,.8f));
                for(int s=0;s<=sides;s++)
                {
                    float angle=s*2*Mathf.PI/sides;points.Add(center+(side*Mathf.Cos(angle)+normal*Mathf.Sin(angle))*width);uv.Add(new Vector2(s/(float)sides,u*length*2));
                    if(ring==rings||s==sides)continue;int a=start+ring*(sides+1)+s,b=a+sides+1;
                    triangles.Add(a);triangles.Add(a+1);triangles.Add(b);triangles.Add(a+1);triangles.Add(b+1);triangles.Add(b);
                }
            }
        }

        void A2BridgeMoss()
        {
            foreach(float side in new[]{-1f,1f})for(int j=0;j<5;j++)
            {
                float u=-3.4f+j*1.7f,w=side*1.58f;
                float x=A2ForestLayout.BridgeX+u*A2ForestLayout.SinYaw+w*A2ForestLayout.CosYaw,z=A2ForestLayout.BridgeZ+u*A2ForestLayout.CosYaw-w*A2ForestLayout.SinYaw;
                var go=A2Module("Hanging_Moss",x,z,.30f,.38f,.25f,24+side*90);if(go==null)continue;go.name="A2 다리 회갈색 이끼";
                var renderer=go.GetComponentInChildren<MeshRenderer>();var bounds=renderer.bounds;go.transform.position+=new Vector3(0,.65f-bounds.max.y,0);
                var block=new MaterialPropertyBlock();block.SetColor("_BaseColor",new Color(.62f,.63f,.43f,1));renderer.SetPropertyBlock(block);
            }
        }
    }
}
