using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort {
 // Presentation only. Materials, costs and save keys remain owned by Core.
 public static class NativeCurrencyOrb {
  static readonly Texture2D[] art=new Texture2D[4];
  struct Flight {public Vector2 from;public float start;}
  static readonly List<Flight> flights=new List<Flight>();
  public static int Stage(int amount){return amount>=100000?3:amount>=15000?2:amount>=1000?1:0;}
  public static Texture2D Texture(int amount){int i=Stage(amount);if(art[i]==null)art[i]=Resources.Load<Texture2D>("Art/ui/currency/malice-orb-stage-"+(i+1));return art[i];}
  public static void Draw(Rect rect,int amount){var image=Texture(amount);if(image!=null){var old=GUI.color;GUI.color=Color.white;NativeUiAudit.DrawTexture(rect,image,ScaleMode.ScaleToFit,true);GUI.color=old;}}
  public static void Emit(Vector2 viewport){if(flights.Count<16)flights.Add(new Flight{from=new Vector2(viewport.x,1-viewport.y),start=Time.unscaledTime});}
  public static void DrawFlights(Rect target,float width,float height){
   for(int i=flights.Count-1;i>=0;i--){
    var f=flights[i];float t=(Time.unscaledTime-f.start)/.62f;
    if(t>=1){flights.RemoveAt(i);continue;}
    float p=Mathf.Clamp01(t),ease=p*p*(3-2*p);
    var from=new Vector2(f.from.x*width,f.from.y*height);
    var at=Vector2.Lerp(from,target.center,ease);at.y-=Mathf.Sin(p*Mathf.PI)*30;
    float size=Mathf.Lerp(20,4,p);Draw(new Rect(at.x-size/2,at.y-size/2,size,size),0);
   }
  }
 }
}
