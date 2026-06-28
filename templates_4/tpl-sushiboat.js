export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#082F49;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&family=Sarabun:wght@300;400&display=swap');
        .sushi-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:linear-gradient(180deg,#082F49 0%,#0C4A6E 40%,#0E7490 100%);}
        .water-canvas{position:absolute;bottom:0;left:0;width:100%;height:40%;}
        .boat-wrap{position:absolute;bottom:35%;left:-250px;display:flex;align-items:flex-end;gap:0;z-index:10;}
        .boat{width:220px;height:50px;background:linear-gradient(180deg,#78350F,#451A03);border-radius:0 0 40px 40px;position:relative;}
        .boat-edge{position:absolute;top:-8px;left:0;width:220px;height:12px;background:#92400E;border-radius:8px;}
        .sushi-item{position:absolute;top:-30px;width:35px;height:25px;background:#1A1A1A;border-radius:4px;display:flex;align-items:flex-start;justify-content:center;padding-top:2px;}
        .sushi-letter{font-family:'Noto Serif JP',serif;font-size:0.6rem;color:#FFD700;font-weight:700;}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Noto Serif JP',serif;font-size:3rem;color:#0EA5E9;text-shadow:0 0 30px rgba(14,165,233,0.5);margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#E0F2FE;line-height:1.8;max-width:600px;}
        .m-from{font-family:'Noto Serif JP',serif;font-size:1.1rem;color:#7DD3FC;margin-top:25px;letter-spacing:3px;}
        .hint-txt{position:absolute;bottom:10%;width:100%;text-align:center;font-family:'Sarabun',sans-serif;color:#7DD3FC;font-size:1rem;animation:pulse 1.5s infinite;}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        .wave-ring{position:absolute;border-radius:50%;border:2px solid rgba(14,165,233,0.4);opacity:0;}
    </style>
    <div class="sushi-scene" id="scene">
        <canvas class="water-canvas" id="waterCanvas"></canvas>
        <div class="boat-wrap" id="boatWrap">
            <div class="boat" id="boat">
                <div class="boat-edge"></div>
                <div class="sushi-item" style="left:20px"><div class="sushi-letter">🍣</div></div>
                <div class="sushi-item" style="left:60px"><div class="sushi-letter">🍱</div></div>
                <div class="sushi-item" style="left:100px"><div class="sushi-letter">🍜</div></div>
                <div class="sushi-item" style="left:145px"><div class="sushi-letter">💝</div></div>
            </div>
        </div>
        <div class="hint-txt" id="hint">เรือซูชิกำลังแล่นมา...</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">🍣 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">🍱 จาก ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;

    // Water animation
    const canvas = document.getElementById('waterCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.4;
    let wPhase = 0;
    function drawWater() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(14,165,233,0.15)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x++) {
            ctx.lineTo(x, 30 + Math.sin(x * 0.02 + wPhase) * 15 + Math.sin(x * 0.04 + wPhase * 1.3) * 8);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();
        wPhase += 0.05;
        requestAnimationFrame(drawWater);
    }
    drawWater();

    const boatWrap = document.getElementById('boatWrap');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');

    // Boat sails in
    gsap.to(boatWrap, {
        left: '50%', duration: 3, ease: 'power1.out',
        onUpdate: function() { boatWrap.style.transform = `translateX(-50%) translateY(${Math.sin(Date.now() * 0.003) * 5}px)`; }
    });

    setTimeout(() => {
        hint.textContent = '💝 แตะเรือซูชิเพื่อเปิดข้อความ!';
        document.getElementById('boat').style.cursor = 'pointer';
        document.getElementById('boat').addEventListener('click', () => {
            hint.style.display = 'none';
            gsap.to(boatWrap, { y: -300, opacity: 0, duration: 1, ease: 'power2.in' });
            gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 0.8, ease: 'power2.out' });
        });
    }, 3200);
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
