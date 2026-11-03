using UnityEngine;

namespace Exoduser.UnityPort
{
    // A separate MonoScript asset is required for persistent prefab references.
    public sealed class GB1Grounded : MonoBehaviour
    {
        public Vector3 hitPoint,normal;
        public float embed=.04f,positiveGap;
        public bool queryHit;
        public string role;
        public Vector3[] groundContacts;
    }
}
