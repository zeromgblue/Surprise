export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#19151A";
    container.style.perspective = "1200px";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const c1 = config.from || '#E5989B';
    const c2 = config.to || '#6D6875';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Krub:wght@400;500&display=swap');
            
            #magic-stars { position: absolute; inset:0; z-index: 1; pointer-events:none; }

            .postcard {
                position: relative; width: 350px; height: 230px;
                transform-style: preserve-3d; z-index: 10;
                /* Starts tilted back heavily */
                transform: rotateX(60deg) rotateZ(-30deg) translateZ(-500px);
                opacity: 0;
            }

            .pc-face {
                position: absolute; inset: 0; backface-visibility: hidden;
                background: #fdfdfd; box-shadow: 0 30px 60px rgba(0,0,0,0.8);
                border: 1px solid #ddd;
                /* Paper texture */
                background-image: 
                    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
                background-size: 20px 20px;
            }

            .pc-front { 
                z-index: 2; transform: rotateY(0deg); 
                /* Picture side */
                background: url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80') center/cover;
                display:flex; align-items:flex-end; padding: 20px; color:white;
                text-shadow: 0 2px 10px rgba(0,0,0,0.8);
            }
            .pc-front-title { font-family: 'Dancing Script', cursive; font-size: 2rem; font-weight: bold; }

            .pc-back {
                transform: rotateY(180deg); display: flex;
            }

            .pc-left {
                width: 50%; height: 100%; border-right: 2px solid ${c2};
                padding: 15px; box-sizing: border-box; display: flex; flex-direction: column;
            }
            .pc-msg { font-family: 'Krub', sans-serif; font-size: 0.95rem; line-height: 1.5; color: #333; flex-grow:1;}
            .pc-sender { font-family: 'Dancing Script', cursive; font-size: 1.5rem; color: ${c1}; text-align:right;}

            .pc-right {
                width: 50%; height: 100%; padding: 15px; box-sizing: border-box; position: relative;
            }
            /* Mailing lines */
            .m-line { width: 100%; height: 2px; background: rgba(0,0,0,0.1); margin-top: 30px; }
            .m-address { font-family: 'Krub', sans-serif; font-size: 1.2rem; margin-top: -25px; color:#222; font-weight: 500;}

            /* Holographic magical stamp */
            .stamp {
                position: absolute; top: 15px; right: 15px; width: 45px; height: 55px;
                background: radial-gradient(circle at top left, ${c1}, ${c2});
                border: 2px dashed #eee; box-shadow: 2px 2px 5px rgba(0,0,0,0.2);
                display:flex; align-items:center; justify-content:center;
                color:white; font-size:1.5rem; cursor: pointer;
                /* Magical glow */
                animation: stampGlow 2s infinite alternate;
            }
            @keyframes stampGlow { 0%{box-shadow: 0 0 5px ${c1};} 100%{box-shadow: 0 0 20px ${c2}; transform: scale(1.05);} }

            .hint-layer {
                position: absolute; bottom: 10%; width: 100%; text-align: center;
                color: #fff; font-family: sans-serif; letter-spacing: 2px;
                opacity: 0; pointer-events: none; z-index: 20; text-transform: uppercase;
                text-shadow: 0 0 10px rgba(0,0,0,0.8);
            }
        </style>

        <canvas id="magic-stars"></canvas>

        <div class="postcard" id="postcard">
            <div class="pc-face pc-front">
                <div class="pc-front-title">Greetings!</div>
            </div>
            
            <div class="pc-face pc-back">
                <div class="pc-left">
                    <div class="pc-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                    <div class="pc-sender">${escapeHtml(data.sender)}</div>
                </div>
                <div class="pc-right">
                    <div class="stamp" id="stamp">★</div>
                    <div class="m-line"></div>
                    <div class="m-address">ถึง: ${escapeHtml(data.receiver)}</div>
                    <div class="m-line"></div>
                    <div class="m-line"></div>
                </div>
            </div>
        </div>

        <div class="hint-layer" id="hint">แตะที่แสตมป์เรืองแสง</div>
    `;

    // 1. Entrance Animation: Postcard flies in from deep void
    const tl = gsap.timeline();
    tl.to('#postcard', {
        opacity: 1, z: 0, rotationX: 10, rotationZ: -5,
        duration: 2, ease: "power3.out"
    })
    // 2. Flip halfway to see the back immediately? Let's just flip it as part of entrance
    .to('#postcard', { rotationY: 180, duration: 1.5, ease: "back.out(1.2)" }, "-=0.5")
    .to('#hint', { opacity: 1, duration: 1, ease: "none" });

    // 3. Stamp Interaction
    const stamp = document.getElementById('stamp');
    const postcard = document.getElementById('postcard');
    const hint = document.getElementById('hint');
    let activated = false;

    stamp.addEventListener('click', () => {
        if(activated) return;
        activated = true;

        hint.style.display = 'none';
        
        // Remove animation to apply manual GSAP transforms smoothly
        stamp.style.animation = 'none';

        // Stamp flies off the card towards viewer, glowing extremely bright
        const cardRect = postcard.getBoundingClientRect();
        
        gsap.to(stamp, {
            x: -cardRect.width, y: -200, scale: 3, rotation: 360,
            boxShadow: `0 0 100px 20px ${config.to || '#fff'}`,
            duration: 1.5, ease: "power2.in"
        });

        // The card glows and floats
        gsap.to(postcard, {
            boxShadow: `0 0 50px ${c1}`,
            y: -20, rotationZ: 0,
            duration: 2, ease: "sine.inOut", repeat: -1, yoyo: true
        });

        // Canvas Star Shower Activation
        isRaining = true;
    });

    // Background Canvas
    const canvas = document.getElementById('magic-stars');
    const ctx = canvas.getContext('2d');
    let w, h;
    function rsz() { w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; }
    window.addEventListener('resize', rsz); rsz();

    let stars = [];
    for(let i=0; i<50; i++) stars.push({x:Math.random()*w, y:Math.random()*h, r:Math.random()*2, a:Math.random()});
    let isRaining = false;
    let shootingStars = [];

    function renderStars() {
        ctx.clearRect(0,0,w,h);
        
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        stars.forEach(s => {
            s.a += (Math.random()-0.5)*0.1;
            if(s.a < 0) s.a = 0; if(s.a > 1) s.a = 1;
            ctx.globalAlpha = s.a;
            ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2); ctx.fill();
        });

        if (isRaining) {
            // Add colorful trails falling
            if(Math.random() > 0.5) {
                shootingStars.push({
                    x: Math.random()*w, y: -50,
                    vx: (Math.random()-0.5)*5, vy: 10+Math.random()*15,
                    c: Math.random() > 0.5 ? c1 : c2, s: Math.random()*4+2
                });
            }

            shootingStars.forEach((st, idx) => {
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.moveถึง(st.x, st.y);
                ctx.lineถึง(st.x - st.vx*5, st.y - st.vy*5); // tail
                ctx.strokeStyle = st.c; ctx.lineWidth = st.s;
                ctx.lineCap = "round";
                ctx.shadowColor = st.c; ctx.shadowBlur = 10;
                ctx.stroke(); ctx.shadowBlur = 0;

                st.x += st.vx; st.y += st.vy;
                if(st.y > h + 100) shootingStars.splice(idx, 1);
            });
        }

        requestAnimationFrame(renderStars);
    }
    renderStars();
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
