using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        void HellGroundSetup(Terrain ground)
        {
            var td=Instantiate(ground.terrainData);ground.terrainData=td;var layers=td.terrainLayers;
            if(layers.Length<3)return;
            string[] names={"rock_ground","burned_ground_01"};
            for(int i=0;i<2;i++)
            {
                var layer=new TerrainLayer();string res="Art/map/hell_lighting/"+names[i];
                layer.diffuseTexture=Resources.Load<Texture2D>(res+"_Diffuse");layer.normalMapTexture=Resources.Load<Texture2D>(res+"_nor_gl");layer.maskMapTexture=Resources.Load<Texture2D>(res+"_Rough");
                layer.tileSize=Vector2.one*(i==0?3f:4f);layer.normalScale=i==0?.75f:.45f;layer.metallic=0;
                layer.diffuseRemapMax=new Vector4(.48f,.49f,.5f,1);
                layer.maskMapRemapMin=new Vector4(0,1,0,i==0?.72f:.28f);layer.maskMapRemapMax=new Vector4(0,1,1,i==0?.12f:.05f);
                layers[i+1]=layer;
            }
            td.terrainLayers=layers;
            var alpha=td.GetAlphamaps(0,0,td.alphamapWidth,td.alphamapHeight);
            for(int y=0;y<td.alphamapHeight;y++)for(int x=0;x<td.alphamapWidth;x++)
            {
                float wx=ground.transform.position.x+td.size.x*x/(td.alphamapWidth-1f),wz=ground.transform.position.z+td.size.z*y/(td.alphamapHeight-1f);
                float sweep=Mathf.SmoothStep(0,1,(Mathf.Sin(wx*.7f+wz*.29f)+Mathf.Sin(wz*.51f-wx*.17f)+2)*.25f);
                float rock=.18f+.42f*sweep,ash=.12f+.23f*(1-sweep);
                alpha[y,x,0]=1-rock-ash;alpha[y,x,1]=rock;alpha[y,x,2]=ash;for(int i=3;i<td.alphamapLayers;i++)alpha[y,x,i]=0;
            }
            td.SetAlphamaps(0,0,alpha);
        }
    }
}
