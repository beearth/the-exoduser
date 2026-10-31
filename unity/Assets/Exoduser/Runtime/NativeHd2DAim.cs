using UnityEngine;

namespace Exoduser.UnityPort
{
    // UNAPPLIED phase 2: invert the exact actor height function, never decorative colliders.
    public static class NativeHd2DAim
    {
        public static int LastHeightQueries{get;private set;}
        static float Gap(Ray ray,float t){var p=ray.GetPoint(t);LastHeightQueries++;return p.y-NativeRemodel3D.GroundY(p.x,p.z);}
        public static bool TryRay(Ray ray,Vector3 reference,float maxDistance,out Vector3 hit)
        {
            hit=reference;LastHeightQueries=0;if(ray.direction.y>=-.001f||maxDistance<=0)return false;
            float loY=reference.y-4,hiY=reference.y+4;var ground=NativeRemodel3D.Ground;
            if(ground!=null&&ground.terrainData!=null){loY=Mathf.Min(loY,ground.transform.position.y-2);hiY=Mathf.Max(hiY,ground.transform.position.y+ground.terrainData.size.y+2);}
            float start=Mathf.Max(0,(hiY-ray.origin.y)/ray.direction.y),end=Mathf.Min(maxDistance,(loY-ray.origin.y)/ray.direction.y);
            if(end<start)return false;
            float previous=start,above=Gap(ray,start);if(above<0)return false;
            const float step=.08f;
            for(int i=1;i<=2048;i++)
            {
                float t=Mathf.Min(end,start+i*step),gap=Gap(ray,t);
                if(gap<=0)
                {
                    float a=previous,b=t;for(int j=0;j<12;j++){float middle=(a+b)*.5f;if(Gap(ray,middle)>0)a=middle;else b=middle;}
                    hit=ray.GetPoint((a+b)*.5f);hit.y=NativeRemodel3D.GroundY(hit.x,hit.z);LastHeightQueries++;return true;
                }
                if(t>=end)return false;previous=t;above=gap;
            }
            return false;
        }
    }
}
