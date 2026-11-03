using System;
using System.Collections;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
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
