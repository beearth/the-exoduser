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
                    light.intensity=1.9f;light.color=new Color(.85f,.90f,1);light.shadows=LightShadows.Soft;
                    light.shadowStrength=.70f;light.shadowBias=.035f;light.shadowNormalBias=.12f;light.transform.rotation=Quaternion.Euler(49,-32,0);
                }
                else if(light.name.StartsWith("Pool_",StringComparison.Ordinal))light.enabled=false;
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
            A2FieldOuterMass();A2FieldLandmarks();A2FieldConnections();A2FieldGround();A2FieldGroundCover();A2FieldAtmosphere();
            var aa=r3Cam.GetUniversalAdditionalCameraData();aa.antialiasing=AntialiasingMode.SubpixelMorphologicalAntiAliasing;aa.antialiasingQuality=AntialiasingQuality.High;
            aa.requiresDepthTexture=true;r3Cam.depthTextureMode|=DepthTextureMode.Depth;
            r3Cam.backgroundColor=new Color(.105f,.145f,.17f);r3Cam.farClipPlane=220;
            A2Ambient();Debug.Log("[A2 전체필드] 원본40000타일 보행·시야 불변/全域地面·외곽·접합 조립 "+timer.ElapsedMilliseconds+"ms");
        }
        void A2FieldGround()
        {
            // 32:9의 수평 시야와 최북단까지 이어지는 하나의 표면. 청크마다 다른 베이스를 쓰지 않는다.
            const int n=681;const float minX=-45,minZ=-125,step=.25f;
            var vertices=new Vector3[n*n];var uv=new Vector2[vertices.Length];var triangles=new int[(n-1)*(n-1)*6];int k=0;
            for(int y=0;y<n;y++)for(int x=0;x<n;x++)
            {
                float wx=minX+x*step,wz=minZ+y*step;int i=y*n+x;
                vertices[i]=new Vector3(wx,a2Field.TerrainHeight(wx,wz),wz);uv[i]=new Vector2(wx/80,-wz/80);
                if(x==n-1||y==n-1)continue;
                triangles[k++]=i;triangles[k++]=i+n;triangles[k++]=i+1;triangles[k++]=i+1;triangles[k++]=i+n;triangles[k++]=i+n+1;
            }
            var mesh=new Mesh{name="1-1 전체 젖은 흙·침식 둑",indexFormat=IndexFormat.UInt32};mesh.vertices=vertices;mesh.uv=uv;mesh.triangles=triangles;mesh.RecalculateNormals();mesh.RecalculateTangents();mesh.RecalculateBounds();
            var go=new GameObject("A2 전체 필드 지면");go.transform.SetParent(a2Root.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;
            var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=a2FieldSoil;r.receiveShadows=true;
            a2Water=new Material(Shader.Find("EXODUSER/A2ToxicRiver"));A2ShoreField();
            var waterMesh=new Mesh{name="숲 외곽 독액 수면"};waterMesh.vertices=new[]{new Vector3(-45,-.45f,-125),new Vector3(125,-.45f,-125),new Vector3(-45,-.45f,45),new Vector3(125,-.45f,45)};
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
                    var tree=A2Module(layer==0&&(row%3!=1)?"Hollow_Loft_Tree":"Ancient_Rotten_Tree",x,zz,layer==0?.48f:scale,1.2f+layer*.16f+.2f*Mathf.Sin(row*.9f),layer==0?.48f:scale,row*137+layer*71+side*23);
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
            for(int row=0;row<15;row++)for(int col=0;col<18;col++)
            {
                float x=-34+col*8.5f+2.4f*Mathf.Sin(row*.9f+col*1.7f),z=-110+row*10.3f;
                float d=a2Field.Distance(x,z);if(d>-10||d< -34)continue;
                float s=.5f+.22f*Mathf.Sin(col*3.4f+row*2.1f);
                A2Module("Ancient_Rotten_Tree",x,z,s,1.2f+.55f*Mathf.Sin(row*.7f+col*.8f),s,row*127+col*83);
            }
        }
        void A2FieldLandmarks()
        {
            // 原본 충돌 타원에만 밑동을 둔다. 반경 작은 나무는 가는 고사목/그루터기로 번역한다.
            int index=0;
            foreach(var c in Map.Data.colliders)
            {
                float x=c.x/100,z=-c.y/100,r=Mathf.Min(c.rx,c.ry)/100;
                if(r<.45f)continue;
                var tree=r>=1.2f?A2Module("Hollow_Loft_Tree",x,z,.38f*r,1.1f,.38f*r,index*97):A2Module("Scanned_Stump",x,z,.6f*r,.6f*r,.6f*r,index*97);
                if(tree!=null)A2FieldDressTree(tree,index);
                A2FieldRoots(x,z,Mathf.Clamp(r*1.5f,1.6f,3.1f),index*97);index++;
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
                    if(log!=null){log.name="A2 전투구역 쓰러진 목질 "+region+"/"+side;A2FieldRegister(log);}
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
                foreach(var key in new[]{"_BaseMap","_BumpMap","_RockMap","_AshMap","_RockNormal","_RockRough","_ForestMap","_ForestNormal","_ForestRough","_SoilMap","_SoilNormal","_SoilRough","_RootMap","_RootNormal","_RootRough","_FieldSdf","_FieldMoss","_FieldMossNormal","_FieldMossRough"})
                    if(a2FieldRootMaterial.HasProperty(key))a2FieldRootMaterial.SetTexture(key,a2FieldSoil.GetTexture(key));
                foreach(var key in new[]{"_ForestBlend","_ForestTextureMix","_SoilTextureMix","_FullField"})if(a2FieldRootMaterial.HasProperty(key))a2FieldRootMaterial.SetFloat(key,a2FieldSoil.GetFloat(key));
                a2FieldRootMaterial.SetColor("_ScanColor",new Color(.9f,.8f,.63f,1));
            }
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
        void A2FieldRegister(GameObject go)
        {
            foreach(var mf in go.GetComponentsInChildren<MeshFilter>())
            {
                var mesh=mf.sharedMesh;if(!mesh.isReadable){Debug.LogError("[A2 필드] 접지 표면 읽기 누락 "+go.name);continue;}
                var vertices=mesh.vertices;var xyz=new float[vertices.Length*3];
                for(int i=0;i<vertices.Length;i++){var p=mf.transform.TransformPoint(vertices[i]);xyz[i*3]=p.x;xyz[i*3+1]=p.y;xyz[i*3+2]=p.z;}
                a2Field.RegisterSurface(xyz,mesh.triangles);
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
                    var desired=tree.transform.position+new Vector3((j-1)*.45f,1.5f+j*.8f,-.8f);float best=float.MaxValue;var hit=Vector3.zero;
                    for(int i=0;i<points.Length;i++){var p=mf.transform.TransformPoint(points[i]);var n=mf.transform.TransformDirection(normals[i]);if(n.z>-.12f)continue;float score=(p-desired).sqrMagnitude;if(score<best){best=score;hit=p;}}
                    if(best>9)continue;
                    var moss=A2Module("Hanging_Moss",hit.x,hit.z,.4f,.55f,.4f,variation*37+j*67);if(moss==null)continue;
                    var rs=moss.GetComponentsInChildren<Renderer>();var bounds=rs[0].bounds;foreach(var r in rs)bounds.Encapsulate(r.bounds);
                    moss.transform.position+=hit-new Vector3(bounds.center.x,bounds.max.y,bounds.center.z);moss.name="A2 수피 표면에 붙은 이끼";
                    if(j==0)A2Module("Fungal_Colony",hit.x,hit.z,.6f,.55f,.6f,variation*71,.3f);
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
            foreach(var p in new[]{new Vector2(39,-70),new Vector2(26,-60),new Vector2(60,-58),new Vector2(21,-40),new Vector2(43,-34),new Vector2(64,-39),new Vector2(30,-18),new Vector2(53,-16),new Vector2(40,-6)})
            {
                var bottom=new Vector3(p.x,a2Field.Height(p.x,p.y),p.y);var top=bottom+new Vector3(-5,13,5);
                var side=Vector3.right;var mesh=new Mesh{name="수관 사이 달빛"};mesh.vertices=new[]{top-side*.3f,top+side*.3f,bottom-side*1.5f,bottom+side*1.5f};mesh.uv=new[]{Vector2.zero,Vector2.right,Vector2.up,Vector2.one};mesh.triangles=new[]{0,2,1,1,2,3};mesh.RecalculateBounds();
                var go=new GameObject("A2 필드 국소 빛기둥");go.transform.SetParent(a2Root.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;
                var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=new Material(shader);r.sharedMaterial.SetColor("_Color",new Color(1.1f,1.4f,1.65f,.035f));r.shadowCastingMode=ShadowCastingMode.Off;
            }
        }
    }
}
