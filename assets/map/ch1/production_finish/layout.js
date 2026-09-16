/* Fixed, hand-authored CH1-1 layout. Tile coordinates; no seed or random placement. */
(function(root){
  const boundary=[
    [88,2],[88,18],[74,29],[58,34],[37,33],[29,44],[31,59],[40,66],
    [52,70],[53,77],[40,80],[26,91],[28,107],[40,114],[53,118],[62,126],
    [58,137],[40,140],[28,147],[30,157],[43,163],[58,167],[72,174],[81,183],
    [85,192],[96,197],[109,197],[120,190],[125,181],[137,168],[151,161],
    [169,156],[179,143],[178,134],[161,128],[143,127],[134,121],[139,113],
    [160,110],[175,105],[180,93],[172,84],[151,79],[145,72],[154,63],
    [174,59],[181,48],[177,35],[162,30],[142,33],[126,28],[113,18],[112,2]
  ];
  function contains(x,y){
    let inside=false;
    for(let i=0,j=boundary.length-1;i<boundary.length;j=i++){
      const a=boundary[i],b=boundary[j];
      if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
    }
    return inside;
  }
  function buildRLE(mw,mh){
    if(mw!==200||mh!==200)throw new Error('CH1-1 authored layout requires 200 x 200');
    const out=[];let value=-1,count=0;
    for(let y=0;y<mh;y++)for(let x=0;x<mw;x++){
      const next=contains(x+.5,y+.5)?1:0;
      if(next===value)count++;else{if(count)out.push(value,count);value=next;count=1;}
    }
    out.push(value,count);return out;
  }
  const regions=[
    {id:'south_entry',name:'잠식된 진입로',anchor:[100,185],role:'arrival',ground:'worn-earth',transition:'좁은 남측 문턱에서 첫 공터로 벌어짐'},
    {id:'first_clearing',name:'쓰러진 숲의 공터',anchor:[100,151],role:'combat',ground:'dry-soil',transition:'서쪽 뿌리 통로와 동쪽 웅덩이가 비대칭으로 열림'},
    {id:'root_bend',name:'뿌리 어깨 숲길',anchor:[83,125],role:'travel',ground:'leaves-earth',transition:'서쪽 숲이 안으로 돌출되고 야영지로 길이 갈라짐'},
    {id:'west_camp',name:'버려진 야영지',anchor:[45,100],role:'side-combat',ground:'trampled-earth',transition:'낮고 긴 뿌리 경계와 중앙 공터 연결'},
    {id:'corpse_basin',name:'시체나무 분지',anchor:[102,90],role:'primary-landmark',ground:'root-humus',transition:'줄기 양쪽 우회와 넓은 전투 여백'},
    {id:'east_terrace',name:'부패한 제단 단구',anchor:[147,97],role:'optional-high-ground',ground:'wet-earth',transition:'기존 서측 경사로 유지'},
    {id:'north_fork',name:'고치 숲과 썩은 물가',anchor:[100,52],role:'late-combat',ground:'damp-leaf',transition:'서쪽 고치와 동쪽 습지 사이에서 북쪽 통로로 수렴'},
    {id:'north_exit',name:'숲의 마지막 문턱',anchor:[100,22],role:'exit-approach',ground:'exposed-soil',transition:'기존 gate y5 / exit y7 접근'}
  ];
  root.CH1_1_PRODUCTION=Object.freeze({version:'20260916-finish-1',stage:0,size:[200,200],tileSize:40,boundary,regions,contains,buildRLE});
})(globalThis);
