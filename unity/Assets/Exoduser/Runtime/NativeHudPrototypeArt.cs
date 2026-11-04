using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Deterministic 2x analytic rasterization of U1 _hud_mock.js vectors. No noise or generated art.
    internal static class NativeHudPrototypeArt
    {
        internal static Color C(int r,int g,int b,float a=1){return new Color(r/255f,g/255f,b/255f,a);}
        static readonly Color Hi=C(246,245,242),Light=C(201,199,195),Mid=C(138,139,136),Dark=C(79,83,82);
        static float Cover(float distance){return Mathf.Clamp01(.5f-distance);}
        static Color Over(Color under,Color over,float coverage=1)
        {
            float a=over.a*Mathf.Clamp01(coverage),total=a+under.a*(1-a);
            if(total<=0)return Color.clear;
            return new Color((over.r*a+under.r*under.a*(1-a))/total,(over.g*a+under.g*under.a*(1-a))/total,(over.b*a+under.b*under.a*(1-a))/total,total);
        }
        static Color Chrome(float y)
        {
            y=Mathf.Clamp01(y);
            return y<.34f?Color.Lerp(Hi,Light,y/.34f):y<.5f?Color.Lerp(Light,Dark,(y-.34f)/.16f):y<.63f?Color.Lerp(Dark,Light,(y-.5f)/.13f):Color.Lerp(Light,Mid,(y-.63f)/.37f);
        }
        static float Segment(Vector2 p,Vector2 a,Vector2 b)
        {
            Vector2 d=b-a;float t=Mathf.Clamp01(Vector2.Dot(p-a,d)/Mathf.Max(.00001f,d.sqrMagnitude));return (p-a-t*d).magnitude;
        }
        static float PolygonDistance(Vector2 p,Vector2[] points)
        {
            float distance=float.MaxValue;bool inside=false;
            for(int i=0,j=points.Length-1;i<points.Length;j=i++){
                Vector2 a=points[i],b=points[j];distance=Mathf.Min(distance,Segment(p,a,b));
                if((a.y>p.y)!=(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;
            }
            return inside?-distance:distance;
        }
        static Color Polygon(Color under,Vector2 p,Vector2[] points,Color fill,Color stroke,float strokeWidth)
        {
            float d=PolygonDistance(p,points);under=Over(under,fill,Cover(d));
            return strokeWidth>0?Over(under,stroke,Cover(Mathf.Abs(d)-strokeWidth/2)):under;
        }
        static Color CircleStroke(Color under,float radius,float center,float width,Color color){return Over(under,color,Cover(Mathf.Abs(radius-center)-width/2));}
        static Texture2D Bake(float width,float height,Func<float,float,Color> sample)
        {
            // Same Linear IMGUI correction as NativeSilverHellUi.Panel's generated face.
            bool linear=QualitySettings.activeColorSpace==ColorSpace.Linear;
            return NativeSilverHellUi.Effect(Mathf.CeilToInt(width*2),Mathf.CeilToInt(height*2),(u,v)=>{Color c=sample(u*width,v*height);return linear?c.linear:c;});
        }
        internal static Texture2D Rail(float width)
        {
            return Bake(width,14,(x,y)=>{
                Color c=Color.Lerp(C(24,24,27),C(11,11,13),y/14);float t=x/width;
                Color edge=t<.08f?Mid:t<.3f?Color.Lerp(Mid,Light,(t-.08f)/.22f):t<.5f?Color.Lerp(Light,Hi,(t-.3f)/.2f):t<.7f?Color.Lerp(Hi,Light,(t-.5f)/.2f):t<.92f?Color.Lerp(Light,Mid,(t-.7f)/.22f):Mid;
                float a=Mathf.Min(Mathf.Clamp01(t/.08f),Mathf.Clamp01((1-t)/.08f));return Over(c,edge,Cover(y-1.4f)*a);
            });
        }
        internal static Texture2D Plate(float width,float height,float chamfer)
        {
            var polygon=new[]{new Vector2(0,chamfer),new Vector2(chamfer,0),new Vector2(width-chamfer,0),new Vector2(width,chamfer),new Vector2(width,height),new Vector2(0,height)};
            return Bake(width,height,(x,y)=>{
                float t=x/width;Color edge=t<.2f?Color.Lerp(Dark,Light,t/.2f):t<.5f?Color.Lerp(Light,Hi,(t-.2f)/.3f):t<.8f?Color.Lerp(Hi,Light,(t-.5f)/.3f):Color.Lerp(Light,Dark,(t-.8f)/.2f);
                Color c=Color.Lerp(C(20,20,23,.96f),C(10,10,12,.97f),y/height);c=Over(c,edge,Cover(y-1.4f));
                if(x>=7&&x<width-7)c=Over(c,C(201,199,195,.22f),Cover(Mathf.Abs(y-6.5f)-.5f));
                c.a*=Cover(PolygonDistance(new Vector2(x,y),polygon));return c;
            });
        }
        internal static Texture2D Emblem()
        {
            var polygon=new[]{new Vector2(11,2),new Vector2(20,11),new Vector2(11,20),new Vector2(2,11)};
            return Bake(22,22,(x,y)=>Over(Polygon(Color.clear,new Vector2(x,y),polygon,C(15,15,16),Light,1.2f),C(194,26,16),Cover(Vector2.Distance(new Vector2(x,y),new Vector2(11,11))-2.2f)));
        }
        internal static Texture2D Frame(NativeHudPrototypeLayout l)
        {
            float d=l.Outer,R=d/2,band=l.Band,eyeY=band/2+1,ew=l.EyeWidth;
            var spikes=new System.Collections.Generic.List<Vector2[]>();
            for(int i=0;i<24;i++){
                float degrees=i*15;if(degrees<35||degrees>325||Mathf.Abs(degrees-180)<58)continue;
                float a=degrees*Mathf.Deg2Rad,len=i%2!=0?4:8,bw=i%2!=0?2.6f:3.6f;
                var s=new Vector2(Mathf.Sin(a),-Mathf.Cos(a));var n=new Vector2(-s.y,s.x);var c=new Vector2(R,R);
                spikes.Add(new[]{c+(R-3)*s+bw*n,c+(R+len)*s,c+(R-3)*s-bw*n});
            }
            var feet=new Vector2[2][];
            for(int i=0;i<2;i++){
                float a=(180+(i==0?-38:38))*Mathf.Deg2Rad,fx=R+(R-4)*Mathf.Sin(a),fy=R-(R-4)*Mathf.Cos(a);
                feet[i]=new[]{new Vector2(fx-9,d),new Vector2(fx-4,fy-2),new Vector2(fx+4,fy-2),new Vector2(fx+9,d)};
            }
            var sideL=new[]{new Vector2(R-ew/2-7,eyeY),new Vector2(R-ew/2-2,eyeY-2),new Vector2(R-ew/2-2,eyeY+2)};
            var sideR=new[]{new Vector2(R+ew/2+7,eyeY),new Vector2(R+ew/2+2,eyeY-2),new Vector2(R+ew/2+2,eyeY+2)};
            return Bake(d+20,d+24,(x,y)=>{
                var p=new Vector2(x-10,y-10);float radius=Vector2.Distance(p,new Vector2(R,R));Color c=Color.clear,chrome=Chrome(p.y/d);
                foreach(var s in spikes)c=Polygon(c,p,s,Light,Color.black,.6f);
                foreach(var f in feet)c=Polygon(c,p,f,C(20,20,22),chrome,1.2f);
                c=CircleStroke(c,radius,R-band/2,band,C(24,24,27));
                c=CircleStroke(c,radius,R-1.5f,3,Color.black);
                c=CircleStroke(c,radius,R-1.5f,1.6f,chrome);
                c=CircleStroke(c,radius,l.Liquid/2+1,1.4f,chrome);
                c=CircleStroke(c,radius,R-band+2,1,C(201,199,195,.18f));
                // Quadratic lens: SVG Q control points +/-9 produce a +/-4.5px arch at its center.
                float dx=p.x-R,t=dx/(ew/2),half=4.5f*(1-t*t);
                if(Mathf.Abs(dx)<=ew/2+.7f){
                    float derivative=9*dx/(ew*ew/4),distance=(Mathf.Abs(p.y-eyeY)-half)/Mathf.Sqrt(1+derivative*derivative);
                    c=Over(c,C(11,11,13),Cover(distance));c=Over(c,chrome,Cover(Mathf.Abs(distance)-.65f));
                }
                c=Polygon(c,p,sideL,Light,Color.clear,0);return Polygon(c,p,sideR,Light,Color.clear,0);
            });
        }
        internal static Texture2D Eye(bool active)
        {
            return Bake(6,6,(x,y)=>{Color c=active?C(194,26,16):C(44,46,49);c.a*=Cover(Vector2.Distance(new Vector2(x,y),new Vector2(3,3))-(active?2.3f:2));return c;});
        }
        internal static Texture2D EyeGlow(float width)
        {
            return Bake(width,14,(x,y)=>{
                float dx=x-width/2,halfEye=width/2.8f,t=dx/halfEye,arch=4.5f*(1-t*t);
                float mask=Mathf.Abs(dx)<=halfEye?1-Cover(Mathf.Abs(y-7)-arch-.65f):1;
                return C(194,26,16,.55f*Mathf.Clamp01(1-new Vector2(dx/(width/2),(y-7)/7).magnitude)*mask);
            });
        }
        internal static Texture2D Hair()
        {
            return Bake(64,1,(x,y)=>C(201,199,195,.55f*(1-Mathf.Abs(x/32-1))));
        }
        internal static Texture2D Chip()
        {
            // A 32x15 nine-slice keeps a 1px border and 2px corners for all key widths.
            return Bake(32,15,(x,y)=>{
                Vector2 q=new Vector2(Mathf.Abs(x-16)-14,Mathf.Abs(y-7.5f)-5.5f);
                float distance=new Vector2(Mathf.Max(q.x,0),Mathf.Max(q.y,0)).magnitude+Mathf.Min(Mathf.Max(q.x,q.y),0)-2;
                Color c=C(10,10,12,.94f);c=Over(c,Dark,Cover(Mathf.Abs(distance+.5f)-.5f));c.a*=Cover(distance);return c;
            });
        }
        internal static Texture2D Mouse(bool right)
        {
            return Bake(9,11,(x,y)=>{
                Vector2 q=new Vector2(Mathf.Abs(x-4.5f),Mathf.Abs(y-5.5f)-1);float distance=new Vector2(q.x,Mathf.Max(q.y,0)).magnitude-3.9f;
                Color c=C(167,164,157,Cover(Mathf.Abs(distance)-.5f));
                if(y<=4.6f&&y>=.9f&&(right?x>=4.5f:x<=4.5f))c=Over(c,Light,Cover(distance+.3f));
                if(y>=.6f&&y<=4.6f)c=Over(c,C(167,164,157),Cover(Mathf.Abs(x-4.5f)-.5f));return c;
            });
        }
    }
}
