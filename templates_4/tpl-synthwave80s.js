export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#02000A;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Sarabun:wght@300;400&display=swap');
        .sw-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:#02000A;display:flex;align-items:center;justify-content:center;cursor:pointer;}
        .sun{position:absolute;bottom:40%;width:220px;height:220px;border-radius:50%;background:linear-gradient(180deg,#FF006E 0%,#FF8C00 50%,#FF006E 100%);box-shadow:0 0 80px rgba(255,0,110,0.8);left:50%;transform:translateX(-50%);overflow:hidden;}
        .sun-stripe{position:absolute;width:100%;height:10px;background:#02000A;left:0;}
        .grid-floor{position:absolute;bottom:0;left:0;width:100%;height:40%;overflow:hidden;}
        .grid-canvas{position:absolute;bottom:0;left:0;width:100%;height:100%;}
        .mountains{position:absolute;bottom:40%;left:0;width:100%;height:150px;}
        .mtn-svg{width:100%;height:100%;}
        .stars{position:absolute;top:0;left:0;width:100%;height:60%;}
        .star{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:40;padding:40px;text-align:center;}
        .m-to{font-family:'Orbitron',monospace;font-size:2.8rem;font-weight:900;color:#FF006E;text-shadow:0 0 20px #FF006E,0 0 40px #FF006E;letter-spacing:4px;margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#FF8C00;line-height:1.7;max-width:600px;text-shadow:0 0 10px #FF8C00;}
        .m-from{font-family:'Orbitron',monospace;font-size:1rem;color:#8338EC;margin-top:30px;letter-spacing:6px;text-shadow:0 0 15px #8338EC;}
        .click-hint{position:absolute;bottom:20%;font-family:'Orbitron',monospace;font-size:0.9rem;color:#FF006E;animation:blink 1.5s infinite;letter-spacing:3px;text-align:center;width:100%;}
        @keyframes blink{0%,100%{opacity:0.3}50%{opacity:1}}
        .scanline{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.15) 2px,rgba(0,0,0,0.15) 4px);pointer-events:none;z-index:60;}
    </style>
    <div class="sw-scene" id="scene">
        <div class="stars" id="stars"></div>
        <div class="sun" id="sun">
            <div class="sun-stripe" style="top:55%;height:8px;"></div>
            <div class="sun-stripe" style="top:65%;height:6px;"></div>
            <div class="sun-stripe" style="top:73%;height:5px;"></div>
            <div class="sun-stripe" style="top:80%;height:4px;"></div>
            <div class="sun-stripe" style="top:86%;height:4px;"></div>
        </div>
        <div class="mountains">
            <svg class="mtn-svg" viewBox="0 0 1000 150" preserveAspectRatio="none">
                <polygon points="0,150 200,20 350,80 500,10 650,70 800,30 1000,150" fill="#1a0030" stroke="#8338EC" stroke-width="2"/>
                <polygon points="0,150 150,60 300,100 450,40 600,90 750,50 900,80 1000,150" fill="#02000A" stroke="#FF006E" stroke-width="1" opacity="0.5"/>
            </svg>
        </div>
        <div class="grid-floor"><canvas class="grid-canvas" id="gridCanvas"></canvas></div>
        <div class="click-hint" id="hint">— CLICK TO ENTER —</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
        <div class="scanline"></div>
    </div>`;

    // Draw grid
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.4;

    function drawGrid(offset) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#FF006E';
        ctx.lineWidth = 1;
        const cols = 20, rows = 10;
        const cw = canvas.width / cols, ch = canvas.height / rows;
        const vp = { x: canvas.width / 2, y: 0 };
        for (let i = 0; i <= cols; i++) {
            ctx.globalAlpha = 0.4 + (i === cols/2 ? 0.4 : 0);
            ctx.beginPath();
            ctx.moveTo(i * cw, 0);
            ctx.lineTo(vp.x, canvas.height);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        for (let j = 0; j <= rows; j++) {
            const y = ((j + offset) % rows) / rows * canvas.height;
            ctx.globalAlpha = j / rows * 0.8;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
    }

    let offset = 0;
    const anim = setInterval(() => { offset = (offset + 0.05) % 10; drawGrid(offset); }, 50);

    // Stars
    const starsEl = document.getElementById('stars');
    for (let i = 0; i < 60; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:${0.3+Math.random()*0.7};animation:blink ${1+Math.random()*3}s infinite;`;
        starsEl.appendChild(s);
    }

    // Sun animation
    gsap.to('#sun', { y: -20, duration: 3, yoyo: true, repeat: -1, ease: 'sine.inOut' });

    const scene = document.getElementById('scene');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    let clicked = false;
    scene.addEventListener('click', () => {
        if (clicked) return;
        clicked = true;
        hint.style.display = 'none';
        clearInterval(anim);
        gsap.to('#sun', { scale: 3, opacity: 0, duration: 1.2, ease: 'power2.in' });
        gsap.to('.mountains', { y: 100, opacity: 0, duration: 0.8 });
        gsap.to('.grid-floor', { opacity: 0, duration: 0.8 });
        gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 0.8, ease: 'power2.out' });
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
