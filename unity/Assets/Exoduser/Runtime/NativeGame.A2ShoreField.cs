using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        void A2ShoreField()
        {
            if(!SystemInfo.SupportsTextureFormat(TextureFormat.RFloat))
            {Debug.LogWarning("[A2] 수면 거리장 RFloat 미지원. 기존 깊이 거품 유지");return;}
            if(a2Field!=null){A2FullFieldShore();return;}
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
        void A2FullFieldShore()
        {
            const int n=1024;const float size=A2FieldLayout.GroundMaxX-A2FieldLayout.GroundMinX,step=size/n;var distance=new float[n*n];
            for(int y=0;y<n;y++)for(int x=0;x<n;x++)distance[y*n+x]=a2Field.Water(A2FieldLayout.GroundMinX+(x+.5f)*step,A2FieldLayout.GroundMinZ+(y+.5f)*step)?10000:0;
            for(int pass=0;pass<2;pass++)
            {
                int begin=pass==0?0:n-1,end=pass==0?n:-1,dir=pass==0?1:-1;
                for(int y=begin;y!=end;y+=dir)for(int x=begin;x!=end;x+=dir)
                {
                    int i=y*n+x;float d=distance[i];
                    if(x-dir>=0&&x-dir<n)d=Mathf.Min(d,distance[i-dir]+step);
                    if(y-dir>=0&&y-dir<n)
                    {
                        d=Mathf.Min(d,distance[i-dir*n]+step);
                        if(x-dir>=0&&x-dir<n)d=Mathf.Min(d,distance[i-dir*n-dir]+step*1.41421356f);
                        if(x+dir>=0&&x+dir<n)d=Mathf.Min(d,distance[i-dir*n+dir]+step*1.41421356f);
                    }
                    distance[i]=d;
                }
            }
            var texture=new Texture2D(n,n,TextureFormat.RFloat,false,true){name="A2 전체 실제 지면 물가 거리장",wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            texture.SetPixelData(distance,0);texture.Apply(false,true);
            a2Water.SetTexture("_ShoreField",texture);a2Water.SetVector("_ShoreBounds",new Vector4(A2FieldLayout.GroundMinX,A2FieldLayout.GroundMinZ,size,size));a2Water.SetFloat("_ShoreReady",1);
            Debug.Log("[A2 필드] 실제 지면·수면 물가1024x1024/원본 XY 경계 불변");
        }
    }
}
