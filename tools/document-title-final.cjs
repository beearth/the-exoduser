const fs=require('node:fs');
const file='docs/3.1 ui hud 디자인/스플래시_인트로_시퀀스.md',m=JSON.parse(fs.readFileSync('assets/title-signboard/C2/manifest.json','utf8'));
let s=fs.readFileSync(file,'utf8');
s=s.replace('달 이동 원화 I:/EXODUSER-Storage/codex-takeover/title-moon-20261102/C2-close-moon-lowered-3840x1920.png.','등검 교정·달 이동 원화 '+m.stillSource+'.');
s=s.replace('16,845,790/8,738,825/5,578,598bytes',[3840,2560,1920].map(w=>m.variants[w].bytes.toLocaleString('en-US')).join('/')+'bytes');
s=s.replace('기존moon-cloud-restoration.png만재사용,신규이미지/API생성0·차감0.','구름은기존moon-cloud-restoration.png재사용,구름신규생성0. 등검국소내장이미지편집2회(1차길이FAIL,2차채택),외부유료API0.');
s=s.replace('사전계산하늘영상→WebGL구름→달원반→10초맥동→폭포','사전계산하늘영상→WebGL구름→달원반→정지인물변위→10초맥동→폭포');
s=s.replace('index캐시20261102-C2-clean,still/video/mask캐시20261102-clean','index캐시20261102-C2-backblade,still/video캐시20261102-blade,mask캐시20261102-clean');
s=s.replaceAll('title-cleanup-20261102/final/REPORT.md','title-final-three-20261102/REPORT.md');
fs.writeFileSync(file,s);
for(const f of ['docs/17게임아트팀/ART_TEAM_MASTER.md','docs/3.1 ui hud 디자인/FULLSCREEN_ART_ULTRAWIDE_20261031.md']){
 let d=fs.readFileSync(f,'utf8');d=d.replaceAll('잔점제거·단일인물·Kling구름 흐름 수정판','잔점제거·등허브대검교정·B인물변위·Kling구름 흐름 수정판').replaceAll('title-cleanup-20261102/final/REPORT.md','title-final-three-20261102/REPORT.md').replace('후속긴급/추가수정:점제거·인물전체원화B','후속마지막세절수정:점제거·상부등허브/종아리등검교정·인물전체원화B/GLSL변위');fs.writeFileSync(f,d);
}
const entry=`## 2026-11-02 타이틀 마지막 세 결함 동시 마감\n\n- 기존 점제거·흰마스크 확장 WIP 보존 후 최신 origin/main 병합. 원본 타이틀+Silvertail LOCK에 맞춰 상부 등 회전 허브·관절·몸 뒤 종아리 길이 흑철/은색 대검으로 국소 편집,양손 비움. 편집 영역 밖 원화 byte 변경0. 내장 이미지편집2회,외부유료API0.\n- B 확정: 영상 인물 전체를 교정 정지원화로 가리고 머리/망토 끝만3840×1920 GLSL 역샘플. 허브·몸·손·검·발 고정,최대2.4/1.1px,주기206/24초. 같은B를3개영상에사전렌더해WebGL불가시도보존. Kling하늘+이동정지달+구름흐름유지,그레인/샤프닝0.\n- 세부수치/해시: 스플래시C2계약과manifest.bladeCorrection/cleanup/variants. 실제3비율10초·구름/바위0.1초·고정장비/머리/망토·인물1x/바위3x·오류/정지/입력/해제·원격증거는 I:/EXODUSER-Storage/codex-takeover/title-final-three-20261102/REPORT.md. NW.js/Unity/물리모니터·외부배포별도.\n\n`;
const log='docs/CHANGELOG_SYNC.md';let d=fs.readFileSync(log,'utf8');if(!d.startsWith('## 2026-11-02 타이틀 마지막 세 결함'))fs.writeFileSync(log,entry+d);
