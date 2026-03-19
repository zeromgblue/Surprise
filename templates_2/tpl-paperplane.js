export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#8ECAE6"; // Sky blue
    // Cloud pattern
    container.style.backgroundImage = "radial-gradient(circle at 20% 20%, #A2D2FF, transparent 40%), radial-gradient(circle at 80% 80%, #BDE0FE, transparent 40%)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Mali:wght@400;600&display=swap');
            
            .sky-scene {
                position: relative; width: 100%; height: 100vh;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden;
            }

            .plane-wrapper {
                position: absolute; right: -200px; top: 10%; width: 150px; height: 150px;
                cursor: pointer; z-index: 10;
                /* GSAP will animate this flying in */
            }

            /* CSS Paper Plane */
            .paper-plane {
                width: 100%; height: 100%; position: relative;
                transform-style: preserve-3d; transform: rotate(-20deg) scale(0.8);
                transition: transform 0.2s; filter: drop-shadow(0 10px 10px rgba(0,0,0,0.2));
            }
            .paper-plane:hover { transform: rotate(-20deg) scale(0.9); }
            
            .wing { position: absolute; background: #fff; transform-origin: top left; }
            .wing-left {
                width: 100px; height: 50px; left: 20px; top: 50px;
                clip-path: polygon(0 0, 100% 100%, 0 100%);
                background: #f0f0f0; transform: skewY(20deg);
            }
            .wing-right {
                width: 100px; height: 50px; left: 20px; top: 50px;
                clip-path: polygon(0 0, 100% 0, 0 100%);
                background: #fff; transform: skewY(-20deg); box-shadow: inset 0 0 10px rgba(0,0,0,0.1);
            }
            .plane-body {
                position: absolute; width: 120px; height: 30px; left: 10px; top: 60px;
                background: #e0e0e0; clip-path: polygon(0 50%, 100% 0, 100% 100%);
                transform: rotate(-10deg);
            }

            .unfolded-paper {
                position: absolute; width: 85%; max-width: 400px; min-height: 50vh;
                background: #fff; box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                border-radius: 5px; opacity: 0; transform: scale(0.1) rotate(20deg);
                z-index: 20; padding: 40px; box-sizing: border-box;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                /* Fold lines texture */
                background-image: linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px);
                background-size: 20px 20px;
            }

            .s-topic { font-family: 'Caveat', cursive; font-size: 2.5rem; color: #1D3557; margin-bottom: 20px; text-align:center;}
            .s-msg { font-family: 'Mali', sans-serif; font-size: 1.2rem; line-height: 1.8; color: #444; width:100%; text-align:left;}

            .hint-text {
                position: absolute; bottom: 20%; width: 100%; text-align: center;
                color: #fff; font-family: sans-serif; font-size: 1rem; letter-spacing: 2px;
                text-shadow: 0 2px 5px rgba(0,0,0,0.5); opacity:0;
            }
            
            /* Clouds */
            .bg-cloud { position:absolute; background:#fff; border-radius:50px; filter:blur(5px); opacity:0.8; z-index:1;}
        </style>

        <div class="sky-scene">
            <!-- decorative clouds -->
            <div class="bg-cloud" style="width:200px; height:60px; top:20%; left:10%;"></div>
            <div class="bg-cloud" style="width:150px; height:50px; top:60%; right:15%;"></div>

            <div class="unfolded-paper" id="paper">
                <div class="s-topic">Air Mail for ${escapeHtml(data.receiver)}</div>
                <div class="s-msg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="s-msg" style="text-align:right; margin-top:30px; border-top: 1px dotted #ccc; padding-top:10px;">Flight Cap:<br>${escapeHtml(data.sender)}</div>
            </div>

            <div class="plane-wrapper" id="plane">
                <div class="paper-plane">
                    <div class="plane-body"></div>
                    <div class="wing wing-left"></div>
                    <div class="wing wing-right"></div>
                </div>
            </div>

            <div class="hint-text" id="hint">จับเครื่องบินกระดาษ</div>
        </div>
    `;

    const plane = document.getElementById('plane');
    const paper = document.getElementById('paper');
    const hint = document.getElementById('hint');
    let isCaught = false;

    // 1. Initial flying animation looping around
    gsap.to(plane, {
        x: -window.innerWidth - 300,
        y: 200,
        duration: 5, ease: "power1.inOut", repeat: -1, yoyo: true
    });
    
    // Float plane up and down slightly
    gsap.to('.paper-plane', { y: 30, duration: 1.5, yoyo: true, repeat: -1, ease: "sine.inOut" });

    // Show hint after 2s
    setTimeout(()=> gsap.to(hint, {opacity:1, duration: 1}), 2000);

    plane.addEventListener('click', () => {
        if(isCaught) return;
        isCaught = true;

        // Stop animations
        gsap.killTweensOf(plane);
        gsap.killTweensOf('.paper-plane');
        hint.style.display = 'none';

        const tl = gsap.timeline();
        
        // Plane dives to center 
        tl.to(plane, {
            left: '50%', top: '50%', x: '-50%', y: '-50%',
            rotation: 720, scale: 2, duration: 1, ease: "power2.out"
        })
        // Plane disappears and unfolds into paper
        .to(plane, { opacity: 0, duration: 0.2 })
        .to(paper, { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: "back.out(1.2)" }, "-=0.2");
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
