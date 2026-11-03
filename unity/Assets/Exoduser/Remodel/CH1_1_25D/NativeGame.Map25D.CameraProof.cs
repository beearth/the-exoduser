using System;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class Map25DCameraProof
        {
            public string scope="Actual presentation camera versus approved plan; Core camera code unchanged";
            public float worldX,worldY,planYaw=0,planPitch=50,planFov=35,planDistance=35;
            public float actualYaw,actualPitch,actualFov,actualDistance,lookAhead,lookSide;
            public int width,height;public bool orthographic,matchesPlan;public Vector3 position,focus;
        }
        void WriteMap25DCameraProof(string path,float x,float y)
        {
            if(r3Cam==null||map25D==null)return;var recipe=map25D.Recipe;
            var focus=new Vector3(x/100+recipe.lookSide,0,-y/100+recipe.lookAhead);
            var r=new Map25DCameraProof{worldX=x,worldY=y,actualYaw=r3Cam.transform.eulerAngles.y,actualPitch=r3Cam.transform.eulerAngles.x,actualFov=r3Cam.fieldOfView,actualDistance=Vector3.Distance(r3Cam.transform.position,focus),lookAhead=recipe.lookAhead,lookSide=recipe.lookSide,width=Screen.width,height=Screen.height,orthographic=r3Cam.orthographic,position=r3Cam.transform.position,focus=focus};
            r.matchesPlan=!r.orthographic&&Mathf.Abs(Mathf.DeltaAngle(0,r.actualYaw))<.001f&&Mathf.Abs(r.actualPitch-50)<.001f&&Mathf.Abs(r.actualFov-35)<.001f&&Mathf.Abs(r.actualDistance-35)<.001f;
            File.WriteAllText(path,JsonUtility.ToJson(r,true));
        }
    }
}
