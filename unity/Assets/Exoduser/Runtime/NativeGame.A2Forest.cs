using System;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        // 승인 원화 구도 제작 후보. 시각·보행 검수 전에는 일반 실행에 채택하지 않는다.
        static bool A2Requested { get { return Array.IndexOf(Environment.GetCommandLineArgs(), "--unity-a2-forest") >= 0; } }
        GameObject a2Root;
        Material a2Water;
        void A2ForestSetup(Terrain ground)
        {
            if (!A2Requested) return;
            if (hellEnvironment != null) hellEnvironment.SetActive(false);
            a2Root = new GameObject("A2 썩은 숲·나무다리 제작 후보");
            a2Root.transform.SetParent(ground.transform.parent, false);
            foreach(var root in r3Roots)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
                if(r.name.StartsWith("Decals_blood",StringComparison.Ordinal))r.enabled=false;
            // LEFT/MID 주간, RIGHT 강가, TOP 먼 숲, SOUTH 낮은 전경. 중앙 전투면은 유지한다.
            A2Module("Ancient_Rotten_Tree", 33.2f,-71.2f,1.45f,1.6f,1.3f,25);
            A2Module("Ancient_Rotten_Tree", 46.7f,-65.5f,1.3f,1.7f,1.25f,155);
            A2Module("Ancient_Rotten_Tree", 53.3f,-77,1.25f,1.5f,1.4f,238);
            A2Module("Ancient_Rotten_Tree", 29.5f,-64,1.2f,1.45f,1.2f,295);
            A2Module("Fallen_Log", 34,-74,.8f,.85f,.8f,-18);
            A2Module("Fallen_Log", 46,-68.2f,.65f,.7f,.7f,38);
            A2Module("Fallen_Log", 51.3f,-73.5f,.9f,.8f,.75f,135);
            A2Module("Rotten_Wood_Bridge", 43.2f,-71.8f,1,.55f,1,-24);
            A2Module("Root_Stump",48.6f,-72.8f,.8f,.8f,.8f,35,-.25f);
            A2Module("Foreground_Branch_Frame",34,-79.5f,1.4f,.9f,1.2f,12);
            A2Module("Foreground_Branch_Frame",51,-80.8f,1.6f,.9f,1.2f,-32);
            // BACK는 3개 깊이 층으로 이어진 숲. 서로 겹치되 전투 중심에 세로 질량을 넣지 않는다.
            for (int layer=0;layer<3;layer++)
                for(int j=0;j<5;j++)
                {
                    float x=22+j*9.5f+layer*2.3f,z=-57+layer*8.5f;
                    A2Module("Ancient_Rotten_Tree",x,z,.9f+layer*.2f,1.4f+layer*.25f,1,31+j*83+layer*47);
                }
            A2Module("Forest_Vista_Card",24,-39,1.8f,2.4f,1,0);
            A2Module("Forest_Vista_Card",55,-27,2.4f,3,1,15);
            foreach(var p in new[]{new Vector3(33,-72,45),new Vector3(46.5f,-65.5f,165),new Vector3(52,-77,240),new Vector3(30,-64,15)})
            {
                A2Module("Hanging_Moss",p.x,p.y,.8f,1.05f,.8f,p.z,2.5f);
                A2Module("Fungal_Colony",p.x+1,p.y-.4f,.75f,.8f,.65f,p.z);
                A2Module("Withered_Shrub",p.x+1.2f,p.y-.8f,.8f,.8f,.8f,p.z+45);
                // 수염 이끼는 주간 접점 주위에 매달고, 지면 연결은 낮은 목질·이끼로 묶는다.
                for(int j=0;j<5;j++)
                {
                    float angle=(p.z+j*57)*Mathf.Deg2Rad;
                    A2Module("Hanging_Moss",p.x+Mathf.Cos(angle)*1.1f,p.y+Mathf.Sin(angle)*.9f,.9f,1.2f,.8f,p.z+j*57,2.2f+j*.45f);
                    A2Module("Moss_Cushion",p.x+Mathf.Cos(angle)*1.8f,p.y+Mathf.Sin(angle)*1.4f,1.2f,1,1.2f,p.z+j*57);
                    A2Module("Withered_Shrub",p.x+Mathf.Cos(angle)*2.1f,p.y+Mathf.Sin(angle)*1.7f,1.1f,1.1f,1.1f,p.z+j*57);
                    A2Module("Dead_Leaf_Litter",p.x+Mathf.Cos(angle)*2.5f,p.y+Mathf.Sin(angle)*2,1.4f,1,1.4f,p.z+j*57,.015f);
                }
            }
            A2River(ground);
            A2Torch(40.8f,-75.4f);
            A2Torch(45.4f,-68.2f);
            A2Atmosphere();
            var reflection=new GameObject("A2 독액 숲 반영");reflection.transform.SetParent(a2Root.transform,false);
            reflection.transform.position=new Vector3(50,NativeRemodel3D.GroundY(50,-72)+1,-72);
            var probe=reflection.AddComponent<ReflectionProbe>();probe.mode=ReflectionProbeMode.Realtime;probe.refreshMode=ReflectionProbeRefreshMode.OnAwake;
            probe.resolution=256;probe.size=new Vector3(100,50,100);probe.boxProjection=true;probe.intensity=.55f;
            probe.clearFlags=ReflectionProbeClearFlags.SolidColor;probe.backgroundColor=new Color(.085f,.115f,.14f);probe.farClipPlane=150;
            // 기존 검은 배경색을 실제로 이어지는 먼 숲의 안개색으로 연결한다.
            r3Cam.backgroundColor=new Color(.085f,.115f,.14f);
            r3Cam.farClipPlane=240;
            Debug.Log("[A2] 검수된 R3 스캔 자산 조립 후보. R4 HOLD 인수0·Core/충돌 변경0");
        }
        void A2Torch(float x,float z)
        {
            var source=Resources.Load<GameObject>("Art/map/a2/r3/Models/RF3_Bridge_Torch_Holder");if(source==null||hellFlameFrames==null)return;
            var pos=new Vector3(x,NativeRemodel3D.GroundY(x,z),z);
            var holder=Instantiate(source,a2Root.transform);holder.name="A2 다리 끝 횃불";holder.transform.position=pos;holder.transform.localScale=Vector3.one*.5f;
            var flame=new GameObject("A2 횃불 불꽃");flame.transform.SetParent(a2Root.transform,false);flame.transform.position=pos+Vector3.up*1.02f;flame.transform.rotation=NativeRemodelCamera.Rotation;flame.transform.localScale=Vector3.one*.14f;
            var sprite=flame.AddComponent<SpriteRenderer>();sprite.sprite=hellFlameFrames[0];sprite.color=new Color(1.8f,1.15f,.65f,1);hellFlames.Add(sprite);
            var light=flame.AddComponent<Light>();light.type=LightType.Point;light.color=new Color(1,.55f,.19f);light.range=5;light.intensity=7;light.shadows=LightShadows.Soft;light.shadowBias=.025f;light.shadowNormalBias=.1f;
        }
        void A2Atmosphere()
        {
            var shader=Shader.Find("EXODUSER/A2Atmosphere");
            foreach(var p in new[]{new Vector3(34,0,-67),new Vector3(40.5f,0,-61),new Vector3(48,0,-59)})
            {
                var ground=p;ground.y=NativeRemodel3D.GroundY(p.x,p.z);var top=ground+new Vector3(-4,13,4.5f);
                var side=Vector3.Cross((top-ground).normalized,new Vector3(0,Mathf.Sin(NativeRemodel3D.Pitch),-Mathf.Cos(NativeRemodel3D.Pitch))).normalized;
                var mesh=new Mesh{name="수관 사이 빛기둥"};mesh.vertices=new[]{top-side*.35f,top+side*.35f,ground-side*1.2f,ground+side*1.2f};mesh.uv=new[]{new Vector2(0,0),new Vector2(1,0),new Vector2(0,1),new Vector2(1,1)};mesh.triangles=new[]{0,2,1,1,2,3};mesh.RecalculateBounds();
                var shaft=new GameObject("A2 국소 달빛기둥");shaft.transform.SetParent(a2Root.transform,false);shaft.AddComponent<MeshFilter>().sharedMesh=mesh;var renderer=shaft.AddComponent<MeshRenderer>();renderer.sharedMaterial=new Material(shader);renderer.shadowCastingMode=ShadowCastingMode.Off;
            }
            // 별도의 먼 지면이 카메라 가장자리의 검은 무공간을 막는다. 보행·충돌에는 참여하지 않는다.
            var floor=new GameObject("A2 먼 숲 지면");floor.transform.SetParent(a2Root.transform,false);
            var m=new Mesh{name="먼 숲 연속 지면"};m.vertices=new[]{new Vector3(-30,-2,-100),new Vector3(110,-2,-100),new Vector3(-30,-2,70),new Vector3(110,-2,70)};m.triangles=new[]{0,2,1,1,2,3};m.RecalculateNormals();m.RecalculateBounds();floor.AddComponent<MeshFilter>().sharedMesh=m;
            var material=new Material(Shader.Find("Universal Render Pipeline/Lit"));material.SetColor("_BaseColor",new Color(.055f,.064f,.046f));material.SetFloat("_Smoothness",.08f);floor.AddComponent<MeshRenderer>().sharedMaterial=material;
        }
        GameObject A2Module(string id,float x,float z,float sx,float sy,float sz,float yaw,float lift=0)
        {
            string source=id;float units=1;
            if(id=="Ancient_Rotten_Tree"){source=x>40?"Ancient_Tree_B":"Ancient_Tree_A";units=.45f;}
            else if(id=="Rotten_Wood_Bridge")units=.75f;
            else if(id=="Fallen_Log")units=.8f;
            else if(id=="Corroded_Riverbank"){source="Moss_Rock_1";units=1.2f;}
            var prefab=Resources.Load<GameObject>(id=="Foam_Bank"?"Art/map/a2/Models/RF_Foam_Bank":"Art/map/a2/r3/Models/RF3_"+source);
            if(prefab==null){Debug.LogError("[A2] 모듈 누락 "+id);return null;}
            var go=Instantiate(prefab,a2Root.transform);go.name="A2_"+id;
            go.transform.SetPositionAndRotation(new Vector3(x,NativeRemodel3D.GroundY(x,z)+lift-.08f,z),Quaternion.Euler(0,yaw,0));
            go.transform.localScale=new Vector3(sx,sy,sz)*units;
            foreach(var r in go.GetComponentsInChildren<MeshRenderer>()){r.shadowCastingMode=id=="Forest_Vista_Card"?ShadowCastingMode.Off:ShadowCastingMode.On;r.receiveShadows=true;}
            return go;
        }
        void A2River(Terrain ground)
        {
            a2Water=new Material(Shader.Find("EXODUSER/A2ToxicRiver"));
            r3Cam.depthTextureMode|=DepthTextureMode.Depth;
            // 기존 수로 메시는 그대로 보존하고 수면 재질만 교체한다. 새 보행 수로를 임의로 만들지 않는다.
            foreach(var root in r3Roots)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
                if(r.name.StartsWith("River_",StringComparison.Ordinal)||r.name.StartsWith("Pool_",StringComparison.Ordinal))r.sharedMaterial=a2Water;
            var mesh=new Mesh{name="A2 외곽으로 이어지는 독액"};
            const int rows=81;var v=new Vector3[rows*2];var uv=new Vector2[v.Length];var tris=new int[(rows-1)*6];
            float waterHeight=NativeRemodel3D.GroundY(50.8f,-72)-.35f;
            for(int i=0;i<rows;i++)
            {
                float z=-94+i*.8f,x=A2ShoreX(z);
                float h=waterHeight;
                v[i*2]=new Vector3(x,h,z);v[i*2+1]=new Vector3(x+20,h,z);uv[i*2]=new Vector2(0,i*.1f);uv[i*2+1]=new Vector2(1,i*.1f);
                if(i==rows-1)continue;int a=i*2,k=i*6;tris[k]=a;tris[k+1]=a+2;tris[k+2]=a+1;tris[k+3]=a+1;tris[k+4]=a+2;tris[k+5]=a+3;
            }
            mesh.vertices=v;mesh.uv=uv;mesh.triangles=tris;mesh.RecalculateNormals();mesh.RecalculateBounds();
            var river=new GameObject("A2 먼 숲 독액 강");river.transform.SetParent(a2Root.transform,false);river.AddComponent<MeshFilter>().sharedMesh=mesh;
            var rr=river.AddComponent<MeshRenderer>();rr.sharedMaterial=a2Water;rr.shadowCastingMode=ShadowCastingMode.Off;
            for(int i=0;i<9;i++)
            {
                float z=-79+i*2.6f,x=A2ShoreX(z);
                A2Module("Moss_Rock_"+(i%3+1),x+2,z,.7f,.7f,.8f,92+i*9);
                A2Module("Foam_Bank",x+.35f,z,.75f,.7f,.8f,90,-.1f);
                if(i%2==0)A2Module("River_Stake_Cluster",x+1.2f,z,.6f,.8f,.6f,80+i*11,-.3f);
            }
        }
        float A2ShoreX(float z)
        {
            float x=48;while(x<95&&Simulation.CanMove(x*100,-z*100,30))x+=.2f;
            return x+.4f;
        }
        void A2CaptureFrame(string path)
        {
            var brain=r3Cam.GetComponent<Unity.Cinemachine.CinemachineBrain>();
            Remodel3DLate();brain.ManualUpdate();
            var camera=HudCamera;var old=camera.targetTexture;var active=RenderTexture.active;
            var rt=RenderTexture.GetTemporary(1920,1080,24,RenderTextureFormat.ARGB32);
            Texture2D pixels=null;
            try{camera.targetTexture=rt;camera.Render();RenderTexture.active=rt;pixels=new Texture2D(1920,1080,TextureFormat.RGB24,false);pixels.ReadPixels(new Rect(0,0,1920,1080),0,0);pixels.Apply();System.IO.File.WriteAllBytes(path,pixels.EncodeToPNG());}
            finally{camera.targetTexture=old;RenderTexture.active=active;RenderTexture.ReleaseTemporary(rt);if(pixels!=null)Destroy(pixels);}
        }
    }
}
