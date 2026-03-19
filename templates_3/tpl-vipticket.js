export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#1A202C"; // Dark elegant
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Montserrat:wght@400;600&display=swap');
            
            .ticket-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #2D3748, #1A202C);
                perspective: 1500px;
            }

            .hint { position: absolute; top: 15vh; color: #D6BCFA; font-family: 'Montserrat', sans-serif; font-size: 1.5rem; letter-spacing: 2px; z-index: 20; animation: pulse 2s infinite;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* 3D Ticket */
            .ticket-wrapper {
                position: relative; width: 600px; height: 300px;
                transform-style: preserve-3d; transition: transform 0.5s; cursor: pointer;
                z-index: 10;
            }

            .ticket {
                position: absolute; width: 100%; height: 100%;
                background: linear-gradient(135deg, #ECC94B, #D69E2E);
                border-radius: 10px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                display: flex; overflow: hidden;
                border: 4px solid #F6E05E;
            }
            .ticket::before, .ticket::after {
                content: ''; position: absolute; top: 50%; transform: translateY(-50%);
                width: 40px; height: 40px; background: #2D3748; border-radius: 50%;
                box-shadow: inset 0 5px 10px rgba(0,0,0,0.5);
            }
            .ticket::before { left: -20px; }
            .ticket::after { right: -20px; }

            .ticket-left { flex: 3; padding: 30px; border-right: 4px dashed #B7791F; display: flex; flex-direction: column; justify-content: center; }
            .ticket-right { flex: 1; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }

            .t-title { font-family: 'Cinzel', serif; font-size: 2.5rem; color: #4A5568; margin-bottom: 10px; text-transform: uppercase; }
            .t-sub { font-family: 'Montserrat', sans-serif; font-size: 1rem; color: #744210; font-weight: 600; text-transform: uppercase;}
            .t-barcode { font-family: 'Courier Prime', monospace; font-size: 2rem; color: #4A5568; letter-spacing: -2px; margin-top: 20px; transform: scaleY(2);}
            .t-admit { font-family: 'Cinzel', serif; font-size: 1.5rem; color: #4A5568; margin-bottom: 20px;}

            /* Holographic Reveal */
            .holo-msg {
                position: absolute; inset: 0; z-index: 30; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: rgba(45, 55, 72, 0.95); backdrop-filter: blur(10px);
            }

            .m-head { font-family: 'Cinzel', serif; font-size: 3rem; color: #F6E05E; margin-bottom: 20px; text-shadow: 0 0 15px #D69E2E;}
            .m-body { font-family: 'Montserrat', sans-serif; font-size: 1.5rem; color: #E2E8F0; line-height: 1.8; max-width: 800px; }
            .m-foot { font-family: 'Montserrat', sans-serif; font-size: 1rem; color: #A0AEC0; margin-top: 40px; text-transform:uppercase; letter-spacing:3px;}

            @media(max-width: 600px) {
                .ticket-wrapper { transform: scale(0.6) rotate(90deg); }
                .ticket-wrapper:hover { transform: scale(0.65) rotate(90deg); }
            }

        </style>

        <div class="ticket-scene">
            <div class="hint" id="hint">TEAR THE TICKET</div>

            <div class="ticket-wrapper" id="ticketBlock">
                <div class="ticket">
                    <div class="ticket-left">
                        <div class="t-title">VIP PREMIERE</div>
                        <div class="t-sub">STARRING: ${escapeHtml(data.receiver)}</div>
                        <div class="t-barcode">||||||| | ||| |||| | ||</div>
                    </div>
                    <div class="ticket-right" id="tearArea">
                        <div class="t-admit">ADMIT<br>ONE</div>
                        <div class="t-sub">ROW: A <br> SEAT: 1</div>
                    </div>
                </div>
            </div>

            <div class="holo-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-foot">EXECUTIVE PRODUCER: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const ticketBlock = document.getElementById('ticketBlock');
    const tearArea = document.getElementById('tearArea');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    // Float effect
    gsap.to(ticketBlock, { y: -20, rotationX: 10, rotationY: -10, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isTorn = false;

    ticketBlock.addEventListener('click', () => {
        if(isTorn) return;
        isTorn = true;
        hint.style.display = 'none';

        gsap.killTweensOf(ticketBlock);

        const tl = gsap.timeline();

        // 1. Zoom in
        tl.to(ticketBlock, { scale: 1.2, rotationX: 0, rotationY: 0, duration: 0.5, ease: "power2.out" })
          
        // 2. Tear ticket (slide right part down and fade)
          .to(tearArea, { y: 200, rotation: 20, opacity: 0, duration: 0.8, ease: "power2.in" })
          
        // 3. Left part fades to gold light
          .to('.ticket-left', { background: '#FFF', opacity: 0, scale: 1.5, duration: 0.8 }, "-=0.2")
          
        // 4. Message appears majestically
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 1.5, ease: "power2.out" }, "-=0.4");
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
