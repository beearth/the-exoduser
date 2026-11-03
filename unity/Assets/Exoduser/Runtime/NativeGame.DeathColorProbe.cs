using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        // Optional GPU calibration only. Identical unlit cards travel through the actual field camera/post stack.
        // They are removed before the normal artwork screenshots; camera/Core/map settings never change.
        GameObject[] CreateDeathColorCards(out Material material)
        {
            material=null;var camera=HudCamera;var shader=Shader.Find("Universal Render Pipeline/Unlit");
            if(camera==null||shader==null)return null;
            material=new Material(shader);material.SetColor("_BaseColor",new Color(.65f,.2f,.2f,1));material.SetFloat("_Cull",0);
            int layer=0;for(int i=0;i<32;i++)if((camera.cullingMask&(1<<i))!=0){layer=i;break;}
            var cards=new GameObject[3];float depth=camera.nearClipPlane+1;
            var lo=camera.ViewportToWorldPoint(new Vector3(0,0,depth));
            var right=camera.ViewportToWorldPoint(new Vector3(.04f,0,depth));var up=camera.ViewportToWorldPoint(new Vector3(0,.04f,depth));
            for(int i=0;i<3;i++){
                var card=GameObject.CreatePrimitive(PrimitiveType.Quad);card.name="QA death colour "+i;card.layer=layer;
                Destroy(card.GetComponent<Collider>());var renderer=card.GetComponent<MeshRenderer>();renderer.sharedMaterial=material;
                renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;
                card.transform.SetParent(camera.transform,false);card.transform.position=camera.ViewportToWorldPoint(new Vector3(.1f+.4f*i,.75f,depth));
                card.transform.rotation=camera.transform.rotation;card.transform.localScale=new Vector3(Vector3.Distance(lo,right),Vector3.Distance(lo,up),1);cards[i]=card;
            }
            return cards;
        }
        IEnumerator DeathColorSample(string output,string name,List<string> files,GameObject[] cards,DeathScreenReceipt receipt,bool after)
        {
            yield return new WaitForEndOfFrame();var camera=HudCamera;var frame=ScreenCapture.CaptureScreenshotAsTexture();
            var saturation=new float[3];var rgb=new int[9];var points=new int[6];
            for(int i=0;i<3;i++){
                var point=camera.WorldToViewportPoint(cards[i].transform.position);var rect=camera.rect;
                int x=Mathf.Clamp(Mathf.RoundToInt((rect.x+point.x*rect.width)*frame.width),0,frame.width-1);
                int y=Mathf.Clamp(Mathf.RoundToInt((rect.y+point.y*rect.height)*frame.height),0,frame.height-1);
                var pixel=frame.GetPixel(x,y);Color.RGBToHSV(pixel,out _,out saturation[i],out _);Color32 bytes=pixel;
                points[i*2]=x;points[i*2+1]=frame.height-1-y;rgb[i*3]=bytes.r;rgb[i*3+1]=bytes.g;rgb[i*3+2]=bytes.b;
            }
            receipt.colorProbeCamera=camera.name+" rect="+camera.rect+" target="+(camera.targetTexture==null?"screen":camera.targetTexture.name);
            receipt.colorProbePoints=points;
            if(after){
                receipt.saturationAfter=saturation;receipt.colorProbeRgbAfter=rgb;
                float min=Mathf.Min(saturation),max=Mathf.Max(saturation);bool reduced=true;
                for(int i=0;i<3;i++)reduced&=receipt.saturationBefore[i]>.2f&&saturation[i]<=receipt.saturationBefore[i]*.4f+.01f;
                receipt.colorProbeUniform=reduced&&max-min<=.05f;
            }else{receipt.saturationBefore=saturation;receipt.colorProbeRgbBefore=rgb;}
            File.WriteAllBytes(Path.Combine(output,name+"_"+Screen.width+"x"+Screen.height+".png"),frame.EncodeToPNG());Destroy(frame);files.Add(name);
        }
    }
}
