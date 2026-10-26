using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // CH1-1 world terrain, below props/actors and the camera lighting pass.
    // game.html:26731-26823,51928-51929; ch1-altar-moat.js:8-145.
    // Cached PNGs are the original browser builders' repository exports.
    public sealed class NativeAltarMoat : MonoBehaviour
    {
        const int Width=1900, Height=960, CandidateCount=22;
        const double CenterX=950, CenterY=480, Tau=Math.PI*2;
        readonly Sprite[] sprites=new Sprite[4];
        readonly Texture2D[] textures=new Texture2D[4];
        readonly Vent[] vents=new Vent[CandidateCount];
        SpriteRenderer glow;
        GameObject terrain;
        int ventCount;
        bool prepared;

        struct Vent
        {
            public SpriteRenderer renderer;
            public double x,y,period,phase,size;
        }

        public void Initialize(MapData map)
        {
            if(prepared)throw new InvalidOperationException("Altar terrain is already prepared");
            if(map==null||map.hill==null||map.altarMoat==null)
                throw new InvalidOperationException("Original altar terrain data is missing");
            var art=map.altarMoat;
            sprites[0]=Load(0,art.hill,Width,Height,new Vector2(0,1));
            sprites[1]=Load(1,art.channel,Width,Height,new Vector2(0,1));
            sprites[2]=Load(2,art.glow,Width/2,Height/2,new Vector2(0,1));
            sprites[3]=Load(3,art.bubble,32,32,new Vector2(.5f,.5f));
            terrain=new GameObject("Altar terrain");terrain.transform.SetParent(transform,false);
            double ox=map.hill.cx*map.tileSize-CenterX, oy=map.hill.cy*map.tileSize-CenterY;
            terrain.transform.localPosition=World(ox,oy);
            Create("Altar hill",sprites[0],-29000);
            Create("Altar moat",sprites[1],-28999);
            glow=Create("Altar moat glow",sprites[2],-28998);
            glow.transform.localScale=new Vector3(2,2,1);
            PrepareVents(map.hill,map.tileSize);
            prepared=true;
            RenderAt(Time.realtimeSinceStartupAsDouble*1000);
        }

        Sprite Load(int index,string path,int width,int height,Vector2 pivot)
        {
            if(string.IsNullOrEmpty(path))throw new InvalidOperationException("Original altar texture path is missing");
            var texture=Resources.Load<Texture2D>(path);textures[index]=texture;
            if(texture==null||texture.width!=width||texture.height!=height)
                throw new InvalidOperationException("Original altar texture dimensions: "+path);
            return Sprite.Create(texture,new Rect(0,0,width,height),pivot,100,0,SpriteMeshType.FullRect);
        }

        SpriteRenderer Create(string name,Sprite sprite,int order)
        {
            var node=new GameObject(name);node.transform.SetParent(terrain.transform,false);
            var renderer=node.AddComponent<SpriteRenderer>();renderer.sprite=sprite;renderer.sortingOrder=order;
            return renderer;
        }

        // Exact LCG and call order, including skipped bridge candidates (source:104-111).
        static double Random(ref uint state)
        {
            state=unchecked(state*1664525u+1013904223u);
            return state/4294967296.0;
        }
        void PrepareVents(MapHill h,int tile)
        {
            uint state=77123;
            double rx=h.rx*tile,ry=h.ry*tile,mid=((double)h.inner+h.outer)/2;
            double x0=CenterX+(h.rampX0-h.cx)*tile,x1=CenterX+(h.rampX1-h.cx)*tile;
            double by=CenterY+(h.rampY-h.cy)*tile,hw0=h.rampHalf0*tile,hw1=h.rampHalf1*tile;
            for(int i=0;i<CandidateCount;i++)
            {
                double angle=(i+Random(ref state)*.8)/CandidateCount*Tau;
                double d=mid+(Random(ref state)-.5)*.07;
                double x=CenterX+rx*d*Math.Cos(angle),y=CenterY+ry*d*Math.Sin(angle);
                double t=Math.Max(0,Math.Min(1,(x-x0)/(x1-x0)));
                if(x>=x0-26&&x<=x1+26&&Math.Abs(y-by)<=hw0+(hw1-hw0)*t+26)continue;
                var vent=new Vent {x=x,y=y,period=2300+Random(ref state)*2600,
                    phase=Random(ref state),size=6+Random(ref state)*7,
                    renderer=Create("Altar moat bubble "+ventCount,sprites[3],-28997)};
                vents[ventCount++]=vent;
            }
        }

        void LateUpdate()
        {
            if(prepared)RenderAt(Time.realtimeSinceStartupAsDouble*1000);
        }
        // Render clock remains independent of simulation ticks, as browser _now.
        // No resources, sprites, collections, delegates or managed objects created here.
        void RenderAt(double now)
        {
            glow.color=new Color(1,1,1,(float)(.07+.03*Math.Sin(now*.0017)+.015*Math.Sin(now*.0041+1.7)));
            for(int i=0;i<ventCount;i++)
            {
                var v=vents[i];double t=(now/v.period+v.phase)%1;
                if(t>.7){v.renderer.enabled=false;continue;}
                double k=t/.7,pop=k>.86?(k-.86)/.14:0;
                double size=v.size*(.35+.65*Math.Min(1,k/.6))*(1+pop*.9);
                double alpha=Math.Min(1,k/.18)*(1-pop);
                v.renderer.enabled=alpha>.02;
                if(alpha<=.02)continue;
                v.renderer.transform.localPosition=World(v.x,v.y-k*3);
                v.renderer.transform.localScale=new Vector3((float)(size/32),(float)(size/32),1);
                v.renderer.color=new Color(1,1,1,(float)(alpha*.8));
            }
        }
        static Vector3 World(double x,double y){return new Vector3((float)(x/100),(float)(-y/100),0);}

        void OnDestroy()
        {
            prepared=false;
            if(terrain!=null)Destroy(terrain);
            for(int i=0;i<sprites.Length;i++)if(sprites[i]!=null)Destroy(sprites[i]);
            for(int i=0;i<textures.Length;i++)if(textures[i]!=null)Resources.UnloadAsset(textures[i]);
        }
    }
}
