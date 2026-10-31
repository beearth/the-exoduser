using System;
using System.IO;
using System.Reflection;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using Exoduser.UnityPort;

namespace Exoduser
{
    // 제품 규칙 테스트가 아닌 실제 Unity 투영/발밑 회귀 검사. 별도 빈 장면에서만 실행한다.
    public static class Hd2dRuntimeVerification
    {
        static void Check(bool ok,string message) { if(!ok)throw new Exception("HD2D verification: "+message); }
        public static void ActorAnchors()
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var camera=new GameObject("HD2D test camera").AddComponent<Camera>();
            var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
            var texture=Resources.Load<Texture2D>("Art/player/north-east");
            var sprite=Sprite.Create(texture,new Rect(0,0,48,48),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
            var actor=new GameObject("HD2D test actor").AddComponent<SpriteRenderer>();actor.sprite=sprite;
            int cases=0;float worst=0;
            foreach(bool orthographic in new[]{false,true}) foreach(float pitch in new[]{35f,48.7014126f,65f})
            foreach(float scale in new[]{2f,4f})foreach(float roll in new[]{0f,90f,180f})
            {
                camera.orthographic=orthographic;camera.orthographicSize=5.4f;camera.fieldOfView=46.9453f;
                camera.transform.rotation=Quaternion.Euler(pitch,0,0);camera.transform.position=-camera.transform.forward*14;
                var ground=new Vector3(.137f,.41f,.263f);actor.transform.position=ground;actor.transform.localScale=Vector3.one*scale;
                NativeHd2D.Actor(actor);NativeHd2D.BeginProjection();NativeHd2D.ProjectActor(actor,camera,roll);
                // 원본 north-east 첫프레임 alpha>64 발선 = 하단5px. 데이터 테이블 계산식을 기대값으로 재사용하지 않는다.
                var foot=actor.transform.TransformPoint(new Vector3(0,(5f-24f)/100f,0));
                var a=camera.WorldToScreenPoint(foot);var b=camera.WorldToScreenPoint(ground);
                float error=Vector2.Distance(new Vector2(a.x,a.y),new Vector2(b.x,b.y));worst=Mathf.Max(worst,error);
                Check(error<=.72f,"actor visible foot / Core anchor gap "+error+"px");
                Check(actor.sharedMaterial.shader.name=="EXODUSER/HD2D/SpriteLit","actor lighting shader");
                Check(texture.filterMode==FilterMode.Point,"point sampling");cases++;
            }
            camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);
            Debug.Log("[HD2D] ACTOR_ANCHORS PASS cases="+cases+" worstPx="+worst);
        }
        public static void DruidPivotFoot()
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var type=typeof(NativeGame).Assembly.GetType("Exoduser.UnityPort.NativeDruidArt");
            var sprite=(Sprite)type.GetMethod("EmergeCell",BindingFlags.Public|BindingFlags.Static).Invoke(null,new object[]{3});
            var camera=new GameObject("HD2D druid test camera").AddComponent<Camera>();
            camera.orthographic=true;camera.orthographicSize=5.4f;camera.transform.position=new Vector3(0,0,-10);
            var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
            var actor=new GameObject("Druid actual emerge cell").AddComponent<SpriteRenderer>();actor.sprite=sprite;
            var ground=new Vector3(.137f,.263f,0);actor.transform.position=ground;actor.transform.localScale=Vector3.one*1.4f;
            NativeHd2D.Actor(actor,true);NativeHd2D.ProjectFlatActors(camera);
            float error=Vector2.Distance(camera.WorldToScreenPoint(ground),camera.WorldToScreenPoint(actor.transform.position));
            Check(error<=.72f,"druid emerge pivot unexpectedly lifted "+error+"px");
            Check(GameObject.Find("HD2D contact: Druid actual emerge cell")!=null,"arena contact shadow missing");
            camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);
            Debug.Log("[HD2D] DRUID_PIVOT PASS gapPx="+error);
        }
        public static void CollisionCentre()
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var game=new GameObject("HD2D centre fixture").AddComponent<NativeGame>();
            var camera=new GameObject("HD2D centre camera").AddComponent<Camera>();
            camera.transform.SetPositionAndRotation(new Vector3(0,8,-8),Quaternion.Euler(48.7014126f,0,0));
            var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
            typeof(NativeGame).GetField("r3Cam",BindingFlags.Instance|BindingFlags.NonPublic).SetValue(game,camera);
            var texture=new Texture2D(64,64);var sprite=Sprite.Create(texture,new Rect(0,0,64,64),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
            var bullet=new GameObject("projectile").AddComponent<SpriteRenderer>();bullet.sprite=sprite;
            var anchor=new Vector3(.2f,.1f,0);bullet.transform.position=anchor;
            typeof(NativeGame).GetMethod("Remodel3DBillboards",BindingFlags.Instance|BindingFlags.NonPublic).Invoke(game,null);
            float gap=Vector2.Distance(camera.WorldToScreenPoint(anchor),camera.WorldToScreenPoint(bullet.transform.position));
            camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);
            Check(gap<=.72f,"projectile centre shifted from Core by "+gap+"px");
            Debug.Log("[HD2D] COLLISION_CENTRE PASS gapPx="+gap);
        }
        public static void Shaders()
        {
            foreach(string name in new[]{"Shaders/HD2DSpriteLit","Shaders/HD2DContact"})
            {
                var shader=Resources.Load<Shader>(name);Check(shader!=null,"shader missing "+name);
                foreach(var msg in ShaderUtil.GetShaderMessages(shader))
                    Check(msg.severity!=UnityEditor.Rendering.ShaderCompilerMessageSeverity.Error,msg.message);
            }
            Debug.Log("[HD2D] SHADERS PASS");
        }
    }
}
