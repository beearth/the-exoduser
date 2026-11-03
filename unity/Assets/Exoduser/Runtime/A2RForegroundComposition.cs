using System;using System.Collections.Generic;using UnityEngine;
namespace Exoduser.UnityPort {public sealed class A2RForegroundComposition {
 [Serializable] public sealed class Exclusion{public string id,reason;public float width,height,footViewportY;}
 [Serializable] public sealed class Receipt{public List<Exclusion> excluded=new List<Exclusion>();public int leftFrames,rightFrames;public float leftWidth,rightWidth;public int translucentEdgeTrunks;}
 public Receipt Result{get;}=new Receipt();public A2RForegroundComposition(Transform world,Camera viewer){}public void Track(Renderer body,Renderer fade,Transform foot){}public bool AllowsMask(Renderer body){return true;}public void Restore(bool active=false){}public void Update(Vector3 hero){}
}}
