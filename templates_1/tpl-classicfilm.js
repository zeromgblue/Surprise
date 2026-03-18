export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#000"; // Pitch black cinema
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Playfair+Display:ital@0;1&display=swap');
            
            .cinema-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #000;
            }

            /* Old film dust and noise overlay */
            .film-noise {
                position: absolute; inset: 0; pointer-events: none; z-index: 50;
                background-image: url('https://www.transparenttextures.com/patterns/dust.png');
                opacity: 0.5; animation: flickerNoise 0.1s infinite alternate;
            }
            .film-line {
                position: absolute; top: 0; bottom: 0; width: 2px; background: rgba(0,0,0,0.5);
                left: 30%; z-index: 51; pointer-events: none; animation: moveLine 8s linear infinite;
            }

            @keyframes flickerNoise { 0% { opacity: 0.4; } 100% { opacity: 0.6; } }
            @keyframes moveLine { 0% { left: 10%; opacity: 0; } 10% { opacity: 0.5; } 90% { opacity: 0.5; } 100% { left: 90%; opacity: 0; } }

            /* Countdown */
            .countdown-circle {
                position: relative; width: 300px; height: 300px; border-radius: 50%;
                border: 4px solid #FFF; display: flex; align-items: center; justify-content: center;
                font-family: 'Courier Prime', monospace; font-size: 15rem; color: #FFF;
                z-index: 10; font-weight: bold; background: #000;
            }
            .countdown-circle::before {
                content: ''; position: absolute; width: 2px; height: 100%; background: #FFF; animation: spinCross 1s linear infinite;
            }
            .countdown-circle::after {
                content: ''; position: absolute; width: 100%; height: 2px; background: #FFF; animation: spinCross 1s linear infinite reverse;
            }

            @keyframes spinCross { 100% { transform: rotate(360deg); } }

            /* The Movie Title Card */
            .title-card {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; opacity: 0; pointer-events: none;
                z-index: 20; padding: 40px; text-align: center;
                background: radial-gradient(circle, #222 0%, #000 100%);
            }

            .m-head { font-family: 'Playfair Display', serif; font-size: 3rem; color: #E2E8F0; text-transform: uppercase; letter-spacing: 5px; margin-bottom: 30px;}
            .m-body { font-family: 'Courier Prime', monospace; font-size: 1.5rem; color: #A0AEC0; line-height: 1.8; max-width: 800px; }
            .m-foot { font-family: 'Playfair Display', serif; font-style: italic; font-size: 1.2rem; color: #718096; margin-top: 50px; }

            .hint-layer {
                position: absolute; inset: 0; background: rgba(0,0,0,0.8); z-index: 100;
                display: flex; align-items: center; justify-content: center; cursor: pointer;
            }
            .hint-text { color: #FFF; font-family: 'Courier Prime', monospace; font-size: 2rem; animation: pulse 2s infinite; }
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

        </style>

        <div class="cinema-scene">
            <div class="film-noise"></div>
            <div class="film-line"></div>
            <div class="film-line" style="left:70%; animation-delay: -3s; width:1px;"></div>

            <div class="hint-layer" id="startLayer">
                <div class="hint-text">TAP TO PLAY</div>
            </div>

            <div class="countdown-circle" id="counter" style="display:none;">5</div>

            <div class="title-card" id="titleCard">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br><br>')}</div>
                <div class="m-foot">Directed by: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const startLayer = document.getElementById('startLayer');
    const counter = document.getElementById('counter');
    const titleCard = document.getElementById('titleCard');

    startLayer.addEventListener('click', () => {
        gsap.to(startLayer, { opacity: 0, duration: 0.5, onComplete: () => {
            startLayer.style.display = 'none';
            counter.style.display = 'flex';
            startCountdown();
        }});
    });

    function startCountdown() {
        let count = 5;
        
        const tl = gsap.timeline();
        
        // Loop countdown 5, 4, 3, 2, 1
        for(let i=0; i<5; i++) {
            tl.to(counter, { scale: 1.1, duration: 0.1, yoyo:true, repeat:1 })
              .to(counter, { opacity: 0, duration: 0.2 }, "+=0.6")
              .call(() => {
                  count--;
                  if(count > 0) {
                      counter.innerText = count;
                      counter.style.opacity = 1;
                  }
              });
        }

        // Show Title Card
        tl.call(() => {
            counter.style.display = 'none';
            
            // Pop sound simulation (visual flash)
            gsap.to('.cinema-scene', { backgroundColor: '#FFF', duration: 0.1, yoyo: true, repeat: 1 });
            
            // Fade in message
            gsap.to(titleCard, { opacity: 1, pointerEvents: 'auto', duration: 2, ease: "slow(0.7, 0.7, false)" });
        });
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
