export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0B0515"; // Deep mystical dark purple
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Great+Vibes&display=swap');
            
            .tarot-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; perspective: 1200px;
            }

            /* Mystic table background */
            .table-cloth {
                position: absolute; inset: 0;
                background: url('https://www.transparenttextures.com/patterns/dark-matter.png'), radial-gradient(circle, #2A1B3D 0%, #0B0515 80%);
                opacity: 0.8; z-index: 1; pointer-events: none;
            }

            /* The Card */
            .card-wrapper {
                position: relative; width: 320px; height: 500px;
                transform-style: preserve-3d; transition: transform 0.5s; cursor: pointer;
                z-index: 10;
            }
            
            .card-face {
                position: absolute; width: 100%; height: 100%;
                backface-visibility: hidden; border-radius: 16px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                border: 12px solid #D4AF37; box-sizing: border-box;
            }

            /* Card Back (Faced down initially) */
            .card-back {
                background: url('https://www.transparenttextures.com/patterns/stardust.png'), linear-gradient(135deg, #1A0B2E, #000);
            }
            .card-back::before {
                content: ''; position: absolute; inset: 10px;
                border: 2px dashed #D4AF37; border-radius: 8px;
            }
            .card-decor { font-size: 6rem; color: #D4AF37; filter: drop-shadow(0 0 15px rgba(212,175,55,0.6)); }

            /* Card Front (The message) */
            .card-front {
                background: url('https://www.transparenttextures.com/patterns/cream-paper.png'), #FDFBF7;
                transform: rotateY(180deg); padding: 30px; text-align: center;
            }
            .card-front::before {
                content: ''; position: absolute; inset: 8px;
                border: 1px solid #D4AF37; border-radius: 6px; pointer-events:none;
            }

            .hint { position: absolute; bottom: 8vh; font-family: 'Cinzel Decorative', serif; color: #D4AF37; letter-spacing: 2px; text-shadow: 0 0 10px #000; z-index: 20; pointer-events: none; animation: pulse 2s infinite; }
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            .m-head { font-family: 'Cinzel Decorative', serif; font-size: 1.8rem; color: #4A0E4E; margin-bottom: 20px; text-transform: uppercase;}
            .m-body { font-family: 'Great Vibes', cursive; font-size: 2.2rem; color: #222; line-height: 1.4; }
            .m-foot { font-family: 'Cinzel Decorative', serif; font-size: 1rem; color: #888; margin-top: 30px; }
            
        </style>

        <div class="tarot-scene">
            <div class="table-cloth"></div>
            
            <div class="hint" id="hint">เปิดดูโชคชะตา</div>

            <div class="card-wrapper" id="tarot">
                <div class="card-face card-back">
                    <span class="material-symbols-rounded card-decor">wb_twilight</span>
                </div>
                
                <div class="card-face card-front" id="cardFront">
                    <div class="m-head">โชคชะตา</div>
                    <div class="m-head" style="font-size:1.2rem; color:#888; margin-top:-15px;">— ${escapeHtml(data.receiver)} —</div>
                    <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                    <div class="m-foot">ทำนายโดย: ${escapeHtml(data.sender)}</div>
                </div>
            </div>
        </div>
    `;

    const tarot = document.getElementById('tarot');
    const hint = document.getElementById('hint');
    const bg = document.querySelector('.table-cloth');
    let flipped = false;

    // Hover floating effect
    gsap.to(tarot, { y: -15, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    tarot.addEventListener('click', () => {
        if(flipped) return;
        flipped = true;
        hint.style.display = 'none';

        gsap.killTweensOf(tarot);

        const tl = gsap.timeline();

        // 1. Lift the card up and add glow to background
        tl.to(tarot, { y: -50, scale: 1.1, duration: 0.5, ease: "power2.out" })
          .to(bg, { background: 'radial-gradient(circle, #4A1B5D 0%, #0B0515 80%)', duration: 1 }, 0)
          
        // 2. 3D Flip
          .to(tarot, { rotationY: 180, scale: 1.2, duration: 1.5, ease: "back.out(1.5)" })
          
        // 3. Magical flash upon revealing
          .call(() => {
              const flash = document.createElement('div');
              flash.style.cssText = "position:absolute; inset:0; background:#D4AF37; z-index:50; mix-blend-mode:screen;";
              document.body.appendChild(flash);
              gsap.fromถึง(flash, {opacity: 0.8}, {opacity: 0, duration: 1.5, onComplete: () => flash.remove()});
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
