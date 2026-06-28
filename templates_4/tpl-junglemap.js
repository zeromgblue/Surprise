export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0a1a00;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.jungle-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse,#0d2200,#0a1a00);display:flex;align-items:center;justify-content:center;}
.map-paper{width:min(340px,85vw);min-height:280px;background:linear-gradient(135deg,#D4B896,#C4A882,#B8956E);border-radius:4px;padding:30px;position:relative;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.5),inset 0 0 30px rgba(100,70,20,.2);border:2px solid rgba(100,70,20,.4);}
.map-paper::before{content:'';position:absolute;inset:8px;border:1px dashed rgba(100,70,20,.4);border-radius:2px;pointer-events:none;}
.map-title{font-family:'Sarabun',sans-serif;font-size:.8rem;font-weight:700;letter-spacing:3px;color:#5D3A1A;text-transform:uppercase;margin-bottom:20px;text-align:center;}
.map-dots{display:grid;grid-template-columns:repeat(5,1fr);gap:15px;margin:10px 0;}
.dot{width:12px;height:12px;border-radius:50%;background:#8B4513;opacity:.4;}
.dot.highlighted{opacity:1;box-shadow:0 0 8px #8B4513;}
.map-path{width:100%;height:2px;background:repeating-linear-gradient(to right,#8B4513 0,#8B4513 8px,transparent 8px,transparent 16px);margin:15px 0;}
.x-mark{text-align:center;font-size:2.5rem;animation:pulse 1.5s infinite;}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
.corner-dec{position:absolute;font-size:1.2rem;opacity:.5;}
.hint{position:absolute;bottom:10%;width:100%;text-align:center;color:#4ADE80;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:2px;animation:blink 2s infinite;}
@keyframes blink{0%,100%{opacity:.4}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(10,26,0,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#4ADE80;text-shadow:0 0 20px rgba(74,222,128,.5);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#bbf7d0;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#166534;margin-top:20px;}
</style>
<div class="jungle-scene" id="scene">
<div style="font-size:2.5rem;position:absolute;opacity:.15;transform:rotate(-15deg)">🌿🌴🌿🌴🌿🌴🌿</div>
<div class="map-paper" id="map">
<div class="corner-dec" style="top:10px;left:10px">🧭</div>
<div class="corner-dec" style="top:10px;right:10px">🌿</div>
<div class="corner-dec" style="bottom:10px;left:10px">🌴</div>
<div class="corner-dec" style="bottom:10px;right:10px">💎</div>
<div class="map-title">🗺️ TREASURE MAP</div>
<div class="map-dots"><div class="dot highlighted"></div><div class="dot"></div><div class="dot highlighted"></div><div class="dot"></div><div class="dot highlighted"></div><div class="dot"></div><div class="dot highlighted"></div><div class="dot"></div><div class="dot"></div><div class="dot highlighted"></div></div>
<div class="map-path"></div>
<div class="x-mark">❌</div>
</div>
<div class="hint" id="hint">🗺️ แตะแผนที่เพื่อค้นหาสมบัติ</div>
<div class="msg-box" id="msg"><div class="m-head">💎 ${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
let done=false;
document.getElementById('map').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    gsap.to('#map',{rotation:5,scale:1.1,duration:.3,ease:'back.out',yoyo:true,repeat:1});
    const scene=document.getElementById('scene');
    ['💎','✨','🪙','💛','⭐'].forEach((s,i)=>{
        const p=document.createElement('div');
        p.style.cssText='position:absolute;font-size:2rem;left:50%;top:50%;pointer-events:none;z-index:6;';
        p.textContent=s;scene.appendChild(p);
        gsap.to(p,{x:(Math.random()-.5)*300,y:(Math.random()-.5)*300,opacity:0,duration:1.5,delay:i*.1,ease:'power2.out',onComplete:()=>p.remove()});
    });
    gsap.to('#map',{opacity:0,scale:.5,duration:.8,delay:.5});
    setTimeout(()=>{
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{scale:.5,opacity:0,duration:1,ease:'elastic.out(1,.5)'});
    },1000);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}