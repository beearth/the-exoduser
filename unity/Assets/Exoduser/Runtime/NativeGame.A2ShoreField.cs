using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        void A2ShoreField()
        {
            if(!SystemInfo.SupportsTextureFormat(TextureFormat.RFloat))
            {Debug.LogWarning("[A2] 수면 거리장 RFloat 미지원. 기존 깊이 거품 유지");return;}
            const int size=512;var data=new float[size*size];
            for(int y=0;y<size;y++)for(int x=0;x<size;x++)
            {
                float wx=-30+(x+.5f)/size*140,wz=-100+(y+.5f)/size*170;
                float slope=(A2ForestLayout.Shore(wz+.05f)-A2ForestLayout.Shore(wz-.05f))/.1f;
                float shore=(wx-A2ForestLayout.Shore(wz))/Mathf.Sqrt(1+slope*slope);
                float wet=Mathf.Max(shore,-A2ForestLayout.BranchDistance(wx,wz));
                wet=Mathf.Min(wet,Mathf.Min(wz+94,-30-wz));
                float dx=wx-A2ForestLayout.IslandX,dz=wz-A2ForestLayout.IslandZ;
                wet=Mathf.Min(wet,Mathf.Sqrt(dx*dx+dz*dz)-A2ForestLayout.IslandRadius(Mathf.Atan2(dz,dx)));
                data[y*size+x]=wet;
            }
            var texture=new Texture2D(size,size,TextureFormat.RFloat,false,true){name="A2 실제 수로 접촉거리장",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            texture.SetPixelData(data,0);texture.Apply(false,true);
            a2Water.SetTexture("_ShoreField",texture);a2Water.SetVector("_ShoreBounds",new Vector4(-30,-100,140,170));a2Water.SetFloat("_ShoreReady",1);
            Debug.Log("[A2] 수로 SSOT 접촉거리장512x512/원본맵·보행변경0");
        }
    }
}
