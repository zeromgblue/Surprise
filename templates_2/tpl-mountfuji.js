export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0f172a";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Sawarabi+Mincho&family=Prompt:wght@300;600&display=swap');
            
            .fuji-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #1e1b4b, #312e81, #1e293b);
                transition: background 3s ease;
            }

            /* The Sun */
            .sun {
                position: absolute; bottom: 10vh; width: 300px; height: 300px;
                background: linear-gradient(180deg, #f43f5e, #fb923c); border-radius: 50%;
                box-shadow: 0 0 100px #f43f5e; z-index: 1; opacity: 0;
            }

            /* Mount Fuji Silhouette */
            .fuji-mountain { ่       
                position: absolute; bottom: 15vh; width: 800px; height: 300px;
                background: #0f172a; clip-path: polygon(20% 100%, 45% 20%, 55% 20%, 80% 100%); z-index: 5;
            }
            .fuji-mountain::after {
                content: ''; position: absolute; top:0; left: 22.5%; width: 55%; height: 80px;
                background: #e2e8f0; clip-path: polygon(40% 0, 60% 0, 100% 100%, 80% 100%, 70% 80%, 50% 100%, 30% 80%, 20% 100%, 0 100%);
            }

            /* Torii Gate Silhouette */
            .torii-wrapper {
                position: absolute; bottom: 5vh; width: 400px; height: 300px;
                z-index: 15; display: flex; flex-direction: column; align-items: center; cursor: pointer;
            }
            .torii-top { width: 400px; height: 30px; background: #be123c; border-radius: 20px 20px 0 0; box-shadow: 0 5px 10px rgba(0,0,0,0.5); position: relative;}
            .torii-top::before { content:''; position: absolute; top:-10px; left: 50%; transform: translateX(-50%); width: 420px; height: 15px; background: #9f1239; border-radius: 50px 50px 0 0;}
            .torii-mid { width: 320px; height: 20px; background: #be123c; margin-top: 20px; box-shadow: 0 5px 10px rgba(0,0,0,0.5);}
            .torii-pillars { display: flex; justify-content: space-between; width: 260px; height: 250px; margin-top: -20px;}
            .t-pillar { width: 30px; height: 100%; background: #be123c; border-left: 2px solid #fb7185; box-shadow: 5px 0 10px rgba(0,0,0,0.5), inset 5px 0 10px rgba(0,0,0,0.3);}
            
            /* Center sign on Torii */
            .torii-sign { position: absolute; top: 30px; width: 40px; height: 60px; background: #1c1917; border: 2px solid #b45309; color: #facc15; display: flex; align-items: center; justify-content: center; font-family: 'Sawarabi Mincho', serif; font-size: 1.5rem;}

            /* Water reflection base */
            .lake { position: absolute; bottom: 0; width: 100vw; height: 10vh; background: #020617; border-top: 1px solid #334155; z-index: 20;}

            .hint-text { position: absolute; top: 18vh; color: #e2e8f0; font-family: 'Prompt', sans-serif; font-size: 1.4rem; letter-spacing: 2px; text-shadow: 0 0 10px #fb7185; animation: pulse 2s infinite; font-weight: 300; z-index: 25; pointer-events: none; text-align: center; padding: 0 20px;}
            @media (max-width: 600px) { .hint-text { font-size: 1.1rem; top: 15vh; } }
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Japanese Message Overlay */
            .japan-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: rgba(255,255,255,0.1); backdrop-filter: blur(2px);
            }
            .m-head { font-family: 'Sawarabi Mincho', serif; font-size: 3.5rem; color: #be123c; margin-bottom: 20px; font-weight: 700; text-shadow: 0 0 15px #fff, 0 2px 5px #000; text-align:center; padding: 0 20px;}
            .m-body { font-family: 'Prompt', sans-serif; font-size: 1.25rem; color: #0f172a; line-height: 1.6; max-width: 600px; width: 90%; text-align: center; font-weight: 600; background: rgba(255,255,255,0.7); padding: 30px; border-radius: 5px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);}
            .m-foot { font-family: 'Sawarabi Mincho', serif; font-size: 1.25rem; color: #9f1239; margin-top: 30px; font-weight: 700; padding-bottom: 40px;}

            @media (max-width: 600px) {
                .m-head { font-size: 1.6rem; }
                .m-body { font-size: 0.85rem; padding: 16px; }
                .m-foot { font-size: 0.85rem; }
            }

        </style>

        <div class="fuji-scene" id="scene">
            <div class="sun" id="sun"></div>
            <div class="fuji-mountain"></div>
            
            <div class="hint-text" id="hint">แตะประตูโทริอิเพื่อรับรุ่งอรุณ</div>

            <div class="torii-wrapper" id="torii">
                <div class="torii-top"></div>
                <div class="torii-mid"></div>
                <div class="torii-sign">福</div> <!-- 'Fortune' or similar character -->
                <div class="torii-pillars">
                    <div class="t-pillar"></div>
                    <div class="t-pillar"></div>
                </div>
            </div>

            <div class="lake"></div>

            <div class="japan-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">WITH BLESSINGS, ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const torii = document.getElementById('torii');
    const sun = document.getElementById('sun');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.getElementById('scene');

    let isDawn = false;

    torii.addEventListener('click', () => {
        if (isDawn) return;
        isDawn = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Sky transitions to dawn
        tl.to(scene, { background: "linear-gradient(180deg, #fca5a5, #fef08a, #fed7aa)", duration: 4, ease: "sine.inOut" }, 0)

            // 2. Large red sun rises from behind Fuji
            .to(sun, { opacity: 0.9, y: -450, scale: 1.2, duration: 4, ease: "power2.out" }, 0)

            // 3. Torii scales up slightly
            .to(torii, { scale: 1.1, y: 20, duration: 4, ease: "sine.inOut" }, 0)

            // 4. Message block fades in gently
            .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, 3);
    });
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
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
