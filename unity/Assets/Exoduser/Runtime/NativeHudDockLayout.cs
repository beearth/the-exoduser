using UnityEngine;

namespace Exoduser.UnityPort
{
    // Geometry is expressed in NativeGame's uniformly scaled HUD coordinate space.
    // Alpha bounds come from the largest alpha>=32 connected art component,
    // excluding isolated export specks; no texture pixels are modified.
    public sealed class NativeHudDockLayout
    {
        public const float ArtScale=.9f;
        const float BottomInset=10f,OrbCenter=441f;
        static readonly float[] SlotLeft={128,173,217,261,303,347,392,436,479,522,566,610,654};
        public static readonly string[] KeyNames={"1","2","3","4","F","Z","LMB","RMB","Shift","E","Q","Ctrl","Space"};
        public Rect SlotBar,LeftLiquid,RightLiquid,LeftFrame,RightFrame;
        public Rect ActiveSlot;

        public static NativeHudDockLayout Create(float width,float height)
        {
            const float s=ArtScale;
            float frameSize=263*s;
            var result=new NativeHudDockLayout();
            float mid=width*.5f;
            // A fixed central group keeps the resource/slot relationship at every aspect ratio.
            // The web globe's 175px liquid ends 10px above the bottom;
            // its 263px glass extends 44px below that liquid.
            float frameY=height-BottomInset+44*s-frameSize;
            result.LeftFrame=new Rect(mid-OrbCenter-135.5f*s,frameY,frameSize,frameSize);
            result.RightFrame=new Rect(mid+OrbCenter-135.5f*s,frameY,frameSize,frameSize);
            result.LeftLiquid=Liquid(result.LeftFrame);
            result.RightLiquid=Liquid(result.RightFrame);
            float barWidth=820*s,barHeight=182*s;
            // Web #skBar is bottom:10px-25px with a bottom-origin 0.9 scale.
            result.SlotBar=new Rect((width-barWidth)/2,height-BottomInset+25-barHeight,barWidth,barHeight);
            result.ActiveSlot=result.SlotRect(6);
            return result;
        }

        static Rect Liquid(Rect frame){return new Rect(frame.x+48*ArtScale,frame.y+44*ArtScale,175*ArtScale,175*ArtScale);}
        public Rect SlotRect(int index){float s=ArtScale;return new Rect(SlotBar.x+SlotLeft[index]*s,SlotBar.y+70*s,37*s,45*s);}
        public static Rect VisibleFrame(Rect frame){return new Rect(frame.x+frame.width*9/465,frame.y+frame.height*4/469,frame.width*452/465,frame.height*465/469);}
        public Rect VisibleBar{get{return new Rect(SlotBar.x+SlotBar.width*154/2460,SlotBar.y+SlotBar.height*84/546,SlotBar.width*2163/2460,SlotBar.height*378/546);}}
        public static Rect KeyLabelRect(Rect barRect,float height,int index)
        {
            float s=ArtScale;
            return new Rect(barRect.x+SlotLeft[index]*s,barRect.y+121*s,37*s,18*s);
        }
    }
}
