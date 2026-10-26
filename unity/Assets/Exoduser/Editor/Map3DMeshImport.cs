using UnityEditor;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // PC-MAP3D M1 preparation: import settings for external 3D kit models (Meshy FBX / OBJ) dropped under
    //   Assets/Exoduser/Resources/Art/map3d/meshy/<assetId>/
    // Applies ONLY there (the procedural OBJ in Art/map3d/mesh and every other model keep their own settings).
    //  - no material import (the runtime builds Look3DProp materials from the manifest maps), no colliders (the 2D simulation owns collision),
    //    no animation / cameras / lights / blend shapes, not readable, normals from the file (calculated if missing), tangents Mikktspace for the normal map;
    //  - scale and axis: the runtime normalises by the model's own bounds to the manifest target (1 unit = 1 px, pivot bottom centre), so no unit convention of
    //    the file is assumed; axis conversion is baked into the mesh (bakeAxisConversion) so Y-up GLB-derived FBX arrive upright. The yaw offset per format
    //    (obj 180, fbx 0) is a manifest default to be verified with the first real Meshy asset.
    public sealed class Map3DMeshImport : AssetPostprocessor
    {
        public const string Folder = "Assets/Exoduser/Resources/Art/map3d/meshy/";

        static bool Applies(string path)
        {
            string lower = path.ToLowerInvariant();
            return path.StartsWith(Folder) && (lower.EndsWith(".fbx") || lower.EndsWith(".obj"));
        }

        void OnPreprocessModel()
        {
            if (!Applies(assetPath)) return;
            var importer = (ModelImporter)assetImporter;
            importer.materialImportMode = ModelImporterMaterialImportMode.None;
            importer.addCollider = false;
            importer.isReadable = false;
            importer.importAnimation = false; importer.animationType = ModelImporterAnimationType.None;
            importer.importCameras = false; importer.importLights = false; importer.importBlendShapes = false; importer.importVisibility = false;
            importer.importNormals = ModelImporterNormals.Import;
            importer.importTangents = ModelImporterTangents.CalculateMikk;
            importer.meshCompression = ModelImporterMeshCompression.Off;
            importer.optimizeMeshPolygons = true; importer.optimizeMeshVertices = true;
            importer.weldVertices = true;
            importer.generateSecondaryUV = false;
            importer.bakeAxisConversion = true;
            importer.indexFormat = ModelImporterIndexFormat.Auto;
        }
    }
}
