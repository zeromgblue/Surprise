export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#05001A"; // Deep night sky
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Wallpoet&family=Chakra+Petch:wght@400;600&display=swap');
            
            #meteor-canvas { position: absolute; inset:0; z-index:1; }

            .msg-layer {
                position: absolute; inset: 0; z-index: 10;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; padding: 30px; text-align: center;
                background: radial-gradient(circle, rgba(200,50,0,0.4) 0%, transparent 80%);
            }

            .m-head { font-family: 'Wallpoet', cursive; font-size: 3rem; color: #FFD700; text-shadow: 0 0 20px #FF4500, 0 5px 10px #000; margin-bottom: 20px; }
            .m-body { font-family: 'Chakra Petch', sans-serif; font-size: 1.3rem; color: #fff; line-height: 1.6; text-shadow: 1px 1px 3px #000; border: 2px solid #FF4500; background: rgba(0,0,0,0.6); padding: 20px; box-shadow: inset 0 0 20px rgba(255,69,0,0.5);}

            .hint-btn {
                position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%);
                padding: 15px 40px; background: transparent; border: 2px solid #FFD700;
                color: #FFD700; font-family: 'Wallpoet', cursive; font-size: 1.2rem;
                cursor: pointer; z-index: 20; box-shadow: 0 0 15px rgba(255,215,0,0.5), inset 0 0 10px rgba(255,215,0,0.5);
                transition: 0.3s;
            }
            .hint-btn:hover { background: rgba(255,215,0,0.2); transform: translateX(-50%) scale(1.05); }

            /* Fireball element we animate */
            .giant-meteor {
                position: absolute; width:100px; height:100px; border-radius:50%;
                background: #fff; filter: blur(5px);
                box-shadow: 0 0 50px 20px #ffea00, -50px -50px 100px 50px #ff3300, -100px -100px 150px 80px #000;
                top: -200px; right: -200px; opacity:0; z-index: 5; pointer-events:none;
            }
        </style>

        <canvas id="meteor-canvas"></canvas>
        <div class="giant-meteor" id="theMeteor"></div>
        
        <button class="hint-btn" id="triggerBtn">SUMMON IMPACT</button>

        <div class="msg-layer" id="msg">
            <div class="m-head">${escapeHtml(data.receiver)}</div>
            <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}
                <div style="font-size:0.9rem; color:#aaa; margin-top:15px;">— ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const canvas = document.getElementById('meteor-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Background Stars
    const stars = Array.from({length: 200}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        s: Math.random() * 2,
        a: Math.random()
    }));

    // Particle system for explosion
    const particles = [];

    function renderFrame() {
        ctx.fillStyle = 'rgba(5, 0, 26, 0.3)'; // Trail effect
        ctx.fillRect(0,0, canvas.width, canvas.height);

        // draw stars
        stars.forEach(s => {
            s.a += (Math.random()-0.5)*0.1;
            ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, s.a))})`;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI*2); ctx.fill();
        });

        // draw explosion particles
        for(let i=particles.length-1; i>=0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.1; // gravity
            p.life -= 0.02;
            p.s *= 0.95; // shrink

            if(p.life <= 0) { particles.splice(i,1); continue; }

            ctx.fillStyle = `rgba(${p.c.r}, ${p.c.g}, ${p.c.b}, ${p.life})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.s, 0, Math.PI*2);
            ctx.fill();
        }

        requestAnimationFrame(renderFrame);
    }
    requestAnimationFrame(renderFrame);

    const btn = document.getElementById('triggerBtn');
    const meteor = document.getElementById('theMeteor');
    const msg = document.getElementById('msg');
    let triggered = false;

    btn.addEventListener('click', () => {
        if(triggered) return;
        triggered = true;
        
        btn.style.display = 'none';

        // Animate Giant Meteor crashing from top right to center
        gsap.to(meteor, {
            opacity: 1, top: '50%', right: '50%', x:'50%', y:'-50%', 
            duration: 1.5, ease: "power2.in",
            onComplete: () => {
                // EXPLOSION!
                meteor.style.display = 'none'; // hide actual ball
                
                // Screen shake
                gsap.to('body', { x: 10, y: 10, duration: 0.05, yoyo: true, repeat: 10 });
                
                // Create particles
                const colors = [{r:255,g:200,b:0}, {r:255,g:50,b:0}, {r:255,g:255,b:255}, {r:200,g:0,b:0}];
                for(let i=0; i<150; i++) {
                    particles.push({
                        x: window.innerWidth/2,
                        y: window.innerHeight/2,
                        vx: (Math.random()-0.5)*30,
                        vy: (Math.random()-0.5)*30,
                        s: Math.random()*8+2,
                        life: 1 + Math.random(),
                        c: colors[Math.floor(Math.random()*colors.length)]
                    });
                }

                // White flash
                const flash = document.createElement('div');
                flash.style.cssText = "position:absolute; inset:0; background:#fff; z-index:50;";
                document.body.appendChild(flash);
                gsap.to(flash, { opacity:0, duration: 1, onComplete:()=>flash.remove() });

                // Reveal Message
                gsap.to(msg, { opacity: 1, scale: 1, delay: 0.5, duration: 1, pointerEvents:"auto", ease:"back.out(1.2)" });
                gsap.fromถึง('.m-head', { y:-50, opacity:0 }, {y:0, opacity:1, duration:1, delay:0.7});
            }
        });
    });
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
