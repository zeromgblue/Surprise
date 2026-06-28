export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1A0010;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Sarabun:wght@300;400&display=swap');
        .cake-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 80%,#3d0028,#1A0010);display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .cake-wrap{position:relative;cursor:pointer;z-index:10;}
        .cake-body{width:200px;height:140px;background:linear-gradient(180deg,#F9A8D4 0%,#EC4899 40%,#BE185D 100%);border-radius:10px 10px 4px 4px;position:relative;border:3px solid rgba(255,255,255,0.2);box-shadow:0 20px 40px rgba(0,0,0,0.5);}
        .frosting{position:absolute;top:-14px;left:-4px;width:208px;height:20px;background:#FDE68A;border-radius:50% 50% 0 0;border:2px solid rgba(255,255,255,0.3);}
        .frosting-drip{position:absolute;top:6px;width:14px;height:14px;background:#FDE68A;border-radius:0 0 50% 50%;}
        .candles{position:absolute;top:-60px;left:50%;transform:translateX(-50%);display:flex;gap:20px;}
        .candle{width:10px;height:50px;background:linear-gradient(180deg,#FBBF24,#F59E0B,#D97706);border-radius:5px;position:relative;}
        .flame{position:absolute;top:-12px;left:50%;transform:translateX(-50%);width:12px;height:18px;background:radial-gradient(ellipse at 50% 80%,#FFD700,#FF8C00,transparent);border-radius:50% 50% 30% 30%;animation:flicker 0.5s infinite;}
        @keyframes flicker{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(0.9,1.1) rotate(2deg)}}
        .knife{position:absolute;right:-60px;top:20px;width:50px;height:140px;display:flex;flex-direction:column;align-items:center;cursor:pointer;}
        .knife-blade{width:8px;flex:1;background:linear-gradient(90deg,#ccc,#888,#ccc);border-radius:0 0 4px 4px;position:relative;}
        .knife-blade::after{content:'';position:absolute;bottom:-10px;left:-4px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:12px solid #888;}
        .knife-handle{width:18px;height:40px;background:linear-gradient(90deg,#5C3317,#3D1F0A);border-radius:6px;}
        .hint-txt{font-family:'Sarabun',sans-serif;color:#F9A8D4;font-size:1rem;margin-top:25px;animation:pulse 1.5s infinite;}
        @keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}
        .light-ray{position:absolute;width:4px;background:linear-gradient(180deg,#FFD700,transparent);top:50%;transform-origin:top center;opacity:0;pointer-events:none;}
        .confetti-p{position:absolute;pointer-events:none;border-radius:50%;}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Dancing Script',cursive;font-size:4rem;color:#F9A8D4;text-shadow:0 0 30px rgba(249,168,212,0.6);margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.3rem;color:#FEF3C7;line-height:1.8;max-width:600px;}
        .m-from{font-family:'Dancing Script',cursive;font-size:1.5rem;color:#EC4899;margin-top:30px;}
    </style>
    <div class="cake-scene" id="scene">
        <div class="cake-wrap" id="cakeWrap">
            <div class="candles">
                <div class="candle"><div class="flame"></div></div>
                <div class="candle"><div class="flame" style="animation-delay:0.2s"></div></div>
                <div class="candle"><div class="flame" style="animation-delay:0.4s"></div></div>
            </div>
            <div class="cake-body">
                <div class="frosting">
                    <div class="frosting-drip" style="left:20px"></div>
                    <div class="frosting-drip" style="left:60px"></div>
                    <div class="frosting-drip" style="left:100px"></div>
                    <div class="frosting-drip" style="left:140px"></div>
                    <div class="frosting-drip" style="left:170px"></div>
                </div>
            </div>
            <div class="knife" id="knife">
                <div class="knife-handle"></div>
                <div class="knife-blade"></div>
            </div>
        </div>
        <div class="hint-txt" id="hint">🍰 แตะมีดเพื่อตัดเค้ก!</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">🎂 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">~ ${escapeHtml(data.sender)} ~</div>
        </div>
    </div>`;

    const knife = document.getElementById('knife');
    const scene = document.getElementById('scene');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    let cut = false;

    knife.addEventListener('click', () => {
        if (cut) return;
        cut = true;
        hint.style.display = 'none';
        const tl = gsap.timeline();
        tl.to(knife, { y: 60, duration: 0.4, ease: 'power2.in' })
          .to('.candles', { opacity: 0, duration: 0.3 }, 0)
          .to('#cakeWrap', { scaleX: 1.05, duration: 0.1, yoyo: true, repeat: 3 }, 0.3);

        // Light rays burst from cut
        for (let i = 0; i < 12; i++) {
            const ray = document.createElement('div');
            ray.className = 'light-ray';
            const angle = (i / 12) * 360;
            ray.style.cssText = `left:50%;top:50%;height:${150 + Math.random()*100}px;transform:rotate(${angle}deg);transform-origin:top center;`;
            scene.appendChild(ray);
            gsap.to(ray, { opacity: 0.8, duration: 0.3, delay: 0.5, onComplete: () => gsap.to(ray, { opacity: 0, y: 50, duration: 0.5, onComplete: () => ray.remove() }) });
        }

        // Confetti
        const cols = ['#F9A8D4','#FDE68A','#A7F3D0','#BFDBFE','#DDD6FE'];
        for (let i = 0; i < 50; i++) {
            const c = document.createElement('div');
            c.className = 'confetti-p';
            c.style.cssText = `width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;background:${cols[i%5]};left:50%;top:40%;`;
            scene.appendChild(c);
            gsap.to(c, { x:(Math.random()-.5)*window.innerWidth, y:-Math.random()*window.innerHeight*.8, rotation:Math.random()*720, opacity:0, duration:1.5+Math.random(), ease:'power2.out', delay:0.5, onComplete:()=>c.remove() });
        }

        tl.to('#cakeWrap', { y: 200, opacity: 0, duration: 0.8, delay: 0.8, ease: 'power2.in' })
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, ease: 'power2.out' });
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
