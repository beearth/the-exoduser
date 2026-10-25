using UnityEngine;
namespace Exoduser.UnityPort
{
 // Keeps the presentation-only decoder alive with the lobby and releases its
 // native player/RenderTexture when the lobby object is destroyed.
 public sealed class NativeCharacterPresentationPlayback:MonoBehaviour
 {
  public NativeLobbyVideo Video;
  void OnApplicationFocus(bool focus){Video?.SetPlaybackAllowed(focus);}
  void OnDestroy(){Video?.Dispose();Video=null;}
 }
}
