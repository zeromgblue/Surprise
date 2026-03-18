export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#1A202C"; // Black cinematic frame
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Noto+Sans+Thai:wght@300;400&display=swap');
            
            .kdrama-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
                overflow: hidden; background: #000;
            }

            /* Cinematic aspect ratio bars 21:9 */
            .cinema-bar { position: absolute; width: 100%; height: 12vh; background: #000; z-index: 50; }
            .bar-top { top: 0; }
            .bar-bottom { bottom: 0; display: flex; align-items: center; justify-content: center;}

            /* Faint romantic background (Snowy night) */
            .backdrop {
                position: absolute; inset: 0;
                background: url('https://images.unsplash.com/photo-1549740425-5e9ed4d8cd34?auto=format&fit=crop&w=1600&q=80') center/cover;
                opacity: 0.6; z-index: 10; filter: blur(3px) brightness(0.6);
            }

            /* Snowfall */
            .snow {
                position: absolute; inset:0; z-index: 15; pointer-events:none;
                background-image: radial-gradient(4px 4px at 100px 50px, #fff, transparent), radial-gradient(6px 6px at 200px 150px, #fff, transparent);
                background-size: 300px 300px; animation: snowFall 10s linear infinite; opacity: 0.5;
            }
            @keyframes snowFall { 100% { background-position: 300px 300px, 600px 600px; } }

            /* Subtitles Area */
            .subtitle-box {
                position: absolute; bottom: 15vh; width: 90%; max-width: 800px;
                text-align: center; z-index: 40;
            }

            .sub-text {
                font-family: 'Gowun Dodum', 'Noto Sans Thai', sans-serif;
                font-size: 2rem; color: #FFF; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
                opacity: 0; margin-bottom: 20px; line-height: 1.5;
            }

            .hint { position: absolute; z-index: 60; color: #FFF; font-family: 'Noto Sans Thai', sans-serif; font-size: 1.2rem; top: 50%; cursor: pointer; animation: pulse 2s infinite; padding: 10px 30px; border: 1px solid #FFF; border-radius: 30px;}
            @keyframes pulse { 0%,100%{opacity:0.6;} 50%{opacity:1;} }

        </style>

        <div class="kdrama-scene">
            <div class="cinema-bar bar-top"></div>
            <div class="backdrop" id="bg"></div>
            <div class="snow"></div>

            <div class="hint" id="playBtn">▶ ดูซีรีส์ตอนพิเศษ</div>

            <div class="subtitle-box" id="subBox">
                <div class="sub-text" id="line1"></div>
            </div>

            <div class="cinema-bar bar-bottom">
                <div style="font-family: 'Noto Sans Thai', sans-serif; color: #718096; font-size:0.8rem;">EP.1: ${escapeHtml(data.receiver)}'s Story</div>
            </div>
        </div>
    `;

    const playBtn = document.getElementById('playBtn');
    const line1 = document.getElementById('line1');
    const bg = document.getElementById('bg');

    // Split message into logical chunks (fake subtitle lines)
    const rawMsg = data.message;
    // Simple split by newline, if none, split by max chars
    let lines = rawMsg.split('\n').filter(l => l.trim()!== '');
    if(lines.length === 1 && rawMsg.length > 50) {
        // Split roughly half if long and no newlines
        const mid = Math.floor(rawMsg.length/2);
        lines = [rawMsg.substring(0, mid) + '...', '...' + rawMsg.substring(mid)];
    }

    // Prepend greeting and append sender to make it feel like a dialog
    const script = [
        `"อันยอง... ${escapeHtml(data.receiver)}..."`,
        ...lines.map(l => `"${escapeHtml(l)}"`),
        `"รักนะ... จาก ${escapeHtml(data.sender)}"`
    ];

    playBtn.addEventListener('click', () => {
        playBtn.style.display = 'none';

        // Slowly clear background blur slightly
        gsap.to(bg, { filter: "blur(1px) brightness(0.8)", duration: 5 });

        const tl = gsap.timeline();

        // Loop through lines
        script.forEach((text, index) => {
            tl.call(() => { line1.innerHTML = text; })
              .to(line1, { opacity: 1, y: -10, duration: 1, ease: "power1.out" }) // Fade in line
              .to(line1, { opacity: 0, y: -20, duration: 1, delay: 2.5 }); // Hold then fade out
        });
        
        // Final End Screen fade out
        tl.to(bg, { opacity: 0, scale: 1.1, duration: 3 }, "+=1")
          .call(() => {
              line1.innerHTML = "끝 (The End)";
              line1.style.color = "#A0AEC0";
              gsap.to(line1, { opacity: 1, y: 0, duration: 2 });
          });
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
