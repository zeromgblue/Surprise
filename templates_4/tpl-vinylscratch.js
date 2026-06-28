export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#000;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&family=Sarabun:wght@300;400&display=swap');
        .vinyl-scene{position:relative;width:100vw;height:100vh;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;}
        .record-wrap{position:relative;width:250px;height:250px;cursor:grab;user-select:none;}
        .record{width:250px;height:250px;border-radius:50%;background:conic-gradient(#111 0deg,#222 10deg,#111 20deg,#1a1a1a 30deg,#111 40deg,#222 50deg,#111 360deg);box-shadow:0 0 40px rgba(0,255,136,0.3),0 0 0 3px #333;position:relative;}
        .record-label{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,#00FF88,#006633);display:flex;align-items:center;justify-content:center;text-align:center;}
        .label-txt{font-family:'Orbitron',monospace;font-size:0.5rem;color:#000;font-weight:700;letter-spacing:1px;line-height:1.2;}
        .needle{position:absolute;top:20px;right:-40px;width:60px;height:4px;background:linear-gradient(90deg,#888,#ccc);border-radius:2px;transform-origin:left center;transform:rotate(-20deg);}
        .needle::after{content:'';position:absolute;right:-4px;top:-4px;width:12px;height:12px;border-radius:50%;background:#FFD700;box-shadow:0 0 10px #FFD700;}
        .scratch-hint{font-family:'Orbitron',monospace;color:#00FF88;font-size:0.9rem;margin-top:25px;animation:fade 2s infinite;letter-spacing:3px;text-align:center;}
        @keyframes fade{0%,100%{opacity:0.3}50%{opacity:1}}
        .waveform{position:absolute;bottom:20%;width:80%;height:60px;display:flex;align-items:center;justify-content:center;gap:2px;opacity:0;}
        .wave-bar{width:3px;background:#00FF88;border-radius:2px;}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;background:rgba(0,0,0,0.9);}
        .m-to{font-family:'Orbitron',monospace;font-size:2.5rem;color:#00FF88;text-shadow:0 0 30px #00FF88;margin-bottom:20px;letter-spacing:3px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#e0e0e0;line-height:1.7;max-width:600px;}
        .m-from{font-family:'Orbitron',monospace;font-size:1rem;color:#00FF88;margin-top:25px;letter-spacing:5px;}
    </style>
    <div class="vinyl-scene" id="scene">
        <div class="record-wrap" id="recordWrap">
            <div class="record" id="record">
                <div class="record-label">
                    <div class="label-txt">FOR<br>${escapeHtml(data.receiver).slice(0,8)}<br>DJ MIX</div>
                </div>
            </div>
            <div class="needle" id="needle"></div>
        </div>
        <div class="scratch-hint" id="hint">ลากซ้ายขวาเพื่อ SCRATCH แผ่น</div>
        <div class="waveform" id="waveform"></div>
        <div class="msg-panel" id="msg">
            <div class="m-to">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">— DJ ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;

    // Build waveform
    const waveform = document.getElementById('waveform');
    for (let i = 0; i < 50; i++) {
        const b = document.createElement('div');
        b.className = 'wave-bar';
        b.style.height = (5 + Math.random() * 50) + 'px';
        waveform.appendChild(b);
    }

    const record = document.getElementById('record');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    let rotation = 0;
    let isDragging = false;
    let lastX = 0;
    let scratchCount = 0;
    let animId;

    // Auto spin
    animId = setInterval(() => { rotation += 0.5; record.style.transform = `rotate(${rotation}deg)`; }, 16);

    const wrap = document.getElementById('recordWrap');
    wrap.addEventListener('mousedown', (e) => { isDragging = true; lastX = e.clientX; clearInterval(animId); });
    wrap.addEventListener('touchstart', (e) => { isDragging = true; lastX = e.touches[0].clientX; clearInterval(animId); });
    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        rotation += dx * 2;
        record.style.transform = `rotate(${rotation}deg)`;
        lastX = e.clientX;
        scratchCount += Math.abs(dx);
        if (scratchCount > 400) reveal();
    });
    window.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const dx = e.touches[0].clientX - lastX;
        rotation += dx * 2;
        record.style.transform = `rotate(${rotation}deg)`;
        lastX = e.touches[0].clientX;
        scratchCount += Math.abs(dx);
        if (scratchCount > 400) reveal();
    });
    window.addEventListener('mouseup', () => { isDragging = false; if (scratchCount < 400) animId = setInterval(() => { rotation += 0.5; record.style.transform = `rotate(${rotation}deg)`; }, 16); });
    window.addEventListener('touchend', () => { isDragging = false; });

    let revealed = false;
    function reveal() {
        if (revealed) return;
        revealed = true;
        hint.style.display = 'none';
        gsap.to(waveform, { opacity: 1, duration: 0.5 });
        waveform.querySelectorAll('.wave-bar').forEach((b, i) => {
            gsap.to(b, { height: (5 + Math.random() * 50) + 'px', duration: 0.2, repeat: 10, yoyo: true, delay: i * 0.01 });
        });
        setTimeout(() => {
            clearInterval(animId);
            gsap.to('#recordWrap', { y: -300, opacity: 0, duration: 0.8, ease: 'power2.in' });
            gsap.to(waveform, { opacity: 0, duration: 0.5 });
            gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 0.8, ease: 'power2.out' });
        }, 1500);
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
