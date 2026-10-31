using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        Mesh a2EnemyShadowMesh;
        GameObject a2EnemyShadowRoot;
        readonly List<Vector3> a2EnemyShadowVertices=new List<Vector3>();
        readonly List<Vector2> a2EnemyShadowUV=new List<Vector2>();
        readonly List<int> a2EnemyShadowIndices=new List<int>();
        int a2TargetEnemy=-1;
        void A2EnemyGrounding()
        {
            if(a2Field==null||!NativeRemodel3D.Active)return;
            if(a2EnemyShadowRoot==null)
            {
                a2EnemyShadowRoot=new GameObject("A2 적 접지 그림자");a2EnemyShadowRoot.transform.SetParent(transform,false);
                a2EnemyShadowMesh=new Mesh{name="적 발밑 접촉 그림자"};a2EnemyShadowMesh.MarkDynamic();
                a2EnemyShadowRoot.AddComponent<MeshFilter>().sharedMesh=a2EnemyShadowMesh;
                var r=a2EnemyShadowRoot.AddComponent<MeshRenderer>();r.sharedMaterial=new Material(Shader.Find("EXODUSER/A2ContactShadow"));r.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;
            }
            a2EnemyShadowVertices.Clear();a2EnemyShadowUV.Clear();a2EnemyShadowIndices.Clear();
            var aim=AimWorld();float nearest=85*85;a2TargetEnemy=-1;
            foreach(var e in Simulation.Enemies)
            {
                if(!e.Alive||e.IsBoss||!enemies.TryGetValue(e.Id,out var ev))continue;
                float target=(e.X-aim.x*100)*(e.X-aim.x*100)+(e.Y+aim.y*100)*(e.Y+aim.y*100);
                if(target<nearest){nearest=target;a2TargetEnemy=e.Id;}
                var vp=r3Cam.WorldToViewportPoint(Point(e.X,e.Y));if(vp.z<=0||vp.x<-.1f||vp.x>1.1f||vp.y<-.1f||vp.y>1.1f)continue;
                float radius=Mathf.Clamp(e.Radius*.012f,.16f,.48f),x=e.X/100,z=-e.Y/100;
                int n=a2EnemyShadowVertices.Count;
                foreach(var q in new[]{new Vector2(-radius,-radius*.65f),new Vector2(radius,-radius*.65f),new Vector2(-radius,radius*.65f),new Vector2(radius,radius*.65f)})
                    a2EnemyShadowVertices.Add(new Vector3(x+q.x,a2Field.Height(x+q.x,z+q.y)+.015f,z+q.y));
                a2EnemyShadowUV.Add(Vector2.zero);a2EnemyShadowUV.Add(Vector2.right);a2EnemyShadowUV.Add(Vector2.up);a2EnemyShadowUV.Add(Vector2.one);
                a2EnemyShadowIndices.Add(n);a2EnemyShadowIndices.Add(n+2);a2EnemyShadowIndices.Add(n+1);a2EnemyShadowIndices.Add(n+1);a2EnemyShadowIndices.Add(n+2);a2EnemyShadowIndices.Add(n+3);
            }
            a2EnemyShadowMesh.Clear();a2EnemyShadowMesh.SetVertices(a2EnemyShadowVertices);a2EnemyShadowMesh.SetUVs(0,a2EnemyShadowUV);a2EnemyShadowMesh.SetTriangles(a2EnemyShadowIndices,0);a2EnemyShadowMesh.RecalculateBounds();
        }
        void A2DrawEnemyStatus(EnemyState e)
        {
            bool damaged=e.Hp<e.MaxHp||e.MaxShield>0&&e.Shield<e.MaxShield;
            if(!A2FieldLayout.ShowEnemyStatus(e.Alive,e.IsBoss,damaged,e.Id==a2TargetEnemy)||!enemies.TryGetValue(e.Id,out var ev))return;
            var sr=ev.walk.enabled?ev.walk:ev.body;if(sr.sprite==null)return;
            var top=sr.transform.TransformPoint(new Vector3(0,NativeEnemyFootprint.Top(sr.sprite),0));
            var screen=HudCamera.WorldToScreenPoint(top);if(screen.z<=0)return;
            float x=screen.x*1920/Screen.width,y=(Screen.height-screen.y)*1080/Screen.height-12;
            float width=42f*1920/Screen.width,pixelX=1920f/Screen.width;
            Fill(new Rect(x-width/2-pixelX,y-1,width+2*pixelX,8),new Color(.015f,.018f,.018f,.88f));
            Fill(new Rect(x-width/2,y,width,3),new Color(.18f,.07f,.065f));
            Fill(new Rect(x-width/2,y,width*Mathf.Clamp01((float)e.Hp/Mathf.Max(1,e.MaxHp)),3),new Color(.66f,.16f,.10f));
            if(e.MaxShield>0)Fill(new Rect(x-width/2,y+4,width*Mathf.Clamp01(e.Shield/e.MaxShield),2),new Color(.29f,.51f,.62f));
        }
    }
}
