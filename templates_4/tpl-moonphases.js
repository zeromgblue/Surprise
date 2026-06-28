export async function render(container,data,config){
container.style.cssText="max-width:100%;padding:0;height:100vh;overflow:hidden;background:#000812;";
document.body.style.cssText="margin:0;overflow:hidden;";
await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
const W=window.innerWidth,H=window.innerHeight;
container.innerHTML=`
<style>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
.moon-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at top,#050a20,#000812);display:flex;flex-direction:column;align-items:center;justify-content:center;}
canvas{position:absolute;inset:0;cursor:pointer;}
.moon-label{position:absolute;top:8%;color:#E2E8F0;font-family:'Sarabun',sans-serif;font-size:1.2rem;letter-spacing:4px;opacity:.6;}
.hint{position:absolute;bottom:10%;color:#94A3B8;font-family:'Sarabun',sans-serif;font-size:.9rem;letter-spacing:3px;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
.msg-box{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:10;padding:40px;text-align:center;background:rgba(0,8,18,.9);}
.m-head{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#E2E8F0;text-shadow:0 0 20px rgba(226,232,240,.4);margin-bottom:15px;}
.m-body{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#cbd5e1;line-height:1.9;max-width:500px;font-weight:300;}
.m-from{font-family:'Sarabun',sans-serif;font-size:1.1rem;color:#64748B;margin-top:20px;}
</style>
<div class="moon-scene"><canvas id="cvs"></canvas>
<div class="moon-label">🌕 LUNAR CYCLE</div>
<div class="hint" id="hint">🌙 แตะดวงจันทร์เต็มดวง</div>
<div class="msg-box" id="msg"><div class="m-head">${escapeHtml(data.receiver)}</div><div class="m-body">${escapeHtml(data.message||'').replace(/\n/g,'<br>')}</div><div class="m-from">— ${escapeHtml(data.sender)}</div></div>
</div>`;
const cvs=document.getElementById('cvs');cvs.width=W;cvs.height=H;
const ctx=cvs.getContext('2d');
const phases=['🌑','🌒','🌓','🌔','🌕'];
const moonR=50,cx=W/2,cy=H/2;
const moonCenters=phases.map((_,i)=>{const a=((i/phases.length)*Math.PI*2)-Math.PI/2;return{x:cx+Math.cos(a)*130,y:cy+Math.sin(a)*130,phase:i};});
// draw stars
for(let i=0;i<120;i++){ctx.beginPath();ctx.arc(Math.random()*W,Math.random()*H,Math.random()*1.2,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${.2+Math.random()*.6})`;ctx.fill();}
// draw moons
moonCenters.forEach(m=>{
    ctx.font=`${m.phase===4?80:50}px serif`;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.globalAlpha=m.phase===4?1:.6;
    ctx.fillText(phases[m.phase],m.x,m.y);
});
ctx.globalAlpha=1;
// glow on full moon
const g=ctx.createRadialGradient(moonCenters[4].x,moonCenters[4].y,20,moonCenters[4].x,moonCenters[4].y,100);
g.addColorStop(0,'rgba(255,255,220,.15)');g.addColorStop(1,'rgba(255,255,220,0)');
ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
let done=false;
cvs.addEventListener('click',e=>{
    const mx=e.clientX,my=e.clientY,fm=moonCenters[4];
    if(Math.hypot(mx-fm.x,my-fm.y)<60&&!done){
        done=true;document.getElementById('hint').style.display='none';
        gsap.to(cvs,{opacity:0,scale:1.5,duration:1.5,ease:'power2.in'});
        gsap.to('#msg',{opacity:1,pointerEvents:'auto',duration:1.5,delay:.8});
        gsap.from('.m-head',{scale:.5,opacity:0,duration:1,delay:1,ease:'elastic.out(1,.5)'});
    }
});
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]'))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}