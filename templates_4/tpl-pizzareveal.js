export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1A0800;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;700&display=swap');
        .pizza-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 80%,#3d1500,#1A0800);display:flex;flex-direction:column;align-items:center;justify-content:center;}
        .pizza-box{position:relative;width:240px;height:240px;cursor:pointer;z-index:10;}
        .box-base{position:absolute;bottom:0;width:240px;height:30px;background:#B8860B;border-radius:4px;box-shadow:0 10px 30px rgba(0,0,0,0.5);}
        .box-top{position:absolute;width:240px;height:240px;background:linear-gradient(135deg,#DAA520,#B8860B,#8B6914);border-radius:8px;border:3px solid #FFD700;display:flex;align-items:center;justify-content:center;font-size:5rem;box-shadow:0 5px 20px rgba(0,0,0,0.6);transform-origin:top center;transform-style:preserve-3d;}
        .box-logo{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Sarabun',sans-serif;font-size:0.9rem;color:rgba(255,255,255,0.7);letter-spacing:3px;text-align:center;line-height:1.5;}
        .steam{position:absolute;top:-20px;left:50%;transform:translateX(-50%);width:6px;height:0;background:linear-gradient(180deg,transparent,rgba(255,200,100,0.4));border-radius:3px;}
        .hint-txt{font-family:'Sarabun',sans-serif;color:#F59E0B;font-size:1rem;margin-top:20px;animation:pulse 1.5s infinite;}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Sarabun',sans-serif;font-size:3rem;font-weight:700;color:#F59E0B;text-shadow:0 0 30px rgba(245,158,11,0.5);margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.2rem;color:#FEF3C7;line-height:1.8;max-width:600px;}
        .m-from{font-family:'Sarabun',sans-serif;font-size:1rem;color:#D97706;margin-top:25px;letter-spacing:3px;}
        .heat-wave{position:absolute;width:100%;height:100%;pointer-events:none;top:0;left:0;opacity:0;}
    </style>
    <div class="pizza-scene" id="scene">
        <div class="pizza-box" id="pizzaBox">
            <div class="box-base"></div>
            <div class="box-top" id="boxTop">
                <div class="box-logo">🍕<br>PIZZA<br>SURPRISE</div>
            </div>
            <div class="steam" id="steam1" style="left:30%"></div>
            <div class="steam" id="steam2" style="left:50%"></div>
            <div class="steam" id="steam3" style="left:70%"></div>
        </div>
        <div class="hint-txt" id="hint">🍕 แตะกล่องเพื่อเปิด!</div>
        <div class="heat-wave" id="heatWave"></div>
        <div class="msg-panel" id="msg">
            <div class="m-to">🍕 ${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">— ${escapeHtml(data.sender)} —</div>
        </div>
    </div>`;

    // Steam animations
    gsap.to('#steam1', { height: 30, opacity: 0, duration: 1.5, yoyo: true, repeat: -1, ease: 'power1.out' });
    gsap.to('#steam2', { height: 40, opacity: 0, duration: 2, yoyo: true, repeat: -1, delay: 0.5, ease: 'power1.out' });
    gsap.to('#steam3', { height: 25, opacity: 0, duration: 1.2, yoyo: true, repeat: -1, delay: 1, ease: 'power1.out' });

    const boxTop = document.getElementById('boxTop');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const heatWave = document.getElementById('heatWave');
    let opened = false;

    document.getElementById('pizzaBox').addEventListener('click', () => {
        if (opened) return;
        opened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();
        tl.to(boxTop, { rotateX: -160, duration: 0.8, ease: 'power2.inOut' })
          .to(heatWave, { opacity: 1, duration: 0.3 }, '-=0.2')
          .to(heatWave, { opacity: 0, duration: 0.8, filter: 'blur(20px)' }, '+=0.2')
          .to('#pizzaBox', { y: 200, opacity: 0, duration: 0.7, ease: 'power2.in' }, '-=0.3')
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, ease: 'power2.out' });
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
