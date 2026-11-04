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
        Vector3 d3Camp;GameObject terrainRoot;readonly List<Material> terrainMats=new List<Material>();public int TerrainDetails,TerrainGrass,TerrainShrubs,SkinLayers,D3Pustules,D3Spores;
        // D2: fern/brush removed. Hell-rot scatter (catalog 8 kinds) registers here once the CTO GLBs are imported; empty = no detail.
        static readonly string[] FernNames=new string[0],BrushNames=new string[0];
        public static readonly string[] HellRotGrass={"vein_grass_a","vein_grass_b","root_sprout_a","root_sprout_b"},HellRotShrubs={"bonethorn_bush_a","bonethorn_bush_b"};
        // D3 scatter (catalog heights, prefab height is 1 u): grass <= .40 m, bushes <= .58 m (hero 1.31 m). Same species never twice in a row.
        static readonly string[][] D3Families={new[]{"vein_grass_a","vein_grass_b"},new[]{"root_sprout_a","root_sprout_b"},new[]{"bonethorn_bush_a","bonethorn_bush_b"},new[]{"spore_stalk_a","spore_stalk_b"},new[]{"pustule_cluster_a","pustule_cluster_b"}};
        static readonly float[] D3Heights={.36f,.18f,.53f,.43f,.17f};static readonly float[] D3Weights={.34f,.2f,.2f,.14f,.12f};
        static float H01(string s,int salt){return (Hash(s+salt)%10007)/10007f;}
        void BuildTerrainDress(Transform world,List<Vector2> trees,Func<float,float,bool> walkable)
        {
            if(!TerrainEnabled||terrainRoot!=null)return;
            terrainRoot=new GameObject("A2R Terrain dressing (host + detail + wind)");terrainRoot.transform.SetParent(visuals.transform,false);
            // Terrain host: heightmap sampled from the existing ground. Surface is not drawn (option a): it hosts detail and wind only.
            const int res=257;float min=float.MaxValue,max=float.MinValue;var h=new float[res,res];
            for(int i=0;i<res;i++)for(int j=0;j<res;j++){float y=NativeRemodel3D.GroundY(FieldX0+(FieldX1-FieldX0)*j/(res-1),FieldZ0+(FieldZ1-FieldZ0)*i/(res-1));h[i,j]=y;min=Mathf.Min(min,y);max=Mathf.Max(max,y);}
            float span=Mathf.Max(1,max-min+1);for(int i=0;i<res;i++)for(int j=0;j<res;j++)h[i,j]=(h[i,j]-min)/span;
            var data=new TerrainData();data.heightmapResolution=res;data.size=new Vector3(FieldX1-FieldX0,span,FieldZ1-FieldZ0);data.SetHeights(0,0,h);
            var host=Terrain.CreateTerrainGameObject(data);host.name="A2R detail Terrain host";host.transform.SetParent(terrainRoot.transform,false);host.transform.position=new Vector3(FieldX0,min,FieldZ0);
            var col=host.GetComponent<TerrainCollider>();if(col!=null)Destroy(col);var terrain=host.GetComponent<Terrain>();terrain.drawHeightmap=false;terrain.drawTreesAndFoliage=true;
            // D3: the skin Terrain draws the real floor 6 mm above the ground (below decals at +12 mm, above the soil mesh). The tile painting skips this rectangle.
            SkinLayers=0;var bridge=Vector4.zero;{var bt=world.Find("A2 시작 목교");if(bt!=null){Bounds bb=new Bounds();bool first=true;foreach(var br in bt.GetComponentsInChildren<Renderer>()){if(first){bb=br.bounds;first=false;}else bb.Encapsulate(br.bounds);}if(!first){bb.Expand(.3f);bridge=new Vector4(bb.min.x,bb.min.z,bb.max.x,bb.max.z);}}}
            Shader.SetGlobalVector("_A2RTerrainHole",bridge);
            if(A2RD3.On){host.transform.position=new Vector3(FieldX0,min+.006f,FieldZ0);SkinLayers=A2RTerrainSkin.Apply(terrain,data,FieldX0,FieldZ0,FieldX1-FieldX0,FieldZ1-FieldZ0,(x,z)=>NativeRemodel3D.GroundY(x,z),walkable,bridge,d3Camp);}
            Shader.SetGlobalVector("_A2RTerrainRect",new Vector4(FieldX0,FieldZ0,FieldX1,FieldZ1));Shader.SetGlobalFloat("_A2RTerrainSkin",SkinLayers>0?1f:0f);
            // Detail: clusters near trees (3 m) and field edges (2 m). The open centre stays empty.
            int idx=0;var detail=new GameObject("detail");detail.transform.SetParent(terrainRoot.transform,false);int lastFamily=-1;
            for(float gz=FieldZ0;gz<(A2RD3.On?FieldZ1:FieldZ0);gz+=3f)for(float gx=FieldX0;gx<FieldX1;gx+=3f)
            {
                string key="td"+(idx++);float x=gx+H01(key,1)*3f,z=gz+H01(key,2)*3f;
                if(walkable==null||!walkable(x,z))continue;if(NativeRemodel3D.GroundY(x,z)<-.2f)continue;
                if(!KeepPlantRule(x,z,trees,walkable))continue;if(H01(key,3)>.5f)continue;
                // Cluster family: weighted pick, never the same family as the previous cluster.
                float roll=H01(key,5);int fam=0;float acc=0;for(int f=0;f<D3Weights.Length;f++){acc+=D3Weights[f];if(roll<=acc||f==D3Weights.Length-1){fam=f;break;}}
                if(fam==lastFamily)fam=(fam+1+(int)(H01(key,6)*4))%D3Families.Length;lastFamily=fam;
                bool bush=fam==2;int count=bush?1+(int)(H01(key,4)*2):2+(int)(H01(key,4)*3);int lastVariant=-1;
                for(int n=0;n<count;n++)
                {
                    float a=H01(key,10+n)*6.2832f,r=.4f+.5f*H01(key,20+n);float px=x+Mathf.Cos(a)*r,pz=z+Mathf.Sin(a)*r;if(!walkable(px,pz))continue;
                    // Bushes keep 0.7 m off the walk edge; low plants 0.3 m. Nothing sits on the open combat band (KeepPlantRule needs a blocker within 2 m).
                    float clear=bush?.7f:.3f;bool tight=false;for(int k=0;k<8;k++){float ka=k*Mathf.PI/4;if(!walkable(px+Mathf.Cos(ka)*clear,pz+Mathf.Sin(ka)*clear)){tight=true;break;}}if(tight)continue;
                    int fi=fam;if(fam==0&&H01(key,70+n)<.25f)fi=1;int variant=H01(key,40+n)<.5f?0:1;if(variant==lastVariant)variant=1-variant;lastVariant=variant;
                    string name=D3Families[fi][variant];
                    Record spec;if(!records.TryGetValue(name,out spec))continue;GameObject prefab;if(!prefabs.TryGetValue(name,out prefab)){prefab=Resources.Load<GameObject>(spec.resource);if(prefab==null)continue;prefabs[name]=prefab;}
                    var go=Instantiate(prefab,detail.transform);go.name="detail "+name;float gy=NativeRemodel3D.GroundY(px,pz);
                    go.transform.SetPositionAndRotation(new Vector3(px,gy-.02f,pz),Quaternion.Euler(0,(spec.prepared?180:0)+H01(key,50+n)*360f,0));
                    float ph=D3Heights[fi]*(.9f+.2f*H01(key,60+n));ph=Mathf.Min(ph,fi==2?.58f:.40f);ph=Mathf.Min(ph,1.4f/Mathf.Max(.05f,spec.width));
                    go.transform.localScale=Vector3.one*ph;
                    foreach(var rend in go.GetComponentsInChildren<MeshRenderer>(true))rend.shadowCastingMode=UnityEngine.Rendering.ShadowCastingMode.Off;
                    ApplyFoliageBudget(go);if(fi==2)TerrainShrubs++;else TerrainGrass++;if(fi==3)D3Spores++;if(fi==4)D3Pustules++;TerrainDetails++;
                    foreach(var rend in go.GetComponentsInChildren<MeshRenderer>(true))foreach(var m in rend.sharedMaterials)if(m!=null&&m.HasProperty("_A2R3DWind")&&!terrainMats.Contains(m))terrainMats.Add(m);
                }
            }
            // Wind: Wind Zone for any Unity-side consumers, plus the A2R vertex wind on detail and trees.
            var wz=new GameObject("A2R WindZone").AddComponent<WindZone>();wz.transform.SetParent(terrainRoot.transform,false);wz.transform.rotation=Quaternion.Euler(0,35,0);wz.mode=WindZoneMode.Directional;wz.windMain=.35f;wz.windTurbulence=.25f;wz.windPulseMagnitude=.6f;wz.windPulseFrequency=.12f;
            foreach(var rend in visuals.GetComponentsInChildren<MeshRenderer>(true))foreach(var m in rend.sharedMaterials)if(m!=null&&m.HasProperty("_A2R3DWind")){var v=m.GetVector("_A2R3DWind");if(v.x>.04f&&v.x<.05f&&v.z>.5f)m.SetVector("_A2R3DWind",new Vector4(.08f,v.y,v.z,v.w));}
            Debug.Log("A2R_TERRAIN_READY details="+TerrainDetails+" grass="+TerrainGrass+" shrubs="+TerrainShrubs+" pustules="+D3Pustules+" spores="+D3Spores+" skinLayers="+SkinLayers);
        }
    }
}
