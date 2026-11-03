using UnityEngine;

namespace Exoduser.UnityPort
{
    [DefaultExecutionOrder(29000)]
    public sealed class GB1bWallFade : MonoBehaviour
    {
        public Camera Viewer;
        void LateUpdate()
        {
            var game=NativeGame.Instance;if(Viewer==null||game==null||game.Simulation==null)return;
            var p=game.Simulation.Player;var foot=Map25DContactShadows.GroundedPoint(NativeRemodel3D.Point(p.X,p.Y));
            Shader.SetGlobalVector("_GB1bEye",Viewer.transform.position);
            Shader.SetGlobalVector("_GB1bHero",foot+Vector3.up*1.15f);
        }
    }
}
