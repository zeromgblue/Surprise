export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A1A14;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 50%,#0d2a1a,#0a1a14);}
    .pond{position:absolute;bottom:10%;left:50%;transform:translateX(-50%);width:min(400px,90vw);height:min(300px,50vh);background:radial-gradient(ellipse,#0d3322,#051a0d);border-radius:50%;border:3px solid rgba(0,150,80,0.2);box-shadow:0 0 40px rgba(0,100,50,0.2);}
    .lilypad{position:absolute;border-radius:50%;background:radial-gradient(circle,#1a5522,#0d3311);border:2px solid rgba(0,200,80,0.2);}
    .turtle-wrap{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);cursor:pointer;text-align:center;}
    .turtle-body{font-size:80px;display:block;animation:headpop 4s ease-in-out infinite;}
    @keyframes headpop{0%,100%{transform:translateY(0) scaleY(1);}25%{transform:translateY(-8px) scaleY(1.05);}75%{transform:translateY(4px) scaleY(0.97);}}
    .eyes{font-size:12px;position:absolute;top:22px;left:50%;transform:translateX(-50%);display:flex;gap:14px;animation:blink 5s ease-in-out infinite;}
    @keyframes blink{0%,96%,100%{transform:translateX(-50%) scaleY(1);}98%{transform:translateX(-50%) scaleY(0.1);}}
    .shell-msg{position:absolute;top:15px;left:50%;transform:translateX(-50%);font-size:0.55rem;font-family:'Sarabun',sans-serif;color:rgba(255,255,200,0);width:55px;text-align:center;line-height:1.2;transition:color 0.5s;}
    .ripple-ring{position:absolute;border-radius:50%;border:2px solid rgba(0,200,100,0.4);pointer-events:none;animation:ripple-out 2s ease-out infinite;}
    @keyframes ripple-out{from{width:80px;height:50px;opacity:0.8;margin-left:-40px;margin-top:-25px;}to{width:300px;height:180px;opacity:0;margin-left:-150px;margin-top:-90px;}}
    .hint{position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#44cc88;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;z-index:10;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="pond" id="pond">
        <div class="lilypad" style="width:70px;height:50px;bottom:20%;left:5%;"></div>
        <div class="lilypad" style="width:55px;height:40px;top:15%;right:8%;"></div>
        <div class="lilypad" style="width:45px;height:32px;bottom:10%;right:20%;"></div>
        <div class="ripple-ring" style="top:50%;left:50%;animation-delay:0s;"></div>
        <div class="ripple-ring" style="top:50%;left:50%;animation-delay:1s;"></div>
        <div class="turtle-wrap" id="turtle-wrap">
          <span class="turtle-body" id="turtle-body">🐢</span>
          <div class="shell-msg" id="shell-msg">${escapeHtml(data.receiver)}</div>
          <div class="eyes"><span>👁</span><span>👁</span></div>
        </div>
      </div>
      <div class="hint" id="hint">🐢 คลิกที่เต่าเพื่อดูข้อความ</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#44ff88;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#44cc66;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    let clicked = false;
    document.getElementById('turtle-wrap').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        const turtle = document.getElementById('turtle-body');
        turtle.style.animation = 'none';
        gsap.to(turtle, {rotation:360, duration:1.2, ease:'power2.inOut', onComplete: () => {
            gsap.to(turtle, {rotation:720, scale:1.3, duration:0.8, ease:'back.out(1.5)', onComplete: () => {
                const shellMsg = document.getElementById('shell-msg');
                shellMsg.style.color = 'rgba(255,255,200,0.9)';
                gsap.from(shellMsg, {scale:0, duration:0.5, ease:'back.out(2)'});
                setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 1500);
            }});
        }});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
