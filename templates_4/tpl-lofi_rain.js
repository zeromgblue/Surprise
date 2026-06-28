export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1F2937;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:ital,wght@1,300;0,400;0,700&display=swap');
        .lofi-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:#1F2937;display:flex;align-items:center;justify-content:center;cursor:pointer;}
        .room-bg{position:absolute;inset:0;background:linear-gradient(180deg,#111827 0%,#1F2937 50%,#111827 100%);}
        .window{position:absolute;top:10%;left:50%;transform:translateX(-50%);width:240px;height:300px;border:8px solid #374151;border-radius:8px;background:linear-gradient(180deg,#0a1628,#162032);overflow:hidden;box-shadow:0 0 60px rgba(167,139,250,0.2);}
        .rain-canvas{position:absolute;inset:0;width:100%;height:100%;}
        .fog-layer{position:absolute;inset:0;background:rgba(255,255,255,0.04);pointer-events:none;}
        .message-frost{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Sarabun',sans-serif;font-size:0.9rem;color:rgba(200,220,255,0.6);font-style:italic;text-align:center;padding:10px;opacity:0;}
        .desk{position:absolute;bottom:0;width:100%;height:35%;background:#2D1F0A;border-top:4px solid #4B3010;}
        .coffee{position:absolute;bottom:36%;left:calc(50% + 140px);width:40px;height:50px;background:radial-gradient(ellipse,#3D2010,#1A0C00);border-radius:4px 4px 0 0;border:2px solid #4B3010;}
        .steam{position:absolute;bottom:56%;left:calc(50% + 145px);width:3px;height:0;background:linear-gradient(180deg,transparent,rgba(255,255,255,0.4));border-radius:2px;}
        .notebook{position:absolute;bottom:36%;left:calc(50% - 200px);width:150px;height:100px;background:#1E3A5F;border-radius:4px;border:2px solid #2D4A6F;transform:rotate(-5deg);}
        .hint-txt{position:absolute;top:5%;font-family:'Sarabun',sans-serif;color:rgba(167,139,250,0.8);font-size:1rem;text-align:center;width:100%;animation:fade 2s infinite;font-style:italic;}
        @keyframes fade{0%,100%{opacity:0.4}50%{opacity:0.9}}
        .msg-overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;background:rgba(17,24,39,0.9);padding:40px;text-align:center;}
        .m-to{font-family:'Sarabun',sans-serif;font-size:2.5rem;font-weight:700;color:#A78BFA;margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;font-style:italic;color:#D1D5DB;line-height:1.8;max-width:580px;}
        .m-from{font-family:'Sarabun',sans-serif;font-size:1rem;color:#6B7280;margin-top:25px;letter-spacing:3px;}
        .vinyl-icon{font-size:3rem;animation:spin 3s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
    </style>
    <div class="lofi-scene" id="scene">
        <div class="room-bg"></div>
        <div class="window" id="window">
            <canvas class="rain-canvas" id="rainCanvas"></canvas>
            <div class="fog-layer" id="fog"></div>
            <div class="message-frost" id="frost">แตะหน้าต่างเพื่อเช็ดหมอก...</div>
        </div>
        <div class="desk"></div>
        <div class="coffee"></div>
        <div class="steam" id="steam"></div>
        <div class="notebook"></div>
        <div class="hint-txt" id="hint">☁️ แตะหน้าต่างเพื่อดูข้อความในหมอก</div>
        <div class="msg-overlay" id="msg">
            <div class="vinyl-icon">💿</div>
            <div class="m-to">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} — ☕</div>
        </div>
    </div>`;

    // Rain animation
    const canvas = document.getElementById('rainCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 224; canvas.height = 284;
    const drops = Array.from({length: 40}, () => ({ x: Math.random() * 224, y: Math.random() * 284, speed: 3 + Math.random() * 3, len: 8 + Math.random() * 12 }));

    function animRain() {
        ctx.clearRect(0, 0, 224, 284);
        ctx.strokeStyle = 'rgba(100,160,220,0.4)';
        ctx.lineWidth = 1;
        drops.forEach(d => {
            ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 1, d.y + d.len); ctx.stroke();
            d.y += d.speed;
            if (d.y > 284) { d.y = -d.len; d.x = Math.random() * 224; }
        });
        requestAnimationFrame(animRain);
    }
    animRain();

    // Steam animation
    gsap.to('#steam', { height: 20, opacity: 0, duration: 1.5, yoyo: true, repeat: -1, ease: 'power2.out' });

    const win = document.getElementById('window');
    const frost = document.getElementById('frost');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    let wiped = false;

    gsap.to(frost, { opacity: 1, duration: 0.5, delay: 0.5 });

    win.addEventListener('click', () => {
        if (wiped) return;
        wiped = true;
        hint.style.display = 'none';
        const fog = document.getElementById('fog');
        gsap.to(fog, { opacity: 0, duration: 1.5 });
        gsap.to(frost, { opacity: 0, duration: 0.5 });

        setTimeout(() => {
            gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, ease: 'power2.out' });
        }, 1500);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
