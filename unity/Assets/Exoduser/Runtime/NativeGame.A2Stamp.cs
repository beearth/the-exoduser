using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    // 1-1 필드 대량 산포. 표현 전용(Collider 0)이고 Core 보행·판정은 읽기만 한다.
    public sealed partial class NativeGame
    {
        sealed class StampKind { public Vector3[] v,n; public Color32[] c; public int[] i; public float top; }
        sealed class StampChunk
        {
            public readonly List<Vector3> v=new List<Vector3>(),n=new List<Vector3>();
            public readonly List<Color32> c=new List<Color32>();
            public readonly List<Vector2> uv=new List<Vector2>();
            public readonly List<int> i=new List<int>();
        }
        readonly List<Vector3> a2StampSites=new List<Vector3>(); // x, z, 반경

        static StampKind A2StampLoad(string name)
        {
            var asset=Resources.Load<TextAsset>("Art/map/a2/hellrot/"+name);
            if(asset==null){Debug.LogError("[A2 산포] 메시 누락 "+name);return null;}
            var b=asset.bytes;int vc=System.BitConverter.ToInt32(b,0),ic=System.BitConverter.ToInt32(b,4),o=8;
            var k=new StampKind{v=new Vector3[vc],n=new Vector3[vc],c=new Color32[vc],i=new int[ic]};
            // glTF는 오른손 좌표계라 X를 뒤집고 삼각형 순서를 바꾼다. Cull Off여도 법선 방향을 맞춘다.
            for(int j=0;j<vc;j++,o+=12){k.v[j]=new Vector3(-System.BitConverter.ToSingle(b,o),System.BitConverter.ToSingle(b,o+4),System.BitConverter.ToSingle(b,o+8));k.top=Mathf.Max(k.top,k.v[j].y);}
            for(int j=0;j<vc;j++,o+=12)k.n[j]=new Vector3(-System.BitConverter.ToSingle(b,o),System.BitConverter.ToSingle(b,o+4),System.BitConverter.ToSingle(b,o+8));
            for(int j=0;j<vc;j++,o+=4)k.c[j]=new Color32(b[o],b[o+1],b[o+2],b[o+3]);
            for(int j=0;j<ic;j++,o+=4)k.i[j]=System.BitConverter.ToInt32(b,o);
            for(int j=0;j+2<ic;j+=3){int t=k.i[j+1];k.i[j+1]=k.i[j+2];k.i[j+2]=t;}
            return k;
        }

        static StampKind[] A2StampLoadAll(params string[] names)
        {
            var r=new List<StampKind>();
            foreach(var n in names){var k=A2StampLoad(n);if(k!=null)r.Add(k);}
            return r.ToArray();
        }

        void A2StampField()
        {
            var timer=System.Diagnostics.Stopwatch.StartNew();
            var shader=Shader.Find("EXODUSER/A2Stamp");
            if(shader==null){Debug.LogError("[A2 산포] 셰이더 누락");return;}
            var low=A2StampLoadAll("vein_grass_a","vein_grass_b","root_sprout_a","root_sprout_b");
            var dots=A2StampLoadAll("pustule_cluster_a","pustule_cluster_b","bone_shards_a","bone_shards_b","spore_stalk_a","spore_stalk_b");
            var tall=A2StampLoadAll("bonethorn_bush_a","bonethorn_bush_b");
            var edge=A2StampLoadAll("thorn_border_a","thorn_border_b","thorn_border_c");
            if(low.Length==0||dots.Length==0||tall.Length==0||edge.Length==0)return;

            var rng=new System.Random(101);
            var chunks=new Dictionary<int,StampChunk>();
            int count=0;
            float Rand(float a,float b){return a+(float)rng.NextDouble()*(b-a);}
            StampKind Pick(StampKind[] a){return a[rng.Next(a.Length)];}
            void Put(StampKind k,float x,float z,float scale,float yaw)
            {
                int key=Mathf.FloorToInt((x+40)/10)*1000+Mathf.FloorToInt((z+140)/10);
                if(!chunks.TryGetValue(key,out var c)){c=new StampChunk();chunks[key]=c;}
                float y=a2Field.TerrainHeight(x,z)-.02f;var q=Quaternion.Euler(0,yaw,0);int b=c.v.Count;float phase=Rand(0,6.28f);
                for(int j=0;j<k.v.Length;j++)
                {
                    var p=k.v[j];
                    c.v.Add(q*(p*scale)+new Vector3(x,y,z));c.n.Add(q*k.n[j]);c.c.Add(k.c[j]);
                    c.uv.Add(new Vector2(Mathf.Clamp01(p.y/Mathf.Max(.01f,k.top)),phase));
                }
                for(int j=0;j<k.i.Length;j++)c.i.Add(b+k.i[j]);
                count++;
            }

            const float cell=.72f;
            for(float gz=-108;gz<20;gz+=cell)for(float gx=-30;gx<110;gx+=cell)
            {
                float x=gx+Rand(-.34f,.34f),z=gz+Rand(-.34f,.34f);
                if(a2Field.Water(x,z)||a2Field.Height(x,z)-a2Field.TerrainHeight(x,z)>.08f)continue;
                float d=a2Field.Distance(x,z);
                float clump=Mathf.PerlinNoise(x*.11f+7,z*.11f+3),fine=Mathf.PerlinNoise(x*.47f+21,z*.47f+9);
                float chance,scale,r=(float)rng.NextDouble();StampKind k;
                if(d<-.2f){chance=.82f;k=d<-1.1f&&r<.38f?Pick(tall):r<.85f?Pick(low):Pick(dots);scale=Rand(1.2f,1.9f);}
                else
                {
                    chance=.05f+.62f*Mathf.SmoothStep(.46f,.72f,clump*.75f+fine*.25f);
                    if(d<1.2f)chance=Mathf.Max(chance,.5f);
                    k=r<.74f?Pick(low):Pick(dots);scale=Rand(.95f,1.45f);
                }
                if(rng.NextDouble()>chance)continue;
                Put(k,x,z,scale,Rand(0,360));
            }
            foreach(var s in a2StampSites)for(int j=0;j<26;j++)
            {
                float a=Rand(0,6.28f),radius=s.z*Rand(.45f,1.05f),x=s.x+Mathf.Cos(a)*radius,z=s.y+Mathf.Sin(a)*radius;
                if(a2Field.Water(x,z))continue;
                if(a2Field.Distance(x,z)>-.3f){Put(Pick(low),x,z,Rand(1,1.5f),a*Mathf.Rad2Deg);continue;}
                Put(j%3==0?Pick(tall):j%3==1?Pick(edge):Pick(low),x,z,Rand(1.1f,1.7f),a*Mathf.Rad2Deg+90);
            }

            var material=new Material(shader){name="A2 대량 산포"};
            var root=new GameObject("A2 대량 산포");root.transform.SetParent(a2Root.transform,false);
            int verts=0;
            foreach(var pair in chunks)
            {
                var c=pair.Value;
                var mesh=new Mesh{name="A2 산포 청크",indexFormat=IndexFormat.UInt32};
                mesh.SetVertices(c.v);mesh.SetNormals(c.n);mesh.SetColors(c.c);mesh.SetUVs(0,c.uv);mesh.SetTriangles(c.i,0,true);mesh.UploadMeshData(true);
                verts+=c.v.Count;
                var go=new GameObject("청크");go.transform.SetParent(root.transform,false);
                go.AddComponent<MeshFilter>().sharedMesh=mesh;
                var mr=go.AddComponent<MeshRenderer>();mr.sharedMaterial=material;mr.shadowCastingMode=ShadowCastingMode.Off;mr.receiveShadows=true;mr.lightProbeUsage=LightProbeUsage.Off;mr.reflectionProbeUsage=ReflectionProbeUsage.Off;
            }
            Debug.Log("[A2 산포] 인스턴스 "+count+" 청크 "+chunks.Count+" 정점 "+verts+" "+timer.ElapsedMilliseconds+"ms");
        }
    }
}
