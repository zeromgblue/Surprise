export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#041A08;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,#072a0e,#041a08);}
    .stadium-lights{position:absolute;top:0;width:100%;height:30%;background:linear-gradient(180deg,rgba(255,220,100,0.05),transparent);}
    .pitch{position:absolute;bottom:0;width:100%;height:50%;background:linear-gradient(180deg,#0d3311,#081f08);border-top:3px solid rgba(100,200,100,0.2);}
    .goal-post{position:absolute;top:15%;right:8%;width:120px;height:180px;border:5px solid #f0f0e8;border-bottom:none;box-shadow:0 0 20px rgba(240,240,200,0.3);}
    .net{position:absolute;top:15%;right:8%;width:120px;height:180px;background:repeating-linear-gradient(90deg,rgba(240,240,200,0.1) 0,rgba(240,240,200,0.1) 1px,transparent 1px,transparent 12px),repeating-linear-gradient(180deg,rgba(240,240,200,0.1) 0,rgba(240,240,200,0.1) 1px,transparent 1px,transparent 12px);}
    .ball{position:absolute;bottom:38%;left:10%;font-size:2.8rem;cursor:pointer;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.5));}
    .scoreboard{position:absolute;top:5%;left:50%;transform:translateX(-50%);background:#111;border:3px solid #cc9900;border-radius:8px;padding:14px 24px;text-align:center;opacity:0;pointer-events:none;font-family:'Sarabun',sans-serif;}
    .score-text{font-size:2rem;color:#ffcc00;text-shadow:0 0 10px #ffaa00;}
    .crowd-wave{position:absolute;bottom:45%;width:100%;height:30px;opacity:0;display:flex;gap:2px;align-items:flex-end;pointer-events:none;}
    .crowd-bar{width:4px;background:rgba(255,200,100,0.6);border-radius:2px;}
    .hint{position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#44cc66;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="stadium-lights"></div>
      <div class="pitch"></div>
      <div class="goal-post"></div>
      <div class="net"></div>
      <div class="ball" id="ball">⚽</div>
      <div class="crowd-wave" id="crowd">
        ${Array.from({length:80}).map(()=>`<div class="crowd-bar" style="height:${8+Math.random()*22}px;"></div>`).join('')}
      </div>
      <div class="scoreboard" id="scoreboard">
        <div style="font-size:0.75rem;color:#cc9900;letter-spacing:2px;margin-bottom:6px;">⚽ GOAL! ⚽</div>
        <div class="score-text" id="score-text"></div>
      </div>
      <div class="hint" id="hint">⚽ คลิกที่ลูกบอลเพื่อยิงประตู!</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#ffcc00;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#44cc66;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    let clicked = false;
    document.getElementById('ball').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        const ball = document.getElementById('ball');
        gsap.to(ball, {
            x: window.innerWidth * 0.7, y: -window.innerHeight * 0.25,
            rotation: 540, scale: 0.6, duration: 1.2, ease: 'power2.out',
            onComplete: () => {
                gsap.to(ball, {scale:1.3, duration:0.2, yoyo:true, repeat:1});
                const crowd = document.getElementById('crowd');
                gsap.to(crowd, {opacity:1, duration:0.3});
                const bars = crowd.querySelectorAll('.crowd-bar');
                bars.forEach((b, i) => gsap.to(b, {height: 8+Math.random()*40, duration:0.3, delay:i*0.008, yoyo:true, repeat:4, ease:'sine.inOut'}));
                document.getElementById('score-text').textContent = data.receiver + ' ⭐ GOAL!';
                gsap.to('#scoreboard', {opacity:1, scale:1.1, duration:0.5, delay:0.3, ease:'back.out(2)'});
                gsap.to('#scoreboard', {scale:1, duration:0.3, delay:0.8});
                setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 2500);
            }
        });
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
