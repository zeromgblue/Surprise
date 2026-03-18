export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#18181b"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Kanit:wght@300;400&display=swap');
            
            .stonehenge-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: linear-gradient(180deg, #09090b, #18181b, #27272a);
                perspective: 800px;
            }

            .starsBg { position: absolute; inset:0; background: url('https://www.transparenttextures.com/patterns/stardust.png'); opacity: 0.5; z-index: 1;}

            .grass {
                position: absolute; bottom: 0; width: 100vw; height: 20vh;
                background: #022c22; border-top: 2px solid #064e3b; z-index: 5;
            }

            /* Stonehenge structures */
            .stones-wrapper {
                position: absolute; bottom: 15vh; width: 100vw; display: flex; justify-content: center;
                align-items: flex-end; z-index: 10;
            }

            .stone-group { position: relative; width: 120px; height: 200px; margin: 0 10px; }
            .pillar { position: absolute; bottom: 0; width: 40px; height: 160px; background: #52525b; border-radius: 5px; box-shadow: inset 5px 0 10px rgba(0,0,0,0.5), -10px 10px 20px rgba(0,0,0,0.6); border: 2px solid #3f3f46;}
            .pl-left { left: 0; } .pl-right { right: 0; }
            .lintel { position: absolute; top: 20px; left: -10px; width: 140px; height: 30px; background: #71717a; border-radius: 3px; box-shadow: inset 0 -5px 10px rgba(0,0,0,0.5), 0 10px 10px rgba(0,0,0,0.6); border: 2px solid #52525b;}

            /* Magical Runes on stones */
            .rune { position: absolute; width: 20px; height: 20px; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #34d399; font-family: 'Cinzel', serif; font-size: 1.5rem; font-weight: 800; opacity: 0; text-shadow: 0 0 10px #10b981, 0 0 20px #059669; transition: 0.5s; pointer-events: none;}
            
            /* Center Magic Portal/Beam */
            .energy-beam {
                position: absolute; bottom: 18vh; width: 60px; height: 0;
                background: linear-gradient(0deg, #10b981, transparent);
                box-shadow: 0 0 50px #34d399; filter: blur(5px); z-index: 6; opacity: 0;
            }

            .hint-text { position: absolute; top: 20vh; color: #6ee7b7; font-family: 'Kanit', sans-serif; font-size: 1.5rem; letter-spacing: 2px; text-shadow: 0 0 10px #10b981; animation: pulse 2s infinite; font-weight: 300; z-index: 20;}
            @keyframes pulse { 0%,100%{opacity:0.3;} 50%{opacity:1;} }

            /* Druid Message Overlay */
            .druid-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
                background: radial-gradient(circle, rgba(2, 44, 34, 0.8), rgba(0,0,0,0.9));
            }
            .m-head { font-family: 'Cinzel', serif; font-size: 3.5rem; color: #a7f3d0; margin-bottom: 20px; font-weight: 800; text-shadow: 0 0 20px #10b981; letter-spacing: 3px;}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.4rem; color: #f1f5f9; line-height: 1.6; max-width: 600px; text-align: center; font-weight: 300;}
            .m-foot { font-family: 'Cinzel', serif; font-size: 1.2rem; color: #34d399; margin-top: 40px; letter-spacing: 5px;}

        </style>

        <div class="stonehenge-scene" id="scene">
            <div class="starsBg"></div>
            <div class="grass"></div>
            <div class="energy-beam" id="beam"></div>
            
            <div class="hint-text" id="hint">แตะที่หินเพื่อปลุกพลังเวทมนตร์</div>

            <div class="stones-wrapper" id="stonesBox">
                <!-- Group 1 -->
                <div class="stone-group" style="transform: translateZ(-100px) scale(0.8) translateX(-150px);">
                    <div class="pillar pl-left"><div class="rune">ᚫ</div></div>
                    <div class="pillar pl-right"><div class="rune">ᛒ</div></div>
                    <div class="lintel"><div class="rune">ᚦ</div></div>
                </div>
                <!-- Group 2 (Center) -->
                <div class="stone-group" style="z-index: 12;" id="centerStone">
                    <div class="pillar pl-left"><div class="rune">ᛗ</div></div>
                    <div class="pillar pl-right"><div class="rune">ᛟ</div></div>
                    <div class="lintel"><div class="rune">ᛉ</div></div>
                </div>
                <!-- Group 3 -->
                <div class="stone-group" style="transform: translateZ(-100px) scale(0.8) translateX(150px);">
                    <div class="pillar pl-left"><div class="rune">ᛋ</div></div>
                    <div class="pillar pl-right"><div class="rune">ᛏ</div></div>
                    <div class="lintel"><div class="rune">ᚢ</div></div>
                </div>
            </div>

            <div class="druid-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                 <div class="m-foot">THE ANCIENTS & ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const stonesBox = document.getElementById('stonesBox');
    const runes = document.querySelectorAll('.rune');
    const beam = document.getElementById('beam');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');

    let isAwake = false;

    // Clicking anywhere in the stone area activates it
    stonesBox.addEventListener('click', () => {
        if(isAwake) return;
        isAwake = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Runes light up sequentially
        tl.to(runes, { opacity: 1, duration: 0.2, stagger: 0.1, ease: "power1.in" })
          
        // 2. Center beam shoots up
          .to(beam, { opacity: 0.8, height: "100vh", duration: 1, ease: "power4.out" }, "+=0.2")
          
        // 3. Camera pushes in slightly (zoom)
          .to(stonesBox, { scale: 1.2, y: 50, duration: 2, ease: "sine.inOut" }, "-=1")
          
        // 4. Message fades in with aura
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2 }, "+=0.5");
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
