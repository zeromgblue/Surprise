export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#020617;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.star-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse,#0a0a30,#020617);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.star-core{position:relative;z-index:5;}
.star-emoji{font-size:6rem;animation:star-pulse 2s ease-in-out infinite;filter:drop-shadow(0 0 20px rgba(249,168,212,.6));}
@keyframes star-pulse{0%,100%{transform:scale(1) rotate(0deg);filter:drop-shadow(0 0 20px rgba(249,168,212,.4))}50%{transform:scale(1.1) rotate(5deg);filter:drop-shadow(0 0 40px rgba(249,168,212,.9))}}
.orbit{position:absolute;border-radius:50%;border:1px solid rgba(249,168,212,.2);top:50%;left:50%;transform:translate(-50%,-50%);}
.o1{width:160px;height:160px;animation:orbit-spin 8s linear infinite;}
.o2{width:240px;height:240px;animation:orbit-spin 12s linear infinite reverse;}
.o3{width:320px;height:320px;animation:orbit-spin 16s linear infinite;}
@keyframes orbit-spin{0%{transform:translate(-50%,-50%) rotate(0)}100%{transform:translate(-50%,-50%) rotate(360deg)}}
.orbit-dot{position:absolute;width:8px;height:8px;border-radius:50%;top:-4px;left:50%;transform:translateX(-50%);background:#F9A8D4;box-shadow:0 0 10px #F9A8D4;}
.hint{position:absolute;bottom:10%;width:100%;text-align:center;color:#F9A8D4;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(2,6,23,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#F9A8D4;text-shadow:0 0 25px rgba(249,168,212,.6);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#fce7f3;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#EC4899;margin-top:20px;}
</style>
<div class="star-scene" id="scene">
<div class="orbit o1"><div class="orbit-dot"></div></div>
<div class="orbit o2"><div class="orbit-dot" style="background:#C084FC;box-shadow:0 0 10px #C084FC;"></div></div>
<div class="orbit o3"><div class="orbit-dot" style="background:#818CF8;box-shadow:0 0 10px #818CF8;"></div></div>
<div class="star-core"><div class="star-emoji" id="star">⭐</div></div>
<div class="hint" id="hint">⭐ แตะดวงวิญญาณสู่ดาว</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
let done=false;
document.getElementById('scene').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    const scene=document.getElementById('scene');
    gsap.to('.orbit',{scale:5,opacity:0,duration:2,ease:'power2.in',stagger:.1});
    gsap.to('#star',{scale:4,opacity:0,duration:1.5,ease:'power2.in'});
    // stardust
    for(let i=0;i<50;i++){
        const p=document.createElement('div');
        p.style.cssText='position:absolute;font-size:1rem;left:50%;top:50%;pointer-events:none;z-index:6;';
        p.textContent=['⭐','✨','💫','🌟','✦'][i%5];
        scene.appendChild(p);
        gsap.to(p,{x:(Math.random()-.5)*window.innerWidth*.9,y:(Math.random()-.5)*window.innerHeight*.9,opacity:0,duration:2+Math.random(),ease:'power2.out',onComplete:()=>p.remove()});
    }
    setTimeout(()=>{
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{scale:.3,opacity:0,duration:1.2,ease:'elastic.out(1,.4)'});
    },1500);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}