using System;
using System.IO;
using UnityEditor;
using UnityEngine;
using Exoduser.UnityPort;

// PC-MAP3D fast Editor-side render of the world (no Player build):
// Unity.exe -batchmode -projectPath <unity> -executeMethod NativePerspectiveWorldEditor.Render -output <dir>
// Writes start / nomass / altar / collision / ablation variants. The Player capture (--unity-world3d-capture) is the authoritative evidence.
public static class NativePerspectiveWorldEditor
{
    static string Argument(string key) { var a = Environment.GetCommandLineArgs(); var i = Array.IndexOf(a, key); return i >= 0 && i + 1 < a.Length ? a[i + 1] : ""; }

    public static void Render()
    {
        int exit = 2;
        try
        {
            string output = Argument("-output"); Directory.CreateDirectory(output);
            var resource = Resources.Load<TextAsset>("Data/ch1_map");
            var go = new GameObject("NativePerspectiveWorld (editor)");
            var world = go.AddComponent<NativePerspectiveWorld>();
            world.Initialize(JsonUtility.FromJson<MapData>(resource.text));
            world.FlickerFrameOverride = 0f;
            world.SyncPlayer(world.Map.startX, world.Map.startY, 15f, 2, 0);
            world.WorldCamera.enabled = true;
            var start = new Vector2(world.Map.startX, world.Map.startY); var altar = new Vector2(5900f, 3900f);
            var masses = go.transform.Find("NativePerspectiveWorld Root/Masses");
            world.Prime(start); Save(world, Path.Combine(output, "start.png"));
            masses.gameObject.SetActive(false); Save(world, Path.Combine(output, "start-nomass.png")); masses.gameObject.SetActive(true);
            world.SetCalibration(false); Save(world, Path.Combine(output, "start-nocalibration.png")); world.SetCalibration(true);
            world.SetShadows(false); Save(world, Path.Combine(output, "start-noshadow.png")); world.SetShadows(true);
            world.Prime(altar); Save(world, Path.Combine(output, "altar.png"));
            world.SetFieldLights(false); Save(world, Path.Combine(output, "altar-nofieldlight.png")); world.SetFieldLights(true);
            world.SetCollisionOverlay(true);
            world.Prime(start); Save(world, Path.Combine(output, "collision-start.png"));
            world.Prime(altar); Save(world, Path.Combine(output, "collision-altar.png"));
            world.SetCollisionOverlay(false);
            exit = 0;
        }
        catch (Exception e) { Debug.LogException(e); }
        EditorApplication.Exit(exit);
    }

    static void Save(NativePerspectiveWorld world, string path)
    {
        var rt = new RenderTexture(1920, 1080, 24, RenderTextureFormat.ARGB32) { antiAliasing = 1 };
        world.WorldCamera.targetTexture = rt; world.SyncCamera(world.Focus); world.WorldCamera.Render();
        var previous = RenderTexture.active; RenderTexture.active = rt;
        var image = new Texture2D(1920, 1080, TextureFormat.RGB24, false); image.ReadPixels(new Rect(0, 0, 1920, 1080), 0, 0); image.Apply();
        RenderTexture.active = previous; world.WorldCamera.targetTexture = null;
        File.WriteAllBytes(path, image.EncodeToPNG()); UnityEngine.Object.DestroyImmediate(image); rt.Release(); UnityEngine.Object.DestroyImmediate(rt);
    }
}
