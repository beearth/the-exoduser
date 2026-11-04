using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeHud
    {
        Material prototypeCMaterial;
        Texture2D prototypeCCooldownDisc;
        List<RenderTexture> prototypeCArtwork;
        RenderTexture prototypeCLeftFrame,prototypeCRightFrame,prototypeCGargoyleL,prototypeCGargoyleR,prototypeCCrest;
        static RenderTexture PrototypeCTarget(string name,int width,int height)
        {
            // C shader output and the sRGB write deliberately match the C CPU artwork's stored RGB bytes.
            var target=new RenderTexture(width,height,0,RenderTextureFormat.ARGB32,RenderTextureReadWrite.sRGB){name=name,
                filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};
            try{
                if(!target.Create())throw new InvalidOperationException("Cannot create C HUD target "+name);
                return target;
            }catch{target.Release();Release(target);throw;}
        }
        RenderTexture PrototypeCArtTarget(string name,int width,int height)
        {
            var target=PrototypeCTarget(name,width,height);prototypeCArtwork.Add(target);return target;
        }
        void PrototypeCBlit(RenderTexture target,int mode,Texture source=null)
        {
            var old=RenderTexture.active;bool oldWrite=GL.sRGBWrite;prototypeCMaterial.SetFloat("_Mode",mode);
            try{GL.sRGBWrite=QualitySettings.activeColorSpace==ColorSpace.Linear;
                Graphics.Blit(source??Texture2D.whiteTexture,target,prototypeCMaterial,0);}
            finally{GL.sRGBWrite=oldWrite;RenderTexture.active=old;}
        }
        RenderTexture PrototypeCSilver(Texture source,string name,Rect crop,bool mirror=false,float fadeRight=0,float fadeBottom=0,bool frameAperture=false)
        {
            // Source crops use a top-left origin. RenderTexture UVs use a bottom-left origin.
            var target=PrototypeCArtTarget(name,Mathf.RoundToInt(crop.width),Mathf.RoundToInt(crop.height));
            prototypeCMaterial.SetVector("_UvRect",new Vector4(crop.x/source.width,1-crop.yMax/source.height,
                crop.width/source.width,crop.height/source.height));
            prototypeCMaterial.SetFloat("_Flip",mirror?1:0);prototypeCMaterial.SetFloat("_FadeRight",fadeRight);
            prototypeCMaterial.SetFloat("_FadeBottom",fadeBottom);
            prototypeCMaterial.SetFloat("_FrameAperture",frameAperture?1:0);PrototypeCBlit(target,2,source);return target;
        }
        void EnsurePrototypeC(float width,float height)
        {
            if(prototypeLayout!=null&&prototypeWidth==width&&prototypeHeight==height)return;
            DisposePrototype();prototypeWidth=width;prototypeHeight=height;
            prototypeSlots=new RenderTexture[13];prototypeArtwork=new List<Texture2D>();
            prototypeStyles=new Dictionary<int,GUIStyle>();prototypeCArtwork=new List<RenderTexture>();
            var l=NativeHudPrototypeLayout.Create(HudPrototypeMode.C,width,height);
            try{
                prototypeSemibold=Required<Font>("Art/fonts/Cinzel-600");prototypeRegular=Required<Font>("Art/fonts/Cinzel-400");
                prototypeBody=Required<Font>("Art/fonts/Hahmlet-300-ko");
                // A/B socket shader remains untouched; C liquid and silver conversion are separate.
                prototypeMaterial=new Material(Required<Shader>("Shaders/HudPrototype"));
                prototypeCMaterial=new Material(Required<Shader>("Shaders/HudPrototypeC"));
                prototypePlate=OwnPrototypeArt(NativeHudPrototypeCArt.Plate(l.Plate.Width,l.Plate.Height,l.Chamfer));
                prototypePedestal=OwnPrototypeArt(NativeHudPrototypeCArt.Plate(l.Pedestal.Width,l.Pedestal.Height,8,true));
                prototypeRail=OwnPrototypeArt(NativeHudPrototypeCArt.Rail(l.Rail.Width,
                    l.LeftLiquid.X+l.Liquid/2-l.Rail.X,l.RightLiquid.X+l.Liquid/2-l.Rail.X));
                prototypeHair=OwnPrototypeArt(NativeHudPrototypeArt.Hair());prototypeChip=OwnPrototypeArt(NativeHudPrototypeArt.Chip());
                prototypeMouseL=OwnPrototypeArt(NativeHudPrototypeArt.Mouse(false));prototypeMouseR=OwnPrototypeArt(NativeHudPrototypeArt.Mouse(true));
                prototypeCLeftFrame=PrototypeCSilver(hpFrame,"H4 source HP skull horns",new Rect(0,0,hpFrame.width,hpFrame.height),frameAperture:true);
                prototypeCRightFrame=PrototypeCSilver(mpFrame,"H4 source MP skull horns",new Rect(0,0,mpFrame.width,mpFrame.height),frameAperture:true);
                var gargoyleCrop=new Rect(150,75,215,245);
                prototypeCGargoyleL=PrototypeCSilver(bar,"H4 source left gargoyle",gargoyleCrop,false,.28f);
                prototypeCGargoyleR=PrototypeCSilver(bar,"H4 source right gargoyle",gargoyleCrop,true,.28f);
                prototypeCCrest=PrototypeCSilver(bar,"H4 source center crest",new Rect(1120,100,220,62),false,0,.20f);
                prototypeHp=PrototypeCTarget("H4 HP liquid",512,512);prototypeResources=PrototypeCTarget("H4 MP ST liquid",512,512);
                for(int i=0;i<13;i++)prototypeSlots[i]=PrototypeTarget("H4 slot "+i,128);
                prototypeLayout=l;
            }catch{DisposePrototype();throw;}
        }
        void RefreshPrototypeCLiquids(Simulation simulation)
        {
            prototypeCMaterial.SetFloat("_Diameter",prototypeLayout.Liquid);
            prototypeCMaterial.SetFloat("_HpTranslate",hpLevel.Value);prototypeCMaterial.SetFloat("_Mana",manaLevel.Value);
            prototypeCMaterial.SetFloat("_Stamina",staminaLevel.Value);prototypeCMaterial.SetFloat("_Hurt",FeelHurtActive?1:0);
            PrototypeCBlit(prototypeHp,0);PrototypeCBlit(prototypeResources,1);RefreshMobility(simulation);
        }
        bool TryDrawPrototypeC(float width,float height,string activeAttack,Simulation simulation)
        {
            if(values==null)return true;
            EnsurePrototypeC(width,height);ActiveSkill=activeAttack;var l=prototypeLayout;var oldColor=GUI.color;
            try{
                GUI.color=Color.white;
                if(Event.current.type==EventType.Repaint)RefreshPrototypeCLiquids(simulation);
                NativeUiAudit.Region(ProtoRect(l.LeftFrame),"component","hud-proto-c-hp","H4 C original HP frame");
                NativeUiAudit.Region(ProtoRect(l.RightFrame),"component","hud-proto-c-resources","H4 C original MP/ST frame");
                NativeUiAudit.Region(ProtoRect(l.Plate),"component","hud-proto-c-skills","H4 C transparent support");
                NativeUiAudit.DrawTexture(ProtoRect(l.Rail),prototypeRail,ScaleMode.StretchToFill,true);
                NativeUiAudit.DrawTexture(ProtoRect(l.Plate),prototypePlate,ScaleMode.StretchToFill,true);
                NativeUiAudit.DrawTexture(ProtoRect(l.Pedestal),prototypePedestal,ScaleMode.StretchToFill,true);
                NativeUiAudit.DrawTexture(ProtoRect(l.Emblem),prototypeCCrest,ScaleMode.StretchToFill,true);
                PrototypeCGlobe(false,simulation);PrototypeCGlobe(true,simulation);
                float gw=215*.18f,gh=245*.18f,gY=l.Plate.Y-gh*.70f;
                NativeUiAudit.DrawTexture(new Rect(l.LeftLiquid.X+l.Liquid/2+90,gY,gw,gh),prototypeCGargoyleL,ScaleMode.StretchToFill,true);
                NativeUiAudit.DrawTexture(new Rect(l.RightLiquid.X+l.Liquid/2-90-gw,gY,gw,gh),prototypeCGargoyleR,ScaleMode.StretchToFill,true);
                for(int i=0;i<13;i++)PrototypeCSlot(i,activeAttack,simulation);
                PrototypeStatus(width,simulation);
            }finally{GUI.color=oldColor;}
            return true;
        }
        void PrototypeCGlobe(bool right,Simulation simulation)
        {
            var l=prototypeLayout;var frame=right?l.RightFrame:l.LeftFrame;var liquid=right?l.RightLiquid:l.LeftLiquid;
            NativeUiAudit.DrawTexture(ProtoRect(liquid),right?prototypeResources:prototypeHp,ScaleMode.StretchToFill,true);
            NativeUiAudit.DrawTexture(ProtoRect(frame),right?prototypeCRightFrame:prototypeCLeftFrame,ScaleMode.StretchToFill,true);
            // NativeHud.Globe source registration, scaled from logical liquid175. These are presentation coordinates only.
            float scale=l.Liquid/175;Rect ring=new Rect(liquid.X+11*scale,liquid.Y+18.65f*scale,153*scale,153*scale);
            if(!right)NativeUiAudit.DrawTexture(ring,shield,ScaleMode.StretchToFill,true);
            else if(simulation!=null&&mobilityDrawn>=0)NativeUiAudit.DrawTexture(ring,mobility,ScaleMode.StretchToFill,true);
            int index=right?2:0;
            for(int i=0;i<2;i++)if(eyes[index+i])NativeUiAudit.DrawTexture(new Rect(liquid.X+((i==0?76.5f:93.5f)-4)*scale,
                liquid.Y-13*scale,15*scale,15*scale),eye,ScaleMode.StretchToFill,true);
            float cx=liquid.X+l.Liquid/2,cy=l.OrbCenterY-2;
            if(!right&&values.HpValid){
                PrototypeText(new Rect(liquid.X,cy-l.HpCurrentFont*.62f,l.Liquid,l.HpCurrentFont),values.HpCurrentText,
                    l.HpCurrentFont,l.HpCurrentFont*.02f,ProtoColor(230,227,220),shadow:HudPrototypeShadow.Resource);
                NativeUiAudit.DrawTexture(new Rect(cx-22,cy+l.HpCurrentFont*.48f,44,1),prototypeHair,ScaleMode.StretchToFill,true);
                PrototypeText(new Rect(liquid.X,cy+l.HpCurrentFont*.48f+5,l.Liquid,l.HpMaximumFont),PrototypeMaximum(values.HpMaximumText),
                    l.HpMaximumFont,l.HpMaximumFont*.04f,ProtoColor(167,164,157),true,shadow:HudPrototypeShadow.Resource);
            }
            if(right){
                if(values.ManaValid)PrototypeCResource(liquid,0,"MP",values.ManaCurrentText,values.ManaMaximumText,cy);
                if(values.StaminaValid)PrototypeCResource(liquid,1,"ST",values.StaminaCurrentText,values.StaminaMaximumText,cy);
            }
        }
        void PrototypeCResource(HudProtoRect liquid,int side,string label,string current,string maximumText,float cy)
        {
            var l=prototypeLayout;float x=liquid.X+side*l.Liquid/2,w=l.Liquid/2,f=l.ResourceCurrentFont;
            PrototypeText(new Rect(x,cy-f*.62f-18,w,12),label,12,2.4f,ProtoColor(230,227,220),shadow:HudPrototypeShadow.Resource);
            PrototypeText(new Rect(x,cy-f*.62f,w,f),current,f,f*.02f,ProtoColor(230,227,220),shadow:HudPrototypeShadow.Resource);
            NativeUiAudit.DrawTexture(new Rect(x+w/2-14,cy+f*.48f,28,1),prototypeHair,ScaleMode.StretchToFill,true);
            PrototypeText(new Rect(x,cy+f*.48f+4,w,l.ResourceMaximumFont),PrototypeMaximum(maximumText),l.ResourceMaximumFont,
                l.ResourceMaximumFont*.04f,ProtoColor(167,164,157),true,shadow:HudPrototypeShadow.Resource);
        }
        void PrototypeCSlot(int index,string activeAttack,Simulation simulation)
        {
            var l=prototypeLayout;Rect r=ProtoRect(l.Slot(index));
            string id=index==6?(activeAttack=="kiSlash"?"kiSlash":null):simulation==null?null:SlotSkillId(simulation,index);
            Texture2D artwork=null;
            if(id!=null&&!slotIcons.TryGetValue(id,out artwork)){artwork=Resources.Load<Texture2D>("Art/ui/skill_icons/orb/"+id);slotIcons[id]=artwork;}
            float total=0,cd=id!=null&&simulation!=null?simulation.SkillCooldown(id,out total):0;
            float rage=index==12&&simulation!=null?RageFill(simulation.Rage,simulation.RageMaximum):0;
            if(Event.current.type==EventType.Repaint){
                prototypeMaterial.SetFloat("_Diameter",r.width);prototypeMaterial.SetFloat("_HasIcon",artwork!=null?1:0);
                prototypeMaterial.SetFloat("_Selected",index==6&&activeAttack=="kiSlash"?1:0);
                prototypeMaterial.SetFloat("_Cooldown",total>0?Mathf.Clamp01(cd/total):0);prototypeMaterial.SetFloat("_Rage",rage);
                PrototypeBlit(prototypeSlots[index],3,artwork);
                if(index==6&&artwork!=null)IconDrawn=true;
            }
            NativeUiAudit.DrawTexture(r,prototypeSlots[index],ScaleMode.StretchToFill,true);
            if(cd>0&&total>0)PrototypeCCooldown(r,cd);
            if(rage>0){float font=Mathf.Round(r.width*.24f);PrototypeText(new Rect(r.x,r.y+Mathf.Round(r.width*.12f),r.width,font),Math.Truncate(simulation.Rage).ToString("0")+"%",font,0,ProtoColor(230,227,220),shadow:HudPrototypeShadow.Cooldown);}
            if(index==8&&simulation!=null){
                float ratio=MobilityRatio(simulation);Rect gauge=new Rect(r.x+r.width*.2f,r.yMax-6,r.width*.6f,2);
                PrototypeFill(gauge,ProtoColor(44,46,49,.95f));gauge.width*=ratio;PrototypeFill(gauge,ratio<.5f?ProtoColor(194,26,16):ProtoColor(201,199,195));
            }
            PrototypeKey(index,r,artwork!=null);
            if(NativeSilverHellUi.Button(r,"",GUIStyle.none)){statusSelectionUntil=index==6?Time.unscaledTime+1.6f:0;SlotSelected?.Invoke(index);}
        }
        static Texture2D BakePrototypeCCooldownDisc(float diameter)
        {
            // Match the shared icon mask (radius = slot/2 - 4), including its 1px AA edge.
            return NativeSilverHellUi.Effect(Mathf.CeilToInt(diameter*2),Mathf.CeilToInt(diameter*2),(u,v)=>{
                float x=(u-.5f)*diameter,y=(v-.5f)*diameter;
                float cover=Mathf.Clamp01(diameter*.5f-3.5f-Mathf.Sqrt(x*x+y*y));
                return new Color(0,0,0,.55f*cover);
            });
        }
        void PrototypeCCooldown(Rect r,float cd)
        {
            if(prototypeCCooldownDisc==null)prototypeCCooldownDisc=OwnPrototypeArt(BakePrototypeCCooldownDisc(r.width));
            NativeUiAudit.DrawTexture(r,prototypeCCooldownDisc,ScaleMode.StretchToFill,true);
            float font=Mathf.Round(r.width*.36f);string text=Mathf.CeilToInt(cd/60).ToString();
            Rect box=new Rect(r.x,r.center.y-font*.5f,r.width,font);
            // Eight 1px-offset glyph fills, then the original Cinzel foreground. No stroke/blur.
            for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++)if(x!=0||y!=0)
                PrototypeText(new Rect(box.x+x,box.y+y,box.width,box.height),text,font,0,ProtoColor(15,15,16));
            PrototypeText(box,text,font,0,ProtoColor(230,227,220));
        }
        void DisposePrototypeC()
        {
            prototypeCCooldownDisc=null;
            if(prototypeCArtwork!=null){foreach(var target in prototypeCArtwork)if(target!=null){target.Release();Release(target);}
                prototypeCArtwork.Clear();prototypeCArtwork=null;}
            if(prototypeCMaterial!=null)Release(prototypeCMaterial);prototypeCMaterial=null;
            prototypeCLeftFrame=null;prototypeCRightFrame=null;prototypeCGargoyleL=null;prototypeCGargoyleR=null;prototypeCCrest=null;
        }
    }
}
