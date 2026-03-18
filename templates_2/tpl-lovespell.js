export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#08001F"; // Dark magic theme
    container.style.backgroundImage = "radial-gradient(circle at center, #1b004a 0%, #08001F 100%)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const color1 = config.from || '#B100E8';
    const color2 = config.to || '#00E8FC';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Noto+Serif+Thai:wght@300;600&display=swap');
            
            #magic-circle {
                width: 300px; height: 300px; position: relative;
                border-radius: 50%; z-index: 10;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; transition: transform 0.5s;
            }
            .rune-ring {
                position: absolute; inset: 0; border: 2px solid rgba(255,255,255,0.1); border-radius: 50%;
                animation: spin 20s linear infinite; pointer-events: none;
            }
            .rune-ring.inner { inset: 30px; animation: spin-reverse 15s linear infinite; }
            .rune-ring.core { inset: 80px; border: none; background: rgba(177, 0, 232, 0.1); filter: blur(10px); }
            
            .rune {
                position: absolute; color: rgba(255,255,255,0.3); font-family: sans-serif; font-size: 1.5rem;
                text-shadow: 0 0 10px ${color1}; transition: color 0.3s, text-shadow 0.3s;
            }

            @keyframes spin { 100% { transform: rotate(360deg); } }
            @keyframes spin-reverse { 100% { transform: rotate(-360deg); } }

            .hint-layer { position: absolute; bottom: 15%; width: 100%; text-align: center; color: #fff; font-family: sans-serif; letter-spacing: 2px; }

            .msg-overlay {
                position: absolute; inset:0; z-index: 20;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; transform: scale(0.9); pointer-events: none;
                padding: 40px; text-align: center; color: white;
            }
            .m-head { font-family: 'Cinzel Decorative', cursive; font-size: 2.5rem; color: ${color2}; margin-bottom: 20px; text-shadow: 0 0 20px ${color1}; }
            .m-body { font-family: 'Noto Serif Thai', serif; font-size: 1.2rem; line-height: 1.8; color: #f0f0f0; }
        </style>

        <div id="magic-circle">
            <div class="rune-ring core"></div>
            <div class="rune-ring inner" id="ring1"></div>
            <div class="rune-ring" id="ring2"></div>
        </div>

        <div class="hint-layer" id="hint">HOLD THE CORE TO CAST</div>

        <div class="msg-overlay" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div class="m-body" style="opacity: 0.6; font-size: 0.9rem; margin-top:20px;">~ ${escapeHtml(data.sender)} ~</div>
        </div>
    `;

    // Generate Runes
    const symbols = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ'];
    const ring2 = document.getElementById('ring2');
    for(let i=0; i<12; i++) {
        const r = document.createElement('div');
        r.className = 'rune'; r.innerText = symbols[Math.floor(Math.random()*symbols.length)];
        const angle = (i/12) * Math.PI * 2;
        r.style.left = `calc(50% + ${Math.cos(angle)*140}px - 10px)`;
        r.style.top = `calc(50% + ${Math.sin(angle)*140}px - 15px)`;
        r.style.transform = `rotate(${angle + Math.PI/2}rad)`;
        ring2.appendChild(r);
    }
    const ring1 = document.getElementById('ring1');
    for(let i=0; i<8; i++) {
        const r = document.createElement('div');
        r.className = 'rune'; r.innerText = symbols[Math.floor(Math.random()*symbols.length)];
        const angle = (i/8) * Math.PI * 2;
        r.style.left = `calc(50% + ${Math.cos(angle)*110}px - 10px)`;
        r.style.top = `calc(50% + ${Math.sin(angle)*110}px - 15px)`;
        r.style.transform = `rotate(${angle + Math.PI/2}rad)`;
        ring1.appendChild(r);
    }

    const circle = document.getElementById('magic-circle');
    let timer, isCasting = false, casted = false;

    function startCast(e){
        if(casted) return;
        e.preventDefault();
        isCasting = true;
        document.getElementById('hint').style.opacity = 0;
        
        // Power up animation
        gsap.to('.rune', { color: '#fff', textShadow: `0 0 20px ${color2}, 0 0 40px ${color1}`, duration: 2 });
        gsap.to('.rune-ring', { borderColor: `rgba(255,255,255,0.8)`, boxShadow: `0 0 30px ${color1}, inset 0 0 30px ${color2}`, duration: 2 });
        gsap.to(circle, { scale: 1.2, duration: 2 });

        timer = setTimeout(() => { explode(); }, 2000);
    }

    function cancelCast(){
        if(casted) return;
        isCasting = false;
        clearTimeout(timer);
        document.getElementById('hint').style.opacity = 1;

        gsap.to('.rune', { color: 'rgba(255,255,255,0.3)', textShadow: `0 0 10px ${color1}`, duration: 0.5 });
        gsap.to('.rune-ring', { borderColor: `rgba(255,255,255,0.1)`, boxShadow: 'none', duration: 0.5 });
        gsap.to(circle, { scale: 1, duration: 0.5 });
    }

    function explode() {
        casted = true;
        // Big flash
        const flash = document.createElement('div');
        flash.style.cssText = `position:absolute;inset:0;background:${color1};z-index:30;mix-blend-mode:screen;`;
        container.appendChild(flash);

        gsap.to(circle, { scale: 3, opacity: 0, rotation: 720, duration: 1 });
        gsap.to(flash, { opacity: 0, duration: 1.5, onComplete: () => { flash.remove(); circle.remove(); }});

        // Show Msg
        const msg = document.getElementById('msg');
        gsap.to(msg, { scale: 1, opacity: 1, duration: 2, delay: 0.5, ease: "power3.out", onComplete: () => msg.style.pointerEvents = 'auto' });
    }

    circle.addEventListener('mousedown', startCast);
    window.addEventListener('mouseup', cancelCast);
    circle.addEventListener('touchstart', startCast, {passive:false});
    window.addEventListener('touchend', cancelCast);
}

function escapeHtml(str) {
    if(!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const s = document.createElement('script');
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
    });
}
