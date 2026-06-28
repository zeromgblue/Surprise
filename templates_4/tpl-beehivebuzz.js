export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1A0E00;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at 50% 40%,#2a1800,#1a0e00);}
    .hive-grid{position:relative;display:grid;gap:4px;}
    .hex{width:60px;height:52px;clip-path:polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%);background:#2a1800;display:flex;align-items:center;justify-content:center;font-family:'Sarabun',sans-serif;font-size:0.75rem;color:rgba(255,180,0,0);transition:background 0.5s,color 0.5s;cursor:pointer;}
    .hex.active{background:#cc8800;color:#1a0800;box-shadow:0 0 15px rgba(255,160,0,0.6);}
    .hex.center{background:#aa6600;box-shadow:0 0 20px rgba(255,140,0,0.5);}
    .bee{position:absolute;font-size:2rem;top:-60px;left:-60px;z-index:10;filter:drop-shadow(0 0 8px rgba(255,200,0,0.5));}
    .hint{position:absolute;top:12px;left:50%;transform:translateX(-50%);color:#cc8833;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.6);padding:6px 16px;border-radius:20px;white-space:nowrap;z-index:10;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div id="hive" class="hive-grid" style="grid-template-columns:repeat(7,64px);">
      </div>
      <div class="bee" id="bee">🐝</div>
      <div class="hint" id="hint">🐝 คลิกรังผึ้งเพื่อให้ผึ้งเต้นระบำ</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#ffcc00;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#cc8833;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    const hive = document.getElementById('hive');
    const msgParts = (data.receiver + ' ' + data.message).slice(0, 35).split('');
    const cols = 7, rows = 5;
    const cells = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const h = document.createElement('div');
            h.className = 'hex';
            const idx = r*cols+c;
            if (r===2&&c===3) h.classList.add('center');
            h.dataset.idx = idx;
            hive.appendChild(h);
            cells.push(h);
        }
    }
    let clicked = false;
    document.getElementById('scene').addEventListener('click', () => {
        if (clicked) return; clicked = true;
        gsap.to('#hint', {opacity:0, duration:0.3});
        const bee = document.getElementById('bee');
        const hiveRect = hive.getBoundingClientRect();
        const cx = hiveRect.left + hiveRect.width/2;
        const cy = hiveRect.top + hiveRect.height/2;
        gsap.to(bee, {x: cx-30, y: cy-60, duration:1.5, ease:'power2.inOut', onComplete: waggleDance});
    });
    function waggleDance() {
        const bee = document.getElementById('bee');
        gsap.to(bee, {x:'+=20', duration:0.15, yoyo:true, repeat:5, ease:'sine.inOut', onComplete: lightCells});
    }
    function lightCells() {
        cells.forEach((cell, i) => {
            if (i < msgParts.length) {
                gsap.to(cell, {duration:0.3, delay:i*0.08, onStart: () => {
                    cell.classList.add('active');
                    cell.textContent = msgParts[i];
                }});
            } else {
                gsap.to(cell, {background:'#331a00', duration:0.3, delay:i*0.04});
            }
        });
        setTimeout(() => gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5}), cells.length * 80 + 800);
    }
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
