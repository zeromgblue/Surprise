export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#5C94FC"; // Mario sky blue
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
            
            .game-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden;
            }

            /* Retro clouds */
            .clouds {
                position: absolute; top: 10%; width: 100%; height: 200px;
                background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><path fill="%23FFF" d="M10,30 Q10,10 30,10 Q50,10 50,30 Q70,30 70,50 L10,50 Z"/></svg>') repeat-x;
                background-size: 200px 100px;
                animation: scrollClouds 60s linear infinite; opacity: 0.8; z-index: 1;
            }
            @keyframes scrollClouds { 100% {background-position: -2000px 0;} }

            /* Floor */
            .ground {
                position: absolute; bottom: 0; width: 100%; height: 60px;
                background: #C84C0C; border-top: 5px solid #000; z-index: 5;
                background-image: repeating-linear-gradient(45deg, #000 0, #000 5px, transparent 5px, transparent 20px);
            }

            /* The Question Block */
            .q-block {
                position: relative; width: 100px; height: 100px;
                background: #FF9C00; border: 4px solid #000;
                box-shadow: inset -8px -8px 0 rgba(0,0,0,0.3), inset 8px 8px 0 rgba(255,255,255,0.6);
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; z-index: 10; font-family: 'Press Start 2P', cursive;
                font-size: 3rem; color: #000; animation: blinkBlock 1s infinite alternate;
            }
            .q-block:active { transform: translateY(-10px); }
            @keyframes blinkBlock { 100% { background: #FFCE00; } }

            .hint { position: absolute; bottom: 20%; color: #FFF; font-family: 'Press Start 2P', cursive; font-size: 1rem; text-shadow: 2px 2px 0 #000; z-index: 20; text-align: center; line-height:1.5;}

            /* Coin */
            .coin {
                position: absolute; width: 40px; height: 60px;
                background: #FFCE00; border: 4px solid #000; border-radius: 50%;
                top: 50%; left: 50%; transform: translate(-50%, -50%);
                opacity: 0; pointer-events: none; z-index: 5;
            }

            /* Message Plate */
            .win-msg {
                position: absolute; inset: 0; z-index: 30; padding: 30px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none;
                background: rgba(0,0,0,0.85); backdrop-filter: blur(5px);
            }

            .m-head { font-family: 'Press Start 2P', cursive; font-size: 1.5rem; color: #FFF; text-shadow: 3px 3px 0 #E52521; margin-bottom: 30px; line-height:1.5;}
            .m-body { font-family: 'Press Start 2P', cursive; font-size: 1rem; color: #FFCE00; line-height: 1.8; text-shadow: 2px 2px 0 #000; max-width: 600px;}
            
            /* Pixel score indicator */
            .score { position: absolute; top: 20px; right: 20px; font-family: 'Press Start 2P', cursive; color: #FFF; text-shadow: 2px 2px 0 #000; font-size: 1.2rem; z-index:20;}

        </style>

        <div class="game-scene" id="scene">
            <div class="clouds"></div>
            <div class="score">เคาะ: <span id="hits">0</span>/5</div>
            <div class="hint" id="hint">เคาะกล่อง<br>5 ครั้ง!</div>

            <div class="coin" id="coin"></div>
            <div class="q-block" id="block">?</div>
            
            <div class="ground"></div>

            <div class="win-msg" id="msg">
                <div class="m-head">ผ่านด่านแล้ว!<br>${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br><br>')}</div>
                <div class="m-head" style="font-size:0.8rem; margin-top:40px; color:#5C94FC; text-shadow:none;">ผู้เล่น 1: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const block = document.getElementById('block');
    const coin = document.getElementById('coin');
    const msg = document.getElementById('msg');
    const hitCounter = document.getElementById('hits');
    const hint = document.getElementById('hint');
    
    let hits = 0;
    const requiredHits = 5;

    block.addEventListener('click', () => {
        if(hits >= requiredHits) return;
        hits++;
        hitCounter.innerText = hits;

        // Animate block punch
        gsap.to(block, { y: -20, duration: 0.1, yoyo: true, repeat: 1 });

        // Throw coin out
        gsap.killTweensOf(coin);
        gsap.fromถึง(coin, 
            { y: 0, opacity: 1 }, 
            { y: -150, opacity: 0, duration: 0.5, ease: "power1.out" }
        );

        if(hits === requiredHits) {
            hint.style.display = 'none';
            block.style.background = '#888'; // Used block color
            block.style.animation = 'none';
            block.innerText = '';
            
            setTimeout(() => {
                // Flash screen
                gsap.to(block, {scale: 0, duration: 0.5});
                const flash = document.createElement('div');
                flash.style.cssText = "position:absolute; inset:0; background:#FFF; z-index:50;";
                document.body.appendChild(flash);
                gsap.to(flash, { opacity:0, duration: 1, onComplete:()=>flash.remove() });
                
                // Show message
                gsap.to(msg, { opacity: 1, pointerEvents:'auto', duration: 1, delay: 0.5 });
            }, 600);
        }
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
