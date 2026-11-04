using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeHud
    {
        Material prototypeCMaterial;
        List<RenderTexture> prototypeCArtwork;
        RenderTexture prototypeCLeftFrame,prototypeCRightFrame,prototypeCGargoyleL,prototypeCGargoyleR,prototypeCCrest;
        RenderTexture PrototypeCArtTarget(string name,int width,int height)
        {
            var target=new RenderTexture(width,height,0,RenderTextureFormat.ARGB32){name=name,
                filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};
            prototypeCArtwork.Add(target);
            if(!target.Create())throw new InvalidOperationException("Cannot create C HUD artwork target "+name);
            return target;
        }
        void PrototypeCBlit(RenderTexture target,int mode,Texture source=null)
        {
            var old=RenderTexture.active;prototypeCMaterial.SetFloat("_Mode",mode);
            try{Graphics.Blit(source??Texture2D.whiteTexture,target,prototypeCMaterial,0);}
            finally{RenderTexture.active=old;}
        }
        RenderTexture PrototypeCSilver(Texture source,string name,Rect crop,bool mirror=false,float fadeRight=0,float fadeBottom=0)
        {
            // Source crops use a top-left origin. RenderTexture UVs use a bottom-left origin.
            var target=PrototypeCArtTarget(name,Mathf.RoundToInt(crop.width),Mathf.RoundToInt(crop.height));
            prototypeCMaterial.SetVector("_UvRect",new Vector4(crop.x/source.width,1-crop.yMax/source.height,
                crop.width/source.width,crop.height/source.height));
            prototypeCMaterial.SetFloat("_Flip",mirror?1:0);prototypeCMaterial.SetFloat("_FadeRight",fadeRight);
            prototypeCMaterial.SetFloat("_FadeBottom",fadeBottom);PrototypeCBlit(target,2,source);return target;
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
                prototypeCLeftFrame=PrototypeCSilver(hpFrame,"H4 source HP skull horns",new Rect(0,0,hpFrame.width,hpFrame.height));
                prototypeCRightFrame=PrototypeCSilver(mpFrame,"H4 source MP skull horns",new Rect(0,0,mpFrame.width,mpFrame.height));
                var gargoyleCrop=new Rect(150,75,215,245);
                prototypeCGargoyleL=PrototypeCSilver(bar,"H4 source left gargoyle",gargoyleCrop,false,.28f);
                prototypeCGargoyleR=PrototypeCSilver(bar,"H4 source right gargoyle",gargoyleCrop,true,.28f);
                prototypeCCrest=PrototypeCSilver(bar,"H4 source center crest",new Rect(1120,100,220,62),false,0,.20f);
                prototypeHp=PrototypeTarget("H4 HP liquid",512);prototypeResources=PrototypeTarget("H4 MP ST liquid",512);
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
                for(int i=0;i<13;i++)PrototypeSlot(i,activeAttack,simulation);
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
        void DisposePrototypeC()
        {
            if(prototypeCArtwork!=null){foreach(var target in prototypeCArtwork)if(target!=null){target.Release();Release(target);}
                prototypeCArtwork.Clear();prototypeCArtwork=null;}
            if(prototypeCMaterial!=null)Release(prototypeCMaterial);prototypeCMaterial=null;
            prototypeCLeftFrame=null;prototypeCRightFrame=null;prototypeCGargoyleL=null;prototypeCGargoyleR=null;prototypeCCrest=null;
        }
    }
}
