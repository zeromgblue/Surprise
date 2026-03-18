export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#000"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
            
            .matrix-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #000;
            }

            canvas#matrixBg {
                position: absolute; inset: 0; z-index: 1; opacity: 0.8;
            }

            .terminal {
                position: absolute; z-index: 10; width: 90%; max-width: 800px;
                padding: 30px; font-family: 'Share Tech Mono', monospace; font-size: 1.5rem;
                color: #22c55e; text-shadow: 0 0 10px #22c55e;
            }

            .hint-btn {
                position: absolute; z-index: 20; color: #000; background: #22c55e;
                font-family: 'Share Tech Mono', monospace; font-size: 1.2rem;
                padding: 15px 30px; cursor: pointer; border: 2px solid #22c55e;
                box-shadow: 0 0 15px #22c55e; transition: all 0.2s;
            }
            .hint-btn:hover { background: #000; color: #22c55e; }

            .cursor { display: inline-block; width: 12px; height: 1.2em; background: #22c55e; vertical-align: bottom; animation: blink 1s step-end infinite; }
            @keyframes blink { 50% { opacity: 0; } }

        </style>

        <div class="matrix-scene">
            <canvas id="matrixBg"></canvas>

            <div class="hint-btn" id="startBtn">WAKE UP</div>

            <div class="terminal" id="terminal" style="display:none;"></div>
        </div>
    `;

    const startBtn = document.getElementById('startBtn');
    const terminal = document.getElementById('terminal');
    const canvas = document.getElementById('matrixBg');
    const ctx = canvas.getContext('2d');

    // 1. Matrix Rain Background
    function initMatrix() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()'.split('');
        const fontSize = 16;
        const columns = canvas.width / fontSize;
        const drops = [];
        for(let x = 0; x < columns; x++) drops[x] = 1; 

        function drawRain() {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#0f0';
            ctx.font = fontSize + 'px monospace';
            
            for(let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if(drops[i] * fontSize > canvas.height && Math.random() > 0.975)
                    drops[i] = 0;
                drops[i]++;
            }
        }
        setInterval(drawRain, 33);
    }
    initMatrix();

    // 2. Typewriter Effect Logic
    window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });

    const lines = [
        `Wake up, ${escapeHtml(data.receiver)}...`,
        "The simulation has a message for you.",
        "Decrypting payload...",
        "------------------------------------",
        ...escapeHtml(data.message).split('\n'),
        "------------------------------------",
        `Transmission end. Follow the white rabbit.`,
        `- ${escapeHtml(data.sender)}`
    ];

    startBtn.addEventListener('click', () => {
        startBtn.style.display = 'none';
        terminal.style.display = 'block';
        
        // Fast blur matrix background to focus on text
        gsap.to(canvas, { opacity: 0.3, duration: 2 });

        let currentLine = 0;
        let currentChar = 0;
        let textHTML = "";

        function typeLine() {
            if (currentLine >= lines.length) {
                terminal.innerHTML = textHTML + '<span class="cursor"></span>';
                return;
            }

            if (currentChar === 0) {
                // Remove cursor from previous line
                textHTML = textHTML.replace('<span class="cursor"></span>', '');
            }

            if (currentChar < lines[currentLine].length) {
                textHTML += lines[currentLine].charAt(currentChar);
                terminal.innerHTML = textHTML + '<span class="cursor"></span>';
                currentChar++;
                setTimeout(typeLine, Math.random() * 50 + 20); // typing speed var
            } else {
                textHTML += "<br><br>";
                terminal.innerHTML = textHTML + '<span class="cursor"></span>';
                currentLine++;
                currentChar = 0;
                setTimeout(typeLine, currentLine === 3 || currentLine === lines.length-2 ? 1000 : 300); // pause between logical blocks
            }
        }

        setTimeout(typeLine, 1000);
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
