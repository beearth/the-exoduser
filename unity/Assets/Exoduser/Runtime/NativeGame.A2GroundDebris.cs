using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    // 11-07 1-1 바닥 잔해 층(스프라이트 시트). 표현 전용: Core·보행·충돌 무변경.
    // 고밀도판(PoE2 숲 타일 셀 실측 기준, study/poe2/recipe/tgm_density.txt): 길 중앙은 거의 비우고(100m²당 ~5), 길 가장자리·바깥 덤불 지대는 m²당 30~60조각.
    // 크기 3종: 큰 패치 1.2~2.2m(알파 블렌드) / 중간 카드 .3~.8m(잔가지·잔뿌리·낙엽 무리, 접지 그림자 있음) / 작은 조각 .1~.2m(낙엽·솔잎, 저대비 — 1x에서 점이 되지 않게 바닥 색 쪽으로).
    // 층(아래→위): 패치(+.3cm) → 접지 그림자(+.6cm, 곱하기) → 카드(+1cm, fwidth 선명화 알파 블렌드).
    // 13m 청크마다 한 메시(정적으로 합침) + LOD 2단(가까이 전체, 멀리 작은 조각 뺌). 아틀라스는 우리 Blender 절차 메시(debris_*), 패치는 우리 바닥에서 자름(patch_*).
    public sealed partial class NativeGame
    {
        internal static int A2DebrisCards, A2DebrisSmall, A2DebrisPatches, A2DebrisRenderers;internal static GameObject A2DebrisRoot;
        const float DebrisMinX=-12,DebrisMaxX=92,DebrisMinZ=-92,DebrisMaxZ=12,DebrisChunkSize=13;
        // CTO RETOUCH: 잔해가 바닥보다 어두우면 "더러운 바닥"으로 읽힌다 → 중간 카드는 바닥 평균의 약 1.2배(.65), 작은 조각은 바닥 ±15%(.72)
        const float CardBrightness=.42f,SmallBrightness=.55f,SmallAlpha=.6f;   // 11-08 ≤.05: 잔가지가 바닥보다 밝은 회색 선으로 떠서 .5→.42   // .65/.72는 노멀을 누른 뒤 흰 뼛조각처럼 떴다
        // 셀 번호: 0~9 잔가지, 10~14 솔잎 무더기, 15~19 잔뿌리, 20~25 낙엽
        static bool DebrisSet3;static int DebrisCols=4,DebrisRows=8;
        // debris3 셀: 0~9 잔가지 · 10~19 뿌리 · 20~35 썩은 잎 · 36~51 죽은 이끼 · 52~57 뼈 · 58~62 버섯 · 63~67 녹슨 쇠. 썩은 잎·죽은 이끼·잔가지가 주력
        static int DebrisMediumCell(System.Random r,bool walk)
        {
            double k=r.NextDouble();
            if(DebrisSet3){if(walk)return k<.4?r.Next(0,10):k<.75?r.Next(20,36):r.Next(36,52);return k<.25?r.Next(0,10):k<.45?r.Next(10,20):k<.75?r.Next(20,36):r.Next(36,52);}
            if(walk)return k<.6?r.Next(0,10):r.Next(20,26);return k<.45?r.Next(0,10):k<.65?r.Next(15,20):r.Next(20,26);
        }
        static int DebrisSmallCell(System.Random r){if(DebrisSet3)return r.NextDouble()<.55?r.Next(20,36):r.Next(36,52);return r.NextDouble()<.6?r.Next(20,26):r.Next(10,15);}
        sealed class DebrisChunkMesh
        {
            public readonly List<Vector3> v=new List<Vector3>();public readonly List<Vector2> uv=new List<Vector2>();
            public readonly List<Vector4> t=new List<Vector4>();public readonly List<Color32> c=new List<Color32>();public readonly List<int> i=new List<int>();
        }
        sealed class DebrisChunk { public readonly DebrisChunkMesh patch=new DebrisChunkMesh(),ao=new DebrisChunkMesh(),medium=new DebrisChunkMesh(),small=new DebrisChunkMesh(); }
        // m²당 개수: (중간, 작은, 패치)
        Vector3 DebrisDensity(float x,float z,out bool walk)
        {
            walk=false;if(a2Field.Water(x,z))return Vector3.zero;
            float d=a2Field.Distance(x,z);float wobble=Mathf.Lerp(.55f,1.35f,Mathf.PerlinNoise(x/6f+31.7f,z/6f+7.3f));
            if(d>=0)
            {
                walk=true;float edge=1-Mathf.SmoothStep(0,1,Mathf.Clamp01(d/3f));       // 경계에서 3m 안쪽까지 가장자리 띠
                float clear=.3f+.7f*Mathf.Clamp01(a2Field.GroundCover(x,z));
                return new Vector3(Mathf.Lerp(.01f,3f,edge),Mathf.Lerp(.03f,10f,edge),Mathf.Lerp(0,.25f,edge))*clear*wobble;
            }
            float away=-d;
            if(away<6)return new Vector3(3.5f,20,.5f)*wobble;   // 11-08 잡음 기준 ≤.05(CTO 정정): 05·10 초과분을 바깥 6m 띠에서 덜어냄                              // 늪 둘레·외곽 띠
            if(away<15)return new Vector3(4,14,.35f)*wobble;
            return new Vector3(2,4,.15f)*wobble;                                         // 화면에 거의 안 들어오는 먼 바깥
        }
        void A2GroundDebris()
        {
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-a2-no-debris")>=0){Debug.Log("[A2 바닥 잔해] 검수용 끔");return;}
            // 11-08 CTO 지급 생성 아틀라스 시험(잔가지·뿌리 그대로, 낙엽은 썩은 회갈로, 이끼·자갈 제외): --unity-a2-debris2 로 바꿔 전후 비교
            // 11-08 기본 = debris3(CTO 합격: 1차 생성 잔가지·뿌리 + 2차 썩은 잎·죽은 이끼·뼈/버섯/녹슨 쇠, 8열×16행). 비교용 --unity-a2-debris-old(우리 Blender 절차 아틀라스), --unity-a2-debris2(1차 생성만)
            var argv=Environment.GetCommandLineArgs();string set=Array.IndexOf(argv,"--unity-a2-debris-old")>=0?"debris":Array.IndexOf(argv,"--unity-a2-debris2")>=0?"debris2":"debris3";
            DebrisSet3=set=="debris3";DebrisCols=DebrisSet3?8:4;DebrisRows=DebrisSet3?16:8;
            var col=Resources.Load<Texture2D>("Art/map/a2/cards/"+set+"_col");var nrm=Resources.Load<Texture2D>("Art/map/a2/cards/"+set+"_nrm");var hgt=Resources.Load<Texture2D>("Art/map/a2/cards/"+set+"_h");
            var pcol=Resources.Load<Texture2D>("Art/map/a2/cards/patch_col");var pnrm=Resources.Load<Texture2D>("Art/map/a2/cards/patch_nrm");
            var cardShader=Shader.Find("EXODUSER/A2GroundCard");var aoShader=Shader.Find("EXODUSER/A2GroundCardAO");
            if(col==null||nrm==null||hgt==null||pcol==null||pnrm==null||cardShader==null||aoShader==null){Debug.LogError("[A2 바닥 잔해] 자원 누락");return;}
            var timer=System.Diagnostics.Stopwatch.StartNew();
            var cardMat=R3Track(new Material(cardShader){name="A2 바닥 잔해 카드"});cardMat.SetTexture("_BaseMap",col);cardMat.SetTexture("_BumpMap",nrm);cardMat.SetTexture("_HeightMap",hgt);cardMat.SetFloat("_Cavity",.08f);cardMat.SetFloat("_NormalScale",.4f);
            cardMat.SetFloat("_Clip",1);cardMat.SetFloat("_Src",(float)BlendMode.SrcAlpha);cardMat.SetFloat("_Dst",(float)BlendMode.OneMinusSrcAlpha);cardMat.SetFloat("_ZW",0);cardMat.renderQueue=2450;
            var patchMat=R3Track(new Material(cardShader){name="A2 바닥 패치 데칼"});patchMat.SetTexture("_BaseMap",pcol);patchMat.SetTexture("_BumpMap",pnrm);patchMat.SetTexture("_HeightMap",Texture2D.whiteTexture);
            patchMat.SetFloat("_Clip",0);patchMat.SetFloat("_Src",(float)BlendMode.SrcAlpha);patchMat.SetFloat("_Dst",(float)BlendMode.OneMinusSrcAlpha);patchMat.SetFloat("_ZW",0);patchMat.SetFloat("_Cavity",0);patchMat.SetFloat("_Alpha",.85f);patchMat.SetFloat("_Smooth",.24f);patchMat.renderQueue=2420;
            var aoMat=R3Track(new Material(aoShader){name="A2 바닥 잔해 접지 그림자"});aoMat.SetTexture("_BaseMap",col);aoMat.SetFloat("_Strength",.25f);aoMat.renderQueue=2440;
            int nx=Mathf.CeilToInt((DebrisMaxX-DebrisMinX)/DebrisChunkSize),nz=Mathf.CeilToInt((DebrisMaxZ-DebrisMinZ)/DebrisChunkSize);
            var chunks=new DebrisChunk[nx*nz];for(int k=0;k<chunks.Length;k++)chunks[k]=new DebrisChunk();
            var rng=new System.Random(1107);int medium=0,small=0,patches=0;
            for(float z=DebrisMinZ;z<DebrisMaxZ;z+=1)for(float x=DebrisMinX;x<DebrisMaxX;x+=1)
            {
                var d=DebrisDensity(x+.5f,z+.5f,out bool walk);if(d.x+d.y+d.z<=0)continue;
                int nm=Poissonish(rng,d.x),ns=Poissonish(rng,d.y),np=Poissonish(rng,d.z);
                for(int q=0;q<nm;q++)
                {
                    float px=x+(float)rng.NextDouble(),pz=z+(float)rng.NextDouble();if(!DebrisFree(px,pz))continue;
                    int cell=DebrisMediumCell(rng,walk);float len=Mathf.Lerp(.45f,.9f,(float)rng.NextDouble());if(DebrisSet3?cell<20:(cell<10||(cell>=15&&cell<20)))len*=1.4f;   // 잔가지·잔뿌리 카드는 2:1이라 길게
                    float yaw=(float)(rng.NextDouble()*Math.PI*2),tint=CardBrightness*Mathf.Lerp(.85f,1.08f,(float)rng.NextDouble());var rect=DebrisRect(cell);var ch=chunks[DebrisChunkIndex(px,pz,nx,nz)];
                    DebrisQuad(ch.medium,px,pz,len,len*.5f,yaw,.01f,rect,new Color(tint,tint*.9f,tint*.78f,1),true);
                    DebrisQuad(ch.ao,px+.02f,pz-.02f,len*1.15f,len*.58f,yaw,.006f,rect,Color.white,true);medium++;
                }
                for(int q=0;q<ns;q++)
                {
                    float px=x+(float)rng.NextDouble(),pz=z+(float)rng.NextDouble();if(!DebrisFree(px,pz))continue;
                    int cell=DebrisSmallCell(rng);float len=Mathf.Lerp(.3f,.45f,(float)rng.NextDouble());   // 카드 .3~.45m = 조각 하나 .15~.22m(.1m 조각은 1x에서 점이 됐다)
                    float yaw=(float)(rng.NextDouble()*Math.PI*2),tint=SmallBrightness*Mathf.Lerp(.9f,1.05f,(float)rng.NextDouble());
                    DebrisQuad(chunks[DebrisChunkIndex(px,pz,nx,nz)].small,px,pz,len,len*.5f,yaw,.008f,DebrisRect(cell),new Color(tint,tint*.88f,tint*.74f,SmallAlpha),false);small++;
                }
                for(int q=0;q<np;q++)
                {
                    float px=x+(float)rng.NextDouble(),pz=z+(float)rng.NextDouble();if(!DebrisFree(px,pz))continue;
                    int kind=walk?(rng.NextDouble()<.55?1:2):(rng.NextDouble()<.6?0:3);float size=Mathf.Lerp(1.2f,2.2f,(float)rng.NextDouble());
                    DebrisPatch(chunks[DebrisChunkIndex(px,pz,nx,nz)].patch,px,pz,size,size*Mathf.Lerp(.75f,1.25f,(float)rng.NextDouble()),(float)(rng.NextDouble()*Math.PI*2),new Rect((kind%2)*.5f,kind<2?.5f:0f,.5f,.5f));patches++;
                }
            }
            if(DebrisSet3)DebrisStoryAndFungus(chunks,nx,nz,rng,ref medium);
            var root=new GameObject("A2 바닥 잔해 층");root.transform.SetParent(a2Root.transform,false);A2DebrisRoot=root;int renderers=0;
            for(int k=0;k<chunks.Length;k++)
            {
                var ch=chunks[k];if(ch.medium.v.Count+ch.small.v.Count+ch.patch.v.Count==0)continue;
                var holder=new GameObject("잔해 청크 "+k);holder.transform.SetParent(root.transform,false);
                var near=new List<Renderer>();var far=new List<Renderer>();
                var p=DebrisRenderer(holder,"패치",ch.patch,patchMat);if(p!=null){near.Add(p);far.Add(p);}
                var a=DebrisRenderer(holder,"접지 그림자",ch.ao,aoMat);if(a!=null){near.Add(a);far.Add(a);}
                // LOD0 = 중간+작은 한 메시, LOD1 = 중간만(작은 조각은 먼 곳에서 1px 남짓이라 뺀다)
                var all=new DebrisChunkMesh();DebrisAppend(all,ch.medium);DebrisAppend(all,ch.small);
                var l0=DebrisRenderer(holder,"카드 LOD0",all,cardMat);if(l0!=null)near.Add(l0);
                var l1=DebrisRenderer(holder,"카드 LOD1",ch.medium,cardMat);if(l1!=null)far.Add(l1);
                var group=holder.AddComponent<LODGroup>();group.SetLODs(new[]{new LOD(.30f,near.ToArray()),new LOD(.015f,far.ToArray())});group.RecalculateBounds();
                renderers+=near.Count+(l1!=null?1:0);
            }
            A2DebrisCards=medium;A2DebrisSmall=small;A2DebrisPatches=patches;A2DebrisRenderers=renderers;
            Debug.Log("[A2 바닥 잔해] 중간 "+medium+" 작은 "+small+" 패치 "+patches+" 청크 렌더러 "+renderers+" 조립 "+timer.ElapsedMilliseconds+"ms");
        }
        // 뼈·녹슨 쇠: 길가(걷는 면 경계 안쪽 .5~3m)에 드물게(필드 80m당 12개 = 화면당 1~2) 이야기 포인트로. 버섯: 고목 밑동에만 무리(고목 60%에 3~6장).
        void DebrisStoryAndFungus(DebrisChunk[] chunks,int nx,int nz,System.Random rng,ref int medium)
        {
            int story=0,fungus=0,want=Mathf.RoundToInt(12*(DebrisMaxX-DebrisMinX-24)/80f);
            for(int tries=0;story<want&&tries<4000;tries++)
            {
                float x=DebrisMinX+12+(float)rng.NextDouble()*(DebrisMaxX-DebrisMinX-24),z=DebrisMinZ+12+(float)rng.NextDouble()*(DebrisMaxZ-DebrisMinZ-24);
                float d=a2Field.Distance(x,z);if(d<.5f||d>3f||!DebrisFree(x,z))continue;
                int cell=rng.NextDouble()<.7?rng.Next(52,58):rng.Next(63,68);float len=Mathf.Lerp(.7f,1.1f,(float)rng.NextDouble()),yaw=(float)(rng.NextDouble()*Math.PI*2),t=CardBrightness*1.1f;
                var ch=chunks[DebrisChunkIndex(x,z,nx,nz)];DebrisQuad(ch.medium,x,z,len,len*.5f,yaw,.012f,DebrisRect(cell),new Color(t,t*.95f,t*.88f,1),true);DebrisQuad(ch.ao,x+.02f,z-.02f,len*1.15f,len*.58f,yaw,.006f,DebrisRect(cell),Color.white,true);story++;medium++;
            }
            foreach(Transform tree in a2Root.transform)
            {
                if(tree.name!="A2_Hollow_Loft_Tree"&&tree.name!="A2_Ancient_Rotten_Tree"&&tree.name!="A2 전경 바깥 거목")continue;
                if(rng.NextDouble()>.6)continue;
                var rs=tree.GetComponentsInChildren<MeshRenderer>();if(rs.Length==0)continue;var b=rs[0].bounds;foreach(var r in rs)b.Encapsulate(r.bounds);
                float rad=Mathf.Clamp(Mathf.Min(b.extents.x,b.extents.z)*.55f,.6f,3f);float baseAng=(float)(rng.NextDouble()*Math.PI*2);int n=rng.Next(3,7);
                for(int k=0;k<n;k++)
                {
                    float a=baseAng+(float)(rng.NextDouble()-.5)*1.4f,dist=rad*Mathf.Lerp(.85f,1.15f,(float)rng.NextDouble());float x=tree.position.x+Mathf.Cos(a)*dist,z=tree.position.z+Mathf.Sin(a)*dist;
                    if(a2Field.Water(x,z))continue;float len=Mathf.Lerp(.35f,.6f,(float)rng.NextDouble());float t=CardBrightness*Mathf.Lerp(.95f,1.1f,(float)rng.NextDouble());
                    DebrisQuad(chunks[DebrisChunkIndex(x,z,nx,nz)].medium,x,z,len,len*.5f,(float)(rng.NextDouble()*Math.PI*2),.012f,DebrisRect(rng.Next(58,63)),new Color(t,t*.97f,t*.93f,1),true);fungus++;medium++;
                }
            }
            Debug.Log("[A2 바닥 잔해] 이야기 포인트(뼈·녹슨 쇠) "+story+" 고목 밑 버섯 "+fungus);
        }
        static int Poissonish(System.Random r,float mean){int n=(int)mean;return n+(r.NextDouble()<mean-n?1:0);}
        static Rect DebrisRect(int cell){float w=1f/DebrisCols,h=1f/DebrisRows;return new Rect((cell%DebrisCols)*w,1-(cell/DebrisCols+1)*h,w,h);}
        static int DebrisChunkIndex(float x,float z,int nx,int nz){int cx=Mathf.Clamp((int)((x-DebrisMinX)/DebrisChunkSize),0,nx-1),cz=Mathf.Clamp((int)((z-DebrisMinZ)/DebrisChunkSize),0,nz-1);return cz*nx+cx;}
        // 물·다리·쓰러진 고목/뿌리 상판 위는 비운다(카드가 떠 보이지 않게).
        bool DebrisFree(float x,float z)
        {
            if(a2Field.Water(x,z))return false;
            if(Mathf.Abs(A2ForestLayout.Along(x,z))<5.5f&&Mathf.Abs(A2ForestLayout.Across(x,z))<2.5f)return false;
            return a2Field.Height(x,z)-a2Field.TerrainHeight(x,z)<.05f;
        }
        // perVertex=false면 중심 높이 하나(작은 조각: 정점마다 지형 질의를 하지 않아 조립 비용을 줄인다)
        void DebrisQuad(DebrisChunkMesh m,float x,float z,float len,float wid,float yaw,float lift,Rect uv,Color color,bool perVertex)
        {
            float c=Mathf.Cos(yaw),s=Mathf.Sin(yaw);float ax=c*len*.5f,az=s*len*.5f,bx=-s*wid*.5f,bz=c*wid*.5f;int b=m.v.Count;
            float cy=perVertex?0:a2Field.Height(x,z)+lift;var col=(Color32)color;var tan=new Vector4(c,0,s,1);
            for(int k=0;k<4;k++)
            {
                float sa=k==0||k==3?-1:1,sb=k<2?-1:1;float px=x+ax*sa+bx*sb,pz=z+az*sa+bz*sb;
                m.v.Add(new Vector3(px,perVertex?a2Field.Height(px,pz)+lift:cy,pz));m.uv.Add(new Vector2(sa<0?uv.xMin:uv.xMax,sb<0?uv.yMin:uv.yMax));m.t.Add(tan);m.c.Add(col);
            }
            m.i.Add(b);m.i.Add(b+3);m.i.Add(b+2);m.i.Add(b);m.i.Add(b+2);m.i.Add(b+1);
        }
        void DebrisPatch(DebrisChunkMesh m,float x,float z,float sx,float sz,float yaw,Rect uv)
        {
            float c=Mathf.Cos(yaw),s=Mathf.Sin(yaw);int b=m.v.Count;var tan=new Vector4(c,0,s,1);
            for(int j=0;j<3;j++)for(int k=0;k<3;k++)
            {
                float u=k/2f,v=j/2f,lx=(u-.5f)*sx,lz=(v-.5f)*sz,px=x+lx*c-lz*s,pz=z+lx*s+lz*c;
                m.v.Add(new Vector3(px,a2Field.Height(px,pz)+.003f,pz));m.uv.Add(new Vector2(uv.xMin+u*uv.width,uv.yMin+v*uv.height));m.t.Add(tan);m.c.Add(new Color32(255,255,255,255));
            }
            for(int j=0;j<2;j++)for(int k=0;k<2;k++){int a=b+j*3+k;m.i.Add(a);m.i.Add(a+3);m.i.Add(a+4);m.i.Add(a);m.i.Add(a+4);m.i.Add(a+1);}
        }
        static void DebrisAppend(DebrisChunkMesh to,DebrisChunkMesh from){int b=to.v.Count;to.v.AddRange(from.v);to.uv.AddRange(from.uv);to.t.AddRange(from.t);to.c.AddRange(from.c);foreach(var i in from.i)to.i.Add(b+i);}
        Renderer DebrisRenderer(GameObject root,string name,DebrisChunkMesh m,Material mat)
        {
            if(m.v.Count==0)return null;
            // 노멀은 셰이더가 위(0,1,0)로 쓴다. 정점 = 위치·UV·탄젠트·색(Color32).
            var mesh=R3Track(new Mesh{name=name,indexFormat=m.v.Count>65000?IndexFormat.UInt32:IndexFormat.UInt16});
            mesh.SetVertices(m.v);mesh.SetUVs(0,m.uv);mesh.SetTangents(m.t);mesh.SetColors(m.c);mesh.SetTriangles(m.i,0);mesh.RecalculateBounds();mesh.UploadMeshData(true);
            var go=new GameObject(name);go.transform.SetParent(root.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;
            var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=mat;r.shadowCastingMode=ShadowCastingMode.Off;r.receiveShadows=true;r.lightProbeUsage=LightProbeUsage.Off;r.reflectionProbeUsage=ReflectionProbeUsage.Off;
            return r;
        }
        internal static void A2DebrisVisibleStats(out int renderers,out long triangles)
        {
            renderers=0;triangles=0;if(A2DebrisRoot==null)return;
            foreach(var r in A2DebrisRoot.GetComponentsInChildren<MeshRenderer>())if(r.isVisible&&r.enabled){renderers++;var f=r.GetComponent<MeshFilter>();if(f!=null&&f.sharedMesh!=null)triangles+=f.sharedMesh.GetIndexCount(0)/3;}
        }
    }
}
