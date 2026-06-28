export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1A0A00;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 100%,#2a1200,#1a0a00);cursor:pointer;}
    .paw{position:absolute;top:-250px;left:50%;transform:translateX(-50%);font-size:180px;line-height:1;text-align:center;filter:drop-shadow(0 20px 40px rgba(0,0,0,0.8));z-index:10;}
    .ground-msg{position:absolute;bottom:28%;left:50%;transform:translateX(-50%);text-align:center;opacity:0;pointer-events:none;}
    .paw-prints{position:absolute;font-size:2rem;opacity:0;}
    .receiver-text{font-family:'Sarabun',sans-serif;font-size:2.5rem;color:#ffcc88;text-shadow:0 0 20px rgba(255,150,0,0.5);margin-bottom:12px;}
    .msg-text{font-family:'Sarabun',sans-serif;font-size:1rem;color:#ffddaa;line-height:1.8;max-width:500px;}
    .sender-text{font-family:'Sarabun',sans-serif;font-size:0.9rem;color:#cc8844;margin-top:14px;}
    .stamp-effect{position:absolute;bottom:25%;left:50%;transform:translateX(-50%);font-size:8rem;opacity:0;pointer-events:none;}
    .hint{position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#cc8844;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;z-index:20;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="paw" id="paw">🐾</div>
      <div class="stamp-effect" id="stamp">🐾</div>
      <div class="ground-msg" id="ground-msg">
        <div class="receiver-text">${escapeHtml(data.receiver)}</div>
        <div class="msg-text">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div class="sender-text">— ${escapeHtml(data.sender)} —</div>
      </div>
      <div class="hint" id="hint">🐱 คลิกที่ใดก็ได้ — อุ้งเท้าแมวกำลังมา!</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#ffcc88;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#cc8844;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    let clicked = false;
    const paw = document.getElementById('paw');
    const tl = gsap.timeline({repeat:-1, yoyo:false});
    tl.to(paw, {y:280, x:30, duration:1.2, ease:'power2.inOut'})
      .to(paw, {x:-30, duration:0.8, ease:'sine.inOut'})
      .to(paw, {y:260, x:10, duration:0.8, ease:'power2.inOut'})
      .to(paw, {y:290, x:-20, duration:0.8, ease:'power2.inOut'})
      .to(paw, {y:310, x:0, duration:1, ease:'power2.inOut'});
    document.getElementById('scene').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        tl.kill();
        gsap.to(paw, {y:600, x:0, duration:0.4, ease:'power3.in', onComplete: () => {
            const stamp = document.getElementById('stamp');
            gsap.fromTo(stamp, {opacity:1, scale:2}, {opacity:0.3, scale:1, duration:0.5, ease:'bounce.out'});
            gsap.to('#ground-msg', {opacity:1, y:0, duration:0.8, delay:0.3});
            setTimeout(() => paw.style.top = '-250px', 200);
            gsap.from(paw, {y:-250, duration:0.5, delay:0.8, ease:'power2.out'});
            gsap.to(paw, {y:200, duration:0.6, delay:1.4, ease:'power2.inOut'});
            gsap.to(paw, {y:-300, duration:0.8, delay:2.2, ease:'power2.in'});
            setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 3200);
        }});
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
