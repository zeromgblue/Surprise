export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1A0500;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;background:radial-gradient(ellipse at 50% 50%,#2a0800,#1a0500);}
    .velvet{position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(80,0,0,0.03),rgba(80,0,0,0.03) 2px,transparent 2px,transparent 8px);}
    .envelope-wrap{position:relative;cursor:pointer;}
    .envelope-body{width:min(380px,80vw);height:min(240px,40vh);background:linear-gradient(180deg,#f5ecd5,#ede0c0);border-radius:4px;box-shadow:0 20px 60px rgba(0,0,0,0.8),0 0 100px rgba(180,50,0,0.1);position:relative;overflow:hidden;}
    .envelope-flap{position:absolute;top:0;left:0;width:100%;height:50%;background:linear-gradient(180deg,#ede0c0,#e0d0a8);clip-path:polygon(0 0, 50% 100%, 100% 0);transform-origin:top center;z-index:2;}
    .envelope-flap-shadow{position:absolute;top:0;left:0;width:100%;height:50%;clip-path:polygon(0 0,50% 100%,100% 0);background:linear-gradient(180deg,transparent,rgba(0,0,0,0.15));z-index:3;}
    .seal{position:absolute;top:50%;left:50%;transform:translate(-50%,-30%);width:70px;height:70px;background:radial-gradient(circle,#cc2200,#880000);border-radius:50%;z-index:5;box-shadow:0 0 20px rgba(200,0,0,0.5),0 4px 15px rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;font-size:1.8rem;}
    .letter{position:absolute;inset:0;background:linear-gradient(180deg,#faf6ee,#f0e8d0);padding:24px;font-family:cursive;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:12px;}
    .letter-receiver{font-size:1.8rem;color:#8B0000;font-weight:bold;}
    .letter-body{font-size:0.9rem;color:#2a1000;line-height:1.8;max-width:300px;}
    .letter-sender{font-size:0.85rem;color:#8B4513;}
    .particles{position:absolute;inset:0;pointer-events:none;z-index:10;}
    .hint{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);color:#cc8833;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="velvet"></div>
      <div class="envelope-wrap" id="env-wrap">
        <div class="envelope-body" id="env-body">
          <div class="envelope-flap" id="flap"></div>
          <div class="envelope-flap-shadow"></div>
          <div class="seal" id="seal">✦</div>
          <div class="letter" id="letter">
            <div class="letter-receiver">${escapeHtml(data.receiver)}</div>
            <div class="letter-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="letter-sender">— ${escapeHtml(data.sender)} —</div>
          </div>
          <div class="particles" id="particles"></div>
        </div>
      </div>
      <div class="hint" id="hint">💌 คลิกที่ซองจดหมายเพื่อแกะผนึกแว็กซ์</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#cc9933;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#cc6633;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    let clicked = false;
    document.getElementById('env-wrap').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        const seal = document.getElementById('seal');
        gsap.to(seal, {scale:1.3, boxShadow:'0 0 40px rgba(255,100,0,0.8)', duration:0.4, yoyo:true, repeat:3, onComplete: crackSeal});
    });
    function crackSeal() {
        const particles = document.getElementById('particles');
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.style.cssText = `position:absolute;width:6px;height:6px;border-radius:50%;background:#cc2200;left:50%;top:50%;`;
            particles.appendChild(p);
            gsap.to(p, {x:(Math.random()-0.5)*120, y:(Math.random()-0.5)*80, opacity:0, duration:0.8+Math.random()*0.5, delay:Math.random()*0.3, ease:'power2.out'});
        }
        gsap.to('#seal', {scale:0, opacity:0, duration:0.4, delay:0.3});
        gsap.to('#flap', {rotationX:-180, transformOrigin:'top center', duration:0.8, delay:0.6, ease:'power2.inOut', onComplete: showLetter});
    }
    function showLetter() {
        const letter = document.getElementById('letter');
        letter.style.display = 'flex';
        gsap.from(letter, {y:30, opacity:0, duration:0.7});
        setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 1500);
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
