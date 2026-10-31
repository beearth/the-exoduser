using System;
using System.Reflection;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using Exoduser.UnityPort;
namespace Exoduser
{
    // UNAPPLIED phase 2. Run only in the owning Editor, after source/build checkpoint.
    public static class Hd2dAlignmentVerification
    {
        static void Check(bool ok,string message){if(!ok)throw new Exception("HD2D alignment: "+message);}

        public static void ShieldArcGroundRole()
        {
            NativeHd2DSurface.DisposeAll();EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var host=new GameObject("inactive shield writer fixture");host.SetActive(false);var game=host.AddComponent<NativeGame>();
            var arc=new GameObject("Enemy shield 4242").AddComponent<SpriteRenderer>();
            var enemyViewType=typeof(NativeGame).GetNestedType("EnemyView",BindingFlags.NonPublic);
            var enemyView=Activator.CreateInstance(enemyViewType,true);enemyViewType.GetField("arc").SetValue(enemyView,arc);
            var writer=typeof(NativeGame).GetMethod("UpdateEnemyShieldArc",BindingFlags.NonPublic|BindingFlags.Instance);
            var data=new TerrainData{heightmapResolution=129,size=new Vector3(60,4,60)};var heights=new float[129,129];for(int z=0;z<129;z++)for(int x=0;x<129;x++)heights[z,x]=.1f+.15f*x/128f;data.SetHeights(0,0,heights);
            var terrain=Terrain.CreateTerrainGameObject(data).GetComponent<Terrain>();terrain.transform.position=new Vector3(0,0,-60);NativeRemodel3D.Ground=terrain;NativeRemodel3D.Active=true;
            var camera=new GameObject("shield final camera").AddComponent<Camera>();camera.orthographic=true;camera.orthographicSize=5.4f;camera.transform.rotation=Quaternion.Euler(48.7014f,0,0);int cases=0;float worst=0;var ownedRts=new System.Collections.Generic.List<RenderTexture>();
            try
            {
                foreach(int width in new[]{1920,3840})foreach(float shieldLevel in new[]{0f,39f,100f})foreach(float angle in new[]{0,Mathf.PI/4,Mathf.PI/2,Mathf.PI*.75f,Mathf.PI,-Mathf.PI*.75f,-Mathf.PI/2,-Mathf.PI/4})foreach(float radius in new[]{10,40})
                {
                    var rt=new RenderTexture(width,1080,24);ownedRts.Add(rt);camera.targetTexture=rt;camera.aspect=width/1080f;
                    var e=new Exoduser.UnityPort.Core.EnemyState{Id=4242,X=2400,Y=2400,Radius=radius,Shield=shieldLevel,MaxShield=100,Web=new Exoduser.UnityPort.Core.EnemySpawn{eShieldMax=100,shieldAng=angle}};
                    NativeHd2DSurface.Restore();writer.Invoke(game,new object[]{e,enemyView});var anchor=NativeRemodel3D.Point(e.X,e.Y);camera.transform.position=anchor-camera.transform.forward*14;
                    Check(NativeHd2DSurface.Project(arc,camera),"enemy "+e.Id+" shield arc omitted explicit ground role");Check(!NativeHd2D.IsActor(arc),"shield arc acquired actor feet/contact role");
                    var proxy=GameObject.Find("HD2D surface: "+arc.name);Check(proxy!=null,"shield ground proxy missing");var mesh=proxy.GetComponent<MeshFilter>().sharedMesh;float nearest=float.MaxValue;Vector3 pivot=default;
                    foreach(var v in mesh.vertices){float d=Vector2.Distance(new Vector2(v.x,v.z),new Vector2(anchor.x,anchor.z));if(d<nearest){nearest=d;pivot=v;}}
                    var uv=mesh.uv;var vertices=mesh.vertices;var sprite=arc.sprite;
                    for(int i=0;i<vertices.Length;i++)
                    {
                        float localX=(uv[i].x*sprite.texture.width-sprite.rect.x-sprite.pivot.x)/sprite.pixelsPerUnit*100;
                        float canvasY=-(uv[i].y*sprite.texture.height-sprite.rect.y-sprite.pivot.y)/sprite.pixelsPerUnit*100;
                        float dx=localX*Mathf.Cos(angle)-canvasY*Mathf.Sin(angle),dy=localX*Mathf.Sin(angle)+canvasY*Mathf.Cos(angle);
                        var expected=NativeRemodel3D.Point(e.X+dx,e.Y+dy);var vertex=vertices[i];
                        Check(Vector2.Distance(new Vector2(vertex.x,vertex.z),new Vector2(expected.x,expected.z))<=.00005f,"shield UV/Core angle or scale mismatch");
                        Check(Mathf.Abs(vertex.y-expected.y)<=.0031f,"shield vertex support height mismatch");
                    }
                    float error=Vector2.Distance(camera.WorldToScreenPoint(anchor),camera.WorldToScreenPoint(pivot));worst=Mathf.Max(worst,error);Check(nearest<.00001f&&error<=.151f,"shield centre detached "+error+"px");
                    Check(arc.forceRenderingOff&&proxy.GetComponent<MeshRenderer>().enabled,"source arc/proxy duplicate visible");NativeHd2DSurface.Restore();Check(!arc.forceRenderingOff&&!proxy.GetComponent<MeshRenderer>().enabled,"shield projection hide restoration lost");camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);cases++;
                }
                Debug.Log("[HD2D] SHIELD_GROUND_ROLE PASS cases="+cases+" worst="+worst+"px sourceId=4242");
            }
            finally{camera.targetTexture=null;foreach(var rt in ownedRts)if(rt!=null){rt.Release();UnityEngine.Object.DestroyImmediate(rt);}NativeHd2DSurface.DisposeAll();NativeRemodel3D.Active=false;NativeRemodel3D.Ground=null;UnityEngine.Object.DestroyImmediate(host);UnityEngine.Object.DestroyImmediate(arc.gameObject);UnityEngine.Object.DestroyImmediate(camera.gameObject);UnityEngine.Object.DestroyImmediate(terrain.gameObject);UnityEngine.Object.DestroyImmediate(data);}
        }

        public static void SurfaceAndAim()
        {
            NativeHd2DSurface.DisposeAll();EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var data=new TerrainData{heightmapResolution=129,size=new Vector3(12,2,12)};var heights=new float[129,129];
            for(int z=0;z<129;z++)for(int x=0;x<129;x++)heights[z,x]=.15f+.2f*x/128f+.08f*Mathf.Sin(z/128f*Mathf.PI);
            data.SetHeights(0,0,heights);var terrain=Terrain.CreateTerrainGameObject(data).GetComponent<Terrain>();
            NativeRemodel3D.Ground=terrain;NativeRemodel3D.Active=true;
            var camera=new GameObject("HD2D alignment camera").AddComponent<Camera>();camera.farClipPlane=80;
            var texture=new Texture2D(64,64);var sprite=Sprite.Create(texture,new Rect(0,0,64,64),new Vector2(.5f,.62f),100,0,SpriteMeshType.FullRect);
            var sr=new GameObject("asymmetric actual surface pivot").AddComponent<SpriteRenderer>();sr.sprite=sprite;
            float worstPivot=0,worstHeight=0,worstAim=0;int cases=0;var ownedRts=new System.Collections.Generic.List<RenderTexture>();
            try
            {
                foreach(int width in new[]{1920,3840})foreach(bool ortho in new[]{false,true})foreach(float pitch in new[]{34f,48.7014f})
                {
                    var rt=new RenderTexture(width,1080,24);ownedRts.Add(rt);camera.targetTexture=rt;camera.aspect=width/1080f;camera.orthographic=ortho;camera.orthographicSize=5.4f;camera.fieldOfView=46.9453f;
                    var anchor=new Vector3(5.137f,NativeRemodel3D.GroundY(5.137f,5.263f),5.263f);
                    camera.transform.rotation=Quaternion.Euler(pitch,0,0);camera.transform.position=anchor-camera.transform.forward*14;
                    sr.transform.SetPositionAndRotation(anchor,Quaternion.Euler(0,0,37));sr.transform.localScale=new Vector3(2,3,1);sr.forceRenderingOff=false;
                    NativeHd2DSurface.Bind(sr);Check(NativeHd2DSurface.Project(sr,camera),"explicit surface not projected");
                    var proxy=GameObject.Find("HD2D surface: "+sr.name);Check(proxy!=null,"surface proxy missing");
                    var mesh=proxy.GetComponent<MeshFilter>().sharedMesh;float nearest=float.MaxValue;Vector3 pivotWorld=default;
                    foreach(var vertex in mesh.vertices)
                    {
                        float d=Vector2.Distance(new Vector2(vertex.x,vertex.z),new Vector2(anchor.x,anchor.z));if(d<nearest){nearest=d;pivotWorld=vertex;}
                        float heightError=Mathf.Abs(vertex.y-NativeRemodel3D.GroundY(vertex.x,vertex.z));worstHeight=Mathf.Max(worstHeight,heightError);Check(heightError<=.0031f,"mesh floats off exact support height");
                    }
                    Check(nearest<.00001f,"original .62 pivot row/column omitted");
                    float pivotError=Vector2.Distance(camera.WorldToScreenPoint(anchor),camera.WorldToScreenPoint(pivotWorld));worstPivot=Mathf.Max(worstPivot,pivotError);Check(pivotError<=.151f,"effect centre offset "+pivotError+" px");
                    for(int xi=-2;xi<=2;xi++)for(int zi=-2;zi<=2;zi++)
                    {
                        var expected=new Vector3(anchor.x+xi*.4f,0,anchor.z+zi*.4f);expected.y=NativeRemodel3D.GroundY(expected.x,expected.z);
                        var screen=camera.WorldToScreenPoint(expected);Check(NativeHd2DAim.TryRay(camera.ScreenPointToRay(screen),anchor,80,out var actual),"ground inverse failed");
                        float error=Vector2.Distance(camera.WorldToScreenPoint(actual),screen);worstAim=Mathf.Max(worstAim,error);Check(error<=.02f,"terrain inverse round-trip "+error+"px");
                    }
                    NativeHd2DSurface.Restore();Check(!sr.forceRenderingOff,"source forceRenderingOff not restored");Check(!proxy.GetComponent<MeshRenderer>().enabled,"old proxy still visible");
                    camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);cases++;
                }
                var original=sr.sharedMaterial;NativeHd2D.Actor(sr);Check(sr.sharedMaterial.shader.name=="EXODUSER/HD2D/SpriteLit","actor shader missing");NativeHd2DSurface.Bind(sr);Check(sr.sharedMaterial==original,"actor original material not restored on ground role");
                sr.forceRenderingOff=true;NativeHd2DSurface.Restore();NativeHd2DSurface.Bind(sr);NativeHd2DSurface.Project(sr,camera);NativeHd2DSurface.Restore();Check(sr.forceRenderingOff,"foreign forced-hide flag lost");sr.forceRenderingOff=false;
                Debug.Log("[HD2D] SURFACE_AIM PASS cases="+cases+" meshHeight="+worstHeight+" pivotPx="+worstPivot+" aimPx="+worstAim);
            }
            finally{camera.targetTexture=null;foreach(var rt in ownedRts)if(rt!=null){rt.Release();UnityEngine.Object.DestroyImmediate(rt);}NativeHd2DSurface.DisposeAll();NativeRemodel3D.Active=false;NativeRemodel3D.Ground=null;UnityEngine.Object.DestroyImmediate(sr.gameObject);UnityEngine.Object.DestroyImmediate(camera.gameObject);UnityEngine.Object.DestroyImmediate(sprite);UnityEngine.Object.DestroyImmediate(texture);UnityEngine.Object.DestroyImmediate(terrain.gameObject);UnityEngine.Object.DestroyImmediate(data);}
        }
        public static void CenteredBullets()
        {
            NativeHd2DSurface.DisposeAll();EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var data=new TerrainData{heightmapResolution=129,size=new Vector3(12,2,12)};var heights=new float[129,129];
            for(int z=0;z<129;z++)for(int x=0;x<129;x++)heights[z,x]=.15f+.2f*x/128f+.08f*Mathf.Sin(z/128f*Mathf.PI);
            data.SetHeights(0,0,heights);var terrain=Terrain.CreateTerrainGameObject(data).GetComponent<Terrain>();NativeRemodel3D.Ground=terrain;NativeRemodel3D.Active=true;
            var camera=new GameObject("centred projectile camera").AddComponent<Camera>();camera.farClipPlane=80;
            var texture=new Texture2D(64,64);var sprite=Sprite.Create(texture,new Rect(0,0,64,64),new Vector2(.62f,.5f),100,0,SpriteMeshType.FullRect);
            var sr=new GameObject("asymmetric moving bullet pivot").AddComponent<SpriteRenderer>();sr.sprite=sprite;var ownedRts=new System.Collections.Generic.List<RenderTexture>();int cases=0;float worst=0,lowest=float.PositiveInfinity;
            try
            {
                foreach(int width in new[]{1920,3840})foreach(bool ortho in new[]{false,true})foreach(float pitch in new[]{34f,48.7014f})
                {
                    var rt=new RenderTexture(width,1080,24);ownedRts.Add(rt);camera.targetTexture=rt;camera.aspect=width/1080f;camera.orthographic=ortho;camera.orthographicSize=5.4f;camera.fieldOfView=46.9453f;
                    var anchor=new Vector3(5.137f,NativeRemodel3D.GroundY(5.137f,5.263f),5.263f);camera.transform.rotation=Quaternion.Euler(pitch,0,0);camera.transform.position=anchor-camera.transform.forward*14-camera.transform.right*1.1f;
                    foreach(float roll in new[]{0f,37f,90f})foreach(bool flip in new[]{false,true})foreach(float scale in new[]{1f,3f})
                    {
                        sr.transform.SetPositionAndRotation(anchor,Quaternion.Euler(0,0,roll));sr.transform.localScale=new Vector3(scale,scale*.75f,1);sr.flipX=flip;sr.forceRenderingOff=false;
                        NativeHd2DSurface.Bind(sr);Check(NativeHd2DSurface.Project(sr,camera),"ground pool setup");Check(sr.forceRenderingOff,"ground pool source not hidden");NativeHd2D.Center(sr);Check(!sr.forceRenderingOff&&NativeHd2D.IsCentered(sr),"ground to moving role transition failed");
                        NativeHd2D.ProjectCentered(sr,camera,roll);float error=Vector2.Distance(camera.WorldToScreenPoint(anchor),camera.WorldToScreenPoint(sr.transform.position));worst=Mathf.Max(worst,error);Check(error<=.72f,"moving centre screen drift "+error);
                        var bounds=sprite.bounds;for(int yi=0;yi<3;yi++)for(int xi=0;xi<3;xi++)
                        {var local=new Vector3(Mathf.Lerp(bounds.min.x,bounds.max.x,xi*.5f)*(flip?-1:1),Mathf.Lerp(bounds.min.y,bounds.max.y,yi*.5f),0);var point=sr.transform.TransformPoint(local);float clearance=point.y-NativeRemodel3D.GroundY(point.x,point.z);lowest=Mathf.Min(lowest,clearance);Check(clearance>=.0027f,"moving image intersects ground "+clearance);}
                        Check(sr.enabled&&!sr.forceRenderingOff,"moving source still hidden");NativeHd2D.Grounded(sr);cases++;
                    }
                    camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);
                }
                Debug.Log("[HD2D] CENTERED_BULLETS PASS cases="+cases+" worstPx="+worst+" minGroundClearance="+lowest);
            }
            finally{camera.targetTexture=null;foreach(var rt in ownedRts)if(rt!=null){rt.Release();UnityEngine.Object.DestroyImmediate(rt);}NativeHd2D.Grounded(sr);NativeHd2DSurface.DisposeAll();NativeRemodel3D.Active=false;NativeRemodel3D.Ground=null;UnityEngine.Object.DestroyImmediate(sr.gameObject);UnityEngine.Object.DestroyImmediate(camera.gameObject);UnityEngine.Object.DestroyImmediate(sprite);UnityEngine.Object.DestroyImmediate(texture);UnityEngine.Object.DestroyImmediate(terrain.gameObject);UnityEngine.Object.DestroyImmediate(data);}
        }
        public static void Shaders()
        {
            var shader=Resources.Load<Shader>("Shaders/HD2DGround");Check(shader!=null,"ground shader missing");foreach(var msg in ShaderUtil.GetShaderMessages(shader))Check(msg.severity!=UnityEditor.Rendering.ShaderCompilerMessageSeverity.Error,msg.message);
            Debug.Log("[HD2D] GROUND_SHADER PASS");
        }
    }
}
