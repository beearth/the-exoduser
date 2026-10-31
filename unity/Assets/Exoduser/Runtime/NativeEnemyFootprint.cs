using System;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // 원본 PNG alpha>=32인 픽셀이 3개 이상 있는 최하단/최상단 행. 투명 여백을 접지 높이로 더하지 않는다.
    public static class NativeEnemyFootprint
    {
        [Serializable] sealed class Atlas { public string name;public int columns;public int[] bottom,top; }
        [Serializable] sealed class Data { public Atlas[] atlases; }
        static Data data;static bool loaded;
        static bool Cell(Sprite sprite,out Atlas atlas,out int index)
        {
            atlas=null;index=0;if(sprite==null||!sprite.texture.name.StartsWith("atlas_ch1_8dir",StringComparison.Ordinal))return false;
            if(!loaded){loaded=true;var text=Resources.Load<TextAsset>("Data/enemy_footprints");if(text!=null)data=JsonUtility.FromJson<Data>(text.text);}
            if(data==null)return false;
            foreach(var a in data.atlases)if(a.name==sprite.texture.name)
            {
                int column=Mathf.RoundToInt(sprite.rect.x/256),row=Mathf.RoundToInt((sprite.texture.height-sprite.rect.y-sprite.rect.height)/256);
                int i=row*a.columns+column;if(i<0||i>=a.bottom.Length)return false;atlas=a;index=i;return true;
            }
            return false;
        }
        public static float FootLift(Sprite sprite)
        {
            if(!Cell(sprite,out var atlas,out var i))return sprite.pivot.y/sprite.pixelsPerUnit;
            return (sprite.pivot.y-atlas.bottom[i])/sprite.pixelsPerUnit;
        }
        public static float Top(Sprite sprite)
        {
            if(!Cell(sprite,out var atlas,out var i))return (sprite.rect.height-sprite.pivot.y)/sprite.pixelsPerUnit;
            return (sprite.rect.height-atlas.top[i]-sprite.pivot.y)/sprite.pixelsPerUnit;
        }
    }
}
