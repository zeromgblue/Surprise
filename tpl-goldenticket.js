export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#1a1205"; // Dark warm bg
    container.style.perspective = "1000px";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=Prompt:wght@400;600&display=swap');
            
            .ticket-container {
                width: 320px; height: 500px;
                position: relative; transition: transform 0.1s;
                transform-style: preserve-3d; cursor: pointer;
            }
            .ticket-container.flip { transform: rotateY(180deg); transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

            .ticket-face {
                position: absolute; inset: 0; backface-visibility: hidden;
                border-radius: 15px; box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                /* Gold Foil Effect */
                background: linear-gradient(135deg, #FFD700 0%, #DAA520 25%, #FFF8DC 50%, #B8860B 75%, #FFD700 100%);
                background-size: 200% 200%;
                animation: shimmer 5s infinite linear;
                border: 2px solid #555;
            }
            @keyframes shimmer { 0%{background-position:0% 0%;} 100%{background-position:200% 200%;} }

            /* Add some inner borders for classic ticket look */
            .ticket-face::before {
                content: ''; position: absolute; inset: 10px; border: 2px dashed rgba(0,0,0,0.3); border-radius: 10px;
            }

            .face-front { z-index: 2; transform: rotateY(0deg); }
            .face-back { 
                transform: rotateY(180deg); background: #eee; border: 2px solid #DAA520; 
                background-image: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
                animation: none;
            }
            .face-back::before { border: 2px solid #DAA520; } /* clean border for back */

            .title-front { font-family: 'Playfair Display', serif; font-size: 2.5rem; color: #fff; text-shadow: 1px 1px 2px #555, 0 0 10px rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 5px; text-align:center;}
            .star-icon { font-size: 3rem; color: white; text-shadow: 0 0 10px #B8860B; margin: 20px 0; }

            .msg-box { position: relative; z-index: 10; padding: 30px; text-align: center; color: #333; font-family: 'Prompt', sans-serif;}
            .b-to { font-size: 1.5rem; font-weight: 600; color: #B8860B; margin-bottom: 20px; }
            .b-msg { font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px; }
            .b-from { font-size: 0.9rem; color: #666; border-top: 1px solid #ccc; padding-top: 10px;}

            .hint {
                position: absolute; bottom: -50px; width: 100%; text-align: center;
                color: #DAA520; font-family: sans-serif; letter-spacing: 2px; font-size: 0.8rem;
                animation: floatUp 2s infinite alternate; pointer-events: none;
            }
            @keyframes floatUp { 0%{transform:translateY(0);} 100%{transform:translateY(-10px);} }

            #sparkle-canvas { position: absolute; inset:0; z-index: 0; pointer-events:none; }
        </style>

        <canvas id="sparkle-canvas"></canvas>

        <div class="ticket-container" id="ticket">
            <div class="ticket-face face-front">
                <div class="title-front">GOLDEN<br>TICKET</div>
                <div class="star-icon">★</div>
                <div style="font-family: sans-serif; letter-spacing: 4px; color: rgba(0,0,0,0.5); font-weight: bold;">ADMIT ONE</div>
            </div>
            
            <div class="ticket-face face-back">
                <div class="msg-box">
                    <div class="b-to">${escapeHtml(data.receiver)}</div>
                    <div class="b-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                    <div class="b-from">A gift from<br>${escapeHtml(data.sender)}</div>
                </div>
            </div>

            <div class="hint" id="hint">แตะเพื่อพลิก</div>
        </div>
    `;

    // Gyroscope / Mouse follow effect for the gold foil
    const ticket = document.getElementById('ticket');
    let flipped = false;

    window.addEventListener('mousemove', (e) => {
        if(flipped) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 30; // -15 to 15 deg
        const y = (e.clientY / window.innerHeight - 0.5) * -30;
        ticket.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
    });
    
    // Device orientation for mobile
    window.addEventListener("deviceorientation", (e) => {
        if(flipped) return;
        const x = Math.min(Math.max(e.gamma*0.5, -20), 20); // limits
        const y = Math.min(Math.max((e.beta-45)*0.5, -20), 20);
        ticket.style.transform = `rotateX(${-y}deg) rotateY(${x}deg)`;
    }, true);

    ticket.addEventListener('click', () => {
        if(flipped) return;
        flipped = true;
        document.getElementById('hint').style.display='none';
        
        // Remove mouse/gyro tilt inline style to let CSS class handle the flip beautifully
        ticket.style.transform = ''; 
        setTimeout(()=>{ ticket.classList.add('flip'); }, 50);

        // Boom sparkles
        emitSparkles();
    });

    const canvas = document.getElementById('sparkle-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    
    function emitSparkles() {
        let stars = [];
        for(let i=0; i<50; i++) {
            stars.push({
                x: canvas.width/2, y: canvas.height/2,
                vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20,
                s: Math.random()*4+2, a: 1, rot: Math.random()*Math.PI
            });
        }
        function draw() {
            ctx.clearRect(0,0,canvas.width,canvas.height);
            stars.forEach((s, idx) => {
                s.x += s.vx; s.y += s.vy; s.a -= 0.02; s.rot += 0.1;
                ctx.save();
                ctx.translate(s.x, s.y); ctx.rotate(s.rot);
                ctx.fillStyle = `rgba(255, 215, 0, ${s.a})`;
                ctx.fillRect(-s.s/2, -s.s/2, s.s, s.s);
                ctx.restore();
                if(s.a<=0) stars.splice(idx,1);
            });
            if(stars.length>0) requestAnimationFrame(draw);
        }
        draw();
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
