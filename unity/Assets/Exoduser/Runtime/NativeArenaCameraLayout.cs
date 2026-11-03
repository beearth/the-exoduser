using System;
namespace Exoduser.UnityPort
{
    internal static class NativeArenaCameraLayout
    {
        internal struct Frame { public float x,y,half; }
        internal static Frame Fit(float baseHalf,float aspect,float x,float y,float width,float height,float heroX,float heroY)
        {
            aspect=Math.Max(.1f,aspect);
            float half=Math.Min(baseHalf*1.35f,Math.Max(baseHalf,Math.Max(height/(2*.68f),width/(2*.84f*aspect))));
            // Bound the extra whole-body zoom. A distant boss may leave the screen as in the web;
            // the controlled hero stays in the central safe area above the combat HUD.
            float cx=Math.Max(heroX-.60f*half*aspect,Math.Min(heroX+.60f*half*aspect,x));
            float cy=Math.Max(heroY-.46f*half,Math.Min(heroY+.46f*half,y-.08f*half));
            return new Frame{x=cx,y=cy,half=half};
        }
    }
}
