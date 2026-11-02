let viewerModule;
let activeCard;
let request=0;
const labels={character:'정지 자세',walking:'걷기',running:'달리기'};
function close(card){if(!card)return;card.querySelector('model-viewer')?.remove();card.querySelector('.poster').hidden=false;card.querySelector('[data-stop]').disabled=true;for(const b of card.querySelectorAll('[data-clip]'))b.setAttribute('aria-pressed','false');card.querySelector('.status').textContent='3D를 닫았습니다. 파일은 아래에서 받을 수 있습니다.';}
for(const card of document.querySelectorAll('[data-character]')){
 card.querySelector('[data-stop]').addEventListener('click',()=>{request++;close(card);if(activeCard===card)activeCard=null;});
 for(const button of card.querySelectorAll('[data-clip]'))button.addEventListener('click',async()=>{
  const token=++request,clip=button.dataset.clip,status=card.querySelector('.status');
  close(activeCard);activeCard=card;card.querySelector('[data-stop]').disabled=false;status.textContent='3D 파일을 불러오는 중입니다…';
  if(location.protocol==='file:'){status.textContent='3D는 위의 로컬 서버 링크에서 열어주세요. FBX·GLB 파일은 바로 받을 수 있습니다.';return;}
  try{
   viewerModule??=import('./vendor/model-viewer/model-viewer.min.js').catch(error=>{viewerModule=undefined;throw error;});await viewerModule;
   if(token!==request)return;
   const viewer=document.createElement('model-viewer');viewer.alt=`${card.querySelector('h2').textContent} ${labels[clip]} 3D 검토`;viewer.setAttribute('camera-controls','');viewer.setAttribute('touch-action','pan-y');viewer.setAttribute('camera-orbit','0deg 80deg auto');viewer.setAttribute('shadow-intensity','0.4');viewer.setAttribute('exposure','1');viewer.setAttribute('interaction-prompt','none');viewer.setAttribute('loading','eager');if(clip!=='character')viewer.setAttribute('autoplay','');
   const fail=()=>{if(token!==request)return;close(card);status.textContent='3D 표시를 완료하지 못했습니다. 미리보기와 다운로드 파일을 확인해주세요.';};
   viewer.addEventListener('error',fail,{once:true});
   viewer.addEventListener('load',()=>{if(token!==request)return;card.querySelector('.poster').hidden=true;status.textContent=`${labels[clip]} · 드래그 회전 / 휠 확대·축소${clip==='character'?' · 대기 애니메이션 아님':''}`;for(const b of card.querySelectorAll('[data-clip]'))b.setAttribute('aria-pressed',String(b===button));},{once:true});
   viewer.src=`models/${card.dataset.character}/rig-glb/${clip}.glb`;card.querySelector('.stage').append(viewer);
  }catch(error){if(token!==request)return;close(card);status.textContent='3D 뷰어를 불러오지 못했습니다. 아래 파일로 확인해주세요.';}
 });
}
