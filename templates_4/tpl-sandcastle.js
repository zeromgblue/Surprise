export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#87CEEB;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.beach-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:linear-gradient(to bottom,#87CEEB 50%,#F4D03F 50%);}
.sea{position:absolute;top:48%;left:0;right:0;height:8%;background:linear-gradient(to bottom,#4FC3F7,#0288D1);animation:sea-wave 3s ease-in-out infinite;}
@keyframes sea-wave{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.1)}}
.sand{position:absolute;bottom:0;left:0;right:0;height:50%;background:linear-gradient(to top,#C19A30,#F4D03F);}
.castle{position:absolute;bottom:30%;left:50%;transform:translateX(-50%);text-align:center;cursor:pointer;}
.castle-emoji{font-size:7rem;filter:drop-shadow(0 10px 20px rgba(0,0,0,.2));animation:castle-build 1s ease-out;}
@keyframes castle-build{0%{transform:scale(.5);opacity:0}100%{transform:scale(1);opacity:1}}
.castle-flag{font-size:2rem;animation:flag-wave .5s ease-in-out infinite alternate;}
@keyframes flag-wave{0%{transform:rotate(-10deg)}100%{transform:rotate(10deg)}}
.waves{position:absolute;bottom:45%;font-size:1.5rem;letter-spacing:8px;animation:wave-in 3s ease-in-out infinite;}
@keyframes wave-in{0%,100%{transform:translateX(-10px)}50%{transform:translateX(10px)}}
.hint{position:absolute;bottom:8%;width:100%;text-align:center;color:#5D3A1A;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:2px;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(135,206,235,.92);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#0288D1;text-shadow:0 2px 10px rgba(2,136,209,.3);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#01579B;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#0288D1;margin-top:20px;}
</style>
<div class="beach-scene" id="scene">
<div class="sea"></div><div class="sand"></div>
<div class="waves">🌊🌊🌊</div>
<div class="castle" id="castle">
<div class="castle-flag">🚩</div><div class="castle-emoji">🏰</div>
</div>
<div class="hint" id="hint">🏖️ แตะปราสาททราย</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
let done=false;
document.getElementById('castle').addEventListener('click',()=>{
    if(done)return;done=true;
    document.getElementById('hint').style.display='none';
    // wave washes in
    const scene=document.getElementById('scene');
    const wave=document.createElement('div');
    wave.style.cssText='position:absolute;bottom:30%;left:-100%;right:0;height:150px;background:linear-gradient(to right,rgba(79,195,247,.8),rgba(2,136,209,.6));z-index:5;border-radius:50% 50% 0 0;';
    scene.appendChild(wave);
    gsap.to(wave,{left:'100%',duration:1.5,ease:'power2.in'});
    gsap.to('#castle',{scale:.3,opacity:0,duration:.8,delay:.5});
    setTimeout(()=>{
        wave.remove();
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5});
        gsap.from('.m-head',{y:40,opacity:0,duration:1,ease:'back.out'});
    },1800);
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}