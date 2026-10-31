using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        sealed class CoverChunk
        {
            public readonly List<Vector3> positions=new List<Vector3>(),normals=new List<Vector3>();
            public readonly List<Vector4> tangents=new List<Vector4>();
            public readonly List<Vector2> uv=new List<Vector2>();
            public readonly List<int> triangles=new List<int>();
        }
        void A2FieldGroundCover()
        {
            var source=Resources.Load<GameObject>("Art/map/a2/r3/Models/RF3_Moss_Cushion");
            if(source==null){Debug.LogError("[A2 바닥 식생] CC0 이끼 원형 누락");return;}
            var prototype=Instantiate(source);prototype.name="A2 바닥 식생 임시 원형";
            prototype.transform.SetPositionAndRotation(Vector3.zero,Quaternion.identity);prototype.transform.localScale=Vector3.one;
            var points=new List<Vector3>();var normals=new List<Vector3>();var tangents=new List<Vector4>();var uv=new List<Vector2>();var indices=new List<int>();Material original=null;
            foreach(var mf in prototype.GetComponentsInChildren<MeshFilter>())
            {
                var mesh=mf.sharedMesh;if(!mesh.isReadable){Debug.LogError("[A2 바닥 식생] 원형 메시 읽기 누락");Destroy(prototype);return;}
                var matrix=prototype.transform.worldToLocalMatrix*mf.transform.localToWorldMatrix;int offset=points.Count;
                var v=mesh.vertices;var n=mesh.normals;var t=mesh.tangents;
                for(int i=0;i<v.Length;i++)
                {
                    points.Add(matrix.MultiplyPoint3x4(v[i]));normals.Add(matrix.MultiplyVector(n.Length==v.Length?n[i]:Vector3.up).normalized);
                    var tangent=t.Length==v.Length?t[i]:new Vector4(1,0,0,1);var dir=matrix.MultiplyVector(new Vector3(tangent.x,tangent.y,tangent.z)).normalized;tangents.Add(new Vector4(dir.x,dir.y,dir.z,tangent.w));
                }
                uv.AddRange(mesh.uv);foreach(int i in mesh.triangles)indices.Add(offset+i);
                if(original==null)original=mf.GetComponent<Renderer>().sharedMaterial;
            }
            if(points.Count==0||original==null){Destroy(prototype);return;}
            var bounds=new Bounds(points[0],Vector3.zero);foreach(var point in points)bounds.Encapsulate(point);
            float baseWidth=Mathf.Max(bounds.size.x,bounds.size.z);if(baseWidth<.01f){Destroy(prototype);return;}
            var material=new Material(original);material.name="A2 낮고 시든 이끼·고사리";material.SetColor("_BaseColor",new Color(.72f,.66f,.45f,1));material.SetFloat("_BumpScale",.35f);
            Destroy(prototype);
            var chunks=new Dictionary<Vector2Int,CoverChunk>();int plants=0;
            // 하나의 구역 질량을 8u 청크로 나누어 컬링한다. 전투 중심·목교·수면은 비운다.
            const float spacing=1.05f;
            for(int row=0;row<=95;row++)for(int column=0;column<=95;column++)
            {
                float x=-10+column*spacing+.20f*Mathf.Sin(row*.81f+column*.37f),z=-90+row*spacing+.18f*Mathf.Sin(column*.77f-row*.29f);
                if(a2Field.Distance(x,z)< -7)continue;
                float cover=a2Field.GroundCover(x,z);if(cover<.30f)continue;
                float ground=a2Field.Height(x,z);if(ground-a2Field.TerrainHeight(x,z)>.12f)continue;
                var key=new Vector2Int(Mathf.FloorToInt(x/8),Mathf.FloorToInt(z/8));
                if(!chunks.TryGetValue(key,out var chunk)){chunk=new CoverChunk();chunks.Add(key,chunk);}
                float scale=(1.15f+.45f*cover)/baseWidth,sy=Mathf.Min(scale,.28f/Mathf.Max(.01f,bounds.size.y));
                float yaw=(column*137.5f+row*71.3f)*Mathf.Deg2Rad,cos=Mathf.Cos(yaw),sin=Mathf.Sin(yaw);int start=chunk.positions.Count;
                for(int i=0;i<points.Count;i++)
                {
                    var p=points[i]-new Vector3(bounds.center.x,bounds.min.y,bounds.center.z);p=new Vector3(p.x*scale,p.y*sy,p.z*scale);
                    float wx=x+p.x*cos+p.z*sin,wz=z-p.x*sin+p.z*cos;
                    chunk.positions.Add(new Vector3(wx,a2Field.Height(wx,wz)+p.y-.012f,wz));
                    var normal=normals[i];normal=new Vector3(normal.x/scale,normal.y/sy,normal.z/scale).normalized;chunk.normals.Add(new Vector3(normal.x*cos+normal.z*sin,normal.y,-normal.x*sin+normal.z*cos).normalized);
                    var tangent=tangents[i];var td=new Vector3(tangent.x*scale,tangent.y*sy,tangent.z*scale).normalized;chunk.tangents.Add(new Vector4(td.x*cos+td.z*sin,td.y,-td.x*sin+td.z*cos,tangent.w));chunk.uv.Add(uv[i]);
                }
                foreach(int i in indices)chunk.triangles.Add(start+i);plants++;
            }
            int triangles=0;
            foreach(var pair in chunks)
            {
                var data=pair.Value;var mesh=new Mesh{name="A2 연속 이끼 지면 "+pair.Key,indexFormat=IndexFormat.UInt32};mesh.SetVertices(data.positions);mesh.SetNormals(data.normals);mesh.SetTangents(data.tangents);mesh.SetUVs(0,data.uv);mesh.SetTriangles(data.triangles,0);mesh.RecalculateBounds();
                var go=new GameObject(mesh.name);go.transform.SetParent(a2Root.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;
                var renderer=go.AddComponent<MeshRenderer>();renderer.sharedMaterial=material;renderer.receiveShadows=true;renderer.shadowCastingMode=ShadowCastingMode.Off;triangles+=data.triangles.Count/3;
            }
            Debug.Log("[A2 바닥 식생] 원본CC0/개별형태 "+plants+"/8u청크 "+chunks.Count+"/삼각형 "+triangles+"/높이<=.28u/Collider0");
        }
    }
}
