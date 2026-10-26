using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Source59905-60009: pets render after actors, cat then crow then xbow.
    internal sealed class NativePetView : IDisposable
    {
        readonly GameObject root,xbowRoot;
        readonly SpriteRenderer crow,cat,crowShadow,catShadow,xbowShadow,xbowGlow;
        static readonly int ColorId=Shader.PropertyToID("_Color");
        readonly SpriteRenderer[] eyes=new SpriteRenderer[6],xbowParts=new SpriteRenderer[6];
        readonly Color[] xbowColors=new Color[6];
        readonly Sprite[] crowStatic=new Sprite[8],catStatic=new Sprite[8];
        readonly Sprite[][] idle=new Sprite[2][],run=new Sprite[3][];
        readonly List<Sprite> owned=new List<Sprite>();
        readonly Texture2D circle;
        public readonly Texture2D[] Flames=new Texture2D[4];
        public readonly Texture2D CrowPortrait,CatPortrait;
        static readonly string[] Dirs={"east","south-east","south","south-west","west","north-west","north","north-east"};
        public NativePetView(Transform parent)
        {
            root=new GameObject("Source pets");root.transform.SetParent(parent,false);
            for(int i=0;i<8;i++){crowStatic[i]=Load("crow/"+Dirs[i]);catStatic[i]=Load("cat/"+Dirs[i]);}
            for(int g=0;g<2;g++)idle[g]=Frames("idle/"+(g==0?"south":"south-west"),g==0?8:2);
            for(int g=0;g<3;g++)run[g]=Frames("running-4-frames/"+(g==0?"south":g==1?"south-west":"west"),4);
            for(int i=0;i<4;i++)Flames[i]=Texture("flame0"+(i+1));
            CrowPortrait=Texture("crow/portrait");CatPortrait=Texture("cat/portrait");
            // Source canvas circles/ellipses: cache once; no new bitmap art or frame-time rasterization.
            circle=new Texture2D(64,64,TextureFormat.RGBA32,false){name="Source pet canvas circle",filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};
            var pixels=new Color32[4096];for(int y=0;y<64;y++)for(int x=0;x<64;x++){
                float d=Mathf.Sqrt((x+.5f-32)*(x+.5f-32)+(y+.5f-32)*(y+.5f-32));
                pixels[y*64+x]=new Color32(255,255,255,(byte)Mathf.RoundToInt(Mathf.Clamp01(32-d)*255));}
            circle.SetPixels32(pixels);circle.Apply(false,true);
            var disc=Sprite.Create(circle,new Rect(0,0,64,64),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);owned.Add(disc);
            var white=Sprite.Create(Texture2D.whiteTexture,new Rect(0,0,Texture2D.whiteTexture.width,Texture2D.whiteTexture.height),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);owned.Add(white);
            catShadow=Create("DIROI shadow",disc,31000);cat=Create("DIROI",catStatic[2],31001);
            crowShadow=Create("HECTOR shadow",disc,31010);crow=Create("HECTOR",crowStatic[2],31011);
            for(int i=0;i<6;i++)eyes[i]=Create("Pet eye",disc,i<2?31012+i:31002+i);
            xbowRoot=new GameObject("Ghost crossbow");xbowRoot.transform.SetParent(root.transform,false);
            xbowGlow=Create("Crossbow glow",disc,31020);
            xbowParts[0]=RectPart(white,"Crossbow body",new Vector2(0,0),12,5,new Color(85/255f,119/255f,170/255f),0);
            xbowParts[1]=Line(white,new Vector2(5,-6),new Vector2(8,0),1.5f,new Color(119/255f,153/255f,204/255f),1);
            xbowParts[2]=Line(white,new Vector2(8,0),new Vector2(5,6),1.5f,new Color(119/255f,153/255f,204/255f),2);
            xbowParts[3]=Line(white,new Vector2(5,-6),new Vector2(3,0),.7f,new Color(170/255f,204/255f,1),3);
            xbowParts[4]=Line(white,new Vector2(3,0),new Vector2(5,6),.7f,new Color(170/255f,204/255f,1),4);
            xbowParts[5]=RectPart(white,"Loaded arrow",new Vector2(1,0),10,1,new Color(221/255f,238/255f,1),5);
            // Source triangle (7,0),(5,-1.5),(5,1.5), cached mesh with the same vertices.
            arrowMesh=new Mesh{name="Source loaded arrowhead"};arrowMesh.vertices=new[]{new Vector3(.07f,0,0),new Vector3(.05f,.015f,0),new Vector3(.05f,-.015f,0)};
            arrowMesh.triangles=new[]{0,1,2};arrowMesh.RecalculateBounds();
            arrowMesh.colors=new[]{Color.white,Color.white,Color.white};
            var arrow=new GameObject("Loaded arrowhead");arrow.transform.SetParent(xbowRoot.transform,false);
            arrow.AddComponent<MeshFilter>().sharedMesh=arrowMesh;arrowRenderer=arrow.AddComponent<MeshRenderer>();arrowRenderer.sortingOrder=31021;
            arrowMaterial=new Material(Shader.Find("Sprites/Default"));arrowRenderer.sharedMaterial=arrowMaterial;
            arrowProperties=new MaterialPropertyBlock();
            xbowShadow=Create("Crossbow shadow",disc,31022);
        }
        readonly Mesh arrowMesh;readonly MeshRenderer arrowRenderer;readonly Material arrowMaterial;readonly MaterialPropertyBlock arrowProperties;
        Texture2D Texture(string key){var t=Resources.Load<Texture2D>("Art/pets/"+key);if(t==null)throw new InvalidOperationException("Missing source pet art "+key);return t;}
        Sprite Load(string key){var t=Texture(key);var s=Sprite.Create(t,new Rect(0,0,t.width,t.height),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);owned.Add(s);return s;}
        Sprite[] Frames(string key,int count){var a=new Sprite[count];for(int i=0;i<count;i++)a[i]=Load("cat/"+key+"/frame_"+i.ToString("D3"));return a;}
        SpriteRenderer Create(string name,Sprite sprite,int order){var go=new GameObject(name);go.transform.SetParent(root.transform,false);var r=go.AddComponent<SpriteRenderer>();r.sprite=sprite;r.sortingOrder=order;return r;}
        SpriteRenderer RectPart(Sprite sprite,string name,Vector2 at,float w,float h,Color color,int index){
            var r=Create(name,sprite,31021);r.transform.SetParent(xbowRoot.transform,false);r.transform.localPosition=World(at.x,at.y);
            r.transform.localScale=new Vector3(w/sprite.rect.width,h/sprite.rect.height,1);r.color=color;xbowColors[index]=color;return r;}
        SpriteRenderer Line(Sprite s,Vector2 a,Vector2 b,float width,Color color,int index){
            var d=b-a;var r=RectPart(s,"Crossbow line",(a+b)*.5f,d.magnitude,width,color,index);
            r.transform.localRotation=Quaternion.Euler(0,0,-Mathf.Atan2(d.y,d.x)*Mathf.Rad2Deg);return r;}
        static Vector3 World(double x,double y){return new Vector3((float)x/100,-(float)y/100,0);}
        static void Place(SpriteRenderer r,double x,double y,float width,float height,Color color){
            r.transform.position=World(x,y);r.transform.localScale=new Vector3(width/r.sprite.rect.width,height/r.sprite.rect.height,1);r.color=color;}
        public void Render(SourcePets pets)
        {
            var c=pets.Cat;var b=pets.Crow;double cy=c.Y+Math.Sin(c.T*.06),by=b.Y+Math.Sin(b.T*.1)*2;
            int dir=c.Direction;cat.sprite=c.Moving?run[SourcePets.CatRunGroup(dir)][(int)(c.T*.08)%4]:idle[SourcePets.CatIdleGroup(dir)][(int)(c.T*.04)%idle[SourcePets.CatIdleGroup(dir)].Length];
            cat.flipX=c.Moving?SourcePets.CatRunFlip(dir):SourcePets.CatIdleFlip(dir);
            if(cat.sprite==null){cat.sprite=catStatic[dir];cat.flipX=false;}
            crow.sprite=crowStatic[b.Direction]; // Source _fly table never registered.
            Place(cat,c.X,cy,24,24,Color.white);Place(crow,b.X,by,24,24,Color.white);
            Place(catShadow,c.X,cy+3,6,2.4f,new Color(0,0,0,.15f));Place(crowShadow,b.X,by+10,8,2.4f,new Color(0,0,0,.08f));
            float eg=(float)(.4+.3*Math.Sin(b.T*.08));
            Place(eyes[0],b.X-3,by-3,10,10,new Color(1,34/255f,0,eg*.3f));Place(eyes[1],b.X-3,by-3,4,4,new Color(1,68/255f,34/255f,eg));
            eg=(float)(.4+.3*Math.Sin(c.T*.06));
            for(int i=0;i<2;i++){
                Place(eyes[2+i],c.X+(i==0?-3:3),cy-4,8,8,new Color(170/255f,68/255f,1,eg*.3f));
                Place(eyes[4+i],c.X+(i==0?-3:3),cy-4,3,3,new Color(204/255f,136/255f,1,eg));}
            var x=pets.Xbow;double xy=x.Y+Math.Sin(x.T*.08)*3;
            xbowRoot.transform.position=World(x.X,xy);
            Place(xbowGlow,x.X,xy,20,20,new Color(102/255f,136/255f,204/255f,(float)(.12+Math.Sin(x.T*.06)*.06)));
            float alpha=(float)(.7+Math.Sin(x.T*.1)*.15);
            for(int i=0;i<6;i++){var color=xbowColors[i];color.a=alpha;xbowParts[i].color=color;}
            arrowProperties.SetColor(ColorId,new Color(221/255f,238/255f,1,alpha));arrowRenderer.SetPropertyBlock(arrowProperties);
            Place(xbowShadow,x.X,xy+14,10,3,new Color(0,0,0,.08f));
        }
        public void Dispose(){UnityEngine.Object.Destroy(root);foreach(var s in owned)UnityEngine.Object.Destroy(s);UnityEngine.Object.Destroy(circle);UnityEngine.Object.Destroy(arrowMesh);UnityEngine.Object.Destroy(arrowMaterial);}
    }
}
