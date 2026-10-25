using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeHud
    {
        Texture2D dockShell,dockShadow,dockIron;
        const int ShellWidth=1048,ShellHeight=172;

        // Presentation only: a shared curved foundation behind the unchanged source art.
        static float Shoulder(float x)
        {
            float d=Mathf.Abs(x-ShellWidth*.5f);
            if(d<=274)return 8;
            if(d<=352)return Mathf.Lerp(8,77,Mathf.SmoothStep(0,1,(d-274)/78));
            return Mathf.Lerp(77,144,Mathf.SmoothStep(0,1,(d-352)/172));
        }
        void EnsureDockSurface()
        {
            if(dockShell!=null)return;
            dockIron=Required<Texture2D>("Art/ui/inventory/iron");
            dockShell=new Texture2D(ShellWidth,ShellHeight,TextureFormat.RGBA32,false){name="HUD shared curved foundation",filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};
            dockShadow=new Texture2D(ShellWidth,ShellHeight,TextureFormat.RGBA32,false){name="HUD foundation contact shadow",filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};
            var surface=new Color32[ShellWidth*ShellHeight];var shadow=new Color32[surface.Length];
            for(int y=0;y<ShellHeight;y++)for(int x=0;x<ShellWidth;x++){
                float down=ShellHeight-1-y,top=Shoulder(x);
                float edge=Mathf.Min(down-top,Mathf.Min(x-4,ShellWidth-5-x));
                float alpha=Mathf.Clamp01(edge+.5f);
                // Narrow worn metal lip, dark recess and a restrained lower reflection.
                float lip=Mathf.Clamp01(1-Mathf.Abs(edge-2)/2.5f);
                float recess=Mathf.Clamp01(1-Mathf.Abs(edge-5)/2);
                float foot=Mathf.Clamp01((down-160)/10);
                int hash=unchecked(x*374761393+y*668265263);hash=unchecked((hash^(hash>>13))*1274126177);
                float grain=((hash&255)/255f-.5f)*.014f;
                float shade=.047f+grain+lip*.13f-recess*.025f+foot*.035f;
                surface[y*ShellWidth+x]=new Color(shade*1.08f,shade*1.04f,shade*.93f,alpha);
                // The same contour casts a soft shadow; no screen-wide opaque strip.
                float shadowEdge=Mathf.Min(down-top+8,Mathf.Min(x,ShellWidth-1-x));
                shadow[y*ShellWidth+x]=new Color(0,0,0,Mathf.Clamp01(shadowEdge/9)*.54f);
            }
            dockShell.SetPixels32(surface);dockShell.Apply(false,true);
            dockShadow.SetPixels32(shadow);dockShadow.Apply(false,true);
        }
        Rect DockStatusRect(NativeHudDockLayout dock,float width)
        {return new Rect(width*.5f-270,dock.VisibleBar.y-30,540,30);}
        void DrawDockFoundation(NativeHudDockLayout dock,float width,float height)
        {
            EnsureDockSurface();var old=GUI.color;
            var body=new Rect(width*.5f-ShellWidth*.5f,height-ShellHeight,ShellWidth,ShellHeight);
            GUI.color=Color.white;GUI.DrawTexture(new Rect(body.x,body.y-2,body.width,body.height+2),dockShadow);
            GUI.DrawTexture(body,dockShell);
            // Exact existing iron surface, constrained inside the shared foundation.
            var ridge=DockStatusRect(dock,width);
            GUI.color=new Color(.38f,.38f,.36f,1);GUI.DrawTextureWithTexCoords(ridge,dockIron,new Rect(0,.40f,1,.13f));
            GUI.color=new Color(.46f,.43f,.36f,.75f);GUI.DrawTexture(new Rect(ridge.x,ridge.y,ridge.width,1),Texture2D.whiteTexture);
            GUI.color=new Color(0,0,0,.65f);GUI.DrawTexture(new Rect(ridge.x,ridge.yMax-2,ridge.width,2),Texture2D.whiteTexture);
            var rail=new Rect(width*.5f-310,height-13,620,10);
            GUI.color=new Color(.4f,.4f,.38f,1);GUI.DrawTextureWithTexCoords(rail,dockIron,new Rect(0,.6f,1,.05f));
            GUI.color=new Color(.30f,.28f,.23f,1);GUI.DrawTexture(new Rect(rail.x,rail.yMax-1,rail.width,1),Texture2D.whiteTexture);
            GUI.color=old;
        }
        void ReleaseDockSurface(){Release(dockShell);Release(dockShadow);dockShell=dockShadow=null;}
    }
}
