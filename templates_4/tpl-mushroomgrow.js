export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#020A01;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 100%,#0d1a04,#020a01);cursor:pointer;}
    .ground{position:absolute;bottom:0;width:100%;height:20%;background:linear-gradient(180deg,#0a1a04,#061004);}
    .shroom{position:absolute;bottom:20%;display:flex;flex-direction:column;align-items:center;transform-origin:bottom center;}
    .stem{width:var(--sw,18px);height:var(--sh,60px);background:linear-gradient(180deg,#e8dcc8,#c8b890);border-radius:4px;transform:scaleY(0);transform-origin:bottom;}
    .cap{width:var(--cw,60px);height:var(--ch,40px);border-radius:50% 50% 20% 20%;margin-bottom:-2px;transform:scaleY(0);transform-origin:bottom;box-shadow:0 0 20px var(--glow,rgba(100,255,100,0.3));animation:capglow 2s ease-in-out infinite;}
    @keyframes capglow{0%,100%{filter:brightness(1);}50%{filter:brightness(1.3);}}
    .spore{position:absolute;border-radius:50%;background:rgba(150,255,150,0.6);animation:float-up linear forwards;}
    @keyframes float-up{from{opacity:0.8;transform:translateY(0);}to{opacity:0;transform:translateY(-120px);}}
    .msg-glow{position:absolute;bottom:22%;left:50%;transform:translateX(-50%);font-family:'Sarabun',sans-serif;text-align:center;opacity:0;pointer-events:none;text-shadow:0 0 20px rgba(100,255,100,0.8);}
    .hint{position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#44cc44;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;z-index:10;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="ground"></div>
      <div class="shroom" style="left:8%;--sw:12px;--sh:40px;--cw:44px;--ch:28px;">
        <div class="cap" style="background:#cc4400;--glow:rgba(255,100,0,0.3);">🍄</div>
        <div class="stem" id="s1"></div>
      </div>
      <div class="shroom" style="left:20%;--sw:16px;--sh:55px;--cw:56px;--ch:36px;">
        <div class="cap" style="background:#884400;--glow:rgba(200,100,0,0.3);">🍄</div>
        <div class="stem" id="s2"></div>
      </div>
      <div class="shroom" style="left:35%;--sw:10px;--sh:30px;--cw:36px;--ch:22px;">
        <div class="cap" style="background:#993300;--glow:rgba(180,80,0,0.3);">🍄</div>
        <div class="stem" id="s3"></div>
      </div>
      <div class="shroom" id="big-shroom" style="left:50%;transform:translateX(-50%);--sw:28px;--sh:120px;--cw:110px;--ch:70px;">
        <div class="cap" id="big-cap" style="background:#dd6600;--glow:rgba(255,150,0,0.5);display:flex;align-items:center;justify-content:center;font-size:2.5rem;">🍄</div>
        <div class="stem" id="s4"></div>
      </div>
      <div class="shroom" style="right:30%;--sw:14px;--sh:50px;--cw:50px;--ch:32px;">
        <div class="cap" style="background:#aa3300;--glow:rgba(200,80,0,0.3);">🍄</div>
        <div class="stem" id="s5"></div>
      </div>
      <div class="shroom" style="right:12%;--sw:18px;--sh:65px;--cw:62px;--ch:40px;">
        <div class="cap" style="background:#cc5500;--glow:rgba(230,100,0,0.4);">🍄</div>
        <div class="stem" id="s6"></div>
      </div>
      <div class="msg-glow" id="msg-glow">
        <div style="font-size:2rem;color:#88ff88;">${escapeHtml(data.receiver)}</div>
      </div>
      <div class="hint" id="hint">🍄 คลิกเพื่อให้เห็ดงอกขึ้น</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#88ff44;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#66cc44;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    let clicked = false;
    document.getElementById('scene').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        const stems = ['s1','s2','s3','s4','s5','s6'];
        stems.forEach((id, i) => {
            gsap.to(`#${id}`, {scaleY:1, duration:0.8, delay:i*0.15, ease:'back.out(1.5)'});
        });
        document.querySelectorAll('.cap').forEach((c, i) => {
            gsap.to(c, {scaleY:1, duration:0.6, delay:0.4+i*0.15, ease:'elastic.out(1.2,0.5)'});
        });
        gsap.to('#big-cap', {boxShadow:'0 0 60px rgba(100,255,100,0.9)', duration:0.8, delay:1.5});
        const scene = document.getElementById('scene');
        for (let j = 0; j < 30; j++) {
            setTimeout(() => {
                const sp = document.createElement('div'); sp.className = 'spore';
                const size = 4 + Math.random()*8;
                sp.style.cssText = `width:${size}px;height:${size}px;left:${40+Math.random()*20}%;bottom:${20+Math.random()*20}%;animation-duration:${1+Math.random()*2}s;`;
                scene.appendChild(sp);
                setTimeout(() => sp.remove(), 3000);
            }, j*80);
        }
        gsap.to('#msg-glow', {opacity:1, duration:1, delay:2});
        setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 3500);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
