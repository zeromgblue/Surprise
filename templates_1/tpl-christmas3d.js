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
            @import url('https://fonts.googleapis.com/css2?family=Mountains+of+Christmas:wght@700&family=Mali:wght@400;600&display=swap');
            
            .xmas-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: linear-gradient(180deg, #1e1b4b, #312e81, #0f172a);
                perspective: 1200px;
            }

            .snow-box { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
            .snowflake { position: absolute; background: #fff; border-radius: 50%; opacity: 0.8; filter: blur(1px); }

            /* 3D Book */
            .book-wrapper {
                position: relative; width: 300px; height: 400px;
                transform-style: preserve-3d; transform: rotateX(20deg);
                z-index: 10; cursor: pointer; transition: 0.3s;
            }
            .book-wrapper:hover { transform: rotateX(20deg) scale(1.05); }

            .book-cover, .book-page, .book-back {
                position: absolute; inset: 0; border-radius: 5px 15px 15px 5px;
                transform-origin: left center; transform-style: preserve-3d;
            }
            
            .book-back { background: #7f1d1d; border-right: 10px solid #f8fafc; transform: translateZ(-20px); box-shadow: 20px 20px 30px rgba(0,0,0,0.8); }
            
            .book-page { background: #fdfbf7; z-index: 2; transform: translateZ(-10px); display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid #e5e7eb;}
            
            .book-cover {
                background: linear-gradient(135deg, #b91c1c, #7f1d1d);
                z-index: 3; display: flex; flex-direction: column; align-items: center; justify-content: center;
                border: 2px solid #facc15; box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
            }
            .cover-title { font-family: 'Mountains of Christmas', cursive; font-size: 3rem; color: #facc15; text-align: center; text-shadow: 2px 2px 5px #450a0a; line-height: 1; margin-bottom: 20px;}
            .cover-bow { width: 150px; height: 50px; background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"><path d="M50 25 Q30 0 10 20 Q30 40 50 25 Q70 0 90 20 Q70 40 50 25 Z" fill="%23facc15"/></svg>') no-repeat center; background-size: contain; filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5));}

            /* Pop-up 3D Tree inside the book */
            .popup-tree {
                position: absolute; bottom: 50px; transition: 1s; opacity: 0; transform-style: preserve-3d;
                transform: rotateX(-90deg); /* Folded flat at first */ transform-origin: bottom center;
            }
            .tree-layer {
                width: 0; height: 0; border-left: 60px solid transparent; border-right: 60px solid transparent;
                border-bottom: 100px solid #166534; position: absolute; bottom: 0; left: -60px;
                filter: drop-shadow(0 10px 10px rgba(0,0,0,0.3));
            }
            .l2 { border-bottom-color: #15803d; bottom: 60px; transform: scale(0.8); }
            .l3 { border-bottom-color: #22c55e; bottom: 110px; transform: scale(0.6); }
            .star { position: absolute; bottom: 190px; left: -15px; width: 30px; height: 30px; background: #facc15; clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%); filter: drop-shadow(0 0 10px #fde047);}

            /* Message on Page */
            .page-msg {
                width: 100%; height: 100%; display: flex; flex-direction: column; padding: 30px;
                box-sizing: border-box; justify-content: flex-start; align-items: center;
                opacity: 0; transform: translateY(-20px);
            }
            .m-head { font-family: 'Mountains of Christmas', cursive; font-size: 2.5rem; color: #b91c1c; margin-bottom: 20px; text-align: center; line-height: 1; font-weight: 700;}
            .m-body { font-family: 'Mali', cursive; font-size: 1.2rem; color: #0f172a; line-height: 1.6; text-align: center; font-weight: 600;}
            .m-foot { font-family: 'Mountains of Christmas', cursive; font-size: 1.5rem; color: #15803d; margin-top: auto; padding-bottom: 20px;}

            .hint-text { position: absolute; bottom: 10vh; color: #facc15; font-family: 'Mali', sans-serif; font-size: 1.2rem; letter-spacing: 2px; animation: pulse 2s infinite; font-weight: 600; z-index: 20; pointer-events: none;}
            @keyframes pulse { 0%,100%{opacity:0.4;} 50%{opacity:1;} }

        </style>

        <div class="xmas-scene" id="scene">
            <div class="snow-box" id="sBox"></div>
            
            <div class="hint-text" id="hint">เปิดนิทานคริสต์มาส</div>

            <div class="book-wrapper" id="book">
                <div class="book-back"></div>
                <div class="book-page">
                    <div class="page-msg" id="msg">
                        <div class="m-head">${escapeHtml(data.receiver)}</div>
                        <div class="m-body">${escapeHtml(data.message).replace(/\n/g, '<br>')}</div>
                        <div class="m-foot">${escapeHtml(data.sender)}</div>
                    </div>
                </div>
                
                <div class="popup-tree" id="tree">
                    <div class="tree-layer"></div>
                    <div class="tree-layer l2"></div>
                    <div class="tree-layer l3"></div>
                    <div class="star"></div>
                </div>

                <div class="book-cover" id="cover">
                    <div class="cover-bow"></div>
                    <div class="cover-title">Merry<br>Christmas</div>
                </div>
            </div>
        </div>
    `;

    const book = document.getElementById('book');
    const cover = document.getElementById('cover');
    const tree = document.getElementById('tree');
    const msg = document.getElementById('msg');
    const hint = document.getElementById('hint');
    const sBox = document.getElementById('sBox');

    // Idle Snow
    for(let i=0; i<50; i++) {
        let s = document.createElement('div');
        s.className = 'snowflake';
        let size = Math.random()*5 + 2;
        s.style.width = size+'px'; s.style.height = size+'px';
        sBox.appendChild(s);
        
        gsap.set(s, { x: Math.random()*window.innerWidth, y: -20 - Math.random()*100 });
        gsap.to(s, {
            y: window.innerHeight + 20,
            x: "+="+(Math.random()-0.5)*100,
            duration: 5 + Math.random()*5,
            repeat: -1, ease: "none", delay: Math.random()*5
        });
    }

    let isOpened = false;

    book.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Zoom into the book and center it flat
        tl.to(book, { rotationX: 0, scale: 1.5, y: 50, duration: 1, ease: "power2.inOut" })
          
        // 2. Open the cover like a door (transform-origin is left)
          .to(cover, { rotationY: -160, duration: 1.5, ease: "power2.inOut" }, "-=0.2")
          
        // 3. Pop-up tree unfolds from flat to upright (within the book page)
          .to(tree, { rotateX: 0, opacity: 1, duration: 1, ease: "back.out(1.5)" }, "-=0.5")
          
        // 4. Reveal text smoothly
          .to(msg, { opacity: 1, y: 0, duration: 1, ease: "power2.out" })
          
        // 5. Ambient glowing
          .to('.star', { filter: "drop-shadow(0 0 20px #facc15) drop-shadow(0 0 40px #fef08a)", duration: 1, repeat: -1, yoyo: true }, "-=1");
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
