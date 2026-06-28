export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#172554;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 30%,#1e3a8a,#172554);}
    canvas{position:absolute;inset:0;pointer-events:none;}
    .name-reveal{position:absolute;top:35%;left:50%;transform:translateX(-50%);font-family:'Sarabun',sans-serif;font-size:3rem;font-weight:700;color:#e0f2fe;text-shadow:0 0 30px #38bdf8,0 0 60px #0284c7;opacity:0;white-space:nowrap;letter-spacing:4px;}
    .hint{position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#93c5fd;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.5);padding:6px 16px;border-radius:20px;white-space:nowrap;z-index:10;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <canvas id="snow-canvas"></canvas>
      <div class="name-reveal" id="name-reveal">${escapeHtml(data.receiver)}</div>
      <div class="hint" id="hint">❄️ คลิกเพื่อเรียกพายุหิมะ</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#7dd3fc;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#93c5fd;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    const canvas = document.getElementById('snow-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = container.offsetWidth; canvas.height = container.offsetHeight;
    const flakes = [];
    const SNOWFLAKES = ['❄','❅','❆','✦','*'];
    for (let i = 0; i < 120; i++) {
        flakes.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, r:Math.random()*14+6,
            speed:Math.random()*1.5+0.5, drift:Math.random()*0.5-0.25, opacity:Math.random()*0.7+0.3,
            char:SNOWFLAKES[Math.floor(Math.random()*SNOWFLAKES.length)], angle:0, spin:(Math.random()-0.5)*0.04});
    }
    let vortex = false, vortexAngle = 0, vortexStrength = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        flakes.forEach(f => {
            if (vortex) {
                const cx = canvas.width/2, cy = canvas.height/2;
                const dx = f.x-cx, dy = f.y-cy;
                const angle = Math.atan2(dy, dx) + vortexStrength;
                const dist = Math.sqrt(dx*dx+dy*dy);
                f.x = cx + dist*Math.cos(angle);
                f.y = cy + dist*Math.sin(angle);
                if (dist > 10) { f.x += (cx-f.x)*0.02; f.y += (cy-f.y)*0.02; }
            } else {
                f.y += f.speed; f.x += f.drift;
                if (f.y > canvas.height) { f.y = -20; f.x = Math.random()*canvas.width; }
            }
            f.angle += f.spin;
            ctx.save();
            ctx.translate(f.x, f.y);
            ctx.rotate(f.angle);
            ctx.globalAlpha = f.opacity;
            ctx.fillStyle = '#e0f2fe';
            ctx.font = `${f.r}px serif`;
            ctx.textAlign = 'center';
            ctx.fillText(f.char, 0, 0);
            ctx.restore();
        });
        if (vortex && vortexStrength < 0.12) vortexStrength += 0.001;
        requestAnimationFrame(animate);
    }
    animate();
    let clicked = false;
    document.getElementById('scene').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        vortex = true;
        setTimeout(() => {
            vortex = false;
            gsap.to('#name-reveal', {opacity:1, duration:1.5, ease:'power2.out'});
            setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), 2500);
        }, 2500);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
