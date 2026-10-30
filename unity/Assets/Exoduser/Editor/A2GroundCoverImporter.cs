using UnityEditor;

// 실제 Player에서 지면 높이에 맞추는 여섯 메시만 CPU 정점 읽기를 유지한다.
public sealed class A2GroundCoverImporter : AssetPostprocessor
{
    public override uint GetVersion() { return 3; }
    void OnPreprocessModel()
    {
        if(assetPath=="Assets/Exoduser/Resources/Art/map/a2/roots/Models/A2_PineRoots_A.fbx" ||
           assetPath=="Assets/Exoduser/Resources/Art/map/a2/roots/Models/A2_PineRoots_B.fbx" ||
           assetPath=="Assets/Exoduser/Resources/Art/map/a2/r3/Models/RF3_Dead_Leaf_Litter.fbx" ||
           assetPath=="Assets/Exoduser/Resources/Art/map/a2/stump/Models/A2_Scanned_Stump.fbx" ||
           assetPath=="Assets/Exoduser/Resources/Art/map/a2/hollow/Models/A2_Hollow_Loft_Tree.fbx" ||
           assetPath=="Assets/Exoduser/Resources/Art/map/a2/rootrelief/Models/A2_Root_Cluster_Patch.fbx")
            ((ModelImporter)assetImporter).isReadable=true;
    }
}
