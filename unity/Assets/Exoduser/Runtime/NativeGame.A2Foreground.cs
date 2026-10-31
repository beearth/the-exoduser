using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        void A2Foreground(bool grounded=false)
        {
            var tree=A2Module("Hollow_Loft_Tree",31,grounded?-76:-84,.75f,1.15f,.75f,-25,-.2f,false);
            if(tree!=null){tree.name="A2 전경 바깥 거목";if(!grounded)A2OutsidePlay(tree);}
            int placed=0,attached=0;
            var sites=grounded?new[]{new Vector4(34.5f,-80.7f,1.7f,8)}:new[]{new Vector4(36.7f,-81.5f,2.2f,-20),new Vector4(33.4f,-81,1.75f,62)};
            foreach(var p in sites)
            {
                var log=A2Module("Scanned_Foreground_Log",p.x,p.y,p.z,grounded?1.1f:p.x>35?2:1.7f,grounded?.8f:1.4f,p.w,grounded?.08f:-.25f,false);if(log==null)continue;
                log.name="A2 전경 부패목질";A2OutsidePlay(log);if(!grounded)log.transform.position+=Vector3.up*(p.x>35?2.2f:1);placed++;
                foreach(float offset in new[]{-1.2f,-.2f,.8f})
                {
                    var desired=log.transform.TransformPoint(new Vector3(offset,0,0));Vector3 hit;
                    if(!A2UpperSurfaceVertex(log,desired,out hit))continue;
                    var moss=A2Module("Hanging_Moss",hit.x,hit.z,grounded?.3f:.55f,grounded?.4f:.7f,grounded?.3f:.5f,p.w+90);if(moss==null)continue;moss.name="A2 전경 목질 수염이끼";
                    var renderers=moss.GetComponentsInChildren<MeshRenderer>();var bounds=renderers[0].bounds;foreach(var renderer in renderers)bounds.Encapsulate(renderer.bounds);
                    moss.transform.position+=hit-Vector3.up*.02f-new Vector3(bounds.center.x,bounds.max.y,bounds.center.z);
                    bounds=renderers[0].bounds;foreach(var renderer in renderers)bounds.Encapsulate(renderer.bounds);
                    if(bounds.max.z> -80.05f){moss.SetActive(false);Destroy(moss);continue;}
                    foreach(var renderer in renderers){var block=new MaterialPropertyBlock();block.SetColor("_BaseColor",new Color(.65f,.62f,.48f,1));renderer.SetPropertyBlock(block);}attached++;
                }
            }
            Debug.Log("[A2] 전경 목질 "+placed+"개/실제 윗면 정점 이끼 "+attached+"개. 통나무z<=-80.05/거목하부 원본통행 밖으로 접합");
        }
        static void A2OutsidePlay(GameObject root)
        {
            var renderers=root.GetComponentsInChildren<MeshRenderer>();if(renderers.Length==0)return;var bounds=renderers[0].bounds;foreach(var renderer in renderers)bounds.Encapsulate(renderer.bounds);
            if(bounds.max.z> -80.05f)root.transform.position+=Vector3.back*(bounds.max.z+80.05f);
        }
        static bool A2UpperSurfaceVertex(GameObject root,Vector3 desired,out Vector3 hit)
        {
            hit=Vector3.zero;float best=float.MaxValue;
            foreach(var filter in root.GetComponentsInChildren<MeshFilter>())
            {
                var mesh=filter.sharedMesh;if(!mesh.isReadable)continue;var vertices=mesh.vertices;var normals=mesh.normals;
                for(int i=0;i<vertices.Length;i++)
                {
                    if(normals.Length!=vertices.Length||filter.transform.TransformDirection(normals[i]).y<.25f)continue;
                    var point=filter.transform.TransformPoint(vertices[i]);float dx=point.x-desired.x,dz=point.z-desired.z,score=dx*dx+dz*dz-.05f*point.y;
                    if(score>=best)continue;best=score;hit=point;
                }
            }
            return best<float.MaxValue;
        }
    }
}
