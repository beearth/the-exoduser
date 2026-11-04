using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        static readonly System.Threading.Tasks.ParallelOptions a2FieldWorkers=new System.Threading.Tasks.ParallelOptions{MaxDegreeOfParallelism=4};
        A2FieldLayout a2Field;
        Material a2FieldSoil;
        readonly Dictionary<string,long[]> a2FieldCosts=new Dictionary<string,long[]>();
        struct A2FieldCostSample : IDisposable
        {
            readonly NativeGame game;readonly string name;readonly long start;
            public A2FieldCostSample(NativeGame game,string name){this.game=game;this.name=name;start=System.Diagnostics.Stopwatch.GetTimestamp();}
            public void Dispose(){game.A2FieldCostRecord(name,System.Diagnostics.Stopwatch.GetTimestamp()-start);}
        }
        A2FieldCostSample A2FieldSample(string name){return new A2FieldCostSample(this,name);}
        void A2FieldCostRecord(string name,long ticks)
        {
            long[] value;if(!a2FieldCosts.TryGetValue(name,out value)){value=new long[2];a2FieldCosts.Add(name,value);}value[0]+=ticks;value[1]++;
        }
        void A2FieldCostFlush(string stage)
        {
            foreach(var pair in a2FieldCosts)Debug.Log("[A2 전체필드] 세부 "+stage+"/"+pair.Key+" "+(pair.Value[0]*1000.0/System.Diagnostics.Stopwatch.Frequency).ToString("F3",System.Globalization.CultureInfo.InvariantCulture)+"ms / "+pair.Value[1]+"회 (중첩 포함)");
            a2FieldCosts.Clear();
        }
        void A2FieldSetup(Terrain ground)
        {
            if(ground==null||a2Root!=null)return;
            var timer=System.Diagnostics.Stopwatch.StartNew();a2FieldMeasuredFrame=Time.frameCount;a2FieldMeasuredStages.Clear();A2RStage.Begin();
            a2Field=new A2FieldLayout(Map.Data);NativeRemodel3D.Field=a2Field;NativeRemodel3D.ForestA2=true;
            a2Root=new GameObject("A2 1-1 전체 썩은 숲");
            UnityEngine.SceneManagement.SceneManager.MoveGameObjectToScene(a2Root,r3Scene);
            a2Root.transform.SetParent(ground.transform,true);
            foreach(var root in r3Roots)foreach(var r in root.GetComponentsInChildren<MeshRenderer>(true))
            {
                if(r.name=="지옥 바닥 PBR 표면")a2FieldSoil=new Material(r.sharedMaterial);
                r.enabled=false;
            }
            if(hellEnvironment!=null)hellEnvironment.SetActive(false);
            var oldFire=GameObject.Find("실제 철제 지옥불 화로");if(oldFire!=null)oldFire.SetActive(false);
            foreach(var root in r3Roots)foreach(var light in root.GetComponentsInChildren<Light>(true))
            {
                if(light.type==LightType.Directional)
                {
                    light.intensity=3.2f;light.color=new Color(.85f,.90f,1);light.shadows=LightShadows.Soft;
                    light.shadowStrength=.55f;light.shadowBias=.035f;light.shadowNormalBias=.12f;light.transform.rotation=Quaternion.Euler(49,-32,0);
                }
                else if(light.name.StartsWith("Pool_",StringComparison.Ordinal))light.enabled=false;
            }
            foreach(var root in r3Roots)foreach(var volume in root.GetComponentsInChildren<Volume>(true))
            {
                var profile=volume.profile;if(profile==null)continue;ColorAdjustments tone;
                if(profile.TryGet<ColorAdjustments>(out tone)){tone.postExposure.Override(.55f);tone.contrast.Override(16);}
            }
            A2RStage.Mark("조명·볼륨");if(a2FieldSoil==null){Debug.LogError("[A2 필드] 지면 재질 누락");return;}
            a2FieldSoil.SetFloat("_ForestBlend",1);a2FieldSoil.SetFloat("_ForestTextureMix",.65f);a2FieldSoil.SetFloat("_SoilTextureMix",1);a2FieldSoil.SetFloat("_FullField",1);
            foreach(var pair in new[]{new[]{"_ForestMap","A2_ForestFloor_BaseColor"},new[]{"_ForestNormal","A2_ForestFloor_Normal"},new[]{"_ForestRough","A2_ForestFloor_Roughness"},new[]{"_SoilMap","A2_ForestSoil_BaseColor"},new[]{"_SoilNormal","A2_ForestSoil_Normal"},new[]{"_SoilRough","A2_ForestSoil_Roughness"},new[]{"_RootMap","A2_ExposedRoots_BaseColor"},new[]{"_RootNormal","A2_ExposedRoots_Normal"},new[]{"_RootRough","A2_ExposedRoots_Roughness"}})
            {
                var tex=Resources.Load<Texture2D>("Art/map/a2/ground/"+pair[1]);
                if(tex==null){Debug.LogError("[A2 필드] 스캔 지면 누락 "+pair[1]);continue;}
                a2FieldSoil.SetTexture(pair[0],tex);
            }
            foreach(var pair in new[]{new[]{"_FieldMoss","BaseColor"},new[]{"_FieldMossNormal","Normal"},new[]{"_FieldMossRough","Roughness"}})
            {var moss=Resources.Load<Texture2D>("Art/map/a2/ground/A2_FieldMoss_"+pair[1]);if(moss==null)Debug.LogError("[A2 필드] 이끼 지면 누락 "+pair[1]);else a2FieldSoil.SetTexture(pair[0],moss);}
            A2RStage.Mark("지면 텍스처 로드");var sdf=new Texture2D(200,200,TextureFormat.RGBA32,false,true){name="원본 보행 경계 시각 거리장",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            var pixels=new Color[40000];
            System.Threading.Tasks.Parallel.For(0,200,a2FieldWorkers,y=>{for(int x=0;x<200;x++)pixels[y*200+x]=new Color(.5f+a2Field.Distance((x+.5f)*.4f,-(y+.5f)*.4f)/40,0,0,1);});
            sdf.SetPixels(pixels);sdf.Apply(false,true);a2FieldSoil.SetTexture("_FieldSdf",sdf);
            A2RStage.Mark("거리장 40000타일");var cover=new Texture2D(256,256,TextureFormat.RGBA32,false,true){name="A2 전투중심을 비운 연결 이끼 지면",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            var coverPixels=new Color[256*256];System.Threading.Tasks.Parallel.For(0,256,a2FieldWorkers,y=>{for(int x=0;x<256;x++)coverPixels[y*256+x]=new Color(a2Field.GroundCover((x+.5f)/256*80,-(y+.5f)/256*80)*Mathf.Lerp(1,.45f,Mathf.SmoothStep(0,1,Mathf.Clamp01(a2Field.Distance((x+.5f)/256*80,-(y+.5f)/256*80)/2))),0,0,1);});
            cover.SetPixels(coverPixels);cover.Apply(false,true);a2FieldSoil.SetTexture("_FieldCover",cover);
            A2RStage.Mark("이끼 커버");A2FieldExecuteStage("outer","외곽 덩어리",()=>A2FieldOuterMass());A2FieldExecuteStage("foreground","전경",()=>A2Foreground(true));A2FieldExecuteStage("landmarks","랜드마크",()=>A2FieldLandmarks());A2FieldExecuteStage("connections","접합 뿌리",()=>A2FieldConnections());A2FieldExecuteStage("ground","지면 메시",()=>A2FieldGround());A2FieldExecuteStage("cover","덤불 지면덮개",()=>A2FieldGroundCover());A2FieldExecuteStage("bridge","다리 이끼",()=>A2BridgeMoss());A2FieldExecuteStage("atmosphere","대기",A2FieldAtmosphere);
            var aa=r3Cam.GetUniversalAdditionalCameraData();aa.antialiasing=NativeHd2D.Enabled?AntialiasingMode.None:AntialiasingMode.SubpixelMorphologicalAntiAliasing;aa.antialiasingQuality=AntialiasingQuality.High;
            aa.requiresDepthTexture=true;r3Cam.depthTextureMode|=DepthTextureMode.Depth;
            r3Cam.backgroundColor=new Color(.105f,.145f,.17f);r3Cam.farClipPlane=220;
            A2Ambient();A2RStage.Mark("환경광");a2FieldMeasuredTargetMs=timer.Elapsed.TotalMilliseconds;Debug.Log("[A2 전체필드] 기본 필드 조립 합계 "+a2FieldMeasuredTargetMs.ToString("F3",System.Globalization.CultureInfo.InvariantCulture)+"ms");A2RSetup();a2FieldMeasuredFullMs=timer.Elapsed.TotalMilliseconds;A2RStage.Mark("A2RSetup 합계 이후");Debug.Log("[A2 전체필드] 원본40000타일 보행·시야 불변/全域地面·외곽·접합 조립 "+timer.ElapsedMilliseconds+"ms");
        }
        void A2FieldGround()
        {
            // 32:9의 수평 시야와 최북단까지 이어지는 하나의 표면. 청크마다 다른 베이스를 쓰지 않는다.
            var xs=A2FieldLayout.GroundAxis(true);var zs=A2FieldLayout.GroundAxis(false);int nx=xs.Length,nz=zs.Length;
            var vertices=new Vector3[nx*nz];var uv=new Vector2[vertices.Length];var triangles=new int[(nx-1)*(nz-1)*6];
            // TerrainHeight reads immutable map data. Each row owns its vertices and indices.
            using(A2FieldSample("지면 높이·인덱스"))System.Threading.Tasks.Parallel.For(0,nz,a2FieldWorkers,y=>
            {
                int k=y*(nx-1)*6;for(int x=0;x<nx;x++)
                {
                float wx=xs[x],wz=zs[y];int i=y*nx+x;
                vertices[i]=new Vector3(wx,a2Field.TerrainHeight(wx,wz),wz);uv[i]=new Vector2(wx/80,-wz/80);
                if(x==nx-1||y==nz-1)continue;
                triangles[k++]=i;triangles[k++]=i+nx;triangles[k++]=i+1;triangles[k++]=i+1;triangles[k++]=i+nx;triangles[k++]=i+nx+1;
                }
            });
            var mesh=new Mesh{name="1-1 전체 젖은 흙·침식 둑",indexFormat=IndexFormat.UInt32};mesh.vertices=vertices;mesh.uv=uv;mesh.triangles=triangles;mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();
            var terrainRoot=new GameObject("A2 전체 필드 지면");terrainRoot.transform.SetParent(a2Root.transform,false);
            var normals=mesh.normals;var tangents=mesh.tangents;int chunkCount=0;
            // 경계 정점/노멀/탄젠트는 같은 전체 격자에서 그대로 복사해 틈과 조명 이음을 없앤다.
            for(int y0=0;y0<nz-1;y0+=64)for(int x0=0;x0<nx-1;x0+=64)
            {
                int cw=Mathf.Min(65,nx-x0),ch=Mathf.Min(65,nz-y0);var cv=new Vector3[cw*ch];var cn=new Vector3[cv.Length];var ct=new Vector4[cv.Length];var cu=new Vector2[cv.Length];var ci=new int[(cw-1)*(ch-1)*6];int index=0;
                for(int y=0;y<ch;y++)for(int x=0;x<cw;x++)
                {
                    int local=y*cw+x,global=(y0+y)*nx+x0+x;cv[local]=vertices[global];cn[local]=normals[global];ct[local]=tangents[global];cu[local]=uv[global];
                    if(x==cw-1||y==ch-1)continue;
                    ci[index++]=local;ci[index++]=local+cw;ci[index++]=local+1;ci[index++]=local+1;ci[index++]=local+cw;ci[index++]=local+cw+1;
                }
                var chunk=new Mesh{name="A2 지면 "+x0+"/"+y0};chunk.vertices=cv;chunk.normals=cn;chunk.tangents=ct;chunk.uv=cu;chunk.triangles=ci;chunk.RecalculateBounds();
                var go=new GameObject(chunk.name);go.transform.SetParent(terrainRoot.transform,false);go.AddComponent<MeshFilter>().sharedMesh=chunk;
                var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=a2FieldSoil;r.receiveShadows=true;chunkCount++;
                NativeGroundSkillProjection.RegisterReceiver(go.GetComponent<MeshFilter>());
            }
            Debug.Log("[A2 전체 지면] "+nx+"x"+nz+"/삼각형 "+triangles.Length/3+"/64셀청크 "+chunkCount+"/근경.25u·먼외곽2u/공유경계노멀·탄젠트");
            if(Application.isPlaying)Destroy(mesh);else DestroyImmediate(mesh);
            a2Water=new Material(Shader.Find("EXODUSER/A2ToxicRiver"));A2ShoreField();
            var waterMesh=new Mesh{name="숲 외곽 독액 수면"};waterMesh.vertices=new[]{new Vector3(A2FieldLayout.GroundMinX,-.45f,A2FieldLayout.GroundMinZ),new Vector3(A2FieldLayout.GroundMaxX,-.45f,A2FieldLayout.GroundMinZ),new Vector3(A2FieldLayout.GroundMinX,-.45f,A2FieldLayout.GroundMaxZ),new Vector3(A2FieldLayout.GroundMaxX,-.45f,A2FieldLayout.GroundMaxZ)};
            waterMesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.up,Vector2.one};waterMesh.triangles=new[]{0,2,1,1,2,3};waterMesh.RecalculateNormals();waterMesh.RecalculateBounds();
            var water=new GameObject("A2 원본 보행 밖 독액 개울");water.transform.SetParent(a2Root.transform,false);water.layer=4;
            water.AddComponent<MeshFilter>().sharedMesh=waterMesh;var wr=water.AddComponent<MeshRenderer>();wr.sharedMaterial=a2Water;wr.shadowCastingMode=ShadowCastingMode.Off;
            NativeGroundSkillProjection.RegisterWaterReceiver(water.GetComponent<MeshFilter>());
            // 수면이 높은 지면 아래 숨어 있으므로 원본 보행 타일을 수로로 바꾸지 않는다.
            r3Cam.cullingMask|=1<<4;var reflection=water.AddComponent<A2RiverReflection>();reflection.Viewer=r3Cam;reflection.Surface=a2Water;reflection.Height=-.45f;
        }
        void A2FieldOuterMass()
        {
            // 원본 외곽 윤곽을 따라 BACK/MID/FRONT를 연결한다. 중앙 공터에는 세로 장애물을 넣지 않는다.
            for(int row=0;row<=22;row++)
            {
                float z=-80+row*3.6f;int tileY=Mathf.Clamp(Mathf.FloorToInt(-z/.4f),0,199),left=-1,right=-1;
                for(int x=0;x<200;x++)if(Map.Data.tiles[tileY*200+x]!=1){if(left<0)left=x;right=x;}
                if(left<0)continue;
                foreach(int side in new[]{-1,1})for(int layer=0;layer<3;layer++)
                {
                    float edge=(side<0?left:right+1)*.4f;
                    float x=edge+side*(2.0f+layer*4.8f+.3f*Mathf.Sin(row*.73f+layer*2));
                    float zz=z+Mathf.Sin(row*1.7f+layer*1.3f)*.8f;
                    if(!a2Field.TreeSite(x,zz,1.1f))continue;
                    float scale=.65f+.15f*Mathf.Sin(row*2.13f+layer*.7f);
                    bool opening=layer==0&&row%3!=1;float treeYaw=opening?-25+35*Mathf.Sin(row*1.7f+side*.5f):row*137+layer*71+side*23;
                    var tree=A2Module(opening?"Hollow_Loft_Tree":"Ancient_Rotten_Tree",x,zz,layer==0?.48f:scale,1.2f+layer*.16f+.2f*Mathf.Sin(row*.9f),layer==0?.48f:scale,treeYaw);
                    if(tree!=null)tree.name="A2 外곽 "+side+"/"+layer+"/"+row;
                    if(layer==0)
                    {
                        A2Module("Fallen_Log",x-side*.7f,zz+.7f,.8f,.65f,.9f,row*57+side*33,-.05f);
                        A2Module("Withered_Shrub",x-side*1.1f,zz-.6f,1.25f,1.1f,1.1f,row*73);
                        A2Module("Moss_Cushion",x-side*1.2f,zz+.2f,1.6f,.65f,1.5f,row*31,-.08f);
                        if(tree!=null)A2FieldDressTree(tree,row);
                        A2FieldRoots(x-side*.7f,zz,1.8f,row*79+side*31);
                    }
                }
            }
            // 北/SOUTH와 초광폭의 대각선까지 안개 속 겹친 숲으로 닫는다.
            var farSites=a2Field.DistantForestSites();
            for(int i=0;i<farSites.GetLength(0);i++)
            {
                float x=farSites[i,0],z=farSites[i,1];int row=(int)farSites[i,2],col=(int)farSites[i,3];
                float s=.5f+.22f*Mathf.Sin(col*3.4f+row*2.1f);
                var tree=A2Module("Ancient_Rotten_Tree",x,z,s,1.2f+.55f*Mathf.Sin(row*.7f+col*.8f),s,row*127+col*83);
                if(tree!=null){tree.name="A2 안개 원경 "+row+"/"+col;if(a2Field.Distance(x,z)<-28)foreach(var r in tree.GetComponentsInChildren<MeshRenderer>())r.shadowCastingMode=ShadowCastingMode.Off;}
            }
            Debug.Log("[A2 원경 숲] "+farSites.GetLength(0)+"개/10u격자·80u밖시야연결/원본통행밖12..110u/28u밖그림자LOD");
        }
        void A2FieldLandmarks()
        {
            // 原본 충돌 타원에만 밑동을 둔다. 반경 작은 나무는 가는 고사목/그루터기로 번역한다.
            int index=0;var tallCenters=new List<Vector2>();
            foreach(var c in Map.Data.colliders)
            {
                float x=c.x/100,z=-c.y/100,r=Mathf.Min(c.rx,c.ry)/100;
                if(r<.45f)continue;
                if(r>=1.2f)
                {
                    bool duplicate=false;foreach(var previous in tallCenters)if((previous-new Vector2(x,z)).sqrMagnitude<.75f*.75f){duplicate=true;break;}
                    if(duplicate)continue;tallCenters.Add(new Vector2(x,z));
                }
                float treeYaw=r>=1.2f?(x<40?-25:23)+15*Mathf.Sin(index*1.3f):index*97;
                var tree=r>=1.2f?A2Module("Hollow_Loft_Tree",x,z,.38f*r,1.1f,.38f*r,treeYaw):A2Module("Scanned_Stump",x,z,.6f*r,.6f*r,.6f*r,treeYaw);
                if(tree!=null&&r>=1.2f)A2FieldDressTree(tree,index);
                A2FieldRoots(x,z,Mathf.Clamp(r*1.5f,1.6f,3.1f),treeYaw);index++;
            }
            // 시작 갈림길의 낮은 목교는 통로와 나란히 놓이며 별도 충돌을 만들지 않는다.
            var bridge=A2Module("Rotten_Wood_Bridge",43.2f,-71.8f,.96f,.55f,.85f,24,.02f);
            if(bridge!=null)bridge.name="A2 시작 목교";
            A2Torch(40.8f,-74.1f);A2Torch(45.6f,-69.5f);
            foreach(var p in new[]{new Vector2(31,-61),new Vector2(18.3f,-40.2f),new Vector2(59,-39),new Vector2(32,-15),new Vector2(40,-5.5f)})
                A2Torch(p.x,p.y);
        }
        void A2FieldConnections()
        {
            // 각 전투 구역은 서로 다른 지면 결/낮은 목질로 연결한다. 높은 장식은 원본 경계 밖이다.
            for(int region=0;region<A2FieldLayout.Regions.GetLength(0);region++)
            {
                var center=new Vector2(A2FieldLayout.Regions[region,0],A2FieldLayout.Regions[region,1]);
                for(int side=-1;side<=1;side+=2)
                {
                    float x=center.x+side*(3.8f+.8f*Mathf.Sin(region*2.1f)),z=center.y+side*(2.8f+.6f*Mathf.Cos(region));
                    if((A2RRequested&&A2RD3.On?a2Field.Distance(x,z)>-.6f:a2Field.Distance(x,z)<.8f)||a2Field.Water(x,z))continue; // D3 density: lane-side roots only outside the walk edge
                    A2FieldRoots(x,z,2.05f,region*71+side*37);
                    var log=A2Module("Fallen_Log",x,z,.9f,.45f,.9f,region*79+side*51,-.05f);
                    if(log!=null)log.name="A2 전투구역 쓰러진 목질 "+region+"/"+side;
                }
                for(int j=0;j<7;j++)
                {
                    float angle=(j*51+region*37)*Mathf.Deg2Rad;
                    float x=center.x+Mathf.Cos(angle)*(2.3f+j*.55f),z=center.y+Mathf.Sin(angle)*(1.7f+j*.37f);
                    if(a2Field.Distance(x,z)<.4f)continue;
                    A2Module("Dead_Leaf_Litter",x,z,1.1f,.7f,1.1f,j*137+region*31,.01f);
                    if(j%3==0&&!(A2RRequested&&A2RD3.On))A2FieldRoots(x,z,.9f,region*53+j*71); // D3: no ring roots on the combat lane
                }
            }
        }
        Material a2FieldRootMaterial;
        void A2FieldRoots(float x,float z,float scale,float yaw)
        {
            using(A2FieldSample("뿌리 전체"))
            {
            if(a2Field.Water(x,z))return;
            var source=Resources.Load<GameObject>("Art/map/a2/rootrelief/Models/A2_Root_Cluster_Patch");
            if(source==null){Debug.LogError("[A2 필드] 스캔 뿌리 지면 누락");return;}
            A2FieldEnsureRootMaterial();
            float baseY=a2Field.TerrainHeight(x,z);var go=Instantiate(source,a2Root.transform);go.name="A2 흙에 이어진 스캔 뿌리";
            go.transform.SetPositionAndRotation(new Vector3(x,baseY,z),Quaternion.Euler(0,yaw,0));go.transform.localScale=new Vector3(scale,.8f,scale);
            foreach(var mf in go.GetComponentsInChildren<MeshFilter>())
            {
                if(!mf.sharedMesh.isReadable){Debug.LogError("[A2 필드] 뿌리 메시 읽기 누락");continue;}
                var mesh=Instantiate(mf.sharedMesh);var vertices=mesh.vertices;var center=mf.transform.TransformPoint(mesh.bounds.center);var shift=new Vector3(center.x-x,0,center.z-z);
                for(int i=0;i<vertices.Length;i++){var v=mf.transform.TransformPoint(vertices[i])-shift;v.y=a2Field.TerrainHeight(v.x,v.z)+Mathf.Max(0,v.y-baseY)+.006f;vertices[i]=mf.transform.InverseTransformPoint(v);}
                mesh.vertices=vertices;mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();mf.sharedMesh=mesh;
            }
            foreach(var r in go.GetComponentsInChildren<MeshRenderer>())r.sharedMaterial=a2FieldRootMaterial;A2FieldRegister(go);
            }
        }
        void A2FieldRegister(GameObject go,bool deck=false)
        {
            using(A2FieldSample("표면 등록 전체"))
            {
            foreach(var mf in go.GetComponentsInChildren<MeshFilter>())
            {
                if(NativeGroundSkillProjection.IsProxy(mf))continue;
                var mesh=mf.sharedMesh;if(!mesh.isReadable){Debug.LogError("[A2 필드] 접지 표면 읽기 누락 "+go.name);continue;}
                var vertices=mesh.vertices;var xyz=new float[vertices.Length*3];
                for(int i=0;i<vertices.Length;i++){var p=mf.transform.TransformPoint(vertices[i]);xyz[i*3]=p.x;xyz[i*3+1]=p.y;xyz[i*3+2]=p.z;}
                var indices=mesh.triangles;
                using(A2FieldSample("높이 표면 래스터"))
                {if(deck)a2Field.RegisterDeckSurface(xyz,indices,go.transform.position.y+.4f);else a2Field.RegisterSurface(xyz,indices); }
                using(A2FieldSample("스킬 접지 메시"))NativeGroundSkillProjection.RegisterReceiver(mf,xyz,indices,a2Field.TerrainHeight,deck,go.transform.position.y+.4f);
            }
            }
        }
        void A2FieldDressTree(GameObject tree,int variation)
        {
            using(A2FieldSample("수피 부착"))
            {
            var filters=tree.GetComponentsInChildren<MeshFilter>();
            foreach(var mf in filters)
            {
                if(!mf.sharedMesh.isReadable)continue;
                var points=mf.sharedMesh.vertices;var normals=mf.sharedMesh.normals;
                // Three attachment queries use the same world points and rotation-only normals.
                // Scalar engine operations preserve threshold decisions in the receiver mask.
                for(int i=0;i<points.Length;i++){points[i]=mf.transform.TransformPoint(points[i]);normals[i]=mf.transform.TransformDirection(normals[i]);}
                for(int j=0;j<3;j++)
                {
                    var desired=tree.transform.position+new Vector3((j-1)*.45f,1.5f+j*.8f,-.8f);float best=float.MaxValue;var hit=Vector3.zero;var hitNormal=Vector3.back;
                    for(int i=0;i<points.Length;i++){var p=points[i];var n=normals[i];if(n.z>-.12f)continue;float score=(p-desired).sqrMagnitude;if(score<best){best=score;hit=p;hitNormal=n.normalized;}}
                    if(best>9)continue;
                    var moss=A2Module("Hanging_Moss",hit.x,hit.z,.4f,.55f,.4f,variation*37+j*67);if(moss==null)continue;
                    var rs=moss.GetComponentsInChildren<Renderer>();var bounds=rs[0].bounds;foreach(var r in rs)bounds.Encapsulate(r.bounds);
                    moss.transform.position+=hit-new Vector3(bounds.center.x,bounds.max.y,bounds.center.z);moss.name="A2 수피 표면에 붙은 이끼";
                    foreach(var renderer in rs){var tint=new MaterialPropertyBlock();renderer.GetPropertyBlock(tint);tint.SetColor("_BaseColor",new Color(.60f,.62f,.40f,1));renderer.SetPropertyBlock(tint);}
                    if(j==0)
                    {
                        var fungus=A2Module("Fungal_Colony",hit.x,hit.z,.48f,.4f,.48f,variation*71,0,false);
                        if(fungus!=null)
                        {
                            var fr=fungus.GetComponentsInChildren<Renderer>();if(fr.Length==0){Destroy(fungus);continue;}
                            var fb=fr[0].bounds;foreach(var r in fr)fb.Encapsulate(r.bounds);
                            fungus.transform.position+=hit+hitNormal*.06f-fb.center;fungus.name="A2 수피에 접합한 버섯";
                        }
                    }
                }
                break;
            }
            }
        }
        void A2FieldEnsureRootMaterial()
        {
            if(a2FieldRootMaterial!=null)return;
                a2FieldRootMaterial=new Material(Resources.Load<Material>("Art/map/a2/rootrelief/Materials/A2_Root_Cluster_Patch"));
                foreach(var key in new[]{"_BaseMap","_BumpMap","_RockMap","_AshMap","_RockNormal","_RockRough","_ForestMap","_ForestNormal","_ForestRough","_SoilMap","_SoilNormal","_SoilRough","_RootMap","_RootNormal","_RootRough","_FieldSdf","_FieldCover","_FieldMoss","_FieldMossNormal","_FieldMossRough"})
                    if(a2FieldRootMaterial.HasProperty(key))a2FieldRootMaterial.SetTexture(key,a2FieldSoil.GetTexture(key));
                foreach(var key in new[]{"_ForestBlend","_ForestTextureMix","_SoilTextureMix","_FullField"})if(a2FieldRootMaterial.HasProperty(key))a2FieldRootMaterial.SetFloat(key,a2FieldSoil.GetFloat(key));
                a2FieldRootMaterial.SetColor("_ScanColor",new Color(.9f,.8f,.63f,1));
            
        }
        public const string A2FieldCacheResource="A2R/Baked/Field/";
        public const int A2FieldCacheVersion=1;
        public static bool? A2FieldCacheQaOverride;
        [Serializable] public sealed class A2FieldCacheIndex
        {public int version;public bool verified;public string mapHash;public string[] stages,inputPaths,inputHashes;}
        [Serializable] public sealed class A2FieldCacheStage
        {public int version;public string mapHash;public A2FieldCacheRenderer[] renderers;public int filters;}
        [Serializable] public sealed class A2FieldCacheRenderer
        {public string[] roles;public A2FieldCacheProperty[] properties;}
        [Serializable] public sealed class A2FieldCacheProperty
        {public string name,texture;public int kind,integer;public float scalar;public Color color;public Vector4 vector;}
        A2FieldCacheIndex a2FieldCacheIndex;
        bool a2FieldCacheChecked;
        string a2FieldCacheMapHash;
        bool A2FieldTryLoadStage(string stage)
        {
            // Existing off selectors always take precedence. The override is QA-only.
            if(A2FieldCacheQaOverride.HasValue&&!NativeQaSandbox.Active)throw new InvalidOperationException("A2 field cache override requires isolated QA");
            if(A2FieldCacheQaOverride==false||Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-field-bake-off")>=0||!A2RRequested||!A2RD3.On||!A2RProps3D.TerrainEnabled||hellFlameFrames==null)return false;
            if(!a2FieldCacheChecked)
            {
                a2FieldCacheChecked=true;a2FieldCacheMapHash=Hash128.Compute(JsonUtility.ToJson(Map.Data)).ToString();
                var index=Resources.Load<TextAsset>(A2FieldCacheResource+"index");
                if(index!=null)a2FieldCacheIndex=JsonUtility.FromJson<A2FieldCacheIndex>(index.text);
            }
            if(a2FieldCacheIndex==null||(!a2FieldCacheIndex.verified&&A2FieldCacheQaOverride!=true)||a2FieldCacheIndex.version!=A2FieldCacheVersion||a2FieldCacheIndex.mapHash!=a2FieldCacheMapHash||Array.IndexOf(a2FieldCacheIndex.stages,stage)<0)return false;
            var description=Resources.Load<TextAsset>(A2FieldCacheResource+stage+"-meta");
            var bytes=Resources.Load<TextAsset>(A2FieldCacheResource+stage+"-state");
            var prefab=Resources.Load<GameObject>(A2FieldCacheResource+stage);
            if(description==null||bytes==null||prefab==null)return false;
            var meta=JsonUtility.FromJson<A2FieldCacheStage>(description.text);
            if(meta.version!=A2FieldCacheVersion||meta.mapHash!=a2FieldCacheMapHash)throw new System.IO.InvalidDataException("A2 field cache stage version: "+stage);
            using(var stream=new System.IO.MemoryStream(bytes.bytes,false))
            using(var reader=new System.IO.BinaryReader(stream))
            {
                if(reader.ReadInt32()!=0x41324632||reader.ReadString()!=stage)throw new System.IO.InvalidDataException("A2 field cache stage header");
                if(reader.ReadBoolean())a2Field.ReadVisualSurfaces(reader);
                var holder=Instantiate(prefab,a2Root.transform,false);
                var filters=holder.GetComponentsInChildren<MeshFilter>(true);var renderers=holder.GetComponentsInChildren<Renderer>(true);
                if(filters.Length!=meta.filters||renderers.Length!=meta.renderers.Length)throw new System.IO.InvalidDataException("A2 field cache hierarchy: "+stage);
                for(int i=0;i<renderers.Length;i++)
                {
                    var state=meta.renderers[i];var slots=renderers[i].sharedMaterials;
                    if(slots.Length!=state.roles.Length)throw new System.IO.InvalidDataException("A2 field cache material slots");
                    bool changed=false;
                    for(int j=0;j<slots.Length;j++)
                    {
                        switch(state.roles[j])
                        {
                            case "soil":slots[j]=a2FieldSoil;changed=true;break;
                            case "root":A2FieldEnsureRootMaterial();slots[j]=a2FieldRootMaterial;changed=true;break;
                            case "water":if(a2Water==null)a2Water=new Material(slots[j]);slots[j]=a2Water;changed=true;break;
                        }
                    }
                    if(changed)renderers[i].sharedMaterials=slots;
                    if(state.properties.Length>0)
                    {
                        var block=new MaterialPropertyBlock();
                        foreach(var p in state.properties)
                        {
                            switch(p.kind)
                            {
                                case 0:block.SetColor(p.name,p.color);break;
                                case 1:block.SetVector(p.name,p.vector);break;
                                case 2:block.SetFloat(p.name,p.scalar);break;
                                case 3:block.SetInteger(p.name,p.integer);break;
                                case 4:block.SetTexture(p.name,string.IsNullOrEmpty(p.texture)?null:Resources.Load<Texture>(p.texture));break;
                            }
                        }
                        renderers[i].SetPropertyBlock(block);
                    }
                    var sprite=renderers[i] as SpriteRenderer;
                    if(sprite!=null&&sprite.name=="A2 횃불 불꽃"){sprite.sprite=hellFlameFrames[0];hellFlames.Add(sprite);}
                }
                int records=reader.ReadInt32();if(records<0||records>filters.Length)throw new System.IO.InvalidDataException("A2 field receiver count");
                for(int i=0;i<records;i++)
                {
                    int source=reader.ReadInt32();bool bounded=reader.ReadBoolean(),water=reader.ReadBoolean(),deck=reader.ReadBoolean();float ceiling=reader.ReadSingle();
                    if(source<0||source>=filters.Length)throw new System.IO.InvalidDataException("A2 field receiver source");
                    if(bounded)
                    {
                        var world=A2FieldReadFloats(reader);var indices=A2FieldReadInts(reader);var beds=A2FieldReadFloats(reader);
                        if(world.Length!=filters[source].sharedMesh.vertexCount*3||(!deck&&beds.Length*3!=world.Length))throw new System.IO.InvalidDataException("A2 field receiver vertices");
                        int sample=0;Func<float,float,float> terrain=null;
                        if(!deck)terrain=(x,z)=>{int n=sample++;if(n>=beds.Length||world[n*3]!=x||world[n*3+2]!=z)throw new System.IO.InvalidDataException("A2 field receiver sampling order");return beds[n];};
                        NativeGroundSkillProjection.RegisterReceiver(filters[source],world,indices,terrain,deck,ceiling);
                        if(!deck&&sample!=beds.Length)throw new System.IO.InvalidDataException("A2 field receiver sample count");
                    }
                    else NativeGroundSkillProjection.RegisterReceiver(filters[source]);
                    if(water)NativeGroundSkillProjection.RegisterWaterReceiver(filters[source]);
                }
                if(stream.Position!=stream.Length)throw new System.IO.InvalidDataException("A2 field receiver trailing data");
                foreach(var reflection in holder.GetComponentsInChildren<A2RiverReflection>(true)){reflection.Viewer=r3Cam;reflection.Surface=a2Water;}
                if(stage=="ground")r3Cam.cullingMask|=1<<4;
                // Keep the original direct-child names and world transforms for A2R consumers.
                while(holder.transform.childCount>0)holder.transform.GetChild(0).SetParent(a2Root.transform,false);
                if(Application.isPlaying)Destroy(holder);else DestroyImmediate(holder);
            }
            Debug.Log("[A2 전체필드] 구운 단계 "+stage);return true;
        }
        static float[] A2FieldReadFloats(System.IO.BinaryReader reader)
        {
            int count=reader.ReadInt32();if(count<0||count>40000000)throw new System.IO.InvalidDataException("A2 field float count");
            var bytes=reader.ReadBytes(count*4);if(bytes.Length!=count*4)throw new System.IO.EndOfStreamException();
            var values=new float[count];Buffer.BlockCopy(bytes,0,values,0,bytes.Length);return values;
        }
        static int[] A2FieldReadInts(System.IO.BinaryReader reader)
        {
            int count=reader.ReadInt32();if(count<0||count>40000000)throw new System.IO.InvalidDataException("A2 field index count");
            var bytes=reader.ReadBytes(count*4);if(bytes.Length!=count*4)throw new System.IO.EndOfStreamException();
            var values=new int[count];Buffer.BlockCopy(bytes,0,values,0,bytes.Length);return values;
        }

        [Serializable] public sealed class A2FieldStageTiming {public string stage;public double ms;public bool baked;}
        readonly List<A2FieldStageTiming> a2FieldMeasuredStages=new List<A2FieldStageTiming>();
        double a2FieldMeasuredTargetMs,a2FieldMeasuredFullMs;
        int a2FieldMeasuredFrame;
        void A2FieldExecuteStage(string stage,string label,Action build)
        {
            var watch=System.Diagnostics.Stopwatch.StartNew();bool baked=A2FieldTryLoadStage(stage);if(!baked)build();
            a2FieldMeasuredStages.Add(new A2FieldStageTiming{stage=stage,ms=watch.Elapsed.TotalMilliseconds,baked=baked});
            A2FieldCostFlush(label);A2RStage.Mark(label);
        }
        [Serializable] sealed class A2FieldPlayerReceipt
        {
            public string phase,scope="Same-player procedural/baked fixed-pose comparison. Time scale zero; no natural-play or balance claim.";
            public double targetMs,fullMs,peakFrameMs,assemblyFrameMs;public int assemblyFrame;public bool ready;public List<A2FieldStageTiming> stages;
            public List<A2FieldPlayerShot> shots=new List<A2FieldPlayerShot>();public List<string> failures=new List<string>();
        }
        [Serializable] sealed class A2FieldPlayerShot {public string id;public float x,y,pitch,fov;public int width,height;public Vector3 camera;public List<Vector2> distantSprites=new List<Vector2>();}
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void A2FieldPlayerCheckBoot()
        {
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--fieldbuild-capture")<0)return;
            if(!NativeQaSandbox.Active)throw new InvalidOperationException("Field comparison requires isolated saves");
            A2FieldCacheQaOverride=false;Time.timeScale=0;AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            var host=new GameObject("A2 field comparison");DontDestroyOnLoad(host);host.AddComponent<A2FieldPlayerCheck>();
        }
        sealed class A2FieldPlayerCheck : MonoBehaviour
        {
            long last=System.Diagnostics.Stopwatch.GetTimestamp();int lastFrame;public bool Recording=true;public double Peak;
            readonly Dictionary<int,double> frames=new Dictionary<int,double>();
            readonly List<string> errors=new List<string>();
            void OnEnable(){Application.logMessageReceived+=Log;}
            void OnDisable(){Application.logMessageReceived-=Log;}
            void Log(string message,string stack,LogType type){if(type==LogType.Error||type==LogType.Exception||type==LogType.Assert)errors.Add(message);}
            void Update()
            {
                long now=System.Diagnostics.Stopwatch.GetTimestamp();double ms=(now-last)*1000.0/System.Diagnostics.Stopwatch.Frequency;
                if(Recording){Peak=Math.Max(Peak,ms);frames[lastFrame]=ms;}last=now;lastFrame=Time.frameCount;
            }
            void ResetFrames(){Peak=0;frames.Clear();errors.Clear();last=System.Diagnostics.Stopwatch.GetTimestamp();lastFrame=Time.frameCount;Recording=true;}
            System.Collections.IEnumerator Start()
            {
                string output=Argument("-output");if(string.IsNullOrEmpty(output)||!System.IO.Path.IsPathRooted(output)){Application.Quit(3);yield break;}
                System.IO.Directory.CreateDirectory(output);bool passed=true;
                for(int round=0;round<2;round++)
                {
                    NativeGame game=null;float limit=Time.realtimeSinceStartup+90;
                    while(game==null&&Time.realtimeSinceStartup<limit){game=Instance;yield return null;}
                    if(game==null){Application.Quit(3);yield break;}
                    var receipt=new A2FieldPlayerReceipt{phase=round==0?"procedural":"baked"};
                    string folder=System.IO.Path.Combine(output,receipt.phase);System.IO.Directory.CreateDirectory(folder);
                    yield return game.A2FieldPlayerRound(folder,receipt,this);
                    receipt.failures.AddRange(errors);
                    double frame;receipt.assemblyFrameMs=frames.TryGetValue(receipt.assemblyFrame,out frame)?frame:0;receipt.peakFrameMs=Peak;
                    if(round==1&&(receipt.targetMs>1500||receipt.stages==null||receipt.stages.Exists(s=>!s.baked)))receipt.failures.Add("Baked target budget/cache hit failed");
                    passed&=receipt.ready&&receipt.failures.Count==0;
                    System.IO.File.WriteAllText(System.IO.Path.Combine(folder,"fieldbuild.json"),JsonUtility.ToJson(receipt,true));
                    if(round==0)
                    {
                        string scene=game.gameObject.scene.name;game.lobby.CloseStartupCaptureMedia();game.sound.Reset();
                        A2FieldCacheQaOverride=true;NativeRemodel3D.Active=false;NativeRemodel3D.Field=null;NativeRemodel3D.ForestA2=false;NativeRemodel3D.Ground=null;
                        ResetFrames();var load=UnityEngine.SceneManagement.SceneManager.LoadSceneAsync(scene,UnityEngine.SceneManagement.LoadSceneMode.Single);
                        while(!load.isDone)yield return null;
                    }
                }
                System.IO.File.WriteAllText(System.IO.Path.Combine(output,"fieldbuild-result.txt"),passed?"통과: 고정 시점 비교·목표 시간. 실제 이미지 픽셀·먼 적은 별도 직접 검수.":"실패: fieldbuild.json 확인");
                Application.Quit(passed?0:3);
            }
        }
        System.Collections.IEnumerator A2FieldPlayerRound(string output,A2FieldPlayerReceipt receipt,A2FieldPlayerCheck monitor)
        {
            Screen.SetResolution(3840,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.25f);
#if UNITY_STANDALONE_WIN
            if(Screen.width!=3840||Screen.height!=1080)FieldCaptureResize(3840,1080);
#endif
            lobby.AutomatedInput=true;lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();EndFirstPractice(true);
            frontendEntryInputFence=false;menu=false;Running=false;gameFocused=true;Simulation.Config.EnemyAiEnabled=false;
            float limit=Time.realtimeSinceStartup+90;
            while((!Remodel3DReady||a2Root==null||a2rWeb==null)&&Time.realtimeSinceStartup<limit){UpdateViews();yield return null;}
            receipt.ready=Remodel3DReady&&a2Root!=null&&a2rWeb!=null;
            yield return null;monitor.Recording=false;
            receipt.targetMs=a2FieldMeasuredTargetMs;receipt.fullMs=a2FieldMeasuredFullMs;receipt.assemblyFrame=a2FieldMeasuredFrame;receipt.stages=new List<A2FieldStageTiming>(a2FieldMeasuredStages);
            if(!receipt.ready){receipt.failures.Add("Field did not become ready");yield break;}
            var camp=new Vector2(2050,4400);foreach(var prop in Map.Data.props)if(prop.id=="m_c1camp"){camp=new Vector2(prop.x,prop.y);break;}
            var points=new[]{new Vector2(Simulation.Player.X,Simulation.Player.Y),camp};var names=new[]{"02-field-entry","camp"};
            for(int shot=0;shot<points.Length;shot++)
            {
                var p=points[shot];
                if(!Map.CanMove(p.x,p.y,Simulation.Player.Radius))
                {
                    bool found=false;
                    for(int radius=1;radius<=12&&!found;radius++)for(int n=0;n<32;n++)
                    {float angle=n*Mathf.PI/16;var q=points[shot]+new Vector2(Mathf.Cos(angle),Mathf.Sin(angle))*radius*20;if(Map.CanMove(q.x,q.y,Simulation.Player.Radius)){p=q;found=true;break;}}
                    if(!found){receipt.failures.Add("Fixed comparison point blocked: "+names[shot]);continue;}
                }
                Simulation.Player.X=p.x;Simulation.Player.Y=p.y;lastX=p.x;lastY=p.y;
                if(r3Vcam!=null)r3Vcam.PreviousStateIsValid=false;
                for(int i=0;i<16;i++){UpdateViews();if(r3Brain!=null)r3Brain.ManualUpdate();yield return null;}
                yield return new WaitForEndOfFrame();
                var image=ScreenCapture.CaptureScreenshotAsTexture();System.IO.File.WriteAllBytes(System.IO.Path.Combine(output,names[shot]+".png"),image.EncodeToPNG());Destroy(image);
                var frame=new A2FieldPlayerShot{id=names[shot],x=p.x,y=p.y,width=Screen.width,height=Screen.height,pitch=r3Cam.transform.eulerAngles.x,fov=r3Cam.fieldOfView,camera=r3Cam.transform.position};
                foreach(var enemy in enemies.Values)
                {
                    SpriteRenderer visible=enemy.body!=null&&enemy.body.enabled?enemy.body:enemy.walk;
                    if(visible==null||!visible.enabled||!visible.gameObject.activeInHierarchy)continue;
                    var at=r3Cam.WorldToScreenPoint(visible.bounds.center);
                    if(at.z>0&&at.x>0&&at.x<Screen.width&&at.y>Screen.height*.60f&&at.y<Screen.height)frame.distantSprites.Add(new Vector2(at.x,Screen.height-at.y));
                }
                receipt.shots.Add(frame);if(Screen.width!=3840||Screen.height!=1080)receipt.failures.Add("3840x1080 native size mismatch");
            }
        }

        void A2FieldAtmosphere()
        {
            var haze=new GameObject("A2 지면 높이 안개");haze.transform.SetParent(a2Root.transform,false);haze.layer=4;
            var screen=new Mesh{name="높이 안개 화면 적분"};screen.vertices=new[]{new Vector3(-1,-1,0),new Vector3(1,-1,0),new Vector3(-1,1,0),new Vector3(1,1,0)};screen.triangles=new[]{0,2,1,1,2,3};
            screen.bounds=new Bounds(Vector3.zero,Vector3.one*10000);
            haze.AddComponent<MeshFilter>().sharedMesh=screen;var fog=haze.AddComponent<MeshRenderer>();fog.sharedMaterial=new Material(Shader.Find("EXODUSER/A2HeightFog"));fog.shadowCastingMode=ShadowCastingMode.Off;
            var shader=Shader.Find("EXODUSER/A2Atmosphere");
            var moonDirection=Quaternion.Euler(49,-32,0)*Vector3.forward;
            foreach(var root in r3Roots)foreach(var light in root.GetComponentsInChildren<Light>(true))if(light.enabled&&light.type==LightType.Directional)moonDirection=light.transform.forward;
            foreach(var p in new[]{new Vector2(39,-70),new Vector2(26,-60),new Vector2(60,-58),new Vector2(21,-40),new Vector2(43,-34),new Vector2(64,-39),new Vector2(30,-18),new Vector2(53,-16),new Vector2(40,-6)})
            {
                var bottom=new Vector3(p.x,a2Field.Height(p.x,p.y),p.y);var top=bottom-moonDirection*(13/Mathf.Max(.1f,-moonDirection.y));
                var side=Vector3.right;var mesh=new Mesh{name="수관 사이 달빛"};mesh.vertices=new[]{top-side*.3f,top+side*.3f,bottom-side*1.5f,bottom+side*1.5f};mesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.up,Vector2.one};mesh.triangles=new[]{0,2,1,1,2,3};mesh.RecalculateBounds();
                var go=new GameObject("A2 필드 국소 빛기둥");go.transform.SetParent(a2Root.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;
                var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=new Material(shader);r.sharedMaterial.SetColor("_Color",new Color(1.1f,1.4f,1.65f,.065f));r.shadowCastingMode=ShadowCastingMode.Off;
            }
        }
    }
}
