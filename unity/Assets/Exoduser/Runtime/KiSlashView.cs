using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Source _drawRadiantKiSlash / _drawKiSlashCharge; no generated replacement art.
    public sealed class KiSlashView : IDisposable
    {
        readonly Transform parent;
        readonly Func<int,Sprite> frame;
        readonly Material additive,ink;
        readonly Dictionary<int,SpriteRenderer[]> projectiles=new Dictionary<int,SpriteRenderer[]>();
        readonly SpriteRenderer[] charge=new SpriteRenderer[2];
        readonly SpriteRenderer[] tiers=new SpriteRenderer[3];
        readonly Dictionary<int,int> overlapSince=new Dictionary<int,int>();
        readonly Sprite line;
        readonly MaterialPropertyBlock properties=new MaterialPropertyBlock();
        static readonly int Opacity=Shader.PropertyToID("_Opacity"),FrameRect=Shader.PropertyToID("_PixelFrameRect");

        public KiSlashView(Transform parent,Func<int,Sprite> frame)
        {
            this.parent=parent;this.frame=frame;
            additive=Material("Shaders/KiSlashAdditive");ink=Material("Shaders/KiSlashInk");
            if(NativeRigPixelPolicy.Requested(Environment.GetCommandLineArgs())){additive.SetFloat("_RigPixelMode",1);ink.SetFloat("_RigPixelMode",1);}
            line=Sprite.Create(Texture2D.whiteTexture,new Rect(0,0,1,1),new Vector2(.5f,.5f),100);
            for(int i=0;i<2;i++)charge[i]=Renderer("Ki third charge "+i,additive,26000+i);
            for(int i=0;i<3;i++){tiers[i]=Renderer("Ki charge tier "+i,null,26002+i);tiers[i].sprite=line;}
            Reset();
        }
        static Material Material(string resource)
        {
            var shader=Resources.Load<Shader>(resource);
            if(shader==null)throw new InvalidOperationException("Missing original VFX adapter shader "+resource);
            return new Material(shader);
        }
        SpriteRenderer Renderer(string name,Material material,int order)
        {
            var go=new GameObject(name);go.transform.SetParent(parent);
            var r=go.AddComponent<SpriteRenderer>();if(material!=null)r.sharedMaterial=material;r.sortingOrder=order;return r;
        }
        public void Reset()
        {
            foreach(var layers in projectiles.Values)foreach(var r in layers)UnityEngine.Object.Destroy(r.gameObject);
            projectiles.Clear();overlapSince.Clear();foreach(var r in charge)r.enabled=false;foreach(var r in tiers)r.enabled=false;
        }
        public void Update(Simulation simulation)
        {
            var active=new HashSet<int>();int slot=0;
            foreach(var p in simulation.Projectiles)
            {
                int order=25000+slot++*5;
                if(!p.Active)continue;active.Add(p.Id);
                if(!projectiles.TryGetValue(p.Id,out var layers))
                {
                    layers=new SpriteRenderer[5];
                    for(int i=0;i<5;i++)layers[i]=Renderer("Ki crescent "+p.Id+" layer "+i,i==0?ink:additive,order+i);
                    projectiles.Add(p.Id,layers);
                }
                float progress=Mathf.Clamp01(1-p.Life/Mathf.Max(1,p.MaxLife));
                int cell=Mathf.Min(8,Mathf.FloorToInt(progress*9));
                // Display age only: Core life, radius, speed and trail samples stay intact.
                float age=p.MaxLife-p.Life;
                float alpha=(float)KiImpactPresentation.TrailAlpha(age);
                float body=(float)KiImpactPresentation.BodyAlpha(age);
                float size=(p.Step==3?252:192)*p.ChargeScale;
                // U-VFX-15: presentation only. While the crescent crosses a body (boss or any enemy) it is capped, halved, then faded from the outside in.
                float overlap=-1;bool inside=false;
                foreach(var enemy in simulation.Enemies)if(enemy.Alive&&KiImpactPresentation.CrescentOverlaps(p.X,p.Y,enemy.X,enemy.Y,enemy.Radius)){inside=true;break;}
                if(inside){if(!overlapSince.ContainsKey(p.Id))overlapSince[p.Id]=simulation.TickCount;overlap=simulation.TickCount-overlapSince[p.Id];}else overlapSince.Remove(p.Id);
                Set(layers[0],cell,p.X,p.Y,p.Angle,size*1.14f,size*1.14f,(float)KiImpactPresentation.CrescentAlpha(body*.4f,0,overlap));
                int far=(p.TrailHead-4+5)%5,near=(p.TrailHead-2+5)%5;
                Set(layers[1],cell,p.TrailX[far],p.TrailY[far],p.Angle,size*.9f,size*.9f,(float)KiImpactPresentation.CrescentAlpha(body*.08f,1,overlap));
                Set(layers[2],cell,p.TrailX[near],p.TrailY[near],p.Angle,size*.9f,size*.9f,(float)KiImpactPresentation.CrescentAlpha(body*.18f,2,overlap));
                Set(layers[3],cell,p.X,p.Y,p.Angle,size*1.08f,size*1.08f,(float)KiImpactPresentation.CrescentAlpha(body*.25f,3,overlap));
                // Compress across travel, keeping the arc's height and its leading tip.
                float thin=(float)KiImpactPresentation.TrailThickness;
                float front=size*(1-thin)*.35f;
                Set(layers[4],cell,p.X+Mathf.Cos(p.Angle)*front,p.Y+Mathf.Sin(p.Angle)*front,p.Angle,size*thin,size,(float)KiImpactPresentation.CrescentAlpha(alpha,4,overlap));
            }
            var remove=new List<int>();foreach(var id in projectiles.Keys)if(!active.Contains(id))remove.Add(id);
            foreach(int id in remove){foreach(var r in projectiles[id])UnityEngine.Object.Destroy(r.gameObject);projectiles.Remove(id);overlapSince.Remove(id);}
            var player=simulation.Player;
            foreach(var r in charge)r.enabled=player.KiChargeActive;foreach(var r in tiers)r.enabled=player.KiChargeActive;
            if(!player.KiChargeActive)return;
            float ticks=player.KiChargeTicks;int tier=Mathf.Min(3,Mathf.FloorToInt(Mathf.Max(0,ticks)/40));
            float sizeCharge=(78+tier*13+4*(ticks%40)/40)*(1+Mathf.Sin(Time.unscaledTime*25)*.035f);
            int chargeFrame=(simulation.TickCount/7)%3;
            Set(charge[0],chargeFrame,player.X,player.Y,player.Facing,sizeCharge*.96f,sizeCharge,.24f+.08f*tier);
            Set(charge[1],chargeFrame,player.X,player.Y,player.Facing,sizeCharge*.82f,sizeCharge*.86f,.58f+.08f*tier);
            for(int i=0;i<3;i++)
            {
                float x=-sizeCharge*.23f+i*12+4.5f,y=sizeCharge*.29f-6;
                float c=Mathf.Cos(player.Facing),s=Mathf.Sin(player.Facing);
                var r=tiers[i];r.transform.position=Point(player.X+x*c-y*s,player.Y+x*s+y*c);
                r.transform.rotation=Quaternion.Euler(0,0,-(player.Facing+Mathf.Atan2(-12,9))*Mathf.Rad2Deg);
                r.transform.localScale=new Vector3(15,i<tier?4:2,1);
                r.color=i<tier?new Color(244f/255,245f/255,247f/255,.9f):new Color(58f/255,58f/255,64f/255,.45f);
            }
        }
        void Set(SpriteRenderer r,int cell,float x,float y,float angle,float width,float height,float alpha)
        {
            r.enabled=alpha>0;if(!r.enabled)return;r.sprite=frame(cell);r.transform.position=Point(x,y);
            r.transform.rotation=Quaternion.Euler(0,0,-angle*Mathf.Rad2Deg);
            r.transform.localScale=new Vector3(width/r.sprite.rect.width,height/r.sprite.rect.height,1);r.color=Color.white;
            // Explicit per-renderer opacity avoids relying on pipeline-specific
            // SpriteRenderer color uniforms or multiplying its alpha twice.
            r.GetPropertyBlock(properties);properties.SetFloat(Opacity,alpha);
            var rect=r.sprite.textureRect;var texture=r.sprite.texture;
            properties.SetVector(FrameRect,new Vector4(rect.xMin/texture.width,rect.yMin/texture.height,rect.xMax/texture.width,rect.yMax/texture.height));
            r.SetPropertyBlock(properties);
        }
        static Vector3 Point(float x,float y){return NativeRemodel3D.Point(x,y);}
        public void Dispose(){Reset();foreach(var r in charge)UnityEngine.Object.Destroy(r.gameObject);foreach(var r in tiers)UnityEngine.Object.Destroy(r.gameObject);UnityEngine.Object.Destroy(line);UnityEngine.Object.Destroy(additive);UnityEngine.Object.Destroy(ink);}
    }
}
