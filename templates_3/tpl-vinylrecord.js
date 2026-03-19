export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#fff7ed"; // warm creamy bg
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Inter:wght@300;400&display=swap');
            
            .retro-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #fff7ed, #fed7aa);
            }

            /* Record Player Base */
            .turntable {
                position: relative; width: 400px; height: 300px; background: #78350f;
                border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 5px 15px rgba(255,255,255,0.2);
                border: 4px solid #451a03; display: flex; align-items: center; justify-content: center;
                transform: rotateX(45deg) rotateZ(15deg); transform-style: preserve-3d; transition: 0.5s; cursor: pointer;
                z-index: 10;
            }

            /* Platter */
            .platter {
                position: absolute; left: 30px; width: 240px; height: 240px; background: #333;
                border-radius: 50%; box-shadow: 5px 5px 15px rgba(0,0,0,0.5), inset 0 0 10px #000;
                display: flex; align-items: center; justify-content: center; border: 2px solid #555;
            }

            /* Vinyl Record */
            .record {
                width: 230px; height: 230px; background: linear-gradient(135deg, #111, #222, #111);
                border-radius: 50%; display: flex; align-items: center; justify-content: center;
                border: 2px solid #000; box-shadow: 0 0 10px rgba(0,0,0,0.8);
                background-image: repeating-radial-gradient(#111, #111 2px, #1a1a1a 3px, #1a1a1a 4px);
            }
            .r-label {
                width: 80px; height: 80px; background: #fca5a5; border-radius: 50%;
                display: flex; align-items: center; justify-content: center; color: #7f1d1d;
                font-family: 'Abril Fatface', cursive; font-size: 0.8rem; text-align: center; line-height: 1; border: 2px solid #ef4444;
            }
            .r-hole { position: absolute; width: 10px; height: 10px; background: #fff7ed; border-radius: 50%; box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);}

            /* Tonearm */
            .tonearm {
                position: absolute; right: 40px; top: 40px; width: 20px; height: 150px;
                background: #d4d4d8; border-radius: 10px; transform-origin: top center;
                transform: rotate(-30deg); box-shadow: 5px 5px 10px rgba(0,0,0,0.4);
                display: flex; flex-direction: column; align-items: center;
            }
            .ta-base { position: absolute; top: -15px; width: 40px; height: 40px; background: #71717a; border-radius: 50%; box-shadow: inset 0 2px 5px rgba(255,255,255,0.5); }
            .ta-head { position: absolute; bottom: -20px; width: 30px; height: 40px; background: #3f3f46; transform: rotate(15deg); border-radius: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.5);}

            .hint-text { position: absolute; top: 10vh; color: #9a3412; font-family: 'Inter', sans-serif; font-size: 1.5rem; letter-spacing: 2px; animation: bounce 2s infinite; font-weight: 700; z-index: 50;}
            @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }

            /* Music Notes */
            .music-note {
                position: absolute; font-size: 2rem; color: #ef4444; opacity: 0; pointer-events: none; z-index: 15;
                text-shadow: 2px 2px 5px rgba(0,0,0,0.2);
            }

            /* Main Text Overlay */
            .lyrics-msg {
                position: absolute; inset: 0; padding: 40px; display: flex; flex-direction: column;
                align-items: center; justify-content: center; opacity: 0; pointer-events: none; z-index: 40;
                background: rgba(255, 247, 237, 0.9); backdrop-filter: blur(5px);
            }
            .m-head { font-family: 'Abril Fatface', cursive; font-size: 4rem; color: #9f1239; margin-bottom: 20px; text-shadow: 2px 2px 0px #fda4af;}
            .m-body { font-family: 'Inter', sans-serif; font-size: 1.6rem; color: #4c0519; line-height: 1.8; max-width: 700px; text-align: center; }
            .m-foot { font-family: 'Inter', sans-serif; font-size: 1.2rem; color: #be123c; margin-top: 40px; font-weight: 700; text-transform: uppercase;}

        </style>

        <div class="retro-scene">
            <div class="hint-text" id="hint">เปิดแผ่นเสียง (แตะเครื่องเล่น)</div>

            <div class="turntable" id="player">
                <div class="platter">
                    <div class="record" id="record">
                        <div class="r-label">OUR<br>SONG</div>
                        <div class="r-hole"></div>
                    </div>
                </div>
                <div class="tonearm" id="tonearm">
                    <div class="ta-base"></div>
                    <div class="ta-head"></div>
                </div>
            </div>

            <div class="lyrics-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">"${escapeHtml(data.message).replace(/\n/g, '<br>')}"</div>
                 <div class="m-foot">TRACK BY: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const player = document.getElementById('player');
    const tonearm = document.getElementById('tonearm');
    const record = document.getElementById('record');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const scene = document.querySelector('.retro-scene');

    let isPlaying = false;

    player.addEventListener('click', () => {
        if(isPlaying) return;
        isPlaying = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Zoom and flatten perspective slightly
        tl.to(player, { scale: 1.2, rotationX: 20, rotationZ: 0, duration: 1.5, ease: "power2.inOut" })
          
        // 2. Move Tonearm to record
          .to(tonearm, { rotation: 10, duration: 1, ease: "power1.inOut" })
          
        // 3. Record starts spinning
          .to(record, { rotation: 360, duration: 2, repeat: -1, ease: "none" }, "-=0.2")
          
        // 4. Eject music notes
          .call(() => setInterval(spawnNote, 400))
          
        // 5. Lyrics overlay fades in slowly
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 2, delay: 1 });
    });

    const notes = ['♪', '♫', '♬'];
    function spawnNote() {
        let note = document.createElement('div');
        note.className = 'music-note';
        note.innerText = notes[Math.floor(Math.random()*notes.length)];
        scene.appendChild(note);
        
        let cx = window.innerWidth / 2 - 50;
        let cy = window.innerHeight / 2;

        gsap.set(note, { x: cx, y: cy, scale: 0.5 });
        gsap.to(note, {
            x: cx + (Math.random()-0.5)*400,
            y: cy - 200 - Math.random()*200,
            scale: 2 + Math.random(),
            opacity: 1,
            rotation: (Math.random()-0.5)*90,
            duration: 2 + Math.random()*2,
            ease: "power1.out",
            onComplete: () => {
                gsap.to(note, { opacity: 0, duration: 0.5, onComplete: ()=>note.remove() });
            }
        });
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
