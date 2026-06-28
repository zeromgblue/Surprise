export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#0c2a4a;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.balloon-sky{position:relative;width:100vw;height:100vh;overflow:hidden;background:linear-gradient(to bottom,#87CEEB,#FDB97D,#FF6B35);}
.cloud{position:absolute;background:#fff;border-radius:50px;opacity:.8;}
.c1{width:180px;height:60px;top:20%;left:5%;animation:drift 20s linear infinite;}
.c2{width:120px;height:40px;top:35%;right:10%;animation:drift 25s linear infinite reverse;}
.c3{width:150px;height:50px;top:10%;right:30%;animation:drift 18s linear infinite;}
@keyframes drift{0%{transform:translateX(0)}50%{transform:translateX(30px)}100%{transform:translateX(0)}}
.balloon{position:absolute;bottom:-20%;left:50%;transform:translateX(-50%);cursor:pointer;display:flex;flex-direction:column;align-items:center;}
.balloon-body{font-size:6rem;filter:drop-shadow(0 10px 20px rgba(0,0,0,.3));animation:hover-float 3s ease-in-out infinite;}
@keyframes hover-float{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-10px) rotate(2deg)}}
.balloon-rope{width:2px;height:40px;background:rgba(0,0,0,.3);margin-top:-5px;}
.balloon-basket{font-size:2rem;margin-top:-5px;}
.hint{position:absolute;bottom:8%;width:100%;text-align:center;color:#fff;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;text-shadow:0 1px 3px rgba(0,0,0,.4);}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(12,42,74,.88);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#FDB97D;text-shadow:0 0 20px rgba(253,185,125,.5);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#f8f0e0;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#FF6B35;margin-top:20px;}
</style>
<div class="balloon-sky" id="scene">
<div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div>
<div class="balloon" id="balloon">
<div class="balloon-body">🎈</div><div class="balloon-rope"></div><div class="balloon-basket">🧺</div>
</div>
<div class="hint" id="hint">🌤️ แตะลูกโป่งเพื่อลอยขึ้น</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
let done=false;
document.getElementById('balloon').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    const b=document.getElementById('balloon');
    b.style.animation='none';
    gsap.to(b,{bottom:'120%',duration:3,ease:'power1.inOut'});
    gsap.to(b,{x:50,duration:1.5,yoyo:true,repeat:2,ease:'sine.inOut'});
    setTimeout(()=>{
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{y:-40,opacity:0,duration:1,ease:'back.out'});
    },2500);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}