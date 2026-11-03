using System;
using System.Collections;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        IEnumerator A2RNearestProbe()
        {
            // Excluding the only visible foreground may legitimately leave a clear depth RT.
            // Prove the live main-camera path with a known small presentation surface instead of
            // treating off-screen bounds as proof of visible fragments. Never touches the Core.
            yield return A2RNatureSize(1920);var go=GameObject.CreatePrimitive(PrimitiveType.Quad);go.name="A2R QA known interior occluder";Destroy(go.GetComponent<Collider>());
            var position=NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y)+Vector3.up*.65f-r3Cam.transform.forward*.65f;go.transform.SetPositionAndRotation(position,r3Cam.transform.rotation);go.transform.localScale=new Vector3(.35f,.6f,1);
            var body=go.GetComponent<MeshRenderer>();var opaque=new Material(Resources.Load<Shader>("A2R/LitOpaque"));opaque.SetColor("_BaseColor",new Color(.16f,.10f,.05f,1));body.sharedMaterial=opaque;
            var companion=new GameObject("A2R QA known surface faded portion");companion.transform.SetParent(go.transform,false);companion.AddComponent<MeshFilter>().sharedMesh=go.GetComponent<MeshFilter>().sharedMesh;var fade=companion.AddComponent<MeshRenderer>();var faded=new Material(Resources.Load<Shader>("A2R/LitFade"));faded.CopyPropertiesFromMaterial(opaque);fade.sharedMaterial=faded;
            a2rOcclusion.Register(body,fade,true,true);yield return new WaitForSecondsRealtime(.4f);yield return A2RPlayShot("diag-nearest-known-surface");a2rPlay.nearestProbeCoveredPixels=a2rOcclusion.NearestCoveredPixels();if(a2rPlay.nearestProbeCoveredPixels<8)a2rPlay.failures.Add("Known visible occluder main-camera GPU probe empty");
            Destroy(go);Destroy(opaque);Destroy(faded);yield return null;yield return new WaitForSecondsRealtime(.25f);
        }
        IEnumerator A2RSurfaceDiagnostic()
        {
            // Same pose/time, one changed contribution per pair. This is supplementary visual QA.
            bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;float scale=Time.timeScale;Time.timeScale=0;
            try{
                yield return A2RNatureSize(3840);A2RContact.DiagnosticLegacy=true;yield return A2RPlayShot("diag-contact-legacy-3840");
                A2RContact.DiagnosticLegacy=false;yield return A2RPlayShot("diag-contact-dark-3840");
                yield return A2RNatureSize(1920);a2rLighting.Readability.CaptureFootLightOff=true;yield return A2RPlayShot("diag-foot-light-off-1920");
                a2rLighting.Readability.CaptureFootLightOff=false;yield return A2RPlayShot("diag-foot-light-on-1920");
            }finally{A2RContact.DiagnosticLegacy=false;a2rLighting.Readability.CaptureFootLightOff=false;Time.timeScale=scale;Simulation.Config.EnemyAiEnabled=ai;}
        }
        void A2RCompositionWrite(string id){if(a2rOcclusion!=null&&a2rOcclusion.CompositionReport!=null)File.WriteAllText(Path.Combine(a2rPlayOutput,id+"-composition.json"),JsonUtility.ToJson(a2rOcclusion.CompositionReport,true));}
    }
}
