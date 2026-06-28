export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#0F172A;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Sarabun:wght@300;400&display=swap');
        .ice-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:#0F172A;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;}
        .cone-wrap{position:relative;z-index:10;}
        .scoop-top{width:100px;height:100px;background:radial-gradient(circle at 35% 30%,#F9A8D4,#EC4899);border-radius:50%;position:relative;box-shadow:0 5px 20px rgba(236,72,153,0.4);}
        .scoop-mid{width:120px;height:100px;background:radial-gradient(circle at 35% 30%,#93C5FD,#3B82F6);border-radius:50%;margin-top:-30px;box-shadow:0 5px 20px rgba(59,130,246,0.4);}
        .cone{width:0;height:0;border-left:60px solid transparent;border-right:60px solid transparent;border-top:120px solid #D97706;margin:0 auto;margin-top:-30px;filter:drop-shadow(0 10px 10px rgba(0,0,0,0.4));}
        .drip{position:absolute;width:10px;border-radius:0 0 5px 5px;background:#EC4899;top:70px;}
        .sprinkle{position:absolute;width:6px;height:2px;border-radius:1px;}
        .melt-pool{position:absolute;bottom:-30px;left:50%;transform:translateX(-50%);width:0;height:20px;background:radial-gradient(ellipse,rgba(236,72,153,0.4),transparent);border-radius:50%;pointer-events:none;}
        .hint-txt{font-family:'Pacifico',cursive;color:#93C5FD;font-size:1rem;margin-top:30px;animation:bounce 1s infinite;}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        .drip-drop{position:absolute;pointer-events:none;border-radius:0 0 50% 50%;width:12px;}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Pacifico',cursive;font-size:3rem;color:#F9A8D4;text-shadow:0 0 20px rgba(249,168,212,0.5);margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#E0E7FF;line-height:1.8;max-width:600px;}
        .m-from{font-family:'Pacifico',cursive;font-size:1.1rem;color:#93C5FD;margin-top:25px;}
    </style>
    <div class="ice-scene" id="scene">
        <div class="cone-wrap" id="coneWrap">
            <div class="scoop-top" id="scoopTop">
                <div class="drip" style="left:15px;height:20px;"></div>
                <div class="drip" style="right:10px;height:15px;background:#3B82F6;"></div>
                <div class="sprinkle" style="top:20px;left:20px;background:#FACC15;transform:rotate(30deg)"></div>
                <div class="sprinkle" style="top:40px;left:60px;background:#4ADE80;transform:rotate(-20deg)"></div>
                <div class="sprinkle" style="top:30px;left:40px;background:#F97316;transform:rotate(45deg)"></div>
            </div>
            <div class="scoop-mid" id="scoopMid">
                <div class="drip" style="left:25px;height:25px;background:#3B82F6;"></div>
            </div>
            <div class="cone"></div>
            <div class="melt-pool" id="meltPool"></div>
        </div>
        <div class="hint-txt" id="hint">🍦 แตะเพื่อดูไอศกรีมละลาย</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">🍦 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">🍦 ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;

    const scene = document.getElementById('scene');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    let melting = false;

    scene.addEventListener('click', () => {
        if (melting) return;
        melting = true;
        hint.style.display = 'none';

        // Melt animation
        const tl = gsap.timeline();
        tl.to('#scoopTop', { scaleY: 0.6, scaleX: 1.3, y: 20, duration: 1.5, ease: 'power1.inOut' })
          .to('#scoopMid', { scaleY: 0.7, scaleX: 1.2, y: 15, duration: 1.2, ease: 'power1.inOut' }, '-=1')
          .to('#meltPool', { width: 200, opacity: 1, duration: 1.5, ease: 'power2.out' }, '-=0.5');

        // Color drips fall
        const colors = ['#EC4899','#3B82F6','#F9A8D4','#93C5FD','#FACC15'];
        for (let i = 0; i < 20; i++) {
            const d = document.createElement('div');
            d.className = 'drip-drop';
            d.style.cssText = `background:${colors[i%5]};height:${10+Math.random()*20}px;left:${30+Math.random()*40}%;top:40%;opacity:0.8;`;
            scene.appendChild(d);
            gsap.to(d, { y: window.innerHeight * 0.4, opacity: 0, duration: 1 + Math.random(), delay: 0.5 + Math.random() * 1, ease: 'power2.in', onComplete: () => d.remove() });
        }

        tl.to('#coneWrap', { opacity: 0, duration: 0.8, delay: 2.5 })
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, ease: 'power2.out' });
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
