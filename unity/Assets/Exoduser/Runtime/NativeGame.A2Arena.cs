using UnityEngine;
using UnityEngine.Rendering;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        GameObject a2ArenaRoot;
        readonly System.Collections.Generic.List<SpriteRenderer> a2ArenaFlames=new System.Collections.Generic.List<SpriteRenderer>();
        void A2ArenaSetup(BossArenaLayout arena)
        {
            if(!A2Requested||arena==null)return;
            if(a2ArenaRoot!=null)Destroy(a2ArenaRoot);a2ArenaFlames.Clear();
            a2ArenaRoot=new GameObject("A2 보스방 조명·낮은 외곽 장식");a2ArenaRoot.transform.SetParent(hellArenaRig.transform,false);
            var center=new Vector2((arena.RoomCx+.5f)*.4f,-(arena.RoomCy+.5f)*.4f);
            // 실제 Player에서 검은 파편으로 보인 낮은 암반은 제거한다. 원래 아레나 경계와 전투는 그대로다.
            foreach(int side in new[]{-1,1})
            {
                float x=center.x+side*6,y=center.y+side*2.5f;
                A2ArenaModule("Art/map/a2/r3/Models/RF3_Bridge_Torch_Holder",x,y,.45f,.45f,.45f,0,-52);
                if(hellFlameFrames==null)continue;
                var go=new GameObject("A2 보스방 횃불 불꽃");go.transform.SetParent(a2ArenaRoot.transform,false);go.transform.position=new Vector3(x,y+.7f,-1);
                var sr=go.AddComponent<SpriteRenderer>();sr.sprite=hellFlameFrames[0];sr.color=new Color(1.8f,1.15f,.65f,1);sr.sortingOrder=100;go.transform.localScale=Vector3.one*.12f;a2ArenaFlames.Add(sr);
            }
            for(int i=0;i<Mathf.Min(2,hellArenaLights.Count);i++)
            {float side=i==0?-1:1;hellArenaLights[i].transform.position=new Vector3(center.x+side*6,center.y+side*2.5f,-1.3f);}
        }
        void A2ArenaModule(string resource,float x,float y,float sx,float sy,float sz,float yaw,float pitch=-90)
        {
            var source=Resources.Load<GameObject>(resource);if(source==null){Debug.LogError("[A2 보스방] 소품 누락 "+resource);return;}
            var go=Instantiate(source,a2ArenaRoot.transform);go.name="A2 보스방 낮은 소품";go.transform.SetPositionAndRotation(new Vector3(x,y,-.02f),Quaternion.Euler(pitch,0,0)*Quaternion.Euler(0,yaw,0));go.transform.localScale=new Vector3(sx,sy,sz);
            foreach(var renderer in go.GetComponentsInChildren<MeshRenderer>()){renderer.shadowCastingMode=ShadowCastingMode.On;renderer.receiveShadows=true;}
            var shadow=new GameObject("A2 보스방 소품 접지음영");shadow.transform.SetParent(a2ArenaRoot.transform,false);shadow.transform.position=new Vector3(x,y,0);shadow.transform.localScale=new Vector3(sx*1.5f,sz*.6f,1);var sr=shadow.AddComponent<SpriteRenderer>();sr.sprite=DiscSprite();sr.color=new Color(.01f,.012f,.014f,.3f);sr.sortingOrder=-20000;
        }
        void A2ArenaFlameLate()
        {for(int i=0;i<a2ArenaFlames.Count;i++)if(a2ArenaFlames[i]!=null&&hellFlameFrames!=null)a2ArenaFlames[i].sprite=hellFlameFrames[((int)(Time.time*12)+i*3)%8];}
    }
}
