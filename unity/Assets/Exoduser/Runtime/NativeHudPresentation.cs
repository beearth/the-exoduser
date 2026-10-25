using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeHud
    {
        Texture2D dockShell,dockShadow;
        const int ShellWidth=1120,ShellHeight=142;

        // Presentation only: a shared curved foundation behind the unchanged source art.
        static float Shoulder(float x)
        {
            float d=Mathf.Abs(x-ShellWidth*.5f);
            if(d<=260)return 38;
            if(d<=380)return Mathf.Lerp(38,67,Mathf.SmoothStep(0,1,(d-260)/120));
            return Mathf.Lerp(67,130,Mathf.SmoothStep(0,1,(d-380)/180));
        }
        void EnsureDockSurface()
        {
            if(dockShell!=null)return;
            dockShell=new Texture2D(ShellWidth,ShellHeight,TextureFormat.RGBA32,false){name="HUD shared curved foundation",filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};
            dockShadow=new Texture2D(ShellWidth,ShellHeight,TextureFormat.RGBA32,false){name="HUD foundation contact shadow",filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};
            var surface=new Color32[ShellWidth*ShellHeight];var shadow=new Color32[surface.Length];
            for(int y=0;y<ShellHeight;y++)for(int x=0;x<ShellWidth;x++){
                float top=Shoulder(x),bottom=ShellHeight-8;
                float edge=Mathf.Min(Mathf.Abs(y-top),Mathf.Abs(y-bottom));
                if(y>=top-1&&y<=bottom+1)edge=Mathf.Min(edge,Mathf.Min(x-5,ShellWidth-6-x));
                float line=Mathf.Clamp01(1.65f-edge);
                float highlight=Mathf.Clamp01(1-Mathf.Abs(y-top-.45f)/1.25f);
                float shade=.115f+highlight*.08f;
                // Only a thin metal contour is drawn. Interior pixels remain transparent.
                surface[y*ShellWidth+x]=new Color(shade*1.08f,shade*1.04f,shade*.94f,line*.46f);
                shadow[y*ShellWidth+x]=new Color(0,0,0,Mathf.Clamp01(1-edge/4f)*.10f);
            }
            dockShell.SetPixels32(surface);dockShell.Apply(false,true);
            dockShadow.SetPixels32(shadow);dockShadow.Apply(false,true);
        }
        Rect DockStatusRect(NativeHudDockLayout dock,float width)
        {return new Rect(width*.5f-180,dock.VisibleBar.y-25,360,20);}
        void DrawDockFoundation(NativeHudDockLayout dock,float width,float height)
        {
            EnsureDockSurface();var old=GUI.color;
            float scale=NativeHudDockLayout.ArtScale,shellWidth=ShellWidth*scale,shellHeight=ShellHeight*scale;
            var body=new Rect(width*.5f-shellWidth*.5f,height-shellHeight,shellWidth,shellHeight);
            GUI.color=new Color(1,1,1,.72f);GUI.DrawTexture(new Rect(body.x,body.y+1,body.width,body.height),dockShadow);
            GUI.DrawTexture(body,dockShell);
            // No opaque foundation or rectangular foot: only a curved contour remains.
            GUI.color=old;
        }
        void ReleaseDockSurface(){Release(dockShell);Release(dockShadow);dockShell=dockShadow=null;}
    }
}
