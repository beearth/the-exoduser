using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    [Serializable] public sealed class ImpactReceipt
    {
        public int hitCount,chargeCount,drawnFrames,peakInk,peakAdditive;
    }
    public sealed class KiImpactView : IDisposable
    {
        sealed class Flash { public SpriteRenderer renderer;public FeedbackEvent source; }
        readonly List<Flash> additive=new List<Flash>(),shadows=new List<Flash>();
        readonly Transform parent;readonly Func<int,Sprite> frame;
        readonly Material addMaterial,inkMaterial;
        readonly MaterialPropertyBlock properties=new MaterialPropertyBlock();
        static readonly int Opacity=Shader.PropertyToID("_Opacity");
        public readonly ImpactReceipt Receipt=new ImpactReceipt();
        public int ActiveCount {get{return additive.Count;}}
        public KiImpactView(Transform parent,Func<int,Sprite> frame)
        {
            this.parent=parent;this.frame=frame;
            addMaterial=new Material(Resources.Load<Shader>("Shaders/KiSlashAdditive"));
            inkMaterial=new Material(Resources.Load<Shader>("Shaders/KiSlashInk"));
        }
        public void Handle(FeedbackEvent e)
        {
            if(e.Kind!=FeedbackKind.KiSlashHit&&e.Kind!=FeedbackKind.KiChargeFlash)return;
            float width=e.Kind==FeedbackKind.KiSlashHit?e.Size:e.Scale*627;
            // Source playVFXAng: all effects admitted here are skills, so the
            // 20-entry pool evicts its oldest. Ink is a separate eight-entry pool.
            if(additive.Count>=20)Remove(additive,0);
            additive.Add(Create(e,width,false));
            if(e.Kind==FeedbackKind.KiSlashHit){
                Receipt.hitCount++;
                if(shadows.Count>=8)Remove(shadows,0);
                shadows.Add(Create(e,width*1.14f,true));
            }else Receipt.chargeCount++;
            Receipt.peakInk=Math.Max(Receipt.peakInk,shadows.Count);Receipt.peakAdditive=Math.Max(Receipt.peakAdditive,additive.Count);
        }
        Flash Create(FeedbackEvent e,float width,bool ink)
        {
            var go=new GameObject(ink?"Ki hit ink":"Ki impact light");go.transform.SetParent(parent);
            var r=go.AddComponent<SpriteRenderer>();r.sharedMaterial=ink?inkMaterial:addMaterial;
            r.transform.position=NativeRemodel3D.Point(e.X,e.Y);r.transform.rotation=Quaternion.Euler(0,0,-e.Angle*Mathf.Rad2Deg);
            r.transform.localScale=Vector3.one*(width/627);r.color=Color.white;
            return new Flash{renderer=r,source=e};
        }
        public void Update(int tick)
        {
            Draw(shadows,tick,true);Draw(additive,tick,false);
        }
        void Draw(List<Flash> list,int tick,bool ink)
        {
            for(int i=0;i<list.Count;){
                // Source additive advances before drawing; ink uses game-frame age.
                var f=list[i];int age=tick-f.source.Tick,cell=Math.Max(0,age+(ink?0:1))/f.source.FrameTicks;
                if(cell>=f.source.FrameCount){Remove(list,i);continue;}
                f.renderer.sprite=frame(cell);f.renderer.sortingOrder=(ink?24000:27000)+i;
                float alpha=ink?.85f*(1-cell*.18f):1-(float)cell/f.source.FrameCount*.3f;
                f.renderer.GetPropertyBlock(properties);properties.SetFloat(Opacity,alpha);f.renderer.SetPropertyBlock(properties);f.renderer.transform.position=NativeRemodel3D.Point(f.source.X,f.source.Y);NativeHd2DSurface.Bind(f.renderer,!ink);
                Receipt.drawnFrames++;i++;
            }
        }
        static void Release(UnityEngine.Object value){if(Application.isPlaying)UnityEngine.Object.Destroy(value);else UnityEngine.Object.DestroyImmediate(value);}
        static void Remove(List<Flash> list,int index){Release(list[index].renderer.gameObject);list.RemoveAt(index);}
        public void Reset(){while(additive.Count>0)Remove(additive,additive.Count-1);while(shadows.Count>0)Remove(shadows,shadows.Count-1);}
        public void Dispose(){Reset();Release(addMaterial);Release(inkMaterial);}
    }
}
