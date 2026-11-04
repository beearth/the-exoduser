using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEditor;
using UnityEngine;
using Exoduser.UnityPort;

namespace Exoduser
{
    public static partial class A2RModelsImporter
    {
        [Serializable] sealed class D5StaticReceipt {public string scope="Editor asset/geometry validation only; Player and visual gates remain pending";public int sourceGrowthCards,plannedShrubs,builtShrubs,walkableVertices,colliders;public float maxHeight,maxWidth;public List<D5StaticShrub> shrubs=new List<D5StaticShrub>();public string[] disabledKinds;}
        [Serializable] sealed class D5StaticShrub {public float x,z,height,width;public int triangles;}
        [Serializable] sealed class D5CardSet {public A2RWebAssets.Card[] cards;}
        [Serializable] sealed class D5MeshExport {public Vector3[] vertices;public int[] triangles;}
        public static int VerifyD5AndBuild()
        {
            VerifyD5Wind();var args=DevTools.ExoArgs.Get();int at=Array.IndexOf(args,"-d5StaticOutput");if(at<0||at+1>=args.Length)throw new InvalidOperationException("D5 static output required");string output=args[at+1];
            if(!Path.IsPathRooted(output)||!output.Replace('\\','/').StartsWith("I:/EXODUSER-Storage/",StringComparison.OrdinalIgnoreCase))throw new InvalidOperationException("D5 output must stay on the lane storage");Directory.CreateDirectory(output);
            var map=new SourceMap(JsonUtility.FromJson<MapData>(Resources.Load<TextAsset>("Data/ch1_map").text));var cards=JsonUtility.FromJson<D5CardSet>(Resources.Load<TextAsset>("A2R/web-assets").text).cards;
            var trees=new List<Vector2>();var receipt=new D5StaticReceipt{disabledKinds=new[]{"m_ctree14","m_ctree20","m_c1cocoon","m_c1spod"}};
            foreach(var card in cards){if(A2RProps3D.D5LowGrowth(card.kind))receipt.sourceGrowthCards++;if(card.kind.IndexOf("tree",StringComparison.Ordinal)>=0)trees.Add(new Vector2(card.x/100,-card.y/100));}
            Func<float,float,bool> walkable=(x,z)=>map.CanMove(x*100,-z*100,0);var plan=A2RProps3D.D5ShrubPlan(trees,walkable);receipt.plannedShrubs=plan.Count;
            WindRequire(Resources.Load<GameObject>("Art/map/a2/r3/Models/RF3_Withered_Shrub")!=null,"Withered_Shrub source resource");WindRequire(plan.Count>0,"nonempty off-lane shrub plan");
            // Inactive component: do not enter play mode, Awake, UI, audio or user saves.
            var holder=new GameObject("D5 inactive editor factory");holder.SetActive(false);var factory=holder.AddComponent<NativeGame>();var world=new GameObject("D5 asset geometry only");
            typeof(NativeGame).GetField("a2Root",BindingFlags.Instance|BindingFlags.NonPublic).SetValue(factory,world);
            typeof(NativeGame).GetField("a2Field",BindingFlags.Instance|BindingFlags.NonPublic).SetValue(factory,new A2FieldLayout(map.Data));
            try
            {
                foreach(var point in plan)
                {
                    var shrub=factory.D5PlaceShrub(world.transform,point.x,point.y,point.z);if(shrub==null)continue;var bounds=A2RProps3D.D5GeometryBounds(shrub);receipt.builtShrubs++;receipt.maxHeight=Mathf.Max(receipt.maxHeight,bounds.size.y);receipt.maxWidth=Mathf.Max(receipt.maxWidth,Mathf.Max(bounds.size.x,bounds.size.z));receipt.colliders+=shrub.GetComponentsInChildren<Collider>(true).Length;int tris=0;
                    foreach(var renderer in shrub.GetComponentsInChildren<MeshRenderer>(true))if(renderer.enabled){var filter=renderer.GetComponent<MeshFilter>();if(filter==null||filter.sharedMesh==null)continue;var mesh=filter.sharedMesh;tris+=mesh.triangles.Length/3;var points=mesh.vertices;foreach(var v in points){var p=filter.transform.TransformPoint(v);if(map.CanMove(p.x*100,-p.z*100,0))receipt.walkableVertices++;}
                        if(receipt.builtShrubs==1){for(int i=0;i<points.Length;i++)points[i]=filter.transform.TransformPoint(points[i])-new Vector3(bounds.center.x,bounds.min.y,bounds.center.z);File.WriteAllText(Path.Combine(output,"shrub-mesh.json"),JsonUtility.ToJson(new D5MeshExport{vertices=points,triangles=mesh.triangles}));}}
                    receipt.shrubs.Add(new D5StaticShrub{x=point.x,z=point.y,height=bounds.size.y,width=Mathf.Max(bounds.size.x,bounds.size.z),triangles=tris});
                }
                File.WriteAllText(Path.Combine(output,"editor-static.json"),JsonUtility.ToJson(receipt,true));
                WindRequire(receipt.builtShrubs>0,"visible dry shrub instances");WindRequire(receipt.maxHeight<=A2RProps3D.D5ShrubHeight+.0001f,"shrubs <= .64m");WindRequire(receipt.maxWidth<=1.4001f,"shrub width bound");WindRequire(receipt.walkableVertices==0,"shrub geometry outside original walkable band");WindRequire(receipt.colliders==0,"no new colliders");
                Debug.Log("A2R_D5_STATIC_PASS cards="+receipt.sourceGrowthCards+" shrubs="+receipt.builtShrubs+" height="+receipt.maxHeight+" walkableVertices="+receipt.walkableVertices+" colliders="+receipt.colliders);
            }
            finally{UnityEngine.Object.DestroyImmediate(world);UnityEngine.Object.DestroyImmediate(holder);}
            return A2RBuilder.Build();
        }
    }
}
