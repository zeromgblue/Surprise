export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#1a0a00;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
const W=window.innerWidth,H=window.innerHeight;
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.desert-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:linear-gradient(to bottom,#FF8C00 0%,#FACC15 30%,#F59E0B 50%,#C9632A 70%,#8B4513 100%);}
canvas{position:absolute;inset:0;pointer-events:none;}
.dunes{position:absolute;bottom:0;left:0;right:0;height:200px;}
.oasis{position:absolute;bottom:30%;left:50%;transform:translateX(-50%);font-size:5rem;filter:drop-shadow(0 0 20px rgba(255,255,255,.4));animation:mirage 3s ease-in-out infinite;cursor:pointer;}
@keyframes mirage{0%,100%{filter:drop-shadow(0 0 20px rgba(255,255,255,.4)) blur(0px)}50%{filter:drop-shadow(0 0 30px rgba(100,200,255,.6)) blur(1px)}}
.heat-lines{position:absolute;bottom:28%;left:0;right:0;height:80px;background:repeating-linear-gradient(to bottom,rgba(255,255,255,.03) 0,rgba(255,255,255,.03) 2px,transparent 2px,transparent 8px);animation:heat-wave 1s ease-in-out infinite;}
@keyframes heat-wave{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.05)}}
.sun{position:absolute;top:8%;left:50%;transform:translateX(-50%);width:80px;height:80px;background:radial-gradient(#fff,#FACC15);border-radius:50%;box-shadow:0 0 50px #FACC15,0 0 100px rgba(250,204,21,.5);}
.hint{position:absolute;bottom:8%;width:100%;text-align:center;color:#fff;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;text-shadow:0 1px 3px rgba(0,0,0,.5);animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(26,10,0,.88);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#FACC15;text-shadow:0 0 20px rgba(250,204,21,.6);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#fef3c7;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#D97706;margin-top:20px;}
</style>
<div class="desert-scene" id="scene">
<div class="sun"></div>
<svg style="position:absolute;bottom:0;width:100%;height:200px" viewBox="0 0 800 200" preserveAspectRatio="none"><path d="M0,200 Q100,80 200,160 Q300,40 400,140 Q500,60 600,150 Q700,50 800,120 L800,200Z" fill="#A0522D"/><path d="M0,200 Q150,100 300,180 Q450,80 600,170 Q700,100 800,160 L800,200Z" fill="#8B4513"/></svg>
<div class="heat-lines"></div>
<div class="oasis" id="oasis">🌴</div>
<div class="hint" id="hint">🏜️ แตะโอเอซิสในทะเลทราย</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
let done=false;
document.getElementById('oasis').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    gsap.to('#oasis',{scale:3,filter:'blur(10px)',opacity:0,duration:1.5,ease:'power2.in'});
    // shimmer reveal
    gsap.to('#scene',{filter:'brightness(2)',duration:.3,yoyo:true,repeat:3,ease:'none',delay:.3});
    setTimeout(()=>{
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{scale:1.5,opacity:0,duration:1,ease:'power3.out'});
    },1500);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}