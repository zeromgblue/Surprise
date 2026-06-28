export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0A1020;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');
    container.innerHTML = `<style>@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
    .scene{width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;flex-direction:column;gap:16px;}
    .puzzle-wrap{position:relative;width:280px;height:280px;}
    .piece{position:absolute;width:68px;height:68px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;box-shadow:2px 2px 8px rgba(0,0,0,0.6);cursor:default;}
    .gap{position:absolute;border:3px dashed #4466ff;border-radius:4px;box-shadow:0 0 20px rgba(80,120,255,0.6),inset 0 0 20px rgba(80,120,255,0.2);animation:gapglow 1.5s ease-in-out infinite;}
    @keyframes gapglow{0%,100%{box-shadow:0 0 12px rgba(80,120,255,0.4);}50%{box-shadow:0 0 30px rgba(80,120,255,0.9);}}
    .floating-piece{position:absolute;cursor:pointer;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.4rem;box-shadow:0 0 20px rgba(100,150,255,0.6);animation:float 2s ease-in-out infinite;}
    @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
    .hint{color:#8899ff;font-size:0.85rem;font-family:'Sarabun',sans-serif;background:rgba(0,0,0,0.5);padding:6px 16px;border-radius:20px;}
    .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
    </style>
    <div class="scene" id="scene">
      <div class="hint" id="hint">🧩 คลิกชิ้นส่วนที่ล่องลอยเพื่อเติมลงในช่องว่าง</div>
      <div class="puzzle-wrap" id="puzzle">
      </div>
      <div class="floating-piece" id="floater" style="width:68px;height:68px;background:linear-gradient(135deg,#2244aa,#4466ff);bottom:18%;right:8%;">⭐</div>
      <div class="msg-panel" id="msg">
        <div style="font-size:3rem;color:#ffd700;margin-bottom:20px;">${escapeHtml(data.receiver)}</div>
        <div style="font-size:1.2rem;color:#fff;line-height:1.8;max-width:600px;">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
        <div style="font-size:1rem;margin-top:25px;color:#aabbff;">— ${escapeHtml(data.sender)} —</div>
      </div>
    </div>`;
    const colors = ['#1a3366','#223388','#1a4488','#2255aa','#1a2244','#3355aa','#2244aa','#1133aa','#2266cc','#1a44aa','#336699','#3377bb','#224477','#1155aa','#2255bb','#4477cc'];
    const emojis = ['🌟','💫','✨','🎯','🔷','💎','🌙','🎪','🎨','🎭','🎬','🔮','🌈','🎵','🎶','🎁'];
    const gap = {col:2, row:2};
    const puzzle = document.getElementById('puzzle');
    const cellSize = 70;
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            if (r === gap.row && c === gap.col) {
                const g = document.createElement('div');
                g.className = 'gap';
                g.id = 'gap';
                g.style.cssText = `left:${c*cellSize}px;top:${r*cellSize}px;width:68px;height:68px;`;
                puzzle.appendChild(g);
            } else {
                const idx = r * 4 + c;
                const p = document.createElement('div');
                p.className = 'piece';
                p.style.cssText = `left:${c*cellSize}px;top:${r*cellSize}px;background:${colors[idx%colors.length]};`;
                p.textContent = emojis[idx%emojis.length];
                puzzle.appendChild(p);
            }
        }
    }
    document.getElementById('floater').addEventListener('click', () => {
        const floater = document.getElementById('floater');
        const gap = document.getElementById('gap');
        const gapRect = gap.getBoundingClientRect();
        const floatRect = floater.getBoundingClientRect();
        gsap.to(floater, {
            x: gapRect.left - floatRect.left, y: gapRect.top - floatRect.top,
            duration:0.7, ease:'back.out(1.5)',
            onComplete: () => {
                floater.style.animation = 'none';
                gap.style.animation = 'none';
                gsap.to('#puzzle', {boxShadow:'0 0 50px rgba(255,215,0,0.8)', duration:0.5});
                gsap.to('.piece', {boxShadow:'0 0 15px rgba(255,215,0,0.4)', stagger:0.05, duration:0.4});
                setTimeout(() => {
                    gsap.to('#puzzle', {rotationY:180, duration:1.2, ease:'power2.inOut', svgOrigin:'center center', onComplete: () => {
                        gsap.to('#msg', {opacity:1, pointerEvents:'auto', duration:1.5});
                    }});
                }, 600);
            }
        });
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
