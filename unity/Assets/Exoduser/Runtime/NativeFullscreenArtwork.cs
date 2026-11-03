using System;
using System.Collections.Generic;
using UnityEngine;
namespace Exoduser.UnityPort {
 // Authored web expansions. Moving original footage is inserted at the manifest coordinate.
 internal static class NativeFullscreenArtwork {
  [Serializable] internal sealed class Output { public string label,resource; public int width,height,centerX; }
  [Serializable] internal sealed class Row { public int id,width,height; public string source,native; public Output[] outputs; }
  [Serializable] sealed class Catalog { public Row[] rows; }
  static Catalog catalog; static readonly Dictionary<string,Texture2D> cache=new Dictionary<string,Texture2D>();
  internal static Row Find(Texture source) {
   if(source==null)return null;
   if(catalog==null){var data=Resources.Load<TextAsset>("Data/fullscreen_wide");catalog=data==null?new Catalog():JsonUtility.FromJson<Catalog>(data.text);}
   if(catalog.rows!=null)foreach(var row in catalog.rows)if(!string.IsNullOrEmpty(row.native)&&row.native.Substring(row.native.LastIndexOf('/')+1)==source.name)return row;
   return null;
  }
  internal static bool Draw(Texture source,Rect viewport,Texture original=null,float zoom=1,float panX=0,float panY=0) {
   var reference=original??source;if(reference==null)return false;var row=Find(reference);
   Output output=null;Texture plate=reference;bool wide=Screen.width/(float)Mathf.Max(1,Screen.height)>2;
   if(wide&&row!=null&&row.outputs!=null){string label=Screen.width/(float)Screen.height<=64f/27+.001f?"21":"32";foreach(var item in row.outputs)if(item.label==label){output=item;break;}
    if(output!=null){if(!cache.TryGetValue(output.resource,out var texture)){texture=Resources.Load<Texture2D>(output.resource);cache[output.resource]=texture;}if(texture!=null)plate=texture;else output=null;}}
   float scale=Mathf.Max(viewport.width/plate.width,viewport.height/plate.height);
   var box=new Rect(viewport.center.x-plate.width*scale/2,viewport.center.y-plate.height*scale/2,plate.width*scale,plate.height*scale);
   box=new Rect(viewport.center.x+(box.x-viewport.center.x)*zoom+panX,viewport.center.y+(box.y-viewport.center.y)*zoom+panY,box.width*zoom,box.height*zoom);
   NativeUiAudit.DrawTexture(box,plate,ScaleMode.StretchToFill,false);
   if(source!=null&&source!=reference){Rect moving=output!=null?new Rect(box.x+output.centerX*scale*zoom,box.y,row.width*scale*zoom,row.height*scale*zoom):box;NativeUiAudit.DrawTexture(moving,source,ScaleMode.StretchToFill,false);}
   NativeUiAudit.Region(viewport,"component","fullscreen-authored-plate",(row==null?"original":row.id.ToString())+":"+(output==null?"original":output.label));
   return true;
  }
 }
}
