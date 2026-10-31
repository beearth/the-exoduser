using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        A2FieldLayout a2Field;
        Material a2FieldSoil;
        void A2FieldSetup(Terrain ground)
        {
            if(ground==null||a2Root!=null)return;
            var timer=System.Diagnostics.Stopwatch.StartNew();
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
            if(a2FieldSoil==null){Debug.LogError("[A2 필드] 지면 재질 누락");return;}
            a2FieldSoil.SetFloat("_ForestBlend",1);a2FieldSoil.SetFloat("_ForestTextureMix",.65f);a2FieldSoil.SetFloat("_SoilTextureMix",1);a2FieldSoil.SetFloat("_FullField",1);
            foreach(var pair in new[]{new[]{"_ForestMap","A2_ForestFloor_BaseColor"},new[]{"_ForestNormal","A2_ForestFloor_Normal"},new[]{"_ForestRough","A2_ForestFloor_Roughness"},new[]{"_SoilMap","A2_ForestSoil_BaseColor"},new[]{"_SoilNormal","A2_ForestSoil_Normal"},new[]{"_SoilRough","A2_ForestSoil_Roughness"},new[]{"_RootMap","A2_ExposedRoots_BaseColor"},new[]{"_RootNormal","A2_ExposedRoots_Normal"},new[]{"_RootRough","A2_ExposedRoots_Roughness"}})
            {
                var tex=Resources.Load<Texture2D>("Art/map/a2/ground/"+pair[1]);
                if(tex==null){Debug.LogError("[A2 필드] 스캔 지면 누락 "+pair[1]);continue;}
                a2FieldSoil.SetTexture(pair[0],tex);
            }
            foreach(var pair in new[]{new[]{"_FieldMoss","BaseColor"},new[]{"_FieldMossNormal","Normal"},new[]{"_FieldMossRough","Roughness"}})
            {var moss=Resources.Load<Texture2D>("Art/map/a2/ground/A2_FieldMoss_"+pair[1]);if(moss==null)Debug.LogError("[A2 필드] 이끼 지면 누락 "+pair[1]);else a2FieldSoil.SetTexture(pair[0],moss);}
            var sdf=new Texture2D(200,200,TextureFormat.RGBA32,false,true){name="원본 보행 경계 시각 거리장",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            var pixels=new Color[40000];
            for(int y=0;y<200;y++)for(int x=0;x<200;x++)pixels[y*200+x]=new Color(.5f+a2Field.Distance((x+.5f)*.4f,-(y+.5f)*.4f)/40,0,0,1);
            sdf.SetPixels(pixels);sdf.Apply(false,true);a2FieldSoil.SetTexture("_FieldSdf",sdf);
            var cover=new Texture2D(256,256,TextureFormat.RGBA32,false,true){name="A2 전투중심을 비운 연결 이끼 지면",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            var coverPixels=new Color[256*256];for(int y=0;y<256;y++)for(int x=0;x<256;x++)coverPixels[y*256+x]=new Color(a2Field.GroundCover((x+.5f)/256*80,-(y+.5f)/256*80),0,0,1);
            cover.SetPixels(coverPixels);cover.Apply(false,true);a2FieldSoil.SetTexture("_FieldCover",cover);
            A2FieldOuterMass();A2FieldBanks();A2Foreground(true);A2FieldLandmarks();A2FieldConnections();A2FieldGround();A2FieldGroundCover();A2BridgeMoss();A2FieldAtmosphere();
            var aa=r3Cam.GetUniversalAdditionalCameraData();aa.antialiasing=NativeHd2D.Enabled?AntialiasingMode.None:AntialiasingMode.SubpixelMorphologicalAntiAliasing;aa.antialiasingQuality=AntialiasingQuality.High;
            aa.requiresDepthTexture=true;r3Cam.depthTextureMode|=DepthTextureMode.Depth;
            r3Cam.backgroundColor=new Color(.105f,.145f,.17f);r3Cam.farClipPlane=220;
            A2Ambient();Debug.Log("[A2 전체필드] 원본40000타일 보행·시야 불변/全域地面·외곽·접합 조립 "+timer.ElapsedMilliseconds+"ms");
        }
        void A2FieldGround()
        {
            // 32:9의 수평 시야와 최북단까지 이어지는 하나의 표면. 청크마다 다른 베이스를 쓰지 않는다.
            var xs=A2FieldLayout.GroundAxis(true);var zs=A2FieldLayout.GroundAxis(false);int nx=xs.Length,nz=zs.Length;
            var vertices=new Vector3[nx*nz];var uv=new Vector2[vertices.Length];var triangles=new int[(nx-1)*(nz-1)*6];int k=0;
            for(int y=0;y<nz;y++)for(int x=0;x<nx;x++)
            {
                float wx=xs[x],wz=zs[y];int i=y*nx+x;
                vertices[i]=new Vector3(wx,a2Field.TerrainHeight(wx,wz),wz);uv[i]=new Vector2(wx/80,-wz/80);
                if(x==nx-1||y==nz-1)continue;
                triangles[k++]=i;triangles[k++]=i+nx;triangles[k++]=i+1;triangles[k++]=i+1;triangles[k++]=i+nx;triangles[k++]=i+nx+1;
            }
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
            }
            Debug.Log("[A2 전체 지면] "+nx+"x"+nz+"/삼각형 "+triangles.Length/3+"/64셀청크 "+chunkCount+"/근경.25u·먼외곽2u/공유경계노멀·탄젠트");
            Destroy(mesh);
            a2Water=new Material(Shader.Find("EXODUSER/A2ToxicRiver"));A2ShoreField();
            var waterMesh=new Mesh{name="숲 외곽 독액 수면"};waterMesh.vertices=new[]{new Vector3(A2FieldLayout.GroundMinX,-.45f,A2FieldLayout.GroundMinZ),new Vector3(A2FieldLayout.GroundMaxX,-.45f,A2FieldLayout.GroundMinZ),new Vector3(A2FieldLayout.GroundMinX,-.45f,A2FieldLayout.GroundMaxZ),new Vector3(A2FieldLayout.GroundMaxX,-.45f,A2FieldLayout.GroundMaxZ)};
            waterMesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.up,Vector2.one};waterMesh.triangles=new[]{0,2,1,1,2,3};waterMesh.RecalculateNormals();waterMesh.RecalculateBounds();
            var water=new GameObject("A2 원본 보행 밖 독액 개울");water.transform.SetParent(a2Root.transform,false);water.layer=4;
            water.AddComponent<MeshFilter>().sharedMesh=waterMesh;var wr=water.AddComponent<MeshRenderer>();wr.sharedMaterial=a2Water;wr.shadowCastingMode=ShadowCastingMode.Off;
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
                    var tree=A2Module(opening?"Hollow_Loft_Tree":"Ancient_Rotten_Tree",x,zz,layer==0?.62f:scale,.84f+layer*.12f+.14f*Mathf.Sin(row*.9f),layer==0?.62f:scale,treeYaw);
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
        void A2FieldBanks()
        {
            var sites=a2Field.BankSites();
            for(int i=0;i<sites.GetLength(0);i++)
            {
                float x=sites[i,0],z=sites[i,1],yaw=sites[i,2],s=sites[i,3];
                // 실제 스캔 밑동+뿌리를 같은 접점에 묶어 가는 나무기둥과 맨흙 사이의 질량을 만든다.
                var stump=A2Module("Scanned_Stump",x,z,1.55f*s,.95f*s,1.25f*s,yaw,-.06f,false);
                if(stump!=null)stump.name="A2 R7 연결 목질 둑 밑동 "+i;
                var roots=A2Module(i%2==0?"PineRoots_A":"PineRoots_B",x,z,2.1f*s,1.8f*s,1.7f*s,yaw+29,-.09f,false);
                if(roots!=null)roots.name="A2 R7 연결 목질 둑 뿌리 "+i;
                if(i%3==1)
                {
                    var log=A2Module("Scanned_Foreground_Log",x,z,.65f*s,.55f*s,.55f*s,yaw+78,-.05f,false);
                    if(log!=null)log.name="A2 R7 연결 목질 둑 쓰러진 고목 "+i;
                }
            }
            Debug.Log("[A2 R7 연결 둑] "+sites.GetLength(0)+"군집/원본통행밖·마른둑/중심간3.8m/콜라이더·등록발판0");
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
                    if(a2Field.Distance(x,z)<.8f||a2Field.Water(x,z))continue;
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
                    if(j%3==0)A2FieldRoots(x,z,.9f,region*53+j*71);
                }
            }
        }
        Material a2FieldRootMaterial;
        void A2FieldRoots(float x,float z,float scale,float yaw)
        {
            if(a2Field.Water(x,z))return;
            var source=Resources.Load<GameObject>("Art/map/a2/rootrelief/Models/A2_Root_Cluster_Patch");
            if(source==null){Debug.LogError("[A2 필드] 스캔 뿌리 지면 누락");return;}
            if(a2FieldRootMaterial==null)
            {
                a2FieldRootMaterial=new Material(Resources.Load<Material>("Art/map/a2/rootrelief/Materials/A2_Root_Cluster_Patch"));
                foreach(var key in new[]{"_BaseMap","_BumpMap","_RockMap","_AshMap","_RockNormal","_RockRough","_ForestMap","_ForestNormal","_ForestRough","_SoilMap","_SoilNormal","_SoilRough","_RootMap","_RootNormal","_RootRough","_FieldSdf","_FieldCover","_FieldMoss","_FieldMossNormal","_FieldMossRough"})
                    if(a2FieldRootMaterial.HasProperty(key))a2FieldRootMaterial.SetTexture(key,a2FieldSoil.GetTexture(key));
                foreach(var key in new[]{"_ForestBlend","_ForestTextureMix","_SoilTextureMix","_FullField"})if(a2FieldRootMaterial.HasProperty(key))a2FieldRootMaterial.SetFloat(key,a2FieldSoil.GetFloat(key));
                a2FieldRootMaterial.SetColor("_ScanColor",new Color(.9f,.8f,.63f,1));
            }
            float baseY=a2Field.TerrainHeight(x,z);var go=Instantiate(source,a2Root.transform);go.name="A2 흙에 이어진 스캔 뿌리";
            go.transform.SetPositionAndRotation(new Vector3(x,baseY,z),Quaternion.Euler(0,yaw,0));go.transform.localScale=new Vector3(scale,.8f,scale);
            foreach(var mf in go.GetComponentsInChildren<MeshFilter>())
            {
                if(!mf.sharedMesh.isReadable){Debug.LogError("[A2 필드] 뿌리 메시 읽기 누락");continue;}
                var mesh=Instantiate(mf.sharedMesh);var vertices=mesh.vertices;var colors=mesh.colors;var center=mf.transform.TransformPoint(mesh.bounds.center);var shift=new Vector3(center.x-x,0,center.z-z);
                for(int i=0;i<vertices.Length;i++){var v=mf.transform.TransformPoint(vertices[i])-shift;v.y=a2Field.TerrainHeight(v.x,v.z)+A2FieldLayout.RootReliefHeight(v.y-baseY,colors.Length==vertices.Length?colors[i].r:1)+.006f;vertices[i]=mf.transform.InverseTransformPoint(v);}
                mesh.vertices=vertices;mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();mf.sharedMesh=mesh;
            }
            foreach(var r in go.GetComponentsInChildren<MeshRenderer>())r.sharedMaterial=a2FieldRootMaterial;A2FieldRegister(go);
        }
        void A2FieldRegister(GameObject go,bool deck=false)
        {
            foreach(var mf in go.GetComponentsInChildren<MeshFilter>())
            {
                var mesh=mf.sharedMesh;if(!mesh.isReadable){Debug.LogError("[A2 필드] 접지 표면 읽기 누락 "+go.name);continue;}
                var vertices=mesh.vertices;var xyz=new float[vertices.Length*3];
                for(int i=0;i<vertices.Length;i++){var p=mf.transform.TransformPoint(vertices[i]);xyz[i*3]=p.x;xyz[i*3+1]=p.y;xyz[i*3+2]=p.z;}
                if(deck)a2Field.RegisterDeckSurface(xyz,mesh.triangles,go.transform.position.y+.4f);else a2Field.RegisterSurface(xyz,mesh.triangles);
            }
        }
        void A2FieldDressTree(GameObject tree,int variation)
        {
            var filters=tree.GetComponentsInChildren<MeshFilter>();
            foreach(var mf in filters)
            {
                if(!mf.sharedMesh.isReadable)continue;
                var points=mf.sharedMesh.vertices;var normals=mf.sharedMesh.normals;
                for(int j=0;j<3;j++)
                {
                    var desired=tree.transform.position+new Vector3((j-1)*.45f,1.5f+j*.8f,-.8f);float best=float.MaxValue;var hit=Vector3.zero;var hitNormal=Vector3.back;
                    for(int i=0;i<points.Length;i++){var p=mf.transform.TransformPoint(points[i]);var n=mf.transform.TransformDirection(normals[i]);if(n.z>-.12f)continue;float score=(p-desired).sqrMagnitude;if(score<best){best=score;hit=p;hitNormal=n.normalized;}}
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
