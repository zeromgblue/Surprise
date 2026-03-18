export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#2B6CB0"; // Clear sky blue
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700&display=swap');
            
            .balloon-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                background: linear-gradient(to bottom, #4299E1, #90CDF4, #F7FAFC);
                overflow: hidden;
            }

            /* Sun and clouds */
            .sun { position: absolute; top: 10%; right: 10%; width: 100px; height: 100px; background: #F6E05E; border-radius: 50%; box-shadow: 0 0 50px #FAF089; }
            .cloud { position: absolute; background: #FFF; border-radius: 50px; opacity: 0.8; animation: moveCloud linear infinite; }
            .c1 { top: 20%; width: 150px; height: 50px; left: -150px; animation-duration: 30s; }
            .c2 { top: 40%; width: 200px; height: 60px; right: -200px; animation-duration: 45s; animation-direction: reverse; }
            @keyframes moveCloud { to { transform: translateX(120vw); } }

            /* Dart (Cursor or finger) */
            .hint-text { position: absolute; top: 15vh; font-family: 'Fredoka One', cursive; color: #2B6CB0; font-size: 2rem; text-shadow: 0 0 10px #FFF; z-index: 20; text-align: center; width: 100%; pointer-events:none;}

            /* Balloons area */
            .balloons-container {
                position: relative; width: 100%; height: 60%;
                display: flex; justify-content: center; align-items: flex-end; gap: 20px;
                padding-bottom: 50px; z-index: 10;
            }

            .balloon {
                width: 80px; height: 100px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                background: radial-gradient(circle at 30% 30%, #FFF, currentColor);
                position: relative; cursor: crosshair; display: flex; align-items: center; justify-content: center;
                box-shadow: inset -5px -5px 10px rgba(0,0,0,0.2); animation: float 3s ease-in-out infinite alternate;
            }
            .balloon::after {
                content: ''; position: absolute; bottom: -10px; left: 50%; transform: translateX(-50%);
                width: 2px; height: 50px; background: rgba(0,0,0,0.2); z-index:-1;
            }
            .balloon:active { transform: scale(0.9); }
            @keyframes float { 100% {transform: translateY(-20px);} }

            /* Colors */
            .b-red { color: #F56565; animation-delay: 0s; }
            .b-yellow { color: #ED8936; animation-delay: 0.5s; }
            .b-green { color: #48BB78; animation-delay: 1s; width: 100px; height: 120px; } /* The big target */
            .b-purple { color: #9F7AEA; animation-delay: 1.5s; }
            .b-pink { color: #ED64A6; animation-delay: 2s; }

            /* Message revealed */
            .confetti-msg {
                position: absolute; inset: 0; z-index: 30; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: rgba(255,255,255,0.9); backdrop-filter: blur(5px);
            }

            .m-head { font-family: 'Fredoka One', cursive; font-size: 3rem; color: #E53E3E; margin-bottom: 20px;}
            .m-body { font-family: 'Nunito', sans-serif; font-size: 1.5rem; color: #2D3748; line-height: 1.6; font-weight: 700; max-width:600px; }
            
        </style>

        <div class="balloon-scene">
            <div class="sun"></div>
            <div class="cloud c1"></div>
            <div class="cloud c2"></div>
            
            <div class="hint-text" id="hint">จิ้มลูกโป่งสีเขียว!</div>

            <div class="balloons-container" id="container">
                <div class="balloon b-red" onclick="popWrong(this)"></div>
                <div class="balloon b-purple" onclick="popWrong(this)"></div>
                <div class="balloon b-green" id="targetBln" onclick="popTarget(this)"></div>
                <div class="balloon b-yellow" onclick="popWrong(this)"></div>
                <div class="balloon b-pink" onclick="popWrong(this)"></div>
            </div>

            <div class="confetti-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="font-size:1.2rem; margin-top:40px; color:#4299E1;">ส่งความรักโดย: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const targetBln = document.getElementById('targetBln');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    let won = false;

    window.popWrong = function(el) {
        if(won) return;
        // Simple pop effect
        gsap.to(el, { scale: 1.5, opacity: 0, duration: 0.1, onComplete: () => el.style.display='none' });
        // Generate tiny particles
        createParticles(el.getBoundingClientRect(), '#FFF');
    }

    window.popTarget = function(el) {
        if(won) return;
        won = true;
        
        // Massive pop
        gsap.to(el, { scale: 3, opacity: 0, duration: 0.2, onComplete: () => el.style.display='none' });
        createParticles(el.getBoundingClientRect(), '#48BB78', 100);

        hint.style.display = 'none';

        // Drop confetti from top screen
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 50 };

        function randomInRange(min, max) { return Math.random() * (max - min) + min; }

        setTimeout(() => {
            // Load canvas-confetti via script dynamically to fire confetti if network allows
            // Fallback: Just show message
            gsap.to(msg, { opacity: 1, pointerEvents:'auto', duration: 1, ease:"power2.out" });
        }, 500);
    }

    function createParticles(rect, color, count=20) {
        const cx = rect.left + rect.width/2;
        const cy = rect.top + rect.height/2;
        
        for(let i=0; i<count; i++){
            let p = document.createElement('div');
            p.style.cssText = `position:absolute; width:10px; height:10px; border-radius:50%; background:${color}; top:${cy}px; left:${cx}px; z-index:20;`;
            document.querySelector('.balloon-scene').appendChild(p);
            
            gsap.to(p, {
                x: (Math.random()-0.5)*200, y: (Math.random()-0.5)*200 + 50,
                opacity: 0, duration: 1, ease: 'power2.out',
                onComplete: () => p.remove()
            });
        }
    }
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
