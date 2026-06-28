export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A0800;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;gap:24px;}
    .wheel-wrap{position:relative;width:300px;height:300px;cursor:pointer;}
    svg.wheel{overflow:visible;}
    .decode-btn{padding:12px 36px;background:linear-gradient(135deg,#cc8800,#ff9900);border:none;border-radius:30px;color:#000;font-size:1rem;font-family:'Sarabun',sans-serif;font-weight:700;cursor:pointer;box-shadow:0 0 20px rgba(255,153,0,0.5);letter-spacing:1px;display:none;}
    .decode-btn:hover{transform:scale(1.05);}
    .hint{color:#cc8833;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.5);padding:6px 16px;border-radius:20px;}
    .output{color:#ffaa00;font-family:'Sarabun',sans-serif;font-size:1.1rem;min-height:30px;letter-spacing:3px;text-shadow:0 0 10px #ffaa00;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="hint" id="hint">🔐 คลิกที่วงล้อเพื่อหมุน จากนั้นกด DECODE</div>
      <div class="wheel-wrap" id="wheel-wrap">
        <svg id="wheelsvg" width="300" height="300" viewBox="0 0 300 300" class="wheel">
          <circle cx="150" cy="150" r="130" fill="#1a1200" stroke="#cc8800" stroke-width="3"/>
          <circle cx="150" cy="150" r="80" fill="#0a0800" stroke="#cc6600" stroke-width="2"/>
          <circle cx="150" cy="150" r="10" fill="#ffaa00"/>
          <g id="outer-letters"></g>
          <g id="inner-letters"></g>
        </svg>
      </div>
      <div class="output" id="output">??????????????????</div>
      <button class="decode-btn" id="decode-btn">🔓 DECODE</button>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#ffaa00;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#cc8833;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const outerG = document.getElementById('outer-letters');
    const innerG = document.getElementById('inner-letters');
    let innerRotation = 0;
    let clickCount = 0;
    alphabet.split('').forEach((ch, i) => {
        const angle = (i / 26) * 360 - 90;
        const rad = angle * Math.PI / 180;
        const ox = 150 + 110 * Math.cos(rad);
        const oy = 150 + 110 * Math.sin(rad);
        const t = document.createElementNS('http://www.w3.org/2000/svg','text');
        t.setAttribute('x', ox); t.setAttribute('y', oy);
        t.setAttribute('text-anchor','middle'); t.setAttribute('dominant-baseline','middle');
        t.setAttribute('fill','#cc8833'); t.setAttribute('font-size','13');
        t.setAttribute('font-family','monospace'); t.textContent = ch;
        outerG.appendChild(t);
        const ix = 150 + 60 * Math.cos(rad);
        const iy = 150 + 60 * Math.sin(rad);
        const t2 = document.createElementNS('http://www.w3.org/2000/svg','text');
        t2.setAttribute('x', ix); t2.setAttribute('y', iy);
        t2.setAttribute('text-anchor','middle'); t2.setAttribute('dominant-baseline','middle');
        t2.setAttribute('fill','#ffaa00'); t2.setAttribute('font-size','11');
        t2.setAttribute('font-family','monospace'); t2.textContent = alphabet[(i + 3) % 26];
        innerG.appendChild(t2);
    });
    document.getElementById('wheel-wrap').addEventListener('click', () => {
        clickCount++;
        innerRotation += 14;
        gsap.to(innerG, {rotation: innerRotation, svgOrigin:'150 150', duration:0.5, ease:'back.out(1.5)'});
        if (clickCount >= 2) document.getElementById('decode-btn').style.display = 'inline-block';
    });
    document.getElementById('decode-btn').addEventListener('click', () => {
        gsap.to('#hint', {opacity:0, duration:0.3});
        gsap.to(innerG, {rotation:'+=360', svgOrigin:'150 150', duration:1.2, ease:'power2.inOut', onComplete: typeDecoded});
    });
    function typeDecoded() {
        const fullText = data.receiver || 'SURPRISE';
        const el = document.getElementById('output');
        el.textContent = '';
        let i = 0;
        const iv = setInterval(() => {
            el.textContent = fullText.substring(0, i++);
            if (i > fullText.length) {
                clearInterval(iv);
                setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 1000);
            }
        }, 80);
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
