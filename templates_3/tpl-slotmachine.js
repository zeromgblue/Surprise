export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#2D3748"; // Dark casino theme
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Rye&family=Chango&display=swap');
            
            .slot-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #4A5568, #1A202C);
            }

            /* Slot Machine Frame */
            .machine {
                position: relative; width: 340px; height: 340px;
                background: linear-gradient(to bottom, #DD6B20, #C05621);
                border: 10px solid #F6AD55; border-radius: 30px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 5px 10px #FFF;
                display: flex; flex-direction: column; align-items: center; z-index: 10;
            }
            .machine::before {
                content: 'JACKPOT'; position: absolute; top: 15px; font-family: 'Rye', cursive;
                color: #FFF; font-size: 2rem; letter-spacing: 2px; text-shadow: 0 0 10px #FFD700;
            }

            /* Reel Display Area */
            .reels-window {
                margin-top: 80px; width: 280px; height: 120px;
                background: #FFF; border: 5px solid #2D3748; border-radius: 10px;
                box-shadow: inset 0 10px 20px rgba(0,0,0,0.5);
                display: flex; gap: 5px; padding: 5px; box-sizing: border-box;
                overflow: hidden;
            }

            .reel {
                flex: 1; height: 100%; background: #EDF2F7; border-radius: 5px;
                display: flex; flex-direction: column; align-items: center;
                box-shadow: inset 0 20px 20px -20px #000, inset 0 -20px 20px -20px #000;
            }

            .symbol-strip {
                display: flex; flex-direction: column; width: 100%;
                /* Items will animate Y */
            }
            .symbol {
                width: 100%; height: 100px; display: flex; align-items: center; justify-content: center;
                font-size: 3.5rem; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.3)); flex-shrink: 0;
            }

            /* Lever */
            .lever-base {
                position: absolute; right: -40px; top: 150px; width: 30px; height: 60px;
                background: #4A5568; border-radius: 0 10px 10px 0; border: 2px solid #2D3748;
            }
            .lever-rod {
                position: absolute; right: -4x; top: 10px; width: 10px; height: 100px;
                background: linear-gradient(to left, #E2E8F0, #A0AEC0); border-radius: 5px;
                transform-origin: bottom center; cursor: pointer; z-index: 5;
            }
            .lever-ball {
                position: absolute; top: -20px; left: -15px; width: 40px; height: 40px;
                background: radial-gradient(circle at 30% 30%, #F56565, #C53030);
                border-radius: 50%; box-shadow: 0 5px 10px rgba(0,0,0,0.5);
            }

            .hint { position: absolute; bottom: 15vh; color: #F6AD55; font-family: 'Chango', cursive; font-size: 2rem; text-shadow: 0 5px 0 #DD6B20; z-index: 20; letter-spacing: 2px; }

            /* Message Area */
            .prize-msg {
                position: absolute; inset: 0; z-index: 60; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(0,0,0,0.8), rgba(0,0,0,0.95)); backdrop-filter: blur(5px);
            }

            .m-head { font-family: 'Rye', cursive; font-size: 4rem; color: #FFD700; text-shadow: 0 0 20px #DD6B20, 2px 2px 0 #FFF; margin-bottom: 20px;}
            .m-body { font-family: 'Chango', cursive; font-size: 1.5rem; color: #FFF; line-height: 1.6; }
            
        </style>

        <div class="slot-scene">
            <div class="hint" id="hint">ดึงเพื่อหมุน!</div>

            <div class="machine" id="machine">
                <div class="reels-window">
                    <div class="reel"><div class="symbol-strip" id="rs1"></div></div>
                    <div class="reel"><div class="symbol-strip" id="rs2"></div></div>
                    <div class="reel"><div class="symbol-strip" id="rs3"></div></div>
                </div>
                
                <div class="lever-base">
                    <div class="lever-rod" id="lever">
                        <div class="lever-ball"></div>
                    </div>
                </div>
            </div>

            <div class="prize-msg" id="msg">
                <div class="m-head">แจ็คพอตแตก!</div>
                <div class="m-body" style="color:#F6AD55; margin-bottom: 10px;">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-body" style="font-size:1rem; margin-top:40px; color:#A0AEC0;">หมุนโชคโดย: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const lever = document.getElementById('lever');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    
    // Setup reels
    const emojis = ['💎', '🍒', '🔔', '🍀', '💰', '7️⃣'];
    const targetEmoji = '💖'; // The final winning emoji

    function buildStrip(el) {
        let content = '';
        // Add 20 random emojis + final target at the end (top theoretically)
        // Actually, we scroll Y upwards, so the last element stops in view.
        for(let i=0; i<30; i++) {
            content += `<div class="symbol">${emojis[Math.floor(Math.random()*emojis.length)]}</div>`;
        }
        content += `<div class="symbol">${targetEmoji}</div>`;
        el.innerHTML = content;
        
        // Start position (bottom)
        el.style.transform = `translateY(0)`;
    }

    const s1 = document.getElementById('rs1');
    const s2 = document.getElementById('rs2');
    const s3 = document.getElementById('rs3');

    buildStrip(s1); buildStrip(s2); buildStrip(s3);

    let isSpinning = false;

    lever.addEventListener('click', () => {
        if(isSpinning) return;
        isSpinning = true;
        hint.style.display = 'none';

        // Animate Lever pull
        gsap.to(lever, { rotation: 45, duration: 0.3, yoyo: true, repeat: 1, ease: "power1.inOut" });

        // Spin reels
        const symbolHeight = 100;
        // ถึงtal height = (31 symbols) * 100 = 3100. The last symbol is at index 30.
        // We want translateY to be -(30 * 100) to show the last one exactly.
        const targetY = -(30 * 100);

        // Reel 1
        gsap.to(s1, { y: targetY, duration: 2, ease: "power2.inOut" });
        // Reel 2
        gsap.to(s2, { y: targetY, duration: 2.5, ease: "power2.inOut" });
        // Reel 3
        gsap.to(s3, { y: targetY, duration: 3, ease: "power2.inOut", onComplete: () => {
            // WIN!
            setTimeout(() => {
                const flash = document.createElement('div');
                flash.style.cssText = "position:absolute; inset:0; background:#FFD700; z-index:55; mix-blend-mode:color-dodge;";
                document.body.appendChild(flash);
                gsap.to(flash, { opacity:0, duration: 1, onComplete:()=>flash.remove() });
                
                // Show message
                gsap.to(msg, { opacity: 1, pointerEvents:'auto', duration: 1, ease:"back.out(1.2)" });
            }, 500);
        }});
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
