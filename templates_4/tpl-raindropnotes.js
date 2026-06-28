export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A1E0A;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 100%,#0d2a0d,#0a1e0a);}
    .water{position:absolute;bottom:0;width:100%;height:40%;background:linear-gradient(180deg,rgba(0,80,40,0.5),rgba(0,40,20,0.8));border-top:2px solid rgba(0,200,100,0.2);}
    .lilypad{position:absolute;bottom:35%;left:50%;transform:translateX(-50%);width:150px;height:90px;background:radial-gradient(ellipse,#1a6622,#0d4411);border-radius:50%;box-shadow:0 4px 20px rgba(0,0,0,0.5);}
    .lilypad::after{content:'';position:absolute;left:50%;top:10%;width:2px;height:50%;background:rgba(0,0,0,0.2);transform:rotate(10deg);}
    .raindrop{position:absolute;width:3px;border-radius:0 0 3px 3px;background:rgba(180,220,255,0.7);animation:fall linear infinite;}
    @keyframes fall{from{transform:translateY(-20px);opacity:1;}to{transform:translateY(110vh);opacity:0.3;}}
    .ripple{position:absolute;border:2px solid rgba(0,200,100,0.4);border-radius:50%;pointer-events:none;animation:ripple-expand 1.5s ease-out forwards;}
    @keyframes ripple-expand{from{width:10px;height:6px;opacity:0.8;}to{width:80px;height:40px;opacity:0;margin-left:-35px;margin-top:-17px;}}
    .music-note{position:absolute;font-size:1.2rem;animation:notebounce 1.5s ease-out forwards;}
    @keyframes notebounce{0%{transform:translateY(0) scale(0.5);opacity:0;}30%{opacity:1;transform:translateY(-40px) scale(1.2);}100%{transform:translateY(-120px) scale(0.8);opacity:0;}}
    .name-display{position:absolute;top:20%;left:50%;transform:translateX(-50%);font-family:'Sarabun',sans-serif;font-size:2.5rem;color:#44ff88;text-shadow:0 0 20px #00ff44;opacity:0;white-space:nowrap;}
    .hint{position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#44cc66;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="water"></div>
      <div class="lilypad" id="lilypad"></div>
      <div class="name-display" id="name-display"></div>
      <div class="hint" id="hint">🌧️ คลิกเพื่อเรียกฝนโน้ตดนตรี</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#44ff88;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#44cc66;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    const scene = document.getElementById('scene');
    const notes = ['🎵','🎶','♪','♫','🎼'];
    let rainInterval = null;
    let clicked = false;
    function addRain() {
        for (let i = 0; i < 5; i++) {
            const drop = document.createElement('div');
            drop.className = 'raindrop';
            drop.style.cssText = `left:${Math.random()*100}%;height:${12+Math.random()*18}px;animation-duration:${0.6+Math.random()*0.8}s;animation-delay:${Math.random()*0.5}s;`;
            scene.appendChild(drop);
            setTimeout(() => drop.remove(), 2000);
        }
    }
    function addRippleAndNote(x, y) {
        const r = document.createElement('div');
        r.className = 'ripple';
        r.style.cssText = `left:${x}px;top:${y}px;`;
        scene.appendChild(r);
        setTimeout(() => r.remove(), 1600);
        const n = document.createElement('div');
        n.className = 'music-note';
        n.style.cssText = `left:${x-10}px;top:${y-20}px;`;
        n.textContent = notes[Math.floor(Math.random()*notes.length)];
        scene.appendChild(n);
        setTimeout(() => n.remove(), 1600);
    }
    rainInterval = setInterval(() => {
        addRain();
        addRippleAndNote(60 + Math.random()*80, window.innerHeight*0.62);
    }, 400);
    document.getElementById('scene').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        clearInterval(rainInterval);
        for (let i = 0; i < 30; i++) {
            setTimeout(() => { addRain(); addRippleAndNote(40+Math.random()*window.innerWidth*0.7, window.innerHeight*0.6); }, i*60);
        }
        setTimeout(() => {
            const nameEl = document.getElementById('name-display');
            nameEl.textContent = data.receiver || 'SURPRISE';
            gsap.to(nameEl, {opacity:1, duration:1, ease:'power2.out'});
            setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 2000);
        }, 2000);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
