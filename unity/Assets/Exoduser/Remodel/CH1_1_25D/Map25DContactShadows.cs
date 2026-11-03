using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Map presentation owns ground registration, not the rigpixel drawing path.
    // NativeHd2D rebuilds the unshifted contact every frame before this component.
    [DefaultExecutionOrder(25000)]
    public sealed class Map25DContactShadows : MonoBehaviour
    {
        static readonly Dictionary<MeshRenderer,Vector3> feet=new Dictionary<MeshRenderer,Vector3>();
        readonly List<MeshRenderer> contacts=new List<MeshRenderer>();
        readonly MaterialPropertyBlock block=new MaterialPropertyBlock();
        Light moon;float nextScan;
        readonly Dictionary<MeshRenderer,List<SpriteRenderer>> actors=new Dictionary<MeshRenderer,List<SpriteRenderer>>();
        readonly HashSet<SpriteRenderer> shifted=new HashSet<SpriteRenderer>();
        public static bool Surface(Vector3 point,out RaycastHit hit){return Physics.Raycast(new Vector3(point.x,60,point.z),Vector3.down,out hit,140,1<<28,QueryTriggerInteraction.Ignore);}
        public static Vector3 GroundedPoint(Vector3 point){RaycastHit hit;if(Surface(point,out hit))point.y=hit.point.y;return point;}
        public static bool TryGetFoot(MeshRenderer contact,out Vector3 foot){return feet.TryGetValue(contact,out foot);}
        void LateUpdate()
        {
            if(Time.unscaledTime>=nextScan){contacts.Clear();foreach(var r in FindObjectsByType<MeshRenderer>(FindObjectsInactive.Exclude))if(r.name.StartsWith("HD2D contact: ",StringComparison.Ordinal))contacts.Add(r);foreach(var light in FindObjectsByType<Light>(FindObjectsInactive.Exclude))if(light.name=="Cold moon")moon=light;nextScan=Time.unscaledTime+.25f;}
            Vector3 away=moon!=null?moon.transform.forward:new Vector3(-.7f,0,.7f);away.y=0;away.Normalize();shifted.Clear();
            foreach(var r in contacts){if(r==null||!r.enabled)continue;var tr=r.transform;Vector3 foot=tr.position-Vector3.up*.018f;
                if(NativeGame.GrayboxCompositionB){RaycastHit hit;if(Surface(foot,out hit)){bool grounded=r.name.IndexOf("Enemy",StringComparison.OrdinalIgnoreCase)>=0||r.name.IndexOf("Player",StringComparison.OrdinalIgnoreCase)>=0||r.name.IndexOf("Hero",StringComparison.OrdinalIgnoreCase)>=0;float delta=hit.point.y-(grounded?foot.y:NativeRemodel3D.GroundY(foot.x,foot.z));foot.y+=delta;List<SpriteRenderer> sources;if(!actors.TryGetValue(r,out sources)){sources=new List<SpriteRenderer>();string id=r.name.Substring("HD2D contact: ".Length);foreach(var sr in FindObjectsByType<SpriteRenderer>(FindObjectsInactive.Exclude))if(sr.name==id||sr.name.StartsWith(id+" ",StringComparison.Ordinal))sources.Add(sr);actors[r]=sources;}foreach(var sr in sources)if(sr!=null&&shifted.Add(sr))sr.transform.position+=Vector3.up*delta;}}
                feet[r]=foot;float width=Mathf.Clamp(tr.localScale.x*.72f,.30f,1.35f);tr.position=foot+Vector3.up*.009f+away*.12f;tr.rotation=Quaternion.Euler(90,Mathf.Atan2(away.x,away.z)*Mathf.Rad2Deg,0);tr.localScale=new Vector3(width,width*.43f,1);r.GetPropertyBlock(block);float opacity=block.GetFloat("_Opacity");block.SetFloat("_Opacity",opacity*1.45f);r.SetPropertyBlock(block);}
        }
        void OnDisable(){feet.Clear();actors.Clear();}
    }
}
