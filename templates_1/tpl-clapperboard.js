export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#18181b"; // Dark zinc
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@400;700&display=swap');
            
            .clapper-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #3f3f46, #18181b);
                perspective: 1000px;
            }

            /* Clapperboard */
            .clapperboard {
                position: relative; width: 500px; height: 350px; background: #111;
                border-radius: 10px; border: 5px solid #FFF; padding: 20px;
                box-sizing: border-box; cursor: pointer; z-index: 20;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8);
            }

            /* The Top Stick (Hinged) */
            .stick-top {
                position: absolute; top: -50px; left: -5px; width: calc(100% + 10px); height: 50px;
                background: repeating-linear-gradient(45deg, #111, #111 20px, #FFF 20px, #FFF 40px);
                border-radius: 5px 5px 0 0; border: 5px solid #FFF; border-bottom: none;
                transform-origin: 0% 100%; transform: rotate(-25deg); transition: transform 0.2s;
                z-index: 21; box-sizing: border-box;
            }

            .stick-bottom {
                position: absolute; top: 0; left: -5px; width: calc(100% + 10px); height: 30px;
                background: repeating-linear-gradient(45deg, #111, #111 20px, #FFF 20px, #FFF 40px);
                border: 5px solid #FFF; border-top: none;
                z-index: 19; box-sizing: border-box;
            }

            /* Chalk text style */
            .chalk-text {
                font-family: 'Bebas Neue', cursive; color: #FFF; font-size: 2.5rem;
                text-transform: uppercase; line-height: 1; margin-top: 40px;
                display: flex; flex-wrap: wrap; justify-content: space-between;
                border-bottom: 2px dashed rgba(255,255,255,0.3); padding-bottom: 15px; border-top: 2px dashed rgba(255,255,255,0.3); padding-top: 15px;
            }
            .c-label { color: #A0AEC0; font-size: 1.2rem; display: block; margin-bottom: 5px; font-family: 'Roboto', sans-serif;}
            .c-field { width: 48%; }

            .hint { position: absolute; top: -100px; width: 100%; text-align: center; color: #FFF; font-family: 'Bebas Neue', cursive; font-size: 2rem; animation: pulse 1s infinite; letter-spacing: 2px; }
            @keyframes pulse { 0%,100%{opacity:0.6;} 50%{opacity:1;} }

            /* Message that plays after clapper */
            .movie-play {
                position: absolute; inset: 0; background: #000; z-index: 30;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; padding: 40px; text-align: center;
            }

            .m-head { font-family: 'Bebas Neue', cursive; font-size: 4rem; color: #FACC15; margin-bottom: 20px; letter-spacing: 5px;}
            .m-body { font-family: 'Roboto', sans-serif; font-size: 1.5rem; color: #E2E8F0; line-height: 1.6; max-width: 800px; }

            @media(max-width: 600px) {
                .clapperboard { transform: scale(0.65); }
            }

        </style>

        <div class="clapper-scene">
            <div class="clapperboard" id="cboard">
                <div class="hint" id="hint">แตะเพื่อสั่งเดินกล้อง! (ACTION!)</div>
                <div class="stick-top" id="stickTop"></div>
                <div class="stick-bottom"></div>
                
                <h1 style="font-family:'Bebas Neue'; font-size:4rem; color:#FFF; margin: 30px 0 0; text-align:center;">UNIVERSAL SURPRISE</h1>
                
                <div class="chalk-text">
                    <div class="c-field"><span class="c-label">PROD.</span> THE BEST DAY</div>
                    <div class="c-field"><span class="c-label">SCENE</span> 1</div>
                    <div class="c-field" style="margin-top:20px; width:100%; text-align:center;"><span class="c-label">DIRECTOR</span> ${escapeHtml(data.sender)}</div>
                    <div class="c-field" style="margin-top:20px; width:100%; text-align:center;"><span class="c-label">STARRING</span> ${escapeHtml(data.receiver)}</div>
                </div>
            </div>

            <div class="movie-play" id="movie">
                <div class="m-head">SCENE 1: ACTION!</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br><br>')}</div>
            </div>
        </div>
    `;

    const cboard = document.getElementById('cboard');
    const stickTop = document.getElementById('stickTop');
    const movie = document.getElementById('movie');
    const hint = document.getElementById('hint');

    let isAction = false;

    cboard.addEventListener('click', () => {
        if(isAction) return;
        isAction = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Clapper snap down
        tl.to(stickTop, { rotation: 0, duration: 0.1, ease: "power4.in" })
          
        // 2. Camera flash & frame bump
          .to('.clapper-scene', { backgroundColor: '#FFF', duration: 0.05, yoyo: true, repeat: 1 })
          .to(cboard, { scale: 1.1, opacity: 0, duration: 0.5 }, "+=0.2")
          
        // 3. Roll movie message
          .to(movie, { opacity: 1, pointerEvents: 'auto', duration: 1 })
          .from('.m-head', { y: -50, opacity: 0, duration: 1, ease: "back.out(1.5)" }, "-=0.5")
          .from('.m-body', { y: 20, opacity: 0, duration: 1 }, "-=0.5");
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
