import {createD10ReviewController} from './browser-bootstrap-api.js';

export function mountD10PersistenceReview({document,container,host,reviewOnly=false,createPort,mkItem,rng,request}={}){
  const controller=createD10ReviewController({host,reviewOnly,createPort,mkItem,rng});
  const nodes=[],listeners=[];
  let item=null,closed=false;
  function remove(){
    for(const [node,kind,listener] of listeners)node.removeEventListener(kind,listener);
    for(const node of nodes)if(node.parentNode===container)container.removeChild(node);
  }
  const close=()=>{
    if(closed)return;
    try{remove();}finally{controller.close();closed=true;}
  };
  try{
    const create=document.createElement('button'),read=document.createElement('button'),status=document.createElement('p');
    create.type=read.type='button';create.textContent='새 제안 fixture 생성';read.textContent='fixture JSON 읽기';
    status.textContent='검토 전용 · 비활성 · 실제 저장 연결 없음';
    const action=callback=>()=>{try{callback();}catch(error){status.textContent='검토 실패: '+error.message;}};
    const createListener=action(()=>{item=controller.createNew(request);status.textContent='신규 '+controller.readLoaded(item).kind;});
    const readListener=action(()=>{
      if(!item)throw new Error('먼저 신규 검토 fixture 생성 필요');
      const loaded=JSON.parse(JSON.stringify(controller.serialize(item)));
      status.textContent='JSON 복원 '+controller.readLoaded(loaded).kind+' · 재롤 없음';
    });
    for(const [node,listener] of [[create,createListener],[read,readListener]]){
      listeners.push([node,'click',listener]);node.addEventListener('click',listener);
    }
    for(const node of [create,read,status]){nodes.push(node);container.appendChild(node);}
    return Object.freeze({close});
  }catch(error){close();throw error;}
}
