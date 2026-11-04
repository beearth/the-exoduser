using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Track D: Terrain host + clustered 3D ground detail + WindZone for the 1-1 north field. Presentation only; --a2r-terrain-off restores r19.
    public sealed partial class A2RProps3D
    {
        public static readonly bool TerrainEnabled=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-terrain-off")<0;
        const float FieldX0=18,FieldX1=52,FieldZ0=-74,FieldZ1=-40;
        public static bool InTerrainField(float x,float z){return x>=FieldX0&&x<=FieldX1&&z>=FieldZ0&&z<=FieldZ1;}
        GameObject terrainRoot;readonly List<Material> terrainMats=new List<Material>();public int TerrainDetails,TerrainGrass,TerrainShrubs;
        // D2: fern/brush removed. Hell-rot scatter (catalog 8 kinds) registers here once the CTO GLBs are imported; empty = no detail.
        static readonly string[] FernNames=new string[0],BrushNames=new string[0];
        public static readonly string[] HellRotGrass={"vein_grass_a","vein_grass_b","root_sprout_a","root_sprout_b"},HellRotShrubs={"bonethorn_bush_a","bonethorn_bush_b"};
        static float H01(string s,int salt){return (Hash(s+salt)%10007)/10007f;}
        void BuildTerrainDress(Transform world,List<Vector2> trees,Func<float,float,bool> walkable)
        {
            if(!TerrainEnabled||terrainRoot!=null)return;
            terrainRoot=new GameObject("A2R Terrain dressing (host + detail + wind)");terrainRoot.transform.SetParent(visuals.transform,false);
            // Terrain host: heightmap sampled from the existing ground. Surface is not drawn (option a): it hosts detail and wind only.
            const int res=129;float min=float.MaxValue,max=float.MinValue;var h=new float[res,res];
            for(int i=0;i<res;i++)for(int j=0;j<res;j++){float y=NativeRemodel3D.GroundY(FieldX0+(FieldX1-FieldX0)*j/(res-1),FieldZ0+(FieldZ1-FieldZ0)*i/(res-1));h[i,j]=y;min=Mathf.Min(min,y);max=Mathf.Max(max,y);}
            float span=Mathf.Max(1,max-min+1);for(int i=0;i<res;i++)for(int j=0;j<res;j++)h[i,j]=(h[i,j]-min)/span;
            var data=new TerrainData();data.heightmapResolution=res;data.size=new Vector3(FieldX1-FieldX0,span,FieldZ1-FieldZ0);data.SetHeights(0,0,h);
            var host=Terrain.CreateTerrainGameObject(data);host.name="A2R detail Terrain host";host.transform.SetParent(terrainRoot.transform,false);host.transform.position=new Vector3(FieldX0,min,FieldZ0);
            var col=host.GetComponent<TerrainCollider>();if(col!=null)Destroy(col);var terrain=host.GetComponent<Terrain>();terrain.drawHeightmap=false;terrain.drawTreesAndFoliage=true;
            // Detail: clusters near trees (3 m) and field edges (2 m). The open centre stays empty.
            int idx=0;var detail=new GameObject("detail");detail.transform.SetParent(terrainRoot.transform,false);
            for(float gz=FieldZ0;gz<FieldZ1;gz+=3f)for(float gx=FieldX0;gx<FieldX1;gx+=3f)
            {
                string key="td"+(idx++);float x=gx+H01(key,1)*3f,z=gz+H01(key,2)*3f;
                if(walkable==null||!walkable(x,z))continue;if(NativeRemodel3D.GroundY(x,z)<-.2f)continue;
                if(!KeepPlantRule(x,z,trees,walkable))continue;if(H01(key,3)>.5f)continue;
                int count=2+(int)(H01(key,4)*3);
                for(int n=0;n<count;n++)
                {
                    float a=H01(key,10+n)*6.2832f,r=.4f+.5f*H01(key,20+n);float px=x+Mathf.Cos(a)*r,pz=z+Mathf.Sin(a)*r;if(!walkable(px,pz))continue;
                    bool grass=H01(key,30+n)<.6f;var pool=grass?HellRotGrass:HellRotShrubs;if(pool.Length==0)continue;string name=pool[(int)(H01(key,40+n)*pool.Length)%pool.Length];
                    Record spec;if(!records.TryGetValue(name,out spec))continue;GameObject prefab;if(!prefabs.TryGetValue(name,out prefab)){prefab=Resources.Load<GameObject>(spec.resource);if(prefab==null)continue;prefabs[name]=prefab;}
                    var go=Instantiate(prefab,detail.transform);go.name="detail "+name;float gy=NativeRemodel3D.GroundY(px,pz);
                    go.transform.SetPositionAndRotation(new Vector3(px,gy-.03f,pz),Quaternion.Euler(0,(spec.prepared?180:0)+H01(key,50+n)*360f,0));
                    go.transform.localScale=grass?FoliageCleanScale(name,spec.width,H01(key,60+n)<.5f?.4f:.5f):FoliageCleanScale(name,spec.width,.42f+.06f*H01(key,60+n));
                    ApplyFoliageBudget(go);if(grass)TerrainGrass++;else TerrainShrubs++;TerrainDetails++;
                    foreach(var rend in go.GetComponentsInChildren<MeshRenderer>(true))foreach(var m in rend.sharedMaterials)if(m!=null&&m.HasProperty("_A2R3DWind")&&!terrainMats.Contains(m))terrainMats.Add(m);
                }
            }
            // Wind: Wind Zone for any Unity-side consumers, plus the A2R vertex wind on detail and trees.
            var wz=new GameObject("A2R WindZone").AddComponent<WindZone>();wz.transform.SetParent(terrainRoot.transform,false);wz.transform.rotation=Quaternion.Euler(0,35,0);wz.mode=WindZoneMode.Directional;wz.windMain=.35f;wz.windTurbulence=.25f;wz.windPulseMagnitude=.6f;wz.windPulseFrequency=.12f;
            foreach(var rend in visuals.GetComponentsInChildren<MeshRenderer>(true))foreach(var m in rend.sharedMaterials)if(m!=null&&m.HasProperty("_A2R3DWind")){var v=m.GetVector("_A2R3DWind");if(v.x>.04f&&v.x<.05f&&v.z>.5f)m.SetVector("_A2R3DWind",new Vector4(.08f,v.y,v.z,v.w));}
            Debug.Log("A2R_TERRAIN_READY details="+TerrainDetails+" grass="+TerrainGrass+" shrubs="+TerrainShrubs);
        }
    }
}
