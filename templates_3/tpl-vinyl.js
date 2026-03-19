export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#1A1A1A";
    container.style.backgroundImage = "radial-gradient(circle at center, #2a1a10 0%, #111 100%)";
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    const colorDisc = config.from || '#F4A261';

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Outfit:wght@300;400&display=swap');
            
            .player-stage {
                position: relative; width: 320px; height: 320px;
                display: flex; align-items: center; justify-content: center; z-index: 10;
                border-radius: 20px; background: rgba(0,0,0,0.3);
                box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 2px 5px rgba(255,255,255,0.05);
            }

            .vinyl-disc {
                position: relative; width: 260px; height: 260px;
                border-radius: 50%; background: #111;
                box-shadow: 0 5px 15px rgba(0,0,0,0.8);
                display: flex; align-items: center; justify-content: center;
                /* Grooves */
                background-image: 
                    radial-gradient(circle, transparent 30%, #1a1a1a 32%, #111 34%, transparent 36%),
                    radial-gradient(circle, transparent 40%, #1a1a1a 42%, #111 44%, transparent 46%),
                    radial-gradient(circle, transparent 50%, #1a1a1a 52%, #111 54%, transparent 56%),
                    radial-gradient(circle, transparent 60%, #1a1a1a 62%, #111 64%, transparent 66%),
                    radial-gradient(circle, transparent 70%, #1a1a1a 72%, #111 74%, transparent 76%),
                    radial-gradient(circle, transparent 80%, #1a1a1a 82%, #111 84%, transparent 86%);
                transition: transform 0.5s; cursor: pointer;
            }
            /* Reflection */
            .vinyl-disc::after {
                content: ''; position: absolute; inset:0; border-radius: 50%;
                background: conic-gradient(from 45deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.1) 45deg, rgba(255,255,255,0) 90deg, rgba(255,255,255,0.1) 225deg, rgba(255,255,255,0) 270deg);
            }

            .vinyl-label {
                position: absolute; width: 100px; height: 100px;
                border-radius: 50%; background: ${colorDisc};
                display: flex; align-items: center; justify-content: center; z-index: 2;
                box-shadow: 0 0 5px rgba(0,0,0,0.5); font-family: 'Abril Fatface', serif; font-size: 0.6rem; color:#fff; text-align:center;
            }
            .vinyl-hole { position:absolute; width: 15px; height: 15px; background: #000; border-radius: 50%; z-index: 3; }

            .tonearm {
                position: absolute; top: 10px; right: 20px; width: 40px; height: 160px;
                transform-origin: 20px 20px; transform: rotate(-30deg); z-index: 5; pointer-events:none;
            }
            .tonearm-base {
                position: absolute; top:0; left:0; width: 40px; height: 40px;
                background: #333; border-radius: 50%; border: 4px solid #555; box-sizing: border-box;
                box-shadow: 0 5px 10px rgba(0,0,0,0.5);
            }
            .tonearm-rod {
                position: absolute; top: 20px; left: 16px; width: 8px; height: 120px;
                background: linear-gradient(90deg, #ccc, #fff, #999); border-radius: 4px; border-bottom-left-radius: 0;
            }
            .tonearm-head {
                position: absolute; bottom: 0; left: 6px; width: 28px; height: 35px;
                background: #222; border-radius: 5px; transform: rotate(15deg);
                box-shadow: inset -2px -2px 5px rgba(255,255,255,0.2), 2px 2px 5px rgba(0,0,0,0.5);
            }

            .hint {
                position: absolute; bottom: -50px; width:100%; text-align:center;
                color: rgba(255,255,255,0.7); font-family: sans-serif; letter-spacing: 2px;
                animation: fadeHint 1.5s infinite alternate; font-size: 0.9rem;
            }
            @keyframes fadeHint { 0%{opacity:0.3;} 100%{opacity:1;} }

            .msg-panel {
                position: absolute; bottom: 100%; left: 0; width: 100%; height: 60vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                padding-bottom: 20px; opacity: 0; pointer-events: none;
                background: linear-gradient(to top, rgba(26,26,26,1) 0%, rgba(26,26,26,0) 100%); z-index: 20;
            }
            .m-title { font-family: 'Abril Fatface', cursive; font-size: 2.2rem; color: ${colorDisc}; margin-bottom: 10px; text-shadow: 2px 2px 10px rgba(0,0,0,0.5); }
            .m-text { font-family: 'Outfit', sans-serif; font-size: 1.1rem; line-height: 1.6; color: #eee; text-align:center; max-width: 80%; }
            
            /* Music notes */
            .note { position: absolute; color: #fff; font-size: 1.5rem; opacity: 0; z-index: 15; text-shadow: 0 0 10px ${colorDisc}; }
        </style>

        <div class="msg-panel" id="msg">
            <div class="m-title">Song for ${escapeHtml(data.receiver)}</div>
            <div class="m-text">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
            <div class="m-text" style="color:#aaa; font-size:0.9rem; margin-top:20px;">— ${escapeHtml(data.sender)}</div>
        </div>

        <div class="player-stage">
            <div class="vinyl-disc" id="disc">
                <div class="vinyl-label">CLASSIC<br>GOLD</div>
                <div class="vinyl-hole"></div>
            </div>
            
            <div class="tonearm" id="arm">
                <div class="tonearm-base"></div>
                <div class="tonearm-rod"></div>
                <div class="tonearm-head"></div>
            </div>
            
            <div class="hint" id="hint">แตะเพื่อเล่น</div>
        </div>
    `;

    const disc = document.getElementById('disc');
    const arm = document.getElementById('arm');
    let isPlaying = false;
    let discAnim;

    disc.addEventListener('click', () => {
        if(isPlaying) return;
        isPlaying = true;
        document.getElementById('hint').style.display = 'none';

        // 1. Move tonearm
        gsap.to(arm, { rotation: 15, duration: 1, ease: "power2.inOut", onComplete: () => {
            // 2. Start spinning disc
            discAnim = gsap.to(disc, { rotation: 360, duration: 2, repeat: -1, ease: "none" });
            
            // 3. Float up message panel
            const msg = document.getElementById('msg');
            gsap.to(msg, { y: 150, opacity: 1, duration: 2, ease: "power2.out", onComplete: () => msg.style.pointerEvents='auto' });
            
            // 4. Emit music notes
            emitNotes();
        }});
    });

    function emitNotes() {
        const symbols = ['♪', '♫', '♬', '♩'];
        setInterval(() => {
            if(!isPlaying) return;
            let note = document.createElement('div');
            note.className = 'note';
            note.innerText = symbols[Math.floor(Math.random()*symbols.length)];
            note.style.left = `calc(50% + ${(Math.random()-0.5)*150}px)`;
            note.style.bottom = `45%`;
            container.appendChild(note);

            gsap.to(note, {
                y: - (200 + Math.random()*150),
                x: (Math.random()-0.5)*100,
                rotation: (Math.random()-0.5)*90,
                opacity: 0.8,
                duration: 2 + Math.random()*2,
                ease: "power1.out",
                onComplete: () => note.remove()
            });
        }, 600);
    }
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
