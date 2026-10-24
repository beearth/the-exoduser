using UnityEngine;

namespace Exoduser.UnityPort
{
    // Geometry is expressed in NativeGame's uniformly scaled HUD coordinate space.
    // Alpha bounds come from the largest alpha>=32 connected art component,
    // excluding isolated export specks; no texture pixels are modified.
    public sealed class NativeHudDockLayout
    {
        public const float ArtScale=.9f;
        public Rect Foundation,SlotBar,LeftLiquid,RightLiquid,LeftFrame,RightFrame;
        public Rect ActiveSlot;

        public static NativeHudDockLayout Create(float width,float height)
        {
            const float s=ArtScale;
            float frameSize=263*s;
            var result=new NativeHudDockLayout();
            result.Foundation=new Rect(0,height-44,width,44);
            result.LeftFrame=new Rect(-frameSize*9/465,height-frameSize,frameSize,frameSize);
            result.RightFrame=new Rect(width-frameSize*461/465,height-frameSize,frameSize,frameSize);
            result.LeftLiquid=Liquid(result.LeftFrame);
            result.RightLiquid=Liquid(result.RightFrame);
            float barWidth=820*s,barHeight=182*s;
            // The authored PNG has empty rows below its actual y=462 silhouette.
            result.SlotBar=new Rect((width-barWidth)/2,height-3-barHeight*462/546,barWidth,barHeight);
            result.ActiveSlot=new Rect(result.SlotBar.x+392*s,result.SlotBar.y+70*s,37*s,45*s);
            return result;
        }

        static Rect Liquid(Rect frame){return new Rect(frame.x+48*ArtScale,frame.y+44*ArtScale,175*ArtScale,175*ArtScale);}
        public static Rect VisibleFrame(Rect frame){return new Rect(frame.x+frame.width*9/465,frame.y+frame.height*4/469,frame.width*452/465,frame.height*465/469);}
        public Rect VisibleBar{get{return new Rect(SlotBar.x+SlotBar.width*154/2460,SlotBar.y+SlotBar.height*84/546,SlotBar.width*2163/2460,SlotBar.height*378/546);}}
    }
}
