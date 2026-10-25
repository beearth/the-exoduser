using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeLobby {
  // Source cin-enter-engraved.css fades the invitation over 1.1s;
  // index.html fades the door during the last 1.5s of its actual video clock.
  public float GateInvitationOpacity {get{return Flow.Page==LobbyPage.Title?1:Flow.Page==LobbyPage.Gate?1-Mathf.SmoothStep(0,1,since/1.1f):0;}}
  public float GateMovieOpacity {get{return Flow.Page!=LobbyPage.Gate||movie.Duration<=0?1:Mathf.SmoothStep(0,1,(float)((movie.Duration-movie.Time)/1.5));}}
  public bool UsesGatePoster {get{return Flow.Page==LobbyPage.Title||Flow.Page==LobbyPage.Gate;}}
  void DrawCinematicMovie(){
   var color=GUI.color;GUI.color=new Color(color.r,color.g,color.b,color.a*GateMovieOpacity);
   // The next decoder is preparing: keep black, never flash the closed door.
   DrawMovie(new Rect(0,0,1920,1080),UsesGatePoster?gatePoster:null,false);GUI.color=color;
  }
  void DrawGatePresentation(){
   float opacity=GateInvitationOpacity;if(opacity<=0)return;
   var color=GUI.color;bool enabled=GUI.enabled;GUI.color=new Color(color.r,color.g,color.b,color.a*opacity);
   GUI.enabled=enabled&&Flow.Page==LobbyPage.Title;DrawGate();GUI.enabled=enabled;GUI.color=color;
  }
 }
}
