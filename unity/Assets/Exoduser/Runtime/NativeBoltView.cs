using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed class NativeBoltView : IDisposable
    {
        static readonly string[] Body=
        {
            "#bbbbbb","#ff5522","#3388ff","#9933cc","#ffee00","#ff88cc","#88aa44"
        }
        ,Tip=
        {
            "#ffffff","#ffaa44","#88ccff","#cc77ff","#ffffaa","#ffccee"
        }
        ;
        static readonly HashSet<SpriteRenderer> centered=new HashSet<SpriteRenderer>();
        public static bool IsCenteredSprite(SpriteRenderer sprite)
        {
            return centered.Contains(sprite);
        }
        public static Vector3 Position(double x,double y)
        {
            return NativeRemodel3D.Point(x,y)+(NativeRemodel3D.Active?Vector3.up*.25f:Vector3.zero);
        }
        readonly Transform parent;
        readonly Sprite pixel,circle;
        readonly Texture2D circleTexture;
        readonly Material normal;
        readonly Dictionary<int,SpriteRenderer[]> bolts=new Dictionary<int,SpriteRenderer[]>();
        SpriteRenderer[] pet;
        public NativeBoltView(Transform parent)
        {
            this.parent=parent;
            pixel=Sprite.Create(Texture2D.whiteTexture,new Rect(0,0,1,1),new Vector2(.5f,.5f),1);
            circleTexture=new Texture2D(64,64,TextureFormat.RGBA32,false)
            {
                filterMode=FilterMode.Bilinear
            }
            ;
            var colors=new Color[4096];
            for(int y=0;y<64;y++)for(int x=0;x<64;x++)
            {
                float d=Mathf.Sqrt((x-31.5f)*(x-31.5f)+(y-31.5f)*(y-31.5f));
                colors[y*64+x]=new Color(1,1,1,Mathf.Clamp01(32-d));
            }
            circleTexture.SetPixels(colors);
            circleTexture.Apply(false,true);
            circle=Sprite.Create(circleTexture,new Rect(0,0,64,64),new Vector2(.5f,.5f),64);
            normal=new Material(Resources.Load<Shader>("Shaders/SkillAdditive"));
            normal.SetFloat("_NormalBlend",1);
            normal.SetFloat("_DstBlend",(int)UnityEngine.Rendering.BlendMode.OneMinusSrcAlpha);
        }
        static Color Parse(string hex,float alpha)
        {
            Color c;
            ColorUtility.TryParseHtmlString(hex,out c);
            c.a=alpha;
            return c;
        }
        SpriteRenderer Make(string name,int order)
        {
            var go=new GameObject(name);
            go.transform.SetParent(parent);
            var r=go.AddComponent<SpriteRenderer>();
            r.sprite=pixel;
            r.sharedMaterial=normal;
            r.sortingOrder=order;
            centered.Add(r);
            return r;
        }
        static void Destroy(SpriteRenderer r)
        {
            centered.Remove(r);
            UnityEngine.Object.Destroy(r.gameObject);
        }
        public void Reset()
        {
            foreach(var layers in bolts.Values)foreach(var r in layers)Destroy(r);
            bolts.Clear();
            if(pet!=null)
            {
                foreach(var r in pet)Destroy(r);
                pet=null;
            }
        }
        public void Update(Simulation simulation)
        {
            normal.SetInt("_DepthTest",NativeRemodel3D.Active?(int)UnityEngine.Rendering.CompareFunction.Always:(int)UnityEngine.Rendering.CompareFunction.LessEqual);
            UpdatePet(simulation);
            var active=new HashSet<int>();
            foreach(var p in simulation.Bolts)
            {
                if(!p.Active)continue;
                active.Add(p.Id);
                SpriteRenderer[] layers;
                if(!bolts.TryGetValue(p.Id,out layers))
                {
                    layers=new[]
                    {
                        Make("Bolt glow "+p.Id,24000),Make("Bolt shaft "+p.Id,24001),Make("Bolt tip "+p.Id,24002)
                    }
                    ;
                    bolts.Add(p.Id,layers);
                }
                float angle=(float)Math.Atan2(p.Vy,p.Vx),fade=(float)Math.Min(1,1-p.Dist/Math.Max(1,p.MaxDist)*.3)*.6f;
                int el=Mathf.Clamp(p.Element,0,5);
                Place(layers[0],p.X-Math.Cos(angle)*4,p.Y-Math.Sin(angle)*4,angle,34,9,Parse(Body[el],fade*.28f));
                Place(layers[1],p.X-Math.Cos(angle)*7,p.Y-Math.Sin(angle)*7,angle,30,3.2f,Parse(Body[el],Mathf.Min(1,fade*1.5f)));
                Place(layers[2],p.X+Math.Cos(angle)*3,p.Y+Math.Sin(angle)*3,angle,10,4.6f,Parse(Tip[el],Mathf.Min(1,fade*1.6f)));
            }
            var gone=new List<int>();
            foreach(var id in bolts.Keys)if(!active.Contains(id))gone.Add(id);
            foreach(int id in gone)
            {
                foreach(var r in bolts[id])Destroy(r);
                bolts.Remove(id);
            }
        }
        void UpdatePet(Simulation s)
        {
            if(!s.CrossbowPetEnabled)
            {
                if(pet!=null)foreach(var r in pet)r.enabled=false;
                return;
            }
            if(pet==null)
            {
                pet=new SpriteRenderer[11];
                for(int i=0;i<pet.Length;i++)pet[i]=Make("유령 석궁 "+i,24010+i);
                pet[0].sprite=pet[1].sprite=circle;
            }
            foreach(var r in pet)r.enabled=true;
            double time=s.CrossbowPetT,x=s.CrossbowPetX,y=s.CrossbowPetY+Math.Sin(time*.08)*3,a=s.CrossbowPetAngle;
            float opacity=(float)(.7+Math.Sin(time*.1)*.15);
            Place(pet[0],x,y+14,0,10,3,new Color(0,0,0,.08f));
            Place(pet[1],x,y,0,20,20,Parse("#6688cc",(float)(.12+Math.Sin(time*.06)*.06)));
            Place(pet[2],x,y,(float)a,12,5,Parse("#5577aa",opacity));
            Line(3,x,y,a,5,-6,8,0,1.5f,Parse("#7799cc",opacity));
            Line(4,x,y,a,8,0,5,6,1.5f,Parse("#7799cc",opacity));
            Line(5,x,y,a,5,-6,3,0,.7f,Parse("#aaccff",opacity));
            Line(6,x,y,a,3,0,5,6,.7f,Parse("#aaccff",opacity));
            Line(7,x,y,a,-4,0,6,0,1,Parse("#ddeeff",opacity));
            Line(8,x,y,a,7,0,5,-1.5f,1,Parse("#ddeeff",opacity));
            Line(9,x,y,a,5,-1.5f,5,1.5f,1,Parse("#ddeeff",opacity));
            Line(10,x,y,a,5,1.5f,7,0,1,Parse("#ddeeff",opacity));
        }
        void Line(int index,double x,double y,double angle,double ax,double ay,double bx,double by,float thickness,Color color)
        {
            double dx=bx-ax,dy=by-ay,mx=(ax+bx)*.5,my=(ay+by)*.5,c=Math.Cos(angle),sn=Math.Sin(angle);
            Place(pet[index],x+mx*c-my*sn,y+mx*sn+my*c,(float)(angle+Math.Atan2(dy,dx)),(float)Math.Sqrt(dx*dx+dy*dy),thickness,color);
        }
        static void Place(SpriteRenderer r,double x,double y,float angle,float length,float thickness,Color color)
        {
            r.transform.position=Position(x,y);
            r.transform.rotation=Quaternion.Euler(0,0,-angle*Mathf.Rad2Deg);
            r.transform.localScale=new Vector3(length/100,thickness/100,1);
            r.color=color;
        }
        public void Dispose()
        {
            Reset();
            UnityEngine.Object.Destroy(pixel);
            UnityEngine.Object.Destroy(circle);
            UnityEngine.Object.Destroy(circleTexture);
            UnityEngine.Object.Destroy(normal);
        }
    }
}
