export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#1e293b"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;700&display=swap');
            
            .storm-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: linear-gradient(180deg, #0f172a, #334155, #64748b);
            }

            /* Lightning clouds */
            .clouds {
                position: absolute; top: 0; width: 100vw; height: 30vh;
                background: linear-gradient(180deg, #020617, transparent); z-index: 5;
            }

            /* Rain */
            .rain { position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/rain.png'); opacity: 0.3; animation: raining 0.5s linear infinite; z-index: 2; pointer-events: none;}
            @keyframes raining { 0% { background-position: 0 0; } 100% { background-position: -20px 200px; } }

            /* Sky Trigger */
            .sky-trigger {
                position: absolute; inset: 0; z-index: 20; cursor: pointer;
                display: flex; align-items: center; justify-content: center;
            }
            .hint-text { color: #cbd5e1; font-family: 'Chakra Petch', sans-serif; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #0ea5e9; animation: pulse 2s infinite;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Thunder Flash */
            .flash {
                position: absolute; inset:0; background: #fff; z-index: 40; opacity: 0; pointer-events: none;
            }

            /* Lightning Bolt SVG */
            .bolt {
                position: absolute; top: 0; left: 50%; transform: translateX(-50%); height: 100vh; width: 100px;
                z-index: 30; opacity: 0; pointer-events: none;
            }

            /* Electric Message */
            .thunder-msg {
                position: absolute; inset: 0; padding: 40px; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
            }
            .m-head { font-family: 'Chakra Petch', sans-serif; font-size: 4rem; color: #38bdf8; margin-bottom: 20px; font-weight: 700; text-shadow: 0 0 10px #0284c7, 0 0 20px #e0f2fe; text-align:center;}
            .m-body { font-family: 'Chakra Petch', sans-serif; font-size: 1.5rem; color: #f1f5f9; line-height: 1.6; max-width: 600px; text-align: center; font-weight: 500;}
            .m-foot { font-family: 'Chakra Petch', sans-serif; font-size: 1.2rem; color: #94a3b8; margin-top: 40px; letter-spacing: 2px;}

            /* Burn marks on the text reveal */
            .burn-in { animation: textBurn 2s forwards; }
            @keyframes textBurn { 0% { filter: blur(10px) brightness(3); opacity: 0; transform: scale(1.1); } 100% { filter: blur(0px) brightness(1); opacity: 1; transform: scale(1); } }

        </style>

        <div class="storm-scene" id="scene">
            <div class="clouds"></div>
            <div class="rain"></div>
            
            <svg class="bolt" id="bolt" viewBox="0 0 100 1000" preserveAspectRatio="none">
                <path d="M50 0 L20 300 L60 350 L10 600 L50 650 L30 1000" stroke="#bae6fd" stroke-width="5" fill="none" filter="drop-shadow(0 0 10px #38bdf8)"/>
            </svg>

            <div class="flash" id="flash"></div>

            <div class="sky-trigger" id="trigger">
                <div class="hint-text" id="hint">แตะเพื่อเรียกสายฟ้า</div>
            </div>

            <div class="thunder-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">ENERGY GIVEN BY ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const trigger = document.getElementById('trigger');
    const flash = document.getElementById('flash');
    const bolt = document.getElementById('bolt');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    let isStruck = false;

    trigger.addEventListener('click', () => {
        if(isStruck) return;
        isStruck = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Double flash of lightning
        tl.to(flash, { opacity: 0.8, duration: 0.05 })
          .to(flash, { opacity: 0, duration: 0.1 })
          .to(bolt, { opacity: 1, duration: 0.05 })
          .to(flash, { opacity: 1, duration: 0.1 })
          .to(bolt, { opacity: 0, duration: 0.1 })
          .to(flash, { opacity: 0, duration: 1 })
          
        // 2. Message burns into the screen
          .call(() => {
              msg.style.pointerEvents = 'auto';
              msg.classList.add('burn-in');
          }, null, "-=0.8");
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
