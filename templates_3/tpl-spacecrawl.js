export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#000"; // Deep space
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    // Reusing the starry script or simple CSS stars
    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&display=swap');
            
            .starwars-scene {
                position: relative; width: 100vw; height: 100vh;
                background: #000; overflow: hidden; perspective: 1000px;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
            }

            /* Stars background */
            .stars-bg {
                position: absolute; inset: -50%; width: 200%; height: 200%;
                background: transparent url('https://www.transparenttextures.com/patterns/stardust.png') repeat top center;
                z-index: 1; animation: moveStars 100s linear infinite; opacity: 0.5;
            }
            @keyframes moveStars { 100% { background-position: 1000px 1000px; } }

            .hint { position: absolute; z-index: 100; color: #FFE81F; font-family: 'Oswald', sans-serif; font-size: 2rem; cursor: pointer; animation: pulse 2s infinite; letter-spacing: 2px;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Crawl text container */
            .crawl-container {
                position: absolute; bottom: 0; width: 80%; max-width: 800px;
                height: 100%; transform-origin: 50% 100%;
                transform: rotateX(60deg); z-index: 10;
                display: flex; justify-content: center;
                pointer-events: none; opacity: 0;
            }

            .crawl-text {
                position: absolute; top: 100%;
                color: #FFE81F; font-family: 'Oswald', sans-serif; font-size: 3rem;
                text-align: justify; line-height: 1.5; font-weight: 500;
                /* Animation will be handled by CSS or GSAP */
            }

            /* Intro Logo */
            .intro-logo {
                position: absolute; z-index: 20; color: #FFE81F; font-family: 'Oswald', sans-serif;
                font-size: 6rem; font-weight: bold; text-align: center; opacity: 0;
                transform: scale(2); pointer-events: none;
            }

            .m-head { font-size: 4rem; color: #FFF; text-align: center; margin-bottom: 40px; text-transform: uppercase; }

        </style>

        <div class="starwars-scene">
            <div class="stars-bg"></div>

            <div class="hint" id="startBtn">TAP TO BEGIN EPISODE</div>

            <div class="intro-logo" id="logo">
                EPISODE I<br>THE SURPRISE
            </div>

            <div class="crawl-container" id="board">
                <div class="crawl-text" id="crawl">
                    <div class="m-head">${escapeHtml(data.receiver)}</div>
                    ${escapeHtml(data.message).replace(/\n/g, '<br><br>')}
                    <div style="text-align:center; margin-top:100px; font-size:2rem; color:#A0AEC0;">
                        MAY THE FORCE BE WITH YOU.<br>- ${escapeHtml(data.sender)}
                    </div>
                </div>
            </div>
        </div>
    `;

    const startBtn = document.getElementById('startBtn');
    const logo = document.getElementById('logo');
    const board = document.getElementById('board');
    const crawl = document.getElementById('crawl');

    // Need a robust animation. Since GSAP is better for precise control:
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    startBtn.addEventListener('click', () => {
        startBtn.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Blue text "A long time ago..." (Optional, skipping for brevity, going straight to BOOM)
        
        // 2. Logo BOOM and fade back
        tl.to(logo, { opacity: 1, scale: 1, duration: 0.1 })
          .to(logo, { scale: 0.1, opacity: 0, duration: 5, ease: "power1.in" }, "+=1")
          
        // 3. Start Crawl
          .to(board, { opacity: 1, duration: 1 }, "-=1")
          .to(crawl, { top: "-200%", duration: 45, ease: "none" }); // Slow crawl up
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
