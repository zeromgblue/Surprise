export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0f172a"; // dark blueish gray
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');
            
            .oscar-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle at 50% 30%, #334155, #0f172a);
                perspective: 1200px;
            }

            /* Golden Spotlights */
            .spotlight {
                position: absolute; bottom: -20vh; width: 200vw; height: 150vh;
                background: conic-gradient(from 180deg at 50% 100%, transparent 150deg, rgba(250, 204, 21, 0.2) 175deg, rgba(253, 224, 71, 0.4) 180deg, rgba(250, 204, 21, 0.2) 185deg, transparent 210deg);
                transform-origin: 50% 100%; animation: sweep 8s ease-in-out infinite alternate; pointer-events: none;
            }
            .spotlight:nth-child(2) { animation-duration: 11s; animation-direction: alternate-reverse; }

            @keyframes sweep { 0% { transform: rotate(-30deg); } 100% { transform: rotate(30deg); } }

            /* Flying Envelope */
            .envelope-container {
                position: relative; width: 300px; height: 200px; cursor: pointer; z-index: 20;
                transform-style: preserve-3d; transition: transform 0.5s;
            }

            .envelope {
                position: absolute; inset: 0; background: linear-gradient(135deg, #FCD34D, #D97706);
                border-radius: 10px; box-shadow: 0 30px 60px rgba(0,0,0,0.6), inset 0 0 20px rgba(255,255,255,0.5);
                display: flex; align-items: center; justify-content: center; overflow: hidden;
            }
            .envelope::before {
                content: ''; position: absolute; top:0; left:0; right:0; height: 100px;
                background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
                clip-path: polygon(0 0, 100% 0, 50% 100%); z-index: 2;
            }
            .red-wax {
                position: absolute; width: 60px; height: 60px; background: radial-gradient(circle, #EF4444, #991B1B);
                border-radius: 50%; z-index: 3; box-shadow: 0 5px 10px rgba(0,0,0,0.4), inset 0 2px 5px rgba(255,255,255,0.4);
                display: flex; align-items: center; justify-content: center;
            }
            .red-wax::after {
                content: '♛'; color: #FCA5A5; font-size: 24px;
            }

            .hint-text {
                position: absolute; top: -60px; width: 100%; text-align: center;
                color: #FEF08A; font-family: 'Cinzel', serif; font-size: 1.2rem;
                letter-spacing: 3px; animation: pulse 2s infinite; pointer-events: none;
            }
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Result Card */
            .winner-card {
                position: absolute; inset: 0; z-index: 30; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; transform: scale(0.8) translateY(50px);
                background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(10px);
            }

            .m-award { font-family: 'Cinzel', serif; font-size: 1.5rem; color: #FCD34D; margin-bottom: 30px; letter-spacing: 5px; text-transform: uppercase; }
            .m-head { font-family: 'Playfair Display', serif; font-size: 4rem; color: #FFF; margin-bottom: 20px; font-weight: 700; text-shadow: 0 4px 20px rgba(252, 211, 77, 0.5); }
            .m-body { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.8rem; color: #CBD5E1; line-height: 1.6; max-width: 700px; }
            .m-foot { font-family: 'Cinzel', serif; font-size: 1rem; color: #94A3B8; margin-top: 50px; letter-spacing: 3px; }

            /* Confetti Canvas */
            #confetti { position: absolute; inset: 0; z-index: 25; pointer-events: none; }

        </style>

        <div class="oscar-scene">
            <div class="spotlight"></div>
            <div class="spotlight" style="left:-50vw;"></div>

            <canvas id="confetti"></canvas>

            <div class="envelope-container" id="envelopeBox">
                <div class="hint-text" id="hint">แตะเพื่อเปิดผลรางวัล</div>
                <div class="envelope">
                    <div class="red-wax" id="wax"></div>
                </div>
            </div>

            <div class="winner-card" id="msg">
                <div class="m-award">AND THE AWARD GOES TO...</div>
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                <div class="m-foot">PRESENTED BY: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const envBox = document.getElementById('envelopeBox');
    const wax = document.getElementById('wax');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');

    // Setup canvas
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize);
    resize();

    // Floating envelope
    gsap.to(envBox, { y: -20, rotationZ: 2, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let opened = false;

    envBox.addEventListener('click', () => {
        if(opened) return;
        opened = true;
        hint.style.display = 'none';

        gsap.killTweensOf(envBox);

        const tl = gsap.timeline();

        // 1. Break Seal
        tl.to(wax, { scale: 1.5, opacity: 0, duration: 0.3 })
          // 2. Open flap & move envelope down
          .to(envBox, { rotationX: -180, y: 300, opacity: 0, duration: 1, ease: "power2.in" })
          // 3. And the award goes to... popup
          .to(msg, { y: 0, scale: 1, opacity: 1, pointerEvents: 'auto', duration: 1.5, ease: "expo.out" }, "-=0.2")
          // 4. Boom golden confetti
          .call(fireConfetti, null, "-=1");
    });

    // Simple golden confetti system
    let particles = [];
    function fireConfetti() {
        for(let i=0; i<150; i++) {
            particles.push({
                x: canvas.width / 2, y: canvas.height,
                vx: (Math.random() - 0.5) * 20, vy: (Math.random() * -20) - 10,
                size: Math.random() * 8 + 4,
                color: Math.random() > 0.5 ? '#FCD34D' : '#F59E0B',
                rot: Math.random() * Math.PI,
                vrot: (Math.random() - 0.5) * 0.2
            });
        }
        requestAnimationFrame(renderConfetti);
    }

    function renderConfetti() {
        ctx.clearRect(0,0, canvas.width, canvas.height);
        let active = false;
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.5; // gravity
            p.rot += p.vrot;
            if(p.y < canvas.height + 20) active = true;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*1.5); // rectangular confetti
            ctx.restore();
        });
        if(active) requestAnimationFrame(renderConfetti);
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
