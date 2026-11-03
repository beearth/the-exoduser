using System;
using System.Collections.Generic;
namespace Exoduser.UnityPort {
 public sealed partial class NativeLobby {
  // Session-only visual review identities. The persisted roster and Core class remain Warrior.
  readonly Dictionary<string,int> rigPixelVisuals=new Dictionary<string,int>(StringComparer.Ordinal);
  bool RigPixelVisualAllowed(int visual)=>NativeRigPixelPolicy.ReviewSelectionAllowed(Environment.GetCommandLineArgs(),visual);
  bool RigPixelVisualReview=>characterVisual!=0&&RigPixelVisualAllowed(characterVisual);
  public int RigPixelSelectedVisual {
   get {int visual;return rigPixelVisuals.TryGetValue(Characters.SelectedName,out visual)&&RigPixelVisualAllowed(visual)?visual:0;}
  }
 }
}
