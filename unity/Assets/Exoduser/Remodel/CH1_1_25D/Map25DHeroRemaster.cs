using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // 05:00 CTO exception: opt-in map review only. Source Sprite, animation,
    // original PPU, Core timing and contact registration are never replaced.
    public static class Map25DHeroRemaster
    {
        public static readonly bool Requested=Array.IndexOf(Environment.GetCommandLineArgs(),"--map25d-hero-remaster")>=0;
        static readonly Dictionary<string,Texture2D> cache=new Dictionary<string,Texture2D>();
        [Serializable] sealed class Registration {public RegistrationCell[] records;}
        [Serializable] sealed class RegistrationCell {public string name;public int x,y,delta;}
        static readonly Dictionary<string,int> registration=new Dictionary<string,int>();static bool loaded;
        public static bool TryGet(Sprite original,out Texture2D texture,out Rect rect,out int a64Offset)
        {
            texture=null;rect=default;a64Offset=0;if(!Requested||original==null)return false;
            string name=original.texture.name;
            switch(name){case "south":case "south-east":case "east":case "north-east":case "north":case "north-west":case "west":case "south-west":case "attack-bat-v1":break;default:return false;}
            if(Resources.Load<Texture2D>("Art/player/"+name)!=original.texture)return false;
            if(!cache.TryGetValue(name,out texture)){texture=Resources.Load<Texture2D>("Map25D/HeroRemaster/"+name);cache.Add(name,texture);}
            if(texture==null)return false;
            if(!loaded){var data=Resources.Load<TextAsset>("Map25D/HeroRemaster/registration");if(data==null)throw new InvalidOperationException("Map25D hero A64 registration missing");foreach(var cell in JsonUtility.FromJson<Registration>(data.text).records)registration.Add(cell.name+":"+cell.x+":"+cell.y,cell.delta);loaded=true;}
            if(!registration.TryGetValue(name+":"+(int)original.textureRect.x+":"+(int)original.textureRect.y,out a64Offset))return false;
            rect=original.textureRect;rect=new Rect(rect.x*2,rect.y*2,rect.width*2,rect.height*2);
            if(texture.width!=original.texture.width*2||texture.height!=original.texture.height*2||rect.xMax>texture.width||rect.yMax>texture.height)throw new InvalidOperationException("Map25D hero candidate must be exact 2x source atlas: "+name);
            return true;
        }
    }
}
