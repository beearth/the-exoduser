import { createTerrainScene } from '../../engine/fdg/terrain-scene.js';

const $ = id => document.getElementById(id);
const deg = value => value * 180 / Math.PI, rad = value => value * Math.PI / 180;
const text = (node, value) => { if (node.children.length) throw new Error('Text target must be a leaf'); node.textContent = String(value); };

export class TerrainScenePanel {
  constructor({ getProject, getRuntime, getSelection, isRunning, isReady, change, select, status, resetPreview }) {
    Object.assign(this,{ getProject,getRuntime,getSelection,isRunning,isReady,change,select,status,resetPreview });
    this.listeners=[];
    const listen=(id,event,fn)=>{ const node=$(id);node.addEventListener(event,fn);this.listeners.push(()=>node.removeEventListener(event,fn)); };
    listen('terrain-create','click',()=>{
      if (this.isRunning() || !this.isReady()) return;
      try {
        if (this.getProject().rigScene) throw new Error('이 시험은 리그 장면과 동시 합성을 지원하지 않습니다.');
        if (this.getProject().terrainScene) { this.status('현재 높이 시험을 계속 편집하세요.'); return; }
        const scene=createTerrainScene(this.getProject().map);
        this.change('계단·경사 시험 템플릿 연결',next=>{next.terrainScene=scene;delete next.viewCamera;});
        this.select(scene.nodes[0].id);
      } catch(error) {this.status(error.message,true);}
    });
    listen('terrain-node','change',()=>this.select($('terrain-node').value));
    listen('terrain-reset','click',()=>{
      const changed=this.edit('시험체 시작 위치',scene=>{
        const map=this.getProject().map;scene.actor ||= {};scene.actor.position=[(map.start.x+.5)*map.tileSize,(map.start.y+.5)*map.tileSize,0];
      });
      if(changed===false)this.resetPreview();
    });
    for (const direction of ['north','south','west','east']) listen(`terrain-walk-${direction}`,'click',()=>{
      if (!this.isReady() || this.isRunning()) return;
      this.getRuntime()?.walkTerrain(direction);this.updateStats();
    });
  }
  node() { const selection=this.getSelection();return selection.group==='terrainNodes' ? this.getProject().terrainScene?.nodes.find(n=>n.id===selection.id) : null; }
  capture(next) {const scene=this.getRuntime()?.captureTerrainScene();if(next.terrainScene && scene) next.terrainScene=scene;}
  edit(label,mutate) {
    if (this.isRunning() || !this.isReady()) return;
    try {return this.change(label,next=>{this.capture(next);mutate(next.terrainScene);});}
    catch(error) {this.status(error.message,true);this.refresh();}
  }
  refresh() {
    const scene=this.getProject().terrainScene;
    $('terrain-create').disabled=this.isRunning() || !this.isReady() || !!scene;
    const list=$('terrain-node');
    const fragment=document.createDocumentFragment();
    for(const node of scene?.nodes || []) {const option=document.createElement('option');option.value=node.id;text(option,node.name);fragment.append(option);}
    list.replaceChildren(fragment);list.value=this.node()?.id || scene?.nodes[0]?.id || '';
    list.disabled=!scene || this.isRunning();
    for(const id of ['terrain-reset',...['north','south','west','east'].map(d=>`terrain-walk-${d}`)]) $(id).disabled=!scene || this.isRunning() || !this.isReady();
    this.updateStats();
  }
  updateStats() {
    const snapshot=this.getRuntime()?.getTerrainSceneSnapshot();
    if(!snapshot) {text($('terrain-grounding'),'템플릿을 연결하세요');return;}
    const [x,y,z]=snapshot.position;
    text($('terrain-grounding'),`X ${x.toFixed(1)} · Y ${y.toFixed(1)} · 높이 ${z.toFixed(1)}px · ${snapshot.surfaceId} · ${snapshot.blockedReason || '접지'} · CPU 시험용 상자`);
  }
  inspector(form,field,title) {
    const node=this.node(),scene=this.getProject().terrainScene;if(!node || !scene)return;
    const resource=scene.resources.find(r=>r.id===node.resourceId);
    const editNode=(label,mutate)=>this.edit(label,next=>mutate(next.nodes.find(n=>n.id===node.id),next));
    const num=(label,value,onChange,min,max,step=.1)=>field(form,label,Number(value.toFixed(3)),{type:'number',min,max,step,onChange});
    title(form,'OBJECT · WORLD PIXELS');
    field(form,'이름',node.name,{onChange:value=>editNode('지형 이름',n=>{n.name=value;})});
    field(form,'연결 자원',node.resourceId,{options:scene.resources.map(r=>({value:r.id,label:r.name})),onChange:value=>editNode('지형 자원 연결',n=>{n.resourceId=value;})});
    ['X','Y','높이 Z'].forEach((axis,i)=>num(axis,node.position[i],value=>editNode('지형 위치',n=>{n.position[i]=value;}),0,i===2?512:8000));
    num('오브젝트 회전 °',deg(node.yaw),value=>editNode('지형 회전',n=>{n.yaw=rad(value);}),-180,180,1);
    title(form,'GEOMETRY RESOURCE');
    field(form,'형태',resource.kind,{readonly:true});
    ['폭','깊이','높이'].forEach((axis,i)=>num(`자원 ${axis} px`,resource.size[i],value=>this.edit('지형 크기',next=>{next.resources.find(r=>r.id===resource.id).size[i]=value;}),i===2?0:1,i===2?512:1600,1));
    if(resource.kind==='stairs')num('계단 수',resource.steps,value=>this.edit('계단 수',next=>{next.resources.find(r=>r.id===resource.id).steps=value;}),1,32,1);
    field(form,'보행 면',String(resource.walkable),{options:[{value:'true',label:'허용'},{value:'false',label:'장애물'}],onChange:value=>this.edit('보행 면',next=>{next.resources.find(r=>r.id===resource.id).walkable=value==='true';})});
    field(form,'면 색상',resource.color,{type:'color',onChange:value=>this.edit('지형 면 색상',next=>{next.resources.find(r=>r.id===resource.id).color=value;})});
    title(form,'CAMERA');
    field(form,'카메라 투영',scene.camera.projection ?? 'orthographic',{options:[{value:'perspective',label:'원근투영'},{value:'orthographic',label:'직교투영'}],onChange:value=>this.edit('지형 카메라 투영',next=>{
      next.camera.projection=value;next.camera.distance ??= 1400;next.camera.near ??= 32;
    })});
    num('카메라 수평 회전 °',deg(scene.camera.yaw),value=>this.edit('지형 카메라 회전',next=>{next.camera.yaw=rad(value);}),-180,180,1);
    num('카메라 내려보기 °',deg(scene.camera.pitch),value=>this.edit('지형 카메라 각도',next=>{next.camera.pitch=rad(value);}),deg(.35),deg(1.1),1);
    num('카메라 배율',scene.camera.zoom,value=>this.edit('지형 카메라 배율',next=>{next.camera.zoom=value;}),.25,2,.05);
    if(scene.camera.projection) {
      num('카메라 거리 px',scene.camera.distance ?? 1400,value=>this.edit('지형 카메라 거리',next=>{next.camera.distance=value;}),600,6000,10);
      num('가까운 면 제한 px',scene.camera.near ?? 32,value=>this.edit('지형 카메라 near',next=>{next.camera.near=value;}),8,128,1);
    }
    title(form,'WALKING');
    num('허용 단차 px',scene.settings.maxStep,value=>this.edit('시험 허용 단차',next=>{next.settings.maxStep=value;}),1,64,1);
    num('허용 경사 높이/길이',scene.settings.maxSlope,value=>this.edit('시험 허용 경사',next=>{next.settings.maxSlope=value;}),0,1,.05);
    field(form,'시험 범위','CPU 지형·접지 시험 / 본편 적용 대기',{readonly:true});
  }
  dispose() {for(const remove of this.listeners)remove();this.listeners=[];}
}
