export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#bae6fd"; // beach sky
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Shadows+Into+Light&family=Caveat:wght@700&display=swap');
            
            .beach-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #bae6fd 0%, #38bdf8 50%, #fde047 100%);
            }

            /* Water Waves */
            .wave {
                position: absolute; bottom: 0; width: 200vw; height: 30vh;
                background: rgba(14, 165, 233, 0.5); border-radius: 40%;
                animation: waveFloat 6s linear infinite; z-index: 10;
            }
            .wave:nth-child(2){ background: rgba(2, 132, 199, 0.4); animation-duration: 8s; animation-direction: reverse; width: 220vw; height: 32vh; z-index: 9;}
            
            @keyframes waveFloat { 0% { transform: translateX(0) translateY(0) rotate(0); } 50% { transform: translateY(10px); } 100% { transform: translateX(-50vw) translateY(0) rotate(5deg); } }

            /* Sand */
            .sand {
                position: absolute; bottom: -20vh; width: 150vw; height: 40vh;
                background: radial-gradient(ellipse at center, #fef08a, #ca8a04);
                border-radius: 50%; z-index: 15;
            }

            /* The Glass Bottle */
            .bottle-container {
                position: absolute; bottom: 15vh; z-index: 20;
                width: 100px; height: 260px; cursor: pointer;
                transform: rotate(70deg) translate(-50px, -50px);
            }

            .bottle {
                width: 100%; height: 100%; background: linear-gradient(90deg, rgba(255,255,255,0.4), rgba(74, 222, 128, 0.3) 50%, rgba(255,255,255,0.2));
                border-radius: 40% 40% 10% 10% / 100% 100% 15% 15%;
                box-shadow: inset -10px 0 20px rgba(0,0,0,0.2), inset 10px 0 20px rgba(255,255,255,0.5), 0 10px 20px rgba(0,0,0,0.3);
                border: 2px solid rgba(255,255,255,0.4); backdrop-filter: blur(2px);
                position: relative; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 20px; box-sizing: border-box;
            }
            /* Bottle neck */
            .bottle::before {
                content: ''; position: absolute; top: -40px; left: 50%; transform: translateX(-50%);
                width: 40px; height: 50px; background: linear-gradient(90deg, rgba(255,255,255,0.5), rgba(74, 222, 128, 0.4));
                border-radius: 10px 10px 0 0; border: 2px solid rgba(255,255,255,0.4); border-bottom: none;
            }

            /* Cork */
            .cork {
                position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
                width: 35px; height: 25px; background: #b45309; border-radius: 5px 5px 0 0;
                box-shadow: inset 0 2px 5px rgba(255,255,255,0.3); z-index: 21; transition: 0.3s;
            }

            /* The Paper Roll inside */
            .paper-roll {
                width: 60px; height: 150px; background: #fef08a; border-radius: 5px;
                box-shadow: inset 10px 0 10px rgba(0,0,0,0.1), inset -10px 0 10px rgba(217, 119, 6, 0.3);
                border: 1px solid #d97706; z-index: 19;
            }

            .hint { position: absolute; top: 15vh; color: #0c4a6e; font-family: 'Caveat', cursive; font-size: 2.5rem; letter-spacing: 2px; z-index: 30; animation: bounce 2s infinite;}
            @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }

            /* Message Unrolled */
            .scroll-msg {
                position: absolute; width: 85%; max-width: 500px; height: 70vh;
                background: url('https://www.transparenttextures.com/patterns/cream-paper.png') #fef08a;
                border-radius: 5px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); z-index: 40;
                padding: 40px; box-sizing: border-box; display: flex; flex-direction: column;
                transform: scale(0) rotate(-10deg); opacity: 0; pointer-events: none;
                top: 15vh; border: 1px solid #d97706;
            }

            .m-head { font-family: 'Caveat', cursive; font-size: 3rem; color: #92400e; margin-bottom: 20px; border-bottom: 2px dashed #b45309; padding-bottom:10px;}
            .m-body { font-family: 'Shadows Into Light', cursive; font-size: 1.8rem; color: #78350f; line-height: 1.6; flex-grow: 1;}
            .m-foot { font-family: 'Caveat', cursive; font-size: 2rem; color: #92400e; text-align: right; }

        </style>

        <div class="beach-scene">
            <div class="hint" id="hint">เปิดจุกขวดแก้ว</div>
            <div class="wave"></div><div class="wave"></div>
            <div class="sand"></div>

            <div class="bottle-container" id="bottleGroup">
                <div class="cork" id="corkBtn"></div>
                <div class="bottle">
                    <div class="paper-roll" id="roll"></div>
                </div>
            </div>

            <div class="scroll-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)},</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-foot">${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const bottleGroup = document.getElementById('bottleGroup');
    const corkBtn = document.getElementById('corkBtn');
    const roll = document.getElementById('roll');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    // Make bottle bob on water
    gsap.to(bottleGroup, { y: -20, rotation: 75, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isOpened = false;

    bottleGroup.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        gsap.killTweensOf(bottleGroup);

        const tl = gsap.timeline();

        // 1. Bottle stand up
        tl.to(bottleGroup, { rotation: 0, y: -50, x: 0, scale: 1.5, duration: 1, ease: "power2.out" })
          
        // 2. Pop cork
          .to(corkBtn, { y: -100, x: 50, rotation: 180, opacity: 0, duration: 0.8, ease: "power2.inOut" })
          
        // 3. Roll flies out
          .to(roll, { y: -200, opacity: 0, duration: 0.5, ease: "power1.in" }, "-=0.3")
          
        // 4. Bottle fades to blur
          .to(bottleGroup, { filter: 'blur(5px)', opacity: 0.5, duration: 1 })
          
        // 5. Scroll unrolls in user face
          .to(msg, { scale: 1, rotation: 0, opacity: 1, pointerEvents: 'auto', duration: 1, ease: "back.out(1.2)" }, "-=0.5");
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
