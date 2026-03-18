export async function render(container, data, config) {
    container.style.maxWidth = "100%";
    container.style.padding = "0";
    container.style.height = "100vh";
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.background = "#2C1810"; // Dark library
    document.body.style.margin = "0";
    document.body.style.overflow = "hidden";

    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js');

    container.innerHTML = `
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Uncial+Antiqua&family=Tangerine:wght@700&display=swap');
            
            .library-scene {
                position: relative; width: 100vw; height: 100vh;
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                overflow: hidden; background: radial-gradient(circle, #4A3020, #1A0D08);
                perspective: 1500px;
            }

            .hint { position: absolute; top: 10vh; color: #e7e5e4; font-family: 'Uncial Antiqua', cursive; font-size: 1.5rem; letter-spacing: 2px; z-index: 50; animation: pulse 2s infinite; pointer-events:none;}
            @keyframes pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }

            /* Flying Pages BG */
            .page-bg { position: absolute; width: 60px; height: 80px; background: #e7e5e4; opacity: 0.1; transform: rotate(15deg); border-radius: 2px;}

            /* 3D Book */
            .book-wrapper {
                position: relative; width: 300px; height: 400px; transform-style: preserve-3d;
                cursor: pointer; z-index: 20; transform: rotateX(25deg) rotateY(-15deg); transition: 0.5s;
            }

            /* Pages inside the book */
            .book-pages {
                position: absolute; width: 280px; height: 380px; background: #fef08a; /* Old paper */
                top: 10px; left: 15px; transform: translateZ(-10px); z-index: 10;
                box-shadow: inset 0 0 50px rgba(0,0,0,0.5), -5px 5px 10px rgba(0,0,0,0.5);
                display: flex; flex-direction: column; padding: 30px; box-sizing: border-box;
            }

            /* Cover (Front) */
            .book-cover {
                position: absolute; width: 300px; height: 400px; background: url('https://www.transparenttextures.com/patterns/leather.png') #451a03;
                transform-origin: left center; transform: translateZ(5px); z-index: 25;
                border-radius: 0 10px 10px 0; border: 2px solid #78350f;
                box-shadow: inset -5px 0 20px rgba(0,0,0,0.8), 10px 10px 30px rgba(0,0,0,0.7);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                backface-visibility: hidden;
            }
            .cover-ornament { width: 80%; height: 90%; border: 4px double #b45309; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: 'Uncial Antiqua', cursive; font-size: 3rem; color: #fcd34d; text-align: center; text-shadow: 0 2px 5px #000;}

            /* Cover Backface (Inside of cover) */
            .book-cover-back {
                position: absolute; width: 300px; height: 400px; background: url('https://www.transparenttextures.com/patterns/cream-paper.png') #fef08a;
                transform-origin: left center; transform: translateZ(4px) rotateY(180deg); z-index: 24;
                border-radius: 10px 0 0 10px; box-shadow: inset 10px 0 20px rgba(0,0,0,0.5);
                backface-visibility: hidden;
            }

            /* Spine */
            .book-spine {
                position: absolute; width: 40px; height: 400px; background: url('https://www.transparenttextures.com/patterns/leather.png') #290f01;
                transform-origin: left center; transform: rotateY(-90deg) translateZ(0) translateX(-40px);
                border-radius: 5px 0 0 5px; box-shadow: inset 0 0 10px #000;
            }

            /* Text on old paper */
            .p-head { font-family: 'Tangerine', cursive; font-size: 4rem; color: #78350f; margin-bottom: 20px; text-shadow: 0 1px 1px #fff; opacity: 0; }
            .p-body { font-family: 'Uncial Antiqua', cursive; font-size: 1.2rem; color: #451a03; line-height: 1.6; opacity: 0; }
            .p-foot { font-family: 'Tangerine', cursive; font-size: 2.5rem; color: #92400e; margin-top: auto; text-align: right; opacity: 0; }

        </style>

        <div class="library-scene">
            <div class="hint" id="hint">เปิดตำราเล่มนี้</div>
            
            <!-- Deco pages background -->
            <div class="page-bg" style="top:20%; left:10%;"></div>
            <div class="page-bg" style="bottom:20%; right:15%; transform:rotate(-20deg);"></div>
            <div class="page-bg" style="top:10%; right:20%; transform:rotate(40deg) scale(0.6);"></div>

            <div class="book-wrapper" id="book">
                <div class="book-spine"></div>
                
                <div class="book-pages">
                    <div class="p-head" id="t1">${escapeHtml(data.receiver)}</div>
                    <div class="p-body" id="t2">${escapeHtml(data.message).replace(/\n/g, '<br><br>')}</div>
                    <div class="p-foot" id="t3">${escapeHtml(data.sender)}</div>
                </div>

                <div class="book-cover-back" id="coverBack"></div>
                <div class="book-cover" id="cover">
                    <div class="cover-ornament">Tale<br>Of<br>Us</div>
                </div>
            </div>
        </div>
    `;

    const book = document.getElementById('book');
    const cover = document.getElementById('cover');
    const coverBack = document.getElementById('coverBack');
    const hint = document.getElementById('hint');
    const t1 = document.getElementById('t1');
    const t2 = document.getElementById('t2');
    const t3 = document.getElementById('t3');

    // Float book
    gsap.to(book, { y: -20, duration: 3, yoyo: true, repeat: -1, ease: "sine.inOut" });

    let isOpened = false;

    book.addEventListener('click', () => {
        if(isOpened) return;
        isOpened = true;
        hint.style.display = 'none';

        const tl = gsap.timeline();

        // 1. Move book to center and rotate flat
        tl.to(book, { rotationX: 10, rotationY: 0, scale: 1.3, duration: 1, ease: "power2.inOut" })
          
        // 2. Open Cover
          .to([cover, coverBack], { rotationY: -160, duration: 2, ease: "power3.inOut" })
          
        // 3. Move book slightly to right to center the open spread
          .to(book, { x: 100, duration: 1, ease: "power2.inOut" }, "-=1.5")
          
        // 4. Fade in ink text on page
          .to(t1, { opacity: 1, duration: 1, ease: "power1.in" }, "-=0.5")
          .to(t2, { opacity: 1, duration: 1.5, ease: "power1.in" })
          .to(t3, { opacity: 1, duration: 1, ease: "power1.in" });
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
