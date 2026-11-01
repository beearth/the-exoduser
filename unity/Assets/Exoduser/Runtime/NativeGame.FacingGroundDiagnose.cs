using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // QA-only same-state GPU comparison, with no changes to product art or tuning.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class FgDiagPoint { public string name,capture; public float x,z,gradient,fieldY,terrainY,maxVertexError; }
        [Serializable] sealed class FgDiagReceipt
        {
            public string scope="QA-only direct GPU RT; no HUD; c336-equivalent sprite is a renderer-path simulation in the same app",error,shader;
            public int screenWidth,screenHeight,renderQueue,sortingOrder,depthTest,meshVertices,meshTriangles,textureWidth,textureHeight;
            public float flat,spriteAlpha,vertexAlpha,uvMinX,uvMinY,uvMaxX,uvMaxY,worldX,worldY,worldZ;
            public bool meshActive,materialSame,textureSame,sourceInitiallyHidden,meshInitiallyEnabled;
            public List<FgDiagPoint> slopePoints=new List<FgDiagPoint>();
        }
        void FgDirect(string output,string name,int width,int height)
        {
            var camera=r3Cam;var target=camera.targetTexture;var active=RenderTexture.active;
            var rt=RenderTexture.GetTemporary(width,height,24,RenderTextureFormat.ARGB32);Texture2D pixels=null;
            try {
                camera.targetTexture=rt;
                RenderPipeline.SubmitRenderRequest(camera,new UniversalRenderPipeline.SingleCameraRequest{destination=rt});
                RenderTexture.active=rt;pixels=new Texture2D(width,height,TextureFormat.RGBA32,false);
                pixels.ReadPixels(new Rect(0,0,width,height),0,0);pixels.Apply();
                File.WriteAllBytes(Path.Combine(output,name+"-direct-world-"+width+"x"+height+".png"),pixels.EncodeToPNG());
            } finally {camera.targetTexture=target;RenderTexture.active=active;RenderTexture.ReleaseTemporary(rt);if(pixels!=null)Destroy(pixels);}
        }
        void FgMode(SpriteRenderer source,MeshRenderer mesh,LineRenderer[] rings,string mode)
        {
            Remodel3DRestoreBillboards();source.enabled=mode=="sprite";mesh.enabled=mode=="mesh";
            foreach(var ring in rings)ring.enabled=mode!="off";
            Remodel3DBillboards();
        }
        IEnumerator FacingGroundDiagnose(string output,Vector2 holy,PlayerState player,Simulation sim)
        {
            var row=new FgDiagReceipt{screenWidth=Screen.width,screenHeight=Screen.height};
            SpriteRenderer source=null;MeshRenderer mesh=null;var rings=new List<LineRenderer>();
            foreach(var item in FindObjectsByType<SpriteRenderer>())if(item.name=="dome")source=item;
            foreach(var item in FindObjectsByType<MeshRenderer>())if(item.name=="Ground skill surface")mesh=item;
            foreach(var item in FindObjectsByType<LineRenderer>())if(item.name=="ring")rings.Add(item);
            if(source==null||mesh==null||rings.Count!=2) {
                row.error="dome source/mesh/two rings missing";
                File.WriteAllText(Path.Combine(output,"facing-ground-diagnosis.json"),JsonUtility.ToJson(row,true));yield break;
            }
            row.sourceInitiallyHidden=!source.enabled;row.meshInitiallyEnabled=mesh.enabled;row.meshActive=mesh.gameObject.activeInHierarchy;
            row.spriteAlpha=source.color.a;row.sortingOrder=mesh.sortingOrder;
            var material=mesh.sharedMaterial;row.shader=material.shader.name;row.renderQueue=material.renderQueue;
            row.flat=material.GetFloat("_Flat");row.depthTest=material.GetInt("_DepthTest");row.materialSame=material==source.sharedMaterial;
            var block=new MaterialPropertyBlock();mesh.GetPropertyBlock(block);row.textureSame=block.GetTexture("_MainTex")==source.sprite.texture;
            row.textureWidth=source.sprite.texture.width;row.textureHeight=source.sprite.texture.height;
            var shape=mesh.GetComponent<MeshFilter>().sharedMesh;row.meshVertices=shape.vertexCount;row.meshTriangles=shape.triangles.Length/3;
            var colors=shape.colors;row.vertexAlpha=colors.Length>0?colors[0].a:-1;
            row.uvMinX=row.uvMinY=float.PositiveInfinity;row.uvMaxX=row.uvMaxY=float.NegativeInfinity;
            foreach(var uv in shape.uv){row.uvMinX=Mathf.Min(row.uvMinX,uv.x);row.uvMaxX=Mathf.Max(row.uvMaxX,uv.x);row.uvMinY=Mathf.Min(row.uvMinY,uv.y);row.uvMaxY=Mathf.Max(row.uvMaxY,uv.y);}
            row.worldX=holy.x;row.worldY=NativeRemodel3D.GroundY(holy.x,holy.y);row.worldZ=holy.y;
            var ringArray=rings.ToArray();
            foreach(int width in new[]{1920,3840}) {
                FgMode(source,mesh,ringArray,"off");FgDirect(output,"holy-off",width,1080);FgDirect(output,"holy-off-repeat",width,1080);
                FgMode(source,mesh,ringArray,"mesh");FgDirect(output,"holy-mesh",width,1080);
                FgMode(source,mesh,ringArray,"sprite");FgDirect(output,"holy-c336-equivalent-sprite",width,1080);
            }
            FgMode(source,mesh,ringArray,"mesh");
            sim.FireZones.Clear();
            var options=new List<KeyValuePair<float,Vector2>>();
            for(float x=27;x<=42;x++)for(float z=-57;z<=-40;z++) {
                if(!Map.CanMove(x*100,-z*100,15))continue;
                float g=FgGradient(x,z);if(g<.05f||g>.8f)continue;
                options.Add(new KeyValuePair<float,Vector2>((new Vector2(x,z)-holy).sqrMagnitude,new Vector2(x,z)));
            }
            options.Sort((a,b)=>a.Key.CompareTo(b.Key));var selected=new List<Vector2>();
            foreach(var option in options) {
                bool near=false;foreach(var chosen in selected)if((chosen-option.Value).sqrMagnitude<4)near=true;
                if(near)continue;selected.Add(option.Value);if(selected.Count>=4)break;
            }
            for(int i=0;i<selected.Count;i++) {
                var point=selected[i];player.X=point.x*100;player.Y=-point.y*100;lastX=player.X;lastY=player.Y;
                sim.FireZones.Clear();sim.FireZones.Add(new FireZone{Id=7300+i,Type="spikeTrap",X=player.X,Y=player.Y,R=175,T=20,MaxT=600,Lv=1});
                for(int j=0;j<5;j++){renderedTick=-1;UpdateViews();yield return null;}
                yield return new WaitForEndOfFrame();
                string name="nearby-slope-"+i;FgShot(output,name+"-actual-window-1920x1080");FgDirect(output,name+"-on",3840,1080);
                MeshRenderer slopeMesh=null;foreach(var item in FindObjectsByType<MeshRenderer>())if(item.name=="Ground skill surface")slopeMesh=item;
                if(slopeMesh!=null){slopeMesh.enabled=false;FgDirect(output,name+"-off",3840,1080);slopeMesh.enabled=true;}
                var measure=FgMeasure(name,name+"-actual-window-1920x1080.png",point,false);
                row.slopePoints.Add(new FgDiagPoint{name=name,capture=measure.capture,x=point.x,z=point.y,gradient=measure.gradient,fieldY=measure.fieldY,terrainY=measure.terrainY,maxVertexError=measure.maxVertexHeightError});
            }
            File.WriteAllText(Path.Combine(output,"facing-ground-diagnosis.json"),JsonUtility.ToJson(row,true));
        }
    }
}
