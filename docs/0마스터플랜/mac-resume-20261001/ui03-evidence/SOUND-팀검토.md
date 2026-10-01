# SOUND — UI03 병행 후속 원문

> 읽기 전용 분석/후보 코드. 총괄의 별도 적용·검사 전에는 실행/채택 완료가 아니다. 후속 정정이 앞선 문구보다 우선한다.

## 2026-10-01T06:07:16.793Z

요청하신 격리 검사 도구를 작성하기 전에, Mac 작업트리의 실제 파일 존재 여부를 사실로 확인하겠습니다.

## 2026-10-01T06:09:03.399Z

Mac 작업트리 실제 존재 여부를 확인했습니다. 이를 사실로 반영해 격리 검사 도구 후보 코드를 완성합니다.

## 확인된 Mac 파일 사실 (경로 존재/부재)

| 구분 | 경로 | Mac 상태 |
|---|---|---|
| 원본 WAV | `bgm/1장_썩은숲/Ashes Under the Banner (Remastered).wav` | **존재** |
| 원본 WAV | `bgm/3장_얼음굴/흰눈의 맹세 (Remastered).wav` | **존재** |
| 원본 WAV | `bgm/공통/네메시아의 강림2 (Remastered).wav` | **존재** |
| 런타임 mp3 | `bgm/1장_썩은숲/Ashes Under the Banner.mp3` | **존재**(단 `audio_review/S-02/` 밖 → S-02 256k 후보와 동일 보장 없음) |
| S-02 후보 묶음 | `audio_review/S-02/` (MP3 256k·OGG q6·Opus 160k 9개 + 측정3 + README) | **부재**(Glob 0건, 별도 브랜치 `49851bd`에만 존재) |
| 압축 변형 | `bgm/**/*.ogg`, `bgm/**/*.opus` | **부재**(작업트리 내 0개) |

→ 즉 **원본 WAV 3곡은 Mac에 있으나, S-02 압축 후보 9개는 Mac에 없음**. 아래 도구는 이 상태를 자동으로 404로 드러내도록 설계했고, 후보 묶음을 격리 조회해 프로젝트 루트에 둔 뒤에만 실제 비교가 가능합니다.

## 산출 코드 (격리 검사 HTML 후보 — 미배치·미실행)

```html
<!DOCTYPE html>
<!--
  S-02 격리 디코딩/재생 계약 검사 도구 (후보, 미실행)
  - 배치 위치(제안): 프로젝트 루트 audio_review/S02_inspect.html 로 두고,
    반드시 server.cjs(포트 3340/3333)로 서빙해야 상대경로 해석됨. python http.server 금지(프로젝트 규칙).
  - 자동재생 없음. 모든 디코딩/재생은 사용자가 '오디오 시작' 버튼을 눌러 AudioContext를 활성화한 뒤에만 동작.
  - 원본 삭제/재인코딩/병합/덮어쓰기 없음. 이 파일은 읽기 전용 fetch만 수행.
  - 제약: 이 코드는 "완성된 후보"일 뿐, 본 세션에서 브라우저로 실행하거나 청취/기계검증하지 않았음.
-->
<html lang="ko">
<head>
<meta charset="utf-8">
<title>S-02 디코딩/재생 계약 검사 (후보·미실행)</title>
<style>
  body{background:#15110e;color:#dfd6c2;font-family:'Nanum Myeongjo',serif;margin:0;padding:18px}
  h1{font-size:18px;color:#e6d9bf;border-bottom:1px solid rgba(164,147,115,.5);padding-bottom:8px}
  .note{color:#b9a98a;font-size:12px;line-height:1.6;margin:8px 0 16px}
  button{background:#241c16;color:#e6d9bf;border:1px solid rgba(164,147,115,.5);
    padding:6px 12px;border-radius:4px;cursor:pointer;font-family:inherit;margin:2px}
  button:hover{background:#3a2c20}
  button:disabled{opacity:.4;cursor:not-allowed}
  table{border-collapse:collapse;width:100%;margin-top:12px;font-size:13px}
  th,td{border:1px solid rgba(164,147,115,.3);padding:6px 8px;text-align:left;vertical-align:top}
  th{background:#241c16}
  .ok{color:#8fd08a}.bad{color:#e07a6a}.wait{color:#c9b98f}
  code{color:#cdbf9e;font-size:12px}
  .seg{margin:4px 0}
  input[type=number]{width:64px;background:#1c1510;color:#dfd6c2;border:1px solid rgba(164,147,115,.4);border-radius:3px;padding:2px 4px}
</style>
</head>
<body>
<h1>S-02 디코딩/재생 계약 검사 — 격리 도구(후보, 미실행)</h1>
<div class="note">
  절차: ① <b>오디오 시작</b>(사용자 제스처) → ② <b>경로 존재 검사</b> → ③ 곡·포맷별 <b>디코딩</b>(duration/decode error) →
  ④ <b>루프 재생</b> + <b>끝으로 이동</b>으로 loop seam 청취 → ⑤ 원본 WAV와 <b>A/B</b> 교차 청취.<br>
  자동재생/자동청취/기계판정 없음. 디코딩은 duration·sampleRate·channels 보고와 오류 표면화까지만 수행.
</div>

<div class="seg">
  <button id="startBtn">① 오디오 시작 (사용자 제스처 필요)</button>
  <span id="acState" class="wait">AudioContext: 미시작</span>
  &nbsp;|&nbsp; 끝 구간 seam(초): <input type="number" id="seamSec" value="0.5" min="0.1" max="5" step="0.1">
  <button id="probeBtn" disabled>② 경로 존재 검사</button>
</div>

<table id="grid"></table>

<script>
// 대표 3곡 × (원본 WAV + MP3 256k/OGG q6/Opus 160k 후보). 후보 파일명은 문서상 스킴 기반 '예상' 경로이며,
// 실제 audio_review/S-02/ 내 파일명이 다르면 아래 paths만 수정. 존재 여부는 ②가 사실로 표시함.
const SONGS = [
  { id:'ashes', name:'Ashes Under the Banner (고역)',
    wav:'../bgm/1장_썩은숲/Ashes Under the Banner (Remastered).wav',
    mp3:'Ashes Under the Banner.mp3', ogg:'Ashes Under the Banner.ogg', opus:'Ashes Under the Banner.opus' },
  { id:'snow', name:'흰눈의 맹세 (합창·잔향)',
    wav:'../bgm/3장_얼음굴/흰눈의 맹세 (Remastered).wav',
    mp3:'흰눈의 맹세.mp3', ogg:'흰눈의 맹세.ogg', opus:'흰눈의 맹세.opus' },
  { id:'nemesia', name:'네메시아의 강림2 (루프 경계)',
    wav:'../bgm/공통/네메시아의 강림2 (Remastered).wav',
    mp3:'네메시아의 강림2.mp3', ogg:'네메시아의 강림2.ogg', opus:'네메시아의 강림2.opus' },
];
const FORMATS = ['wav','mp3','ogg','opus']; // wav=원본, 나머지=S-02 후보

let AC = null;
const el = (id)=>document.getElementById(id);

el('startBtn').onclick = async ()=>{
  try{
    AC = new (window.AudioContext||window.webkitAudioContext)();
    await AC.resume();
    el('acState').textContent = 'AudioContext: '+AC.state+' / sr='+AC.sampleRate;
    el('acState').className = 'ok';
    el('probeBtn').disabled = false;
    el('startBtn').disabled = true;
  }catch(e){ el('acState').textContent='시작 실패: '+e; el('acState').className='bad'; }
};

// 경로 존재 검사: HEAD 우선, 미지원 서버 대비 Range GET 폴백. 디코딩/재생 안 함.
async function exists(url){
  try{
    let r = await fetch(url,{method:'HEAD'});
    if(r.status===405||r.status===501){ r = await fetch(url,{headers:{Range:'bytes=0-0'}}); }
    return r.ok ? r.status : r.status;
  }catch(e){ return 'ERR'; }
}

function buildGrid(){
  const t = el('grid');
  t.innerHTML = '<tr><th>곡 / 포맷</th><th>경로</th><th>존재</th><th>디코딩(duration·sr·ch)</th><th>재생/seam</th><th>A/B</th></tr>';
  SONGS.forEach(s=>{
    FORMATS.forEach(fmt=>{
      const url = fmt==='wav' ? s.wav : ('./'+s[fmt]); // 후보는 이 HTML(audio_review/) 기준 상대
      const key = s.id+'_'+fmt;
      const tr = document.createElement('tr');
      tr.innerHTML =
        '<td>'+(fmt==='wav'?('<b>'+s.name+'</b><br>원본 WAV'):('└ '+fmt.toUpperCase()+' 후보'))+'</td>'+
        '<td><code>'+url+'</code></td>'+
        '<td id="ex_'+key+'" class="wait">—</td>'+
        '<td id="dec_'+key+'" class="wait">미디코딩</td>'+
        '<td>'+
          '<button data-act="decode" data-url="'+encodeURIComponent(url)+'" data-key="'+key+'">디코딩</button>'+
          '<button data-act="loop"   data-url="'+encodeURIComponent(url)+'" data-key="'+key+'">루프재생</button>'+
          '<button data-act="seam"   data-key="'+key+'">끝으로이동</button>'+
          '<button data-act="stop"   data-key="'+key+'">정지</button>'+
          '<audio id="au_'+key+'" preload="none" loop></audio>'+
        '</td>'+
        '<td><button data-act="ab" data-key="'+key+'">A/B 재생</button></td>';
      t.appendChild(tr);
    });
  });
}

el('probeBtn').onclick = async ()=>{
  buildGrid();
  bindRowButtons();
  for(const s of SONGS){
    for(const fmt of FORMATS){
      const url = fmt==='wav' ? s.wav : ('./'+s[fmt]);
      const cell = el('ex_'+s.id+'_'+fmt);
      cell.textContent = '검사중…';
      const st = await exists(url);
      const good = (st===200||st===206);
      cell.textContent = good ? ('있음('+st+')') : ('없음/'+st);
      cell.className = good ? 'ok' : 'bad';
    }
  }
};

// 디코딩: fetch→decodeAudioData. Opus는 decodeAudioData 미지원일 수 있어 그 경우 '디코딩 불가(재생은 <audio>로)'로 표기.
async function doDecode(url,key){
  const cell = el('dec_'+key);
  cell.textContent='디코딩중…'; cell.className='wait';
  try{
    const r = await fetch(url);
    if(!r.ok){ cell.textContent='fetch 실패 '+r.status; cell.className='bad'; return; }
    const buf = await r.arrayBuffer();
    AC.decodeAudioData(buf.slice(0),
      (ab)=>{ cell.textContent = ab.duration.toFixed(4)+'s · '+ab.sampleRate+'Hz · '+ab.numberOfChannels+'ch'; cell.className='ok'; },
      (err)=>{ cell.textContent = 'decodeAudioData 오류: '+(err&&err.message||err); cell.className='bad'; }
    );
  }catch(e){ cell.textContent='예외: '+e; cell.className='bad'; }
}

function bindRowButtons(){
  el('grid').onclick = (ev)=>{
    const b = ev.target.closest('button[data-act]'); if(!b) return;
    const act=b.dataset.act, key=b.dataset.key;
    const url = b.dataset.url ? decodeURIComponent(b.dataset.url) : null;
    const au = el('au_'+key);
    if(act==='decode'){ if(!AC){alert('먼저 오디오 시작');return;} doDecode(url,key); }
    else if(act==='loop'){ if(!au.src) au.src=url; au.loop=true; au.play().catch(e=>alert('재생 실패(포맷 미지원 가능): '+e)); }
    else if(act==='seam'){ const s=parseFloat(el('seamSec').value)||0.5;
      if(au.duration&&isFinite(au.duration)) au.currentTime=Math.max(0,au.duration-s); else alert('duration 미확정 — 먼저 루프재생'); }
    else if(act==='stop'){ au.pause(); }
    else if(act==='ab'){ // 같은 곡 원본 WAV ↔ 이 변형 번갈아 재생
      const song=key.split('_')[0];
      const wavAu=el('au_'+song+'_wav');
      if(!wavAu.src){ const s=SONGS.find(x=>x.id===song); wavAu.src=s.wav; }
      if(!au.src){ alert('먼저 이 변형 루프재생/디코딩'); return; }
      wavAu.pause(); au.pause();
      wavAu.currentTime=au.currentTime=0;
      wavAu.play().then(()=>setTimeout(()=>{wavAu.pause(); au.currentTime=0; au.play();},3000))
                  .catch(e=>alert('A/B 재생 실패: '+e));
    }
  };
}
</script>
</body>
</html>
```

## 사용 절차 (관찰 항목 매핑)
- **duration**: 각 행 「디코딩」 → `decodeAudioData` 성공 시 `duration·sampleRate·channels` 표시. 원본 WAV와 3포맷 간 길이차·샘플레이트차 확인.
- **decode error**: 디코딩 실패는 빨간색으로 사유 표면화. Opus는 `decodeAudioData` 미지원 브라우저에서 실패할 수 있으며, 그 경우 「루프재생」(`<audio>`)으로 재생 가능 여부를 별도 판정(정상적 분기).
- **loop seam**: 「루프재생」(loop=true) 후 「끝으로 이동」(기본 끝 0.5초)으로 반복 이음부를 사용자가 직접 청취 — 특히 네메시아의 강림2.
- **볼륨 정합·왜곡·A/B**: 「A/B 재생」으로 같은 곡 원본 WAV↔후보를 3초 간격 교차 재생.
- **존재 사실**: 「경로 존재 검사」가 각 경로를 200/404로 표시 → 현재 Mac에서는 **S-02 후보 3포맷이 `없음(404)`으로 나오는 것이 정상**(격리 조회 전 상태).

## 미실행 제약 (명시)
- 이 코드는 **완성된 후보일 뿐 본 세션에서 브라우저로 실행하지 않았고**, 자동재생 청취나 기계검증(디코딩/파형/seam 판정)을 수행했다고 주장하지 않습니다.
- **파일 미생성·미배치**: 프로젝트에 쓰지 않았습니다(답변 코드블록으로만 산출). 실제 사용 시 총괄이 `audio_review/`에 배치하고 `server.cjs`로 서빙해야 합니다.
- 원본 삭제·재생성·인코딩·병합·게임/파일 변경 **없음**. 읽기 도구(Glob)로 존재 사실만 확인했습니다.
- S-02 후보 9개는 Mac 작업트리 **부재** → 실제 디코딩/청취는 브랜치 `49851bd`의 `audio_review/S-02/` 격리 조회 후에만 가능. 후보 파일명이 문서 스킴과 다르면 `SONGS` 배열의 경로만 수정하면 됩니다.

작업 완료. 결과 저장은 총괄이 수행합니다. 종료합니다.
