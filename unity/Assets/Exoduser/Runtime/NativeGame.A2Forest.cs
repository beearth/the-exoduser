using System;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        // 승인 원화 구도 제작 후보. 시각·보행 검수 전에는 일반 실행에 채택하지 않는다.
        static bool A2Requested
        {
            get
            {
                var args=Environment.GetCommandLineArgs();
                return Array.IndexOf(args,"--unity-a2-forest")>=0 || (Application.isEditor&&Array.IndexOf(args,"--unity-qa-sandbox")>=0&&Environment.GetEnvironmentVariable("EXO_A2_EDITOR_PREVIEW")=="1");
            }
        }
        GameObject a2Root;
        Material a2Water;
        void A2ForestSetup(Terrain ground)
        {
            if (!A2Requested) return;
            var timer=System.Diagnostics.Stopwatch.StartNew();Debug.Log("[A2 초기화] 숲 조립 시작");
            NativeRemodel3D.ForestA2=true;
            foreach(var root in r3Roots)foreach(var volume in root.GetComponentsInChildren<UnityEngine.Rendering.Volume>(true))
            {
                var profile=volume.profile;if(profile==null)continue;
                UnityEngine.Rendering.Universal.ColorAdjustments tone;if(profile.TryGet<UnityEngine.Rendering.Universal.ColorAdjustments>(out tone)){tone.postExposure.Override(.9f);tone.contrast.Override(8);}
            }
            foreach(var r in ground.GetComponentsInChildren<MeshRenderer>())
                if(r.name=="지옥 바닥 PBR 표면")
                {
                    var m=r.sharedMaterial;m.SetFloat("_ForestBlend",1);
                    foreach(var key in new[]{"_RockMap","_AshMap","_RockNormal","_RockRough"}){var tex=m.GetTexture(key);if(tex!=null)tex.mipMapBias=0;}
                    var color=Resources.Load<Texture2D>("Art/map/a2/ground/A2_ForestFloor_BaseColor");
                    var normal=Resources.Load<Texture2D>("Art/map/a2/ground/A2_ForestFloor_Normal");
                    var rough=Resources.Load<Texture2D>("Art/map/a2/ground/A2_ForestFloor_Roughness");
                    if(color!=null&&normal!=null&&rough!=null){m.SetTexture("_ForestMap",color);m.SetTexture("_ForestNormal",normal);m.SetTexture("_ForestRough",rough);m.SetFloat("_ForestTextureMix",.7f);}
                    else Debug.LogWarning("[A2] 낙엽 PBR 누락. 기존 숲 흙 재질 폴백");
                }
            var aa=UnityEngine.Rendering.Universal.CameraExtensions.GetUniversalAdditionalCameraData(r3Cam);aa.antialiasing=UnityEngine.Rendering.Universal.AntialiasingMode.SubpixelMorphologicalAntiAliasing;aa.antialiasingQuality=UnityEngine.Rendering.Universal.AntialiasingQuality.High;
            if (hellEnvironment != null) hellEnvironment.SetActive(false);
            a2Root = new GameObject("A2 썩은 숲·나무다리 제작 후보");
            a2Root.transform.SetParent(ground.transform.parent, false);
            var oldFire=GameObject.Find("실제 철제 지옥불 화로");if(oldFire!=null)oldFire.SetActive(false);
            foreach(var root in r3Roots)foreach(var light in root.GetComponentsInChildren<Light>(true))
                if(light.name.StartsWith("Pool_Hell",StringComparison.Ordinal))light.intensity=0;
            foreach(var root in r3Roots)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
                if(r.name.StartsWith("Decals_blood",StringComparison.Ordinal))r.enabled=false;
            // LEFT/MID 주간, RIGHT 강가, TOP 먼 숲, SOUTH 낮은 전경. 중앙 전투면은 유지한다.
            A2RootedTree(34.8f,-70.5f,1.8f,1.6f,1.65f,25);
            A2RootedTree(49,-64.8f,1.3f,1.7f,1.25f,155);
            A2RootedTree(53.3f,-77,1.25f,1.5f,1.4f,238);
            A2RootedTree(29.5f,-64,1.2f,1.45f,1.2f,295);
            A2Module("Fallen_Log", 34,-74,.8f,.85f,.8f,-18);
            A2Module("Fallen_Log", 46,-68.2f,.65f,.7f,.7f,38);
            A2Module("Fallen_Log", 51.3f,-73.5f,.9f,.8f,.75f,135);
            A2Module("Rotten_Wood_Bridge", 43.2f,-71.8f,1.5f,.55f,.85f,24);
            A2Module("Root_Stump",47.6f,-67.2f,.8f,.6f,.8f,35,-.25f);
            A2Module("Foreground_Branch_Frame",34,-79.5f,1.4f,.9f,1.2f,-35);
            A2Module("Foreground_Branch_Frame",51,-80.8f,1.6f,.9f,1.2f,-32);
            // BACK는 3개 깊이 층으로 이어진 숲. 서로 겹치되 전투 중심에 세로 질량을 넣지 않는다.
            for (int layer=0;layer<3;layer++)
                for(int j=0;j<5;j++)
                {
                    float x=22+j*9.5f+layer*2.3f,z=-57+layer*8.5f;
                    A2Module("Ancient_Rotten_Tree",x,z,.9f+layer*.2f,1.4f+layer*.25f,1,31+j*83+layer*47);
                }
            for(int layer=0;layer<3;layer++)for(int j=0;j<7;j++)
            {
                float x=24+j*6.2f+layer*1.1f,z=-60+layer*6.5f;if(!A2ForestLayout.SecondaryTree(x,z))continue;
                A2Module("Ancient_Rotten_Tree",x,z,.55f,.85f,.55f,21+j*79+layer*41);
                A2Module("Withered_Shrub",x+.6f,z-.4f,.9f,.9f,.9f,j*73);
                A2Module("Moss_Cushion",x-.4f,z-.3f,.9f,.8f,.9f,j*43,-.08f);
            }
            A2Module("Forest_Vista_Card",24,-39,1.8f,2.4f,1,0);
            A2Module("Forest_Vista_Card",55,-27,2.4f,3,1,15);
            foreach(var p in new[]{new Vector3(34.8f,-70.5f,45),new Vector3(49,-64.8f,165),new Vector3(52,-77,240),new Vector3(30,-64,15)})
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
                    A2Module("Dead_Leaf_Litter",p.x+Mathf.Cos(angle)*2.5f,p.y+Mathf.Sin(angle)*2,1.1f,1,1.1f,p.z+j*57,.015f);
                }
            }
            A2River(ground);
            Debug.Log("[A2 초기화] 수로·외곽 완료 "+timer.ElapsedMilliseconds+"ms");
            // 통행로를 막지 않는 낮은 낙엽·잔돌. 2u 이상 간격의 정해진 접합점만 쓴다.
            var patches=new[]{new Vector2(35.8f,-78.5f),new Vector2(38,-79),new Vector2(40.2f,-80),new Vector2(33.4f,-77.2f),new Vector2(37.4f,-76.6f),new Vector2(36.2f,-66.5f),new Vector2(38.5f,-65.3f),new Vector2(41,-64.8f),new Vector2(43.4f,-64),new Vector2(45.8f,-62.6f),new Vector2(48.2f,-60.8f),new Vector2(32,-69.4f)};
            for(int i=0;i<patches.Length;i++)
            {
                var p=patches[i];A2Module("Dead_Leaf_Litter",p.x,p.y,.85f,.7f,.85f,i*137,.012f);
                A2Module("Moss_Rock_"+(i%3+1),p.x+.35f,p.y-.2f,.12f,.10f,.15f,i*73,-.04f);
            }
            for(int row=0;row<12;row++)for(int col=0;col<12;col++)
            {
                float x=30+col*2.4f+Mathf.Sin(row*13+col*7)*.22f,z=-84+row*2.4f+Mathf.Cos(row*11+col*17)*.22f;
                if(A2ForestLayout.Water(x,z)||Mathf.Abs(A2ForestLayout.Across(x,z))<2.6f)continue;
                A2Module("Dead_Leaf_Litter",x,z,1.3f,1,1.3f,row*137+col*73,.015f);
            }
            foreach(float side in new[]{-1f,1f})
            {
                float u=side*3.65f,w=side*1.95f;
                A2Torch(43.2f+u*A2ForestLayout.SinYaw+w*A2ForestLayout.CosYaw,-71.8f+u*A2ForestLayout.CosYaw-w*A2ForestLayout.SinYaw);
            }
            A2Atmosphere();
            var reflection=new GameObject("A2 독액 숲 반영");reflection.transform.SetParent(a2Root.transform,false);
            reflection.transform.position=new Vector3(50,NativeRemodel3D.GroundY(50,-72)+1,-72);
            var probe=reflection.AddComponent<ReflectionProbe>();probe.mode=ReflectionProbeMode.Realtime;probe.refreshMode=ReflectionProbeRefreshMode.OnAwake;
            probe.resolution=256;probe.size=new Vector3(180,80,260);probe.boxProjection=true;probe.intensity=.55f;probe.importance=100;
            probe.clearFlags=ReflectionProbeClearFlags.SolidColor;probe.backgroundColor=new Color(.085f,.115f,.14f);probe.farClipPlane=150;
            RenderSettings.ambientMode=AmbientMode.Trilight;RenderSettings.ambientSkyColor=new Color(.31f,.34f,.36f);
            RenderSettings.ambientEquatorColor=new Color(.20f,.22f,.20f);RenderSettings.ambientGroundColor=new Color(.075f,.07f,.05f);
            foreach(var light in UnityEngine.Object.FindObjectsByType<Light>(FindObjectsSortMode.None))if(light.type==LightType.Directional)
            {light.intensity=2.1f;light.color=new Color(.77f,.83f,.88f);light.shadowStrength=.55f;light.transform.rotation=Quaternion.Euler(54,-32,0);}
            // 기존 검은 배경색을 실제로 이어지는 먼 숲의 안개색으로 연결한다.
            r3Cam.backgroundColor=new Color(.15f,.18f,.21f);
            r3Cam.farClipPlane=240;
            Debug.Log("[A2] R3 스캔 자산 조립 후보. R4 HOLD 인수0·Core/원본맵 변경0·A2 수로/거목 경계 적용 "+timer.ElapsedMilliseconds+"ms");
        }
        void A2Torch(float x,float z)
        {
            var source=Resources.Load<GameObject>("Art/map/a2/r3/Models/RF3_Bridge_Torch_Holder");if(source==null||hellFlameFrames==null)return;
            var pos=new Vector3(x,NativeRemodel3D.GroundY(x,z),z);
            var holder=Instantiate(source,a2Root.transform);holder.name="A2 다리 끝 횃불";holder.transform.position=pos;holder.transform.localScale=Vector3.one*.5f;
            // 불꽃을 둘러싼 얇은 철창이 커다란 고리 그림자로 확대되지 않게 받침만 투사 제외한다.
            foreach(var r in holder.GetComponentsInChildren<Renderer>())r.shadowCastingMode=ShadowCastingMode.Off;
            var flame=new GameObject("A2 횃불 불꽃");flame.transform.SetParent(a2Root.transform,false);flame.transform.position=pos+Vector3.up*1.24f;flame.transform.rotation=Quaternion.Euler(38,0,0);flame.transform.localScale=Vector3.one*.14f;
            var sprite=flame.AddComponent<SpriteRenderer>();sprite.sprite=hellFlameFrames[0];sprite.color=new Color(1.8f,1.15f,.65f,1);hellFlames.Add(sprite);
            var light=flame.AddComponent<Light>();light.type=LightType.Point;light.color=new Color(1,.55f,.19f);light.range=5;light.intensity=7;light.shadows=LightShadows.Soft;light.shadowBias=.04f;light.shadowNormalBias=.1f;
        }
        void A2Atmosphere()
        {
            var shader=Shader.Find("EXODUSER/A2Atmosphere");
            foreach(var p in new[]{new Vector3(37,0,-73),new Vector3(34,0,-67),new Vector3(40.5f,0,-61),new Vector3(48,0,-59)})
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
            bool roots=id.StartsWith("PineRoots_",StringComparison.Ordinal);
            var prefab=Resources.Load<GameObject>(roots?"Art/map/a2/roots/Models/A2_"+id:id=="Foam_Bank"?"Art/map/a2/Models/RF_Foam_Bank":"Art/map/a2/r3/Models/RF3_"+source);
            if(prefab==null){Debug.LogError("[A2] 모듈 누락 "+id);return null;}
            float placementGround=NativeRemodel3D.GroundY(x,z);
            float height=placementGround+lift+(id=="Dead_Leaf_Litter"?.01f:-.08f);
            bool island=A2ForestLayout.Island(x,z);
            if(A2ForestLayout.Water(x,z)&&!island)
            {
                if(id=="Dead_Leaf_Litter"||id=="Moss_Cushion")return null;
                if(id=="Withered_Shrub")height=-1.2f+lift;
                if(id=="Ancient_Rotten_Tree"||id=="Fallen_Log")height=A2ForestLayout.WaterLevel-.1f+lift;
                if(id=="Root_Stump")height=A2ForestLayout.WaterLevel+.1f+lift;
                if(id.StartsWith("Moss_Rock_",StringComparison.Ordinal))height=-1.5f+lift*.3f;
            }
            var go=Instantiate(prefab,a2Root.transform);go.name="A2_"+id;
            go.transform.SetPositionAndRotation(new Vector3(x,height,z),Quaternion.Euler(0,yaw,0));
            go.transform.localScale=new Vector3(sx,sy,sz)*units;
            if(roots||id=="Dead_Leaf_Litter")foreach(var mf in go.GetComponentsInChildren<MeshFilter>())
            {
                var mesh=Instantiate(mf.sharedMesh);var points=mesh.vertices;
                for(int i=0;i<points.Length;i++){var p=mf.transform.TransformPoint(points[i]);p.y+=NativeRemodel3D.GroundY(p.x,p.z)-placementGround;points[i]=mf.transform.InverseTransformPoint(p);}
                mesh.vertices=points;mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();mf.sharedMesh=mesh;
            }
            foreach(var r in go.GetComponentsInChildren<MeshRenderer>())
            {
                r.shadowCastingMode=id=="Forest_Vista_Card"||id=="Hanging_Moss"?ShadowCastingMode.Off:ShadowCastingMode.On;r.receiveShadows=true;
                if(id=="Hanging_Moss"){var block=new MaterialPropertyBlock();block.SetColor("_BaseColor",new Color(.95f,.85f,.55f,1));r.SetPropertyBlock(block);}
                if(id=="Withered_Shrub"){var block=new MaterialPropertyBlock();block.SetColor("_BaseColor",new Color(.95f,.75f,.50f,1));r.SetPropertyBlock(block);}
                if(id=="Ancient_Rotten_Tree"){var block=new MaterialPropertyBlock();block.SetColor("_BaseColor",new Color(.95f,.80f,.60f,1));r.SetPropertyBlock(block);}
                if(id=="Fungal_Colony"){var block=new MaterialPropertyBlock();block.SetColor("_BaseColor",new Color(.65f,.55f,.40f,1));r.SetPropertyBlock(block);}
            }
            return go;
        }
        void A2RootedTree(float x,float z,float sx,float sy,float sz,float yaw)
        {
            var tree=A2Module("Ancient_Rotten_Tree",x,z,sx,sy,sz,yaw);if(tree==null)return;
            // 고목을 방사형으로 붙이는 방법도 원화의 뿌리 접합이 되지 않아 실제 뿌리 스캔으로 교체한다.
            A2Module(x>40?"PineRoots_B":"PineRoots_A",x,z,3.2f,1.4f,4,yaw,-.02f);
        }
        void A2River(Terrain ground)
        {
            a2Water=new Material(Shader.Find("EXODUSER/A2ToxicRiver"));
            r3Cam.depthTextureMode|=DepthTextureMode.Depth;
            UnityEngine.Rendering.Universal.CameraExtensions.GetUniversalAdditionalCameraData(r3Cam).requiresDepthTexture=true;
            // A2의 단일 경계로 지형과 보행을 함께 나눈다. 원본 맵 데이터/비A2 실행은 보존한다.
            foreach(var root in r3Roots)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
                if(r.name.StartsWith("River_",StringComparison.Ordinal)||r.name.StartsWith("Pool_",StringComparison.Ordinal))r.enabled=false;
            var mesh=new Mesh{name="A2 외곽으로 이어지는 독액"};
            const float waterHeight=A2ForestLayout.WaterLevel;
            A2CutGround(ground,waterHeight);
            A2OuterGround(ground);
            mesh.vertices=new[]{new Vector3(-30,waterHeight,-100),new Vector3(110,waterHeight,-100),new Vector3(-30,waterHeight,70),new Vector3(110,waterHeight,70)};
            mesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.up,Vector2.one};mesh.triangles=new[]{0,2,1,1,2,3};mesh.RecalculateNormals();mesh.RecalculateBounds();
            var river=new GameObject("A2 먼 숲 독액 강");river.transform.SetParent(a2Root.transform,false);river.AddComponent<MeshFilter>().sharedMesh=mesh;
            var rr=river.AddComponent<MeshRenderer>();rr.sharedMaterial=a2Water;rr.shadowCastingMode=ShadowCastingMode.Off;
            river.layer=4;r3Cam.cullingMask|=1<<4;var planar=river.AddComponent<A2RiverReflection>();planar.Viewer=r3Cam;planar.Surface=a2Water;planar.Height=waterHeight;
            A2ForegroundIsland(ground);
            for(int i=0;i<9;i++)
            {
                float z=-79+i*2.6f,x=A2ForestLayout.Shore(z);
                A2Module("Moss_Rock_"+(i%3+1),x-.25f,z,.5f,.4f,.6f,92+i*9,-.55f);
                if(i%2==0)A2Module("River_Stake_Cluster",x+1.2f,z,.6f,.8f,.6f,80+i*11,-.9f);
            }
            for(int i=0;i<13;i++)
            {
                float z=-79+i*2.2f,x=A2ForestLayout.Shore(z)-.35f;
                A2Module("Fallen_Log",x,z,.5f,.3f,.5f,70+i*37,-.22f);
                A2Module("Moss_Cushion",x-.35f,z+.2f,.8f,.65f,.8f,i*73,-.08f);
                A2Module("Withered_Shrub",x-.2f,z-.2f,1,1,1,i*113,-.05f);
            }
            // 지류 양쪽을 낮은 목질·암반·덤불로 연결하고 다리 통행면은 비운다.
            for(int side=-1;side<=1;side+=2)for(int j=0;j<6;j++)
            {
                float u=side*3.1f,w=-7+j*3.2f;if(Mathf.Abs(w)<2)continue;
                float x=A2ForestLayout.BridgeX+u*A2ForestLayout.SinYaw+w*A2ForestLayout.CosYaw;
                float z=A2ForestLayout.BridgeZ+u*A2ForestLayout.CosYaw-w*A2ForestLayout.SinYaw;
                A2Module("Fallen_Log",x,z,.45f,.45f,.55f,76+j*21,-.25f);
                A2Module("Moss_Cushion",x+.3f,z,.85f,.8f,.85f,j*47,-.1f);
                A2Module("Withered_Shrub",x-.4f,z-.2f,.85f,.85f,.85f,j*61);
            }
        }
        void A2ForegroundIsland(Terrain ground)
        {
            // 전경 거목의 비보행 섬. 수면 차단은 그대로여서 장식 섬에 진입할 수 없다.
            const float x=A2ForestLayout.IslandX,z=A2ForestLayout.IslandZ;
            const int rings=5,segments=48;var v=new Vector3[(rings+1)*(segments+1)];var t=new int[rings*segments*6];
            for(int ring=0;ring<=rings;ring++)for(int col=0;col<=segments;col++)
            {
                float u=ring/(float)rings,a=col*Mathf.PI*2/segments,r=A2ForestLayout.IslandRadius(a)*u;
                float px=x+Mathf.Cos(a)*r,pz=z+Mathf.Sin(a)*r;
                float y=NativeRemodel3D.GroundY(px,pz);
                v[ring*(segments+1)+col]=new Vector3(px,y,pz);
                if(ring==rings||col==segments)continue;int n=ring*(segments+1)+col,k=(ring*segments+col)*6;
                t[k]=n;t[k+1]=n+1;t[k+2]=n+segments+1;t[k+3]=n+1;t[k+4]=n+segments+2;t[k+5]=n+segments+1;
            }
            var mesh=new Mesh{name="A2 거목 아래 침식된 섬"};mesh.vertices=v;mesh.triangles=t;mesh.RecalculateNormals();mesh.RecalculateBounds();
            var go=new GameObject("A2 전경 거목 접지 섬");go.transform.SetParent(a2Root.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;
            foreach(var renderer in ground.GetComponentsInChildren<MeshRenderer>())if(renderer.name=="지옥 바닥 PBR 표면"){go.AddComponent<MeshRenderer>().sharedMaterial=renderer.sharedMaterial;break;}
        }
        void A2CutGround(Terrain ground,float waterHeight)
        {
            foreach(var renderer in ground.GetComponentsInChildren<MeshRenderer>())
            {
                if(renderer.name!="지옥 바닥 PBR 표면")continue;
                var filter=renderer.GetComponent<MeshFilter>();var source=filter.sharedMesh;var vertices=source.vertices;var triangles=source.triangles;
                for(int j=0;j<vertices.Length;j++){var world=filter.transform.TransformPoint(vertices[j]);world.y=NativeRemodel3D.GroundY(world.x,world.z);vertices[j]=filter.transform.InverseTransformPoint(world);}
                var kept=new System.Collections.Generic.List<int>();var edges=new System.Collections.Generic.Dictionary<long,int>();
                for(int i=0;i<triangles.Length;i+=3)
                {
                    int a=triangles[i],b=triangles[i+1],c=triangles[i+2];var p=filter.transform.TransformPoint((vertices[a]+vertices[b]+vertices[c])/3);
                    if(A2ForestLayout.Water(p.x,p.z))continue;
                    kept.Add(a);kept.Add(b);kept.Add(c);A2Edge(edges,a,b);A2Edge(edges,b,c);A2Edge(edges,c,a);
                }
                var cut=Instantiate(source);cut.name="A2 수로와 맞물린 지형";cut.vertices=vertices;cut.triangles=kept.ToArray();cut.RecalculateNormals();cut.RecalculateTangents();cut.RecalculateBounds();filter.sharedMesh=cut;
                var bankV=new System.Collections.Generic.List<Vector3>();var bankUV=new System.Collections.Generic.List<Vector2>();var bankT=new System.Collections.Generic.List<int>();
                foreach(var edge in edges)if(edge.Value==1)
                {
                    int a=(int)(edge.Key>>32),b=(int)edge.Key;var p=filter.transform.TransformPoint(vertices[a]);var q=filter.transform.TransformPoint(vertices[b]);int n=bankV.Count;
                    var mid=(p+q)*.5f;var side=Vector3.Cross(q-p,Vector3.up).normalized*.25f;
                    // 원본 지형 창의 마른 경계는 절벽이 아니다. 실제 수로 접점만 닫는다.
                    if(!A2ForestLayout.Water(mid.x+side.x,mid.z+side.z)&&!A2ForestLayout.Water(mid.x-side.x,mid.z-side.z))continue;
                    bool useX=Mathf.Abs(q.x-p.x)>Mathf.Abs(q.z-p.z);
                    bankUV.Add(new Vector2(useX?p.x:p.z,p.y)*.7f);bankUV.Add(new Vector2(useX?q.x:q.z,q.y)*.7f);
                    bankUV.Add(new Vector2(useX?p.x:p.z,waterHeight-.3f)*.7f);bankUV.Add(new Vector2(useX?q.x:q.z,waterHeight-.3f)*.7f);
                    bankV.Add(a2Root.transform.InverseTransformPoint(p));bankV.Add(a2Root.transform.InverseTransformPoint(q));
                    p.y=waterHeight-.3f;q.y=waterHeight-.3f;bankV.Add(a2Root.transform.InverseTransformPoint(p));bankV.Add(a2Root.transform.InverseTransformPoint(q));
                    bankT.Add(n);bankT.Add(n+2);bankT.Add(n+1);bankT.Add(n+1);bankT.Add(n+2);bankT.Add(n+3);
                    for(int j=0;j<4;j++){bankV.Add(bankV[n+j]);bankUV.Add(bankUV[n+j]);}
                    bankT.Add(n+5);bankT.Add(n+6);bankT.Add(n+4);bankT.Add(n+7);bankT.Add(n+6);bankT.Add(n+5);
                }
                var mesh=new Mesh{name="A2 연속 강둑 절벽"};mesh.indexFormat=IndexFormat.UInt32;mesh.SetVertices(bankV);mesh.SetUVs(0,bankUV);mesh.SetTriangles(bankT,0);mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();
                var bank=new GameObject("A2 연속 강둑");bank.transform.SetParent(a2Root.transform,false);bank.AddComponent<MeshFilter>().sharedMesh=mesh;bank.AddComponent<MeshRenderer>().sharedMaterial=HellEnvironmentMaterial(new Color(.48f,.44f,.32f),.16f,1,"rock_ground");
                Debug.Log("[A2] 수로 지형 삼각형="+kept.Count/3+" 강둑 면="+bankT.Count/3+". 보행과 동일 경계");
            }
        }
        static void A2Edge(System.Collections.Generic.Dictionary<long,int> edges,int a,int b)
        {
            long key=((long)Math.Min(a,b)<<32)|(uint)Math.Max(a,b);int count;edges.TryGetValue(key,out count);edges[key]=count+1;
        }
        void A2OuterGround(Terrain ground)
        {
            // 원본 Terrain 창 밖도 연결된 숲으로 이어져 직각 절단면이 화면에 들어오지 않게 한다.
            var origin=ground.transform.position;var size=ground.terrainData.size;
            int samples=(ground.terrainData.heightmapResolution-1)/2+1;
            var xs=A2ExtendedAxis(-30,110,origin.x,size.x,samples);var zs=A2ExtendedAxis(-100,70,origin.z,size.z,samples);
            int cols=xs.Count,rows=zs.Count;var v=new Vector3[cols*rows];var uv=new Vector2[v.Length];var t=new System.Collections.Generic.List<int>();
            for(int row=0;row<rows;row++)for(int col=0;col<cols;col++)
            {
                float x=xs[col],z=zs[row];
                float h=NativeRemodel3D.GroundY(x,z);
                int n=row*cols+col;v[n]=new Vector3(x,h,z);uv[n]=new Vector2(x,z)*.1f;
                if(row==rows-1||col==cols-1)continue;float cx=(x+xs[col+1])*.5f,cz=(z+zs[row+1])*.5f;
                if(cx>origin.x&&cx<origin.x+size.x&&cz>origin.z&&cz<origin.z+size.z)continue;
                if(A2ForestLayout.Water(cx,cz))continue;
                t.Add(n);t.Add(n+cols);t.Add(n+1);t.Add(n+1);t.Add(n+cols);t.Add(n+cols+1);
            }
            var mesh=new Mesh{name="A2 창 밖으로 이어지는 숲 지형",indexFormat=IndexFormat.UInt32};mesh.vertices=v;mesh.uv=uv;mesh.SetTriangles(t,0);mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();
            var go=new GameObject("A2 연속 외곽 숲 지면");go.transform.SetParent(a2Root.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;
            foreach(var renderer in ground.GetComponentsInChildren<MeshRenderer>())if(renderer.name=="지옥 바닥 PBR 표면"){go.AddComponent<MeshRenderer>().sharedMaterial=renderer.sharedMaterial;break;}
        }
        static System.Collections.Generic.List<float> A2ExtendedAxis(float min,float max,float start,float length,int samples)
        {
            var axis=new System.Collections.Generic.List<float>();
            for(float p=min;p<start-.001f;p+=.8f)axis.Add(p);
            // 원본 높이맵 메시의 모든 경계 정점을 그대로 이어 이음 간격/검은 띠를 없앤다.
            for(int i=0;i<samples;i++)axis.Add(start+i/(samples-1f)*length);
            for(float p=start+length+.8f;p<=max+.001f;p+=.8f)axis.Add(p);
            return axis;
        }
        float A2CaptureFrame(string path)
        {
            // LateUpdate를 두 번 호출하면 이미0으로 비운 2D mask를 로비 숨김으로 읽어 3D카메라를 꺼 버린다.
            // 촬영은 완료된 실제 프레임의 카메라를 그대로 사용한다.
            var camera=NativeRemodel3D.Active&&r3Cam!=null?r3Cam:HudCamera;var old=camera.targetTexture;var active=RenderTexture.active;
            var rt=RenderTexture.GetTemporary(1920,1080,24,RenderTextureFormat.ARGB32);
            Texture2D pixels=null;
            try
            {
                camera.targetTexture=rt;
                UnityEngine.Rendering.RenderPipeline.SubmitRenderRequest(camera,new UnityEngine.Rendering.Universal.UniversalRenderPipeline.SingleCameraRequest{destination=rt});
                RenderTexture.active=rt;pixels=new Texture2D(1920,1080,TextureFormat.RGB24,false);pixels.ReadPixels(new Rect(0,0,1920,1080),0,0);pixels.Apply();System.IO.File.WriteAllBytes(path,pixels.EncodeToPNG());
                var values=pixels.GetPixels32();double sum=0;for(int i=0;i<values.Length;i+=16)sum+=.2126*values[i].r+.7152*values[i].g+.0722*values[i].b;
                float luminance=(float)(sum/((values.Length+15)/16)/255);
                Debug.Log("[A2 촬영] "+camera.name+" mask="+camera.cullingMask+" 밝기="+luminance);
                return luminance;
            }
            finally{camera.targetTexture=old;RenderTexture.active=active;RenderTexture.ReleaseTemporary(rt);if(pixels!=null)Destroy(pixels);}
        }
    }
}
