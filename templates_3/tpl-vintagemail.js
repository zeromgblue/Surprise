export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#d1d5db"; // Soft countryside grey
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime&family=Pinyon+Script&display=swap');
            
            .mail-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: linear-gradient(135deg, #f3f4f6, #9ca3af);
                perspective: 1500px;
            }

            /* Trees Silhouette BG */
            .bg-trees {
                position: absolute; bottom: 0; width: 100vw; height: 30vh;
                background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20"><path d="M0 20 L5 10 L10 20 L15 5 L25 20 L35 15 L45 20 L60 8 L70 20 L80 12 L90 20 L100 10 L100 20 Z" fill="rgba(75,85,99,0.3)"/></svg>') repeat-x;
                background-size: contain; z-index: 1; pointer-events: none;
            }

            /* Mailbox Post */
            .post {
                position: absolute; bottom: -50vh; width: 40px; height: 70vh;
                background: linear-gradient(to right, #78350f, #451a03); z-index: 5;
                border-radius: 5px 5px 0 0; box-shadow: 10px 0 20px rgba(0,0,0,0.2);
            }

            /* Mailbox Body */
            .mailbox {
                position: relative; width: 280px; height: 150px; background: #e11d48;
                border-radius: 75px 75px 10px 10px; z-index: 10; cursor: pointer;
                box-shadow: inset -10px -10px 30px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.3);
                display: flex; align-items: center; justify-content: center;
                transform-style: preserve-3d; transition: 0.3s;
            }

            /* Front Lid */
            .mb-lid {
                position: absolute; right: -5px; width: 20px; height: 150px; background: #be123c;
                border-radius: 5px 20px 20px 5px; transform-origin: left center; z-index: 12;
                box-shadow: -5px 0 10px rgba(0,0,0,0.4);
            }

            /* Red Flag */
            .mb-flag {
                position: absolute; right: 40px; top: -50px; width: 10px; height: 60px; background: #facc15;
                transform-origin: bottom center; transition: 0.5s; z-index: 11; border-radius: 5px;
            }

            .hint { position: absolute; top: 15vh; color: #4b5563; font-family: 'Courier Prime', monospace; font-size: 1.5rem; letter-spacing: 2px; z-index: 20; font-weight: bold; animation: pulse 2s infinite;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Flying Letter */
            .letter-card {
                position: absolute; width: 350px; height: 250px; background: #fef08a; /* yellowish envelope */
                border-radius: 5px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); z-index: 30;
                display: flex; flex-direction: column; padding: 20px; box-sizing: border-box;
                transform: scale(0) translateY(100px); opacity: 0; pointer-events: none;
                border: 1px solid #facc15;
                background-image: repeating-linear-gradient(transparent, transparent 29px, #d97706 30px);
            }

            .l-to { font-family: 'Courier Prime', monospace; font-size: 1.2rem; color: #78350f; font-weight: bold; margin-bottom: 20px; }
            .l-body { font-family: 'Pinyon Script', cursive; font-size: 2.2rem; color: #451a03; line-height: 1.4; flex-grow: 1;}
            .l-stamp { position: absolute; top: 10px; right: 10px; width: 40px; height: 50px; border: 2px dashed #dc2626; display: flex; align-items: center; justify-content: center; color: #dc2626; font-weight: bold; transform: rotate(10deg); font-family: 'Courier Prime', monospace;}

        </style>

        <div class="mail-scene">
            <div class="bg-trees"></div>
            <div class="hint" id="hint">เปิดตู้จดหมาย</div>

            <div class="post"></div>
            
            <div class="mailbox" id="mbox">
                <div style="font-family:'Courier Prime'; font-size:3rem; color:#fca5a5; font-weight:bold; opacity:0.6;">MAIL</div>
                <div class="mb-flag" id="flag"></div>
                <!-- The flap door on the right side -->
                <div class="mb-lid" id="lid"></div>
            </div>

            <div class="letter-card" id="letter">
                <div class="l-stamp">MAIL</div>
                <div class="l-to">To: ${escapeHtml(data.receiver)}<br>From: ${escapeHtml(data.sender)}</div>
                <div class="l-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            </div>
        </div>
    `;

    const mbox = document.getElementById('mbox');
    const lid = document.getElementById('lid');
    const flag = document.getElementById('flag');
    const hint = document.getElementById('hint');
    const letter = document.getElementById('letter');

    // Make mailbox arrival animation
    gsap.from('.post', { y: "100vh", duration: 1.5, ease: "back.out(1)" });
    gsap.from(mbox, { y: "100vh", duration: 1.5, ease: "back.out(1)", delay: 0.1 });

    let isOpened = false;

    mbox.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Flag drops, Door opens
        tl.to(flag, { rotation: 90, duration: 0.5, ease: "bounce.out" })
          .to(lid, { rotationY: 120, duration: 0.8, ease: "power2.inOut" }, "-=0.3")
          
        // 2. Letter shoots out and zooms to screen
          .to(letter, { opacity: 1, scale: 1, y: -50, rotation: -5, duration: 1, ease: "back.out(1.5)", pointerEvents: 'auto' })
          
        // 3. Mailbox blurs back
          .to([mbox, '.post'], { filter: 'blur(5px)', scale: 0.9, opacity: 0.5, duration: 1 }, "-=0.5");
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
