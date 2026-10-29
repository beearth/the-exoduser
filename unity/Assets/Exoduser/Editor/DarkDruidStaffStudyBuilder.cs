using System;
using System.IO;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser
{
    // Independent geometry review. This does not attach the staff to a boss or arena.
    public static class DarkDruidStaffStudyBuilder
    {
        const string V1Obj = "Assets/Exoduser/Remodel/Boss/DarkDruid/Studies/dark_druid_staff_v1.obj";
        const string V2Obj = "Assets/Exoduser/Remodel/Boss/DarkDruid/Studies/dark_druid_staff_v2.obj";
        const string BarkTexture = "Assets/Exoduser/Remodel/Boss/DarkDruid/Source/Druid_BaseColor.jpg";
        const string V1Output = @"I:\EXODUSER-Storage\boss\sculpt-20261029\unity-staff-review";
        const string V2Output = @"I:\EXODUSER-Storage\boss\sculpt-20261029\unity-staff-v2-review";

        public static void Capture()
        {
            CaptureStudy(V1Obj, V1Output, false);
        }

        public static void CaptureV2()
        {
            CaptureStudy(V2Obj, V2Output, true);
        }

        static void CaptureStudy(string obj, string output, bool useBarkTexture)
        {
            AssetDatabase.ImportAsset(obj, ImportAssetOptions.ForceSynchronousImport);
            var model = AssetDatabase.LoadAssetAtPath<GameObject>(obj);
            if (model == null) throw new InvalidOperationException("Staff OBJ import failed");
            var instance = UnityEngine.Object.Instantiate(model);
            instance.name = "DarkDruid_Staff_Study_Only";
            var renderers = instance.GetComponentsInChildren<MeshRenderer>();
            if (renderers.Length == 0) throw new InvalidOperationException("Staff has no mesh renderer");
            var colors = useBarkTexture
                ? new[] { "#F3E9D7", "#E9D8BE", "#4B2A1F", "#26221B", "#B6A57E", "#333A16", "#272A12" }
                : new[] { "#45392B", "#755B3F", "#4B2A1F", "#26221B", "#B6A57E", "#474C25" };
            var names = useBarkTexture
                ? new[] { "charred_root", "raised_bark", "leather", "recess", "bone", "orb", "orb_vein" }
                : new[] { "charred_root", "raised_bark", "leather", "recess", "bone", "orb" };
            var mats = new Material[colors.Length];
            var shader = Shader.Find("Universal Render Pipeline/Lit");
            if (shader == null) throw new InvalidOperationException("URP Lit missing");
            var bark = useBarkTexture ? AssetDatabase.LoadAssetAtPath<Texture2D>(BarkTexture) : null;
            if (useBarkTexture && bark == null) throw new InvalidOperationException("Existing bark atlas missing");
            for (int i = 0; i < mats.Length; i++)
            {
                mats[i] = new Material(shader) { name = "Study_" + i };
                ColorUtility.TryParseHtmlString(colors[i], out var c);
                mats[i].SetColor("_BaseColor", c);
                mats[i].SetFloat("_Smoothness", i == 5 ? 0.42f : 0.17f);
                if (useBarkTexture && i < 2) mats[i].SetTexture("_BaseMap", bark);
                if (i == 5)
                {
                    mats[i].EnableKeyword("_EMISSION");
                    ColorUtility.TryParseHtmlString("#9EA83A", out var glow);
                    mats[i].SetColor("_EmissionColor", glow);
                }
            }
            var totalSubmeshes = 0;
            foreach (var r in renderers)
            {
                var filter = r.GetComponent<MeshFilter>();
                var count = filter != null && filter.sharedMesh != null ? filter.sharedMesh.subMeshCount : 0;
                totalSubmeshes += count;
                var assigned = new Material[count];
                var imported = r.sharedMaterials;
                for (int i = 0; i < count; i++)
                {
                    var sourceName = i < imported.Length && imported[i] != null ? imported[i].name : "";
                    var materialIndex = Array.FindIndex(names, n =>
                        sourceName.IndexOf(n, StringComparison.OrdinalIgnoreCase) >= 0 &&
                        (n != "orb" || sourceName.IndexOf("orb_vein", StringComparison.OrdinalIgnoreCase) < 0));
                    if (materialIndex < 0)
                        throw new InvalidOperationException("Unrecognized OBJ material: " + sourceName);
                    assigned[i] = mats[materialIndex];
                }
                r.sharedMaterials = assigned;
            }
            Debug.Log($"[DruidStaffStudy] renderers={renderers.Length} submeshes={totalSubmeshes}");
            Directory.CreateDirectory(output);
            var lightObject = new GameObject("StaffStudy_KeyLight");
            var light = lightObject.AddComponent<Light>();
            light.type = LightType.Directional; light.intensity = 2.5f;
            lightObject.transform.rotation = useBarkTexture
                ? Quaternion.Euler(48, 145, 0)
                : Quaternion.Euler(48, -34, 0);
            var cameraObject = new GameObject("StaffStudy_Camera");
            var camera = cameraObject.AddComponent<Camera>();
            camera.backgroundColor = new Color(.075f, .072f, .067f);
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.orthographic = true; camera.orthographicSize = 1.46f;
            camera.nearClipPlane = .01f; camera.farClipPlane = 100f;
            var target = new Vector3(0, 1.15f, 0);
            try
            {
                CaptureView(camera, target + new Vector3(0, 0, 5), target, "front", output);
                CaptureView(camera, target + new Vector3(2.3f, 4.1f, 3.3f), target, "game55", output);
                if (useBarkTexture)
                {
                    camera.orthographicSize = .34f;
                    var cageTarget = new Vector3(.03f, 2.08f, 0);
                    CaptureView(camera, cageTarget + new Vector3(0, .35f, 3), cageTarget, "cage_detail", output);
                }
            }
            finally
            {
                camera.targetTexture = null;
                UnityEngine.Object.DestroyImmediate(cameraObject);
                UnityEngine.Object.DestroyImmediate(lightObject);
                UnityEngine.Object.DestroyImmediate(instance);
                foreach (var mat in mats) UnityEngine.Object.DestroyImmediate(mat);
            }
        }

        static void CaptureView(Camera camera, Vector3 position, Vector3 target, string name, string output)
        {
            camera.transform.position = position;
            camera.transform.LookAt(target);
            var rt = new RenderTexture(1600, 900, 24, RenderTextureFormat.ARGB32);
            camera.targetTexture = rt;
            camera.Render();
            RenderTexture.active = rt;
            var image = new Texture2D(1600, 900, TextureFormat.RGB24, false);
            image.ReadPixels(new Rect(0, 0, 1600, 900), 0, 0);
            image.Apply();
            File.WriteAllBytes(Path.Combine(output, name + ".png"), image.EncodeToPNG());
            RenderTexture.active = null;
            camera.targetTexture = null;
            UnityEngine.Object.DestroyImmediate(image);
            UnityEngine.Object.DestroyImmediate(rt);
        }
    }
}
