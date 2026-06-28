export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1A1200;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;position:relative;overflow:hidden;transition:background 2s;}
    .sky{position:absolute;inset:0;background:linear-gradient(180deg,#050a00 0%,#1a1200 60%,#2a1800 100%);transition:background 3s;}
    .stars{position:absolute;inset:0;}
    .star{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;animation:twinkle var(--dur,3s) ease-in-out infinite var(--del,0s);}
    @keyframes twinkle{0%,100%{opacity:0.3;}50%{opacity:1;}}
    .field-silhouette{position:absolute;bottom:0;width:100%;height:40%;background:linear-gradient(180deg,transparent,#0a0800);display:flex;align-items:flex-end;justify-content:center;gap:20px;padding-bottom:0;}
    .sf{position:relative;display:flex;flex-direction:column;align-items:center;}
    .sf-stem{width:4px;background:#1a3300;height:80px;}
    .sf-head{width:50px;height:50px;border-radius:50%;background:#1a1200;border:8px solid #2a2200;display:flex;align-items:center;justify-content:center;font-size:1.4rem;margin-bottom:-4px;}
    .sf-petals{position:absolute;top:-8px;width:66px;height:66px;animation:headnod 4s ease-in-out infinite;}
    @keyframes headnod{0%,100%{transform:rotate(0deg);}50%{transform:rotate(5deg);}}
    .big-sf{position:absolute;bottom:0;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;}
    .big-stem{width:8px;height:200px;background:#1a3300;}
    .big-head{width:120px;height:120px;border-radius:50%;background:#1a0a00;position:relative;display:flex;align-items:center;justify-content:center;font-size:0.8rem;text-align:center;color:transparent;}
    .petal{position:absolute;width:30px;height:50px;border-radius:50%;background:#2a2200;transform-origin:bottom center;}
    .dawn{position:absolute;bottom:35%;width:100%;height:30%;background:linear-gradient(180deg,transparent,rgba(200,100,0,0));pointer-events:none;transition:background 3s;}
    .hint{position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#ccaa33;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="sky" id="sky"></div>
      <div class="stars" id="stars"></div>
      <div class="field-silhouette">
        <div class="sf"><div class="sf-head">🌻</div><div class="sf-stem"></div></div>
        <div class="sf" style="transform:translateY(20px)"><div class="sf-head">🌻</div><div class="sf-stem" style="height:60px;"></div></div>
        <div class="sf"><div class="sf-head">🌻</div><div class="sf-stem" style="height:90px;"></div></div>
        <div style="width:140px;"></div>
        <div class="sf"><div class="sf-head">🌻</div><div class="sf-stem" style="height:85px;"></div></div>
        <div class="sf" style="transform:translateY(15px)"><div class="sf-head">🌻</div><div class="sf-stem" style="height:70px;"></div></div>
        <div class="sf"><div class="sf-head">🌻</div><div class="sf-stem"></div></div>
      </div>
      <div class="big-sf" id="big-sf">
        <div class="big-head" id="big-head">
          ${Array.from({length:12}).map((_,i)=>`<div class="petal" style="transform:rotate(${i*30}deg) translateY(-50px);"></div>`).join('')}
          <span id="petal-msg" style="position:relative;z-index:2;font-size:0.65rem;line-height:1.3;color:transparent;max-width:80px;text-align:center;">💛</span>
        </div>
        <div class="big-stem"></div>
      </div>
      <div class="dawn" id="dawn"></div>
      <div class="hint" id="hint">🌻 คลิกเพื่อดูรุ่งอรุณงดงาม</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#ffcc00;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#ccaa33;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    const scene = document.getElementById('scene');
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 80; i++) {
        const s = document.createElement('div'); s.className = 'star';
        s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*60}%;--dur:${2+Math.random()*4}s;--del:${Math.random()*3}s;`;
        starsContainer.appendChild(s);
    }
    let clicked = false;
    scene.addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        gsap.to('#sky', {background:'linear-gradient(180deg,#ff6600 0%,#ffaa00 40%,#1a0800 100%)', duration:3, ease:'power1.inOut'});
        gsap.to(starsContainer, {opacity:0, duration:2});
        gsap.to('.petal', {background:'#ffcc00', duration:1.5, delay:2, stagger:0.1});
        gsap.to('#petal-msg', {color:'#4a2200', duration:0.5, delay:3.5});
        document.getElementById('petal-msg').textContent = data.receiver;
        gsap.to('#big-head', {boxShadow:'0 0 40px rgba(255,200,0,0.8)', background:'#cc8800', duration:1.5, delay:2});
        setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 4000);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
