export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A001A;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 80%,#1a0033,#0a001a);}
    .jar-wrap{position:relative;cursor:pointer;}
    .jar-body{width:160px;height:220px;background:linear-gradient(135deg,rgba(100,180,255,0.15),rgba(80,120,200,0.1));border:3px solid rgba(150,200,255,0.4);border-radius:20px 20px 30px 30px;position:relative;overflow:hidden;box-shadow:0 0 40px rgba(100,0,255,0.3),inset 0 0 30px rgba(80,0,200,0.1);}
    .jar-glow{position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% 60%,rgba(150,0,255,0.2),transparent);animation:glowpulse 2s ease-in-out infinite;}
    @keyframes glowpulse{0%,100%{opacity:0.6;}50%{opacity:1;}}
    .jar-lid{width:180px;height:28px;background:linear-gradient(180deg,#888,#555);border-radius:6px;margin:0 auto;margin-bottom:-2px;position:relative;z-index:5;box-shadow:0 -4px 10px rgba(0,0,0,0.5);}
    .butterfly{position:absolute;font-size:1.4rem;animation:flutter var(--dur,2s) ease-in-out infinite var(--delay,0s);}
    @keyframes flutter{0%,100%{transform:rotate(-10deg) scale(1);}50%{transform:rotate(10deg) scale(1.1);}}
    .hint{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#cc88ff;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="jar-wrap" id="jar-wrap">
        <div class="jar-lid" id="lid"></div>
        <div class="jar-body" id="jar">
          <div class="jar-glow"></div>
          <div class="butterfly" style="left:20%;top:20%;--dur:1.8s;--delay:0s;">🦋</div>
          <div class="butterfly" style="left:50%;top:30%;--dur:2.2s;--delay:0.3s;">🦋</div>
          <div class="butterfly" style="left:30%;top:55%;--dur:1.6s;--delay:0.6s;">🦋</div>
          <div class="butterfly" style="left:60%;top:45%;--dur:2.4s;--delay:0.2s;">🦋</div>
          <div class="butterfly" style="left:15%;top:65%;--dur:2s;--delay:0.8s;">🦋</div>
          <div class="butterfly" style="left:65%;top:65%;--dur:1.9s;--delay:0.4s;">🦋</div>
        </div>
      </div>
      <div class="hint" id="hint">🦋 คลิกโถแก้วเพื่อเปิดฝา</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#dd88ff;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#aa66ff;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    let clicked = false;
    document.getElementById('jar-wrap').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        gsap.to('#lid', {y:-60, rotation:15, opacity:0, duration:0.5, ease:'back.out(2)'});
        setTimeout(releaseButterflies, 500);
    });
    function releaseButterflies() {
        const butterflies = document.querySelectorAll('.butterfly');
        butterflies.forEach((b, i) => {
            const tx = (Math.random()-0.5) * window.innerWidth * 0.8;
            const ty = -(Math.random() * window.innerHeight * 0.6 + 100);
            b.style.animation = 'none';
            gsap.to(b, {
                x: tx, y: ty, rotation: (Math.random()-0.5)*720,
                scale: 1.5 + Math.random(),
                opacity: [1, 1, 0.8, 0],
                duration: 2.5 + Math.random() * 1.5,
                delay: i * 0.15,
                ease: 'power2.out'
            });
        });
        // Create new butterflies that form text
        setTimeout(() => {
            const scene = document.getElementById('scene');
            const name = data.receiver || 'YOU';
            for (let i = 0; i < 12; i++) {
                const b = document.createElement('div');
                b.textContent = '🦋';
                b.style.cssText = `position:absolute;font-size:1.6rem;opacity:0;left:${Math.random()*80+10}%;top:${Math.random()*80+10}%;`;
                scene.appendChild(b);
                gsap.fromTo(b, {opacity:0, scale:0}, {opacity:1, scale:1, duration:0.8, delay:i*0.1, ease:'back.out(2)'});
            }
            gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5, delay:1.5});
        }, 2000);
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
