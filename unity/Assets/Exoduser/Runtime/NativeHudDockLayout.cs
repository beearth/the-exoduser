using UnityEngine;

namespace Exoduser.UnityPort
{
    // Geometry is expressed in NativeGame's uniformly scaled HUD coordinate space.
    // Orb frames keep the source globe art geometry. The slot bar is the 11-08 lit
    // silver-steel relief (unity/Tools/hud/hud_bake.py): an 800x128 canvas whose
    // Blender units equal 1080p pixels, socket centres measured from the canvas centre.
    public sealed class NativeHudDockLayout
    {
        public const float ArtScale=.9f;
        const float BottomInset=10f,OrbCenter=441f;
        // hud_bake.py canvas: 800x128 units, Blender y spans -4..124 (top = 124).
        public const float BarCanvasWidth=800f,BarCanvasHeight=128f,BarCanvasTopY=124f;
        const float BarBottomInset=2f,SocketY=54f,SocketDiameter=46f,LabelTopY=25f,LabelBottomY=9f;
        // 13 round sockets: [1 2 3 4 F Z] [LMB RMB] [Shift E Q Ctrl Space], 46 px, gap 6, group gap 22; LMB centred.
        static readonly float[] SocketCenterX={-328,-276,-224,-172,-120,-68,0,52,120,172,224,276,328};
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
            result.SlotBar=new Rect(mid-BarCanvasWidth*.5f,height-BarBottomInset-BarCanvasHeight,BarCanvasWidth,BarCanvasHeight);
            result.ActiveSlot=result.SlotRect(6);
            return result;
        }

        static Rect Liquid(Rect frame){return new Rect(frame.x+48*ArtScale,frame.y+44*ArtScale,175*ArtScale,175*ArtScale);}
        public static float SocketU(int index){return (SocketCenterX[index]+BarCanvasWidth*.5f)/BarCanvasWidth;}
        public const float SocketV=(SocketY+4f)/BarCanvasHeight;   // texture v (bottom = 0) of the socket row
        public Rect SlotRect(int index){float r=SocketDiameter*.5f;return new Rect(SlotBar.center.x+SocketCenterX[index]-r,SlotBar.y+(BarCanvasTopY-SocketY)-r,SocketDiameter,SocketDiameter);}
        public static Rect VisibleFrame(Rect frame){return new Rect(frame.x+frame.width*9/465,frame.y+frame.height*4/469,frame.width*452/465,frame.height*465/469);}
        // Plate silhouette including end brackets and the eye arch.
        public Rect VisibleBar{get{return new Rect(SlotBar.center.x-382,SlotBar.y+2,764,BarCanvasHeight-4);}}
        public static Rect KeyLabelRect(Rect barRect,float height,int index)
        {
            float r=SocketDiameter*.5f;
            return new Rect(barRect.center.x+SocketCenterX[index]-r,barRect.y+(BarCanvasTopY-LabelTopY),SocketDiameter,LabelTopY-LabelBottomY);
        }
    }
}
