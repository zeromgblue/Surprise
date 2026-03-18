export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#0A0100"; // Dark mystic red/black
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Uncial+Antiqua&family=Tangerine:wght@700&display=swap');
            
            .seal-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden; perspective: 1000px;
            }

            /* Mystic Runes Seal */
            .seal-container {
                position: relative; width: 400px; height: 400px;
                display: flex; align-items: center; justify-content: center;
                cursor: pointer; z-index: 10;
            }

            .ring {
                position: absolute; border-radius: 50%;
                border: 2px solid transparent; display: flex; align-items: center; justify-content: center;
                font-family: 'Uncial Antiqua', cursive; color: #FF3300; font-size: 1.2rem;
                text-shadow: 0 0 10px #FF0000;
            }
            
            .ring-1 { width: 100%; height: 100%; border-top-color: #FF3300; border-bottom-color: #FF8800; animation: spin 20s linear infinite; }
            .ring-2 { width: 80%; height: 80%; border-left-color: #FF0000; border-right-color: #FF3300; border-style: dashed; animation: spin 15s linear infinite reverse; }
            .ring-3 { width: 60%; height: 60%; border-top-color: #FFF; border-bottom-color: #FF8800; border-width: 4px; animation: spin 10s ease-in-out infinite alternate; }
            
            /* Center lock */
            .lock-core {
                position: absolute; width: 60px; height: 60px;
                background: #FF0000; border-radius: 50%;
                box-shadow: 0 0 30px #FF0000, inset 0 0 20px #FFF;
                display:flex; align-items:center; justify-content:center;
                z-index: 5;
            }
            .lock-core .material-symbols-rounded { color: #FFF; font-size: 30px; }

            @keyframes spin { 100% {transform: rotate(360deg);} }

            .hint { position: absolute; bottom: 10%; color:#FF8800; font-family:'Uncial Antiqua', serif; letter-spacing: 2px; text-shadow:0 0 10px #FF0000; pointer-events:none;}

            /* Message hidden behind seal */
            .seal-msg {
                position: absolute; inset:0; z-index: 20; padding: 40px; text-align: center;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; pointer-events: none; transform: scale(0.8);
            }

            .m-head { font-family: 'Uncial Antiqua', serif; font-size: 3rem; color: #FFD700; text-shadow: 0 0 20px #FF0000, 2px 2px 0px #000; margin-bottom: 20px;}
            .m-body { font-family: 'Tangerine', cursive; font-size: 3.5rem; color: #FFF; line-height: 1.2; text-shadow: 2px 2px 5px #000, 0 0 10px #FF3300; }
            
        </style>

        <div class="seal-scene">
            <div class="hint" id="hint">ปลดผนึกโบราณ</div>

            <div class="seal-container" id="seal">
                <div class="ring ring-1">ᚠ ᚢ ᚦ ᚨ ᚱ ᚲ ᚷ ᚹ</div>
                <div class="ring ring-2"></div>
                <div class="ring ring-3"></div>
                <div class="lock-core" id="lock"><span class="material-symbols-rounded">lock</span></div>
            </div>

            <div class="seal-msg" id="msg">
                <div class="m-head">${escapeHtml(data.receiver)}</div>
                <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                <div class="m-head" style="font-size:1.5rem; margin-top:30px; color:#FF8800;">- ผนึกโดย: ${escapeHtml(data.sender)} -</div>
            </div>
        </div>
    `;

    const seal = document.getElementById('seal');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const lock = document.getElementById('lock');
    let broken = false;

    seal.addEventListener('click', () => {
        if(broken) return;
        broken = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Lock unlocks
        lock.innerHTML = '<span class="material-symbols-rounded">lock_open_right</span>';
        
        // 2. Rings speed up and expand wildly
        document.querySelectorAll('.ring').forEach((r, i) => {
            r.style.animationIterationCount = "1"; // stop infinite
            tl.to(r, { rotation: "+=720", scale: 3, opacity: 0, duration: 1.5, ease: "power2.in" }, 0.2 + i*0.1);
        });

        // 3. Core explodes
        tl.to(lock, { scale: 10, opacity: 0, duration: 1, ease: "power2.in" }, 0.5)
          .call(() => {
              seal.style.display = 'none';
              // Shake screen
              gsap.to('body', {x:10, y:10, duration:0.05, yoyo:true, repeat:10});
          })
          
        // 4. Message revealed from the shattered seal
          .to(msg, { opacity: 1, scale: 1, duration: 1.5, ease:"back.out(1.2)", pointerEvents:'auto' }, "+=0.2");
          
          gsap.to('.seal-scene', { background: 'radial-gradient(circle, #330000, #0A0100)', duration: 2 });
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
