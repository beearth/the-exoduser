using UnityEngine;

namespace Exoduser.UnityPort
{
    // C-only metal face with a thin grounding rail. No noise, dither or imported-asset edits.
    internal static class NativeHudPrototypeCArt
    {
        internal const float PlateTopAlpha=.88f,PlateBottomAlpha=.94f,SupportInteriorAlpha=.12f;
        internal const float RailStrokeHeight=1.5f,EdgeAlpha=.52f;
        static Color Silver(float alpha){return NativeHudPrototypeArt.C(201,199,195,alpha);}
        static float Cover(float distance){return Mathf.Clamp01(.5f-distance);}
        static Texture2D Bake(float width,float height,System.Func<float,float,Color> sample)
        {
            bool linear=QualitySettings.activeColorSpace==ColorSpace.Linear;
            return NativeSilverHellUi.Effect(Mathf.CeilToInt(width*2),Mathf.CeilToInt(height*2),(u,v)=>{
                Color c=sample(u*width,v*height);return linear?c.linear:c;
            });
        }
        internal static Texture2D Plate(float width,float height,float chamfer,bool support=false)
        {
            return Bake(width,height,(x,y)=>{
                float diagonal=(chamfer-x-y)*.70710678f,other=(x+chamfer-width-y)*.70710678f;
                float signed=Mathf.Max(Mathf.Max(-x,x-width),Mathf.Max(Mathf.Max(-y,y-height),Mathf.Max(diagonal,other)));
                float border=Cover(Mathf.Abs(signed+1)-.5f),inside=Cover(signed);
                float alpha=support?SupportInteriorAlpha:Mathf.Lerp(PlateTopAlpha,PlateBottomAlpha,y/height);
                Color c=Color.Lerp(NativeHudPrototypeArt.C(44,46,49,alpha),NativeHudPrototypeArt.C(15,15,16,alpha),.25f);
                float edge=border*EdgeAlpha;float total=edge+alpha*(1-edge);
                Color silver=Silver(edge);c=new Color((silver.r*edge+c.r*alpha*(1-edge))/total,
                    (silver.g*edge+c.g*alpha*(1-edge))/total,(silver.b*edge+c.b*alpha*(1-edge))/total,total*inside);
                return c;
            });
        }
        internal static Texture2D Rail(float width,float leftContact,float rightContact)
        {
            float[] contacts={leftContact-28,leftContact+28,rightContact-28,rightContact+28};
            return Bake(width,14,(x,y)=>{
                // The 14px layout bounds remain, but only a thin upper line and four narrow feet are inked.
                float taper=Mathf.Clamp01(Mathf.Min(x,width-x)/30);
                float line=Cover(y-RailStrokeHeight)*.48f*taper,feet=0;
                foreach(float center in contacts){
                    float foot=Cover(Mathf.Abs(x-center)-1.25f)*Mathf.Clamp01((y-3)/4)*.40f;
                    feet=Mathf.Max(feet,foot);
                }
                return Silver(Mathf.Max(line,feet));
            });
        }
    }
}
