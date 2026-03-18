export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#fff"; 
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Kanit:wght@300;400&display=swap');
            
            .ink-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: #fafafa;
            }

            /* Water texture paper */
            .paper-bg {
                position: absolute; inset: 0; background: url('https://www.transparenttextures.com/patterns/rice-paper.png');
                opacity: 0.8; z-index: 1; pointer-events: none;
            }

            /* Canvas for drawing ink */
            #inkCanvas {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 5;
            }

            /* Brush hint */
            .hint-text { position: absolute; bottom: 15vh; color: #a1a1aa; font-family: 'Kanit', sans-serif; font-size: 1.2rem; letter-spacing: 2px; animation: pulse 2s infinite; font-weight: 300; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Reveal Text Overlay */
            .poetry-msg {
                position: absolute; inset: 0; display: flex; flex-direction: column;
                align-items: center; justify-content: center; z-index: 50; opacity: 0; pointer-events: none;
            }
            .m-head { font-family: 'Abril Fatface', cursive; font-size: 5rem; color: #18181b; margin-bottom: 20px; text-shadow: 2px 2px 10px rgba(0,0,0,0.2); letter-spacing: 2px;}
            .m-body { font-family: 'Kanit', sans-serif; font-size: 1.5rem; color: #27272a; line-height: 1.8; max-width: 600px; text-align: center; font-weight: 400;}
            .m-foot { font-family: 'Abril Fatface', cursive; font-size: 1.5rem; color: #71717a; margin-top: 50px; border-top: 1px solid #d4d4d8; padding-top: 20px;}

            /* SVG Filter for bleeding ink effect */
            .ink-filter { position: absolute; width: 0; height: 0; }
        </style>

        <svg class="ink-filter">
          <defs>
            <filter id="inkBleed">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
              <feBlend in="SourceGraphic" in2="goo" />
            </filter>
          </defs>
        </svg>

        <div class="ink-scene" id="scene">
            <div class="paper-bg"></div>
            
            <!-- Canvas uses CSS filter to make drawn lines look like bleeding ink -->
            <canvas id="inkCanvas" style="filter: url('#inkBleed');"></canvas>
            
            <div class="hint-text" id="hint">ใช้พู่กันระบายหมึกสีดำ (ปาดนิ้ว/เมาส์รัวๆ)</div>

            <div class="poetry-msg" id="msg">
                 <div class="m-head">${escapeHtml(data.receiver)}</div>
                 <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                 <div class="m-foot">ARTIST: ${escapeHtml(data.sender)}</div>
            </div>
        </div>
    `;

    const hint = document.getElementById('hint');
    const msg = document.getElementById('msg');
    const scene = document.getElementById('scene');
    const canvas = document.getElementById('inkCanvas');
    const ctx = canvas.getContext('2d');
    
    // Resize canvas
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    let isDrawing = false;
    let strokesCount = 0;
    let isComplete = false;

    // Drawing logic
    function startDraw(e) { if(isComplete) return; isDrawing = true; draw(e); }
    function  endDraw() { isDrawing = false; ctx.beginPath(); }
    function draw(e) {
        if(!isDrawing || isComplete) return;
        
        let clientX, clientY;
        if(e.touches) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
        else { clientX = e.clientX; clientY = e.clientY; }

        ctx.lineWidth = Math.random() * 20 + 10;
        ctx.lineCap = 'round';
        ctx.strokeStyle = `rgba(0, 0, 0, ${Math.random()*0.5 + 0.5})`; // varying black opacity

        ctx.lineTo(clientX, clientY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(clientX, clientY);

        strokesCount++;
        
        // After enough drawing, reveal message
        if(strokesCount > 150 && !isComplete) {
            isComplete = true;
            revealArt();
        }
    }

    scene.addEventListener('mousedown', startDraw);
    scene.addEventListener('mouseup', endDraw);
    scene.addEventListener('mousemove', draw);
    
    scene.addEventListener('touchstart', startDraw);
    scene.addEventListener('touchend', endDraw);
    scene.addEventListener('touchmove', draw);

    function revealArt() {
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Fade the drawn canvas to act as a background texture
        tl.to(canvas, { opacity: 0.1, duration: 2, ease: "sine.inOut" })
          
        // 2. Bold poetry text fades in
          .to(msg, { opacity: 1, pointerEvents: 'auto', duration: 3, ease: "power2.inOut" }, 1)
          .from('.m-head', { y: 20, opacity: 0, duration: 2, ease: "power2.out" }, 1);
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
