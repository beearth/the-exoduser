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
            NativeRemodel3D.ForestA2=true;
            foreach(var root in r3Roots)foreach(var volume in root.GetComponentsInChildren<UnityEngine.Rendering.Volume>(true))
            {
                var profile=volume.profile;if(profile==null)continue;
                UnityEngine.Rendering.Universal.ColorAdjustments tone;if(profile.TryGet<UnityEngine.Rendering.Universal.ColorAdjustments>(out tone)){tone.postExposure.Override(.9f);tone.contrast.Override(8);}
            }
            foreach(var r in ground.GetComponentsInChildren<MeshRenderer>())
                if(r.name=="지옥 바닥 PBR 표면")r.sharedMaterial.SetFloat("_ForestBlend",1);
            if (hellEnvironment != null) hellEnvironment.SetActive(false);
            a2Root = new GameObject("A2 썩은 숲·나무다리 제작 후보");
            a2Root.transform.SetParent(ground.transform.parent, false);
            var oldFire=GameObject.Find("실제 철제 지옥불 화로");if(oldFire!=null)oldFire.SetActive(false);
            foreach(var root in r3Roots)foreach(var light in root.GetComponentsInChildren<Light>(true))
                if(light.name.StartsWith("Pool_Hell",StringComparison.Ordinal))light.intensity=0;
            foreach(var root in r3Roots)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
                if(r.name.StartsWith("Decals_blood",StringComparison.Ordinal))r.enabled=false;
            // LEFT/MID 주간, RIGHT 강가, TOP 먼 숲, SOUTH 낮은 전경. 중앙 전투면은 유지한다.
            A2RootedTree(34.8f,-73.2f,1.45f,1.6f,1.3f,25);
            A2RootedTree(46.7f,-65.5f,1.3f,1.7f,1.25f,155);
            A2RootedTree(53.3f,-77,1.25f,1.5f,1.4f,238);
            A2RootedTree(29.5f,-64,1.2f,1.45f,1.2f,295);
            A2Module("Fallen_Log", 34,-74,.8f,.85f,.8f,-18);
            A2Module("Fallen_Log", 46,-68.2f,.65f,.7f,.7f,38);
            A2Module("Fallen_Log", 51.3f,-73.5f,.9f,.8f,.75f,135);
            A2Module("Rotten_Wood_Bridge", 43.2f,-71.8f,1,.55f,1,24);
            A2Module("Root_Stump",47.6f,-67.2f,.8f,.6f,.8f,35,-.25f);
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
            foreach(var p in new[]{new Vector3(34.8f,-73.2f,45),new Vector3(46.5f,-65.5f,165),new Vector3(52,-77,240),new Vector3(30,-64,15)})
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
            // 통행로를 막지 않는 낮은 낙엽·잔돌. 2u 이상 간격의 정해진 접합점만 쓴다.
            var patches=new[]{new Vector2(35.8f,-78.5f),new Vector2(38,-79),new Vector2(40.2f,-80),new Vector2(33.4f,-77.2f),new Vector2(37.4f,-76.6f),new Vector2(36.2f,-66.5f),new Vector2(38.5f,-65.3f),new Vector2(41,-64.8f),new Vector2(43.4f,-64),new Vector2(45.8f,-62.6f),new Vector2(48.2f,-60.8f),new Vector2(32,-69.4f)};
            for(int i=0;i<patches.Length;i++)
            {
                var p=patches[i];A2Module("Dead_Leaf_Litter",p.x,p.y,.85f,.7f,.85f,i*137,.012f);
                A2Module("Moss_Rock_"+(i%3+1),p.x+.35f,p.y-.2f,.12f,.10f,.15f,i*73,-.04f);
            }
            A2Torch(40.8f,-75.4f);
            A2Torch(45.4f,-68.2f);
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
            Debug.Log("[A2] 검수된 R3 스캔 자산 조립 후보. R4 HOLD 인수0·Core/충돌 변경0");
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
            var prefab=Resources.Load<GameObject>(id=="Foam_Bank"?"Art/map/a2/Models/RF_Foam_Bank":"Art/map/a2/r3/Models/RF3_"+source);
            if(prefab==null){Debug.LogError("[A2] 모듈 누락 "+id);return null;}
            float height=NativeRemodel3D.GroundY(x,z)+lift-.08f;
            bool island=(x-53.3f)*(x-53.3f)+(z+77)*(z+77)<9;
            if(A2ForestLayout.Water(x,z)&&!island)
            {
                if(id=="Dead_Leaf_Litter"||id=="Moss_Cushion")return null;
                if(id=="Withered_Shrub")height=-1.2f+lift;
            }
            var go=Instantiate(prefab,a2Root.transform);go.name="A2_"+id;
            go.transform.SetPositionAndRotation(new Vector3(x,height,z),Quaternion.Euler(0,yaw,0));
            go.transform.localScale=new Vector3(sx,sy,sz)*units;
            foreach(var r in go.GetComponentsInChildren<MeshRenderer>()){r.shadowCastingMode=id=="Forest_Vista_Card"?ShadowCastingMode.Off:ShadowCastingMode.On;r.receiveShadows=true;}
            return go;
        }
        void A2RootedTree(float x,float z,float sx,float sy,float sz,float yaw)
        {
            var tree=A2Module("Ancient_Rotten_Tree",x,z,sx,sy,sz,yaw);if(tree==null)return;
            // 스캔 모델의 UV 아틀라스를 새 형상에 씌우지 않는다. 기존 CC0 반복 수피를 사용한다.
            var bark=HellEnvironmentMaterial(new Color(.65f,.56f,.42f),.17f,1.3f,"bark_brown_02");
            for(int root=0;root<5;root++)
            {
                float angle=(yaw+root*73)*Mathf.Deg2Rad,length=3.8f+root%3*.7f;
                var v=new Vector3[11*9];var uv=new Vector2[v.Length];var tris=new int[10*8*6];
                for(int row=0;row<=10;row++)
                {
                    float t=row/10f,bend=Mathf.Sin(t*Mathf.PI)*.4f*(root%2==0?1:-1);
                    float px=x+Mathf.Sin(angle)*(1+length*t)+Mathf.Cos(angle)*bend;
                    float pz=z+Mathf.Cos(angle)*(1+length*t)-Mathf.Sin(angle)*bend;
                    float baseY=NativeRemodel3D.GroundY(px,pz)-.08f;
                    if(A2ForestLayout.Water(px,pz))baseY=Mathf.Lerp(baseY,-1.1f,Mathf.SmoothStep(0,1,t));
                    float width=Mathf.Lerp(.65f,.06f,t),height=.9f*Mathf.Pow(1-t,3)+.07f;
                    for(int col=0;col<=8;col++)
                    {
                        float a=col*Mathf.PI/8,side=Mathf.Cos(a)*width;
                        v[row*9+col]=new Vector3(px+Mathf.Cos(angle)*side,baseY+Mathf.Sin(a)*height,pz-Mathf.Sin(angle)*side);
                        uv[row*9+col]=new Vector2(col/8f,t*length*.7f);
                        if(row==10||col==8)continue;int n=row*9+col,k=(row*8+col)*6;
                        tris[k]=n;tris[k+1]=n+1;tris[k+2]=n+9;tris[k+3]=n+1;tris[k+4]=n+10;tris[k+5]=n+9;
                    }
                }
                var mesh=new Mesh{name="A2 넓게 접지된 판근"};mesh.vertices=v;mesh.uv=uv;mesh.triangles=tris;mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();
                var go=new GameObject("A2 거목 밑동 판근");go.transform.SetParent(a2Root.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;go.AddComponent<MeshRenderer>().sharedMaterial=bark;
            }
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
            const float waterHeight=-1.25f;
            A2CutGround(ground,waterHeight);
            A2OuterGround(ground);
            mesh.vertices=new[]{new Vector3(-30,waterHeight,-100),new Vector3(110,waterHeight,-100),new Vector3(-30,waterHeight,70),new Vector3(110,waterHeight,70)};
            mesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.up,Vector2.one};mesh.triangles=new[]{0,2,1,1,2,3};mesh.RecalculateNormals();mesh.RecalculateBounds();
            var river=new GameObject("A2 먼 숲 독액 강");river.transform.SetParent(a2Root.transform,false);river.AddComponent<MeshFilter>().sharedMesh=mesh;
            var rr=river.AddComponent<MeshRenderer>();rr.sharedMaterial=a2Water;rr.shadowCastingMode=ShadowCastingMode.Off;
            river.layer=4;r3Cam.cullingMask|=1<<4;var planar=river.AddComponent<A2RiverReflection>();planar.Viewer=r3Cam;planar.Surface=a2Water;planar.Height=waterHeight;
            A2Island(ground,53.3f,-77,3.4f,waterHeight);
            for(int i=0;i<9;i++)
            {
                float z=-79+i*2.6f,x=A2ForestLayout.Shore(z);
                A2Module("Moss_Rock_"+(i%3+1),x-.25f,z,.5f,.4f,.6f,92+i*9,-.55f);
                if(i%2==0)A2Module("River_Stake_Cluster",x+1.2f,z,.6f,.8f,.6f,80+i*11,-.9f);
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
        void A2Island(Terrain ground,float x,float z,float radius,float waterHeight)
        {
            // 전경 거목의 비보행 섬. 수면 차단은 그대로여서 장식 섬에 진입할 수 없다.
            const int rings=5,segments=48;var v=new Vector3[(rings+1)*(segments+1)];var t=new int[rings*segments*6];
            for(int ring=0;ring<=rings;ring++)for(int col=0;col<=segments;col++)
            {
                float u=ring/(float)rings,a=col*Mathf.PI*2/segments,r=radius*u*(1+.10f*Mathf.Sin(a*3)+.08f*Mathf.Cos(a*5));
                float px=x+Mathf.Cos(a)*r,pz=z+Mathf.Sin(a)*r;
                float y=Mathf.Lerp(NativeRemodel3D.GroundY(px,pz)-.16f,waterHeight-.25f,Mathf.Pow(u,3));
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
                var kept=new System.Collections.Generic.List<int>();var edges=new System.Collections.Generic.Dictionary<long,int>();
                for(int i=0;i<triangles.Length;i+=3)
                {
                    int a=triangles[i],b=triangles[i+1],c=triangles[i+2];var p=filter.transform.TransformPoint((vertices[a]+vertices[b]+vertices[c])/3);
                    if(A2ForestLayout.Water(p.x,p.z))continue;
                    kept.Add(a);kept.Add(b);kept.Add(c);A2Edge(edges,a,b);A2Edge(edges,b,c);A2Edge(edges,c,a);
                }
                var cut=Instantiate(source);cut.name="A2 수로와 맞물린 지형";cut.triangles=kept.ToArray();cut.RecalculateBounds();filter.sharedMesh=cut;
                var bankV=new System.Collections.Generic.List<Vector3>();var bankUV=new System.Collections.Generic.List<Vector2>();var bankT=new System.Collections.Generic.List<int>();
                foreach(var edge in edges)if(edge.Value==1)
                {
                    int a=(int)(edge.Key>>32),b=(int)edge.Key;var p=filter.transform.TransformPoint(vertices[a]);var q=filter.transform.TransformPoint(vertices[b]);int n=bankV.Count;
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
                var bank=new GameObject("A2 연속 강둑");bank.transform.SetParent(a2Root.transform,false);bank.AddComponent<MeshFilter>().sharedMesh=mesh;bank.AddComponent<MeshRenderer>().sharedMaterial=HellEnvironmentMaterial(new Color(.48f,.44f,.32f),.16f,1,"rock_face");
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
            const int cols=176,rows=214;var v=new Vector3[cols*rows];var uv=new Vector2[v.Length];var t=new System.Collections.Generic.List<int>();
            var origin=ground.transform.position;var size=ground.terrainData.size;
            for(int row=0;row<rows;row++)for(int col=0;col<cols;col++)
            {
                float x=-30+col*.8f,z=-100+row*.8f;
                float outside=Mathf.Max(Mathf.Max(origin.x-x,x-origin.x-size.x),Mathf.Max(origin.z-z,z-origin.z-size.z));
                float h=NativeRemodel3D.GroundY(x,z)+Mathf.SmoothStep(0,1,Mathf.Max(0,outside)/4)*(.35f*Mathf.Sin(x*.31f)+.28f*Mathf.Cos(z*.27f));
                int n=row*cols+col;v[n]=new Vector3(x,h,z);uv[n]=new Vector2(x,z)*.1f;
                if(row==rows-1||col==cols-1)continue;float cx=x+.4f,cz=z+.4f;
                if(cx>origin.x&&cx<origin.x+size.x&&cz>origin.z&&cz<origin.z+size.z)continue;
                if(A2ForestLayout.Water(cx,cz))continue;
                t.Add(n);t.Add(n+cols);t.Add(n+1);t.Add(n+1);t.Add(n+cols);t.Add(n+cols+1);
            }
            var mesh=new Mesh{name="A2 창 밖으로 이어지는 숲 지형"};mesh.vertices=v;mesh.uv=uv;mesh.SetTriangles(t,0);mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();
            var go=new GameObject("A2 연속 외곽 숲 지면");go.transform.SetParent(a2Root.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;
            foreach(var renderer in ground.GetComponentsInChildren<MeshRenderer>())if(renderer.name=="지옥 바닥 PBR 표면"){go.AddComponent<MeshRenderer>().sharedMaterial=renderer.sharedMaterial;break;}
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
