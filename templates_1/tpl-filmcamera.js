export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#fff"; // Light wall
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Quicksand:wght@500;700&display=swap');
            
            .polaroids-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: url('https://www.transparenttextures.com/patterns/wood-pattern.png') #f1f5f9;
            }

            .hint { position: absolute; top: 10vh; font-family: 'Quicksand', sans-serif; font-size: 1.5rem; color: #475569; letter-spacing: 2px; z-index: 10; font-weight: 700; animation: bounce 2s infinite;}
            @keyframes bounce { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }

            /* Focus Frame */
            .viewfinder {
                position: absolute; inset: 0; pointer-events: none; z-index: 50;
                display: flex; align-items: center; justify-content: center; opacity: 0.2;
            }
            .v-corner { width: 50px; height: 50px; position: absolute; border: 4px solid #000; }
            .v-tl { top: 10vh; left: 10vw; border-right: none; border-bottom: none; }
            .v-tr { top: 10vh; right: 10vw; border-left: none; border-bottom: none; }
            .v-bl { bottom: 10vh; left: 10vw; border-right: none; border-top: none; }
            .v-br { bottom: 10vh; right: 10vw; border-left: none; border-top: none; }
            .v-center { width: 20px; height: 2px; background: #000; position: absolute; }
            .v-center::after { content:''; width: 2px; height: 20px; background: #000; position: absolute; top: -9px; left: 9px; }

            /* Camera Button */
            .shutter-btn {
                position: absolute; bottom: 10vh; width: 80px; height: 80px;
                border-radius: 50%; background: #EF4444; border: 6px solid #FFF;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3); z-index: 30; cursor: pointer;
                display: flex; align-items: center; justify-content: center; transition: 0.1s;
            }
            .shutter-btn:active { transform: scale(0.9); background: #DC2626; box-shadow: inset 0 5px 10px rgba(0,0,0,0.3); }

            /* Photo Frame that develops */
            .polaroid {
                position: absolute; width: 320px; height: 400px; background: #FFF;
                padding: 15px 15px 60px 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                z-index: 40; transform: translateY(100vh) scale(0.5); /* initially hidden off screen */
                display: flex; flex-direction: column; align-items: center;
                border-radius: 2px;
            }
            .p-pic {
                width: 100%; height: 280px; background: #111; /* dark before develop */
                position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; text-align: center; padding: 20px; box-sizing: border-box;
            }
            .p-msg {
                font-family: 'Quicksand', sans-serif; font-size: 1.2rem; color: #FFF; line-height: 1.5; opacity: 0; /* hidden before develop */
            }
            .p-text {
                font-family: 'Caveat', cursive; font-size: 2rem; color: #1E293B; margin-top: 20px; opacity: 0; /* hidden before develop */
            }

            /* Flash overlay */
            .flash { position: absolute; inset: 0; background: #FFF; opacity: 0; pointer-events: none; z-index: 100; }

        </style>

        <div class="polaroids-scene">
            <div class="hint" id="hint">SNAP A PHOTO</div>

            <!-- Viewfinder UI -->
            <div class="viewfinder" id="vf">
                <div class="v-corner v-tl"></div><div class="v-corner v-tr"></div>
                <div class="v-corner v-bl"></div><div class="v-corner v-br"></div>
                <div class="v-center"></div>
            </div>

            <div class="shutter-btn" id="shutterBtn"></div>

            <div class="polaroid" id="photo">
                <div class="p-pic" id="picBg">
                    <div class="p-msg" id="picMsg">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                </div>
                <div class="p-text" id="picText">For ${escapeHtml(data.receiver)} ❤️</div>
            </div>

            <div class="flash" id="flash"></div>
        </div>
    `;

    const shutterBtn = document.getElementById('shutterBtn');
    const flash = document.getElementById('flash');
    const photo = document.getElementById('photo');
    const picBg = document.getElementById('picBg');
    const picMsg = document.getElementById('picMsg');
    const picText = document.getElementById('picText');
    const vf = document.getElementById('vf');
    const hint = document.getElementById('hint');

    let taken = false;

    shutterBtn.addEventListener('click', () => {
        if(taken) return;
        taken = true;
        
        const tl = gsap.timeline();

        // 1. Shutter sound/flash
        tl.to(flash, { opacity: 1, duration: 0.1 })
          .call(() => {
              shutterBtn.style.display = 'none';
              vf.style.display = 'none';
              hint.innerText = "กำลังอัดรูป... (Developing)";
          })
          .to(flash, { opacity: 0, duration: 0.5 })
          
        // 2. Photo slides up from bottom
          .to(photo, { y: 0, scale: 1, rotation: (Math.random()-0.5)*15, duration: 1, ease: "power2.out" })
          
        // 3. Develop picture (gradient mask animation or fade)
          .to(picBg, { backgroundColor: '#3B82F6', duration: 4, ease: "none" }, "+=0.5") // BG turns blueish
          .to(picMsg, { opacity: 1, duration: 2 }, "-=2") // Text appears
          .to(picText, { opacity: 1, duration: 1 })
          .call(() => hint.style.display = 'none');
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
