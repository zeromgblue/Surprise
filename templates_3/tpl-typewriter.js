export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#e5e5e5"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
            
            .office-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #e5e5e5, #a3a3a3);
            }

            /* Typewriter Base */
            .typewriter {
                position: absolute; bottom: -5vh; width: 500px; height: 250px;
                background: linear-gradient(180deg, #111, #333); border-radius: 20px 20px 0 0;
                box-shadow: 0 -10px 30px rgba(0,0,0,0.5), inset 0 2px 10px rgba(255,255,255,0.2);
                z-index: 20; display: flex; justify-content: center; padding-top: 20px; box-sizing: border-box;
            }

            /* Keyboard area styling */
            .keyboard {
                width: 80%; height: 100px; background: #222; border-radius: 10px;
                display: flex; flex-wrap: wrap; justify-content: center; padding: 10px; gap: 5px; box-shadow: inset 0 0 10px #000;
            }
            .tw-key { width: 30px; height: 30px; border-radius: 50%; background: #e5e5e5; border: 2px solid #555; box-shadow: 0 3px 0 #888, 0 5px 5px rgba(0,0,0,0.5); }
            .tw-key.active { transform: translateY(3px); box-shadow: 0 0 0 #888, 0 1px 2px rgba(0,0,0,0.5); background: #fca5a5; }

            /* Paper Roller */
            .roller {
                position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
                width: 400px; height: 40px; background: linear-gradient(180deg, #555, #222);
                border-radius: 20px; box-shadow: 0 5px 10px rgba(0,0,0,0.5); z-index: 15;
            }

            /* Paper Sheet */
            .paper {
                position: absolute; bottom: 180px; width: 340px; height: 60vh; max-height: 800px;
                background: url('https://www.transparenttextures.com/patterns/cream-paper.png') #fffce8;
                box-shadow: 0 -5px 15px rgba(0,0,0,0.2); z-index: 10;
                transform: translateY(calc(100% - 20px)); /* Hidden inside typewriter */
                padding: 40px 30px; box-sizing: border-box; overflow: hidden;
                border-radius: 5px 5px 0 0; border: 1px solid #d4d4d8; border-bottom: none;
            }

            /* Typed Text lines */
            .typed-line {
                font-family: 'Special Elite', cursive; font-size: 1.4rem; color: #1f2937;
                line-height: 1.8; margin-bottom: 10px; min-height: 1.8rem;
                border-bottom: 2px solid transparent; display: inline-block; width: 100%; white-space: pre-wrap;
            }
            .cursor { display: inline-block; width: 10px; height: 1.2rem; background: #000; animation: blink 0.8s infinite; vertical-align: bottom; }
            @keyframes blink { 50% { opacity: 0; } }

            .hint-btn {
                position: absolute; top: 20vh; background: #111; color: #FFF; font-family: 'Special Elite', cursive;
                font-size: 1.2rem; padding: 10px 20px; border-radius: 5px; cursor: pointer; z-index: 50;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3); transition: 0.2s; border: 2px solid #555;
            }
            .hint-btn:hover { background: #333; transform: translateY(-2px); }

            @media(max-width: 600px) {
                .typewriter { transform: scale(0.8); bottom: -10vh; }
                .paper { width: 300px; }
            }
        </style>

        <div class="office-scene">
            <div class="hint-btn" id="startBtn">กดเพื่อพิมพ์ข้อความ (Press to Type)</div>

            <div class="paper" id="paper">
                <div id="textContainer"></div>
                <div class="cursor" id="cursor"></div>
            </div>

            <div class="roller"></div>
            <div class="typewriter">
                <div class="keyboard" id="keysBox">
                    <!-- generate some dummy keys -->
                    ${Array(30).fill(0).map(()=>`<div class="tw-key"></div>`).join('')}
                </div>
            </div>
        </div>
    `;

    const startBtn = document.getElementById('startBtn');
    const paper = document.getElementById('paper');
    const textContainer = document.getElementById('textContainer');
    const cursor = document.getElementById('cursor');
    const keys = document.querySelectorAll('.tw-key');

    const fullMessage = `${data.receiver},\n\n${data.message}\n\nYours,\n${data.sender}`;
    const lines = fullMessage.split('\n');

    startBtn.addEventListener('click', () => {
        startBtn.style.display = 'none';

        let currentLine = 0;
        let currentChar = 0;
        let lineDiv = document.createElement('div');
        lineDiv.className = 'typed-line';
        textContainer.appendChild(lineDiv);

        // Slide paper up slightly at start
        gsap.to(paper, { y: "+=50", duration: 1, ease: "power2.out" });

        function typeNext() {
            if (currentLine >= lines.length) {
                cursor.style.display = 'none';
                // Final reveal float up
                gsap.to(paper, { y: 0, duration: 2, ease: "power2.out", delay: 1 });
                return;
            }

            if (currentChar < lines[currentLine].length) {
                let char = lines[currentLine].charAt(currentChar);
                lineDiv.innerHTML += char === ' ' ? '&nbsp;' : escapeHtml(char);
                currentChar++;
                
                // Key click effect
                let randKey = keys[Math.floor(Math.random() * keys.length)];
                randKey.classList.add('active');
                setTimeout(()=>randKey.classList.remove('active'), 50);

                // Small jitter on paper to simulate hit
                gsap.fromTo(paper, { scale: 0.998 }, { scale: 1, duration: 0.05 });

                setTimeout(typeNext, Math.random() * 50 + 50);
            } else {
                // Return carriage
                currentLine++;
                currentChar = 0;
                lineDiv = document.createElement('div');
                lineDiv.className = 'typed-line';
                textContainer.appendChild(lineDiv);
                
                // Move paper up
                gsap.to(paper, { y: "-=40", duration: 0.3 });

                setTimeout(typeNext, 500);
            }
        }

        setTimeout(typeNext, 1000);
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
