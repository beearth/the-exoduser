using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        // web _clampCamToMap (game.html 12023): keep the camera inside the map so no void shows at the edges. The visible half size grows with the boss-fight zoom-out
        // (VW / (2 * zoom)); a map smaller than the view is centred. cx/cy are Unity world units (px / 100, y up).
        void ClampCameraToMap(ref float cx,ref float cy)
        {
            if(Simulation==null||view==null||Map==null)return;
            float mapW,mapH;
            if(Simulation.Stage!=null&&Simulation.Stage.InArena){mapW=BossArenaLayout.Width*BossArenaLayout.TileSize;mapH=BossArenaLayout.Height*BossArenaLayout.TileSize;}
            else{mapW=Map.Data.width*Map.Data.tileSize;mapH=Map.Data.height*Map.Data.tileSize;}
            float halfH=view.orthographicSize*100f,halfW=halfH*view.aspect;
            float px=cx*100f,py=-cy*100f;
            px=mapW<=halfW*2?mapW/2:Mathf.Max(halfW,Mathf.Min(mapW-halfW,px));
            py=mapH<=halfH*2?mapH/2:Mathf.Max(halfH,Mathf.Min(mapH-halfH,py));
            cx=px/100f;cy=-py/100f;
        }
    }
}
