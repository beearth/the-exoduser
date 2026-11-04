using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // D3: switch for the whole D3 pass. --a2r-d3-off restores the D2 (09256251d) look for the before|after proof.
    public static class A2RD3
    {
        public static readonly bool On=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-d3-off")<0;
    }

    // D3: the field Terrain draws the real floor: cropped web chunk colour (macro) + tiled skin/bruise/vein wrinkle layers.
    // Presentation only. Walk rules (Core) are untouched; the moat stays a Terrain hole so the existing water and banks keep drawing.
    public static class A2RTerrainSkin
    {
        const int MacroSize=2048;
        static Texture2D Load(string name,bool linear)
        {
            var asset=Resources.Load<TextAsset>("A2R/Terrain/"+name);if(asset==null)return null;
            var t=new Texture2D(2,2,TextureFormat.RGBA32,true,linear);if(!t.LoadImage(asset.bytes,false))return null;
            t.name=name;t.wrapMode=TextureWrapMode.Repeat;t.filterMode=FilterMode.Trilinear;t.anisoLevel=8;return t;
        }
        // Source mask: R roughness, G AO. Unity mask map: R metallic, G AO, B height, A smoothness.
        static Texture2D RepackMask(Texture2D src)
        {
            if(src==null)return null;var p=src.GetPixels32();for(int i=0;i<p.Length;i++){var c=p[i];p[i]=new Color32(0,c.g,128,(byte)(255-c.r));}
            var t=new Texture2D(src.width,src.height,TextureFormat.RGBA32,true,true){name=src.name+" unity mask",wrapMode=TextureWrapMode.Repeat,filterMode=FilterMode.Trilinear,anisoLevel=8};t.SetPixels32(p);t.Apply(true,false);UnityEngine.Object.Destroy(src);return t;
        }
        static TerrainLayer Layer(string name,Texture2D albedo,Texture2D normal,Texture2D mask,Vector2 tile,float normalScale)
        {
            var l=new TerrainLayer{name=name,diffuseTexture=albedo,normalMapTexture=normal,maskMapTexture=mask,tileSize=tile,tileOffset=Vector2.zero,normalScale=normalScale,smoothness=.25f,metallic=0};return l;
        }
        // Distance (m) to the nearest blocked cell on a coarse grid; lane centre = far from every blocker.
        static float[] Dist(float x0,float z0,float w,float h,Func<float,float,bool> open,out int n)
        {
            n=136;float cell=w/n;var d=new float[n*n];const float far=99;
            for(int j=0;j<n;j++)for(int i=0;i<n;i++)d[j*n+i]=(open!=null&&open(x0+(i+.5f)*cell,z0+(j+.5f)*cell))?far:0;
            const float a=1,b=1.4142f;
            for(int j=0;j<n;j++)for(int i=0;i<n;i++){float v=d[j*n+i];if(v==0)continue;if(i>0)v=Mathf.Min(v,d[j*n+i-1]+a);if(j>0)v=Mathf.Min(v,d[(j-1)*n+i]+a);if(i>0&&j>0)v=Mathf.Min(v,d[(j-1)*n+i-1]+b);if(i<n-1&&j>0)v=Mathf.Min(v,d[(j-1)*n+i+1]+b);d[j*n+i]=v;}
            for(int j=n-1;j>=0;j--)for(int i=n-1;i>=0;i--){float v=d[j*n+i];if(v==0)continue;if(i<n-1)v=Mathf.Min(v,d[j*n+i+1]+a);if(j<n-1)v=Mathf.Min(v,d[(j+1)*n+i]+a);if(i<n-1&&j<n-1)v=Mathf.Min(v,d[(j+1)*n+i+1]+b);if(i>0&&j<n-1)v=Mathf.Min(v,d[(j+1)*n+i-1]+b);d[j*n+i]=v;}
            for(int k=0;k<d.Length;k++)d[k]*=cell;return d;
        }
        static float Sample(float[] g,int n,float u,float v){float fx=Mathf.Clamp(u*n-.5f,0,n-1.001f),fy=Mathf.Clamp(v*n-.5f,0,n-1.001f);int x=(int)fx,y=(int)fy;float tx=fx-x,ty=fy-y;return Mathf.Lerp(Mathf.Lerp(g[y*n+x],g[y*n+x+1],tx),Mathf.Lerp(g[(y+1)*n+x],g[(y+1)*n+x+1],tx),ty);}
        // Returns the number of layers applied (0 = assets missing, nothing changed).
        public static int Apply(Terrain terrain,TerrainData data,float x0,float z0,float w,float h,Func<float,float,float> groundY,Func<float,float,bool> walkable,Vector4 bridge,Vector3 camp)
        {
            var macro=Load("skin_field_macro",false);var splat=Load("skin_field_splat",true);
            var skinA=Load("layer_skin_albedo",false);var skinN=Load("layer_skin_normal",true);var skinM=RepackMask(Load("layer_skin_mask",true));
            var bruA=Load("layer_bruise_albedo",false);var bruN=Load("layer_bruise_normal",true);var bruM=RepackMask(Load("layer_bruise_mask",true));
            var veiA=Load("layer_vein_albedo",false);var veiN=Load("layer_vein_normal",true);var veiM=RepackMask(Load("layer_vein_mask",true));
            if(macro==null||splat==null||skinA==null||bruA==null||veiA==null){Debug.LogWarning("A2R_SKIN assets missing; terrain surface stays hidden");return 0;}
            int ln;var laneD=Dist(x0,z0,w,h,walkable,out ln);int wn;var waterD=Dist(x0,z0,w,h,(x,z)=>groundY(x,z)>-.08f,out wn);
            // E6/E11: lane centre = grey-black skin (strong), the rest keeps flesh colour but muted; wet mud band along the moat; camp pool dimmed (Terrain Lit does not clamp the camp fire like the paint shader).
            var px=macro.GetPixels32();int W=macro.width,H=macro.height;
            for(int y=0;y<H;y++){float v=(y+.5f)/H;float wz=z0+v*h;for(int x=0;x<W;x++){float u=(x+.5f)/W;float wx=x0+u*w;
                float l=Mathf.SmoothStep(0,1,Mathf.InverseLerp(.8f,6f,Sample(laneD,ln,u,v)));float m=1-Mathf.SmoothStep(0,1,Mathf.InverseLerp(.15f,1.8f,Sample(waterD,wn,u,v)));
                float dx=wx-camp.x,dz=wz-camp.z;float pool=Mathf.Clamp01(1-(dx*dx+dz*dz)/(10f*10f));
                var c=px[y*W+x];float lum=c.r*.2126f+c.g*.7152f+c.b*.0722f;float k=Mathf.Clamp(.35f+.45f*l+.25f*pool,0,.9f);float dim=(1-.15f*l)*(1-.45f*pool);
                float r=Mathf.Lerp(c.r,lum*1.02f,k)*dim,g=Mathf.Lerp(c.g,lum*.98f,k)*dim,b=Mathf.Lerp(c.b,lum*.98f,k)*dim;
                float mk=m*.8f;r=Mathf.Lerp(r,34+lum*.25f,mk);g=Mathf.Lerp(g,19+lum*.15f,mk);b=Mathf.Lerp(b,16+lum*.12f,mk);
                px[y*W+x]=new Color32((byte)Mathf.Clamp(r,0,255),(byte)Mathf.Clamp(g,0,255),(byte)Mathf.Clamp(b,0,255),255);}}
            macro.SetPixels32(px);macro.wrapMode=TextureWrapMode.Clamp;macro.Apply(true,false);
            splat.wrapMode=TextureWrapMode.Clamp;splat.filterMode=FilterMode.Bilinear;
            var layers=new[]{Layer("A2R skin macro",macro,null,skinM,new Vector2(w,h),1),Layer("A2R skin wrinkles",skinA,skinN,skinM,new Vector2(8,8),1.8f),Layer("A2R skin bruise",bruA,bruN,bruM??skinM,new Vector2(8,8),1.4f),Layer("A2R skin vein",veiA,veiN,veiM??skinM,new Vector2(8,8),1.4f)};
            data.terrainLayers=layers;
            data.alphamapResolution=512;int ar=data.alphamapResolution;var alpha=new float[ar,ar,4];
            for(int iy=0;iy<ar;iy++)for(int ix=0;ix<ar;ix++)
            {
                var s=splat.GetPixelBilinear((ix+.5f)/ar,(iy+.5f)/ar);float skin=s.r+s.a,bruise=s.g,vein=s.b,sum=Mathf.Max(.0001f,skin+bruise+vein);const float macroW=.42f;float rest=1-macroW;
                alpha[iy,ix,0]=macroW;alpha[iy,ix,1]=rest*skin/sum;alpha[iy,ix,2]=rest*bruise/sum;alpha[iy,ix,3]=rest*vein/sum;
            }
            data.SetAlphamaps(0,0,alpha);
            // Moat stays a hole: the existing water and bank painting keep drawing there.
            int hr=data.holesResolution;var holes=new bool[hr,hr];
            for(int iy=0;iy<hr;iy++)for(int ix=0;ix<hr;ix++){float x=x0+(ix+.5f)/hr*w,z=z0+(iy+.5f)/hr*h;holes[iy,ix]=groundY(x,z)>-.08f&&!(x>bridge.x&&x<bridge.z&&z>bridge.y&&z<bridge.w);}
            data.SetHoles(0,0,holes);
            var mat=Resources.Load<Material>("A2R/Terrain/A2RTerrainLit");if(mat!=null)terrain.materialTemplate=mat;
            terrain.drawHeightmap=true;terrain.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;terrain.heightmapPixelError=1;terrain.basemapDistance=2000;terrain.drawInstanced=false;
            return layers.Length;
        }
    }
}
