export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#100300;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,700&family=Sarabun:wght@300;400&display=swap');
        .choc-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 60%,#2d0a00,#100300);display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .box-outer{position:relative;cursor:pointer;z-index:10;}
        .box-lid{width:220px;height:20px;background:linear-gradient(180deg,#1a0a00,#3d1500);border-radius:4px 4px 0 0;border:2px solid #D4AF37;position:relative;transition:transform 0.6s cubic-bezier(.4,2,.5,1);}
        .box-lid.open{transform:rotateX(-120deg);transform-origin:bottom center;}
        .box-top-label{position:absolute;top:-30px;left:50%;transform:translateX(-50%);white-space:nowrap;font-family:'Cormorant Garamond',serif;font-size:0.8rem;color:#D4AF37;letter-spacing:4px;font-style:italic;}
        .box-body{width:220px;height:140px;background:linear-gradient(180deg,#2d1000,#1a0800);border:2px solid #D4AF37;border-top:none;border-radius:0 0 8px 8px;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:6px;position:relative;}
        .choc-piece{width:100%;aspect-ratio:1;border-radius:4px;cursor:pointer;transition:transform 0.2s;position:relative;display:flex;align-items:center;justify-content:center;}
        .choc-piece:hover{transform:scale(1.1);}
        .choc-piece.special{box-shadow:0 0 10px #D4AF37;animation:gleam 2s infinite;}
        @keyframes gleam{0%,100%{box-shadow:0 0 6px #D4AF37}50%{box-shadow:0 0 20px #D4AF37,0 0 40px rgba(212,175,55,0.3)}}
        .ribbon{position:absolute;top:0;left:50%;transform:translateX(-50%);width:4px;height:100%;background:rgba(212,175,55,0.4);}
        .ribbon-h{position:absolute;top:50%;left:0;transform:translateY(-50%);width:100%;height:4px;background:rgba(212,175,55,0.4);}
        .bow{position:absolute;top:-15px;left:50%;transform:translateX(-50%);width:30px;height:20px;display:flex;gap:4px;}
        .bow-loop{width:12px;height:14px;border-radius:50%;border:3px solid #D4AF37;background:rgba(212,175,55,0.1);}
        .hint-txt{font-family:'Cormorant Garamond',serif;font-style:italic;color:#D4AF37;font-size:1.1rem;margin-top:20px;animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Cormorant Garamond',serif;font-size:3.5rem;font-style:italic;color:#D4AF37;text-shadow:0 0 30px rgba(212,175,55,0.4);margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#FEF3C7;line-height:1.8;max-width:600px;}
        .m-from{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:1.3rem;color:#B45309;margin-top:30px;}
        .sparkle{position:absolute;pointer-events:none;font-size:1.2rem;opacity:0;}
    </style>
    <div class="choc-scene" id="scene">
        <div class="box-outer">
            <div class="box-lid" id="lid">
                <div class="box-top-label">SURPRISE CHOCOLATES ✦</div>
                <div class="ribbon"></div>
                <div class="ribbon-h"></div>
                <div class="bow"><div class="bow-loop"></div><div class="bow-loop"></div></div>
            </div>
            <div class="box-body" id="boxBody">
                ${['#3d1500','#5C2200','#2d1000','#4a1800','#3d1500','#5C2200','#6B3000','#3d1500'].map((c,i)=>`<div class="choc-piece ${i===3?'special':''}" style="background:radial-gradient(circle at 30% 30%,${c},#1a0500);">${i===3?'💛':''}</div>`).join('')}
            </div>
        </div>
        <div class="hint-txt" id="hint">🍫 แตะที่กล่องเพื่อเปิด</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">🍫 จาก ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;

    const lid = document.getElementById('lid');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const scene = document.getElementById('scene');
    let opened = false;

    lid.addEventListener('click', () => {
        if (opened) return;
        opened = true;
        hint.style.display = 'none';
        lid.classList.add('open');

        // Sparkles
        setTimeout(() => {
            for (let i = 0; i < 15; i++) {
                const sp = document.createElement('div');
                sp.className = 'sparkle';
                sp.textContent = ['✨','⭐','💫','✦'][i % 4];
                sp.style.cssText = `left:${30+Math.random()*40}%;top:${30+Math.random()*40}%;`;
                scene.appendChild(sp);
                gsap.to(sp, { opacity: 1, y: -(50 + Math.random() * 100), x: (Math.random() - 0.5) * 100, duration: 1.2, delay: Math.random() * 0.5, ease: 'power2.out', onComplete: () => sp.remove() });
            }
            setTimeout(() => {
                gsap.to('.box-outer', { y: 200, opacity: 0, duration: 0.8, ease: 'power2.in' });
                gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 0.8, ease: 'power2.out' });
            }, 1500);
        }, 600);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
