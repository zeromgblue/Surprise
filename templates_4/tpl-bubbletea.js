export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1C1200;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700;900&display=swap');
        .boba-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 80%,#3d2800,#1C1200);display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .cup-wrap{position:relative;cursor:pointer;z-index:10;}
        .cup{width:120px;height:180px;background:linear-gradient(180deg,rgba(180,140,80,0.3),rgba(100,70,30,0.4));border:3px solid rgba(255,220,100,0.5);border-radius:8px 8px 20px 20px;position:relative;overflow:hidden;backdrop-filter:blur(4px);}
        .tea-fill{position:absolute;bottom:0;width:100%;height:70%;background:linear-gradient(180deg,rgba(180,100,40,0.6),rgba(120,60,20,0.8));}
        .bubble{position:absolute;border-radius:50%;background:radial-gradient(circle at 35% 35%,#555,#111);box-shadow:inset -3px -3px 6px rgba(0,0,0,0.5);}
        .straw{position:absolute;top:-60px;right:20px;width:10px;height:240px;background:linear-gradient(90deg,rgba(255,100,150,0.8),rgba(255,150,200,0.6));border-radius:5px;}
        .cup-lid{position:absolute;top:-12px;left:-8px;width:136px;height:16px;background:rgba(200,180,100,0.5);border-radius:4px;border:2px solid rgba(255,220,100,0.4);}
        .shake-hint{font-family:'Sarabun',sans-serif;color:#F59E0B;font-size:1rem;margin-top:25px;animation:bounce 1s infinite;text-align:center;}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Sarabun',sans-serif;font-size:3rem;font-weight:900;color:#FDE68A;text-shadow:0 0 30px rgba(253,230,138,0.5);margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#FEF3C7;line-height:1.8;max-width:600px;}
        .m-from{font-family:'Sarabun',sans-serif;font-size:1rem;color:#D97706;margin-top:25px;letter-spacing:3px;}
    </style>
    <div class="boba-scene" id="scene">
        <div class="cup-wrap" id="cupWrap">
            <div class="cup" id="cup">
                <div class="tea-fill" id="teaFill"></div>
                <div class="bubble" id="b1" style="width:22px;height:22px;bottom:15px;left:20px;"></div>
                <div class="bubble" id="b2" style="width:18px;height:18px;bottom:25px;left:50px;"></div>
                <div class="bubble" id="b3" style="width:20px;height:20px;bottom:10px;left:75px;"></div>
                <div class="bubble" id="b4" style="width:16px;height:16px;bottom:35px;left:30px;"></div>
                <div class="bubble" id="b5" style="width:22px;height:22px;bottom:20px;left:65px;"></div>
            </div>
            <div class="cup-lid"></div>
            <div class="straw"></div>
        </div>
        <div class="shake-hint" id="hint">🧋 แตะเพื่อเขย่าแก้ว!</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">🧋 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;

    const cupWrap = document.getElementById('cupWrap');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    let shaken = false;

    cupWrap.addEventListener('click', () => {
        if (shaken) return;
        // Shake!
        gsap.to(cupWrap, { x: 20, duration: 0.08, yoyo: true, repeat: 10, ease: 'none' });
        // Bubbles float up
        ['b1','b2','b3','b4','b5'].forEach((id, i) => {
            gsap.to(`#${id}`, { y: -(150 + i * 20), opacity: 0, duration: 1 + i * 0.2, delay: 0.3 + i * 0.1, ease: 'power2.out' });
        });

        if (shaken) return;
        shaken = true;
        setTimeout(() => {
            hint.style.display = 'none';
            gsap.to(cupWrap, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.in(2)' });
            gsap.to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, delay: 0.4, ease: 'power2.out' });
        }, 1500);
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
