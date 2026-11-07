using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    // 11-07 1-1 바닥 잔해 층(스프라이트 시트, CTO 판정 SA 채택). 표현 전용: Core·보행·충돌 무변경.
    // 층(아래→위): 바닥 재질 → 이끼·젖은 흙 패치 데칼(1.2~2.2m, 알파 블렌드, +.3cm) → 접지 그림자(곱하기, +.6cm) → 잔가지·솔잎·잔뿌리·낙엽 카드(.5~1.2m, 알파 테스트, +1cm).
    // 아틀라스: Resources/Art/map/a2/cards/debris_*(우리 Blender 절차 메시 26종을 위에서 구움, 4열×8행 셀 512×256), patch_*(우리 바닥 텍스처에서 자른 2×2).
    // 밀도: 걷는 길 중앙 적게(약 .17장/m²), 가장자리·바깥 숲·늪 둘레 많게(1.5~1.8), 전투 공터는 더 비움, 6m 노이즈로 들쭉날쭉. 물·다리·쓰러진 고목 위는 비움.
    // 드로우콜: 26m 청크(4×4) × 재질 3. 각 청크는 한 메시(UInt16)로 합쳐 둔다.
    public sealed partial class NativeGame
    {
        internal static int A2DebrisCards, A2DebrisPatches, A2DebrisRenderers;
        // 카드 명도: 아틀라스 끝 회갈(.60,.50,.38)이 1-1 어두운 빛에서 흰 점으로 뜨지 않게 .6배. 밀도 배수 1.4(첫 시도 1.0은 거의 안 보였고 1.8은 잡음 지수 .03을 넘었다).
        const float CardBrightness=.6f,DebrisDensityScale=1.4f;
        const float DebrisMinX=-12,DebrisMaxX=92,DebrisMinZ=-92,DebrisMaxZ=12,DebrisChunk=26;
        // 셀 번호: 0~9 잔가지, 10~14 솔잎, 15~19 잔뿌리, 20~25 낙엽
        static int DebrisCell(System.Random r,bool walk)
        {
            double k=r.NextDouble();
            if(walk){if(k<.6)return r.Next(0,10);return r.Next(20,26);}   // 걷는 길에는 솔잎 무더기(잔점이 되기 쉬움)를 두지 않는다
            if(k<.35)return r.Next(0,10);if(k<.65)return r.Next(10,15);if(k<.80)return r.Next(15,20);return r.Next(20,26);
        }
        sealed class DebrisChunkMesh
        {
            public readonly List<Vector3> v=new List<Vector3>();public readonly List<Vector2> uv=new List<Vector2>();public readonly List<Vector3> n=new List<Vector3>();
            public readonly List<Vector4> t=new List<Vector4>();public readonly List<Color> c=new List<Color>();public readonly List<int> i=new List<int>();
        }
        void A2GroundDebris()
        {
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-a2-no-debris")>=0){Debug.Log("[A2 바닥 잔해] 검수용 끔");return;}
            var col=Resources.Load<Texture2D>("Art/map/a2/cards/debris_col");var nrm=Resources.Load<Texture2D>("Art/map/a2/cards/debris_nrm");var hgt=Resources.Load<Texture2D>("Art/map/a2/cards/debris_h");
            var pcol=Resources.Load<Texture2D>("Art/map/a2/cards/patch_col");var pnrm=Resources.Load<Texture2D>("Art/map/a2/cards/patch_nrm");
            var cardShader=Shader.Find("EXODUSER/A2GroundCard");var aoShader=Shader.Find("EXODUSER/A2GroundCardAO");
            if(col==null||nrm==null||hgt==null||pcol==null||pnrm==null||cardShader==null||aoShader==null){Debug.LogError("[A2 바닥 잔해] 자원 누락");return;}
            var timer=System.Diagnostics.Stopwatch.StartNew();
            var cardMat=R3Track(new Material(cardShader){name="A2 바닥 잔해 카드"});cardMat.SetTexture("_BaseMap",col);cardMat.SetTexture("_BumpMap",nrm);cardMat.SetTexture("_HeightMap",hgt);
            cardMat.SetFloat("_Clip",1);cardMat.SetFloat("_Src",(float)BlendMode.SrcAlpha);cardMat.SetFloat("_Dst",(float)BlendMode.OneMinusSrcAlpha);cardMat.SetFloat("_ZW",0);cardMat.renderQueue=2450;
            var patchMat=R3Track(new Material(cardShader){name="A2 바닥 패치 데칼"});patchMat.SetTexture("_BaseMap",pcol);patchMat.SetTexture("_BumpMap",pnrm);patchMat.SetTexture("_HeightMap",Texture2D.whiteTexture);
            patchMat.SetFloat("_Clip",0);patchMat.SetFloat("_Src",(float)BlendMode.SrcAlpha);patchMat.SetFloat("_Dst",(float)BlendMode.OneMinusSrcAlpha);patchMat.SetFloat("_ZW",0);patchMat.SetFloat("_Cavity",0);patchMat.SetFloat("_Smooth",.24f);patchMat.renderQueue=2420;
            var aoMat=R3Track(new Material(aoShader){name="A2 바닥 잔해 접지 그림자"});aoMat.SetTexture("_BaseMap",col);aoMat.SetFloat("_Strength",.55f);aoMat.renderQueue=2440;
            int nx=Mathf.CeilToInt((DebrisMaxX-DebrisMinX)/DebrisChunk),nz=Mathf.CeilToInt((DebrisMaxZ-DebrisMinZ)/DebrisChunk);
            var cards=new DebrisChunkMesh[nx*nz];var aos=new DebrisChunkMesh[nx*nz];var patches=new DebrisChunkMesh[nx*nz];
            for(int k=0;k<cards.Length;k++){cards[k]=new DebrisChunkMesh();aos[k]=new DebrisChunkMesh();patches[k]=new DebrisChunkMesh();}
            var rng=new System.Random(1107);int cardCount=0,patchCount=0;
            for(float z=DebrisMinZ;z<DebrisMaxZ;z+=1)for(float x=DebrisMinX;x<DebrisMaxX;x+=1)
            {
                float d=DebrisDensity(x+.5f,z+.5f,out bool walk);if(d<=0)continue;
                int count=(int)d+(rng.NextDouble()<d-(int)d?1:0);
                for(int q=0;q<count;q++)
                {
                    float px=x+(float)rng.NextDouble(),pz=z+(float)rng.NextDouble();if(!DebrisFree(px,pz))continue;
                    int cell=DebrisCell(rng,walk);float len=cell<10?Mathf.Lerp(.5f,1.2f,(float)rng.NextDouble()):cell<15?Mathf.Lerp(.6f,.9f,(float)rng.NextDouble()):cell<20?Mathf.Lerp(.6f,1.1f,(float)rng.NextDouble()):Mathf.Lerp(.5f,.8f,(float)rng.NextDouble());
                    float yaw=(float)(rng.NextDouble()*Math.PI*2);float tint=CardBrightness*Mathf.Lerp(.85f,1.08f,(float)rng.NextDouble());
                    var rect=new Rect((cell%4)*.25f,1-(cell/4+1)*.125f,.25f,.125f);int chunk=DebrisChunkIndex(px,pz,nx,nz);
                    // 청색 달빛 아래 회갈 카드가 푸른 뼛빛으로 뜨지 않게 따뜻한 곱(1,.9,.78)
                    DebrisQuad(cards[chunk],px,pz,len,len*.5f,yaw,.01f,rect,new Color(tint,tint*.9f,tint*.78f,1));
                    DebrisQuad(aos[chunk],px+.03f,pz-.03f,len*1.2f,len*.62f,yaw,.006f,rect,Color.white);cardCount++;
                }
                // 패치: 3m 격자 기준 확률(밀도 비례), 지형을 따르게 3×3 정점
                if(((int)(x-DebrisMinX))%3==0&&((int)(z-DebrisMinZ))%3==0&&rng.NextDouble()<Mathf.Clamp01(d*.22f))
                {
                    float px=x+1.5f,pz=z+1.5f;if(!DebrisFree(px,pz))continue;
                    int kind=walk?(rng.NextDouble()<.55?1:2):(rng.NextDouble()<.6?0:3);float size=Mathf.Lerp(1.2f,2.2f,(float)rng.NextDouble());
                    var rect=new Rect((kind%2)*.5f,kind<2?.5f:0f,.5f,.5f);
                    DebrisPatch(patches[DebrisChunkIndex(px,pz,nx,nz)],px,pz,size,size*Mathf.Lerp(.75f,1.25f,(float)rng.NextDouble()),(float)(rng.NextDouble()*Math.PI*2),rect);patchCount++;
                }
            }
            var root=new GameObject("A2 바닥 잔해 층");root.transform.SetParent(a2Root.transform,false);int renderers=0;
            for(int k=0;k<cards.Length;k++)
            {
                renderers+=DebrisRenderer(root,"패치 "+k,patches[k],patchMat);
                renderers+=DebrisRenderer(root,"접지 그림자 "+k,aos[k],aoMat);
                renderers+=DebrisRenderer(root,"잔해 카드 "+k,cards[k],cardMat);
            }
            A2DebrisCards=cardCount;A2DebrisPatches=patchCount;A2DebrisRenderers=renderers;
            Debug.Log("[A2 바닥 잔해] 카드 "+cardCount+" 패치 "+patchCount+" 렌더러(드로우콜) "+renderers+" 조립 "+timer.ElapsedMilliseconds+"ms");
        }
        static int DebrisChunkIndex(float x,float z,int nx,int nz){int cx=Mathf.Clamp((int)((x-DebrisMinX)/DebrisChunk),0,nx-1),cz=Mathf.Clamp((int)((z-DebrisMinZ)/DebrisChunk),0,nz-1);return cz*nx+cx;}
        float DebrisDensity(float x,float z,out bool walk)
        {
            walk=false;if(a2Field.Water(x,z))return 0;
            float d=a2Field.Distance(x,z);float wobble=Mathf.Lerp(.5f,1.3f,Mathf.PerlinNoise(x/6f+31.7f,z/6f+7.3f));
            if(d>=0)
            {
                walk=true;float center=Mathf.SmoothStep(0,1,Mathf.Clamp01((d-.5f)/4.5f));
                float clear=Mathf.Clamp01(a2Field.GroundCover(x,z));   // 전투 공터·다리 근처는 0에 가깝다
                return DebrisDensityScale*Mathf.Lerp(1.1f,.12f,center)*(.35f+.65f*clear)*wobble;
            }
            return DebrisDensityScale*Mathf.Lerp(1.3f,.7f,Mathf.Clamp01(-d/10f))*wobble;
        }
        // 물·다리·쓰러진 고목/뿌리 상판 위는 비운다(카드가 떠 보이지 않게).
        bool DebrisFree(float x,float z)
        {
            if(a2Field.Water(x,z))return false;
            if(Mathf.Abs(A2ForestLayout.Along(x,z))<5.5f&&Mathf.Abs(A2ForestLayout.Across(x,z))<2.5f)return false;
            return a2Field.Height(x,z)-a2Field.TerrainHeight(x,z)<.05f;
        }
        void DebrisQuad(DebrisChunkMesh m,float x,float z,float len,float wid,float yaw,float lift,Rect uv,Color color)
        {
            float c=Mathf.Cos(yaw),s=Mathf.Sin(yaw);var along=new Vector3(c,0,s);var across=new Vector3(-s,0,c);int b=m.v.Count;
            var corners=new[]{-along*len*.5f-across*wid*.5f,along*len*.5f-across*wid*.5f,along*len*.5f+across*wid*.5f,-along*len*.5f+across*wid*.5f};
            var uvs=new[]{new Vector2(uv.xMin,uv.yMin),new Vector2(uv.xMax,uv.yMin),new Vector2(uv.xMax,uv.yMax),new Vector2(uv.xMin,uv.yMax)};
            for(int k=0;k<4;k++){float px=x+corners[k].x,pz=z+corners[k].z;m.v.Add(new Vector3(px,a2Field.Height(px,pz)+lift,pz));m.uv.Add(uvs[k]);m.n.Add(Vector3.up);m.t.Add(new Vector4(c,0,s,1));m.c.Add(color);}
            m.i.Add(b);m.i.Add(b+3);m.i.Add(b+2);m.i.Add(b);m.i.Add(b+2);m.i.Add(b+1);
        }
        void DebrisPatch(DebrisChunkMesh m,float x,float z,float sx,float sz,float yaw,Rect uv)
        {
            float c=Mathf.Cos(yaw),s=Mathf.Sin(yaw);int b=m.v.Count;
            for(int j=0;j<3;j++)for(int k=0;k<3;k++)
            {
                float u=k/2f,v=j/2f,lx=(u-.5f)*sx,lz=(v-.5f)*sz,px=x+lx*c-lz*s,pz=z+lx*s+lz*c;
                m.v.Add(new Vector3(px,a2Field.Height(px,pz)+.003f,pz));m.uv.Add(new Vector2(uv.xMin+u*uv.width,uv.yMin+v*uv.height));m.n.Add(Vector3.up);m.t.Add(new Vector4(c,0,s,1));m.c.Add(Color.white);
            }
            for(int j=0;j<2;j++)for(int k=0;k<2;k++){int a=b+j*3+k;m.i.Add(a);m.i.Add(a+3);m.i.Add(a+4);m.i.Add(a);m.i.Add(a+4);m.i.Add(a+1);}
        }
        int DebrisRenderer(GameObject root,string name,DebrisChunkMesh m,Material mat)
        {
            if(m.v.Count==0)return 0;
            var mesh=R3Track(new Mesh{name=name,indexFormat=m.v.Count>65000?IndexFormat.UInt32:IndexFormat.UInt16});
            mesh.SetVertices(m.v);mesh.SetUVs(0,m.uv);mesh.SetNormals(m.n);mesh.SetTangents(m.t);mesh.SetColors(m.c);mesh.SetTriangles(m.i,0);mesh.RecalculateBounds();mesh.UploadMeshData(true);
            var go=new GameObject(name);go.transform.SetParent(root.transform,false);go.AddComponent<MeshFilter>().sharedMesh=mesh;
            var r=go.AddComponent<MeshRenderer>();r.sharedMaterial=mat;r.shadowCastingMode=ShadowCastingMode.Off;r.receiveShadows=true;r.lightProbeUsage=LightProbeUsage.Off;r.reflectionProbeUsage=ReflectionProbeUsage.Off;
            return 1;
        }
    }
}
