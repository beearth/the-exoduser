using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // D4: wind diagnostics for the measurement run (vertex colour R/G present, material amplitude, global flags).
    public sealed partial class A2RProps3D
    {
        // D4: close-range props replace the 2D cards at the web anchor. a/b alternate by card id so neighbours differ.
        static string D4Prop(A2RWebAssets.Card c)
        {
            bool b=(Hash(c.id)&1)==1;
            switch(c.kind){case "corpse":return b?"corpse_b":"corpse_a";case "m_fbones":return b?"bone_pile_b":"bone_pile_a";case "m_c1sroot":return b?"flesh_root_b":"flesh_root_a";}
            return null;
        }
        // Never on the walking band: a walkable anchor moves to the nearest blocked point within 3 m, otherwise the card stays. Presentation only.
        static bool D4OffBand(ref float x,ref float z,Func<float,float,bool> walkable)
        {
            if(walkable==null||!walkable(x,z))return true;
            for(float r=.5f;r<=3f;r+=.5f)for(int k=0;k<16;k++){float a=k*Mathf.PI/8;float px=x+Mathf.Cos(a)*r,pz=z+Mathf.Sin(a)*r;if(!walkable(px,pz)&&NativeRemodel3D.GroundY(px,pz)>-.3f){x=px;z=pz;return true;}}
            return false;
        }
        // D4: one value-only wind step (<= 1.5x the map-wind lane values) after the measured run showed < 2 px typical tip motion.
        public static readonly float WindGain=A2RD4.On?1.5f:1f;
        public string WindDiagnostics()
        {
            int meshes=0,withR=0,withG=0;float maxAmp=0,sumAmp=0;int ampN=0;var seen=new HashSet<Mesh>();
            if(terrainRoot!=null)foreach(var f in terrainRoot.GetComponentsInChildren<MeshFilter>(true))
            {
                var m=f.sharedMesh;if(m==null||!seen.Add(m))continue;meshes++;if(!m.isReadable)continue;var c=m.colors;if(c==null||c.Length==0)continue;float r=0,g=0;foreach(var x in c){r=Mathf.Max(r,x.r);g=Mathf.Max(g,x.g);}if(r>.5f)withR++;if(g>.01f)withG++;
            }
            if(terrainRoot!=null)foreach(var rd in terrainRoot.GetComponentsInChildren<MeshRenderer>(true)){var b=new MaterialPropertyBlock();rd.GetPropertyBlock(b);for(int i=0;i<rd.sharedMaterials.Length;i++){var m=rd.sharedMaterials[i];if(m==null||!m.HasProperty("_A2R3DWind"))continue;rd.GetPropertyBlock(b,i);var v=b.isEmpty?m.GetVector("_A2R3DWind"):b.GetVector("_A2R3DWind");if(v.x<=0)v=m.GetVector("_A2R3DWind");maxAmp=Mathf.Max(maxAmp,v.x);sumAmp+=v.x;ampN++;}}
            int off=0,total=0;var sample=new System.Text.StringBuilder();if(terrainRoot!=null)foreach(var rd in terrainRoot.GetComponentsInChildren<MeshRenderer>(true)){var mf=rd.GetComponent<MeshFilter>();float rmax=0;if(mf!=null&&mf.sharedMesh!=null&&mf.sharedMesh.isReadable)foreach(var cc in mf.sharedMesh.colors)rmax=Mathf.Max(rmax,cc.r);var mats=rd.sharedMaterials;for(int i=0;i<mats.Length;i++){var m=mats[i];if(m==null)continue;total++;var blk=new MaterialPropertyBlock();rd.GetPropertyBlock(blk,i);var v=m.HasProperty("_A2R3DWind")?m.GetVector("_A2R3DWind"):Vector4.zero;if(!blk.isEmpty&&blk.HasVector("_A2R3DWind"))v=blk.GetVector("_A2R3DWind");bool dead=v.x<.01f||rmax<.5f||!m.HasProperty("_A2R3DWind");if(dead){off++;if(sample.Length<900)sample.Append(" ["+rd.transform.parent.name+" shader="+m.shader.name+" amp="+v.x.ToString("F3")+" Rmax="+rmax.ToString("F2")+" prop="+m.HasProperty("_A2R3DWind")+"]");}}}
            Debug.Log("[A2R_D4_WIND_DIAG] materialSlots="+total+" deadWind="+off+sample);
            return "uniqueMeshes="+meshes+" withVertexR="+withR+" withVertexG="+withG+" detailAmpMax="+maxAmp.ToString("F3")+" detailAmpMean="+(ampN>0?sumAmp/ampN:0).ToString("F3")+" windOn="+Shader.GetGlobalFloat("_A2R3DWindOn")+" windOff="+Shader.GetGlobalFloat("_A2RWindOff")+" details="+TerrainDetails;
        }
    }
}
