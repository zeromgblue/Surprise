export async function render(container, data, config) {
    container.style.cssText = "max-width:100%;padding:0;height:100vh;background:#1C0A00;";
    document.body.style.cssText = "margin:0;overflow:hidden;";
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700&family=Sarabun:wght@300;400&display=swap');
        .ramen-scene{position:relative;width:100vw;height:100vh;overflow:hidden;background:radial-gradient(ellipse at 50% 80%,#3d1800,#1C0A00);display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;}
        .bowl-wrap{position:relative;z-index:10;}
        .bowl{width:200px;height:100px;background:radial-gradient(ellipse,#4a2000,#2d1000);border-radius:0 0 100px 100px;border:3px solid #8B4513;box-shadow:0 15px 40px rgba(0,0,0,0.7),inset 0 -10px 20px rgba(0,0,0,0.5);position:relative;overflow:hidden;}
        .broth{position:absolute;inset:5px;bottom:0;background:radial-gradient(ellipse,#C06000,#8B3A00);border-radius:0 0 95px 95px;}
        .noodle-line{position:absolute;width:90%;height:3px;background:#F5DEB3;border-radius:2px;left:5%;}
        .toppings{position:absolute;top:10px;right:20px;width:30px;height:20px;background:#DC143C;border-radius:4px;opacity:0.9;}
        .egg{position:absolute;top:10px;left:30px;width:25px;height:25px;background:radial-gradient(circle at 40% 40%,#FFD700,#FFA500);border-radius:50%;}
        .steam-container{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);width:200px;height:150px;overflow:visible;}
        .steam-p{position:absolute;bottom:0;border-radius:50%;background:rgba(255,220,150,0.2);filter:blur(8px);opacity:0;}
        .hint-txt{font-family:'Noto Serif JP',serif;color:rgba(245,158,11,0.8);font-size:1rem;margin-top:25px;animation:pulse 1.5s infinite;letter-spacing:3px;}
        @keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
        .msg-panel{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;pointer-events:none;z-index:30;padding:40px;text-align:center;}
        .m-to{font-family:'Noto Serif JP',serif;font-size:3rem;color:#F59E0B;text-shadow:0 0 30px rgba(245,158,11,0.6);margin-bottom:20px;}
        .m-body{font-family:'Sarabun',sans-serif;font-size:1.3rem;color:#FEF3C7;line-height:1.8;max-width:600px;}
        .m-from{font-family:'Noto Serif JP',serif;font-size:1.1rem;color:#B45309;margin-top:30px;letter-spacing:4px;}
    </style>
    <div class="ramen-scene" id="scene">
        <div class="bowl-wrap">
            <div class="steam-container" id="steamCon">
                <div class="steam-p" id="st1" style="width:60px;height:60px;left:30px;"></div>
                <div class="steam-p" id="st2" style="width:40px;height:40px;left:80px;"></div>
                <div class="steam-p" id="st3" style="width:50px;height:50px;left:60px;"></div>
            </div>
            <div class="bowl" id="bowl">
                <div class="broth"></div>
                <div class="noodle-line" style="top:30px;"></div>
                <div class="noodle-line" style="top:50px;width:70%;left:15%;"></div>
                <div class="toppings"></div>
                <div class="egg"></div>
            </div>
        </div>
        <div class="hint-txt" id="hint">🍜 แตะชามราเม็งเพื่อดูข้อความ</div>
        <div class="msg-panel" id="msg">
            <div class="m-to">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g,'<br>')}</div>
            <div class="m-from">🍜 จาก ${escapeHtml(data.sender)}</div>
        </div>
    </div>`;

    // Steam animation
    const steamAnims = [
        { el: 'st1', x: -20, delay: 0 },
        { el: 'st2', x: 10, delay: 0.5 },
        { el: 'st3', x: -10, delay: 1 }
    ];
    steamAnims.forEach(s => {
        gsap.to(`#${s.el}`, { y: -120, x: s.x, opacity: 0, width: '+=20', height: '+=20', duration: 2.5, delay: s.delay, repeat: -1, ease: 'power1.out' });
    });

    const bowl = document.getElementById('bowl');
    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    let tapped = false;

    bowl.style.cursor = 'pointer';
    bowl.addEventListener('click', () => {
        if (tapped) return;
        tapped = true;
        hint.style.display = 'none';

        // Steam explodes upward spelling message
        const tl = gsap.timeline();
        tl.to('#steamCon .steam-p', { y: -300, x: (i) => (i - 1) * 80, opacity: 0.8, scale: 5, duration: 1.2, stagger: 0.1, ease: 'power2.out' })
          .to('.bowl-wrap', { y: 200, opacity: 0, duration: 0.8, ease: 'power2.in' }, '-=0.5')
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, ease: 'power2.out' }, '-=0.3');
    });
}
function escapeHtml(s){if(!s)return'';return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
