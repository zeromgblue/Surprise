export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A000A;";
    document.body.style.cssText = "margin:0;overflow:hidden;cursor:none;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}
    .paper{width:min(500px,88vw);height:min(380px,60vh);background:#f8f4ee;border-radius:4px;box-shadow:0 0 60px rgba(150,0,200,0.15),0 8px 40px rgba(0,0,0,0.8);position:relative;overflow:hidden;}
    .paper-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px;text-align:center;font-family:'Sarabun',sans-serif;}
    .paper-text .receiver{font-size:2.2rem;font-weight:700;color:#9933cc;text-shadow:0 0 20px #cc44ff,0 0 40px #9900cc;margin-bottom:16px;}
    .paper-text .msg{font-size:1rem;color:#7722aa;line-height:1.8;max-width:420px;text-shadow:0 0 12px #cc66ff;}
    .paper-text .sender{font-size:0.9rem;color:#aa44dd;margin-top:18px;text-shadow:0 0 10px #cc44ff;}
    .mask{position:absolute;inset:0;background:#f8f4ee;pointer-events:none;}
    .uv-cursor{position:fixed;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(160,0,255,0.35) 0%,transparent 70%);pointer-events:none;transform:translate(-50%,-50%);z-index:100;mix-blend-mode:multiply;}
    .uv-light{position:absolute;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(180,0,255,0.9) 0%,transparent 70%);pointer-events:none;transform:translate(-50%,-50%);z-index:10;mix-blend-mode:screen;}
    .hint{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);color:#cc44ff;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.7);padding:6px 16px;border-radius:20px;white-space:nowrap;z-index:50;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="uv-cursor" id="uvcursor"></div>
      <div class="paper" id="paper">
        <div class="paper-text" id="paper-text">
          <div class="receiver">${escapeHtml(data.receiver)}</div>
          <div class="msg">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
          <div class="sender">— ${escapeHtml(data.sender)} —</div>
        </div>
        <div class="mask" id="mask">
          <div class="uv-light" id="uvlight" style="display:none;"></div>
        </div>
      </div>
      <div class="hint" id="hint">🔦 เลื่อนเมาส์เพื่อส่องกระดาษ — คลิกเพื่อเปิดเผยทั้งหมด</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#cc44ff;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#aa44dd;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    const cursor = document.getElementById('uvcursor');
    const uvlight = document.getElementById('uvlight');
    const mask = document.getElementById('mask');
    const paper = document.getElementById('paper');
    let revealed = false;
    document.addEventListener('mousemove', e => {
        gsap.to(cursor, {x:e.clientX, y:e.clientY, duration:0.15});
        const rect = paper.getBoundingClientRect();
        const rx = e.clientX - rect.left;
        const ry = e.clientY - rect.top;
        if (rx>0 && rx<rect.width && ry>0 && ry<rect.height && !revealed) {
            uvlight.style.display = 'block';
            uvlight.style.left = rx + 'px';
            uvlight.style.top = ry + 'px';
            mask.style.background = `radial-gradient(circle 60px at ${rx}px ${ry}px, transparent 0%, #f8f4ee 65%)`;
        }
    });
    document.getElementById('scene').addEventListener('click', () => {
        if (revealed) return; revealed = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        document.body.style.cursor = 'default';
        cursor.style.display = 'none';
        let progress = 0;
        const sweepInterval = setInterval(() => {
            progress += 2;
            const x = (progress % 100);
            const y = Math.floor(progress / 100) * 20;
            mask.style.background = `linear-gradient(to right, transparent ${x}%, #f8f4ee ${x+5}%)`;
            if (progress >= 300) {
                clearInterval(sweepInterval);
                gsap.to(mask, {opacity:0, duration:0.8, onComplete: () => {
                    setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 500);
                }});
            }
        }, 16);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
