using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
namespace Exoduser.UnityPort
{
    // 무료 CC0 키트로 길 경계와 외곽의 큰 형태를 만든다. 표현 전용이고 Collider를 만들지 않는다.
    public sealed partial class NativeGame
    {
        sealed class KitPiece { public Mesh mesh; public Material[] materials; }

        static KitPiece A2KitLoad(string name)
        {
            var prefab=Resources.Load<GameObject>("Art/map/a2/cc0/Models/"+name);
            if(prefab==null){Debug.LogError("[A2 키트] 모델 누락 "+name);return null;}
            MeshRenderer best=null;
            foreach(var r in prefab.GetComponentsInChildren<MeshRenderer>(true))
                if(best==null||r.name.EndsWith("_LOD1",System.StringComparison.Ordinal))best=r;
            if(best==null)return null;
            foreach(var m in best.sharedMaterials)if(m!=null){m.enableInstancing=true;m.SetFloat("_Smoothness",.08f);m.SetFloat("_Metallic",0);m.SetFloat("_SpecularHighlights",0);m.EnableKeyword("_SPECULARHIGHLIGHTS_OFF");m.SetFloat("_EnvironmentReflections",0);m.EnableKeyword("_ENVIRONMENTREFLECTIONS_OFF");}
            return new KitPiece{mesh=best.GetComponent<MeshFilter>().sharedMesh,materials=best.sharedMaterials};
        }

        static KitPiece[] A2KitLoadAll(params string[] names)
        {
            var r=new List<KitPiece>();
            foreach(var n in names){var k=A2KitLoad(n);if(k!=null)r.Add(k);}
            return r.ToArray();
        }

        void A2KitField()
        {
            var timer=System.Diagnostics.Stopwatch.StartNew();
            var rocks=A2KitLoadAll("B_Rock_01","B_Rock_02","B_Rock_03","B_Rock_04","B_Rock_05");
            var woods=A2KitLoadAll("B_Log_01","B_Log_02","B_Log_03","B_Stump_01","B_Stump_02");
            if(rocks.Length==0||woods.Length==0)return;
            var root=new GameObject("A2 CC0 키트");root.transform.SetParent(a2Root.transform,false);
            var rng=new System.Random(211);int count=0;
            float Rand(float a,float b){return a+(float)rng.NextDouble()*(b-a);}
            void Put(KitPiece k,float x,float z,float scale,float sink)
            {
                var go=new GameObject(k.mesh.name);go.transform.SetParent(root.transform,false);
                go.transform.SetPositionAndRotation(new Vector3(x,a2Field.TerrainHeight(x,z)-sink*scale,z),Quaternion.Euler(Rand(-7,7),Rand(0,360),Rand(-7,7)));
                go.transform.localScale=Vector3.one*scale;
                go.AddComponent<MeshFilter>().sharedMesh=k.mesh;
                var r=go.AddComponent<MeshRenderer>();r.sharedMaterials=k.materials;r.shadowCastingMode=ShadowCastingMode.On;r.receiveShadows=true;r.lightProbeUsage=LightProbeUsage.Off;
                count++;
            }
            for(float z=-104;z<16;z+=1.5f)for(float x=-26;x<106;x+=1.5f)
            {
                float px=x+Rand(-.6f,.6f),pz=z+Rand(-.6f,.6f);
                if(a2Field.Water(px,pz))continue;
                float d=a2Field.Distance(px,pz);if(d>-.55f||d<-16)continue;
                // 카메라 앞쪽 경계에는 낮은 형태만 둬서 길 위의 발밑을 가리지 않는다.
                float front=Mathf.Clamp01((a2Field.Distance(px,pz+2)-d)/2);
                float cluster=Mathf.PerlinNoise(px*.17f+3,pz*.17f+11);
                if(d>-3.2f)
                {
                    if(rng.NextDouble()>.3f+.55f*Mathf.SmoothStep(.35f,.6f,cluster))continue;
                    Put(rocks[rng.Next(rocks.Length)],px,pz,Rand(.55f,1.05f)*Mathf.Lerp(1,.55f,front),.28f);
                }
                else if(rng.NextDouble()<.2f)
                {
                    if(rng.NextDouble()<.72f)Put(rocks[rng.Next(rocks.Length)],px,pz,Rand(1,1.9f)*Mathf.Lerp(1,.6f,front),.3f);
                    else Put(woods[rng.Next(woods.Length)],px,pz,Rand(.9f,1.4f),.05f);
                }
            }
            A2CanopyLight();
            Debug.Log("[A2 키트] 배치 "+count+" "+timer.ElapsedMilliseconds+"ms");
        }

        // 숲 지붕 사이로 떨어지는 빛 웅덩이. 어두운 면은 차가운 환경광이 맡는다.
        void A2CanopyLight()
        {
            const int size=256;
            var cookie=R3Track(new Texture2D(size,size,TextureFormat.RGBA32,false,true){name="A2 숲 지붕 빛",wrapMode=TextureWrapMode.Repeat,filterMode=FilterMode.Bilinear});
            var pixels=new Color32[size*size];
            for(int y=0;y<size;y++)for(int x=0;x<size;x++)
            {
                float u=x*Mathf.PI*2/size,v=y*Mathf.PI*2/size;
                float n=.5f+.26f*Mathf.Sin(u*2+Mathf.Sin(v*3)*1.3f)+.2f*Mathf.Sin(v*3+Mathf.Sin(u*2)*1.6f)+.1f*Mathf.Sin(u*5+v*4);
                byte b=(byte)(Mathf.Lerp(.05f,1,Mathf.SmoothStep(.56f,.78f,n))*255);
                pixels[y*size+x]=new Color32(b,b,b,b);
            }
            cookie.SetPixels32(pixels);cookie.Apply(false,true);
            foreach(var root in r3Roots)if(root!=null)foreach(var light in root.GetComponentsInChildren<Light>(true))
            {
                if(light.type!=LightType.Directional)continue;
                light.color=new Color(1,.84f,.68f);light.intensity=2.3f;light.shadowStrength=.9f;light.cookie=cookie;
                var data=light.GetComponent<UniversalAdditionalLightData>();if(data==null)data=light.gameObject.AddComponent<UniversalAdditionalLightData>();
                data.lightCookieSize=new Vector2(34,34);
            }
        }
    }
}
